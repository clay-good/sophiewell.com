# Sophie Well calculators — optional stdio MCP server (spec-v183)

A local [Model Context Protocol](https://modelcontextprotocol.io) server that
exposes Sophie Well's deterministic, source-cited clinical calculators as tools
an AI agent can call. LLMs are unreliable at exact arithmetic and at recalling
published coefficients; these calculators are reliable at both. Wrapping them as
MCP tools turns *"the model guesses the score"* into *"the model calls a
deterministic tool and gets the right number plus the source to cite."*

**The website ([sophiewell.com](https://sophiewell.com)) is the product.** This
server is an optional, isolated second consumption surface for the calculators
that already exist. It adds zero browser code and zero runtime dependencies to
the site.

## No hosting · no network · no AI

- **stdio only.** The server speaks MCP over stdin/stdout. There is no HTTP, no
  SSE, no socket, and no network egress of any kind.
- **Local.** The agent that wants it spawns it as a subprocess on your machine.
  We host nothing, run nothing, and see nothing — the right privacy posture for
  clinical inputs.
- **Deterministic.** Identical `{ id, inputs }` always returns a byte-identical
  result. No `Date.now()`, no `Math.random()`, no model calls, no hidden state.
- **Stateless.** No filesystem writes, no persistence, no input logging, no
  telemetry.

## Install

Requires Node `>=20.18.1 <21` (matches the repo `.nvmrc`).

```sh
git clone https://github.com/clay-good/sophiewell.com.git
cd sophiewell.com/mcp
npm install        # installs @modelcontextprotocol/sdk into this subtree only
```

The MCP SDK is pinned in `mcp/package.json`. The website's root `package.json`
keeps `dependencies: {}` — installing the server here never adds a runtime
dependency to the site.

## Wire it into an MCP client

Add a stdio server block to your client config (the same shape as any local MCP
server). For Claude Code / Claude Desktop:

```json
{
  "mcpServers": {
    "sophiewell-calculators": {
      "command": "node",
      "args": ["/absolute/path/to/sophiewell.com/mcp/server.js"]
    }
  }
}
```

## Tools

A fixed four-tool surface with dynamic dispatch over the catalog (exposing one
tool per calculator would flood the client's tool list):

| Tool | Input | Returns |
|---|---|---|
| `list_calculators` | `{ group?, specialty?, query? }` | Lightweight rows `{ id, name, group, specialties, summary }` plus a live coverage line. `query` is a substring test. No computation. |
| `find_calculator` | `{ query, limit?, group?, specialty? }` | Discovery by plain-language intent: the same deterministic ranker the browser prompt bar uses (synonym table + token ranker, no AI) ranks the exposed calculators and returns the top-N candidates `{ id, name, group, specialties, summary, why }`. Use it when a substring `query` would miss (e.g. "stroke risk afib"). |
| `describe_calculator` | `{ id }` | The full contract: `inputSchema` (JSON Schema), a worked `example`, `citation` + `citationUrl` + `citationAccessed`, the source interpretation bands, and the clinical-posture disclaimer. |
| `compute_calculator` | `{ id, inputs }` | The deterministic `result` (score, bands, derived values, source note), the citation, and the disclaimer. Invalid or incomplete input returns `{ valid: false, message }` — never a thrown error and never a non-finite number. |

`inputs` are keyed exactly as `describe_calculator` reports them (and exactly as
each calculator's documented example). Numbers may be sent as numbers or numeric
strings; booleans as `true`/`false`; enums by their listed string values.

### Example session

```
find_calculator { "query": "stroke risk afib" }
  -> { query: "stroke risk afib", count: 3,
       candidates: [ { id: "chads", name: "CHA2DS2-VASc", why: "synonym", ... }, ... ] }

list_calculators { "specialty": "hepatology" }
  -> { coverage: "1278 of 1109 catalog tiles exposed ...", calculators: [ { id: "meld-xi", ... }, ... ] }

describe_calculator { "id": "meld-xi" }
  -> { inputSchema: { ... mx-bili, mx-creat ... }, citation: "Heuman DM ... Liver Transpl 2007", ... }

compute_calculator { "id": "meld-xi", "inputs": { "mx-bili": 2.0, "mx-creat": 1.5 } }
  -> { valid: true, result: { score: 18, band: "MELD-XI 18 ...", note: "..." },
       citation: "Heuman DM ...", disclaimer: "This is a computed quantity for decision support, not ..." }
```

## Coverage

Coverage is incremental and explicit. `docs/mcp-coverage.md` is the ledger of
which calculators are exposed; `list_calculators` always reports the live
fraction. The first wave exposed 21 clinical calculators across 4 `lib` modules
as a proof of pattern; a second wave added 18 more across 4 modules (pulmonary
function, hemorrhagic stroke, metabolic / endocrine, and perioperative risk); a
third wave added the 6 one-formula tiles; a fourth wave added 15 more across 3
modules (atrial-fibrillation stroke / QT risk, hematology pretest scores, and
gastroenterology severity indices); and a fifth wave adds 35 more across 7
modules (heart-failure risk / HFpEF probability, wide-complex-tachycardia and
syncope-risk algorithms, cardiovascular-risk engines, critical-care severity and
ICU-weakness scores, dynamic fluid-responsiveness measures, hepatology / GI
severity indices, and hematology / oncology prognostic scores); and a sixth wave
adds 36 more across 8 modules (stroke-triage and cerebrovascular scores, seizure
/ headache / vertigo bedside instruments, neuromuscular prediction and
classification, dementia / spasticity / brainstem-encephalitis instruments,
nephrology risk and AKI staging, renal-physiology formulas, and two urology
clusters); and a seventh wave adds 36 more across 8 modules (critical-care
hemodynamics and ventilation mechanics, nephrology staging / adequacy / risk,
evidence-based-medicine math, ophthalmology, echocardiography, rheumatology
activity and classification indices, venous-thromboembolism instruments, and
vascular medicine); an eighth wave added 9 more across 2 modules (predictive
energy-expenditure equations and endocrine / metabolic bedside math); and a
ninth wave added 39 more across 8 modules (advanced bedside quantitation,
specialty math, and subspecialty oncology / hematology / hepatology-GI /
dermatology-urology / bedside-risk staging); and a tenth wave added 34 more
across 8 modules (the Long-Term Care & Geriatric Assessment cluster — cognition
and dementia staging, delirium / depression / agitation, observational pain
scales, falls-risk and physical performance, frailty and sarcopenia,
nutrition-risk and dysphagia, medication-burden indices, and continence /
caregiver-strain / wound-status quantitation); and an eleventh wave added 50
more across 9 modules (the acute neurology / psychiatry / pulmonary / toxicology
/ trauma cluster — stroke outcome and AVM grading, stroke imaging and
thrombolysis prognosis, clinician-rated and public-domain psychiatric scales,
COPD / bronchiectasis / sleep instruments, pulmonary-nodule / PH /
pleural-infection scores, toxicology dosing and dialysis decisions, and trauma
severity / classification scores); and a twelfth wave added 56 more across 11
modules (the rheumatology / obstetric-gynecology / spine / orthopedic / surgical
cluster — RA/spondyloarthritis/SLE/vasculitis activity and criteria, palliative
prognosis, opioid conversion, metastatic-spine and spinal-injury scores,
fracture classifications, surgical and airway risk models, urology symptom
scores, gynecologic risk/staging, and obstetric bedside math); and a thirteenth
wave added 16 more across 5 modules (older-adult prognosis, metabolic
emergencies, environmental injury, ED/ICU decision instruments, and warfarin
dosing); and a fourteenth wave added 59 more across 16 modules (the
specialty-completion surface — bedside pediatrics/EMS, pharmacology, diagnostic
imaging, frailty & geriatric oncology, functional/fall-risk status, hepatology,
infectious disease, lymphoma/CLL and plasma-cell/myeloid staging,
neuro-disability grading, pediatric acute severity and growth, and the SCORAD
dermatology score); and a fifteenth wave began the post-parity specialist
modules with the acute-coronary / primary-PCI / cardiogenic-shock risk cluster
(CRUSADE, SCAI SHOCK, Zwolle, TIMI Risk Index, CADILLAC), a sixteenth added
the invasive / echocardiographic hemodynamics cluster (PAPi, transpulmonary and
diastolic gradients, Tei index, shunt fraction), a seventeenth added the
bedside ventilation / oxygenation indices (S/F ratio, ventilatory ratio, OSI,
ventilation index), an eighteenth added the chronic-liver-disease prognostic
cluster (ABIC, GLOBE, UK-PBC, PAGE-B, revised Mayo PSC), a nineteenth added
the quantitative thyroid / beta-cell cluster (SPINA-GT, SPINA-GD, Jostel TSH
index, HOMA-B, oral disposition index), a twentieth added the
cross-subspecialty prognostic cluster (CNS-IPI, ISTH-BAT, VIRSTA, SeLECT,
WHO/FIGO GTN), a twenty-first added the myeloid-neoplasm / transplant
prognostic cluster (MIPSS70, GIPSS, MYSEC-PM, Sorror HCT-CI), a
twenty-second added the critical-care severity / acid-base cluster (OASIS, LODS,
delta gap, APPS), a twenty-third added the hepatology / GI-bleed cluster
(Glasgow-Blatchford, CLIF-C AD, Hepamet, CLIP, Agile 3+), a twenty-fourth
added the MECKI CPET-anchored heart-failure prognosis score, a twenty-fifth
added the perioperative / TIA-risk cluster (DASI, ABCD3-I, SORT), a
twenty-sixth added the nephrology / fluid-and-electrolyte cluster (CCCR, ABL,
EFWC, TmP/GFR, urinary calcium), a twenty-seventh added the pulmonary / COPD
/ sleep cluster (CAT, LENT, ADO, DOSE, SACS), a twenty-eighth added the TBI /
stroke prognostic cluster (Essen, Rotterdam CT, Marshall CT, FUNC), a
twenty-ninth added the resuscitation / early-warning cluster (TOR rules, REMS,
CART), a thirtieth added the nutrition / maternal-fetal cluster (ponderal
index, sFlt-1/PlGF, GLIM, SGA), a thirty-first added the cardiology risk
engines (HCM Risk-SCD, CHARGE-AF), a thirty-second added the SPAN-100
acute-stroke prognostic index, a thirty-third added the hematology-oncology
risk cluster (EUTOS, IMPROVEDD, COMPASS-CAT, ELN 2022 AML), a thirty-fourth
added the hepatology fibrosis / portal-hypertension cluster (King's Score, Baveno
VII), a thirty-fifth added the acute-injury / ED decision cluster (HEART
Pathway, Ottawa HF, Light's criteria, Baux, revised Baux), a thirty-sixth
added the cardiology risk scores (APPLE, CAAP-AF, ATLAS, HATCH, MB-LATER, C-ACS,
ACTION ICU), a thirty-seventh added the lipid / device / onco-VTE risk
cluster (DLCN, Simon Broome, PADIT, GRIm, LIPI, ONKOTEV, PROTECHT), a
thirty-eighth added the hematology prognosis cluster (WPSS, MDACC CLL, PIT,
PRIMA-PI, Durie-Salmon, LDT, Talcott), a thirty-ninth added the stroke /
neuro-vascular risk cluster (Canadian TIA, ASTRAL, SOAR, PLAN, SITS-SICH,
VASOGRADE, Ogilvy-Carter), a fortieth added the ED decision cluster (FAINT,
NEXUS Head CT, HANDOC, DENOVA, ICM-PJI 2018, AIR, Adult Appendicitis), a
forty-first added the metabolic / hepatic indices (ADA, Cambridge, LAP, VAI,
conicity, AST/ALT, GGT/platelet), a forty-second added the hepatology
prognosis cluster (FIPS, ALBI-PLT, D'Amico, aMAP, NACSELD-ACLF, FibroQ), a
forty-third added the pulmonary risk cluster (simplified Geneva, SCAP, CORB,
RESP, ILD-GAP, du Bois IPF, pneumothorax volume), a forty-fourth added the
rheumatology classification cluster (IIM 2017, PMR 2012, Bohan-Peter, SSc 2013,
mRSS, Sjogren 2016, ESSPRI), a forty-fifth added the dermatology cluster
(UAS7, HiSCR, Hurley, POEM, ALDEN, PEST, Glasgow 7-point), a forty-sixth
added the neurology cluster (ID Migraine, ONLS, END-IT, Engel, ILAE, Salzburg
NCSE, DHI), a forty-seventh added the obstetrics/gynecology cluster (Nugent,
Amsel, Ferriman-Gallwey, PBAC, Thompson HIE, MRS, Kupperman), a forty-eighth
added the nephrology / fluid-and-electrolyte cluster (Watson TBW,
Salazar-Corcoran, ePVS, furosemide stress test, FE-bicarbonate, corrected
potassium), a forty-ninth added the cross-specialty cluster (ICBD 2014, ISG
1990, BATT, Denver ED-TOF, ETS, WHO dengue 2009), a fiftieth added the
microcytic-anemia RBC discrimination indices (England-Fraser, Sirdah, RDW index,
Srivastava, Ehsani), a fifty-first added the CBC-derived indices (AEC, NLR,
PLR, SII), and a fifty-second adapted the whole spec-v230–v257 subspecialty-depth
program in one pass (28 modules, 109 calculators — inflammation and coagulation
indices, cranial / anthropometric estimators, dermatology / pain / ophthalmology
/ echocardiography scores, GI-surgery and rehab / geriatric batteries,
environmental-exposure indices, ENT-sleep, sports-MSK, heme-derm, IBD, pediatric
tox, wound ID, renal-pulmonary, ob-gyn, cardiometabolic, ortho-spine, radiology
measurement, ENT-uro-psych, mixed risk scores, rheumatology criteria, and dive
medicine), and a fifty-third cleared the deferral backlog (14 tiles across 9
modules that needed a bespoke `toArgs`, a variable-length array input, or a
`META.example` that had not yet been written — PHASES, HEAR, Wagner / U-Texas
DFU, PASI / EASI / DLQI, POSPOM, SES-CD, Kawasaki / CATCH, DOLOPLUS-2, and the
McGeer / Loeb site-branched criteria), a fifty-fourth adapted the
foundational bedside-math and clinical-scoring core (111 tiles across 11 modules
— `lib/clinical.js`, `lib/clinical-v4..v8.js`, `lib/scoring-v4/-v6.js`,
`lib/medication-v4/-v5.js`, and `rosendaal-ttr` in `lib/gaps-v185.js`), and a
fifty-fifth added the Group G bedside scoring core in `lib/clinical.js` (GCS,
APGAR, ABG interpretation, Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, NIHSS), and
a fifty-sixth the Group G ED decision core in `lib/scoring-v4.js` (TIMI, GRACE,
HEART, PERC, Wells PE + Geneva, CURB-65, PSI, qSOFA + SOFA, MELD-3.0 +
Child-Pugh, Ranson + BISAP, Centor + McIsaac, Wells DVT + Caprini, Bishop,
Alvarado + PAS), a fifty-seventh the ICU bedside / early-warning cluster
(NEWS2, MEWS, SIRS, Killip, MODS, RASS, SAS/Riker, CAM-ICU, ICDSC, 4AT, CPOT,
BPS), and a fifty-eighth the cognition / withdrawal / sleep / periop
assessment cluster (Mini-Cog, CIWA-Ar, COWS, Epworth, STOP-BANG, Berlin OSA,
Apfel, Aldrete, LEMON, White-Song), and a fifty-ninth the GI-bleed /
readmission / comorbidity / performance-status cluster (Glasgow-Blatchford,
Rockall, AIMS65, Oakland, Maddrey + Lille, the two Canadian imaging rules,
HOSPITAL, LACE, Charlson, Clinical Frailty Scale, ECOG + Karnofsky), and a
sixtieth the VTE / anticoagulation bleeding-and-risk cluster (PESI, sPESI,
Padua, ATRIA, ORBIT, HEMORR2HAGES, IMPROVE-Bleeding, IMPROVE-VTE, Khorana,
DASH, HERDOO2, 4Ts, ISTH-DIC, DAPT), and a sixty-first the obstetric /
maternal cluster (Biophysical Profile, ACOG severe-feature preeclampsia,
HELLP, Carpenter-Coustan, IADPSG, MEOWS), and a sixty-second the pediatric
fever / sepsis and respiratory cluster (Rochester, Philadelphia, Boston,
Step-by-Step, Yale Observation Scale, Westley croup, PRAM, PASS, pediatric GCS,
Nigrovic), and a sixty-third the falls-risk and neuro-assessment cluster
(Braden, Morse Fall Scale, Hendrich II, CAM, ICH Score, Hunt-Hess + WFNS,
modified NIHSS, FOUR Score), and a sixty-fourth the pediatric / ICU pain,
sedation, and withdrawal scales (FLACC, PAINAD, NIPS, N-PASS, CRIES, POSS,
COMFORT-B, WAT-1, SBS, SOS), and a sixty-fifth the prehospital stroke scales,
ADLs, and C-SSRS (CPSS, LAMS, RACE, ROSIER, GUSS, Barthel, Lawton IADL, Katz
ADL, C-SSRS), and a sixty-sixth the pulmonary / CAP-severity cluster (HACOR,
Berlin ARDS, Murray LIS, SMART-COP, CRB-65, ATS/IDSA severe CAP), and a
sixty-seventh the nutrition-risk and Ottawa-rule cluster (NUTRIC, mNUTRIC,
NRS-2002, MUST, Ottawa Ankle, Ottawa SAH), and a sixty-eighth the workflow /
wound / transfusion cluster (DRIP, ABC-MTP, NPIAP staging, Norton + PUSH, VIP +
INS, blood compatibility) that drains the last adaptable Group-G tiles in
`lib/scoring-v4.js`, and a sixty-ninth the group-v5 diagnostic ratios and
staging tiles in `lib/clinical-v5.js` (Light's criteria, Mentzer, SAAG,
R-factor, KDIGO AKI, modified Sgarbossa, AVPU-GCS), and a seventieth the flat
prehospital / MCI triage screens in the new `lib/field.js` module (Cincinnati
stroke scale, FAST / BE-FAST, START, JumpSTART), and a seventy-first the
environmental-emergency decision tiles (hypothermia staging + rewarming,
heat-illness cooling algorithm), and a seventy-second the pediatric / adult
severity scores in `lib/scoring-v6.js` (PELOD-2, pSOFA, Burch-Wartofsky,
ARISCAT, APACHE II, Braden Q), and a seventy-third the remaining group-v5
scores in `lib/clinical-v5.js` (RCRI, PEWS, ABCD2), and a seventy-fourth the
deterministic ICU workflow tiles in `lib/scoring-v4.js` (LIPS, MTP ratio
tracker, Bristol stool scale), and a seventy-fifth the ID / critical-care
criteria in the new `lib/idcrit-v99.js` module (modified Duke endocarditis,
Pitt Bacteremia, SAPS II, refeeding risk), and a seventy-sixth the group-v9
screening / decision instruments in the new `lib/scoring-v5.js` module (PHQ-2/
GAD-2, AUDIT, DAST-10, GDS-15, Ottawa Knee, NEXUS Chest, SF + Canadian syncope,
EDACS, YEARS, FeverPAIN, STONE, ISS + RTS, SIPA), and a seventy-seventh the
cardiovascular 10-year risk engines in `lib/scoring-v4.js` (ASCVD Pooled Cohort
Equations, AHA PREVENT 2023), and a seventy-eighth the flat burn / airway /
drug-dose recipes in `lib/field.js` (burn fluid, pediatric ETT, naloxone,
pediatric weight-based dose), and a seventy-ninth the 42 CFR restraint-
reassessment timer in `lib/scoring-v4.js`, an eightieth Naegele's rule
estimated due date in `lib/clinical.js`, an eighty-first the Lund-Browder burn
%TBSA in `lib/idcrit-v99.js`, an eighty-second the Rule-of-Nines /
Lund-Browder burn %TBSA estimator in `lib/field.js`, and an eighty-third the
ventilator SBT readiness + ARDSnet PEEP look-up in `lib/scoring-v4.js`, and an
eighty-fourth the measured timed-urine creatinine clearance in
`lib/renal-v277.js`, and an eighty-fifth the RDW-to-platelet ratio in
`lib/fibrosis-v275.js`, and an eighty-sixth the Buzby Nutritional Risk Index in
`lib/nutrition-v276.js`, and an eighty-seventh the albumin-to-globulin ratio in
`lib/proteins-v274.js`, and an eighty-eighth the TyG-BMI insulin-resistance
surrogate in `lib/metabolic-v273.js`, and an eighty-ninth the waist-to-height
ratio in `lib/anthro-v272.js`, and a ninetieth the Castelli Risk Indices in
`lib/lipids-v271.js`, and a ninety-first the Cardiometabolic Index in
`lib/adiposity-v270.js`, and a ninety-second the METS-IR insulin-resistance
surrogate in `lib/metabolic-v269.js`, and a ninety-third the HALP score in
`lib/inflam-v267.js`, and a ninety-fourth the Advanced Lung Cancer Inflammation
Index in `lib/inflam-v268.js`, and a ninety-fifth the Phoenix Sepsis Score in
`lib/peds-sepsis-v278.js`, and a ninety-sixth the two resected-RCC prognosis
instruments (Leibovich, UISS) in `lib/rcc-prognosis-v279.js`, and a
ninety-seventh the HAQ-DI and ASAS axial-SpA criteria in `lib/rheum-fn-v280.js`,
and a ninety-eighth the GALAD score and Toronto HCC Risk Index in
`lib/hcc-surveillance-v281.js`, and a ninety-ninth three acute / primary-care
decision rules (Canadian CT Head, SF Syncope, McIsaac) in
`lib/decision-rules-v258.js`, and a one-hundredth three pneumonia risk scores
(A-DROP, DRIP, Shorr) in `lib/pneumonia-risk-v260.js`, and a one-hundred-first
three acute-abdomen / emergency-surgery scores (RIPASA, PULP, ESS) in
`lib/acute-abdomen-v261.js`, and a one-hundred-second three pediatric acute-care
scores (Lab-score, CHALICE, Egami) in `lib/pediatric-acute-v262.js`, and a
one-hundred-third three respiratory / maternal acute scores (MuLBSTA, Ottawa
COPD, SOS) in `lib/respiratory-maternal-v263.js`, and a one-hundred-fourth the
ABC massive-transfusion score in `lib/massive-transfusion-v265.js`, and a
one-hundred-fifth the SSIGN RCC score in `lib/rcc-prognosis-v266.js`, and a
one-hundred-sixth the AABB restrictive transfusion threshold in
`lib/transfusion-v292.js`, and a one-hundred-seventh the NEXUS c-spine rule
(extracted to a lib fn) in `lib/field.js`, and a one-hundred-eighth the TST
tuberculin-skin-test interpretation (extracted to a lib fn) in
`lib/tb-testing.js`, and a one-hundred-ninth minute-ventilation (reworded to clear
a PaCO2 numeric-matcher collision) in `lib/clinical-v8.js`, and a one-hundred-tenth
the Aldrete + PADSS post-anesthesia recovery scores (composite) in
`lib/scoring-v4.js`, and a one-hundred-eleventh the ACS field-triage algorithm in
`lib/field.js`, and a one-hundred-twelfth single-medication opioid MME, and a
one-hundred-thirteenth the bidirectional vasopressor dose/rate math, both in
`lib/medication-v4.js`, and a one-hundred-fourteenth the plain-language lab-value
interpreter in `lib/lab-interpret.js`, and a one-hundred-fifteenth the PHQ-9
depression screen, and a one-hundred-sixteenth the GAD-7 anxiety screen, and a one-hundred-seventeenth the
EPDS perinatal depression screen, and a one-hundred-eighteenth the AUDIT-C and
CAGE alcohol screens, all in
`lib/scoring-v4.js`, and a one-hundred-nineteenth the FAST dementia staging tile
in `lib/fast-dementia-v294.js`, and a one-hundred-twentieth the Reisberg Global
Deterioration Scale tile in `lib/gds-v295.js`, and a one-hundred-twenty-first the
benzodiazepine dose-equivalence converter in `lib/benzo-equiv-v296.js`, and a
one-hundred-twenty-second the Seddon-Sunderland nerve-injury classification in
`lib/nerve-injury-v297.js`, and a one-hundred-twenty-third the graduated
return-to-sport (concussion) strategy in `lib/concussion-rts-v298.js`, and a
one-hundred-twenty-fourth the cosyntropin (ACTH) stimulation test interpretation
in `lib/cosyntropin-v299.js`, and a one-hundred-twenty-fifth the AVF maturation
"Rule of 6s" in `lib/av-fistula-v300.js`, and a one-hundred-twenty-sixth the
diabetic retinopathy severity (ICDR scale) in `lib/dr-severity-v301.js`, and a
one-hundred-twenty-seventh the Instability Severity Index Score (shoulder) in
`lib/isis-v302.js`, and a one-hundred-twenty-eighth the Ring & Messmer anaphylaxis
severity grade in `lib/anaphylaxis-v303.js`, and a one-hundred-twenty-ninth the
1-mg overnight dexamethasone suppression test in `lib/dst-v304.js`, and a
one-hundred-thirtieth the ASTCT cytokine release syndrome grade in
`lib/crs-v305.js`, and a one-hundred-thirty-first the ASTCT ICANS neurotoxicity
grade in `lib/icans-v306.js`, and a one-hundred-thirty-second the diabetic macular
edema (DME) severity in `lib/dme-v307.js`, and a one-hundred-thirty-third the
graduated return-to-learn (concussion) strategy in `lib/concussion-rtl-v308.js`, and
a one-hundred-thirty-fourth the acute GVHD grade (modified Glucksberg) in
`lib/gvhd-v309.js`, and a one-hundred-thirty-fifth the acute cholangitis severity
grade (Tokyo Guidelines TG18) in `lib/cholangitis-v310.js`, and a
one-hundred-thirty-sixth the acute cholecystitis severity grade (Tokyo Guidelines
TG18) in `lib/cholecystitis-v311.js`, and a one-hundred-thirty-seventh the acute
cholangitis diagnosis (Tokyo Guidelines TG18) in `lib/cholangitis-dx-v312.js`, and a
one-hundred-thirty-eighth the acute cholecystitis diagnosis (Tokyo Guidelines TG18)
in `lib/cholecystitis-dx-v313.js`, and a one-hundred-thirty-ninth the Deauville
5-point score (PET response, lymphoma) in `lib/deauville-v314.js`, and a
one-hundred-fortieth the 2015 revised Jones criteria (acute rheumatic fever) in
`lib/jones-v315.js`, and a one-hundred-forty-first the GOLD ABE assessment tool
(COPD group A/B/E) in `lib/gold-abe-v316.js`, and a one-hundred-forty-second the
CDI severity classification (2017 IDSA/SHEA) in `lib/cdi-severity-v317.js`, and a
one-hundred-forty-third the Los Angeles (LA) classification of erosive esophagitis
in `lib/la-esophagitis-v318.js`, and a one-hundred-forty-fourth the CCS angina grade
in `lib/ccs-angina-v319.js`, and a one-hundred-forty-fifth the Clavien-Dindo
classification of surgical complications in `lib/clavien-dindo-v320.js`, and a
one-hundred-forty-sixth the Hinchey classification of acute diverticulitis in
`lib/hinchey-v321.js`, and a one-hundred-forty-seventh the ACR BI-RADS assessment
categories in `lib/bi-rads-v322.js`, and a one-hundred-forty-eighth the Siewert
classification of GEJ adenocarcinoma in `lib/siewert-v323.js`, and a
one-hundred-forty-ninth the Wexner (Cleveland Clinic) fecal incontinence score in
`lib/wexner-v324.js`, and a one-hundred-fiftieth the ACR Lung-RADS v2022 assessment
categories in `lib/lung-rads-v325.js`, and a one-hundred-fifty-first the ACR O-RADS
US v2022 risk categories in `lib/o-rads-v326.js`, and a one-hundred-fifty-second the
ACR LI-RADS v2018 CT/MRI diagnostic categories in `lib/li-rads-v327.js`, and a
one-hundred-fifty-third the Montreal classification of IBD in
`lib/montreal-ibd-v328.js`, and a one-hundred-fifty-fourth the Paris endoscopic
classification in `lib/paris-classification-v329.js`, and a one-hundred-fifty-fifth
the Nottingham Prognostic Index (breast cancer) in `lib/nottingham-npi-v330.js`, and a
one-hundred-fifty-sixth the Fitzpatrick skin phototype in `lib/fitzpatrick-v331.js`, and a
one-hundred-fifty-seventh the Haggitt classification (malignant colorectal polyp) in
`lib/haggitt-v332.js`, and a one-hundred-fifty-eighth the Kikuchi classification (sessile
submucosal invasion) in `lib/kikuchi-v333.js`, and a one-hundred-fifty-ninth the Kudo pit-pattern
classification in `lib/kudo-v334.js`, and a one-hundred-sixtieth the NICE classification (NBI
colorectal lesion) in `lib/nice-v335.js`, and a one-hundred-sixty-first the JNET classification
(magnifying NBI colorectal) in `lib/jnet-v336.js`, and a one-hundred-sixty-second the Outerbridge
cartilage classification in `lib/outerbridge-v337.js`, and a one-hundred-sixty-third the ICRS
cartilage lesion classification in `lib/icrs-v338.js`, and a one-hundred-sixty-fourth the
Cormack-Lehane laryngoscopy grade in `lib/cormack-lehane-v339.js`, and a one-hundred-sixty-fifth the
Clark level (melanoma invasion) in `lib/clark-level-v340.js`, and a one-hundred-sixty-sixth the
Mason-Johnston radial head fracture classification in `lib/mason-radial-head-v341.js`, and a
one-hundred-sixty-seventh the Hawkins classification (talar neck fracture) in
`lib/hawkins-talar-v342.js`, and a one-hundred-sixty-eighth the Sanders classification (calcaneal
fracture) in `lib/sanders-calcaneal-v343.js`, and a one-hundred-sixty-ninth the Ficat-Arlet staging
(femoral head AVN) in `lib/ficat-arlet-v344.js`, and a one-hundred-seventieth the Lichtman staging
(Kienbock disease) in `lib/lichtman-kienbock-v345.js`, and a one-hundred-seventy-first the Catterall
classification (Legg-Calve-Perthes) in `lib/catterall-perthes-v346.js`, and a one-hundred-seventy-second
the Herring lateral pillar classification (Perthes) in `lib/herring-pillar-v347.js`, and a
one-hundred-seventy-third the Strasberg classification (bile duct injury) in `lib/strasberg-bdi-v348.js`,
and a one-hundred-seventy-fourth the Fazekas scale (white matter hyperintensities) in
`lib/fazekas-v349.js`, and a one-hundred-seventy-fifth the Tscherne classification (closed-fracture
soft-tissue injury) in `lib/tscherne-closed-v350.js`, and a one-hundred-seventy-sixth the Goligher
classification (internal hemorrhoids) in `lib/goligher-hemorrhoids-v351.js`, and a
one-hundred-seventy-seventh the Lansky Play-Performance Scale (pediatric functional status) in
`lib/lansky-v352.js`, and a one-hundred-seventy-eighth the Crowe classification (hip dysplasia) in
`lib/crowe-ddh-v353.js`, and a one-hundred-seventy-ninth the Tonnis classification (hip osteoarthritis)
in `lib/tonnis-hip-oa-v354.js`, and a one-hundred-eightieth the Lachman test grade (ACL laxity) in
`lib/lachman-acl-v355.js`, and a one-hundred-eighty-first the CEAP classification (chronic venous
disease) in `lib/ceap-venous-v356.js`, and a one-hundred-eighty-second the NYHA functional
classification (heart failure) in `lib/nyha-class-v357.js`, and a one-hundred-eighty-third the Ramsay
Sedation Scale in `lib/ramsay-sedation-v358.js`, and a one-hundred-eighty-fourth the NPIAP pressure
injury staging in `lib/pressure-injury-stage-v359.js`, and a one-hundred-eighty-fifth the
Keith-Wagener-Barker hypertensive-retinopathy classification in `lib/kwb-retinopathy-v360.js`, and a
one-hundred-eighty-sixth Tanner staging (Sexual Maturity Rating) in `lib/tanner-staging-v361.js`, and a
one-hundred-eighty-seventh the Forrester hemodynamic classification in
`lib/forrester-hemodynamic-v362.js`, and a one-hundred-eighty-eighth the Shaffer gonioscopy angle grade
in `lib/shaffer-angle-v363.js`, and a one-hundred-eighty-ninth the Clinical Activity Score (thyroid eye
disease) in `lib/cas-ted-v364.js`, and a one-hundred-ninetieth the Prague C&M criteria (Barrett
esophagus) in `lib/prague-barrett-v365.js`, and a one-hundred-ninety-first the penetrating-neck-trauma
zones in `lib/neck-zone-v366.js`, and a one-hundred-ninety-second the Penetration-Aspiration Scale in
`lib/pas-swallow-v367.js`, and a one-hundred-ninety-third the Ross classification (pediatric heart
failure) in `lib/ross-hf-peds-v368.js`, and a one-hundred-ninety-fourth the Nohria-Stevenson profiles
(acute heart failure) in `lib/nohria-stevenson-v369.js`, and a one-hundred-ninety-fifth the
Hartofilakidis classification (hip dysplasia) in `lib/hartofilakidis-ddh-v370.js`, and a
one-hundred-ninety-sixth the C-RADS category (CT colonography) in `lib/c-rads-v371.js`, and a
one-hundred-ninety-seventh the CAD-RADS 2.0 category (coronary CTA) in `lib/cad-rads-v372.js`, and a
one-hundred-ninety-eighth the NI-RADS category (head & neck surveillance) in `lib/ni-rads-v373.js`, and a
one-hundred-ninety-ninth the Pauwels classification (femoral neck fracture) in
`lib/pauwels-femoral-neck-v374.js`, and a two-hundredth the Pipkin classification (femoral head fracture)
in `lib/pipkin-femoral-head-v375.js`, and a two-hundred-first the Denis classification (sacral fracture)
in `lib/denis-sacral-v376.js`, and a two-hundred-second the Gartland classification (supracondylar
humerus fracture) in `lib/gartland-supracondylar-v377.js`, and a two-hundred-third the Delbet
classification (pediatric femoral neck fracture) in `lib/delbet-femoral-neck-v378.js`, and a
two-hundred-fourth the Tile classification (pelvic ring injury) in `lib/tile-pelvic-v379.js`, and a
two-hundred-fifth the Young-Burgess classification (pelvic ring injury) in `lib/young-burgess-v380.js`,
and a two-hundred-sixth the Winquist-Hansen classification (femoral shaft fracture) in
`lib/winquist-hansen-v381.js`, and a two-hundred-seventh the Eichenholtz classification (Charcot
neuroarthropathy) in `lib/eichenholtz-charcot-v382.js`, and a two-hundred-eighth the Risser sign (skeletal
maturity) in `lib/risser-sign-v383.js`, and a two-hundred-ninth the Spetzler-Ponce classification
(cerebral AVM) in `lib/spetzler-ponce-v384.js`, and a two-hundred-tenth the Schwab & England ADL scale in
`lib/schwab-england-v385.js`, and a two-hundred-eleventh the Pirani clubfoot severity score in
`lib/pirani-clubfoot-v386.js`, and a two-hundred-twelfth the Dimeglio clubfoot classification in
`lib/dimeglio-clubfoot-v387.js`, and a two-hundred-thirteenth the Brodsky tonsil grading scale in
`lib/brodsky-tonsil-v388.js`, and a two-hundred-fourteenth the Koos grade (vestibular schwannoma) in
`lib/koos-schwannoma-v389.js`, and a two-hundred-fifteenth the Knosp grade (pituitary adenoma) in
`lib/knosp-adenoma-v390.js`, and a two-hundred-sixteenth the Hardy classification (pituitary adenoma) in
`lib/hardy-adenoma-v391.js`, and a two-hundred-seventeenth the Hill classification (GE flap valve) in
`lib/hill-flap-valve-v392.js`, and a two-hundred-eighteenth the Lauren classification (gastric cancer) in
`lib/lauren-gastric-v393.js`, and a two-hundred-nineteenth the Borrmann classification (gastric cancer) in
`lib/borrmann-gastric-v394.js`, and a two-hundred-twentieth the Parks classification (anal fistula) in
`lib/parks-fistula-v395.js`, and a two-hundred-twenty-first the Sievers classification (bicuspid aortic
valve) in `lib/sievers-bav-v396.js`, and a two-hundred-twenty-second the El Khoury classification (aortic
regurgitation) in `lib/el-khoury-ar-v397.js`, and a two-hundred-twenty-third the Carpentier classification
(mitral regurgitation) in `lib/carpentier-mr-v398.js`, and a two-hundred-twenty-fourth the Bismuth-Corlette
classification (perihilar cholangiocarcinoma) in `lib/bismuth-corlette-v399.js`, and a two-hundred-twenty-fifth
the Nyhus classification (groin hernia) in `lib/nyhus-hernia-v400.js`, and a two-hundred-twenty-sixth the
Zargar classification (caustic esophagogastric injury) in `lib/zargar-caustic-v401.js`, and a
two-hundred-twenty-seventh the Lauge-Hansen classification (rotational ankle fracture) in
`lib/lauge-hansen-v402.js`, and a two-hundred-twenty-eighth the Berndt-Harty classification (osteochondral
lesion of the talus) in `lib/berndt-harty-v403.js`, and a two-hundred-twenty-ninth the Regan-Morrey
classification (coronoid process fracture) in `lib/regan-morrey-v404.js`, and a two-hundred-thirtieth the
Savary-Miller classification (reflux esophagitis) in `lib/savary-miller-v405.js`, and a two-hundred-thirty-first
the Le Fort classification (midface fracture) in `lib/le-fort-v406.js`, and a two-hundred-thirty-second the
Steinberg staging (femoral head AVN) in `lib/steinberg-avn-v407.js`, and a two-hundred-thirty-third the
Meyers-McKeever classification (tibial eminence fracture) in `lib/meyers-mckeever-v408.js`, and a
two-hundred-thirty-fourth the Ideberg classification (glenoid fossa fracture) in
`lib/ideberg-glenoid-v409.js`, and a two-hundred-thirty-fifth the Anderson-D'Alonzo classification (odontoid
fracture) in `lib/anderson-dalonzo-v410.js`, and a two-hundred-thirty-sixth the Levine-Edwards
classification (hangman's fracture) in `lib/levine-edwards-v411.js`, and a two-hundred-thirty-seventh the
Myerson classification (Lisfranc injury) in `lib/lisfranc-myerson-v412.js`, and a two-hundred-thirty-eighth
the Seinsheimer classification (subtrochanteric femur fracture) in `lib/seinsheimer-subtroch-v413.js`, and a
two-hundred-thirty-ninth the Mayfield classification (perilunate instability) in
`lib/mayfield-perilunate-v414.js`, and a two-hundred-fortieth the Geissler classification (carpal ligament
injury) in `lib/geissler-carpal-v415.js`, and a two-hundred-forty-first the Russe classification (scaphoid
fracture) in `lib/russe-scaphoid-v416.js`, and a two-hundred-forty-second the Wassel classification (thumb
polydactyly) in `lib/wassel-thumb-v417.js`, and a two-hundred-forty-third the Milch classification (lateral
condyle fracture) in `lib/milch-condyle-v418.js`, and a two-hundred-forty-fourth the Myer-Cotton grade
(subglottic stenosis) in `lib/cotton-myer-v419.js`, a two-hundred-forty-fifth the Friedman tongue
position (OSA staging) in `lib/friedman-tongue-v420.js`, a two-hundred-forty-sixth the SUN anterior
chamber cell grade (uveitis) in `lib/sun-ac-cell-v421.js`, a two-hundred-forty-seventh the SUN anterior
chamber flare grade (uveitis) in `lib/sun-ac-flare-v422.js`, a two-hundred-forty-eighth the Marsh-Oberhuber
classification (celiac histology) in `lib/marsh-oberhuber-v423.js`, a two-hundred-forty-ninth the Bethesda
System (thyroid cytopathology) in `lib/bethesda-thyroid-v424.js`, a two-hundred-fiftieth the vesicoureteral
reflux grade (VCUG) in `lib/vur-grade-v425.js`, a two-hundred-fifty-first the Gell and Coombs
hypersensitivity classification in `lib/gell-coombs-v426.js`, a two-hundred-fifty-second the Vaughan
Williams antiarrhythmic classification in `lib/vaughan-williams-v427.js`, a two-hundred-fifty-third the MRC
muscle-power grade in `lib/mrc-power-v428.js`, a two-hundred-fifty-fourth the Sarnat staging (neonatal
HIE) in `lib/sarnat-hie-v429.js`, a two-hundred-fifty-fifth the Papile grade (germinal matrix / IVH) in
`lib/papile-ivh-v430.js`, a two-hundred-fifty-sixth the modified Bell staging (NEC) in
`lib/bell-nec-v431.js`, a two-hundred-fifty-seventh the Baden-Walker prolapse grade in
`lib/baden-walker-v432.js`, a two-hundred-fifty-eighth the Modic changes (vertebral endplate MRI) in
`lib/modic-changes-v433.js`, a two-hundred-fifty-ninth the Pfirrmann disc degeneration grade in
`lib/pfirrmann-disc-v434.js`, a two-hundred-sixtieth the Van Herick angle grade in
`lib/van-herick-v435.js`, a two-hundred-sixty-first the Biffl grade (blunt cerebrovascular injury) in
`lib/biffl-bcvi-v436.js`, a two-hundred-sixty-second the Goutallier grade (rotator cuff fatty
infiltration) in `lib/goutallier-v437.js`, a two-hundred-sixty-third the Eaton-Littler stage (thumb CMC
arthritis) in `lib/eaton-littler-v438.js`, a two-hundred-sixty-fourth the Hamada grade (cuff tear
arthropathy) in `lib/hamada-v439.js`, a two-hundred-sixty-fifth the Barrow classification
(carotid-cavernous fistula) in `lib/barrow-ccf-v440.js`, a two-hundred-sixty-sixth the Borden
classification (dural AV fistula) in `lib/borden-davf-v441.js`, a two-hundred-sixty-seventh the Zabramski
classification (cerebral cavernous malformation) in `lib/zabramski-v442.js`, a two-hundred-sixty-eighth
the Kadish staging (esthesioneuroblastoma) in `lib/kadish-v443.js`, a two-hundred-sixty-ninth the
McCormick grade (spinal cord function) in `lib/mccormick-v444.js`, a two-hundred-seventieth the Revised
Atlanta severity (acute pancreatitis) in `lib/atlanta-pancreatitis-v445.js`, a two-hundred-seventy-first
the ROP stage (retinopathy of prematurity) in `lib/rop-stage-v446.js`, a two-hundred-seventy-second the
Anderson-Montesano (occipital condyle fracture) in `lib/anderson-montesano-v447.js`, a
two-hundred-seventy-third the Traynelis (atlanto-occipital dislocation) in `lib/traynelis-v448.js`, a
two-hundred-seventy-fourth the Fielding-Hawkins (atlantoaxial rotatory subluxation) in
`lib/fielding-hawkins-v449.js`, a two-hundred-seventy-fifth the Reid classification (bronchiectasis) in
`lib/reid-bronchiectasis-v450.js`, and a two-hundred-seventy-sixth the Sade grade (tympanic membrane
retraction) in `lib/sade-retraction-v451.js`, for 1240 across 356 modules today. <!-- catalog-truth:historical (197 is the count of lib modules adapted, not a catalog tile count) -->
Later waves extend it module by module against the same contract.

## Design

- **Single source of truth.** Compute logic stays in `lib/*.js`; citations,
  examples, and interpretation stay in `lib/meta.js`; the tile's name/group/
  clinical flag stay in `app.js`. An adapter (`mcp/adapters/*.js`) contributes
  only the input schema and two pure mapping functions (`toArgs`,
  `formatResult`). `scripts/check-mcp-catalog.mjs` fails the build if an
  adapter diverges from `UTILITIES` / `META`, if the ledger drifts, or if an
  example stops round-tripping.
- **Isolation.** The subtree imports only `mcp/* -> lib/<pure>`. It never
  imports `app.js`, `views/*`, or any DOM-coupled module. Deleting `mcp/` leaves
  the site's `npm run build`, `npm run lint`, and `npm run test` green.
- **Clinical posture.** Every `describe`/`compute` carries the source's
  interpretation and a disclaimer that the value is a computed quantity, not a
  treat/escalate/prescribe order. The decision stays with the clinician and
  local protocol. The server authors nothing in "Sophie's voice."

## Not in scope

No hosting, no remote/HTTP transport, no auth, no website change, no new tiles,
no AI, no network. See `docs/spec-v183.md` §7.
