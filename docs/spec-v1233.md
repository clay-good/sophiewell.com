# spec-v1233 — a fraction has two ends

`feNa` divides a **urine** sodium by a **plasma** sodium. `BOUNDS.sodium` is
serum sodium at 90–200 mmol/L — and a urine sodium of 20 is normal, a urine
creatinine runs in the hundreds where a serum one runs about 1.

So on every fractional-excretion tile in this wave the **plasma end is checked
and its urine partner is not**. That is [spec-v1205](spec-v1205.md)'s rule
applied to one formula rather than one field, and the test pins the negative
half: a urine sodium of 20 and a urine creatinine of 60 are both outside `BOUNDS`
read as serum values, and both must still compute.

| tile | checked | left alone, and why |
| --- | --- | --- |
| `fena-feurea` | plasma Na, plasma urea, plasma Cr | urine Na, urine urea, urine Cr — another compartment |
| `fepo4`, `femg` | plasma Cr | urine Cr; phosphate and magnesium pairs are ratio-consistent, not absolute |
| `fullpiers` | platelets (x10⁹/L ≡ x10³/µL) | creatinine — fullPIERS takes it in **µmol/L**, `BOUNDS.scr` is mg/dL |

`fullpiers` is worth stating plainly: its platelet term is quadratic and the
logistic saturates, so 20000 x10⁹/L came out as a **probability of an adverse
maternal outcome**, not as nonsense.

## And the clamp, again

[spec-v1224](spec-v1224.md)'s shape, twice more in `lib/cardio-v102.js`:

- `maggic` clamped a systolic BP of **3000 mmHg** to 300 and reported a 1- and
  3-year mortality.
- `cardShock` clamped a lactate of **400 mmol/L** to 40 and reported *"high risk
  (~77% in-hospital mortality)"*.

And `winters`, whose optional measured PaCO2 is compared against the expected
range and never bounded: 2000 mmHg read *"Concurrent respiratory acidosis (PaCO2
higher than expected)"* — a correct sentence about an impossible measurement. It
stays optional; only a value that is present is checked.

## Why `feNa` throws

Both `feNa` and `feUrea` return a bare number or `null`, and `null` already means
*"(incomplete inputs)"* on the page. Returning it for an impossible value would
tell the reader they had left the field blank — the dead end
[spec-v1226](spec-v1226.md) is about. A throw carries the sentence: the
renderer's `safe()` wrapper prints it and, since spec-v1230, clears the
derivation panel with it.

## The fourth time, and the first one where the envelope was wrong

`two-ranges-one-field` again, on `maggic`, four rows. Two are the familiar shape
and are fixed the familiar way — the systolic-BP and creatinine attributes now
read `BOUNDS`.

**The other two are the interesting ones.** MAGGIC's age field states `18–120`
and its BMI field `5–80`. Those are not plausibility claims; they are claims
about the instrument's **validated population**, and they are *tighter* than
`BOUNDS.ageYears` (0–130) and `BOUNDS.bmi` (5–200). Checking those two in the
library would have published a second, **looser** range on a field that already
carried a correct tighter one — a worse page, from a guard that adds nothing:
the field bound already rejects everything the envelope would.

So the library check was narrowed back to the two fields the probe actually
drove. [spec-v1198](spec-v1198.md)'s rule — *a view's ceilings ARE
`lib/bounds.js`'s* — holds where the field's bound is a **physiologic** claim. It
does not mean overwriting an instrument's validated range with a wider one.

That is the correction to the step [spec-v1232](spec-v1232.md) wrote down: check
every hand-written `min`/`max` on the renderer, and where one is *tighter* than
the envelope, ask which kind of claim it is before touching either end.

## Ledger

`scripts/probe-envelope-unbounded.mjs`, first section: **36 fields / 26
calculators → 26 / 18.** From **116 / 68** at the start of this run.
