# spec-v102.md — Heart failure & cardiogenic shock: MAGGIC, GWTG-HF, H₂FPEF, HFA-PEFF, and CardShock (+5 tiles)

> Status: **SHIPPED (2026-06-18), partial — 4 of 5.** Feature spec of the
> [spec-v100](spec-v100.md) MDCalc Parity Completion program, **Wave 1** (Cardiology /
> EP / vascular / lipids). Adds **4** deterministic heart-failure prognosis,
> HFpEF-likelihood, and cardiogenic-shock mortality instruments that fill confirmed
> gaps. None duplicates a live tile.
>
> Catalog effect: **437 + 4 = 441 tiles.**
>
> **Implementation note (2026-06-18): `gwtg-hf` (§2.2) is DEFERRED, not shipped.**
> The four other tiles' coefficients were re-fetched and cross-verified from ≥ 2
> independent sources each (the [spec-v97](spec-v97.md) "re-fetch, never recall"
> rule). `gwtg-hf`'s **per-variable integer point table** (the discrete band points
> for systolic BP, BUN, sodium, age, and heart rate) could **not** be verified from
> any reachable primary or high-quality secondary source this session: the Peterson
> 2010 paper and the medRxiv reproduction return HTTP 403, MDCalc/ClinCalc implement
> the score as a **continuous nomogram** (free numeric inputs, no published discrete
> bands), `mdapp`'s table page now 404s, and a sub-agent's fully-populated grid was
> flagged as fabricated. Only the variable *ranges/maxima* (age/SBP/BUN 0–28, HR 0–8,
> sodium 0–4, COPD +2, non-Black race +3, total 0–100) and the score→mortality band
> table (9 groups, 0–33 → < 1% up to ≥ 79 → > 50%) are corroborated. Shipping the
> point assignments would mean fabricating medical scoring weights, which this catalog
> does not do. A future session with institutional access to Peterson 2010 Figure 2
> (or its supplement) should add `gwtg-hf` as a standalone +1; the id stays reserved.
>
> Every prior spec (v4 through v100) remains in force. v102 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 suite doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has acute-decompensation triage adjacent tools but no validated
heart-failure prognosis engine, no HFpEF-likelihood calculator, and no
cardiogenic-shock mortality score — the five instruments a cardiologist or
intensivist uses to prognosticate and disposition HF:

- **No chronic-HF mortality engine.** MAGGIC is the standard 1- and 3-year
  mortality model across the HF outcomes literature and is absent.
- **No admitted-HF in-hospital mortality score.** GWTG-HF risk-stratifies patients
  admitted with decompensated HF and is reachable nowhere.
- **No HFpEF-probability calculator.** `h2fpef` (a logistic) and `hfa-peff` (the ESC
  stepwise score) are the two tools that estimate whether dyspnea is HFpEF; neither
  ships.
- **No cardiogenic-shock mortality score.** CardShock predicts in-hospital mortality
  in cardiogenic shock and substitutes for the deliberately-excluded gestalt SCAI
  staging ([spec-v100](spec-v100.md) §8).

Each is a published, deterministic instrument a clinician already uses; v102 brings
them onto the page.

## 2. What v102 adds (5 tiles)

### 2.1 `maggic` — MAGGIC Heart Failure Risk Score

- **Citation:** Pocock SJ, Ariti CA, McMurray JJV, et al. Predicting survival in
  heart failure: a risk score based on 39,372 patients from 30 studies. *Eur Heart J.*
  2013;34(19):1404-1413.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehs337
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `nursing-tele`,
  `critical-care`.
- **Inputs:** age, sex, LVEF, NYHA class, systolic BP, BMI, creatinine, diabetes,
  COPD, current smoker, HF duration > 18 months, beta-blocker, ACEi/ARB.
- **Output:** the **integer MAGGIC point total** and the published **1-year and
  3-year mortality (%)** lookup. Class A (fixed 2013 integer-point model).

### 2.2 `gwtg-hf` — Get With The Guidelines Heart Failure Risk Score — **DEFERRED (see implementation note above)**

