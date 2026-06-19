# spec-v118.md — Hemorrhagic stroke, SAH, IVH & aneurysm: modified Fisher, modified Graeb, BAT, PHASES, and ELAPSS (+5 tiles)

> Status: **SHIPPED (2026-06-19).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Shipped as catalog **512 → 517** (the live count at implementation; the 513/518
> figures below reflect the spec-draft estimate, which ran one ahead of the
> running catalog count — the program's known off-by-one). `graeb-ivh` ships with
> the **+1 expansion bonus as an independent additive modifier on each of the
> eight compartments** (max 32; a naive fill-only reading sums to 24); `elapss`
> ships with **no earlier SAH = +1** (the inverted source term).
> Adds **5** deterministic hemorrhagic-stroke, subarachnoid-hemorrhage, intraventricular-
> hemorrhage, and unruptured-aneurysm instruments that fill confirmed gaps. None
> duplicates a live tile.
>
> Catalog effect at v118 close: **513 + 5 = 518 tiles.**
>
> Every prior spec (v4 through v117) remains in force. v118 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

v117 covered ischemic-stroke imaging prognosis; v118 covers the hemorrhagic side the
neuro-ICU and neurosurgery teams grade. Five standard instruments are absent:

- **`modified-fisher`** — the cisternal-blood/IVH grading that predicts symptomatic
  vasospasm after aneurysmal SAH; the existing `hunt-hess-wfns` grades the clinical
  picture but no tile grades the radiographic blood burden.
- **`graeb-ivh`** — the modified Graeb score quantifying intraventricular-hemorrhage
  burden across the ventricles and horns.
- **`bat-score`** — the NCCT BAT score predicting hematoma expansion in ICH.
- **`phases`** — the 5-year rupture-risk score for an unruptured intracranial aneurysm.
- **`elapss`** — the unruptured-aneurysm growth-risk score (3- and 5-year).

Each is a published, deterministic instrument a neurosurgery/neurocritical-care
clinician already uses; v118 brings them onto the page.

## 2. What v118 adds (5 tiles)

### 2.1 `modified-fisher` — Modified Fisher Scale

- **Citation:** Frontera JA, Claassen J, Schmidt JM, et al. Prediction of symptomatic
  vasospasm after subarachnoid hemorrhage: the modified Fisher scale. *Neurosurgery.*
  2006;59(1):21-27.
- **citationUrl:** https://doi.org/10.1227/01.NEU.0000218821.34014.1B
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurocritical-care`, `stroke`, `nursing-neuro`.
- **Inputs:** the clinician's read of cisternal SAH thickness (thin vs thick) and the
  presence of intraventricular hemorrhage.
- **Output:** the **modified Fisher grade (0–4)** with the source's banded symptomatic-
  vasospasm risk for each grade. Class A (fixed grading rule; citation names the journal
  + authors, not an issuing society). Cross-links `hunt-hess-wfns`.

### 2.2 `graeb-ivh` — Modified Graeb Score

- **Citation:** Morgan TC, Dawson J, Spengler D, et al. The Modified Graeb Score: an
  enhanced tool for intraventricular hemorrhage measurement and prediction of functional
  outcome. *Stroke.* 2013;44(3):635-641.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.112.670653
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurocritical-care`, `stroke`, `nursing-neuro`.
- **Inputs:** the IVH burden by compartment — each lateral ventricle (body, frontal/
  occipital/temporal horns), the third and fourth ventricles — graded by the clinician's
  read with the published expansion/casting modifiers.
- **Output:** the **modified Graeb total (0–32)** with the source's outcome framing.
  Class A (fixed per-compartment point weights). Cross-links `modified-fisher`,
  `ich-volume-abc2`.

### 2.3 `bat-score` — BAT Score

- **Citation:** Morotti A, Dowlatshahi D, Boulouis G, et al. Predicting intracerebral
  hemorrhage expansion with noncontrast computed tomography: the BAT score. *Stroke.*
  2018;49(5):1163-1169.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.117.020138
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurocritical-care`, `stroke`, `emergency-medicine`.
- **Inputs:** the NCCT markers — blend sign, any hypodensity, and time from onset to
  baseline NCCT (< 2.5 h band).
- **Output:** the **BAT total (0–5)** with the source's banded hematoma-expansion
  probability. Class A (fixed point weights). Cross-links `ich-volume-abc2`.

### 2.4 `phases` — PHASES Score

- **Citation:** Greving JP, Wermer MJH, Brown RD Jr, et al. Development of the PHASES
  score for prediction of risk of rupture of intracranial aneurysms: a pooled analysis
  of six prospective cohort studies. *Lancet Neurol.* 2014;13(1):59-66.
- **citationUrl:** https://doi.org/10.1016/S1474-4422(13)70263-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurology`, `internal-medicine`, `neurocritical-care`.
- **Inputs:** Population (region), Hypertension, Age, Size of aneurysm band, Earlier SAH
  from another aneurysm, and Site of aneurysm.
- **Output:** the **PHASES total** with the source's banded 5-year cumulative rupture
  risk. Class A (fixed point weights). Cross-links `elapss`.

### 2.5 `elapss` — ELAPSS Score

- **Citation:** Backes D, Rinkel GJE, Greving JP, et al. ELAPSS score for prediction of
  risk of growth of unruptured intracranial aneurysms. *Neurology.* 2017;88(17):1600-1606.
- **citationUrl:** https://doi.org/10.1212/WNL.0000000000003865
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `neurology`, `internal-medicine`, `neurocritical-care`.
- **Inputs:** Earlier SAH, aneurysm Location, Age band, Population (region), aneurysm
  Size band, and Shape (regular vs irregular).
- **Output:** the **ELAPSS total** with the source's banded 3- and 5-year aneurysm
  growth risk. Class A (fixed point weights). Cross-links `phases`.

## 3. Per-tile robustness

- **All five are bounded point-sum models.** Each is a fixed additive integer score
  (no logistic at render time) re-fetched verbatim from its derivation paper (per the
  v97 "re-fetch, never recall coefficients" lesson); the band lookup is a deterministic
  table and the total is clamped to its published range (`modified-fisher` 0–4,
  `graeb-ivh` 0–32, `bat-score` 0–5, `phases`/`elapss` to their published maxima).
- **`graeb-ivh` sums per-compartment grades** with the published expansion/casting
  modifiers; each compartment input is clamped to its allowed grade so the total cannot
  exceed 32. A partially-graded scan reports which compartments were scored.
- All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed grading rules / point
  weights; each citation names the journal + authors, not an issuing society, so none
  trips the `ISSUER_PATTERN` gotcha) — **no** `docs/citation-staleness.md` row.
