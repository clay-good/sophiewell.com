# v12 audit - cpis-vap

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Pugin J, Auckenthaler R, Mili N, Janssens JP, Lew PD, Suter PM. Am Rev Respir Dis. 1991;143(5 Pt 1):1121-1129 (re-fetched; cross-read with MDCalc, a JAMP 2025 verbatim reproduction, and MDApp).

`lib/critcare-v112.js cpisVap()` scores six components 0/1/2 -- temperature
(36.5-38.4 = 0, 38.5-38.9 = 1, >= 39 or <= 36 = 2), leukocytes (4000-11000 = 0,
else 1, with +1 when band forms are >= 50%), tracheal secretions
(none/non-purulent/purulent), oxygenation by PaO2/FiO2 (>= 240 or ARDS = 0,
<= 240 and no ARDS = 2), chest radiograph (none/diffuse/localized), and culture
(none/moderate, +1 when the same organism is on Gram stain) -- to a total of
0-12; a score greater than 6 suggests VAP. Class A.

## Boundary worked examples added
- temp 39 + WBC 12000 + purulent + low oxygenation + diffuse infiltrate = 8 -> VAP.
- a total of exactly 6 is at or below the threshold (VAP less likely).
- the band-forms and same-organism bonuses each add 1, capped at 2 per component.
- temperature bands at 37 / 38.7 / 39.5 / 35.5.
- partial input (no temp or WBC) -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the six-component 0/1/2 structure and the > 6 VAP threshold matched
  the sources. SOURCE NOTE: the leukocyte bonus is for band forms >= 50% in the
  primary literature; MDCalc renders it as an absolute ">= 500" -- the tile uses
  the Pugin >= 50% form and records the variant. The oxygenation ARDS exclusion
  is load-bearing (a low ratio scores 2 only when ARDS is absent). Match. PASS.

## Edge-input handling notes
- requires temperature and leukocytes as numbers; the categorical components
  default to their 0-point option, so the score is valid once the two numbers are
  entered. Each bonus-bearing component is capped at 2.

## A11y / keyboard notes
- Two number inputs, four selects, two checkboxes, all labeled; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
