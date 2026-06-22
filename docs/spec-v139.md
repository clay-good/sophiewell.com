# spec-v139.md — Gynecology: Flamm VBAC, ROMA, RMI, IOTA Simple Rules, Rotterdam PCOS, and POP-Q staging (+6 tiles)

> Status: **SHIPPED 2026-06-22.** Second feature spec of **Wave 7** of the
> [spec-v100](spec-v100.md) MDCalc Parity Completion program. Adds **6**
> deterministic gynecology decision rules that fill confirmed gaps. None
> duplicates a live tile.
>
> Catalog effect at v139 close: **620 + 6 = 626 tiles** live (the spec was drafted
> against a projected 619 baseline; the live catalog stood at 620 when v139
> shipped, so the per-spec delta of +6 lands the catalog at 626, per the
> live-count + delta convention).
>
> Every prior spec (v4 through v138) remains in force. v139 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has no general gynecology decision-rule cluster, yet six standard
gynecologic instruments — used in the labor unit, the gyn-onc clinic, the
reproductive-endocrine clinic, and the urogynecology exam room — are absent:

- **VBAC counseling has no free success predictor** — the paywalled Grobman MFMU
  model is excluded ([spec-v100](spec-v100.md) §8); the **free Flamm VBAC score**
  is the substitute and is reachable nowhere.
- **Adnexal-mass triage has no malignancy index** — ROMA (HE4 + CA-125) and the
  RMI family (ultrasound × menopause × CA-125) are absent.
- **Adnexal-mass ultrasound has no descriptor rule** — IOTA Simple Rules, the free
  benign/malignant/inconclusive classifier, is the substitute for the excluded
  IOTA ADNEX model ([spec-v100](spec-v100.md) §8).
- **PCOS diagnosis has no criteria tile** — the Rotterdam two-of-three rule is
  absent.
- **Pelvic-organ-prolapse exams have no stager** — POP-Q stage 0–IV from the nine
  measured points is reachable nowhere.

Each is a published, deterministic instrument a clinician already uses; v139
continues Wave 7.

## 2. What v139 adds (6 tiles)

### 2.1 `flamm-vbac` — Flamm VBAC Score

- **Citation:** Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an
  admission scoring system. *Obstet Gynecol.* 1997;90(6):907-910.
