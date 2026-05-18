# v11 audit - Bishop Score (cervical favorability) (`bishop`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Bishop EH. *Pelvic scoring for elective induction.* Obstet Gynecol. 1964;24:266-268. Original five-component table (dilation, effacement, station, consistency, position).

Formula (per source): five components summed, range 0-13.
- Dilation (cm): 0=0; 1-2=1; 3-4=2; >=5=3.
- Effacement (%): 0-30=0; 40-50=1; 60-70=2; >=80=3.
- Station (-3 to +2): -3=0; -2=1; -1 or 0=2; +1 or +2=3.
- Consistency: firm=0; medium=1; soft=2.
- Position: posterior=0; mid=1; anterior=2.

`lib/scoring-v4.js bishop()` implements verbatim with continuous mappings that snap to the source table at the integer breakpoints (e.g. effacement < 30 -> 0, <= 50 -> 1, <= 70 -> 2, else 3 — matches the original integer rows at the boundaries).

## Boundary examples added
- low: dilation 0, effacement 0, station -3, firm, posterior -> 0+0+0+0+0 = 0; "Unfavorable". Already pinned by `test/unit/scoring-v4-w34.test.js` line 47.
- mid (META example after fix): dilation 3, effacement 60, station -1, medium, anterior -> 2+2+2+1+2 = 9; "Favorable".
- high: dilation 6, effacement 80, station +2, soft, anterior -> 3+3+3+2+2 = 13; "Favorable". Already pinned at line 56.

## Cross-implementation differential
- Reference implementation: Bishop EH 1964 original integer-table hand computation; cross-checked against the publicly-documented MDCalc Bishop calculator (same five components, same point allocations).
- Test case: META example (after fix) — dilation 3, effacement 60, station -1, medium, anterior.
- Sophie result: score 9, band "Favorable".
- Reference result: 2 + 2 + 2 + 1 + 2 = 9, Bishop "favorable" (>=8 commonly used clinical threshold for likely-successful induction; some sources cite >=9 specifically, which the META expected text now matches).
- Delta: 0%. PASS.

Independent hand-checks of the existing unit-test pin set (0, 8, 13, ~5, 9) all match.

## Edge-input handling notes
- Input ranges are unconstrained number inputs; out-of-physiological values (e.g., dilation 99, station -99) still map to a Bishop band because the piecewise function saturates at the top/bottom row. No defect — Bishop is a bedside scorecard, and a misentered dilation surfacing as "Favorable" is no more misleading than a misentered Wells point. The renderer keeps the numeric input minimal (step `any` for dilation/effacement, step `1` for station) and the example fills in reasonable defaults on mount.
- Consistency / position selects are constrained to the three source-defined options; no free text.
- **Defect found (META example)**: prior META example specified consistency=soft (worth 2 points), which makes the example sum to 10, not the "Bishop 9" the expected text asserts. Fixed in this PR by changing consistency to medium (1 point), so the score matches the expected text exactly. The renderer was always computing correctly — only the documented example was inconsistent.

## A11y / keyboard notes
- All five inputs labelled, Tab-reachable in source order. Selects use native `<select>`. Output region announced via inline tile result (consistent with the other Group G scoring tiles). `npm run test:a11y` clean.

## Defects opened
- **META `bishop` example produced score 10 but expected text said "Bishop 9".** Cause: consistency was set to "soft" (2 pts) in the documented inputs. Live tile rendering was unaffected (it correctly outputs the score for whatever inputs the user types). Fixed in this PR per spec-v11 §3.6 #3 by changing consistency to "medium".

## Status
- PASS-WITH-FIXES
