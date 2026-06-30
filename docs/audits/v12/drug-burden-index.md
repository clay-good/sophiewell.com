# v12 audit - drug-burden-index

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Hilmer SN, Mager DE, Simonsick EM, et al. A drug burden index to define the functional burden of medications in older people. Arch Intern Med. 2007;167(8):781-787. The D/(D + delta) contribution formula and the summed-index interpretation cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v179.js drugBurdenIndex()` returns Sum D/(D + delta). Group E (returns a value), Class A.

## Source-governance notes
- Per the §2 clarification the tile consumes per-drug daily dose D and minimum dose delta the clinician reads from the formulary; no drug-dose database is embedded.
- DBI = Sum D/(D + delta); each ratio bounded below 1; higher DBI predicts poorer physical/cognitive function. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- sums D/(D+delta) across drugs (10/5 + 4/4 = 1.17); D=delta contributes 0.5; blank rows skipped, >= 1 complete drug required; partial row and non-positive delta -> valid:false.

## Edge-input handling notes
- delta must be finite and > 0, D non-negative; each division is delta>0-guarded -> valid:false rather than Infinity/NaN (spec-v59 fuzz pass, division path).
