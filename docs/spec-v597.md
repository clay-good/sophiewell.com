# spec-v597 — PANC 3 score (severe acute pancreatitis at admission)

## What this gives you

Whether three admission-time findings predict severe acute pancreatitis — with the two things about this
score that are routinely got wrong made explicit.

## Why it exists

A **timing-axis gap**. `ranson-bisap`, `glasgow-imrie` and `atlanta-pancreatitis` are all in the catalog, and
the two classical severity scores among them need **48 hours**. Admission-time prediction is PANC 3's whole
reason for existing. Every slug spelling and filename search returned 0.

## The rule — all three, not a majority

| Criterion | Threshold |
|---|---|
| Hematocrit | > **44 %** |
| Body mass index | > **30 kg/m²** |
| Pleural effusion on chest radiograph | present |

The score runs 0–3 and **only a 3 is positive**. Two of three is negative — a "2 or more" threshold
over-calls severity. A test walks every two-of-three combination.

## It is a rule-in test

Specificity **96–100%**, sensitivity **50–75%**. A positive result is strong evidence; **a negative result
misses between a quarter and a half of severe cases**. Every negative result carries that warning.

## Two units are wrong in circulating reproductions

Secondary sources print hematocrit as "**mg/dL**" — it is a percentage with no mass concentration — and BMI
as "**mg/kg²**" instead of kg/m². The values 44 and 30 are right; those units are not.

## What "severe" means here

Organ failure **persisting beyond 48 hours**, graded by the modified Marshall score (`modified-marshall`, in
this catalog). So PANC 3 is an admission-time prediction of a 48-hour outcome.

**Amylase and lipase are not inputs** — as with the other severity tiles, the enzymes that *diagnose*
pancreatitis play no part in predicting its severity.

## Scope (spec-v11 §5.3)

Predicts severity in an **established** diagnosis. It does not diagnose pancreatitis, does not identify the
cause — gallstone pancreatitis may need intervention this score knows nothing about — does not set fluid
rates, does not indicate antibiotics (not indicated for sterile necrosis), and does not indicate imaging.
**A negative result is not a reason to withhold monitoring** in a patient who looks unwell.

## Source

- Brown A, James-Stevenson T, Dyson T, Grunkenmeier D. *J Clin Gastroenterol.* 2007;41(9):855-858.

## Files

`lib/panc3-v597.js`, `views/group-v597.js`, `mcp/adapters/panc3-v597.js` (wave 422),
`test/unit/panc3.test.js`. Catalog 1446 → 1447; MCP 1383 → 1384.
