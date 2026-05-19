# spec-v17.md — cardiology, heart-failure, ACS chest-pain, structural & surgical-cardiac risk (25 tiles)

> Status: proposed (2026-05-18). v17 is the sixth catalog-growth
> spec and the first of the v17–v20 tranche that adds the next
> 100 tiles after the v12–v16 close (303 tiles). v17 concentrates
> on adult **cardiology**: long-horizon ASCVD risk variants (ESC
> SCORE2 family, the 2024 ESC CHA2DS2-VA update), heart-failure
> mortality and ED-disposition models, chest-pain stratification
> tools that complement HEART/TIMI/GRACE (EDACS, INTERCHEST,
> Marburg, Duke Treadmill, Killip, Forrester), structural / valve
> work-up (Duke IE, modified Jones, InterTAK Takotsubo, ADD-RS,
> ECG LVH voltage criteria), cardiogenic-shock staging, and the
> two surgical-cardiac risk models bedside clinicians and pre-op
> consultants use most after RCRI (EuroSCORE II, STS-CABG short
> form). It also adds pretest-probability for stable CAD (CAD
> Consortium clinical model) which now appears in ESC/AHA chest-
> pain guidelines.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v17 amends no hard rule from v10–v16. Catalog growth: at v16
> close 303 tiles; at v17 close **328 tiles**.
>
> v17 opens the v17–v20 tranche, the second 100-tile increment
> toward the 400–600-tile parity target in
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).

## 1. Why v17 exists

v12 covered general internal medicine; v13 covered ICU; v14
covered peri-op and anticoagulation; v15 covered OB/peds/trauma;
v16 covered stroke, heme-onc, endocrine and advanced GI. The
single largest remaining MDCalc-parity gap is adult cardiology
*outside* of the ACS short-list that already ships (HEART, TIMI,
GRACE, CHADS / CHA2DS2-VASc, ASCVD, PREVENT). v17 closes it.

The 25 tiles below were selected under the v12 §1 criteria:

1. **Clinical frequency.** Each tile drives a decision that
   bedside cardiology, hospitalist, ED, or peri-op clinicians
   make most shifts: long-horizon ESC primary-prevention risk
   (SCORE2 family), HF mortality / disposition (MAGGIC, Seattle,
   GWTG-HF, Ottawa-HF, EHMRG), low-risk chest-pain disposition
   (EDACS, INTERCHEST, Marburg, Killip, Forrester, Duke
   Treadmill), structural / valve / pericardial work-up (Duke
   IE, modified Jones, InterTAK, ADD-RS, Sokolow-Lyon, Cornell),
   cardiogenic-shock staging (SCAI), and adult cardiac surgery
   risk (EuroSCORE II, STS-CABG).
2. **Source stability.** Each tile's primary citation is a
   peer-reviewed paper or society derivation stable on decade-
   plus timescales, or — for the four most-recently-revised
   tiles (SCORE2, SCORE2-OP, SCORE2-Diabetes, CHA2DS2-VA, SCAI
   Shock 2022 revision) — a society document whose successor
   revisions amend coefficients, not structure.
3. **Audit feasibility under the v11 floor.** Each tile has at
   least three boundary worked examples derivable by hand from
   the primary source, and an independent reference
   implementation the auditor can use for the cross-
   implementation differential.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v17
specifically defers:

- **HCM-SCD risk calculator (ESC).** Requires LV outflow gradient
  and family-history details that are not bedside-fast; defer to
  a future structural / cardiomyopathy bundle.
- **CARPREG II / ZAHARA / mWHO** — pregnancy in heart disease;
  defer to an OB-cardiac bundle.
- **PARTNER / TVT / COAPT nomograms** — proprietary TAVR/MitraClip
  models with non-public coefficients; out of scope.
- **AHA 2018 cholesterol risk-enhancer checklist** — qualitative;
  better as a reference tile in [scope-mdcalc-parity §1
  item 1](scope-mdcalc-parity.md).
- **MAGGIC-AF, GWTG-AFib** — narrower than the v17 selections;
  defer.
