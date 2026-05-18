# v11 audit - Mallampati Class Reference (`mallampati`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Mallampati SR, Gatt SP, Gugino LD, et al. A clinical sign to predict difficult tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):429-434. Four-class structure (I-IV) per the Samsoon-Young modification of the original 3-class Mallampati. Class definitions match the source.

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tile audited by category coverage:
  - Class I = soft palate, fauces, uvula, pillars visible. PASS.
  - Class II = soft palate, fauces, portion of uvula visible. PASS.
  - Class III = soft palate, base of uvula visible. PASS.
  - Class IV = only hard palate visible. PASS.

## Cross-implementation differential
- N/A for static reference. Class definitions cross-checked against Miller's Anesthesia 9e (Chapter 44, Airway Management) and the ASA Difficult Airway Algorithm 2022 update; all four class descriptions match.

## Edge-input handling notes
- No user input; pure reference card. Caveat that Mallampati class alone is not diagnostic of difficult intubation is rendered alongside.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Reference card renders as a labelled list; tab order natural. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
