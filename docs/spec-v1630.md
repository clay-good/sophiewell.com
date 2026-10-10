# spec-v1630 — Sterile compounding, IV admixture, parenteral nutrition, hazardous drugs and drug storage

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 17 new tools; none is gated as a whole (tool 3 has two drugs and tool 12 two rows behind a build gate).
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

The IV-room pharmacist and technician check the same things all shift: what a vial becomes once
diluent goes in, what a bag really holds, whether an order runs faster or stronger than the label
allows, whether a parenteral nutrition order is inside the label's limits, how much aluminum it
carries, when an opened container must be thrown away, and what a temperature log says about a
refrigerator. Each answer is a number on an FDA label, a CFR paragraph, or a CDC/FDA document. The
catalog has the bedside drip math and one beyond-use-date tool; it has almost none of this.

## Gap finder

**Method.** The work was enumerated by station (vial, bag, PN compounder, hood, refrigerator), and
the catalog (2,059 live tools) was swept for each candidate by synonym: compound, admix,
reconstitut, vial, overfill, dilut, concentrat, drip, infusion, rate, mcg/kg, parenteral, TPN,
lipid, kcal, nitrogen, glucose infusion, aluminum, calcium, phosph, osmol, hazard, NIOSH, storage,
excursion, kinetic, vaccine, temperature, air change, particle, pump, syringe, CRRT. The lib
source of the close ones was read: `compounding-bud` (`lib/compounding-bud-v1511.js`), `iv-osmolarity` and
`gir` (`lib/clinical-v7.js`), `tpn-macro` (`lib/medication-v4.js`, `data/tpn-rules/tpn.json`), and
the meta citations of `dose-volume`, `conc-rate`, `tpn-macro`.

**Already live in this domain.** `compounding-bud`, `dose-volume`, `conc-percent`, `conc-rate`,
`drip-rate`, `infusion-time-remaining`, `rate-escalation-schedule`, `vial-rounding`, `drug-wastage`,
`days-supply`, `weight-dose`, `tpn-macro`, `gir`, `iv-osmolarity`, `nitrogen-balance`,
`icu-nutrition-target`, `electrolyte-replacement`, `potassium-deficit`, `magnesium-replacement`,
`calcium-replacement`, `crrt-dose`, `vasopressor`, `pca-pump`, `last-lipid`, `unit-converter`.
`niosh-lifting` and `calcium-phosphate-product` share words with this domain and nothing else.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `reconstitution-concentration` | `dose-volume` (dose ÷ stock concentration) | The neighbor needs the concentration as an input; this one produces it from the container, the diluent and the powder's displacement, for injectable vials and for oral and topical powders |
| `admixture-concentration` | `conc-rate`, `conc-percent` | Neither computes what a bag holds after overfill, additive volume and a baseline content |
| `iv-label-rate-check` | `drip-rate`, `conc-rate`, `electrolyte-replacement` | Those compute a rate; none compares the rate and concentration with the label's stated limits |
| `iv-phosphate-order-check` | `electrolyte-replacement` (Brown 2006 dose bands) | Label dose bands, the potassium or sodium that rides along, and the label's concentration and rate limits by age and line |
| `lipid-emulsion-dose-check` | `tpn-macro` (lipid kcal), `last-lipid` (rescue dose) | Product- and age-specific label maximums in g/kg/day and mL/kg/hour, and hang time |
| `pn-amino-acid-order` | `icu-nutrition-target` (ASPEN/SCCM ranges) | Label protein table by age, nitrogen from the product's own factor, product volume, cysteine additive volume |
| `pn-order-summary` | `tpn-macro`, `gir` | Per-kg totals, GIR from the PN, energy share, non-protein kcal per gram of nitrogen, label ceilings |
| `pn-aluminum-load` | none | New |
| `pn-calcium-phosphate-check` | `calcium-phosphate-product` (serum Ca × P in CKD) | Concentrations in the bag against the site's own solubility limit; unrelated to the serum product |
| `pn-micronutrient-volume` | none | New |
| `premixed-pn-rate-check` | `tpn-macro` | Label maximum mL/kg/hour per premixed formulation |
| `in-use-discard-time` | `compounding-bud` (BUD of a preparation), `days-supply` (uses a discard limit) | The clock for an opened stock container, not a compounded preparation |
| `hazardous-drug-list-check` | `niosh-lifting` (ergonomics) | Unrelated |
| `mean-kinetic-temperature` | none | New |
| `storage-excursion-summary` | `newborn-temperature-who` (patient temperature) | Unrelated |
| `cleanroom-class-check` | none | New |
| `room-air-changes` | none | New |

## Tools

Group Q for all 17. `iv-label-rate-check` and `iv-phosphate-order-check` sit closest to the group F
medication tools; the integrator may prefer F for those two.

**Shared rule for label numbers.** Every label value below is a label row under the label-edition
contract in [spec-v1628](spec-v1628.md) §1, which says which label is pinned, how an edition is
dated and watched, and when a row stops answering. This file does not restate that scheme. Each
label is cited here as set id, SPL version and DailyMed published date, as read on
October 10, 2026. When a row has stopped answering, the tool asks the reader for the label's
figure and compares against that. The tools report what the label states; none says what to give.

### 1. `reconstitution-concentration` — Reconstitution: Powder Volume and Resulting Strength

This is the one tool for reconstitution arithmetic in the program: injectable vials and pharmacy
bulk packages, and oral or topical products that are reconstituted (for example antibiotic powders
for oral suspension). [spec-v1629](spec-v1629.md) points here.

**Input.** Drug amount in the container (mg, g, units); the diluent volume the label states (mL);
and one of: the label's resulting concentration, the label's final volume, or a powder
displacement volume (mL). Then, optionally, the diluent volume the reader intends to use or the
concentration wanted, and an ordered dose.
**Compute.** Volume balance. Powder (displacement) volume = label final volume − label diluent
volume; when the label gives a concentration instead, final volume = amount ÷ concentration.
With a different diluent volume: new final volume = new diluent + powder volume, and new
concentration = amount ÷ new final volume. Reverse: diluent for a wanted concentration = amount ÷
wanted concentration − powder volume. Volume for a dose = dose ÷ concentration.
**Output.** Powder volume, final volume, concentration, the draw-up or dose volume, and the
arithmetic.
**Source.** Arithmetic identity ([spec-v1628](spec-v1628.md) §2). The label's own reconstitution
table supplies the figures for each product; the tool ships no displacement values. Worked
examples from labels read:
- Ceftriaxone for injection (Hikma, set id 8351aa37-552d-471d-b293-c564dcb6ec29): 1 g + 9.6 mL
  gives about 100 mg/mL (final 10 mL, displacement 0.4 mL); 1 g + 3.6 mL gives about 250 mg/mL.
- Vancomycin pharmacy bulk package (Hospira, set id b01aaa02-8f1d-4b57-96a5-337503428af1): 10 g +
  95 mL gives 500 mg/5 mL (final 100 mL, displacement 5 mL); 5 g + 100 mL gives 500 mg/10 mL.
- Amoxicillin for oral suspension, Table 3 (Teva, set id 4c0f348a-a65d-409c-8668-207c82a5e3cb,
  version 37, published November 17, 2025): 250 mg/5 mL in a 100 mL bottle takes 60 mL of water,
  so the powder occupies 40 mL. The same table gives 47 mL for the 80 mL bottle and 90 mL for the
  150 mL bottle, and 39, 57 and 75 mL for the 50, 75 and 100 mL bottles of 200 mg/5 mL.
**Rule.** With no label concentration, final volume or displacement entered, the tool refuses: it
never assumes the powder takes no space. It warns that displacement is not constant across
concentrations (ceftriaxone 1 g + 2.1 mL gives 350 mg/mL, which implies about 0.76 mL).
**Note.** The page says a label's stated diluent volume is the manufacturer's instruction, and
that the tool only reports what a different volume would yield.

### 2. `admixture-concentration` — What Is Actually in the Bag

**Input.** Nominal bag volume; overfill (mL, reader input, blank allowed); volume withdrawn before
adding; each additive's amount and volume; optionally a baseline content already in the bag (for
example potassium 4 mEq/L in a 5 L replacement-fluid bag). Optionally a target concentration.
**Compute.** Final volume = nominal + overfill − withdrawn + additive volumes. Final concentration
= (baseline amount + added amount) ÷ final volume. It also reports the concentration on the nominal
volume and the percent difference. Solving the other way: the additive volume that reaches a target
concentration, and the volume to withdraw so the final volume equals nominal.
**Output.** Both concentrations, final volume, and the arithmetic.
**Source.** Arithmetic on reader-entered values; the tool supplies no number. It covers dialysis and
CRRT bag additions through the baseline field.
**Note.** No overfill table ships. Two documents that quote Baxter disagree (25 mL and 21 mL for a
250 mL bag), and no manufacturer page was opened; overfill is reader input
([spec-v1628](spec-v1628.md) §2), taken from the manufacturer. With overfill blank the result is labeled "nominal volume only."

