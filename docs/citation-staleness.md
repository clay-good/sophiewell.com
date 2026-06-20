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

## spec-v87 hemodynamics & ICU physiology (added 2026-06-16)

Second feature spec of the spec-v85 Advanced Clinical Calculators program. Only
`hemodynamic-suite` cites a guideline issuer in the pattern set (ESC), and its
revisable value is the **Class B** ESC/ERS 2022 PVR threshold (PVR > 2 Wood
units defines pre-capillary pulmonary hypertension); review on the next ESC/ERS
pulmonary-hypertension guideline edition. The Swan-Ganz resistance arithmetic
itself is a fixed formula (Class A). `mechanical-power` (Gattinoni 2016 /
Serpa Neto 2018) and `dead-space` (Bohr-Enghoff / Nuckton 2002) are fixed
published equations with no issuer-pattern acronym (Class A; documentation
only) and are recorded here for completeness.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| hemodynamic-suite | ESC/ERS PVR threshold (> 2 Wood units) | 2022 ESC/ERS PH guideline (Eur Heart J 43(38):3618-3731) | same | 2026-06-16 | current — 2022 ESC/ERS is the latest edition; Class B, review on the next ESC/ERS PH guideline. Swan-Ganz resistance arithmetic is a stable formula (Class A) |
| mechanical-power | Gattinoni mechanical-power equation + Serpa Neto 17 J/min association | Gattinoni 2016 (Intensive Care Med 42(10)) / Serpa Neto 2018 (44(11)) | same | 2026-06-16 | current — fixed published equation (Class A); no calendar revision (documentation only — does not match the issuer pattern) |
| dead-space | Bohr-Enghoff Vd/Vt + Nuckton 0.6 ARDS threshold | Nuckton 2002 (N Engl J Med 346(17):1281-1287) | same | 2026-06-16 | current — fixed published equation (Class A); no calendar revision (documentation only — does not match the issuer pattern) |

## spec-v88 endocrine & oncologic emergencies (added 2026-06-16)

Third feature spec of the spec-v85 Advanced Clinical Calculators program. None
of the three citations names a guideline issuer in the check-citations issuer
pattern, so these rows are documentation-only. Two carry revisable thresholds
(Class B per spec-v85 §6.3): the ADA hyperglycemic-crisis diagnostic thresholds
(reconciled to the 2024 ADA/EASD consensus) behind `dka-hhs`, and the FDA
estimated-GFR cap (125 mL/min) behind `calvert-carboplatin`. `tls-cairo-bishop`
is the fixed 2004 Cairo-Bishop definition (Class A). The underlying arithmetic
(effective osmolality, anion gap, the Calvert formula, corrected calcium) is
stable formula in every case.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| dka-hhs | ADA hyperglycemic-crisis diagnostic & DKA-severity thresholds | Kitabchi 2009 (Diabetes Care 32(7)) + 2024 ADA/EASD consensus | same | 2026-06-16 | current — 2024 consensus is the latest; Class B, review on the next ADA/EASD hyperglycemic-crises statement. Osmolality and anion-gap arithmetic are stable formula (Class A) |
| calvert-carboplatin | FDA estimated-GFR cap (125 mL/min) for carboplatin dosing | FDA recommendation 2010 | same | 2026-06-16 | current — the FDA cap recommendation stands; Class B, review on the next FDA carboplatin-labeling update. The Calvert formula (J Clin Oncol 1989;7(11):1748-1756) is a fixed equation (Class A) |
| tls-cairo-bishop | Cairo-Bishop tumor-lysis-syndrome definition & grading | Cairo-Bishop 2004 (Br J Haematol 127(1):3-11) | same | 2026-06-16 | current — fixed published definition (Class A); no calendar revision (documentation only — does not match the issuer pattern) |

## spec-v89 rheumatology, hepatology & perioperative (added 2026-06-16)

