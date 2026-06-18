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
