# spec-v550.md — GLASS anatomic stage tile

> Status: **SHIPPED (2026-07-28).** Builds the `glass-stage` tile — the Global Limb Anatomic Staging System
> for chronic limb-threatening ischemia. Catalog **1399 → 1400**, group G.

## Why

`femoropopliteal`, `infrapopliteal`, `clti`, `inframalleolar`, `pedal` and `limb-based` were all zero-hit.
The two `glass` hits in `lib/meta.js` are unrelated — an author surname in the Guy's stone score citation,
and ground-glass lung nodules.

**A companion to the existing peripheral-arterial tiles, not a duplicate.** `wifi` stages the **limb threat**
from wound, ischemia and foot infection. `rutherford-fontaine` stages the **symptoms**. GLASS stages
neither: it grades the **anatomic pattern of disease** along a target arterial path, to estimate what an
endovascular attempt at it would face. A limb has all three at once, and they answer different questions.

## What it does

Two segment grades (0-4 each) feed a matrix:

| FP ↓ / IP → | 0 | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- | --- |
| **0** | **NA** | I | I | II | III |
| **1** | I | I | II | II | III |
| **2** | I | II | II | II | III |
| **3** | II | II | II | III | III |
| **4** | III | III | III | III | III |

| Stage | Immediate technical failure | 1-year limb-based patency |
| --- | --- | --- |
| I | <10% | >70% |
| II | <20% | 50-70% |
| III | >20% | <50% |

## The three rules a plausible implementation breaks

**1. FP0 with IP0 is "not applicable", not stage I.** The most commonly mis-tabulated cell in the system,
and exactly the corner a model fills in by symmetry — a 5×5 matrix with a hole in the top-left looks like an
omission. It is not. With no significant disease in either segment there is **no target arterial path to
stage**, and returning stage I would assert that a limb with no significant disease is a revascularization
target. The lib returns `applicable: false`; a test asserts the band says "NOT stage I" in as many words.

**2. Severe calcification is a *grade* modifier, not a stage modifier.** It raises the affected **segment**
grade by one **before** the matrix lookup, per segment, capped at 4. The result exposes `fpBase`/`ipBase`
alongside the adjusted `fp`/`ip`, so the adjustment stays visible rather than baked into a number the reader
cannot take apart. A test asserts that FP3 + calcified IP2 becomes stage III where FP3/IP2 alone is II.

**3. The inframalleolar modifier is a descriptor and never an input to the matrix.** The guideline states
outright that the IM modifier is not considered in the primary stage assignment. P0/P1/P2 are appended —
"GLASS III, P1" — and a test asserts all three leave the stage unchanged. Letting P2 push the stage upward
would apply a rule the source does not contain.

## Scope (spec-v11 §5.3)

An anatomic description. It does **not** diagnose chronic limb-threatening ischemia, does **not** measure
perfusion, and does **not** decide between an endovascular and a surgical approach or whether to
revascularize at all. The stage estimates the difficulty and durability of an **endovascular** attempt at the
target path — it says nothing about a bypass, conduit availability, or the patient's fitness for either. The
figures attached to each stage are the guideline's **consensus estimates**, not validated per-patient
predictions.

## Files

- `lib/glass-stage-v550.js` — `glassStage()`, `FP_GRADES`, `IP_GRADES`, `IM_MODIFIERS`, `STAGE_MEANINGS`.
- `views/group-v550.js` (RV550) — the two graded segments and the modifier under **separate h2** headings,
  so the layout does not imply the modifier feeds the matrix.
- `mcp/adapters/glass-stage-v550.js` — wave 375.
- `test/unit/glass-stage.test.js` — 21 tests, including all 25 matrix cells asserted row by row.
- `docs/spec-v550.md` (this file).

## Sourcing (spec-v97)

Grades, matrix and modifiers re-fetched, never recalled, from the guideline itself:

- Conte MS, Bradbury AW, Kolh P, et al. Global Vascular Guidelines on the Management of Chronic
  Limb-Threatening Ischemia. *J Vasc Surg.* 2019;69(6S):3S-125S.
