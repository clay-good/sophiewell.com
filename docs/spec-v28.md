# spec-v28.md — Toxicology, envenomation, antimicrobial dosing & ID completers (25 tiles)

> Status: proposed (2026-05-19). v28 is the seventeenth catalog-
> growth spec and the **closer of the v25–v28 tranche** (the
> fourth 100-tile increment after v12–v16, v17–v20, and v21–v24).
> It adds 25 tiles covering **toxicology decision-thresholds**
> (lithium, methotrexate, digoxin, TCA, β-blocker / CCB, opioid
> overdose, alcohol-and-drug-withdrawal completers), **envenomation
> management** (CroFab dose, rabies post-exposure decision,
> tetanus-prophylaxis decision), **antimicrobial therapeutic-
> dosing** (vancomycin AUC/MIC, aminoglycoside extended-interval,
> β-lactam allergy de-labeling PEN-FAST), and **infectious-disease
> completers** (C. diff severity ATLAS / IDSA-2021, Tokyo 2018
> cholangitis / cholecystitis, MEDS sepsis prognosis, Pitt
> bacteraemia, NIH COVID-19 severity, qCSI ED COVID disposition).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v28 amends no hard rule from v10–v27. Catalog growth: at v27
> close 578 tiles; at v28 close **603 tiles**.
>
> v28 closes the v25–v28 tranche. At v28 close, sophiewell.com
> carries **603 audited, deterministic, citable, login-less
> clinical tools** — inside the 400–600-tile parity window of
> [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) and at the
> threshold of the long-horizon commitment.

## 1. Why v28 exists

Toxicology and infectious diseases are the two acute-care
specialties where the bedside arithmetic is most consequential
*and* the source-of-truth is the most volatile (FDA labels,
society guidelines, NIH guidance). Earlier specs shipped the
individual tiles whose source has not moved in a decade (Rumack-
Matthew, Done salicylate, CIWA-Ar (?), Modified Maddrey,
Forrester) but deliberately deferred the surface that requires
**label-pinning** and **guideline-edition-pinning** until the v11
audit floor was mature. v28 finally lands that surface.

The 25 tiles in v28 follow the same v12 §1 selection criteria.
ID completers prioritise items where the bedside team is already
likely to be on the phone with pharmacy or microbiology and
benefits from a deterministic, citable reference.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v28
specifically defers:

- **State-specific scheduled-substance reporting tables.** Defer
  to a dedicated regulatory-decoder spec.
- **Toxin-specific antidote dosing in pediatric patients** beyond
  the weight-based ladders in §3.1 and §3.2.
- **Custom pharmacokinetic-modeling for vancomycin** beyond the
  AUC/MIC two-level Bayesian / trapezoidal estimate in §3.3.1.
  Patient-specific Bayesian fits are a separate (non-deterministic)
  surface and remain out per [spec-v10 §2.3](spec-v10.md).
- **HIV ART regimen selection** trees. Defer to a dedicated HIV-
  ART decoder spec keyed to the DHHS guideline edition.
- **Antibiogram-driven empirical-therapy authoring.** Local
  antibiograms are by definition non-deterministic across
  facilities and remain out.

## 3. The 25 tiles

### 3.1 Toxicology — bedside decision thresholds

#### 3.1.1 `lithium-toxicity-bands` — Lithium-level interpretation

- **Citation:** McKnight RF, Adida M, Budge K, Stockton S, Goodwin GM, Geddes JR. *Lithium toxicity profile: a systematic review and meta-analysis.* Lancet 2012;379(9817):721-728. AACT / EAPCCT consensus, Hansen 2021.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `psychiatry`, `nephrology`, `emergency-medicine`, `toxicology`.
- **Inputs:** Lithium level (mEq/L), acute vs chronic exposure, renal function, neurologic signs.
- **Bands:** Therapeutic / mild / moderate / severe with hemodialysis-indication banner per the 2021 EXTRIP recommendations.

#### 3.1.2 `mtx-rescue-nomogram` — Methotrexate level / time leucovorin-rescue thresholds

- **Citation:** Bleyer WA. *The clinical pharmacology of methotrexate: new applications of an old drug.* Cancer 1978;41(1):36-51. Updated thresholds: Howard SC, McCormick J, Pui CH, Buddington RK, Harvey RD. *Preventing and Managing Toxicities of High-Dose Methotrexate.* Oncologist 2016;21(12):1471-1482.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `oncology`, `pediatric-oncology`, `pharmacy`.
- **Inputs:** Time since infusion (24 / 36 / 42 / 48 h), serum methotrexate concentration (µmol/L), renal function, prior glucarpidase exposure.
- **Output:** Rescue-zone (within-expected, intermediate, delayed-clearance / nephrotoxic) and the leucovorin dose escalation band per the Howard 2016 thresholds. Banner notes glucarpidase indication.

