# spec-v1194 — three tiles that ruled out from a blank

[spec-v1193](spec-v1193.md) shipped `scripts/probe-static-exemption.mjs` and
fixed three of the twelve calculators it printed. It closed by naming three more
that answer from a blank. This is those three.

They are not the `oneOf` shape of the last two waves. Each is a **criteria set**,
and in each one an observation nobody had recorded was counted as an observation
recorded and found negative — so the tile published a rule-out.

| tile | the blank | what it was read as | what it published |
|---|---|---|---|
| `aom-criteria` | the drum was not graded | "None" (no bulging) | **Criteria not met** for acute otitis media |
| `narcolepsy-criteria` | half the latency test | a mean latency of 0 / no REM periods | **Criteria not met** |
| `atrial-enlargement` | an unmeasured P wave | a P wave measured and normal | **no atrial enlargement criterion met** |

## Two of them already knew

`narcolepsy-criteria` states the rule correctly for one field and not the one
beside it. Its type-2 route reads:

> a positive latency test without cataplexy, with the hypocretin **above the line
> or unmeasured** and other causes excluded

An unmeasured hypocretin is named. An unmeasured mean sleep latency was read as
zero minutes, which clears the 8-minute threshold in the wrong direction, and an
unrecorded sleep-onset REM count was counted as none.

`atrial-enlargement` writes it out in a comment:

> the Morris index needs BOTH halves of the terminal force, so it is only
> assessed when both were measured; **one alone cannot meet or exclude it**

That is the rule this wave applies to the other four criteria in the same
function. It was applied to one of five.

That is the [spec-v1101](spec-v1101.md) smell exactly: the reasoning is already
in the file, for the half somebody was fixing at the time.

## The sleep-study half-substitution

`narcolepsy-criteria` needed a second look. A sleep-onset REM period on the
preceding overnight study **may count as one of the two** on the latency test, so
the first fix here treated "the overnight study was positive" as making the study
whole. It does not: the overnight period *adds* one, and with the latency-test
count still blank the effective total is a **floor**, not a total. The tile's own
worked example is exactly that case — one REM period on the latency test plus one
overnight — and dropping the latency-test count still read as "criteria not met"
until the rule was written the right way round.

## Rule 13 throughout

Each observation is asked for only where it decides something.

- `aom-criteria` still diagnoses on **new drainage from the ear**, which is
  diagnostic on its own whatever the drum looks like. And it still rules out
  without objective evidence of fluid, because the guideline forbids the
  diagnosis without it however the drum looks.
- `narcolepsy-criteria` still returns **type 1** on a hypocretin at or below
  110 pg/mL, which settles the type whatever the latency test shows.
- `atrial-enlargement` criteria are "any one of", so **met** is monotone and is
  answered rather than withheld: a met left side still reads as met while the
  right-sided amplitudes are reported as unassessed rather than as normal.

`atrial-enlargement` now says which side was not assessed, and names the
measurements:

```
P wave analysis — left not assessed: the P duration in lead II, the notch
inter-peak duration and the V1 terminal force (both halves of it) were not
entered; criteria met for right atrial enlargement.
```

## Proof

`probe-static-exemption` reads **14 → 11** rows. `atrial-enlargement` and
`narcolepsy-criteria` leave it entirely; `aom-criteria` stays on it because its
new reading is still *exempted* for the wrong reason — "it does not **select** an
antibiotic or a dose" — which is a gate problem, not a tile problem, and the one
[spec-v1193](spec-v1193.md) describes.

Lint, 13,473 unit tests, 448 MCP tests and nine browser sweeps pass, and all
three readings were read off the rendered page.

## Still open

Five calculators remain on the finder — `diabetes-diagnosis`, `lyme-two-tier`,
`clabsi-lcbi`, `cauti-nhsn`, `marsi`, plus `aom-criteria` — and every one of them
was read and is answering correctly. What is left is the gate: they are exempt
because a standing caveat happens to contain a word from the vocabulary, and an
exemption granted for nothing is an exemption that protects nothing
([spec-v1056](spec-v1056.md)). Teaching the sweeps the movement rule the finder
uses is the next wave, and it is a change to shared gate infrastructure rather
than to any tile.
