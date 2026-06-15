# spec-v80.md — E/M & time-based coding, completed: the 2023 overhaul across every setting, plus the time-unit codes; +6 tiles

> Status: **ACCEPTED (2026-06-15).** Shipped: `lib/billing-v80.js` (the six
> compute exports), the six `views/group-b.js` renderers, the +6 Group B
> catalog rows, the META entries with worked examples (validated by the
> example-correctness e2e sweep), the `billing-v80` ledger family, the
> `test/unit/billing-v80.test.js` boundary suite, and the six
> `docs/audits/v12/` logs. Catalog 347 → **353**. One implementation note vs the
> proposal: `prolonged-services` is scoped to the **physician** prolonged add-ons
> (99417/99418 vs Medicare G2212/G0316); the clinical-staff 99415/99416 path
> (a first-hour/30-minute model on a different axis) is deferred rather than
> shipped with an unverifiable threshold — the AMA-vs-Medicare divergence the
> spec headlines is fully delivered on the physician codes.
>
> Third feature spec of the
> [spec-v77](spec-v77.md) billing & coding program. The catalog's E/M tools stop
> at the **office** (`em-time`, `em-mdm` cover 99202–99215). The AMA's 2023
> overhaul extended the same framework to **every** E/M setting, and the
> highest-dollar coding errors now live in the settings we don't cover:
> inpatient/observation, ED, nursing facility, home; critical care; split/shared;
> prolonged services; therapy time units; and anesthesia units. v80 adds **6
> deterministic tiles** that finish the job.
>
> Catalog effect: **347 → 353 (+6).** Home: **Group B — Billing & Reimbursement**
> ([spec-v77](spec-v77.md) §3); the new MDM and prolonged tiles cross-link the
> existing Group A `em-time`/`em-mdm`.
>
> Every tile obeys the [spec-v77](spec-v77.md) §2 doctrine. *CPT® is an AMA
> trademark; these tiles compute the level/units from the user's documented
> elements and ship no proprietary CPT descriptor file.*

## 1. Thesis

After the 2021 office-E/M revision and its 2023 extension, the level a visit codes
to is a **deterministic function** of either documented time or the 2-of-3 MDM
grid — in *every* setting, not just the office. The existing tiles only do the
office. The result is that the hardest, most-audited, highest-value E/M decisions
have no tool:

- the hospitalist coding 99221–99223 / 99231–99233 on MDM;
- the ED coder on 99281–99285 (MDM only — ED has no time path);
- the SNF/home visit coder on 99304–99310 / 99341–99350;
- critical care minutes → 99291 + 99292 units;
- the **split/shared** substantive-portion call (which of two providers bills) and
  its **FS** modifier under the 2024 CMS rule;
- prolonged services (99417 / 99418 / G2212) once the time floor is crossed;
- therapy timed-code units under the **8-minute rule**;
- anesthesia units = base + time + modifying, × the anesthesia CF.

Each is input→output. v80 ships all six and cross-links the office tiles so the
E/M surface is finally complete.

## 2. The six tiles

Each passes [spec-v29](spec-v29.md) §3, inherits the [spec-v59](spec-v59.md)
contract, cites the AMA/CMS source inline with `accessed` + ledger row, renders the
[spec-v77](spec-v77.md) §2 posture note, and names its office near-neighbor.

### 2.1 `em-mdm-2023` — MDM-based E/M level across all settings
- **Citation:** AMA CPT 2023 Evaluation and Management Guidelines (the 2021
  office grid extended to inpatient/observation, ED, nursing facility, and
  home/residence services). Level set by **2 of 3**: number/complexity of problems
  addressed; amount/complexity of data reviewed; risk of complications.
- **citationUrl:** https://www.ama-assn.org/practice-management/cpt/cpt-evaluation-and-management
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `clinicians`.
- **Inputs:** the **setting** (office — defers to the existing `em-mdm`; inpatient/
  observation initial 99221–99223 and subsequent 99231–99233; ED 99281–99285;
  nursing facility 99304–99310; home/residence 99341–99350); the three MDM elements
  graded against the grid; new vs established where the setting distinguishes it.
- **Output:** the **MDM level and the specific code for that setting** (e.g.,
  Moderate MDM → 99222 initial inpatient / 99284 ED / 99309 SNF subsequent), with
  the **limiting element** shown (the 2-of-3 driver), mirroring `em-mdm`'s output
  shape. The single tile that takes E/M MDM coding from "office only" to "every
  place a patient is seen." **Near-neighbor:** `em-mdm` (office) and `em-time`
  (time path) — all three cross-linked; the office tile is unchanged.

