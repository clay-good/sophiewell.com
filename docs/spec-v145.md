# spec-v145.md — Orthopedic risk & osteoarthritis: Frykman, Mirels, Kellgren-Lawrence, Pittsburgh knee rule, and compartment delta pressure (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **5**
> deterministic orthopedic classification/risk instruments that fill confirmed
> gaps. None duplicates a live tile.
>
> Catalog effect at v145 close: **654 + 5 = 659 tiles** (or live count + 5 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v144) remains in force. v145 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

v144 shipped the fracture-classification systems; v145 completes the orthopedic
wave with a distal-radius classification, an impending-pathologic-fracture risk
score, the radiographic OA grade, an ED imaging decision rule, and the limb-saving
compartment-pressure math. Each is absent from the catalog and sits beside the v144
orthopedic cluster and the existing `ottawa-knee`/`ottawa-ankle` ED rules.

- **Frykman** — distal-radius fracture classification I–VIII (intra-articular
  involvement + ulnar styloid fracture).
- **Mirels** — the impending-pathologic-fracture risk score (site + pain + lesion
  type + size, 4–12) that gates prophylactic fixation in bone metastases.
- **Kellgren-Lawrence** — the radiographic osteoarthritis grade 0–4.
- **Pittsburgh knee rule** — the knee-radiograph indication rule (blunt
  trauma/fall mechanism + age <12 or >50 or inability to bear weight).
- **compartment-delta-pressure** — Δ = diastolic BP − measured compartment
  pressure; **< 30 mmHg** is the published fasciotomy threshold.

## 2. What v145 adds (5 tiles)

### 2.1 `frykman-classification` — Frykman Classification (Distal Radius)

- **Citation:** Frykman G. Fracture of the distal radius including sequelae. *Acta
  Orthop Scand.* 1967;Suppl 108:3-153.
- **citationUrl:** https://doi.org/10.3109/ort.1967.38.suppl-108.01 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`, `emergency-medicine`.
- **Inputs:** the radiocarpal/radioulnar joint involvement pattern (extra-
  articular; radiocarpal; radioulnar; both joints) and presence of an associated
  distal ulna (styloid) fracture.
- **Output:** the **type I–VIII** with the source's intra-articular/ulnar-styloid
  interpretation (odd numbers = no ulnar fracture, even = with ulnar fracture).
  Class A.

### 2.2 `mirels-score` — Mirels Score (Impending Pathologic Fracture)

- **Citation:** Mirels H. Metastatic disease in long bones: a proposed scoring
  system for diagnosing impending pathologic fractures. *Clin Orthop Relat Res.*
  1989;(249):256-264.
- **citationUrl:** https://doi.org/10.1097/00003086-198912000-00027 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `oncology`, `surgery`.
- **Inputs:** the 4 factors, each 1–3 — lesion site (upper limb / lower limb /
  peritrochanteric), pain (mild / moderate / functional), lesion type (blastic /
  mixed / lytic), and lesion size (<⅓ / ⅓–⅔ / >⅔ of cortex).
- **Output:** the **total (4–12)** with the published interpretation — ≤7 low
  fracture risk (radiate/observe), 8 borderline, **≥ 9** high risk (prophylactic
  fixation recommended) — naming the factor scores. Class A.

### 2.3 `kellgren-lawrence` — Kellgren-Lawrence Osteoarthritis Grade

- **Citation:** Kellgren JH, Lawrence JS. Radiological assessment of
  osteo-arthrosis. *Ann Rheum Dis.* 1957;16(4):494-502.
- **citationUrl:** https://doi.org/10.1136/ard.16.4.494
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `rheumatology`, `physical-medicine-rehabilitation`.
- **Inputs:** the radiographic findings (osteophytes, joint-space narrowing,
  sclerosis, bony deformity) mapped to the grade definition.
- **Output:** the **grade 0 (none) / 1 (doubtful) / 2 (minimal) / 3 (moderate) /
  4 (severe)** with the source's interpretation. Class A.

### 2.4 `pittsburgh-knee-rule` — Pittsburgh Knee Rules

- **Citation:** Seaberg DC, Jackson R. Clinical decision rule for knee radiographs.
  *Am J Emerg Med.* 1994;12(5):541-543.
- **citationUrl:** https://doi.org/10.1016/0735-6757(94)90274-7
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `orthopedics`, `sports-medicine`.
- **Inputs:** mechanism (blunt trauma or a fall — the entry gate), then age <12 or
  >50 years, and inability to bear weight (≤4 steps) in the ED.
- **Output:** the **radiograph indicated / not indicated** decision per the rule
  (entry mechanism present **and** [age <12 or >50 **or** unable to bear weight]).
  Class A. Near-neighbor: `ottawa-knee` — cross-linked, both kept (different
  derivation/inputs).

