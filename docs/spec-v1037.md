# spec-v1037 — The two customers got different answers

## The question the empty-form sweep cannot ask

`no-answer-from-nothing-sweep.spec.js` clears **every** field. That is a state a reader rarely
reaches. The likely accident is one field short: a lab that has not come back yet, on an otherwise
complete form.

There was no oracle for "which field matters" — until you notice the project already has one.
`mcp/fields.js` marks inputs `required`, and an agent that omits one gets `MISSING_INPUT` and no
number. **1,068 calculators declare at least one.** So: clear exactly one required field, leave the
worked example in place everywhere else, and ask whether the browser still answers.

Seventy-five did. The agent surface refuses; the browser answered. Same calculator, same missing
lab, two different customers, two different answers.

## The ten fixed here

| Tile | Cleared | Said |
| --- | --- | --- |
| `years-pe` | D-dimer | **PE excluded**: 0 YEARS items, D-dimer 0 < 1000 — no CTPA needed |
| `pf-ratio` | PaO2 | P/F ratio: 0 (**Severe ARDS (Berlin)**) |
| `smart-cop` | age | SMART-COP 0: **low risk** |
| `bmi` | weight | BMI: 0 kg/m² (**Underweight**) |
| `cockcroft-gault` | age | Creatinine clearance: **155.56 mL/min** |
| `urine-output` | volume | 0.00 mL/kg/hr — **meets the KDIGO Stage 3 criterion** |
| `tsat` | serum iron | 0% — **absolute iron deficiency** |
| `ttkg` | urine K | TTKG 0 — **appropriate renal K conservation** |
| `retic-index` | reticulocyte | RPI 0 — **inadequate marrow response** |
| `r-factor` | ALT | R: 0, Pattern: **Cholestatic** |
| `gir` | dextrose % | GIR: 0.00 mg/kg/min |

`years-pe` is the sharpest: a blank D-dimer read as 0 is below *every* threshold the algorithm has,
so the tile excluded a pulmonary embolism on a result nobody had. `smart-cop` is the subtlest — its
age is not a term of the score at all, it selects which thresholds the respiratory rate and the
oxygenation are measured against, so a blank one silently applied the under-50 cut-offs. The
monotone rule does not rescue that one: a missing age can move the score either way.

Two of them, `bmi` and `ttkg`, sit directly beside a sibling in the same file that has asked for its
values since spec-v1014. The idiom was there; nobody had swept for who was not using it.

## The gate

`required-field-agreement.spec.js` runs the sweep over all 1,068 on every push (~28 s, four shards).
`required-field-ledger.js` carries the remaining 65, and its header says what a line can honestly
be: the browser should ask and does not yet; the `required` declaration is wrong and the *agent*
surface is refusing answerable input; or the tile answers about what is entered and says so — a
partial score stating its own footing ("Scored from 9 of 10 items") is the honest case.

Verified by deleting the `smart-cop` line before it was fixed: the shard fails and prints the
reading.

## The rule

**Two surfaces over one calculator need one answer to "is this enough to compute?".** The agent
surface has said `required` since spec-v627; the browser had no idea until spec-v1025 made it
visible and this sweep made it checkable.
