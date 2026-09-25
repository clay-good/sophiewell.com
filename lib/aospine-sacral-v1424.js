// spec-v1424: the AOSpine sacral classification (CT-based), with its neurologic and case-specific
// modifiers.
//
// Sources, read 2026-09-24:
//   Vaccaro AR, Schroeder GD, Divi SN, et al. Description and reliability of the AOSpine sacral
//     classification system. J Bone Joint Surg Am 2020;102(16):1454-1463 (PubMed 32816418) -- the
//     original.
//   Camino-Willhuber G, Urrutia J. Classifications in brief: the AOSpine sacral classification
//     system. Clin Orthop Relat Res 2022;480(11):2182-2186 (PMC9556097). Its text:
//       Type A "occur below the level of the sacroiliac joints", with "no dissociation of the spine
//         or pelvis";
//       Type B "unilateral, vertical fractures; the ipsilateral facet is attached to the medial
//         aspect of the sacrum", "B1 medial to the foramen, B2 transalar lateral to the foramen, and
//         B3 through the foramen";
//       Type C "affect the L5 to S1 facet compromising spinopelvic stability, implying some level of
//         dissociation of the spine from the pelvis";
//       modifiers M1 soft tissue injury, M2 metabolic bone disease, M3 anterior pelvic-ring injury,
//         M4 sacroiliac joint injury; N0 intact, N1 transient deficit, N2 nontransient nerve-root
//         injury (usually L5 or S1), N3 cauda equina injury.
//     Its Figs. 1-3 (AO Foundation) label the subtypes:
//       A1 "Coccygeal or compression vs ligamentous avulsion fractures"
//       A2 "Non-displaced transverse fractures below the S-I joint"
//       A3 "Displaced transverse fractures below the S-I joint"
//       B1 "Central Fracture - involves spinal canal"; B2 "Transalar Fracture - does not involve
//         foramina or spinal canal"; B3 "Transforaminal Fracture - involves foramina but not spinal canal"
//       C0 "Nondisplaced sacral U-type variant"; C1 "Sacral U-type variant without posterior pelvic
//         instability"; C2 "Bilateral complete Type B injuries without transverse fracture";
//         C3 "Displaced U-type sacral fracture".
//     Reliability: main type interobserver kappa 0.75 (developers) and 0.68 (independent); subtype
//     0.58 in both, 0.51 to 0.52 (spine and pelvic surgeons), 0.57 in a 150-patient study. The review recommends the system "should not be
//     used for ascertaining the subtype"; the modifiers "have not been subjected to a reliability
//     assessment"; displacement (A2 vs A3, C0 vs C3) has no stated threshold.
//
// The TYPE is derived from where the fracture runs; the subtype from the pattern of the matching
// type. C0 and C1 have no finding in the source that separates them beyond their figure labels, so
// the C patterns are offered as those labels. Pure: no DOM, no clock, no network.

export const AOSAC_REGION = [
  { value: 'below', text: 'Below the sacroiliac joints (spine and pelvis not dissociated)' },
  { value: 'unilateral', text: 'Unilateral vertical fracture (posterior ring affected, spinopelvic stability kept)' },
  { value: 'spinopelvic', text: 'Spinopelvic injury (L5-S1 facet affected, spine partly dissociated from the pelvis)' },
];
export const AOSAC_A = [
  { value: 'coccygeal', text: 'Coccygeal or compression fracture, or ligamentous avulsion' },
  { value: 'nondisplaced', text: 'Nondisplaced transverse fracture below the sacroiliac joint' },
  { value: 'displaced', text: 'Displaced transverse fracture below the sacroiliac joint' },
];
export const AOSAC_B = [
  { value: 'canal', text: 'Central: involves the spinal canal' },
  { value: 'alar', text: 'Transalar: spares the foramina and the spinal canal' },
  { value: 'foraminal', text: 'Transforaminal: involves the foramina but not the spinal canal' },
];
export const AOSAC_C = [
  { value: 'u-nondisplaced', text: 'Nondisplaced sacral U-type variant' },
  { value: 'u-stable', text: 'Sacral U-type variant without posterior pelvic instability' },
  { value: 'bilateral-b', text: 'Bilateral complete type B injuries without a transverse fracture' },
  { value: 'u-displaced', text: 'Displaced U-type sacral fracture' },
];
export const AOSAC_NEURO = [
  { value: 'N0', text: 'N0: neurologically intact' },
  { value: 'N1', text: 'N1: transient neurologic deficit' },
  { value: 'N2', text: 'N2: lasting nerve-root injury (usually L5 or S1)' },
  { value: 'N3', text: 'N3: cauda equina injury' },
];
export const AOSAC_MODIFIERS = [
  { key: 'm1', code: 'M1', label: 'M1: substantial soft tissue injury' },
  { key: 'm2', code: 'M2', label: 'M2: metabolic bone disease' },
  { key: 'm3', code: 'M3', label: 'M3: anterior pelvic-ring injury' },
  { key: 'm4', code: 'M4', label: 'M4: sacroiliac joint injury' },
];

