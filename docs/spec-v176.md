# spec-v176.md — Falls risk, balance & gait: STRATIFY, 30-second chair stand, 4-stage balance, functional reach, gait speed, and the CDC STEADI algorithm (+6 tiles)

> Status: **SHIPPED 6 of 6 (2026-06-29).** Fourth implementation spec of the
> spec-v172 LTC-GA program; all six tiles (`stratify`, `chair-stand-30s`,
> `four-stage-balance`, `functional-reach`, `gait-speed` in Group E, and
> `steadi-algorithm`) are live. The CDC STEADI norm tables and the gait-speed /
> reach cut-points were re-fetched and cross-verified against ≥ 2 independent
> sources (spec-v97); the three CDC-citing tiles are Class B with
> `docs/citation-staleness.md` rows. Original draft below.
>
> Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program, cluster **§3.4 — Falls risk, balance & gait**. Adds **6**
> deterministic falls-risk, balance, and gait instruments that fill the
> performance-based-battery and CDC-STEADI gap confirmed in the
> [spec-v172](spec-v172.md) §3.4 audit. None duplicates a live tile; the live
> falls tiles `morse-falls` and `hendrich-ii` stay and are cross-linked.
>
> Catalog effect at v176: **live `UTILITIES.length` + 6** — never a number copied
> from this document; the catalog-truth gate enforces agreement on all 13
> surfaces ([spec-v46](spec-v46.md)) using the live count + delta (the running
> counts carry a known off-by-one, per the [spec-v100](spec-v100.md) program
> lessons).
>
> Every prior spec (v4 through v175) remains in force. v176 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification (a tile *consumes the clinician's
> observations and computes a score/flag*; it does not display a static reference
> table) — and the [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 clinical-posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (no exercise prescription or treatment
> order in Sophie's voice). **Every weight, band, norm, and cut-point is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing in this document is implemented from recall.

## 1. Thesis

The catalog already carries the two inpatient falls-risk screens a hospital nurse
reaches for — `morse-falls` and `hendrich-ii`. It does not carry the
**performance-based battery** and the **community / LTC screening algorithm** that
a nursing home, geriatric clinic, PACE program, or outpatient physical therapist
uses to triage falls risk: the timed and counted functional tests (chair stand,
balance stance, forward reach, gait speed) and the CDC STEADI algorithm that ties
the screening questions and the functional test together into a low / moderate /
high pathway. v176 closes that surface with six instruments. Three of them
(`chair-stand-30s`, `four-stage-balance`, `steadi-algorithm`) are anchored in the
public CDC STEADI (Stopping Elderly Accidents, Deaths & Injuries) toolkit; the
other three (`stratify`, `functional-reach`, `gait-speed`) are journal-published
instruments.

- **STRATIFY** — the St Thomas's Risk Assessment Tool in Falling Elderly
  Inpatients: 5 yes/no items → 0–5, with the published high-risk threshold.
- **chair-stand-30s** — the 30-Second Chair Stand Test: number of full stands in
  30 s compared against the CDC STEADI below-average age/sex norm → fall-risk flag.
- **four-stage-balance** — the 4-Stage Balance Test (CDC STEADI): progressive
  stances and the longest stance held; inability to hold tandem ≥10 s flags risk.
- **functional-reach** — the Functional Reach Test: forward reach distance against
  the published age/sex cut-points.
- **gait-speed** — habitual / 4-metre gait speed: distance and time → m/s, with
  the published adverse-outcome cut-points. Returns a value (Group E).
- **steadi-algorithm** — the CDC STEADI fall-risk screening algorithm: the three
  key screening questions plus a gait/strength/balance result → low / moderate /
  high pathway.

## 2. What v176 adds (6 tiles)

### 2.1 `stratify` — St Thomas's Risk Assessment Tool in Falling Elderly Inpatients

- **Citation:** Oliver D, Britton M, Seed P, Martin FC, Hopper AH. Development and
  evaluation of evidence based risk assessment tool (STRATIFY) to predict which
  elderly inpatients will fall: case-control and cohort studies. *BMJ.*
  1997;315(7115):1049-1053.
- **citationUrl:** https://doi.org/10.1136/bmj.315.7115.1049
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `nursing-rehab`,
  `rehabilitation`.
- **Inputs:** the 5 yes/no items — a fall as the presenting complaint or a fall
  since admission; the patient is agitated; visual impairment affecting everyday
  function; in need of especially frequent toileting; a combined transfer + mobility
  score (transfer and mobility each scored, the item flagged at the published
  threshold).
- **Output:** the **STRATIFY total (0–5)** with the published high-risk threshold
  **≥ 2 = high fall risk** (verify at implementation, [spec-v97](spec-v97.md)),
  naming the items counted. Class A. Cross-links `morse-falls` and `hendrich-ii`.

### 2.2 `chair-stand-30s` — 30-Second Chair Stand Test

- **Citation:** Jones CJ, Rikli RE, Beam WC. A 30-s chair-stand test as a measure
  of lower body strength in community-residing older adults. *Res Q Exerc Sport.*
  1999;70(2):113-119; CDC STEADI below-average age/sex norms (Assessment: 30-Second
  Chair Stand).
- **citationUrl:** https://doi.org/10.1080/02701367.1999.10608028
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `physical-therapy`,
  `physical-medicine-rehabilitation`, `rehabilitation`, `primary-care`.
- **Inputs:** the number of full stands completed in 30 s, plus age and sex (the
  CDC STEADI norms are stratified by age band and sex).
- **Output:** the **stand count** with the **below-average-for-age/sex flag**
  indicating increased fall risk when the count falls below the published CDC
  STEADI cut-point for that age/sex band (verify the band table at implementation,
  [spec-v97](spec-v97.md)). Class B (CDC STEADI — `docs/citation-staleness.md`
  row). Cross-links `steadi-algorithm`.

### 2.3 `four-stage-balance` — 4-Stage Balance Test (CDC STEADI)

- **Citation:** Centers for Disease Control and Prevention. *STEADI — Assessment:
  4-Stage Balance Test* (Stopping Elderly Accidents, Deaths & Injuries toolkit).
- **citationUrl:** https://www.cdc.gov/steadi/ (verify edition/accessed date at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `physical-therapy`,
  `physical-medicine-rehabilitation`, `rehabilitation`, `nursing-rehab`.
- **Inputs:** the four progressive stances — feet side-by-side, instep-to-big-toe
  semi-tandem, full tandem, single leg — recording the furthest progressive stance
  attempted and the longest time the patient held it.
- **Output:** the **furthest stance held with the time held**, with the published
  flag **inability to hold the full tandem stance for ≥ 10 s indicates increased
  fall risk** (verify at implementation, [spec-v97](spec-v97.md)), naming the stance
  reached. Class B (CDC STEADI — `docs/citation-staleness.md` row). Cross-links
  `steadi-algorithm`.

### 2.4 `functional-reach` — Functional Reach Test

- **Citation:** Duncan PW, Weiner DK, Chandler J, Studenski S. Functional reach: a
  new clinical measure of balance. *J Gerontol.* 1990;45(6):M192-M197.
- **citationUrl:** https://doi.org/10.1093/geronj/45.6.M192
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `physical-therapy`,
  `physical-medicine-rehabilitation`, `rehabilitation`.
- **Inputs:** the forward reach distance (selectable units, in or cm) and age/sex
  (the published normative ranges are stratified by age band and sex).
- **Output:** the **reach distance** mapped to the published cut-points — e.g.,
  **< 6 in (≈ 15 cm) = markedly increased fall risk**, with the age/sex normative
  ranges for context (verify the exact bands at implementation,
  [spec-v97](spec-v97.md)). Class A.

### 2.5 `gait-speed` — 4-metre / Habitual Gait Speed

- **Citation:** Studenski S, Perera S, Patel K, et al. Gait speed and survival in
  older adults. *JAMA.* 2011;305(1):50-58; Fritz S, Lusardi M. White paper: "Walking
  speed: the sixth vital sign." *J Geriatr Phys Ther.* 2009;32(2):46-49.
- **citationUrl:** https://doi.org/10.1001/jama.2010.1923
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `geriatrics`, `physical-therapy`,
  `physical-medicine-rehabilitation`, `rehabilitation`, `primary-care`.
- **Inputs:** the walked distance (m; commonly 4 m) and the time taken (s).
- **Output:** the **gait speed in m/s** (distance ÷ time) with the published
  interpretive cut-points — **< 0.6 m/s = high risk of adverse outcomes**,
  **< 0.8 m/s = limited community ambulation**, **≥ 1.0 m/s = healthy /
  well-functioning** (verify the exact bands at implementation,
  [spec-v97](spec-v97.md)). Class A. Returns a value, hence Group E. Division by a
  zero or blank time is domain-guarded — a non-finite/zero denominator returns a
  surfaced `valid:false` fallback, never `Infinity`/`NaN` ([spec-v59](spec-v59.md)).

### 2.6 `steadi-algorithm` — CDC STEADI Fall-Risk Screening Algorithm

- **Citation:** Stevens JA, Phelan EA. Development of STEADI: a fall prevention
  resource for health care providers. *Health Promot Pract.* 2013;14(5):706-714;
  CDC STEADI (Stopping Elderly Accidents, Deaths & Injuries) algorithm for fall
  risk screening, assessment, and intervention.
- **citationUrl:** https://doi.org/10.1177/1524839912463576
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `primary-care`, `nursing-general`,
  `nursing-rehab`, `rehabilitation`.
- **Inputs:** the 3 key screening questions — fell in the past year (and, if so,
  how many times and whether any fall caused injury); feels unsteady when standing
  or walking; worries about falling — plus a gait/strength/balance test result
  (e.g., the Timed Up & Go, the 30-second chair stand, or the 4-stage balance test
  outcome entered as below/at norm).
- **Output:** the **fall-risk pathway — low / moderate / high** per the published
  CDC STEADI algorithm logic (e.g., a positive screen plus an abnormal gait/balance
  test, or recurrent/injurious falls, escalating the pathway), naming which inputs
  drove the result. Class B (CDC STEADI — `docs/citation-staleness.md` row).
  Cross-links `chair-stand-30s`, `four-stage-balance`, and `gait-speed`.

## 3. Per-tile robustness

- **`stratify` is a bounded sum** — five yes/no items → 0–5, mapped to the
  published high-risk threshold (≥ 2, verify at implementation). It names which
  items were counted; blank items score 0 within the bounded range, and a fully
  blank form renders a complete-the-fields fallback.
- **`chair-stand-30s` and `functional-reach` compare a measured value against the
  published age/sex norm.** Each robustness note names **the value compared** — the
  stand count for `chair-stand-30s`, the forward reach distance for
  `functional-reach` — and the age/sex norm band it is compared against. The norm
  tables are re-fetched verbatim and cross-verified ([spec-v97](spec-v97.md)); a
  missing age/sex stratum surfaces a `valid:false` rather than guessing a band.
- **`four-stage-balance` maps the furthest stance held and its hold time** to the
  published flag (tandem held < 10 s). The named value compared against the norm is
  **the tandem-stance hold time in seconds** versus the 10 s cut-point.
- **`gait-speed` is a guarded ratio.** The result is finite- and positive-guarded
  on the **time denominator**: a zero/blank/non-finite time returns a surfaced
  `valid:false` fallback, never `Infinity`/`NaN`. The m/s result is then mapped to
  the published cut-points (< 0.6, < 0.8, ≥ 1.0), and the named value compared is
  the computed gait speed in m/s.
- **`steadi-algorithm` is a deterministic pathway mapping** — the three screening
  questions plus the gait/balance test outcome route to low / moderate / high per
  the published algorithm logic; each branch is unit-tested and the output names
  which inputs drove the pathway.
- All six render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote the
  source's interpretation; **none authors an exercise prescription or
  fall-prevention treatment order in Sophie's voice** ([spec-v11](spec-v11.md)
  §5.3); all flow through the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks** (`gait-speed` is explicitly fuzzed for the division path).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6), as the [spec-v172](spec-v172.md) §5 program shape
