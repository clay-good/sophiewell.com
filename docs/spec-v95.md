# spec-v95.md — Neurology outcome scales & grading: modified Rankin, GOS-E, Hoehn-Yahr, Spetzler-Martin, House-Brackmann, and MIDAS (+6 tiles)

> Status: **PROPOSED (2026-06-16).** Wave 2 feature spec of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **6**
> deterministic neurology **outcome scales and grading systems** that fill a
> confirmed gap: the catalog carries the *acute* neuro scores
> (`nihss`, `ich-score`, `hunt-hess-wfns`, `four-score`, `abcd2`) but no
> **outcome scales** (modified Rankin, GOS-E) and no **chronic / structural
> grading** (Hoehn-Yahr, Spetzler-Martin, House-Brackmann, MIDAS). These are the
> instruments the same patient is *followed* with — the stroke-trial endpoint, the
> TBI outcome at six months, the Parkinson stage at clinic, the AVM surgical-risk
> grade, the facial-nerve recovery grade, the migraine disability band. None
> duplicates an existing tile.
>
> Catalog effect at v95 close: **406 + 6 = 412 tiles.**
>
> Every prior spec (v4 through v94) remains in force. v95 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, and is built/gated/maintained under the [spec-v85](spec-v85.md) §6
> CI/CD contract.

## 1. Thesis

The catalog's neurology surface is **acute-onset, not longitudinal**. A clinician
can compute the NIHSS at presentation (`nihss`), the ICH 30-day mortality risk
(`ich-score`), the SAH grade (`hunt-hess-wfns`), the coma score (`four-score`),
and the post-TIA stroke risk (`abcd2`) — but the catalog has nothing for the
*next visit*. The questions that follow are just as deterministic, just as
published, and just as un-Googleable in the specific:

- **Outcome is an ordinal scale, not a narrative.** The **modified Rankin Scale**
  is *the* functional-outcome endpoint of nearly every stroke trial, and the
  "good outcome (0–2)" dichotomy is the line investigators draw. The
  **Glasgow Outcome Scale - Extended** is the TBI analogue, an eight-category
  structured outcome that maps back to the legacy five-point GOS. Neither lives in
  the catalog.

- **Chronic neurologic disease is staged.** **Hoehn & Yahr** is the canonical
  Parkinson-disease stage (original 1–5; the modified 0–5 with half-steps); a
  movement-disorders clinic states it on every note.

- **Structural lesions are graded.** **Spetzler-Martin** is the AVM surgical-risk
  grade every neurosurgeon computes before operating, and the supplemented
  Spetzler-Martin–Lawton-Young refinement sharpens it. **House-Brackmann** is the
  universal facial-nerve function grade after a Bell's palsy, an acoustic-neuroma
  resection, or a parotid case.

- **Disability is quantified.** The **Migraine Disability Assessment (MIDAS)** is
  the five-question instrument that turns "bad headaches" into a graded, banded
  disability score a headache clinic and a family physician both use.

Each is a published, deterministic ordinal instrument a clinician already states
aloud; v95 brings the band logic onto the page beside the acute scores its patient
was admitted with.

## 2. What v95 adds (6 tiles)

### 2.1 `mrs` — modified Rankin Scale

- **Citation:** van Swieten JC, Koudstaal PJ, Visser MC, et al. Interobserver
  agreement for the assessment of handicap in stroke patients. *Stroke.*
  1988;19(5):604-607.
- **citationUrl:** https://doi.org/10.1161/01.STR.19.5.604
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `stroke`, `rehabilitation`, `nursing-floor`.
- **Inputs:** a single 7-point grade selection — 0 (no symptoms), 1 (no
  significant disability despite symptoms), 2 (slight disability), 3 (moderate
  disability, requires some help but walks unassisted), 4 (moderately severe,
  unable to walk/attend bodily needs without assistance), 5 (severe disability,
  bedridden, requires constant care), 6 (dead).
- **Output:** the grade **0–6** with its descriptor and the **"good outcome
  (0–2)" dichotomy** commonly used as a stroke-trial primary endpoint, plus the
  complementary "poor outcome (3–6)" framing. The output quotes the source's
  descriptor verbatim and surfaces the dichotomy band the selected grade falls in.
  **Class A.** Cross-links `nihss` (the acute score this outcome follows).

### 2.2 `gose` — Glasgow Outcome Scale - Extended

- **Citation:** Wilson JT, Pettigrew LE, Teasdale GM. Structured interviews for the
  Glasgow Outcome Scale and the Extended Glasgow Outcome Scale. *J Neurotrauma.*
  1998;15(8):573-585.
