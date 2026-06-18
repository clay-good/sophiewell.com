# spec-v104.md — ECG arrhythmia, aortic & syncope: Brugada VT, Vereckei aVR, ADD-RS, ROSE, EGSYS, and OESIL (+6 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 1** (Cardiology / EP / vascular / lipids).
> Adds **6** deterministic wide-complex-tachycardia, aortic-dissection, and
> syncope-risk decision rules that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect: **447 + 6 = 453 tiles.** (The roster projected 448 → 454; the
> running total is one lower because spec-v102 deferred `gwtg-hf`. Two prose
> corrections were applied during implementation per the spec-v97 "source governs"
> rule — see §2.5 / `docs/audits/v12/egsys.md`: EGSYS scores syncope-during-effort
> (+3) and supine-syncope (+2) as separate items, and the two −1 terms score when
> the feature is PRESENT, giving the canonical −2 to +12 range.)
>
> Every prior spec (v4 through v100) remains in force. v104 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 suite doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the ECG-axis and LVH tiles but none of the bedside criteria an ED
physician or cardiologist uses to call wide-complex tachycardia, screen for aortic
dissection, or risk-stratify syncope:

- **No VT-vs-SVT criteria.** The Brugada 4-step algorithm is the standard
  wide-complex-tachycardia rule and is reachable nowhere.
- **No aVR algorithm.** The Vereckei single-lead (aVR) 4-step rule is the
  complementary VT criterion and is absent.
- **No aortic-dissection screen.** ADD-RS (0–3, with the optional D-dimer pathway) is
  the standard pretest tool and is missing.
- **No syncope risk rules.** ROSE (1-month serious outcome), EGSYS (cardiac-syncope
  probability), and OESIL (12-month mortality) are the three ED syncope instruments,
  and none ships.

Each is a published, deterministic instrument a clinician already uses; v104 brings
them onto the page.

## 2. What v104 adds (6 tiles)

### 2.1 `brugada-vt` — Brugada Criteria (VT vs SVT)

- **Citation:** Brugada P, Brugada J, Mont L, et al. A new approach to the
  differential diagnosis of a regular tachycardia with a wide QRS complex.
  *Circulation.* 1991;83(5):1649-1659.
- **citationUrl:** https://doi.org/10.1161/01.CIR.83.5.1649
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `critical-care`,
  `internal-medicine`.
- **Inputs:** the four sequential steps — absence of RS in all precordial leads;
  R-to-S interval > 100 ms in any precordial lead; AV dissociation; morphologic VT
  criteria in V1–V2 and V6.
- **Output:** **VT** if any step is positive, else **SVT with aberrancy**, naming the
  step that fired. Class A (fixed 1991 algorithm).

### 2.2 `vereckei-avr` — Vereckei aVR Algorithm

- **Citation:** Vereckei A, Duray G, Szénási G, et al. New algorithm using only lead
  aVR for differential diagnosis of wide QRS complex tachycardia. *Heart Rhythm.*
  2008;5(1):89-98.
- **citationUrl:** https://doi.org/10.1016/j.hrthm.2007.09.020
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `critical-care`,
  `internal-medicine`.
- **Inputs:** the four sequential aVR steps — initial dominant R wave; initial r/q
  width > 40 ms; notch on the descending limb of a negative onset; ventricular
  activation-velocity ratio vi/vt ≤ 1.
- **Output:** **VT** if any step is positive, else **supraventricular**, naming the
  step that fired. Class A (fixed 2008 algorithm). Cross-links `brugada-vt`.

### 2.3 `add-rs` — Aortic Dissection Detection Risk Score

- **Citation:** Rogers AM, Hermann LK, Booher AM, et al. Sensitivity of the aortic
  dissection detection risk score, a novel guideline-based tool for identification of
  acute aortic dissection at initial presentation. *Circulation.*
  2011;123(20):2213-2218.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.110.988568
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `cardiac-surgery`,
  `internal-medicine`.
- **Inputs:** the count of positive categories among predisposing conditions, pain
  features, and exam findings (each category scores 0 or 1); plus an optional D-dimer
  value for the pathway note.
- **Output:** the **ADD-RS total (0–3)** with the published low-risk (0) / intermediate
  (1) / high (≥ 2) interpretation and the optional D-dimer rule-out note for an ADD-RS
  ≤ 1. Class A (fixed 2011 category rule).

### 2.4 `rose-syncope` — ROSE Rule

- **Citation:** Reed MJ, Newby DE, Coull AJ, et al. The ROSE (Risk Stratification of
  Syncope in the Emergency Department) study. *J Am Coll Cardiol.*
  2010;55(8):713-721.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2009.09.049
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `cardiology`, `internal-medicine`,
  `nursing-er`.
- **Inputs:** the BRACES criteria — BNP ≥ 300 pg/mL, bradycardia ≤ 50, rectal exam
  fecal-occult-blood positive, anemia Hgb ≤ 90 g/L, chest pain, ECG Q wave (non-III),
  oxygen saturation ≤ 94%.
- **Output:** **high risk** (1-month serious outcome / death) if **any** criterion is
  positive, else **low risk**, naming the positive criteria. Class A (fixed 2010 rule).

### 2.5 `egsys` — EGSYS Score (cardiac-syncope probability)

- **Citation:** Del Rosso A, Ungar A, Maggi R, et al. Clinical predictors of cardiac
  syncope at initial evaluation in patients referred urgently to a general hospital:
  the EGSYS score. *Heart.* 2008;94(12):1620-1626.
- **citationUrl:** https://doi.org/10.1136/hrt.2008.143123
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `internal-medicine`,
  `nursing-er`.
