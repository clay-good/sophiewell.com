# spec-v1138 — the shortest interval in an aspiration-risk table

Two more from the [spec-v1136](spec-v1136.md) list, and both are the same
sentence: *the fallback is the most permissive row.*

## `preop-fasting`

```js
const intake = oneOf(INTAKES, o.lastIntake, 'clear-liquid');
```

Clear liquids is the **shortest** of the five intervals — two hours, against four
for breast milk, six for formula or a light meal, eight for anything fried or
fatty. So a form that did not say what was last taken read:

> 3 hours since clear liquids, against a minimum of 2. **The interval is met**, by
> 1 hour.

The same three hours is short by one after breast milk and short by five after a
fatty meal. The reading names the assumption — and naming it does not make it
true, because it is a statement about what this patient ate (rule 11), not about
the tool's own workings.

**Scoped to where it decides** (rule 25). The intake matters only between the
shortest interval and the longest:

| Elapsed | Without the intake |
| --- | --- |
| ≥ 8 h | answers — *every interval in the table is met, whatever was last taken* |
| 2–8 h | **asks**, and says which rows are met and which are not at this hour |
| < 2 h | answers — *no interval in the table is met, whatever was last taken* |

The `bandLabel` needed the same treatment: it read `2 hour minimum`, which is the
clear-liquid assumption arriving by a side door.

## `nen-who-grade`

```js
const differentiation = ... ? 'well' : String(o.differentiation).trim();
```

Well versus poor is **not a grade on a scale**. Well differentiated is a
neuroendocrine *tumor*, graded G1 to G3 on its Ki-67 index and mitotic count;
poorly differentiated is a neuroendocrine *carcinoma*, high grade by definition
and treated differently. The default answered the question the pathologist asks
first, from the indices, which do not decide it.

There is no floor to report here and nothing partial to say — NEC is not a higher
grade of NET — so it asks, and the agent surface marks the field required.

## Seven tests, and what each of them was for

Both fixes failed pre-existing tests, and the two kinds are worth separating.

**One asserted the defect**, exactly as [spec-v1134](spec-v1134.md)'s two did:

```js
assert.equal(f({ lastIntake: 'made-up' }).lastIntake, 'clear-liquid');
```

The shortest interval in an aspiration-risk table, written down as the expected
result for an unrecognised value. Rewritten: an unknown intake is unstated.

**Six did not.** The `nen-who-grade` grading tests omitted the differentiation
because their subject is the index thresholds — `ki67: 3` is G2, `mitoses: 21` is
G3 — and the field was incidental to what they were checking. Those got
`differentiation: 'well'` added and a note saying why.

**The distinction is worth making before rewriting anything:** a test that fails
because it *relied* on the default is a test to update; a test that fails because
it *asserted* the default is a defect that had a green tick. Only the second kind
tells you something.