- **STS-AVR / STS-MVR** — separate procedure-specific STS models;
  v17 ships STS-CABG short form only; AVR/MVR are deferred to a
  later structural-cardiac bundle.

## 3. The 25 tiles

Each tile specifies a stable id, visible name, primary citation,
v11 specialty-group home, the input fields with units, the
formula or scoring procedure, the band / output structure, at
least one worked example (the full ≥3 boundary set is
constructed during the v11 audit), and the `interpretation` band
when the primary source publishes per-band guidance per
[spec-v11 §5](spec-v11.md).

### 3.1 ESC long-horizon primary-prevention risk

#### 3.1.1 `cha2ds2-va` — CHA₂DS₂-VA (ESC 2024)

- **Citation:** Van Gelder IC, Rienstra M, Bunting KV, et al.
  *2024 ESC Guidelines for the management of atrial fibrillation
  developed in collaboration with EACTS.* Eur Heart J
  2024;45(36):3314-3414.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** CHF/LV dysfunction, hypertension, age (<65 / 65–74 / ≥75), diabetes, prior stroke/TIA/TE, vascular disease (prior MI, PAD, aortic plaque). **Sex is not scored.**
- **Scoring:** Age ≥75 = 2; prior stroke/TIA/TE = 2; CHF, HTN, DM, vascular disease, age 65–74 = 1 each. Range 0–8.
- **Bands:** 0 = no anticoagulation; 1 = consider; ≥2 = recommend (ESC 2024 Class I for ≥2, IIa for 1).
- **Worked example:** CHF + HTN + age 70 + DM = 1+1+1+1 = 4 → recommend OAC.
- **Interpretation:** Quoted verbatim from ESC 2024 §10.2.

#### 3.1.2 `score2` — SCORE2 (ESC 10-yr CV risk, age 40–69)

- **Citation:** SCORE2 working group, ESC Cardiovascular risk
  collaboration. *SCORE2 risk prediction algorithms.* Eur Heart J
  2021;42(25):2439-2454.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `family-medicine`, `nursing-general`.
- **Inputs:** Age (40–69), sex, smoker (yes/no), SBP (mmHg), non-HDL-C (mmol/L or mg/dL), region (low / moderate / high / very-high ESC risk region).
- **Formula:** Sex-specific Cox baseline survival × exp(Σ βᵢ·xᵢ) with region recalibration constants from Table 5 of the primary paper. Pure JS implementation; coefficients hard-coded with citation in source comment.
- **Bands (age <50 / 50–69 / ≥70):** thresholds per ESC 2021 Table 6 (<2.5%/<5%/<7.5% low; 2.5–7.5%/5–10%/7.5–15% moderate; ≥7.5%/≥10%/≥15% high).
- **Worked example:** Female, 55, non-smoker, SBP 130, non-HDL 4.0, low-risk region → ~2.4% → low.
- **Interpretation:** Quoted from ESC 2021 Table 6.

#### 3.1.3 `score2-op` — SCORE2-OP (older persons, age ≥70)

- **Citation:** SCORE2-OP working group, ESC Cardiovascular risk
  collaboration. *SCORE2-OP risk prediction algorithms.* Eur Heart J
  2021;42(25):2455-2467.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `geriatric-medicine`, `internal-medicine`.
- **Inputs:** Age (70–89), sex, smoker, SBP, non-HDL-C, region.
- **Formula:** Sex-specific Fine-Gray sub-distribution hazard with competing-risk adjustment for non-CV death; coefficients from Table 4 of primary paper.
- **Bands:** ≥70: low <7.5%, moderate 7.5–15%, high ≥15%.
- **Worked example:** Male, 75, smoker, SBP 150, non-HDL 4.0, moderate-risk region → ~22% → high.

#### 3.1.4 `score2-diabetes` — SCORE2-Diabetes

- **Citation:** SCORE2-Diabetes working group. *SCORE2-Diabetes:
  10-year cardiovascular risk estimation in type 2 diabetes in
  Europe.* Eur Heart J 2023;44(28):2544-2556.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `endocrinology`, `internal-medicine`.
