# v12 audit - rdai-tal

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Lowell DI, Lister G, Von Koss H, McCarthy P. Wheezing in infants: the respiratory distress assessment instrument. Pediatrics. 1987;79(6):939-945; with the Tal respiratory score (Tal A, et al. Pediatrics. 1983;71(1):13-18). Sub-score structure re-fetched and cross-verified across two independent reproductions (RDAI max 17; Tal max 12).

`lib/peds-v140.js rdaiTal()` sums six RDAI sub-scores -- wheeze on expiration
(0-4), inspiration (0-2), and location (0-2), plus supraclavicular, intercostal,
and subcostal retractions (each 0-3) -- to 0-17. When any Tal input is entered it
also sums respiratory rate, wheeze, cyanosis, and accessory-muscle use (each 0-3)
to 0-12. Class A.

## Source-governance notes
- RDAI max = wheeze (4+2+2 = 8) + retractions (3+3+3 = 9) = 17, confirmed.
- The Tal score is the non-age-stratified original (RR bands <=30 / 31-45 / 46-60
  / >60). The literature carries age-stratified and SpO2-substituted modified-Tal
  variants; this tile ships the original 4-parameter cyanosis version and names it.
- Both instruments grade severity for trend; neither sets a validated treatment
  threshold, so the tool reports the totals and names the components scored and
  asserts no management action.
- The Tal score is reported only when at least one Tal input is entered, so an
  RDAI-only assessment is not padded with a spurious Tal 0.

## Boundary worked examples added
- exp 3, insp 2, loc 2, supra 2, inter 2, sub 1 -> RDAI 12; Tal RR 2, wheeze 2,
  cyanosis 1, accessory 2 -> Tal 7 (moderate).
- max sub-scores -> RDAI 17.
- no Tal input -> Tal null, RDAI only.
- out-of-range sub-scores clamp to their range (RDAI never exceeds 17).
- Tal 9-12 reports the severe band.

## Edge-input handling notes
- Every sub-score clamps to [lo, hi]; a blank scores its low band; the tool is
  always valid and bounded; scalar-path fuzz returns finite, leak-free strings.

## A11y / keyboard notes
- Ten labeled selects (six RDAI, four Tal) each with a "not assessed" first option;
  output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