#### 3.1.3 `digoxin-fab-dose` — Digoxin-immune-Fab (DigiFab) dose

- **Citation:** Antman EM, Wenger TL, Butler VP Jr, Haber E, Smith TW. *Treatment of 150 cases of life-threatening digitalis intoxication with digoxin-specific Fab antibody fragments. Final report of a multicenter study.* Circulation 1990;81(6):1744-1752. FDA DigiFab package insert.
- **Group:** Bedside Math (`F`).
- **Specialties:** `cardiology`, `emergency-medicine`, `toxicology`.
- **Inputs:** Known acute ingestion (mg) or steady-state level (ng/mL) + weight (kg), or empiric for unknown exposure.
- **Output:** Number of vials (40 mg each) per the FDA-label nomogram; banner enumerates the two formulas (acute-ingestion mg-based vs steady-state level-based) and the empiric dose (10 vials acute / 6 vials chronic).

#### 3.1.4 `tca-toxicity-ecg` — TCA-overdose ECG-based risk

- **Citation:** Liebelt EL, Francis PD, Woolf AD. *ECG lead aVR versus QRS interval in predicting seizures and arrhythmias in acute tricyclic antidepressant toxicity.* Ann Emerg Med 1995;26(2):195-201. Boehnert MT, Lovejoy FH. *Value of the QRS duration versus the serum drug level in predicting seizures and ventricular arrhythmias after an acute overdose of tricyclic antidepressants.* N Engl J Med 1985;313(8):474-479.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `toxicology`, `psychiatry`.
- **Inputs:** QRS duration (ms), terminal R-wave in aVR (mm), serum sodium, base-deficit.
- **Output:** Risk band (QRS >100 ms → ↑ seizure; QRS >160 ms → ↑ ventricular arrhythmia; aVR R-wave >3 mm → ↑ severe toxicity) with the sodium-bicarbonate-administration banner per the AACT 2009 consensus.

#### 3.1.5 `bb-ccb-toxicity-bundle` — β-blocker / calcium-channel-blocker overdose severity & high-dose-insulin-euglycemia decision

- **Citation:** Engebretsen KM, Kaczmarek KM, Morgan J, Holger JS. *High-dose insulin therapy in beta-blocker and calcium channel-blocker poisoning.* Clin Toxicol (Phila) 2011;49(4):277-283. AACT / EAPCCT 2020 position statement.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `cardiology`, `toxicology`, `critical-care`.
- **Inputs:** HR, BP, mental status, lactate, glucose, refractoriness to atropine / glucagon / calcium / vasopressors.
- **Output:** Severity band and HIE-induction / continuation decision per the AACT 2020 statement; HIE bolus (1 u/kg) and infusion (0.5–1 u/kg/h titratable) print on the result screen.

#### 3.1.6 `opioid-naloxone-peds` — Pediatric naloxone dosing for opioid overdose

