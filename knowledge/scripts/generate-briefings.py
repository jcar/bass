#!/usr/bin/env python3
"""Generate tactical bass fishing briefings from enriched knowledge entries.

Reads enriched knowledge from all anglers, groups by condition combos
(season × clarity × pressure × lure category), and uses Claude to
generate structured tactical briefings.

Usage:
    # Generate all briefings
    python3 scripts/generate-briefings.py --all --model claude-sonnet-4-20250514

    # Generate for a specific combo
    python3 scripts/generate-briefings.py --season pre-spawn --clarity stained --pressure post-frontal --category cranking

    # Dry run — show combos that would be generated
    python3 scripts/generate-briefings.py --all --dry-run

    # Use haiku for cheaper generation
    python3 scripts/generate-briefings.py --all --model claude-haiku-4-5-20251001

Requires ANTHROPIC_API_KEY environment variable.
"""

import argparse
import json
import os
import sys
import time
import random
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not installed. Run: pip install anthropic", file=sys.stderr)
    sys.exit(1)

# ─── Resolve project paths ───────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DATA_DIR = KNOWLEDGE_DIR / "data" / "extracted"
BRIEFINGS_DIR = KNOWLEDGE_DIR / "data" / "briefings"

# ─── Constants ────────────────────────────────────────────────────────────────
ANGLERS = ["wheeler", "yamamoto", "hackney", "johnston", "kvd", "palaniuk", "robertson"]

SEASONS = ["pre-spawn", "spawn", "post-spawn", "summer", "fall", "winter"]
WATER_CLARITIES = ["clear", "stained", "muddy"]
PRESSURE_STATES = ["pre-frontal", "stable", "post-frontal"]
LURES = [
    "Squarebill Crankbait", "Medium Diving Crankbait", "Deep Diving Crankbait",
    "Lipless Crankbait", "Suspending Jerkbait", "Spinnerbait (Colorado/Willow)",
    "Chatterbait", "Swim Jig", "Flipping Jig", "Football Jig",
    "Texas Rig (Creature Bait)", "Carolina Rig", '10" Worm (Shakey/TX)',
    "Drop Shot", "Ned Rig", "Neko Rig", "Shakyhead", "Walking Topwater",
]

LURE_SLUGS = {
    "Squarebill Crankbait": "squarebill-crankbait",
    "Medium Diving Crankbait": "medium-diving-crankbait",
    "Deep Diving Crankbait": "deep-diving-crankbait",
    "Lipless Crankbait": "lipless-crankbait",
    "Suspending Jerkbait": "suspending-jerkbait",
    "Spinnerbait (Colorado/Willow)": "spinnerbait",
    "Chatterbait": "chatterbait",
    "Swim Jig": "swim-jig",
    "Flipping Jig": "flipping-jig",
    "Football Jig": "football-jig",
    "Texas Rig (Creature Bait)": "texas-rig",
    "Carolina Rig": "carolina-rig",
    '10" Worm (Shakey/TX)': "ten-inch-worm",
    "Drop Shot": "drop-shot",
    "Ned Rig": "ned-rig",
    "Neko Rig": "neko-rig",
    "Shakyhead": "shakyhead",
    "Walking Topwater": "walking-topwater",
}

DEFAULT_MODEL = "claude-opus-4-20250514"

# Max entries to feed into the briefing prompt
MAX_ENTRIES_TOTAL = 30
MAX_ENTRIES_PER_ANGLER = 6
MAX_ENTRIES_PER_LURE = 6
MAX_GENERAL_ENTRIES = 5

# Lure-specific pruning rules
PRUNE_RULES = {
    "Walking Topwater": {"seasons_exclude": ["winter"], "clarities_exclude": ["muddy"], "pressures_exclude": ["post-frontal"]},
    "Suspending Jerkbait": {"clarities_exclude": ["muddy"]},
}

