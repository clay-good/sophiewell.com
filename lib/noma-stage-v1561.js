// spec-v1561 tool 9: noma (cancrum oris) stage and urgency (WHO AFRO).
//
// Source: WHO AFRO. Information brochure for early detection and management of noma, 2017 (IRIS
// 10665/254579; CC BY-NC-SA 3.0 IGO, facts restated). Read October 6, 2026, pp. 7-15: the warning sign,
// simple gingivitis (gums bleed when touched or brushed; red or purplish, swollen); stage 1 acute necrotizing
// gingivitis (spontaneous gum bleeding, painful ulceration of one or more interdental papillae, fetid breath,
// excess saliva); stage 2 edema (facial swelling, painful cheek, high fever: the acute phase, a major
// emergency); stage 3 gangrene (a blackened necrotic area, a hole in the cheek or lips, exposed teeth and
// bone); stage 4 scarring (the acute phase over; trismus, sequestration of teeth, exposed bone, scarring
// begins); stage 5 sequelae (disfigurement). Stages up to edema are reversible, gangrene onward is not; each
// stage can progress in 1 to 2 weeks; from edema, refer immediately.
//
// Stated rather than hidden: the brochure's antibiotic doses (amoxicillin "100 mg/kg every 12 hours") are
// not printed, because the figure looks like a per-day dose; the tile gives the stage and the urgency only.
// A sign left blank is not assessed, so the stage is "at least".
//
// Pure: no DOM, no clock.

export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const SIGNS = [
  ['sequelae', 5, 'Sequelae', 'established disfigurement'],
  ['scarring', 4, 'Scarring', 'the acute phase over, with trismus, loose or lost teeth, exposed bone or scarring'],
  ['gangrene', 3, 'Gangrene', 'a black necrotic area or a hole in the cheek or lips'],
  ['edema', 2, 'Edema', 'facial swelling with a painful cheek and fever'],
  ['ang', 1, 'Acute necrotizing gingivitis', 'spontaneous gum bleeding, painful ulcerated papillae and fetid breath'],
  ['gingivitis', 0, 'Simple gingivitis (the warning sign)', 'gums that bleed when touched, red and swollen'],
];
const NOTE = 'This follows WHO AFRO\'s 2017 noma brochure. Open and examine the mouth of any malnourished or recently ill child.';
const known = (v) => v === 'yes' || v === 'no';

export function nomaStage(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  if (!SIGNS.some(([k]) => known(o[k]))) return { valid: false, message: 'Choose whether at least one sign is present or absent.' };
  const hit = SIGNS.find(([k]) => o[k] === 'yes');
  const notes = [];
  if (!hit) {
    const open = SIGNS.filter(([k]) => !known(o[k])).map(([, , name]) => name.toLowerCase());
    if (open.length) return { valid: true, band: `Not staged: no sign present so far, and ${open.join(', ')} not assessed.`, bandLabel: 'Not staged', abnormal: false, notes, note: NOTE };
    return { valid: true, band: 'No sign of noma or its warning sign.', bandLabel: 'No noma', abnormal: false, notes: ['Keep encouraging daily oral hygiene and a high-protein diet in malnourished children.'], note: NOTE };
  }
  const [, stage, name, what] = hit;
  const open = SIGNS.filter(([k, s]) => s > stage && !known(o[k])).map(([, , n]) => n.toLowerCase());
  if (open.length) notes.push(`Not assessed: ${open.join(', ')}. The stage could be higher.`);
  let urgency;
  if (stage >= 2 && stage <= 4) urgency = `An emergency: refer immediately to the nearest hospital or health center; the child\'s life is in danger.${stage === 4 ? ' Physiotherapy may preserve the mouth opening.' : ''}`;
  else if (stage === 5) urgency = 'Refer to a specialized center for reconstruction: physical, psychological and social.';
  else if (stage === 1) urgency = 'Treat at a health center now (antibiotics, nutritional rehabilitation, oral hygiene) and review weekly; it can reach the edema stage within 1 to 2 weeks.';
  else urgency = 'Treat it: daily oral hygiene, mouthwash and a high-protein diet; not every gingivitis becomes noma, but it is the warning sign.';
  notes.push(urgency);
  notes.push(stage <= 2 ? 'Still reversible at this stage if treated at once.' : 'Irreversible from the gangrene stage: the aim is survival and limiting damage.');
  const label = stage === 0 ? 'Warning sign' : `${open.length ? 'At least stage' : 'Stage'} ${stage}`;
  return { valid: true, band: `${stage === 0 ? name : `${open.length ? 'At least stage' : 'Stage'} ${stage}, ${name.toLowerCase()}`}: ${what}.`, bandLabel: label, abnormal: stage >= 1, notes, note: NOTE };
}
