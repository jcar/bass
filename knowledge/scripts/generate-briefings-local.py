#!/usr/bin/env python3
"""Generate tactical briefings from enriched knowledge entries — one per lure.
No API key required — generates briefings by retrieving and organizing
enriched knowledge entries into structured tactical advice.

For higher quality narrative generation, pipe the retrieved context through
Claude using generate-briefings.py instead.

Usage:
    python3 scripts/generate-briefings-local.py --all
    python3 scripts/generate-briefings-local.py --combos pre-spawn_stained_post-frontal_squarebill-crankbait
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DATA_DIR = KNOWLEDGE_DIR / "data" / "extracted"
BRIEFINGS_DIR = KNOWLEDGE_DIR / "data" / "briefings"

ANGLERS = ["wheeler", "yamamoto", "hackney", "johnston", "kvd", "palaniuk", "robertson"]

SEASONS = ["pre-spawn", "spawn", "post-spawn", "summer", "fall", "winter"]
CLARITIES = ["clear", "stained", "muddy"]
PRESSURES = ["pre-frontal", "stable", "post-frontal"]

# The 18 lures with sufficient coverage (4+ anglers) to generate briefings
LURES = [
    "Squarebill Crankbait",
    "Medium Diving Crankbait",
    "Deep Diving Crankbait",
    "Lipless Crankbait",
    "Suspending Jerkbait",
    "Spinnerbait (Colorado/Willow)",
    "Chatterbait",
    "Swim Jig",
    "Flipping Jig",
    "Football Jig",
    "Texas Rig (Creature Bait)",
    "Carolina Rig",
    '10" Worm (Shakey/TX)',
    "Drop Shot",
    "Ned Rig",
    "Neko Rig",
    "Shakyhead",
    "Walking Topwater",
]

# Lure name -> kebab-case slug for filenames
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

# Keywords to match each lure in insight text (for retrieval scoring)
LURE_KEYWORDS = {
    "Squarebill Crankbait": ["squarebill", "square bill", "square-bill", "kvd 1.5", "kvd 2.5"],
    "Medium Diving Crankbait": ["medium diving", "medium diver", "mid-range crank", "dt-6", "dt6",
                                 "series 3", "series 5", "gravel dog", "5xd", "6xd"],
    "Deep Diving Crankbait": ["deep diving", "deep diver", "deep crank", "10xd", "8xd", "dredger",
                               "big john", "big-m"],
    "Lipless Crankbait": ["lipless", "lip-less", "red eye shad", "red eyed shad", "rattle trap",
                           "rat-l-trap"],
    "Suspending Jerkbait": ["jerkbait", "jerk bait", "jerk-bait", "suspending minnow", "kvd 200",
                             "kvd 300", "x-rap"],
    "Spinnerbait (Colorado/Willow)": ["spinnerbait", "spinner bait", "colorado blade", "willow blade"],
    "Chatterbait": ["chatterbait", "chatter bait", "bladed jig", "thunder cricket", "jack hammer",
                     "vibrating jig", "rage blade"],
    "Swim Jig": ["swim jig", "swimming jig", "swim-jig"],
    "Flipping Jig": ["flipping jig", "flip jig", "hack attack", "punch rig", "punch bug",
                      "flipping", "pitching"],
    "Football Jig": ["football jig", "football head"],
    "Texas Rig (Creature Bait)": ["texas rig", "texas-rig", "creature bait", "punch out craw",
                                   "rage craw", "brush hog", "game hawg"],
    "Carolina Rig": ["carolina rig", "carolina-rig", "c-rig"],
    '10" Worm (Shakey/TX)': ["10 inch worm", "10-inch worm", "big worm", "ribbon tail",
                              "ol' monster", "magnum worm"],
    "Drop Shot": ["drop shot", "dropshot", "drop-shot"],
    "Ned Rig": ["ned rig", "ned-rig", "z-man", "trd"],
    "Neko Rig": ["neko rig", "neko-rig", "nail weight"],
    "Shakyhead": ["shakyhead", "shaky head", "shaky-head", "shakeyhead"],
    "Walking Topwater": ["walking topwater", "topwater", "sexy dawg", "zara spook", "spook",
                          "walking bait", "walk the dog"],
}

# Angler display names
ANGLER_NAMES = {
    "wheeler": "Wheeler", "yamamoto": "Yamamoto", "hackney": "Hackney",
    "johnston": "Johnston", "kvd": "KVD", "palaniuk": "Palaniuk", "robertson": "Robertson",
}

# Depth strategy templates by season + pressure
DEPTH_STRATEGIES = {
    ("pre-spawn", "pre-frontal"): "Pre-frontal pre-spawn bass are aggressive and moving shallow. Expect fish in the 4-8ft range on secondary points and channel swings. Falling pressure pulls fish up from staging areas — target the first breakline off spawning flats.",
    ("pre-spawn", "stable"): "Stable pre-spawn conditions mean fish are staging predictably at 5-12ft on points, channel swings, and riprap banks. They're feeding aggressively as water warms. Work the transition zone between deep winter haunts and shallow spawning areas.",
    ("pre-spawn", "post-frontal"): "Post-frontal pre-spawn fish pull back to 6-12ft staging areas. They won't commit shallow after the front. Target the first breakline off spawning flats and key on deeper structure near shallow spawning zones.",
    ("spawn", "pre-frontal"): "Pre-frontal spawning bass are active on beds in 2-5ft. Falling pressure often triggers new waves of fish to move onto beds. Target hard-bottom spawning flats, secondary pockets, and protected coves.",
    ("spawn", "stable"): "Stable spawn conditions have fish committed to beds in 1-5ft. Focus on hard-bottom areas in protected coves, pockets, and flats. Polarized glasses are essential for sight-fishing.",
    ("spawn", "post-frontal"): "Post-frontal spawning bass become extremely lockjaw but won't abandon beds. Fish are still in 2-5ft but much harder to trigger. Slow way down and make repeated presentations to visible beds.",
    ("post-spawn", "pre-frontal"): "Pre-frontal post-spawn bass are transitioning and aggressive. Males guard fry in 2-6ft while females roam 5-12ft feeding heavily. Target both shallow fry-guarders and roaming post-spawn females near points.",
    ("post-spawn", "stable"): "Stable post-spawn conditions split fish between shallow fry-guarders (2-5ft) and transitioning females (5-15ft). Shad spawn activity on seawalls, riprap, and bluff walls concentrates bigger fish shallow at dawn.",
    ("post-spawn", "post-frontal"): "Post-frontal post-spawn fish hunker down at 6-12ft near cover. Males may temporarily leave fry. Focus on the deeper side of transition areas — channel edges, deeper points, and offshore structure near spawning flats.",
    ("summer", "pre-frontal"): "Pre-frontal summer bass feed aggressively. Fish split between shallow morning patterns (2-6ft) and offshore structure (12-25ft). Target grass lines, points, and ledges as falling pressure triggers movement.",
    ("summer", "stable"): "Stable summer patterns are predictable. Dawn/dusk fish are shallow (3-8ft) near cover. Midday fish pull to offshore structure at 12-25ft — ledges, humps, brush piles, and creek channel bends.",
    ("summer", "post-frontal"): "Post-frontal summer fish retreat to reliable offshore structure at 12-25ft. They're less aggressive but still need to eat. Focus on primary structure — main lake points, ledges, and humps with shade or current.",
    ("fall", "pre-frontal"): "Pre-frontal fall bass are following shad into the backs of creeks. Fish can be anywhere from 3-18ft depending on bait position. Target creek arms, secondary points, and anywhere baitfish are concentrating.",
    ("fall", "stable"): "Stable fall conditions create the most predictable fall fishing. Bass follow shad migrations into creek arms and pockets, feeding at 3-15ft. Key on points at creek mouths and secondary flats where bait concentrates.",
    ("fall", "post-frontal"): "Post-frontal fall fish pull tighter to cover and deeper structure at 8-18ft. The shad migration pauses but doesn't stop. Focus on the deepest fish in a given creek arm — channel bends and main creek points.",
    ("winter", "pre-frontal"): "Pre-frontal winter bass stage at 12-25ft on main lake structure. Falling pressure before a front is often the best winter fishing window. Fish move slightly shallower and feed more aggressively than normal winter behavior.",
    ("winter", "stable"): "Stable winter conditions position bass at 15-35ft on main lake structure — bluffs, steep points, channel bends. Fish are lethargic and grouped tight. Vertical presentations directly on structure are essential.",
    ("winter", "post-frontal"): "Post-frontal winter is the toughest bite of the year. Fish retreat to the deepest structure available (20-35ft+) and barely move. Target steep structure where fish can access deep water without traveling — bluffs, vertical channel walls, bridge pilings.",
}

# Pressure-aware retrieve advice
PRESSURE_RETRIEVE = {
    "pre-frontal": "aggressive, faster retrieves — fish are feeding actively before the front",
    "stable": "moderate cadence — match the natural pace of local forage",
    "post-frontal": "slow down significantly — extended pauses, subtle movements, finesse presentations",
}

# Lure-specific pruning: which lure × condition combos are unrealistic
PRUNE_RULES = {
    "Walking Topwater": {"seasons_exclude": ["winter"], "clarities_exclude": ["muddy"], "pressures_exclude": ["post-frontal"]},
    "Suspending Jerkbait": {"clarities_exclude": ["muddy"]},
}


def load_all_enriched():
    """Load all enriched merged reviews."""
    all_data = {}
    for angler in ANGLERS:
        path = DATA_DIR / angler / "_merged-review-enriched.json"
        if path.exists():
            with open(path) as f:
                all_data[angler] = json.load(f)
    return all_data


def insight_mentions_lure(insight_text, lure_name):
    """Check if an insight's text mentions a specific lure."""
    text_lower = insight_text.lower()
    keywords = LURE_KEYWORDS.get(lure_name, [])
    return any(kw in text_lower for kw in keywords)


