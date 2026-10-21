# spec-v1681 — Independent review of the pre-v300 multi-calculator libs

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1680](spec-v1680.md).

A reviewer swept the older libs (`lib/*-v5.js` to `lib/*-v294.js`, many holding several calculators) through the
agent compute path. Source thresholds were checked against the tools' own printed bands.

| Tool | Input | Was | Now |
|---|---|---|---|
| `rifle-aki` | baseline creatinine only, no urine-output class | "RIFLE: no criteria met" | asks for the current creatinine (AKIN already did) |
| `pospom` | age 95.5; 25.5 | 0 age points (between integer rows): 0.116% against 9.763% at 95 | completed years |
| `cpis-vap` | temperature 38.45 | 2 points, enough to read as VAP | 1 point: half-open rows |
| `heparin-nomogram` | aPTT exactly 35 | the "<35 s" row, 80 u/kg rebolus | the 35-45 row, 40 u/kg |
| `sipa` | age 6.5; SI 1.224 | "outside the validated range"; "SI 1.22 > 1.22" | completed years; 1.224 |
| `albi-grade`, `palbi`, `forns-index`, `lok-index`, `clichy`, `cardiac-power-output`, `ufr-dialysis`, `transfusion-threshold`, `digoxin`, `gold-spirometry`, `iv-osmolarity`, `corrected-phenytoin` | values a hair across their cut | judged right, printed rounded onto the other side ("Hgb 7 is below 7"; "900 mOsm/L, below 900") | printed at the digits that keep the judged side |
| `lv-mass-index` | RWT 0.423 | rounded to 0.42 first: "eccentric hypertrophy" | concentric: classified on the unrounded RWT and LVMI |
| `ivc-fluid-responsiveness`, `ppv-svv` | minimum above maximum; PPV 12.96% | a negative index read as "not responsive"; rounded to 13.0 and called responsive | refused; judged unrounded |
| `papi` | PA systolic below diastolic | "PAPi -1, severe RV dysfunction" | refused |
| `vanc-auc` | levels 0.01 h apart | an AUC of 10^49 | refused: at least 1 hour between peak and trough |

`lib/cut-display.js` no longer returns Infinity for a value too large to scale.

## Proof

`test/unit/review-fixes-pre-v300.test.js`.
