# spec-v155.md — Suite completions: PRECISE-DAPT, MIPI, Forrest, Wagner DFU, and University-of-Texas DFU (+5 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds up to **5**
> deterministic instruments, each plugging a named hole in an otherwise-complete
> suite. None duplicates a live tile. **PRECISE-DAPT carries an explicit
> sourcing caveat** (§2.1) and may be deferred under the
> [spec-v97](spec-v97.md) ≥2-source rule.
>
> Catalog effect at v155 close: **live count + (3 to 5)** depending on the
> PRECISE-DAPT sourcing outcome (catalog-truth gate enforces the actual delta).
>
> Every prior spec (v4 through v154) remains in force. v155 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Coefficients/point tables are re-fetched and
> cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Five suites in the catalog are complete except for one well-known member each:

- **Antiplatelet bleeding** — `dapt-score` predicts the *ischemic benefit* of
  continued DAPT; **PRECISE-DAPT** predicts the *bleeding harm* and is the
  companion the guidelines pair it with.
- **Lymphoma prognosis** — the catalog has the diffuse-large-B-cell and follicular
  indices (`nccn-ipi`, `r-ipi`, `flipi`) but **no mantle-cell index (MIPI)**.
- **Upper-GI bleeding** — `gbs`, `rockall`, `aims65`, `oakland` cover risk; the
  **Forrest** endoscopic-stigmata classification (the rebleed-risk anchor) is
  absent.
- **Diabetic foot** — `wifi` grades limb threat, but the **Wagner** and
  **University-of-Texas** ulcer-grading systems (the wound-care standards) are
  absent.

## 2. What v155 adds (up to 5 tiles)

### 2.1 `precise-dapt` — PRECISE-DAPT Bleeding Score *(sourcing-gated)*

- **Citation:** Costa F, van Klaveren D, James S, et al. Derivation and validation
  of the predicting bleeding complications in patients undergoing stent
  implantation and subsequent dual antiplatelet therapy (PRECISE-DAPT) score.
  *Lancet.* 2017;389(10073):1025-1034.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(17)30397-5 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `pharmacy`.
- **Inputs:** age, creatinine clearance, hemoglobin, white-cell count, and prior
  spontaneous bleeding.
- **Output:** the **0–100 point total** with the **≥25 → high bleeding risk**
  (favor shorter DAPT) threshold. Class A.
- **⚠ Sourcing caveat ([spec-v97](spec-v97.md)):** the published PRECISE-DAPT score
  is a **continuous nomogram** (spline-based per-variable points), **not** a simple
  banded sum. Implementation **must** reproduce the per-variable point assignment
  from a primary source cross-verified to ≥2 independent reproductions. If the
  point function cannot be cross-verified verbatim, **defer** this tile (as
  `crib-ii`/`gail-bcrat` were parked) and ship the remaining four — do **not**
  approximate the nomogram.

### 2.2 `mipi` — Mantle Cell Lymphoma International Prognostic Index (MIPI)

- **Citation:** Hoster E, Dreyling M, Klapper W, et al. A new prognostic index
  (MIPI) for patients with advanced-stage mantle cell lymphoma. *Blood.*
  2008;111(2):558-565.
- **citationUrl:** https://doi.org/10.1182/blood-2007-06-095331 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** age (yr), ECOG performance status (0–1 vs 2–4), serum LDH (with the
  lab upper limit of normal), and white-cell count.
- **Output:** the **MIPI index** = `0.03535·age + 0.6978·(ECOG≥2) + 1.367·log10(LDH/ULN)
  + 0.9393·log10(WBC)` with bands **low <5.7, intermediate 5.7–<6.2, high ≥6.2**;
  the LDH/ULN ratio and WBC log term are surfaced. Class A. Coefficients
  re-verified to ≥2 sources (the simplified-MIPI point form is a distinct variant —
  ship the biologic continuous index, note the simplified table).

### 2.3 `forrest` — Forrest Classification (UGI bleeding stigmata)

