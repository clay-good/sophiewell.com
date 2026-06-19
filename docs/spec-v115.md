# spec-v115.md — Pulmonary nodule, PH & pleural infection: Mayo SPN, Brock/PanCan, Fleischner 2017, REVEAL Lite 2, and RAPID (+5 tiles)

> Status: **SHIPPED (2026-06-19).** Feature spec of the
> [spec-v100](spec-v100.md) **MDCalc Parity Completion** program, **Wave 3 —
> Critical care & pulmonary** ([spec-v100 §4](spec-v100.md)). Adds **5**
> deterministic pulmonary decision rules that fill confirmed gaps. None duplicates
> a live tile. Implemented in `lib/pulmnod-v115.js` + `views/group-v40.js`
> (`RV40`), with the Mayo and Brock logistic coefficients re-fetched and
> cross-verified at implementation (the §2 estimates held).
>
> Catalog effect at v115 close: the running catalog count was one below the spec
> draft's projection (the program count had drifted by one; the catalog-truth gate
> governs), so v115 ships **501 → 506 (+5)** — the Wave 3 end state. Wave 3
> ([spec-v112](spec-v112.md)–v115) took the catalog **487 → 506 (+19)**; v116 is
> reserved/empty ([spec-v100 §4](spec-v100.md)).
>
> Every prior spec (v4 through v114) remains in force. v115 adds no runtime
> network call and no AI; each tile obeys the [spec-v100 §2](spec-v100.md)
> doctrine (re-binding [spec-v85 §2](spec-v85.md)) and the
> [spec-v100 §6](spec-v100.md) CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the chronic-airways and acute-PE tools but lacks the pulmonary
nodule, pulmonary-hypertension prognosis, and pleural-infection instruments a
pulmonologist uses routinely. Five standard instruments are absent:

- **Incidental nodules have no Mayo SPN model** — the logistic malignancy
  probability from clinical and nodule descriptors for an incidental solitary
  pulmonary nodule.
- **Screen-detected nodules have no Brock/PanCan model** — the logistic
  malignancy probability validated on lung-screening cohorts.
- **Nodule surveillance has no Fleischner 2017 tool** — the size/type/risk →
  follow-up CT interval recommendation.
- **PAH prognosis has no REVEAL Lite 2** — the 1-year survival risk from six
  noninvasive variables.
- **Pleural infection has no RAPID score** — the 3-month mortality risk in pleural
  infection (empyema / complicated effusion).

Each is a published, deterministic instrument a clinician already uses; v115
brings them onto the page and closes Wave 3.

## 2. What v115 adds (5 tiles)

### 2.1 `mayo-spn` — Mayo Clinic Solitary Pulmonary Nodule Malignancy Risk

- **Citation:** Swensen SJ, Silverstein MD, Ilstrup DM, Schleck CD, Edell ES. The
  probability of malignancy in solitary pulmonary nodules. Application to small
  radiologically indeterminate nodules. *Arch Intern Med.* 1997;157(8):849-855.
- **citationUrl:** https://doi.org/10.1001/archinte.1997.00440290031002
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `oncology`, `internal-medicine`.
- **Inputs:** age, current/former smoking, prior extrathoracic cancer (> 5 yr),
  nodule diameter (mm), spiculation, and upper-lobe location.
- **Output:** the **malignancy probability (%)** via the published logistic
  model — probability = e^x/(1+e^x), x = −6.8272 + 0.0391·age + 0.7917·smoke +
  1.3388·cancer + 0.1274·diameter + 1.0407·spiculation + 0.7838·upperlobe — with a
  low / intermediate / high pretest-probability framing. Class A (fixed 1997
  coefficients). **Robustness:** the logistic is overflow-clamped (see §3).

### 2.2 `brock-nodule` — Brock University / PanCan Nodule Malignancy Risk

- **Citation:** McWilliams A, Tammemagi MC, Mayo JR, et al. Probability of cancer
  in pulmonary nodules detected on first screening CT. *N Engl J Med.*
  2013;369(10):910-919.
- **citationUrl:** https://doi.org/10.1056/NEJMoa1214726
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `oncology`, `internal-medicine`,
  `emergency-medicine`.
- **Inputs:** age, sex, family history of lung cancer, emphysema, nodule size
  (mm), nodule type (solid / part-solid / non-solid), upper-lobe location, nodule
  count, and spiculation (the full PanCan parsimonious-model variable set).
