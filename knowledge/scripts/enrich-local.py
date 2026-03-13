#!/usr/bin/env python3
"""Enrich condition tags on all angler knowledge entries using keyword extraction.
No API key required — runs entirely locally with regex-based text analysis.
"""

import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DATA_DIR = KNOWLEDGE_DIR / "data" / "extracted"

ANGLERS = ["wheeler", "yamamoto", "hackney", "johnston", "kvd", "palaniuk", "robertson"]

# --- Standardized vocabulary ---

LURE_CATEGORIES = {
    "cranking": ["squarebill crankbait", "medium diving crankbait", "deep diving crankbait",
                 "lipless crankbait", "suspending jerkbait", "crankbait", "jerkbait",
                 "flatside", "hardliner", "gravel dog", "3xd", "5xd", "6xd", "8xd", "10xd",
                 "series 3", "series 5", "red eye shad", "chick magnet", "wake shad",
                 "dredger", "frittside", "big john"],
    "finesse": ["drop shot", "ned rig", "neko rig", "shakyhead", "shaky head", "spy bait",
                "wacky rig", "finesse worm", "spinbait"],
    "jigs": ["flipping jig", "structure jig", "football jig", "hair jig", "finesse jig",
             "crawfish pattern jig", "jig-and-pig", "hack attack", "mini flipping jig"],
    "moving-baits": ["swim jig", "spinnerbait", "chatterbait", "strolling rig", "swimbait",
                     "bladed jig", "thunder cricket", "rage blade", "vibrating jig",
                     "paddle tail", "freeloader"],
    "topwater": ["walking topwater", "buzzbait", "frog", "popper", "topwater",
                 "sexy dawg", "sexy frog", "chugger", "wakebait", "x-rap pop"],
    "reaction": ["blade bait", "jigging spoon", "jigging rap"],
    "soft-plastics": ["texas rig", "carolina rig", "worm", "creature bait", "tube", "senko",
                      "ocho", "game hawg", "punch bug", "lizard", "bullworm", "punch out craw",
                      "brush hog", "rage craw"]
}

RETRIEVE_STYLES = {
    "burn": ["burn", "burning", "reel fast", "reel as fast", "fast retrieve", "speed up",
             "high speed"],
    "slow-roll": ["slow-roll", "slow roll", "slow rolling", "barely turn the handle", "crawl",
                  "slow retrieve", "slow crank"],
    "stop-and-go": ["stop-and-go", "stop and go", "stop-and-start", "pause",
                    "pump-and-stop", "pump and stop", "bump cover", "deflect"],
    "drag": ["drag", "dragging", "scoot", "scooting", "deadstick", "dead stick",
             "dead-stick", "drag along"],
    "hop": ["hop", "hopping", "short hop", "yo-yo", "lift-and-drop", "lift and drop",
            "rip", "ripping", "stroke"],
    "twitch": ["twitch", "twitching", "jerk", "jerking", "snap", "snapping",
               "cadence", "walk the dog"],
    "steady": ["steady", "straight retrieve", "just reel", "wind it", "constant speed"]
}

COVER_TYPES = {
    "grass": ["grass", "hydrilla", "milfoil", "coontail", "vegetation", "weed", "pad",
              "lily pad", "eel grass", "pepper grass", "eelgrass", "mat", "matted"],
    "wood": ["wood", "laydown", "log", "brush", "stump", "timber", "tree", "bush",
             "limb", "branch", "blow down", "blowdown"],
    "rock": ["rock", "riprap", "chunk rock", "gravel", "boulder", "bridge piling",
             "rip rap", "chunk-rock"],
    "dock": ["dock", "boat dock", "floating dock", "piling", "pontoon", "catwalk",
             "pier", "seawall"],
    "open": ["open water", "suspended", "no cover"]
}

LURE_TO_CATEGORY = {
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
    "10\" Worm (Shakey/TX)": "soft-plastics",
}


