# v12 audit - nu-desc

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Gaudreau JD, Gagnon P, Harel F, Tremblay A, Roy MA. Fast, systematic, and continuous delirium assessment in hospitalized patients: the nursing delirium screening scale. J Pain Symptom Manage. 2005;29(4):368-375. Items, 0-2 per-item scoring, 0-10 range, and >= 2 cut cross-verified against independent PMC validation studies (>= 2 sources, spec-v97).

`lib/ltcga-v174.js nuDesc()` sums the 5 features to 0-10. Group G, Class A.

## Source-governance notes
- Five items (disorientation, inappropriate behavior, inappropriate communication, illusions/hallucinations, psychomotor retardation), each 0 absent / 1 mild / 2 severe.
- Total 0-10; >= 2 is a positive delirium screen. The detailed intermediate anchor wording in circulating hospital forms could not be byte-verified against the 2005 original (403-blocked); the verified 0/1/2 severity gradient and >= 2 cut are used, with generic severity anchors.
- Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/10 negative; 1 negative and 2 positive (the >= 2 cut flip); tile example 2 positive; 10/10 positive; out-of-range (3) and blank -> valid:false.

## Edge-input handling notes
- Each item validated to 0-2; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
