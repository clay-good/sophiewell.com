// spec-v52 wave 52-1d: DOCX text extraction integration test.
//
// Drops a tiny one-paragraph DOCX on the pa-lint dropzone via
// setInputFiles and asserts the rendered finding includes the
// "DOCX parsed: N characters" line. Failing this test signals
// either a broken mammoth.js wiring or a CSP regression that blocks
// the same-origin classic-script load of /vendored/mammoth/.

import { test, expect } from '@playwright/test';

// Chromium only, same posture as pa-lint-pdf.spec.js.
test.skip(({ browserName }) => browserName !== 'chromium', 'mammoth sweep is chromium-only');

// One-paragraph DOCX, body text "Sophie PA test". Generated locally as
// a valid WordprocessingML zip (1494 bytes) and base64'd into the test
// so the fixture stays in the spec file and survives `git diff` review.
const TEST_DOCX_B64 =
  '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'
  + 'BgDpAQAA1wMAAAAA';

const DOCX_BUF = Buffer.from(TEST_DOCX_B64, 'base64');

test('pa-lint: dropping a DOCX surfaces the mammoth.js text-length line', async ({ page }) => {
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  await page.setInputFiles('#pa-file-picker', {
    name: 'tiny.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    buffer: DOCX_BUF,
  });

  // mammoth.js is lazy-loaded on first DOCX drop via dynamic <script>;
  // give the loader room to fetch + execute + parse.
  const finding = page.locator('.pa-finding').first();
  await expect(finding).toBeVisible({ timeout: 20_000 });
  await expect(finding.locator('.pa-finding-hash')).toContainText('sha256:');
  await expect(finding.locator('.pa-finding-extract')).toContainText('DOCX parsed', { timeout: 20_000 });
  await expect(finding.locator('.pa-finding-extract')).toContainText('characters of extractable text');
});
