# spec-v26.md — Pediatric & neonatal completers + Phoenix sepsis (25 tiles)

> Status: proposed (2026-05-19). v26 is the fifteenth catalog-
> growth spec and the **second 25-tile slice of the v25–v28
> tranche**. It adds 25 tiles closing the pediatric / neonatal
> coverage that v12–v24 partially addressed: bedside neonatal
> scoring (Apgar, Silverman-Andersen, Downes), neonatal-jaundice
> and ICU completers (Kramer dermal-zone, Finnegan NAS, Bell NEC,
> Papile IVH, ICROP retinopathy), the **Phoenix 2024 pediatric
> sepsis criteria**, pediatric resuscitation arithmetic (Holliday-
> Segar, Broselow weight estimate, ETT/depth formulas), the
> Modified Yale Observation Scale, Centor-McIsaac in pediatric
> context, the Acute Lower-airway-disease Pediatric Severity
> score (ALPS), pediatric DKA cerebral-edema risk, peds-onc
> staging (INRG, IRS-V, IRSS retinoblastoma, COG Wilms),
> additional pediatric-trauma adjuncts, the IMCI severe-dehydration
> Plan-C decoder, and the pediatric ASA-PS preop classifier.
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v26 amends no hard rule from v10–v25. Catalog growth: at v25
> close 528 tiles; at v26 close **553 tiles**.

## 1. Why v26 exists

Pediatric clinicians and neonatologists are the audience with the
highest density of bedside-numeric tools per encounter (every
delivery → Apgar; every ICN admit → Silverman / Downes; every
phototherapy decision → Bhutani + Kramer; every code-cart pull →
Broselow). Prior specs shipped the highest-frequency individual
items (Bhutani, AAP 2022 phototherapy / exchange, PEWS,
Westley, Tal, PRAM, peds-GCS, PIM-3, PRISM-III, pSOFA,
peds-vitals, CHALICE, CATCH, PECARN head / C-spine / IAI,
Centor-McIsaac in the general path) but left the **neonatal
delivery-room** and **peds-onc staging** surfaces visibly thin.
v26 closes those.

Two tiles in v26 deserve a specific call-out:

- **Phoenix sepsis (2024).** The Society of Critical Care Medicine
  Pediatric Sepsis Definition Task Force published Phoenix at the
  start of 2024 superseding the 2005 IPSCC / Goldstein criteria
  Sophie has *not* shipped under any earlier ID. v24 §7 enrolled
  Phoenix as a future tile; v26 delivers it.
- **Apgar.** Apgar was deferred out of the v8–v11 bedside-set
  because it is so heavily memorised it appeared low-value to
  ship. v11 §4 audit floor flagged the omission: tools that are
  "trivially memorised" are still high-value for the *audit
  trail* (deterministic, citable, examples). v26 ships it
  formally with the 1953 derivation, the 1958 revision, and the
  ACOG / AAP 2006 *Use and Abuse* note.

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v26
specifically defers:

- **Neonatal resuscitation decision-trees (NRP algorithm).**
  NRP is an algorithmic flowchart, not a deterministic score.
  Defer to a dedicated workflow-tile spec.
- **Pediatric pharmacokinetic dosing tables.** Weight-based dose
  *calculation* belongs to v28's antimicrobial-dosing surface;
  drug-by-drug pediatric dosing tables remain out.
- **Pediatric mental-health rating scales beyond the v21–v24
  surface.** SCARED, CDI, PHQ-A, etc. ship in a dedicated psych
  spec when audited.
- **Pediatric oncology treatment-stratification beyond staging.**
  COG-risk classification, NB-risk treatment buckets, etc.,
  remain out.

## 3. The 25 tiles

### 3.1 Delivery-room & neonatal bedside

#### 3.1.1 `apgar` — Apgar score

- **Citation:** Apgar V. *A proposal for a new method of evaluation of the newborn infant.* Curr Res Anesth Analg 1953;32(4):260-267. Reaffirmed in: ACOG Committee Opinion No. 644 / AAP Policy *The Apgar Score* (Pediatrics 2015;136:819-822, reaffirmed 2020).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `obstetrics`, `family-medicine`, `pediatrics`, `emergency-medicine`.
- **Inputs:** Appearance, Pulse, Grimace, Activity, Respiration (each 0–2).
- **Output:** Total 0–10 at 1 / 5 / 10 min. Banner per ACOG / AAP: "Apgar is not designed to predict individual neurologic outcome and is not a diagnosis of asphyxia."

