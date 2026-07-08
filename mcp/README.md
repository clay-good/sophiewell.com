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

A fixed three-tool surface with dynamic dispatch over the catalog (exposing one
tool per calculator would flood the client's tool list):

| Tool | Input | Returns |
|---|---|---|
| `list_calculators` | `{ group?, specialty?, query? }` | Lightweight rows `{ id, name, group, specialties, summary }` plus a live coverage line. No computation. |
| `describe_calculator` | `{ id }` | The full contract: `inputSchema` (JSON Schema), a worked `example`, `citation` + `citationUrl` + `citationAccessed`, the source interpretation bands, and the clinical-posture disclaimer. |
| `compute_calculator` | `{ id, inputs }` | The deterministic `result` (score, bands, derived values, source note), the citation, and the disclaimer. Invalid or incomplete input returns `{ valid: false, message }` — never a thrown error and never a non-finite number. |

`inputs` are keyed exactly as `describe_calculator` reports them (and exactly as
each calculator's documented example). Numbers may be sent as numbers or numeric
strings; booleans as `true`/`false`; enums by their listed string values.

### Example session

```
list_calculators { "specialty": "hepatology" }
  -> { coverage: "856 of 1109 catalog tiles exposed ...", calculators: [ { id: "meld-xi", ... }, ... ] }

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
APGAR, ABG interpretation, Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, NIHSS), for
856 across 170 modules today. <!-- catalog-truth:historical (170 is the count of lib modules adapted, not a catalog tile count) -->
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
