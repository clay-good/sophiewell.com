# spec-v212.md — Hepatology, fibrosis & portal-hypertension prognosis: the Baveno VII CSPH / varices rule-out, BALAD-2, the King's Score, the HEPAmet Fibrosis Score, and Hong Kong Liver Cancer staging (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Closing feature spec of the **Advanced Prognostic &
> Risk-Equation Instruments** program ([spec-v209](spec-v209.md) §1.1). Adds **5**
> deterministic hepatology fibrosis, portal-hypertension, and hepatocellular-carcinoma
> instruments. **Each tile was verified absent by a direct scan of `app.js`** (zero id /
> name / keyword hits at draft): the catalog carries the fibrosis and liver-severity tools
> `fib4`, `apri`, `forns-index`, `nafld-fibrosis`, `fatty-liver-index`, `meld-childpugh`,
> `meld-na`, `meld-xi`, and `clif-c-aclf`, and the HCC tools `albi-grade`, `palbi`,
> `bclc-hcc`, and `milan-criteria`, but **not** the Baveno VII CSPH / varices rule-out, the
> BALAD-2 model, the King's Score, the HEPAmet Fibrosis Score, or the Hong Kong Liver Cancer
> staging system.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v212 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine and the §6 CI/CD contract, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no endoscopy order, beta-blocker order, biopsy order,
> transplant listing, or HCC treatment order in Sophie's voice** — these stage and stratify;
> the decision stays with the hepatologist and the patient). **Every cut-point, coefficient,
> and staging rule is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 2. What v212 adds (5 tiles)

### 2.1 `baveno-vii` — Baveno VII rule-out of clinically significant portal hypertension and high-risk varices

- **Citation:** de Franchis R, Bosch J, Garcia-Tsao G, Reiberger T, Ripoll C; Baveno VII
  Faculty. Baveno VII — renewing consensus in portal hypertension. *J Hepatol.*
  2022;76(4):959-974.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2021.12.022
- **Group:** G (clinical scoring & risk). **Specialties:** `hepatology`,
  `gastroenterology`.
- **Inputs:** liver-stiffness measurement by vibration-controlled transient elastography
  (kPa) and platelet count (×10⁹/L), in a patient with compensated advanced chronic liver
  disease (cACLD).
- **Output:** the **Baveno VII rule-out / rule-in status** — **LSM ≤ 15 kPa with platelets
  ≥ 150 ×10⁹/L rules out cACLD/CSPH; LSM ≥ 25 kPa rules in clinically significant portal
  hypertension; 15–25 kPa is the gray zone** — together with the **"favorable Baveno VII"
  varices rule-out (LSM < 20 kPa and platelets > 150 ×10⁹/L) under which screening
  endoscopy may be deferred** *(all thresholds, the etiology caveats, and the "rule of 5"
  for LSM change are transcribed verbatim at implementation, [spec-v97](spec-v97.md))* —
  naming which rule fired. Framed as the consensus non-invasive rule that spares selected
  patients an endoscopy; **not** an endoscopy or beta-blocker order. Class A. Cross-links
  `meld-childpugh`, `apri`.

### 2.2 `balad-2` — BALAD-2 (biomarker prognosis in hepatocellular carcinoma)

- **Citation:** Fox R, Berhane S, Teng M, et al. Biomarker-based prognosis in
  hepatocellular carcinoma: validation and extension of the BALAD model. *Br J Cancer.*
  2014;110(8):2090-2098.
