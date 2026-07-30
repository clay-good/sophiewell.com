# spec-v616 — Frisen scale (papilledema grading)

**Status:** shipped. Catalog 1465 -> 1466. MCP wave 441, 1402 -> 1403 adapters.

## Why this tile

A **whole-concept gap**. "Papilledema", "optic disc" and "intracranial hypertension" were all zero-hit across
`app.js`, and every slug spelling returned zero. Zero-hit *concept* words, rather than zero-hit eponyms, have
been the most productive finder in this program.

## What it does for the reader

Describe the halo and answer three vessel findings; the tile **derives** the grade and tells you which single
feature moved it. If the findings contradict each other, it says so instead of returning a number.

## The findings the tile is built around

| Finding | Consequence |
|---|---|
| **The scale is cumulative** — "features of grade 2 plus...". | A disc cannot be grade 3 while its halo still shows a temporal gap. The tile **enforces** this: contradictory findings return no grade, with the contradiction named. |
| **The temporal gap is the entire difference between grade 1 and grade 2.** | One feature, one whole grade. It exists because the temporal border is spared, its axons being of fine caliber — a real finding, not an artefact. |
| **Grade 3 vs 4 is the *location* of the obscured vessel, not the amount.** | As it *leaves* the disc against *on* the disc. Identical finding, different place. |
| **Grade 4 is defined by an exception: one major vessel on the disc must be spared.** | If none is spared it is grade 5. A negative condition inside a severity definition, and the only thing separating the top two grades. |
| **Partial and total obscuration are not the same.** | Grade 2 *permits* partial obscuration; grades 3+ require total obscuration of a portion. Conflating them raises the grade. |
| **The grade does not measure intracranial pressure.** | It describes an appearance. A low grade does not exclude raised pressure; a high grade is not a pressure value. |

## Sourcing (spec-v97)

Re-fetched and double-confirmed, never recalled. Both sources give the same six grades with the same
boundaries — including the spared-vessel condition on grade 4, the partial-versus-total distinction at grade
2, and the "features of grade N plus..." cumulative phrasing that the tile turns into an enforced rule.
Neither source claims the grade measures intracranial pressure, which is why the tile states the negative
explicitly.

## Posture (spec-v11 §5.3)

Grades a **disc appearance**. It does not diagnose papilledema or its cause, does not distinguish true
papilledema from pseudopapilledema, does not measure or estimate intracranial pressure, does not indicate
whether imaging or a lumbar puncture is needed, and does not decide treatment.

## Files

`lib/frisen-v616.js`, `views/group-v616.js`, `mcp/adapters/frisen-v616.js`, `test/unit/frisen.test.js`.
Registered in `app.js` (tile + RV616), `mcp/catalog.js`, `test/unit/fuzz-tools.test.js`,
`test/mcp/mcp-search-relevance.test.js`, `data/synonyms.json`, `lib/meta.js`, `docs/mcp-coverage.md`.
