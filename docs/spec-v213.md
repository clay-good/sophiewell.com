# spec-v213.md — Emergency-department disposition & injury/physiology bedside instruments: the HEART Pathway, the Ottawa Heart Failure Risk Scale, Light's criteria, and the classic and revised Baux burn-mortality scores (+5 tiles)

> Status: **SHIPPED (2026-07-03).** Opening feature spec of the **Bedside
> Decision & Physiology Instruments** program — a broad, cross-domain sweep of
> openly published, deterministic calculators verified absent from the catalog.
> Adds **5** deterministic ED-disposition, pleural-fluid, and burn-mortality
> instruments. **Each tile was verified absent by a direct scan of `app.js`**
> (zero id / name / keyword hits at draft): the catalog carries `heart`, `timi`,
> `adhere-hf`, `maggic`, `saag`, `burn-fluid`, and `bsa_burn`, but **not** the
> HEART Pathway, the Ottawa Heart Failure Risk Scale, Light's criteria, the Baux
> score, or the revised Baux score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v213 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine and the §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> citation inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 posture note,
> and honors [spec-v11](spec-v11.md) §5.3 (**no admission, discharge, endoscopy,
> drainage, or burn-treatment order in Sophie's voice** — these stratify,
> classify, and estimate; the decision stays with the clinician and the
> patient). **Every cut-point, coefficient, and rule is re-fetched and
> cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)).

## 2. What v213 adds (5 tiles)

### 2.1 `heart-pathway` — HEART Pathway for early discharge in acute chest pain

- **Citation:** Mahler SA, Riley RF, Hiestand BC, et al. The HEART Pathway
  randomized trial: identifying emergency department patients with acute chest
  pain for early discharge. *Circ Cardiovasc Qual Outcomes.* 2015;8(2):195-203.
- **citationUrl:** https://doi.org/10.1161/CIRCOUTCOMES.114.001384
- **Group:** G. **Specialties:** `cardiology`, `emergency-medicine`.
- **Inputs:** HEART score (0-10, computed on the existing `heart` tile) and
  whether the troponin is elevated at 0 h and at 3 h.
- **Output:** the **HEART Pathway disposition** — HEART score 0-3 **and** a
  non-elevated troponin at 0 h and 3 h marks a **low-risk, early-discharge
  candidate** (~0.9-2% 30-day MACE); a HEART score ≥ 4 or any elevated troponin
  is **not low risk**. A disposition-support rule, **not** an admission or
  discharge order. Class A. Cross-links `heart`, `timi`.

### 2.2 `ottawa-heart-failure` — Ottawa Heart Failure Risk Scale (OHFRS)

- **Citation:** Stiell IG, Clement CM, Brison RJ, et al. A risk scoring system to
  identify emergency department patients with heart failure at high risk for
  serious adverse events. *Acad Emerg Med.* 2013;20(1):17-26.
- **citationUrl:** https://doi.org/10.1111/acem.12056
- **Group:** G. **Specialties:** `cardiology`, `emergency-medicine`.
- **Inputs:** the 10 weighted items — stroke/TIA history, prior intubation for
  respiratory distress, heart rate ≥ 110 on arrival, SaO₂ < 90%, heart rate ≥ 110
  on a 3-minute walk (or too ill to walk), new ischemic ECG changes, urea ≥ 12
  mmol/L, serum CO₂ ≥ 35 mmol/L, troponin at MI level, and NT-proBNP ≥ 5000 ng/L.
- **Output:** the **OHFRS total (0-15)** and the risk band — serious-adverse-event
  risk rises from ~2.8% at 0 to ~89% at the high end; the authors recommend an
  **admission threshold of > 1**. A risk-stratification scale, **not** an
  admission order. Class A. Cross-links `adhere-hf`, `maggic`.

### 2.3 `light-criteria` — Light's criteria (pleural exudate vs transudate)

- **Citation:** Light RW, Macgregor MI, Luchsinger PC, Ball WC Jr. Pleural
  effusions: the diagnostic separation of transudates and exudates. *Ann Intern
  Med.* 1972;77(4):507-513.
- **citationUrl:** https://doi.org/10.7326/0003-4819-77-4-507
- **Group:** G. **Specialties:** `pulmonology`, `internal-medicine`.
- **Inputs:** pleural and serum total protein, pleural and serum LDH, and the
  upper limit of normal for serum LDH.
