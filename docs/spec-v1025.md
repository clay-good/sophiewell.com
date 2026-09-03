# spec-v1025 — The browser had no idea which fields were required

## The finding

A different question, aimed at the same defect: the MCP registry marks fields `required`, and
`computeCalculator` refuses a call without them. **1,068 calculators declare at least one.** The
browser has no such contract — a renderer reads whatever is in the box.

Clearing exactly those required fields and asking whether the tile still answered found **44** that
do. Most are the checklist family the empty-form ledger already carries, where nobody ticking
anything really is a score of 0. Four were not:

| Tile | With its required fields cleared |
| --- | --- |
| `aa-gradient` | *"PAO2: 0 mmHg, A-a gradient: 0 mmHg"* |
| `anion-gap-dd` | *"Anion gap: 0 … delta/delta ratio = -0.50, Pure non-AG metabolic acidosis"* |
| `rhig-dose` | *"Estimated fetomaternal hemorrhage: 0.0 mL. RhIG dose: 1 standard 300 µg vial(s)"* |
| `meld-childpugh` | *"MELD-3.0: 20 — High; Child-Pugh: 8 — Class B"* |

`rhig-dose` gives a dose from a Kleihauer-Betke nobody ran. `meld-childpugh` gives a
transplant-priority score and a cirrhosis class from five cleared labs. `anion-gap-dd` names an
acid-base diagnosis.

## The one that shows why sweeps keep finding more

`anion-gap` was guarded at spec-v1013. `anion-gap-dd` — the same three labs, the same formula, one
extra step — was not, because it lives further down the same file and no sweep had asked it this
particular question. **A fix applied to a tile is not applied to its sibling**, and the way to find
the sibling is to ask the catalog rather than to remember.

## Why this question found what the others missed

The empty-form sweep (spec-v1019) skips a tile whose output contains a word a refusal would use.
`aa-gradient` prints *"Input below the plausible range for FiO2"* beside its zeros — an advisory,
not a refusal — and the word "range" was enough to make it look like one. Asking instead "does it
compute without the fields the other surface insists on" has no such blind spot.

## Proof

`test/integration/no-answer-from-nothing.spec.js` now covers 35 tiles across five waves. The
whole-catalog empty-form sweep, the unit suite and the full lint chain pass.

## Left open

The other 40 tiles on that list are in the empty-form ledger as legitimate, but "legitimate to
answer an empty form" and "legitimate to answer without a field the agent surface calls required"
are not the same claim. The second is a stronger statement, and reconciling the two ledgers —
or making the browser honour `required` directly — is its own piece of work.
