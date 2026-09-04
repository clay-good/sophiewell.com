# spec-v1059 — The gate that read a shorter list than it printed

Commitment #1 is *"Every calculation runs in your browser and keeps working offline."*
`works-offline.spec.js` is what holds it, and its header is unusually careful about how easy it is to
test this falsely:

> **TWO WAYS OF SIMULATING OFFLINE WERE TRIED AND BOTH LIE HERE.** Each was checked by emptying
> `SHELL_ASSETS` to `[]` and re-running; each still passed.

So I checked it the way it asks to be checked, and the check is sound: with a listed asset that
cannot be fetched, the test fails on *"every promised shell asset is in the cache"* — the exact
assertion it advertises. Commitment #1 is properly guarded.

## What the probe found by being wrong

My first attempt injected `'/this-asset-does-not-exist.css'` and **the suite went green.** The bug
was mine — but only just. The helper ended:

```js
return [...list.matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((p) => p.startsWith('./'));
```

An entry written any other way — leading `/`, or double-quoted — was **silently dropped**. The test
would still pass, having quietly examined a shorter list than the worker promises. Nothing anywhere
said the list had been trimmed.

That is the third time this session a check turned out to be reading less than it appeared to: the
example sweep satisfied by input boxes (spec-v1054), the fact extractor consuming phantom numbers
from units (spec-v1055), and now this. In each case the filter was defensible where it was written
and silent about what it excluded.

## The change

Nothing is filtered. Every string literal in the block is returned, and the test asserts the shape it
expects:

> every shell asset is written relative to the worker scope, so none is skipped here

That converts a silent omission into a named failure. Verified by re-running the exact probe that had
slipped through: it now fails on that assertion.

## The rule

**A gate's coverage must not depend on a formatting convention in the file it reads.** If a check
narrows its input, the narrowing has to be an assertion rather than a filter — otherwise the day
someone writes the entry differently, the check keeps passing and covers less, and the only signal is
one nobody receives.
