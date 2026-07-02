# spec-v198.md — Cross-specialty prognostic & diagnostic scores: the CNS-IPI, the ISTH bleeding assessment tool, the VIRSTA score, the SeLECT score, and the WHO/FIGO GTN prognostic score (+5 tiles)

> Status: **SHIPPED (2026-07-02).** _(Proposed 2026-07-01.)_ Closing feature spec of the **Advanced
> Specialist Quantitation** program ([spec-v193](spec-v193.md) §1.1). Adds **5**
> deterministic subspecialty prognostic / diagnostic instruments spanning
> hematology-oncology, coagulation, infectious disease, neurology, and gynecologic
> oncology. **Each tile was verified absent by a direct scan of `app.js`** (zero id /
> name / keyword hits): the catalog carries `flipi`, `flipi-2`, `r-ipi`, `nccn-ipi`,
> `isth-dic`, `four-ts`, `hscore-hlh`, `duke-endocarditis`, `pitt-bacteremia`,
> `stess`, `helps2b`, `mess-first-seizure`, and `robson`, but **not** the CNS
> International Prognostic Index, the ISTH bleeding assessment tool, the VIRSTA score,
> the SeLECT score, or the WHO/FIGO gestational-trophoblastic-neoplasia score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v198 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no prophylaxis, imaging, treatment, or chemotherapy
> order in Sophie's voice**). **Every point weight and band threshold is re-fetched
> and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The final slice of the program collects five high-value subspecialty scores, each the
standard instrument in its niche and each confirmed absent: the lymphoma team's CNS
relapse index, the hematologist's standardized bleeding-history score, the ID
consultant's echocardiography-triage score for *S. aureus* bacteremia, the stroke
neurologist's post-stroke epilepsy predictor, and the gyn-onc prognostic score that
splits single-agent from multi-agent chemotherapy in trophoblastic neoplasia. Each is
a transparent point score a specialist acts on, and each is decision support —
**never a prophylaxis, imaging, treatment, or chemotherapy order**.

## 2. What v198 adds (5 tiles)

### 2.1 `cns-ipi` — CNS International Prognostic Index

- **Citation:** Schmitz N, Zeynalova S, Nickelsen M, et al. CNS International
  Prognostic Index: a risk model for CNS relapse in patients with diffuse large
  B-cell lymphoma treated with R-CHOP. *J Clin Oncol.* 2016;34(26):3150-3156.
- **citationUrl:** https://doi.org/10.1200/JCO.2015.65.6520
- **Group:** G (clinical scoring & risk). **Specialties:** `hematology`, `oncology`,
  `neurology`.
- **Inputs:** the six factors, each 1 point — age > 60, LDH > normal, ECOG
  performance status > 1, Ann Arbor stage III/IV, > 1 extranodal site, and
  kidney and/or adrenal involvement.
- **Output:** the **CNS-IPI total (0–6)** with the 2-year CNS-relapse-risk band —
  low (0–1, ~0.6%), intermediate (2–3, ~3.4%), high (4–6, ~10.2%) *(verify the band
  rates at implementation, [spec-v97](spec-v97.md))* — naming the contributors. Class
  A. Cross-links `nccn-ipi`, `r-ipi`, `ann-arbor`.

### 2.2 `isth-bat` — ISTH Bleeding Assessment Tool

- **Citation:** Rodeghiero F, Tosetto A, Abshire T, et al. ISTH/SSC bleeding
  assessment tool: a standardized questionnaire and a proposal for a new bleeding
  score for inherited bleeding disorders. *J Thromb Haemost.* 2010;8(9):2063-2065.
  Thresholds: Elbatarny M, Mollah S, Grabell J, et al. *Haemophilia.*
  2014;20(6):831-835.
- **citationUrl:** https://doi.org/10.1111/j.1538-7836.2010.03975.x
- **Group:** G. **Specialties:** `hematology`.
- **Inputs:** the 14 bleeding domains (epistaxis, cutaneous, minor wounds, oral
  cavity, GI, hematuria, tooth extraction, surgery, menorrhagia, postpartum
  hemorrhage, muscle hematoma, hemarthrosis, CNS, other), each scored 0 to +4 per the
  published grid (the ISTH-BAT has **no negative scores**).
- **Output:** the **ISTH-BAT total** with the abnormal thresholds — ≥ 4 (adult male),
  ≥ 6 (adult female), ≥ 3 (child) *(verify at implementation,
  [spec-v97](spec-v97.md))* — naming which domains contributed; an abnormal score
  supports evaluation for an inherited bleeding disorder / von Willebrand disease.
  Class A. Cross-links `four-ts`, `plasmic-ttp`.

### 2.3 `virsta` — VIRSTA Score (IE risk in S. aureus bacteremia)

- **Citation:** Tubiana S, Duval X, Alla F, et al. The VIRSTA score, a prediction
  score to estimate risk of infective endocarditis and determine priority for
  echocardiography in patients with *Staphylococcus aureus* bacteremia. *J Infect.*
  2016;72(5):544-553.
- **citationUrl:** https://doi.org/10.1016/j.jinf.2016.02.003
- **Group:** G. **Specialties:** `infectious-disease`, `cardiology`.
- **Inputs:** the published weighted items — cerebral/peripheral emboli (+5),
  meningitis (+5), permanent intracardiac device or previous IE (+4), IV drug use
  (+4), preexisting native valve disease (+3), persistent bacteremia (+3), vertebral
  osteomyelitis (+2), community/non-nosocomial acquisition (+2), severe sepsis/shock
  (+1), and CRP > 190 mg/L (+1).
