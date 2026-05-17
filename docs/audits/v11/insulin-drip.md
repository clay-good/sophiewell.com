# v11 audit - Insulin Drip Math (`insulin-drip`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: ADA *Standards of Medical Care in Diabetes* (current; rate-titration framing) and the Yale Insulin Infusion Protocol (Goldberg, Diabetes Care 2004) for the structural shape of "low-intensity" / "moderate-intensity" example bands. The tile *does not* prescribe; it is explicitly framed as a math verifier against the active institution protocol.

## Boundary examples added
The renderer encodes two illustrative bands. Verifying the band logic by hand against the renderer source:
- low protocol, BG 80 mg/dL -> 0 units/hr (BG <= 100)
- low protocol, BG 175 mg/dL -> 1 unit/hr (150 < BG <= 200)
- moderate protocol, BG 220 mg/dL -> 3 units/hr (200 < BG <= 250)
- moderate protocol, BG 280 mg/dL -> 4 units/hr (BG > 250)

## Cross-implementation differential
- Reference implementation: hand-trace of the if-else ladder in `views/group-f.js` against the entered BG.
- Test case: low protocol, BG 145 mg/dL.
- Sophie result: 0.5 units/hr (100 < BG <= 150).
- Reference result: 0.5 units/hr (per the ladder).
- Delta: 0%. PASS.

## Edge-input handling notes
- Both inputs (protocol select + BG number) are typed and label-bound; the select is a closed list of two entries. PASS.
- A persistent prominent notice paragraph is rendered above the form: "This is a math verifier only. Use your institution's insulin protocol." A second muted "Example data only" paragraph appears below the result. The tile cannot be mistaken for an institution-validated protocol. PASS.
- Non-numeric BG inputs are handled by JavaScript's `Number()` (returns NaN), which the ladder's `<=` comparisons silently treat as a "no band" condition, producing 0 units/hr. This is acceptable because the framing makes the verifier-only nature explicit.

## A11y / keyboard notes
- Two form controls, both label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
