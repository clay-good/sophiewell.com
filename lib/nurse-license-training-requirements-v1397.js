// spec-v1397: what mandated training and continuing education a nurse's license needs (NY, NJ, CA, TX).
//
// Sources: NYSED Office of the Professions (op.nysed.gov), read 2026-09-18.
//   Child abuse identification and reporting. A one-time two-hour course, required since 1989 for
//   registered nurses and nurse practitioners (LPNs are not on NYSED's list). Chapter 25 of the Laws
//   of 2024 added identifying abuse of children with intellectual or developmental disabilities;
//   every mandated reporter completes the UPDATED curriculum by November 17, 2026. Approved
//   providers began offering it September 1, 2025. Those trained between November 1, 2022 and
//   August 31, 2025 may instead complete a 15-minute addendum. An exemption is available to those
//   with no professional contact with people under 18 (or the listed residential populations).
//   Infection control and barrier precautions (Education Law 6505-b): registered nurses and licensed
//   practical nurses, every four years. A licensee not practicing in New York need not complete it
//   now, and has 90 days after resuming practice. A nurse practitioner holds an RN license and meets
//   it through that license.
//
// Continuing education in the other three states (Cornell LII copies, read 2026-09-19):
//   NJ N.J.A.C. 13:37-5.3 (amended effective May 17, 2021): RNs and LPNs complete at least 30 hours
//     per biennial period, including at least one hour on prescription opioid drugs (alternatives,
//     and the risks and signs of abuse, addiction, and diversion); up to 15 extra hours carry over.
//   CA 16 CCR 1451: 30 hours of Board-approved continuing education in the preceding renewal period
//     or two years. LVNs are licensed by a different board and not covered. Business and Professions
//     Code 2811.5 (leginfo, read 2026-09-19): (h) the requirement does not apply in the first two
//     years after initial licensure, except one hour of implicit bias from January 1, 2023; (j)(1) an
//     NP giving primary care to a population more than 25% aged 65 or older certifies at least 20% of
//     the hours in gerontology, dementia care, or care of older patients. These are stated in the
//     answer, not checked; no other subject requirement is.
//   TX 22 TAC 216.3 (as last amended effective November 19, 2019): 20 contact hours per licensing
//     period, or a Board-approved national certification ((a), (b)); two hours of nursing jurisprudence
//     and ethics before the end of every third two-year period ((g)); two hours on older adults each
//     period for a nurse whose practice includes them ((h)); a one-time two hours of forensic evidence
//     collection within two years of starting ER employment ((d)(2)); an HHSC-approved human
//     trafficking course for direct care ((i)); and for an APRN with prescriptive authority, five more
//     hours of pharmacotherapeutics ((c)(3)). The targeted hours count toward the 20.
//
// THE DEADLINE: the updated child-abuse curriculum is due November 17, 2026. This tile's ledger row
// is reviewed on November 18, 2026, when "due by" becomes "was due by".
//
// Pure: no DOM, no clock, no network.

import { stateOptions, parseDate, scopeSentence } from './state-calendar.js';

export const NLT_VERIFIED = '2026-09-19';
export const NLT_STATES = stateOptions(['NY', 'NJ', 'CA', 'TX']);
export const LICENSES = [
  { value: 'RN', text: 'Registered nurse (RN)' },
  { value: 'NP', text: 'Nurse practitioner (NP)' },
  { value: 'LPN', text: 'Licensed practical nurse (LPN)' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];
export const DONE_NA = [
  { value: 'done', text: 'Done' },
  { value: 'not-done', text: 'Not done' },
  { value: 'na', text: 'Does not apply to me' },
];

const DEADLINE = '2026-11-17';
const ADDENDUM_FROM = '2022-11-01';
const ADDENDUM_TO = '2025-08-31';
const UPDATED_FROM = '2025-09-01';

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}
function addYears(t, n) {
  const d = new Date(t);
  const y = d.getUTCFullYear() + n;
  const last = new Date(Date.UTC(y, d.getUTCMonth() + 1, 0)).getUTCDate();
  return Date.UTC(y, d.getUTCMonth(), Math.min(d.getUTCDate(), last));
}
function iso(t) { return new Date(t).toISOString().slice(0, 10); }

