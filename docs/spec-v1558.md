# spec-v1558 — Maternal emergencies: PPH, the Labour Care Guide, magnesium sulfate, and shock index

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Three new tiles and one mode. For the midwife at a health center and the district labor ward.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| PPH25 | WHO/FIGO/ICM. *Consolidated guidelines for the prevention, diagnosis and treatment of postpartum haemorrhage.* September 26, 2025 (IRIS 10665/382923) | CC BY-NC-SA 3.0 IGO |
| LCG20 | WHO. *WHO labour care guide: user's manual.* 2020 (IRIS 10665/337693) | CC BY-NC-SA 3.0 IGO |
| MCPC17 | WHO. *Managing complications in pregnancy and childbirth*, 2nd ed. 2017 (IRIS 10665/255760) | CC BY-NC-SA 3.0 IGO |
| PCPNC15 | WHO. *Pregnancy, childbirth, postpartum and newborn care: a guide for essential practice*, 3rd ed. 2015 | All rights reserved |
| PE11 | WHO. *Recommendations for prevention and treatment of pre-eclampsia and eclampsia.* 2011 | All rights reserved |
| ELAY16 | El Ayadi AM et al. Vital sign prediction of adverse maternal outcomes in women with hypovolemic shock: the role of shock index. *PLoS One* 2016;11:e0148729 | CC BY 4.0 |
| NATH15 | Nathan HL et al. Shock index: an effective predictor of outcome in postpartum haemorrhage? *BJOG* 2015;122:268–275 | Journal copyright (facts only) |

The FIGO misoprostol dosing charts (2017, 2023) could not be read (figo.org blocked automated access);
misoprostol-only regimens are not built. Helping Babies Breathe materials are AAP-copyrighted and not
used.

---

## 1. `pph-who-2025` — Is This Postpartum Hemorrhage? WHO 2025 Criteria and Tranexamic Acid

**Question.** Does this bleed after birth meet WHO's 2025 criteria to start the first-response PPH
bundle now, and is tranexamic acid still within its window?

**Inputs.** Measured blood loss (mL, 0–5,000, required; objectively measured, for example a
calibrated drape); pulse (per minute); systolic and diastolic pressure (mmHg); time of birth and time
now (or minutes since birth, required for TXA); first TXA dose given and when; bleeding continuing or
restarted.

**Logic (PPH25 rec 22 and ch. 3).**

- **Abnormal sign** = any of: pulse **above 100**; shock index (pulse ÷ systolic) **above 1**;
  systolic **below 100**; diastolic **below 60**.
- **PPH** = measured loss **300 mL or more with any abnormal sign**, or **500 mL or more**, whichever
  comes first, **within 24 hours** of birth, with particular vigilance in the first 2 hours.
- Beyond 24 hours: outside this definition; the tile says so and does not answer "no PPH".
- **The bundle (rec 29):** uterine massage, an oxytocic, tranexamic acid, IV fluids, examination of
  the genital tract, and escalation. Rec 22 says the criteria trigger first response and referral,
  "not as an absolute trigger" for surgery.
- **Tranexamic acid (rec 27):** **1 g IV at 1 mL/min** (about 10 minutes), started **within 3 hours of
  birth**; a **second 1 g** if bleeding continues after 30 minutes, or restarts within 24 hours of the
  first dose. Not after 3 hours. Given whatever the cause of bleeding. Not for prevention.
- **Uterotonics (recs 7–13, 24–25), as lines under the bundle:** prevention with oxytocin 10 IU IM or
  IV for every birth (IV diluted, over 1–2 minutes); heat-stable carbetocin 100 µg where the cold chain
  cannot be kept; misoprostol 400 or 600 µg by mouth as an alternative. Treatment: IV oxytocin first;
  then ergometrine, oxytocin-ergometrine, or a prostaglandin including misoprostol 800 µg under the
  tongue.

**Output.** Meets criteria (start the bundle now) / not yet (keep measuring), with each sign's value
beside its threshold; TXA: eligible, second dose due, or window closed, with the clock time the window
closes.

**Edges and traps.** 299/300 and 499/500 mL; pulse 100 vs 101; shock index exactly 1.0 is **not**
abnormal (above 1). **Blank vital signs are not normal**: a 350 mL loss with no vitals returns "cannot
rule out; take pulse and blood pressure now". The 3-hour limit's inclusiveness is not stated; the tile
treats 3:00 as within and says so. PPH25 cites a medication-error risk (TXA given intrathecally); the
answer says "IV only".

**Overlap.** `qbl-pph` quantifies blood loss; `shock-index` is generic. This is the decision rule, and
links both.

## 2. `labour-care-guide-alert` — WHO Labour Care Guide: Which Observations Need an Alert?

**Question.** Which of this woman's labor observations meet the Labour Care Guide's alert threshold?

**Inputs.** Every row is optional, and **blank means not assessed**, never normal. Active first stage
only (5 cm or more); second stage flag and parity for the second-stage row.

