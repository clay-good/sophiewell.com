# spec-v1719 — End-to-end CI in parallel, Firefox and WebKit nightly

> Status: **SHIPPED (2026-11-14)**. CI only; no tool changes.

The `e2e` job had grown to **2 hours 42 minutes** on one runner: every spec in three browsers, waiting
behind the 12-minute `unit` job. The owner asked for a faster loop that keeps building.

| | Was | Now |
|---|---|---|
| Chromium, whole suite | one runner, after `unit` | eight runners in parallel (`--shard=N/8`), not waiting on `unit` |
| Firefox and WebKit, on a push | whole suite | `smoke.spec.js` only |
| Firefox and WebKit, whole suite | every push | nightly at 07:00 UTC, and on a manual run |
| Wall clock for a push | about 2.9 hours | 47 minutes on four shards (first run); eight shards since |

## What this keeps

All of the safety signal. Every whole-catalog sweep — the empty-form sweep, the clock sweep, the
partial-answer sweep, example correctness, label ranges, every tool wired — already skipped Firefox and
WebKit, so the Chromium shards run every gate the project relies on, unchanged.

## What this gives up

A regression that only Firefox or WebKit shows, in a spec other than smoke, is caught the next morning
rather than on the push that caused it. The smoke spec still catches an engine that cannot boot the app.
Those two engines also produced all seven flakes on the spec-v1717 run, so a push is quieter too.

## First run

Green, and `main` green for the first time since spec-v1716. The four Chromium shards took 9, 17, 30 and 47
minutes: Playwright splits by test count, and the catalog sweeps (every tool wired at 11 minutes, the
example-correctness shards at 9 each) landed together. It is eight shards now; each pays about four
minutes of setup, and no single test runs longer than about 12.

## Superseded runs on `main` are cancelled now

The eight-shard run proved the split: every shard finished in 6 to 13 minutes. But its jobs started over
almost half an hour, because five runs on `main` were in flight at once and a push fans out to a dozen
runners. The workflow had grouped `main` runs by commit and never cancelled one, so that each commit was
verified on its own.

A newer push to a branch now cancels that branch's older in-progress run. Pull requests already worked
that way. The cost is that when several commits land close together, only the newest is verified, and a
failure points at a range of commits instead of one. Deploying is a manual step made from a green commit
(`docs/release.md`), so nothing unverified ships.

The concurrency group includes the event name, so a push never cancels the nightly run, which is the only
full Firefox and WebKit run.

The two runs still on the old three-hour layout were cancelled by hand. Both commits are ancestors of
`d837f49eb`, whose run was fully green.

## Notes

- `runs-on` stays the first line under each job key, and the comments sit above the keys:
  `test/unit/release-check-covers-ci.test.js` finds a job's end that way.
- Each shard and engine uploads its own Playwright report (`playwright-report-chromium-1` and so on).
- The schedule also runs `unit`, `mcp` and the Chromium shards, so a night with no pushes still verifies
  `main` against the browsers of that day.
