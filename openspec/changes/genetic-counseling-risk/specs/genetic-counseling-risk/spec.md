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

### Requirement: A general Bayes table

The catalog SHALL provide `bayes-risk-table` as the general tool for two or more hypotheses and one
or more pieces of evidence, printing every prior, conditional, joint and posterior, refusing priors
that do not sum to 1 unless normalization is requested, and linking `fagan-post-test` for the
single-test case. A separate screen predictive-value tool SHALL NOT be added: `fagan-post-test`
already computes it.

#### Scenario: Two pieces of evidence
- **WHEN** priors 1/2 and 1/2 are entered with conditionals 1/2 and 1 for one unaffected son, and
  the same again for a second son
- **THEN** the posteriors print 1/5 and 4/5 with each joint row shown

#### Scenario: Priors do not sum to one
- **WHEN** two hypotheses have priors 0.5 and 0.6 and normalization is not ticked
- **THEN** the tool refuses and names the priors
