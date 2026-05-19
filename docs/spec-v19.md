# spec-v19.md — nephrology, electrolytes, dialysis, transplant, urology, advanced hepatology (25 tiles)

> Status: proposed (2026-05-18). v19 is the eighth catalog-growth
> spec and the third of the v17–v20 tranche. It adds 25 tiles
> across **kidney-failure prognosis & GFR estimation** (Tangri
> KFRE, CKD-EPI cystatin 2021, CKD-EPI Cr-Cys 2021, MDRD-1999,
> bedside-Schwartz peds 2009), **electrolyte & osmolar
> calculations** (Adrogue-Madias, urine anion gap, urine osmolar
> gap, transtubular K gradient, fractional excretion of urate,
> effective osmolarity, UACR KDIGO staging, eAG-from-HbA1c),
> **transplant scoring** (KDPI, EPTS, Milan HCC, Up-to-7 HCC),
> **urology** (IPSS-BPH, PSA density), **dialysis adequacy** (URR,
> Daugirdas single-pool Kt/V), **AKI evaluation** (Furosemide
> Stress Test, ICU renal angina index), **structural & portal
> liver disease** (Mayo ADPKD imaging classification, Baveno VII
> portal-HTN risk).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v19 amends no hard rule from v10–v18. Catalog growth: at v18
> close 353 tiles; at v19 close **378 tiles**.

## 1. Why v19 exists

eGFR-suite, FENa/FEUrea, free-water deficit, MELD/Child-Pugh,
KDIGO-AKI, and sodium correction already ship. The remaining
nephrology / urology / advanced-hepatology gap relative to
MDCalc breaks into six bundles that bedside clinicians and
transplant teams hit daily:

1. **Prognosis & alternative eGFR** — KFRE drives nephrology
   referral; CKD-EPI cystatin (and combined Cr-Cys) 2021 is the
   ASN-endorsed race-free replacement for CKD-EPI 2009 in
   uncertain cases; MDRD remains the legacy reference clinicians
   compare against; bedside-Schwartz is the standard peds eGFR.
2. **Electrolytes & osmolarity** — Adrogue-Madias is the formula
   used at every bedside to dose hypo/hypernatremia therapy;
   urine anion gap and urine osmolar gap drive non-anion-gap
   acidosis work-up; TTKG drives the hyperkalemia / hypokalemia
   work-up; FE-Urate distinguishes SIADH from cerebral salt
   wasting; UACR KDIGO is the universal albuminuria stage;
   eAG-from-HbA1c is the patient-facing translation of A1c.
3. **Transplant** — KDPI / EPTS are required at every kidney
   transplant listing; Milan and Up-to-7 are the universal HCC
   liver-transplant criteria.
4. **Urology** — IPSS-BPH is the standard BPH symptom score; PSA
   density is the bedside number that drives prostate-biopsy
   decisions.
5. **Dialysis adequacy** — URR and Daugirdas Kt/V are recorded
   weekly on every hemodialysis patient.
6. **AKI work-up & ADPKD / portal HTN** — FST and renal-angina
   index drive ICU AKI escalation; Mayo ADPKD imaging is required
   for tolvaptan eligibility; Baveno VII is the current cACLD /
   CSPH risk stratifier.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v19
specifically defers:

- **CKD-EPI 2009 (race-coefficient).** Already implemented in
  [egfr](../lib/meta.js); the 2021 race-free CKD-EPI is the
  ASN-recommended successor and is already shipped. The 1999
  MDRD ships in v19 as a side-by-side comparator clinicians
  request, not a recommendation.
- **GRACE for CKD, MIPI-CKD, ADPKD outcome with Mayo Class +
  TKV trajectory.** Defer to a future CKD-progression bundle.
- **Partin tables / PIRADS / decipher.** Imaging-or-genomic;
  defer to a future prostate-cancer bundle.
- **APRI / FIB-4.** Already shipped.
- **Lille / Maddrey.** Already shipped under hepatology meta.
- **Schwartz 1976 original (k-constant).** Bedside-Schwartz 2009
  is the IDMS-aligned recommendation; the 1976 version is now
  considered to overestimate.

## 3. The 25 tiles

### 3.1 Kidney-failure prognosis & GFR estimation

#### 3.1.1 `kfre-tangri` — Kidney Failure Risk Equation (Tangri)

