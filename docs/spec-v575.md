# spec-v575.md — Peradeniya Organophosphorus Poisoning (POP) scale tile

> Status: **SHIPPED (2026-07-28).** Builds the `peradeniya-op` tile. Catalog **1424 → 1425**, group G.

## Why

`peradeniya`, `organophosphate` and `namba` were all zero-hit, and `grep -c "id: 'peradeniya-op-scale'"
app.js` returned 0. The catalog had no organophosphate content of any kind.

## What it does

| Parameter | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Pupil size | ≥2 mm | <2 mm | Pinpoint |
| Respiratory rate | <20/min | ≥20/min | ≥20/min **with central cyanosis** |
| Heart rate | >60/min | 41-60/min | <40/min |
| Fasciculation | None | Generalized **or** continuous | **Both** |
| Consciousness | Conscious, rational | Impaired response to verbal command | No response |
| Seizures | Absent | Present | *(no level 2)* |

**Maximum 11.** Bands: 0-3 mild · 4-7 moderate · 8-11 severe.

## The five rules a plausible implementation breaks

**1. The heart-rate row has a hole — and it is an interval, not a single value.** The levels are >60, 41-60,
and **<40**, so everything from **40 up to but not including 41** falls in none of them. Reading the table
as though rates are whole numbers makes this look like a one-value gap; it isn't. Both independent sources
print it identically, so it is the instrument, not a typo. The lib refuses anything in the interval and
names it.

**2. The pupil levels overlap on their face.** A pinpoint pupil *is* under 2 mm, so the 1- and 2-point levels
are not mutually exclusive as written. **Pinpoint takes precedence** — stated, not left to a first-match
rule.

**3. Fasciculation is a two-attribute conjunction dressed as a three-level scale.** Generalized **or**
continuous = 1; **both** = 2. Intensity is not the axis, so violent but localized twitching does not score
2. The lib takes the two attributes separately so the conjunction is structural and testable.

**4. The maximum is 11, not 12.** Five parameters run 0-2; seizures runs 0-1 only — a sixth item at half
weight. Assuming six symmetric items gives 12 and misplaces every band boundary.

**5. It must be applied before treatment.** Atropine reverses miosis and bradycardia — two of the six
parameters — so a post-atropine score is lower for reasons unrelated to the poisoning. A precondition the
tile states and cannot verify.

## Scope (spec-v11 §5.3)

It grades **severity**. It does not diagnose organophosphate poisoning and does not distinguish it from
**carbamate** poisoning, which presents almost identically while differing in the duration of enzyme
inhibition and in whether pralidoxime is indicated. It does not measure cholinesterase activity. **It is not
a dosing instrument** — it does not indicate atropine, titrate it, or decide pralidoxime or intubation.
Atropine titration in these patients is driven by secretions and oxygenation rather than by any score, and
treating this as a dosing tool is the use it would most damagingly be put to. Intermediate syndrome and
delayed neuropathy develop later and are invisible to a scale applied at presentation.

## Files

- `lib/peradeniya-op-v575.js` — `peradeniyaOp()`, the four exported ladders, `POP_MAX`,
  `NAIVE_SYMMETRIC_MAX`, `UNSCOREABLE_HEART_RATE`.
- `views/group-v575.js` (RV575) — heart rate as a **number** input so the hole surfaces, and fasciculation
  as **two** yes/no controls so the conjunction is explicit.
- `mcp/adapters/peradeniya-op-v575.js` — wave 400.
- `test/unit/peradeniya-op.test.js` — 16 tests.
- `docs/spec-v575.md` (this file).

## Sourcing (spec-v97)

Two independent reproductions whose tables are identical in every parameter, level wording and point value —
including the heart-rate hole.

- Senanayake N, de Silva HJ, Karalliedde L. A scale to assess severity in organophosphorus intoxication: POP
  scale. *Hum Exp Toxicol.* 1993;12(4):297-299.
