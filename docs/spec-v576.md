# spec-v576.md — Ablett tetanus severity classification tile

> Status: **SHIPPED (2026-07-28).** Builds the `ablett-tetanus` tile. Catalog **1425 → 1426**, group G.

## Why

A **companion-axis gap**. The catalog's `tetanus` tile is the **Tetanus Prophylaxis Decision Tree** — wound
management and immunization, applied to someone who does *not* have tetanus. Ablett grades **established
disease**. The two never apply to the same patient at the same moment. (`ablett` was zero-hit;
`grep -c "id: 'ablett-tetanus'" app.js` returned 0.)

## What it does

| Grade | Picture |
| --- | --- |
| 1 (mild) | Mild trismus, general spasticity, no respiratory compromise, no spasms, no dysphagia |
| 2 (moderate) | Moderate trismus, rigidity, short spasms, mild dysphagia, moderate respiratory involvement, ventilatory frequency >30 |
| 3 (severe) | Severe trismus, generalized rigidity, prolonged spasms, severe dysphagia, apnoeic spells, pulse >120, ventilatory frequency >40 |
| 4 (very severe) | **Grade 3 with** severe autonomic instability — hypertension and tachycardia alternating with relative hypotension and bradycardia |

## The four rules a plausible implementation breaks

**1. Grade 4 is not a distinct picture — it is grade 3 plus a modifier.** The original says so literally. The
classification is really **three severity levels and one boolean**, which is why series report "Ablett
III/IV" as one stratum. The lib takes the picture as 1-3 and the modifier separately; grade 4 **cannot be
selected directly**, and autonomic instability promotes **only** grade 3 — at grades 1-2 it is reported
without creating a grade 4.

**2. The vital-sign figures are illustrative, not thresholds — and they are not monotone.** Grade 2 mentions
only ventilatory frequency >30; grade 3 adds pulse >120 *and* raises frequency to >40. A patient with RR 35
and pulse 130 satisfies **neither** row cleanly. Grading is a gestalt judgment over the whole descriptor
set, so the tile accepts **no vital signs at all**. A test passes some anyway and asserts nothing changes.

**3. It is a descriptor, not a score.** No points, no sum, and **no grade 0** — there is no grade for a
patient without tetanus.

**4. Grade 1 is the only grade with no numeric criterion.** Grades 2-4 each carry vital-sign figures; that
asymmetry is in the original.

## A wording disclosure

Reproductions of the 1967 original differ slightly — grade 1 as "no dysphagia" vs "little or no dysphagia";
"mild trismus" vs "mild to moderate trismus". Every **number** is identical in every source fetched, so
these are transcription variants rather than a disagreement about the classification. The tile quotes one
named tabular reproduction and says so (spec-v97).

## Scope (spec-v11 §5.3)

It grades **established** disease. It does **not** diagnose tetanus, which is a clinical diagnosis with no
confirmatory test that rules it in or out — a negative wound culture means nothing. It does **not** decide
airway management: grades 3 and 4 conventionally prompt intensive care and ventilation, but that is a
management corollary attached by practice, not part of the classification. It does not indicate tetanus
immune globulin, antibiotics, wound debridement, or any sedative or neuromuscular agent, and it says nothing
about immunization — the separate prophylaxis tile addresses that.

## Files

- `lib/ablett-tetanus-v576.js` — `ablettTetanus()`, `ABLETT_GRADES`, `GRADE_4`, `AUTONOMIC_PROMOTES_FROM`.
- `views/group-v576.js` (RV576) — three-grade picture select plus a separate autonomic-instability control,
  and deliberately no vital-sign inputs.
- `mcp/adapters/ablett-tetanus-v576.js` — wave 401.
- `test/unit/ablett-tetanus.test.js` — 14 tests.
- `docs/spec-v576.md` (this file).

## Sourcing (spec-v97)

Quoted from a named tabular reproduction and checked against an independent reproduction giving the same
grades in prose.

- Ablett JJL. Analysis and main experiences in 82 patients treated in the Leeds Tetanus Unit. In: Ellis M,
  ed. *Symposium on Tetanus in Great Britain.* Leeds General Infirmary, 1967:1-10.
