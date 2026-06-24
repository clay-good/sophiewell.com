# spec-v167.md — One-formula subspecialty gaps: mean airway pressure, cerebroplacental ratio, toe-brachial index, stool osmotic gap, pure tone average, and Rutgeerts (+6 tiles)

> Status: **PROPOSED (2026-06-23).** **Closing spec** of the
> [spec-v162](spec-v162.md) **Cross-Discipline Completion** program. Adds **6**
> deterministic single-formula instruments, each filling a named hole in a
> different subspecialty (ventilation, fetal Doppler, vascular, GI, audiology, IBD
> endoscopy). None duplicates a live tile. With v167 the Cross-Discipline
> Completion program is **complete (+19, nominal 722 → 741).**
>
> Catalog effect at v167 close: **live count + 6** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v166) remains in force. v167 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Formulas and thresholds are re-fetched and cross-verified
> to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Six subspecialties each have a single deterministic, free, daily instrument the
catalog lacks. They do not group into one specialty, but they share a shape: one
closed formula or one classification, each filling a confirmed one-tile gap. Shipping
them together closes the long tail efficiently.

## 2. What v167 adds (6 tiles)

### 2.1 `mean-airway-pressure` — Mean Airway Pressure (Pₘₐw)

- **Citation:** Marini JJ, Ravenscraft SA. Mean airway pressure: physiologic
  determinants and clinical importance. *Crit Care Med.* 1992;20(11):1604-1616.
- **citationUrl:** https://doi.org/10.1097/00003246-199211000-00020 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `critical-care`, `pulmonology`, `respiratory-therapy`, `neonatology`.
- **Inputs:** PIP, PEEP (cmH₂O), inspiratory time Ti and expiratory time Te (s) — or
  respiratory rate + I:E.
- **Output:** **Pₘₐw = [(PIP·Ti) + (PEEP·Te)] / (Ti + Te)** (the standard
  square-wave approximation), with the I:E-derived form. Class A. Cross-linked to
  `oxygenation-index` (which already *consumes* mean airway pressure as an input).
  Guards the (Ti+Te) denominator.

### 2.2 `cerebroplacental-ratio` — Cerebroplacental Ratio (CPR)

- **Citation:** Gramellini D, Folli MC, Raboni S, et al. Cerebral-umbilical Doppler
  ratio as a predictor of adverse perinatal outcome. *Obstet Gynecol.*
  1992;79(3):416-420.
