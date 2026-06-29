# spec-v175.md — Pain in the cognitively impaired / nonverbal elder: Abbey Pain Scale, CNPI, DOLOPLUS-2 (+3 tiles)

> Status: **SHIPPED 3 of 3 (2026-06-29).** Third implementation spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program, cluster **§3.3 — Pain in the cognitively impaired / nonverbal elder.**
> Adds **3** deterministic observational pain-assessment instruments
> (`abbey-pain`, `cnpi`, `doloplus-2`) that fill confirmed LTC gaps. None
> duplicates a live tile. The Abbey bands (0–2 / 3–7 / 8–13 / 14+), the CNPI
> two-condition 0–6 + 0–6 → 0–12 scoring, and the DOLOPLUS-2 ≥ 5 threshold were
> re-fetched and cross-verified against ≥ 2 independent sources at implementation
> (spec-v97); all three are Class A and trip no `ISSUER_PATTERN`.
>
> Catalog effect at v175: **live count + 3 tiles** — never a number copied from
> this document or the v172 umbrella (the running counts carry a known off-by-one;
> the catalog-truth gate enforces the live `UTILITIES.length` + delta).
>
> Every prior spec (v4 through v174) remains in force. v175 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) — including the §2 classification-tile
> clarification (a tile *consumes the clinician's observations and computes a
> score/band*; it does not display a static reference table) — and the
> [spec-v100](spec-v100.md) §6 CI/CD contract. Each passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract. Every weight, band, and lookup row is re-fetched and cross-verified
> against ≥2 independent sources at implementation ([spec-v97](spec-v97.md));
> nothing here is implemented from recall.

## 1. Thesis

The catalog already carries `painad` (Pain Assessment in Advanced Dementia) and
`cpot` (Critical-Care Pain Observation Tool) — strong observational pain tiles for
the nonverbal patient. But PAINAD is one of several validated scales, and LTC pain
protocols frequently **mandate** a specific instrument: the **Abbey Pain Scale**
(the standard in Australian and UK aged care), **DOLOPLUS-2** (the standard in
French and European geriatric care), or the **Checklist of Nonverbal Pain
Indicators (CNPI)** — which uniquely scores pain **both at rest and with
movement**, an assessment PAINAD does not structure. A facility whose policy names
Abbey or DOLOPLUS-2 cannot substitute PAINAD; v175 closes that gap so the nurse
reaches for the mandated scale and finds it here.

- **abbey-pain** — the Abbey Pain Scale: 6 observed items, each 0–3 → 0–18, mapped
  to no-pain / mild / moderate / severe bands.
- **cnpi** — the Checklist of Nonverbal Pain Indicators: 6 behaviours scored
  present/absent both at rest and with movement, the two-condition structure
  `painad` lacks.
- **doloplus-2** — the DOLOPLUS-2 behavioural pain scale: 10 items across somatic,
  psychomotor, and psychosocial reactions, each 0–3 → 0–30, with the published
  pain threshold.

## 2. What v175 adds (3 tiles)

### 2.1 `abbey-pain` — Abbey Pain Scale

- **Citation:** Abbey J, Piller N, De Bellis A, et al. The Abbey pain scale: a
  1-minute numerical indicator for people with end-stage dementia. *Int J Palliat
  Nurs.* 2004;10(1):6-13.
- **citationUrl:** https://doi.org/10.12968/ijpn.2004.10.1.12013
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `palliative-care`,
  `pain-management`.
- **Inputs:** the 6 observed items, each scored 0 (absent) / 1 (mild) / 2
  (moderate) / 3 (severe) — vocalization, facial expression, change in body
  language, behavioural change, physiological change, physical change.
- **Output:** the **Abbey total (0–18)** mapped to the published bands — **0–2 no
  pain, 3–7 mild, 8–13 moderate, 14+ severe** (verify at implementation,
  [spec-v97](spec-v97.md)) — naming the items counted. Class A. Cross-links
  `painad`.

### 2.2 `cnpi` — Checklist of Nonverbal Pain Indicators

- **Citation:** Feldt KS. The checklist of nonverbal pain indicators (CNPI). *Pain
  Manag Nurs.* 2000;1(1):13-21.
- **citationUrl:** https://doi.org/10.1053/jpmn.2000.5831
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `nursing-rehab`,
  `pain-management`.
- **Inputs:** the 6 behaviours — nonverbal vocal complaints, facial
  grimacing/wincing, bracing, restlessness, rubbing, verbal vocal complaints —
  each scored present (1) / absent (0) **at rest** and again **with movement**.
- **Output:** the **CNPI total** — 0–6 at rest and 0–6 with movement, summed to a
  **0–12 combined** score (verify the per-condition vs combined scoring at
  implementation, [spec-v97](spec-v97.md)); any indicator present in either
  condition is clinically meaningful. The renderer shows the rest score, the
  movement score, and the combined total, naming the behaviours observed. Class A.
  Cross-links `painad` and `abbey-pain`.

### 2.3 `doloplus-2` — DOLOPLUS-2 Behavioural Pain Assessment

- **Citation:** Wary B, Doloplus collective; Lefebvre-Chapiro S. The Doloplus-2
  scale — evaluating pain in the elderly. *Eur J Palliat Care.* 2001;8(5):191-194.
