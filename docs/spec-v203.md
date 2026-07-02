# spec-v203.md — Perioperative, fracture & frailty risk: the SORT, the Garvan fracture-risk calculator, the ABCD3-I score, the Edmonton Frail Scale, and the Duke Activity Status Index (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Closing feature spec of the **Deep Subspecialty
> Quantitation** program ([spec-v199](spec-v199.md) §1.1). Adds **5** deterministic
> perioperative, fracture, cerebrovascular, and frailty risk instruments. **Each tile
> was verified absent by a direct scan of `app.js`** (zero id / name / keyword hits at
> draft): the catalog carries `rcri`, `gupta-mica`, `ariscat`, `arozullah-pneumonia`,
> `surgical-apgar`, `possum`, `abcd2`, and `charlson` (and does **not** carry FRAX),
> but **not** the
> Surgical Outcome Risk Tool, the Garvan fracture-risk calculator, the ABCD3-I score,
> the Edmonton Frail Scale, or the Duke Activity Status Index.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v203 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no surgery, anticoagulation, imaging, bone-therapy,
> or disposition order in Sophie's voice**). **Every point weight, coefficient, and
> band threshold is re-fetched and cross-verified against ≥2 independent open sources
> at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing session
> **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The common perioperative scores are carried; this final slice adds the instruments
that gate a shared decision: a preoperative 30-day-mortality estimate from six routine
variables (SORT), the osteoporosis fracture-risk calculator built on falls and prior-
fracture history (Garvan), the imaging-augmented early-stroke-risk score after TIA
(ABCD3-I), a validated frailty screen a geriatrician scores at the bedside (Edmonton
Frail Scale), and a self-report functional-capacity questionnaire that estimates
peak VO₂ / METs for preoperative and cardiac assessment (Duke Activity Status Index).
Each is a transparent computation, and each is decision support — **never a surgical,
anticoagulation, imaging, or bone-therapy order**.

## 2. What v203 adds (5 tiles)

### 2.1 `sort-mortality` — Surgical Outcome Risk Tool (SORT)

- **Citation:** Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR. Development and
  validation of the Surgical Outcome Risk Tool (SORT). *Br J Surg.*
  2014;101(13):1774-1783.
- **citationUrl:** https://doi.org/10.1002/bjs.9638
- **Group:** G (clinical scoring & risk). **Specialties:** `surgery`, `anesthesia`,
  `periop`.
- **Inputs:** ASA physical-status class, urgency (elective / expedited / urgent /
  immediate), high-risk surgical specialty (yes/no), severity (minor-intermediate vs
  major-complex), cancer (yes/no), and age ≥ 65 / ≥ 80 bands — the six predictors.
- **Output:** the **estimated 30-day mortality (%)** from the published logistic model
  `logit = −7.366 + …` *(the full coefficient set is transcribed verbatim at
  implementation, [spec-v97](spec-v97.md))*, naming the largest contributors; framed as
  a preoperative mortality estimate from routinely available variables. Class A.
  Cross-links `rcri`, `possum`, `surgical-apgar`.

### 2.2 `garvan-fracture` — Garvan fracture-risk calculator (5- and 10-year)

- **Citation:** Nguyen ND, Frost SA, Center JR, Eisman JA, Nguyen TV. Development of
  prognostic nomograms for individualizing 5-year and 10-year fracture risks.
  *Osteoporos Int.* 2008;19(10):1431-1444.
- **citationUrl:** https://doi.org/10.1007/s00198-008-0588-0
- **Group:** G. **Specialties:** `endocrinology`, `orthopedics`, `geriatrics`,
  `primary-care`.
- **Inputs:** age, sex, number of prior fragility fractures (0 / 1 / 2 / ≥ 3), number
  of falls in the past year (0 / 1 / 2 / ≥ 3), and either femoral-neck bone-mineral-
  density T-score **or** body weight (the model accepts either).
- **Output:** the **5- and 10-year probability (%)** of any osteoporotic fracture and
  of hip fracture from the published Cox model *(the coefficients and baseline survival
  are transcribed verbatim at implementation, [spec-v97](spec-v97.md))*, naming the
  contributors; framed as a fracture-risk estimate that — unlike FRAX — weights falls
  and counts prior fractures (FRAX is deliberately not carried; see §7). Class A.
  Cross-links `charlson`.

### 2.3 `abcd3-i` — ABCD3-I score (early stroke risk after TIA)

- **Citation:** Merwick Á, Albers GW, Amarenco P, et al. Addition of brain and carotid
  imaging to the ABCD² score to identify patients at early risk of stroke after
  transient ischaemic attack: a multicentre observational study. *Lancet Neurol.*
  2010;9(11):1060-1069.
