// spec-v1561 tool 3: the WHO leprosy disability grade (0, 1 or 2) and the eye-hand-foot (EHF) score.
//
// Source: WHO SEARO. Enhanced global strategy for further reducing the disease burden due to leprosy
// (2011-2015): operational guidelines (updated), 2009 (IRIS 10665/205003; WHO copyright, facts restated).
// Read October 6, 2026, pp. 22-23 and 54: each eye, hand and foot is graded 0, 1 or 2 and the highest is the
// patient's grade. Grade 0: no disability. Grade 1: loss of sensation in a hand or foot (eyes have no grade
// 1). Grade 2: visible damage: for the eye, inability to close fully, obvious redness, or visual impairment
// (cannot read the top line of a Snellen chart or count fingers at 6 m); for a hand or foot, wounds or
// ulcers, claw hand, foot drop, or loss of tissue. The EHF score is the sum of the six grades (0-12) and is
// more sensitive to change; compare it at diagnosis and at the end of treatment.
//
// Stated rather than hidden: this is the 2009 edition (the 1988 grading gave the eye a grade 1). A site left
// blank is not assessed, so the grade and score are "at least".
//
// Pure: no DOM, no clock.

export const EYE_OPTIONS = [
  { value: '0', text: 'Grade 0: normal' },
  { value: '2', text: 'Grade 2: cannot close fully, obvious redness, or cannot count fingers at 6 m' },
];
export const LIMB_OPTIONS = [
  { value: '0', text: 'Grade 0: normal' },
  { value: '1', text: 'Grade 1: loss of feeling only' },
  { value: '2', text: 'Grade 2: wound, ulcer, claw hand, foot drop or tissue loss' },
];

const SITES = [
  ['eyeR', 'right eye', EYE_OPTIONS], ['eyeL', 'left eye', EYE_OPTIONS],
  ['handR', 'right hand', LIMB_OPTIONS], ['handL', 'left hand', LIMB_OPTIONS],
  ['footR', 'right foot', LIMB_OPTIONS], ['footL', 'left foot', LIMB_OPTIONS],
];
const NOTE = 'This follows WHO\'s 2009 leprosy operational guidelines (the eyes have no grade 1 in this edition).';

export function leprosyDisabilityGrade(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const graded = [];
  const open = [];
  for (const [k, name, opts] of SITES) {
    const v = o[k];
    if (v === undefined || v === null || v === '') { open.push(name); continue; }
    if (!opts.some((x) => x.value === String(v))) return { valid: false, message: `Choose a grade for the ${name} from the list${k.startsWith('eye') ? ' (an eye is 0 or 2)' : ''}.` };
    graded.push([name, Number(v)]);
  }
  if (!graded.length) return { valid: false, message: 'Choose a grade for at least one eye, hand or foot.' };
  const max = Math.max(...graded.map(([, g]) => g));
  const ehf = graded.reduce((s, [, g]) => s + g, 0);
  const worst = graded.filter(([, g]) => g === max && g > 0).map(([n]) => n);
  const notes = [];
  if (open.length) notes.push(`Not assessed: ${open.join(', ')}. The grade and EHF score could be higher.`);
  if (max === 1) notes.push('Loss of feeling in the feet puts the soles at risk of ulcers: protective footwear prevents most of them.');
  if (max === 2) notes.push('Refer for prevention-of-disability care, recording the visible disability before referral.');
  notes.push('Compare the EHF score at diagnosis and at the end of treatment: it shows new disability better than the grade.');
  const at = open.length ? 'At least ' : '';
  return {
    valid: true,
    band: `${at}${at ? 'disability grade' : 'Disability grade'} ${max}${worst.length ? ` (${worst.join(', ')})` : ''}; EHF score ${at ? 'at least ' : ''}${ehf} of 12.`,
    bandLabel: `${at}Grade ${max}`.replace('At least Grade', 'At least grade'),
    abnormal: max > 0,
    notes,
    note: NOTE,
  };
}
