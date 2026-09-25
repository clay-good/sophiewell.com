// spec-v1428: modified Neer classification of distal-third clavicle fractures.
//
// Sources, read 2026-09-24:
//   Neer CS II. Fractures of the distal third of the clavicle. Clin Orthop Relat Res 1968;58:43-50
//     -- the original types, later extended by Neer (types IV and V) and by Craig (type IIB).
//   Stenson J, Baker W. Classifications in Brief: the modified Neer classification for distal-third
//     clavicle fractures. Clin Orthop Relat Res 2021;479(1):205-209 (PMC7899602). Its Description:
//       I   "lateral to the intact coracoclavicular ligaments and spare the acromioclavicular joint"
//       III "also lateral to the coracoclavicular ligaments but the fracture extends into the
//           acromioclavicular joint"; "Types I and III fractures are inherently stable"
//       IIA "occur medially to the trapezoid and conoid ligaments"
//       IIB "the fracture exits between the conoid and trapezoid ligaments. This leaves an attached
//           trapezoid ligament to the lateral fragment and a torn conoid ligament medially."
//           IIA vs IIB "may be difficult to judge on routine images and is not clinically
//           relevant. Both are inherently unstable"
//       IV  "only found in the pediatric population, with periosteal slippage of the proximal
//           fragment at the epiphysis and intact coracoclavicular ligaments at the lateral fragment"
//       V   "a comminuted fracture pattern with an inferior fracture fragment attached to the
//           coracoclavicular ligaments"
//     Reliability: interrater kappa 0.11 to 0.35 (Bishop 2015), 0.344 (Cho 2015), and 3-D CT did not
//     improve it; type II nonunion 21% to 33%, symptomatic nonunion 0% to 34%; the decision to operate
//     turned on stability and the size of the lateral fragment, which the type omits.
//
// The type is DERIVED from where the fracture sits against the coracoclavicular ligaments and
// whether it enters the acromioclavicular joint. Pure: no DOM, no clock, no network.

export const NDC_PATTERN = [
  { value: 'single', text: 'A single main fracture line' },
  { value: 'comminuted', text: 'Comminuted, with an inferior fragment attached to the coracoclavicular ligaments' },
  { value: 'physeal', text: 'Proximal fragment slipped out of its periosteal sleeve at the physis (child)' },
];
export const NDC_LOCATION = [
  { value: 'lateral', text: 'Lateral to both coracoclavicular ligaments (ligaments intact)' },
  { value: 'between', text: 'Between the conoid and trapezoid (conoid torn, trapezoid on the lateral fragment)' },
  { value: 'medial', text: 'Medial to both the conoid and trapezoid ligaments' },
];
export const NDC_AC = [
  { value: 'spared', text: 'Spared' },
  { value: 'extends', text: 'Fracture extends into the joint' },
];
export const NDC_SKELETON = [
  { value: 'immature', text: 'Skeletally immature (open physes)' },
  { value: 'mature', text: 'Skeletally mature' },
];

const TYPES = {
  I: 'lateral to the intact coracoclavicular ligaments, sparing the acromioclavicular joint; described as inherently stable',
  IIA: 'medial to the conoid and trapezoid ligaments; described as inherently unstable',
  IIB: 'between the conoid and trapezoid ligaments, with the conoid torn and the trapezoid still on the lateral fragment; described as inherently unstable',
  III: 'lateral to the coracoclavicular ligaments and extending into the acromioclavicular joint; described as inherently stable',
  IV: 'a pediatric injury: the proximal fragment slips out of its periosteal sleeve at the physis, and the coracoclavicular ligaments stay with the lateral fragment',
  V: 'comminuted, with an inferior fragment still attached to the coracoclavicular ligaments',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function neerDistalClavicle(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const pattern = pick(NDC_PATTERN, o.pattern);
  const location = pick(NDC_LOCATION, o.location);
  const ac = pick(NDC_AC, o.ac);
  const skeleton = pick(NDC_SKELETON, o.skeleton);

  if (!pattern) return { valid: false, message: 'Choose the fracture pattern: single line, comminuted, or a physeal sleeve injury.' };
  if (pattern === 'single' && !location) {
    return { valid: false, message: 'Choose where the fracture sits against the coracoclavicular ligaments.' };
  }
  if (pattern === 'single' && location === 'lateral' && !ac) {
    return { valid: false, message: 'Say whether the fracture extends into the acromioclavicular joint: that separates type I from type III.' };
  }

  let type;
  if (pattern === 'physeal') type = 'IV';
  else if (pattern === 'comminuted') type = 'V';
  else if (location === 'lateral') type = ac === 'extends' ? 'III' : 'I';
  else type = location === 'between' ? 'IIB' : 'IIA';

  const notes = [];
  if (type === 'IV' && skeleton === 'mature') {
    notes.push('Not a clean fit: type IV is described only in children, and the skeleton is recorded as mature. Check the films before relying on the type.');
  }
  if (type.startsWith('II')) {
    if (ac === 'extends') notes.push('The type II descriptions do not address the acromioclavicular joint; its involvement is recorded here as a finding.');
    notes.push('IIA and IIB can be hard to tell apart on routine films, and the review calls the difference not clinically relevant.');
    notes.push('Reported nonunion after type II fractures is 21% to 33%, but symptomatic nonunion ranges from 0% to 34%: a radiographic nonunion is not always a symptomatic one.');
  }
  notes.push('Agreement between surgeons is only fair (interrater kappa 0.11 to 0.35 in one study and 0.344 in another), and adding 3-D CT did not improve it.');
  notes.push('The studies reviewed found the decision to operate turned on the stability of the fracture and the size of the lateral fragment, neither of which the Neer type records.');

  return {
    valid: true,
    abnormal: type !== 'I' && type !== 'III',
    type,
    band: `Modified Neer type ${type}: ${TYPES[type]}.`,
    bandLabel: `Type ${type}`,
    notes,
    note: 'Neer CS, Clin Orthop Relat Res 1968, with Neer\'s types IV and V and Craig\'s type IIB, as described by Stenson J and Baker W, Clin Orthop Relat Res 2021. '
      + 'The review\'s authors judge it insufficiently reliable for clinical or research use; the type does not choose the treatment.',
  };
}