- **Output:** the **malignancy probability (%)** via the published PanCan logistic
  model (re-fetched coefficients, including the natural-log size transform), with
  the low / intermediate / high framing. Class A (fixed 2013 coefficients).
  **Robustness:** the logistic is overflow-clamped and the ln(size) is
  domain-guarded (see §3). Cross-links `mayo-spn` and `fleischner-2017`.

### 2.3 `fleischner-2017` — Fleischner Society Nodule Follow-up

- **Citation:** MacMahon H, Naidich DP, Goo JM, et al. Guidelines for management
  of incidental pulmonary nodules detected on CT images: from the Fleischner
  Society 2017. *Radiology.* 2017;284(1):228-243.
- **citationUrl:** https://doi.org/10.1148/radiol.2017161659
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `oncology`, `internal-medicine`.
- **Inputs:** nodule size (mm or volume), nodule type (solid / part-solid /
  ground-glass), single vs multiple, and patient risk (low vs high).
- **Output:** the **recommended CT surveillance interval** (or no routine
  follow-up / consider PET-CT or tissue sampling) per the 2017 Fleischner matrix,
  naming the size/type/risk cell selected. Class B (the Fleischner Society
  guidance is revisable → `docs/citation-staleness.md` row, on-publication
  cadence). Cross-links `mayo-spn`/`brock-nodule`.

### 2.4 `reveal-lite-2` — REVEAL Lite 2 (PAH risk)

- **Citation:** Benza RL, Kanwar MK, Raina A, et al. Development and validation of
  an abridged version of the REVEAL 2.0 risk score calculator, REVEAL Lite 2, for
  use in patients with pulmonary arterial hypertension. *Chest.*
  2021;159(1):337-346.
- **citationUrl:** https://doi.org/10.1016/j.chest.2020.08.2069
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `cardiology`, `internal-medicine`.
- **Inputs:** the six noninvasive variables — eGFR / renal insufficiency, WHO
  functional class, systolic BP, heart rate, 6-minute walk distance, and BNP/NT-
  proBNP — each banded per the published table.
- **Output:** the **REVEAL Lite 2 total** with the low / intermediate / high
  1-year-risk bands, naming the banded variables. Class A (fixed point weights).
  Cross-links the PH/RV-function cluster.

### 2.5 `rapid-pleural` — RAPID Score (pleural infection)

- **Citation:** Rahman NM, Kahan BC, Miller RF, Gleeson FV, Nunn AJ, Maskell NA. A
  clinical score (RAPID) to identify those at risk for poor outcome at
  presentation in patients with pleural infection. *Chest.*
  2014;145(4):848-855.
- **citationUrl:** https://doi.org/10.1378/chest.13-1558
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `emergency-medicine`,
  `infectious-disease`.
- **Inputs:** Renal (urea band), Age band, Purulence of pleural fluid, Infection
  source (community vs hospital), and Dietary/serum albumin band — the five RAPID
  components (0–7).
- **Output:** the **total (0–7)** with the low (0–2) / medium (3–4) / high (5–7)
  3-month-mortality bands, naming the components scored. Class A (fixed point
  weights). Cross-links the pleural-effusion cluster.

## 3. Per-tile robustness

- **`mayo-spn` and `brock-nodule` are logistic models.** Both re-fetch the
  **published coefficients verbatim** at implementation (per the v97 "re-fetch,
  never recall" lesson) and compute `1/(1+e^-x)` with **x clamped to [−40, 40]**
  so a fuzzed extreme (e.g. a 1e9 nodule diameter) cannot overflow `e^x` to
  `Infinity`; an out-of-range result returns a surfaced `valid:false` fallback,
  never a probability from `NaN`. `brock-nodule`'s natural-log size term is
  domain-guarded (size > 0).
- **`fleischner-2017`, `reveal-lite-2`, and `rapid-pleural` are
  matrix/threshold logic** with total-keyed band lookups; they flow through the
  [spec-v59](spec-v59.md) fuzz harness and name which cell/components were
  selected. A blank required input renders a complete-the-fields fallback rather
  than selecting a default cell.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote
  the source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3). Each compute uses `lib/num.js`.

## 4. CI/CD & maintenance

Per the [spec-v100 §6](spec-v100.md) contract (re-binding [spec-v85 §6](spec-v85.md)):

