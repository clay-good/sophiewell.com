# spec-v100 working roster — MDCalc Parity Completion program (curated source of truth)

> Internal working file backing the [spec-v100](spec-v100.md) charter. Consolidates
> the eight-domain MDCalc gap sweep into the curated, deduped, collision-checked
> roster each feature spec (v101+) implements. Every id below was checked absent from
<!-- catalog-truth:historical (the 432 below is the catalog size at the time this roster was authored, not the live count) -->
> the live 432-tile catalog (by concept, not just name); cross-agent duplicates and
> copyrighted/licensed instruments were removed. Citations are the primary derivation
> source to be re-fetched verbatim at implementation (per the v97 "re-fetch, never
> recall coefficients" lesson). Class A = fixed formula/coefficient (no staleness row);
> Class B = revisable guideline threshold (needs a docs/citation-staleness.md row).

Group key: G = Clinical Scoring & Risk · E = Clinical Math & Conversions ·
F = Medication & Infusion · N = Pediatrics & Neonatal · I = EMS & Field.

ID-collision renames applied: `padua-score`(renal-mass)→`padua-renal` (vs existing
`padua` VTE); Mayo Adhesive Probability→`mayo-adhesive` (vs existing `map`); Mangled
Extremity→`mangled-extremity`, MESS first-seizure→`mess-first-seizure`.

---

## WAVE 1 — Cardiology, electrophysiology, vascular, lipids (v101–v105, +26)

### v101 — AF, stroke-risk & QT (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| chads2 | CHADS₂ | Original AF stroke risk (CHF,HTN,Age≥75,DM,Stroke×2) | Gage 2001, JAMA 285:2864 | A |
| cha2ds2-va | CHA₂DS₂-VA (2024 ESC) | AF stroke risk with sex removed | Van Gelder 2024, Eur Heart J (ESC AF GL) | B |
| chads-65 | CHADS-65 (CCS) | Canadian AF anticoagulation pathway (age-65 gate) | Andrade 2020, Can J Cardiol 36:1847 | B |
| atria-stroke | ATRIA Stroke Score | AF stroke risk (age/sex/comorbidity, prior-stroke interaction) | Singer 2013, J Am Heart Assoc 2:e000250 | A |
| tisdale-qtc | Tisdale QT Risk Score | Inpatient drug-induced QT-prolongation risk (0–21) | Tisdale 2013, Circ CV Qual Outcomes 6:479 | A |

### v102 — Heart failure & cardiogenic shock (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| maggic | MAGGIC Risk Score | 1- & 3-yr mortality in heart failure | Pocock 2013, Eur Heart J 34:1404 | A |
| gwtg-hf | GWTG-HF Risk Score | In-hospital mortality, admitted HF | Peterson 2010, Circ CV Qual Outcomes 3:25 | A |
| h2fpef | H₂FPEF Score | Probability dyspnea is HFpEF | Reddy 2018, Circulation 138:861 | A |
| hfa-peff | HFA-PEFF Score | ESC stepwise HFpEF likelihood | Pieske 2019, Eur Heart J 40:3297 | B |
| cardshock-score | CardShock Score | In-hospital mortality, cardiogenic shock | Harjola 2015, Eur J Heart Fail 17:501 | A |

### v103 — CV risk & prevention engines (G/E, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| score2 | SCORE2 | ESC 10-yr fatal+nonfatal CVD risk, age 40–69 | SCORE2 WG 2021, Eur Heart J 42:2439 | B |
| score2-op | SCORE2-OP | ESC 10-yr CVD risk, age ≥70 | SCORE2-OP WG 2021, Eur Heart J 42:2455 | B |
| mesa-chd | MESA CHD Risk (with CAC) | 10-yr CHD risk incorporating Agatston CAC | McClelland 2015, J Am Coll Cardiol 66:1643 | A |
| framingham-cvd | Framingham General CVD | 10-yr general CVD risk (2008) | D'Agostino 2008, Circulation 117:743 | A |
| reynolds-risk | Reynolds Risk Score | 10-yr CVD risk adding hsCRP + family hx | Ridker 2007 JAMA 297:611 / 2008 Circ 118:2243 | A |
| non-hdl-remnant | Non-HDL & Remnant Cholesterol | TC−HDL and TC−HDL−LDL atherogenic fractions | Varbo 2013, JACC 61:427 | A |

### v104 — ECG arrhythmia, aortic & syncope (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| brugada-vt | Brugada Criteria (VT vs SVT) | 4-step wide-complex-tachycardia VT diagnosis | Brugada 1991, Circulation 83:1649 | A |
| vereckei-avr | Vereckei aVR Algorithm | Single-lead (aVR) 4-step VT diagnosis | Vereckei 2008, Heart Rhythm 5:89 | A |
| add-rs | Aortic Dissection Detection Risk Score | ADD-RS 0–3 (± D-dimer pathway) | Rogers 2011, Circulation 123:2213 | A |
| rose-syncope | ROSE Rule | 1-month serious outcome after ED syncope | Reed 2010, JACC 55:713 | A |
| egsys | EGSYS Score | Probability syncope is cardiac | Del Rosso 2008, Heart 94:1620 | A |
| oesil | OESIL Risk Score | 12-month mortality after ED syncope | Colivicchi 2003, Eur Heart J 24:811 | A |

### v105 — Vascular & cardiac surgery (E/G, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| abi | Ankle-Brachial Index | ABI per leg + PAD severity bands | Aboyans 2012, Circulation 126:2890 (AHA) | A |
| rutherford-fontaine | Rutherford / Fontaine PAD Stage | Maps PAD findings to Rutherford cat + Fontaine stage | Rutherford 1997, J Vasc Surg 26:517 | B |
| wifi | SVS WIfI Classification | Limb-threat stage from Wound/Ischemia/foot Infection | Mills 2014, J Vasc Surg 59:220 | B |
| euroscore2 | EuroSCORE II | In-hospital mortality after cardiac surgery | Nashef 2012, Eur J Cardiothorac Surg 41:734 | A |

---

## WAVE 2 — Emergency, trauma, toxicology, environmental (v106–v111, +30)

### v106 — VTE workup algorithms (G/E, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| peged | PEGeD (D-dimer adjusted to C-PTP) | 3-tier pretest probability + graduated D-dimer rule-out | Kearon 2019, NEJM 381:2125 | A |
| 4peps | 4PEPS | 13-item weighted score → 4 tiers selecting D-dimer strategy | Roy 2021, JAMA Cardiol 6:669 | A |
| bova-pe | Bova Score | 30-day complications in normotensive confirmed PE | Bova 2014, Eur Respir J 44:694 | A |
| hestia | Hestia Criteria | 11-item checklist; any positive excludes home PE treatment | Zondag 2011, J Thromb Haemost 9:1500 | A |
| geneva-original | Geneva Score (original) | Pretest PE probability (clinical + ABG + CXR) | Wicki 2001, Arch Intern Med 161:92 | A |
| constans-uedvt | Constans Score (UE-DVT) | Pretest probability of upper-extremity DVT | Constans 2008, Thromb Haemost 99:202 | A |

### v107 — ED decision rules & resuscitation (G, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| hear | HEAR Score | History+ECG+Age+Risk (HEART minus troponin) very-low-risk flag | Moumneh 2021, Eur J Emerg Med 28:292 | A |
| new-orleans-head | New Orleans Head Trauma Criteria | 7-item; any positive → CT in GCS-15 minor head injury | Haydel 2000, NEJM 343:100 | A |
| go-far | GO-FAR Score | Probability of good-neuro survival after in-hospital arrest | Ebell 2013, JAMA Intern Med 173:1872 | A |
| macocha | MACOCHA Score | Difficult-intubation risk in the ICU | De Jong 2013, AJRCCM 187:832 | A |

### v108 — Trauma severity scores (E/G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| triss | TRISS | Probability of survival from age+RTS+ISS+mechanism | Boyd 1987, J Trauma 27:370 | A |
| niss | New Injury Severity Score | Sum of squares of 3 worst AIS (any region) | Osler 1997, J Trauma 43:922 | A |
| tash-score | TASH Score | Logistic probability of massive transfusion | Yücel 2006, J Trauma 60:1228 | A |
| rabt-score | RABT Score | MT prediction 0–4 (SI>1, pelvic fx, penetrating, +FAST) | Joseph 2018, World J Surg 42:3702 | A |
| gcs-pupils | GCS-Pupils (GCS-P) | TBI index = GCS − pupil-reactivity penalty (1–15) | Brennan/Murray/Teasdale 2018, J Neurosurg 128:1612 | A |
| nexus-chest-ct | NEXUS Chest CT | 7-criterion rule-out of chest CT in blunt trauma | Rodriguez 2015, PLoS Med 12:e1001883 | A |

### v109 — Trauma classification & soft-tissue infection (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| denver-bcvi | Expanded Denver Criteria (BCVI) | Flags need for CTA to detect blunt cerebrovascular injury | Burlew 2012, J Trauma Acute Care Surg 72:330 | B |
| aast-organ-injury | AAST Solid-Organ Injury Scales (2018) | Grades I–V spleen/liver/kidney incl. vascular findings | Kozar 2018, J Trauma Acute Care Surg 85:1119 | B |
| mangled-extremity | Mangled Extremity Severity Score (MESS) | Skeletal/soft-tissue+ischemia+shock+age; ≥7 → amputation | Johansen 1990, J Trauma 30:568 | A |
| lrinec | LRINEC Score | 6-lab necrotizing-fasciitis suspicion (0–13) | Wong 2004, Crit Care Med 32:1535 | A |
| alt-70 | ALT-70 Cellulitis Score | Cellulitis-vs-mimic likelihood (0–7) | Raff 2017, J Am Acad Dermatol 76:618 | A |

### v110 — Toxicology dosing & dialysis decisions (F/G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| digifab-dosing | Digoxin Immune Fab (DigiFab) Dosing | Vial count by amount ingested / serum level / empiric | Smith 1982, NEJM 307:1357 (label basis) | A |
| nac-dosing | Acetaminophen NAC Dosing | Weight-based IV regimens (21-h 3-bag; 2-bag SNAP) | Prescott 1979 BMJ 2:1097; Bateman 2014 Lancet 383:697 | A |
| hiet-dosing | High-Dose Insulin Euglycemia (HIET) | BB/CCB overdose insulin bolus→infusion + dextrose | Engebretsen 2011, Clin Toxicol 49:277 | A |
| tca-bicarbonate | TCA Toxicity: QRS Risk + Bicarbonate | QRS≥100/≥160 ms thresholds + NaHCO₃ target | Boehnert 1985, NEJM 313:474 | A |
| lithium-extrip | Lithium Dialysis Decision (EXTRIP) | ECTR recommendation by Li level + renal/neuro features | Decker 2015, CJASN 10:875 | B |

### v111 — Environmental & wilderness medicine (I/G, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| lake-louise-ams | 2018 Lake Louise AMS Score | 4 symptoms (0–3) → AMS if ≥3 with headache | Roach 2018, High Alt Med Biol 19:4 | A |
| szpilman-drowning | Szpilman Drowning Classification | Cough/auscultation/edema/hypotension/arrest → 6 grades | Szpilman 1997, Chest 112:660 | B |
| snakebite-severity | Snakebite Severity Score (SSS) | 6-system points (0–20) for crotalid envenomation | Dart 1996, Ann Emerg Med 27:321 | A |
| cauchy-frostbite | Cauchy Frostbite Classification | Day-0 topography + bone scan → 4 grades (amputation risk) | Cauchy 2001, Wilderness Environ Med 12:248 | A |

---

## WAVE 3 — Critical care & pulmonary (v112–v116, +19)

### v112 — ICU mortality & sepsis-coagulopathy (G/E, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| meds-score | MEDS Score | 28-day mortality in ED sepsis (0–27) | Shapiro 2003, Crit Care Med 31:670 | A |
| sic-score | Sepsis-Induced Coagulopathy Score | Platelet + PT-INR + capped SOFA; ≥4 = SIC | Iba 2019, J Thromb Haemost 17:1989 | A |
| cpis-vap | Clinical Pulmonary Infection Score | VAP likelihood (0–12; >6 suggests VAP) | Pugin 1991, Am Rev Respir Dis 143:1121 | A |
| lactate-clearance | Lactate Clearance | %clearance = (initial−repeat)/initial×100 | Nguyen 2004, Crit Care Med 32:1637 | A |
| mrc-sum-score | MRC Sum Score (ICU-AW) | 12 muscle groups 0–5, sum 0–60; <48 = ICU weakness | De Jonghe 2002, JAMA 288:2859 | A |

### v113 — Dynamic fluid-responsiveness indices (E, +3)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| ivc-fluid-responsiveness | IVC Collapsibility / Distensibility | Caval index thresholds for preload responsiveness | Barbier 2004, Intensive Care Med 30:1740 | A |
| ppv-svv | Pulse-Pressure / Stroke-Volume Variation | PPV/SVV %; >13/12% predicts responsiveness | Michard 2000, AJRCCM 162:134 | A |
| passive-leg-raise | Passive Leg Raise SV Response | %ΔSV with PLR; ≥10–15% predicts responsiveness | Monnet 2006, Crit Care Med 34:1402 | A |

### v114 — COPD/bronchiectasis exacerbation & sleep (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| decaf-score | DECAF Score (AECOPD) | In-hospital mortality in acute COPD exacerbation (0–6) | Steer 2012, Thorax 67:970 | A |
| bap-65 | BAP-65 Score (AECOPD) | AECOPD mortality + mech-vent risk (5 classes) | Tabak 2009, Arch Intern Med 169:1595 | A |
| bronchiectasis-bsi | Bronchiectasis Severity Index | Mortality/hospitalization risk | Chalmers 2014, AJRCCM 189:576 | A |
| faced-bronchiectasis | FACED Score | Bronchiectasis severity (0–7) | Martínez-García 2014, Eur Respir J 43:1357 | A |
| nosas-score | NoSAS Score | OSA screen (0–17; ≥8 high risk) | Marti-Soler 2016, Lancet Respir Med 4:742 | A |
| ahi-odi-severity | AHI / ODI Severity Classifier | Events/hr → AASM severity bands (3% vs 4% ODI) | AASM Task Force 1999, Sleep 22:667 | B |

### v115 — Pulmonary nodule, PH & pleural infection (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| mayo-spn | Mayo Clinic SPN Malignancy Risk | Malignancy probability of incidental solitary pulm nodule | Swensen 1997, Arch Intern Med 157:849 | A |
| brock-nodule | Brock/PanCan Nodule Risk | Malignancy probability of screen-detected nodule | McWilliams 2013, NEJM 369:910 | A |
| fleischner-2017 | Fleischner Nodule Follow-up | CT surveillance interval by size/type/risk | MacMahon 2017, Radiology 284:228 | B |
| reveal-lite-2 | REVEAL Lite 2 (PAH) | 1-yr PAH survival risk from 6 noninvasive vars | Benza 2021, Chest 159:337 | A |
| rapid-pleural | RAPID Score | 3-month mortality in pleural infection | Rahman 2014, Chest 145:848 | A |

---

## WAVE 4 — Neurology, neurosurgery, neurocritical care, psychiatry (v117–v123, +32)

### v117 — Stroke imaging & thrombolysis prognosis (G/E, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| aspects | ASPECTS | 10-point topographic NCCT MCA ischemia score | Barber 2000, Lancet 355:1670 | B |
| ich-volume-abc2 | ICH Volume (ABC/2) | Ellipsoid hematoma volume from 3 NCCT diameters | Kothari 1996, Stroke 27:1304 | A |
| dragon-stroke | DRAGON Score | Post-IV-tPA 3-month outcome | Strbian 2012, Neurology 78:427 | A |
| hat-score | HAT Score | ICH risk after IV thrombolysis | Lou 2008, Neurology 71:1417 | A |
| sedan-score | SEDAN Score | Symptomatic ICH risk after thrombolysis | Strbian 2012, Ann Neurol 71:634 | A |
| thrive-stroke | THRIVE Score | Post-ischemic-stroke outcome/mortality | Flint 2010, AJNR 31:1192 | A |

### v118 — Hemorrhagic stroke, SAH, IVH & aneurysm (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| modified-fisher | Modified Fisher Scale | Cisternal SAH thickness ± IVH → vasospasm grade 0–4 | Frontera 2006, Neurosurgery 59:21 | A |
| graeb-ivh | Modified Graeb Score | IVH burden across ventricles + horns (0–32) | Morgan 2013, Stroke 44:635 | A |
| bat-score | BAT Score | NCCT hematoma-expansion risk | Morotti 2018, Stroke 49:1163 | A |
| phases | PHASES Score | 5-yr unruptured aneurysm rupture risk | Greving 2014, Lancet Neurol 13:59 | A |
| elapss | ELAPSS Score | Unruptured aneurysm growth risk (3/5-yr) | Backes 2017, Neurology 88:1600 | A |

### v119 — Prehospital LVO severity & cerebrovascular dx (G, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| cpsss | C-STAT / CPSSS | Prehospital LVO severity (gaze, arm, LOC) 0–4 | Katz 2015, Stroke 46:1508 | A |
| fast-ed | FAST-ED | Field LVO triage, 5 NIHSS-derived items 0–9 | Lima 2016, Stroke 47:1997 | A |
| boston-caa | Boston Criteria v2.0 (CAA) | Cerebral amyloid angiopathy diagnostic certainty | Charidimou 2022, Lancet Neurol 21:714 | A |
| cvt-risk | CVT Outcome Risk Score | Poor outcome (mRS>2) in cerebral venous thrombosis | Ferro 2009, Cerebrovasc Dis 28:39 | A |

### v120 — Epilepsy, headache & vertigo (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| stess | STESS | In-hospital mortality risk in status epilepticus | Rossetti 2008, J Neurol 255:1561 | A |
| helps2b | 2HELPS2B | 72-h seizure risk on cEEG (integer→risk lookup) | Struck 2017, JAMA Neurol 74:1419 | A |
| mess-first-seizure | MESS First-Seizure Recurrence | Recurrence risk after a single/early seizure | Kim 2006, Lancet Neurol 5:317 | A |
| pound-migraine | POUND Mnemonic | Bedside migraine likelihood ratio | Detsky 2006, JAMA 296:1274 | A |
| hints | HINTS / HINTS-plus | Central-vs-peripheral acute vestibular syndrome | Kattah 2009, Stroke 40:3504 | A |

### v121 — Neuromuscular: GBS & myasthenia (G, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| egris | EGRIS | Risk of mechanical ventilation in week 1 of GBS | Walgaard 2010, Ann Neurol 67:781 | A |
| megos | mEGOS | Inability to walk unaided at 4 & 26 wk in GBS | Walgaard 2011, Neurology 76:968 | A |
| brighton-gbs | Brighton GBS Criteria | GBS diagnostic-certainty level 1–4 | Sejvar 2011, Vaccine 29:599 | A |
| mgfa | MGFA Class + MG-ADL | Myasthenia severity class + 8-item ADL (0–24) | Jaretzki 2000, Neurology 55:16; Wolfe 1999 | A |

### v122 — General neurology & rehab (G, +3)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| hachinski | Hachinski Ischemic Score | Vascular vs Alzheimer-type dementia (13-item) | Hachinski 1975, Arch Neurol 32:632 | A |
| modified-ashworth | Modified Ashworth Scale | Spasticity grade (0,1,1+,2,3,4) | Bohannon & Smith 1987, Phys Ther 67:206 | A |
| bickerstaff | Bickerstaff Brainstem Encephalitis Criteria | Diagnostic checklist (ophthalmoplegia+ataxia+ΔLOC) | Odaka 2003, Brain 126:2279 | A |

### v123 — Psychiatry (public-domain instruments) (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| aims-tardive | AIMS (Abnormal Involuntary Movement Scale) | Tardive dyskinesia severity (12-item) | Guy 1976, ECDEU Assessment Manual (NIMH PD) | A |
| bfcrs | Bush-Francis Catatonia Rating Scale | Catatonia severity + screening | Bush 1996, Acta Psychiatr Scand 93:129 | A |
| bars-akathisia | Barnes Akathisia Rating Scale | Drug-induced akathisia (global 0–5) | Barnes 1989, Br J Psychiatry 154:672 | A |
| scoff | SCOFF Questionnaire | Eating-disorder screen (0–5; ≥2 positive) | Morgan 1999, BMJ 319:1467 | A |
| ces-d | CES-D | Depression symptom scale (20-item, 0–60) | Radloff 1977, Appl Psychol Meas 1:385 (PD) | A |

---

## WAVE 5 — GI, hepatology, nephrology, acid-base, urology (v124–v131, +44)

### v124 — Hepatology function & fibrosis (E/G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| albi-grade | ALBI Grade | Liver function from albumin + bilirubin (grades 1–3) | Johnson 2015, J Clin Oncol 33:550 | A |
| meld-xi | MELD-XI | MELD excluding INR (bilirubin + creatinine) | Heuman 2007, Liver Transpl 13:30 | A |
| forns-index | Forns Index | Non-invasive HCV fibrosis (age,GGT,plt,chol) | Forns 2002, Hepatology 36:986 | A |
| bard-score | BARD Score | NAFLD advanced-fibrosis rule-out (BMI,AST/ALT,DM) | Harrison 2008, Gut 57:1441 | A |
| fatty-liver-index | Fatty Liver Index (FLI) | Probability of hepatic steatosis (TG,BMI,GGT,waist) | Bedogni 2006, BMC Gastroenterol 6:33 | A |
| lok-index | Lok Index | Predicts cirrhosis (plt, AST/ALT, INR) | Lok 2005, Hepatology 42:282 | A |

### v125 — Hepatology severity & encephalopathy (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| peld-score | PELD | Pediatric End-Stage Liver Disease score | McDiarmid 2002, Transplantation 74:173 | A |
| clif-c-aclf | CLIF-C ACLF | Mortality in acute-on-chronic liver failure | Jalan 2014, J Hepatol 61:1038 | A |
| gahs | Glasgow Alcoholic Hepatitis Score | 28/84-day mortality (age,WBC,urea,INR,bili) | Forrest 2005, Gut 54:1174 | A |
| west-haven-he | West Haven (Conn) HE Grade | Grades hepatic encephalopathy 0–4 | Conn 1977, Gastroenterology 72:573 | A |
| hepatic-steatosis-index | Hepatic Steatosis Index (HSI) | NAFLD screen: 8×(ALT/AST)+BMI(±sex/DM) | Lee 2010, Dig Liver Dis 42:503 | A |

### v126 — GI disease activity & severity (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| cdai-crohns | Crohn's Disease Activity Index | Crohn's clinical activity (8 weighted items, 0–600) | Best 1976, Gastroenterology 70:439 | A |
| uceis | UC Endoscopic Index of Severity | Endoscopic UC severity (0–8) | Travis 2012, Gut 61:535 | A |
| ses-cd | Simple Endoscopic Score for Crohn's | Endoscopic Crohn's severity (0–56) | Daperno 2004, Gastrointest Endosc 60:505 | A |
| haps | Harmless Acute Pancreatitis Score | Rules out severe pancreatitis | Lankisch 2009, Clin Gastroenterol Hepatol 7:702 | A |
| ctsi-balthazar | CT Severity Index (Balthazar) | Pancreatitis CT severity (grade + necrosis, 0–10) | Balthazar 1990, Radiology 174:331 | A |
| modified-marshall | Modified Marshall Organ Score | Organ failure in pancreatitis (resp/renal/CV) | Banks 2013, Gut 62:102 (Revised Atlanta) | B |

### v127 — Nephrology prognosis & AKI staging (G/E, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| kfre | Kidney Failure Risk Equation | 2/5-yr probability of treated kidney failure (CKD G3–5) | Tangri 2011, JAMA 305:1553 | A |
| rifle-aki | RIFLE Criteria (AKI) | AKI stages by Cr/GFR/UOP | Bellomo 2004, Crit Care 8:R204 | A |
| akin-aki | AKIN Criteria (AKI) | AKI stages 1–3 (48-h Cr-rise window) | Mehta 2007, Crit Care 11:R31 | A |
| ufr-dialysis | Ultrafiltration Rate | Fluid-removal rate per kg; CV-risk >13 mL/kg/hr | Flythe 2011, Kidney Int 79:250 | A |

### v128 — Renal excretion & dialysis math (E, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| fepo4 | Fractional Excretion of Phosphate | % filtered phosphate excreted | Walton & Bijvoet 1975, Lancet 2:309 | A |
| femg | Fractional Excretion of Magnesium | % filtered Mg excreted (×0.7 free fraction) | Elisaf 1998, Miner Electrolyte Metab 24:315 | A |
| npcr-pna | nPCR / nPNA | Normalized protein catabolic rate (dialysis nutrition) | Depner & Daugirdas 1996, JASN 7:780 | A |
| std-ktv | Standard Kt/V (stdKt/V) | Frequency-normalized weekly dialysis dose | Leypoldt 2003, Hemodial Int 7:138 | A |
| efwc | Electrolyte-Free Water Clearance | Free-water gain/loss driving dysnatremia | Rose 1986, Am J Med 81:1033 | A |

### v129 — Acid-base compensation & gaps (E, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| stewart-sid-sig | Stewart SID / Strong Ion Gap | Physicochemical acid-base (SID + unmeasured ions) | Stewart 1983, Can J Physiol Pharmacol 61:1444; Figge 1992 | A |
| base-excess | Standard Base Excess | Hgb-corrected titratable base excess/deficit | Siggaard-Andersen 1977, Scand J Clin Lab Invest 37(s146):15 | A |
| resp-acidosis-compensation | Expected HCO₃ — respiratory acidosis | Predicted acute/chronic metabolic compensation | Brackett 1965, NEJM 272:6; Schwartz 1965 | A |
| resp-alkalosis-compensation | Expected HCO₃ — respiratory alkalosis | Predicted acute/chronic compensation | Gennari 1972, J Clin Invest 51:1722 | A |
| met-alkalosis-compensation | Expected PaCO₂ — metabolic alkalosis | Predicted respiratory compensation | Narins & Emmett 1980, Medicine 59:161 | A |
| urine-osmolal-gap | Urine Osmolal Gap | Measured−calculated urine osm; ÷2 ≈ urinary NH₄⁺ | Halperin 1988, Clin Invest Med 11:198 | A |

### v130 — Urology: prostate metrics & risk (E/G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| prostate-volume | Prostate Volume (ellipsoid) | V = AP×TR×CC×0.523 from TRUS/MRI | Terris & Stamey 1991, J Urol 145:984 | A |
| psa-density | PSA Density | Serum PSA ÷ prostate volume (flag >0.15) | Benson 1992, J Urol 147:817 | A |
| psa-velocity | PSA Velocity | Rate of PSA rise (ng/mL/yr) | Carter 1992, JAMA 267:2215 | A |
| psa-doubling-time | PSA Doubling Time | Months to double (ln2/slope of ln-PSA) | Pound 1999, JAMA 281:1591 | A |
| damico-prostate-risk | D'Amico Risk Classification | Low/int/high BCR risk (PSA,Gleason,cT) | D'Amico 1998, JAMA 280:969 | A |
| gleason-grade-group | Gleason Grade Group | Maps Gleason sum/pattern to Grade Groups 1–5 | Epstein 2016, Am J Surg Pathol 40:244 | A |

### v131 — Urology: renal mass, stones, torsion (G/E, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| capra-score | CAPRA Score | 0–10 prostate-cancer recurrence risk | Cooperberg 2005, J Urol 173:1938 | A |
| renal-nephrometry | R.E.N.A.L. Nephrometry Score | Anatomic complexity of renal mass (4–12 +suffix) | Kutikov & Uzzo 2009, J Urol 182:844 | A |
| padua-renal | PADUA Renal Score | Renal-mass complexity / nephron-sparing risk | Ficarra 2009, Eur Urol 56:786 | A |
| stone-nephrolithometry | S.T.O.N.E. Nephrolithometry | PCNL stone-free prediction (5–13) | Okhunov 2013, Urology 81:1154 | A |
| roks-stone-recurrence | ROKS | Risk of 2nd symptomatic kidney stone (2/5/10-yr) | Rule 2014, JASN 25:2878 | A |
| twist-score | TWIST Score | Testicular torsion likelihood (0–7) | Barbosa 2013, J Urol 189:1859 | A |

---

## WAVE 6 — Hematology, oncology, endocrine, infectious disease (v132–v137, +30)

### v132 — Thrombotic microangiopathy & coagulopathy (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| plasmic-ttp | PLASMIC Score | Predicts severe ADAMTS13 deficiency (TTP) (0–7) | Bendapudi 2017, Lancet Haematol 4:e157 | A |
| french-ttp | French TTP Score | Severe ADAMTS13 deficiency (plt, Cr, ANA) (0–3) | Coppo 2010, PLoS One 5:e10208 | A |
| jaam-dic | JAAM DIC Score | Acute DIC (SIRS, plt, FDP, PT-ratio) | Gando 2006, Crit Care Med 34:625 | A |
| ipset-thrombosis | Revised IPSET-Thrombosis (ET) | Thrombosis risk in essential thrombocythemia | Barbui 2015, Blood Cancer J 5:e369 | A |
| cisne | CISNE | Complication risk in stable febrile neutropenia (0–8) | Carmona-Bayonas 2015, J Clin Oncol 33:465 | A |

### v133 — Warfarin dosing & pharmacogenomics (F, +4)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| warfarin-iwpc | IWPC Pharmacogenetic Warfarin Dose | Dose from clinical + CYP2C9/VKORC1 | Klein/IWPC 2009, NEJM 360:753 | A |
| warfarin-gage | Gage Pharmacogenomic Warfarin Dose | Dose from clinical + CYP2C9/VKORC1/CYP4F2 | Gage 2008, Clin Pharmacol Ther 84:326 | A |
| warfarin-init-10mg | Warfarin 10 mg Initiation Nomogram | Days 1–2 fixed 10 mg → INR-driven dosing | Kovacs 2003, Ann Intern Med 138:714 | A |
| warfarin-init-5mg | Warfarin 5 mg Initiation Nomogram | Day 1 = 5 mg → INR-driven daily dose | Crowther 1999, Arch Intern Med 159:46 | A |

### v134 — Plasma-cell & myeloid neoplasm staging (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| myeloma-iss | Multiple Myeloma ISS | Stage I–III (β2-microglobulin + albumin) | Greipp 2005, J Clin Oncol 23:3412 | A |
| myeloma-r-iss | Revised ISS (myeloma) | ISS + LDH + high-risk iFISH → stage I–III | Palumbo 2015, J Clin Oncol 33:2863 | B |
| myeloma-r2-iss | Second-Revision ISS (myeloma) | Additive weighted (ISS/del17p/LDH/t(4;14)/1q21) | D'Agostino 2022, J Clin Oncol 40:3406 | A |
| mgus-risk | Mayo MGUS Risk Stratification | Progression risk (M-spike, isotype, FLC ratio) | Rajkumar 2005, Blood 106:812 | A |
| dipss-mf | DIPSS (Myelofibrosis) | Dynamic survival score | Passamonti 2010, Blood 115:1703 | A |
| dipss-plus-mf | DIPSS-Plus (Myelofibrosis) | DIPSS + plt + transfusion + karyotype | Gangat 2011, J Clin Oncol 29:392 | A |

### v135 — Lymphoma prognostic indices (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| r-ipi | Revised IPI (DLBCL) | 5 factors → Very Good/Good/Poor | Sehn 2007, Blood 109:1857 | A |
| nccn-ipi | NCCN-IPI (DLBCL) | Categorized age/LDH/stage/extranodal/ECOG (0–8) | Zhou 2014, Blood 123:837 | A |
| gelf-criteria | GELF High-Tumor-Burden Criteria | Follicular-lymphoma treat-vs-watch flag | Brice 1997, J Clin Oncol 15:1110 | A |
| hodgkin-ips | Hasenclever IPS (Hodgkin) | 7 adverse factors for advanced Hodgkin (0–7) | Hasenclever 1998, NEJM 339:1506 | A |
| cll-ipi | CLL-IPI | Weighted 0–10 (TP53,IGHV,β2M,stage,age) | CLL-IPI WG 2016, Lancet Oncol 17:779 | A |

### v136 — Endocrine & metabolic indices (E/G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| homa-ir | HOMA-IR (+ HOMA-%B) | Insulin resistance (insulin×glucose/405) | Matthews 1985, Diabetologia 28:412 | A |
| quicki | QUICKI | Insulin sensitivity = 1/[log(ins)+log(glu)] | Katz 2000, JCEM 85:2402 | A |
| tyg-index | Triglyceride-Glucose Index | ln(TG×glucose/2) IR surrogate | Simental-Mendía 2008, Metab Syndr Relat Disord 6:299 | A |
| metabolic-syndrome | Metabolic Syndrome (ATP III/IDF/Harmonized) | Any-3-of-5 vs central-obesity-required criteria | Grundy 2005 Circ 112:2735; Alberti 2009 | B |
| osteoporosis-prescreen | OST / ORAI DXA Pre-Screen | Weight/age indices flagging who needs DXA | Koh 2001 Osteoporos Int 12:699; Cadarette 2000 | A |

### v137 — Infectious disease scores (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| isaric-4c-mortality | ISARIC 4C Mortality Score | In-hospital COVID mortality (0–21) | Knight 2020, BMJ 370:m3339 | A |
| covid-gram | COVID-GRAM Critical Illness | P(critical illness) from 10 admission vars | Liang 2020, JAMA Intern Med 180:1081 | A |
| candida-score | Candida Score (León) | Invasive candidiasis risk in non-neutropenic ICU (0–5) | León 2006, Crit Care Med 34:730 | A |
| vacs-index | VACS Index | 5-yr all-cause mortality in HIV | Tate 2013, AIDS 27:563 | A |
| regiscar-dress | RegiSCAR Score (DRESS) | DRESS diagnostic certainty (7 weighted items) | Kardaun 2013, Br J Dermatol 169:1071 | A |

---

## WAVE 7 — OB/GYN, pediatrics, neonatal (v138–v141, +24)

### v138 — Obstetrics & MFM (E/G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| hadlock-efw | Hadlock Estimated Fetal Weight | EFW (g) from BPD/HC/AC/FL biometry | Hadlock 1985, AJOG 151:333 | A |
| fullpiers | fullPIERS | P(adverse maternal outcome ≤48 h) in preeclampsia | von Dadelszen 2011, Lancet 377:219 | A |
| minipiers | miniPIERS | Adverse maternal outcome (bedside-only inputs) | Payne 2014, PLoS Med 11:e1001589 | A |
| afi | Amniotic Fluid Index | Sum of 4-quadrant pockets; oligo/poly flags | Moore & Cayle 1990, AJOG 162:1168 | B |
| barnhart-hcg | Minimal hCG Rise (Barnhart) | Min viable-IUP 48-h hCG rise; slower = abnormal | Barnhart 2004, Obstet Gynecol 104:50 | A |
| iom-gwg | IOM Gestational Weight Gain | Recommended total + weekly gain by pre-preg BMI | IOM 2009 / ACOG CO 548 | B |

### v139 — Gynecology (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| flamm-vbac | Flamm VBAC Score | Predicted VBAC success (5-factor admission score) | Flamm & Geiger 1997, Obstet Gynecol 90:907 | A |
| roma-ovarian | ROMA | Ovarian malignancy probability (HE4 + CA125) | Moore 2009, Gynecol Oncol 112:40 | B |
| rmi-ovarian | RMI I/II/III | Preop ovarian malignancy index (U×M×CA125) | Jacobs 1990 BJOG; Tingulstad 1996/1999 | A |
| iota-simple-rules | IOTA Simple Rules | Benign/malignant/inconclusive adnexal mass | Timmerman 2008, Ultrasound Obstet Gynecol 31:681 | A |
| rotterdam-pcos | Rotterdam PCOS Criteria | PCOS if ≥2 of 3 features (after exclusion) | Rotterdam ESHRE/ASRM 2004, Hum Reprod 19:41 | B |
| popq-staging | POP-Q Staging | Pelvic organ prolapse stage 0–IV | Bump 1996, AJOG 175:10 | A |

### v140 — Pediatric & neonatal severity (G/N, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| eos-calculator | Neonatal Early-Onset Sepsis (Kaiser) | Posterior EOS probability/1000 (logistic + exam LRs) | Kuzniewicz 2016, Jt Comm J 42:232 | A |
| snappe-ii | SNAPPE-II | Neonatal illness-severity/mortality (0–162) | Richardson 2001, J Pediatr 138:92 | A |
| crib-ii | CRIB-II | Preterm mortality risk (BW,GA,sex,temp,BE) | Parry 2003, Lancet 361:1789 | A |
| rdai-tal | RDAI / Tal Bronchiolitis Severity | Wheeze + retraction bronchiolitis severity | Lowell 1987, Pediatrics 79:939; Tal 1983 | A |
| clinical-dehydration-scale | Clinical Dehydration Scale (CDS) | 4-item pediatric dehydration severity | Goldman 2008, Pediatrics 122:545 | A |
| koff-bladder-capacity | Koff Bladder Capacity | Expected capacity mL = (age+2)×30 | Koff 1983, Urology 21:248 | A |

### v141 — Pediatric growth & dosing (E/N, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| peds-bmi-percentile | Pediatric BMI-for-age Percentile/z | BMI z + percentile via CDC 2000 LMS (2–20 yr) | CDC 2000 / Kuczmarski 2002, Vital Health Stat 11(246) | A |
| who-growth-zscore | WHO Growth z-score (0–2 yr) | Weight/length-for-age z via WHO LMS | WHO MGRS 2006, Acta Paediatr Suppl 450:76 | A |
| mid-parental-height | Mid-Parental Target Height | Predicted adult height ± 6.5 cm | Tanner 1970, Arch Dis Child 45:755 | A |
| corrected-age | Corrected Gestational Age | Corrected age = chronological − (40 − GA) wk | AAP standard (Engle 2004, Pediatrics 114:1362) | A |
| peds-weight-est | Age-Based Weight Estimation (APLS) | Estimated weight (kg) from age bands | Luscombe & Owens 2007, Arch Dis Child 92:412 | A |
| gail-bcrat | Gail Model (BCRAT) | 5-yr + lifetime invasive breast-cancer risk | Gail 1989, JNCI 81:1879 (NCI CARE 2007) | A |

---

## WAVE 8 — Surgery, anesthesia, orthopedics, rheumatology, geriatrics, pharmacy (v142–v148, +42)

### v142 — Surgical & anesthetic risk (G, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| possum | POSSUM | 30-day morbidity + mortality (12 phys + 6 op vars) | Copeland 1991, Br J Surg 78:355 | A |
| p-possum | Portsmouth POSSUM | Recalibrated POSSUM mortality | Prytherch 1998, Br J Surg 85:1217 | A |
| sort | Surgical Outcome Risk Tool | 30-day mortality from 6 preop variables | Protopapa 2014, Br J Surg 101:1774 | A |
| goldman-cardiac-risk | Goldman Cardiac Risk Index | Preop cardiac risk, 9 weighted factors → 4 classes | Goldman 1977, NEJM 297:845 | A |
| wilson-airway | Wilson Risk Sum Score | Difficult-intubation risk (5 anatomic factors) | Wilson 1988, Br J Anaesth 61:211 | A |
| surgical-risk-scale | Surgical Risk Scale | In-hospital mortality = urgency + ASA + BUPA grade | Sutton 2002, Br J Surg 89:763 | A |

### v143 — Frailty & geriatric-oncology screening (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| mfi-5 | Modified 5-Item Frailty Index | Frailty deficit count 0–5 | Subramaniam 2018, J Am Coll Surg 226:173 | A |
| mfi-11 | Modified 11-Item Frailty Index | Accumulated-deficit frailty fraction | Velanovich 2013, J Surg Res 183:104 | A |
| frail-scale | FRAIL Scale | 5-item frailty screen (0–5) | Morley 2012, J Nutr Health Aging 16:601 | A |
| ves-13 | Vulnerable Elders Survey-13 | 0–10; ≥3 = vulnerable | Saliba 2001, J Am Geriatr Soc 49:1691 | A |
| carg-toxicity | CARG Chemo-Toxicity Tool | Grade 3–5 chemo-toxicity risk (age ≥65) | Hurria 2011, J Clin Oncol 29:3457 | A |

### v144 — Orthopedic fracture classification (G/N, +6)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| gustilo-anderson | Gustilo-Anderson Open Fracture | Open fracture severity I/II/IIIA/IIIB/IIIC | Gustilo & Anderson 1976, JBJS Am 58:453 | A |
| garden-classification | Garden Classification | Femoral neck fracture grade I–IV | Garden 1961, JBJS Br 43:647 | A |
| weber-ankle | Danis-Weber Ankle Classification | Distal fibula fracture level A/B/C | Weber 1966 (monograph) | B |
| schatzker-classification | Schatzker Classification | Tibial plateau fracture I–VI | Schatzker 1979, Clin Orthop Relat Res 138:94 | A |
| salter-harris | Salter-Harris Classification | Physeal fracture type I–V | Salter & Harris 1963, JBJS Am 45:587 | A |
| neer-classification | Neer Classification | Proximal humerus fracture (displaced-part count) | Neer 1970, JBJS Am 52:1077 | A |

### v145 — Orthopedic risk & osteoarthritis (G/E, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| frykman-classification | Frykman Classification | Distal radius fracture I–VIII | Frykman 1967, Acta Orthop Scand Suppl 108 | A |
| mirels-score | Mirels Score | Impending pathologic fracture risk (4–12) | Mirels 1989, Clin Orthop Relat Res 249:256 | A |
| kellgren-lawrence | Kellgren-Lawrence OA Grade | Radiographic OA severity 0–4 | Kellgren & Lawrence 1957, Ann Rheum Dis 16:494 | A |
| pittsburgh-knee-rule | Pittsburgh Knee Rules | Knee x-ray indication (mechanism + age/weight-bearing) | Seaberg & Jackson 1994, Am J Emerg Med 12:541 | A |
| compartment-delta-pressure | Compartment Delta Pressure | Δ = diastolic − compartment pressure; <30 → fasciotomy | McQueen & Court-Brown 1996, JBJS Br 78:99 | A |

### v146 — Spinal tumor & trauma classification (G, +5)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| sins-score | Spinal Instability Neoplastic Score | Tumor spinal instability (0–18) | Fisher 2010, Spine 35:E1221 | A |
| tokuhashi-revised | Revised Tokuhashi Score | Spinal-metastasis prognosis (0–15) | Tokuhashi 2005, Spine 30:2186 | A |
| tomita-score | Tomita Surgical Strategy Score | Spinal-metastasis surgical strategy (2–10) | Tomita 2001, Spine 26:298 | A |
| tlics-score | Thoracolumbar Injury Classification (TLICS) | T1–L5 trauma triage (0–10) | Vaccaro 2005, Spine 30:2325 | A |
| slic-score | Subaxial Cervical Spine Injury (SLIC) | C3–C7 trauma triage (0–10) | Vaccaro 2007, Spine 32:2365 | A |

### v147 — Rheumatology activity & classification (G, +7)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| cdai-ra | Clinical Disease Activity Index (RA) | SJC28+TJC28+patient/MD global (0–76), lab-free | Aletaha 2005, Arthritis Res Ther 7:R796 | A |
| sdai-ra | Simplified Disease Activity Index (RA) | CDAI inputs + CRP mg/dL (0–86) | Smolen 2003, Rheumatology 42:244 | A |
| acr-eular-2010-ra | 2010 ACR/EULAR RA Classification | 4-domain score 0–10; ≥6 = definite RA | Aletaha 2010, Arthritis Rheum 62:2569 | A |
| sledai-2k | SLEDAI-2K | SLE disease activity (weighted descriptors, 0–105) | Gladman 2002, J Rheumatol 29:288 | A |
| gout-acr-eular-2015 | 2015 ACR/EULAR Gout Classification | Entry + sufficient bypass + weighted ≥8 | Neogi 2015, Arthritis Rheumatol 67:2557 | A |
| caspar | CASPAR Psoriatic Arthritis Criteria | Inflammatory disease entry + weighted ≥3 | Taylor 2006, Arthritis Rheum 54:2665 | A |
| fibromyalgia-acr-2016 | 2016 ACR Fibromyalgia Criteria | WPI + symptom-severity criteria | Wolfe 2016, Semin Arthritis Rheum 46:319 | A |

### v148 — Rheumatology (vasculitis/SpA), palliative & pharmacy (G/F/E, +8)
| id | Name | Computes | Citation | Class |
|---|---|---|---|---|
| asdas | Ankylosing Spondylitis Disease Activity Score | Weighted composite of 4 NRS + CRP/ESR | Lukas 2009, Ann Rheum Dis 68:18 | A |
| ffs-2011 | Five-Factor Score (2011) | Vasculitis 5-yr mortality (4 factors) | Guillevin 2011, Medicine 90:19 | A |
| gca-acr-eular-2022 | 2022 ACR/EULAR GCA Classification | Age ≥50 entry + weighted ≥6 | Ponte 2022, Ann Rheum Dis 81:1647 | A |
| palliative-prognostic-index | Palliative Prognostic Index (PPI) | Survival band from intake/edema/dyspnea/delirium | Morita 1999, Support Care Cancer 7:128 | A |
| palliative-prognostic-score | Palliative Prognostic Score (PaP) | 3 risk groups (dyspnea,anorexia,KPS,CPS,WBC,lymph%) | Maltoni 1999, J Pain Symptom Manage 17:240 | A |
| opioid-conversion | Opioid Equianalgesic / Rotation Converter | PO↔IV + drug switch with cross-tolerance reduction + patch sizing | ASHP/McPherson equianalgesic constants | A |
| naranjo | Naranjo ADR Probability Scale | Likelihood an event was drug-caused (−4 to +13) | Naranjo 1981, Clin Pharmacol Ther 30:239 | A |
| valproate-correction | Valproate Albumin Correction | Normalizes total valproate for hypoalbuminemia | Hermida & Tutor 2005, Ther Drug Monit 27:619 | A |

---

## Program totals

<!-- catalog-truth:historical (program-plan totals; 432 is the pre-program catalog size, 679 the planned post-program target, not the live count) -->
Eight waves, 48 feature specs (v101–v148), **+247 tiles, 432 → 679.**

Per-wave: W1 +26, W2 +30, W3 +19, W4 +32, W5 +44, W6 +30, W7 +24, W8 +42.
(26+30+19+32+44+30+24+42 = 247.)

## Deepening sub-program (no new tiles; extend existing)

See [spec-v100](spec-v100.md) §7. Highlights gathered from the sweep:
- `chads` → annual-stroke-rate table + cross-link `chads2`/`cha2ds2-va` migration.
- `qtc-suite` → add Rautaharju correction + QTc>500/ΔQTc>60 flags.
- `aortic-valve-area` → dimensionless index (DVI) + low-flow/low-gradient AS flag.
- `ascvd`/`prevent` → statin-benefit/risk-band layer + CAC modifier nudge.
- `lvh-criteria` → Cornell product + Romhilt-Estes point score.
- `wells-pe-geneva` → simplified Revised Geneva mode (1-pt-per-item).
- `naloxone` → maintenance infusion (two-thirds rule).
- `fena-feurea` → FE-phosphate / FE-magnesium modes (or sibling tiles).
- `anion-gap-dd` → delta ratio + expected-compensation cross-check, link compensation tiles.
- `ktv-urr` → stdKt/V + nPCR outputs.
- `osmolal-gap` → ethanol input + urine osmolal-gap mode.
- `meld-childpugh` → ALBI grade + MELD-XI surfaced.
- `mentzer` → sibling discrimination indices (Green-King, Shine-Lal, England-Fraser, RDWI).
- `ldl-calc` → non-HDL + remnant cholesterol outputs.
- `das28` → CDAI/SDAI suite linkage.
- `corrected-phenytoin` → valproate-correction + ESRD phenytoin variant.
- `charlson`/`cfs` → frailty/comorbidity panel (mFI-5/mFI-11/FRAIL/VES-13/G8).
- `ecog-karnofsky` → wire into PPI/PaP palliative cluster.
- `ich-score` → inline ABC/2 volume sub-calc + Graeb/IVH linkage.
- `abcd2` → ABCD3-I extension.
- `gold-spirometry` → GOLD 2024 ABE group axis (mMRC-only).
- `vent-sbt-peep`/`rsbi` → cuff-leak test + NIF/MIP weaning thresholds.
- `ecmo-titration` → RESP (VV) + SAVE (VA) survival scores.
- `due-date`/`preg-dating` → ACOG redating precedence + best-EDD reconciler.
- `neo-phototherapy`/`bhutani-bilirubin` → AAP 2022 exchange thresholds + B/A ratio.
- `stone-score` → cross-link ROKS + S.T.O.N.E./Guy's PCNL complexity.

## Permanently excluded (copyrighted / licensed / non-deterministic) — governance list

Cognition: MoCA, MMSE, SLUMS, CDR, AD8, FAST/GDS-Reisberg, IQCODE, Cornell CSDD.
Movement/MS: MDS-UPDRS (prohibits electronic implementation), EDSS/Neurostatus, QMG (Mapi),
ASIA/ISNCSCI (ND license). Headache/pain: HIT-6, DN4, LANSS, Oswestry ODI, NDI.
Psychiatry: BDI/BDI-II, QIDS, LSAS, PANSS, Conners, ASRS, EAT-26, CRAFFT, ISI, PSQI,
Zung, YMRS. Pulm/sleep: CAT, ACT, SGRQ, SNOT-22, St George's. Bone: FRAX (licensed
coefficients — OST/ORAI is the free pre-screen substitute), Tyrer-Cuzick/IBIS.
Onco: Oncotype DX, MammaPrint, Magee, RECIST/iRECIST, ACR TI-RADS, Lung-RADS, CTCAE.
Endocrine: HOMA2 (Oxford nonlinear), FINDRISC, Martin-Hopkins LDL. Geri/palliative:
PPS (Victoria Hospice), MNA/MNA-SF (Nestlé), Edmonton Frail Scale, ORT, SOAPP-R, COMM,
ACB/ARS, CCI®. Surgery: ACS-NSQIP risk calculator (mFI-5/11 are free surrogates).
ICU: APACHE III/IV (Cerner), MPM-III. Uro/GI: IPSS/AUA-SI, IIEF/SHIM, FibroTest/
FibroSure, ELF, FibroScan, KDPI/KDRI (annual scaling → live-feed). OB: Grobman VBAC
(paywalled coeffs — Flamm is the free substitute), IOTA ADNEX, QUiPP, Broselow,
sFlt-1/PlGF (assay echo). Non-deterministic: methadone conversion (variable ratio),
buprenorphine conversion, corticosteroid taper, STOPP/START (no aggregate score),
Surprise Question, SCAI shock stages (gestalt). Each feature spec re-confirms the
license status of the instruments it ships and names any it deliberately excludes.
