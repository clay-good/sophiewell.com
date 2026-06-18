# spec-v111.md — Environmental & wilderness medicine: Lake Louise AMS, Szpilman drowning, snakebite severity, and Cauchy frostbite (+4 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **closing spec of Wave 2 — Emergency / trauma /
> toxicology / environmental** ([spec-v106](spec-v106.md)–[spec-v111](spec-v111.md)).
> Adds **4** deterministic environmental and wilderness-medicine classification
> scores that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v111 close: **484 + 4 = 488 tiles** — the Wave-2 end state
> (458 → 488, +30).
>
> Every prior spec (v4 through v110) remains in force. v111 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine verbatim) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog carries the hypothermia-rewarming tool (`hypothermia-rewarm`), but four
standard environmental/wilderness instruments are absent, each the reference
severity grading for its exposure:

- **No Lake Louise AMS score.** The 2018 four-symptom acute-mountain-sickness
  score (with the headache-required diagnostic rule) is reachable nowhere.
- **No Szpilman drowning classification.** The cough/auscultation/edema/
  hypotension/arrest → six-grade drowning-severity classification that drives
  disposition is missing.
- **No snakebite severity score.** The six-system SSS (0–20) for crotalid
  envenomation is absent.
- **No Cauchy frostbite classification.** The day-0 topography + bone-scan
  four-grade frostbite classification that predicts amputation level is missing.

Each consumes clinician-entered findings and computes a grade/score with the
source's interpretation; v111 brings them onto the page and closes Wave 2.

## 2. What v111 adds (4 tiles)

### 2.1 `lake-louise-ams` — 2018 Lake Louise Acute Mountain Sickness score

- **Citation:** Roach RC, Hackett PH, Oelz O, et al; Lake Louise AMS Score
  Consensus Committee. The 2018 Lake Louise Acute Mountain Sickness Score. *High
  Alt Med Biol.* 2018;19(1):4-6.
