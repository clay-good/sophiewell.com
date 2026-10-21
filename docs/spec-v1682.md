# spec-v1682 — Independent review of the core libs and the last unreviewed tools

> Status: **SHIPPED (2026-10-21)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1681](spec-v1681.md).

A reviewer read the unversioned core libs (`clinical.js`, `lab-interpret.js`, `trend.js` and others that compute an
answer) and the three v1570-v1572 tools. With this, every lib range in the catalog has had an independent review.

| Tool | Input | Was | Now |
|---|---|---|---|
| `lab-interpret` | A1C 5.7%; LDL 110; LDL 240, triglycerides 1,200; glucose 110 | "in the diabetes range (6.5% or higher)" (a 5% buffer, not the ADA band); "borderline-high"; mild flags; "elevated" | prediabetes 5.7-6.4; near-optimal 100-129; very high at 190 and 500; impaired fasting glucose 100-125 (ADA, ATP III) |
| `lab-interpret` | potassium -3; male with "pregnant" ticked | "significantly low"; pregnancy hemoglobin range | refused; pregnancy ranges for a female patient only |
| `bmi` | 150 lb at 5 ft 5 in (24.96) | "25 (Normal)", also in the home ask box | 24.96 |
| `pf-ratio` | PaO2 57 on FiO2 0.57 | ratio 100.00000000000001: "Moderate ARDS" | 100: severe |
| `chads` | age 65-74 and 75+ both ticked | 3 points for age, a maximum of 10 | 2; the maximum is 9 |
| `glenoid-track` | interval 24.1 against a 24.07 mm track | distance rounded to 0: "0 mm boundary" | off-track, distance -0.03 mm |
| `thomazeau-occupation` | ratio 0.5997; muscle larger than the fossa | "0.6 (60%), grade II"; 115% graded I | 0.5997 (59.97%); refused |
| `lcd-diagnosis-check` | U07.1, U09.9 | "not an ICD-10-CM code", though the shipped articles list them | accepted |
| `correction-rate`, `tb-testing`, `insulin-drip`, `aortic-stenosis-stage` | a projection of 9.995 against a 10 ceiling; induration -12 mm; glucose -40; SVI -10 | "10, beyond 10"; "negative"; rate 0; low flow | printed on its side; refused |

## Proof

`test/unit/review-fixes-unsuffixed.test.js`; the lab-interpret, derivation and lcd tests updated, each change commented.
