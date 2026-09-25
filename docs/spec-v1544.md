# spec-v1544 — The sick young infant, birth to 59 days

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Three tiles. Young-infant infection is where WHO's guidance moved most (2014, 2015, 2019, 2024),
and where a silent pick between editions would do the most harm.

## Sources (all read in full)

| Key | Document | Licence |
|---|---|---|
| SYI19 | WHO. *IMCI: management of the sick young infant aged up to 2 months. Chart booklet.* 2019. ISBN 978-92-4-151636-5 | CC BY-NC-SA 3.0 IGO |
| PSBI15 | WHO. *Guideline: managing possible serious bacterial infection in young infants when referral is not feasible.* 2015. ISBN 978-92-4-150926-8 | All rights reserved |
| SBI24 | WHO. *WHO recommendations for management of serious bacterial infections in infants aged 0–59 days.* December 2024. ISBN 978-92-4-010290-3 | CC BY-NC-SA 3.0 IGO |
| CB14 | WHO. *IMCI chart booklet.* 2014. ISBN 978-92-4-150682-3 (its young-infant pages, for the conflict table only) | All rights reserved |

## Conflicts (spec-v1540 §3)

| # | Item | Older | Newer | Rule |
|---|---|---|---|---|
| C1 | Fever threshold | CB14: 37.5 °C axillary | SYI19, PSBI15, SBI24: 38 °C | Implement 38 °C; one sentence names the 2014 value |
| C2 | Fast breathing (60 or more) alone | CB14: refer at any age under 2 months | SYI19 onward: under 7 days, refer (PSBI); 7–59 days, pneumonia treated at home | Implement SYI19; age in days is required |
| C3 | Critical-illness signs | PSBI15: 11 signs; SYI19: 4 signs including weight under 2 kg | SBI24: 3 signs (not able to feed at all, no movement at all, convulsions) | **Edition switch** in `psbi-referral-not-feasible` |
| C4 | Critical illness, referral impossible | SYI19: ampicillin twice daily + gentamicin daily, 7 days | SBI24: ampicillin every 12 h in week 1, every 8 h after; at least 10 days | Edition switch |
| C5 | Clinical severe infection, outpatient | PSBI15: amoxicillin 50 mg/kg twice daily 7 days; gentamicin 5–7.5 mg/kg (low birth weight 3–4) daily 7 days, or 2 days | SBI24: amoxicillin 50 mg/kg every 12 h in week 1, every 8 h after; gentamicin 5 mg/kg in week 1, 7.5 mg/kg after; at least 7 days (2 days conditional) | Edition switch |
| C6 | Young-infant dose bands | CB14: 0.5 kg bands from 1 kg, gentamicin diluted to 10 mg/mL, split at 7 days | SYI19: three bands from 1.5 kg, gentamicin 40 or 20 mg/mL | CB14 superseded; not implemented |

---

## 1. `imci-young-infant-classify` — Sick Young Infant Assessment, 0–59 Days (WHO IMCI 2019)

**Question.** Does this infant under 2 months have a possible serious bacterial infection, pneumonia,
a local bacterial infection, or infection unlikely, and what are the jaundice, dehydration, and
feeding classifications?

**Inputs.** Signs are three-state (present, absent, not assessed; spec-v1540 §4.3).

