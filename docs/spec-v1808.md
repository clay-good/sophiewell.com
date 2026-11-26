# spec-v1808 — A refusal the page would not show

> Status: **SHIPPED (2026-11-26)**: 19 more fields stop answering a value the reader entered with "Enter
> it", taking the strong category from **68 to 49**. The wave broke renderability on 13 tiles on the way,
> and the gate that owns that invariant said so. No tool's arithmetic changed; the catalog stays 2,390.

The third wave takes the shape the codemod could not: a function that **destructures its parameter**, so
there is no `o` for a generated `o.field` to read. The destructured name is the adapter's `arg` in these
libraries, so the generator emits the bare local — and only the ones the signature actually declares, so a
field it cannot see is skipped rather than invented.

Three libraries take a third form, `function f(input = {})` with no `o` alias at all, and read
`input.field` directly. Those references are written that way.

## The refusal the page would not show

Then the suite failed in a way worth the whole spec. `probe-refusal-unrendered` — gated at zero three specs
ago — reported **13 actionable tiles**:

> `hemodynamic-suite` [group-v13.js / hemodynamicSuite] — renderer prints `r.band`, and 1 of 7 refusal(s) do
> not set it

Every generated block returned `{ valid: false, message }`. That is correct for the agent surface and
**invisible on the page**, because these renderers print `r.band`. A reader would have typed an impossible
value and seen nothing at all — which is worse than the defect being fixed.

The fix is to make each block return the keys its **own function's other refusals** return: `band` where
the function sets one, `message` always, and the function's own `note` constant where its refusals carry
one. 24 returns rewritten, and the finder is back to zero.

That is the third time in three specs that a mechanical change was caught by a gate owning an invariant the
change was not thinking about — `probe-unsupplied-input` twice for a misplaced block, and now this one. The
general form is worth stating: **a codemod needs the gates more than hand-written code does, because it
applies one author's assumption to a hundred call sites at once.**

## A test that documented the defect

`test/unit/envelope-queue-drained.test.js` had this, in a spec written to add `sokal-cml`'s age ceiling:

```js
// A negative age was already caught, by the completeness guard above this one,
// and keeps that sentence -- the new check is on the ceiling nobody held.
assert.match(sokalCml({ ...ok, age: -1 }).band, /^Enter age \(years\)/);
```

The comment is accurate and the behavior it pins is the defect [spec-v1723](spec-v1723.md) named: a negative
age kept the sentence that asks for an age. It was pinned because that spec was about the **ceiling**, and
the floor was somebody else's problem — which is the half-guarded shape `probe-half-guarded` exists to find,
showing up in a test rather than a library. A negative age is told its floor now, the ceiling is still the
envelope's, and the test asserts both.