### 3. `iv-label-rate-check` — IV Rate and Concentration Against the Label

**Input.** Drug (from the list below), dose, final volume, infusion time (or rate), weight and
adult/pediatric where the label uses them, peripheral or central where the label uses it.
**Compute.** The order's delivery rate and concentration in the label's units, compared with:

| Drug | Label limit | Label read (DailyMed set id, version, published) |
|---|---|---|
| Phenytoin sodium | Not over 50 mg/min in adults; pediatric 1 to 3 mg/kg/min or 50 mg/min, whichever is slower. Diluted in normal saline to no less than 5 mg/mL; infusion completed within 1 to 4 hours | 43060ca9-58a7-3371-e063-6294a90a5799, version 1, November 24, 2025 |
| Fosphenytoin (Cerebyx) | Not over 150 mg PE/min in adults; pediatric 2 mg PE/kg/min or 150 mg PE/min, whichever is slower (pediatric maintenance 1 to 2 mg PE/kg/min or 100 mg PE/min). Diluted to 1.5 to 25 mg PE/mL | d4c36fad-0ba2-4cd4-9c5e-dcf843f38a5a, version 38, August 29, 2025 |
| Vancomycin | Adults: no more than 10 mg/min or at least 60 minutes, whichever is longer; no more than 5 mg/mL (up to 10 mg/mL in fluid restriction, with the label's caution). Pediatric patients: each dose over at least 60 minutes; neonates over 60 minutes | b01aaa02-8f1d-4b57-96a5-337503428af1, version 19, July 22, 2026 |
| Potassium chloride | Serum K above 2.5 mEq/L: not over 10 mEq/hour, up to 40 mEq/L (concentrate label), 200 mEq per 24 hours. Urgent (K under 2 mEq/L with ECG changes or paralysis): up to 40 mEq/hour, 400 mEq per 24 hours, with continuous monitoring. Premixed 300 and 400 mEq/L: central route only | 559a0a8c-a8fe-40a5-b196-21f9308780ab, version 23, July 6, 2026; eb56a807-ea94-4edb-9811-a04b19568468, version 10, June 29, 2026 |
| Magnesium sulfate 50% | IV rate generally not over 150 mg/minute; diluted to 20% or less before IV infusion | 5a0f9db9-b8be-c923-e063-6394a90a7dd7, version 1, August 31, 2026 |
| Calcium gluconate | Bolus not over 200 mg/minute in adults, 100 mg/minute in pediatric patients; bolus diluted to 10 to 50 mg/mL; continuous infusion 5.8 to 10 mg/mL | 16307c00-d0d5-4e05-821f-17b0c1a29fc9, version 5, September 18, 2026 |

**Output.** Rate and concentration in label units, each marked "within the label's limit" or "above
it" with the label sentence paraphrased and linked, and the shortest infusion time that meets it.
**Scope.** Six drugs with a numeric limit read on the label. The magnesium label's sentence is
"should generally not exceed 150 mg/minute ... except in severe eclampsia with seizures"; the tool
states the exception and does not rule on it. The potassium premix label words its rate as "should
not usually exceed." Potassium phosphates is tool 4.
**Build gate on the pinned labels.** The phenytoin label read is distributed by ProPharma
Distribution and the magnesium label by Medical Purchasing Solutions. Under
[spec-v1628](spec-v1628.md) §1 a repackager's or relabeler's set id is never pinned; before
shipping, read the same sentences on a manufacturer's label for each and pin that set id.

### 4. `iv-phosphate-order-check` — IV Phosphate: Dose, Cation Load, Concentration and Rate

**Input.** Salt (potassium or sodium phosphates), phosphorus dose (mmol, or mmol/kg with weight),
age band, final volume, infusion time, peripheral or central line. Optionally serum phosphorus.
**Compute.**
- Volume = mmol ÷ 3 mmol/mL. Cation delivered: potassium 4.4 mEq/mL (1.47 mEq per mmol P) or sodium
  4 mEq/mL (1.33 mEq per mmol P).
- Potassium phosphates, from the label:
  - Initial or single dose by serum phosphorus (Table 2): 1.8 mg/dL to the lower end of the
    reference range, 0.16 to 0.31 mmol/kg; 1 to 1.7 mg/dL, 0.32 to 0.43 mmol/kg; under 1 mg/dL,
    0.44 to 0.64 mmol/kg; never over 45 mmol (potassium 66 mEq) as a single dose. The table's
    footnotes: the lower end of the reference range is 2.5 mg/dL at 12 months and older and
    4 mg/dL under 12 months; weight is actual body weight, and the label says to consider an
    adjusted weight for patients well above ideal body weight; in moderate renal impairment
    (eGFR 30 to under 60 mL/min/1.73 m²) start at the low end.
  - Maximum concentration (Table 1): age 12 and older, peripheral 6.8 mmol/100 mL
    (K 10 mEq/100 mL), central 18 mmol/100 mL (K 26.4 mEq/100 mL); under 12, peripheral
    0.27 mmol/10 mL (K 0.4 mEq/10 mL), central 0.55 mmol/10 mL (K 0.8 mEq/10 mL).
  - Maximum rate, age 12 and older (Table 3): peripheral 6.8 mmol/hour (K 10 mEq/hour), central
    15 mmol/hour (K 22 mEq/hour). The label prints no rate table for patients under 12. ECG monitoring and a central line above K 10 mEq/hour (20 kg or more) or
    0.5 mEq/kg/hour (under 20 kg).
  - Daily amount in PN (Table 4): under 12 months 2 mmol/kg/day; 1 to under 12 years
    1 mmol/kg/day up to 40 mmol/day; 12 and older 20 to 40 mmol/day.
**Output.** Volume, cation load, concentration and rate against the label rows, the binding row
named.
**Source.** Potassium Phosphates Injection label, 45 mmol/15 mL vial (Civica, set id
f7702b2f-d0d1-4696-896d-571607fc0dc8, version 2, published July 15, 2026; its SPL carries
application NDA212832). Sodium Phosphates Injection label (set id
8fd901e6-30cb-411a-b820-b9e79625ec7c, version 1, published August 14, 2025): 3 mmol P and
4 mEq Na per mL.
**Note.** The sodium phosphates label read is an older-format label with no dose, concentration or
rate tables and no stated maximum. It gives two amounts as prose: about 12 to 15 mmol of
phosphorus per liter of TPN solution containing 250 g of dextrose, and 1.5 to 2 mmol/kg/day for
infants on TPN. For sodium the tool reports volume and sodium, shows those two sentences as label
text, and says the label gives no concentration or rate limit.
**The "4 mEq/dL" sentence.** The potassium label says the product is only for a patient with a
serum potassium "less than 4 mEq/dL." The same wording was read on three other potassium
phosphates labels on October 10, 2026 (Fresenius Kabi ready-to-use, set id
357c3020-ea6f-4401-a2e7-cebb82b03144, NDA212832; Hospira, set id
2fcbc814-c7a4-469a-8b1d-6819b961bfb9; and set id 41a85cca-c463-4f39-9335-177b04c290a9), so it is
the labels' wording and not one manufacturer's misprint. The tool quotes the sentence as printed,
takes the reader's potassium in mEq/L, compares the number with 4, and says on the page that the
label prints the unit as mEq/dL.

### 5. `lipid-emulsion-dose-check` — Lipid Emulsion Dose and Rate Against the Label

**Input.** Product, age band, weight, ordered lipid (g, g/kg/day, or mL), infusion hours, whether it
runs by Y-site or inside an admixture, and optionally total daily kcal.
**Compute.** g/kg/day, mL/kg/hour and g/kg/hour, compared with the label:

| Product (g/mL, kcal/mL) | Birth to under 2 y | 2 to under 12 y | 12 to 17 y | Adults | Max rate |
|---|---|---|---|---|---|
| Intralipid 20% (0.2, 2.0) | start 0.5, max 3 g/kg/day | start 1 to 2, max 2.5 | start 1, max 2 | 1 (stable), 1 or less (critically ill), max 2.5; no more than 500 mL on day 1 | 0.75 mL/kg/hour pediatric, 0.5 adult |
| SMOFlipid (0.2, 2.0) | start 0.5 to 1, max 3 | start 1 to 2, max 3 | start 1, max 2.5 | 1 to 2, max 2.5 | 0.75 pediatric, 0.5 adult |
| Clinolipid (0.2, 2.0) | start 0.5 to 1, max 3 | start 1 to 2, max 3 | start 1, max 3 | 1 to 1.5, max 2.5 | 0.75 pediatric, 0.5 adult |
| Omegaven (0.1, 1.12) | 1 g/kg/day, which is also the maximum (pediatric only) | same | same | not labeled | 1.5 mL/kg/hour |
| Intralipid 30% (0.3, 3.0) | admixture only; start 0.5, max 3 | start 1 to 2, max 2.5 | start 1, max 2 | 1 (stable), 1 or less (critically ill), max 2.5 | not for direct infusion; diluted to 20%, not over 0.125 g/kg/hour |

Also: lipid kcal as a share of total kcal against the labels' "not exceed a maximum of 60% of
total energy requirements" (Intralipid, SMOFlipid, Clinolipid), when total kcal is entered; and
the hang-time limit on the Intralipid 20%, SMOFlipid and Omegaven labels: complete the infusion
within 12 hours by Y-connector and within 24 hours inside an admixture. The Clinolipid label
prints no Y-connector limit; it gives a recommended infusion duration for a PN bag of 12 to
24 hours (20 to 24 hours for neonates), and the tool shows that sentence instead.
**Output.** Each figure against its label row, with the product's set id and date.
**Source.** DailyMed (set id, version, published): Intralipid 20%
(61e025f1-a38e-4af2-9e18-13ea12977cf5, 3, November 27, 2025), Intralipid 30%
(98460eae-5195-48d2-ab73-00d276879ef6, 4, November 19, 2025), SMOFlipid
(e0e9d917-ff6f-488e-a6a8-0ad59dd17d80, 11, September 17, 2025), Omegaven
(5d9d0b24-e139-48bf-ab2d-536fb59cf8e0, 6, September 29, 2025), Clinolipid
(ae98eb03-c0e7-49d1-b024-77968e3d9d6e, 24, June 11, 2026).
**Note.** Among Intralipid, SMOFlipid and Clinolipid the maximum is the same from birth to under
2 years (3 g/kg/day) and in adults (2.5 g/kg/day) and differs in the two bands between: 2.5, 3
and 3 g/kg/day at 2 to under 12 years, and 2, 2.5 and 3 g/kg/day at 12 to 17 years. A generic
"3 g/kg/day" pediatric check would be wrong for Intralipid at ages 2 to 17 and for SMOFlipid at
12 to 17. Omegaven's single figure is 1 g/kg/day. Initial rates (0.1 to 0.4 mL/kg/hour for the
first 10 to 30 minutes) are shown as label text, not checked.

