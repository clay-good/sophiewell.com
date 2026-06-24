# spec-v166.md — Pharmacokinetics & psych dosing: PK suite, chlorpromazine equivalents, and lithium maintenance nomogram (+3 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v162](spec-v162.md) **Cross-Discipline Completion** program. Adds **3**
> deterministic pharmacy computes that fill confirmed gaps — the catalog has
> drug-*specific* PK (`vanc-auc`, `aminoglycoside`, `digoxin`) but **no generic
> pharmacokinetic math**, and the antipsychotic equivalence parallel to the live
> `opioid-mme`/`benzo-equiv`/`steroid-equiv` converters is absent. None duplicates
> a live tile.
>
> Catalog effect at v166 close: **live count + 3** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v165) remains in force. v166 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Conversion factors are re-fetched
> and cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Clinical pharmacists reach for three computes the catalog does not provide: the
**generic first-order pharmacokinetic relationships** (loading/maintenance dose,
half-life, time-to-steady-state) that underlie all the drug-specific tiles, the
**chlorpromazine-equivalent** antipsychotic conversion (the psych analogue to the
opioid/benzo/steroid converters already shipped), and the **lithium maintenance
nomogram** that predicts a maintenance dose from a test-dose level.

## 2. What v166 adds (3 tiles)

### 2.1 `pk-suite` — Pharmacokinetics Suite (loading / maintenance / half-life)

- **Citation:** Rowland M, Tozer TN. *Clinical Pharmacokinetics and
  Pharmacodynamics: Concepts and Applications.* 4th ed. (first-order PK relations).
- **citationUrl:** (textbook — verify edition/page at implementation)
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `critical-care`, `internal-medicine`.
- **Inputs:** any consistent subset of volume of distribution (Vd, L or L/kg),
  clearance (CL, L/h), target/desired concentration (Cp), bioavailability (F), and
  dosing interval (τ).
- **Output:** **loading dose = Vd·Cp/F**, **maintenance dose = CL·Css·τ/F**,
  **elimination rate constant k = CL/Vd**, **half-life t½ = 0.693·Vd/CL**, and
  **time to steady state = 5·t½**. Class A. Each output is computed only when its
  inputs are present; every division (`F`, `Vd`, `CL`) is guarded. A multi-output
  suite tile (parallels `hemodynamic-suite`).

### 2.2 `chlorpromazine-equivalents` — Antipsychotic Chlorpromazine Equivalents

- **Citation:** Leucht S, Samara M, Heres S, et al. Dose equivalents for
  antipsychotic drugs: the DDD method. *Schizophr Bull.* 2016;42 Suppl 1:S90-94
  (and Gardner DM, et al. *Am J Psychiatry.* 2010;167(6):686-693).
- **citationUrl:** https://doi.org/10.1093/schbul/sbv167 (verify at implementation)
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `psychiatry`.
- **Inputs:** the antipsychotic agent and its total daily dose (mg).
- **Output:** the **chlorpromazine-equivalent daily dose (mg CPZ-eq)** using a
  cross-verified conversion table, with the explicit note that equivalence methods
  differ (DDD vs consensus vs classical-100mg) and that conversions are
  approximations. Class A. **Sourcing discipline ([spec-v97](spec-v97.md)):** the
  per-agent factors are re-fetched and cross-verified to ≥2 sources; the method used
  is named (mirrors how `opioid-mme` and `benzo-equiv` handle multi-source factors).

### 2.3 `lithium-maintenance` — Lithium Maintenance Dose Nomogram

- **Citation:** Cooper TB, Bergner PE, Simpson GM. The 24-hour serum lithium level
  as a prognosticator of dosage requirements. *Am J Psychiatry.*
  1973;130(5):601-603.
- **citationUrl:** https://doi.org/10.1176/ajp.130.5.601 (verify at implementation)
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `psychiatry`.
- **Inputs:** the **24-hour serum lithium level after a single 600 mg test dose**
  (mEq/L).
