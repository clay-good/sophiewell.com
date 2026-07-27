# spec-v513.md — ASRS v1.1 Part A (adult ADHD screener) tile

> Status: **SHIPPED (2026-07-27).** Builds the `asrs` tile — the six-item ASRS v1.1 Part A screener, scored by
> per-item thresholds rather than a sum. Catalog **1362 → 1363**, group G.

## Why

Adult ADHD was a **whole-concept gap**: `asrs`, `adhd`, `attention deficit`, `conners`, `vanderbilt`, and
`wender` were all zero-hit across `corpus.json` and `app.js`. Part A is the six-item screener that primary
care and psychiatry actually use, and it is the one instrument in this class most likely to be scored wrong
from memory.

## What it does

**The answers are not summed.** Every item uses the same 0-4 frequency scale, but an answer only counts toward
the screen at a threshold that differs by item:

| Items | Counts at |
| --- | --- |
| 1-3 (details, organization, remembering) | sometimes or more (2+) |
| 4-6 (avoidance, fidgeting, driven by a motor) | often or more (3+) |

**4 or more** counting answers is a positive screen. Printed forms encode this as shaded boxes — which is
exactly what gets mis-transcribed when the form is not in front of you. A respondent who answers "sometimes"
to all six has a raw total of 12 out of 24 and a **negative** screen; the tile reports the raw total but
labels it plainly as not the screen, so the two numbers cannot be confused.

- `lib/asrs-v513.js` — pure answers → the counting total, the per-item counting flags, and the raw total.
  Exports `ASRS_ITEMS` (each question with its own `countsAt`) and `FREQUENCY_SCALE` so the renderer, the
  adapter, and the tests share one source of wording *and* one source of the thresholds. Rejects a missing
  item, a non-integer, and anything outside 0-4.
- `views/group-v513.js` (RV513) — six selects (dom `as-q1` … `as-q6`), each with a real `<label for>` that
  states that item's own threshold in the label.
- `lib/meta.js` — Kessler and colleagues 2005 citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article; the issuer name appears only inside the instrument's
  own title, not as a guideline issuer).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1363.

**HIGH-STAKES:** it is a **screen**, not a diagnosis ([spec-v11](spec-v11.md) §5.3). A positive screen means
symptoms are consistent with adult ADHD and further evaluation is warranted; the diagnosis needs symptoms
across settings, onset in childhood, functional impairment, and the exclusion of other causes. A negative
screen does not exclude ADHD. The result is **not** an indication for stimulant or non-stimulant medication,
for a controlled-substance prescription, or for an academic or workplace accommodation.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`asrs`), the condition (`adhd`, `attention
deficit`), and the neighbouring instruments (`conners`, `vanderbilt`, `wender`) — each against **both**
`corpus.json` and `app.js`; plus a `test/unit/` and `lib/` scan. All six were zero-hit: nothing in the catalog
touched ADHD at all.

## Sourcing (spec-v97)

- **Citation:** Kessler RC, Adler L, Ames M, et al. The World Health Organization Adult ADHD Self-Report Scale
  (ASRS): a short screening scale for use in the general population. *Psychol Med.* 2005;35(2):245-256.
- Cross-verified against adult-ADHD references reproducing the same six Part A questions, the same 0-4
  frequency scale, the same split of item thresholds, and the same positive cut of 4.

## Verification

Lint (all catalog-truth surfaces at 1363), unit suite (+9 + fuzz), a11y, build — all green. One test exists
purely to pin the trap: a raw total of 12 with a negative screen.

## Out of scope

The tile does not administer Part B (the eighteen symptom-frequency items), score the childhood-onset or
cross-setting criteria, or cover the pediatric instruments (Vanderbilt, Conners). The MCP adapter +
golden-probe promotion follow in the next wave (338).
