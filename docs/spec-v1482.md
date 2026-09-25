# spec-v1482 — Cairo classification of gingival recession

The catalog had the Miller classification of gingival recession but not the Cairo classification
(2011), which the 2017 World Workshop adopted. Cairo grades a recession by the interproximal
attachment, which the original study used to predict root coverage.

## What it does

It takes two attachment losses, each measured from the cementoenamel junction in mm:

| Type | Rule |
|---|---|
| RT1 | no interproximal attachment loss (the cementoenamel junction is not exposed between the teeth) |
| RT2 | interproximal loss no greater than the buccal loss |
| RT3 | interproximal loss greater than the buccal loss |

A blank value is asked for. A buccal loss of 0 is refused, because a recession has buccal attachment
loss.

## Sources

- Cairo F et al. J Clin Periodontol 2011;38(7):661-666.
- Types as stated in Front Oral Health 2026 (PMC13290863).

## Tests

`test/unit/cairo-recession.test.js`: the worked example; each type, including equal losses (RT2);
blanks and impossible values.
