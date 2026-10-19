# spec-v1650: A worked example states the answer its tile gives

> Status: **SHIPPED (2026-10-19).**

A tile's worked example is the first answer a reader sees. Four stated answers their tiles do not give.
Each was worked by hand from the published formula; every library was right and every example was stale.

| Tile | Example said | By hand | Tile gives |
|---|---|---|---|
| `egfr` (F, creatinine 1.0, age 60) | eGFR ~60 | CKD-EPI 2021: 142 x (1.0/0.7)^-1.200 x 0.9938^60 x 1.012 = 64.5 | 64.5 |
| `egfr-suite` (M, same) | CKD-EPI 2021 ~89, MDRD ~77 | 142 x (1.0/0.9)^-1.200 x 0.9938^60 = 86.2; MDRD 175 x 60^-0.203 = 76.2 | 86.2, 76.2 |
| `bw-bsa-suite` (69 in, 85 kg, M) | IBW ~70.5, AdjBW ~76.3, Mosteller ~2.00 | Devine 50 + 2.3 x 9 = 70.7; 70.7 + 0.4 x 14.3 = 76.4; sqrt(175.26 x 85 / 3600) = 2.03 | 70.7, 76.42, 2.03 |
| `meld-childpugh` | MELD-3.0 ~17, Child-Pugh ~7 | MELD 3.0 terms sum to 17.76, which rounds to 18; Child-Pugh bilirubin 2 + albumin 2 + INR 1 + mild ascites 2 + no encephalopathy 1 = 8 | 18, 8 |

`test/unit/derivation.test.js` checked MELD with a tolerance of one point, which is how "~17" stood; it
now asserts 18.

## Proof

`test/mcp/example-headline-number.test.js`: for every agent-exposed tile, the first number in the
example's `expected` text appears in the result computed from that example's fields. It flagged exactly
these four before the fix. Later numbers are not held, because they are often band edges quoted in prose
("moderate (6-10)").
