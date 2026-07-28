# spec-v577.md — MAGIC acute GVHD staging and grading tile

> Status: **SHIPPED (2026-07-28).** Builds the `magic-gvhd` tile. Catalog **1426 → 1427**, group G.

## Why

A **revised-successor gap**. The catalog ships `gvhd-grade` — the Modified Glucksberg grade. MAGIC is the
consortium standard that superseded it for data collection, and is the grading used in the ruxolitinib
registration trials. `grep -c "id: 'magic-gvhd'" app.js` returned 0.

## What it does

| Stage | Skin (active erythema) | Liver (bilirubin) | Upper GI | Lower GI |
| --- | --- | --- | --- | --- |
| 0 | No rash | <2 mg/dL | No/intermittent nausea, vomiting, anorexia | Adult <500 mL/day |
| 1 | <25% BSA | 2-3 | **Persistent** nausea, vomiting, anorexia | Adult 500-999 mL/day |
| 2 | 25-50% BSA | 3.1-6 | *(none)* | Adult 1000-1500 mL/day |
| 3 | >50% BSA | 6.1-15 | *(none)* | Adult >1500 mL/day |
| 4 | >50% BSA **+ bullae + >5% desquamation** | >15 | *(none)* | Severe pain ± ileus, or grossly bloody stool, **regardless of volume** |

**Grades:** 0 = no involvement · I = skin 1-2 only · II = skin 3, or stage 1 liver/upper GI/lower GI ·
III = liver 2-3 or lower GI 2-3 (skin 0-3, upper GI 0-1) · IV = stage 4 skin, liver or lower GI.

## The five rules a plausible implementation breaks

**1. The grade is not a maximum over the organ stages.** Stage-3 skin **alone** is grade II; stage-2 lower GI
**alone** is grade III. A *lower* organ stage produces a *higher* grade, because the table asks **which**
organ is involved, not how badly. A test constructs that inversion — a `max()` implementation gets both
cases wrong, in opposite directions.

**2. Upper GI has only two states.** No stage 2, 3 or 4 exists; the tool refuses them. A uniform 0-4 select
per organ would invent three unreachable values.

**3. Upper GI can never by itself drive grade III or IV.** In those rules it appears as a **constraint**
("with stage 0-1 upper GI") which, since 1 is its maximum, can never be violated. It contributes at grade II
and is a passenger above.

**4. Lower-GI stage 4 is qualitative and overrides volume.** A volume-derived stage could never reach it, and
would cap the sickest gut patients at 3. The volume criteria also have **separate adult and pediatric
denominators**, and two alternative measures within each (volume *or* episode count) that can disagree —
with **no tie-break rule** in the source. Hence the stage is an input, not a computation.

**5. Skin stage 4 is a conjunction, not a threshold.** >50% BSA **plus** bullae **plus** >5% desquamation.
Generalized erythroderma without bullae stays at stage 3. Skin is scored on **active erythema only**.

## Scope (spec-v11 §5.3)

It stages an **established diagnosis**. It does **not** diagnose acute GVHD, and its mimics are common and
dangerous — drug eruption, CMV and adenovirus, *C. difficile* and other enteric infection, engraftment
syndrome, sinusoidal obstruction syndrome — several of which require treatment that is the **opposite** of
immunosuppression. Biopsy and infectious workup settle that, not this table. It does not distinguish acute
from chronic GVHD, which is defined by features rather than by day 100. It does not select or dose
immunosuppression, and a grade is not an indication for corticosteroids or any second-line agent.

## Files

- `lib/magic-gvhd-v577.js` — `magicGvhd()`, the four organ ladders, `UPPER_GI_MAX_STAGE`.
- `views/group-v577.js` (RV577) — one select per organ built from **its own** ladder, so upper GI offers
  only 0 and 1.
- `mcp/adapters/magic-gvhd-v577.js` — wave 402.
- `test/unit/magic-gvhd.test.js` — 18 tests.
- `docs/spec-v577.md` (this file).

## Sourcing (spec-v97)

Transcribed from the consortium report and checked against an independent regulatory reproduction, which
matches every cell except two transcription artifacts — so the consortium wording is treated as canonical.

- Harris AC, Young R, Devine S, et al. *Biol Blood Marrow Transplant.* 2016;22(1):4-10.