### 6. `pn-amino-acid-order` — PN Amino Acids: Dose, Nitrogen, Volume and Cysteine

**Input.** Product, age band, weight, amino acids ordered (g/kg/day or g/day); whether cysteine is
added.
**Compute.**
- g/kg/day against the label table (Travasol 10%): adults stable 0.8 to 1.0, critically ill 1.5 to
  2.0; under 1 month 3 to 4; 1 month to under 1 year 2 to 3; 1 to 10 years 1 to 2; over 10 to under
  17 years 0.8 to 1.5. Renal impairment not on dialysis 0.6 to 0.8 (shown as label text).
- Nitrogen = grams × the product's label factor: Travasol 10% 0.0165 g N/mL (1.65 g/100 mL);
  Prosol 20% 0.032 g N/mL (3.21 g/100 mL); TrophAmine 10% 15.5 g N/L. Other products: reader enters
  the label's nitrogen.
- Product volume = grams ÷ label concentration; mL/kg/day against the Travasol adult cap of
  40 mL/kg/day (the Prosol label prints the same cap).
- Cysteine (Elcys, cysteine hydrochloride 50 mg/mL): under 12 years 22 mg of Elcys per g of amino
  acids (0.44 mL/g), which the label equates to 15 mg of cysteine per g; 12 and older 7 mg per g
  (0.14 mL/g), 5 mg of cysteine per g.
**Output.** Dose against the label band, nitrogen in grams, product mL, Elcys mL.
**Source.** DailyMed (set id, version, published): Travasol
(8543b5be-0f43-4891-9e56-d7c39fe839b5, 16, February 10, 2025); Prosol
(cc2ace81-5881-43f1-ba94-41b674adc2fc, 16, September 24, 2026); TrophAmine
(cb6d23ff-3ec5-445a-acbe-f88fd57949bf, 10, August 24, 2026); Elcys
(52317b38-b2e6-4a1c-b5b0-43cada0d205e, 3, April 10, 2026).
**Note.** Nitrogen is not grams ÷ 6.25 here. Travasol is 6.06 g of amino acids per g of nitrogen,
Prosol 6.23, TrophAmine 6.45; the tool uses the label's figure and says so.

### 7. `pn-order-summary` — PN Order per Kilogram, GIR, Energy and Calorie-to-Nitrogen Ratio

**Input.** Weight; dextrose (g, or % and volume); amino acids (g) and the nitrogen from tool 6 or
the label; lipid product and grams; infusion hours; total volume.
**Compute.**
- g/kg/day for each macronutrient; mL/kg/day.
- GIR (mg/kg/min) = dextrose g × 1,000 ÷ (weight × minutes infused). Dextrose g/kg/hour against the
  label statement that the maximum rate without glycosuria (ICU Medical) or hyperglycemia (Hospira
  50%) is 0.5 g/kg/hour, which is 8.3 mg/kg/min.
- kcal: dextrose (hydrous) 3.4 kcal/g; amino acids 4 kcal/g; lipid by product kcal/mL (2.0 for the
  20% emulsions, 3.0 for Intralipid 30%, 1.12 for Omegaven). Total, kcal/kg/day, percent from each.
- Non-protein kcal per g of nitrogen = (dextrose kcal + lipid kcal) ÷ nitrogen g.
**Output.** The table of totals with each factor's source. No target band for the calorie-to-nitrogen
ratio: no primary source read gives one, and the tool says so.
**Source.** Dextrose label, ICU Medical (cb578dba-094c-4787-951d-763d12fd06e1, version 16,
June 18, 2026):
"3.4 kcal/g of dextrose, hydrous," and the 0.5 g/kg/hour statement; that label also prints
"Non-Protein kcal/g N" for its admixtures. Dextrose 50%, Hospira
(4ed365da-4e62-4329-c1b9-c197ab4fb6e1, version 34, July 15, 2026). Clinimix E
(8469d6fb-d6ef-476f-8cc3-0905192de0a8, version 17, June 8, 2026): 110 kcal/L from 27.5 g/L of
amino acids, 170 from 42.5, 200 from 50 and 320 from 80, which is 4 kcal/g in every column; the
same table gives 170 kcal/L from 5% dextrose, which is 3.4 kcal/g. Lipid labels as in tool 5.
**Not a duplicate of `tpn-macro`.** That tool turns volume and percent into grams and kcal with a
fixed 2 kcal/mL lipid and no weight. This one starts from the order and the weight.

### 8. `pn-aluminum-load` — Aluminum in a PN Order (21 CFR 201.323)

**Input.** Weight, and for each component its volume in the daily bag and the aluminum figure on its
container label (mcg/L, "contains no more than __ mcg/L"). Large-volume parenterals default to
25 mcg/L, editable.
**Compute.** Aluminum per component = volume (L) × label mcg/L. Sum, then mcg/kg/day. The result is
compared with the regulation's warning: accumulation at more than 4 to 5 mcg/kg/day in patients
with impaired kidney function, including premature neonates.
**Output.** Total mcg/day and mcg/kg/day, each component's share ranked, and the band: at or under
4, between 4 and 5, over 5 mcg/kg/day.
**Source.** 21 CFR 201.323(a) (large-volume parenterals for TPN must not exceed 25 mcg/L), (c) and
(d) (the container statement for small-volume parenterals and pharmacy bulk packages is the maximum
at expiry), (e) (the 4 to 5 mcg/kg/day warning). Examples of label figures read: Potassium
Phosphates 900 mcg/L, Elcys 120 mcg/L, Dextrose 50% up to 600 mcg/L, Tralement 6,000 mcg/L,
Multrys 1,500 mcg/L, and 25 mcg/L for the lipid emulsions, Travasol, Prosol and TrophAmine.
**Note.** The result is an upper bound, because each label states the maximum at expiry; the tool
says "no more than." The Potassium Phosphates, Tralement and Multrys labels add that total
exposure from the admixture "should be considered and maintained at no more than 5 mcg/kg/day."
The tool shows the regulation's warning and that label sentence as cited text and states neither
as a rule for the reader's patient.

### 9. `pn-calcium-phosphate-check` — Calcium and Phosphate Concentrations in the Bag

