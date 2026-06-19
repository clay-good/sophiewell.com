# spec-v114.md — COPD/bronchiectasis exacerbation & sleep: DECAF, BAP-65, BSI, FACED, NoSAS, and AHI/ODI severity (+6 tiles)

> Status: **SHIPPED (2026-06-19).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 3 —
> Critical care & pulmonary** ([spec-v100 §4](spec-v100.md)). Adds **6**
> deterministic pulmonary and sleep-medicine decision rules that fill confirmed
> gaps. None duplicates a live tile.
>
> Catalog effect at v114 close: **495 + 6 = 501 tiles.** (The live count at
> implementation was 495, one below the 496 the spec drafts assumed — the
> program's running narrative carried a known off-by-one; the catalog-truth gate
> enforces the live `UTILITIES.length + 6`.)
>
> Implementation note: the source re-fetch corrected three spec-draft values
> (FACED Extension scores at ≥ 3 lobes not ≥ 2; FACED Dyspnea at mMRC ≥ 3 not
> ≥ 2; BSI uses the prior-2-year admission window and the MRC 1–5 dyspnea scale).
> The shipped tiles follow the source.
>
> Every prior spec (v4 through v113) remains in force. v114 adds no runtime
> network call and no AI; each tile obeys the [spec-v100 §2](spec-v100.md)
> doctrine (re-binding [spec-v85 §2](spec-v85.md)) and the
> [spec-v100 §6](spec-v100.md) CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the chronic-airways *staging* tools (`gold-spirometry`,
`bode-index`, `predicted-spirometry`) and a sleep *screen* (`stop-bang`), but six
standard pulmonary and sleep instruments — for acute COPD-exacerbation prognosis,
bronchiectasis severity, and sleep-disordered-breathing classification — are
absent:

- **Acute COPD exacerbation has no DECAF score** — the five-variable in-hospital
  mortality rule for hospitalized AECOPD.
- **AECOPD has no BAP-65 score** — the BUN/Altered-mental-status/Pulse/age-65
  rule that bands mortality and mechanical-ventilation risk.
- **Bronchiectasis has no severity index** — the Bronchiectasis Severity Index
  (BSI) for mortality and hospitalization risk.
- **Bronchiectasis has no FACED score** — the 0–7 FACED severity composite.
- **Sleep has no NoSAS score** — the neck/obesity/snoring/age/sex OSA screen
  (0–17; ≥ 8 high risk), complementary to the existing STOP-BANG.
- **Sleep has no AHI/ODI severity classifier** — the events-per-hour → AASM
  severity band tool (mild/moderate/severe), with the 3% vs 4% ODI distinction.

Each is a published, deterministic instrument a clinician already uses; v114
brings them onto the page. (Per [spec-v100 §8](spec-v100.md), the copyrighted CAT
and ACT are deliberately excluded; the GOLD-ABE deepening uses the free mMRC.)

## 2. What v114 adds (6 tiles)

### 2.1 `decaf-score` — DECAF Score (acute COPD exacerbation)

- **Citation:** Steer J, Gibson J, Bourke SC. The DECAF Score: predicting hospital
  mortality in exacerbations of chronic obstructive pulmonary disease. *Thorax.*
  2012;67(11):970-976.
- **citationUrl:** https://doi.org/10.1136/thoraxjnl-2012-202103
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `emergency-medicine`,
  `respiratory-therapy`.
- **Inputs:** eMRCD dyspnea grade (0/1/2), eosinopenia < 0.05 ×10⁹/L (1),
  consolidation (1), acidemia pH < 7.30 (1), atrial fibrillation (1).
- **Output:** the **total (0–6)** with the published low / intermediate / high
  in-hospital mortality bands, naming the variables counted. Class A (fixed point
  weights). Cross-links `gold-spirometry`.

### 2.2 `bap-65` — BAP-65 Score (acute COPD exacerbation)

- **Citation:** Tabak YP, Sun X, Johannes RS, Gupta V, Shorr AF. Mortality and
  need for mechanical ventilation in acute exacerbations of chronic obstructive
  pulmonary disease: development and validation of a simple risk score. *Arch
  Intern Med.* 2009;169(17):1595-1602.
- **citationUrl:** https://doi.org/10.1001/archinternmed.2009.270
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `emergency-medicine`, `internal-medicine`,
  `respiratory-therapy`.
