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
  -> { coverage: "1094 of 1109 catalog tiles exposed ...", calculators: [ { id: "meld-xi", ... }, ... ] }

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
`lib/crs-v305.js`, for
1094 across 210 modules
today. <!-- catalog-truth:historical (197 is the count of lib modules adapted, not a catalog tile count) -->
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
