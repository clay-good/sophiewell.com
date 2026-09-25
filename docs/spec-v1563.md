# spec-v1563 — Protozoal and arboviral NTDs: sleeping sickness, leishmaniasis, Chagas, dengue fluids, and arbovirus case definitions

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Nine tiles. The catalog has `who-dengue-2009` (severity classification only, no fluid volumes) and
`rassi-chagas` (prognosis).

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| HAT24 | WHO. *Guidelines for the treatment of human African trypanosomiasis.* 2024 | CC BY-NC-SA 3.0 IGO |
| VL26 | WHO. *WHO guidelines on leishmaniases: treatment of visceral leishmaniasis and PKDL in eastern Africa and South-East Asia.* Issued July 27, 2026 | CC BY-NC-SA 3.0 IGO |
| TRS949 | WHO. *Control of the leishmaniases.* Technical Report Series 949, 2010 (case definitions, Annex 3) | CC BY-NC-SA 3.0 IGO |
| CL22 | PAHO. *Guideline for the treatment of leishmaniasis in the Americas*, 2nd ed. 2022 | CC BY-NC-SA 3.0 IGO |
| SBC23 | Marin-Neto JA, Rassi A Jr et al. SBC guideline on Chagas cardiomyopathy, 2023. *Arq Bras Cardiol* 2023;120(6):e20230269 | CC BY |
| PAHO19 | PAHO. *Guidelines for the diagnosis and treatment of Chagas disease.* 2019 | All rights reserved (facts only) |
| DENG12 | WHO. *Handbook for clinical management of dengue.* 2012 | © WHO 2012 (facts only) |
| ARBO25 | WHO. *WHO guidelines for clinical management of arboviral diseases: dengue, chikungunya, Zika and yellow fever.* July 3, 2025 | CC BY-NC-SA 3.0 IGO |
| CHIK15, ZIKA16, YF10 | WHO case definitions: *Wkly Epidemiol Rec* 2015;90:410–414; WHO/ZIKV/SUR/16.1; *Wkly Epidemiol Rec* 2010;85:465–472 | WHO copyright; Zika 2016 all rights reserved |

---

## 1. `hat-treatment` — Sleeping Sickness (HAT): Stage and Which Drug (WHO 2024)

**Inputs.** Form: gambiense / rhodesiense (required); age (years); weight (kg); CSF white cells per µL
(optional); trypanosomes in CSF; signs suggesting severe disease: confusion, abnormal behavior,
excessive talking, anxiety, poor coordination, tremor, weakness, speech problems, abnormal gait or
movements, seizures (sleep disturbance alone does not count); reliable follow-up; pregnancy trimester;
able to eat and swallow.

**Logic (HAT24 summary, §2.1.2, Table 2).** **First stage:** CSF 5 cells/µL or fewer and no
trypanosomes. **Second stage:** more than 5, or trypanosomes. **Severe second stage: 100 or more.**

- **Gambiense, 6 years or more and 20 kg or more:** low suspicion of severe disease with reliable
  follow-up → **fexinidazole without a lumbar puncture**. Otherwise puncture: fexinidazole for first
  stage or second stage under 100 cells; **NECT at 100 or more**; puncture needed but not possible or
  unreliable → NECT.
- **Gambiense, under 6 years or under 20 kg:** pentamidine (first stage), NECT (second).
- **Rhodesiense, 6 years or more and 20 kg or more:** fexinidazole over suramin (first stage) and over
  melarsoprol (second stage, unless unable to swallow, contraindicated, or persistent vomiting). Under 6
  or under 20 kg: suramin (first), melarsoprol (second); pentamidine as interim if drugs are delayed.
- **Pregnancy:** fexinidazole after the first trimester.
- **Fexinidazole, 600 mg tablets with a meal, once daily for 10 days:** 35 kg or more, 3 tablets on days
  1–4 then 2 on days 5–10; 20–34 kg, 2 then 1.
- **NECT:** nifurtimox 15 mg/kg/day in 3 doses for 10 days plus eflornithine 400 mg/kg/day in 2
  infusions for 14 days.
- **Admit if:** psychiatric disorder, a child under 35 kg, 100 or more cells treated with fexinidazole,
  or a risk of poor adherence.