# Keywords to match each lure in insight text (for retrieval scoring)
LURE_KEYWORDS = {
    "Squarebill Crankbait": ["squarebill", "square bill", "square-bill", "kvd 1.5", "kvd 2.5"],
    "Medium Diving Crankbait": ["medium diving", "medium diver", "mid-range crank", "dt-6", "dt6",
                                 "series 3", "series 5", "gravel dog", "5xd", "6xd"],
    "Deep Diving Crankbait": ["deep diving", "deep diver", "deep crank", "10xd", "8xd", "dredger",
                               "big john", "big-m"],
    "Lipless Crankbait": ["lipless", "lip-less", "red eye shad", "red eyed shad", "rattle trap"],
    "Suspending Jerkbait": ["jerkbait", "jerk bait", "jerk-bait", "suspending minnow", "kvd 200",
                             "kvd 300", "x-rap"],
    "Spinnerbait (Colorado/Willow)": ["spinnerbait", "spinner bait", "colorado blade", "willow blade"],
    "Chatterbait": ["chatterbait", "chatter bait", "bladed jig", "thunder cricket", "jack hammer",
                     "vibrating jig"],
    "Swim Jig": ["swim jig", "swimming jig", "swim-jig"],
    "Flipping Jig": ["flipping jig", "flip jig", "hack attack", "punch rig", "flipping", "pitching"],
    "Football Jig": ["football jig", "football head"],
    "Texas Rig (Creature Bait)": ["texas rig", "texas-rig", "creature bait", "rage craw", "brush hog"],
    "Carolina Rig": ["carolina rig", "carolina-rig", "c-rig"],
    '10" Worm (Shakey/TX)': ["10 inch worm", "10-inch worm", "big worm", "ribbon tail", "magnum worm"],
    "Drop Shot": ["drop shot", "dropshot", "drop-shot"],
    "Ned Rig": ["ned rig", "ned-rig"],
    "Neko Rig": ["neko rig", "neko-rig", "nail weight"],
    "Shakyhead": ["shakyhead", "shaky head", "shaky-head", "shakeyhead"],
    "Walking Topwater": ["walking topwater", "topwater", "sexy dawg", "zara spook", "walk the dog"],
}


# ─── Pruning rules ───────────────────────────────────────────────────────────
def is_pruned_combo(season: str, clarity: str, pressure: str, lure: str) -> bool:
    """Return True if this lure × condition combo should be skipped."""
    rules = PRUNE_RULES.get(lure, {})
    if season in rules.get("seasons_exclude", []):
        return True
    if clarity in rules.get("clarities_exclude", []):
        return True
    if pressure in rules.get("pressures_exclude", []):
        return True
    return False


def generate_all_combos() -> list[dict]:
    """Generate all valid condition combos after pruning."""
    combos = []
    for season in SEASONS:
        for clarity in WATER_CLARITIES:
            for pressure in PRESSURE_STATES:
                for lure in LURES:
                    if not is_pruned_combo(season, clarity, pressure, lure):
                        combos.append({
                            "season": season,
                            "waterClarity": clarity,
                            "pressureState": pressure,
                            "lure": lure,
                        })
    return combos


def combo_key(combo: dict) -> str:
    """Return a filename-safe key for a condition combo."""
    slug = LURE_SLUGS.get(combo["lure"], combo["lure"].lower().replace(" ", "-"))
    return f"{combo['season']}_{combo['waterClarity']}_{combo['pressureState']}_{slug}"


# ─── Data loading ─────────────────────────────────────────────────────────────
def load_angler_data(angler: str) -> dict | None:
    """Load an angler's enriched merged review."""
    path = DATA_DIR / angler / "_merged-review-enriched.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text())
    except (json.JSONDecodeError, OSError) as e:
        print(f"  Warning: Failed to load {path}: {e}", file=sys.stderr)
        return None


def load_all_anglers() -> dict[str, dict]:
    """Load enriched data for all anglers. Returns {angler_id: data}."""
    anglers = {}
    for angler in ANGLERS:
        data = load_angler_data(angler)
        if data is not None:
            anglers[angler] = data
    if not anglers:
        print("Error: No enriched angler data found. Run enrich-conditions.py first.", file=sys.stderr)
        sys.exit(1)
    print(f"Loaded enriched data for {len(anglers)} anglers: {', '.join(anglers.keys())}")
    return anglers


