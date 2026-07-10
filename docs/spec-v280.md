# spec-v280.md — Rheumatology function & case definition: the HAQ-DI and the ASAS axial-spondyloarthritis criteria (+2 tiles)

> Status: **PROPOSED (2026-07-10, docs-only).** Third feature spec of the **Advanced
> Prognostic & Classification Instruments** program ([spec-v278](spec-v278.md) §1.1).
> Proposes **2** deterministic instruments a rheumatology team reaches for at the
> function-assessment and case-definition decision points — how much physical disability
> does this patient carry, and does this chronic back pain classify as axial
> spondyloarthritis. **Each id was verified absent** ([spec-v85 §6.2](spec-v85.md)) by a
> fixed-string scan of the extracted `app.js` id/name list: the catalog carries `das28`,
> `cdai-ra`, `sdai-ra`, `rapid3`, `basdai`, `basfi`, `asdas`, `dapsa`, `caspar`,
> `acr-eular-2010-ra`, `slicc-sle`, and `sle-2019-eular-acr`, but **not** the HAQ-DI or the
> ASAS axial-spondyloarthritis criteria.
>
> Catalog effect, if built: **live `UTILITIES.length` + 2**, enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)); no number is copied here.
>
> Every prior spec remains in force. v280 adds no runtime network call and no AI; each tile
> obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the [spec-v50](spec-v50.md) §3
> posture note, and honors [spec-v11](spec-v11.md) §5.3 (**HAQ-DI reports a disability index
> and ASAS presents the criteria's own classification, never a diagnosis or a treatment
> order in Sophie's voice**). **Every item, weight, and threshold is re-fetched and
> cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at implementation,
> [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the [spec-v85 §6.2](spec-v85.md)
> collision check** first.

## 1. Thesis

The catalog carries the RA disease-activity indices (DAS28, CDAI, SDAI, RAPID3), the
spondyloarthritis *activity* indices (BASDAI, BASFI, ASDAS), the psoriatic-arthritis
activity and classification tools (DAPSA, CASPAR), and the RA/SLE *classification* criteria
(2010 ACR/EULAR RA, SLICC and 2019 EULAR/ACR SLE). It does **not** carry the single most
widely-used measure of *physical function* in rheumatology — the **HAQ-DI**, the disability
index that anchors RA outcome trials and the ACR core set — nor the **ASAS classification
criteria for axial spondyloarthritis**, the case definition that admits both the
radiographic and non-radiographic forms of the disease. Both are transparent instruments,
freely reproducible from open sources, and each is decision support — **never a diagnosis or
a treatment order**.

## 2. What v280 adds (2 tiles)

### 2.1 `haq-di` — Health Assessment Questionnaire Disability Index

- **Citation:** Fries JF, Spitz P, Kraines RG, Holman HR. Measurement of patient outcome in
  arthritis. *Arthritis Rheum.* 1980;23(2):137-145.
- **citationUrl:** https://doi.org/10.1002/art.1780230202
- **Group:** G. **Specialties:** `rheumatology`, `physical-medicine-rehabilitation`,
  `occupational-therapy`, `internal-medicine`.
- **Inputs — 8 functional categories** scored on the 0-3 difficulty scale (0 = without any
  difficulty, 1 = with some difficulty, 2 = with much difficulty, 3 = unable to do):
  dressing/grooming, arising, eating, walking, hygiene, reach, grip, and common activities.
  Each category takes the **highest** score among its constituent items; an **aids/devices or
  help-from-another-person adjustment** raises any category scored 0 or 1 up to a minimum of 2
  *(the exact aid-to-category mapping is transcribed at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **HAQ-DI (0-3)** as the mean of the 8 category scores (computed when at
  least 6 of 8 categories are answered), with the functional bands stated — **≤ 1 mild-to-
  moderate difficulty, > 1 to 2 moderate-to-severe disability, > 2 severe disability** — and
  the minimum clinically important difference (≈ 0.22) noted. Framed as the anchor measure of
  physical function in rheumatology; **it reports a disability index, never a diagnosis or a
  treatment order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `das28`, `rapid3`,
  `basfi`.

### 2.2 `asas-axspa` — ASAS classification criteria for axial spondyloarthritis

- **Citation:** Rudwaleit M, van der Heijde D, Landewé R, et al. The development of Assessment
  of SpondyloArthritis international Society classification criteria for axial
  spondyloarthritis (part II): validation and final selection. *Ann Rheum Dis.*
  2009;68(6):777-783.
- **citationUrl:** https://doi.org/10.1136/ard.2009.108233
- **Group:** G. **Specialties:** `rheumatology`, `internal-medicine`.
- **Inputs — an entry criterion plus two classification arms** *(the SpA-feature list is
  transcribed verbatim at implementation, [spec-v97](spec-v97.md))*: **entry** = back pain
  ≥ 3 months with age at onset < 45 years; then the **imaging arm** = sacroiliitis on imaging
  (MRI active inflammation or definite radiographic sacroiliitis by the modified New York
  grading) **plus ≥ 1 SpA feature**; **or** the **clinical arm** = HLA-B27 positive **plus
  ≥ 2 other SpA features**. **SpA features:** inflammatory back pain, arthritis, enthesitis
  (heel), uveitis, dactylitis, psoriasis, Crohn's/colitis, good response to NSAIDs, family
  history of SpA, HLA-B27, and elevated CRP.
- **Output:** whether the case **meets or does not meet** the ASAS axial-SpA classification,
  naming the arm satisfied and the features present, and stating that the criteria classify
  (for study enrollment) rather than diagnose. Framed as the case definition that admits both
  radiographic (ankylosing spondylitis) and non-radiographic axial SpA; **it presents the
  criteria's own classification, never a diagnosis or a treatment order**
  ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `basdai`, `asdas`, `caspar`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** HAQ-DI is a bounded
  mean on [0, 3] with the 6-of-8 completeness guard; ASAS is a boolean arm evaluation — each
  renders a "complete the fields" fallback for insufficient input rather than a `NaN`.
- **Each tile reports its basis** ([spec-v59](spec-v59.md)) — HAQ-DI names the category
  contributions, the aid adjustment applied, and the completeness count; ASAS names the arm
  satisfied and the features counted — so a result is never read without its basis.
- **HAQ-DI renders an index and ASAS renders the criteria's classification, not an order**
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **Both flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks**,
  fuzzed at the HAQ-DI aid-adjustment floor and the 6-of-8 completeness edge, and at the ASAS
  imaging-arm / clinical-arm boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** both **Class A** — a fixed questionnaire index and a fixed
  criteria set, each cited by journal + authors. The implementing session confirms whether
  the ASAS issuer trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and
  adds a `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the two computes live in a new `lib/rheum-fn-v280.js`, added
  to `test/unit/fuzz-tools.test.js` `MODULES`; the HAQ-DI category/aid table and the ASAS
  SpA-feature list live as named constants with the source tables cited in a comment.
  Renderers live in a new `views/group-v280.js`; its `RV280` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count moves
  on all catalog-truth surfaces using the live `UTILITIES.length + 2`; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness` sweep
  pass.
- **Specialties** are drawn from the closed `ALLOWED_SPECIALTIES` vocabulary; all tags used
  here already exist.
- **MCP exposure (post-ship):** both are Class A deterministic computes, routinely
  MCP-adaptable — a follow-up MCP wave exposes them per the [spec-v85](spec-v85.md) recipe.
  HAQ-DI self-describes its category scores and the aid adjustment; ASAS echoes the arm and
  feature count so the boolean round-trip passes.

## 5. Files touched

```
docs/spec-v280.md                        (this file)
app.js                                   (+2 UTILITIES rows; import group-v280 RV280 into RENDERERS)
lib/rheum-fn-v280.js                     (new: haqDi, asasAxspa + HAQ category/aid + ASAS SpA-feature constants)
lib/meta.js                              (+2 META entries: inline citation + citationUrl + accessed; cross-links das28, rapid3, basdai, asdas, caspar)
views/group-v280.js                      (new renderer module: 2 renderers)
docs/clinical-citations.md               (+2 rows)
test/unit/haq-di.test.js, asas-axspa.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/rheum-fn-v280.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+2; record the v280 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+2; spec-progression line)
```

## 6. Acceptance criteria

v280 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed both ids are absent (as verified at draft).
- Both tiles are live (Class A) with a `META[id]` entry, inline citation + `citationUrl` +
  `accessed`, and ≥ 3 worked examples each — including a **HAQ-DI with an aids/devices
  adjustment raising a category to 2** and the 6-of-8 completeness rule exercised, and an
  **ASAS case that meets via the imaging arm and one that meets via the clinical arm**.
- The HAQ-DI 8-category/aid-adjustment rule and the ASAS entry criterion, two arms, and
  SpA-feature list are reproduced from the primary sources and re-verified against ≥ 2
  independent references at implementation ([spec-v97](spec-v97.md)).
- Every compute is finite-guarded, routes through `lib/num.js`, clamps HAQ-DI to [0, 3], and
  is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 2** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, and `npm run build` all pass; the CHANGELOG records v280
  with the +2 delta.

## 7. Out of scope for v280

- **No diagnosis or treatment order** — HAQ-DI reports a disability index and ASAS presents
  the criteria's own classification; diagnosis and management stay with the clinician
  ([spec-v11](spec-v11.md) §5.3). ASAS is a **classification** (study-enrollment) tool, not a
  diagnostic test — the tile states this explicitly.
- **No modified-HAQ / HAQ-II / MDHAQ variants and no peripheral-SpA ASAS criteria** — this
  slice adds the canonical HAQ-DI and the axial-SpA arm only; the shortened HAQ variants and
  the peripheral-SpA criteria are deferred to a later slice. If the HAQ aid-adjustment mapping
  or any ASAS arm cannot be reproduced from ≥ 2 open sources at implementation, that piece is
  parked (not approximated), per [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md)
  precedent.