### 2.5 `compartment-delta-pressure` — Compartment Delta Pressure

- **Citation:** McQueen MM, Court-Brown CM. Compartment monitoring in tibial
  fractures: the pressure threshold for decompression. *J Bone Joint Surg Br.*
  1996;78(1):99-104.
- **citationUrl:** https://doi.org/10.1302/0301-620X.78B1.0780099
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `orthopedics`, `trauma-surgery`, `emergency-medicine`.
- **Inputs:** diastolic blood pressure (mmHg) and measured intracompartmental
  pressure (mmHg).
- **Output:** the **delta pressure Δ = diastolic − compartment (mmHg)** with the
  published **< 30 mmHg → fasciotomy** threshold flag. Class A. Computation is a
  guarded subtraction.

## 3. Per-tile robustness

- **`frykman-classification` and `kellgren-lawrence` are deterministic input→class
  mappings** ([spec-v100](spec-v100.md) §2 classification clarification): bounded
  finding selects in, a computed grade + the source's interpretation out; every
  combination resolves to exactly one defined class (no `undefined`/`NaN` band).
- **`mirels-score` is a bounded weighted sum** (4–12) mapped to the published bands;
  it names the four factor scores and the recommendation band, and flows through the
  [spec-v59](spec-v59.md) fuzz harness cleanly.
- **`pittsburgh-knee-rule` is boolean entry-gate logic** — the fall/blunt-trauma
  mechanism is a required entry criterion; without it the rule does not apply, which
  the renderer states rather than silently returning "not indicated."
- **`compartment-delta-pressure` guards its subtraction** — both inputs are
  finite-checked; a non-finite or blank input returns a surfaced `valid:false`
  fallback rather than `NaN`; the renderer shows the signed delta and the <30 flip.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note (the
  classification tiles take the clinician's read of the imaging) and quote the
  source's interpretation; none authors a fixation/decompression order in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published
  classifications/formulas, each cited by journal + authors (not an issuing
  society), so none trips the `ISSUER_PATTERN` and **none needs a
  `docs/citation-staleness.md` row**.
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/ortho-v145.js` module (`frykmanClassification`, `mirelsScore`,
  `kellgrenLawrence`, `pittsburghKneeRule`, `compartmentDeltaPressure`), added to
  the `test/unit/fuzz-tools.test.js` `MODULES` list — `compartment-delta-pressure`
  explicitly fuzzed for the subtraction-overflow/`NaN` path; the classification
  tiles asserted to resolve to a defined class for every combination. Renderers
  live in the new `views/group-v145.js` module; its `RV145` export is spread into
  the `app.js` `RENDERERS` map. The catalog count moves on all **13 catalog-truth
  surfaces** in the same change; a11y, `mobile-no-hscroll`, `mobile-touch-targets`,
  and the chromium `example-correctness` sweep pass for `views/group-v145.js`.

## 5. Files touched

```
docs/spec-v145.md                        (this file)
app.js                                   (+5 UTILITIES rows, groups G/E; import group-v145 RV145 into RENDERERS)
lib/ortho-v145.js                        (new module: frykmanClassification, mirelsScore, kellgrenLawrence, pittsburghKneeRule, compartmentDeltaPressure)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to ottawa-knee, ottawa-ankle, the v144 ortho cluster)
views/group-v145.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/frykman-classification.test.js, mirels-score.test.js, kellgren-lawrence.test.js, pittsburgh-knee-rule.test.js, compartment-delta-pressure.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ortho-v145.js to MODULES)
docs/audits/v12/frykman-classification.md, mirels-score.md, kellgren-lawrence.md, pittsburgh-knee-rule.md, compartment-delta-pressure.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 654 -> 659; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v145 entry, +5)
README.md, package.json                  (catalog count 654 -> 659; spec-progression line -> v145)
```

## 6. Acceptance criteria

v145 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **Mirels
  8→9 prophylactic-fixation flip**, a Kellgren-Lawrence **2→3** grade boundary, a
  Pittsburgh **indicated/not-indicated** flip, and a **compartment Δ at exactly 30
  mmHg** boundary case), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- `compartment-delta-pressure` guards its subtraction; the classification tiles
  resolve every combination to one defined class; blank inputs render a
  complete-the-fields fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **659** (or live count + 5) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v145 with the +5 catalog delta.

## 7. Out of scope for v145

- **No imaging/radiograph parsing** — the Frykman, Kellgren-Lawrence, and Mirels
  tiles take the clinician's read of the film as bounded inputs; they do not ingest
  or interpret an image.
- **No automatic fixation/decompression/imaging order** — each tile reports the
  class/score/decision and the source's interpretation; the management decision
  stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No `ottawa-knee` re-implementation** — the existing tile stands;
  `pittsburgh-knee-rule` is the distinct alternative rule, cross-linked, both kept.
