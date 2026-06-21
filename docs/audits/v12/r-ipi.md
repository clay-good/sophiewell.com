# v12 audit - r-ipi

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Sehn LH, Berry B, Chhanabhai M, et al. The revised International Prognostic Index (R-IPI) is a better predictor of outcome than the standard IPI for DLBCL treated with R-CHOP. Blood. 2007;109(5):1857-1861.

`lib/lymphoma-v135.js rIpi()` returns the IPI factor count (0-5) collapsed to three R-CHOP-era outcome groups. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- Five standard IPI factors, one each: age > 60, LDH above normal, Ann Arbor stage III-IV, >= 2 extranodal sites, ECOG >= 2.
- Groups: Very good = 0 (4-yr PFS ~94%, OS ~94%); Good = 1-2 (~80% / ~79%); Poor = 3-5 (~53% / ~55%).

## Boundary worked examples added
- 0 -> Very good; the 0/1 (very-good->good) and 2/3 (good->poor) group flips; all-five -> Poor maximum.

## Edge-input handling notes
- Any unanswered factor surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Five labeled yes/no selects with a blank leading option; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