- **Citation:** American Heart Association. *2020 Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care: Pediatric Basic and Advanced Life Support.* Circulation 2020;142(16_suppl_2):S469-S523.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pediatric-emergency-medicine`, `toxicology`, `pediatric-anesthesia`.
- **Inputs:** Age band, weight (kg), route (IN / IM / IV / SC), opioid-tolerance flag.
- **Output:** Per-route mg dose per PALS 2020 (0.1 mg/kg IV/IM up to 2 mg if <5 yr or ≤20 kg; 2 mg if ≥5 yr or >20 kg; titrate banner for chronic-opioid patients).

#### 3.1.7 `ciwa-ar` — CIWA-Ar (alcohol-withdrawal severity)

- **Citation:** Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. *Assessment of alcohol withdrawal: the revised clinical institute withdrawal assessment for alcohol scale (CIWA-Ar).* Br J Addict 1989;84(11):1353-1357.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `addiction-medicine`, `internal-medicine`, `emergency-medicine`, `psychiatry`.
- **Inputs:** 10 items (nausea / vomiting, tremor, paroxysmal sweats, anxiety, agitation, tactile / auditory / visual disturbances, headache, orientation).
- **Bands:** <10 mild / 10–19 moderate / ≥20 severe → symptom-triggered benzodiazepine ladder per ASAM 2020.

#### 3.1.8 `cows` — Clinical Opiate Withdrawal Scale

- **Citation:** Wesson DR, Ling W. *The Clinical Opiate Withdrawal Scale (COWS).* J Psychoactive Drugs 2003;35(2):253-259.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `addiction-medicine`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** 11 items (resting pulse, sweating, restlessness, pupil size, bone / joint aches, runny nose / tearing, GI upset, tremor, yawning, anxiety / irritability, gooseflesh).
- **Bands:** 5–12 mild / 13–24 moderate / 25–36 moderately severe / >36 severe. Buprenorphine-induction-readiness banner per the SAMHSA TIP-63 threshold.

### 3.2 Envenomation & exposure decisions

#### 3.2.1 `crofab-dose` — CroFab (Crotalidae Polyvalent Immune Fab) starting dose

- **Citation:** Lavonas EJ, Ruha AM, Banner W, et al. *Unified treatment algorithm for the management of crotaline snakebite in the United States: results of an evidence-informed consensus workshop.* BMC Emerg Med 2011;11:2. FDA CroFab package insert.
- **Group:** Bedside Math (`F`).
- **Specialties:** `emergency-medicine`, `toxicology`, `critical-care`.
- **Inputs:** Severity of envenomation (per the Lavonas 2011 grading), known species (rattlesnake / copperhead / cottonmouth) flag.
- **Output:** Vial count (4–6 vials initial bolus; 2 vials at 6, 12, 18 h maintenance) per the unified algorithm. Banner cross-references the Anavip (Crotalidae immune F(ab')₂) alternative product.

#### 3.2.2 `rabies-pep` — Rabies post-exposure-prophylaxis decision

- **Citation:** Centers for Disease Control and Prevention. *Use of a Reduced (4-Dose) Vaccine Schedule for Postexposure Prophylaxis to Prevent Human Rabies: Recommendations of the Advisory Committee on Immunization Practices.* MMWR 2010;59(RR-2):1-9. Current ACIP / WHO 2018 update.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `infectious-diseases`, `family-medicine`, `public-health`.
- **Inputs:** Exposure category (WHO I / II / III), animal species, animal observability, prior immunisation, immunocompromise.
- **Output:** Vaccine schedule (4-dose vs 5-dose if immunocompromised) and HRIG indication.

#### 3.2.3 `tetanus-pep` — Tetanus prophylaxis after wound

- **Citation:** Centers for Disease Control and Prevention. *Prevention of pertussis, tetanus, and diphtheria with vaccines in the United States: recommendations of the Advisory Committee on Immunization Practices (ACIP).* MMWR 2020;69(3):1-44.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `family-medicine`, `infectious-diseases`.
- **Inputs:** Wound type (clean minor vs all other), prior Td/Tdap doses (count), time since last dose.
- **Output:** Vaccine indication, Tdap-vs-Td preference, and TIG indication per the ACIP 2020 wound-management table.

#### 3.2.4 `frostbite-bilstrom` — Frostbite-severity / tPA-eligibility bundle

- **Citation:** Cauchy E, Chetaille E, Marchand V, Marsigny B. *Retrospective study of 70 cases of severe frostbite lesions: a proposed new classification scheme.* Wilderness Environ Med 2001;12(4):248-255. Bruen KJ, Ballard JR, Morris SE, Cochran A, Edelman LS, Saffle JR. *Reduction of the incidence of amputation in frostbite injury with thrombolytic therapy.* Arch Surg 2007;142(6):546-551.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `wilderness-medicine`, `plastic-surgery`, `vascular-surgery`.
- **Inputs:** Cauchy grade, time since rewarming, contraindications to thrombolysis, distal-tissue perfusion (angiography or contrast SPECT).
- **Output:** Severity grade + tPA-eligibility decision per Bruen 2007 / Wilderness Medical Society 2024 protocol.

> Frostbite *classification* tile (`frostbite-classification`) is
> already shipped at v23; v28 adds the *management-decision*
> overlay separately.

### 3.3 Antimicrobial therapeutic dosing

#### 3.3.1 `vancomycin-auc-mic` — Vancomycin AUC/MIC dosing (two-level trapezoidal)

- **Citation:** Rybak MJ, Le J, Lodise TP, et al. *Therapeutic monitoring of vancomycin for serious methicillin-resistant Staphylococcus aureus infections: a revised consensus guideline and review by the American Society of Health-System Pharmacists, the Infectious Diseases Society of America, the Pediatric Infectious Diseases Society, and the Society of Infectious Diseases Pharmacists.* Am J Health Syst Pharm 2020;77(11):835-864.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pharmacy`, `infectious-diseases`, `internal-medicine`, `critical-care`.
- **Inputs:** Two timed vancomycin levels (peak / trough or first-order pair), dosing interval, current dose, weight, eGFR, MIC.
- **Output:** AUC₀–₂₄, AUC/MIC, suggested dose adjustment to target AUC 400–600 mg·h/L per the 2020 ASHP/IDSA consensus.

