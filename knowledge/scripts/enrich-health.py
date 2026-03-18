#!/usr/bin/env python3
"""Enrich _merged-review.json files with credibility, structureAdvice, and confidenceModifiers.

No API key needed — uses heuristics + embedded angler expertise knowledge to fill gaps.

Usage:
    python3 scripts/enrich-health.py                    # Enrich all anglers
    python3 scripts/enrich-health.py --angler hackney   # Enrich one angler
    python3 scripts/enrich-health.py --dry-run           # Preview without writing
"""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
EXTRACTED_DIR = KNOWLEDGE_DIR / "data" / "extracted"

STRUCTURE_TYPES = ["point", "bluff", "grass", "flat", "dock", "creek-channel", "hump", "riprap", "laydown"]

# ─── Angler expertise profiles (used for credibility scoring) ───
# Format: lure_name -> bonus (0.0-0.15) reflecting known signature status
ANGLER_SIGNATURES = {
    "hackney": {
        "Flipping Jig": 0.15,       # Signature technique, 18 sources
        "Swim Jig": 0.10,           # Core technique
        "Texas Rig (Creature Bait)": 0.10,  # Heavy cover specialist
        "Chatterbait": 0.08,
        "Spinnerbait (Colorado/Willow)": 0.08,
        "Buzzbait": 0.05,
        "Lipless Crankbait": 0.05,
    },
    "wheeler": {
        "Swim Jig": 0.15,           # 17 sources, signature
        "Drop Shot": 0.10,          # Versatile finesse
        "Walking Topwater": 0.08,
        "Medium Diving Crankbait": 0.08,
        "Deep Diving Crankbait": 0.08,
        "Texas Rig (Creature Bait)": 0.08,
        "Ned Rig": 0.05,
        "Suspending Jerkbait": 0.05,
        "Neko Rig": 0.05,
    },
    "yamamoto": {
        "Texas Rig (Creature Bait)": 0.15,  # Senko inventor, 22 sources
        "Ned Rig": 0.10,            # Senko on ned head
        "Drop Shot": 0.08,
        "Neko Rig": 0.08,
        "Carolina Rig": 0.08,
        "Shakyhead": 0.08,
        "10\" Worm (Shakey/TX)": 0.05,
    },
    "palaniuk": {
        "Drop Shot": 0.15,          # 13 sources, signature finesse
        "Suspending Jerkbait": 0.12, # 11 sources
        "Walking Topwater": 0.08,
        "Neko Rig": 0.08,
        "Squarebill Crankbait": 0.05,
        "Deep Diving Crankbait": 0.05,
        "Flipping Jig": 0.05,
        "10\" Worm (Shakey/TX)": 0.05,
    },
    "johnston": {
        "Drop Shot": 0.15,          # 27 sources, dominant technique
        "Texas Rig (Creature Bait)": 0.10,
        "Suspending Jerkbait": 0.08,
        "Football Jig": 0.08,
        "Flipping Jig": 0.05,
        "Ned Rig": 0.05,
        "Spy Bait": 0.05,
    },
    "robertson": {
        "Deep Diving Crankbait": 0.15,  # Known cranker / offshore specialist
        "Lipless Crankbait": 0.12,
        "Swim Jig": 0.10,
        "Walking Topwater": 0.08,
        "Medium Diving Crankbait": 0.08,
        "Squarebill Crankbait": 0.05,
        "Spinnerbait (Colorado/Willow)": 0.05,
    },
    "kvd": {
        # KVD already has some credibility; just supplement
        "Squarebill Crankbait": 0.15,
        "Lipless Crankbait": 0.12,
        "Deep Diving Crankbait": 0.12,
        "Medium Diving Crankbait": 0.10,
        "Chatterbait": 0.10,
        "Spinnerbait (Colorado/Willow)": 0.10,
        "Suspending Jerkbait": 0.08,
        "Walking Topwater": 0.08,
        "Swim Jig": 0.05,
        "Buzzbait": 0.05,
    },
}

