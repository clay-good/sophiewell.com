// spec-v52 §4.3 / §8.1: runtime no-network posture for the PA linter.
//
// §4.3 commits, in writing, that the only network access in a PA session
// is the initial page load plus the service-worker shell warm-up; after
// first paint there are zero outbound requests, and the patient's chart
// never leaves the tab. This is the runtime proof of that commitment and
// of Sophie's first commitment (spec-v50 §3.1): the whole packet stays
// client-side.
//
// It mirrors the generic harness in no-network.spec.js but drives the
// PA pipeline end-to-end instead of a sample of numeric tiles:
//   - drops a happy-path TXT packet (ingest → classify → extract →
//     engine → findings render) AND a one-page PDF, which forces the
//     lazy pdf.js import (/vendored/pdfjs/) — the single most likely
//     place for an accidental off-origin fetch (cmaps, standard fonts,
//     a CDN worker);
//   - serializes all three report flavors (DOCX, full JSON, redacted
//     JSON) by clicking each download button — every byte is built from
//     the in-memory bundle via URL.createObjectURL, never fetched;
// and then asserts:
//   - zero requests to any origin other than the page origin;
//   - zero navigator.sendBeacon / Image-pixel fires;
//   - document.cookie empty after the whole pipeline;
//   - only allowlisted localStorage / sessionStorage keys (the PA tile
//     writes none).

import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// Chromium only, same posture as the other pa-lint specs: the test leans
// on consistent module-worker behavior and stable timing for the lazy
// pdf.js import to resolve.
test.skip(({ browserName }) => browserName !== 'chromium', 'PA no-network sweep is chromium-only');

async function loadAllowlist() {
  const text = await readFile(join(ROOT, 'scripts', 'storage-allowlist.json'), 'utf8');
  return JSON.parse(text);
}

function isSameOrigin(reqUrl, pageOrigin) {
  try {
    const u = new URL(reqUrl);
    if (u.protocol === 'data:' || u.protocol === 'blob:' || u.protocol === 'about:') return true;
    return u.origin === pageOrigin;
  } catch (_) {
    return true;
  }
}

// Canonical happy-path packet (synced to the e2e mirror in
// pa-lint-engine.spec.js). Lights the starter rules green so the engine
// renders a full findings list, exercising the whole compute path.
const HAPPY_TEXT = [
  'Cover sheet',
  'Patient: Jane Q Doe',
  'DOB: 1985-03-12',
  'Member ID: W123456789',
  'Date of service: 2026-04-12',
  'Procedure 99213 office visit',
  'Quantity: 1',
  'Dx: I10 essential hypertension',
  'Place of service: 11',
  'Ordering provider NPI: 1234567893',
  'TIN: 123456789',
  'Chief complaint: hypertension follow-up',
  'Medical necessity: required for blood-pressure control.',
  'Step therapy: trial of lisinopril completed without adequate response.',
  'Active medications: lisinopril 10 mg daily.',
  'Allergies: NKDA.',
  'Duration: 12 months requested.',
  'Servicing facility NPI: 1306849393',
  'Signature: Jane Doe MD, 2026-04-12',
].join('\n') + '\n';

// Smallest legal one-page PDF (from pa-lint-pdf.spec.js): forces the
// lazy pdf.js import to load and parse, which is the network-risk path.
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

test('runtime: PA pipeline fires fully client-side, no off-origin calls', async ({ page }) => {
  test.setTimeout(60_000);
  const allow = await loadAllowlist();
  const allowKeys = new Set(allow.keys);

  const pageOrigin = new URL(page.context()._options?.baseURL || process.env.BASE_URL || 'http://localhost:4173').origin;

  const offOriginRequests = [];
  page.on('request', (req) => {
    const url = req.url();
    if (!isSameOrigin(url, pageOrigin)) {
      offOriginRequests.push({ method: req.method(), url });
    }
  });

  // Tripwire navigator.sendBeacon and Image before any tile code runs.
  await page.addInitScript(() => {
    window.__sw_beaconCalls = [];
    if (navigator.sendBeacon) {
      const orig = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url, data) => {
        window.__sw_beaconCalls.push({ kind: 'sendBeacon', url: String(url) });
        return orig(url, data);
      };
    }
    const OrigImage = window.Image;
    window.Image = function PatchedImage(...args) {
      const inst = new OrigImage(...args);
      try {
        Object.defineProperty(inst, 'src', {
          set(v) {
            try { window.__sw_beaconCalls.push({ kind: 'image.src', url: String(v) }); } catch (_) {}
            OrigImage.prototype.__lookupSetter__('src').call(inst, v);
          },
          get() { return OrigImage.prototype.__lookupGetter__('src').call(inst); },
        });
      } catch (_) {}
      return inst;
    };
    window.Image.prototype = OrigImage.prototype;
  });

  await page.goto('/#pa-lint', { waitUntil: 'networkidle' });
  await expect(page.locator('#pa-file-picker')).toBeAttached();

  // Drop the TXT packet + the PDF together: the engine runs over the
  // combined bundle and the PDF forces the lazy pdf.js import.
  await page.setInputFiles('#pa-file-picker', [
    { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from(HAPPY_TEXT, 'utf8') },
    { name: 'tiny.pdf', mimeType: 'application/pdf', buffer: ONE_PAGE_PDF },
  ]);

  // Engine ran: findings rendered.
  await expect(page.locator('.pa-findings-headline')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.pa-rule').first()).toBeVisible();
  // pdf.js loaded and parsed (proves the vendored parser ran, not a CDN one).
  await expect(page.locator('.pa-finding-extract', { hasText: 'PDF parsed' }).first())
    .toBeVisible({ timeout: 20_000 });

  // Serialize every report flavor. Each click builds a Blob from the
  // in-memory bundle and downloads it; capturing the download proves the
  // report path ran to completion without a fetch.
  for (const flavor of ['docx', 'json-full', 'json-redacted']) {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(`.pa-download-btn[data-flavor="${flavor}"]`),
    ]);
    expect(download.suggestedFilename(), `download fired for ${flavor}`).toBeTruthy();
  }

  // Drain any async work (lazy import revoke timers, worker postMessage).
  await page.waitForTimeout(500);

  // 1. No off-origin requests at all across the whole pipeline.
  expect(offOriginRequests, `off-origin requests: ${JSON.stringify(offOriginRequests, null, 2)}`).toEqual([]);

  // 2. No beacon / image-pixel calls fired.
  const beaconCalls = await page.evaluate(() => window.__sw_beaconCalls || []);
  expect(beaconCalls, `beacon-style calls: ${JSON.stringify(beaconCalls, null, 2)}`).toEqual([]);

  // 3. document.cookie stays empty after the full pipeline (spec-v50 §3.3).
  const cookieValue = await page.evaluate(() => document.cookie);
  expect(cookieValue, 'document.cookie must be empty (spec-v50 §3.3)').toBe('');

  // 4. localStorage / sessionStorage keys must be on the allowlist; the
  //    PA tile writes none of its own (spec-v52 §4.7).
  const storageKeys = await page.evaluate(() => ({
    local: Object.keys(window.localStorage || {}),
    session: Object.keys(window.sessionStorage || {}),
  }));
  for (const k of storageKeys.local) {
    expect(allowKeys.has(k), `localStorage key "${k}" not in storage-allowlist (spec-v50 §3.4)`).toBe(true);
  }
  for (const k of storageKeys.session) {
    expect(allowKeys.has(k), `sessionStorage key "${k}" not in storage-allowlist (spec-v50 §3.4)`).toBe(true);
  }
});
