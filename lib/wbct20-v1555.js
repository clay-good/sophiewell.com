// spec-v1555 tool 1: the 20-minute whole blood clotting test (20WBCT) after a snakebite: is the test valid,
// what the result means, and when it is repeated.
//
// Sources, read October 5, 2026 (facts restated, nothing reproduced; all rights reserved or no licence):
//   - Warrell DA, for WHO SEARO. Guidelines for the management of snakebites, 2nd ed., 2016, pp. 123-125:
//     2 mL of fresh venous blood in a new, clean, dry, ordinary glass vessel, left 20 minutes at room
//     temperature, then tipped once; still liquid means incoagulable blood from venom-induced consumption
//     coagulopathy, which in South-East Asia points to a viper and rules out an elapid; plastic, glass cleaned
//     with detergent, soap or washing fluid, or a wet or contaminated vessel gives a false "not clotted" and
//     the test is invalid; recycled glass washed only with 0.9% saline and hot-air dried is acceptable; if in
//     doubt, repeat in duplicate with a healthy person's blood as a control; the test turns non-clotting
//     only below about 0.5 g/L fibrinogen, so a clotted test is repeated and antivenom is not delayed when
//     there is other evidence such as spontaneous bleeding away from the bite. pp. 128-129: a non-clotting
//     20WBCT is among the indications for antivenom. p. 142: coagulability usually returns 3-9 hours after
//     an adequate dose; incoagulable blood persisting or recurring 6 hours after the initial dose is the
//     criterion for repeating it.
//   - WHO AFRO. Guidelines for the prevention and clinical management of snakebite in Africa, 2010, pp. 60-61
//     (read as page images): incoagulable blood is a cardinal sign of envenoming by most vipers (especially
//     saw-scaled vipers, desert horned-vipers, and puff adders in southern and central Africa) and the
//     medically important back-fanged colubrids; the vessel must be glass, not cleaned with detergent or wet.
//   - Government of India, MoHFW. Standard treatment guidelines: management of snake bite, 2016, p. 29 and the
//     summary: clotted, retest every hour for the first 3 hours from hospitalization, then every 6 hours for
//     24 hours; not clotted, retest 6 hours after the antivenom loading dose; neurotoxic, retest after 6
//     hours. Report "clotted" or "not clotted", never positive or negative.
//
// Conflict stated rather than hidden: the same India guideline's monitoring paragraph (p. 28) retests every 4
// hours, not 6, after the first 3; the tile follows the diagnostic section and the summary, and says so.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const VESSEL_OPTIONS = [
  { value: 'new-glass', text: 'New, clean, dry ordinary glass' },
  { value: 'saline-glass', text: 'Recycled glass washed only with 0.9% saline and hot-air dried' },
  { value: 'plastic', text: 'Plastic (tube, bottle or syringe)' },
  { value: 'detergent', text: 'Glass cleaned with detergent, soap or washing fluid' },
  { value: 'wet', text: 'Wet or contaminated vessel' },
  { value: 'unsure', text: 'Not sure' },
];
export const RESULT_OPTIONS = [
  { value: 'clotted', text: 'Clotted' },
  { value: 'not-clotted', text: 'Not clotted (still liquid when tipped)' },
];
export const TIMING_OPTIONS = [
  { value: 'admission', text: 'Before any antivenom' },
  { value: 'after', text: 'After the antivenom loading dose' },
];
export const REGION_OPTIONS = [
  { value: 'asia', text: 'South or South-East Asia' },
  { value: 'africa', text: 'Africa' },
  { value: 'other', text: 'Elsewhere' },
];

const INVALID_WHY = {
  plastic: 'a plastic vessel does not start clotting',
  detergent: 'detergent, soap or washing fluid stops the glass from starting clotting',
  wet: 'a wet or contaminated vessel can stop the blood from clotting',
  unsure: 'an unsuitable vessel gives a false "not clotted"',
};
const ASIA = 'In South and South-East Asia, incoagulable blood points to a viper bite and rules out an elapid (SEARO).';
const AFRICA = 'In Africa, it is a cardinal sign of most vipers (saw-scaled vipers, desert horned-vipers, puff adders in southern and central Africa) and the medically important back-fanged colubrids (AFRO).';
const NOTE = 'This follows WHO SEARO (2016), WHO AFRO (2010) and India\'s 2016 standard treatment guidelines. Your national protocol may differ; follow it.';
const r1 = (x) => String(Math.round(x * 10) / 10);