**Output.** Stage, drug, and dose. **Edition flag:** acoziborole (one oral dose, gambiense, 12 years or
more and 40 kg or more) received a positive European opinion on February 27, 2026 but is not in HAT24;
the tile prints "as of WHO 2024" and a *high* staleness row watches for the revision.

## 2. `visceral-leishmaniasis-2026` — Kala-Azar and PKDL Treatment by Region (WHO 2026)

**Inputs.** Region: eastern Africa / South-East Asia (required); indication: primary VL / relapse /
PKDL (required); age (years); weight (kg); pregnant or breastfeeding; able to become pregnant and
using contraception; HIV (the tile refuses and says WHO's 2022 HIV coinfection guideline applies, not
read).

**Case definitions (TRS949 Annex 3).** Clinical: long irregular fever, a big spleen, weight loss; in
malaria areas, suspect when fever over 2 weeks has not responded to antimalarials. A case = those signs
plus a positive rK39, DAT, IFAT or ELISA, or parasites seen. PKDL probable: from an endemic area with
many pale macules, papules, plaques or nodules without loss of feeling; confirmed with a positive smear,
biopsy or PCR.

**Eastern Africa, primary VL (VL26).** Rec 1.1: **paromomycin 20 mg/kg (15 mg/kg base) IM daily plus
miltefosine twice daily, both 14 days** (preferred). Rec 1.2: sodium stibogluconate 20 mg/kg/day plus
paromomycin 15 mg/kg (11 base)/day for 17 days when miltefosine is excluded; SSG alone for 30 days as the
fallback. Rec 1.3: liposomal amphotericin B 3–5 mg/kg a dose over 6–10 days to a total of 30 mg/kg.
Miltefosine exclusions: under 4 or over 50 years, pregnancy or breastfeeding, and women able to become
pregnant without contraception for 2 months after (5 months after regimens of 28 days or more).

**South-East Asia, relapse.** Do not repeat single-dose liposomal amphotericin 10 mg/kg if that was the
first course. Options: miltefosine plus paromomycin 10 days; liposomal amphotericin 5 mg/kg once plus
miltefosine 7 days; liposomal amphotericin 5 mg/kg plus paromomycin 10 days; otherwise 15–20 mg/kg total
in 3–4 doses.

**PKDL.** Eastern Africa: paromomycin 20 mg/kg for 14 days plus miltefosine for 42 days (preferred over
liposomal amphotericin 5 mg/kg on days 1, 3, 5, 7 plus miltefosine for 28 days). PKDL grade (Table 4):
I scattered rash on the face, perhaps upper chest or arms; II dense rash over most of the face, reaching
chest, back, upper arms and legs; III dense rash over most of the body including hands and feet.
South-East Asia PKDL regimens (recs 4.4.1–4.4.3) were read in the summary only and are printed after a
full read at build time.

**Miltefosine daily dose by weight (VL26 Annex 2):** under 6 kg 20 mg; 6–9.99 kg 30; 10–14.99 50;
15–19.99 60; 20–24.99 70; 25–29.99 80; 30–44.99 100; 45 or more 150 mg. The recommendation says twice
daily; **that the table's daily dose is split in two is inferred** and confirmed from Annex 2's
footnotes before build.

## 3. `cutaneous-leishmaniasis-americas` — Cutaneous Leishmaniasis in the Americas: Local or Systemic Treatment? (PAHO 2022)

**Inputs.** Number of lesions; largest lesion area (mm²) and largest diameter (cm); on the head or near a
joint; immune suppression; follow-up possible; local treatment failed or relapsed; species if known;
pregnancy, breastfeeding, heart disease or abnormal ECG; weight (kg).

**Logic (CL22 Tables 2, 3, 8).** **Local treatment** when all of: 1–3 lesions; each 900 mm² or less
**and** largest diameter 3 cm or less; not on the head or near a joint; not immune suppressed; follow-up
possible. Otherwise **systemic**. Local options: intralesional pentavalent antimony (3–5 infiltrations of
1–5 mL per lesion every 3–7 days, at most 15 mL a day), heat therapy (50 °C for 30 seconds), or 15%
paromomycin cream daily for 20 days. Systemic: miltefosine 2.5 mg/kg/day (maximum 150 mg/day) for 28
days; pentamidine 4–7 mg/kg a dose, 3 doses 72 hours apart; pentavalent antimony 20 mg Sb/kg/day for 20
days.

