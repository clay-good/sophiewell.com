# spec-v117.md — Stroke imaging & thrombolysis prognosis: ASPECTS, ICH volume (ABC/2), DRAGON, HAT, SEDAN, and THRIVE (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 4 (Neurology / neurosurgery / psychiatry)**.
> Opens the wave with **6** deterministic acute-stroke imaging-prognosis and
> thrombolysis-risk instruments that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v117 close: **507 + 6 = 513 tiles.**
>
> Every prior spec (v4 through v116) remains in force. v117 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 doctrine) and the [spec-v100](spec-v100.md)
> §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the stroke *severity* and *disposition* tools (`nihss`, `abcd2`,
`ich-score`) but not the imaging-derived prognostic scores the stroke team computes
the moment the NCCT/CTA is read and tPA is on the table. Six standard instruments
are absent:

- **`aspects`** — the 10-point topographic NCCT score grading early MCA-territory
  ischemia; it gates reperfusion decisions and is reported nowhere on the page.
- **`ich-volume-abc2`** — the ABC/2 ellipsoid estimate of hematoma volume that
  `ich-score` *consumes* as an input but no tile *produces*.
- **`dragon-stroke`** — the post-IV-tPA 3-month functional-outcome score.
- **`hat-score`** — the Hemorrhage After Thrombolysis risk score.
- **`sedan-score`** — the symptomatic-ICH-after-thrombolysis risk score.
- **`thrive-stroke`** — the THRIVE post-ischemic-stroke outcome/mortality score.

Each is a published, deterministic instrument an acute-stroke clinician already uses
at the scanner; v117 brings them onto the page and opens Wave 4.

## 2. What v117 adds (6 tiles)

### 2.1 `aspects` — Alberta Stroke Program Early CT Score

- **Citation:** Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and reliability
  of a quantitative computed tomography score in predicting outcome of hyperacute
  stroke before thrombolytic therapy. *Lancet.* 2000;355(9216):1670-1674.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(00)02237-6
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `stroke`, `neurology`, `neurocritical-care`, `emergency-medicine`.
- **Inputs:** the clinician's read of the 10 MCA-territory regions (caudate, lentiform,
  internal capsule, insular ribbon, M1–M6) — each region with early ischemic change
  is checked.
- **Output:** the **ASPECTS (0–10)**, computed by **subtracting** one point per affected
  region from 10, with the reperfusion-relevant interpretation the source frames
  (lower scores predict worse outcome and higher hemorrhage risk). Class B (an
  imaging-read scoring convention applied across evolving reperfusion guidelines →
  `docs/citation-staleness.md` row, on-publication cadence). Cross-links `nihss`,
  `ich-score`.

### 2.2 `ich-volume-abc2` — Intracerebral hemorrhage volume (ABC/2)

- **Citation:** Kothari RU, Brott T, Broderick JP, et al. The ABCs of measuring
  intracerebral hemorrhage volumes. *Stroke.* 1996;27(8):1304-1305.
- **citationUrl:** https://doi.org/10.1161/01.STR.27.8.1304
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `stroke`, `neurosurgery`, `neurocritical-care`, `emergency-medicine`.
- **Inputs:** the three orthogonal NCCT hematoma diameters — A (greatest), B
  (perpendicular to A on the same slice), C (vertical extent: slices × slice thickness).
- **Output:** the **hematoma volume in mL** via the ellipsoid approximation
  **A × B × C / 2**. Class A (fixed geometric formula). **Near-neighbor:** `ich-score`
  (G) *consumes* the volume this tile *produces* (its ≥30 mL threshold) — cross-linked,
  both kept (different jobs).

### 2.3 `dragon-stroke` — DRAGON Score

- **Citation:** Strbian D, Meretoja A, Ahlhelm FJ, et al. Predicting outcome of
  IV thrombolysis-treated ischemic stroke patients: the DRAGON score. *Neurology.*
  2012;78(6):427-432.
