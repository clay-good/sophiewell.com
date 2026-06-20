# v12 audit - capra-score

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Cooperberg MR, et al. J Urol. 2005;173(6):1938-1942 (PMC2948569, Table 1). Cross-read against MDCalc UCSF-CAPRA (calc/2046) and the cliot R package ucsf_capra_score implementation.

`lib/uro-v131.js capraScore()` sums the five UCSF CAPRA components to a 0-10 score. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- age >=50 = +1; PSA <=6 = 0, >6-10 = +1, >10-20 = +2, >20-30 = +3, >30 = +4 (bands inclusive at the top, so a PSA of exactly 6 scores 0).
- The Gleason axis is NOT the summed 2-10 score: primary pattern 4/5 = +3, else secondary pattern 4/5 = +1, else 0. There is no +2 level - it jumps 1 -> 3. The paper's Table 1 0-point PSA band prints "2.1-6" (the cohort inclusion floor); calculators implement it as PSA <=6 -> 0, which this tile follows.
- clinical stage T3a = +1 (T1/T2 = 0; the RP cohort excludes T3b+); >=34% positive cores = +1.
- Tiers 0-2 low / 3-5 intermediate / 6-10 high (the canonical three-tier scheme; the paper reported recurrence-free survival in 2-point bins).

## Boundary worked examples added
- 2 -> 3 low/intermediate flip on the Gleason axis (age 60 + PSA 7 = 2, low; + secondary pattern 4 = 3, intermediate).
- PSA exactly 6 -> 0 points; 6.1 -> 1 point; primary pattern 4 -> +3 (no +2).
- maximum 10 (high): age 70 + PSA 40 + primary 5 + T3a + 80% cores.
- blank/out-of-range component (pattern 0, blank stage, cores 120) -> valid:false; scalar -> valid:false.

## Edge-input handling notes
- age/PSA validated positive, cores in [0,100], Gleason patterns integers 1-5, stage in {T1-T2, T3a}. abnormal = total >= 3.

## A11y / keyboard notes
- Two number inputs + three labeled selects + percent input; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
