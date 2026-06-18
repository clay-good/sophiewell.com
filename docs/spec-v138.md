# spec-v138.md — Obstetrics & MFM: Hadlock EFW, fullPIERS, miniPIERS, AFI, Barnhart minimal hCG rise, and IOM gestational weight gain (+6 tiles)

> Status: **PROPOSED (2026-06-17).** First feature spec of **Wave 7** of the
> [spec-v100](spec-v100.md) MDCalc Parity Completion program. Adds **6**
> deterministic obstetrics and maternal-fetal-medicine instruments that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v138 close: **613 + 6 = 619 tiles.**
>
> Every prior spec (v4 through v137) remains in force. v138 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the dating and induction-readiness obstetric tools (`due-date`,
`preg-dating`, `bishop`, `bpp`) but the six standard obstetric and MFM
instruments that a clinician reaches for on labor-and-delivery and in the MFM
clinic are absent:

- **There is no fetal-weight estimator** — `bpp` consumes a biophysical-profile
  finding, but the Hadlock EFW regression that turns measured BPD/HC/AC/FL
  biometry into an estimated fetal weight (the number that drives growth-
  restriction and macrosomia decisions) is reachable nowhere; it sits beside
  `bpp` and `preg-dating`.
- **Preeclampsia has no maternal-outcome model** — fullPIERS and miniPIERS, the
  validated predictors of adverse maternal outcome in preeclampsia, are absent.
- **There is no amniotic-fluid index** — `afi` sums the four-quadrant pockets and
  applies the oligohydramnios / polyhydramnios flags; it sits beside `bpp`.
- **Early-pregnancy viability has no hCG-rise rule** — the Barnhart minimal-rise
  threshold that distinguishes a potentially viable IUP from an abnormal
  pregnancy is reachable nowhere.
- **Prenatal counseling has no weight-gain target** — the IOM gestational-weight-
  gain ranges by pre-pregnancy BMI are absent.

Each is a published, deterministic instrument a clinician already uses; v138
opens Wave 7.

## 2. What v138 adds (6 tiles)

### 2.1 `hadlock-efw` — Hadlock Estimated Fetal Weight

- **Citation:** Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK.
  Estimation of fetal weight with the use of head, body, and femur
  measurements — a prospective study. *Am J Obstet Gynecol.* 1985;151(3):333-337.
- **citationUrl:** https://doi.org/10.1016/0002-9378(85)90298-4
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `obstetrics`, `maternal-fetal-medicine`, `obstetrics-gynecology`,
  `nursing-ld`.
- **Inputs:** the four biometry measurements — biparietal diameter (BPD), head
  circumference (HC), abdominal circumference (AC), femur length (FL), in cm; the
  tile uses the four-parameter Hadlock equation.
- **Output:** the **estimated fetal weight (g)** via the published log10
  polynomial, with the percentile framing left to the clinician. Class A (fixed
  1985 regression coefficients). **Near-neighbor:** `bpp`, `preg-dating` —
  cross-linked. Robustness: the log10 polynomial and its `10^x` back-transform are
  domain-guarded.

### 2.2 `fullpiers` — fullPIERS (Pre-eclampsia Integrated Estimate of RiSk)

- **Citation:** von Dadelszen P, Payne B, Li J, et al. Prediction of adverse
  maternal outcomes in pre-eclampsia: development and validation of the fullPIERS
  model. *Lancet.* 2011;377(9761):219-227.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(10)61351-7
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `maternal-fetal-medicine`, `obstetrics`, `obstetrics-gynecology`.
- **Inputs:** gestational age at assessment, chest pain/dyspnea, oxygen
  saturation, platelet count, creatinine, and AST — the fullPIERS predictors.
- **Output:** the **probability of an adverse maternal outcome within 48 h** via
  the published logistic model `1/(1+e^-x)`, banded per the source. Class A (fixed
  2011 coefficients). Robustness: the logistic exponent is overflow-clamped.

### 2.3 `minipiers` — miniPIERS (bedside-only model)

- **Citation:** Payne BA, Hutcheon JA, Ansermino JM, et al. A risk prediction
  model for the assessment and triage of women with hypertensive disorders of
  pregnancy in low-resourced settings: the miniPIERS (Pre-eclampsia Integrated
  Estimate of RiSk) multi-country prospective cohort study. *PLoS Med.*
  2014;11(1):e1001589.
