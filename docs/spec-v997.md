# spec-v997 — "This is the same gate that runs in CI" was not

## The finding

CONTRIBUTING says, twice:

> `npm run release:check` runs the same chain CI does. When one fails it names itself.
>
> Before opening a PR, run `npm run release:check` locally. This is the same gate that runs in CI.

CI has three jobs. `release:check` ran the equivalent of one and a bit:

| CI job | What it runs | In `release:check`? |
| --- | --- | --- |
| `unit` | build-data seed, verify-integrity, lint, test:unit, test:a11y, build, build-idempotence | yes, apart from the two runner-only steps |
| `mcp` | `check-mcp-catalog`, **`npm run test:mcp`** | the gate yes, **the 421 tests no** |
| `e2e` | the full Playwright suite | **no** |

So a contributor could run the command CONTRIBUTING calls "the same gate", see it pass, and be
missing an entire job's tests plus the whole end-to-end suite — which is where this project's CI
failures have actually landed: a citation label that could not wrap at 320px, a related-tools list
asserted in order, an `h3` under the page `h1`. Every one of those was green locally and red an
hour later, and the document said that could not happen.

## What changed

`npm run test:mcp` is in `release:check`. It costs about three minutes and it is a job CI runs.

The e2e suite is not, and cannot sensibly be: it needs Playwright browsers and about an hour.
CONTRIBUTING says that plainly now instead of implying the opposite, and points at the fast 320px
subset (`npm run test:mobile`, 1.5 minutes) that the section below it already documented for
exactly this reason.

`test/unit/release-check-covers-ci.test.js` is what keeps the sentence true. It parses
`.github/workflows/ci.yml`, walks `release:check` through the npm scripts it invokes, and asserts
that every step in the two locally reproducible jobs is reachable. A new CI step either joins the
local chain or is listed as `CI_ONLY` **with a reason** — `npm ci`, the offline dataset seed, and
the post-build `git diff --exit-code` are the four there today.

It also asserts CONTRIBUTING still says the e2e suite is not covered, so the accurate sentence
cannot quietly be edited back into the inaccurate one.

## Proof

Negative-tested in both directions: adding a step to CI's `unit` job fails the test naming that
step, and removing `test:mcp` from `release:check` fails it naming `mcp: npm run test:mcp`.