export function wbct20(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const vessel = VESSEL_OPTIONS.find((x) => x.value === o.vessel);
  if (!vessel) return { valid: false, message: 'Choose the vessel the blood was tested in: the test is only valid in clean, dry, ordinary glass.' };
  if (!RESULT_OPTIONS.some((x) => x.value === o.result)) return { valid: false, message: 'Choose the result after 20 minutes: clotted, or not clotted.' };
  if (!TIMING_OPTIONS.some((x) => x.value === o.timing)) return { valid: false, message: 'Choose when the test was done: before any antivenom, or after the loading dose.' };
  if (!(o.region === undefined || o.region === null || o.region === '') && !REGION_OPTIONS.some((x) => x.value === o.region)) return { valid: false, message: 'Choose the region from the list.' };
  let hours = null;
  if (o.timing === 'after' && !(o.hours === undefined || o.hours === null || String(o.hours).trim() === '')) {
    const f = inputFault([['the hours since the loading dose', o.hours, 0, 72]]);
    if (f) return { valid: false, message: f };
    hours = Number(o.hours);
  }

  if (INVALID_WHY[vessel.value]) {
    return {
      valid: true,
      band: `Invalid test: ${INVALID_WHY[vessel.value]}, so the result cannot be read, whichever way it came out. Repeat it with about 2 mL of fresh venous blood in a new, clean, dry, ordinary glass vessel.`,
      bandLabel: 'Invalid test',
      abnormal: true,
      notes: ['If there is any doubt, run the test in duplicate with a healthy person\'s blood (a relative, for example) as a control.'],
      note: NOTE,
    };
  }

  const notes = [];
  if (o.result === 'clotted') {
    if (o.timing === 'admission') {
      notes.push('Retest every hour for the first 3 hours from admission, then every 6 hours for 24 hours, until it is not clotted or envenoming shows. If the envenoming is neurotoxic, retest after 6 hours. (India 2016; its monitoring paragraph says every 4 hours after the first 3.)');
      notes.push('Do not wait for the test to turn if there is other evidence of a bleeding disorder, such as spontaneous bleeding away from the bite: that is itself a reason for antivenom.');
      return {
        valid: true,
        band: 'Clotted: no incoagulable blood now. Early on this does not rule out envenoming: the test only turns "not clotted" once fibrinogen falls below about 0.5 g/L.',
        bandLabel: 'Clotted: retest',
        abnormal: false,
        notes,
        note: NOTE,
      };
    }
    notes.push('Incoagulable blood can come back as more venom reaches the blood. SEARO counts a recurrence as a reason for more antivenom; keep testing as your protocol sets.');
    return {
      valid: true,
      band: `Clotted${hours === null ? '' : ` at ${r1(hours)} hours`} after the loading dose: blood coagulability has returned. After an adequate dose this usually takes 3 to 9 hours.`,
      bandLabel: 'Clotted: coagulability restored',
      abnormal: false,
      notes,
      note: NOTE,
    };
  }

  // Not clotted, in a valid vessel.
  if (!o.region) notes.push(`No region was entered. ${ASIA} ${AFRICA}`);
  else if (o.region === 'asia') notes.push(ASIA);
  else if (o.region === 'africa') notes.push(AFRICA);
  else notes.push('The WHO regional guidelines read here cover Asia and Africa; they give no species meaning elsewhere. Latin America uses a different test, the Lee-White clotting time.');

  if (o.timing === 'admission') {
    notes.push('A non-clotting test is one of SEARO\'s indications for antivenom. Retest 6 hours after the loading dose.');
    return {
      valid: true,
      band: 'Not clotted: incoagulable blood from venom-induced consumption coagulopathy.',
      bandLabel: 'Not clotted',
      abnormal: true,
      notes,
      note: NOTE,
    };
  }
  let band;
  let label;
  if (hours === null) {
    band = 'Not clotted after the loading dose: the blood is still incoagulable. Retest 6 hours after the loading dose; if it is still not clotted then, SEARO repeats the initial dose.';
    label = 'Not clotted: retest at 6 hours';
    notes.unshift('No time since the loading dose was entered.');
  } else if (hours < 6) {
    band = `Not clotted ${r1(hours)} hours after the loading dose: still within the usual 3 to 9 hours for clotting to return. Retest at 6 hours, ${r1(6 - hours)} hours from now.`;
    label = 'Not clotted: retest at 6 hours';
  } else {
    band = `Not clotted ${r1(hours)} hours after the loading dose: incoagulable blood persisting 6 hours or more after the initial dose is SEARO's criterion for repeating that dose.`;
    label = 'Not clotted at 6 hours or more';
  }
  return { valid: true, band, bandLabel: label, abnormal: true, notes, note: NOTE };
}
