// spec-v1635 tool 25: volume to draw for a prescribed activity.
//
//   concentration at draw time = vial activity x 2^(-(draw - calibration) / T_half) / vial volume
//   activity needed at draw    = prescribed x 2^((administration - draw) / T_half)
//   volume                     = activity needed at draw / concentration at draw
// With a measured activity: decayed to the administration time and compared with the prescribed one.
//
// Source for the acceptance test: 10 CFR 35.63(d), read on eCFR as current October 8, 2026: a
// licensee "may not use a dosage if the dosage does not fall within the prescribed dosage range or if
// the dosage differs from the prescribed dosage by more than 20 percent", unless the authorized user
// directs otherwise. 35.63(b) and (c) allow the dosage to be determined by decay correction or by
// volumetric measurement and calculation from the supplier's measurement. Half-lives are the label
// rows of the decay tool (lib/radioactive-decay-v1635.js).
//
// Pure: the clock is a parameter (used only for the label rows).

import { inputFault } from './num.js';
import { halfLife, stamp, sayAt, sig, ACTIVITY_UNITS } from './radioactive-decay-v1635.js';

const NOTE = 'Arithmetic for a dosage drawn from a vial: it does not replace the measurement or determination of the dosage that 10 CFR 35.63 requires, and it knows nothing of dead volume, adsorption or a generator eluate\'s ingrowth. Times are clock times in one time zone. The authorized user may direct otherwise.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function radiopharmDispenseVolume(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const hl = halfLife(o, now, table);
  if (hl.fault) return { valid: false, message: hl.fault };
  if (hl.withheld) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: hl.labelUrl, band: hl.withheld, bandLabel: 'Withheld', notes: [], note: NOTE };
  const unit = ACTIVITY_UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the activity unit used for the vial and the prescription.' };
  const f = inputFault([['the vial activity at calibration', o.vialActivity, null, 1e15, unit.text], ['the vial volume', o.vialVolume, null, 1e5, 'mL'], ['the prescribed activity', o.prescribed, null, 1e15, unit.text]]);
  if (f) return { valid: false, message: f };
  const cal = stamp(o.calibration); const draw = stamp(o.draw); const admin = blank(o.administration) ? draw : stamp(o.administration);
  if (!cal) return { valid: false, message: 'Enter the calibration date and time of the vial.' };
  if (!draw) return { valid: false, message: 'Enter the date and time the dose is drawn.' };
  if (!admin) return { valid: false, message: 'Enter the administration date and time, or leave it blank if the dose is given when drawn.' };
  if (admin.getTime() < draw.getTime()) return { valid: false, message: 'The administration time is before the draw time. Check the two times.' };
  let lo = null; let hi = null;
  if (!blank(o.rangeLow) || !blank(o.rangeHigh)) {
    const rf = inputFault([['the lower end of the prescribed range', o.rangeLow, null, 1e15, unit.text], ['the upper end of the prescribed range', o.rangeHigh, null, 1e15, unit.text]]);
    if (rf) return { valid: false, message: rf };
    lo = Number(o.rangeLow); hi = Number(o.rangeHigh);
    if (!(hi >= lo)) return { valid: false, message: 'The upper end of the prescribed range must not be below the lower end.' };
  }
  const h = (a, b) => (b.getTime() - a.getTime()) / 3600000;
  const vial = Number(o.vialActivity) * 2 ** (-h(cal, draw) / hl.hours);
  const conc = vial / Number(o.vialVolume);
  const rx = Number(o.prescribed);
  const needed = rx * 2 ** (h(draw, admin) / hl.hours);
  const volume = needed / conc;
  const notes = [hl.source,
    `Vial at draw time (${sayAt(draw)}): ${sig(vial)} ${unit.text} in ${Number(o.vialVolume)} mL, which is ${sig(conc)} ${unit.text}/mL.`,
    admin.getTime() === draw.getTime() ? `Given when drawn, so ${sig(needed)} ${unit.text} is needed in the syringe.` : `To have ${sig(rx)} ${unit.text} at ${sayAt(admin)}, the syringe should read ${sig(needed)} ${unit.text} at draw time.`];
  const out = { valid: true, flag: 'volume', abnormal: false, volumeMl: Number(volume.toPrecision(6)), activityAtDraw: Number(needed.toPrecision(6)), concentrationAtDraw: Number(conc.toPrecision(6)), ...(hl.labelUrl ? { labelUrl: hl.labelUrl } : {}) };
  let band = `Draw ${sig(volume)} mL; the syringe should read ${sig(needed)} ${unit.text} at draw time.`;
  let label = `${sig(volume)} mL`;
  if (volume > Number(o.vialVolume) + 1e-9) {
    out.flag = 'not-enough'; out.abnormal = true;
    band = `The vial does not hold enough: ${sig(volume)} mL would be needed and it contains ${Number(o.vialVolume)} mL (${sig(vial)} ${unit.text} at draw time against ${sig(needed)} needed).`;
    label = 'Not enough in the vial';
  }
  if (!blank(o.measured)) {
    const mf = inputFault([['the measured activity', o.measured, null, 1e15, unit.text]]);
    if (mf) return { valid: false, message: mf };
    const atAdmin = Number(o.measured) * 2 ** (-h(draw, admin) / hl.hours);
    const diff = ((atAdmin - rx) / rx) * 100;
    const within20 = Math.abs(diff) <= 20 + 1e-9;
    const inRange = lo === null ? null : atAdmin >= lo - 1e-9 && atAdmin <= hi + 1e-9;
    out.measuredAtAdministration = Number(atAdmin.toPrecision(6)); out.percentDifference = Number(diff.toFixed(1)); out.within20Percent = within20; out.withinRange = inRange;
    const ok = within20 && inRange !== false;
    if (!ok) { out.abnormal = true; out.flag = 'outside-35-63'; }
    notes.push(`Measured ${Number(o.measured).toLocaleString('en-US')} ${unit.text} at draw is ${sig(atAdmin)} ${unit.text} at administration: ${diff >= 0 ? '+' : ''}${out.percentDifference}% against the prescribed ${sig(rx)} ${unit.text}. ${within20 ? 'Within' : 'More than'} 20%${inRange === null ? '; no prescribed range was entered' : inRange ? ', and within the prescribed range' : ', and outside the prescribed range'}. ${ok ? '' : '10 CFR 35.63(d) does not allow the dosage to be used unless the authorized user directs otherwise.'}`.trim());
    band += ` Measured dosage: ${diff >= 0 ? '+' : ''}${out.percentDifference}% from prescribed, ${ok ? 'acceptable under' : 'not acceptable under'} 10 CFR 35.63(d).`;
  } else notes.push('Enter the measured activity to compare the dosage with the prescription under 10 CFR 35.63(d): within the prescribed range, and within 20% of the prescribed dosage.');
  notes.push('10 CFR 35.63.');
  return { ...out, band, bandLabel: label, notes, note: NOTE };
}