Fourth and final feature spec of the spec-v85 Advanced Clinical Calculators
program, closing it (366 -> 379, +13). None of the four citations names a
guideline issuer in the check-citations issuer pattern, so these rows are
documentation-only. Two carry revisable thresholds (Class B per spec-v85 §6.3):
the EULAR DAS28 disease-activity cutoffs behind `das28`, and the ASA Physical
Status 2020 definitions behind `asa-ps`. `kings-college` (O'Grady 1989 + Bernal
2002) and `surgical-apgar` (Gawande 2007) are fixed published rules (Class A).
The underlying arithmetic (the DAS28 formula, the King's College thresholds, the
Surgical Apgar point bands) is stable formula in every case.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| das28 | EULAR DAS28 disease-activity cutoffs (remission/low/moderate/high) | EULAR cutoffs over Prevoo 1995 (Arthritis Rheum 38(1)) / Wells 2009 (Ann Rheum Dis 68(6)) | same | 2026-06-16 | current — EULAR remission < 2.6 / low 3.2 / moderate 5.1 cutoffs stand; Class B, review on the next EULAR RA management update. The DAS28 formula is a fixed equation (Class A) |
| asa-ps | ASA Physical Status definitions & approved examples | ASA 2020 amendment | same | 2026-06-16 | current — the 2020 amendment is the latest; Class B, review on the next ASA Physical Status statement. The descriptor->class mapping and E-modifier rule are stable (Class A) |
| kings-college | King's College Criteria (acetaminophen pathway) + Bernal lactate modification | O'Grady 1989 (Gastroenterology 97(2)) + Bernal 2002 (Lancet 359(9306)) | same | 2026-06-16 | current — fixed published rule (Class A); no calendar revision (documentation only — does not match the issuer pattern) |
| surgical-apgar | Surgical Apgar Score point bands & risk gradient | Gawande 2007 (J Am Coll Surg 204(2)) + Regenbogen 2009 (Arch Surg 144(1)) | same | 2026-06-16 | current — fixed published score (Class A); no calendar revision (documentation only — does not match the issuer pattern) |

## spec-v90 cardiology & ECG (added 2026-06-16)

First feature spec of Wave 2 of the spec-v85 Advanced Clinical Calculators
program (catalog 379 to 385, +6). Five of the six computations are Class A
fixed instruments whose citations do not match the check-citations issuer
pattern and carry no row: `ecg-axis` (hexaxial geometry), `lvh-criteria`
(Sokolow-Lyon 1949 + Cornell 1985 voltage thresholds), `timi-stemi` (Morrow
2000 point weights / mortality bands), `duke-treadmill` (Mark 1987 coefficients
/ bands), and `cardiac-power-output` (the fixed conversion divisor 451 watts).
One computation is Class B: the
`aortic-valve-area` severity cutoffs follow the revisable ASE/EACVI 2017
echo-assessment recommendations and the 2020 ACC/AHA valvular guideline, so it
carries the row below (its citation also matches the ACC/AHA issuer pattern, so
the row is gate-required). Cadence is on-publication: re-verify when the next
ASE/EACVI echo-assessment update or ACC/AHA valvular guideline publishes.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| aortic-valve-area | Aortic-stenosis severity cutoffs (mild/moderate/severe AVA + dimensionless index) | ASE/EACVI 2017 (J Am Soc Echocardiogr 30(4)) + 2020 ACC/AHA valvular guideline (Circulation 2021;143(5)) | same | 2026-06-16 | current — the 2017 ASE/EACVI recommendations and the 2020 ACC/AHA guideline are the latest; Class B, review on-publication of the next echo-assessment update. The continuity equation (pi.(d/2)^2.VTI ratio) is fixed formula (Class A) |

## spec-v91 pulmonary function & chronic respiratory disease (added 2026-06-16)

Wave 2 of the spec-v85 Advanced Clinical Calculators program adds five pulmonary
computations. Three are Class A fixed instruments whose citations do not match
the check-citations issuer pattern and carry no row: `bode-index` (Celli 2004
point weights / 4-year survival quartiles), `gap-ipf` (Ley 2012 point weights /
stage mortality), and `mmrc-dyspnea` (the Bestall 1999 five-grade scale). Two are
Class B revisable-guideline thresholds and carry the rows below for the §6.3
cadence job (`scripts/check-citation-cadence.mjs`), which warns -- never blocks --
when an `accessed` date ages past the stated cadence. `gold-spirometry` cites the
GOLD report, which republishes annually; `predicted-spirometry` cites GLI-2012,
whose next edition is event-driven (on-publication). Neither citation matches the
gate-required issuer pattern, so the rows are maintenance-driven, not gate-forced.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| gold-spirometry | GOLD spirometric classification of COPD (FEV1/FVC < 0.70 + FEV1 %predicted grade cut-points) | GOLD 2024 Report | same | 2026-06-16 | current -- the 2024 Report is the latest; Class B, review annual (GOLD republishes each year). The < 0.70 fixed ratio and the 80/50/30 grade edges are stable across recent editions |
| predicted-spirometry | GLI-2012 spirometry reference equations (predicted FEV1/FVC/ratio + LLN) | GLI-2012 (Quanjer ERJ 40(6)) | same | 2026-06-16 | current -- GLI-2012 is the reference standard; Class B, review on-publication of the next GLI reference-equation update. The LMS model form is fixed (Class A) |

