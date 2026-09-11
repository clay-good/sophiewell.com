// spec-v1240: the Nassar operative difficulty grade for laparoscopic cholecystectomy -- three
// separate observations (gallbladder, cystic pedicle, adhesions), each graded 1 to 4, and THE GRADE
// IS THE WORST OF THE THREE.
//
// Sources:
//   Nassar AHM, Ashkar KA, Mohamed AY, Hafiz AA. Is laparoscopic cholecystectomy possible without
//   video technology? Minim Invasive Ther. 1995;4:63-65 -- the original scale.
//   Griffiths EA, Hodson J, Vohra RS, et al. (CholeS Study Group, West Midlands Research
//   Collaborative). Utilisation of an operative difficulty grading scale for laparoscopic
//   cholecystectomy. Surg Endosc. 2019;33(1):110-121. PMID 29956029 -- the 7,000-patient validation,
//   and the open-access paper (PMC6336748) that prints the three-column table reproduced below.
//
// The table:
//   Grade 1  gallbladder floppy, non-adherent | pedicle thin and clear    | adhesions simple, up to
//                                                                          the neck / Hartmann's
//   Grade 2  mucocele, packed with stones     | pedicle fat-laden         | adhesions simple, up to
//                                                                          the body
//   Grade 3  deep fossa, acute cholecystitis, | abnormal anatomy, or a    | dense up to the fundus;
//            contracted, fibrosis, Hartmann's | cystic duct short,        | involving the hepatic
//            adherent to the bile duct,       | dilated or obscured       | flexure or duodenum
//            impaction                        |                          |
//   Grade 4  completely obscured, empyema,    | impossible to clarify     | dense, fibrosis,
//            gangrene, mass                   |                          | wrapping the gallbladder;
//                                                                          duodenum or hepatic
//                                                                          flexure hard to separate
//
// WHY THE WORST AND NOT THE AVERAGE. A floppy, non-adherent gallbladder with a pedicle that cannot
// be clarified is a grade 4 operation, because the pedicle is what the operation turns on. Averaging
// the three -- or grading off the gallbladder alone, which is the easiest of the three to see --
// reports an easier operation than the one being done.
//
// A MISSING AXIS IS NOT A GRADE 1. Each axis can only raise the overall grade, so with one of the
// three not recorded the answer is a floor, not a grade. This tile says so rather than filling the
// gap in (spec-v1028's family rule; docs/incomplete-input-program.md).
//
// Pure: no DOM, no clock, no network.

export const NASSAR_NOTE = 'The Nassar operative difficulty grade (Nassar 1995; validated across 7,000 cholecystectomies by the CholeS study, Griffiths 2019) describes what the surgeon found, on three axes graded 1 to 4: the gallbladder, the cystic pedicle, and the adhesions. The overall grade is the worst of the three, not an average and not the gallbladder alone -- an unclarifiable pedicle makes a difficult operation however benign the gallbladder looks. Rising grade tracks longer operating time, conversion to open, 30-day complications and reintervention. It describes the operation; it is not a severity grade for the patient and it is not a treatment decision.';

export const NASSAR_AXES = [
  {
    key: 'gallbladder',
    label: 'Gallbladder',
    levels: [
      { value: '1', text: '1 - floppy, non-adherent' },
      { value: '2', text: '2 - mucocele, or packed with stones' },
      { value: '3', text: '3 - deep fossa, acute cholecystitis, contracted, fibrosis, Hartmann’s adherent to the bile duct, or impaction' },
      { value: '4', text: '4 - completely obscured, empyema, gangrene, or mass' },
    ],
  },
  {
    key: 'pedicle',
    label: 'Cystic pedicle',
    levels: [
      { value: '1', text: '1 - thin and clear' },
      { value: '2', text: '2 - fat-laden' },
      { value: '3', text: '3 - abnormal anatomy, or a cystic duct that is short, dilated or obscured' },
      { value: '4', text: '4 - impossible to clarify' },
    ],
  },
  {
    key: 'adhesions',
    label: 'Adhesions',
    levels: [
      { value: '1', text: '1 - simple, up to the neck or Hartmann’s pouch' },
      { value: '2', text: '2 - simple, up to the body' },
      { value: '3', text: '3 - dense up to the fundus, or involving the hepatic flexure or duodenum' },
      { value: '4', text: '4 - dense, fibrosis, wrapping the gallbladder; duodenum or hepatic flexure difficult to separate' },
    ],
  },
];