- **Citation:** Tangri N, Stevens LA, Griffith J, et al. *A predictive model for progression of chronic kidney disease to kidney failure.* JAMA 2011;305(15):1553-1559. 4-variable + 8-variable, North-American & non-North-American calibration.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `internal-medicine`, `family-medicine`.
- **Inputs (4-var):** Age, sex, eGFR, UACR. **(8-var):** + serum Ca, P, albumin, bicarbonate.
- **Formula:** Cox baseline survival × exp(Σ βᵢ·xᵢ); coefficients hard-coded from primary Tables 2 & 3.
- **Output:** 2-yr and 5-yr probability of kidney failure (RRT or death from ESRD).
- **Bands:** KDIGO 2024 referral thresholds at 5-yr ≥5% (nephrology referral) and ≥10% (transplant / vascular access planning).

#### 3.1.2 `ckd-epi-cystatin-2021` — CKD-EPI cystatin C 2021

- **Citation:** Inker LA, Eneanya ND, Coresh J, et al. *New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race.* N Engl J Med 2021;385(19):1737-1749.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `oncology`, `cardiology`.
- **Inputs:** Sex, age, cystatin C (mg/L).
- **Formula:** 133 × min(Scys/0.8,1)^α × max(Scys/0.8,1)^−1.328 × 0.996^age × 0.932 [if female]; α = −0.499 (F) / −0.499 (M) per primary supplement.
- **Output:** eGFRcys mL/min/1.73m².

#### 3.1.3 `ckd-epi-cr-cys-2021` — CKD-EPI creatinine + cystatin 2021

- **Citation:** Inker LA, et al. NEJM 2021 (as above).
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `oncology`.
- **Inputs:** Sex, age, creatinine (mg/dL), cystatin C (mg/L).
- **Formula:** Combined-marker equation from primary supplement Table S6.
- **Output:** eGFRcr-cys.

#### 3.1.4 `mdrd-1999` — MDRD Study Equation (4-var, IDMS-traceable)

- **Citation:** Levey AS, Bosch JP, Lewis JB, Greene T, Rogers N, Roth D. *A more accurate method to estimate glomerular filtration rate from serum creatinine.* Ann Intern Med 1999;130(6):461-470. IDMS-traceable recalibration: Levey AS, et al. Clin Chem 2007;53(4):766-772.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`.
- **Inputs:** Sex, age, creatinine.
- **Formula:** 175 × (Scr)^−1.154 × age^−0.203 × 0.742 [F]. (Race coefficient deprecated; not implemented.)
- **Note:** Shipped as a legacy comparator. UI banner: "MDRD overestimates GFR at >60; prefer CKD-EPI 2021."

#### 3.1.5 `bedside-schwartz-2009` — Bedside Schwartz peds eGFR

- **Citation:** Schwartz GJ, Muñoz A, Schneider MF, et al. *New equations to estimate GFR in children with CKD.* J Am Soc Nephrol 2009;20(3):629-637.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `pediatrics`, `nephrology`.
- **Inputs:** Height (cm), creatinine (mg/dL).
- **Formula:** eGFR = 0.413 × height / Scr.
- **Output:** mL/min/1.73m².

### 3.2 Electrolyte & osmolar calculations

#### 3.2.1 `adrogue-madias` — Adrogue-Madias sodium-change estimator

- **Citation:** Adrogué HJ, Madias NE. *Hyponatremia.* N Engl J Med 2000;342(21):1581-1589; *Hypernatremia.* N Engl J Med 2000;342(20):1493-1499.
- **Group:** Drug-Dose Calculators (`F`).
- **Specialties:** `nephrology`, `critical-care`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** Patient Na, infused-fluid Na, infused-fluid K, total body water (sex × weight × 0.6 / 0.5 / 0.45 by age/sex per primary Tables).
- **Formula:** ΔNa per L infusate = (infusate Na + infusate K − serum Na) / (TBW + 1).
- **Output:** Predicted change in Na per liter; recommended infusion rate for a target ΔNa over a set duration.
- **Guardrails:** Warn if target rate exceeds 8 mEq/L per 24 h in hyponatremia (per 2023 ESICM / KDIGO osmotic-demyelination guidance).

#### 3.2.2 `urine-anion-gap` — Urine anion gap

- **Citation:** Goldstein MB, Bear R, Richardson RM, Marsden PA, Halperin ML. *The urine anion gap: a clinically useful index of ammonium excretion.* Am J Med Sci 1986;292(4):198-202.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `pediatrics`.
- **Inputs:** Urine Na, K, Cl.
- **Formula:** UAG = (Una + Uk) − Ucl.
- **Output:** mEq/L; negative = appropriate NH4+ excretion (e.g., GI loss); positive = impaired NH4+ excretion (e.g., RTA).

#### 3.2.3 `urine-osm-gap` — Urine osmolar gap

- **Citation:** Halperin ML, Goldstein MB. *Fluid, Electrolyte, and Acid-Base Physiology.* 4th ed. Saunders; 2010 §3.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`.
- **Inputs:** Measured urine osm, urine Na, K, urea, glucose.
- **Formula:** Calculated osm = 2(Una + Uk) + Uurea/2.8 + Uglu/18. Gap = measured − calculated.
- **Output:** mOsm/kg; >400 = high NH4+ excretion.

