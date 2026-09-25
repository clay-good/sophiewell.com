# spec-v1559 — Antenatal and newborn care: the ANC schedule, tetanus in pregnancy, newborn temperature, sugar, and size

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Five tiles.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| ANC16 | WHO. *Recommendations on antenatal care for a positive pregnancy experience.* 2016 | All rights reserved |
| TET17 | WHO. Tetanus vaccines: WHO position paper. *Wkly Epidemiol Rec* 2017;92(6):53–76 | WHO copyright |
| THERM97 | WHO. *Thermal protection of the newborn: a practical guide.* WHO/RHT/MSM/97.2, 1997 (scanned; OCR consistent in three places) | None printed |
| HYPO97 | WHO. *Hypoglycaemia of the newborn: review of the literature.* WHO/CHD/97.1, 1997 | None printed |
| PB13 | WHO. *Pocket book of hospital care for children*, 2nd ed. 2013 (ch. 3) | All rights reserved |
| SYI19 | WHO. *IMCI: sick young infant chart booklet.* 2019 | CC BY-NC-SA 3.0 IGO |
| LBW22 | WHO. *Recommendations for care of the preterm or low-birth-weight infant.* 2022 | CC BY-NC-SA 3.0 IGO |

---

## 1. `who-anc-schedule` — WHO Eight-Contact Antenatal Schedule: Which Visit and When Is the Next

**Question.** Given the gestational age today, which WHO antenatal contact is this and when is the
next one?

**Inputs.** Gestational age (weeks + days, required), or the last menstrual period or an ultrasound
dating (via `due-date`); contacts already made (optional).

**Logic (ANC16 Box 5, rec E.7).** A minimum of eight contacts: **up to 12 weeks, then 20, 26, 30, 34,
36, 38, and 40 weeks**; return at 41 weeks if not delivered. The tile names the current contact and
the next date. Supplements print as lines, not calculations: daily 30–60 mg elemental iron plus 400
µg folic acid (A.2.1); calcium 1.5–2.0 g a day in three doses with meals, apart from iron, in
low-calcium populations (A.3); IPTp-SP where malaria is endemic (link `iptp-sp-schedule`); tetanus
(tile 2).

**Overlap.** `due-date` computes the date; `prenatal-infection-screening-schedule` is the US
state-law testing schedule. This is WHO's contact schedule, linked to both.

## 2. `td-pregnancy-schedule` — Tetanus-Diphtheria Doses in Pregnancy (WHO 2017)

**Inputs.** Documented doses before this pregnancy: none or unknown / childhood DTP 3 doses / childhood
DTP 4 doses / adolescent or adult Td doses (number and dates); gestational age; expected date of
delivery.

**Logic (TET17 table).** **No prior vaccination** (or unknown): Td as early as possible; a second at
least 4 weeks later; a third at least 6 months later; a fourth at least 1 year later; a fifth at least
1 year later; the second dose at least 2 weeks before birth. **3 childhood DTP doses:** 2 Td doses at
least 4 weeks apart (the second at least 2 weeks before birth), then 1 more at least 1 year later
(total 6). **4 childhood DTP doses:** 1 Td as early as possible, then 1 more at least 1 year later
(total 6).

**Output.** Doses due now, the next date, and whether the "2 weeks before birth" condition can still
be met from the expected delivery date.

**Conflict.** ANC16 endorsed the older 2006 schedule (5 doses). TET17 supersedes it for women with
childhood DTP doses; the tile uses TET17 and names the older count.

## 3. `newborn-temperature-who` — Newborn Temperature: Cold Stress and Hypothermia Grades (WHO)

**Inputs.** Temperature (°C or °F, 25–43 °C, required); site (axillary / rectal, required).

**Logic (THERM97 ch. 2).** **36.5–37.5 °C normal; 36.0–36.4 cold stress (mild hypothermia), a cause for
concern; 32.0–35.9 moderate hypothermia, danger, warm the baby; below 32.0 severe, outlook grave,
urgent skilled care; above 37.5 hyperthermia.** Warming as WHO describes it: mild, skin-to-skin in a
room of at least 25 °C; moderate, a radiant warmer, an incubator at 35–36 °C, a heated mattress, or a
room at 32–34 °C, rechecking every hour; severe, rapid rewarming over a few hours. Keep feeding.

**Edges and traps.** 35.9/36.0/36.4/36.5/37.5/37.6. One early passage of THERM97 prints overlapping
band edges; the table values are used. **IMCI uses below 35.5 °C as a serious-infection sign**, a
different, co-existing threshold; the answer links `imci-young-infant-classify` when below 35.5.
Distinct from the adult `hypothermia-rewarm`.

## 4. `newborn-hypoglycemia-who` — Low Blood Sugar in a Newborn: WHO Thresholds and Treatment

**Inputs.** Population (required): at-risk newborn without symptoms / sick young infant (drowsy,
unconscious, or convulsing); blood glucose (mmol/L or mg/dL, or "cannot measure"); weight (kg);
feeding possible (yes / no).

**Logic.**

- **At-risk, no symptoms (HYPO97 item 14):** keep glucose at **2.6 mmol/L (47 mg/dL) or more**. Below
  it: feed, recheck after about 1 hour and before the next feed 3 hours later; if still below 2.6,
  consider IV glucose. No reliable test: keep warm, breastfeed, and supplement at least every 3 hours
  (item 15).
- **Sick young infant (PB13 ch. 3):** drowsy, unconscious or convulsing with glucose **below 2.2
  mmol/L (40 mg/dL)**, or glucose that cannot be measured: **10% glucose 2 mL/kg IV**, then 10% glucose
  5 mL/kg per hour; no IV, expressed breast milk or glucose by nasogastric tube.
- **Before referral (SYI19):** 20–50 mL (10 mL/kg) of expressed breast milk or sugar water (4 level
  teaspoons, 20 g, in 200 mL), by tube if unable to swallow.

**Traps.** Three WHO thresholds (2.6, 2.2, and the child's 2.5) and two boluses (2 mL/kg newborn, 5
mL/kg child). The tile names its population on every line and links `who-child-hypoglycemia` for
children 2 months and older. HYPO97's item on symptomatic newborns was illegible in the scan and is
not used.

## 5. `newborn-size-category` — Low Birth Weight and Preterm Categories (WHO 2022)

**Inputs.** Birth weight (g, 300–6,000, required); gestational age at birth (weeks + days, optional).

**Logic (LBW22 glossary).** **Low birth weight: below 2,500 g; very low: below 1,500 g; extremely low:
below 1,000 g.** Preterm: before 37+0 weeks; very preterm: before 32+0; extremely preterm: before 28+0;
term 37+0 to 41+6; post-term 42+0 or more. **Kangaroo mother care** (recs A.1a, A.1b): routine for all
preterm or low-birth-weight infants, 8–24 hours a day, started as soon as possible; in a facility it
may start before the baby is stable unless unable to breathe after resuscitation, in shock, or
ventilated; at home only without danger signs.

**Not computed: small for gestational age.** That needs INTERGROWTH-21st or Fenton centile tables,
both restricted (spec-v1564). The tile says so.

**Edges.** 2,500 g exactly is not low birth weight; 36+6 is preterm, 37+0 term.

## Tests

`test/unit/antenatal-newborn.test.js`: every ANC contact from 8 to 42 weeks; each Td history branch and
the 2-week-before-birth check; every temperature edge; newborn glucose by population at 2.5, 2.6, 2.1,
2.2 mmol/L; each weight and gestation edge.

## Staleness

ANC16 *moderate* (nutrition recommendations updated in 2020–2021, not read). The rest *low*.
