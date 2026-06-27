# spec-v159.md — Neuro & spine disability classification: EDSS, ASIA Impairment Scale, mJOA, and Nurick (+4 tiles)

> Status: **SHIPPED (2026-06-26).** (was PROPOSED 2026-06-23.) Feature spec of the
> [spec-v157](spec-v157.md) **Subspecialty Depth** program. Adds **4**
> deterministic neurological/spinal disability classification instruments that
> fill a confirmed gap — the catalog has acute stroke/SAH/ICH scores and `mrs`
> (modified Rankin) but **none of the chronic MS, spinal-cord-injury, or
> cervical-myelopathy disability scales**. None duplicates a live tile.
>
> Catalog effect at v159 close: **live count + 4** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v158) remains in force. v159 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (including the §2 classification-tile clarification), passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract. Scale definitions are re-fetched and cross-verified to
> ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Chronic neurologic and spinal disability is tracked by standard ordinal scales the
catalog does not carry. The four below are the field standards: the EDSS (the
universal MS disability measure), the ASIA Impairment Scale (the spinal-cord-injury
completeness grade), and the mJOA and Nurick scales (the two cervical-myelopathy
severity measures that gate decompression). Each is a deterministic input→grade/score
mapping.

## 2. What v159 adds (4 tiles)

### 2.1 `edss` — Expanded Disability Status Scale (EDSS)

- **Citation:** Kurtzke JF. Rating neurologic impairment in multiple sclerosis: an
  expanded disability status scale (EDSS). *Neurology.* 1983;33(11):1444-1452.
- **citationUrl:** https://doi.org/10.1212/WNL.33.11.1444 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `physical-medicine-rehabilitation`.
- **Inputs:** the eight Functional System (FS) scores (pyramidal, cerebellar,
  brainstem, sensory, bowel/bladder, visual, cerebral, other) and the ambulation
  status (unrestricted → bedbound).
- **Output:** the **EDSS step 0–10 in 0.5 increments** per Kurtzke's FS-and-
  ambulation rules (ambulation governs the 4.0–9.5 range; FS combinations govern
  1.0–3.5). Class A — a deterministic mapping; every valid FS/ambulation input
  resolves to exactly one defined step. The renderer states the ambulation-distance
  thresholds that pin the 4.0–7.0 range.

### 2.2 `asia-impairment` — ASIA Impairment Scale (AIS)

- **Citation:** Kirshblum SC, Burns SP, Biering-Sørensen F, et al. International
  Standards for Neurological Classification of Spinal Cord Injury (ISNCSCI),
  revised 2011. *J Spinal Cord Med.* 2011;34(6):535-546.
- **citationUrl:** https://doi.org/10.1179/204577211X13207446293695 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `physical-medicine-rehabilitation`, `neurology`.
- **Inputs:** whether sensory and/or motor function is preserved below the
  neurological level, sacral sparing (S4-S5), and motor preservation across more
  than half the key muscles below the level.
- **Output:** the **AIS grade A (complete) / B (sensory incomplete) / C (motor
  incomplete, <half ≥3) / D (motor incomplete, ≥half ≥3) / E (normal)** per the
  ISNCSCI decision logic. Class A — deterministic input→grade; the sacral-sparing
  gate is surfaced (no sparing ⇒ A). 
- **Scope note:** ships the **AIS grade decision** from the clinician's exam
  findings; it does **not** re-derive the full dermatome/myotome ISNCSCI worksheet.

### 2.3 `mjoa` — modified Japanese Orthopaedic Association Score (cervical myelopathy)

- **Citation:** Benzel EC, Lancon J, Kesterson L, Hadden T. Cervical laminectomy
  and dentate ligament section for cervical spondylotic myelopathy. *J Spinal
  Disord.* 1991;4(3):286-295 (mJOA, 18-point).
