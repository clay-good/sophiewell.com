// spec-v1633 tool 2: DOAC last dose before, and first dose after, a procedure.
//
// Two sources, kept apart and shown side by side:
//
// The labels (spec-v1628 section 1), each re-read on October 11, 2026:
//   Eliquis 2.4: "discontinued at least 48 hours prior to elective surgery or invasive procedures
//     with a moderate or high risk of unacceptable or clinically significant bleeding", "at least 24
//     hours prior to ... a low risk of bleeding"; "restarted ... as soon as adequate hemostasis has
//     been established".
//   Xarelto 2.4: "stopped at least 24 hours before the procedure"; restarted "as soon as adequate
//     hemostasis has been established".
//   Savaysa 2.5: "at least 24 hours before invasive or surgical procedures"; restarted "as soon as
//     adequate hemostasis has been established".
//   Pradaxa 2.8: adults "1 to 2 days (CrCl >= 50 mL/min) or 3 to 5 days (CrCl < 50 mL/min) before
//     invasive or surgical procedures"; "Consider longer times for patients undergoing major surgery,
//     spinal puncture, or placement of a spinal or epidural catheter or port"; pediatric "24 hours
//     ... (eGFR > 80 mL/min/1.73 m2) or 2 days ... (eGFR 50-80 mL/min/1.73 m2)", below 50 not
//     studied; "Restart ... as soon as medically appropriate."
//
// The PAUSE protocol: Douketis JD, et al. JAMA Intern Med 2019;179(11):1469-1478 (PMC6686768),
// Methods and Table 2, re-read October 11, 2026. Adults with atrial fibrillation on apixaban,
// dabigatran or rivaroxaban: the DOAC was "omitted for 1 day before a low-bleeding-risk procedure
// ... and ... 2 days before a high-bleeding-risk procedure", and not taken on the day of the
// procedure; dabigatran with a CrCl below 50 mL/min, 2 days (low) and 4 days (high); "resumed 1 day
// (approximately 24 hours) after a low-bleeding-risk procedure and 2 to 3 days (48-72 hours) after a
// high-bleeding-risk procedure, provided that hemostasis was achieved". Excluded: "creatinine
// clearance (CrCl) level less than 25 ml/min for apixaban users or CrCl level less than 30 ml/min for
// dabigatran or rivaroxaban users". Edoxaban was not studied.
//
// The bleeding risk of the procedure is the reader's classification; PAUSE's own lists are in a
// supplement this tool does not hold. Bridging is a different question (periop-bridging).
//
// Pure: no DOM, no network; `now` is passed in. Date-times are wall-clock values, taken as entered.

import { inputFault } from './num.js';
import { labelRow } from './label-row.js';

export const DRUGS = [
  { value: 'apixaban', text: 'Apixaban (Eliquis)', brand: 'Eliquis', section: '2.4', setId: 'e9481622-7cc6-418a-acb6-c5450daae9b0' },
  { value: 'rivaroxaban', text: 'Rivaroxaban (Xarelto)', brand: 'Xarelto', section: '2.4', setId: '10db92f9-2300-4a80-836b-673e1ae91610' },
  { value: 'dabigatran', text: 'Dabigatran (Pradaxa capsules)', brand: 'Pradaxa', section: '2.8', setId: 'ba74e3cd-b06f-4145-b284-5fd6b84ff3c9' },
  { value: 'edoxaban', text: 'Edoxaban (Savaysa)', brand: 'Savaysa', section: '2.5', setId: 'e77d3400-56ad-11e3-949a-0800200c9a66' },
];
export const POPULATIONS = [{ value: 'adult', text: 'Adult' }, { value: 'pediatric', text: 'Pediatric' }];
export const RISKS = [{ value: 'low', text: 'Low bleeding risk' }, { value: 'high', text: 'High bleeding risk' }];
export const SOURCES = [{ value: 'both', text: 'Label and PAUSE, side by side' }, { value: 'label', text: 'Label only' }, { value: 'pause', text: 'PAUSE protocol only' }];
const NOTE = 'This reports what the label and the PAUSE protocol give for these inputs. It does not prescribe. The bleeding risk is your classification of the procedure, and whether to bridge is a separate question (Periprocedural Anticoagulant Bridging).';
const PAUSE_FLOOR = { apixaban: 25, rivaroxaban: 30, dabigatran: 30 };
const HOUR = 3600000; const DAY = 24 * HOUR;
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

