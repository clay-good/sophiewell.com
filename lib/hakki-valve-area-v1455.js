// spec-v1455: Hakki simplified valve area formula.
//
// Source, read 2026-09-25: Hakki AH, Iskandrian AS, Bemis CE, et al. A simplified valve formula for
// the calculation of stenotic cardiac valve areas. Circulation 1981;63(5):1050-1055 (abstract,
// PubMed 7471364): "The valve area was measured by the simplified formula as cardiac output (l/min)
// divided by the square root of pressure differences across the valve." Against the original Gorlin
// formula in 100 consecutive patients: aortic stenosis r = 0.96 (SEE +/- 0.10), and "The correlation
// was unchanged when the peak gradient was used instead of the mean gradient"; mitral stenosis
// r = 0.94 (SEE +/- 0.19).
//
// Input limits are the ones the catalog's Gorlin tool already applies (cardiac output up to 20
// L/min, gradient up to 200 mmHg), so the two tools refuse the same values. Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const HAKKI_VALVES = [
  { value: 'aortic', text: 'Aortic' },
  { value: 'mitral', text: 'Mitral' },
];

export function hakkiValveArea(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const valve = HAKKI_VALVES.some((x) => x.value === o.valve) ? o.valve : null;
  if (!valve) return { valid: false, message: 'Choose the valve: aortic or mitral.' };
  const fault = inputFault([
    ['the cardiac output', o.co, null, 20, 'L/min'],
    ['the pressure gradient', o.grad, null, 200, 'mmHg'],
  ]);
  if (fault) return { valid: false, message: fault };
  const co = Number(o.co);
  const grad = Number(o.grad);
  const area = Math.round((co / Math.sqrt(grad)) * 100) / 100;
  const agreement = valve === 'aortic'
    ? 'In aortic stenosis it agreed closely with the Gorlin formula (r 0.96), with the peak or the mean gradient.'
    : 'In mitral stenosis it agreed with the Gorlin formula (r 0.94), less tightly than in aortic stenosis.';
  return {
    valid: true,
    abnormal: false,
    area,
    band: `Estimated ${valve} valve area ${area.toFixed(2)} cm2: cardiac output ${co} L/min divided by the square root of a ${grad} mmHg gradient.`,
    bandLabel: `${area.toFixed(2)} cm2`,
    notes: [
      agreement,
      'A bedside simplification of the Gorlin formula; the full Gorlin calculation also uses the heart rate and the ejection or filling period.',
    ],
    note: 'Hakki AH et al, Circulation 1981 (100 consecutive catheterized patients).',
  };
}
