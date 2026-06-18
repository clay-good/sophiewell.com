# spec-v119.md — Prehospital LVO severity & cerebrovascular diagnosis: C-STAT/CPSSS, FAST-ED, Boston Criteria v2.0, and CVT outcome (+4 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Adds **4** deterministic prehospital large-vessel-occlusion triage and cerebrovascular-
> diagnosis instruments that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v119 close: **518 + 4 = 522 tiles.**
>
> Every prior spec (v4 through v118) remains in force. v119 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the in-hospital stroke scales but not the field LVO-triage tools the
EMS crew and ED runs, nor two cerebrovascular-diagnosis rules. Four standard
instruments are absent:

- **`cpsss`** — the Cincinnati Prehospital Stroke Severity Scale (C-STAT), a 0–4 field
  LVO-severity screen.
- **`fast-ed`** — the Field Assessment Stroke Triage for Emergency Destination, a 0–9
  NIHSS-derived field LVO-triage tool.
- **`boston-caa`** — the Boston Criteria v2.0 for cerebral amyloid angiopathy diagnostic
  certainty.
- **`cvt-risk`** — the cerebral-venous-thrombosis outcome risk score.

Each is a published, deterministic instrument an EMS/stroke/neurology clinician already
uses; v119 brings them onto the page.

## 2. What v119 adds (4 tiles)

### 2.1 `cpsss` — Cincinnati Prehospital Stroke Severity Scale (C-STAT)

- **Citation:** Katz BS, McMullan JT, Sucharew H, Adeoye O, Broderick JP. Design and
  validation of a prehospital scale to predict stroke severity: Cincinnati Prehospital
  Stroke Severity Scale. *Stroke.* 2015;46(6):1508-1512.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.115.008804
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `ems`, `paramedicine`, `stroke`, `emergency-medicine`.
- **Inputs:** conjugate gaze deviation, level-of-consciousness questions (age/month),
  and arm weakness — the three NIHSS-derived field items.
- **Output:** the **C-STAT total (0–4)** with the source's framing (a score ≥ 2 predicts
  a large-vessel occlusion). Class A (fixed point weights; citation names the journal +
  authors). Cross-links `nihss`, `fast-ed`.

### 2.2 `fast-ed` — Field Assessment Stroke Triage for Emergency Destination

- **Citation:** Lima FO, Silva GS, Furie KL, et al. Field Assessment Stroke Triage for
  Emergency Destination: a simple and accurate prehospital scale to detect large vessel
  occlusion strokes. *Stroke.* 2016;47(8):1997-2002.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.116.013301
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `ems`, `paramedicine`, `stroke`, `nursing-transport`.
- **Inputs:** facial palsy, arm weakness, speech changes, eye deviation, and denial/
  neglect — the five NIHSS-derived items with their published point bands.
- **Output:** the **FAST-ED total (0–9)** with the source's framing (a score ≥ 4
  predicts LVO and supports comprehensive-center triage). Class A (fixed point weights).
  Cross-links `cpsss`, `nihss`.

### 2.3 `boston-caa` — Boston Criteria v2.0 (cerebral amyloid angiopathy)

- **Citation:** Charidimou A, Boulouis G, Frosch MP, et al. The Boston criteria version
  2.0 for cerebral amyloid angiopathy: a multicentre, retrospective, MRI-neuropathology
  diagnostic accuracy study. *Lancet Neurol.* 2022;21(8):714-725.
- **citationUrl:** https://doi.org/10.1016/S1474-4422(22)00208-3
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `stroke`, `neurocritical-care`, `geriatrics`.
- **Inputs:** age ≥ 50, the clinician's read of hemorrhagic markers (lobar ICH /
  cerebral microbleeds / cortical superficial siderosis), the non-hemorrhagic
  white-matter feature (centrum semiovale perivascular spaces / white-matter
  hyperintensity multispot), and whether pathology is available.
- **Output:** the **diagnostic-certainty category** — definite / probable with supporting
  pathology / probable / possible CAA — per the v2.0 logic, naming the markers counted.
  Class B (the v2.0 criteria are a revisable consensus definition per the roster note) →
  `docs/citation-staleness.md` row, on-publication cadence. Cross-links `ich-volume-abc2`.

