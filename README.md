<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>774 deterministic healthcare calculators that run entirely in your browser.</strong><br>
  Free forever. No servers, no accounts, no telemetry, no AI, no network call after first paint.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="docs/spec-v29.md">Scope &amp; audience</a> ·
  <a href="https://sophiewell.com/commitments/">8 commitments</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

Deterministic healthcare utilities, free forever, no servers, no accounts.

sophiewell.com is a single-page static website built for the **nurse on
shift** — primarily ICU and acute-care RN (CCRN / PCCN), then ED RN
(CEN), then floor / med-surg RN, then OR / PACU RN, then L&D / NICU RN —
with every relevant tile still served to doctors, pharmacists, RTs,
billers, coders, and EMS providers. It is, in posture, MDCalc with no
ads, no login, no upsell, no cookie banner, no email capture, and no
network call after first paint. Everything runs in the browser. There
is no AI of any kind. The data sources are public, bundled with the
page, and refreshed on a schedule. The site costs nothing to operate
beyond the domain renewal, so it can be free forever. The product
thesis, in one sentence: **MDCalc, but free, login-less, ad-less,
offline-capable, with a catalog tuned to the nurse on shift**
(see [docs/spec-v29.md](docs/spec-v29.md)). The one-line scope test:
a tile must consume at least one user input and produce a computed
output; "searchable lookup of static facts" does not qualify. See
[docs/spec-v10.md](docs/spec-v10.md) for the audience and
dependency-budget commitments and
[docs/spec-v29.md](docs/spec-v29.md) for the nurse-first pivot
and the v29 catalog ledger. At v181 close the catalog is 774
deterministic tiles — every one of them computes from at least
one user input. The catalog reached its present size on two tracks.
**New tiles:** spec-v63 added the operations counterpart to the bedside
surface — a shared regulatory-deadline engine ([lib/deadline.js](lib/deadline.js))
and five calculators (Medicare appeal-level deadlines, claim timely-filing,
the 2021 E/M Medical-Decision-Making level, the prior-authorization decision
clock, and the 60-day overpayment clock); spec-v64 added `calcium-replacement`,
the IV-calcium / elemental-calcium / gluconate↔chloride converter that closes
the one electrolyte the K/Mg/Phos `electrolyte-replacement` ladder omitted; and
spec-v65 added three bedside-physiology calculations a nurse still does on
scratch paper (`o2-cylinder-duration`, `minute-ventilation`, and
`cerebral-perfusion-pressure`, CPP = MAP − ICP). **Zero-new-tile hardening
(spec-v63 Part A, spec-v66 → spec-v76):** correctness fixes that aligned each
printed band to what the code actually computes — `abg` Boston-rules
compensation, the symmetric over-rapid-correction warning in
`acid-base-deficit`, the `ttkg` renal-wasting threshold, the indication-aware
`digoxin` floor, the `sas-riker` light-sedation goal band, and the reachable
`psi` Risk Class I — alongside denial→next-step ops routing, CFR-checklist
document generators, and a run of accessibility / rendering / offline repairs
(44px touch targets, theme-tracked `color-scheme`, a working SPA skip-link, a
complete-shell service-worker precache, and a guarded tool-page discovery
allowlist). Per-wave detail lives in the [CHANGELOG](CHANGELOG.md) and the spec
docs ([spec-v62](docs/spec-v62.md) through [spec-v76](docs/spec-v76.md), with the
offline shell precache finished in [spec-v84](docs/spec-v84.md) — every local
asset `index.html` loads is now precached, guarded so the list cannot drift).
**Advanced clinical calculators (spec-v85 program):** the
[spec-v85](docs/spec-v85.md) charter opens a fourteen-spec program that deepens
the physician-facing critical-care / subspecialty layer one rung above the
bedside score, under a binding doctrine (one-line determinism, no new bundled
dataset, primary-source citations, the output-safety contract) and a CI/CD
maintenance contract (build pipeline, merge gates, Class A/B staleness
machinery). Its first feature spec, [spec-v86](docs/spec-v86.md), ships three
deterministic toxicology decision rules — `serotonin-toxicity` (Hunter
criteria), `salicylate-toxicity` (EXTRIP hemodialysis indication), and
`toxic-alcohol` (ethanol-corrected osmolar gap + AACT fomepizole indication).
[spec-v87](docs/spec-v87.md) follows with three critical-care physiology
calculators in Group E — `hemodynamic-suite` (the PA-catheter cardiac-index /
SVR / PVR resistance suite, PVR reported in both dynes·s·cm⁻⁵ and Wood units per
ESC/ERS 2022), `mechanical-power` (the Gattinoni simplified power of
ventilation with the >17 J/min VILI-risk flag), and `dead-space` (the
Bohr-Enghoff Vd/Vt fraction with the EtCO₂-surrogate caveat).
[spec-v88](docs/spec-v88.md) adds three high-acuity endocrine/oncology
calculators — `dka-hhs` (the ADA hyperglycemic-crisis classification: DKA vs
HHS with mild/moderate/severe DKA grading, plus the computed anion gap and
effective serum osmolality, Group G), `calvert-carboplatin` (the AUC-based
carboplatin dose by the Calvert formula with the FDA estimated-GFR cap at 125
mL/min shown as a visible substitution, Group F), and `tls-cairo-bishop` (the
Cairo-Bishop tumor-lysis-syndrome laboratory/clinical grading with the
25%-change-from-baseline branch and the corrected-calcium criterion, Group G).
[spec-v89](docs/spec-v89.md) closes **Wave 1** of the spec-v85 program with four
subspecialty calculators (all Group G) — `das28` (the DAS28-ESR/DAS28-CRP
rheumatoid-arthritis disease-activity score with the EULAR
remission/low/moderate/high bands, the catalog's first rheumatology tile),
`kings-college` (the King's College Criteria for transplant referral in
acetaminophen-induced acute liver failure, with the pH limb, the three-part
coagulopathy/renal/encephalopathy limb, and the Bernal lactate modification),
`asa-ps` (the ASA Physical Status classification I–VI with the E-modifier rules
enforced), and `surgical-apgar` (the Gawande intraoperative 0–10 outcome score,
distinct from the neonatal Apgar).
[spec-v90](docs/spec-v90.md) opens **Wave 2** with six cardiology / ECG
computations — `ecg-axis` (the mean frontal-plane QRS axis by hexaxial `atan2`
geometry, with the all-isoelectric `(0,0)` input surfaced as "indeterminate
axis" rather than a spurious 0°, Group E), `lvh-criteria` (the Sokolow-Lyon and
Cornell ECG-LVH voltage criteria with the sex-specific Cornell threshold, Group
G), `timi-stemi` (the Morrow 2000 TIMI risk score for STEMI with the 30-day
mortality band, Group G), `duke-treadmill` (the Mark 1987 exercise-test
prognosis with the cited five-year survival, Group E), `cardiac-power-output`
(the Fincke `CPO = MAP×CO/451` watts with the <0.6 W cardiogenic-shock
threshold, Group E), and `aortic-valve-area` (the continuity-equation valve area
with the dimensionless index and the ASE/EACVI 2017 + 2020 ACC/AHA severity
bands, Group E). As the first Wave-2 spec it also authors the spec-v85 §6.3
warn-only monthly `scripts/check-citation-cadence.mjs` job, which annotates (but
never blocks) when a calendar-tracked Class-B citation row is overdue for
re-verification.
[spec-v91](docs/spec-v91.md) continues Wave 2 with five pulmonary-function /
chronic-respiratory computations that fill the gap beside the catalog's *acute*
respiratory surface (`aa-pf-suite`, `rox`, `curb-65`, `smart-cop`) —
`gold-spirometry` (the GOLD spirometric COPD grade off post-bronchodilator
`FEV1/FVC < 0.70` and FEV1 %predicted, Group G), `bode-index` (the Celli 2004
multidimensional COPD prognosis 0–10 with the 4-year survival quartile, Group G),
`gap-ipf` (the Ley 2012 GAP index for idiopathic pulmonary fibrosis with the
cannot-perform-DLCO limb and stage mortality, Group G), `predicted-spirometry`
(the GLI-2012 LMS predicted FEV1/FVC/ratio + lower limit of normal from compiled
coefficient/spline constants, Group E), and `mmrc-dyspnea` (the Bestall 1999
modified MRC dyspnea grade 0–4 that feeds BODE and the GOLD ABE assessment, Group
G).
[spec-v92](docs/spec-v92.md) continues Wave 2 with five nephrology computations
that close the **chronic / procedural** renal gap beside the catalog's existing
filtration / injury / dosing surface (`egfr-suite`, `fena-feurea`, `kdigo-aki`,
`cockcroft-gault`) — `ckd-staging` (the KDIGO 2024 CKD G×A risk heat-map cell
from eGFR and UACR, Group G), `uacr-upcr` (the spot urine albumin/protein-to-
creatinine ratios with the estimated 24-hour excretion and the KDIGO A-stage,
Group E), `ktv-urr` (the hemodialysis adequacy URR + Daugirdas second-generation
single-pool Kt/V against the KDOQI targets, Group E), `mehran-cin` (the Mehran
2004 contrast-induced-nephropathy risk score with the CIN / dialysis bands, Group
G), and `ckd-epi-cystatin` (the 2021 race-free CKD-EPI cystatin-C / combined /
creatinine eGFR, Group E).
The new `pa-lint` tile in spec-v52 consumes
dropped files instead of form fields and produces a
deterministic findings report, the first instance of the
`shape: 'document-linter'` tile shape. Catalog-truth invariants
([docs/spec-v46.md](docs/spec-v46.md)) fail CI on any drift
between `UTILITIES.length` and the public marketing copy.
Sophie's eight posture commitments
([docs/spec-v50.md](docs/spec-v50.md)) — no ads, no login, no
telemetry, no third-party fetch, no AI, no cookies, no paid
tier, MIT-licensed forever — are listed at
[/commitments/](https://sophiewell.com/commitments/) and
enforced by automated checks on every commit. Scoring tiles
expose a collapsed "where does this come from?" derivation block
([docs/spec-v48.md](docs/spec-v48.md)) — 126 carry one today —
with the verbatim source formula, study cohort, limits of
validity, and a live per-input contribution list whose component
sums are cross-checked in CI against the tile's own scoring
function.

## The problem

Bedside math — drug dose, drip rate, anion gap, eGFR adjustment,
sepsis-bundle clock, restraint re-check, Braden re-score —
lives in published clinical literature and institutional protocols.
The nurse on shift, the resident at 3 a.m., the medic in the
ambulance, and the pharmacist verifying a renal dose all reach
for the same calculators and arrive at the same number from the
same inputs. Existing options are paywalled, ad-laden, login-
gated, account-tied, or quietly telemetered — every one of which
adds friction to a 30-second decision at the bedside.

The meta-problem is that the workers who would benefit most from
fast, free, deterministic math are the ones least likely to have
a paid app handy at the moment they need it.

## The solution

Take the public datasets and the published clinical formulas, ship them to
the browser, do the lookups and math locally, and never phone home. A
single static page, a Content Security Policy that forbids outbound network
connections, and a service worker that caches the page for offline use.

## Quick start

Visit https://sophiewell.com. Save the page for offline use if desired. To
run locally, clone the repository and run `npm run dev`, which starts a
zero-dependency static server on http://localhost:4173 that applies the
production security headers. Any static file server will also work.

## How it works and how to use it

Since the spec-v29 nurse-first prune the catalog has grown one
reviewable spec at a time to **774** deterministic calculators
(the full per-version history is in [CHANGELOG.md](CHANGELOG.md)
and `docs/spec-v*.md`; the most recent bedside additions are
summarized in the cheat sheets below). They organize across the
bedside-shift surfaces a nurse, doctor, pharmacist, RT, EMS
provider, biller-coder, or educator actually reaches for. Every
tile takes at least one user input and produces a computed
output; searchable indexes of static facts are explicitly out of
scope (see [docs/spec-v29.md §3](docs/spec-v29.md) and
[docs/spec-v10.md §2.3](docs/spec-v10.md)). Tiles that sit in the
same clinical workflow cross-link: a "Related tools" row —
present across most of the catalog ([spec-v61](docs/spec-v61.md)
§2 A2) — puts the sibling a nurse reaches for next: `wells-pe` →
`perc` / `pesi` / `years-pe`, `cockcroft-gault` → the renal-dosing
tools, one tap away, with every link verified in CI to resolve to
a real tile.

**Clinical math & conversions** covers BMI, BSA suite, MAP /
pulse pressure / shock index, anion gap with delta-delta,
corrected Ca / Na, osmolal gap, A-a gradient and P/F suite,
Winter's formula, eGFR suite (CKD-EPI 2021 / MDRD / Cockcroft-
Gault), FENa / FEUrea, maintenance fluids (4-2-1), QTc suite,
pregnancy dating, pack-years, the universal unit converter,
sodium-correction planner (Adrogue-Madias), free water deficit,
predicted body weight + ARDSnet tidal volume, and RSBI.
**Medication & infusion** covers drip rate, weight-based dose,
concentration-to-rate, pediatric dose bounds, insulin drip,
anticoagulant reversal, opioid MME (CDC 2022), steroid and
benzodiazepine equivalence, antibiotic renal-dose adjustment,
vasopressor dose-to-rate (with VIS / Wernovsky IS), TPN
macronutrient, iron deficit (Ganzoni), and the v29 nursing-
shift additions for insulin correction, electrolyte
replacement ladders, CRRT dose, ECMO titration, and the MTP
ratio tracker.
**Clinical scoring & risk** covers GCS, APGAR, NIHSS / mNIHSS,
Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, TIMI, GRACE, HEART,
PERC, Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 / Child-
Pugh, Ranson / BISAP, Centor / McIsaac, Caprini, Bishop,
Alvarado / PAS, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog,
CIWA-Ar, COWS, ASCVD PCE, PREVENT 2023, Light's criteria,
Mentzer index, SAAG, R-factor liver injury, KDIGO AKI, ICH
Score, Hunt-Hess / WFNS, plus modified Sgarbossa, revised
cardiac risk index, PEWS / NEWS2 / NEWS2-escalation, every
v17-v28 risk-score tile, and the v29 bedside nursing screens
(Braden, Morse, Hendrich II, RASS, BPS, CPOT, ICDSC, CAM,
CAM-ICU, Aldrete / PADSS).
**Clinical criteria & diagnostic bundles** packages NPIAP
pressure-injury staging, Norton / PUSH wound assessment, the
VIP / INS extravasation criteria, ABO / Rh blood-product
compatibility, and the v17-v28 diagnostic bundles.
**Workflow & templates** carries the patient-visit generators
that survive v29 (appeal letter, HIPAA Right of Access, HIPAA
authorization, ROI request, discharge instructions, specialty-
visit questions, the wallet-card generator, and the SBAR
handoff template), plus the v29 nursing-shift workflow timers:
restraint timer, sepsis-bundle clock, code-blue clock, device-
day counter, Bristol / abdominal-girth tracker, and the vent
SBT readiness / ARDSnet PEEP-FiO2 ladder.
**Field medicine** covers NEXUS / Canadian C-Spine, CDC Field
Triage, START / JumpSTART, peds-weight-dose, burn surface area
and fluid resuscitation (Parkland / modified Brooke),
pediatric ETT sizing, naloxone dosing, the EMS documentation
helper, and the AVPU / GCS quick reference.
**Public health & infectious disease** covers tetanus
prophylaxis, rabies PEP, bloodborne pathogen exposure, TB
testing interpretation, and STI screening intervals. **Billing
& coding** is now sparse — the time-based E/M code selector,
the NDC 10 ↔ 11 digit converter, and the HIPAA 60-day breach
clock. Every static index (ICD-10-CM, HCPCS, CPT, NDC, POS,
modifier, revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS,
RxNorm, NDC↔RxNorm) was retired in spec-v29 wave 29-2 §2.1;
use your EHR, CMS, FDA, or NUBC source instead.

The user flow is simple: type what you need into the hero search
("wells PE", "CHA2DS2-VASc", "ICD-10", "magnesium replacement") or
follow one of the static browse links below it, enter input,
read output. The hero consults a hand-curated synonym table
(`data/synonyms.json`, spec-v7 section 3.2) before falling back to
fuzzy matching, and shows a one-line breadcrumb explaining why a
tile is recommended. (The spec-v7 §3.1 patient-artifact dropzone was
retired in the 2026-05-18 clinical-staff-first pivot; the
deterministic classifier under `lib/artifact-*.js` is retained for
possible future reuse on a clinical-input surface, but the home view
no longer wears it.) Every utility opens with its
inputs pre-filled from a worked example so the empty state is never
empty (a "Reset to example" link restores them after editing), and
the References region at the bottom shows the formula citation or
dataset stamp the result came from (spec-v9). Calculator state is
encoded in the URL hash so any view can be bookmarked or shared as
a permalink.

All computation happens in the browser. For the full picture, see
[docs/architecture.md](docs/architecture.md).

#### Tile anatomy: one calculator, four single-sources-of-truth

Every tile is assembled from four files, each owning exactly one concern, so a
fact is typed once and read everywhere. Nothing is duplicated across the runtime,
the SEO build, or the optional MCP surface — the catalog-truth and MCP-catalog
gates fail the build if any of them drift.

```
                 ┌──────────────────────────────────────────────┐
   one tile id ──┤  app.js  UTILITIES[]   name · group · clinical│  what & where
                 └──────────────────────────────────────────────┘
                       │ id                         │ id
                       ▼                            ▼
   ┌───────────────────────────────┐   ┌──────────────────────────────────┐
   │ lib/meta.js  META[id]         │   │ views/group-*.js  RENDERERS[id]   │
   │  citation · citationUrl       │   │  builds the DOM inputs + wires the │
   │  worked example · bands       │   │  live recompute (pure el(), no     │
   │  specialties · disclaimer     │   │  innerHTML)                        │
   └───────────────────────────────┘   └──────────────────────────────────┘
                                                    │  reads inputs via
                                                    ▼
        unitField(label,id,UNITS) ─► unitNum(id) / unitNumOpt(id)
              (°C|°F · cm|in · kg|lb · mg/dL|mmol/L; canonical = default option,
               so the documented example reproduces byte-identically)
                                                    │ canonical-unit value
                                                    ▼
                       ┌────────────────────────────────────┐
                       │ lib/*.js  pure compute fn           │
                       │  routes every divide through        │
                       │  lib/num.js → finite, never NaN     │
                       └────────────────────────────────────┘
                                                    │ result object
                                                    ▼
                          resultRow() → bands → references (citation/stamp)
                                                    │
        ┌───────────────────────────────────────────┴───────────────────────┐
        ▼                                                                     ▼
  state encoded in the URL hash (bookmark / share / deep-link)     fuzz harness +
  static SEO page (build-tool-pages) + optional MCP tool           example-correctness
  (mcp/adapters/*.js) all read the SAME compute + META             e2e assert the same
                                                                    numeric contract
```

The unit-toggle row (`unitField` → `unitNum`) is the seam that lets a US nurse
chart in °F / inches / lb while the compute function still receives canonical
metric: the canonical unit is always the first `<select>` option, so every
`META.example` and every shared hash reproduces a calculation byte-for-byte.

### Bedside-math cheat sheet (spec-v55 additions)

The thirteen Group-E calculators added in spec-v55, with the formula a nurse or
RT would otherwise run on scratch paper. Every denominator is guarded (a bad
input shows a `(…)` fallback, never a non-finite number), and each ships its
primary citation inline on the tile.

| Tile | Formula / output | Reaches for it |
|---|---|---|
| `anc` | WBC × (segs% + bands%) ÷ 100 → ANC + CTCAE grade | neutropenic-precautions / fever-emergency call |
| `retic-index` | retic% × (Hct ÷ 45) ÷ maturation factor → RPI | hypo- vs hyper-proliferative anemia |
| `tsat` | iron ÷ TIBC × pct → saturation + pattern | gating IV iron; absolute vs functional deficiency |
| `cci-platelet` | (Δplt × BSA) ÷ dose → CCI | platelet refractoriness on the transfusion service |
| `ldl-calc` | Friedewald + NIH/Sampson side by side | LDL when TG is high or LDL is low |
| `eag-a1c` | 28.7 × A1c − 46.7 → mg/dL and mmol/L | translating A1c to an average glucose |
| `cao2-do2` | (1.34·Hb·SaO₂) + (0.0031·PaO₂); ×CO×10 | O₂ content and delivery in shock |
| `oxygenation-index` | (FiO₂ · MAP · pct) ÷ PaO₂ → OI / OSI | PALICC-2 pediatric-ARDS severity |
| `driving-pressure` | plateau − PEEP; Vt ÷ ΔP → compliance | lung-protective ≤15 cmH₂O target |
| `ttkg` | (uK÷pK) ÷ (uOsm÷pOsm), with validity guard | hypo-/hyperkalemia renal work-up |
| `urine-anion-gap` | uNa + uK − uCl → sign | non-gap acidosis: GI loss vs RTA |
| `acid-base-deficit` | 0.5·wt·ΔHCO₃; TBW·ΔNa → deficits | planning replacement, with two-way over-rapid-Na warning (ODS up / cerebral edema down) |
| `schwartz-egfr` | 0.413 × height ÷ SCr → eGFR | pediatric renal dosing (ages 1–18) |

### Dosing & infusion cheat sheet (spec-v56 additions)

The thirteen Group-F medication/infusion calculators added in spec-v56. Each is
dosing decision-support, not a prescription, and renders the standing "verify
against institutional protocol and a current reference" notice. Two tiles
**refuse** outside their validity window rather than mislead.

| Tile | Output | Reaches for it |
|---|---|---|
| `heparin-nomogram` | weight-based bolus/rate + Raschke aPTT step | titrating the heparin drip |
| `vanc-auc` | first-order two-level AUC24/MIC vs 400–600 | dosing vancomycin with pharmacy |
| `aminoglycoside` | extended-interval dose + CrCl interval | once-daily gent/tobra/amikacin |
| `acetaminophen-nomogram` | Rumack-Matthew line → NAC or not (4–24 h only) | timed APAP level in the ED |
| `digoxin` | renal/age maintenance + level vs indication target (HF 0.5–0.9; AF rate-control 0.8–2.0 ng/mL) | starting/checking digoxin |
| `local-anesthetic-max` | mg/kg ceiling vs absolute cap → mg + mL | max safe local before LAST |
| `mgso4-preeclampsia` | load + maintenance mL/h, renal-halved default | the MgSO₄ drip on L&D |
| `pca-pump` | lockout-derived hourly max + limit check | programming a PCA safely |
| `sugammadex` | dose by depth of block on actual weight | reversing rocuronium in PACU |
| `ketamine-propofol` | initial dose + mL + re-dose increment | drawing up procedural sedation |
| `peds-fluid-deficit` | 4-2-1 maintenance + deficit schedule | the dehydrated peds admission |
| `peds-resus` | 10–20 mL/kg bolus, cardiac/DKA caution | the PALS fluid bolus |
| `conc-percent` | % ⇄ mg/mL ⇄ ratio | reading a crash-cart label (1:1000 = 1 mg/mL) |

### Screeners & decision-rule cheat sheet (spec-v57 additions)

The fourteen Group-G instruments added in spec-v57. Each is screening / decision
support, not a diagnosis. Two surface a **conditional threshold** so the user
sees why the determination flipped.

| Tile | Output | Reaches for it |
|---|---|---|
| `phq2-gad2` | PHQ-2 / GAD-2 totals, ≥3 positive flag | pre-gate before the full PHQ-9 / GAD-7 |
| `audit-full` | AUDIT 0–40, WHO zones at 8/16/20 | full alcohol-use screen beyond AUDIT-C |
| `dast10` | DAST-10 0–10 severity band | drug-use screen (item 3 reverse-scored) |
| `gds15` | GDS-15 0–15 depression band | depression in older adults (vs PHQ-9) |
| `ottawa-knee` | x-ray indicated vs deferrable | the knee that may not need a film |
| `nexus-chest` | chest imaging indicated vs deferrable | blunt chest trauma, avoiding CT |
| `sfsr` | CHESS high-risk vs low-risk | syncope disposition (7-day outcome) |
| `canadian-syncope` | score −3…+11, 30-day risk band | structured syncope risk |
| `edacs` | EDACS score + ADP low-risk gate | accelerated chest-pain disposition |
| `years-pe` | item count → 500/1000 D-dimer cutoff | PE rule-out without automatic CTPA |
| `feverpain` | 0–5, strep likelihood + antibiotic plan | sore throat antibiotic decision |
| `stone-score` | 0–13 ureteral-stone probability | flank pain, reducing CT |
| `iss-rts` | ISS 0–75 (+ major-trauma flag), RTS | trauma severity scoring |
| `sipa` | shock index vs age-banded cutoff | pediatric trauma triage |

### Neonatal, maternal & ICU cheat sheet (spec-v58 additions)

The twelve neonatal / maternal / pediatric-and-adult-ICU scores added in
<!-- catalog-truth:historical -->
spec-v58, closing the 50-tile expansion begun in v55 (255 → 307). Each is a
published instrument a bedside nurse already assigns by hand. Three apply
**age- or gestational-age-banded cutoffs** automatically and show the active
band; three neonatal scores and `braden-q` state their **direction**
(higher-vs-lower = worse) explicitly so a cross-reading nurse cannot invert it.

| Tile | Output | Reaches for it |
|---|---|---|
| `ballard` | maturity score → GA = 24 + 0.4 × score, ±2 wk | NICU/nursery gestational-age assignment |
| `finnegan` | modified NAS total, ≥8 / ≥12 trend bands | neonatal abstinence rescoring |
| `silverman-andersen` | 0–10, higher = worse | neonatal respiratory severity |
| `downes` | 0–10, mild/moderate/severe | neonatal respiratory distress |
| `bhutani-bilirubin` | Bhutani risk zone + AAP-2022 photo threshold | hour-specific bilirubin / phototherapy gate |
| `qbl-pph` | quantitative blood loss + CMQCC risk tier | L&D obstetric-hemorrhage bundle |
| `pelod2` | 0–33, age-banded MAP/creatinine | pediatric organ-dysfunction |
| `psofa` | 0–24, age-adjusted CV/renal | pediatric SOFA companion to adult |
| `burch-wartofsky` | <25 / 25–44 / ≥45 thyroid-storm bands | endocrine-emergency decision support |
| `ariscat` | low / intermediate / high PPC risk | postoperative pulmonary risk |
| `apache2` | 0–71 + approximate ICU mortality band | ICU severity-of-illness |
| `braden-q` | 7–28, lower = worse, at-risk ≤16 | pediatric pressure-injury risk |

### Medication-safety, electrolyte/fluid & OB/peds cheat sheet (spec-v61 additions)

Twelve bedside computations a nurse otherwise does by hand — the v61 wave
(307 → 319). Each computes an output from input (passes the
[spec-v29](docs/spec-v29.md) §3 one-line test), ships its primary citation
inline with a DOI, and renders an explicit **"estimate / verify per local
protocol and an independent double-check"** note on every dosing/replacement
tile: the order stays with the clinician and the pharmacy.

| Tile | Output | Reaches for it |
|---|---|---|
| `urine-output` | mL/kg/hr + KDIGO oliguria/AKI bands | hourly Foley check |
| `gir` | glucose infusion rate (mg/kg/min), 4–8 target | NICU dextrose titration |
| `ebv-mabl` | estimated blood volume + max allowable blood loss | OR/L&D transfusion threshold |
| `corrected-phenytoin` | albumin-corrected level (Sheiner-Tozer) + ESRD variant | "low" level in hypoalbuminemia |
| `potassium-deficit` | coarse total-body K deficit (mEq) + repletion caveats | hypokalemia repletion planning |
| `magnesium-replacement` | banded MgSO₄ dose by severity | hypomagnesemia repletion |
| `rhig-dose` | RhIG vials from Kleihauer-Betke % (÷30, round, +1) | post-positive-KB L&D |
| `peds-transfusion-volume` | weight-based PRBC volume (mL), 10–15 mL/kg band | neonatal/peds transfusion |
| `iv-osmolarity` | estimated mOsm/L + ~900 peripheral-vs-central flag | PN line-route decision |
| `burn-uop-target` | hourly UOP target (mL/hr) you titrate LR to | burn resuscitation |
| `fluid-balance` | net I&O (mL) + % body weight, >10% overload flag | end-of-shift handoff tally |
| `carb-insulin-bolus` | meal + correction bolus (units), shown separately | carb-counting mealtime dose |

The wave also added **related-tool links** (`META[id].related`, rendered as a
"Related tools" row in the citation block — e.g. `wells-pe` → `perc` / `pesi` /
`years-pe`). The rollout is now complete: a single reviewable `RELATED_BACKFILL`
map (spec-v61 A2) carries the linking across the catalog — **314 curated
sibling clusters**, grouped by clinical family — with every link verified in CI
to resolve to a real tile and each list capped at four siblings so the row never
crowds the result at 320px.
The wave also added a **"Copy link"** affordance next to "Copy all" that copies the
deep link (hash-state already encodes the inputs), so a populated calculation
can be handed to a colleague with no new persistence and no network. The shared
printable template ([lib/print.js](lib/print.js), with its "No data was sent or
stored" footer) now also covers the **SBAR handoff** and **code-blue summary**
tiles (spec-v61 A6), so a nurse can print a structured handoff or a code
timeline straight from the tile.

**Interpretation-band parity (spec-v61 A8).** Every backfilled score now shows a
source-anchored "Per source:" band block under its citation — the verbatim
meaning of the number from the instrument's own paper, not Sophie's phrasing.
The pass raised `META[id].interpretation` coverage from 150 to 196 of the
catalog's scores, covering the recent bedside scores plus classics
(APGAR, qSOFA, MELD,
Ranson, Alvarado, AUDIT-C, ASCVD/PREVENT, KDIGO-AKI, ARISCAT, APACHE II, Braden
Q, and more). The bands are authored as one reviewable merge map in
[lib/meta.js](lib/meta.js) and render through the shared `renderMetaBlock` with
zero per-view wiring; a CI guard ([test/unit/meta-interpretation.test.js](test/unit/meta-interpretation.test.js))
pins every band to `sourceQuoted: true`, a non-empty `sourceCitation`, ≤200
chars, and no Sophie-authored phrasing. A second invariant in the same guard
requires every tile that carries discrete `derivation.bands` (a score with named
result cut-points) to also carry an interpretation block, so the "where the
number comes from" and "what it means per source" displays cannot drift apart;
continuous-mortality scores (`pelod2`, `psofa`) omit discrete bands and stay out
of the rule. The final tile to satisfy this was `pews` (Brighton PEWS), whose
interpretation restates its Monaghan-2005 escalation thresholds.

**Opt-in input persistence (spec-v61 A7).** Tiles with numeric/choice inputs
show a **"Remember my inputs on this device"** toggle in the references block,
**off by default**. When a nurse opts in, that tile's values are written to
`localStorage` ([lib/input-persist.js](lib/input-persist.js)) so reopening it
next shift skips re-entering constants. Only `number`/`range`/`checkbox`/`radio`
inputs and `<select>` values are stored — free-text and `<textarea>` are never
persisted, so a name, allergy, or clinical note cannot reach storage. The two
keys (`sw-remember`, `sw-saved-inputs`) are string literals on the
[storage allowlist](scripts/storage-allowlist.json) enforced by
`check-commitments`; unchecking the toggle erases both. Remembered values fill
fields a deep link did not set and win over the example. Nothing leaves the
device — the CSP still blocks every network egress.

**Unit toggles & chart-ready copy (spec-v61 A4/A3).** The Group E clinical-math
tiles now meet the nurse in her own units. `bmi`, `bsa`, and `cockcroft-gault`
carry a per-field unit `<select>` (weight kg⇄lb, height m/cm⇄in, creatinine
mg/dL⇄µmol/L) driven by the existing [lib/unit-convert.js](lib/unit-convert.js)
converters; each option converts to the canonical unit *before* the formula
runs, so the math is untouched and — because the canonical unit is always the
default — every documented example and deep-link hash reproduces a calculation
byte-identically. The input+select row wraps, so it never forces horizontal
scrolling on the narrowest phones. Alongside, the multi-output tiles build their results as `{label, value, units}`
items and render a **"Copy results"** button that pastes clean
`Label: Value Units` lines via [lib/clipboard.js](lib/clipboard.js)
`formatCopyAll` — a chart-ready paste instead of a scraped `innerText` blob.
The labeled copy covers the Group E math tiles (`bsa`, `anion-gap`,
`corrected-sodium`, `aa-gradient`), the five 2+-numeric-output v61 bedside tiles
(`ebv-mabl`, `peds-transfusion-volume`, `rhig-dose`, `fluid-balance`,
`carb-insulin-bolus`), the six multi-output Group V5 lab / clinical-math tiles
(`sodium-correction`, `free-water-deficit`, `iron-ganzoni`, `pbw-ardsnet`,
`lights`, `corrected-anion-gap`), the three Group F medication / infusion tiles
(`drip-rate`, `tpn-macro`, `insulin-correction`, the latter two folding their
headline total into the copied list as `anion-gap-dd` does), and — through the
same shared `resultRow` helper — the three Group I field-medicine tiles
(`burn-fluid`, `peds-ett`, `naloxone`, where `burn-fluid` folds the Parkland and
Modified-Brooke schedules into one copyable block) and the five Group V7
oxygenation / renal-acid / lipid tiles (`ldl-calc`, `cao2-do2`,
`oxygenation-index`, `driving-pressure`, `acid-base-deficit`, each emitting
two-to-four computed numeric results) — exactly the values a nurse or medic
pastes into a transfusion, I&O, electrolyte-correction, ventilator, pump, TPN,
insulin, burn-resuscitation, airway, lipid, or oxygen-delivery chart, with
on-screen text byte-identical to the prior hand-built list. All twenty-six are
pinned by
[test/integration/unit-toggle.spec.js](test/integration/unit-toggle.spec.js)
(alternate-unit parity, example-prefill parity, the labeled-copy affordance, and
a 320px no-overflow assertion).

The A4 weight toggle then rolled out to the dosing tiles. The helpers were
extracted to [lib/field-units.js](lib/field-units.js) and a **kg⇄lb** toggle
added to every weight-bearing dosing tile in Group F (`weight-dose`,
`conc-rate`, `vasopressor`, `crrt-dose`, `ecmo-titration`) and the twelve v61
bedside tiles (`urine-output`, `gir`, `ebv-mabl`, `potassium-deficit`,
`peds-transfusion-volume`, `burn-uop-target`, `fluid-balance`) — so a US nurse
who weighs a patient in pounds skips the hand-conversion before a weight-based
dose, infusion rate, or hourly urine-output check. The converter feeds the
canonical kg value to both the formula and the `boundsAdvisory()` plausibility
note, so result and advisory match the kg entry exactly; the cross-group
lb-parity test in `unit-toggle.spec.js` pins it. The A1 derivation tail is being
worked down one verified wave at a time (the additive screeners `sirs`, `apfel`,
and `aims65`; then the ED scores `feverpain`, `canadian-syncope`, and
`stone-score`; then `padua`, `epworth`, and `nrs2002`; then the 0-2-per-sign
bedside scores `apgar`, `silverman-andersen`, and `downes`; then the PE-prognosis
scores `pesi` and `spesi` with the pediatric `nigrovic` meningitis score; then the
GI-bleed risk family `gbs`, `rockall`, and `oakland` (the first banded-weight
wave, each band encoded as a `points` callback); then the ICU-prognosis additive
indices `nutric`, `mnutric`, and `mods`; then the specialty point scales
`burch-wartofsky`, `ariscat`, and `braden-q`; then the high-value scores `hacor`,
`vis`, and `charlson`; then the array-scored screeners `audit-full`, `dast10`, and
`gds15` (their reverse-scored items made explicit); then the pediatric/neonatal
bedside scales `nips`, `cries`, and `peds-gcs`; then the age-banded pediatric
organ-dysfunction scores `pelod2` and `psofa`; then `apache2` (the APACHE II
adult-ICU severity score, twelve banded variables); then `mnihss` (the modified
NIHSS stroke scale); then `finnegan` (the modified Finnegan neonatal-abstinence
score) — 112
additive scores now carry a derivation whose component sums are cross-checked in
CI, within the 126 that carry a derivation block in all (the spec-v62 A5
named-formula tiles add a substituted-formula line instead of a component sum)). The A3
labeled copy then extended to the six multi-output Group V5 lab / clinical-math
tiles (wave 2), the three Group F medication / infusion tiles (wave 3), the
three Group I field-medicine tiles (wave 4), and the five Group V7 oxygenation /
renal-acid / lipid tiles (wave 5) above — completing the multi-numeric rollout;
the remaining hand-built lists (single value plus an interpretation line,
unit-conversion / dose-time utilities, and workflow checklists) keep the
universal "Copy all".

### ICU-infusion, med-surg & OB/neonatal cheat sheet (spec-v62 Part B)

Nine bedside computations across two waves, plus the conversion of the catalog's
last two static reference tables into calculators (Part C). Wave 1 shipped seven
unambiguous tiles; wave 2 added the two pinned-constant tiles — `norepi-equiv`
(Kotani 2023 norepinephrine-equivalent factors) and `neo-phototherapy` (AAP-2022
phototherapy + exchange-transfusion curves). This takes the catalog
<!-- catalog-truth:historical -->
to 328 (a net +9 from the prior wave).
Every tile is a pure `lib/clinical-v8.js` function, validated through
[lib/num.js](lib/num.js) (so a zero/non-finite/out-of-range input throws a
caught `TypeError`/`RangeError`, never a `NaN`), fuzz-covered by the spec-v59
object-aware harness, and ships its primary citation inline with a DOI. Every
dosing/reversal tile renders the explicit **"planning estimate, not an order —
verify against local protocol and an independent double-check"** notice.

| Tile | Output | Reaches for it |
|---|---|---|
| `infusion-time-remaining` | time-to-empty (hh:mm) + the inverse rate-to-last-N-hours | "when do I hang the next bag?" |
| `enteral-free-water` | free water in formula (mL/day) + flush-to-goal (mL, per shift) | the "free-water flush q6h" order |
| `apap-24h-max` | 24-hour acetaminophen total vs the selected ceiling, over-flag | hidden combination-product overdose |
| `icu-nutrition-target` | energy (kcal/day) + protein (g/day) target ranges | ASPEN/SCCM feeding target |
| `vte-prophylaxis-dose` | enoxaparin dose + interval, CrCl <30 reduction flagged | VTE prophylaxis/treatment dosing |
| `neonatal-feeding-volume` | total daily + per-feed volume (mL) | NICU/postpartum feed setup |
| `oxytocin-titration` | mU/min ⇄ mL/hr both directions | every L&D titration step |

**Part C — the last two static tables, now calculators.** `peds-dose` went from
a fixed per-kg table to a **weight-driven quick-dose panel** (each drug computed
to actual mg at the entered weight with the per-dose cap applied and flagged),
and `anticoag-reversal` went from an agent table to a **weight/INR-driven
reversal-dose calculator** (4F-PCC Kcentra INR-band dosing with the 100 kg
dosing-weight cap, idarucizumab 5 g, andexanet ANNEXA-4, protamine
1 mg/100 units max 50 mg). Both keep their ids and permalinks, both now pass the
[spec-v29](docs/spec-v29.md) §3 one-line test — and removing the two
`lookup-table` blocks also retired the **last two horizontally-scrolling tables**
in the catalog, so the 320px no-horizontal-scroll sweep now has no `table-scroll`
region left to guard on a clinical tile.

**Part A depth pass — landed in waves on the existing tiles (no count change).**
A1 (serial/trend mode, `lib/trend.js`) is wired onto the early-warning family
(`news2`, `mews`, `pews`), the hemoglobin-drop tiles (`gbs`, `oakland`), and
`sodium-correction`. A2 (the source-anchored "next step" action field,
`META[id].actions`) is seeded on `kdigo-aki`, `ciwa`, and `cows`. A5 (the
**substituted-formula derivation** — the published equation with the user's own
numbers plugged in and the arithmetic carried through) is **complete** across all
nine named formula tiles: `cockcroft-gault`, `corrected-sodium`, `aa-gradient`,
`osmolal-gap`, `winters`, `fena-feurea`, `egfr`, `drip-rate`, and `burn-fluid`.
Each substituted line is guarded at both the author layer (returns `null` on any
missing / non-finite / non-positive input) and the render layer (refuses any
string carrying a `NaN`/`Infinity`/`undefined` token), so a bad input can never
reach the panel. A4 (the **SI⇄conventional lab toggle**, the v61 per-field
`<select>` mechanism) is rolling out wave-by-wave: wave 1 wired glucose, BUN,
calcium, and albumin toggles onto the Group E correction tiles (`corrected-calcium`,
`corrected-sodium`, `corrected-ca-na`, `osmolal-gap`); wave 2 extended the albumin
toggle to the anion-gap and ascites tiles (`anion-gap`, `anion-gap-dd`, `saag`),
preserving the optional-albumin empty-check; wave 3 added a magnesium
(mg/dL ⇄ mmol/L) toggle to `magnesium-replacement`; and **wave 4 (the final
wave) completed the rollout** — bilirubin (mg/dL ⇄ µmol/L) on the hepatic and
neonatal tiles (`meld-childpugh`, `maddrey-lille`, `bhutani-bilirubin`,
`psofa`, `neo-phototherapy`), lactate on `pelod2`, and ionised/total calcium on
the three CRRT citrate fields (`crrt-dose`). The canonical compute unit is
always the default option, so every documented example and deep link stays
byte-identical (the example-correctness e2e sweep proves it). Lactate and the
CRRT calcium fields are **SI-canonical** (mmol/L is the compute unit, so mmol/L
is the default and the conventional mg/dL alternate converts up) — the inverse
layout of the conventional-default analytes. A4 is now complete for every
lab-input field with a real consumer; phosphate has none (its only candidate,
`electrolyte-replacement`, carries a polymorphic level field whose unit follows
the K/Mg/phosphate selector, so a fixed toggle does not fit).

A3 (the **reverse-solve / target mode**) has shipped on both safety-critical
sodium correction tiles: `sodium-correction` and `free-water-deficit` now compute
a **ceiling-capped max-safe rate** — when the requested schedule would move Na
faster than the published ceiling (8 mEq/L/24 h chronic / 10 acute for raising,
10 for lowering), each surfaces the rate that hits *exactly* the ceiling and flags
it, so the reverse-solve never silently displays an over-ceiling infusion rate.
A3 is **closed for the qualifying tiles**: the spec admits a reverse-solve only
where the inverse is single-valued, and the remaining named tiles do not qualify
(`insulin-drip` is an example-only sliding-scale verifier; `heparin-nomogram` is
the Raschke step table, already aPTT-target-seeking; `vasopressor`/`conc-rate`
already carry the dose⇄rate inverse).

With wave 4 the A4 lab-toggle rollout is complete, and with it **spec-v62 Part A
is fully shipped** (A1 trend, A2 action, A3 reverse-solve, A4 lab toggles, A5
substituted derivation). See [docs/spec-v62.md](docs/spec-v62.md).

### Operations depth: deadlines, denial routing & document linting (spec-v63)

The ops surface (billing, coding, regulatory, patient-admin) used to *state* a
rule; it now *computes* the clock the rule sets, *routes* a denial, and
*validates* the document against the rule's required elements. v63 has two parts:
Part B added five ops calculators (above), and Part A is a **zero-tile depth
pass** that deepens the existing ops tiles the same way spec-v62 deepened the
bedside tiles.

**The shared primitive — `lib/deadline.js` (OA1).** Before v63 the catalog could
compute exactly one regulatory deadline (`breach-clock`) and had **no business-day
or federal-holiday math at all**. `deadline()` is pure UTC-midnight arithmetic —
no local-timezone drift — over calendar **or** federal business days:

```
deadline({ anchor, days, basis, now, rollForward })
   anchor (ISO string | Date)                              now (pin "today")
        │  parseIsoStrict — rejects 2026-13-40                  │
        ▼  (calendar)            (business)                     ▼
   addCalendarDaysUtc      addBusinessDaysUtc ── skip Sat/Sun + 5 U.S.C. 6103
        │                        │   holidays (fixed + floating, federal
        │   rollForward?         │   weekend observance, Dec-31 NYE edge)
        ▼                        ▼
   { deadline, daysElapsed, daysRemaining, pastDue, basis, anchor }
```

`breach-clock` was re-pointed onto the engine's date primitives, byte-identical
(regression-pinned). Every Part B deadline tile and the OA2 routing run through
this one audited path.

| Capability | Where | What it does |
|---|---|---|
| **OA2** denial → next-step routing | `lib/coding-v5.js` `DENIAL_ROUTES`; `views/group-v63.js` | 8 plain-language denial categories → meaning, *appealable?*, the next step, and the tile to open next — each line cited (42 CFR 405/424/411, CMS manuals). Appealable denials compute the level-1 redetermination deadline via OA1. **Input-driven decision, not a CARC/RARC index** — no code list ships. |
| **OA3** generator completeness linting | `lib/regulatory.js` `lintGenerator`; `lib/print.js` `renderCompleteness` | Each document generator is checked against its CFR required-element checklist; every element renders present / **MISSING** with its anchor. `hipaa-auth` → 45 CFR 164.508(c); `hipaa-roa` → 164.524; `appeal-letter` → 42 CFR 405.944(b); breach notice → 164.404(c). The v52 `pa-lint` linter pattern, at small scale. |
| **OA4** inline provenance + freshness | `pa-staleness-ledger.json`; `scripts/check-pa-staleness.mjs` | The non-PA ops constants (federal holidays, appeal deadlines, AIC thresholds, timely-filing basis, CMS-0057-F windows, 2021 E/M edition, 60-day overpayment rule) are now staleness-tracked rows (`ruleFamily: "ops-v63"`, empty `rules`) guarded by the same CI gate as the PA ruleset. |
| **OA5** workflow chaining | `lib/meta.js` `RELATED_BACKFILL` | The ops related-tool chain: denial → `appeal-deadline` → `appeal-letter`; PA → `pa-turnaround` → `pa-lint`; breach → `breach-clock` → `overpayment-60day`; `em-mdm` ↔ `em-time`. Every generator already emits paste-ready / printable output with the "No data was sent or stored" footer. |

Design decision: OA2 and OA3 are **decisions and validations, not directories**.
A denial category is an input the user already has (off their EOB); a completeness
finding checks the user's own document. Neither ships anything browsable or
searchable, so neither reopens the [spec-v29](docs/spec-v29.md) §3 code/payer-index
retirement. And every ops output still carries the `regulatory.js` posture — it
surfaces the regulatory **date or level** and cites the rule; it never decides
whether a breach/overpayment occurred, whether an appeal will succeed, or whether
a service is covered.

### Calcium replacement: the salt the K/Mg/Phos ladder omits (spec-v64)

The `electrolyte-replacement` ladder doses potassium, magnesium, and phosphate;
calcium is the one electrolyte where the *form of the salt is itself the error*.
Calcium gluconate 10% and calcium chloride 10% are **not interchangeable
gram-for-gram** — and calcium is given in exactly the moments (hyperkalemia,
symptomatic hypocalcemia, citrate toxicity, CCB overdose) where the wrong salt
or an unnamed "1 g calcium" order is most costly. `calcium-replacement`
(`lib/clinical-v7.js` `calciumReplacement()`) computes the confusion away:

| Per 1 g of salt (10%) | Elemental Ca | mEq | Volume |
|---|---|---|---|
| Calcium **gluconate** | ~93 mg | 4.65 | 10 mL |
| Calcium **chloride** | ~273 mg | 13.6 | 10 mL |

So **1 g calcium chloride ≈ 2.94 g calcium gluconate** for the same elemental
calcium (≈3×). Given a salt + dose, the tile returns the elemental calcium (mg +
mEq), the volume, and the **equivalent dose of the other salt**, plus the
standard adult dose for the indication and the precaution notes (slow IV push on
a monitor; chloride is sclerosing — central line preferred; never in the same
line as bicarbonate or phosphate; caution in digoxin toxicity). Dosing is
anchored to AHA ACLS 2020; elemental content to USP / product labeling. It states
the dose; it does not write the order. See [docs/spec-v64.md](docs/spec-v64.md).

### Bedside physiology a nurse still does on paper (spec-v65)

A render-tree and near-neighbor audit against the live catalog found three
deterministic, source-anchored calculations an ICU/ED/floor nurse performs on a
routine shift that no existing tile computed. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test (input → computed output), is a
pure `lib/clinical-v8.js` function fuzz-covered by the spec-v59 harness, and
renders the explicit **"planning estimate — verify against the device / monitor
and local protocol"** notice. This takes the catalog to 337.

| Tile | Formula | Output | Reaches for it |
|---|---|---|---|
| `o2-cylinder-duration` | usable L = (gauge − residual) × cylinder factor; min = usable ÷ flow | usable O₂ (L), time-to-residual (hh:mm), and the inverse max-flow for a target transport time | "will this tank make it to CT and back?" |
| `minute-ventilation` | V̇E = RR × Vt; V̇A subtracts ~2.2 mL/kg IBW dead space; target rate = RR × PaCO₂/target | minute & alveolar ventilation (L/min) and the RR to reach a target PaCO₂ | every ventilator CO₂ adjustment |
| `cerebral-perfusion-pressure` | CPP = MAP − ICP (MAP from SBP/DBP when not measured) | CPP (mmHg) with the BTF-2017 60–70 band and a negative-CPP critical flag | every neuro-ICU hourly flowsheet |

The three are deliberately distinct from their near-neighbors and cross-linked
to them: `o2-cylinder-duration` is the **gas** analog of the IV-bag
`infusion-time-remaining`; `minute-ventilation` is the **gas-exchange** calc the
mechanics tiles (`driving-pressure`, `pbw-ardsnet`, `rsbi`) do not cover; and
`cerebral-perfusion-pressure` extends `map` (which computes MAP from blood
pressure but never subtracts ICP). Cylinder factors (D 0.16 / E 0.28 / M 1.56 /
G 2.41 / H-K 3.14 L/psi) are physical constants of the cylinder geometry; the
ventilation math is anchored to Marino's *ICU Book*; CPP and its target band to
the Brain Trauma Foundation 2017 guideline (Carney N, *Neurosurgery*
2017;80(1):6-15). A gauge at/below the safe residual flags "swap now" rather
than rendering a negative duration, and a negative CPP (ICP > MAP) is surfaced
with an explicit critical-low flag, never hidden. See
[docs/spec-v65.md](docs/spec-v65.md).

### Cardiology & ECG cheat sheet (spec-v90, Wave 2 of the spec-v85 program)

Six deterministic cardiology / ECG computations that fill confirmed gaps in the
catalog's cardiology surface (it had `qtc-suite`, `sgarbossa`, `map`, and the
spec-v87 hemodynamics, but none of these six). Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/cardio-v90.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
band — none reads a waveform or auto-disposes. This takes the catalog to 385.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `ecg-axis` | mean axis = atan2(net aVF, net lead I); lead I = 0°, aVF = +90° (orthogonal) | axis in degrees + quadrant (normal −30..+90, LAD −30..−90, RAD +90..+180, extreme −90..−180); `(0,0)` → indeterminate, never 0° | every wide-QRS / axis read |
| `lvh-criteria` | Sokolow-Lyon SV1 + max(RV5,RV6) ≥ 35 mm; Cornell SV3 + RaVL > 28 mm (M) / > 20 mm (F) | each voltage sum against its threshold, met/not-met, sex-correct Cornell cutoff | LVH on the 12-lead |
| `timi-stemi` | Morrow weighted 0–14 point sum over nine bedside variables | score + 30-day mortality band (0 → 0.8% … >8 → 35.9%) | STEMI risk at presentation |
| `duke-treadmill` | DTS = exercise time − (5 × ST dev) − (4 × angina index) | score + band (low ≥ +5, moderate −10..+4, high ≤ −11) + cited 5-yr survival (99/95/79%) | post-exercise-test prognosis |
| `cardiac-power-output` | CPO = (MAP × CO) / 451 watts | CPO (W) with the < 0.6 W cardiogenic-shock threshold flagged | the shock companion to `hemodynamic-suite` |
| `aortic-valve-area` | AVA = (π·(LVOT_d/2)² × LVOT_VTI) / AV_VTI | area (cm²) + dimensionless index + severity (mild > 1.5, moderate 1.0–1.5, severe < 1.0); AV_VTI = 0 guarded | continuity-equation AS severity |

The two ill-defined inputs are domain-guarded so no non-finite value reaches the
DOM (spec-v59): `ecg-axis` surfaces the all-isoelectric `(0,0)` complex as an
"indeterminate axis" rather than a spurious 0° or `NaN`, and `aortic-valve-area`
guards division by `AV_VTI = 0`. Five are **Class A** fixed instruments (hexaxial
geometry; the 1949/1985 voltage thresholds; the Morrow 2000 weights; the Mark
1987 coefficients; the constant 451) with no staleness row; `aortic-valve-area`
is **Class B** — its ASE/EACVI 2017 + 2020 ACC/AHA severity cutoffs carry a
[citation-staleness](docs/citation-staleness.md) row and are the first subject of
the new `scripts/check-citation-cadence.mjs` warn-only monthly job. See
[docs/spec-v90.md](docs/spec-v90.md).

### Pulmonary function & chronic respiratory disease cheat sheet (spec-v91, Wave 2 of the spec-v85 program)

Five deterministic pulmonary computations that fill the **chronic** gap beside
the catalog's *acute* respiratory surface (`aa-pf-suite`, `rox`, `curb-65`,
`smart-cop`). These are the PFT-lab and the COPD/ILD-clinic standards: the GOLD
spirometric grade, the BODE COPD prognosis, the GAP index for IPF, the GLI-2012
predicted-spirometry reference, and the mMRC dyspnea scale that feeds the first
two. Each passes the [spec-v29](docs/spec-v29.md) §3 one-line test, is a pure
`lib/pulm-v91.js` function fuzz-covered by the spec-v59 harness, and quotes the
cited source's own grade / band / mortality. This takes the catalog to 390.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `gold-spirometry` | obstruction when post-bronchodilator FEV1/FVC < 0.70; grade off FEV1 %predicted | grade 1 (≥ 80%), 2 (50–79%), 3 (30–49%), 4 (< 30%); no grade without obstruction; ratio entered or computed from volumes (FVC > 0 guard) | spirometric COPD severity |
| `bode-index` | BMI (≤ 21 = 1) + obstruction (FEV1%) + dyspnea (mMRC) + exercise (6MWD), 0–10 | total + per-variable derivation + 4-yr survival quartile (0–2 ~80%, 3–4 ~67%, 5–6 ~57%, 7–10 ~18%) | COPD multidimensional prognosis |
| `gap-ipf` | Gender (M = 1) + Age (> 65 = 2, > 60 = 1) + FVC% + DLCO% (cannot perform = 3) | stage I (0–3), II (4–5), III (6–8) with cited 1/2/3-yr mortality | IPF bedside prognosis |
| `predicted-spirometry` | GLI-2012 LMS: M = exp(a0 + a1·lnH + a2·lnA + ethnicity + spline); LLN = 5th pct | predicted FEV1/FVC/ratio + LLN by age/height/sex/ethnicity; % predicted + above/below-LLN from a measured value | every PFT report read |
| `mmrc-dyspnea` | single integer grade 0–4 (Bestall 1999 descriptors) | grade + descriptor; feeds BODE and the GOLD ABE assessment | standalone dyspnea grade |

Grade inputs are clamped to their published range (`mmrc-dyspnea` and the mMRC
that `bode-index` consumes accept only 0–4; `gap-ipf` treats "cannot perform"
DLCO as a first-class 3-point state, never a blank). `gold-spirometry` and
`predicted-spirometry` guard every division/`ln` domain so a zero/blank input
surfaces "(complete the fields)" rather than a `NaN`/`Infinity`. The GLI-2012
coefficient + spline sets are **compiled module constants** (`lib/gli-2012-data.js`,
spec-v85 §5 — not a `data/` dataset), transcribed from the published GLI lookup
table; the 40-yr/175-cm Caucasian-male predicted FEV1 (4.08 L) / FVC (5.05 L) /
FEV1/FVC (0.81) and their LLNs reproduce the published reference values. Three
tiles are **Class A** fixed instruments (Celli 2004, Ley 2012, Bestall 1999);
`gold-spirometry` (GOLD 2024, annual) and `predicted-spirometry` (GLI-2012,
on-publication) are **Class B** and carry [citation-staleness](docs/citation-staleness.md)
rows read by `scripts/check-citation-cadence.mjs`. See
[docs/spec-v91.md](docs/spec-v91.md).

### Nephrology: CKD staging, proteinuria ratios, dialysis adequacy, contrast-nephropathy risk & cystatin-C eGFR cheat sheet (spec-v92, Wave 2 of the spec-v85 program)

Five deterministic nephrology computations that close the **chronic / procedural**
renal gap beside the catalog's existing filtration / injury / dosing surface
(`egfr-suite`, `fena-feurea`, `kdigo-aki`, `cockcroft-gault`). These are the
nephrology-clinic and dialysis-unit standards: the KDIGO G×A risk heat-map, the
spot albumin/protein ratios, hemodialysis adequacy, the Mehran contrast-risk
score, and the race-free cystatin-C eGFR. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/nephro-v92.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
cell / ratio / target / band / estimate. This takes the catalog to 395.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `ckd-staging` | eGFR → G-stage (G1 ≥ 90 … G5 < 15) × UACR → A-stage (A1 < 30, A2 30–300, A3 > 300 mg/g) | KDIGO heat-map cell with the prognosis colour (green low → red very high); e.g. eGFR 38 + UACR 340 → G3b/A3 → very high | place an eGFR + UACR in the CKD risk grid |
| `uacr-upcr` | ratio (mg/g) = analyte (mg/dL) / urine Cr (mg/dL) × 1000 | UACR/UPCR + estimated 24-h excretion + KDIGO A-stage; urine-Cr = 0 guarded; mg/dL↔mg/L toggle | spot proteinuria off a single specimen |
| `ktv-urr` | URR = (1 − post/pre) × 100%; spKt/V = −ln(R − 0.008·t) + (4 − 3.5·R)·UF/W | URR + single-pool Kt/V against the KDOQI targets (≥ 65%, ≥ 1.2); ln-domain + pre-BUN guards; URR alone on partial input | hemodialysis adequacy each session |
| `mehran-cin` | hypotension 5 + IABP 5 + CHF 5 + age > 75 = 4 + anemia 3 + diabetes 3 + contrast 1/100 mL + eGFR (2/4/6) | total + band (≤ 5 low … ≥ 16 very high) with the cited CIN / dialysis risk | contrast-nephropathy risk pre-procedure |
| `ckd-epi-cystatin` | 2021 race-free CKD-EPI cystatin-C / combined / creatinine equations | eGFRcys, eGFRcr-cys (confirmatory) and eGFRcr side by side; cystatin/creatinine > 0 guarded; eGFRcys alone on a missing creatinine | confirmatory eGFR near a decision threshold |

The two-axis `ckd-staging` is band-mapping over ordinal axes (it accepts the
A-category directly when no numeric UACR is given and never emits an unlabeled
cell), and `uacr-upcr` shares its A-stage cutoffs so the two agree. Every
division (`uacr-upcr` urine creatinine, `ktv-urr` pre-BUN), logarithm (`ktv-urr`
domain `R − 0.008·t > 0`), and power term (`ckd-epi-cystatin` cystatin/creatinine
bases) is domain-guarded so a zero/blank input surfaces a labeled fallback rather
than a `NaN`/`Infinity`. Four tiles are **Class A** fixed instruments (the ratio
math, the Daugirdas Kt/V, the 2004 Mehran weights, the 2021 CKD-EPI coefficients);
`ckd-staging` (KDIGO 2024, on-publication) is **Class B** and carries a
[citation-staleness](docs/citation-staleness.md) row read by
`scripts/check-citation-cadence.mjs`. See [docs/spec-v92.md](docs/spec-v92.md).

### Hepatology & GI disease activity: NAFLD fibrosis, Glasgow-Imrie pancreatitis, Truelove-Witts, Harvey-Bradshaw, Mayo UC & Milan criteria cheat sheet (spec-v93, Wave 2 of the spec-v85 program)

Six deterministic hepatology & GI disease-activity instruments that close the
catalog's **liver/gut** gap beside the existing chronic-liver and pancreatitis
spine (`meld-childpugh`, `fib4`, `apri`, `ranson-bisap`, `maddrey-lille`). These
are the disease-*activity* and fibrosis instruments a hepatology and GI clinic
score constantly: the NAFLD-specific non-invasive fibrosis estimate, the parallel
UK/European pancreatitis severity score, the two ulcerative-colitis activity
indices, the Crohn's index, and the HCC transplant-eligibility criterion. Each
passes the [spec-v29](docs/spec-v29.md) §3 one-line test, is a pure
`lib/hepgi-v93.js` function fuzz-covered by the spec-v59 harness, and quotes the
cited source's own band / class / index / criterion. This takes the catalog to 401.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `nafld-fibrosis` | NFS = −1.675 + 0.037·age + 0.094·BMI + 1.13·(IFG/DM) − 0.013·platelets − 0.66·albumin + 0.99·(AST/ALT) | score + band: < −1.455 excludes advanced fibrosis, > 0.676 indicates it, between is indeterminate; ALT = 0 guarded | NAFLD-specific fibrosis triage beside FIB-4/APRI |
| `glasgow-imrie` | PANCREAS at 48 h, 1 point each (PaO₂, age, WBC, Ca, urea, LDH, albumin, glucose) | total 0–8, severe ≥ 3; blank item is "not assessed", and the count of items scored is shown | the UK/European alternative to Ranson/BISAP |
| `truelove-witts` | ≥ 6 bloody stools/day plus ≥ 1 systemic criterion (temp, HR, Hgb, ESR) | mild / moderate / severe, naming which systemic criteria are met | acute UC severity at the admit decision |
| `harvey-bradshaw` | wellbeing + pain + liquid stools/day + abdominal mass + complications | total HBI, bands: remission < 5, mild 5–7, moderate 8–16, severe > 16 | Crohn's disease activity in clinic |
| `mayo-uc` | full Mayo (0–12) = stool + bleeding + PGA + endoscopy; partial Mayo (0–9) omits endoscopy | banded score with the form labeled, so a partial score is never read against full-score bands | UC activity in trials and follow-up |
| `milan-criteria` | single tumor ≤ 5 cm OR ≤ 3 nodules each ≤ 3 cm, AND no macrovascular invasion AND no extrahepatic spread | within / exceeds, naming the failing limb | HCC transplant-eligibility screen beside MELD |

The one guarded domain is `nafld-fibrosis`'s AST/ALT division — a blank/zero ALT
surfaces a labeled fallback rather than a `NaN`/`Infinity` term; the other five
are point-table or decision logic. `glasgow-imrie` never lets a partial 48-hour
panel masquerade as a complete low score, `truelove-witts` reports a near-miss as
the band it actually falls in, `mayo-uc` keys the partial-vs-full fallback on the
endoscopy subscore, and `milan-criteria` guards a zero count / missing size. All
six are **Class A** fixed published derivations (Angulo 2007, Blamey/Imrie 1984,
Truelove & Witts 1955, Harvey-Bradshaw 1980, Schroeder 1987, Mazzaferro 1996), so
**none carries a [citation-staleness](docs/citation-staleness.md) row** — their
citations name journals and authors, not a recurring guideline issuer. See
[docs/spec-v93.md](docs/spec-v93.md).

### Hematology & oncology prognosis: HScore, IPSS-R, FLIPI/IPI, MASCC & Sokal/ELTS cheat sheet (spec-v94, Wave 2 of the spec-v85 program)

Five deterministic heme/onc prognostic scores that close the catalog's
**malignancy-prognosis** gap beside the existing heme bedside cluster (`anc`,
`khorana`, `four-ts`, `isth-dic`, `tls-cairo-bishop`). These are the scores an
oncologist or hematologist computes to stratify a new diagnosis and set the
survival expectation: the weighted diagnostic score for reactive HLH, the MDS
prognosis index, the two lymphoma five-factor indices, the febrile-neutropenia
disposition index, and the two at-diagnosis CML risk formulas. Each passes the
[spec-v29](docs/spec-v29.md) §3 one-line test, is a pure `lib/hemonc-v94.js`
function fuzz-covered by the spec-v59 harness, and quotes the cited source's own
band / category / index. This takes the catalog to 406.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `hscore-hlh` | nine weighted items (max 337): immunosuppression, temperature, organomegaly, cytopenia lineages, ferritin, triglyceride, fibrinogen, AST, marrow hemophagocytosis | HScore + HLH probability from the published curve; ≥ 169 best discriminates (Se 93%, Sp 86%) | reactive HLH/MAS diagnosis |
| `ipss-r-mds` | cytogenetic group + marrow blast % + Hgb + platelets + ANC, weighted 0–10 | category very low → very high with the cited median survival and time to 25% AML evolution | MDS prognosis at diagnosis |
| `flipi` | FLIPI: age > 60, stage III/IV, Hgb < 12, > 4 nodal areas, LDH↑. IPI: age > 60, stage III/IV, ECOG ≥ 2, LDH↑, > 1 extranodal site | FLIPI 0–5 (low/int/high) + IPI 0–5 (low/low-int/high-int/high), each with cited survival | follicular & aggressive lymphoma risk |
| `mascc` | burden 5/3/0 + no hypotension 5 + no COPD 4 + solid/no fungal 4 + no dehydration 3 + outpatient 3 + age < 60 2 (max 26) | total + LOW risk ≥ 21 (outpatient/oral candidate); reports the index only | febrile-neutropenia disposition |
| `sokal-cml` | Sokal RR = exp[0.0116·(age−43.4) + 0.0345·(spleen−7.51) + 0.188·((plt/700)²−0.563) + 0.0887·(blasts−2.10)]; ELTS = 0.0025·(age/10)³ + 0.0615·spleen + 0.1052·blasts + 0.4104·(plt/1000)^−0.5 | Sokal banded < 0.8 / 0.8–1.2 / > 1.2 and ELTS banded ≤ 1.5680 / ≤ 2.2185 / > | CML risk at diagnosis |

The load-bearing guarded domains are in `sokal-cml`: the ELTS `(platelets/1000)^−0.5`
term divides by the platelet count (a zero/negative platelet surfaces a labeled
fallback), and the Sokal `exp()` overflows to `Infinity` for an extreme age/platelet
input — surfaced as a finite null, never an `Infinity` term. The other four are
point-table logic; `mascc` reports the index only, not the admission decision, and
`ipss-r-mds` ships the clinical/cytogenetic IPSS-R, not the molecular IPSS-M. All
five are **Class A** fixed published derivations (Fardet 2014, Greenberg 2012,
Solal-Céligny 2004 / IPI 1993, Klastersky 2000, Sokal 1984 / Pfirrmann 2016), so
**none carries a [citation-staleness](docs/citation-staleness.md) row**. See
[docs/spec-v94.md](docs/spec-v94.md).

### Neurology outcome & grading: modified Rankin, GOS-E, Hoehn-Yahr, Spetzler-Martin, House-Brackmann & MIDAS cheat sheet (spec-v95, Wave 2 of the spec-v85 program)

The catalog's neurology surface was **acute-onset, not longitudinal**: a
clinician could compute the NIHSS at presentation, the ICH 30-day mortality risk,
the SAH grade, the coma score, and the post-TIA stroke risk — but nothing for the
*next visit*. These six fill that gap: the stroke-trial functional-outcome
endpoint, the TBI outcome at six months, the Parkinson stage at clinic, the AVM
surgical-risk grade, the facial-nerve recovery grade, and the migraine-disability
band. They are ordinal selectors and bounded-integer sums (no division, root, or
log except none at all), pure `lib/neuro-v95.js` functions fuzz-covered by the
spec-v59 harness, each quoting the cited source's own descriptor and band.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `mrs` | single 7-point ordinal grade 0 (no symptoms) → 6 (dead) | descriptor + **good outcome (0–2)** vs poor outcome (3–6) dichotomy | the stroke-trial functional-outcome endpoint |
| `gose` | 8-category structured-interview TBI outcome 1–8 | descriptor + **legacy GOS 1–5 mapping** (3/4 → severe, 5/6 → moderate, 7/8 → good recovery) | TBI outcome at follow-up |
| `hoehn-yahr` | original stages 1–5; modified scale adds 0, 1.5, 2.5 half-steps | stage descriptor + which scale variant (original vs modified) | Parkinson stage at the movement-disorders clinic |
| `spetzler-martin` | size (1–3) + eloquence (0–1) + deep venous (0–1) = grade I–V; supplemented adds age (1–3) + unruptured (0–1) + diffuse (0–1) | grade I–V with surgical-risk band + supplemented Lawton-Young total (2–10) and the component derivation | AVM surgical-risk grade before operating |
| `house-brackmann` | single 6-grade selector I (normal) → VI (total paralysis) | per-grade gross / at-rest / motion descriptor | facial-nerve function after Bell's palsy / resection |
| `midas` | sum of five prior-3-month disability questions | grade I (0–5) / II (6–10) / III (11–20) / IV (≥ 21); ancillary frequency/intensity reported, not scored | migraine disability in a headache clinic |

`mrs`, `gose`, `hoehn-yahr`, and `house-brackmann` are arithmetic-free ordinal
selectors — an out-of-range or blank selection surfaces a labeled `valid:false`
fallback, never a wrong band; the GOS-E↔GOS map is validated both directions.
`spetzler-martin` clamps the core grade to 1–5 and the supplemented total to 2–10
by construction and surfaces the derivation; `midas` coerces blanks to 0, clamps
each day-count to the 92-day window, and excludes the ancillary items from the
sum. All six are **Class A** fixed ordinal definitions (van Swieten 1988, Wilson
1998, Hoehn-Yahr 1967, Spetzler-Martin 1986 / Lawton-Young 2010, House-Brackmann
1985, Stewart 2001), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. See
[docs/spec-v95.md](docs/spec-v95.md).

### Psychiatry: the clinician-rated severity scales one rung above the screeners (spec-v96, +6 → 418)

The catalog already carried the brief, validated **self-report screeners** a nurse
or primary-care clinician hands a patient: `phq9` and `gad7`, `cssrs` for suicide
risk, `gds15`, `epds`, and `auditc`. What it had **no** tile for is the layer
above the screen — the **clinician-rated rating scales** that *measure* severity
and track change on treatment. A `phq9` is what the patient says; the HAM-D is
what the clinician rates. [spec-v96](docs/spec-v96.md) ships six, all Group G,
pure `lib/psych-v96.js` functions fuzz-covered by the spec-v59 harness.

| id | Formula / rule | Output | Reaches for it |
|---|---|---|---|
| `hamd` | 17 clinician-rated items, mixed anchors (items 1–3, 7–11, 15: 0–4; 4–6, 12–14, 16–17: 0–2) | total 0–52 + band (none 0–7 / mild 8–16 / moderate 17–23 / severe ≥ 24) | rating depression severity at intake and at week 6 |
| `hama` | 14 items, each 0–4 | total 0–56 + band (mild ≤ 17 / mild-mod 18–24 / mod-severe 25–30 / severe ≥ 31) | the clinician-rated anxiety standard beside `gad7` |
| `madrs` | 10 items, each 0–6 (sensitive to change) | total 0–60 + band (normal 0–6 / mild 7–19 / moderate 20–34 / severe ≥ 35) | deciding whether an antidepressant is working |
| `mdq` | three-gate boolean: ≥ 7 of 13 symptoms YES **and** co-occurrence **and** moderate/serious impairment | positive/negative screen, **naming the failing gate** on a near-miss | bipolar-spectrum screen the catalog was missing |
| `ybocs` | 10 items, each 0–4 (1–5 obsessions, 6–10 compulsions) | total 0–40 + subtotals + band (subclinical 0–7 … extreme 32–40) | the OCD severity standard, intake and follow-up |
| `pcl5` | 20 items, each 0–4, DSM-5 clusters B/C/D/E | total 0–80, provisional screen framed as the **source's range (≥ 31–33)**, B/C/D/E tallies (item ≥ 2) | patient-rated PTSD severity + provisional screen |

The summed scales (`hamd`/`hama`/`madrs`/`ybocs`/`pcl5`) **refuse a band from a
partially-completed instrument** (spec-v57): a blank item renders "(complete all N
items)" and no band — an unanswered item is not a zero — and an out-of-range item
yields a labeled `valid:false` rather than a silently-wrong sum. `mdq` is a fixed
three-gate rule, never positive on the symptom count alone, and the `pcl5` cutoff
is quoted as the published **range**, not a single hard threshold the catalog
invents. All six are **Class A** (fixed published item weights and author-defined
bands: Hamilton 1959/1960, Montgomery-Åsberg 1979, Hirschfeld 2000, Goodman 1989,
Blevins 2015), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. The copyrighted/licensed
instruments (MoCA, SLUMS, BDI-II) are **excluded** for licensing. See
[docs/spec-v96.md](docs/spec-v96.md).

### Perioperative risk: the probability and the score, one rung above the screen (spec-v97, +5 → 423)

The catalog's pre-op surface was strong on the **screening indices** a clinician
runs in clinic — `rcri` (a Lee *class*), `ariscat` (pulmonary-complication risk),
`lemon` (a difficult-airway *screen*), `apfel` (PONV), plus the spec-v89 `asa-ps`
and `surgical-apgar`. What it lacked is the layer above: the **published
regression equations** that return an actual *predicted probability* rather than a
risk class, and the **validated weighted indices** an anesthesiologist reaches for
on a high-stakes case. [spec-v97](docs/spec-v97.md) ships five, all Group G, pure
`lib/periop-v97.js` functions fuzz-covered by the spec-v59 harness.

| id | Shape | Formula / rule | Output | Companion to |
|---|---|---|---|---|
| `gupta-mica` | logistic probability | `risk = 1/(1+e^−x)`, `x = −5.25 + 0.02·age + ASA + functional + creatinine + procedure` (Circulation 2011) | predicted % MI / cardiac arrest + the linear-predictor derivation | the `rcri` Lee *class* |
| `gupta-respiratory-failure` | logistic probability | `x = −1.7397 + ASA + sepsis + functional + emergency + procedure` (Chest 2011); endpoint = vent > 48 h or reintubation | predicted % respiratory failure + derivation | `ariscat` |
| `arozullah-pneumonia` | weighted index → class | sum of fixed point weights; BUN is **U-shaped** (low *and* high add points) | total → class 1–5 with the cited pneumonia rate (0.2% … 15.3%) | `ariscat` |
| `el-ganzouri` | weighted index → threshold | 7 airway factors, each 0/1/2 (mouth opening & prognathism cap at 1) | total 0–12, **≥ 4** difficult-laryngoscopy flag | the `lemon` screen |
| `pospom` | point score → mortality | age band + 15 comorbidities + procedure category | total → published predicted in-hospital mortality (SDC 3, verbatim) | `rcri`, `asa-ps`, `surgical-apgar` |

Two design points keep these honest. **The Gupta logistic link is
overflow-guarded**: the linear predictor `x` is clamped to `[−40, 40]` before
`e^−x`, so even a fuzzed `1e9` age returns a finite probability in `[0, 100]`,
never `NaN`/`Infinity` — and every categorical input is validated against its
fixed enum (an out-of-enum value surfaces `valid:false`, never a silent `NaN`).
**The point tables are transcribed, not approximated**: the Gupta coefficients
were cross-checked against two independent reproductions of the source models, and
the entire POSPOM age / 15-comorbidity / 24-procedure point system *and* its
points→mortality lookup were transcribed verbatim from the paper's Supplemental
Digital Content 3 and spot-verified against the source. All five are **Class A**
(fixed regression coefficients / published point tables: Gupta 2011 ×2, Arozullah
2001, el-Ganzouri 1996, Le Manach 2016), so **none carries a
[citation-staleness](docs/citation-staleness.md) row**. The proprietary ACS-NSQIP
universal Surgical Risk Calculator is **excluded** — it is a hosted model, not a
fixed published equation. See [docs/spec-v97.md](docs/spec-v97.md).

### Pediatrics: the four standard rules the deep neonatal surface still lacked (spec-v98, +4 → 427)

The catalog's pediatric surface was already broad — Group N carries the neonatal
and procedural tiles (`ballard`, `finnegan`, `bhutani-bilirubin`, `downes`,
`neo-phototherapy`, `pecarn-head`, `pecarn-cspine`, `pecarn-iai`), and Group G the
pediatric clinical scores (`pews`, `peds-gcs`, `alvarado-pas`, `nigrovic`, the
febrile-infant rules, `westley`, `pram-asthma`, `pelod2`, `psofa`). A full-catalog
sweep (the first draft proposed five tiles that turned out **already shipped**)
left exactly four genuinely-absent standard instruments. [spec-v98](docs/spec-v98.md)
ships them, all Group G, pure `lib/peds-v98.js` functions fuzz-covered by the
spec-v59 harness.

| id | Shape | Rule | Output | Companion to |
|---|---|---|---|---|
| `kawasaki-criteria` | criteria + algorithm | classic = fever ≥ 5 d + ≥ 4 of 5 principal features; the AHA **incomplete-KD** algorithm gates on CRP/ESR then ≥ 3 supplementary lab criteria or a positive echo (Circulation 2017) | classic / incomplete / not-met, naming the features met | `pews` |
| `kocher-criteria` | 4 predictors → probability | non-weight-bearing, temp > 38.5 °C, ESR > 40, WBC > 12,000 (J Bone Joint Surg Am 1999) | count 0–4 → predicted septic-arthritis probability (< 0.2% … 99.6%) | `pews` |
| `pim3` | logistic probability | the fixed Straney 2013 equation (SBP linear **and** squared term, pupils, FiO₂·PaO₂, base excess, ventilation, recovery, diagnosis risk) | predicted % death + the logit derivation, overflow-guarded | `pelod2`, `psofa` |
| `catch-head` | high/medium-risk factors | any high-risk (GCS < 15 at 2 h, open/depressed fracture, worsening headache, irritability) or medium-risk (basal-fracture signs, boggy hematoma, dangerous mechanism) factor (CMAJ 2010) | CT indicated / may be deferred, naming the factor that fired | `pecarn-head` (the alternative rule) |

`pim3` uses the **published Straney 2013 coefficients — not the PIM3-anz13 registry
recalibration** that also circulates — cross-verified against two independent
reproductions; its logistic is clamped before `e^−x` so a fuzzed `1e9` input still
returns a finite probability in `[0, 100]`. `kawasaki-criteria` is **Class B** (the
AHA statement is revisable → a [citation-staleness](docs/citation-staleness.md)
row); the other three are **Class A**. No growth-percentile chart tile (a dataset,
out per [spec-v29](docs/spec-v29.md) §3); no auto-CT / auto-aspiration order.
See [docs/spec-v98.md](docs/spec-v98.md).

### ID, critical care & burns: closing the spec-v85 program (spec-v99, +5 → 432)

The catalog had the acute-infection and critical-care *triage* tools (`curb-65`,
`sirs`, `qsofa-sofa`, `smart-cop`, `apache2`) and the burn-*resuscitation*
calculator (`burn-fluid`, which *takes* %TBSA as an input), but five standard
ID/critical-care/burns instruments were absent. [spec-v99](docs/spec-v99.md) ships
them — the **tenth and final feature spec of Wave 2** — all Group G, pure
`lib/idcrit-v99.js` functions fuzz-covered by the spec-v59 harness, **closing the
spec-v85 Advanced Clinical Calculators program at 432 tiles (+66 across the ten <!-- catalog-truth:historical -->
feature specs v86 through v99).**

| id | Shape | Rule | Output | Companion to |
|---|---|---|---|---|
| `duke-endocarditis` | major/minor criteria | definite = 2 major / 1 major + 3 minor / 5 minor; possible = 1 major + 1 minor / 3 minor (2023 Duke-ISCVID) | definite / possible / rejected, with the counts | `qsofa-sofa` |
| `pitt-bacteremia` | weighted score | temperature band + hypotension (2) + ventilation (2) + cardiac arrest (4) + mental status (0/1/2/4) (Ann Intern Med 2004) | total 0–14, **≥ 4** high-mortality-risk | `qsofa-sofa`, `apache2` |
| `saps-ii` | 17-variable score → mortality | banded points → `logit = −7.7631 + 0.0737·SAPS + 0.9971·ln(SAPS+1)` (JAMA 1993) | SAPS II points + predicted hospital mortality % | `apache2` |
| `lund-browder` | age-adjusted area sum | per-region burned fraction × the age-adjusted %TBSA; adult Rule of Nines computed independently | %TBSA + the Rule-of-Nines cross-check | `burn-fluid` (consumes the %TBSA) |
| `refeeding-risk` | NICE major/minor criteria | high risk if 1 major (BMI < 16, loss > 15%, > 10 d negligible intake, low K/Mg/PO₄) or 2 minor (CG32) | high risk / not high risk, naming the criteria | `icu-nutrition-target` |

Two correctness anchors. **`saps-ii` is transcribed and calibration-checked**: the
17-variable point bands were cross-verified against MDCalc and ClinCalc (a corrupted
"+1" urine-output band in one reproduction was rejected in favor of the correct
"+4"), and the worked 64-point case → **75.3%** matches the published ClinCalc
calibration; the mortality logistic and `ln(SAPS+1)` are domain-guarded.
**`lund-browder` sums to exactly 100% at every age band** (cross-verified against
the Joint Trauma System adult/pediatric charts); region fractions clamp to `[0, 1]`
and a > 100% total is **flagged, not silently capped**. `duke-endocarditis` (2023
Duke-ISCVID) and `refeeding-risk` (NICE CG32) are **Class B** with
[citation-staleness](docs/citation-staleness.md) rows; the other three are
**Class A**. See [docs/spec-v99.md](docs/spec-v99.md).

### Long-Term Care & Geriatric Assessment program: infection surveillance & antimicrobial stewardship (spec-v172, v181, +2 → 774)

[spec-v181](docs/spec-v181.md) closes cluster **§3.9** of the LTC-GA program with
the tight, high-value pair a nursing home's CMS-mandated infection-prevention-and-control
program (IPCP) and antibiotic-stewardship program (ASP) run on:

- **`mcgeer-criteria`** — the **Revised McGeer** surveillance definitions
  (Stone 2012). Pick the suspected site, check the constitutional + site-specific
  findings → **MEETS / DOES NOT MEET** the surveillance definition, naming the
  satisfied criteria and the blocking gap. Ships the cross-verified syndromes:
  UTI (with / without catheter), respiratory (common cold/pharyngitis,
  influenza-like illness, pneumonia, lower-RTI), skin & soft tissue (cellulitis/
  wound, conjunctivitis), and gastroenteritis. A **surveillance** definition for
  tracking and reporting — *not a diagnosis and not a treatment trigger*.
- **`loeb-minimum-criteria`** — the **Loeb** minimum criteria for *initiating*
  antibiotics (2001). Pick the site → minimum criteria **MET / NOT MET** across
  UTI (with / without catheter), lower respiratory (all 5 Loeb paths), skin &
  soft tissue, and fever-of-unknown-source. **Stewardship decision support** — it
  neither orders nor withholds antibiotics and names no agent, dose, route, or
  duration; the prescriber and local protocol decide.

Both are **categorical, site-branched criteria-logic determinations** (no numeric
score, no numeric leak — fuzzed for the empty/partial-selection and
false-positive paths). Every criterion, body-site definition, temperature
threshold, and boolean rule was re-fetched and cross-verified **verbatim** against
≥ 2 independent sources ([spec-v97](docs/spec-v97.md)): the Stone 2012 primary
paper plus the Missouri DHSS and Minnesota DOH field tools (McGeer), and the MN
DOH card plus MO DHSS chart (Loeb). Both are **Class A** — the journal citations
name no `ISSUER_PATTERN` acronym (SHEA is not in the pattern), so no
[citation-staleness](docs/citation-staleness.md) row. The Stone 2012 systemic
primary-bloodstream / unexplained-febrile definitions and the
rash-plus-provider-diagnosis dermatologic sub-syndromes are deferred on sourcing /
computability grounds. New `lib/ltcga-v181.js` + `views/group-v181.js` (`RV181`).
See [docs/spec-v181.md](docs/spec-v181.md).

### Long-Term Care & Geriatric Assessment program: cognition & dementia staging (spec-v172, v173, +3 → 740)

[spec-v172](docs/spec-v172.md) opens the **fifth-pass** program — the
nursing-home / skilled-nursing / hospice surface the acute-care passes never
indexed (the MDS 3.0, interRAI, and dementia-staging instrument families).
[spec-v173](docs/spec-v173.md) is its first feature spec; it ships the **three
cognition / dementia-staging tiles whose exact item-level scoring could be
re-fetched and cross-verified against ≥ 2 independent sources** (spec-v97), and
**defers the other five** of the eight proposed until their scoring is
verbatim-verifiable — the same safety doctrine that defers a data-sourced tile
when the source can't be fetched.

| tile | source (cross-verified) | scoring | status |
|---|---|---|---|
| `bims` | CMS MDS 3.0 Section C form (verbatim) + Saliba *JAMDA* 2012 | summary 0–15; 13–15 intact, 8–12 moderate, 0–7 severe | **shipped** |
| `ad8` | Galvin *Neurology* 2005 + WashU Knight ADRC | sum 0–8; ≥ 2 suggests impairment | **shipped** |
| `cdr-sob` | Morris *Neurology* 1993 (boxes) + O'Bryant *Arch Neurol* 2008 (staging) + WashU CDR rules | sum 0–18; O'Bryant global-CDR bands | **shipped** |
| `iqcode-short` | Jorm *Psychol Med* 1994 | mean of 16 informant items | deferred — 16 item texts to be sourced verbatim |
| `gpcog` | Brodaty *JAGS* 2002 | two-stage patient + informant | deferred — exact point allocation / threshold |
| `mds-cps` | Morris *J Gerontol* 1994 | 0–6 decision tree | deferred — branch boundaries |
| `global-deterioration-scale` | Reisberg *AJP* 1982 | stage 1–7 | deferred — feature→stage logic |
| `fast-dementia` | Reisberg *Psychopharmacol Bull* 1988 | stage 1–7f | deferred — substage wording |

All three shipped tiles are Group G, Class A, trip no `ISSUER_PATTERN` (CMS/MDS
method and journal issuers are not in it), and carry ≥ 3 boundary worked examples
with band-flips (BIMS 7→8, AD8 1→2, CDR-SOB 4.0→4.5 and 9.0→9.5). The compute
lives in `lib/ltcga-v173.js` (fuzzed, zero non-finite leaks); the deferrals are
recorded in [spec-v173](docs/spec-v173.md) and the parity ledger.

### Long-Term Care & Geriatric Assessment program: continence, caregiver strain & advanced wound (spec-v172, v182, +5 → 772; Waterlow deferred)

[spec-v182](docs/spec-v182.md) closes the implemented portion of the LTC-GA
program. It completes three high-traffic nursing-home surfaces the acute-care
passes never indexed — continence severity, caregiver strain, and advanced wound
assessment — shipping **5 of 6**:

| tile | source | scoring | group |
|---|---|---|---|
| `sandvik-incontinence` | Sandvik 1993/2000 | frequency × amount → 1–12 | E |
| `iciq-ui-sf` | Avery *Neurourol Urodyn* 2004 | 3 items → 0–21 | G |
| `modified-caregiver-strain-index` | Thornton & Travis 2003 | 13 items 0–2 → 0–26 | G |
| `caregiver-strain-index` | Robinson *J Gerontol* 1983 | 13 yes/no → 0–13; ≥ 7 high | G |
| `bwat` | Bates-Jensen 1992 | 13 items 1–5 → 13–65 (trajectory) | G |

The two caregiver instruments are the **free** alternatives to the licensed Zarit
Burden Interview (excluded by design); `bwat` is the full healing-trajectory
companion to the live `braden` / `norton-push` pressure-injury tiles. **`waterlow`
is deferred**: the Waterlow card has detailed per-category sub-weights with
documented edition drift (1985 vs the 2005 revised card), and the current-card
table could not be byte-verified against ≥ 2 open sources — the same sourcing gate
applied throughout this program. The compute lives in `lib/ltcga-v182.js` (fuzzed,
zero non-finite leaks).

**Program status.** The LTC-GA program (v173–v182) is implemented except
**spec-v180** (older-adult mortality indices — Lee, Schonberg, Walter, Suemoto,
Mitchell MRI, ADEPT, CHESS) and **spec-v181** (LTC infection-surveillance criteria
— revised McGeer, Loeb). Both remain open by deliberate choice: each turns on
high-stakes content (mortality-prediction point tables; antibiotic-initiation
per-site boolean logic) that must be transcribed verbatim from primary sources to
meet the spec-v97 bar, and that verbatim sourcing is the work a future session will
do before shipping them.

### Long-Term Care & Geriatric Assessment program: polypharmacy burden (spec-v172, v179, +3 → 767; MRCI deferred)

[spec-v179](docs/spec-v179.md) is the program's seventh feature spec (cluster §3.7).
The live `beers-check` flags *individual* inappropriate medications; v179 adds the
**cumulative-burden** view a deprescribing review needs. The design point worth
recording is the **spec-v100 §2 classification clarification**: these scales are
published as per-drug lookup tables, but a lookup table is a reference card, not a
calculator (it fails spec-v29 §3). So none of these tiles embeds the drug database —
each **consumes the per-drug inputs the clinician reads from the published scale**
and does the arithmetic:

| tile | source | input the clinician enters | output | group |
|---|---|---|---|---|
| `anticholinergic-burden` | Boustani *Aging Health* 2008 | counts of level-1/2/3 drugs | Σ(level×count); ≥ 3 relevant | G |
| `anticholinergic-risk-scale` | Rudolph *Arch Intern Med* 2008 | counts of 1/2/3-point drugs | Σ(point×count) | G |
| `drug-burden-index` | Hilmer *Arch Intern Med* 2007 | per-drug daily dose D and minimum δ | Σ D/(D+δ) | E |

`drug-burden-index` is a **guarded sum of ratios**: δ must be finite and positive,
so a blank or partial drug row or a zero δ returns a surfaced `valid:false` rather
than `Infinity`, and the division path is fuzzed (spec-v59). **`medication-regimen-
complexity` (MRCI) is deferred**: its 65-item Section A/B/C weight tables (George
2004) are paywalled and copyright, and could not be byte-verified against ≥ 2 open
sources at implementation — the same sourcing gate that governed the deferrals in
the cognition, frailty, and polypharmacy specs. The compute lives in
`lib/ltcga-v179.js` (fuzzed, zero non-finite leaks).

### Long-Term Care & Geriatric Assessment program: geriatric nutrition & dysphagia (spec-v172, v178, +6 → 764)

[spec-v178](docs/spec-v178.md) is the program's sixth feature spec (cluster §3.6).
The live nutrition screens (`must-nutrition`, `nrs2002`, `mnutric`) are admission /
ICU triage tools; the long-term-care home runs on a different set — the lab-based
geriatric indices, an appetite screen, a patient dysphagia self-report, and the
community-elder checklist. v178 ships **all six**:

| tile | source (cross-verified) | scoring | group |
|---|---|---|---|
| `gnri` | Bouillanne *AJCN* 2005 | 1.489·albumin(g/L) + 41.7·(wt/IBW, capped 1); > 98 / 92–98 / 82–<92 / < 82 | E |
| `pni-onodera` | Onodera 1984 | 10·albumin(g/dL) + 0.005·lymphocytes; ≥ 45 / 40–<45 / < 40 | E |
| `conut` | Ignacio de Ulíbarri *Nutr Hosp* 2005 | albumin + cholesterol + lymphocyte points → 0–12 | E |
| `snaq` | Wilson *AJCN* 2005 | 4 items 1–5; ≤ 14 predicts ≥ 5% weight loss | G |
| `eat-10` | Belafsky 2008 | 10 items 0–4; ≥ 3 abnormal swallowing | G |
| `determine` | Posner *AJPH* 1993 | 10 weighted items → 0–21; 0–2 / 3–5 / ≥ 6 | G |

The three lab indices are **guarded formulas** in Group E: `gnri` divides body
weight by Lorentz ideal body weight, and that denominator is positive-checked so a
degenerate height returns a surfaced `valid:false` rather than `Infinity` (the
division path is fuzzed). The `determine` weights were not taken from memory — they
were **pulled verbatim from the ACL Nutrition Screening Initiative checklist**
(`pdftotext` over the official PDF) and they sum to exactly 21, the published
maximum. `eat-10` is cross-linked to the live `guss` clinician swallow test as its
patient self-report complement; `snaq` carries an inline disambiguation from the
similarly named Short Nutritional Assessment Questionnaire. The compute lives in
`lib/ltcga-v178.js` (fuzzed, zero non-finite leaks).

### Long-Term Care & Geriatric Assessment program: frailty & sarcopenia case-finders (spec-v172, v177, +4 → 758; 3 deferred)

[spec-v177](docs/spec-v177.md) is the program's fifth feature spec (cluster §3.5).
The live frailty surface (`frail-scale`, `mfi-5/11`, `ves-13`) is deficit-count /
self-report; v177 adds the sarcopenia case-finders and the multidomain LTC frailty
screens. **Four ship; three are deferred** — and the deferrals are the point worth
recording, because they show the sourcing bar holding:

| tile | source (cross-verified) | scoring | status |
|---|---|---|---|
| `sarc-f` | Malmstrom *JAMDA* 2013 | 5 items 0–2; ≥ 4 predicts sarcopenia | shipped |
| `sarc-calf` | Barbosa-Silva *JAMDA* 2016 | SARC-F + 10 if calf < 34/33 cm; ≥ 11 | shipped |
| `prisma-7` | Raîche 2008 | 7 items; support item reverse-scored; ≥ 3 | shipped |
| `sof-frailty-index` | Ensrud 2008 | 3 items; 0 robust / 1 pre-frail / ≥ 2 frail | shipped |
| `clinical-frailty-scale` | Rockwood *CMAJ* 2005 | — | **deferred (licensing)** |
| `groningen-frailty-indicator` | Steverink 2001 | — | **deferred (sourcing)** |
| `edmonton-frail-scale` | Rolfson 2006 | — | **deferred (sourcing)** |

The Rockwood **Clinical Frailty Scale** is copyright Dalhousie University and
requires a license for commercial use; reproducing its nine anchored descriptors
fails the free-reproducibility bar (the same call as PACSLAC in v175). The **GFI**
and **EFS** were deferred for a different reason: their exact per-item 0/1 and
0/1/2 thresholds (the GFI fitness-rating cut, the EFS domain points summing to 17)
could not be byte-verified against ≥ 2 independent sources at implementation, so
they fall under the spec-v97 sourcing gate rather than ship from an approximate
recall — the same discipline that deferred 5 tiles in v173. The four shipped tiles
live in `lib/ltcga-v177.js` (fuzzed, zero non-finite leaks); `prisma-7` carries the
reverse-scored support item as a unit-tested edge.

### Long-Term Care & Geriatric Assessment program: falls-risk, balance & gait (spec-v172, v176, +6 → 754)

[spec-v176](docs/spec-v176.md) is the program's fourth feature spec (cluster §3.4).
The catalog carried the two inpatient falls-risk screens (`morse-falls`,
`hendrich-ii`); it lacked the **performance-based battery** and the **community /
LTC screening algorithm** a nursing home, geriatric clinic, or outpatient PT uses.
v176 ships **all six**, every norm and cut-point re-fetched and cross-verified
against ≥ 2 independent sources (spec-v97):

| tile | source (cross-verified) | scoring | class |
|---|---|---|---|
| `stratify` | Oliver *BMJ* 1997 | 5 factors 0–5; ≥ 2 high fall risk | A |
| `chair-stand-30s` | Jones 1999 + CDC STEADI norms | stand count vs the below-average age/sex cut-point (ages 60–94) | B (CDC) |
| `four-stage-balance` | CDC STEADI | full-tandem hold time vs the 10 s cut-point | B (CDC) |
| `functional-reach` | Duncan *J Gerontol* 1990 | reach vs < 15.24 / 15.24–25.40 / > 25.40 cm cut-points + age/sex norm | A |
| `gait-speed` | Studenski *JAMA* 2011 | distance ÷ time → m/s; < 0.6 / < 0.8 / ≥ 1.0 (Group E) | A |
| `steadi-algorithm` | Stevens & Phelan 2013 | CDC STEADI screen → low / moderate / high pathway | B (CDC) |

Two engineering points are worth recording. `gait-speed` is a **guarded ratio**:
the time denominator is finite/positive-checked, so a zero or blank time returns a
surfaced `valid:false` rather than `Infinity` — and the division path is explicitly
fuzzed (spec-v59). And `chair-stand-30s` / `functional-reach` **refuse to guess**:
an age outside the normed strata returns `valid:false`, never a fabricated band. The
three CDC-STEADI-derived tiles trip the `ISSUER_PATTERN` on “CDC” and so are **Class
B**, each carrying a `docs/citation-staleness.md` row. `gait-speed` is the only tile
here in **Group E** (it returns a value, m/s). The compute lives in
`lib/ltcga-v176.js` (fuzzed, zero non-finite leaks). `berg-balance`, `tinetti-poma`,
and `tug` are reserved to other specs and are not shipped here.

### Long-Term Care & Geriatric Assessment program: observational pain in the cognitively impaired elder (spec-v172, v175, +3 → 748)

[spec-v175](docs/spec-v175.md) is the program's third feature spec (cluster §3.3).
The catalog already carried `painad` and `cpot` — strong observational pain tiles
for the nonverbal patient — but an LTC pain protocol frequently *mandates* a
specific instrument, and a facility whose policy names Abbey or DOLOPLUS-2 cannot
substitute PAINAD. v175 ships **all three** mandated scales, each item list,
per-item range, and band re-fetched and cross-verified against ≥ 2 independent
sources (spec-v97):

| tile | source (cross-verified) | scoring |
|---|---|---|
| `abbey-pain` | Abbey *Int J Palliat Nurs* 2004 + geriatricpain.org form | 6 items 0–3; total 0–18; 0–2 none, 3–7 mild, 8–13 moderate, 14+ severe |
| `cnpi` | Feldt *Pain Manag Nurs* 2000 + geriatricpain.org form | 6 behaviors present/absent at rest **and** with movement; rest 0–6, movement 0–6, combined 0–12 |
| `doloplus-2` | Wary *Eur J Palliat Care* 2001 + doloplus.fr | 10 items 0–3 (somatic/psychomotor/psychosocial); total 0–30; ≥ 5 indicates pain |

The instrument worth its own note is `cnpi`: unlike `painad` it structures the
**with-movement** assessment as a separate condition, so the compute carries two
independent 0–6 sums (rest, movement) and a 0–12 combined total and **never scores
movement from rest** — a blank condition renders a complete-the-fields fallback.
`abbey-pain` is the standard scale in Australian and UK aged care; `doloplus-2` the
standard in French and European geriatric care. All three are Group G, Class A,
trip no `ISSUER_PATTERN`, and carry band-flip boundary worked examples (Abbey 7→8
and 13→14, DOLOPLUS-2 4→5, CNPI rest-vs-movement split). The compute lives in
`lib/ltcga-v175.js` (fuzzed, zero non-finite leaks). **PACSLAC** is excluded by
design (licensed/copyright-gated, fails the free-reproducibility bar).

### Long-Term Care & Geriatric Assessment program: behavioral symptoms & observational delirium / mood screens (spec-v172, v174, +5 → 745)

[spec-v174](docs/spec-v174.md) is the program's second feature spec. The catalog
already carried the *interview-based* delirium tiles (`cam`, `cam-icu`, `4at`) and
the self-report mood screens (`gds15`, `phq9`). The long-term-care floor needs the
*nurse-observation* screens a charge nurse completes from a whole shift, and the
*dementia-specific* behavioral instruments those self-report scales cannot cover.
v174 ships **all five** proposed — each item value, per-item range, and band
re-fetched and cross-verified against ≥ 2 independent sources (spec-v97):

| tile | source (cross-verified) | scoring |
|---|---|---|
| `nu-desc` | Gaudreau *J Pain Symptom Manage* 2005 + PMC validations | 5 features 0–2; total 0–10; ≥ 2 positive delirium screen |
| `doss` | Schuurmans *Res Theory Nurs Pract* 2003 + BEST-project form | 13 items present/absent; total 0–13; ≥ 3 suggests delirium |
| `cornell-csdd` | Alexopoulos *Biol Psychiatry* 1988 + Cornell scoring form | 19 items *a*/0/1/2; total 0–38; > 10 probable, > 18 definite |
| `interrai-abs` | Perlman & Hirdes *JAGS* 2008 + CIHI interRAI job aid | 4 items 0–3 (MDS 7-day); total 0–12 |
| `cmai` | Cohen-Mansfield *J Gerontol* 1989 + 1991 CMAI manual | 29 items frequency 1–7; total 29 to 203 (floor 29, not 0) |

Two findings of the cross-verification are worth recording. The `interrai-abs`
draft per-item range (0–4, which would give a 0–16 total) was **corrected to 0–3 /
0–12** against the CIHI job aid — the kind of off-by-one a re-fetch catches that
recall does not. And `cmai` is reported as a **frequency quantifier with no total
severity band**, because the CMAI manual explicitly advises against summing a
severity score; the tile surfaces the three most-cited factor subscales
(aggressive / physically non-aggressive / verbally agitated) and notes that factor
membership varies by population. `cornell-csdd` surfaces inline that `gds15` /
`phq9` self-report scales are not valid in moderate-to-severe dementia — the reason
the Cornell scale exists. All five are Group G, Class A, trip no `ISSUER_PATTERN`,
and carry boundary worked examples with band-flips (Nu-DESC 1→2, DOSS 2→3, Cornell
10→11 and 18→19, ABS mild/moderate and moderate/severe, CMAI floor/ceiling). The
compute lives in `lib/ltcga-v174.js` (fuzzed, zero non-finite leaks).

### Data-Sourced Reference-Table program: CDC growth charts, and a principled deferral (spec-v168, v169, +2 → 737)

[spec-v168](docs/spec-v168.md) is the **fourth-pass** program. The first three
passes saturated the *formula-shaped* surface — closed-form scores a clinician
could carry in their head. What remained were the instruments defined by a
**published reference table** rather than an equation: pediatric BP percentiles,
the transplant allocation indices, and the preterm/fetal growth standards. These
were deferred *on purpose* by earlier passes, because shipping them safely
requires the [spec-v141](docs/spec-v141.md) **verbatim-fetch** discipline —
fetch the source bytes to disk, parse them programmatically, cross-verify against
a second independent reproduction, and **never hand-transcribe**.

This pass shipped the two tiles whose source met that bar and **deferred the
other five that did not** — the project's safety doctrine forbids shipping a
clinically load-bearing calculator from a source it cannot fetch and verify.

| spec | tile | source (verbatim) | cross-verification | status |
|---|---|---|---|---|
| [v169](docs/spec-v169.md) | `cdc-stature-for-age` | CDC NCHS `statage.csv` (HTTP 200) | the file's own published P3..P97 columns, reconstructed from the LMS set: **max rel. error 1.8e-9 over 3,924 checks** | **shipped** |
| [v169](docs/spec-v169.md) | `cdc-weight-for-age` | CDC NCHS `wtage.csv` (HTTP 200) | same self-cross-verification: **3.9e-9 over 3,924 checks** | **shipped** |
| [v169](docs/spec-v169.md) | `pediatric-bp-percentile` | AAP/NHLBI BP regression coefficients | PDF-locked, no verbatim/cross-verifiable fetch | deferred |
| [v170](docs/spec-v170.md) | `kdpi`, `epts` | OPTN annual mapping guides | `optn.transplant.hrsa.gov` → HTTP 403 (whole domain) | deferred |
| [v171](docs/spec-v171.md) | `fenton-preterm-growth`, `intergrowth-efw-percentile` | Springer / Wiley supplementary | both → HTTP 403 | deferred |

The two shipped tiles are the percentile companions to the already-live
`peds-bmi-percentile` (CDC BMI-for-age) and `who-growth-zscore` (WHO 0–2 yr),
reusing the same `interpLMS`/`lmsToZ` infrastructure fuzzed since spec-v141.

Both are **Class A** with gate-forced [citation-staleness](docs/citation-staleness.md)
rows (the "CDC" acronym trips the issuer pattern; the 2000 standard is fixed and
does not drift). The deferrals are tracked, with their re-open condition, in
[docs/scope-data-sourced.md](docs/scope-data-sourced.md). The cross-verification
is the point worth dwelling on: because the CDC files carry **both** the LMS
coefficients and the printed percentiles, a single verbatim file is its own
second source — the compute is correct iff it reproduces the publisher's own
percentile columns, which it does to machine precision.

### US-defaults & localization (spec-v184)

A clinician-perspective QA pass found the product was clinically strong but did
not consistently present **US defaults**. [spec-v184](docs/spec-v184.md) fixed
that as a presentation-only remediation (no tile added, no compute unit
changed, every `META.example` and deep-link hash byte-identical):

- **`en-US` locale** declared consistently (`<html lang>`, JSON-LD
  `inLanguage`, every built page, the a11y assertion) to match `og:locale`.
- **American-English copy** across rendered bands, labels, banners, and
  category values (`oedema`→`edema`, `haemoglobin`→`hemoglobin`, `tumour`→`tumor`,
  `ionised`→`ionized`, `noradrenaline`→`norepinephrine`, …). A new lint gate,
  `scripts/check-us-english.mjs`, makes a British spelling in a user-facing
  string a build failure while leaving citations, journal abbreviations, and
  official instrument names (e.g. the mJOA "Japanese Orthopaedic Association")
  untouched.
- **US date display** — the Naegele due date renders `MM/DD/YYYY (ISO)` and the
  appeal-letter / HIPAA-request templates stamp `Mon D, YYYY`, via pure
  `usDate`/`usDateLong` formatters; the canonical ISO return value is unchanged.
- **US-customary unit affordances** — `TEMP_UNITS` (°C|°F) and `HEIGHT_UNITS`
  (cm|in) join the existing `WEIGHT_UNITS` (kg|lb); the canonical unit is always
  the default option, so `unitNum` still feeds the compute path metric and the
  documented examples reproduce exactly. The first wave shipped the toggles on
  the three energy tiles; the §4.3/§4.4 follow-on wave then closed the sweep so
  that **every numeric temperature input now offers °F** (NEWS2, MEWS, MEOWS,
  Truelove-Witts, the HScore, SNAPPE-II, APACHE II, SAPS II, and the CPIS) and
  **every metric-only height input now offers inches** (predicted spirometry,
  the IWPC and Gage warfarin dosers, bedside Schwartz eGFR, ARDSnet predicted
  body weight, pediatric BMI-for-age, the Ireton-Jones energy estimate, and
  GNRI). The weights entered alongside those converted heights (warfarin, peds
  BMI, Ireton-Jones, GNRI) gained the kg|lb toggle in the same change. The two
  height fields whose canonical unit is *already* inches stay inch-first — they
  already present the US default.

### Cross-Discipline Completion program: EBM bedside math, ophthalmology, radiology classification, PK & one-formula gaps (spec-v162, v163–v167, +18 → 735)

[spec-v162](docs/spec-v162.md) is the **third-pass** program. The first two
passes closed under-represented *specialties* (Post-Parity Coverage, v150) and
*subspecialty quantification* (Subspecialty Depth, v157). This pass reaches the
deterministic, free tools a clinician uses that a calculator catalog rarely
indexes — the disciplines that live *outside* the usual "clinical score" framing.
Five feature specs ship **18** tiles (a net +18 over the prior close), bringing the catalog to 735; every formula, point table, and
threshold was re-fetched and cross-verified against ≥ 2 independent sources at
implementation (the spec-v97 discipline), and all five modules are fuzz-covered by
the spec-v59 harness with zero non-finite leaks.

| spec | theme | tiles | group | notable correctness anchor |
|---|---|---|---|---|
| [v163](docs/spec-v163.md) | EBM bedside math | `fagan-post-test`, `diagnostic-2x2`, `nnt-arr` | E | Fagan computed in **odds space** (no float clamp at p→0/1); NNT/NNH sign-flip so harm is never reported as benefit; 2×2 PPV/NPV recomputed by Bayes at a target prevalence |
| [v164](docs/spec-v164.md) | ophthalmology | `iol-power`, `visual-acuity-converter`, `ocular-perfusion-pressure` | E | SRK II axial-length A-constant band table (confirmed); refraction correction ships the documented single 1.25 factor with a caveat (the per-power breakpoint is unverifiable) |
| [v165](docs/spec-v165.md) | radiology classification | `acr-tirads`, `adrenal-ct-washout`, `bosniak`, `ct-effective-dose` | G/E | TI-RADS echogenic foci are **additive, not max**; Bosniak 2019 — calcification never upgrades class; CT k-factors = AAPM Report 96 / EUR 16262 (ICRP-60) |
| [v166](docs/spec-v166.md) | pharmacokinetics & psych dosing | `pk-suite`, `chlorpromazine-equivalents` | F | Woods 2003 anchor table — 7 agents confirmed across ≥ 2 sources; `lithium-maintenance` **deferred** (Cooper nomogram single-sourced, fails the ≥ 2-source rule) |
| [v167](docs/spec-v167.md) | one-formula subspecialty gaps | `mean-airway-pressure`, `cerebroplacental-ratio`, `toe-brachial-index`, `stool-osmotic-gap`, `pure-tone-average`, `rutgeerts` | E/G | each fills a single named hole (vent, fetal Doppler, vascular, GI, audiology, IBD endoscopy); every division guarded |

Two things worth calling out. The program needed the **one vocabulary edit** the
prior programs did not: `clinical-epidemiology`, `ophthalmology`, `optometry`,
`radiology`, `medical-physics`, and `audiology` were added to the
`specialty-coverage.test.js` closed vocabulary. And the program's **actual delta
is +18, not the nominal +19** — `lithium-maintenance` was deferred at
implementation because the Cooper 1973 band table cannot be cross-verified to two
independent sources (primary paywalled, secondary image-only, and the published
equation does not cleanly reproduce the band table); it is parked with
`crib-ii` / `gail-bcrat`. On **citations**, none of the 18 trips the
`check-citations` issuer pattern (ACR, AAPM, ICRP, ASHA are not in it), so every
tile is **Class A** with no staleness row. See
[docs/spec-v162.md](docs/spec-v162.md).

### Subspecialty Depth program: echocardiography, neuro/spine disability, rheumatology PRO & SLE, endocrine/metabolic math (spec-v157, v158–v161, +17 → 717)

[spec-v157](docs/spec-v157.md) is a **second-pass** program. Where the
[Post-Parity Coverage](docs/scope-post-parity.md) program (v150) closed the
under-represented *specialty* gaps, this one closes the deeper *subspecialty
quantification* gaps a finer read surfaces — most visibly that
**echocardiography**, one of the most-performed studies in medicine, had a single
quantification tile (`aortic-valve-area`). Four feature specs ship 17 tiles
(700 → 717); every formula, weight, and partition was re-fetched and
cross-verified against ≥ 2 independent sources at implementation (the spec-v97
discipline), and all four modules are fuzz-covered by the spec-v59 harness with
zero non-finite leaks. The catalog ledger is
[docs/scope-subspecialty-depth.md](docs/scope-subspecialty-depth.md).

| spec | theme | tiles | group | notable correctness anchor |
|---|---|---|---|---|
| [v158](docs/spec-v158.md) | echocardiography quantification | `lv-mass-index`, `la-volume-index`, `teichholz-lvef`, `rvsp-pasp`, `mitral-e-e-prime` | E | Devereux cube + RWT 0.42 × sex-specific LVMI → four geometry patterns; E/e′ normal boundary corrected to `< 9` (draft said `< 8`) |
| [v159](docs/spec-v159.md) | neuro / spine disability | `edss`, `asia-impairment`, `mjoa`, `nurick` | G | EDSS = **higher of** the FS-count step and the ambulation anchor (published precedence); mJOA higher-is-better surfaced |
| [v160](docs/spec-v160.md) | rheumatology PRO & SLE classification | `rapid3`, `dapsa`, `slicc-sle`, `sle-2019-eular-acr` | G | DAPSA CRP in **mg/dL** (not mg/L); 2019 SLE ANA entry gate + within-domain max-weight rule, every weight cross-verified |
| [v161](docs/spec-v161.md) | endocrine / metabolic / nutrition | `arr`, `calcium-phosphate-product`, `free-thyroxine-index`, `nitrogen-balance` | E/F | ARR cutoff differs by renin unit (PRA vs DRC) and is never compared across unit systems |

Three things worth calling out. **EDSS is the hardest scale to make
deterministic** — a precise Functional-System→step rating is not fully
algorithmic, so the tile implements the standard simplified FS-count table for
the low range and the authoritative ambulation anchors for ≥ 4.0, reporting the
*higher* of the two (a wheelchair-dependent patient is never EDSS 2.0 because the
FS table is low) and pointing the user to a trained Neurostatus rating for a
definitive score. On **citations**, only `calcium-phosphate-product` (KDIGO)
trips the `check-citations` issuer pattern and carries a documentation-only
staleness row; ASE/EACVI, EULAR/ACR, the Endocrine Society, and ASPEN are all
spelled out or out-of-pattern, so the other 16 tiles are **Class A**. And the
program's **actual delta is +17, not the draft's nominal +18** — the v157 draft
carried a known running-count off-by-one; `UTILITIES.length` is the source of
truth and the 13 catalog-truth surfaces agree at 717. See
[docs/spec-v157.md](docs/spec-v157.md).

### Rheumatology PRO & obstetric classification: BASDAI, BASFI, ESSDAI, Robson (spec-v156, +4 → 700) — Post-Parity Coverage program complete

[spec-v156](docs/spec-v156.md) is the **sixth and closing** feature spec of the
[Post-Parity Coverage](docs/scope-post-parity.md) program (spec-v150). v147/v148
shipped the *physician-derived* rheumatology activity scores (`cdai-ra`,
`sdai-ra`, `sledai-2k`, `asdas`, `ffs-2011`); v156 completes the **patient-reported**
axial-spondyloarthritis axis (`basdai` activity, `basfi` function), adds the
standard Sjögren systemic-activity index (`essdai`), and ships the WHO-endorsed
**Robson Ten-Group** cesarean-audit classifier alongside `meows`/`bishop`. The
four computes live in `lib/rheum-ob-v156.js` + `views/group-v156.js` (`RV156`),
fuzz-covered by the spec-v59 harness, every weight and decision rule re-fetched
and cross-verified against ≥ 2 independent sources (the spec-v97 discipline).

| id | Group | Inputs | Output | Companion to |
|---|---|---|---|---|
| `basdai` | G | six 0–10 items (Garrett 1994) | `[Q1 + Q2 + Q3 + Q4 + (Q5 + Q6)/2] / 5`, 0–10; ≥ 4 = active disease | `basfi`, `asdas`, `das28` |
| `basfi` | G | ten 0–10 items (Calin 1994) | the **mean** of the 10 items, 0–10 (higher = poorer function) | `basdai`, `asdas` |
| `essdai` | G | 12 weighted domains (Seror 2010/2015) | weighted **direct sum** (max 123); low < 5, moderate 5–13, high ≥ 14 | `sledai-2k`, `cdai-ra` |
| `robson` | G | parity, prev. cesarean, onset, presentation, plurality, gestation (Robson 2001) | exactly one of ten mutually-exclusive groups (1, 2a/2b, 3, 4a/4b, 5–10) | `bishop`, `meows` |

Three correctness anchors. **BASDAI averages the two morning-stiffness items
(Q5, Q6) before adding them** — a unit test asserts the pair is not summed flat.
**ESSDAI's per-level printed value is already weight × level**, so the total is a
direct sum (max 123); the table preserves the structural quirks that secondary
sources routinely flatten — constitutional/glandular/biological have *no high
level*, and CNS has *no low level*. And **Robson is asserted mutually-exclusive
and total**: a unit test enumerates all 144 input combinations and checks each
maps to exactly one of the ten groups. On citations, `essdai`'s **EULAR** and
`robson`'s **WHO** endorsement are documentation-only — EULAR is not in the
`check-citations` issuer pattern (so no staleness row, matching the v147/v148
ACR/EULAR precedent), and Robson's WHO endorsement is kept out of the machine-read
`citation` field. With v156 the Post-Parity Coverage program is **complete
(679 → 700)**. See [docs/spec-v156.md](docs/spec-v156.md).

### Suite completions: MIPI, Forrest, Wagner DFU, University of Texas DFU (spec-v155, +4 → 696)

[spec-v155](docs/spec-v155.md) is the fifth feature spec of the Post-Parity
Coverage program. Five suites were complete except for one well-known member
each: the lymphoma-index suite (`nccn-ipi`, `r-ipi`, `flipi`) had **no
mantle-cell index**, the upper-GI-bleed suite (`gbs`, `rockall`, `aims65`,
`oakland`) had **no endoscopic-stigmata anchor**, and `wifi` graded limb threat
but the **diabetic-foot wound-grading systems were absent**. The four tiles live
in `lib/suites-v155.js` + `views/group-v155.js` (`RV155`), fuzz-covered by the
spec-v59 harness, every coefficient and class re-fetched and cross-verified
against ≥ 2 independent sources (the spec-v97 discipline).

| id | Group | Inputs | Output | Companion to |
|---|---|---|---|---|
| `mipi` | G | age, ECOG, LDH + ULN, WBC (Hoster 2008) | continuous index `0.03535·age + 0.6978·(ECOG 2–4) + 1.367·log₁₀(LDH/ULN) + 0.9393·log₁₀(WBC)`; low < 5.7, intermediate to < 6.2, high ≥ 6.2 | `nccn-ipi`, `r-ipi`, `flipi` |
| `forrest` | G | endoscopic finding (Forrest 1974) | Ia/Ib/IIa high-risk → endoscopic therapy; IIb intermediate; IIc/III low-risk, with approximate rebleed-risk ranges | `rockall`, `gbs`, `aims65` |
| `wagner-dfu` | G | lesion depth/extent (Wagner 1981) | grade 0–5; grade ≥ 3 (deep abscess/osteomyelitis, gangrene) flagged | `wifi`, `university-texas-dfu` |
| `university-texas-dfu` | G | grade (depth) 0–3 × stage A–D (Lavery/Armstrong 1996/1998) | the grade × stage cell (e.g. IIB); worsening prognosis with each axis | `wagner-dfu`, `wifi` |

Two correctness anchors. **MIPI's WBC is the absolute count per microliter inside
the log** — the Hoster erratum explicitly warns that inserting WBC as thousands/µL
gives the wrong result (for 8000/µL use `log₁₀(8000)=3.903`, not `log₁₀(8)`), so
the field is labelled "per µL, absolute" and a unit test locks the contract; the
`log₁₀` domain (LDH/ULN/WBC/age must be > 0) is the chief `NaN` path and returns a
surfaced complete-the-fields fallback. And **PRECISE-DAPT was deferred, not
shipped**: its published bleeding score is a restricted-cubic-spline continuous
nomogram with no verbatim per-variable point table reproducible across ≥ 2 sources,
so it is parked with `crib-ii`/`gail-bcrat` rather than approximated — the delta is
**+4, not the proposed +5**. See [docs/spec-v155.md](docs/spec-v155.md).

### Function, falls & palliative performance: Berg, TUG, Tinetti POMA, PPSv2 (spec-v154, +4 → 692)

[spec-v154](docs/spec-v154.md) is the fourth feature spec of the Post-Parity
Coverage program. The catalog already carried fall-*risk* prediction
(`morse-falls`, `hendrich-ii`) and frailty screens, but **no performance-based
mobility/balance measure**, and palliative care had `ecog-karnofsky` but **not the
Palliative Performance Scale** that anchors hospice eligibility. These four
complete that axis: the two standard balance/gait batteries, the single most-used
bedside mobility screen, and the hospice functional anchor. They live in
`lib/function-v154.js` + `views/group-v154.js` (`RV154`), fuzz-covered by the
spec-v59 harness, with every range, threshold, and band re-fetched and
cross-verified against ≥ 2 independent sources (the spec-v97 discipline).

| id | Group | Inputs | Output | Companion to |
|---|---|---|---|---|
| `berg-balance` | G | 14 tasks each 0–4 (Berg 1992) | BBS 0–56: 0–20 wheelchair-bound, 21–40 walking with assistance, 41–56 independent; **< 45 = increased fall risk** (strict) | `tinetti-poma`, `tug`, `morse-falls` |
| `tug` | E | measured time in seconds (Podsiadlo 1991) | ≥ 12 s CDC STEADI flag; ≥ 13.5 s community cut-off; ≥ 30 s dependent; blank/non-finite → complete-the-fields | `berg-balance`, `tinetti-poma` |
| `tinetti-poma` | G | balance 0–16 + gait 0–12 (Tinetti 1986) | POMA 0–28: ≤ 18 high, 19–23 moderate, ≥ 24 low (24 classed low per MDCalc/StatPearls) | `berg-balance`, `tug` |
| `pps` | G | 5 columns, read-leftward (PPSv2, Victoria Hospice) | PPS 0–100% in 10% steps; lower → shorter survival; hospice-eligibility framing | `ecog-karnofsky` |

Two correctness anchors. **The Berg `< 45` cutoff is strict** — a score of exactly
45 sits on the lower-risk side, exercised by a 44/45 boundary test. And **PPS is
not a single dropdown**: each column descriptor maps to a *set* of consistent
levels (ambulation "Full" spans 100/90/80%), so the level is the best horizontal
fit computed by intersecting the column candidate-sets left-to-right; a rightward
column that conflicts with the leftward-established set is **overridden by leftward
precedence and flagged**, never forced into an empty result. A unit test drives the
read-leftward case where two columns disagree. See [docs/spec-v154.md](docs/spec-v154.md).

### Urology & men's-health symptom scores: IPSS, IIEF-5/SHIM, OABSS (spec-v153, +3 → 688)

[spec-v153](docs/spec-v153.md) is the third feature spec of the Post-Parity
Coverage program. The catalog already carried the urologic *oncology* math
(`psa-density`, `psa-velocity`, `psa-doubling-time`, `prostate-volume`,
`gleason-grade-group`, `damico-prostate-risk`, `capra-score`) and the stone
scores, but **none of the validated symptom-score instruments** that drive
benign-disease management — BPH/LUTS, erectile dysfunction, overactive bladder.
These three are the standard, free, self-administered questionnaires. Each is a
bounded item sum over fixed-range selects; an unanswered item surfaces a
complete-the-fields fallback rather than an undercounted total. They live in
`lib/urology-v153.js` + `views/group-v153.js` (`RV153`), Group G, Class A,
fuzz-covered by the spec-v59 harness. Every item range, band cutoff, and gating
rule was re-fetched and cross-verified against ≥ 2 independent sources (the
spec-v97 discipline).

| id | Group | Items | Output | Companion to |
|---|---|---|---|---|
| `ipss` | G | 7 symptom Qs each 0–5 (+ separate 0–6 QoL item) (Barry 1992) | IPSS 0–35: 0–7 mild, 8–19 moderate, 20–35 severe; QoL reported but **not** summed | `prostate-volume`, `oabss` |
| `iief5` | G | 5 items; Q1 1–5, Q2–Q5 0–5 (Rosen 1999) | IIEF-5 5–25: 22–25 no ED, 17–21 mild, 12–16 mild-moderate, 8–11 moderate, 5–7 severe; ≤21 = ED | `ipss` |
| `oabss` | G | daytime 0–2, nocturia 0–3, urgency 0–5, incontinence 0–5 (Homma 2006) | OABSS 0–15: ≤5 mild, 6–11 moderate, ≥12 severe; OAB gate = urgency ≥ 2 **and** total ≥ 3 | `ipss` |

Two correctness anchors. **The IPSS quality-of-life item is never added into the
0–35 symptom total** (a common scoring error) — a unit test asserts the total is
invariant to the QoL value. And the **OABSS surfaces its diagnostic gate**: a high
total driven by frequency alone (urgency item < 2) is flagged as *not* meeting the
overactive-bladder symptom definition, rather than implying OAB from the total.
See [docs/spec-v153.md](docs/spec-v153.md).

### Nutrition & energy expenditure: predictive REE/BEE equations (spec-v152, +5 → 685)

[spec-v152](docs/spec-v152.md) is the second feature spec of the Post-Parity
Coverage program. The catalog already had nutrition *screening* (`must-nutrition`,
`nrs2002`, `nutric`, `mnutric`, `refeeding-risk`) and a weight-based
`icu-nutrition-target`, but **no predictive resting/total energy-expenditure
equation** — the number every dietitian starts from. These five fill that gap: the
ambulatory standard, the classic comparator, the lean-mass equation, and the two
ventilated-patient equations that approximate indirect calorimetry when a metabolic
cart is unavailable. They live in `lib/nutrition-energy-v152.js` +
`views/group-v152.js` (`RV152`), Class A, fuzz-covered by the spec-v59 harness.
Every coefficient was re-fetched and cross-verified against ≥ 2 independent sources
(the spec-v97 discipline).

| id | Group | Rule | Output | Companion to |
|---|---|---|---|---|
| `mifflin-st-jeor` | E | REE = 10·wt(kg) + 6.25·ht(cm) − 5·age + s, s = +5 (M) / −161 (F) (Mifflin 1990) | REE kcal/day + optional TDEE = REE × activity factor | `harris-benedict`, `icu-nutrition-target` |
| `harris-benedict` | E | sex-specific BEE, revised constants — M 88.362 + 13.397·wt + 4.799·ht − 5.677·age (Roza 1984) | BEE kcal/day + TDEE; runs ~5% above Mifflin | `mifflin-st-jeor` |
| `katch-mcardle` | E | BMR = 370 + 21.6·LBM(kg), LBM direct or weight × (1 − fat%/100) | BMR kcal/day + LBM + TDEE | `mifflin-st-jeor` |
| `penn-state-ree` | F | RMR = Mifflin·0.96 + Tmax·167 + Ve·31 − 6212 (2003b); modified form when BMI ≥ 30 **and** age ≥ 60 (Frankenfield 2004/2009) | ventilated RMR kcal/day + which branch | `ireton-jones`, `icu-nutrition-target` |
| `ireton-jones` | F | ventilated EEE = 1784 − 11·age + 5·wt + 244·(M) + 239·(trauma) + 804·(burn); spontaneous form (Ireton-Jones 2002) | EEE kcal/day + which form | `penn-state-ree` |

Two correctness anchors. **Penn State is a three-way branch, not two** — the
modified (2010) constants apply *only* when BMI ≥ 30 **and** age ≥ 60; an obese
patient under 60 still uses the standard 2003b form (a routing trap a unit test
pins). And the **1997-revised Ireton-Jones constants** (1784/244/239/804) are used,
not the distinct 1992 set (1925/281/292/851) — the two were cross-verified
side-by-side at implementation. See [docs/spec-v152.md](docs/spec-v152.md).

### Dermatology severity: opening the Post-Parity Coverage program (spec-v151, +4 → 680)

[spec-v150](docs/spec-v150.md) charters the **Post-Parity Coverage** program — the
successor to the completed spec-v100 MDCalc-Parity program — which asks one
question, *"have we included every calculator a healthcare worker would actually
use?"*, and closes the under-represented-specialty gaps that the acute-care sweep
left open. [spec-v151](docs/spec-v151.md) is its first feature spec: it fills the
**dermatology severity gap** (the catalog had no scored-severity dermatology tile)
with the four indices a dermatology clinic reaches for daily. All four live in
`lib/derm-v151.js` + `views/group-v151.js` (`RV151`), Class A, fuzz-covered by the
spec-v59 harness. Every region/item weight and band was re-fetched and
cross-verified against ≥ 2 independent sources (the spec-v97 discipline).

| id | Group | Rule | Output | Companion to |
|---|---|---|---|---|
| `pasi` | G | Σ over 4 regions of (erythema + induration + desquamation, each 0–4) × area grade 0–6 × region weight (head 0.1, upper 0.2, trunk 0.3, lower 0.4) (Fredriksson 1978) | PASI 0–72 + band (mild < 10, moderate 10–20, severe > 20) | `dlqi`, `easi` |
| `easi` | G | Σ (erythema + edema + excoriation + lichenification, each 0–3) × area 0–6 × **age-branched** weight (Hanifin 2001) | EASI 0–72 + six-band Leshem 2015 strata | `scorad`, `dlqi` |
| `scorad` | G | SCORAD = A/5 + 7B/2 + C: extent % (A), six 0–3 intensity items (B, dryness on uninvolved skin), two 0–10 VAS (C) (ETFAD 1993) | SCORAD 0–103 + oSCORAD + band (mild < 25, moderate 25–50, severe > 50) | `easi`, `dlqi` |
| `dlqi` | G | sum of ten 0–3 quality-of-life answers, Q7 yes-prevented-work = 3 (Finlay 1994) | DLQI 0–30 + band (no / small / moderate / very large / extremely large effect) | `pasi`, `easi` |

Two correctness anchors. **EASI's region weights are age-dependent** — children
(< 8 yr) use head 0.2 / lower 0.3 where adults use head 0.1 / lower 0.4 (head and
lower-limb weights swap; the same intensity inputs give a *different* total, which
a unit test pins) — and the published **six-band Leshem 2015 strata** are used
rather than the spec draft's unverified four-band cut-set (a spec-correction
recorded in the source-governance notes, cross-verified against DermNet and the
Hanifin 2022 practical guide). **SCORAD's dryness item is graded on *uninvolved*
skin** (the classic trap), and the percentage → 0–6 area grade mapping is exercised
by the spec-v59 fuzz harness. See [docs/spec-v151.md](docs/spec-v151.md).

### Rheumatology, palliative & pharmacy: closing the spec-v100 program (spec-v148, +7 → 676, **program complete**)

[spec-v148](docs/spec-v148.md) is the **closing feature spec of the entire
spec-v100 MDCalc Parity Completion program**. It adds the spondyloarthritis
activity score, the vasculitis prognosis score, and the giant-cell-arteritis
classification the rheumatology surface still lacked beside `das28`; the two free
palliative-prognosis substitutes; an opioid equianalgesic *rotation* converter
(distinct from the surveillance `opioid-mme`); and the Naranjo ADR causality
scale. All seven live in `lib/rheum-v148.js` + `views/group-v148.js` (`RV148`),
fuzz-covered by the spec-v59 harness. Every coefficient, weight, cutoff, and
equianalgesic constant was re-fetched and cross-verified against ≥ 2 independent
authoritative sources (the spec-v97 discipline).

| id | Group | Rule | Output | Companion to |
|---|---|---|---|---|
| `asdas` | G | ASDAS-CRP = 0.12·back pain + 0.06·morning stiffness + 0.11·patient global + 0.07·peripheral pain + 0.58·ln(CRP+1), CRP mg/L floored to 2; ASDAS-ESR uses **different** weights + 0.29·√ESR (Lukas 2009) | ASDAS value + band (inactive < 1.3, low < 2.1, high ≤ 3.5, very high > 3.5) | `das28` |
| `ffs-2011` | G | four poor-prognosis factors + the favorable absence-of-ENT, each +1 (Guillevin 2011) | total 0–5 + 5-year mortality ≈ 9% / 21% / 40% at 0 / 1 / ≥ 2 | `das28` |
| `gca-acr-eular-2022` | G | age ≥ 50 entry, then biopsy/halo +5, ESR/CRP +3, visual loss +3, seven +2 items (Ponte 2022) | total 0–25, **≥ 6** classifies as GCA; **Class B** | `cdai-ra` |
| `palliative-prognostic-index` | G | PPS + oral intake + edema + dyspnea at rest + delirium (Morita 1999) | total 0–15, **> 6 → < 3 weeks**, > 4 → < 6 weeks | `ecog-karnofsky`, `palliative-prognostic-score` |
| `palliative-prognostic-score` | G | dyspnea + anorexia + Karnofsky + clinical prediction of survival + WBC + lymphocyte % (Pirovano/Maltoni 1999) | total 0–17.5, group **A > 70% / B 30–70% / C < 30%** | `ecog-karnofsky`, `palliative-prognostic-index` |
| `opioid-conversion` | F | source dose → oral morphine equivalents → target, then a 25–50% cross-tolerance reduction; methadone/buprenorphine **excluded** (McPherson 2018) | equianalgesic + reduced starting dose, with the **independent-second-check** caveat | `opioid-mme` (surveillance MME) |
| `naranjo` | G | ten weighted yes/no/don't-know questions, including four negatives (Naranjo 1981) | total −4 to +13 → doubtful / possible / probable / definite | `opioid-mme` |

Three correctness anchors. **The ASDAS-CRP and ASDAS-ESR variants do not share
their four NRS coefficients** (0.12/0.06/0.11/0.07 vs 0.08/0.07/0.11/0.09) — a
common transcription trap; both are computed and reported when both inputs are
present, and a CRP < 2 mg/L is floored to 2 before the log term. **The 2022 GCA
biopsy and ultrasound-halo findings are one combined +5 item**, not two, and the
age-≥ 50 entry is enforced first. **`opioid-conversion` is domain-guarded**: the
equianalgesic factors are fixed positive constants, a zero/blank/negative dose
surfaces a complete-the-fields fallback rather than `Infinity`/`NaN`, and the
high-stakes rotation carries the spec-v11 §5.3 second-check note. The **proposed
eighth tile `valproate-correction` was deferred** — the spec's citation was wrong,
the Hermida-Tutor free-fraction table could not be cross-verified to ≥ 2 sources,
and a 2018 validation found it clinically inaccurate (parked with `crib-ii` /
`gail-bcrat` / `gwtg-hf` / ROKS). With v148 the **spec-v100 program is complete:
432 → 676**. See [docs/spec-v148.md](docs/spec-v148.md).

### MDCalc parity completion: the cardiology / vascular / lipid surface (spec-v100 program, Wave 1: spec-v101 → spec-v105, +25 → 457, **complete**; Wave 2 complete: spec-v106 → 463, spec-v107 → 467, spec-v108 → 473, spec-v109 → 478, spec-v110 → 483, spec-v111 → 487, **+30 → 487**; Wave 3 complete (Critical care & pulmonary): spec-v112 → 492, spec-v113 → 495, spec-v114 → 501, spec-v115 → 506, **+19 → 506**; Wave 4 underway (Neurology / neurosurgery / psychiatry): spec-v117 → 512, spec-v118 → 517, spec-v119 → 521, spec-v120 → 526, spec-v121 → 530, spec-v122 → 533, spec-v123 → 538 (**Wave 4 complete**), **+32 → 538**; Wave 5 complete (GI / hepatology / nephrology / acid-base / urology): spec-v124 → 544, spec-v125 → 549, spec-v126 → 555, spec-v127 → 559, spec-v128 → 564, spec-v129 → 570, spec-v130 → 576, spec-v131 → 584 (closes the wave at +5; ROKS deferred), **+43 → 581 from the wave; live catalog 584 incl. the standalone spec-v149 EMS parity, +3**; Wave 6 underway (Heme / onc / endocrine / ID): spec-v132 → 589 (thrombotic microangiopathy & coagulopathy, +5), spec-v133 → 593 (warfarin start-up — IWPC + Gage PGx dose, Kovacs 10 mg + Crowther 5 mg nomograms, +4, all four shipped after an adversarial re-fetch confirmed the Gage and Kovacs tables), spec-v134 → 599 (plasma-cell & myeloid-neoplasm staging — ISS, R-ISS, R2-ISS, Mayo MGUS, DIPSS, DIPSS-Plus, +6), spec-v135 → 604 (lymphoma / CLL prognostic indices — R-IPI, NCCN-IPI, GELF, Hasenclever IPS, CLL-IPI, +5), spec-v136 → 609 (endocrine / metabolic indices — HOMA-IR, QUICKI, TyG index, metabolic syndrome, OST/ORAI DXA pre-screen, +5), spec-v137 → 614 (infectious-disease scores — ISARIC 4C mortality, COVID-GRAM, Candida score, VACS index, RegiSCAR DRESS, +5, **Wave 6 complete**), **+30 → 614**; Wave 7 underway (Obstetrics / pediatrics / neonatal): spec-v138 → 620 (obstetrics & maternal-fetal medicine — Hadlock EFW, fullPIERS, miniPIERS, AFI, Barnhart hCG rise, IOM weight gain, +6, **Wave 7 opens**), spec-v139 → 626 (gynecology decision rules — Flamm VBAC, ROMA, RMI I/II/III, IOTA Simple Rules, Rotterdam PCOS, POP-Q staging, +6), spec-v140 → 631 (pediatric & neonatal severity — Kaiser EOS, SNAPPE-II, RDAI/Tal, Clinical Dehydration Scale, Koff bladder capacity, +5; CRIB-II deferred pending a second independent source for the Parry 2003 matrix), spec-v141 → 635 (pediatric growth / developmental-age — CDC 2000 BMI-for-age percentile, WHO 2006 growth z-score, Tanner mid-parental height, AAP corrected gestational age, +4 of 6: `peds-weight-est` skipped as a live spec-v149 duplicate, `gail-bcrat` deferred — its NCI BCRA incidence/competing-hazard tables ship only as binary `.rda`, not verbatim-fetchable to cross-verify per spec-v97), **Wave 7 complete, +21 → 635**; Wave 8 underway (Surgery / anesthesia / ortho / rheum / geriatrics / pharmacy): spec-v142 → 641 (surgical & anesthetic risk — POSSUM + P-POSSUM logistic morbidity/mortality, SORT 30-day-mortality logistic, Goldman 1977 cardiac index, Wilson difficult-airway sum, Sutton Surgical Risk Scale, +6, **Wave 8 opens**; SORT corrected to no-ASA-II-coefficient + mutually-exclusive age bands, Surgical Risk Scale range corrected to 3–14 from the draft's 3–17), spec-v143 → 646 (frailty & geriatric-oncology screening — mFI-5, mFI-11, FRAIL Scale, VES-13, CARG chemo-toxicity, +5; VES-13's 4-point all-or-nothing disability rule and 75–84 age band restored over two mis-printed online reproductions), spec-v144 → 652 (orthopedic fracture classification — Gustilo-Anderson open fracture I/II/IIIA–C, Garden femoral-neck I–IV, Danis-Weber ankle A/B/C, Schatzker tibial-plateau I–VI, Salter-Harris physeal I–V, Neer proximal-humerus one- to four-part, +6; the Gustilo Type III subtype keyed to coverage/perfusion not wound size, Weber dated to the 1972 monograph over a common 1966 mis-citation), spec-v145 → 657 (orthopedic risk & osteoarthritis — Frykman distal-radius I–VIII, Mirels impending-fracture 4–12, Kellgren-Lawrence OA grade 0–4, Pittsburgh knee rule, compartment delta pressure, +5; the Frykman even/odd ulnar-styloid axis, the Mirels ≥9 prophylactic-fixation flip, KL grade ≥2 as the definite-OA threshold, the entry-gated Pittsburgh mechanism, and the strict ΔP<30 mmHg fasciotomy threshold all cross-verified against ≥2 sources), spec-v146 → 662 (spinal tumor & trauma classification — SINS oncologic-instability 0–18, Revised Tokuhashi metastatic-spine prognosis 0–15, Tomita surgical-strategy 2–10, TLICS thoracolumbar triage 0–10, SLIC subaxial-cervical triage 0–10, +5; fills the spinal-scoring gap beside the existing brain/cerebrovascular neurosurgical cluster, TLICS/SLIC incomplete-cord > complete-cord and the SLIC +1 continuous-compression modifier cross-verified against ≥2 sources), spec-v147 → 669 (rheumatology activity & classification — CDAI lab-free RA activity 0–76, SDAI CRP-adding RA activity 0–86, 2010 ACR/EULAR RA classification 0–10 with the ≥6 definite flip, SLEDAI-2K SLE activity 0–105, 2015 ACR/EULAR gout with the MSU-crystal sufficient bypass and ≥8 threshold, CASPAR psoriatic-arthritis entry + ≥3 points, 2016 revised ACR fibromyalgia WPI/SSS dual-threshold, +7; the SDAI CRP mg/dL-vs-mg/L unit trap, the two negative gout items serum-urate <4 = −4 and MSU-negative synovial = −2, the SLEDAI-2K ongoing-activity credit, and the 2016 fibromyalgia somatic-count-not-severity simplification all cross-verified against ≥2 sources), spec-v148 → 676 (rheumatology / palliative / pharmacy, the **program-closing** spec — ASDAS spondyloarthritis activity, FFS-2011 vasculitis prognosis, 2022 ACR/EULAR giant-cell-arteritis classification, PPI and PaP palliative-prognosis, an opioid equianalgesic rotation converter, and the Naranjo ADR causality scale, +7; the proposed eighth tile valproate-correction was **deferred** — the spec's citation was wrong, the Hermida-Tutor free-fraction table could not be cross-verified to ≥2 sources, and a 2018 validation found it clinically inaccurate), **+41 → 676, spec-v100 program complete**)

With the spec-v85 program complete, [spec-v100](docs/spec-v100.md) charters the
**MDCalc Parity Completion** program — a roadmap that closes the remaining gaps
against the instruments a clinician expects to find — and opens **Wave 1**
(cardiology / electrophysiology / vascular / lipids). **Wave 1 is now complete**:
five feature specs shipped (432 → 457, +25 — one below the projected +26 because
spec-v102 deferred `gwtg-hf`), all under the same determinism /
primary-source-citation / output-safety doctrine, each tile fuzz-covered by the
spec-v59 harness:

- **[spec-v101](docs/spec-v101.md) (+5 → 437)** — atrial-fibrillation stroke-risk
  and QT instruments beside the existing combined `chads` view: `chads2` (Gage
  2001 + NRAF stroke-rate table), `cha2ds2-va` (2024 ESC, sex point removed),
  `chads-65` (2020 CCS/CHRS pathway), `atria-stroke` (Singer 2013), `tisdale-qtc`
  (inpatient QT-prolongation risk). `lib/cardio-v101.js`.
- **[spec-v102](docs/spec-v102.md) (+4 → 441)** — heart-failure prognosis, HFpEF
  likelihood, and cardiogenic-shock mortality: `maggic` (Pocock 2013, with the
  age×EF / SBP×EF interactions and the 0–50 mortality lookup), `h2fpef` (Reddy
  2018), `hfa-peff` (2019 ESC HFA, **Class B**), `cardshock-score` (Harjola 2015).
  `lib/cardio-v102.js`. The proposed `gwtg-hf` was **deferred, not shipped** — its
  per-band point table could not be verified from a reachable primary source, and
  this catalog does not ship fabricated scoring weights.
- **[spec-v103](docs/spec-v103.md) (+6 → 447)** — the **CV-risk & prevention
  engines** below, which *complement, never replace,* the existing `ascvd`
  (Pooled Cohort) and `prevent` tiles. Each cross-links them and states its
  derivation population so the clinician picks the right engine for the patient.
  `lib/cvrisk-v103.js` + `views/group-v28.js`.
- **[spec-v104](docs/spec-v104.md) (+6 → 453)** — **ECG arrhythmia, aortic &
  syncope decision rules** beside the existing `ecg-axis` / `lvh-criteria` tiles:
  the two wide-complex-tachycardia step algorithms (`brugada-vt`, `vereckei-avr`),
  the `add-rs` aortic-dissection pretest score with the optional D-dimer rule-out
  note, and the three ED syncope instruments (`rose-syncope`, `egsys`, `oesil`).
  All six **Class A**. `lib/cardio-v104.js` + `views/group-v29.js`. Detailed below.
- **[spec-v105](docs/spec-v105.md) (+4 → 457, closes Wave 1)** — **peripheral-artery
  and cardiac-surgery risk**: `abi` (the ankle-brachial index with the five PAD
  bands, Group E), the `rutherford-fontaine` PAD-stage mapper, the `wifi` SVS
  limb-threat classification, and the `euroscore2` cardiac-surgery mortality engine.
  Adds the `vascular-surgery` specialty. `lib/vascular-v105.js` +
  `views/group-v30.js`. Detailed below.

| id | Group | Model | Output | Class |
|---|---|---|---|---|
| `score2` | G | SCORE2 (ESC 2021, age 40–69): sex-specific LP on centered age/SBP/TC/HDL (mmol/L)/smoking → `1 − S0^exp(LP)`, then the per-region cloglog recalibration | 10-yr fatal + non-fatal CVD risk %, ESC age-banded category, by European risk region | **B** |
| `score2-op` | G | SCORE2-OP (ESC 2021, age ≥ 70): adds diabetes, centered at 73 / 150 / 6 / 1.4, `1 − S0^exp(LP − mean)` + recalibration | 10-yr CVD risk %, ESC category | **B** |
| `mesa-chd` | G | MESA (McClelland 2015): penalized Cox on raw mg/dL factors; with-CAC adds `0.2743·ln(Agatston+1)` | 10-yr CHD risk % **with and without** coronary calcium | A |
| `framingham-cvd` | G | Framingham general CVD (D'Agostino 2008): sex-specific Cox on ln-transformed predictors | 10-yr general-CVD risk % + **vascular age** | A |
| `reynolds-risk` | G | Reynolds (Ridker 2007 women / 2008 men): adds hsCRP + parental MI history | 10-yr CVD risk % | A |
| `non-hdl-remnant` | E | non-HDL = TC − HDL; remnant = TC − HDL − LDL (Varbo 2013) | atherogenic non-HDL + remnant cholesterol, unit preserved | A |

Two correctness anchors. **Coefficients were re-fetched, never recalled** (the
spec-v97 rule): the SCORE2 / SCORE2-OP region tables are a compiled constant
transcribed from the published *Eur Heart J* 2021 supplement and cross-verified
against the CRAN `RiskScorescvd` source — the implementation **reproduces the two
ESC published worked examples exactly** (a 50-year-old smoker, SBP 140, TC 5.5,
HDL 1.3 mmol/L lands at 5.9% in a low-risk region and 14.0% in a very-high-risk
region for men; 4.2% and 13.7% for women), and the Framingham and Reynolds engines
reproduce their papers' worked cases. **Every logistic/Cox exponent is clamped to an
overflow-safe range and every `ln()` term is domain-guarded**, so the spec-v59 fuzz
harness sees zero non-finite leaks; an unrecognized SCORE2 region returns a surfaced
fallback rather than reading `undefined` coefficients, and an implausible negative
remnant (LDL + HDL > TC) is flagged rather than printed. `score2` / `score2-op` are
**Class B** with [citation-staleness](docs/citation-staleness.md) rows (ESC region
recalibration); the other four are **Class A**.

#### spec-v104 — ECG arrhythmia, aortic & syncope (+6 → 453)

The catalog had the `ecg-axis` and `lvh-criteria` ECG tiles but none of the
bedside criteria an ED physician uses to *call* a wide-complex tachycardia, screen
for aortic dissection, or risk-stratify syncope. spec-v104 fills that gap with six
published, deterministic instruments — two boolean step algorithms, one category
count, and three point/criterion scores:

| id | Group | Rule | Output |
|---|---|---|---|
| `brugada-vt` | G | Brugada 1991 four-step VT-vs-SVT algorithm | first positive of (no RS in any precordial lead → R-S > 100 ms → AV dissociation → V1-2 & V6 morphology) ⇒ **VT**; all-negative ⇒ SVT with aberrancy |
| `vereckei-avr` | G | Vereckei 2008 lead-aVR four-step algorithm | first positive of (initial R → initial r/q > 40 ms → notch on negative-onset downstroke → vi/vt ≤ 1) ⇒ **VT**; all-negative ⇒ supraventricular |
| `add-rs` | G | Rogers 2011 Aortic Dissection Detection Risk Score | category count 0–3 (predisposing / pain / exam) → low / intermediate / high, **+ optional ADD-RS-D D-dimer < 500 ng/mL rule-out note** for ADD-RS ≤ 1 |
| `rose-syncope` | G | Reed 2010 ROSE rule (BRACES + bradycardia) | **any** of 7 criteria positive ⇒ high risk (1-month serious outcome / death) |
| `egsys` | G | Del Rosso 2008 EGSYS cardiac-syncope probability | signed-weight sum −2 to +12; **score ≥ 3 suggests cardiac syncope** |
| `oesil` | G | Colivicchi 2003 OESIL risk score | point sum 0–4 → published 12-month mortality (0 / 0.8 / 19.6 / 34.7 / 57.1 %) |

**Source-governs correction (the spec-v97 rule, applied to the prose this time).**
The spec-v104 draft described EGSYS with "syncope during effort *or* supine (3)" as
one item and the two −1 terms as scored on *absence*. Verification against the
primary Del Rosso 2008 paper **and** MDCalc found both wrong: effort (+3) and
supine (+2) are **separate items with distinct weights**, and the precipitating-
factors / autonomic-prodrome terms score −1 when **present** (they argue toward
reflex syncope). The implementation follows the source — true range **−2 to +12**
(the positive weights sum to the universally-cited maximum of 12), not the draft's
−2 to +10 — and the deviation is logged in `docs/audits/v12/egsys.md`. The boolean
step rules return a defined verdict on a fully-negative input; `egsys` bounds its
signed sum and `oesil` / `add-rs` index fixed lookups by a clamped total, so the
spec-v59 fuzz harness sees zero non-finite leaks. All six citations name a journal
+ authors (the ADD-RS title's "guideline-based" phrasing names no society acronym),
so all six are **Class A** — no citation-staleness rows.

#### spec-v105 — vascular & cardiac surgery (+4 → 457, closes Wave 1)

The catalog had no peripheral-artery-disease bedside math and no cardiac-surgery
mortality engine. spec-v105 adds the four instruments a vascular or cardiac surgeon
reaches for, and **closes Wave 1** of the spec-v100 program:

| id | Group | Model | Output | Class |
|---|---|---|---|---|
| `abi` | E | ankle systolic (higher of DP/PT) ÷ higher brachial systolic, per leg (Aboyans 2012) | ABI per leg; lower index governs; bands > 1.40 non-compressible / 1.00–1.40 normal / 0.91–0.99 borderline / 0.41–0.90 mild-mod PAD / ≤ 0.40 severe | A |
| `rutherford-fontaine` | G | Rutherford category 0–6 ↔ Fontaine stage I–IV mapping (Rutherford 1997) | the category/stage pair + chronic-limb-ischemia interpretation | **B** |
| `wifi` | G | SVS WIfI Wound/Ischemia/foot-Infection grade triple against the Mills 2014 64-cell expert-panel grid | clinical stage 1–4 (very low → high 1-yr amputation risk) | **B** |
| `euroscore2` | G | EuroSCORE II logistic `e^y/(1+e^y)`, y = −5.324537 + Table 6 multivariate β (Nashef 2012) | predicted in-hospital cardiac-surgery mortality % + risk tier | A |

**Two correctness anchors, both re-fetched, never recalled (the spec-v97 rule).**
(1) The **EuroSCORE II age coefficient is 0.0285181** — the Nashef 2012 *Eur J
Cardiothorac Surg* Table 6 multivariate value. The spec draft carried 0.0666354,
which is the legacy logistic **EuroSCORE I** age coefficient; compiling it would
over-estimate every prediction. The 30-coefficient block was transcribed verbatim
and cross-verified against two independent sources; the model **reproduces the
published worked example exactly** (a 70-year-old dialysis-dependent woman with
insulin diabetes, COPD, NYHA III, CCS-4, poor LV, and a recent MI for isolated
elective CABG gives y = −2.126358 → **10.66%**). The on-dialysis coefficient is
*lower* than CrCl ≤ 50 without dialysis — a published quirk of the model, reproduced
rather than "corrected." (2) The **WIfI grid is the amputation-risk table**, not the
separate revascularization-benefit table; all 64 cells were cross-verified across two
reproductions. **`abi` guards its brachial divisor for > 0** (a blank/zero brachial
returns a surfaced fallback, never `ankle/0`) and reads the band off the rounded
ratio so the shown index matches its band; **`euroscore2` clamps its logistic
exponent to [−40, 40]** so an extreme fuzzed input returns a probability in [0, 1]
rather than `Infinity`. `rutherford-fontaine` and `wifi` are **Class B** with
[citation-staleness](docs/citation-staleness.md) rows (SVS reporting/classification
standards, on-publication cadence); `abi` and `euroscore2` are **Class A**.

#### spec-v106 — VTE workup algorithms (+6 → 463, opens Wave 2)

Wave 2 of the spec-v100 program turns to **emergency / triage** surface. The
catalog already carried the front-line VTE pretest tools (`wells-pe`, `wells-dvt`,
`perc`, `years-pe`) and the prognostic `pesi` / `spesi` set, but six standard
venous-thromboembolism workup instruments — each occupying a distinct decision
point in the pathway — were absent. spec-v106 adds them, all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `peged` | G | Kearon 2019 graduated D-dimer: 3-tier Wells C-PTP × a probability-graduated D-dimer threshold | low C-PTP excluded if D-dimer < 1000, moderate if < 500, high always images (ng/mL FEU) | A |
| `4peps` | G | Roy 2021 13-item weighted pretest score (−5…+21) | four tiers (very low / low / moderate / high), each selecting a D-dimer strategy (no test / < 1000 / age-adjusted / direct imaging) | A |
| `bova-pe` | G | Bova 2014 score for normotensive confirmed PE: sBP 90–100 (2), troponin (2), RV dysfunction (2), HR ≥ 110 (1) | total 0–7 → Stage I/II/III with 30-day complication & PE-mortality framing | A |
| `hestia` | G | Zondag 2011 11-item outpatient-eligibility checklist | any single positive item ⇒ not a home-treatment candidate; all-negative ⇒ eligible | A |
| `geneva-original` | G | Wicki 2001 fully objective pre-Wells model (clinical + ABG + chest film), total 0–16 | low 0–4 (~10% PE) / intermediate 5–8 (~38%) / high ≥ 9 (~81%) | A |
| `constans-uedvt` | G | Constans 2008 upper-extremity-DVT pretest: venous material (+1), localized pain (+1), unilateral edema (+1), alternative diagnosis (−1) | signed total −1…+3 → low ≤ 0 / intermediate 1 / high 2–3 | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
across the primary paper + MDCalc / a clinical reference.** The 4PEPS item weights
(age < 50 −2 / 50–64 −1, chronic respiratory disease −1, HR < 80 −1, chest pain +
dyspnea +1, male +2, estrogen +2, prior VTE +2, syncope +2, immobility +2, SpO₂ <
95% +3, calf pain/edema +3, PE most likely +5) and the four tier cutoffs were
transcribed verbatim; the original Geneva ABG bands are encoded in **both kPa and
the rounded mmHg conversions** (PaCO₂ < 36 mmHg / < 4.8 kPa +2, PaO₂ < 48.7 mmHg /
< 6.5 kPa +4, …) because the Wicki paper reports SI units. `peged` and `4peps` are
**strategy selectors**: a missing tier or D-dimer renders a complete-the-fields
fallback rather than a verdict from a missing value. `constans-uedvt` carries the
signed −1 term and keys its band on the signed sum, not its absolute value. Every
total is clamped to its published range and the band is read off the clamped value,
so the spec-v59 fuzz harness sees zero non-finite leaks. All six citations name a
journal + authors (NEJM, JAMA Cardiol, Eur Respir J, J Thromb Haemost, Arch Intern
Med, Thromb Haemost) — none trips the issuer pattern, so all six are **Class A**
with no citation-staleness rows. `lib/vte-v106.js` + `views/group-v31.js`.

#### spec-v107 — ED decision rules & resuscitation (+4 → 467)

Wave 2 continues with four standard **emergency-department decision rules and
resuscitation-risk scores** that sit in the gaps between the chest-pain
(`heart`, `edacs`), head-CT (`pecarn-head`, `catch-head`), and ICU-physiology
(`apache2`, `qsofa-sofa`) clusters already in the catalog. spec-v107 adds them,
all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `hear` | G | Moumneh 2021 HEAR — the troponin-free HEART subset: History + ECG + Age + Risk factors, each 0/1/2 | total 0–8; **HEAR ≤ 1** is the very-low-risk pre-troponin band (~0.4% 30-day MACE) | A |
| `new-orleans-head` | G | Haydel 2000 New Orleans Criteria: 7 items in GCS-15 minor blunt head injury | **any single positive ⇒ head CT**; 100% sensitive, low specificity (flags any CT finding) | A |
| `go-far` | G | Ebell 2013 GO-FAR: pre-arrest CPC-1 good-outcome probability after in-hospital arrest; neuro-intact −15, comorbidity/age add | total −15…+76 → ≤ −6 above average (> 15%) / −5…13 average (3–15%) / 14–23 low (1–3%) / ≥ 24 very low (< 1%) | A |
| `macocha` | G | De Jong 2013 MACOCHA: ICU difficult-intubation factors — Mallampati III/IV (5), OSA (2), cervical (1), mouth < 3 cm (1), coma (1), SpO₂ < 80% (1), non-anesthesiologist (1) | total 0–12; **≥ 3** flags elevated risk (sens 73%, NPV 98%) | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc.** The notable catch was GO-FAR: the "−15 to 11"
figure quoted by some secondary sources is the **per-variable point spread, not the
total-score range** (−15…+76), and the `≥ 24` "very low" band is reachable only
because MDCalc treats the admission/comorbidity items as **independent additive
rows** (no mutual-exclusivity enforcement) — shipping the category cut-points
without reconciling that contradiction would have mis-banded high scores. `hear` and
`go-far` require the numeric age and render a complete-the-fields fallback when it is
missing; every total is clamped to its published range and the band is read off the
clamped value, so the spec-v59 fuzz harness sees zero non-finite leaks. All four
citations name a journal + authors (Eur J Emerg Med, NEJM, JAMA Intern Med, AJRCCM)
— none trips the issuer pattern, so all four are **Class A** with no
citation-staleness rows. `go-far` carries the explicit posture that the score
informs, never decides, a goals-of-care discussion. `lib/eddecision-v107.js` +
`views/group-v32.js`.

#### spec-v108 — Trauma severity scores & decision rules (+6 → 473)

Wave 2 continues with six standard **trauma severity scores and decision rules**.
The catalog carried `iss-rts` (ISS + Revised Trauma Score) and `abc-mtp` (the ABC
massive-transfusion rule), but the benchmark outcome model, the modern severity
index, the two massive-transfusion probability tools, the pupil-adjusted GCS, and
the chest-CT rule-out were all absent. spec-v108 adds them — `triss` and `niss` in
Group E, the rest in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `triss` | E | Boyd 1987 TRISS (MTOS coefficients): Ps = 1/(1+e^−b), b from coded RTS, ISS, age index, blunt/penetrating set | **probability of survival %**; band-flips between coefficient sets on the same inputs | A |
| `niss` | E | Osler 1997 NISS: sum of squares of the three worst AIS, **any region** | up to 75; any AIS 6 forces 75; NISS ≥ 16 = major trauma | A |
| `tash-score` | G | Yücel 2006 TASH: weighted Hb/BE/SBP/HR + FAST/pelvis/femur/sex | total 0–31 → logistic **P(mass transfusion)** = 1/(1+e^−(−4.9+0.3·TASH)) | A |
| `rabt-score` | G | Joseph 2018 RABT: shock index > 1, pelvic fracture, penetrating, FAST | total 0–4; **≥ 2** predicts massive transfusion (sens 84%, spec 77%) | A |
| `gcs-pupils` | G | Brennan 2018 GCS-P: GCS total − pupil reactivity penalty (0/1/2) | index **1–15** (penalty cannot drop it below 1) | A |
| `nexus-chest-ct` | G | Rodriguez 2015 NEXUS Chest CT: 7 criteria in blunt thoracic trauma | **all negative ⇒ defer CT**; any positive ⇒ CT may be indicated | A |

**Coefficients re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc.** The TRISS blunt/penetrating coefficient sets
shipped are the **MTOS-1995 revision** values MDCalc serves (the literal 1987 paper
published a smaller first set) — the citation names both. The TASH logistic sign is
`−4.9 + 0.3·TASH` (rejecting the `−0.3` transcription variants some secondary
sources carry), reproducing the published ~50% anchor near a total of 16, and the
additive max is 31 (MDCalc) rather than the abstract's 28. `triss` and `tash-score`
clamp their logistic exponent to a finite range so a fuzz-extreme ISS or TASH total
resolves to a finite probability rather than `Infinity`; `niss` clamps each AIS and
applies the AIS-6 → 75 convention; `gcs-pupils` bounds the index to 1–15. All six
citations name a journal + authors (J Trauma, World J Surg, J Neurosurg, PLoS Med)
— none trips the issuer pattern, so all six are **Class A** with no
citation-staleness rows. `lib/trauma-v108.js` + `views/group-v33.js`.

#### spec-v109 — Trauma classification & soft-tissue infection (+5 → 478)

Wave 2 continues with five standard **trauma-classification and soft-tissue-
infection decision rules**. The catalog carried the trauma-physiology scores
(`iss-rts`, `triss`, the massive-transfusion tools) and the skin-infection
disposition surface, but the screening, grading, and salvage instruments below
were absent. spec-v109 adds them, all in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `denver-bcvi` | G | Burlew 2012 Expanded Denver Criteria: 6 signs/symptoms + 6 high-energy-mechanism risk factors for blunt cerebrovascular injury | **any single positive ⇒ CT angiography screening**; none met ⇒ not indicated | B |
| `aast-organ-injury` | G | Kozar 2018 AAST Organ Injury Scale: spleen/liver/kidney decision tree, worst anatomic finding + the 2018 vascular rule | **AAST grade I–V**, the higher of the anatomic and vascular-rule grade | B |
| `mangled-extremity` | G | Johansen 1990 MESS: skeletal energy + limb ischemia (×2 if > 6 h) + shock + age | total ~2–14; **≥ 7** historically associated with amputation | A |
| `lrinec` | G | Wong 2004 LRINEC: CRP/WBC/Hb/Na/creatinine/glucose banded | total 0–13 → low ≤ 5 / intermediate 6–7 / **high ≥ 8**; ≥ 6 raises suspicion | A |
| `alt-70` | G | Raff 2017 ALT-70: Asymmetry 3, Leukocytosis 1, Tachycardia 1, age ≥ 70 = 2 | total 0–7 → ≤ 2 unlikely / 3–4 indeterminate / **≥ 5 cellulitis likely** | A |

**Criteria re-fetched, never recalled (the spec-v97 rule), each cross-verified
against the primary paper + MDCalc / RadioGraphics / EAST guideline.** The
notable transcription catches: the AAST 2018 **contained-vs-extending vascular
rule** is grade-specific per organ (spleen contained IV / beyond V; liver and
kidney contained III / beyond IV) — `aast-organ-injury` walks it as a per-organ
decision tree (the anatomic-finding select rebuilds when the organ changes), not
a browsable atlas, and returns the higher of the anatomic and vascular grade. The
MESS **ischemia-time doubling** raises the ceiling from 11 to 14 and is applied
before summing; `mangled-extremity` renders that it doubled. The LRINEC CRP
threshold is **150 mg/L = 15 mg/dL** (the most common unit-confusion error), and
the probability bands (≤ 5 / 6–7 / ≥ 8) are distinct from the ≥ 6 suspicion
cutoff. `denver-bcvi` and `aast-organ-injury` are **Class B** — the EAST/society
screening criteria and the periodically-revised AAST scales each carry a
`docs/citation-staleness.md` row (documentation-only: the citations name a journal
+ authors, not an issuer acronym, so the row is not gate-forced but records the
edition in force); the other three are **Class A**. None authors a CTA,
debridement, antibiotic, or amputation order — the `mangled-extremity` posture note
states explicitly that the score informs, never dictates, the salvage decision.
`lib/traumaclass-v109.js` + `views/group-v34.js`.

#### spec-v110 — Toxicology dosing & dialysis decisions (+5 → 483)

Wave 2 continues with five standard **poison-center / ED toxicology dosing and
dialysis-decision tools**. The catalog carried the `acetaminophen-nomogram`
treatment line and the `serotonin-toxicity` / `salicylate-toxicity` /
`toxic-alcohol` decision rules, but the high-frequency *dosing* math a clinician
does by hand at the bedside was absent. spec-v110 adds it — the four dosing
instruments in Group F (Medication & Infusion), the dialysis decision in Group G:

| id | Group | Rule | Output | Class |
|---|---|---|---|---|
| `digifab-dosing` | F | Smith 1982 / product label: vials by amount ingested (mg × 0.8 / 0.5), steady-state level (level × weight / 100), or empiric | **whole vials, rounded up**, formula shown | A |
| `nac-dosing` | F | Prescott 1979 three-bag (150/50/100 mg/kg) or Bateman 2014 two-bag SNAP (200/100 mg/kg), dosing weight capped at 110 kg | **per-bag mg + durations**, cap applied & shown | A |
| `hiet-dosing` | F | Engebretsen 2011: bolus 1 unit/kg, infusion 1 unit/kg/hr → **10 unit/kg/hr ceiling** | **bolus + infusion units**, entered rate clamped to the ceiling | A |
| `tca-bicarbonate` | F | Boehnert 1985: QRS ≥ 100 ms seizures, ≥ 160 ms ventricular arrhythmias | **risk band + 1–2 mEq/kg bolus**, target pH 7.45–7.55 | A |
| `lithium-extrip` | G | Decker 2015 EXTRIP: life-threatening features / renal + level > 4.0 / level > 5.0 / confusion / slow clearance | **ECTR recommended / suggested / not indicated**, firing limb named | B |

**Every dosing tile renders the high-stakes second-check caveat** (the spec-v100
§2 clause-5 requirement): the tile computes the figure, but the indication,
timing, and route stay with the clinician, poison center, and local protocol.
**Formulas re-fetched, never recalled (the spec-v97 rule).** Two source-governance
catches: (1) the NAC **110-kg dosing-weight cap** is a `Math.min` that clamps a
120-kg patient's bag doses to the 110-kg values (16500 / 5500 / 11000 mg on the
three-bag regimen) and the band says so; (2) `lithium-extrip` follows the EXTRIP
**source over the spec prose** — the spec draft put the "expected time to a level
< 1.0 mmol/L exceeds 36 h" limb in the *recommended* set, but Decker 2015 places
it (with level > 5.0 and confusion) in the **suggested** set, so the tile does
too. `lithium-extrip` is **Class B** (a `docs/citation-staleness.md` row records
the EXTRIP 2015 edition in force); the four dosing tiles are **Class A**.
`lib/tox-v110.js` + `views/group-v35.js`.

#### spec-v111 — Environmental & wilderness medicine (+4 → 487, **Wave 2 complete**)

Wave 2 **closes** with four standard **environmental / wilderness-medicine
severity scores and classifications**. The catalog carried the
`hypothermia-rewarm` Swiss-staging tile, but the reference severity grading for
four common exposures was reachable nowhere. All four home in **Group I (EMS &
Field)**, cross-linked from Clinical Scoring (Group G):

| id | Rule | Output | Class |
|---|---|---|---|
| `lake-louise-ams` | Roach 2018 Lake Louise AMS: four symptoms (headache, GI, fatigue, dizziness) each 0–3 | **total 0–12 + headache-required gate**, mild 3–5 / moderate 6–9 / severe 10–12 | A |
| `szpilman-drowning` | Szpilman 1997 decision tree on cough / auscultation / edema / hypotension / arrest | **grade Rescue/1–6/Dead + original-series mortality** (0 → 93%) | B |
| `snakebite-severity` | Dart 1996 SSS: six body-system subscores (pulmonary, CV, local, GI, heme, CNS) | **total 0–20, continuous index** with per-system breakdown | A |
| `cauchy-frostbite` | Cauchy 2001: day-0 topography + day-2 bone scan + day-2 blisters | **grade 1–4 + amputation/sequelae prognosis**, most-severe finding governs | A |

**Three source-governance catches** (the spec-v97 re-fetch rule): (1)
`lake-louise-ams` enforces the **headache-required gate** — a total ≥ 3 *without*
a headache does **not** diagnose AMS, and the 2018 revision dropped the sleep
item (so the score is 0–12, not the legacy 0–15); (2) `snakebite-severity`
follows the **source over the spec prose** — Dart 1996 validated the SSS as a
*continuous* severity index and defines **no** fixed minimal/moderate/severe
total-score cutoffs (the 0–3/4–7/≥8 bands circulated online belong to a
different modified 7-system instrument), so the tile reports the continuous total
and labels its descriptor as a *relative* reading of the 0–20 range; (3)
`cauchy-frostbite` Grade-4 prognosis is **"functional sequelae"** per the NEJM
2022 reproduction of Cauchy's table, not the unverified "general/systemic"
paraphrase. `szpilman-drowning` is **Class B** (a `docs/citation-staleness.md`
row records the Szpilman 1997 edition in force); the other three are **Class A**.
Each tile renders the spec-v50 §3 field-posture note: it grades severity and
frames mortality / amputation risk to inform triage and transport, it does not
author a descent, antivenom, debridement, or amputation order.
`lib/enviro-v111.js` + `views/group-v36.js`. **This closes Wave 2 of the
spec-v100 program (457 → 487, +30).**

#### spec-v117 — stroke imaging & thrombolysis prognosis (+6 → 512, opens Wave 4)

Wave 4 (Neurology / neurosurgery / psychiatry) **opens** with the six
imaging-prognosis and thrombolysis-risk instruments the stroke team computes the
moment the NCCT/CTA is read and tPA is on the table. The catalog had the stroke
*severity* and *disposition* tools (`nihss`, `abcd2`, `ich-score`) but not the
imaging-derived scores that gate reperfusion. Five home in **Clinical Scoring &
Risk (Group G)**; `ich-volume-abc2` is **Clinical Math & Conversions (Group E)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `aspects` | Barber 2000 Alberta Stroke Program Early CT Score — 10 minus one point per affected MCA region (caudate, lentiform, internal capsule, insula, M1–M6) | **0–10, dichotomized at ≤ 7 (worse outcome, higher symptomatic-hemorrhage risk)** | B |
| `ich-volume-abc2` | Kothari 1996 ellipsoid hematoma volume — A × B × C / 2 (cm → mL) | **volume in mL; ≥ 30 mL flagged as the `ich-score` threshold** | A |
| `dragon-stroke` | Strbian 2012 DRAGON — CT signs + prestroke mRS + age + glucose + onset-to-treatment + NIHSS | **0–10, favorable 0–3 / intermediate 4–7 / miserable 8–10 (good outcome ~96% at 0–1, ~0% at 8–10)** | A |
| `hat-score` | Lou 2008 Hemorrhage After Thrombolysis — NIHSS + CT hypodensity + diabetes/glucose | **0–5, symptomatic ICH 2 / 5 / 10 / 15 / 44%** | A |
| `sedan-score` | Strbian 2012 SEDAN — glucose + early infarct + dense artery + age > 75 + NIHSS ≥ 10 | **0–6, symptomatic ICH 1.4 / 2.9 / 8.5 / 12.2 / 21.7 / 33.3%** | A |
| `thrive-stroke` | Flint 2010 THRIVE — NIHSS + age + hypertension/diabetes/atrial-fibrillation count | **0–9, THRIVE I (0–2, 64.7% good / 5.9% mortality) / II (3–5) / III (6–9, 10.6% / 56.4%)** | A |

The four point-sum scores **re-fetch the published point tables and outcome
bands verbatim** (the spec-v97 discipline), cross-verified across the derivation
papers, MDCalc, and PMC reproductions. Where a source does **not** publish a
per-score rate — DRAGON's middle range (4–7) and THRIVE's middle band (3–5) —
the tile bands it *intermediate* and quotes only the robust published extremes
rather than inventing a number (the project's no-fabrication rule). HAT's and
SEDAN's symptomatic-ICH series are reproduced verbatim from the papers.
`ich-volume-abc2` guards each diameter (non-negative, finite) and its division;
`aspects` clamps 0–10. Each tile **reports the score/volume, not the order**
(spec-v11 §5.3): the thrombolysis, thrombectomy, surveillance, and surgical
decisions stay with the stroke team and local protocol. Five are **Class A**;
`aspects` is **Class B** (an imaging-read convention applied through evolving
reperfusion guidelines → a documentation-only `docs/citation-staleness.md` row).
`lib/neuro-v117.js` + `views/group-v117.js`. **This opens Wave 4 of the
spec-v100 program (506 → 512, +6).**

#### spec-v127 — nephrology prognosis & AKI staging: KFRE, RIFLE, AKIN, ultrafiltration rate (+4 → 559, Wave 5)

Wave 5 turns to the nephrology prognosis and acute-injury-staging instruments beside
`egfr-suite`, `ckd-staging`, `ktv-urr`, and `kdigo-aki`. `kfre`, `rifle-aki`, and
`akin-aki` are in **Clinical Scoring & Risk (Group G)**; `ufr-dialysis` is **Clinical
Math & Conversions (Group E)**:

| id | Rule | Output |
|---|---|---|
| `kfre` | Tangri 2011 — 1 − S₀^exp(Σ centered terms), 4- or 8-variable | **2- & 5-year probability of treated kidney failure** |
| `rifle-aki` | Bellomo 2004 (ADQI) — worst of creatinine/GFR and urine output | **Risk / Injury / Failure** |
| `akin-aki` | Mehta 2007 (AKIN) — 48-h window, RRT forces stage 3 | **stage 1 / 2 / 3** |
| `ufr-dialysis` | Flythe 2011 — volume / (weight × hours) | **mL/kg/hr; > 13 CV-risk flag** |

All four **re-fetch the coefficients / criteria verbatim** (the spec-v97 discipline),
cross-verified across ≥ 2 independent sources. The KFRE re-fetch resolved two real
traps: the model uses the **North American baseline survivals** (4-variable S₀ = 0.9750
at 2 years / **0.9240** at 5 years — not the 0.9365 non-North-American value), and the
**ACR term is in mg/mmol**, so a US spot UACR in mg/g is divided by 8.84 before the log
(several published calculators mislabel this). The logistic is overflow-safe
(`1 − S₀^exp(lp)` clamped to 0–1, never `NaN` for an extreme linear predictor); RIFLE's
Failure acute-rise limb is strict `> 0.5` while AKIN's stage-3 limb is `≥ 0.5` (the
operators genuinely differ — kept distinct); and `ufr-dialysis` guards its
weight/hours denominators. Each tile reports the probability / class / rate, **not**
management (spec-v11 §5.3). All four are **Class A** (journal + author citations — KDIGO
/ ADQI / AKIN acronyms deliberately kept off the strings — no staleness row).
`lib/nephro-v127.js` + `views/group-v127.js`. **Catalog 555 → 559, +4.**

#### spec-v149 — roughlogic.com EMS-group parity: pediatric weight estimate, PALS vitals, drug draw-up volume (+3 → 579, standalone)

A standalone spec (not part of the spec-v100 program, which reserves v101–v148). A
cross-catalog audit of roughlogic.com's EMS group (27 tools) found 24 already
covered; v149 ports the **3** genuinely-missing pre-hospital / field calculators,
all in **EMS & Field (Group I)** with the `field` audience, re-grounded in their
primary clinical sources:

| id | Rule | Output |
|---|---|---|
| `peds-weight-est` | APLS (*Advanced Paediatric Life Support* 6th ed.) | **age → weight kg** (0–12 mo (mo/2)+4; 1–5 yr (2·yr)+8; 6–12 yr (3·yr)+7) |
| `peds-vitals` | AHA PALS Provider Manual 2020 | **age-band normal HR/RR/SBP + computed hypotension SBP** |
| `dose-volume` | draw-up math | **bolus volume mL = dose ÷ stock concentration** |

`peds-vitals` is **Class B** (the "AHA" citation trips `ISSUER_PATTERN`, so it
carries a `docs/citation-staleness.md` row); the other two are Class A.
`lib/ems-v149.js` + `views/group-v149.js`. **Catalog 576 → 579, +3.**

#### spec-v139 — gynecology decision rules: Flamm VBAC, ROMA, RMI, IOTA Simple Rules, Rotterdam PCOS, POP-Q (+6 → 626, **Wave 7**)

v139 continues **Wave 7** with the general-gynecology decision-rule cluster — the
labor unit, the gyn-onc clinic, the reproductive-endocrine clinic, and the
urogynecology exam room. All six land in **Clinical Scoring & Risk (Group G)** and
report the score / index / verdict and the source's framing without authoring a
counsel / refer / image / treat directive in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `flamm-vbac` | Flamm & Geiger 1997 (*Obstet Gynecol*) | **Admission VBAC-success score 0–10** from five factors (age < 40, prior vaginal birth, prior cesarean not for failure-to-progress, effacement, dilation ≥ 4 cm) → predicted success 49% (0–2) … 95% (8–10). **Free substitute for the paywalled Grobman MFMU model** |
| `roma-ovarian` | Moore 2009 (*Gynecol Oncol*) | **Logistic ROMA%** = `100·exp(PI)/(1+exp(PI))` with **natural-log HE4 + CA-125 terms**; high-risk cut-point ≈ 13.1% premenopausal / 27.7% postmenopausal. **Class B** (assay-platform-dependent cutoff) |
| `rmi-ovarian` | Jacobs 1990 (*BJOG*) / Tingulstad | **RMI = U × M × CA-125** over five ultrasound features; the U/M scaling switches across **RMI I / II / III**; > 200 the conventional gyn-onc-referral threshold |
| `iota-simple-rules` | Timmerman 2008 (*Ultrasound Obstet Gynecol*) | **Benign / malignant / inconclusive** from five B and five M descriptors (≥ 1 B & no M = benign; ≥ 1 M & no B = malignant; both/neither = inconclusive). **Free substitute for the IOTA ADNEX model** |
| `rotterdam-pcos` | ESHRE/ASRM 2003 (*Hum Reprod*) | **Two-of-three** (oligo/anovulation, hyperandrogenism, polycystic morphology) **after exclusion of mimics**, naming the phenotype A–D. **Class B** (revisable consensus) |
| `popq-staging` | Bump 1996 (*Am J Obstet Gynecol*) | **POP-Q stage 0–IV** from the leading edge (most positive of Aa/Ba/C/D/Ap/Bp vs the hymen) and TVL; point D optional after hysterectomy |

**Every coefficient block, point weight, and threshold was re-fetched from a primary
source and cross-verified across ≥2 independent sources, never recalled** (the
spec-v97 discipline). The `roma-ovarian` logistic guards its `ln(HE4)` / `ln(CA-125)`
domains for non-positive markers and clamps its exponent to `[−40, 40]`, so ROMA% is
never `NaN` or `Infinity`; all six flow through the spec-v59 fuzz harness with zero
non-finite leaks. `flamm-vbac`, `rmi-ovarian`, `iota-simple-rules`, and `popq-staging`
are **Class A**; `roma-ovarian` and `rotterdam-pcos` are **Class B** (their citations
name a journal/authors and the ESHRE/ASRM group — none in the issuer-acronym set — so
their citation-staleness rows are documentation-only, not gate-forced). The catalog
vocab has no `urogynecology` term, so `popq-staging` is tagged `obstetrics-gynecology`
(flagged in the spec + audit). `lib/gyn-v139.js` + `views/group-v139.js` (`RV139`).
**Catalog 620 → 626, +6.**

#### spec-v138 — obstetrics & maternal-fetal medicine: Hadlock EFW, fullPIERS, miniPIERS, AFI, Barnhart hCG rise, IOM weight gain (+6 → 620, **Wave 7 opens**)

v138 opens **Wave 7** (obstetrics / pediatrics / neonatal) by bringing the
obstetrics and maternal-fetal-medicine cluster onto the page beside the dating and
induction tiles (`due-date`, `preg-dating`, `bishop`, `bpp`). `hadlock-efw`, `afi`,
`barnhart-hcg`, and `iom-gwg` read in **Clinical Math & Conversions (Group E)**;
`fullpiers` and `minipiers` in **Clinical Scoring & Risk (Group G)**. Each reports
the estimate / probability / range and the source's framing without authoring an
image / deliver / transfer / counsel directive in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `hadlock-efw` | Hadlock 1985 (*Am J Obstet Gynecol*) | **Four-parameter EFW** — `log10(EFW g) = 1.3596 − 0.00386·AC·FL + 0.0064·HC + 0.00061·BPD·AC + 0.0424·AC + 0.174·FL`, biometry in cm. Worked: BPD 9 / HC 33 / AC 30 / FL 7 → **2600 g** |
| `fullpiers` | von Dadelszen 2011 (*Lancet*) | **Logistic probability** of adverse maternal outcome ≤ 48 h in pre-eclampsia → `< 10%` low / `10–30%` intermediate / `≥ 30%` high-risk rule-in (LR⁺ ≈ 17.5). **SpO₂ enters only via the platelet interaction** |
| `minipiers` | Payne 2014 (*PLoS Med*) | **Bedside logistic probability**, no labs → `≥ 25%` high-risk rule-in (LR⁺ ≈ 5), > 15% surveillance. GA and SBP enter as **natural logs**; dipstick proteinuria is **three categorical indicators** (2+ negative) |
| `afi` | Moore & Cayle 1990 | **Four-quadrant deepest-pocket sum (cm)** → oligohydramnios `< 5`, polyhydramnios `> 24` (some references > 25), 5–8 low-normal. **Class B** |
| `barnhart-hcg` | Barnhart 2004 (*Obstet Gynecol*) | **Observed serial-hCG rise vs the 53%/48 h minimum** for a potentially viable IUP (scaled log-linearly as `1.53^(hours/48)`); a sub-minimal rise is flagged but not by itself diagnostic |
| `iom-gwg` | IOM 2009 / ACOG CO 548 | **Pre-pregnancy-BMI → total gain + weekly rate** (underweight 28–40 / normal 25–35 / overweight 15–25 / obese 11–20 lb singleton; provisional twin ranges). **Class B** |

**Every coefficient block and threshold was re-fetched from a primary source and
cross-verified across ≥2 independent sources, never recalled** (the spec-v97
discipline). Three source-governance catches matter: (1) in **`fullpiers`, SpO₂ has
no main effect** — it enters only through the platelet×SpO₂ interaction, and the
`−0.0271` coefficient belongs to creatinine (a common mis-recall assigns it to
SpO₂); creatinine has no quadratic term. (2) **`minipiers` takes the natural log of
gestational age and systolic BP** and codes dipstick proteinuria as three
categorical indicators, with the **2+ level carrying the published negative weight
−0.218** (non-monotonic, as published). (3) The optional `iom-gwg` current-gain
comparison (spec §2.6) is **deliberately not shipped** — the IOM publishes no
cumulative point target at an arbitrary gestational age, so a deterministic "on
track" verdict would require fabricating a value the source does not state; for an
underweight twin pregnancy the tile **reports that no IOM recommendation exists**
rather than inventing one. The two logistic models clamp their exponent to
`[−40, 40]` and the Hadlock log₁₀ is range-checked before `10^x`, so every output is
finite; all six flow through the spec-v59 fuzz harness with zero non-finite leaks.
`hadlock-efw`, `fullpiers`, `minipiers`, and `barnhart-hcg` are **Class A**; `afi`
and `iom-gwg` are **Class B** (ACOG-aligned revisable thresholds → gate-forced
citation-staleness rows). `lib/ob-v138.js` + `views/group-v138.js` (`RV138`).
**Catalog 614 → 620, +6; Wave 7 opens.**

#### spec-v137 — infectious-disease scores: ISARIC 4C, COVID-GRAM, Candida score, VACS index, RegiSCAR DRESS (+5 → 614, **Wave 6 close**)

v137 closes **Wave 6** by bringing the infectious-disease risk-score cluster onto
the page beside the community-acquired-pneumonia severity tools (`curb-65`, `psi`,
`smart-cop`). All five land in **Clinical Scoring & Risk (Group G)** and report the
score / probability and the source's framing without authoring an admit / start-
antifungal / diagnose directive in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `isaric-4c-mortality` | Knight 2020 (*BMJ* m3339) | **Additive 0–21** (age, sex, comorbidity count, RR, SpO₂, GCS, urea, CRP) → low 0–3 (1.2%) / intermediate 4–8 (9.9%) / high 9–14 (31.4%) / very high ≥15 (61.5%) in-hospital mortality |
| `covid-gram` | Liang 2020 (*JAMA Intern Med*) | **Logistic probability** of critical illness — `p = 1/(1+e^-x)` over 10 predictors; **betas = ln(published odds ratios), intercept = ln(0.001)** → reported as approximate, with **no invented risk tiers** (the authors define none) |
| `candida-score` | León 2006 (*Crit Care Med*) | **0–5** (TPN 1, surgery 1, multifocal colonization 1, severe sepsis 2); **≥ 3** → invasive candidiasis likely (< 3 ≈ 2.3% in validation) |
| `vacs-index` | Tate / Justice 2013 (*AIDS*) | **0–164** (age, CD4, HIV-1 RNA, hemoglobin, **FIB-4**, eGFR, HCV); reports the two published mortality anchors (0 ≈ 1.8%, 164 ≈ >85.8%) over a continuous curve — **no fabricated per-band lookup** |
| `regiscar-dress` | Kardaun 2013 (*Br J Dermatol*) | **−4 to +9** DRESS certainty (eosinophilia count/% are alternatives, max +2; rash-suggestive and biopsy can score −1) → <2 no case / 2–3 possible / 4–5 probable / >5 definite |

**Every point table, coefficient block, and threshold was re-fetched from a primary
source and cross-verified across ≥2 independent sources, never recalled** (the
spec-v97 discipline). Four source-governance decisions follow the source over the
spec draft where they diverged: (1) **`covid-gram` invents no risk tiers** — the
paper deliberately defines none — and **discloses that its betas are ln of the
published odds ratios** and its intercept derives from the paper's 1-significant-
figure constant (OR 0.001), so the absolute probability is framed as approximate;
the logistic exponent is clamped to `[−40, 40]` so an extreme fuzzed predictor
returns a probability in `[0, 1]`, never `Infinity`. (2) **`vacs-index` quotes only
the two published mortality anchors** over a continuous calibration curve — no
intermediate per-band percentage is fabricated (the gwtg-hf / ROKS precedent) — and
its **FIB-4 sub-computation guards the platelet and √ALT denominators** with `pos()`.
(3) **`isaric-4c-mortality` applies the corrected Table 2** (urea `< 7` mmol/L, CRP
in mg/L) and exposes a **urea/BUN unit selector** (BUN mg/dL = urea mmol/L × 2.8).
(4) **`candida-score`** renders the original `> 2.5` cut-off as the integer **≥ 3**
threshold. All five are **Class A** (journal + author citations — no `ISSUER_PATTERN`
trip, no citation-staleness row) and flow through the spec-v59 fuzz harness with zero
non-finite leaks. `lib/id-v137.js` + `views/group-v137.js` (`RV137`). **Catalog 609
→ 614, +5; Wave 6 complete (584 → 614, +30).**

#### spec-v136 — endocrine / metabolic indices: HOMA-IR, QUICKI, TyG index, metabolic syndrome, OST/ORAI DXA pre-screen (+5 → 609, Wave 6)

v136 brings the endocrine / metabolic index cluster onto the page beside `eag-a1c`
(the live A1c↔average-glucose converter). The three insulin-resistance surrogates
land in **Clinical Math & Conversions (Group E)**; the metabolic-syndrome rule and
the bone pre-screen land in **Clinical Scoring & Risk (Group G)**. Each reports the
index or verdict and the source's framing without authoring a diagnose / start-drug /
order-DXA directive in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `homa-ir` | Matthews 1985 (*Diabetologia*) | **HOMA-IR = (insulin × glucose) ÷ 405** (mg/dL) or **÷ 22.5** (mmol/L); higher = more insulin resistance. Also the linear **HOMA-%B** β-cell estimate when glucose >3.5 mmol/L |
| `quicki` | Katz 2000 (*JCEM*) | **QUICKI = 1 ÷ [log₁₀(insulin) + log₁₀(glucose)]**; lower = lower insulin sensitivity (~0.45 healthy → ~0.30–0.35 in T2DM) |
| `tyg-index` | Simental-Mendía 2008 (*Metab Syndr Relat Disord*) | **TyG = ln[(TG × glucose) ÷ 2]**, the fasting-insulin-free IR surrogate; higher = more resistance |
| `metabolic-syndrome` | Alberti 2009 Harmonized (*Circulation*) / IDF 2006 | **MetS verdict** — waist (sex/population cut-point), TG ≥150, HDL <40 (M)/<50 (F), BP ≥130/85, glucose ≥100 (each "or treated"). **Harmonized = any 3 of 5; IDF = central obesity + any 2** |
| `osteoporosis-prescreen` | Koh 2001 OST / Cadarette 2000 ORAI | **OST = trunc((weight−age) × 0.2)** (index <2 → DXA, Caucasian cutoff) + **ORAI** age/weight/estrogen points (≥9 → DXA) |

**Every formula and threshold was re-fetched from a primary source and
cross-verified across ≥2 independent sources, never recalled** (the spec-v97
discipline). Four design points: (1) **the IR indices guard their domains** —
`homa-ir`/`quicki`/`tyg-index` require glucose, insulin (and TG) >0 and surface a
`valid:false` fallback rather than leaking `log(0) = −∞`, a divide-by-zero (QUICKI's
denominator is 0 exactly when insulin×glucose = 1), or a `NaN`; the log/product math
is explicitly fuzzed. (2) **`metabolic-syndrome` honors the "or on treatment"
override** on each drug-modifiable criterion and applies the **sex- and
population-specific waist cut-point** (US/ATP III M 102/F 88 cm; IDF Europid M 94/F
80; Asian M 90/F 80) — so every IDF-positive patient is also Harmonized-positive, but
not vice-versa. (3) **`osteoporosis-prescreen` truncates the OST index toward zero**
(`Math.trunc`, not `Math.floor` — the −3.6 → −3 worked example disambiguates) and
encodes the ORAI point table exactly (age 45–54/55–64/65–74/≥75 = 0/5/9/15, weight
≥70/60–69/<60 = 0/3/9, no-estrogen +2), with the ≥9 referral threshold. (4) **only
`metabolic-syndrome` is Class B** (a revisable consensus definition → a
documentation-only `docs/citation-staleness.md` row); the other four are **Class A**
(fixed formulas, journal + author citations — no `ISSUER_PATTERN` trip). All five
flow through the spec-v59 fuzz harness with zero non-finite leaks. `lib/endo-v136.js`
+ `views/group-v136.js` (`RV136`). **Catalog 604 → 609, +5.**

#### spec-v135 — lymphoma / CLL prognostic indices: R-IPI, NCCN-IPI, GELF, Hasenclever IPS, CLL-IPI (+5 → 604, Wave 6)

v135 brings the lymphoma and CLL prognostic-index cluster onto the page beside
`flipi` (the live follicular index) and `ipss-r-mds`. All five land in **Clinical
Scoring & Risk (Group G)** and quote the source's outcome framing without authoring
a treat-versus-observe recommendation in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `r-ipi` | Sehn 2007 (*Blood*) | **R-IPI** — the 5 IPI factors (age >60, LDH↑, stage III–IV, ≥2 extranodal, ECOG ≥2) collapsed to 3 groups: very good (0), good (1–2), poor (3–5). 4-yr PFS ~94/80/53% |
| `nccn-ipi` | Zhou 2014 (*Blood*) | **NCCN-IPI 0–8** — banded age (>40–60/>60–75/>75 = 1/2/3) + banded LDH ratio (>1–3×/>3× = 1/2) + stage III–IV + ECOG ≥2 + major-site extranodal → low/low-int/high-int/high; 5-yr OS ~96/82/64/33% |
| `gelf-criteria` | Brice 1997 (*J Clin Oncol*) | **high-tumor-burden flag** — met if **any one** of mass >7 cm, ≥3 nodal sites >3 cm, B symptoms, splenomegaly, effusion, cytopenia (Hgb <10 / plt <100), leukemic phase (>5.0). Treat vs observe |
| `hodgkin-ips` | Hasenclever & Diehl 1998 (*NEJM*) | **Hasenclever IPS 0–7** — albumin <4, Hgb <10.5, male, age ≥45, stage IV, WBC ≥15, lymphocytopenia (<600/µL or <8%). 5-yr FFP ~84% (0) → ~42% (≥5) |
| `cll-ipi` | CLL-IPI Working Group 2016 (*Lancet Oncol*) | **CLL-IPI 0–10** (weighted: TP53 **4**, IGHV unmutated **2**, β2M >3.5 **2**, advanced stage **1**, age >65 **1**) → low/intermediate/high/very-high; 5-yr OS ~93/79/63/23% |

**Every weight and threshold was re-fetched from a primary source and
cross-verified, never recalled** (the spec-v97 discipline). Three design points:
(1) **`nccn-ipi` is banded, not a simple factor count** — age and the LDH
normalized ratio contribute up to 3 and 2 points respectively, so the maximum is 8,
not 5; the exact band edges (age 60 → 1 / 75 → 2; LDH ratio 3 → 1 / >3 → 2) are
pinned by boundary tests. (2) **`gelf-criteria` is an any-one-positive flag** that
reports the criteria status — it never emits a "start chemotherapy" order; the
treat-versus-watch decision stays with the clinician (it complements `flipi`, not
replaces it). (3) **`cll-ipi`'s 4/2/2/1/1 weights** make the high → very-high flip
fall at 6 → 7, pinned by a dedicated boundary test. All five are **Class A**
(journal + author citations — no staleness row); the "NCCN" in `nccn-ipi`'s name is
not an issuer acronym in the citation string (Zhou et al, *Blood*), so the
`check-citations.mjs` `ISSUER_PATTERN` does not fire. All five flow through the
spec-v59 fuzz harness with zero non-finite leaks and surface a complete-the-fields
fallback rather than a partial group. `lib/lymphoma-v135.js` +
`views/group-v135.js` (`RV135`). **Catalog 599 → 604, +5.**

#### spec-v134 — plasma-cell & myeloid-neoplasm staging: ISS, R-ISS, R2-ISS, Mayo MGUS, DIPSS, DIPSS-Plus (+6 → 599, Wave 6)

v134 brings the plasma-cell and myelofibrosis staging cluster onto the page beside
`ipss-r-mds` (MDS prognosis) and `flipi` (lymphoma index). All six land in
**Clinical Scoring & Risk (Group G)** and quote the source's survival framing
without authoring a treatment recommendation in Sophie's voice (spec-v11 §5.3):

| id | Source | Output |
|---|---|---|
| `myeloma-iss` | Greipp 2005 (*J Clin Oncol*) | **ISS stage I–III** from serum β2-microglobulin + albumin (I = β2M <3.5 ∧ alb ≥3.5; III = β2M ≥5.5; II = neither). Median OS ~62/44/29 mo |
| `myeloma-r-iss` | Palumbo 2015 (IMWG, *J Clin Oncol*) | **R-ISS stage I–III** — recomputes ISS internally, then folds in serum LDH + high-risk iFISH (del(17p), t(4;14), t(14;16)). 5-yr OS ~82/62/40% |
| `myeloma-r2-iss` | D'Agostino 2022 (EMN/HARMONY, *J Clin Oncol*) | **additive score 0–5 → strata I–IV**: ISS II 1.0 / III 1.5; high LDH 1.0; del(17p) 1.0; t(4;14) 1.0; 1q21+ 0.5 |
| `mgus-risk` | Rajkumar 2005 (*Blood*) | **risk-factor count 0–3** (M-protein ≥1.5 g/dL, non-IgG isotype, abnormal FLC ratio outside 0.26–1.65) → 20-yr progression 5/21/37/58% |
| `dipss-mf` | Passamonti 2010 (*Blood*) | **DIPSS 0–6** (age >65, WBC >25, Hgb <10 = **2**, blasts ≥1%, constitutional sx) → low/int-1/int-2/high; median survival NR/14.2/4/1.5 yr |
| `dipss-plus-mf` | Gangat 2011 (*J Clin Oncol*) | **DIPSS-Plus 0–6** — carries the DIPSS group forward (int-1 1, int-2 2, high 3) + platelet <100, transfusion need, unfavorable karyotype |

**Every threshold and weight was re-fetched from a primary source and
cross-verified, never recalled** (the spec-v97 discipline). Two source-governance
corrections to the spec draft: (1) **R2-ISS totals 0–5, not "0–3.0"** — the draft
conflated the IV-stratum threshold (which opens at 3.0) with the score ceiling; the
true maximum is ISS-III(1.5) + LDH(1.0) + del(17p)(1.0) + t(4;14)(1.0) + 1q21(0.5)
= **5.0**, pinned by a max-score test. (2) The **R-ISS recomputes the ISS from the
raw β2M + albumin** rather than trusting a separately entered stage, so the
ISS → R-ISS chain cannot desync. The only **weighted-2** term in DIPSS is
hemoglobin <10 g/dL (the common coding trap, guarded by a dedicated test). Five are
**Class A** (journal + author citations — no staleness row); `myeloma-r-iss` is
**Class B** (an IMWG working-group definition) and carries a
`docs/citation-staleness.md` row (documentation-only — the spelled-out
"International Myeloma Working Group" does not match the issuer acronym set). All six
flow through the spec-v59 fuzz harness with zero non-finite leaks and surface a
complete-the-fields fallback rather than a partial stage. `lib/onc-v134.js` +
`views/group-v134.js` (`RV134`). **Catalog 593 → 599, +6.**

#### spec-v133 — warfarin start-up: IWPC + Gage pharmacogenetic dose, Kovacs 10 mg + Crowther 5 mg initiation nomograms (+4 → 593, Wave 6)

v133 brings oral-anticoagulant start-up onto the page beside `heparin-nomogram` —
the catalog's only other "compute the next dose from inputs" tool. All four tiles
land in **Medication & Infusion (Group F)** and carry the spec-v100 §2 clause-5
high-stakes second-check caveat in their rendered output:

| id | Source | Output |
|---|---|---|
| `warfarin-iwpc` | Klein 2009 (IWPC, *NEJM*) — pharmacogenetic linear model | **predicted weekly maintenance dose (mg/week) + derived mg/day**, from age, height, weight, race, inducer/amiodarone use, and the entered VKORC1 (−1639 G>A) + CYP2C9 genotypes |
| `warfarin-gage` | Gage 2008 (*Clin Pharmacol Ther*) — pharmacogenomic exponential model | **predicted therapeutic mg/day + mg/week**, from BSA (DuBois), age, target INR, smoking, amiodarone, race, DVT/PE indication, and the CYP2C9 + VKORC1 genotypes |
| `warfarin-init-10mg` | Kovacs 2003 (*Ann Intern Med*) — 10 mg initiation nomogram | **the day's warfarin dose (mg)**: day 1–2 fixed 10 mg; the day-3 INR sets days 3–4; the day-5 INR sets days 5–7 via a sub-table chosen by the day-3 band |
| `warfarin-init-5mg` | Crowther 1999 (*Arch Intern Med*) — 5 mg initiation nomogram | **the day's warfarin dose (mg)**: day 1–2 fixed 5 mg, days 3–6 INR-banded |

**Every coefficient and nomogram cell was re-fetched from a primary source and
cross-verified, never recalled** (the spec-v97 discipline). The **IWPC** block was
extracted from the *NEJM* 2009 supplementary appendix S1e itself: `√(weekly dose) =
5.6044 − 0.2614·decades + 0.0087·height + 0.0128·weight + VKORC1 + CYP2C9 + race +
1.1816·inducer − 0.5503·amiodarone`, then **squared** for mg/week — the height
coefficient is `0.0087` (the pharmacogenetic model) **not** `0.0118` (the clinical
model, the classic cross-wire). The **Gage** 12-coefficient log-linear block
(`dose = exp(0.9751 + 0.4317·BSA − 0.00745·age − 0.2066·CYP2C9*2 − 0.4008·CYP2C9*3
− 0.3238·VKORC1 + 0.2029·INR − …)`) was confirmed verbatim against a validation
reprint and reconciled against the original Gage Table-3 percentages (VKORC1
−28%/allele = e^−0.3238 − 1, etc.); it uses the **DuBois** BSA the paper itself
cites, and carries **no CYP4F2 term** (that was added later to the IWPC model by
Sagreiya 2010, *not* to Gage). The **Kovacs** table encodes the full Figure-1
structure — the day-3 INR sets days 3 and 4 (which differ), and the day-5 INR
selects one of four sub-tables *by the day-3 band*, with the 1.5–1.9 day-3 range
correctly **split** at 1.6/1.7 (resolving the common reproduction disagreement);
the `63.835/INR` maintenance formula (Kovacs *Blood* 2007) and the AAFP day-5
maintenance table (Pengo 2001) are deliberately excluded as different instruments.
The **Crowther** table preserves the day-5 low band at `INR < 2.0` (not `< 1.5`
like days 3–4). All four are **Class A** (journal + author citations — no staleness
row) and flow through the spec-v59 fuzz harness with zero non-finite leaks; the
PGx models surface a `valid:false` fallback rather than squaring/exponentiating a
degenerate input into a spurious dose. `lib/warfarin-v133.js` +
`views/group-v133.js` (`RV133`). **Catalog 589 → 593, +4.**

> Provenance note: this spec was authored as `+4` but its draft assumed the Gage
> and Kovacs tables were unverifiable; an adversarial re-fetch (two independent
> reproductions per table) cleared both to publication fidelity, so all four
> shipped together — and corrected the draft's claim that "Gage adds CYP4F2."

#### spec-v132 — thrombotic microangiopathy & coagulopathy: PLASMIC, French TTP, JAAM DIC, IPSET-thrombosis, CISNE (+5 → 589, Wave 6 open)

v132 opens **Wave 6** (Heme / onc / endocrine / ID) of the spec-v100 program with
the thrombotic-microangiopathy / coagulopathy cluster that sat conceptually beside
the existing `four-ts` (HIT probability) and `khorana` (cancer-VTE) tiles but was
reachable nowhere. All five home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output |
|---|---|---|
| `plasmic-ttp` | Bendapudi 2017 — PLASMIC pretest probability of severe ADAMTS13 deficiency | **0–7; 0–4 low (~0–4%), 5 intermediate (~5–24%), 6–7 high (~62–82%)** |
| `french-ttp` | Coppo 2010 — French TTP rule (platelet / creatinine / ANA) | **0–3; 0 very unlikely, 2–3 highly likely** |
| `jaam-dic` | Gando 2006 — JAAM acute-DIC score (2006 revised, max 8) | **0–8; DIC at ≥ 4** |
| `ipset-thrombosis` | Barbui 2015 — revised IPSET-thrombosis (essential thrombocythemia) | **4-tier: very low / low / intermediate / high** |
| `cisne` | Carmona-Bayonas 2015 — serious-complication risk in *stable* febrile neutropenia | **0–8; 0 low (~1.1%), 1–2 intermediate (~6.2%), ≥ 3 high (~36%)** |

**Every point table was re-fetched and cross-verified against ≥ 2 independent
sources** (the spec-v97 discipline), and three source-governance calls were made:
(1) **PLASMIC's active-cancer and transplant points score for the *absence* of the
condition** — the classic coding inversion, locked by a dedicated test; (2) the
**French TTP creatinine threshold ships inclusive** (≤ 2.26 mg/dL / ≤ 200 µmol/L)
per Coppo 2010, governing over the spec draft's strict `<` (a creatinine of exactly
2.26 scores the point); (3) **`jaam-dic` is the 2006 *revised* criteria** — the
fibrinogen term was removed and the maximum is 8, *not* the older max-10 fibrinogen
form that several secondary calculators still show.

A latent-bug note worth recording: the graded selects (ECOG, mucositis) revealed
that `Number(null)` and `Number('')` both coerce to `0`, which would have let a
**blank** ECOG silently score as ECOG 0. The numeric coercion helper now rejects
`null` / `undefined` / `''` / booleans up front, so a blank graded field surfaces
the complete-the-fields fallback instead of a false zero.

All five are **Class A** (journal + author citations — no staleness row), flow
through the spec-v59 fuzz harness with zero non-finite leaks, render the spec-v50
§3 posture note, and treat a blank component as not-assessed rather than silently
scoring 0. `lib/heme-v132.js` + `views/group-v132.js` (`RV132`). **Catalog 584 →
589, +5.**

#### spec-v131 — urology renal mass / kidney stone / torsion: CAPRA, R.E.N.A.L., PADUA renal, S.T.O.N.E., TWIST (+5 → 584, Wave 5 close)

v131 closes Wave 5 by completing the urology cluster v130 opened: the renal-mass
anatomic-complexity scores, the PCNL stone-complexity score, the stone-cancer
recurrence score, and the point-of-care testicular-torsion rule. All five home in
**Clinical Scoring & Risk (Group G)**:

| id | Rule | Output |
|---|---|---|
| `capra-score` | Cooperberg 2005 — UCSF CAPRA, sums age / PSA / Gleason axis / stage / % cores | **0–10; 0–2 low, 3–5 intermediate, 6–10 high BCR risk** |
| `renal-nephrometry` | Kutikov & Uzzo 2009 — R.E.N.A.L., R+E+N+L each 1–3 | **4–12 + a/p/x[h] suffix; 4–6 low, 7–9 moderate, 10–12 high** |
| `padua-renal` | Ficarra 2009 — PADUA, six anatomic components | **6–14; 6–7 low, 8–9 intermediate, ≥ 10 high complexity-risk** |
| `stone-nephrolithometry` | Okhunov 2013 — S.T.O.N.E. (original PCNL **area** version) | **5–13; higher = lower stone-free likelihood** |
| `twist-score` | Barbosa 2013 — TWIST testicular-torsion triage | **0–7; 0–2 low (≈2%), 3–4 intermediate, 5–7 high (≈87%)** |

**Every point table was re-fetched and cross-verified against ≥ 2 independent
sources** (the spec-v97 discipline, dispatched as three parallel research passes),
and several source-governance calls were made: (1) **`padua-renal` is a collision
rename** — the catalog already has the unrelated VTE Padua Prediction Score
(`padua`), so the renal score ships under a distinct id and the two are never
cross-linked; (2) `stone-nephrolithometry` ships the **original Okhunov PCNL area
version** (stone area = length × width mm², total 5–13), explicitly *not* the later
ureteroscopy adaptation that scores size by diameter and runs 5–15; (3) the
R.E.N.A.L. **(A)nterior/posterior face is a non-scoring suffix** (a/p/x), with an
appended **h** for hilar tumours, not a points contribution; (4) the CAPRA
**Gleason axis is not the summed 2–10 score** — a primary pattern 4/5 scores +3, a
secondary-only 4/5 scores +1, and there is **no +2 level** (it jumps 1 → 3).

**Design decision — ROKS deferred (a refusal, on purpose).** The spec scoped a
sixth tile, the Rule 2014 ROKS recurrence-of-kidney-stone nomogram. Its 2-/5-/10-
year probability *formula* is published, but the per-variable **points** that feed
it live only in a graphical nomogram; the papers publish hazard ratios, **not** a
numeric point table or the points-scaling constant. Transcribing them would mean
measuring pixel positions off a figure — fabrication. This program already refused
exactly that once (`gwtg-hf`, spec-v102), so ROKS is **deferred** and its id
reserved until an institutional coefficient appendix is available. v131 therefore
ships **+5, not +6**. Refusing to ship a guessed clinical coefficient is a feature
of the maintenance contract, not a gap.

All five are **Class A** (fixed published point tables; journal + author citations —
no staleness row), flow through the spec-v59 fuzz harness with zero non-finite
leaks, render the spec-v50 §3 posture note, and treat a blank component as
not-assessed (a surfaced fallback) rather than silently scoring 0.
`lib/uro-v131.js` + `views/group-v131.js`. **Catalog 579 → 584, +5.**

#### spec-v130 — urology prostate metrics & risk: prostate volume, PSA density/velocity/doubling-time, D'Amico, Gleason Grade Group (+6 → 576, Wave 5)

Wave 5 opens the urology surface. v130 adds the prostate-volumetry and PSA-kinetics math
a urologist runs at the bedside plus the two canonical prostate-cancer-risk
classifications. Four home in **Clinical Math & Conversions (Group E)** and two in
**Clinical Scoring & Risk (Group G)**:

| id | Group | Rule | Output |
|---|---|---|---|
| `prostate-volume` | E | Terris-Stamey 1991 — AP × TR × CC × 0.52 (π/6 rounded) | **volume cc; > 30 = enlarged/BPH** |
| `psa-density` | E | Benson 1992 — serum PSA ÷ prostate volume | **density ng/mL/cc; > 0.15 = suspicious** |
| `psa-velocity` | E | Carter 1992 — two-point (later − earlier PSA) ÷ years | **ng/mL/yr; > 0.75 = suspicious** |
| `psa-doubling-time` | E | Pound 1999 — ln(2)·T ÷ (ln PSA₂ − ln PSA₁), rising only | **months; < 12 = aggressive** |
| `damico-prostate-risk` | G | D'Amico 1998 — worst of stage / PSA / Gleason | **Low / Intermediate / High BCR risk** |
| `gleason-grade-group` | G | Epstein 2016 / ISUP 2014 — primary + secondary patterns | **Grade Group 1–5** |

All six **re-fetch the formulas/coefficients verbatim** (the spec-v97 discipline,
dispatched as an independent research pass), cross-verified across ≥ 2 sources, and four
source-governance calls were made: (1) `prostate-volume` — the ellipsoid coefficient is
fixed at **0.52** (π/6 rounded to the dominant clinical/MDCalc convention; the alternate
exact 0.5236 differs by ~0.7%), stated to the user. (2) `damico-prostate-risk` — the PSA
boundary is **strict** (> 10), so a PSA of exactly 10 is **Low**, and the high-risk T-stage
cut is **T2c** per the original paper, with the **worst single feature** governing the
group. (3) `psa-doubling-time` — the doubling time is undefined for a stable or falling
PSA, so the tile detects a non-rising PSA and returns "not rising" rather than a
NaN / negative time. (4) `psa-velocity` — the validated method averages consecutive yearly
rates over ≥ 3 measurements spanning ≥ 18 months, so the **two-point** rate is labeled the
bedside approximation. The PSA-kinetics tiles report **signed** results; every denominator
is guarded. Each tile reports the urologic quantity or risk class, **not** management
(spec-v11 §5.3). All six are **Class A** (journal + author citations — no staleness row).
`lib/uro-v130.js` + `views/group-v130.js`. **Catalog 570 → 576, +6.**

#### spec-v129 — acid-base compensation & gaps: Stewart SID/SIG, base excess, the three compensation formulas, urine osmolal gap (+6 → 570, Wave 5)

Wave 5 closes the acid-base surface: the catalog already had the anion gap (`anion-gap-dd`)
and Winter's formula (`winters`), and v129 completes the compensation set, adds the
physicochemical (Stewart) view, the hemoglobin-corrected base excess, and the urine
osmolal gap. All six home in **Clinical Math & Conversions (Group E)**:

| id | Rule | Output |
|---|---|---|
| `stewart-sid-sig` | Stewart 1983 / Figge 1992 — SIDa = (Na+K+Ca+Mg) − (Cl+lactate); SIDe = HCO₃ + 2.8·alb + 0.59·PO₄ (charges at pH 7.4) | **SIG mEq/L; > 2 = unmeasured strong anions** |
| `base-excess` | Siggaard-Andersen Van Slyke (NCCLS) — (1 − 0.0143·Hb)·(HCO₃ − 24.8 + (9.5 + 1.63·Hb)·(pH − 7.4)) | **BE mEq/L; signed (deficit / excess)** |
| `resp-acidosis-compensation` | Brackett 1965 / Schwartz — 24 + k·(PaCO₂ − 40)/10, k = 1 acute / 4 chronic | **expected HCO₃; flags added metabolic disorder** |
| `resp-alkalosis-compensation` | Gennari 1972 — 24 − k·(40 − PaCO₂)/10, k = 2 acute / 4 chronic, floored | **expected HCO₃; flags added metabolic disorder** |
| `met-alkalosis-compensation` | Narins-Emmett 1980 — 0.7·(HCO₃ − 24) + 40 (± 5) | **expected PaCO₂; flags added respiratory disorder** |
| `urine-osmolal-gap` | Halperin 1988 — measured − [2·(Na+K) + urea-N/2.8 + glucose/18] | **gap mOsm/kg; half ≈ urinary NH₄⁺** |

All six **re-fetch the formulas/coefficients verbatim** (the spec-v97 discipline,
dispatched as two independent research passes), cross-verified across ≥ 2 sources, and
four source-governance calls were made: (1) `stewart-sid-sig` — the published Figge SIDe
is **pH-dependent**, but the spec input set omits pH, so the weak-acid charges are fixed
at the physiologic **pH 7.4** (yielding albumin 2.8 mEq/L per g/dL and phosphate 0.59
mEq/L per mg/dL, both derived from the Figge coefficients); the assumption is stated to
the user. (2) `base-excess` — the Van Slyke constants are kept as one **matched NCCLS
C12-T2 pair** (24.8 ↔ 9.5/1.63, factor 0.0143; Lang & Zander 2002 warn against crossing
editions), reproducing the published −13.0 mEq/L worked case. (3) the three compensation
formulas use an **explicit acute-vs-chronic selector** (never inferred) and clamp every
prediction to a physiologic range, comparing expected vs measured to flag a superimposed
disorder. (4) `urine-osmolal-gap` uses the standard US-unit calculated-osmolality
identity (urea-N ÷ 2.8, glucose ÷ 18). The SIG / base-excess / urine-gap tiles report
**signed** results; every denominator is guarded. Each tile reports the acid-base
quantity or the expected-vs-measured comparison, **not** management (spec-v11 §5.3). All
six are **Class A** (journal + author citations — no staleness row). `lib/acidbase-v129.js`
+ `views/group-v129.js`. **Catalog 564 → 570, +6.**

#### spec-v128 — renal excretion & dialysis math: FE-phosphate, FE-magnesium, nPCR/nPNA, standard Kt/V, electrolyte-free water clearance (+5 → 564, Wave 5)

Wave 5 continues into the renal-excretion and dialysis-math surface beside `fena-feurea`
and `ktv-urr`. All five home in **Clinical Math & Conversions (Group E)**:

| id | Rule | Output |
|---|---|---|
| `fepo4` | Walton-Bijvoet 1975 — (U·PO₄ × P·Cr) / (P·PO₄ × U·Cr) × 100 | **FEPO₄ %; > ~5% = renal phosphate wasting** |
| `femg` | Elisaf 1998 — (U·Mg × P·Cr) / (0.7 × P·Mg × U·Cr) × 100 | **FEMg %; > ~2–4% = renal Mg wasting** |
| `npcr-pna` | Depner-Daugirdas 1996 — 0.22 + 0.864 × ΔBUN / interdialytic hours | **nPCR g/kg/day; target ~1.0–1.2** |
| `std-ktv` | Leypoldt 2003 (FHN) — frequency-normalized weekly Kt/V | **stdKt/V /week; target ≥ 2.1** |
| `efwc` | Rose 1986 — V × [1 − (U·Na + U·K) / P·Na] | **L; signed free-water balance** |

All five **re-fetch the formulas verbatim** (the spec-v97 discipline), cross-verified
across ≥ 2 independent sources, and three source-governance calls were made over the
spec draft: (1) `efwc`'s **sign was inverted in the spec prose** — the cross-verified
convention (Rose 1986, the Frontiers 2018 review, ScienceDirect) is that a **positive**
EFWC is net free-water *excretion* (raises plasma Na, toward hypernatremia) and a
**negative** EFWC is *retention* (lowers Na, drives hyponatremia); the tile implements
the corrected sign. (2) `npcr-pna` ships the **two-point intradialytic-rise form**
(reproducing the published 1.24 g/kg/day worked example) and deliberately **does not**
ship the Kt/V-coefficient form, whose first-of-week and last-of-week coefficient
triplets are unrecoverable from open sources (no-fabrication, cf. the deferred
`gwtg-hf`). (3) `femg` keeps the **0.7 free-fraction correction** on the denominator
(a minority calculator variant drops it and inflates FE by ~1/0.7). The fractional-
excretion and kinetic tiles guard every denominator; `efwc` requires a nonzero plasma
sodium and reports the **signed** result. Each tile reports the excretion fraction /
adequacy quantity / signed clearance, **not** management (spec-v11 §5.3). All five are
**Class A** (journal + author citations; KDOQI / FHN never reach `ISSUER_PATTERN` — no
staleness row). `lib/renal-v128.js` + `views/group-v128.js`. **Catalog 559 → 564, +5.**

#### spec-v126 — GI disease activity & pancreatitis severity: CDAI, UCEIS, SES-CD, HAPS, Balthazar CTSI, modified Marshall (+6 → 555, Wave 5)

Wave 5 continues with the clinical-trial-standard IBD activity indices and the
standard pancreatitis imaging / organ-failure scores. All six home in **Clinical
Scoring & Risk (Group G)**:

| id | Rule | Output |
|---|---|---|
| `cdai-crohns` | Best 1976 — 8 weighted 7-day items (stools ×2, pain ×5, well-being ×7, …) | **~0–600; < 150 remission … > 450 severe** |
| `uceis` | Travis 2012 — vascular + bleeding + erosions/ulcers | **0–8 (0-based); remission 0–1 … severe 7–8** |
| `ses-cd` | Daperno 2004 — 4 vars × 5 segments, stenosis capped at 11 | **0–56; 0–2 remission … > 15 severe** |
| `haps` | Lankisch 2009 — no peritonitis + normal Hct + normal creatinine | **harmless (non-severe) vs not** |
| `ctsi-balthazar` | Balthazar 1990 — CT grade (0–4) + necrosis (0/2/4/6) | **0–10; 0–3 mild … 7–10 severe** |
| `modified-marshall` | Banks 2013 (Revised Atlanta) — 3 organs each 0–4 | **organ failure at any system ≥ 2** |

All six **re-fetch the published weights / scales / thresholds verbatim** (the
spec-v97 discipline), cross-verified across ≥ 2 independent sources, resolving three
genuine literature conflicts: **UCEIS** ships the 0-based 0–8 scale (the original
2012 paper was 1-based 3–11, later rebased); **SES-CD**'s true maximum is **56** (the
stenosis sub-total is capped at 11 because a non-passable stenosis ends the exam — not
the naive 60 that even ECCO's widget shows); and **HAPS** uses strict `<` thresholds
(the cutoff value itself is abnormal). `cdai-crohns` guards the standard-weight
divisor and the log-free hematocrit/weight terms; `modified-marshall` guards the
PaO₂/FiO₂ denominator and reports a blank system as not-assessed (the v93
`glasgow-imrie` pattern). Five are **Class A**; **`modified-marshall` is Class B** (the
revisable Revised-Atlanta organ-failure definition → a documentation-only
`docs/citation-staleness.md` row, on-publication cadence — its citation names the
working group, not an issuer acronym, so it is not gate-forced). `lib/gi-v126.js` +
`views/group-v126.js`. **Catalog 549 → 555, +6.**

#### spec-v125 — hepatology severity & encephalopathy: PELD, CLIF-C ACLF, GAHS, West Haven, HSI (+5 → 549, Wave 5)

Wave 5 continues with the **severity and complication** instruments hepatologists
reach for in acute deterioration. All five home in **Clinical Scoring & Risk (Group
G)**:

| id | Rule | Output |
|---|---|---|
| `peld-score` | McDiarmid 2002 — 4.80·ln(bili) + 18.57·ln(INR) − 6.87·ln(alb) + age/growth bonuses | **integer PELD (under-12 listing)** |
| `clif-c-aclf` | Jalan 2014 — 10·[0.33·CLIF-OF + 0.04·age + 0.63·ln(WBC) − 2] | **0–100; CLIF-OF organ sub-score 6–18** |
| `gahs` | Forrest 2005 — 5 banded items (age/WBC/urea/INR/bili) | **5–12; ≥ 9 = steroid-benefit cohort** |
| `west-haven-he` | Conn 1977 — ordinal clinical grade | **0–4; ≥ 2 = overt encephalopathy** |
| `hepatic-steatosis-index` | Lee 2010 — 8·(ALT/AST) + BMI + 2(F) + 2(DM) | **< 30 out / > 36 in (NAFLD)** |

All five **re-fetch the published coefficients / bands / criteria verbatim** (the
spec-v97 discipline), cross-verified across ≥ 2 independent sources, with three
governance points: **GAHS uses SI units** — blood urea in mmol/L and bilirubin in
µmol/L (the one real GAHS pitfall; not BUN/mg/dL), so the tile takes SI natively;
**CLIF-OF circulation scores 3 for vasopressor use** (the canonical Jalan 2014
definition, not the MAP < 65 of CLIF-SOFA that crept into one secondary table); and
**PELD uses the raw McDiarmid form** (no ×10 — that is the UNOS allocation
presentation), with labs floored at 1.0. The log tiles (PELD, CLIF-C ACLF, HSI)
domain-guard every `ln`/ratio (blank/non-positive → complete-the-fields fallback,
never `ln(0)` or divide-by-zero). Each tile reports the score/grade, **not**
management (spec-v11 §5.3). All five are **Class A** (journal + author citations, no
`ISSUER_PATTERN` trip → no staleness row). `lib/hep-v125.js` + `views/group-v125.js`.
**Catalog 544 → 549, +5.**

#### spec-v124 — hepatology function & fibrosis: ALBI, MELD-XI, Forns, BARD, FLI, Lok (+6 → 544, opens Wave 5)

**Wave 5 (GI / hepatology / nephrology / acid-base / urology)** opens with the family
of objective liver-function grades and serum fibrosis/steatosis surrogates a
hepatologist reads beside the existing `meld-childpugh` and `fib4` tiles. `albi-grade`
and `bard-score` are in **Clinical Scoring & Risk (Group G)**; the rest are **Clinical
Math & Conversions (Group E)**:

| id | Rule | Output |
|---|---|---|
| `albi-grade` | Johnson 2015 — log₁₀(bili µmol/L)·0.66 + albumin g/L·−0.085 | **grade 1 (≤ −2.60) / 2 / 3 (> −1.39)** |
| `meld-xi` | Heuman 2007 — 5.11·ln(bili) + 11.76·ln(creat) + 9.44, labs floored at 1.0 | **integer MELD-XI** |
| `forns-index` | Forns 2002 — 7.811 − 3.131·ln(plt) + 0.781·ln(GGT) + 3.467·ln(age) − 0.014·chol | **< 4.2 rule-out / > 6.9 rule-in** |
| `bard-score` | Harrison 2008 — BMI ≥ 28 (+1), AST/ALT ≥ 0.8 (+2), DM (+1) | **0–4; 2–4 leaves advanced fibrosis in play** |
| `fatty-liver-index` | Bedogni 2006 — logistic of TG/BMI/GGT/waist | **FLI 0–100; < 30 out / ≥ 60 in** |
| `lok-index` | Lok 2005 (HALT-C) — logistic of plt/(AST/ALT)/INR | **probability; < 0.2 out / > 0.5 in** |

All six **re-fetch the published coefficients verbatim** (the spec-v97 discipline),
cross-verified across ≥ 2 independent sources — and the re-fetch caught a **real spec
error**: the spec draft labeled the Forns cholesterol input "mmol/L," but the −0.014
coefficient is calibrated to **mg/dL** (feeding mmol/L would make the term ~38× too
small and grossly inflate the score), so the tile takes mg/dL. Other governance: ALBI
uses the primary-paper −0.085 (not −0.0852); MELD-XI floors both labs at 1.0 before the
log (the standard-MELD convention, documented — no rescaling, no creatinine cap); the
logistic tiles (FLI, Lok) use an overflow-safe `1/(1+e^−x)` so extreme inputs return 0
or 100/1, never `Infinity`; and every `ln`/`log₁₀` argument is domain-guarded so a
blank or non-positive value surfaces a complete-the-fields fallback rather than
`ln(0)`. Each tile reports the grade / score / probability, **not** management
(spec-v11 §5.3). All six are **Class A** (journal + author citations, no
`ISSUER_PATTERN` trip → no staleness row). `lib/hep-v124.js` + `views/group-v124.js`.
**Catalog 538 → 544, +6 — opens Wave 5.**

#### spec-v123 — psychiatry public-domain instruments: AIMS, Bush-Francis, Barnes, SCOFF, CES-D (+5 → 538, closes Wave 4)

The Wave 4 closer adds five **confirmed public-domain / free-to-use** psychiatry
instruments — the movement-side-effect, catatonia, eating-disorder, and depression
scales whose license status permits an interactive build. (The copyrighted ones —
BDI, PANSS, MoCA, EAT-26, … — stay on the spec-v100 §8 permanent-exclusion list.) All
five home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Provenance |
|---|---|---|---|
| `aims-tardive` | Guy 1976 AIMS — 7 movement items (0–4) + global severity | **movement total 0–28; ≥ 2 in two areas / ≥ 3 in one = probable TD** | NIMH public domain |
| `bfcrs` | Bush 1996 Bush-Francis — 14-item screen + 23-item severity | **screen ≥ 2 = catatonia suggested; severity 0–69** | journal-published |
| `bars-akathisia` | Barnes 1989 — objective/subjective subtotals (0–9) + global | **global 0–5 (absent → severe)** | journal-published |
| `scoff` | Morgan 1999 SCOFF — 5 yes/no items | **0–5; ≥ 2 positive flags likely eating disorder** | free (open BMJ paper) |
| `ces-d` | Radloff 1977 CES-D — 20 items (0–3), items 4/8/12/16 reverse-scored | **0–60; ≥ 16 flags significant symptoms** | NIMH public domain |

All five **re-fetch the item lists / scoring keys verbatim** (the spec-v97 discipline),
cross-verified across ≥ 2 independent sources, with three corrections worth noting: the
**BFCRS item order** (Immobility/stupor is item 1, Excitement item 14 — not the reverse)
and its six **0/3-binary items** (12, 17–21); the **CES-D reverse-scored items** are 4,
8, 12, 16 (applied in-compute, so the all-"rarely" default correctly scores 12, not 0);
and the **CES-D ≥ 16 adult cutoff** (not the child CES-DC's ≥ 15, a documented
conflation deliberately avoided). Each tile is a screen or severity scale, **not a
diagnosis** (spec-v11 §5.3): the assessment and treatment decision stay with the
clinician. All five are **Class A** (journal/manual + author citations, no
`ISSUER_PATTERN` trip → no staleness row), and each instrument's public-domain /
free-to-use status is re-confirmed per spec-v100 §8 in `docs/clinical-citations.md`.
`lib/psych-v123.js` + `views/group-v123.js`. **Catalog 533 → 538, +5 — closing
spec-v100 Wave 4 (Neurology / neurosurgery / psychiatry), which grew from 506 to 538
(+32) across v117–v123.**

#### spec-v122 — general neurology & rehab: dementia type, spasticity, brainstem encephalitis (+3 → 533, Wave 4)

Wave 4 widens from the neuromuscular emergencies into three **general-neurology and
rehabilitation** instruments that cross specialty lines. All three home in **Clinical
Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `hachinski` | Hachinski 1975 Ischemic Score — 13 weighted features (5 score 2 pts: abrupt onset, fluctuating course, stroke history, focal symptoms, focal signs; 8 score 1 pt) | **0–18; ≤ 4 degenerative / 5–6 indeterminate / ≥ 7 vascular dementia** | A |
| `modified-ashworth` | Bohannon & Smith 1987 Modified Ashworth Scale — ordinal resistance to passive movement | **grade 0 / 1 / 1+ / 2 / 3 / 4 (distinct ordinal steps, "1+" not summed)** | A |
| `bickerstaff` | Odaka 2003 (spectrum: Wakerley 2014) — ophthalmoplegia + ataxia + (altered consciousness OR hyperreflexia); GQ1b / MRI / CSF supportive only | **core-met vs not-met diagnostic determination** | A |

All three **re-fetch the published weights / ordinal wording / criteria verbatim**
(the spec-v97 discipline), cross-verified across ≥ 2 independent sources. Three
source-governance choices: (1) the **`hachinski` weights were re-fetched, not
recalled** — stepwise deterioration is **1 point, not 2** (a common mis-recall the
official ARIC/NIH form and every reproduction contradict; max 18, not the inflated
value the wrong assumption gives); (2) **`modified-ashworth` renders "1+" as a
distinct ordinal step** via string keys, never averaged or summed into a fractional
grade; (3) **`bickerstaff` does not gate the verdict on the anti-GQ1b antibody** —
it, the MRI lesion, and the CSF dissociation are supportive only (seronegative cases
are recognized), and the tile frames the determination as a research/classification
reading, not a validated gold standard, naming the GQ1b spectrum link to Miller
Fisher syndrome and GBS. Each tile **reports the score / grade / determination, not
the order** (spec-v11 §5.3): the diagnosis and management decision stay with the
clinician and local protocol. All three are **Class A** (journal+author citations,
no `ISSUER_PATTERN` trip → no staleness row). `lib/neuro-v122.js` +
`views/group-v122.js`. **Catalog 530 → 533, +3.**

#### spec-v121 — neuromuscular emergencies: GBS & myasthenia (+4 → 530, Wave 4)

Wave 4 moves from epilepsy/headache/vertigo into the **neuromuscular-emergency**
instruments a neurology and neurocritical-care service uses to predict respiratory
failure and grade disease. The catalog had no GBS or myasthenia tools. All four
home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `egris` | Walgaard 2010 Erasmus GBS Respiratory Insufficiency Score — days onset→admission (0–2) + facial/bulbar weakness (+1) + MRC sum-score band (0–4) | **0–7; mechanical-ventilation risk low (0–2) ~4% / intermediate (3–4) ~24% / high (≥ 5) ~65%** | A |
| `megos` | Walgaard 2011 modified Erasmus GBS Outcome Score — age (0–2) + preceding diarrhea (+1) + MRC band weighted by timing (admission 0/2/4/6, day 7 0/3/6/9) | **0–9 (admission) / 0–12 (day 7); higher → higher probability of inability to walk at 4 & 26 wk** | A |
| `brighton-gbs` | Sejvar 2011 Brighton Collaboration case definition — 3 core clinical features + absence of alternative dx + CSF dissociation + consistent NCS | **diagnostic-certainty Level 1 (highest) – 4 (insufficient)** | A |
| `mgfa` | Jaretzki 2000 MGFA classification + Wolfe 1999 MG-ADL — predominant pattern/severity → Class I–V (a/b subtype) + 8-item ADL each 0–3 | **Class I–V with a/b subtype; MG-ADL 0–24** | A |

All four **re-fetch the published point weights / case definition verbatim** (the
spec-v97 discipline), cross-verified across the derivation papers and open-access
reproductions (the PMC "Ten Steps" GBS review Box 3, the Bangladesh & Frontiers
mEGOS validations, the Fokke 2014 *Brain* Brighton-table reprint, and the official
MGFA Foundation classification PDF). Two source-governance choices, consistent with
the project **no-fabrication** doctrine: (1) **EGRIS publishes only the three
banded category rates** (4% / 24% / 65%) over a continuous logistic curve with no
per-integer-score table, so the tile quotes the category rates; (2) **mEGOS's
per-score probability of inability to walk is published only as figure curves**
whose coefficients are not reported and which diverge by region, so the tile reports
the total and a relative reading of the published range (the v111
`snakebite-severity` relative-range pattern), inventing no per-score percentage.
Each tile **reports the score / level / class, not the order** (spec-v11 §5.3): the
IVIG / PLEX / intubation / monitoring decision stays with the clinician and local
protocol. All four are **Class A** (journal+author citations, no `ISSUER_PATTERN`
trip → no staleness row). `lib/neuro-v121.js` + `views/group-v121.js`. **Catalog
526 → 530, +4.**

#### spec-v120 — epilepsy, headache & vertigo (+5 → 526, Wave 4)

Wave 4 continues from the stroke surface into the **epilepsy-prognosis,
headache-likelihood, and vertigo-localization** rules a neurologist or ED
clinician runs daily. The catalog had stroke scales and the dementia screens but
not these five. All home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `stess` | Rossetti 2008 Status Epilepticus Severity Score — consciousness (0–1) + worst seizure type (0–2) + age ≥ 65 (+2) + no/unknown prior seizures (+1) | **0–6; ≥ 3 unfavorable (NPV ~0.97 for survival)** | A |
| `helps2b` | Struck 2017 2HELPS2B — B(I)RDs (+2) + LPD/LRDA/BIPD, sporadic discharges, > 2 Hz, plus features, prior seizures (+1 each) | **0–7 → integer→risk lookup (5 / 12 / 27 / 50 / 73 / 88 / >95%) of 72-h seizure risk** | A |
| `mess-first-seizure` | Kim 2006 (MRC MESS) — seizures at presentation (0 / +1 / +2) + neuro disorder (+1) + abnormal EEG (+1) | **0–4 → low / medium / high recurrence group** | A |
| `pound-migraine` | Detsky 2006 POUND — Pulsatile + hOurs (4–72 h) + Unilateral + Nausea + Disabling | **0–5; LR ~24 (≥ 4), ~3.5 (3), ~0.41 (≤ 2)** | A |
| `hints` | Kattah 2009 HINTS / HINTS-plus — Head-Impulse, Nystagmus, Skew (+ new hearing loss) | **central (stroke) vs peripheral (benign) pattern** | A |

All five **re-fetch the published point weights / lookup verbatim** (the spec-v97
discipline), cross-verified across the derivation papers and the JAMA / MDCalc /
PMC reproductions. Three source-governance choices, consistent with the project
**no-fabrication** doctrine: (1) **`helps2b` is ML-derived but ships as a compiled
integer→risk lookup constant — no model runs at render time** (spec-v100 §11), and
the paper's collapsed ">95%" stratum folds scores 6 and 7 together rather than
inventing a 7-specific figure; (2) **`stess` has no published per-score mortality
table**, so the tile frames the favorable (0–2) / unfavorable (≥ 3) dichotomy and
the high negative predictive value (~0.97), inventing no per-band percentage; and
(3) **`mess-first-seizure`'s per-year treated/deferred recurrence grid is
paywalled** (Lancet Neurol Table 4), so the tile reports the confirmable
risk-group ranges over a 3–5 year window rather than fabricating discrete annual
cells. The id is **distinct from the v109 `mangled-extremity` MESS** (spec-v100 §4
collision audit). Each tile **reports the score / classification, not the order**
(spec-v11 §5.3): the treat / admit / monitor / image decision stays with the
clinician and local protocol. All five are **Class A** (journal+author citations,
no `ISSUER_PATTERN` trip → no staleness row). `lib/neuro-v120.js` +
`views/group-v120.js`. **Catalog 521 → 526, +5.**

#### spec-v119 — prehospital LVO triage & cerebrovascular diagnosis (+4 → 521, Wave 4)

Wave 4 continues from the in-hospital hemorrhagic grading out to the **field**.
The catalog had the in-hospital stroke scales (`nihss`, `ich-score`) but not the
prehospital LVO-triage tools the EMS crew runs, nor two cerebrovascular-diagnosis
rules. All four home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `cpsss` | Katz 2015 Cincinnati Prehospital Stroke Severity Scale / C-STAT — conjugate gaze (+2) + LOC questions/commands (+1) + severe arm weakness (+1) | **0–4; ≥ 2 predicts a large-vessel occlusion** | A |
| `fast-ed` | Lima 2016 Field Assessment Stroke Triage — Facial (0–1) + Arm (0–2) + Speech (0–2) + Eye (0–2) + Neglect (0–2) | **0–9; ≥ 4 predicts LVO, supports comprehensive-center triage** | A |
| `boston-caa` | Charidimou 2022 Boston Criteria v2.0 — age ≥ 50 + presentation + lobar hemorrhagic lesions + v2.0 white-matter feature − deep lesions | **definite / probable-with-pathology / probable / possible CAA** | B |
| `cvt-risk` | Ferro 2009 (ISCVT) CVT outcome score — Malignancy (+2) + Coma (+2) + Deep-CVT (+2) + Mental status (+1) + Male (+1) + ICH (+1) | **0–9; ≥ 3 predicts poor outcome (mRS > 2)** | A |

All four **re-fetch the published point weights / diagnostic logic verbatim** (the
spec-v97 discipline), cross-verified across the derivation papers and MDCalc / PMC
/ validation-cohort reproductions. Two source-governance catches resolved at
implementation: **FAST-ED totals 0–9, not the "0–10"** MDCalc's UI labels (the
item maxima — facial palsy caps at 1 — sum to 9; the "0–10" is a sum-of-fives
artifact); and the **CVT coma item is +2, not the stray "+5"** that circulates
(it reflects the published hazard ranking, where malignancy, coma, and deep-CVT
carry the three highest hazard ratios → 2 points each). The Boston v2.0 logic is
verbatim-confirmed across two independent reproductions of the Lancet Neurology
source; `boston-caa` reports "Criteria not met" rather than inventing a category
when a deep lesion, a missing age/presentation, or no qualifying marker is
present. Each tile **reports the score/category, not the order** (spec-v11 §5.3):
the destination, bypass, anticoagulation, and treatment decisions stay with the
EMS crew, stroke team, and local protocol. `cpsss`/`fast-ed`/`cvt-risk` are
**Class A** (journal+author citations, no `ISSUER_PATTERN` trip → no staleness
row); `boston-caa` is **Class B** (a revisable consensus diagnostic definition →
a documentation-only `docs/citation-staleness.md` row). `lib/neuro-v119.js` +
`views/group-v119.js`. **Catalog 517 → 521, +4.**

#### spec-v118 — hemorrhagic stroke, SAH, IVH & aneurysm (+5 → 517, Wave 4)

Wave 4 continues on the **hemorrhagic** side the neuro-ICU and neurosurgery teams
grade. v117 covered the ischemic-stroke imaging-prognosis scores; v118 adds the
SAH-blood, IVH-burden, hematoma-expansion, and unruptured-aneurysm instruments.
All five home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `modified-fisher` | Frontera 2006 modified Fisher scale — cisternal SAH thickness (none/thin/thick) × IVH (present/absent) | **grade 0–4; symptomatic-vasospasm ~24% (g1), ~33% (g2, g3), ~40% (g4)** | A |
| `graeb-ivh` | Morgan 2013 modified Graeb score — 4 large compartments (fill 0–4 + 1 if expanded) + 4 horns (fill 0–2 + 1 if expanded) | **0–32; each +1 raises poor-outcome odds ~12%** | A |
| `bat-score` | Morotti 2018 BAT — Blend sign (+1) + Any hypodensity (+2) + onset-to-NCCT < 2.5 h (+2) | **0–5; ≥ 3 predicts expansion (sens ~0.50, spec ~0.89)** | A |
| `phases` | Greving 2014 PHASES — Population + HTN + Age ≥ 70 + Size + Earlier SAH + Site | **0–22; 5-yr rupture risk ~0.4% (≤ 2) → ~17.8% (≥ 12)** | A |
| `elapss` | Backes 2017 ELAPSS — Earlier SAH (no +1) + Location + Age + Population + Size + Shape | **0–40; 3-/5-yr growth risk ~5.0%/8.4% (< 5) → ~42.7%/60.8% (≥ 25)** | A |

All five **re-fetch the published point tables verbatim** (the spec-v97
discipline), cross-verified across the derivation papers and PMC / validation-
cohort reproductions. Two source-governance catches resolved at implementation:
the modified Graeb maximum of 32 is reached only because the **+1 expansion bonus
is an independent additive modifier on each of the eight compartments** (a naive
"fill grade alone" reading sums to 24); and ELAPSS scores **no earlier SAH as +1**
(a prior treated bleed associates with *lower* growth risk of the remaining
aneurysm). Each tile **reports the grade/score, not the order** (spec-v11 §5.3):
the coiling, clipping, surveillance, and surgical decisions stay with the
neurosurgery / neurocritical-care team. All **Class A** (journal+author citations,
no `ISSUER_PATTERN` trip → no staleness row). `lib/neuro-v118.js` +
`views/group-v118.js`. **Catalog 512 → 517, +5.**

#### spec-v115 — pulmonary nodule, PH & pleural infection (+5 → 506, closes Wave 3)

Wave 3 closes with five **pulmonary** decision rules a pulmonologist reaches for
routinely. The catalog had the chronic-airways and acute-PE tools but lacked the
incidental/screen-detected nodule malignancy models, the nodule-surveillance
matrix, the PAH prognosis score, and the pleural-infection mortality score. All
five home in **Clinical Scoring & Risk (Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `mayo-spn` | Swensen 1997 Mayo Clinic SPN logistic — age + smoking + prior cancer + diameter + spiculation + upper lobe | **malignancy probability %, pretest low < 5% / intermediate 5–65% / high > 65%** | A |
| `brock-nodule` | McWilliams 2013 Brock/PanCan logistic — centered age/count, (size/10)^−0.5 transform, type/sex/family-history/emphysema/upper-lobe/spiculation | **malignancy probability %, same pretest framing** | A |
| `fleischner-2017` | MacMahon 2017 Fleischner Society follow-up matrix — type × size × single-or-multiple × risk | **the recommended CT-surveillance interval (or no follow-up / consider PET-CT or tissue sampling)** | B |
| `reveal-lite-2` | Benza 2021 REVEAL Lite 2 — base 6 + eGFR/WHO-class/SBP/HR/6MWD/natriuretic-peptide | **total 1–14, low 1–5 (2.9%) / intermediate 6–7 (7.1%) / high ≥ 8 (25.1%) 1-year mortality** | A |
| `rapid-pleural` | Rahman 2014 RAPID — Renal (urea) + Age + Purulence + Infection source + Dietary albumin | **0–7, low 0–2 / medium 3–4 / high 5–7; derivation 3-month mortality ~1.5 / 17 / 47%** | A |

Both nodule logistics **re-fetch the published coefficients verbatim** (the
spec-v97 discipline) — the seven Mayo coefficients confirmed against the spec
draft, and the full Brock equation cross-verified across the original NEJM
appendix, Radiopaedia, and MDCalc, including the `(size/10)^−0.5 − 1.58113883`
power transform (the centering constant is `0.4^−0.5`) and the age/count
centering at 62 and 4. Both **clamp the logistic exponent to [−40, 40]** so a
fuzzed extreme (a 1e9 mm diameter) yields 100%, never `NaN`/`Infinity`; Brock
domain-guards `size > 0`. Each tile **reports the probability/interval/score, not
the order** (spec-v11 §5.3): the surveillance, PET, biopsy, escalate-care, or
drainage decision stays with the clinician and local protocol. Four are **Class
A** (fixed coefficients/weights, journal+author citations — no staleness row);
`fleischner-2017` is **Class B** (revisable Fleischner Society 2017 guidance → a
documentation-only `docs/citation-staleness.md` row). `lib/pulmnod-v115.js` +
`views/group-v40.js`. **This closes Wave 3 of the spec-v100 program (487 → 506,
+19).**

#### spec-v114 — COPD/bronchiectasis exacerbation & sleep (+6 → 501, Wave 3)

Wave 3 continues with six **pulmonary and sleep-medicine** decision rules. The
catalog had the chronic-airways *staging* tools (`gold-spirometry`, `bode-index`,
`predicted-spirometry`) and a sleep *screen* (`stop-bang`), but lacked the standard
acute-COPD-exacerbation prognosis, bronchiectasis-severity, and
sleep-disordered-breathing classifiers. All six home in **Clinical Scoring & Risk
(Group G)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `decaf-score` | Steer 2012 DECAF — eMRCD (5a +1, 5b +2) + eosinopenia + consolidation + acidemia + AF | **0–6, in-hospital mortality low 0–1 (1.4%) / intermediate 2 (8.4%) / high 3–6 (34.6%)** | A |
| `bap-65` | Tabak 2009 — class from the count of BUN ≥ 25 / AMS / pulse ≥ 109, age > 65 splits I↔II at zero | **class I–V, mortality 0.3→13.8%, ventilation need rises at IV/V** | A |
| `bronchiectasis-bsi` | Chalmers 2014 nine-item weighted table (prior-2-year admission window; MRC 1–5 scale) | **total, low 0–4 / intermediate 5–8 / high ≥ 9** | A |
| `faced-bronchiectasis` | Martínez-García 2014 — FEV1 < 50% (2) + Age ≥ 70 (2) + Pseudomonas (1) + Extension ≥ 3 lobes (1) + Dyspnea mMRC ≥ 3 (1) | **0–7, mild 0–2 / moderate 3–4 / severe 5–7** | A |
| `nosas-score` | Marti-Soler 2016 — neck > 40 (4), BMI 25–<30 (3)/≥30 (5), snoring (2), age > 55 (4), male (2) | **0–17, ≥ 8 high risk** | A |
| `ahi-odi-severity` | AASM 1999/2012 AHI bands + 3%-vs-4% ODI desaturation toggle | **normal < 5 / mild 5–<15 / moderate 15–<30 / severe ≥ 30; guards negative/non-finite AHI** | B |

The **research re-fetch corrected three spec-draft errors** (SOURCE governs):
FACED Extension scores at ≥ 3 lobes (not ≥ 2) and Dyspnea at mMRC ≥ 3 (not ≥ 2);
the BSI admission window is the prior **2 years** and uses the MRC 1–5 scale, not
mMRC. BAP-65 is a **class derived from a count**, not a 0–4 point sum — an
80-year-old with no acute variable is class II (0.9% mortality), not high-risk; the
mechanical-ventilation rates for the lower classes rest on a single source, so the
tile reports them qualitatively rather than publishing uncertain figures
(spec-v97 no-fabrication discipline). Each tile **reports the score/class/band, not
the order** (spec-v11 §5.3): the admit / ventilate / refer-for-sleep-study decision
stays with the clinician and local protocol. Five are **Class A** (fixed
derivation-paper weights, journal+author citations — no staleness row);
`ahi-odi-severity` is **Class B** (revisable AASM criteria → a documentation-only
`docs/citation-staleness.md` row). `lib/pulm-v114.js` + `views/group-v39.js`.
**Wave 3 reaches 501 (495 → 501, +6).**

#### spec-v113 — dynamic fluid-responsiveness indices (+3 → 495, Wave 3)

Wave 3 continues with the three **dynamic preload-responsiveness** indices an
intensivist uses at the bedside to decide whether a fluid bolus will help. The
catalog computed *static* hemodynamics (`hemodynamic-suite`, MAP, shock index,
cardiac-output math) but none of the dynamic indices. All three home in **Clinical
Math & Conversions (Group E)**:

| id | Rule | Output | Class |
|---|---|---|---|
| `ivc-fluid-responsiveness` | Barbier 2004 IVC index — spontaneous **collapsibility** (Dmax − Dmin)/Dmax × 100, mechanical **distensibility** (Dmax − Dmin)/Dmin × 100 | **index %, dIVC ≥ ~18% predicts a response**, per-mode denominator guard | A |
| `ppv-svv` | Michard 2000 — variation = (max − min)/([max + min]/2) × 100 | **% variation, PPV > ~13% / SVV > ~12%**, guarded mean denominator | A |
| `passive-leg-raise` | Monnet 2006 — %ΔSV = (peak − baseline)/baseline × 100 | **% change, ≥ 10–15% predicts a response**, guarded baseline | A |

Each tile **reports the index, not the fluid order** (spec-v11 §5.3): the
give-fluid / withhold / start-pressor decision stays with the clinician and local
protocol. The applicability caveats are rendered as a spec-v50 §3 posture note,
not enforced as a refusal — PPV/SVV require a regular rhythm, controlled
ventilation, and an adequate tidal volume; the IVC index mode must match the
breathing mode; the PLR technique (semi-recumbent baseline, measure within ~1 min)
is stated. Every ratio **guards its denominator** strictly positive, and a min
above max (IVC/PPV) or a peak below baseline (PLR) is surfaced as a
correctly-signed negative value in words, never clamped or leaked as
`NaN`/`Infinity`. All three are **Class A** (fixed ratio arithmetic with cited
thresholds), so none forces a `docs/citation-staleness.md` row.
`lib/fluidresp-v113.js` + `views/group-v38.js`. **Wave 3 reaches 495 (492 → 495,
+3).**

#### spec-v112 — ICU mortality & sepsis-coagulopathy (+5 → 492, **Wave 3 opens**)

Wave 3 (Critical care & pulmonary) **opens** with five standard bedside
instruments. The catalog carried the ICU *admission-severity* models (`apache2`,
`saps-ii`) and the sepsis-*triage* tools (`sirs`, `qsofa-sofa`, `curb-65`), but
the front-door sepsis-mortality, sepsis-coagulopathy, ventilator-pneumonia,
resuscitation-endpoint, and ICU-weakness instruments were reachable nowhere. Four
home in **Clinical Scoring & Risk (Group G)**; `lactate-clearance` is a **Group E**
clinical-math tile:

| id | Rule | Output | Class |
|---|---|---|---|
| `meds-score` | Shapiro 2003 MEDS: nine weighted items (terminal illness 6; tachypnea/hypoxia, shock, plt < 150k, bands > 5%, age > 65 each 3; LRI, nursing-home, AMS each 2) | **total 0–27 + 28-day mortality band** (very low → very high, ~0.9 → ~50%) | A |
| `sic-score` | Iba 2019 ISTH SIC: platelet + PT-INR + total SOFA (capped at 2) | **total 0–6, SIC met when ≥ 4 AND platelet+INR subscore ≥ 3** | A |
| `cpis-vap` | Pugin 1991 modified CPIS: temperature, leukocytes (+band-form bonus), secretions, oxygenation, radiograph, culture (+Gram-stain bonus) | **total 0–12, > 6 suggests VAP** | A |
| `lactate-clearance` | Nguyen 2004: (initial − repeat) / initial × 100 | **% clearance, ≥ 10% favorable**, guarded denominator | A |
| `mrc-sum-score` | De Jonghe 2002 MRC sum: six movements graded bilaterally (12 groups) each 0–5 | **sum 0–60, < 48 = ICU-acquired weakness, < 36 severe** | A |

**Three source-governance catches** (the spec-v97 re-fetch rule, three research
agents cross-verifying each point table against ≥ 2 independent sources): (1)
`sic-score` enforces the **platelet + PT-INR subscore floor of ≥ 3** (not the ≥ 2
a first reading assumed) — so the SOFA item alone can never diagnose SIC; (2)
`cpis-vap` uses the **Pugin band-forms ≥ 50%** leukocyte bonus, not MDCalc's
absolute "≥ 500" rendering, and the **ARDS exclusion** on the oxygenation item is
load-bearing; (3) `mrc-sum-score` grades elbow **flexion** (two secondary sources
transcribe "extension" in error) and the ICU-acquired-weakness threshold is
strictly **< 48**. `lactate-clearance` **guards division by zero** (initial must
be > 0) and reports a rising lactate as a correctly-signed negative clearance,
never `NaN`/`Infinity`. All five are **Class A** (fixed point weights /
thresholds / arithmetic), so none forces a `docs/citation-staleness.md` row. Each
renders the spec-v50 §3 clinical-posture note: it frames risk or likelihood, it
does not author a resuscitation, anticoagulation, ventilator, sedation, or
weaning order. `lib/critcare-v112.js` + `views/group-v37.js`. **This opens Wave 3
of the spec-v100 program (487 → 492, +5).**

### Billing & reimbursement: what Medicare pays, whether the line survives, how the visit codes, what the drug bills, what the patient owes, and whether the claim is clean (spec-v77 → spec-v83, program complete)

The catalog has always been strong on the clinician at the bedside and competent
on the operations clock (appeal/timely-filing/PA deadlines, the 2021 E/M
selectors). What it lacked is the math a revenue-cycle professional redoes for
every claim and **cannot Google**: what a line will actually pay, after every
reduction. [spec-v77](docs/spec-v77.md) charters a six-spec billing & coding
program and a new home group — **Group B "Billing & Reimbursement"** —
governed by the same determinism bar as a creatinine-clearance calculator.
[spec-v78](docs/spec-v78.md) ships the first feature: the **MPFS reimbursement
engine**, five calculators ([lib/billing-v78.js](lib/billing-v78.js),
[views/group-b.js](views/group-b.js)). Catalog 337 -> 342.

The Medicare allowable for one professional line is not a lookup — it is a
computation, then a chain of reductions applied in a fixed order. The engine
encodes the order once and each tile states where it sits:

```
   rvu-payment            mppr               bilateral-pay      multi-surgeon-pay   sequestration-adjust
   ───────────            ────               ─────────────      ─────────────────   ────────────────────
   [wRVU·wGPCI            100% of the        modifier 50 by     16% assistant /     2% of the program-
  + peRVU·peGPCI    ─▶    highest line,  ─▶  BILAT SURG     ─▶  62.5% co-surgeon ─▶ payment portion
  + mpRVU·mpGPCI]         50% each           indicator          / team by report   (after cost-share),
     × CF                 subsequent         (150/100/200%)                          never the cost-share
   = allowed (NF & F)     (endoscopy:        or a hard          gated 0/9 =          = net Medicare check
   + site differential     base rule)        not-payable gate   not payable
```

Worked anchor (hand-checked to the cent): CPT **99214**, National Average GPCI
(1/1/1), CY2026 conversion factor **$32.7442** → non-facility
`(1.92 + 1.5 + 0.13) × 32.7442 = $116.24`, facility
`(1.92 + 0.69 + 0.13) × 32.7442 = $89.72`, site-of-service differential
`(1.5 − 0.69) × 1 × 32.7442 = $26.52`. Money is **integer cents end-to-end**,
formatted once at the render edge through `fmt()` — no float `toFixed` leak, zero
`NaN`/`Infinity` by construction (the [spec-v59](docs/spec-v59.md) safety
contract). Indicators **gate, they do not guess**: every indicator-0/9 path is a
hard "not payable / does not apply" message, never a silent $0.

Indicator cheat sheet (the values a coder reads off the MPFS Relative Value File;
entered into the tile, per doctrine clause 2):

| Indicator | 0 | 1 | 2 | 3 | 9 |
|---|---|---|---|---|---|
| **BILAT SURG** (`bilateral-pay`) | mod 50 not payable | 150% of the pair | already bilateral, 100% | each side full, 200% | concept n/a |
| **ASST/CO/TEAM SURG** (`multi-surgeon-pay`) | not separately payable | payable with documentation | payable | — | concept n/a |
| **MULT PROC** (`mppr`) | no reduction | — | standard 100/50/50 | special (endoscopy/imaging) | concept n/a |

Design decisions, all inside the [spec-v77](docs/spec-v77.md) §2 doctrine and
recorded in the [spec-v78](docs/spec-v78.md) implementation notes: the GPCI
triplets, RVU shards, and dated conversion factor are consumed from the
**existing `data/mpfs` corpus** (already generated by `scripts/build-data.mjs`)
rather than a duplicate `data/gpci` dataset, and every one is **overridable** so
the tool never fails for a code or locality off the bundle (and the CF override
models a percent-of-Medicare contract); the MPFS policy **indicators are a
labeled user input** rather than bundled, keeping the bundle light and avoiding
shipping potentially-stale values; the five dated constants are
ledger-tracked (`pa-staleness-ledger.json` ruleFamily `billing-v78`); and the
tiles classify as schema.org `WebPage` like the existing `em-time` / `ndc-convert`
billing tiles.

**[spec-v79](docs/spec-v79.md) ships the program's second feature: claim edits &
modifier logic** ([lib/billing-v79.js](lib/billing-v79.js)), five decision engines
for the question v78 doesn't answer — *will this line deny, and which modifier
unlocks it?* Catalog **342 → 347**. Where v78 is arithmetic, v79 is adjudication:
each tile is a clean input → decision, and **indicators gate, never guess**. Per
doctrine clause 2 **no NCCI PTP edit file and no MUE value table ship** — the
indicator/value is a labeled user input, so the tool can never be silently stale.

```
  ncci-ptp           mue-check          modifier-x-selector   global-period         modifier-order
  ────────           ─────────          ───────────────────   ─────────────         ──────────────
  Col-1 vs Col-2;    units vs MUE by    most-specific of      surgery date + GLOB   re-sequence ≤4:
  modifier ind.:     MAI: 1 cut/split,  XE>XS>XP>XU, else     DAYS → in/out of      pricing modifiers
  0 hard bundle,     2 ABSOLUTE (never  59 fallback, else     the 000/010/090       FIRST, then
  1 NCCI-assoc.      pays), 3 review.   refuse (no basis).    package → 24/58/78/   informational;
  modifier may       w/ docs. payable   CMS prefers the       79 (post-op) or 57/   flag LT+RT, 26+TC,
  bypass, 9 not      vs at-risk units.  specific X over 59.    25 (pre-op), or       dup, multi-asst.
  an active edit.                                             bundled (not payable).
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`ncci-ptp` 11042/97597 indicator 1 + modifier 59 → *bypass permitted, 59 is
NCCI-associated*; `mue-check` 4 units vs MUE 1, **MAI 2** → *1 payable, 3 at risk,
absolutely non-payable — do not appeal as a units error*; `global-period` surgery
2026-01-01, **090**, follow-up 2026-02-01 unrelated E/M → *inside the window
2025-12-31 … 2026-04-01, modifier 24* (UTC calendar math reused from
[lib/deadline.js](lib/deadline.js), day-0 = surgery, boundary day **inside**);
`modifier-order` `59 26 RT` → *claim order `26 59 RT`* (26 pricing leads).

Decision cheat sheet (the indicators a coder reads off the CMS edit files and
enters, per doctrine clause 2):

| Indicator | Meaning | Tile |
|---|---|---|
| **PTP 0 / 1 / 9** | no modifier permitted / NCCI-associated modifier may bypass / not an active edit | `ncci-ptp` |
| **MAI 1 / 2 / 3** | claim-line cut (rescuable) / date-of-service **absolute** / date-of-service reviewable w/ docs | `mue-check` |
| **X{EPSU}** | XE encounter · XS structure · XP practitioner · XU unusual — most specific wins; 59 only if none fits | `modifier-x-selector` |
| **GLOB DAYS** | 000 day-of-service · 010 minor 10-day · 090 major 90-day (+1 preop) · XXX/YYY/ZZZ/MMM no fixed window | `global-period` |
| **post-op / pre-op mods** | 24 unrelated E/M · 58 staged · 78 return-to-OR · 79 unrelated · 57/25 decision-for-surgery | `global-period` |

`lib/billing-v79.js` is in the [spec-v59](docs/spec-v59.md) fuzz harness alongside
`lib/billing-v78.js` (every export throw-safe and banned-token-free across the
object-aware matrix), its five decision constants are ledger-tracked under
ruleFamily `billing-v79`, and all ten v78/v79 Group B tiles carry a
`docs/audits/v12/` audit log.

**[spec-v80](docs/spec-v80.md) ships the program's third feature: E/M & time-based
coding, completed** ([lib/billing-v80.js](lib/billing-v80.js)), six engines that
finish a surface the catalog only half-covered. The office `em-time` / `em-mdm`
tiles do 99202–99215; the AMA's 2023 overhaul extended the same 2-of-3 MDM grid to
**every** setting, and the time-unit codes (critical care, prolonged services,
therapy minutes, anesthesia) are each pure input → output band math. Catalog
**347 → 353**. Setting and payer/rule forks are **explicit, never inferred** — no
tile silently assumes Medicare or office.

```
  em-mdm-2023        critical-care-time   split-shared         prolonged-services    therapy-units        anesthesia-units
  ───────────        ──────────────────   ────────────         ──────────────────    ─────────────        ────────────────
  2-of-3 MDM →       net min (− proc):    substantive part:    AMA 99417/99418 vs    Medicare 8-min:      (base + time/15
  setting code:      <30 not crit care,   >½ time OR the MDM    Medicare G2212/G0316  8-22=1, 23-37=2,     + modifying) × CF;
  inpt 99221-33,     30-74 = 99291,       → who BILLS + FS;     — AMA floor = prim.   38-52=3, 53-67=4     AA/QZ 100%, QK/QY/
  ED 99281-85,       then 99292 ×N per     NPP pays 85% of      min+15, Medicare =    (cumulative) vs     QX 50%, AD flat 3
  SNF 99304-10,      +30 min (104→×1,      the fee schedule.    max+15 (higher) →     AMA Rule of Eights  base units. The one
  home 99341-50.     134→×2). subtract     2024 CMS rule.       99205 75 vs 89 min.   (per-service) —     fee NOT on the RVU
  office → em-mdm.   the procedure time.                        each unit +15 min.    diverge at remndrs.  formula.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`em-mdm-2023` ED, Moderate MDM (problems & data reach Moderate, risk limits) →
**99284**; `critical-care-time` 104 net minutes → **99291 + 99292 ×1**;
`split-shared` physician 20 of 35 min → *physician bills, modifier FS, 100%*;
`prolonged-services` Medicare 99205 at 90 min → **G2212 ×1** (Medicare floor 89;
the AMA 99417 floor is 75 — the error this prevents); `therapy-units` 50
cumulative minutes → **3 units**; `anesthesia-units` 5 base + 60 min (4 time
units) + 1 modifying = **10 units × $22 = $220**, QK 50% = **$110**.

E/M & time-unit cheat sheet (what the tile turns into a code/units):

| Tile | Input | Output |
|---|---|---|
| `em-mdm-2023` | setting + 2-of-3 MDM (SF/Low/Mod/High) | the setting-specific code (99221–99350) + the limiting element |
| `critical-care-time` | net critical-care minutes | nothing <30 · 99291 for 30–74 · 99291 + 99292 ×N |
| `split-shared` | time split **or** who did the MDM | which provider bills · modifier **FS** · 100% (MD) vs **85%** (NPP) |
| `prolonged-services` | primary code + payer + total time | **99417/99418** (AMA) vs **G2212/G0316** (Medicare), units at +15 min |
| `therapy-units` | total min (Medicare) or per-service (RoE) | billable units + where the two rules **diverge** |
| `anesthesia-units` | base + time + mod + CF + direction | total units · (units × CF) · the medical-direction % |

`lib/billing-v80.js` joins the fuzz harness, its dated constants (the anesthesia
CF, the prolonged thresholds, the medical-direction percentages, the CPT E/M
edition) are ledger-tracked under ruleFamily `billing-v80`, and all six tiles
carry a `docs/audits/v12/` audit log — sixteen Group B audit logs in all. One
implementation note (recorded in the [spec-v80](docs/spec-v80.md) status):
`prolonged-services` ships the **physician** add-ons; the clinical-staff
99415/99416 path is deferred rather than shipped with an unverifiable threshold.
The last program spec ([v83](docs/spec-v83.md) claim integrity & facility
payment) has now shipped, closing the program at a 366 state (337 → 366, +29).

**[spec-v81](docs/spec-v81.md) ships the program's fourth feature: drug & infusion
billing** ([lib/billing-v81.js](lib/billing-v81.js)), three engines for the place
claims hemorrhage money and trigger audits. The HCPCS billing unit is almost never
the milligrams given; the JW/JZ discarded-drug rules are mandatory and error-prone;
and the 96360–96379 infusion hierarchy makes the primary code depend on the
*timeline*, not the drug. Catalog **353 → 356**. The vial-type fork is a **hard
gate** — a multi-dose vial **refuses** JW, it is not merely warned.

```
  ndc-hcpcs-units                drug-wastage                       infusion-hierarchy
  ───────────────                ────────────                       ──────────────────
  dose ÷ billing-unit size,      single-dose vial: administered     ONE initial per encounter,
  rounded per the rule           on one line + discarded with JW;   by the CMS HIERARCHY not
  (up/nearest/down):             zero waste → JZ (req. 2023-07-01). the clock — chemo > therap.
  35 mg ÷ 10 mg/unit = 3.5       multi-dose → JW REFUSED.           > hydration; infusion > push.
  → 4 units (flagged not a       admin + JW must total the units    <16-min infusion → IV push.
  clean multiple).               drawn. + least-waste vial search.  rest = seq/concurrent/+hr/push.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`ndc-hcpcs-units` 35 mg ÷ 10 mg/unit = **3.5 → 4 billing units** (rounded up, not a
clean multiple); `drug-wastage` 35 mg from a 50 mg single-dose vial (10 mg unit) →
**4 administered + 1 discarded (JW)** of **5** units drawn; `infusion-hierarchy`
chemo + therapeutic + hydration → chemo infusion is the initial **96413** (by
hierarchy, not chronology), therapeutic sequential **96367**, hydration **96361**.

Drug & infusion cheat sheet (what the tile turns into units/codes):

| Tile | Input | Output |
|---|---|---|
| `ndc-hcpcs-units` | dose + unit · billing-unit size · rounding | billing units · exact ratio · **not-a-clean-multiple** flag |
| `drug-wastage` | vial size · dose · unit · vial type (± sizes) | administered + **JW** units · **JZ** verdict · multi-dose **refusal** · least-waste vials |
| `infusion-hierarchy` | per-administration list (type, minutes) | the single **initial** code + every add-on role (seq/concurrent/+hour/push) |

`lib/billing-v81.js` joins the fuzz harness, its dated constants (the JZ-required
date, the 16-minute infusion/push floor, the 96360–96379 hierarchy ordering) are
ledger-tracked under ruleFamily `billing-v81`, and all three tiles carry a
`docs/audits/v12/` audit log — nineteen Group B audit logs in all. The tiles
compose with the existing `ndc-convert` (a digit-format converter, a different job)
and `mme-factors` without shadowing them; all are retained and cross-linked.

**[spec-v82](docs/spec-v82.md) ships the program's fifth feature: patient
responsibility & coordination of benefits** ([lib/billing-v82.js](lib/billing-v82.js)),
four engines that compute what the *patient* owes (spec-v78 computes what the *payer*
pays). These are the numbers on the statement the patient actually reads — pure
arithmetic billing offices routinely get wrong. They land in **Group C "Patient Bill
& Insurance Tools"** beside the appeal/deadline generators. Catalog **356 → 360**.
Money is integer cents end-to-end; the protection/network gate is **hard**, not the
patient-favorable default.

```
  medicare-cost-share        cob-calc                       allowed-amount             nsa-cost-share
  ───────────────────        ────────                       ──────────────             ──────────────
  Part B: deductible then    secondary payment + patient    charge − allowed =         protected service →
  20% of the allowed.        residual under ONE named       contractual WRITE-OFF;     cost-share capped at
  Part A: $1,736 ded +       method: lesser-of /            patient owes cost-share    the in-network amount
  $434/day (61-90) +         come-out-whole / non-          on the ALLOWED, not the    off the QPA; balance
  $868/day (LRD).            duplication / MSP — never      charge. In-network →       billing PROHIBITED.
  SNF: $217/day (21-100).    silently picked.               balance bill PROHIBITED.   Non-protected → refused.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`medicare-cost-share` Part B $500 approved → **$283 deductible + 20% of $217 ($43.40)
= $326.40**, Medicare pays **$173.60**; `cob-calc` lesser-of (primary left a $120
balance, secondary would pay $400) → secondary pays **$120**, patient residual **$0**;
`allowed-amount` charge $1,000 / allowed $600 in-network → **$400 write-off**, patient
**$200**, payer **$400** (balance billing the gap prohibited); `nsa-cost-share`
protected emergency, QPA $800, 20% → patient **$160**, plan **$640**, **$200**
prohibited balance bill.

Patient-bill cheat sheet (what the tile turns the claim into):

| Tile | Input | Output |
|---|---|---|
| `medicare-cost-share` | Part A/B/SNF + the dated CMS amounts | deductible + coinsurance the **patient** owes, before Medigap |
| `cob-calc` | primary allowed/paid · secondary allowed/would-pay · method | secondary payment + **patient residual** under the named method |
| `allowed-amount` | charge · allowed · benefit · in-network? | **write-off** + patient responsibility + payer pay · balance-bill flag |
| `nsa-cost-share` | service category · QPA · benefit | capped cost-share + **prohibited balance bill**, or a hard refusal |

`lib/billing-v82.js` joins the fuzz harness (zero non-finite leaks), shares the
integer-cents `dollarsToCents` with `lib/billing-v78.js`, and its dated CY2026 CMS
cost-sharing constants (the Part A/B deductibles, the day-banded and SNF coinsurance,
the 20% Part B share) are ledger-tracked under ruleFamily `billing-v82`. All four
tiles carry a `docs/audits/v12/` audit log. The deductible-before-coinsurance ordering
is encoded once and tested at the partial-deductible boundary — the case practices
miscompute.

**[spec-v83](docs/spec-v83.md) ships the program's sixth and final feature: claim
integrity & facility payment** ([lib/billing-v83.js](lib/billing-v83.js)), six engines
that close two gaps at once. Four **validators** catch a bad identifier or an
out-of-balance remittance *before* the clearinghouse rejects it; two **facility
pricers** compute the UB-04 institutional side (IPPS DRG, OPPS APC) the professional
spec-v78 engine does not touch. Catalog **360 → 366** — and with it the spec-v77
billing & coding program is **complete: 337 → 366 (+29)**. The validators verify
**format/structure only** (never enrollment, entitlement, or clinical correctness) and
say so on the tile; the pricers read the bundled `data/drg` / `data/apc` relative
weights but take every dated rate as an input, so they price any DRG/APC off-bundle.

```
  npi-validate          mbi-validate         icd10-validate        era-balance
  ────────────          ────────────         ──────────────        ───────────
  Luhn (ISO 7812) over  11-char CMS position grammar, structure +     billed = paid +
  80840 + the 9 digits; grammar; excluded   the required 7th       Σ(CO/PR/OA/PI);
  recompute & SHOW the  letters S,L,O,I,B,Z; char; placeholder X.   residual to the
  check digit, so a     names the FIRST      "denies for           cent; Σ PR = the
  transposition shows.  offending position.  specificity" flag.    patient balance.

  drg-payment (IPPS)                          apc-payment (OPPS)
  ──────────────────                          ──────────────────
  weight × wage-adjusted base (operating +    weight × conversion factor × wage;
  capital); post-acute transfer → per-diem    status-indicator packaging (N → $0);
  (first day doubled, capped at the full DRG).multiple-procedure discount on status-T.
```

Worked anchors (each reproduced to the letter by the example-correctness e2e):
`npi-validate` **1234567893** → valid, recomputed Luhn check digit **3** (a transposed
final digit is caught with the expected digit shown); `mbi-validate` **1EG4-TE5-MK73** →
valid against all **11** positions; `icd10-validate` **M54.5** → valid structure (and
`S52.5` flagged incomplete when a 7th character is required); `era-balance` billed
**$200** − paid **$120** − CO **$50** − PR **$30** = **$0** residual, patient owes **$30**;
`drg-payment` weight **1.5** × wage-adjusted base **$6,500** = **$9,750** (a 2-day
transfer at GMLOS 5 → **$5,850**); `apc-payment` two status-T procedures at CF **$87**
→ **$870** + **$174** (the second discounted **50%**), a packaged status-N line **$0**,
total **$1,044**.

Claim-integrity & facility cheat sheet (what the tile turns the claim into):

| Tile | Input | Output |
|---|---|---|
| `npi-validate` | a 10-digit NPI, or a 9-digit base | valid/invalid + the **recomputed check digit**, or the generated 10th digit |
| `mbi-validate` | an MBI string | valid/invalid + the **first offending position & rule** (incl. excluded letters) |
| `icd10-validate` | an ICD-10-CM code (± 7th-char-required) | structural validity + the **missing-7th-character / specificity** flag |
| `era-balance` | billed · paid · CO/PR/OA/PI | balances? + the exact **residual** + the **Σ PR** patient balance to post |
| `drg-payment` | DRG weight · operating/capital base · wage · transfer | base DRG payment + the **per-diem transfer** reduction + add-ons |
| `apc-payment` | APC lines (weight, status) · CF · wage · discount | per-line + total, with **packaging** and the **multiple-procedure discount** |

`lib/billing-v83.js` joins the fuzz harness (zero non-finite leaks), all money is
integer cents, and its dated constants (the IPPS operating/capital base rates, the OPPS
conversion factor, the MBI grammar/excluded-letter set) are ledger-tracked under
ruleFamily `billing-v83`. All six tiles carry a `docs/audits/v12/` audit log — the
final entries in a complete Group B of twenty-five billing & reimbursement engines.

## System design and architecture overview

The application is one HTML file, one CSS file, one JavaScript module set,
a service worker, and a data folder of sharded JSON. There is no backend.
The browser receives static files from the same origin and runs everything
locally. Data shards are loaded only when a utility that needs them is
opened. The service worker pre-caches the application shell on first load and
caches data shards on first access, keyed to the build hash so new
deployments invalidate old caches cleanly. The
application has zero runtime dependencies. A weekly CI job runs the data
refresh pipeline and opens a pull request with any updated data. For the
long version, see [docs/architecture.md](docs/architecture.md).

```
            BUILD TIME (CI)                          RUNTIME (browser, offline-capable)
 ┌───────────────────────────────┐         ┌──────────────────────────────────────────┐
 │ public datasets (CMS, FDA,    │         │  index.html  +  styles.css  +  app.js      │
 │ AMA, NPPES, …)                │         │        │                                   │
 │        │  scripts/build-data  │         │        ▼                                   │
 │        ▼                      │  ship   │   router (URL hash)  ──►  tile view        │
 │  sharded JSON  + SHA-256      │ ──────► │        │                     │             │
 │  manifests (data/)            │  static │        ▼                     ▼             │
 │        │  scripts/build       │  files  │   lazy-load data shard   pure compute      │
 │        ▼                      │         │   (verified vs manifest)  (lib/*.js)       │
 │  dist/  (774 tool pages,      │         │        │                     │             │
 │  OG cards, sitemap, SBOM)     │         │        ▼                     ▼             │
 └───────────────────────────────┘         │   service worker cache    result + cite   │
                                            │   (keyed to build hash)                    │
   CSP: connect-src 'self'  ───────────────►│   NO outbound network · local-only · NO AI │
                                            └──────────────────────────────────────────┘
```

The trust boundary is the CSP `connect-src 'self'` directive: once the static
shell is served, the page cannot open a network connection, so user input
physically cannot leave the device. Everything below the router is a pure
function of (URL hash + bundled data); there is no mutable server state, no
session, and nothing to log.

### Build output & the CI gate chain

`npm run build` is deterministic: same inputs → same `dist/` (the build hash is
content-addressed). One build emits **757 HTML pages** plus the supporting
assets:

| Output | Count | Source |
|--------|------:|--------|
| Pre-rendered tool pages (`dist/tools/<id>/`) | 774 | `scripts/build-tool-pages.mjs` |
| Audience hub pages (`dist/for/<audience>/`) | 6 | `scripts/build-hub-pages.mjs` |
| Topic pages + `/topics/` index | 8 + 1 | `scripts/build-topic-pages.mjs` |
| `/commitments/` | 1 | `scripts/build-commitments-page.mjs` |
| SPA shell (`dist/index.html`) | 1 | copied + LD-stamped |
| **Total HTML** | **757** | — |
| OG card PNGs (`dist/og/`) | 754 | `scripts/build-og-images.mjs` |
| Sitemap URLs (`sitemap.xml`) | 756 | `scripts/build-sitemap.mjs` |

Nothing ships unless it survives the gate chain. `npm run lint` is ESLint
followed by seven custom static checks, each enforcing one invariant; any
failure is a non-zero exit that blocks the merge:

| Gate (`scripts/`) | Invariant it enforces |
|-------------------|-----------------------|
| `grep-check.mjs` | no banned tokens (em-dashes in tests, stale counts, AI/telemetry strings) |
| `check-us-english.mjs` | no British spelling / non-US drug name in a user-facing surface (`lib/`, `views/`, `app.js`, `index.html`); citations, journal abbreviations, and official instrument names are exempt (spec-v184) |
| `check-output-safety.mjs` | no view interpolates unescaped user input into the DOM |
| `check-citations.mjs` | every tile is cited; guideline-issuer tiles carry an accessed-date + a staleness-ledger row |
| `check-catalog-truth.mjs` | the catalog count (745) is identical across all 13 surfaces; no orphan/removed-tile ids |
| `check-commitments.mjs` | storage allowlist + AI/auth deny + license + CSP are intact |
| `check-pa-staleness.mjs` | every PA rule is source-anchored and within its freshness window |
| `audit-pa.mjs` | the 46 PA-linter fixtures still reproduce their committed golden reports |

`npm run test` adds the 5,869-test unit suite, the a11y check, and dataset
integrity verification; `npm run test:e2e` runs the Playwright suite against
real Chromium/Firefox/WebKit — including a full-catalog 320 px no-horizontal-
scroll sweep over every SPA route **and** every one of the 745 pre-rendered
static tool pages, so a tile can never ship mobile overflow undetected.

### Repository layout

```
index.html          single-page shell (hero-search combobox + static browse-by-category nav, tile mount)
styles.css          one stylesheet (responsive; no horizontal scroll — enforced catalog-wide at 320px in CI)
app.js              router, hero-search wiring, view wiring, the UTILITIES catalog
                    (774 tiles — the single source of truth; zero runtime deps)
sw.js               service worker — precache shell, cache shards by build hash
theme.js            light/dark theme toggle (writes only sw-theme, allowlisted)
lib/input-persist.js opt-in "remember my inputs" (off by default; numbers only)
lib/                pure compute modules, one per tile family
  ├─ data.js        same-origin data loader (per-URL promise cache)
  ├─ meta.js        per-tile citation / example / source-stamp metadata
  ├─ clinical*.js   clinical math / scoring / criteria
  └─ pa/            the prior-auth linter: extract · classify · payer · rules ·
                    engine · report · docx · staleness  (spec-v52)
views/              per-group view renderers (group-*.js, pa-lint.js)
data/               sharded public datasets + SHA-256 manifests (46 datasets)
scripts/            build-*, check-* (catalog-truth, output-safety, citations,
                    commitments, PA staleness), audit-* — the CI gate chain
docs/               specs (spec-v4 onward) + per-tile v11/v12 audit logs +
                    citation-staleness ledger +
                    architecture / threat-model / …
test/               unit/ (node:test) · integration/ (Playwright) · fixtures/
dist/               build output (774 tool pages, OG cards, sitemap, SBOM)
```

### Discovery: how a query finds the right tool among 774

With 774 tiles, search quality *is* the product — a tool you cannot find does
not exist. Discovery is deterministic and offline (no fuzzy-match service, no
embedding model, no AI). The home `#hero-search` combobox builds its dropdown
from two complementary rankers, both pure functions of the typed query:

```
type into #hero-search
          │
          ├─► searchUtilities() ── fast name/id ranker (exact / prefix /
          │     (the dropdown list)   substring / word-boundary over every
          │                           tile's name + id) → ranked top 12
          │
          └─► resolvePrompt() ───── the synonym + phrasing resolver below;
                (surfaced first)     its single best tile is hoisted to the
                                     top of the list so patient phrasing that
                                     shares no token with a tile name still
                                     wins ("they denied it" → appeal-letter,
                                     "kidney function" → egfr).
```

`resolvePrompt` ([lib/prompt.js](lib/prompt.js)) runs the query through three
ordered passes and returns the single best tile id or `null`:

```
query ─► normalizePhrase (lowercase, strip punctuation, collapse spaces)
          │
          ▼
   ① synonym table ── data/synonyms.json: hand-curated patient phrasing
          │            ("they denied it" ► appeal-letter). Exact/substring,
          │            audience-aware. Hit ► return {why:'synonym'}.
          ▼ miss
   ② token ranker ── rankTiles(): score every tile by the rubric below,
          │            keep the best if it clears the threshold.
          ▼ miss
   ③ edit-distance retry ── re-run the synonym table allowing one typo
                            (withinOneEdit) ► return {why:'synonym-edit-distance'}.
```

The ranker scores each tile against a transparent, unit-tested rubric
(`RANKER_RUBRIC`); the highest score wins, and nothing surfaces below the
threshold (so a weak partial match returns `null` rather than a wrong tool):

| Signal | Weight | Where it comes from |
|---|---|---|
| Exact query phrase in the tile **name** | +10 | `name` |
| Exact query phrase in the **description** | +5 | `desc` |
| Per-token match in the **name** | +3 | tokenized `name` |
| Per-token match in the **description** | +1 | tokenized `desc` |
| Per-token match in an **audience / tag / specialty** | +1 | `audiences` + `tags` + `specialties` |
| Audience-aligned with the active audience | +2 | the `#a=` deep-link audience (nurse-first by default) |
| Audience-misaligned | −2 | — |
| **Surfacing threshold** | **3** | a result must score ≥ 3 |

**Design decisions.** (1) Curated synonyms run *first* because patient phrasing
("my labs are weird") rarely shares tokens with a clinical tile name
(`lab-interpret`); the ranker handles the long tail of clinician/biller queries.
(2) `specialties` and `tags` are weighted +1 — they are *boosters and
tie-breakers*, not primary routes: a lone specialty hit (+1) sits below the
threshold (3), so "nephrology" surfaces `egfr` only when it also matches the
name/description, never on the tag alone. That keeps the specialty backfill
(every clinical tile now carries specialty tags, via `SPECIALTIES_BACKFILL` in
[lib/meta.js](lib/meta.js)) from flooding results with loose tag-only matches.
(3) The whole
path is pure and deterministic, so it is exhaustively unit-tested
([test/unit/prompt.test.js](test/unit/prompt.test.js)) — including the audience
alignment and the specialty tie-break — and adds no network call.

### Provenance and citation integrity (spec-v54 design, spec-v60 completion)

A login-less, AI-free calculator earns trust only if the nurse can see, on the
tile, exactly which published source produced the number — and tell whether that
source is current. spec-v54 defined the invariants; spec-v60 built the machinery
(the gate, the ledger, and the `citationAccessed` convention) and extended it
across the full 774-tile catalog, pinning the last three unpinned "current
edition" phrases and re-verifying every guideline tile against its latest known
edition. Three invariants make that auditable, each enforced by the
`check-citations.mjs` lint gate (in the `npm run lint` chain) over all 774 tiles:

| Invariant | Rule | Enforcement |
|---|---|---|
| **Inline** | every `clinical: true` tile has a non-empty `META[id].citation` | gate rule 1 (every clinical tile, 0 off-tile) |
| **Well-formed** | no bare URL in citation text (URLs live in `citationUrl`); `citationUrl` parses as `https://` | gate rules 2–3 |
| **Current — or justified-stale** | a guideline-issuer citation carries an `accessed` date **and** a staleness-ledger row; no unpinned "current edition" phrase | gate rules 4–5 (the guideline-issuer tiles) |

```
META[id].citation  ──►  check-citations.mjs  ──►  guideline-issuer?  ──► needs accessed + ledger row
   (lib/meta.js)         (case-sensitive /\b(CDC|KDIGO|AGS|ACC|         │
                          AHA|ATS|IDSA|ESC|WHO|AAP|ACOG|SAMHSA|         ▼
                          NICE)\b|Joint Commission/)         docs/citation-staleness.md
                                                             (shipped vs latest edition + justification)
```

The ledger ([docs/citation-staleness.md](docs/citation-staleness.md)) is the
one-file answer to "is Sophie current?": one row per guideline tile naming the
**edition shipped**, the **latest known edition**, the **accessed** date, and a
**justification** wherever the two differ. Two examples of a *justified* gap:
KDIGO AKI staging is deliberately kept at the 2012 edition because the 2024 KDIGO
update governs CKD evaluation, not AKI staging; the 2013 ACC/AHA Pooled Cohort
Equations (`ascvd`) are retained as the still-widely-charted instrument while the
race-free 2024 AHA PREVENT model ships separately as the `prevent` tile.

**Design decision — no build-time link checker.** URL *syntax* is verified
statically; URL *liveness* is a human step at the quarterly source pull, stamped
via `citationAccessed`. Fetching every DOI at build time would be a network call,
which the dependency/network budget (spec-v10, spec-v50 §3) forbids. The
gate's pure detector is unit-tested with one negative fixture per rule, and a
Playwright pin ([test/integration/citations.spec.js](test/integration/citations.spec.js))
confirms a long-DOI tile renders its inline citation and wraps — no horizontal
scroll — at 320px.

### Show your work: source-anchored derivations (spec-v48)

A citation tells the nurse *where* a number comes from; a derivation shows *how
this number* was built from the inputs in front of her. Every wired score tile
carries a collapsed **"Where does this come from?"** block
([docs/spec-v48.md](docs/spec-v48.md)) that, on each input change, re-renders the
formula, the original study population, the limits of validity, a verbatim source
quote, and a live `Your inputs` list whose per-input contributions sum to the
score. Coverage has been backfilled in small reviewable waves (the running count
is in the feature summary above and in [CHANGELOG.md](CHANGELOG.md)).

The block is pure data. `META[id].derivation` declares it; `lib/derivation.js`
renders it with no `innerHTML` and no third-party deps:

```js
META.gbs.derivation = {
  formula: 'Glasgow-Blatchford = sum of weighted markers (0-23): …',
  components: [
    // a fixed integer weight …
    { inputKey: 'melena', label: 'Melena present', points: 1 },
    // … or a (value, allInputs) callback for banded / sex- / age- /
    //   cross-input weights (here hemoglobin is scored by sex):
    { inputKey: 'hgbGdl', label: 'Hemoglobin (g/dL)',
      points: (v, inputs) => hgbBand(v, inputs.sex) },
  ],
  bands: [ /* total → interpretation */ ],
  population: '…', units: { /* one entry per inputKey */ }, validity: '…',
  source: 'Blatchford O, et al. Lancet. 2000;360:1318-1321.', // verbatim citation
};
```

A `points` value is either a fixed integer weight or a `(value, inputs) => number`
callback. The callback form is what lets a single uniform renderer express banded
thresholds (Glasgow-Blatchford, Oakland, MODS), sex-specific cutoffs (GBS
hemoglobin), severity dominance (Charlson), reverse-scored items (DAST-10,
GDS-15), and age-banded cutoffs (PELOD-2, pSOFA) without bespoke per-tile render
code — each callback sees the whole input object, not just its own field.

```
input change ─► updateDerivationSteps(detailsEl, META[id], inputs)
                    │  per component:  pts = points(inputs[inputKey], inputs)
                    ▼
                Your inputs:   +pts — label (input: value)   × N
                Total: Σ pts   →   band
                    ▲
   CI cross-check (test/unit/derivation.test.js):
       re-sum the SAME components and assert  Σ pts === scoringFn(inputs)
       across boundary cases, for every wired tile
```

**The guarantee that makes it trustworthy.** The on-screen breakdown and the
headline score come from two independent code paths — the derivation `components`
(metadata in `lib/meta.js`) and the tile's scoring function (`lib/*.js`). A unit
suite ([test/unit/derivation.test.js](test/unit/derivation.test.js)) re-sums the
components for every wired tile across boundary cases and asserts the total equals
the live score, and a units-coverage guard asserts every `inputKey` is documented.
So the "show your work" panel **cannot silently drift** from the number the nurse
acts on: a mis-transcribed weight, or a shared scoring table changing under a
copied band, fails CI. Non-finite inputs route through `fmt()` (spec-v59), so a
blank or impossible field renders an em-dash — never `NaN` — in the breakdown.

## The Prior-Auth Packet Linter (`pa-lint`)

`pa-lint` (spec-v52) is the catalog's first `document-linter` tile: instead
of form fields it consumes dropped files (PDF / DOCX / TXT) and produces a
deterministic findings report. It checks the *procedural completeness* of a
prior-authorization packet — is the member ID present, is the ordering NPI
Luhn-valid, is a clinical note attached, does an inpatient Aetna,
UnitedHealthcare, Anthem, Cigna, Humana, HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, or BCBS Alabama request carry a
discharge plan — **not** clinical
coverage criteria, which are the reviewer's judgment.
Everything runs in the browser; the packet never leaves the tab.

The pipeline is a pure, byte-deterministic function of the input bytes
(spec-v52 §4.10): the same packet always yields the same report, which is
what makes the golden-fixture CI gate possible.

```
 drop files (PDF/DOCX/TXT/scanned-PDF/image)
        │
        ▼
 ┌──────────────┐   pdf.js / mammoth.js (vendored, no network)
 │   ingest     │── extract text, SHA-256 each file
 └──────┬───────┘   scanned PDF / image? → "Run on-device OCR" button →
        │           tesseract.js (vendored, lazy, same-origin, in-worker)
        │           → text → re-run pipeline   (spec-v52 §4.3.1)
        ▼
 ┌──────────────┐   lib/pa/extract.js  → codes, dates, NPIs, POS, signatures
 │   extract    │   lib/pa/classify.js → per-document role (clinical-note,
 └──────┬───────┘                         imaging-report, lab-result, …)
        ▼
 ┌──────────────┐   lib/pa/payer.js → one bucket: cms-medicare-ffs |
 │ detect payer │     cms-medicare-advantage | medicaid | medicaid-ca |
 └──────┬───────┘     medicaid-ny | medicaid-tx | medicaid-fl | medicaid-oh |
        ▼               medicaid-il | medicaid-wa | medicaid-ga | medicaid-nc |
        ▼               medicaid-pa | medicaid-mi | medicaid-nj | medicaid-az |
        ▼               medicaid-in |
        ▼               aetna | uhc | anthem | cigna |
        ▼               humana | hcsc | highmark | florida-blue | bcbsm |
        ▼               blue-shield-ca | ibx | carefirst | bcbsnc | horizon |
        ▼               bcbst | bcbsma | bcbsal | bcbssc | arkbcbs | bluekc |
        ▼               bcbsmn | bcbsla | hmsa | commercial | unknown
 ┌──────────────┐   lib/pa/rules.js → 876 rules, each a pure check(bundle).
 │  run engine  │   Overlay rules self-gate on the detected payer and
 └──────┬───────┘   vacuously pass off-bucket.
        ▼
 ┌──────────────┐   lib/pa/report.js → severity-sorted findings + evidence
 │ build report │   Three downloads, all built in-tab:
 └──────────────┘     • full JSON   • PHI-redacted JSON   • DOCX (§4.6/§4.7)
```

Severities follow spec-v52 §4.4: `block` (packet cannot be reviewed as-is),
`flag` (likely denial / RFI), `info` (nice-to-have), `pass`. A finding never
guarantees an approval or a denial — it reports only what the ruleset checks.

### Ruleset at a glance (876 rules)

| Family            | Count | Scope                                                        | Ledger source              |
|-------------------|-------|--------------------------------------------------------------|----------------------------|
| `R-PA-NNN`        | 60    | §4.5.1 core, payer-agnostic completeness (IDs, codes, NPI, dates, signatures, PHI minimization) | AMA CPT / CMS HCPCS / ICD-10-CM / POS / NCCI / NPPES |
| `R-PA-CMS-NNN`    | 25    | §4.5.2 Medicare FFS DME / oxygen / PAP / mobility            | CMS IOM 100-08, NCD/LCD     |
| `R-PA-MA-NNN`     | 15    | §4.5.3 Medicare Advantage                                    | CMS MA 422                  |
| `R-PA-MCD-NNN`    | 10    | §4.5.4 Medicaid state-agnostic core                          | Medicaid core              |
| `R-PA-RAD-NNN`    | 5     | §4.5.5 radiology / advanced imaging                          | ACR Appropriateness        |
| `R-PA-INF-NNN`    | 5     | §4.5.5 infusion / biologics                                  | FDA labeling               |
| `R-PA-SURG-NNN`   | 5     | §4.5.5 surgery (conservative trial, imaging, ASA, consent)   | Surgical-indication policy  |
| `R-PA-BH-NNN`     | 5     | §4.5.5 behavioral health (DSM-5-TR, LOC, risk)               | DSM-5-TR                   |
| `R-PA-GEN-NNN`    | 5     | §4.5.5 genetic testing                                       | NCCN / ACMG                |
| `R-PA-AETNA-NNN`  | 20    | §4.5.7 Aetna commercial overlay — the first named-payer set  | `aetna-precert`            |
| `R-PA-UHC-NNN`    | 20    | §4.5.8 UnitedHealthcare commercial overlay — the second named-payer set | `uhc-precert`   |
| `R-PA-ANTHEM-NNN` | 20    | §4.5.9 Anthem BCBS / Elevance commercial overlay — the third named-payer set | `anthem-precert` |
| `R-PA-CIGNA-NNN`  | 20    | §4.5.10 Cigna commercial overlay — the fourth named-payer set | `cigna-precert`            |
| `R-PA-HUMANA-NNN` | 20    | §4.5.11 Humana commercial overlay — the fifth named-payer set | `humana-precert`           |
| `R-PA-HCSC-NNN`   | 20    | §4.5.12 HCSC / Blue Cross Blue Shield (IL/TX/MT/NM/OK) — the sixth named-payer set | `hcsc-precert` |
| `R-PA-HIGHMARK-NNN` | 20  | §4.5.13 Highmark / Blue Cross Blue Shield (PA/WV/DE/NY) — the seventh named-payer set | `highmark-precert` |
| `R-PA-FLBLUE-NNN` | 20  | §4.5.14 Florida Blue / GuideWell (Blue Cross and Blue Shield of Florida) — the eighth named-payer set | `floridablue-precert` |
| `R-PA-BCBSM-NNN` | 20  | §4.5.15 BCBSM / Blue Cross Blue Shield of Michigan (+ Blue Care Network) — the ninth named-payer set | `bcbsm-precert` |
| `R-PA-BSCA-NNN` | 20  | §4.5.16 Blue Shield of California — the tenth named-payer set | `blueshieldca-precert` |
| `R-PA-IBX-NNN` | 20  | §4.5.17 Independence Blue Cross (southeastern PA / Philadelphia) — the eleventh named-payer set | `ibx-precert` |
| `R-PA-CAREFIRST-NNN` | 20 | §4.5.18 CareFirst BlueCross BlueShield (MD / DC / Northern VA) — the twelfth named-payer set | `carefirst-precert` |
| `R-PA-BCBSNC-NNN` | 20 | §4.5.19 Blue Cross Blue Shield of North Carolina (Blue Cross NC) — the thirteenth named-payer set | `bcbsnc-precert` |
| `R-PA-HORIZON-NNN` | 20 | §4.5.20 Horizon Blue Cross Blue Shield of New Jersey — the fourteenth named-payer set | `horizon-precert` |
| `R-PA-BCBST-NNN` | 20 | §4.5.21 Blue Cross Blue Shield of Tennessee — the fifteenth named-payer set | `bcbst-precert` |
| `R-PA-BCBSMA-NNN` | 20 | §4.5.22 Blue Cross Blue Shield of Massachusetts — the sixteenth named-payer set | `bcbsma-precert` |
| `R-PA-BCBSAL-NNN` | 20 | §4.5.23 Blue Cross Blue Shield of Alabama — the seventeenth named-payer set | `bcbsal-precert` |
| `R-PA-BCBSSC-NNN` | 20 | §4.5.24 Blue Cross Blue Shield of South Carolina — the eighteenth named-payer set | `bcbssc-precert` |
| `R-PA-ARKBCBS-NNN` | 20 | §4.5.25 Arkansas Blue Cross and Blue Shield — the nineteenth named-payer set | `arkbcbs-precert` |
| `R-PA-BLUEKC-NNN` | 20 | §4.5.26 Blue Cross and Blue Shield of Kansas City — the twentieth named-payer set | `bluekc-precert` |
| `R-PA-BCBSMN-NNN` | 20 | §4.5.27 Blue Cross and Blue Shield of Minnesota — the twenty-first named-payer set | `bcbsmn-precert` |
| `R-PA-BCBSLA-NNN` | 20 | §4.5.28 Blue Cross and Blue Shield of Louisiana — the twenty-second named-payer set | `bcbsla-precert` |
| `R-PA-HMSA-NNN` | 20 | §4.5.29 HMSA / Blue Cross Blue Shield of Hawaii — the twenty-third named-payer set | `hmsa-precert` |
| `R-PA-MCAL-NNN` | 20 | §4.5.30 Medi-Cal (California Medicaid) — first per-state Medicaid overlay | `medi-cal-precert` |
| `R-PA-MCNY-NNN` | 20 | §4.5.31 New York State Medicaid | `ny-medicaid-precert` |
| `R-PA-MCTX-NNN` | 20 | §4.5.32 Texas Medicaid | `tx-medicaid-precert` |
| `R-PA-MCFL-NNN` | 20 | §4.5.33 Florida Medicaid | `fl-medicaid-precert` |
| `R-PA-MCOH-NNN` | 20 | §4.5.34 Ohio Medicaid | `oh-medicaid-precert` |
| `R-PA-MCIL-NNN` | 20 | §4.5.35 Illinois Medicaid | `il-medicaid-precert` |
| `R-PA-MCWA-NNN` | 20 | §4.5.36 Washington Apple Health (Medicaid) | `wa-medicaid-precert` |
| `R-PA-MCGA-NNN` | 20 | §4.5.37 Georgia Medicaid | `ga-medicaid-precert` |
| `R-PA-MCNC-NNN` | 20 | §4.5.38 North Carolina Medicaid | `nc-medicaid-precert` |
| `R-PA-MCPA-NNN` | 20 | §4.5.40 Pennsylvania Medicaid (Medical Assistance / PROMISe / HealthChoices) | `pa-medicaid-precert` |
| `R-PA-MCMI-NNN` | 20 | §4.5.41 Michigan Medicaid (MDHHS / CHAMPS / Healthy Michigan Plan) | `mi-medicaid-precert` |
| `R-PA-MCNJ-NNN` | 20 | §4.5.42 New Jersey Medicaid (DMAHS / NJ FamilyCare / NJMMIS) | `nj-medicaid-precert` |
| `R-PA-MCAZ-NNN` | 20 | §4.5.43 Arizona Medicaid (AHCCCS / AHCCCS Complete Care / AHCCCS Online) | `az-medicaid-precert` |
| `R-PA-MCIN-NNN` | 20 | §4.5.44 Indiana Medicaid (FSSA / OMPP / Healthy Indiana Plan / IHCP) | `in-medicaid-precert` |
| `R-PA-OPD-NNN` | 1 | §4.5.2.1 CMS Hospital OPD Prior Authorization — the first **real** bundled PA-list membership test | `cms-opd-pa-list` |

The twenty-three commercial overlays (§4.5.7 Aetna, §4.5.8 UnitedHealthcare, §4.5.9
Anthem, §4.5.10 Cigna, §4.5.11 Humana, §4.5.12 HCSC, §4.5.13 Highmark, §4.5.14
Florida Blue, §4.5.15 BCBSM, §4.5.16 Blue Shield of California, §4.5.17
Independence Blue Cross, §4.5.18 CareFirst, §4.5.19 Blue Cross NC, §4.5.20
Horizon, §4.5.21 BCBS Tennessee, §4.5.22 BCBS Massachusetts, §4.5.23 BCBS
Alabama, §4.5.24 BCBS South Carolina, §4.5.25 Arkansas BCBS, §4.5.26 BCBS
Kansas City, §4.5.27 BCBS Minnesota, §4.5.28 BCBS Louisiana, §4.5.29 HMSA)
are each keyed to a single named payer and ship 20 rules
apiece. They are deliberately structurally parallel — same families, same
severities — so a packet linted under any one payer is auditable against the
others. The payer-specific routing names differ where each payer actually differs
(Aetna's CPB / NME; UHC's Provider Portal / Optum; Anthem's Availity ICR /
Carelon / Blue Distinction Centers; Cigna's CignaforHCP / eviCore / Express
Scripts / LifeSOURCE; Humana's Availity / CenterWell / National Transplant
Network; HCSC's Availity / Prime Therapeutics / Blue Distinction Centers;
Highmark's Availity / Provider Resource Center / Blue Distinction Centers; Florida
Blue's Availity / provider portal / Blue Distinction Centers; BCBSM's Availity /
Blue Care Network / Blue Distinction Centers; Blue Shield of California's Availity
/ provider connection / Blue Distinction Centers; Independence Blue Cross's
Availity / PEAR portal / Blue Distinction Centers; CareFirst's CareFirst Direct /
iEXchange / Blue Distinction Centers; Blue Cross NC's Blue e / Availity / Blue
Distinction Centers; Horizon's NaviNet / Availity / Blue Distinction Centers;
BCBST's Availity / BlueAccess / Blue Distinction Centers; BCBSMA's Provider
Central / Availity / Blue Distinction Centers; BCBSAL's ProviderAccess / Availity
/ Blue Distinction Centers; BCBSSC's My Insurance Manager / Availity / Blue
Distinction Centers; Arkansas Blue Cross's AHIN / Availity / Blue Distinction
Centers; Blue KC's Availity / Blue KC provider portal / Blue Distinction Centers;
BCBSMN's Availity / provider portal / Blue Distinction Centers; BCBSLA's
iLinkBlue / Availity / Blue Distinction Centers; HMSA's HHIN / Blue Distinction
Centers —
both Humana's and HCSC's
imaging programs are named generically since the vendor names collide with a
barred AI-vendor substring, spec-v50 §3.6). The first five are the largest
commercial / MA plans by national PA volume; HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, BCBS Alabama, BCBS South Carolina,
Arkansas BCBS, BCBS Kansas City, BCBS Minnesota, BCBS Louisiana, and HMSA are
the eighteen
largest independent Blue Cross Blue Shield licensees and the first of the §9
"Blues plans by state" candidates. Two same-state pairs are deliberately
disambiguated by precedence: Blue Shield of California vs. Anthem Blue Cross of
California, and Independence Blue Cross (southeastern PA) vs. Highmark (western
PA) — in each case the `anthem` / `highmark` bucket is checked first. A third
collision is handled by anchor choice, not order: `bcbsm` (Michigan) is a
substring of `bcbsma` (Massachusetts), so the Massachusetts bucket anchors on the
spelled-out plan name and never the bare acronym:

| Rules     | Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of CA / IBX / CareFirst / Blue Cross NC / Horizon / BCBST / BCBSMA / BCBSAL / BCBSSC / Arkansas / Blue KC / BCBSMN / BCBSLA / HMSA |
|-----------|-------------------------------------------------------------------------|
| 001–005   | Coverage criteria, supporting records, submission channel, prior-auth-list stub, questionnaire / advance notification / auth-before-service |
| 006–010   | Review *modes*: concurrent / continued-stay, advanced-imaging site-of-care, expedited urgency, objective evidence / surgery site-of-care, J-code NDC |
| 011–015   | Step therapy, bariatric / specialty-drug diagnosis, genetic-testing program, retrospective review, DME written order |
| 016–020   | DME or behavioral-health LOC, transplant Centers-of-Excellence / Blue Distinction routing, experimental-service evidence, appeal reference, out-of-network gap |

Every overlay rule self-gates on `bundle.payer === '<payer>'` and vacuously
passes on any other packet, so the 135 non-commercial rules, the twenty-three
20-rule commercial overlays, the fourteen per-state Medicaid overlays, and the
CMS OPD prior-auth-list rule coexist
without false positives — a Medicare FFS
packet never trips a Humana rule, and vice versa. Each rule's
source URL is tracked in
[pa-staleness-ledger.json](pa-staleness-ledger.json) and re-verified on the
§4.5.6 maintenance cadence; `npm run lint` fails CI on any ledger ↔ ruleset
drift, and `scripts/audit-pa.mjs` diffs the full pipeline output against
forty-six committed golden reports so any rule, extractor, or classifier change
that moves a byte is caught.

**The first real PA-list membership test (`R-PA-OPD-001`, §4.5.2.1).** Until wave
52-45, every "is the requested service on the payer's prior-auth list?" rule
(`R-PA-053` and the per-overlay `-004` rules) shipped *vacuous* — it passed with a
pointer because no list was bundled. Wave 52-45 flips that for one real list: the
[CMS Hospital Outpatient Department (OPD) Prior Authorization](https://www.cms.gov/research-statistics-data-and-systems/monitoring-programs/medicare-ffs-compliance-programs/prior-authorization-and-pre-claim-review-initiatives/prior-authorization-certain-hospital-outpatient-department-opd-services)
required-services CPT list, bundled by category in
[`lib/pa/cms-opd-pa-list.js`](lib/pa/cms-opd-pa-list.js) (blepharoplasty,
botulinum toxin, panniculectomy, rhinoplasty, vein ablation, cervical fusion with
disc removal, implanted spinal neurostimulators, facet joint interventions). The
rule does a genuine CPT-membership test: a **Medicare FFS hospital-outpatient**
(POS 22 / 19) packet requesting a listed service **without a Unique Tracking
Number (UTN)** flags (Medicare requires the OPD authorization and the UTN on the
claim before the service is furnished); an office-based (POS 11) service, a
non-listed CPT, or a non-Medicare-FFS payer self-gate it off. The CMS list is a
single, federally published, stable source — the cleanest first list to bundle —
and is re-verified on the §4.5.6 cadence (`cms-opd-pa-list` in the ledger). It is
the template the remaining `-004` rules follow as their payer lists are bundled.

**Payer detection is first-match-wins, in a deliberate order.** The buckets
are nested — "Aetna Medicare Advantage" is *both* an MA plan and an Aetna plan —
so `lib/pa/payer.js` checks them in a fixed precedence and stops at the first
anchor hit. This is the cheat sheet:

```
 1. cms-medicare-advantage   "medicare advantage", "mapd", "humana gold plus", …
 2. medicaid-ca              "medi-cal", "denti-cal", "california medicaid"
 3. medicaid-ny              "new york state medicaid", "nys medicaid", "emedny"
 4. medicaid-tx              "texas medicaid", "tmhp"
 5. medicaid-fl              "florida medicaid", "statewide medicaid managed care"
 6. medicaid-oh              "ohio medicaid", "ohio department of medicaid"
 7. medicaid-il              "illinois medicaid", "hfs medicaid"
 8. medicaid-wa              "washington apple health", "apple health", "washington medicaid"
 9. medicaid-ga              "georgia medicaid", "gammis"
10. medicaid-nc              "north carolina medicaid", "nc medicaid", "nctracks"
11. medicaid-pa              "pennsylvania medicaid", "pa medicaid", "pennsylvania medical assistance", "healthchoices"
12. medicaid-mi              "michigan medicaid", "mi medicaid", "healthy michigan plan", "champs"
13. medicaid-nj              "new jersey medicaid", "nj medicaid", "nj familycare", "njmmis"
14. medicaid-az              "arizona medicaid", "az medicaid", "ahcccs", "arizona health care cost containment"
15. medicaid-in              "indiana medicaid", "healthy indiana plan", "indiana health coverage programs", "ihcp"
16. medicaid                 "medicaid", "masshealth", "chip", "state medicaid", …
17. cms-medicare-ffs         "medicare part a/b", "noridian", "palmetto gba", …
18. aetna                    "aetna"
19. uhc                      "unitedhealthcare", "optumrx", "umr", "oxford health"
20. anthem                   "anthem", "elevance"
21. cigna                    "cigna", "evernorth"
22. humana                   "humana", "centerwell"
23. hcsc                     "blue cross [and] blue shield of il/tx/mt/nm/ok", "hcsc"
24. highmark                 "highmark"
25. florida-blue             "florida blue", "guidewell", "bcbs of florida"
26. bcbsm                    "blue cross [and] blue shield of michigan", "bcbsm", "blue care network"
27. blue-shield-ca           "blue shield of california", "blue shield of ca"
28. ibx                      "independence blue cross", "independence administrators", "ibx"
29. carefirst                "carefirst", "care first"
30. bcbsnc                   "blue cross [and] blue shield of north carolina", "blue cross nc", "bcbsnc"
31. horizon                  "horizon blue cross", "horizon bcbs", "horizon healthcare services"
32. bcbst                    "blue cross [and] blue shield of tennessee", "bcbst"
33. bcbsma                   "blue cross [and] blue shield of massachusetts", "bcbs of massachusetts"
34. bcbsal                   "blue cross [and] blue shield of alabama", "bcbsal"
35. bcbssc                   "blue cross [and] blue shield of south carolina", "bcbssc"
36. arkbcbs                  "arkansas blue cross [and blue shield]", "arkansas bcbs"
37. bluekc                   "blue cross [and] blue shield of kansas city", "blue kc"
38. bcbsmn                   "blue cross [and] blue shield of minnesota", "blue cross of minnesota"
39. bcbsla                   "blue cross [and] blue shield of louisiana", "bcbsla"
40. hmsa                     "hmsa", "hawaii medical service association", "blue cross blue shield of hawaii"
41. commercial               "blue cross", "blue shield", "kaiser", "tricare"
42. unknown                  (no anchor hit)
```

Government lines of business win first so an MA or Medicaid packet never routes
to a commercial overlay on a stray brand string. **Per-state Medicaid** buckets
(2–15: `medicaid-ca` / `-ny` / `-tx` / `-fl` / `-oh` / `-il` / `-wa` / `-ga` /
`-nc` / `-pa` / `-mi` / `-nj` / `-az` / `-in`) are checked before the generic
`medicaid` bucket (16), so a named program (Medi-Cal, "Texas Medicaid", eMedNY,
"Florida Medicaid", "Ohio Medicaid", "Illinois Medicaid", "Apple Health", GAMMIS,
NCTracks, PROMISe / HealthChoices, CHAMPS / Healthy Michigan Plan, NJ FamilyCare /
NJMMIS, AHCCCS / AHCCCS Complete Care, Healthy Indiana Plan / IHCP)
routes to its overlay
while a state-agnostic Medicaid packet falls through to the generic bucket — and
the §4.5.4 Medicaid core (`R-PA-MCD-*`) keeps firing on every state bucket via
the `isMedicaid()` predicate, so the core and the per-state overlay compose on
the same packet. The hyphen in `medi-cal` is load-bearing: it prevents a false
match on the common word "medical"; the state-Medicaid buckets are also
deliberately disjoint from their same-state Blues commercial buckets
(`medicaid-fl` vs. `florida-blue`, `medicaid-il` vs. `hcsc`/BCBS-of-Illinois,
`medicaid-nc` vs. `bcbsnc`/Blue-Cross-NC, `medicaid-pa` vs.
`highmark`/`ibx`/Pennsylvania-Blues, `medicaid-mi` vs. `bcbsm`/BCBS-of-Michigan,
`medicaid-nj` vs. `horizon`/Horizon-BCBS-NJ, `medicaid-in` vs.
`anthem`/Anthem-BCBS-Indiana —
each pair unit-tested; Arizona / `medicaid-az` has no modeled same-state Blues,
so its `ahcccs` anchor needs no such disambiguation). Indiana's `medicaid-in`
also deliberately omits the bare tokens `hip` and `in medicaid` as anchors — they
would false-match "hip replacement" and "enrolled in medicaid" respectively — so
it anchors only on `indiana medicaid` / `healthy indiana plan` / `ihcp` (both edge
cases unit-tested). The
named-commercial buckets (18–40) sit above the generic `commercial` fall-through
(41) and match only *unambiguous* anchors, so independent Blues licensees that
aren't yet modeled (Premera, Regence, Wellmark, Excellus, Capital BlueCross) stay
in `commercial` rather than being misrouted. Two same-state pairs are
disambiguated purely by order: `anthem` (bucket 20) is checked before
`blue-shield-ca` (27), so "Anthem Blue Cross of California" routes to Anthem, not
Blue Shield of California; and `highmark` (24) is checked before `ibx` (28), so a
western-Pennsylvania Highmark packet never routes to the Philadelphia-region
Independence Blue Cross overlay.
Horizon's `'horizon'` bucket (31) matches only the disambiguated brand anchors
(`horizon blue cross` / `horizon bcbs` / `horizon healthcare services`), never
the bare common word `horizon`. A substring collision is handled by anchor choice
rather than order: `bcbsm` (Michigan, bucket 26) is a prefix of `bcbsma`
(Massachusetts, bucket 33), so the Massachusetts bucket anchors only on the
spelled-out plan name and the `bcbs of massachusetts` short form — never the bare
`bcbsma` acronym, which would otherwise be swallowed by Michigan. The same applies
to `bcbsmn` (Minnesota, bucket 38), which also anchors only on its spelled-out
name.
A per-packet majority vote
(`detectPacketPayer`) aggregates multi-document bundles, with ties broken by
this same order.

**Design decisions baked into the linter.** (1) *Deterministic, not
probabilistic* — the linter is a pure function of input bytes, so the same
packet always yields the same report; this is what makes a golden-fixture CI
gate possible and is the opposite of the LLM-on-top-of-rules direction the
PA-automation SaaS vendors took (spec-v52 §1.1). (2) *Self-gating overlays* —
adding a payer is additive: a new bucket plus a prefix → ledger-source map,
never an edit to an existing rule, so the 876-rule set grows without
regression risk. (3) *Procedural completeness only* — the linter never
asserts medical necessity; it checks whether the mechanically-detectable
pieces a reviewer needs are present, which keeps it on the right side of the
"not medical advice" line. (4) *OCR is an input adapter, not the substrate*
(spec-v52 §4.3.1) — a scanned PDF or image can be turned into text with
**optional, user-triggered, on-device** OCR (tesseract.js, vendored), but OCR
only does what a human typist would; the deterministic rule engine still makes
every determination. The engine is **lazy** (~9 MB, loaded only on the user's
click, so idle weight is unchanged), runs **in-worker and same-origin** (no
network, no AI service, the image never leaves the tab), and is **upstream of
the audited surface** (the golden fixtures feed the engine text directly, so
determinism is preserved). The one cost is a narrow CSP relaxation —
`script-src 'self' 'wasm-unsafe-eval'` — which permits same-origin WebAssembly
compilation and nothing else (no general `eval`, no third-party origin;
`connect-src 'self'` is unchanged).

## Deterministic logic versus LLM usage

The product uses zero LLM inference and zero AI *service* of any kind. All
operations are deterministic functions over public datasets and published
formulas. There is no model in the loop, no embedding, no inference call, no API
key, and no network call to any AI vendor. If a future sibling project explores
AI-driven workflows, it will be a separate, clearly labeled product.
sophiewell.com itself never calls a language model.

The one nuance is the `pa-lint` tile's **optional, on-device OCR**
(spec-v52 §4.3.1): tesseract.js is a local, offline, deterministic
text-extraction kernel — not an LLM and not a cloud-AI vendor (the
`check-commitments.mjs` "no AI" deny-list targets OpenAI/Anthropic/onnxruntime/…,
none of which appears here). It runs entirely in the browser tab, fetches
nothing off-origin, and only converts a scan's pixels into the text a human
would otherwise type. It is an input adapter to the deterministic engine, not a
decision-maker — so the "deterministic, not probabilistic" posture is intact.

## MCP server (optional) — deterministic calculators as agent tools

The website is the product. But the same property that makes it useful to a
clinician — **exact arithmetic over published, cited coefficients** — is exactly
what an AI agent is *bad* at. An agent drafting clinical content will cheerfully
miscompute a MELD-XI score or invent a TIMI weighting. [spec-v183](docs/spec-v183.md)
adds a second, optional consumption surface for the calculators that already
exist: a local **stdio Model Context Protocol (MCP)** server (`mcp/`) that lets an
agent call the vetted compute functions as deterministic tools. It turns *"the
model guesses the score"* into *"the model calls a tool, gets the right number,
and gets the source to cite."*

**The site is untouched.** The MCP server adds zero browser code, zero runtime
dependencies to the site (root `package.json` `dependencies` stays `{}` — the
SDK is pinned in `mcp/package.json`), and zero new tiles (`UTILITIES.length` is
unchanged). Delete `mcp/` and the site's lint, test, sbom, and build stay green.

**No hosting, no network, no AI.** The server speaks MCP over stdin/stdout only —
no HTTP, no SSE, no socket, no egress, no model calls, no telemetry, no input
logging. It runs as a local subprocess on the caller's machine (the same model
as the `openlore` MCP server already wired into this repo). We host nothing, run
nothing, and see nothing — the right privacy posture for clinical inputs.

### Architecture: a sibling that imports the pure core

```
            ┌──────────────────────────── the website (unchanged) ───────────────────────────┐
            │  index.html ──▶ app.js ──▶ views/group-*.js ──▶ lib/<pure>.js ◀── lib/meta.js   │
            │      (DOM, renderers)        (read DOM, call compute)   ▲            ▲           │
            └──────────────────────────────────────────────────────── │ ─────────  │ ─────────┘
                                                                       │            │
                          imports the SAME pure modules ───────────────┘            │
                                                                       │            │ citations,
   AI agent                          ┌─────────────────┐              │            │ examples
  (Claude, …) ◀── stdio JSON-RPC ──▶ │  mcp/server.js  │              │            │
                                     │  (official SDK) │              │            │
                                     └────────┬────────┘              │            │
                                              │  dispatch             │            │
                                     ┌────────▼────────┐     ┌─────────▼────────┐   │
                                     │   mcp/tools.js  │────▶│  mcp/catalog.js  │◀──┘
                                     │ list/describe/  │     │  registry =       │
                                     │ compute (pure)  │     │  adapters ⋈ META  │
                                     └─────────────────┘     │  ⋈ UTILITIES      │
                                                             └────────┬─────────┘
                                                                      │
                                                        ┌─────────────▼─────────────┐
                                                        │   mcp/adapters/*.js        │
                                                        │  (input schema + toArgs +  │
                                                        │   formatResult ONLY)       │
                                                        └────────────────────────────┘
```

The import graph is acyclic and one-directional: `mcp/* → lib/<pure>` only. The
server never imports `app.js`, `views/*`, or any DOM-coupled module — a build-time
no-DOM scan in `check-mcp-catalog.mjs` enforces it, so a tile that accidentally
couples compute to the DOM cannot silently break the server.

### Single source of truth

The one artifact that did not already exist is a **machine-readable per-tile input
schema** — today each tile's input contract is tangled inside its DOM renderer. An
adapter (`mcp/adapters/<module>.js`) supplies *only* that, as a flat field list:

| field key | from the renderer | example | role |
|---|---|---|---|
| `dom` | the input id (`getElementById`), also the `META.example.fields` key | `mx-bili` | the public input key (so the example round-trips with zero re-typing) |
| `arg` | the lib function's argument name | `bilirubin` | maps input → compute call |
| `kind` | `number` / `bool` / `enum` | `number` | coercion + JSON-Schema type |

From that one list, `mcp/fields.js` derives both the published JSON Schema and the
default `toArgs()`. Everything else — name, group, specialties, citation, example,
interpretation — is **read** from `UTILITIES` (app.js) and `META` (lib/meta.js),
never re-typed. `scripts/check-mcp-catalog.mjs` (in the `lint` chain) fails the
build if an id is not in `UTILITIES`, if an exposed tile is not `clinical: true`,
if the `docs/mcp-coverage.md` ledger drifts, if a compute module touches the DOM,
or if any example stops round-tripping — the **same numeric-correctness contract
as the e2e example-correctness sweep**, applied to the JSON surface.

### The three tools

| tool | input | returns |
|---|---|---|
| `list_calculators` | `{ group?, specialty?, query? }` | lightweight rows + a live coverage line (`"<N> of <M> catalog tiles exposed"`). No computation. |
| `describe_calculator` | `{ id }` | the full contract: input JSON Schema, a worked example, citation + URL + access date, interpretation bands, disclaimer. |
| `compute_calculator` | `{ id, inputs }` | the deterministic result + citation + disclaimer. Invalid/incomplete input returns `{ valid: false, message }` — never a thrown error, never a `NaN`/`Infinity` (the spec-v59 output-safety guard, on the JSON surface). |

Exposing one tool per calculator would flood every client's tool list; the server
uses a fixed three-tool surface with dynamic dispatch over the catalog instead.

### The compute round-trip (what the gate enforces)

A `compute_calculator` call is a pure pipeline; the same path runs the published
example, which `check-mcp-catalog.mjs` replays on every build. If any numeric fact
in the example's `expected` string is absent from the serialized result, the build
fails — the JSON tool surface inherits the e2e example-correctness contract.

```
 inputs (dom-keyed)        adapter.fields[]            lib/<pure>.js
 ─────────────────         ────────────────           ─────────────
 { "mp-rr": "22",          dom → arg → kind           mechanicalPower({
   "mp-vt": "420",   ─┬─▶  validateInputs()   ─┬─▶      respiratoryRate: 22,
   ... }              │    (coerce '22'→22,     │       tidalVolume: 420, ... })
                      │     'yes'→true, …)      │            │
                      │                         │            ▼
                      │    makeToArgs()  ───────┘    { mechanicalPower: 22.6,
                      │    (dom→arg rename)            drivingPressure: 14, … }
                      │                                       │
                      ▼                          formatResult()  (optional;
            { valid:false, message }  ◀── blank/  adds e.g. drivingPressureUnit
            (spec-v59: never NaN/throw)  non-fin   so the JSON is self-describing)
                                                          │
                                                          ▼
                              JSON.stringify(result) ⊇ numericFacts(expected)
                                      └── gate: every expected number present ──┘
```

The adapter contributes only `fields[]` (and rarely `toArgs`/`formatResult`); the
citation, example, interpretation, name, group, and specialties are all read from
`META` and `UTILITIES`, so a wave is "add one file, list it in the ledger" with no
re-typing of clinical content. EuroSCORE II (wave 7) shows the spec-v59 guard on a
logistic model: its predicted mortality is evaluated in a saturation-safe form and
clamped to `[0, 1]`, so the JSON surface never emits a non-finite probability.

### Coverage is explicit and honest

Adapting the catalog is incremental. Coverage now stands at **167 clinical
calculators across 35 `lib` modules** (of 774 catalog tiles), built module by
module against the one fixed contract:

| wave | modules | tiles |
|---|---|---|
| first (spec-v183) | `tox-v86`, `hep-v124`, `acidbase-v129`, `cardio-v90` | 21 |
| second | `pulm-v91`, `neuro-v118`, `endo-v136`, `periop-v97` | 18 |
| third | `oneformula-v167` (mean-airway-pressure, cerebroplacental-ratio, toe-brachial-index, stool-osmotic-gap, pure-tone-average, rutgeerts) | 6 |
| fourth | `cardio-v101` (CHADS2, CHA2DS2-VA, CHADS-65, ATRIA, Tisdale-QTc), `heme-v132` (PLASMIC, French-TTP, JAAM-DIC, IPSET, CISNE), `gi-v126` (CDAI, UCEIS, HAPS, CTSI, modified-Marshall) | 15 |
| fifth | `cardio-v102` (MAGGIC, H2FPEF, HFA-PEFF, CardShock), `cardio-v104` (Brugada, Vereckei, ADD-RS, ROSE, EGSYS, OESIL), `cvrisk-v103` (SCORE2, SCORE2-OP, MESA, Framingham, Reynolds, non-HDL/remnant), `critcare-v112` (MEDS, SIC, CPIS-VAP, lactate clearance, MRC sum), `fluidresp-v113` (IVC, PPV/SVV, passive leg raise), `hepgi-v93` (NAFLD-FS, Glasgow-Imrie, Truelove-Witts, Harvey-Bradshaw, Mayo, Milan), `hemonc-v94` (HScore, IPSS-R, FLIPI, MASCC, Sokal) | 35 |
| sixth | `neuro-v119` (CPSSS, FAST-ED, Boston-CAA, CVT-risk), `neuro-v120` (STESS, 2HELPS2B, MESS, POUND, HINTS), `neuro-v121` (EGRIS, mEGOS, Brighton-GBS, MGFA), `neuro-v122` (Hachinski, Modified-Ashworth, Bickerstaff), `nephro-v127` (KFRE, RIFLE, AKIN, UFR), `renal-v128` (FEPO4, FEMg, nPCR, std-Kt/V, EFWC), `uro-v130` (prostate-volume, PSA density/velocity/doubling-time, D'Amico, Gleason grade-group), `uro-v131` (CAPRA, R.E.N.A.L., PADUA, S.T.O.N.E., TWIST) | 36 |
| seventh | `hemodynamics-v87` (hemodynamic-suite, mechanical-power, dead-space), `nephro-v92` (CKD-staging, UACR/UPCR, Kt/V-URR, Mehran-CIN, CKD-EPI-cystatin), `ebm-v163` (Fagan, diagnostic-2x2, NNT/ARR), `ophtho-v164` (IOL-power, visual-acuity, ocular-perfusion-pressure), `echo-v158` (LV-mass-index, LA-volume-index, Teichholz-LVEF, RVSP/PASP, E/e'), `rheum-v147` (CDAI, SDAI, ACR/EULAR-2010-RA, SLEDAI-2K, ACR/EULAR-2015-gout, CASPAR, ACR-2016-fibromyalgia), `vte-v106` (PEGeD, 4PEPS, Bova, Hestia, Geneva, Constans-UEDVT), `vascular-v105` (ABI, Rutherford/Fontaine, WIfI, EuroSCORE-II) | 36 |

`docs/mcp-coverage.md` is the ledger and `list_calculators` always reports the
live exposed fraction (`"<N> of <M> catalog tiles exposed"`), never a hardcoded
number. Three tiles inside these modules are deliberately left unexposed and
recorded as such: `phases-iph` has no `META.example` to round-trip, `pospom`
takes a variable-length comorbidity array that needs a bespoke `toArgs`, and
`ses-cd` takes per-segment input arrays rather than the flat `dom→arg→kind`
contract. Two wave-six tiles (HINTS, Bickerstaff) are categorical instruments
whose number-free examples round-trip through the band/note text, and the
R.E.N.A.L. hilar suffix is an empty-string/`h` enum. The wave-seven Mehran
yes/no risk factors map to two-value enums, the EuroSCORE II logistic model is
evaluated in a saturation-safe form whose mortality clamps to `[0, 1]`
(spec-v140), and the `mechanical-power` adapter surfaces the driving-pressure
unit in plain ASCII (`cmH2O`) so its JSON result is self-describing where the
rendered tile uses the subscript `cmH₂O`. Later waves extend coverage the same
way — one module, one ledger entry, one set of round-tripping examples at a time.

### Try it

```sh
cd mcp && npm install          # SDK installs into this subtree only
# then add a stdio block to your MCP client config:
#   { "mcpServers": { "sophiewell-calculators":
#       { "command": "node", "args": ["/abs/path/sophiewell.com/mcp/server.js"] } } }
```

See [`mcp/README.md`](mcp/README.md) for the full client snippet and the
no-hosting/no-network/privacy posture.

## Stability commitments

The site is stable and predictable by design. These commitments are hard
rules, not soft preferences.

- **No A/B testing, ever.** Every user sees the same version of every
  utility. A clinician who used a calculator on Monday and got one result,
  then got a slightly different result on Tuesday because they were in a
  treatment group, would correctly stop trusting the site.
- **No feature flags visible to users.** No "experimental" toggle, no
  "beta" feature. If something is on the site, it is for everyone.
- **No tracking.** No analytics script, no tracking pixel, no heatmap, no
  session replay, no error reporter, no third-party telemetry. The CSP
  enforces this with `connect-src 'self'`. The site never logs user-agent
  strings or IP addresses.
- **No notifications, no email capture.** The site never asks for an
  email address, never displays a notification permission request, never
  shows a "Sign up for updates" form. There is no newsletter and no
  account system, because there are no accounts.
- **Versioned releases.** Every release is tagged with a semantic version
  and described in [CHANGELOG.md](CHANGELOG.md), linked from the footer.

## CLI reference

| Command                  | Description                                                       |
|--------------------------|-------------------------------------------------------------------|
| `npm run dev`            | Serve the directory locally on http://localhost:4173 (set `SERVE_ROOT=dist` to preview the pre-rendered hubs/topics/tool pages as production serves them) |
| `npm run build`          | Copy static files into `dist/` for deployment                     |
| `npm test`               | Run the full test suite (unit, a11y, grep, data integrity)        |
| `npm run test:unit`      | Run Node's built-in unit tests (5,869 tests)                      |
| `npm run test:e2e`       | Build `dist/`, then run Playwright integration tests against real browsers — incl. a full-catalog 320px no-horizontal-scroll sweep over both the SPA routes and the 774 pre-rendered static tool pages, the hub/topic/commitments pages, and the citation-wrap pin |
| `npm run test:mcp`       | Run the optional MCP server's tool/compute/fuzz tests (independent of the site jobs; SDK-free) |
| `npm run test:a11y`      | Run accessibility checks on every utility view                    |
| `npm run lint`           | ESLint + the CI gate chain: grep-check, output-safety, citation-integrity, catalog-truth, commitments, MCP-catalog, PA staleness, PA audit |
| `npm run data:refresh`   | Re-fetch and re-shard every public dataset                        |
| `npm run data:verify`    | Verify shard SHA-256 hashes against the manifests                 |
| `npm run sbom`           | Regenerate the CycloneDX SBOM (`sbom.json`, `sbom.md`)            |
| `npm run release:check`  | One-shot pre-release gate: lint + test + sbom + build             |
| `npm run clean`          | Remove `dist/` and other build artifacts                          |

## Safety guarantees

- The application makes no outbound network requests at runtime. This is
  the hard guarantee: the CSP `connect-src 'self'` directive means user
  input physically cannot leave the device, so nothing below is a privacy
  trade-off, only a convenience-vs-clean-slate choice that stays on-device.
- The application is read-only with respect to all bundled data.
- By default the application writes nothing to `localStorage`,
  `sessionStorage`, cookies, or IndexedDB. A fresh visit leaves all four
  empty, which the integration test suite asserts (`smoke.spec.js`).
- Exactly two **opt-in** features may write to `localStorage`, and only to
  an allowlisted set of **string-literal** keys enforced by
  `scripts/check-commitments.mjs` against `scripts/storage-allowlist.json`
  (spec-v50 §3.4) and re-verified at runtime by `no-network.spec.js`:
  - the light/dark **theme** preference (`sw-theme`), written only when the
    user toggles the theme; and
  - the spec-v61 **"Remember my inputs on this device"** toggle
    (`sw-remember`, `sw-saved-inputs`), off by default. When enabled it
    stores **numeric/choice inputs only** (`number`/`range`/`checkbox`/
    `radio` and `<select>`); free-text (`type=text`/`search`) and
    `<textarea>` are never persisted, so a name, allergy, or clinical note
    cannot reach storage. Unchecking the toggle erases both keys.
- There are no cookies, no `sessionStorage`, and no IndexedDB at any time;
  the service worker's Cache Storage holds only the site's own static
  shell files, keyed to the build hash.
- Clinical input is processed in memory and (unless the opt-in toggle is on)
  discarded when the page is closed.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, and the
  `Function` constructor are banned by the ESLint config and a grep
  check; the `el()` DOM helper throws on any attempt to set raw HTML.
- A CycloneDX SBOM (`sbom.json`, `sbom.md`) is regenerated on every
  build and ships with the site, hashing every runtime asset and source
  module with SHA-256 plus a per-build buildId.

## Limitations

- The Field Medicine layer reproduces only the *numeric facts* (drug
  doses, intervals, energy levels, weight ranges) from AHA ACLS/PALS/BLS
  guidelines, with attribution to the AHA guideline edition. AHA
  algorithm flowcharts are *not* reproduced. The Broselow-Luten
  color-band system is *not* bundled (licensed by Vital Signs); the
  pediatric dose calculator works in straight kilograms instead. See
  [docs/field-medicine-citations.md](docs/field-medicine-citations.md).
- Static code indexes (ICD-10-CM, HCPCS, CPT, NDC, POS, modifier,
  revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS, RxNorm,
  NDC↔RxNorm) and reference tables (adult / pediatric lab ranges,
  TDM, tox levels, ISMP high-alert wallet, AHA CPR wallet card,
  NIOSH Pocket Guide, DOT ERG, AGS Beers Criteria, ASA Physical
  Status, Mallampati, Modified Rankin) were retired in spec-v29
  wave 29-2 — Sophie's edge is computation, not indexing. Use your
  EHR, the upstream source, or your institutional protocol.
- The Appointment Prep Question Generator uses deterministic keyword
  matching against a hand-curated bank, not language understanding.
- The site is not medical, legal, or financial advice. It does not
  replace clinician judgment, institutional protocols, professional
  billing review, or legal counsel.
- Clinical calculators are math aids only. Institutional protocols
  govern any clinical decision. Field-medicine utilities additionally
  defer to local protocols and online medical direction.
## Security

Vulnerability reports: see [SECURITY.md](SECURITY.md) for the private
disclosure channel and the threat model summary. The CSP, security
headers, and supply-chain posture (pinned dev deps, SBOM on every
build, integrity-verified data shards) are documented in
[docs/threat-model.md](docs/threat-model.md).

## Documentation

- [docs/spec-v10.md](docs/spec-v10.md) — current positioning spec:
  clinical-first audience, runtime-dependency budget, permanent
  out-of-scope list
- [docs/spec-v11.md](docs/spec-v11.md) — correctness-floor spec:
  per-tile audit protocol, specialty-named groups, optional
  source-quoted `interpretation` field. Audit coverage is **complete
  — 774/774 tiles** carry a committed per-tile audit log
  (`docs/audits/v11/<id>.md` for the pre-v78 catalog;
  `docs/audits/v12/<id>.md` for the tiles added since — the
  spec-v78–v83 billing & coding program, the spec-v85
  advanced-clinical-calculators program (v86–v99), and the
  spec-v100 MDCalc parity-completion program (v101–v107))
  (`node scripts/audit-coverage.mjs`)
- [docs/scope-mdcalc-parity.md](docs/scope-mdcalc-parity.md) —
  long-horizon scope: every actionable clinical calculator a
  healthcare worker would otherwise reach for MDCalc to find,
  shipped slowly at the v11 quality bar
- [docs/spec-v52.md](docs/spec-v52.md) — the `pa-lint` prior-auth packet
  linter: pipeline, the 876-rule ruleset, payer overlays (Aetna +
  UnitedHealthcare + Anthem + Cigna + Humana + HCSC + Highmark + Florida Blue +
  BCBSM + Blue Shield of California + Independence Blue Cross + CareFirst +
  Blue Cross NC + Horizon + BCBS Tennessee + BCBS Massachusetts + BCBS Alabama +
  BCBS South Carolina + Arkansas BCBS + BCBS Kansas City + BCBS Minnesota +
  BCBS Louisiana + HMSA, plus per-state Medicaid overlays for California /
  New York / Texas / Florida / Ohio / Illinois / Washington / Georgia / North
  Carolina / Pennsylvania / Michigan / New Jersey / Arizona / Indiana), the CMS
  Hospital OPD prior-authorization membership test (§4.5.2.1, the first real
  bundled PA-list rule), the optional on-device OCR path (§4.3.1, vendored
  tesseract.js),
  and the byte-determinism / golden-fixture guarantee
- [docs/architecture.md](docs/architecture.md) — runtime architecture,
  data flow, no-backend rationale
- [docs/data-sources.md](docs/data-sources.md) — every bundled dataset
  with canonical URL and refresh cadence
- [docs/clinical-citations.md](docs/clinical-citations.md) — every
  formula and scoring system with citations
- [docs/citation-staleness.md](docs/citation-staleness.md) — the spec-v54
  staleness ledger: every guideline tile's shipped vs latest edition,
  accessed date, and justification when deliberately behind
- [docs/field-medicine-citations.md](docs/field-medicine-citations.md) —
  Group I citations, including AHA non-derivation posture
- [docs/legal.md](docs/legal.md) — data sourcing posture, AMA CPT
  handling, attributions
- [docs/accessibility.md](docs/accessibility.md) — WCAG 2.2 AA checklist
- [docs/threat-model.md](docs/threat-model.md) — threats considered and
  the controls that mitigate each
- [docs/stability.md](docs/stability.md) — full stability policy
- [docs/performance.md](docs/performance.md) — performance budget and
  measurement methodology
- [docs/operations.md](docs/operations.md) — data refresh workflow,
  manifest format, integrity verification
- [docs/release.md](docs/release.md) — Cloudflare Pages release runbook
- [docs/deployment.md](docs/deployment.md) — deployment configuration
- [CHANGELOG.md](CHANGELOG.md) — every release with date, version, and
  user-visible changes
- [SECURITY.md](SECURITY.md) — vulnerability disclosure policy



