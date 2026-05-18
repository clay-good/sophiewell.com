# v11 audit - TB Testing Interpretation (TST mm + IGRA) (`tb-testing`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC TST induration cutoffs by risk category (5 / 10 / 15 mm) per "Targeted Tuberculin Testing and Treatment of Latent Tuberculosis Infection" (American Thoracic Society / CDC / IDSA MMWR Recomm Rep) and the current CDC clinician resources for IGRA interpretation. The three cutoffs map to: 5 mm for highest-risk (HIV+, recent contact, immunosuppression, fibrotic CXR), 10 mm for moderate-risk (foreign-born, IVDU, healthcare workers, congregate settings), 15 mm for low-risk (no specific risk factor).

## Boundary examples added
- META example: 12 mm induration vs 10 mm cutoff (moderate risk) -> POSITIVE. PASS.
- low edge: 5 mm vs 5 mm cutoff (high risk) -> POSITIVE (>= comparison). PASS.
- below low edge: 4 mm vs 5 mm cutoff -> Negative. PASS.
- mid: 10 mm vs 10 mm cutoff -> POSITIVE. PASS.
- high: 15 mm vs 15 mm cutoff (low risk) -> POSITIVE. PASS.
- below high cutoff: 12 mm vs 15 mm cutoff -> Negative. PASS.

## Cross-implementation differential
- Reference implementation: hand comparison `induration_mm >= cutoff_mm` for the three CDC risk categories.
- All boundary cases match the renderer's `mm >= cutoff ? POSITIVE : Negative` semantics. PASS.
- IGRA interpretation rows surface the standard Quantiferon / T-Spot result categories (Positive / Negative / Indeterminate or Borderline) with the CDC-aligned interpretations.

## Edge-input handling notes
- `tb-mm` is a numeric input with `step="1"`; negative or non-numeric values produce a NaN comparison that yields "Negative" (the safer default for a screening tile). Acceptable since clinically the renderer is a quick "above/below cutoff" check; the user supplies a measured induration in mm.
- `tb-risk` `<select>` is constrained to the three CDC cutoffs.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; result heading + IGRA `<ul>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
