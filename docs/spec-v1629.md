# spec-v1629 — Pharmaceutical calculations and nonsterile compounding bench math

**Status:** Proposed, October 10, 2026. Specs only; nothing here is built. 25 new tools, 1 of them build-gated (`compound-interstate-share`).
**Charter:** [spec-v1627](spec-v1627.md). **Machinery:** [spec-v1628](spec-v1628.md). **Ledger:** [scope-pharmacy-practice.md](scope-pharmacy-practice.md).

A pharmacist or technician at the compounding bench does the same arithmetic every day: mix two
strengths to hit a third, turn milligrams of a salt into milliequivalents, decide whether a
quantity is too small to weigh, work out how much base a suppository mold needs once the drug
takes up room. Every pharmacy curriculum teaches it and every one of these steps is a place where a
slipped decimal reaches a patient. This wave gives them 25 tools that do the arithmetic, show the
working line by line, and name where each rule comes from. None of them says what to make or
what to give.

## Gap finder

**Method.** The chapter list every pharmaceutical-calculations course follows was enumerated
(percent and ratio strength; dilution and alligation; electrolytes; isotonicity and buffers;
weighing accuracy and aliquots; density; molded dosage forms; capsules; formula scaling; alcohol;
measurement systems; emulsions) plus the numeric conditions of section 503A. Reconstitution, the
one remaining chapter, is specified in [spec-v1630](spec-v1630.md). Each item was searched in the
catalog by the formula name, the eponym, the output unit and the drug-form word (about 70
patterns), and the source of the three nearest live tools was read:
`concPercent` in `lib/medication-v5.js`, `UNITS` in `lib/clinical.js` (`unit-converter`), and the
`unit-converter-v4` view in `views/group-klmno.js`.

**What the catalog has in this domain.**

| Live id | What it computes (read in source) |
|---|---|
| `conc-percent` | One value in, three out: percent **w/v only**, ratio 1:X, mg/mL. No w/w, v/v, ppm, density. |
| `unit-converter` | kg, g, mg, lb, oz (avoirdupois); mL, L, fl oz, cup; C, F, K. No grain, dram, scruple, minim, pint, teaspoon. |
| `unit-converter-v4` | Lab SI conversions (glucose, cholesterol, creatinine, BUN, calcium, uric acid, A1c), mmHg/kPa, F/C, in/cm, lb/kg. |
| `dose-volume` | mL to draw = dose ÷ concentration. |
| `days-supply` | Takes drops per mL as reader input; does not calibrate a dropper. |
| `compounding-bud` | Beyond-use date. |
| `calcium-replacement`, `elemental-iron-ingested` | Fixed elemental fractions for named calcium and iron salts only. |
| `iv-osmolarity` | The ASPEN parenteral-nutrition estimate (dextrose % × 50 + amino acid % × 100 + ...). |
| `bsa`, `bw-bsa-suite`, `peds-dose`, `peds-weight-dose` | Body size and label-based pediatric doses. |

Nothing live computes alligation, a C1V1 dilution, a molecular weight, mEq from a formula,
isotonicity, a buffer, a minimum weighable quantity, an aliquot, displacement in a mold, capsule
fill, formula scaling, proof, or HLB.

| Proposed | Live neighbor | Difference |
|---|---|---|
| `alligation` | `conc-percent` | Neighbor restates one strength; this mixes two or more strengths to a target. |
| `dilution-c1v1` | `dose-volume`, `conc-percent` | Neighbors divide a dose by a concentration; this solves stock volume, final volume or final strength, and the diluent to add. |
| `serial-dilution` | none | A stepwise plan with the volume moved at each step. |
| `molecular-weight` | none | Formula mass from a typed chemical formula. |
| `meq-mmol-mg` | `calcium-replacement`, `unit-converter-v4`, `electrolyte-replacement` | Neighbors hard-code named salts or lab analytes, or band a replacement dose by serum level; this takes any formula or molecular weight and a valence, and checks itself against the equivalence printed on four FDA labels. |
| `salt-base-factor` | `elemental-iron-ingested` | Neighbor ships three iron percentages; this derives the factor for any salt, hydrate or ester. |
| `api-potency-adjust` | none | Corrects the weight to weigh for assay and water content from the certificate of analysis. |
| `tablet-powder-source` | none | Weight of crushed commercial tablets that carries a needed amount of drug. |
| `min-weighable-quantity` | none | Smallest weight or volume a device can measure inside an error limit; percent error of a measurement. |
| `aliquot-method` | none | Dilution plan for a quantity below the minimum weighable quantity. |
| `specific-gravity` | `unit-converter` | Neighbor converts within mass or within volume; this crosses between them through density and converts w/w to w/v. |
| `isotonicity-e-value` | `iv-osmolarity`, `effective-osmolality` | Neighbors estimate osmolarity of a PN bag or of serum; this computes the tonicity agent to add to a compounded solution. |
| `isotonicity-freezing-point` | same | Same question by the cryoscopic method. |
| `buffer-ph` | `abg` | Neighbor interprets a blood gas; this solves a pharmaceutical buffer pair. |
| `percent-ionized` | none | Fraction of a weak acid or base ionized at a pH. |
| `suppository-displacement` | none | Base needed in a calibrated mold, either displacement convention. |
| `capsule-fill` | none | Fill weight, diluent per capsule and batch quantities. |
| `formula-scale` | none | Reduce or enlarge a master formula, including parts and qs lines. |
| `ethanol-proof` | none | Proof, proof gallons, tax, and water to add under the federal gauging rule. |
| `apothecary-household-measures` | `unit-converter` | Neighbor has none of the apothecary units and one definition of a fluid ounce; this carries the NIST exact values and the FDA labeling values side by side. |
| `dropper-calibration` | `days-supply` | Neighbor consumes drops per mL; this measures it and converts a dose to drops. |
| `hlb-blend` | none | Emulsifier blend ratio for a required HLB. |
| `compound-interstate-share` (build-gated) | none | Share of orders sent out of state against the 5% statutory limit and the 50% MOU threshold. FDA enforces neither today. |
| `compound-copy-check` | `substitution-check` | Neighbor reads the Orange Book for substitution; this applies FDA's "essentially a copy" tests and the four-per-month count. |
| `compound-anticipatory-limit` | none | The 30-day anticipatory compounding ceiling from a year of prescription counts. |

## Tools

**Shared rule: where a number comes from.** Three kinds of source appear below, and each tool page
says which one it uses.

1. **Arithmetic identity** (conservation of mass or volume, a definition of a ratio). No paper
   owns C1V1 or alligation. The page says "conservation of mass" and shows the algebra. Nothing is
   cited to a textbook, and no USP text is used.
2. **A read primary source** (CFR, U.S. Code, an FDA guidance, a NIST table, the original paper).
3. **Reader input** for every product-specific or substance-specific constant that has no
   shippable primary table: E-values, freezing-point depressions, pKa, displacement factors,
   capsule volumes, tapped density, HLB values, balance sensitivity. The tool never ships these
   tables (see Rejected).

Atomic weights are the one shipped dataset: the IUPAC Commission on Isotopic Abundances and Atomic
Weights "Abridged Standard Atomic Weights 2024" (118 rows, facts, dated constant, route B). The
only label values in the wave are the four equivalence lines in `meq-mmol-mg`; they follow the
label-edition contract in [spec-v1628](spec-v1628.md).

### 1. `alligation` — Alligation (Mixing Strengths to a Target)

**Input.** Mode. *Two strengths to a target:* higher strength, lower strength, target strength,
and either the total wanted or the amount of one component on hand. A lower strength of 0 is a
plain diluent; a higher strength of 100% is pure drug (fortifying). *Several lots to one result
(medial):* each lot's strength and quantity. All strengths in one unit (%, mg/mL, mg/g).
**Compute.** Alternate: parts of higher = target − lower; parts of lower = higher − target;
quantities follow from the total or the fixed component. Fortifying a fixed quantity W at strength
c to strength t with a concentrate at strength h: add W × (t − c) ÷ (h − t). Medial: result =
Σ(strength × quantity) ÷ Σ quantity.
**Output.** Parts ratio, each quantity, the total, and the mass-balance check line.
**Source.** Arithmetic identity (mass balance). **Note.** The tool refuses a target outside the
two strengths. It says that volumes of alcohol and water are not additive and points to
`ethanol-proof` for that pair.

