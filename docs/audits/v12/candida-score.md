# v12 audit - candida-score

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: León C, Ruiz-Santana S, Saavedra P, et al. A bedside scoring system ("Candida score") for early antifungal treatment in nonneutropenic critically ill patients with Candida colonization. Crit Care Med. 2006;34(3):730-737.

`lib/id-v137.js candidaScore()` returns the 0-5 total and the threshold verdict. Class A (fixed integer items; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / point note
- Integer items (cross-verified across the 2006 paper, the 2009 validation, and ATM 2020): TPN 1, surgery on ICU admission 1, multifocal Candida colonization 1, severe sepsis 2; total 0-5.
- Cut-off >= 3 (the original > 2.5 derived from the weighted-coefficient model 0.908/0.997/1.112/2.038, which is NOT the clinical instrument). The 2009 multicenter validation found a score < 3 carried only ~2.3% probability of proven invasive candidiasis; >= 3 -> consider empiric antifungal.

## Boundary worked examples added
- threshold crossing at exactly 3 (three single-point items) vs 2; severe sepsis alone = 2 (below); TPN+surgery+sepsis = 4 (likely); max 5.

## Edge-input handling notes
- All four yes/no items required; blank surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Four labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
