# spec-v1625 — Build: receipts and the MCP file tools

**Status:** Build spec, September 29, 2026. Implements [spec-v1615](spec-v1615.md).
**Plan:** [spec-v1620](spec-v1620.md), milestone M4. **Depends on:** M1 and M3.

## Files

| File | New or changed | Holds |
|---|---|---|
| `lib/receipt.js` | new | `canonicalize(result)`, `resultHash(result)`, `buildReceipt({ files, tool, data, options, result })`, `shareable(receipt)`; pure, `crypto.subtle` in the browser and `node:crypto` in Node through one small adapter |
| `lib/build-info.js` | new, generated | `export const BUILD = { commit, builtAt }`, written by `scripts/build.mjs` from `git rev-parse HEAD` (or `WORKERS_CI_COMMIT_SHA`, which Cloudflare Workers Builds injects, when git history is unavailable); `'dev'` locally |
| `views/receipt.js` | new | the collapsed "Receipt" block under a file result, two downloads (shareable default, with names) |
| `mcp/file-tools.js` | new | `recognize_file`, `analyze_file` |
| `mcp/tools.js` | changed | `TOOL_DEFS` grows from eight to ten; `SERVER_INSTRUCTIONS` names the two file tools and the no-upload posture |
| each file tool's view and worker | changed | returns its result as a plain object before rendering, so `lib/receipt.js` can hash it |

## Canonical form

`canonicalize` sorts object keys, keeps array order, writes money as integer cents
(strings), writes other numbers with the precision the tool displays, and drops
presentation-only fields. Each file tool declares its result shape in its worker
(`resultShape`), and a unit test asserts `canonicalize` is stable across two runs and
across the browser worker and Node.

## Steps

1. **`lib/receipt.js` and `build-info`.** Unit tests: same input, same hash; a changed
   data edition changes the hash; `shareable` replaces every file name with
   `<label> <n> of <m>`.
2. **Receipts in the file tools**, one tool family per PR (X12 readers; price file; CSV
   workbench tools; packet linter). Each family's e2e test downloads the receipt and checks
   its fields.
3. **Checking a receipt.** Dropping a receipt JSON with its files: the recognizer knows the
   receipt kind (`{ receiptVersion, resultHash }`), matches files by hash, re-runs, and
   reports reproduced or the differing fields.
4. **MCP file tools.** `recognize_file(path)` and `analyze_file(path, tool?, options?)`
   read the file with `node:fs` streams inside the directories the client allows, run the
   same `lib/file-kinds.js` and the tool's pure compute, and return the result and the
   receipt. A cross-surface test runs every fixture through the browser worker (Playwright)
   and through `analyze_file` and compares receipts minus `ranAt`.
5. **Export footers.** CSV exports end with a comment row starting `#` (tool, build, data
   editions, `resultHash`); DOCX exports get a footer paragraph. The CSV serializer
   (`serializeCsv` in `lib/upload-intake.js`) gains an optional `trailer` argument; the
   formula-escaping rule is unchanged.

## Tests

The [spec-v1615](spec-v1615.md) Tests, plus: `npm run test:mcp` covers both new tools, and
the MCP server still makes no network request (the existing no-egress test).

## Build status

| Step | Status | Differs from the spec |
|---|---|---|
| 1 `lib/receipt.js` and build info | **Built September 29, 2026.** `canonicalize`, `resultHash`, `buildReceipt`, `shareable`, `isReceipt`, `compareReceipts`; `lib/sha256.js`, an incremental SHA-256 in plain JavaScript (checked against `node:crypto` on every block boundary, about 190 MB/s); `lib/build-info.js`. | The checked-in `lib/build-info.js` says `'dev'` and `scripts/build.mjs` writes the real commit into `dist/lib/build-info.js` only, so a build never rewrites a tracked file (CI's idempotency check stays meaningful); there is no `builtAt`, which would make every build differ. Hashing uses the incremental SHA-256 rather than `crypto.subtle`, which cannot hash a file in chunks. |
| 2 Receipts in the file tools | **Built September 29, 2026** for every file tool but the packet linter: the X12 readers, the price file check (hashed in a second streamed pass), denial pattern, underpayment (the fee schedule is a second file; its column mapping is an option), the appeal worklist (835 and CSV), the six CSV workbench tools and the 340B matcher (four files in a fixed order). `views/receipt.js` shows the receipt collapsed with two downloads, the shareable one first. | A row's source file is hashed as its position, not its name, so a renamed copy reproduces; result objects that carry file names are not hashed, only the export rows that determine every figure. Options never hold a value from a file: the appeal worklist records its payer choices by the payer's position, and free text a reader typed (hospital stays, pasted fills) is recorded by its SHA-256 (`privateOptions`). The packet linter keeps its existing hashed audit report and gets no second receipt. |
| 3 Checking a receipt | Open (`compareReceipts` is built and tested). | |
| 4 MCP file tools | Open. | |
| 5 Export footers | **Built** for every CSV export of the tools above. `serializeCsv(headers, rows, { trailer })` ends a CSV with one `#` row: tool, build, data editions and result hash. | No DOCX export exists among the file tools, so there is no DOCX footer yet. |
