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
  // ...extended as tiles are migrated (spec-v53 §4.3).
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