def extract_seasons(text):
    t = text.lower()
    found = []
    if "pre-spawn" in t or "prespawn" in t or "pre spawn" in t:
        found.append("pre-spawn")
    if "post-spawn" in t or "postspawn" in t or "post spawn" in t:
        found.append("post-spawn")
    # Only add "spawn" if it's specifically about bass spawning, not shad/bluegill spawn
    if re.search(r'\bspawn\b', t) and "pre-spawn" not in found and "post-spawn" not in found:
        if not any(x in t for x in ["shad spawn", "bluegill spawn", "bream spawn"]):
            if any(x in t for x in ["spawning bass", "on beds", "on a bed", "spawn fishing",
                                      "during spawn", "the spawn", "near spawn", "around the spawn",
                                      "spawning flat", "spawning area", "spawning cove",
                                      "bass spawn", "bed fish", "bedding"]):
                found.append("spawn")
    if re.search(r'\bsummer\b', t) or "dog days" in t or "hot water" in t or "summertime" in t:
        found.append("summer")
    if re.search(r'\bfall\b', t):
        # Avoid "fall" as in falling/dropping
        if any(x in t for x in ["fall pattern", "fall bait", "fall fishing", "fall transition",
                                  "in fall", "early fall", "late fall", "fall migration",
                                  "into fall", "this fall", "in the fall", "fall forage",
                                  "fall topwater", "fall crankbait", "fall cranking",
                                  "fall smallmouth", "fall afternoon", "fall color",
                                  "fall is", "fall season", "mid fall", "mid-fall"]):
            found.append("fall")
    if re.search(r'\bwinter\b', t) or "cold water" in t or "frigid" in t or "ice-out" in t:
        found.append("winter")
    return list(set(found))


def extract_water_clarity(text):
    t = text.lower()
    if any(x in t for x in ["muddy", "dirty water", "murky", "high and muddy", "mud-stained"]):
        return "muddy"
    if any(x in t for x in ["stained", "off-colored", "off colored", "tannin"]):
        return "stained"
    if any(x in t for x in ["clear water", "clear lake", "crystal clear", "ultra-clear",
                              "clearer water", "gin clear", "gin-clear", "super clear"]):
        return "clear"
    return None


def extract_structures(text):
    t = text.lower()
    found = []
    if any(x in t for x in ["main lake point", "secondary point", "on a point", "tapering point",
                              "rocky point", "shallow point", "off point", "the point",
                              "gravel point", "clay point"]) or (re.search(r'\bpoints\b', t)):
        found.append("point")
    if "bluff" in t:
        found.append("bluff")
    if any(x in t for x in ["grass", "hydrilla", "milfoil", "coontail", "vegetation",
                              "weed edge", "weed line", "weedline", "eel grass",
                              "pepper grass", "lily pad", "pad stem", "eelgrass"]):
        found.append("grass")
    if re.search(r'\bflats?\b', t) and "flat side" not in t and "flatside" not in t:
        found.append("flat")
    if any(x in t for x in ["dock", "docks", "boat dock", "floating dock"]):
        found.append("dock")
    if any(x in t for x in ["creek channel", "creek arm", "channel swing", "creek back",
                              "tributary", "drain", "ditch"]):
        found.append("creek-channel")
    if any(x in t for x in ["hump", "humps", "offshore hump"]):
        found.append("hump")
    if any(x in t for x in ["riprap", "rip rap", "rip-rap"]):
        found.append("riprap")
    if any(x in t for x in ["laydown", "lay down", "fallen tree", "blowdown", "blow down"]):
        found.append("laydown")
    if any(x in t for x in ["ledge", "ledges", "offshore ledge"]):
        found.append("ledge")
    return list(set(found))


def extract_depth_zone(text):
    t = text.lower()
    depths = re.findall(r'(\d+)[\s-]*(?:ft|feet|foot)', t)
    if depths:
        vals = [int(d) for d in depths]
        min_d = min(vals)
        max_d = max(vals)
        if max_d <= 5:
            return "shallow"
        elif min_d >= 12:
            return "deep"
        elif min_d >= 5 or max_d <= 12:
            return "mid"
    if any(x in t for x in ["ultra-shallow", "dirt shallow", "super shallow",
                              "inches of water", "ankle deep", "knee deep"]):
        return "shallow"
    if any(x in t for x in ["deep crank", "deep diving", "deep water", "offshore",
                              "deep structure", "deep bream", "bottom bounc"]):
        return "deep"
    return None


def extract_lure_category(text):
    t = text.lower()
    scores = {}
    for cat, keywords in LURE_CATEGORIES.items():
        for kw in keywords:
            if kw in t:
                scores[cat] = scores.get(cat, 0) + 1
    if scores:
        return max(scores, key=scores.get)
    return None


def extract_retrieve_style(text):
    t = text.lower()
    scores = {}
    for style, keywords in RETRIEVE_STYLES.items():
        for kw in keywords:
            if kw in t:
                scores[style] = scores.get(style, 0) + 1
    if scores:
        return max(scores, key=scores.get)
    return None


