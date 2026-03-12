# Angler Knowledge Extraction Runbook

Use this document to add a new angler to the bass fishing knowledge pipeline. A Claude Code session can read this file and execute the full pipeline autonomously.

## Pipeline Overview

```
1. Research URLs  →  article-urls-<angler>.txt
2. Scrape         →  data/articles/<angler>/*.txt
3. Extract        →  data/extracted/<angler>/*.json  (parallel agents, 4 batches)
4. Merge          →  data/extracted/<angler>/_merged-review.json
5. Commit & push
```

All commands run from: `/var/home/jcar/source/bass/knowledge/`

---

## Step 1: Research Article URLs

Create `data/article-urls-<angler>.txt` with 60–80 verified URLs. Use WebSearch to find real URLs — never guess or construct URLs.

**Search these sites** (in priority order):

| Site | Notes |
|------|-------|
| bassmaster.com | Columns, how-to, tips, slideshows |
| wired2fish.com | Technique articles, video transcripts |
| majorleaguefishing.com | Major League Lessons, angler columns, tips |
| bassresource.com | Often returns 403 — try but expect failures |
| westernbass.com | Articles and video pages |
| bassblaster.rocks | "How X won" tournament breakdowns — excellent detail |
| mossyoak.com | Fishing blogs |
| bassfan.com | News articles, dock talk |
| in-fisherman.com | Editorial/gear guides |
| 1source.basspro.com | Tips and tournament recaps |
| gameandfishmag.com | Editorials |
| advancedangler.com | Pro tips, features |
| bassanglermag.com | Technique articles |

Also search sponsor sites (e.g., seaguar.com, strikeking.com, megabassusa.com, rapala.com) — these vary by angler.

**Search queries:** `site:<domain> <angler name>` and `"<angler name>" bass fishing tips article`

**File format:**
```
# Angler Name — Article URLs for Knowledge Extraction
# XX URLs across YY sites

# ═══ Bassmaster.com (N) ═══
https://www.bassmaster.com/...
https://www.bassmaster.com/...

# ═══ Wired2Fish.com (N) ═══
https://www.wired2fish.com/...
```

---

## Step 2: Scrape Articles

```bash
mkdir -p data/articles/<angler> data/extracted/<angler>

python3 scripts/scrape-articles.py \
  --urls data/article-urls-<angler>.txt \
  --output data/articles/<angler>/
```

**Expected:** 50–70 successful scrapes from 60–80 URLs. Common losses:
- bassresource.com → 403 Forbidden
- baits.com → JS-rendered, returns ~81 chars
- blog.rapala.com → SSL certificate errors
- Some sites → 404 on older articles

**After scraping, clean thin files** (paywall stubs, video embeds with no text):
```bash
# Check for thin files
for f in data/articles/<angler>/*.txt; do
  chars=$(wc -c < "$f")
  if [ "$chars" -lt 300 ]; then echo "THIN ($chars): $(basename $f)"; fi
done

# Remove files under 300 chars (adjust threshold as needed)
for f in data/articles/<angler>/*.txt; do
  chars=$(wc -c < "$f")
  if [ "$chars" -lt 300 ]; then rm "$f"; fi
done
```

---

## Step 3: Extract Knowledge (Parallel Agents)

Split articles into 4 batches and launch 4 background agents. Each agent reads its batch of article text files and writes one JSON extraction per article.

### Listing articles for batches
```bash
ls -1 data/articles/<angler>/*.txt | head -N       # batch 1
ls -1 data/articles/<angler>/*.txt | tail -n +N+1 | head -N  # batch 2
# etc.
```

### Agent prompt template

Each agent gets this prompt (fill in angler name, batch file list, and brand mappings):

````
You are extracting structured bass fishing knowledge from articles about pro angler **<Angler Name>**.

Read each article file listed below and produce a JSON extraction file for each one.
Write each JSON to `/var/home/jcar/source/bass/knowledge/data/extracted/<angler>/<article-filename-without-txt>.json`.

**Articles to process (batch X of 4):**
1. data/articles/<angler>/file1.txt
2. data/articles/<angler>/file2.txt
...

All article paths are relative to `/var/home/jcar/source/bass/knowledge/`.

