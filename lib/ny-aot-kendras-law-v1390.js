// spec-v1390: New York assisted outpatient treatment (Kendra's Law) criteria, Mental Hygiene Law 9.60(c).
//
// Source: NY MHL 9.60(c) (nysenate.gov text read 2026-09-18). A patient may be ordered to receive
// assisted outpatient treatment only if the court finds that the patient:
//   (1) is eighteen years of age or older;
//   (2) is suffering from a mental illness;
//   (3) is unlikely to survive safely in the community without supervision, based on a clinical
//       determination;
//   (4) has a history of lack of compliance with treatment for mental illness that has:
//       (i)   at least twice within the last thirty-six months been a significant factor in
//             necessitating hospitalization, or receipt of services in a forensic or other mental
//             health unit of a correctional facility or a local correctional facility,
//       (ii)  resulted in one or more acts of serious violent behavior toward self or others, or
//             threats of or attempts at serious physical harm to self or others, within the last
//             forty-eight months,
//       -- each "not including any current period, or period ending within the last six months,
//          during which the person was or is hospitalized or incarcerated" -- or
//       (iii) resulted in a court order for assisted outpatient treatment that has expired within
//             the last six months, and since then (a) a substantial increase in symptoms that
//             substantially interferes with compliance, or (b) for lack of compliance, emergency
//             observation, care, and treatment, inpatient admission, or incarceration;
//   (5) is, as a result of the mental illness, unlikely to voluntarily participate in the outpatient
//       treatment that would enable living safely in the community;
//   (6) in view of the treatment history and current behavior, needs assisted outpatient treatment to
//       prevent a relapse or deterioration likely to result in serious harm to self or others;
//   (7) is likely to benefit from assisted outpatient treatment.
// The initial order is for a period not to exceed one year.
//
// The lookback is read as the statute counts it: the months spent in a current confinement, or one
// that ended within six months, are not counted, so the window reaches back by that length. Only
// one confinement is entered; the tile says so.
//
// Pure: no DOM, no clock, no network. Dates are 'YYYY-MM-DD'.

import { parseDate, scopeSentence } from './state-calendar.js';

