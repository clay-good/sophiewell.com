# spec-v61.md — Tool-value enhancement pass & new bedside tiles (12 tiles)

> Status: Part B shipped (2026-06-06); Part A partially shipped (A2
> related-tool linking, A5 copy-link, A6 printable handoff, A8
> interpretation-band parity, and A7 opt-in input persistence landed —
> A6 extended the shared print template to `sbar-template` and
> `code-blue-clock`; A8 backfilled 45 score tiles, raising
> `META[id].interpretation` coverage from 150 to 195; A7 added the
> client-only, off-by-default "Remember my inputs on this device"
> toggle (`lib/input-persist.js`, numeric/choice inputs only, never
> PHI free-text). A4 unit toggles and A3 labeled copy then landed for
> the Group E clinical-math tiles: `bmi`/`bsa`/`cockcroft-gault` gained
> per-field unit `<select>`s driven by `lib/unit-convert.js`
> (weight kg⇄lb, height m/cm⇄in, creatinine mg/dL⇄µmol/L; canonical
> default so examples/deep-links are byte-identical), and the
> multi-output tiles (`bsa`, `anion-gap`, `corrected-sodium`,
> `aa-gradient`) gained a `formatCopyAll`-backed "Copy results" button
> (`test/integration/unit-toggle.spec.js`). A2 is now finished: the
> related-tool rollout reaches the whole catalog — a single reviewable
> `RELATED_BACKFILL` map (merged into META, deferring to the inline v61
> seeds) raised `META[id].related` coverage from 9 to 267 tiles across
> the clinical families (VTE, sepsis, pneumonia, stroke, GI bleed,
> renal/acid-base, oxygenation, sedation/pain, screeners, OB/peds,
> dosing); `related-tools.test.js` pins every link to a real tile, caps
> each list at four siblings for phone layout, and floors the rollout at
> 250 tiles. The A4 weight toggle then
> rolled out via shared helpers (`lib/field-units.js`): a kg⇄lb toggle
> on every weight-bearing dosing tile in Group F (`weight-dose`,
> `conc-rate`, `vasopressor`, `crrt-dose`, `ecmo-titration`) and the
> twelve v61 bedside tiles (`urine-output`, `gir`, `ebv-mabl`,
> `potassium-deficit`, `peds-transfusion-volume`, `burn-uop-target`,
> `fluid-balance`), feeding canonical kg to both the formula and
> `boundsAdvisory()`. A1's named high-value scores (Braden, MEWS,
> NEWS2, HEART, Wells, Caprini) already carry derivation; A1's
> lower-value tail is being worked down one small wave at a time —
> the simple additive screening scores `sirs`, `apfel`, and
> `aims65` now carry a full derivation block (formula, per-input
> components, bands, population, validity, and a verbatim `source`
> that reuses the tile's already-vetted inline citation), wired
> through `renderDerivation`/`updateDerivationSteps` in
> `views/group-g.js`; each component sum is cross-checked against
> the live scoring function in `derivation.test.js`. Wave 2 of the
> same tail adds the three additive ED screening / decision scores
> `feverpain`, `canadian-syncope`, and `stone-score` (wired in
> `views/group-v9.js`); the Canadian Syncope Score's signed weights
> and STONE's mixed categorical/binary `points` callbacks are
> component-sum cross-checked against `canadianSyncope().score`,
> `stoneScore().score`, and `feverpain().total`. Wave 3 adds the
> additive scores `padua`, `epworth`, and `nrs2002` (wired in
> `views/group-g.js`); a
> shared `essClamp` helper in `lib/meta.js` mirrors the Epworth
> rating clamp so the show-your-work sum reproduces the live score
> on out-of-range input. Wave 4 adds the three "five signs, 0-2
> each, sum" bedside scores `apgar`, `silverman-andersen`, and
> `downes` (wired in `views/group-g.js` and `views/group-v10.js`);
> a shared `sign02Clamp`
> helper in `lib/meta.js` mirrors the live `num()`/`sumItems()`
> range guard so the component sum reproduces each live total. Wave
> 5 adds the PE-prognosis scores `pesi` (raw age + male-sex
> callback + nine weighted predictors) and `spesi` (six equal
> binaries) plus the pediatric `nigrovic` Bacterial Meningitis
> Score (Gram stain weighted +2), wired in `views/group-g.js`. Wave
> 6 adds the GI-bleed risk family — `gbs` (Glasgow-Blatchford, with
> banded BUN/Hgb/SBP weights and sex-specific hemoglobin bands),
> `rockall` (clamped ordinals plus the pre-endoscopy variant that
> omits the last two items), and `oakland` (banded age/HR/SBP/Hgb
> plus binaries) — each banded weight encoded as a `points` callback
> that replicates the live banding so the component sum reproduces
> the live `score` exactly. Wave 7 adds the ICU-prognosis additive
> indices — `nutric` and `mnutric` (banded age/APACHE/SOFA weights
> plus binaries; mNUTRIC drops the IL-6 term) and `mods` (six
> organ-system 0-4 subscores). Wave 8 adds the specialty bedside
> point scales whose inputs are already per-criterion point values
> — `burch-wartofsky` (thyroid storm), `ariscat` (postoperative
> pulmonary complications), and `braden-q` (pediatric
> pressure-injury risk). Wave 9 adds three high-value scores of
> distinct shapes — `hacor` (banded NIV-failure risk, its P/F band
> computed from PaO2 and FiO2 in a callback), `vis` (continuous
> weighted sum of vasoactive infusion rates), and `charlson` (the
> Comorbidity Index, with severity-dominance callbacks and age
> points). Wave 10 adds the array-scored brief screeners —
> `audit-full` (AUDIT), `dast10` (DAST-10), and `gds15` (GDS-15) —
> whose show-your-work breakdown makes the reverse-scored items
> explicit. Wave 11 adds the pediatric/neonatal bedside scales
> `nips` and `cries` (neonatal pain) and `peds-gcs` (the pediatric
> Glasgow Coma Scale). Wave 12 adds the age-banded pediatric
> organ-dysfunction scores `pelod2` (PELOD-2) and `psofa` (pSOFA);
> their derivation mirrors the scoring module's age-band tables and
> is cross-checked across age bands. Wave 13 adds `apache2`
> (APACHE II) — its twelve banded acute-physiology variables (via a
> mirrored `apsStep` lookup), the `15 - GCS` neuro term, age points,
> and a cross-input chronic-health callback. Wave 14 adds `mnihss`
> (the modified NIHSS — eleven 0-N stroke items summed). Wave 15 adds
> `finnegan` (the modified Finnegan neonatal-abstinence score — 24
> weighted-binary signs plus three graded items), the last
> additive-score tile; with it every summed/weighted-additive score
> in the catalog carries derivation, bringing coverage to 117 tiles. A2
> (related-tool linking) is complete. A3 (chart-ready labeled copy) is now
> complete across Group E, the five 2+-numeric-output v61 bedside
> tiles (`ebv-mabl`, `peds-transfusion-volume`, `rhig-dose`,
> `fluid-balance`, `carb-insulin-bolus`), and (A3 wave 2) the six
> multi-output Group V5 lab / clinical-math tiles (`sodium-correction`,
> `free-water-deficit`, `iron-ganzoni`, `pbw-ardsnet`, `lights`,
> `corrected-anion-gap`), and (A3 wave 3) the three multi-output Group F
> medication / infusion tiles (`drip-rate`, `tpn-macro`,
> `insulin-correction` — the latter two folding their `<h2>` headline
> total into the labeled list, as `anion-gap-dd` did), and (A3 wave 4)
> the three multi-output Group I field-medicine tiles (`burn-fluid`,
> `peds-ett`, `naloxone` — `burn-fluid` folding its two `<h3>`-headed
> resuscitation-method blocks into one `resultRow` with inline
> section-header `{ text }` items, so a medic copies the whole
> Parkland-plus-Brooke schedule in one action). The `resultRow`
> helper was
> promoted to a shared module (`lib/result-copy.js`) so `group-v11`,
> `group-e`, and future view modules use one byte-identical
> implementation, then every multi-output Group E calculator was wired
> to it: the simple results (`bsa`, `anion-gap`, `corrected-sodium`,
> `aa-gradient`), the suite tiles (`osmolal-gap`, `aa-pf-suite`,
> `winters`, `shock-index`, `bw-bsa-suite`, `egfr-suite`,
> `fena-feurea`, `qtc-suite`, `corrected-ca-na`), and `anion-gap-dd`
> (whose primary anion-gap result was folded out of its `<h2>` headline
> into the labeled `resultRow` list so it is part of the "Copy results"
> payload). Every multi-output Group E, Group V5, Group F medication /
> infusion, and Group I field-medicine tile now offers a
> `formatCopyAll`-backed "Copy results" button;
> single-numeric-output calculators (one value plus an interpretation line)
> have nothing multi-line worth a separate button and keep the universal
> "Copy all".
> v61 has two parts.
> **Part A** is
> a zero-tile *enhancement* pass that raises the value of the
> existing catalog by finishing three features that are partial or
> entirely absent today — "show your work" derivation, related-tool
> linking, and chart-ready output — plus unit toggles, a visible
> share affordance, and opt-in input persistence. **Part B** adds
> **12** deterministic, bedside-necessary nursing tiles that fill
> confirmed medication-safety, electrolyte/fluid, and OB/peds gaps.
> None duplicates an existing tile or any tile proposed in v55–v58
> (checked against the 307-tile post-v58 catalog). Every new tile
> passes the [spec-v29](spec-v29.md) §3 one-line test.
>
> Catalog effect at v61 close: **307 + 12 = 319 tiles.**
>
> Every prior spec (v4 through v60) remains in force. v61 adds no
> runtime network call and no AI; each new tile ships its primary
> citation inline ([spec-v54](spec-v54.md)/[spec-v60](spec-v60.md))
> and inherits the [spec-v59](spec-v59.md) input/output-safety
> contract. Sophie's eight commitments ([spec-v50](spec-v50.md)
> §3) are preserved.

