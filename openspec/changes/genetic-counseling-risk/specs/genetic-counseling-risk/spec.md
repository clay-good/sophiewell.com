# Spec Delta — genetic-counseling-risk

## ADDED Requirements

### Requirement: Hardy-Weinberg carrier frequency from incidence

The catalog SHALL provide `hardy-weinberg-carrier` computing q, p and 2pq from an autosomal
recessive incidence (and the reverse), printing the assumptions and labeling its example an
illustration, with no population table shipped.

#### Scenario: One in 2,500
- **WHEN** incidence 1 in 2,500 is entered
- **THEN** q prints 0.02 and the carrier frequency 0.0392, shown as about 1 in 25.5

### Requirement: Residual and couple risk as a Bayes table

The catalog SHALL provide `residual-carrier-risk` (posterior = CF(1 − DR) ÷ (1 − CF·DR)) and
`recessive-couple-risk` (risk A × risk B × 1/4), each printing the four-row Bayes table or the
working, with carrier frequency and detection rate as reader input echoed "as entered".

#### Scenario: Residual risk
- **WHEN** carrier frequency 1 in 58 and detection rate 91% are entered
- **THEN** the residual risk prints about 1 in 634

#### Scenario: Couple risk
- **WHEN** partner A is a confirmed carrier (1) and partner B's residual risk is 1 in 634
- **THEN** the risk of an affected pregnancy prints 1 in 2,536

### Requirement: X-linked and consanguinity risks ship with read presets only

The catalog SHALL provide `x-linked-bayes-risk` and `coefficient-of-relationship` with their
arithmetic as designed; a preset prior (the 2/3 sister prior) or a preset relationship
coefficient SHALL appear in a picker only after its source has been read, and until then the
value is typed by the reader.

#### Scenario: Three unaffected sons
- **WHEN** the prior is 1/2 and three unaffected sons are entered
- **THEN** the posterior carrier risk prints 1/9 with the joint rows 1/16 and 1/2 shown

#### Scenario: Relationship not in the picker
- **WHEN** the reader's relationship is not listed
- **THEN** the tool asks for path counts and computes nothing until they are given

### Requirement: Screen predictive value from the prior and a general Bayes table

The catalog SHALL provide `screen-ppv-from-prior`, reusing the `diagnostic-2x2` predictive-value
function with a reader-entered prior and printing a per-10,000 table and the
screening-is-not-diagnosis sentence, and `bayes-risk-table` as the general tool, refusing
priors that do not sum to 1 unless normalization is requested.

#### Scenario: High specificity, low prior
- **WHEN** sensitivity 99%, specificity 99.9% and prior 1 in 1,000 are entered
- **THEN** PPV prints about 49.8% and the table shows about 10 true and 10 false positives
  per 10,000

#### Scenario: Priors do not sum to one
- **WHEN** two hypotheses have priors 0.5 and 0.6 and normalization is not ticked
- **THEN** the tool refuses and names the priors
