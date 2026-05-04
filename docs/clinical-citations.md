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
