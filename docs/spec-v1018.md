# spec-v1018 — A reading measured from "now", and a comparison made on the wrong day

## The finding

spec-v1017 noticed `code-blue-clock` reporting *"Code time: 154215.8 min"* on arrival and called it
out as a different problem. This is that problem.

Nineteen tiles pin an absolute date in their worked example. For most that is harmless — a date of
service or a date of birth means the same thing whenever the page is opened. Four compute an
**elapsed figure from today**, and those rot. Measured in September 2026 against examples written
in May:

| Tile | On arrival |
| --- | --- |
| `due-date` | *"Current gestational age: 87 weeks 1 days"* |
| `preg-dating` | *"current GA 36w 2d"*, and a 172-day discordance against the same ultrasound |
| `code-blue-clock` | *"Code time: 154215.8 min"* — 107 days of CPR |
| `device-day-counter` | *"Device-days: 111 d 6 h"* |

The fix is not to hide the arithmetic. The due date, the implied EDD and the interval targets are
all computed from the dates **entered** and stand whenever the page is opened. Only the from-today
figure is withheld, with its reason, once it has run past what the instrument can mean: a pregnancy
is dated to about 42 weeks, and a resuscitation lasts minutes.

`device-day-counter` is left alone: 111 device-days is unusual but possible, and a catheter that has
been in for months is exactly what that tool is for.

## The one that was wrong on any date

Chasing the 172-day discordance found a defect that has nothing to do with stale examples.

`preg-dating` compared the **LMP-derived age measured today** with the **ultrasound age measured at
the scan**. Two ages, two different days, and the difference between them grows with the calendar.
The worked example — LMP 2025-12-23, a scan on 2026-03-12 with a CRL of 50 mm — reported:

> Discordance: 172 days (T3 threshold 21). **Consider redating to ultrasound.**

On the day of the scan the LMP gives 11w2d and the CRL gives 11w5d. The real difference is **3
days**, inside the 7-day first-trimester limit, and the correct advice is the opposite: do not
redate. A redating decision was being made on an artifact of the clock, and it would have been
wrong the day the tile shipped.

The comparison is now made as of the ultrasound date, and says so in the label.

## Proof

`test/integration/examples-that-rot.spec.js` — the due date still shows while the runaway age does
not, and a real LMP 120 days ago still reports 17 weeks; the code clock names the stale start and
still shows its interval targets; and `preg-dating` reports the 3-day discordance with "Within
accepted limit". 13,096 unit tests and the full lint chain pass.

## Left open

The four tiles here were found by reading the sweep's output, not by a check. A worked example whose
meaning depends on the wall clock is a category, and nothing yet fails when a new one is added.