- **Citation:** Peterson PN, Rumsfeld JS, Liang L, et al. A validated risk score for
  in-hospital mortality in patients with heart failure from the American Heart
  Association Get With The Guidelines program. *Circ Cardiovasc Qual Outcomes.*
  2010;3(1):25-32.
- **citationUrl:** https://doi.org/10.1161/CIRCOUTCOMES.109.854877
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `critical-care`,
  `nursing-tele`.
- **Inputs:** age, systolic BP, BUN, heart rate, sodium, COPD history, race
  (banded per the published model).
- **Output:** the **point total** mapped to the published **in-hospital mortality (%)**
  band. Class A (fixed 2010 point weights — citation names the journal/authors, not
  the AHA program acronym, to avoid an `ISSUER_PATTERN` false-positive).

### 2.3 `h2fpef` — H₂FPEF Score

- **Citation:** Reddy YNV, Carter RE, Obokata M, et al. A simple, evidence-based
  approach to help guide diagnosis of heart failure with preserved ejection fraction.
  *Circulation.* 2018;138(9):861-870.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.118.034646
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `echocardiography`, `internal-medicine`,
  `nursing-tele`.
- **Inputs:** BMI > 30 (2), ≥ 2 antihypertensives (1), atrial fibrillation (3), pulmonary
  hypertension PASP > 35 mmHg (1), age > 60 (1), echo E/e′ > 9 (1).
- **Output:** the **total (0–9)** with the published HFpEF-probability mapping (≤ 1 low,
  2–5 intermediate, ≥ 6 high). Class A (fixed 2018 point model).

### 2.4 `hfa-peff` — HFA-PEFF Diagnostic Score (ESC stepwise)

- **Citation:** Pieske B, Tschöpe C, de Boer RA, et al. How to diagnose heart failure
  with preserved ejection fraction: the HFA-PEFF diagnostic algorithm. *Eur Heart J.*
  2019;40(40):3297-3317.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehz641
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `echocardiography`, `internal-medicine`,
  `nursing-tele`.
- **Inputs:** the functional, morphologic, and biomarker domains — each scored major
  (2) / minor (1) per the published criteria (E/e′, e′, TR velocity, LA volume index,
  LV mass index, relative wall thickness, NT-proBNP / BNP banded by rhythm).
- **Output:** the **domain total (0–6)** with the stepwise verdict — **≥ 5 HFpEF
  confirmed, 2–4 indeterminate (proceed to diastolic stress / invasive testing),
  ≤ 1 unlikely**. **Class B** (the ESC HFA-PEFF algorithm is revisable →
  `docs/citation-staleness.md` row, on-publication cadence). Cross-links `h2fpef`.

### 2.5 `cardshock-score` — CardShock Risk Score

- **Citation:** Harjola VP, Lassus J, Sionis A, et al. Clinical picture and risk
  prediction of short-term mortality in cardiogenic shock. *Eur J Heart Fail.*
  2015;17(5):501-509.
- **citationUrl:** https://doi.org/10.1002/ejhf.260
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `critical-care`, `nursing-icu`,
  `emergency-medicine`.
- **Inputs:** age > 75 (1), confusion at presentation (1), prior MI or CABG (1),
  ACS etiology (1), LVEF < 40% (1), blood lactate (banded), eGFR (banded).
- **Output:** the **total (0–9)** mapped to the published **in-hospital mortality (%)**
  risk bands. Class A (fixed 2015 point model). Named the deterministic substitute for
  the excluded gestalt SCAI shock staging ([spec-v100](spec-v100.md) §8).

## 3. Per-tile robustness

- **`maggic`, `gwtg-hf`, `h2fpef`, `hfa-peff`, and `cardshock-score` are bounded
  point-sum / lookup logic.** Each clamps continuous inputs (age, BP, BUN, creatinine,
  lactate, eGFR, EF) to its published band before assigning points, so a fuzzed
  out-of-range value reads the nearest band rather than producing an undefined point.
