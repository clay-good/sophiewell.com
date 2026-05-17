# v11 audit - Benzodiazepine Equivalence (Ashton) (`benzo-equiv`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Ashton CH. *Benzodiazepines: How They Work and How to Withdraw* (the Ashton Manual), §I.1 equivalence table. Numeric values cross-checked against the equivalence column reproduced in the Maudsley Prescribing Guidelines in Psychiatry (14e).

## Boundary examples added
Pivot is 10 mg diazepam. `benzoEquivalent` = doseMg × (toRow.equivDoseMg / fromRow.equivDoseMg).
- low: 10 mg diazepam -> lorazepam = 10 × (1 / 10) = 1.00 mg (META example)
- mid: 1 mg alprazolam -> diazepam = 1 × (10 / 0.5) = 20.00 mg
- high: 2 mg lorazepam -> clonazepam = 2 × (0.5 / 1) = 1.00 mg

Per-drug pivot verification against `data/benzo-equiv/benzo.json`:
- diazepam 10, alprazolam 0.5, lorazepam 1, clonazepam 0.5, oxazepam 20, temazepam 20, midazolam 7.5, chlordiazepoxide 25.

These match the Ashton Manual table verbatim.

## Cross-implementation differential
- Reference implementation: Maudsley Prescribing Guidelines in Psychiatry (14e), benzodiazepine equivalence table.
- Test case: 2 mg alprazolam -> diazepam.
- Sophie result: 2 × (10 / 0.5) = 40.00 mg.
- Reference result: 40 mg (Maudsley 14e, Ashton).
- Delta: 0%. PASS.

## Edge-input handling notes
- Renderer requires `dose > 0` before computing. Unknown drug pairs return `null` and surface as the muted "No equivalence available." line; cannot happen from the UI because both selects are sourced from the same shard. PASS.
- The Ashton equivalence table is acknowledged in the field as a withdrawal-rate reference and is not a replacement for clinical judgment for short-acting / long-acting cross-tapers; the citation makes the source explicit and the tile carries the high-alert framing implicit in the Group F section. PASS.

## A11y / keyboard notes
- Dose input + two selects; all label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- (Citation tightening, shipped this PR) Pre-v11 the citation contained a bare URL (`https://www.benzo.org.uk/manual/`), which spec-v11 §3.5 rejects. The wave-0 commit dropped the URL; the citation now reads "Ashton CH. Benzodiazepines: How They Work and How to Withdraw (the Ashton Manual)."

## Status
- PASS-WITH-FIXES
