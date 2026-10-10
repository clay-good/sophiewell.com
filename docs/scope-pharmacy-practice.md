# Scope — pharmacy practice

**Status:** Specified October 10, 2026. Nothing is built; each spec's "Build status" section
will say what is.
**Specs:** [spec-v1627](spec-v1627.md) (charter) through [spec-v1641](spec-v1641.md).
**When built:** the count is in the table below.

This ledger records how the gap was found, what the research established, what the program
will build, what it deliberately won't, and what the owner still has to decide. The charter
holds the rules; this page holds the evidence.

## The gap finder

**The question.** The medication-access program ([scope-medication-access.md](scope-medication-access.md))
served the pharmacy that bills and dispenses. Does the catalog serve the pharmacist who
verifies, compounds, monitors and counsels?

**Method.** Twelve research passes on October 10, 2026, one per practice area, each working
from the full live catalog (every id, name and summary) and each required to:

1. enumerate the area's work from its own registers (the chapters of a pharmaceutical
   calculations course, the stations of an IV room, the antidote shelf label by label, 21 CFR
   parts 1301 to 1317, 42 CFR parts 423, 447 and 483, the CPIC guideline list, 10 CFR part 35);
2. search the catalog for each candidate by several synonyms, the drug, the eponym and the
   output, and read the source of every near neighbor before calling something absent;
3. open the primary source and read the number on the page, or list the item as unverified.

Then twelve **independent verification passes**, one per spec, re-fetched the sources,
re-checked 30 to 75 claims each, recomputed every worked example, and confirmed every proposed
id against the catalog and against the other specs.

**What the catalog already had.** Bedside drips and scores in depth; one beyond-use-date entry;
one renal dose-adjustment entry covering four antibiotic labels; seven kinetics entries; three
anticholinergic and deprescribing entries; the dispensing, 340B, pricing and adherence set from
the medication-access program.

**What it lacked entirely.** Alligation, dilution, milliequivalents from a formula, isotonicity,
aliquots; vial and bag arithmetic and every parenteral nutrition limit; label dose checks for
any drug beyond four antibiotics; anticoagulant switching and periprocedural timing; one-way
opioid starts; titration calendars; missed-dose rules; DEA, supply-chain and packaging rules;
Part D pharmacy rules; nursing-facility pharmacy rules; chemotherapy verification;
investigational-drug clocks; all of nuclear pharmacy; all of pharmacogenomics.

**Result after dedupe.** Nine proposals were made twice by different passes and were merged to
one owner each (reconstitution, methotrexate rescue, phenytoin loading, transplant formulation
switches, missed long-acting injections, salt-to-milliequivalent conversion, the medication-pass
error rate, the opioid taper, GLP-1 missed doses). No proposed id collides with a live id, and
no id appears in two specs.

## The count

| Spec | Wave | New | Build-gated | Backfills |
|---|---|---|---|---|
| [v1629](spec-v1629.md) | Pharmaceutical calculations and nonsterile compounding | 25 | 1 | 5 |
| [v1630](spec-v1630.md) | Sterile compounding, IV admixture, parenteral nutrition, hazardous drugs, storage | 17 | | 8 |
| [v1631](spec-v1631.md) | Clinical pharmacokinetics and therapeutic drug monitoring | 20 | 1 | 10 |
| [v1632](spec-v1632.md) | Dose checks read from the FDA label (about 90 labels) | 18 | | 6 |
| [v1633](spec-v1633.md) | Conversions, switches, titrations and tapers | 23 | | 6 |
| [v1634](spec-v1634.md) | Medication review, medication safety, pharmacovigilance | 30 | 7 | 9 |
| [v1635](spec-v1635.md) | Oncology pharmacy, investigational drug service, nuclear pharmacy | 35 | 2 | 5 |
| [v1636](spec-v1636.md) | Hospital pharmacy: label antidote dosing, stewardship metrics, department measurement | 21 | | 7 |
| [v1637](spec-v1637.md) | Federal pharmacy law as arithmetic | 24 | 1 | 6 |
| [v1638](spec-v1638.md) | Part D, Medicaid, long-term care, pharmacy finance | 28 | | 5 |
| [v1639](spec-v1639.md) | The community pharmacy counter | 15 | 1 | 7 |
| [v1640](spec-v1640.md) | Pharmacogenomics | 9 | | 3 |
| | **Total** | **265** | **13** | **77** |

