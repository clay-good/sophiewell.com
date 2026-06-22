# spec-v140.md — Pediatric & neonatal severity: Kaiser EOS, SNAPPE-II, CRIB-II, RDAI/Tal, Clinical Dehydration Scale, and Koff bladder capacity (+6 tiles)

> Status: **SHIPPED (2026-06-22) — 5 of 6 tiles; `crib-ii` deferred.** Third
> feature spec of **Wave 7** of the [spec-v100](spec-v100.md) MDCalc Parity
> Completion program. Adds **5** deterministic pediatric and neonatal severity
> instruments that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v140 close: **live 626 + 5 = 631 tiles** (the live count was
> 626 after v139, not the 625 projected when this spec was drafted; the +5 delta
> holds).
>
> **`crib-ii` is DEFERRED.** Of the six tiles proposed below, only `crib-ii` did
> not ship. Its Parry 2003 score is a birth-weight × gestational-age × sex point
> matrix (~150 cells, sex selecting between a male and a female grid) plus
> temperature and base-excess bands. At implementation the temperature and
> base-excess bands cross-verified cleanly, but the BW×GA×sex matrix could be
> sourced from **only one** reproduction (sfar.org), and the primary Lancet
> table and that reproduction were both access-blocked (HTTP 403). Shipping ~150
> unverifiable cell values that drive a neonatal mortality estimate would violate
> the [spec-v97](spec-v97.md) "re-fetch and cross-verify across ≥ 2 independent
> sources" discipline, so `crib-ii` is parked alongside the other deferred ids
> (`gwtg-hf`, the ROKS stone-recurrence nomogram) until a second independent
> source for the matrix is in hand. The other five tiles are unaffected.
>
> Every prior spec (v4 through v139) remains in force. v140 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the pediatric early-warning and febrile-infant tools (`pews`,
the febrile-infant rules) and the neonatal jaundice tools (`bhutani-bilirubin`,
`neo-phototherapy`), but six standard pediatric/neonatal severity instruments are
absent:

- **Neonatal sepsis has no probability calculator** — the Kaiser EOS calculator,
  the posterior early-onset-sepsis probability that gates the newborn antibiotic
  decision, sits beside the febrile-infant rules and is reachable nowhere.
- **The NICU has no illness-severity score** — SNAPPE-II and CRIB-II, the
  validated neonatal mortality/severity models, are absent.
- **Bronchiolitis has no severity index** — the RDAI / Tal score that grades
  wheeze and retraction is absent.
- **Pediatric gastroenteritis has no dehydration scale** — the four-item Clinical
  Dehydration Scale is absent.
- **Pediatric urology has no expected-bladder-capacity tool** — the Koff age
  formula is reachable nowhere.

Each is a published, deterministic instrument a clinician already uses; v140
continues Wave 7.

## 2. What v140 adds (6 tiles)

### 2.1 `eos-calculator` — Neonatal Early-Onset Sepsis Calculator (Kaiser)

- **Citation:** Kuzniewicz MW, Puopolo KM, Fischer A, et al. A quantitative,
  risk-based approach to the management of neonatal early-onset sepsis. *JAMA
  Pediatr.* 2017;171(4):365-371; on the model of Kuzniewicz MW, et al. *Jt Comm J
  Qual Patient Saf.* 2016;42(5):232-239.
