# v11 audit - hellp

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Sibai BM. *The HELLP syndrome (hemolysis, elevated liver enzymes, and low platelets): much ado about nothing?* Am J Obstet Gynecol. 1990;162(2):311-316. Three criteria: hemolysis (abnormal peripheral smear AND/OR total bilirubin >=1.2 AND/OR LDH >=600); elevated AST >=70 U/L; low platelets <100 x10^9/L. Complete HELLP if all three; partial HELLP if any subset. Mississippi class per Martin JN Jr, et al. Am J Obstet Gynecol. 1999;180(6):1373-1384 by platelet nadir: class 1 <=50, class 2 50-100, class 3 100-150.

`lib/scoring-v4.js hellp()` counts how many of three criteria are met (each is a clinician-resolved boolean covering the conjoint hemolysis sub-rules, etc.). Mississippi class is computed only when a platelet nadir is supplied; out-of-range nadirs return `mississippiClass: null` rather than coercing a value.

## Boundary examples added
- 0 criteria (tile example) -> no HELLP criteria met.
- 1 criterion (AST >=70 alone) -> partial HELLP.
- 2 criteria (hemolysis + low platelets) -> partial HELLP.
- 3 criteria (complete) -> complete HELLP.
- Platelet nadir 45 -> Mississippi class 1.
- Platelet nadir 75 -> Mississippi class 2.
- Platelet nadir 120 -> Mississippi class 3.
- Platelet nadir 200 -> Mississippi class null (outside class range).
- Platelet nadir blank/undefined -> Mississippi class not surfaced.

## Cross-implementation differential
- Reference: Sibai 1990 / Martin 1999 worked through manually.
- Test case: hemolysis + AST + platelets all met, nadir 40 -> complete HELLP, Mississippi class 1.
- Sophie result: complete HELLP, mississippiClass 1.
- Reference: same. PASS.

## Edge-input handling notes
- Hemolysis is one clinical bit because Sibai 1990 phrases it as AND/OR across smear/bilirubin/LDH; clinician judgment.
- Mississippi class only computed when a numeric nadir is supplied; non-finite -> null.

## A11y / keyboard notes
- Three labeled checkboxes + one numeric input; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
