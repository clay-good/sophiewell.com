// spec-v1392: New York Medical Aid in Dying -- the documented steps and the five-day fill wait,
// Public Health Law Article 28-F.
//
// Sources (nysenate.gov text read 2026-09-18):
//   2899-e The patient makes an oral request (recorded by audio or video and kept in the record) and
//     submits a written request, signed and dated, witnessed by at least two adults. "Both
//     witnesses shall be adults who are not": (i) a relative by blood, marriage, or adoption;
//     (ii) a person entitled to part of the estate or who would otherwise benefit financially from
//     the death; (iii) an owner, operator, employee, or independent contractor of a health care
//     facility where the patient is treated or lives; (iv) a domestic partner; (v) the health care
//     proxy agent; (vi) an agent under a power of attorney. The attending, consulting physician, and
//     the mental health professional who determines capacity may not be witnesses.
//   2899-f(2) The attending physician receives confirmation from a consulting physician and a mental
//     health professional before prescribing. (3) "A prescription for medication shall not be
//     filled until five days after the prescription has been written", unless the attending has
//     medically confirmed the patient may die before then; the prescription shows the date and time
//     written and the first allowable date and time to fill.
//
// No expiry of an unfilled prescription appears in 2899-f. The Department's Medical Aid in Dying FAQ
// (health.ny.gov, revised August 2026, read 2026-09-19) says a prescription the patient does not fill
// within 30 days expires, and the attending may re-issue it without restarting the process. The
// answer states that and computes no expiry date, since the FAQ does not say what the 30 days run
// from. The Department's regulations were proposed, not final, when read.
//
// Pure: no DOM, no clock, no network. Dates 'YYYY-MM-DD'; the prescription time 'YYYY-MM-DDTHH:MM'.

import { parseDate, parseDateTime, addHours, formatDeadline, scopeSentence } from './state-calendar.js';

export const NYMAID_VERIFIED = '2026-09-18';
export const WITNESS = [
  { value: 'ok', text: 'None of the disqualifications' },
  { value: 'relative', text: 'Relative by blood, marriage, or adoption' },
  { value: 'heir', text: 'Heir, or would benefit financially from the death' },
  { value: 'facility', text: 'Owner, operator, employee, or contractor of the treating facility' },
  { value: 'partner', text: 'Domestic partner' },
  { value: 'proxy', text: 'Health care proxy agent' },
  { value: 'poa', text: 'Agent under a power of attorney' },
  { value: 'clinician', text: 'The attending, consulting physician, or capacity evaluator' },
];
export const YES_NO = [
  { value: 'yes', text: 'Yes' },
  { value: 'no', text: 'No' },
];

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

const STEPS = [
  ['oral', 'the recorded oral request'],
  ['written', 'the written request'],
  ['attending', "the attending physician's determination"],
  ['consulting', "the consulting physician's confirmation"],
  ['mentalHealth', "the mental health professional's confirmation"],
];

export function nyMaidTimeline(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const done = [];
  const missing = [];
  for (const [k, label] of STEPS) {
    if (isBlank(o[k])) { missing.push(label); continue; }
    const t = parseDate(o[k]);
    if (t === null) return { valid: false, message: `Enter the date of ${label} as a date.` };
    done.push(label);
  }
  if (!done.length) return { valid: false, message: 'Enter the date of the recorded oral request and each step after it. No prescription date is shown until all five are entered.' };

  const w = [WITNESS.find((x) => x.value === o.witness1), WITNESS.find((x) => x.value === o.witness2)];
  const witnessDefects = w.filter((x) => x && x.value !== 'ok').map((x) => x.text.toLowerCase());
  const witnessOpen = w.some((x) => !x);

  const base = { valid: true, voluntaryNote: 'Participation is voluntary for every clinician. This tool checks dates and documented steps; it does not assess eligibility.', postureNote: scopeSentence(NYMAID_VERIFIED) };
  if (witnessDefects.length) {
    return { ...base, abnormal: true, bandLabel: 'Written request: witness defect', band: `Both witnesses must be adults who are none of the listed people (2899-e). Disqualified: ${witnessDefects.join('; ')}.` };
  }
  if (missing.length || witnessOpen) {
    const need = [...missing, ...(witnessOpen ? ['both witnesses on the written request'] : [])];
    return { ...base, abnormal: false, bandLabel: 'Incomplete: no prescription date yet', band: `Still needed before a prescription: ${need.join('; ')}. The attending needs both confirmations before prescribing (2899-f(2)).` };
  }
  if (isBlank(o.prescribed)) {
    return { ...base, abnormal: false, bandLabel: 'Steps documented', band: 'Every step before the prescription is documented. Once it is written, it may not be filled for five days; enter the date and time it was written.' };
  }
  const rx = parseDateTime(o.prescribed);
  if (rx === null) return { valid: false, message: 'Enter when the prescription was written, as a date and time.' };
  const expiryNote = 'If the patient does not fill the prescription within 30 days it expires, and the attending may re-issue it without restarting the process (NYSDOH Medical Aid in Dying FAQ, August 2026).';
  if (o.dieSooner === 'yes') {
    return { ...base, expiryNote, abnormal: false, bandLabel: 'Fill once all requirements are affirmed', band: 'The attending has medically confirmed the patient may die within five days, so the prescription may be filled once the attending affirms every other requirement is met (2899-f(3)).' };
  }
  const fill = addHours(rx, 120);
  return {
    ...base,
    expiryNote,
    fillAt: fill.end,
    abnormal: false,
    bandLabel: `First fill: ${fill.end.replace('T', ' ')}`,
    band: `The prescription may not be filled before ${formatDeadline(rx, fill.endWall, 'it was written')} (five days, 2899-f(3)). The prescription itself shows the time written and this first allowable fill time.`,
    caveats: fill.caveats,
  };
}
