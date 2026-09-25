// spec-v1422: Lawrence and Botte zones of proximal fifth metatarsal fractures, with the Torg
// subtypes of zone 3.
//
// Sources, read 2026-09-24:
//   Lawrence SJ, Botte MJ. Jones' fractures and related fractures of the proximal fifth
//     metatarsal. Foot Ankle 1993;14(6):358-365 (PubMed 8406253) -- the original three zones.
//   Torg JS, Balduini FC, Zelko RR, Pavlov H, Peff TC, Das M. Fractures of the base of the fifth
//     metatarsal distal to the tuberosity. J Bone Joint Surg Am 1984;66(2):209-214 (PubMed
//     6693447) -- the subtypes the scheme borrows for zone 3.
//   Caruso B, Chin K. Classifications in Brief: Lawrence and Botte Classification of Fifth
//     Metatarsal Fractures. Clin Orthop Relat Res 2025;483(7):1260-1263 (PMC12190035):
//       Zone 1 "tuberosity avulsion fractures", "near the insertion of the peroneus brevis tendon";
//         93% of injuries (Bowes and Buckley)
//       Zone 2 "Jones fractures of the metaphyseal-diaphyseal region"; 4%
//       Zone 3 "diaphyseal stress fractures"; 3%, subtyped by Torg:
//         Type I (acute) "a narrow fracture line without fibrosis"
//         Type II (delayed union) "a widened fracture line with intramedullary sclerosis"
//         Type III (symptomatic nonunion) "complete obliteration of the medullary canal attributed
//           to sclerotic bone formation"
//     The original gives "excellent healing potential," "good healing potential," and "variable
//     healing potential" for zones 1, 2 and 3. Interrater kappa 0.537 (Michalski 2022) and 0.66
//     (Noori 2022); merging zones 2 and 3 raised it to 0.705 and 0.83. The review says the
//     classification "should not be used" to standardize treatment or research.
//
// The zone is read from where the fracture sits; in zone 3 the Torg subtype comes from the
// fracture line and the medullary canal. Pure: no DOM, no clock, no network.

export const LB5_LOCATION = [
  { value: 'tuberosity', text: 'Tuberosity (avulsion near the peroneus brevis insertion)' },
  { value: 'metadiaphyseal', text: 'Metaphyseal-diaphyseal junction' },
  { value: 'diaphyseal', text: 'Proximal diaphysis (stress fracture)' },
];
export const LB5_TORG = [
  { value: 'acute', text: 'Narrow fracture line without fibrosis' },
  { value: 'delayed', text: 'Widened fracture line with intramedullary sclerosis' },
  { value: 'nonunion', text: 'Medullary canal obliterated by sclerotic bone' },
];

const ZONE = { tuberosity: 1, metadiaphyseal: 2, diaphyseal: 3 };
const WORDS = {
  1: 'tuberosity avulsion fracture',
  2: 'Jones fracture of the metaphyseal-diaphyseal junction',
  3: 'diaphyseal stress fracture',
};
const HEALING = { 1: 'excellent', 2: 'good', 3: 'variable' };
const SHARE = { 1: '93%', 2: '4%', 3: '3%' };
const TORG = {
  acute: { type: 'I', words: 'acute' },
  delayed: { type: 'II', words: 'delayed union' },
  nonunion: { type: 'III', words: 'symptomatic nonunion' },
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function lawrenceBotte5thMt(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const location = pick(LB5_LOCATION, o.location);
  const torg = pick(LB5_TORG, o.torg);
  if (!location) return { valid: false, message: 'Choose where on the proximal fifth metatarsal the fracture is.' };
  const zone = ZONE[location];
  if (zone === 3 && !torg) {
    return { valid: false, message: 'Choose how the fracture line and medullary canal look: in zone 3 that sets the Torg type.' };
  }

  const notes = [];
  if (zone !== 3 && torg) {
    notes.push('The Torg type is part of this classification only for zone 3 stress fractures, so the fracture-line entry was not used.');
  }
  notes.push(`Zone ${zone} is about ${SHARE[zone]} of proximal fifth metatarsal fractures; the original paper gave it ${HEALING[zone]} healing potential.`);
  if (zone !== 1) {
    notes.push('Zones 2 and 3 are the hard pair to tell apart: interrater kappa was 0.537 and 0.66 for the three zones, and 0.705 and 0.83 when zones 2 and 3 were merged.');
  } else {
    notes.push('Interrater agreement for the three zones was weak to moderate (kappa 0.537 and 0.66).');
  }

  const t = zone === 3 ? TORG[torg] : null;
  const band = t
    ? `Lawrence and Botte zone 3, Torg type ${t.type}: ${WORDS[3]}, ${t.words}.`
    : `Lawrence and Botte zone ${zone}: ${WORDS[zone]}.`;

  return {
    valid: true,
    abnormal: true,
    zone,
    torgType: t ? t.type : null,
    band,
    bandLabel: t ? `Zone 3, Torg ${t.type}` : `Zone ${zone}`,
    notes,
    note: 'Lawrence SJ and Botte MJ, Foot Ankle 1993; zone 3 subtypes from Torg JS et al, J Bone Joint Surg Am 1984; as described by Caruso B and Chin K, Clin Orthop Relat Res 2025. '
      + 'The zone describes the fracture; it does not choose the treatment, and the review advises against relying on it to standardize care.',
  };
}
