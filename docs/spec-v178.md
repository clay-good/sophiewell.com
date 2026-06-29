# spec-v178.md — Geriatric nutrition & dysphagia: GNRI, Onodera PNI, CONUT, SNAQ, EAT-10, and the DETERMINE checklist (+6 tiles)

> Status: **SHIPPED 6 of 6 (2026-06-29).** Sixth implementation spec of the
> spec-v172 LTC-GA program; all six tiles (`gnri`, `pni-onodera`, `conut` in
> Group E; `snaq`, `eat-10`, `determine` in Group G) are live. Every coefficient,
> cut-point, and band was re-fetched and cross-verified against ≥ 2 sources
> (spec-v97); the GNRI ideal-body-weight denominator is positive-guarded and the
> DETERMINE item weights are verbatim from the ACL/NSI checklist. Original draft
> below.
>
> **PROPOSED (2026-06-24).** Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program (§3.6) — the geriatric nutrition & dysphagia cluster. Adds **6**
> deterministic nutrition and swallow-screen instruments that fill confirmed gaps
> in the long-term-care surface. None duplicates a live tile.
>
> Catalog effect: **live `UTILITIES.length` + 6 tiles** (nominal program node
> per [spec-v172](spec-v172.md) §3.6; the catalog-truth gate enforces the live
> count + delta, never a number copied from the umbrella — the running counts
> carry a known off-by-one).
>
> Every prior spec (v4 through v177) remains in force. v178 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. **Every weight, coefficient,
> band, and lookup row is re-fetched and cross-verified against ≥2 independent
> sources at implementation** ([spec-v97](spec-v97.md)); nothing here is
> implemented from recall.

## 1. Thesis

v178 closes the geriatric-nutrition and dysphagia gap that the live general/ICU
nutrition screens (`must-nutrition`, `nrs2002`, `mnutric`, `nutric`) do not cover.
The live screens are admission/ICU triage tools; the long-term-care home runs on a
different, overlapping set — the **lab-based geriatric indices** (GNRI, Onodera PNI,
CONUT), the **appetite screen** (SNAQ), the **patient dysphagia self-report**
(EAT-10), and the **community-elder checklist** (DETERMINE). The GNRI/PNI/CONUT
indices are pure formulas (albumin ± weight, cholesterol, lymphocyte count) and sit
in **Group E** ([spec-v172](spec-v172.md) §5); the three questionnaire/checklist
instruments are bounded sums mapped to published bands in **Group G**. EAT-10 is the
patient self-report swallow screen and is complementary to the live `guss` (the
clinician swallow test) — both are kept, cross-linked.

- **GNRI** — the Geriatric Nutritional Risk Index, a serum-albumin + weight/
  ideal-weight formula with four published risk bands.
- **Onodera PNI** — the Prognostic Nutritional Index = 10·albumin + 0.005·lymphocyte
  count, with the published risk threshold.
- **CONUT** — the Controlling Nutritional Status score (albumin + total cholesterol +
  total lymphocyte count) → 0–12 with four published bands.
- **SNAQ** — the Simplified Nutritional Appetite Questionnaire, 4 appetite items
  (4–20), ≤14 predicting clinically significant weight loss.
- **EAT-10** — the Eating Assessment Tool, a 10-item dysphagia self-screen (0–40),
  ≥3 abnormal.
- **DETERMINE** — the DETERMINE Nutritional Health Checklist (Nutrition Screening
  Initiative), 10 weighted yes items (0–21) → good/moderate/high nutritional risk.

## 2. What v178 adds (6 tiles)

### 2.1 `gnri` — Geriatric Nutritional Risk Index

- **Citation:** Bouillanne O, Morineau G, Dupont C, et al. Geriatric Nutritional
  Risk Index: a new index for evaluating at-risk elderly medical patients. *Am J
  Clin Nutr.* 2005;82(4):777-783.
- **citationUrl:** https://doi.org/10.1093/ajcn/82.4.777
- **Group:** Clinical Math & Conversions (`E`) — lab-based formula
  ([spec-v172](spec-v172.md) §5).
