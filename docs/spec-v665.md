# spec-v665.md — Cleveland Clinic (Wexner) Constipation Score

> Status: **SHIPPED (2026-08-08).** Builds the `cleveland-constipation` tile. Catalog **1495 → 1496**, group G.

## Why

A **distinct-instrument-same-eponym** gap. The catalog had the Wexner *fecal incontinence* score (`wexner`,
Jorge & Wexner 1993), but not the Wexner *constipation* score (Agachan 1996) — a different instrument from the
same group. This is the standard constipation-severity score.

## What it does

Eight items summed to **0–30**. Seven items score 0–4; the **Assistance** item scores 0–2 (so the maximum is
30, not 32).

| Item | Range |
| --- | --- |
| Frequency of bowel movements | 0–4 |
| Difficulty (painful evacuation effort) | 0–4 |
| Feeling of incomplete evacuation | 0–4 |
| Abdominal pain | 0–4 |
| Time in lavatory per attempt | 0–4 |
| Type of assistance (none / stimulant laxatives / digital or enema) | 0–2 |
| Unsuccessful attempts per 24 h | 0–4 |
| Duration of constipation | 0–4 |

## Posture (spec-v97)

Higher = more severe. The derivation cohort all scored **> 15**, so a score above 15 is the commonly cited
cutoff for constipation; secondary sources vary (some write ≥ 15), so the tile reports the total and treats the
cutoff as advisory (implemented as strictly **> 15**).

## Files

- `lib/cleveland-constipation-v665.js` — `clevelandConstipation()`, `CLEVELAND_ITEMS`, `CLEVELAND_NOTE`.
- `views/group-v665.js` (RV665) — eight ordinal selects (seven 0–4, assistance 0–2); a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/cleveland-constipation-v665.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/cleveland-constipation.test.js` — 5 tests (8 items / 0–30 range, assistance 0–2 cap, strict > 15
  cutoff boundary, example, required items).
- `docs/spec-v665.md` (this file).

## Sourcing (spec-v97)

Agachan F, Chen T, Pfeifer J, Reissman P, Wexner SD. A constipation scoring system to simplify evaluation and
management of constipated patients. *Dis Colon Rectum.* 1996;39(6):681-685 (PMID 8646957). A source-
verification subagent confirmed all eight items and anchors, the assistance item's 0–2 maximum (giving the
0–30 total), and corrected the cutoff operator to **> 15** (the source says "more than 15," not ≥ 15). Cross-
referenced as distinct from the Wexner fecal incontinence score (Jorge & Wexner 1993, PMID 8416784).
