# spec-v1615 — Receipts and agent parity

**Status:** Proposed, September 29, 2026. Nothing built.
**Charter:** [spec-v1610](spec-v1610.md). **Depends on:** [spec-v1611](spec-v1611.md),
[spec-v1614](spec-v1614.md).

## Why

A deterministic check is worth most as a second review: a biller, auditor or patient
advocate compares it with what the EHR, clearinghouse or payer said. A second review only
works if its answer can be shown to someone else and reproduced. Today a file tool's result
is a screen and a CSV, with no record of which file, which code or which data produced it.

## 1. The receipt

Every file run produces a receipt, shown collapsed under the result ("Receipt") and
downloadable as JSON:

| Field | Content |
|---|---|
| `files` | for each input: name, size, SHA-256 (computed in the worker), recognized kind and its evidence |
| `tool` | tool id and the commit the site was built from, injected at build |
| `data` | each dataset used: id, `sourceEdition`, `coverage`, `status` at run time, manifest hash; or the reader's own reference file by hash ([spec-v1614](spec-v1614.md) §6) |
| `options` | the reader's choices (column mapping, plan name, as-of date) |
| `resultHash` | SHA-256 of the result in a canonical JSON form (keys sorted, numbers as strings in integer cents or fixed decimals) |
| `ranAt` | the run time, which is **excluded** from `resultHash` |

The receipt holds hashes of the reader's files, never their contents. File names can
themselves identify a patient (`smith_eob.json`), so the download offers two versions:
with names, and "to share," where each name is replaced by its kind and position
(`835 file 1 of 12`). The shareable version is the default.

**Same inputs, same hash.** The same files, tool build, data editions and options give
the same `resultHash` on any machine. A test runs every sample through each tool twice,
and through the browser and the Node paths, and asserts equal hashes.

## 2. Checking a receipt

Dropping a receipt JSON together with the original files re-runs the tool at the recorded
options and reports *"Reproduced: same result"* or the fields that differ. If the build or
a data edition differs, it says which, since that explains a difference before anything
else. Older builds aren't kept on the site; the receipt names the commit, and anyone can
check it out from the public repository.

## 3. The same recognizer for agents

The MCP server ([spec-v627](spec-v627.md)) gains two tools:

| MCP tool | Does |
|---|---|
| `recognize_file(path)` | runs `recognize()` on a file on the user's machine; returns kind, evidence and the tools that accept it |
| `analyze_file(path, tool?, options?)` | recognizes the file, runs the chosen tool (or the primary one), returns the result and the receipt |

Both read the file locally through Node, run the same pure functions as the browser, and
return the same receipt. An agent helping someone with a folder of remittances gets
cited, reproducible answers, and the files never leave the machine. The existing server's
posture stands: stateless, no network, no writes.

A cross-surface test runs each sample through the browser worker and through
`analyze_file` and asserts identical receipts (except `ranAt`).

## 4. Exports carry their provenance

Every CSV and document a file tool exports gains a short footer block, or for CSV a
trailing comment row, with the tool, build, data editions and `resultHash`. A file that
leaves the site still says where it came from and how to check it.

## Tests

- Receipt determinism across two runs and two surfaces, for every sample kind.
- A changed data edition changes `resultHash` and the check names the dataset.
- A receipt contains no field value from any input file (a test searches the receipt for
  every distinct string in the sample inputs longer than 3 characters).
- `analyze_file` on a path outside the allowed directory the MCP client grants is refused
  with the client's error.
