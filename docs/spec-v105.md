# spec-v105.md — Vascular & cardiac surgery: ABI, Rutherford/Fontaine, SVS WIfI, and EuroSCORE II (+4 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 1** (Cardiology / EP / vascular / lipids) —
> the **closing spec of Wave 1**. Adds **4** deterministic peripheral-artery and
> cardiac-surgery-risk instruments that fill confirmed gaps. None duplicates a live
> tile.
>
> Catalog effect: **453 + 4 = 457 tiles** — the Wave 1 end state (432 → 457, +25).
> (The roster projected 454 → 458, +26; the running total is one lower because
> spec-v102 deferred `gwtg-hf`.) Two implementation corrections were applied per the
> spec-v97 "source governs over recall" rule: (1) the **EuroSCORE II age coefficient
> is 0.0285181** (the Nashef 2012 EJCTS Table 6 multivariate value), NOT the
> 0.0666354 figure in §2.4 — that value is the legacy logistic *EuroSCORE I* age
> coefficient and would materially over-estimate every prediction; the implemented
> model reproduces the published worked example (y = −2.126358 → 10.66%) exactly.
> (2) The SVS WIfI clinical-stage grid was re-fetched as the Mills 2014 expert-panel
> **amputation-risk** table (the separate revascularization-benefit table has
> different cells). See `docs/audits/v12/euroscore2.md` and `wifi.md`.
>
> Every prior spec (v4 through v100) remains in force. v105 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 suite doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has no peripheral-artery-disease bedside math and no cardiac-surgery
mortality engine — the four instruments a vascular or cardiac surgeon reaches for:

- **No ankle-brachial index tile.** ABI is the foundational PAD bedside measurement,
  computed by hand at every vascular exam, and is reachable nowhere.
- **No PAD-stage mapper.** The Rutherford category and Fontaine stage are the standard
  PAD-severity classifications and are absent.
- **No limb-threat classification.** The SVS WIfI (Wound / Ischemia / foot Infection)
  staging system is the modern critical-limb-ischemia tool and is missing.
- **No cardiac-surgery mortality engine.** EuroSCORE II predicts in-hospital mortality
  after cardiac surgery and is the standard preoperative tool; nothing ships.

Each is a published, deterministic instrument a clinician already uses; v105 brings
them onto the page and closes Wave 1.

## 2. What v105 adds (4 tiles)

### 2.1 `abi` — Ankle-Brachial Index

- **Citation:** Aboyans V, Criqui MH, Abraham P, et al. Measurement and interpretation
  of the ankle-brachial index. *Circulation.* 2012;126(24):2890-2909.
- **citationUrl:** https://doi.org/10.1161/CIR.0b013e318276fbcb
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `vascular-surgery`, `internal-medicine`,
  `nursing-tele`.
- **Inputs:** the higher ankle systolic pressure (dorsalis pedis / posterior tibial)
  per leg and the higher brachial systolic pressure (right / left arm).
- **Output:** the **ABI per leg** (ankle ÷ higher brachial) with the published PAD
  severity bands — **> 1.40 non-compressible, 1.00–1.40 normal, 0.91–0.99 borderline,
  0.41–0.90 mild-to-moderate PAD, ≤ 0.40 severe PAD**. Class A (arithmetic ratio +
  fixed bands). Robustness: the brachial divisor is guarded for > 0; a zero/blank
  brachial returns a surfaced `valid:false` rather than dividing by zero.

### 2.2 `rutherford-fontaine` — Rutherford Category / Fontaine Stage (PAD)

- **Citation:** Rutherford RB, Baker JD, Ernst C, et al. Recommended standards for
  reports dealing with lower extremity ischemia: revised version. *J Vasc Surg.*
  1997;26(3):517-538.
- **citationUrl:** https://doi.org/10.1016/S0741-5214(97)70045-4
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `vascular-surgery`, `cardiology`, `internal-medicine`,
  `nursing-tele`.
- **Inputs:** the clinical picture — asymptomatic; mild / moderate / severe
  claudication; ischemic rest pain; minor tissue loss; major tissue loss.
- **Output:** the mapped **Rutherford category (0–6)** and the corresponding **Fontaine
  stage (I–IV)**, with the source's chronic-limb-ischemia interpretation for the class.
  **Class B** (the Rutherford/Fontaine reporting standards are revisable society
  documents → `docs/citation-staleness.md` row, on-publication cadence). Cross-links
  `wifi`.

