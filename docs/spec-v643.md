# spec-v643.md — Oswestry Disability Index (ODI)

> Status: **SHIPPED (2026-08-03).** Builds the `oswestry-odi` tile. Catalog **1473 → 1474**, group G.

## Why

A **companion gap**. The Roland-Morris Disability Questionnaire (`roland-morris-disability`) and the Neck
Disability Index (`neck-disability-index`) were in the catalog, but the ODI — the single most widely used
low-back-pain disability instrument — was missing (`oswestry` was zero-hit; the one `odi` hit is an unrelated
sleep-apnea "oxygen desaturation index" tile).

## What it does

Ten sections, each rated **0–5** (higher is worse). The score is a percentage with a **variable denominator**:

**ODI% = round( sum / (5 × sections answered) × 100 )**

so a section left unanswered (e.g. "sex life", legitimately skipped) drops the divisor by 5 rather than
scoring zero. Rounding to a whole percent (a convention — Fairbank prints no rounding rule) makes the integer
grade bands exact.

| ODI % | Grade |
| --- | --- |
| 0–20 | Minimal disability |
| 21–40 | Moderate disability |
| 41–60 | Severe disability |
| 61–80 | Crippled |
| 81–100 | Bed-bound (or symptoms exaggerated) |

## Two implementation decisions

1. **The denominator varies.** A tile that always divided by 50 would misreport every patient who omits a
   section. A test omits one section (9 × 3 = 27 over a denominator of 45) and asserts the same 60% as all ten
   at 3.
2. **The copyright-bearing response wording is not reproduced.** Fairbank's six statements per section are
   copyrighted; this tile implements the *scoring* only, presenting each section as a generic 0–5 severity
   rating. The section topics (pain intensity, personal care, …) are factual labels, not the copyrighted text.

Bands use Fairbank's original percentage grades; the boundaries are consistent across every source, and only
the top two labels ("crippled"; "bed-bound / exaggerating") are softened by some references.

## Scope (spec-v11 §5.3)

A patient-reported disability measure, not a diagnosis. The clinical decision stays with the clinician.

## Files

- `lib/oswestry-v643.js` — `oswestryDisabilityIndex()`, `ODI_SECTIONS`, `ODI_NOTE`.
- `views/group-v643.js` (RV643) — ten 0–5 selects with a "not answered" option; a11y-checked, no innerHTML.
- `mcp/adapters/oswestry-v643.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/oswestry.test.js` — 6 tests (example, bands, boundary, variable denominator, rounding, invalid).
- `docs/spec-v643.md` (this file).

## Sourcing (spec-v97)

Fairbank JC, Pynsent PB. The Oswestry Disability Index. *Spine.* 2000;25(22):2940-2952 (PMID 11074683;
original Fairbank JC, et al. *Physiotherapy.* 1980;66(8):271-273). The ten-section structure, the
variable-denominator formula, and the five percentage grades were confirmed across multiple authoritative
clinical references; the percentage boundaries are consistent across every source checked.
