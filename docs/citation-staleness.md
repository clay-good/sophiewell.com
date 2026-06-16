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
| bhutani-bilirubin | AAP hyperbilirubinemia phototherapy thresholds | Bhutani 1999 (nomogram) + AAP CPG Kemper 2022 (Pediatrics 150(3)) | same | 2026-06-06 | current — 2022 AAP CPG is the latest edition; hour-specific zones and phototherapy lines as published (spec-v58) |
| qbl-pph | ACOG / AIM / CMQCC obstetric-hemorrhage bundle | ACOG Practice Bulletin 183 + AIM/CMQCC Obstetric Hemorrhage bundle | same | 2026-06-06 | current — PB 183 remains the governing ACOG hemorrhage bulletin; >=1000 mL QBL threshold and risk tiers unchanged (spec-v58) |

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
| insulin-correction | ADA inpatient glycemic targets + ISF formulas (1800/1500-rule) | ADA Standards of Care 2024, ch. 16 (Diabetes Care 2024;47(Suppl 1):S295-S306) | ADA Standards of Care 2025 (Diabetes Care 2025;48(Suppl 1)) | 2026-06-06 | REFRESH reviewed (spec-v60 §4): the 2025 annual edition leaves the hospital glycemic targets (140-180 mg/dL general ward; 110-180 mg/dL ICU) and the insulin-sensitivity-factor rules unchanged from the cited 2024 chapter; the fully-paginated 2024 citation is retained over a less-precise 2025 reference per the no-degrade-precision rule. Re-pin pagination at the next quarterly source pull. |
| lab-interpret | mixed reference ranges (ADA 2024; 2018 ACC/AHA cholesterol; ATA 2014) | ADA Standards of Care 2024 | ADA Standards of Care 2025 (Diabetes Care 2025;48(Suppl 1)) | 2026-06-06 | REFRESH reviewed (spec-v60 §4): the ADA-sourced glucose/A1c interpretation bands are unchanged in the 2025 edition; the 2018 cholesterol and ATA 2014 thyroid ranges remain current. No band moves; citation retained. |

## spec-v61 bedside tiles (added 2026-06-06)

`urine-output` matches the guideline-issuer pattern (KDIGO) and is therefore
gate-enforced; the remaining rows are documentation only (their citations are
foundational/society papers that do not match the issuer acronym set), recorded
so a maintainer can see the source was reviewed and deliberately retained.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| urine-output | KDIGO AKI urine-output staging | KDIGO AKI 2012 (Kidney Int Suppl 2012;2) | 2024 KDIGO CKD guideline | 2026-06-06 | current for AKI — the urine-output thresholds (0.5 / 0.3 mL/kg/hr) are unchanged from KDIGO AKI 2012; the 2024 update governs CKD, not AKI staging (same rationale as the kdigo-aki row) |
| gir | Glucose infusion rate target band | Kalhan 1999 (Eur J Clin Nutr 1999;53 Suppl 1) | same | 2026-06-06 | foundational physiologic target; the 4-8 mg/kg/min neonatal band is stable |
| ebv-mabl | Gross maximum allowable blood loss | Gross 1983 (Anesthesiology 1983;58) | same | 2026-06-06 | foundational formula, no superseding edition |
| potassium-deficit | Kruse-Carlson KCl repletion | Kruse 1990 (Arch Intern Med 1990;150) | same | 2026-06-06 | foundational; presented as a coarse planning estimate with the standard repletion-rate caveats |
| magnesium-replacement | Tong-Rude Mg repletion bands | Tong & Rude 2005 (J Intensive Care Med 2005;20) | same | 2026-06-06 | foundational review; banded dose ranges stable |
| calcium-replacement | AHA ACLS calcium for hyperkalemia + elemental Ca content | AHA ACLS 2020 (Panchal, Circulation 2020;142:S366) + USP/product labeling | same | 2026-06-10 | current — the 2020 ACLS hyperkalemia calcium recommendation is unchanged in the 2023 focused update; the 10% gluconate (93 mg/g) vs chloride (273 mg/g) elemental-calcium content is a fixed pharmacology fact |
| rhig-dose | AABB RhIG / FMH dosing | AABB Technical Manual; Sandler 2015 (Transfusion 2015;55) | current AABB Technical Manual | 2026-06-06 | the 30 mL fetal-whole-blood-per-vial and round-up-plus-one conventions are unchanged across AABB editions |
| peds-transfusion-volume | BCSH/New neonatal-pediatric transfusion | New 2016 (Br J Haematol 2016;175) | same | 2026-06-06 | foundational guideline; weight-based volume formula stable |
| iv-osmolarity | ASPEN PN safe-practices osmolarity | Boullata 2014 (JPEN 2014;38) | ASPEN PN Safe Practices (current) | 2026-06-06 | the macronutrient/electrolyte osmolarity estimation and ~900 mOsm/L central-line threshold are unchanged in current ASPEN guidance |
| burn-uop-target | ABA burn-shock resuscitation UOP target | Pham 2008 (J Burn Care Res 2008;29) | same | 2026-06-06 | foundational ABA practice guideline; the 0.5 / 1.0 mL/kg/hr targets are unchanged |
| fluid-balance | Malbrain fluid stewardship overload flag | Malbrain 2018 (Ann Intensive Care 2018;8) | same | 2026-06-06 | foundational; the >10%-of-body-weight cumulative-overload flag is stable |
| carb-insulin-bolus | ADA carbohydrate-counting insulin dosing | ADA Standards of Care 2025 (Diabetes Care 2025;48 Suppl 1) | same | 2026-06-06 | current annual edition; meal-bolus / correction-factor method unchanged. Carries the spec-v60 §4 REFRESH discipline for the next annual update |

