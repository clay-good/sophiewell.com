# spec-v1020 — One value, not none

## The finding

spec-v1019 built the sweep that catches a tile answering an **empty** form, and said in its own
closing paragraph what it does not cover: the likelier case, a form with **one value in it**. That
is how `lrinec` said "low risk of necrotizing fasciitis" from a single CRP in spec-v1006 — nobody
opens a calculator and types nothing; they type the number they have.

Running that sweep — clear everything, then put one plausible value in the first field — over the
catalog gave 21 tiles reading reassuringly. Most are legitimate: a tool whose single input *is* the
score (carboxyhemoglobin, the gingival index), or one whose message names exactly what it used
("Probable sarcopenia: low strength, a grip strength of 1 kg"). Two are not:

| Tile | With one value entered |
| --- | --- |
| `smart-cop` | an age alone: *"SMART-COP 0: low risk"* — a prediction about needing vasopressors or ventilation, for a patient nobody had examined |
| `lace` | a length of stay alone: *"LACE 1: low risk of 30-day death or unplanned readmission"* |

Both are monotone, so the fix is the one this program keeps making: the alarming bands stand on
whatever has been entered, and the reassuring one waits, naming what it waits for.

- `smart-cop`'s checkboxes are criteria and an unticked one is a real "no", but two of its terms are
  measurements: the age-adjusted respiratory rate, and the oxygenation trio where PaO2, SpO2 or the
  P/F ratio will each do. Without them, *"low risk"* is withheld and the score reports as a floor.
  Enter a respiratory rate and a saturation and the low-risk reading is available again.
- `lace`'s length of stay, Charlson index and emergency visits are all counts somebody has to look
  up. The low band waits for them; moderate and high do not.

## The trap, for the third time

`lace`'s library guard did not fire when it was written, because the renderer reads its fields with
`nv()` and `Number('')` is `0`. The library was handed three zeros and a length of stay, not three
gaps.

That is the same trap spec-v1006 named, spec-v1014 found again on `psi`, and this spec found a third
time. **A library guard is only as good as the reader in front of it**, and the reader is in a
different file from the guard, which is why it keeps happening.

## Deliberately left

`diastolic-function-ase` reads *"Normal diastolic function (0 of 1 criteria abnormal)"* from one
measurement, and the ASE algorithm wants at least three of four. It already prints, directly under
that line, *"Fewer than three criteria were measured — interpret with caution; the algorithm is
designed for at least three of the four."* The tile made a considered choice to compute and disclose,
its note says so, and the disclosure is on screen where the reading is. Left alone.

## Proof

`test/integration/no-answer-from-nothing.spec.js` — `smart-cop` with an age alone shows the floor
and the ask, and shows *"low risk per Charles"* again once a respiratory rate and a saturation are
entered; `lace` with a length of stay alone shows the floor. 13,096 unit tests, the catalog sweep
and the full lint chain pass.