## 1. Thesis

The catalog is broad and correct; the open value is in two places.

First, several features that would make the *existing* tiles more
useful at the bedside are built but only partially rolled out, or
designed-for but never implemented:

- **"Show your work"** (`lib/derivation.js`) is rendered on only
  **80 of 255** tiles. A nurse charting a Braden, MEWS, or HEART
  score wants the per-input contribution list to defend the number
  she is about to act on.
- **Related-tool linking** does not exist at all: `META[].related`
  is defined on **0** tiles and rendered nowhere. A nurse on
  `wells-pe` should be one click from `perc`, `pesi`, and
  `years-pe`; `cockcroft-gault` should point to `egfr-suite` and
  the renal-dosing tools.
- **Chart-ready output**: `lib/clipboard.js`'s `formatCopyAll`
  (clean `Label: Value Units` lines) has no caller outside tests;
  every tile relies on scraping `innerText`, which pastes a messy
  blob into the chart. The universal "Copy all" works, but the
  clean path is unused.

Second, a fresh bedside-needs review finds **12** daily nursing
computations with no tile: urine-output rate and oliguria flag,
glucose-infusion rate, estimated blood volume and maximum
allowable blood loss, albumin-corrected phenytoin, potassium and
magnesium replacement, RhIG dosing from a Kleihauer-Betke result,
weight-based pediatric transfusion volume, IV/PN osmolarity with
the central-line threshold, the burn-resuscitation urine-output
target, shift fluid balance, and the carb-counting insulin bolus.
Each is something a working nurse computes by hand today.

