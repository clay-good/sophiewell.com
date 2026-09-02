# spec-v984 — Reviewing the day's own work, and a gate that reported clean while broken

## Why this exists

Twelve changes landed on `main` in one day, several of them new gates. A gate is a claim, and an
unreviewed claim is worth less than none — so the day's cumulative diff was read back as a
pull request. Six issues, three of them real.

## The one that mattered

`scripts/check-issue-templates.mjs` (spec-v976) checked that every input field in an issue form
carries an `id:`, because **GitHub silently discards the answer to a field without one**.

It found the fields by splitting on the literal string `\n  - type: ` — two spaces, because that is
how the four templates happen to be written. **Four-space indentation is equally valid YAML.** Under
it the split matched nothing, the per-field loop never ran, and a form with a required field and no
`id:` was reported **clean**.

Verified before fixing: a form written at four-space indent with the `id:` removed passed the gate.

> A gate that reports clean while the defect it exists to catch is present is worse than no gate:
> no gate leaves you looking, and a false clean stops you.

It now reads the `body:` key, takes the indentation of its first `- ` item as that file's list
indent, and reads each field's keys at indent + 2. It fires at two spaces and at four, ignores a
nested list (a dropdown's `options:`), and does not mistake an `id:` nested under `attributes:` for
the field's own.

## Why it had no test, which is the second finding

The module ran its whole check — including `process.exit(1)` — **at import**, unlike the three
sibling gates added the same day, which all guard on `process.argv[1]`. A unit test that imported it
would have exited the runner on the first violation. That is exactly why it was the only one of the
four new gates without a test. Guarded now, `bodyFields` exported, and `test/unit/issue-templates.test.js`
is the test that was not possible before.

## The rest

- **`scripts/check-pa-rule-citations.mjs`** used a `/g` regex with `.test()` inside a filter over 876
  rules. A global regex carries `lastIndex` and `.test()` advances it, so consecutive calls on
  matching strings alternate `true, false, true, false`. The count was right only because a
  redundant non-global test sat beside it catching every miss — so deleting that clause as an
  obvious duplicate, the natural cleanup, would have halved the number. Two named regexes now:
  the global one only where `matchAll` clones it, a plain one for the test.
- **`test/integration/related-tools-shown.spec.js`** passed its explanatory messages as a second
  argument to `toContain`/`toBe`, where Playwright ignores them. A failure printed a bare diff
  instead of "a tile is not its own neighbour". The message belongs on `expect()`.
- **`views/group-v836.js`** updated the show-your-work panel *before* checking the scorer accepted
  the input, so it would print a total beside an error message. Unreachable through today's
  selects, and inverted relative to the code it was transplanted from.
- A dead alternative in the tab check (`/\btabs?\t/`, matching the literal word "tab" followed by a
  tab) removed.

## Files

Changed: `scripts/check-issue-templates.mjs`, `scripts/check-pa-rule-citations.mjs`,
`test/integration/related-tools-shown.spec.js`, `views/group-v836.js`.
New: `test/unit/issue-templates.test.js`, this file.
