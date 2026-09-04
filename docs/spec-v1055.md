# spec-v1055 — One rule, two copies, already drifted

Two sweeps ask the same question of every calculator that ships a worked example: **does what it
produces carry the numbers its `expected` string documents?** One asks it of the browser
(`test/integration/example-correctness.spec.js`), the other of the agent surface
(`test/mcp/mcp-compute.test.js`).

Each had its own copy of the extractor and the tolerance rule. The copies had drifted.

## What the drift cost

**spec-v1023's rule never reached the agent side.** A digit glued to a letter is part of a *label* —
`T1` is a trimester, `G2` a GOLD grade, `S3` a heart sound. The browser learned that; the MCP copy
did not, so it was asserting that `sugammadex`'s result must contain a number near **2** because its
example names the train-of-four count **"T2"**.

**Neither knew about units.** `bsa`'s example reads *"Du Bois ~1.85 m^2; Mosteller ~1.84 m^2"* — and
both sweeps read two extra facts of **2** out of the `m^2`. Same for the 2 in `cmH2O`.

Neither drift ever broke a build, and that is the point: **a spurious fact is usually satisfied by
some real number in the output.** The checks were quietly asserting less than they looked like they
asserted, and nothing said so.

I found it while measuring whether spec-v1048's distinct-matching rule could be applied to the agent
surface too. Eight calculators newly failed — and every one was a phantom fact from a unit or a
label, not a defect.

## The change

`test/lib/numeric-facts.js` is the single definition: extraction (years, labels and units skipped),
the tolerance window, loose matching, and the distinct matching spec-v1048 introduced. Both sweeps
import it. `test/unit/numeric-facts.test.js` pins each rule, including the case that separates a
matching from a greedy search.

**Matching stays loose on the agent surface, deliberately.** The browser reads rendered prose, where
a number stated twice is two pieces of text; the MCP round-trip reads a JSON result object, where a
conversion legitimately states one value once — `oxytocin-titration`'s *"6 mU/min = 6 mL/hr"* is two
mentions of one field. Requiring distinctness there would fail correct tiles.

## The rule

**A rule that two callers each implement is a rule with two behaviours.** The divergence here was
invisible for as long as it existed, because the weaker copy still passed — which is the failure
mode that makes duplicated validation worth removing even when both copies "work".
