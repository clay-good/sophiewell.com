# spec-v21.md — imaging-driven scoring: stroke imaging, oncology RADS, response criteria (25 tiles)

> Status: proposed (2026-05-18). v21 is the tenth catalog-growth
> spec and the **opener of the v21–v24 tranche** (the third
> 100-tile increment after v12–v16 and v17–v20). It adds 25
> tiles across **stroke imaging & post-tPA outcome models**
> (pc-ASPECTS, DRAGON, HAT, SEDAN, iScore, TIMI risk index for
> STEMI), **oncology imaging RADS systems** (Fleischner 2017,
> Lung-RADS v2022, BI-RADS 5th, LI-RADS 2018, PI-RADS v2.1, ACR
> TI-RADS, Bosniak 2019, O-RADS US, NI-RADS, C-RADS,
> EU-TIRADS), **oncology response criteria** (RECIST 1.1,
> iRECIST, PERCIST 1.0, mRECIST HCC, Deauville, Lugano 2014,
> Cheson 2014), and **musculoskeletal radiographic grading**
> (Kellgren-Lawrence knee OA).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v21 amends no hard rule from v10–v20. Catalog growth: at v20
> close 403 tiles; at v21 close **428 tiles**.
>
> v21 opens the v21–v24 tranche, the third 100-tile increment
> toward the 400–600-tile parity target in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).

## 1. Why v21 exists

v12–v20 covered 403 tiles of bedside, ICU, peri-op, OB/peds/
trauma, neuro/onc/endo/GI, cardiology, pulmonology, nephrology,
and cross-specialty work. The largest remaining MDCalc-parity
gap is **imaging-driven scoring**: the structured-reporting
systems that radiology, oncology, hepatology, urology, breast,
and neuro-IR clinicians reach for shift after shift.

Imaging RADS tiles are pure deterministic look-up structures —
no formula drift, no licensing complications (each RADS owner
publishes the rubric free for clinical use with attribution).
They map cleanly onto the v11 audit floor: each category is a
named, ordinal output with a society-endorsed management
recommendation. They are also where MDCalc parity falls short
most painfully — these scores are how the **report** gets
written, not just how a number gets computed.

The 25 tiles below were selected under the v12 §1 criteria:

1. **Clinical frequency.** Every radiologist, oncologist, and
   sub-specialist consumer of imaging hits at least one of
   these per shift; trial inclusion uses these as inclusion
   criteria.
2. **Source stability.** Each tile cites a single primary
   society or steering-committee document (ACR for the RADS
   family, RSNA/Fleischner for nodule rules, EORTC/NCI for
   RECIST, Lugano committee for lymphoma, ESMO for iRECIST).
3. **Audit feasibility.** Every category is enumerable and
   deterministic given the imaging inputs the clinician keys
   in; v21 ships none that require pixel-level analysis.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v21
specifically defers:

- **AI / model-based imaging interpretation.** Out of scope per
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md). v21 tiles
  consume only inputs a clinician keys in by hand from a report.
- **TNM staging by tumor site.** Each AJCC TNM 8th-edition site
  chapter is a tile of its own and deferred to a dedicated
  oncology-staging spec.
- **Image-segmentation tools** (ASPECTS auto-scoring, RAPID
  core/penumbra, Bosniak quantitative). Reference-only
  bands ship; segmentation is out of scope.
- **DLBCL / Hodgkin response by IPI / FLIPI.** Those are
  separate clinical-scoring tiles, deferred to a hem-onc add-on.
- **PI-QUAL / BI-QUAL** image-quality scores. Ship after the
  underlying RADS tiles have a steady-state audit cadence.

## 3. The 25 tiles

### 3.1 Stroke imaging & post-tPA outcome

#### 3.1.1 `pc-aspects` — Posterior Circulation ASPECTS

