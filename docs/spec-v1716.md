# spec-v1716 — Review fixes to the VCF readers

> Status: **SHIPPED (2026-11-07)**: fixes to `vcf-variant-lookup` and `vcf-qc-summary` (spec-v1698) and to the
> MCP `analyze_file` / `recognize_file` VCF path. The catalog stays 2,386.

An independent review found these correct:

- multi-allelic and symbolic alleles, and GT index mapping;
- QUAL, FILTER, INFO, reordered FORMAT, CRLF, and a last line with no line break;
- the chr prefix, 1-based POS, and two records at one POS;
- plain and multi-member gzip;
- BGZF sniffing and end-of-file checks;
- the private fields and the absence of any network use.

It found these defects:

| # | Input | Was | Now |
|---|---|---|---|
| 1 | GT `\|1` (VCFv4.4 leading phase mark); `\|0/1`; malformed `/1` | heterozygous; "3 alleles"; heterozygous | haploid alternate (phased); heterozygous; "not a readable genotype" |
| 2 | 1:102 inside REF ACGT at 1:100, GT 1/1 | "1:102 is not in this file" | names the covering record (REF, ALT, GT) and says its REF spans the position |
| 3 | a header and then 128 MB with no line break (a 130 KB gzip) | 59 s and 922 MB, with no bound | unfinished pieces are joined only when a line ends (no quadratic re-copying), and a line over 64 Mi characters is refused: 77 ms |
| 4 | a corrupted deflate byte, CRC or ISIZE in BGZF block 2 | `message: ""` | "The BGZF block at byte N is damaged…" |
| 5 | receipt for sample "JaneDoe" | the name in both receipts, including the one for sharing | the name recorded as `{ sha256 }` (as `privateOptions` records free text), so it can still be checked |
| 6 | ID `.` | matched every record with no ID | refused as VCF's missing value |
| 7 | records with no FORMAT column, or none for the chosen sample | silently left out of the genotype counts | "N records with no genotype column for this sample, not counted" |
| 8 | REF N, ALT A; POS empty or `0x64` | counted as a transversion; read as 0 or as 100 | N is "other", not an SNV; POS must be digits |
| MCP | plain-gzip .vcf.gz with no tool named; `chr1:100-100`; contigs with colons | "no tool here reads it"; looked up as an ID | the first chunk of a plain gzip is sniffed; a range is refused with `BAD_POSITION`; the chromosome is everything up to the last colon |

Not changed: the looked-up position stays in the receipt. It is the reader's own query, not file content, and it is
needed to reproduce the result.

Tests: `test/unit/vcf-read-v1698.test.js` (4 new); `test/mcp/mcp-file-tools.test.js` passes unchanged with the
evidence wording that names the compression found.
