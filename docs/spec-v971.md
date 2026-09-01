# spec-v971 — `npm run test:mobile`: the seventy-minute check, in under two

## Why

The two chromium 320px sweeps are the only gates in this repository that lay a page out, and so
the only ones that can see a line too wide for a phone. They live inside `npm run test:e2e`,
which builds `dist/` and then runs the whole Playwright suite across three browsers — **63
minutes in CI**, with a 27-minute single spec inside it. Nobody runs that before pushing. So the
sweeps are effectively CI-only, and their failures arrive an hour after the mistake.

They have caught the same class of bug twice, and both times every local gate was green first:

| | The string | Reported |
| --- | --- | --- |
| spec-v677 | a slash-joined token in a factor string | mobile sweep, in CI |
| spec-v969 | a citation label CSS forbade from wrapping | both sweeps, in CI, 70 minutes later |

`lint`, `test:unit`, `test:mcp` and `build` cannot see either. They do not have a viewport.

## What this adds

```json
"test:mobile": "npm run build && playwright test test/integration/mobile-no-hscroll.spec.js test/integration/static-pages-mobile.spec.js --project=chromium"
```

Measured on this machine: **38 tests, 1.7 minutes** — the whole 1,708-page pre-rendered sweep,
every in-app tile route from the sitemap, the dark-theme and print paths, and the `/tools/`
index. It is the same code and the same assertion CI runs; it drops the two other browsers and
every spec that is not about width.

`CONTRIBUTING.md` now says when to reach for it, in the section a contributor is already reading
when they add a tile: **if you touched tile text, a label, or CSS, run `npm run test:mobile`.**
It also names the underlying rule, since a fast gate is worth less than not tripping it — any
string a tile supplies becomes real pixels, so prefer spaces and commas to slash-joined tokens
and keep anything that renders as its own line short.

## Proof

| Check | Result |
| --- | --- |
| `npm run test:mobile` | **38 passed (1.7m)** |
| the same assertions inside `npm run test:e2e` in CI | 63 minutes |
| `npm run lint` | clean |

No tile, computation or citation changed.
