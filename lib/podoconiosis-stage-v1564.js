// spec-v1564 §3: podoconiosis-stage. The 5-stage clinical staging of podoconiosis (endemic non-filarial
// elephantiasis) for one leg, with the mossy-change mark and the below-knee circumference it is recorded with.
//
// Source: Tekola F, Ayele Z, HaileMariam D, Fuller C, Davey G. Development and testing of a de novo clinical
// staging system for podoconiosis (endemic non-filarial elephantiasis). Trop Med Int Health. 2008;13(10):
// 1277-1283 (PMC2992944, author manuscript; facts restated). Read October 9, 2026, Annex A: stage each leg
// separately; persistent swelling is present all the time, reversible swelling is gone on rising and grows
// through the day; a knob or bump is a discrete hard lump seen or felt (dermal nodules, ridges or bands); the
// ankle is the level of the ankle bones and the knee the top of the kneecap, standing. 1: swelling reversible
// overnight. 2: persistent below-knee swelling, any knobs below the ankle only. 3: persistent below-knee
// swelling with knobs above the ankle. 4: persistent swelling above the knee, knobs anywhere. 5: ankle or toe
// joints fixed, swelling anywhere. Recorded with M+ or M- for mossy changes and the greatest below-knee
// circumference, as "Stage 2, M+, 48". The stages grade severity, not the order of the disease: a stage-5 leg
// need not have had above-knee swelling. The paper's tables use stage 0 for a leg without the disease's signs.
// (The spec cited this as Trop Med Int Health 2006;11:1136; it is 2008;13:1277.)
//
// Stated rather than hidden: an unanswered knobs question leaves a persistent below-knee leg at "at least
// stage 2"; knobs on a leg whose swelling fully goes down overnight are not a combination the staging
// describes, and the answer says to recheck.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];
export const SWELLING = [
  { value: 'none', text: 'No swelling' },
  { value: 'reversible', text: 'Gone on getting up in the morning (reversible overnight)' },
  { value: 'below-knee', text: 'Present all the time, not above the knee' },
  { value: 'above-knee', text: 'Present all the time, reaching above the knee' },
];
export const KNOBS = [
  { value: 'none', text: 'None' },
  { value: 'below-ankle', text: 'Below the ankle only' },
  { value: 'above-ankle', text: 'Above the ankle (as well as below)' },
];

const NOTE = 'Podoconiosis staging (Tekola and colleagues, 2008), for podoconiosis-endemic areas. Stage each leg separately; the stages grade severity, not the order the disease took.';

export function podoconiosisStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sw = SWELLING.find((x) => x.value === o.swelling)?.value;
  if (!sw) return { valid: false, message: 'Choose the swelling of this leg: none, gone overnight, or present all the time below or above the knee.' };
  if (o.fixed !== 'yes' && o.fixed !== 'no') return { valid: false, message: 'Choose whether the ankle or toe joints are fixed (hard to bend up or down).' };
  let circ = null;
  if (o.circumference !== undefined && o.circumference !== null && String(o.circumference).trim() !== '') {
    const f = inputFault([['the below-knee circumference', o.circumference, 10, 150, 'cm']]);
    if (f) return { valid: false, message: f };
    circ = Number(o.circumference);
  }
  const knobs = KNOBS.find((x) => x.value === o.knobs)?.value ?? null;
  const notes = [];
  let stage; let what; let atLeast = false;
  if (sw === 'none') {
    if (o.fixed === 'yes') return { valid: true, band: 'Not staged: joint fixation without swelling is not one of the podoconiosis stages.', bandLabel: 'Not staged', abnormal: true, notes: [], note: NOTE };
    stage = 0; what = 'no swelling';
  } else if (o.fixed === 'yes') { stage = 5; what = 'fixed ankle or toe joints, with swelling'; }
  else if (sw === 'above-knee') { stage = 4; what = 'swelling present all the time, above the knee'; }
  else if (sw === 'below-knee') {
    if (knobs === 'above-ankle') { stage = 3; what = 'swelling present all the time below the knee, with knobs above the ankle'; }
    else if (knobs) { stage = 2; what = `swelling present all the time below the knee${knobs === 'below-ankle' ? ', with knobs below the ankle only' : ', no knobs'}`; }
    else { stage = 2; atLeast = true; what = 'swelling present all the time below the knee'; notes.push('Knobs not assessed: knobs above the ankle make it stage 3.'); }
  } else {
    stage = 1; what = 'swelling that is gone on getting up in the morning';
    if (knobs === 'below-ankle' || knobs === 'above-ankle') notes.push('Knobs belong to stages 2 to 5, where the swelling stays overnight: check the overnight answer.');
  }
  if (stage === 5) notes.push('Sensation is kept; the toes may look short or fused, and an X-ray shows loss of the toe tips and of bone density.');
  const label = `${atLeast ? 'At least stage' : 'Stage'} ${stage}`;
  const mark = o.mossy === 'yes' ? 'M+' : o.mossy === 'no' ? 'M−' : null;
  if (stage > 0) {
    const record = [label, mark ?? 'mossy changes not assessed', circ != null ? `${circ.toLocaleString('en-US')} cm` : 'circumference not measured'].join(', ');
    notes.unshift(`Record: ${record}.`);
  }
  return { valid: true, band: `${label}: ${what}.`, bandLabel: label, abnormal: stage > 0, notes, note: NOTE };
}
