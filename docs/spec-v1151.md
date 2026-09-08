# spec-v1151 — a phrase measured and rejected, four declarations, and one rule-out

Fifth batch out of [spec-v1146](spec-v1146.md)'s backlog: the group triaged as
*"criteria that are present or absent"*. It began by looking like a vocabulary
problem and ended as four declarations and one real defect.

## `at least` is not a disclosure phrase, and the measurement says so

`niss` was flagged, and `niss` is right. Drop one of its three AIS severities and
it reads:

> NISS: **at least 75** — an AIS 6 (unsurvivable by convention) forces the
> maximal score

Drop the AIS 6 as well and it refuses outright — *"NISS is at least 13 from 2 of
the three AIS severities. **Enter** the rest: each can only add to the total"*.
Both are exactly what this programme asks for. The first was flagged because
`DISCLOSING` knows *"can only add"* and *"can only raise"* and *"scored from"* —
and not **`at least`**, which is the phrasing three tiles fixed earlier in this
same session use ([`big`](spec-v1146.md), [`saps-ii`](spec-v1149.md),
`nutric` below).

That reads like [the duplicated-rule drift](incomplete-input-program.md) the list
warns about, so it was measured before anything was added. A bare `at least`
appears **553 times across 176 library files** — mostly criterion text, so it was
never a candidate. The narrow form, the score stated as a floor
(`/(?::|\bis)\s+at least\s+\d/`), across every tile and every field:

| | |
| --- | --- |
| already exempt | 805 |
| **moved by the candidate** | **3** |
| still flagged | 1,220 |

And all three moves are **wrong**: two are `migraine-ichd3` printing its own
criteria (*"for 1.1: at least 2 of the 4 headache characteristics"*) and one is
`pci-surgery-timing`'s stent window. **Not added.** `at least` is how this house
writes a floor and also how the sources write a threshold, and no pattern
separates them.

`niss` was then going to be ledgered with that reason — until the declaration fix
below made the ledger line **dead**, because the probe no longer clears those two
fields at all. It was removed again: a tile exempted for nothing is a tile the gate
is not protecting, and the reason belongs here.

## Four more declarations

| Tile / field | Why the browser was right |
| --- | --- |
| `truelove-witts` / temperature, heart rate, hemoglobin, ESR | severe colitis is ≥ 6 bloody stools **plus at least one** of the four — they are alternatives, and [spec-v1066](spec-v1066.md) already taught the library to disclose what was not measured (rule 27) |
| `niss` / second and third AIS | the library gives a disclosed floor from a subset, and an AIS 6 forces the maximal 75 on its own |
| `nutric` / IL-6 | rarely available at the bedside — which is why mNUTRIC exists and ships as its own tile — and `nutricMissing` already excludes it |
| `vent-sbt-peep` / lookup FiO2 | the tile is two calculators on one page and this belongs only to the second, the ARDSnet PEEP table; dropping it leaves the SBT verdict untouched |

`truelove-witts` is the sharpest: declaring all four systemic criteria required
refused agent calls carrying a subset **including the ones that already rule
severe colitis in**.

## And a rule-out the declaration change would have widened

Making `nutric`'s IL-6 optional to agents meant reading what the tile does
without it — and `nutricMissing` leaves IL-6 out on purpose, so nothing was
waiting on it:

```
age 75, APACHE II 18, SOFA 6, two comorbidities, IL-6 not entered
  "NUTRIC 5 of 10: low nutritional risk per Heyland 2011 (cutoff >=6)."

the same patient with an IL-6 of 500 pg/mL
  "NUTRIC 6 of 10: high nutritional risk ... benefits most from aggressive
   nutrition therapy."
```

The IL-6 term adds a point at ≥ 400 pg/mL, so a total of 5 without it is **one
point short of the cutoff** — rule 3, and the mNUTRIC cut-off is ≥ 5 in any case,
so the same patient is already high risk on the form that omits IL-6 by design.
It now says so, and says which form calls it high risk. Below 5 the reading
stands and states that IL-6 cannot reach the cutoff from there; a typed 0 answers
as before.

**Relaxing a declaration means reading what the tile does without the field.** It
is not a paperwork change.

## Backlog

**35 → 27.** Left: the suites of independent readings (`ecmo-titration`, `abg`,
`digoxin`, `o2-cylinder-duration`, `infusion-time-remaining`, `rosendaal-ttr`)
and the singles.
