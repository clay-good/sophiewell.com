# spec-v767.md — The entry point should not outlive its own modules

> Status: **SHIPPED (2026-08-21).** Caching headers only. No tile added, no compute changed.
> Catalog stays **1564**.

## Why

Found while verifying a deploy on the live site, which is the only place it is visible.

`_headers` cached `/app.js` and `/styles.css` for an hour and leaned on the service worker to
invalidate them. Its own comment said so:

> apply a moderate cache here and rely on the SW for revalidation

That works once the service worker has activated, and not before. Meanwhile everything `app.js`
**imports** — `lib/*.js`, `views/*.js` — has no rule in `_headers` and falls through to
revalidate-every-visit.

The mismatch is a version-skew window. For up to an hour after a deploy, a returning reader runs
**old `app.js` against new modules**.

Observed, not theorised:

```
/app.js              cache-control: public, max-age=3600
/lib/name-match.js   cache-control: public, max-age=0, must-revalidate
```

A live page served a cached `app.js` while the `lib/name-match.js` it was supposed to import came
down fresh — which is why the routing fixes appeared not to have deployed when they had.

## What it does

`/app.js` and `/styles.css` revalidate, like `index.html` and `sw.js` already did.

Nothing broke during the observed skew, because the old `app.js` simply did not import the new
module — the failure mode was a fix that appeared not to ship. A change that altered a `lib`
function's signature would not be so lucky: the old entry point would call the new module with the
old contract.

The cost is one conditional request per visit, answered with a 304. On a site whose value is the
correctness of clinical arithmetic, that is the cheaper side of the trade.

## What was deliberately left alone

`/data/*` keeps `max-age=86400`. Those shards — the search corpus, the field index — are content
the service worker keys to `BUILD_HASH`, and they are not executable: a stale shard means a missing
prefill, not a wrong number.

## Gotchas

- The service worker fetches shell assets with `cache: 'no-cache'` during install, so it was never
  the thing at risk. The window belongs to the **browser** cache, before the SW activates.
- `check-commitments.mjs` reads `_headers` for the CSP shape. It does not assert cache policy, and
  it should stay that way — the CSP is a security invariant, cache lifetime is a judgment call.

## Proof

- Live headers, before and after.
- lint (incl. `check-commitments`), 11470 unit: green.