[spec-v1628](spec-v1628.md) (machinery) and [spec-v1641](spec-v1641.md) (corrections to live
entries) add nothing new. A build-gated entry is counted because its spec is complete except for
one source nobody could open; it is not built until that source is read.

## Research record: findings that changed the plan

Each wave spec carries its own full record with URLs. These are the ones that reshaped a wave or
that a builder would otherwise get wrong.

| Finding | Effect |
|---|---|
| A label's XML `effectiveTime` is not its edition date (one label read "2019" at a version published in December 2025), and one drug has many set ids out of step | The label-edition contract in [spec-v1628](spec-v1628.md) §1: holder's set id, version and published date |
| Labels do not share a renal measure or a weight basis (creatinine clearance, eGFR, serum creatinine, clearance per 1.73 m²; actual weight on some labels, ideal on others) | No single generic dose-check engine input; class entries in [v1632](spec-v1632.md); a weight selector for `cockcroft-gault` |
| The verification pass found the draft's colchicine dialysis row wrong (0.3 mg daily; the label gives 0.3 mg twice a week for prophylaxis) | Corrected; the reason every number is re-read at build |
| Current labels make most opioid conversions one-way ("not equianalgesic"; cannot be run in reverse) | The opioid starts in [v1633](spec-v1633.md) have no reverse mode; a correction to the live `opioid-conversion` |
| Andexanet is no longer sold in the United States (FDA, December 18, 2025) | No new reversal entry; corrections to the live `anticoag-reversal` |
| The Acetadote label now carries its own two-bag regimen and fixes the dose at 100 kg | IV acetylcysteine is a correction to `nac-dosing`, not a new entry |
| Several familiar oncology limits are not on the current labels (no vincristine 2 mg cap, no cisplatin per-cycle ceiling, idarubicin 90 mg/m², no doxorubicin 450 mg/m² line) | `cumulative-dose-limit` reports each label's own sentence and ships no cross-anthracycline factors |
| CPIC's tables are CC0 and machine-readable; PharmGKB, PharmVar and DPWG are not shippable | Pharmacogenomics became its own spec ([v1640](spec-v1640.md)) |
| CPIC's CYP2D6 activity values moved after the 2019 consensus paper (*9 and *41 are now 0.25) | Activity values are pinned data, never constants |
| The 12-digit NDC is final (91 FR 10749; effective March 7, 2033) | A correction to `ndc-convert` and one shared normalizer |
| The DSCSA small-dispenser exemption runs to November 27, 2027; the 9 g pseudoephedrine limit binds the purchaser, not the seller; the methadone "30 mg" first-dose line is gone from 42 CFR 8.12 | [v1637](spec-v1637.md) written from the current text |
| The temporary telemedicine prescribing rule (21 CFR 1307.41) expires December 31, 2026 | `oud-telemedicine-rx-window` fails closed on January 1, 2027 |
| Appendix PP gives the gradual-dose-reduction pattern for the first year only; "then annually" is not in it. The psychotropic guidance moved from F758 to F605 | `gdr-attempt-check` covers the first year |
| Three Part D thresholds at 90 MME differ at the boundary (≥ 90 on a day; > 90 average over six months; ≥ 90 average over 90 days) | Three separate checks in [v1638](spec-v1638.md), never one |
| The 2027 Star Ratings Technical Notes replace the adherence measures' stay adjustment for measurement year 2026 | A correction to `pdc-star` |
| NIST publishes atomic weights as intervals; IUPAC CIAAW publishes single abridged values | The one shipped dataset in [v1629](spec-v1629.md) |
| 27 CFR 30.66 accounts for alcohol-water contraction and its own worked example truncates mid-calculation | `ethanol-proof` shows the unrounded result beside the regulation's figure |
| Lipid emulsion maximums differ by product and age band; amino acid labels print their own nitrogen factors; six labels state the 900 mOsm/L central-line threshold outright | Product-specific checks in [v1630](spec-v1630.md); a label citation for `iv-osmolarity` |
| The NIOSH 2024 list reviewed only drugs approved or newly warned from January 2014 through December 2015 | A miss on `hazardous-drug-list-check` never reads as "not hazardous" |
| 10 CFR 35.60 no longer carries numeric dose-calibrator limits; NIST withdrew its half-life table | Dose-calibrator checks rejected; half-lives read from each product's label |
| FDA announced enforcement on October 31, 2025 against ingestible fluoride labeled for children under 3 | `fluoride-supplement-schedule` is build-gated and an owner decision |
| CDC's missed-pill rules knowingly differ from many combined-pill labels; patch and ring labels disagree with CDC on the action | Combined pill kept with both named (owner decision); patch and ring rejected |
| DEA publishes no statement of its registration-number check-digit arithmetic | `dea-number-check` is build-gated and an owner decision |
| Rounding a low creatinine up to 1.0 in Cockcroft-Gault made estimates worse in the one large study read | Rejected; the correction to `cockcroft-gault` prints that finding |

