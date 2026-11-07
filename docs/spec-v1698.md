# spec-v1698 — VCF readers (variant-interpretation-math tools 3 and 4)

> Status: **SHIPPED (2026-11-07)**: `vcf-variant-lookup` and `vcf-qc-summary`, and the `vcf` file kind. Open: task
> 4.4's measurement on a real public whole-genome VCF (below, a synthetic file stands in).

The last two tools of the [variant-interpretation-math](../openspec/changes/variant-interpretation-math/proposal.md)
change, after [spec-v1697](spec-v1697.md) (tools 1 and 2) and the shared BGZF reader.

## What shipped

| Piece | What it does |
|---|---|
| `lib/vcf-read-v1698.js` | Streams a plain, gzip or BGZF file (block by block), hashing the raw bytes in the same pass; parses the header, FORMAT-keyed sample fields, GT phase and zygosity, allele balance, allele types and Ti/Tv |
| `lib/vcf-run-v1698.js`, `lib/vcf-worker.js` | One run for the browser worker and MCP; a receipt only when the whole file was read |
| `views/group-v1698.js` | Dropzone, fields, Read and Stop buttons, a progress line; hand-off from the inventory through `acceptFiles` |
| `lib/file-kinds.js` | `vcf` kind on a first line `##fileformat=VCFv`, routed to both tools |
| `mcp/file-tools.js` | Both tools in `ANALYZABLE`, with optional `position` (CHROM:POS or an ID) and `sample`; no 50 MB limit for them; `recognize_file` and `analyze_file` decode a bgzipped file's first block to call it a VCF |

## Choices made at build

- **Early stop.** A lookup stops once it passes the position on that chromosome, because VCFv4.5 requires positions in
  increasing order within a chromosome; if disorder was seen before that point it reads to the end. A file disordered
  only after the position cannot be detected without reading it all; the not-found note says what the stop relied on.
- **No elapsed time on the page.** The same file handed off or chosen must render the same text (the hand-off
  check compares them), so the time taken is returned to agents (`file.seconds`) but not printed.
- **A partial read has no receipt**, since the receipt names the whole file by its SHA-256.
- **Indels by prefix.** An insertion's ALT begins with the whole REF, a deletion's REF with the whole ALT, so the §1.1
  microsatellite (GTC to G and GTCT) counts one of each, as the specification describes it.
- **Search phrases** audited word by word: drafts took "alt" from `ast-alt-ratio` and "lookup" from `tic-rate-lookup`;
  both were reworded.

## Throughput (task 4.4, synthetic stand-in)

A generated 2,000,000-record single-sample VCF (232 MB plain; 19 MB as 64 KB BGZF blocks) summarized in Node 26 on an
Apple-silicon laptop: 3.2 s plain and 3.0 s bgzipped, about 620,000 to 670,000 records per second (72 to 78 MB/s
uncompressed), memory flat. A typical whole-genome VCF of 4 to 5 million records would take under 10 seconds at that
rate. Not yet measured on a real public genome (Genome in a Bottle or 1000 Genomes), which is what 4.4 asks.

## Proof

- `test/unit/vcf-read-v1698.test.js` (14 tests): every design.md vector on the VCFv4.5 §1.1 example (1/1 hom-alt DP 5;
  0|0 phased; 1|2 with T as ALT 2; the reference-only site; "not in this file"; the chr alias; AD 10,8 gives 0.444;
  5 records, 4 PASS, Ti 2, Tv 2, 0 het, 3 hom-alt), BGZF with and without the end-of-file block, plain gzip, the
  out-of-order case, and refusals.
- `test/mcp/mcp-file-tools.test.js`: both tools run on the fixture; a bgzipped VCF is recognized and summarized.
- `test/integration/vcf-readers.spec.js`: a bgzipped VCF read in the browser at 320 px with no off-origin request,
  and the summary with its receipt.