#### 3.2.4 `ttkg` — Transtubular Potassium Gradient

- **Citation:** Ethier JH, Kamel KS, Magner PO, Lemann J Jr, Halperin ML. *The transtubular potassium concentration in patients with hypokalemia and hyperkalemia.* Am J Kidney Dis 1990;15(4):309-315.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`.
- **Inputs:** Urine K, plasma K, urine osm, plasma osm.
- **Formula:** TTKG = (Uk × Posm) / (Pk × Uosm). Requires Uosm > Posm.
- **Output:** Hyperkalemia: TTKG <7 suggests hypoaldosteronism; hypokalemia: TTKG >3 suggests renal K wasting.
- **Note:** Banner notes Kamel-Halperin 2011 critique that TTKG should not be used when Uosm ≤ Posm.

#### 3.2.5 `fe-urate` — Fractional excretion of urate

- **Citation:** Beck LH. *Hypouricemia in the syndrome of inappropriate secretion of antidiuretic hormone.* N Engl J Med 1979;301(10):528-530.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `critical-care`.
- **Inputs:** Serum urate, urine urate, serum Cr, urine Cr.
- **Formula:** FEUA = (Uua × Scr) / (Sua × Ucr) × 100.
- **Output:** FEUA <11% = volume depletion; ≥11% suggests SIADH or cerebral salt wasting.

#### 3.2.6 `uacr-kdigo` — UACR / KDIGO albuminuria staging

- **Citation:** KDIGO. *2024 Clinical Practice Guideline for the Evaluation and Management of CKD.* Kidney Int 2024;105(4S):S117-S314.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nephrology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Urine albumin (mg/dL or mg/L), urine creatinine (mg/dL or g/L).
- **Formula:** UACR = urine albumin / urine Cr.
- **Bands:** A1 <30 mg/g (normal/mildly elevated), A2 30–299 (moderately), A3 ≥300 (severely).

#### 3.2.7 `eag-from-hba1c` — Estimated Average Glucose from HbA1c

- **Citation:** Nathan DM, Kuenen J, Borg R, Zheng H, Schoenfeld D, Heine RJ; A1c-Derived Average Glucose Study Group. *Translating the A1C assay into estimated average glucose values.* Diabetes Care 2008;31(8):1473-1478.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `endocrinology`, `internal-medicine`, `family-medicine`.
- **Inputs:** HbA1c (%).
- **Formula:** eAG (mg/dL) = 28.7 × HbA1c − 46.7. (mmol/L = 1.59 × HbA1c − 2.59.)
- **Output:** eAG.

#### 3.2.8 `effective-osmolarity` — Effective (tonicity) osmolarity

- **Citation:** Sterns RH. *Disorders of plasma sodium — causes, consequences, and correction.* N Engl J Med 2015;372(1):55-65.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`, `internal-medicine`, `critical-care`.
- **Inputs:** Na, glucose.
- **Formula:** Effective osm = 2×Na + glucose/18 (urea excluded because it is membrane-permeable).
- **Output:** mOsm/kg; primary anchor for tonicity-driven shifts.

### 3.3 Transplant scoring

#### 3.3.1 `kdpi` — Kidney Donor Profile Index

