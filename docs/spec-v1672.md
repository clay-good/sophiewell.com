# spec-v1672 — Independent review of the spec-v1400 to v1499 tools

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1671](spec-v1671.md).

Two reviewers ran the 79 libs in `lib/*-v14xx.js` on edge inputs. Sixteen defects are fixed.

| Tool | Input | Was | Now |
|---|---|---|---|
| `syphilis-serology-sequence` (traditional) | nontreponemal "not done", treponemal reactive | "both reactive ... treat for the stage" | asked for: the nontreponemal test comes first |
| `powers-ratio` | 9.97 / 10 mm on a radiograph | rounded to 1.00: "consistent with anterior atlanto-occipital dissociation" | 0.997, below 1.0, normal by Rojas's limit; float noise removed so 8.1 / 9 is still exactly 0.9 |
| `hvpg` | 20.04, 9.96, 5.04 mmHg | rounded before Baveno VII's > 20, ≥ 10 and > 5 (pre-emptive TIPS note lost; 9.96 called CSPH) | decided unrounded, printed with the digits that say so |
| `mrecist` | +19.96% from nadir; −29.97% from baseline | progressive disease; partial response | stable disease in both |
| `cgm-time-in-range` | 3.95% below 70 mg/dL | "4% against a target below 4%", unmet | met |
| `glycemia-risk-index` | GRI 20.04 | "GRI 20 (zone B)" | 20.04 |
| `dean-fluorosis-cfi` | CFI 0.601 | "0.60 ... slight", with a note that 0.6 is read into the lower band | 0.601, slight, no false endpoint note |
| `periodontitis-stage-grade` | bone loss / age 0.249; attachment loss 2.5 mm | "0.25" beside grade A; 2.5 mm read as stage I silently | 0.249; the gap between 2 and 3 mm is named |
| `msu-disc-herniation` | 50.4% of the distance | "reaches 50%" beside size 2 | 50.4% |
| `hypoglycemia-level` | 53.6 mg/dL | "54 mg/dL ... below 54" | 53.6 |
| `uterine-activity` | 4 × 50.1 mmHg | "200 ... not above the 200" | 200.4, above |
| `cpak` | aHKA 2.04°; JLO 176.98° | neutral; neutral | valgus (type III); apex distal |
| `blood-4h-window` | 239.8 minutes elapsed | "at least 90001 mL/h ... in the 0 min left" | the window is effectively over |
| `strongyloides-presumptive` | no contraindication entered | "no contraindication: give ivermectin", though hypersensitivity is never asked | names the hypersensitivity check as not asked |
| `hbv-serology` | IgM anti-HBc positive, total anti-HBc negative | "a recent infection in which HBsAg has already cleared" | refused: IgM is part of total anti-HBc, so the results disagree |

Not changed: `ukeld` and `ohi-s` round before comparing because their sources define rounded scores.

## Proof

`test/unit/review-fixes-v1400-v1499.test.js`; one older `powers-ratio` test that read the threshold at two decimals is
rewritten for the measured ratio.
