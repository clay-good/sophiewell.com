# spec-v1641 — Corrections to live tools found by the pharmacy research

**Status:** In progress, October 10, 2026. Tier 1 is built (see Build status); Tiers 2 and 3 are mostly open. No new tools.
**Charter:** [spec-v1627](spec-v1627.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

Researching the pharmacy gaps meant reading the labels and rules that live tools already cite.
In 25 places a live tool shows a number the current source does not give, cites a source that
does not carry the number, or was overtaken by a rule change. This spec is the index: one row
per correction, most urgent first, each pointing to the wave spec that holds the full text, the
source and the set id. **Build this before any new tool.** Every row is a change to a tool
people use today.

Each claim about a live tool was confirmed twice on October 10, 2026: once by the research
pass and once by an independent pass that read the code path named below and re-fetched the
source. At build, read both again; this spec is a pointer, not the source.

## Build status

Updated October 10, 2026. Each row below was re-read in its source at build before the code
changed. Rows not listed are not built.

| Row | Tool | Status |
|---|---|---|
| 1 | `co-cn-antidote` | Built: text corrected to both labels; sodium nitrite added. The weight input and mL outputs in [v1636](spec-v1636.md) backfill 2 are not built (the page is still a reference card). |
| 2 | `nac-dosing` | Built: fixed dose at 100 kg, two-bag from 41 kg only, diluent volumes, no dose under 5 kg. The 110 kg jurisdiction switch is not built. |
| 3, 4 | `anticoag-reversal` | Built: andexanet marked as no longer sold in the U.S. with the FDA sentence and date; no dose returned for apixaban or rivaroxaban; the 4F-PCC 50 units/kg figure removed (its guideline could not be opened to re-read). |
| 5 | `anc` | Built: both the CTCAE v6.0 and v5.0 grades are printed. |
| 6 | `opioid-conversion` | Built: the patch is refused as a source with the label warning; a patch target is read from the label's Table 2 from 60 mg/day oral morphine. `fentanyl-patch-initial-dose` is not built. |
| 7 | `corrected-phenytoin` | Built: the ESRD result carries the Soriano 2017 finding. The paper was not read in full. |
| 8 | `peds-dose` | Built: "Max 75 mg/kg/day" removed; the label direction (not more than 5 doses in 24 hours) shown. |
| 9 | `apap-24h-max` | Built: each ceiling names its source; 2,000 mg is marked as the reader's own limit. The child mode is not built. |
| 11 | `anticoag-reversal` | Partly built: vitamin K reads 5 to 10 mg by slow IV injection (CHEST 2012 rec. 9.3). Protamine by time and the Balfaxar citation are not built. |
| 12 | `lean-body-weight` | Built: the agent-facing summary names Janmahasatian. |
| 13 | `rosendaal-ttr` | Built: the unsourced 65% "good control" line is removed. The count-based fraction in [v1634](spec-v1634.md) backfill 6 is not built. |
| 14 | `calvert-carboplatin` | Built: the cap names and links FDA's "Carboplatin dosing" communication of October 8, 2010, read in an archived copy (the page is gone from fda.gov). The 2025 Kyxata carboplatin label was also read and carries no cap. |
| 17 | `partd-year-cost` | Built: the note states the three-way "lesser of" and no deductible, from 42 CFR 423.100 and 423.120(h) as read in the eCFR. `partd-insulin-cost-cap` is not built. |
| 18 | `elemental-iron-ingested`, `conc-percent` | Built: the iron result shows each fraction's derivation from its formula mass and the hydrate assumed; the converter cites an identity. Found at build: the 20%, 12% and 33% figures are printed in the Merck Manual, which the tool already cited, so they were not unsourced. The Manual gives the 20 and 60 mg/kg lines but not the 150 mg/kg line, and StatPearls (the tool's other source) could not be opened to re-read it. |
| 23 | `egfr`, `egfr-suite`, `ckd-epi-cystatin` | Built: each shows the de-indexed mL/min value when height and weight are entered (BSA by Mosteller). |
| 25 | `opioid-mme` | Built: the 50 MME/day flag carries the guideline's sentence. Also corrected at build: the 90 MME flag was the 2016 guideline's, which the 2022 guideline dropped. |
| 19 | `abx-renal` | Partly built: rows rewritten from the labels with each label's set id and revision date. The weekly label watch is not built. |

## Tier 1: a dose or grade on screen differs from the current source

