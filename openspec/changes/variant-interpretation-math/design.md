# Design — Variant interpretation arithmetic and private VCF reading

Read on November 7, 2026 unless marked "not opened".

## Sources

| Source | Status |
|---|---|
| Richards 2015, *Genet Med* 17:405, PMC4544753 (NIH author manuscript; academic-use terms) | read: Table 5 and the evidence code names. Facts with attribution (owner decision of October 17, 2026, [scope-pharmacy-practice](../../../docs/scope-pharmacy-practice.md) question 11); code descriptions are in the project's own short words |
| Tavtigian 2018, *Genet Med* 20:1054, PMC6336098 | read: prior 0.10, OPVSt 350, X = 2 scaling, posterior formula, thresholds above 0.90 and 0.99, the two inconsistent rules |
| Tavtigian 2020, *Hum Mutat* 41:1734, PMC8011844 | read: Table 2 points and Table 3 thresholds; the paper's note that the prior should be "infinitesimally greater than 0.10" (0.102 given) |
| Richards 2015 text on adjusting a criterion's strength by professional judgment | **not located in the part read**; build gate for the strength picker |
| Whiffin 2017, *Genet Med* 19:1151, PMC5563454, CC BY 4.0 | read: the dominant form as stated in the table caption and the HCM worked example; the Poisson one-tailed 95% allele-count ceiling. **The equations are images**: the full equation (with the maximum genetic contribution term) and the recessive form were not transcribed; build gate |
| VCFv4.5 specification (samtools hts-specs, `VCFv4.5.pdf`) | read: §1.1 example, the fixed columns, GT (`/` unphased, `|` phased, `.` missing), DP, AD, GQ, FILTER |

## The rules, as read

**Richards 2015 Table 5.** Pathogenic: (i) 1 very strong (PVS1) and ≥1 strong, or ≥2 moderate, or 1
moderate and 1 supporting, or ≥2 supporting; (ii) ≥2 strong; (iii) 1 strong and ≥3 moderate, or 2 moderate
and ≥2 supporting, or 1 moderate and ≥4 supporting. Likely pathogenic: (i) PVS1 and 1 moderate; (ii) 1
strong and 1-2 moderate; (iii) 1 strong and ≥2 supporting; (iv) ≥3 moderate; (v) 2 moderate and ≥2
supporting; (vi) 1 moderate and ≥4 supporting. Benign: (i) BA1; (ii) ≥2 strong benign. Likely benign: (i)
1 strong and 1 supporting benign; (ii) ≥2 supporting benign. Contradictory benign and pathogenic criteria,
or no rule met: uncertain significance.

**Tavtigian 2020 points.** Pathogenic supporting +1, moderate +2, strong +4, very strong +8; benign
supporting −1, strong −4 (moderate −2 and very strong −8 noted as not specified by Richards). Pathogenic
≥10; likely pathogenic 6 to 9; uncertain 0 to 5; likely benign −1 to −6; benign ≤−7.

**Tavtigian 2018 posterior.** Odds for a total of P points = 350^(P ÷ 8); posterior = odds × prior ÷
((odds − 1) × prior + 1), prior 0.10. The two 2015 rules inconsistent with the framework: Pathogenic (ii)
and Likely Pathogenic (i).

## Tools

### 1. `acmg-variant-classify` — ACMG/AMP Class From Evidence Codes

**Input.** Each evidence code the curator applies (PVS1, PS1-4, PM1-6, PP1-5, BA1, BS1-4, BP1-7), at its
default strength; a strength change per code only after the build gate is met.
**Compute.** (a) The Richards 2015 class, naming the rule that fired, or "conflicting: uncertain
significance". (b) The Tavtigian 2020 point total and class. (c) The 2018 posterior from the point total,
at prior 0.10 and at the reader's prior if changed.
**Output.** The three results side by side. When (a) and (b) disagree, the page says so and, if the 2015
rule is Pathogenic (ii) or Likely Pathogenic (i), quotes Tavtigian 2018 that these two are the
mathematically inconsistent ones. BA1 is shown as stand-alone benign under the 2015 rule and excluded from
the point total, because the 2020 paper does not score it; the page says so.
**Rule.** No class is "final"; the page states that gene- and disease-specific ClinGen specifications
can change strengths and thresholds and are not applied here.

### 2. `max-credible-allele-frequency` — Maximum Credible Allele Frequency (Whiffin)

