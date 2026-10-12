// spec-v1635 tool 8: glucarpidase dose and leucovorin spacing, as the VORAXAZE label states them.
//
// Source: VORAXAZE (glucarpidase) label, BTG International, DailyMed set id acaef5a6-..., version 10,
// re-read October 11, 2026:
//   1    "indicated to reduce toxic plasma methotrexate concentration (greater than 1 micromole per
//        liter) in adult and pediatric patients with delayed methotrexate clearance (plasma
//        methotrexate concentrations greater than 2 standard deviations of the mean methotrexate
//        excretion curve specific for the dose of methotrexate administered) due to impaired renal
//        function." Limitation of use: "not recommended for use in patients who exhibit the expected
//        clearance and expected plasma methotrexate concentration."
//   2.1  "50 Units per kilogram (kg) as a single intravenous injection administered over 5 minutes."
//   2.2  "administer leucovorin at least 2 hours before or 2 hours after the VORAXAZE dose"; the same
//        leucovorin dosage for the first 48 hours; beyond 48 hours by the measured concentration;
//        continue until it "has been maintained below the leucovorin rescue threshold for a minimum
//        of 3 days."
//   2.3, 3  1,000-Unit single-dose vial, reconstituted with 1 mL of 0.9% sodium chloride.
//   5.2  DAMPA interferes with immunoassays "for up to 48 hours"; "a chromatographic method is
//        preferred over an immunoassay."
// The tool does not compute the excretion curve: whether clearance is delayed is the reader's entry.
//
// Pure: the clock is a parameter (used only for the label row).

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const LABEL = { name: 'VORAXAZE', setId: 'acaef5a6-b740-40e3-8ffe-74a75c74745c' };
export const DELAYED = [
  { value: 'yes', text: 'Yes: above 2 standard deviations of the mean excretion curve, from impaired renal function' },
  { value: 'no', text: 'No: clearance is as expected' },
  { value: 'not-assessed', text: 'Not assessed' },
];
const NOTE = 'The labeled dose, the vials that cover it, and the label\'s leucovorin and assay rules. It does not compute the methotrexate excretion curve and it does not say whether glucarpidase should be given.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';
const n0 = (x) => Math.round(x).toLocaleString('en-US');
const HOUR = 3600000;

// 'YYYY-MM-DDTHH:MM' (a datetime-local value) -> a wall-clock instant, or null.
function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const clock = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const span = (ms) => { const min = Math.round(Math.abs(ms) / 60000); return `${Math.floor(min / 60)} h ${min % 60} min`; };

