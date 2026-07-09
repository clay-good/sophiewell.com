# spec-v265.md — Predicting massive transfusion at the trauma bay: the Assessment of Blood Consumption score, the McLaughlin score, and the Prince of Wales Hospital score (+3 tiles)

> Status: **PARTIALLY SHIPPED (2026-07-09, +1 of 3; McLaughlin & PWH parked).** Second
> feature spec of the **Advanced Sub-specialty Prognostic Instruments** program
> ([spec-v264](spec-v264.md) §1.1). Proposes **3** MTP-activation instruments; **1
> shipped** (the ABC score), **2 parked** (McLaughlin, PWH). **Each id was verified
> absent** ([spec-v85 §6.2](spec-v85.md)).
>
> **Shipped:** `abc-transfusion-score` — the four-variable bedside trigger is fully
> reproducible (Nunez 2009; four non-weighted binary items, >= 2 predicts MT) and is live.
>
> **Parked (spec-v97 / [spec-v259](spec-v259.md) precedent):** the exact values of the
> other two cannot be reproduced from >= 2 open, fetchable sources in-session:
>
> - **`mclaughlin-score`** — the logistic intercept **sign is dropped** in every reachable
>   secondary render (printed as `+1.576`, which yields an implausible ~83% baseline; the
>   true value is almost certainly `-1.576`), and the count-to-probability table lives only
>   in the paywalled primary (McLaughlin 2008 *J Trauma*).
> - **`pwh-mt-score`** — the per-variable point weights live only in the paywalled primary
>   (Rainer 2011 *Resuscitation*); open validations confirm the seven variables and the
>   `>= 2.5` cutoff but decline the weights.
>
> **Re-open condition:** ship each parked tile when its weight table / logistic
> coefficients are reproducible from >= 2 open, fetchable sources, or are supplied directly.
>
> Catalog effect this slice: **live `UTILITIES.length` + 1** (ABC only), enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)); the remaining +2 lands when the parked
> tiles re-open.
>
> Every prior spec remains in force. v265 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no transfusion, protocol-activation, or blood-product
> order in Sophie's voice** — these compute a probability or trigger category; the decision
> to activate the MTP stays with the trauma team). **Every variable, weight, and threshold
> is re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at implementation,
> [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the two most-cited weighted massive-transfusion models (TASH, RABT),
the shock index, and the trauma-severity engines (ISS/RTS, TRISS, Revised Baux), but it
does **not** carry the three complementary instruments that bracket the accuracy/simplicity
tradeoff at MTP activation: the **ABC score**, a four-variable trigger computable before
any lab returns; the **McLaughlin score**, the lab-anchored logistic model derived on
combat casualties; and the **PWH score**, the weighted seven-variable civilian model. Each
is a transparent, externally-validated instrument, freely reproducible from open sources,
and each is decision support — **never a transfusion or protocol-activation order**.

## 2. What v265 adds (3 tiles)

### 2.1 `abc-transfusion-score` — Assessment of Blood Consumption (ABC) score

- **Citation:** Nunez TC, Voskresensky IV, Dossett LA, Shinall R, Dutton WD, Cotton BA.
  Early prediction of massive transfusion in trauma: simple as ABC (assessment of blood
  consumption)? *J Trauma.* 2009;66(2):346-352.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/19204506/
- **Group:** G. **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`,
  `transfusion-medicine`.
- **Inputs — 4 non-weighted binary variables** *(each item is transcribed verbatim from the
  primary paper at implementation, [spec-v97](spec-v97.md))*: penetrating mechanism of
  injury, systolic blood pressure ≤ 90 mmHg on ED arrival, heart rate ≥ 120 bpm on ED
  arrival, and a positive FAST (Focused Assessment with Sonography for Trauma) examination.
- **Output:** the **ABC total (0–4)** with the **≥ 2 = predicts massive transfusion**
  threshold flagged (≈ 75 % sensitivity / 86 % specificity in the derivation cohort),
  naming the items that fired. Framed as the fastest bedside MTP trigger — computable from
  mechanism, two vitals, and bedside ultrasound before any laboratory value returns; **it
  reports a trigger category, never a transfusion order** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `tash-score`, `rabt-score`, `shock-index`.

### 2.2 `mclaughlin-score` — McLaughlin score

- **Citation:** McLaughlin DF, Niles SE, Salinas J, et al. A predictive model for massive
  transfusion in combat casualty patients. *J Trauma.* 2008;64(2 Suppl):S57-S63.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/18376173/
- **Group:** G. **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`,
  `transfusion-medicine`.
- **Inputs — 4 non-weighted dichotomous variables** *(each threshold is transcribed
  verbatim from the primary paper at implementation, [spec-v97](spec-v97.md))*: heart rate
  > 105 bpm, systolic blood pressure < 110 mmHg, arterial pH < 7.25, and hematocrit
  < 32.0 %.
- **Output:** the **count of factors present (0–4)** mapped to the **logistic probability of
  massive transfusion** from the derivation model *(the probability lookup / logistic
  coefficients are transcribed at implementation, [spec-v97](spec-v97.md))*, rising steeply
  with each additional factor, naming the items that fired. Framed as the lab-anchored
  model (derivation AUC ≈ 0.84) that trades bedside speed for the discrimination that an
  arterial blood gas and hematocrit add; the tile notes its combat-casualty derivation as a
  generalizability caveat. **It reports a probability, never a transfusion order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `abc-transfusion-score`,
  `pwh-mt-score`.

### 2.3 `pwh-mt-score` — Prince of Wales Hospital (PWH) massive-transfusion score

- **Citation:** Rainer TH, Ho AM, Yeung JH, et al. Early risk stratification of patients
  with major trauma requiring massive blood transfusion resuscitation. *Resuscitation.*
  2011;82(6):724-729.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/21411215/
- **Group:** G. **Specialties:** `trauma-surgery`, `emergency-medicine`, `critical-care`,
  `transfusion-medicine`.
- **Inputs — 7 weighted variables** *(each weight is transcribed verbatim from the primary
  paper at implementation, [spec-v97](spec-v97.md))*: heart rate ≥ 120 bpm, systolic blood
  pressure ≤ 90 mmHg, Glasgow Coma Scale ≤ 8, displaced pelvic fracture, a CT- or
  FAST-positive free-fluid finding, base deficit > 5 mmol/L, and the hemoglobin bands
  (≤ 7.0 g/dL and 7.1–10.0 g/dL).
- **Output:** the **PWH total** with the derivation cutoff for predicted massive transfusion
  flagged (derivation AUC ≈ 0.92) *(the exact score threshold is transcribed at
  implementation, [spec-v97](spec-v97.md))*, naming the driving items. Framed as the
  weighted civilian model that, with TASH, sits at the accurate-but-data-hungry end of the
  MTP-trigger spectrum opposite the ABC score. **It reports a trigger category, never a
  transfusion order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `tash-score`,
  `abc-transfusion-score`, `mclaughlin-score`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** ABC is a bounded 0–4
  integer sum, McLaughlin a bounded 0–4 factor count mapped to a clamped probability, PWH a
  bounded weighted sum — each renders a "complete the fields" fallback for a missing item
  rather than a `NaN`, and clamps probabilities to [0, 100] %.
- **Each tile reports which items fired and the resulting category or probability**
  ([spec-v59](spec-v59.md)) — the ABC ≥ 2 trigger, the McLaughlin probability gradient, the
  PWH weighted total — so a result is never read without its basis.
- **All three render a category or probability, not an order** — none authors a transfusion,
  protocol-activation, or blood-product order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the ABC ≥ 2 cutoff, the McLaughlin 0–4 factor edges, and the PWH
  hemoglobin-band boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed variable/threshold
  models, each cited by journal + authors. The implementing session confirms whether any
  citation trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds
  a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/massive-transfusion-v265.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`. The
  McLaughlin logistic coefficients and the PWH weight table live as named constants with the
  source table cited in a comment. Renderers live in a new `views/group-v265.js`; its `RV265`
  export is spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all catalog-truth surfaces using the **live
  `UTILITIES.length` + 3**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary; all tags used here already exist in
  `ALLOWED_SPECIALTIES`.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired items and category
  so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v265.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v265 RV265 into RENDERERS)
lib/massive-transfusion-v265.js          (new: abcTransfusion, mclaughlin, pwhMt + McLaughlin logistic / PWH weight constants)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to tash-score, rabt-score)
views/group-v265.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/abc-transfusion-score.test.js, mclaughlin-score.test.js, pwh-mt-score.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/massive-transfusion-v265.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v265 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v265 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **ABC crossing the
  ≥ 2 trigger**, a **McLaughlin spanning a low and a high factor count with its probability
  gradient**, and a **PWH crossing its derivation cutoff with a hemoglobin-band
  contribution**.
- The transcribed ABC items, McLaughlin thresholds and logistic coefficients, and the PWH
  weight table are reproduced from the primary sources and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)).
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v265 with the +3 delta.

## 7. Out of scope for v265

- **No transfusion / protocol-activation / blood-product order** — the tiles compute a
  probability or trigger category; the decision to activate the MTP and order products stays
  with the trauma team ([spec-v11](spec-v11.md) §5.3).
- **No institution-specific ratio protocol** — the 1:1:1 vs 1:1:2 product-ratio question
  (PROPPR) and local MTP pack composition are deferred; this slice adds only the three
  openly-published prediction instruments. If any weight table or logistic coefficient set
  cannot be reproduced from ≥ 2 open, fetchable sources at implementation, that tile is
  parked (not approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md)
  precedent.