v61 does both: it finishes the high-leverage enhancements and adds
the 12 tiles.

## 2. Part A — cross-cutting enhancements (zero new tile)

Each row is grounded in the v58-close audit. Mechanics that belong
to other specs are referenced, not duplicated: **`citationUrl`
backfill is owned by [spec-v60](spec-v60.md) §5**, and **uniform
`boundsAdvisory` plausibility wiring is owned by
[spec-v59](spec-v59.md) §2.5** — v61 does not re-spec them.

| # | Enhancement | What / why for the bedside nurse | Files |
|---|---|---|---|
| A1 | **Finish derivation rollout** | Backfill `META[id].derivation` + a `renderDerivation`/`updateDerivationSteps` call for the score tiles that lack it (currently 80/255). Target the multi-input scores first (Braden, MEWS/NEWS2, HEART, Wells, Caprini, etc.). | `lib/meta.js`, `views/group-e.js`, `group-f.js`, `group-h.js`, `group-i.js`, `group-klmno.js`; `lib/derivation.js` (built) |
| A2 | **Add related-tool linking (new feature)** | Add a `related: [id, …]` field to META and render a "Related tools" list in `renderMetaBlock`. Seed the obvious clusters (PE: `wells-pe`/`perc`/`pesi`/`years-pe`; renal: `cockcroft-gault`/`egfr-suite`/`abx-renal`; sepsis: `qsofa-sofa`/`news2`/`sepsis-bundle-clock`). Highest trust/utility win for the effort. | `lib/meta.js` (data), `app.js` `renderMetaBlock` |
| A3 | **Chart-ready labeled copy** | Have multi-output tiles build results as `{label, value, units}` and offer a per-result `copyButton(() => formatCopyAll(items))`, so a paste lands as clean `Label: Value Units` lines instead of a scraped blob. `formatCopyAll` already exists and is tested. | `lib/clipboard.js` (built), `views/group-e.js`, `group-f.js`, `group-g.js` |
| A4 | **Unit toggles on input tiles** | A complete `lib/unit-convert.js` exists (`lbToKg`, `fToC`/`cToF`, `inchesToCm`, `labConvert` SI⇄conventional) but is consumed by only 2 view modules. Add a per-field unit `<select>` driving the existing converters on weight/height/temp/lab tiles (`bmi`, `bsa`, `cockcroft-gault`, the new dosing tiles). US bedside charts in lb/°F; SI labs in mmol/L. | `views/group-e.js`, `group-g.js`, `group-h.js`; `lib/unit-convert.js` |
| A5 | **Visible "Copy link to this calculation"** | Hash-state already encodes inputs (`app.js` `trackHashState`), so a deep link reproduces a calculation — but nothing surfaces it. Add a button next to "Copy all" using `lib/clipboard.js copyText(location.href)`. Lets a charge nurse send a populated MEWS to a colleague. No new persistence, no network. | `app.js` `renderMetaBlock`, `lib/clipboard.js` |
| A6 | **Extend the printable handoff summary** | `lib/print.js renderPrintable` (with its "No data was sent or stored" footer) is wired only in `group-c.js` and `group-h.js`. Extend it to the handoff/discharge generators (`sbar-template`, `discharge-instr`, `wallet-card`, `code-blue-clock`). | `lib/print.js`, the relevant `views/group-*` |
| A7 | **Opt-in input persistence** | A privacy-safe, client-only "remember my last inputs" toggle (`localStorage`, matching the no-data-leaves promise) so a nurse reopening `insulin-drip` each shift doesn't re-enter constants. Off by default; never on for PHI-bearing free-text. | `app.js` `trackHashState`/`applyHashState` |
| A8 | **Interpretation-band parity** | `META.interpretation` (rendered under the mandatory "Per source:" header) is on 150/255. Backfill the remaining score tiles so every score shows a source-anchored "what this means," not a bare number. Reuses the [spec-v54](spec-v54.md)/`meta-interpretation.test.js` guardrails. | `lib/meta.js` |