- **Specialties:** `geriatrics`, `nutrition`, `internal-medicine`.
- **Inputs:** serum albumin (g/L), actual body weight, height + sex (for ideal body
  weight via the Lorentz equations).
- **Output:** the **GNRI value** via GNRI = [1.489 × serum albumin (g/L)] + [41.7 ×
  (body weight / ideal body weight)], where the weight/ideal ratio is **capped at 1**
  and ideal body weight is computed by the **Lorentz equations**. Bands: **>98 no
  risk, 92–98 low risk, 82 to <92 moderate risk, <82 major risk** (verify at
  implementation, [spec-v97](spec-v97.md)). Class A. The division by ideal body weight
  is finite-/positive-guarded → surfaced `valid:false`, never `NaN`
  ([spec-v59](spec-v59.md)). Cross-links `must-nutrition`.

### 2.2 `pni-onodera` — Onodera Prognostic Nutritional Index

- **Citation:** Onodera T, Goseki N, Kosaki G. Prognostic nutritional index in
  gastrointestinal surgery of malnourished cancer patients. *Nihon Geka Gakkai
  Zasshi.* 1984;85(9):1001-1005.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/6438478/ (verify locator at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Math & Conversions (`E`) — lab-based formula
  ([spec-v172](spec-v172.md) §5).
- **Specialties:** `geriatrics`, `nutrition`, `internal-medicine`.
- **Inputs:** serum albumin (g/dL) and total lymphocyte count (per mm³).
- **Output:** the **PNI value** via PNI = [10 × serum albumin (g/dL)] + [0.005 ×
  total lymphocyte count (per mm³)]; **<40 (or <45 in some series) indicates
  increased nutritional/surgical risk** (verify the operative threshold at
  implementation, [spec-v97](spec-v97.md)). Class A. The compute is finite-guarded on
  both inputs → surfaced `valid:false`, never `NaN` ([spec-v59](spec-v59.md)).
  Cross-links `must-nutrition`.

### 2.3 `conut` — Controlling Nutritional Status score

- **Citation:** Ignacio de Ulíbarri J, González-Madroño A, de Villar NGP, et al.
  CONUT: a tool for controlling nutritional status. First validation in a hospital
  population. *Nutr Hosp.* 2005;20(1):38-45.
- **citationUrl:** https://pubmed.ncbi.nlm.nih.gov/15762418/ (verify at
  implementation, [spec-v97](spec-v97.md))
- **Group:** Clinical Math & Conversions (`E`) — lab-based formula
  ([spec-v172](spec-v172.md) §5).
- **Specialties:** `geriatrics`, `nutrition`, `internal-medicine`.
- **Inputs:** serum albumin, total cholesterol, and total lymphocyte count (points
  assigned from each per the published cut-point table).
- **Output:** the **CONUT total (0–12)** with the published bands **0–1 normal, 2–4
  mild, 5–8 moderate, 9–12 severe** nutritional risk (verify the per-analyte
  point thresholds and band edges at implementation, [spec-v97](spec-v97.md)). Class
  A. Each analyte's contribution is named; non-finite inputs surface `valid:false`,
  never `NaN` ([spec-v59](spec-v59.md)). Cross-links `must-nutrition`.

### 2.4 `snaq` — Simplified Nutritional Appetite Questionnaire

- **Citation:** Wilson MM, Thomas DR, Rubenstein LZ, et al. Appetite assessment:
  simple appetite questionnaire predicts weight loss in community-dwelling adults and
  nursing home residents. *Am J Clin Nutr.* 2005;82(5):1074-1081.