### 2. `dilution-c1v1` — Dilution and Stock Solutions

**Input.** Any three of stock strength, stock quantity, final strength, final quantity. Strength
units selectable per side: % w/v, % w/w, % v/v, mg/mL, mcg/mL, ratio 1:X, ppm. Quantities in mL or
g. A w/w stock diluted to a w/v product also needs the stock's specific gravity.
**Compute.** C1 × Q1 = C2 × Q2 after both strengths are put in the same unit; diluent = Q2 − Q1,
labeled "add diluent to make Q2" (never "add exactly this volume" for a liquid, because volumes
are not always additive). With a w/w stock: mL of stock = grams of solute needed ÷ (w/w fraction ×
specific gravity × 1 g/mL).
**Output.** The missing term, the diluent line, and the dilution factor.
**Source.** Arithmetic identity (the amount of solute does not change on dilution).

### 3. `serial-dilution` — Serial Dilution Plan

**Input.** Stock strength, target strength, the volume wanted at the last step, and either a fixed
dilution factor per step or the smallest volume the reader can measure (taken from
`min-weighable-quantity`).
**Compute.** Total factor = stock ÷ target. With a fixed factor f: steps = ceiling(log(total) ÷
log(f)), last step adjusted so the product is exact. With a minimum volume: the fewest steps for
which every transfer is at or above that minimum. Each step: transfer volume, diluent, resulting
strength.
**Output.** A step table and the strength after each step.
**Source.** Arithmetic identity (repeated dilution).

### 4. `molecular-weight` — Molecular Weight From a Formula

**Input.** A chemical formula as text, with parentheses, hydrates and charges: `CaCl2.2H2O`,
`Mg(OH)2`, `C16H19N3O5S.3H2O`.
**Compute.** Sum of abridged standard atomic weights × atom counts. Report the water of hydration
as a percent, and each element's mass percent.
**Output.** Molecular weight in g/mol to the precision the least precise element allows, the
element table, and the edition of the atomic-weight table.
**Source.** IUPAC CIAAW, *Abridged Standard Atomic Weights 2024*,
https://ciaaw.org/abridged-atomic-weights.htm. Read October 10, 2026: H 1.0080, C 12.011, N 14.007,
O 15.999, Na 22.990, Mg 24.305, P 30.974, S 32.06, Cl 35.45, K 39.098, Ca 40.078, Fe 55.845,
Zn 65.38, Li 6.94.
**Note.** This is how the wave gets a molecular weight **without a licensed salt table**: the reader
types the formula printed on the bulk container, the certificate of analysis or the FDA label
(section 11 of a label gives the formula and the molecular weight). The tool never maps a drug
name to a formula.
**Data.** Route B dated constant, ledger row `ciaaw-abridged-atomic-weights`, page watch on the
CIAAW page. An atomic weight does not expire in the way a deductible does; the tool keeps
answering and prints the edition year. Lithium's listed uncertainty is ± 0.06, so a lithium salt's
result is shown to fewer figures. The table prints a dash, not a value, for elements with no
standard atomic weight (technetium and oganesson, for example); a formula containing one is
refused.

### 5. `meq-mmol-mg` — Milligrams, Millimoles, Milliequivalents and Milliosmoles

**Input.** A quantity in mg, mmol, mEq or mOsm; the molecular weight (typed, or computed from a
formula by tool 4); the valence (total positive charge per formula unit, typed); the number of
particles on complete dissociation (typed). Optional volume, to report per liter. Optional label
check: one of the four salts below.
**Compute.** mmol = mg ÷ MW. mEq = mmol × valence. mOsm (ideal) = mmol × particles. Per-liter
values when a volume is given; normality = molarity × valence.
**Label anchors.** Four FDA labels print the equivalence. With the label check on, the tool shows
the label's line beside the computed one and says the label's figure is the one printed on that
product. Read on DailyMed on October 10, 2026:

| Salt (valence per formula unit) | Label line | Computed | DailyMed set id (version) |
|---|---|---|---|
| Potassium chloride, KCl (1) | "600 mg (8 mEq)", "750 mg (10 mEq)" | 8.05 and 10.06 mEq | 4340c3f2-ecf8-44cd-9b69-217f543e24e2 (2) |
| Potassium citrate monohydrate, K3C6H5O7·H2O (3) | "5 mEq (540 mg)", "10 mEq (1080 mg)", "15 mEq (1620 mg)" | 4.99, 9.99 and 14.98 mEq | 72cdea1b-2240-41db-987d-86d5c6aaa978 (30) |
| Sodium bicarbonate, NaHCO3 (1) | Injection: "84 mg is equal to one milliequivalent each of Na+ and HCO3-". 650 mg tablet: "sodium 178 mg (7.74 mEq)" | 1.00 mEq per 84 mg; 7.74 mEq per 650 mg | f8806ec3-a1c0-47a9-9660-2628dca4623e (1); f6e4af32-d567-2b02-e053-6394a90aa7a0 (9) |
| Lithium carbonate, Li2CO3 (2) | "Each 5 mL of Lithium Oral Solution contains 8 mEq of lithium ion (Li+) which is equivalent to the amount of lithium in 300 mg of lithium carbonate"; conversion table 150 mg = 4 mEq (2.5 mL), 300 mg = 8 mEq (5 mL), 600 mg = 16 mEq (10 mL) | 8.12 mEq per 300 mg | 677b20c4-84f0-4716-aca3-aead3bbe1283 (7); 7dc9c6d2-6d9a-49e4-a8ab-437b0ed5f84e (28) |

**Lithium oral solution.** For a lithium carbonate quantity only, one more output: the volume of
lithium oral solution (8 mEq per 5 mL) that carries the same lithium, by the label's own
conversion, mL = lithium carbonate mg ÷ 300 × 5. The volume is taken from the label line and not
from the computed milliequivalents: the label rounds 8.12 mEq to 8, and 8.12 mEq at 8 mEq per 5 mL
would give 5.08 mL where the label says 5 mL. The tool shows both milliequivalent figures and
reports the conversion; it does not say what to give.
**Output.** All four quantities and the line of working; with the label check on, the label's line
and its set id and version; for lithium carbonate, the oral-solution volume.
**Source.** Definitions (amount of substance; equivalents by charge). Molecular weight from tool 4.
The four labels above.
**Data.** The label lines are label-edition constants under [spec-v1628](spec-v1628.md) (set id and
version, weekly watch). When a label's row is stale the label line and the lithium volume are
withheld; the arithmetic keeps answering.
**Note.** "Ideal" is printed beside every milliosmole figure: a real solution's measured osmolality
is lower than complete dissociation predicts, and the tool gives no osmotic coefficient because no
shippable table of them was found. Valence is the reader's entry, not inferred from the formula
(the parser cannot know that Fe is 2+ in one salt and 3+ in another).
**Scope.** IV admixture and parenteral-nutrition osmolarity belong to [spec-v1630](spec-v1630.md)
and to the live `iv-osmolarity`. IV calcium salts stay in `calcium-replacement`. A label anchor for
an oral calcium or magnesium salt, or for potassium gluconate or bicarbonate, is added only when a
label line has been read for it (see Verify at build). This tool replaces the
`electrolyte-salt-converter` once proposed in [spec-v1633](spec-v1633.md).

### 6. `salt-base-factor` — Salt, Base and Hydrate Conversion Factor

**Input.** Two formulas or two molecular weights (the form on hand and the form the strength is
expressed in), the number of active moieties per formula unit of each (1 unless the salt carries
two), and a quantity.
**Compute.** Factor = (MW of form A ÷ moieties in A) ÷ (MW of form B ÷ moieties in B). Quantity of
A that carries a stated quantity of B, and the reverse.
**Output.** The factor both ways and the converted quantity.
**Source.** Stoichiometry, with tool 4's atomic weights. Context: FDA, *Naming of Drug Products
Containing Salt Drug Substances* (June 2015), which states that strength is expressed in terms of
the active moiety and that labels carry an equivalency statement.
**Note.** The label's own equivalency statement ("each tablet contains X mg of salt equivalent to
Y mg of base") outranks a computed factor; the tool says so and offers the label's two numbers as
an alternative input.

### 7. `api-potency-adjust` — Weight to Weigh After Assay and Water Correction