- **Inputs:** SCORE2 inputs + age at T2DM diagnosis, HbA1c (mmol/mol), eGFR (mL/min/1.73m²).
- **Formula:** SCORE2 sex-specific Cox baseline + 4 additional T2DM-specific covariate coefficients from Table 3 of the primary paper.
- **Bands:** Same as SCORE2/SCORE2-OP by age band.
- **Worked example:** Female, 60, T2DM diagnosed age 55, HbA1c 64 mmol/mol, eGFR 70, SBP 140, non-HDL 4.0, low-risk region → ~10% → high.

### 3.2 Heart-failure mortality and disposition

#### 3.2.1 `maggic-hf` — MAGGIC HF mortality

- **Citation:** Pocock SJ, Ariti CA, McMurray JJV, et al. *Predicting survival in heart failure: a risk score based on 39 372 patients from 30 studies.* Eur Heart J 2013;34(19):1404-1413.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** Age, sex, ejection fraction (%), NYHA class, BMI, SBP, creatinine, smoker, diabetes, COPD, HF >18 mo, beta-blocker, ACE-i/ARB.
- **Scoring:** Point lookup tables from primary paper Tables 2–3; sum yields 1-yr and 3-yr mortality.
- **Bands:** 1-yr / 3-yr mortality percent.
- **Worked example:** 70F, EF 25%, NYHA III, BMI 22, SBP 110, Cr 1.5, DM, on β-blocker + ACE-i, score 26 → 1-yr ~21%, 3-yr ~50%.

#### 3.2.2 `seattle-hf` — Seattle Heart Failure Model

- **Citation:** Levy WC, Mozaffarian D, Linker DT, et al. *The Seattle Heart Failure Model: prediction of survival in heart failure.* Circulation 2006;113(11):1424-1433.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** Age, sex, NYHA, EF, ischemic etiology, SBP, Na, Hgb, lymphocyte %, uric acid, cholesterol, medications (β-blocker, ACE-i/ARB, statin, allopurinol, diuretic dose), device therapy (ICD, CRT).
- **Formula:** Sum of medication / device hazard ratios applied to baseline survival; coefficients hard-coded from primary paper Tables 1–2.
- **Bands:** 1-yr, 2-yr, 5-yr mean survival percent.
- **Worked example:** 65M, EF 30%, NYHA III, ischemic, on β-blocker + ACE-i + statin + ICD, predicted 1-yr ~89%, 5-yr ~58%.

#### 3.2.3 `gwtg-hf` — Get With The Guidelines HF mortality

- **Citation:** Peterson PN, Rumsfeld JS, Liang L, et al. *A validated risk score for in-hospital mortality in patients with heart failure from the American Heart Association Get With The Guidelines program.* Circ Cardiovasc Qual Outcomes 2010;3(1):25-32.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `hospital-medicine`.
- **Inputs:** Age, SBP, BUN, sodium, race (Black vs other), COPD, heart rate.
- **Scoring:** Point table from primary paper Table 2; sum 0–100.
- **Bands:** In-hospital mortality from <1% (≤33) to >50% (≥79).
- **Worked example:** 75M, SBP 110, BUN 30, Na 138, no COPD, HR 95, non-Black → 52 → ~3.7%.

#### 3.2.4 `ottawa-hf-ed` — Ottawa Heart Failure Risk Scale

- **Citation:** Stiell IG, Perry JJ, Clement CM, et al. *Prospective and explicit clinical validation of the Ottawa Heart Failure Risk Scale.* Acad Emerg Med 2017;24(3):316-327.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `cardiology`.
- **Inputs:** Stroke/TIA history, intubation for respiratory distress, HR ≥110 on arrival, SaO₂ <90% on arrival, ECG ischemic changes, urea ≥12 mmol/L, troponin elevated, NT-proBNP ≥5000 ng/L, walk test SaO₂ <90%.
- **Scoring:** Each criterion 1 point (NT-proBNP and walk test 2 points each); range 0–13.
- **Bands:** 0 = low; 1–2 = medium; ≥3 = high 30-day serious-outcome risk.
- **Worked example:** Walk-test desat (2) + troponin (1) + HR 115 (1) → 4 → high.