- **citationUrl:** https://doi.org/10.1093/ajcn/82.5.1074
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nutrition`, `nursing-general`, `primary-care`.
- **Inputs:** the 4 appetite items each **1–5** — appetite, feeling full, food
  taste, number of meals per day.
- **Output:** the **SNAQ total (4–20)** with the published interpretation **≤14
  predicts ≥5% weight loss within 6 months** (verify the cut-point at implementation,
  [spec-v97](spec-v97.md)). Class A. **Disambiguation:** this is the *Simplified
  Nutritional Appetite Questionnaire* (the appetite questionnaire, Wilson 2005) — it
  is **not** the similarly named *Short Nutritional Assessment Questionnaire*; the
  tile cites and computes the appetite questionnaire only. Cross-links
  `must-nutrition`.

### 2.5 `eat-10` — Eating Assessment Tool (dysphagia self-screen)

- **Citation:** Belafsky PC, Mwamba D, Rees CJ, et al. Validity and reliability of
  the Eating Assessment Tool (EAT-10). *Ann Otol Rhinol Laryngol.* 2008;117(12):
  919-924.
- **citationUrl:** https://doi.org/10.1177/000348940811701210
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `speech-language-pathology`, `nursing-rehab`,
  `primary-care`.
- **Inputs:** the 10 self-report items each **0–4** (no problem → severe problem).
- **Output:** the **EAT-10 total (0–40)** with the published interpretation **≥3
  indicates abnormal swallowing / risk of aspiration** (verify at implementation,
  [spec-v97](spec-v97.md)). Class A. Cross-links `guss` — the live clinician swallow
  test; EAT-10 is the **patient self-report** complement.

### 2.6 `determine` — DETERMINE Nutritional Health Checklist

- **Citation:** Posner BM, Jette AM, Smith KW, Miller DR. Nutrition and health risks
  in the elderly: the nutrition screening initiative. *Am J Public Health.*
  1993;83(7):972-978; AAFP/American Dietetic Association/National Council on Aging
  **Nutrition Screening Initiative**, 1991.
- **citationUrl:** https://doi.org/10.2105/AJPH.83.7.972
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nutrition`, `nursing-general`, `primary-care`.
- **Inputs:** the 10 weighted yes/no checklist items (disease, eating poorly, tooth/
  mouth pain, economic hardship, reduced social contact, multiple medications,
  involuntary weight change, needs assistance with self-care, age >80 — each with its
  published weight).
- **Output:** the **DETERMINE total (0–21)** with the published bands **0–2 good, 3–5
  moderate nutritional risk, ≥6 high nutritional risk** (verify the per-item weights
  and band edges at implementation, [spec-v97](spec-v97.md)). Class A. Cross-links
  `must-nutrition`.

## 3. Per-tile robustness

- **`gnri`, `pni-onodera`, and `conut` are guarded formulas.** GNRI divides body
  weight by ideal body weight (Lorentz); that denominator and the albumin term are
  finite- and positive-checked, the weight/ideal ratio is capped at 1, and a
  non-finite/zero denominator returns a surfaced `valid:false` fallback rather than
  `Infinity`/`NaN` ([spec-v59](spec-v59.md)). PNI multiplies finite-checked albumin
  and lymphocyte terms; CONUT maps each of albumin, cholesterol, and lymphocyte count
  through the published cut-point table. All three are run through the
  [spec-v59](spec-v59.md) fuzz harness for the division/overflow paths (zero
  non-finite leaks), and each names which contributors produced the value/points.
- **`snaq`, `eat-10`, and `determine` are bounded sums** mapped to published bands;
  SNAQ sums four 1–5 items (4–20), EAT-10 sums ten 0–4 items (0–40), DETERMINE sums
  the ten weighted yes items (0–21). Band boundaries are unit-tested at each edge, and
  each names the items counted.
- All six render the [spec-v50](spec-v50.md) §3 clinical-posture note and quote the
  source's interpretation; **none authors a diet, feeding, or treatment order in
  Sophie's voice** ([spec-v11](spec-v11.md) §5.3); all flow through the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks. Every coefficient,
  cut-point, and band is re-fetched and cross-verified against ≥2 independent sources
  at implementation ([spec-v97](spec-v97.md)).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md)
§6):

- **Maintenance classes (§6.3):** all six tiles — `gnri`, `pni-onodera`, `conut`,
  `snaq`, `eat-10`, `determine` — are **Class A**: fixed formulas/constants and
  bounded weighted sums cited by journal + authors. The Nutrition Screening
  Initiative consortium (AAFP/ADA/NCOA) named in the `determine` citation is a
  professional-organization issuer; the implementing session **confirms at build time
  whether it trips `ISSUER_PATTERN`** ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)
  lesson) and, if so, adds a `docs/citation-staleness.md` row naming the 1991/1993
  edition, the `accessed` date, and the review cadence (otherwise the staleness note
  is documentation-only).
