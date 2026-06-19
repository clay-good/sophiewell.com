# v12 audit - bap-65

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Tabak YP, Sun X, Johannes RS, Gupta V, Shorr AF. Arch Intern Med. 2009;169(17):1595-1602 (re-fetched; cross-read with the JAMA Network full-text derivation/validation tables, PubMed PMID 19786679, the Shorr 2011 CHEST validation, and MDCalc calc/4019).

`lib/pulm-v114.js bap65()` builds the class from the count of three acute
variables (BUN >= 25 mg/dL, altered mental status, pulse >= 109/min); age > 65
splits class I from II only at zero acute variables. Class I = 0 vars and age
<= 65; II = 0 and age > 65; III = 1; IV = 2; V = 3. Per-class in-hospital
mortality 0.3 / 0.9 / 2.1 / 6.3 / 13.8%; mechanical-ventilation need rises
steeply at classes IV (~30%) and V (~55%). Class A.

## Boundary worked examples added
- BUN + AMS + age > 65 = class IV (6.3%).
- age > 65 promotion at zero acute variables: I -> II (0.3% -> 0.9%).
- once an acute variable is present, age no longer changes the class.
- class scales with the count: 1 -> III, 2 -> IV, 3 -> V (13.8%).
- classes IV and V are flagged abnormal; I-III are not.

## Cross-implementation differential
- Reference: the class-from-count structure with the age > 65 I-vs-II tiebreaker
  and the per-class mortality (0.3 / 0.9 / 2.1 / 6.3 / 13.8%) are confirmed in the
  JAMA Network full-text table. SOURCE GOVERNS: BAP-65 is NOT a 0-4 point sum (a
  common mis-implementation) -- an 80-year-old with no acute variable is class II
  (0.9%), not high-risk. Mechanical-ventilation rates for classes IV (30.1%) and
  V (54.6%) are double-confirmed; the lower-class MV rates rest on a single
  validation summary, so the tile reports MV qualitatively for I-III ("low" /
  "intermediate") and the confirmed ~30% / ~55% for IV / V rather than publishing
  the uncertain figures as exact (spec-v97 no-fabrication discipline). Match. PASS.

## Edge-input handling notes
- four boolean items; an all-absent state is the legitimate class I (or II if
  age > 65), not a fallback.

## A11y / keyboard notes
- Four labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
