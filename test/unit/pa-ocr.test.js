// spec-v52 §4.3.1: unit tests for the OCR glue (lib/pa/ocr.js). The heavy
// engine (tesseract.js) is never loaded here; createOcrRunner takes an
// injected createWorker, so we drive it with a fake worker and assert the
// contract + the same-origin, no-storage, no-telemetry configuration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OCR_SCAN_CHARS_PER_PAGE,
  TESSERACT_PATHS,
  looksLikeScan,
  isImageFile,
  isOcrCandidate,
  ocrDocument,
  createOcrRunner,
} from '../../lib/pa/ocr.js';

test('looksLikeScan: born-digital PDF (lots of text) is not a scan', () => {
  const text = 'Prior authorization request. '.repeat(40); // ~1160 chars
  assert.equal(looksLikeScan({ kind: 'PDF', pageCount: 2, text }), false);
});

test('looksLikeScan: image-only PDF (near-empty text) is a scan', () => {
  assert.equal(looksLikeScan({ kind: 'PDF', pageCount: 3, text: '  \n \f ' }), true);
  assert.equal(looksLikeScan({ kind: 'PDF', pageCount: 1, text: '' }), true);
});

test('looksLikeScan: threshold is per-page', () => {
  // 30 non-whitespace chars over 1 page = 30/page (>= 16) -> not a scan.
  assert.equal(looksLikeScan({ pageCount: 1, text: 'x'.repeat(30) }), false);
  // 30 non-whitespace chars over 3 pages = 10/page (< 16) -> scan.
  assert.equal(looksLikeScan({ pageCount: 3, text: 'x'.repeat(30) }), true);
  assert.ok(OCR_SCAN_CHARS_PER_PAGE > 0);
});

test('looksLikeScan: defensive on bad input', () => {
  assert.equal(looksLikeScan(null), false);
  assert.equal(looksLikeScan({}), false);
  assert.equal(looksLikeScan({ pageCount: 0, text: '' }), true); // pages floored at 1
});

test('isImageFile: jpg/png by MIME or extension; not pdf/docx/txt', () => {
  assert.equal(isImageFile({ type: 'image/png', name: 'scan.png' }), true);
  assert.equal(isImageFile({ type: 'image/jpeg', name: 'scan.jpg' }), true);
  assert.equal(isImageFile({ type: '', name: 'PHOTO.JPEG' }), true);
  assert.equal(isImageFile({ type: '', name: 'page.tiff' }), false); // tiff not admitted
  assert.equal(isImageFile({ type: 'application/pdf', name: 'a.pdf' }), false);
  assert.equal(isImageFile({ type: 'text/plain', name: 'a.txt' }), false);
});

test('isOcrCandidate: images and scanned PDFs only', () => {
  assert.equal(isOcrCandidate({ type: 'image/png', name: 'x.png' }, { kind: 'IMAGE', text: '' }), true);
  assert.equal(isOcrCandidate({ type: 'application/pdf', name: 'scan.pdf' }, { kind: 'PDF', pageCount: 2, text: '' }), true);
  // born-digital PDF -> not a candidate.
  assert.equal(isOcrCandidate({ type: 'application/pdf', name: 'born.pdf' }, { kind: 'PDF', pageCount: 1, text: 'x'.repeat(200) }), false);
  // TXT/DOCX -> never a candidate.
  assert.equal(isOcrCandidate({ type: 'text/plain', name: 'a.txt' }, { kind: 'TXT', text: 'hi' }), false);
});

test('ocrDocument: builds a kind:OCR ingest document', () => {
  const d = ocrDocument({ name: 'scan.png' }, 'abc123', 'Member ID: X1\nCPT 29881');
  assert.equal(d.name, 'scan.png');
  assert.equal(d.sha256, 'abc123');
  assert.equal(d.kind, 'OCR');
  assert.equal(d.ocr, true);
  assert.match(d.text, /Member ID: X1/);
});

test('createOcrRunner: rejects a non-function createWorker', () => {
  assert.throws(() => createOcrRunner(null), TypeError);
});

test('createOcrRunner: configures the worker same-origin, OEM 1 LSTM, no storage, no telemetry', async () => {
  const calls = [];
  let recognizeArg = null;
  let terminated = 0;
  const fakeCreateWorker = (lang, oem, opts) => {
    calls.push({ lang, oem, opts });
    return Promise.resolve({
      recognize: (image) => { recognizeArg = image; return Promise.resolve({ data: { text: 'OCR TEXT' } }); },
      terminate: () => { terminated += 1; return Promise.resolve(); },
    });
  };
  const runner = createOcrRunner(fakeCreateWorker);
  const out = await runner.recognize('IMG');
  assert.equal(out, 'OCR TEXT');
  assert.equal(recognizeArg, 'IMG');

  // Worker created exactly once, reused on a second recognize.
  await runner.recognize('IMG2');
  assert.equal(calls.length, 1, 'worker is created once and reused');

  const { lang, oem, opts } = calls[0];
  assert.equal(lang, 'eng');
  assert.equal(oem, 1, 'OEM 1 = LSTM_ONLY (matches the vendored -lstm core)');
  assert.equal(opts.workerPath, TESSERACT_PATHS.workerPath);
  assert.equal(opts.corePath, TESSERACT_PATHS.corePath);
  assert.equal(opts.langPath, TESSERACT_PATHS.langPath);
  assert.equal(opts.workerBlobURL, false, 'worker from same-origin file, not a blob URL');
  assert.equal(opts.cacheMethod, 'none', 'no IndexedDB cache write (storage commitment)');
  assert.equal(typeof opts.logger, 'function', 'logger present (silenced, no telemetry)');

  // All vendored paths are same-origin absolute paths, no third-party origin.
  for (const p of [opts.workerPath, opts.corePath, opts.langPath]) {
    assert.ok(p.startsWith('/vendored/tesseract/'), `${p} must be same-origin vendored`);
    assert.ok(!/^https?:/i.test(p), `${p} must not be an off-origin URL`);
  }

  await runner.terminate();
  assert.equal(terminated, 1);
});

test('createOcrRunner: recognize tolerates a worker returning no text', async () => {
  const runner = createOcrRunner(() => Promise.resolve({
    recognize: () => Promise.resolve({ data: {} }),
    terminate: () => Promise.resolve(),
  }));
  assert.equal(await runner.recognize('x'), '');
});
