# spec-v1549 — Severe acute malnutrition: feeds, RUTF, emergency fluids, and weight gain

Program: [scope-field-health.md](scope-field-health.md). Rules: [spec-v1540](spec-v1540.md).
Four tiles for the stabilization ward and the outpatient therapeutic program. Every volume is
**computed from WHO's formula**; the feed cards themselves are not bundled (licence), and several
of their printed entries do not reproduce.

## Sources (read in full)

| Key | Document | Licence |
|---|---|---|
| SAMC21 | WHO. *Training course on the inpatient management of severe acute malnutrition*, 2021: modules 2 and 4, Web Annexes A (F-75 card), B, C (F-100 card) | CC BY-NC-SA 3.0 IGO |
| SAM99 | WHO. *Management of severe malnutrition: a manual for physicians and other senior health workers.* 1999 | All rights reserved |
| WAST23 | WHO. *Guideline on … wasting and nutritional oedema.* 2023 (rec B7, B10) | CC BY-NC-SA 3.0 IGO |
| CB14 | WHO. *IMCI chart booklet.* 2014 (RUTF packet table, p. 21) | All rights reserved |

---

## 1. `f75-feed-volume` — F-75 Volume per Feed in SAM Stabilization (WHO)

**Question.** How many mL of F-75 per feed for this child's weight, feed interval, and edema?

**Inputs.** Admission weight (kg, 2.0–15.0; the card covers 2.0–10.0, and the tile notes weights
above it); feeds every 2 h (12 per day), 3 h (8), or 4 h (6) (required); severe (+++) edema (yes / no,
required); rounding: "exact weight" or "the card's lower row" (required; SAMC21 says to use the
amount for the lower weight when between rows).

**Logic (SAMC21 module 4, pp. 3–4; Annex A).** Daily F-75 = **130 mL/kg** (100 kcal/kg/day), or
**100 mL/kg with +++ edema**. Per feed = daily ÷ feeds per day, **rounded to the nearest 5 mL**.
Minimum acceptable intake = 80% of the daily amount. Keep using the admission weight while on F-75.

**Output.** mL per feed, the daily total, and the 80% minimum.

**Worked examples from the source (tests).** 7.0 kg every 2 h: 75.8 → 75 mL. 5.0 kg with +++
edema every 3 h: 62.5 → 65 mL. 2.6 kg every 4 h: 56.3 → 55 mL.

**Traps.** The card's 80% column does not always reproduce (2.6 kg reads 265 mL; 0.8 × 338 = 270.4).
The tile computes and says "computed, rounded to the nearest 5 mL", and never claims to match the
card byte for byte. SAMC21 notes WHO is reviewing the edema weight assumption; flagged in staleness.

## 2. `f100-rutf-amount` — F-100 Range and RUTF Sachets per Day in SAM (WHO)

**Question.** How much F-100 per feed, or how many RUTF sachets a day, for this child?

**Inputs.** Weight (kg, 3.5–30, required); phase: "transition, F-100" / "transition, RUTF" /
"outpatient, full" / "outpatient, reduced" (required); sachet energy (kcal, default printed on the
field as 500 for the standard 92 g sachet, editable, since products vary); edition for the sachet
count: "computed from WHO 2023" / "IMCI chart 2014 table" (required for outpatient).

**Logic.**

- **F-100 (SAMC21 Annex C):** 150–220 mL/kg/day in 6 feeds. Per feed minimum = weight × 150 ÷ 6,
  maximum = weight × 220 ÷ 6, each rounded to 5 mL. Checks: 2.2 kg → 55–80 mL; 10 kg → 250–365 mL.
  The increase rule prints: same volume as the last F-75 feed for 2 days, then 10 mL more per feed
  until some is left.
- **Transition RUTF (SAMC21 module 4):** 100–135 kcal/kg/day.
- **Outpatient (WAST23 rec B10):** **150–185 kcal/kg/day** until recovery; or 150–185 until no
  longer severely wasted and no edema, then 100–130 kcal/kg/day until full recovery. Sachets per day
  = weight × kcal/kg/day ÷ sachet kcal. Example: 6.0 kg at 150–185 = 900–1,110 kcal = 1.8–2.2
  sachets per day.
- **IMCI 2014 table (CB14 p. 21)**, 500 kcal sachets per day: 4.0–4.9 kg 2.0 (14 a week); 5.0–6.9
  kg 2.5 (18); 7.0–8.4 kg 3.0 (21); 8.5–9.4 kg 3.5 (25); 9.5–10.4 kg 4.0 (28); 10.5–11.9 kg 4.5 (32);
  above 12.0 kg 5.0 (35).

