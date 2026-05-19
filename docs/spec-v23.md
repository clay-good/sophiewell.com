# spec-v23.md — field medicine, global health, environmental exposure, mass-casualty triage (25 tiles)

> Status: proposed (2026-05-19). v23 is the twelfth catalog-
> growth spec and the third of the v21–v24 tranche. It adds 25
> tiles across **global-health nutrition & pediatric acute
> illness** (MUAC, WHO weight-for-height z-score, WHO SAM/MAM
> classification, IMCI fast-breathing thresholds, WHO ORT plan
> A/B/C, WHO TB symptom screen), **burns** (Lund-Browder, Wallace
> Rule of Nines with pediatric adjustment, Parkland resuscitation
> with peds modifier, ABA referral criteria), **drowning &
> aquatic** (Szpilman, Modell aspiration classification — both as
> reference), **altitude** (Lake Louise AMS 2018, HACE clinical
> definition, HAPE clinical definition, Hultgren altitude HAPE
> prophylaxis), **temperature exposure** (Swiss hypothermia
> staging, frostbite classification, heat-stroke severity, Wet
> Bulb Globe Temperature interpretation), **envenomation & bite**
> (snakebite severity score, brown-recluse loxoscelism severity),
> and **mass-casualty triage** (START, JumpSTART, SALT, SMART
> tag).
>
> Every tile ships under the [spec-v11](spec-v11.md) audit floor
> and the [spec-v12 §5](spec-v12.md) per-tile shipping contract.
> v23 amends no hard rule from v10–v22. Catalog growth: at v22
> close 453 tiles; at v23 close **478 tiles**.

## 1. Why v23 exists

sophiewell.com is a login-less, field-friendly clinical
reference. The audiences who depend on a tool that *runs
offline, on a phone, with no account* most are field-medicine
clinicians: humanitarian / wilderness / disaster / military /
maritime / global-health, plus rural EM. v23 closes the largest
parity gap for that audience.

Selection follows the v12 §1 criteria with a single addition:
each tile must be **operationally feasible without a hospital**
(no labs beyond bedside glucometry / urine dipstick / point-of-
care CRP; no imaging beyond clinical exam).

## 2. Non-goals

Inherits unchanged from [spec-v12 §2](spec-v12.md). v23
specifically defers:

- **Tactical-medicine TCCC algorithms.** Ship in a separate
  tactical-care spec once licensing path with CoTCCC is
  documented.
- **Marine envenomation site catalog** (jellyfish, stonefish,
  cone snail). Defer to a marine-medicine bundle.
- **HAZMAT decontamination flow.** Defer to a CBRN spec.
- **Disaster mental-health triage (PFA).** Patient-facing
  reference only; not a deterministic tile.

## 3. The 25 tiles

### 3.1 Global-health nutrition & pediatric acute illness

#### 3.1.1 `muac` — Mid-Upper Arm Circumference (6–59 mo)

- **Citation:** World Health Organization. *WHO child growth standards and the identification of severe acute malnutrition in infants and children.* WHO/UNICEF joint statement; 2009.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `public-health`, `humanitarian-medicine`, `family-medicine`.
- **Inputs:** Age 6–59 mo, MUAC (mm).
- **Output:** Normal ≥125, MAM 115–124, SAM <115; band-color (green/yellow/red) per the standard MUAC tape.

#### 3.1.2 `who-wfh-z` — WHO weight-for-height z-score (0–5 yr)