**Input.** Final volume; calcium (mEq, or mL of calcium gluconate 10%); phosphate (mmol, or mL of
potassium or sodium phosphates); amino acid grams; and the site's limit, entered by the reader
either as maximum calcium (mEq/L) at the ordered phosphate, or as a sum limit (mEq/L calcium +
mmol/L phosphate) from the reader's own curve or compounder software. The limit field starts
blank ([spec-v1628](spec-v1628.md) §2).
**Compute.** Calcium mEq/L (calcium gluconate 100 mg/mL = 0.465 mEq/mL) and phosphate mmol/L
(3 mmol/mL), the amino acid final percent, and the comparison with the reader's limit. Volume used
is the volume at the point of lowest dilution if the reader enters one.
**Output.** The two concentrations, their sum, and above or below the entered limit.
**Source.** Calcium Gluconate Injection label (0.465 mEq/mL) and Potassium/Sodium Phosphates labels
(3 mmol/mL). The Potassium Phosphates and Clinimix E labels state the hazard and that calcium
phosphate stability depends on pH, temperature and the relative concentration of each ion; neither
prints a limit.
**Rule.** No solubility curve ships. Curves are specific to the amino acid product, its
concentration, cysteine, pH and temperature, and no label read prints one. With no limit entered the
tool reports concentrations only and says it cannot judge. A result under the limit never says
"compatible."

### 10. `pn-micronutrient-volume` — Trace Element and Pediatric Multivitamin Volume by Weight

**Input.** Product and weight.
**Compute.**
- Tralement (per mL: zinc 3 mg, copper 0.3 mg, manganese 55 mcg, selenium 60 mcg): 50 kg or more,
  1 mL/day; 10 to 19 kg 0.2 mL; 20 to 29 kg 0.4 mL; 30 to 39 kg 0.6 mL; 40 to 49 kg 0.8 mL. Not
  indicated under 10 kg.
- Multrys (per mL: zinc 1,000 mcg, copper 60 mcg, manganese 3 mcg, selenium 6 mcg): 0.4 to 0.59 kg,
  0.2 mL every other day; 0.6 to under 10 kg, the label's Table 1: 0.6 to 0.8 kg 0.2 mL; 0.9 to
  1.1 kg 0.3 mL; 1.2 to 1.4 kg 0.4 mL; 1.5 to 1.7 kg 0.5 mL; 1.8 to 2 kg 0.6 mL; 2.1 to 2.3 kg
  0.7 mL; 2.4 to 2.6 kg 0.8 mL; 2.7 to 2.9 kg 0.9 mL; 3 to 9.9 kg 1 mL. The label's sentence is
  "0.3 mL/kg/day rounded to the nearest 0.1 mL for up to a maximum of 1 mL per day." The table and
  the sentence disagree at band edges (at 2.7 kg the sentence gives 0.8 mL and the table 0.9 mL;
  at 3 kg, 0.9 mL and 1 mL). The tool returns the table's volume, shows the sentence's result
  beside it when the two differ, and names the difference.
- Shortfall against the labels' daily amounts: zinc 50 mcg/kg/day up to 3,000 mcg (Tralement);
  zinc 400 mcg/kg/day under 3 kg, 250 at 3 to 5 kg, 100 at 5 to 10 kg (Multrys); copper
  20 mcg/kg/day (up to 300 mcg); selenium 2 mcg/kg/day (up to 60 mcg); manganese 1 mcg/kg/day (up
  to 55 mcg), with the label's instruction not to add manganese.
- Infuvite Pediatric (up to 11 years): under 1 kg, 1.2 mL of Vial 1 and 0.3 mL of Vial 2 (1.5 mL
  combined from the bulk package); 1 to under 3 kg, 2.6 mL and 0.65 mL (3.25 mL); 3 kg or more,
  4 mL and 1 mL (5 mL).
**Output.** The volume, each element delivered in mcg, and the per-element gap the label says single
products may need to fill.
**Source.** DailyMed (set id, version, published): Tralement
(a49ffb90-f307-433e-a86e-aaea6d6a9982, 10, July 28, 2026); Multrys
(995f1efa-aca0-4b6c-9099-f8e757c2133a, 4, August 26, 2024); Infuvite Pediatric
(4ff223f7-e076-4e81-8151-5c06724fabd9, 7, August 20, 2025).

### 11. `premixed-pn-rate-check` — Premixed PN Bag: Maximum Rate by Formulation

**Input.** Formulation, weight, ordered rate (mL/hour) or volume and hours.
**Compute.** mL/kg/hour against the label's adult maximum, and the amino acid and dextrose
g/kg/hour that rate delivers.
- Clinimix E adult maximums (mL/kg/hour): 2.75/5, 3.6; 4.25/5, 2.4; 4.25/10, 2.4; 5/15, 1.67;
  5/20, 1.25; 8/10, 1.3; 8/14, 1.3. Central vein only: 4.25/10, 5/15, 5/20, 8/10, 8/14.
- Clinimix (no electrolytes) adult maximums: 4.25/5, 2.4; 4.25/10, 2.4; 5/15, 1.67; 5/20, 1.25;
  6/5, 1.67; 8/10, 1.3; 8/14, 1.3. Central vein only: 4.25/10, 5/15, 5/20, 8/10, 8/14.
- Kabiven: 2.6 mL/kg/hour (the label names dextrose, 0.28 g/kg/hour, as the rate-limiting
  factor), no more than 40 mL/kg/day in adults, central vein only.
**Output.** Rate against the maximum, the nutrient rates, the route statement.
**Source.** DailyMed (set id, version, published): Clinimix E
(8469d6fb-d6ef-476f-8cc3-0905192de0a8, 17, June 8, 2026); Clinimix
(dccff103-8695-400c-a15d-cc2fd078760a, 14, June 5, 2026); Kabiven
(afeb4837-a759-4484-a76e-e04611c459e7, 9, October 6, 2025).
**Scope.** Adult maximums only; the labels give pediatric dosing by protein, not a rate table.
Perikabiven was not read and is not included.

### 12. `in-use-discard-time` — Opened Container: When to Discard

**Input.** Container type, date and time opened or first punctured, the manufacturer's expiration
date, and the label's in-use limit when the label states one.
**Compute.** Discard time = opened time + limit, never later than the expiration date.
- Multi-dose vial: 28 days unless the manufacturer states another date for the opened vial.
- Pharmacy bulk package: the label's limit; 4 hours after the closure is penetrated on every
  bulk-package label read (Intralipid 20% and 30%, SMOFlipid, Clinolipid, calcium gluconate).
- Label-stated in-use period (reader input): for example Lantus vial 28 days, Tresiba 56 days.
- Lipid emulsion once spiked: 12 hours by Y-connector, 24 hours in an admixture (Intralipid 20%,
  SMOFlipid, Omegaven; the Clinolipid label prints no such limit, see tool 5).
- Single-dose vial: CDC says not to retain it for future use and not to pool or store leftover
  contents; the tool returns "discard after the single use," not a time.
- Multi-dose vaccine vials are out of scope: CDC sends the reader to its storage toolkit or the
  manufacturer.
**Output.** The discard date and time and which limit set it.
**Source.** CDC, "Preventing Unsafe Injection Practices" (page dated March 26, 2024). Its
sentence, which it attributes to USP General Chapter 797: once a multi-dose vial is opened (for
example needle-punctured) it "should be dated and discarded within 28 days unless the manufacturer
states another date for that opened vial," and the date "should never exceed the manufacturer's
original expiration date." The labels named.
**Not a duplicate.** `compounding-bud` dates a compounded preparation; `days-supply` takes a discard
limit as an input to a supply count. `out-of-fridge-discard-date` in
[spec-v1639](spec-v1639.md) is the patient-facing clock: it holds the label's room-temperature
and in-use limits for named products a patient takes home. This tool is the pharmacy and nursing
stock clock by container type, and takes any product's label limit as reader input.
**Build gate (two rows).** The USP <797> limits for a single-dose container opened in ISO 5 air
and for immediate-use preparations were not found in any free document on October 10, 2026, and
no figure for either is stated in this file. They stay out until a shippable source is read (see
Verify at build).

### 13. `hazardous-drug-list-check` — Is This Drug on the NIOSH Hazardous Drug List?

**Input.** A drug name, or a pasted or uploaded formulary list (one generic name per line).
**Compute.** Exact match on generic name against the NIOSH 2024 list. For a hit: Table 1 or
Table 2 and whether it is under a biologics license application. For Table 1, also whether the
package insert carries manufacturer's special handling information (MSHI) and the IARC and NTP
classification NIOSH printed. For Table 2 (whose drugs by definition have no MSHI and whose table
has no IARC/NTP column), whether NIOSH marks the drug as only a developmental or reproductive
hazard. For a list: the hits, the misses, and
counts by table.
**Output.** The classification and the table definition in our own words. A miss reads "not on the
2024 list," with the caveat below.
**Source.** NIOSH List of Hazardous Drugs in Healthcare Settings, 2024, DHHS (NIOSH) Publication
No. 2025-103, December 2024. The document states it "is in the public domain and may be freely
copied or reprinted."
**Why this passes admission rule 1 ([spec-v1500](spec-v1500.md)).** It takes a drug or a formulary
and decides one question, the shape of `substitution-check`. The batch mode is the real work: screening a formulary file. It does not
display the list.
**Rules.**
- The AHFS classification column is not shipped (AHFS is on the licensing blocklist). The dataset
  is `data/niosh-hazardous-drugs/` in [spec-v1628](spec-v1628.md) §3.