export const AOT_VERIFIED = '2026-09-18';
export const CRITERION = [
  { value: 'met', text: 'Met' },
  { value: 'not-met', text: 'Not met' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

const DAY = 86400000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function fmt(t) {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
// Calendar months back, clamping the day (March 31 less one month is February 28 or 29).
function monthsBack(t, n) {
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() - n;
  const target = new Date(Date.UTC(y, m, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(d.getUTCDate(), last));
}
function state3(v) {
  return v === 'met' || v === 'not-met' ? v : null;
}

const CLINICAL = [
  ['mentalIllness', '(2) suffering from a mental illness'],
  ['unlikelySurvive', '(3) unlikely to survive safely in the community without supervision (clinical determination)'],
  ['unlikelyVoluntary', '(5) unlikely, because of the illness, to take part in outpatient treatment voluntarily'],
  ['needToPrevent', '(6) needs assisted outpatient treatment to prevent a relapse or deterioration likely to cause serious harm'],
  ['likelyBenefit', '(7) likely to benefit from assisted outpatient treatment'],
];

export function nyAotKendrasLaw(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.asOf)) return { valid: false, message: 'Enter the date of the petition. Every lookback runs back from it.' };
  const asOf = parseDate(o.asOf);
  if (asOf === null) return { valid: false, message: 'Enter the petition date as a date.' };
  const age = Number(String(o.age ?? '').trim());
  if (isBlank(o.age) || !Number.isFinite(age) || age < 0 || age > 120) return { valid: false, message: 'Enter the age in years. Criterion (1) is 18 or older.' };

  // Confinement that extends the lookback.
  let extDays = 0;
  let confineText = 'No current or recent confinement entered, so the windows are not extended.';
  if (!isBlank(o.confineStart) || !isBlank(o.confineEnd)) {
    if (isBlank(o.confineStart)) return { valid: false, message: 'Enter when the confinement began. Its length is what extends the lookback.' };
    const cs = parseDate(o.confineStart);
    const ce = isBlank(o.confineEnd) ? asOf : parseDate(o.confineEnd);
    if (cs === null || ce === null) return { valid: false, message: 'Enter the confinement dates as dates.' };
    if (ce < cs || cs > asOf || ce > asOf) return { valid: false, message: 'Enter confinement dates that begin before they end and fall on or before the petition date.' };
    const len = Math.round((ce - cs) / DAY);
    if (ce >= monthsBack(asOf, 6)) {
      extDays = len;
      confineText = `${isBlank(o.confineEnd) ? 'A current confinement' : `A confinement that ended ${fmt(ce)}`} (${len} days) is not counted, so each window reaches back ${len} days further.`;
    } else {
      confineText = `The confinement ended ${fmt(ce)}, more than six months before the petition, so it does not extend the windows.`;
    }
  }
  const start36 = monthsBack(asOf, 36) - extDays * DAY;
  const start48 = monthsBack(asOf, 48) - extDays * DAY;

  // Prong (i): hospitalizations or correctional mental health services.
  const dates = [];
  for (const raw of String(o.episodes ?? '').split(/[,;\s]+/).filter(Boolean)) {
    const t = parseDate(raw);
    if (t === null) return { valid: false, message: `Enter each hospitalization date as YYYY-MM-DD; "${raw}" is not one.` };
    if (t > asOf) return { valid: false, message: `Enter hospitalization dates on or before the petition date; ${raw} is after it.` };
    dates.push(t);
  }
  const inside = dates.filter((t) => t >= start36);
  const p1 = inside.length >= 2 ? 'met' : 'not-met';
  const p1Text = `(i) ${inside.length} of ${dates.length} entered hospitalization${dates.length === 1 ? '' : 's'} fall${inside.length === 1 ? 's' : ''} on or after ${fmt(start36)}; at least two are needed.`;

  // Prong (ii): serious violence, threat, or attempt.
  let p2 = 'not-met';
  let p2Text = '(ii) No act, threat, or attempt of serious violence entered.';
  if (!isBlank(o.violence)) {
    const v = parseDate(o.violence);
    if (v === null || v > asOf) return { valid: false, message: 'Enter the date of the violent act, threat, or attempt as a date on or before the petition.' };
    p2 = v >= start48 ? 'met' : 'not-met';
    p2Text = `(ii) The act, threat, or attempt on ${fmt(v)} is ${p2 === 'met' ? 'within' : 'outside'} the window beginning ${fmt(start48)}.`;
  }

  // Prong (iii): an expired AOT order and what has happened since.
  let p3 = 'not-met';
  let p3Text = '(iii) No earlier assisted outpatient treatment order entered.';
  if (!isBlank(o.aotExpired)) {
    const x = parseDate(o.aotExpired);
    if (x === null || x > asOf) return { valid: false, message: 'Enter when the earlier order expired, as a date on or before the petition.' };
    if (x < monthsBack(asOf, 6)) {
      p3Text = `(iii) The earlier order expired ${fmt(x)}, more than six months before the petition.`;
    } else if (state3(o.aotSince) === 'met') {
      p3 = 'met';
      p3Text = `(iii) The earlier order expired ${fmt(x)}, within six months, and since then symptoms substantially increased or emergency care, admission, or incarceration followed.`;
    } else if (state3(o.aotSince) === 'not-met') {
      p3Text = `(iii) The earlier order expired ${fmt(x)}, within six months, but neither a substantial increase in symptoms nor emergency care, admission, or incarceration has followed.`;
    } else {
      p3 = null;
      p3Text = `(iii) The earlier order expired ${fmt(x)}, within six months; what has happened since is not assessed.`;
    }
  }

  let c4;
  let c4Missing = null;
  if (p1 === 'met' || p2 === 'met' || p3 === 'met') c4 = 'met';
  else if (p3 === null) { c4 = null; c4Missing = '(4)(iii) whether symptoms increased, or emergency care, admission, or incarceration followed, since the earlier order expired'; }
  else if (o.historyReviewed === 'yes') c4 = 'not-met';
  else { c4 = null; c4Missing = '(4) the treatment history: confirm the records were reviewed for all three prongs'; }

  const rows = [
    { label: '(1) 18 or older', state: age >= 18 ? 'met' : 'not-met' },
    { label: CLINICAL[0][1], state: state3(o.mentalIllness) },
    { label: CLINICAL[1][1], state: state3(o.unlikelySurvive) },
    { label: '(4) history of non-compliance (one of three prongs)', state: c4, missing: c4Missing },
    { label: CLINICAL[2][1], state: state3(o.unlikelyVoluntary) },
    { label: CLINICAL[3][1], state: state3(o.needToPrevent) },
    { label: CLINICAL[4][1], state: state3(o.likelyBenefit) },
  ];
  const WORD = { met: 'met', 'not-met': 'not met' };
  const criteria = rows.map((r) => `${r.label}: ${r.state ? WORD[r.state] : 'not assessed'}`);
  const unassessed = rows.filter((r) => !r.state).map((r) => r.missing || r.label);
  const failed = rows.filter((r) => r.state === 'not-met').map((r) => r.label);

  let verdict;
  let bandLabel;
  let band;
  if (unassessed.length) {
    verdict = null;
    bandLabel = 'Incomplete';
    band = `Not decided. Still needed: ${unassessed.join('; ')}.${failed.length ? ` Recorded as not met: ${failed.join('; ')}.` : ''}`;
  } else if (failed.length) {
    verdict = 'does-not-meet';
    bandLabel = 'Does not meet 9.60(c)';
    band = `Does not meet MHL 9.60(c). Not met: ${failed.join('; ')}.`;
  } else {
    verdict = 'meets';
    bandLabel = 'Meets 9.60(c)';
    band = 'Meets all seven MHL 9.60(c) criteria as documented. The court decides; an initial order runs for no more than one year.';
  }
  return {
    valid: true,
    verdict,
    abnormal: verdict === 'meets',
    bandLabel,
    band,
    criteria,
    prongs: [p1Text, p2Text, p3Text],
    windowNote: `${confineText} 36-month window from ${fmt(start36)}; 48-month window from ${fmt(start48)}. Only one confinement is entered; if more than one was current or ended within six months, the windows are longer than shown.`,
    countNote: 'Enter only hospitalizations in which non-compliance was a significant factor. The text does not say whether the current confinement itself counts as one of the two; this tool counts what is entered.',
    postureNote: scopeSentence(AOT_VERIFIED),
  };
}
