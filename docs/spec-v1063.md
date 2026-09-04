# spec-v1063 — the field a reader leaves blank

## The gap in the two sweeps we already had

Two whole-catalog sweeps guard against a calculator reading a missing number as
a measurement of zero. Both clear **every** field and check that the tile does
not answer.

That is a state a reader rarely reaches. It is also the easy half of the
problem: with the whole form empty, a tile is visibly unfed, and one guard
anywhere in the renderer is enough to make it refuse.

The state a reader actually reaches is different. Nine values are to hand and
the tenth is not — the blood gas is still in the analyser, the weight was never
recorded, the baseline creatinine is in another system. The form looks complete.
The tile answers. Nothing on screen says a field is empty.

And because the existing sweeps clear everything, **the first guard on a tile
silences them for all of its other fields**. That is not a hypothetical:

- spec-v1038 guarded `carb-insulin-bolus`'s carbohydrate count, insulin-to-carb
  ratio and current glucose. It left the correction factor and the target
  glucose. A blank target arrived as 0, so the correction dose was
  `(current - 0) / ISF`: **3.6 units of insulin where 1.2 was right.**
- spec-v1038 guarded `bhutani-bilirubin`'s age and gestational age. It left the
  bilirubin — the one number the tile exists to interpret. A blank one converted
  to 0 and landed in the **"Low-risk zone (<40th percentile)"**.

Both tiles were quiet in both sweeps, from the day they were half-fixed.

## The finder

`test/integration/one-blank-field-probe.spec.js` starts from each tile's own
example — a complete, correct patient — and clears a **single** field.

It only touches fields whose label names a quantity that cannot be zero in a
living patient: an age, a heart rate, a haemoglobin, a serum sodium. For those,
a blank read as 0 is never a value the reader could have meant. Counts and
amounts are left alone, because nought units transfused, or no sodium added to
the bag, are real answers — that distinction is what keeps the output readable.

A hit is a field where clearing it **changed the answer**. That is wider than
"is a bug" on purpose: a tile that responds by dropping the dependent line, or
by naming the measurement it is missing, is behaving correctly and still shows
up. What the list must not contain is a tile that quietly recomputes from zero.

First run: **84 field/tile pairs across 52 tiles, 81 of which moved the answer.**

The probe asserts nothing and `playwright.config.js` excludes `*-probe.spec.js`
from CI, so it costs the pipeline nothing.

## What was fixed here

Twelve, worst first. The test in brackets pins each one.

| Tile | With one field blank, it said | Now |
|---|---|---|
| `akin-aki` | "AKIN: **no AKI criteria met**" with the current creatinine blank | Refuses; a single creatinine cannot rule AKI in or out [`akin-aki.test.js`] |
| `carb-insulin-bolus` | correction bolus **3.6 units** instead of 1.2, blank target glucose | Asks for the ISF and the target |
| `ebv-mabl` | maximum allowable blood loss equal to the **whole blood volume** | Asks for the minimum acceptable haematocrit |
| `bhutani-bilirubin` | "**Low-risk zone** (<40th percentile)" with the bilirubin blank | Asks for the bilirubin |
| `neo-phototherapy` | "TSB 0 is 16 mg/dL **below** the phototherapy line"; a blank age moved the line itself | Asks for age, gestation and bilirubin |
| `sipa` | shock index 0, "**Within age-adjusted range**" | Asks for the heart rate |
| `shock-index` | "Shock index (HR/SBP): **0.00**" beside a real MAP | Asks for the heart rate |
| `triple-i` | "**No category met**" with no temperature; "without any of the supporting features" with the fetal heart rate blank | Refuses without a temperature; names the features nobody measured [`triple-i.test.js`] |
| `membranous-risk` | "Moderate risk ... and **none of the high-risk features**" with the albumin blank | Says which tests would move it to high risk [`membranous-risk.test.js`] |
| `conc-rate` | "Infusion rate: **0 mL/hr**" with a per-kilogram dose and no weight | Asks for the weight when the dose is per kilogram |
| `peds-transfusion-volume` | "PRBC transfusion volume: **0 mL**" with the desired haemoglobin rise blank — a transfusion order of nothing | Asks for the desired rise |
| `scorten` | SCORTEN 2, "mortality ≈ **12.1%**", where the full set gave 3 and 35.3% | Reports the floor and says how many measurements it had [`dermuro-v191.test.js`] |

Two shapes of fix, and which one applies is a judgment about the instrument, not
a style preference:

- **Refuse** when the missing value is the entry condition or when the answer
  could go either way without it. `akin-aki`'s stage is the worse of two arms and
  an unassessed arm must not be scored as a normal one; `triple-i` has no
  category that does not begin with fever.
- **Disclose** when the score is monotone, so a partial total is a floor.
  `scorten` now says "scored from 3 of the 6 measurements; the ones still blank
  can only raise it". This follows spec-v1006: an incomplete score may rule a
  patient **in**, and must never rule them **out**.

## Still open

The probe's remaining hits include both real defects and correctly-disclosing
tiles; they have not been separated yet. `apache2`, `psofa`, `pelod2`, `lrinec`,
`iss-rts`, `mews`, `news2`, `maddrey-lille`, `toxic-alcohol`, `egfr`, `saag`,
`mswat`, `geneva-original` and `vte-prophylaxis-dose` all move their answer when
one measurement is cleared, and most are monotone scores that want the `scorten`
treatment rather than a refusal.

Turning the probe into a gate needs that pass finished first: a gate whose
ledger is seeded with unexamined lines is a gate that documents the defect
instead of catching it.
