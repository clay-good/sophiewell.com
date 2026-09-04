# spec-v1057 — One helper name, three behaviours

spec-v1055 found a checking rule implemented twice and divergent. spec-v1056 found the same in the
sweeps' vocabulary. This one is in the calculators themselves.

The view modules are separate bundles, and each carries its own copy of the small readers the
renderers use. That is the house convention. Nothing checked that the copies agree.

They did not. **`optNum` existed in 64 modules with three behaviours**, and the difference was this
program's whole subject:

```js
String(n.value).trim() === '' ? null : Number(n.value)   //  2 modules -> blank
n.value !== '' ? Number(n.value) : null                  // 51 modules -> 0
v === '' ? null : Number(v)                              // 11 modules -> 0
```

`Number(' ')` is **0**. So on 62 of 64 modules, a field holding only whitespace reached the formula
as a *measurement of zero* — the exact defect spec-v1006 through spec-v1056 exist to remove, sitting
inside the helper written to prevent it. `nvOrNull` and `numOrNull` had the same split.

How a reader gets whitespace into a field: pasting from a chart or a spreadsheet cell. A
`type=number` input normalises that away, but the text inputs and textareas read through these
helpers do not.

## The fix

All 64 bodies are now the trimming form. `needValues` was normalised too — its two variants differed
only in a local name (`list` vs `list_`, avoiding a shadow in modules that define a `list()` helper),
so both became `phrase`, which shadows nothing anywhere.

`scripts/check-helper-drift.mjs` joins the lint chain. It does **not** demand the helpers move into
one module — the per-bundle convention is fine — only that every copy of a given name has the same
body, comments and message wording aside. Verified by reverting one copy of `optNum`: it fails and
prints both shapes.

## The rule

**Duplication is survivable; silent divergence is not.** A reader who learns what `optNum` does in
one file has to be right about it in all of them, and the way to keep that true is to check it
rather than to intend it. Three of this session's specs are the same finding in three places — a
rule written twice, drifting, with nothing watching.