**Input.** Target amount of pure, anhydrous active; the lot's assay (%), and whether the assay is
stated on the as-is, anhydrous or dried basis; water content or loss on drying (%); an optional
salt factor from tool 6.
**Compute.** As-is basis: weigh = target ÷ (assay ÷ 100). Anhydrous or dried basis: weigh = target
÷ [(assay ÷ 100) × (1 − water ÷ 100)]. Then × salt factor if one applies.
**Output.** Weight to weigh and each correction as its own line.
**Source.** Arithmetic identity. **Note.** The basis is a required three-way choice with no
default. Applying the water correction to an as-is assay over-weighs; skipping it on an anhydrous
assay under-doses. The tool refuses to answer until the basis is chosen.

### 8. `tablet-powder-source` — Crushed Tablets as a Drug Source

**Input.** Drug needed (mg), labeled strength per tablet, the measured total weight of a counted
number of whole tablets.
**Compute.** Average tablet weight = total ÷ count. Tablets to crush = ceiling(needed ÷ strength),
plus any extra the reader enters. Powder to weigh = needed × average tablet weight ÷ strength.
**Output.** Tablets to crush, powder weight to take, powder left over.
**Source.** Arithmetic identity (proportion). **Note.** The page states the assumption that drug is
uniform through the crushed powder and that the label strength, not an assay, is used.

### 9. `min-weighable-quantity` — Minimum Weighable Quantity and Percent Error

**Input.** *Minimum mode:* the balance's sensitivity requirement or readability (mg), or a
measuring device's smallest reliable increment (mL); the largest error accepted (%). *Error mode:*
quantity wanted and quantity actually obtained, or a quantity and the device's sensitivity.
**Compute.** Minimum quantity = sensitivity ÷ (error ÷ 100). Percent error = |obtained − wanted| ÷
wanted × 100; potential error = sensitivity ÷ quantity × 100.
**Output.** The minimum quantity, or the percent error and whether it is inside the entered limit.
**Source.** Arithmetic identity (relative error).
**Licensing.** The familiar "6 mg sensitivity, 5% error, 120 mg" figures are USP chapter content
and are not shipped as defaults. Both fields start blank; the reader enters the balance's value
from its certificate and the error limit their standard sets.

### 10. `aliquot-method` — Aliquot Method (Solid or Liquid)

**Input.** Quantity of drug needed; minimum weighable or measurable quantity (from tool 9); for a
liquid aliquot, the solvent and final volume the reader can measure.
**Compute.** Solid: weigh a multiple m of the needed drug with m chosen so m × needed ≥ minimum;
add diluent to make a mixture of m × aliquot weight, where aliquot weight ≥ minimum; take one
aliquot. The tool offers the smallest whole-number m and the matching diluent. Liquid: dissolve
m × needed in volume V; the aliquot is V ÷ m, and V ÷ m must be ≥ the minimum measurable volume.
**Output.** Drug to weigh, diluent to add, aliquot to take, and a check that each of the three
measurements is at or above the minimum.
**Source.** Arithmetic identity (proportion).

### 11. `specific-gravity` — Density, Specific Gravity and Weight-to-Volume

**Input.** Mode. *Convert:* a weight or a volume and a specific gravity or density. *Measure:*
weight of an empty container, the container filled with the liquid, and the container filled with
water. *Strength:* a % w/w strength and the liquid's specific gravity.
**Compute.** Weight (g) = volume (mL) × specific gravity (water taken as 1 g/mL). Specific gravity
= (filled − empty) ÷ (water-filled − empty). % w/v = % w/w × specific gravity.
**Output.** The converted quantity or the specific gravity, with the water-density assumption
stated.
**Source.** Definitions (NIST SP 811 section 8.6.10 for mass fraction; density as mass per volume).

### 12. `isotonicity-e-value` — Isotonicity by Sodium Chloride Equivalent

**Input.** Final volume; each solute's amount and its sodium chloride equivalent (E-value, reader
input); the tonicity agent to be added and its E-value (1 for sodium chloride); or, in
White-Vincent mode, the solutes only.
**Compute.** Sodium chloride needed for the volume = 0.9 g per 100 mL × volume. Sodium chloride
represented by the solutes = Σ(grams × E). Sodium chloride still to add = needed − represented;
another agent = that amount ÷ its E-value. A negative result is reported as "already hypertonic by
this method", not as zero. White-Vincent: volume of water that makes the solutes isotonic =
Σ(grams × E) × 111.1 mL, then make to volume with an isotonic vehicle.
**Output.** Grams of tonicity agent, or the isotonic volume, and the working.
**Source.** The method's two constants were read in Kahar P, et al. *J Pharm Bioallied Sci.* 2019
(PMC7020836, open access): isotonic is "0.9% of NaCl in aqueous solution", and White-Vincent
multiplies "by 111.1 as a constant" (100 ÷ 0.9). The original papers were not opened (see Verify at
build).
**Licensing.** No E-value table ships. The published tables sit in Remington, the Merck Index and
USP; the underlying measurements are in paywalled *J Pharm Sci* papers that were not opened. The
reader types each E-value from the reference they hold, and the page names what kind of reference
carries it.

### 13. `isotonicity-freezing-point` — Isotonicity by Freezing-Point Depression

**Input.** Each solute's concentration (% w/v) and its freezing-point depression for a 1% solution
(reader input); the adjusting agent's 1% depression (reader input; sodium chloride offered as a
labeled preset only after the build gate below).
**Compute.** Depression supplied = Σ(% × 1%-depression). Agent needed (% w/v) = (0.52 − supplied) ÷
agent's 1%-depression; grams = % × volume ÷ 100.
**Output.** The percent and grams of adjusting agent, or "already at or past 0.52".
**Source.** Colligative freezing-point depression; the 0.52 °C target ("freezing point depression
of blood at −0.52 °C") read in Kahar 2019 (PMC7020836). The same paper's worked tables use 0.576
as sodium chloride's 1% depression.
**Build gate.** The 0.576 preset ships only if a second, primary source for it is read at build.
Until then the field is blank.

### 14. `buffer-ph` — Buffer pH and Buffer Composition (Henderson-Hasselbalch)

**Input.** pKa (reader input, at the working temperature), and either the molar concentrations of
the acid and its salt, or a target pH with a total buffer molarity and volume; molecular weights
(typed or from tool 4) when grams are wanted.
**Compute.** pH = pKa + log10([salt] ÷ [acid]) for a weak acid pair; for a weak base and its salt,
pH = pKa(conjugate acid) + log10([base] ÷ [salt]). Reverse: ratio = 10^(pH − pKa); [salt] = total ×
ratio ÷ (1 + ratio); grams = mol/L × MW × liters.
**Output.** pH, or the grams of each component, and the ratio.
**Source.** Physical chemistry (the mass-action expression for a weak acid, in logarithmic form).
**Note.** The page says the equation ignores activity, and that it is reliable only near the pKa;
the tool flags a target more than 1 pH unit from the pKa as outside the pair's useful range (a
ratio beyond 10:1 or 1:10, stated as arithmetic, not as a cited band).

### 15. `percent-ionized` — Percent Ionized at a pH

**Input.** pKa (reader input), pH, and whether the drug is a weak acid or a weak base.
**Compute.** Weak acid: % ionized = 100 ÷ (1 + 10^(pKa − pH)). Weak base: % ionized = 100 ÷ (1 +
10^(pH − pKa)).
**Output.** Percent ionized and un-ionized, and the ratio.
**Source.** The same mass-action expression. **Note.** One pKa only; a polyprotic drug is answered
for the pKa entered and the page says so. No absorption claim is made.

### 16. `suppository-displacement` — Suppository and Molded-Form Displacement

