# vendored/

Third-party libraries vendored into Sophie's repository, pinned at
specific upstream commits or release tags. Each subdirectory carries
its own upstream `LICENSE`, an attribution notice, and a
`_vendored.md` ledger documenting the upstream URL, the pinned
version, the date pulled, the license, and the upgrade procedure.

This pattern keeps Sophie's [eight commitments](../docs/spec-v50.md)
intact:

- **No third-party fetch at runtime.** Every vendored file is served
  from the same origin as the rest of the site.
- **No npm install at build time** beyond the two dev-only entries in
  `package.json`. Vendored libraries are committed to the repo so
  build reproducibility does not depend on a third-party registry.
- **License compatibility is auditable.** Each subdirectory's
  `LICENSE` is the file the upstream project shipped. Sophie's own
  code remains MIT-licensed; the
  [/commitments/](https://sophiewell.com/commitments/) page surfaces
  the vendored components and their licenses per spec-v52 §5.2.

## Current entries

| Path           | Library      | Upstream                                  | License    | Purpose                                                |
|----------------|--------------|-------------------------------------------|------------|--------------------------------------------------------|
| `pdfjs/`       | Mozilla pdf.js | https://github.com/mozilla/pdf.js       | Apache-2.0 | PDF text extraction for the `pa-lint` tile (spec-v52)  |

The mammoth (DOCX -> text) and docx (DOCX generation) vendored
entries from spec-v52 §5.2 will land in subsequent waves.
