# spec-v263.md — Respiratory & maternal acute risk: the MuLBSTA viral-pneumonia score, the Ottawa COPD Risk Scale, and the Sepsis in Obstetrics Score (+3 tiles)

> Status: **PROPOSED (2026-07-09).** Third feature spec of the **Bedside Acute-Care
> Instruments** program ([spec-v261](spec-v261.md) §1.1). Adds **3** deterministic
> instruments — one for viral-pneumonia mortality, one for the ED-COPD disposition
> decision, one for the obstetric-sepsis escalation decision. **Each id was verified
> absent by a fixed-string scan of the extracted `app.js` id/name list**
> ([spec-v85 §6.2](spec-v85.md)): the catalog carries `curb-65`, `psi`, `smart-cop`,
> `a-drop`, `bap-65`, `decaf`, and `meows`, but **not** the MuLBSTA score, the Ottawa
> COPD Risk Scale, or the Sepsis in Obstetrics Score.
>
> Catalog effect: **live `UTILITIES.length` + 3** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v263 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no admission, ICU-transfer, discharge, or drug order in
> Sophie's voice** — these compute a mortality/risk category; the disposition stays with
> the clinician). **Every item, band, and threshold is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md));
> uncertain values carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))*
> tag. The implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision
> check** first.

## 1. Thesis

The catalog carries the bacterial-pneumonia severity scores (CURB-65, PSI, SMART-COP,
A-DROP, BAP-65), the DECAF COPD-exacerbation mortality score, and the Modified Early
Obstetric Warning Score (MEOWS). It does **not** carry the **viral**-pneumonia mortality
score that outperformed CURB-65 in that population, not the **ED-disposition** rule for
COPD exacerbation that pairs 30-day serious-outcome risk with the discharge decision, and
not the sepsis-specific obstetric score that quantifies ICU-admission risk in the
pregnant patient. Each is a transparent, externally-validated instrument, freely
reproducible from open sources, and each is decision support — **never an admission,
ICU-transfer, discharge, or prescribing order**.

## 2. What v263 adds (3 tiles)

### 2.1 `mulbsta` — MuLBSTA score (90-day mortality in viral pneumonia)

- **Citation:** Guo L, Wei D, Zhang X, et al. Clinical features predicting mortality risk
  in patients with viral pneumonia: the MuLBSTA score. *Front Microbiol.* 2019;10:2752.
- **citationUrl:** https://doi.org/10.3389/fmicb.2019.02752
- **Group:** G. **Specialties:** `pulmonology`, `infectious-disease`,
  `emergency-medicine`, `critical-care`, `internal-medicine`.
- **Inputs — the MuLBSTA items** *(each weight is transcribed verbatim from the primary
  paper at implementation, [spec-v97](spec-v97.md))*: **Mu**ltilobar infiltrate, ≥ 2 lobes
  (+5); **L**ymphocyte ≤ 0.8 × 10⁹/L (+4); **B**acterial coinfection (+4); **S**moking —
  current smoker (+3), former smoker (+2), never (0); hyper**T**ension (+2); **A**ge ≥ 60
  (+2). Smoking is mutually exclusive, so the maximum total is **20**.
- **Output:** the **MuLBSTA total (0-20)** with the **≥ 12 = high risk** cutoff (90-day
  mortality ≈ 5 % below 12 vs ≈ 34 % at/above 12 in the derivation; AUROC ≈ 0.81,
  outperforming CURB-65 in viral pneumonia), naming the contributing items. Framed as the
  viral-pneumonia counterpart to the catalog's bacterial-CAP severity scores; **it reports
  a mortality-risk band, never an admission or ICU order** ([spec-v11](spec-v11.md) §5.3).
  Class A. Cross-links `curb-65`, `psi`, `a-drop`.

### 2.2 `ottawa-copd` — Ottawa COPD Risk Scale

