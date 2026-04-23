# Strikezone — Cheat Sheet

**15 min · technical audience · live demo**
Site: jcar.github.io/bass · Repo: github.com/jcar/bass

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
- "Every rec was LLM-generated. Months ago. At build time."
- **"Treat the LLM like a compiler, not an interpreter."**
- Compiler = expensive once, cheap forever. Interpreter = expensive every request.

## 4 · Pipeline — 4:00
Show `knowledge/scripts/`. Draw the four layers:

```
472 articles ─▶ extract (LLM #1, schema-first)
            ─▶ 1,213 entries + 108 opinions
            ─▶ enrich (LLM #2, implied conditions)
            ─▶ 1,213 enriched entries
            ─▶ generate (pure Python, score + assemble)
            ─▶ 326 briefings (~1MB JSON)
            ─▶ Next.js static export ─▶ GH Pages
```

- **Scrape** → dumb Python. No AI.
- **Extract** (LLM job 1/2) → strict JSON schema. NL→JSON compiler. No summarization.
- **Enrich** (LLM job 2/2) → implied conditions the first pass missed. Replaced regex that false-matched "switch"→"twitch."
- **Generate** → no LLM. Score, rank, cap per angler, assemble.
- **Runtime** → `getBriefing(season, clarity, front, lure)` = dict lookup. O(1). That's why clarity flipped instantly.

**Numbers:** 472 → 1,213 → 326 · ~$low-double-digits total API spend · 0 tokens/query forever

## 5 · Generalize — 3:00
- Pattern = **expert corpus + bounded condition space → pre-compile the intersections.**
- "RAG is right when questions are unbounded. Most of what we ship isn't unbounded — it's filterable."
- **Valent applications:** [swap in real workflows here — memos / diligence / playbooks / runbooks]
- **The test before reaching for RAG:**
  1. Can I enumerate the dimensions?
  2. Is the corpus hourly, or quarterly?
  3. Do I need attribution? (schema gives it free)
  4. Do I need sub-second latency?

## 6 · Close — 1:00
Three takeaways:
1. **LLM = build tool, not runtime dep** — for any enumerable domain.
2. **Schema-first extraction** beats summarization. JSON is the product.
3. **N filters? Precompile the cross-product.** Cheaper than you think.

"Writeup's in Slack. Happy to pair on a real Valent workflow. Questions?"

---

## Lines worth memorizing
- "Compiler, not interpreter."
- "The only place the LLM is load-bearing is extraction."
- "Attribution is built into the schema, not retrofitted onto retrieval."
- "If you can enumerate the axes, you can compile the intersections."

## Don't forget
- Open DevTools **before** section 2
- Say "compiler not interpreter" at least twice
- Pause after the Network-tab reveal
- Don't caveat RAG mid-talk — save it for Q&A

## Timing
1:00 · 5:00 · 1:00 · 4:00 · 3:00 · 1:00 = **15:00**
Over? Cut demo beat 4. Under? Open a briefing JSON, scroll it.