- **citationUrl:** https://doi.org/10.1016/S0029-7844(97)00531-0
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics`, `obstetrics-gynecology`, `maternal-fetal-medicine`,
  `nursing-ld`.
- **Inputs:** the five admission factors — maternal age < 40, prior vaginal birth
  (and its timing relative to the cesarean), reason for prior cesarean not being
  failure to progress, cervical effacement, and cervical dilation.
- **Output:** the **Flamm admission score (0–10)** with the **predicted VBAC-
  success likelihood** band per the source. Class A. **Substitute note:** the free
  Flamm score replaces the excluded paywalled Grobman MFMU calculator
  ([spec-v100](spec-v100.md) §8). Cross-links `bishop`.

### 2.2 `roma-ovarian` — Risk of Ovarian Malignancy Algorithm (ROMA)

- **Citation:** Moore RG, McMeekin DS, Brown AK, et al. A novel multiple marker
  bioassay utilizing HE4 and CA125 to predict epithelial ovarian cancer in
  patients with a pelvic mass. *Gynecol Oncol.* 2009;112(1):40-46.
- **citationUrl:** https://doi.org/10.1016/j.ygyno.2008.08.031
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `oncology`.
- **Inputs:** HE4, CA-125, and menopausal status.
- **Output:** the **predictive index** and the **ROMA probability (%)** with the
  pre/post-menopausal **high-risk cutoff** applied per the source. Class B (the
  ROMA cutoff is revisable / assay-platform-dependent →
  `docs/citation-staleness.md` row, on-publication cadence). Robustness: the
  logistic and its `ln` terms are domain-guarded.

### 2.3 `rmi-ovarian` — Risk of Malignancy Index (RMI I/II/III)

- **Citation:** Jacobs I, Oram D, Fairbanks J, Turner J, Frost C, Grudzinskas JG.
  A risk of malignancy index incorporating CA 125, ultrasound and menopausal
  status for the accurate preoperative diagnosis of ovarian cancer. *Br J Obstet
  Gynaecol.* 1990;97(10):922-929; with the RMI II/III variants (Tingulstad
  1996/1999).
- **citationUrl:** https://doi.org/10.1111/j.1471-0528.1990.tb02448.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `oncology`.
- **Inputs:** the ultrasound feature count, menopausal status, serum CA-125, and
  the RMI variant selected (I/II/III, which change the U and M scoring).
- **Output:** **RMI = U × M × CA-125** with the high-risk threshold framing per the
  selected variant. Class A.

### 2.4 `iota-simple-rules` — IOTA Simple Rules

- **Citation:** Timmerman D, Testa AC, Bourne T, et al. Simple ultrasound-based
  rules for the diagnosis of ovarian cancer. *Ultrasound Obstet Gynecol.*
  2008;31(6):681-690.
- **citationUrl:** https://doi.org/10.1002/uog.5365
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `oncology`, `maternal-fetal-medicine`.
- **Inputs:** the five **B (benign)** ultrasound features and the five **M
  (malignant)** ultrasound features, each as present/absent.
- **Output:** the IOTA Simple Rules verdict — **benign** (≥1 B, no M), **malignant**
  (≥1 M, no B), or **inconclusive** (both or neither) — naming the features
  counted. Class A. **Substitute note:** the free Simple Rules replaces the
  excluded IOTA ADNEX model ([spec-v100](spec-v100.md) §8).

### 2.5 `rotterdam-pcos` — Rotterdam PCOS Criteria

- **Citation:** Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group.
  Revised 2003 consensus on diagnostic criteria and long-term health risks related
  to polycystic ovary syndrome. *Hum Reprod.* 2004;19(1):41-47.
- **citationUrl:** https://doi.org/10.1093/humrep/deh098
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `endocrinology`.
- **Inputs:** the three Rotterdam features — oligo/anovulation, clinical or
  biochemical hyperandrogenism, and polycystic ovarian morphology — each
  present/absent, plus a confirmation that mimics have been excluded.
- **Output:** the **PCOS determination** — diagnosis met if **≥ 2 of 3 features**
  are present after exclusion of mimics — naming which features were counted and the
  phenotype. Class B (the ESHRE/ASRM Rotterdam criteria are revisable →
  `docs/citation-staleness.md` row, on-publication cadence).

### 2.6 `popq-staging` — POP-Q Staging

- **Citation:** Bump RC, Mattiasson A, Bø K, et al. The standardization of
  terminology of female pelvic organ prolapse and pelvic floor dysfunction. *Am J
  Obstet Gynecol.* 1996;175(1):10-17.
- **citationUrl:** https://doi.org/10.1016/S0002-9378(96)70243-0
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `obstetrics-gynecology`, `urology`.
- **Inputs:** the six prolapse points (Aa, Ba, C, D, Ap, Bp) plus the genital
  hiatus, perineal body, and total vaginal length measurements (cm).
- **Output:** the **POP-Q stage (0–IV)** derived from the leading edge relative to
  the hymen per the rule, naming the most-dependent point. Class A. **Specialty
  note:** the catalog vocab has no `urogynecology` term — `obstetrics-gynecology`
  is used (flagged).

## 3. Per-tile robustness

- **`roma-ovarian` is a logistic model** with `ln(HE4)` and `ln(CA-125)` terms; the
  coefficients are **re-fetched verbatim**, the `ln` domains are guarded for
  non-positive markers, and `1/(1+e^-x)` is overflow-clamped — never a probability
  from `NaN`.
- **`flamm-vbac`, `iota-simple-rules`, `rotterdam-pcos`, and `popq-staging` are
  criteria/threshold logic** with bounded sums or comparisons; they flow through
  the [spec-v59](spec-v59.md) fuzz harness and name which criteria/features were
  counted. `popq-staging` compares signed point values (cm above/below the hymen)
  to derive the leading edge.
- **`rmi-ovarian`** is a product; a non-positive CA-125 or an out-of-range feature
  count returns the complete-the-fields fallback.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `flamm-vbac`, `rmi-ovarian`, `iota-simple-rules`,
  and `popq-staging` are **Class A** (fixed derivation papers) — no
  `docs/citation-staleness.md` row; each citation names the journal and authors,
  not an issuing society, to avoid the `ISSUER_PATTERN` trip. `roma-ovarian` (assay
  cutoff) and `rotterdam-pcos` (ESHRE/ASRM consensus) are **Class B** — each gets a
  staleness row naming the edition in force, the `accessed` date, and an
  on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Build (§6.1):** `lib/gyn-v139.js` is the compute module
  (`flammVbac`, `romaOvarian`, `rmiOvarian`, `iotaSimpleRules`, `rotterdamPcos`,
  `popqStaging`); the renderer module is `views/group-v139.js` (six renderers,
  `RV139` added to the `app.js` `RENDERERS` spread).
- **Gates (§6.2):** `lib/gyn-v139.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the ROMA logistic explicitly fuzzed for
  overflow); each `META` example is pinned by the chromium `example-correctness`
  sweep; the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  mobile-no-hscroll, and 44px touch-target checks pass for `views/group-v139.js`.

