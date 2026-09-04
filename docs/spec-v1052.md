# spec-v1052 — A MUST with nothing behind it

spec-v1051 checked that each vendored library's license is real. This one checks that what the
**public page says about them** is true.

## The comment that was the whole enforcement

`/commitments/` lists every vendored third-party library with its upstream, version and license.
That list is hand-written in `scripts/build-commitments-page.mjs`, under this:

> Each entry **MUST** stay in sync with the corresponding `_vendored.md` ledger.

A MUST in a comment is a hope. Two ways it goes wrong, and neither leaves a trace:

- **A fourth library is vendored.** It ships to every reader, and the page goes on describing three.
  The commitments page is where someone auditing the site looks to find out what third-party code
  reaches their browser; an undisclosed one is the single most consequential thing that list can get
  wrong.
- **A version or license is bumped in the ledger** during an upgrade and not on the page, so the
  page keeps publishing the old one.

## The check

`checkVendoredDisclosure()` reads both and compares, in both directions:

| Assertion | Catches |
| --- | --- |
| every directory under `vendored/` appears on the page | a library shipped but not disclosed |
| every page entry names a directory that exists | a library removed but still advertised |
| the ledger's license family matches the page's | "Apache-2.0" against a BSD ledger |
| the ledger's upstream repo matches the page's | a fork swapped in |
| the ledger's release tag appears in the page's version string | an upgrade recorded in one place |

The license and version comparisons are deliberately loose in one direction only: the page says
`Apache-2.0` where the ledger says *"Apache License 2.0 (see LICENSE in this directory)"*, and
tesseract's page version is `5.1.1 (+ tesseract.js-core 5.1.0, tessdata_fast eng)` against a ledger
tag of `v5.1.1`. Family-matching and substring-containment handle both without letting a real
mismatch through — verified by bumping a ledger tag to `v9.9.999` and watching it fail.

## The side effect that would have made the check useless

Reading the list means importing the builder, and the builder wrote the page at import time. A
checker that regenerates the artifact as a side effect of reading it **can never report that the
artifact is stale** — it would have made the page match on every run, by rebuilding it. `main()` is
now guarded by the `process.argv[1]` idiom the other scripts use; `build.mjs` spawns it as a
subprocess, so nothing changed there.

That trap is already in this project's notes as *"a check script must not run at import"*. It is
worth restating with the reason attached: the danger is not the wasted work, it is that the check
becomes a tautology.