- **citationUrl:** https://doi.org/10.1016/S1474-4422(10)70240-4
- **Group:** G. **Specialties:** `neurology`, `stroke`, `emergency-medicine`.
- **Inputs:** the ABCD² items — **A**ge ≥ 60 (+1), **B**lood pressure ≥ 140/90 (+1),
  **C**linical features (unilateral weakness +2, speech disturbance without weakness
  +1), **D**uration (≥ 60 min +2, 10–59 min +1), **D**iabetes (+1) — plus the two
  ABCD3-I additions: **dual TIA** (a second TIA within 7 days, +2), ipsilateral ≥ 50%
  **carotid stenosis** (+2), and **abnormal DWI** on MRI (+2). Total range 0–13
  *(verify weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **ABCD3-I total (0–13)** with the published early-stroke-risk strata,
  naming the contributors; framed as the imaging-augmented refinement of ABCD². Class
  A. Cross-links `abcd2`, `nihss`.

### 2.4 `edmonton-frail` — Edmonton Frail Scale

- **Citation:** Rolfson DB, Majumdar SR, Tsuyuki RT, Tahir A, Rockwood K. Validity and
  reliability of the Edmonton Frail Scale. *Age Ageing.* 2006;35(5):526-529.
- **citationUrl:** https://doi.org/10.1093/ageing/afl041
- **Group:** G. **Specialties:** `geriatrics`, `internal-medicine`, `periop`.
- **Inputs:** the nine domains — cognition (clock-drawing result entered), general
  health (hospitalizations, self-rated health), functional independence, social
  support, medication use (polypharmacy, forgetting), nutrition, mood, continence, and
  functional performance (timed up-and-go result entered) — each scored per the
  published grid.
- **Output:** the **Edmonton Frail Scale total (0–17)** with the frailty bands — **not
  frail 0–5, apparently vulnerable 6–7, mild 8–9, moderate 10–11, severe ≥ 12**
  *(verify the band cut-points at implementation, [spec-v97](spec-v97.md))* — naming the
  contributing domains; framed as a validated multidomain frailty screen. The clock-
  drawing and timed-up-and-go sub-results are entered by the user, keeping the tile a
  deterministic point sum. Class A. Cross-links `charlson`, `clinical-frailty-scale`.

### 2.5 `dasi` — Duke Activity Status Index (functional capacity / peak VO₂)

- **Citation:** Hlatky MA, Boineau RE, Higginbotham MB, et al. A brief self-
  administered questionnaire to determine functional capacity (the Duke Activity Status
  Index). *Am J Cardiol.* 1989;64(10):651-654.
- **citationUrl:** https://doi.org/10.1016/0002-9149(89)90496-7
- **Group:** G. **Specialties:** `cardiology`, `anesthesia`, `periop`,
  `physical-medicine-rehabilitation`.
- **Inputs:** the 12 weighted yes/no activity items (personal care, walking indoors,
  walking a block or two, climbing stairs / walking uphill, running a short distance,
  light housework, moderate housework, heavy housework, yard work, sexual relations,
  moderate recreation, strenuous sports), each with its published weight.
- **Output:** the **DASI total (0–58.2)**, the derived **peak VO₂** (mL/kg/min) =
  `0.43 × DASI + 9.6` and the estimated **METs** (peak VO₂ / 3.5) *(verify the
  regression constants at implementation, [spec-v97](spec-v97.md))*, naming the items
  the patient can and cannot do; framed as a self-report functional-capacity estimate
  used in preoperative and cardiac assessment. Class A. Cross-links `rcri`,
  `mets-activity`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** SORT and Garvan
  carry logistic/Cox exponentials; each clamps its inputs to the published domains and
  renders a complete-the-fields fallback for a blank or out-of-domain input rather than
  a `NaN`/`Infinity`. Probabilities are clamped to [0, 100] %.
- **Each tile reports which band applies and names the contributing items**
  ([spec-v59](spec-v59.md)) — the SORT predictors, the Garvan risk factors, the ABCD3-I
  letters and imaging additions, the Edmonton domains, the DASI activities — so a
  result is never read without its basis.
- **All five render risk/assessment, not orders** — none authors a surgical,
  anticoagulation, imaging, or bone-therapy order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture
  note. The Edmonton Frail Scale and DASI keep any performance sub-test (clock-draw,
  timed-up-and-go) as a user-entered result so the tile stays a deterministic function.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/coefficient
  models, each cited by journal + authors. The implementing session confirms whether
  any citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md))
  and adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/periop-frailty-v203.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v203.js`; its `RV203` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `surgery`, `anesthesia`,
  `periop`, `endocrinology`, `orthopedics`, `geriatrics`, `primary-care`, `neurology`,
  `stroke`, `emergency-medicine`, `internal-medicine`, `cardiology`,
  `physical-medicine-rehabilitation` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v203.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v203 RV203 into RENDERERS)
lib/periop-frailty-v203.js               (new: sort, garvan, abcd3i, edmontonFrail, dasi)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to rcri, abcd2, charlson)
views/group-v203.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/sort-mortality.test.js, garvan-fracture.test.js, abcd3-i.test.js, edmonton-frail.test.js, dasi.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/periop-frailty-v203.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v203 delta; close the Deep Subspecialty Quantitation program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v203 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **SORT spanning
  a mortality range**, a **Garvan 5- vs 10-year pair**, an **ABCD3-I crossing risk
  strata**, an **Edmonton Frail Scale across its bands**, and a **DASI with the peak-VO₂
  / METs derivation shown**.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v203 with the +5 delta and notes the Deep Subspecialty Quantitation
  program (v199–v203) closed.

## 7. Out of scope for v203

- **No surgical / anticoagulation / imaging / bone-therapy / disposition order** — the
  tiles estimate risk and screen; the operate/anticoagulate/scan/treat decisions stay
  with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — FRAX is excluded because its algorithm
  is not openly reproducible; the Garvan calculator is included precisely because its
  nomogram coefficients are published. Any instrument whose weights are not reproducible
  from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md).
```

<!-- Program note: v199–v203 close the Deep Subspecialty Quantitation program, adding
25 deterministic specialist calculators (heme-onc myeloid prognosis, advanced
critical-care severity & acid-base, hepatology & GI-bleed prognosis, cardiovascular &
HF risk engines, and perioperative / fracture / frailty risk). Each was verified absent
at draft; each is Class A, cited, finite-guarded, and order-free. -->