- **citationUrl:** https://doi.org/10.1371/journal.pmed.1001589
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `maternal-fetal-medicine`, `obstetrics`, `obstetrics-gynecology`,
  `nursing-ob`.
- **Inputs:** the bedside-only miniPIERS predictors — parity, gestational age,
  headache/visual changes, chest pain/dyspnea, vaginal bleeding with abdominal
  pain, systolic blood pressure, and dipstick proteinuria.
- **Output:** the **probability of an adverse maternal outcome** via the published
  logistic model `1/(1+e^-x)`, banded per the source. Class A (fixed 2014
  coefficients). Cross-links `fullpiers` (the lab-using companion). Robustness:
  the logistic exponent is overflow-clamped.

### 2.4 `afi` — Amniotic Fluid Index

- **Citation:** Moore TR, Cayle JE. The amniotic fluid index in normal human
  pregnancy. *Am J Obstet Gynecol.* 1990;162(5):1168-1173.
- **citationUrl:** https://doi.org/10.1016/0002-9378(90)90009-V
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `obstetrics`, `maternal-fetal-medicine`, `obstetrics-gynecology`,
  `nursing-ld`.
- **Inputs:** the four-quadrant deepest vertical pocket measurements (cm).
- **Output:** the **total AFI (cm)** with the **oligohydramnios (< 5 cm)** and
  **polyhydramnios (> 24 cm)** flags applied per the ACOG thresholds. Class B (the
  ACOG oligo/poly thresholds are revisable → `docs/citation-staleness.md` row,
  on-publication cadence). **Near-neighbor:** `bpp` — cross-linked.

### 2.5 `barnhart-hcg` — Minimal hCG Rise (Barnhart)

- **Citation:** Barnhart KT, Sammel MD, Rinaudo PF, Zhou L, Hummel AC, Guo W.
  Symptomatic patients with an early viable intrauterine pregnancy: hCG curves
  redefined. *Obstet Gynecol.* 2004;104(1):50-55.
- **citationUrl:** https://doi.org/10.1097/01.AOG.0000128174.48843.12
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `obstetrics`, `obstetrics-gynecology`, `emergency-medicine`.
- **Inputs:** the initial serum hCG, the repeat serum hCG, and the interval
  (hours) between draws.
- **Output:** the **observed percent rise** versus the **minimal expected 48-h
  rise** for a potentially viable IUP, flagging a sub-minimal (abnormal) rise per
  the source. Class A. Robustness: the percent-change ratio guards a zero/negative
  initial value.

### 2.6 `iom-gwg` — IOM Gestational Weight Gain

- **Citation:** Institute of Medicine and National Research Council. *Weight Gain
  During Pregnancy: Reexamining the Guidelines.* Washington, DC: National
  Academies Press; 2009; carried in ACOG Committee Opinion 548.
- **citationUrl:** https://doi.org/10.17226/12584
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `obstetrics`, `obstetrics-gynecology`, `nutrition`,
  `nursing-ob`.
- **Inputs:** pre-pregnancy weight and height (→ BMI category), singleton vs twin,
  and current gestational age.
- **Output:** the **recommended total gain range** and the **weekly second/third-
  trimester rate** for the pre-pregnancy BMI category, with the patient's current
  gain compared if entered. Class B (the IOM ranges are revisable →
  `docs/citation-staleness.md` row, on-publication cadence).

## 3. Per-tile robustness