- **citationUrl:** https://doi.org/10.1089/neu.1998.15.573
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `neurosurgery`, `trauma-surgery`, `rehabilitation`.
- **Inputs:** a structured selection mapping to the **8 categories** (the
  structured-interview outcome category).
- **Output:** the **GOS-E 1–8** result — 1 (dead), 2 (vegetative state), 3 (lower
  severe disability), 4 (upper severe disability), 5 (lower moderate disability),
  6 (upper moderate disability), 7 (lower good recovery), 8 (upper good recovery)
  — with the descriptor, **and the legacy GOS 1–5 mapping** (GOS-E 1→GOS 1,
  2→2, 3/4→3 severe disability, 5/6→4 moderate disability, 7/8→5 good recovery).
  **Class A.** Cross-links `nihss` and `four-score`.

### 2.3 `hoehn-yahr` — Hoehn & Yahr Parkinson disease staging

- **Citation:** Hoehn MM, Yahr MD. Parkinsonism: onset, progression and mortality.
  *Neurology.* 1967;17(5):427-442.
- **citationUrl:** https://doi.org/10.1212/wnl.17.5.427
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `movement-disorders`, `geriatrics`.
- **Inputs:** a single stage selection — **original 1–5**, or the **modified
  scale** (0, 1, 1.5, 2, 2.5, 3, 4, 5) with the half-steps.
- **Output:** the **stage** with its descriptor — unilateral involvement only (1);
  unilateral plus axial (1.5, modified); bilateral without balance impairment (2);
  mild–moderate bilateral with some postural instability but physically
  independent (2.5/3); severe disability, still able to walk/stand unassisted (4);
  wheelchair-bound or bedridden unless aided (5). The output states which scale
  variant (original vs modified) the selected stage belongs to. **Class A.**

### 2.4 `spetzler-martin` — Spetzler-Martin AVM grading (+ supplementary Lawton-Young)

- **Citation:** Spetzler RF, Martin NA. A proposed grading system for arteriovenous
  malformations. *J Neurosurg.* 1986;65(4):476-483.
