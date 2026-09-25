// spec-v1447: Coronal Plane Alignment of the Knee (CPAK) phenotype.
//
// Source, read 2026-09-24: MacDessi SJ, Griffiths-Jones W, Harris IA, Bellemans J, Chen DB. Coronal
// Plane Alignment of the Knee (CPAK) classification: a new system for describing knee phenotypes.
// Bone Joint J 2021;103-B(2):329-337 (PMC7954147):
//   "aHKA = MPTA - LDFA"; "A negative aHKA indicates varus, and a positive aHKA indicates valgus";
//   "JLO = MPTA + LDFA"; "A sum of greater than 180 deg indicates an apex proximal joint line, while
//   a sum of less than 180 deg indicates that the joint line is apex distal."
//   "CPAK boundaries for neutral aHKA are 0 deg +/- 2 deg, inclusive ... A varus aHKA is less than
//   -2 deg, while a valgus aHKA is greater than +2 deg. CPAK boundaries for a neutral JLO are 180 deg
//   +/- 3 deg, inclusive ... An apex distal JLO is less than 177 deg, while an apex proximal JLO is
//   greater than 183 deg."
//   The matrix is a figure; the text places Type I (varus, apex distal), II (neutral, apex distal),
//   IV (varus, neutral JLO) and V (neutral, neutral), which fixes the 3 x 3 order (rows apex distal,
//   neutral, apex proximal; columns varus, neutral, valgus) and so types III, VI, VII-IX.
//   Frequency (healthy knees): II 39.2%, I 26.4%, V 15.4%; VII-IX rare. "The aHKA is not affected by
//   joint space narrowing or tibiofemoral subluxation."
//
// Pure: no DOM, no clock, no network.

const TYPES = [
  ['I', 'II', 'III'],
  ['IV', 'V', 'VI'],
  ['VII', 'VIII', 'IX'],
];

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
const r1 = (x) => Math.round(x * 10) / 10;

export function cpak(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  if (isBlank(o.mpta)) missing.push('the medial proximal tibial angle (MPTA)');
  if (isBlank(o.ldfa)) missing.push('the lateral distal femoral angle (LDFA)');
  if (missing.length) return { valid: false, message: `Enter ${missing.join(' and ')}, in degrees.` };
  const mpta = Number(o.mpta);
  const ldfa = Number(o.ldfa);
  if (!Number.isFinite(mpta) || !Number.isFinite(ldfa)) return { valid: false, message: 'Enter both angles as numbers of degrees.' };
  // Transcription check, not a clinical range: these angles sit near 87 deg; 60-120 catches a typo.
  for (const [label, v] of [['MPTA', mpta], ['LDFA', ldfa]]) {
    if (v < 60 || v > 120) return { valid: false, message: `${label} must be between 60 and 120 degrees. Check the measurement.` };
  }
  const ahka = r1(mpta - ldfa);
  const jlo = r1(mpta + ldfa);
  const col = ahka < -2 ? 0 : ahka > 2 ? 2 : 1;
  const row = jlo < 177 ? 0 : jlo > 183 ? 2 : 1;
  const type = TYPES[row][col];
  const alignment = ['varus', 'neutral', 'valgus'][col];
  const joint = ['apex distal', 'neutral', 'apex proximal'][row];
  return {
    valid: true,
    abnormal: false,
    type,
    ahka,
    jlo,
    band: `CPAK type ${type}: ${alignment} arithmetic HKA (${ahka > 0 ? '+' : ''}${ahka} deg) and ${joint} joint line (JLO ${jlo} deg).`,
    bandLabel: `Type ${type}`,
    notes: [
      'A phenotype, not a diagnosis: it describes constitutional coronal alignment, commonly used in planning knee arthroplasty.',
      'The arithmetic HKA uses angles that do not cross the joint, so joint space narrowing and subluxation do not change it; an extra-articular deformity still can.',
    ],
    note: 'MacDessi SJ et al, Bone Joint J 2021: aHKA = MPTA - LDFA (neutral 0 +/- 2 deg inclusive); JLO = MPTA + LDFA (neutral 180 +/- 3 deg inclusive).',
  };
}
