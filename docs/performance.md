# Performance Budget

Per spec-v2.md section 2.1.

## What actually gates CI today

**Lighthouse does not run in CI.** It used to: `.github/workflows/ci.yml` carried a `lighthouse`
job invoking `@lhci/cli` until commit `120bacd7` (2026-08-23, *"fix(security): harden problem report
pipeline"*) deleted it along with thirty-one other lines, without a word in the commit message.
For the next eleven days this document went on describing the Lighthouse assertions as blocking
gates that a failing score would stop the build on. That is the same defect as spec-v995 and
spec-v997: a document naming an automated check that is not there.
`test/unit/performance-claims.test.js` now holds this section to the workflow, so the two cannot
disagree again.

Accessibility **is** enforced, by two checks that do run:

| Check | Runs in | Catches |
|---|---|---|
| `scripts/a11y-check.mjs` | `npm test`, CI `unit` job | missing `<html lang>`, duplicate `<h1>`, heading-level skips, an `<input>` with no `<label for>`, an `<img>` with no `alt`, an empty `<a>` |
| `test/integration/all-tools.spec.js` | CI `e2e` job | every form control in every rendered tile view has an accessible name |

Best-practices and SEO category scores are **not** gated by anything at present.

## The Lighthouse config, and how to run it

`.lighthouserc.json` is kept and current: `preset: "desktop"` with simulated throttling of
~1.6 Mbps / 150 ms RTT / 4x CPU slowdown, sampling the home view and four real tile routes. Run it
against a built `dist/` on demand:

```bash
npm run perf
```

It writes its report to `.lighthouseci/` on disk. The config previously uploaded to
`temporary-public-storage`, a third-party bucket; for a project whose first commitment is that
nothing leaves the reader's device, publishing a report of the site from every run should be a
decision someone makes deliberately rather than a default in a dormant file, so the target is now
the filesystem.

### Its assertions

`error` (would fail a run) on the accessibility, best-practices and SEO category floors at 0.95.
`warn` (reported, non-blocking) on the performance category floor and on every timing metric:

| Metric                       | Budget   |
|------------------------------|----------|
| First Contentful Paint       | < 1.0 s  |
| Largest Contentful Paint     | < 1.5 s  |
| Time to Interactive          | < 1.5 s  |
| Total Blocking Time          | < 100 ms |
| Cumulative Layout Shift      | < 0.05   |

## Transfer Size

Design targets measured at build time, tightened over time rather than auto-failed. The config
asserts no `resource-summary` byte budget.

| Surface                                   | Budget (gzip) |
|-------------------------------------------|---------------|
| Home view (HTML + CSS + app.js)           | < 100 KB      |
<!-- catalog-truth:historical -->
| Single utility view incl. primary shard   | < 250 KB      |

## Type-ahead and Calculator Latency

Per spec-v2 section 2.2:

- Search and lookup results visible within 100 ms of last keystroke on a
  2018-or-later mid-range laptop.
- Type-ahead debounce is 50 ms (fast enough not to be perceptible; just
  enough to coalesce rapid keystrokes).
- Calculators re-render on every input change with the same 50 ms
  debounce. No submit buttons.

## Mobile Touch Targets

WCAG 2.2 target-size guidance: every interactive element is at least
44 by 44 CSS pixels. The site is fully usable down to 320 px viewport
width with no horizontal scroll. This is **enforced**, not asserted:
`test/integration/mobile-no-hscroll.spec.js` sweeps every tile in the
catalog (discovered from `sitemap.xml`) at 320 px and fails CI if any
view's `documentElement.scrollWidth` exceeds its `clientWidth`, so a
new tile cannot ship horizontal overflow undetected.

## Lighthouse configuration

`.lighthouserc.json` remains available for an explicitly installed, audited
Lighthouse environment. The CLI is not installed or downloaded in CI because
its current transitive dependency tree contains unresolved advisories. To run
it in a disposable local environment after reviewing that tree:

```
npm run build
lhci autorun
```

`.lighthouserc.json` sets the desktop preset + Slow-4G-class throttling and
asserts the category-score floors and the timing metrics above. It does **not**
currently assert the transfer-size budgets (those are verified by inspection of
the build output, not by a `resource-summary` audit); the actual home-view gzip
footprint (~50 KB) sits well under the 100 KB budget. The standing
dependency-budget gate is `scripts/audit-skeleton.mjs`, separate from Lighthouse.
