// spec-v1241: the AO Spine Subaxial Cervical Spine Injury Classification -- the code, and the reason
// this tile does not print a total.
//
// Sources:
//   Vaccaro AR, Koerner JD, Radcliff KE, et al. AOSpine subaxial cervical spine injury classification
//   system. Eur Spine J. 2016;25(7):2173-2184. PMID 25716661 -- the classification.
//   Schroeder GD, Canseco JA, Patel PD, et al. Establishing the Injury Severity of Subaxial Cervical
//   Spine Trauma: Validating the Hierarchical Nature of the AO Spine Subaxial Cervical Spine Injury
//   Classification System. Spine. 2021;46(10):649-657. PMID 33337687 -- the severity weights.
//
// WHY THERE IS NO TOTAL HERE AND THERE IS ONE ON THE THORACOLUMBAR TILE. Schroeder 2021 published a
// severity value for every subtype, but they are PERCEIVED SEVERITY on a 0 to 100 scale, one per
// subtype, from a survey of surgeons -- not addends. The thoracolumbar side has a genuine additive
// score (TL AOSIS, Kepler 2016) with published treatment bands; this side does not. Summing the
// 0-100 weights would produce a number with no denominator, no validation and no threshold, which a
// reader would quite reasonably treat as a score. So this tile assembles the CODE, reports the
// severity weight of each component as the single most severe component rather than a sum, and says
// what it is not.
//
// THE FACET INJURY IS A SEPARATE AXIS. F1 to F4 describe the facet, and the code carries both: an
// A0 morphology with an F4 facet is a dislocated facet on an otherwise intact vertebral body, which
// is not a mild injury and does not read as one in an "A0" alone.
//
// SLIC is in this catalog and is a different system. It sums three components to a number with a
// surgical threshold of 5; this classification is descriptive. Neither converts into the other.
//
// Pure: no DOM, no clock, no network.

import { AO_NEURO, parseNeuro, isBlank, NEURO_UNEXAMINABLE_NOTE, AO_POSTURE_NOTE } from './ao-spine-neuro-v1241.js';

export { AO_NEURO };

export const AO_SUBAXIAL_NOTE = 'The AO Spine subaxial cervical classification (Vaccaro 2016) describes an injury as a morphology type, a facet injury type, a neurological status, and case-specific modifiers, and the code is read as a whole. It deliberately prints no total: the severity values published for it (Schroeder 2021) are perceived-severity weights on a 0 to 100 scale, one per subtype, and adding them would make a number with no denominator and no threshold. SLIC, also in this catalog, is the system that does sum to a number.';

// Schroeder 2021, Table 2 -- perceived severity, 0 to 100, per subtype. Not addends.
export const AO_SUBAXIAL_MORPHOLOGY = [
  { value: 'A0', text: 'A0 - no bony injury, or a minor fracture that does not affect stability', severity: 5 },
  { value: 'A1', text: 'A1 - compression of one endplate, posterior wall intact', severity: 20 },
  { value: 'A2', text: 'A2 - coronal split or pincer fracture through both endplates, posterior wall intact', severity: 30 },
  { value: 'A3', text: 'A3 - incomplete burst: one endplate, with the posterior wall involved', severity: 50 },
  { value: 'A4', text: 'A4 - complete burst or sagittal split involving both endplates', severity: 60 },
  { value: 'B1', text: 'B1 - posterior tension band injury through bone only', severity: 60 },
  { value: 'B2', text: 'B2 - posterior capsuloligamentous or bony tension band disruption', severity: 80 },
  { value: 'B3', text: 'B3 - anterior tension band injury, posterior hinge intact', severity: 80 },
  { value: 'C', text: 'C - translation of one vertebral body on another in any direction', severity: 100 },
];

export const AO_SUBAXIAL_FACET = [
  { value: 'F0', text: 'F0 - no facet injury', severity: 0 },
  { value: 'F1', text: 'F1 - non-displaced facet fracture, fragment under 1 cm and under 40% of the lateral mass', severity: 20 },
  { value: 'F2', text: 'F2 - facet fracture over 1 cm, or over 40% of the lateral mass, or displaced', severity: 40 },
  { value: 'F3', text: 'F3 - floating lateral mass: pedicle and lamina both disrupted', severity: 50 },
  { value: 'F4', text: 'F4 - pathologic subluxation, or a perched or dislocated facet', severity: 100 },
];

export const AO_SUBAXIAL_MODIFIERS = [
  { key: 'm1', code: 'M1', severity: 40, label: 'M1 - posterior capsuloligamentous complex injury without complete disruption' },
  { key: 'm2', code: 'M2', severity: 70, label: 'M2 - critical disc herniation' },
  { key: 'm3', code: 'M3', severity: 70, label: 'M3 - stiffening or metabolic bone disease (DISH, ankylosing spondylitis, OPLL, OLF)' },
  { key: 'm4', code: 'M4', severity: 60, label: 'M4 - vertebral artery injury' },
];