- **citationUrl:** (PMID 1802159 — verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `orthopedics`, `neurology`.
- **Inputs:** four domains — motor upper extremity (0–5), motor lower extremity
  (0–7), sensory upper extremity (0–3), sphincter function (0–3).
- **Output:** the **mJOA total 0–18** with the severity bands (mild ≥15, moderate
  12–14, severe <12). Class A. Higher = better function (inverted vs most scores) —
  the renderer states the direction explicitly.

### 2.4 `nurick` — Nurick Grade (cervical spondylotic myelopathy)

- **Citation:** Nurick S. The pathogenesis of the spinal cord disorder associated
  with cervical spondylosis. *Brain.* 1972;95(1):87-100.
- **citationUrl:** https://doi.org/10.1093/brain/95.1.87 (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurosurgery`, `orthopedics`, `neurology`.
- **Inputs:** the gait/ambulation status mapped to the grade definition (root signs
  only → unable to walk).
- **Output:** the **Nurick grade 0–5** (0 root signs no cord involvement, 1 cord
  signs but normal gait, 2 mild gait difficulty fully employed, 3 gait difficulty
  preventing employment, 4 able to walk only with assistance, 5 chairbound/bedridden)
  with the source's interpretation. Class A. Cross-linked to `mjoa` (both kept;
  Nurick is gait-focused, mJOA is multidomain).

## 3. Per-tile robustness

- All four are **deterministic input→grade/score mappings** over bounded selects;
  every valid combination resolves to exactly one defined grade/step/band (no
  `undefined`/`NaN`), confirmed by the [spec-v59](spec-v59.md) fuzz harness.
- **EDSS** is the chief correctness risk: the FS-vs-ambulation precedence (ambulation
  governs 4.0–9.5, FS governs the low range) and the 0.5-step granularity are
  implemented as a documented rule table and unit-tested at the step boundaries; an
  inconsistent FS/ambulation pair resolves per the published precedence rather than
  silently picking the lower value.
- **mJOA direction** (higher = better) is surfaced so the renderer never implies a
  high score is worse; the band boundaries (11/12, 14/15) are exercised.
- **ASIA** sacral-sparing gate and **Nurick** employment/ambulation anchors are each
  unit-tested at the grade transitions; an incomplete exam input renders a surfaced
  `valid:false` complete-the-fields fallback.
- All four render the [spec-v50](spec-v50.md) §3 posture note (the clinician's exam
  findings drive the grade) and defer the management decision (DMT escalation,
  decompression timing, rehab plan) to the clinician ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all four are **Class A** — fixed published scales
  cited by journal/authors; **ISNCSCI** is cited to its author/journal (Kirshblum)
  not a society acronym, so none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the four computes live in the new
  `lib/neuro-disability-v159.js` module (`edss`, `asiaImpairment`, `mjoa`,
  `nurick`), added to `fuzz-tools.test.js` `MODULES` (each asserted to resolve to a
  defined grade for every combination). Renderers live in the new
  `views/group-v159.js`; its `RV159` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v159.md                        (this file)
app.js                                   (+4 UTILITIES rows, group G; import group-v159 RV159 into RENDERERS)
lib/neuro-disability-v159.js             (new module: edss, asiaImpairment, mjoa, nurick)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to mrs, gose, modified-ashworth)
views/group-v159.js                      (new renderer module: 4 renderers)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/edss.test.js, asia-impairment.test.js, mjoa.test.js, nurick.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/neuro-disability-v159.js to MODULES)
docs/audits/v12/edss.md, asia-impairment.md, mjoa.md, nurick.md                 (spec-v11 audit logs)
docs/scope-subspecialty-depth.md         (catalog ledger; advance the v157 running count)
CHANGELOG.md                             (Unreleased: v159 entry, +4)
README.md, package.json                  (catalog count + spec-progression line -> v159)
```

## 6. Acceptance criteria

v159 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all four ids are absent.
- All 4 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including an **EDSS
  ambulation-governed 4.0–7.0 step**, an **ASIA A-vs-B sacral-sparing flip**, an
  **mJOA 14/15 moderate→mild boundary**, and a **Nurick 3→4 employment/assistance
  transition**), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every classification resolves every combination to one defined grade/step; blank
  inputs render a complete-the-fields fallback; the mJOA higher-is-better direction
  is surfaced.
- Every compute is covered by the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite/undefined-band leaks.
- `UTILITIES.length` is live count + 4 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v159 with the +4 delta.

## 7. Out of scope for v159

- **No full ISNCSCI worksheet** — `asia-impairment` ships the AIS grade decision
  from the clinician's exam, not the dermatome-by-dermatome motor/sensory scoring
  sheet.
- **No MS phenotype/diagnosis** — `edss` quantifies disability; the McDonald
  diagnostic criteria (MRI dissemination in space/time) are out of scope.
- **No automatic surgical/DMT recommendation** — each tile reports the grade/score
  and the source's interpretation; the decision stays with the clinician.
