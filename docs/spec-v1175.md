# spec-v1175 — the finder for a ceiling we already wrote down

[spec-v1174](spec-v1174.md) fixed five fibrosis scores that ruled fibrosis out
from a platelet count in the units a lab report prints, and found the cause:
`lib/bounds.js` has carried the correct, sourced ceiling since spec-v53 and has
**three consumers**, because its own header planned the migration as
*"opportunistic, not a sweep"*.

This is the sweep, as a finder. `scripts/probe-envelope-unbounded.mjs` asks the
general form of that question: **for every numeric field whose label and unit
name a quantity the table has an envelope for, drive the value an order of
magnitude past the ceiling — does the tile still answer?**

```
174 field(s) across 92 calculator(s) answer from a value an order of magnitude
past a ceiling lib/bounds.js already declares.

Reach: 396 field(s) map to one of 33 envelopes;
368 have a worked example inside that envelope and are testable,
0 are mis-mapped, and 28 carry no usable example.
```

## The mapping is the hard part, and its negative test is built in

An envelope belongs to a quantity **in a compartment**. `BOUNDS.sodium` is serum
sodium at 90–200 mmol/L; a urine sodium of 20 is normal, an IV bag's sodium
additive of 30 is normal, and an air temperature of −10 °C is a Tuesday. A
label-matching probe that misses this does not find defects, it manufactures
them.

So the probe checks itself against every tile's **own worked example**: a value
someone chose deliberately. An example falling *outside* the envelope the probe
assigned is a **mapping bug in the probe**, not a defect in the tile, and it is
printed first and separately.

On its first run that check found three, all real:

| Field | Label | Example | Envelope |
| --- | --- | --- | --- |
| `wind-chill\|wc-temp` | Air temperature | −10 | temperature [25, 45] |
| `iv-osmolarity\|io-na` | Sodium additives | 30 | sodium [90, 200] |
| `iv-osmolarity\|io-k` | Potassium additives | 20 | potassium [1, 10] |

309 of 312 examples sat inside. The three are excluded by name in the probe's
`EXCLUDE` list, and removing `\bair\b` from it brings `wind-chill` straight back
— the check is live, not decorative.

## The classifier walked into the two traps this repo has already written down

The probe ranks its rows by whether the impossible value produced a **reassuring**
reading, because [rule 3](incomplete-input-program.md) is about ruling out. The
first version of that classifier hit both:

1. **It matched the whole reading, not the verdict** — [spec-v1075](spec-v1075.md)'s
   rule. `haps`'s *"**not** harmless"*, `lactate-clearance`'s *"**not** a
   favorable trend"* and `hys-law`'s *"other causes are **not** recorded as ruled
   out"* all read as reassurance. Thirteen of twenty-four rows were the
   vocabulary matching a tile's own explanation of the opposite conclusion.
2. **`normal` unbounded matches inside `abnormal`** — the raw-substring trap that
   made `psi` match antitrypsin in the search corpus. Four gestational-diabetes
   rows reading *"single abnormal value"* sat in the reassuring bucket.

And a third, mine: splitting the fallback verdict on a bare `.` cuts *"ALBI score
-58.69 → grade 1: the best preserved liver function"* at the **decimal point**
and loses the verdict entirely. It reads the verdict field where a tile has one,
falls back to the first *sentence* otherwise, and disqualifies a leading
negation. 24 rows → 11, with the genuine ones back.

## The 11, which is the drain queue

| Tile | Given | It said |
| --- | --- | --- |
| `albi-grade` | albumin 70 g/dL | *grade 1: the best preserved liver function* |
| `nafld-fibrosis` | albumin 70 g/dL | *excludes advanced fibrosis (F0-F2)* |
| `stewart-sid-sig` | bicarbonate 600, albumin 70 | *no excess unmeasured strong anions* |
| `cdai-crohns` | haematocrit 750% | *CDAI -3975: clinical remission* |
| `lactate-clearance` | initial lactate 400 | *99.5%, the cited favorable early-clearance range* |
| `ipss-r-mds` | haemoglobin 250 g/dL | *IPSS-R 3: Low risk* |
| `sokal-cml` | platelets 20,000 | *ELTS 0.92 (low risk)* |
| `abi` | arm pressure 3000 mmHg | *ABI 1.20: normal (1.00-1.40)* |
| `mews` | SBP 3000; temperature 450 °C | *0-2: low risk band* |

`sokal-cml` also prints **`3.9512129886066085e+66`** into its own answer, which
belongs to `no-impossible-number.spec.js` rather than here — recorded so whoever
drains this queue routes it to the right gate.

The other 163 rows are the alarming direction: wrong, but not the direction this
programme treats as dangerous.

## Why a finder and not a fix

Because the fix is a judgment per field, not a rewrite. A ceiling is a
**disclosure** boundary, not a guard — spec-v53 is explicit that the advisory
never changes the number, and `rangeMessage` in `app.js` makes no claim about
what the answer below did with the value. So each row asks *was the reader told?*,
not *should the tile have refused?*, and 174 of those are several waves' work.
spec-v1174 drained the five where the answer was a rule-out and the cause was a
unit a lab report prints.

## Verification

`npm run release:check` green. The probe asserts nothing and is not run in CI, so
it costs nothing until someone asks — the same contract as the five finders
beside it in `scripts/`.