function childAbuse(o) {
  if (o.license === 'LPN') {
    return { item: 'Child abuse identification and reporting', status: 'not-listed', text: 'NYSED does not list licensed practical nurses among the professions that must take this course.' };
  }
  if (o.abuseExempt === 'yes') {
    return { item: 'Child abuse identification and reporting', status: 'exempt', text: 'Exempt: no professional contact with people under 18 or the listed residential populations. The exemption is claimed with NYSED.' };
  }
  if (isBlank(o.abuseDate)) {
    return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: 'No completion date entered: the updated two-hour course is due by November 17, 2026.' };
  }
  const d = parseDate(o.abuseDate);
  if (d === null) return { error: 'Enter the date the child-abuse course was completed as a date, or leave it blank.' };
  const day = iso(d);
  if (day >= UPDATED_FROM) {
    return { item: 'Child abuse identification and reporting', status: 'met', text: `Completed ${day}, after approved providers began the updated curriculum on September 1, 2025: met, if that course was the updated one.` };
  }
  if (day >= ADDENDUM_FROM && day <= ADDENDUM_TO) {
    return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: `Completed ${day}, between November 1, 2022 and August 31, 2025: the 15-minute addendum (or the full updated course) is due by November 17, 2026.` };
  }
  return { item: 'Child abuse identification and reporting', status: 'due', due: DEADLINE, text: `Completed ${day}, before November 1, 2022: the updated two-hour course is due by November 17, 2026.` };
}

function infectionControl(o) {
  if (o.practicingNY === 'no') {
    return { item: 'Infection control and barrier precautions', status: 'deferred', text: 'Not practicing in New York: not required now. It is due within 90 days of resuming practice there.' };
  }
  if (isBlank(o.infectionDate)) {
    return { item: 'Infection control and barrier precautions', status: 'due', text: 'No completion date entered: the course is required every four years for registered nurses and licensed practical nurses.' };
  }
  const d = parseDate(o.infectionDate);
  if (d === null) return { error: 'Enter the date the infection-control course was completed as a date, or leave it blank.' };
  const next = iso(addYears(d, 4));
  const via = o.license === 'NP' ? ' (a nurse practitioner meets it through the RN license)' : '';
  return { item: 'Infection control and barrier precautions', status: 'due', due: next, text: `Completed ${iso(d)}: the next course is due by ${next}, every four years${via}.` };
}

const TX_ITEMS = [
  ['txJuris', '(g)', 'two hours of nursing jurisprudence and ethics in the current or previous two licensing periods', false],
  ['txOlder', '(h)', 'two hours on older adults this period, if your practice includes them', true],
  ['txForensic', '(d)(2)', 'two hours of forensic evidence collection within two years of starting ER work', true],
  ['txTrafficking', '(i)', 'the HHSC human trafficking prevention course, for direct patient care', true],
  ['txPharm', '(c)(3)', 'five more hours of pharmacotherapeutics, for an APRN with prescriptive authority', true],
];

