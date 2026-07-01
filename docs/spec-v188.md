# spec-v188.md — Leukemia & lymphoma staging and prognostic indices: Binet, Rai, Ann Arbor / Lugano, FLIPI-2, and the Hasford CML score (+5 tiles)

> Status: **SHIPPED 2026-07-01 (793 → 798, +5).** Second feature spec of the
> **Subspecialty Oncology & Hematology Staging** program ([spec-v187](spec-v187.md) §1.1). Adds
> **5** deterministic leukemia / lymphoma staging and prognostic instruments,
> **each verified absent by a direct scan of `app.js`** (zero hits): the catalog
> carries the lymphoma IPIs (`flipi`, `nccn-ipi`, `r-ipi`), `mipi`, `gelf-criteria`,
> `hodgkin-ips`, `ipss-r-mds`, and `sokal-cml`, but not the CLL clinical stages, the
> Ann Arbor / Lugano anatomic staging, the FLIPI-2 revision, or the Hasford CML
> score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v188 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no treatment order in Sophie's voice**). **Every
> stage boundary and prognostic weight is re-fetched and cross-verified against ≥2
> independent sources at implementation** ([spec-v97](spec-v97.md)); uncertain
> values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))*
> tag. The implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision
> check** first.

## 1. Thesis

The leukemia / lymphoma clinic stages disease with a small set of society-standard
systems the catalog is missing. v188 ships the two CLL clinical stages (Binet and
Rai), the anatomic lymphoma staging (Ann Arbor with the Lugano modification), the
revised follicular-lymphoma index (FLIPI-2), and the Hasford CML prognostic score
(beside the live Sokal). Each is a deterministic staging algorithm or point model —
auditable, unit-tested at every stage boundary — and each is decision support,
**never a treatment order**.

## 2. What v188 adds (5 tiles)

### 2.1 `binet-cll` — Binet Staging (Chronic Lymphocytic Leukemia)

- **Citation:** Binet JL, Auquier A, Dighiero G, et al. A new prognostic
  classification of chronic lymphocytic leukemia derived from a multivariate
  survival analysis. *Cancer.* 1981;48(1):198-206.
