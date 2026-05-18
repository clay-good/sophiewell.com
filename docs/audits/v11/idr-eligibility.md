# v11 audit - IDR Eligibility Checker (NSA) (`idr-eligibility`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: No Surprises Act federal Independent Dispute Resolution (IDR) scope, PHSA Section 2799A-1(c) and 45 CFR 149.510 / 149.520. Federal IDR applies to out-of-network emergency services, out-of-network items / services at in-network facilities, and air ambulance. Does NOT displace state IDR processes — California, New York, and others have parallel state IDR for which patients/providers must use the state process. Both PHSA and CFR sections current as of 2026.

## Boundary examples added
- In-scope: out-of-network ER claim where the patient was treated -> federal IDR eligible (PHSA 2799A-1).
- In-scope: anesthesiologist out-of-network at in-network hospital -> federal IDR eligible (PHSA 2799A-1(b)).
- Out-of-scope: state-IDR-covered claim in California for a fully-insured plan -> federal IDR not applicable; California IDR applies.
- Out-of-scope: ground ambulance -> not within current federal IDR scope (ground ambulance NSA protections are deferred per Title I Division BB).

## Cross-implementation differential
- N/A (decision tree). Differential is "does each tree branch match the cited PHSA section?" — confirmed by re-reading 45 CFR 149.510 / 149.520.

## Edge-input handling notes
- Decision tree explicitly notes that state IDR processes are not displaced; the tile does not pretend to enumerate every state IDR rule.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Selects and radios are labelled; output region surfaces the branch result. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