function ceCheck(o) {
  if (o.state === 'CA' && o.license === 'LPN') return { error: 'California LVNs are licensed by the Board of Vocational Nursing and Psychiatric Technicians, which this does not cover. Choose RN or NP.' };
  const need = { NJ: 30, CA: 30, TX: 20 }[o.state];
  if (isBlank(o.hours)) return { error: `Enter the continuing education hours completed this renewal period. ${o.state === 'TX' ? 'Texas asks for 20, or a national certification.' : 'The minimum is 30.'}` };
  const h = Number(String(o.hours).trim());
  if (!Number.isFinite(h) || h < 0 || h > 500) return { error: 'Enter the hours as a number.' };
  const items = [];
  const cert = o.state === 'TX' && o.txCert === 'yes';
  items.push(cert
    ? { item: 'Continuing competency', status: 'met', text: 'A Board-approved national certification in your area of practice meets the Texas requirement in place of 20 hours (216.3(b)).' }
    : { item: 'Contact hours', status: h >= need ? 'met' : 'due', text: `${h} of ${need} hours completed${h >= need ? '' : `: ${Math.round((need - h) * 10) / 10} more before renewal`}.` });
  if (o.state === 'NJ') {
    if (o.njOpioid !== 'yes' && o.njOpioid !== 'no') return { error: 'Answer whether at least one of the hours covered prescription opioid drugs.' };
    items.push({ item: 'Opioid hour', status: o.njOpioid === 'yes' ? 'met' : 'due', text: o.njOpioid === 'yes' ? 'At least one hour on prescription opioid drugs: done.' : 'At least one hour must cover prescription opioid drugs, alternatives, and the signs of abuse and diversion (13:37-5.3(b)).' });
  }
  if (o.state === 'TX') {
    for (const [k, ref, label, canNa] of TX_ITEMS) {
      const v = o[k];
      if (!['done', 'not-done', 'na'].includes(v) || (v === 'na' && !canNa)) return { error: `Answer ${label} (216.3${ref}).` };
      if (v === 'na') continue;
      items.push({ item: label, status: v === 'done' ? 'met' : 'due', text: `${label[0].toUpperCase()}${label.slice(1)} (216.3${ref}): ${v === 'done' ? 'done' : 'not done'}.` });
    }
  }
  return { items };
}

export function nurseLicenseTrainingRequirements(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (isBlank(o.state) || !NLT_STATES.some((s) => s.value === o.state)) {
    return { valid: false, message: 'Choose the state: New York, New Jersey, California, or Texas.' };
  }
  if (isBlank(o.license) || !LICENSES.some((l) => l.value === o.license)) return { valid: false, message: 'Choose the license: RN, NP, or LPN.' };
  if (o.state !== 'NY') {
    const r = ceCheck(o);
    if (r.error) return { valid: false, message: r.error };
    const due = r.items.filter((i) => i.status === 'due');
    const cite = { NJ: 'N.J.A.C. 13:37-5.3', CA: '16 CCR 1451', TX: '22 TAC 216.3' }[o.state];
    return {
      valid: true,
      state: o.state,
      items: r.items,
      abnormal: due.length > 0,
      bandLabel: due.length ? `Due before renewal: ${due.length}` : 'Met for this renewal',
      band: due.length ? `Still due before renewal (${cite}): ${due.map((i) => i.text).join(' ')}` : `Every requirement checked under ${cite} is met for this renewal period.`,
      postureNote: scopeSentence(NLT_VERIFIED),
      note: o.state === 'CA' ? `In the first two years after initial licensure the 30 hours do not apply, but one hour of implicit bias does (Bus. & Prof. Code 2811.5(h)).${o.license === 'NP' ? ' A nurse practitioner giving primary care to a population more than 25% aged 65 or older puts at least 20% of the hours into gerontology, dementia care, or the care of older patients (2811.5(j)(1)).' : ''} These are stated, not checked.` : null,
    };
  }
  if (isBlank(o.practicingNY) || !['yes', 'no'].includes(o.practicingNY)) return { valid: false, message: 'Say whether you practice in New York. Infection control is deferred for a licensee who does not.' };

  const items = [childAbuse(o), infectionControl(o)];
  const err = items.find((i) => i.error);
  if (err) return { valid: false, message: err.error };

  const abuse = items[0];
  const band = `${abuse.text} ${items[1].text}`;
  return {
    valid: true,
    state: o.state,
    items,
    abnormal: items.some((i) => i.status === 'due'),
    bandLabel: abuse.status === 'due' ? 'Child-abuse update due by November 17, 2026' : (abuse.status === 'met' ? 'Child-abuse update met' : 'Child-abuse update not required'),
    band,
    postureNote: scopeSentence(NLT_VERIFIED),
    note: 'NYSED Office of the Professions: the one-time child abuse identification course (updated by Chapter 25, Laws of 2024, due November 17, 2026) and infection control every four years (Education Law 6505-b).',
  };
}