## Owner decisions

Each is recorded in full in its spec. A decision gates only the entry named.

| # | Decision | Spec |
|---|---|---|
| 1 | When no NDA or BLA holder's label is on DailyMed, is one manufacturer's generic label an acceptable pin? Dozens of drugs across the program depend on it. The machinery spec says yes, named on the page | [v1628](spec-v1628.md) §1 |
| 2 | `dea-number-check`: ship on a formula that DEA's own example obeys and a journal states, or hold until DEA prints it | [v1637](spec-v1637.md) |
| 3 | `contraceptive-missed-pill`: keep the combined-pill branch (CDC against labels) or only the progestin-only branches | [v1639](spec-v1639.md) |
| 4 | `fluoride-supplement-schedule`: drop it, or build it with FDA's sentence in every result | [v1639](spec-v1639.md) |
| 5 | `hazardous-drug-list-check` and the gene-drug lookups are deciders over a list. Do they pass admission rule 1 on the `substitution-check` precedent? | [v1630](spec-v1630.md), [v1640](spec-v1640.md) |
| 6 | `anticoag-reversal`: how to word andexanet while a label is still listed and the license withdrawal is unconfirmed | [v1634](spec-v1634.md) |
| 7 | `nac-dosing`: drop the 110 kg cap for the U.S. label or keep it behind a jurisdiction switch with a source | [v1636](spec-v1636.md) |
| 8 | `corrected-phenytoin`: annotate the end-stage renal branch or withdraw it | [v1631](spec-v1631.md) |
| 9 | `chlorpromazine-equivalents`: show four published methods that disagree, or leave it. Merge the two benzodiazepine equivalence entries? | [v1633](spec-v1633.md) |
| 10 | Instruments read only in open reprints (DIPS, Hartwig): ship with a confirm-against-original gate, or wait | [v1634](spec-v1634.md) |
| 11 | Facts from a CC BY-NC-ND paper or a free-to-read society guideline (levodopa equivalents; heart-failure target doses): confirm the facts-with-attribution posture | [v1633](spec-v1633.md) |
| 12 | CPIC dataset expiry: 14 days by the house rule for weekly files (two missed fetches silence eight entries) or longer. Ask CPIC whether naming "CPIC" in text needs permission | [v1640](spec-v1640.md) |
| 13 | Where a label's table and its own stated rule disagree (botulism antitoxin 55 to 69 kg; Multrys at two weights), the spec follows the table and shows both. Confirm | [v1636](spec-v1636.md), [v1630](spec-v1630.md) |
| 14 | `adjusted-patient-days` rests on a HUD worksheet and two state laws; no general federal definition was found. Keep or reject | [v1636](spec-v1636.md) |
| 15 | Two figures in [v1630](spec-v1630.md) come from a table CDC reprints with permission. Keep as single cited figures or drop | [v1630](spec-v1630.md) |
| 16 | Closed specialty vocabulary: add `nuclear-pharmacy` and `compounding`, or tag with `pharmacy` alone | [v1628](spec-v1628.md) §4 |
| 17 | `compound-copy-check` counts exactly 10% as "within 10%"; FDA's guidance is silent on the boundary | [v1629](spec-v1629.md) |
| 18 | The 8-step and 16-step desensitization tables reproduce from the same paper; adding them makes the id `desensitization-12-step` a misnomer | [v1635](spec-v1635.md) |