**JSON format:**
```json
{
  "source": "<filename>.txt",
  "anglerName": "<AnglerName>",
  "newOpinions": [
    {
      "lure": "<exact base lure name>",
      "tipRules": [
        { "when": { "season": ["pre-spawn"] }, "tip": "<Name>: <tip text>", "priority": 10 }
      ],
      "colorRules": [
        { "when": { "isStained": true }, "color": "Chartreuse", "hex": "#7fff00", "priority": 8 }
      ]
    }
  ],
  "knowledge": [
    { "category": "<category>", "topic": "<kebab-slug>", "insight": "<Name>: <insight>", "conditions": { "season": "summer" } }
  ]
}
```

**Valid base lure names (use EXACTLY):**
Swim Jig, Structure Jig, Shakyhead, Neko Rig, Strolling Rig, Spinnerbait (Colorado/Willow), Chatterbait, Squarebill Crankbait, Medium Diving Crankbait, Deep Diving Crankbait, Lipless Crankbait, Suspending Jerkbait, Walking Topwater, Buzzbait, Drop Shot, Ned Rig, Texas Rig (Creature Bait), Carolina Rig, Flipping Jig, Football Jig, Hair Jig / Finesse Jig, Crawfish Pattern Jig, Blade Bait, Jigging Spoon, Spy Bait, 10" Worm (Shakey/TX)

**Brand-to-generic mappings for <Angler>:**
- "<Brand Bait 1>" → <Base Lure Name>
- "<Brand Bait 2>" → <Base Lure Name>
...

**Knowledge categories:** retrieve-technique, gear, lure-selection, seasonal-pattern, fish-behavior, color-selection, tournament-strategy, mental-approach, depth-strategy, structure-reading, weather-adaptation, bait-design, electronics

**Rules:**
- Only extract opinions/knowledge actually stated in the article. Do not invent.
- Prefix all tips/insights with "<Name>: "
- If an article has no extractable technique content, write empty arrays.
- Priority 8-12 for specific/conditional tips, 4-7 for general.
````

### Brand-to-generic mapping guidance

Every angler uses branded bait names that must map to one of the 26 base lures. Research the angler's sponsors and signature baits before extraction. Common patterns:

| Brand Pattern | Likely Base Lure |
|---------------|-----------------|
| Any square-lip shallow crankbait | Squarebill Crankbait |
| Any 5-12ft diving crankbait | Medium Diving Crankbait |
| Any 12ft+ diving crankbait | Deep Diving Crankbait |
| Any lipless (Rat-L-Trap, Red Eye Shad, etc.) | Lipless Crankbait |
| Any suspending minnow/jerkbait | Suspending Jerkbait |
| Any bladed jig (Thunder Cricket, Jack Hammer, etc.) | Chatterbait |
| Any vibrating blade (Jigging Rap, Damiki, etc.) | Blade Bait |
| Creature/craw on TX rig or as jig trailer | Texas Rig (Creature Bait) or Flipping Jig |
| Senko/stick bait (weightless/wacky) | Texas Rig (Creature Bait) |
| Senko on shaky head | Shakyhead |
| Senko on drop shot | Drop Shot |
| Senko on neko | Neko Rig |
| Umbrella/A-rig/strolling | Strolling Rig |
| Frog → no base lure — put in knowledge only |
| Swimbait on jig head → Swim Jig |

### Condition predicate values

Use these exact values in `when` clauses:

```
season:        "pre-spawn" | "spawn" | "post-spawn" | "summer" | "fall" | "winter"
waterClarity:  "clear" | "stained" | "muddy"
skyCondition:  "sunny" | "partly-cloudy" | "overcast"
frontalSystem: "pre-frontal" | "stable" | "post-frontal" | "cold-front"
pressureTrend: "rising" | "stable" | "falling"
timeOfDay:     "dawn" | "morning" | "midday" | "afternoon" | "dusk" | "night"
waterTemp:     { min?: number, max?: number }  (in °F)
windSpeed:     { min?: number, max?: number }  (in mph)
fishDepth:     { min?: number, max?: number }  (in feet)
isLowLight:    boolean
isStained:     boolean
```

---

## Step 4: Merge Extractions

After all agents complete, verify count and merge:

```bash
# Verify all extractions written
ls data/extracted/<angler>/*.json | wc -l

# Merge
python3 scripts/extract-opinions.py --merge data/extracted/<angler>/
```

