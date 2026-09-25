# spec-v1465 — three more blank selects that answered as a choice

Found by the same blank-select probe as [spec-v1460](spec-v1460.md). Each is an optional select on
the agent surface that, left out, gave a specific answer with nothing saying so. None affected the
page, whose selects always hold a visible choice.

| Tool | A blank read as | Harm | Now |
|---|---|---|---|
| NIOSH lifting | duration "one hour or less", coupling "good", asymmetry 0° | Each is its multiplier's best value, so the lifting index is at its lowest. Long duration took one task from 1.03 to 1.29. | At or below 1.0, the answer names each value taken at its best, the rule spec-v1096 set for a blank lift rate. Above 1.0 nothing is added, because the reading is already a floor. |
| Methacholine | a PD20 (dose, micrograms) | The same 50 reads **mild** as a PD20 and **normal** as a PC20 in mg/mL. | The metric is required. A blank is asked for: "Choose which metric 50 is ...". |
| Acute pericarditis | "acute (new onset)" | A course nobody entered was printed as a finding. | The count is unchanged, and the answer says no course was entered. |

## Tests

- `test/unit/niosh-lifting.test.js`: the existing tests still pass.
- `test/unit/methacholine.test.js`: a blank metric is asked for, and 50 is graded differently under
  each metric. Sixteen assertions that relied on the PD20 default now state it.
- `test/unit/pericarditis.test.js`: a blank course is not printed.

The NIOSH disclosure was also checked through the agent path: it appears at an index of 0.86 and
not at 1.37.
