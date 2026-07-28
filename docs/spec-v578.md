# spec-v578.md — Nancy histological index tile

> Status: **SHIPPED (2026-07-28).** Builds the `nancy-index` tile. Catalog **1427 → 1428**, group G.

## Why

A **companion gap on a different axis**. The catalog already has the *endoscopic* ulcerative colitis scores
— Mayo endoscopic subscore and UCEIS — and had no *histologic* one. Endoscopic and histologic activity
diverge in real patients, and histologic remission is the stricter target.

## What it does

A **decision tree**, evaluated in strict priority order:

1. **Ulcers or erosions?** → grade **4**, outright.
2. Else **neutrophilic infiltrate**: few/rare, difficult to see → **2**; multiple easily apparent clusters → **3**.
3. Else **chronic infiltrate**: moderate/severe → **1**; no or only mild → **0**.

**Remission = 0. Response ≤ 1.**

## The four rules a plausible implementation breaks

**1. It is not a sum.** The first item that fires decides the grade; the rest are not consulted. Building it
additively is wrong in *both* directions — mild findings would accumulate into a high grade, and an
ulcerated biopsy could score below 4 because its other features were unremarkable. A test asserts a quiet
specimen cannot offset ulceration.

**2. Chronic inflammation is a dead end at grade 1.** However florid, it can **never** exceed 1 — it only
decides 0 vs 1, and only when neutrophils and ulcers are both absent. A heavily chronically inflamed biopsy
with no neutrophils is a grade 1, and no amount of chronic change makes it a 2.

**3. The published threshold condition is structurally guaranteed here.** Response is defined as ≤1 "when
there are no neutrophils in the epithelium, nor erosions or ulcers" — and by the priority order, a grade ≤1
can *only* arise when those are absent. The tile reports the condition anyway, because applying the same
numeric threshold to a score computed some other way **could** reach it with neutrophils present.

**4. The denominator is the set of biopsies from the visit — the worst biopsy wins.** Not one slide. A
comparative study instead *averaged* several ratings, an operationally different denominator that will not
reproduce this index.

*A search hazard worth noting:* the index is named after the **city** of Nancy, France — not a person.

## Scope (spec-v11 §5.3)

A histologic **activity grade**. It does **not** diagnose ulcerative colitis and does not distinguish it
from what mimics it on a biopsy — infectious colitis, Crohn colitis, ischemic colitis and drug-induced
injury all produce an active colitis picture, and the distinction rests on clinical context, distribution
and culture. It does **not** assess dysplasia or cancer risk, which is a separate reading of the same
specimen. It does not measure endoscopic or symptomatic activity, which diverge from histology in both
directions. It does not select or escalate therapy.

## Files

- `lib/nancy-index-v578.js` — `nancyIndex()`, `NEUTROPHIL_LEVELS`, `CHRONIC_LEVELS`, `NANCY_GRADES`,
  `ULCERATION_GRADE`, `REMISSION_GRADE`, `RESPONSE_MAX_GRADE`.
- `views/group-v578.js` (RV578) — the three features under **h2** headings in priority order, each labelled
  with what it decides.
- `mcp/adapters/nancy-index-v578.js` — wave 403.
- `test/unit/nancy-index.test.js` — 18 tests.
- `docs/spec-v578.md` (this file).

## Sourcing (spec-v97)

Transcribed from a review reproducing the index table and its algorithm verbatim, and checked against the
authors' own practical guide, which gives the same descriptors with slightly different wording at grade 0.

- Marchal-Bressenot A, Salleron J, Boulagnon-Rombi C, et al. *Gut.* 2017;66(1):43-49.
- Marchal-Bressenot A, et al. A practical guide to assess the Nancy histological index for UC. *Gut.*
  2016;65(11):1919-1920.
