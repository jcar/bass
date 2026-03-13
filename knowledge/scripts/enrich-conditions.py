#!/usr/bin/env python3
"""Enrich condition tags on knowledge entries using Claude's API.

Reads _merged-review.json files and sends each knowledge entry's insight text
to Claude to extract standardized condition tags, then writes enriched entries
to _merged-review-enriched.json.

Usage:
    # Enrich all anglers
    python3 scripts/enrich-conditions.py --all

    # Enrich single angler
    python3 scripts/enrich-conditions.py --angler wheeler

    # Dry run (show what would be enriched, don't call API)
    python3 scripts/enrich-conditions.py --all --dry-run

    # Use specific model
    python3 scripts/enrich-conditions.py --all --model claude-haiku-4-5-20251001

    # Resume from where we left off (skip already-enriched entries)
    python3 scripts/enrich-conditions.py --all --resume

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

# ─── Resolve project paths ───
SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DATA_DIR = KNOWLEDGE_DIR / "data" / "extracted"

# ─── Default model ───
DEFAULT_MODEL = "claude-sonnet-4-20250514"

# ─── Lure name to category mapping ───
LURE_CATEGORY_MAP = {
    "Squarebill Crankbait": "cranking",
    "Medium Diving Crankbait": "cranking",
    "Deep Diving Crankbait": "cranking",
    "Lipless Crankbait": "cranking",
    "Suspending Jerkbait": "cranking",
    "Drop Shot": "finesse",
    "Ned Rig": "finesse",
    "Neko Rig": "finesse",
    "Shakyhead": "finesse",
    "Spy Bait": "finesse",
    "Flipping Jig": "jigs",
    "Structure Jig": "jigs",
    "Football Jig": "jigs",
    "Hair Jig / Finesse Jig": "jigs",
    "Crawfish Pattern Jig": "jigs",
    "Swim Jig": "moving-baits",
    "Spinnerbait (Colorado/Willow)": "moving-baits",
    "Chatterbait": "moving-baits",
    "Strolling Rig": "moving-baits",
    "Walking Topwater": "topwater",
    "Buzzbait": "topwater",
    "Blade Bait": "reaction",
    "Jigging Spoon": "reaction",
    "Texas Rig (Creature Bait)": "soft-plastics",
    "Carolina Rig": "soft-plastics",
    '10" Worm (Shakey/TX)': "soft-plastics",
}

# ─── Valid condition tag vocabularies ───
VALID_CONDITIONS = {
    "season": ["pre-spawn", "spawn", "post-spawn", "summer", "fall", "winter"],
    "waterClarity": ["clear", "stained", "muddy"],
    "structure": [
        "point", "bluff", "grass", "flat", "dock", "creek-channel",
        "hump", "riprap", "laydown", "ledge",
    ],
    "depthZone": ["shallow", "mid", "deep"],
    "lureCategory": [
        "cranking", "finesse", "jigs", "moving-baits", "topwater",
        "reaction", "soft-plastics",
    ],
    "retrieveStyle": [
        "burn", "slow-roll", "stop-and-go", "drag", "hop", "twitch", "steady",
    ],
    "coverType": ["grass", "wood", "rock", "dock", "open"],
}

SYSTEM_PROMPT = """You are a bass fishing knowledge tagger. Given a fishing insight, extract applicable condition tags. Return ONLY a JSON object. Only include tags that are clearly stated or strongly implied in the text. Omit tags where the text doesn't provide clear evidence.

Valid tag vocabularies:
- season (array): pre-spawn, spawn, post-spawn, summer, fall, winter
- waterClarity (string): clear, stained, muddy
- structure (array): point, bluff, grass, flat, dock, creek-channel, hump, riprap, laydown, ledge
- depthZone (string): shallow (<5ft), mid (5-12ft), deep (12ft+)
- lureCategory (string): cranking, finesse, jigs, moving-baits, topwater, reaction, soft-plastics
- retrieveStyle (string): burn, slow-roll, stop-and-go, drag, hop, twitch, steady
- coverType (string): grass, wood, rock, dock, open

Rules:
1. Return a flat JSON object with only the tags above.
2. season and structure are arrays (can have multiple values). All other fields are single strings.
3. Only include a tag if the insight clearly states or strongly implies it.
4. Do NOT invent or guess — if unclear, omit the tag.
5. Return {} if nothing can be confidently tagged."""


def get_anglers() -> list[str]:
    """List all angler directories that have _merged-review.json."""
    anglers = []
    if not DATA_DIR.is_dir():
        return anglers
    for d in sorted(DATA_DIR.iterdir()):
        if d.is_dir() and (d / "_merged-review.json").exists():
            anglers.append(d.name)
    return anglers


def load_merged_review(angler: str) -> dict:
    """Load an angler's _merged-review.json."""
    path = DATA_DIR / angler / "_merged-review.json"
    if not path.exists():
        print(f"Error: {path} not found", file=sys.stderr)
        sys.exit(1)
    return json.loads(path.read_text())


