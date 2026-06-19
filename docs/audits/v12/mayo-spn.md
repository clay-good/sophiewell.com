# v12 audit - mayo-spn

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Swensen SJ, Silverstein MD, Ilstrup DM, Schleck CD, Edell ES. The probability of malignancy in solitary pulmonary nodules. Arch Intern Med. 1997;157(8):849-855 (re-fetched; cross-read with MDCalc calc/4057, the Cui et al Transl Lung Cancer Res appendix, and PubMed PMID 9129544).

`lib/pulmnod-v115.js mayoSpn()` computes the Mayo Clinic logistic malignancy
probability for an incidental solitary pulmonary nodule: x = -6.8272 +
0.0391*age + 0.7917*smoke + 1.3388*cancer + 0.1274*diameter + 1.0407*spiculation
+ 0.7838*upperlobe, probability = e^x/(1+e^x). The pretest framing reads < 5%
low, 5-65% intermediate, > 65% high. Class A.

## Boundary worked examples added
- age 51, smoker, 12 mm, spiculated, upper lobe -> 33.4% (intermediate).
- low anchor: age 45, no risk factors, 6 mm smooth -> 1.3% (low).
- high anchor: age 70, smoker, prior cancer, 30 mm, spiculated, upper -> > 65%.
- partial inputs render a complete-the-fields fallback.
- an extreme diameter is clamp-guarded (no NaN/Infinity, probability <= 100%).

## Cross-implementation differential
- Reference: all seven coefficients were re-fetched and confirmed identical to
  the spec draft and to the peer-reviewed TLCR appendix. One outlier source
  (rdrr.io/cran/cliot) reported age 0.0739 / diameter 0.1957 -- rejected as
  transcription artifacts; three independent sources confirm 0.0391 / 0.1274.
  Match. PASS.

## Edge-input handling notes
- age and diameter are required numbers; the four remaining items are booleans.
  x is clamped to [-40, 40] before the logistic so a fuzzed extreme cannot
  overflow e^x. A scalar fuzz arg yields a valid:false fallback.

## A11y / keyboard notes
- Two labeled number inputs + four labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
