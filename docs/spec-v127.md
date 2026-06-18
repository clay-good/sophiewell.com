# spec-v127.md — Nephrology prognosis & AKI staging: KFRE, RIFLE, AKIN, and ultrafiltration rate (+4 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 5** (GI / hepatology / nephrology /
> acid-base / urology). Adds **4** deterministic nephrology prognosis and AKI-staging
> instruments that fill confirmed gaps beside `egfr-suite` and the existing dialysis
> math. None duplicates a live tile.
>
> Catalog effect: **556 + 4 = 560 tiles.**
>
> Every prior spec (v4 through v126) remains in force. v127 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding the [spec-v85](spec-v85.md) §2 doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog estimates kidney function (`egfr-suite`, `ckd-staging`) and does some
dialysis math (`ktv-urr`), but the **prognostic** and **acute-injury-staging**
instruments nephrologists and intensivists reach for are absent:

- **There is no Kidney Failure Risk Equation (KFRE)** — the Tangri 4-/8-variable model
  that gives the 2- and 5-year probability of treated kidney failure in CKD G3–G5; it
  sits beside the existing `ckd-staging`.
- **There is no RIFLE AKI staging** — the original consensus AKI definition (Risk/
  Injury/Failure by creatinine, GFR, and urine output).
- **There is no AKIN AKI staging** — the AKIN stages 1–3 refinement on the 48-hour
  creatinine-rise window; a near-neighbor of RIFLE and the existing `kdigo-aki`.
- **There is no ultrafiltration-rate tile** — the fluid-removal-rate-per-kg
  calculation with the > 13 mL/kg/hr cardiovascular-risk threshold.

Each is a published, deterministic instrument; v127 brings the nephrology
prognosis/AKI surface to parity.

## 2. What v127 adds (4 tiles)

### 2.1 `kfre` — Kidney Failure Risk Equation

- **Citation:** Tangri N, Stevens LA, Griffith J, et al. A predictive model for
  progression of chronic kidney disease to kidney failure. *JAMA.*
  2011;305(15):1553-1559.
- **citationUrl:** https://doi.org/10.1001/jama.2011.451
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `internal-medicine`, `dialysis-nursing`.
- **Inputs:** age, sex, eGFR (mL/min/1.73 m²), and urine albumin-to-creatinine ratio
  (mg/g); optional 8-variable mode adds calcium, phosphate, bicarbonate, and albumin.
- **Output:** the **2-year and 5-year probability of treated kidney failure** via the
  published logistic/risk form (`1 − S₀^exp(Σβx − mean)`), reporting both horizons.
  Class A (fixed 2011 coefficients and baseline survivals). Cross-links `ckd-staging`
  and `egfr-suite`.

### 2.2 `rifle-aki` — RIFLE criteria for AKI

- **Citation:** Bellomo R, Ronco C, Kellum JA, et al; Acute Dialysis Quality
  Initiative workgroup. Acute renal failure — definition, outcome measures, animal
  models, fluid therapy and information technology needs: the Second International
  Consensus Conference of the ADQI Group. *Crit Care.* 2004;8(4):R204-R212.
- **citationUrl:** https://doi.org/10.1186/cc2872
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `critical-care`, `nursing-icu`,
  `internal-medicine`.
- **Inputs:** baseline and current creatinine (or GFR change) and the urine-output
  history (mL/kg/hr over a time window).
- **Output:** the **RIFLE class — Risk, Injury, or Failure** (the worst of the
  creatinine/GFR and urine-output criteria), naming which criterion governed.
  Class A (the ADQI consensus criteria are a fixed definition; citation names the
  journal and authors, not a society). Cross-links the existing `kdigo-aki`.

### 2.3 `akin-aki` — AKIN criteria for AKI

- **Citation:** Mehta RL, Kellum JA, Shah SV, et al; Acute Kidney Injury Network.
  Acute Kidney Injury Network: report of an initiative to improve outcomes in acute
  kidney injury. *Crit Care.* 2007;11(2):R31.
- **citationUrl:** https://doi.org/10.1186/cc5713
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `critical-care`, `nursing-icu`,
  `internal-medicine`.
- **Inputs:** the creatinine rise over the 48-hour window (absolute ≥ 0.3 mg/dL or the
  fold-increase) and the urine-output history.
- **Output:** the **AKIN stage — 1, 2, or 3** (the worse of the creatinine and urine-
  output criteria; RRT initiation forces stage 3), naming the governing criterion.
  Class A. Cross-links `rifle-aki` and `kdigo-aki`.

### 2.4 `ufr-dialysis` — Ultrafiltration rate

- **Citation:** Flythe JE, Kimmel SE, Brunelli SM. Rapid fluid removal during dialysis
  is associated with cardiovascular morbidity and mortality. *Kidney Int.*
  2011;79(2):250-257.
