# v12 audit - house-brackmann

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: House JW, Brackmann DE. Facial nerve grading system. Otolaryngol Head Neck Surg. 1985;93(2):146-147.

`lib/neuro-v95.js houseBrackmann()` maps a single 6-grade ordinal selector (I-VI) to the source's per-grade gross / at-rest / motion descriptor.

## Boundary worked examples added
- grade I (normal) and grade VI (total paralysis) endpoints.
- grade III (moderate dysfunction) midpoint.

## Cross-implementation differential
- Reference: House-Brackmann 1985 six-grade descriptors. Match. PASS.

## Edge-input handling notes
- A grade outside 1-6 or a blank returns a surfaced valid:false guard. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- One labeled <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the grade only.

## Defects opened
- none

## Status
- PASS
