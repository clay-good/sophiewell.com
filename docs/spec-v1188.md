# spec-v1188 — the source that had quietly moved

`scripts/check-pa-source-urls.mjs` runs on the monthly cadence and had been
reporting the same row every month:

```
MOVED (1):
  bcbsm-precert  200  https://authorizations.bcbsm.com/index.shtml
      -> https://authorizations.bcbsm.com/
```

The page resolves, so nothing was broken for a reader. But a report that always
carries the same known row trains the person reading it to skim past the row that
is new — the reason to clear it is the report, not the link.

Now: **90 ok, 0 moved, 0 dead of 91.** The one remaining row is a 403 bot wall at
`asahq.org`, which is a page refusing a script rather than a page that is gone.

## One fact, stored twice

The URL lives in `pa-staleness-ledger.json` *and* in the citation sentence of
every rule anchored to that source. Updating only the ledger left 20 rule
citations pointing at the old address — and
`scripts/check-pa-rule-citations.mjs` caught it immediately:

```
https://authorizations.bcbsm.com/index.shtml
    cited by 20 rules (R-PA-BCBSM-001, …) and unknown to pa-staleness-ledger.json
```

That gate exists because these citations print into the report a biller reads, so
a rule may not cite a page the ledger does not know. It did exactly its job on a
half-finished change, which is worth recording: the duplication is real, but it is
a *guarded* duplication.

Regenerated after: `lib/pa/staleness-ledger.js`, and 46 expected pa-lint reports
via `audit-pa.mjs --update`. The whole diff is one URL.

## What this deliberately does not do

`check-pa-staleness` reports **60 rules past 90 days unverified**. Bumping
`lastVerified` clears that warning, and doing so without actually re-reading 60
state-Medicaid and CMS policy pages would be **falsifying the ledger** — the one
record whose entire value is that a date on it means someone looked. The script's
own header draws the same line: it "cannot read a policy page and decide the rules
still reflect it; that stays a maintainer's judgment."

The warnings stay up.

## Verification

`npm run release:check` green, exit code read directly rather than through a pipe.
`check-pa-rule-citations` clean (741 citations, 45 distinct URLs, all registered),
`check-pa-staleness` clean-with-warnings and no drift between the JSON and the
generated module, and the network check re-run: 0 moved.