**Input.** Inheritance (dominant now; recessive after the gate); disease prevalence (as 1 in N or a
fraction); maximum allelic contribution; penetrance; and, for the filter, the variant's allele count and
allele number from the reader's population database.
**Compute.** Dominant, as read: maxAF = prevalence × 1/2 × maximum allelic contribution × 1/penetrance.
Allele-count ceiling: the smallest k with Poisson CDF(k; λ = maxAF × AN) ≥ 0.95. Filter: observed count
above the ceiling.
**Output.** maxAF, the ceiling for the entered AN, and "too common for this disease model" or "not
excluded by frequency", with the model's inputs repeated.
**Build gate.** Read the full equation in the published article (or the authors' calculator) to confirm
how the maximum genetic contribution enters, and transcribe the recessive form. Until then the recessive
choice is disabled and says why.
**Rule.** The reader's numbers are the model; the page says the result is only as conservative as the
prevalence and penetrance entered.

### 3. `vcf-variant-lookup` — Genotype at a Position in My VCF

**Input.** A dropped `.vcf` or `.vcf.gz` file; a position as CHROM and POS (with optional REF and ALT), or
an ID from the ID column; the sample column if more than one.
**Compute.** Stream the file line by line; check the `##fileformat` line; find matching records; parse GT,
DP, AD and GQ by the FORMAT keys present. Zygosity from GT: both alleles 0 homozygous reference; two
different alleles heterozygous; two identical non-zero alleles homozygous alternate; one allele
hemizygous; `.` missing. Allele balance = AD for the matched ALT ÷ sum of AD.
**Output.** The record's REF, ALT, QUAL and FILTER; the sample's GT as written, phased or unphased,
zygosity, DP, GQ, allele balance; and the file's reference-genome line if it has one, so the reader sees
which build the position refers to.
**Rule.** No build conversion, no annotation, no phenotype. A position not in the file reads "not in this
file", not "reference": many VCFs list only variant sites.

### 4. `vcf-qc-summary` — VCF Summary

**Input.** A dropped `.vcf` or `.vcf.gz`; the sample column.
**Compute.** Records; records passing FILTER; SNV, insertion, deletion and multiallelic counts; per
chromosome counts; transitions (A↔G, C↔T) and transversions per SNV ALT allele; Ti/Tv; for the sample,
heterozygous, homozygous-alternate and missing calls and the het/hom-alt ratio.
**Output.** The counts and ratios with each definition stated. No expected range is printed; ranges depend
on capture, caller and ancestry, and no primary source was read for them.

## Decisions

**D1 — Three methods side by side, not one.** Laboratories still sign out by the 2015 rules; the points
system and the posterior show where those rules are inconsistent. Showing all three is the honest answer.

**D2 — The reader brings every frequency.** No gnomAD, ClinVar or dbSNP mirror. A static reference index at
genome scale is a separate product, not a calculator.

**D3 — Local-only file reading.** Native `File.stream()` and `DecompressionStream('gzip')`; no library.

## Risks

- **BGZF.** `.vcf.gz` files are BGZF, a series of gzip members. If a browser's `DecompressionStream`
  stops after the first member, the tool must detect the short read and say "this compressed file could not
  be read whole; decompress it first", never report a partial count as complete. A test with a multi-member
  file is a ship gate.
- **Large files.** A whole-genome VCF is gigabytes; tool 4 streams and reports progress, and tool 3 stops at
  the first match per chromosome once past the position (files are position-sorted by specification; an
  unsorted file is detected and searched in full).
- **Over-reading a class.** Tool 1 says on every result that it combines the codes it was given.

## Rejected

| Idea | Why not |
|---|---|
| Star-allele or phenotype calling from a VCF or a consumer raw-data file | Rejected in [spec-v1640](../../../docs/spec-v1640.md); not reopened. |
| ClinVar, gnomAD or dbSNP lookup | Genome-scale reference data; violates the zero-backend, small-bundle posture. The reader enters the value. |
| VEP-style consequence prediction, CADD, REVEL, SpliceAI | Models and large annotation sets; not deterministic from a source the build can read. |
| Polygenic scores | Rejected in spec-v1640. |
| A consumer 23andMe or Ancestry "health report" | The arrays' coverage and accuracy for rare pathogenic variants is limited, and a report would imply a clinical result the file cannot support. |
