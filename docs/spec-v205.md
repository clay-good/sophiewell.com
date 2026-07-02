# spec-v205.md — Pulmonology, COPD & sleep severity: the LENT prognostic score, the ADO index, the DOSE index, the COPD Assessment Test, and the Sleep Apnea Clinical Score (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Second feature spec of the **Frontline & Bedside
> Decision Instruments** program ([spec-v204](spec-v204.md) §1.1). Adds **5**
> deterministic pulmonology, COPD-severity, malignant-effusion, and sleep instruments.
> **Each tile was verified absent by a direct scan of `app.js`** (zero id / name /
> keyword hits at draft): the catalog carries `bode-index`, `decaf-score`, `gap-ipf`,
> `bova-pe`, `pesi`, `spesi`, `rapid-pleural`, `curb-65`, `stop-bang`, `berlin-osa`,
> `nosas-score`, `epworth`, `gold-spirometry`, `mmrc-dyspnea`, and `pack-years`, but
> **not** the LENT prognostic score, the ADO index, the DOSE index, the COPD Assessment
> Test, or the Sleep Apnea Clinical Score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v205 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no ventilator setting, oxygen order, pleural
> procedure, inhaler, or sleep-study order in Sophie's voice** — these stratify severity;
> the decision stays with the treating clinician and the patient). **Every point weight,
> threshold, and band is re-fetched and cross-verified against ≥2 independent open
> sources at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an
> explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing
> session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the acute pneumonia and pulmonary-embolism scores and the common
sleep screeners; this slice adds the chronic-disease severity and prognostic instruments
that gate a longitudinal decision: the first validated survival score for malignant
pleural effusion (LENT), two office-friendly COPD prognostic composites that need no
walk test (ADO, DOSE), the patient-completed symptom-burden instrument that drives GOLD
group assignment (CAT), and an anthropometry-driven pre-test rule for obstructive sleep
apnea (SACS). Each is a transparent computation and each is decision support — **never a
ventilator, oxygen, pleural-procedure, inhaler, or sleep-study order**.

## 2. What v205 adds (5 tiles)

### 2.1 `lent-score` — LENT prognostic score (malignant pleural effusion)

- **Citation:** Clive AO, Kahan BC, Hooper CE, et al. Predicting survival in malignant
  pleural effusion: development and validation of the LENT prognostic score. *Thorax.*
  2014;69(12):1098-1104.
