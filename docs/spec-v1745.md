# spec-v1745 — Rerunning the finders after spec-v1735 to v1744

> Status: **SHIPPED (2026-11-16)**: 3 tools. The catalog stays 2,387.

The committed finders were rerun after this loop's changes. `probe-impossible-reads-as-absent`,
`probe-impossible-changes-nothing` and `probe-sign-flipped` (absolute-value half) report 0;
`probe-entered-asked-for` and `probe-fraction-rounded` match their recorded baselines. `probe-impossible-as-zero`
listed 31 fields; 23 are range sliders (Aldrete, PADSS, PASS, pediatric GCS), which cannot produce the value.

| Tool | Before | Now |
|---|---|---|
| `ascvd`, `prevent` | an HDL of -40 or 0 (the pooled equations take its log) answered "High (>=20%)" | HDL and total cholesterol must be above 0 |
| `abi` | a pressure below 20 mmHg, or negative, was read as not entered and the reading said "was not entered" of a value that was | refused below 20 mmHg, the adapter's own floor (spec-v1729) and `BOUNDS.sbp`'s |

Judged correct and left: `cluster-headache-ichd3` and `migraine-ichd3` (an absurd duration really fails the
15-180 minute and 4-72 hour criteria), `du-bois-ipf` (a huge FVC rise really is not a decline), `pk-suite`'s
dosing interval above its own cap and `o2-cylinder-duration`'s adapter clamp (both behind their adapter's
validator, and the page refuses).

Tests: new cases in `cv-risk-sbp-envelope.test.js` and `abi.test.js`.
