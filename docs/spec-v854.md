# spec-v854 — Gastric Emptying Scintigraphy: Reading the 4-Hour Study

## What this gives you

The grade, from the value that actually carries it — and a plain statement when the study
that produced the numbers was not a study of the stomach.

## §1 The rule

| Retention | Meaning |
|---|---|
| **> 60% at 2 hours** | Delayed |
| **> 10% at 4 hours** | Delayed |
| < 30% at 1 hour | Rapid emptying |
| 30-90% at 1 hour | Normal at that point |

Grade, from the **4-hour** value:

| | |
|---|---|
| ≤ 10% | Normal |
| 11-20% | Grade 1, mild |
| 21-35% | Grade 2, moderate |
| 36-50% | Grade 3, severe |
| > 50% | Grade 4, very severe |

## §2 A 2-hour study is not this test

This is the whole reason the tile exists.

The grade is defined on the **4-hour** value and on nothing else. A normal 2-hour retention does
not exclude delayed emptying, and a study stopped at 2 hours cannot be graded at all.

So when a 2-hour value is entered without a 4-hour one, the tile says the study is incomplete
rather than reporting the 2-hour number as an answer.

## §3 A hyperglycemic study measured the glucose

Blood glucose above 250-275 mg/dL delays gastric emptying on its own. A delayed result obtained
above that line describes the glucose, not the stomach, and the consensus protocol asks for it
below 200 mg/dL. Flagged whenever a glucose is entered above the line — including when the
result came back normal, because a normal result under those conditions is the more surprising
one.

## §4 A study on prokinetics or opiates measured the drug

Both classes have to be off for **two days**. The tile records whether they were and says what
the result means if they were not.

## §5 Rapid emptying is a finding on this study, not the absence of one

Under 30% retained at 1 hour is dumping, and it is on the same report as the delay everyone was
looking for. Named rather than reported as "not delayed".

## §6 Sourcing (spec-v97 gate)

- Abell TL, Camilleri M, Donohoe K, et al. Consensus recommendations for gastric emptying
  scintigraphy: a joint report of the American Neurogastroenterology and Motility Society and
  the Society of Nuclear Medicine. *J Nucl Med Technol.* 2008;36(1):44-54.

Not a tracked guideline issuer, so no staleness row.

## §7 Posture

Decision support, not a verdict. It reads a published protocol's own thresholds against values
already measured. It does not diagnose gastroparesis, which needs symptoms as well, and it does
not select treatment.

Catalog 1645 → 1646.
