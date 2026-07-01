# spec-v191.md — Dermatology & urology severity and staging: SCORTEN, AJCC melanoma T-stage, PI-RADS v2.1, and the Guy's stone score (+4 tiles)

> Status: **PROPOSED (2026-07-01).** Advances the
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment into two
> under-served surfaces (dermatology severity and urology staging). Adds **4**
> deterministic instruments, **each verified absent by a direct scan of `app.js`**
> (zero hits): the catalog carries the dermatology activity indices (`pasi`,
> `easi`, `scorad`, `dlqi`) and the prostate math (`psa-density`,
> `gleason-grade-group`, `damico-prostate-risk`) plus the stone-composition and
> `stone-nephrolithometry` tiles, but not the toxic-epidermal-necrolysis mortality
> score, the melanoma T-stage, the prostate-MRI assessment category, or the Guy's
> percutaneous-nephrolithotomy stone-complexity score.
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v191 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no biopsy, surgery, or prognosis order in
> Sophie's voice**). **Every criterion, stage boundary, and point weight is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

Four deterministic severity / staging instruments span the dermatology and urology
surfaces and are missing from the catalog: **SCORTEN** (the severity-of-illness
score that prognosticates toxic epidermal necrolysis), the **AJCC 8th-edition
melanoma T-stage** (from Breslow thickness and ulceration), **PI-RADS v2.1** (the
prostate-MRI assessment category that drives the biopsy decision), and the **Guy's
stone score** (the PCNL stone-complexity grade). Each is a transparent criteria set
or staging map — auditable, unit-tested at every boundary — and each is decision
support, **never a procedure or prognosis order**.

## 2. What v191 adds (4 tiles)

### 2.1 `scorten` — SCORTEN (Toxic Epidermal Necrolysis severity)

- **Citation:** Bastuji-Garin S, Fouchard N, Bertocchi M, Roujeau JC, Revuz J,
  Wolkenstein P. SCORTEN: a severity-of-illness score for toxic epidermal
  necrolysis. *J Invest Dermatol.* 2000;115(2):149-153.
- **citationUrl:** https://doi.org/10.1046/j.1523-1747.2000.00061.x
- **Group:** G (clinical scoring & risk). **Specialties:** `dermatology`, `burn`,
  `critical-care`.
- **Inputs:** the seven criteria, each 1 point — age ≥ 40, heart rate ≥ 120,
  malignancy present, body surface area detached > 10%, serum urea > 10 mmol/L
  (BUN > 28 mg/dL), serum bicarbonate < 20 mmol/L, serum glucose > 14 mmol/L
  (> 252 mg/dL).
- **Output:** the **SCORTEN (0–7)** mapped to the published in-hospital mortality
  bands (0–1 ≈ 3.2%, rising to ≥ 5 ≈ 90% *(verify percentages at implementation,
  [spec-v97](spec-v97.md))*), naming the criteria; best calculated on day 1 and
  day 3, which the tile notes. Class A. Cross-links the burn tiles.

### 2.2 `melanoma-t-stage` — AJCC 8th-Edition Melanoma T Category

- **Citation:** Gershenwald JE, Scolyer RA, Hess KR, et al. Melanoma staging:
  evidence-based changes in the AJCC eighth edition. *CA Cancer J Clin.*
  2017;67(6):472-492.
