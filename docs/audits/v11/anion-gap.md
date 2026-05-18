# v11 audit - Anion Gap (`anion-gap`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Emmett M, Narins RG. *Clinical use of the anion gap.* Medicine (Baltimore). 1977;56(1):38-54. Albumin correction factor cross-checked against Figge J, Jabor A, Kazda A, Fencl V. *Anion gap and hypoalbuminemia.* Crit Care Med. 1998;26(11):1807-1810.

Formula: AG = Na − (Cl + HCO3). Optional albumin correction: AG_corr = AG + 2.5 × (4 − albumin g/dL). `lib/clinical.js anionGap()` implements both verbatim; rounds to 1 decimal via `r1`. Normal reference: 10-14 mEq/L (Emmett 1977); >12 with corrected AG is the contemporary HAGMA trigger.

## Boundary examples added
- low: Na 140, Cl 110, HCO3 24, alb 4.0 -> AG 6 (low; consider lab error, hypoalbuminemia, paraproteinemia per Emmett 1977 § Differential).
- mid: META example (Na 140, Cl 100, HCO3 24, alb 4.0) -> AG 16, corrected AG 16 (mildly elevated; HAGMA differential).
- high: Na 140, Cl 90, HCO3 10, alb 4.0 -> AG 40 (severely elevated; MUDPILES differential).

Albumin-correction edge: Na 140, Cl 106, HCO3 24, alb 2.0 -> AG 10 (looks normal); corrected AG = 10 + 2.5 × (4-2) = 15 (elevated, consistent with Figge 1998).

## Cross-implementation differential
- Reference implementation: Emmett 1977 formula + Figge 1998 correction.
- Test case: META example.
- Sophie result: AG 16, corrected AG 16.
- Reference result: 140 − (100 + 24) = 16; correction = 16 + 2.5 × (4-4) = 16.
- Delta: 0%. PASS.

## Edge-input handling notes
- All three primary inputs (Na, Cl, HCO3) are required and validated by the shared `num` helper; non-numeric or NaN throws before the subtraction.
- The albumin input is optional; when omitted, the corrected-AG row is omitted from the output rather than rendered as `NaN`.
- This tile uses K+-excluded AG (the classic three-variable formula). The companion `corrected-anion-gap` tile offers the K+-inclusive variant per Figge 1998 with explicit Figge framing.

## A11y / keyboard notes
- Four labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
