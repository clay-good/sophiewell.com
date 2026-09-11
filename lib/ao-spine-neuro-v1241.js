// spec-v1241: the neurological status and the grading vocabulary that the AO Spine thoracolumbar and
// subaxial cervical classifications share, written once.
//
// Both classifications describe an injury as a morphology code plus a neurological status plus
// case-specific modifiers, and both use the SAME neurology letters N0-N4 and NX with the same
// meanings. spec-v1201's lesson -- one rule written twice always drifts -- applies literally here:
// the two tiles are built in the same wave by the same hand, which is exactly when the second copy
// looks harmless.
//
// Sources:
//   Vaccaro AR, Oner C, Kepler CK, et al. AOSpine thoracolumbar spine injury classification system:
//   fracture description, neurological status, and key modifiers. Spine. 2013;38(23):2028-2037.
//   PMID 23970107.
//   Vaccaro AR, Koerner JD, Radcliff KE, et al. AOSpine subaxial cervical spine injury classification
//   system. Eur Spine J. 2016;25(7):2173-2184. PMID 25716661.
//
// NX IS NOT "NO DEFICIT". It means the patient cannot be examined -- intubated, sedated, head
// injured -- and in the thoracolumbar score it is worth 3 points, more than a persistent radicular
// symptom and less than a cord injury, because an unexaminable patient is not a reassuring one. A
// tool that let NX fall through to N0 would turn "we do not know" into "they are fine".
//
// Pure: no DOM, no clock, no network.

export const AO_NEURO = [
  { value: 'N0', text: 'N0 - neurologically intact', points: 0, deficit: false },
  { value: 'N1', text: 'N1 - transient neurological deficit, now resolved', points: 1, deficit: false },
  { value: 'N2', text: 'N2 - radicular symptoms that persist', points: 2, deficit: true },
  { value: 'N3', text: 'N3 - incomplete spinal cord or cauda equina injury', points: 4, deficit: true },
  { value: 'N4', text: 'N4 - complete spinal cord injury', points: 4, deficit: true },
  { value: 'NX', text: 'NX - cannot be examined (intubated, sedated, or head injured)', points: 3, deficit: false },
];

const NEURO_BY_VALUE = new Map(AO_NEURO.map((n) => [n.value, n]));

export function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

// Case-insensitive because a reader typing the code by hand writes `n3` as often as `N3`, and an
// agent passes whatever its own source printed.
export function parseNeuro(v) {
  return NEURO_BY_VALUE.get(String(v).trim().toUpperCase()) || null;
}

export const NEURO_UNEXAMINABLE_NOTE = 'NX records that the patient could not be examined, not that the examination was normal. In the thoracolumbar score it carries more weight than a persistent radicular symptom, because an unexaminable patient is not a reassuring one.';

// A code is a description, and a description of an injury is not a plan. Both tiles say this, and
// they say it in the same words on purpose.
export const AO_POSTURE_NOTE = 'The code describes the injury. It is not a treatment decision, it does not replace the imaging it was read from, and it says nothing about timing.';