#### 3.1.2 `silverman-andersen` — Silverman-Andersen retraction score

- **Citation:** Silverman WA, Andersen DH. *A controlled clinical trial of effects of water mist on obstructive respiratory signs, death rate and necropsy findings among premature infants.* Pediatrics 1956;17(1):1-10.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatrics`.
- **Inputs:** Upper chest, lower chest, xiphoid retraction, nare dilation, expiratory grunt (each 0–2).
- **Bands:** 0 / 1–3 mild / 4–6 moderate / 7–10 severe.

#### 3.1.3 `downes-rds` — Downes score (neonatal RDS severity)

- **Citation:** Downes JJ, Vidyasagar D, Boggs TR Jr, Morrow GM 3rd. *Respiratory distress syndrome of newborn infants. I. New clinical scoring system (RDS score) with acid-base and blood-gas correlations.* Clin Pediatr 1970;9(6):325-331.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatrics`.
- **Inputs:** Cyanosis, retractions, grunting, air entry, respiratory rate (each 0–2).
- **Bands:** ≤3 mild / 4–6 moderate / ≥7 impending failure.

#### 3.1.4 `kramer-icterus` — Kramer dermal-zone icterus

- **Citation:** Kramer LI. *Advancement of dermal icterus in the jaundiced newborn.* Am J Dis Child 1969;118(3):454-458.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatrics`, `family-medicine`.
- **Inputs:** Cephalo-caudal extent of visible jaundice (Zone 1–5).
- **Output:** Approximate TSB range per zone; banner requires confirmation with TcB / TSB and the [Bhutani nomogram](bhutani-nomogram).

#### 3.1.5 `finnegan-nas` — Modified Finnegan Neonatal Abstinence Score

- **Citation:** Finnegan LP, Kron RE, Connaughton JF, Emich JP. *Assessment and treatment of abstinence in the infant of the drug-dependent mother.* Int J Clin Pharmacol Biopharm 1975;12(1-2):19-32. Modified scoring per Jansson LM, Velez M, Harrow C, 2009.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatrics`, `addiction-medicine`.
- **Inputs:** 21 items grouped into CNS, metabolic / vasomotor / respiratory, and GI signs.
- **Bands:** ≥8 on three consecutive scores triggers pharmacologic management per AAP 2012 / 2020 guidance. Banner notes ESC ("Eat, Sleep, Console") is a function-based alternative and is *not* an equivalent score.

#### 3.1.6 `bell-nec` — Bell staging for necrotizing enterocolitis (modified Walsh-Kliegman)

- **Citation:** Walsh MC, Kliegman RM. *Necrotizing enterocolitis: treatment based on staging criteria.* Pediatr Clin North Am 1986;33(1):179-201.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `neonatology`, `pediatric-surgery`.
- **Inputs:** Systemic signs, GI signs, radiographic findings.
- **Bands:** IA / IB suspected / IIA mild / IIB moderate / IIIA severe (no perforation) / IIIB severe (perforated).

#### 3.1.7 `papile-ivh` — Papile grading for germinal-matrix / intraventricular hemorrhage

- **Citation:** Papile LA, Burstein J, Burstein R, Koffler H. *Incidence and evolution of subependymal and intraventricular hemorrhage: a study of infants with birth weights less than 1,500 gm.* J Pediatr 1978;92(4):529-534.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatric-radiology`, `pediatric-neurology`.
- **Inputs:** Cranial-ultrasound findings.
- **Bands:** Grade I (subependymal only) / II (IVH, normal ventricle size) / III (IVH with dilation) / IV (parenchymal extension).

#### 3.1.8 `icrop-rop` — International Classification of Retinopathy of Prematurity (ICROP 3rd revision)

- **Citation:** International Committee for the Classification of Retinopathy of Prematurity. *International Classification of Retinopathy of Prematurity, Third Edition.* Ophthalmology 2021;128(10):e51-e68.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatric-ophthalmology`.
- **Inputs:** Zone (I / II / III), stage (1–5), plus disease (no / pre-plus / plus), location, A-ROP descriptor.
- **Output:** ICROP-3 descriptor and treatment-indication banner per the ETROP / RAINBOW thresholds.

### 3.2 Pediatric critical care

#### 3.2.1 `phoenix-sepsis` — Phoenix Sepsis Criteria (2024)

