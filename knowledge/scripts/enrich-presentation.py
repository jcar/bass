#!/usr/bin/env python3
"""
Enrich angler lure opinions with presentation data (weight, trailer, retrieve cadence).

Scans tipRules[].tip, knowledge[].insight, and existing defaultTip strings for:
  - Weight: regex patterns like "3/8oz", "1/2oz tungsten"
  - Trailer: known trailer names (Rage Craw, Chunk, paddletail, etc.)
  - Retrieve: cadence phrases (slow roll, burn, hop, twitch, rip, pause, etc.)

Associates each extraction with the `when` condition from the parent rule,
then writes presentationRules[] and defaultPresentation into each opinion.
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data" / "extracted"

# ─── Extraction patterns ───

WEIGHT_RE = re.compile(
    r'(\d+/\d+)\s*-?\s*oz(?:ounce)?\.?(?:\s+tungsten|\s+lead)?',
    re.IGNORECASE
)

TRAILER_KEYWORDS = [
    'Rage Craw', 'Rage Bug', 'Chunk', 'Super Chunk', 'KVD Chunk',
    'paddletail', 'swimbait trailer', 'grub', 'creature bait',
    'Caffeine Shad', 'Keitech', 'Zoom Fluke', 'twin-tail',
    'craw trailer', 'Beaver', 'Speed Craw', 'Brush Hog',
    'ribbontail', 'curly tail',
]
TRAILER_RE = re.compile(
    r'\b(?:trailer[:\s]+)?(' + '|'.join(re.escape(k) for k in TRAILER_KEYWORDS) + r')\b'
    + r'|'
    + r'\b(\w[\w\s]*?)\s+trailer\b',
    re.IGNORECASE
)

RETRIEVE_PHRASES = [
    'slow roll', 'burn', 'hop', 'twitch', 'rip', 'pause',
    'dead stick', 'dead-stick', 'snap', 'drag', 'steady',
    'swim', 'yo-yo', 'flutter', 'pump', 'jerk', 'walk',
    'crawl', 'stroke', 'lift and fall', 'shake',
]
RETRIEVE_RE = re.compile(
    r'[^.!?]*\b(' + '|'.join(re.escape(p) for p in RETRIEVE_PHRASES) + r')\b[^.!?]*[.!?]?',
    re.IGNORECASE
)


def extract_weight(text: str) -> str | None:
    """Extract the first weight mention from text."""
    m = WEIGHT_RE.search(text)
    if not m:
        return None
    # Rebuild with context
    full = m.group(0).strip().rstrip('.')
    # Normalize: "3/8 oz" -> "3/8oz"
    full = re.sub(r'(\d+/\d+)\s+', r'\1', full)
    return full


def extract_trailer(text: str) -> str | None:
    """Extract the first trailer mention from text."""
    m = TRAILER_RE.search(text)
    if not m:
        return None
    return (m.group(1) or m.group(2) or '').strip()


def extract_retrieve(text: str) -> str | None:
    """Extract the best retrieve-cadence sentence from text."""
    matches = RETRIEVE_RE.findall(text)
    if not matches:
        return None
    # Return the full sentence containing the first match
    sentences = re.split(r'(?<=[.!?])\s+', text)
    for sent in sentences:
        for phrase in RETRIEVE_PHRASES:
            if phrase.lower() in sent.lower():
                cleaned = sent.strip().rstrip('.')
                if len(cleaned) > 120:
                    cleaned = cleaned[:117] + '...'
                return cleaned
    return None


def enrich_opinion(opinion: dict, angler_name: str, dry_run: bool) -> dict:
    """Extract presentation data from an opinion's tips and knowledge."""
    stats = {'weight': 0, 'trailer': 0, 'retrieve': 0, 'rules': 0}

    # Collect all text sources with their conditions
    sources: list[tuple[str, dict | None]] = []

    # From tipRules
    for rule in opinion.get('tipRules', []):
        sources.append((rule.get('tip', ''), rule.get('when')))

    # From knowledge entries (if present in the review data)
    for entry in opinion.get('knowledge', []):
        sources.append((entry.get('insight', ''), None))

    # Default tips (plural in review JSON) as a fallback source
    for tip in opinion.get('defaultTips', []):
        if isinstance(tip, str):
            sources.append((tip, None))
    # Also check singular defaultTip
    if opinion.get('defaultTip'):
        sources.append((opinion['defaultTip'], None))

    # Extract presentation rules from conditioned sources
    presentation_rules: list[dict] = []
    default_weight = None
    default_trailer = None
    default_retrieve = None

    for text, condition in sources:
        if not text:
            continue

        w = extract_weight(text)
        t = extract_trailer(text)
        r = extract_retrieve(text)

        if not any([w, t, r]):
            continue

        if w:
            stats['weight'] += 1
        if t:
            stats['trailer'] += 1
        if r:
            stats['retrieve'] += 1

        if condition:
            rule: dict = {'when': condition, 'priority': 5}
            if w:
                rule['weight'] = w
            if t:
                rule['trailer'] = t
            if r:
                rule['retrieveNote'] = r
            presentation_rules.append(rule)
            stats['rules'] += 1
        else:
            # Unconditioned → contributes to defaults
            if w and not default_weight:
                default_weight = w
            if t and not default_trailer:
                default_trailer = t
            if r and not default_retrieve:
                default_retrieve = r

    # Build defaultPresentation
    default_pres: dict = {}
    if default_weight:
        default_pres['weight'] = default_weight
    if default_trailer:
        default_pres['trailer'] = default_trailer
    if default_retrieve:
        default_pres['retrieveNote'] = default_retrieve

    # Only write if we found something
    if presentation_rules or default_pres:
        if not dry_run:
            if presentation_rules:
                opinion['presentationRules'] = presentation_rules
            if default_pres:
                opinion['defaultPresentation'] = default_pres

    return stats