- **Citation:** Puetz V, Sylaja PN, Coutts SB, et al. *Extent of hypoattenuation on CT angiography source images predicts functional outcome in patients with basilar artery occlusion.* Stroke 2008;39(9):2485-2490.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`, `radiology`, `neurointerventional`.
- **Inputs:** 10-point template subtracting 1 point each for early ischemia in left/right thalamus (1), left/right cerebellum (1), left/right PCA territory (1), midbrain (2), pons (2). Range 0–10.
- **Output:** pc-ASPECTS 0–10 with thrombectomy-eligibility band per the BASICS / BASILAR trial cutoffs.

#### 3.1.2 `dragon-stroke` — DRAGON score (3-month outcome after IV tPA)

- **Citation:** Strbian D, Meretoja A, Ahlhelm FJ, et al. *Predicting outcome of IV thrombolysis-treated ischemic stroke patients: the DRAGON score.* Neurology 2012;78(6):427-432.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** Dense MCA / early infarct on CT (0/1/2), pre-stroke mRS >1 (0/1), age (0/1/2), glucose >144 (0/1), onset-to-treatment >90 min (0/1), baseline NIHSS (0/1/2/3). Sum 0–10.
- **Output:** Probability of mRS 0–2 and mRS 5–6 at 90 days per the original Tables 2–3.

#### 3.1.3 `hat-score` — Hemorrhage After Thrombolysis (HAT) score

- **Citation:** Lou M, Safdar A, Mehdiratta M, et al. *The HAT score: a simple grading scale for predicting hemorrhage after thrombolysis.* Neurology 2008;71(18):1417-1423.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** History of diabetes / glucose >200 (1), baseline NIHSS (0/1/2), early hypodensity on CT (0/1/2). Sum 0–5.
- **Output:** Symptomatic-ICH and any-hemorrhage probability per the original Table 2.

#### 3.1.4 `sedan-score` — SEDAN score

- **Citation:** Strbian D, Engelter S, Michel P, et al. *Symptomatic intracranial hemorrhage after stroke thrombolysis: the SEDAN score.* Ann Neurol 2012;71(5):634-641.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** Glucose at baseline (0/1/2), early infarct sign (0/1), hyperdense cerebral artery (0/1), age >75 (0/1), NIHSS ≥10 (0/1). Sum 0–6.
- **Output:** Risk of symptomatic ICH within 36 h of IV tPA.

#### 3.1.5 `iscore-stroke` — iScore (30-day & 1-year mortality after ischemic stroke)

- **Citation:** Saposnik G, Kapral MK, Liu Y, et al. *IScore: a risk score to predict death early after hospitalization for an acute ischemic stroke.* Circulation 2011;123(7):739-749.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neurology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** Age, sex, stroke subtype, NIHSS, glucose ≥7.5 mmol/L, history (AF, CHF, MI, cancer, dialysis), pre-stroke disability. Weighted per the original Table 2.
- **Output:** 30-day and 1-year mortality probabilities.

#### 3.1.6 `timi-stemi-index` — TIMI Risk Index for STEMI

- **Citation:** Morrow DA, Antman EM, Giugliano RP, et al. *A simple risk index for rapid initial triage of patients with ST-elevation myocardial infarction.* Lancet 2001;358(9293):1571-1575.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`.
- **Inputs:** Heart rate, age, systolic BP.
- **Formula:** TRI = HR × (age/10)² / SBP.
- **Bands:** Quintile bands per the original derivation; 30-day mortality 0.8% (Q1) → 17.4% (Q5).

### 3.2 Lung & nodule reporting

#### 3.2.1 `fleischner-2017` — Fleischner Society 2017 incidental pulmonary nodule guidelines

