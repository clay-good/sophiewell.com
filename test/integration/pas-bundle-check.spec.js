// spec-v1515 tool 7: a Da Vinci PAS bundle checked against the guide's profiles, on the page.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expectNoHScroll } from '../lib/no-hscroll.js';

const fixture = readFileSync(join(process.cwd(), 'test', 'fixtures', 'pas-2.2.1', 'Bundle-HomecareAuthorizationBundleExample.json'), 'utf8');

test('the guide\'s own request example passes; an injected error is named with its path', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#pas-bundle-check');
  await page.locator('#pas-file').setInputFiles({ name: 'request.json', mimeType: 'application/json', buffer: Buffer.from(fixture) });
  const out = page.locator('#q-results');
  await expect(out).toContainText('No errors against the Da Vinci PAS profiles in this prior authorization request bundle.');
  await expect(out).toContainText('FHIRPath invariants in those profiles were not evaluated.');
  await expect(out.locator('details.receipt')).toBeVisible();
  await expectNoHScroll(page, 'pas-bundle-check');
  const bad = JSON.parse(fixture); delete bad.entry[0].resource.patient;
  await page.locator('#pas-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bad)) });
  await expect(out).toContainText('1 error against the Da Vinci PAS profiles');
  await expect(out).toContainText('Bundle.entry[0].resource.patient');
});
