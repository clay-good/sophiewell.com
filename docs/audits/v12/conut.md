# v12 audit - conut

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Ignacio de Ulibarri J, Gonzalez-Madrono A, de Villar NGP, et al. CONUT: a tool for controlling nutritional status. Nutr Hosp. 2005;20(1):38-45. The per-analyte point cut-points and the four bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js conut()` maps albumin, cholesterol, and lymphocytes to 0-12. Group E, Class A.

## Source-governance notes
- albumin(g/dL) >=3.5:0 / 3.0-3.49:2 / 2.5-2.99:4 / <2.5:6; cholesterol(mg/dL) >=180:0 / 140-179:1 / 100-139:2 / <100:3; lymphocytes(/mm^3) >=1600:0 / 1200-1599:1 / 800-1199:2 / <800:3. Total 0-12; bands 0-1 / 2-4 / 5-8 / 9-12. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- worked example (alb 3.2, chol 150, lymph 1000 -> 5 moderate); all-normal 0; all-worst 12 severe; albumin point edge (3.5 vs 3.49); blanks -> valid:false.

## Edge-input handling notes
- Three inputs positive-finite; otherwise valid:false; never NaN (spec-v59 fuzz pass).
