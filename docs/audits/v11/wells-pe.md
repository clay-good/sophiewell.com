# v11 audit - Wells Score for PE (`wells-pe`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wells PS, Anderson DR, Rodger M, et al. *Derivation of a simple clinical model to categorise patients probability of pulmonary embolism: increasing the models utility with the SimpliRED D-dimer.* Thromb Haemost. 2000;83(3):416-420.

Seven criteria with non-uniform weights per Wells 2000 Table 2: clinical signs of DVT 3.0, alternative diagnosis less likely than PE 3.0, HR > 100 = 1.5, immobilization or surgery in past 4 wk = 1.5, prior DVT/PE 1.5, hemoptysis 1.0, malignancy 1.0. Three-tier bands: Low <= 1.5 (1.3% PE prevalence), Moderate 2-6 (16.2%), High >= 7 (40.6%) per Wells 2000 Table 4. Two-tier dichotomized cutoff: PE-likely > 4, PE-unlikely <= 4 per Wells 2001 follow-up (Ann Intern Med 2001;135(2):98-107). `lib/clinical.js wellsPe()` implements the seven-criterion sum (`WELLS_PE_ITEMS` map) with three-tier band thresholds: < 2 Low, 2-6 Moderate, > 6 High. (A second `wellsPe()` lives under `lib/scoring-v4.js` for the companion `wells-pe-geneva` tile; that copy uses the same seven criteria with band cutoffs 0-1.5 / 2-6 / >= 6.5, which produce identical bands for every half-integer total reachable from the source's 1.0 / 1.5 / 3.0 weights.)

## Boundary examples added
- low: no criteria positive -> 0 (Low; 1.3% PE prevalence per Wells 2000 Table 4).
- mid: hr100 + immobilization + hemoptysis -> 1.5 + 1.5 + 1 = 4.0 (Moderate; 16.2%); also PE-unlikely by the 4-point dichotomized cutoff.
- high: dvtSigns + alternativeDxLessLikely + priorVte -> 3 + 3 + 1.5 = 7.5 (High; 40.6%).

Band-edge: total 1.5 (single 1.5-point criterion) -> top of Low; total 6.5 (dvtSigns + alternativeDxLessLikely + hr100/immob/priorVte) -> bottom of High per implementation.

## Cross-implementation differential
- Reference implementation: Wells 2000 Thromb Haemost Table 2 + Table 4.
- Test case: dvtSigns + alternativeDxLessLikely + priorVte.
- Sophie result: 7.5, "High (40.6%)".
- Reference result: 7.5, High (>= 7 band, 40.6% PE prevalence per Wells 2000 Table 4).
- Delta: 0%. PASS.

## Edge-input handling notes
- Seven checkboxes; nothing to validate. The "clinical signs of DVT" and "alternative diagnosis less likely" criteria each carry 3.0 points and are by design the highest-impact items; their labels include the source phrasing to discourage misuse as generic "DVT suspected".
- Wells 2000 explicitly separates from the dichotomized (>4 / <= 4) framing used in Wells 2001 and the modern PERC/age-adjusted-D-dimer pathway; this tile is the original three-tier model. The companion `wells-pe-geneva` tile is the place to inspect Wells dichotomized + Geneva side-by-side.

## A11y / keyboard notes
- Seven labeled checkboxes, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