## spec-v92 nephrology (added 2026-06-16)

Wave 2 of the spec-v85 Advanced Clinical Calculators program adds five nephrology
computations. Four are Class A fixed instruments whose citations do not match the
check-citations issuer pattern and carry no row: `uacr-upcr` (the ratio math and
the albuminuria cutoffs, which reference the `ckd-staging` row below rather than
duplicating it), `ktv-urr` (the Daugirdas second-generation Kt/V and the URR
percentage), `mehran-cin` (the 2004 Mehran point weights and bands), and
`ckd-epi-cystatin` (the fixed 2021 CKD-EPI coefficients). One is a Class B
revisable-guideline threshold and carries the row below for the §6.3 cadence job
(`scripts/check-citation-cadence.mjs`), which warns -- never blocks -- when an
`accessed` date ages past the stated cadence. `ckd-staging` cites the KDIGO CKD
guideline; its citation also matches the gate-required issuer pattern (KDIGO), so
the row is gate-required. Cadence is on-publication: re-verify when the next KDIGO
CKD edition publishes.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| ckd-staging | KDIGO CKD G x A risk classification (GFR G1-G5 x albuminuria A1-A3 heat-map cells) | KDIGO 2024 CKD guideline (Kidney Int 105(4S)) | same | 2026-06-16 | current -- the 2024 edition is the latest; Class B, review on-publication of the next KDIGO CKD guideline. The G/A category cut-points are stable across the 2012 and 2024 editions |

## spec-v98 pediatrics (added 2026-06-17)

Wave 2 of the spec-v85 Advanced Clinical Calculators program adds four pediatric
decision rules. Three are Class A fixed instruments whose citations do not match
the check-citations issuer pattern and carry no row: `kocher-criteria` (the Kocher
1999 four-predictor probabilities), `pim3` (the Straney 2013 logistic
coefficients), and `catch-head` (the CATCH high/medium-risk factor lists). One is
Class B and carries the row below for the §6.3 cadence job
(`scripts/check-citation-cadence.mjs`), which warns -- never blocks -- when an
`accessed` date ages past the stated cadence. `kawasaki-criteria` cites the AHA
scientific statement; cadence is on-publication: re-verify when the next AHA
Kawasaki statement publishes.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| kawasaki-criteria | Kawasaki disease diagnostic criteria (classic + incomplete-Kawasaki algorithm) | AHA scientific statement (McCrindle 2017, Circulation 135(17)) | same | 2026-06-17 | current -- the 2017 AHA statement is the latest; Class B, review on-publication of the next AHA Kawasaki statement. The classic 5-feature criteria and the incomplete-KD algorithm branches are stable |

## spec-v99 ID, critical-care & burns (added 2026-06-17)

Final feature spec of Wave 2 of the spec-v85 Advanced Clinical Calculators
program. Three are Class A fixed instruments whose citations do not match the
check-citations issuer pattern and carry no row: `pitt-bacteremia` (the Paterson
2004 point form), `saps-ii` (the Le Gall 1993 band table and logistic constants),
and `lund-browder` (the 1944 age-adjusted region table). Two are Class B and carry
the rows below for the §6.3 cadence job. `duke-endocarditis` cites the 2023
Duke-ISCVID criteria; `refeeding-risk` cites NICE CG32, whose citation also matches
the gate-required issuer pattern (NICE), so that row is gate-required. Both cadences
are on-publication.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| duke-endocarditis | Modified Duke criteria for infective endocarditis (definite/possible/rejected thresholds) | 2023 Duke-ISCVID (Fowler 2023, Clin Infect Dis 77(4)) | same | 2026-06-17 | current -- the 2023 Duke-ISCVID revision is the latest; Class B, review on-publication of the next Duke-ISCVID update. The major/minor counting thresholds are stable |
| refeeding-risk | NICE refeeding-syndrome risk stratification (major/minor criteria) | NICE CG32 (2006, updated 2017) | same | 2026-06-17 | current -- CG32 with the 2017 update is the latest; Class B, review on-publication of the next NICE nutrition-support update. The BMI / weight-loss / intake / electrolyte criteria are stable |