| Input | Unit / values | Required |
|---|---|---|
| Age | days, 0–59 | yes |
| Respiratory rate, counted over 1 full minute | breaths/min, 0–150 | yes |
| Repeat count if 60 or more | breaths/min | yes when the first count is 60 or more |
| Axillary temperature | °C, site fixed at axillary (the chart's) | yes |
| Not able to feed at all, or not feeding well | sign | yes |
| Convulsions (history or now) | sign | yes |
| Severe chest indrawing | sign | yes |
| Movement: normal / only when stimulated / none | enum | yes |
| Umbilicus red or draining pus | sign | yes |
| Skin pustules | sign | yes |
| Jaundice: any; first seen under 24 h of age; yellow palms and soles | signs | yes |
| Diarrhea module: present? then movement, sunken eyes, skin pinch (normal / slow / very slow), restless or irritable | signs | yes if diarrhea present |
| Feeding module: weight (kg), weight-for-age z (from `who-growth-zscore`, optional), breastfeeds per 24 h, attachment (all four signs / not), sucking effectively, other foods or drinks, oral thrush | mixed | optional module; incomplete if started and left partial |

**Logic (SYI19 pp. 1–6).**

- **Possible serious bacterial infection or very severe disease** if any: not feeding well or not
  able to feed; convulsions; severe chest indrawing; temperature 38 °C or more; temperature below
  35.5 °C; movement only when stimulated or none; fast breathing (60 or more, on the repeat count)
  **in an infant under 7 days**.
- Else **pneumonia** if fast breathing at 7–59 days.
- Else **local bacterial infection** if umbilicus red or draining pus, or skin pustules.
- Else **infection unlikely**. Printed only when every infection sign is assessed.
- **Jaundice:** jaundice first seen under 24 h of age, or yellow palms and soles at any age →
  **severe jaundice**. Jaundice after 24 h with palms and soles not yellow → **jaundice**, and the
  action changes if the infant is over 3 weeks old (refer). No jaundice → **no jaundice**.
- **Diarrhea:** two or more of {movement only when stimulated or none, sunken eyes, skin pinch
  very slow} → **severe dehydration**. Else two or more of {restless or irritable, sunken eyes,
  skin pinch slow} → **some dehydration**. Else **no dehydration**. The chart's note that frequent
  soft stools in a breastfed infant are not diarrhea appears as field help text.
- **Feeding (breastfed):** weight under 2 kg at under 7 days → **very low weight** (KMC and
  referral). Else any of {not well attached, not sucking effectively, fewer than 8 breastfeeds in
  24 h, other foods or drinks, weight-for-age below −2, thrush} → **feeding problem or low weight
  for age**. Else **no feeding problem**. The non-breastfed variant (SYI19 p. 6) is a second
  branch chosen by a required "breastfed?" input.

**Output.** Every classification that applies, each with its color word and the chart's action in
our words: pre-referral first doses and referral for severe classifications; amoxicillin 7 days
for pneumonia; amoxicillin 5 days for local infection; follow-up days (pneumonia 3, local 2,
jaundice 1). Doses link to `young-infant-antibiotic-dose`. "Incomplete" names the unassessed signs
that could change a row.

**Edges and traps.** Respiratory rate 59 vs 60 vs 61, on the repeat count. Age 6 vs 7 days (the
fast-breathing split). Temperature 35.4 / 35.5 / 37.9 / 38.0. Jaundice at 23 vs 24 h. Two signs
from different dehydration lists do not add up: sunken eyes plus restless is **some**, sunken
eyes plus skin pinch very slow is **severe**, and the tile must not count "sunken eyes" twice.

**Overlap.** `neo-phototherapy` and `bhutani-bilirubin` need a serum bilirubin; this is the
clinical-sign triage. `eos-calculator` is a maternal-risk model. `phoenix-sepsis` and `nsofa`
need labs. None duplicates.

## 2. `psbi-referral-not-feasible` — Young Infant Serious Infection When Referral Is Not Possible (WHO)

**Question.** For a young infant with signs of serious infection whose family cannot reach a
hospital, which sign group applies, and which outpatient antibiotic course does the chosen WHO
edition give?

**Inputs.**

| Input | Unit / values | Required |
|---|---|---|
| Edition | "IMCI young infant chart 2019" / "WHO recommendations 2024" / "WHO guideline 2015" | yes, no default |
| Age | days, 0–59 | yes |
| Weight | kg, 1.0–6.0 | yes |
| Each sign individually | three-state: not able to feed at all; not feeding well; convulsions; no movement at all; movement only when stimulated; temperature 38 °C or more; temperature below 35.5 °C; severe chest indrawing; fast breathing 60 or more | yes |
| Weight under 2 kg (SYI19 critical sign) | derived from weight | — |
| 2015 extra critical signs: unconscious, apnea, unable to cry, cyanosis, bulging fontanelle, major malformation preventing oral antibiotics, bleeding needing transfusion, surgical condition, persistent vomiting | three-state | yes when edition is 2015 |
| Birth weight under 1,500 g, or hospitalized for illness in the past 2 weeks | yes / no | yes when edition is 2015 (its exclusion) |
| Low birth weight (for the 2015 gentamicin range) | yes / no | yes when edition is 2015 |

**Logic.**

- **SYI19 (pp. 13–14).** Critical illness: convulsions, not able to feed at all, no movement on
  stimulation, or weight under 2 kg → reinforce referral; if still impossible, gentamicin IM once
  daily plus ampicillin IM twice daily until referral or for 7 days. Clinical severe infection: not
  feeding well, temperature 38 °C or more or below 35.5 °C, severe chest indrawing, or movement
  only when stimulated → gentamicin IM once daily for 7 days (or 2 days where the country has chosen
  it, with a mandatory day-4 visit) plus oral amoxicillin for 7 days. Fast breathing alone under 7
  days → severe pneumonia: oral amoxicillin 7 days, follow-up in 3 days. Fast breathing alone at
  7–59 days → pneumonia at home (tile 1).
- **PSBI15 (recs 2–5).** The 11-sign critical-illness list → hospitalize after pre-referral
  ampicillin 50 mg/kg (or benzylpenicillin 50,000 U/kg) plus gentamicin 5–7.5 mg/kg. Clinical
  severe infection → option 1 (preferred): gentamicin 5–7.5 mg/kg daily (3–4 mg/kg if low birth
  weight) plus amoxicillin 50 mg/kg twice daily, both 7 days; option 2: gentamicin 2 days plus
  amoxicillin 7 days, with a mandatory day-4 assessment. Fast breathing alone: under 7 days refer,
  and if refused amoxicillin 50 mg/kg twice daily for 7 days; 7–59 days amoxicillin 7 days without
  referral. **Not applicable** if birth weight was under 1,500 g or the infant was hospitalized in
  the past 2 weeks. The escalation rule prints with the course: any critical sign during
  treatment, any new sign after 48 h, or any sign still present on day 8 → manage as critical.
- **SBI24 (recs A.2–A.5, Table 3.1).** Critical illness (3 signs) → refer; if impossible,
  ampicillin 50 mg/kg per dose every 12 h in the first week of life or every 8 h after, plus
  gentamicin 5 mg/kg daily in week 1 or 7.5 mg/kg after, **for at least 10 days**. Clinical severe
  infection → refer; if impossible, amoxicillin 50 mg/kg per dose every 12 h (week 1) or every 8 h
  (after) for at least 7 days, plus gentamicin 5 or 7.5 mg/kg daily for at least 7 days (2 days if
  7 is not feasible, a conditional recommendation). Fast breathing alone under 7 days → refer; if
  impossible, amoxicillin every 12 h for at least 7 days. 7–59 days → amoxicillin every 12 h for at
  least 7 days outside hospital.
- **"First week of life" is age under 7 days** (SBI24 does not define it; SYI19's "less than 7
  days" is used, and the answer says so).

**Output.** The sign group; the course for the chosen edition, with mg per dose computed from
weight (dose volume via tile 3); frequency; duration; follow-up and escalation rules; and one
sentence naming what the other two editions would give, so a user trained on another chart sees
the difference.

**Edges and traps.** An infant of 1.9 kg is critical under SYI19 and not by weight under SBI24.
Age 6 vs 7 days changes gentamicin mg/kg and amoxicillin frequency under SBI24. With the 2015
exclusion met, the tile refuses the outpatient course and says why.

**Overlap.** `aminoglycoside` is adult pharmacokinetics; `peds-weight-dose` is generic mg/kg.

## 3. `young-infant-antibiotic-dose` — Gentamicin, Ampicillin and Amoxicillin Doses for Young Infants (WHO)

**Question.** What volume of gentamicin, ampicillin or amoxicillin does this young infant get, for
the vial or tablet the clinic has?

**Inputs.**

| Input | Unit / values | Required |
|---|---|---|
| Edition | "IMCI young infant chart 2019 (weight bands)" / "WHO recommendations 2024 (mg/kg by week of life)" | yes |
| Weight | kg | yes |
| Age | days (needed for 2024) | yes when 2024 |
| Drug and product | gentamicin 40 mg/mL; gentamicin 20 mg/mL; ampicillin 250 mg vial + 1.3 mL water (250 mg in 1.5 mL); amoxicillin 250 mg dispersible; amoxicillin 125 mg dispersible; amoxicillin syrup 125 mg in 5 mL | yes |

**Logic.**

- **SYI19 bands (pp. 7–9, 13–14):**

  | Weight | Gentamicin 40 mg/mL | Gentamicin 20 mg/mL | Ampicillin 250 mg/1.5 mL | Amoxicillin 250 mg DT | 125 mg DT | Syrup 125 mg/5 mL |
  |---|---|---|---|---|---|---|
  | 1.5–2.4 kg | 0.2 mL | 0.4 mL | 0.8 mL | ½ | 1 | 5 mL |
  | 2.5–3.9 kg | 0.4 mL | 0.8 mL | 1.2 mL | ½ | 1 | 5 mL |
  | 4.0–5.9 kg | 0.6 mL | 1.2 mL | 1.5 mL | 1 | 2 | 10 mL |

  The chart prints closed bands at one decimal (1.5–2.4, 2.5–3.9), which leaves 2.41–2.49 kg in
  no band. The chart does not say how to round, so the weight field takes one decimal and refuses
  a second ("Enter the weight to 0.1 kg, as the chart does"). Below 1.5 kg or at 6.0 kg and above:
  outside the chart.
- **SBI24 mg/kg:** gentamicin 5 mg/kg daily (under 7 days) or 7.5 mg/kg daily (7 days and over);
  ampicillin 50 mg/kg per dose; amoxicillin 50 mg/kg per dose. mL = mg ÷ concentration, rounded
  to 0.1 mL for injections. Tablet counts round to the nearest quarter tablet only for dispersible
  tablets, and the answer shows the achieved mg/kg.

**Output.** Volume or tablet count per dose, frequency (from tile 2's edition), and mg/kg achieved.
A dilution warning prints for gentamicin 40 mg/mL: the volumes are small enough that a 1 mL
syringe is required.

**Edges and traps.** The main error this tile prevents is concentration mix-ups between 40, 20, and
10 mg/mL gentamicin. Every volume prints with its concentration beside it.

## Tests

`test/unit/young-infant.test.js`: every sign alone for tile 1; the dehydration two-list rule;
respiratory rate and age edges; each of C1–C5 flips the output when the edition changes; the SYI19
band edges (1.4, 1.5, 2.4, 2.5, 3.9, 4.0, 5.9, 6.0 kg); the 2015 exclusion; empty and
one-sign-short forms print no green row and no dose.

## Staleness

SYI19 and SBI24 as *moderate* volatility: WHO is expected to republish the young-infant chart to
match SBI24. PSBI15 kept only for the edition switch, reviewed with them.
