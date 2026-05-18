# v11 audit - GRACE Score (in-hospital mortality) (`grace`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Granger CB, Goldberg RJ, Dabbous OH, et al. *Predictors of hospital mortality in the global registry of acute coronary events.* Arch Intern Med. 2003;163(19):2345-2353.

Eight predictors with banded point values: age (0-100), heart rate (0-46), SBP (0-58), serum creatinine (1-28), Killip class I-IV (0-59), cardiac arrest at admission (39), ST-segment deviation (28), elevated cardiac enzymes (14). Total range ~0-372. In-hospital mortality bands per Granger 2003: Low <= 108 (<1%), Intermediate 109-140 (1-3%), High > 140 (>3%). `lib/scoring-v4.js grace()` implements every banded point assignment verbatim.

## Boundary examples added
- low: age 25, HR 60, SBP 150, Cr 0.9, Killip I, no arrest/ST/enzymes -> 0 + 0 + 24 + 4 + 0 = 28 (Low; <1% in-hospital mortality per Granger 2003).
- mid: META example (age 70, HR 95, SBP 115, Cr 1.2, Killip I) -> 75 + 9 + 43 + 7 + 0 = 134 (Intermediate; 1-3%).
- high: age 90, HR 160, SBP 75, Cr 4.5, Killip IV, cardiac arrest + ST + enzymes -> 100 + 38 + 58 + 28 + 59 + 39 + 28 + 14 = 364 (High; >3%).

## Cross-implementation differential
- Reference implementation: Granger 2003 Arch Intern Med Table 1 (banded point values).
- Test case: META example.
- Sophie result: 134, "Intermediate (1-3%)".
- Reference result: 134, intermediate band (109-140 per Granger 2003 § Results).
- Delta: 0 ordinal-band categories; raw point total matches hand calc. PASS.

## Edge-input handling notes
- Numeric inputs (age, HR, SBP, Cr) pass through the banded `if`-cascade; out-of-physiologic-range values bucket into the extreme band rather than throwing. Acceptable per source.
- Killip class is a 1-4 select; out-of-range yields 0 points via the `[0, 0, 20, 39, 59][killipClass] || 0` lookup, which is safe.
- The "simplified-points implementation" advisory in `META.grace.citation` explicitly anchors this to the Granger 2003 derivation, not the post-2006 nomogram or the GRACE 2.0 web calculator (which uses logistic regression directly); this is documented to avoid confusion with the online GRACE tool.

## A11y / keyboard notes
- Four number inputs + one select + three checkboxes, label-bound and Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