- A miss is not "not hazardous." The 2024 list reviewed drugs approved or given new FDA safety
  warnings from January 2014 through December 2015, plus drugs with MSHI that NIOSH added as it
  became aware of them. The tool says this on every miss.
- No handling or containment requirement is stated; those are USP <800> text and the site's own
  assessment of risk.
- Route B ([spec-v1501](spec-v1501.md) §2): edition "2024 (December 2024)", page watch on the
  NIOSH publication page. The document names its earlier editions as 2010, 2012, 2014 and 2016
  and says the 2024 list supersedes them. The tool shows the edition on every result and has no
  calendar expiry, because NIOSH publishes no schedule.

### 14. `mean-kinetic-temperature` — Mean Kinetic Temperature of a Storage Log

**Input.** Temperature readings at equal intervals (typed, pasted, or a data-logger CSV), °C or °F;
activation energy (kJ/mol), prefilled 83.144 and editable.
**Compute.** MKT (K) = (Ea/R) ÷ (−ln((Σ e^(−Ea/(R·Tᵢ))) ÷ n)), Tᵢ in kelvin, R = 0.0083144
kJ/(mol·K); reported in °C and °F. Also the arithmetic mean, minimum, maximum and n.
**Output.** MKT with the inputs and the activation energy used. No pass/fail band unless the reader
enters the product's labeled limit.
**Source.** ICH Q1A(R2), glossary: the definition, and "the formula of J. D. Haynes (J. Pharm. Sci.,
60:927-929, 1971) can be used." The formula (its equation 1), R = 0.0083144 kJ/(mol·K) and the
83.144 kJ/mol default as printed in an open-access paper (Jenkins, BMC Public Health 2022,
PMC8842539), which uses the default on the assumption "that stability data was unknown or
unavailable from the product's manufacturer."
**Owner.** This is the program's one mean kinetic temperature tool;
[spec-v1629](spec-v1629.md) points here.
**Rules.** Unequal intervals are refused (the formula assumes equal weights) unless the reader
supplies durations, in which case each term is time-weighted. The tool says MKT does not decide
whether a product is usable after an excursion and is not a method for vaccines.

### 15. `storage-excursion-summary` — Temperature Log: Excursions and Time Out of Range

**Input.** Readings with timestamps (typed or logger CSV); the storage range: refrigerator 2°C to
8°C (36°F to 46°F), freezer −50°C to −15°C (−58°F to +5°F), ultra-cold −90°C to −60°C (−130°F to
−76°F), or a range the reader enters from the package insert.
**Compute.** Each excursion's start, end, duration, and lowest or highest reading; total time above
and below range; any reading at or below 0°C in a refrigerator log flagged separately.
**Output.** The excursion table and a report with the fields CDC lists for the event record (date
and time, unit temperature with minimum and maximum, duration), as text and CSV. It ends with CDC's
instruction: label the product "do not use," keep it at the correct temperature, do not discard, and
get the manufacturer's or immunization program's determination.
**Source.** CDC Vaccine Storage and Handling Toolkit, July 2026 edition.
**Rule.** The tool never says a product is still usable. The toolkit says any reading outside the
package-insert range is an excursion and that manufacturers decide viability. Route B
([spec-v1501](spec-v1501.md) §2): the three
ranges are dated constants with a page watch on the toolkit page; the toolkit notes one frozen
vaccine with a narrower range, which is why the reader-entered range exists. The 0°C flag follows
the toolkit's statement that freezing temperatures (0°C [32°F] or colder) can destroy the potency
of refrigerated vaccines; it is a flag, not a verdict.

### 16. `cleanroom-class-check` — Particle Count and Microbial Sample Against the FDA Table

**Input.** Particle count at 0.5 µm and larger (per m³ or per ft³); optionally an active air sample
(cfu/m³) or a 90 mm settling plate (cfu per 4 hours) and the area's intended class.
**Compute.** The count is compared in the unit entered, because FDA's table pairs each per-ft³
class with a rounded per-m³ figure (100/ft³ with 3,520/m³). The cleanest class the count meets:
ISO 5, 3,520/m³
(Class 100); ISO 6, 35,200 (Class 1,000); ISO 7, 352,000 (Class 10,000); ISO 8, 3,520,000
(Class 100,000). Microbial result against the recommended action level: active air 1, 7, 10,
100 cfu/m³; settling plates 1, 3, 5, 50 cfu per 4 hours for ISO 5 through 8.
**Output.** The class met, and the sample at, under or over the action level, with the table's
footnotes: classifications are based on data measured near exposed materials during periods of
activity, values are recommended levels, settling plates are optional, and ISO 5 samples should
normally yield no contaminants.
**Source.** FDA, Guidance for Industry: Sterile Drug Products Produced by Aseptic Processing,
Current Good Manufacturing Practice (September 2004), Table 1.
**Scope.** This is the FDA cGMP table, which governs outsourcing facilities and manufacturers. The
tool says a pharmacy under USP <797> has that chapter's own action levels, which are not shipped.

### 17. `room-air-changes` — Air Changes per Hour and Clearance Time

**Input.** Supply or exhaust airflow (CFM or m³/hour) and room dimensions or volume; optionally a
required ACPH (reader input).
**Compute.** ACPH = airflow (CFM) × 60 ÷ volume (ft³). Minutes to remove 99% and 99.9% of airborne
contaminant = −ln(C₂/C₁) ÷ ACPH × 60 (for example 12 ACPH: 23 and 35 minutes). Airflow needed to
reach the required ACPH.
**Output.** ACPH, the two clearance times, and the comparison with the reader's requirement. Two
reference points are shown as text: FDA's "at least 20 air changes per hour is typically
acceptable" for Class 100,000 (ISO 8) supporting rooms, and CDC's 12 total ACH for an airborne
infection isolation room.
**Source.** CDC Guidelines for Environmental Infection Control in Health-Care Facilities,
Appendix B, Table B.1 and its formula (page dated January 11, 2024); FDA aseptic processing
guidance (2004).
**Note.** CDC's times assume an empty room with no aerosol source and perfect mixing; the tool
repeats that.
**Licensing.** Table B.1 and its formula are CDC's. The 12 ACH isolation-room figure is one row of
Table B.2, which CDC reprints from the 2001 AIA guidelines with permission. The tool cites that
one figure to the CDC page and ships no part of the table.

## Backfills (live tools that should do more)

| Live tool | Backfill | Source |
|---|---|---|
| `iv-osmolarity` | (a) A component mode: mOsm/L and volume of each component from its label, giving a volume-weighted osmolarity; the current formula omits lipid, calcium, magnesium and phosphate. (b) Cite the 900 mOsm/L central-vein threshold to FDA labels, which state it outright (Intralipid, SMOFlipid, Omegaven, Travasol, Prosol, Elcys, Clinimix E, Potassium Phosphates). (c) Show the TrophAmine statement that a peripheral pediatric solution "should not exceed twice normal serum osmolarity (718 mOsmol/L)." | Labels in tools 5 and 6; label osmolarities read: Intralipid 20% 260, Intralipid 30% 200, SMOFlipid 270, Omegaven 273, Clinolipid 260, Travasol 10% 998, Prosol 20% 1,835, TrophAmine 10% 866 mOsm/L |
| `tpn-macro` | Replace the "standard nutrition references" citation (`data/tpn-rules`, `sourceUrl: null`) with the labels; take the lipid product so 30% (3 kcal/mL) and Omegaven (1.12 kcal/mL) are right; drop or source `typicalGoalsPerKgPerDay` and `maxConcentrationsPeripheral` (no primary source found for 12.5% dextrose or 5% amino acids) | Tool 7 sources |
| `gir` | Add the adult label statement (0.5 g/kg/hour = 8.3 mg/kg/min) beside the neonatal bands | Dextrose labels |
| `vial-rounding` | A batch mode: number of doses × dose, plus a per-unit overfill or hub loss the reader enters, giving total vials and leftover. Covers syringe and batch compounding yield | Arithmetic; no new number |
| `rate-escalation-schedule` | A cyclic PN mode: total volume and hours with a reader-defined ramp up and ramp down, solving the plateau rate so the volume comes out exact | Travasol label §2.8 (consider "a gradual decrease in flow rate in the last hour"); the step sizes are reader input |
| `unit-converter` | Pressure: pascals to inches of water (1 in. w.c. = 249.09 Pa; factor to be read in NIST SP 811 at build), with FDA's "at least 10-15 Pascals" between rooms of different class and CDC's 0.01 in. w.g. (2.5 Pa) as cited text | FDA 2004 guidance; CDC Appendix B, Table B.2 note (a figure from the AIA table CDC reprints with permission; cite, do not reproduce the table) |
| `compounding-bud` | Immediate-use and single-dose-container limits, only once a free USP document that states them is read | See Verify at build |
| `electrolyte-replacement`, `calcium-replacement` | The FDA label now gives phosphate dose bands by serum level (tool 4) and calcium gluconate dose and rate tables; the live ladders cite Brown 2006 and "institutional conventions" | Labels in tools 3 and 4 |

