# spec-v110.md — Toxicology dosing & dialysis decisions: DigiFab, NAC, HIET, TCA bicarbonate, and lithium EXTRIP (+5 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 2 — Emergency / trauma / toxicology /
> environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)). Adds **5**
> deterministic toxicology dosing and dialysis-decision tools that fill confirmed
> gaps. None duplicates a live tile.
>
> Catalog effect at v110 close: **478 + 5 = 483 tiles** (v109 closed at 478, one
> below the spec's projected 479 — the program's running count was off by one at
> authoring time; the acceptance criteria's "then-current live count + 5" governs).
> Implemented in `lib/tox-v110.js` (`digifabDosing`, `nacDosing`, `hietDosing`,
> `tcaBicarbonate`, `lithiumExtrip`) + `views/group-v35.js` (`RV35`). The four
> dosing tiles are Group F; `lithium-extrip` is Group G. lithium-extrip follows
> the EXTRIP **source** over the §2.5 prose: the "expected time > 36 h" limb is a
> **suggested** limb (with level > 5.0 and confusion), not a recommended one.
>
> Every prior spec (v4 through v109) remains in force. v110 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim, including clause 5: the
> dosing tiles add the high-stakes *confirm against your institutional protocol and
> a second check* note) and the [spec-v100](spec-v100.md) §6 CI/CD contract, pass
> the [spec-v29](spec-v29.md) §3 one-line test, ship their primary citation inline
> ([spec-v54](spec-v54.md)), and inherit the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

The catalog carries the acetaminophen `acetaminophen-nomogram` (Rumack-Matthew
line) and several antidote-adjacent tools, but five standard toxicology dosing and
dialysis-decision instruments are absent, and each is a high-frequency
poison-center/ED computation:

- **No DigiFab dosing.** The digoxin-immune-Fab vial count — by amount ingested,
  by steady-state serum level, or empiric — has no tile.
- **No NAC dosing.** The weight-based N-acetylcysteine IV regimens (the 21-hour
  three-bag and the two-bag SNAP regimen) are absent.
- **No HIET dosing.** The high-dose-insulin-euglycemia bolus → infusion + dextrose
  math for beta-blocker / calcium-channel-blocker overdose is missing.
- **No TCA bicarbonate tool.** The tricyclic-toxicity QRS thresholds (≥ 100 /
  ≥ 160 ms) and the sodium-bicarbonate target are absent.
- **No lithium EXTRIP decision.** The extracorporeal-treatment recommendation by
  lithium level plus renal/neuro features has no tile.

Each is a published, deterministic computation a clinician already performs by
hand; v110 brings them onto the page **with the second-check caveat on every
dose.**

## 2. What v110 adds (5 tiles)

### 2.1 `digifab-dosing` — Digoxin immune Fab (DigiFab) dosing

- **Citation:** Smith TW, Butler VP Jr, Haber E, et al. Treatment of life-
  threatening digitalis intoxication with digoxin-specific Fab antibody fragments:
  experience in 26 cases. *N Engl J Med.* 1982;307(22):1357-1362 (the
  body-burden dosing basis carried into the product label).
- **citationUrl:** https://doi.org/10.1056/NEJM198211253072201
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `toxicology`, `poison-control`, `pharmacy`,
  `emergency-medicine`.
- **Inputs:** the dosing mode — (a) **known amount ingested** (mg) →
  vials = amount × 0.8 (bioavailability) / 0.5 mg-bound-per-vial; (b) **steady-
  state serum digoxin level** (ng/mL) + weight (kg) → vials = (level × weight) /
  100; or (c) **empiric** (acute 10–20 vials, chronic 3–6 vials).
- **Output:** the **number of vials** (rounded up to the nearest whole vial per
  the label) with the formula used shown, plus the high-stakes second-check
  caveat. Class A (fixed label formulas).

### 2.2 `nac-dosing` — Acetaminophen N-acetylcysteine (NAC) IV dosing

- **Citation:** Prescott LF, Illingworth RN, Critchley JA, Stewart MJ, Adam RD,
  Proudfoot AT. Intravenous N-acetylcysteine: the treatment of choice for
  paracetamol poisoning. *BMJ.* 1979;2(6198):1097-1100; two-bag (SNAP) regimen
  per Bateman DN, et al. *Lancet.* 2014;383(9918):697-704.
- **citationUrl:** https://doi.org/10.1136/bmj.2.6198.1097
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `toxicology`, `poison-control`, `pharmacy`,
  `emergency-medicine`.
- **Inputs:** patient weight (kg), the regimen selector (21-hour three-bag vs
  two-bag SNAP), and (for capping) whether weight exceeds the 110-kg dosing cap.
