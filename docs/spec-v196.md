# spec-v196.md — Chronic liver disease prognosis: ABIC, the GLOBE score, the UK-PBC risk score, PAGE-B, and the revised Mayo PSC model (+5 tiles)

> Status: **SHIPPED (2026-07-02).** _(Proposed 2026-07-01.)_ Feature spec of the **Advanced Specialist
> Quantitation** program ([spec-v193](spec-v193.md) §1.1). Adds **5** deterministic
> chronic-liver-disease prognostic instruments spanning alcoholic hepatitis, primary
> biliary cholangitis, chronic hepatitis B, and primary sclerosing cholangitis.
> **Each tile was verified absent by a direct scan of `app.js`** (zero id / name /
> keyword hits): the catalog carries `meld-childpugh`, `meld-na`, `meld-xi`,
> `maddrey-lille`, `gahs`, `albi-grade`, `palbi`, `fib4`, `apri`, `nafld-fibrosis`,
> `forns-index`, `lok-index`, `bard-score`, `clif-c-aclf`, `kings-college`, `clichy`,
> `milan-criteria`, and `bclc-hcc`, but **not** the ABIC score, the GLOBE score, the
> UK-PBC risk score, PAGE-B, or the revised Mayo PSC model.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v196 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no treatment, listing, or allocation order in
> Sophie's voice** — these prognosticate; the decision stays with the hepatology and
> transplant team and the patient). **Every coefficient, weight, and band threshold
> is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing session
> **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the general cirrhosis and fibrosis instruments (MELD family,
Child-Pugh, ALBI, FIB-4, CLIF-C ACLF), but not the **disease-specific prognostic
models** the hepatologist uses to decide UDCA response, transplant-free survival, HCC
surveillance intensity, and disease progression in the cholestatic and viral
hepatitides. Five standard, freely-reproducible models are absent — one per major
chronic-liver-disease axis — and each is decision support, **never a treatment,
listing, or allocation order**.

## 2. What v196 adds (5 tiles)

### 2.1 `abic-score` — ABIC Score (alcoholic hepatitis)

- **Citation:** Dominguez M, Rincón D, Abraldes JG, et al. A new scoring system for
  prognostic stratification of patients with alcoholic hepatitis. *Am J
  Gastroenterol.* 2008;103(11):2747-2756.
- **citationUrl:** https://doi.org/10.1111/j.1572-0241.2008.02104.x
- **Group:** E (clinical math). **Specialties:** `hepatology`, `gastroenterology`,
  `critical-care`.
- **Inputs:** age (yr), serum bilirubin (mg/dL), serum creatinine (mg/dL), and INR.
  Computes **ABIC = (age × 0.1) + (bilirubin × 0.08) + (creatinine × 0.3) +
  (INR × 0.8)**.
- **Output:** the **ABIC value** with the 90-day survival band — < 6.71 low
  (~100%), 6.71–< 9.0 intermediate (~70%), ≥ 9.0 high (~25%) *(verify at
  implementation, [spec-v97](spec-v97.md))* — naming the contributors. Class A.
  Cross-links `maddrey-lille`, `gahs`, `meld-na`.

### 2.2 `globe-score` — GLOBE Score (PBC transplant-free survival on UDCA)

- **Citation:** Lammers WJ, Hirschfield GM, Corpechot C, et al. Development and
  validation of a scoring system to predict outcomes of patients with primary biliary
  cirrhosis receiving ursodeoxycholic acid therapy. *Gastroenterology.*
  2015;149(7):1804-1812.e4.
