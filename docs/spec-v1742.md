# spec-v1742 — Heart and breathing rates the envelope map hid

> Status: **SHIPPED (2026-11-16)**: 13 tools. The catalog stays 2,387.

spec-v1741 found one blind spot in `scripts/lib/envelope-map.mjs` (units in the label). FGSI's heart rate and
respiratory rate were still missing from its rows, which pointed at a second: the map's exclusion list carried a
bare `rate` term, written for infusion and flow rates, and it dropped every **heart rate**, **respiratory rate**
and **sedimentation rate** field before the envelope match ran.

The term now skips "heart", "respiratory", "breathing", "pulse" and "sedimentation" rates, and ESR (spec-v1735's
envelope) is mapped. Reach went from 910 to 972 fields; the page test now drives 873 fields across 486 tools, all refused.

| Fixed | Field | Before |
|---|---|---|
| `fgsi` | heart rate, respiratory rate | 3,000 bpm scored the top band |
| `smart-cop`, `isaric-4c-mortality`, `rox` | respiratory rate | 800 breaths/min scored or gave a ROX index |
| `geneva-original`, `wells-pe-geneva`, `simplified-revised-geneva` | heart rate | 3,000 bpm scored (simplified Geneva asked for it again as if blank) |
| `reveal-lite-2`, `tash-score`, `rabt-score`, `alt-70`, `shock-index` | heart rate | 3,000 bpm scored or gave a shock index |
| `nichd-fhr` | baseline fetal heart rate | 3,000 bpm was graded "tachycardia" |

Each uses `boundsAdvisory('hr' | 'rr', value)` (10-300 bpm, 3-80 breaths/min) after the tool's own blank check,
in its own refusal shape. `rabt-score` also checks its SBP against the same file's envelope.

The envelope floor also refuses a rate of 0 (below 10 bpm or 3 breaths/min); four spec-v1740 tests that asserted 0
answers now assert a low real rate (40 bpm, 8 breaths/min) does.

Tests: `test/unit/rate-envelopes-v1742.test.js` (the exclusion's own cases, and each tool through the agent
surface: the example answers, ten times the ceiling is refused, a high real rate answers).
