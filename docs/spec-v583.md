# spec-v583 — NAC / Gillmore stage (transthyretin cardiac amyloidosis)

## What this gives you

The National Amyloidosis Centre stage from two numbers — NT-proBNP and eGFR — reported in **both** the
original three-stage form and the 2024 four-stage expansion, because they disagree for a real group of
patients.

## Why it exists

Neither version was in the catalog: `grep -ci transthyretin app.js` returned 0.

## The headline: stage 4 cuts across, it does not extend stage 3

Stage 4 is NT-proBNP ≥ 10,000 ng/L **irrespective of eGFR**. So:

| NT-proBNP | eGFR | Original | Expanded |
|---|---|---|---|
| 12,000 | 60 (fine) | Stage **2** | Stage **4** |
| 12,000 | 30 | Stage 3 | Stage 4 |

The paper counts it: of 180 stage 4 patients, **65 came from original stage 2**, 115 from stage 3. Modelling
stage 4 as "stage 3 plus" silently loses the 65.

## Stage definitions

| Stage | Definition | 1-yr mortality | Median survival |
|---|---|---|---|
| 1 | NT-proBNP ≤ 3000 ng/L **and** eGFR ≥ 45 ml/min | 2.3% | not reached |
| 2 | one criterion but not both | 8.8% | not reached |
| 3 | NT-proBNP > 3000 **and** eGFR < 45 | 10.4% | 33.5 months |
| 4 *(2024)* | NT-proBNP ≥ 10,000, **any** eGFR | 30.6% | 22.5 months |

NT-proBNP in ng/L and pg/mL are numerically identical; no conversion is applied.

## Three things the source does loosely, stated rather than hidden

- **Stage 2's published definition is an OR that overlaps stage 3.** Every stage 3 patient also satisfies the
  stage 2 sentence. The intended reading — stage 2 as the residual, stage 3 taking precedence — is applied
  and disclosed.
- **The eGFR equation is never stated.** CKD-EPI and MDRD disagree by several ml/min right at the 45
  boundary.
- **Median survival is null for stages 1 and 2** because none was reached within 36 months. Quoting one would
  be inventing it.

Also: **stage 2 lumps together two opposite patients** — cardiac-dominant and renal-dominant — and the result
names which. And the 10,000 cut-point is rounded from a Youden-optimal 10,461 ng/L with a sensitivity near
54%, derived only within stage 3, so a stage below 4 is not reassurance.

## Scope (spec-v11 §5.3)

Stages a patient who **already has** the diagnosis. It does not diagnose amyloidosis, does not distinguish
transthyretin from light-chain amyloidosis — a different disease with a different and more urgent treatment —
and does not distinguish wild-type from variant ATTR, which needs TTR sequencing and has implications for
relatives. It does not select or withhold tafamidis, and a high stage is not a reason to withhold treatment.

## Sourcing (spec-v97)

Definitions extracted verbatim from the expansion paper's methods; operators and the stage-4 threshold
re-checked against an independent report because the PDF loses the ≥ and ≤ glyphs. The original paper's
median survivals are deliberately **not** quoted — only figures confirmed from the primary text are reported.

- Gillmore JD, Damy T, Fontana M, et al. *Eur Heart J.* 2018;39(30):2799-2806.
- Nitsche C, Patel RK, Hong Y, et al. *Eur J Heart Fail.* 2024;26(9):2008-2016.

## Files

`lib/nac-attr-stage-v583.js`, `views/group-v583.js`, `mcp/adapters/nac-attr-stage-v583.js` (wave 408),
`test/unit/nac-attr-stage.test.js`. Catalog 1432 → 1433; MCP 1369 → 1370.