const MORPH = new Map(AO_SUBAXIAL_MORPHOLOGY.map((m) => [m.value, m]));
const FACET = new Map(AO_SUBAXIAL_FACET.map((f) => [f.value, f]));

// The option text reads `A3 - incomplete burst...`; the half after the dash is the description, and
// it starts a sentence here.
function sentence(text) {
  const half = text.split(' - ')[1];
  return `${half.charAt(0).toUpperCase()}${half.slice(1)}`;
}

function on(v) {
  return v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';
}

export function aoSpineSubaxial(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  if (isBlank(o.morphology)) {
    return { valid: false, message: 'Choose the morphology type (A0 to A4, B1 to B3, or C).' };
  }
  const morph = MORPH.get(String(o.morphology).trim().toUpperCase());
  if (!morph) {
    return { valid: false, message: 'The morphology type must be one of A0, A1, A2, A3, A4, B1, B2, B3 or C.' };
  }

  if (isBlank(o.neuro)) {
    return { valid: false, message: 'Choose the neurological status (N0 to N4, or NX if the patient cannot be examined). A blank is not an N0.' };
  }
  const neuro = parseNeuro(o.neuro);
  if (!neuro) {
    return { valid: false, message: 'The neurological status must be one of N0, N1, N2, N3, N4 or NX.' };
  }

  // The facet axis may legitimately be "no facet injury", and F0 says so. A blank does not.
  if (isBlank(o.facet)) {
    return { valid: false, message: 'Say what the facets show. F0 records that there is no facet injury; leaving it blank does not, and an F4 facet on an otherwise intact body is a dislocation.' };
  }
  const facet = FACET.get(String(o.facet).trim().toUpperCase());
  if (!facet) {
    return { valid: false, message: 'The facet injury must be one of F0, F1, F2, F3 or F4.' };
  }

  const bilateral = on(o.bilateral) && facet.value !== 'F0';
  const modifiers = AO_SUBAXIAL_MODIFIERS.filter((m) => on(o[m.key]));

  const facetCode = facet.value === 'F0' ? '' : `${facet.value}${bilateral ? 'BL' : ''}`;
  const code = [morph.value, facetCode, neuro.value, ...modifiers.map((m) => m.code)].filter(Boolean).join(' ');

  // The most severe single component, and the component it came from. Reported instead of a sum, and
  // named as a weight rather than a score.
  const components = [
    { what: `morphology ${morph.value}`, severity: morph.severity },
    { what: `facet ${facet.value}`, severity: facet.severity },
    { what: `neurology ${neuro.value}`, severity: neuro.points === 4 ? 100 : null },
    ...modifiers.map((m) => ({ what: `modifier ${m.code}`, severity: m.severity })),
  ].filter((c) => c.severity !== null);
  const worst = components.reduce((a, b) => (b.severity > a.severity ? b : a));

  const facetNote = facet.value === 'F4' && /^A[01]$/.test(morph.value)
    ? 'The vertebral body is barely injured and the facet is dislocated or perched. Reading the morphology letter alone would call this a minor injury; the facet is what this code is about.'
    : null;

  return {
    valid: true,
    code,
    morphology: morph.value,
    facet: facet.value,
    bilateral,
    neuro: neuro.value,
    modifiers: modifiers.map((m) => m.code),
    worstComponent: worst.what,
    worstSeverity: worst.severity,
    abnormal: morph.value === 'C' || facet.value === 'F4' || neuro.deficit === true || neuro.value === 'N3' || neuro.value === 'N4',
    bandLabel: `AO Spine ${code}`,
    band: `AO Spine subaxial cervical ${code}. ${sentence(morph.text)}${facet.value === 'F0' ? ', with no facet injury' : `, with ${facet.text.split(' - ')[1]}${bilateral ? ', bilateral' : ''}`}.`,
    noTotalNote: `This code has no total, on purpose. The published severity values are perceived severity on a 0 to 100 scale, one per subtype, not addends; the most severe single component here is the ${worst.what} at ${worst.severity} of 100.`,
    facetNote,
    neuroNote: neuro.value === 'NX' ? NEURO_UNEXAMINABLE_NOTE : null,
    slicNote: 'SLIC, also in this catalog, is the subaxial system that does sum to a number and carries a surgical threshold. This one is descriptive, and the two do not convert into one another.',
    postureNote: AO_POSTURE_NOTE,
    note: AO_SUBAXIAL_NOTE,
  };
}
