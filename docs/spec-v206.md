# spec-v206.md — Traumatic brain injury & stroke prognosis: the Rotterdam CT score, the Marshall CT classification, the FUNC score, the iScore, and the Essen Stroke Risk Score (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Third feature spec of the **Frontline & Bedside
> Decision Instruments** program ([spec-v204](spec-v204.md) §1.1). Adds **5**
> deterministic neurotrauma and stroke prognostic instruments. **Each tile was verified
> absent by a direct scan of `app.js`** (zero id / name / keyword hits at draft): the
> catalog carries `gcs`, `gcs-pupils`, `four-score`, `nihss`, `ich-score`,
> `ich-volume-abc2`, `modified-fisher`, `hunt-hess-wfns`, `phases`, `abcd2`,
> `dragon-stroke`, `thrive-stroke`, `hat-score`, and `sedan-score`, but **not** the
> Rotterdam CT score, the Marshall CT classification, the FUNC score, the iScore, or the
> Essen Stroke Risk Score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v206 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no neurosurgical, thrombolysis, thrombectomy, imaging,
> or withdrawal-of-care order in Sophie's voice** — these estimate prognosis; the decision
> stays with the neurologist, the neurosurgeon, and the patient / family). **Every point
> weight, coefficient, and outcome band is re-fetched and cross-verified against ≥2
> independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain values
> carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the acute stroke-severity and hemorrhage-grading scales (NIHSS, GCS,
ICH score, modified Fisher, Hunt-Hess/WFNS) but not the CT-based head-injury grading
systems or the multivariable outcome models that convert a snapshot into a quantified
prognosis. This slice adds the two canonical head-CT scores every trauma and neurocritical
service uses (Rotterdam, Marshall), the point model for functional recovery after
intracerebral hemorrhage (FUNC), and two ischemic-stroke prognostic engines — one for
early mortality (iScore) and one for recurrent vascular events after a stroke or TIA
(Essen). Each is a transparent computation and each is decision support — **never a
neurosurgical, thrombolysis, thrombectomy, imaging, or care-limitation order**.

## 2. What v206 adds (5 tiles)

### 2.1 `rotterdam-ct` — Rotterdam CT score (traumatic brain injury)

- **Citation:** Maas AIR, Hukkelhoven CWPM, Marshall LF, Steyerberg EW. Prediction of
  outcome in traumatic brain injury with computed tomographic characteristics: a
  comparison between the computed tomographic classification and combinations of computed
  tomographic predictors. *Neurosurgery.* 2005;57(6):1173-1182.
- **citationUrl:** https://doi.org/10.1227/01.neu.0000186013.63046.6b
- **Group:** G (clinical scoring & risk). **Specialties:** `neurosurgery`,
  `neurology`, `emergency-medicine`, `critical-care`.
