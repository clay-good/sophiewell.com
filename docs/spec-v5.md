# spec-v5.md — sophiewell.com pragmatic pivot

> Status: active spec. Supersedes the maintenance posture of spec-v4 by
> narrowing scope to deterministic, no-ETL tools. spec-v4 catalog text
> remains historically accurate; v5 is the operational source of truth
> for what ships and what gets removed.

## 1. Why this spec exists

sophiewell.com began as a wide-coverage healthcare utility belt: 195 tiles
across 15 categories, backed by 78 dataset manifests and a weekly refresh
pipeline. The breadth was real, but the maintenance cost is also real —
every refresh is an opportunity for a stale dataset to give a wrong answer
in a bill, a coverage check, a registry query, or a recall lookup. For a
site that is run by one person on a free Cloudflare Pages tier and is
trusted by frontline healthcare workers, that surface area is too large.

This spec narrows the project to **the floor**. The archetype is the
Mike-Rowe-of-healthcare worker: the ED nurse running a drip, the EMT on
the side of the road, the medical assistant rooming patients, the bedside
tech, the floor coder turning a chart into a claim, the patient at the
kitchen table reading a bill. Tools that earn a place are tools those
people reach for during a shift.

The maintenance contract is now explicit: **no ETL, no live data, no AI,
no accounts, no telemetry, no servers**. Every tool is either deterministic
math over inputs the user types, or a small reference table that does not
materially change between annual updates.

## 2. Maintenance principles (hard rules)

These are non-negotiable and bind every future addition.

1. **No live-data dependencies.** A tool may not depend on a registry,
   pricing file, recall feed, schedule update, or any dataset whose
   correctness degrades with staleness. Pricing, registries, and recalls
   are out of scope; a frontline reference site cannot guarantee the
   freshness those domains require.
2. **No ETL pipelines.** Datasets, where present, are small static
   reference tables (POS codes, modifier codes, lab ranges, ISMP high-
   alert list, EOB jargon glossary) that are hand-maintained on annual or
   slower cadence. The build pipeline does not fetch, parse, or transform
   external sources.
3. **No AI of any kind.** No models, no embeddings, no inference, no API
   keys. Every answer is reproducible from the user's input plus published
   formulas or static reference data.
4. **Deterministic from the input alone.** Two users entering identical
   inputs see identical outputs forever. No A/B testing, no feature flags,
   no experiments.
5. **Pure-function math, separated from the DOM.** Every calculation lives
   in a `lib/*.js` module, takes plain numbers and named-object inputs,
   and is unit-tested. Renderers in `views/group-*.js` only collect inputs
   and display results.
