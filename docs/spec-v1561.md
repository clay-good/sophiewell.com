# spec-v1561 — Skin and eye NTDs: leprosy, Buruli ulcer, yaws, scabies, lymphedema, noma, and trachoma

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Ten tiles. The catalog has `ridley-jopling` (leprosy spectrum) and `isl-lymphedema` (cancer-related
lymphedema); nothing else for these diseases.

## Sources (read in full; graphics-only tables rendered and read visually)

| Key | Document | Licence |
|---|---|---|
| LEP18 | WHO SEARO. *Guidelines for the diagnosis, treatment and prevention of leprosy.* 2018. ISBN 978-92-9022-638-3 | CC BY-NC-SA 3.0 IGO |
| LEPOM16 | WHO. *Operational manual, Global Leprosy Strategy 2016–2020* | CC BY-NC-SA 3.0 IGO |
| LEP09 | WHO SEARO. *Enhanced global strategy … operational guidelines (updated).* SEA-GLP-2009.4 | © WHO, no CC licence |
| EHF99 | van Brakel WH et al. *Lepr Rev* 1999;70:180 (the eye-hand-foot score) | Journal (facts) |
| LEPR20 | WHO SEARO. *Leprosy/Hansen disease: management of reactions and prevention of disabilities.* 2020 | CC BY-NC-SA 3.0 IGO |
| BU12 | WHO. *Treatment of Mycobacterium ulcerans disease (Buruli ulcer): guidance for health workers.* 2012 | © WHO, no CC licence |
| BUHIV20 | WHO. *Management of Buruli ulcer–HIV coinfection: technical update.* 2020 | CC BY-NC-SA 3.0 IGO |
| YAWS21 | WHO. *Eradication of yaws: surveillance, monitoring and evaluation manual.* 2021; and *a guide for programme managers*, 2018 | CC BY-NC-SA 3.0 IGO |
| SCAB25 | WHO. *Control of scabies: a guide for national programme managers.* 2025 | CC BY-NC-SA 3.0 IGO |
| DREY01 | Dreyer G et al. *Lymphoedema staff manual.* WHO/CDS/CPE/CEE/2001.26a | All rights reserved |
| NOMA17 | WHO AFRO. *Information brochure for early detection and management of noma.* 2016/2017; WHO *Noma control: technical brief*, 2026 | CC BY-NC-SA 3.0 IGO |
| TRA20 | Solomon AW et al. The simplified trachoma grading system, amended. *Bull World Health Organ* 2020;98:698–705 | CC BY 3.0 IGO |

---

## 1. `leprosy-classify-mdt` — Leprosy: Paucibacillary or Multibacillary, and the MDT Regimen (WHO 2018)

**Inputs.** Number of skin lesions (0–100, required); nerve involvement (three-state, required); skin
smear (positive / negative / not done); age (years, required); weight (kg; required under 10 years or
under 40 kg).

**Logic (LEP18 pp. 1–2, Table 3).** A case needs one of three cardinal signs: loss of feeling in a
pale or reddish patch; a thickened nerve with loss of feeling or weakness; bacilli on a smear.
**Paucibacillary (PB):** 1–5 lesions with no bacilli on a smear. **Multibacillary (MB):** more than 5
lesions, or nerve involvement, or a positive smear whatever the count. The 2018 guideline gives **the
same three drugs for PB and MB**; only the duration differs (**PB 6 months, MB 12 months**, 6 or 12
packs of 28 days):

| Group | Rifampicin | Clofazimine | Dapsone |
|---|---|---|---|
| Adult | 600 mg monthly | 300 mg monthly + 50 mg daily | 100 mg daily |
| Child 10–14 years | 450 mg monthly | 150 mg monthly + 50 mg every other day | 50 mg daily |
| Child under 10 or under 40 kg | 10 mg/kg monthly | 100 mg monthly + 50 mg twice a week | 2 mg/kg daily |

