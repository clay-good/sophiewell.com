# vendored/tesseract

[tesseract.js](https://github.com/naptha/tesseract.js) — a pure
WebAssembly port of the Tesseract OCR engine — vendored under
`vendored/tesseract/` for the `pa-lint` tile's **optional, user-toggled,
fully in-browser OCR** path (spec-v52 §4.3.1, §5.3). It converts the
pixels of a scanned PDF page or a dropped image into text so the
existing deterministic rule engine can lint it. Pinned to the release
below; **no npm install at build time, no runtime fetch from any
third-party origin** — every asset (engine, worker, WASM core, language
data) loads from this same-origin directory.

## Provenance

| Field            | Value                                                                                  |
|------------------|----------------------------------------------------------------------------------------|
| Engine repo      | https://github.com/naptha/tesseract.js                                                 |
| `tesseract.js`   | `5.1.1` — `tesseract.min.js` (UMD loader, 65 KB) + `worker.min.js` (124 KB)            |
| `tesseract.js-core` | `5.1.0` — `tesseract-core-simd-lstm.wasm.js` (Emscripten glue, 3.9 MB) + `tesseract-core-simd-lstm.wasm` (2.9 MB) |
| Language data    | `eng.traineddata.gz` (1.9 MB) from [tessdata_fast](https://github.com/tesseract-ocr/tessdata_fast) (the *fast* LSTM model — adequate for printed PA forms, ~5× smaller than the standard model) |
| Pulled on        | 2026-06-05 (UTC) by the maintainer                                                     |
| License          | Apache License 2.0 (engine, core, and tessdata) — see `LICENSE` in this directory      |
| Total committed  | ~9 MB (the WASM core + glue dominate; the `.gz` language data is ungzipped in-worker)  |

Only the **SIMD + LSTM-only** core variant is vendored. Every browser
Sophie targets supports WebAssembly SIMD; the LSTM-only core drops the
legacy (pre-neural) Tesseract path Sophie never uses. `lib/pa/ocr.js`
points `corePath` at the exact `.wasm.js` file (not a directory), so the
runtime never probes for a variant that is not on disk.

## Why this does not violate the "no AI" commitment (spec-v50 §3.6)

The "no AI" commitment forbids **LLM / cloud-AI vendor dependencies**
(the `check-commitments.mjs` deny-list: OpenAI, Anthropic, onnxruntime,
transformers.js, …) and any network call to such a service. Tesseract is
none of those: it is a **local, offline, deterministic text-extraction
kernel**. It runs entirely in a Web Worker in the user's tab, fetches
nothing off-origin, and — for a pinned engine + language model — returns
the same text for the same image bytes. In spec-v52's framing ("AI as
interface, deterministic kernels as substrate", §1.4) OCR is an **input
adapter**: it replaces what a human would otherwise type from a scanned
page. It does **not** make the prior-authorization determination — the
60-rule core plus the deterministic overlays still do that, and the
golden-fixture audit (`scripts/audit-pa.mjs`) feeds the engine text
directly, so the byte-determinism guarantee (§4.10) is unchanged. The
patient's image never leaves the device, preserving the §4.7 PHI / no-BAA
posture.

## CSP

WebAssembly compilation under a Content-Security-Policy requires a
`script-src` token. `_headers` therefore ships
`script-src 'self' 'wasm-unsafe-eval'`. `'wasm-unsafe-eval'` permits
**only** same-origin WebAssembly compilation — not general `eval`, not
`unsafe-inline`, and not any third-party origin. `connect-src 'self'`
(the no-outbound-network promise) is unchanged, and the worker + WASM +
language data are all same-origin, so `script-src 'self'` still covers
them. See spec-v52 §4.3.1 / the design-decisions section for the full
rationale.

## How to upgrade

1. Pick a `tesseract.js` release: https://github.com/naptha/tesseract.js/releases
2. `curl -sL https://cdn.jsdelivr.net/npm/tesseract.js@<v>/dist/tesseract.min.js -o vendored/tesseract/tesseract.min.js`
3. `curl -sL https://cdn.jsdelivr.net/npm/tesseract.js@<v>/dist/worker.min.js -o vendored/tesseract/worker.min.js`
4. Match the `tesseract.js-core` version the release expects and pull
   `tesseract-core-simd-lstm.wasm.js` + `.wasm` from
   `https://cdn.jsdelivr.net/npm/tesseract.js-core@<v>/`.
5. Language data rarely changes; re-pull from `tessdata_fast` only if
   needed, then `gzip -9`.
6. Update the version rows above and the "Pulled on" date.
7. `npm run lint && npm test && npx playwright test pa-lint-ocr`.
8. Commit `chore(vendored): bump tesseract.js <old> -> <new>`.

## Audit posture

The vendored files are byte-for-byte identical to the upstream release
artifacts (the language data is the upstream `eng.traineddata`,
gzip-recompressed). No patches are applied.
