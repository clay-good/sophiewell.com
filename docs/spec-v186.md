# spec-v186.md — Advanced specialty computations: radiotherapy BED/EQD2, echo PISA regurgitation, LV wall stress, corrected DLCO, exercise VO₂max/METs, and the proportion confidence interval (+6 tiles)

> Status: **SHIPPED (2026-07-01, +6 → 788; commit 9a29087).** Second post-audit spec (after
> [spec-v185](spec-v185.md), which corrected the withdrawn duplicative drafts).
> Every tile below was verified absent by a **direct scan of `app.js`** (zero
> id / name / keyword hits) — not the faulty keyword scan that produced the
> earlier duplicates. Adds **6** deterministic, free-to-reproduce **specialty
> computations** that fill genuine gaps in domains the catalog under-serves:
> radiation oncology, quantitative valve regurgitation, LV mechanics, diffusing
> capacity, exercise physiology, and evidence-based-medicine statistics.
>
> Catalog effect: **live `UTILITIES.length` + 6** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v186 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no dose, imaging, or exercise-prescription order
> in Sophie's voice**). **Every constant, α/β ratio, correction factor, and band
> is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing
> session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** and confirms
> all six ids are still absent before writing code.

## 1. Thesis

The catalog is broad, but a few advanced specialty computations remain genuinely
missing — the ones a radiation oncologist, an echocardiographer, a
cardiologist, a pulmonologist, an exercise physiologist, and a
clinical-epidemiologist reach for and cannot find here. v186 ships six: the
**linear-quadratic BED / EQD2** that lets radiotherapy fractionation schedules be
compared; the **PISA effective regurgitant orifice and regurgitant volume** that
quantify valve regurgitation; the **LV wall stress** that relates pressure, size,
and wall thickness; the **hemoglobin-corrected diffusing capacity (DLCO)**; the
**exercise VO₂max / METs** from a treadmill or field test; and the **Wilson-score
confidence interval for a proportion**. Each is a transparent formula —
auditable, unit-tested at its boundaries — and each is decision support, **never
an order**.

## 2. What v186 adds (6 tiles)

### 2.1 `bed-eqd2` — Radiotherapy Biologically Effective Dose (BED) & EQD2

- **Citation:** Fowler JF. The linear-quadratic formula and progress in
  fractionated radiotherapy. *Br J Radiol.* 1989;62(740):679-694.
- **citationUrl:** https://doi.org/10.1259/0007-1285-62-740-679
- **Group:** E (clinical math). **Specialties:** `oncology`, `medical-physics`,
  `radiology`.
- **Inputs:** the number of fractions, the dose per fraction (Gy), and the tissue
  **α/β ratio** (default 10 for early-responding tumor, 3 for late-responding
  normal tissue). Computes **BED = n·d·(1 + d/(α/β))** and **EQD2 = BED /
  (1 + 2/(α/β))** — the dose in 2 Gy-equivalent fractions.
- **Output:** the **BED (Gy)** and **EQD2 (Gy)** for the chosen α/β, naming the
  total physical dose and the fractionation, so two schedules can be compared on
  an equal-effect basis. Class A. Cross-links the oncology dosing tiles.

### 2.2 `pisa-eroa` — Effective Regurgitant Orifice & Regurgitant Volume (PISA)

- **Citation:** Zoghbi WA, Adams D, Bonow RO, et al. Recommendations for
  noninvasive evaluation of native valvular regurgitation (ASE). *J Am Soc
  Echocardiogr.* 2017;30(4):303-371.
- **citationUrl:** https://doi.org/10.1016/j.echo.2017.01.007
- **Group:** E. **Specialties:** `echocardiography`, `cardiology`.
- **Inputs:** the PISA radius (cm), the aliasing velocity (cm/s), the peak
  regurgitant jet velocity (cm/s), and the regurgitant-jet VTI (cm). Computes the
  **flow rate = 2π·r²·Va**, **EROA = flow rate / peak Vreg**, and **regurgitant
  volume = EROA × VTIreg**.
- **Output:** the **EROA (cm²)** and **regurgitant volume (mL)** banded against the
  ASE severity strata (e.g., mitral regurgitation severe EROA ≥ 0.40 cm² *(verify
  strata at implementation, [spec-v97](spec-v97.md))*), naming the PISA flow. Class
  A. Cross-links the echo hemodynamics tiles and `lvot-stroke-volume`
  ([spec-v185](spec-v185.md)).

