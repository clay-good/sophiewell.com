# spec-v146.md — Spinal tumor & trauma classification: SINS, Revised Tokuhashi, Tomita, TLICS, and SLIC (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **5**
> deterministic spinal tumor and trauma classification instruments that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v146 close: **659 + 5 = 664 tiles** (or live count + 5 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v145) remains in force. v146 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the brain/cerebrovascular neurosurgical scores (`ich-score`,
`hunt-hess-wfns`, `nihss`) but **no spinal instability, spinal-metastasis, or
spinal-trauma scoring tiles**. The five standard spine instruments below are
absent: SINS (oncologic instability), the Revised Tokuhashi and Tomita prognostic/
strategy scores (metastatic disease), and the TLICS and SLIC trauma-triage scores.
Each is a weighted sum that consumes the clinician's findings and computes a
score + the source's management interpretation (per the [spec-v100](spec-v100.md)
§2 clarification), and each cross-links the neurosurgery/oncology cluster.

- **SINS** — the Spinal Instability Neoplastic Score, six components (location,
  pain, bone lesion, alignment, vertebral-body collapse, posterolateral
  involvement) summing 0–18, with stable / indeterminate / unstable bands.
- **Revised Tokuhashi** — the spinal-metastasis prognostic score (0–15) from
  general condition, extraspinal/vertebral metastases, organ metastases, primary
  site, and palsy → expected-survival bands guiding surgical aggressiveness.
- **Tomita** — the surgical-strategy score (2–10) from primary-tumor grade,
  visceral metastases, and bone metastases.
- **TLICS** — the Thoracolumbar Injury Classification and Severity score (morphology
  + neurology + posterior-ligamentous-complex integrity) → operative-vs-nonoperative
  triage.
- **SLIC** — the Subaxial Cervical Spine Injury Classification (morphology +
  discoligamentous complex + neurology) → the parallel C3–C7 triage.

## 2. What v146 adds (5 tiles)

### 2.1 `sins-score` — Spinal Instability Neoplastic Score (SINS)

- **Citation:** Fisher CG, DiPaola CP, Ryken TC, et al. A novel classification
  system for spinal instability in neoplastic disease: an evidence-based approach
  and expert consensus from the Spine Oncology Study Group. *Spine.*
  2010;35(22):E1221-E1229.
- **citationUrl:** https://doi.org/10.1097/BRS.0b013e3181e16ae2
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `orthopedics`, `oncology`.
- **Inputs:** the 6 components — spinal location (junctional/mobile/semirigid/
  rigid), mechanical pain, bone-lesion quality (lytic/mixed/blastic), radiographic
  alignment, vertebral-body collapse extent, and posterolateral element involvement.
- **Output:** the **total (0–18)** with the published bands — **0–6 stable, 7–12
  indeterminate (possibly impending), 13–18 unstable** — naming the component
  scores. Class A.

### 2.2 `tokuhashi-revised` — Revised Tokuhashi Score

- **Citation:** Tokuhashi Y, Matsuzaki H, Oda H, Oshima M, Ryu J. A revised scoring
  system for preoperative evaluation of metastatic spine tumor prognosis. *Spine.*
  2005;30(19):2186-2191.
- **citationUrl:** https://doi.org/10.1097/01.brs.0000180401.06919.a5
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `oncology`, `orthopedics`.
- **Inputs:** the 6 parameters, each 0–2 (primary site 0–5) — general condition
  (Karnofsky), number of extraspinal bone metastases, number of metastases in the
  vertebral body, metastases to major internal organs, primary-tumor site, and
  spinal-cord palsy (Frankel).
- **Output:** the **total (0–15)** with the published expected-survival bands
  (0–8 < 6 months, 9–11 ≥ 6 months, 12–15 ≥ 1 year) and the source's surgical-
  strategy interpretation. Class A.

### 2.3 `tomita-score` — Tomita Surgical Strategy Score

- **Citation:** Tomita K, Kawahara N, Kobayashi T, Yoshida A, Murakami H, Akamaru
  T. Surgical strategy for spinal metastases. *Spine.* 2001;26(3):298-306.
- **citationUrl:** https://doi.org/10.1097/00007632-200102010-00016
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `oncology`, `orthopedics`.
- **Inputs:** the 3 prognostic factors — primary-tumor grade (slow/moderate/rapid
  growth, 1/2/4), visceral metastases (none/treatable/untreatable, 0/2/4), and bone
  metastases (solitary/multiple, 1/2).
- **Output:** the **total (2–10)** with the published surgical-strategy bands (wide/
  marginal excision → palliative/terminal care) and goal interpretation. Class A.

### 2.4 `tlics-score` — Thoracolumbar Injury Classification and Severity (TLICS)

- **Citation:** Vaccaro AR, Lehman RA Jr, Hurlbert RJ, et al. A new classification
  of thoracolumbar injuries: the importance of injury morphology, the integrity of
  the posterior ligamentous complex, and neurologic status. *Spine.*
  2005;30(20):2325-2333.
