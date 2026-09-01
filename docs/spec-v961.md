# spec-v961 — A screening cutoff was off by one, in the direction that misses people

## The finding

`no-apnea-score` computed `abnormal = score > 3`. Its derivation says, in one sentence:

> "We used the cutoff **≥ 3** to classify patients at high risk of having OSA."
> — Duarte RLM, et al. *J Clin Sleep Med.* 2018;14(7):1097-1107 (PMC6040787)

So a patient scoring **exactly 3** — the paper's own threshold — was told they were at *lower*
risk. On a screening instrument, an off-by-one in that direction is the one that matters: it
sends people away.

## How it surfaced, which is the part worth keeping

The tile was on `KNOWN_DISAGREEMENTS` — the frozen list of links whose record and citation
disagree — and had been sitting there since spec-v945 as "cites a paper no index carries under
the numbers given". I had checked it by looking the numbers up, twice, and given up both times.

What found it was a **different technique**: searching PMC *full text* for how other papers cite
the work, rather than searching indexes for the citation's own numbers. That immediately turned
up the real reference, and reading it turned up two things the numbers never would have:

**The citation named the wrong instrument.** It read *"Obstructive sleep apnea screening with a
**4-item** instrument, named No-Apnea. Sleep Breath. 2018;22(4):989-996."* No-Apnea is a
**2-item** model — neck circumference and age — which two independent validation papers state
outright, and which this tile's own two input fields have always reflected. The four-item
instrument from the same group is the **GOAL questionnaire**, a different tool. The citation had
borrowed one paper's title pattern and another's journal.

**And then the cutoff.** Reading the right paper is what exposed the threshold.

## What changed

- `lib/entsleep-v243.js`: `score > 3` → `score >= 3`, and the band text with it.
- The citation now names the real paper, and links it (PMID 29991419).
- The explanation says No-Apnea is a two-item model and names GOAL as the four-item one, so the
  next reader does not repeat the conflation.
- `KNOWN_DISAGREEMENTS` **4 → 3**.

## The tests

The boundary is pinned from both sides — a score of 3 is high risk, a score of 2 is not — with
the paper's sentence quoted in the test, because that sentence is the whole justification.

## Proof

| Check | Result |
| --- | --- |
| score exactly 3 | **high risk**, was "lower risk" |
| score 2 | lower risk, unchanged |
| `/#no-apnea-score` in the live app | 3 → "high OSA risk (>= 3)"; 2 → "lower OSA risk (< 3)" |
| `node scripts/check-citation-agreement.mjs` | clean — **3** known disagreements (was 4) |
| `entsleep-v243.test.js` | 11 pass, 3 new |
| `npm run lint`, `npm run build` | clean |
| `npm run test:unit` / `test:mcp` | 12,976 / 421 |