# ─── Entry matching ───────────────────────────────────────────────────────────
def entry_matches_combo(entry: dict, combo: dict) -> tuple[bool, int]:
    """Check if a knowledge entry matches the target combo.

    Returns (matches, relevance_score).
    Higher score = more specific match.
    """
    conditions = entry.get("conditions", {})
    if not conditions:
        # Unconditioned general wisdom — include with low relevance
        return True, 1

    score = 0
    has_any_match = False
    has_disqualifier = False

    # Season match
    entry_seasons = conditions.get("season", [])
    if isinstance(entry_seasons, str):
        entry_seasons = [entry_seasons]
    if entry_seasons:
        if combo["season"] in entry_seasons:
            score += 3
            has_any_match = True
        else:
            has_disqualifier = True

    # Water clarity match
    entry_clarity = conditions.get("waterClarity")
    if isinstance(entry_clarity, list):
        entry_clarity = entry_clarity[0] if entry_clarity else None
    if entry_clarity:
        if entry_clarity == combo["waterClarity"]:
            score += 3
            has_any_match = True
        else:
            has_disqualifier = True

    # Lure-specific match: check if entry insight mentions this lure
    insight = entry.get("insight", "").lower()
    lure_name = combo["lure"]
    lure_keywords = LURE_KEYWORDS.get(lure_name, [])
    if any(kw in insight for kw in lure_keywords):
        score += 5
        has_any_match = True

    # Pressure state is rarely tagged on entries, but check it
    entry_pressure = conditions.get("pressureState")
    if isinstance(entry_pressure, list):
        entry_pressure = entry_pressure[0] if entry_pressure else None
    if entry_pressure:
        if entry_pressure == combo["pressureState"]:
            score += 2
            has_any_match = True
        else:
            has_disqualifier = True

    # Bonus for other useful condition info (structure, depth, cover)
    for bonus_key in ("structure", "depthZone", "coverType", "retrieveStyle"):
        if conditions.get(bonus_key):
            score += 1

    # If entry has conditions but none match, skip it
    if has_disqualifier and not has_any_match:
        return False, 0

    return True, score


def retrieve_knowledge_entries(
    all_anglers: dict[str, dict],
    combo: dict,
) -> list[dict]:
    """Retrieve matching knowledge entries from all anglers for a combo."""
    scored_entries = []

    for angler_id, data in all_anglers.items():
        knowledge = data.get("knowledge", [])
        for entry in knowledge:
            matches, score = entry_matches_combo(entry, combo)
            if matches and score > 0:
                scored_entries.append({
                    "angler": angler_id,
                    "category": entry.get("category", "unknown"),
                    "topic": entry.get("topic", ""),
                    "insight": entry.get("insight", ""),
                    "conditions": entry.get("conditions", {}),
                    "score": score,
                })

    # Sort by relevance score descending
    scored_entries.sort(key=lambda e: e["score"], reverse=True)

    # Apply caps: max per angler, max per category, max total
    selected = []
    angler_counts: dict[str, int] = {}
    category_counts: dict[str, int] = {}
    general_count = 0

    for entry in scored_entries:
        angler = entry["angler"]
        cat = entry["category"]

        # Cap per angler
        if angler_counts.get(angler, 0) >= MAX_ENTRIES_PER_ANGLER:
            continue
        # Cap per category
        if category_counts.get(cat, 0) >= MAX_ENTRIES_PER_CATEGORY:
            continue
        # Cap general/unconditioned entries
        if entry["score"] <= 1:
            if general_count >= MAX_GENERAL_ENTRIES:
                continue
            general_count += 1

        angler_counts[angler] = angler_counts.get(angler, 0) + 1
        category_counts[cat] = category_counts.get(cat, 0) + 1
        selected.append(entry)

        if len(selected) >= MAX_ENTRIES_TOTAL:
            break

    return selected


def retrieve_opinion_rules(
    all_anglers: dict[str, dict],
    combo: dict,
) -> list[dict]:
    """Retrieve tipRules and colorRules from opinions matching the combo."""
    rules = []

    for angler_id, data in all_anglers.items():
        opinions = data.get("opinions", {})
        for lure_name, opinion in opinions.items():
            # Match by specific lure name
            if lure_name != combo["lure"]:
                continue

            # Gather matching tipRules
            for rule in opinion.get("tipRules", []):
                when = rule.get("when", {})
                if _rule_matches_combo(when, combo):
                    rules.append({
                        "angler": angler_id,
                        "lure": lure_name,
                        "type": "tip",
                        "content": rule.get("tip", ""),
                        "priority": rule.get("priority", 5),
                    })

            # Gather matching colorRules
            for rule in opinion.get("colorRules", []):
                when = rule.get("when", {})
                if _rule_matches_combo(when, combo):
                    rules.append({
                        "angler": angler_id,
                        "lure": lure_name,
                        "type": "color",
                        "content": f"{rule.get('color', 'unknown')} (for {lure_name})",
                        "priority": rule.get("priority", 5),
                    })

            # Include defaultTips if they exist
            for tip in opinion.get("defaultTips", []):
                tip_text = tip if isinstance(tip, str) else tip.get("tip", "")
                if tip_text:
                    rules.append({
                        "angler": angler_id,
                        "lure": lure_name,
                        "type": "tip",
                        "content": tip_text,
                        "priority": 4,
                    })

    # Sort by priority descending
    rules.sort(key=lambda r: r["priority"], reverse=True)
    return rules[:20]


