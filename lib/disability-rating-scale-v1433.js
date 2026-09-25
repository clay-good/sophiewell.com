// spec-v1433: Disability Rating Scale (DRS) for traumatic brain injury.
//
// Sources, read 2026-09-24:
//   Rappaport M, Hall KM, Hopkins K, Belleza T, Cope DN. Disability rating scale for severe head
//     trauma: coma to community. Arch Phys Med Rehabil 1982;63(3):118-123 (PubMed 7073452).
//   The Center for Outcome Measurement in Brain Injury (COMBI), DRS syllabus and FAQ
//     (tbims.org/combi/drs): the eight items and their levels; "Add eight ratings to obtain total DRS
//     score"; the total categories 0 none, 1 mild, 2-3 partial, 4-6 moderate, 7-11 moderately severe,
//     12-16 severe, 17-21 extremely severe, 22-24 vegetative state, 25-29 extreme vegetative state,
//     30 death -- which "were not based on any statistical analysis of scaling" and "Any use of the
//     DRS for research purposes should utilize the actual summed scores"; the 0.5 rating option
//     "is not recommended" after April 1, 2010; the DRS "is not recommended for rating persons who
//     have sustained a mild brain injury"; feeding, toileting and grooming are rated "for cognitive
//     ability (knowing how and when) only"; "There is no charge for using the DRS. It can be copied
//     freely."
//
// Every item is required. The score is monotone (higher is worse), so a partial sum could only
// understate the disability; a blank item is asked for, never read as 0. Pure: no DOM, no clock.

export const DRS_ITEMS = [
  { key: 'eye', label: 'Eye opening', options: ['Spontaneous', 'To speech or touch', 'To pain', 'None'] },
  { key: 'communication', label: 'Best communication ability', options: ['Oriented', 'Confused', 'Inappropriate', 'Incomprehensible', 'None'] },
  { key: 'motor', label: 'Best motor response', options: ['Obeying', 'Localizing', 'Withdrawing', 'Flexing', 'Extending', 'None'] },
  { key: 'feeding', label: 'Cognitive ability for feeding', options: ['Complete', 'Partial', 'Minimal', 'None'] },
  { key: 'toileting', label: 'Cognitive ability for toileting', options: ['Complete', 'Partial', 'Minimal', 'None'] },
  { key: 'grooming', label: 'Cognitive ability for grooming', options: ['Complete', 'Partial', 'Minimal', 'None'] },
  { key: 'functioning', label: 'Level of functioning', options: ['Completely independent', 'Independent in a special environment', 'Mildly dependent', 'Moderately dependent', 'Markedly dependent', 'Totally dependent'] },
  { key: 'employability', label: 'Employability', options: ['Not restricted', 'Selected jobs, competitive', 'Sheltered workshop, noncompetitive', 'Not employable'] },
];

// The select lists the view and adapter use: value is the item's points as a string. One named
// constant per item, because scripts/lib/option-labels.mjs resolves `'dom-id', CONST` statically.
const opts = (key) => DRS_ITEMS.find((it) => it.key === key).options.map((text, i) => ({ value: String(i), text: `${i}: ${text}` }));
export const DRS_EYE = opts('eye');
export const DRS_COMMUNICATION = opts('communication');
export const DRS_MOTOR = opts('motor');
export const DRS_FEEDING = opts('feeding');
export const DRS_TOILETING = opts('toileting');
export const DRS_GROOMING = opts('grooming');
export const DRS_FUNCTIONING = opts('functioning');
export const DRS_EMPLOYABILITY = opts('employability');

const CATEGORIES = [
  { max: 0, label: 'none' },
  { max: 1, label: 'mild' },
  { max: 3, label: 'partial' },
  { max: 6, label: 'moderate' },
  { max: 11, label: 'moderately severe' },
  { max: 16, label: 'severe' },
  { max: 21, label: 'extremely severe' },
  { max: 24, label: 'vegetative state' },
  { max: 29, label: 'extreme vegetative state' },
];

export function disabilityRatingScale(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const points = {};
  const missing = [];
  for (const it of DRS_ITEMS) {
    const raw = o[it.key];
    const blank = raw === null || raw === undefined || String(raw).trim() === '';
    const n = blank ? NaN : Number(raw);
    if (blank) { missing.push(it.label.toLowerCase()); continue; }
    if (!Number.isInteger(n) || n < 0 || n > it.options.length - 1) {
      return { valid: false, message: `${it.label} must be a whole rating from 0 to ${it.options.length - 1}; the half-point option is no longer recommended.` };
    }
    points[it.key] = n;
  }
  if (missing.length) {
    return { valid: false, message: `Rate every item: ${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} still needed. A blank is not a 0, and a partial total would understate the disability.` };
  }
  const total = Object.values(points).reduce((a, b) => a + b, 0);
  const category = CATEGORIES.find((c) => total <= c.max).label;
  const notes = [
    'The categories were assigned to describe ranges of the total and were not derived statistically; research should use the summed score.',
    'Feeding, toileting and grooming are rated on knowing how and when, not on physical ability, which belongs under level of functioning.',
  ];
  if (total <= 3) notes.push('The DRS is not recommended for mild brain injury: it is insensitive at the low end, where a one-point change matters most.');
  return {
    valid: true,
    abnormal: total > 0,
    total,
    category,
    points,
    band: `DRS ${total} of 29: ${category} disability.`,
    bandLabel: `${total} (${category})`,
    notes,
    note: 'Rappaport M et al, Arch Phys Med Rehabil 1982; item definitions, categories and scoring rules from the Center for Outcome Measurement in Brain Injury (COMBI). '
      + 'A total of 30 is reserved for death. When in doubt between two ratings, COMBI says to give the patient the benefit of the doubt.',
  };
}
