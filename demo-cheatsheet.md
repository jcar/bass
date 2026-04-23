# Strikezone — Cheat Sheet

**15 min · technical audience · live demo**
Site: jcar.github.io/bass · Repo: github.com/jcar/bass · Deck: jcar.github.io/bass/slides/

---

## Pre-flight
Site loaded · DevTools → Network tab (Fetch/XHR) · lake pre-picked · one briefing JSON open · `knowledge/scripts/` tab open · browser @ 125%

---

## 1 · Hook — 1:00
- "Side project. Built it changed how I think about AI in production."
- "Hardest part of bass fishing = what to throw. Pros disagree. Conditions shift. Folk knowledge."
- "Let me show you."

## 2 · Demo — 5:00
1. **Open site** — confidence gauge · 6-day forecast
2. **Top Pick card** — lure, color, retrieve, pro attribution. "Every rec tied to a human on the record."
3. **Flip clarity clear→muddy** — watch it react. Flip forecast days — front shifts. "Hold that thought on speed."
4. **Anglers page** — 7 pros, each with a voice. "Follow" an angler reshapes the app.
5. **DEVTOOLS → Network.** Interact. "Zero calls. No OpenAI, no Anthropic, no vector DB. Static site on GH Pages." **PAUSE.**

*Cut if tight:* skip step 4.

## 3 · Reveal — 1:00
- "Every rec was AI-generated. Months ago. Upstream."
- **"The thesis: move AI upstream — out of the request path, into the build pipeline."**
- "I didn't build an AI app. I built a **data refinery**. The app is just the tap."

## 4 · The data refinery — 4:00
Show `knowledge/scripts/`. Walk the four stages:

```
[web sources]
   ↓ Stage 1 · Intake       (Python, no AI)
[472 articles, crude feedstock]
   ↓ Stage 2 · Extract      (AI pass #1, schema-first)
[1,213 facts + 108 opinions]
   ↓ Stage 3 · Enrich       (AI pass #2, implied conditions)
[1,213 enriched entries]
   ↓ Stage 4 · Package      (pure Python, no AI)
[326 briefings, ~1MB JSON — the refined product]
   ↓
[GH Pages — the tap]
```

- **Stage 1 · Intake** → dumb Python. No AI. Crude in.
- **Stage 2 · Extract** (AI pass 1/2) → strict JSON schema. Prose → schema. No summarization.
- **Stage 3 · Enrich** (AI pass 2/2) → implied conditions the first pass missed. Replaced regex that false-matched "switch"→"twitch."
- **Stage 4 · Package** → no AI. Score, rank, cap per angler, assemble. 326 JSON files.
- **The tap** → `getBriefing(season, clarity, front, lure)` = dict lookup. O(1). That's why clarity flipped instantly.

**Numbers:** 472 → 1,213 → 326 · ~$low-double-digits total API spend · 0 tokens/query forever

## 5 · Where this pattern fits — 3:00
- **The setup:** "Smart people already wrote the answer. Your users ask variations of the same questions. So match them up ahead of time."
- "RAG is right when the question space is wide open. Most of what we ship isn't — it's filterable."
- **Self-test before reaching for RAG:**
  1. Can I list the kinds of questions people will ask?
  2. Does the source material change daily, or rarely?
  3. Do I need to know who said what?
  4. Do users need an instant answer?

## 6 · Close — 1:00
Three takeaways:
1. **Move AI upstream.** Out of the request path. Into the build pipeline.
2. **Schema-first extraction** beats summarization. The JSON is the product.
3. **N filters? Pre-compute the cross-product.** Cheaper than you think.

**Closing line:** *"The thinking happens upstream. Everything downstream is a static file and a tap."*

"Writeup's in Slack. Happy to pair on a real workflow. Questions?"

---

## Lines worth memorizing
- "Move AI upstream."
- "I didn't build an AI app. I built a data refinery."
- "The thinking happens upstream. Everything downstream is a static file and a tap."
- "Same AI — different place in the pipeline."
- "Attribution is built into the schema, not retrofitted onto retrieval."

## Don't forget
- Open DevTools **before** section 2
- Say "move AI upstream" at least twice
- Pause after the Network-tab reveal
- Don't caveat RAG mid-talk — save it for Q&A

## Timing
1:00 · 5:00 · 1:00 · 4:00 · 3:00 · 1:00 = **15:00**
Over? Cut demo beat 4. Under? Open a briefing JSON, scroll it.