- **Citation:** Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in
  gastrointestinal bleeding. *Lancet.* 1974;2(7877):394-397.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(74)91770-X (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `gastroenterology`, `internal-medicine`, `surgery`.
- **Inputs:** the endoscopic finding — active spurting (Ia), active oozing (Ib),
  non-bleeding visible vessel (IIa), adherent clot (IIb), flat pigmented spot (IIc),
  clean ulcer base (III).
- **Output:** the **Forrest class** with the source's descending rebleed-risk
  interpretation (Ia/Ib/IIa high-risk stigmata → endoscopic therapy; IIc/III
  low-risk). Class A — a deterministic input→class mapping
  ([spec-v100](spec-v100.md) §2 classification clarification). Cross-linked to
  `rockall`, `gbs`.

### 2.4 `wagner-dfu` — Wagner (Meggitt-Wagner) Diabetic Foot Ulcer Grade

- **Citation:** Wagner FW Jr. The dysvascular foot: a system for diagnosis and
  treatment. *Foot Ankle.* 1981;2(2):64-122.
- **citationUrl:** https://doi.org/10.1177/107110078100200202 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `wound-care`, `vascular-surgery`, `endocrinology`.
- **Inputs:** the lesion depth/extent finding mapped to grade definitions.
- **Output:** the **grade 0–5** (0 intact/at-risk, 1 superficial, 2 deep to
  tendon/capsule, 3 deep with abscess/osteomyelitis, 4 forefoot gangrene, 5
  whole-foot gangrene) with the source's interpretation. Class A. Cross-linked to
  `wifi` and `university-texas-dfu`.

### 2.5 `university-texas-dfu` — University of Texas Diabetic Foot Ulcer Classification

- **Citation:** Lavery LA, Armstrong DG, Harkless LB. Classification of diabetic
  foot wounds. *J Foot Ankle Surg.* 1996;35(6):528-531; validation: Armstrong DG,
  Lavery LA, Harkless LB. *Diabetes Care.* 1998;21(5):855-859.
- **citationUrl:** https://doi.org/10.1016/S1067-2516(96)80125-6 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `wound-care`, `vascular-surgery`, `endocrinology`.
- **Inputs:** the **grade 0–3** (depth) and the **stage A–D** (A clean, B infection,
  C ischemia, D infection + ischemia).
- **Output:** the **grade×stage cell** (e.g. IIB) with the source's worsening-prognosis
  interpretation (higher grade and stage → poorer healing/amputation odds). Class A —
  a two-axis classification grid; every grade×stage combination resolves to a
  defined cell. Cross-linked to `wagner-dfu`.

## 3. Per-tile robustness

- **`forrest`, `wagner-dfu`, `university-texas-dfu` are deterministic input→class
  mappings**; every combination (including the UT grade×stage grid) resolves to
  exactly one defined cell with no `undefined`/`NaN`.
- **`mipi` is a closed-form continuous index** over finite-checked numerics; the
  **log10(LDH/ULN)** and **log10(WBC)** terms are guarded (LDH/ULN and WBC must be
  >0 or the tile returns a surfaced `valid:false` — a `log(0)`/`log(negative)` path
  is the chief `NaN` risk and is fuzzed explicitly).
- **`precise-dapt`** follows §2.1: it ships only if the nomogram point function is
  cross-verified; its compute is then a guarded per-variable lookup + sum, fuzzed
  for the band boundary at 25.
- All five render the [spec-v50](spec-v50.md) §3 posture note and defer the
  management decision (DAPT duration, transplant/therapy intensity, endoscopic
  therapy, debridement/amputation) to the clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all are **Class A** — fixed published
  classifications/indices cited by journal/authors; none trips `ISSUER_PATTERN`;
  **no `citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the computes live in the new `lib/suites-v155.js`
  module (`preciseDapt` [if shipped], `mipi`, `forrest`, `wagnerDfu`,
  `universityTexasDfu`), added to `fuzz-tools.test.js` `MODULES` — `mipi`
  explicitly fuzzed for the `log` domain. Renderers live in the new
  `views/group-v155.js`; its `RV155` export is spread into `app.js` `RENDERERS`.
  The catalog count moves by the **actual shipped delta** (3–5) on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v155.md                        (this file)
app.js                                   (+3..5 UTILITIES rows, group G; import group-v155 RV155 into RENDERERS)
lib/suites-v155.js                       (new module: mipi, forrest, wagnerDfu, universityTexasDfu, [preciseDapt if sourced])
lib/meta.js                              (+3..5 META entries: inline citation + citationUrl + accessed; cross-links to dapt-score, nccn-ipi/r-ipi/flipi, rockall/gbs, wifi)
views/group-v155.js                      (new renderer module: 3..5 renderers)
docs/clinical-citations.md               (+ rows for the shipped sources)
test/unit/mipi.test.js, forrest.test.js, wagner-dfu.test.js, university-texas-dfu.test.js, [precise-dapt.test.js]   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/suites-v155.js to MODULES)
docs/audits/v12/<id>.md                  (spec-v11 audit logs, one per shipped tile)
docs/scope-post-parity.md                (catalog ledger; advance the v150 running count by the actual delta)
CHANGELOG.md                             (Unreleased: v155 entry with the actual delta; note any PRECISE-DAPT deferral)
README.md, package.json                  (catalog count + spec-progression line -> v155)
```

## 6. Acceptance criteria

v155 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all ids are absent, **and** has resolved the PRECISE-DAPT
  sourcing question per §2.1 (ship or defer, with the rationale recorded in the
  CHANGELOG and `docs/citation-staleness.md`/`scope-post-parity.md`).
- Each shipped tile is live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **MIPI
  low/intermediate 5.7 boundary**, a **Forrest IIa→IIc risk-tier flip**, a **Wagner
  grade-3 osteomyelitis case**, and a **UT IIB grade×stage cell**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `mipi` guards its `log` domain; the classification tiles resolve every
  combination to one defined cell; blank inputs render a complete-the-fields
  fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` advances by the actual shipped delta and all catalog-truth
  surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v155 with its delta.

## 7. Out of scope for v155

- **No nomogram approximation** — PRECISE-DAPT ships only verbatim-sourced or not at
  all (§2.1).
- **No simplified-MIPI point table as the headline** — the continuous biologic index
  is the shipped compute; the simplified variant is noted, not the primary output.
- **No `wifi`/`dapt-score`/`rockall` re-implementation** — those tiles stand; v155
  cross-links to them.