#### 3.2.5 `ehmrg` — Emergency Heart Failure Mortality Risk Grade

- **Citation:** Lee DS, Stitt A, Austin PC, et al. *Prediction of heart failure mortality in emergent care: a cohort study.* Ann Intern Med 2012;156(11):767-775.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `cardiology`.
- **Inputs:** Age, EMS transport (yes/no), SBP, HR, O₂ sat, creatinine, K⁺, troponin elevated, active cancer, metolazone use.
- **Formula:** Weighted-sum point system from Table 2 of the primary paper; 7-day mortality cut-offs at quintile.
- **Bands:** Group 1 (lowest) → Group 5b (highest); 7-day mortality 0.3% → >8%.
- **Worked example:** 80M, SBP 90, HR 100, O₂ 92%, Cr 2.0, K 5.0, troponin+, no cancer → group 5 → ~6%.

### 3.3 Chest-pain stratification (HEART/TIMI/GRACE complements)

#### 3.3.1 `edacs` — Emergency Department Assessment of Chest Pain Score

- **Citation:** Than M, Flaws D, Sanders S, et al. *Development and validation of the Emergency Department Assessment of Chest pain Score and 2 h accelerated diagnostic protocol.* Emerg Med Australas 2014;26(1):34-44.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `cardiology`.
- **Inputs:** Age, sex, known CAD or ≥3 risk factors, diaphoresis, pain radiation to arm/shoulder, pain worse with inspiration, pain reproducible by palpation.
- **Scoring:** Age × points (per 5-yr band, from primary Table 3), +6 if male, +4 if known CAD/≥3 RFs (age <50), +3 diaphoresis, +5 radiation, -4 pleuritic, -6 reproducible. Range -18 to +56.
- **Bands:** <16 = low risk (eligible for ADP rule-out); ≥16 = not low.
- **Worked example:** 55M, no CAD, diaphoresis, no radiation, no pleuritic, not reproducible → age 16 + male 6 + sweat 3 = 25 → not low.

#### 3.3.2 `marburg-hs` — Marburg Heart Score (primary-care chest pain)

- **Citation:** Bösner S, Haasenritter J, Becker A, et al. *Ruling out coronary artery disease in primary care: development and validation of a simple prediction rule.* CMAJ 2010;182(12):1295-1300.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `family-medicine`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** Age/sex (≥55M or ≥65F), known CAD/PAD/CVD, exertional pain, not reproducible by palpation, patient suspects cardiac cause. Each = 1 point. Range 0–5.
- **Bands:** 0–2 = CAD unlikely (NPV ≥97%); 3–5 = consider workup.
- **Worked example:** 60M, exertional, suspects cardiac, no known CAD, reproducible on palpation → 1+1+1 = 3 → workup.

#### 3.3.3 `interchest` — INTERCHEST primary-care chest-pain rule

- **Citation:** Aerts M, Minalu G, Bösner S, et al. *Pooled individual patient data from five countries were used to derive a clinical prediction rule for coronary artery disease in primary care.* J Clin Epidemiol 2017;81:120-128.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `family-medicine`, `internal-medicine`.
- **Inputs:** Age/sex risk (≥55M / ≥65F), known vascular disease, exertional pain, not reproducible, suspected cardiac cause, pain duration 1 h–1 mo. Weighted (1, 1, 1, 1, 1, -1). Range −1 to 5.
- **Bands:** ≤1 = CAD unlikely; ≥2 = consider workup.

#### 3.3.4 `duke-treadmill` — Duke Treadmill Score

