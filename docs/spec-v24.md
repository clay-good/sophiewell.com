# spec-v24.md — hem-onc prognostic completers, VTE/DOAC completers, patient-decoder expansion (25 tiles)

> Status: proposed (2026-05-19). v24 is the thirteenth catalog-
> growth spec and the **closer of the v21–v24 tranche** (the
> third 100-tile increment after v12–v16 and v17–v20). It adds
> 25 tiles across **multiple-myeloma & lymphoma staging**
> (ISS-MM, R-ISS-MM, R2-ISS-MM, NCCN-IPI for DLBCL, FLIPI-2), **CLL & CML prognostication** (CLL-IPI, Hasford-CML,
> EUTOS-CML, ELTS-CML), **MDS molecular prognosis** (IPSS-M),
> **VTE work-up completers** (Caprini, IMPROVE-DD, revised Geneva,
> YEARS, age-adjusted D-dimer, 4Ts HIT), **direct-oral
> anticoagulant renal/age dosing** (apixaban, rivaroxaban,
> dabigatran, edoxaban), and **patient-decoder expansion**
> (CDC adult & pediatric immunization schedule decoder, ASCCP
> 2019 cervical-screening result decoder, drug-tier formulary
> decoder, prior-authorization status decoder).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v24 amends no hard rule from v10–v23. Catalog growth: at v23
> close 478 tiles; at v24 close **503 tiles**.
>
> v24 closes the v21–v24 tranche. At v24 close, sophiewell.com
> carries **503 audited, deterministic, citable, login-less
> clinical tools** — past the 400–600-tile parity midpoint in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).

## 1. Why v24 exists

The v17–v20 cardiology / pulmonology / nephrology bundles
closed the largest specialty parity gaps; v21–v23 added imaging,
pediatrics, and field medicine. The final 25 tiles in the
v21–v24 tranche are the **completers** — high-frequency tiles
inside specialties already represented, plus the patient-
decoder surface that v8–v11 began.

Selection follows the v12 §1 criteria. Concretely:

- **Hem-onc prognostication.** v12–v20 shipped IPI-DLBCL, FLIPI,
  MIPI, IPSS-R, sokal-CML. The MM family (ISS, R-ISS, R2-ISS),
  the CLL/CML completers (CLL-IPI, Hasford,
  EUTOS, ELTS), and the molecular MDS scoring (IPSS-M) all
  drive treatment-selection conversations bedside oncologists
  have every clinic day.
- **VTE work-up completers.** ED & inpatient providers already
  use Wells / PERC / improve-VTE / Khorana from prior specs;
  v24 closes the loop with Caprini (surgical prophylaxis),
  IMPROVE-DD (D-dimer addition for medical inpatients), Geneva
  revised, YEARS, age-adjusted D-dimer, and 4Ts (HIT).
- **DOAC renal & age dosing.** The four FDA-approved DOACs
  (apixaban, rivaroxaban, dabigatran, edoxaban) each have an
  AF dose-adjustment rule that bedside hospitalists / cardiology
  / ED / pharmacy verify daily.
- **Patient decoders.** The v8–v11 patient surfaces (EOB / MSN /
  insurance card glossary) are heavily used; v24 extends to the
  next four surfaces patients ask staff about most:
  immunization-schedule, ASCCP cervical-screening results, drug-
  tier / formulary tiers, and prior-authorization status.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v24
specifically defers:

- **Disease-specific NCCN / ESMO treatment algorithms.** v24
  ships staging / prognosis, not treatment-selection trees.
- **DOAC reversal-protocol tiles** (andexanet, idarucizumab
  dosing). Defer to a dedicated reversal-agent spec once the
  most recent product-label revisions are stable.
- **Patient-facing differential or symptom checkers.** Out of
  scope per [scope-mdcalc-parity §4](scope-mdcalc-parity.md).
- **State-specific Medicaid prior-auth pathways.** v24 ships
  the generic decoder; state-specific contracts are deferred.

## 3. The 25 tiles

### 3.1 Multiple-myeloma & lymphoma staging

#### 3.1.1 `iss-mm` — International Staging System (multiple myeloma)

- **Citation:** Greipp PR, San Miguel J, Durie BG, et al. *International staging system for multiple myeloma.* J Clin Oncol 2005;23(15):3412-3420.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Serum β2-microglobulin (mg/L), serum albumin (g/dL).
- **Bands:** Stage I (β2M <3.5 AND Alb ≥3.5), II (intermediate), III (β2M ≥5.5).