Part A changes no clinical result; it is additive metadata and
render wiring. The enhancements inherit the [spec-v59](spec-v59.md)
output-safety contract (e.g. a backfilled derivation step routes
its interpolated input through `fmt()`).

## 3. Part B — the 12 new tiles

Each follows the house tile format and inherits the v59 contract
(missing/impossible input → `fmt()` fallback or a `boundsAdvisory`
note, never a silent number) and the v60 citation contract
(`accessed` + ledger row for any guideline-derived tile).

### 3.1 `urine-output` — Urine output rate + oliguria / AKI flag

- **Citation:** KDIGO AKI Work Group. KDIGO Clinical Practice
  Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):
  1-138.
- **citationUrl:** https://doi.org/10.1038/kisup.2012.1
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-icu`, `nursing-floor`, `nephrology`,
  `critical-care`.
- **Inputs:** total volume (mL), interval (hr), weight (kg).
- **Output:** rate in mL/kg/hr with the KDIGO urine-output AKI
  bands (<0.5 mL/kg/hr ×6 h = stage 1; <0.5 ×12 h = stage 2;
  <0.3 ×24 h or anuria ×12 h = stage 3). Framed as the bedside
  oliguria check the nurse runs each hourly Foley reading.

### 3.2 `gir` — Glucose Infusion Rate (mg/kg/min)

- **Citation:** Kalhan SC, Kiliç İ. Carbohydrate as nutrient in
  the infant and child: range of acceptable intake. Eur J Clin
  Nutr. 1999;53 Suppl 1:S94-100.
- **citationUrl:** https://doi.org/10.1038/sj.ejcn.1600749
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-nicu`, `nursing-peds`, `neonatology`,
  `nutrition`.
