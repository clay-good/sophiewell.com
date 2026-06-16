# spec-v88.md — Endocrine & oncologic emergencies: DKA/HHS classification, Calvert carboplatin dose, and Cairo-Bishop tumor lysis (+3 tiles)

> Status: **PROPOSED (2026-06-16).** Third feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **3**
> deterministic high-acuity calculators across endocrinology and oncology: the
> ADA hyperglycemic-crisis (DKA vs HHS) diagnostic and severity classifier, the
> Calvert-formula carboplatin dose with the FDA GFR cap, and the Cairo-Bishop
> tumor-lysis-syndrome laboratory/clinical grading. The catalog ships
> `burch-wartofsky` (thyroid storm) but no DKA/HHS classifier, ships rich
> weight-based dosing but no AUC-based chemotherapy dose, and ships `kdigo-aki` but
> no tumor-lysis grading. None duplicates an existing tile.
>
> Catalog effect at v88 close: **372 + 3 = 375 tiles.**
>
> Every prior spec (v4 through v87) remains in force. v88 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

Three of the most time-critical computations in inpatient medicine and oncology are
deterministic and currently absent:

- **DKA vs HHS is a classification, not a guess.** The ADA hyperglycemic-crisis
  criteria classify the crisis by glucose, pH, bicarbonate, ketones, effective
  serum osmolality, anion gap, and mental status — and grade DKA mild/moderate/
  severe on fixed cutoffs. The catalog computes anion gap and effective osmolality
  separately but never assembles them into the crisis classification a clinician
  needs at the bedside.

- **Carboplatin is dosed by the Calvert formula, and the GFR must be capped.** The
  Calvert formula (dose = target AUC × (GFR + 25)) is the standard, and the FDA
  warns that when GFR is estimated from serum creatinine, capping it at 125 mL/min
  prevents systematic overdosing with modern (IDMS-standardized) creatinine assays.
  This is a high-stakes, purely deterministic dose with no tile today.

- **Tumor lysis syndrome is the Cairo-Bishop definition.** Laboratory TLS requires
  ≥ 2 metabolic abnormalities within a defined window; clinical TLS adds an
  end-organ criterion; the grading is fixed. The catalog has KDIGO AKI staging but
  not the TLS definition that often precedes it.

Each is a published, deterministic instrument a physician already uses; v88 brings
them onto the page.

## 2. What v88 adds (3 tiles)

### 2.1 `dka-hhs` — Hyperglycemic-crisis classification & DKA severity (ADA)

- **Citation:** Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. Hyperglycemic
  crises in adult patients with diabetes. *Diabetes Care.* 2009;32(7):1335-1343;
  with the current diagnostic thresholds reconciled to the ADA/EASD consensus —
  ElSayed NA, et al / Umpierrez GE, et al. Hyperglycemic Crises in Adults With
  Diabetes: A Consensus Report. *Diabetes Care.* 2024.
- **citationUrl:** https://doi.org/10.2337/dc09-9032
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `emergency-medicine`, `critical-care`,
  `hospital-medicine`, `nursing-ed`.
