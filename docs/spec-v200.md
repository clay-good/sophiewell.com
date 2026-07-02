# spec-v200.md — Advanced critical-care severity & acid-base: OASIS, the LODS, the vasoactive-inotropic score, the delta-gap / delta-ratio, and the APPS score (+5 tiles)

> Status: **SHIPPED (2026-07-02), +4 (not +5).** Implemented at catalog 848 → 852.
> The proposed fifth tile **vasoactive-inotropic-score (VIS) was dropped** at
> implementation: the spec-v85 §6.2 collision re-check found VIS is **already
> computed by the live `vis` tile** (`lib/clinical-v4.js`, spec-v13 §3.6) with the
> identical Gaies 2010 formula and multipliers (dopamine/dobutamine ×1,
> epinephrine/norepinephrine ×100, milrinone ×10, vasopressin ×10,000), so a
> standalone tile would duplicate it. Three spec-v97 re-verification corrections were
> applied against the **APPS** draft against Villar 2016: the PaO₂/FiO₂ middle band is
> **105–158** (not the 84–158 in §2.5), the plateau-pressure middle band is **> 27 to
> 30** (not 28–29), and the mortality tiers are **5–7 / 8–9** (not 5–6 / 7–9). The
> four shipped tiles live in `lib/critcare-severity-v200.js` with renderers in
> `views/group-v200.js` (RV200).
>
> Second feature spec of the **Deep Subspecialty
> Quantitation** program ([spec-v199](spec-v199.md) §1.1). Adds **4** deterministic
> critical-care severity, organ-dysfunction, and acid-base instruments.
> **Each tile was verified absent by a direct scan of `app.js`** (zero id / name /
> keyword hits at draft): the catalog carries `apache2`, `saps-ii`, `qsofa-sofa`,
> `psofa`, `berlin-ards`, `lis-murray`, `rox`, `anion-gap`, `corrected-anion-gap`,
> `winters`, and (as re-confirmed) `vis`, but **not** the Oxford Acute Severity of
> Illness Score, the Logistic Organ Dysfunction System, the delta-gap / delta-ratio,
> or the APPS score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v200 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no vasopressor titration, ventilator, fluid, or
> disposition order in Sophie's voice**). **Every point weight, coefficient, and
> threshold is re-fetched and cross-verified against ≥2 independent open sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing session
> **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The bedside ICU scores are carried; this slice adds the intensivist's next stratum:
two whole-database severity/organ-dysfunction models (OASIS, LODS) that quantify
sickness at admission, a hemodynamic-support quantifier (VIS) that turns a pressor
regimen into a single number the team trends, an acid-base disambiguator (delta-gap /
delta-ratio) that flags a coexisting metabolic disorder hiding behind a high anion
gap, and an ARDS outcome score (APPS) that stratifies mortality from three bedside
variables. Each is a transparent computation on numbers already at the bedside, and
each is decision support — **never a titration, ventilator, or fluid order**.

## 2. What v200 adds (5 tiles)

### 2.1 `oasis` — Oxford Acute Severity of Illness Score

- **Citation:** Johnson AEW, Kramer AA, Clifford GD. A new severity of illness scale
  using a subset of Acute Physiology and Chronic Health Evaluation data elements shows
  comparable predictive accuracy. *Crit Care Med.* 2013;41(7):1711-1718.
- **citationUrl:** https://doi.org/10.1097/CCM.0b013e31828a24fe
- **Group:** G (clinical scoring & risk). **Specialties:** `critical-care`,
  `emergency-medicine`.
