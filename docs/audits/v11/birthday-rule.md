# v11 audit - Birthday Rule Resolver (`birthday-rule`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NAIC Coordination of Benefits Model Regulation §6 (Order of Benefit Determination Rules) - the birthday rule (earlier-in-calendar-year parent's plan is primary for a dependent child) is the standard NAIC-adopted convention. Many self-funded ERISA plans use their own COB language; the tile notes this caveat. Court-ordered custody and divorce decrees can supersede; the renderer accepts both.

## Boundary examples added
- META example: parent A DOB 1985-03-12, parent B DOB 1986-08-21, custody shared, no court order -> Primary: Parent A (March 12 < August 21).
- Court-order override: same DOBs + court order naming Parent B -> Primary: Parent B (court order supersedes birthday rule).
- Same-month birthdays: tie-broken by day-of-month.
- Same calendar day: NAIC model defers to the plan that has covered the dependent longest (not implemented in the tile; surface as "consult plan COB rules").

## Cross-implementation differential
- N/A (decision rule). The differential is "does the rule output match NAIC §6?" — confirmed by re-reading NAIC COB model regulation.

## Edge-input handling notes
- Custody field ("shared", "primary-A", "primary-B") and optional court-order field both supersede the birthday rule when present, per NAIC model.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled date inputs + custody select + court-order text. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
