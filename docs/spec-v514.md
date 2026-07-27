# spec-v514.md — Young Mania Rating Scale (YMRS) tile

> Status: **SHIPPED (2026-07-27).** Builds the `ymrs` tile — the eleven-item clinician rating of manic
> severity, total 0-60 with four double-weighted items. Catalog **1363 → 1364**, group G.

## Why

Mania was a **whole-concept gap**: `ymrs`, `young mania`, and `mania` were all effectively zero-hit across
`corpus.json` and `app.js`. The YMRS is the standard severity measure on an inpatient psychiatry unit and the
outcome measure in essentially every acute-mania trial.

## What it does

It is a sum, but **not a uniform one** — which is the error the tile exists to prevent:

| Items | Range |
| --- | --- |
| Mood, activity/energy, sexual interest, sleep, thought disorder, appearance, insight | 0-4 each |
| **Irritability, speech, thought content, disruptive or aggressive behavior** | **0-8 each** |

Total **0-60**. The four double-weighted items are the hardest to rate and carry twice the weight, so the tile
reports their subtotal (of 32) next to the total and prints each item's own range in its label.

- `lib/ymrs-v514.js` — pure ratings → total, the double-weighted subtotal, and the remission-range flag.
  Exports `YMRS_ITEMS` (each item with its own `max`) so the renderer, the adapter, and the tests share one
  source of wording *and* one source of the weights; the 60 ceiling is derived from that array, not typed in.
  Validates **per item**: a 5 is legal on a 0-8 item and rejected on a 0-4 one.
- `views/group-v514.js` (RV514) — eleven selects (dom `ym-q1` … `ym-q11`), each with a real `<label for>`
  stating that item's range, and option lists generated to each item's own maximum.
- `lib/meta.js` — Young and colleagues 1978 citation + accessed date + grouped bands. No citation-staleness
  row (a named-author article, no guideline-issuer acronym).
- 8 worked-example unit tests + fuzz registration; synonym entry; corpus → 1364.

**The bands question (spec-v97).** Published severity bands for the YMRS vary between sources and none come
from the original scale, so the tile **does not assert any**. It states the one convention that is consistent
across the trial literature — a total of **12 or less** treated as remission — and labels it as a convention
rather than a rule the scale itself states. Asserting a "mild / moderate / severe" ladder here would have been
this codebase inventing agreement that does not exist.

**HIGH-STAKES:** it sums a clinician's own ratings at one interview. It is **not** a diagnosis of bipolar
disorder or of a manic episode, **not** a capacity assessment, and **not** an indication for admission, an
involuntary hold, restraint, or any medication ([spec-v11](spec-v11.md) §5.3). Substance intoxication,
delirium, and agitated psychosis can all raise the score.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the acronym (`ymrs`), the concept (`mania`, `young mania`),
and the neighbouring psychiatric instruments (`bush francis`, `barnes akathisia`, `simpson angus`, `ciwa`,
`cows`) — each against **both** `corpus.json` and `app.js`; plus a `test/unit/` and `lib/` scan. The catalog
carries withdrawal and akathisia scales but nothing for mania.

## Sourcing (spec-v97)

- **Citation:** Young RC, Biggs JT, Ziegler VE, Meyer DA. A rating scale for mania: reliability, validity and
  sensitivity. *Br J Psychiatry.* 1978;133:429-435.
- Cross-verified against psychiatry references reproducing the same eleven items, the same four
  double-weighted items, and the same 0-60 range.

## Verification

Lint (all catalog-truth surfaces at 1364), unit suite (+8 + fuzz), a11y, build — all green. One test pins the
per-item validation: a 5 on a 0-4 item is rejected even though 5 is a legal rating elsewhere on the scale.

## Out of scope

The tile does not score the MADRS, the HAM-D, or any depression side of a mixed presentation, and it does not
convert a YMRS total to a treatment-response percentage. The MCP adapter + golden-probe promotion follow in
the next wave (339).
