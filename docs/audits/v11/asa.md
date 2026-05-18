# v11 audit - ASA Physical Status Reference (`asa`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: American Society of Anesthesiologists Physical Status Classification System; approved by ASA House of Delegates October 15, 2014, last amended December 13, 2020. Class names (ASA I through VI plus E suffix for emergency) are ASA-defined; the short plain-English summaries bundled with Sophie are by the project author (per META `source.label`).

## Boundary examples added
- Per spec-v11 §3.3 step 10, lookup tiles are audited by category coverage:
  - ASA I = normal healthy patient. PASS.
  - ASA II = mild systemic disease (e.g., well-controlled HTN, mild obesity). PASS.
  - ASA III = severe systemic disease (e.g., poorly controlled DM, COPD, BMI >=40). PASS.
  - ASA IV = severe systemic disease that is a constant threat to life. PASS.
  - ASA V = moribund, not expected to survive without operation. PASS.
  - ASA VI = brain-dead organ donor. PASS.
  - E suffix = emergency surgery. PASS.

## Cross-implementation differential
- N/A for static reference. Class names cross-checked against the current ASA Physical Status Classification System table at asahq.org/standards-and-practice-parameters; bundled summaries match the ASA-published examples line-for-line in intent.

## Edge-input handling notes
- No user input; pure reference table. Caveat that short summaries are project-author paraphrases (not ASA-quoted) is rendered via META citation per spec-v9 §4.2 attribution rules.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Reference list renders with semantic headings; tab order natural. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