# ─── Structure keyword → type mapping ───
STRUCTURE_KEYWORD_MAP = {
    "point": ["point", "points"],
    "bluff": ["bluff", "bluffs", "bluff wall", "bluff bank", "cliff", "vertical rock"],
    "grass": ["grass", "hydrilla", "milfoil", "vegetation", "weeds", "weed line",
              "grass line", "grass bed", "grass mat", "eelgrass", "coontail",
              "cattail", "lily pad", "pad", "mat", "mats", "matted"],
    "flat": ["flat", "flats", "shallow flat", "spawning flat"],
    "dock": ["dock", "docks", "boat dock", "boat house", "pier", "marina"],
    "creek-channel": ["creek", "creek channel", "creek arm", "channel", "drain",
                      "ditch", "ledge", "river channel", "creek mouth"],
    "hump": ["hump", "humps", "offshore hump", "underwater island"],
    "riprap": ["riprap", "rip rap", "rock wall", "rock bank", "causeway",
               "bridge piling", "seawall"],
    "laydown": ["laydown", "lay down", "fallen tree", "log", "timber",
                "brush pile", "brush", "stump", "stumps", "wood", "blowdown"],
}


def compute_credibility(angler_id: str, data: dict) -> dict:
    """Generate credibility scores for each lure based on data signals + expertise."""
    existing = data.get("credibility", {})
    result = {}

    signatures = ANGLER_SIGNATURES.get(angler_id, {})
    total_sources = len(data.get("sources", []))

    for lure_name, opinion in data["opinions"].items():
        # Skip if already has credibility entries
        if lure_name in existing and existing[lure_name]:
            result[lure_name] = existing[lure_name]
            continue

        sources = len(opinion.get("sources", []))
        tips = len(opinion.get("tipRules", []))
        colors = len(opinion.get("colorRules", []))
        defaults = len(opinion.get("defaultTips", []))
        cond_tips = sum(1 for t in opinion.get("tipRules", []) if t.get("when", {}) != {})

        # Base score: 0.5 + signal bonuses (capped at 1.0)
        base = 0.50

        # Source coverage: more articles mentioning this lure = more expertise
        if sources >= 15:
            base += 0.20
        elif sources >= 8:
            base += 0.15
        elif sources >= 4:
            base += 0.10
        elif sources >= 2:
            base += 0.05

        # Tip depth: more tips with conditions = deeper knowledge
        if cond_tips >= 15:
            base += 0.15
        elif cond_tips >= 8:
            base += 0.10
        elif cond_tips >= 4:
            base += 0.05

        # Color knowledge: having color rules shows practical experience
        if colors >= 8:
            base += 0.05
        elif colors >= 3:
            base += 0.03

        # Signature bonus from angler expertise profile
        base += signatures.get(lure_name, 0.0)

        score = round(min(base, 1.0), 2)

        # Pick a representative source
        source_list = opinion.get("sources", [])
        source = source_list[0] if source_list else "enrichment"

        result[lure_name] = [{"score": score, "source": source}]

    return result