- **citationUrl:** (PMID 1738525 — verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `maternal-fetal-medicine`, `obstetrics`.
- **Inputs:** middle-cerebral-artery pulsatility index (MCA-PI) and umbilical-artery
  pulsatility index (UA-PI).
- **Output:** **CPR = MCA-PI / UA-PI**, with the abnormal threshold (<1, or below the
  gestational-age centile) flagged as redistribution/at-risk. Class A. Guards the
  UA-PI denominator. Cross-linked to `hadlock-efw`/`bpp` (fetal surveillance).

### 2.3 `toe-brachial-index` — Toe-Brachial Index (TBI)

- **Citation:** Aboyans V, Criqui MH, Abraham P, et al. Measurement and
  interpretation of the ankle-brachial index. *Circulation.*
  2012;126(24):2890-2909 (TBI for non-compressible vessels).
- **citationUrl:** https://doi.org/10.1161/CIR.0b013e318276fbcb (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `vascular-surgery`, `cardiology`.
- **Inputs:** toe systolic pressure and the higher brachial systolic pressure
  (mmHg).
- **Output:** **TBI = toe pressure / brachial pressure**, with the **<0.70 abnormal**
  (PAD) threshold — the test of choice when the ABI is non-compressible (>1.40).
  Class A. Cross-linked to `abi` (ankle-brachial index). Guards the denominator.

### 2.4 `stool-osmotic-gap` — Stool Osmotic Gap

- **Citation:** Eherer AJ, Fordtran JS. Fecal osmotic gap and pH in experimental
  diarrhea of various causes. *Gastroenterology.* 1992;103(2):545-551.
- **citationUrl:** https://doi.org/10.1016/0016-5085(92)90845-Q (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `gastroenterology`, `internal-medicine`.
- **Inputs:** stool sodium and stool potassium (mEq/L).
- **Output:** **osmotic gap = 290 − 2·(stool Na + stool K)**, with the interpretation
  (>100 osmotic diarrhea, <50 secretory, 50–100 indeterminate). Class A. Uses the
  fixed 290 mOsm/kg plasma-osmolality assumption (surfaced). Guards the inputs.

### 2.5 `pure-tone-average` — Pure Tone Average (PTA)

- **Citation:** American Speech-Language-Hearing Association (ASHA) / AAO-HNS
  guidelines for the four-frequency pure-tone average.
- **citationUrl:** (ASHA audiometry guidance — verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `audiology`, `otolaryngology`.
- **Inputs:** the air-conduction thresholds (dB HL) at 500, 1000, 2000, and 4000 Hz.
- **Output:** the **3-frequency PTA = mean(500, 1000, 2000)** and the **4-frequency
  PTA = mean(500, 1000, 2000, 4000)**, with the severity bands (normal ≤25, mild
  26–40, moderate 41–55, moderately-severe 56–70, severe 71–90, profound >90 dB HL).
  Class A. Guards the inputs; the 3FA vs 4FA selection is explicit.

### 2.6 `rutgeerts` — Rutgeerts Score (post-op Crohn's endoscopic recurrence)

- **Citation:** Rutgeerts P, Geboes K, Vantrappen G, et al. Predictability of the
  postoperative course of Crohn's disease. *Gastroenterology.* 1990;99(4):956-963.
- **citationUrl:** https://doi.org/10.1016/0016-5085(90)90613-6 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`.
- **Inputs:** the neoterminal-ileum endoscopic findings (aphthous lesion number,
  mucosal involvement, nodules/stenosis).
- **Output:** the **grade i0 / i1 / i2 / i3 / i4** with the source's recurrence-risk
  interpretation (≥i2 predicts clinical recurrence). Class A — a deterministic
  input→grade mapping. Cross-linked to `harvey-bradshaw`/`cdai-crohns` (Crohn's
  activity tiles).

## 3. Per-tile robustness

- **`mean-airway-pressure`, `cerebroplacental-ratio`, `toe-brachial-index`,
  `stool-osmotic-gap`, `pure-tone-average`** are **closed-form arithmetic** over
  finite-checked inputs using `lib/num.js`; every division (Pₘₐw Ti+Te, CPR UA-PI,
  TBI brachial) and the osmotic-gap/PTA sums are guarded — a blank/non-finite/zero
  denominator renders a surfaced `valid:false` complete-the-fields fallback rather
  than `NaN`/`Infinity`.
- **`rutgeerts`** is a deterministic input→grade mapping; every finding combination
  resolves to exactly one defined i-grade (no `undefined`/`NaN`).
- Each tile's threshold/band boundary (CPR <1, TBI 0.70, osmotic-gap 50/100, PTA
  severity cutoffs, Rutgeerts i1→i2) is unit-tested; the [spec-v59](spec-v59.md)
  fuzz harness exercises the divisions and the classification combinatorics.
- All six render the [spec-v50](spec-v50.md) §3 posture note and author no order
  ([spec-v11](spec-v11.md) §5.3); `mean-airway-pressure` notes the square-wave
  approximation and `stool-osmotic-gap` the fixed-290 assumption.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** the journal/author-cited tiles (`mean-airway-pressure`,
  `cerebroplacental-ratio`, `stool-osmotic-gap`, `rutgeerts`) are **Class A**.
  `toe-brachial-index` (**AHA** Circulation statement) and `pure-tone-average`
  (**ASHA/AAO-HNS**) cite issuing societies — those acronyms **trip
  `ISSUER_PATTERN`** and force **documentation-only `docs/citation-staleness.md`
  rows** (fixed published values, not drifting).
- **Specialty vocabulary:** adds **`audiology`** to `ALLOWED_SPECIALTIES` (see
  [spec-v162](spec-v162.md) §4); `respiratory-therapy`, `otolaryngology`, and the
  rest already exist.
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/oneformula-v167.js` module (`meanAirwayPressure`, `cerebroplacentalRatio`,
  `toeBrachialIndex`, `stoolOsmoticGap`, `pureToneAverage`, `rutgeerts`), added to
  `fuzz-tools.test.js` `MODULES`. Renderers live in the new `views/group-v167.js`;
  its `RV167` export is spread into `app.js` `RENDERERS`. The catalog count moves on
  all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v167.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v167 RV167 into RENDERERS)
lib/oneformula-v167.js                   (new module: meanAirwayPressure, cerebroplacentalRatio, toeBrachialIndex, stoolOsmoticGap, pureToneAverage, rutgeerts)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to oxygenation-index, hadlock-efw/bpp, abi, harvey-bradshaw/cdai-crohns)
views/group-v167.js                      (new renderer module: 6 renderers)
test/unit/specialty-coverage.test.js     (add 'audiology' to ALLOWED_SPECIALTIES)
docs/clinical-citations.md               (+ rows for the six sources)
docs/citation-staleness.md               (+ documentation-only rows for toe-brachial-index [AHA] and pure-tone-average [ASHA/AAO-HNS])
test/unit/mean-airway-pressure.test.js, cerebroplacental-ratio.test.js, toe-brachial-index.test.js, stool-osmotic-gap.test.js, pure-tone-average.test.js, rutgeerts.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/oneformula-v167.js to MODULES)
docs/audits/v12/<id>.md                   (spec-v11 audit logs, one per tile)
docs/scope-cross-discipline.md           (catalog ledger; CLOSE the v162 program running count)
CHANGELOG.md                             (Unreleased: v167 entry, +6; note Cross-Discipline Completion program complete)
README.md, package.json                  (catalog count + spec-progression line -> v167)
```

## 6. Acceptance criteria

v167 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all six ids are absent.
- All 6 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **Pₘₐw
  from PIP/PEEP/Ti/Te**, a **CPR <1 redistribution flag**, a **TBI 0.70 boundary**, a
  **stool osmotic gap secretory-vs-osmotic boundary**, a **3FA-vs-4FA PTA**, and a
  **Rutgeerts i1→i2 recurrence-risk transition**), a [spec-v11](spec-v11.md) audit
  log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every division is guarded; `rutgeerts` resolves every combination to one i-grade;
  blank inputs render a complete-the-fields fallback.
- `audiology` is in `ALLOWED_SPECIALTIES` and `specialty-coverage.test.js` passes;
  the AHA/ASHA tiles carry their documentation-only `docs/citation-staleness.md`
  rows.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 6, all catalog-truth surfaces agree, and
  `docs/scope-cross-discipline.md` records the **Cross-Discipline Completion program
  complete**.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v167 with the +6 delta and the program close.

## 7. Out of scope for v167

- **No Doppler/waveform tracing** — CPR and TBI take the measured PI/pressure values,
  not raw waveforms.
- **No audiogram plotting** — `pure-tone-average` computes the average from entered
  thresholds; it does not render the audiogram.
- **No automatic management** — each tile reports the value/grade and the source's
  interpretation; the decision stays with the clinician.