| # | Live tool | What it shows now | What the source says | Full text |
|---|---|---|---|---|
| 1 | `co-cn-antidote` | Pediatric sodium thiosulfate "400 mg/kg (max 12.5 g)". Pediatric hydroxocobalamin "70 mg/kg IV (max 5 g)". No sodium nitrite dose. (`views/group-i.js`, static text) | Nithiodote label: children, sodium thiosulfate 1 mL/kg (250 mg/kg), not over 50 mL; sodium nitrite 0.2 mL/kg (6 mg/kg), not over 10 mL. The live figure is 60% above the label. Cyanokit label, section 8.4: safety and effectiveness in children "have not been established"; 70 mg/kg is described as non-U.S. experience, with no stated maximum | [v1636](spec-v1636.md) backfill 2 |
| 2 | `nac-dosing` | Dosing weight capped at 110 kg. A "two-bag SNAP" option cited to Bateman 2014, offered at any weight. No diluent volumes. (`lib/tox-v110.js`) | Acetadote label: dose fixed at 100 kg and above (the live tool is 10% over the label at 110 kg and above); the 200 mg/kg over 4 hours then 100 mg/kg over 16 hours regimen is the label's own alternative, for 41 kg and over only, and is not the SNAP protocol; diluent volumes by weight band | [v1636](spec-v1636.md) backfill 1 |
| 3 | `anticoag-reversal` | Offers andexanet for apixaban and rivaroxaban, with both regimens | FDA safety communication, December 18, 2025: FDA "considers the risks of the product to outweigh its benefits"; not manufactured for or sold in the U.S. after December 22, 2025. A label is still listed on DailyMed; a listed label is not availability | [v1634](spec-v1634.md) backfill 1 |
| 4 | `anticoag-reversal` | "If andexanet unavailable: 4F-PCC 50 units/kg" | Neither 4F-PCC label has a factor Xa inhibitor indication. With andexanet gone this is the only number on that path, and it has no cited source. Name the guideline and re-read it, or remove the figure | [v1634](spec-v1634.md) backfill 2 |
| 5 | `anc` | 1,000–1,499 "CTCAE grade 1", 500–999 "grade 2-3", under 500 "grade 4", citing v5.0 | CTCAE v5.0: grade 2 below 1,500 to 1,000; grade 3 below 1,000 to 500; grade 4 below 500. CTCAE v6.0 (2025): grade 1 below 1,500 to 1,000; grade 2 below 1,000 to 500; grade 3 below 500 to 100; grade 4 below 100. The live labels match neither. Choose the version, print it, match its rows | [v1635](spec-v1635.md) backfills |
| 6 | `opioid-conversion` | Uses one factor (2.4 oral morphine equivalents per mcg/h) to convert both to and from the fentanyl patch (`lib/rheum-v148.js`) | The fentanyl transdermal label says its table is conservative and one-way, and that using it to convert off the patch overestimates the new opioid's dose. Remove the patch as a source drug or print the label's warning, and send to-patch requests to `fentanyl-patch-initial-dose` | [v1633](spec-v1633.md) backfills |
| 7 | `corrected-phenytoin` | With "ESRD" checked, swaps the albumin coefficient to 0.1, citing a 1992 textbook chapter | The one study found that tested the end-stage form (Soriano 2017, 21 hemodialysis patients) reports a 75% error in its abstract. Carry that finding beside the result or withdraw the branch until the paper is read in full | [v1631](spec-v1631.md) backfill 3 |
| 8 | `peds-dose` | Acetaminophen row: "Max 75 mg/kg/day" (`lib/clinical-v8.js`) | Not found in the monograph (M013) or any Tylenol label read; neither gives a mg/kg figure. Source it or remove it | [v1639](spec-v1639.md) backfill 5 |
| 9 | `apap-24h-max` | A "2000 mg (hepatic impairment / chronic alcohol use)" ceiling | Not found in any source read. The 4,000 mg figure is the monograph's; 3,000 mg is one product label's directions. Name each ceiling's source; relabel 2,000 mg as the reader's own limit or source it | [v1639](spec-v1639.md) backfill 4 |

## Tier 2: a number with no source, or credited to the wrong one

