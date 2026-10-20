# Design — Genetic counseling risk arithmetic

The sources are historical papers and an arithmetic identity. None was opened in full for this
spec; each is a build gate to read before the page cites it. The arithmetic itself is stated so
the integrator can write the tests first.

## Sources

| Source | Status |
|---|---|
| Hardy GH. Mendelian proportions in a mixed population. *Science* 1908;28(706):49-50, doi 10.1126/science.28.706.49 | citation confirmed; open course-hosted copies found; **letter not read**; build gate |
| Weinberg W. Über den Nachweis der Vererbung beim Menschen. *Jahresh Ver Vaterl Naturkd Württemb* 1908;64:368 | cite beside Hardy; not opened |
| Bayes T. An essay towards solving a problem in the doctrine of chances. *Phil Trans R Soc* 1763;53:370 | not opened; cite for the theorem |
| Wright S. Coefficients of inbreeding and relationship. *Am Nat* 1922;56:330-338 | not opened; build gate |
| ACMG position statement on prenatal/preconception expanded carrier screening (Grody et al., *Genet Med* 2013) | search summary says it names carrier frequency and detection rate as the two inputs to residual risk; **not opened**; build gate |

## Tools

### 1. `hardy-weinberg-carrier` — Carrier Frequency From Disease Incidence (Hardy-Weinberg)

**Input.** Disease incidence for an autosomal recessive condition (as 1 in N, or a decimal); or,
the other way, an allele frequency q.
**Compute.** q = √(incidence); p = 1 − q; carrier frequency = 2pq; shown also as "1 in
1/(2pq)". Reverse: incidence = q².
**Output.** q, p, 2pq as a decimal and as "1 in N", with the assumptions printed: random
mating, no selection, mutation or migration, a large population, and that the incidence is the
affected (q²) frequency at birth.
**Source.** Hardy 1908 (read the letter at build; it states the p² : 2pq : q² proportions).
**Rule.** Incidence must lie in (0, 1); the page says the approximation 2q is common when q is
small and prints both.
**Example for the test.** Incidence 1 in 2,500 → q = 0.02, p = 0.98, 2pq = 0.0392 = 1 in 25.5
(the usual cystic fibrosis illustration; the page labels it an illustration, not a population
figure).

### 2. `residual-carrier-risk` — Residual Carrier Risk After a Negative Screen

**Input.** Prior carrier frequency (from the laboratory report or a cited study, as 1 in N or a
decimal); detection rate of the test in that population (percent).
**Compute.** Posterior = CF × (1 − DR) ÷ (1 − CF × DR). The four-row Bayes table: prior carrier
CF vs non-carrier 1 − CF; conditional (negative result) 1 − DR vs 1; joint; posterior.
**Output.** The residual risk as "1 in N" and a decimal, with the table and the sentence that
both inputs are population- and test-specific.
**Source.** Bayes' theorem (arithmetic identity). **Build gate:** read the ACMG statement to cite
its sentence that residual risk requires carrier frequency and detection rate, and ACMG's 2021
caution that exact values are often not known; cite both.
**Example for the test.** CF 1/58, DR 91% → 1 in 634 (a commercial report rounds the same inputs to 1 in 630; the
test asserts the arithmetic, not the report).

### 3. `recessive-couple-risk` — Autosomal Recessive Risk to a Pregnancy From Two Carrier Risks

**Input.** Each partner's carrier risk (a residual risk from tool 2, a known 1 for a confirmed
carrier, or a population figure).
**Compute.** Risk of an affected child = risk A × risk B × 1/4. Also the risk that the child is a
carrier when both are carriers (1/2), shown for the "both confirmed" case.
**Output.** The risk as "1 in N" and decimal, with the working.
**Source.** Mendelian segregation (arithmetic identity).
**Rule.** A risk above 1 is refused; a blank partner names the field.

### 4. `x-linked-bayes-risk` — X-Linked Carrier Risk With Unaffected Sons (Bayes)

**Input.** The woman's prior carrier probability (for example 1/2 for the daughter of an obligate
carrier, 2/3 for the sister of an isolated case under the usual assumptions, entered by the
reader); the number of unaffected sons; optionally a carrier-test result with its detection
rate.
**Compute.** Conditional probability of n unaffected sons given carrier = (1/2)ⁿ; given
non-carrier = 1. Joint = prior × conditional. Posterior = joint(carrier) ÷ Σ joint. With a
negative test, multiply the carrier conditional by (1 − DR).
**Output.** The Bayes table with each row, the posterior as a fraction and "1 in N".
**Build gate.** The worked method is textbook (Young ID, *Introduction to Risk Calculation in
Genetic Counseling*; Bayes 1763 for the theorem). Read a source that states the 2/3 prior for the
sister of an isolated case (with its mutation-rate assumptions) before the page offers it as a
preset; until then the prior is typed by the reader.

### 5. `coefficient-of-relationship` — Coefficient of Relationship and Inbreeding for a Consanguineous Couple

**Input.** The relationship between the partners (first cousins, second cousins, uncle-niece,
double first cousins, half-siblings, first cousins once removed), or the path counts for a
pedigree the reader describes.
**Compute.** Wright's coefficient of relationship r = Σ (1/2)^(n) over paths, and the
inbreeding coefficient of the offspring F = r/2 (for a non-inbred common ancestor). Then, with a
carrier frequency entered, the chance both partners carry the same allele by descent, and the
offspring's autosomal recessive risk by descent.
**Output.** r and F for the relationship, and the derived risks when a frequency is entered.
**Build gate.** Wright 1922 not opened; read it for the path-counting rule and the standard
values (first cousins F = 1/16, second cousins 1/64, uncle-niece 1/8) before the picker ships
them.
**Rule.** A relationship not in the picker needs the path counts typed; the tool never guesses.

### 6. Screen predictive value from a prior (dropped)

Dropped on October 19, 2026: the live `fagan-post-test` already returns this in its sensitivity and
specificity mode (pre-test 0.1%, sensitivity 99%, specificity 99.9% gives 49.8%), and `diagnostic-2x2`
recomputes predictive values at a target prevalence.

### 7. `bayes-risk-table` — Bayesian Risk Table (Prior, Conditional, Joint, Posterior)

**Input.** Two or more hypotheses with their priors; one or more pieces of evidence with the
conditional probability under each hypothesis.
**Compute.** Joint = prior × Π conditionals; posterior = joint ÷ Σ joints.
**Output.** The table with every cell and the posteriors; the priors must sum to 1 (the tool
normalizes only when told to, and says so).
**Source.** Bayes 1763.
**Neighbor.** `fagan-post-test` handles one test and two hypotheses; this tool adds more
hypotheses and several pieces of evidence, and prints every row of the table.
**Rule.** A conditional outside [0, 1] or priors not summing to 1 (without normalization) is
refused by name. This is the general tool the others are instances of; each specific tool links
it with its table prefilled.

## Decisions

**D1 — no population constants ship.** Every frequency, rate and prior is reader input, echoed
in the result with the words "as entered".

**D2 — the Bayes table is the output format.** Counselors check work by the four-row table; each
tool prints it.

**D3 — presets are gated on reading.** The 2/3 sister prior and the Wright coefficients appear
in pickers only after their sources are read.

## Risks

- **A preset read as a population fact.** Mitigated by D1 and the "illustration" label on the
  cystic fibrosis example.
- **Misuse as a diagnostic.** Every page carries the screening-is-not-diagnosis sentence and
  the standard clinical notice.