- **Citation:** Mark DB, Hlatky MA, Harrell FE Jr, et al. *Exercise treadmill score for predicting prognosis in coronary artery disease.* Ann Intern Med 1987;106(6):793-800.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** Exercise duration (min, Bruce protocol), maximum ST deviation (mm), exercise angina index (0 none / 1 non-limiting / 2 limiting).
- **Formula:** DTS = duration − 5 × ST − 4 × angina_index.
- **Bands:** ≥+5 = low-risk (1-yr mortality 0.25%); −10 to +4 = moderate; ≤−11 = high-risk.

#### 3.3.5 `killip` — Killip class

- **Citation:** Killip T 3rd, Kimball JT. *Treatment of myocardial infarction in a coronary care unit.* Am J Cardiol 1967;20(4):457-464.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`, `critical-care`.
- **Inputs:** Clinical exam: no signs of failure (I), rales <50% of lung fields / S3 / elevated JVP (II), frank pulmonary edema (III), cardiogenic shock (IV).
- **Bands:** I → IV with 30-day mortality (from Khot 2003 reanalysis): I 5%, II 14%, III 32%, IV 58%.

#### 3.3.6 `forrester` — Forrester hemodynamic subsets

- **Citation:** Forrester JS, Diamond GA, Swan HJC. *Correlative classification of clinical and hemodynamic function after acute myocardial infarction.* Am J Cardiol 1977;39(2):137-145.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `critical-care`.
- **Inputs:** Cardiac index (≤2.2 vs >2.2 L/min/m²), pulmonary-capillary wedge pressure (≤18 vs >18 mmHg).
- **Bands:** Subset I (warm-dry), II (warm-wet), III (cold-dry), IV (cold-wet), with mortality 3 / 9 / 23 / 51%.

### 3.4 Structural, valve, pericardial, rheumatic

#### 3.4.1 `duke-ie` — Modified Duke criteria for infective endocarditis

- **Citation:** Li JS, Sexton DJ, Mick N, et al. *Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis.* Clin Infect Dis 2000;30(4):633-638. 2023 update: Fowler VG et al. *The 2023 Duke-ISCVID Criteria for IE.* Clin Infect Dis 2023;77(4):518-526.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `infectious-disease`, `internal-medicine`.
- **Inputs:** Major criteria (blood culture + typical organism, evidence of endocardial involvement on echo) + minor criteria (predisposition, fever ≥38, vascular phenomena, immunologic phenomena, microbiologic evidence not meeting major).
- **Output:** Definite (2 major / 1 major + 3 minor / 5 minor), Possible (1 major + 1 minor / 3 minor), Rejected.

#### 3.4.2 `modified-jones` — Modified Jones criteria for acute rheumatic fever

- **Citation:** Gewitz MH, Baltimore RS, Tani LY, et al. *Revision of the Jones criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography.* Circulation 2015;131(20):1806-1818.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `pediatrics`, `infectious-disease`.
- **Inputs:** Population risk (low vs moderate/high), major criteria (carditis incl. subclinical, polyarthritis or monoarthritis/polyarthralgia in moderate/high risk, chorea, erythema marginatum, subcutaneous nodules), minor (fever ≥38.5, polyarthralgia in low-risk, ESR/CRP elevated, prolonged PR).
- **Output:** Initial ARF = 2 major or 1 major + 2 minor with GAS evidence; Recurrent ARF = 2 major / 1 major + 2 minor / 3 minor.

#### 3.4.3 `add-rs` — Aortic Dissection Detection Risk Score

- **Citation:** Rogers AM, Hermann LK, Booher AM, et al. *Sensitivity of the aortic dissection detection risk score, a novel guideline-based tool for identification of acute aortic dissection at initial presentation.* Circulation 2011;123(20):2213-2218.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `cardiology`, `vascular-surgery`.
- **Inputs:** Three categories (high-risk conditions, high-risk pain features, high-risk exam) each scored as 1 point if any feature present. Range 0–3.
- **Bands:** 0 = low; 1 = intermediate; ≥2 = high — combined with d-dimer per 2022 ACC/AHA guideline.

#### 3.4.4 `intertak` — InterTAK diagnostic score for Takotsubo

- **Citation:** Ghadri JR, Cammann VL, Jurisic S, et al. *A novel clinical score (InterTAK Diagnostic Score) to differentiate Takotsubo syndrome from acute coronary syndrome.* Eur J Heart Fail 2017;19(8):1036-1042.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `emergency-medicine`.
- **Inputs:** Female sex (25), emotional trigger (24), physical trigger (13), absence of ST-depression (12), psychiatric disorders (11), neurologic disorders (9), QTc prolongation (6). Range 0–100.
- **Bands:** ≤30 = low; 31–69 = intermediate; ≥70 = high probability of Takotsubo.

#### 3.4.5 `sokolow-lvh` — Sokolow-Lyon LVH voltage criteria

- **Citation:** Sokolow M, Lyon TP. *The ventricular complex in left ventricular hypertrophy as obtained by unipolar precordial and limb leads.* Am Heart J 1949;37(2):161-186.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** S wave V1 (mm) + R wave V5 or V6 (mm, whichever larger).
- **Threshold:** ≥35 mm = LVH by voltage.

#### 3.4.6 `cornell-lvh` — Cornell voltage and product

- **Citation:** Casale PN, Devereux RB, Alonso DR, Campo E, Kligfield P. *Improved sex-specific criteria of left ventricular hypertrophy for clinical diagnosis of anatomic left ventricular hypertrophy.* Circulation 1987;75(3):565-572.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`.
- **Inputs:** R aVL + S V3 (mm), sex, QRS duration (ms).
- **Threshold:** Voltage >28 mm (M) / >20 mm (F); Cornell product = voltage × QRS, >2440 mm·ms = LVH.