- **citationUrl:** https://doi.org/10.3322/caac.21409
- **Group:** G. **Specialties:** `dermatology`, `oncology`.
- **Inputs:** the **Breslow thickness (mm)** and **ulceration** present/absent.
  Maps to **T1 (≤ 1.0 mm; a/b by ulceration and the 0.8 mm split), T2 (> 1.0–2.0),
  T3 (> 2.0–4.0), T4 (> 4.0)** with the **a/b** suffix by ulceration *(verify the
  0.8 mm T1 split at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **T category (e.g., T2b)**, naming the thickness and ulceration;
  the tile states this is the **T** element only, not the full TNM stage. Class A.
  Cross-links `gleason-grade-group` and the oncology staging tiles.

### 2.3 `pi-rads` — PI-RADS v2.1 (Prostate MRI Assessment)

- **Citation:** Turkbey B, Rosenkrantz AB, Haider MA, et al. Prostate Imaging
  Reporting and Data System version 2.1 (PI-RADS v2.1). *Eur Urol.*
  2019;76(3):340-351.
- **citationUrl:** https://doi.org/10.1016/j.eururo.2019.02.033
- **Group:** G. **Specialties:** `urology`, `radiology`.
- **Inputs:** the zone (peripheral vs transition), the dominant sequence score
  (DWI for peripheral, T2 for transition, each 1–5), and the DCE (positive/negative)
  or T2 findings used to upgrade a score-3 lesion per the v2.1 rules.
- **Output:** the **PI-RADS assessment category (1–5)** with the
  clinically-significant-cancer likelihood the category carries and the usual
  biopsy-consideration threshold (≥ 3, with ≥ 4 more strongly *(verify at
  implementation, [spec-v97](spec-v97.md))*), naming the driving sequence; framed as
  a reporting category, not a biopsy order. Class A. Cross-links `psa-density`.

### 2.4 `guys-stone-score` — Guy's Stone Score (PCNL complexity)

- **Citation:** Thomas K, Smith NC, Hegarty N, Glass JM. The Guy's stone score —
  grading the complexity of percutaneous nephrolithotomy procedures. *Urology.*
  2011;78(2):277-281.
- **citationUrl:** https://doi.org/10.1016/j.urology.2010.12.026
- **Group:** G. **Specialties:** `urology`.
- **Inputs:** the stone configuration and anatomy — a solitary stone in a
  mid/upper-pole or renal pelvis; multiple stones or a lower-pole stone; a staghorn
  calculus or a stone in an abnormal anatomy; and a staghorn in abnormal anatomy or
  spina bifida / spinal-injury patients — selecting the applicable grade.
- **Output:** the **Guy's stone score (Grade I–IV)** with the associated
  stone-free-rate expectation, naming the anatomy; the tile notes it grades
  **complexity**, complementing the live `stone-nephrolithometry` (S.T.O.N.E.).
  Class A. Cross-links `stone-nephrolithometry`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** SCORTEN
  clamps its seven binary criteria and the lab thresholds; `melanoma-t-stage`
  guards the Breslow thickness > 0 before the band lookup; the categorical tiles map
  a validated input set to a fixed grade; outside these each renders a
  complete-the-fields fallback, never a `NaN` or an out-of-range band.
- **`pi-rads` implements the v2.1 upgrade rules exactly** (the DCE / T2 tie-break for
  a score-3 lesion by zone), so a category is never assigned by the wrong sequence
  ([spec-v59](spec-v59.md)).
- **`melanoma-t-stage` states it is the T element only**, so a category is never
  read as a full stage.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the thickness and score boundaries.
- **These score, stage, and classify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a biopsy, surgery, or
  prognosis order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed criteria /
  staging maps, each cited by journal + authors. The **AJCC** melanoma and **PI-RADS**
  (ACR) references name issuers; the implementing session confirms whether either
  trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md); the ACR
  precedent is the [spec-v165](spec-v165.md) TI-RADS tiles) at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/dermuro-v191.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v191.js`; its `RV191` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `dermatology`, `burn`,
  `critical-care`, `oncology`, `urology`, `radiology` — all already in the
  vocabulary.

## 5. Files touched

```
docs/spec-v191.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v191 RV191 into RENDERERS)
lib/dermuro-v191.js                      (new: scorten, melanomaTStage, piRads, guysStoneScore)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to psa-density, stone-nephrolithometry)
views/group-v191.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/scorten.test.js, melanoma-t-stage.test.js, pi-rads.test.js, guys-stone-score.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/dermuro-v191.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+4; record the v191 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v191 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent (as verified at draft).
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **SCORTEN
  crossing a mortality band**, a **melanoma T1a-vs-T2b pair (the 0.8 mm and
  ulceration logic)**, a **PI-RADS score-3 upgrade example**, and a **Guy's Grade
  I-vs-IV pair**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v191 with the +4 delta.

## 7. Out of scope for v191

- **No biopsy or surgery order** — PI-RADS and the Guy's score inform the biopsy /
  procedure discussion; the decision stays with the clinician
  ([spec-v11](spec-v11.md) §5.3).
- **No image interpretation** — `pi-rads` and `melanoma-t-stage` consume entered
  findings (sequence scores, Breslow thickness); they do not read the MRI or the
  pathology slide.
- **No full TNM stage** — `melanoma-t-stage` ships the T element; nodal and
  metastatic staging are separate.
