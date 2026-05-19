# spec-v18.md — pulmonology, sleep, airway & ENT (25 tiles)

> Status: proposed (2026-05-18). v18 is the seventh catalog-
> growth spec and the second of the v17–v20 tranche. It adds 25
> tiles across **chronic-airway disease** (COPD severity / GOLD
> ABCD / CAT / mMRC / DECAF / BAP-65), **community pneumonia**
> severity adjuncts to PSI / CURB-65 (SMART-COP, A-DROP),
> **pleural-fluid analysis** (Light's, Heffner, modified-Light's
> serum-pleural albumin gradient), **ventilator-associated
> pneumonia** (CPIS), **asthma control & prediction** (ACT,
> c-ACT, ACQ, API), **upper-airway and rhinosinusitis** (SNOT-22,
> Lund-Mackay), **functional class** (NYHA, WHO-FC for PAH),
> **dyspnea and exercise capacity** (Borg, 6MWT predicted
> distance, OHS criteria), and **airway assessment** (Friedman
> tongue position for OSA, Cormack-Lehane laryngoscopy grade).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v18 amends no hard rule from v10–v17. Catalog growth: at v17
> close 328 tiles; at v18 close **353 tiles**.

## 1. Why v18 exists

[scope-mdcalc-parity](scope-mdcalc-parity.md) commits to every
clinically-actionable calculator the audience reaches for.
v12–v17 covered general internal medicine, ICU, peri-op,
OB/peds/trauma, neuro/onc/endo/GI, and cardiology. The largest
remaining audience-frequency gap is the **outpatient pulmonary**
and **inpatient airway / pneumonia** surface — bedside chest-
medicine, ED, anesthesia, pulm clinic, sleep clinic, ENT, and
allergy.

The 25 tiles in §3 below were selected under the v12 §1
criteria (clinical frequency × source stability × audit
feasibility). Each appears on at least one major society
short-list (GOLD 2024, ATS/IDSA CAP, ATS/ERS PFT interpretation,
GINA 2024, ASA difficult-airway, AASM OSA screening, EUFOREA
rhinosinusitis).

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v18
specifically defers:

- **St George's Respiratory Questionnaire (SGRQ).** 50 items;
  licensing constraints on display; defer to a future patient-
  reported-outcome bundle.
- **GOLD spirometric staging by GLI z-score.** Requires the GLI
  2012 reference equations as a data file; defer to a separate
  PFT-interpretation tile.
- **CPAP titration target prediction.** Heterogeneous evidence
  base; not yet society-endorsed.
- **6-minute walk distance with GAP-IPF / ILD-GAP.** GAP is a
  separate ILD prognosis bundle; will ship in a future ILD spec.
- **STOP-only / STOP-Bang.** STOP-Bang already shipped in v14;
  STOP-only is a subset and adds no decision surface.
- **Epworth Sleepiness Scale.** Already shipped in v14.

## 3. The 25 tiles

### 3.1 COPD severity & exacerbation

#### 3.1.1 `bode-copd` — BODE Index

- **Citation:** Celli BR, Cote CG, Marin JM, et al. *The body-mass index, airflow obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary disease.* N Engl J Med 2004;350(10):1005-1012.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `family-medicine`.
- **Inputs:** BMI (≤21 / >21), FEV₁ % predicted (4 bands), mMRC dyspnea (0–4), 6MWT distance (4 bands).
- **Scoring:** Each variable 0–3 points (BMI 0–1). Range 0–10.
- **Bands:** Quartile 1 (0–2), 2 (3–4), 3 (5–6), 4 (7–10); 52-month mortality 20 / 32 / 40 / 80%.
- **Worked example:** BMI 23, FEV₁ 45%, mMRC 2, 6MWT 280 m → 0 + 2 + 2 + 2 = 6 → Q3 → ~40%.

#### 3.1.2 `gold-abcd` — GOLD 2024 ABCD assessment

