# spec-v1013 — A calculation with no inputs is not a result of zero

## The finding

spec-v1006 and spec-v1007 covered the **scores**: a partial total is a lower bound, so an
incomplete score may rule in and must never rule out. The **arithmetic** tiles had the same defect
in a plainer form, and nobody had asked them the question.

Their renderers read fields with `num()` / `nv()`, which is `Number(input.value)`, and `Number('')`
is `0`. So an empty form arrived as a patient made entirely of zeros, and they answered. Measured
by clearing every number field across the catalog:

| Tile | With nothing entered |
| --- | --- |
| `bsa` | *"Du Bois: 0 m^2"* |
| `map` | *"MAP: 0 mmHg"* |
| `anion-gap` | *"Anion gap: 0"* |
| `corrected-sodium` | *"Corrected Na (factor 1.6): -1.6 mEq/L"* — a negative sodium |
| `corrected-calcium` | *"Corrected calcium: 3.2 mg/dL"* |
| `qtc` | *"Bazett: 0 ms"* |
| `osmolal-gap` | *"Calculated osm: 0.0, Osmolal gap: 0.0"* |
| `winters` | *"Expected PaCO2: 6.0 to 10.0 mmHg"* |
| `pack-years` | *"Pack-years: 0"* |
| `bw-bsa-suite` | *"IBW (Devine): 50.0 kg"* — the formula's constant, a plausible-looking dosing weight for nobody |
| `weight-dose` | *"Total dose: 0 mg"* |
| `insulin-drip` | *"Suggested rate (example only): 0 units/hr"* |
| `enteral-free-water` | *"Free water in formula: 0 mL/day"* |
| `apap-24h-max` | *"24-hour acetaminophen total: 0 mg / Remaining to ceiling: 4000 mg"* |

The last four are dose calculators. The acetaminophen one is the worst shape on the list: it
reports headroom nobody has measured, in the same words it would use after a real tally.

## The fix

Two small helpers, one per view module, in the shape the scores already use:

- `numOrNull` / `nvOrNull` — a genuinely empty field reads as `null`; a typed `0` still reads as
  `0`. This is spec-v930's distinction, applied to the formulas.
- `needValues` — prints what is missing, by the name the reader sees on the label ("Enter a
  systolic BP and a diastolic BP to calculate."), and stops the renderer.

`insulin-drip` is fixed in the library instead, because `Number(null)` is also 0 and the ladder
would otherwise treat a blank glucose as a real reading on the agent surface too.

## Proof

`test/integration/no-answer-from-nothing.spec.js` opens each of the 14 tiles, clears every number
field the way a reader does, and asserts the output asks for what is missing and never shows `NaN`,
`null` or `Infinity` — plus one case proving the prompt is not a dead end: entering 120 and 80 in
`map` still gives `MAP: 93.3 mmHg`.

## Scope, and what is left

The catalog sweep flagged **163 of 1,704** tiles as answering a cleared form. Most are legitimate:
a checklist instrument where nobody has ticked anything really does score 0 (ESAS, BESS, the
Roland-Morris, the Groningen Frailty Indicator), which is the measurement-versus-criterion judgment
spec-v1006 drew and this spec keeps.

This wave took the 14 that are plainly arithmetic, dosing first. The remainder of the printed
sample — `harvey-bradshaw` answering *"5: mild"*, `scorad` *"28/103 moderate"*, `rosendaal-ttr`
*"TTR 80% — 16 of 20 days in range"*, `snappe-ii` *"lower illness severity"*, `slums` *"0 of 30 —
dementia"* — are score-shaped and belong to the v1006/v1007 family, one judgment at a time. The
sweep printed the first 60 of the 163; the rest has not been read yet.
