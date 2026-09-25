# spec-v1480 — periodontitis staging and grading

The catalog had dental indices (DMFT, the gingival and plaque indices) but not the classification
periodontitis is now diagnosed by: the 2017 World Workshop (AAP/EFP) staging, for severity and
complexity, and grading, for the rate of progression.

## Stage (I to IV)

The stage starts from the interdental attachment loss (CAL) at the site of greatest loss: 1-2 mm is I,
3-4 mm II, 5 mm or more III. If CAL is not available, it starts from the radiographic bone loss
instead. It can only be raised from there:

| Raised by | To at least |
|---|---|
| Any tooth lost to periodontitis (up to 4) | III |
| 5 or more teeth lost | IV |
| A maximum probing depth of 5 mm | II |
| A probing depth of 6 mm or more, vertical bone loss of 3 mm or more, class II or III furcation involvement, or a moderate ridge defect | III |
| A need for complex rehabilitation | IV |

The extent (localized, generalized, or molar/incisor pattern) is added as a descriptor.

## Grade (A to C)

The grade comes from direct evidence of progression over 5 years if there is any: no loss is A, less
than 2 mm B, 2 mm or more C. Otherwise it comes from the bone loss at the worst site divided by the
age: under 0.25 is A, 0.25 to 1.0 B, over 1.0 C, and the answer says no direct evidence was entered. Smoking under 10 cigarettes a day, or diabetes with an
HbA1c under 7.0%, raises it to at least B; 10 or more cigarettes, or an HbA1c of 7.0% or more, raises
it to C. While either risk factor is blank and the grade is below C, the answer says so.

## Where the sources differ, and how it is shown

- **Stage III tooth loss.** One reproduction prints "< 4", which leaves 4 teeth in no stage; the
  Tonetti-based one prints "<= 4". The tile follows "<= 4".
- **A bone loss / age ratio of exactly 1.0.** It is grade B in the Tonetti table and grade C where C is
  printed as "1.0 or more". The answer names the difference when the ratio is exactly 1.0.

The stage evidence, the number of teeth lost (0 if none) and the grade evidence are required. A blank
is asked for, never assumed.

## Sources

- Tonetti MS, Greenwell H, Kornman KS, J Periodontol 2018;89 Suppl 1:S159-S172.
- Papapanou PN et al, J Periodontol 2018;89 Suppl 1:S173-S182.
- The tables as reproduced in Int Dent J 2021 (PMC9275292, Tables 2 and 3, with its staging and grading
  rules) and Clin Oral Investig 2023 (PMC10630190, Tables 2 and 3).

## Tests

`test/unit/periodontitis-stage-grade.test.js`:

- the worked example;
- every severity band;
- each factor that raises the stage;
- each route to the grade and each modifier, including the 1.0 note;
- the risk-factor disclosure;
- every required blank.