#### 3.3.2 `aminoglycoside-extended` — Aminoglycoside extended-interval (Hartford) dosing nomogram

- **Citation:** Nicolau DP, Freeman CD, Belliveau PP, Nightingale CH, Ross JW, Quintiliani R. *Experience with a once-daily aminoglycoside program administered to 2,184 adult patients.* Antimicrob Agents Chemother 1995;39(3):650-655.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pharmacy`, `infectious-diseases`, `internal-medicine`.
- **Inputs:** Weight, eGFR (Cockcroft-Gault), drug (gentamicin / tobramycin 7 mg/kg vs amikacin 15 mg/kg), level drawn 6–14 h post-dose.
- **Output:** Initial dose and interval per the Hartford nomogram; level-band interpretation (q24 / q36 / q48 / hold and redraw).

#### 3.3.3 `pen-fast` — PEN-FAST penicillin-allergy de-labeling risk

- **Citation:** Trubiano JA, Vogrin S, Chua KYL, et al. *Development and validation of a penicillin allergy clinical decision rule.* JAMA Intern Med 2020;180(5):745-752.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `allergy-immunology`, `infectious-diseases`, `pharmacy`, `internal-medicine`.
- **Inputs:** ≤5 yr since reaction (2), anaphylaxis/angioedema or severe cutaneous adverse reaction (2), treatment for reaction (1), Five yr ago (mnemonic).
- **Bands:** 0 very low (<1%) / 1–2 low (5%) / 3 moderate (20%) / 4–5 high (50%) positive penicillin allergy.

### 3.4 Infectious-disease & sepsis completers

#### 3.4.1 `c-diff-severity-idsa-2021` — C. difficile severity & treatment decision (IDSA/SHEA 2021)

- **Citation:** Johnson S, Lavergne V, Skinner AM, et al. *Clinical Practice Guideline by the Infectious Diseases Society of America (IDSA) and Society for Healthcare Epidemiology of America (SHEA): 2021 Focused Update Guidelines on Management of Clostridioides difficile Infection in Adults.* Clin Infect Dis 2021;73(5):e1029-e1044.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `infectious-diseases`, `gastroenterology`, `hospital-medicine`.
- **Inputs:** WBC (≥15 k), serum creatinine (≥1.5 mg/dL or 1.5× baseline), hypotension/ileus/megacolon, episode number (initial / first recurrence / multiply recurrent).
- **Output:** Non-severe / severe / fulminant + first-line therapy per IDSA-SHEA 2021 (fidaxomicin preferred; vancomycin acceptable; fulminant — vancomycin + IV metronidazole ± colectomy).

#### 3.4.2 `atlas-cdiff-recurrence` — ATLAS recurrent-C. difficile prognostic

- **Citation:** Miller MA, Louie T, Mullane K, et al. *Derivation and validation of a simple clinical bedside score (ATLAS) for Clostridium difficile infection which predicts response to therapy.* BMC Infect Dis 2013;13:148.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-diseases`, `gastroenterology`, `hospital-medicine`.
- **Inputs:** Age, Treatment with concurrent systemic antibiotics, Leukocyte count, Albumin, Serum creatinine.
- **Bands:** 0–10 with predicted response-to-therapy.

#### 3.4.3 `tokyo-2018-acute-cholangitis` — Tokyo Guidelines 2018 acute-cholangitis diagnostic + severity

- **Citation:** Kiriyama S, Kozaka K, Takada T, et al. *Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholangitis (with videos).* J Hepatobiliary Pancreat Sci 2018;25(1):17-30.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `gastroenterology`, `general-surgery`, `infectious-diseases`, `emergency-medicine`.
- **Inputs:** Charcot-triad components, lab inflammation, cholestasis, imaging, and severity criteria (organ dysfunction count).
- **Output:** Diagnostic likelihood (definite / suspected) and severity grade (I mild / II moderate / III severe) per TG18.

