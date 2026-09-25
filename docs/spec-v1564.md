# spec-v1564 — Field health: owner decisions, blocked tiles, outside requests, and what was rejected

Program: [scope-field-health.md](scope-field-health.md). Builds nothing. It holds every item the
research could not close, so none of it is rediscovered or built from memory later. Each row can be
reopened by supplying what it names.

## 1. Owner decisions (block the tiles named until made)

| # | Decision | Blocks | Recommendation |
|---|---|---|---|
| D1 | **Regulatory posture** for tiles that classify and advise (spec-v1540 §7). None of the six countries checked exempts free software | The classify-and-act tiles: spec-v1544 tiles 1–2, spec-v1545, `iccm-chw-sick-child`, `etat-triage`, `sam-care-setting`, `infant-at-risk-under-6-months`, `who-child-tb-algorithm` | Ship the calculator-shaped tiles first (doses, z-scores, fluids, clotting tests). Before the classify tiles, adopt the §7 framing and get one counsel opinion for the first target country |
| D2 | **Licensing posture** for CC BY-NC-SA and all-rights-reserved sources: restate facts in our words with citation, no reproduced text (spec-v1540 §6) | Every clinical spec | Adopt it; add the `who-facts-with-attribution` status and the reproduction guard |
| D3 | The same posture for **Brazil's Ministry of Health** (CC BY-NC-SA 4.0) | spec-v1556 tiles 1–5 | Adopt |
| D4 | **Pediatric ARV doses**: build with a 6-month review, or link to WHO's table instead | `who-pediatric-arv-dose`, `infant-arv-prophylaxis` | Build last, only with the edition in the title and the band snapshot test |
| D5 | **A packaged Android app** for sharing without internet (spec-v1541 §6) | Offline sharing | Not now. It creates copies with no update path |
| D6 | **Translation**: fund professional translation, or build the machinery and invite reviewed partner translations (spec-v1543 §5) | spec-v1543 phase 1 | Build the machinery after spec-v1541; seek partners |
| D7 | **A written request to WHO** (drafted below) | The blocked growth tiles in §2 | Send it; build does not wait |

## 2. Blocked by licence

| Would-be tile | Needs | Why blocked |
|---|---|---|
| WHO weight-for-age, length/height-for-age 24–60 months; BMI-for-age 0–5; MUAC-for-age; skinfolds | WHO written permission | Only on WHO's website (non-commercial, substantial portions need permission) or in GPL-3 R packages |
| WHO growth reference 5–19 years (BMI, height, weight) | WHO written permission | Same |
| WHO growth velocity (weight, length, head increments) | WHO written permission | All rights reserved, website only |
| Weight-for-height above 109.3 cm | WHO permission (the CDC file stops at 110 cm length) | See spec-v1548 |
| Small for gestational age; INTERGROWTH-21st newborn and fetal standards | University of Oxford permission (intergrowth@wrh.ox.ac.uk) | © Oxford, no reuse terms found; papers not open access |
| Direct implementation of WHO SMART digital adaptation kit decision tables or CQL | WHO confirmation of the licence | The repositories disagree (CC0, CC BY-SA, CC BY-NC-SA); treated as NC-SA until WHO says otherwise |
| FIGO misoprostol-only dosing chart | Read the chart and its licence | figo.org blocked automated access |

**Draft request to WHO permissions** (for the owner to send): *We maintain sophiewell.com, a free,
open-source (MIT) catalog of clinical calculators used offline by health workers. We ask permission to
include the numeric LMS parameters of the WHO Child Growth Standards (0–60 months, all indicators) and
the WHO Growth Reference (5–19 years) as data in the project, with full attribution and without WHO's
text, logo or charts. We also ask you to confirm the licence of the SMART Guidelines digital adaptation
kits' decision tables, whose repositories carry CC0, CC BY-SA and CC BY-NC-SA statements, and that
implementing published thresholds in our own code with citation is acceptable.*

## 3. Blocked until a primary source is read

