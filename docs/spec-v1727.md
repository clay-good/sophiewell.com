# spec-v1727 — A choice that is not one of the options

> Status: **SHIPPED (2026-11-15)**: fixes to `ild-gap` and `resp-score`. The catalog stays 2,387.

Left open by spec-v1723. Both scores read their selects through one helper, `selI`, which turned a missing
choice, or a value that is not one of the options, into 0:

| Tool | Field | What 0 is |
|---|---|---|
| `ild-gap` | ILD subtype, age band, DLCO band | the lowest-risk band of each |
| `resp-score` | age band, days of ventilation, diagnosis | a real band, chosen for the reader |

The page's selects have no blank option and the agents' enums are required, so no reader could reach it today.
A direct caller of the library could, and it scored silently. Each field is now checked against its own
options and refused by name: "Choose the age band, DLCO band from the options listed."

Tests: `test/unit/pulmonary-risk-v221.test.js`. One existing RESP test left days of ventilation out and relied
on it reading as 0; it now supplies the 0.
