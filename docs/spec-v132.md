# spec-v132.md — Thrombotic microangiopathy & coagulopathy: PLASMIC, French TTP, JAAM DIC, IPSET-thrombosis, and CISNE (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID.**
> Adds **5** deterministic thrombotic-microangiopathy, coagulopathy, and
> febrile-neutropenia decision rules that fill confirmed catalog gaps. None
> duplicates a live tile.
>
> Catalog effect at v132 close: **583 + 5 = 588 tiles.** (If specs land out of
> order, the implementing session uses the then-current `UTILITIES.length` plus
> this spec's +5, and the catalog-truth gate enforces agreement.)
>
> Every prior spec (v4 through v131) remains in force. v132 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the heparin-induced-thrombocytopenia probability tool (`four-ts`)
and the cancer-associated-VTE risk tool (`khorana`), but the thrombotic
microangiopathy / coagulopathy cluster that sits beside them is absent — there is
no way to estimate the pretest probability of severe ADAMTS13 deficiency before
plasma exchange, no DIC score, no thrombosis-risk tool for essential
thrombocythemia, and no complication-risk tool for febrile neutropenia. Each is a
published, deterministic instrument a hematologist or intensivist already uses:

- **TTP has no pretest-probability tile.** The decision to start plasma exchange
  empirically turns on the **PLASMIC** score (and, in Europe, the **French TTP**
  score), which predict severe ADAMTS13 deficiency before the assay returns. Both
  sit conceptually beside `four-ts` (another "before-the-confirmatory-assay"
  probability rule) and are reachable nowhere.
- **DIC has no acute-coagulopathy score.** The **JAAM DIC** criteria (SIRS +
  platelet + FDP + PT-ratio) are the acute-care DIC instrument; the catalog scores
  neither ISTH overt-DIC nor JAAM.
- **Essential thrombocythemia has no thrombosis-risk tool.** The **revised
  IPSET-thrombosis** stratification (age, prior thrombosis, JAK2, CV risk) guides
  antiplatelet/cytoreduction decisions and joins the existing MPN prognosis tiles.
- **Stable febrile neutropenia has no complication score.** **CISNE** stratifies
  *clinically stable* febrile-neutropenia outpatients (where MASCC, already shipped,
  is broad); it is the companion the oncology cluster lacks.

v132 brings the TMA/coagulopathy cluster onto the page beside `four-ts` and `khorana`.

## 2. What v132 adds (5 tiles)

### 2.1 `plasmic-ttp` — PLASMIC Score

- **Citation:** Bendapudi PK, Hurwitz S, Fry A, et al. Derivation and external
  validation of the PLASMIC score for rapid assessment of adults with thrombotic
  microangiopathies: a cohort study. *Lancet Haematol.* 2017;4(4):e157-e164.
- **citationUrl:** https://doi.org/10.1016/S2352-3026(17)30026-1
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `critical-care`, `internal-medicine`,
  `transfusion-medicine`.
- **Inputs:** platelet count < 30 ×10⁹/L (1); hemolysis variables — reticulocyte
  > 2.5%, undetectable haptoglobin, or indirect bilirubin > 2.0 mg/dL (1); no
  active cancer in the prior year (1); no history of solid-organ or stem-cell
  transplant (1); MCV < 90 fL (1); INR < 1.5 (1); creatinine < 2.0 mg/dL (1).
- **Output:** the **total (0–7)** with the published risk bands — **0–4 low,
  5 intermediate, 6–7 high** probability of severe ADAMTS13 deficiency — naming
  which criteria were counted. Class A. Cross-links `french-ttp` and `four-ts`.

### 2.2 `french-ttp` — French TTP Score

- **Citation:** Coppo P, Schwarzinger M, Buffet M, et al. Predictive features of
  severe acquired ADAMTS13 deficiency in idiopathic thrombotic microangiopathies.
  *PLoS One.* 2010;5(4):e10208.
- **citationUrl:** https://doi.org/10.1371/journal.pone.0010208
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `internal-medicine`, `transfusion-medicine`.
- **Inputs:** platelet count < 30 ×10⁹/L (1); serum creatinine < 2.26 mg/dL
  (< 200 µmol/L) (1); antinuclear antibody (ANA) positive (1).
- **Output:** the **total (0–3)** with the probability framing — a score of **0**
  makes severe ADAMTS13 deficiency very unlikely; **2–3** makes it highly likely —
  naming the variables counted. Class A. Cross-links `plasmic-ttp`.

### 2.3 `jaam-dic` — JAAM DIC Score (acute disseminated intravascular coagulation)

- **Citation:** Gando S, Iba T, Eguchi Y, et al. A multicenter, prospective
  validation of disseminated intravascular coagulation diagnostic criteria for
  critically ill patients: comparing current criteria. *Crit Care Med.*
  2006;34(3):625-631.
- **citationUrl:** https://doi.org/10.1097/01.CCM.0000202209.42491.38
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `hematology`, `internal-medicine`, `nursing-icu`.
- **Inputs:** SIRS criteria met (≥3 → 1); platelet count band (<80 or >50% drop in
  24 h → 3; 80 to <120 or >30% drop → 1); fibrin/fibrinogen degradation products
  (FDP) band (≥25 → 3; 10 to <25 → 1); prothrombin-time ratio ≥ 1.2 (1).
- **Output:** the **total (0–8)** with the published DIC threshold (≥ 4 = DIC),
  naming the banded contributions. Class A. Cross-links `isth-dic` (overt-DIC) where
  present.

### 2.4 `ipset-thrombosis` — Revised IPSET-Thrombosis (essential thrombocythemia)

- **Citation:** Barbui T, Vannucchi AM, Buxhofer-Ausch V, et al. Practice-relevant
  revision of IPSET-thrombosis based on 1019 patients with WHO-defined essential
  thrombocythemia. *Blood Cancer J.* 2015;5(11):e369.
- **citationUrl:** https://doi.org/10.1038/bcj.2015.94
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`, `internal-medicine`.
- **Inputs:** age > 60 years; history of thrombosis; JAK2 V617F mutation present;
  cardiovascular risk factors (hypertension, diabetes, smoking).
- **Output:** the **four-tier risk category** per the revised model — **very low**
  (no history, no JAK2, age ≤ 60), **low** (JAK2 only), **intermediate** (age > 60,
  no JAK2, no history), **high** (history of thrombosis, or age > 60 *with* JAK2) —
  naming the determining factors. Class A. Cross-links the MPN prognosis cluster.

### 2.5 `cisne` — CISNE (Clinical Index of Stable Febrile Neutropenia)

- **Citation:** Carmona-Bayonas A, Jiménez-Fonseca P, Virizuela Echaburu J, et al.
  Prediction of serious complications in patients with seemingly stable febrile
  neutropenia: validation of the Clinical Index of Stable Febrile Neutropenia in a
  prospective cohort of patients from the FINITE study. *J Clin Oncol.*
  2015;33(5):465-471.
- **citationUrl:** https://doi.org/10.1200/JCO.2014.57.2347
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `nursing-onc`, `infectious-disease`, `internal-medicine`.
- **Inputs:** ECOG performance status ≥ 2 (2); stress-induced hyperglycemia (2);
  COPD (1); chronic cardiovascular disease (1); NCI grade ≥ 2 mucositis (1);
  monocytes < 200/µL (1).
- **Output:** the **total (0–8)** mapped to the published complication-risk tiers —
  **0 low, 1–2 intermediate, ≥ 3 high** risk of serious complications — naming the
  items counted. Class A. Cross-links `mascc` (which CISNE refines for the *stable*
  subgroup), both kept.

## 3. Per-tile robustness

- **`plasmic-ttp`, `french-ttp`, `jaam-dic`, `ipset-thrombosis`, and `cisne` are
  criteria/threshold logic** with bounded sums (or, for IPSET, a finite decision
  tree); each flows through the [spec-v59](spec-v59.md) fuzz harness and names which
  criteria/factors were counted, returning a surfaced complete-the-fields fallback
  rather than a partial score when a required input is blank.
- **`plasmic-ttp` and `french-ttp` compare entered lab values to fixed thresholds**
  (platelet, creatinine, INR, MCV); each comparison guards against a blank/non-finite
  value and the hemolysis composite is an explicit OR of three flags.
- **`jaam-dic` uses the banded delta logic** (the > 50%/> 30% 24-h platelet drop
  needs both a current and a prior platelet count); the band selection clamps to the
  published cut-points and the score never exceeds 8.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treat/transfuse/plasma-exchange
  recommendation in Sophie's voice ([spec-v11](spec-v11.md) §5.3) — each reports the
  rule's verdict and the source's stated guidance.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed derivation papers
  / point weights) — **no** `docs/citation-staleness.md` row. Each citation names the
  **journal and authors** (Lancet Haematol, PLoS One, Crit Care Med, Blood Cancer J,
  J Clin Oncol), not an issuing-society acronym, so `check-citations.mjs`
  `ISSUER_PATTERN` does not fire ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)
  lesson).
- **Build (§6.1):** `lib/heme-v132.js` is the new compute module (`plasmicTtp`,
  `frenchTtp`, `jaamDic`, `ipsetThrombosis`, `cisne`); `views/group-v132.js` is the
  new renderer module, exporting `RV132` into the `app.js` `RENDERERS` spread
  (continuing the `group-vNN` sequence past `group-v25`; collision-free with the
  existing `group-v63.js`).
- **Gates (§6.2):** `lib/heme-v132.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks); each `META` example is pinned by the chromium
  `example-correctness` sweep; the catalog count moves on all **13 catalog-truth
  surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass for
  `views/group-v132.js`.

