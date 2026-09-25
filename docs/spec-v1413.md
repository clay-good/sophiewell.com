# spec-v1413 — estimated FiO2 on nasal oxygen

The second of the bedside questions [spec-v1412](spec-v1412.md) set out to close. `sf-ratio` and
`global-ards` both take an FiO2, and a patient on a nasal cannula has a flow rate, not an FiO2.
`fio2 nasal cannula` reached nothing that converts one to the other.

## What it does

`nasal-o2-fio2` takes the flow in L/min and returns **0.21 + 0.03 x flow**: the estimate the 2024
Global Definition of ARDS gives, in a footnote to its nonintubated and resource-limited criteria, for
a patient whose FiO2 is not measured (Matthay MA et al, *Am J Respir Crit Care Med*
2024;209:37-47, Table 1; read 2026-09-24 from PMC10870872). 3 L/min gives 0.30.

## What it says about itself

- **It is a convention, not a measurement.** Wettstein 2005 (*Respir Care* 50:604-609) measured
  pharyngeal FiO2 in 10 healthy adults: across 1-6 L/min the mean ran 0.26-0.54 at rest and
  0.24-0.45 breathing fast, varied widely within and between people, and rose with the mouth open.
  The tile prints that beside every answer.
- **The S/F ceiling travels with it.** The same table says SpO2:FiO2 is not valid above an SpO2 of
  97%, and the tile repeats it, because the estimate's usual next stop is `sf-ratio`.
- **A flow whose estimate passes 1.0 is refused, not clamped** (26 L/min is the last that computes).
  On heated high-flow oxygen the device sets the FiO2, and the refusal says to use that.
- A mask, a Venturi device, or a high-flow system sets or delivers its own FiO2; the tile is nasal
  oxygen only.

## Tests

`test/unit/nasal-o2-fio2.test.js`: the formula at 1, 3 and 6 L/min, the two printed caveats, the
refusal above 1.0 (and 26 L/min still computing), and blank, zero, negative and non-numeric flows.