- **Citation:** Schlapbach LJ, Watson RS, Sorce LR, et al. *International Consensus Criteria for Pediatric Sepsis and Septic Shock.* JAMA 2024;331(8):665-674; companion Sanchez-Pinto LN, Bennett TD, DeWitt PE, et al. *Development and Validation of the Phoenix Criteria for Pediatric Sepsis and Septic Shock.* JAMA 2024;331(8):675-686.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-critical-care`, `emergency-medicine`, `pediatrics`, `infectious-diseases`.
- **Inputs:** Respiratory (0–3), cardiovascular (0–6), coagulation (0–2), neurologic (0–2) sub-scores.
- **Bands:** Sepsis = suspected/confirmed infection AND Phoenix ≥2. Septic shock = sepsis with cardiovascular ≥1.

#### 3.2.2 `peds-dka-cerebral-edema` — Pediatric DKA cerebral-edema clinical-criteria

- **Citation:** Muir AB, Quisling RG, Yang MCK, Rosenbloom AL. *Cerebral edema in childhood diabetic ketoacidosis: natural history, radiographic findings, and early identification.* Diabetes Care 2004;27(7):1541-1546.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-endocrinology`, `pediatric-critical-care`, `emergency-medicine`.
- **Inputs:** Diagnostic criteria (abnormal motor / verbal response, decorticate / decerebrate posturing, cranial-nerve palsy, abnormal respiratory pattern), major criteria, minor criteria.
- **Output:** Likelihood of cerebral edema (sensitive flag).

> Note: `pim-3` (v22) and `prism-iii` (v23) are *already shipped*
> and are cross-referenced by v26 tiles. No new v26 entry.

#### 3.2.3 `mod-yale-obs` — Modified Yale Observation Scale (febrile infants 3–36 months)

- **Citation:** McCarthy PL, Sharpe MR, Spiesel SZ, et al. *Observation scales to identify serious illness in febrile children.* Pediatrics 1982;70(5):802-809.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`, `family-medicine`.
- **Inputs:** Quality of cry, reaction to parent, state variation, color, hydration, response to social overtures (each 1 / 3 / 5).
- **Bands:** ≤10 well / 11–15 moderate / >15 serious-illness risk.

#### 3.2.4 `alps-bronch` — Acute Lower-airway Pediatric Severity (ALPS-BPD) score

- **Citation:** Liu LL, Gallaher MM, Davis RL, Rutter CM, Lewis TC, Marcuse EK. *Use of a respiratory clinical score among different providers.* Pediatr Pulmonol 2004;37(3):243-248. (Also widely deployed as the Seattle Children's ALPS.)
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `emergency-medicine`.
- **Inputs:** Respiratory rate, retractions, dyspnea, auscultation.
- **Bands:** ≤3 mild / 4–7 moderate / ≥8 severe.

### 3.3 Pediatric resuscitation arithmetic

#### 3.3.1 `holliday-segar` — Holliday-Segar maintenance fluids

- **Citation:** Holliday MA, Segar WE. *The maintenance need for water in parenteral fluid therapy.* Pediatrics 1957;19(5):823-832.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`, `pediatric-anesthesia`.
- **Inputs:** Weight (kg).
- **Output:** mL/hr and mL/24 hr using the 4-2-1 / 100-50-20 ladder. Banner re: AAP 2018 isotonic-IVF policy.

#### 3.3.2 `broselow-weight` — Broselow / Mercy weight-estimation by length