def _rule_matches_combo(when: dict, combo: dict) -> bool:
    """Check if a tipRule/colorRule 'when' clause overlaps with the combo."""
    if not when:
        return True

    has_disqualifier = False

    # Season
    when_seasons = when.get("season", [])
    if isinstance(when_seasons, str):
        when_seasons = [when_seasons]
    if when_seasons and combo["season"] not in when_seasons:
        has_disqualifier = True

    # Water clarity
    when_clarity = when.get("waterClarity")
    if isinstance(when_clarity, list):
        when_clarity = when_clarity[0] if when_clarity else None
    if when_clarity and when_clarity != combo["waterClarity"]:
        has_disqualifier = True

    return not has_disqualifier


# ─── Claude prompt ────────────────────────────────────────────────────────────
def build_briefing_prompt(
    combo: dict,
    knowledge_entries: list[dict],
    opinion_rules: list[dict],
) -> str:
    """Build the Claude prompt for generating a briefing."""
    season = combo["season"]
    clarity = combo["waterClarity"]
    pressure = combo["pressureState"]
    lure_name = combo["lure"]

    # Format knowledge entries
    knowledge_block = ""
    for i, entry in enumerate(knowledge_entries, 1):
        conds = entry.get("conditions", {})
        cond_str = ", ".join(f"{k}={v}" for k, v in conds.items() if v) if conds else "general"
        knowledge_block += f"\n{i}. [{entry['angler'].upper()}] ({entry['category']}) {entry['insight']}\n   Conditions: {cond_str}\n"

    # Format opinion rules
    opinions_block = ""
    for i, rule in enumerate(opinion_rules, 1):
        opinions_block += f"\n{i}. [{rule['angler'].upper()}] ({rule['lure']}, {rule['type']}) {rule['content']}"

    prompt = f"""You are a tournament bass fishing analyst writing a tactical briefing for a competitive angler.

## Target Conditions
- Season: {season}
- Water Clarity: {clarity}
- Pressure State: {pressure} (weather front)
- Lure Category: {category}
- Available lure types in this category: {', '.join(lure_options)}

## Pro Angler Knowledge Entries
These are insights extracted from professional anglers' articles, interviews, and tournament breakdowns:
{knowledge_block if knowledge_block else "(No specific knowledge entries matched these conditions)"}

## Pro Angler Lure Opinions (Tips & Color Rules)
{opinions_block if opinions_block else "(No specific opinion rules matched these conditions)"}

## Your Task

Synthesize the above knowledge into a structured tactical briefing as JSON. Use the specific insights from the pros — attribute tactics to the anglers who shared them. Be specific about depths, retrieves, colors, and targets. Write in a direct, pro-angler voice — not generic fishing advice.

The briefing must match this exact JSON structure:
{{
  "headline": "A punchy one-line tactical summary (max 15 words)",
  "gameplan": "2-3 focused paragraphs. Synthesize the pro insights into a cohesive game plan for {season} / {clarity} / {pressure} conditions using {category}. Reference specific anglers. Include depths, water temps if relevant, retrieve cadences, and where to target.",
  "primaryApproach": {{
    "lure": "The best specific lure type from [{', '.join(lure_options)}]",
    "color": "Specific color recommendation based on {clarity} water",
    "retrieve": "Detailed retrieve description — cadence, speed, rod work",
    "targets": "Specific structure/cover targets for these conditions",
    "proSource": "The angler whose insight most informed this approach"
  }},
  "alternateApproach": {{
    "lure": "A different lure from the same category as a backup",
    "color": "Color recommendation",
    "retrieve": "How to fish this alternative differently",
    "targets": "Where/when to deploy the alternate",
    "proSource": "The angler whose insight most informed this"
  }},
  "proInsights": [
    {{ "angler": "Name", "insight": "Direct quote or close paraphrase of their most relevant wisdom for these conditions" }},
    {{ "angler": "Name2", "insight": "Another pro's perspective" }}
  ],
  "depthStrategy": "1-2 sentences on depth targeting for {season}/{pressure} — where fish position and how depth changes through the day",
  "adjustIf": [
    "If [condition change], then [tactical pivot]...",
    "If [condition change], then [tactical pivot]...",
    "If [condition change], then [tactical pivot]..."
  ]
}}

Rules:
- proInsights should have 2-4 entries from different anglers when possible
- adjustIf should have 3-4 conditional pivots
- If knowledge entries are sparse, lean on general {category} principles for {season}/{clarity}/{pressure} but note when you're extrapolating beyond the provided data
- Colors should be specific (e.g., "Sexy Shad" not "shad pattern") when the data supports it
- Use pro-tournament terminology — "staging areas", "secondary points", "channel swings", "wolfpack schools"

Return ONLY the JSON object, no markdown fencing or extra text."""

    return prompt