## spec-v101 AF stroke-risk & QT-prolongation (added 2026-06-18)

First feature spec of Wave 1 of the spec-v100 MDCalc Parity Completion program.
Three are Class A fixed instruments whose citations name the journal and authors
(not a society) and do not match the check-citations issuer pattern, so they carry
no row: `chads2` (the Gage 2001 point weights and NRAF stroke-rate table),
`atria-stroke` (the Singer 2013 dual age-column point table), and `tisdale-qtc`
(the Tisdale 2013 risk-factor weights). Two are Class B and carry the rows below
for the §6.3 cadence job (`scripts/check-citation-cadence.mjs`). `cha2ds2-va` cites
the 2024 ESC AF guideline, whose citation also matches the gate-required issuer
pattern (ESC), so that row is gate-required; `chads-65` cites the 2020 CCS/CHRS AF
guideline. Both cadences are on-publication.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| cha2ds2-va | CHA2DS2-VA atrial-fibrillation stroke-risk score (sex point removed) | 2024 ESC AF guideline (Van Gelder 2024, Eur Heart J 45(36)) | same | 2026-06-18 | current -- the 2024 ESC AF guideline is the latest; Class B, review on-publication of the next ESC AF guideline. The component weights and the score >= 2 anticoagulation framing are stable |
| chads-65 | CHADS-65 Canadian anticoagulation pathway (sequential age-65 gate) | 2020 CCS/CHRS AF guideline (Andrade 2020, Can J Cardiol 36(12)) | same | 2026-06-18 | current -- the 2020 CCS comprehensive AF guideline is the latest; Class B, review on-publication of the next CCS AF guideline update. The age-65 and CHADS2-factor gate sequence is stable |

## spec-v102 heart failure & cardiogenic shock (added 2026-06-18)

First Wave-1 HF feature spec of the spec-v100 MDCalc Parity Completion program.
Three are Class A fixed instruments whose citations name the journal and authors
(not a society) and do not match the check-citations issuer pattern, so they carry
no row: `maggic` (the Pocock 2013 integer-point tables and 0-50 mortality lookup),
`h2fpef` (the Reddy 2018 six-item point model), and `cardshock-score` (the Harjola
2015 nine-point model and band mortality rates). One is Class B and carries the row
below for the §6.3 cadence job: `hfa-peff` cites the 2019 ESC Heart Failure
Association HFA-PEFF algorithm, whose citation also matches the gate-required issuer
pattern (ESC). Cadence is on-publication. (The fifth proposed tile, `gwtg-hf`, is
DEFERRED -- its per-band point table could not be verified from a primary source;
see docs/spec-v102.md -- so it carries neither a tile nor a row yet.)

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| hfa-peff | HFA-PEFF diagnostic score for HFpEF (functional / morphological / biomarker domains) | 2019 ESC HFA algorithm (Pieske 2019, Eur Heart J 40(40)) | same | 2026-06-18 | current -- the 2019 HFA-PEFF consensus is the latest; Class B, review on-publication of the next ESC Heart Failure Association HFpEF-diagnosis update. The domain criteria and the 5/2-4/1 verdict thresholds are stable |

## spec-v103 CV risk & prevention engines (added 2026-06-18)

