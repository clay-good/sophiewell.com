# What a tool does with a value it was not given

One defect class, worked from one end to the other between spec-v1006 and spec-v1035. This page is
the map; each spec is the detail.

## The defect

`Number('')` is `0`. Every renderer that reads a field with `Number(input.value)` therefore hands a
formula a *measurement of zero* where the reader left a gap — and a calculator that treats a gap as
a zero answers questions nobody asked it. Thirty-five tools did, and the answers were not harmless:

> "LRINEC 0: low risk of necrotizing fasciitis" — with no labs entered
> "IBW (Devine): 50.0 kg" — the formula's constant, from a blank height
> "RhIG dose: 1 standard 300 µg vial(s)" — from a Kleihauer-Betke nobody ran
> "MELD-3.0: 20 — High; Child-Pugh: 8 — Class B" — from five cleared labs
> "Remaining to ceiling: 4000 mg" — acetaminophen headroom nobody had measured
> "PSI 20 — Class II (outpatient)" — a decision to send someone home

## The rules that came out of it

Stated in full in [product-decisions.md](product-decisions.md); in one line each:

1. **A blank field is a gap, not a zero.** A typed `0` still means zero.
2. **A calculation with no inputs is not a result of zero.** Ask for what is missing, by the names
   on the labels.
3. **An incomplete score may rule in; it must never rule out.** These scores are monotone, so a
   partial total is a bound — and *which* reading is the reassuring one depends on which direction
   the scale runs (SLUMS and NIHSS refuse opposite readings for the same reason).
4. **A checkbox is an answer; a blank measurement is a gap.** Only the measurements withhold, and
   only the reading they could change.
5. **A value that IS given, but impossible, is named above the answer** — the range its field
   declares, or the billion no quantity here reaches.
6. **An alarm from nothing is not the safe direction** (spec-v1036). "May rule in, never rule out"
   says which direction is *safer*, not that the alarming answer may be invented.
7. **A guard against a missing value is a guard against one SHAPE of missing value** (spec-v1040).
   `Number('')` and `Number(null)` are both 0; when a renderer changes which one it sends, every
   guard downstream is guarding against the old shape until someone checks.
8. **A control that cannot express "not answered" will be read as an answer** (spec-v1047). A slider
   sits at its minimum and looks like a rating somebody made. Where the value matters, being empty
   has to be possible — a constraint on the input, not only on the reader.

## The specs

| Spec | What it fixed |
| --- | --- |
| [v1006](spec-v1006.md) | The rule, and the first seven scores that ruled out |
| [v1007](spec-v1007.md) | Eight more, where measurements mix with checklist criteria |
| [v1008](spec-v1008.md) | A form holding your number and four of ours, saying nothing |
| [v1009](spec-v1009.md) | A transposed digit got a confident answer |
| [v1010](spec-v1010.md) | 195 bounds the site already knew, applied where missing |
| [v1011](spec-v1011.md) | A percentage is bounded by what it is a percentage of |
| [v1012](spec-v1012.md) | A gate that passed while 87 calculators stated an impossible number |
| [v1013](spec-v1013.md) | Fourteen arithmetic tiles answering an empty form |
| [v1014](spec-v1014.md) | Eight more, where the empty form reached a decision |
| [v1015](spec-v1015.md) | Refusals written in the words of a stack trace |
| [v1016](spec-v1016.md) | The score-shaped remainder, and the rule inverted |
| [v1017](spec-v1017.md) | Five more, and the other half of the stack-trace fix |
| [v1018](spec-v1018.md) | A reading measured from "now", and a comparison made on the wrong day |
| [v1019](spec-v1019.md) | **Gate**: no new calculator answers an empty form |
| [v1020](spec-v1020.md) | One value, not none — the likelier case |
| [v1021](spec-v1021.md) | Two refusals that reached agents as answers |
| [v1022](spec-v1022.md) | The warning broke this project's own accessibility rule |
| [v1023](spec-v1023.md) | An exemption granted for one number covered a whole sentence |
| [v1024](spec-v1024.md) | **Gate**: no calculator silently answers from the clock |
| [v1025](spec-v1025.md) | The browser had no idea which fields were required |
| [v1026](spec-v1026.md) | The sweep read each answer before it had finished rendering |
| [v1027](spec-v1027.md) | The warning's permanence broke three suites about its neighbours |
| [v1028](spec-v1028.md) | Two withdrawal scales opened already scored |
| [v1029](spec-v1029.md) | What the empty-form ledger was hiding: five scores with a measurement inside |
| [v1032](spec-v1032.md) | The impossible-number guard was reading the wrong live region |
| [v1036](spec-v1036.md) | An alarm from nothing is not the safe direction |
| [v1037](spec-v1037.md) | **Gate**: the browser answers nothing the agent surface refuses |
| [v1038](spec-v1038.md) | Thirteen more: doses of zero, age bands chosen by a blank, not-met vs not-measured |
| [v1039](spec-v1039.md) | The sweep almost learned to ignore its own defect |
| [v1040](spec-v1040.md) | `Number(null)` is 0, and five guards had stopped firing because of it |
| [v1041](spec-v1041.md) | Five more, and a gate that caught the trap inside the fix for the trap |
| [v1042](spec-v1042.md) | The instrument that is one number |
| [v1043](spec-v1043.md) | Two more, and a ledger that says why |
| [v1044](spec-v1044.md) | Nine rating scales that did not say how many items they scored |
| [v1045](spec-v1045.md) | The panel that refused what it could answer |
| [v1046](spec-v1046.md) | Money from a blank field, and a note that fooled the gate |
| [v1047](spec-v1047.md) | The sibling that needed a different control |
| [v1063](spec-v1063.md) | The field a reader leaves blank, on a form that otherwise looks complete |
| [v1064](spec-v1064.md) | Seven more, and the unit-field reader every earlier wave walked past |
| [v1065](spec-v1065.md) | Eight more, a third half-fix, and the calculators that were right all along |
| [v1066](spec-v1066.md) | Not met, or not measured: the third state a criteria count was missing |
| [v1067](spec-v1067.md) | The gate, keyed by field, and the ledger that was quiet because I guessed at it |
| [v1071](spec-v1071.md) | The answer refused; the "show your work" panel below it did not |