# ─── Claude API ───────────────────────────────────────────────────────────────
def call_claude(
    client: anthropic.Anthropic,
    prompt: str,
    model: str,
    max_retries: int = 5,
) -> dict | None:
    """Call Claude API with exponential backoff. Returns parsed briefing dict."""
    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model=model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
            )
            text = response.content[0].text.strip()

            # Strip markdown fencing if present
            if text.startswith("```"):
                first_newline = text.index("\n")
                last_fence = text.rfind("```")
                if last_fence > first_newline:
                    text = text[first_newline + 1:last_fence].strip()

            return json.loads(text)

        except anthropic.RateLimitError:
            wait = min(2 ** attempt + random.uniform(0, 1), 60)
            print(f"    Rate limited, waiting {wait:.1f}s (attempt {attempt + 1}/{max_retries})")
            time.sleep(wait)

        except anthropic.APIError as e:
            wait = min(2 ** attempt + random.uniform(0, 1), 60)
            print(f"    API error: {e}, retrying in {wait:.1f}s (attempt {attempt + 1}/{max_retries})")
            time.sleep(wait)

        except json.JSONDecodeError as e:
            print(f"    JSON parse error: {e}", file=sys.stderr)
            if attempt < max_retries - 1:
                print(f"    Retrying... (attempt {attempt + 1}/{max_retries})")
                time.sleep(1)
            else:
                print(f"    Raw response:\n{text[:500]}", file=sys.stderr)
                return None

    print("    Max retries exceeded", file=sys.stderr)
    return None


# ─── Briefing generation ─────────────────────────────────────────────────────
def generate_briefing(
    client: anthropic.Anthropic,
    all_anglers: dict[str, dict],
    combo: dict,
    model: str,
) -> dict | None:
    """Generate a single briefing for a condition combo."""
    knowledge = retrieve_knowledge_entries(all_anglers, combo)
    opinions = retrieve_opinion_rules(all_anglers, combo)

    if not knowledge and not opinions:
        print(f"    No matching data — generating with general knowledge only")

    prompt = build_briefing_prompt(combo, knowledge, opinions)
    briefing = call_claude(client, prompt, model)

    if briefing is None:
        return None

    return {
        "conditions": combo,
        "briefing": briefing,
        "meta": {
            "knowledgeEntriesUsed": len(knowledge),
            "opinionRulesUsed": len(opinions),
            "anglersRepresented": list(set(e["angler"] for e in knowledge) | set(r["angler"] for r in opinions)),
            "model": model,
        },
    }


def write_briefing(briefing: dict, combo: dict) -> Path:
    """Write a single briefing JSON file. Returns the output path."""
    BRIEFINGS_DIR.mkdir(parents=True, exist_ok=True)
    key = combo_key(combo)
    path = BRIEFINGS_DIR / f"{key}.json"
    path.write_text(json.dumps(briefing, indent=2, ensure_ascii=False) + "\n")
    return path


def write_index(combos_generated: list[dict]) -> Path:
    """Write the _index.json mapping condition keys to filenames."""
    index = {}
    for combo in combos_generated:
        key = combo_key(combo)
        index[key] = f"{key}.json"
    path = BRIEFINGS_DIR / "_index.json"
    path.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
    return path


def write_bundle(combos_generated: list[dict]) -> Path:
    """Write the briefings-bundle.json with all briefings in one file."""
    bundle = []
    for combo in combos_generated:
        key = combo_key(combo)
        briefing_path = BRIEFINGS_DIR / f"{key}.json"
        if briefing_path.exists():
            try:
                data = json.loads(briefing_path.read_text())
                bundle.append(data)
            except (json.JSONDecodeError, OSError):
                pass
    path = BRIEFINGS_DIR / "briefings-bundle.json"
    path.write_text(json.dumps(bundle, indent=2, ensure_ascii=False) + "\n")
    return path