function parseWhen(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(String(v ?? '').trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || h > 23 || mi > 59) return null;
  return t;
}
const stamp = (t) => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const day = (t) => `${WEEKDAYS[new Date(t).getUTCDay()]} ${new Date(t).toISOString().slice(0, 10)}`;
const days = (n) => `${n} day${n === 1 ? '' : 's'}`;

export function doacPeriproceduralTiming(input = {}, now, table) {
  const o = input && typeof input === 'object' ? input : {};
  const drug = DRUGS.find((d) => d.value === String(o.drug ?? '').trim());
  if (!drug) return { valid: false, message: 'Choose the DOAC.' };
  const pop = String(o.population ?? '').trim();
  if (pop !== 'adult' && pop !== 'pediatric') return { valid: false, message: 'Choose adult or pediatric: the Pradaxa label gives children their own times, and PAUSE enrolled adults only.' };
  const risk = String(o.risk ?? '').trim();
  if (risk !== 'low' && risk !== 'high') return { valid: false, message: 'Choose the bleeding risk of the procedure, low or high. It is your classification.' };
  const source = String(o.source ?? '').trim();
  if (!SOURCES.some((s) => s.value === source)) return { valid: false, message: 'Choose the source to apply: the label, the PAUSE protocol, or both.' };
  const when = parseWhen(o.procedure);
  if (when === null) return { valid: false, message: 'Enter the procedure date and time (YYYY-MM-DDTHH:MM).' };
  const wantLabel = source !== 'pause'; const wantPause = source !== 'label';
  // The clearance is asked for only where a rule turns on it.
  const pauseApplies = wantPause && pop === 'adult' && drug.value !== 'edoxaban';
  const needKidney = drug.value === 'dabigatran' || pauseApplies;
  let k = null;
  if (needKidney) {
    const ped = pop === 'pediatric';
    const f = inputFault([[ped ? 'the eGFR' : 'the creatinine clearance', o.crcl, 0, 250, ped ? 'mL/min/1.73 m²' : 'mL/min']]);
    if (f) return { valid: false, message: `${f} ${drug.value === 'dabigatran' ? 'The Pradaxa label and PAUSE both set the dabigatran times by kidney function.' : 'PAUSE did not study patients below a clearance floor, so the tool has to know it.'}` };
    k = Number(o.crcl);
  }
  const procDay = Date.UTC(new Date(when).getUTCFullYear(), new Date(when).getUTCMonth(), new Date(when).getUTCDate());
  const lines = []; const out = { valid: true, drug: drug.value, population: pop, risk, source, procedure: stamp(when) };
  let abnormal = false;

  // --- the label ---
  if (wantLabel) {
    const row = labelRow(drug.setId, now, table);
    if (!row.answers) {
      lines.push({ who: 'label', text: `The ${drug.brand} label's times are withheld: ${row.why}. Read them from the label in hand.` });
      out.labelUrl = row.url; out.labelWithheld = true;
    } else {
      out.labelUrl = row.url;
      let text; let restart = 'restart as soon as adequate hemostasis has been established';
      if (drug.value === 'apixaban') {
        const h = risk === 'high' ? 48 : 24;
        out.labelLastDoseBy = stamp(when - h * HOUR);
        text = `discontinue at least ${h} hours before a procedure with ${risk === 'high' ? 'a moderate or high risk of bleeding' : 'a low risk of bleeding'}: last dose no later than ${stamp(when - h * HOUR)}`;
      } else if (drug.value === 'rivaroxaban' || drug.value === 'edoxaban') {
        out.labelLastDoseBy = stamp(when - 24 * HOUR);
        text = `stop at least 24 hours before the procedure (the label gives one time, not one per bleeding risk): last dose no later than ${stamp(when - 24 * HOUR)}`;
      } else if (pop === 'adult') {
        const [lo, hi] = k >= 50 ? [1, 2] : [3, 5];
        out.labelLastDoseBy = stamp(when - lo * DAY); out.labelLastDoseFrom = stamp(when - hi * DAY);
        text = `discontinue ${lo} to ${hi} days before the procedure at a creatinine clearance ${k >= 50 ? 'of 50 mL/min or above' : 'below 50 mL/min'}: last dose between ${stamp(when - hi * DAY)} and ${stamp(when - lo * DAY)}. The label says to consider longer times for major surgery, spinal puncture, or a spinal or epidural catheter or port`;
        restart = 'restart as soon as medically appropriate';
      } else if (k > 80) {
        out.labelLastDoseBy = stamp(when - 24 * HOUR);
        text = `for pediatric patients with an eGFR above 80 mL/min/1.73 m², discontinue 24 hours before an elective surgery: last dose no later than ${stamp(when - 24 * HOUR)}`;
        restart = 'restart as soon as medically appropriate';
      } else if (k >= 50) {
        out.labelLastDoseBy = stamp(when - 2 * DAY);
        text = `for pediatric patients with an eGFR of 50 to 80 mL/min/1.73 m², discontinue 2 days before an elective surgery: last dose no later than ${stamp(when - 2 * DAY)}`;
        restart = 'restart as soon as medically appropriate';
      } else {
        abnormal = true; text = 'pediatric patients with an eGFR below 50 mL/min/1.73 m² have not been studied, and the label says to avoid Pradaxa in them; it gives no time for this value'; restart = null;
      }
      lines.push({ who: 'label', text: `${drug.brand} label, section ${drug.section}: ${text}${restart ? `; ${restart}` : ''}.`, edition: row.edition });
    }
  }

  // --- PAUSE ---
  if (wantPause) {
    if (drug.value === 'edoxaban') lines.push({ who: 'pause-none', text: 'PAUSE did not study edoxaban (it was not in clinical use when the study started), so only the label line is shown.' });
    else if (pop === 'pediatric') lines.push({ who: 'pause-none', text: 'PAUSE enrolled adults (18 or older) with atrial fibrillation, so no protocol line is shown for a pediatric patient.' });
    else if (k < PAUSE_FLOOR[drug.value]) lines.push({ who: 'pause-none', text: `PAUSE excluded ${drug.value} users with a creatinine clearance below ${PAUSE_FLOOR[drug.value]} mL/min, so the protocol was not studied at ${k} mL/min and no protocol line is shown.` });
    else {
      const omit = drug.value === 'dabigatran' && k < 50 ? (risk === 'high' ? 4 : 2) : (risk === 'high' ? 2 : 1);
      const last = procDay - (omit + 1) * DAY;
      const resumeFrom = procDay + (risk === 'high' ? 2 : 1) * DAY; const resumeTo = risk === 'high' ? procDay + 3 * DAY : null;
      Object.assign(out, { pauseDaysOmitted: omit, pauseLastDoseDay: new Date(last).toISOString().slice(0, 10), pauseResumeFrom: new Date(resumeFrom).toISOString().slice(0, 10), pauseResumeTo: resumeTo === null ? undefined : new Date(resumeTo).toISOString().slice(0, 10) });
      const omitted = omit === 1 ? day(procDay - DAY) : `${day(procDay - omit * DAY)} through ${day(procDay - DAY)}`;
      lines.push({ who: 'pause', text: `PAUSE protocol (${risk} bleeding risk${drug.value === 'dabigatran' ? `, dabigatran at a creatinine clearance ${k < 50 ? 'below 50' : 'of 50 or above'} mL/min` : ''}): last dose on ${day(last)}; no ${drug.value} for ${days(omit)} before (${omitted}) or on the day of the procedure (${day(procDay)}); resume ${resumeTo === null ? `on ${day(resumeFrom)}, about 24 hours after` : `between ${day(resumeFrom)} and ${day(resumeTo)}, 48 to 72 hours after`}, provided hemostasis is achieved.` });
    }
  }

  const answers = lines.filter((l) => (l.who === 'label' && l.edition) || l.who === 'pause');
  const lead = answers[0];
  const rest = lines.filter((l) => l !== lead).map((l) => l.text);
  const notes = [...rest];
  if (answers.length === 2) notes.push('The two sources are shown side by side. They measure differently (the label in hours before the procedure, PAUSE in calendar days), and neither is chosen for you.');
  if (answers.some((l) => l.who === 'pause')) notes.push('PAUSE: Douketis JD, et al. JAMA Intern Med 2019;179:1469-1478. Patients with atrial fibrillation, no heparin bridging.');
  for (const l of lines) if (l.edition) notes.push(`Label: ${l.edition}.`);
  if (!lead) {
    return { ...out, flag: out.labelWithheld && !wantPause ? 'withheld' : 'no-recommendation-given', withheld: Boolean(out.labelWithheld) && !wantPause, abnormal: true, band: lines[0].text, bandLabel: out.labelWithheld && !wantPause ? 'Withheld' : 'No line given', notes: lines.slice(1).map((l) => l.text), note: NOTE };
  }
  const label = lead.who === 'pause' ? `Last dose ${out.pauseLastDoseDay}` : out.labelLastDoseBy ? `Last dose by ${out.labelLastDoseBy}` : 'No time given';
  return { ...out, flag: abnormal ? 'no-recommendation-given' : 'timed', abnormal, band: lead.text, bandLabel: label, notes, note: NOTE };
}