### 3.5 Cardiogenic shock & adult cardiac surgery risk

#### 3.5.1 `scai-shock` — SCAI SHOCK stages (2022 update)

- **Citation:** Naidu SS, Baran DA, Jentzer JC, et al. *SCAI SHOCK Stage Classification Expert Consensus Update.* J Am Coll Cardiol 2022;79(9):933-946.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `cardiology`, `critical-care`, `emergency-medicine`.
- **Inputs:** Clinical, biochemical, and hemodynamic descriptors per Table 2 of the consensus.
- **Output:** Stage A (at risk), B (beginning), C (classic), D (deteriorating), E (extremis), with an optional "(A)" modifier for arrest.

#### 3.5.2 `euroscore-ii` — EuroSCORE II adult cardiac-surgery mortality

- **Citation:** Nashef SAM, Roques F, Sharples LD, et al. *EuroSCORE II.* Eur J Cardiothorac Surg 2012;41(4):734-744.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiac-surgery`, `cardiology`, `anesthesiology`.
- **Inputs:** 18 covariates: age, sex, renal impairment, extracardiac arteriopathy, poor mobility, prior cardiac surgery, chronic lung disease, active endocarditis, critical preop, diabetes on insulin, NYHA, CCS class 4 angina, LV function, recent MI, pulmonary HTN, urgency, weight of intervention, surgery on thoracic aorta.
- **Formula:** Logistic regression with coefficients from primary paper Table 4; output predicted in-hospital mortality (%).

#### 3.5.3 `sts-cabg` — STS short-form CABG mortality

- **Citation:** Shahian DM, Jacobs JP, Badhwar V, et al. *The Society of Thoracic Surgeons 2018 Adult Cardiac Surgery Risk Models.* Ann Thorac Surg 2018;105(5):1411-1418.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiac-surgery`, `cardiology`.
- **Inputs:** Age, sex, BSA, BMI, ethnicity, diabetes, dialysis, creatinine, prior MI, HF, NYHA, urgency, LV function, prior CABG/valve, immunosuppression. (Short-form subset of the full STS variable list.)
- **Output:** Operative mortality (%). Coefficients from STS 2018 published supplement.
- **Note:** Short-form is explicitly marked as approximate; users requiring the registry version are referred to sts.org.

### 3.6 Stable-CAD pretest probability

#### 3.6.1 `cad-consortium-clinical` — CAD Consortium clinical pretest probability