def matches_condition(entry, season, clarity, pressure, lure_name):
    """Score how well an entry matches the target lure + conditions. Higher = better."""
    c = entry.get("conditions", {})
    insight = entry.get("insight", "")
    score = 0

    # Season match
    entry_seasons = c.get("season", [])
    if isinstance(entry_seasons, str):
        entry_seasons = [entry_seasons]
    if season in entry_seasons:
        if len(entry_seasons) == 1:
            score += 4
        elif len(entry_seasons) == 2:
            score += 2

    # Clarity match
    if c.get("waterClarity") == clarity:
        score += 2

    # Lure-specific match: does this entry mention THIS lure?
    if insight_mentions_lure(insight, lure_name):
        score += 5  # Strong signal — entry is about this specific lure

    # Structure/cover/depth give bonus points
    if c.get("structure"):
        score += 1
    if c.get("depthZone"):
        score += 1
    if c.get("retrieveStyle"):
        score += 1
    if c.get("coverType"):
        score += 1

    return score


def retrieve_entries(all_data, season, clarity, pressure, lure_name, max_total=25, max_per_angler=5):
    """Retrieve knowledge entries matching the lure + condition combo."""
    scored_entries = []

    for angler, data in all_data.items():
        for entry in data.get("knowledge", []):
            score = matches_condition(entry, season, clarity, pressure, lure_name)
            if score >= 4:  # Require season match + lure mention, or strong multi-condition match
                scored_entries.append((score, angler, entry))

    scored_entries.sort(key=lambda x: -x[0])

    angler_counts = defaultdict(int)
    selected = []
    for score, angler, entry in scored_entries:
        if angler_counts[angler] >= max_per_angler:
            continue
        if len(selected) >= max_total:
            break
        selected.append((angler, entry))
        angler_counts[angler] += 1

    return selected


