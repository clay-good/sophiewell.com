# spec-v1779 — A declaration that names its envelope

> Status: **SHIPPED (2026-11-23)**: 424 fields now name their envelope, across 107 adapter files. No tool's
> arithmetic changed; the catalog stays 2,390.

[spec-v1777](spec-v1777.md) declared 285 caps that libraries enforce and nothing stated, and deliberately
left 435 alone. Those are not a tool's own cap: both edges are one of the 45 `lib/bounds.js` envelopes, to
the decimal. A descriptor held only literals, and copying an envelope into 435 of them would rebuild the
problem three specs had just finished undoing -- specs v1762 to v1765 widened four envelopes past values
verified in survivors (an INR of 189, a sodium of 208, a triglyceride of 33,727 mg/dL) and then had to chase
every narrower copy left behind in a library.

So the descriptor gains the thing it was missing. `bound: 'weightKg'` resolves against `BOUNDS` on every
read, through `fieldRange` in `mcp/fields.js`, and a declaration cannot fall behind the envelope it names.
`boundScale` covers a field stated in a sub-unit of the envelope's: a height in cm against an envelope in
metres is `bound: 'heightM', boundScale: 100`. An explicit `min`/`max` still wins, which is how a tool whose
own validated range is narrower than survival keeps it.

## A named envelope documents the range; it does not refuse

That split is the whole of the mechanism's behaviour, and it was not the first design. The first one
enforced a resolved range the way `validateInputs` has enforced a literal since
[spec-v1646](spec-v1646.md) -- refusing before the library runs, with its own sentence,
`"ap-na" must be from 90 to 208; got 84.` Three tests failed within the minute, and each was right:

| Test | The sentence it asserts |
|---|---|
| `apache2` sodium of 84 | `Input below the plausible range for serum sodium (90 to 208 mEq/L); verify the units.` |
| SMART-COP PaO2 of 999999 | `PaO2 (mmHg) must be between 10 and 700. Check the value entered.` |
| `toxic-alcohol` typed zero | `must be between 5 and 3000` |

The libraries already refuse these values -- that is how the probe found them in the first place -- and they
do it in the words the reader sees on the page. Two different builders write those words (`boundsAdvisory`
in `lib/bounds.js` and `rangeFault` in `lib/num.js`), so no sentence composed in `mcp/fields.js` can match
both. Pre-refusing would have replaced the page's sentence with a worse one **on the agent surface only**,
which is the divergence [spec-v1743](spec-v1743.md) exists to stop, pointing the other way.

So a named envelope reaches the published input schema -- which is the gap
[spec-v1777](spec-v1777.md) set out to close, an agent told the input is a number and nothing more -- and
the refusal stays where the sentence is. A literal `min`/`max` still refuses, unchanged.

One envelope kind publishes no floor at all. A `CEILING_ONLY` key (albumin, glucose) has a low end that has
been survived, so `lib/bounds.js` flags a critical low rather than refusing it (spec-v1762); publishing its
minimum would claim a floor nothing holds.

## What was declared

| | |
|---|---|
| ENVELOPE rows `probe-undeclared-cap` reported | 435 → **11** |
| Fields that now name their envelope | 424, across 107 adapter files |
| Commonest keys | `scr` 38, `weightKg` 37, `hr` 29, `sbp` 27, `sodium` 22 |
| Scales other than 1 | 26 (13 at x100, 7 at x0.1, 6 at x10) |
| Declared-bound fields the two finders now police | 877 → **1,304** |

Each row's two resolved edges were re-asked of the library before anything was written: the edge accepted, a
value a millionth past it refused. Both the key and the scale come from the probe's numeric match, with one
correction that earned its place. Four pairs of envelopes share their edges exactly -- `wbc` with
`sixMinuteWalkM` (0 to 2,000), `eGFR` with `esr` (0 to 200), `percentWeightLoss` with `spo2` (0 to 100), and
`alt` with `ast` (1 to 30,000) -- and a numeric match cannot choose between them. It names whichever key
comes first in `BOUNDS`, so 14 fields whose labels say AST were about to be bound to `alt`. Where the field
itself names one of the sharers, that is the key; where it names neither, the row is skipped.

## The gates

`test/unit/field-bound-names.test.js`. The cost of resolving a name is that a typo is silent: `bound:
'weightKG'` matches no envelope, and a field meant to be bounded would publish with no range at all.
`fieldRange` refuses to invent a range for an unknown name -- it returns whatever literals the descriptor
stated, so a typo can never LOOSEN a field -- and the test refuses the typo outright. It also holds that a
`boundScale` is positive and finite, appears only beside a `bound`, and that a resolved range is the
envelope scaled, with a literal still winning.

The three gates that police a declaration all read `f.min` / `f.max` directly, which would have left every
one of these 424 **unpoliced** -- the exact hazard that cost [spec-v1777](spec-v1777.md) four reverted
declarations. `probe-adapter-only-bounds`, `probe-declared-cap-configs` and
`test/unit/declared-cap-honest.test.js` now all resolve through `fieldRange`, so a bound declared by name is
held to the same two promises as one declared by number: the library must not answer past it, in any
configuration, and the library must accept its edge. `probe-adapter-only-bounds` went from 1,767 declared
edges to 2,629 and still reports only its two pre-existing rows.

Policing them immediately earned its keep. Four of the 428 the codemod first wrote documented a range the
library does not hold on every branch -- the same cause as spec-v1777's four, a cap inside one branch.
`vasopressor` checks the weight against
the envelope only for a drug dosed per kilogram -- dopamine refuses 525 kg, while norepinephrine, dosed in
mcg/min, answers and echoes `weightKg: 525` back without the rate depending on it;
`chemo-dose-verify` ignores the height on a carboplatin basis (its weight was reverted last spec, its height
this one); `anticoag-switch-clock` and `doac-dose-check` each have a path that never reads the INR or the
creatinine. All four were reverted, leaving **424**. Under the final design none of them would have refused
anything -- but a documented range the library keeps only on some branches is still a false claim to an
agent, which is what the probe is for.