- **Citation:** Rao PS, Schaubel DE, Guidinger MK, et al. *A comprehensive risk quantification score for deceased donor kidneys: the kidney donor risk index.* Transplantation 2009;88(2):231-236. OPTN 2024 KDPI mapping: optn.transplant.hrsa.gov.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `transplant-surgery`.
- **Inputs:** Donor age, height, weight, ethnicity, history of HTN, DM, cause of death (CVA), creatinine, HCV+, DCD.
- **Output:** KDRI raw → KDPI percentile (0–100) by OPTN annual cohort mapping; tile ships the most recent published OPTN mapping with citation, banner notes ship-date.

#### 3.3.2 `epts` — Estimated Post-Transplant Survival score

- **Citation:** OPTN. *Estimated Post Transplant Survival (EPTS) Calculator.* optn.transplant.hrsa.gov/professionals/by-organ/kidney-pancreas/.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nephrology`, `transplant-surgery`.
- **Inputs:** Candidate age, time on dialysis, diabetes status, prior transplant.
- **Output:** EPTS raw → percentile (0–100); candidates ≤20% receive top-20% KDPI offers per Kidney Allocation System 2014.

#### 3.3.3 `milan-hcc` — Milan criteria for HCC liver transplant

- **Citation:** Mazzaferro V, Regalia E, Doci R, et al. *Liver transplantation for the treatment of small hepatocellular carcinomas in patients with cirrhosis.* N Engl J Med 1996;334(11):693-699.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `hepatology`, `transplant-surgery`, `oncology`.
- **Inputs:** Single tumor ≤5 cm OR up to 3 tumors each ≤3 cm. No vascular invasion, no extrahepatic.
- **Output:** Meets / does not meet Milan.

#### 3.3.4 `up-to-7-hcc` — Up-to-7 expanded criteria

- **Citation:** Mazzaferro V, Llovet JM, Miceli R, et al. *Predicting survival after liver transplantation in patients with hepatocellular carcinoma beyond the Milan criteria.* Lancet Oncol 2009;10(1):35-43.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `hepatology`, `transplant-surgery`, `oncology`.
- **Inputs:** Largest tumor diameter (cm), number of tumors.
- **Rule:** Sum of size + number ≤ 7; no vascular invasion / extrahepatic.

### 3.4 Urology

#### 3.4.1 `ipss-bph` — International Prostate Symptom Score

- **Citation:** Barry MJ, Fowler FJ Jr, O'Leary MP, et al. *The American Urological Association symptom index for benign prostatic hyperplasia.* J Urol 1992;148(5):1549-1557.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `urology`, `family-medicine`, `internal-medicine`.
- **Inputs:** 7 symptom items (each 0–5) + bother-question (0–6 quality-of-life).
- **Output:** 0–7 mild, 8–19 moderate, 20–35 severe.

#### 3.4.2 `psa-density` — PSA density

- **Citation:** Benson MC, Whang IS, Olsson CA, McMahon DJ, Cooner WH. *The use of prostate specific antigen density to enhance the predictive value of intermediate levels of serum prostate specific antigen.* J Urol 1992;147(3 Pt 2):817-821.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `urology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Serum PSA (ng/mL), prostate volume (cc on TRUS or MRI).
- **Formula:** PSAD = PSA / volume.
- **Bands:** ≥0.15 ng/mL/cc traditionally favors biopsy; MRI-PIRADS-aware modern thresholds note context (PI-RADS 3 + PSAD ≥0.15 → biopsy).

### 3.5 Dialysis adequacy

#### 3.5.1 `urr-dialysis` — Urea Reduction Ratio