- **Citation:** Stiell IG, Clement CM, Aaron SD, et al. Clinical characteristics
  associated with adverse events in patients with exacerbation of chronic obstructive
  pulmonary disease: a prospective cohort study. *CMAJ.* 2014;186(6):E193-E204.
- **citationUrl:** https://doi.org/10.1503/cmaj.130968
- **Group:** G. **Specialties:** `emergency-medicine`, `pulmonology`, `critical-care`,
  `internal-medicine`.
- **Inputs — ten weighted criteria (the original 2014 derivation weighting)** *(each
  weight is transcribed verbatim from the primary paper at implementation,
  [spec-v97](spec-v97.md))*: prior coronary bypass graft (+1); prior intervention for
  peripheral vascular disease (+1); prior intubation for respiratory distress (+2); heart
  rate ≥ 110/min on arrival (+2); too ill to complete the post-treatment walk test, or
  SaO₂ < 90 % / HR ≥ 120 on it (+2); acute ischemic change on ECG (+2); pulmonary
  congestion on chest x-ray (+1); hemoglobin < 10 g/dL (+3); urea ≥ 12 mmol/L (+1); serum
  bicarbonate ≥ 35 mEq/L (+1).
- **Output:** the **Ottawa COPD total (0-16)** with the corresponding risk of a short-term
  serious outcome (death, monitored-unit admission, intubation, NIV, MI, or relapse with
  admission), which rises steeply from ≈ 2 % at 0 to > 90 % at 10 *(the score→risk lookup
  is transcribed at implementation, [spec-v97](spec-v97.md))*, naming the dominant
  contributors. Framed as the ED-disposition rule for COPD exacerbation; the **2018
  revalidation uses a different (all-2/3) reweighting and a 0-22 range — the tile
  implements the original 2014 derivation weighting that MDCalc uses and states which
  version it computes** *(confirm the intended version at implementation,
  [spec-v97](spec-v97.md))*. **It reports a risk band, never an admission or discharge
  order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links `decaf`, `bap-65`,
  `curb-65`.

### 2.3 `sepsis-obstetrics-score` — Sepsis in Obstetrics Score (SOS)

- **Citation:** Albright CM, Ali TN, Lopes V, Rouse DJ, Anderson BL. The Sepsis in
  Obstetrics Score: a model to identify risk of morbidity from sepsis in pregnancy. *Am J
  Obstet Gynecol.* 2014;211(1):39.e1-39.e8.
- **citationUrl:** https://doi.org/10.1016/j.ajog.2014.03.010
- **Group:** G. **Specialties:** `obstetrics`, `emergency-medicine`, `critical-care`,
  `infectious-disease`.
- **Inputs — eight physiologic/laboratory variables in two-tailed bands (APACHE-II
  derived)** *(the full band table is transcribed verbatim from Albright 2014 Table 2 at
  implementation, [spec-v97](spec-v97.md); the extreme-derangement temperature and
  two-tailed WBC/RR bands are the reproducibility crux and are taken from the primary
  table, not a secondary render)*: temperature, systolic BP, heart rate, respiratory rate,
  SpO₂, white-blood-cell count, percent immature neutrophils (< 10 % = 0, ≥ 10 % = +3), and
  lactic acid (< 4 = 0, ≥ 4 = +4), for a total range of **0-28**.
- **Output:** the **SOS total (0-28)** with the **≥ 6 = high risk** cutoff for
  ICU/critical-care admission (derivation AUC ≈ 0.92 for composite morbidity, ≈ 0.97 for
  ICU admission; sensitivity ≈ 89 %, specificity ≈ 95 %, NPV ≈ 99.9 %), naming the
  deranged variables. Framed as the obstetric-sepsis escalation score that complements the
  general MEOWS track; **it reports an ICU-admission-risk band, never an admission,
  transfer, or antibiotic order** ([spec-v11](spec-v11.md) §5.3). Class A. Cross-links
  `meows`, `qsofa`, `sofa`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** MuLBSTA is a
  bounded 0-20 sum, Ottawa COPD a bounded 0-16 sum, SOS a bounded 0-28 two-tailed banded
  sum — each renders a "complete the fields" fallback for a missing item rather than a
  `NaN`, and clamps any reported probability to [0, 100] %.
