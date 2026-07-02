# spec-v194.md — Right-heart & echocardiographic hemodynamics: the pulmonary artery pulsatility index, the transpulmonary / diastolic pressure gradient, the Tei myocardial performance index, and the pulmonary shunt fraction (+4 tiles)

> Status: **PROPOSED (2026-07-01).** Feature spec of the **Advanced Specialist
> Quantitation** program ([spec-v193](spec-v193.md) §1.1). Adds **4** deterministic
> invasive- and echocardiographic-hemodynamics instruments. **Each tile was verified
> absent by a direct scan of `app.js`** (zero id / name / keyword hits): the catalog
> carries `hemodynamic-suite` (cardiac index, stroke volume, **SVR and PVR in Wood
> units** already), `cardiac-power-output`, `fick-cardiac-output`, `qp-qs`,
> `cao2-do2`, `map`, and the echo indices (`teichholz-lvef`, `lvot-stroke-volume`,
> `rvsp-pasp`, `mitral-e-e-prime`), but **not** the pulmonary artery pulsatility
> index, the transpulmonary / diastolic pressure gradient, the Tei myocardial
> performance index, or the pulmonary shunt fraction (Qs/Qt).
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v194 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no support-device, listing, or management order in
> Sophie's voice**). **Every formula, coefficient, and reference range is re-fetched
> and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain thresholds carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The intensivist and the advanced-heart-failure / pulmonary-hypertension clinician
compute a handful of derived quantities off a right-heart catheter and an echo that
the catalog does not yet carry. The `hemodynamic-suite` already returns cardiac
index, SVR, and PVR; v194 completes the invasive-and-echo set with **four** distinct,
freely-reproducible quantities that sit beside it: the RV-afterload-coupling index
(PAPi), the two pulmonary pressure gradients that classify post-capillary pulmonary
hypertension (TPG / DPG), the combined systolic-diastolic myocardial performance
index (Tei), and the gas-exchange shunt fraction (Qs/Qt). Each is a transparent
formula a clinician acts on, and each is decision support — **never a support-device,
listing, or management order**.

## 2. What v194 adds (4 tiles)

### 2.1 `papi` — Pulmonary Artery Pulsatility Index

- **Citation:** Korabathina R, Heffernan KS, Paruchuri V, et al. The pulmonary artery
  pulsatility index identifies severe right ventricular dysfunction in acute inferior
  myocardial infarction. *Catheter Cardiovasc Interv.* 2012;80(4):593-600. Review:
  Lim HS, Gustafsson F. Pulmonary artery pulsatility index. *Eur J Heart Fail.*
  2020;22(1):32-38.
- **citationUrl:** https://doi.org/10.1002/ccd.23309
- **Group:** E (clinical math). **Specialties:** `cardiology`, `critical-care`,
  `echocardiography`.
- **Inputs:** pulmonary artery systolic pressure (PASP), pulmonary artery diastolic
  pressure (PADP), and right atrial pressure (RAP). Computes
  **PAPi = (PASP − PADP) / RAP**.
- **Output:** the **PAPi value** with the population-dependent interpretation the tile
  states explicitly — **PAPi < 1.0** flags severe RV dysfunction in acute RV/inferior
  MI and post-LVAD RV failure; **< 1.85** flags RV dysfunction in advanced heart
  failure *(the threshold is context-specific; verify at implementation,
  [spec-v97](spec-v97.md))*. Guards RAP > 0 before the division. Class A. Cross-links
  `hemodynamic-suite`, `rvsp-pasp`, `cardiac-power-output`.

### 2.2 `transpulmonary-gradient` — Transpulmonary & Diastolic Pressure Gradient

- **Citation:** Naeije R, Vachiery JL, Yerly P, Vanderpool R. The transpulmonary
  pressure gradient for the diagnosis of pulmonary vascular disease. *Eur Respir J.*
  2013;41(1):217-223.
- **citationUrl:** https://doi.org/10.1183/09031936.00074312
- **Group:** E. **Specialties:** `cardiology`, `critical-care`, `pulmonology`.
- **Inputs:** mean pulmonary artery pressure (mPAP), pulmonary artery diastolic
  pressure (PADP), and mean pulmonary capillary wedge pressure (PCWP). Computes
  **TPG = mPAP − PCWP** and **DPG = PADP − PCWP**.
- **Output:** the **TPG and DPG** with the classification the guideline attaches —
  TPG > 12 mmHg historically flags a pulmonary-vascular component; in post-capillary
  pulmonary hypertension (PCWP > 15), **DPG ≥ 7 mmHg** distinguishes combined pre-/
  post-capillary from isolated post-capillary PH *(verify the cut-points at
  implementation, [spec-v97](spec-v97.md))* — naming both gradients. Class A.
  Cross-links `hemodynamic-suite`, `rvsp-pasp`.

### 2.3 `tei-index` — Tei Myocardial Performance Index (MPI)