- **Citation:** Lowrie EG, Lew NL. *The urea reduction ratio (URR): a simple method for evaluating hemodialysis treatment.* Contemp Dial Nephrol 1991;12:11-20.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`.
- **Inputs:** Pre-dialysis BUN, post-dialysis BUN.
- **Formula:** URR = (1 − post/pre) × 100.
- **Output:** %; ≥65% is the Kidney Care Quality Improvement Program (CMS) threshold.

#### 3.5.2 `ktv-daugirdas` — Single-pool Kt/V (Daugirdas 2nd-generation)

- **Citation:** Daugirdas JT. *Second-generation logarithmic estimates of single-pool variable volume Kt/V: an analysis of error.* J Am Soc Nephrol 1993;4(5):1205-1213.
- **Group:** Lab & Unit Conversions (`E`).
- **Specialties:** `nephrology`.
- **Inputs:** Pre & post BUN, treatment time (h), ultrafiltration volume (L), post-weight (kg).
- **Formula:** Kt/V = − ln(R − 0.008·t) + (4 − 3.5·R)·UF/W, where R = post/pre.
- **Output:** Kt/V; ≥1.2 KDOQI thrice-weekly target; ≥1.4 KDIGO 2015 minimum-delivered.

### 3.6 AKI work-up & escalation

#### 3.6.1 `fst-furosemide` — Furosemide Stress Test interpretation

- **Citation:** Chawla LS, Davison DL, Brasha-Mitchell E, et al. *Development and standardization of a furosemide stress test to predict the severity of acute kidney injury.* Crit Care 2013;17(5):R207.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nephrology`, `critical-care`, `internal-medicine`.
- **Inputs:** Hourly urine output post-IV furosemide (1.0 or 1.5 mg/kg) for 2 h.
- **Rule:** Urine output <200 mL over 2 h → high probability of progression to AKIN stage 3 (AUC 0.87 in derivation).

#### 3.6.2 `renal-angina-index` — ICU Renal Angina Index (peds)

- **Citation:** Basu RK, Zappitelli M, Brunner L, et al. *Derivation and validation of the renal angina index to improve the prediction of acute kidney injury in critically ill children.* Kidney Int 2014;85(3):659-667.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `critical-care`, `nephrology`.
- **Inputs:** Risk stratum (ICU admit / SOT / ventilation+vasopressor) × injury (creatinine clearance fall / fluid overload).
- **Formula:** RAI = risk × injury, range 1–40.
- **Output:** RAI ≥8 = positive renal-angina → biomarker / nephrology work-up indicated.

### 3.7 Structural & portal liver disease (advanced)

#### 3.7.1 `mayo-adpkd` — Mayo ADPKD imaging classification

- **Citation:** Irazabal MV, Rangel LJ, Bergstralh EJ, et al. *Imaging classification of autosomal dominant polycystic kidney disease.* J Am Soc Nephrol 2015;26(1):160-172.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nephrology`, `radiology`.
- **Inputs:** Height-adjusted total kidney volume (htTKV, mL/m), age.
- **Formula:** Estimated annual htTKV growth from Mayo curves → Class 1A / 1B / 1C / 1D / 1E (typical ADPKD with htTKV-percentile by age) vs Class 2 (atypical pattern).
- **Output:** Tolvaptan eligibility: Class 1C / 1D / 1E (rapidly progressive).

#### 3.7.2 `baveno-vii-portal-htn` — Baveno VII cACLD / CSPH risk

- **Citation:** de Franchis R, Bosch J, Garcia-Tsao G, Reiberger T, Ripoll C; Baveno VII Faculty. *Baveno VII — Renewing consensus in portal hypertension.* J Hepatol 2022;76(4):959-974.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `hepatology`, `gastroenterology`.
- **Inputs:** Liver stiffness (kPa, FibroScan), platelet count, BMI / etiology.
- **Rule:**
  - cACLD: LSM ≥10 kPa.
  - "Rule-of-5" for cACLD progression: 10/15/20/25 kPa cut-points correlate with decompensation risk.
  - CSPH (compensated): LSM ≥25 kPa = CSPH; LSM 20–25 + platelets <150 → likely CSPH; LSM <15 + platelets >150 → rules out CSPH (NPV ≥90%).
- **Output:** cACLD / CSPH bands per Baveno VII §2.

## 4. Group homes

- Lab & Unit Conversions (`E`): §3.1.2–§3.1.5, §3.2.2–§3.2.8, §3.4.2, §3.5.1, §3.5.2.
- Drug-Dose Calculators (`F`): §3.2.1 (Adrogue-Madias — outputs an infusion rate).
- Clinical Scoring & Risk (`G`): §3.1.1, §3.3.1, §3.3.2, §3.6.2.
- Clinical Criteria & Diagnostic Bundles (`H`): §3.2.6, §3.3.3, §3.3.4, §3.6.1, §3.7.1, §3.7.2.
- Patient-Reported Symptom Indices (`I`): §3.4.1.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md).

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v18    | 353 | +25 |
| **v19**| **378** | **+25** |