- **Citation:** Genders TSS, Steyerberg EW, Alkadhi H, et al. *A clinical prediction rule for the diagnosis of coronary artery disease: validation, updating, and extension.* Eur Heart J 2011;32(11):1316-1330. Adopted in ESC 2019 CCS guidelines.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Age, sex, chest-pain type (typical / atypical / non-anginal).
- **Formula:** Logistic-regression coefficients from primary Table 4; output pretest probability of obstructive CAD (%).
- **Bands:** <5% rule out without testing; 5–15% consider further risk modifiers; >15% non-invasive imaging.

## 4. Group homes

All 25 tiles inherit existing v11 group homes:

- §3.1, §3.2, §3.3, §3.4.3–§3.4.6, §3.5.2, §3.5.3, §3.6 → `G` (Clinical Scoring & Risk).
- §3.4.1, §3.4.2, §3.5.1 → `H` (Clinical Criteria & Diagnostic Bundles).

No new group is required.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). For each tile, before
that tile renders to a user in production:

1. `docs/audits/v11/<id>.md` exists in `PASS` or `PASS-WITH-FIXES`.
2. Primary citation re-verified against the published source.
3. ≥3 boundary worked examples in the audit log, each computed
   by hand from the primary source and matching the
   implementation's output within 0.5% (or one ordinal band).
4. Independent reference implementation differential documented.
5. Edge-input handling reviewed (missing inputs, out-of-range,
   sex-specific paths, unit conversions).
6. a11y review: keyboard reachable, screen-reader labels, no
   colour-only band signalling.
7. Per-band `interpretation` is either quoted verbatim from the
   primary source or omitted (per spec-v11 §5.3).

## 6. Catalog ledger

| Spec   | At spec close | Δ this spec |
|--------|---------------|-------------|
| v11    | 178           | (audit-only) |
| v12    | 203           | +25 |
| v13    | 228           | +25 |
| v14    | 253           | +25 |
| v15    | 278           | +25 |
| v16    | 303           | +25 |
| **v17**| **328**       | **+25** |

## 7. What ships after v17

v18–v20 close the second 100-tile increment:

- **v18** — pulmonology, sleep, ENT (25): BODE, GOLD ABCD, CAT,
  mMRC, DECAF, BAP-65, SMART-COP, A-DROP, Light's criteria,
  Heffner's, modified-Light's albumin gradient, CPIS, ACT, c-ACT,
  ACQ, API, SNOT-22, Lund-Mackay, NYHA, WHO-FC PAH, Borg, 6MWT
  predicted, OHS criteria, Friedman Tongue Position, Cormack-
  Lehane.
- **v19** — nephrology, electrolytes, transplant, urology (25):
  KFRE, CKD-EPI cystatin 2021, CKD-EPI Cr-Cys 2021, MDRD,
  bedside-Schwartz peds eGFR, Adrogue-Madias, urine anion gap,
  urine osm gap, TTKG, FE-Urate, UACR KDIGO, eAG from HbA1c,
  KDPI, EPTS, Milan HCC, Up-to-7 HCC, IPSS-BPH, PSA density,
  URR, Daugirdas Kt/V, FST, effective osmolarity, Mayo ADPKD
  imaging, Baveno VII portal HTN, renal angina index.
- **v20** — psych & cognition, geriatrics, rheum, derm, tox,
  surgery (25): MMSE, MoCA, HAM-D, HAM-A, MDQ, C-SSRS structure,
  ASRS v1.1, Y-BOCS, PCL-5, Clinical Frailty Scale, ECOG, KPS,
  DAS28-CRP, CDAI-RA, SDAI, BASDAI, ASDAS-CRP, SLEDAI-2K, PASI,
  EASI, SCORTEN, Rumack-Matthew APAP nomogram, Done salicylate
  nomogram (with explicit historical caveat), P-POSSUM, Surgical
  Apgar.

At v20 close: **403 tiles** — the v12 → v20 tranche completes
the first 225-tile increment toward the 400–600-tile parity
target in [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).
