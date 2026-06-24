# spec-v165.md — Radiology classification & quantification: ACR TI-RADS, adrenal CT washout, Bosniak, and CT effective dose (+4 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v162](spec-v162.md) **Cross-Discipline Completion** program. Adds **4**
> deterministic radiology classification/quantification instruments that fill a
> confirmed gap — diagnostic radiology has **no** structured-reporting classifier
> in the live catalog. None duplicates a live tile.
>
> Catalog effect at v165 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v164) remains in force. v165 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Point tables and thresholds are re-fetched and
> cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Radiologists report dozens of structured classifications a day; the deterministic,
free ones are absent from the catalog. The four below are daily and computable: the
ACR thyroid-nodule TI-RADS (points → category → FNA-size rule), the CT adrenal-nodule
washout (the adenoma-vs-non-adenoma calculation), the Bosniak renal-cyst
classification, and the CT effective-dose estimate. (Descriptive lookups like
BI-RADS/PI-RADS are excluded per [spec-v162](spec-v162.md) §2.)

## 2. What v165 adds (4 tiles)

### 2.1 `acr-tirads` — ACR TI-RADS (Thyroid Nodule)

- **Citation:** Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid Imaging,
  Reporting and Data System (TI-RADS): white paper of the ACR TI-RADS committee. *J
  Am Coll Radiol.* 2017;14(5):587-595.
- **citationUrl:** https://doi.org/10.1016/j.jacr.2017.01.046 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `radiology`, `endocrinology`.
- **Inputs:** the five feature categories — composition (0–2), echogenicity (0–3),
  shape (0/3), margin (0/2/3), echogenic foci (additive 0–3) — plus the nodule
  maximum diameter (cm).
- **Output:** the **points total → TR level (TR1 0, TR2 2, TR3 3, TR4 4–6, TR5
  ≥7)** and the **FNA / follow-up size recommendation per level** (e.g. TR5 FNA
  ≥1.0 cm, follow ≥0.5 cm; TR3 FNA ≥2.5 cm). Class A — deterministic points→category
  mapping; the echogenic-foci additivity is handled. Cross-linked to
  `fleischner-2017` (the analogous lung-nodule follow-up rule).

### 2.2 `adrenal-ct-washout` — Adrenal CT Washout (adenoma vs non-adenoma)

- **Citation:** Caoili EM, Korobkin M, Francis IR, et al. Adrenal masses:
  characterization with combined unenhanced and delayed enhanced CT. *Radiology.*
  2002;222(3):629-633.
- **citationUrl:** https://doi.org/10.1148/radiol.2223010766 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `radiology`, `endocrinology`.
- **Inputs:** unenhanced (U), enhanced/portal-venous (E), and delayed (D) attenuation
  (HU); U is optional (RPW path).
- **Output:** **absolute washout APW = (E − D)/(E − U) × 100** (≥60% → lipid-poor
  adenoma) and **relative washout RPW = (E − D)/E × 100** (≥40% → adenoma), plus the
  unenhanced ≤10 HU lipid-rich-adenoma note. Class A. **Guards the (E−U) and E
  denominators** — equal enhanced/unenhanced values return a surfaced `valid:false`
  rather than dividing by zero.

### 2.3 `bosniak` — Bosniak Classification (renal cyst, 2019)

- **Citation:** Silverman SG, Pedrosa I, Ellis JH, et al. Bosniak classification of
  cystic renal masses, version 2019. *Radiology.* 2019;292(2):475-488.
- **citationUrl:** https://doi.org/10.1148/radiol.2019182646 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `radiology`, `urology`.
- **Inputs:** wall and septa characteristics (number, thickness, enhancement),
  calcification, and the presence/degree of enhancing soft tissue.
- **Output:** the **class I / II / IIF / III / IV** with the source's
  malignancy-likelihood and management framing (IIF follow-up; III/IV surgical
  consideration). Class A — deterministic input→class mapping; every feature
  combination resolves to one defined class. Cross-linked to `renal-nephrometry`.

### 2.4 `ct-effective-dose` — CT Effective Dose (DLP × k)

- **Citation:** AAPM Report 96 / ICRP Publication 103 conversion coefficients
  (effective dose = DLP × region-specific k factor).
