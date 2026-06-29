# Clinical Citations and Worked Examples

Every clinical formula and scoring system used by sophiewell.com is listed
below with its original publication citation and at least one worked-example
test case. The worked examples drive the unit tests in `test/unit/` for each
calculator.

## Formulas

### Body Mass Index (BMI)

Citation: Quetelet, A. Sur l'homme et le developpement de ses facultes,
ou Essai de physique sociale. 1835. Modern adoption: Keys A, et al.
Indices of relative weight and obesity. J Chronic Dis. 1972;25(6).
Formula: BMI = weight_kg / (height_m)^2.
Worked example: 70 kg, 1.75 m. BMI = 70 / (1.75 * 1.75) = 22.857.

### Body Surface Area, Du Bois

Citation: Du Bois D, Du Bois EF. A formula to estimate the approximate
surface area if height and weight be known. Arch Intern Med. 1916;17:863.
Formula: BSA_m2 = 0.007184 * weight_kg^0.425 * height_cm^0.725.
Worked example: 70 kg, 175 cm. BSA = 1.847 m^2 (approx).

### Body Surface Area, Mosteller

Citation: Mosteller RD. Simplified calculation of body-surface area. N Engl
J Med. 1987;317(17):1098.
Formula: BSA_m2 = sqrt((height_cm * weight_kg) / 3600).
Worked example: 70 kg, 175 cm. BSA = sqrt(12250 / 3600) = 1.844 m^2.

### Mean Arterial Pressure (MAP)

Citation: Standard physiology; commonly cited from Sesso HD, et al.
Formula: MAP = ((2 * DBP) + SBP) / 3.
Worked example: SBP 120, DBP 80. MAP = (160 + 120) / 3 = 93.33 mmHg.

### Anion Gap

Citation: Emmett M, Narins RG. Clinical use of the anion gap. Medicine
(Baltimore). 1977;56(1):38-54.
Formula: AG = Na - (Cl + HCO3). Albumin-corrected AG = AG + 2.5 * (4 -
albumin_g_dL).
Worked example: Na 140, Cl 100, HCO3 24. AG = 16. With albumin 2.0:
corrected AG = 16 + 2.5 * 2 = 21.

### Corrected Calcium for Albumin

Citation: Payne RB, et al. Interpretation of serum calcium in patients
with abnormal serum proteins. BMJ. 1973;4(5893):643-646.
Formula: corrected Ca = measured Ca + 0.8 * (4 - albumin_g_dL).
Worked example: Ca 8.0, albumin 2.0. Corrected Ca = 8.0 + 0.8 * 2 = 9.6.

### Corrected Sodium for Hyperglycemia

Citation: Katz MA. Hyperglycemia-induced hyponatremia: calculation of
expected serum sodium depression. N Engl J Med. 1973. Hillier TA, Abbott
RD, Barrett EJ. Hyponatremia: evaluating the correction factor for
hyperglycemia. Am J Med. 1999;106(4):399-403.
Formula 1 (1.6): corrected Na = measured Na + (glucose - 100) / 100 * 1.6.
Formula 2 (2.4): corrected Na = measured Na + (glucose - 100) / 100 * 2.4.
The application shows both with citations.
Worked example: Na 130, glucose 600. 1.6 form: 130 + 5 * 1.6 = 138. 2.4
form: 130 + 5 * 2.4 = 142.

### Alveolar-arterial Gradient (A-a)

Citation: West JB. Respiratory Physiology: The Essentials.
Formula at sea level: PAO2 = (FiO2 * (760 - 47)) - (PaCO2 / 0.8).
A-a = PAO2 - PaO2.
Worked example: FiO2 0.21, PaCO2 40, PaO2 90. PAO2 = 0.21 * 713 - 50 =
99.73. A-a = 9.73 mmHg.

### eGFR, CKD-EPI 2021 (race-free)

Citation: Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and
cystatin C-based equations to estimate GFR without race. N Engl J Med.
2021;385(19):1737-1749.
Formula: eGFR = 142 * min(SCr/k, 1)^a * max(SCr/k, 1)^-1.200 * 0.9938^age
* (1.012 if female), where k = 0.7 (female) or 0.9 (male) and a = -0.241
(female) or -0.302 (male).
Worked example: 60-year-old female, SCr 1.0 mg/dL. min(1/0.7, 1) = 1,
max(1/0.7, 1) = 1.4286. eGFR = 142 * 1 * 1.4286^-1.2 * 0.9938^60 * 1.012,
approximately 60 mL/min/1.73 m^2.

### Cockcroft-Gault Creatinine Clearance

Citation: Cockcroft DW, Gault MH. Prediction of creatinine clearance from
serum creatinine. Nephron. 1976;16(1):31-41.
Formula: CrCl = ((140 - age) * weight_kg) / (72 * SCr_mg_dL); multiply by
0.85 if female.
Worked example: Male, 60 years, 80 kg, SCr 1.0. CrCl = (80 * 80) / 72 =
88.89 mL/min.

### Pack-Years

Definition: standard tobacco-history measure.
Formula: pack_years = packs_per_day * years_smoked.
Worked example: 1.5 packs per day for 20 years. Pack-years = 30.

### Naegele Due Date

Definition: standard obstetric estimation.
Formula: due_date = LMP + 280 days.
Worked example: LMP 2025-01-01. Due date 2025-10-08.

### QTc

Bazett: Bazett HC. An analysis of the time-relations of
electrocardiograms. Heart. 1920;7:353-370. QTc = QT / sqrt(RR).
Fridericia: Fridericia LS. Die Systolendauer im Elektrokardiogramm bei
normalen Menschen und bei Herzkranken. Acta Med Scand. 1920;53:469. QTc =
QT / RR^(1/3).
Framingham: Sagie A, et al. An improved method for adjusting the QT
interval for heart rate. Am J Cardiol. 1992;70(7):797-801. QTc = QT +
0.154 * (1 - RR).
Hodges: Hodges M, et al. Bazett's QT correction reviewed: evidence that a
linear QT correction for heart rate is better. JACC. 1983;1:694. QTc = QT
+ 1.75 * (HR - 60).
Worked example: QT 400 ms, HR 60 bpm (RR = 1.0 s). All four methods give
QTc = 400 ms.

### P/F Ratio

Definition: oxygenation index used in ARDS Berlin classification.
Formula: P_F = PaO2 / FiO2.
Berlin bands: mild 200 to 300, moderate 100 to 200, severe at or below 100.
Worked example: PaO2 90 mmHg, FiO2 0.5. P/F = 180 (moderate).

## Scoring Systems

### Glasgow Coma Scale (GCS)

Citation: Teasdale G, Jennett B. Assessment of coma and impaired
consciousness. A practical scale. Lancet. 1974;2(7872):81-84.
Worked example: Eye 4, Verbal 5, Motor 6 = 15 (normal). Eye 1, Verbal 1,
Motor 4 = 6.

### APGAR

Citation: Apgar V. A proposal for a new method of evaluation of the
newborn infant. Curr Res Anesth Analg. 1953;32(4):260-267.
Worked example: Appearance 2, Pulse 2, Grimace 2, Activity 2, Respiration
2 = 10.

### Wells score for Pulmonary Embolism

Citation: Wells PS, et al. Derivation of a simple clinical model to
categorize patients' probability of pulmonary embolism. Thromb Haemost.
2000;83(3):416-420.
Worked example: clinical signs of DVT (3), no alternative diagnosis (3),
HR over 100 (1.5) = 7.5 (high probability).

### Wells score for DVT

Citation: Wells PS, et al. Value of assessment of pretest probability of
deep-vein thrombosis in clinical management. Lancet. 1997;350(9094):
1795-1798.
Worked example: active cancer (1), calf swelling > 3 cm (1), pitting
edema (1), entire leg swollen (1) = 4 (high probability).

### CHA2DS2-VASc

Citation: Lip GYH, et al. Refining clinical risk stratification for
predicting stroke and thromboembolism in atrial fibrillation. Chest.
2010;137(2):263-272.
Worked example: 75-year-old female with hypertension and diabetes. Age >=
75 = 2, female = 1, hypertension = 1, diabetes = 1. Score = 5.

### HAS-BLED

Citation: Pisters R, et al. A novel user-friendly score (HAS-BLED) to
assess 1-year risk of major bleeding in patients with atrial fibrillation.
Chest. 2010;138(5):1093-1100.
Worked example: hypertension (1), abnormal renal function (1), age > 65
(1), antiplatelet drugs (1) = 4 (high risk).

### NIH Stroke Scale (NIHSS)

Citation: Brott T, Adams HP Jr, et al. Measurements of acute cerebral
infarction: a clinical examination scale. Stroke. 1989;20(7):864-870.
Public-domain instrument maintained by NIH/NINDS.
Worked example: a fully normal exam scores 0; a comatose patient may score
above 25.

### ASA Physical Status

Citation: ASA Physical Status Classification System, American Society of
Anesthesiologists. Reference only; the application uses original short
summaries and links to the ASA publication.

### Mallampati Classification

Citation: Mallampati SR, et al. A clinical sign to predict difficult
tracheal intubation: a prospective study. Can Anaesth Soc J. 1985;32(4):
429-434.

### Beers Criteria

Citation: American Geriatrics Society 2023 Updated AGS Beers Criteria for
Potentially Inappropriate Medication Use in Older Adults. J Am Geriatr
Soc. 2023. Reference only; the application uses original brief notes for
each drug-condition pair and links to the AGS publication.

## Insurance and Cost Math

### Out-of-Pocket Cost Estimator

Standard United States commercial insurance math, in-network, plan year,
no balance billing assumed:
1. Apply remaining deductible up to the allowed amount.
2. Apply coinsurance to the post-deductible portion.
3. Add copay if applicable.
4. Cap patient responsibility at the remaining out-of-pocket maximum.
Worked example: allowed 1000, deductible 500 (250 met, 250 remaining),
coinsurance 20 percent, copay 0, OOP max 5000 (1000 met). Patient pays
250 (deductible) + 0.20 * 750 (coinsurance) = 250 + 150 = 400.

### Medicare Physician Fee Schedule

Formula: payment = ((work RVU * work GPCI) + (PE RVU * PE GPCI) + (MP RVU
* MP GPCI)) * conversion factor.
Worked example: facility, code 99213, locality with all GPCI = 1.0,
conversion factor 32.7442. Components: work 0.97, PE facility 0.40, MP
0.07. Payment = (0.97 + 0.40 + 0.07) * 32.7442 = 1.44 * 32.7442 = 47.15.

## v4 calculator and screener citations

Every v4 calculator carries an inline citation in `lib/meta.js`. Primary
references for the v4-added formulas:

### Group E (v4 clinical math additions)
- **Anion gap & delta-delta**: Wrenn KD. Ann Emerg Med. 1990;19(11):1310-1313.
- **Corrected calcium**: Payne RB. BMJ. 1973;4(5893):643-646.
- **Corrected sodium**: Katz NEJM 1973; Hillier Am J Med 1999.
- **Osmolal gap**: standard chemistry; calculated osm = 2*Na + glucose/18 + BUN/2.8 (+EtOH/4.6).
- **A-a gradient & P/F**: West JB Respiratory Physiology; ARDS Berlin Definition (JAMA 2012;307(23):2526).
- **Winter's formula**: Winter RM, et al. Arch Intern Med. 1967;120(2):151-156.
- **MAP / pulse pressure / shock index**: Allgower & Burri 1967 (shock index).
- **IBW / AdjBW / BSA**: Devine 1974; 0.4 AdjBW rule; Mosteller NEJM 1987;317(17):1098; Du Bois Arch Intern Med 1916;17:863.
- **eGFR suite**: Inker LA, et al. NEJM. 2021;385(19):1737-1749 (CKD-EPI 2021 race-free); Levey AS, et al. Ann Intern Med. 1999;130(6):461-470 (MDRD); Cockcroft-Gault Nephron 1976;16(1):31-41.
- **FENa / FEUrea**: Espinel CH JAMA 1976; Carvounis CP Kidney Int 2002.
- **Maintenance fluids 4-2-1**: Holliday MA, Segar WE. Pediatrics. 1957;19(5):823-832.
- **QTc suite**: Bazett 1920; Fridericia 1920; Sagie / Framingham 1992; Hodges 1983.
- **Pregnancy dating**: Naegele rule; Robinson-Fleming CRL formula; ACOG Practice Bulletin redating thresholds.

### Group F (v4 medication math additions)
- **Opioid MME**: CDC Clinical Practice Guideline for Prescribing Opioids - United States, 2022. MMWR Recomm Rep. 2022;71(3):1-95.
- **Steroid equivalence**: standard pharmacology references (project-author table).
- **Benzodiazepine equivalence**: Ashton CH. Benzodiazepines: How They Work and How to Withdraw.
- **Antibiotic renal-dose adjustment**: FDA labels via DailyMed.
- **Vasopressor dose-rate**: standard infusion math; FDA labels for typical concentrations.
- **TPN macronutrient**: 3.4 / 4 / 2 kcal-per-source rule (dextrose / aa / 20% lipid emulsion).
- **IV-to-PO**: bioavailability values per FDA labeling.

### Group G (v4 scoring additions, all 25 instruments)
- **TIMI**: Antman EM, et al. JAMA. 2000;284(7):835-842.
- **GRACE**: Granger CB, et al. Arch Intern Med. 2003;163(19):2345-2353.
- **HEART**: Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008;16(6):191-196.
- **PERC**: Kline JA, et al. J Thromb Haemost. 2004;2(8):1247-1255.
- **Wells PE / revised Geneva**: Wells PS, et al. Thromb Haemost. 2000;83(3):416-420; Le Gal G, et al. Ann Intern Med. 2006;144(3):165-171.
- **CURB-65**: Lim WS, et al. Thorax. 2003;58(5):377-382.
- **PSI / PORT**: Fine MJ, et al. NEJM. 1997;336(4):243-250.
- **qSOFA / SOFA**: Singer M, et al. JAMA. 2016;315(8):801-810; Vincent JL, et al. Intensive Care Med. 1996;22(7):707-710.
- **MELD-3.0 / Child-Pugh**: Kim WR, et al. Gastroenterology. 2021;161(6):1887-1895; Pugh RN, et al. Br J Surg. 1973;60(8):646-649.
- **Ranson / BISAP**: Ranson JH, et al. Surg Gynecol Obstet. 1974;139(1):69-81; Wu BU, et al. Gut. 2008;57(12):1698-1703.
- **Centor / McIsaac**: Centor RM, et al. Med Decis Making. 1981;1(3):239-246; McIsaac WJ, et al. CMAJ. 1998;158(1):75-83.
- **Wells DVT / Caprini**: Wells PS, et al. Lancet. 1997;350(9094):1795-1798; Caprini JA. Dis Mon. 2005;51(2-3):70-78.
- **Bishop**: Bishop EH. Obstet Gynecol. 1964;24:266-268.
- **Alvarado / PAS**: Alvarado A. Ann Emerg Med. 1986;15(5):557-564; Samuel M. J Pediatr Surg. 2002;37(6):877-881.
- **Modified Rankin Scale**: UK-TIA Study Group 1988.
- **PHQ-9**: Kroenke K, Spitzer RL, Williams JBW. J Gen Intern Med. 2001;16(9):606-613.
- **GAD-7**: Spitzer RL, et al. Arch Intern Med. 2006;166(10):1092-1097.
- **AUDIT-C**: Bush K, et al. Arch Intern Med. 1998;158(16):1789-1795.
- **CAGE**: Ewing JA. JAMA. 1984;252(14):1905-1907.
- **EPDS**: Cox JL, Holden JM, Sagovsky R. Br J Psychiatry. 1987;150:782-786.
- **Mini-Cog**: Borson S, et al. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.
- **CIWA-Ar**: Sullivan JT, et al. Br J Addict. 1989;84(11):1353-1357.
- **COWS**: Wesson DR, Ling W. J Psychoactive Drugs. 2003;35(2):253-259.
- **ASCVD PCE**: Goff DC Jr, et al. Circulation. 2014;129(25 Suppl 2):S49-73. **Race-stratified** by design (white vs African-American).
- **PREVENT 2023**: Khan SS, et al. Circulation. 2024;149(6):430-449. **Race-FREE** by design.

### Group I (v4 field-medicine additions)
- **NEXUS**: Hoffman JR, et al. NEJM. 2000;343(2):94-99.
- **Canadian C-Spine**: Stiell IG, et al. JAMA. 2001;286(15):1841-1848.
- **Cyanide antidotes**: FDA labeling for Cyanokit (hydroxocobalamin) and Nithiodote (sodium nitrite + sodium thiosulfate).
- **CO HBO**: UHMS guidance.

## spec-v5 §4 deterministic additions (T1-T17)

Each tool below is pure deterministic math or a small static reference
(no live data, no ETL, no AI). Every entry pairs the published source
with a worked-example numeric used by `test/unit/clinical-v5.test.js`.
Logic lives in `lib/clinical-v5.js` (T1-T13, T16) and `lib/coding-v5.js`
(T14-T15); T17 is a pure-template helper in `views/group-v5.js`.

### T1. Sodium Correction Rate (Adrogue-Madias)
Citation: Adrogue HJ, Madias NE. Hyponatremia. NEJM. 2000;342(21):1493-1499;
Hypernatremia. NEJM. 2000;342(20):1581-1589.
Formula: TBW = weight_kg × factor (M 0.6 / F 0.5; elderly drop 0.05).
ΔNa per liter infusate = (infusate_Na − serum_Na) / (TBW + 1).
Volume to reach target = target_ΔNa / ΔNa_per_L; rate = volume × 1000 / 24 mL/h.
Safety ceiling: 8 mEq/L/24h chronic, 10 mEq/L/24h acute (osmotic-demyelination
risk in hyponatremia, cerebral-edema risk in hypernatremia).
Worked example: 70 kg male, Na 110, 3% saline (513 mEq/L), target +8 mEq/L/24h.
TBW = 42 L. ΔNa/L = (513 − 110) / 43 = 9.37 mEq/L. Volume = 8 / 9.37 = 0.85 L
over 24 h ≈ 35.6 mL/h. Within the chronic 8 mEq/L/24h ceiling.

### T2. Free Water Deficit
Citation: Adrogue-Madias hypernatremia paper (above).
Formula: deficit_L = TBW × (Na_current / Na_target − 1). Replacement rate
= deficit × 1000 / replaceOverHours mL/h. Implied Na drop = (Na_current −
Na_target) × 24 / replaceOverHours; flag if > 10 mEq/L/24h.
Worked example: 70 kg male, Na 160, target 145, replace over 48 h.
TBW = 42 L. Deficit = 42 × (160/145 − 1) = 4.34 L. Rate ≈ 90.5 mL/h.
Implied Na drop = 15 × 24 / 48 = 7.5 mEq/L/24h (within ceiling).

### T3. Iron Deficit (Ganzoni)
Citation: Ganzoni AM. Eisen-Dextran intravenoes: ein neues therapeutisches
Prinzip. Schweiz Med Wochenschr. 1970;100(7):301-303.
Formula: total_mg = weight_kg × (target_Hb − current_Hb) × 2.4 + iron_stores.
Stores: 500 mg if weight ≥ 35 kg, else 15 × weight_kg.
Worked example: 70 kg, Hb 9, target 15. 70 × 6 × 2.4 + 500 = 1008 + 500
= 1508 mg.

### T4. Predicted Body Weight + ARDSnet Tidal Volume
Citations: Devine BJ. Drug Intell Clin Pharm. 1974;8:650-655. ARDS Network.
NEJM. 2000;342(18):1301-1308.
Formula: PBW (M) = 50 + 2.3 × (height_in − 60); PBW (F) = 45.5 + 2.3 ×
(height_in − 60). Vt target band 4-8 mL/kg PBW; default 6.
Worked example: 175 cm male. height_in = 68.90. PBW = 50 + 2.3 × 8.90 =
70.46 kg. Vt at 6 mL/kg = 423 mL; range 282-564 mL.

### T5. Rapid Shallow Breathing Index (RSBI)
Citation: Yang KL, Tobin MJ. A prospective study of indexes predicting the
outcome of trials of weaning from mechanical ventilation. NEJM. 1991;324
(21):1445-1450.
Formula: RSBI = RR / Vt(L). Threshold < 105 predicts weaning success.
Worked example: RR 24, Vt 350 mL. RSBI = 24 / 0.35 = 68.6. Likely to
tolerate weaning.

### T6. Lights Criteria for Pleural Effusion
Citation: Light RW, Macgregor MI, Luchsinger PC, Ball WC. Pleural effusions:
the diagnostic separation of transudates and exudates. Ann Intern Med.
1972;77(4):507-513.
Formula: exudate if any one of: pleural_protein/serum_protein > 0.5,
pleural_LDH/serum_LDH > 0.6, pleural_LDH > 2/3 × serum_LDH_ULN.
Worked example: pleural protein 4.0, serum 6.0; pleural LDH 250, serum 200,
ULN 222. Protein ratio 0.67 > 0.5 -> exudate.

### T7. Mentzer Index
Citation: Mentzer WC. Differentiation of iron deficiency from thalassaemia
trait. Lancet. 1973;1(7808):882.
Formula: index = MCV (fL) / RBC (×10^12/L). < 13 favors thalassemia, > 13
favors iron deficiency.
Worked example: MCV 65, RBC 6.0. Index = 10.83 -> favors beta-thalassemia
trait.

### T8. Serum-Ascites Albumin Gradient (SAAG)
Citation: Runyon BA, Montano AA, Akriviadis EA, Antillon MR, Irving MA,
McHutchison JG. The serum-ascites albumin gradient is superior to the
exudate-transudate concept in the differential diagnosis of ascites. Ann
Intern Med. 1992;117(3):215-220 (continuation series Hepatology 1992;16:240-245).
Formula: SAAG = serum_albumin − ascites_albumin (g/dL). >= 1.1 portal
hypertension; < 1.1 non-portal etiology.
Worked example: serum 3.5, ascites 1.5. SAAG = 2.0 g/dL -> portal HTN.

### T9. R-Factor (drug-induced liver injury pattern)
Citation: Benichou C. Criteria of drug-induced liver disorders. Report of
an international consensus meeting. J Hepatol. 1990;11(2):272-276.
Formula: R = (ALT/ALT_ULN) / (ALP/ALP_ULN). > 5 hepatocellular; < 2
cholestatic; 2-5 mixed.
Worked example: ALT 500 (ULN 40), ALP 100 (ULN 120). R = 12.5 / 0.833 =
15.0 -> hepatocellular.

### T10. KDIGO AKI Staging
Citation: KDIGO Acute Kidney Injury Work Group. KDIGO clinical practice
guideline for acute kidney injury. Kidney Int Suppl. 2012;2:1-138.
Logic: stage = max(creatinine_stage, urine_output_stage). Creatinine-based
staging requires acute context (rise >= 0.3 mg/dL in 48 h or ratio >= 1.5×
in 7 d). Stage 1: 1.5-1.9× baseline OR rise >= 0.3 in 48 h; UO < 0.5
mL/kg/h × 6-12 h. Stage 2: 2.0-2.9× baseline; UO < 0.5 × 12+ h. Stage 3:
>= 3× OR SCr >= 4.0 with acute rise OR RRT initiation; UO < 0.3 × 24 h or
anuria >= 12 h.
Worked example: baseline 1.0, current 3.5 -> 3.5× -> Stage 3.

### T11. Modified Sgarbossa (Smith) Criteria
Citation: Smith SW, Dodd KW, Henry TD, Dvorak DM, Pearce LA. Diagnosis of
ST-elevation myocardial infarction in the presence of left bundle branch
block with the ST-elevation to S-wave ratio in a modified Sgarbossa rule.
Ann Emerg Med. 2012;60(6):766-776.
Logic: positive if any one of: concordant ST elevation >= 1 mm in any lead;
concordant ST depression >= 1 mm in V1, V2, or V3; ST/S ratio <= -0.25 in
any lead with discordant ST elevation >= 1 mm.
Worked example: any single criterion checked -> positive.

### T12. Revised Cardiac Risk Index (Lee)
Citation: Lee TH, Marcantonio ER, Mangione CM, et al. Derivation and
prospective validation of a simple index for prediction of cardiac risk of
major noncardiac surgery. Circulation. 1999;100(10):1043-1049.
Factors (each = 1 point): high-risk surgery, ischemic heart disease, CHF,
cerebrovascular disease, insulin-dependent DM, creatinine > 2.0 mg/dL.
Major cardiac event risk by count (Lee derivation cohort): 0 -> 0.4%
(Class I), 1 -> 0.9% (II), 2 -> 6.6% (III), >= 3 -> >= 11% (IV).
Worked example: 4 factors -> Class IV, >= 11%.

### T13. Pediatric Early Warning Score (PEWS, Monaghan)
Citation: Monaghan A. Detecting and managing deterioration in children.
Paediatr Nurs. 2005;17(1):32-35.
Formula: total = behavior + cardiovascular + respiratory (each 0-3); 0-9.
Thresholds vary by institution; >= 4 commonly triggers escalation, >= 7
triggers code-team / PICU consult.
Worked example: 2 + 2 + 1 = 5 -> escalate.

### T14. Time-Based E/M Code Selector (AMA 2021)
Citation: AMA CPT Evaluation and Management code structure, 2021 office/
outpatient revision (effective 2021-01-01). Code descriptors are AMA-
owned and not bundled.
Bands: new patient -- 99202 (15-29 min), 99203 (30-44), 99204 (45-59),
99205 (60-74); established patient -- 99212 (10-19), 99213 (20-29), 99214
(30-39), 99215 (40-54). 99211 is nurse-only and not time-selectable.
Prolonged service 99417 = 15-min units past the 75-min (new) / 55-min
(established) trigger.
Worked example: new patient, 45 min -> 99204. New patient, 75 min -> 99205
+ 1 × 99417.

### T15. NDC 10 <-> 11 Digit Converter
Citation: CMS NDC billing guidance (5-4-2 billing format) and FDA Structured
Product Labeling.
Logic: parse 4-4-2 / 5-3-2 / 5-4-1 / 5-4-2 (with or without dashes), pad to
5-4-2 by inserting a leading zero in the segment that is short. The 10-
digit derivation is unique only when the source format is known (or only
one segment of an 11-digit input has a leading zero); when ambiguous,
return every plausible candidate.
Worked example: 1234-5678-90 (4-4-2) -> billing 11 = 01234-5678-90 / FDA 10
= 1234-5678-90.

### T16. AVPU <-> GCS Quick Reference
Citation: McNarry AF, Goldhill DR. Simple bedside assessment of level of
consciousness: comparison of two simple assessment scales with the Glasgow
Coma Scale. Anaesthesia. 2004;59(1):34-37.
Mapping (typical band): A -> 15 (range 14-15), V -> 13 (12-14), P -> 8
(7-9), U -> 3 (3-6). AVPU does not finely map to GCS; ranges are
approximations.
Worked example: P -> typical GCS 8 (range 7-9).

### T17. SBAR Handoff Template
Citation: Institute for Healthcare Improvement (IHI) SBAR communication
toolkit. Originally developed by Kaiser Permanente (Doug Bonacum).
Logic: pure template -- four free-text fields (S/B/A/R) rendered as a
printable, copyable card. No formula, no thresholds.

## spec-v86 toxicology decision rules

### Serotonin Toxicity (Hunter Criteria)
Citation: Dunkley EJC, Isbister GK, Sibbritt D, Dawson AH, Whyte IM. The
Hunter Serotonin Toxicity Criteria: simple and accurate diagnostic decision
rules for serotonin toxicity. QJM. 2003;96(9):635-642.
Logic: in the presence of a serotonergic agent, serotonin toxicity is
diagnosed if ANY of five branches is met -- (1) spontaneous clonus; (2)
inducible clonus + (agitation or diaphoresis); (3) ocular clonus + (agitation
or diaphoresis); (4) tremor + hyperreflexia; (5) hypertonia + temp >38 C +
(ocular or inducible clonus). Sensitivity 84%, specificity 97%.
Worked example: serotonergic agent + spontaneous clonus -> meets criteria
(branch 1).

### Salicylate Poisoning + EXTRIP Hemodialysis Indication
Citation: Juurlink DN, Gosselin S, Kielstein JT, et al; EXTRIP Workgroup.
Extracorporeal Treatment for Salicylate Poisoning: Systematic Review and
Recommendations From the EXTRIP Workgroup. Ann Emerg Med. 2015;66(2):165-181.
Logic: hemodialysis (intermittent HD preferred) recommended when salicylate
>100 mg/dL acute (>90 with impaired kidneys), altered mental status, new
hypoxemia requiring oxygen, or arterial pH <=7.20; suggested when standard
therapy fails. The Done nomogram is not used. Salicylate MW 138.12: 1 mmol/L
= 13.81 mg/dL.
Worked example: acute salicylate 110 mg/dL -> hemodialysis recommended (level
>100 mg/dL).

### Toxic Alcohol: Osmolar Gap + AACT Fomepizole Indication
Citation: Smithline N, Gardner KD. Gaps -- anionic and osmolal. JAMA.
1976;236(14):1594-1597. Treatment indication: Barceloux DG, et al (American
Academy of Clinical Toxicology) methanol (J Toxicol Clin Toxicol.
2002;40(4):415-446) and ethylene glycol (1999;37(5):537-560) guidelines.
Formula: calculated osmolality = 2*Na + glucose/18 + BUN/2.8 + ethanol/3.7;
osmolar gap = measured - calculated (signed). Fomepizole indicated on a
documented level >20 mg/dL, recent ingestion + gap >10, or strong suspicion +
>=2 of (pH<7.3, bicarbonate<20, gap>10). A normal gap does not exclude.
Worked example: measured 305, Na 140, glucose 90, BUN 14, ethanol 0 ->
calculated 290, osmolar gap 15.

## spec-v87 hemodynamics & ICU physiology

### Hemodynamics: Cardiac Index, Stroke Volume, SVR/PVR Suite
Citation: Swan HJC, Ganz W, Forrester J, et al. Catheterization of the heart
in man with use of a flow-directed balloon-tipped catheter. N Engl J Med.
1970;283(9):447-451. PVR in Wood units and the <2 WU threshold: 2022 ESC/ERS
Guidelines for pulmonary hypertension (Humbert M, et al. Eur Heart J.
2022;43(38):3618-3731).
Formulas: CI = CO/BSA; SV = CO/HR x 1000; SVI = SV/BSA; SVR = 80*(MAP-CVP)/CO;
SVRI = SVR*BSA; PVR = 80*(mPAP-PCWP)/CO (dynes); PVR(Wood) = (mPAP-PCWP)/CO;
PVRI = PVR*BSA. The x80 factor converts mmHg/(L/min) to dynes*s*cm^-5. Normal
ranges: CI 2.5-4.0, SV 60-100, SVI 33-47, SVR 800-1200, PVR <2 Wood units.
Worked example: CO 5, HR 80, BSA 2, MAP 90, CVP 5, mPAP 20, PCWP 10 ->
CI 2.5, SV 62.5, SVR 1360, PVR 2 Wood units, PVRI 320.

### Mechanical Power of Ventilation (Gattinoni)
Citation: Gattinoni L, Tonetti T, Cressoni M, et al. Ventilator-related causes
of lung injury: the mechanical power. Intensive Care Med. 2016;42(10):1567-1575.
Higher-risk association above ~17 J/min: Serpa Neto A, et al. Intensive Care
Med. 2018;44(11):1914-1922.
Formula: MP (J/min) = 0.098 * RR * Vt(L) * (Ppeak - 0.5*(Pplat-PEEP)); the
0.098 constant converts cmH2O*L to joules. Driving pressure = Pplat - PEEP.
Worked example: RR 22, Vt 420, Pplat 26, PEEP 12, Ppeak 32 -> driving pressure
14, mechanical power 22.6 J/min (over the 17 J/min higher-VILI-risk threshold).

### Physiologic Dead-Space Fraction (Bohr-Enghoff Vd/Vt)
Citation: Enghoff modification of the Bohr equation; prognostic value in ARDS:
Nuckton TJ, Alonso JA, Kallet RH, et al. Pulmonary dead-space fraction as a
risk factor for death in the acute respiratory distress syndrome. N Engl J Med.
2002;346(17):1281-1287.
Formula: Vd/Vt = (PaCO2 - PECO2) / PaCO2 (Enghoff). PECO2 is the mixed-expired
CO2; EtCO2 (end-tidal) is a bedside surrogate that underestimates true dead
space. Nuckton 2002: Vd/Vt >0.6 carried independent mortality risk in ARDS.
Worked example: PaCO2 60, PECO2 20 -> Vd/Vt 0.67 (67%), above the 0.6 threshold.

## spec-v88 endocrine & oncologic emergencies

### DKA vs HHS Classification + DKA Severity (ADA)
Citation: Kitabchi AE, Umpierrez GE, Miles JM, Fisher JN. Hyperglycemic crises
in adult patients with diabetes. Diabetes Care. 2009;32(7):1335-1343. Thresholds
reconciled to the 2024 ADA/EASD hyperglycemic-crises consensus (Umpierrez GE,
et al. Diabetes Care. 2024).
Formulas: effective serum osmolality = 2 x Na + glucose/18; anion gap = Na - Cl
- HCO3. DKA = glucose >= 250 + pH < 7.30 + HCO3 < 18 + ketosis; graded mild
(pH 7.25-7.30, HCO3 15-18), moderate (pH 7.00-7.24, HCO3 10-14), severe
(pH < 7.00, HCO3 < 10). HHS = glucose > 600 + effective osmolality > 320 +
pH > 7.30 + HCO3 > 18 + minimal ketosis.
Worked example: glucose 520, pH 6.95, HCO3 6, beta-OHB 6, Na 130, Cl 95 ->
DKA severe, anion gap 29, effective osmolality 289.

### Carboplatin Dose (Calvert formula + FDA GFR cap)
Citation: Calvert AH, Newell DR, Gumbrell LA, et al. Carboplatin dosage:
prospective evaluation of a simple formula based on renal function. J Clin
Oncol. 1989;7(11):1748-1756. FDA recommends capping estimated GFR at 125 mL/min
for carboplatin dosing (2010).
Formula: dose (mg) = target AUC x (GFR + 25). When GFR is estimated from serum
creatinine, capping it at 125 mL/min prevents overdosing with IDMS-standardized
assays; the cap is applied before the dose and the substitution is shown.
Worked example: AUC 5, GFR 140, cap on -> GFR used 125, dose 750 mg
(uncapped would be 825 mg).

### Tumor Lysis Syndrome (Cairo-Bishop grading)
Citation: Cairo MS, Bishop M. Tumour lysis syndrome: new therapeutic strategies
and classification. Br J Haematol. 2004;127(1):3-11.
Definition: laboratory TLS = >= 2 of uric acid >= 8, potassium >= 6, phosphate
>= 4.5 (adult) / 6.5 (pediatric), corrected calcium <= 7 mg/dL — each by the
absolute threshold or a 25% change from baseline, within 3 days before to 7 days
after cytotoxic therapy. Clinical TLS = laboratory TLS + creatinine >= 1.5x ULN,
cardiac arrhythmia/sudden death, or seizure; graded 0-V by the maximum
manifestation. Corrected calcium reuses Ca + 0.8 x (4 - albumin).
Worked example: uric acid 9, K 6.5, phosphate 5, calcium 6 (adult), creatinine
2.4, ULN 1.2 -> laboratory + clinical TLS, 4 of 4 metabolic criteria,
creatinine 2x ULN, Cairo-Bishop grade II.

## spec-v89 rheumatology, hepatology & perioperative

### DAS28 (rheumatoid arthritis disease activity, ESR/CRP)
Citation: Prevoo MLL, van 't Hof MA, Kuper HH, et al. Modified disease activity
scores that include twenty-eight-joint counts. Arthritis Rheum.
1995;38(1):44-48 (DAS28-ESR). CRP form: Wells G, et al. Validation of the
28-joint DAS28 and EULAR response criteria based on CRP. Ann Rheum Dis.
2009;68(6):954-960.
Formulas: DAS28-ESR = 0.56 x sqrt(TJC28) + 0.28 x sqrt(SJC28) + 0.70 x ln(ESR)
+ 0.014 x GH; DAS28-CRP = 0.56 x sqrt(TJC28) + 0.28 x sqrt(SJC28) + 0.36 x
ln(CRP+1) + 0.014 x GH + 0.96. EULAR bands: remission < 2.6, low <= 3.2,
moderate <= 5.1, high > 5.1. The two forms are not interchangeable.
Worked example: TJC 8, SJC 4, ESR 30, GH 50 -> DAS28-ESR 5.22, high activity.

### King's College Criteria (acetaminophen-induced ALF)
Citation: O'Grady JG, Alexander GJM, Hayllar KM, Williams R. Early indicators of
prognosis in fulminant hepatic failure. Gastroenterology. 1989;97(2):439-445.
Lactate modification: Bernal W, Donaldson N, Wyncoll D, Wendon J. Blood lactate
as an early predictor of outcome in paracetamol-induced acute liver failure.
Lancet. 2002;359(9306):558-563.
Rule (acetaminophen pathway): poor prognosis when EITHER arterial pH < 7.30
after fluid resuscitation, OR all of INR > 6.5 (PT > 100 s) + creatinine > 3.4
mg/dL (> 300 umol/L) + grade III/IV encephalopathy. Bernal modification:
arterial lactate > 3.5 mmol/L early (or > 3.0 after resuscitation).
Worked example: INR 7, creatinine 4.0 mg/dL, grade III/IV -> meets via the
three-part limb.

### ASA Physical Status Classification
Citation: American Society of Anesthesiologists. ASA Physical Status
Classification System (Committee on Economics; last amended December 13, 2020,
with approved examples).
Rule: descriptor I-VI with the published definition and example conditions; the
emergency (E) modifier is appended for an emergency but is not assignable to ASA
I or VI. ASA-PS describes preoperative physical status, not operative risk.
Worked example: class III emergency -> "ASA III-E".

### Surgical Apgar Score (intraoperative outcome)
Citation: Gawande AA, Kwaan MR, Regenbogen SE, Lipsitz SA, Zinner MJ. An Apgar
score for surgery. J Am Coll Surg. 2007;204(2):201-208. Validation: Regenbogen
SE, et al. Arch Surg. 2009;144(1):30-36.
Bands: estimated blood loss (<=100 mL=3, 101-600=2, 601-1000=1, >1000=0) +
lowest MAP (>=70=3, 55-69=2, 40-54=1, <40=0) + lowest HR (<=55=4, 56-65=3,
66-75=2, 76-85=1, >85=0); 0-10 sum, <=4 high risk. Distinct from the neonatal
Apgar.
Worked example: EBL 200, MAP 60, HR 80 -> 2 + 2 + 1 = 5, intermediate risk.

### Mean QRS Axis (frontal plane, hexaxial)
Citation: Surawicz B, Knilans T. Chou's Electrocardiography in Clinical
Practice. 6th ed. Saunders/Elsevier; 2008 (standard hexaxial reference).
Rule: mean frontal-plane axis = atan2(net aVF, net lead I); lead I = 0 deg,
aVF = +90 deg. Normal -30 to +90 deg; left-axis deviation -30 to -90 deg;
right-axis deviation +90 to +180 deg; extreme/northwest -90 to -180 deg. The
all-isoelectric (0,0) input is surfaced as indeterminate, never 0 deg.
Worked example: lead I 8, aVF 6 -> atan2(6,8) = 36.9 deg, normal axis.

### ECG LVH Voltage Criteria (Sokolow-Lyon, Cornell)
Citation: Sokolow M, Lyon TP. Am Heart J. 1949;37(2):161-186 (Sokolow-Lyon).
Casale PN, Devereux RB, et al. J Am Coll Cardiol. 1985;6(3):572-580 (Cornell
voltage).
Rule: Sokolow-Lyon SV1 + max(RV5, RV6) >= 35 mm; Cornell voltage SV3 + RaVL
> 28 mm (men) or > 20 mm (women).
Worked example: SV1 20, RV5 18, RV6 16, SV3 12, RaVL 10, male -> Sokolow 38
positive, Cornell 22 negative.

### TIMI Risk Score for STEMI (Morrow)
Citation: Morrow DA, Antman EM, Charlesworth A, et al. TIMI risk score for
ST-elevation myocardial infarction. Circulation. 2000;102(17):2031-2037.
Rule: weighted point sum 0-14 (age 65-74 = 2, >= 75 = 3; DM/HTN/angina = 1;
SBP < 100 = 3; HR > 100 = 2; Killip II-IV = 2; weight < 67 kg = 1; anterior
STE/LBBB = 1; time > 4 h = 1) mapped to the 30-day mortality band.
Worked example: age 70 + anterior STE + time > 4 h = 4 points -> 7.3% mortality.

### Duke Treadmill Score (exercise-test prognosis)
Citation: Mark DB, Hlatky MA, Harrell FE Jr, et al. Exercise treadmill score for
predicting prognosis in coronary artery disease. Ann Intern Med.
1987;106(6):793-800.
Rule: DTS = exercise time(min) - (5 x ST deviation mm) - (4 x angina index).
Risk band: low >= +5 (99% 5-year survival), moderate -10 to +4 (95%), high
<= -11 (79%).
Worked example: time 7, ST 1, angina 0 -> 2, moderate risk, 95% survival.

### Cardiac Power Output (CPO)
Citation: Fincke R, Hochman JS, Lowe AM, et al. Cardiac power is the strongest
hemodynamic correlate of mortality in cardiogenic shock. J Am Coll Cardiol.
2004;44(2):340-348.
Rule: CPO = (MAP x cardiac output) / 451, in watts. CPO < 0.6 W flags the
cardiogenic-shock mortality threshold.
Worked example: MAP 80, CO 5 -> (80 x 5) / 451 = 0.89 W, above the threshold.

### Aortic Valve Area (continuity equation)
Citation: Baumgartner H, Hung J, Bermejo J, et al. Echocardiographic assessment
of aortic stenosis: a focused update from the EACVI and the ASE. J Am Soc
Echocardiogr. 2017;30(4):372-392. Severity bands per the 2020 ACC/AHA valvular
guideline (Otto CM, et al. Circulation. 2021;143(5)).
Rule: AVA = (pi x (LVOT diameter/2)^2 x LVOT VTI) / AV VTI, in cm2; dimensionless
index = LVOT VTI / AV VTI. Mild > 1.5, moderate 1.0-1.5, severe < 1.0 cm2.
Worked example: LVOT d 2.0, LVOT VTI 20, AV VTI 100 -> 0.63 cm2 severe, DI 0.20.

### GOLD Spirometric Grade (COPD)
Citation: Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global
Strategy for the Diagnosis, Management, and Prevention of COPD: 2024 Report
(goldcopd.org).
Rule: obstruction when post-bronchodilator FEV1/FVC < 0.70; GOLD grade off FEV1
%predicted: 1 (>= 80%), 2 (50-79%), 3 (30-49%), 4 (< 30%). No grade is assigned
without obstruction.
Worked example: FEV1 45% predicted, ratio 0.6 -> obstruction, GOLD 3 (severe).

### BODE Index (COPD prognosis)
Citation: Celli BR, Cote CG, Marin JM, et al. The body-mass index, airflow
obstruction, dyspnea, and exercise capacity index in chronic obstructive
pulmonary disease. N Engl J Med. 2004;350(10):1005-1012.
Rule: BMI (<= 21 = 1) + obstruction (FEV1% >= 65 = 0, 50-64 = 1, 36-49 = 2,
<= 35 = 3) + dyspnea (mMRC 0-1 = 0, 2 = 1, 3 = 2, 4 = 3) + exercise (6MWD
>= 350 = 0, 250-349 = 1, 150-249 = 2, <= 149 = 3); 0-10 with the 4-year survival
quartile (0-2 ~80%, 3-4 ~67%, 5-6 ~57%, 7-10 ~18%).
Worked example: BMI 24, FEV1 45%, mMRC 2, 6MWD 300 m -> 4, survival band 3-4
(~67%).

### GAP Index (idiopathic pulmonary fibrosis)
Citation: Ley B, Ryerson CJ, Vittinghoff E, et al. A multidimensional index and
staging system for idiopathic pulmonary fibrosis. Ann Intern Med.
2012;156(10):684-691.
Rule: Gender (male = 1) + Age (> 65 = 2, > 60 = 1) + FVC% (> 75 = 0, 50-75 = 1,
< 50 = 2) + DLCO% (> 55 = 0, 36-55 = 1, <= 35 = 2, cannot perform = 3); stage I
0-3, II 4-5, III 6-8 with cited 1/2/3-year mortality.
Worked example: male 68, FVC 60%, DLCO 40% -> 5 points, stage II (1-yr 16.2%).

### Predicted Spirometry + LLN (GLI-2012)
Citation: Quanjer PH, Stanojevic S, Cole TJ, et al (Global Lung Function
Initiative). Multi-ethnic reference values for spirometry for the 3-95-yr age
range: the global lung function 2012 equations. Eur Respir J.
2012;40(6):1324-1343.
Rule: GLI-2012 LMS equations give predicted FEV1/FVC/ratio and the lower limit
of normal (LLN, 5th percentile) by age, height, sex and ethnicity group; a
measured value yields % predicted and an above/below-LLN flag.
Worked example: Caucasian male age 40, height 175 cm -> FEV1 4.08 L (LLN 3.23),
FVC 5.05 L (LLN 4.02), FEV1/FVC 0.81 (LLN 0.70).

### mMRC Dyspnea Scale
Citation: Bestall JC, Paul EA, Garrod R, Newcombe RG, Jones PW, Wedzicha JA.
Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of
disability in patients with chronic obstructive pulmonary disease. Thorax.
1999;54(7):581-586.
Rule: a single integer grade 0-4 (0 strenuous exercise only; 1 hurrying/slight
hill; 2 slower than peers; 3 stops after ~100 m; 4 too breathless to leave the
house). Feeds the BODE index and the GOLD ABE assessment.
Worked example: grade 2 -> walks slower than peers on the level, or stops for
breath at own pace.

### KDIGO CKD Staging (G×A risk)
Citation: KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management
of Chronic Kidney Disease. Kidney Int. 2024;105(4S):S117-S314.
Rule: G-stage by eGFR (G1 >= 90, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5
< 15) x A-stage by UACR (A1 < 30, A2 30-300, A3 > 300 mg/g); the prognosis is the
heat-map cell (low/moderate/high/very high).
Worked example: eGFR 38, UACR 340 -> G3b/A3 -> very high risk (red).

### Urine Albumin/Protein-to-Creatinine Ratio
Citation: Spot urine albumin/protein-to-creatinine ratio; albuminuria categories
per the 2024 international CKD guideline. Kidney Int. 2024;105(4S):S117-S314.
Rule: ratio (mg/g) = analyte (mg/dL) / urine creatinine (mg/dL) x 1000; with ~1 g
creatinine excreted daily the ratio also estimates 24-hour excretion (mg). A-stage
A1 < 30, A2 30-300, A3 > 300 mg/g.
Worked example: albumin 30 mg/dL, urine Cr 100 mg/dL -> UACR 300 mg/g (A2).

### Dialysis Adequacy (URR + Kt/V)
Citation: Daugirdas JT. Second generation logarithmic estimates of single-pool
variable volume Kt/V: an analysis of error. J Am Soc Nephrol. 1993;4(5):1205-1213.
Rule: URR = (1 - post-BUN/pre-BUN) x 100%; single-pool Kt/V = -ln(R - 0.008·t) +
(4 - 3.5·R)·UF/W, R = post/pre. KDOQI minimum: URR >= 65%, spKt/V >= 1.2.
Worked example: pre 60, post 18, UF 3 L, 4 h, 70 kg -> URR 70%, Kt/V 1.44.

### Mehran Contrast-Induced Nephropathy Risk
Citation: Mehran R, Aymong ED, Nikolsky E, et al. A simple risk score for
prediction of contrast-induced nephropathy after percutaneous coronary
intervention. J Am Coll Cardiol. 2004;44(7):1393-1399.
Rule: hypotension 5, IABP 5, CHF 5, age > 75 = 4, anemia 3, diabetes 3, contrast
1 per 100 mL, eGFR (40-60 = 2, 20-40 = 4, < 20 = 6); <= 5 low, 6-10 moderate,
11-15 high, >= 16 very high.
Worked example: CHF + diabetes + 300 mL contrast + eGFR 30 -> 15, high (~26.1%).

### CKD-EPI 2021 Cystatin-C eGFR (race-free)
Citation: Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and cystatin
C-based equations to estimate GFR without race. N Engl J Med.
2021;385(19):1737-1749.
Rule: eGFRcys (cystatin C only), eGFRcr-cys (combined creatinine + cystatin C, the
confirmatory estimate), and eGFRcr (creatinine only), all without a race
coefficient, in mL/min/1.73m².
Worked example: female 70, cystatin 1.5, creatinine 1.1 -> eGFRcys 40.6,
eGFRcr-cys 47.4, eGFRcr 54.1.

### NAFLD Fibrosis Score
Citation: Angulo P, Hui JM, Marchesini G, et al. The NAFLD fibrosis score: a
noninvasive system that identifies liver fibrosis in patients with NAFLD.
Hepatology. 2007;45(4):846-854.
Rule: NFS = -1.675 + 0.037*age + 0.094*BMI + 1.13*(IFG/DM) - 0.013*platelets
- 0.66*albumin + 0.99*(AST/ALT); < -1.455 excludes advanced fibrosis (F0-F2),
> 0.676 indicates advanced fibrosis (F3-F4), between is indeterminate.
Worked example: age 60, BMI 30, IFG/DM, AST 60, ALT 40, platelets 200, albumin
4.0 -> NFS 0.74 (advanced fibrosis).

### Modified Glasgow (Imrie) Pancreatitis Severity
Citation: Blamey SL, Imrie CW, O'Neill J, et al. Prognostic factors in acute
pancreatitis. Gut. 1984;25(12):1340-1346.
Rule: PANCREAS at 48 hours, one point each: PaO2 < 60 mmHg, age > 55, WBC > 15,
calcium < 2 mmol/L, urea > 16 mmol/L, LDH > 600 IU/L, albumin < 32 g/L, glucose
> 10 mmol/L; >= 3 predicts severe pancreatitis.
Worked example: PaO2 55, age 60, urea 20, glucose 12 (4 of 8 met) -> 4, severe.

### Truelove & Witts UC Severity
Citation: Truelove SC, Witts LJ. Cortisone in ulcerative colitis; final report on
a therapeutic trial. BMJ. 1955;2(4947):1041-1048.
Rule: severe = >= 6 bloody stools/day plus >= 1 of temperature > 37.8 C, heart
rate > 90, hemoglobin < 10.5 g/dL, ESR > 30 mm/h; mild = < 4 stools/day with
minimal systemic disturbance; moderate is intermediate.
Worked example: 8 bloody stools/day with fever, tachycardia, anemia and a high
ESR -> severe.

### Harvey-Bradshaw Index (Crohn's activity)
Citation: Harvey RF, Bradshaw JM. A simple index of Crohn's-disease activity.
Lancet. 1980;1(8167):514.
Rule: wellbeing (0-4) + abdominal pain (0-3) + liquid stools/day + abdominal mass
(0-3) + 1 point per complication; remission < 5, mild 5-7, moderate 8-16, severe
> 16.
Worked example: wellbeing 2, pain 2, stools 4, mass 1, 1 complication -> 10,
moderate.

### Mayo Score / Partial Mayo (ulcerative colitis)
Citation: Schroeder KW, Tremaine WJ, Ilstrup DM. Coated oral 5-aminosalicylic
acid therapy for mildly to moderately active ulcerative colitis. N Engl J Med.
1987;317(26):1625-1629.
Rule: full Mayo (0-12) = stool frequency + rectal bleeding + physician global +
endoscopy (each 0-3); remission 0-2, mild 3-5, moderate 6-10, severe 11-12. The
partial Mayo (0-9) omits endoscopy (remission 0-2, mild 3-4, moderate 5-6, severe
7-9).
Worked example: stool 2, bleeding 2, PGA 2, endoscopy 2 -> full Mayo 8, moderate.

### Milan Criteria (HCC transplant eligibility)
Citation: Mazzaferro V, Regalia E, Doci R, et al. Liver transplantation for the
treatment of small hepatocellular carcinomas in patients with cirrhosis. N Engl J
Med. 1996;334(11):693-699.
Rule: within = a single tumor <= 5 cm OR <= 3 nodules each <= 3 cm, AND no
macrovascular invasion AND no extrahepatic spread; otherwise exceeds. Reports the
criterion only, not a listing decision.
Worked example: 1 nodule 4.5 cm, no invasion, no spread -> within Milan criteria.

## spec-v94 hematology & oncology prognostic scores

### HScore (reactive hemophagocytic syndrome)
Citation: Fardet L, Galicier L, Lambotte O, et al. Development and validation of
the HScore, a score for the diagnosis of reactive hemophagocytic syndrome.
Arthritis Rheumatol. 2014;66(9):2613-2620.
Rule: nine weighted items (max 337) -- immunosuppression 18; temperature 38.4-39.4 C
= 33, > 39.4 = 49; organomegaly one organ 23, both 38; cytopenias 2 lineages 24, 3
lineages 34; ferritin 2000-6000 = 35, > 6000 = 50; triglyceride 1.5-4 mmol/L = 44,
> 4 = 64; fibrinogen <= 2.5 g/L = 30; AST >= 30 = 19; marrow hemophagocytosis 35.
An HScore >= 169 best discriminates HLH (sensitivity 93%, specificity 86%);
probability read from the published curve.
Worked example: temp 40, both organs, 2 cytopenias, ferritin 4000, TG 3, fibrinogen
2, AST 100, hemophagocytosis -> HScore 274, probability > 99%.

### Revised IPSS-R (myelodysplastic syndromes)
Citation: Greenberg PL, Tuechler H, Schanz J, et al. Revised international
prognostic scoring system for myelodysplastic syndromes. Blood.
2012;120(12):2454-2465.
Rule: cytogenetic group (very good 0 to very poor 4) + marrow blasts (<=2% 0, >2-<5%
1, 5-10% 2, >10% 3) + hemoglobin (>=10 g/dL 0, 8-<10 1, <8 1.5) + platelets (>=100 0,
50-<100 0.5, <50 1) + ANC (>=0.8 0, <0.8 0.5). Categories: very low <=1.5, low
>1.5-3, intermediate >3-4.5, high >4.5-6, very high >6.
Worked example: good cytogenetics, 7% blasts, Hgb 9, plt 150, ANC 1.5 -> 4,
intermediate (median OS 3.0 yr).

### FLIPI + IPI lymphoma prognostic indices
Citation: Solal-Celigny P, Roy P, Colombat P, et al. Follicular lymphoma
international prognostic index. Blood. 2004;104(5):1258-1265 (FLIPI); The
International Non-Hodgkin's Lymphoma Prognostic Factors Project. A predictive model
for aggressive non-Hodgkin's lymphoma. N Engl J Med. 1993;329(14):987-994 (IPI).
Rule: FLIPI counts age > 60, stage III/IV, Hgb < 12, > 4 nodal areas, LDH > normal
-> low 0-1, intermediate 2, high >= 3. IPI counts age > 60, stage III/IV, ECOG >= 2,
LDH > normal, > 1 extranodal site -> low 0-1, low-int 2, high-int 3, high 4-5.
Worked example: age > 60, stage III/IV, LDH high -> FLIPI 3 (high), IPI 3
(high-intermediate).

### MASCC Risk Index (febrile neutropenia)
Citation: Klastersky J, Paesmans M, Rubenstein EB, et al. The Multinational
Association for Supportive Care in Cancer risk index. J Clin Oncol.
2000;18(16):3038-3051.
Rule: burden of illness (no/mild 5, moderate 3) + no hypotension 5 + no COPD 4 +
solid tumor or no prior fungal 4 + no dehydration 3 + outpatient 3 + age < 60 2 (max
26). >= 21 identifies a low-risk patient (candidate for outpatient/oral management).
Reports the index only.
Worked example: favorable profile -> 26, low risk.

### Sokal / ELTS Risk Scores (CML)
Citation: Sokal JE, Cox EB, Baccarani M, et al. Prognostic discrimination in
"good-risk" chronic granulocytic leukemia. Blood. 1984;63(4):789-799 (Sokal);
Pfirrmann M, Baccarani M, Saussele S, et al. Prognosis of long-term survival
considering disease-specific death in patients with CML. Leukemia. 2016;30(1):48-56
(ELTS).
Rule: Sokal RR = exp[0.0116*(age-43.4) + 0.0345*(spleen-7.51) +
0.188*((platelets/700)^2 - 0.563) + 0.0887*(blasts-2.10)] -> low < 0.8,
intermediate 0.8-1.2, high > 1.2. ELTS = 0.0025*(age/10)^3 + 0.0615*spleen +
0.1052*blasts + 0.4104*(platelets/1000)^(-0.5) -> low <= 1.5680, intermediate
<= 2.2185, high > 2.2185.
Worked example: age 50, spleen 5 cm, platelets 300, blasts 2% -> Sokal 0.91, ELTS
1.58 (both intermediate).

### Modified Rankin Scale (stroke outcome)
Citation: van Swieten JC, Koudstaal PJ, Visser MC, et al. Interobserver
agreement for the assessment of handicap in stroke patients. Stroke.
1988;19(5):604-607.
Rule: single 7-point ordinal grade 0 (no symptoms) to 6 (dead). Grades 0-2 are
the "good outcome" stroke-trial dichotomy; 3-6 are the complementary "poor
outcome" framing.
Worked example: grade 2 -> slight disability, good outcome (0-2); grade 3 ->
moderate disability, poor outcome (3-6).

### Glasgow Outcome Scale - Extended (GOS-E)
Citation: Wilson JT, Pettigrew LE, Teasdale GM. Structured interviews for the
Glasgow Outcome Scale and the Extended Glasgow Outcome Scale: guidelines for
their use. J Neurotrauma. 1998;15(8):573-585.
Rule: 8-category structured-interview TBI outcome 1 (dead) to 8 (upper good
recovery), mapped to the legacy 5-point GOS (1->1, 2->2, 3/4->3 severe
disability, 5/6->4 moderate disability, 7/8->5 good recovery).
Worked example: GOS-E 4 -> upper severe disability, legacy GOS 3; GOS-E 8 ->
upper good recovery, legacy GOS 5.

### Hoehn & Yahr Parkinson Disease Staging
Citation: Hoehn MM, Yahr MD. Parkinsonism: onset, progression and mortality.
Neurology. 1967;17(5):427-442.
Rule: original stages 1-5 (1 unilateral, 2 bilateral without balance loss, 3
postural instability but independent, 4 severe but walks unaided, 5
wheelchair/bedridden unless aided); the modified scale adds 0, 1.5 and 2.5.
Worked example: stage 2.5 -> mild bilateral disease, recovers on the pull test
(modified scale); stage 2 -> bilateral, no balance impairment (original).

### Spetzler-Martin AVM Grade (+ Lawton-Young)
Citation: Spetzler RF, Martin NA. A proposed grading system for arteriovenous
malformations. J Neurosurg. 1986;65(4):476-483; Lawton MT, et al. A
supplementary grading scale for selecting patients with brain AVMs for surgery.
Neurosurgery. 2010;66(4):702-713.
Rule: core grade I-V = nidus size (<3 cm 1, 3-6 cm 2, >6 cm 3) + eloquent
location (1) + deep venous drainage (1). Supplemented total 2-10 adds age (<20
1, 20-40 2, >40 3) + unruptured (1) + diffuse nidus (1).
Worked example: >6 cm + eloquent + deep -> core sum 5, grade V; with age >40 and
ruptured/compact -> supplemented total 8.

### House-Brackmann Facial Nerve Grading
Citation: House JW, Brackmann DE. Facial nerve grading system. Otolaryngol Head
Neck Surg. 1985;93(2):146-147.
Rule: single 6-grade ordinal selector I (normal) to VI (total paralysis), keyed
to symmetry and tone at rest and to forehead, eye and mouth motion.
Worked example: grade III -> moderate dysfunction; grade VI -> total paralysis.

### MIDAS (Migraine Disability Assessment)
Citation: Stewart WF, Lipton RB, Dowson AJ, Sawyer J. Development and testing of
the Migraine Disability Assessment (MIDAS) questionnaire to assess
headache-related disability. Neurology. 2001;56(6 Suppl 1):S20-S28.
Rule: sum of five prior-3-month disability questions -> grade I (0-5, little or
none), II (6-10, mild), III (11-20, moderate), IV (>= 21, severe). Items A
(headache days) and B (pain intensity 0-10) are reported but not scored.
Worked example: 2 + 4 + 1 + 3 + 1 = 11 -> grade III, moderate disability.

## spec-v96 psychiatry rating scales (clinician-rated severity + screens)

### Hamilton Depression Rating Scale (HAM-D, 17-item)
Citation: Hamilton M. A rating scale for depression. J Neurol Neurosurg
Psychiatry. 1960;23(1):56-62.
Rule: 17 clinician-rated items with mixed anchors -- items 1-3, 7-11 and 15
score 0-4; items 4-6, 12-14 and 16-17 score 0-2. Total 0-52. Severity: no/none
0-7, mild 8-16, moderate 17-23, severe >= 24. A blank item withholds the band.
Worked example: every item rated 1 -> total 17 -> moderate depression.

### Hamilton Anxiety Rating Scale (HAM-A, 14-item)
Citation: Hamilton M. The assessment of anxiety states by rating. Br J Med
Psychol. 1959;32(1):50-55.
Rule: 14 clinician-rated items, each 0-4. Total 0-56. Severity: mild <= 17, mild
to moderate 18-24, moderate to severe 25-30, severe >= 31. A blank item withholds
the band.
Worked example: every item rated 2 -> total 28 -> moderate to severe anxiety.

### Montgomery-Asberg Depression Rating Scale (MADRS, 10-item)
Citation: Montgomery SA, Asberg M. A new depression scale designed to be
sensitive to change. Br J Psychiatry. 1979;134:382-389.
Rule: 10 items, each 0-6, designed to be sensitive to treatment change. Total
0-60. Severity: normal 0-6, mild 7-19, moderate 20-34, severe >= 35. A blank item
withholds the band.
Worked example: every item rated 2 -> total 20 -> moderate.

### Mood Disorder Questionnaire (bipolar-spectrum screen)
Citation: Hirschfeld RM, Williams JB, Spitzer RL, et al. Development and
validation of a screening instrument for bipolar spectrum disorder: the Mood
Disorder Questionnaire. Am J Psychiatry. 2000;157(11):1873-1875.
Rule: a positive screen requires all three gates -- >= 7 of 13 symptom items YES,
AND co-occurrence YES, AND moderate or serious functional impairment. A negative
screen names the failing gate(s). A positive screen prompts a structured
interview; it is not a diagnosis.
Worked example: 7 of 13 symptoms YES, co-occurring, moderate impairment ->
positive screen (all three gates met).

### Yale-Brown Obsessive Compulsive Scale (Y-BOCS, 10-item)
Citation: Goodman WK, Price LH, Rasmussen SA, et al. The Yale-Brown Obsessive
Compulsive Scale. I. Development, use, and reliability. Arch Gen Psychiatry.
1989;46(11):1006-1011.
Rule: 10 items, each 0-4 -- items 1-5 grade obsessions, 6-10 grade compulsions.
Total 0-40 (each subtotal 0-20). Severity: subclinical 0-7, mild 8-15, moderate
16-23, severe 24-31, extreme 32-40. A blank item withholds the band.
Worked example: every item rated 2 -> total 20 -> moderate (obsessions 10/20,
compulsions 10/20).

### PTSD Checklist for DSM-5 (PCL-5, 20-item)
Citation: Blevins CA, Weathers FW, Davis MT, et al. The PTSD Checklist for DSM-5
(PCL-5): development and initial psychometric evaluation. J Trauma Stress.
2015;28(6):489-498.
Rule: 20 items, each 0-4. Total 0-80. DSM-5 clusters: items 1-5 B, 6-7 C, 8-14 D,
15-20 E (an item counts toward its cluster tally at a rating >= 2). A total at or
above the commonly cited provisional cutoff (>= 31-33) suggests probable PTSD; the
optimal cutpoint varies by population. A blank item withholds the result.
Worked example: every item rated 2 -> total 40, at or above the provisional
cutoff; clusters B 5/5, C 2/2, D 7/7, E 6/6.

### Gupta Perioperative Cardiac Risk (MICA)
Citation: Gupta PK, Gupta H, Sundaram A, et al. Development and validation of a
risk calculator for prediction of cardiac risk after surgery. Circulation.
2011;124(4):381-387.
Rule: predicted probability of perioperative MI or cardiac arrest from a fixed
logistic equation, risk = 1 / (1 + e^-x), with the linear predictor
x = -5.25 + 0.02*age + ASA class + functional status + creatinine + procedure
type. Reference categories (coefficient 0): ASA V, independent, normal creatinine,
hernia. The linear predictor is clamped before exponentiation so the probability
is always finite and in [0, 100].
Worked example: age 65, ASA III, partially dependent, normal creatinine,
intestinal surgery -> x = -4.08 -> predicted risk 1.66%.

### Gupta Postoperative Respiratory Failure
Citation: Gupta H, Gupta PK, Fang X, et al. Development and validation of a risk
calculator predicting postoperative respiratory failure. Chest.
2011;140(5):1207-1215.
Rule: predicted probability of postoperative respiratory failure (mechanical
ventilation > 48 h or unplanned reintubation), risk = 1 / (1 + e^-x), with
x = -1.7397 + ASA class + sepsis status + functional status + emergency +
procedure type. Reference categories (0): ASA V, SIRS, independent, emergency =
yes, hernia.
Worked example: ASA III, no sepsis, independent, elective, intestinal surgery ->
x = -3.144 -> predicted risk 4.13%.

### Arozullah Postoperative Pneumonia Risk Index
Citation: Arozullah AM, Khuri SF, Henderson WG, Daley J. Development and
validation of a multifactorial risk index for predicting postoperative pneumonia
after major noncardiac surgery. Ann Intern Med. 2001;135(10):847-857.
Rule: a weighted point total mapped to one of five risk classes with the cited
development-cohort pneumonia rate -- class 1 (0-15) 0.2%, class 2 (16-25) 1.2%,
class 3 (26-40) 4.0%, class 4 (41-55) 9.4%, class 5 (> 55) 15.3%. The BUN
contribution is U-shaped: < 8 mg/dL and >= 30 mg/dL both add points, the normal
band adds none.
Worked example: thoracic surgery (14) + age 60-69 (9) + COPD (5) -> 28 points ->
class 3, predicted pneumonia risk 4.0%.

### El-Ganzouri Risk Index (difficult intubation)
Citation: el-Ganzouri AR, McCarthy RJ, Tuman KJ, et al. Preoperative airway
assessment: predictive value of a multivariate risk index. Anesth Analg.
1996;82(6):1197-1204.
Rule: seven airway factors -- mouth opening, thyromental distance, Mallampati
class, neck movement, ability to prognath, body weight, and prior difficult
intubation -- each scored 0/1/2 (mouth opening and prognathism cap at 1). Total
0-12; a score >= 4 is the commonly cited threshold for difficult laryngoscopy.
Worked example: mouth opening < 4 cm (1) + thyromental 6.0-6.5 cm (1) + Mallampati
III (1) + neck 80-90 deg (1) -> total 4, at or above the >= 4 threshold.

### POSPOM (Preoperative Score to Predict Postoperative Mortality)
Citation: Le Manach Y, Collins G, Rodseth R, et al. Preoperative Score to Predict
Postoperative Mortality (POSPOM): derivation and validation. Anesthesiology.
2016;124(3):570-579.
Rule: total = age-band points + comorbidity points (15 named comorbidities) +
procedure-category points, mapped to the published predicted in-hospital mortality
(Supplemental Digital Content 3). Derived from over 5.5 million procedures;
c-statistic 0.944 derivation, 0.929 validation.
Worked example: age 70 (10) + cancer (4) + major gastrointestinal surgery (16) ->
30 points -> predicted in-hospital mortality 7.403%.

### Kawasaki disease diagnostic criteria (classic + incomplete)
Citation: McCrindle BW, Rowley AH, Newburger JW, et al. Diagnosis, Treatment,
and Long-Term Management of Kawasaki Disease: A Scientific Statement From the
American Heart Association. Circulation. 2017;135(17):e927-e999.
Rule: classic Kawasaki = fever >= 5 days plus >= 4 of 5 principal features
(bilateral non-exudative conjunctivitis, oral mucosal changes, cervical
lymphadenopathy >= 1.5 cm, extremity changes, polymorphous rash). The AHA
incomplete-Kawasaki algorithm: prolonged fever with 2-3 features, then a CRP/ESR
inflammatory gate (CRP >= 3.0 mg/dL and/or ESR >= 40 mm/hr), then >= 3 of 6
supplementary laboratory criteria or a positive echocardiogram supports the
diagnosis. Class B (AHA statement); see docs/citation-staleness.md.
Worked example: fever 6 days + 4 principal features present -> meets classic
Kawasaki disease criteria.

### Kocher criteria (septic arthritis vs transient synovitis of the hip)
Citation: Kocher MS, Zurakowski D, Kasser JR. Differentiating between septic
arthritis and transient synovitis of the hip in children: an evidence-based
clinical prediction algorithm. J Bone Joint Surg Am. 1999;81(12):1662-1670.
Rule: four predictors -- non-weight-bearing on the affected side, oral
temperature > 38.5 C, ESR > 40 mm/hr, serum WBC > 12,000 cells/uL. The count maps
to the predicted probability of septic arthritis: 0 -> < 0.2%, 1 -> 3.0%, 2 ->
40.0%, 3 -> 93.1%, 4 -> 99.6%.
Worked example: non-weight-bearing + fever (2 predictors) -> predicted septic
arthritis probability 40.0%.

### PIM3 (Paediatric Index of Mortality 3)
Citation: Straney L, Clements A, Parslow RC, et al. Paediatric index of mortality
3: an updated model for predicting mortality in pediatric intensive care. Pediatr
Crit Care Med. 2013;14(7):673-681.
Rule: a fixed logistic equation in systolic blood pressure (linear plus squared
term), pupillary reaction, FiO2*100/PaO2, absolute base excess, mechanical
ventilation, elective/recovery status, and diagnosis-risk category; predicted
death = e^logit / (1 + e^logit). The published Straney 2013 coefficients are used
(not the PIM3-anz13 recalibration), cross-verified against two reproductions.
Worked example: SBP 90, ventilated, base excess -5, high-risk diagnosis -> logit
-1.9 -> predicted probability of death 13.04%.

### CATCH rule (CT for childhood minor head injury)
Citation: Osmond MH, Klassen TP, Wells GA, et al (Pediatric Emergency Research
Canada). CATCH: a clinical decision rule for the use of computed tomography in
children with minor head injury. CMAJ. 2010;182(4):341-348.
Rule: CT of the head is indicated if any high-risk factor (GCS < 15 at 2 h,
suspected open/depressed skull fracture, worsening headache, irritability) or any
medium-risk factor (basal-skull-fracture signs, large boggy scalp hematoma,
dangerous mechanism) is present. The validated alternative to PECARN.
Worked example: GCS < 15 at 2 hours (a high-risk factor) -> CT head indicated.

### Modified Duke criteria for infective endocarditis (2023 Duke-ISCVID)
Citation: Fowler VG, Durack DT, Selton-Suty C, et al. The 2023 Duke-ISCVID
Criteria for Infective Endocarditis. Clin Infect Dis. 2023;77(4):518-526;
updating Li JS, Sexton DJ, et al. Clin Infect Dis. 2000;30(4):633-638.
Rule: definite IE = 2 major, or 1 major + 3 minor, or 5 minor criteria; possible
IE = 1 major + 1 minor, or 3 minor; otherwise rejected. Class B (Duke-ISCVID);
see docs/citation-staleness.md.
Worked example: 2 major criteria -> definite infective endocarditis.

### Pitt Bacteremia Score
Citation: Paterson DL, Ko WC, Von Gottberg A, et al. International prospective
study of Klebsiella pneumoniae bacteremia. Ann Intern Med. 2004;140(1):26-32.
Rule: temperature band (>= 40.0 or <= 35.0 C = 2; 39.0-39.9 or 35.1-36.0 C = 1;
36.1-38.9 C = 0) + hypotension (2) + mechanical ventilation (2) + cardiac arrest
(4) + mental status (alert 0, disoriented 1, stupor 2, coma 4). Total 0-14; a
score >= 4 denotes high mortality risk.
Worked example: severe temperature (2) + hypotension (2), alert -> 4, at the
high-risk threshold.

### SAPS II (Simplified Acute Physiology Score II)
Citation: Le Gall JR, Lemeshow S, Saulnier F. A new Simplified Acute Physiology
Score (SAPS II) based on a European/North American multicenter study. JAMA.
1993;270(24):2957-2963.
Rule: 17 variables banded to fixed points (BUN in mg/dL, bilirubin in mg/dL); the
point total converts to predicted hospital mortality via logit = -7.7631 +
0.0737*SAPS + 0.9971*ln(SAPS+1). Companion to apache2.
Worked example: a worked ICU case scoring 64 points -> predicted hospital
mortality 75.3%.

### Lund-Browder chart + Rule of Nines (%TBSA burn)
Citation: Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol
Obstet. 1944;79:352-358.
Rule: age-adjusted regional percentages of total body surface area (head, thighs,
and lower legs vary with age; the rest are fixed) scaled by each region's burned
fraction give the %TBSA; the adult Rule of Nines is computed independently as a
cross-check. Whole-region constants sum to exactly 100% at every age band.
Worked example: adult, head and anterior trunk fully burned -> 20% TBSA (adult
Rule of Nines cross-check 25%).

### Refeeding-syndrome risk (NICE CG32)
Citation: National Institute for Health and Care Excellence (NICE). Nutrition
support for adults: oral nutrition support, enteral tube feeding and parenteral
nutrition (CG32). 2006, updated 2017.
Rule: high risk if one major criterion (BMI < 16 kg/m^2, unintentional weight
loss > 15% over 3-6 months, > 10 days little or no nutritional intake, or low
pre-feeding potassium/magnesium/phosphate) or two minor criteria (BMI < 18.5,
weight loss > 10%, > 5 days little/no intake, or alcohol/drug history). Class B
(NICE guidance); see docs/citation-staleness.md.
Worked example: BMI 15 (one major criterion) -> high risk of refeeding syndrome.

### CHADS2 stroke-risk score
Citation: Gage BF, Waterman AD, Shannon W, et al. Validation of clinical
classification schemes for predicting stroke: results from the National Registry
of Atrial Fibrillation. JAMA. 2001;285(22):2864-2870.
Rule: congestive heart failure (1), hypertension (1), age >= 75 (1), diabetes (1),
prior stroke/TIA (2); total 0-6 maps to the adjusted annual ischemic-stroke rate
from the derivation cohort (0 = 1.9%/yr to 6 = 18.2%/yr). Superseded for routine
use by CHA2DS2-VASc / CHA2DS2-VA, which are cross-linked.
Worked example: hypertension alone -> CHADS2 1, adjusted annual stroke rate 2.8%.

### CHA2DS2-VA (2024 ESC, sex point removed)
Citation: Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for
the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-3414.
Rule: CHF/LV dysfunction (1), hypertension (1), age >= 75 (2), diabetes (1), prior
stroke/TIA/thromboembolism (2), vascular disease (1), age 65-74 (1); no sex point.
Total 0-8; the 2024 ESC form frames a score >= 2 as favoring oral anticoagulation.
Class B (ESC AF guideline); see docs/citation-staleness.md.
Worked example: age 70 with hypertension -> CHA2DS2-VA 2, at/above the ESC OAC
threshold.

### CHADS-65 Canadian anticoagulation pathway
Citation: Andrade JG, Aguilar M, Atzema C, et al. The 2020 CCS/CHRS Comprehensive
Guidelines for the Management of Atrial Fibrillation. Can J Cardiol.
2020;36(12):1847-1948.
Rule: sequential gates -- age >= 65 -> oral anticoagulant; otherwise any CHADS2
risk factor (CHF, hypertension, diabetes, prior stroke/TIA) -> oral anticoagulant;
otherwise coronary or peripheral arterial disease -> antiplatelet; otherwise no
antithrombotic therapy. Class B (CCS guidance); see docs/citation-staleness.md.
Worked example: age 50 with hypertension -> oral anticoagulant via the
CHADS2-factor gate.

### ATRIA Stroke Risk Score
Citation: Singer DE, Chang Y, Borowsky LH, et al. A new risk scheme to predict
ischemic stroke and other thromboembolism in atrial fibrillation: the ATRIA study
stroke risk score. J Am Heart Assoc. 2013;2(3):e000250.
Rule: age is scored from one of two columns by prior stroke (the age x
prior-stroke interaction; with a prior stroke the < 65 band scores higher than the
65-84 bands), plus female sex, diabetes, CHF, hypertension, proteinuria, and
eGFR < 45 mL/min or ESRD (1 each). Total 0-15: low 0-5, intermediate 6, high 7-15.
Worked example: age 60 with a prior stroke -> ATRIA 8 (high-risk band).

### Tisdale QT-prolongation risk score
Citation: Tisdale JE, Jaynes HA, Kingery JR, et al. Development and validation of a
risk score to predict QT interval prolongation in hospitalized patients. Circ
Cardiovasc Qual Outcomes. 2013;6(4):479-487.
Rule: age >= 68 (1), female sex (1), loop diuretic (1), serum potassium <= 3.5 (2),
admission QTc >= 450 ms (2), acute MI (2), sepsis (3), heart failure (3), and
QT-prolonging drugs (one 3, two or more 6). Total 0-21: low <= 6, moderate 7-10,
high >= 11 risk of drug-associated QTc prolongation.
Worked example: sepsis, heart failure, and age >= 68 -> Tisdale 7 (moderate risk).

### MAGGIC Heart Failure Risk Score
Citation: Pocock SJ, Ariti CA, McMurray JJV, et al. Predicting survival in heart
failure: a risk score based on 39,372 patients from 30 studies. Eur Heart J.
2013;34(19):1404-1413.
Rule: an integer-point model in which age and systolic BP are scored from one of
three columns by ejection-fraction tier (the published age and BP interactions
with EF), plus EF, NYHA class, BMI, creatinine, diabetes, COPD, smoking, HF
duration, sex, and beta-blocker / ACE-inhibitor use. The integer total maps to the
published 1-year and 3-year mortality lookup (clamped to the 0-50 table).
Worked example: a worked case scoring 28 points maps to 20.9% one-year and 45.8%
three-year mortality.

### H2FPEF Score
Citation: Reddy YNV, Carter RE, Obokata M, et al. A simple, evidence-based approach
to help guide diagnosis of heart failure with preserved ejection fraction.
Circulation. 2018;138(9):861-870.
Rule: BMI > 30 (2), >= 2 antihypertensive medications (1), atrial fibrillation (3),
echo pulmonary hypertension PASP > 35 mmHg (1), age > 60 (1), echo E/e′ > 9 (1).
Total 0-9: 0-1 low, 2-5 intermediate, 6-9 high probability of HFpEF.
Worked example: atrial fibrillation plus obesity gives a score of 5, an
intermediate probability of HFpEF.

### HFA-PEFF Diagnostic Score
Citation: Pieske B, Tschope C, de Boer RA, et al. How to diagnose heart failure
with preserved ejection fraction: the HFA-PEFF diagnostic algorithm. Eur Heart J.
2019;40(40):3297-3317.
Rule: three domains (functional, morphological, biomarker), each scored on its
highest criterion as major (2) or minor (1) and capped at 2 per domain. Total 0-6:
>= 5 confirms HFpEF, 2-4 is indeterminate (proceed to diastolic stress or invasive
testing), <= 1 makes HFpEF unlikely. Class B (ESC HFA algorithm); see
docs/citation-staleness.md.
Worked example: a major functional, major morphological, and minor biomarker
domain gives 5, which confirms HFpEF.

### CardShock Risk Score
Citation: Harjola VP, Lassus J, Sionis A, et al. Clinical picture and risk
prediction of short-term mortality in cardiogenic shock. Eur J Heart Fail.
2015;17(5):501-509.
Rule: age > 75 (1), confusion at presentation (1), previous MI or CABG (1), ACS
etiology (1), LVEF < 40% (1), blood lactate (2-4 mmol/L = 1, > 4 = 2), eGFR
(30-60 = 1, < 30 = 2). Total 0-9: 0-3 low (~8.7%), 4-5 intermediate (~36%), 6-9
high (~77%) in-hospital mortality. The deterministic substitute for the gestalt
SCAI shock staging.
Worked example: all five clinical factors with lactate > 4 and eGFR < 30 gives 9,
the high-mortality band.

## spec-v103 cardiovascular-risk & atherogenic-lipid engines

These six complement, never replace, the existing ascvd (Pooled Cohort) and
prevent engines. Each states its derivation population so the clinician picks the
right engine. SCORE2 / SCORE2-OP are Class B (ESC region recalibration); the other
four are Class A fixed-coefficient or fixed-identity models.

### SCORE2 (ESC 2021, age 40-69)
Citation: SCORE2 working group and ESC Cardiovascular Risk Collaboration. SCORE2
risk prediction algorithms: new models to estimate 10-year risk of cardiovascular
disease in Europe. Eur Heart J. 2021;42(25):2439-2454.
Rule: sex-specific linear predictor on centered age, systolic BP, total and HDL
cholesterol (mmol/L), and smoking; uncalibrated risk = 1 - S0^exp(LP), then the
published per-region cloglog recalibration (low / moderate / high / very-high
European risk region). Class B (ESC); see docs/citation-staleness.md.
Worked example: a 50-year-old male smoker, SBP 140, total cholesterol 5.5, HDL 1.3
mmol/L scores 5.9% in a low-risk region and 14.0% in a very-high-risk region; the
matching woman scores 4.2% and 13.7% (the published ESC worked example).

### SCORE2-OP (ESC 2021, age >= 70)
Citation: SCORE2-OP working group and ESC Cardiovascular Risk Collaboration.
SCORE2-OP risk prediction algorithms: estimating incident cardiovascular event
risk in older persons. Eur Heart J. 2021;42(25):2455-2467.
Rule: the older-persons companion to SCORE2; adds diabetes as a predictor, centered
at age 73 / SBP 150 / TC 6 / HDL 1.4 mmol/L; uncalibrated risk = 1 - S0^exp(LP -
mean), then the per-region cloglog recalibration. Class B (ESC); see
docs/citation-staleness.md.
Worked example: a 75-year-old woman in a high-risk region, non-smoker, SBP 150,
total cholesterol 5.5, HDL 1.4 mmol/L scores a 10-year cardiovascular risk of
21.6%.

### MESA 10-Year CHD Risk (with coronary-artery calcium)
Citation: McClelland RL, Jorgensen NW, Budoff M, et al. 10-year coronary heart
disease risk prediction using coronary artery calcium and traditional risk factors:
derivation in the Multi-Ethnic Study of Atherosclerosis. J Am Coll Cardiol.
2015;66(15):1643-1653.
Rule: penalized Cox on raw traditional factors (mg/dL cholesterol); the with-CAC
model adds 0.2743 x ln(Agatston + 1). White is the reference race. Risk = 1 -
S0^exp(sum of beta x value), with S0 of 0.99963 (no CAC) or 0.99833 (with CAC).
Worked example: a 60-year-old White man, total cholesterol 200, HDL 50 mg/dL, SBP
125, no other factors scores 4.86% without calcium and 7.34% with an Agatston of
100 - the calcium refinement is visible.

### Framingham General CVD Risk + Vascular Age (2008)
Citation: D'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General cardiovascular
risk profile for use in primary care: the Framingham Heart Study. Circulation.
2008;117(6):743-753.
Rule: sex-specific Cox on ln-transformed age, total and HDL cholesterol (mg/dL),
and systolic BP (treated coefficient when on antihypertensives), plus smoking and
diabetes. Vascular age is the age at which an otherwise-normal-risk person (TC 180,
HDL 45, SBP 125 untreated, non-smoker, non-diabetic) carries the same risk.
Worked example: a 61-year-old woman, total cholesterol 230, HDL 47 mg/dL, SBP 124
untreated, non-smoker, non-diabetic scores 8.4% with a vascular age of 67.7 years
(the published paper example).

### Reynolds Risk Score
Citation: Ridker PM, Buring JE, Rifai N, Cook NR. Development and validation of
improved algorithms for global cardiovascular risk assessment in women: the
Reynolds Risk Score. JAMA. 2007;297(6):611-619; Ridker PM, et al. Circulation.
2008;118(22):2243-2251 (men).
Rule: adds high-sensitivity CRP (mg/L) and parental history of premature MI to the
traditional factors (mg/dL cholesterol). Women use linear age plus an HbA1c term
for diabetics; the men's model was derived in non-diabetics (no HbA1c term).
Worked example: a 60-year-old woman, SBP 140, total cholesterol 260, HDL 45 mg/dL,
hsCRP 4.5 mg/L, smoker, family history positive scores a 10-year risk of 18.9%.

### Non-HDL & Remnant Cholesterol
Citation: Varbo A, Benn M, Tybjaerg-Hansen A, et al. Remnant cholesterol as a
causal risk factor for ischemic heart disease. J Am Coll Cardiol. 2013;61(4):427-436.
Rule: non-HDL = total cholesterol - HDL (all apoB-containing atherogenic
lipoproteins); remnant = total - HDL - LDL (triglyceride-rich-remnant cholesterol).
The entered unit (mg/dL or mmol/L) is preserved; a negative remnant (LDL + HDL
exceeding total) is flagged as a data-entry error rather than printed.
Worked example: total cholesterol 200, HDL 50, LDL 120 mg/dL gives a non-HDL of
150 mg/dL (at or above the 130 mg/dL guideline target) and a remnant of 30 mg/dL.

### Brugada Criteria (VT vs SVT)
Citation: Brugada P, Brugada J, Mont L, et al. A new approach to the differential
diagnosis of a regular tachycardia with a wide QRS complex. Circulation.
1991;83(5):1649-1659.
Rule: four sequential steps -- (1) absence of an RS complex in all precordial
leads, (2) R-to-S interval over 100 ms in any precordial lead, (3) AV
dissociation, (4) morphologic VT criteria in both V1-V2 and V6. A positive answer
at any step diagnoses ventricular tachycardia and stops the algorithm; all four
negative is supraventricular tachycardia with aberrant conduction.
Worked example: step 1 positive (no RS in any precordial lead) returns VT and
names step 1 as the first positive step.

### Vereckei aVR Algorithm
Citation: Vereckei A, Duray G, Szenasi G, et al. New algorithm using only lead aVR
for differential diagnosis of wide QRS complex tachycardia. Heart Rhythm.
2008;5(1):89-98.
Rule: four sequential steps in lead aVR -- (1) initial dominant R wave, (2) initial
r or q wave over 40 ms, (3) notch on the descending limb of a negative-onset QRS,
(4) ventricular activation-velocity ratio vi/vt at or below 1. A positive answer at
any step diagnoses VT; all four negative is supraventricular.
Worked example: an initial dominant R wave in aVR (step 1) returns VT.

### Aortic Dissection Detection Risk Score (ADD-RS)
Citation: Rogers AM, Hermann LK, Booher AM, et al. Sensitivity of the aortic
dissection detection risk score, a novel guideline-based tool for identification of
acute aortic dissection at initial presentation. Circulation. 2011;123(20):2213-2218.
Rule: three categories (predisposing conditions, pain features, exam findings); each
category scores 1 point if any feature within it is present, total 0-3. ADD-RS 0 low,
1 intermediate, 2 or more high risk. The optional D-dimer is a pathway note only:
in the ADD-RS 1-or-below group a D-dimer under 500 ng/mL is the published rule-out
adjunct (ADD-RS-D); ADD-RS 2 or more goes directly to imaging.
Worked example: high-risk predisposing condition plus high-risk pain feature scores
2 (high risk).

### ROSE Rule (syncope)
Citation: Reed MJ, Newby DE, Coull AJ, et al. The ROSE (Risk Stratification of
Syncope in the Emergency Department) study. J Am Coll Cardiol. 2010;55(8):713-721.
Rule: BRACES plus bradycardia -- BNP at or above 300 pg/mL, bradycardia at or below
50 bpm, rectal exam fecal-occult-blood positive, anemia (hemoglobin at or below
90 g/L), chest pain with syncope, ECG Q wave (not lead III), oxygen saturation at or
below 94%. Any single positive criterion predicts a 1-month serious outcome or death;
all-negative is low risk.
Worked example: a BNP at or above 300 pg/mL alone returns high risk.

### EGSYS Score (cardiac-syncope probability)
Citation: Del Rosso A, Ungar A, Maggi R, et al. Clinical predictors of cardiac
syncope at initial evaluation in patients referred urgently to a general hospital:
the EGSYS score. Heart. 2008;94(12):1620-1626.
Rule: abnormal ECG and/or heart disease (+3), palpitations before syncope (+4),
syncope during effort (+3), syncope in the supine position (+2), and -- scored when
PRESENT -- precipitating/predisposing factors (-1) and autonomic prodromes (-1).
Effort and supine are separate items with distinct weights (verified against the
primary paper and MDCalc); total range -2 to +12, with a score of 3 or more
suggesting cardiac syncope.
Worked example: palpitations (+4) with autonomic prodromes present (-1) scores 3,
which suggests cardiac syncope.

### OESIL Risk Score (syncope)
Citation: Colivicchi F, Ammirati F, Melina D, et al. Development and prospective
validation of a risk stratification system for patients with syncope in the
emergency department: the OESIL risk score. Eur Heart J. 2003;24(9):811-819.
Rule: one point each for age over 65, cardiovascular disease in clinical history,
syncope without prodrome, and an abnormal ECG. Total 0-4; published 12-month total
mortality is 0 percent at 0, 0.8 percent at 1, 19.6 percent at 2, 34.7 percent at 3,
and 57.1 percent at 4, rising sharply at a score of 2 or more.
Worked example: age over 65 with a cardiovascular history scores 2 (12-month
mortality 19.6 percent).

## spec-v105 vascular & cardiac-surgery instruments

### Ankle-Brachial Index (ABI)
Citation: Aboyans V, Criqui MH, Abraham P, et al. Measurement and interpretation
of the ankle-brachial index. Circulation. 2012;126(24):2890-2909.
Rule: for each leg, divide the higher ankle systolic pressure (dorsalis pedis or
posterior tibial) by the higher of the two brachial systolic pressures; the lower
of the two leg indices governs. Bands: over 1.40 non-compressible, 1.00 to 1.40
normal, 0.91 to 0.99 borderline, 0.41 to 0.90 mild-to-moderate peripheral artery
disease, 0.40 or less severe disease.
Worked example: a right ankle of 90 over a brachial of 100 gives an index of 0.90
(mild-to-moderate peripheral artery disease); at 91 over 100 the index of 0.91 is
borderline.

### Rutherford Category / Fontaine Stage (PAD)
Citation: Rutherford RB, Baker JD, Ernst C, et al. Recommended standards for
reports dealing with lower extremity ischemia: revised version. J Vasc Surg.
1997;26(3):517-538.
Rule: two parallel chronic-limb-ischemia classifications. Rutherford 0
asymptomatic, 1 mild / 2 moderate / 3 severe claudication, 4 ischemic rest pain,
5 minor tissue loss, 6 major tissue loss. Fontaine I asymptomatic, IIa mild / IIb
disabling claudication, III rest pain, IV ulceration or gangrene. Rutherford 4 to
6 (Fontaine III to IV) is chronic limb-threatening ischemia.
Worked example: severe claudication is Rutherford category 3 and Fontaine stage IIb.

### SVS WIfI Limb-Threat Classification
Citation: Mills JL Sr, Conte MS, Armstrong DG, et al. The Society for Vascular
Surgery Lower Extremity Threatened Limb Classification System: risk stratification
based on Wound, Ischemia, and foot Infection (WIfI). J Vasc Surg.
2014;59(1):220-234.
Rule: grade Wound, Ischemia, and foot Infection each from 0 to 3, then read the
clinical stage from 1 to 4 off the expert-panel amputation-risk table (stage 1 very
low, 2 low, 3 moderate, 4 high estimated one-year amputation risk).
Worked example: Wound 2, Ischemia 3, foot Infection 1 maps to clinical stage 4
(high one-year amputation risk).

### EuroSCORE II
Citation: Nashef SAM, Roques F, Sharples LD, et al. EuroSCORE II. Eur J
Cardiothorac Surg. 2012;41(4):734-744.
Rule: predicted in-hospital mortality after cardiac surgery via the logistic model
e^y over (1 plus e^y), where y is minus 5.324537 plus the sum of the published
patient, cardiac, and operative coefficients; the age term adds 0.0285181 per year
above 60. The on-dialysis coefficient is lower than that for a creatinine clearance
of 50 or less without dialysis, a published feature reproduced verbatim. (Note the
age coefficient is the EuroSCORE II multivariate value 0.0285181, not the legacy
EuroSCORE I value.)
Worked example: a 70-year-old woman on dialysis with insulin-dependent diabetes,
chronic pulmonary dysfunction, NYHA III, CCS class 4 angina, poor LV function, and
a recent MI for an isolated elective CABG gives y of minus 2.126358 and a predicted
mortality of 10.66 percent.

## spec-v106 venous-thromboembolism workup instruments

### PEGeD (graduated D-dimer rule)
Citation: Kearon C, de Wit K, Parpia S, et al. Diagnosis of pulmonary embolism with
d-dimer adjusted to clinical probability. N Engl J Med. 2019;381(22):2125-2134.
Rule: set the clinical pretest probability by the three-tier Wells categorization,
then apply a probability-graduated D-dimer threshold in nanograms per milliliter
FEU. Low pretest probability excludes PE if the D-dimer is under 1000; moderate
excludes if under 500; high pretest probability proceeds directly to CT pulmonary
angiography with no D-dimer rule-out.
Worked example: a D-dimer of 600 at low pretest probability is under the 1000 cut,
so PE is excluded and imaging can be avoided.

### 4PEPS (4-level PE clinical probability score)
Citation: Roy PM, Friou E, Germeau B, et al. Derivation and validation of a 4-level
clinical pretest probability score for suspected pulmonary embolism to safely
decrease imaging testing. JAMA Cardiol. 2021;6(6):669-677.
Rule: thirteen weighted items sum to a total from minus 5 to plus 21. Under 0 is
very low (no testing), 0 to 5 is low (rule out if D-dimer under 1000), 6 to 12 is
moderate (age-adjusted cutoff), 13 or more is high (direct imaging).
Worked example: a 70-year-old man with prior VTE, syncope, and calf pain or edema
totals plus 14, a high-probability result calling for direct imaging.

### Bova Score (PE complications)
Citation: Bova C, Sanchez O, Prandoni P, et al. Identification of intermediate-risk
patients with acute symptomatic pulmonary embolism. Eur Respir J. 2014;44(3):694-703.
Rule: for normotensive, confirmed PE, systolic blood pressure 90 to 100 adds 2,
elevated troponin adds 2, right-ventricular dysfunction adds 2, and a heart rate of
110 or more adds 1, summing 0 to 7. Stage I is 0 to 2, Stage II is 3 to 4, Stage III
is over 4.
Worked example: systolic pressure 90 to 100 with elevated troponin and RV
dysfunction totals 6, Stage III, with roughly 42 percent 30-day complications.

### Hestia Criteria (outpatient PE)
Citation: Zondag W, Mos ICM, Creemers-Schild D, et al. Outpatient treatment in
patients with acute pulmonary embolism: the Hestia Study. J Thromb Haemost.
2011;9(8):1500-1507.
Rule: eleven yes-or-no exclusion items. Any single positive item means the patient
is not a home-treatment candidate; all-negative means eligible per the rule.
Worked example: pregnancy alone is one positive item, so the patient is not a
home-treatment candidate.

### Geneva Score (original)
Citation: Wicki J, Perneger TV, Junod AF, Bounameaux H, Perrier A. Assessing clinical
probability of pulmonary embolism in the emergency ward: a simple score. Arch Intern
Med. 2001;161(1):92-97.
Rule: a fully objective pre-Wells model. Age 60 to 79 adds 1 and 80 or more adds 2;
prior DVT or PE adds 2; surgery within four weeks adds 3; heart rate over 100 adds 1;
the arterial PaCO2 and PaO2 bands and the chest-film findings (band atelectasis,
elevated hemidiaphragm) add their weights, summing 0 to 16. Low is 0 to 4 (about 10
percent PE), intermediate 5 to 8 (about 38 percent), high 9 or more (about 81 percent).
Worked example: an 80-year-old with prior VTE, recent surgery, a fast heart rate, a
low PaCO2, and a low PaO2 scores 14, a high-probability result.

### Constans Score (upper-extremity DVT)
Citation: Constans J, Salmi LR, Sevestre-Pietri MA, et al. A clinical prediction
score for upper extremity deep venous thrombosis. Thromb Haemost. 2008;99(1):202-207.
Rule: venous material in the limb (central line or pacemaker) adds 1, localized pain
adds 1, unilateral pitting edema adds 1, and an alternative diagnosis at least as
plausible subtracts 1, giving a signed total from minus 1 to plus 3. Low is 0 or
below, intermediate is 1, high is 2 to 3.
Worked example: venous material with localized pain and unilateral edema totals plus
3, a high-probability result.

### HEAR Score (HEART minus troponin)
Citation: Moumneh T, Sun BC, Baecker A, et al. Identifying patients with low risk of
acute coronary syndrome without troponin testing: validation of the HEAR score. Eur J
Emerg Med. 2021;28(4):292-298.
Rule: the four HEART domains minus troponin -- History, ECG, Age, and Risk factors,
each scored 0, 1, or 2 -- sum to a total of 0 to 8. A score of 1 or below marks the
very-low-risk band (about 0.4 percent 30-day major adverse cardiac events) used as a
pre-troponin gate.
Worked example: a moderately suspicious history, a non-specific repolarization ECG, an
age of 58, and one or two risk factors total 4, above the very-low-risk band.

### New Orleans Head Trauma Criteria
Citation: Haydel MJ, Preston CA, Mills TJ, Luber S, Blaudeau E, DeBlieux PMC.
Indications for computed tomography in patients with minor head injury. N Engl J Med.
2000;343(2):100-105.
Rule: in minor blunt head injury with GCS 15, any one of seven criteria -- headache,
vomiting, age over 60, drug or alcohol intoxication, persistent anterograde amnesia,
physical evidence of trauma above the clavicles, and seizure -- indicates a head CT.
The rule is fully sensitive for intracranial injury on CT but has low specificity.
Worked example: vomiting with an age over 60 gives two positive criteria, so a head CT
is indicated.

### GO-FAR Score (good-outcome survival after in-hospital arrest)
Citation: Ebell MH, Jang W, Shen Y, Geocadin RG. Development and validation of the Good
Outcome Following Attempted Resuscitation (GO-FAR) score. JAMA Intern Med.
2013;173(20):1872-1878.
Rule: pre-arrest variables sum to a total from minus 15 to plus 76. Neurologically
intact or minimal deficit at admission subtracts 15 (the only negative term);
comorbidity and admission diagnoses add 1 to 10; age bands add 0 to 11. The total maps
to four categories of survival to discharge with good neurologic outcome: at or below
minus 6 is above average (over 15 percent), minus 5 to 13 is average (3 to 15 percent),
14 to 23 is low (1 to 3 percent), and 24 or more is very low (under 1 percent).
Worked example: age 82 with septicemia and respiratory insufficiency totals plus 17, a
low-probability category.

### MACOCHA Score (ICU difficult intubation)
Citation: De Jong A, Molinari N, Terzi N, et al. Early identification of patients at
risk for difficult intubation in the intensive care unit: development and validation of
the MACOCHA score in a multicenter cohort study. Am J Respir Crit Care Med.
2013;187(8):832-839.
Rule: Mallampati III or IV adds 5, obstructive sleep apnea adds 2, and reduced cervical
mobility, mouth opening under 3 centimeters, coma, severe hypoxemia, and a
non-anesthesiologist operator each add 1, summing 0 to 12. A score of 3 or more flags
elevated difficult-intubation risk (sensitivity 73 percent, negative predictive value
98 percent).
Worked example: Mallampati III or IV with obstructive sleep apnea totals 7, an
elevated-risk result.

### TRISS (Trauma and Injury Severity Score)
Citation: Boyd CR, Tolson MA, Copes WS. Evaluating trauma care: the TRISS method.
Trauma Score and the Injury Severity Score. J Trauma. 1987;27(4):370-378.
Coefficients per the Major Trauma Outcome Study revision (Champion HR, et al).
Rule: probability of survival Ps = 1 / (1 + e^-b), where b is the intercept plus
weighted contributions from the coded Revised Trauma Score, the Injury Severity Score,
and an age index (0 under age 55, 1 at or over 55). Blunt and penetrating mechanisms
use separate coefficient sets.
Worked example: a blunt injury with a coded Revised Trauma Score of 6, an Injury
Severity Score of 25, and an age >= 55 gives a probability of survival near 65.8
percent; the penetrating set on the same inputs gives about 45 percent.

### New Injury Severity Score (NISS)
Citation: Osler T, Baker SP, Long W. A modification of the injury severity score that
both improves accuracy and simplifies scoring. J Trauma. 1997;43(6):922-925.
Rule: the sum of the squares of the three highest Abbreviated Injury Scale severities
regardless of body region, ranging up to 75; any severity of 6 forces the maximal
score. Unlike the Injury Severity Score, the three worst injuries need not be in three
different regions.
Worked example: severities of 5, 4, and 3 sum of squares to 50; a severity of 6 forces
75.

### TASH Score (Trauma-Associated Severe Hemorrhage)
Citation: Yucel N, Lefering R, Maegele M, et al. Trauma Associated Severe Hemorrhage
(TASH)-Score: probability of mass transfusion as surrogate for life threatening
hemorrhage after multiple trauma. J Trauma. 2006;60(6):1228-1236.
Rule: hemoglobin, base excess, systolic blood pressure, heart rate over 120, a positive
focused assessment, an unstable pelvic fracture, an open or dislocated femur fracture,
and male sex each add weighted points to a total of 0 to 31. The total maps to a
logistic probability of mass transfusion, near one half at a total of 16.
Worked example: a hemoglobin under 10, a base excess under -6, a systolic blood
pressure under 100, a heart rate over 120, and a positive focused assessment total 16,
about a 47.5 percent probability.

### RABT Score (Revised Assessment of Bleeding and Transfusion)
Citation: Joseph B, Khan M, Truitt M, et al. Massive transfusion: the revised
assessment of bleeding and transfusion (RABT) score. World J Surg.
2018;42(11):3702-3708.
Rule: a shock index over 1, a pelvic fracture, a penetrating mechanism, and a positive
focused assessment each add 1 point, giving a total of 0 to 4. A total of 2 or more
predicts massive transfusion.
Worked example: a shock index over 1 with a pelvic fracture totals 2, predicting
massive transfusion.

### Glasgow Coma Scale-Pupils Score (GCS-P)
Citation: Brennan PM, Murray GD, Teasdale GM. Simplifying the use of prognostic
information in traumatic brain injury. Part 1: the GCS-Pupils score. J Neurosurg.
2018;128(6):1612-1620.
Rule: the Glasgow Coma Scale total minus the pupil reactivity penalty (the number of
pupils unreactive to light), giving an index from 1 to 15. The penalty cannot drive the
index below 1.
Worked example: a Glasgow Coma Scale of 6 with 1 unreactive pupil gives an index of 5.

### NEXUS Chest CT decision instrument
Citation: Rodriguez RM, Langdorf MI, Nishijima D, et al. Derivation and validation of
two decision instruments for selective chest CT in blunt trauma: a multicenter
prospective observational study (NEXUS Chest CT). PLoS Med. 2015;12(10):e1001883.
Rule: in blunt thoracic trauma, an abnormal chest x-ray, a distracting injury,
chest-wall tenderness, a rapid-deceleration mechanism, age over 60, intoxication, or
abnormal alertness each flag the patient. If all are negative, chest CT can be
deferred; any positive criterion means chest CT may be indicated.
Worked example: an age over 60 alone flags the patient, so chest CT may be indicated.

### Expanded Denver Criteria for blunt cerebrovascular injury (BCVI)
Citation: Burlew CC, Biffl WL, Moore EE, Barnett CC, Johnson JL, Bensard DD. Blunt
cerebrovascular injuries: redefining screening criteria in the era of noninvasive
diagnosis. J Trauma Acute Care Surg. 2012;72(2):330-337.
Rule: CT angiography screening for BCVI is indicated if any sign/symptom (arterial
hemorrhage from neck/nose/mouth, cervical bruit under age 50, expanding hematoma,
focal neurologic deficit, exam incongruous with head CT, or stroke on secondary CT)
or any high-energy-mechanism risk factor (LeFort II/III, a cervical-spine fracture
pattern, basilar skull fracture with carotid-canal involvement, diffuse axonal
injury with GCS below 6, near-hanging with anoxia, or a seatbelt/clothesline injury
with cervical swelling, pain, or altered mental status) is present.
Worked example: an expanding cervical hematoma alone indicates CTA screening.

### AAST Organ Injury Scale (spleen, liver, kidney) -- 2018 revision
Citation: Kozar RA, Crandall M, Shanmuganathan K, et al; AAST Patient Assessment
Committee. Organ injury scaling 2018 update: spleen, liver, and kidney. J Trauma
Acute Care Surg. 2018;85(6):1119-1122.
Rule: grades spleen, liver, and kidney trauma I through V from the worst anatomic
finding (hematoma extent, intraparenchymal size, laceration depth). The 2018
revision added the vascular rule: a vascular injury or active bleeding contained
within the organ raises the grade, and active bleeding extending beyond the organ
raises it one grade higher. The final grade is the higher of the anatomic and the
vascular grade.
Worked example: a spleen grade II laceration with a contained vascular injury is
upgraded to grade IV by the 2018 vascular rule.

### Mangled Extremity Severity Score (MESS)
Citation: Johansen K, Daines M, Howey T, Helfet D, Hansen ST Jr. Objective criteria
accurately predict amputation following lower extremity trauma. J Trauma.
1990;30(5):568-573.
Rule: sums skeletal/soft-tissue injury energy (1-4), limb ischemia (1-3, doubled
when ischemia time exceeds 6 hours), shock (0-2 by systolic BP), and an age band
(0-2). A total at or above 7 was historically associated with amputation; the score
informs, never dictates, the salvage-vs-amputation decision.
Worked example: skeletal energy 3 plus a doubled ischemia subscore of 4 reaches a
total of 7, at the amputation-associated threshold.

### LRINEC score (Laboratory Risk Indicator for Necrotizing Fasciitis)
Citation: Wong CH, Khin LW, Heng KS, Tan KC, Low CO. The LRINEC (Laboratory Risk
Indicator for Necrotizing Fasciitis) score: a tool for distinguishing necrotizing
fasciitis from other soft tissue infections. Crit Care Med. 2004;32(7):1535-1541.
Rule: bands six routine labs -- CRP at or above 150 mg/L scores 4; WBC 15-25 or
above 25 scores 1 or 2; hemoglobin 11-13.5 or below 11 scores 1 or 2; sodium below
135 scores 2; creatinine above 1.6 mg/dL scores 2; glucose above 180 mg/dL scores 1
(range 0-13). Low risk is 5 or below, intermediate 6-7, high 8 or above; a score of
6 or above should raise suspicion. A low score does not rule out necrotizing
fasciitis.
Worked example: CRP 180, WBC 26, and hemoglobin 10 give a score of 8, the high band.

### ALT-70 cellulitis score
Citation: Raff AB, Weng QY, Cohen JM, et al. A predictive model for diagnosis of
lower extremity cellulitis: a risk score based on clinical and patient
characteristics. J Am Acad Dermatol. 2017;76(4):618-625.
Rule: Asymmetry scores 3, leukocytosis (WBC at or above 10) scores 1, tachycardia
(heart rate at or above 90) scores 1, and age at or above 70 scores 2 (range 0-7).
A total of 2 or below means cellulitis is unlikely, 3-4 is indeterminate, and 5 or
above means cellulitis is likely.
Worked example: asymmetry plus leukocytosis plus tachycardia gives a score of 5,
cellulitis likely.

### Digoxin immune Fab (DigiFab) dosing
Citation: Smith TW, Butler VP Jr, Haber E, et al. Treatment of life-threatening
digitalis intoxication with digoxin-specific Fab antibody fragments: experience
in 26 cases. N Engl J Med. 1982;307(22):1357-1362.
Rule: by amount ingested, vials = amount (mg) times 0.8 bioavailability divided
by 0.5 mg digoxin bound per vial; by steady-state serum level, vials = level
(ng/mL) times weight (kg) divided by 100; empiric is 10-20 vials for an acute
ingestion and 3-6 vials for chronic toxicity. Vials are rounded up to the next
whole vial.
Worked example: a steady-state level of 4.5 ng/mL at 70 kg gives 3.15, rounded
up to 4 vials.

### Acetaminophen N-acetylcysteine (NAC) IV dosing
Citation: Prescott LF, Illingworth RN, Critchley JA, Stewart MJ, Adam RD,
Proudfoot AT. Intravenous N-acetylcysteine: the treatment of choice for
paracetamol poisoning. BMJ. 1979;2(6198):1097-1100; two-bag SNAP regimen per
Bateman DN, et al. Lancet. 2014;383:697-704.
Rule: the three-bag 21-hour regimen is 150 mg/kg over 1 h, then 50 mg/kg over
4 h, then 100 mg/kg over 16 h; the two-bag SNAP regimen is 200 mg/kg over 4 h,
then 100 mg/kg over 16 h. The dosing weight is capped at 110 kg.
Worked example: a 120 kg patient on the three-bag regimen is dosed at 110 kg,
giving bag doses of 16500, 5500, and 11000 mg.

### High-dose insulin euglycemia therapy (HIET) dosing
Citation: Engebretsen KM, Kaczmarek KM, Morgan J, Holger JS. High-dose insulin
therapy in beta-blocker and calcium channel-blocker poisoning. Clin Toxicol
(Phila). 2011;49(4):277-283.
Rule: a regular-insulin bolus of 1 unit/kg, then an infusion starting at
1 unit/kg/hr titratable to a 10 unit/kg/hr ceiling, paired with a dextrose
infusion to maintain euglycemia.
Worked example: an 80 kg patient receives an 80-unit bolus, an 80 units/hr
starting infusion, and an 800 units/hr titration ceiling.

### TCA toxicity: QRS risk and sodium-bicarbonate target
Citation: Boehnert MT, Lovejoy FH Jr. Value of the QRS duration versus the serum
drug level in predicting seizures and ventricular arrhythmias after an acute
overdose of tricyclic antidepressants. N Engl J Med. 1985;313(8):474-479.
Rule: a maximal limb-lead QRS at or above 100 ms predicts seizures and a QRS at
or above 160 ms predicts ventricular arrhythmias; treat QRS widening with a
sodium-bicarbonate bolus of 1-2 mEq/kg targeting a serum pH of 7.45-7.55.
Worked example: a QRS of 120 ms at 70 kg falls in the seizure-risk band with a
70-140 mEq bicarbonate bolus.

### Lithium dialysis decision (EXTRIP)
Citation: Decker BS, Goldfarb DS, Dargan PI, et al; EXTRIP Workgroup.
Extracorporeal treatment for lithium poisoning: systematic review and
recommendations from the EXTRIP workgroup. Clin J Am Soc Nephrol.
2015;10(5):875-887.
Rule: extracorporeal treatment is recommended for decreased consciousness,
seizures, or life-threatening dysrhythmias at any level, or for impaired kidney
function with a level above 4.0 mmol/L; it is suggested for a level above
5.0 mmol/L, significant confusion, or an expected time to a level below
1.0 mmol/L beyond 36 hours.
Worked example: a level of 4.5 mmol/L with impaired kidney function is a
recommended indication.

### 2018 Lake Louise Acute Mountain Sickness (AMS) Score
Citation: Roach RC, Hackett PH, Oelz O, et al; Lake Louise AMS Score Consensus
Committee. The 2018 Lake Louise Acute Mountain Sickness Score. High Alt Med Biol.
2018;19(1):4-6.
Rule: four self-reported symptoms (headache, gastrointestinal, fatigue/weakness,
dizziness/lightheadedness) each scored 0-3, total 0-12. AMS is diagnosed only
when the total is 3 or more in the presence of a headache, after a recent gain
in altitude; severity is then mild 3-5, moderate 6-9, severe 10-12. The 2018
revision dropped the sleep item.
Worked example: a headache, GI, and fatigue each scored 1 (total 3) with a
headache present is AMS, mild. The same three points without a headache fails
the headache-required gate.

### Szpilman drowning classification
Citation: Szpilman D. Near-drowning and drowning classification: a proposal to
stratify mortality based on the analysis of 1,831 cases. Chest.
1997;112(3):660-665.
Rule: a decision tree on cough, auscultation, pulmonary edema, hypotension, and
respiratory/cardiac arrest. Rescue (normal auscultation, no cough) and grade 1
(normal auscultation with cough) carry about 0% mortality; grade 2 (rales in
some fields) 0.6%; grade 3 (pulmonary edema, normotensive) 5.2%; grade 4
(pulmonary edema with hypotension) 19.4%; grade 5 (isolated respiratory arrest)
44%; grade 6 (cardiopulmonary arrest) 93%.
Worked example: a breathing victim with rales in some lung fields is grade 2,
about 0.6% mortality.

### Snakebite Severity Score (SSS)
Citation: Dart RC, Hurlbut KM, Garcia R, Boren J. Validation of a severity score
for the assessment of crotalid snakebite. Ann Emerg Med. 1996;27(3):321-326.
Rule: six body-system subscores summed -- pulmonary 0-3, cardiovascular 0-3,
local wound 0-4, gastrointestinal 0-3, hematologic 0-4, and central nervous
system 0-3, for a total of 0-20. Dart 1996 validated the SSS as a continuous
severity index and does not define fixed total-score severity cutoffs.
Worked example: subscores of pulmonary 3, cardiovascular 3, local 4, GI 2,
hematologic 1, and CNS 1 sum to 14 of a maximum 20.

### Cauchy frostbite classification
Citation: Cauchy E, Chetaille E, Marchand V, Marsigny B. Retrospective study of
70 cases of severe frostbite lesions: a proposed new classification scheme.
Wilderness Environ Med. 2001;12(4):248-255.
Rule: four grades set by the day-0 lesion topography, the day-2 bone-scan uptake,
and the day-2 blisters; the grade is the most severe of the three findings.
Grade 1 (no lesion) predicts no amputation and no sequela; grade 2 (distal
phalanx, clear blisters) soft-tissue/nail amputation; grade 3
(intermediate-proximal phalanx, hemorrhagic blisters, absent digit uptake) bone
amputation of the digit with functional sequelae; grade 4 (carpal-tarsal area)
bone amputation of the limb with functional sequelae.
Worked example: a distal-phalanx lesion (grade 2 by topography) with absent
bone-scan uptake in the carpal-tarsal area is upgraded to grade 4.

### MEDS Score (Mortality in Emergency Department Sepsis)
Citation: Shapiro NI, Wolfe RE, Moore RB, Smith E, Burdick E, Bates DW. Mortality
in Emergency Department Sepsis (MEDS) score: a prospectively derived and validated
clinical prediction rule. Crit Care Med. 2003;31(3):670-675.
Rule: nine weighted items summed to a total of 0-27 -- terminal illness 6,
tachypnea or hypoxia 3, septic shock 3, platelets below 150k 3, bands above 5% 3,
age above 65 3, lower respiratory infection 2, nursing-home resident 2, and
altered mental status 2. The 28-day mortality bands are very low 0-4 (~0.9%), low
5-7 (~2.0%), moderate 8-12 (~7.8%), high 13-15 (~20%), and very high at or above
16 (~50%).
Worked example: terminal illness, septic shock, and age above 65 sum to a total
of twelve, the moderate band.

### Sepsis-Induced Coagulopathy (SIC) Score
Citation: Iba T, Levy JH, Warkentin TE, Thachil J, van der Poll T, Levi M.
Diagnosis and management of sepsis-induced coagulopathy and disseminated
intravascular coagulation. J Thromb Haemost. 2019;17(11):1989-1994.
Rule: three items -- platelet count (at or above 150 scores 0, 100 to below 150
scores 1, below 100 scores 2), PT-INR (at or below 1.2 scores 0, above 1.2 to 1.4
scores 1, above 1.4 scores 2), and the total SOFA capped at 2 -- for a total of
0-6. SIC is met when the total is at or above 4 and the platelet plus PT-INR
subscore is at or above 3, so the SOFA item alone cannot diagnose SIC.
Worked example: a platelet count of eighty, a PT-INR of 1.6, and a SOFA of zero
sum to a total of four with a coag subscore of four, meeting the SIC criteria.

### Clinical Pulmonary Infection Score (CPIS)
Citation: Pugin J, Auckenthaler R, Mili N, Janssens JP, Lew PD, Suter PM.
Diagnosis of ventilator-associated pneumonia by bacteriologic analysis of
bronchoscopic and nonbronchoscopic blind bronchoalveolar lavage fluid. Am Rev
Respir Dis. 1991;143(5 Pt 1):1121-1129.
Rule: six components scored zero, one, or two -- temperature, leukocytes (with a
bonus point for band forms at or above 50%), tracheal secretions, oxygenation by
the PaO2 over FiO2 ratio with the ARDS exclusion, chest radiograph, and culture
(with a bonus point for the same organism on Gram stain) -- for a total of 0-12.
A score above six suggests ventilator-associated pneumonia.
Worked example: a febrile patient with abnormal leukocytes, purulent secretions,
a low oxygenation ratio, and a diffuse infiltrate scores in the VAP-likely range.

### Lactate Clearance
Citation: Nguyen HB, Rivers EP, Knoblich BP, Jacobsen G, Muzzin A, Ressler JA,
Tomlanovich MC. Early lactate clearance is associated with improved outcome in
severe sepsis and septic shock. Crit Care Med. 2004;32(8):1637-1642.
Rule: the percentage fall between two draws, the initial minus the repeat, divided
by the initial, times one hundred. A clearance at or above ten percent over the
early hours was associated with improved outcome; a negative value means the
lactate rose. The initial lactate must be above zero.
Worked example: an initial lactate of four falling to a repeat of two is a fifty
percent clearance, in the favorable range.

### MRC Sum Score (ICU-Acquired Weakness)
Citation: De Jonghe B, Sharshar T, Lefaucheur JP, et al. Paresis acquired in the
intensive care unit: a prospective multicenter study. JAMA. 2002;288(22):2859-2867.
Rule: six movements graded bilaterally (shoulder abduction, elbow flexion, wrist
extension, hip flexion, knee extension, and ankle dorsiflexion -- twelve muscle
groups), each zero to five on the MRC scale, for a sum of 0-60. A sum below
forty-eight defines ICU-acquired weakness; below thirty-six is severe.
Worked example: every group graded four sums to forty-eight, at the threshold, so
ICU-acquired weakness is not met; one group dropping to three flips it.

### IVC Collapsibility / Distensibility Index
Citation: Barbier C, Loubieres Y, Schmit C, Hayon J, Ricome JL, Jardin F,
Vieillard-Baron A. Respiratory changes in inferior vena cava diameter are helpful
in predicting fluid responsiveness in ventilated septic patients. Intensive Care
Med. 2004;30(9):1740-1746.
Rule: in the mechanically ventilated patient the distensibility index is the
maximum minus the minimum IVC diameter, divided by the minimum, times one hundred,
with a cutoff of about eighteen percent predicting a fluid response; in the
spontaneously breathing patient the collapsibility (caval) index divides the same
difference by the maximum, with a high value (about forty to fifty percent)
suggesting responsiveness. The index mode must match the breathing mode; each
denominator is guarded above zero.
Worked example: a ventilated patient with a maximum IVC of two and a minimum of
one-point-six gives a distensibility of twenty-five percent, above the cited
threshold.

### Pulse-Pressure / Stroke-Volume Variation
Citation: Michard F, Boussat S, Chemla D, Anguel N, Mercat A, Lecarpentier Y,
Richard C, Pinsky MR, Teboul JL. Relation between respiratory changes in arterial
pulse pressure and fluid responsiveness in septic patients with acute circulatory
failure. Am J Respir Crit Care Med. 2000;162(1):134-138.
Rule: the variation is the maximum minus the minimum over a respiratory cycle,
divided by their mean, times one hundred. A pulse-pressure variation above about
thirteen percent (and the commonly-cited stroke-volume variation above about
twelve percent) predicts fluid responsiveness, but only in a patient with a
regular rhythm, controlled ventilation, and an adequate tidal volume; arrhythmia,
spontaneous effort, or low tidal volume invalidate it. The mean denominator is
guarded above zero.
Worked example: a maximum pulse pressure of fifty and a minimum of forty is a
variation of about twenty-two percent, above the threshold.

### Passive Leg Raise Stroke-Volume Response
Citation: Monnet X, Rienzo M, Osman D, Anguel N, Richard C, Pinsky MR, Teboul JL.
Passive leg raising predicts fluid responsiveness in the critically ill. Crit Care
Med. 2006;34(5):1402-1407.
Rule: the percentage change is the peak minus the baseline, divided by the
baseline, times one hundred. Starting semi-recumbent, tilting the trunk down and
the legs up autotransfuses venous blood; a real-time stroke-volume surrogate rise
of at least ten to fifteen percent, measured within about one minute, predicts
fluid responsiveness regardless of rhythm or ventilation mode. The baseline
denominator is guarded above zero.
Worked example: a baseline stroke volume of sixty rising to a peak of seventy-two
is a twenty percent change, above the threshold.

### DECAF Score (acute COPD exacerbation)
Citation: Steer J, Gibson J, Bourke SC. The DECAF Score: predicting hospital
mortality in exacerbations of chronic obstructive pulmonary disease. Thorax.
2012;67(11):970-976.
Rule: five items predict in-hospital mortality in a hospitalised acute COPD
exacerbation -- extended MRC dyspnea grade (eMRCD 1 to 4 scores 0, 5a scores 1,
5b scores 2), eosinopenia below 0.05 1, consolidation 1, acidemia pH below 7.30 1,
and atrial fibrillation 1 -- for a total of 0-6. Derivation-cohort in-hospital
mortality is low at 0-1 (1.4%), intermediate at 2 (8.4%), and high at 3-6 (34.6%).
Worked example: eMRCD 5b with eosinopenia and acidemia sums to four, the high
band.

### BAP-65 Score (acute COPD exacerbation)
Citation: Tabak YP, Sun X, Johannes RS, Gupta V, Shorr AF. Mortality and need for
mechanical ventilation in acute exacerbations of chronic obstructive pulmonary
disease: development and validation of a simple risk score. Arch Intern Med.
2009;169(17):1595-1602.
Rule: the class is built from the count of three acute variables -- BUN at or
above 25, altered mental status, and pulse at or above 109 -- with age above 65
splitting class I from II only when no acute variable is present. Class I is zero
acute variables and age at or below 65; II is zero and age above 65; III is one;
IV is two; V is all three. Derivation-cohort in-hospital mortality rises across
the classes (0.3, 0.9, 2.1, 6.3, and 13.8 percent), and the need for mechanical
ventilation climbs steeply at classes four and five.
Worked example: an elevated BUN and altered mental status in a patient above 65
is class four, about a six percent mortality.

### Bronchiectasis Severity Index (BSI)
Citation: Chalmers JD, Goeminne P, Aliberti S, et al. The bronchiectasis severity
index. An international derivation and validation study. Am J Respir Crit Care Med.
2014;189(5):576-585.
Rule: nine weighted items -- age (below 50 scores 0, 50 to 69 scores 2, 70 to 79
scores 4, at or above 80 scores 6), BMI (below 18.5 scores 2), FEV1 percent
predicted (above 80 scores 0, 50 to 80 scores 1, 30 to 49 scores 2, below 30
scores 3), a hospital admission in the prior two years (5), three or more
exacerbations in the prior year (2), MRC dyspnea (4 scores 2, 5 scores 3),
Pseudomonas colonization (3), other-organism colonization (1), and radiology
(three or more lobes scores 1, cystic scores 1). Bands are low 0-4, intermediate
5-8, and high at or above 9, with mortality and hospitalization risk rising across
the bands.
Worked example: an elderly underweight patient with reduced FEV1, frequent
exacerbations, a recent admission, and Pseudomonas scores well into the high band.

### FACED Score (bronchiectasis)
Citation: Martinez-Garcia MA, de Gracia J, Vendrell Relat M, et al.
Multidimensional approach to non-cystic-fibrosis bronchiectasis: the FACED score.
Eur Respir J. 2014;43(5):1357-1367.
Rule: five items -- FEV1 below 50 percent predicted (2), Age at or above 70 (2),
chronic Pseudomonas Colonization (1), radiological Extension of three or more
lobes (1), and Dyspnea mMRC at or above 3 (1) -- for a total of 0-7. The extension
and dyspnea thresholds follow the source (three or more lobes, mMRC at or above
three), not the looser values some summaries quote. Bands are mild 0-2, moderate
3-4, and severe 5-7, with derivation-cohort five-year mortality of about four,
twenty-five, and sixty-nine percent respectively.
Worked example: reduced FEV1, age at or above seventy, and Pseudomonas sums to
five, the severe band.

### NoSAS Score (OSA screen)
Citation: Marti-Soler H, Hirotsu C, Marques-Vidal P, et al. The NoSAS score for
screening of sleep-disordered breathing: a derivation and validation study. Lancet
Respir Med. 2016;4(9):742-748.
Rule: neck circumference above 40 cm (4), BMI 25 to below 30 (3) or at or above 30
(5, a single mutually-exclusive item), snoring (2), age above 55 (4), and male sex
(2), for a total of 0-17. A score at or above eight indicates a high probability of
clinically significant sleep-disordered breathing and warrants further evaluation;
it complements STOP-BANG.
Worked example: a thick-necked, obese, older man scores fifteen, well above the
threshold.

### AHI / ODI Severity Classifier
Citation: American Academy of Sleep Medicine Task Force. Sleep-related breathing
disorders in adults: recommendations for syndrome definition and measurement
techniques in clinical research. Sleep. 1999;22(5):667-689.
Rule: the apnea-hypopnea index bands obstructive sleep apnea severity as normal
below 5, mild 5 to below 15, moderate 15 to below 30, and severe at or above 30
events per hour. The oxygen desaturation index is shown alongside with the
desaturation criterion stated -- the four-percent rule (no arousal-only events,
still required by CMS) scores fewer events than the recommended three-percent or
arousal rule from the 2012 scoring manual, so the same patient can cross a band by
which rule is applied. A negative or non-finite index is guarded.
Worked example: an index of twenty-two falls in the moderate band.

### Mayo Clinic SPN Malignancy Risk
Citation: Swensen SJ, Silverstein MD, Ilstrup DM, Schleck CD, Edell ES. The
probability of malignancy in solitary pulmonary nodules. Application to small
radiologically indeterminate nodules. Arch Intern Med. 1997;157(8):849-855.
Rule: a logistic model estimates the probability of malignancy in an incidental,
radiologically indeterminate solitary pulmonary nodule from age, current or
former smoking, a prior extrathoracic cancer diagnosed more than five years ago,
nodule diameter, spiculation, and upper-lobe location, as probability equal to
e^x over one plus e^x. A pragmatic pretest framing reads below five percent as
low, five to sixty-five percent as intermediate, and above sixty-five percent as
high probability of malignancy. The logistic exponent is clamped to guard
overflow.
Worked example: a fifty-one-year-old smoker with a twelve-millimeter spiculated
upper-lobe nodule yields about thirty-three percent, the intermediate band.

### Brock / PanCan Nodule Malignancy Risk
Citation: McWilliams A, Tammemagi MC, Mayo JR, et al. Probability of cancer in
pulmonary nodules detected on first screening CT. N Engl J Med.
2013;369(10):910-919.
Rule: a logistic model validated on lung-screening cohorts estimates the
probability of cancer from age (centered), female sex, family history of lung
cancer, emphysema, a power transform of nodule size, nodule type (solid,
part-solid, or non-solid), upper-lobe location, nodule count (centered), and
spiculation, as probability equal to e^x over one plus e^x. The same pretest
framing applies. The size power transform is domain-guarded and the exponent is
clamped.
Worked example: a seventy-year-old woman with a twenty-millimeter part-solid
upper-lobe nodule, family history, emphysema, and spiculation yields about
eighty percent, the high band.

### Fleischner 2017 Nodule Follow-up
Citation: MacMahon H, Naidich DP, Goo JM, et al. Guidelines for management of
incidental pulmonary nodules detected on CT images: from the Fleischner Society
2017. Radiology. 2017;284(1):228-243.
Rule: the recommended CT-surveillance interval for an incidental pulmonary nodule
is keyed on nodule type (solid, part-solid, or pure ground-glass), size, single
versus multiple, and patient risk (which changes only the solid cells). It
applies to incidental nodules in patients at or above thirty-five years and not
to screening, a known primary cancer, or immunosuppression; subsolid
recommendations assume a persistent nodule. Class B; a citation-staleness row
names the in-force edition.
Worked example: a single solid nodule larger than eight millimeters prompts
consideration of CT at three months, PET/CT, or tissue sampling.

### REVEAL Lite 2 (PAH risk)
Citation: Benza RL, Kanwar MK, Raina A, et al. Development and validation of an
abridged version of the REVEAL 2.0 risk score calculator, REVEAL Lite 2, for use
in patients with pulmonary arterial hypertension. Chest. 2021;159(1):337-346.
Rule: starting from a base of six, the score adjusts for renal insufficiency
(eGFR below sixty), WHO functional class (class one subtracts one, class three
adds one, class four adds two), systolic blood pressure below one hundred ten,
heart rate above ninety-six, six-minute walk distance, and a BNP or
NT-proBNP band, for a one-to-fourteen total. Bands are low one to five (about
three percent one-year mortality), intermediate six to seven (about seven
percent), and high at or above eight (about twenty-five percent).
Worked example: eGFR seventy-two, class three, systolic blood pressure one
hundred four, heart rate eighty-eight, walk distance three hundred meters, and a
high natriuretic-peptide band sum to ten, the high band.

### RAPID Score (pleural infection)
Citation: Rahman NM, Kahan BC, Miller RF, Gleeson FV, Nunn AJ, Maskell NA. A
clinical score (RAPID) to identify those at risk for poor outcome at presentation
in patients with pleural infection. Chest. 2014;145(4):848-855.
Rule: five items sum to a zero-to-seven total -- Renal (serum urea below five
scores zero, five to eight scores one, above eight scores two), Age (below fifty
scores zero, fifty to seventy scores one, above seventy scores two), Purulence
(non-purulent fluid scores one), Infection source (hospital-acquired scores one),
and Dietary albumin (below twenty-seven scores one). Bands are low zero to two,
medium three to four, and high five to seven, with derivation-cohort three-month
mortality of about one and a half, seventeen, and forty-seven percent.
Worked example: urea above eight, age seventy-four, non-purulent fluid,
hospital-acquired, and albumin twenty-four sum to seven, the high band.

### ASPECTS (Alberta Stroke Program Early CT Score)
Citation: Barber PA, Demchuk AM, Zhang J, Buchan AM. Validity and reliability of
a quantitative computed tomography score in predicting outcome of hyperacute
stroke before thrombolytic therapy. Lancet. 2000;355(9216):1670-1674.
Rule: ten middle-cerebral-artery-territory regions are graded on the baseline
non-contrast CT -- caudate, lentiform nucleus, internal capsule, insular ribbon,
and the cortical regions M1 through M6 -- and one point is subtracted from ten
for each region with early ischemic change, so ten is a normal scan and zero is
diffuse ischemia across the territory. The source dichotomizes at seven or below,
where lower scores predict worse functional outcome and a higher risk of
symptomatic hemorrhage after thrombolysis.
Worked example: caudate, lentiform, and insula affected subtract three points for
a score of seven, the worse-outcome band.

### ICH Volume (ABC/2)
Citation: Kothari RU, Brott T, Broderick JP, et al. The ABCs of measuring
intracerebral hemorrhage volumes. Stroke. 1996;27(8):1304-1305.
Rule: the hematoma volume in milliliters equals A times B times C divided by two,
where A is the greatest diameter on the slice with the largest hemorrhage, B is
the perpendicular diameter on that same slice, and C is the vertical extent (a
measured craniocaudal diameter, or the number of slices with hemorrhage times the
slice thickness), all measured in centimeters. A volume of thirty milliliters or
more is the threshold the ICH Score counts as a point.
Worked example: five by four by three centimeters gives thirty milliliters,
meeting the thirty-milliliter ICH-score threshold.

### DRAGON Score (post-tPA outcome)
Citation: Strbian D, Meretoja A, Ahlhelm FJ, et al. Predicting outcome of IV
thrombolysis-treated ischemic stroke patients: the DRAGON score. Neurology.
2012;78(6):427-432.
Rule: six items sum to a zero-to-ten total -- a hyperdense cerebral artery sign
or early infarct signs on the baseline CT (neither zero, either plus one, both
plus two), prestroke modified Rankin above one (plus one), age (under sixty-five
scores zero, sixty-five to seventy-nine plus one, eighty or older plus two),
baseline glucose above eight (plus one), onset-to-treatment time above ninety
minutes (plus one), and baseline NIHSS (zero to four scores zero, five to nine
plus one, ten to fifteen plus two, sixteen or more plus three). The derivation
reports good outcome at about ninety-six percent for the lowest scores and zero
at the highest, with miserable outcome dominating at eight and above.
Worked example: both CT signs, prestroke Rankin above one, age eighty-two, high
glucose, late treatment, and a high NIHSS sum to ten, the miserable band.

### HAT Score (hemorrhage after thrombolysis)
Citation: Lou M, Safdar A, Mehdiratta M, et al. The HAT Score: a simple grading
scale for predicting hemorrhage after thrombolysis. Neurology.
2008;71(18):1417-1423.
Rule: three items sum to a zero-to-five total -- baseline NIHSS (under fifteen
scores zero, fifteen to twenty plus one, above twenty plus two), hypodensity on
the initial CT (none zero, up to one third of the MCA territory plus one, more
than one third plus two), and a history of diabetes or admission glucose above
two hundred (plus one). The derivation reports the symptomatic-hemorrhage rate as
two percent at zero points, five at one, ten at two, fifteen at three, and
forty-four above three.
Worked example: a high NIHSS, hypodensity over one third of the MCA territory, and
diabetes sum to five, a symptomatic-hemorrhage risk of about forty-four percent.

### SEDAN Score (post-tPA symptomatic ICH)
Citation: Strbian D, Engelter S, Michel P, et al. Symptomatic intracranial
hemorrhage after stroke thrombolysis: the SEDAN score. Ann Neurol.
2012;71(5):634-641.
Rule: five items sum to a zero-to-six total -- baseline blood glucose (eight or
below scores zero, just above eight to twelve plus one, above twelve plus two,
in millimoles per liter), early infarct signs on the admission CT (plus one), a
hyperdense cerebral artery sign (plus one), age above seventy-five (plus one),
and baseline NIHSS of ten or more (plus one). The derivation reports the
symptomatic-hemorrhage rate rising across the scale from about one and a half
percent at zero to about thirty-three percent at the top stratum of five.
Worked example: very high glucose, early infarct signs, a dense artery sign, age
eighty, and a NIHSS of ten or more sum to six, the highest-risk band.

### THRIVE Score (stroke outcome)
Citation: Flint AC, Cullen SP, Faigeles BS, Rao VA. Predicting long-term outcome
after endovascular stroke treatment: the totaled health risks in vascular events
(THRIVE) score. AJNR Am J Neuroradiol. 2010;31(7):1192-1196.
Rule: the score sums baseline NIHSS (ten or below scores zero, eleven to twenty
plus two, twenty-one or more plus four), age (fifty-nine or below scores zero,
sixty to seventy-nine plus one, eighty or more plus two), and a chronic-disease
count of hypertension, diabetes, and atrial fibrillation (plus one each), for a
zero-to-nine total. The derivation reports good outcome of about sixty-five
percent with low mortality in the low band and about eleven percent with high
mortality in the high band; the middle band is intermediate.
Worked example: a high NIHSS, age eighty-two, and all three chronic diseases sum
to nine, the high-risk band.

### Modified Fisher Scale (SAH vasospasm risk)
Citation: Frontera JA, Claassen J, Schmidt JM, et al. Prediction of symptomatic
vasospasm after subarachnoid hemorrhage: the modified Fisher scale.
Neurosurgery. 2006;59(1):21-27.
Rule: the scale grades the radiographic blood burden after aneurysmal
subarachnoid hemorrhage from the cisternal blood thickness and the presence of
intraventricular hemorrhage. Grade zero is no subarachnoid or intraventricular
blood; grade one is thin subarachnoid blood without intraventricular hemorrhage;
grade two is thin subarachnoid blood with intraventricular hemorrhage; grade
three is thick subarachnoid blood without intraventricular hemorrhage; and grade
four is thick subarachnoid blood with intraventricular hemorrhage. The derivation
reports symptomatic-vasospasm incidence of about a quarter at grade one, about a
third at grades two and three, and about two fifths at grade four. Frontera used
a subjective thin-versus-thick read and applied no measured cutoff.
Worked example: thick subarachnoid blood with intraventricular hemorrhage is
grade four, the highest-vasospasm-risk grade.

### Modified Graeb Score (IVH burden)
Citation: Morgan TC, Dawson J, Spengler D, et al. The Modified Graeb Score: an
enhanced tool for intraventricular hemorrhage measurement and prediction of
functional outcome. Stroke. 2013;44(3):635-641.
Rule: the score sums eight compartments. Each of the four large compartments (the
right and left lateral ventricles, the third ventricle, and the fourth ventricle)
carries a fill grade from none through filled, plus one more point if that
compartment is expanded beyond its normal anatomic limits by clot, for up to five
points each. Each of the four horns (the right and left occipital and the right
and left temporal horns) carries a fill grade from none through completely filled,
plus the same expansion point, for up to three points each. The maximum is
therefore thirty-two. The total correlates with intraventricular-hemorrhage
volume, and each one-point rise raises the odds of poor functional outcome by
about an eighth; the derivation publishes no fixed cutoff.
Worked example: every compartment filled and expanded sums to the maximum.

### BAT Score (hematoma expansion)
Citation: Morotti A, Dowlatshahi D, Boulouis G, et al. Predicting intracerebral
hemorrhage expansion with noncontrast computed tomography: the BAT score.
Stroke. 2018;49(5):1163-1169.
Rule: the score sums three non-contrast CT markers: the blend sign (plus one),
any intrahematoma hypodensity (plus two), and an onset-to-baseline-imaging time
under two and a half hours (plus two), for a zero-to-five total. The derivation
dichotomizes at three or more, which predicts hematoma expansion with a
sensitivity of about half and a specificity of about nine tenths.
Worked example: all three markers present sum to the maximum, above the
expansion-prediction threshold.

### PHASES Score (aneurysm rupture risk)
Citation: Greving JP, Wermer MJH, Brown RD Jr, et al. Development of the PHASES
score for prediction of risk of rupture of intracranial aneurysms: a pooled
analysis of six prospective cohort studies. Lancet Neurol. 2014;13(1):59-66.
Rule: the score sums population (North American or European none, Japanese plus
three, Finnish plus five), hypertension (plus one), age seventy or older (plus
one), aneurysm size (under seven millimeters none, seven to just under ten plus
three, ten to just under twenty plus six, twenty or more plus ten), earlier
subarachnoid hemorrhage from a different aneurysm (plus one), and site (internal
carotid none, middle cerebral plus two, anterior or posterior circulation plus
four). The derivation maps the total to a five-year cumulative rupture risk
rising from under half a percent at the low end to about eighteen percent at the
high end.
Worked example: a Finnish patient with hypertension, age over seventy, a
medium-large aneurysm, an earlier subarachnoid hemorrhage, and a posterior-
circulation site lands in the highest-risk band.

### ELAPSS Score (aneurysm growth risk)
Citation: Backes D, Rinkel GJE, Greving JP, et al. ELAPSS score for prediction of
risk of growth of unruptured intracranial aneurysms. Neurology.
2017;88(17):1600-1606.
Rule: the score sums earlier subarachnoid hemorrhage (no adds a point, yes adds
none, reflecting that a prior treated bleed associates with lower growth risk of
the remaining aneurysm), location (internal carotid or anterior circulation none,
middle cerebral plus three, posterior communicating or posterior circulation plus
five), age (none up to sixty, then a point per five-year band above sixty),
population (North America, China, or Europe none, Japan plus one, Finland plus
seven), size (smallest none, then rising bands), and shape (regular none,
irregular plus four), for a published range up to forty. The derivation maps the
total to a three- and five-year cumulative growth risk rising from a few percent
at the low end to roughly half or more at the high end.
Worked example: no earlier subarachnoid hemorrhage, a posterior site, an older
Finnish patient, a large irregular aneurysm lands at the published ceiling, the
highest-growth-risk band.

### C-STAT / CPSSS (prehospital LVO severity)
Citation: Katz BS, McMullan JT, Sucharew H, Adeoye O, Broderick JP. Design and
validation of a prehospital scale to predict stroke severity: Cincinnati
Prehospital Stroke Severity Scale. Stroke. 2015;46(6):1508-1512.
Rule: a field screen from three items drawn from the stroke scale. Conjugate gaze
deviation adds two points; answering the level-of-consciousness questions or
following the commands incorrectly adds one; and severe arm weakness, where the
arm cannot be held against gravity, adds one. The total runs from none to four. A
total of two or more predicts a large-vessel occlusion.
Worked example: conjugate gaze deviation alone reaches the two-point threshold,
the occlusion-prediction band.

### FAST-ED (field LVO triage)
Citation: Lima FO, Silva GS, Furie KL, et al. Field Assessment Stroke Triage for
Emergency Destination: a simple and accurate prehospital scale to detect large
vessel occlusion strokes. Stroke. 2016;47(8):1997-2002.
Rule: a field large-vessel-occlusion screen from five items drawn from the stroke
scale. Facial palsy scores up to one; arm weakness, speech changes, eye deviation,
and denial or neglect each score up to two. The total runs from none to nine. A
total of four or more predicts a large-vessel occlusion and supports routing to a
comprehensive stroke center.
Worked example: facial palsy with severe arm weakness and severe speech change
sums to five, above the occlusion-prediction threshold.

### Boston Criteria v2.0 (cerebral amyloid angiopathy)
Citation: Charidimou A, Boulouis G, Frosch MP, et al. The Boston criteria version
2.0 for cerebral amyloid angiopathy: a multicentre, retrospective,
MRI-neuropathology diagnostic accuracy study. Lancet Neurol. 2022;21(8):714-725.
Rule: grades diagnostic certainty as definite, probable with supporting pathology,
probable, or possible. The in-vivo categories require an older patient, a
compatible presentation (spontaneous lobar hemorrhage, transient focal episodes,
or cognitive impairment), and the absence of any deep hemorrhagic lesion. Version
two adds the non-hemorrhagic white-matter feature: severe centrum-semiovale
perivascular spaces or a white-matter-hyperintensity multispot pattern. Probable
needs two or more strictly lobar hemorrhagic lesions, or one lobar lesion plus one
white-matter feature; possible needs one lobar lesion or one white-matter feature.
Worked example: two strictly lobar hemorrhagic lesions in an older patient with a
compatible presentation and no deep lesion is probable cerebral amyloid
angiopathy.

### CVT Outcome Risk Score
Citation: Ferro JM, Bacelar-Nicolau H, Rodrigues T, et al. Risk score to predict
the outcome of patients with cerebral vein and dural sinus thrombosis. Cerebrovasc
Dis. 2009;28(1):39-44.
Rule: predicts a poor outcome (dependency or death) after cerebral venous
thrombosis. Malignancy, coma, and deep venous system thrombosis each add two
points; mental-status disturbance, male sex, and intracranial hemorrhage each add
one. The total runs from none to nine. A total of three or more predicts a poor
outcome, a high-sensitivity screen.
Worked example: malignancy with coma sums to four, above the poor-outcome
threshold.

### STESS (Status Epilepticus Severity Score)
Citation: Rossetti AO, Logroscino G, Bromfield EB. A clinical score for prognosis
of status epilepticus in adults. J Neurol. 2008;255(10):1561-1566.
Rule: a four-item prognostic score for status epilepticus. Level of consciousness
scores up to one (stuporous or comatose), worst seizure type up to two
(nonconvulsive status epilepticus in coma), age sixty-five or older adds two, and
no or unknown history of prior seizures adds one. The total runs from none to six.
A total of three or more is unfavorable and is associated with higher in-hospital
mortality and a lower likelihood of return to baseline; the score's strength is a
high negative predictive value, about ninety-seven percent, for survival at the
zero-to-two versus three-or-more split.
Worked example: a comatose patient in nonconvulsive status epilepticus sums to
three, crossing the unfavorable threshold.

### 2HELPS2B (cEEG seizure risk)
Citation: Struck AF, Ustun B, Ruiz AR, et al. Association of an
electroencephalography-based risk score with seizure probability in hospitalized
patients. JAMA Neurol. 2017;74(12):1419-1424.
Rule: a continuous-EEG seizure-risk score from six clinician-read items. Brief
potentially-ictal rhythmic discharges add two; lateralized or bilateral
independent periodic discharges, sporadic epileptiform discharges, any pattern
faster than two hertz, superimposed plus features, and a prior seizure history
each add one. The total runs from none to seven and maps through a published fixed
lookup of calibrated seventy-two-hour seizure probabilities (about five, twelve,
twenty-seven, fifty, seventy-three, and eighty-eight percent for totals zero
through five, and above ninety-five percent for six or seven). The score was
derived by a machine-learning method but ships as a fixed lookup computed once; no
model runs on the page.
Worked example: brief potentially-ictal rhythmic discharges with sporadic
discharges sums to three, about a fifty percent calibrated risk.

### MESS (first-seizure recurrence risk)
Citation: Kim LG, Johnson TL, Marson AG, Chadwick DW; MRC MESS Study Group.
Prediction of risk of seizure recurrence after a single seizure and early
epilepsy. Lancet Neurol. 2006;5(4):317-322.
Rule: groups seizure-recurrence risk after a single or early seizure. The number
of seizures at presentation scores zero (one seizure), one (two to three), or two
(four or more); a neurological disorder and an abnormal EEG each add one. The total
runs from none to four and maps to a low (zero), medium (one), or high (two or
more) risk group. The full per-year treated-versus-deferred recurrence grid is
published only in the source's paywalled table, so the tile reports the risk-group
ranges over a three-to-five-year window.
Worked example: a patient with four or more seizures at presentation scores two,
the high-risk group.

### POUND (migraine likelihood)
Citation: Detsky ME, McDonald DR, Baerlocher MO, Tomlinson GA, McCrory DC, Booth
CM. Does this patient with headache have a migraine or need neuroimaging? JAMA.
2006;296(10):1274-1283.
Rule: counts five bedside headache features, namely a pulsatile or throbbing
quality, an hours-long duration of four to seventy-two hours, a unilateral
location, nausea or vomiting, and a disabling intensity. The count runs from none
to five. The likelihood ratio for definite or possible migraine is about
twenty-four when four or more features are present, about three and a half when
exactly three are present, and about zero point four one when two or fewer are
present.
Worked example: four POUND features strongly favor migraine, a likelihood ratio of
about twenty-four.

### HINTS / HINTS-plus (vestibular exam)
Citation: Kattah JC, Talkad AV, Wang DZ, Hsieh YH, Newman-Toker DE. HINTS to
diagnose stroke in the acute vestibular syndrome: three-step bedside oculomotor
examination more sensitive than early MRI DWI. Stroke. 2009;40(11):3504-3510.
Rule: a three-step bedside oculomotor exam for acute vestibular syndrome. An
abnormal head-impulse test with a corrective saccade, direction-fixed nystagmus,
and an absent skew are reassuring (peripheral). A normal head-impulse test,
direction-changing nystagmus, or a present skew is concerning (central). A benign
peripheral pattern requires all three reassuring together; any one central feature
flags a central, or stroke, cause. HINTS-plus adds new unilateral hearing loss as a
fourth central feature. In the derivation the exam was about one hundred percent
sensitive and ninety-six percent specific for a central cause with an expert
examiner.
Worked example: a normal head-impulse test, even with otherwise benign findings,
flags a central pattern.

### EGRIS (GBS respiratory-failure risk)
Citation: Walgaard C, Lingsma HF, Ruts L, et al. Prediction of respiratory
insufficiency in Guillain-Barre syndrome. Ann Neurol. 2010;67(6):781-787.
Rule: a three-item score for the risk of mechanical ventilation in the first week
of Guillain-Barre syndrome. The interval from onset of weakness to admission scores
zero (more than seven days), one (four to seven days), or two (three days or
fewer); facial and/or bulbar weakness adds one; and the MRC sum-score band at
admission adds zero (sixty to fifty-one) up to four (twenty or below). The total
runs from none to seven. The published mechanical-ventilation rates are about four
percent with a low score, about twenty-four percent with an intermediate score, and
about sixty-five percent with a high score; the paper reports a continuous curve and
no per-score table.
Worked example: a rapid onset with facial weakness and a low MRC band reaches the
high band, about a sixty-five percent ventilation risk.

### mEGOS (GBS walking-outcome score)
Citation: Walgaard C, Lingsma HF, Ruts L, van Doorn PA, Steyerberg EW, Jacobs BC.
Early recognition of poor prognosis in Guillain-Barre syndrome. Neurology.
2011;76(11):968-975.
Rule: predicts the probability of being unable to walk unaided at four and
twenty-six weeks in Guillain-Barre syndrome from age (forty or younger zero, forty-
one to sixty one, over sixty two), preceding diarrhea (adds one), and the MRC sum-
score band, weighted by timing -- at admission zero to six, at day seven zero to
nine. The per-score probability is published only as figure curves, so the tile
reports the total and a relative reading of the published range, where a higher
score means a higher probability of being unable to walk.
Worked example: an older patient with preceding diarrhea and a low MRC band at day
seven reaches the top of the range.

### Brighton GBS Criteria (certainty level)
Citation: Sejvar JJ, Kohl KS, Gidudu J, et al. Guillain-Barre syndrome and Fisher
syndrome: case definitions and guidelines for collection, analysis, and
presentation of immunization safety data. Vaccine. 2011;29(3):599-612.
Rule: grades diagnostic certainty from the features met -- three core clinical
features (bilateral and flaccid limb weakness, decreased or absent deep tendon
reflexes in weak limbs, and a monophasic course with onset to nadir twelve hours to
twenty-eight days), the absence of an identified alternative diagnosis, and two
paraclinical supports (CSF albuminocytologic dissociation and nerve-conduction
studies consistent with a GBS subtype). The highest level needs the core plus both
CSF dissociation and consistent nerve-conduction studies; the next needs the core
plus either; the third needs only the core with the paraclinical studies not done;
the lowest means a reported case with insufficient evidence.
Worked example: the core features with CSF dissociation and consistent nerve-
conduction studies meet the highest certainty level.

### MGFA class + MG-ADL (myasthenia severity)
Citation: Jaretzki A 3rd, Barohn RJ, Ernstoff RM, et al. Myasthenia gravis:
recommendations for clinical research standards. Neurology. 2000;55(1):16-23; with
the MG-ADL of Wolfe GI, Herbelin L, Statland JM, et al. Neurology. 1999;52:1487-1489.
Rule: the MGFA clinical classification maps the predominant weakness pattern and
severity to Class I (ocular only), II (mild generalized), III (moderate), IV
(severe), or V (intubation), with an "a" (limb or axial predominant) or "b"
(oropharyngeal or respiratory predominant) subtype on Classes II through IV. The
MG-ADL is an eight-item scale -- talking, chewing, swallowing, breathing, brushing
teeth or combing hair, rising from a chair, double vision, and eyelid droop -- each
scored from normal to most severe, where a higher total means more severe symptoms.
Worked example: a severe generalized, oropharyngeal-predominant pattern with
bulbar-weighted MG-ADL items reaches Class IV-b.

### Hachinski Ischemic Score (dementia type)
Citation: Hachinski VC, Iliff LD, Zilhka E, et al. Cerebral blood flow in dementia.
Arch Neurol. 1975;32(9):632-637.
Rule: a thirteen-item weighted score distinguishing a vascular from a primary
degenerative dementia. Five features score two points each -- abrupt onset,
fluctuating course, a history of strokes, focal neurological symptoms, and focal
neurological signs -- and eight score one point each -- stepwise deterioration,
nocturnal confusion, relative preservation of personality, depression, somatic
complaints, emotional incontinence, hypertension, and associated atherosclerosis --
for a maximum of eighteen. A total of four or below favors a primary degenerative
(Alzheimer-type) dementia, five to six is indeterminate, and seven or above favors a
vascular (multi-infarct) cause.
Worked example: abrupt onset with a fluctuating course, a history of strokes, and
focal symptoms reaches the vascular band.

### Modified Ashworth Scale (spasticity grade)
Citation: Bohannon RW, Smith MB. Interrater reliability of a modified Ashworth scale
of muscle spasticity. Phys Ther. 1987;67(2):206-207.
Rule: a bedside ordinal grade of muscle spasticity, scored per muscle group on
resistance to passive movement, with six levels -- none, slight (a catch and
release), the intermediate level (a catch then minimal resistance through less than
half the range), more marked through most of the range, considerable with difficult
passive movement, and rigid. The intermediate level is the modification of the
original five-point scale and is a distinct ordinal step, not an average.
Worked example: the intermediate level reads as a catch followed by minimal
resistance through less than half of the range.

### Bickerstaff Brainstem Encephalitis Criteria
Citation: Odaka M, Yuki N, Yamada M, et al. Bickerstaff's brainstem encephalitis:
clinical features and a subgroup associated with Guillain-Barre syndrome. Brain.
2003;126(Pt 10):2279-2290.
Rule: a diagnostic checklist for brainstem encephalitis. The required core is
progressive, relatively symmetric external ophthalmoplegia and ataxia developing
within about four weeks, plus altered consciousness or hyperreflexia, where one of
the two central features suffices. A positive anti-GQ1b antibody, a brainstem lesion
on imaging, and an albuminocytologic dissociation in the spinal fluid support the
diagnosis but are never required, since seronegative cases are recognized. It sits on
a continuous spectrum with Miller Fisher syndrome and Guillain-Barre syndrome.
Worked example: external ophthalmoplegia and ataxia with altered consciousness meet
the required core.

### AIMS (tardive dyskinesia severity)
Citation: Guy W. ECDEU Assessment Manual for Psychopharmacology: Abnormal Involuntary
Movement Scale (AIMS). Rockville, MD: US DHEW, NIMH; 1976. Provenance: a
US-government NIMH instrument in the public domain, free to reproduce.
Rule: a movement-severity scale for tardive dyskinesia. Seven movement items -- four
facial or oral, two extremity, and one trunk -- are each rated from none to severe and
summed, with a separate global-severity judgment. Moderate movements in two or more
body areas, or severe in any one area, are a commonly cited threshold for probable
tardive dyskinesia.
Worked example: moderate movements of the face and jaw meet the probable tardive
dyskinesia threshold.

### Bush-Francis Catatonia Rating Scale
Citation: Bush G, Fink M, Petrides G, Dowling F, Francis A. Catatonia. I. Rating scale
and standardized examination. Acta Psychiatr Scand. 1996;93(2):129-136.
Rule: the first fourteen of the twenty-three items form the screening instrument,
scored present or absent; two or more positive screen items suggest catatonia. The
full twenty-three-item severity scale rates each item from absent to severe, where six
items are scored absent or present only.
Worked example: immobility with mutism and staring gives a positive screen, suggesting
catatonia.

### Barnes Akathisia Rating Scale
Citation: Barnes TRE. A rating scale for drug-induced akathisia. Br J Psychiatry.
1989;154:672-676.
Rule: rates drug-induced akathisia from objective restlessness, subjective awareness,
and subjective distress, plus a global clinical assessment that runs from absent
through questionable, mild, moderate, and marked to severe.
Worked example: moderate objective and subjective restlessness with a global rating of
moderate akathisia.

### SCOFF (eating-disorder screen)
Citation: Morgan JF, Reid F, Lacey JH. The SCOFF questionnaire: assessment of a new
screening tool for eating disorders.
BMJ. 1999;319(7223):1467-1468. Provenance: reproduced in full in the open source
paper and free to use.
Rule: a five-item yes or no screen -- Sick, Control, One stone, Fat, and Food. Two or
more positive answers flag a likely eating disorder warranting further assessment.
Worked example: positive Sick and Control answers reach the two-positive threshold.

### CES-D (depression scale)
Citation: Radloff LS. The CES-D Scale: a self-report depression scale for research in
the general population. Appl Psychol Meas. 1977;1(3):385-401. Provenance: developed at
NIMH and in the public domain, free to reproduce.
Rule: a twenty-item self-report scale rated over the past week, where the four
positively-worded items are reverse-scored per the published key. A total of sixteen
or more commonly flags clinically significant depressive symptoms warranting further
evaluation.
Worked example: depressed mood, feeling life is a failure, loneliness, and sadness
together cross the sixteen-point threshold.

### ALBI grade (albumin-bilirubin liver function)
Citation: Johnson PJ, Berhane S, Kagebayashi C, et al. Assessment of liver function in
patients with hepatocellular carcinoma: a new evidence-based approach -- the ALBI
grade. J Clin Oncol. 2015;33(6):550-558.
Rule: an objective liver-function grade from albumin and bilirubin alone, with no
subjective ascites or encephalopathy terms. The score is the base-ten logarithm of
bilirubin in micromoles per liter times zero point six six, plus albumin in grams per
liter times minus zero point zero eight five. Grade one is the best liver function,
grade two intermediate, and grade three the worst.
Worked example: an albumin of three point five and a bilirubin of one give a grade-two
score.

### MELD-XI (MELD excluding INR)
Citation: Heuman DM, Mihas AA, Habib A, et al. MELD-XI: a rational approach to patients
with end-stage liver disease requiring anticoagulation. Liver Transpl. 2007;13(1):30-37.
Rule: the INR-independent MELD for the anticoagulated patient whose INR is
uninterpretable. The score is five point one one times the natural log of bilirubin
plus eleven point seven six times the natural log of creatinine plus nine point four
four, both labs in milligrams per deciliter, each floored at one before the log so the
score cannot go negative.
Worked example: a bilirubin of two and a creatinine of one point five give a score in
the high teens.

### Forns Index (HCV fibrosis)
Citation: Forns X, Ampurdanes S, Llovet JM, et al. Identification of chronic hepatitis
C patients without hepatic fibrosis by a simple predictive model. Hepatology.
2002;36(4 Pt 1):986-992.
Rule: a four-variable serum estimate from age, gamma-glutamyl transferase, platelet
count, and total cholesterol in milligrams per deciliter. A value below four point two
rules out significant fibrosis with a high negative predictive value, above six point
nine rules it in, and between is indeterminate. The cholesterol coefficient is
calibrated to milligrams per deciliter, not millimoles per liter.
Worked example: a young patient with a high platelet count and normal enzymes scores
below the rule-out threshold.

### BARD Score (NAFLD advanced fibrosis)
Citation: Harrison SA, Oliver D, Arnold HL, et al. Development and validation of a
simple NAFLD clinical scoring system for identifying patients without advanced disease.
Gut. 2008;57(10):1441-1447.
Rule: three weighted items -- a body mass index of twenty-eight or higher adds one, an
AST-to-ALT ratio of zero point eight or higher adds two, and diabetes adds one. A total
of two to four leaves advanced fibrosis in play, while zero to one robustly rules it out.
Worked example: an obese diabetic patient with a high enzyme ratio reaches the top of
the range.

### Fatty Liver Index (steatosis probability)
Citation: Bedogni G, Bellentani S, Miglioli L, et al. The Fatty Liver Index: a simple
and accurate predictor of hepatic steatosis in the general population. BMC
Gastroenterol. 2006;6:33.
Rule: a logistic steatosis-probability index from triglycerides, body mass index,
gamma-glutamyl transferase, and waist circumference. A value below thirty rules
steatosis out, sixty or above rules it in, and between is indeterminate.
Worked example: a metabolic-syndrome profile reaches the rule-in band.

### Lok Index (cirrhosis probability)
Citation: Lok AS, Ghany MG, Goodman ZD, et al. Predicting cirrhosis in patients with
hepatitis C based on standard laboratory tests: results of the HALT-C cohort.
Hepatology. 2005;42(2):282-292.
Rule: a logistic probability of cirrhosis from the platelet count, the AST-to-ALT
ratio, and the INR. A probability below zero point two rules cirrhosis out, above zero
point five rules it in, and between is indeterminate.
Worked example: a low platelet count with a raised enzyme ratio and INR crosses the
rule-in threshold.

### PELD (pediatric end-stage liver disease)
Citation: McDiarmid SV, Anand R, Lindblad AS; SPLIT Research Group. Development of a
pediatric end-stage liver disease score to predict outcomes in children awaiting liver
transplantation. Transplantation. 2002;74(2):173-181.
Rule: the under-twelve transplant-listing score, since the adult model does not apply
to small children. It sums four point eight times the natural log of bilirubin, plus
eighteen point five seven times the natural log of the INR, minus six point eight seven
times the natural log of albumin, plus a bonus for age under one year and a bonus for
growth failure, with albumin and bilirubin in conventional units and each lab floored
at one before the log. A higher value means greater severity and waitlist priority.
Worked example: a low albumin with a raised bilirubin and INR in an infant gives a
score in the low teens.

### CLIF-C ACLF (acute-on-chronic liver failure)
Citation: Jalan R, Saliba F, Pavesi M, et al. Development and validation of a
prognostic score to predict mortality in patients with acute-on-chronic liver failure.
J Hepatol. 2014;61(5):1038-1047.
Rule: a mortality model for acute-on-chronic liver failure built on the organ-failure
sub-score, which rates six organ systems from one to three. The score is ten times the
quantity zero point three three times the organ-failure sub-score plus zero point zero
four times age plus zero point six three times the natural log of the white-cell count
minus two, reported on a zero-to-one-hundred scale. The circulation organ scores its
maximum for vasopressor use. A higher value means higher short-term mortality.
Worked example: multi-organ failure in an older patient gives a score above the
midpoint of the range.

### Glasgow Alcoholic Hepatitis Score
Citation: Forrest EH, Evans CD, Stewart S, et al. Analysis of factors predictive of
mortality in alcoholic hepatitis and derivation and validation of the Glasgow alcoholic
hepatitis score. Gut. 2005;54(8):1174-1179.
Rule: five banded items -- age, white-cell count, blood urea in millimoles per liter,
the INR, and bilirubin in micromoles per liter. The blood urea and bilirubin use SI
units, not the conventional equivalents. A total of nine or more marks higher
twenty-eight and eighty-four-day mortality and the group in which corticosteroids
showed benefit.
Worked example: an older patient with a raised white count, urea, INR, and bilirubin
reaches the top of the range.

### West Haven HE grade (hepatic encephalopathy)
Citation: Conn HO, Leevy CM, Vlahcevic ZR, et al. Comparison of lactulose and neomycin
in the treatment of chronic portal-systemic encephalopathy. Gastroenterology.
1977;72(4 Pt 1):573-583.
Rule: the canonical hepatic-encephalopathy grade. Grade zero is minimal with no
detectable change, grade one a trivial lack of awareness with impaired addition, grade
two lethargy with disorientation to time and asterixis, grade three somnolence to
semi-stupor with gross disorientation, and grade four coma. Grades two and above are
overt encephalopathy.
Worked example: lethargy with disorientation to time and asterixis is a grade-two,
overt encephalopathy.

### Hepatic Steatosis Index (NAFLD screen)
Citation: Lee JH, Kim D, Kim HJ, et al. Hepatic steatosis index: a simple screening
tool reflecting nonalcoholic fatty liver disease. Dig Liver Dis. 2010;42(7):503-508.
Rule: a screen equal to eight times the ALT-to-AST ratio plus the body mass index,
adding two for female sex and two for diabetes. A value below thirty rules nonalcoholic
fatty liver disease out, above thirty-six rules it in, and between is indeterminate.
Worked example: a raised enzyme ratio with obesity, female sex, and diabetes reaches
the rule-in band.

### CDAI (Crohn's Disease Activity Index)
Citation: Best WR, Becktel JM, Singleton JW, Kern F Jr. Development of a Crohn's
disease activity index. National Cooperative Crohn's Disease Study. Gastroenterology.
1976;70(3):439-444.
Rule: the trial-standard eight-item weighted activity score. It sums liquid stools
times two, abdominal pain times five, general well-being times seven, complications
times twenty, antidiarrheal use times thirty, abdominal mass times ten, hematocrit
deficit times six, and percent below standard body weight. A total below one hundred
fifty is remission, up to two hundred twenty mild, up to four hundred fifty moderate,
and above that severe.
Worked example: a week of frequent stools with pain and a low hematocrit reaches the
moderate band.

### UCEIS (UC endoscopic severity)
Citation: Travis SP, Schnell D, Krzeski P, et al. Developing an instrument to assess
the endoscopic severity of ulcerative colitis: the UCEIS. Gut. 2012;61(4):535-542.
Rule: three endoscopic descriptors at the worst-affected area -- vascular pattern,
bleeding, and erosions or ulcers -- summed on a zero-to-eight scale. The modern
zero-based scale is used; the original was one-based. Remission is near zero to one
and higher totals are progressively more severe.
Worked example: obliterated vessels with luminal bleeding and a superficial ulcer
reach the severe band.

### SES-CD (Crohn's endoscopic score)
Citation: Daperno M, D'Haens G, Van Assche G, et al. Development and validation of a
new, simplified endoscopic activity score for Crohn's disease: the SES-CD.
Gastrointest Endosc. 2004;60(4):505-512.
Rule: four variables -- ulcer size, ulcerated surface, affected surface, and stenosis
-- each scored across five ileocolonic segments. The stenosis sub-total is capped, so
the maximum is fifty-six. Remission is a low total and higher totals indicate more
severe endoscopic disease.
Worked example: ileal and right-colon ulceration with a passable stenosis reaches the
moderate band.

### HAPS (harmless acute pancreatitis)
Citation: Lankisch PG, Weber-Dany B, Hebel K, et al. The harmless acute pancreatitis
score. Clin Gastroenterol Hepatol. 2009;7(6):702-705.
Rule: a three-criterion admission gate -- absence of rebound tenderness or guarding, a
normal hematocrit, and a normal serum creatinine. When all three are normal the course
is predicted to be harmless; any abnormal value does not rule severity in.
Worked example: a soft abdomen with a normal hematocrit and creatinine predicts a
harmless course.

### CT Severity Index (Balthazar, pancreatitis)
Citation: Balthazar EJ, Robinson DL, Megibow AJ, Ranson JH. Acute pancreatitis: value
of CT in establishing prognosis. Radiology. 1990;174(2):331-336.
Rule: the contrast-CT grade from A to E plus the percent of pancreatic necrosis,
summed on a zero-to-ten scale. A low total is mild, the middle band moderate, and a
high total severe.
Worked example: multiple fluid collections with extensive necrosis reach the severe
band.

### Modified Marshall organ-dysfunction score
Citation: Banks PA, Bollen TL, Dervenis C, et al; Acute Pancreatitis Classification
Working Group. Classification of acute pancreatitis 2012: revision of the Atlanta
classification by international consensus. Gut. 2013;62(1):102-111.
Rule: scores three organ systems -- respiratory by the oxygen ratio, renal by
creatinine, and cardiovascular by blood pressure with fluid responsiveness and pH.
Organ failure is a score of two or more in any system, the Revised Atlanta threshold
that separates moderately severe from severe acute pancreatitis.
Worked example: a low oxygen ratio with a raised creatinine meets the organ-failure
threshold.

### KFRE (kidney failure risk equation)
Citation: Tangri N, Stevens LA, Griffith J, et al. A predictive model for progression
of chronic kidney disease to kidney failure. JAMA. 2011;305(15):1553-1559.
Rule: the probability of treated kidney failure at two and five years in chronic kidney
disease stages three to five. The risk equals one minus the baseline survival raised to
the exponential of the centered terms. The four-variable model uses age, sex, the
estimated GFR, and the urine albumin-to-creatinine ratio; the eight-variable model adds
calcium, phosphate, bicarbonate, and albumin. The ratio is entered in milligrams per
gram and converted to milligrams per millimole.
Worked example: an older man with a low GFR and heavy albuminuria reaches a five-year
risk in the low double digits.

### RIFLE criteria (AKI staging)
Citation: Bellomo R, Ronco C, Kellum JA, et al; Acute Dialysis Quality Initiative.
Acute renal failure definition and outcome measures. Crit Care. 2004;8(4):R204-R212.
Rule: the class is the worst of the creatinine-or-GFR criterion and the urine-output
criterion. Risk is a creatinine rise of one and a half times or a GFR fall over a
quarter, Injury twice or over half, and Failure three times or over three quarters, or
a creatinine at or above four with an acute rise. The urine-output limbs use
progressively lower thresholds over longer windows.
Worked example: a doubling of creatinine reaches the Injury class.

### AKIN criteria (AKI staging)
Citation: Mehta RL, Kellum JA, Shah SV, et al; Acute Kidney Injury Network. Report of
an initiative to improve outcomes in acute kidney injury. Crit Care. 2007;11(2):R31.
Rule: within a forty-eight-hour window the stage is the worse of the creatinine and
urine-output criteria. Stage one is a small absolute rise or a one-and-a-half-fold
increase, stage two a two-fold increase, and stage three a three-fold increase or a
high absolute creatinine with an acute rise or the start of renal replacement therapy,
which forces stage three.
Worked example: a tripling of creatinine reaches stage three.

### Ultrafiltration rate (dialysis)
Citation: Flythe JE, Kimmel SE, Brunelli SM. Rapid fluid removal during dialysis is
associated with cardiovascular morbidity and mortality. Kidney Int. 2011;79(2):250-257.
Rule: the fluid-removal rate during hemodialysis equals the ultrafiltration volume
divided by the product of post-dialysis weight and session hours, in milliliters per
kilogram per hour. A rate above thirteen is associated with higher cardiovascular
morbidity and mortality.
Worked example: removing three and a half liters over three hours at seventy kilograms
exceeds the threshold.

### Fractional excretion of phosphate (FEPO4)
Citation: Walton RJ, Bijvoet OL. Nomogram for derivation of renal threshold phosphate
concentration. Lancet. 1975;2(7929):309-310.
Rule: the fractional excretion of phosphate equals urine phosphate times plasma
creatinine, divided by plasma phosphate times urine creatinine, times one hundred. In
the workup of hypophosphatemia a value above about five percent suggests renal
phosphate wasting, while a value at or below that points to an extra-renal or
redistributive cause.
Worked example: a urine phosphate of thirty against a plasma phosphate of one and a
half, at matched creatinines, gives a fraction in the renal-wasting range.

### Fractional excretion of magnesium (FEMg)
Citation: Elisaf M, Panteli K, Theodorou J, Siamopoulos KC. Fractional excretion of
magnesium in normal subjects and in patients with hypomagnesemia. Miner Electrolyte
Metab. 1998;24(2-3):315-318.
Rule: the fractional excretion of magnesium equals urine magnesium times plasma
creatinine, divided by the product of zero point seven, plasma magnesium, and urine
creatinine, times one hundred. The zero-point-seven factor corrects for the
protein-bound, non-filterable fraction of plasma magnesium. In hypomagnesemia a value
above roughly two to four percent suggests renal magnesium wasting.
Worked example: a urine magnesium of two against a plasma magnesium of one point two,
at matched creatinines, exceeds the wasting threshold.

### Standard Kt/V (weekly dialysis dose)
Citation: Leypoldt JK, Jaber BL, Zimmerman DL. Predicting treatment dose for novel
therapies using urea standard Kt/V. Hemodial Int. 2003;7(2):138-143.
Rule: the equilibrated single-session dose is converted to a weekly, frequency-
normalized standard Kt/V using the fixed-volume form, so thrice-weekly, short-daily,
and nocturnal schedules can be compared on one axis. The weekly adequacy target is at
least two point one.
Worked example: a single-pool Kt/V of one point four over four hours, three times a
week, gives a weekly standard Kt/V just above the target.

### nPCR / nPNA (dialysis protein catabolic rate)
Citation: Depner TA, Daugirdas JT. Equations for normalized protein catabolic rate
based on two-point modeling of hemodialysis urea kinetics. J Am Soc Nephrol.
1996;7(5):780-785.
Rule: the normalized protein catabolic rate is derived from the interdialytic rise in
blood urea nitrogen between the post-dialysis value of one session and the pre-dialysis
value of the next, divided by the interval, in grams per kilogram per day. The
nutrition target is roughly one to one point two; below about zero point eight suggests
inadequate protein intake.
Worked example: a rise from eighteen to seventy over forty-four hours gives a rate near
one and a quarter.

### Electrolyte-free water clearance (EFWC)
Citation: Rose BD. New approach to disturbances in the plasma sodium concentration. Am
J Med. 1986;81(6):1033-1040.
Rule: the electrolyte-free water clearance equals urine volume times one minus the
quotient of urine sodium plus potassium over plasma sodium. A positive value is net
free-water excretion that raises plasma sodium; a negative value is net free-water
retention that lowers it and drives hyponatremia. The sign flips as the urine sodium
plus potassium sum crosses plasma sodium.
Worked example: a dilute urine yields a positive clearance, while a hypertonic urine
yields a negative one.

### Stewart SID / strong ion gap (SIG)
Citation: Stewart PA. Modern quantitative acid-base chemistry. Can J Physiol Pharmacol.
1983;61(12):1444-1461; albumin and phosphate charge per Figge J, Mydosh T, Fencl V. J
Lab Clin Med. 1992;120(5):713-719.
Rule: the apparent strong ion difference equals sodium plus potassium plus calcium plus
magnesium, less chloride and lactate, all in milliequivalents per liter; the effective
strong ion difference equals bicarbonate plus the albumin charge plus the phosphate
charge, with the Figge weak-acid charges evaluated at the physiologic pH of seven point
four. The strong ion gap is the apparent less the effective difference; a value above
about two suggests unmeasured strong anions.
Worked example: a wide gap in a high-anion-gap acidosis points to ketoacids, sulfate,
citrate, or salicylate.

### Base excess (Van Slyke, Hgb-corrected)
Citation: Siggaard-Andersen O. The Van Slyke equation. Scand J Clin Lab Invest Suppl.
1977;146:15-20.
Rule: the hemoglobin-corrected base excess is read off the blood gas from the
bicarbonate and the pH deviation from seven point four, scaled by the buffering term in
hemoglobin. A negative value is a base deficit consistent with metabolic acidosis; a
positive value is a base excess consistent with metabolic alkalosis. The sign flips at
zero.
Worked example: a low pH against a low bicarbonate gives a negative base deficit.

### Expected HCO3 - respiratory acidosis
Citation: Brackett NC Jr, Cohen JJ, Schwartz WB. Carbon dioxide titration curve of
normal man. N Engl J Med. 1965;272:6-12; chronic adaptation per Schwartz WB, et al.
Rule: the kidney raises bicarbonate by about one milliequivalent per liter for every ten
millimeters of mercury that the arterial carbon dioxide tension rises above forty
acutely, and by about four chronically. A measured bicarbonate below the expected band
suggests an added metabolic acidosis, and above it an added metabolic alkalosis. The
acute-versus-chronic choice is the clinician's.
Worked example: an acute tension of sixty predicts a bicarbonate near twenty-six.

### Expected HCO3 - respiratory alkalosis
Citation: Gennari FJ, Goldstein MB, Schwartz WB. The nature of the renal adaptation to
chronic hypocapnia. J Clin Invest. 1972;51(7):1722-1730.
Rule: the kidney lowers bicarbonate by about two milliequivalents per liter for every
ten millimeters of mercury that the arterial carbon dioxide tension falls below forty
acutely, and by about four chronically, and not below a physiologic floor. A measured
bicarbonate below the expected band suggests an added metabolic acidosis, and above it
an added metabolic alkalosis.
Worked example: an acute tension of twenty-five predicts a bicarbonate near twenty-one.

### Expected PaCO2 - metabolic alkalosis
Citation: Narins RG, Emmett M. Simple and mixed acid-base disorders: a practical
approach. Medicine (Baltimore). 1980;59(3):161-187.
Rule: respiratory compensation raises the arterial carbon dioxide tension by about
seven tenths of a millimeter of mercury for every milliequivalent per liter that
bicarbonate rises above twenty-four, plus forty, within a small band. A measured tension
above the expected band suggests an added respiratory acidosis, and below it an added
respiratory alkalosis. This is the metabolic-alkalosis complement of the Winter's rule.
Worked example: a bicarbonate of forty predicts a tension near fifty-one.

### Urine osmolal gap (urinary NH4+ estimate)
Citation: Halperin ML, Goldstein MB, Stinebaugh BJ, Jungas RL. The urine osmolal gap: a
clue to estimate urine ammonium in hybrid types of metabolic acidosis. Clin Invest Med.
1988;11(3):198-202.
Rule: the calculated urine osmolality equals twice the sum of urine sodium and potassium
plus the urine urea nitrogen over two point eight plus the urine glucose over eighteen;
the gap is the measured less the calculated osmolality, and half the gap approximates
urinary ammonium. In a normal-anion-gap acidosis a wide gap points to an extrarenal
cause such as diarrhea, while a narrow gap points to renal tubular acidosis.
Worked example: a wide gap reflects an intact ammonium response to the acid load.

### Prostate volume (ellipsoid)
Citation: Terris MK, Stamey TA. Determination of prostate volume by transrectal
ultrasound. J Urol. 1991;145(5):984-987.
Rule: the prolate-ellipsoid volume equals the anteroposterior diameter times the
transverse diameter times the craniocaudal diameter times zero point five two, with
all three dimensions in centimeters and the volume in cubic centimeters. The
coefficient is pi over six rounded to the dominant clinical convention; a volume above
about thirty is the conventional enlarged or benign-prostatic-hyperplasia range.
Worked example: a gland measuring four by five by four centimeters is about forty-two
cubic centimeters, an enlarged gland.

### PSA density
Citation: Benson MC, Whang IS, Pantuck A, et al. Prostate specific antigen density: a
means of distinguishing benign prostatic hypertrophy and prostate cancer. J Urol.
1992;147(3 Pt 2):815-816.
Rule: the prostate-specific-antigen density equals the serum antigen in nanograms per
milliliter divided by the prostate volume in cubic centimeters. A density above zero
point one five raises suspicion for clinically significant cancer and helps refine
biopsy decisions when the antigen sits in the gray zone.
Worked example: an antigen of six against a volume of thirty gives a density of zero
point two, above the threshold.

### PSA velocity
Citation: Carter HB, Pearson JD, Metter EJ, et al. Longitudinal evaluation of
prostate-specific antigen levels in men with and without prostate disease. JAMA.
1992;267(16):2215-2220.
Rule: the two-point velocity equals the later antigen less the earlier antigen divided
by the interval in years. A velocity above zero point seven five nanograms per
milliliter per year raises suspicion for cancer; a lower threshold near zero point
four applies when the baseline antigen is below four. The validated method averages
consecutive yearly rates over at least three measurements spanning at least eighteen
months.
Worked example: a rise from three to four and a half over a year is one and a half per
year, above the threshold.

### PSA doubling time
Citation: Pound CR, Partin AW, Eisenberger MA, et al. Natural history of progression
after PSA elevation following radical prostatectomy. JAMA. 1999;281(17):1591-1597.
Rule: the doubling time equals the natural logarithm of two times the interval in
months, divided by the difference between the natural logarithm of the later antigen
and the natural logarithm of the earlier antigen. It requires a rising antigen; a
stable or falling antigen has no doubling time. Under about twelve months signals more
aggressive disease, and under about three months very aggressive disease.
Worked example: a doubling from four to eight over six months is a doubling time of six
months.

### D'Amico prostate-cancer risk classification
Citation: D'Amico AV, Whittington R, Malkowicz SB, et al. Biochemical outcome after
radical prostatectomy, external beam radiation therapy, or interstitial radiation
therapy for clinically localized prostate cancer. JAMA. 1998;280(11):969-974.
Rule: the worst single feature governs the group. Low risk is clinical stage T2a or
below and antigen ten or below and Gleason six or below; intermediate risk is stage
T2b or antigen above ten and up to twenty or Gleason seven; high risk is stage T2c or
antigen above twenty or Gleason eight or above. The antigen boundary is strict, so an
antigen of exactly ten is low risk.
Worked example: a man with antigen six, Gleason seven, stage T1c is intermediate risk,
driven by the Gleason score.

### Gleason Grade Group (ISUP)
Citation: Epstein JI, Egevad L, Amin MB, et al. The 2014 ISUP consensus conference on
Gleason grading of prostatic carcinoma. Am J Surg Pathol. 2016;40(2):244-252.
Rule: the primary and secondary Gleason patterns map to a prognostic Grade Group. Group
one is Gleason six or below; group two is three plus four equals seven; group three is
four plus three equals seven; group four is Gleason eight; group five is Gleason nine to
ten. The primary pattern governs the split between group two and group three.
Worked example: a Gleason three plus four equals seven is Grade Group two, a favorable
intermediate grade.

### Pediatric Weight Estimate (APLS)
Citation: Advanced Paediatric Life Support: The Practical Approach, 6th ed.
(Advanced Life Support Group). Wiley-Blackwell, 2016.
Rule: estimate body weight from age when no scale is available. Zero to twelve
months uses months divided by two plus four kilograms; one to five years uses two
times years plus eight; six to twelve years uses three times years plus seven.
Worked example: a five-year-old is two times five plus eight, eighteen kilograms
(about 39.7 lb).

### Pediatric Vital Signs Reference (PALS)
Citation: American Heart Association. Pediatric Advanced Life Support (PALS)
Provider Manual, 2020.
Rule: age-banded normal heart rate, respiratory rate, and systolic-BP ranges, with
the PALS hypotensive systolic-BP definition computed for the entered age — below
sixty in the neonate, below seventy in the infant, below seventy plus two times age
in years from one to ten years, and below ninety at ten years and older.
Worked example: a five-year-old has a PALS hypotension threshold of seventy plus two
times five, a systolic BP below eighty mmHg.

### Drug Concentration to Volume (draw-up)
Citation: First-principles dosing arithmetic over the drug-concentration label.
Rule: volume to draw in milliliters equals the ordered dose in milligrams divided by
the stock concentration in milligrams per milliliter; the ordered dose may be derived
from weight times a per-kilogram dose.
Worked example: twenty-five milligrams from a fifty milligrams per milliliter vial is
a draw of half a milliliter.

### IWPC Pharmacogenetic Warfarin Dose
Citation: International Warfarin Pharmacogenetics Consortium; Klein TE, et al.
Estimation of the warfarin dose with clinical and pharmacogenetic data. N Engl J
Med. 2009.
Rule: the published linear model regresses the square root of the weekly maintenance
dose on age in decades, height, weight, race, enzyme-inducer and amiodarone use, and
the entered VKORC1 and CYP2C9 genotypes; the square root is then squared to give the
weekly dose, divided by seven for the daily dose.
Worked example: a sixty-five-year-old, one hundred seventy centimetres and seventy
kilograms, VKORC1 G/G and CYP2C9 wild-type, white, on no inducer and no amiodarone,
has a square root of about six and four-tenths and a predicted dose of about
forty-one milligrams per week, near six milligrams per day.

### Warfarin 5 mg Initiation Nomogram (Crowther)
Citation: Crowther MA, et al. A randomized trial comparing 5-mg and 10-mg warfarin
loading doses. Arch Intern Med. 1999.
Rule: day one and day two are a fixed five milligrams; from day three the dose is set
by that morning's INR band. The day-five low band starts below an INR of two, unlike
the below-one-and-a-half low band on days three and four.
Worked example: on day three an INR in the one-and-a-half to one-point-nine band gives
five milligrams; an INR above three on any day holds the dose at zero and prompts a
recheck.

### Gage Pharmacogenomic Warfarin Dose
Citation: Gage BF, et al. Use of pharmacogenetic and clinical factors to predict the
therapeutic dose of warfarin. Clin Pharmacol Ther. 2008.
Rule: the daily dose is the exponential of a weighted sum of body-surface area (DuBois),
age, target INR, smoking, amiodarone use, African-American race, the venous-thrombosis
indication, and the entered CYP2C9 and VKORC1 genotypes; multiply by seven for the
weekly dose. The original model carries no CYP4F2 term.
Worked example: a sixty-year-old, one hundred seventy-five centimetres and seventy
kilograms, VKORC1 G/G and CYP2C9 wild-type, target INR of two-and-a-half, non-smoker,
no amiodarone, atrial fibrillation, has a predicted dose near six-and-a-third milligrams
per day.

### Warfarin 10 mg Initiation Nomogram (Kovacs)
Citation: Kovacs MJ, et al. Comparison of 10-mg and 5-mg warfarin initiation nomograms
together with low-molecular-weight heparin for outpatient treatment of acute venous
thromboembolism. Ann Intern Med. 2003.
Rule: day one and day two are a fixed ten milligrams; the day-three INR sets the
day-three and day-four doses, and the day-five INR sets days five, six and seven through
one of four sub-tables chosen by the day-three band. INR is checked on days three and
five only.
Worked example: a day-three INR below one-point-three gives fifteen milligrams on days
three and four.

### Multiple Myeloma ISS Stage
Citation: Greipp PR, San Miguel J, Durie BGM, et al. International staging system for
multiple myeloma. J Clin Oncol. 2005;23(15):3412-3420.
Rule: Stage I = serum beta2-microglobulin below three-point-five milligrams per litre
AND albumin at least three-point-five grams per decilitre; Stage III = beta2-microglobulin
at least five-point-five, whatever the albumin; Stage II = neither.
Worked example: beta2-microglobulin three-point-two with albumin four is Stage I, median
overall survival about sixty-two months in the 2005 derivation cohort.

### Revised ISS (R-ISS) for Multiple Myeloma
Citation: Palumbo A, Avet-Loiseau H, Oliva S, et al. Revised International Staging System
for multiple myeloma: a report from International Myeloma Working Group. J Clin Oncol.
2015;33(26):2863-2869.
Rule: recompute the ISS, then Stage I = ISS I with normal LDH and no high-risk iFISH
(del(17p), t(4;14), or t(14;16)); Stage III = ISS III with high LDH or high-risk iFISH;
Stage II = all others.
Worked example: ISS III with a high LDH is R-ISS III, five-year overall survival about
forty per cent.

### Second-Revision ISS (R2-ISS) for Multiple Myeloma
Citation: D'Agostino M, Cairns DA, Lahuerta JJ, et al. Second revision of the
International Staging System (R2-ISS) for overall survival in multiple myeloma: a
European Myeloma Network report within HARMONY. J Clin Oncol. 2022;40(29):3406-3418.
Rule: an additive model - ISS II adds one, ISS III adds one-and-a-half; high LDH,
del(17p) and t(4;14) add one each; gain or amplification of 1q21 adds one-half. The total
runs zero to five and maps to strata I (zero), II (one-half to one), III (one-and-a-half
to two-and-a-half) and IV (three to five).
Worked example: ISS III with a high LDH and a 1q21 gain totals three, stratum IV,
median overall survival about thirty-eight months.

### Mayo MGUS Progression-Risk Stratification
Citation: Rajkumar SV, Kyle RA, Therneau TM, et al. Serum free light chain ratio is an
independent risk factor for progression in monoclonal gammopathy of undetermined
significance. Blood. 2005;106(3):812-817.
Rule: one point each for a serum M-protein at least one-and-a-half grams per decilitre,
a non-IgG isotype (IgA or IgM), and an abnormal serum free-light-chain ratio (outside
zero-point-two-six to one-point-six-five). The zero-to-three count maps to a twenty-year
progression risk of five, twenty-one, thirty-seven and fifty-eight per cent.
Worked example: a one-point-two M-protein of IgA isotype with a free-light-chain ratio of
five scores two factors, intermediate risk.

### DIPSS (Myelofibrosis Survival Score)
Citation: Passamonti F, Cervantes F, Vannucchi AM, et al. A dynamic prognostic model to
predict survival in primary myelofibrosis (IWG-MRT). Blood. 2010;115(9):1703-1708.
Rule: age over sixty-five, white-cell count over twenty-five, peripheral blasts at least
one per cent and constitutional symptoms each add one; haemoglobin under ten adds two.
The zero-to-six total maps to low (zero), intermediate-one (one to two), intermediate-two
(three to four) and high (five to six).
Worked example: age sixty-eight with haemoglobin nine-point-five and one per cent blasts
totals four, intermediate-two, median survival about four years.

### DIPSS-Plus (Myelofibrosis Survival Score)
Citation: Gangat N, Caramazza D, Vaidya R, et al. DIPSS Plus: a refined Dynamic
International Prognostic Scoring System for primary myelofibrosis. J Clin Oncol.
2011;29(4):392-397.
Rule: carry the DIPSS group forward (intermediate-one one, intermediate-two two, high
three), then add one each for a platelet count under one hundred, a red-cell transfusion
need and an unfavorable karyotype. The zero-to-six total maps to low (zero),
intermediate-one (one), intermediate-two (two to three) and high (four to six).
Worked example: a DIPSS intermediate-two group with a platelet count of ninety totals
three, intermediate-two, median survival about two-point-nine years.

### Revised IPI (R-IPI) for DLBCL
Citation: Sehn LH, Berry B, Chhanabhai M, et al. The revised International Prognostic Index
(R-IPI) is a better predictor of outcome than the standard IPI for diffuse large B-cell
lymphoma treated with R-CHOP. Blood. 2007;109(5):1857-1861.
Rule: count the five standard IPI factors - age over sixty, LDH above normal, Ann Arbor
stage three-four, two or more extranodal sites, and ECOG at least two - then collapse the
zero-to-five count to three groups: very good (zero), good (one to two) and poor (three to
five).
Worked example: age over sixty with a high LDH and advanced stage scores three factors,
the poor group, four-year progression-free survival about fifty-three per cent.

### NCCN-IPI for DLBCL
Citation: Zhou Z, Sehn LH, Rademaker AW, et al. An enhanced International Prognostic Index
(NCCN-IPI) for diffuse large B-cell lymphoma treated in the rituximab era. Blood.
2014;123(6):837-842.
Rule: a banded IPI - age over forty to sixty adds one, over sixty to seventy-five adds two,
over seventy-five adds three; the LDH normalized ratio over one to three adds one, over
three adds two; Ann Arbor stage three-four, ECOG at least two, and major-site extranodal
disease (marrow, central nervous system, liver or gastrointestinal tract, or lung) each add
one. The zero-to-eight total maps to low (zero to one), low-intermediate (two to three),
high-intermediate (four to five) and high (six to eight).
Worked example: age seventy with an LDH ratio of two-and-a-half and advanced stage totals
four, high-intermediate, five-year overall survival about sixty-four per cent.

### GELF High-Tumor-Burden Criteria (Follicular Lymphoma)
Citation: Brice P, Bastion Y, Lepage E, et al. Comparison in low-tumor-burden follicular
lymphomas between an initial no-treatment policy, prednimustine, or interferon alfa
(Groupe d'Etude des Lymphomes Folliculaires). J Clin Oncol. 1997;15(3):1110-1117.
Rule: high tumor burden is met if any one criterion is present - a mass over seven
centimetres, three or more nodal sites each over three centimetres, systemic (B) symptoms,
symptomatic splenomegaly, a pleural or peritoneal effusion, a cytopenia (haemoglobin under
ten or platelets under one hundred), or a leukemic phase (over five circulating malignant
cells). Met suggests treatment; not met means observation remains an option.
Worked example: a single nodal mass of eight centimetres meets the criteria, high tumor
burden, treatment indicated.

### Hasenclever International Prognostic Score (Advanced Hodgkin Lymphoma)
Citation: Hasenclever D, Diehl V. A prognostic score for advanced Hodgkin's disease.
N Engl J Med. 1998;339(21):1506-1514.
Rule: count seven adverse factors, one each - serum albumin under four, haemoglobin under
ten-point-five, male sex, age at least forty-five, Ann Arbor stage four, white-cell count at
least fifteen, and lymphocytopenia (lymphocytes under six hundred per microlitre or under
eight per cent of the white-cell count). Each factor lowers five-year freedom from
progression by roughly seven to eight per cent.
Worked example: a man of forty-eight with albumin three-point-five and haemoglobin ten
scores four factors, five-year freedom from progression about fifty-one per cent.

### CLL International Prognostic Index (CLL-IPI)
Citation: International CLL-IPI Working Group. An international prognostic index for patients
with chronic lymphocytic leukaemia (CLL-IPI): a meta-analysis of individual patient data.
Lancet Oncol. 2016;17(6):779-790.
Rule: a weighted score - TP53 deletion or mutation adds four; unmutated IGHV adds two;
beta2-microglobulin over three-point-five adds two; advanced clinical stage (Rai one to
four or Binet B-C) adds one; age over sixty-five adds one. The zero-to-ten total maps to
low (zero to one), intermediate (two to three), high (four to six) and very high (seven to
ten).
Worked example: a TP53 abnormality with unmutated IGHV and advanced stage totals seven,
the very-high group, five-year overall survival about twenty-three per cent.

### HOMA-IR (Homeostatic Model Assessment of Insulin Resistance)
Citation: Matthews DR, Hosker JP, Rudenski AS, et al. Homeostasis model assessment: insulin
resistance and beta-cell function from fasting plasma glucose and insulin concentrations in
man. Diabetologia. 1985;28(7):412-419.
Rule: HOMA-IR equals fasting insulin in micro-units per millilitre times fasting glucose,
divided by four hundred and five when glucose is in milligrams per decilitre (or by
twenty-two-and-a-half when glucose is in millimoles per litre). Higher values indicate
greater insulin resistance; there is no single universal diagnostic cut-point. The linear
HOMA-beta-cell estimate equals twenty times insulin divided by glucose in millimoles per
litre minus three-and-a-half.
Worked example: insulin twelve and glucose one hundred give a HOMA-IR of about three.

### QUICKI (Quantitative Insulin Sensitivity Check Index)
Citation: Katz A, Nambi SS, Mather K, et al. Quantitative insulin sensitivity check index: a
simple, accurate method for assessing insulin sensitivity in humans. J Clin Endocrinol
Metab. 2000;85(7):2402-2410.
Rule: QUICKI equals one divided by the sum of the base-ten logarithm of fasting insulin and
the base-ten logarithm of fasting glucose in milligrams per decilitre. Lower values indicate
lower insulin sensitivity, running from about zero-point-four-five in healthy adults to about
zero-point-three in type-two diabetes; there is no universal diagnostic cut-point.
Worked example: insulin twelve and glucose one hundred give a QUICKI of about
zero-point-three-two.

### TyG (Triglyceride-Glucose) Index
Citation: Simental-Mendia LE, Rodriguez-Moran M, Guerrero-Romero F. The product of fasting
glucose and triglycerides as surrogate for identifying insulin resistance in apparently
healthy subjects. Metab Syndr Relat Disord. 2008;6(4):299-304.
Rule: the TyG index equals the natural logarithm of fasting triglycerides times fasting
glucose, both in milligrams per decilitre, divided by two. Higher values indicate greater
insulin resistance; the fasting-insulin-free surrogate has no universal diagnostic cut-point.
Worked example: triglycerides one hundred and fifty with glucose one hundred give a TyG index
of about eight-point-nine.

### Metabolic Syndrome (Harmonized / IDF)
Citation: Alberti KGMM, Eckel RH, Grundy SM, et al. Harmonizing the metabolic syndrome: a
joint interim statement. Circulation. 2009;120(16):1640-1645; with the International Diabetes
Federation 2006 definition.
Rule: five criteria - elevated waist circumference at a population- and sex-specific
cut-point; triglycerides at least one hundred and fifty milligrams per decilitre or on
treatment; HDL under forty in men or under fifty in women or on treatment; blood pressure at
least one hundred and thirty over eighty-five or on treatment; and fasting glucose at least
one hundred or on treatment. The Harmonized definition diagnoses metabolic syndrome when any
three of the five are met; the IDF definition requires central obesity plus any two of the
other four.
Worked example: a man with a waist over one hundred and two centimetres, triglycerides one
hundred and sixty, and glucose one hundred and five meets three criteria, metabolic syndrome
present under the Harmonized definition.

### OST / ORAI Osteoporosis DXA Pre-Screen
Citation: Koh LKH, Sedrine WB, Torralba TP, et al. A simple tool to identify Asian women at
increased risk of osteoporosis (OST). Osteoporos Int. 2001;12(8):699-705; and Cadarette SM,
Jaglal SB, Kreiger N, et al. Development and validation of the Osteoporosis Risk Assessment
Instrument (ORAI). CMAJ. 2000;162(9):1289-1294.
Rule: the OST index equals weight in kilograms minus age in years, times zero-point-two,
truncated toward zero; an index below two flags increased risk in Caucasian populations. The
ORAI sums age (forty-five to fifty-four scores zero, fifty-five to sixty-four scores five,
sixty-five to seventy-four scores nine, seventy-five or more scores fifteen), weight (seventy
or more scores zero, sixty to sixty-nine scores three, under sixty scores nine), and current
estrogen use (no scores two, yes scores zero); a score of nine or more selects for bone
densitometry.
Worked example: a woman of sixty weighing seventy-two kilograms not on estrogen has an OST
index of two (lower risk) and an ORAI of seven (below the referral threshold).

### ISARIC 4C Mortality Score (COVID-19)
Citation: Knight SR, Ho A, Pius R, et al. Risk stratification of patients admitted to hospital
with covid-19 using the ISARIC WHO Clinical Characterisation Protocol: development and
validation of the 4C Mortality Score. BMJ. 2020;370:m3339.
Rule: an additive score from zero to twenty-one summing age band, male sex, number of
comorbidities, respiratory-rate band, peripheral oxygen saturation under ninety-two per cent
on room air, Glasgow Coma Scale under fifteen, urea band, and C-reactive-protein band. The
corrected source table uses urea under seven millimoles per litre and C-reactive protein in
milligrams per litre. The derivation-cohort in-hospital mortality runs low zero to three
(about one per cent), intermediate four to eight (about ten per cent), high nine to fourteen
(about thirty-one per cent), and very high fifteen or more (about sixty-two per cent).
Worked example: a sixty-two-year-old man with two comorbidities, respiratory rate twenty-two,
and otherwise normal values scores eight, the upper edge of the intermediate group.

### COVID-GRAM Critical Illness Risk Score
Citation: Liang W, Liang H, Ou L, et al. Development and validation of a clinical risk score
to predict the occurrence of critical illness in hospitalized patients with COVID-19. JAMA
Intern Med. 2020;180(8):1081-1089.
Rule: a logistic model giving the probability of critical illness as one over one plus e to
the minus x, where x sums the products of each predictor and its coefficient over chest-
imaging abnormality, age, hemoptysis, dyspnea, unconsciousness, number of comorbidities,
cancer history, neutrophil-to-lymphocyte ratio, lactate dehydrogenase, and direct bilirubin.
The paper publishes odds ratios rather than coefficients, so each coefficient is the natural
logarithm of the published odds ratio and the intercept is the logarithm of the constant odds
ratio of zero-point-zero-zero-one; the absolute probability is therefore approximate. The
authors deliberately defined no low, medium, or high cut-points.
Worked example: a fifty-year-old with no abnormal findings, a neutrophil-to-lymphocyte ratio
of three, lactate dehydrogenase three hundred, and direct bilirubin five gives a probability
of about two per cent.

### Candida Score (León)
Citation: León C, Ruiz-Santana S, Saavedra P, et al. A bedside scoring system ("Candida
score") for early antifungal treatment in nonneutropenic critically ill patients with Candida
colonization. Crit Care Med. 2006;34(3):730-737.
Rule: total parenteral nutrition scores one, surgery on intensive-care admission scores one,
multifocal Candida colonization scores one, and severe sepsis scores two, for a total of zero
to five. A score of three or more (the original cut-off above two-and-a-half) identifies
patients in whom invasive candidiasis is likely and empiric antifungal therapy should be
considered; the 2009 validation found that a score under three carried only about a two-per-
cent probability of proven invasive candidiasis.
Worked example: parenteral nutrition, surgery, and multifocal colonization without severe
sepsis score three, at the treat-consideration threshold.

### VACS Index 1.0 (HIV mortality)
Citation: Tate JP, Justice AC, Hughes MD, et al. An internationally generalizable risk index
for mortality after one year of antiretroviral therapy. AIDS. 2013;27(4):563-572.
Rule: an additive index from zero to one hundred and sixty-four summing component points for
age, CD4 count, HIV-1 RNA, hemoglobin, FIB-4 (computed as age times AST divided by platelets
times the square root of ALT), estimated glomerular filtration rate, and hepatitis-C co-
infection. Higher totals indicate greater five-year all-cause mortality along a continuous
calibration curve; the published anchors are a score of zero (about two per cent) and a score
of one hundred and sixty-four (about eighty-six per cent), with no per-band lookup table.
Worked example: a fifty-five-year-old with CD4 two hundred and fifty, viral load one thousand,
hemoglobin eleven, FIB-4 about two-point-seven, eGFR seventy, and no hepatitis C scores
fifty-three.

### RegiSCAR Score for DRESS
Citation: Kardaun SH, Sekula P, Valeyrie-Allanore L, et al. Drug reaction with eosinophilia
and systemic symptoms (DRESS): an original multisystem adverse drug reaction. Results from the
prospective RegiSCAR study. Br J Dermatol. 2013;169(5):1071-1080.
Rule: a weighted score from minus four to plus nine summing fever at least thirty-eight-and-a-
half degrees, enlarged lymph nodes at two or more sites, eosinophilia (the absolute count or,
when leukopenic, the percentage - alternatives, maximum two points), atypical lymphocytes,
skin rash over half the body surface, rash suggestive of DRESS (yes plus one, unknown zero, no
minus one), skin biopsy (compatible or unknown zero, against minus one), internal-organ
involvement (one organ plus one, two or more plus two), resolution beyond fifteen days, and
evaluation of other causes. The total maps to under two no case, two to three possible, four
to five probable, and over five definite DRESS.
Worked example: fever, lymph nodes, eosinophilia of one point, atypical lymphocytes, and one
organ involved score five, a probable DRESS case.

### Hadlock Estimated Fetal Weight (BPD/HC/AC/FL)
Citation: Hadlock FP, Harrist RB, Sharman RS, Deter RL, Park SK. Estimation of fetal weight
with the use of head, body, and femur measurements -- a prospective study. Am J Obstet Gynecol.
1985;151:333-337.
Rule: the four-parameter regression returns the base-ten logarithm of the estimated fetal
weight in grams as one-point-three-five-nine-six, minus zero-point-zero-zero-three-eight-six
times abdominal circumference times femur length, plus zero-point-zero-zero-six-four times
head circumference, plus zero-point-zero-zero-zero-six-one times biparietal diameter times
abdominal circumference, plus zero-point-zero-four-two-four times abdominal circumference, plus
zero-point-one-seven-four times femur length, with every biometry measurement entered in
centimeters. The presence of the biparietal-diameter-by-abdominal-circumference term is the
fingerprint distinguishing this four-parameter model from the three-parameter form.
Worked example: a biparietal diameter of nine, head circumference of thirty-three, abdominal
circumference of thirty, and femur length of seven centimeters give a base-ten logarithm of
three-point-four-one-five and an estimated fetal weight of about two thousand six hundred grams.

### fullPIERS (pre-eclampsia adverse-outcome risk)
Citation: von Dadelszen P, Payne B, Li J, et al. Prediction of adverse maternal outcomes in
pre-eclampsia: development and validation of the fullPIERS model. Lancet. 2011;377:219-227.
Rule: a logistic model whose log-odds is two-point-six-eight, minus zero-point-zero-five-four-
one times gestational age in weeks, plus one-point-two-three for chest pain or dyspnea, minus
zero-point-zero-two-seven-one times creatinine in micromoles per liter, plus zero-point-two-
zero-seven times platelets in ten-to-the-ninth per liter, plus a platelet-squared term, plus
zero-point-zero-one-zero-one times AST, minus an AST-squared term, plus a creatinine-by-platelet
term, minus a platelet-by-AST term, and minus a platelet-by-oxygen-saturation term -- oxygen
saturation has no main effect of its own. The probability is one over one plus the exponential
of the negative log-odds. A predicted probability of thirty per cent or more is the high-risk
rule-in cut-point (positive likelihood ratio about seventeen-and-a-half); ten to thirty is
intermediate and under ten is low.
Worked example: a woman at thirty-two weeks with chest pain, oxygen saturation of ninety-six,
platelets of one hundred twenty, creatinine of ninety, and AST of sixty has a predicted
probability of about eighteen per cent, in the intermediate band.

### miniPIERS (bedside pre-eclampsia risk)
Citation: Payne BA, Hutcheon JA, Ansermino JM, et al. A risk prediction model for the assessment
and triage of women with hypertensive disorders of pregnancy in low-resourced settings: the
miniPIERS model. PLoS Med. 2014;11:e1001589.
Rule: a bedside logistic model using no laboratory tests whose log-odds is minus five-point-
seven-seven, minus zero-point-two-nine-eight for multiparity, minus one-point-zero-seven times
the natural log of gestational age in weeks, plus one-point-three-four times the natural log of
systolic blood pressure in millimeters of mercury, plus a categorical dipstick-proteinuria term
(two-plus carries the published negative weight of minus zero-point-two-one-eight, three-plus
plus zero-point-four-two-four, four-plus plus zero-point-five-one-two), plus one-point-one-eight
for vaginal bleeding with abdominal pain, plus zero-point-four-two-two for headache or visual
changes, and plus zero-point-eight-four-seven for chest pain or dyspnea. A predicted probability
of twenty-five per cent or more is the high-risk rule-in cut-point (positive likelihood ratio
about five), and over fifteen prompts increased surveillance.
Worked example: a multiparous woman at thirty-four weeks, systolic pressure one hundred sixty,
three-plus dipstick proteinuria, and headache has a predicted probability of about ten per cent,
below the surveillance threshold.

### Amniotic Fluid Index (AFI)
Citation: Moore TR, Cayle JE. The amniotic fluid index in normal human pregnancy. Am J Obstet
Gynecol. 1990;162:1168-1173.
Rule: the sum, in centimeters, of the deepest vertical pocket of clear fluid in each of the four
uterine quadrants. Against the ACOG thresholds an index under five centimeters is
oligohydramnios and over twenty-four is polyhydramnios (some references use over twenty-five);
five to eight centimeters is often called low-normal.
Worked example: four quadrant pockets of one centimeter each sum to four, flagging
oligohydramnios.

### Barnhart Minimal hCG Rise (viable IUP)
Citation: Barnhart KT, Sammel MD, Rinaudo PF, Zhou L, Hummel AC, Guo W. Symptomatic patients with
an early viable intrauterine pregnancy: HCG curves redefined. Obstet Gynecol. 2004;104:50-55.
Rule: for a symptomatic patient with a potentially viable intrauterine pregnancy the slowest
normal rise is fifty-three per cent over forty-eight hours (the ninety-nine per cent lower
bound; a more conservative thirty-five per cent from the two-thousand-twelve re-analysis is
sometimes used). The observed rise is repeat minus initial over initial; the expected minimum
is scaled log-linearly from the forty-eight-hour anchor. A sub-minimal rise is abnormal but not
by itself diagnostic of an ectopic or non-viable pregnancy.
Worked example: an initial value of one thousand rising to one thousand four hundred over
forty-eight hours is a forty per cent rise, below the fifty-three per cent minimum and therefore
sub-minimal.

### IOM Gestational Weight Gain
Citation: Institute of Medicine and National Research Council. Weight Gain During Pregnancy:
Reexamining the Guidelines. Washington, DC: National Academies Press; 2009; carried in ACOG
Committee Opinion five hundred forty-eight.
Rule: the recommended total weight gain and second-and-third-trimester weekly rate by
pre-pregnancy body-mass-index category -- underweight twenty-eight to forty pounds, normal
weight twenty-five to thirty-five, overweight fifteen to twenty-five, and obese eleven to twenty
pounds for a singleton, with provisional twin ranges (no recommendation exists for an
underweight twin pregnancy).
Worked example: a pre-pregnancy weight of two hundred pounds at sixty-four inches gives a
body-mass index of about thirty-four, in the obese category, with a recommended total gain of
eleven to twenty pounds for a singleton.

### Flamm VBAC Score
Citation: Flamm BL, Geiger AM. Vaginal birth after cesarean delivery: an admission scoring
system. Obstet Gynecol. 1997;90:907-910.
Rule: an admission scoring system summing five factors known at the start of a trial of labor
after cesarean -- maternal age under forty scores two, prior vaginal birth scores four when it
occurred both before and after the first cesarean, two when only after, one when only before,
and zero when never, the prior cesarean being for a reason other than failure to progress scores
one, cervical effacement scores two over seventy-five per cent, one from twenty-five to
seventy-five, and zero under twenty-five, and cervical dilation of four centimeters or more
scores one. The total of zero to ten maps to a predicted likelihood of a successful vaginal
birth of about forty-nine per cent at zero to two, sixty at three, sixty-seven at four,
seventy-seven at five, eighty-nine at six, ninety-three at seven, and ninety-five at eight or
more. It is the free substitute for the paywalled Grobman MFMU calculator.
Worked example: a woman under forty with a prior vaginal birth after the first cesarean and
twenty-five to seventy-five per cent effacement scores five, an estimated success of about
seventy-seven per cent.

### ROMA (Risk of Ovarian Malignancy Algorithm)
Citation: Moore RG, McMeekin DS, Brown AK, et al. A novel multiple marker bioassay utilizing HE4
and CA125 to predict epithelial ovarian cancer in patients with a pelvic mass. Gynecol Oncol.
2009;112:40-46.
Rule: a logistic predictive index with natural-log marker terms. Premenopausal the index is
minus twelve plus two-point-three-eight times the natural log of HE4 plus zero-point-zero-six-
two-six times the natural log of CA-125; postmenopausal it is minus eight-point-zero-nine plus
one-point-zero-four times the natural log of HE4 plus zero-point-seven-three-two times the
natural log of CA-125. ROMA per cent is one hundred times the exponential of the index over one
plus that exponential. The high-risk cut-point is about thirteen per cent premenopausal and
twenty-eight per cent postmenopausal, but is assay-platform dependent.
Worked example: a postmenopausal woman with HE4 of one hundred fifty and CA-125 of one hundred
has a ROMA of about sixty-two per cent, above the postmenopausal cut-point.

### Risk of Malignancy Index (RMI I/II/III)
Citation: Jacobs I, Oram D, Fairbanks J, et al. A risk of malignancy index incorporating CA 125,
ultrasound and menopausal status for the accurate preoperative diagnosis of ovarian cancer. Br J
Obstet Gynaecol. 1990;97:922-929; Tingulstad 1996/1999 for II and III.
Rule: the index is the ultrasound score times the menopausal score times CA-125 in units per
milliliter. The ultrasound features are multilocular cyst, solid areas, bilateral lesions,
ascites, and intra-abdominal metastases. In RMI one the ultrasound score is zero for no
features, one for one feature, and three for two to five, and the menopausal score is one
premenopausal and three postmenopausal. In RMI two the ultrasound score is one for zero or one
feature and four for two or more, and the menopausal score is one and four. In RMI three the
ultrasound score is one and three and the menopausal score is one and three. An index over two
hundred is the conventional high-risk threshold.
Worked example: RMI one with three features, postmenopausal, and CA-125 of eighty gives three
times three times eighty, an index of seven hundred twenty, above the threshold.

### IOTA Simple Rules
Citation: Timmerman D, Testa AC, Bourne T, et al. Simple ultrasound-based rules for the diagnosis
of ovarian cancer. Ultrasound Obstet Gynecol. 2008;31:681-690.
Rule: five benign features (unilocular cyst; a solid component under seven millimeters; acoustic
shadows; a smooth multilocular tumor under one hundred millimeters; no blood flow) and five
malignant features (irregular solid tumor; ascites; at least four papillary structures; an
irregular multilocular solid tumor of one hundred millimeters or more; very strong blood flow).
If one or more benign features apply and no malignant feature, the mass is benign; if one or more
malignant and no benign, malignant; if both or neither apply it is inconclusive and a second-
stage test is advised. It is the free substitute for the IOTA ADNEX model.
Worked example: one benign and one malignant feature both apply, so the mass is inconclusive.

### Rotterdam PCOS Criteria
Citation: Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. Revised 2003 consensus on
diagnostic criteria and long-term health risks related to polycystic ovary syndrome. Hum Reprod.
2004;19:41-47.
Rule: polycystic ovary syndrome requires at least two of three features -- oligo- or anovulation,
clinical or biochemical hyperandrogenism, and polycystic ovarian morphology on ultrasound --
after the exclusion of mimics such as thyroid disease, hyperprolactinemia, non-classic congenital
adrenal hyperplasia, and androgen-secreting tumors.
Worked example: hyperandrogenism and oligo-ovulation in a woman whose mimics have been excluded
meet the criteria as the phenotype with hyperandrogenism and ovulatory dysfunction.

### POP-Q Staging
Citation: Bump RC, Mattiasson A, Bø K, et al. The standardization of terminology of female pelvic
organ prolapse and pelvic floor dysfunction. Am J Obstet Gynecol. 1996;175:10-17.
Rule: the leading edge, the most positive of points Aa, Ba, C, D, Ap, and Bp measured in
centimeters relative to the hymen at zero, drives the stage. Stage zero is no descent (the four
vaginal-wall points at minus three and the cervix or cuff at or above the negative of total
vaginal length minus two); stage one is a leading edge more than one centimeter above the hymen;
stage two is within one centimeter of the hymen; stage three is more than one centimeter below
but not fully everted; stage four is essentially complete eversion.
Worked example: with the anterior points at plus two and plus three and total vaginal length of
nine, the leading edge is plus three at Ba, a stage-three prolapse.

### Neonatal Early-Onset Sepsis Calculator (Kaiser)
Citation: Kuzniewicz MW, Puopolo KM, Fischer A, et al. A quantitative, risk-based approach to the
management of neonatal early-onset sepsis. JAMA Pediatr. 2017;171(4):365-371; on the model of
Puopolo KM, et al. Pediatrics. 2011;128(5):e1155.
Rule: a maternal and prenatal logistic model estimates the early-onset-sepsis risk at birth from
gestational age, the highest intrapartum temperature in degrees Fahrenheit, the rupture-of-
membrane duration, group-B streptococcus status, and the type and timing of intrapartum
antibiotics; that prior probability is converted to odds, multiplied by the newborn examination
likelihood ratio (well-appearing, equivocal, or clinical illness), and converted back to the
posterior probability of sepsis per one thousand live births. The source frames management by the
posterior risk: routine care below one, blood culture from one to under three, and empiric
antibiotics at or above three per thousand, with enhanced observation when the risk at birth is
one per thousand or higher. The logistic is overflow-clamped so it never reports a probability
from a non-finite value.
Worked example: a well-appearing newborn at thirty-nine weeks with a peak maternal temperature of
one hundred point four, eighteen hours of ruptured membranes, a positive group-B streptococcus
screen, and no adequate antibiotics has a risk at birth above one per thousand but a posterior
risk below one after the reassuring exam, so the tool reports enhanced observation rather than a
culture.

### SNAPPE-II
Citation: Richardson DK, Corcoran JD, Escobar GJ, Lee SK. SNAP-II and SNAPPE-II: simplified
newborn illness severity and mortality risk scores. J Pediatr. 2001;138(1):92-100.
Rule: nine variables from the first hours of life are each mapped to a banded point value and
summed to an illness-severity score. The physiology block scores mean blood pressure, the lowest
temperature, the ratio of arterial oxygen tension in millimeters of mercury to the inspired oxygen
fraction as a percentage, the lowest serum pH, multiple seizures, and urine output; the perinatal
extension adds birth weight, small-for-gestational-age below the third percentile, and a five-
minute Apgar under seven. Higher totals carry a higher neonatal mortality risk; an item left blank
scores its normal band.
Worked example: a mean pressure in the twenties, a temperature below thirty-five, an oxygen ratio
near six-tenths, a pH below seven point one, urine output below one, a birth weight between seven
hundred fifty and one thousand grams, and a five-minute Apgar under seven sum to a high-severity
total.

### RDAI / Tal Bronchiolitis Severity
Citation: Lowell DI, Lister G, Von Koss H, McCarthy P. Wheezing in infants: the respiratory
distress assessment instrument. Pediatrics. 1987;79(6):939-945; with the Tal respiratory score
(Tal A, et al. Pediatrics. 1983;71(1):13-18).
Rule: the Respiratory Distress Assessment Instrument grades bronchiolitis from six observations --
wheezing on expiration, wheezing on inspiration, the location of wheezing, and supraclavicular,
intercostal, and subcostal retractions -- summing to a respiratory-distress total. The optional
Tal score sums respiratory rate, wheezing, cyanosis, and accessory-muscle use. Both grade severity
for trend; neither sets a treatment threshold.
Worked example: marked expiratory and inspiratory wheeze across most lung fields with moderate
retractions yields a high RDAI total, and a moderate Tal score alongside it.

### Clinical Dehydration Scale (CDS)
Citation: Goldman RD, Friedman JN, Parkin PC. Validation of the clinical dehydration scale for
children with acute gastroenteritis. Pediatrics. 2008;122(3):545-549.
Rule: four items -- general appearance, eyes, mucous membranes, and tears -- are each scored zero,
one, or two and summed. A total of zero is no dehydration, one to four is some dehydration, and
five to eight is moderate to severe dehydration. It is validated in children roughly one to thirty-
six months with acute gastroenteritis.
Worked example: a restless child with slightly sunken eyes, dry mucous membranes, and decreased
tears scores in the moderate-to-severe band.

### Koff Expected Bladder Capacity
Citation: Koff SA. Estimating bladder capacity in children. Urology. 1983;21(3):248.
Rule: the expected bladder capacity in millilitres equals the age in years plus two, multiplied by
thirty. It is the standard reference estimate for children roughly one to twelve years; the
formula guards a negative age.
Worked example: a four-year-old has an expected bladder capacity of one hundred eighty millilitres.

### Pediatric BMI-for-Age Percentile and z-score (CDC 2000)
Citation: Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for the United States:
methods and development. Vital Health Stat 11. 2002;(246):1-190. LMS coefficients transcribed
verbatim from the CDC NCHS published percentile data files (bmiagerev), cross-verified against the
CDC published percentile columns.
Formula: z = ((BMI/M)^L - 1) / (L*S), with the L -> 0 limit z = ln(BMI/M)/S; the percentile is the
standard-normal CDF of z. L, M, and S are the age- and sex-specific CDC LMS values, interpolated
between tabulated single-month ages (24 to 240.5 months). Bands per the CDC cutoffs: under the
fifth percentile underweight, fifth to under the eighty-fifth healthy weight, eighty-fifth to
under the ninety-fifth overweight, ninety-fifth percentile or above obese.
Worked example: a sixteen-year-old boy with a BMI of thirty is at the ninety-eighth percentile
(z 1.97), obese.

### WHO Growth z-score, weight/length-for-age (WHO 2006)
Citation: WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards based on
length/height, weight and age. Acta Paediatr Suppl. 2006;450:76-85. LMS tables transcribed verbatim
from the WHO 2006 standard as redistributed in the CDC NCHS WHO growth-chart data files (weight-for-
age and length-for-age, birth to twenty-four months), cross-verified against the WHO indicator
tables.
Formula: z = ((X/M)^L - 1) / (L*S); length-for-age uses L = 1. The WHO flags a z-score below minus
two as low (underweight for weight-for-age, stunted for length-for-age) and below minus three as
severely low; above plus two is high.
Worked example: a six-month-old boy weighing five and a half kilograms is at z minus 3.27, severely
low.

### Mid-Parental Target Height (Tanner)
Citation: Tanner JM, Goldstein H, Whitehouse RH. Standards for children's height at ages 2-9 years
allowing for height of parents. Arch Dis Child. 1970;45(244):755-762.
Formula: for a boy, predicted adult height = (father + mother + 13) / 2 cm; for a girl,
(father + mother - 13) / 2 cm; the child's adult height is expected within about plus or minus 8.5
cm (roughly the third to ninety-seventh percentile target range).
Worked example: a boy with a mother of one hundred sixty-five centimetres and a father of one
hundred eighty has a target height of one hundred seventy-nine centimetres (range 170.5 to 187.5).

### Corrected Gestational Age (AAP)
Citation: Engle WA; American Academy of Pediatrics Committee on Fetus and Newborn. Age terminology
during the perinatal period. Pediatrics. 2004;114(5):1362-1364.
Formula: corrected age = chronological age - (40 - gestational age at birth in weeks). It aligns
developmental expectations with a forty-week term reference and is conventionally applied through
about twenty-four months.
Worked example: a twenty-eight-week preemie at six months chronological age has a corrected age of
3.2 months (twelve weeks of prematurity subtracted).

### POSSUM (Physiological and Operative Severity Score)
Citation: Copeland GP, Jones D, Walters M. POSSUM: a scoring system for surgical audit. Br J
Surg. 1991;78(3):355-360.
Formula: twelve physiological and six operative variables are each graded one, two, four, or
eight points; the physiological score and operative score drive two logistic equations -- predicted
morbidity ln[R/(1-R)] = minus five point nine one + zero point one six times physiological + zero
point one nine times operative, and predicted mortality ln[R/(1-R)] = minus seven point zero four +
zero point one three times physiological + zero point one six times operative.
Worked example: a physiological score of thirty-two and an operative score of eighteen give a
mortality logit of exactly zero -- predicted thirty-day morbidity ninety-three point three per cent
and mortality fifty per cent.

### P-POSSUM (Portsmouth POSSUM)
Citation: Prytherch DR, Whiteley MS, Higgins B, et al. POSSUM and Portsmouth POSSUM for predicting
mortality. Br J Surg. 1998;85(9):1217-1220.
Formula: the identical eighteen POSSUM variables drive a recalibrated mortality equation,
ln[R/(1-R)] = minus nine point zero six five + zero point one six nine two times physiological + zero
point one five five zero times operative; there is no separate morbidity equation.
Worked example: at the minimum physiological score of twelve and operative score of six, P-POSSUM
predicts about zero point two per cent mortality where the original POSSUM predicts about one point
one -- the low-risk over-prediction P-POSSUM corrects.

### SORT (Surgical Outcome Risk Tool)
Citation: Protopapa KL, Simpson JC, Smith NCE, Moonesinghe SR. Development and validation of the
Surgical Outcome Risk Tool (SORT).
Br J Surg. 2014;101(13):1774-1783.
Formula: thirty-day mortality is one over one plus e to the minus logit, where the logit is minus
seven point three six six plus the ASA term (ASA three, four, and five only -- ASA one and two are
the reference), plus the urgency term, plus a high-risk-specialty term, plus a high-severity term,
plus a cancer term, plus a mutually-exclusive age term.
Worked example: an ASA-three urgent operation in a high-risk specialty of high severity with cancer
in a sixty-five-to-seventy-nine-year-old gives a predicted thirty-day mortality of fourteen point
six seven per cent.

### Goldman Cardiac Risk Index
Citation: Goldman L, Caldera DL, Nussbaum SR, et al. Multifactorial index of cardiac risk in
noncardiac surgical procedures. N Engl J Med. 1977;297(16):845-850.
Formula: nine weighted clinical factors sum to a total out of fifty-three and map to Class one
(none to five points), two (six to twelve), three (thirteen to twenty-five), and four (twenty-six or
more), each with the source's cardiac-complication rate.
Worked example: a myocardial infarction within six months (ten points) plus an intraperitoneal
operation (three points) totals thirteen -- Class three, about fourteen per cent major cardiac
complications or death; twelve points would be Class two.

### Wilson Risk Sum Score (difficult intubation)
Citation: Wilson ME, Spiegelhalter D, Robertson JA, Lesser P. Predicting difficult intubation. Br J
Anaesth. 1988;61(2):211-216.
Formula: five anatomic factors -- body weight, head and neck movement, jaw movement, a receding
mandible, and buck teeth -- are each scored zero, one, or two and summed to a maximum of ten.
Worked example: a body weight over one hundred ten kilograms alone scores two of ten, at or above
the common sensitive screen; the derivation's optimum cut was a score above two, which identified
about seventy-five per cent of difficult intubations.

### Surgical Risk Scale (Sutton)
Citation: Sutton R, Bann S, Brooks M, Sarin S. The Surgical Risk Scale as an improved tool for
risk-adjusted analysis in comparative surgical audit. Br J Surg. 2002;89(6):763-768.
Formula: the sum of CEPOD operative urgency (elective one to emergency four), ASA physical-status
grade (one to five), and BUPA operative-magnitude grade (minor one to complex-major five), giving a
total from three to fourteen.
Worked example: an emergency operation (four) in an ASA-four patient for a complex-major procedure
(five) totals thirteen; higher scores carry a higher in-hospital mortality, with eight or more a
common high-risk threshold.

### Modified 5-Item Frailty Index (mFI-5)
Citation: Subramaniam S, Aalberg JJ, Soriano RP, Divino CM. New 5-Factor Modified Frailty Index Using
American College of Surgeons NSQIP Data. J Am Coll Surg. 2018;226(2):173-181.
Formula: five accumulated deficits -- diabetes mellitus, hypertension requiring medication, a history
of COPD or pneumonia, congestive heart failure, and partially or totally dependent functional status
-- are each counted one point, giving a total from zero to five.
Worked example: a patient with diabetes and congestive heart failure scores two of five, at or above
the commonly-cited frailty threshold for elevated postoperative morbidity and mortality; the index
performs comparably to the original eleven-item version.

### Modified 11-Item Frailty Index (mFI-11)
Citation: Velanovich V, Antoine H, Swartz A, et al. Accumulating deficits to the point of frailty: a
national surgical quality improvement program study. J Surg Res. 2013;183(1):104-110.
Formula: eleven comorbidity and functional deficits are each counted one point and reported as a
fraction of eleven; a higher accumulated-deficit fraction tracks rising postoperative risk.
Worked example: a patient with diabetes, congestive heart failure, and a prior myocardial infarction
scores three of eleven, a frailty index of about twenty-seven per cent. The validated five-item index
performs comparably.

### FRAIL Scale
Citation: Morley JE, Malmstrom TK, Miller DK. A simple frailty questionnaire (FRAIL) predicts outcomes
in middle aged African Americans. J Nutr Health Aging. 2012;16(7):601-608.
Formula: five items -- Fatigue, Resistance (climbing one flight of stairs), Ambulation (walking one
block), Illnesses (five or more of eleven listed conditions), and Loss of weight (over five per cent)
-- are each counted one point, giving a total from zero to five.
Worked example: fatigue plus difficulty with stairs and walking a block totals three of five, which
crosses from pre-frail into the frail band (zero robust, one to two pre-frail, three or more frail).

### Vulnerable Elders Survey-13 (VES-13)
Citation: Saliba D, Elliott M, Rubenstein LZ, et al. The Vulnerable Elders Survey: a tool for
identifying vulnerable older people in the community. J Am Geriatr Soc. 2001;49(12):1691-1699.
Formula: a total from zero to ten combines an age band (seventy-five to eighty-four scores one,
eighty-five or older scores three), fair or poor self-rated health (one), physical-function
difficulty (one point for each of six tasks rated "a lot" or "unable", capped at two), and a single
four-point block for any of five activity-of-daily-living disabilities.
Worked example: an eighty-year-old (one) with fair health (one) and a lot of difficulty walking a
quarter mile (one) totals three, at the threshold of three or more that flags vulnerability -- about
a four-fold two-year risk of functional decline or death.

### CARG Chemotherapy Toxicity Tool
Citation: Hurria A, Togawa K, Mohile SG, et al. Predicting chemotherapy toxicity in older adults with
cancer: a prospective multicenter study. J Clin Oncol. 2011;29(25):3457-3465.
Formula: eleven weighted predictors -- age seventy-two or older (two), gastrointestinal or
genitourinary cancer (two), standard-dose chemotherapy (two), polychemotherapy (two), low haemoglobin
for sex (three), creatinine clearance below thirty-four (three), hearing fair or worse (two), one or
more falls in six months (three), needing help with medications (one), walking-one-block limitation
(two), and decreased social activity (one) -- sum to a score banded low, intermediate, or high.
Worked example: age seventy-two or older with a gastrointestinal cancer on standard-dose chemotherapy
totals six, the lower edge of the intermediate band (low zero to five, intermediate six to nine, high
ten or more), corresponding to about fifty-two per cent grade three to five toxicity.

### Gustilo-Anderson Open Fracture Classification
Citation: Gustilo RB, Anderson JT. Prevention of infection in the treatment of one thousand and
twenty-five open fractures of long bones. J Bone Joint Surg Am. 1976;58(4):453-458. Type III subtypes:
Gustilo, Mendoza, Williams. J Trauma. 1984;24(8):742-746.
Formula: the clinician's read of the open fracture (wound size, an extensive-soft-tissue or high-energy
qualifier, whether coverage needs a flap, and whether an arterial injury needs repair) maps to a class
of one, two, three-A, three-B, or three-C. The Type III subtype is set by coverage and perfusion, not
wound size: arterial repair forces three-C; inadequate coverage requiring a flap forces three-B; a
high-energy or extensive-soft-tissue mechanism or a wound over ten centimeters forces at least Type
three.
Worked example: a one-to-ten-centimeter wound with an arterial injury requiring repair is Type three-C
regardless of wound size; the headline coverage-and-perfusion precedence over wound size.

### Garden Classification (Femoral Neck)
Citation: Garden RS. Low-angle fixation in fractures of the femoral neck. J Bone Joint Surg Br.
1961;43-B(4):647-663.
Formula: the femoral-neck displacement pattern maps to grade one (incomplete, valgus-impacted), two
(complete, nondisplaced), three (complete, partially displaced), or four (complete, fully displaced).
Grades one and two are stable/nondisplaced; three and four are unstable/displaced.
Worked example: a complete, partially displaced fracture is Grade three, crossing from the stable
(one-to-two) into the unstable (three-to-four) group that drives internal fixation versus arthroplasty.

### Danis-Weber Ankle Classification
Citation: Weber BG. Die Verletzungen des oberen Sprunggelenkes. Bern: Hans Huber; 1972 (Danis-Weber
classification; pathologic-anatomic basis Danis 1949; adopted by the AO Foundation).
Formula: the distal-fibula fracture level relative to the syndesmosis maps to Type A (below,
infrasyndesmotic, stable), Type B (at the level, transsyndesmotic, variably injured), or Type C (above,
suprasyndesmotic, disrupted and unstable).
Worked example: a fracture above the syndesmosis is Type C, a suprasyndesmotic injury with a disrupted
syndesmosis that usually needs fixation -- the B-to-C instability flip.

### Schatzker Classification (Tibial Plateau)
Citation: Schatzker J, McBroom R, Bruce D. The tibial plateau fracture: the Toronto experience
1968-1975. Clin Orthop Relat Res. 1979;(138):94-104.
Formula: the plateau-fracture pattern maps to Type one (lateral split), two (lateral split-depression),
three (lateral pure depression), four (medial plateau), five (bicondylar), or six (plateau fracture
with metaphyseal-diaphyseal dissociation). Types one to three are low-energy; four to six are
high-energy.
Worked example: a medial plateau fracture is Type four, the high-energy group with the worst prognosis,
prompting assessment for peroneal-nerve and popliteal-vessel injury.

### Salter-Harris Classification (Physeal Fracture)
Citation: Salter RB, Harris WR. Injuries involving the epiphyseal plate. J Bone Joint Surg Am.
1963;45(3):587-622.
Formula: the SALTR mnemonic maps the fracture line to Type one (Slipped, through the physis only), two
(Above, physis into metaphysis -- the most common), three (Lower, physis into epiphysis), four
(Through, across metaphysis, physis, and epiphysis), or five (cRush, physeal compression). Growth-
disturbance risk rises ascending one to five.
Worked example: a fracture through the physis and into the epiphysis is Type three -- intra-articular,
usually needing anatomic reduction, the boundary above the common Type-two metaphyseal pattern.

### Neer Classification (Proximal Humerus)
Citation: Neer CS 2nd. Displaced proximal humeral fractures. I. Classification and evaluation. J Bone
Joint Surg Am. 1970;52(6):1077-1089.
Formula: a segment of the four (articular surface, greater tuberosity, lesser tuberosity, surgical neck
or shaft) is displaced when separated more than one centimeter or angulated more than forty-five
degrees; the part count is one plus the number of displaced segments, so an undisplaced fracture is
one-part however many fracture lines it has.
Worked example: a displaced greater tuberosity plus a displaced surgical neck is a three-part fracture
(two displaced segments), an unstable pattern carried into operative planning.

### Frykman Classification (Distal Radius)
Citation: Frykman G. Fracture of the distal radius including sequelae. Acta Orthop Scand.
1967;Suppl 108:3-153.
Formula: two axes — joint involvement (extra-articular; radiocarpal joint; distal radioulnar joint;
or both joints) and an associated distal-ulna (ulnar styloid) fracture. Odd types have no ulnar-styloid
fracture and even types add one, so type I/II are extra-articular, III/IV involve the radiocarpal joint,
V/VI the distal radioulnar joint, and VII/VIII both joints. Higher type means more articular involvement.
Worked example: both joints involved with an ulnar-styloid fracture is Type VIII; an extra-articular
fracture with no ulnar-styloid fracture is Type I.

### Mirels Score (Impending Pathologic Fracture)
Citation: Mirels H. Metastatic disease in long bones: a proposed scoring system for diagnosing impending
pathologic fractures. Clin Orthop Relat Res. 1989;(249):256-264.
Formula: four factors each scored one to three — site (upper limb 1, lower limb 2, peritrochanteric 3),
pain (mild 1, moderate 2, functional 3), radiographic nature (blastic 1, mixed 2, lytic 3), and size
relative to the cortex (under a third 1, a third to two thirds 2, over two thirds 3). Total four to
twelve: seven or less is low risk (about 0 to 4 percent fracture risk, irradiate and observe), eight is
borderline (about 15 percent), and nine or more is high risk (over 33 percent, prophylactic fixation).
Worked example: a lower-limb lesion (2) with functional pain (3), a lytic appearance (3), and a small
under-a-third size (1) totals nine — high risk, prophylactic fixation recommended.

### Kellgren-Lawrence Osteoarthritis Grade
Citation: Kellgren JH, Lawrence JS. Radiological assessment of osteo-arthrosis. Ann Rheum Dis.
1957;16(4):494-502.
Formula: radiographic grade zero to four — 0 none; 1 doubtful narrowing with possible osteophytic
lipping; 2 definite osteophytes with possible narrowing; 3 moderate osteophytes, definite narrowing,
some sclerosis, possible bone-end deformity; 4 large osteophytes, marked narrowing, severe sclerosis,
definite deformity. Grade two or higher is the accepted threshold for definite radiographic osteoarthritis.
Worked example: definite osteophytes with possible joint-space narrowing is grade 2 — the threshold for
definite radiographic osteoarthritis.

### Pittsburgh Knee Rules
Citation: Seaberg DC, Jackson R. Clinical decision rule for knee radiographs. Am J Emerg Med.
1994;12(5):541-543. Validated: Seaberg DC, et al. Ann Emerg Med. 1998;32(1):8-13.
Formula: the entry gate is a blunt-trauma or fall mechanism; without it the rule does not apply. Given
the gate, a knee radiograph is indicated if the patient is younger than twelve or older than fifty, or
is unable to take four weight-bearing steps in the emergency department. About 99 percent sensitive and
60 percent specific; unlike the Ottawa knee rule it applies to children.
Worked example: a fall mechanism in a patient older than fifty meets the rule — a knee radiograph is
indicated.

### Compartment Delta Pressure
Citation: McQueen MM, Court-Brown CM. Compartment monitoring in tibial fractures: the pressure threshold
for decompression. J Bone Joint Surg Br. 1996;78(1):99-104.
Formula: delta pressure equals the diastolic blood pressure minus the measured intracompartmental
pressure, in millimeters of mercury. A delta pressure under thirty is the published threshold for
fasciotomy; the differential is more reliable than an absolute-pressure threshold.
Worked example: a diastolic pressure of seventy with a measured compartment pressure of forty-five gives
a delta of twenty-five — below thirty, the fasciotomy threshold.

### SINS — Spinal Instability Neoplastic Score
Citation: Fisher CG, DiPaola CP, Ryken TC, et al. A novel classification system for spinal instability in
neoplastic disease: an evidence-based approach and expert consensus from the Spine Oncology Study Group.
Spine. 2010;35(22):E1221-E1229.
Formula: six components sum zero to eighteen — spinal location (junctional 3, mobile 2, semirigid 1,
rigid 0), mechanical pain (3, occasional 1, none 0), bone lesion (lytic 2, mixed 1, blastic 0), alignment
(subluxation 4, de novo deformity 2, normal 0), vertebral-body collapse (over half 3, under half 2,
no collapse but over half involved 1, none 0), and posterolateral element involvement (bilateral 3,
unilateral 1, none 0). Bands: zero to six stable, seven to twelve indeterminate, thirteen to eighteen
unstable; a seven-or-higher score warrants a surgical consult.
Worked example: a junctional lesion (3) with mechanical pain (3) and a lytic appearance (2) totals eight —
indeterminate, surgical consultation recommended.

### Revised Tokuhashi Score
Citation: Tokuhashi Y, Matsuzaki H, Oda H, Oshima M, Ryu J. A revised scoring system for preoperative
evaluation of metastatic spine tumor prognosis. Spine. 2005;30(19):2186-2191.
Formula: six parameters sum zero to fifteen — general condition (Karnofsky, zero to two), extraspinal
bone-metastasis foci (zero to two), vertebral-body metastases (zero to two), major-organ metastases
(zero to two), primary site (zero to five), and palsy (Frankel, zero to two). A lower total is the worse
prognosis: zero to eight predicts under six months, nine to eleven at least six months, twelve to fifteen
at least one year.
Worked example: a total of nine predicts an expected survival of at least six months — palliative surgery
may be appropriate.

### Tomita Surgical Strategy Score
Citation: Tomita K, Kawahara N, Kobayashi T, Yoshida A, Murakami H, Akamaru T. Surgical strategy for
spinal metastases. Spine. 2001;26(3):298-306.
Formula: three factors sum two to ten — primary-tumor grade (slow growth 1, moderate 2, rapid or unknown
4), visceral metastases (none 0, treatable 2, untreatable 4), and bone metastases (solitary 1, multiple
2). Strategy bands: two to three wide or marginal excision, four to five marginal or intralesional, six
to seven palliative surgery, eight to ten supportive or terminal care.
Worked example: a moderate-growth primary (2) with treatable visceral metastases (2) and multiple bone
metastases (2) totals six — palliative surgery for short-term palliation.

### TLICS — Thoracolumbar Injury Classification and Severity Score
Citation: Vaccaro AR, Lehman RA Jr, Hurlbert RJ, et al. A new classification of thoracolumbar injuries:
the importance of injury morphology, the integrity of the posterior ligamentous complex, and neurologic
status. Spine. 2005;30(20):2325-2333.
Formula: morphology (compression 1, burst 2, translational or rotational 3, distraction 4), neurologic
status (intact 0, nerve root 2, complete cord 2, incomplete cord 3, cauda equina 3), and posterior
ligamentous complex (intact 0, indeterminate 2, disrupted 3) sum to zero to ten. Triage: three or less
nonoperative, four indeterminate, five or more operative. Incomplete cord injury scores higher than
complete because it benefits more from decompression.
Worked example: a compression injury (1) with nerve-root deficit (2) and an indeterminate posterior
ligamentous complex (2) totals five — operative management.

### SLIC — Subaxial Cervical Spine Injury Classification
Citation: Vaccaro AR, Hulbert RJ, Patel AA, et al. The subaxial cervical spine injury classification
system: a novel approach to recognize the importance of morphology, neurology, and integrity of the
disco-ligamentous complex. Spine. 2007;32(21):2365-2374.
Formula: morphology (none 0, compression 1, burst 2, distraction 3, rotation or translation 4),
disco-ligamentous complex (intact 0, indeterminate 1, disrupted 2), and neurologic status (intact 0,
root 1, complete cord 2, incomplete cord 3) sum to zero to ten, plus a separate plus-one modifier for
continuous cord compression with an ongoing deficit. Triage: three or less nonoperative, four
indeterminate, five or more operative.
Worked example: a compression injury (1) with an indeterminate disco-ligamentous complex (1), a root
deficit (1), and ongoing cord compression (plus one) totals four — indeterminate.

### CDAI — Clinical Disease Activity Index (Rheumatoid Arthritis)
Citation: Aletaha D, Nell VPK, Stamm T, et al. Acute phase reactants add little to composite disease
activity indices for rheumatoid arthritis: validation of a clinical activity score. Arthritis Res Ther.
2005;7(4):R796-R806.
Formula: CDAI = swollen-joint count (0 to 28) + tender-joint count (0 to 28) + patient global (0 to 10 cm)
+ physician global (0 to 10 cm), with no acute-phase reactant. Bands: remission at or below 2.8, low at or
below 10, moderate at or below 22, high above 22.
Worked example: 6 swollen + 8 tender + 3 patient + 2 physician sums to 19 — moderate disease activity.

### SDAI — Simplified Disease Activity Index (Rheumatoid Arthritis)
Citation: Smolen JS, Breedveld FC, Schiff MH, et al. A simplified disease activity index for rheumatoid
arthritis for use in clinical practice. Rheumatology (Oxford). 2003;42(2):244-257.
Formula: SDAI = the CDAI inputs plus CRP in mg per dL (a value reported in mg per L is ten times larger).
Bands: remission at or below 3.3, low at or below 11, moderate at or below 26, high above 26.
Worked example: 6 swollen + 8 tender + 3 patient + 2 physician + 1.5 CRP sums to 20.5 — moderate activity.

### 2010 ACR/EULAR Rheumatoid Arthritis Classification Criteria
Citation: Aletaha D, Neogi T, Silman AJ, et al. 2010 Rheumatoid arthritis classification criteria: an
American College of Rheumatology/European League Against Rheumatism collaborative initiative. Arthritis
Rheum. 2010;62(9):2569-2581.
Formula: applied after the entry condition (at least one joint with definite clinical synovitis not better
explained otherwise). The single highest level per domain — joints (0 to 5), serology (0 to 3),
acute-phase reactants (0 to 1), symptom duration (0 to 1) — sums to a maximum of ten; a score of six or
more classifies as definite rheumatoid arthritis.
Worked example: more than ten joints with at least one small (5) and symptoms at least six weeks (1) sums
to six — classify as definite rheumatoid arthritis.

### SLEDAI-2K — SLE Disease Activity Index 2000
Citation: Gladman DD, Ibanez D, Urowitz MB. Systemic lupus erythematosus disease activity index 2000.
J Rheumatol. 2002;29(2):288-291.
Formula: a weighted sum of twenty-four descriptors present in the prior ten days, weighted 8, 4, 2, and 1,
to a maximum of one hundred five. A score of six or more denotes clinically important active disease, and
a fall of four or more a meaningful improvement. SLEDAI-2K credits ongoing (not only new) rash, alopecia,
mucosal ulcers, and proteinuria.
Worked example: arthritis (4), low complement (2), and increased DNA binding (2) sums to eight — moderate
activity.

### 2015 ACR/EULAR Gout Classification Criteria
Citation: Neogi T, Jansen TLTA, Dalbeth N, et al. 2015 Gout classification criteria: an American College
of Rheumatology/European League Against Rheumatism collaborative initiative. Arthritis Rheumatol.
2015;67(10):2557-2568.
Formula: an entry criterion (at least one episode of peripheral joint or bursa swelling, pain, or
tenderness) gates the rule; monosodium-urate crystals in a symptomatic joint, bursa, or tophus classify
directly. Otherwise weighted domains — pattern (0 to 2), episode characteristics (0 to 3), time-course
(0 to 2), tophus (4), serum urate (less than 4 mg per dL is minus four, then 0, 2, 3, 4), synovial fluid
(not done 0, negative minus two), imaging urate deposition (4), imaging erosion (4) — sum to a maximum of
twenty-three; a total of eight or more classifies as gout.
Worked example: first-MTP pattern (2), two characteristics (2), recurrent episodes (2), and serum urate
8 to less than 10 mg per dL (3) sums to nine — classify as gout.

### CASPAR — Classification Criteria for Psoriatic Arthritis
Citation: Taylor W, Gladman D, Helliwell P, et al. Classification criteria for psoriatic arthritis:
development of new criteria from a large international study. Arthritis Rheum. 2006;54(8):2665-2670.
Formula: applied to a patient with established inflammatory articular disease (joint, spine, or
entheseal). Items — psoriasis (current 2, or personal or family history 1), nail dystrophy (1), negative
rheumatoid factor (1), dactylitis (1), juxta-articular new bone formation (1) — sum to a maximum of six;
the entry condition plus three or more points classifies as psoriatic arthritis.
Worked example: current psoriasis (2) and nail dystrophy (1) sums to three — classify as psoriatic
arthritis.

### 2016 Revised ACR Fibromyalgia Criteria
Citation: Wolfe F, Clauw DJ, Fitzcharles MA, et al. 2016 Revisions to the 2010/2011 fibromyalgia
diagnostic criteria. Semin Arthritis Rheum. 2016;46(3):319-329.
Formula: from the Widespread Pain Index (count of zero to nineteen painful regions) and the Symptom
Severity Scale (zero to twelve — fatigue, waking unrefreshed, and cognitive symptoms each zero to three,
plus a zero-to-three count of headaches, lower-abdominal pain, and depression). Met when WPI at least
seven and SSS at least five, or WPI four to six and SSS at least nine; and generalized pain (at least four
of five regions); and symptoms at least three months. Valid irrespective of other diagnoses.
Worked example: WPI 8, SSS 6 (fatigue 2, waking 2, cognitive 1, one somatic), generalized pain in four
regions, symptoms over three months — criteria met.

### ASDAS — Ankylosing Spondylitis Disease Activity Score
Citation: Lukas C, Landewe R, Sieper J, et al. Development of an ASAS-endorsed disease activity score
(ASDAS) in patients with ankylosing spondylitis. Ann Rheum Dis. 2009;68(1):18-24.
Formula: ASDAS-CRP = 0.12 x back pain + 0.06 x morning stiffness + 0.11 x patient global + 0.07 x
peripheral pain + 0.58 x ln(CRP+1), with CRP in mg/L floored to two. ASDAS-ESR uses item weights
0.08/0.07/0.11/0.09 plus 0.29 x sqrt(ESR). Cutoffs: inactive below 1.3, low 1.3 to under 2.1, high 2.1 to
3.5, very high above 3.5.
Worked example: back pain 4, morning stiffness 3, patient global 5, peripheral pain 2, CRP 10 mg/L gives
ASDAS-CRP 2.74 — high disease activity.

### Five-Factor Score (FFS-2011)
Citation: Guillevin L, Pagnoux C, Seror R, et al. The Five-Factor Score revisited. Medicine (Baltimore).
2011;90(1):19-27.
Formula: four poor-prognosis factors each one point — age over 65, cardiac insufficiency, gastrointestinal
involvement, renal insufficiency (stabilized peak creatinine at least 150 micromol/L) — plus the favorable
factor, absence of ENT manifestations (one point, for GPA/EGPA). Five-year mortality about nine percent at
zero, twenty-one percent at one, forty percent at two or more.
Worked example: age over 65 (1) and gastrointestinal involvement (1) gives FFS 2 — about forty percent
five-year mortality.

### 2022 ACR/EULAR Giant Cell Arteritis Classification Criteria
Citation: Ponte C, Grayson PC, Robson JC, et al. 2022 American College of Rheumatology/EULAR
classification criteria for giant cell arteritis. Ann Rheum Dis. 2022;81(12):1647-1653.
Formula: applied with age at least fifty at diagnosis. Items — positive temporal-artery biopsy or halo
sign on ultrasound (5), ESR at least 50 or CRP at least 10 mg/L (3), sudden visual loss (3), and two
points each for morning stiffness, jaw or tongue claudication, new temporal headache, scalp tenderness,
abnormal temporal artery on exam, bilateral axillary involvement, and FDG-PET activity throughout the
aorta — sum to a maximum of twenty-five; six or more classifies as giant cell arteritis.
Worked example: ESR at least 50 (3) and sudden visual loss (3), after the age entry, sums to six —
classify as giant cell arteritis.

### Palliative Prognostic Index (PPI)
Citation: Morita T, Tsunoda J, Inoue S, Chihara S. The Palliative Prognostic Index. Support Care Cancer.
1999;7(3):128-133.
Formula: sum of the Palliative Performance Scale band (at least sixty zero, thirty to fifty 2.5, ten to
twenty 4), oral intake (normal zero, moderately reduced one, mouthfuls or less 2.5), edema (1), dyspnea at
rest (3.5), and delirium (4, excluding single-medication delirium). Over six predicts survival under three
weeks; over four predicts under six weeks.
Worked example: PPS ten to twenty (4), mouthfuls or less (2.5), delirium (4) gives 10.5 — survival under
three weeks.

### Palliative Prognostic Score (PaP)
Citation: Pirovano M, Maltoni M, Nanni O, et al. A new palliative prognostic score. J Pain Symptom Manage.
1999;17(4):231-239.
Formula: sum of dyspnea (1), anorexia (1.5), Karnofsky (at least thirty zero, ten to twenty 2.5), clinical
prediction of survival in weeks (over twelve zero, eleven to twelve 2, seven to ten 2.5, five to six 4.5,
three to four 6, one to two 8.5), total WBC (normal zero, high 0.5, very high 1.5), and lymphocyte percent
(twenty to forty zero, twelve to under twenty one, under twelve 2.5). Risk groups A 0 to 5.5 (over seventy
percent thirty-day survival), B 5.6 to 11 (thirty to seventy percent), C 11.1 to 17.5 (under thirty
percent).
Worked example: dyspnea (1), anorexia (1.5), Karnofsky ten to twenty (2.5), survival three to four weeks
(6), very high WBC (1.5), very low lymphocytes (2.5) gives 15 — group C.

### Opioid Equianalgesic / Rotation Conversion
Citation: McPherson ML. Demystifying Opioid Conversion Calculations: A Guide for Effective Dosing. 2nd ed.
Bethesda, MD: ASHP; 2018 (standard equianalgesic table; oral morphine-equivalent factors cross-checked
against the CDC MME conversion-factor file and the University of Iowa equianalgesic chart).
Formula: convert the source daily dose to oral morphine equivalents (OME) using the factor table, convert
to the target opioid, then reduce twenty-five to fifty percent for incomplete cross-tolerance. Methadone
and buprenorphine are excluded (non-linear and ceiling pharmacology). A planning aid — confirm against the
institutional protocol and an independent second check.
Worked example: oral morphine 60 mg/day is 60 OME; oral oxycodone equianalgesic 40 mg/day; with a fifty
percent reduction, start 20 mg/day.

### Naranjo Adverse Drug Reaction Probability Scale
Citation: Naranjo CA, Busto U, Sellers EM, et al. A method for estimating the probability of adverse drug
reactions. Clin Pharmacol Ther. 1981;30(2):239-245.
Formula: ten weighted yes/no/do-not-know questions; the event appearing after the drug is plus two but a
No is minus one, a No on rechallenge is minus one, an alternative cause present is minus one, and a placebo
reaction is plus one or minus one. Total from minus four to plus thirteen — at most zero doubtful, one to
four possible, five to eight probable, nine or more definite.
Worked example: previous reports (1), event after the drug (2), improved on dechallenge (1), and no
alternative cause (2) sums to six — probable.

### PASI — Psoriasis Area and Severity Index
Citation: Fredriksson T, Pettersson U. Severe psoriasis — oral therapy with a new retinoid.
Dermatologica. 1978;157(4):238-244.
Formula: PASI = sum over four body regions of (erythema + induration + desquamation, each 0-4) times the
area grade 0-6 times the region weight (head 0.1, upper limbs 0.2, trunk 0.3, lower limbs 0.4). The area
grade maps the percent involved: 0 percent = 0, 1-9 = 1, 10-29 = 2, 30-49 = 3, 50-69 = 4, 70-89 = 5,
90-100 = 6. Range 0-72; bands mild below 10, moderate 10-20, severe above 20.
Worked example: head 2/2/2 at 25 percent (1.2), upper 1/1/1 at 5 percent (0.6), lower 3/3/3 at 60 percent
(14.4) gives PASI 16.2 — moderate.

### EASI — Eczema Area and Severity Index
Citation: Hanifin JM, Thurston M, Omoto M, et al. The Eczema Area and Severity Index (EASI): assessment
of reliability in atopic dermatitis. Exp Dermatol. 2001;10(1):11-18.
Formula: EASI = sum over four regions of (erythema + edema/papulation + excoriation + lichenification,
each 0-3) times the area grade 0-6 times the age-dependent region weight. Adults (8 years and older):
head 0.1, upper 0.2, trunk 0.3, lower 0.4. Children (under 8): head 0.2, upper 0.2, trunk 0.3, lower 0.3.
Range 0-72. Leshem 2015 severity strata: clear 0, almost clear 0.1-1.0, mild 1.1-7.0, moderate 7.1-21.0,
severe 21.1-50.0, very severe 50.1-72.0.
Worked example: identical intensities (head sum 3 at 25 percent, lower sum 8 at 60 percent) give EASI 13.4
with adult weights but 10.8 with child weights — the age branch matters.

### SCORAD — SCORing Atopic Dermatitis
Citation: European Task Force on Atopic Dermatitis. Severity scoring of atopic dermatitis: the SCORAD
index. Dermatology. 1993;186(1):23-31.
Formula: SCORAD = A/5 + 7B/2 + C. A is the percent body surface affected (0-100). B is six intensity
items (erythema, edema/papulation, oozing/crusting, excoriation, lichenification, dryness — dryness scored
on uninvolved skin) each 0-3, total 0-18. C is two 0-10 visual-analogue scores (pruritus, sleeplessness),
total 0-20. Range 0-103; the objective oSCORAD = A/5 + 7B/2 drops the subjective items. Bands mild below
25, moderate 25-50, severe above 50.
Worked example: A 30 (6), B 8 (28), C 8 gives SCORAD 42 — moderate; oSCORAD 34.

### DLQI — Dermatology Life Quality Index
Citation: Finlay AY, Khan GK. Dermatology Life Quality Index (DLQI) — a simple practical measure for
routine clinical use. Clin Exp Dermatol. 1994;19(3):210-216.
Formula: sum of ten questions each scored Very much 3, A lot 2, A little 1, Not at all or Not relevant 0.
Question 7 first asks whether the skin prevented work or study (Yes = 3); only otherwise is the
how-much-a-problem follow-up scored. Total 0-30: no effect 0-1, small 2-5, moderate 6-10, very large
11-20, extremely large 21-30.
Worked example: answers 2,1,1,1,1,0,0,0,0,0 sum to six — moderate effect on quality of life.

### Mifflin-St Jeor — Resting Energy Expenditure
Citation: Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for resting energy expenditure
in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247.
Formula: REE (kcal/day) = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(yr) + s, where s = +5 for males
and −161 for females. Total daily energy expenditure = REE × activity factor (sedentary 1.2, light 1.375,
moderate 1.55, very 1.725, extra 1.9).
Worked example: a 40-year-old male, 70 kg, 175 cm gives REE = 700 + 1093.75 − 200 + 5 = 1599 kcal/day.

### Harris-Benedict — Basal Energy Expenditure (revised, Roza 1984)
Citation: Harris JA, Benedict FG. A biometric study of basal metabolism in man. Proc Natl Acad Sci USA.
1918;4(12):370-373. Revised constants: Roza AM, Shizgal HM. Am J Clin Nutr. 1984;40(1):168-182.
Formula: male BEE = 88.362 + 13.397 × weight(kg) + 4.799 × height(cm) − 5.677 × age(yr); female BEE =
447.593 + 9.247 × weight + 3.098 × height − 4.330 × age. The revised Roza constants are used, not the
original 1919 form; TDEE = BEE × activity factor.
Worked example: a 40-year-old male, 70 kg, 175 cm gives BEE = 88.362 + 937.79 + 839.825 − 227.08 = 1639.

### Katch-McArdle — Basal Metabolic Rate (lean-mass)
Citation: Katch FI, McArdle WD. Nutrition, Weight Control, and Exercise. Philadelphia: Lea & Febiger.
Formula: BMR (kcal/day) = 370 + 21.6 × lean body mass(kg). Lean body mass is entered directly or derived
as weight × (1 − body-fat%/100). TDEE = BMR × activity factor.
Worked example: 80 kg at 20 percent body fat gives LBM 64 kg, BMR = 370 + 1382.4 = 1752 kcal/day.

### Penn State — Equation (ventilated REE)
Citation: Frankenfield D, Smith JS, Cooney RN. Validation of 2 approaches to predicting resting metabolic
rate in critically ill patients. JPEN J Parenter Enteral Nutr. 2004;28(4):259-264. Modified: Frankenfield
DC, et al. J Am Diet Assoc. 2009;109(9):1564-1569.
Formula: standard (2003b) RMR = Mifflin × 0.96 + Tmax(°C) × 167 + Ve(L/min) × 31 − 6212. The modified
(2010) form RMR = Mifflin × 0.71 + Tmax × 85 + Ve × 64 − 3085 applies only when BMI is at least 30 and age
at least 60; obese patients under 60 use the standard form. Mifflin uses actual body weight.
Worked example: Mifflin 1599, Tmax 38.5, Ve 9 gives 1534.8 + 6429.5 + 279 − 6212 = 2031 kcal/day (standard).

### Ireton-Jones — Energy Equation (1997 revised)
Citation: Ireton-Jones C, Jones JD. Improved equations for predicting energy expenditure in patients: the
Ireton-Jones equations. Nutr Clin Pract. 2002;17(1):29-31.
Formula: ventilator-dependent EEE = 1784 − 11 × age(yr) + 5 × weight(kg) + 244 × (male) + 239 × (trauma) +
804 × (burn). Spontaneously-breathing EEE = 629 − 11 × age + 25 × weight − 609 × (obese, BMI over 27). The
1997-revised constants are used, not the distinct 1992 set.
Worked example: a ventilated 55-year-old male, 80 kg gives 1784 − 605 + 400 + 244 = 1823 kcal/day.

### IPSS — International Prostate Symptom Score / AUA Symptom Index
Citation: Barry MJ, Fowler FJ Jr, O'Leary MP, et al. The American Urological Association symptom index for
benign prostatic hyperplasia. J Urol. 1992;148(5):1549-1557.
Formula: seven symptom questions (incomplete emptying, frequency, intermittency, urgency, weak stream,
straining, nocturia) each 0-5, summed 0-35: mild 0-7, moderate 8-19, severe 20-35. The separate quality-of-
life item (0 delighted to 6 terrible) is reported alongside and is not added into the symptom total.
Worked example: six items at 1 plus nocturia 1 gives 7 (mild); raising the first item to 2 gives 8 (moderate)
regardless of the quality-of-life value.

### IIEF-5 — Sexual Health Inventory for Men (SHIM)
Citation: Rosen RC, Cappelleri JC, Smith MD, et al. Development and evaluation of an abridged 5-item version
of the International Index of Erectile Function (IIEF-5) as a diagnostic tool for erectile dysfunction. Int J
Impot Res. 1999;11(6):319-326.
Formula: five items; item 1 scored 1-5, items 2-5 scored 0-5 (0 = no sexual activity / did not attempt
intercourse). Total banded 22-25 no erectile dysfunction, 17-21 mild, 12-16 mild-to-moderate, 8-11 moderate,
5-7 severe; a score of 21 or below meets the diagnostic threshold for erectile dysfunction.
Worked example: 4 + 4 + 4 + 4 + 3 = 19 (mild); 5 + 4 + 4 + 4 + 4 = 21 (mild, meets the ED threshold) while
5 + 5 + 4 + 4 + 4 = 22 (no erectile dysfunction).

### OABSS — Overactive Bladder Symptom Score
Citation: Homma Y, Yoshida M, Seki N, et al. Symptom assessment tool for overactive bladder syndrome —
overactive bladder symptom score. Urology. 2006;68(2):318-323.
Formula: four items — daytime frequency 0-2, nighttime frequency (nocturia) 0-3, urgency 0-5, urgency
incontinence 0-5 — summed 0-15: mild 5 or below, moderate 6-11, severe 12 or above. The overactive-bladder
definition requires the urgency item to be 2 or more and the total to be 3 or more.
Worked example: daytime 1 + nocturia 2 + urgency 3 + incontinence 2 = 8 (moderate, definition met); a total
of 6 driven by frequency with urgency 1 does not meet the definition.

### Berg Balance Scale (BBS)
Citation: Berg K, Wood-Dauphinee S, Williams JI, Maki B. Measuring balance in the elderly: validation of an
instrument. Can J Public Health. 1992;83 Suppl 2:S7-11. (Cross-verified against the Shirley Ryan AbilityLab
Rehab Measures database and StatPearls; 2 or more sources, spec-v97.)
Formula: fourteen performance tasks each scored 0 (unable) to 4 (independent and safe), summed 0-56: 0-20
wheelchair-bound / high fall risk, 21-40 walking with assistance, 41-56 independent. A total below 45 (strict)
flags increased fall risk; a score of exactly 45 sits on the lower-risk side.
Worked example: all fourteen tasks at 3 gives 42/56 (independent stratum) yet below 45, so increased fall
risk; 11 tasks at 4 gives 44 (increased risk) and one further point gives 45 (lower-risk band).

### Timed Up & Go (TUG)
Citation: Podsiadlo D, Richardson S. The Timed "Up & Go": a test of basic functional mobility for frail
elderly persons. J Am Geriatr Soc. 1991;39(2):142-148. (Cross-verified against the CDC STEADI materials and
the Shirley Ryan AbilityLab database; 2 or more sources, spec-v97.)
Formula: the measured time in seconds to rise from a chair, walk 3 m, turn, return, and sit. The CDC STEADI
program flags increased fall risk at 12 s or more; the community-dwelling cut-off is 13.5 s or more
(Shumway-Cook 2000); the original functional band rates 30 s or more as dependent in transfers/ADLs.
Worked example: 12.5 s is at or above the 12 s STEADI threshold (increased risk) but below the 13.5 s
community cut-off; 11.9 s is below the STEADI threshold and is not flagged.

### Tinetti POMA — Performance-Oriented Mobility Assessment
Citation: Tinetti ME. Performance-oriented assessment of mobility problems in elderly patients. J Am Geriatr
Soc. 1986;34(2):119-126. (28-point version; cross-verified against MDCalc and StatPearls; 2 or more sources,
spec-v97.)
Formula: a balance subscale 0-16 plus a gait subscale 0-12, summed 0-28: 18 or below high fall risk, 19-23
moderate, 24 or above low (a score of 24 is classed low per MDCalc/StatPearls). A 30-point balance variant
exists; this is the 28-point total.
Worked example: balance 12 + gait 8 = 20 (moderate); balance 10 + gait 8 = 18 (high) while balance 11 + gait
8 = 19 (moderate); balance 14 + gait 10 = 24 (low).

### Palliative Performance Scale, version 2 (PPSv2)
Citation: Anderson F, Downing GM, Hill J, et al. Palliative Performance Scale (PPS): a new tool. J Palliat
Care. 1996;12(1):5-11. (PPSv2 (c) Victoria Hospice Society, 2001; cross-verified against the Victoria Hospice
sample and the HIGN "Try This" reproduction; 2 or more sources, spec-v97.)
Formula: five columns (ambulation; activity & evidence of disease; self-care; intake; conscious level) read
left-to-right with leftward precedence, giving a level from 100% down to 0% in 10% decrements (0% = death).
Each column descriptor is consistent with a set of levels (ambulation "Full" spans 100/90/80%), so the level
is the best horizontal fit: the running candidate set is intersected column-by-column from the left, and a
rightward column that conflicts with the leftward-established set is overridden (and flagged) rather than
forcing an empty result.
Worked example: reduced ambulation + unable-normal-job + full self-care + reduced intake + full consciousness
converges to 70%; mainly-in-bed + unable-most-activity (both 40%) with full self-care (which alone would be
70% or higher) resolves to 40% by leftward precedence, flagging the self-care conflict.

### MIPI — Mantle Cell Lymphoma International Prognostic Index
Citation: Hoster E, Dreyling M, Klapper W, et al. A new prognostic index (MIPI) for patients with advanced-
stage mantle cell lymphoma. Blood. 2008;111(2):558-565. (Cross-verified against the Hoster 2008 erratum,
MDApp, and Omnicalculator; 2 or more sources, spec-v97.)
Formula: index = 0.03535 x age(yr) + 0.6978 x (1 if ECOG 2-4) + 1.367 x log10(LDH/upper-limit-of-normal) +
0.9393 x log10(WBC per microliter), banded low below 5.7, intermediate 5.7 to below 6.2, high 6.2 or above.
The WBC is the absolute count per microliter inside the log (the erratum warns that using thousands per
microliter gives the wrong result). The simplified-MIPI point table is a distinct variant; this is the
continuous biologic index.
Worked example: age 65, ECOG 0-1, LDH 300 with ULN 250 (ratio 1.2), WBC 8000 gives 2.298 + 0 + 0.108 + 3.666
= 6.07 (intermediate).

### Forrest Classification — UGI bleeding endoscopic stigmata
Citation: Forrest JA, Finlayson ND, Shearman DJ. Endoscopy in gastrointestinal bleeding. Lancet.
1974;2(7877):394-397. (Cross-verified against the Forrest-classification review PMC9139956 and GrepMed;
2 or more sources, spec-v97.)
Formula: a deterministic mapping of the endoscopic finding to a class and rebleed-risk tier — Ia active
spurting, Ib active oozing, IIa non-bleeding visible vessel (all high-risk stigmata that warrant endoscopic
therapy), IIb adherent clot (intermediate), IIc flat pigmented spot, III clean ulcer base (low-risk).
Approximate untreated rebleeding falls across the classes (Ia/Ib about 55%, IIa about 43%, IIb about 22%,
IIc about 10%, III about 5%; reported as ranges in the literature).
Worked example: IIa is a non-bleeding visible vessel, a high-risk stigma warranting endoscopic therapy, while
IIc (a flat pigmented spot) is low-risk — the IIa-to-IIc step is the rebleed-risk-tier flip.

### Wagner (Meggitt-Wagner) Diabetic Foot Ulcer Grade
Citation: Wagner FW Jr. The dysvascular foot: a system for diagnosis and treatment. Foot Ankle.
1981;2(2):64-122. (Cross-verified against WoundSource and the Wound Care Education Institute reproduction;
2 or more sources, spec-v97.)
Formula: a deterministic grade by depth/extent — 0 intact skin / at-risk foot (no open lesion), 1 superficial
ulcer, 2 deep ulcer to tendon, capsule, or bone (no abscess or osteomyelitis), 3 deep ulcer with abscess or
osteomyelitis, 4 localized (forefoot or heel) gangrene, 5 gangrene of the whole foot. Higher grades carry
poorer healing and higher amputation odds.
Worked example: a deep ulcer with osteomyelitis is grade 3, which the tile flags for surgical and vascular
evaluation, while a superficial ulcer is grade 1.

### University of Texas Diabetic Foot Ulcer Classification
Citation: Lavery LA, Armstrong DG, Harkless LB. Classification of diabetic foot wounds. J Foot Ankle Surg.
1996;35(6):528-531. Validation: Armstrong DG, Lavery LA, Harkless LB. Diabetes Care. 1998;21(5):855-859.
(Cross-verified against the PubMed 9589255 abstract and the University of Arizona record; 2 or more sources,
spec-v97.)
Formula: a two-axis grade x stage grid — grade (depth) 0 epithelialized, 1 superficial (not to tendon,
capsule, or bone), 2 to tendon or capsule, 3 to bone or joint; stage A clean, B infection, C ischemia,
D infection plus ischemia. The cell is the roman-numeral grade with the stage letter (e.g. IIB). Healing odds
fall and amputation odds rise as both axes increase (in the validation, Stage D had about 76.5% midfoot-or-
higher amputation vs about 3.5% in less advanced stages).
Worked example: a wound penetrating to tendon with infection is grade 2, stage B, i.e. cell IIB.

### BASDAI — Bath Ankylosing Spondylitis Disease Activity Index
Citation: Garrett S, Jenkinson T, Kennedy LG, Whitelock H, Gaisford P, Calin A. A new approach to defining
disease status in ankylosing spondylitis: the Bath Ankylosing Spondylitis Disease Activity Index. J Rheumatol.
1994;21(12):2286-2291. (Cross-verified against Omnicalculator, MDApp, and RheumInfo; 2 or more sources,
spec-v97.)
Formula: six patient-reported items each on a zero-to-ten scale (fatigue, spinal pain, peripheral joint
pain/swelling, enthesitis, morning-stiffness severity, morning-stiffness duration); the index is
[Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] divided by five, scored zero to ten. The two morning-stiffness items are
averaged before being added — not summed flat. An index of four or greater suggests active or suboptimally
controlled disease.
Worked example: items 4, 6, 2, 3 with morning-stiffness severity 5 and duration 7 give a stiffness average of
6, so [4 + 6 + 2 + 3 + 6] divided by five is 4.2, which is at or above the active-disease threshold.

### BASFI — Bath Ankylosing Spondylitis Functional Index
Citation: Calin A, Garrett S, Whitelock H, Kennedy LG, O'Hea J, Mallorie P, Jenkinson T. A new approach to
defining functional ability in ankylosing spondylitis: the development of the Bath Ankylosing Spondylitis
Functional Index. J Rheumatol. 1994;21(12):2281-2285. (Cross-verified against MDApp and the achawaqat scales
reference; 2 or more sources, spec-v97.)
Formula: ten items each on a zero-to-ten scale (eight daily-living tasks plus two coping items, with zero easy
and ten impossible); the index is the mean of the ten items, scored zero to ten. A higher index means poorer
function; the index has no fixed cut-point and is used to track change over time.
Worked example: items 2, 3, 4, 5, 6, 1, 2, 3, 4, 5 sum to 35, so the mean over ten items is 3.5.

### ESSDAI — EULAR Sjögren's Syndrome Disease Activity Index
Citation: Seror R, Ravaud P, Bowman SJ, et al. EULAR Sjögren's syndrome disease activity index: development of
a consensus systemic disease activity index for primary Sjögren's syndrome. Ann Rheum Dis. 2010;69(6):
1103-1109. Domain weights re-fetched from Seror R, et al. RMD Open. 2015;1:e000022 (the ESSDAI user guide) and
cross-checked against the PMC4613159 reproduction; 2 or more sources, spec-v97.
Formula: twelve systemic domains, each scored at an activity level whose printed value is already the weight
multiplied by the level, so the weighted total is the direct sum (theoretical maximum 123). Domain weights:
constitutional three, lymphadenopathy four, glandular two, articular two, cutaneous three, pulmonary five,
renal five, muscular six, peripheral nervous system five, central nervous system five, haematological two,
biological one. Structural facts that must not be normalized away: constitutional, glandular, and biological
have no high level (they top out at moderate); the central-nervous-system domain has no low level (it jumps
from none to moderate). Activity strata: low below five, moderate five to thirteen, high fourteen or above.
EULAR is not in the citation-issuer pattern, so no documentation-only staleness row is forced (the same
treatment as the spec-v147 and spec-v148 ACR/EULAR scores).
Worked example: the articular domain at moderate activity contributes four and the biological domain at low
activity contributes one, for a total of five — exactly at the low-to-moderate boundary, so it reports as
moderate systemic activity.

### Robson Ten-Group Classification System — cesarean audit
Citation: Robson MS. Classification of caesarean sections. Fetal Matern Med Rev. 2001;12(1):23-39. Endorsed by
the World Health Organization statement on caesarean section rates, 2015. (Cross-verified against the Robson
classification reference and the PMC7487109 subgroup study; 2 or more sources, spec-v97.) The World Health
Organization endorsement is recorded here, not in the tile's machine-read citation field, so the issuer
acronym does not force a staleness row; the primary citation is Robson 2001.
Formula: a deterministic mapping of parity, previous cesarean, onset of labor, fetal presentation, plurality,
and gestational age to exactly one of ten mutually-exclusive groups. Groups one through four are single
cephalic term with no previous cesarean, split by parity then onset (with the a/b sub-splits separating
induced labor from cesarean before labor); group five is single cephalic term with a previous cesarean; groups
six through ten capture nulliparous breech, multiparous breech, multiple pregnancy, transverse or oblique lie,
and preterm single cephalic deliveries, each including cases with a previous cesarean. An audit
classification, not an individual risk prediction.
Worked example: a nulliparous woman with a single cephalic fetus at term whose labor was induced, with no
previous cesarean, maps to group 2a (the induced-labor sub-split of group two).

## spec-v158 — echocardiography quantification (Subspecialty Depth program)

### LV Mass Index & Geometry (Devereux)
Citation: Devereux RB, Alonso DR, Lutas EM, et al. Echocardiographic assessment of left ventricular
hypertrophy: comparison to necropsy findings. Am J Cardiol. 1986;57(6):450-458. Geometry partitions: Lang RM,
Badano LP, Mor-Avi V, et al. Recommendations for cardiac chamber quantification by echocardiography in adults.
J Am Soc Echocardiogr. 2015;28(1):1-39. (Cross-verified against the ASE 2015 chamber-quantification guideline
and the Cardioserv LVH reference; 2 or more sources, spec-v97.) The American Society of Echocardiography is not
in the citation-issuer pattern, so no documentation-only staleness row is forced; the primary citation is the
Devereux 1986 formula.
Formula: LV mass in grams is zero-point-eight multiplied by the quantity one-point-zero-four multiplied by the
difference of the cube of the sum of LVIDd, PWTd, and IVSd minus the cube of LVIDd, plus zero-point-six, with
all linear dimensions in centimetres. The LV mass index is mass divided by body surface area. Relative wall
thickness is two multiplied by PWTd divided by LVIDd. Geometry combines the relative-wall-thickness cutoff of
zero-point-four-two with the sex-specific LV-mass-index upper-normal limit (men above 115, women above 95
grams per square metre) into four patterns: normal, concentric remodeling, eccentric hypertrophy, and
concentric hypertrophy.
Worked example: LVIDd 5.2, PWTd 1.2, IVSd 1.2, BSA 2.0, male gives LV mass 248.8 grams, index 124.4, relative
wall thickness 0.46 — an elevated index with high relative wall thickness is concentric hypertrophy.

### Left Atrial Volume Index (LAVI)
Citation: Lang RM, Badano LP, Mor-Avi V, et al. Recommendations for cardiac chamber quantification by
echocardiography in adults. J Am Soc Echocardiogr. 2015;28(1):1-39. (Cross-verified against the ASE 2015
guideline and the BioMed Central cardiovascular-ultrasound LAVI reference; 2 or more sources, spec-v97.)
Formula: by the biplane area-length method, left-atrial volume is zero-point-eight-five multiplied by the
product of the apical four-chamber and apical two-chamber LA areas divided by the shorter of the two LA
lengths; the volume index is volume divided by body surface area. Severity bands in millilitres per square
metre: normal at or below 34, mild 35 to 41, moderate 42 to 48, severe above 48.
Worked example: areas 21 and 21 square centimetres with length 5.0 centimetres and BSA 2.0 give a volume of 75
millilitres and an index of 37.5 — mildly enlarged.

### Teichholz LVEF & Fractional Shortening
Citation: Teichholz LE, Kreulen T, Herman MV, Gorlin R. Problems in echocardiographic volume determinations:
echocardiographic-angiographic correlations in the presence or absence of asynergy. Am J Cardiol.
1976;37(1):7-11. Severity bands: Lang RM, et al. J Am Soc Echocardiogr. 2015;28(1):1-39. (Cross-verified
against the ASE 2015 guideline and the e-echocardiography ejection-fraction reference; 2 or more sources,
spec-v97.)
Formula: volume is seven multiplied by the cube of the dimension divided by the sum of two-point-four and the
dimension, in centimetres; end-diastolic volume uses LVIDd and end-systolic volume uses LVIDs. Ejection
fraction is end-diastolic minus end-systolic volume divided by end-diastolic volume. Fractional shortening is
LVIDd minus LVIDs divided by LVIDd. Sex-specific normal lower limits for ejection fraction are 52 percent for
men and 54 percent for women. Teichholz is dimension-derived; biplane Simpson is preferred when wall motion is
regional.
Worked example: LVIDd 5.0 and LVIDs 3.5 in a man give ejection fraction 57 percent and fractional shortening 30
percent — normal.

### RV Systolic Pressure / PASP (TR jet)
Citation: Yock PG, Popp RL. Noninvasive estimation of right ventricular systolic pressure by Doppler
ultrasound in patients with tricuspid regurgitation. Circulation. 1984;70(4):657-662. (Cross-verified against
the ASE 2015 right-atrial-pressure estimation table and the POCUS101 right-ventricle reference; 2 or more
sources, spec-v97.)
Formula: right ventricular systolic pressure is four multiplied by the square of the peak tricuspid
regurgitation velocity in metres per second, plus the right-atrial pressure; it equals the pulmonary-artery
systolic pressure in the absence of pulmonic stenosis or right-ventricular-outflow-tract obstruction.
Right-atrial pressure is estimated from the inferior vena cava: a small or collapsing vena cava 3, intermediate
8, dilated or non-collapsing 15 millimetres of mercury.
Worked example: a peak velocity of 2.8 metres per second with a right-atrial pressure of 8 gives a pressure of
39.4 millimetres of mercury.

### E/e′ (LV Filling-Pressure Estimate)
Citation: Nagueh SF, Smiseth OA, Appleton CP, et al. Recommendations for the evaluation of left ventricular
diastolic function by echocardiography. J Am Soc Echocardiogr. 2016;29(4):277-314. (Cross-verified against the
ASE 2016 diastolic-function summary and the JAHA validation study PMC8649534; 2 or more sources, spec-v97.)
Formula: the ratio of mitral-inflow early-diastolic velocity to the tissue-Doppler e-prime velocity, both in
centimetres per second. For the average of septal and lateral e-prime, a ratio below 9 is normal, 9 to 14 is
indeterminate, and above 14 indicates elevated left-ventricular filling pressure. Single-site cutoffs for
elevated filling pressure are septal above 15 and lateral above 13. The average is preferred when both walls
are sampled.
Worked example: a mitral E of 90 and an averaged e-prime of 6 give a ratio of 15 — above 14, so elevated left
ventricular filling pressure.

## spec-v159 — neuro & spine disability classification (Subspecialty Depth program)

### EDSS — Expanded Disability Status Scale
Citation: Kurtzke JF. Rating neurologic impairment in multiple sclerosis: an expanded disability status scale
(EDSS). Neurology. 1983;33(11):1444-1452. (Cross-verified against the Neurostatus definitions and the National
MS Society EDSS form; 2 or more sources, spec-v97.)
Formula: a zero-to-ten scale in half-point steps. The low range follows the eight Functional-System grades
(pyramidal, cerebellar, brainstem, sensory, bowel and bladder, visual, cerebral, other); the four-to-nine-point-five
range follows ambulation. Because a precise grade-to-step rating is not fully algorithmic, the tile uses the
standard simplified Functional-System count table for the low range and the authoritative ambulation anchors
above, reporting the higher of the two. Ambulation anchors: four points is five hundred metres without aid; six
points is unilateral assistance for one hundred metres; six-point-five is bilateral assistance for twenty
metres; seven points is wheelchair; eight points is restricted to bed or chair; nine points is bed-bound; ten
is death. A definitive rating uses a trained Neurostatus assessment.
Worked example: unilateral assistance to walk one hundred metres pins the score at six points regardless of a
low Functional-System total.

### ASIA Impairment Scale
Citation: Kirshblum SC, Burns SP, Biering-Sorensen F, et al. International Standards for Neurological
Classification of Spinal Cord Injury (revised 2011). J Spinal Cord Med. 2011;34(6):535-546. (Cross-verified
against the Classifications in Brief review PMC5384910 and the SCIRE Project reference; 2 or more sources,
spec-v97.)
Formula: grade A is complete with no sensory or motor function in the sacral segments; grade B is sensory
incomplete with sacral sparing but no motor function below the level; grade C is motor incomplete with fewer
than half of the key muscles below the level at grade three or above; grade D is motor incomplete with at least
half at grade three or above; grade E is normal in a patient with a prior documented deficit. Sacral sparing is
the complete-versus-incomplete gate; the proportion of key muscles is the C-versus-D gate. The tile reports the
grade from the exam findings and does not re-derive the full dermatome and myotome worksheet.
Worked example: sacral sparing with motor function preserved below the level but fewer than half of the key
muscles at grade three gives grade C.

### mJOA — modified Japanese Orthopaedic Association score
Citation: Benzel EC, Lancon J, Kesterson L, Hadden T. Cervical laminectomy and dentate ligament section for
cervical spondylotic myelopathy. J Spinal Disord. 1991;4(3):286-295. (Eighteen-point form; severity bands per
Kato and Tetreault; cross-verified against the Edge Mobility point text and the PMC8208946 validation; 2 or
more sources, spec-v97.)
Formula: four domains — motor upper extremity zero to five, motor lower extremity zero to seven, sensory upper
extremity zero to three, sphincter zero to three — summed to zero to eighteen. Higher is better (eighteen is no
dysfunction), the opposite of most scores. Severity: mild fifteen or above, moderate twelve to fourteen, severe
eleven or below.
Worked example: motor upper four, motor lower five, sensory two, sphincter two sum to thirteen — moderate
cervical myelopathy.

### Nurick Grade
Citation: Nurick S. The pathogenesis of the spinal cord disorder associated with cervical spondylosis. Brain.
1972;95(1):87-100. (Cross-verified against Physiopedia's Nurick classification and the StatPearls
cervical-myelopathy reference; 2 or more sources, spec-v97.)
Formula: a gait-focused zero-to-five ordinal scale — zero root signs with no cord involvement; one cord signs
with normal gait; two mild gait difficulty, fully employed; three gait difficulty preventing employment; four
walks only with assistance; five chairbound or bedridden.
Worked example: gait difficulty that prevents full-time employment but still allows unaided walking is grade
three.

## spec-v160 — rheumatology activity & SLE classification (Subspecialty Depth program)

### RAPID3 — Routine Assessment of Patient Index Data 3
Citation: Pincus T, Swearingen CJ, Bergman M, Yazici Y. RAPID3, an index of physical function, pain, and
global status as vital signs, compared to ACR20 and DAS28. Bull NYU Hosp Jt Dis. 2009;67(2):211-225. (Scale
form Pincus, J Rheumatol 2008;35(11):2136-2147; cross-verified against The Rheumatologist MDHAQ review; 2 or
more sources, spec-v97.)
Formula: three patient-reported components, each on a zero-to-ten scale — physical function from the ten-item
MDHAQ (each item zero to three, summed zero to thirty, then divided by three), pain, and patient global —
summed to a zero-to-thirty index. Categories: near-remission at or below three, low three-point-one to six,
moderate six-point-one to twelve, high above twelve.
Worked example: a function sum of eighteen (so six after dividing by three) plus pain four plus global five is
fifteen — high severity.

### DAPSA — Disease Activity in Psoriatic Arthritis
Citation: Schoels MM, Aletaha D, Alasti F, Smolen JS. Disease activity in psoriatic arthritis (DAPSA):
defining remission and treatment success. Ann Rheum Dis. 2016;75(5):811-818. (Cutoffs Schoels 2010;
cross-verified against the Q-DAPSA validation and Medscape psoriatic-arthritis cutoffs; 2 or more sources,
spec-v97.)
Formula: the sixty-eight-joint tender count plus the sixty-six-joint swollen count plus patient global on a
zero-to-ten scale plus pain on a zero-to-ten scale plus C-reactive protein in milligrams per decilitre. The
protein is in milligrams per decilitre, not milligrams per litre — a per-litre value would inflate the index
roughly tenfold. Cutoffs: remission at or below four, low five to fourteen, moderate fifteen to twenty-eight,
high above twenty-eight.
Worked example: tender five, swollen three, global four, pain four, protein one-point-two give an index of
seventeen-point-two — moderate disease activity.

### SLICC 2012 SLE Classification Criteria
Citation: Petri M, Orbai AM, Alarcon GS, et al. Derivation and validation of the Systemic Lupus International
Collaborating Clinics classification criteria for systemic lupus erythematosus. Arthritis Rheum.
2012;64(8):2677-2686. (Cross-verified against MDCalc and the Frontiers in Immunology 2022 review; 2 or more
sources, spec-v97.)
Formula: eleven clinical and six immunologic criteria. The patient is classified as having lupus when at least
four criteria are met with at least one clinical and at least one immunologic, or when biopsy-proven lupus
nephritis is present together with a positive antinuclear or anti-double-stranded-DNA antibody (the shortcut
pathway, which can classify with fewer than four total criteria).
Worked example: three clinical criteria plus one immunologic criterion meets the count pathway.

### 2019 EULAR/ACR SLE Classification Criteria
Citation: Aringer M, Costenbader K, Daikh D, et al. 2019 European League Against Rheumatism / American College
of Rheumatology classification criteria for systemic lupus erythematosus. Arthritis Rheumatol.
2019;71(9):1400-1412. (Every weight cross-verified against the Merck Manual professional table and the Aringer
full text; 2 or more sources, spec-v97; zero discrepancies. The issuing societies are spelled out so the
machine-read citation does not force a staleness row.)
Formula: a positive antinuclear antibody at one-to-eighty or higher, ever, is a hard entry gate. Across seven
clinical and three immunologic domains, only the single highest-weighted item per domain counts. The patient
is classified as having lupus when the entry criterion is met, the weighted total is at least ten, and at least
one clinical criterion is present. Weights: fever two; leukopenia three, thrombocytopenia four, autoimmune
hemolysis four; delirium two, psychosis three, seizure five; non-scarring alopecia two, oral ulcers two,
subacute cutaneous or discoid four, acute cutaneous six; serous effusion five, acute pericarditis six; joint
involvement six; proteinuria four, renal biopsy class two or five is eight, renal biopsy class three or four is
ten; antiphospholipid antibodies two; low C3 or C4 three, low C3 and C4 four; anti-double-stranded-DNA or
anti-Smith antibody six.
Worked example: the entry criterion plus joint involvement (six) plus an anti-double-stranded-DNA antibody
(six) gives a weighted total of twelve, which classifies.

## spec-v161 — endocrine, metabolic & nutrition-support math (Subspecialty Depth program)

### Aldosterone-Renin Ratio (primary-aldosteronism screen)
Citation: Funder JW, Carey RM, Mantero F, et al. The management of primary aldosteronism: case detection,
diagnosis, and treatment — an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab.
2016;101(5):1889-1916. (Cross-verified against the aldosterone-to-renin meta-analysis and ARUP Consult; 2 or
more sources, spec-v97. The Endocrine Society is not in the machine-read issuer pattern, so no staleness row is
forced.)
Formula: the ratio of plasma aldosterone concentration in nanograms per decilitre to renin. Renin is reported
either as plasma renin activity in nanograms per millilitre per hour or as a direct renin concentration in
milli-international units per litre. The screening cutoff differs by renin unit and is never compared across
unit systems: with plasma renin activity the cutoff is roughly twenty to forty (a representative thirty) with
aldosterone at or above fifteen nanograms per decilitre, and with direct renin concentration the cutoff is
about three-point-seven. A positive screen warrants confirmatory testing, not a diagnosis.
Worked example: aldosterone twenty-two divided by a plasma renin activity of zero-point-five gives a ratio of
forty-four, which with adequate aldosterone is a positive screen.

### Calcium-Phosphate Product (CKD-MBD)
Citation: Kidney Disease: Improving Global Outcomes (KDIGO) CKD-MBD Work Group. KDIGO clinical practice
guideline for CKD-MBD. Kidney Int Suppl. 2009;(113):S1-130 (updated 2017). (Historical target from KDOQI 2003;
cross-verified against the KDIGO 2017 summary and the KDOQI targets review; 2 or more sources, spec-v97. KDIGO
matches the issuer pattern, so a documentation-only staleness row is recorded.)
Formula: serum calcium in milligrams per decilitre multiplied by serum phosphate in milligrams per decilitre,
in squared milligrams per squared decilitre. A product above fifty-five was a historical caution threshold.
Contemporary KDIGO guidance favors tracking calcium and phosphate individually over the product, so the product
is context rather than a target. SI conversion: calcium milligrams per decilitre equals millimoles per litre
times four-point-zero-zero-eight; phosphate equals millimoles per litre times three-point-zero-nine-seven.
Worked example: calcium nine-point-five times phosphate six-point-zero gives fifty-seven, above the historical
fifty-five caution threshold.

### Free Thyroxine Index (FTI / T7)
Citation: Clark F, Horn DB. Assessment of thyroid function by the combined use of the serum protein-bound
iodine and resin uptake of triiodothyronine. J Clin Endocrinol Metab. 1965;25(1):39-45. (Cross-verified
against the ScienceDirect Free Thyroxine Index overview and the LOINC FTI-variants brief; 2 or more sources,
spec-v97.)
Formula: total thyroxine multiplied by the ratio of the patient's T3-resin uptake percentage to the
reference-mean T3-resin uptake percentage, the latter defaulting to thirty percent (normal uptake is about
twenty-five to thirty-five percent). The index corrects total thyroxine for thyroid-binding-globulin changes:
pregnancy and estrogen raise the binding globulin and total thyroxine, but the index stays normal. It is a
legacy measure used where a direct free-thyroxine immunoassay is unavailable.
Worked example: total thyroxine twelve times the ratio of a twenty-five percent uptake to a thirty percent
reference gives an index of ten.

### Nitrogen Balance (nutrition support)
Citation: American Society for Parenteral and Enteral Nutrition (ASPEN) nutrition-support core curriculum.
(Cross-verified against the Practical Gastroenterology nitrogen-balance review and the Harvard MEEI
nitrogen-balance reference; 2 or more sources, spec-v97.)
Formula: the twenty-four-hour protein intake in grams divided by six-point-two-five, minus the sum of the
twenty-four-hour urine urea nitrogen in grams and an insensible-loss constant defaulting to four grams per day.
The six-point-two-five factor reflects protein being about sixteen percent nitrogen, so that amount of protein
carries one gram of nitrogen. A positive balance is anabolic, a negative balance catabolic. The calculation
needs a complete twenty-four-hour urine collection and is unreliable in significant renal impairment.
Worked example: a protein intake of one hundred grams (sixteen grams of nitrogen) minus a urine urea nitrogen
of eight plus an insensible four gives a balance of plus four grams per day, which is anabolic.

### Fagan Post-Test Probability (likelihood ratio)
Citation: Fagan TJ. Nomogram for Bayes theorem. N Engl J Med. 1975;293(5):257. (Cross-verified against standard evidence-based-medicine texts and the odds-form derivation; 2 or more sources, spec-v97.)
Formula: Pre-test odds equal the pre-test probability divided by one minus that probability; post-test odds equal the pre-test odds multiplied by the likelihood ratio; the post-test probability is the post-test odds divided by one plus the post-test odds. It is computed in odds space so that extreme pre-test probabilities with a large likelihood ratio cannot leak a non-finite value. Entering sensitivity and specificity instead derives the positive likelihood ratio as sensitivity over one minus specificity and the negative as one minus sensitivity over specificity.
Worked example: A pre-test probability of twenty percent with a positive likelihood ratio of ten gives a post-test probability of about seventy-one percent.

### Diagnostic Test 2x2 (sensitivity, specificity, predictive values, likelihood ratios)
Citation: Altman DG, Bland JM. Diagnostic tests 1: sensitivity and specificity; 2: predictive values. BMJ. 1994;308:1552; 309:102. (Cross-verified against standard biostatistics references; 2 or more sources, spec-v97.)
Formula: From the four cells of a two-by-two table: sensitivity is true positives over diseased, specificity is true negatives over non-diseased, positive predictive value is true positives over test-positives, negative predictive value is true negatives over test-negatives, and the likelihood ratios follow from sensitivity and specificity. The sample predictive values reflect the study prevalence; an optional target prevalence recomputes them by Bayes so they are not assumed to transfer to a different population.
Worked example: Ninety true positives, ten false positives, ten false negatives, and ninety true negatives give a sensitivity and specificity of ninety percent each and a positive likelihood ratio of nine; at a target prevalence of five percent the positive predictive value recomputes to about thirty-two percent.

### Number Needed to Treat / Absolute Risk Reduction
Citation: Laupacis A, Sackett DL, Roberts RS. An assessment of clinically useful measures of the consequences of treatment. N Engl J Med. 1988;318(26):1728-1733. (Cross-verified against standard evidence-based-medicine references; 2 or more sources, spec-v97.)
Formula: Absolute risk reduction is the control event rate minus the experimental event rate; relative risk reduction is the absolute risk reduction over the control rate; relative risk is the experimental over the control rate; the number needed to treat is the reciprocal of the absolute risk reduction, rounded up to whole patients. When the experimental rate exceeds the control rate the result is a number needed to harm, and an absolute risk reduction of zero is reported as no measurable difference.
Worked example: A control event rate of twenty percent and an experimental rate of fifteen percent give an absolute risk reduction of five percent and a number needed to treat of twenty.

### IOL Power (SRK II)
Citation: Sanders DR, Retzlaff J, Kraff MC. Comparison of the SRK II formula and other second-generation formulas. J Cataract Refract Surg. 1988;14(2):136-141. (Base coefficients and the axial-length adjustment cross-verified against StatPearls, the American Academy of Ophthalmology, and Wikipedia; 2 or more sources, spec-v97.)
Formula: The intraocular-lens power equals the adjusted A-constant minus nine-tenths of the average keratometry minus two and one-half times the axial length. The A-constant is adjusted for axial length: plus three below twenty millimetres, plus two from twenty to twenty-one, plus one from twenty-one to twenty-two, zero from twenty-two to twenty-four and a half, and minus one-half at or above twenty-four and a half. A regression formula superseded by optical formulas; it does not replace device biometry.
Worked example: An A-constant of one hundred eighteen and four-tenths with an axial length of twenty-three and a half millimetres and average keratometry of forty-four dioptres gives an emmetropic power of about twenty dioptres.

### Visual Acuity Converter (Snellen / logMAR / decimal)
Citation: Holladay JT. Visual acuity measurements. J Cataract Refract Surg. 2004;30(2):287-290. (Cross-verified against standard optometric references; 2 or more sources, spec-v97.)
Formula: The logMAR value is the base-ten logarithm of the Snellen denominator over twenty, equivalently the negative base-ten logarithm of the decimal acuity; the decimal acuity is twenty over the denominator. The imperial twenty-over and metric six-over notations express the same ratio. Normal acuity of twenty-over-twenty is a decimal of one and a logMAR of zero.
Worked example: Snellen twenty-over-forty equals a decimal of one-half and a logMAR of three-tenths, the same as metric six-over-twelve.

### Ocular Perfusion Pressure (OPP)
Citation: Costa VP, Harris A, Anderson D, et al. Ocular perfusion pressure in glaucoma. Acta Ophthalmol. 2014;92(4):e252-266. (Cross-verified against glaucoma-physiology references; 2 or more sources, spec-v97.)
Formula: The mean arterial pressure is the diastolic pressure plus one-third of the pulse pressure; the mean ocular perfusion pressure is two-thirds of the mean arterial pressure minus the intraocular pressure; the systolic and diastolic ocular perfusion pressures are the respective blood pressures minus the intraocular pressure. A low mean value is one of several vascular associations with glaucoma risk.
Worked example: A blood pressure of one-twenty over eighty with an intraocular pressure of fifteen gives a mean ocular perfusion pressure of about forty-seven, which is low.

### ACR TI-RADS (Thyroid Nodule)
Citation: Tessler FN, Middleton WD, Grant EG, et al. ACR Thyroid Imaging, Reporting and Data System. J Am Coll Radiol. 2017;14(5):587-595. (Point table, level bands, and biopsy size rules cross-verified against the Radiology Assistant TI-RADS guide and the RSNA User Guide; 2 or more sources, spec-v97.)
Formula: Points sum across composition, echogenicity, shape, margin, and echogenic foci, where the foci points are additive rather than a maximum. A total of zero is level one, one to two is level two, three is level three, four to six is level four, and seven or more is level five. The biopsy and follow-up size thresholds fall as the level rises.
Worked example: A solid, very hypoechoic nodule with punctate echogenic foci scores eight points, placing it at the highest level, and a maximum diameter of one and a half centimetres meets the biopsy threshold.

### Adrenal CT Washout (adenoma vs non-adenoma)
Citation: Caoili EM, Korobkin M, Francis IR, et al. Adrenal masses: characterization with combined unenhanced and delayed enhanced CT. Radiology. 2002;222(3):629-633. (Cross-verified against standard adrenal-imaging references; 2 or more sources, spec-v97.)
Formula: The absolute washout is the enhanced minus delayed attenuation over the enhanced minus unenhanced attenuation, as a percentage; sixty percent or more indicates a lipid-poor adenoma. The relative washout is the enhanced minus delayed over the enhanced attenuation; forty percent or more indicates an adenoma when no unenhanced scan is available. An unenhanced attenuation of ten Hounsfield units or less already indicates a lipid-rich adenoma.
Worked example: Enhanced eighty, delayed thirty-five, and unenhanced fifteen Hounsfield units give an absolute washout of about sixty-nine percent, a lipid-poor adenoma.

### Bosniak Classification (renal cyst, 2019)
Citation: Silverman SG, Pedrosa I, Ellis JH, et al. Bosniak classification of cystic renal masses, version 2019. Radiology. 2019;292(2):475-488. (Cross-verified against the Radiology Assistant Bosniak-2019 page and a peer-reviewed update; 2 or more sources, spec-v97.)
Formula: The class is set by the most significant feature: an enhancing nodule gives class four; thick wall or septa or a small obtuse protrusion gives class three; minimal three-millimetre thickening or four or more thin enhancing septa gives class two-F; one to three thin septa or any calcification gives class two; and a thin smooth wall gives class one. Calcification never upgrades the class in the 2019 version.
Worked example: A thick enhancing wall places a cystic renal mass at class three, with an approximate malignancy likelihood of one-half.

### CT Effective Dose (DLP times k)
Citation: AAPM Report 96 / EUR 16262 conversion coefficients. (Adult region factors cross-verified across two independent CT-dose references citing AAPM Report 96; 2 or more sources, spec-v97.)
Formula: The effective dose in millisieverts is the dose-length product in milligray-centimetres multiplied by a region conversion factor. The adult factors are about two-thousandths for head, three-thousandths for head and neck, six-thousandths for neck, fourteen-thousandths for chest, and fifteen-thousandths for abdomen and for pelvis. It is a population estimate, not patient-specific organ dosimetry.
Worked example: A chest study with a dose-length product of four hundred milligray-centimetres gives an effective dose of about five and six-tenths millisieverts.

### Pharmacokinetics Suite (loading / maintenance / half-life)
Citation: Rowland M, Tozer TN. Clinical Pharmacokinetics and Pharmacodynamics. 4th ed. (First-order relations cross-verified against standard pharmacokinetic references; 2 or more sources, spec-v97.)
Formula: The loading dose is the volume of distribution times the target concentration over bioavailability; the maintenance dose per interval is clearance times the steady-state concentration times the interval over bioavailability; the elimination rate constant is clearance over volume of distribution; the half-life is point-six-nine-three times volume over clearance; the time to steady state is about five half-lives. Each relation is computed only when its inputs are supplied.
Worked example: A volume of distribution of fifty litres and a clearance of five litres per hour give a half-life of about seven hours and a time to steady state of about thirty-five hours.

### Antipsychotic Chlorpromazine Equivalents
Citation: Woods SW. Chlorpromazine equivalent doses for the newer atypical antipsychotics. J Clin Psychiatry. 2003;64(6):663-667. (Each agent factor confirmed across the Woods abstract, the chlorpromazineR package encoding, and the Andreasen comparison; 2 or more sources, spec-v97.)
Formula: The chlorpromazine-equivalent dose is the daily dose times one hundred over the agent factor, where the factor is the daily milligram dose equivalent to one hundred milligrams of chlorpromazine: chlorpromazine one hundred, haloperidol two, risperidone two, olanzapine five, quetiapine seventy-five, ziprasidone sixty, aripiprazole seven and a half. Equivalence methods differ, so the method is named and the result is an approximation.
Worked example: Haloperidol ten milligrams per day is approximately five hundred milligrams of chlorpromazine equivalent.

### Mean Airway Pressure (Pmaw)
Citation: Marini JJ, Ravenscraft SA. Mean airway pressure: physiologic determinants and clinical importance. Crit Care Med. 1992;20(11):1604-1616. (Cross-verified against standard mechanical-ventilation references; 2 or more sources, spec-v97.)
Formula: The mean airway pressure is the peak inspiratory pressure times the inspiratory time plus the positive end-expiratory pressure times the expiratory time, divided by the sum of the two times. It is the square-wave approximation and is a determinant of oxygenation that feeds the oxygenation index.
Worked example: A peak pressure of thirty, end-expiratory pressure of five, inspiratory time of one second, and expiratory time of two seconds give a mean airway pressure of about thirteen.

### Cerebroplacental Ratio (CPR)
Citation: Gramellini D, Folli MC, Raboni S, et al. Cerebral-umbilical Doppler ratio as a predictor of adverse perinatal outcome. Obstet Gynecol. 1992;79(3):416-420. (Cross-verified against fetal-Doppler references; 2 or more sources, spec-v97.)
Formula: The cerebroplacental ratio is the middle-cerebral-artery pulsatility index over the umbilical-artery pulsatility index. A ratio below one, or below the gestational-age centile, indicates cerebral redistribution, or brain-sparing, and is associated with adverse perinatal outcome.
Worked example: A middle-cerebral-artery index of one and two-tenths over an umbilical index of one and one-half gives a ratio of eight-tenths, indicating redistribution.

### Toe-Brachial Index (TBI)
Citation: Aboyans V, Criqui MH, Abraham P, et al. Measurement and interpretation of the ankle-brachial index. Circulation. 2012;126(24):2890-2909. (Cross-verified against vascular-medicine references; 2 or more sources, spec-v97.)
Formula: The toe-brachial index is the toe systolic pressure over the higher brachial systolic pressure. A value below seven-tenths is abnormal and supports peripheral arterial disease; it is the test of choice when the ankle-brachial index is non-compressible above one and four-tenths.
Worked example: A toe pressure of fifty over a brachial pressure of one-twenty gives an index of about four-tenths, which is abnormal.

### Stool Osmotic Gap
Citation: Eherer AJ, Fordtran JS. Fecal osmotic gap and pH in experimental diarrhea of various causes. Gastroenterology. 1992;103(2):545-551. (Cross-verified against standard gastroenterology references; 2 or more sources, spec-v97.)
Formula: The stool osmotic gap is two hundred ninety minus twice the sum of stool sodium and potassium, using a fixed fecal osmolality of two hundred ninety milliosmoles per kilogram. A gap above one hundred indicates osmotic diarrhea, below fifty secretory, and in between indeterminate.
Worked example: A stool sodium of thirty and potassium of fifteen give a gap of two hundred, indicating osmotic diarrhea.

### Pure Tone Average (PTA)
Citation: Standard four-frequency pure-tone average (AAO-HNS / ASHA hearing-loss grading). (Severity bands cross-verified across audiometric references; 2 or more sources, spec-v97.)
Formula: The three-frequency average is the mean of the air-conduction thresholds at five hundred, one thousand, and two thousand hertz; the four-frequency average adds four thousand hertz. Severity in decibels of hearing level is normal at twenty-five or less, mild to forty, moderate to fifty-five, moderately severe to seventy, severe to ninety, and profound above ninety.
Worked example: Thresholds of forty, forty-five, fifty, and sixty-five give a four-frequency average of fifty, a moderate hearing loss.

### Rutgeerts Score (post-op Crohn endoscopic recurrence)
Citation: Rutgeerts P, Geboes K, Vantrappen G, et al. Predictability of the postoperative course of Crohn disease. Gastroenterology. 1990;99(4):956-963. (Grade definitions and the recurrence threshold cross-verified against IBD-endoscopy references; 2 or more sources, spec-v97.)
Formula: The neoterminal-ileum endoscopic grade runs from i-zero, no lesions, through i-one, five or fewer aphthous lesions, i-two, more than five aphthous lesions with normal mucosa between or lesions confined to the anastomosis, i-three, diffuse aphthous ileitis, to i-four, diffuse inflammation with large ulcers, nodules, or stenosis. A grade of i-two or higher predicts clinical recurrence.
Worked example: A grade of i-two predicts clinical recurrence, whereas i-one is low risk.

### BIMS (Brief Interview for Mental Status, MDS 3.0)
Citation: Saliba D, Buchanan J, Edelen MO, et al. MDS 3.0: brief interview for mental status. J Am Med Dir Assoc. 2012. (Item scoring per the CMS MDS 3.0 Section C form; cross-verified across two or more sources, spec-v97.)
Formula: The summary score, from zero to fifteen, sums word repetition (zero to three), temporal orientation for year (zero to three), month (zero to two), and day of week (zero to one), and delayed recall of three words with partial credit (two spontaneous, one after a category cue, zero not recalled). Thirteen to fifteen is cognitively intact, eight to twelve moderately impaired, and zero to seven severely impaired.
Worked example: Repetition three, year three, month two, day one, and recall two, two, and zero give a summary of thirteen, cognitively intact.

### AD8 Dementia Screening Interview
Citation: Galvin JE, Roe CM, Powlishta KK, et al. The AD8: a brief informant interview to detect dementia. Neurology. 2005. (Washington University Knight ADRC; cross-verified across two or more sources, spec-v97.)
Formula: The total, from zero to eight, counts the informant items endorsed as a change due to thinking or memory problems. Zero to one is normal; two or more suggests cognitive impairment warranting further evaluation.
Worked example: Two endorsed items give a total of two, which suggests cognitive impairment, whereas one is normal.

### CDR Sum of Boxes (dementia staging)
Citation: Morris JC. The Clinical Dementia Rating (CDR): current version and scoring rules. Neurology. 1993. Staging ranges: O'Bryant SE, et al. Arch Neurol. 2008. (Cross-verified against the WashU CDR scoring rules; two or more sources, spec-v97.)
Formula: The sum of boxes, from zero to eighteen, adds the six CDR boxes: memory, orientation, judgment and problem-solving, community affairs, and home and hobbies (each zero, one-half, one, two, or three) and personal care (zero, one, two, or three, with no one-half level). A sum of zero is no dementia; one-half to four is questionable to very mild; four and one-half to nine is mild; nine and one-half to fifteen and one-half is moderate; sixteen to eighteen is severe.
Worked example: Memory one, orientation one, judgment one-half, community one, home and hobbies one, and personal care zero give a sum of four and one-half, mild dementia.

### Nu-DESC (Nursing Delirium Screening Scale)
Citation: Gaudreau JD, Gagnon P, Harel F, Tremblay A, Roy MA. Fast, systematic, and continuous delirium assessment in hospitalized patients: the nursing delirium screening scale. J Pain Symptom Manage. 2005. (Cross-verified across two or more sources, spec-v97.)
Formula: Five features observed over a nursing shift (disorientation, inappropriate behavior, inappropriate communication, illusions or hallucinations, and psychomotor retardation) are each rated zero, one, or two, summing to a total of zero to ten. A total of two or more is a positive screen for delirium.
Worked example: Disorientation one and inappropriate behavior one, the rest zero, give a total of two, a positive delirium screen.

### DOSS (Delirium Observation Screening Scale)
Citation: Schuurmans MJ, Shortridge-Baggett LM, Duursma SA. The Delirium Observation Screening Scale: a screening instrument for delirium. Res Theory Nurs Pract. 2003. (Thirteen-item short form; cross-verified across two or more sources, spec-v97.)
Formula: Thirteen behaviors observed over a shift are each scored present (one) or absent (zero), summing to a total of zero to thirteen; a total of three or more suggests delirium. Three items (attention, time-of-day orientation, and recent recall) are reverse-scored on the original form and are phrased in their abnormal direction so a present answer scores one.
Worked example: Three behaviors present give a total of three, which suggests delirium, whereas two is below the cut.

### Cornell Scale for Depression in Dementia
Citation: Alexopoulos GS, Abrams RC, Young RC, Shamoian CA. Cornell Scale for Depression in Dementia. Biol Psychiatry. 1988. (Cross-verified against the Cornell administration-and-scoring form; two or more sources, spec-v97.)
Formula: Nineteen items across five domains (mood-related signs, behavioral disturbance, physical signs, cyclic functions, and ideational disturbance) are each rated absent (zero), mild or intermittent (one), or severe (two); an item that cannot be evaluated scores zero and is reported as unrated. The total runs zero to thirty-eight: above ten suggests probable major depression and above eighteen definite major depression. Built for moderate-to-severe dementia, where self-report mood scales are not valid.
Worked example: Five items severe and one mild give a total of eleven, probable major depression.

### interRAI Aggressive Behavior Scale (ABS)
Citation: Perlman CM, Hirdes JP. The Aggressive Behavior Scale: a new scale to measure aggression based on the Minimum Data Set. J Am Geriatr Soc. 2008. (Cross-verified against the CIHI interRAI job aid; two or more sources, spec-v97.)
Formula: Four behaviors (verbal abuse, physical abuse, socially inappropriate or disruptive behavior, and resisting care) are each rated on the seven-day frequency scale from zero (not exhibited) to three (daily), summing to a total of zero to twelve. The original scale defines no named bands; a secondary nursing-home convention reads zero as none, one to two mild, three to five moderate, and six to twelve severe.
Worked example: Verbal abuse one and physical abuse two give a total of three, the moderate band.

### Cohen-Mansfield Agitation Inventory (CMAI)
Citation: Cohen-Mansfield J, Marx MS, Rosenthal AS. A description of agitation in a nursing home. J Gerontol. 1989. (Twenty-nine-item long form; cross-verified against the nineteen ninety-one CMAI manual; two or more sources, spec-v97.)
Formula: Twenty-nine agitated behaviors are each rated for frequency over the prior two weeks from one (never) to seven (several times an hour), summing to a total of twenty-nine to two hundred three. The floor is twenty-nine, not zero. The CMAI manual advises against a total severity cut-point; it is a frequency quantifier, also read by its three factor subscales (aggressive, physically non-aggressive, and verbally agitated).
Worked example: Every behavior rated never gives the floor total of twenty-nine; every behavior rated several times an hour gives the ceiling of two hundred three.

### Abbey Pain Scale
Citation: Abbey J, Piller N, De Bellis A, et al. The Abbey pain scale: a 1-minute numerical indicator for people with end-stage dementia. Int J Palliat Nurs. 2004. (Cross-verified against the geriatricpain.org administration form; two or more sources, spec-v97.)
Formula: Six items observed in people with end-stage dementia (vocalization, facial expression, change in body language, behavioural change, physiological change, and physical change) are each rated zero (absent), one (mild), two (moderate), or three (severe), summing to a total of zero to eighteen. The total maps to no pain (zero to two), mild (three to seven), moderate (eight to thirteen), or severe (fourteen or more).
Worked example: Four items rated two and two rated zero give a total of eight, the moderate band, at the boundary above the mild range.

### CNPI (Checklist of Nonverbal Pain Indicators)
Citation: Feldt KS. The checklist of nonverbal pain indicators (CNPI). Pain Manag Nurs. 2000. (Cross-verified against the geriatricpain.org form; two or more sources, spec-v97.)
Formula: Six behaviours (nonverbal vocal complaints, facial grimacing or wincing, bracing, restlessness, rubbing, and verbal vocal complaints) are each scored present (one) or absent (zero), observed separately at rest and with movement. The rest score and the with-movement score each run zero to six, summing to a combined total of zero to twelve. There is no formal cut: any indicator present in either condition is clinically meaningful.
Worked example: No indicators at rest and three with movement give a rest score of zero, a movement score of three, and a combined total of three, with pain indicators observed.

### DOLOPLUS-2 (behavioural pain assessment)
Citation: Wary B, Doloplus collective; Lefebvre-Chapiro S. The Doloplus-2 scale, evaluating pain in the elderly. Eur J Palliat Care. 2001. (Cross-verified against doloplus.fr and the BMC Geriatrics systematic review; two or more sources, spec-v97.)
Formula: Ten items across three reaction domains (somatic with five items, psychomotor with two, and psychosocial with three) are each rated zero to three, summing to a total of zero to thirty (somatic zero to fifteen, psychomotor zero to six, psychosocial zero to nine). A score of five or more out of thirty indicates the presence of pain.
Worked example: A somatic complaint rated two with three further somatic items rated one give a total of five, at the threshold that indicates pain, whereas a total of four is below it.

### STRATIFY (inpatient falls-risk tool)
Citation: Oliver D, Britton M, Seed P, Martin FC, Hopper AH. Development and evaluation of evidence based risk assessment tool (STRATIFY) to predict which elderly inpatients will fall. BMJ. 1997. (Cross-verified across two or more sources, spec-v97.)
Formula: Five factors each score one point when present: a fall as the presenting complaint or since admission; agitation; visual impairment affecting everyday function; especially frequent toileting; and a combined transfer and mobility score (each rated zero to three on the Barthel system) of three or four. The total runs zero to five; a score of two or more is high fall risk.
Worked example: A recent fall and agitation, with a transfer and mobility sum outside three or four, give a total of two, the high-risk band.

### 30-Second Chair Stand (CDC STEADI)
Citation: Jones CJ, Rikli RE, Beam WC. A 30-s chair-stand test as a measure of lower body strength in community-residing older adults. Res Q Exerc Sport. 1999; CDC STEADI below-average age and sex norms. (Cross-verified across two or more sources, spec-v97.)
Formula: The number of full sit-to-stands completed in thirty seconds is compared with the CDC STEADI below-average cut-point for the person's age band and sex; a count below the cut-point is below average and indicates increased fall risk. Norm bands span ages sixty to ninety-four; outside that range there is no stratum.
Worked example: Nine stands for a woman aged seventy-five, whose below-average cut-point is ten, is below average and indicates increased fall risk, whereas ten is not.

### 4-Stage Balance Test (CDC STEADI)
Citation: CDC STEADI Assessment: 4-Stage Balance Test (Stopping Elderly Accidents, Deaths and Injuries toolkit). (Cross-verified across two or more sources, spec-v97.)
Formula: The patient holds four progressively harder stances for up to ten seconds each, advancing only after holding the prior stance. Inability to hold the full tandem stance for ten seconds indicates increased fall risk; the value compared is the full-tandem hold time against the ten-second cut-point.
Worked example: A full tandem held for eight seconds is under ten seconds and indicates increased fall risk, whereas ten seconds or more is not flagged by this test.

### Functional Reach Test
Citation: Duncan PW, Weiner DK, Chandler J, Studenski S. Functional reach: a new clinical measure of balance. J Gerontol. 1990. (Cross-verified across two or more sources, spec-v97.)
Formula: The maximum forward reach with a fixed base of support is classified against the published cut-points: under fifteen point two four centimeters (six inches) is a markedly increased (about four times) fall risk, fifteen point two four to twenty-five point four centimeters (six to ten inches) an increased (about two times) risk, and over twenty-five point four centimeters a lower risk. The age and sex normative mean is shown for context.
Worked example: A reach of eighteen centimeters for a woman aged seventy-five falls in the six-to-ten-inch band, an increased fall risk, against a normative mean near twenty-six point six centimeters.

### Gait Speed (4-meter / habitual)
Citation: Studenski S, Perera S, Patel K, et al. Gait speed and survival in older adults. JAMA. 2011; Fritz S, Lusardi M. Walking speed: the sixth vital sign. J Geriatr Phys Ther. 2009. (Cross-verified across two or more sources, spec-v97.)
Formula: Gait speed equals distance divided by time, in meters per second, commonly over a four-meter walk. Under zero point six is a high risk of adverse outcomes, under zero point eight is limited community ambulation, and one point zero or more is healthy or well-functioning. The time denominator is guarded so a zero or blank time never produces an infinite or undefined value.
Worked example: Four meters walked in five seconds gives a gait speed of zero point eight meters per second, reduced but just above the limited-community-ambulation cut-point.

### CDC STEADI Fall-Risk Screening Algorithm
Citation: Stevens JA, Phelan EA. Development of STEADI: a fall prevention resource for health care providers. Health Promot Pract. 2013; CDC STEADI fall-risk algorithm. (Cross-verified against the Lohman operationalization; two or more sources, spec-v97.)
Formula: The three key questions (a fall in the past year, feeling unsteady, worrying about falling) screen for increased risk. A negative screen is low risk. A positive screen is high risk when there is a recurrent (two or more) or injurious fall or a gait, strength, or balance problem, and moderate risk otherwise.
Worked example: A person reporting two or more falls in the past year is high risk, driven by the recurrent falls, whereas someone who only feels unsteady, with no falls and no gait or balance problem, is moderate risk.

### SARC-F (sarcopenia screen)
Citation: Malmstrom TK, Morley JE. SARC-F: a simple questionnaire to rapidly diagnose sarcopenia. J Am Med Dir Assoc. 2013. (Cross-verified across two or more sources, spec-v97.)
Formula: Five items (Strength, Assistance walking, Rise from a chair, Climb a flight of stairs, and Falls in the past year) are each rated zero (none), one (some difficulty), or two (a lot of difficulty or unable), summing to a total of zero to ten. A score of four or more predicts sarcopenia and poor outcomes.
Worked example: Some difficulty on four of the five items gives a total of four, a positive screen, whereas three is negative.

### SARC-CalF (SARC-F + calf circumference)
Citation: Barbosa-Silva TG, Menezes AMB, Bielemann RM, et al. Enhancing SARC-F: improving sarcopenia screening in the clinical practice. J Am Med Dir Assoc. 2016. (Cross-verified across two or more sources, spec-v97.)
Formula: The SARC-F total (zero to ten) is combined with a calf-circumference add-on that contributes ten points when calf circumference is below the sex-specific cutoff (under thirty-four centimeters for men, under thirty-three centimeters for women) and zero otherwise, for a total of zero to twenty. A score of eleven or more is a positive sarcopenia screen.
Worked example: A SARC-F of one with a calf circumference of thirty-two centimeters in a woman fires the ten-point add-on for a total of eleven, the positive cutoff.

### PRISMA-7 (frailty / disability case-finder)
Citation: Raiche M, Hebert R, Dubois MF. PRISMA-7: a case-finding tool to identify older adults with moderate to severe disabilities. Arch Gerontol Geriatr. 2008. (Cross-verified against the PRISMA-7 user guide; two or more sources, spec-v97.)
Formula: Seven items each score one point: age over eighty-five; male sex; health problems limiting activities; needing help on a regular basis; health problems requiring staying at home; not being able to count on someone close (the support item is reverse-scored, scoring on "no"); and using a cane, walker, or wheelchair. The total runs zero to seven; three or more suggests frailty or moderate-to-severe disability.
Worked example: Age over eighty-five, male, and activity-limiting health problems give a total of three, the positive cutoff.

### SOF Frailty Index
Citation: Ensrud KE, Ewing SK, Taylor BC, et al. Comparison of 2 frailty indexes for prediction of falls, disability, fractures, and death in older women. Arch Intern Med. 2008. (Cross-verified across two or more sources, spec-v97.)
Formula: Three items each score one point: weight loss of five percent or more over the prior year; inability to rise from a chair five times without using the arms; and reduced energy (a "no" to "do you feel full of energy?"). The total runs zero to three: zero is robust, one is pre-frail, and two or more is frail.
Worked example: Weight loss and inability to rise give a total of two, the frail band, whereas a single item is pre-frail.

### GNRI (Geriatric Nutritional Risk Index)
Citation: Bouillanne O, Morineau G, Dupont C, et al. Geriatric Nutritional Risk Index: a new index for evaluating at-risk elderly medical patients. Am J Clin Nutr. 2005. (Cross-verified across two or more sources, spec-v97.)
Formula: GNRI equals one point four eight nine times serum albumin in grams per liter plus forty-one point seven times the ratio of body weight to ideal body weight, with the ratio capped at one and ideal body weight from the Lorentz equations (men: zero point seven five times height in centimeters minus sixty-two point five; women: zero point six times height minus forty). Bands: above ninety-eight no risk, ninety-two to ninety-eight low, eighty-two to below ninety-two moderate, below eighty-two major risk.
Worked example: Albumin thirty-five grams per liter at sixty kilograms and one hundred sixty-five centimeters for a woman gives an ideal weight of fifty-nine kilograms, a capped ratio of one, and a GNRI of about ninety-three point eight, the low-risk band.

### Onodera Prognostic Nutritional Index (PNI)
Citation: Onodera T, Goseki N, Kosaki G. Prognostic nutritional index in gastrointestinal surgery of malnourished cancer patients. Nihon Geka Gakkai Zasshi. 1984. (Cross-verified across two or more sources, spec-v97.)
Formula: PNI equals ten times serum albumin in grams per deciliter plus zero point zero zero five times the total lymphocyte count per cubic millimeter. Forty-five or more is no increased risk, forty to below forty-five borderline, and below forty high nutritional and surgical risk.
Worked example: Albumin four point zero grams per deciliter with a lymphocyte count of fifteen hundred gives a PNI of forty-seven point five, no increased risk.

### CONUT (Controlling Nutritional Status score)
Citation: Ignacio de Ulibarri J, Gonzalez-Madrono A, de Villar NGP, et al. CONUT: a tool for controlling nutritional status. Nutr Hosp. 2005. (Cross-verified across two or more sources, spec-v97.)
Formula: Points come from serum albumin (at least three point five gives zero, three point zero to three point four nine gives two, two point five to two point nine nine gives four, below two point five gives six), total cholesterol (at least one hundred eighty gives zero, one hundred forty to one hundred seventy-nine gives one, one hundred to one hundred thirty-nine gives two, below one hundred gives three), and total lymphocytes (at least sixteen hundred gives zero, twelve hundred to fifteen ninety-nine gives one, eight hundred to eleven ninety-nine gives two, below eight hundred gives three). The total runs zero to twelve: zero to one normal, two to four mild, five to eight moderate, nine to twelve severe.
Worked example: Albumin three point two (two points), cholesterol one hundred fifty (one point), and lymphocytes one thousand (two points) sum to five, the moderate band.

### SNAQ (Simplified Nutritional Appetite Questionnaire)
Citation: Wilson MM, Thomas DR, Rubenstein LZ, et al. Appetite assessment: simple appetite questionnaire predicts weight loss. Am J Clin Nutr. 2005. (Cross-verified across two or more sources, spec-v97.)
Formula: Four appetite items (appetite, feeling full, how food tastes, number of meals per day) are each rated one to five, summing to a total of four to twenty. A score of fourteen or less predicts clinically significant (five percent or more) weight loss within six months. This is the Simplified Nutritional Appetite Questionnaire, not the Short Nutritional Assessment Questionnaire.
Worked example: All four items rated three give a total of twelve, which predicts weight loss, whereas fifteen does not.

### EAT-10 (Eating Assessment Tool)
Citation: Belafsky PC, Mwamba D, Rees CJ, et al. Validity and reliability of the Eating Assessment Tool (EAT-10). Ann Otol Rhinol Laryngol. 2008. (Cross-verified across two or more sources, spec-v97.)
Formula: Ten patient self-report swallowing items are each rated zero (no problem) to four (severe problem), summing to a total of zero to forty. A score of three or more indicates abnormal swallowing and possible aspiration risk.
Worked example: Three items rated one give a total of three, the abnormal-swallowing cutoff, whereas two is within normal limits.

### DETERMINE Nutritional Health Checklist
Citation: Posner BM, Jette AM, Smith KW, Miller DR. Nutrition and health risks in the elderly: the nutrition screening initiative. Am J Public Health. 1993. (Item weights re-fetched verbatim from the ACL Nutrition Screening Initiative checklist; two or more sources, spec-v97.)
Formula: Ten yes-or-no items carry published weights: illness changing food two, fewer than two meals a day three, few fruits or vegetables or milk two, three or more alcoholic drinks most days two, tooth or mouth problems two, not enough money for food four, eating alone most of the time one, three or more medications a day one, an unintended ten-pound weight change in six months two, and being unable to shop or cook or feed oneself two, for a maximum of twenty-one. Zero to two is good, three to five is moderate, and six or more is high nutritional risk.
Worked example: Illness, fewer than two meals a day, and eating alone sum to six, the high-risk band.
