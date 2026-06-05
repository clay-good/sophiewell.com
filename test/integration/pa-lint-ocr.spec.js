// spec-v52 §4.3.1: end-to-end proof of the optional on-device OCR path.
// Generates a PNG of a printed PA form in-page (canvas), drops it on the
// pa-lint tile, runs on-device OCR (vendored tesseract.js), and asserts the
// deterministic engine then runs over the OCR-extracted text. OCR is heavier
// than the other parsers, so this test carries a generous timeout.
import { test, expect } from '@playwright/test';

test('pa-lint: an image runs on-device OCR and the engine lints the extracted text', async ({ page }) => {
  test.setTimeout(120_000);

  // spec-v50 §3.1: capture every request URL; assert none is off-origin (the
  // engine, worker, WASM core, and language data must all load from the
  // same-origin /vendored/tesseract/ directory).
  const requestUrls = [];
  page.on('request', (req) => requestUrls.push(req.url()));

  // Exercise the whole OCR flow at a 360px mobile width so the new control is
  // covered by the no-horizontal-scroll guarantee too.
  await page.setViewportSize({ width: 360, height: 720 });
  await page.goto('/#pa-lint');
  await expect(page.locator('#pa-file-picker')).toBeAttached();
  const baseOrigin = new URL(page.url()).origin;

  // Build a clean, high-contrast PNG of a short Aetna PA form entirely in the
  // page, then hand it to the file picker as a dropped image. Large crisp text
  // so the fast LSTM model reads it reliably in headless CI.
  const pngDataUrl = await page.evaluate(async () => {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 360;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#000';
    ctx.font = '34px Arial, sans-serif';
    const lines = [
      'Aetna PPO Prior Authorization Request',
      'Member ID: W123456789',
      'Requested procedure: CPT 72148',
      'Medical necessity per Aetna CPB.',
    ];
    lines.forEach((t, i) => ctx.fillText(t, 24, 60 + i * 70));
    return c.toDataURL('image/png');
  });
  const buffer = Buffer.from(pngDataUrl.split(',')[1], 'base64');

  await page.setInputFiles('#pa-file-picker', {
    name: 'scan.png', mimeType: 'image/png', buffer,
  });

  // The OCR affordance must appear for an image (no embedded text).
  const ocrBtn = page.locator('.pa-ocr-btn');
  await expect(ocrBtn).toBeVisible({ timeout: 10_000 });

  // Run on-device OCR; the engine should then evaluate the full rule set.
  await ocrBtn.click();
  await expect(page.locator('.pa-findings-headline')).toBeVisible({ timeout: 90_000 });
  await expect(page.locator('.pa-rule')).toHaveCount(835);
  // The Aetna overlay coverage-criteria rule (001) should resolve to a pass
  // because the OCR'd text both names a procedure and cites the CPB.
  await expect(page.locator('.pa-rule[data-rule="R-PA-AETNA-001"][data-status="pass"]')).toHaveCount(1);

  // Every request the whole OCR flow made was same-origin (no CDN, no AI
  // service): the vendored engine + worker + WASM + language data all loaded
  // from /vendored/tesseract/.
  const off = requestUrls.filter((u) => {
    if (u.startsWith('data:') || u.startsWith('blob:')) return false;
    try { return new URL(u).origin !== baseOrigin; } catch { return false; }
  });
  expect(off, `off-origin requests during OCR: ${off.join(', ')}`).toEqual([]);
  // And the OCR assets really came from the vendored same-origin directory.
  expect(requestUrls.some((u) => u.includes('/vendored/tesseract/'))).toBe(true);
});