## 5. Files touched

```
docs/spec-v132.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v132 RV132 into RENDERERS)
lib/heme-v132.js                         (new module: plasmicTtp, frenchTtp, jaamDic, ipsetThrombosis, cisne)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to four-ts, khorana, mascc, isth-dic)
views/group-v132.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/plasmic-ttp.test.js, french-ttp.test.js, jaam-dic.test.js, ipset-thrombosis.test.js, cisne.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/heme-v132.js to MODULES)
docs/audits/v12/plasmic-ttp.md, french-ttp.md, jaam-dic.md, ipset-thrombosis.md, cisne.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 583 -> 588; running ledger)
CHANGELOG.md                             (Unreleased: v132 entry, +5)
README.md, package.json                  (catalog count 583 -> 588; spec-progression line -> v132)
```

## 6. Acceptance criteria

v132 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent from the live catalog.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including
  a **PLASMIC ≥ 6 high-risk band-flip**, a **French TTP 0-vs-2 probability flip**, a
  **JAAM DIC total crossing the ≥ 4 DIC threshold**, an **IPSET high vs very-low
  category boundary**, and a **CISNE crossing ≥ 3 high-risk**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks; partial inputs
  render a complete-the-fields fallback.
- `UTILITIES.length` is **588** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v132 with the +5 catalog delta.

## 7. Out of scope for v132

- **No ADAMTS13 assay parsing or auto-plasma-exchange order** — `plasmic-ttp` /
  `french-ttp` report the pretest probability; the decision to start plasma exchange
  stays with the clinician and local protocol.
- **No ISTH overt-DIC re-implementation** — `jaam-dic` is the acute-care companion;
  where `isth-dic` exists it is cross-linked, both kept (different criteria sets).
- **No cytoreduction or antiplatelet recommendation** — `ipset-thrombosis` reports
  the risk category and the source's stated framing only.
- **No auto-admission/auto-antibiotic decision** — `cisne` reports the complication
  tier; the disposition decision stays with the clinician.