- **Each tile reports which items fired and the resulting band**
  ([spec-v59](spec-v59.md)) — the MuLBSTA ≥ 12 dichotomy, the Ottawa COPD risk gradient,
  the SOS ≥ 6 cutoff — so a result is never read without its basis.
- **All three render a category, not an order** — none authors an admission, ICU-transfer,
  discharge, or prescribing order in Sophie's voice ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the MuLBSTA ≥ 12 cutoff, the Ottawa COPD band edges, and the SOS
  two-tailed band boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all three are **Class A** — fixed item/band models, each
  cited by journal + authors. The implementing session confirms whether any citation trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the three computes live in a new
  `lib/respiratory-maternal-v263.js`, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v263.js`; its `RV263` export is spread into the
  `app.js` `RENDERERS` map. The transcribed SOS band table lives as a named constant with
  the source table cited in a comment. Every input carries a real `<label for>`. The
  catalog count moves on all catalog-truth surfaces using the **live `UTILITIES.length`
  + 3**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary; the implementing session confirms
  `obstetrics` and `pulmonology` are present in `ALLOWED_SPECIALTIES` (both used by
  existing tiles) before use.
- **MCP exposure (post-ship):** all three are Class A deterministic computes and are
  **routinely MCP-adaptable** — a follow-up MCP wave exposes them as deterministic agent
  tools per the [spec-v85](spec-v85.md) recipe, self-describing the fired items/bands and
  the resulting category so the numeric round-trip passes.

## 5. Files touched

```
docs/spec-v263.md                        (this file)
app.js                                   (+3 UTILITIES rows; import group-v263 RV263 into RENDERERS)
lib/respiratory-maternal-v263.js         (new: mulbsta, ottawaCopd, sepsisObstetricsScore + transcribed SOS band constant)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to curb-65, decaf, meows)
views/group-v263.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+3 rows)
test/unit/mulbsta.test.js, ottawa-copd.test.js, sepsis-obstetrics-score.test.js   (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/respiratory-maternal-v263.js to MODULES)
docs/scope-post-parity.md                (catalog count live -> live+3; record the v263 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+3; spec-progression line)
```

## 6. Acceptance criteria

v263 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision check**
  and confirmed all three ids are absent (as verified at draft).
- All 3 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **MuLBSTA
  crossing the ≥ 12 cutoff and exercising the mutually-exclusive smoking term (a current
  vs a former smoker)**, an **Ottawa COPD spanning the risk gradient**, and a **SOS
  crossing the ≥ 6 ICU-risk cutoff with a two-tailed derangement (a hypo- and a
  hyperthermic, or a leukopenic and a leukocytotic case)**.
- The transcribed MuLBSTA weights, the Ottawa COPD 2014 derivation weighting, and the SOS
  two-tailed band table are reproduced from the primary sources and re-verified against
  ≥ 2 independent references at implementation ([spec-v97](spec-v97.md)) — including the
  MuLBSTA max of 20 (not 22) and the explicit choice of the Ottawa 2014 vs 2018 weighting.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps probabilities to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 3** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v263 with the +3 delta.

## 7. Out of scope for v263

- **No admission / ICU-transfer / discharge / prescribing order** — the tiles compute a
  mortality or risk category; the disposition and prescribing decisions stay with the
  clinician ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible variant** — the Ottawa COPD 2018 reweighting is
  noted but not shipped as a second tile; the MuLBSTA COVID-era recalibrations and
  locally-refitted SOS cutoffs are deferred; this slice adds only the three canonical,
  openly-published instruments. If any band table cannot be reproduced from ≥ 2 open,
  fetchable sources at implementation, that tile is parked (not approximated), per
  [spec-v97](spec-v97.md) and the [spec-v259](spec-v259.md) precedent.