| Would-be tile | What is missing |
|---|---|
| `modified-faine-leptospirosis` | The primary Indian guideline (API 2013). Read only in a CC BY 2016 reproduction, which does not say whether the triad's 10 points replace or add to its three items |
| `neurocysticercosis-del-brutto` (2017 revised criteria) | The primary (*J Neurol Sci* 2017;372:202–210); read only in a 2021 review, and one definitive pathway needs checking |
| `podoconiosis-stage` (Tekola 5 stages) | The primary (*Trop Med Int Health* 2006;11:1136); read only in a 2024 restatement |
| `foodborne-trematode-treatment` | WHO's primary (2011 expert consultation); read only through a summarizer, and the clonorchiasis duration disagrees with the usual 1-day course |
| `skin-ntd-triage` (WHO 2026 integrated skin-NTD guide, six decision trees) | A full visual transcription of pp. 14–27; the trees span two-page spreads. **The highest-value CHW tile in the NTD area**, worth the transcription |
| `trachoma-mda-rounds` | A current WHO rule for rounds per TF level (only the superseded 2006 rules were found) |
| Trachoma azithromycin height stick | The ITI table (the link returned a web page, not the table) |
| `vl-rk39-algorithm` (South Asia elimination definition) | A WHO primary for the national case definition |
| Khattabi scorpion classes; Abroug grade III | The full papers (paywalled); the abstract's four classes conflict with a three-class summary |
| Prazosin dose for scorpion sting | A guideline, not a single trial whose stop rule contains an evident misprint |
| WHO weight-based pralidoxime (30 mg/kg then 8 mg/kg/h) | The WHO primary |
| Brazil *Latrodectus* (widow spider) drug doses | The 2001 FUNASA manual; the 2024 child calcium dose looks like a unit error |
| Pediatric epinephrine maximum for antivenom reactions | Not stated in SEARO, AFRO or India's guideline |
| CB14 iron treatment table by weight | Re-read from the page image (the text extraction was garbled) |
| Pregnant and adult MUAC cutoffs | Sphere 2018 and FANTA 2016 (both blocked); no single WHO cutoff found |
| WHO AWaRe book weight bands as a general dosing tile | A dedicated read of the whole book; flagged as a strong future wave |

## 4. Rejected (with the reason, so they are not re-proposed)

| Candidate | Reason |
|---|---|
| IMCI 2014 ARV dose tables | Superseded regimens |
| Age-based pediatric cotrimoxazole table | In no current source; superseded by weight bands |
| Adult TB tablets by the old 30–39 / 40–54 / 55–70 / over 70 kg bands | Superseded in 2022 |
| Zidovudine infant prophylaxis | Removed by WHO in 2025 |
| 36-month isoniazid for people with HIV | Withdrawn in 2024 |
| WHO immunological HIV classification by CD4 percent | Only in an all-rights-reserved 2007 source, and obsolete under treat-all |
| Drug-resistant TB and short TB meningitis regimens | Specialist, hospital-only |
| Artesunate-pyronaridine bands | No WHO dose table |
| Perennial malaria chemoprevention schedule | WHO sets none; it is local |
| Artemether-lumefantrine hour-by-hour schedule | In no WHO text |
| Newborn resuscitation and the "golden minute" | A procedure, not a calculation; the materials are AAP-copyrighted |
| Chlorhexidine cord care; kangaroo care eligibility; fixed supplement doses | A single yes/no, or nothing to compute |
| Per-product antivenom doses | Product- and batch-specific; would name commercial products |
| Pressure-immobilization and first-aid cards | Static text; folded into the snakebite tiles |
| Paraquat, aluminum phosphide, kerosene, datura, jellyfish | No WHO or regional scoring or dosing source; paraquat needs unavailable plasma levels |
| Ebola, Lassa, mpox treatment | Hospital-only, changing evidence, or no deterministic rule |
| Dracunculiasis; mycetoma and chromoblastomycosis grading | Near-eradicated, or no WHO deterministic grading |
| Immunization schedules | National, and static tables the catalog does not carry (spec-v29) |
| Population prevalence thresholds (wasting, trachoma dossiers) | Program-level, not frontline |
| Pneumonia assessment at 5–9 years | WHO 2024 made no recommendation |
| Buruli clarithromycin column and noma antibiotic doses as printed | Ambiguous or implausible in the source |
| Scabies adult body chart as a general rule | A country example with overlapping bands |

## 5. Things found in existing tiles

| Tile | Finding | Where handled |
|---|---|---|
| `who-growth-zscore` | Prints raw z beyond ±3 where WHO restricts it (for example −5.05 vs WHO −4.75); no implausible-value flags; no 0.7 cm length/height rule | spec-v1548 tile 1 |
| `rabies-pep` | CDC-only, not labelled as such, and most of the target audience follows WHO | spec-v1557 |
| `tetanus` | CDC's 3-dose history differs from WHO's 6-dose measure | spec-v1557 |
| `snakebite-severity` | A US crotalid score with no note that it does not apply to Asian, African or Latin American snakes | Add one line and a link to spec-v1555 when that ships |
| `ltbi-regimen-dosing` | CDC/NTCA, not labelled US; WHO gives 3HP under 2 years, 1HP, and 6Lfx | spec-v1553 tile 4 |
| `docs/performance.md` | States a home-view size that counts `app.js` alone, not the modules it imports | spec-v1541 §4 |
| `file-origin-guard.js` | Tells a non-developer to run `npm run dev` | spec-v1541 §6 |
