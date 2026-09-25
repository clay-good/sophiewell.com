# spec-v1428 — Modified Neer classification of distal-third clavicle fractures

From the classification-gap queue. The shoulder girdle had the acromioclavicular separation
(`rockwood-ac`) and the proximal humerus (`neer-classification`, a different Neer system), but no
tool for the distal clavicle fracture that sits between them.

## Sources

- Neer CS II, *Clin Orthop Relat Res* 1968;58:43-50 (DOI confirmed via Crossref): the original
  types, later extended by Neer (IV, V) and by Craig (IIB).
- Stenson J, Baker W, *Classifications in Brief: The Modified Neer Classification for Distal-third
  Clavicle Fractures*, Clin Orthop Relat Res 2021;479:205-209 (open access, PMC7899602), read
  2026-09-24. Its Description is the rule this tool applies:

| type | fracture against the coracoclavicular (CC) ligaments | stability as described |
|---|---|---|
| I | lateral to the intact CC ligaments; AC joint spared | inherently stable |
| IIA | medial to the conoid and trapezoid | inherently unstable |
| IIB | between conoid and trapezoid; conoid torn, trapezoid on the lateral fragment | inherently unstable |
| III | lateral to the CC ligaments; extends into the AC joint | inherently stable |
| IV | pediatric: proximal fragment slips from its periosteal sleeve; CC ligaments on the lateral fragment | not stated |
| V | comminuted; inferior fragment attached to the CC ligaments | not stated |

## Behavior

The type is **derived**: a comminuted or physeal pattern gives V or IV; otherwise the position
against the ligaments gives IIA or IIB, and a lateral fracture is I or III by the AC joint. Only
I and III, which the review calls stable, are left unflagged. A physeal pattern in a mature skeleton
is reported as "not a clean fit". Type II carries the review's notes that IIA and IIB are hard to
separate and that radiographic nonunion (21% to 33%) is not always symptomatic. Every answer gives
the fair interrater kappa (0.11 to 0.35) and says the decision to operate turned on stability and
fragment size, which the type does not record.

## Tests

`test/unit/neer-distal-clavicle.test.js`: every type derives; the stable/unstable flag; the worked
example; the type II notes; the mature-skeleton flag; the reliability notes; the refusals.