#### 3.1.2 `r-iss-mm` — Revised ISS (multiple myeloma)

- **Citation:** Palumbo A, Avet-Loiseau H, Oliva S, et al. *Revised International Staging System for Multiple Myeloma: a report from International Myeloma Working Group.* J Clin Oncol 2015;33(26):2863-2869.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** ISS stage, LDH (normal vs above ULN), high-risk cytogenetics (del(17p), t(4;14), t(14;16)).
- **Bands:** R-ISS I / II / III per the published Table 2.

#### 3.1.3 `r2-iss-mm` — R2-ISS (Second Revision ISS)

- **Citation:** D'Agostino M, Cairns DA, Lahuerta JJ, et al. *Second Revision of the International Staging System (R2-ISS) for Overall Survival in Multiple Myeloma: A European Myeloma Network (EMN) Report Within the HARMONY Project.* J Clin Oncol 2022;40(29):3406-3418.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** ISS II (1), ISS III (1.5), high LDH (1), del(17p) (1), t(4;14) (1), gain/amp(1q) (0.5).
- **Bands:** R2-ISS I (0) / II (0.5–1) / III (1.5–2.5) / IV (3–5).

#### 3.1.4 `nccn-ipi-dlbcl` — NCCN-IPI for diffuse large B-cell lymphoma

- **Citation:** Zhou Z, Sehn LH, Rademaker AW, et al. *An enhanced International Prognostic Index (NCCN-IPI) for patients with diffuse large B-cell lymphoma treated in the rituximab era.* Blood 2014;123(6):837-842.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Age bands, LDH/ULN bands, Ann Arbor III/IV, extranodal sites in major organs (BM, CNS, liver, lung, GI), ECOG ≥2.
- **Bands:** Low (0–1) / low-intermediate (2–3) / high-intermediate (4–5) / high (6–8).

#### 3.1.5 `fl-ipi-2` — Follicular Lymphoma International Prognostic Index 2

- **Citation:** Federico M, Bellei M, Marcheselli L, et al. *Follicular lymphoma international prognostic index 2: a new prognostic index for follicular lymphoma developed by the international follicular lymphoma prognostic factor project.* J Clin Oncol 2009;27(27):4555-4562.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Age >60, β2-microglobulin >ULN, longest diameter of largest node >6 cm, BM involvement, Hgb <12.
- **Bands:** Low (0) / intermediate (1–2) / high (3–5).

### 3.2 CLL & CML prognostic indexes

#### 3.2.1 `cll-ipi` — CLL International Prognostic Index

- **Citation:** International CLL-IPI working group. *An international prognostic index for patients with chronic lymphocytic leukaemia (CLL-IPI): a meta-analysis of individual patient data.* Lancet Oncol 2016;17(6):779-790.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** TP53 status (4), IGHV unmutated (2), β2M >3.5 (2), Rai/Binet (1), age >65 (1). Sum 0–10.
- **Bands:** Low (0–1) / intermediate (2–3) / high (4–6) / very high (7–10).

#### 3.2.2 `hasford-cml` — Hasford CML prognostic score

- **Citation:** Hasford J, Pfirrmann M, Hehlmann R, et al. *A new prognostic score for survival of patients with chronic myeloid leukemia treated with interferon alfa.* J Natl Cancer Inst 1998;90(11):850-858.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Age, spleen size (cm below costal margin), blast %, eosinophil %, basophil %, platelets.
- **Bands:** Low (≤780) / intermediate (781–1480) / high (>1480) per the published formula.

#### 3.2.3 `eutos-cml` — EUTOS score

- **Citation:** Hasford J, Baccarani M, Hoffmann V, et al. *Predicting complete cytogenetic response and subsequent progression-free survival in 2060 patients with CML on imatinib treatment: the EUTOS score.* Blood 2011;118(3):686-692.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Basophil % × 7 + spleen size (cm) × 4.
- **Bands:** Low ≤87 / high >87.

#### 3.2.4 `elts-cml` — EUTOS Long-Term Survival score

- **Citation:** Pfirrmann M, Baccarani M, Saussele S, et al. *Prognosis of long-term survival considering disease-specific death in patients with chronic myeloid leukemia.* Leukemia 2016;30(1):48-56.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Age, spleen size, platelets, blast %.
- **Bands:** Low (≤1.5680) / intermediate (>1.5680 to 2.2185) / high (>2.2185) per the published formula.