- **citationUrl:** https://doi.org/10.1038/ki.2010.383
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nephrology`, `dialysis-nursing`, `critical-care`.
- **Inputs:** ultrafiltration volume (L or mL), session duration (hr), and
  post-dialysis (dry) weight (kg).
- **Output:** the **UF rate = volume ÷ (hours × weight)** in mL/kg/hr, with the
  published cardiovascular-risk threshold (> 13 mL/kg/hr) flagged. Class A. Cross-links
  the existing `ktv-urr`.

## 3. Per-tile robustness

- **`kfre` guards its logistic.** The `exp(Σβx − mean)` and the
  `1 − S₀^exp(...)` use an overflow-safe form so an extreme linear predictor returns a
  probability bounded to 0–1, never `Infinity` or a `NaN`; a blank required variable
  yields a surfaced `valid:false` fallback. The 4- vs 8-variable mode is selected
  explicitly, not inferred from missing fields.
- **`ufr-dialysis` guards its denominators** — session hours > 0 and dry weight > 0;
  a zero/blank denominator yields a complete-the-fields fallback, never a division by
  zero.
- **`rifle-aki` and `akin-aki` are ordinal classifications.** Each computes the worst
  of the creatinine/GFR and urine-output criteria and reports the governing one;
  baseline-creatinine and time-window inputs are validated (current/baseline ratio
  needs a positive baseline). Both flow through the [spec-v59](spec-v59.md) fuzz
  harness and name which criterion drove the class.
- All four render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js` and joins the fuzz
  harness with zero non-finite leaks.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all four tiles are **Class A** (fixed derivation
  coefficients and consensus criteria) — **no** `docs/citation-staleness.md` row. The
  citations name the **journal and authors** (JAMA/Tangri, Crit Care/Bellomo and
  Mehta, Kidney Int/Flythe), **not** a society acronym (KDIGO/ADQI/AKIN), so none
  trips the `ISSUER_PATTERN` staleness gate ([spec-v92](spec-v92.md) lesson — note
  KDIGO and similar acronyms must be kept off the citation strings).
- **Build & gates (§6.1/§6.2):** `lib/nephro-v127.js` (computes `kfre`, `rifleAki`,
  `akinAki`, `ufrDialysis`) is added to `test/unit/fuzz-tools.test.js` `MODULES` (zero
  non-finite leaks, with the KFRE logistic explicitly fuzzed for overflow); the
  renderer is `views/group-v127.js` with its `RV127` export added to the `app.js`
  `RENDERERS` spread. Each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v127.js`.

## 5. Files touched

```
docs/spec-v127.md                        (this file)
app.js                                   (+4 UTILITIES rows, groups G/E; import group-v127 renderers into RENDERERS)
lib/nephro-v127.js                       (new module: kfre, rifleAki, akinAki, ufrDialysis)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to ckd-staging, egfr-suite, kdigo-aki, ktv-urr)
views/group-v127.js                      (new renderer module: 4 renderers; RV127 export)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/kfre.test.js, rifle-aki.test.js, akin-aki.test.js, ufr-dialysis.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/nephro-v127.js to MODULES)
docs/audits/v12/kfre.md, rifle-aki.md, akin-aki.md, ufr-dialysis.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 556 -> 560)
CHANGELOG.md                             (Unreleased: v127 entry, +4)
README.md, package.json                  (catalog count 556 -> 560; spec-progression line -> v127)
```

## 6. Acceptance criteria

v127 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  four ids are absent from the live catalog (distinct from `kdigo-aki`, `ckd-staging`,
  `egfr-suite`, `ktv-urr`).
- All 4 tiles in §2 are live (groups G/E) with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each — including a
  worked KFRE 2-yr and 5-yr probability (4- and 8-variable), a **RIFLE Risk/Injury
  boundary flip** by the worse criterion, an AKIN stage-2/stage-3 flip (including RRT
  forcing stage 3), and a UFR 13 mL/kg/hr threshold crossing — a
  [spec-v11](spec-v11.md) audit log each, and a passing [spec-v29](spec-v29.md) §3
  check.
- `kfre` guards its logistic and uses an explicit 4-/8-variable mode; `ufr-dialysis`
  guards its denominators; `rifle-aki`/`akin-aki` validate baseline creatinine and
  return the governing criterion; partial inputs render a complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- No tile carries a `docs/citation-staleness.md` row (all Class A); the citations name
  journals/authors, not societies (no KDIGO/ADQI/AKIN acronyms in the strings).
- `UTILITIES.length` is **560** (or the then-current live count + 4 if specs land out
  of order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v127 with the +4 catalog delta.

## 7. Out of scope for v127

- **No EHR creatinine-trend or urine-output feed** — `rifle-aki`/`akin-aki` take the
  clinician's entered baseline/current values and the urine-output history, not a live
  flowsheet.
- **No duplication of `kdigo-aki`** — RIFLE and AKIN are the predecessor definitions,
  cross-linked so the consensus history reads in one place; all kept.
- **No auto-RRT, auto-fluid-removal, or auto-referral order** — each tile reports the
  probability/stage/rate and the source's stated interpretation; the management
  decision stays with the clinician and local protocol ([spec-v11](spec-v11.md) §5.3).
