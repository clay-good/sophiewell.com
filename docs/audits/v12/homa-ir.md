# v12 audit - homa-ir

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Matthews DR, Hosker JP, Rudenski AS, et al. Homeostasis model assessment: insulin resistance and beta-cell function from fasting plasma glucose and insulin concentrations in man. Diabetologia. 1985;28(7):412-419.

`lib/endo-v136.js homaIr()` returns the HOMA-IR value and the linear HOMA-%B beta-cell estimate. Class A (fixed published formula; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / formula note
- HOMA-IR = (fasting insulin uU/mL x fasting glucose) / 405 (mg/dL) or / 22.5 (mmol/L); 405 = 22.5 x 18.
- Linear HOMA-%B = (20 x insulin) / (glucose mmol/L - 3.5), reported as a percent only when glucose > 3.5 mmol/L (else the denominator is <= 0 -> N/A).
- No universal diagnostic cut-point; higher = greater insulin resistance (reported as framing). The proprietary nonlinear HOMA2 model is a separate tool, excluded (spec-v100 §8).

## Boundary worked examples added
- insulin 12 / glucose 100 mg/dL -> HOMA-IR 2.96, HOMA-%B 116.8%; the mg/dL <-> mmol/L equivalence (100 mg/dL = 5.5556 mmol/L gives the same value); the %B domain guard at glucose <= 3.5 mmol/L.

## Edge-input handling notes
- Requires insulin > 0 and glucose > 0; zero/negative/blank surfaces valid:false (no product/divide leak). Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Two labeled number inputs + a glucose-unit select; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
