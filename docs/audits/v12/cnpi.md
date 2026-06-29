# v12 audit - cnpi

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Feldt KS. The checklist of nonverbal pain indicators (CNPI). Pain Manag Nurs. 2000;1(1):13-21. Six behaviours, present/absent scoring, the at-rest and with-movement two-condition structure, rest 0-6 / movement 0-6 / combined 0-12 cross-verified against the geriatricpain.org form and the LOINC CNPI panel (>= 2 sources, spec-v97).

`lib/ltcga-v175.js cnpi()` carries two independent 0-6 condition sums (rest, movement) and a 0-12 combined total. Group G, Class A.

## Source-governance notes
- Six behaviours (nonverbal vocal complaints, facial grimacing/wincing, bracing, restlessness, rubbing, verbal vocal complaints), each present (1) / absent (0).
- Observed separately at rest and with movement (a transfer). Rest 0-6, movement 0-6, combined 0-12. No formal cut: any indicator in either condition is clinically meaningful.
- Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- All-absent 0/12; rest 0 / movement 3 (conditions kept separate); rest 2 / movement 4 -> combined 6; all-present 12/12 ceiling; a blank movement field -> valid:false (never scores movement from rest).

## Edge-input handling notes
- Every one of the 12 fields (6 behaviours x 2 conditions) validated to present/absent; any blank -> valid:false; never NaN (spec-v59 fuzz pass).
