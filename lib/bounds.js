// spec-v53 §4.3: physiologic plausibility envelopes for common inputs.
//
// The distinction this table encodes (spec-v53 §3.3):
//   - A HARD floor (below which the math is undefined -- a zero denominator)
//     still lives in the compute function as a `num(... { min })` guard that
//     throws/returns null. Those stay.
//   - A SOFT envelope (mathematically defined but clinically implausible -- e.g.
//     a serum creatinine of 0.01 mg/dL, a height of 0.05 m) does NOT change the
//     number. It surfaces a *visible advisory note* next to the result so a
//     frankly-impossible input is never shown as a silent, authoritative value.
//
// v53 does not silently clamp a clinically-plausible value; `boundsAdvisory`
// only fires for the frankly impossible (outside [min, max]). Each bound names a
// public source for the envelope. The table is extended as tiles migrate
// (spec-v53 §4.3 -- opportunistic, not a 255-tile sweep).

export const BOUNDS = Object.freeze({
  // Serum creatinine. Below ~0.2 mg/dL is not survivable; the assay floor and
  // adult reference ranges sit well above 0.1 (Mayo/ARUP reference intervals).
  // spec-v1763: a survived value lay past the old bound (0.1 to 25): Persaud, Case Rep Nephrol 2021, doi 10.1155/2021/6048919 (73.8 mg/dL, discharged on hemodialysis).
  scr: { min: 0.1, max: 75, unit: 'mg/dL', note: 'serum creatinine; values below ~0.2 are not physiologically survivable' },
  // Standing height. 0.45 m is below the shortest verified adult/neonate of
  // interest to these tiles; 2.5 m is above the tallest recorded human.
  heightM: { min: 0.45, max: 2.5, unit: 'm', note: 'height; a value below ~0.45 m usually means the unit (cm vs m) is wrong' },
  // spec-v1762: the floor was 0.3 kg, above the smallest infant known to have survived (245 g, San Diego 2018, University
  // of Iowa Tiniest Babies Registry), so a real micro-preemie's weight was refused. 0.2 kg sits below that record.
  weightKg: { min: 0.2, max: 500, unit: 'kg', note: 'weight; a value below ~0.2 kg usually means the unit (g/lb vs kg) is wrong' },
  ageYears: { min: 0, max: 130, unit: 'yr', note: 'age; the verified human maximum is ~122 years' },
  // spec-v1763: a survived value lay past the old bound (10 to 300): Chhabra, Indian Pacing Electrophysiol J 2012, PMID 22368381 (about 600 bpm, survived); Crick, Br Heart J 1985, PMID 4015920 (pre-excited AF above 300 without severe symptoms).
  hr: { min: 10, max: 600, unit: 'bpm', note: 'heart rate; rates outside 10-600 are beyond recorded extremes' },
  // spec-v1763: a survived value lay past the old bound (20 to 300): MacDougall, J Appl Physiol 1985, PMID 3980383 (intra-arterial pressures above 480/350 mmHg).
  sbp: { min: 20, max: 500, unit: 'mmHg', note: 'systolic blood pressure; values outside 20-500 are beyond recorded extremes' },
  // spec-v59 §2.5: the full physiologic-envelope set the catalog consumes.
  // Each min/max is a clinically-impossible boundary (well outside the assay
  // and survivability ranges in standard references: ARUP / Mayo reference
  // intervals, Tietz Clinical Guide to Laboratory Tests), not a normal range.
  // spec-v1763: a survived value lay past the old bound (5 to 200): MacDougall, J Appl Physiol 1985, PMID 3980383.
  dbp: { min: 5, max: 400, unit: 'mmHg', note: 'diastolic blood pressure; values outside 5-400 are beyond recorded extremes' },
  // spec-v1763: a survived value lay past the old bound (25 to 45): Gilbert, Lancet 2000, PMID 10665559 (13.7 C); Slovis, Ann Emerg Med 1982, PMID 7073052 (46.5 C).
  temperature: { min: 13, max: 47, unit: 'C', note: 'core temperature; survival is recorded from 13.7 C and from 46.5 C' },
  rr: { min: 3, max: 80, unit: '/min', note: 'respiratory rate; sustained rates outside 3-80 are not compatible with gas exchange' },
  // spec-v1198: every other note in this table is "human name; detail", which is
  // what boundsAdvisory splits on to name the field. This one had no semicolon,
  // so the whole sentence became the name: "the plausible range for Glasgow Coma
  // Scale is defined only on 3-15 (3 to 15 points)".
  gcs: { min: 3, max: 15, unit: 'points', note: 'Glasgow Coma Scale; the scale is defined only on 3-15' },
  qtMs: { min: 200, max: 800, unit: 'ms', note: 'QT interval; values outside 200-800 ms usually mean a measurement or unit error' },
  // spec-v1763: a survived value lay past the old bound (5 to 2000): Honda, Am J Emerg Med 2012, PMID 21084169 (2,700 mg/dL, discharged on foot).
  glucose: { min: 5, max: 3000, unit: 'mg/dL', note: 'serum glucose; values outside 5-3000 are beyond recorded survivable extremes' },
  // spec-v1763: a survived value lay past the old bound (90 to 200): Scheuren, Am J Med 2000, PMID 11099688 (87 mmol/L); Das, J Med Case Rep 2015, PMID 26031517 (208 mmol/L).
  sodium: { min: 85, max: 210, unit: 'mmol/L', note: 'serum sodium; values outside 85-210 are beyond recorded survivable extremes' },
  // spec-v1762: the ceiling was 10, but survival from 14.0 mmol/L is reported (Extreme hyperkalemia, PMID 16108244)
  // and from 10.1 (Hylander, Acta Med Scand 1987). 15 sits above the record.
  potassium: { min: 1, max: 15, unit: 'mmol/L', note: 'serum potassium; values outside 1-15 are not survivable' },
  // spec-v1765: a survived value lay past the old bound (50 to 160): Akoum, Cureus 2021, PMID 34912633 (48 mEq/L); Rayamajhi, Cureus 2023, PMID 37069868 (175 mmol/L measured, bromide).
  chloride: { min: 45, max: 180, unit: 'mmol/L', note: 'serum chloride; values outside 45-180 indicate a unit or entry error' },
  // spec-v1763: a survived value lay past the old bound (2 to 60): Diagnostics 2026, doi 10.3390/diagnostics16030443 (72.7 mmol/L).
  // spec-v1765: a survived value lay past the old bound (2 to 75): Malik, Clin Case Rep 2026, PMID 41584389 (1.5 mmol/L, recovered).
  bicarbonate: { min: 1, max: 75, unit: 'mmol/L', note: 'serum bicarbonate; values outside 1-75 are beyond recorded survivable extremes' },
  // spec-v1763: a survived value lay past the old bound (3 to 20): J Med Case Rep 2026, PMID 42323684 (23 mg/dL, normocalcemia regained).
  calcium: { min: 3, max: 25, unit: 'mg/dL', note: 'serum calcium; values outside 3-25 are beyond recorded survivable extremes' },
  // spec-v1763: a survived value lay past the old bound (0.3 to 10): Front Med 2024, PMID 39021819 (8.71 mmol/L = 21.2 mg/dL, discharged).
  magnesium: { min: 0.3, max: 25, unit: 'mg/dL', note: 'serum magnesium; values outside 0.3-25 indicate a unit or entry error' },
  // spec-v1765: a survived value lay past the old bound (0.2 to 20): Biebl, Eur J Pediatr 2009, PMID 18408952 (17.75 mmol/L = 55 mg/dL, survived without sequelae).
  phosphate: { min: 0.2, max: 60, unit: 'mg/dL', note: 'serum phosphate; values outside 0.2-60 indicate a unit or entry error' },
  albumin: { min: 0.5, max: 7, unit: 'g/dL', note: 'serum albumin; values outside 0.5-7 indicate a unit or entry error' },
  // spec-v1763: a survived value lay past the old bound (0 to 60): Chowdhury, Mymensingh Med J 2022, PMID 35383780 (70.47 mg/dL).
  bilirubin: { min: 0, max: 75, unit: 'mg/dL', note: 'total bilirubin; values above ~75 are beyond recorded extremes' },
  // spec-v1763: a survived value lay past the old bound (0 to 2000): Case Rep Oncol 2020, PMID 32595470 (3,602 x10^3/uL).
  platelets: { min: 0, max: 4000, unit: 'x10^3/uL', note: 'platelet count; values above ~4000 are beyond recorded extremes' },
  // spec-v1765: a survived value lay past the old bound (0.5 to 20): Tsutaoka, Pharmacotherapy 2003, PMID 14524650 (INR 189 after brodifacoum, doing well at 5 months).
  inr: { min: 0.5, max: 200, unit: '', note: 'INR; values outside 0.5-200 are beyond recorded extremes' },
  // spec-v1763: a survived value lay past the old bound (0 to 40): Case Rep Med 2016, PMID 27974893 (47.6 mmol/L, recovered).
  lactate: { min: 0, max: 50, unit: 'mmol/L', note: 'serum lactate; values above ~50 are beyond recorded survivable extremes' },
  paO2: { min: 10, max: 700, unit: 'mmHg', note: 'arterial PaO2; values outside 10-700 indicate a measurement or unit error' },
  // spec-v1763: a survived value lay past the old bound (5 to 200): Am J Case Rep 2026, PMID 42424244 (213.3 mmHg, discharged home).
  paCO2: { min: 5, max: 250, unit: 'mmHg', note: 'arterial PaCO2; values outside 5-250 are beyond recorded survivable extremes' },
  // spec-v1763: a survived value lay past the old bound (6.5 to 8): Opdahl, Crit Care Med 1997, PMID 9267961 (pH 6.33 after near drowning).
  pH: { min: 6.3, max: 8, unit: '', note: 'arterial pH; survival is not recorded outside ~6.3-8.0' },
  fio2: { min: 0.21, max: 1, unit: 'fraction', note: 'FiO2 as a fraction; below 0.21 (room air) or above 1.0 is physically impossible' },
  // spec-v1765: a survived value lay past the old bound (2 to 25): Negro, J Hypertens 2020, PMID 31568062 (25.3 g/dL).
  // spec-v1768: the floor now names a recorded survival (2 before): de Araujo Azi, Transfusion 2014, PMID 24117834 (1.4 g/dL, survived without sequelae).
  hemoglobin: { min: 1, max: 26, unit: 'g/dL', note: 'hemoglobin; values outside 1-26 are beyond recorded extremes' },
  // spec-v1765: a survived value lay past the old bound (5 to 75): Braig, Fetal Diagn Ther 2009, PMID 19372698 (88% in a recipient twin, good outcome).
  // spec-v1768: the floor now names a recorded survival (5 before): the same case (hemoglobin 1.4 g/dL is a hematocrit of about 4%).
  hematocrit: { min: 3, max: 90, unit: '%', note: 'hematocrit; values outside 3-90 are beyond recorded extremes' },
  // spec-v1763: a survived value lay past the old bound (0 to 200): Bian, Front Pediatr 2024, PMID 39717192 (1,755 x10^3/uL, recovered).
  wbc: { min: 0, max: 2000, unit: 'x10^3/uL', note: 'white blood cell count; values above ~2000 are beyond recorded extremes' },
  // spec-v1765: a survived value lay past the old bound (1 to 300): Sinha, J Intensive Care Soc 2015, PMID 28979444 (BUN 306.7 mg/dL, survived on dialysis).
  bun: { min: 1, max: 310, unit: 'mg/dL', note: 'blood urea nitrogen; values outside 1-310 indicate a unit or entry error' },
  eGFR: { min: 0, max: 200, unit: 'mL/min/1.73m2', note: 'estimated GFR; a value above ~200 usually means an implausibly low creatinine was entered' },
  // spec-v1207: the three numeric NICE CG32 refeeding criteria. BMI is the one
  // the last wave named, and it is the interesting direction: an impossible BMI
  // does not add a criterion, it REMOVES one, so the error lands on the
  // reassuring side. The lowest BMI recorded in a surviving adult is ~7.5
  // (published case reports of severe anorexia nervosa); the heaviest recorded
  // human, Jon Brower Minnoch, reached ~185 kg/m^2.
  bmi: { min: 5, max: 200, unit: 'kg/m^2', note: 'body mass index; values outside 5-200 are beyond recorded human extremes' },
  // Not a clinical judgment at all -- you cannot lose more than the whole of
  // your body weight. The ceiling is arithmetic (spec-v1189: enforce what is
  // written, decide nothing clinical).
  percentWeightLoss: { min: 0, max: 100, unit: '%', note: 'unintentional weight loss; losing more than 100% of body weight is arithmetically impossible' },
  // The longest documented medically-supervised fast is Angus Barbieri's 382
  // days (Stewart & Fleming, Postgrad Med J 1973), so 400 is frankly impossible
  // above without naming a survivable limit.
  daysNoIntake: { min: 0, max: 400, unit: 'days', note: 'days with little or no nutritional intake; the longest documented supervised fast lasted 382 days' },
  // spec-v1734: the quantities spec-v1731 listed as unbounded, where a recorded
  // extreme could be found. The highest serum triglyceride reported is 22,228
  // mg/dL, in a 13-year-old in diabetic ketoacidosis, which its authors say
  // exceeds every earlier report (J Med Cases 2020; PMC8383553).
  // spec-v1765: a survived value lay past the old bound (1 to 30000): El-Koofy, Lipids Health Dis 2021, PMID 33879184 (33,727 mg/dL, discharged).
  triglycerides: { min: 1, max: 35000, unit: 'mg/dL', note: 'serum triglycerides; the highest value reported is about 33,700 mg/dL' },
  // No single record is published for the aminotransferases. Case reports reach
  // AST 15,500 and ALT 11,600 U/L (a nearly 300-fold rise in a 53-year-old with
  // respiratory failure and sepsis), so twice that is past anything reported.
  alt: { min: 1, max: 30000, unit: 'U/L', note: 'ALT; reported values reach about 11,600 U/L' },
  ast: { min: 1, max: 30000, unit: 'U/L', note: 'AST; reported values reach about 15,500 U/L' },
  // spec-v1735: three more of spec-v1731's quantities. The Westergren tube the
  // ICSH reference method uses is graduated 0 to 200 mm, so an ESR read over one
  // hour cannot exceed 200 mm/h (the bound ASDAS and the SEA pathway already
  // enforced on their own).
  esr: { min: 0, max: 200, unit: 'mm/h', note: 'erythrocyte sedimentation rate; the Westergren scale reads 0 to 200 mm' },
  // The 6-minute walk test is walked, not run (ATS statement, Am J Respir Crit
  // Care Med 2002;166:111-117). The 20 km race-walk world record (1:16:36, 2015)
  // covers about 1,570 m in six minutes, so 2,000 m is past any walked distance
  // (the bound COMPERA 2.0 already enforced).
  sixMinuteWalkM: { min: 0, max: 2000, unit: 'm', note: '6-minute walk distance; even the race-walk world-record pace covers about 1,570 m in six minutes' },
  // Serum hCG (IU/L and mIU/mL are the same number). A partial mole reached
  // 1,861,011 IU/L (Keles et al, Haydarpasa Numune Med J 2022;62(4):454-457,
  // doi 10.14744/hnhj.2021.23865); complete moles can run higher, so the ceiling
  // sits at five times that report. 0 is a real (undetectable) result.
  hcg: { min: 0, max: 10000000, unit: 'mIU/mL', note: 'serum hCG; case reports reach about 1.9 million mIU/mL' },
  // spec-v1823: two of the quantities probe-unguarded-sibling has been asking for since spec-v1731, each
  // fenced the way spec-v1734 fences the rest -- past the highest value the literature reports, by a
  // margin, so the envelope refuses the impossible and nothing a patient has survived.
  //
  // A total cholesterol in the THOUSANDS is reached by lipoprotein-X accumulation in cholestasis, not by
  // familial hypercholesterolemia: 2,554 mg/dL in a 26-year-old with primary sclerosing cholangitis
  // (JACC Case Rep 2023, "Lipoprotein-X: A Case of Falsely Elevated LDL Hypercholesterolemia"), 2,415
  // mg/dL in primary biliary cirrhosis, normalised over 16 plasmapheresis sessions, and 1,730 mg/dL in an
  // 18-month-old with extrahepatic cholestasis. 5,000 mg/dL is past all of them.
  //
  // Mind the UNIT on this one. It is a mg/dL envelope, and `non-hdl-remnant` carries a mg/mmol select that
  // rescales its three lipids by 38.67, so it cannot take a static declaration at all -- the category
  // probe-undeclared-cap counts separately.
  cholesterol: { min: 1, max: 5000, unit: 'mg/dL', note: 'total cholesterol; the highest reported are about 2,550 mg/dL in lipoprotein-X cholestasis' },
  // C-reactive protein, in mg/L. The highest value a review of extremely elevated CRP reports is 839 mg/L
  // (a Belgian series in which infection accounted for 88% of the values above 500 mg/L); a retrospective
  // series of CRP over 200 mg/L peaked at 580, and Landry et al at 576. 2,000 mg/L is past all of them.
  // A CRP reported in mg/dL is the same analyte at a tenth of the number and is NOT this envelope.
  crp: { min: 0, max: 2000, unit: 'mg/L', note: 'C-reactive protein; the highest reported is about 839 mg/L' },
  // spec-v1825: a SPOT URINE CREATININE, and the only envelope here fenced by an ASSAY limit rather than a
  // biological extreme -- which is the stronger claim, because above it no laboratory reports a result at
  // all. CDC's NHANES laboratory procedure manual for August 2021 - August 2023 (analyte: urine
  // creatinine, Roche Cobas 8000, University of Minnesota ARDL), section 9 "Reportable range of results",
  // page 15 of 22, read from the PDF itself:
  //
  //   "Analytical Measurement Range: 1.1-610 mg/dL"
  //   "Clinically Reportable Range: 5-1525 mg/dL"
  //   "Linear range of the method: 1.1-610 mg/dL. Specimens exceeding the high limit are automatically
  //    diluted (1:2.5) by the instrument ... The maximum allowable dilution is 1:2.5."
  //   "Limit of Detection (standard 1 + 3SD) 1.1 mg/dL"
  //
  // So 1,525 mg/dL is the top of what that assay reports after its maximum dilution, and the fence sits
  // past it rather than at it, because another laboratory's assay may report further.
  //
  // THIS IS NOT `scr`. A serum creatinine runs 0.1 to 75 mg/dL here; a spot urine creatinine of 127 mg/dL
  // is the NHANES mean. The compartment rule in scripts/lib/quantity-name.mjs already keeps `scr` off a
  // urine field, and this envelope is the one that fits it. It is also NOT for a field whose unit is
  // SHARED with the analyte beside it -- `cccr`, `tmp-gfr` and `urine-calcium-cr` say "shared creatinine
  // unit" and "same mass unit as calcium", and a mg/dL fence on an unstated unit is spec-v1205's trap.
  urineCreatinine: { min: 1, max: 2000, unit: 'mg/dL', note: 'spot urine creatinine; CDC NHANES reports it over 5 to 1,525 mg/dL' },
  // spec-v1747: base excess, a signed quantity. The highest survived is +48 mEq/L (Giovannini et al, "Exceptional
  // nonfatal metabolic alkalosis (blood base excess +48 mEq/l)", Intensive Care Med 2005); a base excess of
  // -34.2 mmol/L at pH 6.53 was survived after hemorrhagic shock (BMJ Case Rep 2013). The envelope sits past both
  // by the margin spec-v1734 used. Base deficit is the same quantity with the sign turned.
  // spec-v1752: oxygen saturation is the share of hemoglobin carrying oxygen, so it is 0 to 100 % by definition
  // (arithmetic, no record needed). An SpO2 of 150 read fullPIERS's lowest-risk band.
  spo2: { min: 0, max: 100, unit: '%', note: 'oxygen saturation; a saturation is a share of hemoglobin and cannot exceed 100%' },
  baseExcess: { min: -60, max: 70, unit: 'mmol/L', note: 'base excess; survived values reach about -34 and +48 mmol/L' },
  baseDeficit: { min: -70, max: 60, unit: 'mmol/L', note: 'base deficit; survived values reach about 34 (a base excess of -34) and -48 mmol/L' },
});