- **Inputs:** plasma glucose (mg/dL); arterial or venous pH; serum bicarbonate
  (mEq/L); ketones (serum β-hydroxybutyrate mmol/L, or urine ketone grade); mental
  status (alert / drowsy / stupor-coma); and sodium, glucose, BUN for the effective-
  osmolality and anion-gap computation (reused from the catalog's existing math).
- **Output:** the **classification** — **DKA** (hyperglycemia + acidosis +
  ketosis), graded **mild** (pH 7.25–7.30, HCO₃ 15–18, alert), **moderate** (pH
  7.00–7.24, HCO₃ 10–14, alert/drowsy), or **severe** (pH < 7.00, HCO₃ < 10,
  stupor/coma) per the ADA table; **HHS** (glucose > 600 mg/dL, effective osmolality
  > 320 mOsm/kg, pH > 7.30, HCO₃ > 18, minimal ketosis); or a **mixed DKA/HHS**
  picture when both are met — with the computed **anion gap** and **effective serum
  osmolality** (2·Na + glucose/18) shown as derivations and the criterion grid
  showing which thresholds were met. Cross-links `anion-gap-dd`, `osmolal-gap`,
  `corrected-sodium`. ADA thresholds are revisable → `docs/citation-staleness.md`
  row.

### 2.2 `calvert-carboplatin` — Carboplatin dose (Calvert formula, with FDA GFR cap)

- **Citation:** Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage:
  prospective evaluation of a simple formula based on renal function. *J Clin
  Oncol.* 1989;7(11):1748-1756. GFR-cap guidance: FDA recommendation (2010) to cap
  estimated GFR at 125 mL/min for carboplatin dosing when GFR is derived from serum
  creatinine.
- **citationUrl:** https://doi.org/10.1200/JCO.1989.7.11.1748
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `oncology`, `hematology`, `pharmacy`, `nursing-onc`.
- **Inputs:** target AUC (mg/mL·min — typically 4–6, entered); GFR (mL/min — entered
  directly, or computed from the catalog's Cockcroft-Gault inputs); and a **cap GFR
  at 125 mL/min** toggle (default on, per the FDA recommendation) with the estimate
  method noted.
- **Output:** **total carboplatin dose (mg) = target AUC × (GFR + 25)**, shown as a
  derivation, with the **GFR-cap warning** rendered prominently when an estimated
  GFR > 125 was capped (the case that otherwise overdoses), and a note that the
  capped value was used. Cross-links `cockcroft-gault`, `egfr-suite`, `bsa`. The
  posture note adds the [spec-v85](spec-v85.md) §2 clause-5 chemotherapy line:
  *confirm against your institutional protocol and an independent dose check.*

### 2.3 `tls-cairo-bishop` — Tumor lysis syndrome (Cairo-Bishop laboratory & clinical grading)

- **Citation:** Cairo MS, Bishop M. Tumour lysis syndrome: new therapeutic
  strategies and classification. *Br J Haematol.* 2004;127(1):3-11.
- **citationUrl:** https://doi.org/10.1111/j.1365-2141.2004.05094.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `hematology`, `nephrology`, `critical-care`,
  `emergency-medicine`.
- **Inputs:** serum uric acid (mg/dL), potassium (mEq/L), phosphate (mg/dL), and
  calcium (mg/dL), with an option to enter the baseline value so the **25%-change**
  criterion can be evaluated; serum creatinine with the patient's age/sex ULN (for
  the ≥ 1.5× ULN clinical criterion); and the clinical end-organ findings (cardiac
  arrhythmia / sudden death, seizure). Adult vs pediatric toggle (the phosphate
  threshold differs).
- **Output:** **Laboratory TLS** when **≥ 2** of — uric acid ≥ 8 mg/dL (or 25%
  increase from baseline); potassium ≥ 6 mEq/L (or 25% increase); phosphate ≥ 4.5
  mg/dL adult / ≥ 6.5 mg/dL pediatric (or 25% increase); corrected calcium ≤ 7 mg/dL
  (or 25% decrease) — are present within the window (3 days before to 7 days after
  cytotoxic therapy, stated as the assumed timing). **Clinical TLS** when laboratory
  TLS plus an end-organ criterion (creatinine ≥ 1.5× ULN, cardiac arrhythmia/sudden
  death, or seizure), with the **Cairo-Bishop grade (0–V)** assigned. The output
  shows the criterion grid (which abnormalities met threshold). Cross-links
  `kdigo-aki`, `corrected-calcium`.

## 3. Per-tile robustness

- **`dka-hhs` reuses, never re-derives, the catalog math.** The anion gap and
  effective osmolality come from the same `lib/num.js`-backed helpers the existing
  tiles use; the classification is a guarded decision over the ADA thresholds, and a
  partial input (e.g. glucose without pH) renders a "(enter pH and bicarbonate to
  classify)" fallback rather than a misleading verdict.
- **`calvert-carboplatin` makes the cap visible and safe.** The dose multiplies two
  guarded positive inputs; an estimated GFR > 125 with the cap on is computed at 125
  **and the substitution is shown**, so the user can never silently receive the
  uncapped (overdosing) result. AUC and GFR are range-clamped; a blank GFR returns a
  surfaced fallback, never a dose computed from `NaN`.
- **`tls-cairo-bishop` handles the percent-change branch explicitly.** When a
  baseline is supplied, the 25%-change criterion is evaluated against it; when it is
  not, only the absolute thresholds apply and the output says so (it does not assume
  a baseline). The corrected-calcium criterion reuses the catalog's albumin
  correction.