def process_angler(angler_id: str, dry_run: bool) -> dict:
    """Process one angler's _merged-review.json."""
    review_path = DATA_DIR / angler_id / "_merged-review.json"
    if not review_path.exists():
        print(f"  ⚠ {review_path} not found, skipping")
        return {'opinions': 0, 'enriched': 0, 'weight': 0, 'trailer': 0, 'retrieve': 0, 'rules': 0}

    with open(review_path) as f:
        data = json.load(f)

    angler_name = data.get('angler', {}).get('name', angler_id)
    opinions = data.get('opinions', {})
    # opinions is a dict: { lureName: opinionDict }
    if isinstance(opinions, list):
        opinion_items = [(o.get('lure', ''), o) for o in opinions]
    else:
        opinion_items = list(opinions.items())
    totals = {'opinions': len(opinion_items), 'enriched': 0, 'weight': 0, 'trailer': 0, 'retrieve': 0, 'rules': 0}

    for lure_name, opinion in opinion_items:
        stats = enrich_opinion(opinion, angler_name, dry_run)
        if stats['weight'] or stats['trailer'] or stats['retrieve']:
            totals['enriched'] += 1
        for k in ['weight', 'trailer', 'retrieve', 'rules']:
            totals[k] += stats[k]

    if not dry_run:
        with open(review_path, 'w') as f:
            json.dump(data, f, indent=2)

    return totals


def main():
    parser = argparse.ArgumentParser(description='Enrich lure opinions with presentation data')
    parser.add_argument('--angler', help='Process only this angler ID')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be extracted without writing')
    args = parser.parse_args()

    if args.angler:
        anglers = [args.angler]
    else:
        anglers = sorted(d.name for d in DATA_DIR.iterdir() if d.is_dir() and (d / '_merged-review.json').exists())

    print(f"{'[DRY RUN] ' if args.dry_run else ''}Processing {len(anglers)} angler(s)...")
    print()

    grand = {'opinions': 0, 'enriched': 0, 'weight': 0, 'trailer': 0, 'retrieve': 0, 'rules': 0}

    for angler_id in anglers:
        print(f"  {angler_id}:")
        totals = process_angler(angler_id, args.dry_run)
        print(f"    {totals['opinions']} opinions, {totals['enriched']} enriched")
        print(f"    {totals['weight']} weights, {totals['trailer']} trailers, {totals['retrieve']} retrieves")
        print(f"    {totals['rules']} conditional rules created")
        for k in grand:
            grand[k] += totals[k]

    print()
    print(f"{'[DRY RUN] ' if args.dry_run else ''}Totals:")
    print(f"  {grand['opinions']} opinions across {len(anglers)} anglers")
    print(f"  {grand['enriched']} opinions enriched with presentation data")
    print(f"  {grand['weight']} weight extractions")
    print(f"  {grand['trailer']} trailer extractions")
    print(f"  {grand['retrieve']} retrieve extractions")
    print(f"  {grand['rules']} conditional presentation rules")


if __name__ == '__main__':
    main()