def retrieve_tips(all_data, season, clarity, lure_name):
    """Retrieve tipRules and colorRules from opinions for a specific lure."""
    tips = []
    colors = []

    for angler, data in all_data.items():
        opinion = data.get("opinions", {}).get(lure_name)
        if not opinion:
            continue

        for tip in opinion.get("tipRules", []):
            when = tip.get("when", {})
            tip_season = when.get("season")
            if tip_season:
                if isinstance(tip_season, str):
                    tip_season = [tip_season]
                if season not in tip_season:
                    continue
            tip_clarity = when.get("waterClarity")
            if tip_clarity and tip_clarity != clarity:
                continue
            tips.append({
                "angler": ANGLER_NAMES.get(angler, angler),
                "lure": lure_name,
                "tip": tip.get("tip", ""),
                "priority": tip.get("priority", 5),
            })

        for color in opinion.get("colorRules", []):
            when = color.get("when", {})
            color_season = when.get("season")
            if color_season:
                if isinstance(color_season, str):
                    color_season = [color_season]
                if season not in color_season:
                    continue
            color_clarity = when.get("waterClarity")
            if color_clarity and color_clarity != clarity:
                continue
            is_stained = when.get("isStained")
            if is_stained and clarity != "stained":
                continue
            colors.append({
                "angler": ANGLER_NAMES.get(angler, angler),
                "lure": lure_name,
                "color": color.get("color", ""),
                "priority": color.get("priority", 5),
            })

    tips.sort(key=lambda x: -x["priority"])
    colors.sort(key=lambda x: -x["priority"])
    return tips[:15], colors[:10]