## Rejected

| Idea | Why not |
|---|---|
| A bag overfill table by manufacturer and size | No manufacturer document was opened; two hospital documents quoting Baxter disagree (25 mL and 21 mL for 250 mL). Two sources that disagree means skip. Overfill is reader input in tool 2 |
| Rule of six for pediatric infusions | Safety bodies moved hospitals to standard concentrations; a tool that manufactures patient-specific concentrations works against that, and no primary source supports shipping it |
| A pediatric standard-concentration list | A list, not a computation; the published lists are ASHP and ISMP material |
| Calcium-phosphate solubility curves | Product-specific and not printed on any label read; a shipped generic curve would be wrong for most formulas. Tool 9 takes the site's limit |
| PN electrolyte and macronutrient "normal ranges" per kg | The usual tables are ASPEN guideline text. Tools 5, 6 and 4 use the label ranges that exist; no label range was found for sodium, chloride or acetate |
| A target band for non-protein calories per gram of nitrogen | No primary source read gives one; tool 7 reports the ratio without a band |
| PN-to-enteral transition schedule | No primary source gives a formula; it is clinical judgment |
| Elastomeric and syringe pump rate math | `drip-rate` and `infusion-time-remaining` already do rate = volume ÷ time; device residual volume is a figure from the device's instructions |
| Filter and tubing priming loss | Residual volume × concentration; both numbers are reader input and there is no source to cite. One line of help text in tool 2 at most |
| Dialysis and CRRT fluid additive calculator | Covered by tool 2's baseline-content field |
| Preservative-free checks for intrathecal or ophthalmic use | Needs a product database or a judgment about a label; not a computation |
| USP <797> air-change, pressure, media-fill and gloved-fingertip limits | USP chapter text and numbers with no free USP source read. Tools 16 and 17 use FDA and CDC documents and say which regime they describe |
| The full ISO 14644-1 class table and formula | ISO standard, sold under license. The four classes FDA reprinted in its guidance are enough for tool 16 |
| USP <800> containment requirements by NIOSH table | USP text; and the 2024 NIOSH list no longer maps to the old three groups |
| Controlled room temperature classifier | The definition with excursions and an MKT ceiling is USP's; ICH Q1A(R2) defines storage test conditions, not a pharmacy storage rule. MKT itself is tool 14 |
| Insulin in-use days table by product | A lookup that drifts with every label; `days-supply` and tool 12 take the label's figure as input |
| Y-site and admixture compatibility | A licensed database problem, not a computation |
| A separate "volume to withdraw for a dose" tool | `dose-volume` is live |
| Sodium phosphate rate and concentration limits | The sodium phosphates label read has none; carrying the potassium limits over would invent a rule |
| A separate oral-powder reconstitution tool (`powder-volume-reconstitution`) | Same arithmetic as tool 1; merged there |

## Research record

