# v11 audit - Glasgow Coma Scale (`gcs`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Teasdale G, Jennett B. *Assessment of coma and impaired consciousness: A practical scale.* Lancet. 1974;2(7872):81-84. Severity bands cross-referenced against Teasdale G, Maas A, et al. *The Glasgow Coma Scale at 40 years.* Lancet Neurol. 2014;13(8):844-854.

GCS components: Eye opening 1-4, Best verbal response 1-5, Best motor response 1-6. Total 3-15.
Severity bands per the Teasdale 1974 / 2014 framing: Mild ≥13, Moderate 9-12, Severe ≤8. Implemented in `lib/clinical.js gcs` identically.

## Boundary examples added
- low (deepest coma): E=1, V=1, M=1 -> total 3, "Severe"
- mid (META example): E=3, V=4, M=5 -> total 12, "Moderate"
- high (fully alert): E=4, V=5, M=6 -> total 15, "Mild"

Boundary transitions:
- total 9 (Moderate floor): E=2, V=3, M=4 -> 9 -> "Moderate"
- total 8 (Severe ceiling): E=2, V=2, M=4 -> 8 -> "Severe"
- total 13 (Mild floor): E=3, V=4, M=6 -> 13 -> "Mild"

## Cross-implementation differential
- Reference implementation: Teasdale & Jennett 1974 original scoring rubric; Lancet Neurol 2014 (40-year retrospective) severity-band schema.
- Test case: META example E=3, V=4, M=5.
- Sophie result: 12, "Moderate".
- Reference result: 12, Moderate (9-12 band, per Teasdale 1974/2014).
- Delta: 0%. PASS.

## Edge-input handling notes
- `lib/clinical.js gcs` validates each component via `num(field, value, { min, max })` with the published per-component caps (eye 1-4, verbal 1-5, motor 1-6). Out-of-range values throw a typed `RangeError` that the renderer surfaces as a muted paragraph rather than computing a wrong total. PASS.
- Each input is a `<input type="number">` range field bound to a `<label for>` carrying the visible label. PASS.
- The renderer prefills the maxima (E=4, V=5, M=6) as the "example" baseline so the default render is a benign GCS 15, not an alarming low score. PASS.

## A11y / keyboard notes
- Three number inputs, all label-bound, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
