# spec-v134.md — Plasma-cell & myeloid neoplasm staging: ISS, R-ISS, R2-ISS, Mayo MGUS risk, and DIPSS / DIPSS-Plus (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID.**
> Adds **6** deterministic plasma-cell and myeloid-neoplasm staging/prognosis rules
> that fill confirmed catalog gaps. None duplicates a live tile.
>
> Catalog effect at v134 close: **592 + 6 = 598 tiles.** (If specs land out of
> order, the implementing session uses the then-current `UTILITIES.length` plus
> this spec's +6, and the catalog-truth gate enforces agreement.)
>
> Every prior spec (v4 through v133) remains in force. v134 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the MDS prognostic score (`ipss-r-mds`) and the lymphoma index
(`flipi`), but the plasma-cell and myelofibrosis staging cluster that sits beside
them is absent — no myeloma stage, no MGUS progression risk, no myelofibrosis
survival score. Each is a published, deterministic instrument a hematologist
already uses, and each sits conceptually beside `ipss-r-mds`:

- **Multiple myeloma has no stage tile.** The **ISS** (β2-microglobulin + albumin),
  the **R-ISS** (ISS + LDH + high-risk iFISH), and the **R2-ISS** (additive weighted
  ISS/del17p/LDH/t(4;14)/1q21) are the three sequential staging systems; none is
  reachable.
- **MGUS has no progression-risk tile.** The **Mayo MGUS** stratification (M-spike
  size, isotype, free-light-chain ratio) gives the 0–3 risk-factor count that drives
  surveillance intensity.
- **Myelofibrosis has no survival score.** **DIPSS** (dynamic, applicable at any
  point in the disease course) and **DIPSS-Plus** (DIPSS + platelets + transfusion +
  karyotype) are the standard MF prognosis tools, the myeloid companions to the
  already-shipped `ipss-r-mds`.

v134 brings the plasma-cell and MF staging cluster onto the page beside `ipss-r-mds`
and `flipi`.

## 2. What v134 adds (6 tiles)

### 2.1 `myeloma-iss` — Multiple Myeloma International Staging System (ISS)

- **Citation:** Greipp PR, San Miguel J, Durie BGM, et al. International staging
  system for multiple myeloma. *J Clin Oncol.* 2005;23(15):3412-3420.
- **citationUrl:** https://doi.org/10.1200/JCO.2005.04.242
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** serum β2-microglobulin (mg/L) and serum albumin (g/dL).
- **Output:** the **ISS stage I–III** — **I** = β2M < 3.5 *and* albumin ≥ 3.5;
  **III** = β2M ≥ 5.5; **II** = neither — with the published median-survival framing,
  naming which threshold governed. Class A. Cross-links `myeloma-r-iss`.

### 2.2 `myeloma-r-iss` — Revised ISS (R-ISS)

- **Citation:** Palumbo A, Avet-Loiseau H, Oliva S, et al. Revised International
  Staging System for multiple myeloma: a report from International Myeloma Working
  Group. *J Clin Oncol.* 2015;33(26):2863-2869.
- **citationUrl:** https://doi.org/10.1200/JCO.2015.61.2267
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** the ISS stage (from β2M + albumin), serum LDH (normal vs above upper
  limit), and high-risk iFISH cytogenetics (del(17p), t(4;14), or t(14;16) present).
- **Output:** the **R-ISS stage I–III** — **I** = ISS I *and* normal LDH *and* no
  high-risk iFISH; **III** = ISS III *and* (high LDH *or* high-risk iFISH); **II** =
  all others — naming the determining factors. **Class B** (the R-ISS is a working-
  group definition revisable by IMWG → `docs/citation-staleness.md` row,
  on-publication cadence). Cross-links `myeloma-iss` and `myeloma-r2-iss`.

### 2.3 `myeloma-r2-iss` — Second-Revision ISS (R2-ISS)

- **Citation:** D'Agostino M, Cairns DA, Lahuerta JJ, et al. Second revision of the
  International Staging System (R2-ISS) for overall survival in multiple myeloma: a
  European Myeloma Network (EMN) report within HARMONY. *J Clin Oncol.*
  2022;40(29):3406-3418.
- **citationUrl:** https://doi.org/10.1200/JCO.21.02614
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** ISS stage II or III (1.0 and 1.5 respectively per the additive model),
  high LDH (1.0), del(17p) (1.0), t(4;14) (1.0), and gain/amp 1q21 (0.5).
- **Output:** the **additive total (0–3.0)** mapped to the published **four
  risk-strata I–IV** (low / low-intermediate / intermediate-high / high), naming the
  weighted contributions. Class A (fixed additive weights). Cross-links
  `myeloma-r-iss`.

### 2.4 `mgus-risk` — Mayo MGUS Risk Stratification

- **Citation:** Rajkumar SV, Kyle RA, Therneau TM, et al. Serum free light chain
  ratio is an independent risk factor for progression in monoclonal gammopathy of
  undetermined significance. *Blood.* 2005;106(3):812-817.
- **citationUrl:** https://doi.org/10.1182/blood-2005-03-1038
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** serum M-protein ≥ 1.5 g/dL (1); non-IgG isotype (IgA or IgM) (1);
  abnormal serum free-light-chain ratio (outside 0.26–1.65) (1).
- **Output:** the **risk-factor count (0–3)** mapped to the published 20-year
  progression-risk strata (low / low-intermediate / intermediate / high), naming
  which factors were present. Class A. Cross-links `myeloma-iss`.

### 2.5 `dipss-mf` — DIPSS (Dynamic International Prognostic Scoring System, myelofibrosis)

- **Citation:** Passamonti F, Cervantes F, Vannucchi AM, et al. A dynamic
  prognostic model to predict survival in primary myelofibrosis: a study by the IWG
  for Myeloproliferative Neoplasms Research and Treatment (IWG-MRT). *Blood.*
  2010;115(9):1703-1708.
- **citationUrl:** https://doi.org/10.1182/blood-2009-09-245837
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** age > 65 (1); WBC > 25 ×10⁹/L (1); hemoglobin < 10 g/dL (2);
  peripheral blast ≥ 1% (1); constitutional symptoms (1).
- **Output:** the **DIPSS total (0–6)** mapped to the four risk groups — **low (0),
  intermediate-1 (1–2), intermediate-2 (3–4), high (5–6)** — with the published
  median-survival framing, naming the weighted contributions. Class A. Cross-links
  `dipss-plus-mf`.

### 2.6 `dipss-plus-mf` — DIPSS-Plus (myelofibrosis)

- **Citation:** Gangat N, Caramazza D, Vaidya R, et al. DIPSS Plus: a refined
  Dynamic International Prognostic Scoring System for primary myelofibrosis that
  incorporates prognostic information from karyotype, platelet count, and
  transfusion status. *J Clin Oncol.* 2011;29(4):392-397.
- **citationUrl:** https://doi.org/10.1200/JCO.2010.32.2446
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** the DIPSS risk group (int-1 → 1, int-2 → 2, high → 3), platelet count
  < 100 ×10⁹/L (1), red-cell transfusion need (1), and unfavorable karyotype (1).
- **Output:** the **DIPSS-Plus total (0–6)** mapped to the four risk groups — **low
  (0), intermediate-1 (1), intermediate-2 (2–3), high (4–6)** — naming the weighted
  contributions and the DIPSS group carried forward. Class A. Cross-links `dipss-mf`.

## 3. Per-tile robustness

- **All six are criteria/threshold or weighted-sum logic** with bounded outputs;
  each flows through the [spec-v59](spec-v59.md) fuzz harness and names which
  factors/weights were counted, returning a surfaced complete-the-fields fallback
  rather than a partial stage when a required input is blank.
- **`myeloma-iss` and `myeloma-r-iss` chain.** ISS computes from entered β2M +
  albumin (each compared to its fixed threshold with a blank guard); R-ISS consumes
  the ISS stage plus LDH and iFISH flags. The compute recomputes ISS internally
  rather than trusting a pre-entered stage, so the chain cannot desync.
- **`myeloma-r2-iss` and `dipss-plus-mf` carry weighted sub-scores.** The additive
  weights (0.5 / 1.0 / 1.5 for R2-ISS; the DIPSS-group carry-forward for
  DIPSS-Plus) are compiled constants; the total is clamped to its published range and
  the strata boundaries are exact.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's stage/risk-group interpretation; none authors a treat/transplant
  recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `myeloma-r-iss` is **Class B** — the R-ISS is an
  IMWG working-group definition revisable on publication, so it gets a
  `docs/citation-staleness.md` row naming the edition in force (2015 R-ISS), the
  `accessed` date, and an on-publication review cadence, monitored by
  `scripts/check-citation-cadence.mjs`. The other five (`myeloma-iss`,
  `myeloma-r2-iss`, `mgus-risk`, `dipss-mf`, `dipss-plus-mf`) are **Class A** (fixed
  derivation papers / weights) — **no** staleness row. Each Class-A citation names the
  **journal and authors** (J Clin Oncol, Blood), not the issuing society, so
  `check-citations.mjs` `ISSUER_PATTERN` does not fire — **but** the `myeloma-r-iss`
  citation, which names IMWG, correctly trips it and is the one that *needs* the row
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson).
- **Build (§6.1):** `lib/onc-v134.js` is the new compute module (`myelomaIss`,
  `myelomaRIss`, `myelomaR2Iss`, `mgusRisk`, `dipssMf`, `dipssPlusMf`);
  `views/group-v134.js` is the new renderer module, exporting `RV134` into the
  `app.js` `RENDERERS` spread.