- **Inputs:** dextrose concentration (%), infusion rate (mL/hr),
  weight (kg).
- **Output:** GIR in mg/kg/min with the typical neonatal target
  band (4–8 mg/kg/min; >12 prompts a review). The NICU nurse
  running D10/D12.5 confirms GIR before titrating.

### 3.3 `ebv-mabl` — Estimated blood volume + maximum allowable blood loss

- **Citation:** Gross JB. Estimating allowable blood loss:
  corrected for dilution. Anesthesiology. 1983;58(3):277-280.
- **citationUrl:** https://doi.org/10.1097/00000542-198303000-00016
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-or`, `nursing-ld`, `anesthesia`,
  `critical-care`.
- **Inputs:** weight (kg), age/patient-type band (selects the
  mL/kg EBV factor: premature/neonate/infant/child/adult-M/
  adult-F), starting Hct, minimum acceptable Hct.
- **Output:** estimated blood volume (mL) and maximum allowable
  blood loss (mL) by the Gross formula. The OR/L&D nurse
  anticipating a transfusion threshold during a bleeding case.

### 3.4 `corrected-phenytoin` — Albumin-corrected phenytoin (Sheiner-Tozer)

- **Citation:** Sheiner LB, Tozer TN. Clinical pharmacokinetics:
  the use of plasma concentrations of drugs. In: Melmon &
  Morrelli, eds. Clinical Pharmacology. 1978; Winter ME, Tozer TN.
  Phenytoin. In: Applied Pharmacokinetics, 3rd ed. 1992.
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-neuro`, `nursing-ed`, `pharmacy`,
  `neurology`.
- **Inputs:** measured total phenytoin (µg/mL), serum albumin
  (g/dL), and an optional CrCl<10/ESRD adjustment toggle.
- **Output:** corrected (normalized-to-albumin) phenytoin level
  with the therapeutic-range comparison, and the renal-adjusted
  variant when selected. The neuro/ED nurse interpreting a "low"
  total level in a hypoalbuminemic patient before paging.

### 3.5 `potassium-deficit` — Potassium deficit + replacement guidance

