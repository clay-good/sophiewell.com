# v11 audit - hunt-hess-wfns

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Hunt WE, Hess RM. *Surgical risk as related to time of intervention in the repair of intracranial aneurysms.* J Neurosurg. 1968;28(1):14-20 (Hunt-Hess I-V picker). Drake CG. *Report of World Federation of Neurological Surgeons committee on a universal subarachnoid hemorrhage grading scale.* J Neurosurg. 1988;68(6):985-986 (WFNS computed from GCS band and presence of focal motor deficit).

`lib/scoring-v4.js huntHessWfns()` accepts the Hunt-Hess picker and the WFNS inputs (GCS, focal motor deficit) and returns `{huntHess, wfns, huntHessLabel, text}`.

WFNS bands per Drake 1988:
- I: GCS 15, no motor deficit.
- II: GCS 13-14, no motor deficit.
- III: GCS 13-14, with motor deficit.
- IV: GCS 7-12.
- V: GCS 3-6.

## Boundary examples added
- HH I + GCS 15 -> WFNS 1.
- HH II + GCS 14 no focal -> WFNS 2.
- HH III + GCS 13 + focal -> WFNS 3.
- HH IV + GCS 7 -> WFNS 4.
- HH IV + GCS 12 with focal -> WFNS 4.
- HH V + GCS 6 -> WFNS 5.

## Cross-implementation differential
- Reference: Drake 1988 Table I band cutoffs.
- Sophie result: matches across all six boundary cases above. PASS.

## Edge-input handling notes
- Hunt-Hess outside 1-5 throws; GCS outside 3-15 throws.

## A11y / keyboard notes
- One labeled select, one range, one checkbox; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
