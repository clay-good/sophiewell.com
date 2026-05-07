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