- **Maintenance classes (§6.3):** `mayo-spn`, `brock-nodule`, `reveal-lite-2`, and
  `rapid-pleural` are **Class A** (fixed coefficients / point weights), citing the
  **journal and authors** (Swensen/Arch Intern Med, McWilliams/NEJM, Benza/Chest,
  Rahman/Chest), so the `check-citations.mjs` `ISSUER_PATTERN` does **not** trip a
  staleness row — **none needed.** `fleischner-2017` is **Class B** (the
  **Fleischner Society** guidance is revisable, and the citation names the society)
  — it gets a `docs/citation-staleness.md` row naming the edition in force (2017
  Fleischner Society guidelines), the `accessed` date, and an on-publication review
  cadence, monitored by the existing `scripts/check-citation-cadence.mjs`
  warn-job.
- **Gates (§6.2):** `lib/pulmnod-v115.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list (zero non-finite leaks, with the
  Mayo SPN and Brock logistic models explicitly fuzzed for `e^x` overflow and
  `ln(size)` domain); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v40.js`.
- **Renderer numbering (§6.1):** v115 claims `views/group-v40.js` and adds its
  `RV40` export to the `app.js` `RENDERERS` spread.
- **Wave-close note:** with v115 the Wave 3 segment of the
  [spec-v100](spec-v100.md) program is complete at **507** tiles (488 → 507, +19;
  v116 stays reserved). `scope-mdcalc-parity.md` records the Wave 3 ledger.

## 5. Files touched

```
docs/spec-v115.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v40 renderers into RENDERERS)
lib/pulmnod-v115.js                      (new module: mayoSpn, brockNodule, fleischner2017, revealLite2, rapidPleural — Mayo/Brock published logistic coefficients re-fetched verbatim, e^x overflow-clamped)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links between mayo-spn/brock-nodule/fleischner-2017 and to the PH/pleural clusters)
views/group-v40.js                       (new renderer module: 5 renderers; incl. the nodule-descriptor inputs and the Fleischner size/type/risk matrix selector)
docs/citation-staleness.md               (+ row: fleischner-2017 Fleischner Society 2017 guidelines)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/mayo-spn.test.js, brock-nodule.test.js, fleischner-2017.test.js, reveal-lite-2.test.js, rapid-pleural.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pulmnod-v115.js to MODULES)
docs/audits/v12/mayo-spn.md, brock-nodule.md, fleischner-2017.md, reveal-lite-2.md, rapid-pleural.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 502 -> 507; CLOSE Wave 3 in the running ledger: 488 -> 507, +19)
CHANGELOG.md                             (Unreleased: v115 entry, +5; Wave-3-complete note)
README.md, package.json                  (catalog count 502 -> 507; spec-progression line -> v115)
```

## 6. Acceptance criteria

v115 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent from the then-current catalog.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a worked Mayo SPN probability flipping its intermediate/high band, a
  worked Brock probability, a Fleischner cell selecting a specific surveillance
  interval, a REVEAL Lite 2 total crossing low→intermediate, and a RAPID total
  crossing into the high-mortality band), a [spec-v11](spec-v11.md) audit log, and
  a passing [spec-v29](spec-v29.md) §3 check.
- `mayo-spn` and `brock-nodule` re-fetch published coefficients verbatim, clamp
  `x` to [−40, 40], and guard `ln(size)`; partial inputs render a
  complete-the-fields fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `fleischner-2017` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **507** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md`
  records Wave 3 complete (488 → 507, +19).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v115 with the +5 catalog delta and the Wave-3-complete
  note.

## 7. Out of scope for v115

- **No chest-CT image analysis.** `mayo-spn` and `brock-nodule` take the
  clinician's nodule **descriptors** (size, type, spiculation, location), not a CT
  image or a CAD feed; `fleischner-2017` takes the measured size/type, not a scan.
- **No Lung-RADS or ACR TI-RADS** — these are permanently excluded
  ([spec-v100 §8](spec-v100.md)); v115 ships the public, journal-derived nodule
  models instead.
- **No auto-biopsy, auto-PET, or auto-surveillance order** — each tile reports the
  probability/interval/score and the source's stated guidance; the
  biopsy/PET/follow-up decision stays with the clinician and local protocol
  ([spec-v11](spec-v11.md) §5.3).
- **No continuous-feed dependency** — `fleischner-2017`'s matrix is a dated,
  ledger-tracked constant per §6.3, never a live guideline feed
  ([spec-v5](spec-v5.md) §2).
