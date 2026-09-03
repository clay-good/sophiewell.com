// spec-v1018: a reading measured from "now" runs away from a worked example that
// pins a date.
//
// Nineteen tiles carry an absolute date in their example, and for most that is
// harmless: a date of service or a date of birth means the same thing whenever
// the page is opened. Four compute an ELAPSED figure from today, and those rot.
// Measured in September 2026, against examples written in May:
//
//   due-date          "Current gestational age: 87 weeks 1 days"
//   preg-dating       "current GA 36w 2d" and a 172-day discordance against the
//                     same ultrasound -- a discordance that cannot happen
//   code-blue-clock   "Code time: 154215.8 min" -- 107 days of CPR
//
// The fix is not to hide the tool's arithmetic. The due date, the implied EDD
// and the interval targets are all computed from the dates ENTERED and stand
// whenever the page is opened; only the from-today figure is withheld, with the
// reason, once it has run past what the instrument can mean.

import { test, expect } from '@playwright/test';

test('due-date: the EDD stands, the runaway gestational age does not', async ({ page }) => {
  await page.goto('/#due-date');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  // The example's LMP is years old by now, so no age is claimed.
  expect(text).toMatch(/Estimated due date/);
  expect(text).not.toMatch(/gestational age: \d\d+ weeks/);
  expect(text).toMatch(/past the ~42 weeks/);

  // A real, current LMP still reports an age.
  const recent = new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10);
  await page.locator('#lmp').fill(recent);
  await expect(page.locator('#q-results')).toContainText('Current gestational age: 17 weeks');
});

// And the same sweep found a comparison that was wrong for the same reason,
// whatever the date: the LMP age was measured TODAY and the ultrasound age at
// the SCAN, so the difference between them grew with the calendar. The worked
// example (LMP 2025-12-23, scan 2026-03-12, CRL 50 mm) reported "Discordance:
// 172 days ... Consider redating to ultrasound" when the real difference on the
// day of the scan is 3 days, inside the 7-day first-trimester limit. A redating
// decision was being made on an artifact of the clock.
test('preg-dating: the redating comparison is made on the day of the scan', async ({ page }) => {
  await page.goto('/#preg-dating');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  expect(text).toMatch(/LMP-derived EDD/);
  expect(text).toMatch(/Discordance at the ultrasound date: 3 days \(T1 threshold 7\)/);
  expect(text).toMatch(/Within accepted limit/);
});

test('code-blue-clock: a start time days old is a date to check, not a code time', async ({ page }) => {
  await page.goto('/#code-blue-clock');
  await page.waitForSelector('#q-results');
  await page.waitForTimeout(350);
  const text = (await page.locator('#q-results').innerText()).replace(/\s+/g, ' ');
  expect(text).not.toMatch(/Code time: \d{4,}/);
  expect(text).toMatch(/The code start entered is \d+ days ago/);
  // The interval targets are arithmetic on the entered times and still show.
  expect(text).toMatch(/Next rhythm check/);
});
