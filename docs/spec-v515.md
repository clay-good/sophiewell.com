# spec-v515.md — Simpson-Angus Scale (drug-induced parkinsonism) tile

> Status: **SHIPPED (2026-07-27).** Builds the `simpson-angus` tile — the ten-item rating of drug-induced
> parkinsonism, reported as the mean item score. Catalog **1364 → 1365**, group G.

## Why

A cluster completion. The catalog already carries the other two antipsychotic movement side effects — `aims`
for tardive dyskinesia and Barnes for akathisia — but the **parkinsonism** axis was missing:
`simpson angus`, `extrapyramidal side`, and `drug induced parkinsonism` were all zero-hit across
`corpus.json` and `app.js`. All three get looked for at the same medication review.

## What it does

Ten examination items (gait, arm dropping, shoulder shaking, elbow rigidity, wrist rigidity, leg
pendulousness, head dropping, glabella tap, tremor, salivation), each **0** normal to **4** severe.

**The reported number is the mean, not the total.** The scale is conventionally quoted as the mean item score
(total ÷ 10), with a mean **above 0.3** as the threshold in common use. Quoting the total where a mean is
expected is a ten-fold error, so the tile returns **both**, labels which is which, and shows them side by
side.

- `lib/simpson-angus-v515.js` — pure ratings → total, mean (rounded to two decimals), and the threshold flag.
  Exports `SAS_ITEMS` so the renderer, the adapter, and the tests share one source of item wording. Rejects a
  missing item, a non-integer, and anything outside 0-4.
- `views/group-v515.js` (RV515) — ten selects (dom `sa-q1` … `sa-q10`), each with a real `<label for>`.
- `lib/meta.js` — Simpson and Angus 1970 citation + accessed date + grouped bands, related to `aims-tardive`.
  No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry; corpus → 1365.

**The threshold is strictly above 0.3**, and a test pins that: a total of 3 gives a mean of exactly 0.30 and
is reported as *at or below* the threshold, not above it.

**HIGH-STAKES:** it sums an examiner's own ratings. It is **not** a diagnosis, **not** a distinction between
drug-induced parkinsonism and idiopathic Parkinson disease, and **not** an indication to reduce, switch, or
stop an antipsychotic or to start an anticholinergic ([spec-v11](spec-v11.md) §5.3). It also does not rate
akathisia or tardive dyskinesia — different side effects with their own scales — and a low score does not
exclude either.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`simpson angus`), the concept (`extrapyramidal
side`, `drug induced parkinsonism`), and a distinctive item (`arm dropping`, `glabella`) — each against
**both** `corpus.json` and `app.js`; plus a `test/unit/` and `lib/` scan. The single `glabella` hit is a
neurological-exam mention inside another tile, not a scale.

## Sourcing (spec-v97)

- **Citation:** Simpson GM, Angus JW. A rating scale for extrapyramidal side effects. *Acta Psychiatr Scand
  Suppl.* 1970;212:11-19.
- Cross-verified against psychopharmacology references reproducing the same ten items, the same 0-4 per-item
  scale, and the same convention of reporting the mean with a threshold above 0.3.

## Verification

Lint (all catalog-truth surfaces at 1365), unit suite (+9 + fuzz), a11y, build — all green.

## Out of scope

The tile does not score the AIMS or the Barnes akathisia scale (both already in the catalog), and it does not
recommend a dose change, a switch, or an anticholinergic. The MCP adapter + golden-probe promotion follow in
the next wave (340).
