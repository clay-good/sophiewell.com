# v12 audit - oabss

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Homma Y, Yoshida M, Seki N, et al. Symptom assessment tool for overactive bladder syndrome — overactive bladder symptom score. Urology. 2006;68(2):318-323 (cross-verified against the OABSS internet-survey validation and the eINJ OABSS review; ≥ 2 sources, spec-v97).

`lib/urology-v153.js oabss()` consumes four item scores and computes the 0–15
total with mild/moderate/severe bands and the OAB diagnostic gate. Group G, Class A.

## Source-governance notes
- Items: daytime frequency 0–2 (≤7=0, 8–14=1, ≥15=2), nighttime frequency/nocturia
  0–3, urgency 0–5 (six-point frequency scale), urgency incontinence 0–5 (same
  scale). Total 0–15; bands ≤5 mild, 6–11 moderate, ≥12 severe.
- The OAB diagnostic definition requires the urgency item ≥2 AND total ≥3. The gate
  is surfaced explicitly: a high total driven by frequency alone (urgency <2) is
  flagged as not meeting the symptom definition. The one source that writes the gate
  against "Q2" is a question-renumbering artifact; the gated item is always urgency.

## Boundary worked examples added
- urgency-gate not met (total 6, urgency 1); gate met at urgency 2 / total 3; gate
  not met when urgency 2 but total 2; band boundaries 5/6 and 11/12; max 15 severe;
  blank item → valid:false.

## Edge-input handling notes
- Each item finite-checked and clamped to its range; a blank item surfaces a
  complete-the-fields fallback rather than an undercounted total; covered by the
  spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Four labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
