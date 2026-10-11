// spec-v1634 tool 5: FDA postmarketing adverse event report deadlines.
//
// Source: 21 CFR 314.80, 600.80 and 310.305, read on eCFR as current on October 8, 2026
// (re-read October 11, 2026):
//   - 15-day Alert report: each adverse experience "that is both serious and unexpected ... as soon
//     as possible but no later than 15 calendar days from initial receipt of the information"
//     (314.80(c)(1)(i), 600.80(c)(1)(i), 310.305(c)(1)(i)); follow-up "within 15 calendar days of
//     receipt of new information or as requested by FDA".
//   - An event from a postmarketing study needs a 15-day Alert report only if there is "a
//     reasonable possibility" that the product caused it (314.80(e), 600.80(e), 310.305(c)(1)(ii)).
//   - Periodic reports (314.80(c)(2)(i), 600.80(c)(2)(i)): every experience not reported as a 15-day
//     Alert, "at quarterly intervals, for 3 years from the date of approval of the application
//     [issuance of the biologics license], and then at annual intervals"; each quarterly report
//     "within 30 days of the close of the quarter (the first quarter beginning on the date of
//     approval ...)" and each annual report "within 60 days of the anniversary date". FDA may, by
//     written notice, set different times. Section 310.305 has no periodic report.
//   - Serious: death, life-threatening, inpatient hospitalization or prolongation, persistent or
//     significant disability/incapacity, congenital anomaly/birth defect, or an important medical
//     event by medical judgment. Unexpected: not listed in the current labeling.
//
// One reading is the tool's own and is printed with the result: a quarter that begins on the
// approval date closes the day before the same date three months later (approval January 15: the
// first quarter closes April 14). The rule states calendar days and gives no weekend or holiday
// extension, so none is applied.
//
// Pure: the clock is a parameter.

export const SETTINGS = [
  { value: 'nda', text: 'Approved drug, NDA or ANDA (21 CFR 314.80)', cite: '21 CFR 314.80', from: 'the date of approval of the application' },
  { value: 'biologic', text: 'Licensed biologic (21 CFR 600.80)', cite: '21 CFR 600.80', from: 'the date of issuance of the biologics license' },
  { value: 'unapproved', text: 'Marketed prescription drug without an approved application (21 CFR 310.305)', cite: '21 CFR 310.305', from: null },
];
export const OUTCOMES = [
  { value: 'death', text: 'Death' },
  { value: 'life-threatening', text: 'Life-threatening' },
  { value: 'hospitalization', text: 'Inpatient hospitalization or prolongation of one' },
  { value: 'disability', text: 'Persistent or significant disability or incapacity' },
  { value: 'congenital-anomaly', text: 'Congenital anomaly or birth defect' },
  { value: 'important-medical-event', text: 'Important medical event (by medical judgment)' },
  { value: 'not-serious', text: 'None of these (not serious)' },
];
export const YES_NO = [{ value: 'yes', text: 'Yes' }, { value: 'no', text: 'No' }];
export const SOURCES = [
  { value: 'spontaneous', text: 'Not from a postmarketing study' },
  { value: 'study-possible', text: 'Postmarketing study: a reasonable possibility the product caused it' },
  { value: 'study-not', text: 'Postmarketing study: no reasonable possibility' },
];
const NOTE = 'The dates are the default schedule in the rule. FDA may set different times by written notice, and a waiver changes them. The tool does not decide whether an event is serious, unexpected or caused by the product: those are the inputs. Postmarketing reports only; investigational (IND) safety reports, devices, vaccines reported to VAERS and dietary supplements are other rules.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const DAY = 86400000;
function parseDate(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] && +m[1] >= 1938 && +m[1] <= 2100 ? d : null;
}
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
// The same day of the month n months later; a day that does not exist becomes the month's last day.
function addMonths(d, n) {
  const y = d.getUTCFullYear(); const m = d.getUTCMonth() + n; const day = d.getUTCDate();
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, last)));
}
const iso = (d) => d.toISOString().slice(0, 10);
const say = (d) => d.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' });
const pick = (list, v) => list.find((x) => x.value === String(v ?? '').trim());

// Every periodic report from the start date: 12 quarterly, then annual from the 4th anniversary.
function periodic(start, count, notBefore) {
  const out = [];
  for (let k = 1; out.length < count && k < 400; k += 1) {
    let close; let due; let kind;
    if (k <= 12) { close = addDays(addMonths(start, 3 * k), -1); due = addDays(close, 30); kind = `Quarterly report ${k} of 12`; } else { close = addMonths(start, 12 * (k - 9)); due = addDays(close, 60); kind = `Annual report, year ${k - 9}`; }
    if (close.getTime() >= notBefore.getTime()) out.push({ kind, closes: iso(close), due: iso(due), closeDate: close, dueDate: due });
  }
  return out;
}

