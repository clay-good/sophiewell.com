# spec-v62.md — Deepen the clinical tools: trend, action, and target intelligence; convert the residual reference tables; +9 bedside tiles

> Status: **Part B wave 1 + Part C shipped (2026-06-09); Part A and the
> remaining 2 Part B tiles deferred.** **Part A1 wave 1 (2026-06-09):** the
> serial/trend primitive `lib/trend.js` (`correctionRate`) shipped and wired
> into `sodium-correction` as an optional, default-empty achieved-rate-vs-
> ceiling block (no existing result or example changed). **A1 wave 2
> (2026-06-09):** the generic `trend()` core (delta / rate / direction) added
> and wired into `news2` and `mews` as an optional prior-score-vs-now trend
> line (rising-trend warning), again purely additive. **A1 wave 3
> (2026-06-09):** same trend block wired into `pews`, completing the
> single-additive-total early-warning family; `meows` is deliberately excluded
> (track-and-trigger flag-count instrument, no single total to trend). **A1
> wave 4 (2026-06-09):** hemoglobin-drop trend (`hgbTrendInputs`/
> `renderHgbTrend`, warns on a *falling* Hgb) wired into `gbs` and `oakland`.
> The serial-delta trend rollout is now complete across the named tiles whose
> derived quantity is a clean delta (early-warning scores, hemoglobin drop,
> sodium-correction rate). The creatinine Δ / KDIGO stage-transition variant on
> `kdigo-aki` is deferred — that tile already exposes baseline→current
> creatinine and a 48-h-rise field, so a trend block there overlaps its inputs
> and needs a careful redesign, not a quick add.
>
> **Part A2 wave 1 (2026-06-09):** the source-anchored "next step" action field
> (`META[id].actions = { source, bands: [{range, step}] }`) shipped — rendered
> in `renderMetaBlock` under a "Recommended next step (per source):" header,
> guarded by a CI test (non-empty source + bands, no Sophie-authored phrasing).
> Seeded with `kdigo-aki` (KDIGO 2012 staged-management bundle), the additive
> action table alongside its staging-definition interpretation. `news2` is
> deliberately not seeded (its interpretation already states the RCP-2017
> escalation response). **A2 wave 2 (2026-06-09):** `ciwa` (CIWA-Ar
> symptom-triggered regimen, Mayo-Smith 1997) and `cows` (COWS buprenorphine-
> induction timing, SAMHSA TIP 63) seeded — severity is their interpretation,
> management is the additive action. `centor`/`feverpain` evaluated and *not*
> seeded (their interpretation already carries the test-vs-treat action, like
> `news2`). Later A2 waves may add Braden/Norton turn-schedule actions where a
> verbatim source table exists and is not already in interpretation.
>
> **Part A5 wave 1 (2026-06-09):** substituted-formula derivation shipped.
> `lib/derivation.js` now renders a "With your inputs" line from a
> `derivation.substituted(inputs)` function (alongside, or instead of, the
> additive component breakdown), with a banned-token guard at the render layer.
> Seeded on `cockcroft-gault` (full derivation block + guarded substituted
> equation). Later A5 waves extend `substituted` to eGFR, Parkland `burn-fluid`,
> `corrected-sodium`, `winters`, `aa-gradient`, `osmolal-gap`, `fena-feurea`. Original Part B/C wave delivered: 7 of 9
> Part B tiles (`infusion-time-remaining`, `enteral-free-water`, `apap-24h-max`,
> `icu-nutrition-target`, `vte-prophylaxis-dose`, `neonatal-feeding-volume`,
> `oxytocin-titration`) in `lib/clinical-v8.js`, and both Part C conversions
> (`peds-dose`, `anticoag-reversal` now pass the §3 one-line test). Catalog
> 319 → **326**. Deferred to a later wave: the two highest-risk Part B tiles —
> `norepi-equiv` (published NE-equivalent vasopressin/angiotensin factors vary
> across the scoping reviews) and `neo-phototherapy` (AAP-2022 is a continuous
> risk-stratified nomogram) — which warrant exact source-table encoding before
> shipping; and **Part A** (the trend / action / reverse-solve / lab-toggle /
> substituted-derivation depth pass), which is metadata/render wiring across
> many existing tiles and is best landed as its own waves. The original
> proposal follows unchanged.
>
> v62 has three parts.
> **Part A** is a zero-tile *depth* pass: it makes the existing
> nurse/clinician/doctor calculators match how a number is actually
> used at the bedside — tracked **over time** (trend/rate), used to
> drive a **next action** (the published escalation/monitoring step),
> run **backward to a target** (the rate that hits a goal), reported
> in the **clinician's units** (full SI⇄conventional lab toggles), and
> shown with the **user's own numbers substituted into the formula**.
> **Part B** adds **9** deterministic, bedside-necessary tiles in the
> three confirmed gap areas — ICU titration/infusion, med-surg/floor
> daily math, and OB/L&D & neonatal. **Part C** retires the project's
> last two static "googleable reference table" tiles by **converting**
> them into input-driven calculators — `anticoag-reversal` and
> `peds-dose` both fail the [spec-v29](spec-v29.md) §3 one-line test
> today (hardcoded rows, no input, no computed output) and survived the
> v29 purge only because they sit inside a clinical group.
>
> Catalog effect at v62 close: **319 + 9 = 328 tiles.** Part C changes
> no count (both ids are retained; their permalinks keep working) but
> moves two tiles from "fails §3" to "passes §3," closing the last
> reference-table gap in the live catalog.
>
> Every prior spec (v4 through v61) remains in force. v62 adds no
> runtime network call and no AI; each new tile ships its primary
> citation inline ([spec-v54](spec-v54.md)/[spec-v60](spec-v60.md)) and
> inherits the [spec-v59](spec-v59.md) input/output-safety contract.
> Sophie's eight commitments ([spec-v50](spec-v50.md) §3) are preserved.
> The multi-audience scope of [spec-v10](spec-v10.md) and
> [scope-mdcalc-parity](scope-mdcalc-parity.md) is **unchanged** — the
> billing/coding/regulatory operations surface stays; v62 simply does
> not extend it. This pass is, by the maintainer's direction,
> **nurse/clinician/doctor-first**.