- **Citation:** Lubitz DS, Seidel JS, Chameides L, Luten RC, Zaritsky AL, Campbell FW. *A rapid method for estimating weight and resuscitation drug dosages from length in the pediatric age group.* Ann Emerg Med 1988;17(6):576-581. Mercy: Abdel-Rahman SM, Ridge AL. *An improved pediatric weight estimation strategy.* Open Med Devices J 2012;4:87-97.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pediatric-emergency-medicine`, `ems`, `pediatric-anesthesia`.
- **Inputs:** Length (cm) and/or humeral / ulnar length for Mercy.
- **Output:** Estimated weight (kg) with both ladders printed for transparency.

#### 3.3.3 `peds-ett-size` — Pediatric ETT size & depth (Cole / Khine cuffed)

- **Citation:** Cole F. *Pediatric formulas for the anesthesiologist.* AMA J Dis Child 1957;94(6):672-673. Khine HH, Corddry DH, Kettrick RG, et al. *Comparison of cuffed and uncuffed endotracheal tubes in young children during general anesthesia.* Anesthesiology 1997;86(3):627-631. PALS 2020.
- **Group:** Bedside Math (`F`).
- **Specialties:** `pediatric-emergency-medicine`, `pediatric-anesthesia`, `pediatric-critical-care`, `ems`.
- **Inputs:** Age (yr).
- **Output:** Uncuffed ID = 4 + age/4; cuffed ID = 3.5 + age/4; depth (cm at lip) = 3 × tube ID. Banner: confirm with capnography + chest-X-ray.

### 3.4 Pediatric outpatient & primary-care decisions

#### 3.4.1 `centor-mcisaac-peds` — Centor / McIsaac with pediatric age adjustment

- **Citation:** McIsaac WJ, Goel V, To T, Low DE. *The validity of a sore throat score in family practice.* CMAJ 2000;163(7):811-815.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `family-medicine`, `emergency-medicine`.
- **Inputs:** Age band (+1 if 3–14, 0 if 15–44, −1 if ≥45), tonsillar exudate, tender anterior cervical nodes, fever, absence of cough.
- **Bands:** ≤0 / 1 / 2 / 3 / ≥4 with per-band rapid-test / culture / empirical-treatment guidance.

#### 3.4.2 `who-imci-dehydration` — WHO IMCI dehydration Plan A / B / C

- **Citation:** World Health Organization. *Integrated Management of Childhood Illness chart booklet*, current revision.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `global-health`, `emergency-medicine`.
- **Inputs:** Mental state, sunken eyes, drinking response, skin-pinch.
- **Output:** Plan A (no dehydration: ORS at home) / Plan B (some dehydration: 75 mL/kg ORS over 4 h) / Plan C (severe: IV per WHO C ladder).

#### 3.4.3 `peds-asa-ps` — Pediatric ASA Physical Status

- **Citation:** American Society of Anesthesiologists. *ASA Physical Status Classification System*, 2020 pediatric examples.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-anesthesia`, `pediatric-surgery`.
- **Inputs:** Patient health state per ASA-PS narrative description.
- **Output:** ASA I–VI with the 2020 ASA pediatric example set printed.

### 3.5 Pediatric oncology staging

#### 3.5.1 `inrg-neuroblastoma` — INRG (International Neuroblastoma Risk Group) staging system

- **Citation:** Monclair T, Brodeur GM, Ambros PF, et al. *The International Neuroblastoma Risk Group (INRG) staging system: an INRG Task Force report.* J Clin Oncol 2009;27(2):298-303.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-oncology`, `pediatric-surgery`.
- **Inputs:** Image-defined risk factors (IDRFs), distant metastasis.
- **Bands:** L1 / L2 / M / MS.

#### 3.5.2 `irs-v-rhabdo` — IRS-V (Intergroup Rhabdomyosarcoma Study) post-surgical grouping

- **Citation:** Maurer HM, Beltangady M, Gehan EA, et al. *The Intergroup Rhabdomyosarcoma Study-I. A final report.* Cancer 1988;61(2):209-220. Walterhouse DO, et al. COG ARST grouping 2014.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-oncology`, `pediatric-surgery`, `radiation-oncology`.
- **Inputs:** Extent of post-surgical resection, nodal status, metastasis.
- **Bands:** Group I / II / III / IV.

#### 3.5.3 `irss-retinoblastoma` — International Retinoblastoma Staging System

- **Citation:** Chantada G, Doz F, Antoneli CB, et al. *A proposal for an international retinoblastoma staging system.* Pediatr Blood Cancer 2006;47(6):801-805.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-oncology`, `pediatric-ophthalmology`.
- **Inputs:** Eye preservation, optic-nerve / extraocular extension, distant metastasis, CNS.
- **Bands:** Stage 0 / I / II / III / IV.

#### 3.5.4 `cog-wilms` — COG / NWTS Wilms-tumor staging

- **Citation:** Children's Oncology Group renal-tumors committee, NWTS staging carried into COG AREN protocols.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-oncology`, `pediatric-surgery`.
- **Inputs:** Resectability, capsular / renal-sinus involvement, nodal status, metastasis, bilaterality.
- **Bands:** Stage I / II / III / IV / V.

### 3.6 Pediatric trauma adjuncts

