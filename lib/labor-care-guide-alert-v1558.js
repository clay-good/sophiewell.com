// spec-v1558 tool 2: which of a woman's labor observations meet the WHO Labour Care Guide's alert threshold.
//
// Source: WHO labour care guide: user's manual, 2020 (IRIS 10665/337693; CC BY-NC-SA 3.0 IGO, facts restated,
// nothing reproduced). Read October 6, 2026, Tables 2-6 (pp. 10-18): each row's "Alert" column and its
// step-4 plan. Supportive care: no companion, no pain relief, no oral fluid, supine posture. Baby: baseline
// fetal heart rate below 110 or 160 or more (turn her onto her left side, then alert); late decelerations
// (the same, with prolonged auscultation); thick meconium (M+++) or blood-stained fluid; occiput posterior or
// transverse; caput +++; moulding +++. Woman: pulse below 60 or 120 or more; systolic below 80 or 140 or
// more; diastolic 90 or more; axillary temperature below 35.0 or 37.5 or more; urine protein or acetone ++
// or more. Labour: contractions 2 or fewer, or more than 5, per 10 minutes, and duration under 20 or over 60
// seconds (verify over another 10 minutes before alerting); time at the same dilatation 5 cm 6 h or more,
// 6 cm 5 h, 7 cm 3 h, 8 cm 2.5 h, 9 cm 2 h; second stage 3 h or more nulliparous, 2 h or more multiparous.
// Descent has no alert threshold (the guide says so), and none is invented.
//
// Each threshold is encoded as printed: the guide mixes "or more" and "more than" (contractions: more than
// 5; pulse: 120 or more). A blank row is not assessed, never normal, and is listed as such.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const STAGE_OPTIONS = [
  { value: 'first', text: 'Active first stage (5 cm or more)' },
  { value: 'second', text: 'Second stage' },
];
export const YN = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const POSTURE_OPTIONS = [{ value: 'mobile', text: 'Upright or mobile' }, { value: 'supine', text: 'Supine' }];
export const DECEL_OPTIONS = [{ value: 'N', text: 'None' }, { value: 'E', text: 'Early' }, { value: 'V', text: 'Variable' }, { value: 'L', text: 'Late' }];
export const FLUID_OPTIONS = [
  { value: 'I', text: 'Intact membranes' }, { value: 'C', text: 'Ruptured, clear' },
  { value: 'M1', text: 'Meconium + (non-significant)' }, { value: 'M2', text: 'Meconium ++ (medium)' },
  { value: 'M3', text: 'Meconium +++ (thick)' }, { value: 'B', text: 'Blood-stained' },
];
export const POSITION_OPTIONS = [{ value: 'A', text: 'Occiput anterior' }, { value: 'P', text: 'Occiput posterior' }, { value: 'T', text: 'Occiput transverse' }];
export const GRADE_OPTIONS = [{ value: '0', text: '0 (none)' }, { value: '1', text: '+' }, { value: '2', text: '++' }, { value: '3', text: '+++' }];
export const DIP_OPTIONS = [
  { value: 'neg', text: 'Negative' }, { value: 'trace', text: 'Trace' }, { value: '1', text: '+' },
  { value: '2', text: '++' }, { value: '3', text: '+++' }, { value: '4', text: '++++' },
];
export const PARITY_OPTIONS = [{ value: 'nullip', text: 'Nulliparous' }, { value: 'multip', text: 'Multiparous' }];

const LAG = { 5: 6, 6: 5, 7: 3, 8: 2.5, 9: 2 };
const SENIOR = 'alert a senior provider and follow clinical guidelines';
const NOTE = 'This follows the WHO Labour Care Guide user\'s manual (2020). Your national protocol may differ; follow it.';
const blank = (v) => v === undefined || v === null || String(v).trim() === '';

