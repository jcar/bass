#!/usr/bin/env python3
"""Backfill empty `when` conditions in _merged-review.json using Claude.

For each tip/color rule with `when: {}`, sends the text to Claude to extract
any implied conditions. Results go to a sidecar `_condition-backfill.json`
for human review before applying to the actual merged data.

Usage:
    # Single angler
    python3 scripts/backfill-conditions.py yamamoto

    # All anglers
    python3 scripts/backfill-conditions.py --all

    # Dry run (count empties, don't call API)
    python3 scripts/backfill-conditions.py yamamoto --dry-run

    # Use a different model
    python3 scripts/backfill-conditions.py yamamoto --model claude-sonnet-4-20250514

Requires ANTHROPIC_API_KEY environment variable.
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)

SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
EXTRACTED_DIR = KNOWLEDGE_DIR / "data" / "extracted"

SYSTEM_PROMPT = """You are extracting fishing conditions from tip/color text into structured ConditionPredicate fields.

Valid fields and their types:
- season: array of "pre-spawn" | "spawn" | "post-spawn" | "summer" | "fall" | "winter"
- waterTemp: { min?: number, max?: number } (°F)
- waterClarity: array of "clear" | "stained" | "muddy"
- skyCondition: array of "clear" | "partly-cloudy" | "overcast" | "rain"
- frontalSystem: array of "pre-frontal" | "post-frontal" | "stable" | "cold-front"
- pressureTrend: array of "rising" | "falling" | "steady"
- windSpeed: { min?: number, max?: number } (mph)
- fishDepth: { min?: number, max?: number } (ft)
- timeOfDay: array of "dawn" | "morning" | "midday" | "afternoon" | "dusk"
- isLowLight: boolean
- isStained: boolean