| Row | Alert |
|---|---|
| Companion present | No |
| Pain relief | No |
| Oral fluid | No |
| Posture | Supine |
| Baseline fetal heart rate (1-minute count) | below 110 or 160 or more |
| Fetal heart decelerations | Late |
| Amniotic fluid | Thick meconium (M+++) or blood-stained |
| Fetal position | Occiput posterior or transverse |
| Caput | +++ |
| Moulding | +++ |
| Maternal pulse | below 60 or 120 or more |
| Systolic pressure | below 80 or 140 or more |
| Diastolic pressure | 90 or more |
| Temperature (axillary) | below 35.0 or 37.5 or more |
| Urine protein / acetone | ++ or more |
| Contractions per 10 minutes | 2 or fewer, or more than 5 |
| Contraction duration | under 20 or over 60 seconds |
| Time at the same cervical dilatation | 5 cm 6 h or more; 6 cm 5 h; 7 cm 3 h; 8 cm 2.5 h; 9 cm 2 h |
| Second stage | 3 h or more nulliparous; 2 h or more multiparous |
| Descent | **no alert threshold** (the guide says so) |
| Oxytocin, medicines, IV fluids | recorded only, no alert |

**Logic (LCG20 Fig. 1, Tables 3–6).** Each row compared exactly as printed; the guide mixes "or more"
and "more than" (contractions: more than 5; pulse: 120 or more), and each is encoded as written.

**Output.** The alerted rows, each with the guide's step-4 action in our words ("tell a senior provider
and follow clinical guidelines"; for fetal heart rate also "turn her onto her left side"; for
contractions "check again over another 10 minutes before escalating"), the count, and the rows not
assessed. The normal monitoring intervals print at the end (fetal heart every 30 minutes in the first
stage and every 5 in the second; pulse, BP, temperature every 4 hours).

**Traps.** A woman at 4 cm is outside the guide. The 2015 PCPNC uses fetal heart below 120 or above
160, a different threshold; never mixed. No descent alert is invented.

## 3. `mgso4-im-regimen` — Magnesium Sulfate IM (Pritchard) and Pre-Referral Loading, With the Safety Check (WHO)

**Question.** For severe pre-eclampsia or eclampsia, what magnesium sulfate loading and IM maintenance
to give, and is it safe to give the next dose?

**Inputs.** Source (MCPC 2017 / PCPNC 2015; required); regimen (IV plus IM loading then IM maintenance
/ IM only, no IV access / loading then transfer); for the next-dose check: breathing rate per minute,
knee reflex (present / absent), urine over the last 4 hours (mL). All three required for a "safe to
give".

**Logic.**

- **Loading (MCPC Box S-4):** 4 g of 20% solution IV over 5 minutes, then 10 g of 50% solution IM, 5 g
  deep in each buttock with 1 mL of 2% lidocaine in the same syringe. PCPNC gives the IV part **over 20
  minutes**; each source's rate prints with its name. **IM only** (PCPNC): 10 g IM. A convulsion after
  15 minutes: 2 g IV over 5 minutes (MCPC) or 20 minutes (PCPNC).
- **Maintenance:** 5 g of 50% with 1 mL of 2% lidocaine deep IM, alternating buttocks, every 4 hours,
  until 24 hours after birth or the last convulsion, whichever is later.
- **Pre-referral (PE11 rec 15):** where the full regimen cannot be given, the loading dose then
  immediate transfer.
- **Dilution (PCPNC):** 50% = 5 g in 10 mL; 20% = 4 mL of 50% plus 6 mL water; 4 g IV = 20 mL of 20%.
  **Never give 50% IV undiluted.**
- **Hold the next dose if:** breathing below 16 per minute; knee reflexes absent; urine below the
  source's limit: **MCPC under 30 mL/hour over 4 hours (120 mL); PCPNC under 100 mL in 4 hours.** The
  two sources disagree and the chosen source decides.
- **Antidote:** calcium gluconate 1 g (10 mL of 10%) IV, over 3 minutes (MCPC) or 10 minutes (PCPNC).

**Output.** The regimen with volumes and syringe contents; safe to give / hold, with the reason; the
next dose time.

**Overlap.** `mgso4-preeclampsia` is IV-only (4–6 g, 1–2 g/hour); this is its IM sibling. The two
link each other.

## 4. Mode on `shock-index` — obstetric bands

**Why a mode.** The existing tile computes pulse ÷ systolic with general bands. Obstetric sources use
different bands for referral urgency.

**Logic.** An "obstetric (low-resource referral)" mode: **below 0.9** reassuring; **0.9 or more** needs
referral; **1.4 or more** urgent intervention at a tertiary facility; **1.7 or more** high chance of an
adverse outcome (ELAY16). NATH15 tested 1.5 and 1.7 in UK PPH of 1,500 mL or more and supports 0.9 and
1.7; the answer names which source each band comes from. WHO's PPH criterion (above 1) is a different
purpose and links to tile 1.

## Tests

`test/unit/maternal.test.js`: PPH at each loss and vital-sign edge, blank vitals, the 24-hour limit;
TXA at 2:59, 3:00, 3:01 and the second-dose rule; every Labour Care Guide row edge, blank rows reported
as not assessed; the MgSO4 hold rule under both sources at 110 and 125 mL in 4 hours; shock index mode
at 0.89, 0.9, 1.39, 1.4, 1.69, 1.7.

## Staleness

PPH25 *low* (new). LCG20 *low* (a 2025 implementation package exists, not read). MCPC17, PCPNC15, PE11
*low*.
