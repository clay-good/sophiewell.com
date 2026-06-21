# v12 audit - metabolic-syndrome

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Alberti KGMM, Eckel RH, Grundy SM, et al. Harmonizing the metabolic syndrome: a joint interim statement. Circulation. 2009;120(16):1640-1645; and the IDF 2006 definition.

`lib/endo-v136.js metabolicSyndrome()` returns the metabolic-syndrome verdict under the chosen definition, naming which criteria were met. Class B (revisable consensus definition -> docs/citation-staleness.md row, documentation only; "IDF" is not in the check-citations issuer acronym set, which carries IDSA).

## Source-governance / criteria note
- Five criteria, all thresholds cross-verified across >= 2 sources: waist (sex/population cut-point - US/ATP III M 102/F 88 cm, IDF Europid M 94/F 80, Asian M 90/F 80); TG >= 150 mg/dL or treated; HDL < 40 (M)/< 50 (F) mg/dL or treated; SBP >= 130 and/or DBP >= 85 mmHg or treated; glucose >= 100 mg/dL or treated.
- Harmonized = ANY 3 of 5 (waist not mandatory); IDF = central obesity REQUIRED + any 2 of the other 4. Every IDF-positive patient is also Harmonized-positive, but not vice-versa.
- Inequality directions: TG/BP/glucose use >=; HDL uses strict < (exactly 40/50 is not "reduced").

## Boundary worked examples added
- Exactly 3 of 5 (waist 104 / TG 160 / glucose 105) -> present; drop the waist criterion -> 2 of 5 -> absent (Harmonized); the IDF central-obesity-required gate (2 other criteria without waist -> absent); the sex-specific HDL cut-point (45 mg/dL reduced for women, not men); the IDF Europid waist cut-point lower than US; the treatment overrides counting a criterion below threshold.

## Edge-input handling notes
- Definition / sex / waist standard and all six numeric values are required; the four "on treatment" toggles are optional (blank = no). Missing required input surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Labeled selects (definition, sex, waist standard, four treatment toggles) + six number inputs; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
