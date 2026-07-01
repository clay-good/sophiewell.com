# spec-v188.md — ICU sedation, delirium & acute resuscitation: RASS, CAM-ICU, Parkland, effective osmolality, and Holliday-Segar maintenance fluids (+5 tiles)

> Status: **PROPOSED (2026-06-30).** First feature spec of the new
> **Acute, Perioperative & Diagnostic Quantitation** program (umbrella below,
> §1.1), implementing the **ICU sedation / delirium / acute-resuscitation**
> cluster. Adds **5** deterministic bedside instruments that fill a confirmed gap:
> the catalog scores ICU severity (APACHE II, SOFA, SAPS II) and nutritional risk
> (NUTRIC) but does not yet carry the daily sedation, delirium, burn-fluid,
> tonicity, and maintenance-fluid tools the ICU and acute-care nurse reach for on
> every shift. None duplicates a live tile (RASS, CAM-ICU, Parkland, effective
> osmolality, and the Holliday-Segar maintenance-fluid rate were all checked
> absent at draft).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v188 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no sedation, fluid, or de-escalation order in
> Sophie's voice**). **Every assessment anchor, fluid constant, and osmolality
> coefficient is re-fetched and cross-verified against ≥2 independent sources at
> implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag.

### 1.1 Program umbrella — Acute, Perioperative & Diagnostic Quantitation (v188–v191)

v188 opens a four-spec program closing the next band of advanced bedside gaps
after the v185–v187 program: **v188** ICU sedation / delirium / resuscitation,
**[spec-v189](spec-v189.md)** perioperative dosing safety,
**[spec-v190](spec-v190.md)** diagnostic lab indices, and
**[spec-v191](spec-v191.md)** cardiac / echo hemodynamics with bleeding risk. The
ledger is [scope-acute-periop-quantitation.md](scope-acute-periop-quantitation.md).

## 1. Thesis

The ICU runs on a handful of validated, fully-deterministic instruments the
catalog is missing: the sedation depth recorded hourly (RASS), the twice-daily
delirium screen (CAM-ICU), the first-day burn-resuscitation volume (Parkland),
the tonicity that drives the DKA/HHS management (effective osmolality), and the
maintenance-fluid rate (Holliday-Segar). v188 ships these five. Each is a fixed
scale or closed-form computation — auditable, unit-tested at every anchor and
band — and each is decision support, **never an order to sedate, bolus, or
de-escalate**.

## 2. What v188 adds (5 tiles)

### 2.1 `rass` — Richmond Agitation-Sedation Scale

- **Citation:** Sessler CN, Gosnell MS, Grap MJ, et al. The Richmond
  Agitation-Sedation Scale: validity and reliability in adult intensive care unit
  patients. *Am J Respir Crit Care Med.* 2002;166(10):1338-1344.
- **citationUrl:** https://doi.org/10.1164/rccm.2107138
- **Group:** G. **Specialties:** `critical-care`, `nursing-icu`, `anesthesiology`.
- **Inputs:** the single observed level on the 10-point scale (+4 combative … 0
  alert and calm … −5 unarousable), selected from the anchored descriptors.
- **Output:** the **RASS score (−5 to +4)** with its anchor label and the usual
  light-sedation target band (−2 to 0 *(verify at implementation,
  [spec-v97](spec-v97.md))*), framed as an assessment, not a titration order.
  Class A. Cross-links `cam-icu`.

### 2.2 `cam-icu` — Confusion Assessment Method for the ICU

- **Citation:** Ely EW, Inouye SK, Bernard GR, et al. Delirium in mechanically
  ventilated patients: validity and reliability of the Confusion Assessment
  Method for the ICU (CAM-ICU). *JAMA.* 2001;286(21):2703-2710.
- **citationUrl:** https://doi.org/10.1001/jama.286.21.2703
- **Group:** G. **Specialties:** `critical-care`, `nursing-icu`, `neurology`.
- **Inputs:** the four features — (1) acute change/fluctuating mental status,
  (2) inattention, (3) RASS level for altered level of consciousness, and (4)
  disorganized thinking — entered as present/absent per the published algorithm.
- **Output:** **CAM-ICU positive (delirium present) vs negative**, by the rule
  *features 1 and 2 and (3 or 4)*, naming which features were met; not
  interpretable when RASS is −4/−5 (unarousable), which the tile states. Class A.
  Cross-links `rass`.

### 2.3 `parkland` — Parkland Burn Resuscitation Formula

- **Citation:** Baxter CR, Shires T. Physiological response to crystalloid
  resuscitation of severe burns. *Ann N Y Acad Sci.* 1968;150(3):874-894.
- **citationUrl:** https://doi.org/10.1111/j.1749-6632.1968.tb14738.x
- **Group:** F (specialized dosing). **Specialties:** `burn`, `critical-care`,
  `emergency-medicine`, `nursing-icu`.
- **Inputs:** weight (kg) and the **% total body surface area burned** (the tile
  notes that only second-degree and deeper burns count toward %TBSA). Computes the
  **24-hour crystalloid volume = 4 mL × kg × %TBSA**, with **half over the first
  8 hours** (from the time of injury) and the remainder over the next 16 h, plus
  the implied initial hourly rate.