Rules:
- Only extract conditions EXPLICITLY stated or strongly implied by the text
- "shallow" or "shallow water" → fishDepth: { max: 8 }
- "deep" or "deep water" → fishDepth: { min: 15 }
- "clear water" or "gin-clear" → waterClarity: ["clear"]
- "dirty water" or "muddy water" → waterClarity: ["muddy"]
- "stained water" → waterClarity: ["stained"]
- "spring" → season: ["pre-spawn"]. "late spring" → season: ["spawn", "post-spawn"]
- "summer" → season: ["summer"]. "fall" or "autumn" → season: ["fall"]
- "winter" or "cold water" (below ~50°F) → season: ["winter"]
- "morning" or "early" → timeOfDay: ["dawn", "morning"]
- "low light" or "overcast" → isLowLight: true
- "rain" or "rainy" → skyCondition: ["rain"]
- "post-frontal" or "after a front" → frontalSystem: ["post-frontal"]
- If the tip is pure technique/rigging advice with NO conditions, return empty {}
- Do NOT infer conditions that aren't in the text. "Use a 3/0 hook" has no conditions.
- Return ONLY valid JSON: { "when": {...}, "confidence": 0.0-1.0, "reasoning": "..." }
- confidence: 0.9+ for explicit mentions, 0.6-0.8 for strong implications, <0.5 for weak guesses"""

FEW_SHOT_EXAMPLES = [
    {
        "role": "user",
        "content": 'Extract conditions from this tip:\nLure: Squarebill Crankbait\nType: tip\nText: "KVD: \'Fall reservoir creek arms — line up with the creek channel edge and fire long casts ahead of the boat. Use the squarebill for surveillance, running down edges, hitting bottom, stumps, laydowns, docks.\'"'
    },
    {
        "role": "assistant",
        "content": '{"when": {"season": ["fall"]}, "confidence": 0.95, "reasoning": "Explicitly says \'Fall reservoir creek arms\' — clear seasonal condition."}'
    },
    {
        "role": "user",
        "content": 'Extract conditions from this tip:\nLure: Squarebill Crankbait\nType: tip\nText: "KVD: For the shallow zone in cold water, use a flatside crankbait. Extremely tight action — bass use their lateral line to hunt in cold water and flatsides displace a ton of water."'
    },
    {
        "role": "assistant",
        "content": '{"when": {"season": ["winter", "pre-spawn"], "fishDepth": {"max": 8}}, "confidence": 0.9, "reasoning": "\'shallow zone\' implies max depth ~8ft. \'cold water\' maps to winter/pre-spawn seasons."}'
    },
    {
        "role": "user",
        "content": 'Extract conditions from this tip:\nLure: Ned Rig\nType: tip\nText: "Rig the 3-inch Ika on a 1/32-oz mushroom head jig three ways — as a solid-body tube, nose-hooked, or Tex-posed."'
    },
    {
        "role": "assistant",
        "content": '{"when": {}, "confidence": 0.95, "reasoning": "Pure rigging technique with no seasonal, water, depth, or weather conditions mentioned. Genuinely universal."}'
    },
    {
        "role": "user",
        "content": 'Extract conditions from this color rule:\nLure: Texas Rig (Creature Bait)\nType: color\nText: color "watermelon red flake" — used in clear water around grass'
    },
    {
        "role": "assistant",
        "content": '{"when": {"waterClarity": ["clear"]}, "confidence": 0.9, "reasoning": "Explicitly says \'clear water\' — direct water clarity condition."}'
    },
]


def collect_empty_whens(data: dict) -> list[dict]:
    """Find all rules with empty when clauses in a merged review."""
    empties = []
    for lure_name, opinion in data.get("opinions", {}).items():
        for i, tip in enumerate(opinion.get("tipRules", [])):
            when = tip.get("when", {})
            if not when or len(when) == 0:
                empties.append({
                    "lure": lure_name,
                    "ruleType": "tip",
                    "ruleIndex": i,
                    "text": tip.get("tip", ""),
                    "priority": tip.get("priority", 0),
                })
        for i, color in enumerate(opinion.get("colorRules", [])):
            when = color.get("when", {})
            if not when or len(when) == 0:
                empties.append({
                    "lure": lure_name,
                    "ruleType": "color",
                    "ruleIndex": i,
                    "text": f'color "{color.get("color", "")}" (hex: {color.get("hex", "")})',
                    "priority": color.get("priority", 0),
                })
    return empties


def build_user_message(entry: dict) -> str:
    """Build the user message for a single rule."""
    return (
        f"Extract conditions from this {entry['ruleType']} rule:\n"
        f"Lure: {entry['lure']}\n"
        f"Type: {entry['ruleType']}\n"
        f"Text: {entry['text']}"
    )


def extract_conditions(client: anthropic.Anthropic, entry: dict, model: str) -> dict:
    """Send a single rule to Claude and extract conditions."""
    messages = FEW_SHOT_EXAMPLES + [
        {"role": "user", "content": build_user_message(entry)}
    ]

    response = client.messages.create(
        model=model,
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    raw = response.content[0].text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```\w*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        return {
            "when": {},
            "confidence": 0.0,
            "reasoning": f"PARSE ERROR: {raw[:200]}",
        }

    return {
        "when": result.get("when", {}),
        "confidence": result.get("confidence", 0.5),
        "reasoning": result.get("reasoning", ""),
    }


VALID_WHEN_KEYS = {
    "season", "waterTemp", "waterClarity", "skyCondition",
    "frontalSystem", "pressureTrend", "windSpeed", "fishDepth",
    "timeOfDay", "isLowLight", "isStained",
}

VALID_SEASONS = {"pre-spawn", "spawn", "post-spawn", "summer", "fall", "winter"}
VALID_CLARITIES = {"clear", "stained", "muddy"}
VALID_SKY = {"clear", "partly-cloudy", "overcast", "rain"}
VALID_FRONTAL = {"pre-frontal", "post-frontal", "stable", "cold-front"}
VALID_PRESSURE = {"rising", "falling", "steady"}
VALID_TIMES = {"dawn", "morning", "midday", "afternoon", "dusk"}


def validate_when(when: dict) -> dict:
    """Validate and sanitize a when clause. Returns cleaned version."""
    cleaned = {}
    for key, val in when.items():
        if key not in VALID_WHEN_KEYS:
            continue

        if key == "season" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_SEASONS]
        elif key == "waterClarity" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_CLARITIES]
        elif key == "skyCondition" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_SKY]
        elif key == "frontalSystem" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_FRONTAL]
        elif key == "pressureTrend" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_PRESSURE]
        elif key == "timeOfDay" and isinstance(val, list):
            cleaned[key] = [v for v in val if v in VALID_TIMES]
        elif key in ("waterTemp", "windSpeed", "fishDepth") and isinstance(val, dict):
            range_val = {}
            if "min" in val and isinstance(val["min"], (int, float)):
                range_val["min"] = val["min"]
            if "max" in val and isinstance(val["max"], (int, float)):
                range_val["max"] = val["max"]
            if range_val:
                cleaned[key] = range_val
        elif key in ("isLowLight", "isStained") and isinstance(val, bool):
            cleaned[key] = val

    # Remove empty arrays
    return {k: v for k, v in cleaned.items() if v}


def process_angler(angler_id: str, client: anthropic.Anthropic, model: str,
                   dry_run: bool = False, force: bool = False) -> None:
    """Process a single angler's empty when clauses."""
    merged_path = EXTRACTED_DIR / angler_id / "_merged-review.json"
    sidecar_path = EXTRACTED_DIR / angler_id / "_condition-backfill.json"

    if not merged_path.exists():
        print(f"  No _merged-review.json for {angler_id}, skipping")
        return

    data = json.loads(merged_path.read_text())
    empties = collect_empty_whens(data)

    if not empties:
        print(f"  {angler_id}: no empty when clauses")
        return

    print(f"  {angler_id}: {len(empties)} empty when clauses ({sum(1 for e in empties if e['ruleType'] == 'tip')} tips, {sum(1 for e in empties if e['ruleType'] == 'color')} colors)")

    if dry_run:
        return

    # Load existing sidecar to preserve already-processed entries
    existing = {}
    if sidecar_path.exists() and not force:
        try:
            existing_data = json.loads(sidecar_path.read_text())
            for entry in existing_data.get("suggestions", []):
                key = f"{entry['lure']}|{entry['ruleType']}|{entry['ruleIndex']}"
                existing[key] = entry
        except (json.JSONDecodeError, KeyError):
            pass

    suggestions = []
    skipped = 0
    processed = 0
    errors = 0

    for i, entry in enumerate(empties):
        key = f"{entry['lure']}|{entry['ruleType']}|{entry['ruleIndex']}"

        # Skip if already processed (unless --force)
        if key in existing and not force:
            suggestions.append(existing[key])
            skipped += 1
            continue

        print(f"    [{i+1}/{len(empties)}] {entry['ruleType']} — {entry['lure']}: {entry['text'][:60]}...")

        try:
            result = extract_conditions(client, entry, model)
            validated_when = validate_when(result["when"])

            suggestion = {
                "lure": entry["lure"],
                "ruleType": entry["ruleType"],
                "ruleIndex": entry["ruleIndex"],
                "originalText": entry["text"],
                "priority": entry["priority"],
                "suggestedWhen": validated_when,
                "confidence": result["confidence"],
                "reasoning": result["reasoning"],
                "status": "pending",
            }
            suggestions.append(suggestion)
            processed += 1

            has_conditions = "conditions extracted" if validated_when else "universal (no conditions)"
            print(f"      → {has_conditions} (confidence: {result['confidence']:.2f})")

        except anthropic.APIError as e:
            print(f"      ERROR: {e}", file=sys.stderr)
            errors += 1
            # Keep existing entry if available
            if key in existing:
                suggestions.append(existing[key])
        except KeyboardInterrupt:
            print("\n  Interrupted — saving progress...")
            break

        # Mild rate limiting
        if processed % 10 == 0 and processed > 0:
            time.sleep(0.5)

    # Write sidecar
    sidecar = {
        "anglerId": angler_id,
        "totalEmpty": len(empties),
        "processed": processed + skipped,
        "suggestions": suggestions,
    }
    sidecar_path.write_text(json.dumps(sidecar, indent=2) + "\n")

    with_conditions = sum(1 for s in suggestions if s.get("suggestedWhen"))
    universal = sum(1 for s in suggestions if not s.get("suggestedWhen"))
    print(f"  → Saved {len(suggestions)} suggestions to {sidecar_path.name}")
    print(f"    {with_conditions} with conditions, {universal} universal, {skipped} cached, {errors} errors")


def main():
    parser = argparse.ArgumentParser(description="Backfill empty when conditions using Claude")
    parser.add_argument("angler", nargs="?", help="Angler ID (e.g., yamamoto)")
    parser.add_argument("--all", action="store_true", help="Process all anglers")
    parser.add_argument("--dry-run", action="store_true", help="Count empties without calling API")
    parser.add_argument("--force", action="store_true", help="Re-process even if sidecar exists")
    parser.add_argument("--model", default="claude-sonnet-4-20250514", help="Claude model to use")
    args = parser.parse_args()

    if not args.angler and not args.all:
        parser.print_help()
        sys.exit(1)

    if args.all:
        angler_ids = sorted(
            d.name for d in EXTRACTED_DIR.iterdir()
            if d.is_dir() and (d / "_merged-review.json").exists()
        )
    else:
        angler_ids = [args.angler]

    if not args.dry_run:
        client = anthropic.Anthropic()
    else:
        client = None

    print(f"Backfill conditions for {len(angler_ids)} angler(s)")
    if args.dry_run:
        print("(dry run — no API calls)")
    print()

    for angler_id in angler_ids:
        process_angler(angler_id, client, args.model, args.dry_run, args.force)
        print()

    print("Done.")


if __name__ == "__main__":
    main()