### 3.3 MDS molecular prognosis

#### 3.3.1 `ipss-m-mds` — IPSS-Molecular (MDS)

- **Citation:** Bernard E, Tuechler H, Greenberg PL, et al. *Molecular International Prognostic Scoring System for Myelodysplastic Syndromes.* NEJM Evid 2022;1(7):EVIDoa2200008.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `oncology`.
- **Inputs:** Clinical (BM blast %, platelets, Hgb, cytogenetic risk), TP53 multi-hit status, MLL-PTD, FLT3, SF3B1 with co-mutation, and a 17-gene mutation residual.
- **Bands:** VL / L / ML / MH / H / VH with leukemia-free and overall survival estimates.

### 3.4 VTE work-up completers

#### 3.4.1 `caprini-vte` — Caprini VTE risk (surgical prophylaxis)

- **Citation:** Caprini JA. *Risk assessment as a guide to thrombosis prophylaxis.* Curr Opin Pulm Med 2010;16(5):448-452. Bahl V, et al. validation 2010.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `general-surgery`, `anesthesiology`, `internal-medicine`, `vascular-surgery`.
- **Inputs:** ~40 weighted risk factors (1, 2, 3, 5 points each).
- **Bands:** Very low (0) / low (1–2) / moderate (3–4) / high (≥5) with prophylaxis recommendation per ACCP CHEST.

#### 3.4.2 `improve-dd` — IMPROVE-DD VTE risk (medical inpatients, D-dimer-adjusted)

- **Citation:** Gibson CM, Spyropoulos AC, Cohen AT, et al. *The IMPROVEDD VTE Risk Score: Incorporation of D-Dimer into the IMPROVE Score to Improve Venous Thromboembolism Risk Stratification.* TH Open 2017;1(1):e56-e65.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `internal-medicine`, `hospital-medicine`.
- **Inputs:** Prior VTE (3), thrombophilia (2), lower-limb paralysis (2), cancer (2), immobilization ≥7 d (1), ICU/CCU stay (1), age >60 (1), D-dimer >2× ULN (2).
- **Bands:** <2 low / 2–3 moderate / ≥4 high.

#### 3.4.3 `geneva-revised-pe` — Revised Geneva score (PE)

- **Citation:** Le Gal G, Righini M, Roy PM, et al. *Prediction of pulmonary embolism in the emergency department: the revised Geneva score.* Ann Intern Med 2006;144(3):165-171.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `pulmonology`.
- **Inputs:** Age >65 (1), prior VTE (3), surgery / fracture <1 mo (2), active malignancy (2), unilateral leg pain (3), hemoptysis (2), HR 75–94 (3) or ≥95 (5), pain on deep venous palpation + unilateral edema (4).
- **Bands:** Low (0–3) / intermediate (4–10) / high (≥11).

#### 3.4.4 `years-pe` — YEARS criteria (PE)

- **Citation:** van der Hulle T, Cheung WY, Kooij S, et al. *Simplified diagnostic management of suspected pulmonary embolism (the YEARS study): a prospective, multicentre, cohort study.* Lancet 2017;390(10091):289-297.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `internal-medicine`, `pulmonology`.
- **Inputs:** Clinical signs of DVT, hemoptysis, PE most likely diagnosis; D-dimer.
- **Output:** Exclude PE if 0 items & D-dimer <1000 ng/mL, or any item & D-dimer <500 ng/mL; otherwise CTPA.

#### 3.4.5 `age-adjusted-d-dimer` — Age-adjusted D-dimer

- **Citation:** Righini M, Van Es J, Den Exter PL, et al. *Age-adjusted D-dimer cutoff levels to rule out pulmonary embolism: the ADJUST-PE study.* JAMA 2014;311(11):1117-1124.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `internal-medicine`.
- **Inputs:** Age >50, D-dimer (ng/mL FEU).
- **Output:** Adjusted cutoff = age × 10 ng/mL FEU; below threshold + low/intermediate pre-test probability rules out PE.

#### 3.4.6 `4ts-hit` — 4Ts score (HIT)

