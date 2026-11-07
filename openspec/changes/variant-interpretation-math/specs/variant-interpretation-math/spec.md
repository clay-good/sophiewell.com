# Spec Delta — variant-interpretation-math

## ADDED Requirements

### Requirement: ACMG/AMP class by three published methods

The catalog SHALL provide `acmg-variant-classify` returning, for the codes applied at their applied strengths,
the Richards 2015 class with the rule that fired, the Tavtigian 2020 points and class, and the 2018 posterior at
the reader's prior (default 0.10), writing modified strengths in ClinGen notation, flagging disagreement and the
two inconsistent 2015 rules, and leaving BA1 out of the points while saying so.

#### Scenario: Agreement
- **WHEN** PVS1 and PS3 are applied
- **THEN** the 2015 class is Pathogenic under rule (i), the points are 12 (Pathogenic), and the posterior prints
  0.9986

#### Scenario: Two strong criteria
- **WHEN** PS1 and PS3 are applied
- **THEN** the 2015 class is Pathogenic under rule (ii), the points are 8 (Likely Pathogenic), and the page quotes
  the 2018 finding that rule (ii) is inconsistent with the framework

#### Scenario: Very strong and moderate
- **WHEN** PVS1 and PM2 are applied
- **THEN** the 2015 class is Likely Pathogenic under rule (i) and the points are 10 (Pathogenic), with the same flag

#### Scenario: A modified strength
- **WHEN** PVS1 and PM2 at supporting strength are applied
- **THEN** the codes print as PVS1 and PM2_Supporting, no 2015 rule is met (uncertain), the points are 9 (Likely
  Pathogenic) with posterior 0.9878, and the page cites ClinGen's 2020 note that this pair reaches Likely
  pathogenic

#### Scenario: Conflicting evidence
- **WHEN** PS3 and BS3 are applied
- **THEN** the 2015 class is uncertain significance because the criteria conflict, and the points are 0

#### Scenario: Stand-alone benign
- **WHEN** BA1 alone is applied
- **THEN** the 2015 class is Benign under rule (i) and the page says the point system does not score BA1

#### Scenario: Posterior at the band edge
- **WHEN** the point total is 6
- **THEN** the class is Likely Pathogenic, the posterior prints 0.8999 at prior 0.10 and 0.9019 at prior 0.102,
  and the page quotes the 2020 note that the prior is operationally just above 0.10

### Requirement: Maximum credible allele frequency and allele-count ceiling

The catalog SHALL provide `max-credible-allele-frequency` computing Whiffin's dominant and recessive maximum
credible allele frequency as the authors' worked examples and calculator compute them (design.md gives both
forms), the one-tailed 95% Poisson allele-count ceiling at the reader's allele number, and a decision from an
allele count or a filtering allele frequency, noting that the printed dominant equation omits the 1/2.

#### Scenario: Dominant example
- **WHEN** prevalence is 1 in 500, maximum allelic contribution 0.02, genetic contribution 1, penetrance 0.5 and
  AN 121,412
- **THEN** maxAF prints 4.0 × 10⁻⁵, the ceiling 9, and an allele count of 3 is not excluded by frequency

#### Scenario: Full penetrance
- **WHEN** the same model uses penetrance 1
- **THEN** the ceiling prints 5

#### Scenario: Recessive example
- **WHEN** prevalence is 1 in 10,000, allelic contribution 0.57, genetic contribution 0.09, penetrance 0.5 and AN
  121,412
- **THEN** maxAF prints 2.418 × 10⁻³ and the ceiling 322

#### Scenario: Filtering allele frequency
- **WHEN** the dominant example is used with a filtering allele frequency of 5 × 10⁻⁵
- **THEN** the variant is reported as too common for this disease model

### Requirement: Compressed VCFs are read block by block

The catalog SHALL read BGZF-compressed files by splitting them at each block's `BC` size field and decoding each
block alone, reporting a missing end-of-file marker as possible truncation, refusing a multi-member gzip that has
no `BC` field, and using this one reader for the intake inventory, the VCF tools and the MCP file tools.

#### Scenario: A BGZF file
- **WHEN** a VCF compressed as several BGZF blocks with the end-of-file marker is dropped
- **THEN** every line is read and no error is raised, where decoding the whole file at once would have failed

#### Scenario: Missing end-of-file marker
- **WHEN** the same file lacks the final 28-byte marker
- **THEN** the result is shown with a note that the file may be truncated

#### Scenario: Unsplittable gzip
- **WHEN** a gzip file with two members and no `BC` subfield is dropped
- **THEN** the tool refuses and asks the reader to decompress the file first

### Requirement: Local genotype lookup in a VCF

The catalog SHALL provide `vcf-variant-lookup` streaming a reader's VCF in the browser without upload or size
cap, finding a record by position or ID (with or without a `chr` prefix, said when used), and printing the
record, the file's assembly line, and the sample's GT, phase, zygosity, DP, GQ and allele balance; a position
absent from the file SHALL read "not in this file".

#### Scenario: Homozygous alternate
- **WHEN** the VCFv4.5 §1.1 example is read at 20:14370 G>A for sample NA00003
- **THEN** GT prints 1/1, unphased, homozygous alternate, DP 5

#### Scenario: Phased homozygous reference
- **WHEN** the same record is read for sample NA00001
- **THEN** GT prints 0|0, phased, homozygous reference

#### Scenario: Second alternate allele
- **WHEN** 20:1110696 A>T is read for sample NA00001
- **THEN** GT prints 1|2 and the sample is heterozygous carrying the T allele as ALT 2

#### Scenario: Chromosome alias
- **WHEN** chr20:14370 is asked of a file that writes the chromosome as 20
- **THEN** the record is found and the page says the `chr` prefix was ignored

#### Scenario: Allele balance
- **WHEN** a heterozygous call has AD 10,8
- **THEN** allele balance prints 0.444

#### Scenario: Absent position
- **WHEN** the position is not in the file
- **THEN** the result reads "not in this file", not "reference"

### Requirement: VCF summary with stated definitions

The catalog SHALL provide `vcf-qc-summary` streaming the file and printing record, FILTER-pass, SNV, insertion,
deletion, multiallelic and per-chromosome counts, transitions and transversions per SNV ALT allele and their ratio,
and the chosen sample's heterozygous, homozygous-alternate and missing calls, with each definition stated, the
bytes read, and no expected range.

#### Scenario: Specification example
- **WHEN** the VCFv4.5 §1.1 example is read for sample NA00003
- **THEN** records print 5 with 4 passing FILTER, transitions 2 and transversions 2 (Ti/Tv 1.00), and the sample
  has 0 heterozygous and 3 homozygous-alternate calls