# ─── CLI ──────────────────────────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate tactical bass fishing briefings from enriched knowledge.",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Generate briefings for all valid condition combos",
    )
    parser.add_argument(
        "--season",
        choices=SEASONS,
        help="Target season",
    )
    parser.add_argument(
        "--clarity",
        choices=WATER_CLARITIES,
        help="Target water clarity",
    )
    parser.add_argument(
        "--pressure",
        choices=PRESSURE_STATES,
        help="Target pressure state",
    )
    parser.add_argument(
        "--category",
        choices=LURES,
        help="Target lure name",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show combos that would be generated without calling Claude",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip combos that already have a briefing file",
    )

    args = parser.parse_args()

    # Validate: either --all or all four specific flags
    if not args.all and not (args.season and args.clarity and args.pressure and args.category):
        parser.error("Provide --all or all four of --season, --clarity, --pressure, --category")

    return args


def main() -> None:
    args = parse_args()

    # Build combo list
    if args.all:
        combos = generate_all_combos()
    else:
        combo = {
            "season": args.season,
            "waterClarity": args.clarity,
            "pressureState": args.pressure,
            "lure": args.category,
        }
        if is_pruned_combo(combo["season"], combo["waterClarity"], combo["pressureState"], combo["lure"]):
            print(f"Warning: {combo_key(combo)} is a pruned (unrealistic) combo. Generating anyway.")
        combos = [combo]

    # Filter existing if requested
    if args.skip_existing:
        before = len(combos)
        combos = [c for c in combos if not (BRIEFINGS_DIR / f"{combo_key(c)}.json").exists()]
        skipped = before - len(combos)
        if skipped:
            print(f"Skipping {skipped} existing briefings")

    print(f"Briefing combos: {len(combos)}")

    # Dry run: just list combos and exit
    if args.dry_run:
        print(f"\n{'#':>4}  {'Season':<12} {'Clarity':<10} {'Pressure':<14} {'Category':<14}")
        print("─" * 60)
        for i, combo in enumerate(combos, 1):
            print(f"{i:>4}  {combo['season']:<12} {combo['waterClarity']:<10} {combo['pressureState']:<14} {combo['lure']}")
        print(f"\nTotal: {len(combos)} briefings would be generated")
        return

    # Validate API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    # Load all angler data
    all_anglers = load_all_anglers()

    # Init API client
    client = anthropic.Anthropic(api_key=api_key)
    print(f"Model: {args.model}")
    print(f"Output: {BRIEFINGS_DIR}")
    print()

    # Generate briefings
    BRIEFINGS_DIR.mkdir(parents=True, exist_ok=True)
    success_count = 0
    fail_count = 0
    combos_generated = []

    for i, combo in enumerate(combos, 1):
        key = combo_key(combo)
        print(f"[{i}/{len(combos)}] {key}")

        briefing = generate_briefing(client, all_anglers, combo, args.model)
        if briefing is None:
            print(f"    FAILED")
            fail_count += 1
            continue

        path = write_briefing(briefing, combo)
        combos_generated.append(combo)
        success_count += 1
        anglers_used = briefing["meta"]["anglersRepresented"]
        entries_used = briefing["meta"]["knowledgeEntriesUsed"]
        print(f"    OK ({entries_used} entries, anglers: {', '.join(anglers_used)}) -> {path.name}")

    # Write index and bundle
    if combos_generated:
        # Include any previously existing combos in the index/bundle
        existing_files = list(BRIEFINGS_DIR.glob("*.json"))
        all_combo_keys = set()
        all_combos_for_index = list(combos_generated)

        for f in existing_files:
            if f.name.startswith("_") or f.name == "briefings-bundle.json":
                continue
            parts = f.stem.split("_")
            if len(parts) == 4:
                existing_combo = {
                    "season": parts[0],
                    "waterClarity": parts[1],
                    "pressureState": parts[2],
                    "lure": parts[3],
                }
                k = combo_key(existing_combo)
                if k not in {combo_key(c) for c in all_combos_for_index}:
                    all_combos_for_index.append(existing_combo)

        index_path = write_index(all_combos_for_index)
        bundle_path = write_bundle(all_combos_for_index)
        print(f"\nIndex: {index_path} ({len(all_combos_for_index)} entries)")
        print(f"Bundle: {bundle_path}")

    # Summary
    print(f"\nDone: {success_count} generated, {fail_count} failed, {len(combos)} total")


if __name__ == "__main__":
    main()