### 2.3 `wifi` — SVS WIfI Limb-Threat Classification

- **Citation:** Mills JL Sr, Conte MS, Armstrong DG, et al. The Society for Vascular
  Surgery Lower Extremity Threatened Limb Classification System: risk stratification
  based on Wound, Ischemia, and foot Infection (WIfI). *J Vasc Surg.*
  2014;59(1):220-234.
- **citationUrl:** https://doi.org/10.1016/j.jvs.2013.08.003
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `vascular-surgery`, `cardiology`, `internal-medicine`,
  `emergency-medicine`.
- **Inputs:** Wound grade (0–3), Ischemia grade (0–3, by ABI / ankle pressure / toe
  pressure), and foot Infection grade (0–3).
- **Output:** the **W-I-fI grade triple** mapped to the published **clinical stage 1–4**
  (low / moderate / high / very-high amputation risk and revascularization benefit) per
  the SVS estimate tables. **Class B** (the SVS WIfI stage tables are revisable society
  documents → `docs/citation-staleness.md` row, on-publication cadence). Cross-links
  `rutherford-fontaine`, `abi`.

### 2.4 `euroscore2` — EuroSCORE II

- **Citation:** Nashef SAM, Roques F, Sharples LD, et al. EuroSCORE II. *Eur J
  Cardiothorac Surg.* 2012;41(4):734-744.
