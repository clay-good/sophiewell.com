# Citation staleness ledger (spec-v54 §4.2)

This is the auditable answer to "is Sophie current?" One row per
guideline-derived tile (and the foundational instruments reviewed alongside
them), naming the **edition shipped**, the **latest known edition**, the
**accessed** date the shipped text was last verified against the live source,
and a **justification** whenever the shipped edition is behind the latest.

The `scripts/check-citations.mjs` gate (wired into `npm run lint`) keeps this
file in sync with `lib/meta.js`: any tile whose `META[id].citation` matches the
guideline-issuer pattern (CDC, KDIGO, AGS, ACC, AHA, ATS, IDSA, ESC, WHO, AAP,
ACOG, Joint Commission, SAMHSA, NICE) must carry an `accessed` date **and** a
row here, or CI fails. Foundational-instrument rows are documentation only
(those tiles do not match the issuer pattern) and record that the instrument
was reviewed and deliberately retained, not missed.

`accessed` records human verification of the citation text against the source —
distinct from the dataset `fetchDate` in `data/*/manifest.json`. v54 does not
fetch any URL at build time (spec-v54 §7); liveness is verified by a human at
the quarterly source pull. No clinical formula or threshold changes here.

## Guideline-derived tiles (gate-enforced)

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| preg-dating | ACOG pregnancy redating thresholds | ACOG Committee Opinion 700 (2017, reaffirmed) | same | 2026-06-05 | current — redating thresholds (7/14/21 d) unchanged |
| peds-dose | AAP / DailyMed weight-based dosing reference | AAP guidance + current FDA drug labels | same | 2026-06-05 | current — reference table; the governing source is the live drug label, not a fixed edition |
| opioid-mme | CDC opioid prescribing / MME factors | CDC 2022 Clinical Practice Guideline (MMWR 2022;71(3)) | same | 2026-06-05 | current — the 2022 guideline superseded the 2016 version; no newer edition |
| ascvd | ACC/AHA Pooled Cohort Equations | 2013 ACC/AHA PCE (Circulation 2014;129) | 2024 AHA PREVENT (race-free) | 2026-06-05 | behind, justified — the 2013 PCE is retained as the still-widely-charted instrument; the 2024 model ships separately as the `prevent` tile |
| prevent | AHA PREVENT equations | 2024 (Circulation 2024;149(6)) | same | 2026-06-05 | current |
| field-triage | National Field Triage Guideline | 2021 ACS-COT/CDC National Guideline | same | 2026-06-05 | current — pinned from "current edition" to the 2021 edition (supersedes CDC MMWR 2011;61(RR-1)) |
| naloxone | FDA naloxone labeling + CDC overdose guidance | FDA label + standing CDC guidance | same | 2026-06-05 | current — drug label plus standing agency guidance; no fixed edition |
| tetanus | CDC/ACIP tetanus prophylaxis | ACIP MMWR 2020;69(3) | same | 2026-06-05 | current — pinned from "current edition" to the 2020 ACIP edition |
| rabies-pep | CDC/ACIP rabies post-exposure prophylaxis | ACIP MMWR 2010;59(RR-2) | 2022 ACIP update (pre-exposure only) | 2026-06-05 | behind on document year only, justified — the 4-dose PEP schedule is unchanged from 2010; the 2022 ACIP update revised pre-exposure, not post-exposure, prophylaxis |
| bbp-exposure | CDC/USPHS occupational + non-occupational PEP | USPHS 2013 (updated 2018) occupational PEP; CDC 2016 nPEP | same | 2026-06-05 | current |
| tb-testing | CDC TST / IGRA interpretation | CDC TST cutoffs + 2017 ATS/IDSA/CDC LTBI guideline | same | 2026-06-05 | current |
| sti-screening | CDC STI Treatment Guidelines | CDC STI Guidelines 2021 (MMWR 2021;70(4)) | same | 2026-06-05 | current |
| peds-weight-conv | AAP infant weight bands + lb↔kg constant | AAP bands (stable) | same | 2026-06-05 | current — physical constant plus stable reference bands |
| kdigo-aki | KDIGO AKI staging | KDIGO AKI 2012 (Kidney Int Suppl 2012;2) | 2024 KDIGO CKD guideline | 2026-06-05 | behind on the org's newest document, justified — AKI staging is unchanged from KDIGO AKI 2012; the 2024 update governs CKD evaluation, not AKI staging |
| acog-severe-pre | ACOG severe-feature preeclampsia criteria | ACOG 2013, reaffirmed PB 222 (2020) | same | 2026-06-05 | current |
| crrt-dose | KDIGO CRRT effluent dose | KDIGO AKI 2012 (§5.8, 20-25 mL/kg/h) | 2024 KDIGO CKD guideline | 2026-06-05 | behind on the org's newest document, justified — the CRRT effluent-dose target is unchanged from KDIGO AKI 2012; the 2024 update does not revise CRRT dosing |
| device-day-counter | CDC NHSN CAUTI/CLABSI definitions | CDC NHSN 2024 manual; SHEA CAUTI 2014 | NHSN refreshed annually | 2026-06-05 | current — the device-day denominator math is unchanged; NHSN definitions tracked to the 2024 manual |
| beers-check | AGS Beers Criteria | AGS 2023 (J Am Geriatr Soc 2023;71(7)) | same (next AGS update expected ~2026) | 2026-06-05 | current — 2023 is the latest AGS Beers edition; data embedded in `lib/medication-v4.js` (see docs/data-sources.md) |
| lab-interpret | Reference ranges (multi-source) | ADA 2024 / ACC-AHA 2018 cholesterol / ATA 2014 | ADA refreshed annually | 2026-06-05 | current — charted reference ranges unchanged; the ADA-sourced bands carry the spec-v60 §4 REFRESH discipline |
| tsat | KDIGO anemia-in-CKD / AGA-ACG iron guidance | KDIGO Anemia 2012 + AGA 2020 iron-deficiency guideline | same | 2026-06-05 | current — TSAT = iron/TIBC is a stable definition; the <20% threshold is unchanged across editions (spec-v55) |
| oxygenation-index | PALICC-2 pediatric ARDS severity | PALICC-2 (Emeriaud 2023, Pediatr Crit Care Med) | same | 2026-06-05 | current — 2023 is the latest PALICC consensus; OI/OSI bands as published (spec-v55) |
| vanc-auc | ASHP/IDSA/PIDS/SIDP vancomycin AUC consensus | Rybak 2020 (Am J Health-Syst Pharm 2020;77(11)) | same | 2026-06-06 | current — 2020 is the latest consensus; AUC24/MIC 400-600 target unchanged (spec-v56) |
| digoxin | ACC/AHA/HFSA Heart Failure guideline (digoxin level target) | Heidenreich 2022 (Circulation 2022;145(18)) | same | 2026-06-06 | current — 2022 is the latest ACC/AHA/HFSA HF guideline; HF target 0.5-0.9 ng/mL unchanged (spec-v56) |
| mgso4-preeclampsia | ACOG magnesium-sulfate seizure prophylaxis | ACOG Practice Bulletin 222 (2020) + Magpie (Lancet 2002) | same | 2026-06-06 | current — PB 222 is the latest ACOG preeclampsia bulletin; 4-6 g load / 1-2 g/h dosing unchanged (spec-v56) |
| peds-resus | AHA PALS resuscitation bolus | PALS 2020 (Circulation 2020;142(16 suppl 2)) | same | 2026-06-06 | current — 2020 is the latest PALS edition; 10-20 mL/kg isotonic bolus unchanged (spec-v56) |
| audit-full | WHO AUDIT alcohol-use screen | Saunders 1993 + WHO AUDIT Manual (2001) | same | 2026-06-06 | current — 2001 WHO manual is the governing edition; 8/16/20 risk zones unchanged (spec-v57) |
| feverpain | NICE NG84-endorsed FeverPAIN score | Little 2013 (BMJ 347:f5806); NICE NG84 (2018) | same | 2026-06-06 | current — NG84 remains the endorsing guideline; FeverPAIN items/bands unchanged (spec-v57) |

