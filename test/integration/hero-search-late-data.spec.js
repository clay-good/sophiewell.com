// The synonym table loads in the background. A query typed before it arrives is first ranked on names alone; when
// the table lands, the open results must re-rank without another keystroke. Before this, "they denied it" kept a
// Texas tool on top until the reader typed again (seen as a smoke-test flake under load, 2026-10-20).

import { test, expect } from '@playwright/test';

test('hero search re-ranks open results when the synonym table arrives late', async ({ page }) => {
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  await page.route('**/data/synonyms.json', async (route) => {
    await held;
    await route.continue();
  });
  await page.goto('/');
  const input = page.locator('#hero-search');
  await input.click();
  await input.fill('they denied it');
  const first = page.locator('#hero-search-results .hero-search-result').first();
  await expect(first).toBeVisible();
  // Name ranking alone does not reach the appeal letter for this phrasing.
  await expect(first).not.toHaveAttribute('data-tool', 'appeal-letter');
  release();
  await expect(first).toHaveAttribute('data-tool', 'appeal-letter', { timeout: 10000 });
});