## spec-v62 bedside tiles (added 2026-06-09)

`neonatal-feeding-volume` (AAP) and `oxytocin-titration` (ACOG) match the
guideline-issuer pattern and are gate-enforced; the remaining v62 wave-1 tiles
cite ASPEN/SCCM, the FDA label, ISMP safe-practice framing, the enoxaparin US
PI/CHEST, or the Neurocritical Care Society guideline, none of which matches the
issuer acronym set, so they are documentation only. The two converted tiles
(`peds-dose`, `anticoag-reversal`) keep their existing rows above.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| neonatal-feeding-volume | AAP Pediatric Nutrition feeding volume | AAP Pediatric Nutrition (Kleinman & Greer, eds.) | same | 2026-06-09 | current — the 120-180 mL/kg/day term-newborn requirement is stable across editions |
| oxytocin-titration | ACOG Induction of Labor oxytocin titration | ACOG Practice Bulletin (Induction of Labor) | same | 2026-06-09 | current — standard low-dose / high-dose titration regimens unchanged; the tile's core output is a unit conversion, not a dose recommendation |
| icu-nutrition-target | ASPEN/SCCM adult critical-care nutrition | McClave 2016 (JPEN 2016;40(2)) | same | 2026-06-09 | foundational guideline; 25-30 kcal/kg and 1.2-2.0 g/kg targets unchanged (documentation only — does not match the issuer pattern) |
| vte-prophylaxis-dose | Enoxaparin US PI + CHEST VTE prevention | Lovenox US PI; Gould 2012 (Chest 2012;141 Suppl) | same | 2026-06-09 | label-anchored; the CrCl <30 renal reduction and prophylaxis/treatment regimens are unchanged (documentation only) |
| enteral-free-water | ASPEN enteral-nutrition safe practices | Boullata 2017 (JPEN 2017;41(1)) | same | 2026-06-09 | foundational; free-water-fraction arithmetic is stable (documentation only) |

## spec-v62 Part B wave 2 (added 2026-06-10)

`neo-phototherapy` cites the AAP 2022 hyperbilirubinemia CPG and matches the
guideline-issuer pattern, so it is gate-enforced and carries the spec-v60 §4
REFRESH discipline for the next AAP edition. `norepi-equiv` cites the Kotani
2023 / Goradia 2021 scoping reviews (Crit Care / J Crit Care), which do not
match the issuer acronym set, so it is documentation only.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| neo-phototherapy | AAP hyperbilirubinemia phototherapy + exchange thresholds | AAP CPG Kemper 2022 (Pediatrics 150(3)) | same | 2026-06-10 | current — 2022 AAP CPG is the latest edition; phototherapy and exchange-transfusion curves anchored from the published figures (spec-v62 §3.3). Carries the spec-v60 §4 REFRESH discipline for the next AAP edition |
| norepi-equiv | Kotani norepinephrine-equivalent (NEE) score | Kotani 2023 (Crit Care 2023;27:29); Goradia 2021 (J Crit Care 2021;61) | same | 2026-06-10 | proposed-standard conversion factors stable since 2023 (documentation only — does not match the issuer pattern) |

## spec-v86 toxicology decision rules (added 2026-06-16)

First feature spec of the spec-v85 Advanced Clinical Calculators program. The
three sources do not match the guideline-issuer acronym set (EXTRIP, AACT, QJM,
JAMA, Ann Emerg Med are not in the pattern), so these rows are documentation
only, recording that each revisable recommendation (Class B per spec-v85 §6.3)
was reviewed and the edition in force was pinned. `serotonin-toxicity` is a
fixed published decision rule (Class A) with no calendar revision.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| serotonin-toxicity | Hunter Serotonin Toxicity Criteria | Dunkley 2003 (QJM 96(9):635-642) | same | 2026-06-16 | current — fixed published decision rule (Class A); no calendar revision (documentation only — does not match the issuer pattern) |
| salicylate-toxicity | EXTRIP salicylate hemodialysis recommendation | EXTRIP Workgroup 2015 (Ann Emerg Med 66(2):165-181) | same | 2026-06-16 | current — 2015 EXTRIP recommendations are the latest; review on next EXTRIP publication (documentation only — does not match the issuer pattern) |
| toxic-alcohol | AACT methanol / ethylene-glycol fomepizole indication | Barceloux methanol 2002 / ethylene glycol 1999 (J Toxicol Clin Toxicol) | same | 2026-06-16 | current — AACT practice guidelines; osmolar-gap arithmetic (Smithline 1976) is a stable formula (documentation only — does not match the issuer pattern) |