- **Citation:** WHO Multicentre Growth Reference Study Group. *WHO Child Growth Standards: Length/height-for-age, weight-for-age, weight-for-length, weight-for-height and body mass index-for-age.* WHO; 2006.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pediatrics`, `humanitarian-medicine`, `public-health`.
- **Inputs:** Sex, length/height, weight.
- **Output:** WFH z-score per LMS table; -2 / -3 SD bands trigger MAM / SAM.

#### 3.1.3 `who-sam-mam` — WHO Severe / Moderate Acute Malnutrition classification

- **Citation:** WHO. *Updates on the management of severe acute malnutrition in infants and children.* WHO Guideline; 2013.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `humanitarian-medicine`, `public-health`.
- **Inputs:** WFH z-score, MUAC, bilateral pitting edema.
- **Output:** No malnutrition / MAM / SAM (complicated vs uncomplicated) with inpatient-vs-outpatient pathway.

#### 3.1.4 `imci-fast-breathing` — WHO IMCI fast-breathing thresholds

- **Citation:** WHO/UNICEF. *Integrated Management of Childhood Illness (IMCI) chart booklet.* WHO; 2014 update.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `humanitarian-medicine`, `family-medicine`.
- **Inputs:** Age band, respiratory rate, chest-indrawing, danger signs.
- **Output:** No pneumonia / pneumonia / severe pneumonia per WHO IMCI cutoffs (RR ≥60 <2 mo, ≥50 2–11 mo, ≥40 12–59 mo).

#### 3.1.5 `who-ort-plan` — WHO ORT plan A / B / C

- **Citation:** WHO. *The treatment of diarrhoea: a manual for physicians and other senior health workers.* 4th rev. WHO; 2005.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `humanitarian-medicine`, `emergency-medicine`, `family-medicine`.
- **Inputs:** Dehydration severity (none / some / severe), weight, age.
- **Output:** Plan A (home ORS), B (4-hour 75 mL/kg supervised ORS), or C (IV with Plan-C volume schedule) with explicit volumes.

#### 3.1.6 `who-tb-symptom-screen` — WHO 4-symptom TB screen (W4SS)

- **Citation:** Getahun H, Kittikraisak W, Heilig CM, et al. *Development of a standardized screening rule for tuberculosis in people living with HIV in resource-constrained settings.* PLoS Med 2011;8(1):e1000391; WHO 2011 guidelines.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `infectious-disease`, `humanitarian-medicine`, `public-health`.
- **Inputs:** Current cough, fever, night sweats, weight loss.
- **Output:** Positive screen if any symptom; high-burden-setting management recommendation.

### 3.2 Burns

#### 3.2.1 `lund-browder` — Lund-Browder TBSA chart

- **Citation:** Lund CC, Browder NC. *The estimation of areas of burns.* Surg Gynecol Obstet 1944;79:352-358.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatrics`, `emergency-medicine`, `surgery`, `burn-surgery`.
- **Inputs:** Age band, % involvement of each region per the Lund-Browder template.
- **Output:** Total %TBSA second-degree-or-greater burn.

#### 3.2.2 `wallace-rule-of-nines` — Wallace Rule of Nines (adult & peds)

- **Citation:** Wallace AB. *The exposure treatment of burns.* Lancet 1951;1(6653):501-504.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `surgery`, `burn-surgery`, `pediatric-emergency-medicine`.
- **Inputs:** Adult or pediatric (age <10) template; region-by-region % involvement.
- **Output:** Total %TBSA with the age-adjusted head / leg weightings.

#### 3.2.3 `parkland-peds` — Parkland resuscitation with pediatric modifier

- **Citation:** Baxter CR, Shires T. *Physiological response to crystalloid resuscitation of severe burns.* Ann N Y Acad Sci 1968;150(3):874-894; ABA/Shriners pediatric maintenance addition.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `pediatric-emergency-medicine`, `burn-surgery`, `critical-care`.
- **Inputs:** Weight, %TBSA, time since burn, age (<30 kg activates peds maintenance add-on).
- **Output:** 24-hour volume = 4 mL × kg × %TBSA, first-half over first 8 h; for peds (<30 kg) +D5LR maintenance per Holliday-Segar.

#### 3.2.4 `aba-referral` — American Burn Association referral criteria

- **Citation:** American Burn Association. *Burn Center Referral Criteria.* ABA position statement; 2006 (reaffirmed).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `surgery`, `burn-surgery`.
- **Inputs:** Burn-center criteria checklist (partial-thickness >10% TBSA, full-thickness any age, face/hands/feet/genitals/perineum/joints, electrical, chemical, inhalation, comorbidity, peds, special social/rehab needs).
- **Output:** Referral indicated if any criterion met.

### 3.3 Drowning & aquatic

#### 3.3.1 `szpilman-drowning` — Szpilman drowning classification

- **Citation:** Szpilman D. *Near-drowning and drowning classification: a proposal to stratify mortality based on the analysis of 1,831 cases.* Chest 1997;112(3):660-665.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `critical-care`, `pediatric-emergency-medicine`.
- **Inputs:** Lung-auscultation findings, hypotension, respiratory arrest, cardiac arrest.
- **Output:** Grade 1–6 with mortality band per the original Table 2.

#### 3.3.2 `modell-aspiration` — Modell aspiration classification (drowning, reference)

- **Citation:** Modell JH. *Drowning.* N Engl J Med 1993;328(4):253-256.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `critical-care`.
- **Inputs:** Salt vs fresh aspiration, dry vs wet pattern (historical classification).
- **Banner:** "Modell's salt/fresh distinction is historical; modern resuscitation follows Szpilman and ILCOR. v23 ships this tile as reference only."

### 3.4 Altitude

#### 3.4.1 `lake-louise-2018` — Lake Louise AMS score (2018)