- **Inputs:** basal cisterns (normal +0 / compressed +1 / absent +2), midline shift
  (≤ 5 mm +0 / > 5 mm +1), epidural mass lesion (present +0 / **absent +1**, inverted),
  and intraventricular blood or traumatic SAH (absent +0 / present +1); the subtotal is
  incremented by +1 by convention *(verify the +1 convention and inversion at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **Rotterdam total (1–6)** with the published 6-month mortality by score
  (rising from ≈ 5% at 1 to ≈ 61% at 6) *(the per-score mortality is transcribed verbatim
  at implementation, [spec-v97](spec-v97.md))*, naming the CT findings that contributed;
  framed as the additive head-CT prognostic scale that outperforms the older Marshall
  categorical scheme and is embedded in modern TBI outcome models. Class A. Cross-links
  `marshall-ct`, `gcs-pupils`, `four-score`.

### 2.2 `marshall-ct` — Marshall CT classification (traumatic brain injury)

- **Citation:** Marshall LF, Marshall SB, Klauber MR, et al. A new classification of head
  injury based on computerized tomography. *J Neurosurg.* 1991;75(Suppl):S14-S20.
- **citationUrl:** https://doi.org/10.3171/sup.1991.75.1s.0s14
- **Group:** G. **Specialties:** `neurosurgery`, `neurology`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** a single categorical choice among the six classes — Diffuse Injury I (no
  visible pathology), II (cisterns present, shift 0–5 mm, no high/mixed-density lesion
  > 25 cc), III (cisterns compressed/absent, shift 0–5 mm), IV (shift > 5 mm), Evacuated
  Mass Lesion (V), and Non-evacuated Mass Lesion (VI, high/mixed-density > 25 cc) — driven
  by cistern status, midline shift, and the presence / evacuation of a mass lesion.
- **Output:** the **Marshall category (I–VI)** with the monotonically rising mortality
  across categories *(the exact per-category TCDB mortality percentages are transcribed
  from the primary paper at implementation, [spec-v97](spec-v97.md))*, naming the defining
  finding; framed as the ordinal CT descriptor that predates and complements the Rotterdam
  score (categorical, not additive). Class A. Cross-links `rotterdam-ct`,
  `ich-volume-abc2`, `gcs`.

### 2.3 `func-score` — FUNC score (functional outcome after intracerebral hemorrhage)

- **Citation:** Rost NS, Smith EE, Chang Y, et al. Prediction of functional outcome in
  patients with primary intracerebral hemorrhage: the FUNC score. *Stroke.*
  2008;39(8):2304-2309.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.107.512202
- **Group:** G. **Specialties:** `neurology`, `neurosurgery`, `critical-care`.
- **Inputs:** ICH volume (< 30 cc +4, 30–60 cc +2, > 60 cc +0), age (< 70 +2, 70–79 +1,
  ≥ 80 +0), ICH location (lobar +2, deep +1, infratentorial +0), GCS (≥ 9 +2, ≤ 8 +0), and
  pre-ICH cognitive impairment (no +1, yes +0) *(verify weights at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **FUNC total (0–11)** with the proportion achieving functional
  independence (GOS ≥ 4) at 90 days by band — **0–4 → 0%, 5–7 → ~29%, 8 → ~48%,
  9–10 → ~75%, 11 → ~95% (survivors-only column; the entire-cohort column runs
  0/13/42/66/82%; the implementing session picks and labels one column,
  [spec-v97](spec-v97.md))** — naming the contributors; framed as the point model for the
  likelihood of meaningful recovery after ICH. Class A. Cross-links `ich-score`,
  `ich-volume-abc2`.

### 2.4 `iscore` — iScore (ischemic-stroke mortality)

- **Citation:** Saposnik G, Kapral MK, Liu Y, et al. IScore: a risk score to predict death
  early after hospitalization for an acute ischemic stroke. *Circulation.*
  2011;123(7):739-749.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.110.983353
- **Group:** G. **Specialties:** `neurology`, `stroke`, `internal-medicine`.
- **Inputs:** age (1 point per year), sex, stroke severity (Canadian Neurological Scale
  band, or NIHSS converted), stroke subtype (TOAST: lacunar / non-lacunar / undetermined),
  atrial fibrillation, congestive heart failure, prior MI, cancer, renal dialysis,
  pre-admission dependency, and admission glucose ≥ 7.5 mmol/L (135 mg/dL); the 30-day and
  1-year models carry distinct weights *(the full point tables for both horizons are
  transcribed verbatim from Circulation Table 3 at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **iScore total** (age-dominated, no fixed ceiling) mapped to the
  estimated **30-day and 1-year mortality** *(the score→percent function / interval lookup
  is transcribed at implementation, [spec-v97](spec-v97.md))*, naming the dominant
  contributors; framed as a validated early-mortality engine for acute ischemic stroke.
  Class A. Cross-links `nihss`, `thrive-stroke`.

### 2.5 `essen-stroke-risk` — Essen Stroke Risk Score (recurrent vascular events)

- **Citation:** Weimar C, Diener HC, Alberts MJ, et al. The Essen stroke risk score
  predicts recurrent cardiovascular events: a validation within the REACH Registry.
  *Stroke.* 2009;40(2):350-354. **Derivation:** from the ischemic-stroke subset of the
  CAPRIE trial (*Lancet.* 1996;348(9038):1329-1339).
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.108.521419
- **Group:** G. **Specialties:** `neurology`, `stroke`, `primary-care`.
- **Inputs:** age (< 65 +0, 65–75 +1, > 75 +2), arterial hypertension (+1), diabetes
  mellitus (+1), prior myocardial infarction (+1), other cardiovascular disease except MI
  and atrial fibrillation (+1), peripheral arterial disease (+1), current smoker (+1), and
  an additional prior TIA or ischemic stroke beyond the qualifying event (+1) *(the
  arithmetic maximum is 9; some sources label it a "10-point scale" — verify the range and
  the smoking-item definition at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **Essen total (0–9)** with the risk dichotomy — **low < 3, high ≥ 3**
  (the high group carries roughly a doubled annual recurrent-stroke and combined-vascular-
  event rate) — naming the contributors; framed as a bedside score that flags post-stroke
  patients for intensified secondary prevention. Class A. Cross-links `abcd2`, `chads-vasc`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Rotterdam,
  Marshall, FUNC, and Essen are bounded point / category models; iScore is age-dominated
  and unbounded above — each clamps its inputs to the published domains and renders a
  complete-the-fields fallback for a missing item rather than a `NaN`/`Infinity`.
- **Each tile reports which band / category applies and names the contributing items**
  ([spec-v59](spec-v59.md)) — the Rotterdam CT findings, the Marshall class, the FUNC
  contributors, the iScore dominant weights, the Essen risk factors — so a result is never
  read without its basis.
- **All five render prognosis, not orders** — none authors a neurosurgical, thrombolysis,
  thrombectomy, imaging, or withdrawal-of-care order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture
  note. The imaging findings (cisterns, shift, lesion, ICH volume) are entered by the user
  so each tile stays a deterministic function.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at age / volume extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/category models,
  each cited by journal + authors. The implementing session confirms whether any citation
  trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/neuro-prognosis-v206.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v206.js`; its `RV206` export is spread
  into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` +
  5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `neurology`, `neurosurgery`,
  `stroke`, `emergency-medicine`, `critical-care`, `internal-medicine`, `primary-care`;
  the implementing session adds any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v206.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v206 RV206 into RENDERERS)
lib/neuro-prognosis-v206.js              (new: rotterdamCt, marshallCt, funcScore, iScore, essenStrokeRisk)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to ich-score, nihss, abcd2)
views/group-v206.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/rotterdam-ct.test.js, marshall-ct.test.js, func-score.test.js, iscore.test.js, essen-stroke-risk.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-prognosis-v206.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v206 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v206 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Rotterdam
  spanning a mortality range**, a **Marshall across categories**, a **FUNC crossing its
  outcome bands**, an **iScore with the 30-day and 1-year outputs shown**, and an **Essen
  crossing the < 3 / ≥ 3 threshold**.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v206 with the +5 delta.

## 7. Out of scope for v206

- **No neurosurgical / thrombolysis / thrombectomy / imaging / care-limitation order** —
  the tiles estimate prognosis; the operate/lyse/retrieve/limit decisions stay with the
  neurologist, the neurosurgeon, and the patient / family ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — the GWTG-Stroke in-hospital-mortality
  score is explicitly deferred here: its per-variable point weights live only in a
  paywalled table and cannot be reproduced from ≥ 2 open sources ([spec-v97](spec-v97.md)).