specializes it:

- **Maintenance classes (§6.3):** `stratify`, `functional-reach`, and `gait-speed`
  are **Class A** — fixed thresholds/formulas cited by journal + authors. The three
  CDC-STEADI-based tiles — **`chair-stand-30s`, `four-stage-balance`, and
  `steadi-algorithm`** — are **Class B**: their citation names the **CDC**, which
  trips the `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)
  lesson), so each gets a `docs/citation-staleness.md` row naming the STEADI
  edition, the `accessed` date, and an on-publication / annual review cadence. The
  implementing session confirms the CDC trip at build time rather than from this
  document.
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/ltcga-v176.js` module (named exports — `stratify`, `chairStand30s`,
  `fourStageBalance`, `functionalReach`, `gaitSpeed`, `steadiAlgorithm`), added to
  the `test/unit/fuzz-tools.test.js` `MODULES` list — `gait-speed` explicitly
  fuzzed for the division/overflow path (zero non-finite leaks). Renderers live in
  the new `views/group-v176.js` module; its `RV176` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** ([spec-v46](spec-v46.md)) in the
  same change using the **live `UTILITIES.length` + 6**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass for
  `views/group-v176.js`.
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): `geriatrics`, `nursing-general`,
  `nursing-rehab`, `physical-therapy`, `physical-medicine-rehabilitation`,
  `primary-care`, `rehabilitation`. No vocabulary edit is required.
