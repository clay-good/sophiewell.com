# Spec Delta — variant-interpretation-math

## ADDED Requirements

### Requirement: ACMG/AMP class by three published methods

The catalog SHALL provide `acmg-variant-classify` returning, for the evidence codes the reader applies, the
Richards 2015 Table 5 class with the rule that fired, the Tavtigian 2020 point total and class, and the
Tavtigian 2018 posterior probability at prior 0.10, flagging disagreement and naming Pathogenic (ii) and
Likely Pathogenic (i) as the two rules the 2018 paper found inconsistent; it SHALL NOT offer a per-code
strength change until the Richards text on adjusting strength has been read.

#### Scenario: Agreement
- **WHEN** PVS1 and PS3 are applied
- **THEN** the 2015 class is Pathogenic under rule (i), the points are 12 (Pathogenic), and the posterior
  prints 0.9986

#### Scenario: Two strong criteria
- **WHEN** PS1 and PS3 are applied
- **THEN** the 2015 class is Pathogenic under rule (ii), the points are 8 (Likely Pathogenic), and the page
  quotes the 2018 finding that rule (ii) is inconsistent with the framework

#### Scenario: Very strong and moderate
- **WHEN** PVS1 and PM2 are applied
- **THEN** the 2015 class is Likely Pathogenic under rule (i) and the points are 10 (Pathogenic), with the
  same flag

#### Scenario: Conflicting evidence
- **WHEN** PS3 and BS3 are applied
- **THEN** the 2015 class is uncertain significance because the criteria conflict, and the points are 0
  (uncertain)

#### Scenario: Stand-alone benign
- **WHEN** BA1 alone is applied
- **THEN** the 2015 class is Benign under rule (i) and the page says the 2020 point system does not score BA1

#### Scenario: Posterior at the band edge
- **WHEN** the point total is 6
- **THEN** the class is Likely Pathogenic, the posterior prints 0.8999 at prior 0.10, and the page quotes the
  2020 note that the prior is operationally just above 0.10 (0.102)

### Requirement: Maximum credible allele frequency and allele-count ceiling

The catalog SHALL provide `max-credible-allele-frequency` computing, for dominant inheritance as read in
Whiffin 2017, maxAF = prevalence × 1/2 × maximum allelic contribution × 1/penetrance and the allele-count
ceiling as the one-tailed 95% Poisson upper bound at the reader's allele number, keeping the recessive form
disabled until its equation has been transcribed.

#### Scenario: Hypertrophic cardiomyopathy example
- **WHEN** prevalence is 1 in 500, maximum allelic contribution 0.02, penetrance 0.5 and AN 121,412
- **THEN** maxAF prints 4.0 × 10⁻⁵, the ceiling prints 9, and an observed count of 3 is not excluded by
  frequency

#### Scenario: Above the ceiling
- **WHEN** the same model is used with an observed count of 12
- **THEN** the variant is reported as too common for this disease model

#### Scenario: Recessive before the gate
- **WHEN** the reader chooses recessive inheritance and the equation has not been transcribed
- **THEN** the tool does not answer and says which source is still to be read

### Requirement: Local genotype lookup in a VCF

The catalog SHALL provide `vcf-variant-lookup` reading a reader-supplied `.vcf` or `.vcf.gz` in the browser
without upload, finding a record by CHROM and POS (optionally REF and ALT) or by ID, and printing the
record's REF, ALT, QUAL and FILTER and the chosen sample's GT as written, phase, zygosity, DP, GQ and allele
balance from AD, with the file's reference line; a position absent from the file SHALL read "not in this
file".

#### Scenario: Homozygous alternate
- **WHEN** the VCFv4.5 §1.1 example is read, position 20:14370 G>A, sample NA00003
- **THEN** GT prints 1/1, unphased, homozygous alternate, DP 5

#### Scenario: Phased homozygous reference
- **WHEN** the same record is read for sample NA00001
- **THEN** GT prints 0|0, phased, homozygous reference

#### Scenario: Allele balance
- **WHEN** a heterozygous call has AD 10,8
- **THEN** allele balance prints 0.444

#### Scenario: Absent position
- **WHEN** the position is not in the file
- **THEN** the result reads "not in this file", not "reference"

#### Scenario: Compressed file read short
- **WHEN** a multi-member compressed file cannot be decompressed whole by the browser
- **THEN** the tool says the file could not be read whole and reports nothing as complete

### Requirement: VCF summary with stated definitions

The catalog SHALL provide `vcf-qc-summary` printing record, FILTER-pass, SNV, insertion, deletion,
multiallelic and per-chromosome counts, transitions and transversions per SNV ALT allele and their ratio,
and the chosen sample's heterozygous, homozygous-alternate and missing calls, with each definition stated
and no expected range.

#### Scenario: Specification example
- **WHEN** the VCFv4.5 §1.1 example is read for sample NA00003
- **THEN** records print 5 with 4 passing FILTER, transitions 2 and transversions 2 (Ti/Tv 1.00), and the
  sample has 0 heterozygous and 3 homozygous-alternate calls