First Wave-1 cardiovascular-risk feature spec of the spec-v100 MDCalc Parity
Completion program. Four are Class A fixed-coefficient / fixed-identity
instruments whose citations name the journal and authors (not a society) and do
not match the check-citations issuer pattern, so they carry no row: `mesa-chd`
(the McClelland 2015 penalized-Cox betas and baseline survivals), `framingham-cvd`
(the D'Agostino 2008 sex-specific Cox coefficients + vascular-age reference
profile), `reynolds-risk` (the Ridker 2007/2008 women's and men's coefficients),
and `non-hdl-remnant` (the Varbo 2013 arithmetic identity). Two are Class B and
carry the rows below for the §6.3 cadence job: `score2` and `score2-op` cite the
2021 ESC SCORE2 / SCORE2-OP algorithms, whose region calibration tables are
recalibrated on a calendar and whose citations match the gate-required issuer
pattern (ESC). Cadence is on-publication (region recalibration).

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| score2 | SCORE2 10-year cardiovascular-risk algorithm (age 40-69, four European risk regions) | 2021 ESC SCORE2 (SCORE2 working group, Eur Heart J 42(25):2439) | same | 2026-06-18 | current -- the 2021 ESC SCORE2 algorithm is the latest; Class B, review on-publication of the next ESC region recalibration. The sex-specific betas, baseline survivals, and per-region scale1/scale2 pairs are the published values |
| score2-op | SCORE2-OP 10-year cardiovascular-risk algorithm (age >= 70, four European risk regions) | 2021 ESC SCORE2-OP (SCORE2-OP working group, Eur Heart J 42(25):2455) | same | 2026-06-18 | current -- the 2021 ESC SCORE2-OP algorithm is the latest; Class B, review on-publication of the next ESC region recalibration. The sex-specific betas, baseline survivals/means, and per-region scale1/scale2 pairs are the published values |

## spec-v105 vascular & cardiac-surgery instruments (added 2026-06-18)

Closing Wave-1 feature spec of the spec-v100 MDCalc Parity Completion program.
Two of the four tiles are Class A fixed-coefficient instruments whose citations
name the journal and authors (not a society) and do not match the check-citations
issuer pattern, so they carry no row: `abi` (the Aboyans 2012 ratio + fixed PAD
bands) and `euroscore2` (the Nashef 2012 EJCTS Table 6 multivariate logistic
coefficients). The two below are Class B reporting/classification standards from
the Society for Vascular Surgery; neither citation matches the issuer acronym set,
so the rows are documentation only, but both are cadence-tracked (on-publication)
for the §6.3 job. They record that the edition in force was reviewed and
deliberately retained, not missed.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| rutherford-fontaine | Rutherford category / Fontaine stage PAD classification | Rutherford 1997 revised reporting standards (J Vasc Surg 26(3):517-538) | same | 2026-06-18 | current -- the 1997 revised reporting standards are the canonical Rutherford/Fontaine mapping; Class B, review on-publication of the next SVS reporting-standards revision. The category 0-6 and stage I-IV definitions are stable (documentation only -- does not match the issuer pattern) |
| wifi | SVS WIfI lower-extremity threatened-limb classification (Wound / Ischemia / foot Infection) | Mills 2014 expert-panel amputation-risk table (J Vasc Surg 59(1):220-234) | same | 2026-06-18 | current -- the 2014 Mills WIfI consensus is the latest; Class B, review on-publication of the next SVS WIfI update. The 64-cell amputation-risk stage grid is the published expert-panel table (documentation only -- does not match the issuer pattern) |

## spec-v109 trauma-classification & soft-tissue-infection instruments (added 2026-06-18)

Fourth Wave-2 feature spec of the spec-v100 MDCalc Parity Completion program.
Three of the five tiles are Class A fixed-criteria instruments whose citations
name the journal and authors and do not match the check-citations issuer pattern,
so they carry no row: `mangled-extremity` (the Johansen 1990 MESS point set),
`lrinec` (the Wong 2004 6-lab bands), and `alt-70` (the Raff 2017 4-item score).
The two below are Class B classification standards. Neither citation matches the
issuer acronym set (J Trauma Acute Care Surg, named authors / the AAST committee),
so the rows are documentation only, but both are cadence-tracked (on-publication)
for the §6.3 job. They record that the edition in force was reviewed and
deliberately retained, not missed.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| denver-bcvi | Expanded Denver Criteria for blunt-cerebrovascular-injury (BCVI) CT-angiography screening | Burlew 2012 expanded screening criteria (J Trauma Acute Care Surg 72(2):330-337) | same | 2026-06-18 | current -- the 2012 Burlew expanded Denver criteria are the canonical BCVI screening set; Class B, review on-publication of the next EAST/society screening-criteria revision. The six signs/symptoms and six high-energy-mechanism risk factors are the published items (documentation only -- does not match the issuer pattern) |
| aast-organ-injury | AAST solid-organ injury scale (spleen / liver / kidney), 2018 revision | Kozar 2018 OIS update (J Trauma Acute Care Surg 85(6):1119-1122) | same | 2026-06-18 | current -- the 2018 AAST update is the latest spleen/liver/kidney OIS; Class B, review on-publication of the next AAST revision. The grade I-V thresholds and the 2018 contained-vs-extending vascular rule are the published Tables 1-3 values (documentation only -- does not match the issuer pattern) |

