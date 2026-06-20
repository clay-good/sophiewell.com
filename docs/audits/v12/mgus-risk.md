# v12 audit - mgus-risk

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Rajkumar SV, Kyle RA, Therneau TM, et al. Serum free light chain ratio is an independent risk factor for progression in monoclonal gammopathy of undetermined significance. Blood. 2005;106(3):812-817.

`lib/onc-v134.js mgusRisk()` returns the Mayo MGUS risk-factor count (0-3) and tier. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / threshold note
- 1 point each: serum M-protein >= 1.5 g/dL; a non-IgG isotype (IgA or IgM); an abnormal serum free-light-chain ratio (strictly outside 0.26-1.65, the reference interval inclusive at both edges).
- Count 0-3 -> 20-year risk of progression 5 / 21 / 37 / 58% (low / low-intermediate / intermediate / high).

## Boundary worked examples added
- 0-factor vs 3-factor flip; the 1.5 g/dL inclusive M-protein edge; the 0.26 and 1.65 inclusive FLC edges (normal) vs 0.25/1.66 (abnormal); IgG scores 0, IgA/IgM score 1.

## Edge-input handling notes
- A blank M-protein/FLC ratio, or an isotype outside {IgG, IgA, IgM}, surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs + one labeled isotype select; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
