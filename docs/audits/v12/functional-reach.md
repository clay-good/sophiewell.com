# v12 audit - functional-reach

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Duncan PW, Weiner DK, Chandler J, Studenski S. Functional reach: a new clinical measure of balance. J Gerontol. 1990;45(6):M192-M197. The Weiner absolute cut-points (< 15.24 cm / 6 in markedly increased ~4x, 15.24-25.40 cm / 6-10 in increased ~2x, > 25.40 cm lower) and the Duncan age/sex normative means (cm) cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v176.js functionalReach()` classifies the forward reach (canonical cm) by the absolute cut-points and shows the age/sex normative mean. Group G, Class A.

## Source-governance notes
- Cut-points: < 15.24 cm markedly increased; 15.24-25.40 cm increased; > 25.40 cm lower fall risk.
- Duncan normative means (cm): men 20-40:42.49, 41-69:38.05, 70-87:33.43; women 20-40:37.49, 41-69:35.10, 70-87:26.60.
- Outside ages 20-87 there is no normative stratum -> valid:false. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 15.24 cm boundary (markedly vs increased); 25.40 cm boundary (increased vs lower); normative mean reported; outside 20-87 -> valid:false; blank -> valid:false.

## Edge-input handling notes
- reach (cm, via the cm/in unit toggle), age, sex validated; missing stratum or blank -> valid:false; never NaN (spec-v59 fuzz pass).