- **Citation:** Tei C, Ling LH, Hodge DO, et al. New index of combined systolic and
  diastolic myocardial performance: a simple and reproducible measure of cardiac
  function — a study in normals and dilated cardiomyopathy. *J Cardiol.*
  1995;26(6):357-366.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/8558414/
- **Group:** E. **Specialties:** `cardiology`, `echocardiography`.
- **Inputs:** the Doppler intervals — isovolumic contraction time (IVCT), isovolumic
  relaxation time (IVRT), and ejection time (ET); equivalently the (a − b) and b
  intervals. Computes **MPI = (IVCT + IVRT) / ET = (a − b) / b**.
- **Output:** the **Tei index** with the reference bands the source gives (LV normal
  ~0.39 ± 0.05, RV normal ~0.28 ± 0.04; higher = worse combined function; > 1.14
  flags poor prognosis in severe LV dysfunction *(verify at implementation,
  [spec-v97](spec-v97.md))*), naming the intervals. Guards ET > 0 before the
  division. Class A. Cross-links `teichholz-lvef`, `mitral-e-e-prime`.

### 2.4 `shunt-fraction` — Pulmonary Shunt Fraction (Qs/Qt, Berggren)

- **Citation:** Berggren SM. The oxygen deficit of arterial blood caused by
  non-ventilating parts of the lung. *Acta Physiol Scand.* 1942;4(Suppl 11):1-92.
  Restated in Nunn's *Applied Respiratory Physiology* (Lumb AB, ed.).
- **citationUrl:** https://doi.org/10.1111/j.1748-1716.1942.tb00363.x
- **Group:** E. **Specialties:** `critical-care`, `pulmonology`, `anesthesiology`.
- **Inputs:** hemoglobin, end-capillary / alveolar oxygen tension (for CcO₂), arterial
  SaO₂ and PaO₂ (CaO₂), and mixed-venous SvO₂ and PvO₂ (CvO₂). Computes the oxygen
  contents (CaO₂ = 1.34 × Hb × SaO₂ + 0.0031 × PaO₂, and analogously for CcO₂/CvO₂)
  and **Qs/Qt = (CcO₂ − CaO₂) / (CcO₂ − CvO₂)**.
- **Output:** the **shunt fraction (%)** with the reference band (normal ~4–10%;
  rising with true shunt), naming the contents used. Guards the (CcO₂ − CvO₂)
  denominator > 0. Class A. Cross-links `cao2-do2`, `aa-gradient`, `pf-ratio`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `papi` guards
  RAP > 0, `tei-index` guards ET > 0, `shunt-fraction` guards its content-difference
  denominator > 0, and `transpulmonary-gradient` is a bounded subtraction; outside the
  valid domain each renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **Each tile reports which threshold/band applies and states its population
  dependence** — `papi` names the acute-MI vs advanced-HF cut-points; `transpulmonary-
  gradient` names the PCWP > 15 precondition for the DPG classification — so a value is
  never read without its context ([spec-v59](spec-v59.md)).
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed explicitly at the zero-denominator edges (RAP → 0,
  ET → 0, CcO₂ − CvO₂ → 0).
- **These quantify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a support-device, listing, or
  management order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed physiologic
  formulas with published reference ranges, each cited by journal + authors. `Eur
  Respir J` / `Eur J Heart Fail` are journal issuers; the implementing session
  confirms whether any citation trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/hemo-v194.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v194.js`; its `RV194` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length`
  + 4**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. ASCII unit tokens (mmHg, %) accompany any
  Unicode-superscript notation so the example-correctness gate matches
  ([spec-v183](spec-v183.md) cardio-v90 precedent).
- **Specialties** are drawn from the closed vocabulary: `cardiology`, `critical-care`,
  `echocardiography`, `pulmonology`, `anesthesiology` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v194.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v194 RV194 into RENDERERS)
lib/hemo-v194.js                         (new: papi, pressureGradients, teiIndex, shuntFraction)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to hemodynamic-suite, rvsp-pasp, cao2-do2)
views/group-v194.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/papi.test.js, transpulmonary-gradient.test.js, tei-index.test.js, shunt-fraction.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hemo-v194.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+4; record the v194 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v194 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent (as verified at draft).
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **PAPi below
  the RV-failure threshold**, a **TPG/DPG pair with the DPG ≥ 7 classification**, a
  **Tei index above and below the normal band**, and a **shunt fraction with entered
  blood-gas contents**.
- Every compute is finite-guarded at its zero-denominator edge, routes through
  `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v194 with the +4 delta.

## 7. Out of scope for v194

- **No duplication of `hemodynamic-suite`** — cardiac index, SVR, and PVR (Wood units)
  are already carried; v194 adds only the four quantities the suite does not compute.
- **No support-device / listing / management order** — the tiles quantify
  physiology; the MCS, transplant-listing, and PH-therapy decisions stay with the
  clinician ([spec-v11](spec-v11.md) §5.3).
- **No device-derived measurement** — every tile consumes entered catheter / echo /
  blood-gas values; it does not read a waveform or measure a Doppler interval.