- **Citation:** MacMahon H, Naidich DP, Goo JM, et al. *Guidelines for management of incidental pulmonary nodules detected on CT images: from the Fleischner Society 2017.* Radiology 2017;284(1):228-243.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `pulmonology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Nodule type (solid / sub-solid / pure ground-glass), size (mm), single vs multiple, low vs high risk, prior imaging.
- **Output:** Management recommendation matrix per Tables 1–2 (no follow-up, CT at 6–12 mo, CT at 3–6 mo, biopsy / PET, etc.).

#### 3.2.2 `lung-rads-2022` — Lung-RADS v2022

- **Citation:** American College of Radiology. *Lung CT Screening Reporting & Data System (Lung-RADS), Version 2022.* ACR; 2022.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `pulmonology`.
- **Inputs:** Nodule type, size, growth, prior baseline, S-modifier features.
- **Output:** Lung-RADS 0 / 1 / 2 / 3 / 4A / 4B / 4X with management recommendation and malignancy rate.

### 3.3 Solid-organ RADS

#### 3.3.1 `bi-rads-5` — BI-RADS 5th edition (mammography / US / MRI)

- **Citation:** Sickles EA, D'Orsi CJ, Bassett LW, et al. *ACR BI-RADS® Atlas, Breast Imaging Reporting and Data System, 5th ed.* American College of Radiology; 2013 (+ 2023 errata).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `breast-surgery`, `obstetrics-gynecology`, `family-medicine`.
- **Inputs:** Modality, lesion descriptors, suspicious features, prior comparison.
- **Output:** BI-RADS 0 / 1 / 2 / 3 / 4A / 4B / 4C / 5 / 6 with malignancy likelihood and management.

#### 3.3.2 `li-rads-2018` — LI-RADS 2018 CT / MRI

- **Citation:** Chernyak V, Fowler KJ, Kamaya A, et al. *Liver Imaging Reporting and Data System (LI-RADS) Version 2018: imaging of hepatocellular carcinoma in at-risk patients.* Radiology 2018;289(3):816-830.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `hepatology`, `oncology`, `transplant-hepatology`.
- **Inputs:** At-risk patient confirmation, observation size, arterial phase hyperenhancement, washout, capsule, threshold growth.
- **Output:** LR-NC / LR-1 / LR-2 / LR-3 / LR-4 / LR-5 / LR-M / LR-TIV / LR-TR with HCC-likelihood and management.

#### 3.3.3 `pi-rads-v2-1` — PI-RADS v2.1 (prostate MRI)

- **Citation:** Turkbey B, Rosenkrantz AB, Haider MA, et al. *Prostate Imaging Reporting and Data System Version 2.1: 2019 update of Prostate Imaging Reporting and Data System Version 2.* Eur Urol 2019;76(3):340-351.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `urology`.
- **Inputs:** Zone (peripheral / transition), DWI score, T2 score, DCE positive/negative.
- **Output:** PI-RADS 1–5 per peripheral- or transition-zone decision tree with clinically-significant cancer likelihood.

#### 3.3.4 `ti-rads-acr` — ACR TI-RADS (thyroid US)

- **Citation:** Tessler FN, Middleton WD, Grant EG, et al. *ACR Thyroid Imaging, Reporting and Data System (TI-RADS): white paper of the ACR TI-RADS committee.* J Am Coll Radiol 2017;14(5):587-595.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `endocrinology`, `otolaryngology`.
- **Inputs:** Composition (0–2), echogenicity (0–3), shape (0/3), margin (0–3), echogenic foci (0–3 each).
- **Output:** TR1–TR5 with FNA / follow-up recommendation by size.

#### 3.3.5 `eu-tirads` — EU-TIRADS

- **Citation:** Russ G, Bonnema SJ, Erdogan MF, et al. *European Thyroid Association guidelines for ultrasound malignancy risk stratification of thyroid nodules in adults: the EU-TIRADS.* Eur Thyroid J 2017;6(5):225-237.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `endocrinology`.
- **Inputs:** Composition, echogenicity, shape, margin, echogenic foci per the EU-TIRADS atlas.
- **Output:** EU-TIRADS 1–5 with malignancy rate and FNA threshold.

#### 3.3.6 `bosniak-2019` — Bosniak Classification of Cystic Renal Masses (v2019)

- **Citation:** Silverman SG, Pedrosa I, Ellis JH, et al. *Bosniak Classification of Cystic Renal Masses, Version 2019: an update proposal and needs assessment.* Radiology 2019;292(2):475-488.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `urology`.
- **Inputs:** Modality, wall thickness, septation count/thickness, enhancement, calcification.
- **Output:** Bosniak I / II / IIF / III / IV with malignancy risk and follow-up.

#### 3.3.7 `o-rads-us` — O-RADS Ultrasound

- **Citation:** Andreotti RF, Timmerman D, Strachowski LM, et al. *O-RADS US Risk Stratification and Management System: a consensus guideline from the ACR Ovarian-Adnexal Reporting and Data System Committee.* Radiology 2020;294(1):168-185.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `obstetrics-gynecology`, `gynecologic-oncology`.
- **Inputs:** Premenopausal / postmenopausal, cyst type, solid component, color score, ascites/peritoneal nodularity.
- **Output:** O-RADS 0 / 1 / 2 / 3 / 4 / 5 with malignancy risk band and management.

#### 3.3.8 `ni-rads` — Neck Imaging Reporting and Data System

- **Citation:** Aiken AH, Hudgins PA, Aulino JM, Kang TS, Beitler JJ. *Implementation of a Novel Surveillance Template for Head and Neck Cancer: Neck Imaging Reporting and Data System (NI-RADS).* J Am Coll Radiol 2016;13(7):743-746.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `otolaryngology`, `radiation-oncology`.
- **Inputs:** Primary-site and neck-nodal findings post-treatment for head-and-neck cancer.
- **Output:** NI-RADS 0–4 with recurrence-likelihood and management recommendation.

#### 3.3.9 `c-rads` — CT Colonography Reporting and Data System

- **Citation:** Zalis ME, Barish MA, Choi JR, et al. *CT colonography reporting and data system: a consensus proposal.* Radiology 2005;236(1):3-9.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `radiology`, `gastroenterology`.
- **Inputs:** Largest polyp size, number of polyps ≥6 mm, suspicious-mass features, extracolonic findings (E-categories).
- **Output:** Colonic C0–C4 + Extracolonic E1–E4 with optical-colonoscopy recommendation.

### 3.4 Oncology response criteria

#### 3.4.1 `recist-1-1` — RECIST 1.1

- **Citation:** Eisenhauer EA, Therasse P, Bogaerts J, et al. *New response evaluation criteria in solid tumours: revised RECIST guideline (version 1.1).* Eur J Cancer 2009;45(2):228-247.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `radiology`, `clinical-trials`.
- **Inputs:** Up to 5 target lesions (max 2 per organ), sum-of-diameters baseline, follow-up sum, new-lesion flag, non-target progression.
- **Output:** CR / PR / SD / PD per the 30%/20% thresholds and confirmation rules.

#### 3.4.2 `irecist` — iRECIST

- **Citation:** Seymour L, Bogaerts J, Perrone A, et al. *iRECIST: guidelines for response criteria for use in trials testing immunotherapeutics.* Lancet Oncol 2017;18(3):e143-e152.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `radiology`, `clinical-trials`.
- **Inputs:** Same as RECIST 1.1 + immune-confirmed-PD timeline (iCPD), iUPD interim category.
- **Output:** iCR / iPR / iSD / iUPD / iCPD per the iRECIST decision matrix.

#### 3.4.3 `percist-1` — PERCIST 1.0

- **Citation:** Wahl RL, Jacene H, Kasamon Y, Lodge MA. *From RECIST to PERCIST: Evolving Considerations for PET response criteria in solid tumors.* J Nucl Med 2009;50(Suppl 1):122S-150S.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `nuclear-medicine`, `radiology`.
- **Inputs:** Baseline SULpeak of hottest single lesion (≥1.5×liver mean + 2 SD or ≥2.0×blood-pool), follow-up SULpeak, new-disease flag.
- **Output:** CMR / PMR / SMD / PMD per the 30% SULpeak threshold.

#### 3.4.4 `mrecist-hcc` — mRECIST for HCC

- **Citation:** Lencioni R, Llovet JM. *Modified RECIST (mRECIST) assessment for hepatocellular carcinoma.* Semin Liver Dis 2010;30(1):52-60.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `hepatology`, `radiology`.
- **Inputs:** Sum of diameters of enhancing (viable) tumor in up to 2 target lesions, follow-up enhancing sum, new-lesion flag.
- **Output:** CR / PR / SD / PD per mRECIST viable-tumor rules.

#### 3.4.5 `deauville-pet` — Deauville 5-point scale (FDG-PET)

- **Citation:** Meignan M, Gallamini A, Haioun C. *Report on the First International Workshop on interim-PET-Scan in lymphoma.* Leuk Lymphoma 2009;50(8):1257-1260.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `hematology`, `nuclear-medicine`, `radiology`.
- **Inputs:** Most-intense lymphoma-site uptake vs mediastinal blood pool and liver.
- **Output:** Deauville 1–5 with treatment-response interpretation.

#### 3.4.6 `lugano-2014` — Lugano lymphoma response (2014)

- **Citation:** Cheson BD, Fisher RI, Barrington SF, et al. *Recommendations for initial evaluation, staging, and response assessment of Hodgkin and non-Hodgkin lymphoma: the Lugano classification.* J Clin Oncol 2014;32(27):3059-3068.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `hematology`, `nuclear-medicine`.
- **Inputs:** Deauville score, target-node SPD, extralymphatic-site response, bone-marrow status, new-lesion flag.
- **Output:** CR / PR / SD / PD per Lugano 2014.

#### 3.4.7 `cheson-2014-staging` — Lugano staging (Cheson 2014)

- **Citation:** Cheson BD, Fisher RI, Barrington SF, et al. *Lugano classification.* J Clin Oncol 2014;32(27):3059-3068.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `hematology`.
- **Inputs:** Nodal-region involvement, extranodal sites, diaphragm-crossing, bulky-disease threshold.
- **Output:** Stage I / II / III / IV with A/B and bulky modifiers.

### 3.5 Musculoskeletal radiographic grading

#### 3.5.1 `kellgren-lawrence` — Kellgren-Lawrence knee OA grading

- **Citation:** Kellgren JH, Lawrence JS. *Radiological assessment of osteo-arthrosis.* Ann Rheum Dis 1957;16(4):494-502.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `radiology`, `orthopedic-surgery`, `rheumatology`, `family-medicine`.
- **Inputs:** Joint-space narrowing, osteophyte presence, subchondral sclerosis, bony deformity.
- **Output:** K-L grade 0–4 with definitional descriptor.

## 4. Group homes

- Clinical Criteria & Diagnostic Bundles (`H`): §3.2.1, §3.2.2, §3.3.1–§3.3.9, §3.4.1–§3.4.7.
- Clinical Scoring & Risk (`G`): §3.1.1–§3.1.6, §3.5.1.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). For RADS tiles, the
audit additionally records:

- The exact rubric version and society/year cited.
- The verbatim category-management mapping from the rights-
  holder's published table (no derived language).
- A `report-template-only` flag in the v11 audit log: RADS tiles
  ship as **structured-reporting reference**, not as imaging
  interpretation. The user-facing banner reads "This tile
  reproduces the published [RADS] rubric. It does not interpret
  images and must be applied by a qualified reader against the
  imaging study."

For response-criteria tiles (RECIST 1.1, iRECIST, PERCIST 1.0,
mRECIST, Deauville, Lugano), the audit additionally records the
target-lesion selection rules and the clinical-trial-context
banner ("Response criteria are clinical-trial measurement
conventions; clinical decisions remain physician judgement.").

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v20    | 403 | +25 |
| **v21**| **428** | **+25** |

## 7. What ships after v21

The v21–v24 tranche continues:

- **v22** — pediatric-specific extensions (PRISM III, PIM-3,
  pSOFA, Schwartz velocity, AAP hyperbilirubinemia 2022,
  PECARN head injury <2 / ≥2, FLACC, Bhutani, additional
  neonatal & febrile-infant tiles).
- **v23** — field medicine, global health, environmental
  exposure (MUAC, WHO SAM/MAM, IMCI fast-breathing,
  Lund-Browder, Parkland peds, Szpilman drowning, Lake Louise
  AMS/HACE/HAPE, Swiss hypothermia, frostbite, START /
  JumpSTART / SALT triage).
- **v24** — patient-decoder expansion + cross-specialty
  completers (EOB / MSN / drug-tier / vaccine-schedule
  decoders, Caprini, IMPROVE-DD, Geneva revised, age-adjusted
  D-dimer, apixaban / rivaroxaban renal dosing, additional
  hem-onc IPI/FLIPI/MIPI/IPSS family).