- **citationUrl:** https://doi.org/10.1093/ejcts/ezs043
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiac-surgery`, `cardiology`, `critical-care`,
  `nursing-icu`.
- **Inputs:** the EuroSCORE II variables — age, sex, renal impairment (CrCl bands),
  extracardiac arteriopathy, poor mobility, prior cardiac surgery, chronic lung
  disease, active endocarditis, critical preoperative state, diabetes on insulin, NYHA
  class, CCS class 4 angina, LV function, recent MI, pulmonary hypertension, urgency,
  weight of the intervention, and thoracic-aorta surgery.
- **Output:** the **predicted in-hospital mortality (%)** via the published logistic
  `1/(1+e^−(β₀+Σβx))`. Class A (fixed 2012 coefficients). Robustness: the logistic
  exponent is **clamped to an overflow-safe range** so an extreme fuzzed input returns a
  probability in [0, 1] rather than `Infinity`; the coefficient block is a **compiled
  constant** per [spec-v100](spec-v100.md) §5, re-fetched verbatim from the published
  model.

## 3. Per-tile robustness

- **`abi` guards its division** — the brachial divisor must be > 0; a zero/blank
  brachial pressure returns a surfaced `valid:false` rather than `ankle/0`. Each leg's
  ABI is bounded and the band is read from the rounded ratio so the displayed value
  matches its severity band.
- **`euroscore2` is a logistic engine.** The exponent `β₀ + Σβx` is **clamped to
  [−40, 40]** before `1/(1+e^−x)` so overflow cannot produce `Infinity`/`NaN`; the
  result is bounded to [0, 1]; a missing required variable returns a surfaced fallback
  rather than a probability from `NaN`. The published coefficients are re-fetched
  verbatim per the v97 "re-fetch, never recall coefficients" lesson.
- **`rutherford-fontaine` and `wifi` are mapping/lookup logic.** Each clamps its grade
  inputs to the published range (Rutherford 0–6; W/I/fI each 0–3) and reads the stage
  from the compiled SVS estimate table; an out-of-range grade returns a surfaced
  fallback rather than an `undefined` stage.
- All four run the [spec-v59](spec-v59.md) fuzz harness, render the
  [spec-v50](spec-v50.md) §3 clinical posture note, and quote the source's
  interpretation; none authors a revascularization, amputation, or operative
  recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `abi` and `euroscore2` are **Class A** (arithmetic
  ratio + fixed bands; fixed 2012 logistic coefficients) → **no** staleness row; their
  citations name the **journal + authors**, not a society, to avoid the
  `ISSUER_PATTERN` false-positive (notably `abi` attributes to Aboyans et al. /
  *Circulation* rather than the AHA scientific statement, and `euroscore2` to Nashef et
  al. / *Eur J Cardiothorac Surg*). `rutherford-fontaine` and `wifi` are **Class B** —
  each gets a `docs/citation-staleness.md` row naming the edition in force (Rutherford
  1997 reporting standards; SVS WIfI 2014), the `accessed` date, and an on-publication
  review cadence, monitored by `scripts/check-citation-cadence.mjs`.
- **Gates (§6.2):** `lib/vascular-v105.js` joins the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks; the EuroSCORE II logistic and the ABI division
  **explicitly fuzzed for overflow / divide-by-zero**); each `META` example is pinned by
  the chromium `example-correctness` sweep; the catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass
  for the new `views/group-v30.js` renderer (`RV30` added to the `app.js` `RENDERERS`
  spread).
- **New specialty tag.** `vascular-surgery` is **not yet in the
  `test/unit/specialty-coverage.test.js` `ALLOWED_SPECIALTIES` closed vocab** — this
  spec adds it (per the v89/v92 lesson that new specialty tags must be added to the
  closed vocab). It is the natural home tag for `abi`, `rutherford-fontaine`, and `wifi`.
- **Wave-1-close note:** with v105 Wave 1 of the [spec-v100](spec-v100.md) program is
  complete at **458** tiles (432 → 458, +26). The §6.3 cadence job now monitors the new
  Wave 1 Class B rows (`cha2ds2-va`, `chads-65`, `hfa-peff`, `score2`, `score2-op`,
  `rutherford-fontaine`, `wifi`).

## 5. Files touched

```
docs/spec-v105.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups E & G; import group-v30 RV30 into RENDERERS)
lib/vascular-v105.js                     (new module: abi, rutherfordFontaine, wifi, euroScore2; + compiled EuroSCORE II coefficients)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links abi<->rutherford-fontaine<->wifi)
views/group-v30.js                       (new renderer module: 4 renderers; incl. per-leg ABI inputs + WIfI W/I/fI grade selectors)
docs/citation-staleness.md               (+ rows: rutherford-fontaine 1997 reporting standards, wifi SVS WIfI 2014)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/specialty-coverage.test.js     (add 'vascular-surgery' to ALLOWED_SPECIALTIES)
test/unit/abi.test.js, rutherford-fontaine.test.js, wifi.test.js, euroscore2.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/vascular-v105.js to MODULES)
docs/audits/v12/abi.md, rutherford-fontaine.md, wifi.md, euroscore2.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 454 -> 458; CLOSE Wave 1 in the running ledger: 432 -> 458, +26)
CHANGELOG.md                             (Unreleased: v105 entry, +4; Wave 1 complete note)
README.md, package.json                  (catalog count 454 -> 458; spec-progression line -> v105)
```

## 6. Acceptance criteria

v105 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  four ids are absent.
- All 4 tiles in §2 are live in their group (`abi` in E; `rutherford-fontaine`/`wifi`/
  `euroscore2` in G) with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥ 3 boundary worked examples each — including an ABI 0.90
  → 0.91 (mild-PAD → borderline) band flip, a Rutherford category-3 → Fontaine-IIb
  mapping, a WIfI W2-I3-fI1 → stage-4 lookup, and a worked EuroSCORE II logistic point
  set → mortality % — a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `abi` guards its division (brachial > 0); `euroscore2` clamps its logistic exponent
  and returns a probability in [0, 1]; the mapping tiles clamp grade inputs; blank/
  invalid inputs render a surfaced fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `rutherford-fontaine` and `wifi` carry `accessed` + a `docs/citation-staleness.md`
  row; `abi` and `euroscore2` carry none (journal-named citations confirmed not to trip
  `ISSUER_PATTERN`).
- `vascular-surgery` is added to `ALLOWED_SPECIALTIES`; `specialty-coverage.test.js`
  passes.
- `UTILITIES.length` is **458** (or the then-current count + 4 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree;
  `scope-mdcalc-parity.md` records Wave 1 complete (432 → 458, +26).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v105 with the +4 catalog delta and the Wave-1-complete note.

## 7. Out of scope for v105

- **No Doppler-waveform or pressure-cuff feed parsing** — `abi` takes the clinician's
  measured ankle and brachial systolic pressures, not a device feed.
- **No imaging-grade auto-classification** — `wifi` and `rutherford-fontaine` take the
  clinician's wound / ischemia / infection and clinical-picture determinations, not an
  imaging or photographic read.
- **No revascularization, amputation, or operative-listing recommendation** — each tile
  reports the index / stage / mortality estimate and the source's stated
  interpretation; the operate/revascularize/amputate decision stays with the clinician
  and local protocol.
- **No SCAI / cardiac-surgery-pathway duplication** — `euroscore2` estimates operative
  mortality only; it does not substitute for the surgical-team and heart-team decision.