- **citationUrl:** https://doi.org/10.3171/jns.1986.65.4.0476
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurology`, `interventional-radiology`.
- **Inputs:** **nidus size** (<3 cm = 1, 3–6 cm = 2, >6 cm = 3); **eloquent
  location** of adjacent brain (no = 0, yes = 1); **deep venous drainage**
  (no = 0, yes = 1). Supplementary Lawton-Young items: **patient age band**
  (<20 = 1, 20–40 = 2, >40 = 3), **hemorrhagic (unruptured) presentation**
  (ruptured/with hemorrhage = 0, unruptured = 1), **diffuse nidus**
  (compact = 0, diffuse = 1).
- **Output:** the **Spetzler-Martin grade I–V** (the sum 1–5 of the three core
  components), **plus** the **supplemented Spetzler-Martin–Lawton-Young score**
  (core 1–5 + supplementary 1–5), each with the cited surgical-risk
  interpretation — lower grades carry lower combined surgical morbidity/mortality
  per the source's bands. The output shows the component breakdown as a derivation
  and names the grade and the supplemented total. **Class A.**

### 2.5 `house-brackmann` — House-Brackmann facial nerve function grading

- **Citation:** House JW, Brackmann DE. Facial nerve grading system.
  *Otolaryngol Head Neck Surg.* 1985;93(2):146-147.
- **citationUrl:** https://doi.org/10.1177/019459988509300202
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `otolaryngology`, `neurology`, `neurosurgery`.
- **Inputs:** a single **6-grade selection** keyed to the gross / at-rest / motion
  descriptors — I (normal), II (mild dysfunction), III (moderate dysfunction),
  IV (moderately severe dysfunction), V (severe dysfunction), VI (total paralysis).
- **Output:** the **grade I–VI** with its descriptor (symmetry and tone at rest;
  forehead, eye, and mouth motion). The output quotes the source's per-grade
  description. **Class A.**

### 2.6 `midas` — Migraine Disability Assessment

- **Citation:** Stewart WF, Lipton RB, Dowson AJ, Sawyer J. Development and testing
  of the Migraine Disability Assessment (MIDAS) questionnaire. *Neurology.*
  2001;56(6 Suppl 1):S20-S28.
- **citationUrl:** https://doi.org/10.1212/wnl.56.suppl_1.s20
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `headache`, `family-medicine`.
- **Inputs:** the **5 questions** over the prior 3 months — (1) days of missed
  work/school; (2) days of half-or-more reduced productivity at work/school;
  (3) days of missed household work; (4) days of half-or-more reduced household
  productivity; (5) days of missed family/social/leisure activity. Ancillary
  items A and B (headache frequency in days; average pain intensity 0–10) are
  captured but **not** summed into the disability score.
- **Output:** the **MIDAS sum** of the five disability questions → **grade I**
  (0–5, little or no disability), **II** (6–10, mild), **III** (11–20, moderate),
  **IV** (≥21, severe), with the band descriptor, plus the ancillary
  frequency/intensity items reported alongside (descriptive, not scored).
  **Class A.**

## 3. Per-tile robustness

- **`mrs`, `gose`, `hoehn-yahr`, and `house-brackmann` are ordinal selectors with
  no arithmetic** — the user picks one grade and the tile maps it to a descriptor
  and band. They carry no division, root, or log, so there is no domain to guard,
  but each still **flows through the [spec-v59](spec-v59.md) fuzz harness on import**
  to confirm that no `undefined`/`NaN` selector index ever reaches the DOM: an
  out-of-range or blank selection returns a surfaced `valid:false` fallback string,
  never a silent blank or a wrong band. The GOS-E→GOS mapping is a fixed lookup,
  validated both directions in the unit test.
- **`spetzler-martin` sums bounded integer components.** Each input is a closed
  selector (size 1–3, eloquence 0–1, deep drainage 0–1; supplementary age 1–3,
  hemorrhagic 0–1, diffuse 0–1), so the core sum is clamped to **1–5** and the
  supplemented total to **2–10** by construction; the tile validates the
  selections are in range and surfaces the component derivation so the grade is
  auditable.
- **`midas` clamps its sum.** The five question days are non-negative integers;
  the tile coerces blanks to 0, **clamps each day-count to a sane upper bound**
  (a 3-month window cannot exceed ~92 days per item), sums to a non-negative total,
  and bands it. The ancillary frequency/intensity items are reported but excluded
  from the sum so they cannot inflate the grade.
- All six render the [spec-v50](spec-v50.md) §3 clinical **posture note** and quote
  the source's own per-band interpretation; none authors an outcome, prognosis, or
  treatment recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3). The
  scales report the band; the disposition stays with the clinician.

## 4. CI/CD & maintenance

This spec instantiates the [spec-v85](spec-v85.md) §6 contract.

- **Maintenance class — all six are [spec-v85](spec-v85.md) §6.3 Class A**
  (stable, fixed ordinal definitions / point structures): van Swieten 1988
  (mRS), Wilson 1998 (GOS-E), Hoehn-Yahr 1967, Spetzler-Martin 1986
  (+ Lawton-Young supplement), House-Brackmann 1985, Stewart 2001 (MIDAS). None is
  a society threshold revised on a calendar, so **none adds a
  `docs/citation-staleness.md` row**; per §6.4 the only ongoing obligation is the
  routine citation re-verification for retraction/supersession in the standard
  README-stats / citation pass ([spec-v85](spec-v85.md) §6.3). No
  `scripts/check-citation-cadence.mjs` row is created by this spec.
- **Build (§6.1):** each tile is a `lib/neuro-v95.js` compute export + a
  `views/group-v21.js` renderer + an `app.js` `UTILITIES` row + a `lib/meta.js`
  `META` entry. `npm run build` pre-renders `/tools/<id>/index.html`
  (`MedicalCalculator`), regenerates the sitemap, topic/hub pages, and the
  service-worker shell precache, and rebuilds the SBOM (the changed-source
  serialNumber bump is expected — commit it). No build-script change is needed
  beyond the `UTILITIES` rows the builder already parses.
- **Merge gates (§6.2):** `eslint`, `grep-check.mjs` (catalog counts agree),
  `check-output-safety.mjs` (no raw `.toFixed()`/interpolation that can surface
  `NaN`), `check-citations.mjs`, `check-catalog-truth.mjs` (the **13 enforced
  catalog-count surfaces** all equal `UTILITIES.length`),
  `test/unit/fuzz-tools.test.js` with **`lib/neuro-v95.js` added to `MODULES`**
  (zero non-finite/undefined leaks across fuzzed selections), `a11y-check.mjs`
  (heading order, the real `<label for>` on every selector, contrast), Playwright
  `all-tools`/`smoke` (each route boots), Playwright **`example-correctness`
  (chromium-only, flake-prone under CPU load — CI `retries:2`, rerun isolated to
  confirm)** pinning each `META` worked example verbatim, and
  `mobile-no-hscroll` + `mobile-touch-targets` (320px no horizontal scroll, 44px
  targets). `data:verify` is unchanged — no `data/` is touched.

## 5. Files touched

```
docs/spec-v95.md                         (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v21 renderers into RENDERERS)
lib/neuro-v95.js                         (new module: mrs, gose, hoehnYahr, spetzlerMartin, houseBrackmann, midas)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to nihss, ich-score, four-score)
views/group-v21.js                       (new renderer module: 6 renderers — ordinal selectors for mrs/gose/hoehn-yahr/house-brackmann; component selectors + derivation for spetzler-martin; 5-question sum for midas)
docs/clinical-citations.md               (+6 rows for the six neurology outcome/grading sources)
test/unit/mrs.test.js                    (new; ≥3 boundary worked examples incl. the 2/3 good-outcome dichotomy edge)
test/unit/gose.test.js                   (new; ≥3 incl. the GOS-E↔legacy-GOS mapping both directions)
test/unit/hoehn-yahr.test.js             (new; ≥3 incl. original vs modified half-step stages)
test/unit/spetzler-martin.test.js        (new; ≥3 incl. a grade sum and a supplemented Lawton-Young total)
test/unit/house-brackmann.test.js        (new; ≥3 incl. grade I and grade VI descriptors)
test/unit/midas.test.js                  (new; ≥3 incl. the grade I/II/III/IV band edges and the clamp)
test/unit/fuzz-tools.test.js             (add lib/neuro-v95.js to MODULES)
docs/audits/v12/mrs.md, gose.md, hoehn-yahr.md, spetzler-martin.md, house-brackmann.md, midas.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 406 -> 412; append to the running ledger)
CHANGELOG.md                             (Unreleased: v95 entry, +6)
README.md, package.json                  (catalog count 406 -> 412; spec-progression line -> v95)
```

## 6. Acceptance criteria

v95 is fully shipped when:

- All 6 tiles in §2 are live in their stated group (`G`) with a `META[id]` entry,
  an inline primary citation + `citationUrl` + `accessed`, **≥3 boundary worked
  examples** in the unit test (including the band-flip / mapping edges), a
  [spec-v11](spec-v11.md) audit log in [`docs/audits/v12/`](audits/v12), and a
  passing [spec-v29](spec-v29.md) §3 scope check.
- The boundary examples include, at minimum: the **`mrs` 2 → 3 good-outcome
  dichotomy** flip (grade 2 = "good outcome (0–2)", grade 3 = "poor outcome
  (3–6)"); the **`gose` ↔ legacy-GOS mapping** (e.g. GOS-E 3 and 4 both → GOS 3
  severe disability; GOS-E 7 and 8 → GOS 5 good recovery); a **`spetzler-martin`
  grade sum** (e.g. >6 cm + eloquent + deep = grade V; <3 cm + non-eloquent +
  superficial = grade I) with its supplemented Lawton-Young total; and the
  **`midas` grade edges** (sum 5 → grade I, 6 → grade II, 10 → II, 11 → III,
  20 → III, 21 → grade IV).
- `mrs`, `gose`, `hoehn-yahr`, and `house-brackmann` map any in-range selection to
  the correct descriptor and band, and return a surfaced `valid:false` fallback
  for an out-of-range / blank selection (never a blank or wrong band).
- `spetzler-martin` reports the core grade I–V and the supplemented
  Spetzler-Martin–Lawton-Young total with the component derivation; `midas` sums
  only the five disability questions, clamps the day-counts, and reports the
  ancillary items without scoring them.
- Every compute function is covered by the [spec-v59](spec-v59.md) fuzz harness
  (`lib/neuro-v95.js` in `MODULES`) with **zero non-finite / undefined leaks**.
- `UTILITIES.length` is **412** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) — the 13 enforced surfaces plus the grep-checked
  README/index/package strings — agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v95 with the **+6** catalog delta (406 → 412).

## 7. Out of scope for v95

- **No copyrighted or licensed instruments.** Consistent with
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md) and [spec-v85](spec-v85.md) §9,
  v95 ships only free-to-use instruments. The **UPDRS** (Unified Parkinson's
  Disease Rating Scale) is freely available but is a **large, multi-part
  examination instrument**, not a single-input ordinal stage — it is **deferred**
  (Hoehn-Yahr is the staged companion shipped here). The mRS, GOS-E,
  Hoehn-Yahr, Spetzler-Martin, House-Brackmann, and MIDAS instruments are all
  public-domain or free-to-use; this spec ships no instrument requiring a license.
- **No imaging-derived inputs.** **ASPECTS** (the early-ischemia CT score) is a
  **radiologic read**, not a numeric input a clinician types — it is **deferred**;
  v95 ships scales whose inputs are clinician-stated grades, counts, and selectors,
  consistent with the [spec-v85](spec-v85.md) §2 input-driven doctrine.
- **No auto-prognostication beyond the source's stated bands.** The tiles report
  the scale's grade and the source's own per-band descriptor. They do not predict
  survival, recovery trajectory, surgical outcome, or treatment response beyond the
  cited band, and they do not adjudicate the case
  ([spec-v11](spec-v11.md) §5.3) — the outcome interpretation and any decision stay
  with the clinician and local protocol.
```