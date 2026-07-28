# spec-v556.md — VASI (Vitiligo Area Scoring Index) tile

> Status: **SHIPPED (2026-07-28).** Builds the `vasi` tile. Catalog **1405 → 1406**, group G.

## Why

A **whole-concept gap**: `vasi` and `vitiligo` were both zero-hit. The catalog had no vitiligo content of
any kind.

## What it does

**VASI = Σ (hand units of involvement) × (residual depigmentation)**, over body regions.

| Depigmentation | Descriptor |
| --- | --- |
| 100% | No pigment is present |
| 90% | Specks of pigment are present |
| 75% | The depigmented area exceeds the pigmented area |
| 50% | The depigmented and pigmented areas are equal |
| 25% | The pigmented area exceeds the depigmented area |
| 10% | Only specks of depigmentation are present |
| 0 | No depigmentation |

## The four rules a plausible implementation breaks

**1. Depigmentation is a seven-level ordinal ladder, not a free percentage.** The assessor snaps to the
nearest value *by description*, not by measuring. "About 60% depigmented" must become 50 or 75 — never 60.
The ladder is deliberately coarse because the underlying judgment is a visual comparison; a field accepting
an arbitrary percentage would look more precise while scoring a different instrument. A test rejects five
plausible off-ladder values.

**2. The area unit is patient-relative.** One **hand unit** is the *patient's own* palm including the
fingers, defined as **1% of their body surface area** — not a fixed area in cm². The same patch is a
different number of units on a child and a large adult. That is intended: the score is a proportion of that
person's body. The whole body is 100 units, and totals above that are refused.

**3. The region set diverged, so the tile names the one it implements.** The original used **five** regions
(upper extremities *including* axillae; lower extremities *including* inguinal regions and buttocks), with
head/neck added later. Modern protocols use **six mutually exclusive** regions where the upper extremities
**exclude** the hands and the lower extremities **exclude** the feet. Under the original five, a hand could
be counted twice. This implements the six-region set and returns `regionSet` — a VASI reported without its
region set is not reproducible.

**4. T-VASI and F-VASI are different scales.** Total-body runs **0-100**; facial runs **0-3**, because the
face is only ~3% of body surface area. A facial 2 is severe; a total-body 2 is trivial. They must never be
compared or share a band table. This computes the total-body score and states its range.

Higher is worse, and the score **falls** as repigmentation occurs — trials use it as a percent change from
baseline, not as a threshold.

## Scope (spec-v11 §5.3)

An extent-and-severity measure. It does **not** diagnose vitiligo or distinguish it from the other causes of
hypopigmentation — pityriasis alba, tinea versicolor, post-inflammatory hypopigmentation, nevus
depigmentosus, and in some settings leprosy — several of which are treated entirely differently. It does
**not** assess **disease activity**, a separate axis: a large stable patch and a small rapidly spreading one
can score alike, and activity is usually what drives urgency. It measures neither psychological burden nor
quality of life, which are frequently the reason for treatment and track poorly with area. It does not
select therapy or phototherapy dosing.

## Files

- `lib/vasi-v556.js` — `vasi()`, `VASI_REGIONS`, `DEPIGMENTATION_GRADES`, `VASI_MAX`, `F_VASI_MAX`.
- `views/group-v556.js` (RV556) — per region, a hand-unit number input and a depigmentation **select**
  (never a number field), under an **h2**.
- `mcp/adapters/vasi-v556.js` — wave 381.
- `test/unit/vasi.test.js` — 16 tests.
- `docs/spec-v556.md` (this file).

## Sourcing (spec-v97)

One fetched source contains a typographic error — it lists "5%" in its enumeration while defining 25% in its
own prose. The correct ladder (0, 10, 25, 50, 75, 90, 100) is confirmed verbatim by an independent second
source, so the erroneous value is not carried.

- Hamzavi I, Jain H, McLean D, Shapiro J, Zeng H, Lui H. Parametric modeling of narrowband UV-B phototherapy
  for vitiligo using a novel quantitative tool: the Vitiligo Area Scoring Index. *Arch Dermatol.*
  2004;140(6):677-683.
- Two independent reviews reproducing the granular depigmentation values and the hand-unit method.