def load_enriched_review(angler: str) -> dict | None:
    """Load an angler's existing _merged-review-enriched.json if it exists."""
    path = DATA_DIR / angler / "_merged-review-enriched.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


def save_enriched_review(angler: str, data: dict) -> Path:
    """Write enriched review data to _merged-review-enriched.json."""
    path = DATA_DIR / angler / "_merged-review-enriched.json"
    path.write_text(json.dumps(data, indent=2) + "\n")
    return path


def build_user_prompt(insight: str, existing_conditions: dict) -> str:
    """Build the user message for Claude."""
    parts = [f"Insight: {insight}"]
    if existing_conditions:
        parts.append(f"Existing conditions (keep these, add more if applicable): {json.dumps(existing_conditions)}")
    return "\n\n".join(parts)


def call_claude(
    client: anthropic.Anthropic,
    insight: str,
    existing_conditions: dict,
    model: str,
    max_retries: int = 5,
) -> dict:
    """Send insight to Claude and return enriched conditions dict.

    Uses exponential backoff for rate limits.
    """
    user_msg = build_user_prompt(insight, existing_conditions)

    for attempt in range(max_retries):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=512,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_msg}],
            )

            raw = message.content[0].text.strip()

            # Strip markdown fences if present
            if raw.startswith("```"):
                raw = re.sub(r"^```\w*\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw)

            return json.loads(raw)

        except anthropic.RateLimitError:
            wait = min(2 ** attempt * 2, 60)
            print(f"    Rate limited, waiting {wait}s...", file=sys.stderr)
            time.sleep(wait)

        except anthropic.APIError as e:
            if attempt < max_retries - 1:
                wait = min(2 ** attempt * 2, 60)
                print(f"    API error ({e}), retrying in {wait}s...", file=sys.stderr)
                time.sleep(wait)
            else:
                raise

        except json.JSONDecodeError as e:
            print(f"    Invalid JSON from API: {e}", file=sys.stderr)
            print(f"    Raw: {raw[:300]}", file=sys.stderr)
            if attempt < max_retries - 1:
                time.sleep(1)
            else:
                return {}

    return {}


def validate_conditions(conditions: dict) -> dict:
    """Validate and filter conditions to only allowed vocabularies."""
    validated = {}

    for key, valid_values in VALID_CONDITIONS.items():
        if key not in conditions:
            continue
        val = conditions[key]

        # Array fields: season, structure
        if key in ("season", "structure"):
            if isinstance(val, str):
                val = [val]
            if isinstance(val, list):
                filtered = [v for v in val if v in valid_values]
                if filtered:
                    validated[key] = filtered
        # String fields
        else:
            if isinstance(val, list) and len(val) == 1:
                val = val[0]
            if isinstance(val, str) and val in valid_values:
                validated[key] = val

    return validated


def merge_conditions(existing: dict, enriched: dict) -> dict:
    """Merge existing conditions with Claude's enrichment.

    Existing valid tags take precedence. Enriched tags fill in gaps.
    For array fields, union the values.
    """
    merged = {}

    all_keys = set(list(existing.keys()) + list(enriched.keys()))

    for key in all_keys:
        ex_val = existing.get(key)
        en_val = enriched.get(key)

        if key in ("season", "structure"):
            # Union arrays
            ex_list = ex_val if isinstance(ex_val, list) else ([ex_val] if ex_val else [])
            en_list = en_val if isinstance(en_val, list) else ([en_val] if en_val else [])
            combined = list(dict.fromkeys(ex_list + en_list))  # dedupe, preserve order
            if combined:
                merged[key] = combined
        elif ex_val is not None and ex_val != "":
            # Existing scalar takes precedence
            merged[key] = ex_val
        elif en_val is not None and en_val != "":
            merged[key] = en_val

    return merged


def is_entry_enriched(entry: dict) -> bool:
    """Check if a knowledge entry already has enriched conditions."""
    conditions = entry.get("conditions", {})
    # Consider enriched if it has at least one tag from our standard vocabulary
    standard_keys = set(VALID_CONDITIONS.keys())
    return bool(standard_keys & set(conditions.keys()))


def enrich_knowledge_entries(
    client: anthropic.Anthropic | None,
    data: dict,
    angler: str,
    model: str,
    dry_run: bool = False,
    resume: bool = False,
) -> tuple[dict, int, int]:
    """Enrich knowledge entries in a merged review.

    Returns (enriched_data, enriched_count, skipped_count).
    """
    knowledge = data.get("knowledge", [])
    total = len(knowledge)
    enriched_count = 0
    skipped_count = 0

    for i, entry in enumerate(knowledge):
        insight = entry.get("insight", "")
        existing = entry.get("conditions", {})
        category = entry.get("category", "?")
        topic = entry.get("topic", "?")

        label = f"[{i + 1}/{total}] {angler}: {category}/{topic}"

        # Skip if already enriched and resuming
        if resume and is_entry_enriched(entry):
            skipped_count += 1
            continue

        if dry_run:
            has_conditions = "has conditions" if existing else "empty conditions"
            print(f"  {label} ({has_conditions})")
            enriched_count += 1
            continue

        print(f"  {label}")

        enriched_conditions = call_claude(client, insight, existing, model)
        validated = validate_conditions(enriched_conditions)
        merged = merge_conditions(existing, validated)

        if merged != existing:
            entry["conditions"] = merged
            tags = ", ".join(f"{k}={v}" for k, v in merged.items())
            print(f"    -> {tags}")
            enriched_count += 1
        else:
            skipped_count += 1

    return data, enriched_count, skipped_count


def enrich_opinions(data: dict) -> int:
    """Add lureCategory tags to opinion tipRules and colorRules.

    Returns the number of rules enriched.
    """
    opinions = data.get("opinions", {})
    enriched_count = 0

    for lure_name, opinion in opinions.items():
        category = LURE_CATEGORY_MAP.get(lure_name)
        if not category:
            continue

        for rule in opinion.get("tipRules", []):
            if "lureCategory" not in rule:
                rule["lureCategory"] = category
                enriched_count += 1

        for rule in opinion.get("colorRules", []):
            if "lureCategory" not in rule:
                rule["lureCategory"] = category
                enriched_count += 1

        for tip_obj in opinion.get("defaultTips", []):
            if "lureCategory" not in tip_obj:
                tip_obj["lureCategory"] = category
                enriched_count += 1

    return enriched_count


def process_angler(
    client: anthropic.Anthropic | None,
    angler: str,
    model: str,
    dry_run: bool = False,
    resume: bool = False,
) -> None:
    """Process a single angler's merged review."""
    print(f"\n{'=' * 60}")
    print(f"Angler: {angler}")
    print(f"{'=' * 60}")

    data = load_merged_review(angler)
    knowledge_count = len(data.get("knowledge", []))
    opinion_count = len(data.get("opinions", {}))
    print(f"  {knowledge_count} knowledge entries, {opinion_count} opinion lures")

    # If resuming, load existing enriched file and carry forward
    if resume:
        existing_enriched = load_enriched_review(angler)
        if existing_enriched:
            # Use the enriched data as our starting point
            data = existing_enriched
            print(f"  Resuming from existing enriched file")

    # Enrich knowledge entries (requires API)
    data, k_enriched, k_skipped = enrich_knowledge_entries(
        client, data, angler, model, dry_run=dry_run, resume=resume,
    )

    # Enrich opinion rules (local, no API needed)
    o_enriched = enrich_opinions(data)

    print(f"\n  Summary for {angler}:")
    print(f"    Knowledge: {k_enriched} enriched, {k_skipped} skipped")
    print(f"    Opinions: {o_enriched} rules tagged with lureCategory")

    if not dry_run:
        out_path = save_enriched_review(angler, data)
        print(f"    Written to: {out_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Enrich condition tags on knowledge entries using Claude's API",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--all", action="store_true", help="Enrich all anglers")
    group.add_argument("--angler", "-a", help="Enrich a single angler")

    parser.add_argument(
        "--dry-run", action="store_true",
        help="Show what would be enriched without calling the API",
    )
    parser.add_argument(
        "--model", default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--resume", action="store_true",
        help="Skip already-enriched entries (resume interrupted run)",
    )
    args = parser.parse_args()

    # Validate environment
    if not args.dry_run:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("Error: ANTHROPIC_API_KEY environment variable is required", file=sys.stderr)
            sys.exit(1)

    # Determine anglers to process
    if args.all:
        anglers = get_anglers()
        if not anglers:
            print(f"Error: No anglers found in {DATA_DIR}", file=sys.stderr)
            sys.exit(1)
        print(f"Found {len(anglers)} anglers: {', '.join(anglers)}")
    else:
        angler = args.angler.lower()
        review_path = DATA_DIR / angler / "_merged-review.json"
        if not review_path.exists():
            print(f"Error: {review_path} not found", file=sys.stderr)
            available = get_anglers()
            if available:
                print(f"Available anglers: {', '.join(available)}", file=sys.stderr)
            sys.exit(1)
        anglers = [angler]

    # Initialize API client
    client = None
    if not args.dry_run:
        client = anthropic.Anthropic()

    print(f"Model: {args.model}")
    if args.dry_run:
        print("DRY RUN - no API calls will be made")
    if args.resume:
        print("RESUME MODE - skipping already-enriched entries")

    # Count totals
    total_k_entries = 0
    for angler in anglers:
        d = load_merged_review(angler)
        total_k_entries += len(d.get("knowledge", []))
    print(f"Total knowledge entries across all anglers: {total_k_entries}")

    # Process each angler
    try:
        for angler in anglers:
            process_angler(
                client, angler, args.model,
                dry_run=args.dry_run, resume=args.resume,
            )
    except KeyboardInterrupt:
        print("\n\nInterrupted by user. Progress has been saved on a per-angler basis.")
        print("Use --resume to continue from where you left off.")
        sys.exit(130)

    print("\nDone.")


if __name__ == "__main__":
    main()
