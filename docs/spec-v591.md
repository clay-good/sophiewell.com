# spec-v591 — Heffner criteria (pleural exudate, no serum sample)

## What this gives you

Whether a pleural effusion is exudative, using the pleural fluid alone — plus an honest account of what you
give up by skipping the serum draw.

## Why it exists

A **companion gap**: `light-criteria` is already in the catalog, and Light's criteria require a paired serum
sample drawn at the same time. Heffner's rules were derived to answer the same question without one.
`grep -ci heffner app.js` returned 0.

## The rule — any one test is enough

| Test | Threshold |
|---|---|
| Pleural fluid LDH | > **0.45 ×** the laboratory ULN for **serum** LDH |
| Pleural fluid cholesterol | > **45** mg/dL |
| Pleural fluid protein | > **2.9** g/dL |

The tests **do not vote**: one positive classifies the effusion as an exudate, and two negatives do not
outweigh it.

## The four things worth knowing

- **"No serum sample" is not quite true.** The LDH test needs your laboratory's upper limit of normal for
  *serum* LDH. No patient blood is drawn, but it is **not a fixed number** — it varies by lab and assay. The
  tile requires it and defaults nothing.
- **The thresholds are not the round numbers they resemble.** Protein is 2.9, not 3.0. The multiplier is
  0.45, not two-thirds. "Protein over 3" is a *different test*.
- **There are two published rules.** Dropping the protein test gives a two-test rule (LDH or cholesterol).
  Both are returned, and they disagree **exactly** when protein is the only positive.
- **The trade is specificity.** ~98.4% sensitive, ~85% specific — far less specific than Light's, which
  already miscalls 15–20% of transudates as exudates. A positive here is **weaker** evidence of an exudate.

Shared failure mode with Light's: **diuresis** concentrates a transudate and can push either rule to a false
exudate.

## Scope (spec-v11 §5.3)

Classifies the effusion; it does **not** give the cause. An exudate can be infection, malignancy, pulmonary
embolism or many other things — the classification is the beginning of the workup, not the end. It does not
indicate or contraindicate drainage, does not diagnose empyema or malignancy, and a transudative result does
not exclude a coexisting exudative process.

## Sources

- Heffner JE, Brown LK, Barbieri CA. *Chest.* 1997;111(4):970-980.
- Heffner JE, et al. *Chest.* 2002 (abbreviated cut points).

## Files

`lib/heffner-v591.js`, `views/group-v591.js`, `mcp/adapters/heffner-v591.js` (wave 416),
`test/unit/heffner.test.js`. Catalog 1440 → 1441; MCP 1377 → 1378.
