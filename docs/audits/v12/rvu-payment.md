# v12 audit - rvu-payment

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: 42 CFR 414.20-414.22 (RVU components and the GPCI adjustment); SSA 1848(b); the annual CMS PFS Final Rule conversion factor (CY2026 = $32.7442 per RVU) and the CMS PFS Relative Value Files. Allowed = [workRVU*workGPCI + peRVU*peGPCI + mpRVU*mpGPCI] x CF, with separate non-facility and facility PE RVUs.

`lib/billing-v78.js rvuPayment()` computes the locality-adjusted allowed amount for both sites of service in integer cents, plus the site-of-service differential. Bundled `data/mpfs` RVUs and `data/mpfs/gpci.json` triplets are an optional convenience (doctrine clause 2); the three RVUs, the GPCI triplet, and the CF are all overridable, so the tool never fails for a code or locality absent from the bundle.

## Boundary examples added
- tile example: 99214, National Average GPCI (1/1/1), CF 32.7442 -> non-facility $116.24, facility $89.72, site differential $26.52 (hand-checked to the cent).
- GPCI override (Manhattan 1.058/1.225/1.483), 2 units -> per-unit allowed scales by each component's GPCI, x2.
- workRVU 0 with PE-only line (e.g. venipuncture) -> facility allowed never negative; finite.

## Cross-implementation differential
- Reference: the CMS PFS allowed-amount formula (42 CFR 414.22) computed by hand.
- Test case: 99214 work 1.92 / PE-NF 1.5 / PE-F 0.69 / MP 0.13, GPCI 1/1/1, CF 32.7442.
- Sophie result: 3.55 RVU * 32.7442 = $116.24 non-facility; 2.74 RVU * 32.7442 = $89.72 facility.
- Reference result: identical to the cent. PASS. Site differential equals the PE-RVU delta (1.5 - 0.69) * 1 * 32.7442 = $26.52, also matched.

## Edge-input handling notes
- All RVUs, GPCI, and CF validate as finite >= 0 (num()); a negative or non-finite input throws RangeError/TypeError caught by the renderer safe() wrapper.
- Money is integer cents end-to-end; one rounding at the conversion-factor edge; units multiply the rounded cents (1..1000).

## A11y / keyboard notes
- Labeled text/number inputs and one labeled `<select>` for locality; output region `aria-live="polite"`; numeric fields carry inputmode="decimal". `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
