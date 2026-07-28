# spec-v564.md — PROPKD score tile

> Status: **SHIPPED (2026-07-28).** Builds the `propkd` tile. Catalog **1413 → 1414**, group G.

## Why

`propkd` was zero-hit, and `grep -c "id: 'propkd'" app.js` returned 0.

**A companion to `mayo-adpkd`, on a different axis.** The Mayo classification stratifies from **kidney
volume** on a scan; PROPKD stratifies from **genotype and clinical history** and needs no imaging at all.
The two disagree on real patients, which is the point of having both — they are cross-linked.

## What it does

| Variable | Points |
| --- | --- |
| Male sex | 1 |
| Hypertension before 35 | 2 |
| First urologic event before 35 | 2 |
| PKD2 mutation | 0 |
| Non-truncating PKD1 mutation | 2 |
| Truncating PKD1 mutation | 4 |

| Score | Risk | Median age for ESRD |
| --- | --- | --- |
| 0-3 | Low | 70.6 years |
| 4-6 | Intermediate | 56.9 years |
| 7-9 | High | 49 years |

## The three rules a plausible implementation breaks

**1. "PKD2 mutation, 0 points" is an explicit finding, not an absence.** This is the trap a zero-point level
invites. Scoring 0 **asserts that PKD2 was found**. A patient who has not been genotyped has **no** PROPKD
score — the variable is missing, not zero — and defaulting them to the 0-point level returns a low-risk
result built on an assertion nobody made. The lib offers no "unknown"/"not tested" option and refuses
without a category; a test asserts no such member exists. The score is likewise **inapplicable** where no
PKD1 or PKD2 mutation was found: the PKD2 level is not a fallback.

**2. The mutation term supplies up to 4 of the 9 points from a single categorical variable.** Mutually
exclusive and non-linear (0/2/4) — a truncating PKD1 mutation alone reaches the intermediate band before any
clinical variable is counted.

**3. Both clinical variables are age-gated at 35, and the instrument is weakest in young patients.** A later
analysis notes the score may not help identify rapid progression under 35 unless the patient is *already*
hypertensive and has *already* had urologic complications — least informative in exactly the patients one
most wants to stratify. The optional age input does not enter the score; it only attaches that caveat.

## Two smaller disclosures

**Band boundary.** The low-risk band runs **0-3**. One widely circulated slide draws the strip starting at
1, which would leave a score of 0 unbanded; the paper is followed (spec-v97).

**Predictive values come from a different paper.** The 81.4% NPV and 90.9% PPV for ESRD before 60 are quoted
from a separate review, not the derivation paper, and are labeled as such.

**A urologic event means something specific:** gross hematuria, cyst infection, or flank pain related to
cysts — not any urological problem.

## Scope (spec-v11 §5.3)

Predicts the **age at which** end-stage renal disease is reached, at a **group** level. The band medians are
population figures with wide spread, not a forecast for the patient in front of you. It does **not** diagnose
ADPKD and does **not** measure current kidney function — a high-risk score says nothing about today's eGFR.
It is not by itself an indication for a vasopressin receptor antagonist or any other treatment, and it does
not decide transplant or dialysis timing.

## Files

- `lib/propkd-v564.js` — `propkd()`, `MUTATION_CATEGORIES`, `CLINICAL_VARIABLES`, `PROPKD_MAX`, `AGE_GATE`.
- `views/group-v564.js` (RV564) — genotype under its own **h2**, with no "not tested" option by design.
- `mcp/adapters/propkd-v564.js` — wave 389.
- `test/unit/propkd.test.js` — 19 tests.
- `docs/spec-v564.md` (this file).

## Sourcing (spec-v97)

The derivation paper's own abstract and an independent reproduction of the scoring table agree on every
weight and every band.

- Cornec-Le Gall E, Audrézet MP, Rousseau A, et al. The PROPKD score: a new algorithm to predict renal
  survival in autosomal dominant polycystic kidney disease. *J Am Soc Nephrol.* 2016;27(3):942-951.
