#!/usr/bin/env python3
"""Generate tactical briefings from enriched knowledge entries.
No API key required — generates briefings by retrieving and organizing
enriched knowledge entries into structured tactical advice.

For higher quality narrative generation, pipe the retrieved context through
Claude using generate-briefings.py instead.

Usage:
    python3 scripts/generate-briefings-local.py --all
    python3 scripts/generate-briefings-local.py --combos pre-spawn_stained_post-frontal_cranking
"""

import argparse
import json
import sys
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
CATEGORIES = ["cranking", "finesse", "jigs", "moving-baits", "topwater", "reaction", "soft-plastics"]

# Lure category -> specific lure names
CATEGORY_LURES = {
    "cranking": ["Squarebill Crankbait", "Medium Diving Crankbait", "Deep Diving Crankbait",
                 "Lipless Crankbait", "Suspending Jerkbait"],
    "finesse": ["Drop Shot", "Ned Rig", "Neko Rig", "Shakyhead", "Spy Bait"],
    "jigs": ["Flipping Jig", "Structure Jig", "Football Jig", "Hair Jig / Finesse Jig",
             "Crawfish Pattern Jig"],
    "moving-baits": ["Swim Jig", "Spinnerbait (Colorado/Willow)", "Chatterbait", "Strolling Rig"],
    "topwater": ["Walking Topwater", "Buzzbait"],
    "reaction": ["Blade Bait", "Jigging Spoon"],
    "soft-plastics": ["Texas Rig (Creature Bait)", "Carolina Rig", '10" Worm (Shakey/TX)'],
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


def load_all_enriched():
    """Load all enriched merged reviews."""
    all_data = {}
    for angler in ANGLERS:
        path = DATA_DIR / angler / "_merged-review-enriched.json"
        if path.exists():
            with open(path) as f:
                all_data[angler] = json.load(f)
    return all_data


def matches_condition(entry_conditions, season, clarity, pressure, category):
    """Score how well an entry matches the target conditions. Higher = better."""
    score = 0
    c = entry_conditions

    # Season match — penalize entries tagged with many seasons (likely comparative/overview)
    entry_seasons = c.get("season", [])
    if isinstance(entry_seasons, str):
        entry_seasons = [entry_seasons]
    if season in entry_seasons:
        if len(entry_seasons) == 1:
            score += 4  # Strong match — entry is specifically about this season
        elif len(entry_seasons) == 2:
            score += 2  # Moderate — entry spans two seasons
        else:
            score += 0  # Weak — entry mentions 3+ seasons, likely comparative text

    # Clarity match
    entry_clarity = c.get("waterClarity")
    if entry_clarity == clarity:
        score += 2

    # Lure category match
    entry_cat = c.get("lureCategory")
    if entry_cat == category:
        score += 3

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


def retrieve_entries(all_data, season, clarity, pressure, category, max_total=25, max_per_angler=5):
    """Retrieve knowledge entries matching the condition combo."""
    scored_entries = []

    for angler, data in all_data.items():
        for entry in data.get("knowledge", []):
            conditions = entry.get("conditions", {})
            score = matches_condition(conditions, season, clarity, pressure, category)
            if score >= 3:  # Require meaningful relevance (season match + something else)
                scored_entries.append((score, angler, entry))

    # Sort by score descending
    scored_entries.sort(key=lambda x: -x[0])

    # Cap per angler
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


def retrieve_tips(all_data, season, clarity, category):
    """Retrieve tipRules and colorRules from opinions matching the conditions."""
    tips = []
    colors = []
    lures_in_category = CATEGORY_LURES.get(category, [])

    for angler, data in all_data.items():
        for lure_name, opinion in data.get("opinions", {}).items():
            if lure_name not in lures_in_category:
                continue

            for tip in opinion.get("tipRules", []):
                when = tip.get("when", {})
                # Check if tip matches our conditions
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


def pick_primary_lure(category, season, clarity, tips, colors, entries):
    """Pick the best primary lure for this combo based on available evidence."""
    lures = CATEGORY_LURES.get(category, [])
    if not lures:
        return lures[0] if lures else category

    # Score lures by how many tips/colors/entries mention them
    lure_scores = defaultdict(int)
    for tip in tips:
        lure_scores[tip["lure"]] += tip["priority"]
    for color in colors:
        lure_scores[color["lure"]] += color["priority"]
    for angler, entry in entries:
        insight = entry.get("insight", "").lower()
        for lure in lures:
            if lure.lower().split("(")[0].strip().lower() in insight:
                lure_scores[lure] += 2

    if lure_scores:
        return max(lure_scores, key=lure_scores.get)
    return lures[0]


def pick_alternate_lure(category, primary, tips, colors, entries):
    """Pick an alternate lure different from primary."""
    lures = CATEGORY_LURES.get(category, [])
    remaining = [l for l in lures if l != primary]
    if not remaining:
        return None

    lure_scores = defaultdict(int)
    for tip in tips:
        if tip["lure"] != primary:
            lure_scores[tip["lure"]] += tip["priority"]
    for color in colors:
        if color["lure"] != primary:
            lure_scores[color["lure"]] += color["priority"]

    scored_remaining = [(lure_scores.get(l, 0), l) for l in remaining]
    scored_remaining.sort(key=lambda x: -x[0])
    return scored_remaining[0][1] if scored_remaining else remaining[0]


def get_best_color(lure, colors, clarity):
    """Get the best color for a lure."""
    for c in colors:
        if c["lure"] == lure:
            return c["color"]
    # Defaults by clarity
    defaults = {
        "clear": "Natural Shad",
        "stained": "Sexy Shad",
        "muddy": "Chartreuse/White",
    }
    return defaults.get(clarity, "Natural")


def get_best_tip(lure, tips):
    """Get the best tip for a lure, return (tip_text, angler)."""
    for t in tips:
        if t["lure"] == lure:
            return t["tip"], t["angler"]
    return None, None


def build_headline(season, clarity, pressure, category, primary_lure, primary_retrieve):
    """Build a punchy headline."""
    pressure_tone = {
        "pre-frontal": "aggressive",
        "stable": "steady",
        "post-frontal": "finesse",
    }
    tone = pressure_tone.get(pressure, "")

    # Category-specific headlines
    headlines = {
        "cranking": f"Crank it — {season} {clarity} water calls for {tone} cranking on key structure.",
        "finesse": f"Go small, go slow — {season} {clarity} conditions demand finesse presentations.",
        "jigs": f"Pitch it tight — {season} {clarity} water puts a jig in its best element.",
        "moving-baits": f"Cover water — {season} {clarity} conditions reward moving baits that trigger reaction strikes.",
        "topwater": f"Go over the top — {season} {clarity} water sets up explosive topwater action.",
        "reaction": f"Vertical and precise — {season} {clarity} conditions call for reaction baits on deep structure.",
        "soft-plastics": f"Slow and natural — {season} {clarity} water is prime soft plastic territory.",
    }
    return headlines.get(category, f"{season} {clarity} {pressure} — {category}")


def build_retrieve_description(tips, lure, pressure):
    """Build retrieve description from tips."""
    tip_text, _ = get_best_tip(lure, tips)
    if tip_text:
        # Extract just the retrieve portion if possible
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


def build_adjust_if(season, clarity, pressure, category):
    """Build conditional adjustments."""
    adjustments = []

    if pressure == "pre-frontal":
        adjustments.append("If the front stalls and conditions stabilize, dial back aggression and focus on higher-percentage structure")
    elif pressure == "post-frontal":
        adjustments.append("If skies cloud up and wind picks up, re-introduce moving baits — the reprieve from high pressure activates fish")
    elif pressure == "stable":
        adjustments.append("If conditions suddenly shift (pressure drop, wind change), be ready to speed up your approach — transitional moments produce big bites")

    if clarity == "clear":
        adjustments.append("If water clarity decreases from wind or rain, upsize lures and switch to brighter colors")
    elif clarity == "stained":
        adjustments.append("If water clears significantly, downsize presentations and move to natural color patterns")
    elif clarity == "muddy":
        adjustments.append("If you find a cleaner pocket or tributary, switch to natural presentations — fish in cleaner water see more lures")

    if category == "cranking":
        adjustments.append("If fish are short-striking, add a long pause after deflections to let the lure suspend")
    elif category == "finesse":
        adjustments.append("If you get followers without commits, add scent or downsize your hook/weight")
    elif category == "jigs":
        adjustments.append("If bites are subtle, try a lighter jig weight — slower fall rate can be the difference")
    elif category == "moving-baits":
        adjustments.append("If moving baits aren't getting bit, slow down to a crawling retrieve or switch to a jig")
    elif category == "topwater":
        adjustments.append("If fish are blowing up but not connecting, pause 3-5 seconds after each strike before resuming")
    elif category == "soft-plastics":
        adjustments.append("If bites dry up, try shaking in place for 10-15 seconds before moving — patience pays with plastics")

    return adjustments


def generate_briefing(all_data, season, clarity, pressure, category):
    """Generate a single tactical briefing."""
    entries = retrieve_entries(all_data, season, clarity, pressure, category)
    tips, colors = retrieve_tips(all_data, season, clarity, category)

    primary_lure = pick_primary_lure(category, season, clarity, tips, colors, entries)
    alternate_lure = pick_alternate_lure(category, primary_lure, tips, colors, entries)

    primary_color = get_best_color(primary_lure, colors, clarity)
    primary_tip, primary_source = get_best_tip(primary_lure, tips)
    if not primary_source:
        primary_source = "KVD"  # Default attribution

    alt_color = get_best_color(alternate_lure, colors, clarity) if alternate_lure else ""
    alt_tip, alt_source = get_best_tip(alternate_lure, tips) if alternate_lure else (None, None)
    if not alt_source:
        alt_source = "Wheeler"

    # Build pro insights from top entries
    pro_insights = []
    seen_anglers = set()
    for angler, entry in entries[:6]:
        name = ANGLER_NAMES.get(angler, angler)
        if name in seen_anglers:
            continue
        seen_anglers.add(name)
        insight_text = entry.get("insight", "")
        # Trim to a reasonable length
        if len(insight_text) > 250:
            insight_text = insight_text[:247] + "..."
        pro_insights.append({"angler": name, "insight": insight_text})
        if len(pro_insights) >= 4:
            break

    # Build gameplan
    depth_key = (season, pressure)
    depth_strategy = DEPTH_STRATEGIES.get(depth_key, f"{season} {pressure} — target structure at seasonal depth ranges.")

    gameplan_parts = []
    if entries:
        # Extract key themes from entries
        gameplan_parts.append(f"In {season} with {clarity} water and {pressure.replace('-', ' ')} conditions, {category.replace('-', ' ')} presentations shine.")
        if primary_tip:
            gameplan_parts.append(primary_tip[:300])
        gameplan_parts.append(f"Key adjustment for {pressure.replace('-', ' ')}: {PRESSURE_RETRIEVE.get(pressure, 'moderate cadence')}.")
    else:
        gameplan_parts.append(f"{category.replace('-', ' ').title()} in {season} with {clarity} water under {pressure.replace('-', ' ')} conditions.")
        gameplan_parts.append(f"Focus on {PRESSURE_RETRIEVE.get(pressure, 'matching local forage pace')}.")

    gameplan = "\n\n".join(gameplan_parts)

    headline = build_headline(season, clarity, pressure, category, primary_lure, "")
    targets = build_targets_description(entries, season)
    adjust_if = build_adjust_if(season, clarity, pressure, category)

    briefing = {
        "conditions": {
            "season": season,
            "waterClarity": clarity,
            "pressureState": pressure,
            "lureCategory": category,
        },
        "briefing": {
            "headline": headline,
            "gameplan": gameplan,
            "primaryApproach": {
                "lure": primary_lure,
                "color": primary_color,
                "retrieve": build_retrieve_description(tips, primary_lure, pressure),
                "targets": targets,
                "proSource": primary_source,
            },
            "alternateApproach": {
                "lure": alternate_lure or CATEGORY_LURES.get(category, [""])[0],
                "color": alt_color or "Natural",
                "retrieve": build_retrieve_description(tips, alternate_lure, pressure) if alternate_lure else f"Moderate retrieve — {PRESSURE_RETRIEVE.get(pressure, '')}.",
                "targets": targets,
                "proSource": alt_source,
            },
            "proInsights": pro_insights,
            "depthStrategy": depth_strategy,
            "adjustIf": adjust_if,
        },
    }

    return briefing


def get_all_combos():
    """Generate all valid condition combos after pruning."""
    combos = []
    for s in SEASONS:
        for c in CLARITIES:
            for p in PRESSURES:
                for cat in CATEGORIES:
                    if cat == "topwater" and s == "winter": continue
                    if cat == "topwater" and c == "muddy": continue
                    if cat == "topwater" and p == "post-frontal": continue
                    if cat == "reaction" and s == "summer": continue
                    if cat == "reaction" and s == "spawn": continue
                    combos.append((s, c, p, cat))
    return combos


def main():
    parser = argparse.ArgumentParser(description="Generate tactical briefings from enriched knowledge")
    parser.add_argument("--all", action="store_true", help="Generate all briefings")
    parser.add_argument("--combos", nargs="+", help="Specific combo keys (season_clarity_pressure_category)")
    parser.add_argument("--dry-run", action="store_true", help="Show combos without generating")
    args = parser.parse_args()

    if not args.all and not args.combos:
        parser.print_help()
        sys.exit(1)

    if args.all:
        combos = get_all_combos()
    else:
        combos = []
        for key in args.combos:
            parts = key.split("_")
            if len(parts) == 4:
                combos.append(tuple(parts))
            else:
                print(f"Invalid combo key: {key}")

    print(f"Generating {len(combos)} briefings...")

    if args.dry_run:
        for s, c, p, cat in combos:
            print(f"  {s}_{c}_{p}_{cat}")
        return

    # Load enriched data
    print("Loading enriched knowledge...")
    all_data = load_all_enriched()
    print(f"Loaded {sum(len(d.get('knowledge', [])) for d in all_data.values())} entries from {len(all_data)} anglers")

    BRIEFINGS_DIR.mkdir(parents=True, exist_ok=True)

    all_briefings = []
    index = {}

    for i, (s, c, p, cat) in enumerate(combos):
        key = f"{s}_{c}_{p}_{cat}"
        if (i + 1) % 25 == 0 or i == 0:
            print(f"  [{i+1}/{len(combos)}] {key}")

        briefing = generate_briefing(all_data, s, c, p, cat)

        # Write individual file
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
        "generated": "2026-03-13",
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
