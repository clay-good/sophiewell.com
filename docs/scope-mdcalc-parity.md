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
> brief screeners, decision rules, and triage scores — is 295; v58 close — adds 12 neonatal, maternal, and pediatric/adult ICU bedside scores — is 307; v61 close — [spec-v61](spec-v61.md), which adds 12 bedside medication-safety, electrolyte/fluid, and OB/peds tiles — is 319; v62 Part B — [spec-v62](spec-v62.md), which adds all 9 planned ICU-infusion / med-surg / OB-neonatal tiles (wave 1: 7 unambiguous tiles; wave 2: the two pinned-constant tiles `norepi-equiv` and `neo-phototherapy`) and converts the two residual static reference tables (`peds-dose`, `anticoag-reversal`) into §3 input-driven calculators (no count change for the conversions) — is 328; v63 Part B — [spec-v63](spec-v63.md), the ops-side counterpart: a shared regulatory-deadline engine (`lib/deadline.js`) plus five ops calculators (Medicare appeal-level deadlines, claim timely-filing, the 2021 E/M Medical-Decision-Making level, the prior-authorization decision clock, and the 60-day overpayment clock) — is 333; v64 — [spec-v64](spec-v64.md), which adds the single `calcium-replacement` calculator (IV-calcium dose, elemental calcium, and the calcium-gluconate↔chloride equivalence — the electrolyte the K/Mg/Phos `electrolyte-replacement` ladder omits) — is 334; v65 — [spec-v65](spec-v65.md), three bedside-physiology tiles a nurse still does on paper (`o2-cylinder-duration` time-to-empty, `minute-ventilation` + target-PaCO2 rate, `cerebral-perfusion-pressure` CPP = MAP − ICP) — is 337; v78 — [spec-v78](spec-v78.md), the first feature spec of the [spec-v77](spec-v77.md) billing & coding program, introduces **Group B "Billing & Reimbursement"** and the MPFS reimbursement engine: five deterministic, integer-cents, CMS-cited calculators (`rvu-payment` the locality-priced allowed amount, `mppr` the multiple-procedure reduction, `bilateral-pay` the modifier-50 indicator math, `multi-surgeon-pay` the assistant/co/team percentages, `sequestration-adjust` the 2% cut) — is 342; v79 — [spec-v79](spec-v79.md), the program's second feature spec, adds five claim-edit / modifier decision engines (`ncci-ptp` the NCCI procedure-to-procedure edit & modifier-bypass checker, `mue-check` the Medically Unlikely Edits units adjudication by MAI 1/2/3, `modifier-x-selector` the 59-vs-X{EPSU} decision, `global-period` the global-surgery package date math & required modifier, `modifier-order` the pricing-before-informational sequencing) — is 347; v80 — [spec-v80](spec-v80.md), the program's third feature spec, completes the E/M surface with six E/M & time-based coding engines (`em-mdm-2023` the 2-of-3 MDM level across every setting — inpatient/observation, ED, nursing facility, home — not just the office; `critical-care-time` the 99291/99292 aggregate-time units; `split-shared` the substantive-portion determiner & FS modifier; `prolonged-services` the 99417/99418-vs-G2212/G0316 unit calculator; `therapy-units` the 8-minute rule vs the Rule of Eights; `anesthesia-units` the (base+time+modifying)×CF fee with the medical-direction percentage) — is 353; v81 — [spec-v81](spec-v81.md), the program's fourth feature spec, adds three drug & infusion billing engines (`ndc-hcpcs-units` the dose→HCPCS billing-unit converter with the rounding rule and non-multiple flag, `drug-wastage` the single-dose-vial JW/JZ units with the multi-dose refusal gate and least-waste vial search, `infusion-hierarchy` the 96360-96379 initial-code picker chosen by the CMS hierarchy not chronology) — is 356; v82 — [spec-v82](spec-v82.md), the program's fifth feature spec, adds four patient-responsibility & coordination-of-benefits calculators in **Group C "Patient Bill & Insurance Tools"** (`medicare-cost-share` the Part A/B/SNF beneficiary liability, `cob-calc` the coordination-of-benefits / Medicare-Secondary-Payer secondary payment & patient residual under each named method, `allowed-amount` the contractual write-off vs patient balance with the in-network balance-bill-prohibited gate, `nsa-cost-share` the No Surprises Act QPA-based cost-share cap) — is 360; v83 — [spec-v83](spec-v83.md), the program's sixth and final feature spec, adds four claim-integrity validators (`npi-validate` the NPI Luhn check-digit validate/generate, `mbi-validate` the Medicare Beneficiary Identifier position-grammar check, `icd10-validate` the ICD-10-CM structural & 7th-character-specificity check, `era-balance` the 835/EOB remittance-balancing reconciliation) and two facility pricers (`drg-payment` the IPPS DRG weight × wage-adjusted-base estimate with the per-diem transfer reduction, `apc-payment` the OPPS APC weight × conversion-factor estimate with status-indicator packaging and the multiple-procedure discount), completing the spec-v77 billing & coding program (337 → 366, +29) — is 366; v86 — [spec-v86](spec-v86.md), the first feature spec of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds three deterministic toxicology decision rules (`serotonin-toxicity` the Hunter Serotonin Toxicity Criteria, `salicylate-toxicity` the EXTRIP evidence-based hemodialysis indication, `toxic-alcohol` the ethanol-corrected osmolar gap + AACT fomepizole indication) — is 369; v87 — [spec-v87](spec-v87.md), the program's second feature spec, adds three critical-care physiology calculators in Group E (`hemodynamic-suite` the PA-catheter cardiac-index / stroke-volume / SVR / PVR resistance suite reporting PVR in both dynes·s·cm⁻⁵ and Wood units per ESC/ERS 2022, `mechanical-power` the Gattinoni simplified mechanical power of ventilation with the >17 J/min VILI-risk flag, `dead-space` the Bohr-Enghoff Vd/Vt dead-space fraction with the EtCO₂-surrogate caveat) — is 372; v88 — [spec-v88](spec-v88.md), the program's third feature spec, adds three high-acuity endocrine/oncology calculators (`dka-hhs` the ADA hyperglycemic-crisis classification — DKA vs HHS with the mild/moderate/severe DKA grading, computed anion gap, and effective serum osmolality, in Group G; `calvert-carboplatin` the AUC-based carboplatin dose by the Calvert formula with the FDA estimated-GFR cap at 125 mL/min shown as a visible substitution, in Group F; `tls-cairo-bishop` the Cairo-Bishop tumor-lysis-syndrome laboratory/clinical grading with the 25%-change-from-baseline branch and the corrected-calcium criterion, in Group G) — is 375; v89 — [spec-v89](spec-v89.md), the program's fourth and final feature spec, closing it (366 → 379, +13), adds four subspecialty calculators in Group G (`das28` the DAS28-ESR/DAS28-CRP rheumatoid-arthritis disease-activity score with the EULAR remission/low/moderate/high bands — the catalog's first rheumatology tile, `kings-college` the King's College Criteria for transplant referral in acetaminophen-induced acute liver failure with the pH limb, the three-part coagulopathy/renal/encephalopathy limb, and the Bernal lactate modification, `asa-ps` the ASA Physical Status classification I–VI with the E-modifier rules enforced, `surgical-apgar` the Gawande intraoperative 0–10 outcome score distinct from the neonatal Apgar) — is 379; v90 — [spec-v90](spec-v90.md), the first feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds six deterministic cardiology/ECG calculators (`ecg-axis` the mean frontal-plane QRS axis by hexaxial atan2 geometry with the all-isoelectric indeterminate-axis guard, in Group E; `lvh-criteria` the Sokolow-Lyon and Cornell ECG-LVH voltage criteria with the sex-specific Cornell threshold, in Group G; `timi-stemi` the Morrow 2000 TIMI risk score for STEMI with the 30-day mortality band, in Group G; `duke-treadmill` the Mark 1987 exercise-test prognosis with the cited five-year survival, in Group E; `cardiac-power-output` the Fincke CPO = MAP×CO/451 with the <0.6 W cardiogenic-shock threshold, in Group E; `aortic-valve-area` the continuity-equation aortic valve area with the dimensionless index and the ASE/EACVI 2017 + 2020 ACC/AHA severity bands, in Group E) — is 385; v91 — [spec-v91](spec-v91.md), the second feature spec of **Wave 2** of the [spec-v85](spec-v85.md) Advanced Clinical Calculators program, adds five deterministic pulmonary-function / chronic-respiratory calculators that fill the chronic-respiratory gap beside the acute surface (`gold-spirometry` the GOLD spirometric COPD grade off post-bronchodilator FEV1/FVC < 0.70 and FEV1 %predicted, in Group G; `bode-index` the Celli 2004 multidimensional COPD prognosis 0–10 with the 4-year survival quartile, in Group G; `gap-ipf` the Ley 2012 GAP index for idiopathic pulmonary fibrosis with the cannot-perform-DLCO limb and stage mortality, in Group G; `predicted-spirometry` the GLI-2012 LMS predicted FEV1/FVC/ratio + lower-limit-of-normal from compiled coefficient/spline constants, in Group E; `mmrc-dyspnea` the Bestall 1999 modified MRC dyspnea grade 0–4 that feeds BODE and the GOLD ABE assessment, in Group G) — is 390.)

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
