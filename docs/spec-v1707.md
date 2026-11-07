# spec-v1707 — VCF readers measured on a real genome (variant-interpretation-math task 4.4)

> Status: **DONE (2026-11-07)**. Docs only. With it every task of
> [variant-interpretation-math](../openspec/changes/variant-interpretation-math/tasks.md) is closed.

[spec-v1698](spec-v1698.md) measured `vcf-qc-summary` on a synthetic file. Task 4.4 asked for a real public
whole-genome VCF.

## The file

Genome in a Bottle HG002 (NA24385) benchmark small-variant calls, NISTv4.2.1, GRCh38
(`HG002_GRCh38_1_22_v4.2.1_benchmark.vcf.gz`, NCBI GIAB FTP, public): 156,252,944 bytes, bgzip-compressed (BGZF),
chromosomes 1 to 22.

## Results

`lib/vcf-read-v1698.js` in Node 26 on an Apple-silicon laptop, the same module the page's worker runs:

| Run | Time | Notes |
|---|---|---|
| `vcf-qc-summary`, whole file | 12.3 s | 4,048,342 records, about 330,000 per second (12.7 MB/s compressed); resident memory about 156 MB |
| `vcf-variant-lookup`, chr1:1,000,000 | under 0.01 s | not in the file; reading stopped after 20,056 bytes, past that position on chr1 |
| `vcf-variant-lookup`, 22:50,000,000 | 10.5 s | not in the file; matched to `chr22` with the prefix ignored; read to the end of the last chromosome |

The summary's own figures are what a whole genome should give, which is a check on the parser: Ti/Tv 2.09; 2,491,525
heterozygous and 1,556,817 homozygous-alternate calls (het/hom-alt 1.60); 3,463,000 SNV, 308,653 insertion and 322,804
deletion alleles; 47,781 multiallelic records; 4,022,526 PASS.

Not measured: a browser on a phone. The page reads in a worker with progress and a Stop button, so a slower device
takes longer without blocking the page.
