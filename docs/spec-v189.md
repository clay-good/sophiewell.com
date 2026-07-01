# spec-v189.md — Myeloma risk, vasculitis activity, anticoagulation suitability & comorbidity burden: mSMART, IMPEDE-VTE, BVAS, SAMe-TT2R2, and the Elixhauser index (+5 tiles)

> Status: **SHIPPED 2026-07-01 (798 → 802, +4; BVAS v3 deferred).** Third and
> **closing** feature spec of the
> **Subspecialty Oncology & Hematology Staging** program ([spec-v187](spec-v187.md)
> §1.1), extending into adjacent hematology / rheumatology / anticoagulation
> prognosis. Adds **5** deterministic instruments, **each verified absent by a
> direct scan of `app.js`** (zero hits): the catalog carries `ipss-r-mds`,
> `charlson`, `has-bled`-adjacent bleeding scores, and the rheumatology activity
> indices, but not the myeloma risk-stratification / VTE tools, the Birmingham
> vasculitis activity score, the VKA-control predictor, or the Elixhauser
> comorbidity index.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v189 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no treatment, thromboprophylaxis, or
> anticoagulation order in Sophie's voice**). **Every weight, cut-point, and
> comorbidity coefficient is re-fetched and cross-verified against ≥2 independent
> sources at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an
> explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check**
> first.

## 1. Thesis

Five more deterministic prognostic instruments span the hematology, rheumatology,
and anticoagulation clinics and are missing from the catalog: the myeloma
cytogenetic risk stratification (mSMART), the myeloma thromboprophylaxis score
(IMPEDE-VTE), the vasculitis activity score (BVAS), the predictor of INR control on
a vitamin-K antagonist (SAMe-TT2R2), and the Elixhauser comorbidity burden. v189
ships these five. Each is a transparent point / criteria model — auditable,
unit-tested at every band — and each is decision support, **never an order**.

## 2. What v189 adds (5 tiles)

### 2.1 `msmart` — mSMART Myeloma Risk Stratification

- **Citation:** Mikhael JR, Dingli D, Roy V, et al. Management of newly diagnosed
  symptomatic multiple myeloma: updated Mayo Stratification of Myeloma and
  Risk-Adapted Therapy (mSMART) consensus guidelines. *Mayo Clin Proc.*
  2013;88(4):360-376 (mSMART; updated 3.0).
- **citationUrl:** https://doi.org/10.1016/j.mayocp.2013.01.019
- **Group:** G (clinical classification). **Specialties:** `hematology`, `oncology`.
- **Inputs:** the high-risk cytogenetic / laboratory features — t(4;14), t(14;16),
  t(14;20), del(17p)/p53, gain(1q) / del(1p), high plasma-cell S-phase, and R-ISS
  III / high LDH — entered as present/absent per the consensus.
- **Output:** **standard-risk vs high-risk** (double-hit / high-risk when the
  defining features are present), naming which feature drove the call *(exact
  double-hit definition verified at implementation, [spec-v97](spec-v97.md))*.
  Class A. Cross-links `impede-vte`.

### 2.2 `impede-vte` — IMPEDE VTE Score (myeloma thromboprophylaxis)

- **Citation:** Sanfilippo KM, Luo S, Wang TF, et al. Predicting venous
  thromboembolism in multiple myeloma: development and validation of the IMPEDE
  VTE score. *Am J Hematol.* 2019;94(11):1176-1184.
