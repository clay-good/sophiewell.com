# v12 audit - haps

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Lankisch PG, Weber-Dany B, Hebel K, et al. Clin Gastroenterol Hepatol. 2009;7(6):702-705 (re-fetched; thresholds and the strict-< direction cross-read across MDCalc, PMC9840061, and the meta-analysis PubMed 34629293).

`lib/gi-v126.js haps()` is a three-criterion gate: no rebound/guarding, hematocrit
normal (< 43 men / < 39.6 women), and creatinine < 2 mg/dL. All three normal predicts
a harmless (non-severe) course (specificity ~97%, PPV ~98%); any abnormal does not
rule severity in. Class A (journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- all normal -> harmless.
- peritonitis present -> not harmless (names the failing criterion).
- strict < thresholds: Hct 43 (male) abnormal, 42.9 normal.
- female Hct threshold 39.6.
- creatinine >= 2 abnormal; missing labs -> valid:false.

## Cross-implementation differential
- Reference: thresholds 43 / 39.6 / 2 mg/dL confirmed; the cutoff value itself counts
  as abnormal (strict <), per the published convention; the ~98% figure is
  specificity/PPV (not NPV) and HAPS is a binary gate, not a points-sum -- both honored
  in the wording. Match. PASS.

## Edge-input handling notes
- One peritonitis checkbox + sex + Hct + creatinine; Hct and creatinine required and
  positive. A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Two labeled checkboxes + two labeled number inputs; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