- **Output:** the **total 24-h volume**, the **first-8-h volume and rate**, and
  the next-16-h rate, with the explicit caveat that the formula is a starting
  estimate titrated to urine output, not a fixed prescription. Class A.
  Cross-links the maintenance-fluid tile.

### 2.4 `effective-osmolality` — Effective Serum Osmolality (tonicity)

- **Citation:** the calculated effective osmolality (tonicity) = 2·Na⁺ +
  glucose/18, which — unlike total calculated osmolality — **omits urea** because
  urea crosses cell membranes freely and does not drive water shifts. Standard
  formula as applied in DKA/HHS management (Kitabchi AE, et al. *Diabetes Care.*
  2009;32(7):1335-1343, hyperglycemic-crises consensus).
- **citationUrl:** https://doi.org/10.2337/dc09-9032
- **Group:** E (clinical math). **Specialties:** `endocrinology`, `critical-care`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** serum sodium (mmol/L) and glucose (mg/dL or mmol/L, unit-toggled).
  Computes **effective osmolality = 2·Na⁺ + glucose/18** (mOsm/kg).
- **Output:** the **effective osmolality**, contrasted with total osmolality and
  banded against the HHS threshold (≈ > 320 mOsm/kg *(verify at implementation,
  [spec-v97](spec-v97.md))*). Class A. Cross-links the anion-gap and sodium tiles.

### 2.5 `maintenance-fluids` — Holliday-Segar Maintenance IV Fluid Rate (4-2-1)

- **Citation:** Holliday MA, Segar WE. The maintenance need for water in
  parenteral fluid therapy. *Pediatrics.* 1957;19(5):823-832.
- **citationUrl:** https://doi.org/10.1542/peds.19.5.823
- **Group:** F. **Specialties:** `pediatrics`, `nursing-peds`, `emergency-medicine`,
  `nursing-floor`.
- **Inputs:** weight (kg). Computes the **daily maintenance volume** by the
  100/50/20 mL/kg/day tiers (100 for the first 10 kg, 50 for the next 10, 20 for
  each kg above 20) and the **hourly rate** by the equivalent 4/2/1 mL/kg/h
  "4-2-1" rule.
- **Output:** the **maintenance rate (mL/h)** and **daily volume (mL/day)**, naming
  the tier breakdown, with the caveat that maintenance needs are adjusted for
  fever, losses, and clinical status. Class A. Cross-links `parkland` and the
  weight-based dose tiles.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-/positive-guarded.**
  Parkland guards weight > 0 and 0 < %TBSA ≤ 100; effective osmolality guards the
  glucose unit conversion; the maintenance-fluid tiers guard weight > 0; outside
  these each tile renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **`cam-icu` encodes the published Boolean rule exactly** (features 1 ∧ 2 ∧
  (3 ∨ 4)) and refuses to score when RASS is −4/−5, so a deeply-sedated patient is
  never reported as delirium-negative-by-default.
- **`parkland` and `maintenance-fluids` render their titration caveats as
  first-class output**, so a starting estimate is never presented as a fixed
  order ([spec-v59](spec-v59.md) output-safety).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the boundary anchors and unit edges.
- **These assess and estimate; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a sedation, fluid, or
  de-escalation order in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed scales /
  formulas, each cited by journal + authors. The implementing session confirms the
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) result at build
  time and adds a `docs/citation-staleness.md` row only if a society issuer
  matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/icucare-v188.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v188.js`; its `RV188` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The
  catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `critical-care`,
  `nursing-icu`, `anesthesiology`, `neurology`, `burn`, `emergency-medicine`,
  `endocrinology`, `internal-medicine`, `pediatrics`, `nursing-peds`,
  `nursing-floor` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v188.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v188 RV188 into RENDERERS)
lib/icucare-v188.js                      (new: rass, camIcu, parkland, effectiveOsmolality, maintenanceFluids)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links)
views/group-v188.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/rass.test.js, cam-icu.test.js, parkland.test.js, effective-osmolality.test.js, maintenance-fluids.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/icucare-v188.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-acute-periop-quantitation.md  (record the v188 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v188 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **RASS
  anchor selection**, a **CAM-ICU positive-vs-negative pair (with the RASS
  −4/−5 not-interpretable case)**, a **Parkland 24-h / first-8-h split**, an
  **effective osmolality crossing the HHS threshold**, and a **Holliday-Segar
  rate spanning two weight tiers**.
- Every compute is finite/positive-guarded, routes through `lib/num.js`, and is
  covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v188 with the +5 delta.

## 7. Out of scope for v188

- **No sedation titration or fluid order** — the tiles assess and estimate; the
  titration and prescription stay with the clinician and protocol
  ([spec-v11](spec-v11.md) §5.3).
- **No modified Brooke / other burn formulas in this tile** — `parkland` ships the
  Parkland (Baxter) crystalloid formula; alternative regimens are out of scope for
  this slice.
- **No ABCDEF-bundle workflow automation** — v188 ships the individual
  instruments, not a bundle tracker.
