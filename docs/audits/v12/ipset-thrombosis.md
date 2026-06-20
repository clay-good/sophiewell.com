# v12 audit - ipset-thrombosis

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Barbui T, et al. Blood Cancer J. 2015;5(11):e369. Cross-read against MDCalc and review articles; confirmed the four-tier decision logic and that cardiovascular risk factors do NOT change the category in the revised model.

`lib/heme-v132.js ipsetThrombosis()` maps a finite decision tree over age > 60, prior thrombosis, and JAK2 V617F to one of four risk categories in essential thrombocythemia. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- HIGH = prior thrombosis OR (age > 60 AND JAK2); INTERMEDIATE = age > 60, no JAK2, no history; LOW = JAK2 only; VERY LOW = none of the three.
- Cardiovascular risk factors modulate the annual rate within a tier but do not change the category - confirmed against the source and deliberately excluded from the tier logic.
- Annual thrombosis rates quoted (no CV factors): very low ~0.44%, low ~1.59%, intermediate ~1.44%, high ~2.36-4.17%.

## Boundary worked examples added
- High vs very-low boundary; thrombosis history is high regardless of age/JAK2; JAK2-only = low; age>60-without-JAK2 = intermediate; the full eight-combination tree.

## Edge-input handling notes
- Three explicit yes/no flags; any blank -> valid:false. abnormal = High or Intermediate.

## A11y / keyboard notes
- Three labeled No/Yes selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
