# spec-v562.md — Scale for Contraversive Pushing tile

> Status: **SHIPPED (2026-07-28).** Builds the `scp-pushing` tile. Catalog **1411 → 1412**, group G.

## Why

`contraversive` and `pusher` were both zero-hit, and `grep -c "id: 'scp-pushing'" app.js` returned 0.

## What it does

Three sections, each scored **sitting and standing** and the two **summed** — so each section runs 0-2 and
the total 0-6. Many secondary descriptions call this "three items, 0-1 each" and get the maximum wrong by a
factor of three.

| Section | Ladder |
| --- | --- |
| **A** Spontaneous body posture | 1 (severe tilt with falling) / 0.75 (severe, no falling) / 0.25 (mild, no falling) / 0 — **no 0.5** |
| **B** Use of the nonparetic extremities | 1 (spontaneous at rest) / 0.5 (only on changing position) / 0 |
| **C** Resistance to passive correction | 1 / 0 (binary) |

## The three rules a plausible implementation breaks

**1. The total is not the classifier.** Pusher behavior is diagnosed only when **all three** sections
independently clear the threshold. A patient scoring **4 of 6** (A=2, B=2, C=0) is **not** a pusher, while a
patient scoring **1.75** spread across all three **is**. Thresholding a total is the most natural thing to do
with a scored instrument, and it is wrong here. A test asserts the inversion directly: the lower-scoring
patient qualifies where the higher-scoring one does not.

**2. The point ladders differ between sections and are not equally spaced.** Section A has **no 0.5**; the
gap between 0.25 and 0.75 is real. Each field's enum carries only its own section's values, and a test
asserts 0.5 is refused in section A.

**3. Three named criteria coexist, and all three are reported.** They are not a source disagreement to
refuse — they were formalized and named together and answer different questions:

| Criterion | Rule | Note |
| --- | --- | --- |
| Crit_1 | Total > 0 | |
| Crit_2 | Every section > 0 | **Current recommendation**; highest agreement with clinical diagnosis |
| Crit_3 | Every section ≥ 1 | Karnath's original; the **only** one with no false positives |

The revision exists because the original missed cases: sensitivity rose from **58.8% to 94.1%** with
specificity unchanged at **100%**. The result flags when the criteria disagree on a given patient.

## A secondary-source warning, carried deliberately

A widely used rehabilitation-measures reference states Karnath's criterion as subscores **above 1**. The
primary sources say **1 or more**. The stricter misreading would reclassify every patient scoring exactly 1
in a section. The primary sources are implemented (spec-v97).

## Not specified by either primary source

How to score a patient who **cannot stand**. Assessment is described as being done in both positions "when
possible", and neither source says what to do with a truncated denominator. The lib requires both positions
rather than inventing a rule, and the refusal says so.

## Scope (spec-v11 §5.3)

This identifies a **behavior**, not a lesion and not a diagnosis. It does not diagnose stroke, localize it,
or distinguish pusher behavior from the other causes of postural asymmetry after stroke — hemianopia,
spatial neglect, ataxia, vestibular dysfunction and simple weakness all tilt a patient, and several commonly
coexist with pushing. It does not measure neglect, a separate and frequently co-occurring problem with its
own instruments. It does not predict recovery for an individual and does not select or dose a rehabilitation
intervention.

## Files

- `lib/scp-pushing-v562.js` — `scpPushing()`, `SCP_SECTIONS`, `SCP_POSITIONS`, `SCP_CRITERIA`.
- `views/group-v562.js` (RV562) — one **h2** per section, each with its own sitting/standing selects built
  from that section's own ladder.
- `mcp/adapters/scp-pushing-v562.js` — wave 387.
- `test/unit/scp-pushing.test.js` — 16 tests.
- `docs/spec-v562.md` (this file).

## Sourcing (spec-v97)

- Baccini M, Paci M, Rinaldi LA. The Scale for Contraversive Pushing: a reliability and validity study.
  *Neurorehabil Neural Repair.* 2006;20(4):468-472 (Table 1, credited to Karnath et al.).
- Baccini M, Paci M, Nannetti L, Biricolti C, Rinaldi LA. Scale for contraversive pushing: cutoff scores for
  diagnosing "pusher behavior". *Phys Ther.* 2008;88(8):947-955.
- Bergmann J, Krewer C, Rieß K, Müller F, Koenig E, Jahn K. Inconsistent classification of pusher behaviour
  in stroke patients. *Clin Rehabil.* 2014;28(7):696-703.
