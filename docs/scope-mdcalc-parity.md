# scope: MDCalc-equivalent catalog parity, on Sophie's terms

> Status: committed (2026-05-17). Long-horizon scope statement.
> Companion to [docs/spec-v10.md](spec-v10.md) (positioning) and
> [docs/spec-v11.md](spec-v11.md) (correctness floor).
>
> This is not a roadmap with dates. It is the **direction of
> travel**: Sophie intends to eventually carry every clinically
> actionable calculator a healthcare worker would otherwise reach
> for MDCalc to find, plus the billing / coding / regulatory
> surface MDCalc does not cover. The commitment is to the
> *direction*; the speed is bounded by the [spec-v11](spec-v11.md)
> quality floor and the solo-developer cadence the project runs at.

## 1. The commitment

Over time — measured in years, not quarters — sophiewell.com will
host every calculator that meets all of:

1. **Actionable.** The calculator produces a result a clinician
   acts on (score → risk band, formula → dose / rate / fluid,
   threshold → admit / discharge / order). "Look at this reference
   table" tiles are deferred to the reference-tile contract
   already in [spec-v8 §3.1](spec-v8.md); they are valid but they
   are not the priority.
2. **Cited.** The calculator has a primary published source —
   peer-reviewed paper, society guideline, regulatory publication,
   or an agency dataset. No "common practice" tiles whose source
   is folk knowledge.
3. **Deterministic.** Pure function of inputs. No model in the
   loop, no external call at render time.
4. **In Sophie's audience** ([spec-v10 §2.1](spec-v10.md)): used
   by bedside clinicians, billers / coders, EMS / field-medicine
   workers, healthcare educators, or by patients via the existing
   simple-decoder surface.

The target is **not** "match MDCalc's count." MDCalc ships some
tiles Sophie will deliberately skip (single-center validations,
sponsored disease-awareness calculators, tools whose primary use
is marketing a drug class). The target is **the actionable subset
of MDCalc, plus everything MDCalc does not cover** (billing
codes, claims-adjustment reasons, NSA eligibility, ABN, COBRA
timeline, ACA SEP, CMS-1500, UB-04, HIPAA RoA, the patient-
literacy decoders, the field-medicine and EMS workflow tiles).

