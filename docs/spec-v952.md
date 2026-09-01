# spec-v952 — A gate for the thing that put CI red

## The finding

spec-v948 retired four duplicate tiles. The sweep before it grepped for the quoted form
`'cincinnati'` across `.js` and `.mjs`, found the unit and MCP tests, and fixed them. An hour
later CI went red on `test/integration/smoke.spec.js`, which writes a tile id the way a reader
does — as a **URL fragment**:

```js
await page.goto('/#cincinnati');
```

The quoted-id pattern does not match `/#cincinnati`. Two more commits landed on top before the
failure surfaced, because the e2e job takes over an hour.

The second half is the more interesting one. **The redirect worked perfectly.** The alias took
the test to `cpss` — and `cpss` is in group G, while the notice the test asserts is emitted by
a *group I* renderer. An alias keeps a reader's permalink working; it does not keep a test's
assumptions true.

## The gate

`scripts/check-test-tile-ids.mjs`, wired into `npm run lint`, reads every tile id a test
navigates to — `'/#<id>'` and `'/tools/<id>/'` — and fails on:

- an id that **is not a tile** at all, and
- an id that is **retired**, even though it redirects, unless the test is deliberately
  exercising the redirect and says so in `ALIAS_TESTS` (keyed `file:id`, so an opt-out in one
  file does not excuse another).

It runs offline in under a second against 1,491 test files, where the evidence took an hour of
CI to produce.

One bug found while writing it: reading `app.js` to end of file for `id:` swept up
`id: 'tool-body'` from a DOM helper below the array and reported **1,707** tiles against a
catalog of 1,706. The parse is bounded at the array's own closing bracket, and a test pins that.

## Proof

| Check | Result |
| --- | --- |
| `node scripts/check-test-tile-ids.mjs` | clean — 67 tile references, 1,706 live tiles, 8 retired ids |
| the same, with the spec-v951 fix reverted | **fails**, naming `smoke.spec.js:297` and the survivor |
| an id that never existed | fails with a different message |
| `ALIAS_TESTS` opt-out | excuses that file and id, and no other |
| `parseIds` on a fixture with a DOM helper below the array | 2 tiles, not 3 |
| `check-test-tile-ids.test.js` | 6 pass |
| `npm run lint` | clean, with the new gate in the chain |