#### 3.6.1 `glasgow-meningococcal` — Glasgow Meningococcal Septicaemia Prognostic Score (GMSPS)

- **Citation:** Sinclair JF, Skeoch CH, Hallworth D. *Prognosis of meningococcal septicaemia.* Lancet 1987;2(8549):38.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatric-critical-care`, `pediatric-emergency-medicine`, `infectious-diseases`.
- **Inputs:** Hypotension, skin-perfusion gap, BE worse than −8, rapid progression of purpura, no meningism, deteriorating LOC, parental concern over disease severity, temperature differential.
- **Bands:** ≥8 = high mortality risk.

#### 3.6.2 `kindling-peds-pain` — FLACC (already shipped, deferral note) / N-PASS — Neonatal Pain Agitation Sedation Scale

- **Citation:** Hummel P, Puchalski M, Creech SD, Weiss MG. *Clinical reliability and validity of the N-PASS: neonatal pain, agitation and sedation scale with prolonged pain.* J Perinatol 2008;28(1):55-60.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `neonatology`, `pediatric-anesthesia`.
- **Inputs:** Crying / irritability, behavior / state, facial expression, extremities / tone, vital signs (each −2 to +2 for sedation / pain; gestational-age adjustment).
- **Bands:** Sedation total and pain total with separate thresholds.

> The above replaces FLACC (already shipped at v12-7 as `flacc`)
> with N-PASS for the neonatal age-band gap.

#### 3.6.3 `brue-aap` — AAP Brief Resolved Unexplained Event (BRUE) lower-risk criteria

- **Citation:** Tieder JS, Bonkowsky JL, Etzel RA, et al. *Brief Resolved Unexplained Events (Formerly Apparent Life-Threatening Events) and Evaluation of Lower-Risk Infants.* Pediatrics 2016;137(5):e20160590.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `pediatric-emergency-medicine`, `family-medicine`.
- **Inputs:** Age >60 d, gestational age ≥32 wk and post-conceptional age ≥45 wk, no CPR by trained provider, first event, event duration <1 min.
- **Output:** Lower-risk BRUE qualifier (all criteria met) versus higher-risk (any criterion failed); banner per AAP 2016 routine-evaluation guidance.

## 4. Group homes

- Clinical Scoring & Risk (`G`): §3.1.1–§3.1.5, §3.1.7–§3.1.8,
  §3.2.3 (mod-yale-obs), §3.2.4, §3.3 — none of §3.3 is in `G`
  (all are `F`), §3.4.1, §3.5.1–§3.5.4, §3.6.1–§3.6.2.
- Bedside Math (`F`): §3.3.1, §3.3.2, §3.3.3.
- Clinical Criteria & Diagnostic Bundles (`H`): §3.1.6, §3.2.1,
  §3.2.2, §3.4.2, §3.4.3, §3.6.3.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Additional v26 audit
requirements:

- **Apgar (§3.1.1) banner.** Apgar's *non-use as an asphyxia
  diagnosis or neurologic-outcome predictor* is required banner
  text per AAP / ACOG. The result screen prints the ACOG / AAP
  caveat verbatim.

- **Phoenix sepsis (§3.2.1) banner.** "Phoenix replaces the 2005
  IPSCC / Goldstein pediatric sepsis definitions. If your local
  EHR sepsis alerting is still keyed to SIRS-based criteria,
  Phoenix can disagree at the bedside; the JAMA 2024 derivation
  reports the operating characteristics."

- **Neonatal weight / age dependencies.** Tiles whose result is a
  function of birth-weight or post-menstrual age (Silverman,
  Bell, Papile, ICROP, N-PASS) print the weight / PMA assumption
  on the result screen. No silent defaults.

- **Peds-onc staging (§3.5).** Each tile prints the protocol
  generation the staging is keyed to (NWTS-5 / AREN0533 for Wilms,
  COG ARST for rhabdomyosarcoma, INRG 2009 for neuroblastoma,
  IRSS 2006 for retinoblastoma). Future protocol revisions are
  enrolled as re-audit triggers.

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v25    | 528 | +25 |
| **v26**| **553** | **+25** |

## 7. What ships next in the tranche

- **v27** — Endocrine, rheumatology & osteoporosis completers.
- **v28** — Toxicology, envenomation, antimicrobial dosing & ID
  completers; closer of the v25–v28 tranche.

Each follows the v11 audit floor and v12 shipping contract.