def get_best_color(colors, clarity):
    """Get the best color for this lure."""
    if colors:
        return colors[0]["color"]
    defaults = {"clear": "Natural Shad", "stained": "Sexy Shad", "muddy": "Chartreuse/White"}
    return defaults.get(clarity, "Natural")


def get_best_tip(tips):
    """Get the best tip, return (tip_text, angler)."""
    if tips:
        return tips[0]["tip"], tips[0]["angler"]
    return None, None


def build_headline(season, clarity, pressure, lure_name):
    """Build a lure-specific headline."""
    pressure_tone = {"pre-frontal": "aggressive", "stable": "steady", "post-frontal": "finesse"}
    tone = pressure_tone.get(pressure, "")
    slug = lure_name.split("(")[0].strip()  # Clean display name
    return f"Rig up a {slug} — {tone} {season} approach for {clarity} water."


def build_retrieve_description(tips, pressure):
    """Build retrieve description from tips."""
    tip_text, _ = get_best_tip(tips)
    if tip_text:
        return tip_text[:200]
    return f"Match the conditions — {PRESSURE_RETRIEVE.get(pressure, 'moderate cadence')}."


def build_targets_description(entries, season):
    """Build targets description from entries."""
    structures = defaultdict(int)
    for angler, entry in entries:
        for s in entry.get("conditions", {}).get("structure", []):
            if isinstance(s, str):
                structures[s] += 1

    if structures:
        top = sorted(structures.items(), key=lambda x: -x[1])[:3]
        targets = ", ".join(s.replace("-", " ") for s, _ in top)
        return f"Focus on {targets}. Work the transitions and edges where structure changes."
    return "Target primary seasonal structure — work transitions between cover types."


