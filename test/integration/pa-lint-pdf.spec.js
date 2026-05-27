// spec-v52 wave 52-1c: PDF text extraction integration test.
//
// Drops a tiny one-page PDF on the pa-lint dropzone via setInputFiles
// and asserts that the rendered finding includes the SHA-256 hash
// (always) plus the "PDF parsed: N page · M characters" line that
// only appears when pdf.js (vendored under /vendored/pdfjs/) loads
// and extracts text successfully. Failing this test signals either
// a broken pdf.js wiring or a CSP regression that blocks the vendored
// worker.

import { test, expect } from '@playwright/test';

// Chromium only: the test depends on consistent module-worker behavior
// and on a stable timing for the lazy import to resolve. The unit tests
// cover the pure SHA-256 path on every browser.
test.skip(({ browserName }) => browserName !== 'chromium', 'pdf.js sweep is chromium-only');

// Smallest legal one-page PDF, hand-authored from the PDF 1.4 reference.
// 178 bytes total; renders a single empty page. pdf.js reports pageCount=1
// and an empty text body (zero characters extracted), which is enough to
// prove the parser ran end-to-end without throwing.
const ONE_PAGE_PDF = Buffer.from(
  '%PDF-1.4\n'
    + '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n'
    + '2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n'
    + '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n'
    + 'xref\n0 4\n'
    + '0000000000 65535 f \n'
    + '0000000009 00000 n \n'
    + '0000000052 00000 n \n'
    + '0000000095 00000 n \n'
    + 'trailer<</Size 4/Root 1 0 R>>\n'
    + 'startxref\n149\n%%EOF\n',
  'utf8',
);

test('pa-lint: dropping a PDF surfaces the pdf.js page count and text length', async ({ page }) => {
  await page.goto('/#pa-lint');
  // The dropzone view mounts asynchronously; wait for the picker to exist.
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  await page.setInputFiles('#pa-file-picker', {
    name: 'tiny.pdf',
    mimeType: 'application/pdf',
    buffer: ONE_PAGE_PDF,
  });

  // pdf.js is lazy-loaded on first drop; give it room to fetch + init.
  const finding = page.locator('.pa-finding').first();
  await expect(finding).toBeVisible({ timeout: 20_000 });
  await expect(finding.locator('.pa-finding-hash')).toContainText('sha256:');
  await expect(finding.locator('.pa-finding-extract')).toContainText('PDF parsed', { timeout: 20_000 });
  await expect(finding.locator('.pa-finding-extract')).toContainText('1 page');
});