- **Output:** the **per-bag NAC doses (mg) and infusion durations** for the
  selected regimen (three-bag: 150 mg/kg over 1 h → 50 mg/kg over 4 h →
  100 mg/kg over 16 h; two-bag: 200 mg/kg over 4 h → 100 mg/kg over 16 h), with
  the > 110 kg cap applied and shown, plus the second-check caveat. Class A.
  Cross-links the existing `acetaminophen-nomogram`.

### 2.3 `hiet-dosing` — High-dose insulin euglycemia therapy (HIET)

- **Citation:** Engebretsen KM, Kaczmarek KM, Morgan J, Holger JS. High-dose
  insulin therapy in beta-blocker and calcium channel-blocker poisoning. *Clin
  Toxicol (Phila).* 2011;49(4):277-283.
- **citationUrl:** https://doi.org/10.3109/15563650.2011.582471
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `toxicology`, `poison-control`, `pharmacy`, `critical-care`.
- **Inputs:** patient weight (kg), the desired infusion rate (units/kg/hr, default
  1, titratable to 10), and the bolus dose (units/kg, default 1).
- **Output:** the **regular-insulin bolus (units), the starting infusion rate
  (units/hr), the titration ceiling, and the accompanying dextrose infusion
  guidance** (the euglycemia coupling), with the second-check caveat. Class A.

### 2.4 `tca-bicarbonate` — TCA toxicity: QRS risk + sodium-bicarbonate target

- **Citation:** Boehnert MT, Lovejoy FH Jr. Value of the QRS duration versus the
  serum drug level in predicting seizures and ventricular arrhythmias after an
  acute overdose of tricyclic antidepressants. *N Engl J Med.*
  1985;313(8):474-479.
- **citationUrl:** https://doi.org/10.1056/NEJM198508223130804
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `toxicology`, `poison-control`, `emergency-medicine`,
  `critical-care`.
- **Inputs:** the QRS duration (ms), patient weight (kg), and the current serum
  pH/bicarbonate target.
- **Output:** the **risk band by QRS** (≥ 100 ms → seizure risk; ≥ 160 ms →
  ventricular-arrhythmia risk) **and the sodium-bicarbonate bolus** (1–2 mEq/kg
  computed from weight) with the target serum pH (7.45–7.55) shown, plus the
  second-check caveat. Class A.

### 2.5 `lithium-extrip` — Lithium dialysis decision (EXTRIP)

- **Citation:** Decker BS, Goldfarb DS, Dargan PI, et al; EXTRIP Workgroup.
  Extracorporeal treatment for lithium poisoning: systematic review and
  recommendations from the EXTRIP workgroup. *Clin J Am Soc Nephrol.*
  2015;10(5):875-887.
- **citationUrl:** https://doi.org/10.2215/CJN.10021014
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `toxicology`, `poison-control`, `critical-care`,
  `internal-medicine`.
- **Inputs:** the serum lithium level (mmol/L), renal function (impaired vs not),
  and the clinical features (decreased consciousness, seizures, life-threatening
  dysrhythmias).
- **Output:** the **ECTR (extracorporeal treatment) recommendation** per the
  EXTRIP decision tree — *recommended* if level > 4.0 mmol/L with renal
  impairment, or if life-threatening features present, or if expected time to
  level < 1.0 mmol/L exceeds 36 h; *suggested* at intermediate levels — naming
  which limb fired. Class B (the EXTRIP recommendations are revisable → 
  `docs/citation-staleness.md` row, on-publication cadence).

## 3. Per-tile robustness

- **The four dosing tiles (`digifab-dosing`, `nac-dosing`, `hiet-dosing`,
  `tca-bicarbonate`) guard weight and level domains.** Each requires a positive
  weight (and, where applicable, a non-negative level) and returns a surfaced
  `valid:false` fallback rather than a dose from a zero/blank/negative input.
  `digifab-dosing` divides by fixed nonzero constants (0.5 mg/vial, 100) and
  rounds vials up; `nac-dosing` applies the 110-kg cap as a `Math.min` and shows
  the cap; `hiet-dosing` clamps the titration rate to the published ceiling;
  `tca-bicarbonate` bounds the bicarbonate dose to 1–2 mEq/kg.
- **Every dosing tile carries the [spec-v11](spec-v11.md) §5.3 second-check note**
  — *confirm against your institutional protocol and a second check* — rendered in
  the output, per the [spec-v100](spec-v100.md) §2 clause-5 requirement. The tiles
  compute vials/doses; the give-it decision stays with the clinician.