def extract_cover_type(text):
    t = text.lower()
    scores = {}
    for cover, keywords in COVER_TYPES.items():
        for kw in keywords:
            if kw in t:
                scores[cover] = scores.get(cover, 0) + 1
    if scores:
        best = max(scores, key=scores.get)
        if best == "open" and len(scores) > 1:
            del scores["open"]
            return max(scores, key=scores.get)
        return best
    return None


def union_arrays(existing, new):
    if not existing:
        return new
    if not new:
        return existing
    result = list(existing) if isinstance(existing, list) else [existing]
    for item in new:
        if item not in result:
            result.append(item)
    return result


def enrich_entry(entry):
    insight = entry.get("insight", "")
    conditions = entry.get("conditions", {})
    if conditions is None:
        conditions = {}

    new_seasons = extract_seasons(insight)
    new_clarity = extract_water_clarity(insight)
    new_structures = extract_structures(insight)
    new_depth = extract_depth_zone(insight)
    new_lure_cat = extract_lure_category(insight)
    new_retrieve = extract_retrieve_style(insight)
    new_cover = extract_cover_type(insight)

    # Merge season (array field)
    existing_season = conditions.get("season")
    if existing_season:
        if isinstance(existing_season, str):
            existing_season = [existing_season]
    else:
        existing_season = []
    merged_seasons = union_arrays(existing_season, new_seasons)
    if merged_seasons:
        conditions["season"] = merged_seasons

    # Merge waterClarity
    if new_clarity and "waterClarity" not in conditions:
        conditions["waterClarity"] = new_clarity

    # Merge structure (array field)
    existing_struct = conditions.get("structure")
    if existing_struct:
        if isinstance(existing_struct, str):
            existing_struct = [existing_struct]
    else:
        existing_struct = []
    merged_struct = union_arrays(existing_struct, new_structures)
    if merged_struct:
        conditions["structure"] = merged_struct

    # Scalar fields — don't overwrite existing
    if new_depth and "depthZone" not in conditions:
        conditions["depthZone"] = new_depth
    if new_lure_cat and "lureCategory" not in conditions:
        conditions["lureCategory"] = new_lure_cat
    if new_retrieve and "retrieveStyle" not in conditions:
        conditions["retrieveStyle"] = new_retrieve
    if new_cover and "coverType" not in conditions:
        conditions["coverType"] = new_cover

    entry["conditions"] = conditions
    return entry


def enrich_opinions(opinions):
    for lure_name, opinion in opinions.items():
        if "lureCategory" not in opinion:
            cat = LURE_TO_CATEGORY.get(lure_name)
            if cat:
                opinion["lureCategory"] = cat
            else:
                ln = lure_name.lower()
                for cat_name, keywords in LURE_CATEGORIES.items():
                    for kw in keywords:
                        if kw in ln:
                            opinion["lureCategory"] = cat_name
                            break
                    if "lureCategory" in opinion:
                        break
    return opinions


def process_angler(angler):
    input_path = DATA_DIR / angler / "_merged-review.json"
    output_path = DATA_DIR / angler / "_merged-review-enriched.json"

    if not input_path.exists():
        print(f"  SKIP: {input_path} not found")
        return

    with open(input_path) as f:
        data = json.load(f)

    knowledge = data.get("knowledge", [])
    for entry in knowledge:
        enrich_entry(entry)
    data["knowledge"] = knowledge

    opinions = data.get("opinions", {})
    enrich_opinions(opinions)
    data["opinions"] = opinions

    with open(output_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Stats
    tags = {"season": 0, "waterClarity": 0, "structure": 0, "depthZone": 0,
            "lureCategory": 0, "retrieveStyle": 0, "coverType": 0}
    for entry in knowledge:
        c = entry.get("conditions", {})
        for tag in tags:
            if tag in c and c[tag]:
                tags[tag] += 1

    opinion_cats = sum(1 for o in opinions.values() if "lureCategory" in o)

    print(f"  {angler}: {len(knowledge)} entries enriched -> {output_path.name}")
    for tag, count in tags.items():
        pct = 100 * count // len(knowledge) if knowledge else 0
        print(f"    {tag}: {count}/{len(knowledge)} ({pct}%)")
    print(f"    opinions with lureCategory: {opinion_cats}/{len(opinions)}")


def main():
    anglers = sys.argv[1:] if len(sys.argv) > 1 else ANGLERS
    print(f"Enriching {len(anglers)} anglers...\n")
    for angler in anglers:
        process_angler(angler)
        print()
    print("Done!")


if __name__ == "__main__":
    main()