### 2.4 `cvt-risk` — Cerebral venous thrombosis outcome risk score

- **Citation:** Ferro JM, Bacelar-Nicolau H, Rodrigues T, et al. Risk score to predict
  the outcome of patients with cerebral vein and dural sinus thrombosis. *Cerebrovasc
  Dis.* 2009;28(1):39-44.
- **citationUrl:** https://doi.org/10.1159/000215942
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `stroke`, `neurocritical-care`, `internal-medicine`.
- **Inputs:** malignancy, coma, deep-CVT thrombosis, mental-status disturbance, male
  sex, and intracranial hemorrhage — the published risk-score items.
- **Output:** the **CVT risk total** with the source's banded probability of poor outcome
  (mRS > 2). Class A (fixed point weights). Cross-links `cha2ds2-va` context where
  thrombosis risk is computed.

## 3. Per-tile robustness

- **`cpsss`, `fast-ed`, and `cvt-risk` are bounded point-sum models.** Each is a fixed
  additive integer score re-fetched verbatim from its derivation paper (per the v97
  "re-fetch, never recall coefficients" lesson); the total is clamped to its published
  range (`cpsss` 0–4, `fast-ed` 0–9, `cvt-risk` to its published maximum) and the band
  lookup is a deterministic table.
- **`boston-caa` is criteria-classification logic** (definite/probable/possible),
  bounded and deterministic: the clinician's marker reads flow through fixed v2.0 rules
  with no arithmetic that can overflow; it names which markers were counted.
- All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `cpsss`, `fast-ed`, and `cvt-risk` are **Class A**
  (fixed point weights; each citation names the journal + authors, not an issuing
  society) — no staleness row. **`boston-caa` (Boston Criteria v2.0) is Class B** (a
  revisable consensus diagnostic definition per the roster) — it gets a
  `docs/citation-staleness.md` row naming the version in force (v2.0, 2022), the
  `accessed` date, and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Build (§6.1):** the compute lives in new `lib/neuro-v119.js`; the renderer is new
  `views/group-v119.js` whose `RV119` export is added to the `app.js` `RENDERERS`
  spread; four `UTILITIES` rows (all group G) and four `META` entries (inline citation +
  `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v119.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v119.js`.

## 5. Files touched

```
docs/spec-v119.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v119 renderers into RENDERERS as RV119)
lib/neuro-v119.js                        (new module: cpsss, fastEd, bostonCaa, cvtRisk)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to nihss, ich-volume-abc2)
views/group-v119.js                      (new renderer module: 4 renderers)
docs/citation-staleness.md               (+ row: boston-caa Boston Criteria v2.0)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/cpsss.test.js, fast-ed.test.js, boston-caa.test.js, cvt-risk.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v119.js to MODULES)
docs/audits/v12/cpsss.md, fast-ed.md, boston-caa.md, cvt-risk.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 518 -> 522; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v119 entry, +4)
README.md, package.json                  (catalog count 518 -> 522; spec-progression line -> v119)
```

## 6. Acceptance criteria

v119 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  four ids are absent from the live catalog and from each other.
- All 4 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  `cpsss` ≥2 LVO-flag band-flip, a `fast-ed` ≥4 triage band-flip, a `boston-caa`
  probable-vs-possible classification, and a `cvt-risk` low-vs-high outcome band-flip),
  a [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Each score clamps to its published range and partial inputs render a complete-the-
  fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `boston-caa` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **522** (or the then-current live count + 4 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v119 with the +4 catalog delta.

## 7. Out of scope for v119

- **No MRI/NCCT image analysis.** `boston-caa` takes the clinician's imaging *read*
  (microbleeds, siderosis, white-matter features) as input; `cpsss`/`fast-ed` take the
  field exam findings; v119 parses no DICOM and no radiology report.
- **No `nihss` re-implementation** — the existing severity scale stands; `cpsss` and
  `fast-ed` cross-link it as the in-hospital companion.
- **No auto-destination, auto-bypass, or auto-anticoagulation decision** — each tile
  reports the score/category and the source's stated framing; the triage/treatment
  decision stays with the EMS crew, stroke team, and local protocol
  ([spec-v11](spec-v11.md) §5.3).
