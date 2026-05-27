# vendored/mammoth

`mwilliamson/mammoth.js`, vendored under `vendored/mammoth/` for use
by the `pa-lint` tile's DOCX ingest path (spec-v52 §4.3, §5.2).
Pinned at the release tag listed below; no npm install at build time,
no runtime fetch from any third-party origin.

## Provenance

| Field           | Value                                                              |
|-----------------|--------------------------------------------------------------------|
| Upstream repo   | https://github.com/mwilliamson/mammoth.js                          |
| Release tag     | `1.2.5`                                                            |
| Release URL     | https://github.com/mwilliamson/mammoth.js/releases/tag/1.2.5       |
| Dist artifact   | `mammoth.browser.min.js` (UMD bundle for browser usage)            |
| Pulled on       | 2026-05-27 (UTC) by the maintainer                                 |
| License         | BSD-2-Clause (see `LICENSE` in this directory)                     |
| What is vendored| `mammoth.browser.min.js` (~140 KB gzipped, the full browser bundle)|
| What is omitted | The npm `mammoth` CLI + Node-only entry points; the `style-map`    |
|                 | docs (`README.md` upstream); the source-map (`mammoth.browser.min.js.map`). |

## How pa-lint loads it

`mammoth.browser.min.js` is a UMD bundle, not an ES module. The
pa-lint view (`views/pa-lint.js`) injects a same-origin classic
`<script>` tag (`/vendored/mammoth/mammoth.browser.min.js`) on first
DOCX drop and resolves on `script.onload` to `window.mammoth`. The
existing strict CSP (`script-src 'self'`) covers this. The choice of
dynamic-script injection over an ESM dynamic `import()` is forced by
mammoth's UMD packaging upstream; switching to ESM would require
rebundling and would lose byte-for-byte parity with the upstream
release.

## CSP

`script-src 'self'` permits same-origin classic-script loads via
dynamic `<script>` injection. No `unsafe-inline` is needed: the
script body is fetched from the same origin, not inlined. The
loader does not use `eval()` or the `Function` constructor; it
parses the DOCX zip with `JSZip` (bundled inside the same minified
file) and walks the WordprocessingML XML with the browser-native
DOMParser.

## How to upgrade

1. Visit https://github.com/mwilliamson/mammoth.js/releases and pick
   a new release tag.
2. `curl -sL https://github.com/mwilliamson/mammoth.js/releases/download/<new>/mammoth.browser.min.js -o vendored/mammoth/mammoth.browser.min.js`
3. `curl -sL https://raw.githubusercontent.com/mwilliamson/mammoth.js/<new>/LICENSE -o vendored/mammoth/LICENSE`
4. Update the "Release tag" and "Pulled on" rows above.
5. Run `npm run lint && npm test && npx playwright test pa-lint`
   to confirm the pa-lint dropzone still extracts text against the
   committed fixtures.
6. Commit with a message like `chore(vendored): bump mammoth <old> -> <new>`.

## Audit posture

The file is byte-for-byte identical to the upstream release artifact.
No patches are applied; if a patch is ever needed it must be
documented in this file and accompanied by a minimum-reproducer test
under `test/unit/`.
