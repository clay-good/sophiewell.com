// spec-v719: Kennedy classification of the partially edentulous arch.
//
// Classifies a partially edentulous arch to guide removable-partial-denture (RPD) design.
// Source:
//   Kennedy E. Partial denture construction. Dental Items of Interest. 1925. Applegate's
//   rules for applying the Kennedy classification (Applegate OC, 1960).
//
// The class is set by the most-posterior edentulous area (Applegate rule 1):
//   Class I   = bilateral edentulous areas located posterior to the remaining natural teeth
//   Class II  = a unilateral edentulous area located posterior to the remaining natural teeth
//   Class III = a unilateral edentulous area with natural teeth both anterior and posterior to it
//   Class IV  = a single edentulous area anterior to (and crossing the midline of) the remaining teeth
//
// Additional edentulous areas are "modification" spaces, numbered by their COUNT (extent is
// ignored). Class IV admits NO modifications (Applegate rule).
//
// Returns the class code and modification number. Pure: no DOM, no clock, no network.

export const KENNEDY_NOTE = 'Kennedy classification of the partially edentulous arch (Kennedy E, 1925; applied with Applegate rules), used to guide removable-partial-denture design. The class is set by the most-posterior edentulous area: Class I is bilateral edentulous areas located behind the remaining natural teeth, Class II is a unilateral edentulous area behind the remaining teeth, Class III is a unilateral edentulous area with natural teeth both in front of and behind it, and Class IV is a single edentulous area in front of and crossing the midline of the remaining teeth. Any additional edentulous areas are modification spaces, numbered by how many there are rather than by their size, and Class IV admits no modifications. It describes the arch to guide denture design and does not by itself prescribe the appliance; it supports rather than replaces the prosthodontic assessment and clinical judgment.';

const CLASS_LABEL = {
  I: 'bilateral edentulous areas posterior to the remaining teeth',
  II: 'unilateral edentulous area posterior to the remaining teeth',
  III: 'unilateral edentulous area bounded by natural teeth',
  IV: 'single anterior edentulous area crossing the midline',
};

function modCount(v) {
  if (v === '' || v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(String(v).trim());
  if (!Number.isInteger(n) || n < 0 || n > 4) return null;
  return n;
}

export function kennedyEdentulous(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const cls = o.primaryClass;
  if (!(cls === 'I' || cls === 'II' || cls === 'III' || cls === 'IV')) {
    return { valid: false, code: 'MISSING_INPUT', field: 'primaryClass', message: 'Select the class-determining (most-posterior) edentulous area.', note: KENNEDY_NOTE };
  }
  const mods = modCount(o.modifications);
  if (mods === null) {
    return { valid: false, code: 'INVALID_INPUT', field: 'modifications', message: 'Modifications must be a whole number 0-4.', note: KENNEDY_NOTE };
  }
  if (cls === 'IV' && mods > 0) {
    return { valid: false, code: 'INVALID_INPUT', field: 'modifications', message: 'Class IV admits no modifications (Applegate rule).', note: KENNEDY_NOTE };
  }

  const modText = mods > 0 ? `, modification ${mods}` : '';
  return {
    valid: true,
    kennedyClass: cls,
    modifications: mods,
    tier: `class-${cls.toLowerCase()}`,
    abnormal: false,
    bandLabel: `Kennedy Class ${cls}${mods > 0 ? ` mod ${mods}` : ''}`,
    band: `Kennedy Class ${cls}${modText} — ${CLASS_LABEL[cls]}.`,
    detail: 'Class set by the most-posterior edentulous area; additional areas are modification spaces numbered by count. Class IV admits no modifications.',
    note: KENNEDY_NOTE,
  };
}