> **Amended by [spec-v29](spec-v29.md):** The "everything MDCalc
> does not cover" clause is **narrowed**. The surviving billing /
> coding / regulatory surface is now only the *calculator-shaped*
> rows (time-based E/M selector, NDC 10/11 converter, HIPAA
> 60-day breach clock, and the patient-facing workflow
> *generators* in Group H). Code-reference indexes, patient-
> administrative infographics, reference tables of normal values,
> hazmat / occupational reference cards, and single-class clinical
> reference cards are now permanently out of scope per
> [spec-v29 §3](spec-v29.md). The one-line test is now: **a tile
> that does not consume at least one user input and produce a
> computed output is not in scope for Sophie.** v29 deletes 47
> reference-only tiles and adds 20 nurse-bedside calculators;
> the catalog shrinks for the first time in the project's
> history. (The spec-v29 ledger projected 603 -> 576 from an
> over-counted base; actual at v29 close is 230 tiles; v30
> close — [spec-v30](spec-v30.md), which re-admits two
> thermal-emergency staging tiles as decision tools — is 232;
> v31 close — [spec-v31](spec-v31.md), which adds the Beers
> deprescribing checker — is 233; v32 close —
> [spec-v32](spec-v32.md), which adds three non-verbal pain
> scales (FLACC, PAINAD, NIPS) — is 236; v33 close —
> [spec-v33](spec-v33.md), which adds N-PASS, CRIES, and POSS —
> is 239; v34 close — [spec-v34](spec-v34.md), which adds
> COMFORT-B, WAT-1, and SBS — is 242; v35 close —
> [spec-v35](spec-v35.md), which adds SOS as the WAT-1 companion
> — is 243; v36 close — [spec-v36](spec-v36.md), which adds
> MEOWS as the maternal track-and-trigger — is 244; v37 close —
> [spec-v37](spec-v37.md), which adds CPSS and LAMS as the
> prehospital / ED stroke triage scales — is 246; v38 close —
> [spec-v38](spec-v38.md), which adds RACE as the prehospital
> LVO predictor companion to LAMS — is 247; v39 close —
> [spec-v39](spec-v39.md), which adds ROSIER as the ED
> stroke-recognition scale with mimic discrimination — is 248;
> v40 close — [spec-v40](spec-v40.md), which adds GUSS as the
> post-stroke bedside dysphagia screen — is 249; v41 close —
> [spec-v41](spec-v41.md), which adds FOUR Score as the ICU
> coma scale for intubated patients — is 250; v42 close —
> [spec-v42](spec-v42.md), which adds Katz ADL as the geriatric
> / discharge-planning functional-status index — is 251; v43
> close — [spec-v43](spec-v43.md), which adds Lawton IADL as the
> instrumental-ADL companion to Katz — is 252; v44 close —
> [spec-v44](spec-v44.md), which adds the Barthel Index as the
> rehab-nursing weighted ADL — is 253; v45 close —
> [spec-v45](spec-v45.md), which adds the C-SSRS Screener as the
> bedside suicide-risk screening tile — is 254; v46 close —
> [spec-v46](spec-v46.md), a CI / source-of-truth pass that adds
> the catalog-truth invariants but **zero new tiles** — is 254;
> v50 close — [spec-v50](spec-v50.md), a governance pass that
> codifies the eight posture commitments as automated checks and
> ships the public `/commitments/` page but adds **zero new
> tiles** — is 254; v52 close — [spec-v52](spec-v52.md), which
> adds the Prior-Auth Packet Linter (`pa-lint`) as the first
> instance of the new `shape: 'document-linter'` tile shape
> (the existing 254 default to `shape: 'numeric'`) — is 255;
> v53/v54 close — output-safety and citation-integrity hardening
> passes with **zero new tiles** — is 255; v55 close —
> [spec-v55](spec-v55.md), which adds 13 bedside hematology,
> renal/acid-base, and oxygenation calculators — is 268; v56
> close — [spec-v56](spec-v56.md), which adds 13 weight-based
> dosing, infusion-titration, and bedside-toxicology calculators
> — is 281; v57 close — [spec-v57](spec-v57.md), which adds 14
> brief screeners, decision rules, and triage scores — is 295; v58 close — adds 12 neonatal, maternal, and pediatric/adult ICU bedside scores — is 307; v61 close — [spec-v61](spec-v61.md), which adds 12 bedside medication-safety, electrolyte/fluid, and OB/peds tiles — is 319; v62 Part B — [spec-v62](spec-v62.md), which adds all 9 planned ICU-infusion / med-surg / OB-neonatal tiles (wave 1: 7 unambiguous tiles; wave 2: the two pinned-constant tiles `norepi-equiv` and `neo-phototherapy`) and converts the two residual static reference tables (`peds-dose`, `anticoag-reversal`) into §3 input-driven calculators (no count change for the conversions) — is 328; v63 Part B — [spec-v63](spec-v63.md), the ops-side counterpart: a shared regulatory-deadline engine (`lib/deadline.js`) plus five ops calculators (Medicare appeal-level deadlines, claim timely-filing, the 2021 E/M Medical-Decision-Making level, the prior-authorization decision clock, and the 60-day overpayment clock) — is 333; v64 — [spec-v64](spec-v64.md), which adds the single `calcium-replacement` calculator (IV-calcium dose, elemental calcium, and the calcium-gluconate↔chloride equivalence — the electrolyte the K/Mg/Phos `electrolyte-replacement` ladder omits) — is 334; v65 — [spec-v65](spec-v65.md), three bedside-physiology tiles a nurse still does on paper (`o2-cylinder-duration` time-to-empty, `minute-ventilation` + target-PaCO2 rate, `cerebral-perfusion-pressure` CPP = MAP − ICP) — is 337; v78 — [spec-v78](spec-v78.md), the first feature spec of the [spec-v77](spec-v77.md) billing & coding program, introduces **Group B "Billing & Reimbursement"** and the MPFS reimbursement engine: five deterministic, integer-cents, CMS-cited calculators (`rvu-payment` the locality-priced allowed amount, `mppr` the multiple-procedure reduction, `bilateral-pay` the modifier-50 indicator math, `multi-surgeon-pay` the assistant/co/team percentages, `sequestration-adjust` the 2% cut) — is 342; v79 — [spec-v79](spec-v79.md), the program's second feature spec, adds five claim-edit / modifier decision engines (`ncci-ptp` the NCCI procedure-to-procedure edit & modifier-bypass checker, `mue-check` the Medically Unlikely Edits units adjudication by MAI 1/2/3, `modifier-x-selector` the 59-vs-X{EPSU} decision, `global-period` the global-surgery package date math & required modifier, `modifier-order` the pricing-before-informational sequencing) — is 347; v80 — [spec-v80](spec-v80.md), the program's third feature spec, completes the E/M surface with six E/M & time-based coding engines (`em-mdm-2023` the 2-of-3 MDM level across every setting — inpatient/observation, ED, nursing facility, home — not just the office; `critical-care-time` the 99291/99292 aggregate-time units; `split-shared` the substantive-portion determiner & FS modifier; `prolonged-services` the 99417/99418-vs-G2212/G0316 unit calculator; `therapy-units` the 8-minute rule vs the Rule of Eights; `anesthesia-units` the (base+time+modifying)×CF fee with the medical-direction percentage) — is 353; v81 — [spec-v81](spec-v81.md), the program's fourth feature spec, adds three drug & infusion billing engines (`ndc-hcpcs-units` the dose→HCPCS billing-unit converter with the rounding rule and non-multiple flag, `drug-wastage` the single-dose-vial JW/JZ units with the multi-dose refusal gate and least-waste vial search, `infusion-hierarchy` the 96360-96379 initial-code picker chosen by the CMS hierarchy not chronology) — is 356; v82 — [spec-v82](spec-v82.md), the program's fifth feature spec, adds four patient-responsibility & coordination-of-benefits calculators in **Group C "Patient Bill & Insurance Tools"** (`medicare-cost-share` the Part A/B/SNF beneficiary liability, `cob-calc` the coordination-of-benefits / Medicare-Secondary-Payer secondary payment & patient residual under each named method, `allowed-amount` the contractual write-off vs patient balance with the in-network balance-bill-prohibited gate, `nsa-cost-share` the No Surprises Act QPA-based cost-share cap) — is 360; v83 — [spec-v83](spec-v83.md), the program's sixth and final feature spec, adds four claim-integrity validators (`npi-validate` the NPI Luhn check-digit validate/generate, `mbi-validate` the Medicare Beneficiary Identifier position-grammar check, `icd10-validate` the ICD-10-CM structural & 7th-character-specificity check, `era-balance` the 835/EOB remittance-balancing reconciliation) and two facility pricers (`drg-payment` the IPPS DRG weight × wage-adjusted-base estimate with the per-diem transfer reduction, `apc-payment` the OPPS APC weight × conversion-factor estimate with status-indicator packaging and the multiple-procedure discount), completing the spec-v77 billing & coding program (337 → 366, +29) — is 366; v86 — [spec-v86](spec-v86.md), the first feature spec of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds three deterministic toxicology decision rules (`serotonin-toxicity` the Hunter Serotonin Toxicity Criteria, `salicylate-toxicity` the EXTRIP evidence-based hemodialysis indication, `toxic-alcohol` the ethanol-corrected osmolar gap + AACT fomepizole indication) — is 369; v87 — [spec-v87](spec-v87.md), the program's second feature spec, adds three critical-care physiology calculators in Group E (`hemodynamic-suite` the PA-catheter cardiac-index / stroke-volume / SVR / PVR resistance suite reporting PVR in both dynes·s·cm⁻⁵ and Wood units per ESC/ERS 2022, `mechanical-power` the Gattinoni simplified mechanical power of ventilation with the >17 J/min VILI-risk flag, `dead-space` the Bohr-Enghoff Vd/Vt dead-space fraction with the EtCO₂-surrogate caveat) — is 372; v88 — [spec-v88](spec-v88.md), the program's third feature spec, adds three high-acuity endocrine/oncology calculators (`dka-hhs` the ADA hyperglycemic-crisis classification — DKA vs HHS with the mild/moderate/severe DKA grading, computed anion gap, and effective serum osmolality, in Group G; `calvert-carboplatin` the AUC-based carboplatin dose by the Calvert formula with the FDA estimated-GFR cap at 125 mL/min shown as a visible substitution, in Group F; `tls-cairo-bishop` the Cairo-Bishop tumor-lysis-syndrome laboratory/clinical grading with the 25%-change-from-baseline branch and the corrected-calcium criterion, in Group G) — is 375; v89 — [spec-v89](spec-v89.md), the program's fourth and final feature spec, closing it (366 → 379, +13), adds four subspecialty calculators in Group G (`das28` the DAS28-ESR/DAS28-CRP rheumatoid-arthritis disease-activity score with the EULAR remission/low/moderate/high bands — the catalog's first rheumatology tile, `kings-college` the King's College Criteria for transplant referral in acetaminophen-induced acute liver failure with the pH limb, the three-part coagulopathy/renal/encephalopathy limb, and the Bernal lactate modification, `asa-ps` the ASA Physical Status classification I–VI with the E-modifier rules enforced, `surgical-apgar` the Gawande intraoperative 0–10 outcome score distinct from the neonatal Apgar) — is 379; v90 — [spec-v90](spec-v90.md), the first feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds six deterministic cardiology/ECG calculators (`ecg-axis` the mean frontal-plane QRS axis by hexaxial atan2 geometry with the all-isoelectric indeterminate-axis guard, in Group E; `lvh-criteria` the Sokolow-Lyon and Cornell ECG-LVH voltage criteria with the sex-specific Cornell threshold, in Group G; `timi-stemi` the Morrow 2000 TIMI risk score for STEMI with the 30-day mortality band, in Group G; `duke-treadmill` the Mark 1987 exercise-test prognosis with the cited five-year survival, in Group E; `cardiac-power-output` the Fincke CPO = MAP×CO/451 with the <0.6 W cardiogenic-shock threshold, in Group E; `aortic-valve-area` the continuity-equation aortic valve area with the dimensionless index and the ASE/EACVI 2017 + 2020 ACC/AHA severity bands, in Group E) — is 385; v91 — [spec-v91](spec-v91.md), the second feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic pulmonary-function / chronic-respiratory calculators that fill the chronic-respiratory gap beside the acute surface (`gold-spirometry` the GOLD spirometric COPD grade off post-bronchodilator FEV1/FVC < 0.70 and FEV1 %predicted, in Group G; `bode-index` the Celli 2004 multidimensional COPD prognosis 0–10 with the 4-year survival quartile, in Group G; `gap-ipf` the Ley 2012 GAP index for idiopathic pulmonary fibrosis with the cannot-perform-DLCO limb and stage mortality, in Group G; `predicted-spirometry` the GLI-2012 LMS predicted FEV1/FVC/ratio + lower-limit-of-normal from compiled coefficient/spline constants, in Group E; `mmrc-dyspnea` the Bestall 1999 modified MRC dyspnea grade 0–4 that feeds BODE and the GOLD ABE assessment, in Group G) — is 390; v92 — [spec-v92](spec-v92.md), the third feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic nephrology calculators that close the chronic / procedural renal gap beside the existing filtration / injury / dosing surface (`ckd-staging` the KDIGO CKD G×A risk heat-map cell from eGFR and UACR, in Group G; `uacr-upcr` the spot urine albumin/protein-to-creatinine ratios with the estimated 24-hour excretion and the KDIGO A-stage, in Group E; `ktv-urr` the hemodialysis adequacy URR + Daugirdas single-pool Kt/V against the KDOQI targets, in Group E; `mehran-cin` the Mehran 2004 contrast-induced-nephropathy risk score with the CIN / dialysis bands, in Group G; `ckd-epi-cystatin` the 2021 race-free CKD-EPI cystatin-C / combined / creatinine eGFR, in Group E) — is 395; v93 — [spec-v93](spec-v93.md), the fourth feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds six deterministic hepatology & GI disease-activity instruments that close the catalog's liver/gut gap beside the existing meld-childpugh / fib4 / apri / ranson-bisap / maddrey-lille spine (`nafld-fibrosis` the Angulo 2007 NAFLD Fibrosis Score with the advanced-fibrosis cutoffs, `glasgow-imrie` the modified Glasgow (Imrie) eight-item 48-hour pancreatitis severity score, `truelove-witts` the Truelove & Witts acute ulcerative-colitis severity classification, `harvey-bradshaw` the Harvey-Bradshaw index of Crohn's disease activity, `mayo-uc` the Mayo score / partial Mayo for ulcerative colitis, `milan-criteria` the Mazzaferro 1996 Milan criteria for HCC transplant eligibility, all in Group G) — is 401; v94 — [spec-v94](spec-v94.md), the fifth feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic hematology & oncology prognostic scores that close the malignancy-prognosis gap beside the existing heme bedside cluster (anc / khorana / four-ts / isth-dic / tls-cairo-bishop) (`hscore-hlh` the Fardet 2014 HScore for reactive hemophagocytic syndrome with the published probability curve and the >= 169 cutoff, `ipss-r-mds` the Greenberg 2012 revised IPSS-R for myelodysplastic syndromes with the cited median survival and AML-evolution per category, `flipi` the Solal-Celigny 2004 FLIPI plus the 1993 IPI five-factor lymphoma indices, `mascc` the Klastersky 2000 MASCC risk index for febrile neutropenia with the >= 21 low-risk cut, `sokal-cml` the Sokal 1984 relative risk plus the Pfirrmann 2016 ELTS score for chronic myeloid leukemia, all in Group G) — is 406; v95 — [spec-v95](spec-v95.md), the sixth feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds six deterministic neurology outcome scales and structural grading systems that close the longitudinal-neurology gap beside the acute scores (nihss / ich-score / hunt-hess-wfns / four-score / abcd2) (`mrs` the van Swieten 1988 modified Rankin Scale with the good-outcome 0-2 stroke-trial dichotomy, `gose` the Wilson 1998 Glasgow Outcome Scale - Extended with the legacy 5-point GOS mapping, `hoehn-yahr` the Hoehn & Yahr 1967 Parkinson staging in both the original 1-5 and the modified half-step variants, `spetzler-martin` the Spetzler-Martin 1986 AVM surgical grade with the supplemented Lawton-Young 2010 total, `house-brackmann` the House-Brackmann 1985 facial-nerve function grade, `midas` the Stewart 2001 Migraine Disability Assessment, all in Group G) — is 412; v96 — [spec-v96](spec-v96.md), the seventh feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds six deterministic psychiatry rating scales that sit one rung above the brief self-report screeners (phq9 / gad7 / cssrs / gds15 / epds / auditc) — the clinician-rated severity scales a psychiatrist uses to measure depression / anxiety / OCD / PTSD severity and track treatment response (`hamd` the Hamilton 1960 17-item Hamilton Depression Rating Scale, `hama` the Hamilton 1959 14-item Hamilton Anxiety Rating Scale, `madrs` the Montgomery-Asberg 1979 change-sensitive depression scale, `mdq` the Hirschfeld 2000 Mood Disorder Questionnaire bipolar-spectrum three-gate screen, `ybocs` the Goodman 1989 Yale-Brown Obsessive Compulsive Scale, `pcl5` the Blevins 2015 PTSD Checklist for DSM-5, all in Group G) — is 418; v97 — [spec-v97](spec-v97.md), the eighth feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic perioperative risk instruments one rung above the screening indices already in the catalog (rcri / ariscat / lemon / apfel / asa-ps / surgical-apgar) — two published logistic-regression probability models (`gupta-mica` the Gupta PK 2011 perioperative MI/cardiac-arrest probability, `gupta-respiratory-failure` the Gupta H 2011 postoperative respiratory-failure probability), two validated weighted indices (`arozullah-pneumonia` the Arozullah 2001 postoperative pneumonia risk index mapped to its five cited risk classes, `el-ganzouri` the el-Ganzouri 1996 seven-factor difficult-intubation index with the >= 4 difficult-laryngoscopy threshold), and a preoperative point-score mortality model (`pospom` the Le Manach 2016 Preoperative Score to Predict Postoperative Mortality mapped to the published in-hospital-mortality table), all in Group G) — is 423; v98 — [spec-v98](spec-v98.md), the ninth feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds four deterministic pediatric decision rules and prognostic scores that fill confirmed gaps after a full sweep of Group N and the existing Group-G pediatric scores (`kawasaki-criteria` the AHA 2017 classic-vs-incomplete Kawasaki diagnostic algorithm, `kocher-criteria` the Kocher 1999 four-predictor septic-arthritis-vs-transient-synovitis probability, `pim3` the Straney 2013 Paediatric Index of Mortality 3 logistic equation, `catch-head` the Osmond 2010 CATCH rule for CT in childhood minor head injury as the validated alternative to pecarn-head, all in Group G) — is 427; v99 — [spec-v99](spec-v99.md), the tenth and final feature spec of **Wave 2** and the closing spec of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic infectious-disease, critical-care, and burns decision rules (`duke-endocarditis` the 2023 Duke-ISCVID modified Duke criteria for infective endocarditis, `pitt-bacteremia` the Paterson 2004 Pitt Bacteremia Score, `saps-ii` the Le Gall 1993 Simplified Acute Physiology Score II point total and mortality logistic as the adult-ICU companion to apache2, `lund-browder` the Lund-Browder 1944 age-adjusted %TBSA estimator with the adult Rule of Nines cross-check that feeds burn-fluid, `refeeding-risk` the NICE CG32 refeeding-syndrome risk stratification, all in Group G), completing the spec-v85 Advanced Clinical Calculators program (366 → 432, +66) — is 432; v101 — [spec-v101](spec-v101.md), the first feature spec of **Wave 1** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds five deterministic atrial-fibrillation stroke-risk and QT-prolongation instruments beside the existing combined `chads` view and the `qtc-suite` corrected-interval tile (`chads2` the Gage 2001 CHADS2 score with the NRAF annual-stroke-rate table, `cha2ds2-va` the 2024 ESC sex-removed CHA2DS2-VA, `chads-65` the 2020 CCS/CHRS Canadian age-65 anticoagulation pathway, `atria-stroke` the Singer 2013 ATRIA Stroke Risk Score with its dual age-by-prior-stroke column, `tisdale-qtc` the Tisdale 2013 inpatient QT-prolongation risk score, all in Group G) — is 437; v102 — [spec-v102](spec-v102.md), the second feature spec of **Wave 1** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds four deterministic heart-failure prognosis, HFpEF-likelihood, and cardiogenic-shock mortality instruments (`maggic` the Pocock 2013 integer-point 1-/3-year mortality model with its age×EF and SBP×EF interactions, `h2fpef` the Reddy 2018 six-item HFpEF-probability score, `hfa-peff` the 2019 ESC HFA-PEFF stepwise diagnostic score, `cardshock-score` the Harjola 2015 cardiogenic-shock in-hospital-mortality score, all in Group G); the fifth proposed tile `gwtg-hf` is DEFERRED because its per-band point table could not be verified from a primary source — is 441; v103 — [spec-v103](spec-v103.md), the third feature spec of **Wave 1** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds six deterministic cardiovascular-risk and atherogenic-lipid engines that complement (never replace) the existing `ascvd` Pooled-Cohort and `prevent` engines (`score2` the 2021 ESC SCORE2 region-calibrated 10-year CVD risk for ages 40–69, `score2-op` the 2021 ESC SCORE2-OP older-persons companion for ages ≥ 70, `mesa-chd` the McClelland 2015 MESA 10-year CHD risk with and without an Agatston coronary-artery-calcium score, `framingham-cvd` the D'Agostino 2008 general-CVD risk with the published vascular-age companion, `reynolds-risk` the Ridker 2007/2008 score adding hsCRP and parental history, all in Group G; `non-hdl-remnant` the Varbo 2013 non-HDL and remnant-cholesterol fractions, in Group E) — is 447; v104 — [spec-v104](spec-v104.md), the fourth feature spec of **Wave 1** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds six deterministic ECG-arrhythmia, aortic-dissection, and emergency-department syncope decision rules beside the existing `ecg-axis` / `lvh-criteria` tiles (`brugada-vt` the Brugada 1991 four-step wide-complex-tachycardia VT-vs-SVT algorithm, `vereckei-avr` the Vereckei 2008 lead-aVR four-step algorithm, `add-rs` the Rogers 2011 Aortic Dissection Detection Risk Score 0–3 with the optional ADD-RS-D D-dimer rule-out note, `rose-syncope` the Reed 2010 ROSE rule any-positive-criterion high-risk verdict, `egsys` the Del Rosso 2008 EGSYS cardiac-syncope-probability score −2 to +12 with syncope-during-effort and supine-syncope scored as separate items per the primary paper and MDCalc, `oesil` the Colivicchi 2003 OESIL 12-month-mortality score 0–4, all in Group G) — is 453; v105 — [spec-v105](spec-v105.md), the fifth feature spec and the closing spec of **Wave 1** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds four deterministic peripheral-artery and cardiac-surgery-risk instruments (`abi` the Aboyans 2012 ankle-brachial index with the five published PAD severity bands, in Group E; `rutherford-fontaine` the Rutherford 1997 category 0–6 ↔ Fontaine stage I–IV PAD mapping, `wifi` the Mills 2014 SVS WIfI Wound/Ischemia/foot-Infection limb-threat clinical stage 1–4 off the expert-panel amputation-risk grid, `euroscore2` the Nashef 2012 EuroSCORE II logistic in-hospital cardiac-surgery mortality model, all in Group G), closing Wave 1 of the spec-v100 program (432 → 457, +25; one below the projected +26 because spec-v102 deferred `gwtg-hf`) — is 457; v106 — [spec-v106](spec-v106.md), the first feature spec of **Wave 2** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds six deterministic venous-thromboembolism workup instruments beside the existing `wells-pe` / `wells-dvt` / `perc` / `years-pe` pretest set and the `pesi` / `spesi` prognostic spine (`peged` the Kearon 2019 PEGeD graduated D-dimer rule tying the D-dimer threshold to the Wells C-PTP tier, `4peps` the Roy 2021 13-item 4-level pretest probability score that selects the D-dimer strategy, `bova-pe` the Bova 2014 30-day complication stage I–III for normotensive confirmed PE, `hestia` the Zondag 2011 11-item any-positive outpatient-PE eligibility gate, `geneva-original` the Wicki 2001 fully objective pre-Wells pretest model with ABG and chest-film items, `constans-uedvt` the Constans 2008 signed-total pretest score for upper-extremity DVT, all in Group G) — is 463; v107 — [spec-v107](spec-v107.md), the second feature spec of **Wave 2** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds four deterministic emergency-department decision rules and resuscitation-risk scores beside the existing `heart` / `edacs` chest-pain, `pecarn-head` / `catch-head` head-CT, and `apache2` / `qsofa-sofa` ICU clusters (`hear` the Moumneh 2021 HEAR score — the troponin-free History+ECG+Age+Risk subset of HEART with the very-low-risk ≤ 1 gate, `new-orleans-head` the Haydel 2000 New Orleans Head Trauma Criteria any-positive CT rule in GCS-15 minor head injury, `go-far` the Ebell 2013 GO-FAR pre-arrest probability of good-neurologic-outcome survival after in-hospital cardiac arrest mapped to the four published categories, `macocha` the De Jong 2013 MACOCHA ICU difficult-intubation score with the ≥ 3 elevated-risk flag, all in Group G) — is 467; v108 — [spec-v108](spec-v108.md), the third feature spec of **Wave 2** of the [spec-v100](spec-v100.md) MDCalc Parity Completion program, adds six deterministic trauma severity scores and decision rules beside the existing `iss-rts` and `abc-mtp` trauma tiles (`triss` the Boyd 1987 TRISS probability-of-survival logistic with the blunt/penetrating MTOS coefficient sets fed by the live `iss-rts` tile's coded RTS and ISS, in Group E; `niss` the Osler 1997 New Injury Severity Score summing the squares of the three worst AIS regardless of body region with the AIS-6 → 75 convention, in Group E; `tash-score` the Yücel 2006 Trauma-Associated Severe Hemorrhage logistic probability of mass transfusion, `rabt-score` the Joseph 2018 Revised Assessment of Bleeding and Transfusion 0–4 rule with the ≥ 2 activation threshold, `gcs-pupils` the Brennan 2018 GCS-Pupils index bounded 1–15, `nexus-chest-ct` the Rodriguez 2015 NEXUS Chest CT any-positive rule-out, all in Group G) — is 473.)

