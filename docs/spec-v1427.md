# spec-v1427 — McPherson staging of periprosthetic joint infection

From the classification-gap queue. Periprosthetic infection had its diagnosis
(`icm-pji-2018`) and the femoral fracture beside a revision (`vancouver-periprosthetic`), but not the
staging system the Musculoskeletal Infection Society recommends for grading the infected joint.

## Sources

- McPherson EJ et al, *Am J Orthop* 1999;28:161-165 (PubMed 10195839): the original, 70 infected TKAs.
- McPherson EJ et al, *Clin Orthop Relat Res* 2002;403:8-15 (DOI confirmed via Crossref): the hip series.
- Coughlan A, Taylor F, *Classifications in Brief: The McPherson Classification of Periprosthetic
  Infection*, Clin Orthop Relat Res 2020;478:903-908 (open access, PMC7282566), read 2026-09-24.
  Its Tables 1 and 2 are the rule this tool applies:

| part | grades |
|---|---|
| infection type | I early postoperative (< 4 weeks after surgery) / II hematogenous (< 4 weeks) / III late chronic (> 4 weeks) |
| systemic host | A no factor / B one or two / C more than two, or any one of ANC < 1000, CD4 < 100, IV drug abuse, chronic infection elsewhere, immune dysplasia or neoplasm |
| local extremity | 1 no factor / 2 one or two / 3 more than two |

Table 2 lists 14 systemic and 8 local factors; each is one yes/no question here.

## Behavior

The stage is **derived** from the factors. A blank means *not answered*, never *no*: a grade that an
unanswered factor could change is reported as a range ("host A to B") and the band asks for the
rest. A grade already at the top (C, or 3) is final however many factors are blank, so a short
worked example still gives a complete stage. The notes name the factors that set each grade.
Every answer says the system has not been validated for observer agreement and ignores the organism;
the note carries the review's caution and says the stage does not choose the operation.

## Tests

`test/unit/mcpherson-pji.test.js`: all-no is I/A/1; the host and limb count cutoffs; each critical
factor alone gives C; the worked example; blanks give ranges and never count as absent; a top grade
is final with blanks; the caveat and the refusals.