- **citationUrl:** (AAPM Report 96 — verify table at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `radiology`, `medical-physics`.
- **Inputs:** the dose-length product (DLP, mGy·cm) and the body region (head, neck,
  chest, abdomen, pelvis) selecting the **k conversion factor** (mSv/mGy·cm).
- **Output:** **effective dose (mSv) = DLP × k**, with the region's k value named and
  a background-equivalent framing. Class A. The k-factor table is **re-fetched and
  cross-verified to ≥2 sources** (region values are the correctness-critical
  content); guards the multiplication.

## 3. Per-tile robustness

- **`acr-tirads` and `bosniak` are deterministic input→class mappings**; every
  combination resolves to exactly one defined category (no `undefined`/`NaN`). The
  **TI-RADS echogenic-foci additivity** and the **point→TR band cutoffs** (0,2,3,
  4–6,≥7) are unit-tested at the boundaries; the **size→FNA rule per level** is
  asserted.
- **`adrenal-ct-washout` and `ct-effective-dose` are guarded arithmetic** — the
  washout (E−U)/E denominators and the dose multiplication are finite-checked; a
  zero/non-finite denominator or blank input renders a surfaced `valid:false`
  fallback. The APW vs RPW selection (U present vs absent) is unit-tested.
- The [spec-v59](spec-v59.md) fuzz harness exercises the washout division edges and
  the classification combinatorics.
- All four render the [spec-v50](spec-v50.md) §3 posture note (the radiologist's
  feature read drives the class; dose estimates are population coefficients, not
  organ dosimetry) and author no management order ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** `adrenal-ct-washout` and `bosniak` cite journals
  (Caoili, Silverman) → **Class A**. **`acr-tirads`** cites **ACR** and
  **`ct-effective-dose`** cites **AAPM/ICRP** — those issuer acronyms **trip
  `ISSUER_PATTERN`** and force **documentation-only `docs/citation-staleness.md`
  rows** (fixed 2017 white paper / published conversion tables, not drifting — same
  treatment as the live KDIGO/ACOG society rows).
- **Specialty vocabulary:** adds **`radiology`** and **`medical-physics`** to
  `ALLOWED_SPECIALTIES` (see [spec-v162](spec-v162.md) §4).
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/radiology-v165.js` module (`acrTirads`, `adrenalCtWashout`, `bosniak`,
  `ctEffectiveDose`), added to `fuzz-tools.test.js` `MODULES`. Renderers live in the
  new `views/group-v165.js`; its `RV165` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v165.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups G/E; import group-v165 RV165 into RENDERERS)
lib/radiology-v165.js                    (new module: acrTirads, adrenalCtWashout, bosniak, ctEffectiveDose)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to fleischner-2017, renal-nephrometry, mehran-cin)
views/group-v165.js                      (new renderer module: 4 renderers)
test/unit/specialty-coverage.test.js     (add 'radiology', 'medical-physics' to ALLOWED_SPECIALTIES)
docs/clinical-citations.md               (+ rows for the four sources)
docs/citation-staleness.md               (+ documentation-only rows for acr-tirads [ACR] and ct-effective-dose [AAPM/ICRP])
test/unit/acr-tirads.test.js, adrenal-ct-washout.test.js, bosniak.test.js, ct-effective-dose.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/radiology-v165.js to MODULES)
docs/audits/v12/acr-tirads.md, adrenal-ct-washout.md, bosniak.md, ct-effective-dose.md   (spec-v11 audit logs)
docs/scope-cross-discipline.md           (catalog ledger; advance the v162 running count)
CHANGELOG.md                             (Unreleased: v165 entry, +4)
README.md, package.json                  (catalog count + spec-progression line -> v165)
```

## 6. Acceptance criteria

v165 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  **TI-RADS points → TR4/TR5 boundary with the size→FNA rule**, an **adrenal APW
  ≥60% adenoma case and an RPW-only path**, a **Bosniak IIF→III transition**, and a
  **CT effective dose = DLP × k for a named region**), a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- The classification tiles resolve every combination to one defined class; the
  washout/dose denominators are guarded; blank inputs render a complete-the-fields
  fallback.
- `radiology`/`medical-physics` are in `ALLOWED_SPECIALTIES` and
  `specialty-coverage.test.js` passes; the ACR/AAPM tiles carry their
  documentation-only `docs/citation-staleness.md` rows.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 4 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v165 with the +4 delta.

## 7. Out of scope for v165

- **No BI-RADS / PI-RADS / LI-RADS** — those are descriptive assessment categories
  or largely narrative algorithms, not closed computes ([spec-v162](spec-v162.md)
  §2).
- **No image ingestion** — every input is the radiologist's measured/observed
  feature; v165 computes from those.
- **No organ dosimetry** — `ct-effective-dose` is the DLP×k population estimate, not
  Monte-Carlo organ dose.