- **Output:** the **VIRSTA total** with the risk band — **≤ 2 low** (IE prevalence
  ~1%, NPV ~99%; echocardiography may be deferred), **≥ 3 higher** (~17%, echo
  recommended) *(verify at implementation, [spec-v97](spec-v97.md))* — naming the
  contributors; framed as an echocardiography-triage aid. Class A. Cross-links
  `duke-endocarditis`, `pitt-bacteremia`.

### 2.4 `select-pse` — SeLECT Score (late post-stroke epilepsy)

- **Citation:** Galovic M, Döhler N, Erdélyi-Canavese B, et al. Prediction of late
  seizures after ischaemic stroke with a novel prognostic model (the SeLECT score): a
  multivariable prediction model. *Lancet Neurol.* 2018;17(2):143-152.
- **citationUrl:** https://doi.org/10.1016/S1474-4422(17)30404-0
- **Group:** G. **Specialties:** `neurology`, `stroke`.
- **Inputs:** the five factors — **Se**verity (NIHSS 0–3 → 0, 4–10 → 1, ≥ 11 → 2),
  **L**arge-artery atherosclerotic etiology (+1), **E**arly seizure ≤ 7 days (+3),
  **C**ortical involvement (+2), and MCA **T**erritory (+1). Total range 0–9.
- **Output:** the **SeLECT total (0–9)** with the source's 1-year and 5-year
  cumulative late-seizure risk (rising from ~0.7% at 0 to > 60% at 9 *(verify the
  per-score risks at implementation, [spec-v97](spec-v97.md))*), naming the
  contributors. Class A. Cross-links `nihss`, `stess`.

### 2.5 `figo-gtn` — WHO/FIGO Prognostic Score for Gestational Trophoblastic Neoplasia

- **Citation:** FIGO Oncology Committee. FIGO staging for gestational trophoblastic
  neoplasia 2000. *Int J Gynaecol Obstet.* 2002;77(3):285-287 (modified WHO scoring
  system).
- **citationUrl:** https://doi.org/10.1016/S0020-7292(02)00063-2
- **Group:** G. **Specialties:** `oncology`, `obstetrics-gynecology`.
- **Inputs:** the eight factors scored 0/1/2/4 — age; antecedent pregnancy (mole /
  abortion / term); interval from index pregnancy (months); pretreatment hCG (IU/L);
  largest tumor size; site of metastases; number of metastases; and prior failed
  chemotherapy *(the per-band cut-points are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **WHO/FIGO total** with the risk split — **≤ 6 low risk**
  (single-agent chemotherapy), **≥ 7 high risk** (multi-agent) — naming the
  contributors; framed as the guideline's risk stratification, not a chemotherapy
  order. Class A. Cross-links `robson`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Each is a
  bounded point sum; inputs are clamped to the published bands; outside these each
  renders a complete-the-fields fallback, never a `NaN`/`Infinity`.
- **Each tile reports which band applies and names the contributing items** (the
  CNS-IPI factors, the ISTH-BAT domains, the VIRSTA items, the SeLECT letters, the
  WHO/FIGO factors), so a result is never read without its basis
  ([spec-v59](spec-v59.md)).
- **`virsta` and `figo-gtn` render their decisions as guideline stratification, not
  orders** — VIRSTA as an echo-triage aid, WHO/FIGO as the single-vs-multi-agent
  split the tumor board acts on ([spec-v11](spec-v11.md) §5.3).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the band boundaries.
- **These prognosticate and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a prophylaxis, imaging,
  treatment, or chemotherapy order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point models, each
  cited by journal + authors. The **CNS-IPI** names the ASCO journal, **ISTH-BAT**
  names the society, and the **WHO/FIGO** score names FIGO/WHO; the implementing
  session confirms whether those trip `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/subspecialty-v198.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v198.js`; its `RV198` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `hematology`, `oncology`,
  `neurology`, `infectious-disease`, `cardiology`, `stroke`, `obstetrics-gynecology`
  — all already in the vocabulary.

## 5. Files touched

```
docs/spec-v198.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v198 RV198 into RENDERERS)
lib/subspecialty-v198.js                 (new: cnsIpi, isthBat, virsta, selectPse, figoGtn)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to nccn-ipi, duke-endocarditis, nihss, robson)
views/group-v198.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/cns-ipi.test.js, isth-bat.test.js, virsta.test.js, select-pse.test.js, figo-gtn.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/subspecialty-v198.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v198 delta and close the program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v198 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **CNS-IPI
  band crossing 0–1 → 2–3 → 4–6**, an **ISTH-BAT crossing the sex-specific abnormal
  threshold**, a **VIRSTA ≤ 2 rule-out vs ≥ 3 pair**, a **SeLECT score across its
  range**, and a **WHO/FIGO ≤ 6 low vs ≥ 7 high pair**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v198 with the +5 delta and notes the Advanced Specialist
  Quantitation program (v193–v198) closed.

## 7. Out of scope for v198

- **No prophylaxis / imaging / treatment / chemotherapy order** — the tiles
  stratify; the CNS-prophylaxis, echocardiography, bleeding-workup, anti-seizure, and
  chemotherapy-regimen decisions stay with the specialist and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No copyrighted quality-of-life instrument** — the SAQ-7 and KCCQ heart-failure /
  angina questionnaires are patented and licensed (CV Outcomes, Inc.) and fail the
  [spec-v97](spec-v97.md) free-reproducibility bar; they are excluded, as are the
  copyright-locked DN4, CAT, and ACT instruments.
- **No single-source point table** — GWTG-HF, EMSE, CRASH-TBI, TESS, and the original
  EGOS were investigated and remain deferred under the [spec-v97](spec-v97.md)
  ≥ 2-open-source bar (paywalled or single-source point tables); they are candidates
  for a future slice once a second independent open source surfaces.