- **citationUrl:** https://doi.org/10.1001/jamapediatrics.2016.4678
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatrics`, `nursing-nursery`, `nursing-nicu`.
- **Inputs:** the maternal/prenatal predictors (gestational age, highest
  intrapartum temperature, ROM duration, GBS status, intrapartum antibiotic type
  and timing) and the newborn clinical-examination category (well-appearing /
  equivocal / clinical illness).
- **Output:** the **posterior EOS probability per 1,000 live births** via the
  published Bayesian logistic prior combined with the exam likelihood ratios,
  banded into the source's management categories. Class A (fixed published
  coefficients). **Near-neighbor:** the febrile-infant rules — cross-linked.
  Robustness: the logistic is overflow-clamped.

### 2.2 `snappe-ii` — SNAPPE-II

- **Citation:** Richardson DK, Corcoran JD, Escobar GJ, Lee SK. SNAP-II and
  SNAPPE-II: simplified newborn illness severity and mortality risk scores. *J
  Pediatr.* 2001;138(1):92-100.
- **citationUrl:** https://doi.org/10.1067/mpd.2001.109608
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `nursing-nicu`, `pediatrics`.
- **Inputs:** the SNAPPE-II variables — mean blood pressure, lowest temperature,
  PaO₂/FiO₂ ratio, lowest serum pH, seizures, urine output, plus the perinatal
  extension items (birth weight, small-for-gestational-age, low 5-minute Apgar).
- **Output:** the **SNAPPE-II point total (0–162)** with the mortality-risk
  framing per the source. Class A. Robustness: each physiologic variable is clamped
  to its SNAPPE-II band; the PaO₂/FiO₂ ratio guards a zero FiO₂.

### 2.3 `crib-ii` — CRIB-II

- **Citation:** Parry G, Tucker J, Tarnow-Mordi W; UK Neonatal Staffing Study
  Collaborative Group. CRIB II: an update of the clinical risk index for babies
  score. *Lancet.* 2003;361(9371):1789-1791.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(03)13397-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `nursing-nicu`, `pediatrics`.
- **Inputs:** birth weight, gestational age, sex, admission temperature, and base
  excess.
- **Output:** the **CRIB-II score** with the preterm-mortality-risk framing per the
  source. Class A. Robustness: each input maps to a banded point via compiled
  constants; partial inputs return the complete-the-fields fallback.

### 2.4 `rdai-tal` — RDAI / Tal Bronchiolitis Severity

- **Citation:** Lowell DI, Lister G, Von Koss H, McCarthy P. Wheezing in infants:
  the respiratory distress assessment instrument (RDAI). *Pediatrics.*
  1987;79(6):939-945; with the Tal respiratory score (Tal A, et al. *Pediatrics.*
  1983;71(1):13-18).
- **citationUrl:** https://doi.org/10.1542/peds.79.6.939
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `pediatric-emergency`, `nursing-peds`,
  `emergency-medicine`.
- **Inputs:** the RDAI wheeze (expiratory/inspiratory, distribution) and retraction
  (supraclavicular, intercostal, subcostal) sub-scores; the Tal score adds
  respiratory rate, wheeze, and cyanosis bands.
- **Output:** the **RDAI total** (and the Tal score where its inputs are entered)
  with the severity framing per the source, naming the components scored. Class A.

### 2.5 `clinical-dehydration-scale` — Clinical Dehydration Scale (CDS)

- **Citation:** Goldman RD, Friedman JN, Parkin PC. Validation of the clinical
  dehydration scale for children with acute gastroenteritis. *Pediatrics.*
  2008;122(3):545-549.
- **citationUrl:** https://doi.org/10.1542/peds.2007-3141
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `pediatric-emergency`, `nursing-peds`,
  `emergency-medicine`.
- **Inputs:** the four items — general appearance, eyes, mucous membranes, and
  tears — each scored 0–2.
- **Output:** the **CDS total (0–8)** with the **none / some / moderate-severe**
  dehydration bands per the source. Class A.

### 2.6 `koff-bladder-capacity` — Koff Expected Bladder Capacity

- **Citation:** Koff SA. Estimating bladder capacity in children. *Urology.*
  1983;21(3):248.
- **citationUrl:** https://doi.org/10.1016/0090-4295(83)90079-1
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `urology`, `pediatric-nephrology`,
  `nursing-peds`.
- **Inputs:** the child's age (years).
- **Output:** the **expected bladder capacity (mL) = (age + 2) × 30** per the Koff
  formula. Class A. Robustness: the formula guards a negative age and notes the
  age range over which it applies.

## 3. Per-tile robustness

- **`eos-calculator` is a logistic model.** The Kaiser prior coefficients and the
  exam likelihood ratios are **re-fetched verbatim** at implementation (per the v97
  "re-fetch, never recall" lesson), the logistic exponent is clamped to a finite
  range, and `1/(1+e^-x)` is overflow-safe — it returns a surfaced `valid:false`
  fallback rather than a probability from `NaN` when a required predictor is blank.
- **`snappe-ii` and `crib-ii` clamp each physiologic variable to its banded
  range**; `snappe-ii` guards the PaO₂/FiO₂ ratio against a zero FiO₂.
- **`rdai-tal` and `clinical-dehydration-scale` are bounded sums** that flow through
  the [spec-v59](spec-v59.md) fuzz harness and name the components scored.
- **`koff-bladder-capacity`** is a single linear formula with a negative-age guard.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six are **Class A** (fixed derivation papers
  / coefficients) — no `docs/citation-staleness.md` row; each citation names the
  journal and authors, not an issuing society, to avoid the `ISSUER_PATTERN` trip
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson — the Kaiser EOS, SNAPPE,
  CRIB, RDAI, CDS, and Koff citations name journals/authors, so no staleness row is
  needed).
- **Build (§6.1):** `lib/peds-v140.js` is the compute module
  (`eosCalculator`, `snappeII`, `cribII`, `rdaiTal`, `clinicalDehydrationScale`,
  `koffBladderCapacity`); the renderer module is `views/group-v140.js` (six
  renderers, `RV140` added to the `app.js` `RENDERERS` spread).
- **Gates (§6.2):** `lib/peds-v140.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the EOS logistic explicitly fuzzed for
  overflow); each `META` example is pinned by the chromium `example-correctness`
  sweep; the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  mobile-no-hscroll, and 44px touch-target checks pass for `views/group-v140.js`.
