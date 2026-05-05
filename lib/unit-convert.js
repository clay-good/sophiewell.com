// spec-v4 §5 utility 192: Universal Unit Converter (lab + vitals + basics).
// Pure conversion functions. Each returns a number (or throws).

// --- Lab values --------------------------------------------------------
export const LAB = {
  glucose: { from: 'mg/dL', to: 'mmol/L', factor: 1 / 18 },          // mg/dL * 0.0555
  cholesterol: { from: 'mg/dL', to: 'mmol/L', factor: 1 / 38.67 },   // mg/dL * 0.02586
  creatinine: { from: 'mg/dL', to: 'umol/L', factor: 88.4 },         // mg/dL * 88.4
  bun: { from: 'mg/dL', to: 'mmol/L', factor: 1 / 2.8 },             // BUN -> urea mmol/L
  calcium: { from: 'mg/dL', to: 'mmol/L', factor: 1 / 4 },           // mg/dL / 4
  uricAcid: { from: 'mg/dL', to: 'umol/L', factor: 59.48 },
};

export function labConvert(kind, value, direction = 'toSi') {
  const r = LAB[kind];
  if (!r) throw new RangeError(`unknown lab kind ${kind}`);
  return direction === 'toSi' ? value * r.factor : value / r.factor;
}

// HbA1c % <-> IFCC mmol/mol: IFCC = (NGSP - 2.15) * 10.929
export function a1cPctToIfcc(pct) { return (pct - 2.15) * 10.929; }
export function a1cIfccToPct(ifcc) { return ifcc / 10.929 + 2.15; }

// --- Vitals ------------------------------------------------------------
export function mmHgToKpa(v) { return v * 0.133322; }
export function kpaToMmHg(v) { return v / 0.133322; }
export function fToC(f) { return (f - 32) * 5 / 9; }
export function cToF(c) { return c * 9 / 5 + 32; }

// --- Basics ------------------------------------------------------------
export function inchesToCm(v) { return v * 2.54; }
export function cmToInches(v) { return v / 2.54; }
export function feetInToCm(ft, inches) { return (ft * 12 + inches) * 2.54; }
export function lbToKg(v) { return v * 0.45359237; }
export function kgToLb(v) { return v / 0.45359237; }

// Pediatric weight: lb + oz -> kg.
export function lbOzToKg(lb, oz) {
  if (lb < 0 || oz < 0 || oz >= 16) throw new RangeError('lb >= 0 and 0 <= oz < 16');
  const totalLb = lb + oz / 16;
  return lbToKg(totalLb);
}
export function kgToLbOz(kg) {
  const totalLb = kgToLb(kg);
  const lb = Math.floor(totalLb);
  const oz = (totalLb - lb) * 16;
  return { lb, oz };
}