// Rows: [key, label, kind, options or [lo, hi, unit], alert(v, o) -> action text or null].
const ROWS = [
  ['companion', 'companion', 'enum', YN, (v) => (v === 'no' ? 'no companion: offer her a companion of her choice' : null)],
  ['painRelief', 'pain relief', 'enum', YN, (v) => (v === 'no' ? 'no pain relief: offer pain relief' : null)],
  ['oralFluid', 'oral fluid', 'enum', YN, (v) => (v === 'no' ? 'no oral fluid: encourage her to drink' : null)],
  ['posture', 'posture', 'enum', POSTURE_OPTIONS, (v) => (v === 'supine' ? 'supine: encourage her to move and take upright positions' : null)],
  ['fhr', 'baseline fetal heart rate', 'num', [50, 250, 'per minute'], (v) => (v < 110 || v >= 160 ? `fetal heart rate ${v} (alert below 110 or 160 or more): ask her to turn onto her left side, then ${SENIOR}` : null)],
  ['decel', 'fetal heart decelerations', 'enum', DECEL_OPTIONS, (v) => (v === 'L' ? `late decelerations: ask her to turn onto her left side, listen for longer, then ${SENIOR}` : null)],
  ['fluid', 'amniotic fluid', 'enum', FLUID_OPTIONS, (v) => (v === 'M3' ? `thick meconium (M+++): ${SENIOR}` : v === 'B' ? `blood-stained fluid: ${SENIOR}` : null)],
  ['position', 'fetal position', 'enum', POSITION_OPTIONS, (v) => (v === 'P' ? `occiput posterior: ${SENIOR}` : v === 'T' ? `occiput transverse: ${SENIOR}` : null)],
  ['caput', 'caput', 'enum', GRADE_OPTIONS, (v) => (v === '3' ? 'caput +++: alert a senior provider and follow local protocols' : null)],
  ['moulding', 'moulding', 'enum', GRADE_OPTIONS, (v) => (v === '3' ? 'moulding +++: alert a senior provider and follow local protocols' : null)],
  ['pulse', 'maternal pulse', 'num', [20, 250, 'per minute'], (v) => (v < 60 || v >= 120 ? `pulse ${v} (alert below 60 or 120 or more): ${SENIOR}` : null)],
  ['sbp', 'systolic pressure', 'num', [30, 260, 'mmHg'], (v) => (v < 80 || v >= 140 ? `systolic ${v} (alert below 80 or 140 or more): ${SENIOR}` : null)],
  ['dbp', 'diastolic pressure', 'num', [10, 200, 'mmHg'], (v) => (v >= 90 ? `diastolic ${v} (alert 90 or more): ${SENIOR}` : null)],
  ['temp', 'temperature', 'num', [30, 44, 'degrees C'], (v) => (v < 35 || v >= 37.5 ? `temperature ${v} °C (alert below 35.0 or 37.5 or more): ${SENIOR}` : null)],
  ['protein', 'urine protein', 'enum', DIP_OPTIONS, (v) => (['2', '3', '4'].includes(v) ? 'urine protein ++ or more: interpret it with a full examination and alert a senior provider' : null)],
  ['acetone', 'urine acetone', 'enum', DIP_OPTIONS, (v) => (['2', '3', '4'].includes(v) ? 'urine acetone ++ or more: interpret it with a full examination and alert a senior provider' : null)],
  ['contractions', 'contractions per 10 minutes', 'num', [0, 15, 'per 10 minutes'], (v) => (v <= 2 || v > 5 ? `${v} contractions in 10 minutes (alert 2 or fewer, or more than 5): count again over another 10 minutes, and if it holds, ${SENIOR}` : null)],
  ['duration', 'contraction duration', 'num', [0, 300, 'seconds'], (v) => (v < 20 || v > 60 ? `contractions lasting ${v} seconds (alert under 20 or over 60): check again over another 10 minutes, and if it holds, ${SENIOR}` : null)],
];

