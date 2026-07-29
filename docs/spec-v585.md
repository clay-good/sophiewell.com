# spec-v585 — RUCAM (drug- and herb-induced liver injury causality)

## What this gives you

The updated RUCAM score for whether a particular drug or herb caused an episode of liver injury — with the
right one of its **two** scoring tables selected automatically, and with a timing exclusion reported as an
exclusion rather than a low score.

## Why it exists

The catalog carried King's College criteria — a **severity** axis for liver failure — and nothing on the
**causality** axis, which is the question actually asked when a patient on a new drug develops abnormal liver
tests. `grep -ci rucam app.js` returned 0.

## The R ratio picks the scale — before any item is answered

R = (ALT ÷ ALT ULN) ÷ (ALP ÷ ALP ULN)

| R | Pattern | Table used |
|---|---|---|
| ≥ 5 | hepatocellular | hepatocellular |
| strictly between | **mixed** | **cholestatic** — mixed has none of its own |
| ≤ 2 | cholestatic | cholestatic |

This is why four laboratory values are required inputs even though they score nothing.

## The two tables differ in four of seven domains — under the same names

| Domain | Hepatocellular | Cholestatic |
|---|---|---|
| Latency, prior exposure | 1–15 days = +2 | 1–90 days = +2 |
| Exclusion window after stopping | > 15 days | > 30 days |
| Dechallenge window | 30 days | 180 days |
| Dechallenge range | −2 to +3 | 0 to +2 |
| Risk-factor line | age, alcohol | age, alcohol **or** pregnancy |

The `onset` and `course` keys are shared, so **the same key can be worth different points in two cases**. A
value from the wrong table is refused, not silently scored.

The other three domains — concomitant drugs, exclusion of other causes, previous information — are identical
on both scales, and both reach **−3**: a case can be argued *out* of causality as well as into it.

## Timing can end the assessment

Onset before the drug was started, or too long after it was stopped, is an **exclusion**: `total: null`, no
score at all.

## Bands, and why they are not equally hard to reach

≤ 0 excluded · 1–2 unlikely · 3–5 possible · 6–8 probable · ≥ 9 highly probable.

Best reachable total: **14** hepatocellular, **13** cholestatic. Same bands, different ranges — so the tile
returns `scaleMax` alongside the total.

## One cell reconciled, not recalled (spec-v97)

Two authoritative reproductions render the cholestatic risk-factor line differently — pregnancy as an extra
item, or sharing a line with alcohol. Both state a **domain maximum of +2**, which is only consistent with the
shared line. That reading is applied and the divergence is stated.

## Scope (spec-v11 §5.3)

RUCAM grades **causality, not severity** — a highly probable case may be mild and an excluded one may be in
liver failure. It is not a diagnosis and does not tell anyone to stop or continue a drug. It must **never** be
used to justify readministration: rechallenge is scored because it sometimes happens, not because it is
advisable, and deliberate rechallenge has killed patients.

## Sources

- Danan G, Teschke R. RUCAM in drug and herb induced liver injury: the update. *Int J Mol Sci.* 2016;17(1):14.
- LiverTox (NIDDK). Roussel Uclaf Causality Assessment Method (RUCAM) in drug induced liver injury.

## Files

`lib/rucam-v585.js`, `views/group-v585.js`, `mcp/adapters/rucam-v585.js` (wave 410),
`test/unit/rucam.test.js`. Catalog 1434 → 1435; MCP 1371 → 1372.