## spec-v110 toxicology dosing & dialysis-decision tools (added 2026-06-18)

Fifth Wave-2 feature spec of the spec-v100 MDCalc Parity Completion program.
Four of the five tiles are Class A fixed-formula dosing instruments whose
citations name the journal and authors and do not match the check-citations
issuer pattern, so they carry no row: `digifab-dosing` (the Smith 1982 /
product-label body-burden vial formulas), `nac-dosing` (the Prescott 1979 /
Bateman 2014 weight-based bag doses), `hiet-dosing` (the Engebretsen 2011
bolus + infusion), and `tca-bicarbonate` (the Boehnert 1985 QRS thresholds and
the 1-2 mEq/kg bicarbonate target). The tile below is Class B: the EXTRIP
workgroup recommendations are revisable, so the row records the edition in force
and an on-publication review cadence for the check-citation-cadence warn-job.
The citation names the journal and authors and does not match the issuer
acronym set, so the row is documentation only, not gate-forced.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| lithium-extrip | Lithium extracorporeal-treatment (ECTR / dialysis) decision tree | Decker 2015 EXTRIP workgroup recommendations (Clin J Am Soc Nephrol 10(5):875-887) | same | 2026-06-18 | current -- the 2015 EXTRIP lithium recommendations are the latest workgroup consensus; Class B, review on-publication of the next EXTRIP update. The recommended / suggested decision limbs (life-threatening features, renal impairment with level above 4.0, level above 5.0, confusion, slow clearance) are the published recommendations (documentation only -- does not match the issuer pattern) |
| szpilman-drowning | Szpilman drowning severity classification (grades 1-6 plus rescue / dead) | Szpilman 1997 classification (Chest 112(3):660-665, from 1,831 cases) | same | 2026-06-19 | current -- the 1997 Szpilman classification remains the reference drowning-severity grading; Class B, review on-publication of the next revision. The grade decision limbs (cough, auscultation, pulmonary edema, hypotension, respiratory / cardiac arrest) and the original-series mortality are the published classification (documentation only -- does not match the issuer pattern) |

## spec-v114 COPD/bronchiectasis exacerbation & sleep (added 2026-06-19)

Third feature spec of Wave 3 of the spec-v100 MDCalc Parity Completion program.
Five of the six tiles are Class A fixed-point-weight instruments whose citations
name the journal and authors (not a society) and do not match the check-citations
issuer pattern, so they carry no row: `decaf-score` (the Steer 2012 five-item
table and band mortality), `bap-65` (the Tabak 2009 class-from-count structure
and per-class outcomes), `bronchiectasis-bsi` (the Chalmers 2014 nine-item
weighted table), `faced-bronchiectasis` (the Martinez-Garcia 2014 five-item
score), and `nosas-score` (the Marti-Soler 2016 point table). The tile below is
Class B: the AASM apnea-hypopnea severity criteria are revisable, so the row
records the edition in force and an on-publication review cadence for the
check-citation-cadence warn-job. The citation names the society and the journal
but does not match the issuer acronym set (AASM is not in the pattern), so the
row is documentation only, not gate-forced.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| ahi-odi-severity | AASM apnea-hypopnea-index obstructive-sleep-apnea severity bands (normal/mild/moderate/severe) + 3%-vs-4% ODI desaturation criterion | 1999 AASM Task Force "Chicago Criteria" (Sleep 22(5):667-689); AASM scoring-manual v2.0 (2012) recommended-hypopnea revision | same | 2026-06-19 | current -- the 1999 AASM severity bands remain the reference OSA classification and the 2012 v2.0 manual's 3%-or-arousal recommended hypopnea rule (vs the 4% CMS-acceptable rule) is the latest scoring revision; Class B, review on-publication of the next AASM scoring-manual update. The < 5 / 5-15 / 15-30 / >= 30 events-per-hour cut-points are stable (documentation only -- does not match the issuer pattern) |
| fleischner-2017 | Fleischner Society follow-up matrix for incidental pulmonary nodules (solid / part-solid / ground-glass x size x single-or-multiple x risk) | 2017 Fleischner Society guidelines (MacMahon H, et al, Radiology 284(1):228-243) | same | 2026-06-19 | current -- the 2017 edition is the in-force Fleischner Society guidance for incidental nodules; Class B, review on-publication of the next Fleischner Society update. The citation names the society and the journal but does not match the issuer acronym set (Fleischner is not in the pattern), so the row is documentation only, not gate-forced |
| aspects | Alberta Stroke Program Early CT Score: 10 MCA-territory regions (caudate, lentiform, internal capsule, insula, M1-M6), one point subtracted per region with early ischemic change, dichotomized at <= 7 | Barber PA, et al, Lancet 2000;355(9216):1670-1674 (the 10-region topographic convention) | same | 2026-06-19 | current -- the 10-region ASPECTS read remains the reference topographic CT score for hyperacute MCA-territory ischemia; the reperfusion-eligibility threshold applied to the score is set by evolving reperfusion guidelines, not by the score itself, so the tile reports the score and its source dichotomy only. Class B, review on-publication of the next reperfusion-guideline revision. The citation names the journal and authors but does not match the issuer acronym set, so the row is documentation only, not gate-forced |

