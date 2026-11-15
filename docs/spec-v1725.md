# spec-v1725 — The catalog sweeps, in their own CI lanes

> Status: **SHIPPED (2026-11-15)**: test and CI layout only. No tool changes; the catalog stays 2,387.

Chromium CI shard 2 took 39 to 40 minutes on every push while the other seven took 4 to 28. Its job log says
why: it held both whole-catalog sweeps.

| Test (CI shard 2, two workers) | Time |
|---|---|
| `example-correctness.spec.js`, each of 4 parts | about 9.3 min |
| `every-tool-is-wired.spec.js`, then one serial test | about 20 min |

## Step 1 (`02825ee5c`): the catalog walk in four parts

`every-tool-is-wired.spec.js` walked all 2,387 tools in one serial test, close to its 30-minute timeout in CI.
It now runs as four tests, each walking every fourth tool (`index % 4`), plus a check that the catalog is still
over 1,500 tools. Locally: 9.1 min to 2.3 min.

It did not shorten CI: shard 2 went from 40 to 39 minutes. Playwright shards by contiguous runs of tests and has
no weighting, so the four new parts landed on shard 2 beside example-correctness's four.

## Step 2: twelve lanes

Each part of both sweeps is tagged `@sweep` and `@sweep-N`. The `e2e` job in `.github/workflows/ci.yml` now has
twelve lanes instead of eight shards:

| Lane | Runs |
|---|---|
| `1/8` to `8/8` | `--shard=N/8 --grep-invert @sweep`: everything except the sweeps, 56 or 57 tests each |
| `sweep-1` to `sweep-4` | `--grep @sweep-N`: part N of both sweeps, 2 tests |

Checked with `--list`: the twelve lanes list 462 tests, the same 462 the full suite lists, none twice.
Same tests, same checks, same total runner time; the longest lane is what changes.

## Measured on CI (run for `1137531f7`, all green)

| Lane | Before (shards) | After (lanes) |
|---|---|---|
| shard 2 | 39 to 40 min | 16 min |
| `sweep-1` to `sweep-4` | (inside shard 2) | 11 min each |
| shard 8 | 28 min | 28 min, now the longest lane |
| every other shard | 4 to 12 min | 4 to 13 min |

The run's longest lane went from 40 minutes to 28. Shard 8 is the next thing to look at.

## Step 3: the third sweep

Shard 8's log showed the same shape: `tool-interactions.spec.js`'s four parts at about 10 minutes each, 41
minutes of work on two workers. Its parts are tagged `@sweep-N` too, so each sweep lane now runs part N of all
three sweeps (three tests). `--list` still gives 462 tests across the twelve lanes, the same set as the full
suite, none twice.

Measured on CI (run for `16e4f3ce3`, all 16 jobs green): shard 8 went from 28 minutes to 8, the sweep lanes take
15 each, and the longest lane is shard 2 at 17. The run's longest lane went from 40 minutes to 17.
