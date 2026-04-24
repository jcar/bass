---
theme: seriph
title: Your AI Is a Data Refinery
info: |
  Jason Carter · Valent Partners
  A bass-fishing story about moving AI upstream — out of the request path, into the build pipeline.
author: Jason Carter
highlighter: shiki
lineNumbers: false
colorSchema: dark
drawings:
  persist: false
transition: fade
mdc: true
background: /bg-title.jpeg
class: cover
---

<div class="cover-scrim"></div>

<div class="cover">
  <div class="title">Your AI Is a <span class="accent">Data Refinery</span></div>
  <div class="subtitle">A bass-fishing story about moving AI upstream.</div>
  <div class="byline">Jason Carter · Valent Partners</div>
</div>

<!--
Open cold. Don't read the slide — let them read it while you set up.
Line: "Side project. Built it changed how I think about AI in production."
Cue: demo-cheatsheet.md §1.
-->

---
layout: center
class: text-center
---

# The problem

<div class="callout" style="font-size: 2.4rem; margin-top: 2rem;">
Bass fishing is a <span class="accent">high-dimensional decision problem</span><br/>
dressed up as a hobby.
</div>

<div class="subhead" style="margin-top: 2rem;">
Water temp · clarity · barometric trend · front · season · structure · depth · time-of-day · lure · color · retrieve
</div>

<!--
One breath. Don't list the factors — point at the subhead and let them read.
Line: "Pros disagree. Conditions shift every hour. It's folk knowledge at scale."
-->

---
layout: center
class: text-center
---

# What I built

<div class="callout" style="font-size: 2rem; margin-top: 1rem;">
Strikezone — tells me <span class="accent">where</span> to fish,<br/>
<span class="accent">when</span> to fish, and <span class="accent">what</span> to throw.
</div>

<div class="subhead" style="margin-top: 3rem;">
Let me show you. →
</div>

<!--
Last slide before demo flip. Don't explain the architecture yet.
Tab to browser: jcar.github.io/bass. Follow demo-cheatsheet.md §2 (5 beats, 5 min).
Beat 5 IS the reveal — DevTools Network tab, zero requests. Pause.
Tab back here when done.
-->

---
layout: center
class: text-center
---

<div class="callout">
Zero AI<br/>
<span class="accent">downstream.</span>
</div>

<div class="subhead" style="margin-top: 2.5rem; font-size: 1.4rem;">
The refining is done — everything you saw is on the shelf.
</div>

<!--
Hold the beat. Don't rush to the next slide.
demo-cheatsheet.md §3. Say "move AI upstream" when you advance.
-->

---
layout: default
---

# Upstream vs. downstream

<div class="two-col" style="margin-top: 2rem;">
<div>
<div class="col-title">Upstream</div>
<div style="color: var(--sz-muted); font-size: 0.9rem; margin-bottom: 0.6rem;">AI in the build pipeline</div>
<ul>
<li>Refinery runs <strong>once</strong> on the corpus</li>
<li>Instant (static lookup)</li>
<li>$0 per query, forever</li>
<li>Full-context synthesis</li>
<li>Attribution baked into the schema</li>
<li>Deterministic & trivially cacheable</li>
</ul>
</div>

<div>
<div class="col-title">Downstream</div>
<div style="color: var(--sz-muted); font-size: 0.9rem; margin-bottom: 0.6rem;">AI in the request path (RAG)</div>
<ul>
<li>Every query is a mini refinery job</li>
<li>2–5s latency per request</li>
<li>Tokens burned on every user</li>
<li>Chunk boundaries lose context</li>
<li>Attribution retrofit from chunks</li>
<li>Non-deterministic, hard to cache</li>
</ul>
</div>
</div>

<div style="margin-top: 2.5rem; font-size: 1.3rem; color: var(--sz-cream); text-align: center;">
Same AI. <span style="color: var(--sz-bronze);">Different place in the pipeline.</span>
</div>

<!--
Anchor slide. Two columns. Let them scan it.
Line: "Downstream AI pays per request. Upstream AI pays once, serves forever."
Resist the urge to caveat RAG — save it for Q&A.
-->

---
layout: default
---

# The data refinery

<div class="pipeline-flow">
  <div class="node">bassmaster.com · wired2fish · MLF · <span style="opacity: 0.55;">the web</span></div>
  <div class="arrow"><span class="glyph">↓</span><span class="label">Stage 1 · Intake<span class="llm">Python · no AI</span></span></div>
  <div class="node">472 articles · crude feedstock</div>
  <div class="arrow"><span class="glyph">↓</span><span class="label">Stage 2 · Extract<span class="llm">AI pass #1 · schema-first</span></span></div>
  <div class="node">1,213 tactical facts + 108 lure opinions</div>
  <div class="arrow"><span class="glyph">↓</span><span class="label">Stage 3 · Enrich<span class="llm">AI pass #2 · implied conditions</span></span></div>
  <div class="node">1,213 enriched, tagged entries</div>
  <div class="arrow"><span class="glyph">↓</span><span class="label">Stage 4 · Package<span class="llm">pure Python · no AI</span></span></div>
  <div class="node">326 briefings · ~1MB JSON · the refined product</div>
  <div class="arrow"><span class="glyph">↓</span></div>
  <div class="node final">GitHub Pages · the tap</div>