**Traps.** **Unassessed nerve involvement never defaults to PB**; the tile says "incomplete". The 2016
operational manual gives different child doses under 20 kg and a two-drug PB regimen (pre-2018); the
tile uses LEP18 and names the difference. `ridley-jopling` is linked (the spectrum, not the treatment
class).

## 2. `leprosy-pep-rifampicin` — Single-Dose Rifampicin for Leprosy Contacts (WHO 2018)

**Inputs.** Age (years), weight (kg), both required.

**Logic (LEP18 Table 5).** 15 years or more: 600 mg. 10–14 years: 450 mg. 6–9 years and 20 kg or
more: 300 mg. **Under 20 kg and 2 years or more: 10–15 mg/kg.** Under 2 years: not given. The rows
overlap by age and weight; **weight under 20 kg takes precedence**, stated on the answer. Screening for
leprosy and TB and excluding pregnancy come first (LEP18 text; printed as a checklist).

## 3. `leprosy-disability-grade` — WHO Leprosy Disability Grade and Eye-Hand-Foot (EHF) Score

**Inputs.** For each of 6 sites (left and right eye, hand, foot), three-state: hands and feet, loss of
feeling; visible damage (wounds, ulcers, claw hand, foot drop, tissue loss). Eyes, cannot close fully;
obvious redness; cannot count fingers at 6 m.

**Logic (LEP09 pp. 22–23; EHF99).** Per site: grade 0 no disability; **grade 1 loss of feeling in a
hand or foot (eyes have no grade 1 in this edition)**; grade 2 visible damage (for the eye: cannot
close, marked redness, or cannot count fingers at 6 m). **Patient grade = the highest site. EHF score
= the sum of the six sites (0–12).**

**Traps.** WHO's 1988 grading gave the eye a grade 1; 2009 removed it. The 2020 reactions record form
scores vision 0/1/2 differently. The answer names the 2009 edition. A site not assessed caps the
answer ("at least grade N").

## 4. `leprosy-reaction-prednisolone` — Prednisolone Schedule for a Type 1 Leprosy Reaction or Neuritis (WHO 2020)

**Inputs.** Weight (kg) or starting dose choice (40 mg / 30 mg); start date.

**Logic (LEPR20 Table 3, read from the rendered page).** Start at 0.5 mg/kg (range 0.5–1.0), usually 40
or 30 mg for adults:

| Weeks | 40 mg start | 30 mg start |
|---|---|---|
| 1–2 | 40 mg | 30 mg |
| 3–4 | 30 mg | 25 mg |
| 5–12 | 20 mg | 20 mg |
| 13–16 | 10 mg | 10 mg |
| 17–20 | 5 mg | 5 mg |

Adults starting steroids for neuritis: albendazole 400 mg twice daily for 3 days first.

**Output.** The 20-week calendar with dates. **Trap.** The table does not state the weight at which
40 replaces 30; the tile computes 0.5 mg/kg and offers the nearer track, or lets the user choose, and
says so. ENL has its own schedule, not tabulated; not built.

## 5. `buruli-ulcer-category` — Buruli Ulcer Category and 8-Week Antibiotic Doses (WHO)

**Inputs.** Number of lesions; largest diameter (cm); site at the eye, breast, genitals, or head and
face; bone or joint involvement (three-state each); weight (kg); pregnant; HIV and ART regimen.

**Logic (BU12 pp. 9–11).** **Category I:** a single lesion under 5 cm. **II:** a single lesion 5–15 cm.
**III:** a single lesion over 15 cm, multiple lesions, a critical site (eye, breast, genitals; head and
neck, particularly the face), or bone involvement. Treatment for all: **rifampicin 10 mg/kg once daily
plus clarithromycin 7.5 mg/kg twice daily, both for 8 weeks** (maximum rifampicin 600 mg/day,
clarithromycin 1,000 mg/day; BUHIV20). Adult alternative: rifampicin plus moxifloxacin 400 mg daily.
Streptomycin is the older option and is contraindicated in pregnancy.

