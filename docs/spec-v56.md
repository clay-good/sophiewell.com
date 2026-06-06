# spec-v56.md — Weight-based dosing, infusion titration, and bedside toxicology (13 tiles)

> Status: proposed (2026-06-05). v56 is a multi-tile
> medication/infusion spec. It adds **13** deterministic dosing
> and titration calculators that fill confirmed gaps in Sophie's
> Medication & Infusion surface (Group F) — the heparin and
> antimicrobial nomograms a floor/ICU nurse titrates against,
> the pediatric fluid math the peds nurse computes on every
> admission, the procedural-sedation and reversal doses the PACU/
> ED nurse draws up, and the acetaminophen nomogram the ED nurse
> reads off a level. None duplicates an existing tile (checked
> against the v52-close catalog of 255 and the v55 additions).
> Every tile passes the [spec-v29](spec-v29.md) §3 one-line test.
>
> Catalog effect at v56 close: **268 + 13 = 281 tiles.**
>
> Every prior spec (v4 through v55) remains in force. v56 adds no
> runtime network call and no AI; each tile ships its primary
> citation inline ([spec-v54](spec-v54.md)) and inherits the
> [spec-v53](spec-v53.md) input/output-safety contract. Sophie's
> eight commitments ([spec-v50](spec-v50.md) §3) are preserved.
> **Every tile in v56 is dosing decision-support, not a
> prescription; each renders the standing "verify against
> institutional protocol and a current reference; this is not a
> prescription" notice that all medication tiles carry.**

## 1. Thesis

Group F already covers drip rate, weight-based dose,
concentration-to-rate, the opioid MME, equivalence converters,
the vasopressor dose-to-rate, and renal antibiotic adjustment.
The gaps are the high-frequency *titration* and *reconstitution*
tasks a nurse does dozens of times a shift and currently does on
paper:

- **Infusion nomograms** — weight-based heparin (the single most
  common nurse-titrated drip, governed by an aPTT/anti-Xa
  nomogram) and the antimicrobial pharmacokinetics (vancomycin
  AUC, extended-interval aminoglycoside) the pharmacist and ICU
  nurse manage together.
- **Pediatric fluids** — `maint-fluids` ships the 4-2-1
  maintenance rate, but not the dehydration-deficit replacement
  or the weight-based resuscitation bolus that every pediatric
  admission needs.
- **Procedural / peri-op dosing** — ketamine/propofol procedural
  sedation, sugammadex reversal by weight and train-of-four,
  magnesium sulfate for preeclampsia, and a PCA-pump settings
  calculator with an hourly-maximum guardrail.
- **Bedside toxicology** — the acetaminophen Rumack-Matthew
  nomogram (the one tox calculation an ED nurse reads off a
  timed level), digoxin maintenance/level interpretation, the
  local-anesthetic maximum dose that prevents LAST, and a
  concentration ⇄ percent ⇄ ratio converter for the labels nurses
  actually read.

## 2. What v56 adds (13 tiles)

### 2.1 `heparin-nomogram` — Weight-based heparin infusion nomogram

- **Citation:** Raschke RA, et al. Ann Intern Med. 1993;119(9):
  874-881 (weight-based heparin nomogram); titration bands are
  user-selectable to match the institutional aPTT/anti-Xa
  nomogram.
- **citationUrl:** https://doi.org/10.7326/0003-4819-119-9-199311010-00002
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `nursing-icu`, `nursing-floor`,
  `pharmacy`, `cardiology`.
- **Inputs:** weight (kg), indication (VTE vs ACS bolus/rate
  caps), current aPTT or anti-Xa, selected nomogram band.
- **Output:** initial bolus (units, capped), initial rate
  (units/kg/h → units/h), and the next titration step (rate
  change + recheck interval) for the entered aPTT/anti-Xa.
  Weight-cap and max-bolus guards are explicit.

### 2.2 `vanc-auc` — Vancomycin AUC24/MIC (first-order, trough+peak)

- **Citation:** Rybak MJ, et al. (ASHP/IDSA/PIDS/SIDP consensus).
  Am J Health-Syst Pharm. 2020;77(11):835-864 (AUC-guided
  vancomycin, target AUC24/MIC 400–600).
- **citationUrl:** https://doi.org/10.1093/ajhp/zxaa036
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `nursing-icu`,
  `infectious-disease`.