export function fdaAdverseEventReportClock(input = {}, now) {
  const o = input && typeof input === 'object' ? input : {};
  const setting = pick(SETTINGS, o.setting);
  if (!setting) return { valid: false, message: 'Choose the setting: an approved drug, a licensed biologic, or a marketed prescription drug without an approved application. Each has its own section.' };
  const outcome = pick(OUTCOMES, o.outcome);
  if (!outcome) return { valid: false, message: 'Choose the most serious outcome, or "none of these".' };
  const serious = outcome.value !== 'not-serious';
  let unexpected = null;
  if (serious) {
    const u = pick(YES_NO, o.unexpected);
    if (!u) return { valid: false, message: 'Choose whether the event is unexpected: not listed in the current labeling, or listed but more severe or more specific than the labeling says.' };
    unexpected = u.value === 'yes';
  }
  let source = null;
  if (!blank(o.source)) { source = pick(SOURCES, o.source); if (!source) return { valid: false, message: 'Choose where the report came from, or leave it blank.' }; }
  const received = parseDate(o.received);
  if (!received) return { valid: false, message: 'Enter the date the information was first received.' };
  const today = now instanceof Date && !Number.isNaN(now.getTime()) ? new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) : null;
  const left = (due) => { if (!today) return ''; const n = Math.round((due.getTime() - today.getTime()) / DAY); return n > 0 ? ` That is ${n} day${n === 1 ? '' : 's'} from today.` : n === 0 ? ' That is today.' : ` That was ${-n} day${n === -1 ? '' : 's'} ago.`; };
  const seriousLine = serious ? `Serious (${outcome.text.toLowerCase()}) and ${unexpected ? 'unexpected' : 'expected'}.` : 'Not serious.';

  if (serious && unexpected && !(source && source.value === 'study-not')) {
    const due = addDays(received, 15);
    const notes = [seriousLine, `Received ${say(received)}; 15 calendar days later is ${say(due)}. The rule says "as soon as possible but no later than" that day, and gives no weekend or holiday extension.`,
      'Follow-up reports are due within 15 calendar days of receiving new information, or as FDA requests.'];
    if (!source) notes.push('If the event came from a postmarketing study, a 15-day Alert report is required only when there is a reasonable possibility that the product caused it.');
    notes.push(setting.value === 'unapproved' ? 'A packer or distributor that sends its reports to the manufacturer instead of FDA has 5 calendar days from receipt to do so.' : 'A nonapplicant named on the label that sends its reports to the applicant instead of FDA has 5 calendar days from receipt to do so.');
    notes.push(`${setting.cite}(c)(1).`);
    return { valid: true, flag: 'alert-15-day', abnormal: today ? due.getTime() < today.getTime() : false, report: '15-day Alert report', due: iso(due), band: `15-day Alert report due no later than ${say(due)}.${left(due)}`, bandLabel: `Due ${say(due)}`, notes, note: NOTE };
  }
  const why = source && source.value === 'study-not' && serious && unexpected
    ? 'A serious, unexpected event from a postmarketing study with no reasonable possibility that the product caused it does not need a 15-day Alert report.'
    : 'Only an event that is both serious and unexpected needs a 15-day Alert report.';
  if (setting.value === 'unapproved') {
    return { valid: true, flag: 'no-report-in-section', abnormal: false, report: 'none', band: 'No 15-day Alert report under 21 CFR 310.305, and that section has no periodic report.', bandLabel: 'No report in this section', notes: [seriousLine, why, '21 CFR 310.305(c).'], note: NOTE };
  }
  const start = parseDate(o.approval);
  if (!start) {
    if (!blank(o.approval)) return { valid: false, message: `Enter ${setting.from} as a date.` };
    return { valid: true, flag: 'periodic', abnormal: false, report: 'periodic report', band: `This goes in the next periodic report. Enter ${setting.from} to get its due date.`, bandLabel: 'Periodic report', notes: [seriousLine, why, 'Periodic reports are quarterly for 3 years, each within 30 days of the close of the quarter, then annual, each within 60 days of the anniversary.', `${setting.cite}(c)(2)(i).`], note: NOTE };
  }
  if (received.getTime() < start.getTime()) return { valid: false, message: `The information was received before ${setting.from}. Check the two dates.` };
  const rows = periodic(start, 4, received);
  const first = rows[0];
  const notes = [seriousLine, why,
    `Counting from ${say(start)}: the period that holds ${say(received)} closes ${say(first.closeDate)}, and the ${first.kind.toLowerCase().startsWith('quarterly') ? 'quarterly report is due within 30 days of that close' : 'annual report is due within 60 days of that anniversary'}.`,
    ...rows.map((r) => `${r.kind}: period closes ${say(r.closeDate)}; due ${say(r.dueDate)}.`),
    'Reading used: a quarter that begins on the start date closes the day before the same date three months later. Calendar days, with no weekend or holiday extension.',
    `${setting.cite}(c)(2)(i).`];
  return { valid: true, flag: 'periodic', abnormal: false, report: 'periodic report', due: first.due, schedule: rows.map(({ kind, closes, due }) => ({ kind, closes, due })), band: `Periodic report (${first.kind.toLowerCase()}) due by ${say(first.dueDate)}.${left(first.dueDate)}`, bandLabel: `Due ${say(first.dueDate)}`, notes, note: NOTE };
}
