// spec-v1635 tool 28: breastfeeding interruption after a radiopharmaceutical.
//
// Source: NRC Regulatory Guide 8.39, Revision 1 (April 2020; ADAMS ML19232A081), Table 3,
// "Activities of Radiopharmaceuticals That Require Instructions and Records When Administered to
// Patients Who Could Breastfeed an Infant or Child After Release", re-read from the PDF on October
// 11, 2026, with 10 CFR 35.75(b). A U.S. government work.
//   Column 1: the activity above which instructions are required. Column 2: the activity above which
//   a record is required. Column 3: examples of the recommended duration of interruption.
//   Footnote a: the durations aim to keep the dose to a newborn below 1 mSv (0.1 rem), "although the
//   regulatory limit is 5 mSv (0.5 rem)"; the physician may lengthen or shorten them within that limit.
//   Footnote b: the durations are the ACMUI subcommittee's; a blank Column 3 means the maximum
//   activity normally administered is below the instruction activity; for Tc-99m agents one 24-hour
//   period is recommended for all.
//   The last rows of the table give a duration and no activity: the guide leaves the infant dose to a
//   calculation (Stabin's dose conversion factors), which is not done here.
// Both the MBq and the mCi columns are stored as printed, and the activity is compared in the unit
// entered, so no conversion sits between the reader's number and the table's.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

const H24 = '24 hours';
const STOP = 'complete cessation (for this infant or child)';
// [value, text, instructions MBq, instructions mCi, record MBq, record mCi, duration or null]
const T = [
  ['i-131-nai', 'I-131 sodium iodide', 0.01, 0.0004, 0.07, 0.002, STOP],
  ['i-123-nai', 'I-123 sodium iodide', 20, 0.5, 100, 3, '3 days'],
  ['i-123-oih', 'I-123 OIH', 100, 4, 700, 20, null],
  ['i-123-mibg', 'I-123 MIBG', 70, 2, 400, 10, '24 hours for 370 MBq (10 mCi)'],
  ['i-125-oih', 'I-125 OIH', 3, 0.08, 15, 0.4, null],
  ['i-131-oih', 'I-131 OIH', 10, 0.30, 60, 1.5, null],
  ['tc-99m-dtpa', 'Tc-99m DTPA', 1000, 30, 6000, 150, H24],
  ['tc-99m-maa', 'Tc-99m MAA', 50, 1.3, 200, 6, H24],
  ['tc-99m-pertechnetate', 'Tc-99m pertechnetate', 100, 3, 600, 15, H24],
  ['tc-99m-disida', 'Tc-99m DISIDA', 1000, 30, 6000, 150, H24],
  ['tc-99m-glucoheptonate', 'Tc-99m glucoheptonate', 1000, 30, 6000, 150, H24],
  ['tc-99m-ham', 'Tc-99m HAM', 400, 10, 2000, 50, H24],
  ['tc-99m-mibi', 'Tc-99m MIBI', 1000, 30, 6000, 150, H24],
  ['tc-99m-mdp', 'Tc-99m MDP', 1000, 30, 6000, 150, H24],
  ['tc-99m-pyp', 'Tc-99m PYP', 900, 25, 4000, 120, H24],
  ['tc-99m-rbc-in-vivo', 'Tc-99m red blood cells, in vivo labeling', 400, 10, 2000, 50, H24],
  ['tc-99m-rbc-in-vitro', 'Tc-99m red blood cells, in vitro labeling', 1000, 30, 6000, 150, H24],
  ['tc-99m-sulfur-colloid', 'Tc-99m sulfur colloid', 300, 7, 1000, 30, H24],
  ['tc-99m-dtpa-aerosol', 'Tc-99m DTPA aerosol', 1000, 30, 6000, 150, H24],
  ['tc-99m-mag3', 'Tc-99m MAG3', 1000, 30, 6000, 150, H24],
  ['tc-99m-wbc', 'Tc-99m white blood cells', 100, 3, 600, 15, H24],
  ['ga-67', 'Ga-67', 1, 0.04, 7, 0.2, '28 days'],
  ['cr-51-edta', 'Cr-51 EDTA', 60, 1.6, 300, 8, null],
  ['in-111-wbc', 'In-111 white blood cells', 10, 0.2, 40, 1, '6 days'],
  ['tl-201', 'Tl-201 chloride', 40, 1, 200, 5, '4 days'],
  // Rows with a duration and no activity.
  ['pet-short', 'C-11, N-13, O-15 or Rb-82', null, null, null, null, 'no interruption'],
  ['f-18-fdg', 'F-18 FDG', null, null, null, null, '4 hours'],
  ['lu-177-octreotate', 'Lu-177 octreotate, diagnostic or therapeutic', null, null, null, null, STOP],
  ['ra-223-alpha', 'Ra-223 and all alpha emitters', null, null, null, null, STOP],
  ['zr-89', 'Zr-89', null, null, null, null, '28 days'],
  ['ga-68-octreotate', 'Ga-68 octreotate', null, null, null, null, '4 hours'],
  ['in-111-octreotate', 'In-111 octreotate', null, null, null, null, '6 days'],
  ['i-124-nai', 'I-124 sodium iodide', null, null, null, null, STOP],
];
export const AGENTS = T.map(([value, text, iMbq, iMci, rMbq, rMci, duration]) => ({ value, text, instructions: iMbq === null ? null : { mbq: iMbq, mci: iMci }, record: rMbq === null ? null : { mbq: rMbq, mci: rMci }, duration }));
export const UNITS = [{ value: 'mci', text: 'mCi' }, { value: 'mbq', text: 'MBq' }];
const NOTE = 'The durations are the guide\'s examples and aim at an infant dose below 1 mSv (0.1 rem); the regulatory limit is 5 mSv (0.5 rem), and the physician may recommend a longer or shorter interruption within it. This reports the table; it does not estimate the infant\'s dose or cover a product the table does not list. Agreement State rules may differ.';
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