**Conflict.** The 2014 table (and SAMC21's Annex B table, similar) predates WAST23, which lowered
the older 150–220 kcal/kg range. A 5.0 kg child gets 2.5 sachets under the 2014 table (250 kcal/kg)
and 1.5–1.85 under 2023. The **edition switch** shows both; the computed 2023 range is recommended.

**Traps.** The 2014 table has a hole at 11.9–12.0 kg and leaves 12.0 exactly undefined; the tile
treats 12.0 as the top band and says so. Weekly counts are the table's rounding (2.5 × 7 = 17.5 →
18). **No RUTF under 6 months**; no extra iron or vitamin A to a child on RUTF (CB14).

## 3. `sam-emergency-fluids` — Rehydration, Shock and Low Blood Sugar in Severe Malnutrition (WHO)

**Question.** What volumes for rehydration, shock, and low blood sugar in a severely malnourished
child of this weight?

**Inputs.** Weight (kg, 2–30, required); scenario: "dehydrated, not in shock" / "shock" / "low blood
sugar" (required); profuse watery diarrhea or suspected cholera (yes / no, required for dehydration);
conscious (yes / no, for low blood sugar); age (for the per-stool volume).

**Logic.**

- **Dehydrated, not in shock** (SAM99 pp. 18–20; WAST23 B7): ReSoMal **5 mL/kg every 30 minutes for
  2 hours**, then **5–10 mL/kg per hour** in alternate hours with F-75, up to 10 hours (70–100 mL/kg
  over 12 hours in SAM99). After each loose stool: under 2 years 50–100 mL, older 100–200 mL.
  **Profuse watery diarrhea or cholera: low-osmolarity ORS, not ReSoMal** (SAMC21 Annex B). WAST23
  prefers ReSoMal and allows low-osmolarity ORS if ReSoMal is unavailable. The ReSoMal recipe prints
  (1 ORS sachet, 2 L water, 50 g sugar, mineral mix).
- **Shock** (SAMC21 Annex B; SAM99): IV **15 mL/kg over 1 hour** (Ringer's lactate with 5% glucose,
  or half-strength Darrow's with 5% glucose, or 0.45% saline with 5% glucose). If better, repeat 15
  mL/kg over 1 hour, then ReSoMal. If not better, maintenance 4 mL/kg/h while waiting for blood,
  then **whole blood 10 mL/kg over 3 hours**. Stop if the pulse rises 25 per minute or breathing 5
  per minute (overload). ETAT16's 10–15 mL/kg (spec-v1547) is shown alongside.
- **Low blood sugar** (below 3 mmol/L, 54 mg/dL; SAM99): conscious → 50 mL of 10% glucose or sugar
  water by mouth; unconscious → **5 mL/kg of 10% glucose IV**, then 50 mL by nasogastric tube.
- **Low temperature:** rectal below 35.5 °C or axillary below 35.0 °C; rewarm until above 36.5 °C
  (36 °C axillary).

**Output.** mL and rates at each step for the entered weight, the stop signs, and the recheck times.

**Trap.** SAM99 misprints the repeat dose as "15 mg/kg"; SAMC21 has mL/kg. The tile uses mL/kg and a
code comment cites both.

## 4. `sam-weight-gain` — Weight Gain in g/kg/day During SAM Treatment (WHO)

**Inputs.** Previous weight (kg), current weight (kg), days between (1 or more), all required;
phase (rehabilitation on F-100 or RUTF / stabilization).

**Logic (SAMC21 module 4, p. 47).** Gain = (current − previous) × 1,000 ÷ previous ÷ days. **10 g/kg/day
or more is good; 5 to under 10 moderate; under 5 poor.** SAM99: under 5 g/kg/day for 3 days in a row
is failure to respond.

**Worked example (test).** 4.80 → 4.85 kg in 1 day = 10.4 g/kg/day, good.

**Trap.** Meaningless during stabilization or while edema is going down (weight falls as fluid
leaves). In stabilization mode the tile prints the gain with that caveat and no band.

## Tests

`test/unit/sam-feeding.test.js`: the three F-75 source examples; +++ edema changes 130 to 100; F-100
at 2.2 and 10 kg; RUTF 2023 vs 2014 at 5.0 kg; the 12.0 kg edge; ReSoMal vs ORS by the cholera
input; shock volumes at 10 kg; the weight-gain example and band edges at 5 and 10 g/kg/day.

## Staleness

SAMC21 *moderate* (edema-weight assumption under review). WAST23 and SAM99 *low*.