| # | Live tool | Problem | Change | Full text |
|---|---|---|---|---|
| 10 | `tpn-macro` | Cites "standard nutrition references" with no link; a fixed 2 kcal/mL for lipid is wrong for Omegaven (1.12) and Intralipid 30% (3.0); two limits have no primary source | Take the lipid product; cite the labels; source or drop the unsourced goals and limits | [v1630](spec-v1630.md) backfills |
| 11 | `anticoag-reversal` | "Vitamin K 10 mg IV"; protamine 1 mg per 100 units with no time input | CHEST 2012 gives 5 to 10 mg; the 4F-PCC labels give no dose. Protamine: print the label sentence for all patients and the time-since-heparin table labeled as pediatric (it is from the children's guideline). Cite both 4F-PCC labels by name | [v1634](spec-v1634.md) backfills 3–5 |
| 12 | `lean-body-weight` | The agent-facing summary says "Boer formula"; the code and citation are Janmahasatian | Fix the summary | [v1631](spec-v1631.md) backfill 8 |
| 13 | `rosendaal-ttr` | "Good control is commonly ≥ 65%" | Not found in any source read. Cite it or remove it | [v1634](spec-v1634.md) backfill 6 |
| 14 | `calvert-carboplatin` | Credits the 125 mL/min cap to "FDA (2010)" with no link; the carboplatin label read carries no cap | Find and link the FDA document. The cap itself is applied correctly | [v1635](spec-v1635.md) backfills |
| 15 | `iv-osmolarity` | Cites a society guideline for the 900 mOsm/L central-line threshold; omits lipid, calcium, magnesium and phosphate | Cite the FDA labels that state 900 mOsm/L outright; add a component mode | [v1630](spec-v1630.md) backfills |
| 16 | `electrolyte-replacement`, `calcium-replacement` | Ladders cite a 2006 paper and "institutional conventions" | The current FDA labels give phosphate dose bands by serum level and calcium dose and rate tables. Show the label rows | [v1630](spec-v1630.md) backfills; [v1636](spec-v1636.md) backfill 6 |
| 17 | `partd-year-cost` | "Covered insulin is capped at $35 a month" | The rule is the lesser of $35, 25% of the maximum fair price and 25% of the negotiated price, with no deductible | [v1638](spec-v1638.md) backfills |
| 18 | `elemental-iron-ingested`, `conc-percent` | Elemental fractions with no source; an arithmetic identity credited to USP | Derive the fractions from the formula; cite the identity as an identity | [v1629](spec-v1629.md) backfills |
| 19 | `abx-renal` | Its manifest says `sourceEdition: "unversioned"` with a two-year blind expiry | Record each label's set id and version and put the rows under the weekly label watch ([spec-v1628](spec-v1628.md) §1) | [v1632](spec-v1632.md) backfill 2 |
| 20 | `vte-prophylaxis-dose`, `digoxin`, `acetaminophen-nomogram` | A label and a guideline cited together without saying which row is which; a nomogram line not named | Name the source of each row; quote the label's own statement where it is silent | [v1632](spec-v1632.md) backfill 4; [v1631](spec-v1631.md) backfill 9; [v1636](spec-v1636.md) backfill 7 |

## Tier 3: the rule moved under a live tool

| # | Live tool | What changed | Change | Full text |
|---|---|---|---|---|
| 21 | `pdc-star` | The 2027 Star Ratings Technical Notes are out (September 30, 2026). For measurement year 2026 CMS replaces the three adherence measures with risk-adjusted versions that are not adjusted for inpatient and skilled nursing stays | Move the edition forward; make the stay adjustment edition-dependent | [v1638](spec-v1638.md) backfills |
| 22 | `ndc-convert`, and every tool that takes an NDC | FDA's final rule (91 FR 10749, March 5, 2026): every NDC becomes 12 digits in one 6-4-2 format, effective March 7, 2033, with a three-year transition | Add the 12-digit form; route every NDC input through one shared normalizer so 2033 is one edit | [v1637](spec-v1637.md) backfills |
| 23 | `egfr`, `egfr-suite`, `ckd-epi-cystatin` | FDA's March 2024 guidance says to dose on eGFR in mL/min, not the value indexed to 1.73 m² | Add the de-indexed value (× BSA ÷ 1.73) beside the indexed one | [v1631](spec-v1631.md) backfill 6 |
| 24 | `cockcroft-gault` | Labels disagree on the weight to use (actual on some, ideal on others, normalized on one), and the tool takes one weight as entered | Print actual, ideal and adjusted results when height is given; add a "for which drug?" selector fed by the label dataset. Do **not** add rounding of a low creatinine: the evidence read is against it | [v1631](spec-v1631.md) backfill 5; [v1632](spec-v1632.md) backfill 5 |
| 25 | `opioid-mme` | At 50 MME/day or more the 2022 CDC guideline says to offer naloxone; the live summary says only "reassess" | Add the guideline's sentence | [v1634](spec-v1634.md) backfill 7 |

## Not corrections

Every wave also lists backfills that only extend a live tool (a new mode, a link, a label
preset). Those stay in their wave specs and are built with the wave. Two live-tool questions are
owner decisions, not corrections, and are recorded in the ledger: whether
`chlorpromazine-equivalents` should show four published methods that disagree, and whether the
two benzodiazepine equivalence tools should merge.

## Tests

- Each Tier 1 row gets a test that pins the corrected value **and** asserts the old value no
  longer renders (the counterfactual): 400 mg/kg for thiosulfate, a dose above 15,000 mg in
  acetylcysteine bag 1 at any weight, an andexanet regimen without its dated status line, a
  grade label that disagrees with the printed CTCAE version, a from-patch conversion without the
  label's warning.
- Each Tier 2 row gets a test that the result carries a citation, and that a removed figure is
  gone from the page, the agent summary and the pre-rendered tool page.
- Tier 3 rows 21 and 22 carry dated behavior; their tests set the clock on each side of the date.
