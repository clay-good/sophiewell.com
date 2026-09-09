# spec-v1168 — one kind, two spellings, 698 checkboxes published as free text

`mcp/fields.js` has always recognised the field kind `bool`. Adapters have always
also written `boolean`. Every branch in that file is a `=== 'bool'` test, so the
`boolean` fields fell through to the string default:

| tile / field | kind | published schema |
| --- | --- | --- |
| `chads` / `chf` | `bool` | `{"type":"boolean"}` |
| `migraine-ichd3` / `mig-unilateral` | `boolean` | **`{"type":"string","maxLength":2048}`** |

**698 checkbox fields were described to agents as free text.** Their values were
never validated as boolean-like, and `toArgs` coerced them with `String(raw)`
instead of `toBool`.

## Why nothing was visibly broken

The libraries coerce with their own allow-list helpers — `onFlag(v)` is
`v === true || v === 'yes' || v === 'on' || v === 1 || v === '1'` — so the string
`"false"` lands as false rather than as a truthy string. That is defence, and it is
why this survived: **scoring was right while the contract was wrong.**

## It was found before, and deferred

[spec-v753](spec-v753.md) found it at **90 fields** and wrote, in
`scripts/build-field-index.mjs`:

> That mismatch is a pre-existing schema-accuracy bug in the agent contract … The
> index is not the place to fix it, but it IS the place to stop it spreading:
> normalize on the way in, so the extractor sees one spelling.

It did not stop it spreading. **90 → 698**, because normalising in one consumer does
not reach the author of the next adapter. Normalising a downstream copy treats the
symptom in that copy and nothing else.

So it is normalised at the contract now — once, in `mcp/catalog.js`, before
`fieldSchema`, `makeToArgs`, `validateInputs`, and before `fields` reaches any probe
or sweep. And an **unknown** kind is a registry error rather than a silent
fall-through to string, so a third spelling cannot appear quietly.

`{"bool": 3076, "number": 3544, "enum": 2360, "string": 59}` — one spelling.

## What that switched on, and the filter it made honest

Five downstream filters test `kind === 'bool'` and were half-blind: the numeric arm
of `probe-omitted-field-decides`, `probe-message-promises`,
`probe-missing-list-reach`, `partial-answer-safety.spec.js`, and `mcp-fuzz`.

**Including one I wrote this session.** [spec-v1142](spec-v1142.md) added the numeric
arm with a `kind !== 'boolean'` filter, negative-tested it, found it excluded
nothing, switched it to `'bool'` — and never asked whether *both* existed. The
negative test proved the filter now bit; it could not prove it bit everywhere.

`probe-missing-list-reach` shows the cost exactly. Its four rows were
`bickerstaff`'s supportive anti-GQ1b antibody (`bool`) and three ICHD-3 headache
tiles' criteria (`boolean`) — **a single-spelling rule-4 skip would have caught one
and missed three.** With one spelling, the skip is correct and the probe reports
zero.

**A filter is only as good as the vocabulary of the thing it filters.** Count the
values before trusting the test.