export function glucarpidaseDose(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const f = inputFault([['the weight', o.weight, 0.4, 300, 'kg'], ['the plasma methotrexate concentration', o.methotrexate, 0, 5000, 'µmol/L']]);
  if (f) return { valid: false, message: f };
  const delayed = DELAYED.find((x) => x.value === String(o.delayed ?? '').trim());
  if (!delayed) return { valid: false, message: 'Choose whether methotrexate clearance is delayed from impaired renal function. The label\'s indication turns on it, and this tool does not compute the excretion curve.' };
  const when = {};
  for (const [key, label] of [['glucarpidaseTime', 'the planned glucarpidase time'], ['lastLeucovorin', 'the last leucovorin dose'], ['nextLeucovorin', 'the next leucovorin dose']]) {
    if (blank(o[key])) { when[key] = null; continue; }
    when[key] = parseWhen(o[key]);
    if (when[key] === null) return { valid: false, message: `Enter ${label} as a date and time (YYYY-MM-DDTHH:MM).` };
  }
  const { glucarpidaseTime: g, lastLeucovorin: last, nextLeucovorin: next } = when;
  if (g === null && (last !== null || next !== null)) return { valid: false, message: 'Enter the planned glucarpidase time: the leucovorin times are checked against it.' };
  if (g !== null && last !== null && last > g) return { valid: false, message: 'The last leucovorin dose is after the planned glucarpidase time. Enter it as the next leucovorin dose instead.' };
  if (g !== null && next !== null && next < g) return { valid: false, message: 'The next leucovorin dose is before the planned glucarpidase time. Enter it as the last leucovorin dose instead.' };

  const lr = labelRow(LABEL.setId, now, table);
  if (!lr.answers) return { valid: true, withheld: true, flag: 'withheld', abnormal: true, labelUrl: lr.url, band: `The VORAXAZE label figures are withheld: ${lr.why}. Read the dose from the label in hand.`, bandLabel: 'Withheld', notes: [], note: NOTE };

  const kg = Number(o.weight); const mtx = Number(o.methotrexate);
  const units = 50 * kg; const vials = Math.ceil(units / 1000 - 1e-9);
  const aboveOne = mtx > 1;
  const indication = aboveOne && delayed.value === 'yes';
  const tooClose = [];
  if (g !== null && last !== null && g - last < 2 * HOUR) tooClose.push(`The last leucovorin dose (${clock(last)}) is ${span(g - last)} before the glucarpidase time; the label says at least 2 hours. Glucarpidase no earlier than ${clock(last + 2 * HOUR)}.`);
  if (g !== null && next !== null && next - g < 2 * HOUR) tooClose.push(`The next leucovorin dose (${clock(next)}) is ${span(next - g)} after the glucarpidase time; the label says at least 2 hours. Leucovorin no earlier than ${clock(g + 2 * HOUR)}.`);

  const notes = [];
  if (!aboveOne) notes.push(`Methotrexate ${mtx} µmol/L is not above 1 µmol/L, the concentration in the label's indication.`);
  if (delayed.value === 'no') notes.push('Clearance entered as expected: the label says glucarpidase "is not recommended for use in patients who exhibit the expected clearance and expected plasma methotrexate concentration," because lowering the concentration may leave methotrexate exposure subtherapeutic.');
  if (delayed.value === 'not-assessed') notes.push('Delayed clearance not assessed: the indication requires a concentration more than 2 standard deviations above the mean excretion curve for the methotrexate dose given, from impaired renal function. This tool does not compute that curve.');
  notes.push(...tooClose);
  notes.push(`50 Units/kg × ${kg} kg = ${n0(units)} Units, as a single intravenous injection over 5 minutes; flush the line before and after.`);
  notes.push(`Vials: ${vials} × 1,000 Units, each reconstituted with 1 mL of 0.9% sodium chloride (${n0(units)} Units is ${(units / 1000).toFixed(2)} mL); ${n0(vials * 1000 - units)} Units left over. Single-dose vials.`);
  if (g !== null) {
    notes.push(`Leucovorin window around glucarpidase at ${clock(g)}: none from ${clock(g - 2 * HOUR)} to ${clock(g + 2 * HOUR)} (at least 2 hours before or 2 hours after).`);
    notes.push(`Until ${clock(g + 48 * HOUR)} (48 hours): the same leucovorin dose as before glucarpidase, and a chromatographic methotrexate assay is preferred, because the metabolite DAMPA makes immunoassays read high.`);
  } else {
    notes.push('Leucovorin: at least 2 hours before or 2 hours after glucarpidase. Enter the planned glucarpidase time and the leucovorin times to check them.');
    notes.push('For the first 48 hours: the same leucovorin dose as before glucarpidase, and a chromatographic methotrexate assay is preferred, because the metabolite DAMPA makes immunoassays read high.');
  }
  notes.push('Beyond 48 hours: leucovorin by the measured methotrexate concentration, continued until the concentration has stayed below the leucovorin rescue threshold for at least 3 days. The label says not to stop leucovorin on a single concentration below the threshold.');
  notes.push(`Label: ${lr.edition}.`);
  const flag = !indication ? (delayed.value === 'not-assessed' && aboveOne ? 'indication-not-assessed' : 'indication-not-met') : tooClose.length ? 'leucovorin-too-close' : 'dose';
  const lead = flag === 'indication-not-met' ? 'These entries do not meet the label\'s indication. For the arithmetic only: '
    : flag === 'indication-not-assessed' ? 'Delayed clearance was not assessed, so the indication is not established. For the arithmetic only: '
      : flag === 'leucovorin-too-close' ? 'Leucovorin is inside the 2-hour window. ' : '';
  return {
    valid: true, flag, abnormal: flag !== 'dose', labelUrl: lr.url,
    units: Number(units.toFixed(0)), vials, leucovorinOk: g === null || (last === null && next === null) ? null : tooClose.length === 0,
    band: `${lead}Glucarpidase ${n0(units)} Units (50 Units/kg), from ${vials} × 1,000-Unit vial${vials === 1 ? '' : 's'}.`,
    bandLabel: `${n0(units)} Units`, notes, note: NOTE,
  };
}
