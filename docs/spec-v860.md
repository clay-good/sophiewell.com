# spec-v860 — Malignant Hyperthermia Clinical Grading Scale

## What this gives you

The rank the published scale actually gives — computed the way the scale says, not by adding up
every box that was ticked.

## §1 Seven processes, highest one each

| Process | Highest indicator | Points |
|---|---|---|
| Rigidity | Generalized rigidity, or masseter spasm after succinylcholine | 15 |
| Muscle breakdown | Creatine kinase over 20,000 after succinylcholine | 15 |
| Respiratory acidosis | End-tidal carbon dioxide over 55 mmHg on controlled ventilation | 15 |
| Temperature increase | Inappropriately rapid rise | 15 |
| Cardiac involvement | Inappropriate sinus tachycardia, or ventricular arrhythmia | 3 |
| Family history | Malignant hyperthermia in a first-degree relative | 15 |
| Other | Base excess under -8, or pH below 7.25, or raised resting creatine kinase | 10 |

Twenty-four published indicators in all. The raw score is the sum of the highest one in each
process.

| Raw score | Rank | |
|---|---|---|
| 0 | 1 | Almost never |
| 3 to 9 | 2 | Unlikely |
| 10 to 19 | 3 | Somewhat less than likely |
| 20 to 34 | 4 | Somewhat greater than likely |
| 35 to 49 | 5 | Very likely |
| 50 and above | 6 | Almost certain |

## §2 It is not a treatment trigger

This is why the tile exists, and it is stated on every result. The scale was built to rank the
likelihood that an episode was malignant hyperthermia, for research and for retrospective
review. During a crisis dantrolene is given on clinical suspicion. Stopping to score is itself
the harm.

## §3 Only the highest indicator in each process counts

Every indicator is offered, so the tile can show what adding them all up would have given. A
very high creatine kinase with dark urine, myoglobin and a raised potassium is one process worth
15 points, not four indicators worth 38 — and where the naive sum would have changed the rank,
the tile says which rank it would have been.

Masseter spasm and generalized rigidity are both in the rigidity process, so they do not stack.
The tile says so when both are entered.

## §4 Fever is neither required nor early

An unexplained rise in end-tidal carbon dioxide under controlled ventilation is the earliest and
most specific sign; temperature is a late one. Whenever indicators are entered and no
temperature indicator is among them, the tile raises it. A low rank for want of a fever is the
usual under-call.

A raw score of 0 is returned as "no indicator was described", not as an exclusion.

## §5 Sourcing (spec-v97 gate)

- Larach MG, Localio AR, Allen GC, et al. *A clinical grading scale to predict malignant
  hyperthermia susceptibility.* Anesthesiology. 1994;80(4):771-779.

No tracked guideline issuer, so no `docs/citation-staleness.md` row is owed.

## §6 Posture

Decision support, not a verdict. It scores an episode that has already been described. It does
not diagnose malignant hyperthermia, replace contracture or genetic testing, and it never
decides whether to give dantrolene.

Catalog 1651 → 1652.