- **citationUrl:** https://doi.org/10.1002/ajh.25603
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the weighted criteria — Immunomodulatory agent (+4), BMI ≥ 25 (+1),
  Pelvic/hip/femur fracture (+4), Erythropoietin-stimulating agent (+1),
  Dexamethasone (high-dose +4 / low-dose +2), Doxorubicin (+3), Asian ethnicity
  (−3), VTE history (+5), tunneled line / CVC (+2), existing thromboprophylaxis
  (therapeutic anticoagulation −4 / aspirin −3) *(verify the weights at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **score** banded low / intermediate / high VTE risk, naming the
  contributors; framed as risk stratification for a thromboprophylaxis discussion,
  not an order. Class A. Cross-links `msmart` and the VTE tiles.

### 2.3 `bvas` — Birmingham Vasculitis Activity Score (v3)

> **DEFERRED (2026-07-01).** A faithful BVAS v3 requires item-level
> new/worse-vs-persistent scoring of ~56 weighted items across nine organ
> systems; any organ-system approximation would misreport the total and fail the
> [spec-v97](spec-v97.md) fidelity bar. Deferred with the other sourcing/fidelity
> deferrals (crib-ii, gwtg-hf, precise-dapt); recorded in
> [scope-post-parity.md](scope-post-parity.md). The other four v189 tiles shipped.

- **Citation:** Mukhtyar C, Lee R, Brown D, et al. Modification and validation of
  the Birmingham Vasculitis Activity Score (version 3). *Ann Rheum Dis.*
  2009;68(12):1827-1832.
- **citationUrl:** https://doi.org/10.1136/ard.2008.101279
- **Group:** G. **Specialties:** `rheumatology`, `nephrology`, `internal-medicine`.
- **Inputs:** the nine organ-system domains (general, cutaneous, mucous
  membranes/eyes, ENT, chest, cardiovascular, abdominal, renal, nervous system),
  each item scored only if attributable to *active* vasculitis, with the
  **new/worse vs persistent** weighting the instrument defines.
- **Output:** the **BVAS total** (new/worse and persistent components), naming the
  active domains; framed as a disease-activity measure for the visit. Class A.
  Cross-links the rheumatology activity indices.

### 2.4 `same-tt2r2` — SAMe-TT2R2 (VKA anticoagulation-control prediction)

- **Citation:** Apostolakis S, Sullivan RM, Olshansky B, Lip GYH. Factors affecting
  quality of anticoagulation control among patients with atrial fibrillation on
  warfarin: the SAMe-TT2R2 score. *Chest.* 2013;144(5):1555-1563.
- **citationUrl:** https://doi.org/10.1378/chest.13-0054
- **Group:** G. **Specialties:** `cardiology`, `hematology`, `primary-care`,
  `pharmacy`.
- **Inputs:** Sex (female +1), Age < 60 (+1), Medical history (≥ 2 comorbidities
  +1), Treatment with interacting drugs (+1), Tobacco use within 2 years (+2), Race
  (non-white +2).
- **Output:** the **score (0–8)**; ≤ 1 predicts good INR control on a vitamin-K
  antagonist, ≥ 2 predicts poorer control (favoring a DOAC or closer monitoring)
  *(verify the cut at implementation, [spec-v97](spec-v97.md))*, framed as a VKA-
  suitability aid. Class A. Cross-links `rosendaal-ttr` ([spec-v185](spec-v185.md))
  and the warfarin tiles.

### 2.5 `elixhauser` — Elixhauser Comorbidity Index (van Walraven weighting)

- **Citation:** Elixhauser A, Steiner C, Harris DR, Coffey RM. Comorbidity measures
  for use with administrative data. *Med Care.* 1998;36(1):8-27. Weighted index:
  van Walraven C, Austin PC, Jennings A, Quan H, Forster AJ. *Med Care.*
  2009;47(6):626-633.
- **citationUrl:** https://doi.org/10.1097/MLR.0b013e31819432e5
- **Group:** G. **Specialties:** `internal-medicine`, `quality-safety`.
- **Inputs:** the Elixhauser comorbidity checkboxes (the 30-condition set — CHF,
  arrhythmia, valvular, pulmonary circulation, PVD, hypertension, paralysis, other
  neurologic, chronic pulmonary, diabetes ± complications, hypothyroid, renal,
  liver, PUD, HIV, lymphoma, metastatic cancer, solid tumor, rheumatoid/collagen,
  coagulopathy, obesity, weight loss, fluid/electrolyte, blood-loss anemia,
  deficiency anemia, alcohol abuse, drug abuse, psychoses, depression).
- **Output:** the **van Walraven weighted comorbidity score** with the count of
  conditions, naming the mortality-association direction; the tile notes it is a
  complement to the live `charlson` index. Class A. Cross-links `charlson`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The weighted
  sums (IMPEDE-VTE, SAMe-TT2R2, van Walraven Elixhauser, BVAS) clamp their inputs to
  the published item set and ranges before summing; a blank required field renders a
  complete-the-fields fallback rather than a partial score read as complete.
- **`impede-vte` and `same-tt2r2` render their "risk stratification, not an order"
  framing as first-class output** ([spec-v59](spec-v59.md); [spec-v11](spec-v11.md)
  §5.3).
- **`elixhauser` handles the signed van Walraven weights** (some conditions carry
  negative weights) without sign errors, and reports both the weighted score and the
  raw count.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and the signed-weight edges.
- **These stratify and quantify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a treatment,
  thromboprophylaxis, or anticoagulation order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point / criteria
  models, each cited by journal + authors. The implementing session confirms the
  `ISSUER_PATTERN` result at build time and adds a `docs/citation-staleness.md` row
  only if a society issuer matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/prognosis-v189.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v189.js`; its `RV189` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hematology`, `oncology`,
  `rheumatology`, `nephrology`, `internal-medicine`, `cardiology`, `primary-care`,
  `pharmacy`, `quality-safety` — all already in the vocabulary.
- **Program close:** v189 closes the **Subspecialty Oncology & Hematology Staging**
  program (v187–v189, +15). `docs/scope-mdcalc-parity.md` records the deltas; the
  broader oncology / hematology tail continues in later slices.

## 5. Files touched

```
docs/spec-v189.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v189 RV189 into RENDERERS)
lib/prognosis-v189.js                    (new: msmart, impedeVte, bvas, sameTt2r2, elixhauser)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to charlson, rosendaal-ttr)
views/group-v189.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/msmart.test.js, impede-vte.test.js, bvas.test.js, same-tt2r2.test.js, elixhauser.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/prognosis-v189.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v189 delta; note the program close)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v189 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **mSMART
  standard-vs-high-risk pair**, an **IMPEDE-VTE band crossing**, a **BVAS with
  new/worse vs persistent items**, a **SAMe-TT2R2 crossing the ≥ 2 cut**, and an
  **Elixhauser example that exercises a negative van Walraven weight**.
- Every compute is finite-guarded (including the signed Elixhauser weights), routes
  through `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness
  with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v189 with the +5 delta.

## 7. Out of scope for v189

- **No treatment / thromboprophylaxis / anticoagulation order** — the tiles
  stratify and quantify; the prescription stays with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No administrative-coding automation** — `elixhauser` scores an entered
  comorbidity set; it does not map ICD codes to conditions (that mapping is a
  separate, data-sourced concern).
