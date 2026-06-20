# v12 audit - padua-renal

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Ficarra V, et al. Eur Urol. 2009;56(5):786-793 (PubMed abstract + an Oncotarget/PMC reprint of the per-level table). Cross-read against an independent RSNA Radiology paper and two PMC reviews.

`lib/uro-v131.js paduaRenal()` sums six anatomic components to a 6-14 renal-tumour complexity score with a non-scoring anterior/posterior face descriptor. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- longitudinal polar location: polar (superior/inferior) = 1, middle = 2 (no level 3). exophytic rate: >=50% = 1, <50% = 2, endophytic = 3. renal rim: lateral = 1, medial = 2. renal sinus involvement: no = 1, yes = 2. urinary collecting system involvement: no = 1, yes = 2. tumour size: <=4 cm = 1, >4-7 = 2, >7 = 3.
- Anterior/posterior face is descriptive only (suffix), not scored. Total range 6 (all six at 1) to 14 (size 3 + exophytic 3 + four 2-pt components). Tiers 6-7 low / 8-9 intermediate / >=10 high.
- COLLISION: ships as `padua-renal` to avoid the existing VTE `padua` (Padua Prediction Score) - unrelated instruments, both kept, no cross-link. One ECR poster reported impossible "4-6/7-9/10-12" bands (minimum is 6); disregarded in favour of the primary source.

## Boundary worked examples added
- 7 -> 8 low/intermediate flip; minimum 6 (low); maximum 14 (high); a >=10 high case.
- blank component, a face other than a/p, or an out-of-range longitudinal level (3) -> valid:false; scalar -> valid:false.

## Edge-input handling notes
- Each scored component validated against its allowed level set; face required to be a or p. abnormal = total >= 8.

## A11y / keyboard notes
- Seven labeled selects (blank leading option); output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
