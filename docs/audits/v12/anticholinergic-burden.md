# v12 audit - anticholinergic-burden

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Boustani M, Campbell N, Munger S, Maidment I, Fox C. Impact of anticholinergics on the aging brain. Aging Health. 2008;4(3):311-320 (Indiana ACB scale). The level structure (1/2/3) and the >= 3 clinically-relevant cut cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v179.js anticholinergicBurden()` computes total = 1*c1 + 2*c2 + 3*c3. Group G, Class A.

## Source-governance notes
- Per the spec-v100 §2 clarification the tile consumes per-level COUNTS the clinician reads from the published ACB list; it does NOT embed the drug database.
- Total = sum(level x count); >= 3 clinically relevant. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- total = sum(level x count); 2 not relevant vs 3 relevant (the >= 3 flip); blanks treated as 0 but all-blank -> valid:false; non-integer/negative -> valid:false.

## Edge-input handling notes
- Counts are non-negative integers, blank -> 0; all-blank or invalid -> valid:false; never NaN (spec-v59 fuzz pass).
