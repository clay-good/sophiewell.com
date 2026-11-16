# spec-v1739 — Shares of one whole, and oxygen down its gradient

> Status: **SHIPPED (2026-11-16)**: 2 tools. The catalog stays 2,387.

A finder set every pair of percentage fields in each tool to 80% (160% together) and kept the tools that
answered. Most percentages are independent (sensitivity and specificity, two co-oximetry readings, an ABC
confidence item each), so each row was read by hand.

| Tool | Before | Now |
|---|---|---|
| `shunt-fraction` | a mixed-venous SvO2 of 95 over an arterial SaO2 of 70 gave Qs/Qt 497% | SvO2 <= SaO2, PvO2 <= PaO2 and PaO2 <= the alveolar tension, by `orderFault` |
| `hasford-cml` | blasts 60%, eosinophils 30% and basophils 30% (120% of one differential) graded High risk | the three together may not pass 100% |

`pa-metrics-compare` also took approved and denied rates summing past 100%, but it is an audit tool and
already lists that as a finding ("add to 140%, more than 100%"), which is the right answer for it.

Tests: new cases in `shunt-fraction.test.js` and `heme-staging-v188.test.js`.
