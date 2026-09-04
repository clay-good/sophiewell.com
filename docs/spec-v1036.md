# spec-v1036 — An alarm from nothing is not the safe direction

## Two tiles left on the ledger

spec-v1029 audited the empty-form ledger and found sixteen entries that read a number as well as a
checkbox. Five of them reassured from a blank measurement and were fixed there. Two more did the
opposite, and I let them stand because the program's rule is about ruling *out*:

| Tile | An untouched form said |
| --- | --- |
| `meows` | MEOWS: trigger (5 red, 0 yellow). **Activate the obstetric MEOWS response** |
| `mini-cog` | Mini-Cog: 2/5 — **Positive screen** — further evaluation indicated |

Both are alarms, so neither can send a patient home. Neither is harmless either. The first calls an
obstetric rapid-response team to a bedside where no observation has been taken; the second reports a
positive dementia screen on a patient who was never asked to recall a word — and one word recalled
would have made the same form read negative.

**"May rule in, never rule out" is a rule about which direction is *safer*, not a licence to invent
the alarming answer.** A score still has to come from something the reader entered.

## The fix

`meows` gets the guard NEWS2 got in spec-v930 — the identical defect, six years of code apart: every
band helper is an if/else chain with no missing-value branch, so zero scored the worst band in each.
It now lists the observations it needs. A non-finite reading is treated as *not taken* rather than
as an error, since that is what the reader has to act on; a value that is present and impossible
(a heart rate of −5, a saturation of 105%) still throws.

`mini-cog` refuses the screen result until the recall has been administered, and says what the clock
draw alone scores so the reader can see how much is riding on the missing half.

Both ids are removed from `empty-form-ledger.js`, which leaves 78.

## The test that pinned the old contract

`meows rejects non-finite and implausible vitals` asserted that `rr: NaN` throws. That is the fourth
time in this program a test has pinned the behavior being fixed. It now asserts the distinction that
matters instead: **a value that is missing is asked for; a value that is present and impossible is
refused.**
