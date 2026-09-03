# spec-v1014 — The second wave, where the empty form reached a decision

## The finding

spec-v1013 fixed the arithmetic tiles that printed a zero. Reading the same catalog sweep to the
end — it had printed only the first 60 of 163 flagged tiles — turned up eight more, and these did
not stop at a number. They reached a **decision**:

| Tile | With nothing entered |
| --- | --- |
| `centor` | a blank age earned the McIsaac under-15 point, pushing the band toward *"consider empiric or test"* — an antibiotic decision |
| `psi` | *"PSI 20 - Class II (outpatient)"* — a decision to send someone home |
| `peds-ett` | *"Tube size: 4 mm internal diameter / Depth of insertion: 12 cm at the lip"* |
| `oxytocin-titration` | *"Ordered dose → pump rate: 0 mL/hr"* |
| `electrolyte-replacement` | *"K: 80 mEq"*, with an infusion rate and a recheck interval |
| `anc` | *"0 cells/uL / Severe neutropenia (CTCAE grade 4) / Neutropenic precautions; fever in this range is an emergency"* |
| `urine-anion-gap` | *"Positive UAG: impaired renal ammonium excretion (renal tubular acidosis)"* — a diagnosis from three blank labs |
| `qbl-pph` | *"0 mL / Below the postpartum-hemorrhage threshold"* |

## The one that had already been fixed

`psi` is the sharpest lesson in the set. Its library has refused a missing age **since spec-v931**,
and says why in the code: *"PSI has no meaning without an age — it IS the largest term — so a
missing one refuses rather than scoring."*

The refusal never fired, because the renderer read the field with `nv()`. `Number('')` is `0`, so
the library was handed a newborn, not a gap. This is exactly the trap spec-v1006 named when it
found the same thing in four other renderers and wrote it down as still open. **A library guard is
only as good as the reader in front of it.**

## Where the line falls, again

`centor` keeps its Centor score and withholds only the McIsaac line. Its four criteria are
checkboxes, and an unchecked box is an answer: a patient with no exudate, no adenopathy, no fever
and a cough really does score 0. Only the age is a measurement, and only the age-dependent half
waits for it.

`magnesium-replacement` was looked at and deliberately left alone: its dose follows the severity
band a clinician picks from a list, not the serum level, so an unentered level does not fabricate
the dose.

## Proof

`test/integration/no-answer-from-nothing.spec.js` now covers 22 tiles across both waves, each
cleared the way a reader clears a form, plus the `centor` split (Centor still scores, McIsaac
waits) and the round trip proving a filled form still answers.

## Left open

The sweep's remaining flags are mostly legitimate — checklist instruments where nobody has ticked
anything really do score 0 — and a handful of score-shaped tiles (`harvey-bradshaw`, `scorad`,
`rosendaal-ttr`, `snappe-ii`, `slums`) that belong to the spec-v1006 family, one judgment at a
time.

One thing the sweep surfaced that is not this defect at all: dozens of tiles refuse out-of-range
input in the words of a stack trace — *"weightKg out of range [0.3, 500]"*, *"gcs: GCS must be
3-15"*. They are refusing correctly and saying so in a language no nurse writes. That is a copy
defect and wants its own pass.
