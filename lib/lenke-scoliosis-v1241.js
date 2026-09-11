// spec-v1241: the Lenke classification of adolescent idiopathic scoliosis -- curve type 1 to 6, a
// lumbar spine modifier A/B/C, and a thoracic sagittal modifier.
//
// Sources:
//   Lenke LG, Betz RR, Harms J, Bridwell KH, Clements DH, Lowe TG, Blanke K. Adolescent idiopathic
//   scoliosis: a new classification to determine extent of spinal arthrodesis. J Bone Joint Surg Am.
//   2001;83(8):1169-1181. PMID 11507125.
//   AO Surgery Reference, Lenke classification -- the structural criteria and modifier definitions
//   reproduced below verbatim in substance.
//
// WHAT MAKES THIS A CALCULATION AND NOT A PICKLIST. The type is not read off a film; it is derived
// from which of the three regional curves are STRUCTURAL, and structural is itself derived:
//
//   proximal thoracic      structural if the side-bending Cobb is >= 25 degrees, OR T2-T5 kyphosis is >= +20
//   main thoracic          structural if the side-bending Cobb is >= 25 degrees, OR T10-L2 kyphosis is >= +20
//   thoracolumbar/lumbar   structural if the side-bending Cobb is >= 25 degrees, OR T10-L2 kyphosis is >= +20
//
// The major curve -- the largest standing Cobb -- is structural by definition, whatever it bends to.
//
// THE RUNG THIS IS READ WRONGLY ON: TYPE 3 AGAINST TYPE 6. Both have a structural main thoracic and a
// structural thoracolumbar/lumbar curve with a non-structural proximal thoracic. Type 6 is not simply
// "the lumbar one is bigger": Lenke requires the thoracolumbar/lumbar curve to exceed the main
// thoracic by AT LEAST 5 degrees. A lumbar curve 3 degrees larger than the thoracic is a type 3, and
// reading "whichever is larger" gets that case wrong every time. This tile computes it and prints the
// margin.
//
// A PROXIMAL THORACIC MAJOR CURVE IS NOT CLASSIFIABLE. All six types have their major curve in the
// main thoracic or the thoracolumbar/lumbar region. If the largest curve is the proximal thoracic
// one, Lenke has no type for it, and this says so rather than rounding to the nearest.
//
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const LENKE_NOTE = 'The Lenke classification (Lenke 2001) describes an adolescent idiopathic scoliosis as a curve type 1 to 6, a lumbar spine modifier A, B or C, and a thoracic sagittal modifier. The type follows from which regional curves are structural, and a minor curve is structural when it bends out to 25 degrees or more, or when the region is kyphotic by 20 degrees or more. It describes the curve pattern; it does not prescribe the fusion levels, which is a surgical judgment the classification was built to inform rather than replace.';

export const LENKE_CSVL = [
  { value: 'between-pedicles', text: 'CSVL passes between the pedicles of the lumbar apical vertebra', modifier: 'A' },
  { value: 'touches-apex', text: 'CSVL touches the apical vertebral body or pedicle', modifier: 'B' },
  { value: 'medial-to-apex', text: 'CSVL falls completely medial to the apical body, touching neither', modifier: 'C' },
];

const CSVL_BY_VALUE = new Map(LENKE_CSVL.map((c) => [c.value, c]));

const TYPE_TEXT = {
  1: 'Main Thoracic: the main thoracic curve is the only structural curve',
  2: 'Double Thoracic: the proximal thoracic curve is structural as well, and the main thoracic is the major curve',
  3: 'Double Major: the main thoracic and the thoracolumbar/lumbar curves are both structural, with the main thoracic the major curve',
  4: 'Triple Major: all three curves are structural',
  5: 'Thoracolumbar/Lumbar: the thoracolumbar/lumbar curve is the only structural curve',
  6: 'Thoracolumbar/Lumbar-Main Thoracic: the thoracolumbar/lumbar curve is the major curve and exceeds a structural main thoracic by at least 5 degrees',
};

// The two published thresholds, named once each.
const BEND_STRUCTURAL = 25;
const KYPHOSIS_STRUCTURAL = 20;
const TYPE6_MARGIN = 5;

function num(v) {
  return typeof v === 'number' ? v : Number(String(v).trim());
}

// `inputFault` tests `raw === ''` before it trims, and `Number('')` is 0 -- so a field holding only
// spaces reaches it as a legitimate zero rather than as a blank. That is the whitespace trap
// spec-v1155 found in `optNum` across 64 view modules, in the shared guard this time. Normalizing
// here keeps this tile right without changing a helper 100-odd other tiles call; the helper itself is
// worth a wave of its own.
function blankIfEmpty(v) {
  return typeof v === 'string' && v.trim() === '' ? '' : v;
}