- **citationUrl:** https://doi.org/10.1212/WNL.0b013e318245d2a9
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `stroke`, `neurology`, `emergency-medicine`, `nursing-neuro`.
- **Inputs:** hyperdense MCA / early infarct on baseline CT, prestroke mRS > 1, age
  band, glucose at baseline, onset-to-treatment time band, and baseline NIHSS band.
- **Output:** the **DRAGON total (0–10)** with the source's banded 3-month
  good-outcome (mRS 0–2) and miserable-outcome probabilities. Class A (fixed point
  weights). Cross-links `nihss`.

### 2.4 `hat-score` — Hemorrhage After Thrombolysis (HAT) Score

- **Citation:** Lou M, Safdar A, Mehdiratta M, et al. The HAT Score: a simple grading
  scale for predicting hemorrhage after thrombolysis. *Neurology.* 2008;71(18):1417-1423.
- **citationUrl:** https://doi.org/10.1212/01.wnl.0000330297.58334.dd
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `stroke`, `neurology`, `emergency-medicine`, `nursing-neuro`.
- **Inputs:** baseline NIHSS band, hypodensity on initial CT (none / ≤1/3 MCA / >1/3
  MCA), and a history of diabetes or admission glucose > 200 mg/dL.
- **Output:** the **HAT total (0–5)** with the source's banded risk of any/symptomatic
  ICH after tPA. Class A (fixed point weights). Cross-links `dragon-stroke`, `sedan-score`.

### 2.5 `sedan-score` — SEDAN Score

- **Citation:** Strbian D, Engelter S, Michel P, et al. Symptomatic intracranial
  hemorrhage after stroke thrombolysis: the SEDAN score. *Ann Neurol.*
  2012;71(5):634-641.
- **citationUrl:** https://doi.org/10.1002/ana.23546
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `stroke`, `neurology`, `emergency-medicine`, `neurocritical-care`.
- **Inputs:** baseline blood glucose band, early infarct signs on CT, hyperdense
  cerebral artery sign, age > 75, and baseline NIHSS band.
- **Output:** the **SEDAN total (0–6)** with the source's banded symptomatic-ICH
  probability. Class A (fixed point weights). Cross-links `hat-score`, `dragon-stroke`.

### 2.6 `thrive-stroke` — THRIVE Score

- **Citation:** Flint AC, Cullen SP, Faigeles BS, Rao VA. Predicting long-term outcome
  after endovascular stroke treatment: the totaled health risks in vascular events
  (THRIVE) score. *AJNR Am J Neuroradiol.* 2010;31(7):1192-1196.
- **citationUrl:** https://doi.org/10.3174/ajnr.A2050
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `stroke`, `neurology`, `neurocritical-care`, `internal-medicine`.
- **Inputs:** baseline NIHSS band, age band, and the chronic-disease count (hypertension,
  diabetes, atrial fibrillation).
- **Output:** the **THRIVE total (0–9)** with the source's banded good-outcome and
  mortality probabilities. Class A (fixed point weights). Cross-links `nihss`,
  `dragon-stroke`.

## 3. Per-tile robustness

- **`ich-volume-abc2` guards its geometry.** The compute is **A × B × C / 2** with each
  diameter range-guarded to be **non-negative** and finite; a blank or negative
  diameter renders a surfaced complete-the-fields fallback rather than a volume from
  `NaN`. C is accepted either as a measured vertical extent or as slices × thickness.
- **`aspects` subtracts from 10 and is bounded 0–10.** The region count is clamped to
  0–10 so the displayed score can never go negative or exceed 10; the affected regions
  are named back to the user.
