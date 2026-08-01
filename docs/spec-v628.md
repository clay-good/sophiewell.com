# spec-v628 — Close the clinical calculator gap (the last 6)

**Status:** proposal. No code changed. Written 2026-07-31. Part of the v627 program.

Of the 11 clinical tiles not yet on MCP, six are ordinary deterministic calculators that simply lack an
adapter. This spec exposes them. (The other five — decision trees and static reference — are v631.)

## The six, and what each needs

| id | name | lib compute | Needs |
|---|---|---|---|
| `preg-dating` | Pregnancy dating (LMP / CRL / EDD) | `eddFromLmp`, `gaFromCrl`, `pregnancyDiscordance` in `lib/clinical-v4.js` | an adapter that chains the three pure fns (no math change) |
| `insulin-drip` | Insulin drip math | rate ladder currently **inline** in `views/group-f.js` | extract the ladder into a pure `lib/` fn, then adapt |
| `code-blue-clock` | Code-blue documentation timer | `codeBlueClock` in `lib/scoring-v4.js` | adapter + explicit-time inputs (below) |
| `device-day-counter` | Foley / central-line device-day counter | `deviceDayCounter` in `lib/scoring-v4.js` | adapter + explicit-time inputs |
| `ews-escalation` | NEWS2 / MEWS escalation + re-assessment timer | `ewsEscalation` in `lib/scoring-v4.js` | adapter + explicit-time inputs |
| `sepsis-bundle-clock` | Surviving Sepsis bundle timer + lactate clearance | `sepsisBundleClock` in `lib/scoring-v4.js` | adapter + explicit-time inputs |

Every one of the six already has a `META.example`, so each round-trips through the existing example gate the
moment its adapter exists.

## The one design decision: the four timers and determinism

The timers are the only interesting case. On the site they read the wall clock to show "elapsed: 14 min,
next reassessment due." A tool that reads the clock is **not deterministic** — the same call returns a
different answer a minute later — which violates the program's core invariant.

**Resolution: the MCP tool takes time as explicit input and never reads a clock.** The caller passes the
start time (and, where relevant, the "as of" time or an elapsed value); the tool returns elapsed duration
and the protocol's threshold flags computed from those inputs. Identical inputs → byte-identical output, like
every other tool. The lib fns already accept an `asOf` argument, so this is a mapping choice in the adapter,
not a math change.

- `preg-dating`, `insulin-drip`: no time dependence; ordinary adapters.
- The four timers: `fields` include the explicit timestamp(s); the adapter passes them straight to the lib
  fn's `asOf`/start parameters. **The adapter must not default a missing time to "now"** — a missing
  required time is a validation failure, exactly like any other missing required input.

## Posture

These are decision-support quantities (elapsed time, a next-due threshold, a computed dating/rate), carried
with the standard clinical disclaimer (spec-v183 §3). A timer reports where the clock stands against a
published protocol window; it does not tell anyone to escalate. The `insulin-drip` tile keeps its existing
"math verifier / example protocol only" framing in its summary.

## Guards

- **Determinism.** No adapter in this set may read the system clock. Add a check (or reuse the existing
  DOM-global scan pattern) asserting the timer adapters reference no clock source; the round-trip gate already
  requires a fixed example, which a clock-reading compute would fail.
- **`insulin-drip` extraction is behavior-preserving.** The extracted lib fn must reproduce the inline
  ladder exactly; pin it with a unit test before writing the adapter.
- **Coverage math.** Exposed count rises 1405 → ~1411. `docs/mcp-coverage.md` (generated/asserted per v625)
  and `list_calculators` report the new number; nothing is hardcoded.

## What not to do

- Do **not** expose a timer that reads the clock internally "for convenience." Explicit time in, deterministic
  out — no exceptions.
- Do **not** change any formula while extracting `insulin-drip`. If the inline math is ambiguous, stop and
  flag it rather than guessing.

## Files (when built)

`lib/` (extract the `insulin-drip` ladder), `mcp/adapters/preg-dating-*.js`, `mcp/adapters/insulin-drip-*.js`,
`mcp/adapters/scoring-v4-timers-*.js` (the four timers), `mcp/catalog.js` (register), `test/unit/*`
(insulin-drip extraction parity), `test/mcp/*`, `docs/mcp-coverage.md`.