- **Citation:** Roach RC, Hackett PH, Oelz O, et al. *The 2018 Lake Louise Acute Mountain Sickness Score.* High Alt Med Biol 2018;19(1):4-6.
- **Group:** Patient-Reported Symptom Indices (`I`).
- **Specialties:** `emergency-medicine`, `wilderness-medicine`, `family-medicine`.
- **Inputs:** Headache (0–3), GI symptoms (0–3), fatigue/weakness (0–3), dizziness/light-headedness (0–3). Required: headache + ≥1 other in someone with recent altitude gain.
- **Output:** Sum ≥3 → AMS; 3–5 mild, 6–9 moderate, 10–12 severe.

#### 3.4.2 `hace-clinical` — HACE clinical definition

- **Citation:** Bärtsch P, Swenson ER. *Acute high-altitude illnesses.* N Engl J Med 2013;368(24):2294-2302.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `neurology`.
- **Inputs:** AMS + ataxia or AMS in setting of acute altitude gain.
- **Output:** HACE present / not; immediate-descent + dexamethasone recommendation.

#### 3.4.3 `hape-clinical` — HAPE clinical definition

- **Citation:** Hackett PH, Roach RC. *High-altitude illness.* N Engl J Med 2001;345(2):107-114.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `pulmonology`.
- **Inputs:** Recent altitude gain, dyspnea at rest, cough, weakness/decreased exercise tolerance, chest tightness/congestion (≥2 symptoms) + ≥2 signs (crackles/wheezing, central cyanosis, tachypnea, tachycardia).
- **Output:** HAPE present / not; immediate-descent + supplemental O2 + nifedipine recommendation.

#### 3.4.4 `hultgren-hape-prophylaxis` — Hultgren HAPE-prophylaxis altitude guidance

- **Citation:** Hultgren HN, Honigman B, Theis K, Nicholas D. *High-altitude pulmonary edema at a ski resort.* West J Med 1996;164(3):222-227; Wilderness Medical Society consensus 2019 (Luks AM, et al.).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `wilderness-medicine`, `family-medicine`.
- **Inputs:** History of prior HAPE, planned sleeping-altitude gain, rate of ascent.
- **Output:** Prophylaxis indicated / not + recommended agent per the WMS 2019 table.

### 3.5 Temperature exposure

#### 3.5.1 `swiss-hypothermia` — Swiss hypothermia staging

