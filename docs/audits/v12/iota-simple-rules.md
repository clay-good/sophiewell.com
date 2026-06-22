# v12 audit - iota-simple-rules

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Timmerman D, Testa AC, Bourne T, et al. Simple ultrasound-based rules for the diagnosis of ovarian cancer. Ultrasound Obstet Gynecol. 2008;31(6):681-690 (re-fetched; the five B and five M descriptors and the benign/malignant/inconclusive rule cross-read across the primary record and >= 2 independent IOTA reproductions).

`lib/gyn-v139.js iotaSimpleRules()` counts the five B (benign) and five M
(malignant) descriptors and returns benign (>= 1 B and no M), malignant (>= 1 M
and no B), or inconclusive (both or neither). Class A. Free substitute for the
excluded IOTA ADNEX model (spec-v100 §8).

## Source-governance notes
- B-features: B1 unilocular, B2 solid component < 7 mm, B3 acoustic shadows, B4
  smooth multilocular < 100 mm, B5 no flow (color score 1).
- M-features: M1 irregular solid, M2 ascites, M3 >= 4 papillary structures, M4
  irregular multilocular solid >= 100 mm, M5 very strong flow (color score 4).
- The inconclusive verdict explicitly advises a second-stage test / expert review,
  matching the source; it does not force a classification.

## Boundary worked examples added
- B features only -> benign.
- M features only -> malignant.
- one B and one M -> inconclusive (second-stage test advised).
- no features at all -> inconclusive.

## Edge-input handling notes
- Ten checkboxes, no numeric inputs; every combination resolves to one of the
  three verdicts (always valid).

## A11y / keyboard notes
- Ten labeled checkboxes grouped under B and M headings; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
