# spec-v29.md — The nurse-first prune: delete every simple reference guide, expand the nursing-shift catalog (+20 tiles)

> Status: proposed (2026-05-19). v29 is a **positioning + delete +
> add** spec. It is the second hard-narrowing of audience after
> [spec-v10](spec-v10.md) (which retired patient-artifact decoding).
> v29 removes the residual reference-only surface that survived
> v10 and replaces it with bedside-actionable nursing tiles.
>
> v29 amends [spec-v10 §2.3](spec-v10.md) (permanent out-of-scope
> ledger) and [scope-mdcalc-parity §1](scope-mdcalc-parity.md)
> (the "everything MDCalc does not cover" clause). It does not
> amend any spec-v11 quality rule; every new tile ships under the
> spec-v11 audit floor and the spec-v12 §5 shipping contract.
>
> Catalog effect at v29 close: **603 tiles − 47 deletions
> + 20 additions = 576 tiles**. The catalog shrinks for the first
> time in the project's history. This is intentional. Every
> surviving tile produces a result a clinician acts on; no
> surviving tile is a searchable index of static facts.

## 1. The thesis

A reference guide that does not compute anything is not Sophie's job.
Google, an EHR, an institutional intranet, or an AI assistant
already handle "what does CARC 45 mean?" or "what's the normal
range for serum magnesium?" Sophie's edge is the **deterministic
math and the bedside decision** — same input, same output, on
every device, with the citation visible inline. A code lookup is
not that. A laboratory glossary is not that. A wallet-card
infographic is not that.

The product Sophie is becoming, in one sentence:

> **MDCalc, but free, login-less, ad-less, offline-capable —
> with a catalog tuned to the nurse on shift.**

Nurses are the primary audience in priority order: **ICU and
acute-care RN (CCRN / PCCN)**, then **ED RN (CEN)**, then
**floor / med-surg RN**, then **OR / PACU RN**, then **L&D /
NICU RN**. Doctors, pharmacists, respiratory therapists,
billers, coders, and EMS providers remain valid audiences and
get every relevant tile, but the *home view default order* and
the *audit-priority queue* are sorted by nursing-shift
frequency.

Billing and coding tiles **stay in scope** — but only the
calculator-shaped ones. A claims-adjustment-reason index is out;
a time-based E/M selector that does arithmetic on documented
minutes is in. A UB-04 field-locator decoder is out; a HIPAA
60-day breach clock that counts business days is in. The line
is the same line as for clinical tiles: **does it compute, or
does it merely tell you a fact?**

## 2. What v29 deletes (47 tiles)

