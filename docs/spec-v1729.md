# spec-v1729 — The page's range and the agents' range, compared

> Status: **SHIPPED (2026-11-15)**: three tools brought into agreement and a new finder. The catalog stays 2,387.

spec-v1728 found 18 fields whose inputs declared `min` on the page while their agent adapter declared no range.
`test/integration/agent-range-gap-probe.spec.js` asks that question of every number input: it opens each tool,
reads each input's `min` and `max`, and compares them with the adapter field of the same `dom` id.

| Finding | Count | What it means |
|---|---|---|
| Page declares a bound the adapter does not | 4,113 | almost all `min="0"` on a field whose library refuses a negative itself; the sign-flip finder covers the rest |
| Both declare a bound, and they differ | 100 | read below |

For the 100, each was driven through the library at a value between the two bounds:

| Result | Count | Meaning |
|---|---|---|
| The library refuses it too | 92 | consistent: on the page the library's own message answers, only the warning differs |
| The library answers it | 8 | a real disagreement, or a field the worked example never reaches |

## Settled

| Tool | Field | The two ranges | Now |
|---|---|---|---|
| `abi` | four systolic pressures | page 20+, adapter 0+ (set by spec-v1728) | adapter 20+, matching the page and `lib/bounds.js` |
| `cows` | every item | page max 5 for all eleven items | each item's own top score, from its label; a sweating score of 5 now warns "outside the 0 to 4" |
| `peds-weight-est` | age in years | page 0+, adapter 1+, label "Age in years (1-14)" | page 1+: infants use the months field |

All three checked on the page.

## The conditional fields, driven in their own branches

ABI and COWS came from the 92 (the library refused, but the two published ranges still disagreed); the
pediatric weight estimate came from the 8. The other seven of the 8, in six tools, are conditional fields the
worked example never reads, so each was driven again in the branch that uses it:

| Tool | Field (adapter minimum) | In its own branch |
|---|---|---|
| `cholera-rehydration` | pregnancy SBP (30) | the library refuses below 30 too: consistent |
| `newborn-hypoglycemia-who` | sick-infant weight (0.4 kg) | refuses below 0.4: consistent |
| `iron-supplement-who` | pregnancy Hb (30 g/L), preterm weight (0.3 kg) | refuses below each: consistent |
| `antivenom-repeat` | initial dose (1 vial) | refuses below 1: consistent |
| `td-pregnancy-schedule` | prior adult Td doses (1) | refuses below 1: consistent |
| `brazil-spider-antivenom` | child weight (2 kg) | **a defect**: the weight only feeds the Loxosceles prednisone line, and an entered weight below 2 kg read "weight: not entered, so no mg dose". It now says "no mg dose: The weight must be between 2 and 150 kg. Check the value entered." The vial count, which does not depend on weight, still stands. Checked on the page. |

Tests: `test/unit/sign-flipped-fields.test.js` (ABI's floor), the spider-bite test file (the prednisone line).
