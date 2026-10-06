// spec-v1556 tool 2: the Lee-White clotting time after a snakebite (Brazil).
//
// Source: Brasil, Ministério da Saúde. Guia de Vigilância em Saúde, 6th ed. revised, vol. 3, 2024 (CC
// BY-NC-SA 4.0, facts restated; owner decision D3), "Acidentes por animais peçonhentos", the clotting-time
// method and Quadro 6 (p. 1154). Read October 6, 2026: two glass tubes with 1 mL of blood each in a 37 C water
// bath; from minute 5, tilt the same tube every minute; the time is the minute the blood no longer runs down
// the wall; confirm with the second tube. Up to 9 minutes normal; 10-30 prolonged; over 30 incoagulable.
// Results vary with the blood volume, the number of tilts and the bath temperature.
//
// Stated rather than hidden: this is not the 20-minute whole blood clotting test (20WBCT); the two are never
// cross-applied. The time is read in whole minutes.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];

const NOTE = 'This follows Brazil\'s Guia de Vigilância em Saúde (2024), Quadro 6. It is not the 20WBCT.';

export function leeWhiteClottingTime(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the clotting time', o.minutes, 0, 120, 'minutes']]);
  if (f) return { valid: false, message: f };
  const m = Number(o.minutes);
  if (!Number.isInteger(m)) return { valid: false, message: 'Enter the clotting time in whole minutes: the tube is read once a minute.' };
  const notes = [];
  if (o.protocol === 'no') notes.push('Not done by the method: the result varies with the blood volume, the number of tilts and the bath temperature, so read it with caution.');
  else if (o.protocol !== 'yes') notes.push('Method: not entered. Two glass tubes, 1 mL each, 37 °C water bath, tilted each minute from minute 5; confirm with the second tube.');
  notes.push('In Bothrops, Lachesis and Crotalus accidents a clotting abnormality counts toward the severity class; repeat it to follow the response to antivenom.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (m <= 9) return out(`Normal: ${m} minutes (up to 9).`, 'Normal', false);
  if (m <= 30) return out(`Prolonged: ${m} minutes (10 to 30).`, 'Prolonged', true);
  return out(`Incoagulable: over 30 minutes (${m}).`, 'Incoagulable', true);
}
