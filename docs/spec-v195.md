# spec-v195.md — Cardiology, hepatology & electrolyte bedside indices: HEART Score, VTE-BLEED, the serum-ascites albumin gradient, and the glucose-corrected sodium (+4 tiles)

> Status: **PROPOSED (2026-06-30).** Fourth and **closing** feature spec of the
> **Acute Triage & Specialty Severity** program ([spec-v192](spec-v192.md) §1.1),
> implementing the **cardiology / hepatology / electrolyte bedside-index** cluster.
> Adds **4** deterministic tools that fill confirmed gaps: the catalog carries
> EDACS, GRACE, TIMI, HAS-BLED (proposed [spec-v191](spec-v191.md)), Maddrey/Lille,
> MELD 3.0, and the corrected-calcium tile, but not the HEART chest-pain score, the
> VTE-BLEED anticoagulation-bleeding score, the serum-ascites albumin gradient, or
> the glucose-corrected sodium. None duplicates a live tile (all four checked
> absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 4** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v195 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no disposition, anticoagulation, or correction
> order in Sophie's voice**). **Every point weight, coefficient, and correction
> constant is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

Four high-yield bedside indices span the acute-care day and are missing from the
catalog: the HEART score that dispositions chest pain, the VTE-BLEED score that
weighs bleeding risk on extended anticoagulation, the serum-ascites albumin
gradient that classifies ascites, and the glucose-corrected sodium that unmasks
true dysnatremia in hyperglycemia. v195 ships these four and closes the program.
Each is a transparent point score or formula — auditable, unit-tested at every
band — and each is decision support, **never a disposition, anticoagulation, or
correction order**.

## 2. What v195 adds (4 tiles)

### 2.1 `heart-score` — HEART Score for Major Adverse Cardiac Events

- **Citation:** Six AJ, Backus BE, Kelder JC. Chest pain in the emergency room:
  value of the HEART score. *Neth Heart J.* 2008;16(6):191-196. Validation: Backus
  BE, Six AJ, Kelder JC, et al. *Int J Cardiol.* 2013;168(3):2153-2158.
- **citationUrl:** https://doi.org/10.1007/BF03086144
- **Group:** G (clinical scoring & risk). **Specialties:** `cardiology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** the five components each 0–2 — History (slightly / moderately /
  highly suspicious), ECG (normal / non-specific repolarization / significant ST
  deviation), Age (< 45 / 45–64 / ≥ 65), Risk factors (0 / 1–2 / ≥ 3 or known
  atherosclerotic disease), and initial Troponin (≤ 1× / 1–3× / > 3× the upper
  limit of normal).
- **Output:** the **HEART Score (0–10)** banded **low (0–3) / moderate (4–6) / high
  (7–10)** with the associated 6-week MACE risk *(percentages verified at
  implementation, [spec-v97](spec-v97.md))*, naming the components; framed as a
  disposition aid, not an order. Class A. Cross-links `edacs`, `timi`, and `grace`.

### 2.2 `vte-bleed` — VTE-BLEED Score (bleeding risk on anticoagulation)

- **Citation:** Klok FA, Hösel V, Clemens A, et al. Prediction of bleeding events
  in patients with venous thromboembolism on stable anticoagulation treatment.
  *Eur Respir J.* 2016;48(5):1369-1376.
- **citationUrl:** https://doi.org/10.1183/13993003.00280-2016
- **Group:** G. **Specialties:** `hematology`, `cardiology`, `internal-medicine`,
  `pulmonology`.
- **Inputs:** the weighted criteria — active cancer (2), male with uncontrolled
  hypertension (1), anemia (1.5), history of bleeding (1.5), age ≥ 60 (1.5), and
  renal dysfunction (CrCl 30–60 mL/min, 1.5) *(verify weights at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **score**, dichotomized at the published cut-point (≥ 2 = elevated
  bleeding risk during stable anticoagulation), naming the contributors; framed as
  a bleeding-risk assessment to weigh against recurrence risk, **not** a reason to
  stop anticoagulation on its own. Class A. Cross-links `has-bled` and the VTE
  tiles.

### 2.3 `saag` — Serum-Ascites Albumin Gradient

- **Citation:** Runyon BA, Montano AA, Akriviadis EA, Antillon MR, Irving MA,
  McHutchison JG. The serum-ascites albumin gradient is superior to the
  exudate-transudate concept in the differential diagnosis of ascites. *Ann Intern
  Med.* 1992;117(3):215-220.
- **citationUrl:** https://doi.org/10.7326/0003-4819-117-3-215
- **Group:** E (clinical math). **Specialties:** `hepatology`, `gastroenterology`,
  `internal-medicine`.
- **Inputs:** serum albumin and ascitic-fluid albumin (same units). **SAAG =
  serum albumin − ascites albumin** (g/dL).
- **Output:** the **SAAG (g/dL)** classified at the 1.1 g/dL cut-point (**≥ 1.1 =
  portal hypertension**, ~97% accurate — cirrhosis, heart failure, Budd-Chiari;
  **< 1.1 =** non-portal — peritoneal carcinomatosis, TB, nephrotic, pancreatic),
  naming the likely categories. Class A. Cross-links `light-criteria`
  ([spec-v190](spec-v190.md)) and the hepatology tiles.

### 2.4 `corrected-sodium` — Glucose-Corrected Sodium (hyperglycemia)

- **Citation:** Katz MA. Hyperglycemia-induced hyponatremia — calculation of
  expected serum sodium depression. *N Engl J Med.* 1973;289(16):843-844. Revised
  factor: Hillier TA, Abbott RD, Barrett EJ. Hyponatremia: evaluating the
  correction factor for hyperglycemia. *Am J Med.* 1999;106(4):399-403.
- **citationUrl:** https://doi.org/10.1056/NEJM197310182891607
- **Group:** E. **Specialties:** `endocrinology`, `nephrology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** the measured sodium, the glucose, and the correction-factor selection
  (the traditional Katz 1.6 mmol/L per 100 mg/dL over 100, or the Hillier 2.4 for
  glucose > 400 mg/dL). Computes the **corrected sodium = measured Na⁺ + factor ×
  (glucose − 100) / 100**.
- **Output:** the **corrected sodium**, naming the factor used and stating that a
  normal corrected value in the face of a low measured value reflects
  translocational (dilutional) hyponatremia, not true sodium loss. Class A.
  Cross-links `effective-osmolality` ([spec-v188](spec-v188.md)) and the sodium /
  free-water-deficit tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The HEART
  and VTE-BLEED point sums clamp their inputs to the published ranges; SAAG and the
  corrected sodium guard their unit consistency; a blank required field renders a
  complete-the-fields fallback rather than a partial read as complete.
- **`vte-bleed` and `has-bled` both render the "weigh against recurrence /
  thromboembolic risk, do not stop on this alone" framing as first-class output**,
  so a high bleeding score is never read as a standalone anticoagulation-stop order
  ([spec-v59](spec-v59.md) output-safety; [spec-v11](spec-v11.md) §5.3).
- **`corrected-sodium` states the translocational-vs-true distinction**, so a normal
  corrected value is never misread as excluding a sodium disorder.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and the glucose/albumin edges.
- **These score and classify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a disposition,
  anticoagulation, or correction order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all four are **Class A** — fixed scores /
  formulas, each cited by journal + authors. The implementing session confirms the
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at build
  time and adds a `docs/citation-staleness.md` row only if a society issuer matches.
- **Build & gates (§6.1/§6.2):** the four computes live in a new
  `lib/bedsideindex-v195.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v195.js`; its `RV195` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 4**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`,
  `emergency-medicine`, `internal-medicine`, `hematology`, `pulmonology`,
  `hepatology`, `gastroenterology`, `endocrinology`, `nephrology` — all already in
  the vocabulary.
- **Program close:** v195 closes the **Acute Triage & Specialty Severity** program
  (v192–v195, nominal +16). `docs/scope-acute-triage-severity.md` records the v195
  delta and marks the program complete.

## 5. Files touched

```
docs/spec-v195.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v195 RV195 into RENDERERS)
lib/bedsideindex-v195.js                 (new: heartScore, vteBleed, saag, correctedSodium)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to edacs, has-bled, light-criteria, effective-osmolality)
views/group-v195.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+4 rows)
test/unit/heart-score.test.js, vte-bleed.test.js, saag.test.js, corrected-sodium.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/bedsideindex-v195.js to MODULES)
docs/audits/v12/*.md                     (4 spec-v11 audit logs)
docs/scope-acute-triage-severity.md      (record the v195 delta; mark the program complete)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+4; spec-progression line)
```

## 6. Acceptance criteria

v195 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all four ids are absent.
- All 4 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **HEART
  band crossing (low → moderate)**, a **VTE-BLEED crossing the ≥ 2 cut-point**, a
  **SAAG on both sides of 1.1 g/dL**, and a **corrected sodium with the Katz vs
  Hillier factor**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 4** and all catalog-truth surfaces agree;
  `docs/scope-acute-triage-severity.md` marks the v192–v195 program complete.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v195 with the +4 delta.

## 7. Out of scope for v195

- **No disposition order** — the HEART score stratifies chest-pain risk; the
  admit-vs-discharge decision stays with the clinician ([spec-v11](spec-v11.md)
  §5.3).
- **No anticoagulation decision** — VTE-BLEED weighs bleeding risk against
  recurrence risk; the start/stop/duration decision stays with the clinician and
  the patient.
- **No paracentesis or correction order** — SAAG classifies ascites and the
  corrected sodium unmasks translocational hyponatremia; the procedure and the
  fluid/electrolyte prescription stay with the clinician.
