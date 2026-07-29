# spec-v594 — ARC-HBR criteria (high bleeding risk after PCI)

## What this gives you

Whether a patient undergoing PCI meets the Academic Research Consortium definition of high bleeding risk —
with the combination rule applied correctly and the banded variables counted once.

## Why it exists

The catalog carried bleeding-risk **scores** (`crusade`, `dapt-score`, `mehran-cin`) and had no ARC-HBR
**definition**. Every slug spelling, prose search and filename search returned zero.

## The rule: 1 major **or** 2 minor

Two minor criteria are worth one major. A patient with minor criteria alone and **no** major criterion **is**
at high bleeding risk. A widely used online calculator states the rule as "at least one major criterion",
which reports exactly those patients as not at risk — the tile flags them with `qualifiesOnMinorsAlone`.

## The banded variables — asked once, never twice

| Variable | Major | Minor |
|---|---|---|
| Hemoglobin | < 11 g/dL (both sexes) | 11–12.9 (men), 11–11.9 (women) |
| eGFR | < 30 mL/min | 30–59 |
| Prior spontaneous bleeding | < 6 months, or recurrent | 6–12 months |
| Prior ischemic stroke | moderate/severe < 6 months | any other, any time |

These are **not** separate criteria. A hemoglobin of 10 is major; a hemoglobin of 12 in a man is minor; the
same patient cannot be both. Twenty independent checkboxes double-count exactly these four.

**The anemia minor band is sex-split and the major band is not** — so a hemoglobin of 12.0 is a minor
criterion in a man and no criterion at all in a woman.

Other major: platelets < 100 ×10⁹/L, long-term OAC, bleeding diathesis, cirrhosis with portal hypertension,
active malignancy < 12 months, spontaneous ICH **ever**, traumatic ICH < 12 months, brain AVM, non-deferrable
surgery on DAPT, major surgery/trauma < 30 days. Other minor: age ≥ 75, long-term NSAIDs or steroids.

**Six different timing windows** — 6 months, 6–12 months, 12 months, any time, 30 days.

## A definition, not a score

No points, no ranking. It targets an **absolute** risk: BARC 3–5 bleeding ≥ 4%, or ICH ≥ 1%, at one year.
The criteria counts are provenance for the verdict, not a severity measure.

## Scope (spec-v11 §5.3)

Identifies **bleeding** risk and does not weigh it against **ischemic** risk — the two travel together, since
most features that raise one raise the other. Meeting the definition is not an instruction to shorten dual
antiplatelet therapy, drop an agent, choose a particular stent, or withhold anticoagulation for an indication
that needs it. It does not predict bleeding in an individual.

## Sourcing (spec-v97)

Criteria and the combination rule double-confirmed across two independent sources. A third rendering states
the rule as "at least 1 major" alone; the two agreeing on "1 major or 2 minor" are implemented, and the
discrepancy is reported rather than hidden.

- Urban P, Mehran R, Colleran R, et al. *Circulation.* 2019;140(3):240-261.

## Files

`lib/arc-hbr-v594.js`, `views/group-v594.js`, `mcp/adapters/arc-hbr-v594.js` (wave 419),
`test/unit/arc-hbr.test.js`. Catalog 1443 → 1444; MCP 1380 → 1381.
