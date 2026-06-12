# Performance Budget

Per spec-v2.md section 2.1. The accessibility / best-practices / SEO score
floors below are **hard CI gates** (assertion level `error` — they fail the
build). The performance score and the individual timing metrics are tracked as
Lighthouse `warn` assertions (surfaced on every run, non-blocking), and the
transfer-size budgets are design targets measured at build time; they are
tightened over time rather than auto-failed.

## Field Targets (desktop form factor, Slow-4G-class throttling)

Lighthouse runs `preset: "desktop"` with simulated throttling of ~1.6 Mbps /
150 ms RTT / 4× CPU slowdown (`.lighthouserc.json`). These metrics are `warn`
assertions:

| Metric                       | Budget   |
|------------------------------|----------|
| First Contentful Paint       | < 1.0 s  |
| Largest Contentful Paint     | < 1.5 s  |
| Time to Interactive          | < 1.5 s  |
| Total Blocking Time          | < 100 ms |
| Cumulative Layout Shift      | < 0.05   |

## Transfer Size

| Surface                                   | Budget (gzip) |
|-------------------------------------------|---------------|
| Home view (HTML + CSS + app.js)           | < 100 KB      |
<!-- catalog-truth:historical -->
| Single utility view incl. primary shard   | < 250 KB      |

## Lighthouse CI Score Floors

The build **fails** (assertion level `error`, minScore 0.95) if any of these
drops below 95 on the home view or any sampled utility view:

- Accessibility
- Best Practices
- SEO

The **Performance** category floor (0.95) is asserted at `warn` level — it is
reported but does not fail the build.

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

## CI Wiring

`.github/workflows/ci.yml` runs Lighthouse CI in its own `lighthouse` job
(`needs: unit`), via `npx @lhci/cli@0.13.x autorun`. Configuration lives in
`.lighthouserc.json` at the repo root. To run locally:

```
npm run build
npx @lhci/cli@0.13.x autorun
```

`.lighthouserc.json` sets the desktop preset + Slow-4G-class throttling and
asserts the category-score floors and the timing metrics above. It does **not**
currently assert the transfer-size budgets (those are verified by inspection of
the build output, not by a `resource-summary` audit); the actual home-view gzip
footprint (~50 KB) sits well under the 100 KB budget. The standing
dependency-budget gate is `scripts/audit-skeleton.mjs`, separate from Lighthouse.