### 2.3 `lv-wall-stress` — Left-Ventricular Wall Stress

- **Citation:** Grossman W, Jones D, McLaurin LP. Wall stress and patterns of
  hypertrophy in the human left ventricle. *J Clin Invest.* 1975;56(1):56-64.
- **citationUrl:** https://doi.org/10.1172/JCI108079
- **Group:** E. **Specialties:** `cardiology`, `echocardiography`,
  `critical-care`.
- **Inputs:** the LV pressure (systolic BP or end-systolic pressure, mmHg), the LV
  internal radius or cavity dimension (cm), and the wall thickness (cm). Computes
  the **meridional wall stress ≈ (P · r) / (2 · h)** with the standard
  1.36 mmHg→g/cm² conversion *(exact form and end-systolic vs peak convention
  verified at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **wall stress (10³ dyn/cm² or g/cm²)**, naming the inputs and
  relating it to afterload / hypertrophy pattern. Class A. Cross-links the echo LV
  tiles (`lv-mass-index`, `teichholz-lvef`).

### 2.4 `dlco-correction` — Hemoglobin-Corrected DLCO & KCO

- **Citation:** Macintyre N, Crapo RO, Viegi G, et al. Standardisation of the
  single-breath determination of carbon monoxide uptake in the lung (ATS/ERS).
  *Eur Respir J.* 2005;26(4):720-735. Hemoglobin correction: Cotes JE, et al.
- **citationUrl:** https://doi.org/10.1183/09031936.05.00034905
- **Group:** E. **Specialties:** `pulmonology`, `respiratory-therapy`.
- **Inputs:** the measured DLCO, the patient hemoglobin, the alveolar volume VA
  (for KCO = DLCO/VA), and sex (the Hb correction constant differs). Computes the
  **hemoglobin-corrected DLCO** by the Cotes equation and the **KCO (DLCO/VA)
  transfer coefficient** *(verify the correction constants at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **Hb-corrected DLCO** and **KCO**, naming the correction applied
  (anemia falsely lowers, polycythemia falsely raises the uncorrected value).
  Class A. Cross-links `predicted-spirometry` and the pulmonary tiles.

### 2.5 `vo2max-exercise` — Estimated VO₂max & METs (treadmill / field test)

- **Citation:** Bruce RA, Kusumi F, Hosmer D. Maximal oxygen intake and nomographic
  assessment of functional aerobic impairment in cardiovascular disease. *Am Heart
  J.* 1973;85(4):546-562. Field-test form: Cooper KH. A means of assessing maximal
  oxygen intake. *JAMA.* 1968;203(3):201-204.
- **citationUrl:** https://doi.org/10.1016/0002-8703(73)90502-4
- **Group:** E. **Specialties:** `sports-medicine`, `cardiology`,
  `physical-therapy`.
- **Inputs:** the estimation method — treadmill time on a named protocol (Bruce),
  a 12-minute / 1.5-mile field test (Cooper), or a non-exercise estimate — plus the
  method's variables (time, distance, age, sex). Computes the **estimated VO₂max
  (mL/kg/min)** and the equivalent **METs** (VO₂max / 3.5) *(protocol coefficients
  verified at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **VO₂max** and **METs**, naming the method, banded against
  age/sex fitness norms as context. Class A. Cross-links `duke-treadmill` and the
  exercise tiles.

### 2.6 `proportion-ci` — Confidence Interval for a Proportion (Wilson score)

- **Citation:** Wilson EB. Probable inference, the law of succession, and
  statistical inference. *J Am Stat Assoc.* 1927;22(158):209-212.
- **citationUrl:** https://doi.org/10.1080/01621459.1927.10502667
- **Group:** E. **Specialties:** `clinical-epidemiology`.
- **Inputs:** the number of events, the sample size, and the confidence level
  (default 95%). Computes the **point proportion** and the **Wilson-score interval**
  (the interval that stays within [0, 1] and behaves well for small samples or
  proportions near 0/1, unlike the naive Wald interval), and reports the Wald
  interval alongside for teaching.
- **Output:** the **proportion and its Wilson 95% CI**, naming the z-value used and
  the events/n, framed as a statistical estimate for sensitivity / specificity /
  event-rate reporting. Class A. Cross-links `diagnostic-2x2` and `nnt-arr`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  BED/EQD2 guard n > 0, d > 0, and (α/β) > 0; PISA guards the peak Vreg > 0 divisor;
  `lv-wall-stress` guards h > 0; `dlco-correction` guards Hb > 0 and VA > 0;
  `vo2max-exercise` clamps its protocol inputs to valid ranges; `proportion-ci`
  guards 0 ≤ events ≤ n, n > 0, and the square-root domain of the Wilson formula.
  Outside these, each tile renders a complete-the-fields fallback, never a
  `NaN`/`Infinity`.
- **`proportion-ci` clamps the Wilson interval to [0, 1]** and never emits a bound
  outside the unit interval — the [spec-v59](spec-v59.md) output-safety contract on
  a formula with a root.
- **All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the divisor, radicand, and α/β edges.
- **These compute and estimate; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a radiotherapy dose, a
  valve-intervention decision, or an exercise prescription in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all six are **Class A** — fixed physiologic /
  physics / statistical formulas, each cited by journal + authors. The ASE
  reference on `pisa-eroa` and the ATS/ERS reference on `dlco-correction` name
  societies; the implementing session confirms whether either trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md); the
  [spec-v158](spec-v158.md) echo tiles are the precedent that ASE did not) at build
  time and adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the six computes live in a new
  `lib/specialtymath-v186.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v186.js`; its `RV186` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) using the **live `UTILITIES.length` + 6**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): `oncology`, `medical-physics`,
  `radiology`, `echocardiography`, `cardiology`, `critical-care`, `pulmonology`,
  `respiratory-therapy`, `sports-medicine`, `physical-therapy`,
  `clinical-epidemiology` — all already in the vocabulary.