### And the same question from the other side

A tile can refuse a blank field correctly and still *display* a rule-out, because its worked example
says nothing. Forty-seven shipped an example of every field at zero, so the tile opened on its most
reassuring band — "Rule out SAH", "CT not recommended", "no pain", "low bleed risk" — before anyone
had described a patient.

| Spec | What it fixed |
| --- | --- |
| [v1031](spec-v1031.md) | The nine highest-stakes rule-outs |
| [v1033](spec-v1033.md) | Nine bedside pain, delirium and withdrawal scales |
| [v1034](spec-v1034.md) | Ten bleeding, clotting and severity scores |
| [v1035](spec-v1035.md) | The last sixteen, and the three left all-zero on purpose |

## What holds it now

| Gate | Asks | Cost |
| --- | --- | --- |
| `no-answer-from-nothing-sweep.spec.js` | does any calculator answer a cleared form? | 15 s |
| `clock-dependent.spec.js` | does any calculator answer differently a year later, from the same inputs? | 1.3 min |
| `no-answer-from-nothing.spec.js` | do the 40 fixed calculators still refuse, and still answer when filled? | 49 s |
| `declared-ranges.spec.js` | is an out-of-range value named, above the answer and tied to its field? | 12 s |
| `required-field-agreement.spec.js` | does the browser answer a question the agent surface refuses? | 28 s |
| `no-impossible-number.spec.js` | does any tile state NaN, Infinity or an unexplained exponent? | 1.6 min |
| `one-blank-field.spec.js` | with a calculator filled from its example, does clearing ONE measurement change the answer without asking for it or disclosing it? | 1.6 min |
| `derivation-agrees.spec.js` | when a calculator refuses, does the "show your work" panel below still display the calculation? | 13 s |

Each has a ledger for the tiles that legitimately do the thing it looks for, and each was verified
by reintroducing the defect and watching it fail.

## What is still open

- ~~**A form with one value in it** has no gate.~~ **Closed by spec-v1037**: the oracle turned out to
  be already in the repo. `mcp/fields.js` marks inputs `required`, so the sweep clears exactly one of
  those and leaves the worked example everywhere else — no "does this read reassuringly?" heuristic
  needed.
- **The ledger exempts a tile, and the judgment behind it was per field.** spec-v1029 found five
  scores whose checkbox exemption was covering a measurement too; eleven more ledger entries read a
  number and were judged legitimate one at a time. A tile-level exemption cannot express "these
  seven fields are criteria and that one is a measurement", and nothing checks that it was ever
  asked field by field.
- ~~**Two ledgers make different claims.**~~ **Drained**: seventy-five calculators answered without a
  field the agent surface calls required (spec-v1037); sixty-one are fixed across spec-v1037 to
  spec-v1047, and the fifteen still carried in `required-field-ledger.js` are all category 3 — a tile
  answering about what was actually entered, and saying so.
- ~~**`example-correctness` matches numbers loosely.**~~ **Closed by spec-v1048**: each documented
  number must now have a number of its *own* in the output. It found a tile whose documented "2%
  mortality" was being satisfied by the "2" of its own score, while the tile printed "<1%".

What is left is narrower than when this page was written:

- ~~**A ledger exempts a TILE, and the judgment behind it is per FIELD.**~~ **Closed by spec-v1067.**
  Its gate fills each calculator from its own example and clears ONE field, so the question is asked
  per field by construction, and its ledger is keyed `tileId|fieldId` — exempting one field leaves
  every other field on that calculator guarded. Twenty-eight were fixed by hand over the four waves
  that preceded it; the gate now holds the rest.
- **A guard on one field silences the all-fields sweeps for every other field on that tile.** The
  two that an earlier wave half-fixed kept a live defect for weeks afterwards: `carb-insulin-bolus`
  dosed insulin from a blank target glucose, and `bhutani-bilirubin` read a blank bilirubin as low
  risk. Guard every measurement a tile reads, not the one the sweep pointed at.
- **146 coercion helpers cannot tell a blank from a zero** (`scripts/probe-blank-coercions.mjs`).
  Most are harmless; which ones are not depends on what their renderer sends, so the report is a
  reading aid rather than a gate (spec-v1040).

## Probes measured and rejected

Three questions asked of the whole catalog after spec-v1048, each of which sounded like it should
find something and did not. Recorded so they are not re-run.

| Question | Result |
| --- | --- |
| Does any tile print a **percentage its own interpretation table contradicts**? | 23 suspects, **zero defects**. The rule cannot tell a computed value from a threshold — `navy-body-fat` states 11.1% body fat against a table of category cut-offs. What made `ranson-bisap` findable was that its answer quoted a band *label*, which `example-correctness` now catches. |
| Does any tile's documented `expected` assert the **opposite verdict** to what it renders — "low risk" against "high risk", "not indicated" against "indicated"? | **Zero clashes** across all 1,699 examples. |
| Does the **clipboard** carry a number the tile is not showing? | **Zero**. Every calculator that offers a copy button was checked — about eight in ten of them. |

The third is worth keeping in mind rather than repeating: what a tile puts on the clipboard is what
gets pasted into a chart, and it currently matches the screen everywhere it offers one.
