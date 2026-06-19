# v12 audit - ahi-odi-severity

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: American Academy of Sleep Medicine Task Force. Sleep. 1999;22(5):667-689 (re-fetched; cross-read with the AASM hypopnea-scoring clarification page, the AASM "Summary of Updates in v2.0" (2012), the AAST AHI overview, and the Sleep Foundation AHI page).

`lib/pulm-v114.js ahiOdiSeverity()` bands the apnea-hypopnea index as normal < 5,
mild 5 to < 15, moderate 15 to < 30, severe >= 30 events/hour, shows the oxygen
desaturation index alongside, and states the 3%-vs-4% desaturation criterion. A
negative or non-finite AHI is guarded with a surfaced fallback. Class B (the AASM
scoring criteria are revisable -- docs/citation-staleness.md row).

## Boundary worked examples added
- AHI 22 -> moderate.
- half-open band boundaries: 5 mild, 15 moderate, 30 severe (4.9 normal, 14.9
  mild, 29.9 moderate).
- ODI shown alongside with the desaturation criterion (default 3%, selectable 4%).
- a negative AHI is guarded with a surfaced fallback.
- a missing AHI returns a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the 1999 AASM "Chicago Criteria" severity bands (< 5 / 5-15 / 15-30
  / >= 30) are the reference OSA classification, confirmed across the AAST
  overview and the Sleep Foundation. The 3%-or-arousal recommended hypopnea rule
  (AASM v2.0, 2012) scores more events than the 4% acceptable rule (still required
  by CMS), so the same patient can cross a severity band by which rule is applied;
  the tile surfaces the chosen criterion rather than presuming one. Bands are
  half-open: 5, 15, and 30 fall in the higher band. Match. PASS.

## Edge-input handling notes
- AHI required; a missing AHI returns the complete-the-fields fallback and a
  negative AHI returns a guarded fallback (clamped before band lookup, spec-v114
  §3). ODI is optional and only shown when >= 0. Fuzz scalar args (NaN, Infinity,
  negative) hit the fallback safely with no non-finite leak.

## A11y / keyboard notes
- Two labeled number inputs + one labeled select; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
