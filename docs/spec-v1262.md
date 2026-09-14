# spec-v1262 — correct the Medicare Advantage review deadline

The Medicare Advantage expedited-review rule cited a 14-day standard review
period. That became stale on January 1, 2026: 42 CFR § 422.568 now gives
service or item requests subject to the § 422.122 prior-authorization rules a
7-calendar-day standard deadline.

`R-PA-MA-012` now states that deadline while retaining the current 72-hour
expedited deadline and serious-jeopardy test from §§ 422.570 and 422.572. A
regression test pins both current deadlines and rejects the superseded wording.

The Part 422 ledger source was reread on 2026-09-14 and its generated browser
module and PA audit snapshots are refreshed with the new verification date.
This reduces source-age warnings from 80 to 79 without changing the rule's
finding logic or the 1,722-tile catalog.
