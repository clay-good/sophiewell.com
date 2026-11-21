# spec-v1758 — Fields the worked example left blank were never driven

> Status: **SHIPPED (2026-11-21)**: 41 tools, 76 fields. The catalog stays 2,387.

The envelope finder (`scripts/probe-envelope-unbounded.mjs`) and its page twin
(`test/integration/envelope-refused-on-page.spec.js`) drive each field mapped to a `lib/bounds.js` envelope just past
its ceiling, starting from the tool's worked example. A field the example leaves blank was skipped: 103 of them. Filled
with a value inside the envelope and then driven past it, 77 answered.

| Example | Before | Now |
|---|---|---|
| `psi` temperature 67.5 C (also BUN, sodium, glucose, hematocrit, PaO2) | Class IV (admit) | refused, with the range |
| `fick-cardiac-output` heart rate 450 | "Normal cardiac index" | refused |
| `4peps` SpO2 150 | scored | refused |
| `lab-interpret`, 17 analytes (sodium 300, potassium 15 ...) | interpreted | refused; the page shows the refusal alone |
| dosing tools (`iv-iron-course`, `vanc-initial-dose`, `flumazenil-ladder` and 12 more): weight 750 kg, age 195 | a dose | refused |

Most were fields the chosen mode does not read (age entered for an adult vancomycin dose, KFRE's calcium on the
4-variable equation): each lib range-checked a field only inside the branch that uses it. An entered value is now
checked whatever the mode; a blank field stays allowed. Each guard is `boundsAdvisory(key, value)` in the tool's lib.

Found on the way: `berlin-ards` read a blank PaO2 as 0 (`Number(null)`), so FiO2 plus the four criteria graded a
blank as severe ARDS. A blank PaO2 now asks for it. The ABG page reads a blank PaO2 as blank, not 0.

Left, with reasons:

- `hypothermia-rewarm` potassium keeps its own 0-30 mmol/L: its ECPR exclusion fires above 12 mmol/L (ERC 2021,
  Lott 2021), so the serum envelope's 10 would make that branch unreachable. `OWN_RANGE` in
  `scripts/lib/envelope-map.mjs` records it.
- START and JumpSTART apply only the respiratory-rate ceiling: the page reads a blank rate as 0, and apnea is
  entered through "is breathing", not a rate.
- Ireton-Jones's ventilated form still ignores a height of 0 or less (the spontaneous form asks for it).

Tighter than before: spironolactone's eGFR ceiling 250 -> 200; `lab-interpret` BUN below 1 and AST, ALT or
triglycerides of 0 are refused; `sbp-ascitic-fluid` bilirubin above 60 mg/dL (was 100).

Both finders now fill a blank example field (`fillFor` in `scripts/lib/envelope-map.mjs`, shared so they cannot
drift): the agent-side finder tests 1,055 fields (was 954), 0 answering; the page test drives 1,052 (was 928) and
presses a tool's own compute button where it has one (lab-interpret's "Interpret values"). The page run found two
more the agent side could not see: naloxone's page passed the weight only for a child, so an adult's impossible
weight went unchecked (now passed whenever entered), and lab-interpret, which computes only on its button.
Tests: `test/unit/envelope-blank-example-v1758-{a,b,c,d}.test.js`; `lab-interpret.test.js` updated for the floors.