- **Citation:** Kruse JA, Carlson RW. Rapid correction of
  hypokalemia using concentrated intravenous potassium chloride
  infusions. Arch Intern Med. 1990;150(3):613-617.
- **citationUrl:** https://doi.org/10.1001/archinte.1990.00390150103019
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-icu`, `nursing-tele`, `critical-care`,
  `nephrology`.
- **Inputs:** serum K (mEq/L), weight (kg), target K.
- **Output:** approximate total-body K deficit (mEq) with the
  guidance that the estimate is a planning aid, the standard
  repletion-rate caveats (peripheral vs central, monitored
  infusion), and an explicit "replace per local protocol" note.
  Bounded so an implausible serum K returns a fallback, not a
  dangerous number.

### 3.6 `magnesium-replacement` — Magnesium repletion estimate

- **Citation:** Tong GM, Rude RK. Magnesium deficiency in critical
  illness. J Intensive Care Med. 2005;20(1):3-17.
- **citationUrl:** https://doi.org/10.1177/0885066604271539
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-icu`, `critical-care`, `cardiology`,
  `pharmacy`.
- **Inputs:** serum Mg (mg/dL or mmol/L via the A4 unit toggle),
  severity band.
- **Output:** the typical MgSO₄ repletion dose range for the
  severity band with the infusion-rate caveat, framed as
  protocol-anchored guidance (arrhythmia/eclampsia prophylaxis
  noted as governed by their own protocols and the existing
  `mgso4-preeclampsia` tile).

### 3.7 `rhig-dose` — Rh immune globulin dose from fetomaternal hemorrhage

- **Citation:** Sandler SG, et al. It's time to phase out
  "serologic weak D phenotype" and resolve D types with RHD
  genotyping … AABB guidance on RhIG; and AABB Technical Manual
  FMH dosing. Transfusion. 2015;55(3):680-689.
- **citationUrl:** https://doi.org/10.1111/trf.12886
- **Group:** Obstetrics & Women's Health (`J`).
- **Specialties:** `nursing-ld`, `nursing-postpartum`,
  `obstetrics`, `blood-bank`.
- **Inputs:** maternal weight or blood volume, fetal-cell
  percentage from the Kleihauer-Betke test (or measured FMH
  volume).
- **Output:** estimated fetomaternal hemorrhage volume and the
  number of standard 300 µg RhIG vials (with the conventional
  round-up-and-add-one safety rule made explicit). The L&D nurse
  calculating additional RhIG after a positive KB test.

### 3.8 `peds-transfusion-volume` — Pediatric/neonatal PRBC volume

- **Citation:** New HV, et al. Guidelines on transfusion for
  fetuses, neonates and older children. Br J Haematol. 2016;175(5):
  784-828.
- **citationUrl:** https://doi.org/10.1111/bjh.14233
- **Group:** Obstetrics & Women's Health / Pediatrics (`J`).
- **Specialties:** `nursing-nicu`, `nursing-peds`, `neonatology`,
  `pediatrics`.
- **Inputs:** weight (kg), desired hemoglobin rise (g/dL), product
  hematocrit (default banded).
- **Output:** PRBC transfusion volume (mL) by the weight-based
  formula, with the standard 10–15 mL/kg reference band and the
  rate caveat. The NICU/peds nurse programming a weight-based
  volume.

### 3.9 `iv-osmolarity` — IV / parenteral-nutrition osmolarity + line-route flag

- **Citation:** Boullata JI, et al. ASPEN Clinical Guidelines:
  parenteral nutrition ordering, order review, compounding,
  labeling, and dispensing (Safe Practices). JPEN J Parenter
  Enteral Nutr. 2014;38(3):334-377.
