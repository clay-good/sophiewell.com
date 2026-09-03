# spec-v1002 — Twelve of the prior-auth linter's source links were dead

## The finding

`scripts/check-pa-source-urls.mjs` exists because spec-v979 found that the staleness ledger tracked
**dates** and never checked **links**. Run today, it reported:

> 72 ok, 6 moved, 1 blocked by a bot wall, **12 dead** of 91.

Nine of the twelve are payer provider portals that reorganised — HCSC/BCBSIL, Highmark, Florida
Blue, BCBS Michigan, CareFirst, Horizon, BCBS Tennessee, BCBS Alabama, HMSA. Three are CMS pages
CMS moved: the OPD prior-authorization list, the JW/JZ drug-wastage guidance, and the page behind
the sequestration rate.

Every one was verified dead with a full browser User-Agent before being replaced, because this
project has twice learned the opposite lesson — a bot wall is not a dead link (spec-v980), and a
500 is not either (spec-v999). All nine payer 404s are real 404s in a browser.

**This is not cosmetic.** These URLs print into the pa-lint report a biller reads. A rule that
cites a dead page "is worse than no rule, because it reads as authoritative while being wrong" —
the ledger's own words.

## The second copy, again

spec-v981 is the standing warning here: *the fix reached the ledger and not the reader, because
133 rule citations carry a second copy of each URL*. It happened the same way. Updating
`pa-staleness-ledger.json` left `check-pa-rule-citations` failing on **281 rule citations** in
`lib/pa/rules.js` still carrying the old URLs — twenty per payer — and those citation strings are
the text that reaches the report.

Three copies, all now in step: the ledger, the generated `lib/pa/staleness-ledger.js`, and the 281
rule citations. The 46 golden pa-lint reports were re-seeded, and their diff is the proof the
change reaches a reader: every `<url>` in every fixture report now resolves.

After: **90 ok, 0 moved, 0 dead** of 91. The one remaining is `asahq.org`, a 403 bot wall the
checker already classifies correctly.

## What was deliberately not done

**`lastVerified` was not bumped on any row.** It was, briefly, and that was wrong. In this ledger
`lastVerified` means a maintainer re-read the policy and confirmed the rules still reflect it —
`check-pa-source-urls` says so itself: *"It cannot read a policy page and decide the rules still
reflect it; that stays a maintainer's judgment and a `lastVerified` bump. It CAN tell you the page
is gone."* Finding a live replacement URL is the second thing, not the first. So the twenty rows
past their ninety-day window stay in warning: **the link is fixed and the policy re-read is still
owed**, and the ledger says so honestly rather than resetting the clock.

The six `MOVED` rows were updated to their redirect destinations at the same time, so a reader
following them lands in one hop.

## Proof

`node scripts/check-pa-source-urls.mjs` — 90 ok, 0 dead. `check-pa-staleness`,
`check-pa-rule-citations` and `audit-pa` clean; full lint chain and 13,066 unit tests pass.
