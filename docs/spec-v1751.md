# spec-v1751 — One wall-clock parser, not twelve

> Status: **SHIPPED (2026-11-16)**: a refactor; no tool's answer changes. The catalog stays 2,387.

spec-v1750 found twelve libraries each carrying their own copy of a `'YYYY-MM-DDTHH:MM'` parser, and fixed all
twelve the same way because none had the house year window. A rule written twelve times drifts; this keeps it once.

`lib/num.js` gains `wallClockUtc(v)`: a datetime-local value (a `T` or a space between date and time) to UTC
milliseconds, or null for a bad shape, a date off the calendar, an hour past 23, a minute past 59, or a year outside
1900-2100. Each library now imports it under the name it already used (`parseWhen`, or `parseStamp` in
`ischemia-time-clock`), so no call site changed.

Equivalence: ten of the twelve copies hashed identical; the other two differed only in line breaks and in
`String(s)` against `String(v ?? '')`, which give the same result. The twelve tools' tests, spec-v1750's date tests,
the fuzz file (2,264) and the full unit suite pass, and `check-helper-drift` stays clean.

Libraries: `anticoag-switch-clock`, `doac-periprocedural-timing`, `fomepizole-schedule`, `gcsf-timing-check`,
`glucarpidase-dose`, `ischemia-time-clock`, `label-titration-calendar`, `med-admin-window`,
`mesna-ifosfamide-schedule`, `nac-oral-regimen`, `surgical-prophylaxis-redose`, `us-antivenom-dose`.

Test: `wallClockUtc` cases in `test/unit/impossible-date.test.js`.
