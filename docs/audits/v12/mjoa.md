# v12 audit - mjoa

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Benzel EC, Lancon J, Kesterson L, Hadden T. Cervical laminectomy and dentate ligament section for cervical spondylotic myelopathy. J Spinal Disord. 1991;4(3):286-295 (18-point mJOA; cross-verified against the Edge Mobility mJOA point text and the PMC8208946 validation; severity bands per Kato/Tetreault; ≥ 2 sources, spec-v97).

`lib/neuro-disability-v159.js mjoa()` sums the four domains to 0–18. Group G,
Class A.

## Source-governance notes
- Motor UE 0–5, motor LE 0–7, sensory UE 0–3, sphincter 0–3; total 0–18.
- HIGHER is BETTER (18 = no dysfunction), the opposite of most scores — surfaced
  explicitly so the renderer never implies a high score is worse.
- Severity: mild ≥ 15, moderate 12–14, severe ≤ 11.

## Boundary worked examples added
- the tile example (13 → moderate); the 11/12 and 14/15 band boundaries; 18 →
  no dysfunction (not abnormal); domain ranges enforced; blanks → valid:false.

## Edge-input handling notes
- Each domain is a bounded integer select; a blank or out-of-range value surfaces
  a complete-the-fields fallback. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Four labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