- **citationUrl:** https://doi.org/10.1177/0148607114521833
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-infusion`, `nursing-icu`, `pharmacy`,
  `nutrition`.
- **Inputs:** dextrose %, amino-acid %, and the main electrolyte
  additive amounts.
- **Output:** estimated solution osmolarity (mOsm/L) with the
  peripheral-vs-central decision flag at the ~900 mOsm/L threshold.
  The infusion/PN nurse deciding whether a solution needs a central
  line.

### 3.10 `burn-uop-target` — Burn-resuscitation hourly urine-output target

- **Citation:** Pham TN, et al. American Burn Association practice
  guidelines: burn shock resuscitation. J Burn Care Res. 2008;
  29(1):257-266.
- **citationUrl:** https://doi.org/10.1097/BCR.0b013e31815f3876
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-icu`, `nursing-ed`, `burn`,
  `critical-care`.
- **Inputs:** weight (kg), age/adult-vs-peds band.
- **Output:** the hourly urine-output target range (0.5–1 mL/kg/hr
  adult; ~1 mL/kg/hr peds; the higher electrical-injury target
  noted) used to titrate LR. Complements the existing `burn-fluid`
  (Parkland *estimate*) tile by giving the *titration target* the
  nurse actually chases.

### 3.11 `fluid-balance` — Shift net fluid balance (I&O)

- **Citation:** Malbrain MLNG, et al. Principles of fluid
  management and stewardship in septic shock. Ann Intensive Care.
  2018;8(1):66.
