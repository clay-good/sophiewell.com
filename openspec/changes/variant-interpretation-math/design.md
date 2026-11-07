# Design — Variant interpretation arithmetic and private VCF reading

Read on November 7, 2026 unless marked "not opened". Every number in **Tests** was recomputed independently on
that date (scratch scripts, not repository code). The compressed-file behavior was tested in Chrome 152 and
Node 26 on the same day.

## Sources

| Source | Status |
|---|---|
| Richards S, et al. *Genet Med* 2015;17:405-424 (PMID 25741868, PMC4544753) | read: Table 5 combining rules; the strength-change sentence; Tables 3 and 4 code descriptions. NIH author manuscript under Nature's academic-use terms, **not an open license**: code descriptions are paraphrased in a few words, never copied (owner decision of October 17, 2026, [scope-pharmacy-practice](../../../docs/scope-pharmacy-practice.md) question 11: facts with attribution) |
| Tavtigian SV, et al. *Genet Med* 2018;20:1054-1060 (PMC6336098) | read: prior 0.10, OPVSt 350, X = 2 scaling, posterior formula, thresholds above 0.90 and 0.99, the two inconsistent rules |
| Tavtigian SV, et al. *Hum Mutat* 2020;41:1734-1737 (PMC8011844) | read: Table 2 points (±1, ±2, ±4, ±8; 0 indeterminate) and Table 3 classes; the prior "infinitesimally greater than 0.10" (0.102 given) |
| ClinGen SVI, criteria code modifications, v1.0, November 10, 2017 (clinicalgenome.org) | read: "using the original criteria code followed by an underscore and new level of strength" (PP1_Moderate, PS3_Supporting) |
| ClinGen SVI, PM2 recommendation, approved September 4, 2020 (clinicalgenome.org) | read: PM2 lowered to PM2_Supporting, and one very strong plus one supporting reaches Likely pathogenic (Post_P 0.988) |
| Abou Tayoun AN, et al. PVS1 decision tree. *Hum Mutat* 2018 (PMC6185798) | read: PVS1, PVS1_Strong, PVS1_Moderate, PVS1_Supporting at odds 350, 18.7, 4.33 and 2.08 |
| Whiffin N, et al. *Genet Med* 2017;19:1151-1158 (PMC5563454, CC BY 4.0) | read: equation images 1-4 (viewed directly), text, the HCM and PCD examples; cross-checked against the authors' manuscript source (github.com/ImperialCardioGenetics/frequencyFilter, `manuscript.Rmd`) and the authors' calculator (github.com/jamesware/alleleFrequencyApp, `server.R`, LGPL-2.1) |
| gnomAD help, "filtering allele frequency" (github.com/broadinstitute/gnomad-browser, `faf.md`, MIT) | read: FAF is the lower bound of the 95% (and 99%) Poisson interval per genetic ancestry group, cites Whiffin 2017, and leaves out the ami, asj, fin and rmi groups from GroupMax |
| VCFv4.5 specification (samtools hts-specs) | read: §1.1 example, fixed columns, GT, DP, AD, GQ, FILTER |
| SAMv1 specification §4.1, BGZF (hts-specs, printing of August 12, 2025) | read: "a series of concatenated BGZF blocks, each no larger than 64 KiB"; each block "a spec-compliant gzip archive"; BSIZE is "total Block SIZE minus 1" in the `BC` extra subfield; the 28-byte EOF block `1f 8b 08 04 00 00 00 00 00 ff 06 00 42 43 02 00 1b 00 03 00 00 00 00 00 00 00 00 00` |

## The rules, as read

**Richards 2015 Table 5.** Pathogenic: (i) 1 very strong (PVS1) and ≥1 strong, or ≥2 moderate, or 1 moderate and
1 supporting, or ≥2 supporting; (ii) ≥2 strong; (iii) 1 strong and ≥3 moderate, or 2 moderate and ≥2 supporting,
or 1 moderate and ≥4 supporting. Likely pathogenic: (i) PVS1 and 1 moderate; (ii) 1 strong and 1-2 moderate;
(iii) 1 strong and ≥2 supporting; (iv) ≥3 moderate; (v) 2 moderate and ≥2 supporting; (vi) 1 moderate and ≥4
supporting. Benign: (i) BA1; (ii) ≥2 strong benign. Likely benign: (i) 1 strong and 1 supporting benign; (ii) ≥2
supporting benign. Otherwise, or when benign and pathogenic criteria conflict: uncertain significance.

