#!/usr/bin/env python3
"""Extract structured angler opinions from transcripts using Claude.

Usage:
    # Single transcript
    python3 scripts/extract-opinions.py data/transcripts/kvd/best-baits-to-fish-grassy-lakes.txt --angler kvd

    # All transcripts in a directory
    python3 scripts/extract-opinions.py data/transcripts/kvd/ --angler kvd

    # Merge all extracted JSON into a review file
    python3 scripts/extract-opinions.py --merge data/extracted/kvd/

    # Re-extract (overwrite existing)
    python3 scripts/extract-opinions.py data/transcripts/kvd/ --angler kvd --force

Requires ANTHROPIC_API_KEY environment variable.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)

# ─── Resolve project paths ───
SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
PROJECT_ROOT = KNOWLEDGE_DIR.parent  # bass/

STRIKEZONE_DIR = PROJECT_ROOT / "strikezone" / "src" / "lib"
ANGLERS_DIR = STRIKEZONE_DIR / "anglers"

# ─── Schema files to embed in prompt ───
TYPES_TS = ANGLERS_DIR / "types.ts"
CORE_TYPES_TS = STRIKEZONE_DIR / "types.ts"
BASE_LURES_TS = ANGLERS_DIR / "base-lures.ts"


def load_file(path: Path) -> str:
    """Read a file or exit with error."""
    if not path.exists():
        print(f"Error: {path} not found", file=sys.stderr)
        sys.exit(1)
    return path.read_text()


def extract_lure_names(base_lures_src: str) -> list[str]:
    """Pull lure names from base-lures.ts."""
    return re.findall(r"name:\s*'([^']+)'", base_lures_src)


def extract_enum_values(types_src: str) -> dict[str, list[str]]:
    """Pull enum-like type values from types.ts."""
    enums = {}
    for match in re.finditer(r"export type (\w+)\s*=\s*([^;]+);", types_src):
        name = match.group(1)
        values = re.findall(r"'([^']+)'", match.group(2))
        if values:
            enums[name] = values
    return enums


def load_existing_profile(angler_id: str) -> str:
    """Load existing angler .ts profile if it exists."""
    profile_path = ANGLERS_DIR / f"{angler_id}.ts"
    if profile_path.exists():
        return profile_path.read_text()
    return ""


def build_extraction_prompt(
    transcript_text: str,
    transcript_name: str,
    angler_id: str,
    lure_names: list[str],
    enum_values: dict[str, list[str]],
    angler_types_src: str,
    existing_profile: str,
) -> str:
    """Build the full extraction prompt."""

    lure_list = "\n".join(f"  - {name}" for name in lure_names)
    enum_block = "\n".join(
        f"  {name}: {', '.join(repr(v) for v in vals)}"
        for name, vals in enum_values.items()
    )

    existing_section = ""
    if existing_profile:
        existing_section = f"""
## Existing Profile (already captured — do NOT repeat these)
```typescript
{existing_profile}
```
"""

    return f"""You are an expert bass fishing analyst. Extract structured angler opinion data from the following transcript.

## Type Definitions
```typescript
{angler_types_src}
```

## Valid Lure Names (use EXACTLY these strings for the "lure" field)
{lure_list}

## Valid Enum Values
{enum_block}

## Additional Enums (from StrikeEngine)
  TimeOfDay: 'dawn', 'morning', 'afternoon', 'dusk', 'night'
{existing_section}
## Rules
1. Only extract advice that is **specifically stated or clearly demonstrated** in the transcript. Do not infer or generalize.
2. The "lure" field MUST exactly match one of the valid lure names above. If the angler discusses a lure that doesn't match any name, skip it.
3. Map specific lure brands/models to generic names:
   - "Thunder Cricket" → "Chatterbait"
   - "KVD 1.5 / 2.5 / 4.0" → "Squarebill Crankbait"
   - "6XD / 5XD / 8XD / 10XD" → "Deep Diving Crankbait"
   - "Red Eye Shad" → "Lipless Crankbait"
   - "Sexy Dawg / One Knocker" → "Walking Topwater"
   - "Hybrid Hunter" → "Squarebill Crankbait" (if shallow) or "Medium Diving Crankbait" (if mid-depth)
   - "KVD 300" → "Suspending Jerkbait"
   - "Ocho" / "Dream Shot" on a drop shot → "Drop Shot"
   - "Baby Z-Too / Z2" on a Ned Head → "Ned Rig"
   - Any spinnerbait → "Spinnerbait (Colorado/Willow)"
   - Any swim jig → "Swim Jig"
   - Any football jig / deep jig → "Football Jig"
   - Any flipping jig → "Flipping Jig"