- **`lithium-extrip` is a decision tree, not a dose.** The compute walks the
  EXTRIP limbs (level threshold, renal impairment, life-threatening features,
  projected-time limb) and returns *recommended / suggested / not indicated* with
  the firing limb named; it does not output a dialysis prescription.
- All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, and
  quote the source's interpretation.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `digifab-dosing`, `nac-dosing`, `hiet-dosing`,
  and `tca-bicarbonate` are **Class A** (fixed label/derivation formulas cited by
  journal + authors → no staleness row). `lithium-extrip` is **Class B** — the
  EXTRIP workgroup recommendations are revisable, so it gets a
  `docs/citation-staleness.md` row naming the edition in force (EXTRIP 2015,
  Decker/CJASN), the `accessed` date, and an on-publication review cadence,
  monitored by the `scripts/check-citation-cadence.mjs` warn-job. (The citation
  names the journal + author to keep the *formula* basis Class A elsewhere, but
  EXTRIP's recommendation-revisability makes this tile Class B regardless.)
- **Module & gates (§6.2):** the compute module is **`lib/tox-v110.js`** (exports
  `digifabDosing`, `nacDosing`, `hietDosing`, `tcaBicarbonate`, `lithiumExtrip`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite
  leaks; the weight/level divisions explicitly fuzzed for zero/negative). The
  renderer module is **`views/group-v35.js`**; its `RV35` export is added to the
  `app.js` `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep — the worked example renders the computed dose **and
  the second-check caveat**; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v35.js`.

## 5. Files touched

```
docs/spec-v110.md                        (this file)
app.js                                   (+5 UTILITIES rows, groups F/G; import group-v35 renderers (RV35) into RENDERERS)
lib/tox-v110.js                          (new module: digifabDosing, nacDosing, hietDosing, tcaBicarbonate, lithiumExtrip)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to acetaminophen-nomogram)
views/group-v35.js                       (new renderer module: 5 renderers; each dosing renderer renders the second-check caveat)
docs/citation-staleness.md               (+ row: lithium-extrip EXTRIP 2015)
docs/clinical-citations.md               (+5 rows for the five sources)
test/unit/digifab-dosing.test.js, nac-dosing.test.js, hiet-dosing.test.js, tca-bicarbonate.test.js, lithium-extrip.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/tox-v110.js to MODULES)
docs/audits/v12/digifab-dosing.md, nac-dosing.md, hiet-dosing.md, tca-bicarbonate.md, lithium-extrip.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 479 -> 484; Wave 2 progress in the running ledger)
CHANGELOG.md                             (Unreleased: v110 entry, +5)
README.md, package.json                  (catalog count 479 -> 484; spec-progression line -> v110)
```

## 6. Acceptance criteria

v110 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all five ids are absent (`digifab-dosing`, `nac-dosing`, `hiet-dosing`,
  `tca-bicarbonate`, `lithium-extrip`).
- All 5 tiles in §2 are live with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each including a
  **band-flip per tile** (DigiFab: serum-level mode vs amount-ingested mode giving
  different vials at the same body burden; NAC: the > 110 kg cap clamping a bag
  dose; HIET: the titration ceiling clamping the infusion rate; TCA: QRS crossing
  100 then 160 ms into successive risk bands; lithium-EXTRIP: level crossing
  4.0 mmol/L into the recommended limb), a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 check.
- **The dosing tiles (DigiFab, NAC, HIET, TCA) render the computed worked-example
  dose AND carry the second-check caveat** in the output, per the
  [spec-v100](spec-v100.md) §2 clause-5 requirement.
- The four dosing tiles guard weight/level domains (positive weight, non-negative
  level) and return a surfaced fallback on zero/blank/negative; `lithium-extrip`
  walks the decision tree and names the firing limb; partial inputs render a
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `lithium-extrip` carries `accessed` + a `docs/citation-staleness.md` row; the
  four dosing tiles carry no row (Class A formulas).
- `UTILITIES.length` is **484** (or the then-current live count + 5 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v110 with the +5 catalog delta.

## 7. Out of scope for v110

- **No antidote auto-administration** — `digifab-dosing`, `nac-dosing`, and
  `hiet-dosing` compute vials/bag-doses/infusion rates, but the *give-it* decision
  (indication, timing, route) stays with the clinician, poison center, and local
  protocol.
- **No dialysis-prescription generation** — `lithium-extrip` reports the ECTR
  recommendation and the firing limb; the modality, duration, and prescription
  stay with the nephrology/toxicology team.
- **No serum-assay or pharmacokinetic modeling** — the tiles take the clinician's
  level/weight/QRS values; they do not model absorption, redistribution, or
  rebound.
