# v11 audit - Centor / McIsaac Strep Pharyngitis Score (`centor`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. The diagnosis of strep throat in adults in the emergency room. Med Decis Making. 1981;1(3):239-246. McIsaac age modifier: McIsaac WJ, White D, Tannenbaum D, Low DE. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ. 1998;158(1):75-83. Four Centor criteria (tonsillar exudate, tender anterior cervical adenopathy, history of fever, absence of cough) each = 1 point; McIsaac adds +1 if age 3-14 and -1 if age >=45.

## Boundary examples added
- Low edge: all four criteria absent, age 30 -> Centor 0, McIsaac 0, "Low: no testing/abx" band. PASS.
- High edge: all four criteria present, age 12 -> Centor 4, McIsaac 5 (4 + age modifier +1), "High" band. PASS (matches META example expected).
- Mid: exudate + adenopathy + fever, no cough loss, age 60 -> Centor 3, McIsaac 2 (3 - 1), "Moderate: rapid antigen" band. PASS.
- Age-boundary: age 45 -> McIsaac -1 modifier triggers (>=45 per McIsaac 1998). PASS.

## Cross-implementation differential
- MDCalc Centor/McIsaac calculator (independent implementation): same inputs as the META example yield Centor 4 / McIsaac 5. Sophie matches exactly. Delta 0/0 PASS.
- Cross-checked the age-modifier thresholds (3-14 = +1; 45+ = -1) against the McIsaac 1998 paper Table 2.

## Edge-input handling notes
- Age input is numeric; non-numeric / negative values are rejected by `num()`.
- McIsaac modifier band labels (-1..1 = Low, 2..3 = Moderate, 4..5 = High) match McIsaac 1998 management bands.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Checkbox inputs labelled; age numeric input labelled; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