- **citationUrl:** https://doi.org/10.1136/thoraxjnl-2014-205285
- **Group:** G (clinical scoring & risk). **Specialties:** `pulmonology`, `oncology`.
- **Inputs:** the four LENT items — pleural-fluid **L**DH (< 1500 IU/L +0, ≥ 1500 +1),
  **E**COG performance status (0 → +0, 1 → +1, 2 → +2, 3–4 → +3), serum
  **N**eutrophil-to-lymphocyte ratio (< 9 +0, ≥ 9 +1), and **T**umour type
  (mesothelioma / hematologic +0; breast / gynecologic / renal +1; lung / other +2)
  *(verify weights at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **LENT total (0–7)** with the three risk groups — **low 0–1
  (median survival ≈ 319 days), moderate 2–4 (≈ 130 days), high 5–7 (≈ 44 days)** —
  naming the contributors; framed as the first effusion-specific survival score, informing
  goals-of-care and the choice between definitive pleurodesis / indwelling catheter and a
  palliative approach. Class A. Cross-links `rapid-pleural`, `ecog-karnofsky`.

### 2.2 `ado-index` — ADO index (age, dyspnea, airflow obstruction; COPD mortality)

- **Citation:** Puhan MA, Garcia-Aymerich J, Frey M, et al. Expansion of the prognostic
  assessment of patients with chronic obstructive pulmonary disease: the updated BODE
  index and the ADO index. *Lancet.* 2009;374(9691):704-711.
- **citationUrl:** https://doi.org/10.1016/S0140-6736(09)61301-5
- **Group:** G. **Specialties:** `pulmonology`, `primary-care`, `geriatrics`.
- **Inputs:** airflow obstruction (FEV₁ % predicted: ≥ 65 → +0, 36–64 → +1, ≤ 35 → +2),
  dyspnea (mMRC 0–1 → +0, 2 → +1, 3 → +2, 4 → +3), and age (10-year bands, +0 to +5)
  *(verify the exact age-band and FEV₁ point map at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **ADO total (0–10)** with the predicted **3-year all-cause mortality**,
  naming the contributors; framed as a primary-care-friendly BODE alternative that needs
  no 6-minute walk test *(the updated 0–14 recalibration and its per-score risk curve are
  noted and the chosen scale is transcribed at implementation, [spec-v97](spec-v97.md))*.
  Class A. Cross-links `bode-index`, `gold-spirometry`, `mmrc-dyspnea`.

### 2.3 `dose-index` — DOSE index (dyspnea, obstruction, smoking, exacerbations; COPD)

- **Citation:** Jones RC, Donaldson GC, Chavannes NH, et al. Derivation and validation of
  a composite index of severity in chronic obstructive pulmonary disease: the DOSE index.
  *Am J Respir Crit Care Med.* 2009;180(12):1189-1195.
- **citationUrl:** https://doi.org/10.1164/rccm.200902-0271OC
- **Group:** G. **Specialties:** `pulmonology`, `primary-care`.
- **Inputs:** dyspnea (mMRC 0–1 → +0, 2 → +1, 3 → +2, 4 → +3), obstruction (FEV₁ %
  predicted ≥ 50 → +0, 30–49 → +1, < 30 → +2), current smoking (+1), and exacerbations in
  the past year (0–1 → +0, 2–3 → +1, ≥ 4 → +2) *(verify the exacerbation cut-points and
  mMRC map against Jones 2009 Table 4 at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **DOSE total (0–8)** with the severity/prognosis interpretation
  (a score ≥ 4 marks markedly higher mortality and hospital-admission risk), naming the
  contributors; framed as a four-item composite for routine primary-care COPD review that
  yields a single trackable number. Class A. Cross-links `bode-index`, `ado-index`,
  `pack-years`.

### 2.4 `cat-copd` — COPD Assessment Test (CAT)

- **Citation:** Jones PW, Harding G, Berry P, Wiklund I, Chen WH, Kline Leidy N.
  Development and first validation of the COPD Assessment Test. *Eur Respir J.*
  2009;34(3):648-654.
- **citationUrl:** https://doi.org/10.1183/09031936.00102509
- **Group:** G. **Specialties:** `pulmonology`, `primary-care`.
- **Inputs:** the eight semantic-differential items, each scored 0–5 — cough, phlegm,
  chest tightness, breathlessness on hills/stairs, activity limitation at home,
  confidence leaving home, sleep, and energy.
- **Output:** the **CAT total (0–40)** with the impact bands — **low 0–10, medium 11–20,
  high 21–30, very high 31–40** (GOLD uses ≥ 10 as the "more symptoms" threshold; the
  minimal clinically important difference ≈ 2 points) — naming the highest-scoring items;
  framed as a patient-completed health-status instrument that drives GOLD ABE group
  assignment and tracks treatment response. Class A. Cross-links `mmrc-dyspnea`,
  `gold-spirometry`, `decaf-score`.

### 2.5 `sacs-osa` — Sleep Apnea Clinical Score (Flemons)

- **Citation:** Flemons WW, Whitelaw WA, Brant R, Remmers JE. Likelihood ratios for a
  sleep apnea clinical prediction rule. *Am J Respir Crit Care Med.*
  1994;150(5 Pt 1):1279-1285.
- **citationUrl:** https://doi.org/10.1164/ajrccm.150.5.7952553
- **Group:** G. **Specialties:** `sleep-medicine`, `pulmonology`, `otolaryngology`.
- **Inputs:** measured neck circumference (cm) plus the three clinical adjustments —
  hypertension, habitual snoring, and bed-partner-reported nocturnal gasping/choking —
  each adding a fixed increment to the neck circumference *(the exact adjustment
  increments and the score→probability nomogram are transcribed verbatim at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **Sleep Apnea Clinical Score (0–100)** derived from the adjusted neck
  circumference, with the pre-test-probability interpretation — a score **< 5** makes
  clinically important OSA unlikely (rules out) and a score **> 15** carries a high
  probability warranting expedited polysomnography — naming the adjustments applied.
  Framed as an anthropometry-driven triage rule complementing the catalog's questionnaire
  sleep tools. Class A. Cross-links `stop-bang`, `berlin-osa`, `nosas-score`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** LENT, ADO, DOSE,
  and CAT are bounded point sums; each clamps to its published range and renders a
  complete-the-fields fallback for a missing item rather than a partial total. SACS clamps
  the adjusted neck circumference to the nomogram domain.
- **Each tile reports which band applies and names the contributing items**
  ([spec-v59](spec-v59.md)) — the LENT factors, the ADO/DOSE points, the top CAT items,
  the SACS adjustments — so a result is never read without its basis.
- **All five render severity/prognosis, not orders** — none authors a ventilator,
  oxygen, pleural-procedure, inhaler, or sleep-study order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture
  note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point/threshold
  models, each cited by journal + authors. The implementing session confirms whether any
  citation (e.g. GOLD-linked wording) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/pulm-severity-v205.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v205.js`; its `RV205` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `pulmonology`, `oncology`,
  `primary-care`, `geriatrics`, `sleep-medicine`, `otolaryngology`; the implementing
  session adds any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v205.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v205 RV205 into RENDERERS)
lib/pulm-severity-v205.js                (new: lent, ado, dose, cat, sacs)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to bode-index, gold-spirometry, stop-bang)
views/group-v205.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/lent-score.test.js, ado-index.test.js, dose-index.test.js, cat-copd.test.js, sacs-osa.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/pulm-severity-v205.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v205 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v205 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **LENT crossing
  low / moderate / high**, an **ADO and a DOSE across their bands**, a **CAT spanning the
  impact bands**, and a **SACS below 5 and above 15**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v205 with the +5 delta.

## 7. Out of scope for v205

- **No ventilator / oxygen / pleural-procedure / inhaler / sleep-study order** — the
  tiles stratify severity and prognosis; the treat/scan/drain decisions stay with the
  clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — any index whose weights are not
  reproducible from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md).