- **Build (§6.1):** the compute lives in new `lib/neuro-v118.js`; the renderer is new
  `views/group-v118.js` whose `RV118` export is added to the `app.js` `RENDERERS`
  spread; five `UTILITIES` rows (all group G) and five `META` entries (inline citation +
  `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v118.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v118.js`.

## 5. Files touched

```
docs/spec-v118.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v118 renderers into RENDERERS as RV118)
lib/neuro-v118.js                        (new module: modifiedFisher, graebIvh, batScore, phases, elapss)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to hunt-hess-wfns, ich-volume-abc2)
views/group-v118.js                      (new renderer module: 5 renderers; incl. the per-compartment Graeb input)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/modified-fisher.test.js, graeb-ivh.test.js, bat-score.test.js, phases.test.js, elapss.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v118.js to MODULES)
docs/audits/v12/modified-fisher.md, graeb-ivh.md, bat-score.md, phases.md, elapss.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 513 -> 518; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v118 entry, +5)
README.md, package.json                  (catalog count 513 -> 518; spec-progression line -> v118)
```

## 6. Acceptance criteria

v118 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent from the live catalog and from each other.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  `modified-fisher` grade-3/4 vasospasm-band case, a `graeb-ivh` 0→high total, a
  `bat-score` low-vs-high expansion band-flip, and a `phases`/`elapss` rupture/growth
  band-flip), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Each score clamps to its published range and partial inputs render a complete-the-
  fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- All five are **Class A** — no `docs/citation-staleness.md` row (confirm no
  `ISSUER_PATTERN` trip in any citation).
- `UTILITIES.length` is **518** (or the then-current live count + 5 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v118 with the +5 catalog delta.

## 7. Out of scope for v118

- **No NCCT or CTA image analysis.** `modified-fisher`, `graeb-ivh`, and `bat-score`
  each take the clinician's imaging *read* (blood thickness, compartment grades, NCCT
  markers) as input; v118 parses no DICOM and no radiology report.
- **No `hunt-hess-wfns` or `ich-score` re-implementation** — the existing clinical-grading
  tiles stand; `modified-fisher` cross-links `hunt-hess-wfns` as the clinical companion.
- **No auto-treatment, auto-coiling, or auto-clipping decision** — each tile reports the
  grade/score and the source's stated risk framing; the management decision stays with
  the neurosurgery/neurocritical-care team and local protocol
  ([spec-v11](spec-v11.md) §5.3).
