# spec-v1154 — an alarm invented from a blood pressure nobody took

Eighth batch out of [spec-v1146](spec-v1146.md)'s backlog: four singles.

## `gap` and `mgap` — the direction that made it look safe

Both are trauma scores where **higher is better**, and both bound the systolic BP
at `s < 0` — so a blank read as `0` and scored the **hypotensive** band:

| | GAP | risk |
| --- | --- | --- |
| GCS 15, age < 60, SBP 130 | 24 | low |
| the same patient, SBP not entered | **18** | **moderate** |

Because the scale runs the other way from most, the blank did not soften the
reading — it **invented an alarm**, and on `gap` it moved the band. Rule 6: an
alarm from nothing is not the safe direction either.

The systolic is worth 0 to 6 points on GAP and 0 to 5 on MGAP, so the total is a
floor and the risk shown is the **worst** case. Both say so:

> The systolic BP is not entered and it is worth 0 to 6 points, so **moderate risk
> is the WORST case here** — a systolic above 120 would make it 24 and low risk.
> Enter the systolic BP to read the band.

And rule 25: when every value the missing field could take lands in the **same**
band, the reading stands rather than hedging —

> low risk per Sartorius 2010 (…). The systolic BP is not entered and is worth 0 to
> 5 points, and every value it could take leaves the band at low.

which is what `mgap` does on its own worked example. A **typed** 0 is a real
hypotensive reading and still scores as one.

## `tsat` and `rox` — already right, wrongly declared

| Tile | What it does without the field |
| --- | --- |
| `tsat` | the saturation is iron ÷ TIBC and needs no ferritin; the reading already says *"TSAT <20%: iron-deficient pattern (**check ferritin** to separate absolute vs functional)"*, and the page label says *"Ferritin (ng/mL, optional)"* |
| `rox` | [spec-v1131](spec-v1131.md) taught it to ask for the timepoint **only in the range where the timepoint decides** — the success cutoff is ≥ 4.88 at every timepoint and a score under 2.85 is failure-predicting at every one |

`rox` is the sharper of the two: declaring the hour required refused even the calls
the hour **cannot change**, which is the opposite of what spec-v1131 built.

## Backlog

**13 → 9.** Left: `capra-score`, `rosendaal-ttr` (2), `anticoag-reversal`,
`acetaminophen-nomogram`, `nsa-cost-share`, `posas-patient-scar` (2),
`weight-dose`.