- **citationUrl:** https://doi.org/10.1038/bjc.2014.130
- **Group:** G. **Specialties:** `hepatology`, `oncology`, `gastroenterology`.
- **Inputs:** the five serum markers — **B**ilirubin, **A**lbumin, **L**ens-culinaris
  agglutinin-reactive AFP (AFP-L3, %), **A**FP, and **D**es-gamma-carboxy prothrombin
  (DCP / PIVKA-II) — entered as continuous values *(the continuous-model coefficients and
  the four prognostic-group boundaries are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **BALAD-2 prognostic group (1–4)** and the associated **median survival
  band**, naming the group and the markers driving it. Framed as an entirely
  biomarker-based, imaging-independent HCC prognostic model that complements anatomic
  staging; **not** an HCC treatment order. Class A. Cross-links `albi-grade`, `bclc-hcc`.

### 2.3 `king-score` — King's Score (non-invasive marker of cirrhosis)

- **Citation:** Cross TJS, Rizzi P, Berry PA, Bruce M, Portmann B, Harrison PM. King's
  Score: an accurate marker of cirrhosis in chronic hepatitis C. *Eur J Gastroenterol
  Hepatol.* 2009;21(7):730-738.
- **citationUrl:** https://doi.org/10.1097/MEG.0b013e32830dfcb3
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`, `internal-medicine`.
- **Inputs:** age (years), AST (IU/L), INR, and platelet count (×10⁹/L).
- **Output:** the **King's Score** = `(age × AST × INR) / platelets`, against the published
  cut-points that rule cirrhosis out at the low threshold and in at the high threshold, with
  the intermediate indeterminate band *(the exact validated cut-points and their sensitivity/
  specificity are transcribed verbatim at implementation, [spec-v97](spec-v97.md))* —
  naming the value and the band. Framed as a simple four-variable non-invasive fibrosis /
  cirrhosis marker alongside FIB-4 and APRI; **not** a biopsy order. Class A. Cross-links
  `fib4`, `apri`.

### 2.4 `hepamet-fibrosis` — HEPAmet Fibrosis Score (advanced fibrosis in NAFLD/MASLD)

- **Citation:** Ampuero J, Pais R, Aller R, et al. Development and validation of
  hepamet fibrosis scoring system — a simple, noninvasive test to identify patients with
  nonalcoholic fatty liver disease with advanced fibrosis. *Clin Gastroenterol Hepatol.*
  2020;18(1):216-225.e5.
- **citationUrl:** https://doi.org/10.1016/j.cgh.2019.05.051
- **Group:** G. **Specialties:** `hepatology`, `gastroenterology`, `endocrinology`.
- **Inputs:** age, sex, HOMA-IR, presence of diabetes, AST, albumin, and platelet count.
- **Output:** the **HEPAmet Fibrosis Score (0–1)** from the published logistic model, with
  the two validated cut-points that create a **rule-out (< 0.12), indeterminate, and rule-in
  (> 0.47) band for advanced (F2–F4) fibrosis** *(the logistic coefficients and both
  cut-points are transcribed verbatim at implementation, [spec-v97](spec-v97.md))* — naming
  the value and the band. Framed as a NAFLD/MASLD-specific non-invasive advanced-fibrosis
  score that, unlike NAFLD Fibrosis Score and FIB-4, does not lose accuracy at the extremes
  of age; **not** a biopsy or referral order. Class A. Cross-links `nafld-fibrosis`, `fib4`.

### 2.5 `hklc` — Hong Kong Liver Cancer (HKLC) staging

- **Citation:** Yau T, Tang VYF, Yao TJ, Fan ST, Lo CM, Poon RTP. Development of Hong Kong
  Liver Cancer staging system with treatment stratification for patients with hepatocellular
  carcinoma. *Gastroenterology.* 2014;146(7):1691-1700.e3.
- **citationUrl:** https://doi.org/10.1053/j.gastro.2014.02.032
- **Group:** G. **Specialties:** `hepatology`, `oncology`, `gastroenterology`.
- **Inputs:** ECOG performance status, Child-Pugh class, tumor status (size of the largest
  nodule, number of nodules, presence of intrahepatic venous invasion), and the presence of
  extrahepatic vascular invasion or metastasis (EVM) *(the exact node-by-node staging tree
  is transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **HKLC stage (I, IIa/IIb, IIIa/IIIb, IVa/IVb, Va/Vb)** from the published
  classification tree, naming the stage and the inputs that set it. Framed as an
  Asian-cohort HCC staging system that reclassifies a subset of intermediate/advanced
  patients relative to BCLC; presented as a **staging classification only** — the linked
  treatment stratification is described as the authors' schema and is **not** rendered as a
  treatment order. Class A. Cross-links `bclc-hcc`, `milan-criteria`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `king-score` and
  `hepamet-fibrosis` carry clinician-entered denominators / logistic terms and clamp to the
  published domains, flooring and capping the result; `balad-2` clamps its continuous
  markers; `baveno-vii` and `hklc` are threshold / decision-tree classifiers. Each renders a
  complete-the-fields fallback for a missing input rather than a `NaN`/`Infinity` or a
  partial stage.
- **Each tile reports which band / group / stage applies and names its inputs**
  ([spec-v59](spec-v59.md)) — the Baveno rule that fired, the BALAD-2 group, the King's
  band, the HEPAmet band, the HKLC stage — so a result is never read without its basis.
- **All five render staging / stratification, not orders** — none authors an endoscopy,
  beta-blocker, biopsy, transplant-listing, or HCC-treatment order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at LSM / platelet / AST / INR / marker
  extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed cut-points / coefficients
  / staging rules, each cited by journal + authors. The implementing session confirms
  whether any citation (e.g. the Baveno consensus wording) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a `docs/citation-staleness.md`
  row only if the live pattern matches; the **Baveno VII** consensus carries a
  `docs/citation-staleness.md` row regardless, as a periodically renewed consensus.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/hepatology-risk-v212.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v212.js`; its `RV212` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hepatology`, `gastroenterology`,
  `oncology`, `internal-medicine`, `endocrinology`; the implementing session adds any tag
  missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v212.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v212 RV212 into RENDERERS)
lib/hepatology-risk-v212.js              (new: bavenoVii, balad2, kingScore, hepametFibrosis, hklc)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to fib4, apri, bclc-hcc, meld-childpugh)
views/group-v212.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
docs/citation-staleness.md               (+1 row: baveno-vii)
test/unit/baveno-vii.test.js, balad-2.test.js, king-score.test.js, hepamet-fibrosis.test.js, hklc.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/hepatology-risk-v212.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v212 delta; close the Advanced Prognostic & Risk-Equation Instruments program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v212 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Baveno VII
  rule-out / gray-zone / rule-in triple plus the varices rule-out**, a **BALAD-2 across two
  prognostic groups**, a **King's Score crossing its cirrhosis cut-point**, a **HEPAmet
  rule-out / indeterminate / rule-in triple**, and an **HKLC across at least two stages**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v212 with the +5 delta and notes the Advanced Prognostic &
  Risk-Equation Instruments program (v209–v212) closed.

## 7. Out of scope for v212

- **No endoscopy / beta-blocker / biopsy / transplant / HCC-treatment order** — the tiles
  stage and stratify; the scope, treat, and list decisions stay with the hepatologist and
  the patient ([spec-v11](spec-v11.md) §5.3). HKLC renders its stage only, not the authors'
  treatment stratification as an order.
- **No proprietary or non-reproducible model** — the ELF test's patented algorithm
  coefficients are deferred: they are not openly published and cannot be reproduced from ≥ 2
  open sources ([spec-v97](spec-v97.md)).

<!-- Program note: v209–v212 close the Advanced Prognostic & Risk-Equation Instruments
program, adding 20 fully published, deterministic, order-free multivariable prognostic
models across cardiology, stroke/ICH, hematology-oncology, and hepatology. Each was verified
absent at draft; each is Class A, cited, finite-guarded, and order-free. Instruments whose
coefficients are not reproducible from ≥2 open sources were deferred under spec-v97 (the
KCCQ health-status score and the ELF fibrosis algorithm). -->