- **`hadlock-efw` is a log10 polynomial.** The four-parameter Hadlock coefficients
  are **re-fetched verbatim** at implementation (per the v97 "re-fetch, never
  recall" lesson), the polynomial domain is guarded for non-positive biometry, and
  the `10^x` back-transform is overflow-safe — it returns a surfaced `valid:false`
  fallback rather than `Infinity` for an out-of-domain entry.
- **`fullpiers` and `minipiers` are logistic models.** Each re-fetches its
  published coefficients verbatim, computes `x` from the predictor set, clamps `x`
  to a finite range, and returns `1/(1+e^-x)` with an overflow guard — never a
  probability from `NaN` when a required predictor is blank.
- **`afi` and `barnhart-hcg`** are bounded arithmetic; `afi` clamps each quadrant
  to a non-negative pocket and `barnhart-hcg` guards a zero/negative initial hCG.
- **`iom-gwg`** is a category lookup against compiled constants (BMI bands and gain
  ranges); a non-positive height/weight returns the complete-the-fields fallback.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `hadlock-efw`, `fullpiers`, `minipiers`, and
  `barnhart-hcg` are **Class A** (fixed derivation papers / coefficients) — no
  `docs/citation-staleness.md` row; each citation names the journal and authors,
  not an issuing society, to avoid the `ISSUER_PATTERN` trip. `afi` (ACOG
  oligo/poly thresholds) and `iom-gwg` (IOM / ACOG CO 548) are **Class B** — each
  gets a staleness row naming the edition in force, the `accessed` date, and an
  on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Build (§6.1):** `lib/ob-v138.js` is the compute module
  (`hadlockEfw`, `fullPiers`, `miniPiers`, `afi`, `barnhartHcg`, `iomGwg`); the
  renderer module is `views/group-v138.js` (six renderers, `RV138` added to the
  `app.js` `RENDERERS` spread — collision-free past the v85 program's `group-v25`).
- **Gates (§6.2):** `lib/ob-v138.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the two PIERS logistics and the Hadlock
  log10 explicitly fuzzed for overflow); each `META` example is pinned by the
  chromium `example-correctness` sweep; the catalog count moves on all **13
  catalog-truth surfaces**; a11y, mobile-no-hscroll, and 44px touch-target checks
  pass for `views/group-v138.js`.
- **Data strategy (§5):** the IOM BMI/gain ranges and the Hadlock/PIERS
  coefficient blocks are **compiled constants the compute reads**, not a `data/`
  directory ([spec-v100](spec-v100.md) §5).

## 5. Files touched

```
docs/spec-v138.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v138 renderers into RENDERERS)
lib/ob-v138.js                           (new module: hadlockEfw, fullPiers, miniPiers, afi, barnhartHcg, iomGwg)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to bpp, preg-dating, due-date)
views/group-v138.js                      (new renderer module: 6 renderers; incl. the AFI four-quadrant input + Hadlock biometry inputs)
docs/citation-staleness.md               (+ rows: afi ACOG oligo/poly thresholds, iom-gwg IOM/ACOG CO 548)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/hadlock-efw.test.js, fullpiers.test.js, minipiers.test.js, afi.test.js, barnhart-hcg.test.js, iom-gwg.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ob-v138.js to MODULES)
docs/audits/v12/hadlock-efw.md, fullpiers.md, minipiers.md, afi.md, barnhart-hcg.md, iom-gwg.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 613 -> 619; Wave 7 opens)
CHANGELOG.md                             (Unreleased: v138 entry, +6)
README.md, package.json                  (catalog count 613 -> 619; spec-progression line -> v138)
```

## 6. Acceptance criteria

v138 is fully shipped when:

- The implementing session has **re-run the [spec-v85](spec-v85.md) §6.2 collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in their group with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a Hadlock EFW from a known biometry set, a fullPIERS probability band,
  an `afi` total flagging **oligohydramnios at < 5 cm**, a Barnhart sub-minimal-
  rise flag, and an `iom-gwg` range for an obese-category BMI), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
  check.
- `hadlock-efw` guards its log10 polynomial and `10^x` back-transform; `fullpiers`
  and `minipiers` overflow-clamp their logistic exponents; partial inputs render a
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `afi` and `iom-gwg` carry `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **619** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v138 with the +6 catalog delta.

## 7. Out of scope for v138

- **No ultrasound image analysis** — `hadlock-efw` and `afi` take the measured
  biometry / pocket depths the sonographer reads off the image, not the image.
- **No Grobman MFMU VBAC** — paywalled coefficients, excluded per
  [spec-v100](spec-v100.md) §8; the free Flamm VBAC score ships in
  [spec-v139](spec-v139.md) as the substitute.
- **No QUiPP, sFlt-1/PlGF, or other assay-echo "calculators"** — excluded per
  [spec-v100](spec-v100.md) §8 (an assay readout is not a deterministic
  calculator).
- **No auto-delivery, auto-magnesium, or auto-induction order** — each tile reports
  the estimate/probability/range and the source's stated interpretation; the
  management decision stays with the clinician and local protocol.