4. Tips MUST be attributed quotes or close paraphrases in the angler's voice, prefixed with the angler name (e.g., "KVD: ...").
5. ConditionPredicate fields: all specified fields are AND'd. Array values = OR within that field. Omit fields that always match.
6. Only include confidenceModifiers when the transcript provides clear evidence that specific conditions make a technique significantly better or worse.
7. For colorRules, include hex values that reasonably match the color name. Use common fishing lure color hex values.
8. structureAdvice keys must be one of: point, bluff, grass, flat, dock, creek-channel, hump, riprap, laydown
9. Skip tournament results, personal stories, and non-technique content.
10. If a transcript has no extractable technique advice, return an empty result.

## Transcript: {transcript_name}
```
{transcript_text}
```

## Output Format
Return ONLY valid JSON (no markdown fences, no commentary) matching this schema:
{{
  "source": "{transcript_name}",
  "anglerName": "{angler_id.upper()}",
  "newOpinions": [
    {{
      "lure": "exact lure name from list above",
      "seasonAdd": ["season values to add"],
      "minTempOverride": null,
      "maxFishDepthOverride": null,
      "confidenceModifiers": [
        {{ "when": {{ "season": "summer" }}, "adjustment": 8 }}
      ],
      "colorRules": [
        {{ "when": {{ "waterClarity": "stained" }}, "color": "White", "hex": "#ffffff", "priority": 10 }}
      ],
      "tipRules": [
        {{ "when": {{ "waterClarity": "stained" }}, "tip": "KVD: quoted or close-paraphrase tip text", "priority": 10 }}
      ],
      "defaultTip": "KVD: general tip if broadly applicable"
    }}
  ],
  "newStructureAdvice": {{
    "grass": "KVD: 'Quoted advice about this structure type.'"
  }},
  "credibilityUpdates": {{
    "Chatterbait": 0.85
  }}
}}

  "knowledge": [
    {{
      "category": "gear | retrieve-technique | forage-matching | lake-reading | depth-strategy | seasonal-pattern | trailer-modification | color-selection | tournament-strategy | structure-reading",
      "topic": "short-kebab-case-topic-name",
      "insight": "KVD: attributed quote or close paraphrase with specific detail",
      "conditions": {{ "lure": "optional lure name", "season": "optional", "structure": "optional", "waterClarity": "optional" }}
    }}
  ]
}}

