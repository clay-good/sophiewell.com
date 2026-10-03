// spec-v1623 step 3: every live file tool takes handed-off files through its
// own input, so a handed-off file renders exactly what choosing it does.
// For each tool: render it, call its view's acceptFiles with a fixture, read
// the tool body; render it again, choose the same fixture in the input, read
// it again; the two must match.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'test', 'fixtures', 'file-kinds');

// tool -> [view module, fixture, input id, kind]
const CASES = {
  'x12-835-reader': ['group-v1515', 'x12-835.835', 'x835-files', 'x12-835'],
  'denial-pattern-report': ['group-v1515', 'x12-835.835', 'dpr-files', 'x12-835'],
  'underpayment-check': ['group-v1515', 'x12-835.835', 'upc-remittances', 'x12-835'],
  'x12-837-check': ['group-v1515', 'x12-837p.837', 'x837-files', 'x12-837p'],
  'x12-271-reader': ['group-v1515', 'x12-271.271', 'x271-file', 'x12-271'],
  'x12-277-reader': ['group-v1515', 'x12-277.277', 'x277-files', 'x12-277'],
  'hpt-file-check': ['group-v1515', 'hpt-tall.csv', 'hpt-file', 'hpt-csv'],
  'tic-file-check': ['group-v1604', 'tic-in-network.json', 'tic-files', 'tic-in-network'],
  'tic-rate-lookup': ['group-v1604', 'tic-in-network.json', 'trl-files', 'tic-in-network'],
  'carin-eob-reader': ['group-v1602', 'carin-eob.json', 'cer-files', 'fhir-carin-eob'],
  'itemized-bill-check': ['group-v1602', 'hpt-tall.csv', 'ibc-price-file', 'hpt-csv'],
  'mfp-refund-reconcile': ['group-v1510', 'x12-835.835', 'mrr-835', 'x12-835'],
  'pas-bundle-check': ['group-v1515', 'pas-request.json', 'pas-file', 'fhir-pas'],
  'appeal-worklist': ['group-v1516', 'x12-835.835', 'aw-835-files', 'x12-835'],
  'mpr-gap-days': ['group-v1513', 'fill-history.csv', 'mpr-upload-file', 'csv-mapped'],
  'med-sync-plan': ['group-v1513', 'ambiguous.csv', 'sync-upload-file', 'csv-mapped'],
  'pa-lint': ['pa-lint', 'packet.pdf', 'pa-file-picker', 'pdf'],
};

test.skip(({ browserName }) => browserName !== 'chromium', 'one engine is enough for the equivalence; intake.spec.js covers three');

const bodyText = (page) => page.evaluate(async () => {
  await new Promise((r) => setTimeout(r, 1500));
  return document.getElementById('tool-body').innerText.replace(/\s+/g, ' ').trim();
});

for (const [tool, [view, fixture, inputId, kind]] of Object.entries(CASES)) {
  test(`${tool}: a handed-off file renders what choosing it does`, async ({ page }) => {
    const bytes = [...readFileSync(join(DIR, fixture))];
    await page.goto(`/#${tool}`);
    await expect(page.locator(`#${inputId}`)).toBeAttached();
    const before = await bodyText(page);
    await page.evaluate(async ({ view, tool, fixture, bytes, kind }) => {
      const mod = await import(`/views/${view}.js`);
      const file = new File([new Uint8Array(bytes)], fixture);
      mod.acceptFiles[tool](document.getElementById('tool-body'), [file], { kind });
    }, { view, tool, fixture, bytes, kind });
    const handed = await bodyText(page);

    await page.goto('/');
    await page.goto(`/#${tool}`);
    await page.locator(`#${inputId}`).setInputFiles({ name: fixture, mimeType: 'application/octet-stream', buffer: readFileSync(join(DIR, fixture)) });
    const chosen = await bodyText(page);
    expect(handed).toBe(chosen);
    expect(handed, 'the file changed nothing on the page').not.toBe(before);
  });
}