def build_adjust_if(season, clarity, pressure, lure_name):
    """Build conditional adjustments — lure-specific."""
    adjustments = []

    if pressure == "pre-frontal":
        adjustments.append("If the front stalls and conditions stabilize, dial back aggression and focus on higher-percentage structure")
    elif pressure == "post-frontal":
        adjustments.append("If skies cloud up and wind picks up, re-introduce moving baits — the reprieve from high pressure activates fish")
    elif pressure == "stable":
        adjustments.append("If conditions suddenly shift (pressure drop, wind change), be ready to speed up your approach — transitional moments produce big bites")

    if clarity == "clear":
        adjustments.append("If water clarity decreases from wind or rain, upsize and switch to brighter colors")
    elif clarity == "stained":
        adjustments.append("If water clears significantly, downsize presentations and move to natural color patterns")
    elif clarity == "muddy":
        adjustments.append("If you find a cleaner pocket or tributary, switch to natural presentations — fish in cleaner water see more lures")

    # Lure-specific adjustments
    lure_lower = lure_name.lower()
    if "crankbait" in lure_lower or "crank" in lure_lower:
        adjustments.append("If fish are short-striking, add a long pause after deflections to let the lure suspend")
    elif "jerkbait" in lure_lower:
        adjustments.append("If fish follow but won't commit, extend your pause to 8-10 seconds and vary the cadence")
    elif "jig" in lure_lower and "swim" not in lure_lower:
        adjustments.append("If bites are subtle, try a lighter jig weight — slower fall rate can be the difference")
    elif "swim jig" in lure_lower or "spinnerbait" in lure_lower or "chatterbait" in lure_lower:
        adjustments.append("If moving baits aren't getting bit, slow down to a crawling retrieve or switch to a jig")
    elif "topwater" in lure_lower:
        adjustments.append("If fish are blowing up but not connecting, pause 3-5 seconds after each strike before resuming")
    elif "drop shot" in lure_lower or "ned" in lure_lower or "neko" in lure_lower or "shaky" in lure_lower:
        adjustments.append("If you get followers without commits, add scent or downsize your hook/weight")
    elif "texas" in lure_lower or "carolina" in lure_lower or "worm" in lure_lower:
        adjustments.append("If bites dry up, try shaking in place for 10-15 seconds before moving — patience pays with plastics")

    return adjustments


def generate_briefing(all_data, season, clarity, pressure, lure_name):
    """Generate a single lure-specific tactical briefing."""
    entries = retrieve_entries(all_data, season, clarity, pressure, lure_name)
    tips, colors = retrieve_tips(all_data, season, clarity, lure_name)

    best_color = get_best_color(colors, clarity)
    best_tip, best_source = get_best_tip(tips)
    if not best_source:
        best_source = "KVD"

    # Build a variation approach — second-best tip or different color
    alt_tip = tips[1]["tip"] if len(tips) > 1 else None
    alt_source = tips[1]["angler"] if len(tips) > 1 else "Wheeler"
    alt_color = colors[1]["color"] if len(colors) > 1 else best_color

    # Build pro insights from top entries
    pro_insights = []
    seen_anglers = set()
    for angler, entry in entries[:8]:
        name = ANGLER_NAMES.get(angler, angler)
        if name in seen_anglers:
            continue
        seen_anglers.add(name)
        insight_text = entry.get("insight", "")
        if len(insight_text) > 250:
            insight_text = insight_text[:247] + "..."
        pro_insights.append({"angler": name, "insight": insight_text})
        if len(pro_insights) >= 4:
            break

    depth_key = (season, pressure)
    depth_strategy = DEPTH_STRATEGIES.get(depth_key, f"{season} {pressure} — target structure at seasonal depth ranges.")

    # Build gameplan
    gameplan_parts = []
    display_name = lure_name.split("(")[0].strip()
    if entries:
        gameplan_parts.append(f"The {display_name} is a strong choice for {season} with {clarity} water and {pressure.replace('-', ' ')} conditions.")
        if best_tip:
            gameplan_parts.append(best_tip[:300])
        gameplan_parts.append(f"Key adjustment for {pressure.replace('-', ' ')}: {PRESSURE_RETRIEVE.get(pressure, 'moderate cadence')}.")
    else:
        gameplan_parts.append(f"Fish a {display_name} in {season} with {clarity} water under {pressure.replace('-', ' ')} conditions.")
        gameplan_parts.append(f"Focus on {PRESSURE_RETRIEVE.get(pressure, 'matching local forage pace')}.")

    gameplan = "\n\n".join(gameplan_parts)
    headline = build_headline(season, clarity, pressure, lure_name)
    targets = build_targets_description(entries, season)
    adjust_if = build_adjust_if(season, clarity, pressure, lure_name)

    briefing = {
        "conditions": {
            "season": season,
            "waterClarity": clarity,
            "pressureState": pressure,
            "lure": lure_name,
        },
        "briefing": {
            "headline": headline,
            "gameplan": gameplan,
            "primaryApproach": {
                "lure": lure_name,
                "color": best_color,
                "retrieve": build_retrieve_description(tips, pressure),
                "targets": targets,
                "proSource": best_source,
            },
            "alternateApproach": {
                "lure": lure_name,
                "color": alt_color,
                "retrieve": alt_tip[:200] if alt_tip else f"Variation — {PRESSURE_RETRIEVE.get(pressure, '')}.",
                "targets": targets,
                "proSource": alt_source,
            },
            "proInsights": pro_insights,
            "depthStrategy": depth_strategy,
            "adjustIf": adjust_if,
        },
    }

    return briefing


