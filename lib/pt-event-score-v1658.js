// spec-v1658 tool 5: CLIA proficiency-testing analyte and event scores, and whether they are satisfactory.
//
// Sources, read on the eCFR (title 42 current to October 16, 2026) on October 19, 2026:
//   42 CFR 493.931(c)(4)-(5) and 493.941(c)(4)-(5), formula images (Federal Register ER25SE06.022 and .023):
//     analyte score = acceptable responses for the analyte ÷ challenges for the analyte × 100;
//     testing event score = acceptable responses for all challenges ÷ all challenges × 100.
//   42 CFR 493.841 (routine chemistry) and 493.851 (hematology), the same words in each:
//     (a) under 80 percent for an analyte in an event is unsatisfactory analyte performance;
//     (b) an overall event score under 80 percent is unsatisfactory performance;
//     (f)-(g) unsatisfactory for the same analyte, or overall, in two consecutive events or two out of three
//     consecutive events is unsuccessful performance.
//   42 CFR 493.2: "Unsuccessful participation in proficiency testing" is defined the same way.
//
// Pure: no DOM, no clock, no network.

const r1 = (n) => Math.round(n * 10) / 10;

// "Glucose, 4, 5" per line: analyte, acceptable responses, challenges.
export function parseAnalytes(text) {
  const out = [];
  const lines = String(text ?? '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const c = line.split(/[,\t]/).map((x) => x.trim());
    if (c.length !== 3 || !c[0]) return { error: `Line ${i + 1} needs an analyte, the acceptable responses and the challenges, such as Glucose, 4, 5.` };
    if (!/^\d+$/.test(c[1]) || !/^\d+$/.test(c[2])) return { error: `Line ${i + 1}: the counts must be whole numbers.` };
    const ok = Number(c[1]);
    const n = Number(c[2]);
    if (n === 0) return { error: `Line ${i + 1}: no challenges.` };
    if (ok > n) return { error: `Line ${i + 1}: more acceptable responses than challenges.` };
    out.push({ name: c[0], ok, n });
  }
  return { rows: out };
}

export const HISTORY = [
  { value: 'satisfactory', text: 'Satisfactory' },
  { value: 'unsatisfactory', text: 'Unsatisfactory' },
];

export function ptEventScore(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const p = parseAnalytes(o.analytes);
  if (p.error) return { valid: false, message: p.error };
  if (!p.rows.length) return { valid: false, message: 'Enter each analyte with its acceptable responses and challenges, one per line.' };
  const okAll = p.rows.reduce((s, x) => s + x.ok, 0);
  const nAll = p.rows.reduce((s, x) => s + x.n, 0);
  const event = r1((okAll / nAll) * 100);
  const eventOk = okAll / nAll >= 0.8;
  const failed = p.rows.filter((x) => x.ok / x.n < 0.8);
  const notes = p.rows.map((x) => `${x.name}: ${r1((x.ok / x.n) * 100)}% (${x.ok} of ${x.n})${x.ok / x.n < 0.8 ? ', unsatisfactory' : ''}.`);
  const prev = [o.previousEvent, o.eventBeforeThat];
  let history = null;
  if (!o.previousEvent && o.eventBeforeThat) {
    notes.push('Choose the previous event\'s overall result: the history rules start from the event just before this one.');
  } else if (prev.some((v) => v)) {
    const seq = [eventOk ? 'satisfactory' : 'unsatisfactory', ...prev];
    const u = (i) => seq[i] === 'unsatisfactory';
    if ((u(0) && u(1)) || (u(1) && u(2))) history = 'Unsuccessful performance: the overall event score is unsatisfactory in two consecutive events.';
    else if (seq[1] && seq[2] && seq.filter((v) => v === 'unsatisfactory').length >= 2) history = 'Unsuccessful performance: the overall event score is unsatisfactory in two out of three consecutive events.';
    else history = 'Not unsuccessful on the overall score over the events entered.';
    if (!seq[2]) notes.push('Choose the result of the event before the previous one to check the two-out-of-three rule as well.');
  } else {
    notes.push('Choose the previous events\' overall results to check the two-consecutive and two-out-of-three rules.');
  }
  notes.push('The same rules apply to each analyte across events: unsatisfactory for one analyte in two consecutive, or two of three, events is unsuccessful.');
  const ok = eventOk && !failed.length;
  return {
    valid: true, eventScore: event, eventSatisfactory: eventOk, unsatisfactoryAnalytes: failed.map((x) => x.name), abnormal: !ok || (history || '').startsWith('Unsuccessful'),
    band: `Event score ${event}% (${okAll} of ${nAll} acceptable): ${eventOk ? 'satisfactory' : 'unsatisfactory'}, against the 80% line.${failed.length ? ` Unsatisfactory analytes: ${failed.map((x) => x.name).join(', ')}.` : ' Every analyte is at 80% or more.'}${history ? ` ${history}` : ''}`,
    bandLabel: `${event}%`,
    notes,
    note: 'Scores and the 80% line from 42 CFR 493.931 and 493.941 and the routine chemistry and hematology standards (493.841, 493.851). Other specialties have their own sections.',
  };
}
