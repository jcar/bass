# I Replaced My LLM at Runtime With 1,213 Pre-Generated Insights. Here's the Architecture.

*Jason Carter, AI Engineer*

---

Everyone's building RAG. Retrieval-augmented generation. Stuff your documents into a vector database, retrieve the relevant chunks at query time, feed them to an LLM, and pray the output is coherent.

I took a different approach. I used an LLM exactly once per piece of source material — during a build step — and never again at runtime. The result is a system that's faster, cheaper, more reliable, and produces better answers than anything I could get from RAG.

This is the story of how I turned 472 unstructured articles from 7 professional bass anglers into 326 pre-generated tactical briefings that power a fishing intelligence app with zero LLM calls at runtime.

## The Problem With RAG for Domain-Specific Knowledge

RAG works well when you need to answer open-ended questions across a broad corpus. But for domain-specific applications where you know the question space in advance, RAG has real problems:

**Latency.** Every query hits a vector database, retrieves chunks, and waits for an LLM to synthesize. That's 2-5 seconds minimum for a response that could be instant.

**Cost.** Every user query burns tokens. Scale to thousands of users and you're paying for the same synthesis over and over again.

**Inconsistency.** Ask the same question twice and you might get different answers depending on which chunks were retrieved and how the LLM decided to synthesize them.

**Quality ceiling.** RAG retrieves text chunks and hopes the LLM can make sense of them. But chunks are dumb boundaries — they split mid-sentence, lose context, and mix advice from different conditions into a single retrieval.

I wanted something better. I wanted the LLM to do the hard thinking once, carefully, and then get out of the way.

## The Insight: Your LLM Is a Build Tool, Not a Runtime Dependency

Here's the mental shift that changed everything for me: **treat the LLM like a compiler, not an interpreter.**

A compiler does expensive work once and produces an optimized artifact. An interpreter does expensive work every time you run the program. Most AI applications treat LLMs as interpreters — doing the same expensive reasoning on every request.

But if you know your domain and you can enumerate the conditions your users will encounter, you can compile your knowledge ahead of time.

For bass fishing, I know the condition space:
- **6 seasons** (pre-spawn, spawn, post-spawn, summer, fall, winter)
- **3 water clarities** (clear, stained, muddy)
- **3 frontal conditions** (pre-frontal, stable, post-frontal)
- **7 lure categories** (cranking, finesse, jigs, moving baits, topwater, reaction, soft plastics)

That's 6 × 3 × 3 × 7 = 378 possible condition combinations. Minus some impossible ones (topwater in winter, topwater in muddy water), I land on **326 distinct scenarios**. That's finite. That's compilable.

## The Pipeline: Four Layers of Refinement

### Layer 1: Acquire Raw Knowledge

I started with unstructured data — articles, interviews, video transcripts from 7 elite professional anglers: Kevin VanDam, Greg Hackney, Jacob Wheeler, Brandon Palaniuk, Gary Yamamoto, Cory Johnston, and Matt Robertson.

472 articles scraped from dozens of fishing publications. Raw text. No structure. Just paragraphs of pros talking about what they throw and why.

```
data/articles/kvd/194409.txt
data/articles/kvd/cold-water-jerkbaits-with-kvd.txt
data/articles/hackney/flipping-mats-like-a-pro.txt
...472 files
```

### Layer 2: Extract Structure With an LLM

This is where the LLM earns its keep. I fed each article to Claude and asked it to extract structured opinions and knowledge nuggets.

Not "summarize this article." Not "what are the key points." Instead, I gave it a precise schema:

```json
{
  "lure": "Suspending Jerkbait",
  "tipRules": [
    {
      "when": { "season": ["winter"], "waterClarity": "clear" },
      "tip": "KVD: Use a slow cadence with 8-10 second pauses...",
      "priority": 10
    }
  ]
}
```

The LLM's job was to read natural language and produce structured condition-tagged data. It extracted **which lure**, **under what conditions**, **what to do**, and **who said it** — with every tip attributed to a specific pro angler by name.

This is the only step that requires an LLM. After this, everything is deterministic.

472 articles became **1,213 structured knowledge entries** and **108 lure-specific opinion records** across 7 anglers.

### Layer 3: Enrich Conditions

The LLM extraction is precise but incomplete. An article about "fall cranking in creek arms" might extract the season and the lure, but miss that it implies shallow water, grass cover, and a stop-and-go retrieve.

Originally I used regex for this — keyword matching to fill in the gaps. It was free and fast but produced errors. "Can't see in summer" would incorrectly tag an entry as being about summer fishing. The substring "switch" would match the retrieve style "twitch."

I replaced it with a second LLM pass — using Claude Code to read every entry and assign conditions with actual comprehension. This added a new dimension the regex couldn't touch at all: **frontal pressure state** (pre-frontal, stable, post-frontal), which is critical for fishing but requires understanding language cues like "cold snap," "bluebird skies," or "tough post-frontal conditions."

