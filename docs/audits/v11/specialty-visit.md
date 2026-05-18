# v11 audit - Specialty Visit Question List (`specialty-visit`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Generic per-specialty question banks compiled by the project author from common patient-education resources. The tile generates a printable visit-prep sheet keyed by specialty; output is reference, not clinical recommendation.

## Boundary examples added
- META example: specialty "cardiology", context "palpitations workup" -> renderer composes a cardiology-visit prep sheet via `buildSpecialtyVisit` containing the cardiology question bank plus a context line.
- Empty context path: passing only a specialty produces the specialty's default question set; the context field is optional (confirmed by reading `lib/workflow-v4.js buildSpecialtyVisit`).
- Unknown specialty path: renderer surfaces "Unknown specialty." line when `buildSpecialtyVisit` returns null. The renderer's `<select>` constrains input to the eight known keys, so the path is defensive only.

## Cross-implementation differential
- N/A (question bank). The differential is "do the rendered prompts match the bundled per-specialty banks?" — covered by `test/unit/workflow-v4.test.js` per-specialty fixture coverage.

## Edge-input handling notes
- Specialty `<select>` is constrained to known values; free-text context is rendered via `text:` (no HTML injection path).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Labelled `<select>` + labelled context input; printable output uses the shared `renderPrintable` semantics. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
