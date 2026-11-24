# spec-v1777 — The caps nobody declared

> Status: **SHIPPED (2026-11-23)**: 285 caps declared, 9 declarations corrected, 2 finders added, 1 gate
> added. No tool's arithmetic changed; the catalog stays 2,390.

[spec-v1646](spec-v1646.md) settled where a field's range lives. A field whose label states its range
declares it, the declaration rides on the adapter descriptor as `min`/`max`, `mcp/fields.js` turns it into
`minimum`/`maximum` in the input schema, and a value past it is refused with `OUT_OF_RANGE` before the
library runs. [spec-v1744](spec-v1744.md) added the probe that keeps those declarations honest in the one
direction anyone had thought to ask about: the library must not ANSWER past a declared edge, because the
page calls the library directly and would then answer what the agent was refused.

Nobody had asked the opposite question. **How many fields have a cap the library enforces with nothing
declaring it at all?** 1,292 of them. An agent reads `describe_calculator`, is told the input is a number
and nothing more, sends a child's weight of 160 kg to the pediatric quick-dose panel, and is refused by a
sentence it had no way to anticipate. 285 of those caps are now declared, and the two finders that found
them are committed.

## 1. The finder, and the four reasons a cap must not simply be copied

`scripts/probe-undeclared-cap.mjs` starts from each tool's own worked example, walks the value outward by
decades until a refusal whose message is a range sentence appears, bisects to the edge, and requires the
refusal to still hold ten times further out so a band-specific complaint cannot pass for a ceiling. Reach:
2,346 tools with a computable worked example, 3,545 free numeric fields driven, 2,366 of which enforce a cap
at all.

A found cap is not automatically declarable, and four of the report's five sections are the reasons why.
Each one was a wrong first draft of this finder before it was a section:

| Section | Why the cap cannot be copied onto the descriptor | Rows |
|---|---|---|
| ENVELOPE | Both edges are one of the 45 `lib/bounds.js` envelopes, to the decimal. A descriptor holds a literal, and specs v1762-v1765 widened four envelopes past values verified in survivors and then spent three specs chasing the narrower copies left behind in libraries. Freezing 435 more copies into the agent descriptors rebuilds that problem on the agent side. | 435 |
| UNIT-TOGGLED | A unit select rescales the field, so a static bound would be applied to whatever unit the caller chose and refuse 160 lb against a cap meant for kilograms. Where such a field is already declared the declaration is the UNION of its units: `wasting-classify` reads MUAC as 8 to 250, which is 8 cm through 250 mm. | 99 |
| VARIES | The cap moved when another input moved, so it is not a property of this field alone. DHI's "Yes" and "Sometimes" answers share a budget of 25. | 81 |
| DISAGREES | A range is declared and the library enforces a different one. **Zero** — every one of the catalog's declarations agrees with its library. | 0 |
| DECLARABLE | A stable, unit-free cap the library already enforces. | 1,292 → 1,004 |

The envelope section had to be decided on the **numbers**, not on the refusal sentence. Libraries restate an
envelope in their own words as often as they pass it through `inputFault()` -- "The weight must be between
0.2 and 500 kg" is `BOUNDS.weightKg` to the decimal -- and the sentence-matching first draft let three such
copies through into a batch of declarations before the numeric check caught them.

## 2. The 285 declared, and the four that the worked example lied about

Batch one is the two-sided caps on required fields: 298 proved, each edge re-asked by computation (the edge
accepted, a value a millionth past it refused) before anything was written. 286 were written; the rest
already had a bound or sit in a descriptor spread over several lines.

Proving an edge **at the worked example is not enough**, and this is the trap worth remembering. A cap
written inside one branch of a library is invisible to a single configuration:

| Tool | The declaration proved at the example | What a second configuration showed |
|---|---|---|
| `chemo-dose-verify` | weight 0.4 to 400 kg | with the basis set to a carboplatin AUC target, the weight is never bounds-checked, and the page answers at 420 kg |
| `mfp-refund-check` | quantity 0.001 to 1,000,000 units | for a drug with no negotiated price yet, the quantity is never reached, and the page answers at any quantity |
| `light-criteria` | serum LDH 0.03 to 100,000 IU/L | the refusal is about the LDH RATIO, so the floor moves with the pleural LDH |
| `qbl-pph` | weighed pads 100 to 20,000 g | the floor is the dry tare weight, which is another field |

