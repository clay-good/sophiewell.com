# v12 audit - bwat

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Bates-Jensen BM, Vredevoe DL, Brecht ML. Validity and reliability of the Pressure Sore Status Tool. Decubitus. 1992;5(6):20-28 (later the BWAT). The 13 scored items, 1-5 per-item anchors, and the 13-65 total cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v182.js bwat()` sums 13 items to 13-65. Group G, Class A.

## Source-governance notes
- 13 wound items each 1 (healthy tissue) to 5 (severe degeneration); total 13-65 (floor 13, not 0); lower = healing, higher = degeneration; read as a serial trajectory, no single-point band. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- floor 13 (all 1) and ceiling 65 (all 5); all-twos 26; out-of-range (0/6) and blank -> valid:false.

## Edge-input handling notes
- Each item 1-5; blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
