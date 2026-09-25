// spec-v1421: Johnson and Strom staging of adult-acquired flatfoot deformity (posterior tibial
// tendon dysfunction), with the Myerson stage IV.
//
// Sources, read 2026-09-24:
//   Johnson KA, Strom DE. Tibialis posterior tendon dysfunction. Clin Orthop Relat Res
//     1989;(239):196-206 (PubMed 2912622) -- the original three stages.
//   Myerson MS. Adult acquired flatfoot deformity: treatment of dysfunction of the posterior tibial
//     tendon. Instr Course Lect 1997;46:393-405 (PubMed 9143981) -- stage IV A/B.
//   Abousayed MM, Tartaglione JP, Rosenbaum AJ, Dipreta JA. Classifications in Brief: Johnson and
//     Strom Classification of Adult-acquired Flatfoot Deformity. Clin Orthop Relat Res
//     2016;474(2):588-593 (PMC4709320). Its Table 1, stage I / II / III:
//       Heel-rise test      "Mild weakness" / "Marked weakness" / "Marked weakness"
//       "Too many toes"     "Absent" / "Present" / "Present"
//       Deformity           "Absent" / "Present (flexible)" / "Present (fixed)"
//       Pathologic features "Normal tendon length, paratendinitis" / "Elongated with longitudinal
//                           tears" / "Disrupted with visible tears"
//       Images              "No changes" / "Gross deformity" / "Deformity and diffuse arthritic
//                           changes"
//     Text: stage III adds "degenerative arthritic changes in the subtalar, talonavicular, and
//     calcaneocuboid joints"; Johnson and Strom "alluded to a possible Stage IV in which the fixed
//     valgus deformity of the hindfoot results in lateral talar tilt in the ankle mortise"; Myerson
//     "described valgus deformity of the ankle associated with deltoid ligament insufficiency" and
//     subdivided it into "type A with flexible ankle deformity" and "type B with fixed deformity".
//     "the validity and reliability of the Johnson and Strom classification have not been studied";
//     it misses "the spring ligament, deltoid ligament, naviculocuneiform joint, and
//     tarsometatarsal joints"; deformities "do not necessarily progress in a linear or inevitable
//     way".
//
// The stage is DERIVED: ankle valgus makes stage IV (A flexible, B fixed); otherwise the hindfoot
// deformity (absent, flexible, fixed) makes I, II or III, the row Table 1 separates on. The
// heel-rise test, "too many toes" sign and arthritic change, when entered, are checked against the
// row and any disagreement is reported. Pure: no DOM, no clock, no network.

export const JSF_DEFORMITY = [
  { value: 'absent', text: 'None, normal alignment' },
  { value: 'flexible', text: 'Present and flexible (correctable)' },
  { value: 'fixed', text: 'Present and fixed' },
];
export const JSF_ANKLE = [
  { value: 'none', text: 'No ankle valgus' },
  { value: 'flexible', text: 'Valgus with deltoid insufficiency, flexible' },
  { value: 'fixed', text: 'Valgus with deltoid insufficiency, fixed' },
];
export const JSF_HEELRISE = [
  { value: 'mild', text: 'Mild weakness' },
  { value: 'marked', text: 'Marked weakness' },
];
export const JSF_TOES = [
  { value: 'absent', text: 'Absent' },
  { value: 'present', text: 'Present' },
];
export const JSF_ARTHRITIS = [
  { value: 'none', text: 'No arthritic change' },
  { value: 'present', text: 'Arthritic change in the hindfoot joints' },
];

// Table 1, the columns this tool checks.
const ROW = {
  I: { heelRise: 'mild', toes: 'absent', arthritis: 'none' },
  II: { heelRise: 'marked', toes: 'present', arthritis: 'none' },
  III: { heelRise: 'marked', toes: 'present', arthritis: 'present' },
};
const WORDS = {
  I: 'tenderness and swelling along the posterior tibial tendon with normal tendon length and no deformity',
  II: 'an elongated posterior tibial tendon with a flexible flatfoot deformity',
  III: 'a disrupted posterior tibial tendon with a fixed flatfoot deformity',
  IVA: 'valgus of the ankle with deltoid ligament insufficiency, still flexible',
  IVB: 'valgus of the ankle with deltoid ligament insufficiency, fixed',
};
const TEXT = {
  heelRise: { mild: 'mild', marked: 'marked' },
  toes: { absent: 'absent', present: 'present' },
  arthritis: { none: 'no arthritic change', present: 'arthritic change' },
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function johnsonStromFlatfoot(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const deformity = pick(JSF_DEFORMITY, o.deformity);
  const ankle = pick(JSF_ANKLE, o.ankle);
  const heelRise = pick(JSF_HEELRISE, o.heelRise);
  const toes = pick(JSF_TOES, o.toes);
  const arthritis = pick(JSF_ARTHRITIS, o.arthritis);

  if (!deformity) return { valid: false, message: 'Choose whether there is a hindfoot deformity and whether it is flexible or fixed.' };
  if (!ankle) return { valid: false, message: 'Say whether the ankle is in valgus: that is what makes stage IV.' };

  let stage;
  if (ankle !== 'none') stage = ankle === 'flexible' ? 'IVA' : 'IVB';
  else stage = deformity === 'absent' ? 'I' : deformity === 'flexible' ? 'II' : 'III';

  const discord = [];
  const row = ROW[stage];
  if (row) {
    if (heelRise && heelRise !== row.heelRise) discord.push(`the heel-rise weakness is ${TEXT.heelRise[heelRise]} (the table has ${TEXT.heelRise[row.heelRise]})`);
    if (toes && toes !== row.toes) discord.push(`the "too many toes" sign is ${TEXT.toes[toes]} (the table has ${TEXT.toes[row.toes]})`);
    if (arthritis && arthritis !== row.arthritis) discord.push(`the films show ${TEXT.arthritis[arthritis]} (the table has ${TEXT.arthritis[row.arthritis]})`);
  } else if (deformity !== 'fixed') {
    discord.push('Johnson and Strom described stage IV as a fixed hindfoot valgus tilting the talus in the ankle mortise, and the hindfoot here is not fixed');
  }

  const notes = [];
  if (discord.length) {
    notes.push(`Not a clean fit for stage ${stage}: ${discord.join('; ')}. The deformity sets the stage here; recheck the examination and films, and read the stage as approximate.`);
  }
  notes.push('The reliability and validity of this staging have not been studied, and deformity does not always progress stage by stage.');
  notes.push('It centers on the posterior tibial tendon and leaves out the spring and deltoid ligaments, the naviculocuneiform and tarsometatarsal joints; later systems (Bluman 2007, Raikin 2012) subdivide the stages and are not covered here.');

  return {
    valid: true,
    abnormal: stage !== 'I',
    stage,
    band: `Johnson and Strom stage ${stage}: ${WORDS[stage]}.`,
    bandLabel: `Stage ${stage}`,
    concordant: discord.length === 0,
    notes,
    note: 'Johnson KA and Strom DE, Clin Orthop Relat Res 1989 (stages I to III); stage IV A and B from Myerson MS, Instr Course Lect 1997; criteria as tabulated by Abousayed MM et al, Clin Orthop Relat Res 2016 (Table 1). '
      + 'The stage describes the deformity; it does not choose the treatment.',
  };
}