export function laborCareGuideAlert(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!STAGE_OPTIONS.some((x) => x.value === o.stage)) return { valid: false, message: 'Choose the stage: the guide starts in the active first stage, at 5 cm or more.' };
  const alerts = [];
  const assessed = [];
  const notAssessed = [];
  for (const [key, label, kind, spec, test] of ROWS) {
    const raw = o[key];
    if (blank(raw)) { notAssessed.push(label); continue; }
    let v = raw;
    if (kind === 'enum') {
      if (!spec.some((x) => x.value === raw)) return { valid: false, message: `Choose the ${label} from the list.` };
    } else {
      const f = inputFault([[`the ${label}`, raw, spec[0], spec[1], spec[2]]]);
      if (f) return { valid: false, message: f };
      v = Number(raw);
    }
    assessed.push(label);
    const a = test(v, o);
    if (a) alerts.push(a);
  }

  // Labour progress: time at the same dilatation (first stage) or in the second stage.
  if (o.stage === 'first') {
    if (!blank(o.dilatation)) {
      const f = inputFault([['the cervical dilatation', o.dilatation, 5, 10, 'cm']]);
      if (f) return { valid: false, message: `${f} The guide begins at 5 cm, in the active first stage.` };
    }
    const cm = blank(o.dilatation) ? null : Math.floor(Number(o.dilatation));
    if (cm !== null && !blank(o.lagHours) && LAG[cm] !== undefined) {
      const f = inputFault([['the hours at this dilatation', o.lagHours, 0, 48]]);
      if (f) return { valid: false, message: f };
      const h = Number(o.lagHours);
      assessed.push('time at the same dilatation');
      if (h >= LAG[cm]) alerts.push(`${h} hours at ${cm} cm with no progress (alert ${LAG[cm]} hours or more at ${cm} cm): ${SENIOR}`);
    } else notAssessed.push('time at the same dilatation');
  } else {
    const parity = PARITY_OPTIONS.find((x) => x.value === o.parity);
    if (!blank(o.parity) && !parity) return { valid: false, message: 'Choose the parity from the list.' };
    if (parity && !blank(o.secondHours)) {
      const f = inputFault([['the hours in the second stage', o.secondHours, 0, 12]]);
      if (f) return { valid: false, message: f };
      const h = Number(o.secondHours);
      const lim = parity.value === 'nullip' ? 3 : 2;
      assessed.push('length of the second stage');
      if (h >= lim) alerts.push(`${h} hours in the second stage without birth (alert ${lim} hours or more, ${parity.value === 'nullip' ? 'nulliparous' : 'multiparous'}): ${SENIOR}`);
    } else notAssessed.push('length of the second stage');
  }

  if (!assessed.length) return { valid: false, message: 'Enter at least one observation: a blank row is not assessed, never normal.' };
  const notes = [];
  if (alerts.length) for (const a of alerts) notes.push(`${a[0].toUpperCase()}${a.slice(1)}.`);
  if (notAssessed.length) notes.push(`Not assessed: ${notAssessed.join(', ')}.`);
  notes.push('Descent has no alert threshold in the guide.');
  notes.push(o.stage === 'first'
    ? 'Routine checks in the active first stage: fetal heart and contractions every 30 minutes; pulse, blood pressure, temperature and cervix every 4 hours.'
    : 'Routine checks in the second stage: fetal heart every 5 minutes; contractions at least every 15 minutes.');
  return {
    valid: true,
    band: alerts.length
      ? `${alerts.length} of the ${assessed.length} rows assessed ${alerts.length === 1 ? 'meets' : 'meet'} the Labour Care Guide's alert threshold.`
      : `None of the ${assessed.length} rows assessed meets an alert threshold.`,
    bandLabel: alerts.length ? `${alerts.length} alert${alerts.length === 1 ? '' : 's'}` : 'No alerts',
    abnormal: alerts.length > 0,
    notes,
    note: NOTE,
  };
}
