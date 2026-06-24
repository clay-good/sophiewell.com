# spec-v158.md — Echocardiography quantification: LV mass index & geometry, LA volume index, Teichholz LVEF/FS, RVSP/PASP, and E/e′ (+5 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v157](spec-v157.md) **Subspecialty Depth** program. Adds **5**
> deterministic echocardiographic quantification computes that fill the program's
> headline gap — echocardiography has only `aortic-valve-area` in the live
> catalog despite being one of the most-performed studies in medicine. None
> duplicates a live tile.
>
> Catalog effect at v158 close: **live count + 5** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v157) remains in force. v158 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. All formulas, constants, and
> severity partitions are re-fetched and cross-verified against the **ASE/EACVI
> chamber-quantification guideline (Lang 2015)** plus ≥1 independent source at
> implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

The catalog has the *valve* continuity math (`aortic-valve-area`, which already
emits the dimensionless index) and the *hemodynamic* output math
(`hemodynamic-suite`, `cardiac-power-output`), but **none of the routine chamber,
filling-pressure, or right-heart quantification** a sonographer/cardiologist reports
on every study. The five below are the daily ASE-guideline computes — each a closed
formula over standard 2D/Doppler measurements with published severity partitions.

## 2. What v158 adds (5 tiles)

### 2.1 `lv-mass-index` — LV Mass (Devereux), LVMI & Geometry

- **Citation:** Devereux RB, Alonso DR, Lutas EM, et al. Echocardiographic
  assessment of left ventricular hypertrophy: comparison to necropsy findings. *Am
  J Cardiol.* 1986;57(6):450-458. Partitions: Lang RM, et al. *J Am Soc
  Echocardiogr.* 2015;28(1):1-39.
- **citationUrl:** https://doi.org/10.1016/0002-9149(86)90771-X (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `echocardiography`, `cardiology`.
- **Inputs:** LV internal diameter at end-diastole (LVIDd), posterior-wall
  thickness (PWTd), septal-wall thickness (IVSd) — all cm — plus BSA (cm² inputs or
  reuse `bw-bsa-suite`).
- **Output:** **LV mass = 0.8·{1.04·[(LVIDd+PWTd+IVSd)³ − LVIDd³]} + 0.6 g**;
  **LVMI = mass/BSA**; **relative wall thickness RWT = 2·PWTd/LVIDd**; the
  **geometry pattern** (normal / concentric remodeling / concentric hypertrophy /
  eccentric hypertrophy) from the sex-specific LVMI and RWT 0.42 cutoffs. Class A.

### 2.2 `la-volume-index` — Left Atrial Volume Index (LAVI)

- **Citation:** Lang RM, Badano LP, Mor-Avi V, et al. Recommendations for cardiac
  chamber quantification by echocardiography in adults. *J Am Soc Echocardiogr.*
  2015;28(1):1-39.
- **citationUrl:** https://doi.org/10.1016/j.echo.2014.10.003 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `echocardiography`, `cardiology`.
- **Inputs:** the biplane area-length inputs (A4C area, A2C area, LA length) **or**
  a directly-measured LA volume, plus BSA.
- **Output:** **LA volume = 0.85·(A1·A2)/L** (area-length) and **LAVI =
  volume/BSA**, with the guideline severity bands (normal ≤34, mild 35–41, moderate
  42–48, severe >48 mL/m²). Class A. Guards the area-length division (L > 0).

### 2.3 `teichholz-lvef` — Teichholz LVEF & Fractional Shortening

- **Citation:** Teichholz LE, Kreulen T, Herman MV, Gorlin R. Problems in
  echocardiographic volume determinations. *Am J Cardiol.* 1976;37(1):7-11.
- **citationUrl:** https://doi.org/10.1016/0002-9149(76)90491-4 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `echocardiography`, `cardiology`.
- **Inputs:** LV internal diameter at end-diastole (LVIDd) and end-systole (LVIDs),
  cm.
- **Output:** **fractional shortening FS = (LVIDd − LVIDs)/LVIDd**; Teichholz
  volumes **V = 7·D³/(2.4+D)** for EDV/ESV; **LVEF = (EDV − ESV)/EDV** with the
  guideline bands (≥52♂/54♀ normal, down to severely reduced <30). Class A.
  Renders the **explicit caveat** that Teichholz is dimension-derived and Simpson
  biplane is preferred when wall-motion is regional. Guards the (2.4+D) division.

### 2.4 `rvsp-pasp` — RV Systolic Pressure / PASP (TR jet)

- **Citation:** Yock PG, Popp RL. Noninvasive estimation of right ventricular
  systolic pressure by Doppler ultrasound in patients with tricuspid
  regurgitation. *Circulation.* 1984;70(4):657-662.
- **citationUrl:** https://doi.org/10.1161/01.CIR.70.4.657 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `echocardiography`, `cardiology`, `pulmonology`.
- **Inputs:** peak tricuspid-regurgitation jet velocity (TR Vmax, m/s) and the
  estimated right-atrial pressure (RAP from IVC size/collapse: 3, 8, or 15 mmHg).
- **Output:** **RVSP = 4·(TR Vmax)² + RAP** (= PASP absent pulmonic stenosis/RVOT
  obstruction), with the elevated-PASP framing. Class A. Cross-linked to
  `ivc-fluid-responsiveness` (the IVC→RAP step). Guards the square term.

### 2.5 `mitral-e-e-prime` — E/e′ (LV Filling-Pressure Estimate)