**Traps.** 900 mm² and 3 cm are **two separate tests** (a round lesion 3 cm across is about 707 mm²);
both apply. CL22 prints the antimony cap as "1,215 mg Sb/kg/day or 3 ampoules"; the "/kg" is almost
certainly a misprint, and the tile caps at **1,215 mg Sb a day** (3 × 405 mg ampoules) with the misprint
noted. Species rules differ (for example, miltefosine is not listed for L. amazonensis).

## 4. `chagas-stage-treatment` — Chagas Disease: Stage, Whether to Treat, and Benznidazole or Nifurtimox Dose

**Inputs.** Positive T. cruzi serology; phase: acute / congenital / chronic (required); ECG abnormal;
LVEF (%); heart failure symptoms now or before; heart failure at rest despite treatment; digestive form;
age; weight (kg); pregnant.

**Stages (SBC23 Table 5.2).** A (indeterminate): normal ECG and imaging, LVEF 55% or more. B1: abnormal
ECG, LVEF 55% or more, no heart failure. B2: LVEF below 55%, no heart failure. C: LV dysfunction with
current or past heart failure symptoms. D: heart failure at rest despite optimized treatment.

**Treat? (SBC23; PAHO19 recs 5–10).** Acute or congenital, any age: benznidazole first, nifurtimox
second. 18 or younger: benznidazole first, nifurtimox second. Adults under 50, indeterminate or
digestive: benznidazole (SBC: not nifurtimox; PAHO: either). 50 or older: shared decision. Stage B1:
benznidazole. Advanced heart or digestive disease: do not treat. PAHO: treat children and women who may
become pregnant (strong); suggest treating adults without organ damage.

**Doses (PAHO19 Annex 10), daily, in 2–3 doses, 60 days:** acute, 40 kg or less, benznidazole 7.5–10
mg/kg or nifurtimox 10–15; acute over 40 kg, benznidazole 5–7 or nifurtimox 8–10; congenital,
benznidazole 10 or nifurtimox 10–15; recent chronic, 40 kg or less, benznidazole 7.5; over 40 kg, 5.

**Traps.** PAHO and SBC disagree on nifurtimox in adults; both shown, labelled. PAHO gives no daily
maximum; the common 300 mg benznidazole cap was not read in these sources and is not added. The
sources' pregnancy guidance was not read, so a pregnant patient gets the stage and no dose until it is.
Links `rassi-chagas`.

## 5. `dengue-fluid-plan` — Dengue IV Fluids: The Rate Ladder by Group and Weight (WHO)

**Question.** For this dengue patient's group and weight, what are the mL per hour at each step?

**Inputs.** Weight (kg; ideal body weight if obese, required); group: warning signs / compensated shock /
hypotensive shock (required, from `who-dengue-2009`); adult or child (required); step reached.

**Logic (DENG12 §2.2.3, pp. 27–29).**

- **Warning signs (all ages):** 5–7 mL/kg/h for 1–2 h, then 3–5 for 2–4 h, then 2–3 or less. If the
  hematocrit rises and vital signs worsen, 5–10 mL/kg/h for 1–2 h. Aim for urine about 0.5 mL/kg/h.
- **Compensated shock.** Adult: 5–10 mL/kg/h over 1 h, then 5–7 for 1–2 h, then 3–5 for 2–4 h, then
  2–3 for up to 24–48 h. Child: 10–20 mL/kg/h over 1 h, then 10 for 1–2 h, then 7 for 2 h, then 5 for 4
  h, then 3. Shock persisting with a high hematocrit: a second bolus.
- **Hypotensive shock:** 20 mL/kg over 15–30 minutes, then adult 10 mL/kg/h for 1 h, then 5–7, 3–5, 2–3;
  child colloid 10 for 1 h, crystalloid 10 for 1 h, then 7.5 for 2 h, 5 for 4 h, 3.
- **Stop IV fluids by 48 hours.**
- **ARBO25 additions (it does not replace the volumes):** crystalloids over colloids; use capillary
  refill and lactate to guide fluids; passive leg raise; no preventive platelets for counts below
  50,000/µL.

**Output.** A ladder of mL/h at each step for the weight, with the reassessment before each step. It is
presented as a titration plan to be reassessed, not an order.

