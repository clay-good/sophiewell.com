// spec-v319: Canadian Cardiovascular Society (CCS) grading of angina pectoris. The
// clinician selects the class (I-IV) from the activity that provokes angina; the tile
// reports the class and its standard definition. The catalog used CCS class 4 only as an
// input flag inside EuroSCORE II (lib/vascular-v105.js) and had no standalone CCS grading
// tile; it is the angina analog of the NYHA functional class and a very widely cited
// severity grade. "ccs angina" / "canadian cardiovascular society" routed to nothing.
//
// HIGH-STAKES: this reports the FUNCTIONAL CLASS the clinician has determined from the
// history, NOT a diagnosis or a treatment order (spec-v11 §5.3).
//
// CRITERIA RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Campeau L. Grading of angina pectoris [letter]. Circulation. 1976;54(3):522-523.
//   - Campeau L. The Canadian Cardiovascular Society grading of angina pectoris revisited
//     30 years later. Can J Cardiol. 2002;18(4):371-379; and the reproduced grade table.
//
// Classes:
//   I   : ordinary activity (walking, climbing stairs) does not cause angina; angina only
//         with strenuous, rapid, or prolonged exertion.
//   II  : slight limitation of ordinary activity; angina on walking/climbing stairs
//         rapidly, uphill, after meals, in cold/wind, under emotional stress, or in the
//         first hours after waking; walking > 2 blocks level or > 1 flight at a normal pace.
//   III : marked limitation of ordinary activity; angina on walking 1-2 blocks level or
//         climbing 1 flight of stairs at a normal pace.
//   IV  : inability to carry on any physical activity without discomfort; angina at rest.

const CLASSES = {
  1: {
    roman: 'I',
    label: 'CCS class I',
    text: 'CCS class I (grade 1) — ordinary physical activity (walking, climbing stairs) does not cause angina; angina occurs only with strenuous, rapid, or prolonged exertion.',
    severe: false,
  },
  2: {
    roman: 'II',
    label: 'CCS class II',
    text: 'CCS class II (grade 2) — slight limitation of ordinary activity; angina on walking or climbing stairs rapidly, walking uphill, after meals, in cold or wind, under emotional stress, or in the first hours after waking; angina on walking > 2 blocks on the level or climbing > 1 flight of stairs at a normal pace.',
    severe: false,
  },
  3: {
    roman: 'III',
    label: 'CCS class III',
    text: 'CCS class III (grade 3) — marked limitation of ordinary physical activity; angina on walking 1 to 2 blocks on the level or climbing 1 flight of stairs at a normal pace.',
    severe: true,
  },
  4: {
    roman: 'IV',
    label: 'CCS class IV',
    text: 'CCS class IV (grade 4) — inability to carry on any physical activity without discomfort; angina may be present at rest.',
    severe: true,
  },
};

const NOTE = 'Canadian Cardiovascular Society (CCS) grading of angina pectoris (Campeau 1976, Circulation). Class I: ordinary activity does not cause angina (only strenuous/rapid/prolonged exertion). Class II: slight limitation — angina on hurrying, uphill, after meals, in cold, under stress, or walking > 2 blocks / > 1 flight at a normal pace. Class III: marked limitation — angina on walking 1-2 blocks or 1 flight at a normal pace. Class IV: angina at rest or with any activity. The analog of the NYHA functional class, for angina. This reports the functional class the clinician has determined from the history, not a diagnosis or a treatment order.';

// input:
//   grade: 1 | 2 | 3 | 4 (also accepts the roman numerals 'I' | 'II' | 'III' | 'IV')
export function ccsAngina(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const raw = String(o.grade == null ? '' : o.grade).trim().toUpperCase();
  const ROMAN = { I: 1, II: 2, III: 3, IV: 4 };
  const n = Object.prototype.hasOwnProperty.call(ROMAN, raw) ? ROMAN[raw] : Number(raw);
  const c = CLASSES[n];
  if (!c) {
    return { valid: false, message: 'Select the CCS angina class (I, II, III, or IV).' };
  }
  return {
    valid: true,
    grade: n,
    class: c.roman,
    severe: c.severe,
    abnormal: c.severe,
    bandLabel: c.label,
    band: c.text,
    note: NOTE,
  };
}
