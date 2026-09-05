# spec-v1075 — the gate that excused itself on one word

[spec-v1074](spec-v1074.md) shipped an assertion: omitting one picklist item must
not silently move the answer. It passed, and it was wrong.

## What it was doing

To decide whether a tile had *said* it was missing something, the gate collected
every string in the result and matched the shared `ASKING` / `DISCLOSING`
vocabulary against the lot. Every string included `note` — the tile's static
explanatory prose, the same sentences on every call, hoisted from a module
constant.

`four-ts-hit`'s note says:

> …and where key information is **missing** the Society advises erring towards a
> higher score rather than…

`missing` is in `ASKING`. So the gate read that sentence, concluded the tile had
asked for something, and excused it — while `four-ts-hit` was scoring an
unanswered domain as zero and taking the 4Ts total from 8 to 6.

`asking-language.js` warns about the near-miss version of this in its own header:
"a tile that says the words and then answers anyway is skipped." The browser
sweeps survive it because they read only the live region. This gate read the
citation and the guidance prose too, which is a far larger surface for a
coincidence — and a gate that reports clean while its defect is live is worse
than no gate at all.

## The fix, and what it found

Skip the top-level `note`. A disclosure has to be in what the tile said **about
these inputs**, not in prose it prints regardless.

That alone surfaced **13 fields the gate had been passing**:

| | |
|---|---|
| `graeb-ivh` (8) | an unread ventricular compartment scored 0; Modified Graeb 32/32 became 27/32 |
| `four-ts-hit` (4) | an unscored domain scored 0; 4Ts 8 became 6, still "high" but on four-fifths of the instrument |
| `ipss\|ipss-qol` | **ledgered** — see below |

Both fixed tiles render every item as a `<select>`, so `required` refuses nothing
a reader can reach.

`ipss-qol` earns its ledger line: the bother question is labelled "optional, not
summed" on the form, and omitting it leaves IPSS 8/35 untouched while the
"Quality of life 2/6" sentence disappears. That is the dependent-line case the
gate already accepts — but it drops in **prose**, and the gate's test for it
looks at numbers, so it needs the line.

## The other half: a select the registry called a bare number

Both value-list gates find their picklists the same way, `Array.isArray(f.values)`
on the adapter field:

- `field-values-match-dom.spec.js` ([spec-v770](spec-v770.md)) keeps a *declared*
  list honest in both directions — it cannot check a field that declares none;
- spec-v1074's assertion refuses a silent move on a picklist item — same lookup.

So a `<select>` the registry describes as `kind: 'number'` with no `values` is
invisible to both. `test/integration/undeclared-picklist-probe.spec.js` asks the
browser directly: **83 fields across 7 calculators.**

Two were accepting numbers their own form does not offer — the `atlas-cdi`
defect spec-v770 was written for, still live:

```
compute_calculator { id: "audit-full", inputs: { …, "af-9": 3.7 } }
  ->  "AUDIT total 13.7: Zone II hazardous use (8-15)"      (item 9 offers 0, 2, 4)
compute_calculator { id: "spadi",      inputs: { …, "spadi-painWorst": 3.7 } }
  ->  "SPADI 43.7, pain 87.4%"                              (items offer 0-10)
```

Both now return `INVALID_TYPE` naming the options. `possum` and `p-possum` also
gained their lists, and they are worth reading: the grade sets are **not
contiguous and not uniform** — age and the white-cell count offer 1/2/4, the ECG,
procedure count and urgency 1/4/8, the other twelve 1/2/4/8. A single
`scaleValues()` would have been wrong for six of the eighteen.

### The one that must not be fixed this way

`cornell-csdd`'s nineteen items offer `("", "a", "0", "1", "2")`, where `a` is
"unable to evaluate" — an answer the instrument defines. A numeric `values` list
would **reject** it, which spec-v770's own header calls the worse of the two
failures: an under-declared list refuses a legal call. It keeps no `values`, and
the probe's header now says why, so the next reader does not "finish the job".

## What holds it

The same file, `test/mcp/rated-items-are-required.test.js`, now reading the right
strings. Verified by reintroducing each defect: restoring `note` to the reading
re-excuses `four-ts-hit`; making `graeb-ivh`'s compartments optional fails
naming them.

## The lesson

> **A vocabulary match over a tile's whole output is a match against its
> boilerplate.** Static prose — the citation, the guidance note, the instrument's
> own caveats — is printed on every call and says nothing about this one. Read
> only what the tile computed for these inputs, or the longest note in the
> catalog decides which defects your gate can see.