- All three render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's classification/grade; none authors a treatment recommendation in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3). The [spec-v59](spec-v59.md) fuzz
  harness covers all three modules with zero non-finite leaks.

## 4. Files touched

```
docs/spec-v88.md                         (this file)
app.js                                   (+3 UTILITIES rows: dka-hhs & tls-cairo-bishop in G, calvert-carboplatin in F; import group-v14 renderers into RENDERERS)
lib/metabolic-onc-v88.js                 (new module: dkaHhs, calvertCarboplatin, tlsCairoBishop)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to anion-gap-dd, osmolal-gap, cockcroft-gault, kdigo-aki, corrected-calcium)
views/group-v14.js                       (new renderer module: 3 renderers; DKA/HHS criterion grid, Calvert derivation + cap warning, TLS criterion grid)
docs/citation-staleness.md               (+ rows: ADA hyperglycemic-crisis thresholds (2024 consensus), FDA carboplatin GFR-cap guidance)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/dka-hhs.test.js                (new; ≥3 worked examples incl. severe-DKA, pure-HHS, and mixed-picture boundaries)
test/unit/calvert-carboplatin.test.js    (new; ≥3 incl. the GFR>125 cap case and a blank-GFR guard)
test/unit/tls-cairo-bishop.test.js       (new; ≥3 incl. the 2-abnormality lab-TLS boundary, the clinical-TLS upgrade, and the with/without-baseline percent-change branch)
test/unit/fuzz-tools.test.js             (add lib/metabolic-onc-v88.js to MODULES)
docs/audits/v12/dka-hhs.md, calvert-carboplatin.md, tls-cairo-bishop.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 372 -> 375; append to the running ledger)
CHANGELOG.md                             (Unreleased: v88 entry, +3)
README.md, package.json                  (catalog count 372 -> 375; spec-progression line -> v88)
```

## 5. Acceptance criteria

v88 is fully shipped when:

- All 3 tiles in §2 are live in their stated group with a `META[id]` entry, an
  inline primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples
  in the unit test, a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 scope check.
- `dka-hhs` classifies a severe DKA (pH < 7.00), a pure HHS (glucose > 600, eff.
  osm > 320, pH > 7.30), and a mixed picture, showing the computed anion gap and
  effective osmolality and the criterion grid; partial inputs render the
  complete-the-fields fallback.
- `calvert-carboplatin` returns AUC × (GFR + 25), caps an estimated GFR > 125 at 125
  with a visible substitution warning, and guards a blank GFR.
- `tls-cairo-bishop` flags laboratory TLS at exactly 2 abnormalities, upgrades to
  clinical TLS on an end-organ criterion with a Cairo-Bishop grade, and evaluates
  the 25%-change criterion only when a baseline is supplied.
- Every compute function uses `lib/num.js`, guards its divisions, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The revisable thresholds (ADA, FDA cap) carry `accessed` + a
  `docs/citation-staleness.md` row.
- `UTILITIES.length` is **375** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v88 with the +3 catalog delta.

## 6. Out of scope for v88

- **No insulin/fluid/electrolyte regimen for DKA/HHS.** `dka-hhs` classifies and
  grades; it does not generate the insulin-infusion, fluid-resuscitation, or
  potassium-replacement orders. The catalog's `insulin-drip`,
  `electrolyte-replacement`, `potassium-deficit`, `free-water-deficit`, and
  `sodium-correction` tiles cover those computations and are cross-linked.
- **No TLS risk-stratification or rasburicase-vs-allopurinol selection.**
  `tls-cairo-bishop` applies the diagnostic/grading definition; the pre-chemotherapy
  risk tier (low/intermediate/high by malignancy type and burden) and the
  prophylaxis choice are management decisions left to the clinician and protocol.
- **No other chemotherapy dosing in this spec.** `calvert-carboplatin` is the one
  AUC-based dose; BSA-based cytotoxic dosing, dose-capping by ideal body weight, and
  reduction tables are deferred to a future Group F oncology-dosing spec.
- **No auto-diagnosis.** Each tile reports the classification/grade and the source's
  definition; the diagnosis and treatment stay with the clinician.
