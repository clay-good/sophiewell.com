# vendored/pdfjs

Mozilla pdf.js, vendored under `vendored/pdfjs/` for use by the
`pa-lint` tile's ingest pipeline (spec-v52 §4.3, §5.2). Pinned at the
release tag listed below; no npm install at build time, no runtime
fetch from any third-party origin.

## Provenance

| Field           | Value                                                                                       |
|-----------------|---------------------------------------------------------------------------------------------|
| Upstream repo   | https://github.com/mozilla/pdf.js                                                           |
| Release tag     | `v5.7.284`                                                                                  |
| Release URL     | https://github.com/mozilla/pdf.js/releases/tag/v5.7.284                                     |
| Dist artifact   | `pdfjs-5.7.284-dist.zip`                                                                    |
| Pulled on       | 2026-05-27 (UTC) by the maintainer                                                          |
| License         | Apache License 2.0 (see `LICENSE` in this directory)                                        |
| What is vendored| `build/pdf.mjs` (loader, ~310 KB gzipped) + `build/pdf.worker.mjs` (worker, ~600 KB gzipped)|
| What is omitted | `pdf.sandbox.mjs` (form-action sandbox, not needed for text extraction); `web/` (viewer chrome); `cmaps/` (non-Latin character maps; revisit when non-Latin packets are common); `iccs/` (ICC color profiles for image extraction). |

## Why Apache-2.0 in an otherwise MIT site

Sophie Well's first-party code is MIT
([LICENSE](../../LICENSE)). Apache-2.0 is a permissive license
compatible with MIT distribution; the only obligations are
license-text preservation (satisfied by the `LICENSE` file in this
directory) and an attribution notice (satisfied by the
[/commitments/](https://sophiewell.com/commitments/) page entry that
calls out the vendored components and their licenses, per
spec-v52 §5.2).

## How to upgrade

1. Visit https://github.com/mozilla/pdf.js/releases and pick a new
   release tag.
2. `curl -sL <new-dist-zip-url> -o /tmp/pdfjs.zip`
3. `unzip -q /tmp/pdfjs.zip -d /tmp/pdfjs-dist`
4. `cp /tmp/pdfjs-dist/build/{pdf.mjs,pdf.worker.mjs} vendored/pdfjs/build/`
5. `cp /tmp/pdfjs-dist/LICENSE vendored/pdfjs/LICENSE`
6. Update the "Release tag" and "Pulled on" rows above.
7. Run `npm run lint && npm test && npx playwright test pa-lint`
   to confirm the pa-lint dropzone still extracts text against the
   committed fixtures.
8. Commit with a message like `chore(vendored): bump pdfjs <old> -> <new>`.

## CSP

The `_headers` file ships `Content-Security-Policy: default-src 'self';
script-src 'self'; ...`. pdf.js loads its worker as a same-origin
URL passed via `GlobalWorkerOptions.workerSrc`, so the existing CSP
covers it without modification. No `unsafe-eval` is required for the
modern (`pdf.mjs`) build used here; the legacy build would need
`'wasm-unsafe-eval'` for old browsers, which Sophie does not target.

## Audit posture

The vendored files are byte-for-byte identical to the upstream
release artifact, modulo the directory restructuring above. No
patches are applied; if a patch is ever needed, it must be documented
in this file and accompanied by a minimum-reproducer test under
`test/unit/`.