- **`dragon-stroke`, `hat-score`, `sedan-score`, and `thrive-stroke` are bounded
  point-sum models.** Each is a fixed integer additive score (no logistic at render
  time) re-fetched verbatim from its derivation paper (per the v97 "re-fetch, never
  recall coefficients" lesson); the band lookup is a deterministic table and the total
  is clamped to its published 0–N range.
- All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks, render the [spec-v50](spec-v50.md) §3 clinical posture note, quote the source's
  interpretation, and author no treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each is mobile-first per [spec-v72](spec-v72.md)
  (44px targets, no 320px horizontal scroll).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `ich-volume-abc2`, `dragon-stroke`, `hat-score`,
  `sedan-score`, and `thrive-stroke` are **Class A** (fixed formula / point weights;
  the citations name journals + authors, not an issuing society, so they do not trip
  the `ISSUER_PATTERN` gotcha) — no staleness row. **`aspects` is Class B** (an
  imaging-read convention applied through evolving reperfusion guidelines per the
  roster) — it gets a `docs/citation-staleness.md` row naming the convention in force,
  the `accessed` date, and an on-publication review cadence, monitored by the
  `scripts/check-citation-cadence.mjs` warn-job.
- **Build (§6.1):** the compute lives in new `lib/neuro-v117.js`; the renderer is new
  `views/group-v117.js` whose `RV117` export is added to the `app.js` `RENDERERS`
  spread; six `UTILITIES` rows (5 group G, `ich-volume-abc2` group E) and six `META`
  entries (inline citation + `citationUrl` + `accessed`).
- **Gates (§6.2):** `lib/neuro-v117.js` is added to the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks; `ich-volume-abc2`'s division explicitly
  fuzzed); each `META` example is pinned by the chromium `example-correctness` sweep;
  the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v117.js`.

## 5. Files touched

```
docs/spec-v117.md                        (this file)
app.js                                   (+6 UTILITIES rows: 5 group G + ich-volume-abc2 group E; import group-v117 renderers into RENDERERS as RV117)
lib/neuro-v117.js                        (new module: aspects, ichVolumeAbc2, dragonStroke, hatScore, sedanScore, thriveStroke)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to nihss, ich-score, abcd2)
views/group-v117.js                      (new renderer module: 6 renderers; incl. the 3-diameter ABC/2 input and the 10-region ASPECTS checklist)
docs/citation-staleness.md               (+ row: aspects imaging-read convention)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/aspects.test.js, ich-volume-abc2.test.js, dragon-stroke.test.js, hat-score.test.js, sedan-score.test.js, thrive-stroke.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-v117.js to MODULES)
docs/audits/v12/aspects.md, ich-volume-abc2.md, dragon-stroke.md, hat-score.md, sedan-score.md, thrive-stroke.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 507 -> 513; running v100 program ledger)
CHANGELOG.md                             (Unreleased: v117 entry, +6; opens Wave 4)
README.md, package.json                  (catalog count 507 -> 513; spec-progression line -> v117)
```

## 6. Acceptance criteria

v117 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent from the live catalog and from each other.
- All 6 tiles in §2 are live with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an `aspects`
  10→band case, an ABC/2 volume crossing the `ich-score` ≥30 mL threshold as a
  band-flip, a `dragon-stroke` good-vs-miserable band-flip, and `hat-score`/`sedan-score`/
  `thrive-stroke` low-vs-high risk-band flips), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `ich-volume-abc2` guards its diameters (non-negative, finite) and its division;
  `aspects` clamps 0–10; partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `aspects` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **513** (or the then-current live count + 6 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v117 with the +6 catalog delta and the Wave-4 open note.

## 7. Out of scope for v117

- **No NCCT or CTA image analysis.** `aspects`, `ich-volume-abc2`, `dragon-stroke`,
  `hat-score`, and `sedan-score` each take the clinician's imaging *read* (regions
  affected, diameters measured, hyperdensity/hypodensity present) as input; v117 parses
  no DICOM, no pixels, and no radiology report.
- **No `ich-score` or `nihss` re-implementation** — the existing tiles stand;
  `ich-volume-abc2` cross-links `ich-score` as the volume source, and `nihss` is the
  severity input these scores band.
- **No auto-thrombolysis or auto-thrombectomy decision** — each tile reports the score/
  volume and the source's stated risk framing; the treat/transfer decision stays with
  the stroke team and local protocol ([spec-v11](spec-v11.md) §5.3).
