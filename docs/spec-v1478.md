# spec-v1478 — a gate for blank selects, and the four defects building it found

Specs v1459 to v1477 fixed optional selects whose blank silently answered as one option. This spec
turns the probe that found them into a gate, so a new tool cannot bring the defect back. Building the
gate properly found four more defects.

## The gate

`test/unit/optional-select-not-defaulted.test.js` generalizes `optional-sex-not-defaulted`
(spec-v1403) to every optional select. For each tool it builds contexts from the worked example:

- each other select at each of its values;
- each checkbox flipped, and each **pair** of checkboxes flipped;
- each number at 0.5×, 1.5× and 3×.

In each context it drops one optional select. The blank is flagged when its verdict equals exactly one
option's verdict, the options disagree, and the blank reading **added** no ask or disclosure over that
option. "Added" is the movement rule from spec-v1196: a disclosure about some *other* blank field
appears in both readings, so it does not excuse this one.

Two lessons from building it, each confirmed by negative-testing with the Jones default restored:

- Single flips do not reach a criteria set's other combinations. Jones's tier decides the answer only
  with carditis and monoarthritis but no polyarthritis, two flips from the example. Pairs were needed.
- A whole-reading disclosure check let "No episode was entered" excuse a blank tier. Only what the
  blank reading added may count.

Exempt by rule:

- a blank that reads as an absence (none, 0, no, absent, not-done, normal, na, intact, unknown,
  pending, unset, not-assessed, or empty);
- unit selects;
- three instruments that average over what was answered (HAQ-DI, Oswestry, COMPERA 2.0).

Ten rows are exempt by id, each with its reason in the file. The gate also fails on a stale exemption.
It runs in about 5 seconds.

## The four defects

| Tool | A blank read as | Harm | Now |
|---|---|---|---|
| Kaiser early-onset sepsis risk | an incidence of 0.5 per thousand births, unstated | A culture at 0.5 where 0.3 or 0.4 give none | Asks when the incidence changes the management band; otherwise says 0.5 was used and all four agree |
| King's College (non-acetaminophen) | cause "other" (not counted) | "Neither limb is met: 2 of five", when an unfavorable cause makes 3, the transplant-referral threshold | The cause is "not entered", like a blank age or bilirubin |
| Pertussis case definition | "one year and older" | Apnea with 3 weeks of cough: "not met", while an infant is "Probable" | Asks when the age decides; otherwise says both branches agree |
| Reference change value | two-sided 95%, never stated | "at this probability" without naming it | Names the level, and says when the conventional two-sided 95% was assumed |

## Tests

- The gate itself, negative-tested as above.
- `test/unit/kings-college-nonapap.test.js`: two assertions that pinned a blank cause as "not met" now
  expect it as not entered. One of them is titled "a factor with nothing entered is unknown, not
  absent".
