# v12 audit - gelf-criteria

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Brice P, Bastion Y, Lepage E, et al. Comparison in low-tumor-burden follicular lymphomas (GELF). J Clin Oncol. 1997;15(3):1110-1117.

`lib/lymphoma-v135.js gelfCriteria()` returns the high-tumor-burden flag (met if ANY ONE criterion present). Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- High tumor burden if ANY ONE: nodal/extranodal mass > 7 cm; >= 3 nodal sites each > 3 cm; B symptoms; symptomatic splenomegaly; pleural/peritoneal effusion; cytopenia (Hgb < 10 g/dL or platelets < 100 x10^9/L); leukemic phase (> 5.0 x10^9/L circulating cells).
- Reports the criteria status (treat-vs-observe flag), never a "start chemotherapy" directive (spec-v11 §5.3).

## Boundary worked examples added
- No criterion -> low burden; the any-one met flip; the mass > 7 cm strict cut-point; the cytopenia OR-rule (Hgb < 10 or platelets < 100); a multi-criterion count.

## Edge-input handling notes
- Any blank size/lab or unanswered flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Three labeled number inputs + five labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
