# spec-v1749 — The unit suite's slowest test was one helper

> Status: **SHIPPED (2026-11-16)**: 1 library helper. The catalog stays 2,387.

The full unit suite took 42 minutes and then stalled on `test/unit/fuzz-tools.test.js`. Bisecting the fuzz file
by module name found `lib/nhsn-sir-v1655.js`: `nhsnMidPLimits(n)` reproduces NHSN's mid-P interval by bisection,
and each step sums a Poisson series term by term, so its cost is linear in n -- about 0.7 s at 1,000,000 and
about 9 minutes at 1e9. The fuzz matrix passes 1e9 to every exported function. On CI's idle runner the unit job
still finished (8.5 minutes); on a loaded machine it did not.

Every caller already stops at 1,000,000 or less (`nhsn-sir` 100,000; `au-rate-saar` and `device-infection-rate`
1,000,000, and `au-rate-saar` says so in its reading), so no reader could reach the slow path. The helper now
returns null past `MID_P_LIMITS_MAX` (1,000,000), as it already did for an invalid count.

| | Before | After |
|---|---|---|
| `fuzz-tools.test.js` alone | about 9 minutes (580 s and still running locally) | 14 s, 2,264 pass |

Test: `infection-prevention-v1655.test.js` (null at 1e9; the interval at 1,000,000 still answers).