- **MCP eligibility:** once shipped, `lib/specialtymath-v186.js` is a clean future
  [spec-v183](spec-v183.md) MCP-wave candidate (flat numeric/enum inputs,
  round-tripping `META.example`, no DOM coupling).

## 5. Files touched

```
docs/spec-v186.md                        (this file)
app.js                                   (+6 UTILITIES rows; import group-v186 RV186 into RENDERERS)
lib/specialtymath-v186.js                (new: bedEqd2, pisaEroa, lvWallStress, dlcoCorrection, vo2maxExercise, proportionCi)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to lvot-stroke-volume, lv-mass-index, predicted-spirometry, duke-treadmill, diagnostic-2x2)
views/group-v186.js                      (new renderer module: 6 renderers)
docs/clinical-citations.md               (+6 rows)
test/unit/bed-eqd2.test.js, pisa-eroa.test.js, lv-wall-stress.test.js, dlco-correction.test.js, vo2max-exercise.test.js, proportion-ci.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/specialtymath-v186.js to MODULES)
docs/audits/v12/*.md                     (6 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+6; record the v186 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+6; spec-progression line)
```

## 6. Acceptance criteria

v186 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent (as this spec verified at draft by
  direct `app.js` scan).
- All 6 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **BED/EQD2
  comparing two fractionation schedules at α/β = 3 and 10**, a **PISA EROA crossing
  a severity threshold**, an **LV wall stress worked example**, a **DLCO with the
  anemia correction changing the value**, a **VO₂max from a Bruce treadmill time
  and a Cooper field test**, and a **proportion CI where the Wilson interval stays
  within [0, 1] near a boundary**.
- Every compute is finite/positive-guarded (including the Wilson square-root domain
  and the [0, 1] clamp), routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 6** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v186 with the +6 delta.

## 7. Out of scope for v186

- **No radiotherapy plan or dose prescription** — `bed-eqd2` compares schedules on
  an equal-effect basis; the plan stays with the radiation oncologist and physicist
  ([spec-v11](spec-v11.md) §5.3).
- **No valve-intervention decision** — `pisa-eroa` quantifies regurgitation
  severity; the intervention decision stays with the heart team.
- **No exercise prescription** — `vo2max-exercise` estimates capacity; the training
  or cardiac-rehab prescription stays with the clinician.
- **No copyrighted cognitive instruments** — MMSE and MoCA are excluded under the
  [spec-v100](spec-v100.md) §8 free-reproducibility bar (as PACSLAC and the Rockwood
  CFS were); they are not shipped here.