- **Output:** the **predicted maintenance dose band** per the Cooper nomogram (e.g.
  level <0.05 → 1200 mg/day, 0.05–0.09 → 900 mg, 0.10–0.14 → 600 mg, 0.15–0.19 →
  300 mg, 0.20–0.23 → 300 mg with caution, ≥0.30 → 150–200 mg/long-interval), with
  the target trough framing. Class A. Maps the level to exactly one band; values are
  re-verified to ≥2 sources at implementation. Cross-linked to `lithium-extrip`
  (dialysis-decision tile).

## 3. Per-tile robustness

- **`pk-suite`** computes each relation only when its inputs are supplied; every
  division (`F`, `Vd`, `CL`) is finite-checked and guarded — missing inputs render
  the relevant output as "provide Vd/CL/…" rather than `NaN`, and a zero denominator
  returns a surfaced `valid:false`.
- **`chlorpromazine-equivalents`** is a bounded lookup × dose; an unknown agent or
  non-finite dose returns a surfaced fallback; the named method prevents a silent
  mix of equivalence systems.
- **`lithium-maintenance`** maps the test-dose level to exactly one defined dose band
  (no `undefined` band); the band boundaries are unit-tested, and the renderer states
  it predicts a *starting* maintenance dose requiring level monitoring.
- All three render the [spec-v50](spec-v50.md) §3 posture note (PK estimates and
  equivalence conversions are approximations requiring individualization and
  monitoring) and author no order ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all three cite textbook/journal sources → **Class
  A**; none trips `ISSUER_PATTERN`; **no `citation-staleness.md` row.**
- **Specialty vocabulary:** no new tags (`pharmacy`, `psychiatry`, `critical-care`,
  `internal-medicine` all exist).
- **Build & gates (§6.1/§6.2):** the three computes live in the new
  `lib/pk-v166.js` module (`pkSuite`, `chlorpromazineEquivalents`,
  `lithiumMaintenance`), added to `fuzz-tools.test.js` `MODULES` (the PK divisions
  fuzzed). Renderers live in the new `views/group-v166.js`; its `RV166` export is
  spread into `app.js` `RENDERERS`. The catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v166.md                        (this file)
app.js                                   (+3 UTILITIES rows, group F; import group-v166 RV166 into RENDERERS)
lib/pk-v166.js                           (new module: pkSuite, chlorpromazineEquivalents, lithiumMaintenance)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to vanc-auc, opioid-mme, benzo-equiv, steroid-equiv, lithium-extrip)
views/group-v166.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/pk-suite.test.js, chlorpromazine-equivalents.test.js, lithium-maintenance.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pk-v166.js to MODULES)
docs/audits/v12/pk-suite.md, chlorpromazine-equivalents.md, lithium-maintenance.md   (spec-v11 audit logs)
docs/scope-cross-discipline.md           (catalog ledger; advance the v162 running count)
CHANGELOG.md                             (Unreleased: v166 entry, +3)
README.md, package.json                  (catalog count + spec-progression line -> v166)
```

## 6. Acceptance criteria

v166 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all three ids are absent.
- All 3 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **PK
  half-life = 0.693·Vd/CL with time-to-steady-state**, a **chlorpromazine-equivalent
  conversion with the method named**, and a **lithium nomogram level→dose-band
  boundary**), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every PK division is guarded; partial PK input yields per-output prompts not `NaN`;
  the lithium nomogram maps every level to one band; blank inputs render a
  complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 3 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v166 with the +3 delta.

## 7. Out of scope for v166

- **No Bayesian/population PK** — `pk-suite` is first-order point math, not a MAP
  Bayesian estimator (`vanc-auc` already owns vancomycin-specific AUC math).
- **No antipsychotic interchange recommendation** — `chlorpromazine-equivalents`
  reports an approximate equivalent dose; cross-titration is a clinical decision.
- **No lithium level interpretation/toxicity** — `lithium-extrip` owns the toxicity/
  dialysis decision; v166 cross-links.
