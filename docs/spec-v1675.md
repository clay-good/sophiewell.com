# spec-v1675 — Independent review of the v711 to v958 tools, second part

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1674](spec-v1674.md).

Nine more defects from the same review.

| Tool | Input | Was | Now |
|---|---|---|---|
| `ausdrisk` | a total of 12 | "intermediate" (tiers 6-14 and 15 or more) | high risk: the form prints "5 or less: Low risk; 6-11: Intermediate risk; 12 or more: High risk" (Diabetes Australia, ausdrisk-tool.pdf, read October 20, 2026) |
| `cuff-leak` | inspired " " (a space); inspired 0; leak 109.96 mL | read as 0; "null percent"; rounded to 110, "not a small leak" | blank; refused; under 110 and printed 109.96 |
| `dka-resolution` | glucose " " or 0 | read as 0 and "resolved" | blank; 0 refused |
| `vexus` | dilated IVC, a waveform blank; IVC 25 cm | the blank read as normal; accepted | "Grade N or higher" with the territory named; refused above 6 cm |
| `kings-college-nonapap` | bilirubin 300 micromol/L; interval -2 days; factors not entered | counted above 300 (converted to 17.54 mg/dL first); accepted; "Does not meet" | compared in the unit entered; refused; "Not met from what is entered" while blanks could still make three |
| `home-oxygen` | PaO2 55.5 mmHg, SpO2 89.5% | "Does not qualify" (fell between 55 and 56, 89 and 90) | the group II range, above the qualifying line and below 60 mmHg or 90% |
| `sbp-ascitic-fluid` | 499 cells, 50.1% PMN | 249.999 rounded to 250: treated as SBP | under 250, printed 249.999 |
| `pef-zones` | 399.8 of 500 | 79.96 rounded to 80.0: green | yellow, printed 79.96 |
| `vitamin-d-level` | 49.9 nmol/L | 19.985 ng/mL rounded to 20.0: not deficient by the Endocrine Society | deficient, printed 19.98 |

## Proof

`test/unit/review-fixes-v711-v958.test.js`; `test/unit/vexus.test.js` and `test/unit/ausdrisk.test.js` updated, each change commented.