- **Gates (§6.2):** `lib/onc-v134.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v134.js`.

## 5. Files touched

```
docs/spec-v134.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v134 RV134 into RENDERERS)
lib/onc-v134.js                          (new module: myelomaIss, myelomaRIss, myelomaR2Iss, mgusRisk, dipssMf, dipssPlusMf)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to ipss-r-mds, flipi)
views/group-v134.js                      (new renderer module: 6 renderers)
docs/citation-staleness.md               (+ row: myeloma-r-iss 2015 R-ISS / IMWG)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/myeloma-iss.test.js, myeloma-r-iss.test.js, myeloma-r2-iss.test.js, mgus-risk.test.js, dipss-mf.test.js, dipss-plus-mf.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/onc-v134.js to MODULES)
docs/audits/v12/myeloma-iss.md, myeloma-r-iss.md, myeloma-r2-iss.md, mgus-risk.md, dipss-mf.md, dipss-plus-mf.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 592 -> 598; running ledger)
CHANGELOG.md                             (Unreleased: v134 entry, +6)
README.md, package.json                  (catalog count 592 -> 598; spec-progression line -> v134)
```

## 6. Acceptance criteria

v134 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including
  an **ISS stage I/II/III boundary** at β2M = 3.5 and 5.5, an **R-ISS stage flip**, an
  **R2-ISS strata boundary**, an **MGUS 0-vs-3-factor flip**, and a **DIPSS / DIPSS-
  Plus risk-group boundary**), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; partial inputs
  render a complete-the-fields fallback.
- `myeloma-r-iss` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **598** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v134 with the +6 catalog delta.

## 7. Out of scope for v134

- **No iFISH / karyotype interpretation** — the R-ISS, R2-ISS, and DIPSS-Plus tiles
  consume the clinician-entered cytogenetic flags (high-risk iFISH present,
  unfavorable karyotype), not a cytogenetics report.
- **No molecular IPSS-M for MDS** — `ipss-r-mds` (clinical/cytogenetic) is the live
  MDS tile; the molecular IPSS-M is not added here.
- **No treatment-line or transplant-eligibility recommendation** — each tile reports
  the stage/risk group and the source's stated survival framing only; the management
  decision stays with the clinician.
- **No smoldering-myeloma or solitary-plasmacytoma staging** — v134 covers ISS-family
  active-myeloma staging, MGUS progression risk, and MF survival only.