**Output.** The category and mg per dose computed from weight. **BU12's weight-band table is not used**:
its clarithromycin column is labelled both "twice daily" and "daily dose", which disagree by 25% at 21
kg, and its bands skip 10–11 and 20–21 kg. Exactly 5 and 15 cm follow BU12's "under 5" and "5–15" and
are tests. Rifampicin interactions with efavirenz and other ART print for people with HIV.

## 6. `yaws-test-and-treat` — Yaws: Case Class, Reading the Test, and Azithromycin Dose (WHO)

**Inputs.** Lives or lived in an endemic area; yaws-like lesion; rapid test lines (control,
treponemal); DPP test lines (control, T, nT); PCR result; age (years) or weight (kg).

**Logic (YAWS21 pp. viii–x; 2018 guide pp. 3–9).** **Case classes:** suspected (endemic area and
clinical signs); treponemal-positive (plus a positive treponemal rapid test, TPHA or TPPA);
serologically confirmed (dual-positive DPP, or TPHA/TPPA plus RPR); PCR-confirmed. **DPP reading:**
control + T + nT = dual positive; control + T only = past infection; control only = non-reactive; **no
control, or control + nT without T = invalid, repeat.** Rapid test: control + T positive; control only
negative; no control invalid. **Azithromycin 30 mg/kg once by mouth, maximum 2 g**; by age with 500 mg
tablets: under 6 years 1 (crushed, or syrup), 6–9 years 2, 10–14 years 3, 15 years or more 4. Not under 6
months; allowed in pregnancy. Alternative benzathine benzylpenicillin 1.2 million units (adults), 600,000
(under 10). Cure: complete or partial healing within 4 weeks.

**Trap.** The "under 6 years, 1 tablet" band gives a 6-month-old far more than 30 mg/kg; with a weight,
the tile computes 30 mg/kg and shows the age band beside it. "nT only" is invalid, never "active".

## 7. `scabies-diagnosis-mda` — Scabies: Confirmed, Clinical or Suspected, and Ivermectin Mass Treatment (WHO 2025)

**Inputs.** Mites, eggs or feces on microscopy (A1); seen on a high-power imaging device (A2); mite on
dermoscopy (A3); burrows (B1); typical lesions on male genitals (B2); typical lesions in a typical
distribution; atypical lesions or distribution; itch (H1); a contact with itch (H2); other diagnoses
less likely; community prevalence (%); for dosing: weight (kg) or height (cm), age, pregnant, breastfeeding
within a week of birth, on warfarin.

**Logic (SCAB25 Box 1, Box 7, Annex 4).** **Confirmed (A):** any of A1–A3. **Clinical (B):** B1, or B2,
or typical lesions in a typical distribution with both history features. **Suspected (C):** typical
lesions with one history feature, or atypical lesions or distribution with both. B and C need other
diagnoses to be less likely. **Primary-care rule:** typical lesions in a typical distribution plus
itch or a contact; a contact counts as positive where prevalence is over 10%. **Program:** prevalence
over 10% → mass treatment (2–10% a local decision; stop below 2%; aim for 80% coverage, 3–5 yearly
rounds). **Ivermectin 200 µg/kg, rounded up to whole 3 mg tablets, two doses 7–14 days apart; by weight
or height, never by age.** Not below 15 kg or 90 cm, in pregnancy, breastfeeding within a week of birth,
illness, prior hypersensitivity, or with warfarin; permethrin instead.

**Output.** The diagnostic level and, for treatment, tablets per dose. **The Solomon Islands height stick
(90–112 cm 1, 113–138 cm 2, 139–156 cm 3, above 156 cm 4) is printed only as a labelled country example**:
SCAB25 says countries should set their own, and its adult body chart overlaps (75–95 kg vs above 90 kg).
**It is never merged with the 2006 mass-treatment ivermectin pole** in `pc-dose-pole` (spec-v1562).

