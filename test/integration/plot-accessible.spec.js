// docs/design.md 7: the shared plot's accessibility gate. Every tile that draws a plot gives it role="img" and a
// text alternative naming what is plotted, repeats the values in a table, keeps it out of the live answer region,
// and fits a 320px screen without sideways scroll.
import { test, expect } from '@playwright/test';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const PLOTTED = [
  ['dose-history-level', 'Level over time'],
  ['enzyme-recovery-time', 'Enzyme level after stopping'],
  ['emax-hill-effect', 'Effect against concentration'],
];

for (const [id, title] of PLOTTED) {
  test(`${id}: the plot is an image with a text alternative and a value table, outside the live region`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/#${id}`);
    const svg = page.locator('figure.plot svg.plot-svg');
    await expect(svg).toHaveCount(1);
    await expect(svg).toHaveAttribute('role', 'img');
    await expect(svg).toHaveAttribute('aria-label', new RegExp(`^${title}: .+ The values are in the table below\\.$`));
    await expect(page.locator('#q-results figure.plot')).toHaveCount(0);
    expect(await page.locator('figure.plot .plot-values tbody tr').count()).toBeGreaterThan(2);
    const box = await svg.boundingBox();
    expect(box.width).toBeGreaterThan(200);
    expect(box.width).toBeLessThanOrEqual(320);
    await expectNoHScroll(page, id);
  });
}
