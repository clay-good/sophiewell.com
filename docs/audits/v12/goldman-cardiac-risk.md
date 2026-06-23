# v12 audit - goldman-cardiac-risk

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Goldman L, Caldera DL, Nussbaum SR, et al. Multifactorial index of cardiac risk in noncardiac surgical procedures. N Engl J Med. 1977;297(16):845-850. The nine factor weights and the four class point-ranges were cross-verified across 3+ sources (StatPearls and clinical references).

`lib/surg-v142.js goldmanCardiacRisk()` sums the nine weighted factors (S3/JVD 11,
MI < 6 mo 10, > 5 PVCs/min 7, non-sinus or PACs 7, age > 70 5, emergency 4,
intraperitoneal/intrathoracic/aortic 3, aortic stenosis 3, poor general status 3)
to 0-53 and maps to Class I (0-5), II (6-12), III (13-25), IV (>= 26). Class A.

## Source-governance notes
- The original ancestor of the Revised Cardiac Risk Index (rcri) -- cross-linked,
  both kept.
- Per-class rates reported as the cross-verified COMBINED major-cardiac-
  complication-or-death figures (~1% / ~7% / ~14% / ~78%); the Class IV cardiac-
  death fraction (~56%) is independently corroborated and noted. The full per-
  class three-way decomposition could not be cross-verified across 2+ accessible
  sources, so it is not shipped as separate cells.

## Boundary worked examples added
- no factors -> 0 points, Class I.
- Class II -> III boundary: age70 + emergency + intraop = 12 (Class II);
  MI<6mo + intraop = 13 (Class III, ~14%).
- all nine factors -> 53 points, Class IV.

## Edge-input handling notes
- A bounded weighted sum of checkboxes; no division, no logistic, no non-finite
  path. The tile always computes (no valid:false branch needed).

## A11y / keyboard notes
- Nine labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
