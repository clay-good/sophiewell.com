# spec-v143.md — Frailty & geriatric-oncology screening: mFI-5, mFI-11, FRAIL Scale, VES-13, and CARG chemo-toxicity (+5 tiles)

> Status: **SHIPPED (2026-06-23, 641 → 646).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 8**
> (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy). Adds **5**
> deterministic frailty and geriatric-oncology screening instruments that fill
> confirmed gaps. None duplicates a live tile.
>
> Catalog effect at v143 close: **643 + 5 = 648 tiles** (or live count + 5 if
> specs land out of order; the catalog-truth gate enforces agreement).
>
> Every prior spec (v4 through v142) remains in force. v143 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the comorbidity and frailty *anchors* — `charlson` (Charlson
Comorbidity Index) and `cfs` (Clinical Frailty Scale) — but the **frailty panel
itself is not deepened**. The [spec-v100](spec-v100.md) §7 deepening backlog
explicitly pairs `charlson`/`cfs` with a frailty/comorbidity panel; v143 ships it.
The accumulated-deficit indices (mFI-5, mFI-11) are the free, published surrogates
for the proprietary ACS-NSQIP surgical-risk calculator; the FRAIL Scale and
VES-13 are bedside screens; and the CARG tool is the standard pre-chemotherapy
toxicity predictor for older adults. Each sits beside `charlson`/`cfs` and the
oncology cluster (`ecog-karnofsky`, `carg`-adjacent).

- **mFI-5** — the Modified 5-Item Frailty Index, a deficit count (0–5) from
  diabetes, hypertension, COPD, CHF, and dependent functional status; the
  validated successor that performs comparably to mFI-11.
- **mFI-11** — the original 11-item accumulated-deficit frailty index, reported as
  a fraction (deficits / 11); cross-linked to mFI-5.
- **FRAIL Scale** — Morley's 5-item screen (Fatigue, Resistance, Ambulation,
  Illnesses ≥5, Loss of weight >5%); 0 robust / 1–2 prefrail / ≥3 frail.
- **VES-13** — the Vulnerable Elders Survey, 13 items → 0–10; **≥ 3 = vulnerable**
  (a ≥4-fold risk of functional decline or death).
- **CARG chemo-toxicity** — the Cancer and Aging Research Group tool, a weighted
  predictor of grade 3–5 chemotherapy toxicity in adults ≥65.

## 2. What v143 adds (5 tiles)

### 2.1 `mfi-5` — Modified 5-Item Frailty Index

- **Citation:** Subramaniam S, Aalberg JJ, Soriano RP, Divino CM. The 5-Item
  Modified Frailty Index is equivalent to the 11-Item Modified Frailty Index. *J Am
  Coll Surg.* 2018;226(2):173-181.
- **citationUrl:** https://doi.org/10.1016/j.jamcollsurg.2017.11.005
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `surgery`, `nursing-periop`.
- **Inputs:** the 5 deficits (each 0/1) — diabetes mellitus, hypertension
  requiring medication, COPD/pneumonia history, congestive heart failure, partially
  or totally dependent functional status.
- **Output:** the **deficit count (0–5)** with the published frailty framing (a
  count **≥ 2** is the commonly-cited frailty threshold associated with elevated
  postoperative morbidity/mortality), naming which deficits were counted. Class A.
  Near-neighbor: `charlson`/`cfs` — cross-linked (the frailty/comorbidity panel).

### 2.2 `mfi-11` — Modified 11-Item Frailty Index

- **Citation:** Velanovich V, Antoine H, Swartz A, et al. Accumulating deficits to
  the point of frailty: a national surgical quality improvement program study.
  *J Surg Res.* 2013;183(1):104-110.
- **citationUrl:** https://doi.org/10.1016/j.jss.2013.01.021
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `surgery`, `internal-medicine`.
- **Inputs:** the 11 deficits (each 0/1) — diabetes, dependent functional status,
  COPD/pneumonia, CHF, MI history, prior cardiac intervention/angina, hypertension,
  peripheral vascular disease/rest pain, impaired sensorium, TIA/CVA, CVA with
  deficit.
- **Output:** the **deficit fraction (count / 11)** with the published frailty
  framing, naming which deficits were counted. Class A. Cross-links `mfi-5` (the
  validated 5-item equivalent — both kept; mFI-11 is the original).

### 2.3 `frail-scale` — FRAIL Scale

- **Citation:** Morley JE, Malmstrom TK, Miller DK. A simple frailty questionnaire
  (FRAIL) predicts outcomes in middle aged African Americans. *J Nutr Health
  Aging.* 2012;16(7):601-608.
- **citationUrl:** https://doi.org/10.1007/s12603-012-0084-2
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `internal-medicine`, `nursing-rehab`.
- **Inputs:** the 5 items (each 0/1) — Fatigue, Resistance (climbing one flight),
  Ambulation (walking one block), Illnesses (≥5 of 11 listed), Loss of weight
  (>5%).
- **Output:** the **total (0–5)** mapped to the published bands — **0 = robust,
  1–2 = pre-frail, ≥ 3 = frail** — naming which items were positive. Class A.

### 2.4 `ves-13` — Vulnerable Elders Survey-13

- **Citation:** Saliba D, Elliott M, Rubenstein LZ, et al. The Vulnerable Elders
  Survey: a tool for identifying vulnerable older people in the community. *J Am
  Geriatr Soc.* 2001;49(12):1691-1699.