const TYPE = {
  below: { type: 'A', words: 'lower sacrococcygeal injury', whole: 'below the sacroiliac joints' },
  unilateral: { type: 'B', words: 'posterior pelvic injury', whole: 'a unilateral vertical fracture' },
  spinopelvic: { type: 'C', words: 'spinopelvic injury', whole: 'the L5-S1 facet affected and the spine partly dissociated from the pelvis' },
};
const SUB_WORDS = {
  A1: 'a coccygeal or compression fracture, or a ligamentous avulsion',
  A2: 'a nondisplaced transverse fracture below the sacroiliac joint',
  A3: 'a displaced transverse fracture below the sacroiliac joint',
  B1: 'a central fracture involving the spinal canal',
  B2: 'a transalar fracture sparing the foramina and the spinal canal',
  B3: 'a transforaminal fracture involving the foramina but not the spinal canal',
  C0: 'a nondisplaced sacral U-type variant',
  C1: 'a sacral U-type variant without posterior pelvic instability',
  C2: 'bilateral complete type B injuries without a transverse fracture',
  C3: 'a displaced U-type sacral fracture',
};
const SUB = {
  below: { list: AOSAC_A, arg: 'aPattern', codes: { coccygeal: 'A1', nondisplaced: 'A2', displaced: 'A3' } },
  unilateral: { list: AOSAC_B, arg: 'bLine', codes: { canal: 'B1', alar: 'B2', foraminal: 'B3' } },
  spinopelvic: { list: AOSAC_C, arg: 'cPattern', codes: { 'u-nondisplaced': 'C0', 'u-stable': 'C1', 'bilateral-b': 'C2', 'u-displaced': 'C3' } },
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const on = (v) => v === true || v === 'true' || v === 'yes' || v === 1 || v === '1';

export function aospineSacral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = pick(AOSAC_REGION, o.region);
  if (!region) return { valid: false, message: 'Choose where the fracture runs: below the sacroiliac joints, unilateral vertical, or spinopelvic.' };

  const { type, words, whole } = TYPE[region];
  const sub = SUB[region];
  const pattern = pick(sub.list, o[sub.arg]);
  const subtype = pattern ? sub.codes[pattern] : null;
  const neuro = pick(AOSAC_NEURO, o.neuro);
  const mods = AOSAC_MODIFIERS.filter((m) => on(o[m.key])).map((m) => m.code);

  const code = [subtype || type, neuro, ...mods].filter(Boolean).join(' ');
  const band = subtype
    ? `AOSpine sacral ${code}: ${words}, ${SUB_WORDS[subtype]}.`
    : `AOSpine sacral type ${code}: ${words}, ${whole}. No subtype entered; choose one to refine the type.`;

  const notes = [];
  if (type !== 'A') notes.push('The review describes types B and C as potentially unstable; type A does not affect the weight-bearing area, the pelvic ring or spinopelvic stability.');
  if (subtype === 'A2' || subtype === 'A3' || subtype === 'C0' || subtype === 'C3') {
    notes.push('The classification sets no threshold for displacement, so A2 and A3, and C0 and C3, are told apart by judgment.');
  }
  if (type !== 'A') notes.push('The review notes it is unclear whether a unilateral alar fracture with a transverse fracture is type B or type C.');
  if (!neuro) notes.push('Neurologic status not entered; no N modifier is shown.');
  if (neuro || mods.length) notes.push('The N and M modifiers have not been tested for reliability.');
  notes.push('The main type (A, B or C) is the reliable part: interobserver kappa 0.68 to 0.75. Subtype agreement was 0.51 to 0.58 in independent studies, and the review recommends against using the system to decide the subtype.');

  return {
    valid: true,
    abnormal: true,
    type,
    subtype,
    code,
    band,
    bandLabel: subtype || `Type ${type}`,
    notes,
    note: 'Vaccaro AR et al, J Bone Joint Surg Am 2020; definitions as given by Camino-Willhuber G and Urrutia J, Clin Orthop Relat Res 2022, from CT. '
      + 'The class describes the injury; it does not choose the treatment.',
  };
}