- **Citation:** Global Initiative for Chronic Obstructive Lung Disease. *Global Strategy for the Diagnosis, Management, and Prevention of COPD: 2024 Report.* Fontana, WI: GOLD, 2024.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pulmonology`, `internal-medicine`, `family-medicine`.
- **Inputs:** Symptoms (mMRC ≥2 or CAT ≥10) → high symptoms; exacerbation history (≥2 moderate or ≥1 hospitalized → high risk).
- **Output:** Group A (low/low), B (high/low), E (any high-risk; 2023 update merged C and D into E).
- **Note:** v18 follows the 2023/2024 GOLD revision that replaced C/D with E.

#### 3.1.3 `cat-copd` — COPD Assessment Test

- **Citation:** Jones PW, Harding G, Berry P, Wiklund I, Chen W-H, Kline Leidy N. *Development and first validation of the COPD Assessment Test.* Eur Respir J 2009;34(3):648-654.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `family-medicine`.
- **Inputs:** 8 items (cough, phlegm, chest tightness, breathlessness, activity limitation, confidence leaving home, sleep, energy), each 0–5.
- **Output:** Sum 0–40; ≥10 = high symptom burden (GOLD ABCD threshold).

#### 3.1.4 `mmrc-dyspnea` — modified Medical Research Council dyspnea scale

- **Citation:** Fletcher CM. *Standardised questionnaire on respiratory symptoms: a statement prepared and approved by the MRC Committee on the aetiology of chronic bronchitis (MRC breathlessness score).* BMJ 1960;2:1665. mMRC: Mahler DA, Wells CK. *Evaluation of clinical methods for rating dyspnea.* Chest 1988;93(3):580-586.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `family-medicine`, `cardiology`.
- **Inputs:** Single 5-level scale (0 = breathless on strenuous exercise only, 4 = too breathless to leave the house).
- **Output:** 0–4; GOLD ABCD threshold ≥2.

#### 3.1.5 `decaf-copd` — DECAF exacerbation mortality

- **Citation:** Steer J, Gibson J, Bourke SC. *The DECAF Score: predicting hospital mortality in exacerbations of chronic obstructive pulmonary disease.* Thorax 2012;67(11):970-976.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** Dyspnea (eMRCD ≥5a = 1, ≥5b = 2), Eosinopenia (<0.05 ×10⁹/L = 1), Consolidation on CXR (1), Acidemia (pH <7.30 = 1), Atrial fibrillation (1). Range 0–6.
- **Bands:** 0–1 low (in-hospital mortality 1.4–8.2%), 2 intermediate (9.4–18.7%), 3–6 high (24–70%).

#### 3.1.6 `bap65-copd` — BAP-65 COPD exacerbation severity

- **Citation:** Tabak YP, Sun X, Johannes RS, Gupta V, Shorr AF. *Mortality and need for mechanical ventilation in acute exacerbations of chronic obstructive pulmonary disease: development and validation of a simple risk score.* Arch Intern Med 2009;169(17):1595-1602.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `pulmonology`, `hospital-medicine`.
- **Inputs:** BUN ≥25 mg/dL (1), Altered mental status (1), Pulse ≥109 (1), age ≥65 (separate stratifier).
- **Output:** Class I (0 points, age <65) through Class V (3 points, age ≥65); mortality 0.3% → 14.1%.

### 3.2 Pneumonia severity adjuncts

#### 3.2.1 `smart-cop` — SMART-COP CAP ICU need

- **Citation:** Charles PGP, Wolfe R, Whitby M, et al. *SMART-COP: a tool for predicting the need for intensive respiratory or vasopressor support in community-acquired pneumonia.* Clin Infect Dis 2008;47(3):375-384.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `emergency-medicine`, `infectious-disease`, `critical-care`.
- **Inputs:** Systolic BP <90 (2), Multilobar infiltrates (1), Albumin <3.5 (1), RR (≥25 age <50 / ≥30 age ≥50) (1), Tachycardia ≥125 (1), Confusion (1), Oxygen low (age <50: SaO₂ ≤93/PaO₂ <70/PF <333; age ≥50: SaO₂ ≤90/PaO₂ <60/PF <250) (2), pH <7.35 (2). Range 0–11.
- **Bands:** 0–2 low, 3–4 moderate, 5–6 high, ≥7 very high need for IRVS.

#### 3.2.2 `a-drop` — A-DROP pneumonia severity (JRS)

- **Citation:** Japanese Respiratory Society. *The JRS guidelines for the management of community-acquired pneumonia in adults.* Respirology 2006;11(Suppl 3):S79-S133. Shindo Y, et al. *Comparison of severity scoring systems A-DROP and CURB-65 for community-acquired pneumonia.* Respirology 2008;13(5):731-735.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `emergency-medicine`, `infectious-disease`.
- **Inputs:** Age (M ≥70, F ≥75), Dehydration (BUN ≥21 mg/dL), Respiratory failure (SaO₂ ≤90 or PaO₂ ≤60), Orientation disturbance, Pressure (SBP ≤90). Range 0–5.
- **Bands:** 0 mild outpatient; 1–2 moderate; 3 severe inpatient; 4–5 extremely severe ICU.

### 3.3 Pleural-fluid analysis

#### 3.3.1 `lights-criteria` — Light's criteria for exudate vs transudate

- **Citation:** Light RW, MacGregor MI, Luchsinger PC, Ball WC. *Pleural effusions: the diagnostic separation of transudates and exudates.* Ann Intern Med 1972;77(4):507-513.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pulmonology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** Pleural protein, serum protein, pleural LDH, serum LDH, ULN of serum LDH.
- **Rule:** Exudate if ANY of: pleural protein / serum protein > 0.5, pleural LDH / serum LDH > 0.6, pleural LDH > ⅔ × ULN serum LDH.
- **Output:** Exudate / Transudate.

#### 3.3.2 `heffner-criteria` — Heffner criteria (Light's without serum)

- **Citation:** Heffner JE, Brown LK, Barbieri CA. *Diagnostic value of tests that discriminate between exudative and transudative pleural effusions.* Chest 1997;111(4):970-980.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pulmonology`, `internal-medicine`.
- **Inputs:** Pleural protein, pleural LDH, ULN serum LDH.
- **Rule:** Exudate if ANY of: pleural protein > 2.9 g/dL, pleural LDH > 0.45 × ULN, pleural cholesterol > 45 mg/dL.