- **Inputs:** two post-distribution levels (peak and trough) with
  their draw times, dose, infusion duration, dosing interval,
  MIC.
- **Output:** elimination rate constant k, extrapolated Cmax/
  Cmin, AUC24, and AUC24/MIC against the 400–600 target.
  Explicitly the **first-order two-level** method (not Bayesian);
  the validity note says so and points to pharmacy for population
  modeling.

### 2.3 `aminoglycoside` — Extended-interval aminoglycoside (Hartford)

- **Citation:** Nicolau DP, et al. Antimicrob Agents Chemother.
  1995;39(3):650-655 (Hartford once-daily aminoglycoside
  nomogram).
- **citationUrl:** https://doi.org/10.1128/AAC.39.3.650
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `infectious-disease`,
  `nursing-icu`.
- **Inputs:** drug (gentamicin/tobramycin vs amikacin), weight
  (dosing weight selected by BMI), single random level + time
  since dose.
- **Output:** the extended-interval dose (mg) and the
  Hartford-nomogram interval (q24/q36/q48 or "off nomogram —
  pharmacy") from the level-vs-time point. Carries the
  "not for synergy dosing or dialysis" validity note.

### 2.4 `acetaminophen-nomogram` — Rumack-Matthew nomogram interpreter

- **Citation:** Rumack BH, Matthew H. Pediatrics. 1975;55(6):
  871-876; treatment line per the U.S. 150 µg/mL-at-4 h
  (Rumack-Matthew treatment) nomogram.
- **citationUrl:** https://doi.org/10.1542/peds.55.6.871
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `toxicology`, `poison-control`.
- **Inputs:** time since acute single ingestion (4–24 h), serum
  acetaminophen level (µg/mL).
- **Output:** plots the point against the treatment line and
  returns "above / below treatment line → NAC indicated / not
  indicated by nomogram," with the hard validity guard: valid
  only for a **single acute** ingestion with a **known** time,
  level drawn at **≥4 h**; not for staggered/chronic ingestion or
  unknown timing (renderer refuses rather than mislead).

### 2.5 `digoxin` — Digoxin maintenance dose + level interpretation

- **Citation:** ACC/AHA/HFSA 2022 heart-failure guideline (digoxin
  level target 0.5–0.9 ng/mL); maintenance estimate per Jelliffe/
  standard pharmacokinetics.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `cardiology`, `pharmacy`, `nursing-floor`,
  `geriatrics`.
- **Inputs:** age, weight, serum creatinine/CrCl, indication
  (AF rate control vs HF), measured level + time since dose
  (optional).
- **Output:** estimated maintenance dose adjusted for renal
  function, and a level interpretation against the 0.5–0.9 ng/mL
  HF target / toxicity threshold, with the "draw level ≥6 h
  post-dose" timing note.

### 2.6 `local-anesthetic-max` — Local anesthetic maximum dose

- **Citation:** Neal JM, et al. (ASRA practice advisory on local
  anesthetic systemic toxicity). Reg Anesth Pain Med, current
  ASRA LAST checklist; per-agent mg/kg ceilings (e.g. lidocaine
  4.5 mg/kg plain, 7 mg/kg with epinephrine).
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `emergency-medicine`, `anesthesiology`,
  `nursing-procedural`, `dermatology`.
- **Inputs:** agent (lidocaine / bupivacaine / ropivacaine ±
  epinephrine), weight (kg), solution concentration (%).
- **Output:** maximum total dose (mg) and the equivalent maximum
  volume (mL) at the entered concentration; weight is capped at a
  documented ceiling so an obese patient is not over-dosed on
  total-body-weight math. Carries the LAST-recognition note.

### 2.7 `mgso4-preeclampsia` — Magnesium sulfate (preeclampsia/eclampsia)

- **Citation:** ACOG Practice Bulletin 222, *Gestational
  Hypertension and Preeclampsia* (2020); Magpie Trial (Lancet.
  2002;359(9321):1877-1890) for seizure-prophylaxis dosing
  (4–6 g load, 1–2 g/h maintenance).
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `obstetrics`, `nursing-ld`,
  `maternal-fetal-medicine`.
- **Inputs:** loading dose (4 or 6 g), maintenance rate (1 or
  2 g/h), bag concentration, renal-function flag.
- **Output:** loading-infusion volume and rate, maintenance
  pump rate (mL/h), and the magnesium-toxicity monitoring note
  (DTRs, respiratory rate, urine output; calcium gluconate as
  antidote). Renal-impairment flag halves the maintenance default
  with a warning.

### 2.8 `pca-pump` — PCA pump settings + hourly-maximum guardrail

- **Citation:** ISMP (Institute for Safe Medication Practices)
  PCA safety guidance and ASPMN position on PCA-by-proxy; computes
  the maximum hourly delivered dose from the programmed settings.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `nursing-floor`, `pain-management`,
  `nursing-postop`, `pharmacy`.
- **Inputs:** drug + concentration, demand (bolus) dose, lockout
  interval (min), optional continuous (basal) rate, optional
  1-hour limit.
- **Output:** maximum demand doses per hour (from the lockout),
  maximum hourly delivered dose (demand + basal), and a flag if
  the programmed 1-hour limit is inconsistent with the lockout.
  Reinforces the "no PCA-by-proxy" safety note.

### 2.9 `sugammadex` — Sugammadex reversal dose

- **Citation:** Bridion (sugammadex) U.S. prescribing information;
  2 mg/kg at reappearance of T2, 4 mg/kg at 1–2 post-tetanic
  counts, 16 mg/kg for immediate reversal after rocuronium.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `anesthesiology`, `nursing-postop`,
  `nursing-procedural`.
- **Inputs:** actual body weight (kg), depth of block
  (T2 / 1–2 PTC / immediate).
- **Output:** sugammadex dose (mg) and volume (mL) at the
  100 mg/mL concentration; uses **actual** body weight per label,
  with the re-curarization and contraception-interaction notes.

### 2.10 `ketamine-propofol` — Procedural sedation weight-based dosing

- **Citation:** ACEP clinical policy on procedural sedation
  (Ann Emerg Med) and standard agent dosing (ketamine 1–2 mg/kg
  IV; propofol 0.5–1 mg/kg IV; ketofol per institutional ratio).
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `emergency-medicine`, `nursing-ed`,
  `nursing-procedural`.
- **Inputs:** agent (ketamine / propofol / ketofol), weight (kg),
  selected mg/kg within the published range.
- **Output:** initial dose (mg) and volume (mL) at standard
  concentrations, plus the typical re-dose increment; reinforces
  the "monitored setting, airway-ready" requirement. No infusion
  automation.

### 2.11 `peds-fluid-deficit` — Pediatric dehydration deficit + maintenance

- **Citation:** Holliday MA, Segar WE. Pediatrics. 1957;19(5):
  823-832 (4-2-1 maintenance); deficit = % dehydration × weight;
  standard deficit-replacement split (½ over 8 h, ½ over 16 h
  after resuscitation).
- **citationUrl:** https://doi.org/10.1542/peds.19.5.823
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pediatrics`, `nursing-peds`,
  `emergency-medicine`, `nursing-picu`.
- **Inputs:** weight (kg), estimated % dehydration (mild/moderate/
  severe or numeric), maintenance method.
- **Output:** hourly maintenance rate, total fluid deficit (mL),
  and the deficit-replacement schedule (mL/h for the first 8 h
  and next 16 h), with the note that boluses are subtracted and
  ongoing losses replaced separately.

### 2.12 `peds-resus` — Pediatric resuscitation bolus calculator

- **Citation:** AHA Pediatric Advanced Life Support (PALS) 2020;
  isotonic bolus 10–20 mL/kg, reassess after each; 10 mL/kg in
  suspected cardiac/DKA contexts.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pediatrics`, `nursing-peds`, `nursing-ed`,
  `emergency-medicine`.
- **Inputs:** weight (kg), bolus size (10 or 20 mL/kg),
  context flag (sepsis vs cardiac/DKA cautious).
- **Output:** bolus volume (mL) per push, the reassess-after-each
  reminder, and a context warning when 20 mL/kg is selected in a
  cardiac/DKA context. Weight cap at adult dosing.

### 2.13 `conc-percent` — Concentration ⇄ percent ⇄ ratio converter

- **Citation:** standard pharmaceutical concentration definitions
  (USP): 1% w/v = 10 mg/mL; ratio 1:1000 = 1 mg/mL.
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `nursing-ed`, `pharmacy`, `nursing-procedural`,
  `anesthesiology`.
- **Inputs:** any one of % (w/v), mg/mL, or ratio (1:X), plus the
  conversion direction.
- **Output:** the other two representations (e.g. epinephrine
  1:1000 = 1 mg/mL = 0.1%), so a nurse reading "1:10,000" off a
  crash-cart label can confirm mg/mL instantly. Pure deterministic
  conversion.

## 3. Per-tile robustness and the medication notice

- Every compute function imports the shared `lib/num.js`
  helpers and is covered by the [spec-v53](spec-v53.md) fuzz
  harness (no `NaN`/`Infinity`/`undefined` leaks; non-positive
  weights/concentrations/denominators return `null` → `fmt()`
  fallback).
- Weight-based tiles cap at a documented adult/obesity ceiling so
  total-body-weight math cannot silently over-dose (carries the
  spec-v53 §4.3 soft-bound advisory).
- Every tile renders the standing medication notice ("decision
  support, not a prescription; verify against institutional
  protocol and a current reference"). The
  `acetaminophen-nomogram` and `aminoglycoside` tiles
  additionally **refuse** to compute outside their validity
  window (unknown ingestion time; dialysis) rather than return a
  misleading number.

## 4. Files touched

```
docs/spec-v56.md                         (this file)
app.js                                   (+13 UTILITIES rows, group F)
lib/medication-v5.js                     (new module: 13 compute exports)
lib/meta.js                              (+13 META entries, inline citations + accessed)
views/group-v8.js                        (new renderer module: 13 renderers)
app.js                                   (import group-v8 renderers into RENDERERS)
docs/citation-staleness.md               (+ rows for guideline tiles: vanc-auc, digoxin, mgso4-preeclampsia)
test/unit/heparin-nomogram.test.js       (new)
test/unit/vanc-auc.test.js               (new)
test/unit/aminoglycoside.test.js         (new)
test/unit/acetaminophen-nomogram.test.js (new)
test/unit/digoxin.test.js                (new)
test/unit/local-anesthetic-max.test.js   (new)
test/unit/mgso4-preeclampsia.test.js     (new)
test/unit/pca-pump.test.js               (new)
test/unit/sugammadex.test.js             (new)
test/unit/ketamine-propofol.test.js      (new)
test/unit/peds-fluid-deficit.test.js     (new)
test/unit/peds-resus.test.js             (new)
test/unit/conc-percent.test.js           (new)
test/integration/fuzz-tools.spec.js      (import lib/medication-v5.js for coverage)
docs/audits/v11/heparin-nomogram.md ... conc-percent.md  (13 new audit logs)
docs/scope-mdcalc-parity.md              (catalog count 268 -> 281)
CHANGELOG.md                             (Unreleased: v56 entry, +13)
README.md                                (catalog count 268 -> 281)
package.json                             (description count 268 -> 281)
```

## 5. Acceptance criteria

v56 is fully shipped when:

- This file exists.
- All 13 tiles in §2 are present: each has a `META[id]` entry, a
  primary citation visible inline, ≥3 boundary worked examples in
  its unit test (including the validity-refusal cases for
  `acetaminophen-nomogram` and `aminoglycoside`), and a
  [spec-v11](spec-v11.md) audit log.
- Every tile renders the standing medication notice; the two
  validity-window tiles refuse rather than mislead outside their
  window (pinned by tests).
- Every compute function uses `lib/num.js` and is covered by the
  spec-v53 fuzz harness with zero non-finite leaks.
- Guideline-derived tiles carry `accessed` + a
  `docs/citation-staleness.md` row ([spec-v54](spec-v54.md)).
- `UTILITIES.length` is 281 and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v56 with the +13 catalog delta.

## 6. Out of scope for v56

- Bayesian pharmacokinetic dosing (vancomycin/aminoglycoside) —
  v56 ships the deterministic first-order/nomogram methods only;
  population modeling stays with pharmacy software.
- Continuous-infusion titration *automation* (the tiles compute a
  setting or a next step; they do not run a closed-loop protocol).
- A full toxicology suite (salicylate, toxic alcohols, TCA, etc.)
  — v56 adds only the acetaminophen nomogram and digoxin; the
  existing antidote-reference tiles cover lookups. Candidate for a
  future tox spec.
- Neonatal-specific dosing (per-kg micro-dosing, NICU
  concentrations) — v56's pediatric tiles target the general
  peds/ED weight range; NICU dosing is a future spec alongside the
  v58 neonatal scores.
- Drug–drug interaction checking — out of scope and would require
  a maintained interaction dataset.