- **Data strategy (§5):** the CRIB-II / SNAPPE-II band tables and the Kaiser EOS
  coefficient block are **compiled constants the compute reads**, not a `data/`
  directory ([spec-v100](spec-v100.md) §5).

## 5. Files touched

```
docs/spec-v140.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups G/E; import group-v140 renderers into RENDERERS)
lib/peds-v140.js                         (new module: eosCalculator, snappeII, cribII, rdaiTal, clinicalDehydrationScale, koffBladderCapacity)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to pews, the febrile-infant rules, bhutani-bilirubin)
views/group-v140.js                      (new renderer module: 6 renderers; incl. the EOS predictor + exam-category input and the CDS four-item input)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/eos-calculator.test.js, snappe-ii.test.js, crib-ii.test.js, rdai-tal.test.js, clinical-dehydration-scale.test.js, koff-bladder-capacity.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/peds-v140.js to MODULES)
test/unit/specialty-coverage.test.js     (ALLOWED_SPECIALTIES: confirm pediatric-emergency/neonatology/nursing-nicu/nursing-nursery/pediatric-nephrology present; add any missing)
docs/audits/v12/eos-calculator.md, snappe-ii.md, crib-ii.md, rdai-tal.md, clinical-dehydration-scale.md, koff-bladder-capacity.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 625 -> 631)
CHANGELOG.md                             (Unreleased: v140 entry, +6)
README.md, package.json                  (catalog count 625 -> 631; spec-progression line -> v140)
```

## 6. Acceptance criteria

v140 is fully shipped when:

- The implementing session has **re-run the [spec-v85](spec-v85.md) §6.2 collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in their group with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including an **EOS probability** crossing a management band, a SNAPPE-II point
  total → mortality framing, a CRIB-II preterm case, an RDAI severity total, a CDS
  total flipping **some → moderate-severe**, and a Koff `(age+2)×30` value), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
  check.
- `eos-calculator` overflow-clamps its logistic; `snappe-ii` guards its PaO₂/FiO₂
  ratio; partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- Any new specialty tag is added to `test/unit/specialty-coverage.test.js`
  `ALLOWED_SPECIALTIES` (the closed vocab).
- `UTILITIES.length` is **631** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v140 with the +6 catalog delta.

## 7. Out of scope for v140

- **No EHR/maternal-record parsing** — `eos-calculator` takes the clinician's
  entered predictors and exam category, not a chart feed.
- **No Broselow tape** — excluded per [spec-v100](spec-v100.md) §8; the free APLS
  weight-estimation formula ships in [spec-v141](spec-v141.md) as the substitute.
- **No auto-antibiotic, auto-admission, or auto-fluid order** — each tile reports
  the probability/score/band and the source's stated interpretation; the
  management decision stays with the clinician and local protocol.