Output: `data/extracted/<angler>/_merged-review.json`

### Analyze merged stats
```python
python3 -c "
import json
with open('data/extracted/<angler>/_merged-review.json') as f:
    d = json.load(f)
print(f'Sources: {len(d[\"sources\"])}')
print(f'Lures: {len(d[\"opinions\"])}')
for lure, data in sorted(d['opinions'].items()):
    tips = len(data.get('tipRules', []))
    colors = len(data.get('colorRules', []))
    print(f'  {lure}: {tips} tips, {colors} colors')
print(f'Knowledge: {len(d[\"knowledge\"])}')
cats = {}
for k in d['knowledge']:
    c = k.get('category', 'uncategorized')
    cats[c] = cats.get(c, 0) + 1
for c, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f'  {c}: {n}')
"
```

---

## Step 5: Commit & Push

```bash
cd /var/home/jcar/source/bass

git add knowledge/data/article-urls-<angler>.txt \
       knowledge/data/articles/<angler>/ \
       knowledge/data/extracted/<angler>/

git commit -m "Add <Angler Name> knowledge extraction (N articles → N lures, N knowledge nuggets)

<Brief description of extraction focus and notable coverage.>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push
```

---

## Example Extraction JSON

From KVD's cold-water crankbait article — shows the expected structure with opinions and knowledge:

```json
{
  "source": "3-crankbaits-you-need-for-cold-water---kevin-vandam.txt",
  "anglerName": "KVD",
  "newOpinions": [
    {
      "lure": "Squarebill Crankbait",
      "tipRules": [
        {
          "when": { "season": ["winter", "pre-spawn"] },
          "tip": "KVD: For the shallow zone in cold water, use a flatside crankbait. Extremely tight action — bass use their lateral line to hunt in cold water and flatsides displace a ton of water.",
          "priority": 10
        }
      ],
      "colorRules": [
        { "when": { "season": ["winter", "pre-spawn"], "waterClarity": "clear" }, "color": "Ghost Crawfish", "hex": "#8b7355", "priority": 10 },
        { "when": { "season": ["winter", "pre-spawn"], "waterClarity": "stained" }, "color": "Fire Craw", "hex": "#c4302b", "priority": 10 }
      ]
    },
    {
      "lure": "Medium Diving Crankbait",
      "tipRules": [
        {
          "when": { "season": ["winter", "pre-spawn"] },
          "tip": "KVD: Gravel Dog for the 6-12ft mid-range zone in cold water. Round body, super wide wobble, loud rattle. Eats up the bottom — perfect for chunk rock banks, bluffs, riprap around bridges.",
          "priority": 10
        }
      ]
    }
  ],
  "knowledge": [
    {
      "category": "depth-strategy",
      "topic": "cold-water-crankbait-zones",
      "insight": "KVD: Three depth zones need three crankbaits in cold water. Shallow = flatside. Mid-range 6-12ft = round body wide wobble. Deep 12-15ft = smaller tight-action diver.",
      "conditions": { "season": "winter" }
    },
    {
      "category": "retrieve-technique",
      "topic": "cold-water-crankbait-cadence",
      "insight": "KVD: In cold water cranking, use slow to medium retrieve. Start and stop often — pausing can trigger a following bass into biting.",
      "conditions": { "season": "winter" }
    }
  ]
}
```

---

## Completed Anglers

| Angler | ID | Articles | Lures | Knowledge | Specialty |
|--------|----|----------|-------|-----------|-----------|
| Kevin VanDam | kvd | 123 | 22 | 317 | Cranking, power fishing, versatility |
| Greg Hackney | hackney | 57 | 15 | 194 | Flipping, jigs, heavy cover |
| Jacob Wheeler | wheeler | 72 | 22 | 188 | Cranking, electronics, moving baits |
| Brandon Palaniuk | palaniuk | 65 | 14 | 151 | Finesse, clear water, drop shot |
| Gary Yamamoto | yamamoto | 41 | 11 | 118 | Soft plastics, Senko, Texas Rig |

---

## Quick-Start for a New Session

Paste this to a new Claude Code session:

> Read `/var/home/jcar/source/bass/knowledge/ANGLER-EXTRACTION-RUNBOOK.md` and then run the full pipeline for **[Angler Name]**. They are known for [brief specialty description] and sponsored by [key sponsors if known].
