# spec-v1082 — a discharge decision, a newborn, and the middle of a scale

Three more single-instrument tiles off [spec-v1079](spec-v1079.md)'s queue. Each
had sliders that could not say "not assessed"; each needed a slightly different
argument for what the fix should be.

## The readings

| Tile | Untouched form said | What that is |
|---|---|---|
| `white-song` | White-Song 14 of 14: **fast-track eligible** | a post-anaesthesia discharge routing |
| `apgar` | **APGAR: 10 (Normal)** | a newborn nobody had looked at |
| `npass` | pain 0 (**no significant pain**); sedation 0 | a neonate who cannot report either |

## Why each refuses rather than discloses a floor

`white-song` is the strongest case, and not for the obvious reason. The rule is
not a plain threshold: fast-track eligibility needs a total of 12 **and no single
domain below 1**. So a partial score can manufacture an *in*eligibility as
readily as an eligibility — one unrated domain read as 0 fails the second
condition on its own. Neither direction is safe, so it asks.

`apgar` is monotone, but the direction of harm flips with the missing sign: an
unassessed sign read as 0 makes a well baby look depressed, and a slider parked
at 2 makes a depressed one look well.

`npass` is the interesting one. Its items run **-2 to +2**, negative for
sedation and positive for pain, and **0 is the middle** — "neither". So the
slider's resting position is not an extreme that happens to be reassuring; it is
a real, specific clinical claim, and the one a form makes before anyone has
touched it.

In all three the reading that has to survive the fix is the genuine zero, and it
does: five Apgar signs actually scored 0 still read **"Severely depressed"**, and
an N-PASS rated 0 across still reads "no significant pain".

## Two more all-max worked examples

Both `white-song` and `apgar` opened on their most reassuring band, for the same
reason [spec-v1080](spec-v1080.md) found on `braden`.

`white-song` mattered because it is a decision, so its example is now a patient
who **scores 12 and is still not eligible**, because pain is 0 — the branch that
shows the rule is not just a total.

`apgar`'s is a softer call and worth saying so: a perfect 10 is a common real
value, not a rule-out. It was replaced anyway because an example of every sign at
full marks demonstrates no scoring at all. It is now the textbook one-minute 9 —
acrocyanosis, everything else full marks.

## What holds it

An assertion per tile covering all three states, including the genuine zero in
each. Full local verification, `release:check` plus the whole chromium suite,
before pushing.

## The lesson

> **"Default" is not the same as "extreme".** The earlier fixes all found a
> control resting at the best or worst end of its range. N-PASS rests in the
> middle, and the middle is itself a finding — no pain and no sedation. A sweep
> looking for controls parked at an extreme would have walked straight past it.
