# v11 audit - Rabies Post-Exposure Prophylaxis (`rabies-pep`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC ACIP rabies PEP recommendations (Manning SE et al. MMWR Recomm Rep 2008; Rupprecht CE et al. MMWR Recomm Rep 2010 — 4-dose ACIP-recommended schedule; current CDC Yellow Book / Pinkbook chapter on Rabies). The 4-dose vaccine series for immunocompetent previously-unvaccinated (days 0, 3, 7, 14), 5-dose for immunocompromised (adds day 28), 2-dose booster for previously-vaccinated (days 0, 3) with no HRIG, and HRIG 20 IU/kg infiltrated at the wound remain current.

## Boundary examples added
- Previously unvaccinated, immunocompetent: HRIG 20 IU/kg infiltrated; vaccine days 0, 3, 7, 14. Matches ACIP 2010 4-dose schedule.
- Previously unvaccinated, immunocompromised: HRIG 20 IU/kg; vaccine days 0, 3, 7, 14, 28. Matches ACIP carve-out.
- Previously vaccinated: HRIG not indicated; vaccine days 0, 3. Matches ACIP booster schedule.
- Animal-rules table (`animalRules` array in `data/rabies-pep/rabies.json`) covers dog/cat/ferret-healthy (observe 10 days), bat (treat as exposure if direct contact or unwitnessed exposure during sleep), and high-risk wildlife (treat as positive unless animal tested negative) — all match CDC ACIP guidance.

## Cross-implementation differential
- N/A (decision tree). The differential is "do the schedule + animal-rule arrays match ACIP?" — cross-checked row-by-row.

## Edge-input handling notes
- Two-step tree (animal -> vaccination status); the animal options are dynamically loaded from the bundled JSON.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Decision tree renders labelled options; selection is keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
