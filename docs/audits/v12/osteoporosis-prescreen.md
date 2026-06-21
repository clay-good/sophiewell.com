# v12 audit - osteoporosis-prescreen

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Koh LKH, Sedrine WB, Torralba TP, et al. A simple tool to identify Asian women at increased risk of osteoporosis (OST). Osteoporos Int. 2001;12(8):699-705; and Cadarette SM, Jaglal SB, Kreiger N, et al. Development and validation of the Osteoporosis Risk Assessment Instrument (ORAI). CMAJ. 2000;162(9):1289-1294.

`lib/endo-v136.js osteoporosisPrescreen()` returns the OST index and the ORAI score with their referral framing. Class A (fixed published index formula / point table; journal+author citations - no docs/citation-staleness.md row).

## Source-governance / formula note
- OST index = trunc((weight kg - age yr) x 0.2), truncated TOWARD ZERO (Math.trunc, NOT Math.floor - the published -3.6 -> -3 worked example disambiguates). Caucasian referral cutoff: index < 2 -> increased risk; original OSTA tiers: low > -1, moderate -4..-1, high < -4.
- ORAI point table cross-verified (NCBI Bookshelf + MDCalc): age 45-54 = 0, 55-64 = 5, 65-74 = 9, >= 75 = 15; weight >= 70 = 0, 60-69 = 3, < 60 = 9; not on estrogen = 2, on estrogen = 0. Total 0-26; score >= 9 selects for BMD/DXA.

## Boundary worked examples added
- age 60 / weight 72 / no estrogen -> OST 2 (lower risk, boundary - index 2 is NOT flagged), ORAI 7; the OST < 2 flip (index 1 increased risk); the truncate-toward-zero direction (-3.6 -> -3); the ORAI 0 / 12 / 26 point-table cases; the ORAI >= 9 referral threshold (exactly 9 refers).

## Edge-input handling notes
- Requires age (0-130) and weight > 0 and an explicit estrogen yes/no; blank surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs + an estrogen yes/no select; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
