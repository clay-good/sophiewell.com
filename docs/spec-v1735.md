# spec-v1735 — Sourced envelopes for ESR, 6-minute walk distance and hCG

> Status: **SHIPPED (2026-11-16)**: three new `lib/bounds.js` entries, applied to 9 tools. The catalog stays 2,387.

Three more of spec-v1731's unbounded quantities, each with a recorded or arithmetic extreme.

| Key | Range | Source |
|---|---|---|
| `esr` | 0 to 200 mm/h | the Westergren tube (the ICSH reference method) is graduated 0 to 200 mm; ASDAS and the SEA pathway already enforced it |
| `sixMinuteWalkM` | 0 to 2,000 m | the test is walked (ATS 2002); the 20 km race-walk world record (1:16:36) covers about 1,570 m in six minutes; COMPERA 2.0 already enforced 2,000 |
| `hcg` | 0 to 10,000,000 mIU/mL (= IU/L) | a partial mole reached 1,861,011 IU/L (Keles et al, Haydarpasa Numune Med J 2022;62(4):454-457, doi 10.14744/hnhj.2021.23865); complete moles can run higher, so the ceiling is five times that |

## Applied

| Quantity | Tools | What an impossible value did before |
|---|---|---|
| ESR | `das28`, `pcdai`, `truelove-witts`, `kawasaki-criteria` | DAS28 12.51 "high activity"; PCDAI's top ESR points; met Truelove's systemic criterion and Kawasaki's ESR >= 40 gate |
| 6-minute walk | `bode-index`, `reveal-lite-2` | the best (lowest-risk) walk points |
| hCG | `igcccg`, `barnhart-hcg`, `figo-gtn` | "poor prognosis", a 4,999,900% rise, WHO/FIGO 23 (their own ceilings were 1e8 and 1e9) |

`icm-pji-2018` and `kocher-criteria` take ESR as a yes/no criterion, and `asdas`, `sea-guideline`, `compera-2`
already refused, so they are unchanged. A 0 ESR and a 0 hCG still answer (both are real results).

Tests: `test/unit/bounds-sourced-v1735.test.js` (each tool: the example answers, an impossible value is refused,
a high real value answers; Kawasaki's incomplete branch driven directly).

Still open from spec-v1731: the other quantities in its table (FEV1 % predicted, CA-125/HE4, fasting insulin,
HDL, waist, and the rest). HDL was searched here: CETP-deficiency reports give group means near 160 mg/dL and
name no single highest value, so it is left out.
