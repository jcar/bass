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
                record = {
                    "angler": angler_name,
                    "anglerId": angler_id,
                    "category": entry.get("category", "general"),
                    "topic": entry.get("topic", ""),
                    "insight": entry.get("insight", ""),
                    "source": source,
                }
                # Attach lure from conditions if present
                conditions = entry.get("conditions", {})
                if conditions.get("lure"):
                    record["lure"] = conditions["lure"]
                if conditions.get("season"):
                    record["season"] = conditions["season"]

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

        # Index by lure
        lure = entry.get("lure")
        if lure:
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