6. **Citations on every formula.** Every clinical/scoring tool ships with
   a citation block in `META` referencing the published source (CDC,
   AHA, ACEP, USPSTF, peer-reviewed paper, or the tool's named developer).
7. **Test-with-example on every calculator.** Every calculator has at
   least one worked example reproducing a citation's published case, wired
   through `META[id].example`.
8. **Offline-first, single static page.** No new runtime dependency, no
   new network call, no expansion of CSP `connect-src`.

## 3. Scope changes from v4

### 3.1 Tools removed (live-data-dependent or staleness-dangerous)

The following 60+ tiles are removed from the catalog. Their renderers,
META entries, datasets, and tests are deleted; the home grid, sitemap,
JSON-LD `featureList`, README, and CHANGELOG are updated to match. The
removal is non-destructive at the URL level: removed-tile hashes (e.g.
`#mpfs`) route to the home grid rather than 404.

**Pricing & registries (staleness = wrong dollar amount):**

- Medicare Physician Fee Schedule lookup (`mpfs`)
- NADAC drug pricing (`nadac`)
- Charge-to-Medicare ratio (`ratio`)
- Hospital price transparency lookup (`hospital-prices`)
- Out-of-pocket cost estimator (`oop`) — depends on MPFS allowables
- DMEPOS fee schedule (`dmepos`)
- CLFS lab fee lookup (`clfs`)
- ASP drug pricing (`asp`)
- ASC payment lookup (`asc`)
- CMS wage index (`wage-index`)
- GPCI lookup (`gpci`)
- Medicare deductibles & IRMAA (`medicare-deductibles`)
- ACA marketplace thresholds (`aca-thresholds`)
- HSA / FSA / HDHP limits (`hsa-fsa`)
- Federal Poverty Level calculator (`fpl`) — annual figures
- IRS medical mileage rate (`irs-mileage`)

**Live registry queries (staleness = legal or safety risk):**

- NPI provider lookup (`npi`)
- OIG exclusions lookup (`oig`)
- Medicare opt-out list (`opt-out`)
- DEA registration validator (`dea-validator`)
- NUCC provider taxonomy (`nucc-taxonomy`)
- FDA drug recall lookup (`drug-recalls`)
- Vaccine lot recall lookup (`vaccine-recalls`)

**Coverage & edits (quarterly, payer-specific):**

- NCCI procedure-to-procedure edits (`ncci`, `ncci-ptp`)
- Medically Unlikely Edits (`mue`, `mue-cap`)
- LCD / NCD coverage lookup (`lcd`)

**Annually-shifting public-health reference (staleness = misleading):**

- ACIP routine adult schedule (`acip-adult`)
- ACIP routine child schedule (`acip-child`)
- ACIP catch-up schedule (`acip-catchup`)
- CDC Yellow Book country lookup (`yellow-book`)
- Medicaid by state quick-card (`medicaid-state`)
- State patient rights reference (`state-rights`)
- VA eligibility 1-2-3 (`va-eligibility`)
- TRICARE plan picker (`tricare-picker`)
- IHS eligibility (`ihs-eligibility`)
- Good Faith Estimate dispute threshold (`gfe`) — depends on annual CMS figure

The decision-tree tools that are *guideline-stable* across years stay:
tetanus prophylaxis, rabies PEP, bloodborne pathogen exposure, TB
testing interpretation, STI screening intervals — these encode published
CDC clinical decision logic that does not move materially year-over-year
and degrades gracefully if it does.

### 3.2 Tools kept (the deterministic core)

The kept catalog falls into seven plain-named categories:

- **Code Reference** — small static lookups: ICD-10-CM, HCPCS Level II,
  CPT (structural Medicare data only), NDC, ICD-10-PCS, RxNorm, MS-DRG,
  APC, NUBC TOB / revenue / condition / occurrence / value codes, CARC,
  RARC, HCPCS modifiers, place-of-service codes. These shift annually;
  staleness on a code lookup is a minor inconvenience, not a clinical or
  legal risk.
- **Patient Bill & Insurance Literacy** — bill decoder, EOB decoder,
  MSN decoder, insurance card decoder, IDR/NSA eligibility tree, ABN
  explainer, appeal letter generator, HIPAA right-of-access generator,
  HIPAA authorization generator, ROI request generator, birthday rule,
  COBRA timeline, Medicare enrollment period checker, ACA SEP eligibility,
  EOB jargon glossary, CMS-1500 / UB-04 form-locator decoders. All
  pattern-based or rule-based; no live data.
- **Clinical Math & Conversions** — every tile from current Group E
  (BMI, BSA, MAP, anion gap, corrected Ca/Na, A-a, P/F, Winter's, shock
  index, eGFR suite, FENa/FEUrea, maintenance fluids 4-2-1, QTc suite,
  pregnancy dating, osmolal gap, pack-years, unit converter), plus the
  v5 additions in §4.
- **Medication & Infusion** — every tile from current Group F (drip rate,
  weight-based dose, concentration-to-rate, peds dose bounds, insulin
  drip, anticoagulant reversal, high-alert reference, opioid MME, steroid
  / benzodiazepine equivalence, antibiotic renal-dose adjustment,
  vasopressor dose↔rate, TPN macros, IV-to-PO), plus the v5 additions.
- **Clinical Scoring & Reference** — every tile from current Group G
  (GCS, APGAR, NIHSS, Wells PE/DVT, CHA2DS2-VASc, HAS-BLED, ASA,
  Mallampati, Beers, TIMI, GRACE, HEART, PERC, Geneva, CURB-65, PSI,
  qSOFA/SOFA, MELD-3.0/Child-Pugh, Ranson/BISAP, Centor/McIsaac, Caprini,
  Bishop, Alvarado/PAS, mRS, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog,
  CIWA-Ar, COWS, ASCVD PCE, PREVENT 2023), plus the v5 additions.
- **Field Medicine** — every tile from current Group I (peds weight-to-
  dose, arrest drug refs, defib energy, stroke scales, CDC trauma triage,
  START / JumpSTART, burn surface area, burn fluid resuscitation,
  hypothermia / heat-illness staging, peds ETT, toxidromes, naloxone,
  EMS documentation helper, NEXUS / Canadian C-Spine, DOT ERG hazmat
  reference, NIOSH Pocket Guide, AHA CPR numeric reference, TCCC
  tourniquet / wound packing, CO / cyanide / smoke-inhalation antidotes),
  plus the v5 additions.
- **Public Health Decision Trees** — tetanus prophylaxis, rabies PEP,
  bloodborne pathogen exposure, TB testing interpretation, STI screening
  intervals.
- **Reference Tables & Helpers** — adult lab reference ranges, pediatric
  lab reference ranges, therapeutic drug levels, toxicology levels,
  ISMP high-alert wallet card, universal unit converter, time-to-dose
  helper, pediatric weight converter, prior-auth checklist generator,
  appointment prep generator, specialty-visit question generator,
  discharge instructions generator, medication wallet card.

### 3.3 Categories renamed

The fifteen Group A–O letter categories collapse into seven plain-named
categories on the home grid (the letter prefixes were already removed in
the previous commit). Internal `group-X.js` filenames remain for code
organization; the user-facing home page shows category names only.

| User-facing category | Source groups |
|---|---|
| Code Reference | A |
| Patient Bill & Insurance Literacy | C, L |
| Clinical Math & Conversions | E, N |
| Medication & Infusion | F |
| Clinical Scoring & Reference | G |
| Field Medicine | I |
| Public Health Decision Trees | J (subset) |
| Reference Tables & Helpers | H, K, O (subset) |

(The letter-to-name rebrand is presentation-layer only. Migrating the
internal `group:` field on each tile to a category string is an optional
follow-up.)

## 4. New tools (v5 additions)

The following 17 tools land in v5. Every one is pure deterministic math
or a small static reference. Citations are real, formulas are well-known,
and inputs are typed by the user. None require a dataset refresh.

### 4.1 Clinical math additions

**T1. Sodium correction rate planner.** Hypo- or hyper-natremia. Inputs:
current Na, target Na, total body water (or weight + sex). Outputs:
total Na deficit/excess, recommended infusion rate per Adrogue-Madias,
flag if change > 8 mEq/L/24h (osmotic demyelination risk for hyponatremia,
cerebral edema risk for hypernatremia). Citation: Adrogue HJ, Madias NE.
N Engl J Med 2000;342:1493-1499.

**T2. Free water deficit calculator.** Hypernatremia. `Deficit = TBW × ([Na/140] − 1)`.
Inputs: weight, sex, current Na. Output: free water deficit in liters,
suggested replacement rate over 48 h. Citation: Adrogue-Madias.

**T3. Iron deficit (Ganzoni formula).** IV iron dosing. `mg = weight × (target Hb − actual Hb) × 2.4 + iron stores`.
Inputs: weight, current Hb, target Hb (default 15), iron stores (default
500 mg in adults > 35 kg). Output: total iron deficit in mg. Citation:
Ganzoni AM. Schweiz Med Wochenschr 1970;100:301-303.

**T4. Predicted body weight + ARDSnet tidal volume.** ARDS lung-
protective ventilation. PBW (Devine): male `50 + 2.3 × (height_in − 60)`;
female `45.5 + 2.3 × (height_in − 60)`. Tidal volume target band
4–8 mL/kg PBW (default 6). Inputs: sex, height, target mL/kg. Outputs:
PBW in kg, tidal volume range in mL. Citation: ARDSNet trial. NEJM 2000;
342:1301-1308.

**T5. Rapid Shallow Breathing Index (RSBI).** Ventilator weaning.
`RSBI = RR / Vt(L)`. Inputs: respiratory rate, tidal volume in mL.
Output: RSBI value, predicted weaning success threshold (< 105). Citation:
Yang KL, Tobin MJ. NEJM 1991;324:1445-1450.

### 4.2 Indices & criteria

**T6. Light's criteria for pleural effusion.** Transudate vs exudate.
Three ratios: pleural protein / serum protein, pleural LDH / serum LDH,
pleural LDH vs upper limit serum LDH. Output: classification per any-one
positive rule. Citation: Light RW. Ann Intern Med 1972;77:507-513.

**T7. Mentzer index.** Microcytic anemia screen: iron deficiency vs
beta-thalassemia. `MCV / RBC count`. < 13 favors thalassemia, > 13 favors
iron deficiency. Citation: Mentzer WC. Lancet 1973;1:882.

**T8. SAAG (serum-ascites albumin gradient).** Portal hypertension
classifier. `SAAG = serum albumin − ascites albumin`. ≥ 1.1 g/dL =
portal hypertension; < 1.1 = non-portal. Citation: Runyon BA. Hepatology
1992;16:240-245.

**T9. R-factor (drug-induced liver injury pattern).** `R = (ALT/ULN) / (ALP/ULN)`.
> 5 hepatocellular, < 2 cholestatic, 2–5 mixed. Citation: CIOMS
classification, Bénichou C. J Hepatol 1990;11:272-276.

**T10. KDIGO AKI staging.** Acute kidney injury. Inputs: baseline
creatinine, current creatinine, urine output mL/kg/h, observation hours.
Output: KDIGO stage 1 / 2 / 3 by whichever criterion is worst.
Citation: KDIGO Clinical Practice Guideline for AKI. Kidney Int Suppl
2012;2:1-138.

### 4.3 Scoring additions

**T11. Modified Sgarbossa criteria (Smith).** STEMI in LBBB or
ventricular-paced rhythm. Inputs: concordant ST elevation ≥ 1 mm,
concordant ST depression ≥ 1 mm in V1–V3, ST/S ratio ≤ −0.25 in any
lead with ≥ 1 mm discordant elevation. Output: positive (likely
occlusive MI) / negative. Citation: Smith SW et al. Ann Emerg Med
2012;60:766-776.

**T12. Revised Cardiac Risk Index (RCRI / Lee).** Pre-op cardiac risk.
Six binary inputs (high-risk surgery, ischemic heart disease, CHF,
cerebrovascular disease, insulin DM, creatinine > 2.0). Output: count
and risk band per Lee. Citation: Lee TH et al. Circulation 1999;
100:1043-1049.

**T13. Pediatric Early Warning Score (PEWS).** Bedside peds
deterioration screen. Three subscales: behavior, cardiovascular,
respiratory. Total 0–9. Citation: Monaghan A. Paediatr Nurs 2005;17:32-35.

### 4.4 Coding & billing helpers

**T14. Time-based E/M code selector (2021+ rules).** Office/outpatient
E/M (99202–99205, 99212–99215). Input: total time in minutes on date of
encounter (new vs established). Output: code per AMA 2021 time bands.
Citation: CPT Evaluation and Management code descriptors, AMA 2021
guidelines (time bands only, no descriptive text bundled).

**T15. NDC 10 ↔ 11 digit converter.** Pharmacy/billing daily tool.
Input: NDC in any format (4-4-2, 5-3-2, 5-4-1, with/without dashes).
Output: 11-digit billing format (5-4-2) and 10-digit FDA format. Pure
string algorithm; no NDC database needed. Citation: CMS NDC billing
guidance / FDA Structured Product Labeling.

### 4.5 Field & general

**T16. AVPU ↔ GCS quick reference.** Bedside conversion. Input: AVPU
level. Output: typical GCS band (Alert ≈ 15, Verbal ≈ 13, Pain ≈ 8,
Unresponsive ≈ 3) with caveat that AVPU does not finely map to GCS.
Citation: McNarry AF, Goldhill DR. Anaesthesia 2004;59:34-37.

**T17. SBAR handoff template generator.** Universal nursing/EMS handoff.
Inputs: free-text S/B/A/R fields. Output: printable, copyable SBAR card.
No database, no logic — pure template. Citation: IHI SBAR communication
toolkit.

### 4.6 Why these seventeen

Each tool clears all four bars:

1. *Frontline relevance*: a real worker reaches for it on shift.
2. *Pure determinism*: math or template, no live data.
3. *Citation strength*: peer-reviewed paper or guideline body.
4. *Coverage gap*: no existing v4 tile already does this.

Audience coverage: clinicians (T1–T13), nurses (T1–T13, T17), EMTs/field
(T11, T16, T17), pediatrics (T13), coders/billers (T14–T15), educators
(all). The set is balanced and adds real value across the five
audiences.

## 5. Implementation plan

Implementation lands in three commits to keep diffs reviewable.

### 5.1 Wave 1 — Catalog cut

- Remove the renderers, META entries, registry rows, home tiles, tests,
  and citation entries for every tile listed in §3.1.
- Delete the corresponding folders under `data/` and their manifests.
- Update `verify-integrity.mjs` expected count.
- Regenerate JSON-LD `featureList`, `sitemap.xml`, and the README tile
  count.

### 5.2 Wave 2 — Rename

- Update the home-grid section headings to the seven plain category
  names from §3.2.
- Update `GROUP_LABELS` in `app.js` to drop the letter prefix from
  breadcrumbs and search-result group tags.
- Update internal comments and docstrings as a follow-up sweep (no
  functional impact).

### 5.3 Wave 3 — New tools (T1–T17)

For each tool:

1. Pure function in `lib/clinical-v5.js` (or `lib/coding-v5.js` for
   T14/T15, `lib/workflow-v5.js` for T17).
2. Renderer in the appropriate `views/group-*.js`.
3. UTILITIES row in `app.js` with `clinical: true` for medical math.
4. META entry in `lib/meta.js` with citation + worked example.
5. Home-grid tile in `index.html` under the right category.
6. Unit tests in `test/unit/` (one suite per logical group of tools).
7. JSON-LD `featureList` entry, sitemap.xml entry, README count update,
   CHANGELOG entry.

`docs/clinical-citations.md` gets one section per new tool with the
formula, citation, and worked-example numerics.

### 5.4 Final pass

- `npm run lint`, `npm run test:unit`, `npm run sbom`, `npm run build`
  all clean.
- `node scripts/verify-integrity.mjs` reports the reduced manifest count.
- Manually load the home page in dev and click into 5+ representative
  tiles (kept and new) to confirm rendering.

## 6. Out of scope (forever)

To bound future scope creep, the following are explicitly out of scope
under v5:

- Any pricing tool that depends on a CMS/NADAC/ASP/CLFS/ASC fee file.
- Any registry tool that calls or scrapes NPPES, OIG, DEA, NUCC, or any
  state licensing board.
- Any recall, drug-shortage, or alert feed.
- Any vaccine schedule that mirrors annually-shifting ACIP recommendations.
- Any state-by-state Medicaid/SEP/patient-rights matrix.
- Any tool that requires a model, embedding, or external API.
- Any tool that requires user accounts, sign-in, or profile storage.
- Any tool whose correctness materially decays in under 12 months.

If a future need lands clearly outside these bounds it ships as a
separate, clearly-labeled sibling project, not inside sophiewell.com.

## 7. Closing note

spec.md said what sophiewell is. spec-v2 said how it should feel.
spec-v3 added field medicine. spec-v4 reached for breadth. spec-v5 is
the discipline pass: keep what is durable, kill what isn't, and add the
small set of tools that close real gaps for the people who do the work.
After v5, sophiewell.com is a smaller, faster, more trustworthy site
that one person can keep running free forever on a static host.
