// spec-v1423: Pires classification of interprosthetic femur fractures (a femur fracture between an
// ipsilateral hip arthroplasty stem and knee arthroplasty femoral component).
//
// Sources, read 2026-09-24:
//   Pires RES, de Toledo Lourenco PRB, Labronici PJ, et al. Interprosthetic femoral fractures:
//     proposed new classification system and treatment algorithm. Injury 2014;45(suppl 5):S2-S6
//     (PubMed 25528619) -- the original.
//   Gheewala RA, Young JR. Classifications in brief: Pires classification of interprosthetic femur
//     fractures. Clin Orthop Relat Res 2022;480(9):1666-1671 (PMC9384940). Its Description:
//       Type I  "closer to the femoral stem of a THA than to the femoral component of an unstemmed TKA"
//       Type II "closer to the femoral component of an unstemmed TKA than to the femoral stem of a THA"
//       then "Type A denotes well-fixed hip and knee prostheses, Type B a loose hip prosthesis and
//       well-fixed knee prosthesis, Type C a well-fixed hip prosthesis and loose knee prosthesis, and
//       Type D loose hip and knee prostheses".
//       Type III "involve a stemmed TKA femoral component": IIIA well fixed + viable interprosthetic
//       bone, IIIB well fixed + nonviable, IIIC "loose prostheses (hip, knee, or both)" + viable,
//       IIID loose + nonviable. Viability: "at least 5 centimeters with no cement and prosthesis
//       components in the fracture site". (The Fig. 3 caption attaches that quoted phrase to
//       NONVIABLE bone; the text, and the sense of the words, attach it to viable bone. This follows
//       the text.)
//     Reliability: interobserver kappa 0.499 and intraobserver 0.636 (Jennison 2019); interobserver
//     0.424 to 0.559 among fellowship-trained surgeons (Pires 2017). The review recommends it "not be
//     used to guide treatment, estimate prognosis, facilitate communication among providers, or
//     stratify patients in research studies", and notes plain films can miss loosening.
//
// The type is DERIVED from what the surgeon records: the knee component (stemmed or not) sets
// type III; otherwise the nearer implant sets I or II; fixation of each implant (and, in type III,
// the bone between them) sets the letter. Pure: no DOM, no clock, no network.

export const PIF_KNEE_STEM = [
  { value: 'unstemmed', text: 'Unstemmed knee femoral component' },
  { value: 'stemmed', text: 'Stemmed knee femoral component' },
];
export const PIF_NEARER = [
  { value: 'hip', text: 'Closer to the hip stem' },
  { value: 'knee', text: 'Closer to the knee femoral component' },
];
export const PIF_FIXATION = [
  { value: 'fixed', text: 'Well fixed' },
  { value: 'loose', text: 'Loose' },
];
export const PIF_BONE = [
  { value: 'viable', text: 'Viable: at least 5 cm, with no cement or implant at the fracture site' },
  { value: 'nonviable', text: 'Nonviable: shorter, or cement or implant at the fracture site' },
];

const LETTER = {
  'fixed/fixed': 'A',
  'loose/fixed': 'B',
  'fixed/loose': 'C',
  'loose/loose': 'D',
};
const FIX_WORDS = {
  A: 'both the hip and knee implants are well fixed',
  B: 'the hip stem is loose and the knee component well fixed',
  C: 'the hip stem is well fixed and the knee component loose',
  D: 'both the hip and knee implants are loose',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function piresInterprosthetic(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const kneeStem = pick(PIF_KNEE_STEM, o.kneeStem);
  const nearer = pick(PIF_NEARER, o.nearer);
  const hip = pick(PIF_FIXATION, o.hip);
  const knee = pick(PIF_FIXATION, o.knee);
  const bone = pick(PIF_BONE, o.bone);

  if (!kneeStem) return { valid: false, message: 'Choose whether the knee femoral component is stemmed: a stemmed component makes it type III.' };
  if (kneeStem === 'unstemmed' && !nearer) {
    return { valid: false, message: 'Choose which implant the fracture is closer to: that separates type I from type II.' };
  }
  if (!hip) return { valid: false, message: 'Choose whether the hip stem is well fixed or loose.' };
  if (!knee) return { valid: false, message: 'Choose whether the knee femoral component is well fixed or loose.' };
  if (kneeStem === 'stemmed' && !bone) {
    return { valid: false, message: 'Choose whether the bone between the implants is viable: in type III it separates A from B and C from D.' };
  }

  const notes = [];
  let type;
  let band;
  if (kneeStem === 'stemmed') {
    const loose = hip === 'loose' || knee === 'loose';
    const letter = loose ? (bone === 'viable' ? 'C' : 'D') : (bone === 'viable' ? 'A' : 'B');
    type = `III${letter}`;
    const fix = loose ? 'a loose implant (hip, knee or both)' : 'well-fixed hip and knee implants';
    const via = bone === 'viable' ? 'viable bone between the implants' : 'nonviable bone between the implants';
    band = `Pires type ${type}: a fracture with a stemmed knee femoral component, ${fix}, and ${via}.`;
    if (nearer === 'hip') {
      notes.push('The fracture was recorded as closer to the hip stem. The text defines type III by the stemmed knee component alone, but its figures show type III fractures closer to the knee stem, so read this type as approximate.');
    }
    if (bone === 'nonviable') {
      notes.push('The authors named little or no viable bone, and a short interval between the implants, as the two factors behind reoperation in type III.');
    }
  } else {
    const letter = LETTER[`${hip}/${knee}`];
    const site = nearer === 'hip' ? 'I' : 'II';
    type = `${site}${letter}`;
    const where = nearer === 'hip'
      ? 'closer to the hip stem than to the unstemmed knee component'
      : 'closer to the unstemmed knee component than to the hip stem';
    band = `Pires type ${type}: a fracture ${where}; ${FIX_WORDS[letter]}.`;
  }

  notes.push('Plain films can miss implant loosening, and bone viability can be hard to judge on them; the review advises testing fixation at surgery and preparing for a loose implant.');
  notes.push('Reliability is low: interobserver kappa 0.499 and intraobserver 0.636 in one study, 0.424 to 0.559 between fellowship-trained surgeons in another. The review recommends against using this class to guide treatment, estimate prognosis, communicate between clinicians, or stratify research, and suggests a plain description instead.');

  return {
    valid: true,
    abnormal: true,
    type,
    band,
    bandLabel: `Type ${type}`,
    notes,
    note: 'Pires RES et al, Injury 2014; definitions as given by Gheewala RA and Young JR, Clin Orthop Relat Res 2022. '
      + 'The original paired each type with a treatment algorithm, which this does not reproduce: the class describes the fracture and does not choose the treatment.',
  };
}