- **Program note:** v176 is one of the ten LTC-GA feature specs (v173–v182);
  `scope-mdcalc-parity.md` records the v176 delta against the running LTC-GA total.

## 5. Files touched

```
docs/spec-v176.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups G/E; import group-v176 RV176 into RENDERERS)
lib/ltcga-v176.js                        (new module: stratify, chairStand30s, fourStageBalance, functionalReach, gaitSpeed, steadiAlgorithm)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to morse-falls, hendrich-ii, and the STEADI battery siblings)
views/group-v176.js                      (new renderer module: 6 renderers)
docs/citation-staleness.md               (+3 rows: chair-stand-30s, four-stage-balance, steadi-algorithm — CDC STEADI)
docs/clinical-citations.md               (+6 rows for the six sources)
test/unit/stratify.test.js, chair-stand-30s.test.js, four-stage-balance.test.js, functional-reach.test.js, gait-speed.test.js, steadi-algorithm.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v176.js to MODULES)
docs/audits/v12/stratify.md, chair-stand-30s.md, four-stage-balance.md, functional-reach.md, gait-speed.md, steadi-algorithm.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+6; record v176 against the LTC-GA running total)
CHANGELOG.md                             (Unreleased: v176 entry, +6)
README.md, package.json                  (catalog count live -> live+6; spec-progression line -> v176)
```