- **Citation:** Nagueh SF, Smiseth OA, Appleton CP, et al. Recommendations for the
  evaluation of left ventricular diastolic function by echocardiography. *J Am Soc
  Echocardiogr.* 2016;29(4):277-314.
- **citationUrl:** https://doi.org/10.1016/j.echo.2016.01.011 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `echocardiography`, `cardiology`.
- **Inputs:** mitral-inflow early-diastolic velocity (E, cm/s) and tissue-Doppler
  e′ (septal, lateral, or average, cm/s).
- **Output:** the **average E/e′ ratio** with the guideline interpretation (<8
  normal filling pressure, 9–14 indeterminate, **>14 elevated LV filling
  pressure**); names which e′ (septal/lateral/average) was used. Class A. Guards
  the division (e′ > 0). Cross-linked to `hfa-peff`/`h2fpef` (HFpEF probability).

## 3. Per-tile robustness

- All five are **closed-form arithmetic** over finite-checked numeric measurements
  using `lib/num.js`; every division (`la-volume-index` length, `teichholz-lvef`
  (2.4+D), `mitral-e-e-prime` e′) and the `rvsp-pasp` square are guarded — a
  blank/non-finite/zero-denominator input renders a surfaced `valid:false`
  complete-the-fields fallback rather than `NaN`/`Infinity`.
- **Sex-specific partitions** (LVMI normal limits, LVEF normal cutoffs) are
  unit-tested on both sexes; the **RWT 0.42** geometry split and the LVMI threshold
  combine into the four geometry patterns, each combination asserted to resolve to
  exactly one pattern.
- **Cubic and square sensitivity:** `lv-mass-index` cubes a sum of three cm
  measurements and `rvsp-pasp` squares a velocity — the [spec-v59](spec-v59.md)
  fuzz harness exercises large/edge values to confirm no overflow-to-`Infinity`
  leak.
- All five render the [spec-v50](spec-v50.md) §3 posture note (a computed value
  from the operator's measurements, image quality and load-dependence apply) and
  the Teichholz/Simpson and RVSP-not-PASP-in-obstruction caveats; none authors a
  management order ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** the formula tiles cited to journals/authors
  (Devereux, Teichholz, Yock) are **Class A**. The tiles whose **severity
  partitions** come from the **ASE/EACVI** guideline (`la-volume-index`,
  `mitral-e-e-prime`, and the LVMI/LVEF partitions) cite **ASE** — that society
  acronym **trips `ISSUER_PATTERN`** and forces **documentation-only
  `docs/citation-staleness.md` rows** (fixed 2015/2016 guideline values, not
  drifting — same treatment as the v138/v139 ACOG/ESHRE rows).
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/echo-v158.js` module (`lvMassIndex`, `laVolumeIndex`, `teichholzLvef`,
  `rvspPasp`, `mitralEePrime`), added to `fuzz-tools.test.js` `MODULES` (every
  guarded division/power exercised). Renderers live in the new
  `views/group-v158.js`; its `RV158` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v158.md                        (this file)
app.js                                   (+5 UTILITIES rows, group E; import group-v158 RV158 into RENDERERS)
lib/echo-v158.js                         (new module: lvMassIndex, laVolumeIndex, teichholzLvef, rvspPasp, mitralEePrime)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to aortic-valve-area, hemodynamic-suite, ivc-fluid-responsiveness, hfa-peff/h2fpef, lvh-criteria, bw-bsa-suite)
views/group-v158.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
docs/citation-staleness.md               (+ documentation-only rows for the ASE/EACVI-partition tiles)
test/unit/lv-mass-index.test.js, la-volume-index.test.js, teichholz-lvef.test.js, rvsp-pasp.test.js, mitral-e-e-prime.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/echo-v158.js to MODULES)
docs/audits/v12/lv-mass-index.md, la-volume-index.md, teichholz-lvef.md, rvsp-pasp.md, mitral-e-e-prime.md   (spec-v11 audit logs)
docs/scope-subspecialty-depth.md         (catalog ledger; advance the v157 running count)
CHANGELOG.md                             (Unreleased: v158 entry, +5)
README.md, package.json                  (catalog count + spec-progression line -> v158)
```

## 6. Acceptance criteria

v158 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all five ids are absent.
- All 5 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **LV
  mass + RWT 0.42 geometry-pattern flip**, a **LAVI 34/35 normal→mild boundary**, a
  **Teichholz EF with the Simpson caveat**, an **RVSP from TR 2.8 m/s + RAP 8**, and
  an **E/e′ 14/15 elevated-filling-pressure flip**), a [spec-v11](spec-v11.md) audit
  log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every division/power is guarded; the geometry-pattern map resolves every
  combination to one pattern; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks; sex-specific partitions exercised on both
  sexes.
- The ASE/EACVI-partition tiles carry their documentation-only
  `docs/citation-staleness.md` rows.
- `UTILITIES.length` is live count + 5 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v158 with the +5 delta.

## 7. Out of scope for v158

- **No image/DICOM ingestion or auto-measurement** — every input is the operator's
  measured value; v158 computes from those, it does not trace borders.
- **No Simpson biplane planimetry** — Teichholz (dimension-derived) is the closed
  formula shipped, with the explicit preference caveat; planimetric Simpson is not a
  closed compute.
- **No `aortic-valve-area` / dimensionless-index re-implementation** — those live in
  cardio-v90; v158 cross-links.