- **citationUrl:** https://doi.org/10.1046/j.1532-5415.2001.49281.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `oncology`, `internal-medicine`.
- **Inputs:** age band (75–84 = 1, ≥85 = 3 points), self-rated health, the 6
  physical-function limitation items (≤4 limitations = 1 point if any), and the 5
  functional-disability (ADL/IADL) items (any = 4 points).
- **Output:** the **total (0–10)** with the published threshold **≥ 3 =
  vulnerable**, naming which domains contributed. Class A. Cross-links
  `ecog-karnofsky` and `carg-toxicity` (the geriatric-oncology cluster).

### 2.5 `carg-toxicity` — CARG Chemotherapy Toxicity Tool

- **Citation:** Hurria A, Togawa K, Mohile SG, et al. Predicting chemotherapy
  toxicity in older adults with cancer: a prospective multicenter study. *J Clin
  Oncol.* 2011;29(25):3457-3465.
- **citationUrl:** https://doi.org/10.1200/JCO.2011.34.7625
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `geriatrics`, `pharmacy`.
- **Inputs:** the 11 weighted predictors — age ≥72, cancer type (GI/GU), standard-
  dose chemo, polychemotherapy, hemoglobin (low by sex), creatinine clearance
  <34 mL/min, hearing, ≥1 fall in 6 months, needing help with medications, decreased
  social activity, and walking-one-block limitation.
- **Output:** the **CARG total** mapped to the published **low / intermediate /
  high** grade 3–5 toxicity-risk bands (with the source's approximate per-band
  toxicity rate). Class A (fixed 2011 weights). Cross-links `ves-13` and
  `ecog-karnofsky`.

## 3. Per-tile robustness

- **`mfi-5`, `mfi-11`, `frail-scale`, `ves-13`, and `carg-toxicity` are bounded
  weighted/deficit sums** mapped to published bands; each names which deficits/items
  were counted and flows through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.
- **`mfi-11` reports a fraction** (count / 11); the divisor is a fixed constant
  (11), so no division-by-zero path exists; the fraction is rounded for display
  while the underlying count drives any threshold logic.
- **`carg-toxicity` derives its creatinine-clearance input** from a banded select
  (<34 vs ≥34 mL/min) rather than recomputing CrCl, keeping the tile deterministic
  and avoiding shadowing `cockcroft-gault`; the renderer cross-links the existing
  CrCl tile so the clinician can compute the value there.
- A blank required item renders a complete-the-fields fallback rather than scoring
  a partial total as if the blanks were zero.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treat/withhold-chemo recommendation in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** — fixed derivation
  papers and item weights. Each citation names the **journal + authors** (not an
  issuing society), so none trips the `ISSUER_PATTERN` and **none needs a
  `docs/citation-staleness.md` row**.
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/frailty-v143.js` module (`mfi5`, `mfi11`, `frailScale`, `ves13`,
  `cargToxicity`), added to the `test/unit/fuzz-tools.test.js` `MODULES` list (zero
  non-finite leaks). Renderers live in the new `views/group-v143.js` module; its
  `RV143` export is spread into the `app.js` `RENDERERS` map. The catalog count
  moves on all **13 catalog-truth surfaces** in the same change; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v143.js`.

## 5. Files touched

```
docs/spec-v143.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v143 RV143 into RENDERERS)
lib/frailty-v143.js                      (new module: mfi5, mfi11, frailScale, ves13, cargToxicity)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to charlson, cfs, ecog-karnofsky, cockcroft-gault)
views/group-v143.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/mfi-5.test.js, mfi-11.test.js, frail-scale.test.js, ves-13.test.js, carg-toxicity.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/frailty-v143.js to MODULES)
docs/audits/v12/mfi-5.md, mfi-11.md, frail-scale.md, ves-13.md, carg-toxicity.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 643 -> 648; advance the spec-v100 running ledger)
CHANGELOG.md                             (Unreleased: v143 entry, +5)
README.md, package.json                  (catalog count 643 -> 648; spec-progression line -> v143)
```

## 6. Acceptance criteria

v143 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including an **mFI-5 ≥ 2 frail flip**, a FRAIL **pre-frail→frail (2→3)
  boundary**, a **VES-13 ≥ 3 vulnerable flip**, and a CARG low→intermediate band
  change), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 check.
- Partial inputs render a complete-the-fields fallback; `mfi-11` divides only by the
  fixed constant 11.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is **648** (or live count + 5) and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` advances the spec-v100
  ledger.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v143 with the +5 catalog delta.

## 7. Out of scope for v143

- **No ACS-NSQIP Surgical Risk Calculator** — unpublished coefficients, on the
  [spec-v100](spec-v100.md) §8 permanent-exclusion list; mFI-5/mFI-11 are the free,
  published surrogates this spec ships.
- **No MNA/MNA-SF (Nestlé), Edmonton Frail Scale, or G8** — licensed or
  proprietary instruments excluded per §8; the FRAIL Scale and VES-13 are the free
  bedside screens.
- **No automatic chemo dose-reduction or proceed/defer order** — `carg-toxicity`
  reports the risk band and the source's interpretation; the treatment decision
  stays with the oncologist and local protocol ([spec-v11](spec-v11.md) §5.3).
- **No `charlson`/`cfs` re-implementation** — the existing tiles stand; v143 is the
  panel deepening that cross-links them.