const GRADE_SUMMARY = {
  1: 'the easiest of the four grades',
  2: 'a straightforward operation with bulk or fat to work around',
  3: 'a difficult operation: the anatomy is distorted but still approachable',
  4: 'the hardest grade, where the anatomy cannot be clarified',
};

function isBlank(v) {
  return v === null || v === undefined || String(v).trim() === '';
}

function level(key, v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 4) {
    throw new RangeError(`nassar-gallbladder: ${key} must be a grade 1-4`);
  }
  return n;
}

export function nassarGallbladder(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const missing = [];
  const parts = {};
  let worst = 0;
  for (const axis of NASSAR_AXES) {
    const raw = o[axis.key];
    if (isBlank(raw)) { missing.push(axis.label.toLowerCase()); parts[axis.key] = null; continue; }
    const n = level(axis.key, raw);
    parts[axis.key] = n;
    if (n > worst) worst = n;
  }

  const worstAxes = NASSAR_AXES.filter((a) => parts[a.key] === worst).map((a) => a.label.toLowerCase());

  // 4 is the top of the scale, so once any axis reaches it the overall grade is settled and the
  // unrecorded axes cannot move it. Refusing here would ask for values that change nothing.
  const saturated = worst === 4;

  if (missing.length && !saturated) {
    const list = missing.length === 1 ? missing[0]
      : `${missing.slice(0, -1).join(', ')} and ${missing[missing.length - 1]}`;
    const floor = worst > 0
      ? `From what is recorded the operation is at least a Nassar grade ${worst}.`
      : 'Nothing is recorded yet, so there is no grade.';
    return {
      valid: true,
      grade: null,
      floor: worst || null,
      parts,
      incomplete: true,
      missing,
      abnormal: false,
      bandLabel: 'Nassar grade incomplete',
      band: `${floor} Grade the ${list}: the overall grade is the worst of the three axes, so an unrecorded axis can only raise it.`,
      note: NASSAR_NOTE,
    };
  }

  const difficult = worst >= 3;
  return {
    valid: true,
    grade: worst,
    floor: worst,
    parts,
    incomplete: false,
    missing: [],
    worstAxes,
    missingAtCeiling: missing,
    abnormal: difficult,
    bandLabel: `Nassar grade ${worst}`,
    band: `Nassar operative difficulty grade ${worst} of 4, set by the ${worstAxes.join(' and ')}. That is ${GRADE_SUMMARY[worst]}.`,
    ceilingNote: missing.length
      ? `${missing.length === 1 ? 'One axis is' : `${missing.length} axes are`} still ungraded (${missing.join(', ')}), and grading ${missing.length === 1 ? 'it' : 'them'} cannot change the answer: 4 is the top of the scale.`
      : null,
    worstNote: worstAxes.length === 3
      ? 'All three axes are at this grade.'
      : `The overall grade is the worst of the three axes, not an average: the ${worstAxes.join(' and ')} ${worstAxes.length === 1 ? 'sets' : 'set'} it on ${worstAxes.length === 1 ? 'its' : 'their'} own.`,
    // The single most useful thing the three-axis shape says, and it is invisible on a one-number scale.
    pedicleNote: parts.pedicle === 4 && parts.gallbladder !== null && parts.gallbladder <= 2
      ? 'The gallbladder looks benign and the cystic pedicle cannot be clarified. Grading off the gallbladder alone -- the easiest of the three to see -- would report a far easier operation than this one.'
      : null,
    note: NASSAR_NOTE,
  };
}