## 1. Thesis

The catalog is broad, correct, and — after v61 — well-furnished with
metadata: 117 additive scores carry "show your work" derivation, 196
tiles carry a source-anchored interpretation band, 267 carry
related-tool links, the multi-output tiles emit chart-ready
`Label: Value Units` copy, and a handful of input tiles carry unit
toggles. That work made each tile **better described**. It did not make
each tile **better at the four things a nurse does with a number after
she reads it**:

1. **She compares it to the last one.** A single lactate, creatinine,
   sodium, hemoglobin, or NEWS2 is rarely the decision; the *rate of
   change* is. Lactate clearance, the creatinine delta that defines a
   KDIGO stage, the sodium-correction rate that must stay under the
   24-hour ceiling, and a rising early-warning trend are what trigger
   escalation. No tile in the catalog accepts a prior value and a time
   interval. The trend is computed by hand or not at all.
2. **She acts on it.** Interpretation tells her *what the number means*
   ("NEWS2 7 = high"); it does not tell her *what the source says to do
   next* ("score 7 → continuous monitoring, urgent clinical review by a
   team with critical-care competencies"). For the minority of
   instruments whose governing publication includes a monitoring or
   escalation table, that action is citable and deterministic, and it
   is the single most useful line on the tile.
3. **She runs it backward.** The infusion tiles compute a rate from a
   dose; at the bedside she just as often needs the rate that *delivers
   a target* (the norepinephrine rate for a target dose, the 3% saline
   rate that corrects sodium by ≤8 mEq/L in 24 h, the heparin rate for
   the nomogram step). The math is the same equation solved for the
   other variable; only the forward direction is exposed.
4. **She reads it in her units.** US bedside charts run mg/dL, lb, °F;
   much of the world and most journals run mmol/L, kg, °C. A complete
   `lib/unit-convert.js` exists, but v61 wired its toggles onto only a
   few weight/height/temp/creatinine fields. Every lab-input tile
   should offer the SI⇄conventional toggle.

Separately, an audit of the live render tree (not just `META`) finds
the **last two tiles that fail the §3 one-line test**: `anticoag-reversal`
and `peds-dose` are static `<table>`s with hardcoded rows, no inputs,
and an explicit "Reference table" caption. Both are clinically valuable
*as calculators* — a weight-and-INR-driven reversal-agent dose, a
weight-driven pediatric quick-dose panel — so the right move is to
**convert, not delete**: keep the centralized clinical content the site
should own, and make it compute.

v62 does all three: it adds the four depth capabilities, fills nine
confirmed bedside gaps, and converts the two residual tables.

## 2. Part A — depth pass (zero new tile)

Part A changes **no existing clinical result**. It adds input
affordances, output rows, and metadata, each inheriting the
[spec-v59](spec-v59.md) output-safety contract (every interpolated
value routes through `fmt()`; any zero/over-range input yields a
visible note, never a silent or non-finite number). Mechanics owned by
other specs are referenced, not duplicated: derivation rendering is
[spec-v48](spec-v48.md), interpretation banding is
[spec-v54](spec-v54.md), citation/`accessed` discipline is
[spec-v60](spec-v60.md).

| # | Capability | What / why for the bedside | Files |
|---|---|---|---|
| A1 | **Serial / trend mode** (new primitive `lib/trend.js`) | On the time-sensitive tiles, expose an optional "add a prior value + time" pair. Compute and label the delta, the per-hour rate, and — where the source defines one — the clinically meaningful derived quantity: **lactate clearance %** (sepsis), **creatinine Δ / KDIGO stage transition** (`kdigo-aki`, `urine-output`), **sodium correction rate vs the ≤8–10 mEq/L/24 h ceiling** (`sodium-correction`, `free-water-deficit`), **hemoglobin drop rate** (`gbs`, `oakland`, `blood-compat`), and **early-warning-score trend** (`news2`, `mews`, `pews`, `meows`). Bounded, deterministic, pure. Trend is what escalates care; the absolute value rarely is. | `lib/trend.js` (new), `views/group-e.js`, `group-g.js`, the named view modules |
| A2 | **Source-anchored "next step" (action) field** | Add an optional `META[id].actions` array — band → the *verbatim published* monitoring/escalation/treatment-interval step — rendered under the existing mandatory "Per source:" header beneath interpretation. Seed **only** the instruments whose governing publication ships an action table: NEWS2 (RCP 2017 monitoring/escalation), KDIGO AKI stage (hold nephrotoxins / nephrology referral), Braden / Norton / NPUAP staging (turn schedule / support surface), CIWA-Ar & COWS (symptom-triggered dosing interval), Centor/FeverPAIN (test vs treat). Never an order; the published recommendation, quoted and cited. Tiles with no published action table get no `actions` and render exactly as today. | `lib/meta.js` (data), `app.js` `renderMetaBlock`, `lib/derivation.js` neighbor render |
| A3 | **Reverse-solve / target mode** on infusion & correction tiles | Where a tile computes `result = f(inputs)` and the inverse is single-valued, add a second labeled output row (and, where natural, an input toggle) for the inverse: `vasopressor`/`conc-rate` "rate to deliver target dose" ⇄ "dose at current rate"; `insulin-drip` and `heparin-nomogram` "rate for target"; `sodium-correction`/`free-water-deficit` "infusion rate to correct by Δ over N h **without exceeding the safe ceiling**." No new tile, no new clinical constant — the same equation solved for the other variable, with the same bounds. | the infusion compute modules (`lib/medication-v*.js`, `lib/clinical-v*.js`), `views/group-e.js`, `group-f.js` |
| A4 | **Finish the SI⇄conventional lab-toggle rollout** | `lib/unit-convert.js labConvert` is complete; v61 A4 wired it onto only weight/height/temp/creatinine on ~4 tiles. Extend the per-field unit `<select>` to **every** lab-input field across the catalog — bilirubin, glucose, BUN/urea, calcium, magnesium, phosphate, albumin, lactate, ionized Ca — with a canonical default so examples and deep links stay byte-identical ([spec-v46](spec-v46.md) catalog-truth). | `lib/unit-convert.js` (consumed broadly), `views/group-e.js`, `group-f.js`, `group-g.js`, `group-v*.js` |
| A5 | **Substituted-formula derivation for the non-additive calculators** | v61 finished derivation for *additive/weighted scores*. Extend `lib/derivation.js` with a `substituted` rendering that, for **formula** tiles (Cockcroft-Gault, eGFR, Parkland `burn-fluid`, `drip-rate`, `corrected-sodium`, `winters`, `aa-gradient`, `osmolal-gap`, `fena-feurea`, etc.), shows the published formula **with the user's current inputs plugged in** and the arithmetic carried through — the same defensible "where did this number come from" the scores already give, for the calculators that today show only the bare result. | `lib/derivation.js`, `lib/meta.js` (`derivation.substituted` formula strings), the formula view modules |

Part A adds metadata and render wiring only. A backfilled trend step,
action line, reverse-solve row, unit conversion, or substituted formula
routes every interpolated input through `fmt()` and respects the
existing `boundsAdvisory()` notes. No new network call, no AI.

## 3. Part B — the 9 new tiles

Each follows the house tile format, passes the [spec-v29](spec-v29.md)
§3 one-line test (input → computed output), and inherits the
[spec-v59](spec-v59.md) safety contract (missing/zero/impossible input
→ `fmt()` fallback or a `boundsAdvisory` note, never a silent number)
and the [spec-v60](spec-v60.md) citation contract (`accessed` + a
`docs/citation-staleness.md` row for any guideline-derived tile). None
duplicates an existing tile (checked against the 319-tile catalog);
near-neighbors are named under each.

### 3.1 ICU titration & infusion

#### `norepi-equiv` — Norepinephrine-equivalent total vasopressor dose
- **Citation:** Kotani Y, et al. Norepinephrine equivalent dose:
  a scoping review and proposed standard. (and) Goradia S, et al.
  Vasopressor dose equivalence: a scoping review and suggested
  formula. J Crit Care. 2021;61:233-240.
- **citationUrl:** https://doi.org/10.1016/j.jcrc.2020.11.002
- **Group:** Medication & Infusion (`F`). **Specialties:** `nursing-icu`,
  `critical-care`, `pharmacy`, `anesthesia`.
- **Inputs:** weight (kg, with the A4 kg⇄lb toggle), current rate of
  each agent (norepinephrine, epinephrine, dopamine, phenylephrine,
  vasopressin, angiotensin II) in its native units.
- **Output:** total **norepinephrine-equivalent dose in mcg/kg/min**,
  with each agent's contribution shown separately. The single number
  that lets an ICU nurse and intensivist describe total pressor burden,
  compare shift-to-shift, and judge escalation. **Near-neighbor:** `vis`
  (vasoactive-inotropic *score*, peds-weighted, unitless) — distinct
  instrument, distinct units; both retained.

#### `icu-nutrition-target` — ICU energy & protein target
- **Citation:** McClave SA, et al. Guidelines for the Provision and
  Assessment of Nutrition Support Therapy in the Adult Critically Ill
  Patient (ASPEN/SCCM). JPEN J Parenter Enteral Nutr. 2016;40(2):
  159-211.
- **citationUrl:** https://doi.org/10.1177/0148607115621863
- **Group:** Medication & Infusion / Nutrition (`F`). **Specialties:**
  `nursing-icu`, `critical-care`, `nutrition`, `pharmacy`.
- **Inputs:** weight (kg), height (for IBW/ABW selection in obesity),
  target band (25–30 kcal/kg; 1.2–2.0 g/kg protein, higher for CRRT/burns).
- **Output:** daily **energy (kcal/day)** and **protein (g/day)** target
  ranges, with the obesity-adjusted-weight and CRRT-protein caveats
  surfaced. Pairs with `tpn-macro` and `iv-osmolarity` (which take the
  prescription) by giving the *target* the prescription should meet.

#### `infusion-time-remaining` — Bag/syringe time-to-empty & rate-to-last
- **Citation:** ISMP. Guidelines for Optimizing Safe Implementation
  and Use of Smart Infusion Pumps. (utility-class arithmetic tile, like
  `drip-rate`; cited for safe-practice framing, not a derived constant).
- **Group:** Medication & Infusion (`F`). **Specialties:**
  `nursing-icu`, `nursing-floor`, `nursing-infusion`.
- **Inputs:** volume remaining (mL) and rate (mL/hr) **or** total
  volume + start time; optional current clock time.
- **Output:** **time until empty (hh:mm)**, the **clock time it runs
  out**, and the inverse — the **rate that makes a given volume last N
  hours**. The most-asked bedside infusion question ("when do I need the
  next bag?"), today done on scratch paper. **Near-neighbor:** `drip-rate`
  (gtt/min from volume/time/drop-factor) and `conc-rate` (dose⇄rate) —
  neither answers time-to-empty; no overlap.

### 3.2 Med-surg / floor daily math

#### `enteral-free-water` — Tube-feed free-water delivery & flush target
- **Citation:** Boullata JI, et al. ASPEN Safe Practices for Enteral
  Nutrition Therapy. JPEN J Parenter Enteral Nutr. 2017;41(1):15-103.
- **citationUrl:** https://doi.org/10.1177/0148607116673053
- **Group:** Medication & Infusion / Nutrition (`F`). **Specialties:**
  `nursing-floor`, `nursing-icu`, `nutrition`.
- **Inputs:** formula rate (mL/hr) or daily volume, formula free-water
  fraction (% — banded default by caloric density), daily free-water
  goal.
- **Output:** **free water delivered by the formula (mL/day)** and the
  **additional flush volume (mL, divided per shift)** needed to reach
  the goal. The daily floor/ICU calculation behind every "free-water
  flush q6h" order. **Near-neighbor:** `iv-osmolarity` (parenteral
  osmolarity / line route) — enteral, not parenteral; no overlap.

#### `apap-24h-max` — Acetaminophen 24-hour running total & ceiling
- **Citation:** US FDA. Organ-Specific Warnings: Acetaminophen
  (OTC labeling) and FDA prescription-combination 325 mg/dose-unit
  limit; manufacturer labeling (max 4 g/24 h; lower in hepatic
  impairment / chronic alcohol use).
- **Group:** Medication & Infusion / Safety (`F`). **Specialties:**
  `nursing-floor`, `nursing-icu`, `pharmacy`.
- **Inputs:** each acetaminophen source in the last 24 h — standalone
  PO/IV/PR plus the acetaminophen component of combination products
  (oxycodone-APAP, hydrocodone-APAP) — entered as dose × frequency.
- **Output:** **running 24-hour acetaminophen total (mg)** against the
  selected ceiling (4 g default; 3 g and 2 g conservative bands with the
  hepatic/alcohol caveat), with a visible over-ceiling flag. Catches the
  hidden-combination-product overdose that is a leading cause of
  drug-induced liver injury. **Near-neighbor:** `acetaminophen-nomogram`
  (Rumack-Matthew, *single ingestion* toxicity) — this is cumulative
  therapeutic-dose stewardship; distinct.

#### `vte-prophylaxis-dose` — Enoxaparin prophylaxis/treatment dose by weight & renal function
- **Citation:** Enoxaparin (Lovenox) US prescribing information (renal
  adjustment at CrCl <30 mL/min); Gould MK, et al. Prevention of VTE in
  Nonorthopedic Surgical Patients (CHEST). Chest. 2012;141(2 Suppl):
  e227S-e277S.
- **citationUrl:** https://doi.org/10.1378/chest.11-2297
- **Group:** Medication & Infusion (`F`). **Specialties:**
  `nursing-floor`, `nursing-icu`, `pharmacy`, `hospitalist`.
- **Inputs:** weight (kg), CrCl (links to `cockcroft-gault`), indication
  (prophylaxis vs treatment), obesity/renal flags.
- **Output:** the labeled **enoxaparin dose & interval** for the
  selected indication (prophylaxis 40 mg daily / 30 mg q12 h; treatment
  1 mg/kg q12 h or 1.5 mg/kg daily) **with the CrCl <30 renal reduction
  applied and flagged** and the anti-Xa-monitoring caveat for the
  obesity/renal edge. Pairs with `caprini` / `padua` (who needs it) and
  `cockcroft-gault` (the renal input). Renders the standard
  estimate/verify-against-protocol note.

### 3.3 OB/L&D & neonatal

#### `oxytocin-titration` — Oxytocin mU/min ⇄ mL/hr & protocol step
- **Citation:** American College of Obstetricians and Gynecologists.
  Induction of Labor (Practice Bulletin); standard low-dose and
  high-dose oxytocin titration regimens.
- **Group:** Obstetrics & Neonatal (`N`). **Specialties:** `nursing-ld`,
  `nursing-ob`, `obstetrics`.
- **Inputs:** bag concentration (units/mL — banded defaults, e.g.
  30 units/500 mL = 60 mU/mL), ordered dose (mU/min), pump rate (mL/hr).
- **Output:** the **mU/min ⇄ mL/hr conversion both directions** plus the
  next **titration increment** for the selected low-dose/high-dose
  regimen. The pump runs mL/hr; the order is mU/min — this is the
  conversion every L&D nurse does at each titration. Bounded; renders
  the "follow your unit's oxytocin protocol and uterine-activity
  monitoring" note. **Near-neighbor:** `mgso4-preeclampsia`
  (magnesium infusion) — different drug, different units; no overlap.

#### `neonatal-feeding-volume` — Newborn enteral feeding volume
- **Citation:** Kleinman RE, Greer FR, eds. Pediatric Nutrition (AAP);
  standard term-newborn requirement 120–180 mL/kg/day (typical
  150 mL/kg/day), advanced per day of life in preterm infants.
- **Group:** Obstetrics & Neonatal (`N`). **Specialties:**
  `nursing-nicu`, `nursing-postpartum`, `nursing-peds`, `neonatology`.
- **Inputs:** weight (kg/g, with toggle), target mL/kg/day (banded by
  day of life), feeding frequency (q2/q3/q4 h).
- **Output:** **total daily volume (mL)** and **per-feed volume (mL)**
  for the selected frequency, with the term/preterm advancement-band
  reference. The NICU/postpartum nurse setting up feeds. **Near-neighbor:**
  `maint-fluids` (Holliday-Segar IV maintenance) and
  `peds-transfusion-volume` (blood) — neither is enteral feeds.

#### `neo-phototherapy` — Neonatal hyperbilirubinemia treatment threshold (AAP 2022)
- **Citation:** Kemper AR, et al. Clinical Practice Guideline Revision:
  Management of Hyperbilirubinemia in the Newborn Infant 35 or More
  Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859.
- **citationUrl:** https://doi.org/10.1542/peds.2022-058859
- **Group:** Obstetrics & Neonatal (`N`). **Specialties:**
  `nursing-nicu`, `nursing-postpartum`, `neonatology`, `pediatrics`.
- **Inputs:** gestational age, age in hours, neurotoxicity risk factors,
  current total serum bilirubin.
- **Output:** the **phototherapy threshold** (and the distance of the
  current TSB from it, plus the escalation/exchange threshold flag) for
  the AAP-2022 risk-stratified curve. The current treatment-decision
  instrument. **Near-neighbor:** `bhutani-bilirubin` (1999 hour-specific
  *risk* nomogram) — a different, complementary instrument; both
  retained. As an annually/edition-revised AAP tile it carries `accessed`
  + a ledger row and joins [spec-v60](spec-v60.md) §4 REFRESH discipline.

## 4. Part C — convert the two residual reference tables (no count change)

A render-tree audit (not just `META`) found exactly two live tiles whose
renderer builds a static `<table>` from hardcoded rows, binds no input,
and captions itself "Reference table" — i.e. the last two tiles that
**fail the [spec-v29](spec-v29.md) §3 one-line test**. They are the kind
of "lookup you can google" the catalog should not ship *as a flat table*,
but the underlying clinical content is exactly what the site should
centralize *as a calculator*. v62 **converts** them in place (id and
permalink retained, so existing deep links and the v46 catalog-truth
surfaces are undisturbed); the count is unchanged because no id is added
or removed.

### 4.1 `anticoag-reversal` → weight/INR-driven reversal-dose calculator
- **Citation:** Frontera JA, et al. Guideline for Reversal of
  Antithrombotics in Intracranial Hemorrhage (Neurocritical Care
  Society / SCCM). Neurocrit Care. 2016;24(1):6-46; agent labels
  (idarucizumab, andexanet alfa, 4F-PCC) and ANNEXA-4 andexanet
  dosing.
- **citationUrl:** https://doi.org/10.1007/s12028-015-0222-x
- **From:** a static 6-row agent/reversal/notes table.
- **To:** select anticoagulant + enter weight + scenario inputs →
  **computed reversal dose**: 4F-PCC units by weight and INR band
  (warfarin), andexanet low- vs high-dose protocol (apixaban/
  rivaroxaban, by agent dose and time since last dose), idarucizumab
  fixed 5 g (dabigatran), protamine by heparin units and time since
  last dose with the per-dose maximum (UFH/LMWH). Each result carries
  the verify-against-protocol note; the reference rows remain visible
  as the labeled output context.

### 4.2 `peds-dose` → weight-driven pediatric quick-dose panel
- **Citation:** AAP / NLM DailyMed / manufacturer labels (the same
  sources the current table already cites), per drug.
- **From:** a static per-kg dose table.
- **To:** enter weight (kg, with toggle) → the curated common-pediatric
  drug panel **computed to actual mg** with the per-dose and daily-max
  caps applied and a flag when a band is exceeded. Distinct from
  `peds-weight-dose` (a *single arbitrary* drug × mg/kg) and `weight-dose`
  (adult) by computing the fixed common panel at once for the sick-child
  bedside; distinct from `peds-resus` (code dosing).

## 5. Per-tile / per-capability robustness

- Every new compute function and every reverse-solve branch imports
  `lib/num.js`; any zero denominator (weight 0, rate 0, interval 0,
  bilirubin 0) returns `null` → `fmt()` fallback, never `NaN`/`Infinity`.
- `lib/trend.js` rejects a non-increasing or zero time interval and a
  prior timestamp later than the current one with a visible note, not a
  signed-infinity rate; clearance/rate outputs are clamped to plausible
  physiologic ranges via `boundsAdvisory()`.
- Every dosing/replacement/reversal tile (`norepi-equiv`,
  `vte-prophylaxis-dose`, `oxytocin-titration`, `anticoag-reversal`,
  `peds-dose`) renders the explicit "estimate / verify against local
  protocol and an independent double-check" note — planning aids, not
  order generators. Reverse-solve rows on `sodium-correction`/
  `free-water-deficit` clamp to the published safe-correction ceiling and
  flag, never silently exceed it.
- The A2 `actions` field renders **only** verbatim, source-cited
  published recommendations under the mandatory "Per source:" header;
  tiles without a published action table get none.
- All new lib modules (`lib/trend.js` and the new compute exports) and
  both converted tiles are added to the [spec-v59](spec-v59.md)
  object-aware fuzz harness the moment their module is imported; zero
  non-finite leaks is a merge gate.

## 6. Files touched

```
docs/spec-v62.md                          (this file)
app.js                                     (+9 UTILITIES rows; render A2 actions + A1 trend affordance + A3 reverse rows in renderMetaBlock; peds-dose/anticoag-reversal move from static to input renderers)
lib/trend.js                               (new: serial delta / rate / clearance primitive — pure, num.js-backed)
lib/clinical-v7.js (or new lib/clinical-v8.js)  (new compute exports for the 9 tiles + the 2 conversions)
lib/meta.js                               (+9 META entries w/ inline citation, citationUrl, accessed; +A2 `actions`; +A5 `derivation.substituted`; A1 trend wiring metadata)
lib/derivation.js                          (extend: substituted-formula rendering for non-additive calculators — A5)
lib/unit-convert.js                        (consumed across all lab-input fields — A4; no behavior change)
views/group-f.js                           (norepi-equiv, icu-nutrition-target, infusion-time-remaining, enteral-free-water, apap-24h-max, vte-prophylaxis-dose; convert anticoag-reversal + peds-dose to input renderers; A3 reverse rows; A4 toggles)
views/group-e.js, group-g.js, group-v*.js  (A1 trend mode, A4 lab toggles, A5 substituted derivation rollout)
views/<OB/neonatal module>                 (oxytocin-titration, neonatal-feeding-volume, neo-phototherapy)
docs/citation-staleness.md                 (+rows for guideline-derived new tiles: norepi-equiv, icu-nutrition-target, enteral-free-water, vte-prophylaxis-dose, oxytocin-titration, neonatal-feeding-volume, neo-phototherapy; +the AAP-2022 REFRESH row for neo-phototherapy; +anticoag-reversal, peds-dose now-cited compute)
test/unit/<each new tile>.test.js          (9 new unit tests + 2 conversion tests, >=3 boundary worked examples each incl. zero-denominator and impossible-input fallback)
test/unit/trend.test.js                    (new: delta/rate/clearance, bad-interval fallback)
test/integration/fuzz-tools.spec.js        (import the new compute module for coverage)
docs/audits/v12/<each new + converted tile>.md   (spec-v11 audit logs)
docs/scope-mdcalc-parity.md                (catalog 319 -> 328; note the two §3 conversions)
CHANGELOG.md                               (Unreleased: v62 entry, +9 and the Part A depth capabilities + Part C conversions)
README.md, package.json                    (catalog count 319 -> 328)
```

## 7. Acceptance criteria

v62 is fully shipped when:

**Part A**
- `lib/trend.js` exists, is pure and `num.js`-backed, rejects bad
  intervals with a `fmt()`/note fallback, and is wired on the named
  trend tiles; `trend.test.js` covers delta, rate, clearance, and the
  bad-interval case.
- `META[].actions` exists, renders under the "Per source:" header, and a
  test asserts every `actions` entry has a non-empty source string; only
  the seeded instruments carry it.
- Reverse-solve output rows render on the named infusion/correction
  tiles and a test asserts the inverse reproduces the forward result on
  a round-trip; the sodium-correction inverse never exceeds the safe
  ceiling.
- The SI⇄conventional toggle drives `labConvert` on every lab-input
  field; canonical defaults keep the v46 catalog-truth surfaces and all
  deep links byte-identical.
- `derivation.substituted` renders the user's inputs plugged into the
  formula for the named non-additive calculators; existing
  `derivation.test.js`/`meta-interpretation.test.js` guardrails pass.

**Part B**
- All 9 tiles in §3 are present: each has a `META[id]` entry, an inline
  citation visible on the tile with a `citationUrl`, >=3 boundary worked
  examples in its unit test (including the zero-denominator and
  impossible-input fallback cases), and a [spec-v11](spec-v11.md) audit
  log; each passes the [spec-v29](spec-v29.md) §3 one-line test.
- Every guideline-derived new tile carries `accessed` + a
  `docs/citation-staleness.md` row; `neo-phototherapy` is on the
  [spec-v60](spec-v60.md) §4 REFRESH list.

**Part C**
- `anticoag-reversal` and `peds-dose` now consume at least one user
  input and produce a computed output (they pass §3); their ids and
  permalinks are unchanged; each carries a per-result verify note and a
  unit test with boundary examples.
- A test (or the existing §3/scope guard) asserts **no** live renderer
  builds an input-free static reference table — the conversion closes
  the gap permanently.

**Whole spec**
- Every new compute function uses `lib/num.js`, calls `boundsAdvisory`
  on its physiologic inputs, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is 328 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build`
  all pass.
- The CHANGELOG records v62 with the +9 catalog delta, the Part A depth
  capabilities, and the Part C conversions.

## 8. Out of scope for v62

- **No change to the multi-audience scope.** The billing / coding /
  regulatory / patient-administrative operations tiles
  ([spec-v10](spec-v10.md), [scope-mdcalc-parity](scope-mdcalc-parity.md))
  remain in the catalog; v62 is a nurse/clinician/doctor-first *depth*
  pass and simply does not extend that surface. sophiewell.com's
  direction — every actionable healthcare-operations calculator in one
  public place — is unchanged.
- **No auto-titration or order generation.** Reverse-solve, A2 actions,
  and every Part B/C dosing tile report an estimate or the verbatim
  published recommendation with the verify note; the order stays with
  the clinician and pharmacy.
- **No new reference *tables*.** A2 `actions` is source-quoted
  decision text bound to a computed band, not a standalone lookup; it
  passes §3 because it rides on a tile that already consumes input.
- **Copyrighted / licensed instruments** (MoCA, SLUMS, SAD PERSONS)
  remain excluded, consistent with prior scope decisions.
- **Deferred as too close to existing tiles** (revisit only if they add
  computation those tiles lack): a standalone serum-osmolarity-only tile
  (vs `osmolal-gap`), a manual gtt/min drip tile (vs `drip-rate`), a
  generic IV-rate-from-order tile (vs `drip-rate`/`maint-fluids`), and a
  cross-tile shared pediatric-weight carry-through (a session-state
  feature, not a tile; candidate for a future spec building on the
  v61 A7 opt-in persistence layer).
```
