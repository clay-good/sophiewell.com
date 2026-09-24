# spec-v1411 — two impossible values that changed nothing on screen

`scripts/probe-impossible-reads-as-absent.mjs` drives each optional numeric field to an impossible
value and asks whether the reading moved. After the envelope waves ([spec-v1404](spec-v1404.md)
through [spec-v1410](spec-v1410.md)) it still listed two fields where the answer was identical to
the worked example's:

| tool | field | impossible value | what it did before | now |
|---|---|---|---|---|
| `smart-cop` | PaO2/FiO2 ratio | 999999 | scored exactly like a normal 400; its floor was checked and its ceiling was `Infinity` | refused: "must be between 0 and 1000", the ceiling `critcare-severity` already applies to the same ratio |
| `popq-staging` | Point D | -999999 | the most negative point never leads, so nothing moved | refused, with every other point |

## POP-Q: the ranges the system defines

Every POP-Q point is a distance from the hymen along a vagina TVL long, and Bump 1996 defines the
ranges of four of them. The library now refuses a point outside:

| point | range | source |
|---|---|---|
| Aa, Ap | -3 to +3 cm | "the range of position of point Aa relative to the hymen is -3 to +3 cm" (Bump RC et al, *Am J Obstet Gynecol* 1996;175:10-17, quoted in [PMC3357472](https://pmc.ncbi.nlm.nih.gov/articles/PMC3357472/)); Ap is defined the same way |
| Ba, Bp | -3 to +TVL | "at -3 cm in the absence of prolapse", rising at most to the cuff in total eversion |
| C, D | -TVL to +TVL | geometry: a point on the vaginal wall cannot be farther from the hymen than the vagina is long (the same review flags a reported D of -13 as anatomically impossible) |

The required points were unbounded too: an Aa of 50 staged IV with a leading edge of "+50 cm".
TVL itself has no stated ceiling, so it is still checked only for being positive.

## Tests

- `test/unit/popq-staging.test.js`: every point past its range is refused; the edges (Aa +3,
  complete eversion at +TVL) still stage; a blank D is still a hysterectomy, not a fault.
- `test/unit/smart-cop.test.js`: a P/F of 999999 is refused and 1000 still scores. One existing
  test **asserted** the old behavior (`pfRatio: 999999` scoring 0); its intent — a high ratio is
  not a low one — moved to the edge of the range.

The probe now reads **0 / 0**.
