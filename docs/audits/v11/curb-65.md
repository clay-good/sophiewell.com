# v11 audit - CURB-65 (`curb-65`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Lim WS, van der Eerden MM, Laing R, et al. *Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study.* Thorax. 2003;58(5):377-382.

Five criteria, each 1 point per Lim 2003 Table 4: **C**onfusion (new disorientation to person/place/time), **U**rea > 7 mmol/L (BUN > 19 mg/dL; the tile labels the input as BUN > 20 mg/dL, which is the standard US-units rounding of 7 mmol/L * 2.8 = 19.6), **R**espiratory rate >= 30/min, **B**lood pressure (SBP < 90 or DBP <= 60), age >= **65**. Total 0-5. 30-day mortality bands per Lim 2003 Table 5: 0 = 0.7%, 1 = 2.1%, 2 = 9.2%, 3 = 14.5%, 4 = 40%, 5 = 57%. Implementation bands: 0-1 Low (outpatient candidate), 2 Moderate (consider hospitalization), 3-5 Severe (ICU consideration). `lib/scoring-v4.js curb65()` filters five booleans.

## Boundary examples added
- low: no criteria positive -> 0 (Low; outpatient candidate; 0.7% 30-day mortality per Lim 2003).
- mid: META example (confusion + age65) -> 2 (Moderate; 9.2%).
- high: all five criteria positive -> 5 (Severe; 57%).

Band-edge: 1 -> top of Low (2.1%); 3 -> bottom of Severe (14.5%, jumps to the ICU-consideration band).

## Cross-implementation differential
- Reference implementation: Lim 2003 Thorax Table 4 + Table 5.
- Test case: META example (confusion + age65).
- Sophie result: 2, "Moderate (consider hospitalization)".
- Reference result: 2, 30-day mortality 9.2% (Lim 2003 Table 5).
- Delta: 0 ordinal-band categories. PASS.

## Edge-input handling notes
- The BUN criterion uses the US unit (mg/dL) with the rounded > 20 cutoff that approximates the source's > 7 mmol/L (= 19.6 mg/dL). The exact source cutoff in SI is preserved in the helper text so a clinician using SI units can map back.
- The blood-pressure criterion is a single checkbox covering "SBP < 90 OR DBP <= 60" per the source's disjunctive definition; the label spells out both conditions to discourage the common error of requiring both.
- A simplified CRB-65 (no urea, for primary care without lab access) is documented in Lim 2003 as a derivative; this tile implements full CURB-65 only.

## A11y / keyboard notes
- Five labeled checkboxes, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
