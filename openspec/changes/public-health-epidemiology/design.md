# Design — Public health epidemiology and biostatistics measures

Numbers marked "read" were read on the named page on October 19, 2026. A section marked
"build gate" states the standard formula for the integrator's orientation and must be read in its
source before any of it ships.

## Sources

| Source | Status |
|---|---|
| CDC, *Principles of Epidemiology in Public Health Practice*, 3rd ed. (2006, updated 2012), Lesson 3 "Measures of Risk", §2 Morbidity frequency measures, §3 Mortality frequency measures, §5 Measures of association, §6 Measures of public health impact (archive.cdc.gov) | read |
| Same, Lesson 3 §4 (age standardization) | not opened; build gate |
| Levin ML. The occurrence of lung cancer in man. *Acta Unio Int Contra Cancrum* 1953;9:531 (population attributable fraction) | not opened; build gate |
| Fine PEM. Herd immunity: history, theory, practice. *Epidemiol Rev* 1993;15:265 | not opened; build gate |
| Breslow NE, Day NE. *Statistical Methods in Cancer Research, Vol. II* (IARC 1987), the exact Poisson interval for an SMR | not opened; build gate |
| WHO, *WHO methods and data sources for global burden of disease estimates 2000-2021* (May 2024) and the 2000-2023 edition (September 2026) | not opened; build gate (the DALY = YLL + YLD structure was read in WHO's summary page) |
| Lwanga SK, Lemeshow S. *Sample size determination in health studies: a practical manual*. WHO 1991 | not opened (the WHO copy returned 403); build gate |

## Tools

### 1. `incidence-prevalence` — Incidence Proportion, Incidence Rate and Prevalence

**Input.** New cases in the period; population at the start of the period (for the proportion);
person-time observed, with its unit (for the rate); existing plus new cases at a point or over
the period (for prevalence); the multiplier (100, 1,000, 100,000).
**Compute.** Incidence proportion = new cases ÷ population at start. Incidence rate = new cases
÷ person-time. Point prevalence = all current cases at the point ÷ population at that point.
Period prevalence = all persons with the condition at any time in the period ÷ population in the
period.
**Output.** Each measure with its multiplier and unit named ("2.5 per 1,000 person-years"), and
the CDC distinction that incidence proportion is a proportion (0 to 1) while the rate has a time
unit.
**Source, read.** Lesson 3 §2. Worked examples that become tests: 16 cases ÷ 6,400 person-years
= 2.5 per 1,000 person-years; 100 deaths ÷ 189 diabetic men = 52.9%; point prevalence 7 ÷ 18 =
38.89%; period prevalence 10 ÷ 20 = 50.0%; 468 ÷ 1,150 = 40.7%.
**Rule.** Cases may not exceed the population; person-time must carry a unit; a blank population
names the field rather than computing a rate from zero.

### 2. `mortality-measures` — Mortality Measures: Crude, Cause-Specific, Infant, Maternal, Case Fatality

**Input.** The measure (crude; cause-specific; age-, sex- or race-specific; infant; neonatal;
postneonatal; maternal; case fatality; proportionate mortality; death-to-case ratio), then the
numerator and denominator that measure needs, and the multiplier.
**Compute.** As defined in Lesson 3 §3:

| Measure | Numerator | Denominator | Usual multiplier |
|---|---|---|---|
| Crude mortality rate | all deaths | mid-interval population | 1,000 or 100,000 |
| Cause-specific | deaths assigned to the cause | mid-interval population | 100,000 |
| Age-specific (sex-, race-) | deaths in the group | persons in the group | 100,000 |
| Infant mortality rate | deaths under 1 year | live births in the period | 1,000 |
| Neonatal | deaths under 28 days | live births | 1,000 |
| Postneonatal | deaths 28 days to under 1 year | live births | 1,000 |
| Maternal mortality rate | pregnancy-related deaths while pregnant or within 42 days of its end, excluding accidental or incidental causes | live births | 100,000 |
| Case-fatality rate | deaths among the incident cases | incident cases | 100 |
| Proportionate mortality | deaths from the cause | deaths from all causes | 100 |
| Death-to-case ratio | deaths attributed to the disease in the period | new cases in the period | 100 |

**Output.** The figure with multiplier and the CDC's note on the measure's nature: case fatality
is a proportion; maternal mortality is technically a ratio; the death-to-case ratio is a ratio
because the deaths may come from earlier cases; proportionate mortality is not a rate.
**Source, read.** Lesson 3 §3. Tests from its examples: 2,419,921 ÷ 290,809,777 × 100,000 =
832.1 per 100,000 (crude, US 2003); 108,256 → 37.2 per 100,000 (accidents, 2003); 3 ÷ 555 × 100 =
0.5% (hepatitis A case fatality); 11,228 ÷ 143,497 = 7.82 per 100 (diphtheria death-to-case).
**Note found while reading.** The CDC page's infant mortality example (28,025 ÷ 4,089,950)
prints 6.951 per 1,000, but the division gives 6.85. The tool's test uses the arithmetic, and
the page says the source example misprints its own result (the spec-v1641 convention for a
source defect).

### 3. `ypll` — Years of Potential Life Lost (YPLL) and YPLL Rate

**Input.** The end point (65, or an entered life expectancy); either a line list of ages at
death (pasted, one per line) or grouped data (age group lower and upper bound with the number
of deaths per group); optionally the population under the end point, for the rate, and the
multiplier.
**Compute.** Line list: exclude deaths at or above the end point; YPLL = Σ (end point − age at
death). Grouped: midpoint = (youngest + oldest + 1) ÷ 2; keep groups below the end point;
YPLL = Σ deaths × (end point − midpoint). YPLL rate = YPLL ÷ population under the end point ×
multiplier.
**Output.** The total, the per-group table, and the rate with its multiplier.
**Source, read.** Lesson 3 §3, the leukemia 2002 example: seven groups (0-4 through 55-64)
summing to 117,033 YPLL; rate 117,033 ÷ 252,755,000 × 1,000 = 0.5 per 1,000 under 65. The
group table in the page is the test fixture; the 0-4 group's midpoint 2.5 and 62.5 years to 65
pin the midpoint rule.
**Rule.** A group that straddles the end point is refused with the instruction to split it.

### 4. `attributable-proportion` — Attributable Proportion and Population Attributable Fraction

**Input.** Risk (or rate) among the exposed; risk among the unexposed; for the population
fraction, the prevalence of exposure in the population.
**Compute.** Attributable proportion among the exposed = (risk exposed − risk unexposed) ÷ risk
exposed × 100%. Population attributable fraction (Levin): p(RR − 1) ÷ (1 + p(RR − 1)).
**Output.** Both percentages, each named for the population it describes, with the risk ratio
beside them.
**Source.** Attributable proportion, read: Lesson 3 §6, the smoking example (0.57 and 0.07 per
1,000 per year → 87.7%). **Build gate:** Levin's formula for the population fraction was not
read in Levin 1953 or in a secondary source opened for this spec; ship the exposed-group
proportion first and add the population fraction when the formula has been read.
**Rule.** A risk ratio under 1 gives a negative attributable proportion; the tool says the
exposure is associated with lower risk and reports the preventive fraction (1 − RR) instead,
labeled as such.

### 5. `vaccine-effectiveness` — Vaccine Efficacy or Effectiveness From Attack Rates

**Input.** Cases and persons among the vaccinated; cases and persons among the unvaccinated.
**Compute.** VE = (ARU − ARV) ÷ ARU = 1 − RR. The interval comes from the risk-ratio interval in
`two-by-two-effect`: VE interval = 1 − (upper, lower) of RR.
**Output.** VE as a percentage with its interval, both attack rates, and the CDC sentence that
"efficacy" is the trial setting and "effectiveness" the field setting (the tool prints whichever
word the reader chose and never decides).
**Source, read.** Lesson 3 §6, the varicella example: 18 ÷ 152 = 11.8% vaccinated, 3 ÷ 7 = 42.9%
unvaccinated, RR 0.28, VE 72%.
**Rule.** With no unvaccinated cases the VE is undefined (division by zero); the tool says so.

### 6. `herd-immunity-threshold` — Herd Immunity Threshold From R0 and Coverage Needed

**Input.** Basic reproduction number R0; vaccine effectiveness (percent); optionally current
coverage.
**Compute.** Threshold H = 1 − 1/R0. Coverage needed with an imperfect vaccine = H ÷ VE. Gap =
needed − current.
**Output.** The threshold, the coverage needed, and the gap, each as a percentage, with the
assumption stated: a homogeneously mixing population and all-or-nothing vaccine protection.
**Build gate.** Fine 1993 (*Epidemiol Rev*) and its predecessors (Anderson and May) state these
relations; neither was opened. Read the threshold formula and the imperfect-vaccine correction
in Fine 1993 (or the open-access Fine, Eames and Heymann 2011, *Clin Infect Dis* 52:911) before
building, and cite the one read.
**Rule.** R0 ≤ 1 gives no threshold (the tool says the infection does not sustain itself); VE of
0 refuses the coverage division. R0 is reader input; the tool ships no R0 table.

### 7. `smr` — Standardized Mortality or Incidence Ratio (Observed Over Expected)

**Input.** Observed events; expected events (from the reader's indirect standardization or
registry); optionally the age-stratum table (stratum person-years and reference rates) from which
the tool computes the expected count itself.
**Compute.** SMR = observed ÷ expected. With strata: expected = Σ (reference rate × stratum
person-time). Interval: exact Poisson limits on the observed count divided by expected.
**Output.** The ratio, the expected count and how it was reached, and the interval once gated.
**Source.** The SMR as a ratio of observed to expected is the same arithmetic the NHSN SIR
describes (the SIR guide says the method is "similar to the method used to calculate the
Standardized Mortality Ratio"); Lesson 3 §3 gives the proportionate mortality ratio but not the
SMR interval. **Build gate on the interval:** read the exact Poisson limits in Breslow and Day
1987 or in an open paper (Ulm 1990, *Am J Epidemiol* 131:373) before shipping it.
**Shared code.** The same lib function as `nhsn-sir` in the infection-prevention change, so the
two cannot drift; the SIR tool adds the NHSN minimum-precision rule on top.

### 8. `direct-age-standardization` — Directly Age-Standardized Rate

**Input.** Age-stratum rows: stratum label, deaths (or cases), population; a standard population
per stratum (reader input, or a named versioned file such as the 2000 US standard population,
loaded under the spec-v1614 manifest rules with its vintage printed).
**Compute.** Stratum rate = events ÷ population; standardized rate = Σ (stratum rate × standard
weight) where weights are the standard population's stratum shares; printed per the multiplier.
**Output.** The crude rate, the standardized rate, each stratum's contribution, and the standard
population's name and vintage.
**Build gate.** Lesson 3 §4 (the CDC chapter on standardization) was not opened; read its
procedure and example before building. The 2000 US standard population file (NCHS) must be
fetched to disk and cited with its vintage, never typed.
**Rule.** Strata must match between the data and the standard; a mismatch is refused by name.

### 9. `daly` — DALYs From Deaths and Prevalent Cases (YLL + YLD)

**Input.** Deaths by age with the standard life expectancy at that age (reader input, or a
cited WHO standard life table file with its vintage); prevalent cases with a disability weight
per sequela (reader input; weights are the GBD's and are cited by the reader).
**Compute.** YLL = Σ deaths × standard life expectancy at age of death. YLD (prevalence-based)
= Σ prevalent cases × disability weight. DALY = YLL + YLD.
**Output.** The three figures, per 100,000 when a population is given, with every weight and
life expectancy echoed beside the row it applied to.
**Build gate.** The WHO methods paper (2000-2021 or the September 2026 2000-2023 edition) was not
opened; the structure above is from WHO's summary page. Read the YLL and YLD definitions
(including whether WHO applies age weighting or discounting, which it dropped after GBD 2010)
and cite the edition before building. Disability weights are **never shipped as a table**; the
reader supplies each one with its source.

### 10. `sample-size-proportion` — Sample Size for a Proportion or a Mean

**Input.** For a proportion: expected proportion p, absolute precision d, confidence level (90,
95, 99%). For a mean: standard deviation σ, precision d, confidence level. Optionally a finite
population size for the correction, and an expected non-response rate.
**Compute.** Proportion: n = z² p(1 − p) ÷ d². Mean: n = z² σ² ÷ d². Finite population: n' = n ÷
(1 + (n − 1)/N). Non-response: n ÷ (1 − r). Round up.
**Output.** n before and after each adjustment, with the z used (1.645, 1.960, 2.576).
**Build gate.** Lwanga and Lemeshow 1991 (WHO) gives these with tables; not opened. Read the
formulas and one of the manual's worked examples for the test before building.
**Rule.** p of exactly 0 or 1 is refused; with p unknown the page says 0.5 is the maximum and
lets the reader choose it.

### 11. `sample-size-two-groups` — Sample Size to Compare Two Proportions or Two Means

**Input.** Two proportions (or two means and a common σ), significance level α (two-sided),
power (80, 90%), allocation ratio.
**Compute.** Two proportions: n per group = [z_{1−α/2} √(2 p̄(1 − p̄)) + z_{1−β} √(p1(1 − p1) +
p2(1 − p2))]² ÷ (p1 − p2)². Two means: n = 2 σ² (z_{1−α/2} + z_{1−β})² ÷ (μ1 − μ2)². Unequal
allocation by the standard ratio adjustment.
**Output.** n per group and total, the z values used.
**Build gate.** Same manual; same rule as tool 10. The exact form of the two-proportion formula
differs between texts (pooled vs unpooled variance); ship the one the manual prints and name
it.

## Decisions

**D1 — the CDC textbook is the primary source for tools 1 to 5.** It is a US government work, in
the public domain, with worked examples; each example is a unit test.

**D2 — standard populations, life tables and disability weights are data, not constants.** They
are reader input or fetched, versioned files with their vintage on screen (spec-v141, spec-v1614).

**D3 — intervals come from one place.** Any risk-ratio interval reuses `two-by-two-effect`; any
observed-over-expected ratio reuses the `smr`/`nhsn-sir` function.

**D4 — multipliers are explicit.** Every rate names its "per N" and the N is a control, not a
hidden default, so an agent and a reader get the same figure.

## Risks

- **Unread formulas shipping.** Six build gates. The tasks file makes reading each a checkbox
  before the lib is written.
- **Rate vs proportion vs ratio.** The CDC text is careful; the pages must be too. Each result
  carries the one-word nature of the measure.