- **Inputs:** the ten items, each banded per the published grid — pre-ICU length of
  stay, age, GCS, heart rate, mean arterial pressure, respiratory rate, temperature,
  urine output (24 h), mechanical ventilation (yes/no), and elective vs non-elective
  surgical status *(the per-band point weights are transcribed verbatim at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **OASIS total (0–~74)** with the logistic in-hospital-mortality
  estimate from the published intercept/slope, naming the dominant contributors;
  framed as a low-input alternative to APACHE II / SAPS II that needs no lab panel.
  Class A. Cross-links `apache2`, `saps-ii`, `sofa`.

### 2.2 `lods` — Logistic Organ Dysfunction System

- **Citation:** Le Gall JR, Klar J, Lemeshow S, et al. The Logistic Organ Dysfunction
  system. A new way to assess organ dysfunction in the intensive care unit. *JAMA.*
  1996;276(10):802-810.
- **citationUrl:** https://doi.org/10.1001/jama.1996.03540100046027
- **Group:** G. **Specialties:** `critical-care`.
- **Inputs:** the worst first-24-hour value in each of six organ systems —
  neurologic (GCS), cardiovascular (heart rate, systolic BP), renal (urea/BUN,
  creatinine, urine output), pulmonary (PaO₂/FiO₂ with ventilation), hematologic (WBC,
  platelets), and hepatic (bilirubin, prothrombin time) — each mapped to 0/1/3/5 per
  the published grid *(verify the grid at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **LODS total (0–22)** with the logistic hospital-mortality estimate
  and the per-system dysfunction levels, naming which systems drove the score; framed
  as an organ-dysfunction complement to SOFA with a calibrated mortality model. Class
  A. Cross-links `sofa`, `oasis`.

### 2.3 `vasoactive-inotropic-score` — Vasoactive-Inotropic Score (VIS)

- **Citation:** Gaies MG, Gurney JG, Yen AH, et al. Vasoactive-inotropic score as a
  predictor of morbidity and mortality in infants after cardiopulmonary bypass.
  *Pediatr Crit Care Med.* 2010;11(2):234-238.
- **citationUrl:** https://doi.org/10.1097/PCC.0b013e3181b806fc
- **Group:** F (dose & rate math) / G. **Specialties:** `critical-care`,
  `pediatric-critical-care`, `cardiac-surgery`.
- **Inputs:** the concurrent infusion rates — dopamine (µg/kg/min), dobutamine
  (µg/kg/min), epinephrine (µg/kg/min), norepinephrine (µg/kg/min), milrinone
  (µg/kg/min), vasopressin (units/kg/min), each optional.
- **Output:** the **VIS** = dopamine + dobutamine + 100 × epinephrine + 10 ×
  milrinone + 10,000 × vasopressin + 100 × norepinephrine *(verify the norepinephrine
  and vasopressin multipliers against the original and the Gaies 2014 update at
  implementation, [spec-v97](spec-v97.md))*, naming the agents contributing most; a
  higher VIS quantifies greater hemodynamic support, trended over time. Class A.
  Cross-links `shock-index`.

### 2.4 `delta-gap` — Delta gap / delta-ratio (delta-delta)

- **Citation:** Wrenn K. The delta (delta) gap: an approach to mixed acid-base
  disorders. *Ann Emerg Med.* 1990;19(11):1310-1313. Corroborated by Rastegar A. Use
  of the ΔAG/ΔHCO₃⁻ ratio in the diagnosis of mixed acid-base disorders. *J Am Soc
  Nephrol.* 2007;18(9):2429-2431.
- **citationUrl:** https://doi.org/10.1681/ASN.2006121408
- **Group:** F / G. **Specialties:** `critical-care`, `nephrology`,
  `emergency-medicine`.
- **Inputs:** sodium, chloride, and bicarbonate (mEq/L); optional albumin (g/dL) for
  the corrected anion gap; a configurable normal anion gap (default 12) and normal
  HCO₃⁻ (default 24).
- **Output:** the **anion gap**, the **delta gap** = (AG − normal AG) − (normal HCO₃⁻
  − measured HCO₃⁻), and the **delta ratio** = (AG − normal AG) / (normal HCO₃⁻ −
  measured HCO₃⁻), with the standard interpretation — **< 0.4** concurrent
  non-anion-gap metabolic acidosis, **0.4–0.8** mixed, **1–2** pure high-anion-gap
  metabolic acidosis, **> 2** coexisting metabolic alkalosis or chronic respiratory
  acidosis *(verify the interpretive bands at implementation, [spec-v97](spec-v97.md))*.
  Class A. Cross-links `anion-gap`, `corrected-anion-gap`, `winters`.

### 2.5 `apps-ards` — APPS score (Age, PaO₂/FiO₂, Plateau pressure in ARDS)

- **Citation:** Villar J, Ambrós A, Soler JA, et al. Age, PaO₂/FiO₂, and Plateau
  Pressure Score: A Proposal for a Simple Outcome Score in Patients With the Acute
  Respiratory Distress Syndrome. *Crit Care Med.* 2016;44(7):1361-1369.
- **citationUrl:** https://doi.org/10.1097/CCM.0000000000001653
- **Group:** G. **Specialties:** `critical-care`, `pulmonology`.
- **Inputs:** the three banded items at 24 h — age (≤ 46 → 1, 47–66 → 2, > 66 → 3),
  PaO₂/FiO₂ (> 158 → 1, 84–158 → 2, < 84 → 3), and plateau pressure (≤ 27 → 1, 28–29
  → 2, ≥ 30 cmH₂O → 3) *(verify the exact cut-points at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **APPS total (3–9)** with the three mortality tiers — **low 3–4,
  intermediate 5–6, high 7–9** — naming the contributors; framed as a simple ARDS
  outcome stratifier from three bedside variables. Class A. Cross-links `berlin-ards`,
  `lis-murray`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The delta-ratio
  divides by (normal HCO₃⁻ − measured HCO₃⁻); when that denominator is zero or the
  bicarbonate is at/above normal, the tile renders a "no delta to compute — bicarbonate
  is not depressed" explanation rather than a `NaN`/`Infinity`. VIS with all fields
  blank renders a complete-the-fields fallback.
- **Each tile reports which band/level applies and names the contributing items**
  ([spec-v59](spec-v59.md)); OASIS and LODS also surface the calibrated mortality
  estimate beside the point total so the number is never read alone.
- **All five render assessment, not orders** — VIS quantifies support without
  recommending a titration; APPS/OASIS/LODS stratify without a ventilator or
  disposition order ([spec-v11](spec-v11.md) §5.3). Each renders the
  [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries and at the delta-ratio's zero
  denominator.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/coefficient
  models. OASIS/LODS carry a logistic intercept and coefficients transcribed verbatim;
  the implementing session confirms whether any citation trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/critcare-severity-v200.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v200.js`; its `RV200` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass. Any ASCII-token unit in an
  `example.expected` (e.g. `cmH2O`, `mEq/L`) is emitted in ASCII by `formatResult`
  (the cardio-v90 precedent) so the example-correctness regex matches.
- **Specialties** are drawn from the closed vocabulary: `critical-care`,
  `emergency-medicine`, `nephrology`, `pulmonology`, `pediatric-critical-care`,
  `cardiac-surgery` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v200.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v200 RV200 into RENDERERS)
lib/critcare-severity-v200.js            (new: oasis, lods, vis, deltaGap, appsArds)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to apache2, sofa, anion-gap, berlin-ards)
views/group-v200.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/oasis.test.js, lods.test.js, vis.test.js, delta-gap.test.js, apps-ards.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/critcare-severity-v200.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v200 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v200 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **OASIS
  spanning a mortality range**, a **LODS crossing organ-system levels**, a **VIS with
  multiple concurrent agents**, a **delta-ratio in each of the < 0.4 / 1–2 / > 2
  bands**, and an **APPS low / intermediate / high triple**.
- Every compute is finite-guarded (delta-ratio zero-denominator handled), routes
  through `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with
  **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v200 with the +5 delta.

## 7. Out of scope for v200

- **No titration / ventilator / fluid / disposition order** — the tiles quantify and
  stratify; the pressor, ventilator-setting, resuscitation, and admission decisions
  stay with the intensivist and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary full-database engine** — APACHE III/IV coefficient sets are
  licensed and not freely reproducible; they remain deferred under
  [spec-v97](spec-v97.md). OASIS and LODS are included precisely because their models
  are open.
