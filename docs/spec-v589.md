# spec-v589 — Sternbach criteria (serotonin syndrome)

## What this gives you

Whether a patient meets the Sternbach criteria — with the three requirements that are not symptoms kept
separate from the symptom count, and with the disputed eleventh feature reported rather than silently
resolved.

## Why it exists

A **predecessor gap**: `serotonin-toxicity` (the Hunter criteria) was already in the catalog, and the Hunter
criteria were built to replace these. `grep -ci sternbach app.js` returned 0.

## Why the replaced criteria still matter

The usual summary is that Hunter is simply better: sensitivity **84%** vs **75%**, specificity **97%** vs
**96%**. A published re-examination points out that the Hunter derivation dataset **overlapped substantially
with its validation data**, so that comparison cannot be upheld as stated — and in that group's own case
series Sternbach missed **10%** of cases against Hunter's **37%**. Both the headline figures and the
challenge are reported.

## The rule

**At least 3 of 10 features** — mental status changes, agitation, myoclonus, hyperreflexia, diaphoresis,
shivering, tremor, diarrhea, incoordination, fever — **plus all three requirements**:

1. The features coincided with the **addition or increase** of a known serotonergic agent
2. Other causes **ruled out** (infectious, metabolic/endocrine, substance abuse or withdrawal)
3. A neuroleptic had **not** been started or increased before onset

3 of 10 is **necessary and not sufficient**. A test asserts each requirement defeats all ten features on its
own.

**The third requirement is a hard negative and the one implementations drop.** It exists because neuroleptic
malignant syndrome is the differential — a symptom count that ignores it will label an NMS patient with
serotonin syndrome.

## Two more things

- **The features are mostly non-specific.** A patient on an SSRI with a febrile gastroenteritis can reach 3
  of 10 without serotonin toxicity. That is why the exclusion requirement is load-bearing, and why the
  successor was built around clonus.
- **One reproduction adds an eleventh feature — rigidity.** Because the bar is 3 of N, a patient with
  rigidity and exactly two of the ten is positive under that rendering and negative under this one. The
  ten-item list is applied, rigidity is asked separately and never counted, and
  `verdictDependsOnDisputedFeature` fires exactly when counting it would flip the answer.

## Scope (spec-v11 §5.3)

**Failing these criteria does not exclude serotonin syndrome** — early or mild cases commonly do not meet
them, and this must never be used to rule it out. Meeting them does not grade severity and does not select
treatment: not cyproheptadine, not sedation, not paralysis and intubation for hyperthermia, and not which
drug to stop. The neuroleptic requirement is a criterion, not a reliable way to distinguish serotonin
syndrome from NMS.

## Sources

- Sternbach H. The serotonin syndrome. *Am J Psychiatry.* 1991;148(6):705-713.
- Dunkley EJC, Isbister GK, Sibbritt D, et al. The Hunter Serotonin Toxicity Criteria. *QJM.*
  2003;96(9):635-642.

## Files

`lib/sternbach-v589.js`, `views/group-v589.js`, `mcp/adapters/sternbach-v589.js` (wave 414),
`test/unit/sternbach.test.js`. Catalog 1438 → 1439; MCP 1375 → 1376.
