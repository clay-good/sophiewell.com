// spec-v1558 tool 1: does a bleed after birth meet WHO's 2025 criteria for postpartum hemorrhage, so the
// first-response bundle starts now, and is tranexamic acid still within its window?
//
// Source: WHO/FIGO/ICM. Consolidated guidelines for the prevention, diagnosis and treatment of postpartum
// haemorrhage, 26 September 2025 (IRIS 10665/382923; CC BY-NC-SA 3.0 IGO, facts restated, nothing reproduced).
// Read October 6, 2026:
//   - Recommendation 22 (p. 39): objectively measured loss of 300 mL or more with any abnormal sign (pulse
//     above 100, shock index above 1, systolic below 100, diastolic below 60), or 500 mL or more, whichever
//     comes first within 24 hours of birth, with particular vigilance in the first 2 hours. The criteria
//     start first response and referral, not advanced therapy or surgery on their own.
//   - Recommendation 29: the first-response bundle is uterine massage, an oxytocic, tranexamic acid, IV fluids,
//     examination of the genital tract, and escalation; ideally all started within 15 minutes of diagnosis.
//   - Recommendation 27 (p. 44): tranexamic acid 1 g (100 mg/mL) IV at 1 mL/min (over 10 minutes), within 3
//     hours of birth (the clock starts at birth), whatever the cause; a second 1 g if bleeding continues
//     after 30 minutes or restarts within 24 hours of completing the first dose; not after 3 hours. Reports of
//     inadvertent intrathecal injection are cited (p. 34).
//   - Recommendations 24-25: IV oxytocin first (10 IU, diluted, slowly over 1-2 minutes or infused over 5-10);
//     if unavailable or not working, IV ergometrine, oxytocin-ergometrine, or a prostaglandin including
//     sublingual misoprostol 800 micrograms.
//
// Edges stated rather than hidden: a blank vital sign is not normal, so 300-499 mL with any sign missing asks
// for it; the 3-hour limit's inclusiveness is not stated, and exactly 3 hours is read as within.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const BLEEDING_OPTIONS = [
  { value: 'continues', text: 'Still bleeding' },
  { value: 'restarted', text: 'Stopped, then restarted' },
  { value: 'stopped', text: 'Stopped' },
];