- **citationUrl:** https://doi.org/10.1002/1097-0142(19810701)48:1%3C198::AID-CNCR2820480131%3E3.0.CO;2-V
- **Group:** G (clinical classification). **Specialties:** `hematology`, `oncology`.
- **Inputs:** the number of involved lymphoid areas (of five: cervical, axillary,
  inguinal nodes, spleen, liver), hemoglobin, and platelet count. **Stage A** < 3
  areas, Hb ≥ 10, platelets ≥ 100; **Stage B** ≥ 3 areas with preserved counts;
  **Stage C** Hb < 10 or platelets < 100 *(verify at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **Binet stage (A / B / C)** with the involved-area count and the
  cytopenia trigger, naming the basis. Class A. Cross-links `rai-cll`.

### 2.2 `rai-cll` — Rai Staging (Chronic Lymphocytic Leukemia)

- **Citation:** Rai KR, Sawitsky A, Cronkite EP, Chanana AD, Levy RN, Pasternack
  BS. Clinical staging of chronic lymphocytic leukemia. *Blood.* 1975;46(2):219-234.
- **citationUrl:** https://doi.org/10.1182/blood.V46.2.219.219
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** lymphocytosis (required), lymphadenopathy, spleen/liver enlargement,
  anemia (Hb < 11), thrombocytopenia (platelets < 100). Stages **0** (lymphocytosis
  only), **I** (+ nodes), **II** (+ organomegaly), **III** (+ anemia), **IV**
  (+ thrombocytopenia), grouped low (0) / intermediate (I–II) / high (III–IV)
  *(verify at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **Rai stage (0–IV)** and risk group, naming the basis. Class A.
  Cross-links `binet-cll`.

### 2.3 `ann-arbor` — Ann Arbor Staging (Lugano modification) for Lymphoma

- **Citation:** Carbone PP, Kaplan HS, Musshoff K, Smithers DW, Tubiana M. Report
  of the Committee on Hodgkin's Disease Staging Classification. *Cancer Res.*
  1971;31(11):1860-1861. Lugano: Cheson BD, Fisher RI, Barrington SF, et al.
  *J Clin Oncol.* 2014;32(27):3059-3068.
- **citationUrl:** https://doi.org/10.1200/JCO.2013.54.8800
- **Group:** G. **Specialties:** `hematology`, `oncology`, `radiology`.
- **Inputs:** the number and sides (relative to the diaphragm) of involved nodal
  regions, extranodal (E) involvement, splenic involvement, and the presence of B
  symptoms. **I** one region; **II** ≥ 2 regions same side; **III** both sides;
  **IV** disseminated extranodal — with the **A / B** suffix for B symptoms.
- **Output:** the **Ann Arbor stage (I–IV, A/B, ± E/S)**, naming the basis, with the
  Lugano note that limited (I–II) vs advanced (III–IV) drives the treatment
  paradigm. Class A. Cross-links `flipi`, `nccn-ipi`, `hodgkin-ips`.

### 2.4 `flipi-2` — Follicular Lymphoma International Prognostic Index 2

- **Citation:** Federico M, Bellei M, Marcheselli L, et al. Follicular Lymphoma
  International Prognostic Index 2: a new prognostic index for follicular lymphoma
  developed by the international follicular lymphoma prognostic factor project.
  *J Clin Oncol.* 2009;27(27):4555-4562.
- **citationUrl:** https://doi.org/10.1200/JCO.2008.21.3991
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** the five factors, each 1 point — age > 60, elevated β₂-microglobulin
  (above ULN), longest involved lymph node > 6 cm, bone-marrow involvement,
  hemoglobin < 12 g/dL.
- **Output:** the **FLIPI-2 group** — low (0), intermediate (1–2), high (3–5) —
  with the associated progression-free survival, naming the factors; the tile notes
  FLIPI-2 uses β₂-microglobulin where the original `flipi` uses LDH and stage.
  Class A. Cross-links `flipi`.

### 2.5 `hasford-cml` — Hasford (Euro) Score for Chronic Myeloid Leukemia

- **Citation:** Hasford J, Pfirrmann M, Hehlmann R, et al. A new prognostic score
  for survival of patients with chronic myeloid leukemia treated with interferon
  alfa. *J Natl Cancer Inst.* 1998;90(11):850-858.
- **citationUrl:** https://doi.org/10.1093/jnci/90.11.850
- **Group:** G. **Specialties:** `hematology`, `oncology`.
- **Inputs:** age, spleen size (cm below costal margin), platelet count, and the
  peripheral blast, eosinophil, and basophil percentages, combined by the published
  weighted formula *(verify the coefficients at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **Hasford score** banded low / intermediate / high risk, naming
  the contributors; the tile notes the relationship to the live `sokal-cml` (an
  older comparator) and the EUTOS-era successors. Class A. Cross-links `sokal-cml`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The Hasford
  formula guards its inputs to plausible ranges before the weighted sum; the
  staging tiles clamp counts and labs; outside these each tile renders a
  complete-the-fields fallback, never a `NaN`/`Infinity`.
- **The staging tiles report which criterion set the stage** (the cytopenia trigger
  for Binet/Rai, the diaphragm-side logic for Ann Arbor), so a stage is never read
  without its basis ([spec-v59](spec-v59.md)).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the stage / band boundaries.
- **These stage and prognosticate; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a treatment order in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed staging
  algorithms / point models, each cited by journal + authors. The implementing
  session confirms the `ISSUER_PATTERN` result at build time and adds a
  `docs/citation-staleness.md` row only if a society issuer matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/heme-staging-v188.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v188.js`; its `RV188` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real
  `<label for>`. The catalog count moves on all **13 catalog-truth surfaces** using
  the **live `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hematology`, `oncology`,
  `radiology` — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v188.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v188 RV188 into RENDERERS)
lib/heme-staging-v188.js                 (new: binetCll, raiCll, annArbor, flipi2, hasfordCml)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to flipi, sokal-cml, hodgkin-ips)
views/group-v188.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/binet-cll.test.js, rai-cll.test.js, ann-arbor.test.js, flipi-2.test.js, hasford-cml.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/heme-staging-v188.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v188 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v188 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **Binet
  A/B/C set**, a **Rai stage crossing into the high-risk group**, an **Ann Arbor
  I–II vs III–IV pair with a B-symptom suffix**, a **FLIPI-2 group crossing**, and a
  **Hasford low/intermediate/high example**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by
  the [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v188 with the +5 delta.

## 7. Out of scope for v188

- **No treatment order** — the tiles stage and prognosticate; the therapy decision
  stays with the hematologist and the patient ([spec-v11](spec-v11.md) §5.3).
- **No molecular-risk overlay** — v188 ships the clinical / anatomic staging;
  cytogenetic and mutational risk models are separate slices.