- **Build & gates (§6.1/§6.2):** the six computes live in the new
  `lib/ltcga-v178.js` module (`gnri`, `pniOnodera`, `conut`, `snaq`, `eat10`,
  `determine`), added to the `test/unit/fuzz-tools.test.js` `MODULES` list — `gnri`,
  `pni-onodera`, and `conut` **explicitly fuzzed for the division/overflow paths**
  (zero non-finite leaks). Renderers live in the new `views/group-v178.js` module; its
  `RV178` export is spread into the `app.js` `RENDERERS` map. Every input carries a
  real `<label for>`. The catalog count moves on all **13 catalog-truth surfaces**
  ([spec-v46](spec-v46.md)) in the same change, using the **live `UTILITIES.length` +
  6**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v178.js`.
- **Program note:** v178 is the §3.6 node of the [spec-v172](spec-v172.md) LTC-GA
  program; `scope-mdcalc-parity.md` records the v178 delta within that program band.

## 5. Files touched

```
docs/spec-v178.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v178 RV178 into RENDERERS)
lib/ltcga-v178.js                        (new module: gnri, pniOnodera, conut, snaq, eat10, determine)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to must-nutrition, nrs2002, mnutric, nutric, guss)
views/group-v178.js                      (new renderer module: 6 renderers, RV178)
docs/clinical-citations.md               (+6 rows for the six sources)
docs/citation-staleness.md               (+ row: determine — only if the Nutrition Screening Initiative issuer trips ISSUER_PATTERN at build time)
test/unit/gnri.test.js, pni-onodera.test.js, conut.test.js, snaq.test.js, eat-10.test.js, determine.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v178.js to MODULES; gnri/pni-onodera/conut fuzzed for the division paths)
docs/audits/v12/gnri.md, pni-onodera.md, conut.md, snaq.md, eat-10.md, determine.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+6; record under the spec-v172 LTC-GA program band v173-v182)
CHANGELOG.md                             (Unreleased: v178 entry, +6)
README.md, package.json                  (catalog count live -> live+6; spec-progression line -> v178)
```

## 6. Acceptance criteria

v178 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live (groups E/G) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — each with
  a band-flip, **including a GNRI 92 low↔moderate boundary, a CONUT 4→5 mild→moderate
  flip, an EAT-10 2→3 abnormal flip, and a worked GNRI with serum albumin entered in
  g/L vs g/dL noted to avoid the 10× unit trap** — a [spec-v11](spec-v11.md) audit
  log, and a passing [spec-v29](spec-v29.md) §3 check.
- `gnri`, `pni-onodera`, and `conut` guard their division/finite paths; blank inputs
  render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md) fuzz
  harness with zero non-finite leaks.
- If the `determine` issuer trips `ISSUER_PATTERN` at build time, it carries
  `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **live count + 6** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the v178 delta
  under the spec-v172 LTC-GA program band.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v178 with the +6 catalog delta.

## 7. Out of scope for v178

- **No MNA / MNA-SF** — the Mini Nutritional Assessment and its short form are a
  **Nestlé Nutrition Institute trademark**, excluded per [spec-v172](spec-v172.md)
  §4; GNRI/PNI/CONUT/SNAQ are the free geriatric-nutrition substitutes v178 ships.
- **No duplication of the live general/ICU nutrition screens** — `must-nutrition`,
  `nrs2002`, `mnutric`, and `nutric` stay as-is and are cross-linked, not re-shipped;
  v178 adds the LTC-specific lab indices, appetite screen, and checklist they do not
  cover.
- **No duplication of the live clinician swallow test** — `guss` is the live
  bedside clinician swallow assessment; `eat-10` is the patient self-report dysphagia
  screen and is complementary (both kept, cross-linked).
- **No automatic diet/feeding/treatment order** — each tile reports the score/index
  and the source's interpretation; the decision stays with the clinician, dietitian,
  and local protocol ([spec-v11](spec-v11.md) §5.3).
```
