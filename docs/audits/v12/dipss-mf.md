# v12 audit - dipss-mf

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Passamonti F, Cervantes F, Vannucchi AM, et al. A dynamic prognostic model to predict survival in primary myelofibrosis (IWG-MRT). Blood. 2010;115(9):1703-1708.

`lib/onc-v134.js dipssMf()` returns the DIPSS total (0-6) and risk group. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- Age > 65 = 1; WBC > 25 x10^9/L = 1; hemoglobin < 10 g/dL = 2 (the ONLY weighted-2 term - the common coding trap, guarded by a dedicated test); peripheral blood blasts >= 1% = 1; constitutional symptoms = 1.
- Total 0-6 -> low (0) / int-1 (1-2) / int-2 (3-4) / high (5-6). Median survival not-reached / 14.2 / 4 / 1.5 years.

## Boundary worked examples added
- 0 -> Low; hemoglobin < 10 alone scores 2 (int-1); the int-1/int-2 (2/3) and the 6-point maximum -> high boundaries; strict age > 65 and WBC > 25 edges with the inclusive blasts >= 1% edge.

## Edge-input handling notes
- Any blank lab or unanswered constitutional-symptoms flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Four labeled number inputs + one labeled yes/no select; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
