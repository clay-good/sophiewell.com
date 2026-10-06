// spec-v1555 tool 5: the neostigmine (anticholinesterase) trial for neurotoxic snakebite: the atropine and
// neostigmine doses, how to read the response, and the stop rules, by WHO or India's national guideline.
//
// Sources, read October 6, 2026 (facts restated, nothing reproduced):
//   - SEARO16: Warrell DA, for WHO SEARO. Guidelines for the management of snakebites, 2nd ed., 2016 (IRIS
//     10665/249547), pp. 152-153: atropine 0.6 mg (adult) or 50 micrograms/kg (child) IV, then neostigmine
//     IM 0.02 mg/kg (adult) or 0.04 mg/kg (child); observe 30-60 minutes; a convincing response is
//     maintained on neostigmine 0.5-2.5 mg every 1-3 hours up to 10 mg/24 h (adult) or 0.01-0.04 mg/kg every
//     2-4 hours (child), with atropine. The trial must not delay antivenom or intubation.
//   - AFRO10: WHO AFRO. Guidelines for the prevention and clinical management of snakebite in Africa, 2010
//     (IRIS 10665/204458), p. 88 (read as a page image): the same doses; every neurotoxic patient except
//     after a suspected mamba bite, whose venom already contains an anticholinesterase.
//   - INSTG16: Government of India, MoHFW. Standard treatment guidelines: management of snake bite, 2016,
//     p. 18 (algorithm footnote) and p. 39: atropine 0.6 mg then neostigmine 1.5 mg IV; children atropine
//     0.05 mg/kg then neostigmine 0.04 mg/kg IV; then neostigmine 0.5 mg (child 0.01 mg/kg) with atropine
//     every 30 minutes for 5 doses, then tapered at 1, 2, 6 and 12 hours; positive is 50% or more recovery
//     of the ptosis in 1 hour; stop if no response after the 3rd dose (krait ptosis is presynaptic).
//
// Stated rather than hidden: WHO's adult dose is weight-based and IM, India's a flat 1.5 mg IV; the tile
// never mixes them. India's adult doses do not use the weight. mL are given only for an entered
// concentration.
//
// Pure: no DOM, no clock.

import { inputFault } from './num.js';

export const PROTOCOL_OPTIONS = [
  { value: 'who', text: 'WHO (SEARO 2016 and AFRO 2010)' },
  { value: 'india', text: 'India national guideline (2016)' },
];
export const AGE_OPTIONS = [{ value: 'adult', text: 'Adult' }, { value: 'child', text: 'Child' }];
export const RESPONSE_OPTIONS = [
  { value: 'pending', text: 'Not assessed yet' },
  { value: 'ge50', text: 'Ptosis 50% or more better' },
  { value: 'lt50', text: 'Some improvement, under 50%' },
  { value: 'none', text: 'No improvement' },
];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const round = (x, d) => Math.round(x * 10 ** d) / 10 ** d;
const mg = (x) => `${round(x, 2)} mg`;
const NOTE = {
  who: 'This follows WHO SEARO\'s 2016 and WHO AFRO\'s 2010 snakebite guidelines. The trial must not delay antivenom or intubation; watch the patient closely during it.',
  india: 'This follows India\'s 2016 national snakebite treatment guideline. The trial must not delay antivenom or intubation; watch the patient closely during it.',
};

function optConc(label, v) {
  if (String(v ?? '').trim() === '') return { value: null };
  const f = inputFault([[label, v, 0.01, 10, 'mg/mL']]);
  return f ? { fault: f } : { value: Number(v) };
}