## 8. `filarial-lymphedema-stage` — Lymphedema Stage in Lymphatic Filariasis (Dreyer, 7 Stages)

**Inputs.** Per limb (left and right staged separately, foot and leg together): swelling goes down
overnight; shallow skin folds; knobs; deep folds; mossy foot; cannot do daily activities without help;
an acute attack in the last 30 days.

**Logic (DREY01 pp. 13–18).** The highest stage present: 1 swelling reverses overnight; 2 does not
reverse; 3 shallow folds; 4 knobs; 5 deep folds; 6 mossy foot; 7 unable to manage daily activities
independently. **An acute attack in the last 30 days defers staging.** A crosswalk to WHO's three grades
(I pitting and reversible, II not reversible, III elephantiasis) prints beside it.

**Traps.** Limbs only, not genitals or breast. DREY01 itself says the staging "still needs to be
field-tested"; stated. Distinct from `isl-lymphedema`; linked.

## 9. `noma-stage` — Noma (Cancrum Oris) Stage and Urgency (WHO)

**Inputs.** Gums bleed on touch or are swollen and red; spontaneous gum bleeding with painful ulcerated
papillae and bad breath; facial swelling with fever; black necrotic area or cheek perforation; jaw
stiffness or exposed bone; established disfigurement (three-state each).

**Logic (NOMA17 pp. 8–15; 2026 brief p. 5).** 0 simple gingivitis (the warning sign); 1 necrotizing
gingivitis; 2 edema; 3 gangrene; 4 scarring; 5 sequelae. **Stages 0–2 are reversible; 3–5 are not.
Stage 2 or higher: emergency referral.** Stages 1–2 can reach 3 in about 2 weeks.

**Not built: antibiotic doses.** The brochure's "amoxicillin 100 mg/kg every 12 hours for 14 days"
(200 mg/kg a day) looks implausible and may be a per-day figure. Stage and "refer" only.

## 10. `trachoma-grade` — WHO Simplified Trachoma Grading (2020 Amended)

**Inputs.** Per eye: at least one upper-lid lash touching the eyeball, or recent removal of in-turned
upper-lid lashes; corneal opacity blurring part of the pupil margin; follicles 0.5 mm or more in the
central upper tarsus (count); inflammatory thickening obscuring more than half the deep tarsal vessels;
easily visible tarsal scarring.

**Logic (TRA20).** **TT:** an upper-lid lash touching the eye, or recent epilation (the 2020 amendment
excludes lower-lid-only trichiasis). **CO:** opacity blurring part of the pupil margin. **TF:** 5 or
more follicles. **TI:** thickening obscuring more than half the deep vessels. **TS:** visible scarring.
Signs are independent; an eye can have several.

**Output.** Each sign per eye; TT means referral for surgery. An optional program panel prints WHO's
elimination indicators (TT unknown to the health system below 0.2% in people 15 or older, and TF below
5% in children 1–9). **The number of mass azithromycin rounds per TF level is not built**: no current
WHO document stating it was read (the 2006 rules are superseded).

## Tests

`test/unit/skin-ntds.test.js`: PB/MB at 5 and 6 lesions and with nerve involvement unassessed; each
leprosy dose group; the rifampicin contact precedence at 19.9/20.0 kg; disability grade and EHF sums;
prednisolone calendar dates; Buruli at 4.9/5.0/15.0/15.1 cm and computed doses at 21 kg; every DPP line
combination; scabies levels A, B, C; ivermectin tablets at 15 kg and the 90 cm floor; each lymphedema
stage and the 30-day deferral; each noma stage; each trachoma sign.

## Staleness

LEP18, LEPR20 *low*. BU12 *moderate* (a 2025 WHO progress report not read). SCAB25 *moderate* (new).
TRA20 *low*.
