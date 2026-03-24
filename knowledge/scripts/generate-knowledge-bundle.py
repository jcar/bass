#!/usr/bin/env python3
"""Generate knowledge-bundle.json from all extracted angler knowledge entries.

Reads all /data/extracted/<angler>/*.json files, extracts each `knowledge`
entry, attaches anglerName and source, and indexes by lure, category, and angler.

Usage:
    python3 scripts/generate-knowledge-bundle.py

Output: ../strikezone/src/data/knowledge-bundle.json
"""

import json
import sys
from pathlib import Path

# ─── Resolve paths ───────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
DATA_DIR = KNOWLEDGE_DIR / "data" / "extracted"
OUTPUT_PATH = KNOWLEDGE_DIR.parent / "strikezone" / "src" / "data" / "knowledge-bundle.json"

ANGLERS = ["hackney", "johnston", "kvd", "palaniuk", "robertson", "wheeler", "yamamoto"]

# Keywords to detect lure mentions in insight text (for lure indexing)
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
                     "vibrating jig"],
    "Swim Jig": ["swim jig", "swimming jig", "swim-jig"],
    "Flipping Jig": ["flipping jig", "flip jig", "hack attack", "punch rig", "flipping", "pitching"],
    "Football Jig": ["football jig", "football head"],
    "Texas Rig (Creature Bait)": ["texas rig", "texas-rig", "creature bait", "rage craw", "brush hog",
                                   "game hawg"],
    "Carolina Rig": ["carolina rig", "carolina-rig", "c-rig"],
    '10" Worm (Shakey/TX)': ["10 inch worm", "10-inch worm", "big worm", "ribbon tail", "magnum worm"],
    "Drop Shot": ["drop shot", "dropshot", "drop-shot"],
    "Ned Rig": ["ned rig", "ned-rig"],
    "Neko Rig": ["neko rig", "neko-rig", "nail weight"],
    "Shakyhead": ["shakyhead", "shaky head", "shaky-head", "shakeyhead"],
    "Walking Topwater": ["walking topwater", "topwater", "sexy dawg", "zara spook", "walk the dog"],
}


def detect_lures_in_text(text):
    """Return list of lure names mentioned in the text."""
    text_lower = text.lower()
    found = []
    for lure_name, keywords in LURE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            found.append(lure_name)
    return found


def main():
    all_entries = []

    for angler_id in ANGLERS:
        angler_dir = DATA_DIR / angler_id
        if not angler_dir.is_dir():
            print(f"  Skipping {angler_id} — directory not found", file=sys.stderr)
            continue

        files = sorted(angler_dir.glob("*.json"))
        count = 0
        for f in files:
            if f.name.startswith("_"):
                continue  # skip _merged-review.json etc.
            try:
                data = json.loads(f.read_text())
            except (json.JSONDecodeError, OSError) as e:
                print(f"  Warning: skipping {f.name}: {e}", file=sys.stderr)
                continue

            angler_name = data.get("anglerName", angler_id.upper())
            source = data.get("source", f.name)

            for entry in data.get("knowledge", []):
                insight = entry.get("insight", "")
                record = {
                    "angler": angler_name,
                    "anglerId": angler_id,
                    "category": entry.get("category", "general"),
                    "topic": entry.get("topic", ""),
                    "insight": insight,
                    "source": source,
                }
                # Attach lure from conditions if present
                conditions = entry.get("conditions", {})
                if conditions.get("lure"):
                    record["lure"] = conditions["lure"]
                if conditions.get("season"):
                    record["season"] = conditions["season"]

                # Detect lures mentioned in the insight text
                record["lures"] = detect_lures_in_text(insight)

                all_entries.append(record)
                count += 1

        print(f"  {angler_id}: {count} knowledge entries from {len(files)} files")

    # ─── Build indexes ────────────────────────────────────────────────────────
    by_lure = {}
    by_category = {}
    by_angler = {}

    for entry in all_entries:
        # Compact entry for the bundle (drop anglerId to save space in lure/category indexes)
        compact = {
            "angler": entry["angler"],
            "anglerId": entry["anglerId"],
            "category": entry["category"],
            "topic": entry["topic"],
            "insight": entry["insight"],
            "source": entry["source"],
        }
        if "lure" in entry:
            compact["lure"] = entry["lure"]
        if "season" in entry:
            compact["season"] = entry["season"]

        # Index by lure — both explicit lure field and detected lure mentions
        explicit_lure = entry.get("lure")
        detected_lures = entry.get("lures", [])
        all_lures = set(detected_lures)
        if explicit_lure:
            all_lures.add(explicit_lure)
        for lure in all_lures:
            by_lure.setdefault(lure, []).append(compact)

        # Index by category
        cat = entry["category"]
        by_category.setdefault(cat, []).append(compact)

        # Index by angler
        aid = entry["anglerId"]
        by_angler.setdefault(aid, []).append(compact)

    bundle = {
        "generated": __import__("datetime").datetime.now().isoformat(),
        "totalEntries": len(all_entries),
        "byLure": by_lure,
        "byCategory": by_category,
        "byAngler": by_angler,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(bundle, indent=2, ensure_ascii=False))
    print(f"\nWrote {len(all_entries)} entries to {OUTPUT_PATH}")
    print(f"  Lures indexed: {len(by_lure)}")
    print(f"  Categories indexed: {len(by_category)}")
    print(f"  Anglers indexed: {len(by_angler)}")


if __name__ == "__main__":
    main()
