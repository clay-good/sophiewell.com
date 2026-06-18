# spec-v144.md — Orthopedic fracture classification: Gustilo-Anderson, Garden, Danis-Weber, Schatzker, Salter-Harris, and Neer (+6 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **6**
> deterministic orthopedic fracture-classification decision rules that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v144 close: **648 + 6 = 654 tiles** (or live count + 6 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v143) remains in force. v144 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2), and in particular the §2
> **classification-tile clarification** — these tiles **consume the clinician's
> findings and compute a class, not display a reference table** — and the
> [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract.

## 1. Thesis

The catalog has the orthopedic *triage and risk* rules (`ottawa-ankle`,
`ottawa-knee`, `canadian-c-spine`, `nexus-cspine`) but **no fracture-classification
tiles**. The six standard classification systems below are decision rules per the
[spec-v100](spec-v100.md) §2 clarification: the clinician enters the fracture
findings (open-wound size and contamination, displacement, fibula level relative to
the syndesmosis, plateau geometry, physeal pattern, displaced-part count) and the
tile computes the resulting class **and renders the source's management-relevant
interpretation** — exactly as `kdigo-aki` and `asa-ps` consume inputs to produce a
computed class. A tile that merely *displayed* the class definitions with no input
would be the prohibited reference table; these are not that.

- **Gustilo-Anderson** — open long-bone fracture severity I / II / IIIA / IIIB /
  IIIC, driven by wound size, contamination, soft-tissue coverage, and arterial
  injury (the IIIB→IIIC distinction is the limb-vascular flip).
- **Garden** — femoral-neck fracture displacement grade I–IV (incomplete →
  completely displaced), which drives fixation-vs-arthroplasty management.
- **Danis-Weber** — distal-fibula fracture level relative to the syndesmosis,
  A (below) / B (at) / C (above); stability and operative implications.
- **Schatzker** — tibial-plateau fracture types I–VI by split/depression pattern
  and condylar involvement.
- **Salter-Harris** — physeal (growth-plate) fracture types I–V; the pediatric-
  fracture prognosis classification.
- **Neer** — proximal-humerus fracture class by the count of displaced parts
  (Neer's >1 cm / >45° displacement rule).

## 2. What v144 adds (6 tiles)

### 2.1 `gustilo-anderson` — Gustilo-Anderson Open Fracture Classification

- **Citation:** Gustilo RB, Anderson JT. Prevention of infection in the treatment
  of one thousand and twenty-five open fractures of long bones. *J Bone Joint Surg
  Am.* 1976;58(4):453-458 (Type III subtypes: Gustilo, Mendoza, Williams. *J
  Trauma.* 1984;24(8):742-746).
- **citationUrl:** https://doi.org/10.2106/00004623-197658040-00004
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`, `emergency-medicine`.
- **Inputs:** wound size (<1 cm / 1–10 cm / >10 cm), contamination level, soft-
  tissue/periosteal coverage (adequate vs requires flap), and arterial injury
  requiring repair.
- **Output:** the **class I / II / IIIA / IIIB / IIIC** with the source's
  infection-risk and coverage interpretation. The IIIB (inadequate soft-tissue
  coverage) vs IIIC (vascular injury requiring repair) distinction is rendered
  explicitly. Class A.

### 2.2 `garden-classification` — Garden Classification (Femoral Neck)

- **Citation:** Garden RS. Low-angle fixation in fractures of the femoral neck.
  *J Bone Joint Surg Br.* 1961;43-B(4):647-663.
- **citationUrl:** https://doi.org/10.1302/0301-620X.43B4.647
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`, `surgery`.
- **Inputs:** trabecular alignment / displacement findings (incomplete valgus-
  impacted, complete non-displaced, complete partially displaced, complete fully
  displaced).
- **Output:** the **grade I / II / III / IV** with the source's displacement
  interpretation (and the common stable I–II vs unstable III–IV grouping). Class A.

### 2.3 `weber-ankle` — Danis-Weber Ankle Classification

- **Citation:** Weber BG. *Die Verletzungen des oberen Sprunggelenkes.* Bern: Hans
  Huber; 1966 (Danis-Weber classification; as adopted by the AO Foundation).
- **citationUrl:** https://doi.org/10.1007/978-3-642-... (verify at implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`, `emergency-medicine`.
- **Inputs:** the level of the distal-fibula fracture relative to the level of the
  syndesmosis / ankle joint (below, at, above).
- **Output:** the **type A (infrasyndesmotic) / B (transsyndesmotic) / C
  (suprasyndesmotic)** with the source's syndesmotic-stability interpretation.
  Class B (textbook/monograph source, AO-adopted — `docs/citation-staleness.md`
  row).

### 2.4 `schatzker-classification` — Schatzker Classification (Tibial Plateau)

- **Citation:** Schatzker J, McBroom R, Bruce D. The tibial plateau fracture: the
  Toronto experience 1968-1975. *Clin Orthop Relat Res.* 1979;(138):94-104.
- **citationUrl:** https://doi.org/10.1097/00003086-197901000-00012 (verify at
  implementation)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`.
- **Inputs:** the plateau-fracture pattern (lateral split; lateral split-
  depression; lateral pure depression; medial plateau; bicondylar; plateau with
  metaphyseal-diaphyseal dissociation).
- **Output:** the **type I–VI** with the source's energy/management interpretation.
  Class A.

### 2.5 `salter-harris` — Salter-Harris Classification (Physeal Fracture)

- **Citation:** Salter RB, Harris WR. Injuries involving the epiphyseal plate. *J
  Bone Joint Surg Am.* 1963;45(3):587-622.
- **citationUrl:** https://doi.org/10.2106/00004623-196345030-00019
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-orthopedics`, `orthopedics`, `emergency-medicine`.
- **Inputs:** the relation of the fracture line to the physis, metaphysis, and
  epiphysis (Separated / Above / Lower / Through / cRush — the SALTR mnemonic).
- **Output:** the **type I / II / III / IV / V** with the source's growth-
  disturbance prognosis. Class A.

### 2.6 `neer-classification` — Neer Classification (Proximal Humerus)

- **Citation:** Neer CS 2nd. Displaced proximal humeral fractures. I. Classification
  and evaluation. *J Bone Joint Surg Am.* 1970;52(6):1077-1089.
- **citationUrl:** https://doi.org/10.2106/00004623-197052060-00001
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `orthopedics`, `trauma-surgery`.
- **Inputs:** which of the four segments (articular surface, greater tuberosity,
  lesser tuberosity, shaft) are **displaced** by Neer's criteria (>1 cm or >45°),
  and any fracture-dislocation.
- **Output:** the **part classification** (one-part / two-part / three-part /
  four-part, with the displaced segment named, and fracture-dislocation noted)
  with the source's displacement-definition interpretation. Class A.

## 3. Per-tile robustness

- **All six are deterministic input→class mappings** ([spec-v100](spec-v100.md) §2
  classification clarification): the clinician supplies the radiographic/clinical
  findings as bounded selects, and the tile computes the class and renders the
  source's management interpretation. They are **not** reference tables — each
  consumes inputs and emits a computed class, passing the [spec-v29](spec-v29.md)
  §3 one-line test.
- **`gustilo-anderson` resolves the III-subtype precedence explicitly** — an
  arterial injury requiring repair forces IIIC regardless of wound size; inadequate
  soft-tissue coverage forces IIIB; the IIIB→IIIC flip is unit-tested.
- **`neer-classification` counts displaced parts** with a fixed integer guard
  (1–4); a contradictory selection (e.g. zero displaced segments) renders the
  one-part result, never an out-of-range class.
- Because the outputs are categorical, the [spec-v59](spec-v59.md) fuzz harness
  asserts every input combination resolves to exactly one defined class (no
  `undefined`/`NaN` band); blank required findings render a complete-the-fields
  fallback.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note (the tile
  takes the clinician's read of the imaging; it does not parse a radiograph) and
  quote the source's interpretation; none authors a fixation/operative recommendation
  in Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** five tiles (`gustilo-anderson`,
  `garden-classification`, `schatzker-classification`, `salter-harris`,
  `neer-classification`) are **Class A** — fixed published classifications, each
  cited by journal + authors. `weber-ankle` is **Class B** — its source is a
  textbook/monograph (AO-adopted) rather than a fixed journal derivation; it gets a
  `docs/citation-staleness.md` row naming the edition in force, the `accessed` date,
  and an on-publication review cadence, monitored by
  `scripts/check-citation-cadence.mjs`.
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/ortho-v144.js` module (`gustiloAnderson`, `gardenClassification`,
  `weberAnkle`, `schatzkerClassification`, `salterHarris`, `neerClassification`),
  added to the `test/unit/fuzz-tools.test.js` `MODULES` list (every input
  combination resolves to a defined class; zero `undefined`/`NaN` bands). Renderers
  live in the new `views/group-v144.js` module; its `RV144` export is spread into
  the `app.js` `RENDERERS` map. The catalog count moves on all **13 catalog-truth
  surfaces** in the same change; a11y, `mobile-no-hscroll`, `mobile-touch-targets`,
  and the chromium `example-correctness` sweep pass for `views/group-v144.js`.

## 5. Files touched

```
docs/spec-v144.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v144 RV144 into RENDERERS)
lib/ortho-v144.js                        (new module: gustiloAnderson, gardenClassification, weberAnkle, schatzkerClassification, salterHarris, neerClassification)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to ottawa-ankle, ottawa-knee, nexus-cspine)
views/group-v144.js                      (new renderer module: 6 renderers)
docs/citation-staleness.md               (+ row: weber-ankle Danis-Weber/AO monograph)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/gustilo-anderson.test.js, garden-classification.test.js, weber-ankle.test.js, schatzker-classification.test.js, salter-harris.test.js, neer-classification.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ortho-v144.js to MODULES)
docs/audits/v12/gustilo-anderson.md, garden-classification.md, weber-ankle.md, schatzker-classification.md, salter-harris.md, neer-classification.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 648 -> 654; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v144 entry, +6)
README.md, package.json                  (catalog count 648 -> 654; spec-progression line -> v144)
```

## 6. Acceptance criteria

v144 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a **Gustilo IIIA→IIIB→IIIC distinction**, a Garden **II→III stable→
  unstable boundary**, a Weber **B→C suprasyndesmotic flip**, and a Salter-Harris
  II→III case), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Every input combination resolves to exactly one defined class; blank required
  findings render a complete-the-fields fallback.
- Every compute uses `lib/num.js` where numeric and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero `undefined`/`NaN` bands.
- `weber-ankle` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **654** (or live count + 6) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v144 with the +6 catalog delta.

## 7. Out of scope for v144

- **No imaging/radiograph parsing** — each tile takes the clinician's read of the
  film (wound size, displacement, fibula level, physeal pattern, part count) as
  bounded inputs; it does not ingest or interpret a DICOM/image.
- **No automatic fixation/operative-plan order** — each tile reports the class and
  the source's management-relevant interpretation; the operative decision stays with
  the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No browsable classification index** — per the [spec-v100](spec-v100.md) §2
  clarification, every tile consumes inputs and computes a class; a no-input display
  of the definitions is explicitly out of scope.
