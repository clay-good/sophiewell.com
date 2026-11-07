// spec-v1704 (biosignal-analysis tool 7): carotid-femoral pulse wave velocity = path length / transit time.
// Van Bortel LM, et al. J Hypertens 2012;30:445-448 (the abstract): "the use of 80% of the direct carotid-femoral
// distance as the most accurate distance estimate" and "10 m/s as new cut-off value". Townsend RR, et al. AHA
// Scientific Statement, Hypertension 2015, Recommendation 6.1: the subtraction method or "multiplying the total
// directly measured distance by 0.8 (Class I, LOE B)"; the 10 m/s value was derived for the 80% method. So the
// 10 m/s reference is printed beside an 80% result only, and no factor converts between methods.
//
// Pure: no DOM, no clock, no network.

import { measured } from './num.js';

export const METHOD_OPTIONS = [
  { value: 'direct80', text: '80% of the direct carotid-femoral distance' },
  { value: 'subtraction', text: 'Subtraction (notch to femoral minus notch to carotid)' },
];
const sig = (x) => Number(x.toPrecision(3));

export function pwvCarotidFemoral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const method = String(o.method ?? '').trim();
  if (method !== 'direct80' && method !== 'subtraction') return { valid: false, message: 'Choose how the path length was measured: 80% of the direct distance, or subtraction.' };
  const tt = measured(o.transitMs);
  if (tt === null || !(tt > 0)) return { valid: false, message: 'Enter the carotid-to-femoral transit time in milliseconds, above 0.' };
  let path;
  let how;
  if (method === 'direct80') {
    const d = measured(o.directMm);
    if (d === null || !(d > 0)) return { valid: false, message: 'Enter the direct carotid-femoral distance in millimeters, above 0.' };
    path = 0.8 * d;
    how = `path = 0.8 x ${d} mm = ${sig(path)} mm`;
  } else {
    const f = measured(o.notchFemoralMm);
    const c = measured(o.notchCarotidMm);
    if (f === null || c === null || !(f > 0) || !(c > 0)) return { valid: false, message: 'Enter both distances in millimeters: sternal notch to femoral, and sternal notch to carotid.' };
    if (!(f > c)) return { valid: false, message: 'The notch-to-femoral distance must be longer than the notch-to-carotid distance.' };
    path = f - c;
    how = `path = ${f} - ${c} mm = ${sig(path)} mm`;
  }
  const pwv = path / tt; // mm per ms is m/s
  if (!Number.isFinite(pwv)) return { valid: false, message: 'These inputs give no finite velocity.' };
  const notes = [`PWV = path / transit time: ${how}; ${sig(path)} mm / ${tt} ms = ${sig(pwv)} m/s.`];
  if (method === 'direct80') notes.push(`Reference value for the 80% method: 10 m/s (Van Bortel 2012 consensus; AHA 2015: "derived by multiplying 12 m/s by 0.8 and then rounding up"). This result is ${pwv >= 10 ? 'at or above' : 'below'} it.`);
  else notes.push('No reference value is printed for the subtraction method: the 10 m/s value was derived for 80% of the direct distance, and no conversion between the methods is built in.');
  return {
    valid: true, pwv: sig(pwv), abnormal: false,
    band: `PWV ${sig(pwv)} m/s (${method === 'direct80' ? '80% of the direct distance' : 'subtraction method'}).`,
    bandLabel: `${sig(pwv)} m/s`,
    notes,
    note: 'A measurement, not a diagnosis. The path length method changes the number; compare results measured the same way.',
  };
}