**Traps.** DENG12 is internally inconsistent (7.5 vs 7 mL/kg/h in the child steps; one colloid bolus
missing "/kg"); each is encoded as printed in its own section and noted. `who-dengue-2009` gains a link.

## 6. `arbovirus-admission-check` — Dengue, Chikungunya, Zika or Yellow Fever: Signs That May Prompt Admission (WHO 2025)

**Inputs (three-state each).** Dengue warning signs as ARBO25 defines them: abdominal pain that is
continuous or intense; drowsiness, irritability or lethargy; mucosal bleeding; liver more than 2 cm below
the ribs; persistent vomiting (3 in 1 hour or 4 in 6); hematocrit rising on 2 measurements in a row.
Also: severe dengue criteria; unable to drink; breathing difficulty; narrowing pulse pressure; low blood
pressure; kidney failure; slow capillary refill; pregnancy; clotting problems; extreme age or a high-risk
condition.

**Logic (ARBO25 §2.7).** Any present → "signs that may prompt admission are present". ARBO25 says these
"might encourage clinicians to hospitalize"; the output uses that wording, not "admit". Drug lines: no
NSAIDs (strong); paracetamol for adults over 50 kg 500 mg–1 g every 4–6 hours (maximum 4 g a day),
children 10–15 mg/kg every 4–6 hours (maximum 60 mg/kg a day); no corticosteroids.

**Trap.** ARBO25's warning-sign wording follows PAHO 2022 and differs from WHO 2009; the tile names the
2025 list.

## 7. `chikungunya-case-def` — Chikungunya Case Definition (WHO/PAHO)

**Logic (CHIK15).** **Suspected:** fever above 38.5 °C with sudden joint pain, and living in or visiting a
transmission area within 15 days. **Confirmed:** PCR, serology or culture. **Atypical:** confirmed plus
other organ involvement. **Severe acute:** confirmed with failure of at least one organ threatening life
and needing admission. **Suspected chronic:** a prior diagnosis with joint pain, stiffness or swelling
beyond 12 weeks; confirmed chronic with a positive test. In children under 3, joint pain may show as
inconsolable crying or refusing to move (help text).

## 8. `zika-case-def` — Zika Case Definition (WHO Interim 2016)

**Logic (ZIKA16).** **Suspected:** rash and/or fever with at least one of joint pain, arthritis, or
non-purulent conjunctivitis. **Probable:** suspected plus Zika IgM and an epidemiological link (contact
with a confirmed case, or living in or travel to a transmission area within 2 weeks). **Confirmed:** RNA
or antigen, or IgM plus PRNT90 titre 20 or more and 4 or more times the titre for other flaviviruses,
with other flaviviruses excluded. The answer notes the 2016 definition is labelled interim and that PAHO
issued 2022 definitions for the Americas (not read).

## 9. `yellow-fever-case-def` — Yellow Fever Case Definition (WHO 2010)

**Logic (YF10).** **Suspected:** acute fever with jaundice within 14 days of the first symptoms.
**Probable:** suspected plus one of: yellow fever IgM with no yellow fever vaccine in the prior 30 days;
positive liver histopathology after death; an epidemiological link. **Confirmed:** probable plus one of:
specific IgM, a 4-fold rise in IgM or IgG, or specific neutralizing antibodies, each with no vaccine in
the prior 30 days; or PCR, antigen, or isolation with no vaccine in the prior 14 days. **The 30-day and
14-day vaccine windows are separate** and each is a test.

**Pattern.** Tiles 7–9 follow `measles-case-def` and `pertussis-case-def`.

## Tests

`test/unit/protozoal-arboviral.test.js`: HAT staging at 5/6 and 99/100 cells, the age and weight gates,
fexinidazole bands at 19.9/20.0 and 34.9/35.0 kg; VL regimens by region and indication, miltefosine bands;
CL local eligibility with each criterion failing alone and the two size tests; Chagas stages and dose
rows at 40.0/40.1 kg; the dengue ladder at 20 kg and 60 kg; admission wording; each case definition level
and the two yellow fever windows.

## Staleness

HAT24 *high* (acoziborole pending). VL26 *moderate* (new). CL22, SBC23, PAHO19 *low*. DENG12 *low*;
ARBO25 *moderate*. Case definitions *low*.