export function lenkeScoliosis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  // Every field is required, and each has an envelope. A Cobb angle of 400 degrees or a bending film
  // read as -30 is a transcription error, and the classification would answer it without complaint.
  const b = blankIfEmpty;
  const fault = inputFault([
    ['the proximal thoracic Cobb angle', b(o.ptCobb), 0, 130, 'degrees'],
    ['the main thoracic Cobb angle', b(o.mtCobb), 0, 130, 'degrees'],
    ['the thoracolumbar/lumbar Cobb angle', b(o.tlCobb), 0, 130, 'degrees'],
    ['the proximal thoracic side-bending Cobb angle', b(o.ptBend), 0, 130, 'degrees'],
    ['the main thoracic side-bending Cobb angle', b(o.mtBend), 0, 130, 'degrees'],
    ['the thoracolumbar/lumbar side-bending Cobb angle', b(o.tlBend), 0, 130, 'degrees'],
    ['the T2-T5 kyphosis', b(o.t2t5), -40, 120, 'degrees'],
    ['the T10-L2 kyphosis', b(o.t10l2), -40, 120, 'degrees'],
    ['the T5-T12 kyphosis', b(o.t5t12), -40, 120, 'degrees'],
  ]);
  if (fault) return { valid: false, message: fault };

  if (o.csvl === null || o.csvl === undefined || String(o.csvl).trim() === '') {
    return { valid: false, message: 'Say where the center sacral vertical line falls relative to the lumbar apical vertebra. It is what the lumbar modifier is, and there is no default.' };
  }
  const csvl = CSVL_BY_VALUE.get(String(o.csvl).trim());
  if (!csvl) {
    return { valid: false, message: `The center sacral vertical line option must be one of: ${LENKE_CSVL.map((c) => c.value).join(', ')}.` };
  }

  const pt = num(o.ptCobb); const mt = num(o.mtCobb); const tl = num(o.tlCobb);
  const t2t5 = num(o.t2t5); const t10l2 = num(o.t10l2); const t5t12 = num(o.t5t12);

  // The major curve is the largest standing Cobb. A tie goes to the main thoracic, which is the
  // region the classification is built around.
  const largest = Math.max(pt, mt, tl);
  const major = mt === largest ? 'MT' : (tl === largest ? 'TL' : 'PT');

  if (major === 'PT') {
    return {
      valid: false,
      message: `The largest curve here is the proximal thoracic one at ${pt} degrees. All six Lenke types have their major curve in the main thoracic or the thoracolumbar/lumbar region, so this curve pattern has no Lenke type and naming the nearest one would be an invention.`,
    };
  }

  const ptStructural = major === 'PT' || num(o.ptBend) >= BEND_STRUCTURAL || t2t5 >= KYPHOSIS_STRUCTURAL;
  const mtStructural = major === 'MT' || num(o.mtBend) >= BEND_STRUCTURAL || t10l2 >= KYPHOSIS_STRUCTURAL;
  const tlStructural = major === 'TL' || num(o.tlBend) >= BEND_STRUCTURAL || t10l2 >= KYPHOSIS_STRUCTURAL;

  const margin = tl - mt;
  let type = null;
  let unclassified = null;

  if (major === 'MT') {
    if (!ptStructural && !tlStructural) type = 1;
    else if (ptStructural && !tlStructural) type = 2;
    else if (!ptStructural && tlStructural) type = 3;
    else type = 4;
  } else if (!ptStructural && !mtStructural) {
    type = 5;
  } else if (ptStructural && mtStructural) {
    type = 4;
  } else if (mtStructural) {
    type = margin >= TYPE6_MARGIN ? 6 : 3;
  } else {
    unclassified = `The thoracolumbar/lumbar curve is the largest and the proximal thoracic curve is structural while the main thoracic curve is not. None of the six Lenke types describes that pattern, and naming the nearest one would be an invention. Check the side-bending films and the T10-L2 kyphosis before treating this as a classification failure.`;
  }

  if (unclassified) return { valid: false, message: unclassified };

  const sagittal = t5t12 < 10 ? '-' : (t5t12 > 40 ? '+' : 'N');
  const sagittalText = sagittal === '-' ? 'hypokyphotic' : (sagittal === '+' ? 'hyperkyphotic' : 'normal kyphosis');
  const code = `${type}${csvl.modifier}${sagittal}`;

  const structural = [ptStructural && 'proximal thoracic', mtStructural && 'main thoracic', tlStructural && 'thoracolumbar/lumbar'].filter(Boolean);

  // The margin rule, printed exactly when the case sits on it.
  const marginNote = !ptStructural && mtStructural && tlStructural
    ? (type === 6
        ? `The thoracolumbar/lumbar curve exceeds the main thoracic by ${margin} degrees, which is the 5 degrees Lenke requires for a type 6. One degree less and this would be a type 3.`
        : `The thoracolumbar/lumbar curve is ${margin > 0 ? `${margin} degrees larger than` : `${Math.abs(margin)} degrees smaller than`} the main thoracic. Type 6 needs the lumbar curve to be larger by at least 5, so this is a type 3 -- "whichever is bigger" is not the rule and would misclassify this case.`)
    : null;

  const majorStructuralNote = `The ${major === 'MT' ? 'main thoracic' : 'thoracolumbar/lumbar'} curve is the major curve at ${largest} degrees, and a major curve is structural by definition whatever it bends out to.`;

  return {
    valid: true,
    type,
    lumbarModifier: csvl.modifier,
    sagittalModifier: sagittal,
    code,
    major,
    structural,
    ptStructural,
    mtStructural,
    tlStructural,
    margin,
    abnormal: type >= 3,
    bandLabel: `Lenke ${code}`,
    band: `Lenke ${code}: type ${type}, ${TYPE_TEXT[type]}. Lumbar modifier ${csvl.modifier} -- ${csvl.text}. Sagittal thoracic modifier ${sagittal}, T5-T12 at ${t5t12} degrees, which is ${sagittalText}.`,
    structuralNote: `Structural here: ${structural.join(', ')}. A minor curve is structural when it bends out to ${BEND_STRUCTURAL} degrees or more, or when its region is kyphotic by ${KYPHOSIS_STRUCTURAL} degrees or more -- T2-T5 for the proximal thoracic curve, T10-L2 for the other two.`,
    majorStructuralNote,
    marginNote,
    postureNote: 'The classification describes the curve pattern. It does not select the fusion levels; Lenke built it to make that conversation comparable between surgeons, not to settle it.',
    note: LENKE_NOTE,
  };
}