- **citationUrl:** https://doi.org/10.1186/s13613-018-0402-x
- **Group:** Clinical Calculations (`F`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `critical-care`.
- **Inputs:** total intake (mL), total output (mL), weight (kg)
  optional.
- **Output:** net balance (mL, signed) and, when weight is given,
  the cumulative balance as a percent of body weight (the >10%
  fluid-overload reference flag). The end-of-shift I&O tally for
  handoff.

### 3.12 `carb-insulin-bolus` — Carb-counting mealtime insulin bolus

- **Citation:** American Diabetes Association. Standards of Care in
  Diabetes (annual). Diabetes Care. 2025;48(Suppl 1) — insulin
  dosing / carbohydrate counting.
- **citationUrl:** https://doi.org/10.2337/dc25-Sint
- **Group:** Clinical Scoring & Risk / Endocrine (`G`).
- **Specialties:** `nursing-floor`, `nursing-peds`,
  `endocrinology`, `diabetes-education`.
- **Inputs:** carbohydrates (g), insulin-to-carb ratio, correction
  factor (ISF), current glucose, target glucose.
- **Output:** meal bolus + correction bolus = total units, with
  each component shown separately so the nurse sees the
  derivation. Bounded against a negative correction (glucose below
  target → correction floored at 0 with a note). As an annually
  revised ADA-sourced tile, it carries `accessed` + a ledger row
  and is in [spec-v60](spec-v60.md) §4's REFRESH discipline.

## 4. Per-tile robustness

- Every tile imports the shared `lib/num.js` helpers; any zero
  denominator (weight 0, interval 0, FiO₂ 0) returns `null` →
  `fmt()` fallback, never `NaN`/`Infinity`.
- Dose/volume/electrolyte tiles call `boundsAdvisory()`
  ([spec-v59](spec-v59.md)) on weight, serum-level, and
  concentration inputs so an order-of-magnitude or wrong-unit
  entry shows a visible note before producing a dose.
- Every dosing/replacement tile (`potassium-deficit`,
  `magnesium-replacement`, `rhig-dose`, `peds-transfusion-volume`,
  `burn-uop-target`, `carb-insulin-bolus`) renders an explicit
  "estimate / verify against local protocol and an independent
  double-check" note — these are planning aids, not order
  generators.
- All 12 are added to the [spec-v59](spec-v59.md) object-aware fuzz
  harness via their lib module the moment it is imported.

## 5. Files touched

```
docs/spec-v61.md                         (this file)
app.js                                    (+12 UTILITIES rows; render related-tool + copy-link in renderMetaBlock; opt-in persistence)
lib/clinical-v6.js                        (new module: 12 compute exports)
lib/meta.js                               (+12 META entries w/ inline citation, citationUrl, accessed; backfill derivation/interpretation/related across catalog — Part A)
views/group-v10.js                        (new renderer module: 12 renderers, unit toggles, labeled copy)
views/group-e.js, group-f.js, group-g.js, group-h.js, group-i.js, group-klmno.js  (Part A: derivation/interpretation/unit-toggle/clean-copy rollout)
lib/derivation.js, lib/clipboard.js, lib/print.js, lib/unit-convert.js  (consumed more broadly; no behavior change)
docs/citation-staleness.md                (+ rows for guideline-derived new tiles: urine-output, gir, ebv-mabl, k/mg-replacement, rhig-dose, peds-transfusion-volume, iv-osmolarity, burn-uop-target, fluid-balance, carb-insulin-bolus)
test/unit/urine-output.test.js ... carb-insulin-bolus.test.js  (12 new unit tests, ≥3 boundary worked examples each)
test/integration/fuzz-tools.spec.js       (import lib/clinical-v6.js for coverage)
docs/audits/v11/urine-output.md ... carb-insulin-bolus.md  (12 audit logs)
docs/scope-mdcalc-parity.md               (catalog 307 -> 319)
CHANGELOG.md                              (Unreleased: v61 entry, +12 and the Part A enhancements)
README.md                                 (catalog count 307 -> 319)
package.json                              (description count 307 -> 319)
```

## 6. Acceptance criteria

v61 is fully shipped when:

**Part A**
- `META[].related` exists and renders a "Related tools" block; the
  seed clusters in A2 are present; a test asserts every `related`
  id resolves to a real tile.
- Derivation (`META.derivation` + render call) and `interpretation`
  parity are backfilled to the targeted score tiles; the
  `meta-interpretation.test.js` guardrails still pass.
- A "Copy link to this calculation" button renders and copies
  `location.href`; multi-output tiles offer the labeled
  `formatCopyAll` copy.
- Unit toggles drive the existing `lib/unit-convert.js` converters
  on the targeted weight/height/temp/lab fields; the opt-in
  persistence toggle stores only non-PHI numeric inputs in
  `localStorage` and is off by default.

**Part B**
- All 12 tiles in §3 are present: each has a `META[id]` entry, an
  inline citation visible on the tile with a `citationUrl`, ≥3
  boundary worked examples in its unit test (including the
  zero-denominator and impossible-input fallback cases), and a
  [spec-v11](spec-v11.md) audit log.
- Every guideline-derived new tile carries `accessed` + a
  `docs/citation-staleness.md` row ([spec-v60](spec-v60.md)).
- Every compute function uses `lib/num.js`, calls `boundsAdvisory`
  on its physiologic inputs, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is 319 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v61 with the +12 catalog delta and the
  Part A enhancements.

## 7. Out of scope for v61

- Auto-titration, order-set generation, or dosing that replaces an
  independent double-check. Every Part B tile reports an estimate
  with the "verify per local protocol" note; the order stays with
  the clinician and the pharmacy.
- `citationUrl` backfill on the *existing* catalog and the full
  currency re-verification — owned by [spec-v60](spec-v60.md).
- Uniform `boundsAdvisory` wiring across the *existing* catalog —
  owned by [spec-v59](spec-v59.md); v61 only wires it on its own 12
  new tiles.
- Reference-only tiles. Each Part B tile computes an output from
  input and passes the [spec-v29](spec-v29.md) §3 one-line test;
  standalone normal-value or drug-level *tables* remain out of
  scope (v29 §3).
- Copyrighted/licensed instruments (MoCA, SLUMS, SAD PERSONS) —
  excluded, consistent with prior scope decisions.
- A second `serum-osmolarity`-only tile, a manual gtt/min drip-rate
  tile, and a peds 4-2-1 variant — reviewed and deferred as too
  close to the existing `osmolal-gap`, infusion, and `maint-fluids`
  tiles to clear the no-duplication bar; revisit only if they add
  computation those tiles lack.
```
