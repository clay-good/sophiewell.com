# spec-v604 — Bilsky ESCC scale (epidural spinal cord compression)

## What this gives you

The Bilsky grade for a spinal metastasis, with the three things about this scale that are routinely got
wrong made explicit.

## Why it exists

An **axis gap**. The catalog grades spinal-metastasis **stability** (`sins-score`) and **survival**
(`tokuhashi-revised`, `tomita-score`, `bauer-score`). None of them grades the **cord**.

## The grades — assessed on axial T2 MRI at the worst level

| Grade | Definition | |
|---|---|---|
| 0 | Bone involvement alone | low |
| 1a | Epidural impingement, **no** thecal sac deformation | low |
| 1b | Thecal sac deformation, **no** cord abutment | low |
| 1c | Deformation **with** cord abutment, no compression | low |
| 2 | Cord compression, CSF **still visible** | **high** |
| 3 | Cord compression, CSF **not visible** | **high** |

## Three things to get right

**The grades are not numbers.** `parseInt` maps 1a, 1b and 1c *all* to 1 — destroying the exact distinction
the subdivision exists to draw. They cannot be averaged or summed; a "mean ESCC grade" is meaningless. The
grade is returned as a **string**, with `ordinalRank` separate for sorting only.

**The split is inside grade 1, not at the middle.** Four of six grades are low. The boundary is *abutment*
(1c) versus *compression* (2).

**The grade does not track the deficit.** In the cited analysis the severity of paralysis was **not**
correlated with the grade. Grade 3 can have normal power; grade 1b can be severely impaired.

## The level changes the meaning — and isn't in the grade

| Level | Grade at which ≥ 50% had moderate-to-severe paralysis |
|---|---|
| C1–T2 | **1b** |
| T3–L5 | **1c** |

So grade 1b crosses the threshold in the cervicothoracic spine and not below it. The level is an optional
input, reported alongside rather than folded into the grade.

## Scope (spec-v11 §5.3)

Grades an **imaging appearance**. It does not diagnose cord compression as a clinical syndrome, does not
measure neurological function, and does not by itself indicate surgery, radiotherapy or corticosteroids — it
is one input to a decision that also weighs neurological status, oncological factors, mechanical stability
and systemic disease. **Suspected malignant cord compression is a time-critical emergency**; imaging and
specialist referral should not wait on a grading exercise.

## Source

- Bilsky MH, Laufer I, Fourney DR, et al. *J Neurosurg Spine.* 2010;13(3):324-328.

## Files

`lib/bilsky-escc-v604.js`, `views/group-v604.js`, `mcp/adapters/bilsky-escc-v604.js` (wave 429),
`test/unit/bilsky-escc.test.js`. Catalog 1453 → 1454; MCP 1390 → 1391.
