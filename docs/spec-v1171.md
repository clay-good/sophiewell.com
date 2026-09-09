# spec-v1171 — the year, and the fifth copy

[spec-v1170](spec-v1170.md) consolidated four date parsers onto one calendar
rule and shipped. Re-running the probe that found it, one question wider — *what
does a tile do with a date that is **real** and centuries away?* — found two more
things, and **the first is a regression that wave introduced.**

## The regression, in the fix

`Date.UTC(1, 0, 1)` is **1901**-01-01. The legacy two-digit-year rule applies to
every year 0–99, including one written `0001`, and it applies to `new Date(y, m,
d)` too.

The `parseIsoStrict` spec-v1170 replaced had been catching that — not on purpose,
but its round-trip compared `dt.getUTCFullYear()` against the year it was given,
and 1901 ≠ 1. Replacing the round-trip with a month-length check lost it. So for
about half an hour `global-period` answered `0001-01-01` with a surgical global
window starting 1900-12-31, where before the wave it had refused.

**A round-trip check answers a question you did not know you were asking.**
Replacing one with an explicit rule means enumerating everything it happened to
cover, and the year was not on the list.

## The second thing: a date has a range, like a number

Every date tile answered confidently from a year no claim, order or pregnancy
has:

| Tile | Given | It said |
| --- | --- | --- |
| `breach-clock` | discovery 1823-04-01 | HIPAA individual, media and HHS notice deadlines of 1823-05-31 |
| `timely-filing` | service 1823-04-01 | "deadline 1824-03-31", Medicare 365 days |
| `appeal-deadline` | notice 2199-04-01 | redetermination due 2199-07-30 |
| `due-date` | LMP 1823-04-01 | due 1824-01-06 |
| `preg-dating` | LMP 1823-04-01 | discordance **74,043 days**, redate by the ultrasound |
| `restraint-timer` | order 1823-04-01T12:00 | face-to-face by 1823-04-01T18:50 |
| `global-period` | surgery 2199-04-01 | "outside the global period", −63,246 days from surgery |
| `rosendaal-ttr` | first INR 1823-04-01 | TTR 50% — 37,043 of **74,075** days in range |

This is [rule 5](incomplete-input-program.md) for dates: *a value that IS given,
but impossible, is named above the answer.* `declared-ranges.spec.js` has held
that for numbers since spec-v1010, and a date carries no `min`/`max` for it to
read.

`DATE_MIN_YEAR = 1900` / `DATE_MAX_YEAR = 2100`, in `lib/num.js` beside the
calendar rule. These are clinical and billing dates — a Medicare filing clock, a
restraint order, an LMP — and none of them is outside that window. It is
deliberately generous: the point is to catch a typed year, not to be precise
about the domain.

The two questions are kept apart, because a refusal should say which one failed:

```
ymdFault('3/14/2026')   -> 'shape'      not YYYY-MM-DD
ymdFault('1823-04-01')  -> 'window'     a real date, outside 1900-2100
ymdFault('2026-02-30')  -> 'calendar'   the right shape, and not a day
```

> surgery date must be between 1900 and 2100

> 1823-04-01 is outside the dates this tool works with (1900 to 2100). Check the
> year.

## The fifth copy, and why the grep missed it

spec-v1170 found its four parsers with one grep for the date-shape regex, and
wrote that down as the lesson. `due-date` has no date regex:

```js
const lmp = new Date(lmpIso + 'T00:00:00Z');
```

It appends a time and lets the ISO parser decide. That parser *does* reject 30
February, so the calendar was covered here **by luck rather than by a rule** —
and the year was not covered at all.

**Grepping for the shape of a rule finds every copy written in that shape.** The
copy that delegates the rule to a built-in is invisible to it, and looks correct
until you ask the question the built-in does not answer. The probe found it in a
second; the grep never would have.

`naegele` now routes through `ymdFault` like the rest. spec-v1018's separate
plausibility guard — an LMP that is real but has run past 45 weeks — is untouched
and still reports the EDD either way; that is a stale date, this is not one of
these dates at all.

## Verification

`npm run release:check` green. `test/unit/impossible-date.test.js` is 14 tests:
the three faults, the 1901 trap asserted directly (`new Date(Date.UTC(1, 0, 1))
.getUTCFullYear() === 1901`), the window constants, and each tile pinned to the
answer it used to give. The probe that found all of this prints nothing now.