A reasonable steady-state estimate is **400–600 tiles over 3–5
years**, depending on how aggressive the audit pace is and how
much time the maintainer chooses to spend. The exact number is
secondary to the quality bar.

## 2. Why this commitment is in writing

Because direction drifts. Without a written commitment, Sophie's
default failure mode is to plateau at "the tiles I happened to
care about" and never become the reference tool the audience
needs. Without a written commitment, the *next* time a clever
adjacent-product idea shows up (patient artifact decoders, AI
chat, a SaaS tier), there is nothing on paper to anchor against.

This document is that anchor. The thesis is one sentence:

> Sophie's job is to make every actionable clinical calculator a
> healthcare worker needs available in one free, deterministic,
> citable, login-less place.

If a proposal does not advance that thesis, it is out of scope.

## 3. The cadence rationale

Sophie ships **slowly on purpose**. Three forces set the cadence:

1. **The [spec-v11](spec-v11.md) audit floor.** Every new tile
   ships with the same artifacts an audited tile has: primary
   citation re-verified, ≥3 boundary worked examples, a cross-
   implementation differential within 0.5% (or one category for
   ordinal scores), edge-input handling reviewed, a11y reviewed.
   That is hours per tile, not minutes. Speed-running tile
   additions is the failure mode v11 exists to prevent.
