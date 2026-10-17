# spec-v1642: Two duplicates retired, and the duplicate report made a gate

> Status: **SHIPPED (2026-10-17).**

## What was wrong

`scripts/find-duplicate-tiles.mjs` (spec-v972) was only ever run by hand. Since early September it had
reported every new tile that looked like an old one, and nobody read the report: 124 pairs had no ruling.
Two of those pairs were the same tile twice.

| Retired | Survivor | Why the survivor |
| --- | --- | --- |
| `hatch-af` | `hatch-score` | it scores age the way de Vos 2010 defines the score (see below) |
| `hill-flap-valve` | `hill-grade` | the same four grades from the same input; `hill-grade` adds the hernia context and is the one other tiles link to |

Catalog **2,308 → 2,306**. Each old link redirects to its survivor in the browser, and agents resolve it
through `data/id-aliases.json` with a deprecation notice until 2027-10-17.

## The HATCH pair scored a 75-year-old differently

The two HATCH tiles disagreed on one item. `hatch-score` asked "Age > 75 years". `hatch-af`, built from a
2019 paper's restatement, asked "Age 75 or older". So a 75-year-old with hypertension and heart failure
scored 3 on one tile and 4 on the other.

The primary paper disagrees with itself. Its methods paragraph says "age [75 years and older]". Its derived
rule says "1 × (hypertension) + 1 × (age >75 years) + ...", its points table says "Age >75 yrs", and its
results say "older than 75 years". The rule and the table define the score, so the survivor follows them.
Its band text now says so and names the methods wording. Read at jacc.org on October 17, 2026.

The retired tile carried one thing the survivor lacked, and it moved over: the paper's progression figures.
Nearly 50% of patients with a score above 5 progressed to persistent AF within a year, against 6% at a
score of 0. The survivor's bands are now 0-2, 3-5 and 6-7.

## The other 122 pairs

Each pair is now ruled DISTINCT in `RULED`, with one line on why. Most are:
- **Siblings:** SCORE2 and SCORE2-OP, ISS and R-ISS, Braden and Braden Q.
- **Two halves of one system:** Paprosky acetabular and femoral, METAVIR activity and fibrosis.
- **One acronym, two diseases:** CDAI for Crohn's and for RA, three PASS scores, two ATLAS scores.
- **A score and its own input:** TRISS takes ISS and RTS; the Nottingham Prognostic Index takes the grade.

The ICHD-3 headache diagnoses and the *-RADS reporting systems match only on their shared suffix.

## The gate

`test/unit/find-duplicate-tiles.test.js` now fails when the finder reports a pair with no ruling. A new tile
that resembles an old one cannot ship until someone opens both adapters and writes a ruling, or retires one.