- **Citation:** Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. *Evaluation of pretest clinical score (4 T's) for the diagnosis of heparin-induced thrombocytopenia.* J Thromb Haemost 2006;4(4):759-765.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hematology`, `internal-medicine`, `critical-care`.
- **Inputs:** Thrombocytopenia (0–2), Timing (0–2), Thrombosis or other sequelae (0–2), oTher cause (0–2).
- **Bands:** Low (0–3) / intermediate (4–5) / high (6–8).

### 3.5 Direct oral anticoagulant (DOAC) renal/age dosing — atrial fibrillation

#### 3.5.1 `apixaban-af-dosing` — Apixaban AF dose adjustment

- **Citation:** Granger CB, Alexander JH, McMurray JJ, et al. *Apixaban versus warfarin in patients with atrial fibrillation.* N Engl J Med 2011;365(11):981-992; FDA Eliquis package insert (most recent revision).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `internal-medicine`, `pharmacy`.
- **Inputs:** Age ≥80, weight ≤60 kg, serum creatinine ≥1.5 mg/dL (count of criteria), dialysis status.
- **Output:** 5 mg BID standard, 2.5 mg BID if ≥2 of 3 criteria; banner if CrCl <15 or dialysis (label-allowed but limited data).

#### 3.5.2 `rivaroxaban-af-dosing` — Rivaroxaban AF dose adjustment

- **Citation:** Patel MR, Mahaffey KW, Garg J, et al. *Rivaroxaban versus warfarin in nonvalvular atrial fibrillation.* N Engl J Med 2011;365(10):883-891; FDA Xarelto package insert.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `internal-medicine`, `pharmacy`.
- **Inputs:** CrCl (Cockcroft-Gault).
- **Output:** 20 mg QD with evening meal if CrCl >50; 15 mg QD if 15–50; avoid if <15.

#### 3.5.3 `dabigatran-af-dosing` — Dabigatran AF dose adjustment

- **Citation:** Connolly SJ, Ezekowitz MD, Yusuf S, et al. *Dabigatran versus warfarin in patients with atrial fibrillation.* N Engl J Med 2009;361(12):1139-1151; FDA Pradaxa package insert.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `internal-medicine`, `pharmacy`.
- **Inputs:** CrCl, P-gp inhibitor co-administration.
- **Output:** 150 mg BID if CrCl >30; 75 mg BID if 15–30; avoid <15. P-gp inhibitor adjustments per label.

#### 3.5.4 `edoxaban-af-dosing` — Edoxaban AF dose adjustment

- **Citation:** Giugliano RP, Ruff CT, Braunwald E, et al. *Edoxaban versus warfarin in patients with atrial fibrillation.* N Engl J Med 2013;369(22):2093-2104; FDA Savaysa package insert.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `internal-medicine`, `pharmacy`.
- **Inputs:** CrCl, weight ≤60 kg, P-gp inhibitor co-administration.
- **Output:** 60 mg QD if CrCl 50–95; 30 mg QD if 15–50 or weight ≤60 kg or strong P-gp inhibitor; do not use if CrCl >95 (AF) or <15.

### 3.6 Patient-decoder expansion

#### 3.6.1 `cdc-vaccine-adult` — CDC adult immunization schedule decoder

- **Citation:** Centers for Disease Control and Prevention. *Recommended Adult Immunization Schedule, United States, current edition.* CDC; updated annually.
- **Group:** Patient Decoders (`J`).
- **Specialties:** `family-medicine`, `internal-medicine`, `public-health`, `pharmacy`.
- **Inputs:** Age, sex, pregnancy status, condition flags (immunocompromise, asplenia, HIV CD4 bands, chronic liver / kidney / heart / lung disease, healthcare worker, MSM, IDU).
- **Output:** Per-vaccine recommendation (recommend / catch-up / contraindicated / shared decision) per the latest ACIP schedule.

#### 3.6.2 `cdc-vaccine-peds` — CDC pediatric immunization schedule decoder

- **Citation:** Centers for Disease Control and Prevention. *Recommended Child and Adolescent Immunization Schedule, United States, current edition.* CDC; updated annually.
- **Group:** Patient Decoders (`J`).
- **Specialties:** `pediatrics`, `family-medicine`, `public-health`.
- **Inputs:** Date of birth, prior vaccination history.
- **Output:** Per-vaccine recommendation and minimum-interval catch-up table per the latest ACIP schedule.

#### 3.6.3 `asccp-2019` — ASCCP 2019 cervical-screening result decoder

- **Citation:** Perkins RB, Guido RS, Castle PE, et al. *2019 ASCCP Risk-Based Management Consensus Guidelines for Abnormal Cervical Cancer Screening Tests and Cancer Precursors.* J Low Genit Tract Dis 2020;24(2):102-131.
- **Group:** Patient Decoders (`J`).
- **Specialties:** `obstetrics-gynecology`, `family-medicine`, `internal-medicine`.
- **Inputs:** Age, current screening result (cytology + HPV), prior history.
- **Output:** Clinical action band (return to routine / 1-yr / colposcopy / treatment) per the ASCCP risk-based clinical-action thresholds.

#### 3.6.4 `drug-tier-decoder` — Drug-tier / formulary decoder

- **Citation:** Centers for Medicare & Medicaid Services. *Medicare Prescription Drug Benefit Manual.* CMS Chapter 6; current revision.
- **Group:** Patient Decoders (`J`).
- **Specialties:** `family-medicine`, `internal-medicine`, `pharmacy`, `patient-advocacy`.
- **Inputs:** Plan tier label (Tier 1–6 / preferred-generic / preferred-brand / specialty / etc).
- **Output:** Plain-language tier explanation, typical copay shape, and the patient action ("ask for generic substitution", "request formulary exception", "compare via Plan Finder").

#### 3.6.5 `prior-auth-decoder` — Prior-authorization status decoder

- **Citation:** Centers for Medicare & Medicaid Services. *Prior Authorization and Pre-Claim Review Initiatives* (CMS-0057-F 2024 Interoperability and Prior Authorization Final Rule).
- **Group:** Patient Decoders (`J`).
- **Specialties:** `family-medicine`, `internal-medicine`, `patient-advocacy`.
- **Inputs:** PA status label ("approved", "denied", "pending information", "peer-to-peer requested", "appeal-eligible").
- **Output:** Plain-language meaning and the next patient action, including statutory turnaround clocks under CMS-0057-F.

## 4. Group homes

- Clinical Scoring & Risk (`G`): §3.1.1–§3.1.5, §3.2.1–§3.2.4, §3.3.1, §3.4.1, §3.4.2, §3.4.3, §3.4.6.
- Clinical Criteria & Diagnostic Bundles (`H`): §3.4.4, §3.4.5, §3.5.1–§3.5.4.
- Patient Decoders (`J`): §3.6.1–§3.6.5.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Additional v24 audit
requirements:

- **DOAC dosing tiles (§3.5.1–§3.5.4)** record the package-insert
  revision date the dose ladder is keyed to. A future label
  revision triggers a re-audit rather than silent drift. The
  user-visible banner reads: "DOAC AF-dose adjustment is keyed
  to the FDA package insert [date]. For non-AF indications,
  reversal, or peri-procedural management, consult the full
  label and the relevant society guideline."

- **Patient-decoder tiles (§3.6.1–§3.6.5)** record the source-
  authority edition / revision date. Every annual CDC ACIP
  release and every CMS rulemaking is enrolled as a re-audit
  trigger per [docs/operations.md](operations.md).

- **Hem-onc prognostic tiles (§3.1, §3.2, §3.3)** record the
  cytogenetic / molecular input definitions verbatim from the
  primary derivation (e.g. "high-risk cytogenetics for R-ISS =
  del(17p), t(4;14), t(14;16)"). User input controls map 1:1 to
  the derivation definitions; no implicit redefinition.

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v23    | 478 | +25 |
| **v24**| **503** | **+25** |

## 7. What ships after v24

The v21–v24 tranche closes here. At v24 close,
sophiewell.com is **503 audited, deterministic, citable,
login-less clinical tools** — past the midpoint of the
400–600-tile parity window in
[docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) and on
track to complete the long-horizon commitment.

The next tranche (v25 onward) is currently scoped against:

- **AJCC TNM 8th-edition site staging** as a multi-spec bundle.
- **NCCN / ESMO treatment-selection trees** (out of v12–v24
  scope; require a separate licensing path).
- **DOAC peri-procedural & reversal-agent tiles**
  (andexanet alfa, idarucizumab, PCC 4-factor dosing).
- **Pediatric Phoenix sepsis criteria (2024)** once a stable
  reference implementation is published.
- **Endocrine completers** (DUTCH cortisol-rhythm reference,
  primary-aldosteronism case-detection thresholds, ENSAT
  adrenal-incidentaloma work-up).

Each future tranche follows the v11 audit floor and v12
shipping contract.
