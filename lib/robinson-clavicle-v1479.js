// spec-v1479: Robinson (Edinburgh) classification of adult clavicle fractures, beside the modified
// Neer classification of the distal third.
//
// Sources, read 2026-09-25:
//   Robinson CM. Fractures of the clavicle in the adult. Epidemiology and classification. J Bone
//     Joint Surg Br. 1998;80(3):476-484 (doi:10.1302/0301-620x.80b3.8079). Abstract: the
//     classification is "based on radiological review of the anatomical site and the extent of
//     displacement, comminution and articular extension"; "Fractures of the medial fifth (type 1),
//     undisplaced diaphyseal fractures (type 2A) and fractures of the outer fifth (type 3A) usually
//     had a benign prognosis. The incidence of complications of union was higher in displaced
//     diaphyseal (type 2B) and displaced outer-fifth (type 3B) fractures. In addition to
//     displacement, the extent of comminution in type-2B fractures was a risk factor for delayed and
//     nonunion."
//   The twelve subtypes as defined in Int J Environ Res Public Health 2022 (PMC9690708), Table 1:
//     1A1 medial, undisplaced, extra-articular; 1A2 medial, undisplaced, intra-articular;
//     1B1 medial, displaced, extra-articular; 1B2 medial, displaced, intra-articular;
//     2A1 midshaft, cortical alignment, undisplaced; 2A2 midshaft, cortical alignment, angulated;
//     2B1 midshaft, displaced, simple or wedge comminuted; 2B2 midshaft, displaced, isolated or
//       comminuted segmental;
//     3A1 lateral, cortical alignment, extra-articular; 3A2 lateral, cortical alignment,
//       intra-articular; 3B1 lateral, displaced, extra-articular; 3B2 lateral, displaced,
//       intra-articular.
//
// Every choice is required: a blank region, displacement or subtype is asked for, never assumed.
// Pure: no DOM, no clock, no network.

export const ROB_REGIONS = [
  { value: '1', text: 'Medial fifth' },
  { value: '2', text: 'Diaphysis (midshaft)' },
  { value: '3', text: 'Lateral (outer) fifth' },
];
export const ROB_DISPLACEMENT = [
  { value: 'A', text: 'Undisplaced, or cortical alignment kept' },
  { value: 'B', text: 'Displaced' },
];
export const ROB_ARTICULAR = [
  { value: '1', text: 'Extra-articular' },
  { value: '2', text: 'Intra-articular' },
];
export const ROB_SHAFT_A = [
  { value: '1', text: 'Undisplaced' },
  { value: '2', text: 'Angulated' },
];
export const ROB_SHAFT_B = [
  { value: '1', text: 'Simple, or wedge comminuted' },
  { value: '2', text: 'Segmental, isolated or comminuted' },
];

const REGION_WORD = { 1: 'medial', 2: 'midshaft', 3: 'lateral' };
const DEFS = {
  '1A1': 'medial, undisplaced, extra-articular',
  '1A2': 'medial, undisplaced, intra-articular',
  '1B1': 'medial, displaced, extra-articular',
  '1B2': 'medial, displaced, intra-articular',
  '2A1': 'midshaft, cortical alignment, undisplaced',
  '2A2': 'midshaft, cortical alignment, angulated',
  '2B1': 'midshaft, displaced, simple or wedge comminuted',
  '2B2': 'midshaft, displaced, isolated or comminuted segmental',
  '3A1': 'lateral, cortical alignment, extra-articular',
  '3A2': 'lateral, cortical alignment, intra-articular',
  '3B1': 'lateral, displaced, extra-articular',
  '3B2': 'lateral, displaced, intra-articular',
};

const has = (list, v) => list.some((x) => x.value === v);

export function robinsonClavicle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const region = has(ROB_REGIONS, o.region) ? o.region : null;
  const disp = has(ROB_DISPLACEMENT, o.displacement) ? o.displacement : null;
  if (!region) return { valid: false, message: 'Choose where the fracture is: the medial fifth, the diaphysis, or the lateral fifth.' };
  if (!disp) return { valid: false, message: 'Choose whether the fracture is displaced.' };

  let sub = null;
  let what;
  if (region === '2') {
    if (disp === 'A') { sub = has(ROB_SHAFT_A, o.shaftAligned) ? o.shaftAligned : null; what = 'whether the aligned shaft fracture is undisplaced or angulated'; }
    else { sub = has(ROB_SHAFT_B, o.shaftDisplaced) ? o.shaftDisplaced : null; what = 'whether the displaced shaft fracture is simple or wedge comminuted, or segmental'; }
  } else {
    sub = has(ROB_ARTICULAR, o.articular) ? o.articular : null;
    what = 'whether the fracture extends into the joint';
  }
  if (!sub) return { valid: false, message: `Choose ${what}.` };

  const code = `${region}${disp}${sub}`;
  const benign = region === '1' || disp === 'A';
  const notes = [
    benign
      ? `Type ${region === '1' ? '1 (the medial fifth)' : `${region}A`} usually had a benign prognosis in the derivation series.`
      : `Displaced ${region === '2' ? 'diaphyseal (2B)' : 'outer-fifth (3B)'} fractures had a higher incidence of complications of union in the derivation series.`,
  ];
  if (code.startsWith('2B')) notes.push('In type 2B, comminution was a risk factor for delayed union and nonunion, in addition to the displacement.');
  if (region === '3') notes.push('The modified Neer classification subdivides distal-third fractures by the coracoclavicular ligaments, which Robinson\'s type 3 does not.');

  return {
    valid: true,
    type: code,
    region: REGION_WORD[region],
    abnormal: !benign,
    band: `Robinson type ${code}: ${DEFS[code]}.`,
    bandLabel: `Type ${code}`,
    notes,
    note: 'Robinson CM, J Bone Joint Surg Br 1998 (1000 consecutive adult clavicle fractures, Edinburgh); subtype definitions as tabulated in Int J Environ Res Public Health 2022. It describes the fracture; the choice of treatment is a clinical decision.',
  };
}