</div>

<div class="subhead" style="margin-top: 1.2rem; text-align: center;">
Four stages. Two use AI. All of it upstream.
</div>

<!--
The anchor diagram. You'll gesture at it for the next 4 min.
demo-cheatsheet.md §4. Don't dive into each stage yet — just read the shape.
Line: "Crude in at the top. Refined product on the shelf. Then the tap."
Each Stage N on this slide has a matching detail slide coming up.
-->

---
layout: default
---

# Stage 1 — **Intake**

<div class="callout" style="font-size: 2.6rem; margin-top: 3rem;">
472 articles.<br/>
7 pros.<br/>
<span class="accent">No AI.</span>
</div>

<div class="subhead" style="margin-top: 2rem;">
Python · requests · BeautifulSoup. This is just feedstock acquisition.
</div>

<!--
Quick. Don't linger.
Line: "Dumb Python. bassmaster.com, wired2fish, MLF. Crude in. No tokens burned."
-->

---
layout: default
---

# Stage 2 — **Extract**

<div style="color: var(--sz-bronze); font-size: 1.3rem; margin-top: -0.5rem;">
AI pass 1 of 2: natural language → JSON.
</div>

```json {all|2|3-8|5|6|7|all}
{
  "lure": "Suspending Jerkbait",
  "tipRules": [{
    "when": { "season": ["winter"], "waterClarity": "clear" },
    "tip": "KVD: slow cadence, 8–10s pauses on bluebird days…",
    "proSource": "KVD",
    "priority": 10
  }]
}
```

<div class="caption" style="margin-top: 1.2rem;">
The AI's job isn't "summarize the article." It's "fill in this schema."
</div>

<!--
Line steps: highlight lure → tipRules → the 'when' condition → the attributed tip → the priority.
Line: "Two AI passes, different jobs. This one turns prose into schema. No summarization — the JSON *is* the output."
Line: "Sloppy schema, sloppy everything downstream."
-->

---
layout: default
---

# Stage 3 — **Enrich**

<div style="color: var(--sz-bronze); font-size: 1.3rem; margin-top: -0.5rem;">
AI pass 2 of 2: what the article <em>implies</em>, not what it says.
</div>

<div style="margin-top: 2rem; font-size: 1.15rem; line-height: 1.6;">

An article about <em>"cranking offshore ledges in August"</em> never writes the word "summer" or "deep" or "structure:ledge."

<div style="margin-top: 1rem;">A human reading it knows.</div>

<div style="margin-top: 1rem;">A second AI pass reads each extracted entry and fills in the implied conditions.</div>

</div>

<div class="caption" style="margin-top: 2.5rem;">
Replaced a regex pass I started with. "Switch" kept matching "twitch."
</div>

<!--
Line: "First pass is precise but incomplete. Second pass has comprehension."
The regex footnote is a laugh line — deliver it dry.
-->

---
layout: default
---

# Stage 4 — **Package**

<div class="callout" style="font-size: 2.2rem; margin-top: 2rem;">
Pure Python. <span class="accent">Zero AI.</span>
</div>

<div style="margin-top: 2rem; font-size: 1.15rem; color: var(--sz-cream);">
For every valid condition combination:
</div>

<ul style="font-size: 1.05rem; line-height: 1.8; margin-top: 0.8rem;">
<li>Score + rank the matching knowledge entries</li>
<li>Cap at 5 per angler (force diversity of voice)</li>
<li>Assemble primary + alternate + pro quotes + adjustments</li>
</ul>

<div class="subhead" style="margin-top: 2rem; font-size: 1.2rem;">
6 seasons × 3 clarities × 3 fronts × 7 lure categories <span style="color: var(--sz-bronze);">– impossible combos = 326 briefings</span>
</div>

<!--
Line: "This is deterministic. You could run it in 1995."
"Topwater in winter doesn't exist. Topwater in muddy water doesn't exist. The taxonomy enforces it."
-->

---
layout: default
---

# The tap

<div style="color: var(--sz-bronze); font-size: 1.3rem; margin-top: -0.5rem;">
The entire "AI" at request time:
</div>

```ts {all}
const briefing = briefings[
  `${season}_${clarity}_${front}_${lure}`
];
```

<div class="caption" style="margin-top: 1.5rem;">
O(1) dictionary lookup. That's why clarity flipped instantly during the demo.
</div>

<div style="margin-top: 3rem; display: flex; gap: 2rem; font-size: 1.05rem; color: var(--sz-muted);">
<div><span style="color: var(--sz-bronze);">✗</span> No vector DB</div>
<div><span style="color: var(--sz-bronze);">✗</span> No API key in the bundle</div>
<div><span style="color: var(--sz-bronze);">✗</span> No server</div>
<div><span style="color: var(--sz-bronze);">✗</span> No internet, actually</div>
</div>