| Finding | Where read | Effect on the spec |
|---|---|---|
| 21 CFR 201.323: LVP limit 25 mcg/L (a); SVP/PBP label states the maximum at expiry (c), or "no more than 25 mcg/L" (d); warning text with "greater than 4 to 5 µg/kg/day" (e) | https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-21?part=201&section=201.323 | Tool 8; result is an upper bound |
| Lipid maximums differ by product and age; Intralipid 20% 3 / 2.5 / 2 / 2.5 g/kg/day, SMOFlipid 3 / 3 / 2.5 / 2.5, Clinolipid 3 / 3 / 3 / 2.5, Omegaven 1 | DailyMed SPL XML, https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{setid}.xml for the five set ids in tool 5 | Tool 5 is product-specific, not one generic limit |
| Energy: Intralipid 20%, SMOFlipid, Clinolipid 2,000 kcal/L; Intralipid 30% 3,000 kcal/L; Omegaven 1.12 kcal/mL | Same labels | Tool 7; `tpn-macro` backfill |
| "Not exceed a maximum of 60% of total energy requirements"; hang time 12 hours by Y-connector, 24 hours in an admixture; bulk package 4 hours after penetration | Intralipid, SMOFlipid, Clinolipid labels (Omegaven: 12 and 24 hours) | Tools 5 and 12 |
| 900 mOsm/L or greater must go through a central vein | Intralipid, SMOFlipid, Omegaven, Travasol, Clinimix E, Potassium Phosphates labels | `iv-osmolarity` backfill gets a primary source |
| Travasol protein table, 0.0165 g N/mL, 40 mL/kg/day adult cap; Prosol 0.032 g N/mL; TrophAmine 15.5 g N/L, 866 mOsm/L, 718 mOsm/L pediatric peripheral statement, 2 to 2.5 g/kg/day up to 10 kg | Travasol, Prosol, TrophAmine labels | Tool 6; nitrogen is not grams ÷ 6.25 |
| Elcys: 22 mg/g amino acids under 12 years (0.44 mL/g), 7 mg/g at 12 and older (0.14 mL/g); 120 mcg/L aluminum | Elcys label | Tool 6, tool 8 example |
| Dextrose: 3.4 kcal/g hydrous; maximum 0.5 g/kg/hour without glycosuria (ICU Medical) or hyperglycemia (Hospira 50%); 50% contains up to 600 mcg/L aluminum | Dextrose labels, set ids cb578dba… and 4ed365da… | Tool 7; `gir` backfill |
| Clinimix E: adult maximum rates per formulation; kcal/L rows matched to columns (110, 170, 170, 200, 200, 320, 320 from amino acids; 170, 170, 340, 510, 680, 343, 477 from dextrose), which is 4 kcal/g of amino acids and 3.4 kcal/g of dextrose | Clinimix E label | Tool 11; 4 kcal/g for tool 7 |
| Potassium Phosphates: 3 mmol P and 4.4 mEq K per mL; Tables 1 to 4; 45 mmol single-dose cap; 900 mcg/L aluminum; "4 mEq/dL" printed for the potassium cutoff | Potassium Phosphates label (Civica) | Tool 4 built on the label, not Brown 2006 |
| Sodium Phosphates: 3 mmol P and 4 mEq Na per mL; no dose or rate tables; prose amounts for TPN (12 to 15 mmol per liter with 250 g dextrose; infants 1.5 to 2 mmol/kg/day) | Sodium Phosphates label, set id 8fd901e6-30cb-411a-b820-b9e79625ec7c | Tool 4 reports sodium and shows the two sentences |
| Phenytoin 50 mg/min; pediatric 1 to 3 mg/kg/min; no less than 5 mg/mL; complete in 1 to 4 hours | Phenytoin label | Tool 3 |
| Fosphenytoin 150 mg PE/min; pediatric 2 mg PE/kg/min; 1.5 to 25 mg PE/mL | Cerebyx label | Tool 3 |
| Vancomycin: 5 mg/mL, 10 mg/min, at least 60 minutes, "whichever is longer"; bulk package 10 g + 95 mL gives 500 mg/5 mL | Vancomycin label (Hospira PBP) | Tools 3 and 1 |
| Potassium chloride: 10 mEq/hour, 40 mEq/L, 200 mEq/24 h; urgent 40 mEq/hour, 400 mEq/24 h; 300 and 400 mEq/L central only | Hospira concentrate and ICU Medical premix labels | Tool 3 |
| Magnesium sulfate: 150 mg/minute, 20% or less; 4.06 mEq/mL | Magnesium sulfate 50% label | Tool 3 |
| Calcium gluconate: 0.465 mEq/mL; 200 and 100 mg/minute; 10 to 50 and 5.8 to 10 mg/mL; bulk package 4 hours | Calcium gluconate label (WG Critical Care) | Tools 3, 9, 12 |
| Ceftriaxone reconstitution table (1 g + 9.6 mL, 3.6 mL, 2.1 mL) | Ceftriaxone label (Hikma), set id 8351aa37-552d-471d-b293-c564dcb6ec29 | Tool 1: displacement is back-calculated and not constant |
| Tralement and Multrys weight bands, per-mL content, per-kg daily amounts; Infuvite Pediatric three weight bands | The three labels | Tool 10 |
| NIOSH 2024: public domain statement; two tables and their definitions; Table 1 columns: drug, AHFS classification, MSHI, biologics license application, IARC and NTP classification; Table 2 columns: drug, AHFS classification, biologics license application, "only developmental and/or reproductive hazard"; review window January 2014 through December 2015; adds 25 (12 with MSHI), removes 7; editions 2010, 2012, 2014, 2016, 2024 | https://www.cdc.gov/niosh/docs/2025-103/pdfs/2025-103.pdf (PDF text) | Tool 13 passes licensing without the AHFS column; a miss is not clearance |
| Multi-dose vial: date and discard within 28 days unless the manufacturer states another date; never past the expiration date. CDC attributes this to USP <797>. Single-dose vials: do not store leftovers | https://www.cdc.gov/injection-safety/hcp/clinical-safety/index.html (page dated March 26, 2024; page text read directly on October 10, 2026) | Tool 12 |
| USP's free BUD fact sheet does not state the immediate-use, single-dose or multi-dose limits | https://www.mbp.ms.gov/sites/default/files/2023-03/USP_Compounding_BUD_Fact_Sheet.pdf | `compounding-bud` backfill is gated |
| Vaccine storage ranges; "any temperature reading outside the recommended range ... is a temperature excursion"; the event record fields; do not discard; manufacturer decides | https://www.cdc.gov/vaccines/hcp/downloads/storage-handling-toolkit.pdf (July 2026) | Tool 15 totals and reports; never judges |
| ICH Q1A(R2) defines MKT and names Haynes 1971 but does not print the formula or an activation energy | https://database.ich.org/sites/default/files/Q1A%28R2%29%20Guideline.pdf | Formula sourced to a paper that prints it |
| MKT formula and "83.144 kJ/mol as a default Ea" when the manufacturer's data are unavailable; R = 0.0083144 kJ/mol·K | Europe PMC full text XML of PMC8842539 (BMC Public Health 2022), equation 1 and Methods | Tool 14; default is editable |
| Haynes 1971 (PMID 5128949) has no abstract in PubMed | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=5128949 | Original not read |
| FDA Table 1: ISO 5 to 8 particle limits and microbial action levels; 0.45 m/s (90 ft/min); "at least 10-15 Pascals"; "at least 20 air changes per hour" | https://www.fda.gov/media/71026/download (PDF text) | Tools 16, 17; pressure backfill |
| CDC Table B.1 clearance times and formula; AII room 12 ACH; pharmacy 4 ACH; 0.01 in. w.g. (2.5 Pa) | https://www.cdc.gov/infection-control/hcp/environmental-control/appendix-b-air.html (page text read directly on October 10, 2026) | Tool 17 |
| Lantus opened vial 28 days; Tresiba 56 days | Lantus and Tresiba labels | Examples for tool 12; no table ships |
| Overfill: hospital documents quoting Baxter give different figures | Web search results only; no manufacturer document was opened | Rejected as a table |
| `tpn-macro` cites "standard nutrition references"; `data/tpn-rules/manifest.json` has `sourceUrl: null` | Repo | Backfill |
| **Second read, October 10, 2026.** Every label named in tools 3 to 11 was re-fetched from `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/{setid}.xml`, and its current version and published date from `.../spls/{setid}/history.json`. The doses, maximums, rates, concentrations, nitrogen factors and aluminum figures in those tools matched, except as the rows below record | DailyMed SPL XML and history.json for each set id | Versions added beside every set id; the history endpoint answers, so the watch in spec-v1628 §1 can read it |
| Corrected: the lipid maximums differ among Intralipid, SMOFlipid and Clinolipid in two of the four age bands, not three (birth to under 2 years is 3 g/kg/day and adults 2.5 g/kg/day on all three) | Table 1 of each label | Tool 5 note rewritten |
| Corrected: the Clinolipid label does not print the 12-hour Y-connector and 24-hour admixture limits; it gives a recommended PN bag infusion duration of 12 to 24 hours (20 to 24 for neonates). Intralipid 20%, SMOFlipid and Omegaven print the 12 and 24 hour limits | Clinolipid label §2.2 and §2.4; the other three labels §2.2 | Tools 5 and 12 name the labels that carry the limit |
| Added: Intralipid 30% diluted to 20% carries its own rate ceiling, 0.125 g/kg/hour, and its own Table 1 with the same g/kg/day figures as the 20% label | Intralipid 30% label §2.4 and §5 | Tool 5 row filled in |
| Corrected: NIOSH Table 2 has no MSHI column and no IARC/NTP column | NIOSH Publication No. 2025-103, table headers | Tool 13 reports those two fields for Table 1 hits only |
| Corrected: the Multrys table's last band is 3 kg to 9.9 kg, 1 mL; and the table disagrees with the label's "0.3 mL/kg/day rounded to the nearest 0.1 mL" sentence at band edges (2.7 kg and 3 kg) | Multrys label §2.5, Table 1 | Tool 10 returns the table's volume and names the difference |
| "4 mEq/dL" for the serum potassium cutoff is printed on four potassium phosphates labels, including one from the NDA holder | Set ids f7702b2f…, 357c3020…, 2fcbc814…, 41a85cca… | Tool 4 quotes it as printed and compares the reader's mEq/L figure with 4 |
| Clinimix (no electrolytes) adult maximum rates; Kabiven 2.6 mL/kg/hour, 40 mL/kg/day, central vein only | Clinimix label Table 2; Kabiven label §2.1 and §2.4 | Tool 11's build gate removed; both products added |
| Amoxicillin for oral suspension, Table 3: water per bottle size for three strengths. The set id first read (1d6d8372-dd7f-42a0-a447-fd699beb0aab, version 7, published October 8, 2026) is a repackager's copy (A-S Medication Solutions); the same table was read on Teva's label | Teva set id 4c0f348a-a65d-409c-8668-207c82a5e3cb, version 37 | Tool 1 fixture cites the manufacturer's label |
| Two labels read for tool 3 are distributor or relabeler copies: phenytoin (ProPharma Distribution) and magnesium sulfate (Medical Purchasing Solutions) | Labeler names in each SPL | Build gate in tool 3: pin a manufacturer's set id |
| Elcys doses are stated as mg of Elcys (cysteine hydrochloride): 22 mg/g equals 15 mg of cysteine per g, and 7 mg/g equals 5 | Elcys label §2.2 | Tool 6 wording made exact |
| Table B.2 of CDC Appendix B is reprinted from the 2001 AIA guidelines with permission | The CDC page's own note above the table | Tool 17 and the pressure backfill cite single figures and ship no part of the table |
| Toolkit: "freezing temperatures (0°C [32°F] or colder) can completely destroy vaccine potency" | CDC toolkit, July 2026, Section One | Source for tool 15's 0°C flag |

## Verify at build

- **All label rows.** Each label is re-read at build under [spec-v1628](spec-v1628.md) §1, and the
  pinned set id must be the application holder's or a manufacturer's. The DailyMed history
  endpoint answered for every set id in this file on October 10, 2026. Dates given are DailyMed
  published dates, not label revision dates.
- **Tool 1.** The ceftriaxone table was read in label text fetched on October 10, 2026; its
  version was not recorded at the time (the set id's current version that day was 18, published
  October 2, 2026).
- **Tool 3.** Phenytoin and vancomycin limits were read on one label each; confirm a second label
  agrees before shipping. Pin a manufacturer's label for phenytoin and for magnesium sulfate (see
  the tool's build gate).
- **Tool 4.** Pin the potassium phosphates vial label of the NDA212832 holder; the Civica label
  read carries that application number, but which set id is the holder's own vial label was not
  settled. The label has no rate table for patients under 12; the tool must say so and not apply
  the adult rates.
- **Tool 5.** Intralipid 20% prints a triple asterisk on the 2 to under 12 years maximum with no
  matching footnote in the label text; check the rendered label. On the Clinolipid label the 60%
  sentence sits as a footnote in the first table row; confirm on the rendered label which rows it
  applies to.
- **Tool 6.** Nitrogen factors for Clinisol, Plenamine, Premasol and Aminosyn were not read; the
  Clinimix protein table was not compared with Travasol's. Prosol's pediatric age bands are worded
  differently from Travasol's and were not transcribed.
- **Tool 7.** 4 kcal/g for amino acids is derived from Clinimix E's kcal/L figures, not a printed
  factor.
- **Tool 10.** Multrys Table 1 leaves gaps between bands when weight has two decimals (0.85 kg
  falls between 0.6 to 0.8 and 0.9 to 1.1); decide the weight rounding at build and state it on
  the page. Zinc sulfate, cupric chloride and selenious acid single-product labels were not read
  and are not used.