#### 3.4.4 `tokyo-2018-acute-cholecystitis` — Tokyo Guidelines 2018 acute-cholecystitis diagnostic + severity

- **Citation:** Yokoe M, Hata J, Takada T, et al. *Tokyo Guidelines 2018: diagnostic criteria and severity grading of acute cholecystitis (with videos).* J Hepatobiliary Pancreat Sci 2018;25(1):41-54.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `general-surgery`, `gastroenterology`, `emergency-medicine`.
- **Inputs:** Local signs, systemic inflammation, imaging, severity organ-dysfunction count.
- **Output:** Diagnostic likelihood and severity grade I / II / III per TG18.

#### 3.4.5 `meds-sepsis` — Mortality in Emergency Department Sepsis (MEDS) score

- **Citation:** Shapiro NI, Wolfe RE, Moore RB, Smith E, Burdick E, Bates DW. *Mortality in Emergency Department Sepsis (MEDS) score: a prospectively derived and validated clinical prediction rule.* Crit Care Med 2003;31(3):670-675.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `infectious-diseases`, `critical-care`.
- **Inputs:** Terminal illness (6), tachypnea / hypoxia (3), septic shock (3), platelets <150 (3), bands >5% (3), age >65 (3), lower-respiratory-tract infection (2), nursing-home resident (2), altered mental status (2).
- **Bands:** Very low (0–4) / low (5–7) / moderate (8–12) / high (13–15) / very high (>15) 28-d mortality.

#### 3.4.6 `pitt-bacteremia` — Pitt bacteraemia score

- **Citation:** Paterson DL, Ko WC, Von Gottberg A, et al. *International prospective study of Klebsiella pneumoniae bacteremia: implications of extended-spectrum beta-lactamase production in nosocomial infections.* Ann Intern Med 2004;140(1):26-32. Derivation: Hilf M et al., 1989.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-diseases`, `critical-care`, `internal-medicine`.
- **Inputs:** Temperature, hypotension, mechanical ventilation, cardiac arrest, mental-status.
- **Bands:** 0–14; ≥4 commonly used as the high-severity threshold.

#### 3.4.7 `nih-covid-severity` — NIH COVID-19 severity classification

- **Citation:** National Institutes of Health. *Coronavirus Disease 2019 (COVID-19) Treatment Guidelines.* NIH; current revision (archived ed. retained for reference).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `infectious-diseases`, `pulmonology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** SpO₂, respiratory rate, imaging, oxygen requirement, organ dysfunction.
- **Output:** Asymptomatic / mild / moderate / severe / critical per the NIH definition. Banner pins the guideline edition / archive date and notes the NIH guideline closed February 2024; subsequent treatment guidance is IDSA-only.

#### 3.4.8 `mascc-fn` — MASCC risk index for febrile neutropenia

- **Citation:** Klastersky J, Paesmans M, Rubenstein EB, et al. *The Multinational Association for Supportive Care in Cancer risk index: A multinational scoring system for identifying low-risk febrile neutropenic cancer patients.* J Clin Oncol 2000;18(16):3038-3051.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `infectious-diseases`, `emergency-medicine`, `hospital-medicine`.
- **Inputs:** Burden-of-illness band (5 / 3 / 0), no hypotension (5), no COPD (4), solid tumor or no fungal infection (4), no dehydration (3), outpatient at fever onset (3), age <60 (2).
- **Bands:** ≥21 low-risk (eligible for outpatient oral therapy per IDSA 2010 / ASCO 2018); <21 high-risk (admit, IV empirical regimen).

#### 3.4.9 `clif-c-aclf` — CLIF-C Acute-on-Chronic Liver Failure score

- **Citation:** Jalan R, Saliba F, Pavesi M, et al. *Development and validation of a prognostic score to predict mortality in patients with acute-on-chronic liver failure.* J Hepatol 2014;61(5):1038-1047.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `hepatology`, `gastroenterology`, `critical-care`, `internal-medicine`.
- **Inputs:** CLIF organ-failure subscores (liver, kidney, brain, coagulation, circulation, respiratory), age, WBC.
- **Output:** CLIF-C ACLF score 0–100 with 28- and 90-day mortality bands per the EASL-CLIF derivation.

#### 3.4.10 `qcsi-covid` — Quick COVID-19 Severity Index (qCSI) for ED disposition