## Foundational instruments (documentation only)

These tiles cite a foundational paper and do **not** match the guideline-issuer
pattern, so the gate does not require a row; the rows are recorded so a
maintainer can see the instrument was reviewed and deliberately retained.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| wells-pe | Wells score for PE | Wells 2000 (Thromb Haemost 2000;83) | 2019 ESC PE guideline / YEARS algorithm | 2026-06-05 | foundational instrument retained; later work (ESC 2019, YEARS) is an alternative pathway, not a revised Wells score |
| egfr | CKD-EPI creatinine eGFR | CKD-EPI 2021 race-free (NEJM 2021;385) | same | 2026-06-05 | current — the 2021 race-free equation is the latest CKD-EPI |
| nihss | NIH Stroke Scale | Brott 1989 (Stroke 1989;20) | same | 2026-06-05 | foundational instrument, no superseding edition (NIH/NINDS-maintained, public domain) |
| gcs | Glasgow Coma Scale | Teasdale & Jennett 1974 (Lancet 1974) | same | 2026-06-05 | foundational instrument, no superseding edition |
| mini-cog | Mini-Cog | Borson 2000 (Int J Geriatr Psychiatry 2000;15) | same | 2026-06-05 | foundational instrument, no superseding edition |
| lemon | LEMON airway assessment | Reed 2005 (Emerg Med J 2005;22) | same | 2026-06-05 | foundational instrument, no superseding edition |
| fib4 | FIB-4 fibrosis index | Sterling 2006 (Hepatology 2006;43) | same | 2026-06-05 | foundational instrument; DOI added in v54 |
| apri | APRI fibrosis index | Wai 2003 (Hepatology 2003;38) | WHO 2014 HCV endorsement | 2026-06-05 | foundational instrument; WHO 2014 endorses use in resource-limited settings, cutoffs unchanged |
| rox | ROX index | Roca 2019 (AJRCCM 2019;199) | same | 2026-06-05 | foundational instrument, no superseding edition |
| vis | Vasoactive-Inotropic Score | Gaies 2010 (Pediatr Crit Care Med 2010;11) | same | 2026-06-05 | foundational instrument; extends the older Inotropic Score (Wernovsky 1995), attribution split inline in v54 |