// boundsAdvisory(key, value) -> advisory string, or null when the value is
// within the plausible envelope (or the key/value is not checkable). Pure and
// directly unit-testable (spec-v53 §6 pins the three confirmed Class-B sites).
// The renderer shows the string next to the computed result; it never changes
// the result itself.
export function boundsAdvisory(key, value) {
  const b = BOUNDS[key];
  if (!b) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < b.min || value > b.max) {
    const dir = value < b.min ? 'below' : 'above';
    // spec-v1017: this sentence is read by a nurse, and it used to name the
    // field by the developer's key -- "the plausible range for weightKg". Every
    // note here already opens with the human name of the quantity ("weight; a
    // value below ~0.3 kg usually means..."), so the label comes from there and
    // the rest of the note follows the sentence. spec-v1015 did the same for
    // lib/num.js and missed this one, which is the other half of the same
    // reader-facing surface.
    const [label, ...rest] = String(b.note).split(';');
    const name = label.trim() || key;
    const detail = rest.join(';').trim();
    const tail = detail ? ` ${detail.charAt(0).toUpperCase()}${detail.slice(1)}.` : '';
    // spec-v1198: two bounds in this table are unitless -- arterial pH and the
    // Glasgow Coma Scale carry `unit: ''` and `unit: 'points'` -- and the space
    // was unconditional, so pH read "(6.5 to 8 )". Only visible once a tile with
    // a unitless envelope started using this sentence.
    const range = `${b.min} to ${b.max}${b.unit ? ` ${b.unit}` : ''}`;
    return `Input ${dir} the plausible range for ${name} (${range}); verify the units.${tail}`;
  }
  return null;
}

// spec-v1762: the envelopes whose FLOOR is not a recorded extreme. Hemoglobin of 0.7-1.8 g/dL has been survived,
// congenital analbuminemia runs albumin below 0.1 g/dL, neonatal glucose reads in single digits: a critical-low
// value there must be flagged, not refused. Their ceilings still hold (scripts/lib/envelope-map.mjs NO_FLOOR_KEYS
// keeps the finders in step).
// spec-v1768: hemoglobin and hematocrit left this list once their floors named a recorded survival (1.4 g/dL).
export const CEILING_ONLY = Object.freeze(new Set(['albumin', 'glucose']));

// boundsAdvisory, but only above the ceiling for a CEILING_ONLY key.
export function envelopeAdvisory(key, value) {
  const b = BOUNDS[key];
  if (b && CEILING_ONLY.has(key) && typeof value === 'number' && value <= b.max) return null;
  return boundsAdvisory(key, value);
}
