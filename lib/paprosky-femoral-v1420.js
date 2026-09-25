// spec-v1420: Paprosky classification of femoral bone loss before revision hip arthroplasty.
//
// Sources, read 2026-09-24:
//   Aribindi R, Barba M, Solomon MI, Arp P, Paprosky W. Bypass fixation. Orthop Clin North Am
//     1998;29(2):319-329 (PubMed 9553577) -- cited by the review as "the initial paper describing
//     the Paprosky classification".
//   Ibrahim DA, Fernando ND. Classifications In Brief: The Paprosky Classification of Femoral Bone
//     Loss. Clin Orthop Relat Res 2017;475(3):917-921 (PMC5289194). Its Table 1:
//       I     "Minimal metaphyseal bone loss"
//       II    "Extensive metaphyseal bone loss, minimal diaphyseal bone loss"
//       IIIA  "Extensive metaphyseal and diaphyseal bone loss, >= 4 cm intact diaphyseal bone"
//       IIIB  "Extensive metaphyseal and diaphyseal bone loss, < 4 cm intact diaphyseal bone"
//       IV    "Extensive metaphyseal and diaphyseal bone loss, nonsupportive isthmus"
//     Text: in type I "the proximal femoral geometry is maintained"; in type II "the entirety of the
//     diaphysis remains intact"; IIIA vs IIIB is whether "4 cm or greater diaphyseal 'scratch-fit'"
//     is possible; type IV typically has "severe ectasia" of the canal. Reliability: interobserver
//     kappa 0.61 (Brown 2014), 0.63 to 0.80 (Parry), 0.42 (Gozzard 2003), 0.12 to 0.29 (Haddad); bone loss was
//     "underestimated in 12% of hips" (Gozzard); "the final categorization of femoral bone loss
//     occurs at the intraoperative setting".
//
// The type is DERIVED from the metaphysis, the diaphysis, the isthmus and the length of intact
// diaphysis. A combination that is not a row of Table 1 is reported as such, not forced into one.
// Pure: no DOM, no clock, no network.

export const PPF_METAPHYSIS = [
  { value: 'minimal', text: 'Minimal bone loss, proximal geometry kept' },
  { value: 'extensive', text: 'Extensive bone loss, not supportive' },
];
export const PPF_DIAPHYSIS = [
  { value: 'minimal', text: 'Minimal bone loss, diaphysis intact' },
  { value: 'extensive', text: 'Extensive bone loss' },
];
export const PPF_ISTHMUS = [
  { value: 'supportive', text: 'Supportive' },
  { value: 'nonsupportive', text: 'Nonsupportive (for example, severe ectasia)' },
];
export const PPF_INTACT = [
  { value: 'ge4', text: '4 cm or more' },
  { value: 'lt4', text: 'Less than 4 cm' },
];

const WORDS = {
  I: 'minimal metaphyseal bone loss; the proximal femoral geometry is maintained',
  II: 'extensive metaphyseal bone loss with minimal diaphyseal bone loss; the diaphysis is intact',
  IIIA: 'extensive metaphyseal and diaphyseal bone loss with 4 cm or more of intact diaphyseal bone for a scratch fit',
  IIIB: 'extensive metaphyseal and diaphyseal bone loss with less than 4 cm of intact diaphyseal bone for a scratch fit',
  IV: 'extensive metaphyseal and diaphyseal bone loss with a nonsupportive isthmus',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

const NOTE = 'Paprosky classification as first described by Aribindi R et al, Orthop Clin North Am 1998; Table 1 of Ibrahim DA and Fernando ND, Clin Orthop Relat Res 2017. '
  + 'The type describes the defect; the choice of stem is a surgical decision.';

function reliability() {
  return [
    'Radiographs can understate the loss (underestimated in 12% of hips in one series); full-length orthogonal femoral films help, and the final type is set at surgery.',
    'Interobserver agreement has ranged from kappa 0.12 to 0.80 across studies, generally higher among experienced arthroplasty surgeons.',
  ];
}

export function paproskyFemoral(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const metaphysis = pick(PPF_METAPHYSIS, o.metaphysis);
  const diaphysis = pick(PPF_DIAPHYSIS, o.diaphysis);
  const isthmus = pick(PPF_ISTHMUS, o.isthmus);
  const intact = pick(PPF_INTACT, o.intact);

  if (!metaphysis) return { valid: false, message: 'Choose how much metaphyseal bone is lost.' };
  if (!diaphysis) return { valid: false, message: 'Choose how much diaphyseal bone is lost.' };

  if (metaphysis === 'minimal' && diaphysis === 'extensive') {
    return {
      valid: true,
      abnormal: true,
      type: null,
      band: 'Does not fit one Paprosky type: every type with extensive diaphyseal loss also has extensive metaphyseal loss. Recheck the films, or describe the defect rather than force a type.',
      bandLabel: 'No single type',
      concordant: false,
      notes: reliability(),
      note: NOTE,
    };
  }

  let type;
  if (metaphysis === 'minimal') type = 'I';
  else if (diaphysis === 'minimal') type = 'II';
  else {
    if (!isthmus) return { valid: false, message: 'Say whether the isthmus is supportive: with extensive diaphyseal loss it separates type III from type IV.' };
    if (isthmus === 'nonsupportive') type = 'IV';
    else {
      if (!intact) return { valid: false, message: 'Choose how much intact diaphysis is left for a scratch fit: 4 cm separates IIIA from IIIB.' };
      type = intact === 'ge4' ? 'IIIA' : 'IIIB';
    }
  }

  const discord = [];
  if ((type === 'I' || type === 'II') && isthmus === 'nonsupportive') {
    discord.push('the isthmus is marked nonsupportive, which the table has only in type IV');
  }
  if (type === 'IV' && intact === 'ge4') {
    discord.push('4 cm or more of intact diaphysis was entered, but a nonsupportive isthmus makes this type IV');
  }

  const notes = [];
  if (discord.length) {
    notes.push(`Not a clean fit for type ${type}: ${discord.join('; ')}. Check the films, and read the type as approximate.`);
  }
  notes.push(...reliability());

  return {
    valid: true,
    abnormal: type !== 'I',
    type,
    band: `Paprosky femoral type ${type}: ${WORDS[type]}.`,
    bandLabel: `Type ${type}`,
    concordant: discord.length === 0,
    notes,
    note: NOTE,
  };
}
