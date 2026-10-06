// spec-v1559 tool 3: newborn temperature: normal, cold stress, moderate or severe hypothermia, or
// hyperthermia, with WHO's rewarming (WHO 1997).
//
// Source: WHO. Thermal protection of the newborn: a practical guide. WHO/RHT/MSM/97.2, 1997 (IRIS
// 10665/63986; WHO copyright, facts restated). Read October 6, 2026, chapter 2 (pp. 16-21): normal 36.5-37.5
// C; 36.0-36.4 cold stress (mild hypothermia), a cause for concern; 32.0-35.9 moderate hypothermia, danger,
// warm the baby; below 32 severe hypothermia, outlook grave, skilled care urgently needed; above 37.5
// hyperthermia. Rewarming: mild, skin-to-skin in a room of at least 25 C; moderate, a radiant heater, an
// incubator at 35-36 C, a heated water-filled mattress, a room at 32-34 C or a warmed cot, checking the
// temperature every hour; severe, fast rewarming over a few hours (heated mattress at 37-38 C or incubator
// air at 35-36 C). Keep feeding (hypothermic babies often become hypoglycemic). Axillary is the usual site;
// rectal is more accurate when hypothermia is suspected.
//
// Stated rather than hidden: IMCI's young-infant sign uses below 35.5 C, a different threshold for another
// purpose; it is named, not merged.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const UNIT_OPTIONS = [{ value: 'C', text: '°C', default: true }, { value: 'F', text: '°F' }];
export const SITE_OPTIONS = [{ value: 'axillary', text: 'Axillary' }, { value: 'rectal', text: 'Rectal' }];

const NOTE = 'This follows WHO\'s Thermal protection of the newborn (1997). Keep the baby feeding while rewarming.';

export function newbornTemperatureWho(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const unit = o.unit === 'F' ? 'F' : 'C';
  const f = unit === 'F' ? inputFault([['the temperature', o.temp, 77, 110, '°F']]) : inputFault([['the temperature', o.temp, 25, 43, '°C']]);
  if (f) return { valid: false, message: f };
  const c = unit === 'F' ? Math.round((((Number(o.temp) - 32) * 5) / 9) * 10) / 10 : Math.round(Number(o.temp) * 10) / 10;
  const notes = [];
  if (unit === 'F') notes.push(`${o.temp} °F is ${c} °C.`);
  if (o.site !== 'axillary' && o.site !== 'rectal') notes.push('Site: not entered. Axillary is usual; rectal is more accurate when hypothermia is suspected.');
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (c < 35.5) notes.push('Below 35.5 °C is also an IMCI sign of possible serious illness in a young infant: assess and refer as IMCI directs.');
  if (c < 32) {
    notes.push('Rewarm fast, over a few hours: a heated mattress at 37-38 °C or an incubator with air at 35-36 °C; if nothing is available, skin-to-skin or a warm room or cot. Watch the blood glucose; set up IV glucose if the baby cannot feed.');
    return out(`Severe hypothermia (${c} °C, below 32 °C): outlook grave, skilled care urgently needed.`, 'Severe hypothermia', true);
  }
  if (c < 36) {
    notes.push('Rewarm under a radiant heater, in an incubator at 35-36 °C, on a heated water-filled mattress, or in a room at 32-34 °C; check the temperature every hour until it is normal. Keep feeding.');
    return out(`Moderate hypothermia (${c} °C, 32.0-35.9 °C): danger, warm the baby.`, 'Moderate hypothermia', true);
  }
  if (c < 36.5) {
    notes.push('Rewarm skin-to-skin with the mother in a room of at least 25 °C, and keep breastfeeding.');
    return out(`Cold stress, mild hypothermia (${c} °C, 36.0-36.4 °C): a cause for concern.`, 'Cold stress', true);
  }
  if (c <= 37.5) return out(`Normal (${c} °C, 36.5-37.5 °C).`, 'Normal', false);
  notes.push('Look for overwrapping, a hot room or sun, and for infection.');
  return out(`Hyperthermia (${c} °C, above 37.5 °C).`, 'Hyperthermia', true);
}
