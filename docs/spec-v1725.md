# spec-v1725 — The catalog walk, in four parts

> Status: **SHIPPED (2026-11-15)**: test layout only. No tool changes; the catalog stays 2,387.

`test/integration/every-tool-is-wired.spec.js` walks every tool (find it by name, open it, check it has
something to fill in) as one serial test. It took 9.1 minutes locally and held Chromium CI shard 2 for 25 to
40 minutes, close to its own 30-minute timeout, while most other shards finished in 4 to 15.

It now runs as four tests, each walking every fourth tool (`index % 4`), plus one test that the catalog is
still the catalog (over 1,500 tools). The checks per tool are unchanged and every tool is still walked
exactly once. This is the same layout `example-correctness.spec.js` already uses.

| | Before | After |
|---|---|---|
| Local, one file | 9.1 min | 2.3 min |
| CI | one test on one worker | four tests across shard 2's two workers |

Playwright shards by contiguous runs of tests, so all four parts still land on CI shard 2, alongside
`example-correctness`'s four. Spreading them across shards would mean steering file order by name; that is
left as a follow-up.
