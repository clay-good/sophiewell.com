# spec-v1764 — Tools' own caps follow the widened envelopes

> Status: **SHIPPED (2026-11-21)**: 23 tools, 56 page fields. The catalog stays 2,387.

spec-v1763 moved 16 envelopes in `lib/bounds.js` past values verified in survivors. Twenty-three tools still refused
those values with a narrower cap of their own, a copy of an older limit:

| Cap | Tools |
|---|---|
| creatinine 40 or 50 mg/dL -> 75 | ABIC, CLIF-C AD, Durie-Salmon, LODS, MELD-Na, MELD 3.0, ADHERE, FIPS, Salazar-Corcoran, FE bicarbonate |
| WBC 500 or 1,000 -> 2,000 x10^3/uL | ANC, CLIF-C AD, AIR score, adult appendicitis score, LODS, absolute eosinophil count; CPIS 200,000 -> 2,000,000 per mm3 |
| platelets 3,000 -> 4,000 x10^3/uL | CCI, Hepamet, Agile 3+, HALP, LODS, PALBI, PLR, SII, Binet, Rai, PIV |
| sodium 200 -> 210 (CLIF-C AD 100-180 -> 85-210) | CLIF-C AD, delta gap, MELD-Na, MELD 3.0 |
| heart rate 350 -> 600, SBP 300 or 350 -> 500 | LODS, OASIS, ADHERE |

Each cap now reads `BOUNDS.<key>` instead of a copy, so it moves with the envelope. Only refusal caps changed: every
scoring rule from a source stays (MELD's creatinine scored at most 4.0 and sodium clamped to 125-137, ADHERE's splits,
points bands), and new tests pin that a creatinine of 60 scores as MELD's 4.0 cap did.

The page's HTML `min`/`max` attributes (which show a "check the highlighted value" note above the answer) held the
old envelope on 56 fields across 32 views; each that equaled its field's old bound now holds the new one.

Tests: `test/unit/own-caps-v1764-a.test.js`, `test/unit/own-caps-v1764-b.test.js`; unit, MCP and e2e tests that
pinned the old caps now pin the new ones.
