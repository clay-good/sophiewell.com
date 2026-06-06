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
  gcs: { min: 3, max: 15, unit: 'points', note: 'Glasgow Coma Scale is defined only on 3-15' },
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
    return `Input ${dir} the plausible range for ${key} (${b.min} to ${b.max} ${b.unit}); verify the units. ${b.note}.`;
  }
  return null;
}
