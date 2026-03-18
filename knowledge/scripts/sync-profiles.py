#!/usr/bin/env python3
"""Sync enriched _merged-review.json data back into StrikeZone .ts angler profiles.

Updates:
  1. Credibility scores (takes MAX of existing .ts vs JSON)
  2. Confidence modifiers (adds to lures with empty arrays)

Usage:
    python3 scripts/sync-profiles.py              # Sync all anglers
    python3 scripts/sync-profiles.py --angler hackney  # Sync one
    python3 scripts/sync-profiles.py --dry-run     # Preview changes
"""

import argparse
import json
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
KNOWLEDGE_DIR = SCRIPT_DIR.parent
EXTRACTED_DIR = KNOWLEDGE_DIR / "data" / "extracted"
STRIKEZONE_DIR = KNOWLEDGE_DIR.parent / "strikezone" / "src" / "lib" / "anglers"

ANGLER_NAMES = {
    "hackney": "Hackney",
    "kvd": "KVD",
    "wheeler": "Wheeler",
    "yamamoto": "Yamamoto",
    "palaniuk": "Palaniuk",
    "johnston": "Johnston",
    "robertson": "Robertson",
}


def load_json_data(angler_id: str) -> dict:
    """Load _merged-review.json for an angler."""
    path = EXTRACTED_DIR / angler_id / "_merged-review.json"
    if not path.exists():
        print(f"  ERROR: {path} not found", file=sys.stderr)
        return {}
    return json.loads(path.read_text())


def parse_ts_credibility(ts_content: str) -> dict[str, float]:
    """Extract credibility map from .ts file."""
    cred = {}
    # Match the credibility block
    m = re.search(r'credibility:\s*\{([^}]+)\}', ts_content, re.DOTALL)
    if not m:
        return cred
    block = m.group(1)
    for match in re.finditer(r"'([^']+)':\s*([\d.]+)", block):
        cred[match.group(1)] = float(match.group(2))
    return cred


def parse_ts_lure_names(ts_content: str) -> list[str]:
    """Extract lure names from opinions array."""
    return re.findall(r"lure:\s*'([^']+)'", ts_content)


def build_credibility_block(scores: dict[str, float], indent: str = "    ") -> str:
    """Build a TypeScript credibility object."""
    lines = []
    for lure, score in sorted(scores.items()):
        lines.append(f"{indent}'{lure}': {score},")
    return "\n".join(lines)


def format_when(when: dict) -> str:
    """Format a when condition as TypeScript."""
    parts = []
    for key, val in sorted(when.items()):
        if isinstance(val, list):
            items = ", ".join(f"'{v}'" for v in val)
            parts.append(f"{key}: [{items}]")
        elif isinstance(val, dict):
            # Range like { min: 50, max: 70 }
            inner = ", ".join(f"{k}: {v}" for k, v in val.items())
            parts.append(f"{key}: {{ {inner} }}")
        elif isinstance(val, bool):
            parts.append(f"{key}: {'true' if val else 'false'}")
        elif isinstance(val, str):
            parts.append(f"{key}: '{val}'")
        else:
            parts.append(f"{key}: {val}")
    return "{ " + ", ".join(parts) + " }"


def format_modifier(mod: dict, indent: str = "          ") -> str:
    """Format a confidence modifier as TypeScript."""
    when_str = format_when(mod["when"])
    return f"{indent}{{ when: {when_str}, adjustment: {mod['adjustment']} }},"


