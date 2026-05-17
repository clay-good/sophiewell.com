# v11 audit - Pediatric Dose Safety Bounds (`peds-dose`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: AAP *Red Book* (current edition) pediatric dosing tables, NLM/DailyMed manufacturer labels, and the *Harriet Lane Handbook* (22e) pediatric formulary.

## Boundary examples added (table coverage rows)
This is a pure reference table tile (no inputs). Per spec-v11 §3.3 step 10, coverage rows are individual table entries verified against the cited source:
- Acetaminophen (PO/PR): 10-15 mg/kg q4-6h; max 75 mg/kg/day, max single 1 g. Matches Harriet Lane (22e) PO acetaminophen entry.
- Ibuprofen (PO): 5-10 mg/kg q6-8h. Matches Harriet Lane; warning re dehydration / age <6 mo is per AAP Red Book.
- Amoxicillin (PO): 25-50 mg/kg/day divided q8-12h, high-dose 80-100 mg/kg/day for AOM. Matches AAP AOM guideline (Lieberthal 2013).
- Ceftriaxone (IV): 50-75 mg/kg/day; meningitis dosing 80-100 mg/kg/day note retained. Matches Harriet Lane.
- Epinephrine (IM, anaphylaxis): 0.01 mg/kg, max 0.3-0.5 mg, 1 mg/mL concentration. Matches AAP / NIAID anaphylaxis guideline.
- Albuterol nebulized: 0.15 mg/kg, min 2.5 mg. Matches AAP asthma management protocols.
- Dexamethasone (croup): 0.6 mg/kg PO/IM/IV single dose, max 16 mg. Matches the AAP croup management guideline.

All seven rows verified row-by-row against the cited references; no numerical drift.

## Cross-implementation differential
- Reference implementation: Harriet Lane Handbook (22e) pediatric formulary.
- Test case: amoxicillin standard dose for AOM in a 20 kg child.
- Sophie reference: 25-50 mg/kg/day divided q8-12h; high-dose 80-100 mg/kg/day for AOM.
- Reference result: identical (AAP AOM guideline, Lieberthal 2013; reaffirmed 2020).
- Delta: 0%. PASS.

## Edge-input handling notes
- No inputs. The page-level muted paragraph framing - "Reference table. Verify against your institution's formulary." - is rendered above the table, and a "Citations: AAP, NLM/DailyMed, manufacturer labels. Reference only." caption sits below. PASS.
- The audit notes that the bundled table is illustrative (7 rows) and not exhaustive; the spec-v11 §1 audit framing is satisfied because every row that ships is cited and verified, not because every drug in pediatric practice is covered.

## A11y / keyboard notes
- `<table class="lookup-table">` with `scope="col"` headers, standard semantic markup. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
