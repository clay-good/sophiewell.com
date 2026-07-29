# spec-v596 — Lepine criteria (pleural exudate, no serum sample)

## What this gives you

Whether a pleural effusion is exudative by the Lepine rule — computed alongside the Heffner two-test rule
from the same three inputs, because the two rules disagree in both directions.

## Why it exists

A direct companion to `heffner` (spec-v591). Both are serum-free two-test rules built from the **same two
measurements**. `grep -c "id: 'lepine'" app.js` returned 0, as did every other slug spelling and every
filename search.

## The rule — either test alone

| Test | Lepine | Heffner (two-test) |
|---|---|---|
| Pleural LDH | > **0.6** × serum LDH ULN | > 0.45 × serum LDH ULN |
| Pleural cholesterol | > **40** mg/dL (1.04 mmol/L) | > 45 mg/dL |

**One positive test is enough.** The tests do not vote — reading either rule as requiring *both* would call
almost every exudate a transudate.

## Neither rule dominates the other

The thresholds move in **opposite** directions: Lepine's LDH bar is *higher* (harder to trigger), its
cholesterol bar *lower* (easier). So each calls some effusions exudative that the other calls transudative:

| Input (serum LDH ULN 250) | Lepine | Heffner |
|---|---|---|
| cholesterol 42 mg/dL | **exudate** | transudate |
| pleural LDH 130 U/L | transudate | **exudate** |

## The trade is specificity

Lepine **0.91** sensitive / **0.73** specific; Heffner **0.93** / **0.58**. About 15 points of specificity
for about 2 of sensitivity — so "comparable to Light's criteria" is a claim about **specificity**, not
overall superiority.

## Not actually serum-free

The LDH test needs your laboratory's upper limit of normal for **serum** LDH. No patient blood is drawn, but
it is **not a fixed number** — it varies by lab and assay, so it is required and never defaulted.

## Scope (spec-v11 §5.3)

Classifies the effusion; it does **not** give the cause. An exudate can be infection, malignancy, pulmonary
embolism or many other things — the classification is the beginning of the workup, not the end. It does not
indicate or contraindicate drainage, does not diagnose empyema or malignancy, and a transudative result does
not exclude a coexisting exudative process. Diuresis concentrates a transudate and can push any of these
rules to a false exudate.

## Source

- Lepine criteria as reproduced and evaluated in a comparison of seven cholesterol- and LDH-based criteria
  for differentiating exudative from transudative pleural effusions. *Sci Rep.* 2025.

## Files

`lib/lepine-v596.js`, `views/group-v596.js`, `mcp/adapters/lepine-v596.js` (wave 421),
`test/unit/lepine.test.js`. Catalog 1445 → 1446; MCP 1382 → 1383.