def sync_angler(angler_id: str, dry_run: bool = False) -> dict:
    """Sync one angler's .ts profile with enriched JSON data."""
    ts_path = STRIKEZONE_DIR / f"{angler_id}.ts"
    if not ts_path.exists():
        print(f"  ERROR: {ts_path} not found", file=sys.stderr)
        return {}

    json_data = load_json_data(angler_id)
    if not json_data:
        return {}

    ts_content = ts_path.read_text()
    original = ts_content

    print(f"\n{'='*60}")
    print(f"  Syncing: {angler_id}")
    print(f"{'='*60}")

    # ─── 1. Merge credibility scores (take MAX) ───
    ts_cred = parse_ts_credibility(ts_content)
    json_cred = {}
    for lure, entries in json_data.get("credibility", {}).items():
        if isinstance(entries, list) and entries:
            json_cred[lure] = entries[0]["score"]
        elif isinstance(entries, (int, float)):
            json_cred[lure] = entries

    # Only update lures that exist in the .ts opinions
    ts_lures = set(parse_ts_lure_names(ts_content))

    merged_cred = dict(ts_cred)
    cred_changes = []
    for lure in ts_lures:
        ts_val = ts_cred.get(lure)
        json_val = json_cred.get(lure)

        if json_val is not None:
            if ts_val is not None:
                new_val = round(max(ts_val, json_val), 2)
                if new_val != ts_val:
                    cred_changes.append(f"  {lure}: {ts_val} → {new_val} (was max({ts_val}, {json_val}))")
                    merged_cred[lure] = new_val
            else:
                # Lure exists in opinions but not in credibility map
                merged_cred[lure] = json_val
                cred_changes.append(f"  + {lure}: {json_val} (new)")

    if cred_changes:
        print(f"  Credibility changes ({len(cred_changes)}):")
        for c in cred_changes:
            print(f"    {c}")

        # Replace credibility block in .ts
        new_cred_block = build_credibility_block(merged_cred)
        ts_content = re.sub(
            r'(credibility:\s*\{)\s*\n[^}]+(})',
            lambda m: f"{m.group(1)}\n{new_cred_block}\n  {m.group(2)}",
            ts_content,
            count=1,
        )
    else:
        print("  Credibility: no changes needed")

    # ─── 2. Add confidence modifiers to empty arrays ───
    mod_changes = []
    json_opinions = json_data.get("opinions", {})

    for lure_name in ts_lures:
        json_op = json_opinions.get(lure_name, {})
        json_mods = json_op.get("confidenceModifiers", [])

        if not json_mods:
            continue

        # Check if this lure has empty confidenceModifiers in .ts
        # Pattern: lure: 'LureName', ... confidenceModifiers: [],
        # We need to find the specific opinion block for this lure
        lure_escaped = re.escape(lure_name)

        # Find the opinion block for this lure and check if confidenceModifiers is empty
        pattern = (
            r"(lure:\s*'" + lure_escaped + r"'.*?"
            r"confidenceModifiers:\s*)\[\s*\]"
        )
        match = re.search(pattern, ts_content, re.DOTALL)

        if not match:
            continue  # Already has modifiers or pattern doesn't match

        # Build the new modifiers array
        mod_lines = []
        for mod in json_mods:
            mod_lines.append(format_modifier(mod))

        new_mods = "[\n" + "\n".join(mod_lines) + "\n        ]"

        ts_content = ts_content[:match.start()] + match.group(1) + new_mods + ts_content[match.end():]

        mod_changes.append(f"  {lure_name}: +{len(json_mods)} modifiers")

    if mod_changes:
        print(f"  Confidence modifier additions ({len(mod_changes)}):")
        for c in mod_changes:
            print(f"    {c}")
    else:
        print("  Confidence modifiers: no empty arrays to fill")

    # ─── Write ───
    if ts_content == original:
        print("  No changes to write")
        return {}

    if dry_run:
        print("  [DRY RUN — not writing]")
    else:
        ts_path.write_text(ts_content)
        print(f"  ✓ Written to {ts_path}")

    return {"cred_changes": len(cred_changes), "mod_changes": len(mod_changes)}


def main():
    parser = argparse.ArgumentParser(description="Sync enriched JSON data into .ts angler profiles")
    parser.add_argument("--angler", "-a", help="Sync a single angler (default: all)")
    parser.add_argument("--dry-run", "-n", action="store_true", help="Preview changes without writing")
    args = parser.parse_args()

    anglers = [args.angler] if args.angler else list(ANGLER_NAMES.keys())

    print(f"Syncing {len(anglers)} angler(s): {', '.join(anglers)}")

    for angler_id in anglers:
        sync_angler(angler_id, dry_run=args.dry_run)

    print(f"\n{'='*60}")
    print("Done! Rebuild StrikeZone to pick up changes.")


if __name__ == "__main__":
    main()
