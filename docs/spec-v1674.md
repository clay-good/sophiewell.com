# spec-v1674 — Independent review of the v800 to v907 tools, first part

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1673](spec-v1673.md).

Reviewers ran the endocrine, cardiology, headache and transplant libs in `lib/*-v800.js` to `lib/*-v907.js` on edge
inputs. Eight defects are fixed here; the rest of that review follows in the next spec.

| Tool | Input | Was | Now |
|---|---|---|---|
| `four-ts-hit` | an empty form | every blank domain scored 0: "low probability, do not test" | every domain is asked for; the ASH guidance says missing information should push the score up |
| `acromegaly-biochem` | IGF-1 0.9 x ULN, random GH 0.5, OGTT nadir 2 | "excluded" (the random GH won over the unsuppressed nadir) | discordant, further evaluation needed |
| `ghent-marfan` | family history, aortic Z 2.5, age blank | met by the adult Z 2 cut | asks for the age: under 20 the cut is Z 3 |
| `diabetes-diagnosis` | an A1C of 7% with a confounder, nothing else | "below the diagnostic thresholds" | not assessable; with other tests, "among the tests that could be judged" and the set-aside value named |
| `ph-hemodynamics-2022` | wedge 25 over mean PA 20; PVR 2.0004 | a negative resistance read as normal; "2.00, above 2" | refused; printed at the digits that keep it above 2 |
| `hf-ef-classification` | LVEF 40.5% or 49.5% | no category (41 to 49 read as whole numbers only) | HFmrEF: above 40 and below 50 |
| `tension-headache-ichd3` | 14.5 headache days a month | neither frequent nor chronic | frequent episodic: under 15 days |
| `vod-sos` | day 30, bilirubin 2, ascites, ultrasound evidence | EBMT late onset not met (bilirubin left out of the item count) | met: EBMT 2016 late onset counts two of the four classical items, bilirubin among them |

## Proof

`test/unit/review-fixes-v800-v907.test.js`; `test/unit/four-ts-hit.test.js` now scores every domain in its partial cases.
