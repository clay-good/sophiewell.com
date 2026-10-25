# spec-v1686 — A reassuring Kyoto gastritis score read as the risk level

> Status: **SHIPPED (2026-10-24)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1685](spec-v1685.md).

An independent review of the v1301–v1569 tools found one defect provable from the tool's own cited source.

| Tool | Input | Was | Now |
|---|---|---|---|
| `kyoto-gastritis` | any score below 4 (e.g. 2 of 8) | the band read "Kyoto score 2 of 8: below 4, the level rated as a risk for gastric cancer" — telling a reader with a reassuring, below-threshold score that it **is** the cancer-risk level | "below 4, below the level rated as a risk for gastric cancer", matching the cited source: "a Kyoto score of 4 or higher is rated as a risk for GC" |

Only the reader-facing `band` string was wrong; the computed flags (`abnormal`, `score`, `bandLabel`) were already
correct, so the structured verdict was never corrupted. The two branches of the band ternary had shared the same
tail. The other 273 files in the range proved clean against their own cited text.

## Proof

`test/unit/kyoto-gastritis.test.js` — the "4 or more is the risk level; 3 is not" test now also asserts the
below-4 band reads "below the level rated as a risk" and never "below 4, the level rated as a risk".
