# v12 audit - kellgren-lawrence

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Kellgren JH, Lawrence JS. Radiological assessment of osteo-arthrosis. Ann Rheum Dis. 1957;16(4):494-502 (cross-verified against the CORR "Classifications in Brief: Kellgren-Lawrence" review and Radiopaedia; the granular feature wording was codified in the 1963 Atlas of Standard Radiographs).

`lib/ortho-v145.js kellgrenLawrence()` consumes the radiographic grade the
clinician reads off the film (0–4) and reports the grade, its feature
description, and whether it crosses the definite-OA threshold. Class A.

## Source-governance notes
- Grade text re-fetched verbatim: 0 none; 1 doubtful narrowing + possible
  osteophytic lipping; 2 definite osteophytes + possible narrowing; 3 moderate
  osteophytes + definite narrowing + some sclerosis + possible deformity; 4 large
  osteophytes + marked narrowing + severe sclerosis + definite deformity.
- Sclerosis first appears at grade 3 and bone-end deformity at grade 3; subchondral
  cysts are NOT a KL feature and are deliberately omitted.
- Grade >= 2 is the accepted threshold for definite radiographic OA (definiteOA
  flag), per the Schiphof consensus reported in CORR. The 2->3 boundary is
  asserted in the unit tests.

## Boundary worked examples added
- grade 0 -> none, not abnormal, not definite OA.
- grade 1 -> doubtful, below the definite-OA threshold.
- grade 2 -> definite radiographic OA threshold (abnormal, definiteOA).
- grade 3 boundary -> moderate, definite OA.
- grade 4 -> severe; out-of-range / missing grade -> invalid.

## Edge-input handling notes
- One required select restricted to '0'-'4'; any other value renders the
  complete-the-fields fallback. Grade is a bounded integer -- no non-finite path.
  Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
