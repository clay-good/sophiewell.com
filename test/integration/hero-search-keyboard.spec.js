// answer-shaped-results task 5.5: the home search box is an ARIA combobox and works from the keyboard alone.
// Typing makes the top match active; ArrowDown moves the active option and points aria-activedescendant at it; ArrowUp from the first option wraps to
// the last; Escape clears the box and collapses the list.

import { test, expect } from '@playwright/test';

test('hero search: combobox roles, arrow keys with aria-activedescendant, wrap, Escape', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#hero-search');
  const list = page.locator('#hero-search-results');
  await expect(input).toHaveAttribute('role', 'combobox');
  await expect(list).toHaveAttribute('role', 'listbox');

  await input.click();
  await input.fill('apgar');
  const options = list.locator('.hero-search-result');
  await expect(options.first()).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(options.first()).toHaveAttribute('role', 'option');
  const count = await options.count();
  expect(count).toBeGreaterThan(1);

  // Typing makes the top match active, so Enter takes it.
  const firstId = await options.nth(0).getAttribute('id');
  expect(firstId).toBeTruthy();
  await expect(input).toHaveAttribute('aria-activedescendant', firstId);
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'true');

  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', await options.nth(1).getAttribute('id'));
  await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(options.nth(0)).toHaveAttribute('aria-selected', 'false');

  // Back to the first, then up once more wraps to the last option.
  await input.press('ArrowUp');
  await expect(input).toHaveAttribute('aria-activedescendant', firstId);
  await input.press('ArrowUp');
  await expect(input).toHaveAttribute('aria-activedescendant', await options.nth(count - 1).getAttribute('id'));

  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-activedescendant', /.+/);
});
