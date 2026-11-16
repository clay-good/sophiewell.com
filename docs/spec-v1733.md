# spec-v1733 — Blank read as zero, driven instead of grepped

> Status: **SHIPPED (2026-11-15)**: a fix to `allowed-amount`; review recorded. The catalog stays 2,387.

`scripts/probe-blank-coercions.mjs` greps for `Number.isFinite(Number(v))` with no blank test nearby: 165 lines.
Its own header says most are harmless and to read hits rather than fix them in bulk. The question it stands in
for can be asked directly, so it was: for every number field with a nonzero worked-example value (3,551), does
the field left blank give exactly the answer an entered 0 gives, with nothing in the answer saying so?

| Rows | Exposure | Result |
|---|---|---|
| 138 | at the library | |
| of which required for agents | an agent leaving it out is refused before the library runs; the page side was swept by the one-blank-field page probe | not reopened |
| 41 optional | an agent can leave it out and get the zero reading | read below |

Of the 41 optional rows, nearly all are real zeros or optional extras: plaque and gingival surface counts, sites
treated, a drug not taken, flow when only the volume is wanted, carbs for a correction-only insulin dose, a
modifying unit, the ancillary MIDAS item. Six were driven:

| Tool | Field | Result |
|---|---|---|
| `drg-payment` | capital base rate | fine: the result carries `capitalStated: false` |
| `acromegaly-biochem` | IGF-1 | fine: "Not enough entered to interpret" |
| `cob-calc` | what the secondary would pay | fine: refused, "a blank one is not a benefit of zero" |
| `medicare-cost-share` | remaining deductible | fine on the page and for an omitted field (the CY2026 default is applied, as the label says). Only an agent sending the literal empty string gets $0; left as is. |
| **`allowed-amount`** | remaining deductible, coinsurance, copay | **a defect**: one term left blank among the others was applied as zero without a word. A blank deductible took the example's patient share from $200 to $120. |

## The fix

`allowed-amount` already refused when all three cost-share terms were blank. With one or two blank, it now adds
"The remaining deductible and copay were not entered, so none is applied." to the reading, the same sentence
`site-of-care-compare` uses. An entered 0 counts as entered. Checked on the page; test in
`test/unit/billing-v82.test.js`.