2. **Solo-developer reality.** The maintainer is one person with
   a day job. Sustainable cadence is ~5–20 audited tiles per
   month, depending on complexity. Faster is unsustainable; slow
   is fine because the existing 244 tiles already cover the
   highest-frequency clinical workflows.
3. **Source stability.** Clinical formulas are mostly stable on
   decade timescales (Wells PE from 2000 is still the same Wells
   PE). New tiles ship slowly because new clinical formulas
   *appear* slowly; the work is mostly catching up to a body of
   knowledge that does not move.

The commitment is therefore: **eventually complete, never
rushed.** A clinician who finds a missing calculator and
reports it does not get a same-week ship; they get a "queued,
will be audited and added with the same rigor as everything
else."

## 4. What the parity target excludes

Even when Sophie reaches steady state, the following are
permanently out:

- **AI-generated calculators / "smart" diagnostic helpers.**
  Restated from [spec-v10 §2.3](spec-v10.md).
- **Single-center, single-paper validations without an
  independent replication.** A clinician who needs an
  experimental score uses MDCalc or the original paper. Sophie
  waits for the validated form.
- **Sponsored or pharma-affiliated calculators** designed to
  funnel into a specific drug class. The bar is "the calculator
  exists to answer a clinical question," not "the calculator
  exists to market a product."
