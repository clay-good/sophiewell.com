# spec-v1785 — A refusal about a number nobody entered

> Status: **SHIPPED (2026-11-24)**: 11 refusals rewritten across 8 libraries, 1 helper option added. No
> tool's arithmetic changed; the catalog stays 2,390.

`num(name, value, { min, max })` is the shared guard, and it guards two different things with one sentence.
Most call sites hand it a value the reader typed, and "weight kg must be between 0 and 500. Check the value
entered" is right for those. **252 call sites hand it a value the library worked out**, and for those the
same sentence names a quantity that is not on the reader's screen and then tells them to check a value they
never entered:

| The reader typed | The tool said |
|---|---|
| a hemoglobin, into Fick cardiac output | `cardiac output must be between 0 and 30. Check the value entered.` |
| an arterial pH, into the pH-corrected potassium | `kcorr must be between 0 and 20. Check the value entered.` |
| a platelet count, into the aMAP score | `a MAP must be between 0 and 100. Check the value entered.` |
| a height, into lean body weight | `BMI must be between 0 and 200. Check the value entered.` |
| a maximum temperature, into Penn State | `penn state RMR must be between 0 and 20000. Check the value entered.` |

[spec-v1015](spec-v1015.md) fixed this family once already, when a nurse was shown
`weightKg out of range [0.3, 500]` -- "a refusal in the words of a stack trace, from the tool that is
supposed to be the plain-language one". The refusals were right; only the language was wrong. The same is
true here, one layer in: the refusal is right, and it is about the wrong number.

`num()` takes `computed: true`, and the eleven reachable call sites now read:

> the pH-corrected potassium works out to 21.4, which is outside the range this tool reports (0 to 20).
> Check the values entered.

The eleven were found by `probe-envelope-inside`, which drives a value just inside a `lib/bounds.js`
envelope: they are the computed guards a reader can actually reach from a survivable input. The other 241
are not reachable that way and keep the entered-value sentence until something shows otherwise.

## Two things went wrong on the way

**The fix silenced the finder.** When those call sites stopped saying "must be between X and Y", all eleven
rows vanished from `probe-envelope-inside` -- not fixed, unrecognised. Its list of range-sentence shapes is
how it tells a range refusal from a missing pair, and the new wording was not in it. That is exactly the
failure [spec-v1782](spec-v1782.md) built a gate against, one spec later and from the opposite direction: not
a rule too wide, but a message the finder no longer knew. **A finder's sentence list is part of its reach**,
and the new shape is now in all three places that carry that pattern -- `probe-envelope-inside`,
`probe-undeclared-cap` and `test/unit/declared-cap-honest.test.js`.

**`readable()` mangled the new labels.** It exists to make an argument NAME presentable, spacing it at
camelCase boundaries -- `weightKg` becomes "weight kg", and its own note says it is "imperfect for an
acronym, never misleading". Run over prose it is misleading: "the pH-corrected potassium" came out as
**"the p H corrected potassium"**, "the aMAP score" as "the a MAP score", and
"the Salazar-Corcoran creatinine clearance" as "the salazar corcoran creatinine clearance" -- proper nouns
lowercased, acronyms split into letters. A `computed` label is not an argument name; it is the reader's name
for the quantity, written out. It now passes through as the caller wrote it, and
`test/unit/num.test.js` holds all three cases.

## What this leaves

The entered-value sentence is unchanged and still asserted character for character, so nothing moved for the
fields a reader does type into. 241 computed guards still carry it. They are not a backlog of defects --
each is a quantity whose arithmetic stays in range for every input its envelopes allow -- but any of them
that becomes reachable is a row in `probe-envelope-inside`, and the fix is now one option long.