## spec-v119 prehospital LVO triage & cerebrovascular diagnosis (added 2026-06-19)

`cpsss`, `fast-ed`, and `cvt-risk` are Class A (fixed point weights; each citation
names the journal and authors, not an issuing society, so none matches the issuer
pattern) and carry no row. `boston-caa` (the Boston Criteria version 2.0 for
cerebral amyloid angiopathy) is Class B -- a revisable consensus diagnostic
definition -- so it records the version in force (v2.0, 2022), the accessed date,
and an on-publication review cadence for the check-citation-cadence warn-job. The
citation names the journal but does not match the issuer acronym set (Boston is
not in the pattern), so the row is documentation only, not gate-forced.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| boston-caa | Boston Criteria for cerebral amyloid angiopathy diagnostic certainty (definite / probable-with-pathology / probable / possible), with the v2.0 non-hemorrhagic white-matter features (centrum-semiovale enlarged perivascular spaces, white-matter-hyperintensity multispot) | version 2.0 (Charidimou A, et al, Lancet Neurol 2022;21(8):714-725) | same | 2026-06-19 | current -- version 2.0 is the in-force Boston criteria edition and the first to add the non-hemorrhagic white-matter features; Class B, review on-publication of the next Boston-criteria revision. The citation names the journal and authors but does not match the issuer acronym set, so the row is documentation only, not gate-forced |

## spec-v126 GI disease activity & pancreatitis severity (added 2026-06-20)

The five activity/severity instruments (cdai-crohns, uceis, ses-cd, haps,
ctsi-balthazar) are Class A fixed published weights/scales and are documentation
only via their own audit logs (their citations name journals + authors, not an
issuer acronym). The one Class B tile is `modified-marshall`: the Revised Atlanta
organ-failure definition is a revisable international-consensus standard, so it
records the version in force (2012 Revised Atlanta), the accessed date, and an
on-publication review cadence for the check-citation-cadence warn-job. The citation
names the working group and journal but does not match the issuer acronym set
(Atlanta Working Group is not in the pattern), so the row is documentation only, not
gate-forced.

| tile id | instrument | edition shipped | latest known edition | accessed | justification if behind |
|---|---|---|---|---|---|
| modified-marshall | Modified Marshall organ-dysfunction score (respiratory / renal / cardiovascular, each 0-4; organ failure at >= 2) used in the Revised Atlanta acute-pancreatitis severity classification | 2012 Revised Atlanta (Banks PA, et al, Gut 2013;62(1):102-111) | same | 2026-06-20 | current -- the 2012 Revised Atlanta classification is the in-force definition of organ failure in acute pancreatitis; Class B, review on-publication of the next Atlanta-classification revision. The per-organ thresholds (PaO2/FiO2, creatinine, SBP/fluid/pH) are stable; the citation names the working group and journal but does not match the issuer acronym set, so the row is documentation only, not gate-forced |