Notes on output:
- Omit empty arrays and null fields — only include fields with actual data.
- "seasonAdd" only if the transcript shows the lure works in seasons NOT already in the base lure definition.
- "credibilityUpdates" only if the transcript strongly demonstrates mastery (bump toward 0.9-1.0) or unfamiliarity (lower).
- prioritize tipRules with specific conditions over defaultTip.
- Keep tips concise but include the specific detail (weight, color, trailer, retrieve style).
- "knowledge" captures insights that DON'T fit the AnglerProfile schema — gear setups, retrieve cadences, forage matching logic, lake reading strategy, depth/positioning theory, trailer mods, tournament decision-making, etc. Be thorough — these transcripts are hard to get, extract everything useful.
- knowledge "conditions" is a loose bag — include whatever context makes the insight findable later. Not limited to ConditionPredicate fields.
"""


def validate_output(data: dict, lure_names: list[str], enum_values: dict) -> list[str]:
    """Validate extracted JSON. Returns list of warnings."""
    warnings = []
    lure_set = set(lure_names)
    valid_seasons = set(enum_values.get("Season", []))
    valid_clarity = set(enum_values.get("WaterClarity", []))
    valid_sky = set(enum_values.get("SkyCondition", []))
    valid_frontal = set(enum_values.get("FrontalSystem", []))
    valid_pressure = set(enum_values.get("PressureTrend", []))
    valid_structure = {"point", "bluff", "grass", "flat", "dock", "creek-channel", "hump", "riprap", "laydown"}

    for i, opinion in enumerate(data.get("newOpinions", [])):
        lure = opinion.get("lure", "")
        if lure not in lure_set:
            warnings.append(f"Opinion[{i}]: invalid lure name '{lure}'")

        for sa in opinion.get("seasonAdd", []):
            if sa not in valid_seasons:
                warnings.append(f"Opinion[{i}]: invalid season '{sa}'")

        # Validate condition predicates in modifiers, colorRules, tipRules
        for field_name in ("confidenceModifiers", "colorRules", "tipRules"):
            for j, rule in enumerate(opinion.get(field_name, [])):
                when = rule.get("when", {})
                _validate_predicate(when, warnings, f"Opinion[{i}].{field_name}[{j}]",
                                    valid_seasons, valid_clarity, valid_sky, valid_frontal, valid_pressure)

    valid_categories = {
        "gear", "retrieve-technique", "forage-matching", "lake-reading",
        "depth-strategy", "seasonal-pattern", "trailer-modification",
        "color-selection", "tournament-strategy", "structure-reading",
    }
    for i, k in enumerate(data.get("knowledge", [])):
        cat = k.get("category", "")
        if cat not in valid_categories:
            warnings.append(f"knowledge[{i}]: invalid category '{cat}'")

    for key in data.get("newStructureAdvice", {}):
        if key not in valid_structure:
            warnings.append(f"Invalid structure type '{key}'")

    for lure in data.get("credibilityUpdates", {}):
        if lure not in lure_set:
            warnings.append(f"credibilityUpdates: invalid lure name '{lure}'")

    return warnings


def _validate_predicate(when, warnings, prefix, valid_seasons, valid_clarity, valid_sky, valid_frontal, valid_pressure):
    """Validate a ConditionPredicate dict."""
    def check_enum(field, valid_set):
        val = when.get(field)
        if val is None:
            return
        vals = val if isinstance(val, list) else [val]
        for v in vals:
            if v not in valid_set:
                warnings.append(f"{prefix}.when.{field}: invalid value '{v}'")

    check_enum("season", valid_seasons)
    check_enum("waterClarity", valid_clarity)
    check_enum("skyCondition", valid_sky)
    check_enum("frontalSystem", valid_frontal)
    check_enum("pressureTrend", valid_pressure)


def extract_transcript(
    client: anthropic.Anthropic,
    transcript_path: Path,
    angler_id: str,
    lure_names: list[str],
    enum_values: dict,
    angler_types_src: str,
    existing_profile: str,
    model: str,
) -> dict | None:
    """Run extraction on a single transcript. Returns parsed JSON or None."""
    transcript_text = transcript_path.read_text()
    transcript_name = transcript_path.name

    # Skip non-content files
    if transcript_name in ("urls.txt", "download.log", "video-list.json"):
        return None

    # Skip very short transcripts (likely no usable content)
    if len(transcript_text) < 200:
        print(f"  Skipping {transcript_name} (too short: {len(transcript_text)} chars)")
        return None

    prompt = build_extraction_prompt(
        transcript_text, transcript_name, angler_id,
        lure_names, enum_values, angler_types_src, existing_profile,
    )

    print(f"  Extracting from {transcript_name} ({len(transcript_text):,} chars)...")

    message = client.messages.create(
        model=model,
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = re.sub(r"^```\w*\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"  ERROR: Invalid JSON from API: {e}", file=sys.stderr)
        print(f"  Raw response (first 500 chars): {raw[:500]}", file=sys.stderr)
        return None

    # Validate
    warnings = validate_output(data, lure_names, enum_values)
    if warnings:
        print(f"  Warnings for {transcript_name}:")
        for w in warnings:
            print(f"    - {w}")

    # Filter out opinions with invalid lure names
    lure_set = set(lure_names)
    if "newOpinions" in data:
        data["newOpinions"] = [
            op for op in data["newOpinions"]
            if op.get("lure") in lure_set
        ]

    # Filter out invalid structure advice keys
    valid_structure = {"point", "bluff", "grass", "flat", "dock", "creek-channel", "hump", "riprap", "laydown"}
    if "newStructureAdvice" in data:
        data["newStructureAdvice"] = {
            k: v for k, v in data["newStructureAdvice"].items()
            if k in valid_structure
        }

    # Filter out invalid credibility updates
    if "credibilityUpdates" in data:
        data["credibilityUpdates"] = {
            k: v for k, v in data["credibilityUpdates"].items()
            if k in lure_set
        }

    # Remove empty top-level fields
    for key in ("newOpinions", "newStructureAdvice", "credibilityUpdates", "knowledge"):
        if key in data and not data[key]:
            del data[key]

    n_opinions = len(data.get("newOpinions", []))
    n_tips = sum(
        len(op.get("tipRules", [])) + (1 if op.get("defaultTip") else 0)
        for op in data.get("newOpinions", [])
    )
    n_structure = len(data.get("newStructureAdvice", {}))
    n_knowledge = len(data.get("knowledge", []))
    print(f"  → {n_opinions} opinions, {n_tips} tips, {n_structure} structure, {n_knowledge} knowledge")

    return data


def merge_extracted(extracted_dir: Path) -> dict:
    """Merge all extracted JSON files into a combined review structure."""
    merged = {
        "sources": [],
        "opinions": {},       # lure -> merged opinion data
        "structureAdvice": {},
        "credibility": {},
        "knowledge": [],      # all knowledge nuggets across transcripts
    }

    json_files = sorted(extracted_dir.glob("*.json"))
    if not json_files:
        print(f"No JSON files found in {extracted_dir}")
        return merged

    for jf in json_files:
        data = json.loads(jf.read_text())
        source = data.get("source", jf.name)
        merged["sources"].append(source)

        for opinion in data.get("newOpinions", []):
            lure = opinion["lure"]
            if lure not in merged["opinions"]:
                merged["opinions"][lure] = {
                    "lure": lure,
                    "seasonAdd": [],
                    "minTempOverride": None,
                    "maxFishDepthOverride": None,
                    "confidenceModifiers": [],
                    "colorRules": [],
                    "tipRules": [],
                    "defaultTips": [],
                    "sources": [],
                }
            dest = merged["opinions"][lure]
            dest["sources"].append(source)

            for sa in opinion.get("seasonAdd", []):
                if sa not in dest["seasonAdd"]:
                    dest["seasonAdd"].append(sa)

            if opinion.get("minTempOverride") is not None:
                current = dest["minTempOverride"]
                override = opinion["minTempOverride"]
                dest["minTempOverride"] = min(current, override) if current is not None else override

            if opinion.get("maxFishDepthOverride") is not None:
                current = dest["maxFishDepthOverride"]
                override = opinion["maxFishDepthOverride"]
                dest["maxFishDepthOverride"] = max(current, override) if current is not None else override

            dest["confidenceModifiers"].extend(opinion.get("confidenceModifiers", []))
            dest["colorRules"].extend(opinion.get("colorRules", []))
            dest["tipRules"].extend(opinion.get("tipRules", []))
            if opinion.get("defaultTip"):
                dest["defaultTips"].append({"tip": opinion["defaultTip"], "source": source})

        for key, val in data.get("newStructureAdvice", {}).items():
            if key not in merged["structureAdvice"]:
                merged["structureAdvice"][key] = []
            merged["structureAdvice"][key].append({"advice": val, "source": source})

        for lure, score in data.get("credibilityUpdates", {}).items():
            if lure not in merged["credibility"]:
                merged["credibility"][lure] = []
            merged["credibility"][lure].append({"score": score, "source": source})

        for nugget in data.get("knowledge", []):
            merged["knowledge"].append({**nugget, "source": source})

    # Deduplicate tips by content similarity
    for lure, opinion in merged["opinions"].items():
        opinion["tipRules"] = _dedupe_tips(opinion["tipRules"])

    return merged


def _dedupe_tips(tips: list[dict]) -> list[dict]:
    """Remove near-duplicate tips (same condition + very similar text)."""
    seen = []
    result = []
    for tip in tips:
        when_key = json.dumps(tip.get("when", {}), sort_keys=True)
        text = tip.get("tip", "")
        is_dupe = False
        for s_when, s_text in seen:
            if s_when == when_key and _text_similarity(text, s_text) > 0.7:
                is_dupe = True
                break
        if not is_dupe:
            seen.append((when_key, text))
            result.append(tip)
    return result


def _text_similarity(a: str, b: str) -> float:
    """Simple word-overlap similarity."""
    words_a = set(a.lower().split())
    words_b = set(b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    return len(intersection) / max(len(words_a), len(words_b))


def main():
    parser = argparse.ArgumentParser(description="Extract angler opinions from transcripts using Claude")
    parser.add_argument("input", nargs="?", help="Transcript file or directory of transcripts")
    parser.add_argument("--angler", "-a", default="kvd", help="Angler ID (default: kvd)")
    parser.add_argument("--merge", "-m", metavar="DIR", help="Merge all extracted JSON in DIR into a review file")
    parser.add_argument("--output", "-o", help="Output directory (default: data/extracted/<angler>/)")
    parser.add_argument("--force", "-f", action="store_true", help="Re-extract even if output already exists")
    parser.add_argument("--model", default="claude-sonnet-4-20250514", help="Claude model to use")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be extracted without calling API")
    args = parser.parse_args()

    # ─── Merge mode ───
    if args.merge:
        merge_dir = Path(args.merge)
        if not merge_dir.is_dir():
            print(f"Error: {merge_dir} is not a directory", file=sys.stderr)
            sys.exit(1)

        merged = merge_extracted(merge_dir)
        out_path = merge_dir / "_merged-review.json"
        out_path.write_text(json.dumps(merged, indent=2))
        print(f"Merged {len(merged['sources'])} sources → {out_path}")
        print(f"  {len(merged['opinions'])} lures with opinions")
        print(f"  {len(merged['structureAdvice'])} structure types with advice")
        print(f"  {len(merged['credibility'])} credibility updates")
        return

    # ─── Extract mode ───
    if not args.input:
        parser.print_help()
        sys.exit(1)

    input_path = Path(args.input)
    output_dir = Path(args.output) if args.output else KNOWLEDGE_DIR / "data" / "extracted" / args.angler
    output_dir.mkdir(parents=True, exist_ok=True)

    # Collect transcript files
    if input_path.is_file():
        transcripts = [input_path]
    elif input_path.is_dir():
        transcripts = sorted(
            f for f in input_path.iterdir()
            if f.suffix == ".txt" and f.name not in ("urls.txt", "download.log")
        )
    else:
        print(f"Error: {input_path} not found", file=sys.stderr)
        sys.exit(1)

    if not transcripts:
        print(f"No .txt files found in {input_path}")
        sys.exit(1)

    # Filter already-extracted unless --force
    if not args.force:
        filtered = []
        for t in transcripts:
            out_name = t.stem + ".json"
            if (output_dir / out_name).exists():
                print(f"  Skipping {t.name} (already extracted, use --force to re-run)")
            else:
                filtered.append(t)
        transcripts = filtered

    if not transcripts:
        print("Nothing to extract (all already done)")
        return

    print(f"Extracting from {len(transcripts)} transcript(s) for angler '{args.angler}'")
    print(f"Output: {output_dir}/")

    if args.dry_run:
        for t in transcripts:
            print(f"  Would extract: {t.name}")
        return

    # Load schema data
    angler_types_src = load_file(TYPES_TS)
    core_types_src = load_file(CORE_TYPES_TS)
    base_lures_src = load_file(BASE_LURES_TS)
    lure_names = extract_lure_names(base_lures_src)
    enum_values = extract_enum_values(core_types_src)
    existing_profile = load_existing_profile(args.angler)

    print(f"Loaded {len(lure_names)} lure names, {len(enum_values)} enum types")

    # Init Anthropic client
    client = anthropic.Anthropic()

    success = 0
    errors = 0
    empty = 0

    for transcript in transcripts:
        try:
            data = extract_transcript(
                client, transcript, args.angler,
                lure_names, enum_values, angler_types_src, existing_profile,
                args.model,
            )

            if data is None:
                empty += 1
                continue

            # Check if there's any actual content
            has_content = (
                data.get("newOpinions")
                or data.get("newStructureAdvice")
                or data.get("credibilityUpdates")
                or data.get("knowledge")
            )

            if not has_content:
                print(f"  → No actionable content in {transcript.name}")
                empty += 1
                continue

            out_path = output_dir / (transcript.stem + ".json")
            out_path.write_text(json.dumps(data, indent=2))
            print(f"  → Saved {out_path.name}")
            success += 1

        except anthropic.APIError as e:
            print(f"  ERROR: API error for {transcript.name}: {e}", file=sys.stderr)
            errors += 1
        except KeyboardInterrupt:
            print("\nInterrupted by user")
            break

    print(f"\nDone: {success} extracted, {empty} empty/skipped, {errors} errors")


if __name__ == "__main__":
    main()
