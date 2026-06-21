# v12 audit - covid-gram

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Liang W, Liang H, Ou L, et al. Development and validation of a clinical risk score to predict the occurrence of critical illness in hospitalized patients with COVID-19. JAMA Intern Med. 2020;180(8):1081-1089.

`lib/id-v137.js covidGram()` returns the logistic probability of critical illness. Class A (fixed published model; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / coefficient note
- The paper publishes ODDS RATIOS (Table 3), not regression coefficients. Each beta here is therefore derived as ln(OR) - a deterministic transform, transparently disclosed, NOT a recalled coefficient. Betas: Xray 1.2208, age 0.02956/yr, hemoptysis 1.5107, dyspnea 0.6313, unconscious 1.5497, comorbidities 0.4700/each, cancer 1.4036, NLR 0.05827/unit, LDH 0.0019980/(U/L), direct bilirubin 0.13976/(umol/L).
- The intercept is ln of the paper's constant OR 0.001 = -6.9078; the constant is reported to one significant figure, so the ABSOLUTE probability carries calibration uncertainty - the tile says so.
- The authors DELIBERATELY defined no low/medium/high cut-points (verbatim). NONE is invented here (source over the spec-v137 §2.2 draft, which said "mapped to the low/medium/high risk tiers").

## Robustness note
- Logistic exponent clamped to [-40, 40] before 1/(1+e^-x), so an extreme fuzzed predictor returns a probability in [0, 1], never Infinity. Explicitly fuzzed for overflow.

## Boundary worked examples added
- worked ~1.9% low-risk profile; monotonic rise on adding the chest-imaging term; unconsciousness (largest binary OR) raises probability more than dyspnea (smallest); [0,100] bound under extreme inputs; comorbidity count 0 still valid.

## Edge-input handling notes
- Requires the five yes/no findings answered and age/comorbidities/NLR/LDH/DB entered; blank surfaces valid:false (never scores a blank as 0). Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Labeled selects + number inputs; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note and the approximate-probability caveat.

## Defects opened
- none
