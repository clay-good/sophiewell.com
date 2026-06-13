// Mobile touch-target guard: every primary interactive control must be at
// least 44 CSS px in its small dimension (WCAG 2.5.5 Target Size, Apple HIG).
//
// The site is reached on a phone as often as a workstation, so a control that
// is comfortable with a mouse can still be a mis-tap with a thumb. Before
// spec-v72 four controls fell short: the copy pills (~24px tall, the most
// frequently hit small target -- they sit on every tool that emits a copyable
// result), the theme toggle (40px), the breadcrumb "back" button (~30px), and
// the "load example" reset (~36px). spec-v72 brought each up to a 44px target;
// this spec makes that a permanent regression guard so a new control (or a
// padding tweak) can never quietly reintroduce a sub-44px tap target.
//
// The check is engine-agnostic layout, so it runs on chromium only (the same
// rationale the full-catalog hscroll sweep uses). One test reports every
// offender at once so a regression names exactly which control shrank.

import { test, expect } from '@playwright/test';

const PHONE = { width: 360, height: 800 };
const MIN = 44; // WCAG 2.5.5 target size, in CSS px
const TOL = 1;  // boundingBox heights can land a sub-pixel under from rounding

// #anion-gap renders three copy pills plus the example-reset on load, and like
// every tool view it carries the breadcrumb back-button and topbar theme
// toggle -- so a single route exercises all four control classes spec-v72
// touched, with the copy pills present without any interaction.
test('mobile 360px: primary interactive controls meet the 44px touch target', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'touch-target size is engine-agnostic layout; one engine is a sufficient guard');
  await page.setViewportSize(PHONE);
  await page.goto('/#anion-gap', { waitUntil: 'load' });

  // The copy pills only exist once the result has rendered; the example
  // prefill makes that immediate, but wait explicitly so the guard is not
  // vacuous if rendering ever slows.
  await expect(page.locator('.copy-btn').first()).toBeVisible();

  // (selector, label, requireSquare) -- requireSquare also checks width, for
  // the icon-only theme toggle whose small dimension could be either axis.
  const targets = [
    ['.topbar-theme-toggle', 'theme toggle', true],
    ['.breadcrumb-back', 'breadcrumb back', false],
    ['.example-reset', 'load-example reset', false],
    ['.copy-btn', 'copy button', false],
  ];

  const offenders = [];
  for (const [selector, label, requireSquare] of targets) {
    const els = await page.locator(selector).all();
    expect(els.length, `${label} (${selector}) should be present on this view`).toBeGreaterThan(0);
    for (let i = 0; i < els.length; i++) {
      const box = await els[i].boundingBox();
      if (!box) { offenders.push(`${label} #${i} has no box`); continue; }
      const tag = els.length > 1 ? `${label} #${i}` : label;
      if (box.height < MIN - TOL) offenders.push(`${tag}: height ${box.height.toFixed(1)} < ${MIN}`);
      if (requireSquare && box.width < MIN - TOL) offenders.push(`${tag}: width ${box.width.toFixed(1)} < ${MIN}`);
    }
  }
  expect(offenders, `controls below the ${MIN}px touch target:\n${offenders.join('\n')}`).toEqual([]);
});
