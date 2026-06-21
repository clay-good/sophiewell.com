# v12 audit - nccn-ipi

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Zhou Z, Sehn LH, Rademaker AW, et al. An enhanced International Prognostic Index (NCCN-IPI) for DLBCL treated in the rituximab era. Blood. 2014;123(6):837-842.

`lib/lymphoma-v135.js nccnIpi()` returns the banded total (0-8) and the four-group risk band. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row). The "NCCN" in the tile name is not an issuing-society acronym in the citation string (Zhou et al, Blood) so ISSUER_PATTERN does not fire.

## Source-governance / weight note
- Banded age (>40-60 = 1, >60-75 = 2, >75 = 3) and LDH normalized ratio (>1-3x = 1, >3x = 2); stage III-IV = 1; ECOG >= 2 = 1; extranodal disease in a major site (marrow, CNS, liver/GI, lung) = 1.
- Total 0-8 -> low (0-1), low-intermediate (2-3), high-intermediate (4-5), high (6-8). 5-yr OS ~96 / 82 / 64 / 33%.

## Boundary worked examples added
- The exact age band edges (60 -> 1, 75 -> 2) and LDH ratio edges (3 -> 1, 3.5 -> 2); the worked example (age 70 + LDH 2.5 + stage = 4 -> high-intermediate); the 1/2, 3/4, 5/6 group flips and the 8-point maximum.

## Edge-input handling notes
- Age clamped to <= 130; any blank lab/flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs + three labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
