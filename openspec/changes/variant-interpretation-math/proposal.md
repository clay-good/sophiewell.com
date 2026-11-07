# Change: Variant interpretation arithmetic and private VCF reading

**Status:** Proposed November 7, 2026; hardened the same day (both partial gates resolved from read sources,
compressed-file reading tested in Chrome and Node, every test vector recomputed). Docs-only: no catalog-count or
code change. Four tools; none is build-gated.
**Audience:** the genetic counselor, the clinical laboratory geneticist and variant scientist, the trainee
learning ACMG/AMP classification, and a person holding their own VCF who will not upload it anywhere.

## Why

The catalog has genetic counseling risk arithmetic (`hardy-weinberg-carrier`, `residual-carrier-risk`,
`recessive-couple-risk`, `x-linked-bayes-risk`, `bayes-risk-table`) and pharmacogenomics from a lab's
printed result (`pgx-diplotype-phenotype`, `cpic-gene-drug`, `pgx-panel-review`). It has nothing for the
step between a sequencing result and a report: combining ACMG/AMP evidence into a class, checking whether a
variant is too common to cause the disease, or reading a genotype out of a VCF without sending the file
anywhere.

A name search of the live catalog on November 7, 2026 for "ACMG", "AMP", "pathogenic", "VUS",
"allele frequency", "gnomAD", "VCF", "zygosity", "allele balance" and "Ti/Tv" found nothing.

Sources read on November 7, 2026:

- Richards S, et al. Standards and guidelines for the interpretation of sequence variants. *Genet Med*
  2015;17:405-424 (PMID 25741868, PMC4544753): Table 5, the combining rules.
- Tavtigian SV, et al. Modeling the ACMG/AMP variant classification guidelines as a Bayesian
  classification framework. *Genet Med* 2018;20:1054-1060 (PMID 29300386, PMC6336098).
- Tavtigian SV, et al. Fitting a naturally scaled point system to the ACMG/AMP variant classification
  guidelines. *Hum Mutat* 2020;41:1734-1737 (PMID 32720330, PMC8011844).
- Whiffin N, et al. Using high-resolution variant frequencies to empower clinical genome interpretation.
  *Genet Med* 2017;19:1151-1158 (PMC5563454, CC BY 4.0).
- The Variant Call Format Specification, VCFv4.5 (samtools hts-specs).

## What changes

| # | id | Name | Source |
|---|---|---|---|
| 1 | `acmg-variant-classify` | ACMG/AMP Variant Class From Evidence Codes: 2015 Rules, Points and Posterior | Richards 2015 Table 5 and strength-change text; Tavtigian 2018 and 2020; ClinGen SVI notation and PM2 note (read) |
| 2 | `max-credible-allele-frequency` | Maximum Credible Allele Frequency and Allele-Count Ceiling (Whiffin) | Whiffin 2017 equation images and examples, cross-checked against the authors' manuscript source and calculator (read) |
| 3 | `vcf-variant-lookup` | Genotype, Zygosity and Allele Balance at a Position in My VCF | VCFv4.5 (read) |
| 4 | `vcf-qc-summary` | VCF Summary: Variant Counts, Ti/Tv, Heterozygous to Homozygous-Alternate Ratio | VCFv4.5 (read); arithmetic identity |

## Why this passes the admission rule

Tool 1 takes the reader's evidence codes and returns a class by three published methods. Tool 2 takes the
reader's disease parameters and population counts and returns a ceiling and a filter decision. Tools 3 and
4 read the reader's own file in the browser and return computed fields. Nothing ships a variant database:
the reader brings the gnomAD frequency, the evidence and the file.

## What this does not do

- **It does not reopen spec-v1640.** No star-allele calling from rsIDs, a VCF or a consumer raw-data file,
  and tools 3 and 4 do not feed any pharmacogenomics tool. A genotype read from a VCF is not a phenotype.
- It does not annotate consequence (VEP), look up ClinVar, gnomAD or dbSNP, or score in silico
  pathogenicity. Those need genome-scale reference data and models; the reader looks them up and enters the
  result.
- It does not decide which evidence codes apply. That is the curator's judgment; the tool combines what the
  curator selected.
- Nothing is uploaded. Files are streamed with the browser's own file and decompression APIs.

## A defect this surfaced

`.vcf.gz` files are BGZF (many gzip members). The browser's and Node's `DecompressionStream` decode only one
member and throw on the rest (tested November 7, 2026), so the catalog's shared `gunzipBlob` cannot read any
multi-member gzip today. This change specifies one shared block-by-block reader that fixes it for the intake
inventory as well as the new tools; see `design.md`, **Compressed files**.

## Impact

- New capability `variant-interpretation-math`.
- Backfills (links only): `bayes-risk-table` links tool 1's posterior; `hardy-weinberg-carrier` links tool 2.
- Shared code: a BGZF block reader used by `lib/intake.js`, tools 3 and 4 and `mcp/file-tools.js`; a new `vcf`
  kind in `lib/file-kinds.js`.
- MCP: adapters for tools 1 and 2; tools 3 and 4 join `analyze_file`, which reads a file only inside a directory
  the client shares and returns results and a hash, never the file.