## 6. Acceptance criteria

v176 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent, and has confirmed none collides with
  the [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) reserved ids
  (`berg-balance`, `tinetti-poma`, `tug`, `pps` are reserved there and are **not**
  shipped here).
- All 6 tiles in §2 are live (groups G/E — `gait-speed` is Group E) with a
  `META[id]` entry, an inline primary citation + `citationUrl` + `accessed`, ≥3
  boundary worked examples each (including a **STRATIFY 1 → 2 high-risk
  classification flip**, a **`gait-speed` 0.8 m/s boundary** (the
  limited-community-ambulation cut-point), and a **`chair-stand-30s`
  below-norm flip** at an age/sex band edge), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `gait-speed` guards its time denominator (zero/blank/non-finite time → surfaced
  `valid:false`, never `Infinity`/`NaN`); `chair-stand-30s`, `four-stage-balance`,
  and `functional-reach` surface a `valid:false` for a missing age/sex stratum
  rather than guessing a band; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks; no tile authors an exercise prescription
  in Sophie's voice ([spec-v11](spec-v11.md) §5.3); each renders the
  [spec-v50](spec-v50.md) §3 posture note.
- `chair-stand-30s`, `four-stage-balance`, and `steadi-algorithm` each carry
  `accessed` + a `docs/citation-staleness.md` row (CDC STEADI edition, accessed
  date, review cadence).
- `UTILITIES.length` is **live count + 6** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the v176 delta
  against the LTC-GA running total.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v176 with the +6 catalog delta.

## 7. Out of scope for v176

- **No `berg-balance`, `tinetti-poma`, or `tug`** — these performance-based balance
  and mobility instruments are **reserved in the
  [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) drafts** and are **not
  duplicated here** ([spec-v172](spec-v172.md) §2 test 4 / §4). `steadi-algorithm`
  accepts a gait/strength/balance test *result* as an input but does not re-implement
  those reserved tools.
- **No full STEADI toolkit pocket guide** — the CDC STEADI pocket guide, the
  provider algorithm poster, and the patient-education materials are **reference
  documents, not calculators** (fail [spec-v29](spec-v29.md) §3 /
  [spec-v100](spec-v100.md) §2). v176 ships the three STEADI *instruments that
  compute* (chair stand, 4-stage balance, the screening algorithm), not the toolkit.
- **No fall-prevention intervention plan or exercise prescription** — each tile
  reports the score/flag/pathway and the source's interpretation; the intervention
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md)
  §5.3, [spec-v50](spec-v50.md) §3).
- **No multifactorial fall-risk environmental or medication-review module** — v176
  is the screening / performance-battery surface; the deprescribing burden tools
  live in [spec-v172](spec-v172.md) §3.7 (v179), and the live `morse-falls` /
  `hendrich-ii` cover the inpatient nursing screens.