## Verify at build

Every spec ends with its own list. The program-wide items:

- **The label watch's unchanged-hash path** was reasoned from the DailyMed service's shape and
  not run across two real versions of one label ([spec-v1628](spec-v1628.md) §1).
- **Labels read on a repackager's or generic's copy** must be re-pinned and re-read; each spec
  lists its own.
- **Thirteen build-gated entries** wait on one unread source each: Hull-Sarubbi coefficients,
  Hryniuk 1984, the 2024 pediatric administered-activity table, an official DEA checksum
  statement, FDA's fluoride evaluation, FDA's final rule on interstate compounding, and seven
  instruments in [v1634](spec-v1634.md) whose weights are paywalled.
- **Sources that blocked scripted access** (cdc.gov, nrc.gov, several publishers) were read
  through a browser or an open copy; each spec says which copy.
- **Currency.** Everything is as of October 10, 2026. Dated rules with a known next change:
  21 CFR 1307.41 (December 31, 2026), the DSCSA small-dispenser exemption (November 27, 2027),
  the Medicare thresholds published each spring, the direct final rule 91 FR 59988 (effective
  February 4, 2027), the 12-digit NDC (March 7, 2033).

## Rejected (program level)

Each spec has its own table with the reason for every row; about 280 ideas were rejected in all.
The recurring reasons:

| Idea | Why |
|---|---|
| Drug-interaction, allergy and duplicate-therapy screening | Licensed, fast-changing databases |
| Bayesian or one-level vancomycin dosing; lithium dose prediction | Needs a proprietary prior, or the one open validation measured large error |
| Pediatric dose rules of thumb (Young, Clark, Fried) | Prescribing by a superseded heuristic |
| Tables of E-values, displacement factors, capsule volumes, drops per mL, HLB values, overfill | No shippable primary source; reader input instead |
| Calcium-phosphate solubility curves | No label prints one; the reader's site limit is the input |
| Neonatal and pediatric label doses as a program | A separate program: twelve weight, age and formulation table shapes were seen |
| Morisky, ARMS, MRCI, MARS-5, Hill-Bone, BMQ | Licensed instruments |
| NCCN content, NHS dose-banding tables, DPWG text, PharmGKB annotations | License, or the source would not open |
| A four-way loop diuretic converter; levothyroxine IV-to-oral; U-500 insulin conversion | The labels do not state them (only bumetanide to furosemide is on a label) |
| Cross-anthracycline equivalence factors | Not on any label read |
| Push-dose pressor dilution | No label gives a recipe |
| Contraceptive patch and ring missed-dose rules | Label and CDC disagree on the action |
| Cough and cold doses under age 6 | The monograph prints them; current labels say "do not use". The label is followed |
| A sig-code translator; a tall-man lettering formatter | No licensable authoritative source; a lookup of a short list |
| Dose-calibrator test limits | No longer in the regulation |
| Fifty-state tables, schedules that shift yearly, live status | Standing rules |

## Found in passing

Twenty-five corrections to live entries, most urgent first, are indexed in
[spec-v1641](spec-v1641.md). The first nine are doses or grades on screen that differ from the
current source. They should be built before anything new.
