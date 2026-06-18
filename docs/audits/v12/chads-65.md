# v12 audit - chads-65

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Andrade JG, Aguilar M, Atzema C, et al. The 2020 CCS/CHRS Comprehensive Guidelines for the Management of Atrial Fibrillation. Can J Cardiol. 2020;36(12):1847-1948.

`lib/cardio-v101.js chads65()` evaluates the sequential gates: age >= 65 -> oral anticoagulant; else any CHADS2 risk factor -> oral anticoagulant; else coronary or peripheral arterial disease -> antiplatelet; else no antithrombotic. Returns the single verdict and the gate that fired. Class B (CCS AF guideline; docs/citation-staleness.md row).

## Boundary worked examples added
- age 70 -> OAC via the age gate.
- age 50 + hypertension -> OAC via the CHADS2-factor gate (gate flip).
- age 50 + vascular disease -> antiplatelet.
- age 50, no factors -> no antithrombotic.
- fuzz: sequential gates, no arithmetic surface.

## Cross-implementation differential
- Reference: the 2020 CCS age-65 / CHADS2-factor / vascular gate sequence. Match. PASS.

## Edge-input handling notes
- Age clamped to [0,130]; the function returns one verdict and never a half-evaluated pathway; a blank age surfaces valid:false. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