**Input.** Number of units (plus overage), the calibrated weight of one unit of plain base in the
reader's mold, the drug per unit, and the drug's factor **with its definition chosen**:
(a) grams of drug that occupy the volume of 1 g of base ("density factor"), or (b) grams of base
displaced by 1 g of drug ("displacement factor"). Calibration mode: weight of drug per unit, weight
of a plain-base unit, weight of a medicated unit.
**Compute.** Base per unit = blank weight − drug ÷ factor (definition a), or blank weight − drug ×
factor (definition b). Batch = per unit × count. Calibration: density factor (a) = B ÷ (A − C + B)
with A = plain unit weight, B = drug per unit, C = medicated unit weight; (b) is its reciprocal.
**Output.** Base and drug for the batch, the theoretical weight of one finished unit, and the
factor both ways.
**Source.** Arithmetic identity (the mold's volume is fixed). The two conventions are reciprocals
and both are in current use: PMC10055724 (*Pharmaceutics* 2023) calculates "the displacement factor
(f) in the Witepsol W25 base", and PMC7511457 (2020) uses "a displacement factor of 0.65" for
omeprazole; neither paper states which definition it means in its main text.
**Licensing.** No factor table ships (the tables are in the Pharmaceutical Codex and textbooks).
The factor is reader input or the result of calibration mode. The same tool serves troches and
other molded forms.

### 17. `capsule-fill` — Capsule Fill Weight and Diluent

**Input.** Number of capsules (plus overage), active per capsule, the capsule body volume (reader
input, from the capsule maker's sheet) or a measured fill weight of diluent alone in that capsule,
and the tapped density of the active and of the diluent (reader input) or measured fill weights of
each.
**Compute.** By measured fill weights: fraction of the capsule the active fills = active per
capsule ÷ fill weight of active alone; diluent per capsule = (1 − that fraction) × fill weight of
diluent alone. By densities: active volume = mass ÷ density; diluent = (capsule volume − active
volume) × diluent density. A fraction above 1 is reported as "does not fit this size".
**Output.** Diluent and active per capsule and for the batch, the target filled weight.
**Source.** Arithmetic identity (the capsule's volume is fixed).
**Licensing.** No capsule-size volume table ships: the volumes come from each capsule maker's data
sheet, and none was read (see Rejected), so the volume is reader input.

### 18. `formula-scale` — Reduce or Enlarge a Master Formula

**Input.** The master formula as lines (ingredient, quantity, unit; a line may be "parts" or "qs
to" a total), the master's total yield, and the wanted yield or a wanted quantity of one
ingredient.
**Compute.** Factor = wanted yield ÷ master yield (or wanted ingredient ÷ master ingredient). Every
quantity × factor. A parts formula is first turned into fractions of the total. The qs line is
recomputed as total − Σ others when all units agree, otherwise left as "qs to" the new total.
**Output.** The scaled formula, the factor, and a footing line (the scaled quantities add to the
wanted yield).
**Source.** Arithmetic identity (proportion). **Note.** Mixed units (g and mL in one formula) are
not summed without a specific gravity; the tool says which line stops the footing check.

### 19. `ethanol-proof` — Alcohol Proof, Proof Gallons and Dilution

**Input.** Mode. *Convert:* percent ethanol by volume or proof. *Proof gallons:* wine gallons (or
liters) and proof. *Tax:* proof gallons and the rate. *Reduce:* starting proof, wanted proof,
gallons on hand, and the four Table 6 values (parts alcohol and parts water at each proof).
**Compute.** Proof = 2 × percent by volume at 60 °F (27 CFR 30.11). Proof gallons = wine gallons ×
proof ÷ 100; a wine gallon is 231 cubic inches (30.11), 3.785411784 L (NIST HB44 App. C). Tax =
proof gallons × rate; the general rate is $13.50 per proof gallon (26 U.S.C. 5001(a)(1)); the
reduced rates of 5001(c) are reader-selected. Reduce (27 CFR 30.66): water to add to each 100
gallons = (alcohol parts at the given proof ÷ alcohol parts at the wanted proof) × water parts at
the wanted proof − water parts at the given proof.
**Rounding.** Proof is stated to the nearest tenth (27 CFR 30.31(a)). The tool carries no
intermediate rounding in reduce mode. The regulation's two worked reductions print truncated
figures: 191 to 188 proof is given as 1.84 gallons because 95.5 ÷ 94.0 = 1.01596 is written as
1.01 (unrounded the answer is 1.89; with the quotient rounded to 1.02 it would be 1.92), and 112 to
100 proof is given as 12.42 where 1.12 × 53.73 − 47.75 = 12.4276. For those two inputs the page
prints the regulation's figure beside the tool's (1.89 and 12.43) and says why they differ.
**Output.** The converted value, proof gallons, tax, or gallons of water to add.
**Source.** 27 CFR 30.11, 30.31(a), 30.66; 26 U.S.C. 5001(a)(1) and (c)(1) ($2.70 per proof gallon
on the first 100,000 proof gallons and $13.34 on the next 22,130,000, for a distilled spirits
operation). All read.
**Note.** The Table 6 method exists because alcohol and water contract when mixed; plain C1V1
understates the water. A pharmacy diluting to a marked final volume ("add water to make") can use
tool 2; a pharmacy adding a measured volume of water needs this one.
**Build gate.** Table 6 itself is a scanned 1918 table on ttb.gov with an unreliable text layer.
Ship it only after a hand-checked transcription (every row's alcohol parts must equal proof ÷ 2);
otherwise the four values stay reader input.
**Scope.** Tax-free alcohol permits and denatured formulas are not covered.

### 20. `apothecary-household-measures` — Apothecary, Avoirdupois and Household Measures

**Input.** A quantity and a unit: grain, scruple, apothecaries dram, apothecaries ounce,
apothecaries pound, avoirdupois ounce, avoirdupois pound; minim, fluid dram, fluid ounce, pint,
quart, gallon; teaspoon, tablespoon, cup.
**Compute.** NIST Handbook 44 (2026), Appendix C, read October 10, 2026: 1 grain = 64.79891 mg
(exactly); 20 grains = 1 scruple; 3 scruples = 1 dram (60 grains); 8 drams = 1 apothecaries ounce
(480 grains, 31.1034768 g); 12 ounces = 1 apothecaries pound (5,760 grains); avoirdupois ounce =
437.5 grains = 28.349523125 g; avoirdupois pound = 453.59237 g. 1 minim = 0.06161152 mL; 60
minims = 1 fluid dram = 3.696691 mL; 8 fluid drams = 1 fluid ounce = 29.57353 mL; pint 473.1765 mL; quart 946.3529 mL;
gallon 3,785.411784 mL. Household: 1 teaspoon = 5 mL, 1 tablespoon = 15 mL, 1 cup = 240 mL, 1 fl oz
= 30 mL under 21 CFR 101.9(b)(5)(viii) ("for nutrition labeling purposes"); Handbook 44 gives the
measuring teaspoon as 5 mL and the tablespoon as 15 mL, rounded, and calls both "imprecise units."
**Output.** The metric value, and where two definitions exist (fluid ounce 29.57 vs 30 mL; cup
236.6 vs 240 mL) both, each labeled with its source. The 236.6 mL cup is 8 fluid ounces at
29.57353 mL; Handbook 44 prints the measuring cup as "8 fluid ounces (exactly)" and "237
milliliters".
**Source.** NIST Handbook 44 (2026) Appendix C; 21 CFR 101.9(b)(5)(viii).
**Note.** Handbook 44 records that a teaspoon is closer to 1⅓ fluid drams than to the "1 teaspoon =
1 fluid dram" some references give; the tool shows that, since old prescriptions use the dram sign
for a teaspoonful. The page says the 5 mL teaspoon is a labeling rule for food and is not a
measuring device.

### 21. `dropper-calibration` — Dropper Calibration and Dose in Drops

**Input.** Drops counted and the volume they made (the reader's own measurement with the actual
dropper and liquid); then a dose in mL or in mg with a concentration.
**Compute.** Drops per mL = drops ÷ volume. Drops for a dose = dose volume × drops per mL, shown
unrounded and rounded to a whole drop with the resulting error percent.
**Output.** Drops per mL, drops per dose, and the dose a whole number of drops delivers.
**Source.** Arithmetic identity. **Note.** No default drops-per-mL figure, matching `days-supply`:
no federal source gives one, and the 20-drops figure is USP text.

### 22. `hlb-blend` — Emulsifier Blend for a Required HLB (Griffin)

**Input.** Mode. *Blend:* the required HLB and the HLB of two emulsifiers, and the total emulsifier
weight. *Mixture:* any number of emulsifiers with weights. *Required HLB of an oil phase:* each
oil's fraction and its required HLB. *Estimate:* saponification number and acid number, or the
weight percent of oxyethylene (and polyhydric alcohol).
**Compute.** HLB values are additive by weight fraction (Griffin 1949: three parts of HLB 8 with
one part of HLB 16 gives 10). Fraction of A = (required − HLB B) ÷ (HLB A − HLB B). Oil-phase
required HLB = Σ(fraction × required HLB). Estimates (Griffin 1954): HLB = 20 × (1 − S ÷ A); HLB =
(E + P) ÷ 5; HLB = E ÷ 5 when ethylene oxide is the only hydrophile.
**Output.** Grams of each emulsifier, or the blend's HLB, or the estimated HLB.
**Source.** Griffin WC. *J Soc Cosmet Chem.* 1949;1(5):311-326 and 1954;5(4):249-256, both read in
full text from the Society of Cosmetic Chemists library.
**Note.** Griffin 1954 limits the formulas to non-ionic surfactants and says those containing
propylene oxide, butylene oxide, nitrogen or sulfur, and all ionic ones, need the experimental
method; the tool
repeats that limit. A required HLB outside the two emulsifiers' values is refused. HLB values are
reader input (the supplier's data sheet).

### 23. `compound-interstate-share` — Compounded Drugs Sent Out of State (503A)

**Build gate.** Specified, not built. The tool is built only when FDA publishes a final rule on
certain distributions of compounded human drug products or an updated standard MOU. Until then
neither test binds anyone: FDA does not intend to enforce the 5% limit and treats the October 2020
standard MOU as suspended (see Dated rule). A calculator for a limit nobody applies would read as
a live compliance check. At build, both tests are re-read against the final rule and the updated
MOU, and the specification below is revised if either number or denominator has changed.

**Input.** For a period: total prescription orders dispensed or distributed by the pharmacy;
compounded orders sent out of the facility; compounded orders dispensed at the facility;
compounded orders distributed interstate; whether the state has signed the standard MOU (reader
input).
**Compute.** Statutory share = interstate compounded ÷ total prescription orders × 100, against
5% (21 U.S.C. 353a(b)(3)(B)(ii)). MOU share = interstate compounded orders in a calendar year ÷
(compounded orders sent out of the facility + compounded orders dispensed at the facility) × 100,
against "greater than 50 percent" (final standard MOU, 85 FR 68074, October 27, 2020).
**Output.** Both percentages, which test applies to the state entered, and how many more interstate
orders reach each line.
**Dated rule.** On October 21, 2022 (87 FR 63947, document 2022-22876) FDA extended the period
before it intends to begin enforcing the 5% limit "until the effective date of a final rule
regarding certain distributions of compounded human drug products and publication of an updated
standard MOU." The same notice and FDA's MOU page say "FDA considers the standard MOU published in
October 2020 to be suspended": FDA will not enter new agreements under it and does not expect
states that signed it to carry out its activities. A federal court remanded the MOU to FDA on
September 21, 2021. Checked October 10, 2026: the FDA page still reads "Content current as of:
10/20/2022", and a Federal Register search found no proposed or final rule after the 2022 notice
(only Regulatory Agenda entries, the latest dated August 16, 2024). Route B, ledger row
`fda-503a-mou-status`, page watch on the FDA MOU page and a Federal Register watch; a change in
either opens the build gate. [spec-v1637](spec-v1637.md) records the same status in its Rejected
table.
**Scope.** Federal only. The tool does not list which states signed; the 50% line is an
information-sharing threshold under the MOU, not a cap, and the page says so.

### 24. `compound-copy-check` — "Essentially a Copy" Check (503A)

**Input.** The reader answers: same active ingredient as a commercially available product; the
compounded strength and the commercial strength (numbers); whether the commercial product can be
used by the prescribed route; whether the commercial product is discontinued or is "currently in
shortage" on FDA's list (reader input, with the date checked); whether the prescription documents
the prescriber's determination of a significant difference for the patient; and the number of
prescriptions for this compounded product filled this calendar month that lack such a
determination.
**Compute.** FDA's January 2018 guidance: essentially a copy when the active ingredient is the
same, the strength is the same, similar ("within 10% of the dosage strength of the commercially
available drug product", so percent difference = |compounded − commercial| ÷ commercial × 100) or
easily substitutable (reachable by "fractional or multiple doses" of the commercial product, the
guidance's 25 mg and 50 mg example), and the commercial product can be used by the
same route, unless the prescriber's determination is documented. Not "commercially available" if
discontinued or currently in shortage. Count test: FDA does not intend to act when the compounder
"fills four or fewer prescriptions for the relevant compounded drug product in a calendar month";
prescriptions with a documented determination do not count toward the four.
**Output.** Which conditions are met, the percent difference in strength, the month's count against
four, and the guidance paragraph behind each line.
**Source.** 21 U.S.C. 353a(b)(1)(D) and (b)(2); FDA, *Compounded Drug Products That Are Essentially
Copies of a Commercially Available Drug Product Under Section 503A* (January 2018). Both read.
**Note.** This is a nonbinding enforcement policy and the page says so. "Easily substitutable" is
only flagged for whole multiples; anything else is shown as "the guidance gives no number." The
guidance does not say whether a difference of exactly 10% is "within 10%"; the tool counts it as
within, shows the percent, and says the boundary is its own reading. Section 503B has different
copy rules and is out of scope.

### 25. `compound-anticipatory-limit` — Anticipatory Compounding Limit (503A)

**Input.** For one compounded product: units covered by valid patient-specific prescriptions
received in each 30-day period of the past year (or a dated list of prescriptions with units), and
units now held for distribution.
**Compute.** The ceiling is the units received in the 30-day period the compounder selects from the
past year; the tool finds the highest rolling 30-day total from a dated list. Room left = ceiling −
units on hand.
**Output.** The highest 30-day figure and its dates, units on hand against it, and how many more
may be made under the policy.
**Source.** FDA, *Prescription Requirement Under Section 503A* (December 2016), interim compliance
policy: hold "no more than a 30-day supply", based on prescriptions received "in a 30-day period
over the past year that the compounder selected"; the guidance's example is 500 units. Read.
**Note.** The beyond-use date still limits what a batch is worth making; the page links
`compounding-bud`. Batch upload of the dated list uses the existing workbench.

## Backfills (live tools that should do more)

| Live tool | Add | Why |
|---|---|---|
| `conc-percent` | % w/w and % v/v (with a specific-gravity field where a cross between them is asked), ppm and ppb, mg/dL ("mg%"), mcg/mL | It converts w/v only. ppm as a mass fraction × 10^6; a w/v reading of ppm (mg/L) is labeled as valid for dilute aqueous solutions. NIST SP 811 section 7.10.3 deprecates "ppm" but recognizes its required use; cite it for the definition. Also fix the citation line, which names USP as the source of an arithmetic identity. |
| `unit-converter` | A pointer to `apothecary-household-measures`, and a label on its fluid ounce (29.5735 mL, the NIST value, not the 30 mL labeling value) | Its `fl_oz` and `cup` are the exact customary values and the page does not say which definition it uses. |
| `days-supply` | Accept the result of `dropper-calibration` as the drops-per-mL input | The field exists; the measurement tool feeds it. |
| `elemental-iron-ingested` | Show the elemental fraction's derivation from the formula (iron 55.845 ÷ formula mass) | Its 20%, 12% and 33% are unsourced constants; tool 4 reproduces them and exposes the hydrate assumed. |
| `compounding-bud` | Related-tool links to the bench-math tools | Findability only. |

## Rejected

| Idea | Why not |
|---|---|
| Young's, Clark's, Fried's rules and the BSA fraction-of-adult-dose rule | They output a dose for a child from an adult dose. That is prescribing by a superseded heuristic; the site reports what a label gives (`peds-dose`) and never derives a dose from a rule of thumb. A "historical interest" label does not change what the number on screen invites. |
| A table of sodium chloride equivalents (E-values) or freezing-point depressions | The compiled tables are in Remington, the Merck Index and USP. The source measurements are in paywalled papers that were not opened, and Kahar 2019's values are copied from a commercial handbook. Reader input instead. |
| E-value estimated from molecular weight and an L-iso class constant | The class constants (1.9, 3.4 and the rest) were seen only in lecture notes; the original paper was not found. Held under Verify at build, not shipped. |
| Sprowls V-values | A table (volume for 0.3 g), not a computation; White-Vincent mode in tool 12 computes the same quantity for any weight. |
| A table of suppository displacement or density factors | Textbook and Codex content; two reciprocal conventions in circulation make a shipped table hazardous. Calibration mode replaces it. |
| A capsule-size volume table (000 to 5) | Maker data sheets, not a federal or paper source, and none was read. Reader input. |
| A drops-per-mL table or a 20 drops/mL default | Same finding as [spec-v1511](spec-v1511.md): no federal figure; the 20-drop dropper is USP text. |
| Default balance figures (6 mg sensitivity, 5% error, 120 mg minimum) | USP chapter content. The arithmetic ships; the defaults do not. |
| Weight-variation and content-uniformity acceptance checks for compounded capsules | The acceptance ranges are USP text. |
| A table of HLB values by surfactant, or required HLB by oil | Griffin's 1949 and 1954 tables list trade-named products of that era; today's values come from supplier sheets. Reader input. |
| Geometric dilution as a standalone tool | A mixing technique. No source defines a computed stopping rule; the quantities are the doubling of a pile, which `aliquot-method` and `formula-scale` already state. |
| Temperature conversion | Live in `unit-converter` and `unit-converter-v4`. |
| Compounding price, fee or labor-time math | No primary source: fee formulas are textbook convention or a payer contract (reader input with nothing to compute beyond a sum). |
| Mean kinetic temperature for a storage excursion | Storage, not bench math. Specified once, as `mean-kinetic-temperature` in [spec-v1630](spec-v1630.md). |
| Percent yield of a batch | One division with no rule behind it; shown as a line inside `formula-scale` is the most it earns. |
| Effervescent granule acid-to-bicarbonate ratios | Derivable by stoichiometry with tool 4, but the usual ratio is a textbook formulation choice with no primary source. |
| A drug-name-to-salt-formula table | Would be a licensed compendium in miniature and would decay. The reader types the formula from the label. |
| Fifty-state rules on compounding or interstate shipping | Standing rule. |
| Section 503B copy and bulk-substance rules | Outsourcing facilities; a different statute section, outside nonsterile bench math. |
| `powder-volume-reconstitution` as its own tool here | Specified once, as `reconstitution-concentration` in [spec-v1630](spec-v1630.md), which covers oral suspensions as well as vials. The amoxicillin for oral suspension fixture read for this wave (Research record) is handed to spec-v1630. |
| `electrolyte-salt-converter` (proposed in [spec-v1633](spec-v1633.md)) as its own tool | One calculation. Its label anchors and its lithium oral-solution volume are part of `meq-mmol-mg`. |

## Research record

| Finding | Where read (URL) | Effect on the spec |
|---|---|---|
| `conc-percent` handles only w/v, ratio and mg/mL | `lib/medication-v5.js` line 356 | Backfill, not a new tool, for w/w, v/v and ppm. |
| `unit-converter` has no apothecary or household units; its fl oz is 29.5735295625 mL | `lib/clinical.js` line 35 | New tool `apothecary-household-measures`; label backfill. |
| NIST's atomic-weight database gives **intervals** for H, C, N, O, Mg, Cl (for example Cl [35.446, 35.457]) | https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl?ele=&ascii=ascii2&isotype=some | NIST cannot be the single-value source. Switched to CIAAW abridged values. |
| CIAAW *Abridged Standard Atomic Weights 2024*: H 1.0080, C 12.011, N 14.007, O 15.999, Na 22.990, Mg 24.305, P 30.974, S 32.06, Cl 35.45, K 39.098, Ca 40.078, Fe 55.845, Zn 65.38, Li 6.94 ± 0.06 | https://ciaaw.org/abridged-atomic-weights.htm | The shipped dataset for `molecular-weight`, `meq-mmol-mg` and `salt-base-factor`. The table has 118 rows; elements with no standard atomic weight carry a dash. |
| Potassium chloride label: "600 mg (8 mEq)", "750 mg (10 mEq)" | DailyMed set id 4340c3f2-ecf8-44cd-9b69-217f543e24e2, version 2 | Label anchor and test fixture for `meq-mmol-mg`: 600 ÷ 74.548 = 8.05, the label rounds to 8; 750 ÷ 74.548 = 10.06. |
| Potassium citrate label (Urocit-K), section 11: formula K3C6H5O7·H2O; tablets "contain 5 mEq (540 mg) potassium citrate, 10 mEq (1080 mg) potassium citrate and 15 mEq (1620 mg) potassium citrate" | DailyMed set id 72cdea1b-2240-41db-987d-86d5c6aaa978, version 30 | Label anchor: the monohydrate's weight (324.41) with valence 3 gives 4.99, 9.99 and 14.98 mEq. The anhydrous weight would not reproduce the label. |
| Sodium bicarbonate injection label: "Sodium bicarbonate, 84 mg is equal to one milliequivalent each of Na+ and HCO3-"; a 650 mg tablet label: "sodium 178 mg (7.74 mEq)" | DailyMed set ids f8806ec3-a1c0-47a9-9660-2628dca4623e, version 1 (injection) and f6e4af32-d567-2b02-e053-6394a90aa7a0, version 9 (tablet) | Label anchor: 84 ÷ 84.006 = 1.00; 650 ÷ 84.006 = 7.74. |
| Lithium labels: "Each 5 mL of Lithium Oral Solution contains 8 mEq of lithium ion (Li+) which is equivalent to the amount of lithium in 300 mg of lithium carbonate"; conversion table 150 mg = 4 mEq (2.5 mL), 300 mg = 8 mEq (5 mL), 600 mg = 16 mEq (10 mL); lithium carbonate molecular weight 73.89 | DailyMed set ids 677b20c4-84f0-4716-aca3-aead3bbe1283, version 7 (oral solution) and 7dc9c6d2-6d9a-49e4-a8ab-437b0ed5f84e, version 28 (tablets, capsules and solution) | The label supports the oral-solution volume, so `meq-mmol-mg` reports it. 300 ÷ 73.888 × 2 = 8.12 mEq against the label's 8, so the volume is computed from the label's mg-to-mL line, not from computed mEq. |
| Amoxicillin for oral suspension, Table 3: 250 mg/5 mL, 100 mL bottle, 60 mL water; 200 mg/5 mL, 100 mL, 75 mL; 400 mg/5 mL, 100 mL, 67 mL | DailyMed set id 1d6d8372-dd7f-42a0-a447-fd699beb0aab, version 7 | Handed to `reconstitution-concentration` in [spec-v1630](spec-v1630.md) as a fixture; shows powder volume differs by strength (40, 25, 33 mL). |
| "Proof. The ethyl alcohol content of a liquid at 60 degrees Fahrenheit, stated as twice the percent of ethyl alcohol by volume"; wine gallon 231 cubic inches; proof spirits defined at specific gravity 0.7939 | 27 CFR 30.11, https://www.ecfr.gov/current/title-27/section-30.11 | `ethanol-proof` convert mode. |
| Proof "determined to the nearest tenth degree" | 27 CFR 30.31(a) | Rounding rule for `ethanol-proof`. |
| Table 6 method and worked example (191 to 188 proof: 95.5 and 5.59, 94.0 and 7.36, 1.84 gallons per 100); shortcut for 100 proof (× 53.73) | 27 CFR 30.66 | `ethanol-proof` reduce mode. The regulation's example writes the quotient 1.01596 as 1.01 (truncated, not rounded: rounding gives 1.02 and 1.92 gallons); unrounded arithmetic gives 1.89, not 1.84. Its 100-proof example prints 12.42 where 1.12 × 53.73 − 47.75 = 12.4276. The same section says to round half up, in its weight example. |
| Table 6 is a scan with a garbled text layer | https://www.ttb.gov/system/files/images/pdfs/foia_Gauging_Manual_Tables/Table_6.pdf (search result description; file not parsed) | Build gate: hand-checked transcription or reader input. |
| Tax "$13.50 on each proof gallon"; reduced rates $2.70 (first 100,000) and $13.34 | 26 U.S.C. 5001(a)(1), (c)(1), govinfo 2024 edition | `ethanol-proof` tax mode; rate is selectable. The statute reads "$13.34 per proof gallon on the first 22,130,000 of proof gallons of distilled spirits to which subparagraph (A) does not apply"; the "1" after "of" in the page text is the edition's footnote mark ("So in original"). |
| "a teaspoon means 5 milliliters (mL), a tablespoon means 15 mL, a cup means 240 mL, 1 fl oz means 30 mL, and 1 oz in weight means 28 g", "for nutrition labeling purposes" | 21 CFR 101.9(b)(5)(viii) | `apothecary-household-measures` household values, labeled as a food-labeling rule. |
| Grain 64.79891 mg exactly; apothecaries and avoirdupois tables; minim 0.06161152 mL; fluid dram 3.696691 mL; fluid ounce 29.57353 mL; measuring cup "8 fluid ounces (exactly)", "237 milliliters"; teaspoon 5 mL and tablespoon 15 mL rounded, "imprecise units"; "1 teaspoon = 1⅓ fluid drams" note | NIST Handbook 44 (2026) Appendix C, https://www.nist.gov/document/2026-nist-handbook-44-appendix-c | `apothecary-household-measures`. Two federal definitions of a fluid ounce and a cup: show both. |
| Mass fraction wB = mB ÷ m; "ppm" not acceptable with the SI but recognized where required | NIST SP 811 (2008) sections 7.10.3, 8.6.10 | Definition cited for the `conc-percent` backfill and `specific-gravity`. Section 7.10.3 was re-read on October 10, 2026; the chapter 8 page did not load on that date (see Verify at build). |
| HLB values "are additive"; 3 parts HLB 8 + 1 part HLB 16 = 10; Span 60/Tween 60 at 45/55 calculated 10.3 | Griffin 1949, https://library.scconline.org/cdn-1708618371170/Classification-Surface-Active-Agents-HLB.pdf | `hlb-blend` blend mode. |
| HLB = 20(1 − S/A) (glyceryl monostearate S 161, A 198, printed result 3.8; the arithmetic gives 3.74); HLB = (E + P)/5 (65.1 and 6.7, printed 14; the arithmetic gives 14.36); HLB = E/5 (76, printed 15; the arithmetic gives 15.2); limits for propylene oxide, butylene oxide, nitrogen, sulfur and ionic surfactants | Griffin 1954, https://library.scconline.org/is-cacheable/1708619266684/Calculation-HLB-Values-Non-Ionic-Surfactants.pdf | `hlb-blend` estimate mode and its stated limits. The often-quoted "20 × Mh/M" form is not how the paper writes it. |
| Isotonic = freezing-point depression 0.52 °C or 0.9% NaCl; White-Vincent constant 111.1 (V = Σ(W × E) × 111.1); NaCl 1% depression 0.576 (the paper's worked tables) | Kahar 2019, Europe PMC full text PMC7020836 | Constants for `isotonicity-e-value` and `isotonicity-freezing-point`; a later open-access paper, not the originals. |
| Displacement factor used as "f" and as "0.65" with no stated definition | PMC10055724, PMC7511457 (Europe PMC full text) | `suppository-displacement` forces the reader to choose the definition. PMC10055724 also gives pentobarbital sodium × 0.911 = base (molar masses 248.25 and 226.27), a fixture for `salt-base-factor`. |
| 5% limit: "quantities that do not exceed 5 percent of the total prescription orders dispensed or distributed by such pharmacy or physician" | 21 U.S.C. 353a(b)(3)(B)(ii), govinfo 2024 edition | `compound-interstate-share` denominator is **all** prescription orders, not compounded ones. |
| 50% threshold: interstate compounded orders in a calendar year "greater than 50 percent of the sum of" compounded orders sent out of the facility plus those dispensed at it | 85 FR 68074 (Oct. 27, 2020), https://www.federalregister.gov/documents/2020/10/27/2020-23687 | `compound-interstate-share` second test with a different denominator. |
| Enforcement of the 5% limit deferred "until the effective date of a final rule regarding certain distributions of compounded human drug products and publication of an updated standard MOU"; "FDA considers the standard MOU published in October 2020 to be suspended"; court remand September 21, 2021; FDA page "Content current as of: 10/20/2022"; no proposed or final rule in a Federal Register search on October 10, 2026 (Regulatory Agenda entries only, latest August 16, 2024) | 87 FR 63947, https://www.federalregister.gov/documents/2022/10/21/2022-22876 ; https://www.fda.gov/drugs/human-drug-compounding/memorandum-understanding-addressing-certain-distributions-compounded-drugs | `compound-interstate-share` is build-gated: neither the 5% limit nor the 50% MOU threshold is applied today. The earlier text cited the notice without its page number and kept the tool live. |
| Copies guidance: similar strength "within 10%"; 25 mg vs 50 mg easily substitutable; discontinued or "currently in shortage" not commercially available; "four or fewer prescriptions ... in a calendar month"; documented determinations not counted | https://www.fda.gov/media/98973/download (January 2018); FDA's page for the guidance lists it as final, content current as of May 6, 2020 | `compound-copy-check`. The 10% is measured against the commercial strength. |
| Anticipatory compounding: "no more than a 30-day supply" based on a 30-day period "over the past year that the compounder selected"; 500-unit example | https://www.fda.gov/media/97347/download (December 2016); FDA's page for the guidance lists it as final, content current as of August 24, 2018 | `compound-anticipatory-limit`. |
| Strength "expressed in terms of the active moiety"; equivalency statement on the label | FDA, *Naming of Drug Products Containing Salt Drug Substances* (June 2015), https://www.fda.gov/media/87247/download | Tool 6 note: the label statement outranks a computed factor. |
| ICH Q1A(R2) defines mean kinetic temperature and cites Haynes 1971 without printing the formula | https://database.ich.org/sites/default/files/Q1A%28R2%29%20Guideline.pdf | Not in this wave; specified as `mean-kinetic-temperature` in [spec-v1630](spec-v1630.md). |

## Verify at build

- **`meq-mmol-mg`.** No label line was read for an oral calcium or magnesium salt, or for potassium
  gluconate or potassium bicarbonate; none is a label anchor until one is. The four anchors are
  keyed to the set ids and versions read on October 10, 2026; re-read each at build.
- **`isotonicity-e-value` and `isotonicity-freezing-point`.** The originals were not opened: White
  and Vincent (1947) for the 111.1 method, Wells (1944) for the L-iso estimate, and the *J Pharm
  Sci* E-value compilations. The constants 0.9%, 0.52 °C and 111.1 were read only in Kahar 2019.
  0.576 for 1% sodium chloride was read only in that paper's tables, which copy a commercial
  handbook; it implies 0.518 for 0.9%, consistent with 0.52 but not a second source.
- **`buffer-ph` and `percent-ionized`.** No primary statement of the Henderson-Hasselbalch equation
  was opened (Henderson 1908; Hasselbalch 1916). It is specified here as the logarithm of the
  mass-action expression, which is derivable; the build should cite a source that has been read.
  Buffer capacity (Van Slyke, *J Biol Chem* 1922) was left out because the paper could not be
  fetched.
- **`suppository-displacement`.** The calibration formula is derived here from fixed mold volume;
  it is not a quotation. The supplementary file of PMC10055724, which states its displacement-factor
  formula, was not opened. Which convention 0.65 follows in PMC7511457 is unknown.
- **`capsule-fill`.** No capsule maker's volume sheet was read.
- **`ethanol-proof`.** Table 6 rows were not read (scan). The 26 U.S.C. 5001 text is the 2024
  edition on govinfo; confirm no later amendment to the rates at build.
- **`specific-gravity` and the `conc-percent` backfill.** NIST SP 811 section 8.6.10 (mass
  fraction) was not re-opened on October 10, 2026 (the chapter 8 page did not load); confirm the
  section number at build. Section 7.10.3 was read.
- **`hlb-blend`.** The individual HLB values behind Griffin's 45/55 Span 60/Tween 60 example were
  read only in the scan's unreliable text layer (Span 60 4.7, Tween 60 14.9, which give 10.31);
  confirm them against the page image before using them as a test.
- **`compound-interstate-share`.** Build gate. Status is as of the FDA page and a Federal Register
  API search on October 10, 2026; the Regulatory Agenda entries were not opened. Re-check the FDA
  page and the docket before any build.
- **`compound-copy-check` and `compound-anticipatory-limit`.** Both guidances are nonbinding and
  dated 2018 and 2016. FDA's page for each still listed it as final on October 10, 2026; FDA's
  guidance index was not searched for a later draft revision.
- **`molecular-weight`.** CIAAW's site terms were not read; atomic weights are facts and are cited.
  NIST's database is the federal fallback, with the interval problem noted in the Research record.
- **`min-weighable-quantity`.** No non-USP primary source for a prescription balance's sensitivity
  requirement was found; NIST Handbook 44's scales code was not searched.

## Sources

- 27 CFR 30.11, 30.31, 30.61 to 30.67 (eCFR, current).
- 26 U.S.C. 5001 (govinfo, 2024 edition).
- 21 U.S.C. 353a (govinfo, 2024 edition).
- 21 CFR 101.9(b)(5)(viii) (eCFR, current).
- NIST Handbook 44 (2026), Appendix C, General Tables of Units of Measurement.
- NIST Special Publication 811 (2008), sections 7.10.3, 8.6.6, 8.6.10.
- NIST, Atomic Weights and Isotopic Compositions (database page).
- IUPAC CIAAW, Abridged Standard Atomic Weights 2024.
- FDA, *Compounded Drug Products That Are Essentially Copies of a Commercially Available Drug
  Product Under Section 503A* (January 2018).
- FDA, *Prescription Requirement Under Section 503A* (December 2016).
- FDA, *Naming of Drug Products Containing Salt Drug Substances* (June 2015).
- FDA, Memorandum of Understanding page (current as of October 20, 2022); 85 FR 68074
  (October 27, 2020); 87 FR 63947, document 2022-22876 (October 21, 2022).
- Griffin WC. Classification of surface-active agents by "HLB". *J Soc Cosmet Chem.*
  1949;1(5):311-326.
- Griffin WC. Calculation of HLB values of non-ionic surfactants. *J Soc Cosmet Chem.*
  1954;5(4):249-256.
- Kahar P, et al. Kahar method: a novel calculation method of tonicity adjustment. *J Pharm
  Bioallied Sci.* 2019 (PMC7020836).
- PMC10055724 (*Pharmaceutics* 2023, pentobarbital suppositories); PMC7511457 (*Eur J Drug Metab
  Pharmacokinet* 2020, omeprazole suppositories).
- DailyMed: potassium chloride extended-release tablets (set id 4340c3f2-...); potassium citrate
  extended-release tablets (72cdea1b-...); sodium bicarbonate injection (f8806ec3-...) and tablets
  (f6e4af32-...); lithium oral solution (677b20c4-...) and lithium carbonate tablets, capsules and
  oral solution (7dc9c6d2-...); amoxicillin for oral suspension (1d6d8372-..., fixture handed to
  spec-v1630).

## Tests

- `alligation`: 70% and 20% to make 30% gives 1 part to 4 parts; a target equal to one strength
  gives all of that component; a target outside the pair is refused; fortifying 100 g of 1% to 2.5%
  with pure drug gives 1.54 g, not 1.5 g.
- `dilution-c1v1`: 1:1,000 to 1:10,000 is a tenfold dilution across ratio units; a w/w stock
  without a specific gravity is refused when the product is w/v; the diluent line never claims
  additivity.
- `serial-dilution`: a total factor that is not a power of the step factor still lands exactly on
  the target; a minimum volume forces an extra step.
- `molecular-weight`: `CaCl2.2H2O` = 147.01; `KCl` = 74.548; `Li2CO3` = 73.89; `C` vs `Ca` vs `Co`
  vs `CO` parsed correctly; nested parentheses; an unknown symbol is refused, not skipped; an
  element with no standard atomic weight (`Tc`) is refused; lowercase input refused.
- `meq-mmol-mg`: potassium chloride 600 mg gives 8.05 mEq (label: 8), 750 mg gives 10.06 (label:
  10) and 1,500 mg gives 20.12; potassium citrate monohydrate 540 mg with valence 3 gives 4.99 mEq
  (label: 5) and 1,080 mg gives 9.99 (label: 10); sodium bicarbonate 84 mg gives 1.00 mEq and
  650 mg gives 7.74 (label: 7.74); lithium carbonate 300 mg with valence 2 gives 8.12 mEq (label:
  8) and 5 mL of oral solution, 150 mg gives 2.5 mL and 450 mg gives 7.5 mL, never 5.08 mL from the
  computed milliequivalents; the oral-solution volume appears for lithium carbonate only; a stale
  label row withholds the label line and the lithium volume but not the arithmetic; calcium
  chloride dihydrate uses the hydrate's weight with valence 2; a blank valence gives mmol only,
  never an assumed 1.
- `salt-base-factor`: pentobarbital sodium to pentobarbital gives 0.911; a salt with two moieties
  per formula unit halves the weight per moiety; identical formulas give 1.
- `api-potency-adjust`: the three bases give three different answers for the same lot; no basis
  chosen gives no answer; 100% assay and 0% water returns the target.
- `tablet-powder-source`: a need that is not a whole number of tablets rounds the tablet count up
  and leaves the powder weight unrounded.
- `min-weighable-quantity`: blank sensitivity or blank error limit refuses (no default); a quantity
  exactly at the minimum passes.
- `aliquot-method`: each of the three measured quantities is checked against the minimum, not
  only the drug; a drug quantity already above the minimum says no aliquot is needed.
- `specific-gravity`: container weights that give a specific gravity of 0 or a negative are
  refused; % w/w × specific gravity = % w/v for a liquid heavier than water moves the right way.
- `isotonicity-e-value`: solutes that already exceed 0.9% report hypertonic, not 0 g; White-Vincent
  volume larger than the final volume is flagged; an agent E-value of 0 is refused.
- `isotonicity-freezing-point`: supplied depression above 0.52 reports "at or past", never a
  negative weight.
- `buffer-ph`: equal concentrations give pH = pKa; the weak-base form is not the acid form with
  the ratio inverted twice; a zero concentration is refused.
- `percent-ionized`: pH = pKa gives 50% for both acid and base; one pH unit above the pKa gives
  90.9% for an acid and 9.1% for a base.
- `suppository-displacement`: the same batch entered under definition (a) with factor 2 and under
  (b) with factor 0.5 gives the same base; no definition chosen gives no answer; drug volume larger
  than the mold is refused.
- `capsule-fill`: an active that overfills the capsule reports "does not fit"; zero diluent when
  the active exactly fills.
- `formula-scale`: a parts formula scales to the wanted weight; a qs line with mixed units is left
  as "qs to"; scaling by one ingredient reproduces the master when the factor is 1.
- `ethanol-proof`: 95% by volume is 190 proof; 1 gallon at 190 proof is 1.9 proof gallons and
  $25.65 at $13.50; the regulation's 191-to-188 example gives 1.89 gallons per 100 unrounded and the
  page prints the regulation's 1.84 beside it (the test asserts both, and that 1.92 is not shown);
  112 to 100 proof gives 12.43 with the regulation's 12.42 beside it; raising proof is refused.
- `apothecary-household-measures`: 1 grain = 64.79891 mg; 1 minim = 0.06161152 mL; an apothecaries
  ounce (31.103 g) is not an avoirdupois ounce (28.350 g); a fluid ounce shows 29.57 mL and 30 mL with their sources; 1
  teaspoon is shown as 5 mL and as about 1⅓ fluid drams.
- `dropper-calibration`: no default drops per mL; a dose that rounds to 0 drops is reported as not
  measurable with this dropper.
- `hlb-blend`: Griffin's 3:1 example gives 10; a required HLB outside the pair is refused; S 161
  and A 198 gives 3.74 (Griffin prints 3.8; the test asserts the arithmetic and the page notes the
  paper's figure); E 65.1 and P 6.7 gives 14.36 (the paper prints 14); E 76 gives 15.2 (the paper
  prints 15).
- `compound-interstate-share` (build-gated; these apply only once the gate opens): the two tests use
  different denominators and can disagree; exactly 5% does not exceed the limit; exactly 50% is not
  "greater than 50 percent"; the enforcement note goes to "re-verify" when its ledger row is past
  its date. Until the gate opens, the test is that the id is absent from the catalog.
- `compound-copy-check`: 10% different (45 mg against a commercial 50 mg) is "within 10%", 10.1%
  is not, and the percent is taken on the commercial strength (55 mg against 50 mg is 10%, not
  9.1%); a fifth uncounted
  prescription in the month crosses the line while a fifth with a documented determination does
  not; a product in shortage is not commercially available.
- `compound-anticipatory-limit`: the highest rolling 30-day window is found across a month
  boundary; prescriptions older than a year are ignored.

## Build status

Not started. Specified October 10, 2026.