- **citationUrl:** https://doi.org/10.1097/01.brs.0000182986.43345.cb
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `orthopedics`, `emergency-medicine`.
- **Inputs:** injury morphology (compression/burst/translation-rotation/
  distraction), neurologic status (intact/root/complete cord/incomplete cord/cauda
  equina), and posterior-ligamentous-complex integrity (intact/suspected/injured).
- **Output:** the **total (0–10)** with the published triage — **≤ 3 nonoperative,
  4 indeterminate (surgeon's discretion), ≥ 5 operative** — naming the component
  scores. Class A.

### 2.5 `slic-score` — Subaxial Cervical Spine Injury Classification (SLIC)

- **Citation:** Vaccaro AR, Hulbert RJ, Patel AA, et al. The subaxial cervical
  spine injury classification system: a novel approach to recognize the importance
  of morphology, neurology, and integrity of the disco-ligamentous complex. *Spine.*
  2007;32(21):2365-2374.
- **citationUrl:** https://doi.org/10.1097/BRS.0b013e3181557b92
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `orthopedics`, `emergency-medicine`.
- **Inputs:** injury morphology (no abnormality/compression/burst/distraction/
  rotation-translation), disco-ligamentous-complex integrity (intact/indeterminate/
  disrupted), and neurologic status (intact/root/complete/incomplete/continuous cord
  compression with deficit).
- **Output:** the **total (0–10)** with the published triage — **≤ 3 nonoperative,
  4 indeterminate, ≥ 5 operative** — naming the component scores. Class A. Near-
  neighbor: `tlics-score` (the thoracolumbar parallel) — cross-linked.

## 3. Per-tile robustness

- **All five are bounded weighted sums** consuming the clinician's findings as
  bounded selects ([spec-v100](spec-v100.md) §2 classification clarification): they
  compute a score and render the source's band/management interpretation; they are
  not reference tables. Each names which component scores were counted and flows
  through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- **Band-boundary logic is unit-tested at each cutoff** (SINS 6/7 and 12/13;
  Tokuhashi 8/9 and 11/12; TLICS and SLIC 3/4/5), so a value on a boundary lands in
  exactly the published band.
- A blank required component renders a complete-the-fields fallback rather than
  scoring a partial total as if the missing component were zero; the renderer states
  how many components are still needed.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note (the tile
  takes the clinician's read of the imaging and exam) and quote the source's
  interpretation; none authors an operative/radiation recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published
  classifications, each cited by journal + authors (not an issuing society), so none
  trips the `ISSUER_PATTERN` and **none needs a `docs/citation-staleness.md` row**.
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/spine-v146.js` module (`sinsScore`, `tokuhashiRevised`, `tomitaScore`,
  `tlicsScore`, `slicScore`), added to the `test/unit/fuzz-tools.test.js` `MODULES`
  list (zero non-finite leaks; every band boundary covered). Renderers live in the
  new `views/group-v146.js` module; its `RV146` export is spread into the `app.js`
  `RENDERERS` map. The catalog count moves on all **13 catalog-truth surfaces** in
  the same change; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass for `views/group-v146.js`.

## 5. Files touched

```
docs/spec-v146.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v146 RV146 into RENDERERS)
lib/spine-v146.js                        (new module: sinsScore, tokuhashiRevised, tomitaScore, tlicsScore, slicScore)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to ich-score, nihss, the v144/v145 ortho cluster)
views/group-v146.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/sins-score.test.js, tokuhashi-revised.test.js, tomita-score.test.js, tlics-score.test.js, slic-score.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/spine-v146.js to MODULES)
docs/audits/v12/sins-score.md, tokuhashi-revised.md, tomita-score.md, tlics-score.md, slic-score.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 659 -> 664; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v146 entry, +5)
README.md, package.json                  (catalog count 659 -> 664; spec-progression line -> v146)
```

## 6. Acceptance criteria

v146 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a **SINS 6→7 stable→indeterminate flip**, a Tokuhashi **8→9 survival-
  band change**, a **TLICS 4→5 indeterminate→operative flip**, and a SLIC 3→4
  case), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every band boundary lands in exactly the published band; blank components render a
  complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **664** (or live count + 5) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v146 with the +5 catalog delta.

## 7. Out of scope for v146

- **No imaging parsing** — each tile takes the clinician's read of the CT/MRI/
  radiograph and the neurologic exam as bounded inputs; it does not ingest or
  interpret an image.
- **No automatic operate/radiate/brace order** — each tile reports the score and the
  source's management-relevant interpretation; the decision stays with the clinician
  and a multidisciplinary spine/oncology team ([spec-v11](spec-v11.md) §5.3).
- **No browsable classification index** — per the [spec-v100](spec-v100.md) §2
  clarification, every tile consumes inputs and computes a score/class.