export function nucMedBreastfeedingInterruption(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const agent = AGENTS.find((a) => a.value === String(o.agent ?? '').trim());
  if (!agent) return { valid: false, message: 'Choose the radiopharmaceutical from the guide\'s table.' };
  const cite = 'NRC Regulatory Guide 8.39, Revision 1 (April 2020), Table 3; 10 CFR 35.75(b).';
  const dur = agent.duration ? agent.duration[0].toUpperCase() + agent.duration.slice(1) : null;
  if (!agent.instructions) {
    return { valid: true, flag: 'duration-only', abnormal: agent.duration !== 'no interruption', agent: agent.value, duration: agent.duration, instructionsRequired: null, recordRequired: null, band: `${agent.text}: ${agent.duration === 'no interruption' ? 'no interruption of breastfeeding is recommended' : `recommended interruption of breastfeeding: ${agent.duration}`}.`, bandLabel: dur, notes: ['The table gives this row a duration and no activity threshold: the guide says the activity to the infant can be calculated with published dose conversion factors, which is not done here.', cite], note: NOTE };
  }
  if (blank(o.activity)) return { valid: false, message: `Enter the administered activity: for ${agent.text} the table's instruction and record thresholds depend on it.` };
  const unit = UNITS.find((u) => u.value === String(o.unit ?? '').trim());
  if (!unit) return { valid: false, message: 'Choose the unit of the activity: mCi or MBq.' };
  const f = inputFault([['the administered activity', o.activity, null, 1e6, unit.text]]);
  if (f) return { valid: false, message: f };
  const a = Number(o.activity); const i = agent.instructions[unit.value]; const r = agent.record[unit.value];
  const needInstr = a > i; const needRecord = a > r;
  const notes = [`Instructions are required above ${i.toLocaleString('en-US')} ${unit.text}, and a record above ${r.toLocaleString('en-US')} ${unit.text} (${agent.instructions.mci} and ${agent.record.mci} mCi; ${agent.instructions.mbq.toLocaleString('en-US')} and ${agent.record.mbq.toLocaleString('en-US')} MBq).`];
  if (agent.duration) notes.push(`Recommended duration of interruption in the table: ${agent.duration}.${agent.value.startsWith('tc-99m') ? ' The guide recommends one 24-hour period for every Tc-99m agent, to keep the guidance simple.' : ''}`);
  else notes.push('The table gives no duration for this product: the guide says the maximum activity normally administered is below the activity that requires instructions.');
  notes.push(cite);
  return {
    valid: true, flag: needRecord ? 'instructions-and-record' : needInstr ? 'instructions' : 'below-thresholds', abnormal: needInstr, agent: agent.value, instructionsRequired: needInstr, recordRequired: needRecord, duration: agent.duration,
    band: `${agent.text}, ${a.toLocaleString('en-US')} ${unit.text}: ${needInstr ? `instructions are required${needRecord ? ', and a record' : '; no record is required'}` : 'below the activity that requires instructions'}.${needInstr && agent.duration ? ` Recommended interruption: ${agent.duration}.` : ''}`,
    bandLabel: needInstr ? (dur || 'Instructions required') : 'Below the instruction activity',
    notes, note: NOTE,
  };
}