- **Output:** the **exudate / transudate classification** — an effusion is an
  **exudate** if any of pleural/serum protein > 0.5, pleural/serum LDH > 0.6, or
  pleural LDH > two-thirds the ULN of serum LDH; otherwise **transudate** — naming
  which criteria fired. A classification, **not** a drainage or workup order.
  Class A. Cross-links `saag`, `anion-gap`.

### 2.4 `baux-score` — Baux score (burn mortality estimate)

- **Citation:** Baux S. Contribution a l'etude du traitement local des brulures
  thermiques etendues [thesis]. Paris; 1961. Reviewed in Roberts G, Lloyd M,
  Parker M, et al. The Baux score is dead. Long live the Baux score. *J Trauma
  Acute Care Surg.* 2012;72(1):251-256.
- **citationUrl:** https://doi.org/10.1097/TA.0b013e31824157e6
- **Group:** G. **Specialties:** `burn`, `critical-care`, `emergency-medicine`.
- **Inputs:** age and burned total body surface area (%TBSA).
- **Output:** the **Baux score** = age + %TBSA, with the historical mortality
  interpretation (a score near 100 was near-universally fatal in the pre-modern
  era; modern burn care has shifted survivable thresholds higher). A prognostic
  estimate, **not** a triage or treatment order. Class A. Cross-links
  `revised-baux`, `burn-fluid`.

### 2.5 `revised-baux` — Revised Baux score (burn mortality with inhalation injury)

- **Citation:** Osler T, Glance LG, Hosmer DW. Simplified estimates of the
  probability of death after burn injuries: extending and updating the Baux
  score. *J Trauma.* 2010;68(3):690-697.
- **citationUrl:** https://doi.org/10.1097/TA.0b013e3181c453b3
- **Group:** G. **Specialties:** `burn`, `critical-care`, `emergency-medicine`.
- **Inputs:** age, burned %TBSA, and whether inhalation injury is present.
- **Output:** the **revised Baux score** = age + %TBSA + 17 × (inhalation
  injury), reporting the classic Baux alongside it — the LD50 in the best modern
  burn units is a score of ~130-140. A prognostic estimate, **not** a triage or
  treatment order. Class A. Cross-links `baux-score`, `burn-fluid`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.**
  `light-criteria` clamps clinician-entered ratios and floors their denominators;
  the two Baux tiles clamp age / %TBSA to their published domains; `heart-pathway`
  and `ottawa-heart-failure` are threshold / weighted-sum classifiers. Each
  renders a complete-the-fields fallback for a missing input rather than a
  `NaN`/`Infinity` or a partial result.
- **Each tile reports which band / class / disposition applies and names its
  inputs** ([spec-v59](spec-v59.md)).
- **All five render disposition / classification / estimation, not orders** — none
  authors an admission, discharge, endoscopy, drainage, or burn-treatment order in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3); each renders the
  [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at band boundaries and at HEART / OHFRS-item /
  protein / LDH / age / %TBSA extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed cut-points /
  point systems / formulas, each cited by journal + authors. None trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)), so no
  `docs/citation-staleness.md` row is added.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/acute-injury-v213.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v213.js`; its `RV213` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  using the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`,
  `emergency-medicine`, `pulmonology`, `internal-medicine`, `burn`,
  `critical-care` — all already in `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v213.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v213 RV213 into RENDERERS)
lib/acute-injury-v213.js                 (new: heartPathway, ottawaHf, lightCriteria, bauxScore, revisedBaux)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v213.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/acute-injury-v213.test.js      (worked examples)
test/unit/fuzz-tools.test.js             (add lib/acute-injury-v213.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v213 delta)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md  (catalog count live -> live+5)
```

## 6. Acceptance criteria

v213 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md)
  collision check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and worked examples — including a **HEART Pathway
  low-risk case**, an **OHFRS across its threshold**, a **Light's exudate and
  transudate**, and a **Baux / revised-Baux pair**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.

## 7. Out of scope for v213

- **No admission / discharge / endoscopy / drainage / burn-treatment order** — the
  tiles stratify, classify, and estimate; the disposition and treatment decisions
  stay with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — instruments whose coefficients
  are not reproducible from ≥2 open sources are deferred under
  [spec-v97](spec-v97.md).