def is_pruned(season, clarity, pressure, lure_name):
    """Check if this lure × condition combo should be skipped."""
    rules = PRUNE_RULES.get(lure_name, {})
    if season in rules.get("seasons_exclude", []):
        return True
    if clarity in rules.get("clarities_exclude", []):
        return True
    if pressure in rules.get("pressures_exclude", []):
        return True
    return False


def get_all_combos():
    """Generate all valid lure × condition combos after pruning."""
    combos = []
    for s in SEASONS:
        for c in CLARITIES:
            for p in PRESSURES:
                for lure in LURES:
                    if not is_pruned(s, c, p, lure):
                        combos.append((s, c, p, lure))
    return combos


def main():
    parser = argparse.ArgumentParser(description="Generate lure-level tactical briefings from enriched knowledge")
    parser.add_argument("--all", action="store_true", help="Generate all briefings")
    parser.add_argument("--combos", nargs="+", help="Specific combo keys (season_clarity_pressure_lure-slug)")
    parser.add_argument("--dry-run", action="store_true", help="Show combos without generating")
    args = parser.parse_args()

    if not args.all and not args.combos:
        parser.print_help()
        sys.exit(1)

    # Build reverse slug lookup
    slug_to_lure = {v: k for k, v in LURE_SLUGS.items()}

    if args.all:
        combos = get_all_combos()
    else:
        combos = []
        for key in args.combos:
            parts = key.split("_")
            if len(parts) >= 4:
                s, c, p = parts[0], parts[1], parts[2]
                lure_slug = "_".join(parts[3:])
                lure_name = slug_to_lure.get(lure_slug)
                if lure_name:
                    combos.append((s, c, p, lure_name))
                else:
                    print(f"Unknown lure slug: {lure_slug}")
            else:
                print(f"Invalid combo key: {key}")

    print(f"Generating {len(combos)} briefings...")

    if args.dry_run:
        for s, c, p, lure in combos:
            slug = LURE_SLUGS[lure]
            print(f"  {s}_{c}_{p}_{slug}")
        return

    print("Loading enriched knowledge...")
    all_data = load_all_enriched()
    print(f"Loaded {sum(len(d.get('knowledge', [])) for d in all_data.values())} entries from {len(all_data)} anglers")

    BRIEFINGS_DIR.mkdir(parents=True, exist_ok=True)

    all_briefings = []
    index = {}

    for i, (s, c, p, lure) in enumerate(combos):
        slug = LURE_SLUGS[lure]
        key = f"{s}_{c}_{p}_{slug}"
        if (i + 1) % 50 == 0 or i == 0:
            print(f"  [{i+1}/{len(combos)}] {key}")

        briefing = generate_briefing(all_data, s, c, p, lure)

        filepath = BRIEFINGS_DIR / f"{key}.json"
        with open(filepath, "w") as f:
            json.dump(briefing, f, indent=2, ensure_ascii=False)

        all_briefings.append(briefing)
        index[key] = f"{key}.json"

    # Write index
    index_path = BRIEFINGS_DIR / "_index.json"
    with open(index_path, "w") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    # Write bundle
    bundle = {
        "generated": str(date.today()),
        "count": len(all_briefings),
        "briefings": all_briefings,
    }
    bundle_path = BRIEFINGS_DIR / "briefings-bundle.json"
    with open(bundle_path, "w") as f:
        json.dump(bundle, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Generated {len(all_briefings)} briefings")
    print(f"  Individual files: {BRIEFINGS_DIR}/")
    print(f"  Index: {index_path}")
    print(f"  Bundle: {bundle_path} ({bundle_path.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