- **Inputs:** abnormal ECG and/or heart disease (3), palpitations before syncope (4),
  syncope during effort or supine (3), absence of autonomic prodrome (−1), absence of
  predisposing/precipitating factors (−1).
- **Output:** the **total (−2 to +10)** with the published cardiac-syncope probability
  band (≥ 3 suggests cardiac syncope). Class A (fixed 2008 weights). Robustness: the
  signed weights are summed with explicit handling of the negative terms.

### 2.6 `oesil` — OESIL Risk Score

- **Citation:** Colivicchi F, Ammirati F, Melina D, et al. Development and prospective
  validation of a risk stratification system for patients with syncope in the
  emergency department: the OESIL risk score. *Eur Heart J.* 2003;24(9):811-819.
- **citationUrl:** https://doi.org/10.1016/S0195-668X(02)00827-8
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `internal-medicine`,
  `geriatrics`.
- **Inputs:** age > 65 (1), cardiovascular disease history (1), syncope without
  prodrome (1), abnormal ECG (1).
- **Output:** the **total (0–4)** mapped to the published 12-month mortality bands
  (rising sharply at ≥ 2). Class A (fixed 2003 weights). Cross-links `rose-syncope`,
  `egsys`.

## 3. Per-tile robustness

- **`brugada-vt` and `vereckei-avr` are sequential boolean step logic.** Each evaluates
  the steps in order, returns the verdict at the first positive step, and names that
  step; there is no arithmetic overflow surface, and a fully-negative input returns the
  SVT verdict rather than an undefined state.
- **`add-rs`, `rose-syncope`, and `oesil` are bounded category/point counts**; each
  clamps the total to its published maximum and names the positive items.
- **`egsys` sums signed weights** (including the two −1 terms) and the result is
  bounded to its published [−2, +10] range; the fuzz harness exercises the negative
  terms so the band classification never reads a positive number for a negative total.
- **`add-rs` treats the optional D-dimer as a pathway note, not a score input** — the
  total is the ADD-RS category count; the D-dimer only changes the rendered rule-out
  guidance for an ADD-RS ≤ 1.
- All six run the [spec-v59](spec-v59.md) fuzz harness, render the
  [spec-v50](spec-v50.md) §3 clinical posture note, and quote the source's
  interpretation; none authors an imaging, admission, or antiarrhythmic order in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six — `brugada-vt`, `vereckei-avr`, `add-rs`,
  `rose-syncope`, `egsys`, `oesil` — are **Class A** (fixed derivation papers /
  algorithms / point weights) → **no** `docs/citation-staleness.md` rows. Each citation
  names the **journal + authors**, not a society, so none trips the `ISSUER_PATTERN`
  gate (the implementer confirms the ADD-RS citation's "guideline-based" phrasing does
  not name a society acronym in the meta string).
- **Gates (§6.2):** `lib/cardio-v104.js` joins the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks; `egsys`'s signed-weight sum explicitly fuzzed);
  each `META` example is pinned by the chromium `example-correctness` sweep; the catalog
  count moves on all **13 catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px
  touch-target checks pass for the new `views/group-v29.js` renderer (`RV29` added to the
  `app.js` `RENDERERS` spread).

## 5. Files touched

```
docs/spec-v104.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v29 RV29 into RENDERERS)
lib/cardio-v104.js                       (new module: brugadaVt, vereckeiAvr, addRs, roseSyncope, egsys, oesil)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links within VT pair and syncope trio)
views/group-v29.js                       (new renderer module: 6 renderers; incl. ADD-RS optional D-dimer pathway note)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/brugada-vt.test.js, vereckei-avr.test.js, add-rs.test.js, rose-syncope.test.js, egsys.test.js, oesil.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardio-v104.js to MODULES)
docs/audits/v12/brugada-vt.md, vereckei-avr.md, add-rs.md, rose-syncope.md, egsys.md, oesil.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 448 -> 454; Wave 1 progress)
CHANGELOG.md                             (Unreleased: v104 entry, +6)
README.md, package.json                  (catalog count 448 -> 454; spec-progression line -> v104)
```

(No `docs/citation-staleness.md` change — all six tiles are Class A.)

## 6. Acceptance criteria

v104 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥ 3 boundary worked examples each — including a
  Brugada first-positive-step VT call vs all-negative SVT, a Vereckei aVR step-1 VT vs
  SV verdict, an ADD-RS 1 → 2 (intermediate → high) flip, a ROSE any-positive vs
  all-negative flip, an EGSYS 2 → 3 (negative-term-inclusive) cardiac-syncope-threshold
  flip, and an OESIL 1 → 2 mortality-band flip — a [spec-v11](spec-v11.md) audit log, and
  a passing [spec-v29](spec-v29.md) §3 check.
- `egsys` correctly sums its negative terms (fuzz-exercised); the boolean step rules
  return a defined verdict on a fully-negative input.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- No tile carries a `docs/citation-staleness.md` row (all Class A; citations confirmed
  not to trip `ISSUER_PATTERN`).
- `UTILITIES.length` is **454** (or the then-current count + 6 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v104 with the +6 catalog delta.

## 7. Out of scope for v104

- **No ECG-waveform parsing** — `brugada-vt` and `vereckei-avr` take the clinician's
  morphologic findings (RS presence, AV dissociation, vi/vt), not a raw tracing or an
  auto-interpretation.
- **No D-dimer-assay feed** — `add-rs` treats an entered D-dimer as a pathway note only;
  it does not consume a lab feed or auto-order imaging.
- **No CTA, admission, or antiarrhythmic order** — each tile reports the verdict/score
  and the source's stated interpretation; the image/admit/treat decision stays with the
  clinician and local protocol.
