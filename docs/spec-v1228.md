# spec-v1228 — past a threshold, the size of the number stops mattering

Four tiles do not *compute* with their inputs. They compare each one against a
cutoff, and that makes the defect invisible from inside the formula: a glucose of
20000 mg/dL is over the 92 mg/dL cutoff in exactly the way 95 is. What comes out
is a real diagnostic band.

| tile | impossible input | what it printed |
| --- | --- | --- |
| `iadpsg` | fasting glucose 20000 | *"GDM diagnosed per IADPSG 2010"* |
| `carpenter-coustan` | any of the four draws 20000 | *"impaired glucose tolerance per Carpenter 1982"* |
| `dka-hhs` | glucose 20000 | *"Mixed DKA/HHS picture … with hyperosmolality"* |
| `dka-hhs` | pH 80, or HCO3 600 | *"Criteria for a complete DKA or HHS classification are not met"* |
| `tls-cairo-bishop` | potassium 100 mmol/L | *"Clinical tumor lysis syndrome (Cairo-Bishop grade II)"* |

IADPSG is the sharpest. **One value over cutoff diagnoses**, so an impossible
draw did not merely score — it diagnosed gestational diabetes on its own.

`dka-hhs` is the one that lands on the reassuring side. An arterial pH of 80 does
not meet the acidosis criterion, so the tile says the DKA criteria are *not met* —
from a pH no living patient has.

## The fix

Each value is checked against `BOUNDS` before it is compared to anything, and the
sentence is `boundsAdvisory`'s. **No clinical number is decided here**, and no
cutoff moves.

Where it runs matters twice over:

- **After** each function's own missing-value branch, and skipping a value that
  was not entered ([spec-v1207](spec-v1207.md)), so a draw nobody took is still
  reported as missing rather than as out of range — *"Enter all four
  Carpenter-Coustan draws"*, not *"glucose must be…"*.
- On `tls-cairo-bishop`, every lab is optional by design and the function already
  reports which ones it read, so the check skips a blank and never narrows what
  the tile will answer from.

## The agent surface

All four return a `{ band }` shape with no `valid` field, so a refusal reached an
agent as `valid: true` with the refusal sentence sitting where the answer goes —
the trap [spec-v1205](spec-v1205.md) recorded. The two OGTT functions' existing
incomplete-test refusals (spec-v1006's *"an incomplete 75-g OGTT can diagnose it
but cannot rule it out"*) had the same gap and are fixed with them.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **94 fields / 54
calculators → 80 / 50.**