- **citationUrl:** https://doi.org/10.1053/j.gastro.2015.07.061
- **Group:** E. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs (all at 1 year of UDCA):** age (yr), bilirubin (× ULN), alkaline
  phosphatase (× ULN), albumin (× LLN), and platelet count (× 10⁹/L). Computes the
  published continuous **GLOBE score** *(the exact coefficients and the − albumin and
  − platelet sign convention are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **GLOBE score** with the > 0.30 non-responder threshold and its
  transplant-free-survival meaning, naming the inputs. Class A. Cross-links
  `uk-pbc-risk`, `albi-grade`.

### 2.3 `uk-pbc-risk` — UK-PBC Risk Score (PBC end-stage liver disease)

- **Citation:** Carbone M, Sharp SJ, Flack S, et al. The UK-PBC risk scores:
  derivation and validation of a scoring system for long-term prediction of
  end-stage liver disease in primary biliary cirrhosis. *Hepatology.*
  2016;63(3):930-950.
- **citationUrl:** https://doi.org/10.1002/hep.28017
- **Group:** E. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs:** alkaline phosphatase (× ULN, 12 mo), AST or ALT (× ULN, 12 mo),
  bilirubin (× ULN, 12 mo), baseline albumin (× LLN), and baseline platelets (× LLN).
  Computes the linear predictor and the **5- / 10- / 15-year risk of end-stage liver
  disease** via 1 − S₀^exp(LP) *(the coefficients and baseline survivor functions
  S₀ are transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **risk (%) at 5, 10, and 15 years**, naming the inputs; the tile
  notes it complements the GLOBE score (adds transaminases; fixed-horizon survival).
  Class A. Cross-links `globe-score`.

### 2.4 `page-b` — PAGE-B Score (HCC risk in treated chronic hepatitis B)

- **Citation:** Papatheodoridis G, Dalekos G, Sypsa V, et al. PAGE-B predicts the
  risk of developing hepatocellular carcinoma in Caucasians with chronic hepatitis B
  on 5-year antiviral therapy. *J Hepatol.* 2016;64(4):800-806.
- **citationUrl:** https://doi.org/10.1016/j.jhep.2015.11.035
- **Group:** G (clinical scoring & risk). **Specialties:** `hepatology`,
  `gastroenterology`, `infectious-disease`.
- **Inputs:** age, sex, and platelet count, each mapped to its published categorical
  points *(the exact per-category point weights are transcribed verbatim from the
  primary table at implementation, [spec-v97](spec-v97.md) — secondary renderings
  differ)*.
- **Output:** the **PAGE-B total** with the 5-year HCC-risk band — low (≤ 9),
  intermediate (10–17), high (≥ 18) *(verify the band incidences at implementation)*
  — naming the contributors. Class A. Cross-links `bclc-hcc`; the tile notes it is an
  incidence-risk score, distinct from the BCLC stage.

### 2.5 `mayo-psc-risk` — Revised Mayo PSC Natural History Model

- **Citation:** Kim WR, Therneau TM, Wiesner RH, et al. A revised natural history
  model for primary sclerosing cholangitis. *Mayo Clin Proc.* 2000;75(7):688-694.
- **citationUrl:** https://doi.org/10.4065/75.7.688
- **Group:** E. **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs:** age (yr), bilirubin (mg/dL), albumin (g/dL), AST (U/L), and history of
  variceal bleeding (0/1). Computes the Cox linear predictor
  **R = 0.03 × age + 0.54 × ln(bilirubin) + 0.54 × ln(AST) + 1.24 × (variceal bleed)
  − 0.84 × albumin**.
- **Output:** the **Mayo PSC risk score** with the risk band (R < 0 low, 0–< 2
  intermediate, ≥ 2 high *(verify at implementation, [spec-v97](spec-v97.md))*),
  naming the inputs. Guards bilirubin / AST > 0 before the logarithms. Class A.
  Cross-links `meld-na`, `kings-college`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `globe-score`,
  `uk-pbc-risk`, and `mayo-psc-risk` guard every logged input > 0 before the natural
  logarithm; the survival tiles clamp the reported probability to [0, 1]; `page-b`
  clamps its inputs to the published bands; outside these each renders a
  complete-the-fields fallback, never a `NaN`/`Infinity`.
- **Each tile reports which band applies and names the model's intended population and
  time-point** (UDCA year-1 for GLOBE/UK-PBC; 5-year antiviral therapy for PAGE-B), so
  a score is never read outside its context ([spec-v59](spec-v59.md)).
- **The continuous survival models are computed in the published parametric form with
  the sign convention transcribed verbatim** (GLOBE's − albumin / − platelet terms;
  UK-PBC's baseline survivor functions), guarded against complement leaks per
  [spec-v140](spec-v140.md).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and the log-domain edges.
- **These prognosticate; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a treatment, listing, or
  allocation order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed formulas / point
  models, each cited by journal + authors. The implementing session confirms whether
  any citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md))
  and adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new `lib/liver-v196.js`
  module, added to `test/unit/fuzz-tools.test.js` `MODULES` (the GLOBE / UK-PBC
  survival models fuzzed at the saturation edge per [spec-v140](spec-v140.md)).
  Renderers live in a new `views/group-v196.js`; its `RV196` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length`
  + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hepatology`,
  `gastroenterology`, `critical-care`, `infectious-disease` — all already in the
  vocabulary.

## 5. Files touched

```
docs/spec-v196.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v196 RV196 into RENDERERS)
lib/liver-v196.js                        (new: abicScore, globeScore, ukPbcRisk, pageB, mayoPscRisk)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to maddrey-lille, albi-grade, bclc-hcc)
views/group-v196.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/abic-score.test.js, globe-score.test.js, uk-pbc-risk.test.js, page-b.test.js, mayo-psc-risk.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/liver-v196.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v196 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v196 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **ABIC band
  crossing**, a **GLOBE score above and below 0.30**, a **UK-PBC 5/10/15-year risk
  set**, a **PAGE-B band crossing**, and a **Mayo PSC risk band example**.
- Every compute is finite-guarded (log-domain and [0,1] clamps), routes through
  `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v196 with the +5 delta.

## 7. Out of scope for v196

- **No treatment / listing / allocation order** — the tiles prognosticate; the UDCA /
  second-line, transplant-listing, HCC-surveillance, and antiviral decisions stay with
  the hepatology and transplant team and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary surgical-risk model** — VOCAL-Penn cirrhotic surgical risk has
  closed logistic coefficients (available only via the vendor calculator) and fails
  the [spec-v97](spec-v97.md) reproducibility bar; it is excluded.
- **No site-conditional criteria set** — RUCAM DILI causality is conditional on the
  injury pattern and does not express as a fixed schema (the mcgeer / loeb deferral
  precedent); it is not bundled here.