Each row below is an existing utility that fails the v29 test
("produces a computed result the user acts on"). Every row is
**removed from the catalog**, the renderer is deleted, the data
shard is deleted, the search synonyms are pruned, and the spec
ledger ([§6](#6-catalog-ledger)) is updated. URL hashes for
removed tiles redirect to the home view with a one-line note.

### 2.1 Code-reference lookups (Group A) — 16 tiles cut

| Tile id | Name | Why cut |
|---|---|---|
| `icd10` | ICD-10-CM Code Lookup | Static index. Replaced by EHR / CMS lookup. |
| `hcpcs` | HCPCS Level II Code Lookup | Static index. |
| `cpt` | CPT Code Reference | Static index (and AMA-restricted; the v29 cut also resolves the legal awkwardness). |
| `ndc` | NDC Drug Code Lookup | Static index. |
| `pos-codes` | Place of Service Code Lookup | Static index. |
| `modifier-codes` | Modifier Code Lookup | Static index. |
| `revenue-codes` | Revenue Code Lookup | Static index. |
| `carc` | Claim Adjustment Reason Code Lookup | Static index. |
| `rarc` | Remittance Advice Remark Code Lookup | Static index. |
| `hcpcs-mod` | HCPCS Modifier Lookup (v4) | Duplicate of `modifier-codes`. |
| `pos-lookup` | Place of Service Code Lookup (CMS) | Duplicate of `pos-codes`. |
| `tob-decode` | Type of Bill Decoder | Static index. |
| `rev-table` | Revenue Code Table (NUBC summary) | Static index. |
| `nubc-codes` | Condition / Occurrence / Value Code Reference | Static index. |
| `drg-lookup` | MS-DRG Lookup | Static index. |
| `apc-lookup` | APC / HOPPS Lookup | Static index. |
| `pcs-lookup` | ICD-10-PCS Lookup | Static index. |
| `rxnorm-lookup` | RxNorm Lookup | Static index. |
| `ndc-rxnorm` | NDC ↔ RxNorm Crosswalk | Static index. |

The **billing-and-coding survivors** in Group A after v29 are
`em-time` (Time-Based E/M Code Selector — arithmetic on minutes,
output is the billing code) and `ndc-convert` (NDC 10 ↔ 11
Digit Converter — deterministic format conversion). Those are
calculators and they stay.

### 2.2 Patient-literacy and eligibility infographics (Group C / L) — 14 tiles cut

| Tile id | Name | Why cut |
|---|---|---|
| `decoder` | Medical Bill Decoder | Regex extraction over pasted text; no computation. |
| `insurance` | Insurance Card Decoder | Pure annotation. |
| `eob-decoder` | EOB Decoder | Pure annotation. |
| `no-surprises` | No Surprises Act Eligibility Checker | Decision tree, but the "decision" is "read this PDF on cms.gov." Not bedside. |
| `insurance-card` | Insurance Card Decoder (printable) | Duplicate of `insurance`. |
| `abn-explainer` | ABN (CMS-R-131) Explainer | Pure infographic. |
| `msn-decoder` | Medicare Summary Notice Decoder | Pure annotation. |
| `idr-eligibility` | IDR Eligibility Checker (NSA) | Same as `no-surprises`. |
| `birthday-rule` | Birthday Rule Resolver | Trivial rule lookup; user explicitly called out. |
| `cobra-timeline` | COBRA Timeline | Static timeline diagram. User called out the category. |
| `medicare-enrollment` | Medicare Enrollment Period Checker | Static window lookup; user explicitly called out. |
| `aca-sep` | ACA SEP Eligibility Checker | Static eligibility tree. |
| `cms1500` | CMS-1500 Field-by-Field Decoder | Static form annotation. |
| `ub04` | UB-04 Form-Locator Decoder | Static form annotation. |
| `eob-glossary` | EOB Jargon Glossary | Pure glossary. |

The **regulatory-and-administrative survivors** that produce a
computed output remain: `breach-clock` (HIPAA 60-day breach
notification clock — date arithmetic) and the workflow
*generators* in Group H (HIPAA authorization, ROI request,
appeal letter, prior-auth checklist, SBAR template, discharge
instructions, specialty-visit prep, medication wallet card).
Those produce a tailored document from inputs; they are not
indexes.

> Open question: the patient-facing workflow generators
> (`appeal-letter`, `hipaa-roa`, `hipaa-auth`, `roi`) are in
> Sophie's audience tier 5 (patients), not the nurse-shift core.
> v29 keeps them because they are *generators* (templates
> assembled from inputs), not reference. If a future audit shows
> they get vanishingly low traffic compared to bedside tiles,
> v30 may cut them. Not in v29.

### 2.3 Field-medicine reference cards (Group I) — 7 tiles cut

| Tile id | Name | Why cut |
|---|---|---|
| `adult-arrest-ref` | Adult Cardiac Arrest Drug Reference | Pure ACLS-numeric reference. The numbers belong in the AHA wallet card. |
| `peds-arrest-ref` | Pediatric Cardiac Arrest Drug Reference | Pure PALS-numeric reference. |
| `defib` | Defibrillation Energy Calculator | A misnomer — it's a 1-J/kg lookup, not a calculation. |
| `toxidromes` | Toxidrome Reference | Static syndrome table. |
| `dot-erg` | DOT ERG Hazmat Lookup | Static index against UN/NA numbers. |
| `niosh-pg` | NIOSH Pocket Guide Lookup | Static chemical hazard reference. |
| `cpr-numeric` | CPR Numeric Reference (AHA) | Pure AHA-numeric reference. |
| `tccc` | TCCC Tourniquet & Wound-Packing | Pure narrative reference. |
| `hypothermia` | Hypothermia Staging Reference | Pure staging table with no math. The Bedside-decision version (Swiss staging → rewarming algorithm) is a candidate for v30. |
| `heat-illness` | Heat Illness Staging Reference | Same. |

Field-medicine calculators that **stay**: `peds-weight-dose`,
`cincinnati`, `fast`, `field-triage` (decision tree → triage
category), `start-triage`, `jumpstart-triage`, `bsa_burn`,
`burn-fluid` (Parkland), `peds-ett`, `naloxone`, `nexus-cspine`
(decision rule), `co-cn-antidote` (dose calculator), `ems-doc`
(documentation generator), `avpu-gcs` (numeric mapping).

### 2.4 Reference-range tables (Group K / O) — 5 tiles cut

| Tile id | Name | Why cut |
|---|---|---|
| `lab-ranges` | Common Lab Reference Ranges (Group G slot) | Static table. |
| `lab-adult` | Adult Lab Reference Ranges (NIH) | Static table. |
| `lab-peds` | Pediatric Lab Reference Ranges by Age Band | Static table. |
| `tdm-levels` | Therapeutic Drug Levels Reference | Static table. |
| `tox-levels` | Toxicology Level Reference | Static table. |
| `high-alert-card` | High-Alert Medication Wallet Card (ISMP) | Pure ISMP infographic. |
| `high-alert` | High-Alert Medication Reference (Group F slot) | Same. |
| `iv-to-po` | IV-to-PO Conversion Reference | Static equivalence table — *if* it is only a lookup. If the existing implementation also outputs a dosed conversion, **retain** and rename `iv-to-po-convert`. Decision deferred to §7.2 audit pass. |

> The `lab-interpret` tile (Group V6, the [interpretation
> walkthrough](../views/group-v6.js)) **stays**: it consumes a
> user-entered value, applies decision rules (e.g. anion-gap
> bands → acidosis subtype), and outputs a clinical
> interpretation. That is computation. The raw lab-range tables
> it depends on remain *as data shards* but are not exposed as
> standalone tiles.

### 2.5 Misc reference (Group G slots that are not scores) — 5 tiles cut

| Tile id | Name | Why cut |
|---|---|---|
| `beers` | Beers Criteria Drug-Condition Lookup | Static list of drugs to avoid. |
| `peds-vitals` | Pediatric Vital Signs by Age | Static normal-range table. |
| `asa` | ASA Physical Status Reference | Static 6-class index. |
| `mallampati` | Mallampati Class Reference | Static 4-class index. |
| `mrs` | Modified Rankin Scale Reference | Static 7-band index. |

> The Mallampati and ASA tiles are textbook reference, not
> scores in any computational sense (the user picks a class,
> reads the label of the class they picked). If a future tile
> embeds ASA-PS or Mallampati *into* a multi-input airway- or
> surgical-risk calculator (NSQIP-MICA already does — that
> tile stays), the embedded form is the keeper.

### 2.6 Total cut

Group A: 19. Group C/L: 15. Group I: 10. Group K/O: 8 (one
deferred). Group G slots that aren't scores: 5. Some rows are
listed twice across §2.1–§2.5 because they exist twice in the
catalog (v0 / v4 duplicates). Deduplicated count: **47 tile
ids removed.**

### 2.7 Files deleted

```
data/icd10cm/                  — ~50 MB of ICD-10-CM shards
data/hcpcs/                    — HCPCS Level II shards
data/cpt-summaries/            — plain-English CPT summaries
data/ndc/                      — NDC product table
data/hcpcs-modifiers/          — HCPCS modifier table
data/pos-codes/                — POS code table
data/revenue-codes/            — NUBC revenue codes
data/tob-codes/                — NUBC TOB codes
data/nubc-special-codes/       — condition/occurrence/value codes
data/drg/                      — MS-DRG table
data/apc/                      — APC / HOPPS table
data/icd10-pcs/                — ICD-10-PCS table
data/rxnorm/                   — RxNorm shards
data/crosswalks/               — NDC↔RxNorm crosswalk
data/mpfs/                     — Medicare Physician Fee Schedule shards
data/cms-1500-fields/          — form-locator strings
data/ub04-fields/              — form-locator strings
data/eob-glossary/             — EOB term glossary
data/dot-erg/                  — DOT hazmat guide
data/niosh-pg/                 — NIOSH Pocket Guide
data/toxidromes/               — toxidrome table
data/lab-ranges-adult/         — adult lab reference table
data/lab-ranges-peds/          — pediatric lab reference table
data/therapeutic-drug-levels/  — TDM table
data/tox-levels/               — toxicology level table
data/cpr-aha-numeric/          — AHA CPR numeric reference
data/tccc/                     — TCCC reference
data/aha-reference/            — AHA wallet-card numeric reference (adult+peds arrest)

lib/codes.js                   — lookup helpers for the cut code tiles
lib/birthday-rule.js
lib/cobra.js
lib/medicare-enrollment.js
lib/aca-sep.js
lib/tob.js
lib/decoder.js                 — Medical Bill Decoder regex pipeline
lib/regulatory.js              — NSA / IDR eligibility tree
lib/artifact-detect.js         — already orphaned per spec-v10 §3.1
lib/artifact-route.js          — already orphaned
lib/artifact-handoff.js        — already orphaned

views/group-a.js               — the four code-lookup renderers (replace with stub)
views/group-c.js               — the patient-literacy renderers
views/group-klmno.js           — lab/tox/form/glossary renderers (replace with stub)
```

Total bytes removed at deploy: estimated **~80 MB of data
shards plus ~3,500 lines of JS**. The service-worker pre-cache
shrinks proportionally; cold-cache offline-install time
improves materially.

URL-hash redirects: deleted ids resolve to `/#removed=<id>` on
the home view with one line of explanation and a search
suggestion. No 404. No silent drop.

## 3. NOT-DOING ledger amendments

The following permanently leave Sophie's scope. These ride on
[spec-v10 §2.3](spec-v10.md#23-what-is-permanently-out-of-scope)
and are equally hard rules. Re-introduction requires v29 to be
amended first.

- **Code-reference indexes.** ICD-10-CM lookup, HCPCS Level II
  lookup, CPT lookup, NDC lookup, POS code lookup, modifier
  lookup, revenue code lookup, CARC / RARC lookup, NUBC code
  lookup, MS-DRG / APC / ICD-10-PCS / RxNorm lookup, NDC↔RxNorm
  crosswalk. *Underlying data shards are not bundled.* The site
  does not "host the code book" in any form.
- **Patient-administrative infographics.** Birthday rule, COBRA
  timeline, Medicare enrollment period checker, ACA SEP
  eligibility, ABN explainer, MSN decoder, insurance card
  decoder, EOB decoder narrative, NSA / IDR eligibility tree,
  EOB jargon glossary, CMS-1500 field decoder, UB-04 field
  decoder.
- **Bill-text artifact decoding.** The Medical Bill Decoder
  regex pipeline is removed. Patient-artifact decoding was
  already retired by spec-v10; v29 finishes the job by removing
  the residual implementation.
- **Reference tables of normal values.** Adult and pediatric lab
  reference range tables, therapeutic drug level reference,
  toxicology level reference, pediatric vital-signs-by-age
  table, AHA CPR numeric wallet, ISMP high-alert medication
  wallet. *Underlying numeric thresholds remain in scope when
  embedded inside a calculator (e.g. NEWS2 uses pediatric
  vitals; that's fine).* Standalone tables are not.
- **Hazmat / occupational reference indexes.** DOT ERG, NIOSH
  Pocket Guide, toxidrome reference, TCCC reference. Field-
  medicine *calculators and decision rules* remain.
- **Single-class clinical references.** ASA-PS, Mallampati,
  Beers (as a standalone list), Modified Rankin Scale (as a
  standalone band reference). The embedded forms inside multi-
  input scores remain.

The general principle, codified for future spec proposals:

> **A tile that does not consume at least one user input and
> produce a computed output is not in scope for Sophie.**

This is the one-line test. "Searchable lookup of static facts"
fails it. "Form annotation" fails it. "Wallet-card infographic"
fails it. "Decision tree" passes it (input = answers; output =
decision band). "Calculator" passes it. "Generator that
assembles a tailored document from inputs" passes it.

## 4. What v29 adds (20 new nursing-shift tiles)

Each tile ships under [spec-v11](spec-v11.md) audit floor and
[spec-v12 §5](spec-v12.md) shipping contract: primary citation,
≥3 boundary worked examples, cross-implementation differential,
edge-input handling, a11y pass, prefilled worked example,
inline citation visible without a click, optional source-quoted
`interpretation` per spec-v11 §5.3.

Tiles are grouped by the v29 nursing-shift axis (§5). All 20
list `nursing-general` plus at least one of the new nursing-
subspecialty tags introduced in §5.

### 4.1 Pressure-injury and skin (3 tiles)

#### 4.1.1 `npiap-staging` — NPIAP pressure injury stage selector
- **Citation:** Edsberg LE, Black JM, Goldberg M, McNichol L, Moore L, Sieggreen M. *Revised National Pressure Ulcer Advisory Panel Pressure Injury Staging System.* J Wound Ostomy Continence Nurs 2016;43(6):585-597. Adopted by NPIAP (formerly NPUAP) 2019.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `wound-care`.
- **Inputs:** Six structured pickers (skin intact? blanchable? partial- vs full-thickness? bone/tendon/muscle visible? slough/eschar obscures depth? mucosal location?).
- **Output:** Stage 1 / 2 / 3 / 4 / Unstageable / Deep Tissue Pressure Injury / Mucosal Membrane PI per NPIAP 2016, with banner on when to recategorise (eschar removal).

#### 4.1.2 `braden` — Braden Scale for predicting pressure-sore risk
- **Citation:** Bergstrom N, Braden BJ, Laguzza A, Holman V. *The Braden Scale for predicting pressure sore risk.* Nurs Res 1987;36(4):205-210.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `geriatrics`.
- **Inputs:** Sensory perception (1–4), moisture (1–4), activity (1–4), mobility (1–4), nutrition (1–4), friction/shear (1–3).
- **Bands:** ≥19 not at risk / 15–18 mild / 13–14 moderate / 10–12 high / ≤9 very high. Interpretation per Bergstrom validation.

#### 4.1.3 `norton-push` — Norton Scale + PUSH Tool combined card
- **Citation:** Norton D, McLaren R, Exton-Smith AN. *An Investigation of Geriatric Nursing Problems in Hospital.* Churchill Livingstone, 1962. PUSH Tool 3.0: NPIAP/NPUAP 2005 (Ratliff CR, Rodeheaver GT).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-general`, `wound-care`.
- **Inputs (Norton):** Physical condition, mental condition, activity, mobility, incontinence (each 1–4).
- **Inputs (PUSH):** Wound length × width band (0–10), exudate amount (0–3), tissue type (0–4).
- **Output:** Norton score with risk band (≤14 = at risk); PUSH 0–17 with healing-trend interpretation per NPIAP 2005.

### 4.2 Fall risk (2 tiles)

#### 4.2.1 `morse-falls` — Morse Fall Scale
- **Citation:** Morse JM, Morse RM, Tylko SJ. *Development of a scale to identify the fall-prone patient.* Can J Aging 1989;8(4):366-377.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-general`, `geriatrics`.
- **Inputs:** Fall history (0/25), secondary diagnosis (0/15), ambulatory aid (0/15/30), IV/heparin lock (0/20), gait (0/10/20), mental status (0/15).
- **Bands:** 0–24 low / 25–50 moderate / ≥51 high fall risk.

#### 4.2.2 `hendrich-ii` — Hendrich II Fall Risk Model
- **Citation:** Hendrich AL, Bender PS, Nyhuis A. *Validation of the Hendrich II Fall Risk Model: a large concurrent case/control study of hospitalized patients.* Appl Nurs Res 2003;16(1):9-21.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-floor`, `nursing-general`, `geriatrics`.
- **Inputs:** Confusion/disorientation/impulsivity (4), symptomatic depression (2), altered elimination (1), dizziness/vertigo (1), male (1), prescribed antiepileptic (2), prescribed benzodiazepine (1), get-up-and-go test band (0/1/3/4).
- **Bands:** ≥5 = high fall risk (the validated cutoff).

### 4.3 ICU sedation, agitation, delirium, pain (5 tiles)

#### 4.3.1 `rass` — Richmond Agitation–Sedation Scale
- **Citation:** Sessler CN, Gosnell MS, Grap MJ, et al. *The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients.* Am J Respir Crit Care Med 2002;166(10):1338-1344.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `critical-care`, `anesthesiology`.
- **Inputs:** Single structured picker (−5 unarousable through +4 combative).
- **Output:** Score with the SCCM 2018 PADIS target-sedation interpretation (typically −2 to 0).

#### 4.3.2 `cam-icu` — Confusion Assessment Method for the ICU
- **Citation:** Ely EW, Inouye SK, Bernard GR, et al. *Delirium in mechanically ventilated patients: validity and reliability of the confusion assessment method for the intensive care unit (CAM-ICU).* JAMA 2001;286(21):2703-2710.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-icu`, `critical-care`.
- **Inputs:** RASS (must be ≥ −3 to assess); feature 1 acute change/fluctuation; feature 2 inattention (ASE letters/pictures errors >2); feature 3 altered LOC (any RASS ≠ 0); feature 4 disorganised thinking (questions + commands ≥2 errors).
- **Output:** CAM-ICU **positive** if 1+2 + (3 or 4). Negative otherwise. Banner pins SCCM 2018 PADIS prevention bundle.

#### 4.3.3 `icdsc` — Intensive Care Delirium Screening Checklist
- **Citation:** Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik Y. *Intensive Care Delirium Screening Checklist: evaluation of a new screening tool.* Intensive Care Med 2001;27(5):859-864.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `critical-care`.
- **Inputs:** 8 binary items over an 8/24-h window (altered LOC, inattention, disorientation, hallucination/delusion, psychomotor change, inappropriate speech/mood, sleep-wake disturbance, symptom fluctuation).
- **Bands:** ≥4 suggestive of delirium.

#### 4.3.4 `cpot` — Critical-Care Pain Observation Tool
- **Citation:** Gélinas C, Fillion L, Puntillo KA, Viens C, Fortier M. *Validation of the critical-care pain observation tool in adult patients.* Am J Crit Care 2006;15(4):420-427.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `critical-care`.
- **Inputs:** Facial expression (0–2), body movements (0–2), muscle tension (0–2), and either ventilator compliance (intubated, 0–2) or vocalisation (extubated, 0–2).
- **Bands:** 0–8; >2 suggests pain. Interpretation per SCCM 2018 PADIS.

#### 4.3.5 `bps` — Behavioral Pain Scale (intubated)
- **Citation:** Payen JF, Bru O, Bosson JL, et al. *Assessing pain in critically ill sedated patients by using a behavioral pain scale.* Crit Care Med 2001;29(12):2258-2263.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `critical-care`, `anesthesiology`.
- **Inputs:** Facial expression (1–4), upper-limb movements (1–4), ventilator compliance (1–4).
- **Bands:** 3–12; >5 indicates significant pain.

### 4.4 Non-ICU delirium and bedside cognition (1 tile)

#### 4.4.1 `cam` — Confusion Assessment Method (non-ICU)
- **Citation:** Inouye SK, van Dyck CH, Alessi CA, Balkin S, Siegal AP, Horwitz RI. *Clarifying confusion: the confusion assessment method. A new method for detection of delirium.* Ann Intern Med 1990;113(12):941-948.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-floor`, `geriatrics`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** Feature 1 acute onset/fluctuating course; feature 2 inattention; feature 3 disorganised thinking; feature 4 altered LOC.
- **Output:** CAM-positive if 1+2 + (3 or 4). Otherwise negative.

### 4.5 Adult early-warning (1 tile — sister to existing PEWS)

> NEWS2 and MEWS already shipped at v12. v29 adds the **bedside
> escalation timer** that the early-warning scores feed into.

#### 4.5.1 `ews-escalation` — NEWS2 / MEWS escalation-clock & re-assessment timer
- **Citation:** Royal College of Physicians. *National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS.* RCP, London 2017.
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `internal-medicine`.
- **Inputs:** Most-recent NEWS2 total, time the vitals were taken, prior NEWS2 trend.
- **Output:** Next-vitals due time (12h / 4–6h / 1h / continuous), bedside vs critical-care escalation banner per RCP NEWS2 trigger table, and a visible countdown timer rendered from the input timestamp. Wholly client-side (uses page-visible clock; nothing stored).

### 4.6 IV access and infusion safety (1 tile)

#### 4.6.1 `vip-extravasation` — Visual Infusion Phlebitis + infiltration/extravasation grading
- **Citation:** Jackson A. *Infection control — a battle in vein: infusion phlebitis.* Nurs Times 1998;94(4):68-71. Infusion Nurses Society (INS) 2021 Standards of Practice §38 (infiltration/extravasation grading 0–4).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `nursing-or`.
- **Inputs:** VIP picker (0–5: no signs … advanced thrombophlebitis); separate INS infiltration/extravasation grade picker (0–4: no symptoms … skin breakdown/necrosis with vesicant).
- **Output:** Combined display with INS escalation banner (grade 3+ extravasation → remove cannula immediately, photograph, escalate; vesicant grade 4 → antidote-decision per INS Table 38-3).

### 4.7 Stroke completers (3 tiles — NIHSS already shipped)

#### 4.7.1 `mnihss` — modified NIHSS (mNIHSS, 11-item)
- **Citation:** Meyer BC, Hemmen TM, Jackson CM, Lyden PD. *Modified National Institutes of Health Stroke Scale for use in stroke clinical trials: prospective reliability and validity.* Stroke 2002;33(5):1261-1266.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `nursing-er`, `neurology`, `emergency-medicine`.
- **Inputs:** 11 items (LOC questions, LOC commands, gaze, visual fields, facial palsy, motor arm L/R, motor leg L/R, sensory, language, neglect).
- **Output:** 0–31 mNIHSS total + severity band.

#### 4.7.2 `ich-score` — Intracerebral Hemorrhage (ICH) Score
- **Citation:** Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC. *The ICH score: a simple, reliable grading scale for intracerebral hemorrhage.* Stroke 2001;32(4):891-897.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `nursing-er`, `neurology`, `neurosurgery`, `critical-care`.
- **Inputs:** GCS band, age ≥80, ICH volume ≥30 mL, infratentorial origin, intraventricular extension.
- **Bands:** 0–6 with 30-day mortality bands (0%, 13%, 26%, 72%, 97%, 100%, 100%).

#### 4.7.3 `hunt-hess-wfns` — Hunt-Hess + WFNS aneurysmal SAH grading
- **Citation:** Hunt WE, Hess RM. *Surgical risk as related to time of intervention in the repair of intracranial aneurysms.* J Neurosurg 1968;28(1):14-20. Drake CG. *Report of World Federation of Neurological Surgeons committee on a universal subarachnoid hemorrhage grading scale.* J Neurosurg 1988;68(6):985-986.
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-icu`, `nursing-er`, `neurology`, `neurosurgery`, `critical-care`.
- **Inputs (H-H):** Symptom severity picker (I–V); (WFNS): GCS band + focal motor deficit.
- **Output:** Both grades side-by-side; banner notes the surgical-timing/outcome implication.

### 4.8 Glycemic control (1 tile)

#### 4.8.1 `insulin-correction` — Insulin correction (sliding-scale + correction-factor) calculator
- **Citation:** American Diabetes Association. *Standards of Care in Diabetes — 2024: 16. Diabetes Care in the Hospital.* Diabetes Care 2024;47(Suppl 1):S295-S306. Includes ADA-endorsed insulin-sensitivity-factor formula (1800-rule for rapid-acting analogues; 1500-rule for regular).
- **Group:** Bedside Math (`F`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `endocrinology`.
- **Inputs:** Current BG, target BG, ISF (or total daily dose for ISF computation), carb intake (g), insulin-to-carb ratio.
- **Output:** Correction units + meal-coverage units + total dose, with the ADA 2024 hospital-glycemic-target reminder banner (140–180 mg/dL non-critical; 110–180 mg/dL ICU).

### 4.9 Electrolyte replacement ladders (1 tile bundling K / Mg / Phos)

#### 4.9.1 `electrolyte-replacement` — Potassium / magnesium / phosphate IV-and-PO replacement ladder
- **Citation:** ASHP guidelines (Hammond DA, Stojakovic J, Kathe N, et al. *Effectiveness and safety of potassium replacement in critically ill patients: a meta-analysis.* JAMA Netw Open 2019;2(8):e198587) for K; Magnesium replacement: Hébert PC, Macdonald A, Goldfarb AH. *Acute hypomagnesaemia.* In: *Acute Care Internal Medicine: An Evidence-Based Approach*, Lippincott 2008. Phosphate: Brown KA, Dickerson RN, Morgan LM, Alexander KH, Minard G, Brown RO. *A new graduated dosing regimen for phosphorus replacement in patients receiving nutrition support.* JPEN J Parenter Enteral Nutr 2006;30(3):209-214 (Brown phosphate protocol).
- **Group:** Bedside Math (`F`).
- **Specialties:** `nursing-icu`, `nursing-floor`, `nursing-general`, `critical-care`, `pharmacy`.
- **Inputs:** Electrolyte chooser (K / Mg / Phos), serum level, route (IV / PO), renal function flag, NPO flag.
- **Output:** Dose ladder (e.g. K 3.0–3.4 → 40 mEq; K 2.5–2.9 → 60 mEq with rate cap 10 mEq/h peripheral / 20 mEq/h central; Mg 1.0–1.4 → 2 g IV over 1 h; Phos band → Brown nomogram dose), with the renal-adjustment banner.

### 4.10 PACU / recovery (1 tile)

#### 4.10.1 `aldrete-padss` — Modified Aldrete + PADSS post-anesthesia discharge scoring
- **Citation:** Aldrete JA. *The post-anesthesia recovery score revisited.* J Clin Anesth 1995;7(1):89-91. Chung F, Chan VW, Ong D. *A post-anesthetic discharge scoring system for home readiness after ambulatory surgery.* J Clin Anesth 1995;7(6):500-506 (PADSS).
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `nursing-or`, `nursing-floor`, `anesthesiology`.
- **Inputs (Aldrete):** Activity, respiration, circulation, consciousness, O₂ saturation (each 0/1/2).
- **Inputs (PADSS):** Vital signs, ambulation, nausea/vomiting, pain, surgical bleeding (each 0/1/2).
- **Output:** Both totals; ≥9 Aldrete OR-to-floor discharge; ≥9 PADSS home discharge per Chung 1995.

### 4.11 GI bedside (1 tile)

#### 4.11.1 `bristol-girth` — Bristol Stool Type + abdominal-girth trend
- **Citation:** Lewis SJ, Heaton KW. *Stool form scale as a useful guide to intestinal transit time.* Scand J Gastroenterol 1997;32(9):920-924. Girth-trend interpretation: ANA *Standards of Gastroenterology Nursing Practice* (2013).
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `gastroenterology`.
- **Inputs:** Bristol type picker (1–7) plus optional abdominal-girth measurements at two timestamps.
- **Output:** Bristol-type label (constipation / normal / diarrhoea), Δ girth in cm/h with the SCCM 2013 abdominal-compartment-syndrome banner if Δ girth ≥2 cm/h or absolute >20 cm change in 24 h.

### 4.12 Device day-counters and removal checklists (1 tile bundling CAUTI / CLABSI)

#### 4.12.1 `device-day-counter` — Foley CAUTI / central-line CLABSI day-counter with daily-removal checklist
- **Citation:** Centers for Disease Control and Prevention. *2024 National Healthcare Safety Network (NHSN) Patient Safety Component Manual: Chapter 7 (CAUTI), Chapter 4 (CLABSI).* Lo E, Nicolle LE, Coffin SE, et al. *Strategies to prevent catheter-associated urinary tract infections in acute care hospitals: 2014 update.* Infect Control Hosp Epidemiol 2014;35(5):464-479.
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `infectious-disease`, `quality-safety`.
- **Inputs:** Device chooser (Foley / central line), insertion date/time, optional removal-criteria checklist (5 items per CDC SHEA 2014: acute retention/obstruction, accurate I/O critically ill, peri-op surgical indication, end-of-life comfort, hourly UO required).
- **Output:** Device-days count from input timestamps; "remove today?" banner if no criterion is checked; permalink-able URL hash so the checklist state shares.

### 4.13 Regulatory bedside (1 tile)

#### 4.13.1 `restraint-timer` — Restraint reassessment timer (CMS Conditions of Participation)
- **Citation:** Centers for Medicare & Medicaid Services. *Hospital Conditions of Participation: Patients' Rights — Use of Restraint or Seclusion.* 42 CFR §482.13(e); Hospital CoP Interpretive Guidelines (Appendix A, Tag A-0178 through A-0214).
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-floor`, `nursing-icu`, `nursing-general`, `psychiatry`, `quality-safety`.
- **Inputs:** Restraint type (non-violent medical-surgical vs violent/self-destructive), patient age band, restraint-order timestamp.
- **Output:** Next physician-order-renewal due, next 1-/2-/4-/8-hour face-to-face evaluation due, next nursing re-assessment due — per 42 CFR §482.13(e). Visible client-side countdown timers per due-time.

### 4.14 Sepsis bundle timer + lactate clearance (1 tile)

#### 4.14.1 `sepsis-bundle-clock` — Surviving Sepsis 1-hour / 3-hour bundle timer + lactate-clearance tracker
- **Citation:** Evans L, Rhodes A, Alhazzani W, et al. *Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock 2021.* Intensive Care Med 2021;47(11):1181-1247. CMS SEP-1 measure (2024 specifications).
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-er`, `nursing-icu`, `nursing-floor`, `critical-care`, `emergency-medicine`, `infectious-disease`.
- **Inputs:** Time of sepsis recognition (T0); paired entries for: lactate-drawn time + value, blood-culture-drawn time, antibiotic-start time, crystalloid 30 mL/kg start time, vasopressor-start time, repeat-lactate time + value.
- **Output:** Bundle compliance per CMS SEP-1 (each element ✓/late), lactate clearance % over 6 h (per Nguyen 2004 derivation), and pending-element banners with countdown.

### 4.15 Code-blue documentation timer (1 tile)

#### 4.15.1 `code-blue-clock` — Code-blue documentation timer (chest-compression / epi-cycle / shock-cycle)
- **Citation:** American Heart Association. *2020 Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care: Adult Basic and Advanced Life Support.* Circulation 2020;142(16_suppl_2):S366-S468.
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-icu`, `nursing-er`, `nursing-floor`, `critical-care`, `emergency-medicine`.
- **Inputs:** Code start time; tappable buttons that log a rhythm-check, an epi dose, a shock energy. Pure client-side; no storage.
- **Output:** Visible countdown to next 2-min rhythm check, next 3–5 min epinephrine, last shock energy + cumulative cycle count, total downtime. Mirrors AHA 2020 cycle structure; banner notes the ROSC capnography target (>10 mmHg sustained, ideally >20).

### 4.16 Vent bundle (1 tile)

#### 4.16.1 `vent-sbt-peep` — SBT readiness checklist + ARDSnet PEEP-FiO₂ table
- **Citation:** SBT readiness: Boles JM, Bion J, Connors A, et al. *Weaning from mechanical ventilation.* Eur Respir J 2007;29(5):1033-1056. PEEP/FiO₂ table: NIH NHLBI ARDS Network. *Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and the acute respiratory distress syndrome.* N Engl J Med 2000;342(18):1301-1308 (low- and high-PEEP arms).
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-icu`, `critical-care`, `pulmonology`, `respiratory-therapy`.
- **Inputs (SBT readiness):** 5 items (PaO₂/FiO₂ ≥150, PEEP ≤8, FiO₂ ≤0.5, no vasopressors / minimal, awake/cooperative).
- **Inputs (PEEP-FiO₂):** Current FiO₂; choose low-PEEP or high-PEEP ARDSnet arm.
- **Output:** SBT yes/no per Boles 2007 criteria; suggested PEEP per the ARDSnet table (e.g. low-PEEP arm FiO₂ 0.5 → PEEP 8). Cross-link to existing `rsbi` tile.

### 4.17 CRRT bedside (1 tile)

#### 4.17.1 `crrt-dose` — CRRT effluent dose + fluid-balance tracker + citrate-Ca ratio
- **Citation:** Kidney Disease: Improving Global Outcomes (KDIGO) AKI Work Group. *KDIGO Clinical Practice Guideline for Acute Kidney Injury.* Kidney Int Suppl 2012;2(1):1-138 (effluent target 20–25 mL/kg/h). Davenport A, Tolwani A. *Citrate anticoagulation for continuous renal replacement therapy (CRRT) in patients with acute kidney injury admitted to the intensive care unit.* NDT Plus 2009;2(6):439-447.
- **Group:** Bedside Math (`F`).
- **Specialties:** `nursing-icu`, `critical-care`, `nephrology`.
- **Inputs:** Weight (kg), prescribed effluent rate (mL/h), modality (CVVH/CVVHD/CVVHDF), pre-filter replacement flow, ultrafiltration rate, ionised systemic Ca, post-filter ionised Ca.
- **Output:** Delivered effluent dose mL/kg/h (target 20–25 per KDIGO 2012), running fluid balance, citrate-to-systemic-Ca ratio with the banner thresholds (post-filter iCa 0.25–0.35 mmol/L; systemic iCa 1.1–1.2 mmol/L); citrate-accumulation warning if total/ionised ≥2.5.

### 4.18 ECMO bedside (1 tile)

#### 4.18.1 `ecmo-titration` — ECMO sweep / flow titration helper
- **Citation:** Extracorporeal Life Support Organization (ELSO). *ELSO Adult and Paediatric Respiratory Failure Guidelines.* Version 1.5, 2022.
- **Group:** Bedside Math (`F`).
- **Specialties:** `nursing-icu`, `critical-care`, `perfusion`, `cardiac-surgery`.
- **Inputs:** Modality (VV vs VA), weight (kg), current sweep (L/min), current pump flow (L/min), arterial PaCO₂, SpO₂ (or SatO₂ post-oxygenator), Hb.
- **Output:** Suggested sweep adjustment to target PaCO₂ (delta-PCO₂ → ΔL/min sweep per ELSO 2022); suggested flow adjustment to target oxygen delivery (DO₂i ≥ 6 mL/kg/min) per the ELSO calculation. Banner notes recirculation suspicion thresholds and the "do not titrate to perfect; titrate to ≥ 80% SatO₂ in VV" rule.

> ECMO titration is a high-stakes calculator; it ships with an
> explicit "this calculator is not a closed-loop controller —
> verify with attending and perfusionist" banner alongside the
> standard spec-v11 disclaimer.

### 4.19 Massive transfusion (1 tile)

#### 4.19.1 `mtp-tracker` — Massive Transfusion Protocol 1:1:1 ratio tracker
- **Citation:** Holcomb JB, Tilley BC, Baraniuk S, et al. *Transfusion of plasma, platelets, and red blood cells in a 1:1:1 vs a 1:1:2 ratio and mortality in patients with severe trauma: the PROPPR randomized clinical trial.* JAMA 2015;313(5):471-482.
- **Group:** Workflow & Documentation (`H`).
- **Specialties:** `nursing-er`, `nursing-icu`, `nursing-or`, `trauma-surgery`, `critical-care`, `anesthesiology`.
- **Inputs:** Tappable +1 buttons for PRBC, FFP, platelet apheresis unit, cryo; optional pre-MTP coags.
- **Output:** Running ratios PRBC:FFP:Platelets vs the PROPPR 1:1:1 target; banner suggesting the next product needed to keep ratio; running totals; total cumulative units; cryo dose-due flag (every 6 units PRBC per ATLS 2018).

### 4.20 Blood-product compatibility (1 tile)

#### 4.20.1 `blood-compat` — ABO/Rh blood-product compatibility quick-check
- **Citation:** American Association of Blood Banks (AABB) / Association for the Advancement of Blood & Biotherapies. *Standards for Blood Banks and Transfusion Services.* 33rd ed., 2024. AABB Technical Manual, 20th ed., 2020.
- **Group:** Clinical Criteria & Diagnostic Bundles (`H`).
- **Specialties:** `nursing-icu`, `nursing-er`, `nursing-or`, `nursing-floor`, `pathology`, `hematology`.
- **Inputs:** Recipient ABO/Rh; product type (PRBC / FFP / platelets / cryo); inventory available (multi-select compatible donor types).
- **Output:** Allowed donor types per AABB 33rd-ed compatibility tables for the chosen product, with the Rh-restriction banner for Rh-negative women of child-bearing potential. Banner reminds that emergency-release product is type-O PRBC / type-AB FFP.

> This tile is the closest v29 comes to a "reference" — but it
> **computes the answer to "can I hang this product on this
> patient?"** from two structured inputs, which is a yes/no
> bedside decision. It is not a searchable index. It survives
> the §3 one-line test.

## 5. Specialty taxonomy update

[spec-v11 §4.3](spec-v11.md) defined a closed specialty
vocabulary that included `nursing-general` as a single tag. v29
extends that vocabulary so the home view and the prompt-ranker
can sort nursing tiles by *shift type*.

### 5.1 New vocabulary additions

```
nursing-icu       — ICU / CCU / SICU / NeuroICU / CTICU bedside
nursing-er        — ED bedside
nursing-floor     — med-surg / step-down / tele bedside
nursing-or        — OR circulating / scrub / PACU
nursing-l-and-d   — labor & delivery / postpartum / antepartum
nursing-nicu      — neonatal ICU bedside
nursing-peds      — pediatric ward / PICU bedside
nursing-public-health — community-health, school, occupational
quality-safety    — for tiles that exist for regulatory/QI reasons (restraint timer, device-day counter)
respiratory-therapy
perfusion
wound-care
```

`nursing-general` is retained for nurse-relevant tiles that
don't pin to one shift type. The closed-vocabulary rule from
spec-v11 §4.3 still applies; future additions require a one-
line spec amendment.

### 5.2 Home-view default order

After v29, the home grid default order is:

1. Bedside Math (`F`)
2. Clinical Scoring & Risk (`G`)
3. Clinical Criteria & Diagnostic Bundles (`H`)
4. Workflow & Documentation (existing `H` slots)
5. Medication & Infusion
6. EMS & Field Medicine
7. Immunization & Infectious Disease
8. Clinical Math & Conversions
9. Billing & Coding (now sparse — `em-time`, `ndc-convert`, `breach-clock`)

Removed groups: Code Lookup (A non-`em-time` /
non-`ndc-convert` rows), Insurance & Patient Literacy (C), Forms
& Numbers Literacy (L), Insurance Glossary, State & Coverage
Reference, Lab Reference (K), Reference Ranges, High-Alert &
Safety (O).

### 5.3 Audience chips

Existing chips `All / Patient / Biller and Coder / Nurse and
Clinician / EMS and Field / Educator` are revised to:

```
All  /  Nurse  /  Doctor  /  Pharmacist / RT  /  EMS  /  Biller-Coder  /  Educator
```

Each chip filters the grid by the union of tile `audiences` and
`specialties`. "Nurse" is the default-selected chip on first
visit (preserved across visits via URL hash only — no
localStorage). This is the *only* user-preference signal on the
site and it exists only in the URL.

## 6. Catalog ledger

| Spec  | At close | Δ |
|-------|----------|---|
| v28   | 603      | — |
| v29 (cut) | 556 | −47 |
| **v29 (cut + add)** | **576** | **−27 net** |

This is the first reduction in catalog count in the project's
history. It is the right direction; quality and audience
sharpness matter more than absolute count, and 576 audited
tiles below the 400–600 parity-window upper bound is well-
positioned.

## 7. Shipping plan

v29 is shipped in three waves, each independently mergeable
and reversible. No "big bang" delete.

### 7.1 Wave 29-1: spec-doc and deprecation banners (no code deletions)

- Land this file.
- Update [README.md](../README.md) leading paragraph and the
  category list to reflect the post-v29 catalog.
- Update [docs/spec-v10.md §2.3](spec-v10.md) and
  [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) with
  cross-references to v29.
- Update [CHANGELOG.md](../CHANGELOG.md) with an `[Unreleased]`
  v29 entry.
- Add a one-line banner to each tile in §2.1–§2.5 noting
  "Removed in spec-v29 — use [<calculator alternative>] or the
  upstream source."

### 7.2 Wave 29-2: code and data deletions

For each tile listed in §2:

1. Remove the entry from `app.js` `UTILITIES` and any
   `META[id]`.
2. Delete the renderer function from the matching
   `views/group-*.js`.
3. Delete the data shard directory from `data/` (see §2.7).
4. Delete the helper module from `lib/` (see §2.7).
5. Prune any synonym entries from `data/synonyms.json` and any
   keyword tokens from `lib/keywords.js` / `lib/prompt.js`.
6. Add a redirect entry to the home view for the deleted hash.
7. Update unit-test snapshots and the `npm run test:unit`
   fixtures. Failing tests on the path of deletion are
   evidence-of-deletion, not regressions.
8. Refresh the SBOM (`npm run sbom`) and the service-worker
   pre-cache list.

Single PR per group letter (one for Group A, one for Group C,
one for Group I, etc.) — five PRs total in wave 29-2. Each PR
passes `npm run release:check` before merge.

`iv-to-po` decision (§2.4 deferred): a wave 29-2 audit reads
the implementation; if it ships a numeric output computed from
inputs it stays under a renamed id `iv-to-po-convert`; if it is
a static equivalence table, it is removed with the rest.

### 7.3 Wave 29-3: 20 new tiles

Tiles in §4 ship in five sub-waves grouped by audit complexity:

- **Wave 29-3a (simple scoring):** `braden`, `morse-falls`,
  `hendrich-ii`, `rass`, `bps`, `cpot`, `icdsc`, `cam`,
  `cam-icu`, `mnihss`, `ich-score`, `hunt-hess-wfns`, `aldrete-padss`.
  Each follows the existing screener / scoring renderer in
  [views/group-g.js](../views/group-g.js).
- **Wave 29-3b (criteria bundles):** `npiap-staging`, `norton-push`,
  `vip-extravasation`, `blood-compat`.
- **Wave 29-3c (bedside math):** `insulin-correction`,
  `electrolyte-replacement`, `crrt-dose`, `ecmo-titration`.
- **Wave 29-3d (timers / workflow):** `ews-escalation`,
  `restraint-timer`, `sepsis-bundle-clock`, `code-blue-clock`,
  `mtp-tracker`, `device-day-counter`, `bristol-girth`.
- **Wave 29-3e (vent bundle):** `vent-sbt-peep`.

Each sub-wave is a single PR with one tile per commit. v11
audit floor applies to every tile.

### 7.4 Ordering

Wave 29-1 ships immediately. Wave 29-2 follows once the
deprecation banners have run for ≥7 days (this is courtesy to
any external link target; there is no real obligation since
nothing in the catalog is mission-critical). Wave 29-3 may
ship in parallel with wave 29-2 — they touch disjoint files.

## 8. Acceptance criteria

v29 is fully shipped when:

- This file exists and is linked from [README.md](../README.md),
  [docs/spec-v10.md §2.3](spec-v10.md), and
  [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md).
- All 47 tiles in §2 are removed: their ids do not appear in
  `app.js` `UTILITIES`; their renderers do not appear in
  `views/*.js`; their data shards are gone from `data/`; their
  helper modules are gone from `lib/`.
- All 20 tiles in §4 are present, each with: a `META[id]` entry
  carrying the v29 specialty tags from §5.1; ≥3 worked examples
  in the unit-test suite; primary citation visible inline; the
  spec-v11 audit checklist completed.
- `npm run lint`, `npm run test`, `npm run test:e2e`,
  `npm run test:a11y`, and `npm run build` all pass.
- The home-view default chip is `Nurse` (§5.3); URL-hash-only
  persistence preserved.
- The CHANGELOG records v29 with the catalog-count delta from
  §6.

## 9. What v29 does *not* change

- Every spec-v4 through spec-v28 hard rule that does not
  conflict with §2 or §3.
- The CSP, SBOM, accessibility, threat-model commitments.
- The "no AI, no accounts, no analytics, no tracking, no email
  capture, no notifications" rules.
- The four-region tile contract, the inline-citation rule, the
  prefilled-worked-example rule, the URL-hash-state rule.
- The solo-developer cadence and the spec-v11 audit floor.
- The MIT licence.

## 10. Open questions

1. **Patient-facing workflow generators.** §2.2 keeps
   `appeal-letter`, `hipaa-roa`, `hipaa-auth`, `roi`,
   `prep`, `specialty-visit`, `discharge-instr`, `wallet-card`.
   They are *generators* (assemble a tailored document from
   inputs), not indexes, so they pass §3's one-line test. But
   they target audience tier 5 (patients) and may have
   vanishingly low traffic compared to bedside tiles. v30 may
   re-evaluate.
2. **Bill Decoder regex pipeline.** §2.2 removes the user-
   facing tile and §2.7 deletes `lib/decoder.js`. The
   deterministic-classifier modules `lib/artifact-*.js`
   (already orphaned per spec-v10 §3.1) are removed with this
   wave; nothing depends on them.
3. **Hypothermia / heat-illness staging.** Cut in §2.3 because
   the current implementation is pure reference. A v30 candidate
   is a **rewarming-decision** version (Swiss staging → active
   rewarming yes/no, ECMO indication yes/no) that would be a
   decision tree and qualify under §3. **Resolved by
   [spec-v30](spec-v30.md):** `hypothermia-rewarm` (Swiss staging
   → rewarming pathway, ERC 2021 ECPR cut-offs) and
   `heatstroke-decision` (Bouchama 2002 framework → CWI / cooling
   algorithm) ship in v30 wave 30-1.
4. **Beers Criteria.** Cut as a standalone list. A v30 candidate
   is a **Beers-driven deprescribing checker** that takes a
   medication list + age + comorbidity and outputs the
   problematic-prescription flags — that would compute, and
   would be in scope. **Resolved by [spec-v31](spec-v31.md):**
   `beers-check` ships with a closed-vocabulary intake (15 PIM
   categories, 8 comorbidities) cross-referenced against AGS 2023
   Tables 2, 3, and 6.
5. **Audience chip default.** §5.3 makes `Nurse` the default.
   This is mildly opinionated. If a future audit shows the
   default frustrates non-nurse users more than it helps
   nurses, the default-chip choice is reversible by a one-line
   change to the URL-hash initial state — no spec change needed.

These are the only open items v29 leaves; everything else in
§2–§5 is intended to be closed.