const NOTE = 'This follows the WHO/FIGO/ICM postpartum hemorrhage guidelines of 26 September 2025. Your national protocol may differ; follow it.';
const blank = (v) => v === undefined || v === null || String(v).trim() === '';
const hm = (hours) => {
  const mins = Math.round(hours * 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
};
const r2 = (x) => String(Math.round(x * 100) / 100);

export function pphWho2025(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the measured blood loss', o.loss, 0, 5000, 'mL'], ['the time since birth', o.hours, 0, 72, 'hours']]);
  if (f) return { valid: false, message: f };
  const vit = {};
  for (const [k, label, lo, hi, unit] of [['pulse', 'the pulse', 20, 250, 'per minute'], ['sbp', 'the systolic pressure', 30, 260, 'mmHg'], ['dbp', 'the diastolic pressure', 10, 200, 'mmHg']]) {
    if (blank(o[k])) continue;
    const fv = inputFault([[label, o[k], lo, hi, unit]]);
    if (fv) return { valid: false, message: fv };
    vit[k] = Number(o[k]);
  }
  if (!blank(o.txa) && !YES_NO.some((x) => x.value === o.txa)) return { valid: false, message: 'Choose whether tranexamic acid has been given.' };
  if (!blank(o.bleeding) && !BLEEDING_OPTIONS.some((x) => x.value === o.bleeding)) return { valid: false, message: 'Choose the bleeding now from the list.' };
  let txaMin = null;
  if (o.txa === 'yes' && !blank(o.txaMinutes)) {
    const ft = inputFault([['the minutes since the first tranexamic acid dose', o.txaMinutes, 0, 4320]]);
    if (ft) return { valid: false, message: ft };
    txaMin = Number(o.txaMinutes);
  }
  const loss = Number(o.loss);
  const hours = Number(o.hours);

  if (hours > 24) {
    return {
      valid: true,
      band: `${hm(hours)} after birth is outside WHO's 24-hour window for these criteria, so they cannot say whether this is postpartum hemorrhage. That is not a "no": assess the bleeding clinically.`,
      bandLabel: 'Outside the 24-hour window',
      abnormal: false,
      notes: [],
      note: NOTE,
    };
  }

  // Each abnormal sign, judged only when its values were entered.
  const signs = [];
  const abnormal = [];
  if ('pulse' in vit) { signs.push(`pulse ${vit.pulse} (abnormal above 100)`); if (vit.pulse > 100) abnormal.push('pulse above 100'); }
  if ('pulse' in vit && 'sbp' in vit) {
    const si = vit.pulse / vit.sbp;
    signs.push(`shock index ${r2(si)} (abnormal above 1)`);
    if (si > 1) abnormal.push('shock index above 1');
  }
  if ('sbp' in vit) { signs.push(`systolic ${vit.sbp} (abnormal below 100)`); if (vit.sbp < 100) abnormal.push('systolic below 100'); }
  if ('dbp' in vit) { signs.push(`diastolic ${vit.dbp} (abnormal below 60)`); if (vit.dbp < 60) abnormal.push('diastolic below 60'); }
  const missing = [['pulse', 'the pulse'], ['sbp', 'the systolic pressure'], ['dbp', 'the diastolic pressure']].filter(([k]) => !(k in vit)).map(([, l]) => l);

  let met = false;
  let why = '';
  if (loss >= 500) { met = true; why = `${loss} mL measured, 500 mL or more`; }
  else if (loss >= 300 && abnormal.length) { met = true; why = `${loss} mL measured with ${abnormal.join(', ')}`; }
  else if (loss >= 300 && missing.length) {
    return { valid: false, message: `Enter ${missing.join(', ')}: with ${loss} mL measured, any abnormal sign meets WHO's criteria. A blank sign is not a normal one.` };
  }

  const notes = [];
  if (signs.length) notes.push(`Signs: ${signs.join('; ')}.`);
  // A sign left blank cannot change this answer (500 mL or more, an abnormal sign already found, or under
  // 300 mL), but it is still said, never read as normal.
  if (missing.length) notes.push(`Not entered: ${missing.join(', ')}. The answer holds whatever ${missing.length === 1 ? 'it shows' : 'they show'}.`);
  if (!met) {
    notes.push('Keep measuring the loss objectively (for example with a calibrated drape) and rechecking pulse and blood pressure, especially in the first 2 hours. Clinical judgement guides care below the thresholds.');
    return {
      valid: true,
      band: loss >= 300
        ? `Not yet: ${loss} mL measured with no abnormal sign, below 500 mL. WHO's criteria for postpartum hemorrhage are not met now.`
        : `Not yet: ${loss} mL measured is below 300 mL. WHO's criteria for postpartum hemorrhage are not met now.`,
      bandLabel: 'Criteria not met yet',
      abnormal: false,
      notes,
      note: NOTE,
    };
  }

  notes.push('Oxytocic: IV oxytocin first (10 IU, diluted, slowly over 1 to 2 minutes, or infused over 5 to 10). If it is unavailable or the bleeding does not respond: IV ergometrine, oxytocin-ergometrine, or a prostaglandin such as misoprostol 800 micrograms under the tongue.');
  // Tranexamic acid.
  const dose = '1 g IV at 1 mL a minute (over 10 minutes)';
  if (o.txa === 'yes') {
    if (o.bleeding === 'continues') {
      if (txaMin === null) notes.push(`Tranexamic acid: if bleeding continues 30 minutes after the first dose, give a second dose of ${dose}. No time since the first dose was entered.`);
      else if (txaMin >= 30) notes.push(`Tranexamic acid: the second dose is due (still bleeding ${txaMin} minutes after the first): ${dose}.`);
      else notes.push(`Tranexamic acid: if bleeding continues at 30 minutes after the first dose, ${30 - txaMin} minutes from now, give a second dose of ${dose}.`);
    } else if (o.bleeding === 'restarted') {
      if (txaMin === null) notes.push(`Tranexamic acid: bleeding that restarts within 24 hours of the first dose gets a second dose of ${dose}. No time since the first dose was entered.`);
      else if (txaMin <= 24 * 60) notes.push(`Tranexamic acid: the second dose is due (bleeding restarted within 24 hours of the first): ${dose}.`);
      else notes.push('Tranexamic acid: the bleeding restarted more than 24 hours after the first dose, outside the second-dose rule.');
    } else if (o.bleeding === 'stopped') {
      notes.push(`Tranexamic acid: no second dose while the bleeding has stopped; give ${dose} if it restarts within 24 hours of the first dose.`);
    } else {
      notes.push(`Tranexamic acid: a second dose of ${dose} if bleeding continues after 30 minutes or restarts within 24 hours of the first dose. The bleeding now was not entered.`);
    }
  } else if (hours <= 3) {
    notes.push(`Tranexamic acid${o.txa === 'no' ? '' : ', if not yet given'}: ${dose}, now. The window closes 3 hours after birth, ${hm(3 - hours)} from now${hours === 3 ? ' (exactly 3 hours is read as within)' : ''}.`);
  } else {
    notes.push('Tranexamic acid: the 3-hour window from birth has closed. WHO does not support giving it later, when it brings no benefit.');
  }
  notes.push('Tranexamic acid is IV only: it has been injected into the spine by mistake.');
  notes.push('If she keeps bleeding after the whole bundle, escalate at once to a senior provider or a higher-level facility.');
  return {
    valid: true,
    band: `Meets WHO's 2025 criteria for postpartum hemorrhage (${why}): start the first-response bundle now: uterine massage, an oxytocic, tranexamic acid, IV fluids, examine the genital tract, and escalate.`,
    bandLabel: 'PPH: start the bundle',
    abnormal: true,
    notes,
    note: NOTE,
  };
}
