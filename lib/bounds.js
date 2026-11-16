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
  scr: { min: 0.1, max: 25, unit: 'mg/dL', note: 'serum creatinine; values below ~0.2 are not physiologically survivable' },
  // Standing height. 0.45 m is below the shortest verified adult/neonate of
  // interest to these tiles; 2.5 m is above the tallest recorded human.
  heightM: { min: 0.45, max: 2.5, unit: 'm', note: 'height; a value below ~0.45 m usually means the unit (cm vs m) is wrong' },
  weightKg: { min: 0.3, max: 500, unit: 'kg', note: 'weight; a value below ~0.3 kg usually means the unit (g/lb vs kg) is wrong' },
  ageYears: { min: 0, max: 130, unit: 'yr', note: 'age; the verified human maximum is ~122 years' },
  hr: { min: 10, max: 300, unit: 'bpm', note: 'heart rate; sustained rates outside 10-300 are not compatible with perfusion' },
  sbp: { min: 20, max: 300, unit: 'mmHg', note: 'systolic blood pressure; values outside 20-300 are not survivable' },
  // spec-v59 §2.5: the full physiologic-envelope set the catalog consumes.
  // Each min/max is a clinically-impossible boundary (well outside the assay
  // and survivability ranges in standard references: ARUP / Mayo reference
  // intervals, Tietz Clinical Guide to Laboratory Tests), not a normal range.
  dbp: { min: 5, max: 200, unit: 'mmHg', note: 'diastolic blood pressure; values outside 5-200 are not survivable' },
  temperature: { min: 25, max: 45, unit: 'C', note: 'core temperature; survival is not recorded outside ~25-45 C' },
  rr: { min: 3, max: 80, unit: '/min', note: 'respiratory rate; sustained rates outside 3-80 are not compatible with gas exchange' },
  // spec-v1198: every other note in this table is "human name; detail", which is
  // what boundsAdvisory splits on to name the field. This one had no semicolon,
  // so the whole sentence became the name: "the plausible range for Glasgow Coma
  // Scale is defined only on 3-15 (3 to 15 points)".
  gcs: { min: 3, max: 15, unit: 'points', note: 'Glasgow Coma Scale; the scale is defined only on 3-15' },
  qtMs: { min: 200, max: 800, unit: 'ms', note: 'QT interval; values outside 200-800 ms usually mean a measurement or unit error' },
  glucose: { min: 5, max: 2000, unit: 'mg/dL', note: 'serum glucose; values outside 5-2000 are beyond recorded survivable extremes' },
  sodium: { min: 90, max: 200, unit: 'mmol/L', note: 'serum sodium; values outside 90-200 are not survivable' },
  potassium: { min: 1, max: 10, unit: 'mmol/L', note: 'serum potassium; values outside 1-10 are not survivable' },
  chloride: { min: 50, max: 160, unit: 'mmol/L', note: 'serum chloride; values outside 50-160 indicate a unit or entry error' },
  bicarbonate: { min: 2, max: 60, unit: 'mmol/L', note: 'serum bicarbonate; values outside 2-60 are not survivable' },
  calcium: { min: 3, max: 20, unit: 'mg/dL', note: 'serum calcium; values outside 3-20 are not survivable' },
  magnesium: { min: 0.3, max: 10, unit: 'mg/dL', note: 'serum magnesium; values outside 0.3-10 indicate a unit or entry error' },
  phosphate: { min: 0.2, max: 20, unit: 'mg/dL', note: 'serum phosphate; values outside 0.2-20 indicate a unit or entry error' },
  albumin: { min: 0.5, max: 7, unit: 'g/dL', note: 'serum albumin; values outside 0.5-7 indicate a unit or entry error' },
  bilirubin: { min: 0, max: 60, unit: 'mg/dL', note: 'total bilirubin; values above ~60 are beyond recorded extremes' },
  platelets: { min: 0, max: 2000, unit: 'x10^3/uL', note: 'platelet count; values above ~2000 are beyond recorded extremes' },
  inr: { min: 0.5, max: 20, unit: '', note: 'INR; values outside 0.5-20 indicate a measurement error' },
  lactate: { min: 0, max: 40, unit: 'mmol/L', note: 'serum lactate; values above ~40 are beyond recorded survivable extremes' },
  paO2: { min: 10, max: 700, unit: 'mmHg', note: 'arterial PaO2; values outside 10-700 indicate a measurement or unit error' },
  paCO2: { min: 5, max: 200, unit: 'mmHg', note: 'arterial PaCO2; values outside 5-200 are not survivable' },
  pH: { min: 6.5, max: 8, unit: '', note: 'arterial pH; survival is not recorded outside ~6.5-8.0' },
  fio2: { min: 0.21, max: 1, unit: 'fraction', note: 'FiO2 as a fraction; below 0.21 (room air) or above 1.0 is physically impossible' },
  hemoglobin: { min: 2, max: 25, unit: 'g/dL', note: 'hemoglobin; values outside 2-25 are not survivable' },
  hematocrit: { min: 5, max: 75, unit: '%', note: 'hematocrit; values outside 5-75 are not survivable' },
  wbc: { min: 0, max: 200, unit: 'x10^3/uL', note: 'white blood cell count; values above ~200 are beyond recorded extremes' },
  bun: { min: 1, max: 300, unit: 'mg/dL', note: 'blood urea nitrogen; values outside 1-300 indicate a unit or entry error' },
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
  triglycerides: { min: 1, max: 30000, unit: 'mg/dL', note: 'serum triglycerides; the highest value reported is about 22,000 mg/dL' },
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