**Strength changes.** Richards: "some criteria listed as one weight can be moved to another weight using
professional judgment depending on the evidence collected". ClinGen writes the result as `CODE_Strength`. Table 5
then counts the code at its applied strength. A code applied at "very strong" other than PVS1 counts as very
strong; the 2015 table names PVS1 because it was the only very strong code.

**Points (Tavtigian 2020).** Supporting ±1, moderate ±2, strong ±4, very strong ±8. Pathogenic ≥10; likely
pathogenic 6 to 9; uncertain 0 to 5; likely benign −1 to −6; benign ≤−7.

**Posterior (Tavtigian 2018).** Odds = 350^(points ÷ 8); posterior = odds × prior ÷ ((odds − 1) × prior + 1),
prior 0.10.

**Whiffin 2017, as the authors compute it.**

| Inheritance | Maximum credible population allele frequency |
|---|---|
| Dominant | 1/2 × prevalence × maximum allelic contribution × maximum genetic contribution × 1/penetrance |
| Recessive | √prevalence × maximum allelic contribution × √(maximum genetic contribution) × 1/√penetrance |

The printed dominant equation (image 1) omits the 1/2 and the genetic-contribution term; the worked HCM example in
the same paper applies the 1/2 ("dividing prevalence per individual by the number of chromosomes per
individual") and the authors' calculator applies both. The tool follows the worked example and the calculator,
with the genetic contribution defaulting to 1 (which reproduces the printed example), and says so on the page.
Allele-count ceiling: "the AC at the upper bound of the one-tailed 95% confidence interval ... of a Poisson
distribution ... given the sample size (observed allele number, AN)", the calculator's `qpois(0.95, AN × AF)`.

## Tools

### 1. `acmg-variant-classify` — ACMG/AMP Class From Evidence Codes

**Input.** Each evidence code the curator applies (PVS1, PS1-4, PM1-6, PP1-5, BA1, BS1-4, BP1-7), each with a
strength picker defaulting to Richards' weight; the code's short paraphrase beside it. Optional prior (default
0.10).
**Compute.** (a) The Richards class, naming the rule that fired, at applied strengths. (b) The point total and
class. (c) The posterior from the point total.
**Output.** The three side by side, the codes listed in ClinGen notation (`PS3_Moderate`). When (a) and (b)
disagree, the page says so; if the 2015 rule is Pathogenic (ii) or Likely Pathogenic (i), it quotes Tavtigian
2018 that these two are the inconsistent ones; if PM2 was applied at supporting with PVS1, it cites the 2020 SVI
note that this pair reaches Likely pathogenic, which the 2015 table does not list.
**Rule.** BA1 is stand-alone benign under the 2015 rules and is not scored in points (the 2020 paper does not
score it); the page says so. A benign code may be moved only between supporting and strong unless the reader
ticks that a gene-specific specification allows another weight. No class is "final"; gene- and
disease-specific ClinGen specifications are not applied and the page says so.

### 2. `max-credible-allele-frequency` — Maximum Credible Allele Frequency (Whiffin)

**Input.** Inheritance (dominant or recessive); prevalence (1 in N or a fraction); maximum allelic contribution;
maximum genetic contribution (default 1); penetrance; and then either the variant's allele count and allele number
from the reader's population database, or its filtering allele frequency (FAF) as gnomAD reports it.
**Compute.** maxAF as above; ceiling = smallest k with Poisson CDF(k; AN × maxAF) ≥ 0.95. With AC and AN: too
common when AC > ceiling. With a FAF: too common when FAF ≥ maxAF (Whiffin: "A variant with a filtering AF ≥ the
maximum credible AF ... should be filtered").
**Output.** maxAF, the ceiling for the entered AN, the decision, and every input repeated.
**Rule.** All inputs between 0 and 1 (prevalence above 0); a contribution of 0 refuses. The page says the result
is only as conservative as the prevalence and penetrance entered, and that gnomAD leaves some groups out of
GroupMax FAF.

### 3. `vcf-variant-lookup` — Genotype at a Position in My VCF

**Input.** A dropped `.vcf`, `.vcf.gz` (BGZF) or `.vcf.bgz`; a position as CHROM and POS (optional REF and ALT),
or an ID from the ID column; the sample column if more than one.
**Reading.** Streamed, never loaded whole: plain text through `File.stream()` and a line splitter; compressed
files block by block (see **Compressed files**). The first line must be `##fileformat=VCFv4.x`; other versions
read with a note. Chromosome names are compared as written and also with a leading `chr` removed, and the page
says when that alias was needed. The file's `##reference` or `##contig` assembly, if present, is printed.
**Compute.** Matching records; GT, DP, AD and GQ by the FORMAT keys present. Zygosity: both alleles 0
homozygous reference; two different alleles heterozygous; two identical non-zero alleles homozygous alternate;
one allele hemizygous or haploid; any `.` missing. Allele balance = AD for the matched ALT ÷ sum of AD.
**Output.** REF, ALT, QUAL, FILTER; the sample's GT as written, phase, zygosity, DP, GQ, allele balance.
**Rule.** No build conversion, no annotation, no phenotype. A position not in the file reads "not in this file",
not "reference": many VCFs list only variant sites. A sorted file stops reading a chromosome once past the
position; an unsorted file is detected and read to the end.

### 4. `vcf-qc-summary` — VCF Summary

**Input.** As tool 3, without a position.
**Compute.** Records; FILTER `PASS`; SNV, insertion, deletion, other and multiallelic counts; per-chromosome
counts; transitions (A↔G, C↔T) and transversions per SNV ALT allele and Ti/Tv; for the sample, heterozygous,
homozygous-alternate and missing calls and the het/hom-alt ratio (or "no homozygous-alternate calls").
**Output.** The counts and ratios with each definition stated, the bytes read and the time taken. No expected
range is printed; ranges depend on capture, caller and ancestry and no primary source was read for them.

## Compressed files

**Tested November 7, 2026.** `DecompressionStream('gzip')`, which the existing `gunzipBlob`
(`lib/zip-reader.js`) uses, decodes a single gzip member and **throws on a file of two or more members** in both
Chrome 152 ("Failed to fetch") and Node 26 ("Trailing junk found after the end of the compressed stream"). A BGZF
file is many members by design, so every real `.vcf.gz` fails today, including in the intake inventory
(`lib/intake.js` unpacks `.gz` with `gunzipBlob`).

**Fix, proven in both runtimes on synthetic BGZF files built to SAMv1 §4.1:** read each block's header, take
BSIZE from the `BC` subfield, slice `BSIZE + 1` bytes, and decode that slice alone with `DecompressionStream`;
repeat to the end; confirm the last block is the 28-byte EOF marker and say so if it is missing ("the file may be
truncated"). Decoding 2,000 blocks (120 MB uncompressed, highly compressible synthetic text) took 267 ms in Chrome
(about 450 MB/s); parsing, not decompression, will bound speed, and the build measures a real whole-genome file.
A gzip file whose first member has no `BC` subfield and that has more than one member cannot be split without an
inflater and is refused with "decompress this file first".

The splitter is a shared pure module used by tools 3 and 4, the intake inventory (which fixes `.gz` recognition
for every multi-member file, a pre-existing defect this change surfaces), and the MCP file tools.

## Size

`lib/upload-intake.js` caps whole-file reads at 50 MB (`MAX_FILE_BYTES`). A whole-genome VCF is several gigabytes,
so tools 3 and 4 never read a file whole: they stream, show progress (bytes read of total), can be cancelled, and
hold only counters and the current line in memory. The 50 MB cap is unchanged for every other tool. Recognition
(`lib/file-kinds.js`) needs only the head: a new `vcf` kind, matched on a first line `##fileformat=VCFv`, after
the first BGZF block is decoded for a compressed file.

## Tests

- `acmg-variant-classify`: PVS1 + PS3 → 2015 Pathogenic (i), 12 points Pathogenic, posterior 0.9986. PS1 + PS3 →
  2015 Pathogenic (ii), 8 points Likely Pathogenic, flag. PVS1 + PM2 → 2015 Likely Pathogenic (i), 10 points
  Pathogenic, flag. PVS1 + PM2_Supporting → no 2015 rule (uncertain), 9 points Likely Pathogenic, posterior 0.9878,
  SVI 2020 note shown. PS3 + BS3 → conflicting, uncertain; 0 points; posterior 0.10. BA1 → Benign (i), not scored.
  6 points → Likely Pathogenic, posterior 0.8999 at prior 0.10 and 0.9019 at 0.102. −1 → Likely Benign, 0.0507;
  −7 → Benign, 0.00066. Every Table 5 rule fires on a minimal code set; point bands at −7, −6, −1, 0, 5, 6, 9, 10.
- `max-credible-allele-frequency`: dominant HCM (1 in 500, allelic 0.02, genetic 1, penetrance 0.5) → 4.0 × 10⁻⁵,
  ceiling 9 at AN 121,412; penetrance 1 → ceiling 5; AC 3 not excluded; AC 12 too common. Recessive PCD (1 in
  10,000, allelic 0.57, genetic 0.09, penetrance 0.5) → 2.418 × 10⁻³, ceiling 322 at AN 121,412 (the paper's text
  later prints "AC>332", taken as a typo for 322; the AN for this example is not stated in the paper and 121,412
  is the one that reproduces 322). The paper's own check: AF 10⁻⁴ at AN 100,000 → ceiling 15. FAF 5 × 10⁻⁵ against
  maxAF 4.0 × 10⁻⁵ → too common.
- `vcf-variant-lookup`: the VCFv4.5 §1.1 example as a fixture: 20:14370 NA00003 → 1/1, unphased, homozygous
  alternate, DP 5; NA00001 → 0|0 phased, homozygous reference; 20:1110696 A>T NA00001 → 1|2, heterozygous (the T
  allele is ALT 2); 20:1230237 (ALT `.`) → reference-only site; absent position → "not in this file"; `chr20`
  queried against `20` → found, alias noted; AD 10,8 → 0.444.
- `vcf-qc-summary`: the §1.1 example, NA00003 → 5 records, 4 PASS, Ti 2, Tv 2, Ti/Tv 1.00, 0 heterozygous, 3
  homozygous alternate.
- Compressed files: a BGZF fixture of several blocks with the EOF marker reads whole; the same without the marker
  reads with the truncation note; a plain two-member gzip without `BC` is refused; a single-member `.gz` reads.

## MCP

One adapter each for tools 1 and 2 with the existing field kinds (codes as one string, one per line, e.g.
`PVS1\nPS3_Moderate`). Tools 3 and 4 join `ANALYZABLE` in `mcp/file-tools.js`, so `analyze_file` reads a VCF only
inside a directory the client shares and returns the result and a hash, never the file, as the existing file
tools do. No VCF content goes into a tool argument.

## Decisions

**D1 — Three methods side by side, not one.** Laboratories still sign out by the 2015 rules; the points and the
posterior show where those rules are inconsistent.

**D2 — The reader brings every frequency.** No gnomAD, ClinVar or dbSNP mirror; a genome-scale index is a separate
product, not a calculator.

**D3 — Follow the authors' arithmetic where their printed equation and worked example differ** (Whiffin's 1/2),
and say so on the page.

**D4 — One BGZF reader for the whole catalog.** The defect is in shared intake code, so the fix is shared.

## Verify at build

- Re-read Richards Table 5 and the SVI pages; check whether ClinGen has published a newer general SVI
  recommendation that changes a default strength (the PM2 change is the precedent).
- Re-check the Whiffin calculator source for any change since commit 3ef11c37.
- Measure tools 3 and 4 on a real public whole-genome VCF (for example a 1000 Genomes or Genome in a Bottle
  sample) and record bytes per second in the build record.

## Risks

- **Over-reading a class.** Tool 1 says on every result that it combines the codes it was given.
- **Large files on low-memory devices.** Streaming keeps memory flat; the page shows progress and can be stopped.
- **Assembly mismatch.** A position is meaningless across builds; the file's assembly line is printed beside
  every lookup.

## Rejected

| Idea | Why not |
|---|---|
| Star-allele or phenotype calling from a VCF or a consumer raw-data file | Rejected in [spec-v1640](../../../docs/spec-v1640.md); not reopened. |
| ClinVar, gnomAD or dbSNP lookup | Genome-scale reference data; the reader enters the value. |
| VEP-style consequence prediction, CADD, REVEL, SpliceAI | Models and large annotation sets; not deterministic from a source the build can read. |
| Polygenic scores | Rejected in spec-v1640. |
| A consumer 23andMe or Ancestry "health report" | Array coverage and accuracy for rare pathogenic variants are limited; a report would imply a clinical result the file cannot support. |
| A WebAssembly inflater for non-BGZF multi-member gzip | A dependency for a rare case; such files are refused with a plain instruction instead. |
