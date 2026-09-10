# spec-v1204 — the guard it already had, on the field beside it

`scripts/probe-unguarded-sibling.mjs` asks whether a module's own guard reached
its neighbours. This is the same question **one level further in**: whether it
reached the fields of the function it was written for.

## `sokal-cml`

[spec-v1180](spec-v1180.md) guarded the platelet count here, and the comment it
left says why:

> the platelet term is `(plt/700)^2` INSIDE an `exp()`, so a count in the units a
> US report prints — 20,000/µL for what this field wants as 20 — gives
> `exp(153)`, which is 3.95e+66.

Four numbers go into these formulas. One was guarded.

ELTS **cubes** the age — `0.0025 * (age/10) ** 3` — so an age of a million came
back as:

```
ELTS 2500000000001.58 (high risk)
```

and the Sokal line was **gone from the reading**. `Math.exp` of that age overflows
to `Infinity`, and a `Number.isFinite` check three lines down replaced it with
`null` without a word. Half the answer missing, the other half absurd, and the
whole thing reported as valid.

The envelope and the sentence are `lib/bounds.js`'s, and `ipssrMds` in this same
module already uses them. Nothing clinical is decided here: 130 years is the
table's figure, against a verified human maximum of about 122.

A negative age was already caught by the completeness guard above, and keeps that
sentence — the new check is on the ceiling nobody held.

## The test that said so out loud

```js
test('extreme age does not leak a non-finite Sokal', () => {
  const r = sokalCml({ age: 1e9, spleen: 5, platelets: 300, blasts: 2 });
  // Sokal overflows -> null; ELTS still finite, so the result stays valid.
  assert.equal(r.sokal, null);
```

The comment is the defect, written down as the expectation. The property it was
guarding is real — a non-finite Sokal must never reach the reader — so it is split
in two: an extreme age is refused with the range named and **neither** index
reported, and both indices are still finite at **130**, the top of the envelope,
which is where that property can still be asserted.

Ninth test in this run recording the behaviour being fixed.

## Not fixed, and why

`refeeding-risk` was the other row worth opening. A body-mass index of 9999 still
answers, and it moves in the **reassuring** direction: a BMI under 18.5 is one of
NICE's minor criteria, so an impossible one removes a criterion rather than adding
it.

`lib/bounds.js` declares no BMI envelope, and choosing one is a clinical judgment
— which [spec-v1189](spec-v1189.md)'s rule reserves for a source, not for a wave.
The honest next step there is to add `bmi` to the table with a citation, and that
is a different kind of change from this one.

`sokal-cml`'s spleen size and blast percentage are in the same position.

## Proof

`probe-unguarded-sibling` reads **7 modules, 13 functions → 7 modules, 12
functions**. Lint, 13,500 unit tests, 448 MCP tests and four browser sweeps pass.
