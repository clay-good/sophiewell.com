// spec-v52 §4.3.1: optional, user-toggled, fully in-browser OCR.
//
// This module is the deterministic, browser-global-free glue for the OCR
// path. The heavy lifting (tesseract.js, vendored under /vendored/tesseract/)
// is lazy-loaded by the view (views/pa-lint.js) and injected here as
// `createWorker`, so:
//   - this file imports nothing and touches no `window` / `document`, so it
//     unit-tests in Node with a fake worker;
//   - the ~9 MB engine never loads until the user clicks "Run on-device OCR",
//     keeping the idle page weight within the spec-v10 §6 dependency budget.
//
// Posture (spec-v50 §3): OCR runs entirely in a Web Worker in the tab. Every
// asset (worker, WASM core, language data) is same-origin under
// /vendored/tesseract/ -- no third-party fetch, no outbound network, and the
// patient's image never leaves the device (preserves the §4.7 PHI / no-BAA
// posture). OCR is an *input adapter* -- it produces the text a human would
// otherwise type from a scan -- and does not make any prior-authorization
// determination; the deterministic rule engine still does that.

// A born-digital PDF yields hundreds of non-whitespace characters per page;
// an image-only (scanned) PDF yields almost none. Below this average we treat
// the PDF as a scan and offer OCR.
export const OCR_SCAN_CHARS_PER_PAGE = 16;

// Vendored, same-origin asset paths. `corePath` points at the exact core
// `.wasm.js` file (not a directory) so the runtime never probes for a variant
// that is not on disk (only the SIMD + LSTM-only core is vendored).
export const TESSERACT_PATHS = Object.freeze({
  workerPath: '/vendored/tesseract/worker.min.js',
  corePath: '/vendored/tesseract/tesseract-core-simd-lstm.wasm.js',
  langPath: '/vendored/tesseract/',
});

// Does a pdf.js extract look like a scanned (image-only) PDF? Pure.
export function looksLikeScan(extract) {
  if (!extract || typeof extract.text !== 'string') return false;
  const pages = Math.max(1, Number(extract.pageCount) || 1);
  const nonWhitespace = extract.text.replace(/\s+/g, '').length;
  return (nonWhitespace / pages) < OCR_SCAN_CHARS_PER_PAGE;
}

// Is this dropped file an OCR-able image (the MIME types spec-v52 §3.2 admits
// "for reference")? Pure.
export function isImageFile(file) {
  const type = (file && file.type) || '';
  const name = (file && file.name) || '';
  return /^image\/(jpeg|png)$/.test(type) || /\.(jpe?g|png)$/i.test(name);
}

// Should the OCR affordance be offered for this parsed file? Pure.
//   - an image file, or
//   - a PDF whose extracted text looks like a scan.
export function isOcrCandidate(file, extract) {
  if (isImageFile(file)) return true;
  if (extract && extract.kind === 'PDF' && looksLikeScan(extract)) return true;
  return false;
}

// Build the ingest document a successful OCR run contributes to the bundle.
// `kind: 'OCR'` distinguishes OCR-sourced text from parsed text in the audit
// trail. Pure.
export function ocrDocument(file, hash, text) {
  return {
    name: (file && file.name) || 'ocr',
    sha256: hash,
    kind: 'OCR',
    text: String(text || ''),
    ocr: true,
  };
}

// Dependency-injected OCR runner. `createWorker` is tesseract.js's
// `createWorker` (injected by the view after lazy-load, or a fake in tests).
// Returns { recognize(image) => Promise<string>, terminate() }. The worker is
// created once on first use and reused for the rest of the packet.
export function createOcrRunner(createWorker, opts = {}) {
  if (typeof createWorker !== 'function') {
    throw new TypeError('createOcrRunner: createWorker must be a function');
  }
  const paths = {
    workerPath: opts.workerPath || TESSERACT_PATHS.workerPath,
    corePath: opts.corePath || TESSERACT_PATHS.corePath,
    langPath: opts.langPath || TESSERACT_PATHS.langPath,
  };
  let workerPromise = null;
  function ensureWorker() {
    if (!workerPromise) {
      // OEM 1 = LSTM_ONLY (matches the vendored -lstm core).
      workerPromise = Promise.resolve(createWorker('eng', 1, {
        workerPath: paths.workerPath,
        corePath: paths.corePath,
        langPath: paths.langPath,
        workerBlobURL: false, // load the worker from the same-origin file, not a blob: URL
        gzip: true, // eng.traineddata.gz
        cacheMethod: 'none', // no IndexedDB cache write -> no storage outside the spec-v50 §3.4 allowlist
        logger: () => {}, // no telemetry, no console noise (spec-v50 §3.5)
        errorHandler: () => {},
      }));
    }
    return workerPromise;
  }
  return {
    async recognize(image) {
      const worker = await ensureWorker();
      const result = await worker.recognize(image);
      const text = result && result.data && typeof result.data.text === 'string'
        ? result.data.text
        : '';
      return text;
    },
    async terminate() {
      if (!workerPromise) return;
      const p = workerPromise;
      workerPromise = null;
      try {
        const worker = await p;
        if (worker && typeof worker.terminate === 'function') await worker.terminate();
      } catch {
        // best-effort teardown
      }
    },
  };
}