def extract_structure_advice(angler_id: str, data: dict) -> dict:
    """Extract structure advice from knowledge entries and tip rules."""
    existing = data.get("structureAdvice", {})
    result = {k: list(v) for k, v in existing.items()}  # copy existing

    angler_name = {
        "hackney": "Hackney",
        "wheeler": "Wheeler",
        "yamamoto": "Yamamoto",
        "palaniuk": "Palaniuk",
        "johnston": "Johnston",
        "robertson": "Robertson",
        "kvd": "KVD",
    }.get(angler_id, angler_id.title())

    # Collect existing advice texts to avoid duplicates
    existing_texts = set()
    for entries in result.values():
        for entry in entries:
            advice = entry.get("advice", "")
            # Handle cases where advice is a list (e.g., KVD hump format)
            if isinstance(advice, list):
                for item in advice:
                    if isinstance(item, dict):
                        existing_texts.add(item.get("tip", "")[:80].lower())
                    elif isinstance(item, str):
                        existing_texts.add(item[:80].lower())
            elif isinstance(advice, str):
                existing_texts.add(advice[:80].lower())

    # Mine knowledge entries for structure-related insights
    for nugget in data.get("knowledge", []):
        insight = nugget.get("insight", "")
        source = nugget.get("source", "enrichment")
        conditions = nugget.get("conditions", {})
        text_lower = insight.lower()

        # Check which structure types this knowledge relates to
        for struct_type, keywords in STRUCTURE_KEYWORD_MAP.items():
            matched = False
            for kw in keywords:
                # Match whole words to avoid false positives
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    matched = True
                    break

            if not matched:
                continue

            # Also check conditions for structure hints
            cond_struct = conditions.get("structure", "")
            if isinstance(cond_struct, str) and cond_struct:
                # Map condition structure values
                for st, kws in STRUCTURE_KEYWORD_MAP.items():
                    if cond_struct.lower() in [k.lower() for k in kws] or cond_struct.lower() == st:
                        if st == struct_type:
                            matched = True

            if not matched:
                continue

            # Skip if too similar to existing
            if insight[:80].lower() in existing_texts:
                continue

            # Only use insights that are substantial enough (at least 50 chars)
            if len(insight) < 50:
                continue

            # Ensure it's attributed
            if not insight.startswith(angler_name):
                advice_text = f"{angler_name}: {insight}"
            else:
                advice_text = insight

            if struct_type not in result:
                result[struct_type] = []

            result[struct_type].append({
                "advice": advice_text,
                "source": source,
            })
            existing_texts.add(insight[:80].lower())

    # Also mine tip rules that mention structure types
    for lure_name, opinion in data["opinions"].items():
        for tip_rule in opinion.get("tipRules", []):
            tip_text = tip_rule.get("tip", "")
            tip_lower = tip_text.lower()

            for struct_type, keywords in STRUCTURE_KEYWORD_MAP.items():
                matched = False
                for kw in keywords:
                    if re.search(r'\b' + re.escape(kw) + r'\b', tip_lower):
                        matched = True
                        break

                if not matched:
                    continue

                if tip_text[:80].lower() in existing_texts:
                    continue

                if len(tip_text) < 50:
                    continue

                # Prefer tips with conditions (more specific)
                when = tip_rule.get("when", {})
                if not when:
                    continue  # Skip unconditional tips for structure advice

                if struct_type not in result:
                    result[struct_type] = []

                source = opinion.get("sources", ["enrichment"])[0]
                result[struct_type].append({
                    "advice": tip_text,
                    "source": source,
                })
                existing_texts.add(tip_text[:80].lower())

    # Deduplicate and limit per structure type (keep best 5)
    for struct_type in result:
        seen = set()
        deduped = []
        for entry in result[struct_type]:
            advice = entry.get("advice", "")
            key = (advice[:100].lower() if isinstance(advice, str)
                   else json.dumps(advice)[:100].lower())
            if key not in seen:
                seen.add(key)
                deduped.append(entry)
        result[struct_type] = deduped[:5]

    return result


def generate_confidence_modifiers(data: dict) -> dict:
    """Generate confidenceModifiers from patterns in existing conditional tip/color rules."""
    result = {}  # lure -> list of modifiers

    for lure_name, opinion in data["opinions"].items():
        existing_mods = opinion.get("confidenceModifiers", [])
        if existing_mods:
            result[lure_name] = existing_mods
            continue

        # Analyze condition patterns across tips and colors
        condition_counts = defaultdict(int)  # serialized when -> count
        condition_objs = {}  # serialized when -> when obj

        for rule in opinion.get("tipRules", []) + opinion.get("colorRules", []):
            when = rule.get("when", {})
            if not when:
                continue
            # Create a simplified condition key for grouping
            key = json.dumps(when, sort_keys=True)
            condition_counts[key] += 1
            condition_objs[key] = when

        if not condition_counts:
            result[lure_name] = []
            continue

        # Generate modifiers for conditions that appear multiple times
        modifiers = []
        seen_simple = set()  # Track simple conditions to avoid redundancy

        for key, count in sorted(condition_counts.items(), key=lambda x: -x[1]):
            when = condition_objs[key]

            # Only generate modifiers for conditions with enough evidence
            if count < 2:
                continue

            # Skip overly complex conditions (3+ fields) — too specific
            if len(when) > 2:
                continue

            # Create a simpler key to avoid near-duplicate modifiers
            simple_key = tuple(sorted(when.keys()))
            simple_val = tuple(
                tuple(v) if isinstance(v, list) else str(v)
                for v in [when[k] for k in sorted(when.keys())]
            )
            dedup_key = (simple_key, simple_val)
            if dedup_key in seen_simple:
                continue
            seen_simple.add(dedup_key)

            # Scale adjustment by evidence strength: 4-12 range
            if count >= 8:
                adjustment = 12
            elif count >= 5:
                adjustment = 10
            elif count >= 3:
                adjustment = 8
            else:
                adjustment = 5

            modifiers.append({
                "when": when,
                "adjustment": adjustment,
            })

            # Cap at 8 modifiers per lure
            if len(modifiers) >= 8:
                break

        result[lure_name] = modifiers

    return result


