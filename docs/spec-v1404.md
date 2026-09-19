# spec-v1404 — the weight envelope nobody checked

`lib/bounds.js` has declared a plausible body weight (0.3 to 500 kg) for a long time. The finder
that drives each field past its envelope, `scripts/probe-envelope-unbounded.mjs`, mapped labs and
vital signs and **had no row for weight**. Adding one found 29 fields in 27 calculators.

## Answered from a 5,000 kg weight (22 fields, 21 calculators)

| reading | calculators |
|---|---|
| **reassuring**: *"CDAI -6772: clinical remission"* | `cdai-crohns` (weight and standard weight) |
| drug doses: IWPC 690 mg/day, Gage 376 mg/day | `warfarin-iwpc`, `warfarin-gage` |
| rates and volumes | `vasopressor`, `crrt-dose`, `ecmo-titration`, `maint-fluids`, `gir`, `urine-output`, `burn-uop-target`, `ebv-mabl`, `fluid-balance`, `potassium-deficit`, `weight-dose`, `bmi`, `bsa`, `bw-bsa-suite` |
| other | `osteoporosis-prescreen`, `ktv-urr`, `elemental-iron-ingested`, `schofield` |

Each now refuses with the shared `boundsAdvisory('weightKg', …)` sentence, checked after its own
missing-value branch. Where a file already called `num('weightKg', w, { min: 0 })`, the declared
ceiling was added to that call; the warfarin models also check the height envelope.

## Asked for a weight that had been entered (7 fields, 6 calculators)

`grobman-vbac`, `max-allowable-blood-loss`, `six-minute-walk-predicted`,
`osteoporosis-self-assessment-tool`, `widmark-bac`, and `nri` (current and usual weight) parsed an
out-of-range value to `null` and then asked for it as if it were blank, so retyping it produced the
same sentence. Each now runs `gradeFault()` over the fields of that parse, with the file's own
bounds, before the missing-value message. A blank still gets the original request.

## Proof

- `test/unit/body-size-envelope.test.js` runs each worked example through `compute_calculator` with
  the weight set to 5,000 kg and requires a refusal that names a range. With the library changes
  reverted it fails for all 27.
- The probe now reads 0 in every section. Its reach went from 395 to 461 fields; 430 are testable.
