# spec-v1797 — A borrowed envelope is an obfuscated literal

> Status: **SHIPPED (2026-11-25)**: all 163 borrowed envelope declarations are gone, every published range
> is byte-identical to before, and `probe-borrowed-envelope` is a gate at zero. No tool's arithmetic
> changed; the catalog stays 2,390.

[spec-v1796](spec-v1796.md) built the finder and reported 163 of 773 envelope declarations naming a quantity
the field is not. The obvious reading was that 163 published ranges were **wrong**, and the work ahead was
163 clinical judgments about what each field's range should be.

The measurement says otherwise, and it is the whole of this spec. Driving each of the 163 fields to the edge
the library actually enforces — the method `probe-undeclared-cap` uses, with the stability sweep of
[spec-v1793](spec-v1793.md) — gives a stable range for **all 163**, and in every case it is the range the
borrowed envelope was already publishing:

| Field | Declared | Publishes | The library enforces |
|---|---|---|---|
| `adult-appendicitis-score` CRP | `hcg` × 0.01 | 0 to 100,000 | **0 to 100,000** |
| `urine-osmolal-gap` urine sodium | `platelets` × 0.1 | 0 to 400 | **0 to 400** |
| `sdai-ra` CRP | `lactate` | 0 to 50 | **0 to 50** |
| `fibromyalgia-acr-2016` pain regions | `lactate` × 0.1 | 0 to 5 | **0 to 5** |

The `boundScale` is what gives it away, and the distribution is the proof: of the 163, **120 carry a scale**
— 44 at 0.01, 43 at 0.1, 31 at 10, two at 100. A scale exists to express one quantity's envelope in another
unit of the same quantity. Here it exists to make an unrelated envelope's ceiling **land on a number the
library already had**. `hcg` is 0 to 10,000,000, so a hundredth of it is 100,000, which is what
`adult-appendicitis-score` guards a CRP with. The declaration is not a wrong range; it is **the right number
written as a sum nobody can read**.

So this is a refactor, not a re-judgment, and it comes with an exact test: replace each
`bound: '<envelope>', boundScale: <n>` with the literal it resolves to, and **every published range must be
byte-identical**. All 5,189 number fields were captured before and compared after: **0 changed**.

## What it buys

Nothing on screen, and three things that matter:

* **The published schema stops lying about provenance.** An agent reading `adult-appendicitis-score` was
  told a CRP is bounded by something to do with serum hCG. Now it is told 0 to 100,000, which is what the
  tool does.
* **163 unrelated fields stop riding on four envelopes.** `BOUNDS.hcg` was the published ceiling for 98
  fields that are not an hCG — a payment limit, a deductible in cents, an OPPS conversion factor, a
  D-dimer, a lymphocyte count. Specs v1762-v1765 widened four envelopes past values verified in survivors;
  the next such widening would have moved all 98 of those ranges with it, silently and for no reason.
* **The ranges become enforceable.** `mcp/fields.js` pre-refuses a **literal** and only documents a named
  envelope ([spec-v1777](spec-v1777.md) explains why: an envelope's refusal belongs to the page, in the
  page's words). A range that is the tool's own has no such claim on the page's wording, so these 163 now
  refuse where the other ~2,300 tool-own declarations do, and `probe-adapter-only-bounds` polices them:
  **0 rows of 4,474 declared bounds.**

## The finder is a gate

`probe-borrowed-envelope` joins `test/unit/finder-ledgers.test.js` the day it was written — twelve finders
now — and it is the only one with **no ledger**. The others carry judged rows because their findings can be
deliberate: a signed quantity that reads negative on purpose, a clamp no surface reaches, an owner decision.
A borrowed envelope is never the right answer. Either the library names the envelope, or the field does, or
the range is the tool's own and belongs in a literal; there is no fourth case to judge.

What the gate accepts is worth stating, because it is the rule going forward: **610 declarations stand, 569
because the library names the envelope in its own source and 41 because the field's own argument, label or
unit names it.** A new `bound:` that satisfies neither now fails the build.