def enrich_angler(angler_id: str, dry_run: bool = False) -> dict:
    """Enrich a single angler's _merged-review.json."""
    merged_path = EXTRACTED_DIR / angler_id / "_merged-review.json"
    if not merged_path.exists():
        print(f"  ERROR: {merged_path} not found", file=sys.stderr)
        return {}

    data = json.loads(merged_path.read_text())

    print(f"\n{'='*60}")
    print(f"  Enriching: {angler_id}")
    print(f"{'='*60}")

    # ─── 1. Credibility ───
    old_cred = len(data.get("credibility", {}))
    new_credibility = compute_credibility(angler_id, data)
    new_cred = len(new_credibility)
    print(f"  Credibility: {old_cred} → {new_cred} lures")
    for lure, entries in new_credibility.items():
        if lure not in data.get("credibility", {}):
            score = entries[0]["score"] if isinstance(entries, list) else entries
            print(f"    + {lure}: {score}")

    # ─── 2. Structure Advice ───
    old_struct = len(data.get("structureAdvice", {}))
    new_structure = extract_structure_advice(angler_id, data)
    new_struct = len(new_structure)
    print(f"  Structure: {old_struct} → {new_struct} types")
    for stype, entries in new_structure.items():
        old_count = len(data.get("structureAdvice", {}).get(stype, []))
        if len(entries) > old_count:
            print(f"    + {stype}: {old_count} → {len(entries)} entries")

    # ─── 3. Confidence Modifiers ───
    mod_changes = 0
    new_modifiers = generate_confidence_modifiers(data)
    for lure_name, mods in new_modifiers.items():
        old_mods = len(data["opinions"][lure_name].get("confidenceModifiers", []))
        if len(mods) > old_mods:
            mod_changes += 1
    print(f"  Confidence Modifiers: {mod_changes} lures gained modifiers")
    for lure_name, mods in new_modifiers.items():
        old_mods = len(data["opinions"][lure_name].get("confidenceModifiers", []))
        if len(mods) > old_mods:
            print(f"    + {lure_name}: {old_mods} → {len(mods)} modifiers")

    if dry_run:
        print("  [DRY RUN — not writing]")
        return data

    # Apply changes
    data["credibility"] = new_credibility
    data["structureAdvice"] = new_structure
    for lure_name, mods in new_modifiers.items():
        if lure_name in data["opinions"]:
            old_mods = data["opinions"][lure_name].get("confidenceModifiers", [])
            if not old_mods and mods:
                data["opinions"][lure_name]["confidenceModifiers"] = mods

    # Write back
    merged_path.write_text(json.dumps(data, indent=2))
    print(f"  ✓ Written to {merged_path}")

    return data


def main():
    parser = argparse.ArgumentParser(description="Enrich _merged-review.json with credibility, structure, and modifiers")
    parser.add_argument("--angler", "-a", help="Enrich a single angler (default: all)")
    parser.add_argument("--dry-run", "-n", action="store_true", help="Preview changes without writing")
    args = parser.parse_args()

    anglers = [args.angler] if args.angler else [
        d.name for d in sorted(EXTRACTED_DIR.iterdir())
        if d.is_dir() and (d / "_merged-review.json").exists()
    ]

    print(f"Enriching {len(anglers)} angler(s): {', '.join(anglers)}")

    stats = {"credibility": 0, "structure": 0, "modifiers": 0}

    for angler_id in anglers:
        data = enrich_angler(angler_id, dry_run=args.dry_run)

    print(f"\n{'='*60}")
    print(f"Done! Refresh localhost:3000/health to see updated scores.")


if __name__ == "__main__":
    main()