All four were reverted, leaving **285**. `scripts/probe-declared-cap-configs.mjs` is the check that found
them, and it is committed: it drives every declared bound with each other number field at half and twice its
example value and each enum field at every option it lists, and reports the configurations where the library
answers past the declaration. It reaches 877 declared fields in 7,499 configurations, and after this batch it
reports **329 configurations across 26 fields, none of them declared here** -- the backlog the
single-configuration probe could never have seen. Those 26 are left read but unfixed: each one is the
question of whether the declaration is too tight for the branches that ignore the field, or whether a branch
that ignores it should be answering from a value that far out at all.

Fields declaring a range: **609 → 894**. `probe-adapter-only-bounds` now checks 1,767 declared bound edges
instead of 1,197, and still reports the same two pre-existing rows.

## 3. Nine declarations that were wrong, and the exclusive edge

`test/unit/declared-cap-honest.test.js` is the third side of the promise: the library must ACCEPT the edge a
declaration allows. A declaration looser than the library is the agent-side half of
[spec-v1743](spec-v1743.md)'s divergence -- the value passes the schema and is then turned away. Sixteen
fields failed it, and four of them only after the test learned that a thrown range message is a refusal too:
the A-a gradient, its suite and the P/F ratio all THROW "fio2 must be between 0.21 and 1" rather than
returning it, so a `catch {}` that dropped the message hid them.

| Fixed | Was | Now |
|---|---|---|
| `aa-gradient`, `aa-pf-suite`, `hacor`, `lis-murray` FiO2 | declared 0 to 1; the library starts at 0.21 | 0.21 to 1, and the label says so |
| `pf-ratio` FiO2 | declared 0 to 1; the library starts at 0.01 | 0.01 to 1, and the label says so |
| `fagan-post-test` pre-test probability | declared 0 to 100 inclusive; the label already read "(0-100, exclusive)" | `exclusiveMin` and `exclusiveMax` |
| `pk-suite` bioavailability F, salt factor S | declared from 0; the library says "between 0 (exclusive) and 1" | `exclusiveMin` |
| `rox` FiO2 | declared from 0; the library requires `f > 0` | `exclusiveMin` |

`exclusiveMin` / `exclusiveMax` are new on the descriptor. They reach the input schema as JSON Schema's
`exclusiveMinimum` / `exclusiveMaximum`, and the refusal sentence names the edge, so "must be from 0 to 1"
can no longer be read as permitting the 0 the library turns away.

Six rows are judged in the test's ledger rather than fixed, each for a reason the descriptor cannot express:
two share a budget with a sibling field (DHI), three are the union of the units the field accepts
(`wasting-classify` MUAC, `newborn-temperature-who` in °C and °F, `newborn-hypoglycemia-who` in mmol/L and
mg/dL), and one is a refusal about the OUTPUT -- `corrected-potassium-ph` accepts a pH of 6.3, but at the
example's potassium of 5.4 the corrected value it computes leaves its own envelope. A judged row must still
be reachable, so a ledger entry cannot outlive the field it excuses.

## What is left

* 1,004 declarable caps, batch two onward: the one-sided caps, and the two-sided ones on optional fields.
* The 26 fields `probe-declared-cap-configs.mjs` reports, each needing the branch read.
* A declaration that can NAME an envelope instead of restating it would unblock the 435 envelope rows and
  the 99 unit-toggled ones in one move. Today the descriptor holds only literals.
* `data/fields/` carries each field's label, kind, unit and required flag, and not its range. The range is in
  the input schema, so an agent reading the field index sees less than one calling `describe_calculator`.
* `corrected-potassium-ph` refuses a pH by naming `kcorr`, a quantity the reader never entered and a word
  from no vocabulary of theirs.
* Writing 285 caps down made something visible that was not before: the same quantity carries different
  floors in different tools. Arterial saturation is declared 50 to 100 on `integrative-weaning-index` and 1
  to 100 on `shunt-fraction` and `cao2-do2`; FiO2 as a fraction starts at 0.21 in four tools and 0.01 in the
  P/F ratio. Each is its
  own library's guard and each is now stated, which is what makes the disagreement a question anyone can
  read. `probe-helper-behaviour-drift` is the finder that should be asking it.
