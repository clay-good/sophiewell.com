# spec-v1747 — A sourced envelope for base excess

> Status: **SHIPPED (2026-11-16)**: two `lib/bounds.js` entries, applied to 3 tools. The catalog stays 2,387.

spec-v1740's follow-up left PIM3's base excess open: it answered 1,000,000 and needed a recorded extreme, not a
guess.

| Key | Range | Source |
|---|---|---|
| `baseExcess` | -60 to 70 mmol/L | the highest survived base excess reported is +48 mEq/L (Giovannini et al, "Exceptional nonfatal metabolic alkalosis (blood base excess +48 mEq/l)", Intensive Care Med 2005); -34.2 mmol/L at pH 6.53 was survived after hemorrhagic shock (BMJ Case Rep 2013). The margin past each matches spec-v1734's |
| `baseDeficit` | -70 to 60 mmol/L | the same quantity with the sign turned |

| Tool | Before |
|---|---|
| `pim3` | a base excess of +/-1,000,000 gave "100% predicted probability of death" |
| `tash-score` | +/-1,000,000 scored 13 or 17 points |
| `big` | a base deficit of -1,000,000 read "below the Borgman 2011 high-mortality threshold" |

`mh-grading-scale` and `ranson-bisap` take base excess as a yes/no criterion and are unchanged. Both keys are in
`scripts/lib/envelope-map.mjs`, so the finder and the page test hold them (reach 1,036 fields).

Tests: `pim3.test.js` and `tash-score.test.js` overflow tests moved to the envelope edges; a new case in
`big.test.js`.