- **Inputs:** BUN ≥ 25 mg/dL, altered mental status, pulse ≥ 109/min (the three
  acute variables), and age > 65 (the class modifier).
- **Output:** the **BAP-65 class (I–V)** — 0/1/2/3 acute variables build classes
  I–IV, with age > 65 promoting class — and the per-class mortality and
  mechanical-ventilation risk, naming the variables met. Class A (fixed
  structure). Cross-links `decaf-score`.

### 2.3 `bronchiectasis-bsi` — Bronchiectasis Severity Index

- **Citation:** Chalmers JD, Goeminne P, Aliberti S, et al. The bronchiectasis
  severity index. An international derivation and validation study. *Am J Respir
  Crit Care Med.* 2014;189(5):576-585.
- **citationUrl:** https://doi.org/10.1164/rccm.201309-1575OC
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `respiratory-therapy`.
- **Inputs:** age, BMI, predicted FEV₁ %, prior hospitalization, exacerbations in
  the prior year, MRC dyspnea, *Pseudomonas* colonization, other-organism
  colonization, and radiographic lobe involvement (≥ 3 lobes / cystic), each
  weighted per the published table.
- **Output:** the **BSI total** with the low / intermediate / high mortality and
  hospitalization bands, naming the weighted items. Class A (fixed weights).
  Cross-links `faced-bronchiectasis`.

### 2.4 `faced-bronchiectasis` — FACED Score

- **Citation:** Martínez-García MÁ, de Gracia J, Vendrell Relat M, et al.
  Multidimensional approach to non-cystic-fibrosis bronchiectasis: the FACED
  score. *Eur Respir J.* 2014;43(5):1357-1367.
- **citationUrl:** https://doi.org/10.1183/09031936.00026313
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `respiratory-therapy`.
- **Inputs:** FEV₁ < 50% predicted (2), Age ≥ 70 (2), Chronic *Pseudomonas*
  colonization (1), Extension ≥ 2 lobes (1), Dyspnea mMRC ≥ 2 (1).
- **Output:** the **total (0–7)** with the mild / moderate / severe bands, naming
  the FACED components met. Class A (fixed point weights). Cross-links
  `bronchiectasis-bsi`.

### 2.5 `nosas-score` — NoSAS Score (OSA screen)

- **Citation:** Marti-Soler H, Hirotsu C, Marques-Vidal P, et al. The NoSAS score
  for screening of sleep-disordered breathing: a derivation and validation study.
  *Lancet Respir Med.* 2016;4(9):742-748.
- **citationUrl:** https://doi.org/10.1016/S2213-2600(16)30075-3
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** neck circumference > 40 cm (4), BMI 25–< 30 (3) or ≥ 30 (5), snoring
  (2), age > 55 (4), male sex (2).
- **Output:** the **total (0–17)** with the **≥ 8 high risk** threshold for
  sleep-disordered breathing, naming the components scored. Class A (fixed point
  weights). Cross-links the existing `stop-bang`.

### 2.6 `ahi-odi-severity` — AHI / ODI Severity Classifier

- **Citation:** Sleep-related breathing disorders in adults: recommendations for
  syndrome definition and measurement techniques in clinical research. The Report
  of an American Academy of Sleep Medicine Task Force. *Sleep.*
  1999;22(5):667-689 (the AASM AHI severity bands).
- **citationUrl:** https://doi.org/10.1093/sleep/22.5.667
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `nursing-icu`.
- **Inputs:** apnea-hypopnea index (events/hr) and, optionally, the oxygen
  desaturation index with a 3%-vs-4% desaturation-criterion toggle.
- **Output:** the **AASM severity band** — normal < 5, mild 5–< 15, moderate
  15–< 30, severe ≥ 30 — with the ODI band shown alongside and the
  desaturation-criterion stated. Class B (the AASM scoring criteria are revisable
  → `docs/citation-staleness.md` row, on-publication cadence).

## 3. Per-tile robustness

- **All six are criteria/threshold logic** with bounded sums or band lookups; they
  flow through the [spec-v59](spec-v59.md) fuzz harness and name which components
  were counted. `bap-65` builds its class from the acute-variable count with the
  age modifier applied last; `ahi-odi-severity` clamps a negative or non-finite
  events/hr to a surfaced fallback before band lookup.