- **Citation:** Haimovich AD, Ravindra NG, Stoytchev S, et al. *Development and Validation of the Quick COVID-19 Severity Index: A Prognostic Tool for Early Clinical Decompensation.* Ann Emerg Med 2020;76(4):442-453.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `emergency-medicine`, `infectious-diseases`, `internal-medicine`.
- **Inputs:** Respiratory rate, lowest documented SpO₂, O₂ flow rate at ED disposition.
- **Bands:** Low / low-intermediate / high-intermediate / high 24-h critical-respiratory-decompensation risk.

## 4. Group homes

- Clinical Criteria & Diagnostic Bundles (`H`): §3.1.1, §3.1.2,
  §3.1.4, §3.1.5, §3.2.2, §3.2.3, §3.2.4, §3.4.1, §3.4.3,
  §3.4.4, §3.4.7.
- Clinical Scoring & Risk (`G`): §3.1.7, §3.1.8, §3.3.3, §3.4.2,
  §3.4.5, §3.4.6, §3.4.8, §3.4.9, §3.4.10.
- Bedside Math (`F`): §3.1.3, §3.1.6, §3.2.1, §3.3.1, §3.3.2.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Additional v28 audit
requirements:

- **Label pinning.** §3.1.3 (DigiFab), §3.2.1 (CroFab), §3.1.6
  (naloxone) each record the FDA package-insert revision date the
  dose ladder is keyed to. Future label revisions are enrolled as
  re-audit triggers.

- **Guideline pinning.** §3.1.1 EXTRIP 2021; §3.1.2 Howard 2016;
  §3.1.5 AACT 2020; §3.1.7 ASAM 2020; §3.1.8 SAMHSA TIP-63; §3.2.2
  ACIP / WHO 2018; §3.2.3 ACIP 2020; §3.3.1 ASHP/IDSA 2020;
  §3.4.1 IDSA/SHEA 2021; §3.4.3 / §3.4.4 TG18; §3.4.7 NIH archive
  ed. — each tile records its source-edition date. Future
  revisions trigger re-audit.

- **Two-level math transparency.** §3.3.1 prints the trapezoidal
  formula on the result screen so the user can verify the AUC
  arithmetic by hand. Bayesian-fit estimates are explicitly out
  of scope per §2.

- **No empirical-antibiotic authoring.** §3.4.1, §3.4.3, §3.4.4
  banner that local antibiograms govern empirical-coverage choice.
  Sophie ships the severity ladder; she does not author the
  antibiotic.

- **Withdrawal-scale provenance.** §3.1.7 / §3.1.8 ship the
  *symptom-triggered* scoring substrate, not the *medication
  ladder*. The result screen prints the band threshold; the
  benzodiazepine / buprenorphine dose ladder is linked, not
  embedded, consistent with [spec-v11 §5.3](spec-v11.md).

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v27    | 578 | +25 |
| **v28**| **603** | **+25** |

## 7. What ships after v28

The v25–v28 tranche closes here. At v28 close, sophiewell.com is
**603 audited, deterministic, citable, login-less clinical
tools** — inside the 400–600-tile parity window in
[docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) and across
the long-horizon commitment threshold the scope document anchors.

The next tranche (v29 onward) is currently scoped against:

- **AJCC 9th-edition site-by-site re-audits** as each site's
  9th-edition publication stabilises.
- **HIV ART / HCV DAA / TB-regimen decoders** keyed to DHHS /
  AASLD-IDSA / CDC guideline editions.
- **OB/Gyn high-volume completers** (Bishop score components
  already partly shipped, modified Bishop, Robson 10-group, ACOG
  GDM 1- / 2-step bundles, ACOG VTE-postpartum, eFTS / cFTS
  prenatal screening interpretation).
- **Surgical specialty completers** (POSSUM extensions, NSQIP-MICA
  already shipped, ACS-NSQIP universal surgical-risk components,
  ASA-PS adult adjuncts, ERAS recovery scoring).
- **Patient-decoder expansion** (HCAHPS interpretation, Medicare
  Star Rating, ACA-marketplace cost-sharing, federal-poverty-
  level subsidy bands, COBRA timeline already shipped).
- **Field-medicine & global-health completers** (WHO IMCI severe-
  pneumonia, WHO ETAT triage, MSF malnutrition triage, JumpSTART
  already shipped, AVPU-as-triage, START / SALT additional
  variants).

Each future tranche follows the v11 audit floor and v12 shipping
contract.
