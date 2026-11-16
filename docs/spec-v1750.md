# spec-v1750 — Dates outside the house window

> Status: **SHIPPED (2026-11-16)**: 14 tools. The catalog stays 2,387.

`lib/num.js` keeps one date rule: `ymdFault` (the shape, the 1900-2100 window from `inDateWindow`, and the
calendar). A sweep set every date field in the worked examples to 30 February, to month 13, and to 1850: 16 of 714
answered.

| Cause | Tools | Before |
|---|---|---|
| twelve copies of one local `parseWhen` (a calendar check, no year window) | `med-admin-window`, `surgical-prophylaxis-redose`, `us-antivenom-dose`, `nac-oral-regimen`, `fomepizole-schedule`, `mesna-ifosfamide-schedule`, `glucarpidase-dose`, `gcsf-timing-check`, `doac-periprocedural-timing`, and the same parser in `anticoag-switch-clock`, `label-titration-calendar`, `ischemia-time-clock` | a dose given on 1850-06-01 was "1,545,985 h 20 min late" |
| a local `validDate` with no window | `who-rabies-pep` | a first dose on 1850-06-01 scheduled the course |
| an impossible start date read as missing | `imid-rems-fill-window` | 30 February: "Enter the therapy start date to see the next pregnancy test" |

Each `parseWhen` now applies `inDateWindow`, and its callers' messages name the rule ("a real date from 1900 to
2100") so a reader who typed a well-shaped 1850 is not asked for the same shape again. The rabies `validDate` is now
`ymdFault`; iMID refuses an entered start date that fails it. The twelve copies were folded into one shared parser in
spec-v1751.

After: 0 of 714.

Tests: `test/unit/date-window-v1750.test.js`.
