# Performance Budget

Per spec-v2.md section 2.1. The numbers below are pass-fail requirements
verified in CI on every build, not aspirational targets.

## Field Targets (Slow 4G, mid-range Android emulation)

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
| Single utility view incl. primary shard   | < 250 KB      |

## Lighthouse CI Score Floors

The build fails if any of the following drops below 95 on the home view
or any utility view:

- Performance
- Accessibility
- Best Practices
- SEO

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
width with no horizontal scroll.

## CI Wiring

`.github/workflows/ci.yml` runs Lighthouse CI in the `e2e` job after
Playwright browsers are installed. Configuration lives in
`.lighthouserc.json` at the repo root. To run locally:

```
npm run build
npx @lhci/cli@latest autorun
```

The `.lighthouserc.json` configures Slow 4G throttling, asserts the
score floors above, and asserts the bundle-size budgets via Lighthouse's
`resource-summary` audits.
