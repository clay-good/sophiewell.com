# spec-v1060 — A test list is an inventory

spec-v1054, spec-v1055 and spec-v1059 were each a check that read less than it appeared to. Three of
one thing is a pattern worth looking for on purpose, so I swept every test whose **title** claims
coverage — "every", "all", "each" — for a **body** that narrows what it examines.

Eight candidates. Seven were my detector misreading `.slice(0, 10)` in a *failure message* as a
narrowed input — the tests truncate the list of offenders they print, not the set they check. Good
false positives: that is what those slices should do.

One was real:

```js
test('every tool route exposes a working back button to home', …)
  const sample = ids.filter((_, i) => i % 8 === 0);
```

213 routes of 1,704, and always the same 213.

## Why the sampling stays

The button is created once, in `renderToolView()` in `app.js`, on the same path that produces the
`<h1>` — and the test directly above it walks **every** route asserting that `<h1>` and a clean
console. A view that rendered without the button would have failed there first. So this is a
click-through of a shell contract, and 213 routes exercise it as well as 1,704 would.

**The name was what was wrong.** A test list is read as an inventory of what is covered, and "every"
in a title that checks an eighth is the cheapest possible way to overstate it. It is now *"a sampled
tool route …"*, with the reasoning in the body so the next person can judge the sampling rather than
trust it.

## And the README

The "Or not" row describes what a calculator does with a value it was not given. It was written
against the first three rules of that program and the program has since grown two more, both
user-visible:

- it will not **raise an alarm** from an empty form either (spec-v1036 — an untouched MEOWS was
  calling an obstetric rapid-response team);
- when it does answer on a partly filled form, it **says how much of the form it used**
  (spec-v1044 — "Scored from 9 of 10 items").

Both are now in the row. The README is the first description a reader gets of how these tools behave,
and it should describe the ones that exist today.

## The rule

**A name is a claim.** A gate that filters its input silently and a test that says "every" while
checking an eighth are the same defect wearing different clothes: both leave a reader believing in
coverage that is not there, and neither will ever fail to tell them so.
