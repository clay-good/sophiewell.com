// Numerical correctness sweep. For every tool that ships a META.example, we
// click "Test with example", read the rendered output, and assert that every
// numeric token from the documented expected string appears in the result.
//
// Numbers (integers, decimals, percentages) are highly diagnostic: if the
// calculator silently computes the wrong value, the expected numbers won't
// appear in the rendered output and this test fails loudly.
//
// This is a complement to the per-function unit tests, which assert the
// JS layer in isolation. This sweep asserts the wiring all the way through:
// example payload -> input fill -> renderer -> live-render listener -> DOM.

import { test, expect } from '@playwright/test';

// Skip in firefox/webkit; the long monolithic loop is unreliable there
// (see test/integration/tool-interactions.spec.js for the same rationale).
test.skip(({ browserName }) => browserName !== 'chromium', 'numeric sweep is chromium-only');

test('every example payload produces the documented numeric output', async ({ page }) => {
  // This is a serial, full-catalog numeric sweep (one navigation + reset-click
  // per tile). Its wall-clock grows linearly with the catalog and contends for
  // CPU with the other browser projects under `npm run test:e2e`. At the
  // current catalog size a clean run is ~5 min in isolation, so the budget is
  // generous headroom above
  // that to absorb CI worker contention without a timeout flake; a real numeric
  // mismatch still fails fast (per-tile), never via this timeout.
  test.setTimeout(600_000);

  // Pull META.example payloads out of the live module so the test stays in
  // sync with whatever lib/meta.js currently declares -- no duplication.
  await page.goto('/');
  const examples = await page.evaluate(async () => {
    const mod = await import('/lib/meta.js');
    const out = [];
    for (const [id, m] of Object.entries(mod.META)) {
      if (m && m.example && m.example.expected) {
        out.push({ id, expected: m.example.expected });
      }
    }
    return out;
  });
  expect(examples.length).toBeGreaterThan(40);

  // Pull all numeric values out of a string, returning [{value, raw, isApprox,
  // isPercent, rangeEnd}]. Skips citation years and explicit ranges' second
  // halves, and recognizes "~" / "approx" markers.
  function numericFacts(s) {
    const facts = [];
    // Match optional ~ then a number then optional % or range "-N"
    const re = /(~)?(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?(\s*%)?/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const raw = m[0];
      const value = Number(m[2]);
      // Skip 4-digit year-shaped integers (citation years).
      if (Number.isInteger(value) && value >= 1900 && value <= 2100 && /^\d{4}$/.test(m[2])) continue;
      facts.push({
        value,
        raw,
        isApprox: !!m[1],
        rangeEnd: m[3] ? Number(m[3]) : null,
        isPercent: !!m[4],
      });
    }
    return facts;
  }

  function findNumberNear(haystack, fact) {
    // Tolerance: explicit ~ means +/-15%; ranges accept any value in range;
    // otherwise +/-2% relative or 0.05 absolute (whichever is larger), so
    // 5.0 matches 5 and 2.0 matches 2 and 22.86 matches 22.9.
    const tol = fact.isApprox ? Math.max(Math.abs(fact.value) * 0.15, 1)
              : Math.max(Math.abs(fact.value) * 0.02, 0.05);
    const lo = fact.rangeEnd != null ? Math.min(fact.value, fact.rangeEnd) - tol : fact.value - tol;
    const hi = fact.rangeEnd != null ? Math.max(fact.value, fact.rangeEnd) + tol : fact.value + tol;
    const found = [...haystack.matchAll(/\d+(?:\.\d+)?/g)].map((x) => Number(x[0]));
    return found.some((n) => n >= lo && n <= hi);
  }

  // META examples whose `expected` text describes scenario inputs or
  // citation-derived reference numbers rather than the calculator's actual
  // output. The numeric sweep can't validate these without misfiring; the
  // unit tests in test/unit/ cover their math.
  const SCENARIO_ONLY = new Set([
    // expected echoes input scenario, tool only renders the result
    'conc-rate', 'opioid-mme', 'free-water-deficit',
    // expected describes the reference band, not the computed cell
    'rcri',
    // expected includes derivation breakdown the tool doesn't echo
    'maint-fluids', 'iron-ganzoni',
    // expected hour-band is local-tz-dependent (datetime-local input,
    // ISO output uses runner's offset); the unit test asserts the
    // math directly.
    'ews-escalation',
    // spec-v52 wave 52-1b: pa-lint is a document-linter tile (shape:
    // document-linter); its output is computed at file-drop time, not
    // from a META.example.fields payload, and its expected text is
    // descriptive (mentions "SHA-256" and "spec-v29 §3"). The numeric
    // sweep can't drive a file-drop, so this tile is allowlisted; the
    // unit tests cover the hashing path indirectly via crypto.subtle.
    'pa-lint',
  ]);

  const failures = [];
  for (const { id, expected } of examples) {
    if (SCENARIO_ONLY.has(id)) continue;
    const facts = numericFacts(expected);
    if (facts.length === 0) continue;

    await page.goto('/#' + id, { waitUntil: 'load' });
    await page.waitForTimeout(60);

    // spec-v9 §3.3: examples are prefilled on load and a "Reset to
    // example" link restores them. Click the link to re-apply the
    // example so the test is robust even if defaults change later.
    const resetLink = page.locator('.example-reset').first();
    if (!(await resetLink.isVisible().catch(() => false))) {
      failures.push({ id, reason: 'no example reset link rendered' });
      continue;
    }
    await resetLink.click();
    await page.waitForTimeout(120);

    const text = await page.locator('main').innerText();
    const cleaned = text.replace(/Expected:[^\n]*/g, '');

    const missing = facts.filter((f) => !findNumberNear(cleaned, f)).map((f) => f.raw);
    if (missing.length) {
      failures.push({ id, expected, missing, got: cleaned.slice(0, 400) });
    }
  }

  if (failures.length) {
    console.log('CORRECTNESS FAILURES:\n' + JSON.stringify(failures, null, 2));
  }
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});
