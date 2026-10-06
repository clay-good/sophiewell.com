// spec-v1556 tool 1: snakebite severity and antivenom vials in Brazil (Ministério da Saúde).
//
// Source: Brasil, Ministério da Saúde. Guia de Vigilância em Saúde, 6th ed. revised, vol. 3, 2024
// (bvsms.saude.gov.br; CC BY-NC-SA 4.0, facts restated in English; owner decision D3), "Acidente ofídico",
// Quadro 1 (p. 1128, adapted from FUNASA 2001) and the general notes (p. 1153). Read October 6, 2026:
//   - Bothrops (SABr; or SABL or SABC): mild, discreet local signs, discreet skin or mucosal bleeding, or a
//     clotting abnormality alone, 2-4 vials; moderate, evident swelling and bruising, bleeding without
//     systemic compromise, 4-8; severe, intense local signs, severe bleeding, hypotension or shock, kidney
//     failure or anuria, 12.
//   - Lachesis (SABL), never mild: moderate, local signs, bleeding possible, no vagal signs, 10; severe,
//     intense local signs, intense bleeding, vagal signs, 20.
//   - Crotalus (SACr; or SABC): mild, discreet paralysis signs, no muscle pain, dark urine or low urine
//     output, 5; moderate, evident paralysis with discreet muscle pain and dark urine, 10; severe, evident
//     paralysis with intense muscle pain and dark urine, low urine output, 20.
//   - Micrurus (SAEla): every case potentially severe (respiratory failure), 10.
//   - With no clinical signs on arrival, observe at least 6 hours. No routine skin test.
//
// Stated rather than hidden: the vial counts are for Brazilian public antivenoms only. A finding left blank
// is not assessed; when a blank could raise the class, the answer is "at least".
//
// Pure: no DOM, no clock.

export const TYPE_OPTIONS = [
  { value: 'bothrops', text: 'Bothrops (jararaca)' },
  { value: 'lachesis', text: 'Lachesis (surucucu)' },
  { value: 'crotalus', text: 'Crotalus (rattlesnake, cascavel)' },
  { value: 'micrurus', text: 'Micrurus (coral snake)' },
];
export const LOCAL_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'discreet', text: 'Discreet' },
  { value: 'evident', text: 'Evident swelling and bruising' },
  { value: 'intense', text: 'Intense' },
];
export const BLEED_OPTIONS = [
  { value: 'none', text: 'None' },
  { value: 'discreet', text: 'Discreet, skin or mucosa' },
  { value: 'moderate', text: 'Bleeding without systemic compromise' },
  { value: 'severe', text: 'Severe or intense' },
];
export const NEURO_OPTIONS = [{ value: 'none', text: 'None' }, { value: 'discreet', text: 'Discreet' }, { value: 'evident', text: 'Evident' }];
export const MYO_OPTIONS = [{ value: 'none', text: 'None' }, { value: 'discreet', text: 'Discreet' }, { value: 'intense', text: 'Intense' }];
export const YES_NO = [{ value: 'no', text: 'No' }, { value: 'yes', text: 'Yes' }];

const NOTE = 'This follows Brazil\'s Guia de Vigilância em Saúde (2024), Quadro 1. Vial counts are for Brazilian public antivenoms only; follow the national product guidance.';
const LEVEL = { none: 0, mild: 1, moderate: 2, severe: 3 };

export function brazilSnakebiteAntivenom(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const t = TYPE_OPTIONS.find((x) => x.value === o.type);
  if (!t) return { valid: false, message: 'Choose the type of accident: Bothrops, Lachesis, Crotalus or Micrurus.' };
  const notes = ['No skin test before antivenom: it is not part of routine practice.'];
  const out = (band, label, abnormal) => ({ valid: true, band, bandLabel: label, abnormal, notes, note: NOTE });
  if (t.value === 'micrurus') return out('Micrurus (coral snake): treat every case as potentially severe (risk of respiratory failure). Give 10 vials of SAEla.', '10 vials SAEla', true);

  const yes = (k) => o[k] === 'yes';
  const open = (k) => o[k] === undefined || o[k] === null || o[k] === '';
  let cls = 'none';
  let canRise = false;
  let anti;
  let vials;
  if (t.value === 'bothrops') {
    anti = 'SABr (or SABL or SABC)';
    vials = { mild: '2-4', moderate: '4-8', severe: '12' };
    if (o.local === 'intense' || o.bleeding === 'severe' || yes('shock') || yes('renal')) cls = 'severe';
    else if (o.local === 'evident' || o.bleeding === 'moderate') cls = 'moderate';
    else if (o.local === 'discreet' || o.bleeding === 'discreet' || yes('clotting')) cls = 'mild';
    canRise = cls !== 'severe' && ['local', 'bleeding', 'shock', 'renal'].some(open);
    if (cls === 'mild' && o.local !== 'discreet' && o.bleeding !== 'discreet') notes.push('A clotting abnormality alone already makes a Bothrops bite mild: give antivenom.');
  } else if (t.value === 'lachesis') {
    anti = 'SABL';
    vials = { moderate: '10', severe: '20' };
    if (o.local === 'intense' || o.bleeding === 'severe' || yes('vagal')) cls = 'severe';
    else if (['discreet', 'evident'].includes(o.local) || ['discreet', 'moderate'].includes(o.bleeding)) cls = 'moderate';
    canRise = cls !== 'severe' && ['local', 'bleeding', 'vagal'].some(open);
    notes.push('Lachesis bites are never classed as mild, because of their potential severity. Vagal signs: slow heart rate, low blood pressure, diarrhea.');
  } else {
    anti = 'SACr (or SABC)';
    vials = { mild: '5', moderate: '10', severe: '20' };
    if (o.myo === 'intense' || yes('oliguria')) cls = 'severe';
    else if (o.neuro === 'evident' || o.myo === 'discreet') cls = 'moderate';
    else if (o.neuro === 'discreet') cls = 'mild';
    canRise = cls !== 'severe' && ['neuro', 'myo', 'oliguria'].some(open);
  }

  if (cls === 'none') {
    if (canRise) return out(`${t.text}: no sign of envenoming entered, but some findings were not assessed. Assess them; with no signs, observe at least 6 hours.`, 'Not decided', false);
    notes.push('A small amount of venom can give late symptoms; check the clotting time (Lee-White) too.');
    return out(`${t.text}: no sign of envenoming now. Observe at least 6 hours before deciding there was no envenoming.`, 'Observe 6 hours', false);
  }
  if (canRise) notes.push('Some findings were not assessed: the class could be higher.');
  const n = vials[cls];
  const head = canRise ? `At least ${cls}` : `${cls[0].toUpperCase()}${cls.slice(1)}`;
  return out(`${head} ${t.text.split(' ')[0]} accident: ${n} vials of ${anti}.`, `${head}: ${n} vials`, LEVEL[cls] >= 1);
}
