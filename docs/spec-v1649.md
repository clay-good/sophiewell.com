# spec-v1649: A band's own parenthetical must be true of the score it prints

> Status: **SHIPPED (2026-10-19).**

Found by computing every agent-exposed tool on its example and 200 variations of it, reading each
parenthetical condition in the result's band ("(< 1)", "(>= 4)", "(30-39)") and testing it against the
score printed beside it. Most hits were a cutoff named beside the side it is not on ("below the cutoff
(>= 4)"), which is true as written; these were not:

| Tile | Was | Now |
|---|---|---|
| `das28` | Banded the unrounded score but printed two decimals: a raw 5.1004 read "DAS28-ESR 5.1: high disease activity (> 5.1)". | The band is read on the score as printed. Across a sweep of joint counts, ESR and global VAS, the old code disagreed with its own printed score 106 times; now none. |
| `humidex` | 39.8 read "some discomfort (30-39)". The comparison is `< 40`. | "some discomfort (30 to under 40)". |
| `kobayashi-kawasaki`, `sano-kawasaki`, `downton-fall-risk`, `conley-fall-risk` | The low side printed the high-risk condition after it: "Kobayashi 3 of 11 — low risk of IVIG resistance (>= 4)". | "low risk of IVIG resistance (below the >= 4 cutoff)". The high side is unchanged. |

## Proof

- `test/unit/das28.test.js`: over the sweep, the band always matches the printed score, and the sweep
  reaches the 3.2 and 5.1 edges.
- `test/unit/environ-v242.test.js`: every humidex between 39 and 40 in a temperature/dewpoint sweep
  carries the "30 to under 40" label.
- `test/unit/kobayashi-kawasaki.test.js`: a low score names the cutoff it is below.
