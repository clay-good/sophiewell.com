# spec-v1560 — Epidemic-prone disease: cholera, diphtheria, meningitis, typhoid, and scrub typhus

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Five tiles. Leptospirosis (modified Faine's) is blocked until its primary is read (spec-v1564).

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| GTFCC-A | GTFCC. *Evaluating dehydration and admission criteria* job aid, July 12, 2024; Plan A, B, C job aids; *Cholera fluids quick reference chart* | No licence line (facts only) |
| GTFCC-F | GTFCC. *Cholera patient treatment flowchart* v1.0, September 9, 2024 | No licence line |
| GTFCC-AB | GTFCC. *Interim technical note: use of antibiotics for the treatment and control of cholera*, revised October 2022 (Table 1) | No licence line |
| GTFCC-P | GTFCC. *Interim technical note: treatment of cholera in pregnant women*, November 21, 2022 | No licence line |
| GTFCC-S | GTFCC. *Job aid: treatment of children with cholera and severe acute malnutrition* | No licence line |
| DIPH24 | WHO. *Clinical management of diphtheria: guideline.* February 2, 2024; WHO DAT poster 2024 | CC BY-NC-SA 3.0 IGO |
| MEN25 | WHO. *WHO guidelines on meningitis diagnosis, treatment and care.* 2025. ISBN 978-92-4-010804-2 | CC BY-NC-SA 3.0 IGO |
| AWARE22 | WHO. *The WHO AWaRe antibiotic book.* 2022 (ch. 15, enteric fever) | CC BY-NC-SA 3.0 IGO |
| ICMR15 | DHR-ICMR. *Guidelines for diagnosis and management of rickettsial diseases in India.* 2015 | No licence stated (facts only) |

---

## 1. `cholera-rehydration-plan` — Cholera: How Dehydrated, Which Plan, How Much Fluid (GTFCC 2024)

**Question.** How dehydrated is this patient with suspected cholera, how much fluid over what time,
and do they need an antibiotic?

**Inputs.** Age (months or years, required; Plan C timing changes at 12 months); weight (kg, required
for Plans B and C, with an age fallback for B); danger signs: lethargic or unconscious, absent or weak
pulse, breathing difficulty; severe signs: sunken eyes, not able to drink or drinks poorly, skin pinch
goes back very slowly; some signs: restless or irritable, sunken eyes, rapid pulse, thirsty, skin pinch
goes back slowly (three-state each); pregnant, second or third trimester (yes / no, required for
women 12–50); severe acute malnutrition (yes / no, required for children 6–59 months); for the
antibiotic: high purging (at least one stool an hour over the first 4 hours), failed first 4 hours of
rehydration, HIV, age over 60.

**Logic (GTFCC-A).**

- **Severe → Plan C, admit:** any danger sign, or at least 2 of the severe signs.
- **Some → Plan B, admit:** no danger sign and at least 2 of the some signs.
- **None → Plan A, do not admit.**
- **Plan C:** Ringer's lactate 100 mL/kg: **under 12 months, 30 mL/kg in 1 hour then 70 mL/kg in 5
  hours; 12 months or older, 30 mL/kg in 30 minutes then 70 mL/kg in 2½ hours.** Reassess every 15–30
  minutes; ORS as soon as the patient can drink.
- **Plan B:** ORS 75 mL/kg over 4 hours. Band check column (job aid): under 4 months or under 5 kg,
  200–400 mL; 4–11 months or 5–7.9 kg, 400–600; 12–23 months or 8–11.9 kg, 600–800; 2–4 years or
  12–15.9 kg, 800–1,200; 4–14 years or 16–29.9 kg, 1,200–2,200; 15 years or more or 30 kg or more,
  2,200–4,000. Reassess at least hourly.
- **Plan A:** ORS after each loose stool: under 24 months 50–100 mL; 2–9 years 100–200 mL; 10 years or
  more as much as wanted; packets to take home for 500 mL, 1 L, or 2 L a day.
- **Pregnancy (GTFCC-P):** severe also if systolic below 90 or fetal heart above 160 counts as a sign;
  Plan C = 30 mL/kg Ringer's over 30 minutes, repeated while the pulse is weak or systolic 90 or below,
  then 70 mL/kg over 3–4 hours plus about 250 mL ORS per stool; Plan B = 75 mL/kg over 4 hours; **every
  pregnant woman gets an antibiotic.**
- **Severe acute malnutrition (GTFCC-S):** Plan C = 15 mL/kg IV over 1 hour (Ringer's with 5% glucose,
  half-strength Darrow's with 5% glucose, or 0.45% saline with 5% glucose), repeated once if better;
  Plan B = 5 mL/kg ORS every 30 minutes for 2 hours, then 5–10 mL/kg in alternate hours up to 10 hours,
  using **standard low-osmolarity ORS, not ReSoMal**.
- **Antibiotics (GTFCC-AB Table 1):** for severe dehydration, or regardless of dehydration with high
  purging, failed rehydration, pregnancy, severe acute malnutrition, HIV, or age over 60. Adults
  (including pregnancy): **doxycycline 300 mg once**; alternatives azithromycin 1 g or ciprofloxacin 1 g
  once. Children under 12: **doxycycline 2–4 mg/kg once**; alternatives azithromycin 20 mg/kg or
  ciprofloxacin 20 mg/kg (each maximum 1 g).
- **Zinc (GTFCC job aids 2024):** 10 days; under 6 months 10 mg, 6 months or more 20 mg once daily;
  none extra for children on therapeutic feeds.

**Conflicts inside GTFCC (show, don't resolve).**

| Item | 2022 technical note | 2024 flowchart / job aid | Tile |
|---|---|---|---|
| Child doxycycline | 2–4 mg/kg once | "200 mg for under 12 years" | The technical note (formal guidance); the flowchart value printed |
| Who gets antibiotics | The broader list above | Severe dehydration, pregnancy, older people | The technical note |
| Plan B bands | — | Flowchart and job aid print different weight bands | Job aid bands; 75 mL/kg computed |
| Zinc ages | 20 mg for 6 months to 5 years only | 10 or 20 mg by age, no upper limit | Job aid, with the note |
| Low blood sugar in pregnancy | Below 4 mmol/L | General job aid: below 3 mmol/L | Named by population |

**Case definition (GTFCC-AB):** outside a declared outbreak, 2 years or older with acute watery
diarrhea and severe dehydration or death; in an outbreak, anyone with acute watery diarrhea.

**Output.** The plan, volumes and rates, reassessment times, admission, the antibiotic and dose, and
zinc.

**Overlap.** `imci-ors-plan` (spec-v1546) is the non-cholera child plan; the two link, and the
difference in Plan B bands is stated.

## 2. `diphtheria-antitoxin-dose` — Diphtheria Antitoxin Dose and Antibiotic (WHO 2024)

**Inputs.** Site: throat or larynx / nose and throat with extensive membrane (required); duration since
onset: under 48 hours / 48 hours or more (required); diffuse neck swelling (bull neck); severe disease
(breathing difficulty or shock); weight (kg) and age for the antibiotic.

**Logic (DIPH24 §6.4; poster).** A **single dose, the same for adults and children:** throat or larynx
and under 48 hours → **20,000 IU** (2 vials of 10,000); nose and throat with extensive membrane and
under 48 hours → **40,000 IU** (4); **any** of diffuse neck swelling, 48 hours or more, or severe disease
→ **80,000 IU** (8). No routine sensitivity test; one dose only; no contraindication; do not wait for
culture.

**Antibiotic (DIPH24 §5), a macrolide preferred:** azithromycin 10–12 mg/kg once daily for children
(maximum 500 mg a day), 500 mg once daily for adults; or erythromycin 10–15 mg/kg every 6 hours (maximum
500 mg a dose, 2 g a day). Penicillin only if no macrolide and the strain is susceptible (procaine
benzylpenicillin 50 mg/kg IM daily, maximum 1.2 g; aqueous benzylpenicillin 25,000 IU/kg every 6 hours,
maximum 4 million IU a day; penicillin V 10–15 mg/kg a dose four times a day, maximum 500 mg a dose).
**Duration is not stated in DIPH24** and the tile prints none.

**Trap.** Online tables of 40,000–100,000 IU are the UK schedule; the tile cites WHO 2024 only. DIPH24's
background text ("mild: 2 days; severe: 3 or more") does not match its own 48-hour dose table; the
table is used.

## 3. `meningitis-who-2025` — Suspected Bacterial Meningitis: Lumbar Puncture, Empiric Antibiotics, Steroids, Duration (WHO 2025)

**Question.** For suspected acute bacterial meningitis, should the lumbar puncture wait, which empiric
antibiotics, do steroids apply, and for how long?

**Inputs.** Age; imaging available (yes / no); GCS below 10, focal neurological signs, cranial nerve
deficit, papilledema, new seizures (adults), severe immune compromise (three-state each); Listeria risk
factors: age over 60, pregnancy, immunosuppressive therapy, organ transplant, cancer, advanced HIV,
diabetes, end-stage kidney disease, cirrhosis, alcohol use disorder; setting: non-epidemic /
meningococcal epidemic / pneumococcal epidemic (required; an epidemic setting requires laboratory
confirmation of the pathogen); high pneumococcal resistance locally; cerebral malaria suspected;
recovery criteria for stopping (fever, vital signs, consciousness, mental state normal for 48 hours).

**Logic (MEN25 executive summary and §B.2.3).**

1. **Lumbar puncture:** where imaging is available, image first if any listed sign; where it is not,
   defer the puncture until they resolve. **Never delay antibiotics** for imaging or a deferred
   puncture. An isolated new seizure in a child does not require imaging.
2. **Empiric:** IV ceftriaxone or cefotaxime (ceftriaxone preferred in meningococcal or pneumococcal
   epidemics); **add ampicillin or amoxicillin** for any Listeria risk factor; consider vancomycin where
   pneumococcal resistance is high; chloramphenicol plus a penicillin only if neither cephalosporin is
   available. Before transfer, a parenteral antibiotic should be considered.
3. **Duration:** non-epidemic with no pathogen found, **may stop at 7 days** once recovered for 48 hours;
   meningococcal epidemic **5 days** of ceftriaxone; pneumococcal epidemic **10 days**; single-dose
   protocols only in large meningococcal epidemics with laboratory confirmation and 24–48 hour review.
4. **Steroids:** non-epidemic with a puncture possible, with the first antibiotic, stopped if the fluid
   is not bacterial, 4 days at most; **not routinely in a meningococcal epidemic**; yes in a
   pneumococcal epidemic; **never in cerebral malaria**; not shown to help in advanced HIV.
5. **Contacts:** single-dose ceftriaxone or ciprofloxacin (rifampicin if neither) for close contacts
   (household, or direct contact with oral secretions, from 7 days before onset to 24 hours after
   antibiotics); little or no benefit after 14 days.

**Output.** Each of the five decisions with its reason. **No mg/kg doses**: MEN25 gives none (it says
"maximum dosage"); the tile links the AWaRe dosing tile if and when built.

## 4. `enteric-fever-regimen` — Typhoid (Enteric Fever) Antibiotic by Severity and Local Resistance (WHO AWaRe)

**Inputs.** Severity: not critically ill / critically ill with suspected perforation, peritonitis,
sepsis or shock (required); local fluoroquinolone resistance: low / high (required; a local fact, not
computed); adult or child; weight (kg, for children).

**Logic (AWARE22 ch. 15).** Low resistance: **ciprofloxacin 500 mg every 12 hours** by mouth (adults);
children 15 mg/kg a dose every 12 hours, banded 3–<6 kg 50 mg, 6–<10 kg 100 mg, 10–<15 kg 150 mg, 15–<20
kg 200 mg, 20–<30 kg 300 mg, 30 kg or more 500 mg. High resistance, not critically ill:
**azithromycin 1 g on day 1 then 500 mg daily** (adults), 20 mg/kg daily (children). High resistance,
critically ill: **ceftriaxone 2 g daily IV** (adults), 80 mg/kg daily (children). **Duration: 7 days if
not critically ill, 10 days if critically ill**, provided improved and fever-free for 48 hours. The
Widal test is not reliable (AWARE22 says so; the tile prints it).

**Trap.** Extensively drug-resistant typhoid (Pakistan) needs other drugs not in this chapter; the tile
says so for users there.

## 5. `scrub-typhus-icmr` — Scrub Typhus: Case Definition and Doxycycline or Azithromycin Dose (ICMR, India)

**Inputs.** Fever days; eschar (three-state); malaria, dengue and typhoid ruled out (yes / no);
Weil-Felix titre (OX2, OX19, OXK); IgM ELISA optical density; PCR or paired antibody result; weight
(kg); pregnant; complicated disease.

**Logic (ICMR15 §3.1, 3.3).** **Suspected:** acute undifferentiated fever of 5 days or more, with or
without an eschar; **with an eschar, fever under 5 days counts.** **Probable:** suspected plus
Weil-Felix 1:80 or more and IgM ELISA optical density above 0.5. **Confirmed:** PCR positive (eschar or
blood) or rising antibody titres. **Treat** at primary level when fever is 5 days or more and malaria,
dengue, and typhoid are ruled out: adults over 45 kg doxycycline 200 mg a day in two doses for 7 days,
or azithromycin 500 mg for 5 days; children under 45 kg doxycycline 4.5 mg/kg a day in two doses, or
azithromycin 10 mg/kg for 5 days; pregnancy azithromycin 500 mg for 5 days. Complicated: IV doxycycline
100 mg twice daily, IV azithromycin 500 mg daily, or IV chloramphenicol 50–100 mg/kg a day in 4 doses;
7–15 days in total (5 for azithromycin).

**Traps.** ICMR's "azithromycin 500 mg in a single dose for 5 days" is read as once daily for 5 days and
the tile quotes the wording. The pediatric doxycycline duration is not stated; the tile prints none.
ICMR contraindicates doxycycline in pregnancy while GTFCC accepts it for cholera; each tile follows its
own source.

## Tests

`test/unit/epidemic.test.js`: every cholera sign combination for A, B, C; Plan C timing at 11.9 and 12.0
months; the pregnancy and SAM switches; the doxycycline conflict display; each DAT row; the meningitis
LP and steroid branches by setting; typhoid bands and durations; scrub typhus with and without eschar at
4 and 5 days.

## Staleness

GTFCC *moderate* (job aids reissued 2024–2025, with live internal inconsistencies). DIPH24, MEN25
*moderate* (new guidelines). AWARE22 *moderate*. ICMR15 *low* (old, unrevised).