## 5. Files touched

```
docs/spec-v139.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v139 renderers into RENDERERS)
lib/gyn-v139.js                          (new module: flammVbac, romaOvarian, rmiOvarian, iotaSimpleRules, rotterdamPcos, popqStaging)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to bishop, hadlock-efw)
views/group-v139.js                      (new renderer module: 6 renderers; incl. the IOTA B/M feature checklist + POP-Q nine-point input)
docs/citation-staleness.md               (+ rows: roma-ovarian cutoff, rotterdam-pcos ESHRE/ASRM)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/flamm-vbac.test.js, roma-ovarian.test.js, rmi-ovarian.test.js, iota-simple-rules.test.js, rotterdam-pcos.test.js, popq-staging.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/gyn-v139.js to MODULES)
docs/audits/v12/flamm-vbac.md, roma-ovarian.md, rmi-ovarian.md, iota-simple-rules.md, rotterdam-pcos.md, popq-staging.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 619 -> 625)
CHANGELOG.md                             (Unreleased: v139 entry, +6)
README.md, package.json                  (catalog count 619 -> 625; spec-progression line -> v139)
```

## 6. Acceptance criteria

v139 is fully shipped when:

- The implementing session has **re-run the [spec-v85](spec-v85.md) §6.2 collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a Flamm score → success band, a ROMA probability crossing the
  menopause-specific **high-risk cutoff**, an IOTA Simple Rules **inconclusive**
  case with both B and M features, a Rotterdam two-of-three **diagnosis-met** case,
  and a POP-Q **stage-II vs stage-III** leading-edge flip), a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `roma-ovarian` guards its `ln` terms and overflow-clamps its logistic; partial
  inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `roma-ovarian` and `rotterdam-pcos` carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **625** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v139 with the +6 catalog delta.

## 7. Out of scope for v139

- **No ultrasound image analysis** — `iota-simple-rules` and `rmi-ovarian` take the
  sonographer's read features, not the image.
- **No Grobman MFMU VBAC and no IOTA ADNEX** — excluded per
  [spec-v100](spec-v100.md) §8; `flamm-vbac` and `iota-simple-rules` are the free
  substitutes.
- **No auto-surgery, auto-referral, or auto-treatment order** — each tile reports
  the score/index/verdict and the source's stated interpretation; the management
  decision stays with the clinician and local protocol.
