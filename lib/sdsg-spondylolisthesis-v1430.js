// spec-v1430: Spinal Deformity Study Group (SDSG) classification of lumbosacral spondylolisthesis.
//
// Sources, read 2026-09-24:
//   Labelle H, Mac-Thiong JM, Roussouly P. Spino-pelvic sagittal balance of spondylolisthesis: a
//     review and classification. Eur Spine J 2011;20(Suppl 5):641-646 (PubMed 21809015) -- the
//     six-type description from the SDSG database of 816 patients aged 10 to 40.
//   Camino Willhuber G, Kido G. Classifications in brief: the Spinal Deformity Study Group
//     classification of lumbosacral spondylolisthesis. Clin Orthop Relat Res 2020;478(3):681-684
//     (PMC7145059). Its text:
//       step 1: slip on a lateral radiograph, "low-grade (less than 50% translation) and high-grade
//         (more than 50% translation)" per Meyerding (grade II "25% to 50%", grade III "50% to 75%")
//       Type 1 "low-grade spondylolisthesis and low pelvic incidence (less than 45°)"
//       Type 2 "low-grade spondylolisthesis and normal pelvic incidence (45° to 60°)"
//       Type 3 "low-grade spondylolisthesis and high pelvic incidence (more than 60°)"
//       Type 4 "high-grade spondylolisthesis and balanced sacropelvic parameters (low pelvic tilt
//         /high sacral slope)"
//       Type 5 high grade, "unbalanced sacropelvic parameters (high pelvic tilt/low sacral slope) and
//         balanced spinopelvic parameter (plumb line at or posterior to the femoral heads)"
//       Type 6 high grade, unbalanced sacropelvic, "plumb line anterior to femoral heads"
//       "In all low-grade slips, global spinopelvic balance is noted to be normal, as is sacropelvic
//         balance." Not used "for degenerative spondylolisthesis or L4-L5 pathology."
//       Reliability: intraobserver kappa 0.83 and interobserver 0.64 (Bao 2015); types 1 to 3 kappa
//         0.63 (Mac-Thiong 2012) and 0.60 (Bao); "systematic measurement error of 5°" for the
//         pelvic incidence. The SDSG recommended "no reduction in type 4, attempted reduction when
//         possible in type 5, and reduction and realignment in type 6"; the review advises
//         "considerable caution" as long-term follow-up is absent.
//
// What is NOT encoded: the review gives no number for "high pelvic tilt / low sacral slope", so the
// sacropelvic balance is entered as the reader's judgment, not derived from measured angles. A slip
// of exactly 50% is counted as low grade (Meyerding grade II runs to 50%) and says so.
// Pure: no DOM, no clock, no network.

import { inputFault } from './num.js';

export const SDSG_SACROPELVIC = [
  { value: 'balanced', text: 'Balanced (low pelvic tilt, high sacral slope)' },
  { value: 'unbalanced', text: 'Unbalanced (high pelvic tilt, low sacral slope)' },
];
export const SDSG_PLUMB = [
  { value: 'behind', text: 'At or behind the femoral heads' },
  { value: 'anterior', text: 'In front of the femoral heads' },
];

const WORDS = {
  1: 'low-grade slip with a low pelvic incidence (under 45°)',
  2: 'low-grade slip with a normal pelvic incidence (45° to 60°)',
  3: 'low-grade slip with a high pelvic incidence (over 60°)',
  4: 'high-grade slip with a balanced pelvis (low pelvic tilt, high sacral slope)',
  5: 'high-grade slip with an unbalanced pelvis and a C7 plumb line at or behind the femoral heads',
  6: 'high-grade slip with an unbalanced pelvis and a C7 plumb line in front of the femoral heads',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);
const blank = (v) => v === null || v === undefined || String(v).trim() === '';

const NOTE = 'Labelle H et al, Eur Spine J 2011 (Spinal Deformity Study Group); criteria as described by Camino Willhuber G and Kido G, Clin Orthop Relat Res 2020. '
  + 'For developmental (isthmic or dysplastic) L5-S1 slips; not for degenerative spondylolisthesis or an L4-L5 slip. The type describes the deformity; it does not choose the treatment.';

export function sdsgSpondylolisthesis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const slipFault = inputFault([['slip', o.slip, null, 200, '%']]);
  if (slipFault) return { valid: false, message: slipFault === 'Enter slip in %.' ? 'Enter the slip of L5 on S1 as a percent (Meyerding).' : slipFault };
  const slip = Number(String(o.slip).trim());
  const low = slip <= 50;
  const sacro = pick(SDSG_SACROPELVIC, o.sacropelvic);
  const plumb = pick(SDSG_PLUMB, o.plumb);

  const notes = [];
  let type;
  let pi = null;
  if (low) {
    const piFault = inputFault([['pelvic incidence', o.pi, null, 120, 'degrees']]);
    if (piFault) return { valid: false, message: piFault === 'Enter pelvic incidence in degrees.' ? 'Enter the pelvic incidence in degrees: in a low-grade slip it separates types 1, 2 and 3.' : piFault };
    pi = Number(String(o.pi).trim());
    type = pi < 45 ? 1 : (pi <= 60 ? 2 : 3);
    if (slip === 50) notes.push('A slip of exactly 50% sits on the line; it is counted as low grade here because Meyerding grade II runs to 50%.');
    if (Math.abs(pi - 45) <= 5 || Math.abs(pi - 60) <= 5) {
      notes.push(`A pelvic incidence of ${pi}° is within the 5° measurement error of a cutoff (45° or 60°), so the neighboring type is also possible.`);
    }
    const off = [];
    if (sacro === 'unbalanced') off.push('the pelvis is marked unbalanced');
    if (plumb === 'anterior') off.push('the C7 plumb line is in front of the femoral heads');
    if (off.length) {
      notes.push(`Not a clean fit: ${off.join(' and ')}, while the classification describes low-grade slips as balanced. The pelvic incidence sets the type; recheck the slip and the balance.`);
    }
    notes.push('Observers disagree most among types 1, 2 and 3 (kappa 0.60 to 0.63).');
  } else {
    if (!sacro) return { valid: false, message: 'Choose the sacropelvic balance: in a high-grade slip it separates type 4 from types 5 and 6.' };
    if (sacro === 'balanced') type = 4;
    else {
      if (!plumb) return { valid: false, message: 'Choose where the C7 plumb line falls: in an unbalanced pelvis it separates types 5 and 6.' };
      type = plumb === 'anterior' ? 6 : 5;
    }
    notes.push('The review gives no number for high pelvic tilt or low sacral slope, so the balance is the reader\'s judgment from the film.');
    notes.push('For types 4, 5 and 6 the group recommended no reduction, attempted reduction when possible, and reduction with realignment, in that order; the review urges considerable caution because long-term outcome data are lacking.');
  }
  notes.push('Overall agreement was substantial (intraobserver kappa 0.83, interobserver 0.64), yet observers still disagreed on about 1 in 8 patients.');

  return {
    valid: true,
    abnormal: true,
    type,
    grade: low ? 'low' : 'high',
    band: `SDSG type ${type}: ${WORDS[type]}.`,
    bandLabel: `Type ${type}`,
    notes,
    note: NOTE,
  };
}
