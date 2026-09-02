# spec-v986 — The offline promise had two guards, and neither touched it

## The gap

The README says:

> Calculations run locally and **keep working offline**.

Two things guard the machinery around that sentence and neither touches the sentence:

- `no-network.spec.js` proves nothing *leaves* the device — the privacy half.
- `test/unit/sw-shell.test.js` proves the service worker's precache **list** matches every asset
  `index.html` references, in both directions.

A correct list is not a populated cache. The install handler swallows every individual fetch
failure on purpose — *"Swallow individual failures; install still succeeds"* — so an asset that
404s at install time is simply absent from the shell cache, and **nothing anywhere notices**. That
is the link between the list and a reader's second visit, and it had no test.

## The escape hatch nobody had used

`scripts/serve.mjs` answers `/sw.js` with a self-unregistering stub unless `SERVE_SW` is set,
because the shell cache keys on a build hash that reads `dev` in the source tree — without the stub
every local edit is served from a stale copy. The comment beside it has always said
*"Set SERVE_SW=1 to serve the real worker when the offline behavior itself is what you are testing."*

Nothing had ever set it. `playwright.config.js` now runs a third server —
`SERVE_ROOT=dist SERVE_SW=1 PORT=4175` — and this is the test the hatch was built for.

## Two ways of faking offline, and both of them lie

Each was written, then checked by emptying `SHELL_ASSETS` to `[]` and re-running. **Each still
passed.**

- **`context.setOffline(true)`** does not apply to the service worker's own fetches here. The
  worker fell through to the live server and served the page from the network while the test
  believed it was offline.
- **`context.route('**', abort)`** does not reach what satisfies the navigation either. The
  browser's own HTTP cache answers, and not one request is recorded as aborted.

Neither shipped. A test that passes when the thing it tests is broken is worse than no test
(spec-v984), and both of these were exactly that.

## What did ship

One test, which reads the shell cache directly after the worker takes control and asserts every
asset the list promises is present **with a non-empty body**. It is the only place an asset that
404s at install would ever surface.

It is deliberately narrower than the README sentence: it proves the install populated the shell, and
does not claim to prove the browser then renders from it, **because nothing in this harness can**.
Saying so is better than a green test that means less than it looks.

## Proof

| Change | Result |
| --- | --- |
| a shell asset that 404s at install | **fails** |
| `SHELL_ASSETS` emptied to `[]` | **fails** |
| an asset dropped from the list | caught by the existing `sw-shell.test.js` — a clean split of duties |
| unchanged | passes |

## Files

New: `test/integration/works-offline.spec.js`, this file. Changed: `playwright.config.js`.
