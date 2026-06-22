# v12 audit - popq-staging

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Bump RC, Mattiasson A, Bø K, et al. The standardization of terminology of female pelvic organ prolapse and pelvic floor dysfunction. Am J Obstet Gynecol. 1996;175(1):10-17 (re-fetched; the nine-point system and the stage 0-IV leading-edge rule cross-read across the primary record and >= 2 independent POP-Q reproductions).

`lib/gyn-v139.js popqStaging()` takes the prolapse points (Aa, Ba, C, D optional,
Ap, Bp), the total vaginal length, and the optional GH/PB, derives the leading
edge as the most positive measured point, and stages it: 0 (no descent), I (< -1),
II (-1 to +1), III (> +1 but < +(TVL-2)), IV (>= +(TVL-2)). Class A. The catalog
vocab has no urogynecology term; obstetrics-gynecology is used (flagged in the
spec).

## Source-governance notes
- Point D is optional (absent after hysterectomy); the leading edge and stage-0
  check both tolerate a missing D.
- Stage 0 requires Aa=Ba=Ap=Bp=-3 AND C (and D when present) <= -(TVL-2), per the
  source; a single descended point drops it out of stage 0 into stage I-IV by the
  leading edge.
- GH and PB are recorded for completeness but do not enter the stage computation.

## Boundary worked examples added
- Aa -1, Ba -1, C -5, Ap/Bp -3, D -6, TVL 9 -> leading edge -1, stage II.
- Aa 2, Ba 3, C -2, Ap/Bp -3, D -5, TVL 9 -> leading edge +3 at Ba, stage III.
- Aa=Ba=Ap=Bp -3, C -8, D -9, TVL 9 -> stage 0 (no prolapse).
- Aa 3, Ba 8, C 7, Ap 2, Bp 3, D 6, TVL 9 -> stage IV.
- a missing point or TVL -> valid:false; D omitted still stages.

## Edge-input handling notes
- Signed numeric points (negative above the hymen); the five non-D points and TVL
  are required, D/GH/PB optional. A blank required field surfaces a
  complete-the-fields fallback.

## A11y / keyboard notes
- Nine labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