export function snakeNeostigmineTrial(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const protocol = PROTOCOL_OPTIONS.find((x) => x.value === o.protocol);
  if (!protocol) return { valid: false, message: 'Choose the protocol: WHO, or India\'s national guideline.' };
  const age = AGE_OPTIONS.find((x) => x.value === o.ageGroup);
  if (!age) return { valid: false, message: 'Choose adult or child: the doses differ.' };
  const f = inputFault([['the weight', o.weight, 1, 250, 'kg']]);
  if (f) return { valid: false, message: f };
  const w = Number(o.weight);
  const who = protocol.value === 'who';
  if (who && !YES_NO.some((x) => x.value === o.mamba)) return { valid: false, message: 'Choose whether a mamba bite is suspected (Africa): WHO AFRO advises against the trial then.' };
  const response = RESPONSE_OPTIONS.find((x) => x.value === o.response);
  if (!response) return { valid: false, message: 'Choose the response so far: not assessed yet, 50% or more better, some improvement, or none.' };
  const nc = optConc('the neostigmine concentration', o.neoConc);
  if (nc.fault) return { valid: false, message: nc.fault };
  const ac = optConc('the atropine concentration', o.atrConc);
  if (ac.fault) return { valid: false, message: ac.fault };

  const out = (band, bandLabel, abnormal, notes) => ({ valid: true, band, bandLabel, abnormal, notes, note: NOTE[protocol.value] });
  if (who && o.mamba === 'yes') {
    return out('Do not give the neostigmine trial: mamba venom already contains an anticholinesterase (WHO AFRO). Give antivenom and support breathing.', 'Not after a mamba bite', true, []);
  }

  const child = age.value === 'child';
  const atropine = child ? 0.05 * w : 0.6;
  const neo = who ? (child ? 0.04 : 0.02) * w : (child ? 0.04 * w : 1.5);
  const inMl = (dose, c) => (c.value === null ? '' : ` = ${round(dose / c.value, 2)} mL at ${c.value} mg/mL`);
  const notes = [];
  notes.push(`Atropine ${mg(atropine)} IV first${child ? ' (0.05 mg/kg)' : ''}${inMl(atropine, ac)}, to block the muscarinic effects.`);
  notes.push(`Then neostigmine ${mg(neo)} ${who ? 'IM' : 'IV'}${who || child ? ` (${child ? 0.04 : 0.02} mg/kg)` : ''}${inMl(neo, nc)}.`);
  if (!who && !child) notes.push('India\'s adult doses are flat: the weight is not used for them.');
  if (nc.value === null) notes.push('Neostigmine concentration: not entered, so its doses are in mg only.');
  if (ac.value === null) notes.push('Atropine concentration: not entered, so its dose is in mg only.');

  if (who) {
    notes.push('Measure the eyelid gap (both eyes) and breathing (peak flow) before, then watch for 30 to 60 minutes.');
    if (response.value === 'ge50') {
      notes.push(child
        ? `Maintenance: neostigmine ${mg(0.01 * w)}-${mg(0.04 * w)} (0.01-0.04 mg/kg) every 2 to 4 hours, IM, IV or subcutaneously, always with atropine.`
        : 'Maintenance: neostigmine 0.5-2.5 mg every 1 to 3 hours, up to 10 mg in 24 hours, IM, IV or subcutaneously, always with atropine.');
      return out(`A convincing response: maintain neostigmine with atropine. Doses given were atropine ${mg(atropine)} IV and neostigmine ${mg(neo)} IM.`, 'Convincing response', true, notes);
    }
    if (response.value === 'pending') return out(`Give atropine ${mg(atropine)} IV, then neostigmine ${mg(neo)} IM, and watch for 30 to 60 minutes.`, 'Doses for the trial', true, notes);
    notes.push('A presynaptic venom (kraits, sea snakes) does not respond to anticholinesterases; antivenom and ventilation remain the treatment.');
    return out(`No convincing response${response.value === 'lt50' ? ' yet' : ''}: do not maintain neostigmine on this result. Continue antivenom and breathing support.`, 'No convincing response', true, notes);
  }

  const repeat = child ? 0.01 * w : 0.5;
  notes.push(`Then neostigmine ${mg(repeat)}${child ? ' (0.01 mg/kg)' : ''}${inMl(repeat, nc)} with atropine every 30 minutes for 5 doses, then tapered at 1, 2, 6 and 12 hours.`);
  notes.push('Stop when recovery is complete, on fasciculations or a slow heart rate, or if there is no response after the 3rd dose.');
  if (response.value === 'ge50') return out(`Positive: the ptosis is 50% or more better within 1 hour. Continue neostigmine ${mg(repeat)} with atropine every 30 minutes for 5 doses, then taper.`, 'Positive', true, notes);
  if (response.value === 'pending') return out(`Give atropine ${mg(atropine)} then neostigmine ${mg(neo)} IV, and judge the ptosis within 1 hour: 50% or more recovery is positive.`, 'Doses for the trial', true, notes);
  notes.push('Krait ptosis is presynaptic: more neostigmine beyond 3 doses does not reverse it, and recovery may take 4 to 5 days.');
  return out('Negative: under 50% recovery of the ptosis. Stop the neostigmine if there is still no response after the 3rd dose; continue antivenom and breathing support.', 'Negative', true, notes);
}
