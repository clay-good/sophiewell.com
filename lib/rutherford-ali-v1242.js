// spec-v1242: the Rutherford classification of ACUTE limb ischemia -- categories I, IIa, IIb and III,
// derived from the four findings the table is built on.
//
// Source:
//   Rutherford RB, Baker JD, Ernst C, Johnston KW, Porter JM, Ahn S, Jones DN. Recommended standards
//   for reports dealing with lower extremity ischemia: revised version. J Vasc Surg. 1997;
//   26(3):517-538. PMID 9308598.
//
// The table, as published:
//
//   I    viable                  no sensory loss, no muscle weakness; arterial AND venous Doppler
//                                signals both audible
//   IIa  marginally threatened   sensory loss limited to the toes, or none; no muscle weakness;
//                                arterial signal often inaudible, venous audible
//   IIb  immediately threatened  sensory loss beyond the toes with rest pain; mild to moderate
//                                muscle weakness; arterial usually inaudible, venous audible
//   III  irreversible            profound anaesthesia; profound paralysis or rigor; arterial AND
//                                venous signals both inaudible
//
// THE LINE THAT DECIDES THE LIMB IS THE VENOUS SIGNAL. IIb and III can look similar at the bedside --
// both have sensory loss and weakness -- and IIb is a limb to revascularize immediately while III is
// one where revascularization is the wrong operation. An inaudible VENOUS Doppler is what separates
// them, and it is the finding most easily left unrecorded because the arterial signal is the one
// everyone reaches for.
//
// THIS IS NOT THE OTHER RUTHERFORD. The catalog already carries the Rutherford CATEGORY for chronic
// limb ischemia, 0 to 6, which runs from asymptomatic to major tissue loss over months to years. This
// is the ACUTE classification, I to III, over hours. They share an author, a journal and a limb, and
// a "Rutherford 3" means something entirely different in each.
//
// Pure: no DOM, no clock, no network.

export const RUTHERFORD_ALI_NOTE = 'The Rutherford acute limb ischemia classification (Rutherford 1997) sorts a threatened limb into viable (I), marginally threatened (IIa), immediately threatened (IIb) and irreversible (III), from the sensory loss, the motor deficit, and whether arterial and venous Doppler signals are audible. It is not the Rutherford category for chronic limb ischemia, which runs 0 to 6 over months; a "Rutherford 3" means a different thing in each. It describes the findings entered and is not a decision to revascularize or to amputate.';

export const ALI_SENSORY = [
  { value: 'none', text: 'No sensory loss', rank: 0 },
  { value: 'toes', text: 'Sensory loss limited to the toes', rank: 1 },
  { value: 'beyond-toes', text: 'Sensory loss beyond the toes, with rest pain', rank: 2 },
  { value: 'profound', text: 'Profound anesthesia', rank: 3 },
];

export const ALI_MOTOR = [
  { value: 'none', text: 'No muscle weakness', rank: 0 },
  { value: 'mild-moderate', text: 'Mild to moderate muscle weakness', rank: 2 },
  { value: 'paralysis', text: 'Profound paralysis, or rigor', rank: 3 },
];

export const ALI_DOPPLER = [
  { value: 'audible', text: 'Audible' },
  { value: 'inaudible', text: 'Inaudible' },
];

const SENSORY = new Map(ALI_SENSORY.map((s) => [s.value, s]));
const MOTOR = new Map(ALI_MOTOR.map((m) => [m.value, m]));

const CATEGORY = {
  I: { label: 'I - viable', text: 'the limb is not immediately threatened' },
  IIa: { label: 'IIa - marginally threatened', text: 'salvageable if treated promptly' },
  IIb: { label: 'IIb - immediately threatened', text: 'salvageable only with immediate revascularization' },
  III: { label: 'III - irreversible', text: 'major tissue loss or permanent nerve damage is inevitable' },
};

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

export function rutherfordAli(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const missing = [];
  if (isBlank(o.sensory)) missing.push('the sensory loss');
  if (isBlank(o.motor)) missing.push('the muscle weakness');
  if (isBlank(o.arterialDoppler)) missing.push('the arterial Doppler signal');
  if (isBlank(o.venousDoppler)) missing.push('the venous Doppler signal');
  if (missing.length) {
    const list = missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
    return {
      valid: false,
      message: `Record ${list}. All four are needed: the venous signal on its own is what separates a limb to revascularize now from one where revascularization is the wrong operation, and a blank is not an audible signal.`,
    };
  }

  const sensory = SENSORY.get(String(o.sensory).trim());
  const motor = MOTOR.get(String(o.motor).trim());
  if (!sensory) return { valid: false, message: `The sensory finding must be one of: ${ALI_SENSORY.map((s) => s.value).join(', ')}.` };
  if (!motor) return { valid: false, message: `The motor finding must be one of: ${ALI_MOTOR.map((m) => m.value).join(', ')}.` };

  const arterial = String(o.arterialDoppler).trim() === 'audible';
  const venous = String(o.venousDoppler).trim() === 'audible';

  // The published rule, in the order the table applies it. An inaudible venous signal is the
  // irreversible category's own finding and it settles the answer before anything else is weighed.
  let category;
  if (!venous) category = 'III';
  else if (motor.rank >= 3 || sensory.rank >= 3) category = 'III';
  else if (motor.rank >= 2 || sensory.rank >= 2) category = 'IIb';
  else if (sensory.rank >= 1 || !arterial) category = 'IIa';
  else category = 'I';

  const c = CATEGORY[category];

  // Where the published table and the findings entered do not line up, say which finding carried it.
  const venousDecided = !venous;
  const conflictNote = venousDecided && motor.rank < 3 && sensory.rank < 3
    ? 'The venous Doppler signal is inaudible while the sensory loss and the weakness are short of profound. In the published table an inaudible venous signal belongs to the irreversible category, and it is that finding, not the examination, that has set this answer. Confirm the venous signal before acting on it.'
    : null;

  const venousNote = venous && (category === 'IIb')
    ? 'The venous signal is audible, which is what makes this a IIb rather than a III: the same sensory loss and weakness with an inaudible venous signal would be an irreversible limb, and the two are managed in opposite directions.'
    : null;

  const arterialOnlyNote = category === 'IIa' && !arterial && sensory.rank === 0 && motor.rank === 0
    ? 'There is no sensory loss and no weakness, and the arterial signal is inaudible. The published table puts an inaudible arterial signal in the marginally threatened category rather than the viable one, so this is a IIa.'
    : null;

  return {
    valid: true,
    category,
    label: c.label,
    sensory: sensory.value,
    motor: motor.value,
    arterialAudible: arterial,
    venousAudible: venous,
    abnormal: category === 'IIb' || category === 'III',
    bandLabel: `Rutherford ${category}`,
    band: `Rutherford acute limb ischemia category ${c.label}: ${c.text}.`,
    venousDecided,
    conflictNote,
    venousNote,
    arterialOnlyNote,
    chronicNote: 'This is the acute classification, I to III, over hours. The Rutherford CATEGORY for chronic limb ischemia in this catalog runs 0 to 6 over months and is a different scale; a "Rutherford 3" is not the same limb in the two.',
    postureNote: 'Decision support, not a verdict. The category describes the findings entered; the operation, and whether there is one, stays with the vascular surgeon.',
    note: RUTHERFORD_ALI_NOTE,
  };
}
