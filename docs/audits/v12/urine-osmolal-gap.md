# v12 audit - urine-osmolal-gap

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Halperin ML, Goldstein MB, Stinebaugh BJ, Jungas RL. Clin Invest Med. 1988;11(3):198-202 (PMID 3168315). Calculated-osmolality identity cross-read against the standard 2×(Na+K) + urea/2.8 + glucose/18 form.

`lib/acidbase-v129.js urineOsmolalGap()` computes calculated urine osm = 2×(Na + K) + urea nitrogen(mg/dL)/2.8 + glucose(mg/dL)/18, gap = measured − calculated, and gap/2 ≈ urinary NH4+. Class A (journal+author citation — no docs/citation-staleness.md row).

## Source-governance note
- The urea term uses urine urea nitrogen in mg/dL divided by 2.8 and glucose in mg/dL
  divided by 18 — the standard US-unit calculated-osmolality identity. Half the gap
  approximates urinary ammonium (the unmeasured cation it tracks).
- Reading: in a normal-anion-gap acidosis a wide gap (≥ ~100 mOsm/kg, intact NH4+
  excretion) points to an extrarenal cause such as diarrhea; a narrow gap points to
  impaired distal acidification (renal tubular acidosis).

## Boundary worked examples added
- wide gap: measured 600, Na 40, K 20, UUN 280, glucose 0 → calc 220, gap 380, ~NH4+ 190
  (intact excretion).
- narrow gap: measured 350, Na 60, K 40, UUN 196, glucose 0 → calc 270, gap 80, ~NH4+ 40
  (renal tubular acidosis, flagged).
- glucose contributes via /18; threshold at 100 mOsm/kg.
- zero solutes allowed; missing measured osm → valid:false; scalar input → valid:false.

## Edge-input handling notes
- Measured osmolality must be positive; the four solute inputs are non-negative (zero is
  a valid input). Signed gap and its half reported; band classified on the rounded gap.

## A11y / keyboard notes
- Five number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