- **Citation:** Durrer B, Brugger H, Syme D; ICAR MEDCOM. *The medical on-site treatment of hypothermia: ICAR-MEDCOM recommendation.* High Alt Med Biol 2003;4(1):99-103.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`.
- **Inputs:** Consciousness, shivering, vital signs (with temperature-correlation reference).
- **Output:** HT I / II / III / IV with treatment recommendation per ICAR-MEDCOM.

#### 3.5.2 `frostbite-classification` — Cauchy / Wilderness Medical Society frostbite grade

- **Citation:** Cauchy E, Chetaille E, Marchand V, Marsigny B. *Retrospective study of 70 cases of severe frostbite lesions: a proposed new classification scheme.* Wilderness Environ Med 2001;12(4):248-255.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `wilderness-medicine`, `emergency-medicine`, `surgery`.
- **Inputs:** Extent of lesion after rapid rewarming at day 0; bone-scan-day-2 cyanosis pattern (if available).
- **Output:** Grade 1–4 with amputation-risk prognostication.

#### 3.5.3 `heat-stroke-severity` — Bouchama / ACSM heat-stroke severity

- **Citation:** Bouchama A, Knochel JP. *Heat stroke.* N Engl J Med 2002;346(25):1978-1988; American College of Sports Medicine position stand 2007.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `sports-medicine`, `wilderness-medicine`, `critical-care`.
- **Inputs:** Core temperature, CNS dysfunction, exertional vs classical context, rhabdomyolysis/AKI flag.
- **Output:** Heat exhaustion vs classical vs exertional heat stroke with cooling-target band.

#### 3.5.4 `wbgt` — Wet Bulb Globe Temperature interpretation

- **Citation:** Yaglou CP, Minard D. *Control of heat casualties at military training centers.* Arch Ind Health 1957;16(4):302-316; NIOSH 2016 update.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `sports-medicine`, `occupational-medicine`, `wilderness-medicine`.
- **Inputs:** Tdb, Twb, Tg (or computed WBGT).
- **Output:** Activity-restriction flag color band per the NATA / ACSM table.

### 3.6 Envenomation & bite

#### 3.6.1 `sss-snake` — Snakebite Severity Score (SSS)

- **Citation:** Dart RC, Hurlbut KM, Garcia R, Boren J. *Validation of a severity score for the assessment of crotalid snakebite.* Ann Emerg Med 1996;27(3):321-326.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `medical-toxicology`, `emergency-medicine`, `wilderness-medicine`.
- **Inputs:** Six organ-system subscales (pulmonary, cardiovascular, local wound, GI, hematologic, CNS), each 0–3 or 0–4.
- **Output:** Sum with mild / moderate / severe band; antivenom-trigger threshold.

#### 3.6.2 `loxoscelism-severity` — Brown-recluse loxoscelism severity

- **Citation:** Vetter RS, Visscher PK. *Bites and stings of medically important venomous arthropods.* Int J Dermatol 1998;37(7):481-496; Swanson DL, Vetter RS. *Loxoscelism.* Clin Dermatol 2006;24(3):213-221.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `dermatology`, `wilderness-medicine`.
- **Inputs:** Local features (erythema, blistering, necrosis), systemic features (hemolysis, hemoglobinuria, DIC).
- **Output:** Local cutaneous vs viscerocutaneous loxoscelism with admission-trigger.

### 3.7 Mass-casualty triage

#### 3.7.1 `start-triage` — START triage

- **Citation:** Super G, Groth S, Hook R. *START: Simple Triage and Rapid Treatment plan.* Newport Beach (CA): Hoag Memorial Hospital Presbyterian; 1984.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `disaster-medicine`, `ems`.
- **Inputs:** Ambulation, respirations (≥30 vs absent vs present), perfusion (radial pulse / cap refill), mental status (follows commands).
- **Output:** Green / yellow / red / black per the START algorithm.

#### 3.7.2 `jumpstart-triage` — JumpSTART pediatric triage

- **Citation:** Romig LE. *Pediatric triage: a system to JumpSTART your triage of young patients at MCIs.* JEMS 2002;27(7):52-58.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `pediatric-emergency-medicine`, `disaster-medicine`, `ems`.
- **Inputs:** Age <8 / weight <100 lb modifier; ambulation, respirations, pulse, AVPU.
- **Output:** Green / yellow / red / black per the JumpSTART algorithm (incl. apneic-with-pulse → 5 rescue breaths).

#### 3.7.3 `salt-triage` — SALT (Sort-Assess-Lifesaving-Treatment) triage

- **Citation:** Lerner EB, Schwartz RB, Coule PL, et al. *Mass-casualty triage: an evaluation of the data and development of a proposed national guideline.* Disaster Med Public Health Prep 2008;2(Suppl 1):S25-S34.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `emergency-medicine`, `disaster-medicine`, `ems`.
- **Inputs:** Global sort (walking / wave-purposeful / still-or-obvious-life-threat), individual assessment (obeys, peripheral pulse, respiratory distress, major hemorrhage).
- **Output:** Minimal / delayed / immediate / expectant / dead.

## 4. Group homes

- Clinical Criteria & Diagnostic Bundles (`H`): §3.1.1, §3.1.3–§3.1.6, §3.2.1–§3.2.4, §3.3.1, §3.3.2, §3.4.2–§3.4.4, §3.5.1–§3.5.4, §3.6.2, §3.7.1–§3.7.3.
- Clinical Scoring & Risk (`G`): §3.1.2, §3.6.1.
- Patient-Reported Symptom Indices (`I`): §3.4.1.

## 5. Per-tile shipping contract

Identical to [spec-v12 §5](spec-v12.md). Field-medicine tiles
additionally record:

- An **offline-capable** flag in the v11 audit log. Every v23
  tile must work fully under the [stability.md](stability.md)
  offline budget (no network at runtime), and the audit verifies
  that the tile's lookup tables are inlined.
- A **resource-context** banner where appropriate: tiles whose
  thresholds assume a hospital (e.g. ABA referral, severe-HAPE
  nifedipine) must surface a banner directing the user to the
  nearest receiving facility or evacuation pathway when the
  bands indicate transfer.
- For mass-casualty triage tiles (§3.7.1–§3.7.3), the audit
  records the canonical color-band lexicon and the verbatim
  decision-node text; user-visible categories ship without
  modification.
- For the historical / superseded references (Modell, §3.3.2),
  the audit records a mandatory banner directing the user to
  the current guidance (ILCOR / Szpilman).

## 6. Catalog ledger

| Spec   | At close | Δ |
|--------|----------|---|
| v22    | 453 | +25 |
| **v23**| **478** | **+25** |

## 7. What ships after v23

- **v24** — patient-decoder expansion + cross-specialty
  completers (EOB/MSN/drug-tier/vaccine decoders + hem-onc
  IPI/FLIPI/MIPI/IPSS family + DOAC renal dosing + age-adjusted
  D-dimer + Geneva revised + IMPROVE-DD + Caprini), closing the
  v21–v24 tranche at 503 tiles.