- **Calculators whose stated output is a treatment
  recommendation in Sophie's voice.** Per [spec-v11 §5.3](spec-v11.md),
  Sophie quotes the source's per-band interpretation when one
  exists; Sophie does not author treatment recommendations.
- **Calculators that require continuous data feeds** (live
  formularies that change weekly, payer-specific coverage rules
  that change per-employer). The
  [spec-v5 maintenance contract](spec-v5.md) excludes live data.
- **Calculators whose primary input is a free-text document the
  user pastes in expecting NLP extraction.** Restated from
  [spec-v10 §3](spec-v10.md): no patient-artifact decoding past
  the simple existing decoders.

## 5. Backlog signal

The maintainer keeps a private list of candidate calculators.
Public-facing signal that a calculator is missing is welcome via:

- A GitHub issue on [github.com/clay-good/sophiewell.com](https://github.com/clay-good/sophiewell.com)
  titled `tile request: <name>` with the primary citation.
- A `mailto:` link from the tile detail (deferred per
  [spec-v10 §7](spec-v10.md) but consistent with this scope).

There is no public roadmap board. The order in which missing
calculators land is set by the maintainer's read of clinical
frequency × source stability × audit feasibility. Patient-
literacy and billing-tile requests follow the same path.

## 6. Quality versus speed, settled

Anywhere this document and a speed argument disagree, this
document wins. Anywhere this document and [spec-v11](spec-v11.md)
disagree on the quality bar, spec-v11 wins. Anywhere this
document and [spec-v10](spec-v10.md) disagree on positioning or
scope, spec-v10 wins.

The hierarchy is: **v10 (what Sophie is) → v11 (how good Sophie
must be) → this document (where Sophie is going).** Everything
else fits underneath.

## 7. The reciprocal commitment

If a clinician — nurse, biller, EMS provider, educator — pulls
up sophiewell.com at 2 a.m. and finds the calculator they need,
they should be able to:

- See the result in one screen, with no login, no banner, no
  modal.
- Read the citation without clicking.
- See the example value and verify the math against their
  source if they want to.
- Save the page for offline use if their Wi-Fi is bad.
- Trust that the result they got Monday is the result they will
  get Friday.

That is the commitment this document codifies. Catalog parity
with MDCalc is the *mechanism*; the **commitment is the
experience**.
