# v12 audit - arozullah-pneumonia

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Arozullah AM, Khuri SF, Henderson WG, Daley J. Development and validation of a multifactorial risk index for predicting postoperative pneumonia after major noncardiac surgery. Ann Intern Med. 2001;135(10):847-857.

`lib/periop-v97.js arozullahPneumonia()` sums the fixed integer point weights of the pneumonia index (distinct from the Arozullah respiratory-failure index, which carries different weights) and maps the total to one of five risk classes with the cited development-cohort pneumonia rate.

## Boundary worked examples added
- class edge 15/16: upper-abdominal (10) + age 50-59 (4) = 14 -> class 1 (0.2%); add COPD (5) -> 19 -> class 2 (1.2%).
- class 3: thoracic (14) + age 60-69 (9) + COPD (5) = 28 -> class 3 (4.0%).
- BUN U-shape: < 8 mg/dL adds 4, 8-21 adds 0, >= 30 adds 3.

## Cross-implementation differential
- Reference: the published per-item point table and the five class ranges with their abstract pneumonia rates. Match. PASS.

## Edge-input handling notes
- The four mutually-exclusive selects (surgery, age, functional, BUN) are required; an unselected one withholds the class. Booleans default to 0 points. Total is a bounded finite integer; the class that fired is named. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Four labeled selects + ten labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. A risk estimate, not a clearance.

## Defects opened
- none

## Status
- PASS