### Layer 4: Pre-Generate Every Possible Briefing

Now I have 1,213 enriched, condition-tagged knowledge entries from 7 pro anglers. Time to compile.

For each of the 326 valid condition combinations, a generation script:

1. **Retrieves** matching knowledge entries — scored by relevance (exact season match = +4, dual-season = +2, lure category match = +3, clarity match = +2)
2. **Caps** at 25 entries per briefing, max 5 per angler, to ensure diversity of perspectives
3. **Pulls** matching tip rules, color recommendations, and depth strategies from the opinion data
4. **Assembles** a tactical briefing with a primary lure approach, an alternate, pro insights with attribution, and conditional adjustments

The output is a single JSON bundle. 326 briefings. ~1MB. Served statically.

```json
{
  "conditions": {
    "season": "fall",
    "waterClarity": "clear",
    "pressureState": "post-frontal",
    "lureCategory": "cranking"
  },
  "briefing": {
    "headline": "Crank it — fall clear water calls for finesse cranking...",
    "primaryApproach": {
      "lure": "Lipless Crankbait",
      "color": "Shad",
      "retrieve": "Slow-roll along grass edges...",
      "proSource": "KVD"
    },
    "proInsights": [
      { "angler": "KVD", "insight": "Fall reservoirs — shad move shallow..." },
      { "angler": "Wheeler", "insight": "Find the baitfish first..." }
    ]
  }
}
```

At runtime, the app does a map lookup. `getBriefing("fall", "clear", "post-frontal", "cranking")` returns a pre-generated briefing instantly. No vector search. No LLM call. No latency. No cost per query.

## The Numbers

| Stage | Input | Output | LLM Required |
|-------|-------|--------|:---:|
| Scrape | 472 URLs | 472 article text files | No |
| Extract | 472 articles | 1,213 knowledge entries, 108 opinions | **Yes (once)** |
| Enrich | 1,213 entries | 1,213 condition-tagged entries | **Yes (once)** |
| Generate | 1,213 entries | 326 tactical briefings | No |
| **Runtime** | **User query** | **Instant briefing** | **No** |

Total LLM cost: the extraction and enrichment passes. That's it. Every user query after that is free.

## Why This Beats RAG for Bounded Domains

**It's not that RAG is bad.** RAG is the right choice when you can't predict the question space — when users might ask anything about a large corpus.

But when you *can* enumerate the conditions, pre-generation wins on every axis:

| | RAG | Pre-Generation |
|---|---|---|
| Latency | 2-5s per query | Instant (static lookup) |
| Cost per query | Token cost every time | Zero |
| Consistency | Varies by retrieval | Deterministic |
| Quality | Limited by chunk boundaries | Full-context synthesis |
| Offline capable | No | Yes |
| Attribution | Hard to maintain | Built into the schema |

The key insight is that **the LLM adds the most value during extraction and synthesis, not during serving.** By the time a user asks a question, the hard thinking should already be done.

## The Pattern Is General

Bass fishing is my domain, but the pattern applies anywhere you have:

1. **A corpus of expert knowledge** (articles, manuals, transcripts, documentation)
2. **A bounded condition space** (the dimensions your users will filter by)
3. **A need for fast, consistent, attributed answers**

Think: medical guidelines by symptom/age/history. Equipment maintenance by model/environment/failure mode. Legal precedent by jurisdiction/case type/outcome. Cooking by dietary restriction/cuisine/technique/available ingredients.

If you can define the axes, you can pre-generate the intersections.

## What I'd Do Differently

**Start with the condition taxonomy.** I defined my lure categories and season vocabulary early, but the frontal pressure dimension came late. Having the full taxonomy before extraction would have produced richer condition tags from the start.

**Invest in the extraction schema.** The quality of everything downstream depends entirely on the extraction step. A sloppy schema produces sloppy structured data that no amount of post-processing can fix. I iterated on my extraction prompt more than anything else.

**Don't skip the enrichment pass.** Raw LLM extraction is precise but incomplete — it only tags conditions that are explicitly stated. An enrichment pass that adds implied conditions (this article about "offshore ledge fishing" implies summer, deep, and structure:ledge even if the text doesn't spell that out) dramatically improves retrieval coverage.

## The Stack

- **Scraping:** Python (requests + BeautifulSoup)
- **Extraction:** Claude API (Opus) with structured JSON output
- **Enrichment:** Claude Code (in-terminal, no API key)
- **Briefing generation:** Python (scoring + template assembly, no LLM)
- **Serving:** Next.js static import, JSON bundle at build time
- **Total runtime LLM calls:** Zero

---

The most powerful thing about this architecture isn't any individual technique. It's the realization that an LLM's best work happens in the build pipeline, not in the request path. Use it where it's irreplaceable — understanding natural language and producing structured insight — and then let deterministic systems take over for everything else.

Your LLM is a compiler. Let it compile.