- **citationUrl:** https://www.doloplus.fr/ (verify edition/page at implementation,
  [spec-v97](spec-v97.md))
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-general`, `palliative-care`,
  `pain-medicine`.
- **Inputs:** the 10 items across three reaction domains — **somatic** (somatic
  complaints, protective body postures at rest, protection of sore areas, facial
  expression, sleep pattern), **psychomotor** (washing/dressing, mobility), and
  **psychosocial** (communication, social life, behavioural problems) — each
  scored 0–3.
- **Output:** the **DOLOPLUS-2 total (0–30)** with the published threshold —
  **score ≥ 5 indicates pain** (verify at implementation, [spec-v97](spec-v97.md))
  — naming the domain subtotals and the items counted. Class A. Cross-links
  `abbey-pain`.

## 3. Per-tile robustness

- **`abbey-pain` is a bounded observational sum** (0–18) mapped to the published
  no-pain / mild / moderate / severe bands (re-fetched verbatim,
  [spec-v100](spec-v100.md) §5); band boundaries — including the **7→8 mild→
  moderate** and **13→14 moderate→severe** edges — are unit-tested. It names the 6
  contributing items.
- **`cnpi` guards the at-rest vs with-movement two-condition scoring** — the
  compute carries two independent 0–6 sums (rest, movement) and a 0–12 combined
  total, never conflating the two conditions; a blank condition renders a
  complete-the-fields fallback rather than scoring movement from rest. It names the
  6 behaviours and shows both condition scores.
- **`doloplus-2` is a bounded observational sum** (0–30) across the somatic /
  psychomotor / psychosocial domains, mapped to the published **≥ 5** pain
  threshold; the domain subtotals and the threshold boundary (**4→5**) are
  unit-tested. It names the 10 items.
- All three render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote
  the source's interpretation; **none authors an analgesic/dosing/treatment order
  in Sophie's voice** ([spec-v11](spec-v11.md) §5.3) — each reports the score and
  the published interpretation, and the decision stays with the clinician and local
  pain protocol. All three flow through the [spec-v59](spec-v59.md) fuzz harness
  with **zero non-finite leaks** (each is a bounded sum of small-integer items; no
  division, no NaN).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** `abbey-pain`, `cnpi`, and `doloplus-2` are all
  **Class A** — fixed observational scoring cited by journal + authors. None names
  a society/consensus issuer that trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson), so none requires a
  `docs/citation-staleness.md` row. (The implementing session confirms this at
  build time rather than from this document.)
- **Build & gates (§6.1/§6.2):** the three computes live in the new
  `lib/ltcga-v175.js` module (`abbeyPain`, `cnpi`, `doloplus2`), added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list and fuzzed for the
  [spec-v59](spec-v59.md) zero-non-finite-leak contract. Renderers live in the new
  `views/group-v175.js` module; its `RV175` export is spread into the `app.js`
  `RENDERERS` map. Every input carries a real `<label for>`; `cnpi`'s
  rest-vs-movement field pairs are individually labeled. The catalog count moves on
  all **13 catalog-truth surfaces** ([spec-v46](spec-v46.md)) in the same change,
  using the **live `UTILITIES.length` + delta**; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass for
  `views/group-v175.js`.

## 5. Files touched

```
docs/spec-v175.md                        (this file)
app.js                                   (+3 UTILITIES rows, group G; import group-v175 RV175 into RENDERERS)
lib/ltcga-v175.js                        (new module: abbeyPain, cnpi, doloplus2)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to painad, cpot)
views/group-v175.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows for the three sources)
test/unit/abbey-pain.test.js, cnpi.test.js, doloplus-2.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v175.js to MODULES)
docs/audits/v12/abbey-pain.md, cnpi.md, doloplus-2.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+3; record v175 under the LTC-GA program)
CHANGELOG.md                             (Unreleased: v175 entry, +3)
README.md, package.json                  (catalog count live -> live+3; spec-progression line -> v175)
```

## 6. Acceptance criteria

v175 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all three ids (`abbey-pain`, `cnpi`, `doloplus-2`) are
  absent.
- All 3 tiles in §2 are live (Group G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — each
  with a **band-flip** — including:
  - an **Abbey 7→8 mild→moderate boundary** worked example (and a 13→14 moderate→
    severe edge),
  - a **DOLOPLUS-2 4→5 no-pain→pain-threshold** worked example,
  - a **CNPI rest-vs-movement** worked example (e.g., 0 indicators at rest, several
    with movement → the combined total and the rest/movement split),
  - a [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3
    check.
- `cnpi` carries two independent 0–6 condition sums and a 0–12 combined total and
  never conflates rest with movement; blank inputs render a complete-the-fields
  fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **live count + 3** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records v175 under the
  LTC-GA program.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v175 with the +3 catalog delta.

## 7. Out of scope for v175

- **No PACSLAC (Pain Assessment Checklist for Seniors with Limited Ability to
  Communicate)** — the instrument is **licensed/copyright-gated** and not
  redistributable, failing the [spec-v97](spec-v97.md) free-reproducibility bar
  ([spec-v100](spec-v100.md) §8); excluded by design.
- **No FLACC** — `flacc` (Face, Legs, Activity, Cry, Consolability) is **already a
  live tile** and is paediatric-oriented; it is not re-shipped and the elder
  observational scales here do not duplicate it.
- **No PAINAD** — `painad` is **already live**; v175 does not re-ship it. Abbey,
  DOLOPLUS-2, and CNPI are the **additional validated observational scales** that
  LTC pain protocols frequently mandate — Abbey/DOLOPLUS-2 because a facility's
  policy may name them specifically, and CNPI because it structures the
  with-movement assessment PAINAD does not — and none duplicates `painad` or
  `cpot`.
- **No automatic analgesic/dosing/treatment order** — each tile reports the score
  and the source's interpretation; the decision stays with the clinician and local
  pain protocol ([spec-v11](spec-v11.md) §5.3, [spec-v50](spec-v50.md) §3).