- **Tool 11.** Perikabiven was not read.
- **Tool 12 and the `compounding-bud` backfill.** No free USP document stating the immediate-use
  limit or the single-dose-container limit was found; the USP FAQ URL tried returned 404. No
  figure for either may ship until a shippable source is read. The Lantus and Tresiba in-use
  periods are examples of reader input; the named-product limits are owned by
  [spec-v1639](spec-v1639.md).
- **Tool 13.** The NIOSH HTML page returned 403; the PDF was read. Row counts per table were not
  taken. The build must extract the tables, drop the AHFS column, and check whether NIOSH posts
  interim additions for the 2024 edition (the document describes that practice for the 2016
  edition, at https://www.cdc.gov/niosh/docs/2016-161/default.html).
- **Tool 14.** Haynes 1971 was not opened. The formula comes from PMC8842539, which cites USP for
  the default; USP <1079.2> was not read and is not cited. The Tests fixture below was computed
  from the formula, not taken from a publication; check one worked example against a published
  value before shipping.
- **Tool 15.** CDC's toolkit names one frozen vaccine with a −40°C lower limit; do not add
  product rows.
- **Tool 16.** FDA's table lists only the 0.5 µm column; do not extend to other particle sizes.
- **Tool 17 and the pressure backfill.** The 1 in. w.c. = 249.09 Pa conversion factor was not read
  in a primary source on October 10, 2026; take it from NIST SP 811 at build.

## Sources

- 21 CFR 201.323 (eCFR, current as of October 10, 2026; last amended 68 FR 32981, June 3, 2003).
- FDA labels on DailyMed (set ids in each tool): Intralipid 20% and 30%, SMOFlipid, Omegaven,
  Clinolipid, Travasol, Prosol, TrophAmine, Elcys, Clinimix E, Clinimix, Kabiven, Dextrose (ICU
  Medical; Hospira 50%), Potassium Phosphates (Civica; Fresenius Kabi; Hospira), Sodium
  Phosphates, Calcium Gluconate, Magnesium Sulfate, Potassium Chloride (Hospira; ICU Medical),
  Phenytoin Sodium, Cerebyx, Vancomycin, Ceftriaxone, Amoxicillin for Oral Suspension (Teva),
  Tralement, Multrys, Infuvite Pediatric, Lantus, Tresiba.
- NIOSH List of Hazardous Drugs in Healthcare Settings, 2024. DHHS (NIOSH) Pub. No. 2025-103.
  https://www.cdc.gov/niosh/docs/2025-103/pdfs/2025-103.pdf
- CDC, Vaccine Storage and Handling Toolkit, July 2026.
  https://www.cdc.gov/vaccines/hcp/downloads/storage-handling-toolkit.pdf
- CDC, Preventing Unsafe Injection Practices.
  https://www.cdc.gov/injection-safety/hcp/clinical-safety/index.html
- CDC, Guidelines for Environmental Infection Control in Health-Care Facilities, Appendix B.
  https://www.cdc.gov/infection-control/hcp/environmental-control/appendix-b-air.html
- FDA, Sterile Drug Products Produced by Aseptic Processing, Current Good Manufacturing Practice
  (September 2004). https://www.fda.gov/media/71026/download
- ICH Q1A(R2), Stability Testing of New Drug Substances and Products.
  https://database.ich.org/sites/default/files/Q1A%28R2%29%20Guideline.pdf
- Jenkins D, et al. BMC Public Health 2022, PMC8842539 (MKT formula and default activation energy
  as printed).
- Haynes JD. J Pharm Sci 1971;60(6):927-929 (named by ICH; not read).

## Tests

- `reconstitution-concentration`: ceftriaxone 1 g + 9.6 mL with 100 mg/mL gives displacement
  0.4 mL; amoxicillin 250 mg/5 mL, 100 mL bottle, 60 mL of water gives powder volume 40 mL, and
  the same bottle (5,000 mg) with 85 mL of water gives 125 mL at 200 mg/5 mL; a wanted
  concentration that needs a negative diluent volume is refused; no concentration, volume or
  displacement entered is refused; diluent 0 is refused.
- `admixture-concentration`: overfill blank is labeled nominal-only; withdrawing the additive volume
  returns the nominal concentration; baseline 4 mEq/L in 5 L plus 20 mEq in 10 mL gives 7.98 mEq/L.
- `iv-label-rate-check`: phenytoin 1,000 mg over 20 minutes is exactly 50 mg/min (within);
  a 10 kg child at 3 mg/kg/min is 30 mg/min, and a 30 kg child is capped at 50; vancomycin 500 mg
  over 30 minutes fails on the 60-minute rule though 16.7 mg/min alone would also fail; vancomycin
  1.5 g needs 150 minutes; potassium 20 mEq in 250 mL is 80 mEq/L (over 40 mEq/L).
- `iv-phosphate-order-check`: 15 mmol potassium phosphates is 5 mL and 22 mEq K; 0.64 mmol/kg at
  80 kg is 51.2 mmol, capped at 45; 15 mmol in 100 mL peripheral is over 6.8 mmol/100 mL; a
  10-year-old returns the concentration rows and no rate row; sodium salt returns no limits.
- `lipid-emulsion-dose-check`: 2.5 g/kg/day in a 6-year-old is at the Intralipid maximum and under
  SMOFlipid's; Clinolipid by Y-site returns the label's duration sentence and no 12-hour verdict; a 15-year-old at 2.2 g/kg/day is over Intralipid (2), under SMOFlipid (2.5) and
  Clinolipid (3); Omegaven with an adult age band says "not labeled"; a 70 kg adult at 40 mL/hour of
  20% is 0.57 mL/kg/hour (over 0.5); Y-site hang of 13 hours is over.
- `pn-amino-acid-order`: 100 g Travasol is 16.5 g N, not 16.0; Elcys for 20 g amino acids in an
  infant is 8.8 mL; a product with no nitrogen factor asks for it.
- `pn-order-summary`: 250 g dextrose over 24 hours at 70 kg is 2.48 mg/kg/min; over 12 hours 4.96;
  Omegaven kcal use 1.12 kcal/mL; no nitrogen entered gives no ratio.
- `pn-aluminum-load`: 10 mL of a 900 mcg/L product is 9 mcg; a 1 kg neonate at 4.5 mcg lands in the
  4-to-5 band; a blank component label is refused, not treated as 0.
- `pn-calcium-phosphate-check`: 10 mL calcium gluconate is 4.65 mEq; no limit entered returns
  concentrations and no verdict.
- `pn-micronutrient-volume`: Multrys at 1.0 kg is 0.3 mL, at 0.5 kg is 0.2 mL every other day, at
  4 kg is 1 mL (cap), and at 2.7 kg is 0.9 mL from the table with the sentence's 0.8 mL shown
  beside it; Tralement at 9.9 kg is refused; Tralement at 45 kg shows a zinc shortfall
  (2,250 needed, 2,400 given: none) and at 49 kg (2,450 needed, 2,400 given: 50 mcg).
- `premixed-pn-rate-check`: Clinimix E 5/20 at 70 kg tops out at 87.5 mL/hour; Kabiven at 70 kg
  tops out at 182 mL/hour; Clinimix 6/5 exists only without electrolytes and 2.75/5 only with.
- `in-use-discard-time`: a multi-dose vial opened 10 days before its expiration date is bound by the
  expiration date; a label limit overrides 28 days; a single-dose vial returns no time.
- `hazardous-drug-list-check`: a Table 1 drug with MSHI; a Table 2 developmental-only drug; a
  Table 2 hit shows no MSHI or IARC/NTP field; a salt
  or brand name that must not silently miss; a miss carries the review-window caveat; the AHFS
  column never renders.
- `mean-kinetic-temperature`: constant readings return that temperature; readings of 20, 25 and
  30°C at 83.144 kJ/mol give 25.86°C against a mean of 25.00°C; MKT is never below the arithmetic
  mean; °F input round-trips; unequal intervals without durations are refused.
- `storage-excursion-summary`: a reading of exactly 8.0°C is in range, 8.1°C is not; two excursions
  separated by one in-range reading stay separate; a single reading has no duration; the output
  never contains "usable" or "viable" as a verdict.
- `cleanroom-class-check`: 100 particles/ft³ meets ISO 5 and 101 does not; 3,520/m³ meets ISO 5 and
  3,521 does not (no cross-unit conversion that would fail 100/ft³ at 3,531/m³); 1 cfu/m³ in ISO 5
  is at the action level.
- `room-air-changes`: 600 CFM in 1,800 ft³ is 20 ACPH; 12 ACPH gives 23 and 35 minutes; volume 0 is
  refused.
- Staleness, every label-backed tool: with the clock past `validThrough`, or `supersededOn` set,
  the tool asks for the label's figure and compares against nothing shipped
  ([spec-v1628](spec-v1628.md) §1).

## Build status

Not started. Specified October 10, 2026.