<!--
Line: "This works on a dock with no cell signal. Which is the whole point."
-->

---
layout: default
---

# The numbers

<table class="numbers" style="margin-top: 1.5rem; font-size: 1.1rem;">
<thead>
<tr><th>Stage</th><th>Input</th><th>Output</th><th>AI?</th></tr>
</thead>
<tbody>
<tr><td>Intake</td><td>472 URLs</td><td>472 text files</td><td>✗</td></tr>
<tr><td>Extract</td><td>472 articles</td><td>1,213 tactical facts + 108 lure opinions</td><td>✓ once</td></tr>
<tr><td>Enrich</td><td>1,213 entries</td><td>1,213 enriched entries</td><td>✓ once</td></tr>
<tr><td>Package</td><td>1,213 entries</td><td>326 briefings</td><td>✗</td></tr>
<tr class="rt"><td>Tap</td><td>user query</td><td>instant briefing</td><td>✗</td></tr>
</tbody>
</table>

<div style="margin-top: 2.5rem; font-size: 1.15rem; color: var(--sz-cream);">
Total API spend: <span style="color: var(--sz-bronze); font-weight: 600;">low double digits.</span>
<br/>
Per-query cost forever: <span style="color: var(--sz-bronze); font-weight: 600;">$0.</span>
</div>

<!--
Let them read. Point at the runtime row.
Line: "Two batch jobs against Claude. That's the whole cost envelope."
-->

---
layout: default
---

# When this works

<div style="color: var(--sz-bronze); font-size: 1.4rem; margin-top: 0rem; line-height: 1.5;">
Smart people already wrote the answer.<br/>
Your users ask variations of the same questions.<br/>
So <strong>match them up ahead of time.</strong>
</div>

<div style="margin-top: 2rem; font-size: 1.15rem; color: var(--sz-cream);">
A quick self-test before reaching for RAG:
</div>

<ol style="margin-top: 0.8rem; font-size: 1.1rem; line-height: 1.9;">
<li>Can I <strong>list the kinds of questions</strong> people will ask?</li>
<li>Does the source material change <strong>daily, or rarely</strong>?</li>
<li>Do I need to know <strong>who said what</strong>?</li>
<li>Do users need an <strong>instant</strong> answer?</li>
</ol>

<div class="caption" style="margin-top: 1.5rem;">
3+ yeses → stop reaching for RAG.
</div>

<!--
Line: "RAG is right when the question space is wide open. Most of what we actually ship isn't."
Don't name Valent workflows out loud — the audience will connect it themselves.
-->

---
layout: center
class: text-center
---

# Takeaways

<div style="margin-top: 2rem; font-size: 1.5rem; line-height: 2; text-align: left; max-width: 48rem;">

<div>1 &nbsp; <span style="color: var(--sz-bronze); font-weight: 700;">Move AI upstream.</span><br/>
<span style="padding-left: 2.5rem; font-size: 1.15rem; color: var(--sz-muted);">Out of the request path. Into the build pipeline.</span></div>

<div style="margin-top: 1rem;">2 &nbsp; <span style="color: var(--sz-bronze); font-weight: 700;">Schema-first extraction</span> beats summarization.<br/>
<span style="padding-left: 2.5rem; font-size: 1.15rem; color: var(--sz-muted);">The JSON is the product. The prose is raw material.</span></div>

<div style="margin-top: 1rem;">3 &nbsp; If users filter on <span style="color: var(--sz-bronze); font-weight: 700;">N dimensions</span>, pre-compute the cross-product.</div>

</div>

<div style="margin-top: 2.2rem; font-size: 1.2rem; color: var(--sz-cream); text-align: center; font-style: italic;">
The thinking happens upstream. <span style="color: var(--sz-bronze);">Everything downstream is a static file and a tap.</span>
</div>

<!--
Read each one out. This is the list they'll reference Monday.
End with the italicized line — don't rush past it.
-->

---
layout: cover
background: /bg-thanks.png
class: cover
---

<div class="cover-scrim"></div>

<div class="cover">
  <div class="title" style="font-size: 3.4rem;">Tight lines!</div>
  <div class="subtitle" style="margin-top: 2rem;">
    <code style="color: var(--sz-cream); background: rgba(244,239,230,0.12); padding: 0.25rem 0.6rem; border-radius: 4px;">jcar.github.io/bass</code>
    &nbsp;·&nbsp;
    <code style="color: var(--sz-cream); background: rgba(244,239,230,0.12); padding: 0.25rem 0.6rem; border-radius: 4px;">github.com/jcar/bass</code>
  </div>
  <div class="byline">Jason Carter · Valent Partners</div>
</div>

<!--
Hold this slide. Don't click off it while answering questions.
Likely Q&A prepped in demo-talk-track.md bottom section.
-->