- **citationUrl:** https://doi.org/10.1089/ham.2017.0164
- **Group:** EMS & Field (`I`), cross-linked from Clinical Scoring (`G`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `ems`,
  `paramedicine`.
- **Inputs:** the four self-reported symptoms each scored 0–3 — headache,
  gastrointestinal symptoms, fatigue/weakness, and dizziness/lightheadedness.
- **Output:** the **total (0–12)** with the diagnostic rule (**AMS present if
  total ≥ 3 in the presence of a headache**) and the published severity bands
  (mild 3–5, moderate 6–9, severe 10–12), naming the band and whether the
  headache-required rule was met. Class A (the 2018 consensus is cited by journal
  + authors as a fixed scoring instrument). 

### 2.2 `szpilman-drowning` — Szpilman drowning classification

- **Citation:** Szpilman D. Near-drowning and drowning classification: a
  proposal to stratify mortality based on the analysis of 1,831 cases. *Chest.*
  1997;112(3):660-665.
- **citationUrl:** https://doi.org/10.1378/chest.112.3.660
- **Group:** EMS & Field (`I`), cross-linked from Clinical Scoring (`G`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `ems`,
  `critical-care`.
- **Inputs:** the clinical findings walked as a decision tree — normal
  auscultation with cough vs abnormal auscultation (rales in some fields vs all
  fields / acute pulmonary edema) vs hypotension vs respiratory arrest vs
  cardiac arrest.
- **Output:** the **grade (1–6, including the dead/grade-6 and the rescued-no-
  symptom limbs)** with the published grade-specific mortality framing and
  disposition note, naming the grade. Class B (the classification is a revisable
  decision tree → `docs/citation-staleness.md` row, on-publication cadence).

### 2.3 `snakebite-severity` — Snakebite Severity Score (SSS)

- **Citation:** Dart RC, Hurlbut KM, Garcia R, Boren J. Validation of a severity
  score for the assessment of crotalid snakebite. *Ann Emerg Med.*
  1996;27(3):321-326.
- **citationUrl:** https://doi.org/10.1016/s0196-0644(96)70267-6
- **Group:** EMS & Field (`I`), cross-linked from Clinical Scoring (`G`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `toxicology`,
  `poison-control`.
- **Inputs:** the six body-system subscores, each 0–3/0–4 per the SSS —
  pulmonary, cardiovascular, local wound, gastrointestinal, hematologic, and CNS.
- **Output:** the **total (0–20)** with the published severity framing (minimal /
  moderate / severe by ascending total), naming the subscores. Class A.

### 2.4 `cauchy-frostbite` — Cauchy frostbite classification

- **Citation:** Cauchy E, Chetaille E, Marchand V, Marsigny B. Retrospective
  study of 70 cases of severe frostbite lesions: a proposed new classification
  scheme. *Wilderness Environ Med.* 2001;12(4):248-255.
- **citationUrl:** https://doi.org/10.1580/1080-6032(2001)012[0248:rsocos]2.0.co;2
- **Group:** EMS & Field (`I`), cross-linked from Clinical Scoring (`G`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `surgery`.
- **Inputs:** the day-0 lesion topography (extent of the cyanotic/affected area:
  distal phalanx / beyond phalanx to metacarpal / carpal-tarsal / forearm-leg) and
  the day-2 bone-scan uptake and bullae findings, walked as the published grade
  rule.
- **Output:** the **grade (1–4)** with the published amputation-risk and
  sequelae framing for that grade, naming the topography and bone-scan findings
  that set it. Class A.

## 3. Per-tile robustness

- **`lake-louise-ams` carries the headache-required diagnostic rule** as an
  explicit gate: a total ≥ 3 *without* a headache does not satisfy the AMS
  diagnosis, and the compute renders that the gate was/was not met rather than
  banding on the bare total. Each symptom is clamped to 0–3.
- **`szpilman-drowning` and `cauchy-frostbite` are decision trees, not tables.**
  Each consumes clinician-entered findings, walks the published limbs, and returns
  a single grade with the findings that set it (the [spec-v100](spec-v100.md) §2
  classification-tile clause); neither is a browsable atlas.
- **`snakebite-severity` is bounded subscore summation** — each of the six systems
  is clamped to its published maximum and the total to 0–20; the compute names the
  per-system contributions.
- All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, and
  quote the source's interpretation; none authors a descent, antivenom, debridement,
  or amputation order in Sophie's voice ([spec-v11](spec-v11.md) §5.3) — the field
  posture note states these scores inform triage and transport, not definitive
  management.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `lake-louise-ams`, `snakebite-severity`, and
  `cauchy-frostbite` are **Class A** (fixed scoring instruments cited by journal +
  authors → no staleness row). `szpilman-drowning` is **Class B** — the
  classification is a revisable decision tree, so it gets a
  `docs/citation-staleness.md` row naming the edition in force (Szpilman 1997,
  Chest), the `accessed` date, and an on-publication review cadence, monitored by
  the `scripts/check-citation-cadence.mjs` warn-job.
- **Module & gates (§6.2):** the compute module is **`lib/enviro-v111.js`**
  (exports `lakeLouiseAms`, `szpilmanDrowning`, `snakebiteSeverity`,
  `cauchyFrostbite`), added to the `test/unit/fuzz-tools.test.js` `MODULES` list
  (zero non-finite leaks). The renderer module is **`views/group-v36.js`** (the
  last Wave-2 renderer module); its `RV36` export is added to the `app.js`
  `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v36.js`.
- **Wave-2-close note:** with v111 the [spec-v100](spec-v100.md) program Wave 2 is
  complete at **488** tiles (458 → 488, +30). `scope-mdcalc-parity.md` records the
  Wave-2 progress in the running ledger; the program continues with Wave 3
  ([spec-v112](spec-v112.md)+).

## 5. Files touched

```
docs/spec-v111.md                        (this file)
app.js                                   (+4 UTILITIES rows, group I; import group-v36 renderers (RV36) into RENDERERS)
lib/enviro-v111.js                       (new module: lakeLouiseAms, szpilmanDrowning, snakebiteSeverity, cauchyFrostbite)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to hypothermia-rewarm)
views/group-v36.js                       (new renderer module: 4 renderers)
docs/citation-staleness.md               (+ row: szpilman-drowning Szpilman 1997)
docs/clinical-citations.md               (+4 rows for the four sources)
test/unit/lake-louise-ams.test.js, szpilman-drowning.test.js, snakebite-severity.test.js, cauchy-frostbite.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/enviro-v111.js to MODULES)
docs/audits/v12/lake-louise-ams.md, szpilman-drowning.md, snakebite-severity.md, cauchy-frostbite.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 484 -> 488; record Wave 2 complete 458 -> 488, +30)
CHANGELOG.md                             (Unreleased: v111 entry, +4; Wave-2-complete note)
README.md, package.json                  (catalog count 484 -> 488; spec-progression line -> v111)
```

## 6. Acceptance criteria

v111 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed
  all four ids are absent (`lake-louise-ams`, `szpilman-drowning`,
  `snakebite-severity`, `cauchy-frostbite`).
- All 4 tiles in §2 are live in Group I with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each including
  a **band-flip per tile** (Lake Louise: total ≥ 3 with vs without a headache
  flipping AMS-present→absent; Szpilman: abnormal-auscultation finding moving the
  grade up; snakebite: total crossing into the severe band; Cauchy: a bone-scan
  finding upgrading the grade), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `lake-louise-ams` enforces the headache-required gate; `szpilman-drowning` and
  `cauchy-frostbite` walk their decision trees and return a single grade;
  `snakebite-severity` clamps subscores and total; partial inputs render a
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `szpilman-drowning` carries `accessed` + a `docs/citation-staleness.md` row; the
  other three carry no row (Class A instruments).
- `UTILITIES.length` is **488** (or the then-current live count + 4 if specs land
  out of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree;
  `scope-mdcalc-parity.md` records Wave 2 complete (458 → 488, +30).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v111 with the +4 catalog delta and the Wave-2-complete
  note.

## 7. Out of scope for v111

- **No envenomation species identification** — `snakebite-severity` takes the
  clinician's per-system findings; it does not identify the snake or recommend a
  specific antivenom.
- **No descent, antivenom, rewarming, debridement, or amputation order** — each
  tile reports the grade/score and the source's interpretation; the field-
  triage, transport, and definitive-management decisions stay with the clinician
  and local protocol.
- **No environmental-exposure modeling** — the tiles take observed findings (AMS
  symptoms, drowning signs, bone-scan results); they do not model altitude,
  submersion time, or cold-exposure kinetics.