#### 3.3.3 `modified-lights-albumin` — Serum-pleural albumin gradient

- **Citation:** Roth BJ, O'Meara TF, Cragun WH. *The serum-effusion albumin gradient in the evaluation of pleural effusions.* Chest 1990;98(3):546-549.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pulmonology`, `internal-medicine`.
- **Inputs:** Serum albumin, pleural albumin.
- **Rule:** Gradient = serum − pleural; ≤1.2 g/dL favors exudate, >1.2 g/dL favors transudate (use when Light's misclassifies a transudate as exudate in patients on diuretics).

### 3.4 Ventilator-associated pneumonia

#### 3.4.1 `cpis-vap` — Clinical Pulmonary Infection Score

- **Citation:** Pugin J, Auckenthaler R, Mili N, Janssens JP, Lew PD, Suter PM. *Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of bronchoscopic and nonbronchoscopic "blind" bronchoalveolar lavage fluid.* Am Rev Respir Dis 1991;143(5 Pt 1):1121-1129.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `critical-care`, `pulmonology`, `infectious-disease`.
- **Inputs:** Temperature, WBC, tracheal secretions, oxygenation (PaO₂/FiO₂), CXR infiltrate, progression, microbiology.
- **Scoring:** 0–2 per item. Range 0–12. >6 = pneumonia likely.

### 3.5 Asthma control & prediction

#### 3.5.1 `asthma-act` — Asthma Control Test (adult & adolescent ≥12)

- **Citation:** Nathan RA, Sorkness CA, Kosinski M, et al. *Development of the Asthma Control Test: a survey for assessing asthma control.* J Allergy Clin Immunol 2004;113(1):59-65.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pulmonology`, `allergy-immunology`, `family-medicine`.
- **Inputs:** 5 items (limitations, shortness of breath, nighttime awakenings, rescue inhaler use, control self-rating), each 1–5.
- **Output:** Sum 5–25; ≥20 = well controlled, 16–19 = not well, ≤15 = very poorly.

#### 3.5.2 `asthma-c-act` — Childhood ACT (4–11 yr)

- **Citation:** Liu AH, Zeiger R, Sorkness C, et al. *Development and cross-sectional validation of the Childhood Asthma Control Test.* J Allergy Clin Immunol 2007;119(4):817-825.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pediatrics`, `pulmonology`, `allergy-immunology`.
- **Inputs:** 4 child items (0–3 each) + 3 caregiver items (0–5 each). Sum 0–27.
- **Output:** ≤19 = poorly controlled.

#### 3.5.3 `asthma-acq` — Asthma Control Questionnaire (Juniper)

- **Citation:** Juniper EF, O'Byrne PM, Guyatt GH, Ferrie PJ, King DR. *Development and validation of a questionnaire to measure asthma control.* Eur Respir J 1999;14(4):902-907.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pulmonology`, `allergy-immunology`.
- **Inputs:** 7 items (5 symptoms, 1 rescue use, 1 FEV₁ %), each 0–6. Mean of items = ACQ.
- **Output:** ACQ <0.75 well-controlled, 0.75–1.5 grey zone, >1.5 not well-controlled. Variants ACQ-5, ACQ-6 also accepted.

#### 3.5.4 `api-asthma` — Asthma Predictive Index (modified)

- **Citation:** Castro-Rodríguez JA, Holberg CJ, Wright AL, Martinez FD. *A clinical index to define risk of asthma in young children with recurrent wheezing.* Am J Respir Crit Care Med 2000;162(4 Pt 1):1403-1406.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `allergy-immunology`, `pulmonology`.
- **Inputs:** ≥4 wheezing episodes/yr; 1 major (parental asthma, eczema, aeroallergen sensitization) or 2 minor (allergic rhinitis, wheezing apart from colds, eosinophilia ≥4%).
- **Output:** Positive / Negative API.

### 3.6 Rhinosinusitis & ENT

#### 3.6.1 `snot22` — Sino-Nasal Outcome Test-22

- **Citation:** Hopkins C, Gillett S, Slack R, Lund VJ, Browne JP. *Psychometric validity of the 22-item Sinonasal Outcome Test.* Clin Otolaryngol 2009;34(5):447-454.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `otolaryngology`, `allergy-immunology`, `family-medicine`.
- **Inputs:** 22 items, each 0–5. Sum 0–110.
- **Output:** EPOS 2020 bands: 0–8 none, 9–20 mild, 21–50 moderate, >50 severe.

#### 3.6.2 `lund-mackay` — Lund-Mackay CT score for chronic rhinosinusitis

- **Citation:** Lund VJ, Mackay IS. *Staging in rhinosinusitis.* Rhinology 1993;31(4):183-184.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `otolaryngology`, `radiology`.
- **Inputs:** Six sinus regions per side (maxillary, anterior ethmoid, posterior ethmoid, sphenoid, frontal, osteomeatal complex). Per region 0/1/2 except OMC 0/2. Range 0–24.
- **Output:** Threshold ≥4 supports CRS diagnosis in EPOS 2020.

### 3.7 Functional class & exercise capacity

#### 3.7.1 `nyha` — NYHA functional class

- **Citation:** The Criteria Committee of the New York Heart Association. *Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels.* 9th ed. Boston: Little, Brown & Co; 1994:253-256.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `pulmonology`, `internal-medicine`.
- **Inputs:** Symptoms at rest / ordinary activity / less-than-ordinary activity / strenuous activity.
- **Output:** I (no limitation) → IV (symptoms at rest).

#### 3.7.2 `who-fc-pah` — WHO functional class for pulmonary hypertension

- **Citation:** Galiè N, Humbert M, Vachiery JL, et al. *2015 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension.* Eur Heart J 2016;37(1):67-119. (Adopted from WHO 1998 Evian classification.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `cardiology`.
- **Inputs:** Symptom pattern relative to activity & syncope/right-heart-failure features.
- **Output:** I–IV; class III/IV = referral to PH center.

#### 3.7.3 `borg-dyspnea` — Modified Borg dyspnea scale

- **Citation:** Borg GA. *Psychophysical bases of perceived exertion.* Med Sci Sports Exerc 1982;14(5):377-381. Modified for dyspnea: Burdon JG, et al. *The perception of breathlessness in asthma.* Am Rev Respir Dis 1982;126(5):825-828.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `pulmonology`, `physical-medicine`, `cardiology`.
- **Inputs:** Single 0–10 scale (0 = nothing at all; 10 = maximal).
- **Output:** Reported magnitude.

#### 3.7.4 `6mwt-predicted` — 6-minute walk distance predicted (Enright-Sherrill)

- **Citation:** Enright PL, Sherrill DL. *Reference equations for the six-minute walk in healthy adults.* Am J Respir Crit Care Med 1998;158(5 Pt 1):1384-1387.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `cardiology`, `physical-medicine`.
- **Inputs:** Age, sex, height (cm), weight (kg).
- **Formula:**
  - Male: 6MWD = 7.57×height − 5.02×age − 1.76×weight − 309 m. LLN = predicted − 153.
  - Female: 6MWD = 2.11×height − 5.78×age − 2.29×weight + 667 m. LLN = predicted − 139.
- **Output:** Predicted distance & LLN.

#### 3.7.5 `ohs-criteria` — Obesity Hypoventilation Syndrome diagnostic criteria

- **Citation:** Mokhlesi B, Masa JF, Brozek JL, et al. *Evaluation and Management of Obesity Hypoventilation Syndrome: An Official American Thoracic Society Clinical Practice Guideline.* Am J Respir Crit Care Med 2019;200(3):e6-e24.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pulmonology`, `sleep-medicine`.
- **Inputs:** BMI ≥30 kg/m², awake daytime PaCO₂ ≥45 mmHg (room air), exclusion of alternative cause of hypoventilation.
- **Output:** Meets / does not meet OHS criteria.

### 3.8 Airway assessment

#### 3.8.1 `friedman-tongue` — Friedman Tongue Position

- **Citation:** Friedman M, Tanyeri H, La Rosa M, et al. *Clinical predictors of obstructive sleep apnea.* Laryngoscope 1999;109(12):1901-1907.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `otolaryngology`, `sleep-medicine`, `anesthesiology`.
- **Inputs:** Mouth-open tongue-neutral view — uvula and soft palate visibility.
- **Output:** Grade I (uvula and tonsils visible) → Grade IV (only hard palate visible).

#### 3.8.2 `cormack-lehane` — Cormack-Lehane laryngoscopy grade

- **Citation:** Cormack RS, Lehane J. *Difficult tracheal intubation in obstetrics.* Anaesthesia 1984;39(11):1105-1111.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `emergency-medicine`, `critical-care`.
- **Inputs:** Direct-laryngoscopy view: I (full glottis), II (partial glottis: IIa most cords visible, IIb only arytenoids/posterior glottis), III (only epiglottis: IIIa lift-able, IIIb adherent), IV (no glottic structures).
- **Output:** Grade I–IV with sub-grades; III/IV = difficult intubation.

## 4. Group homes

- §3.1.1, §3.1.3, §3.1.4, §3.1.5, §3.1.6, §3.2.1, §3.2.2, §3.4.1, §3.6.2, §3.7.1, §3.7.2, §3.7.4, §3.8.1, §3.8.2 → `G` (Clinical Scoring & Risk).
- §3.1.2, §3.3.1–§3.3.3, §3.5.4, §3.7.5 → `H` (Clinical Criteria & Diagnostic Bundles).
- §3.5.1–§3.5.3, §3.6.1, §3.7.3 → `I` (Patient-Reported Symptom Indices).

Group `I` is the same group used today by [phq9](../lib/meta.js)
and [gad7](../lib/meta.js); no new group is required.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md).

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v17    | 328 | +25 |
| **v18**| **353** | **+25** |
