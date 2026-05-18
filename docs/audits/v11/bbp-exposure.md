# v11 audit - Bloodborne Pathogen Exposure Decision Tree (`bbp-exposure`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC / USPHS guidelines for management of occupational HIV / HBV / HCV exposures (Kuhar DT et al. Infect Control Hosp Epidemiol 2013 for HIV PEP; CDC "Updated U.S. Public Health Service Guidelines for the Management of Occupational Exposures to HBV, HCV, and HIV"; current CDC clinician resources for occupational HIV PEP). The bundled `hivPep.regimen` (tenofovir/emtricitabine + raltegravir or dolutegravir × 28 days) and `startWithin: 72 hours` window match current USPHS guidance.

## Boundary examples added
- Percutaneous + HIV+ source + vaccinated HBV responder: HIV PEP regimen + "No HBV PEP needed" + HCV baseline + follow-up surveillance. PASS.
- Percutaneous + HIV+ source + unvaccinated exposed: HIV PEP regimen + initiate HepB vaccine series. PASS.
- Percutaneous + HIV unknown + HBsAg positive: HBIG x1 + initiate HepB series; HIV PEP not routinely indicated. PASS.
- Percutaneous + HIV-/HBsAg-: No PEP needed; HCV surveillance. PASS.
- Mucous membrane: lower-risk; discuss with occupational health; PEP regimen if indicated. PASS.
- Intact skin: No PEP needed. PASS.

## Cross-implementation differential
- N/A (decision tree). The differential is "do the bundled action strings match USPHS guidance?" — cross-checked row-by-row against the 2013 USPHS HIV PEP guidelines and the 2001/2013 HBV/HCV occupational exposure guidance.

## Edge-input handling notes
- Three-step tree (exposure type -> source status -> exposed-worker vaccination status); back-navigation preserves prior choices via `stateKey: 'bbp'`.
- HCV row consistently surfaces "Baseline + 6-week / 6-month surveillance" rather than a PEP regimen (HCV has no approved PEP).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Decision tree renders labelled options; selection is keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