- **Band lookups are total-keyed, not interpolated.** `decaf-score`,
  `faced-bronchiectasis`, `bronchiectasis-bsi`, and `nosas-score` map the integer
  total to a published band; a blank required item renders a complete-the-fields
  fallback rather than scoring it as 0.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js`.

## 4. CI/CD & maintenance

Per the [spec-v100 §6](spec-v100.md) contract (re-binding [spec-v85 §6](spec-v85.md)):

- **Maintenance classes (§6.3):** `decaf-score`, `bap-65`, `bronchiectasis-bsi`,
  `faced-bronchiectasis`, and `nosas-score` are **Class A** (fixed derivation-paper
  point weights), citing the **journal and authors** (Steer/Thorax, Tabak/Arch
  Intern Med, Chalmers/AJRCCM, Martínez-García/ERJ, Marti-Soler/Lancet Respir Med),
  so the `check-citations.mjs` `ISSUER_PATTERN` does **not** trip a staleness row —
  **none needed.** `ahi-odi-severity` is **Class B** (the **AASM** scoring criteria
  are revisable, and the citation names the society) — it gets a
  `docs/citation-staleness.md` row naming the edition in force (1999 AASM Task
  Force bands; note the 2012 AASM scoring-manual revisions), the `accessed` date,
  and an on-publication review cadence, monitored by the existing
  `scripts/check-citation-cadence.mjs` warn-job.
- **Gates (§6.2):** `lib/pulm-v114.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks; the
  `ahi-odi-severity` band lookup explicitly fuzzed for negative/non-finite AHI);
  each `META` example is pinned by the chromium `example-correctness` sweep; the
  catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v39.js`.
- **Renderer numbering (§6.1):** v114 claims `views/group-v39.js` and adds its
  `RV39` export to the `app.js` `RENDERERS` spread.

## 5. Files touched

```
docs/spec-v114.md                        (this file)
app.js                                   (+6 UTILITIES rows, group G; import group-v39 renderers into RENDERERS)
lib/pulm-v114.js                         (new module: decafScore, bap65, bronchiectasisBsi, facedBronchiectasis, nosasScore, ahiOdiSeverity)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to gold-spirometry, bode-index, stop-bang)
views/group-v39.js                       (new renderer module: 6 renderers; incl. the NoSAS BMI band selector and the AHI/ODI 3%-vs-4% toggle)
docs/citation-staleness.md               (+ row: ahi-odi-severity AASM 1999/2012 scoring criteria)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/decaf-score.test.js, bap-65.test.js, bronchiectasis-bsi.test.js, faced-bronchiectasis.test.js, nosas-score.test.js, ahi-odi-severity.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pulm-v114.js to MODULES)
docs/audits/v12/decaf-score.md, bap-65.md, bronchiectasis-bsi.md, faced-bronchiectasis.md, nosas-score.md, ahi-odi-severity.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 496 -> 502; Wave 3 running ledger)
CHANGELOG.md                             (Unreleased: v114 entry, +6)
README.md, package.json                  (catalog count 496 -> 502; spec-progression line -> v114)
```

## 6. Acceptance criteria

v114 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all six ids are absent from the then-current catalog.
- All 6 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a DECAF class boundary between mortality bands, a BAP-65 class
  promotion at age > 65, a BSI flipping low→high, a FACED crossing into severe, a
  NoSAS crossing ≥ 8, and an AHI crossing 15 and 30), a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Band lookups are total-keyed; partial inputs render a complete-the-fields
  fallback; `ahi-odi-severity` guards a negative/non-finite AHI.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `ahi-odi-severity` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **502** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v114 with the +6 catalog delta.

## 7. Out of scope for v114

- **No CAT, ACT, SGRQ, or St George's** — these are copyrighted and permanently
  excluded ([spec-v100 §8](spec-v100.md)); the GOLD-ABE deepening
  ([spec-v100 §7](spec-v100.md)) uses the free mMRC instead.
- **No polysomnography or oximetry parsing** — `ahi-odi-severity` takes the
  scored AHI/ODI events/hr, not a sleep-study feed.
- **No auto-admission, auto-ventilation, or auto-CPAP order** — each tile reports
  the score/class and the source's stated interpretation; the
  admit/ventilate/refer-for-sleep-study decision stays with the clinician and
  local protocol ([spec-v11](spec-v11.md) §5.3).
- **No `gold-spirometry` or `stop-bang` re-implementation** — the existing tiles
  stand; v114 cross-links them (DECAF/BAP-65 beside GOLD; NoSAS beside STOP-BANG).
