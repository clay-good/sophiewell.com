# spec-v512.md — Vaizey (St Marks) fecal incontinence score tile

> Status: **SHIPPED (2026-07-27).** Builds the `vaizey` tile — the seven-row St Marks fecal incontinence
> score, total 0-24. Catalog **1361 → 1362**, group G.

## Why

A companion gap next to the existing `wexner` tile. Wexner (Cleveland Clinic) scores four leakage types plus
lifestyle on one 0-4 frequency scale, total 0-20. Vaizey keeps those rows and adds the three the Wexner score
leaves out — wearing a **pad or plug**, taking **constipating medicines**, and being unable to **defer**
defecation for 15 minutes — which is exactly why pelvic-floor units record it alongside or instead of Wexner.
`vaizey` and `st marks` were both zero-hit across `corpus.json` and `app.js`.

## What it does

| Row | Scale | Max |
| --- | --- | --- |
| Solid stool, liquid stool, gas, lifestyle | 0 never → 4 daily | 16 |
| Pad or plug worn | yes = 2 | 2 |
| Constipating medicines taken | yes = 2 | 2 |
| Cannot defer defecation 15 minutes | yes = 4 | 4 |

Total **0** (perfect continence) to **24** (totally incontinent).

- `lib/vaizey-v512.js` — pure inputs → the two subtotals and the total. Exports `FREQUENCY_ROWS`,
  `FREQUENCY_SCALE`, and `YES_NO_ROWS` (each with its point weight) so the renderer and the tests share one
  source of wording and one source of the weights. Accepts `yes`/`no`, booleans, and 0/1 on the added rows;
  rejects a missing row, a non-integer, and anything outside the scale.
- `views/group-v512.js` (RV512) — seven selects (dom `vz-solid`, `vz-liquid`, `vz-gas`, `vz-lifestyle`,
  `vz-pad`, `vz-meds`, `vz-defer`) under two headings, each with a real `<label for>`; the added rows show
  their weight in the label so the total is never a black box.
- `lib/meta.js` — Vaizey and colleagues 1999 citation + accessed date + grouped bands, related to `wexner`.
  No citation-staleness row (a named-author article, no guideline-issuer acronym).
- 8 worked-example unit tests + fuzz registration; synonym entry; corpus → 1362.

**HIGH-STAKES:** it sums what the patient reports. It is **not** a diagnosis, **not** an anorectal physiology
study, and **not** an indication for biofeedback, sacral neuromodulation, sphincter repair, or a stoma
([spec-v11](spec-v11.md) §5.3). The score does not identify a cause — obstetric sphincter injury, neuropathy,
overflow from constipation, and inflammatory bowel disease can all produce the same number — and a low score
does not mean the symptom is not worth investigating.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the eponym (`vaizey`), the institutional name (`st marks`,
`st mark`), and the concept (`incontinence`) — each against **both** `corpus.json` and `app.js`; plus a
`test/unit/` and `lib/` scan. The 18 `incontinence` hits are `wexner` (a different instrument with a different
range), plus the urinary-incontinence tiles `sandvik-incontinence` and `stamey-incontinence` — a different
organ system.

## Sourcing (spec-v97)

- **Citation:** Vaizey CJ, Carapeti E, Cahill JA, Kamm MA. Prospective comparison of fecal incontinence
  grading systems. *Gut.* 1999;44(1):77-80.
- Cross-verified against colorectal and pelvic-floor references reproducing the same four frequency rows on
  the same 0-4 scale, the same three weighted yes/no rows, and the same 0-24 range.

## Verification

Lint (all catalog-truth surfaces at 1362), unit suite (+8 + fuzz), a11y, build — all green.

## Out of scope

The tile does not compute the Wexner score (that tile already exists), the FISI or FIQL instruments, or a
minimal clinically important difference. The MCP adapter + golden-probe promotion follow in the next wave
(337).
