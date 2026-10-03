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

Design targets, not enforced: the config asserts no `resource-summary` byte budget.

| Surface                                   | Budget (gzip) |
|-------------------------------------------|---------------|
| Home view (HTML + CSS + app.js)           | < 100 KB, **not met** (see below) |
<!-- catalog-truth:historical -->
| Single utility view incl. primary shard   | < 250 KB      |

## Cold boot, measured (spec-v1541 §4)

The budget above counts `app.js` alone, and this page used to say the home view's gzip footprint
was about 50 KB. That was never what a visit costs. `app.js` statically imports every view and
library module, so every route loads the whole app before it shows anything. Measured with
`npm run perf:boot` (`scripts/measure-boot.mjs`) against the built `dist/`, Chromium, CPU slowed
4x, cold HTTP cache, no service worker, median of three runs, October 3, 2026:

| Route | Boot (DOMContentLoaded) | Ready | Files (JS) | Raw | Gzip, file by file | Gzip at 1.6 Mbps |
|---|---|---|---|---|---|---|
| `/` | 1.5 s | 1.6 s | 2007 (2001) | 19.8 MB | 6.4 MB | 32.2 s |
| `/#bmi` | 0.8 s | 0.9 s | 2007 (2001) | 19.8 MB | 6.4 MB | 32.2 s |
| `/#egfr` | 1.2 s | 1.3 s | 2007 (2001) | 19.8 MB | 6.4 MB | 32.2 s |
| `/#wells-pe` | 1.1 s | 1.2 s | 2007 (2001) | 19.8 MB | 6.4 MB | 32.2 s |
| `/#gcs` | 1.1 s | 1.2 s | 2007 (2001) | 19.8 MB | 6.4 MB | 32.2 s |

"Ready" is the home box on screen, or the tool's worked example in `#q-results`. The network was
local, so the time columns are CPU cost; the last column is the network cost, computed.

What this says:

- **The first visit is a 6.4 MB download** on every route: about 30 seconds on the Lighthouse
  profile's 1.6 Mbps, longer on 2G. After it, the service worker's offline pack (spec-v1541 §1)
  serves every later visit from the phone, so the cost is paid once per pack version.
- **Parsing is not the bottleneck on this machine.** Boot stays under 2 seconds at 4x, below the
  5-second line at which spec-v1541 §4 calls for loading views on demand. But 4x of an Apple M4
  is not a 1-2 GB Android Go phone, which can be 10 times slower again. That device has not been
  measured, and until it is, lazy view loading stays unbuilt rather than ruled out.

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
the build output, not by a `resource-summary` audit). The home view's real
footprint is in "Cold boot, measured" above, far over the 100 KB budget. The standing
dependency-budget gate is `scripts/audit-skeleton.mjs`, separate from Lighthouse.