### 2.2 `critical-care-time` — 99291 + 99292 aggregate-time units
- **Citation:** AMA CPT 99291 (critical care, first **30–74 minutes**) and 99292
  (each **additional 30 minutes**); CMS Pub. 100-04 Ch. 12 §30.6.12 (aggregating
  the day's critical-care time; excluding separately reported procedure time).
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c12.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `critical-care`, `clinicians`.
- **Inputs:** total critical-care minutes for the day (the user aggregates
  bedside + unit time per the rule); optional minutes of separately billable
  procedures to **subtract** (not counted toward critical care).
- **Output:** the **code set** — nothing below 30 min (report an E/M instead),
  99291 alone for 30–74, then 99291 + 99292 × N with the 30-minute add-on bands
  (e.g., 104 min → 99291 + 99292×1; 134 min → 99291 + 99292×2) — and the
  **units of 99292**, with the "<30 min is not critical care" floor stated. The
  bedside-minutes-to-codes conversion done correctly, including the subtraction
  rule that trips up most coders.

### 2.3 `split-shared` — substantive-portion determiner & FS modifier (2024 rule)
- **Citation:** CMS PFS split (or shared) visit policy (Pub. 100-04 Ch. 12
  §30.6.18): in a facility setting, when a physician and an NPP both perform part
  of an E/M, the visit is billed by whoever performs the **substantive portion**;
  the **FS** modifier identifies the split/shared service.
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c12.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `compliance`, `clinicians`.
- **Inputs:** the substantive-portion basis being used (more-than-half of total
  time, **or** performance of a substantive part of the MDM); the physician's and
  the NPP's respective time/effort; the setting.
- **Output:** **which provider must bill** (physician vs NPP) under the selected
  basis, whether the **FS modifier** applies, and the **payment consequence** of
  the choice (NPP billing pays at the reduced NPP percentage of the fee schedule).
  The "who bills, and what it costs us" decision the policy makes mandatory but no
  tool computes. **Near-neighbor:** `multi-surgeon-pay` (v78) is the *surgical*
  two-provider split; this is the *E/M* one.

### 2.4 `prolonged-services` — 99417 / 99418 / G2212 unit calculator
- **Citation:** AMA CPT 99417 (prolonged office/outpatient, with primary E/M
  selected by time) and 99418 (prolonged inpatient/observation); CMS **G2212** for
  Medicare outpatient prolonged services (different threshold than 99417); 99415/
  99416 for prolonged clinical staff time.
- **citationUrl:** https://www.cms.gov/medicare/payment/fee-schedules/physician
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`.
- **Inputs:** the primary E/M code (sets the time threshold); total documented
  time; payer (AMA 99417/99418 vs Medicare G2212 — the thresholds differ); whether
  the time is physician or clinical-staff.
- **Output:** the **prolonged add-on code and number of units** once total time
  crosses the floor (15-minute increments per the selected code's rule), or "below
  the prolonged-service threshold — no add-on" when it hasn't, with the
  **AMA-vs-Medicare threshold difference** stated explicitly so a coder doesn't bill
  99417 to a Medicare payer that wants G2212. **Near-neighbor:** `em-time` (selects
  the primary code this adds onto) — cross-linked.

### 2.5 `therapy-units` — timed-code units under the 8-minute rule
- **Citation:** CMS Pub. 100-04 Ch. 5 §20.2 and 42 CFR §410 (the Medicare
  **8-minute rule** for time-based therapy CPT codes: 8–22 min = 1 unit, 23–37 = 2,
  38–52 = 3, 53–67 = 4, … each +15 min adds a unit); contrasted with the AMA
  **Rule of Eights** (mid-point billing per individual service).
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c05.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `coders`, `billers`,
  `therapy-billing`.
- **Inputs:** total timed-treatment minutes (and, for the Rule-of-Eights mode,
  per-service minutes); the rule (Medicare 8-minute / cumulative, vs AMA Rule of
  Eights / per-service); any untimed-code services to exclude.
- **Output:** the **billable unit count** under the selected rule, the **band the
  total falls in** (e.g., 50 min → 3 units under the 8-minute rule), and the
  **difference** between the two rules when they diverge (they often do at the
  boundaries — the classic source of PT/OT/SLP under- and over-billing). The
  minutes-to-units conversion every outpatient therapy claim depends on.

### 2.6 `anesthesia-units` — base + time + modifying units × anesthesia CF
- **Citation:** CMS Pub. 100-04 Ch. 12 §50 (anesthesia payment = (base units +
  time units + modifying units) × anesthesia conversion factor; time unit =
  **15 minutes**); ASA Relative Value Guide base units; physical-status modifiers
  P1–P6; medical-direction modifiers (QK/QY/QX/AD) and their concurrency reduction.
- **citationUrl:** https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/clm104c12.pdf
- **Group:** Billing & Reimbursement (`B`). **Audiences:** `billers`, `coders`,
  `anesthesia-billing`.
- **Inputs:** base units (entered from the ASA RVG — not shipped, doctrine
  clause 2); anesthesia time in minutes (converted to 15-min time units); any
  modifying units; the anesthesia conversion factor (preset dated CMS value,
  overridable); the medical-direction modifier (sets the concurrency payment
  percentage — e.g., QK/QY medically-directed cases share the payment).
- **Output:** the **total anesthesia units**, the dollars from `total units × CF`,
  and the **medical-direction-adjusted payment** (the QK/QX/QY/AD percentage
  applied), with the 15-minute time-unit conversion shown as a derivation. The one
  fee in the book that doesn't use the RVU formula — so it needs its own tile.
  **Near-neighbor:** `rvu-payment` (v78) prices everything *except* anesthesia;
  this is the exception.

## 3. Robustness

- **Time-band math is table-driven and boundary-tested.** The critical-care
  30/74-minute floor, the 8-minute-rule bands, the prolonged-service 15-minute
  increments, and the anesthesia 15-minute time unit are each encoded as the cited
  band table and unit-tested **at every boundary minute** (e.g., 7 vs 8, 22 vs 23,
  74 vs 75) — the boundaries are exactly where real claims get miscoded.
- **Setting/payer forks are explicit, never inferred.** `em-mdm-2023` requires the
  setting; `prolonged-services` and `therapy-units` require the payer/rule; no tile
  silently assumes Medicare or office. The AMA-vs-Medicare threshold divergences
  (99417 vs G2212; 8-minute vs Rule of Eights) are surfaced as the headline, not a
  footnote.
- **Dated constants ledger-tracked.** The anesthesia CF, the G2212/99417 time
  thresholds, the medical-direction percentages, and the CPT E/M edition each get a
  `pa-staleness-ledger.json` row (ruleFamily `billing-v80`); `check-pa-staleness`
  guards them.
- All six compute functions join the [spec-v59](spec-v59.md) fuzz harness; zero
  non-finite leaks; minutes below a floor return a `note`, never a negative or
  zero-unit silent answer.

## 4. Files touched

```
docs/spec-v80.md                 (this file)
app.js                           (+6 UTILITIES rows in Group B; cross-link seeds to existing em-time/em-mdm in Group A)
views/group-b.js                 (renderers for the 6 E/M & time-unit tiles; band-table derivation blocks)
lib/billing-v80.js               (new compute exports: emMdm2023, criticalCareTime, splitShared, prolongedServices, therapyUnits, anesthesiaUnits)
lib/coding-v5.js                 (em-mdm-2023 reuses the office EM_CODES/grid constants; office em-mdm output regression-pinned, unchanged)
lib/meta.js                      (+6 META entries: inline citation, citationUrl, accessed; related-tools cross-links to em-time/em-mdm)
pa-staleness-ledger.json         (+rows: anesthesia CF, G2212/99417 thresholds, medical-direction %s, CPT E/M edition — ruleFamily billing-v80)
lib/pa/staleness-ledger.js, scripts/check-pa-staleness.mjs   (recognize ruleFamily billing-v80)
test/unit/em-mdm-2023.test.js … anesthesia-units.test.js  (6 unit tests, ≥3 boundary worked examples each, incl. every time-band boundary minute)
test/integration/fuzz-tools.spec.js   (import lib/billing-v80.js)
docs/audits/v12/<each new tile>.md     (spec-v11 audit logs)
docs/scope-mdcalc-parity.md            (catalog 347 → 353)
README.md, package.json                (catalog count 347 → 353; spec-progression line → v80)
CHANGELOG.md                           (Unreleased: v80 entry, +6)
```

## 5. Acceptance criteria

- All 6 tiles in §2 are live in Group B with a `META[id]` entry, inline cited
  output + `citationUrl` + `accessed`, ≥3 boundary worked examples per unit test, a
  [spec-v11](spec-v11.md) audit log, and pass [spec-v29](spec-v29.md) §3.
- `em-mdm-2023` returns the correct setting-specific code for Moderate/High MDM in
  inpatient, ED, SNF, and home and cross-links the office `em-mdm`;
  `critical-care-time` returns the right 99291/99292 unit set at 29/30/74/75/104/134
  minutes and the subtraction rule; `split-shared` names the billing provider and FS
  modifier for each basis; `prolonged-services` distinguishes 99417 from G2212 by
  payer at the threshold; `therapy-units` matches the 8-minute band table and shows
  the Rule-of-Eights divergence; `anesthesia-units` reproduces a (base+time+mod)×CF
  example and the medical-direction percentage.
- The existing office `em-time`/`em-mdm` outputs are byte-identical (regression-
  pinned); the three E/M tiles cross-link.
- Every dated constant has a `pa-staleness-ledger.json` row (ruleFamily
  `billing-v80`); `check-pa-staleness` passes.
- `lib/billing-v80.js` is in the fuzz harness with zero non-finite leaks;
  `UTILITIES.length` is **353** and catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, `npm run build`,
  `npm run check-pa-staleness` pass; CHANGELOG records v80 with +6.

## 6. Out of scope for v80

- **No proprietary CPT descriptor file or ASA RVG base-unit table** ([spec-v77](spec-v77.md)
  §8): base units and code descriptors are entered/owned by the user; the tiles
  compute the level/units/payment from documented elements.
- **No documentation auditing.** The tiles compute the level the documented MDM/
  time supports; they do not verify the note actually contains it (that is the
  `pa-lint`-style linter's job, not a calculator's).
- **No facility E/M (UB-04 / type-of-bill) E/M leveling.** v80 is professional
  (CMS-1500) E/M; facility E/M leveling is a separate institutional methodology and
  is not in this spec.