- **`maggic` and `gwtg-hf` guard their score → mortality lookup.** The mortality
  table is keyed by the bounded integer total; an out-of-table index returns a surfaced
  `valid:false` rather than `undefined.toFixed()`.
- **`hfa-peff` reports which domains were scored** and renders the stepwise
  indeterminate band explicitly so a 2–4 result reads as "proceed to further testing,"
  matching the source, rather than a bare number.
- All five run the [spec-v59](spec-v59.md) fuzz harness, render the
  [spec-v50](spec-v50.md) §3 clinical posture note, and quote the source's
  interpretation; none authors a disposition, device, or escalation recommendation in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `maggic`, `gwtg-hf`, `h2fpef`, and `cardshock-score`
  are **Class A** (fixed derivation papers / point weights) — **no** staleness row;
  their citations name the **journal + authors**, not a society, to avoid the
  `ISSUER_PATTERN` false-positive (notably `gwtg-hf` avoids "AHA"/"Get With The
  Guidelines" tripping the gate by attributing to Peterson et al. / *Circ Cardiovasc
  Qual Outcomes*). `hfa-peff` (ESC HFA-PEFF algorithm) is **Class B** — a
  `docs/citation-staleness.md` row naming the 2019 edition, the `accessed` date, and an
  on-publication cadence, monitored by `scripts/check-citation-cadence.mjs`.
- **Gates (§6.2):** `lib/cardio-v102.js` joins the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks; the score → mortality lookups explicitly
  fuzzed for out-of-table indices); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for the new
  `views/group-v27.js` renderer (`RV27` added to the `app.js` `RENDERERS` spread).

## 5. Files touched

```
docs/spec-v102.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v27 RV27 into RENDERERS)
lib/cardio-v102.js                       (new module: maggic, gwtgHf, h2fpef, hfaPeff, cardShock)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to qsofa-sofa, h2fpef<->hfa-peff)
views/group-v27.js                       (new renderer module: 5 renderers)
docs/citation-staleness.md               (+ row: hfa-peff 2019 ESC HFA-PEFF)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/maggic.test.js, gwtg-hf.test.js, h2fpef.test.js, hfa-peff.test.js, cardshock-score.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardio-v102.js to MODULES)
docs/audits/v12/maggic.md, gwtg-hf.md, h2fpef.md, hfa-peff.md, cardshock-score.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 437 -> 442; Wave 1 progress)
CHANGELOG.md                             (Unreleased: v102 entry, +5)
README.md, package.json                  (catalog count 437 -> 442; spec-progression line -> v102)
```

## 6. Acceptance criteria

v102 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥ 3 boundary worked examples each — including a
  worked MAGGIC point total → 1-yr/3-yr mortality, a GWTG-HF total → mortality-band
  lookup, an H₂FPEF 5 → 6 (intermediate → high) flip, an HFA-PEFF 4 → 5 (indeterminate
  → confirmed) flip, and a CardShock low-vs-high mortality-band case — a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Continuous inputs clamp to published bands; the score → mortality lookups return a
  surfaced fallback on an out-of-table index rather than a probability from
  `undefined`.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `hfa-peff` carries `accessed` + a `docs/citation-staleness.md` row; the Class-A four
  carry none.
- `UTILITIES.length` is **442** (or the then-current count + 5 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v102 with the +5 catalog delta.

## 7. Out of scope for v102

- **No echo-report or NT-proBNP-feed parsing** — `h2fpef` and `hfa-peff` take the
  clinician's banded echo and biomarker values, not a study or lab feed.
- **No SCAI shock-stage re-implementation** — SCAI A–E staging is gestalt and stays
  on the [spec-v100](spec-v100.md) §8 exclusion list; `cardshock-score` is the
  deterministic in-scope substitute.
- **No device, MCS, or transplant-listing recommendation** — each tile reports the
  prognostic estimate and the source's stated interpretation; the
  escalate/list/discharge decision stays with the clinician and local protocol.
