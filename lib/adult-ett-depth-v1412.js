// spec-v1412: adult oral endotracheal tube insertion depth, read at the corner of the mouth.
//
// Sources, read 2026-09-24 (abstracts via PubMed):
//   Roberts JR, Spadafora M, Cone DC. Proper depth placement of oral endotracheal tubes in adults
//     prior to radiographic confirmation. Acad Emerg Med 1995;2(1):20-24. 83 critically ill adults;
//     "corner-of-the-mouth placement of the ETT using the 21-cm tube mark for the women and the
//     23-cm mark for the men would have led to proper placement for most patients" (97.6%, with
//     correct defined as the tip at least 2 cm above the carina on the chest radiograph).
//   Cherng CH, Wong CS, Hsu CH, Ho ST. Airway length in adults: estimation of the optimal
//     endotracheal tube length for orotracheal intubation. J Clin Anesth 2002;14(4):271-274. 293
//     adults, fiberoptic measurement, head neutral; target tip 5 cm above the carina; "the length
//     from 5 cm above carina to right mouth angle (cm) = body height (cm)/5 - 13".
//
// Both rules give a STARTING mark. Neither confirms that the tube is in the trachea, and neither
// replaces a check of its depth. Pure: no DOM, no clock, no network.

import { boundsAdvisory } from './bounds.js';

export const ETT_SEXES = [
  { value: 'female', text: 'Female' },
  { value: 'male', text: 'Male' },
];

const ROBERTS = { female: 21, male: 23 };

function isBlank(v) {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}
const half = (x) => Math.round(x * 2) / 2;

export function adultEttDepth(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const sex = o.sex === 'female' || o.sex === 'male' ? o.sex : null;
  let heightCm = null;
  if (!isBlank(o.heightCm)) {
    const h = Number(o.heightCm);
    if (!Number.isFinite(h)) return { valid: false, message: 'Enter the height as a number.' };
    const fault = boundsAdvisory('heightM', h / 100);
    if (fault) return { valid: false, message: fault };
    heightCm = h;
  }
  if (!sex && heightCm === null) {
    return { valid: false, message: 'Enter the sex, the height, or both: each gives a starting depth.' };
  }

  const bySex = sex ? ROBERTS[sex] : null;
  const byHeight = heightCm === null ? null : half(heightCm / 5 - 13);
  if (byHeight !== null && byHeight <= 0) {
    return { valid: false, message: 'That height gives no usable depth: the height rule was derived in adults. For a child, use the pediatric ETT calculator.' };
  }

  // Neither study is preferred over the other, so the answer is both marks, or the range between.
  const parts = [];
  if (byHeight !== null) parts.push(`${byHeight} cm by height (height / 5 - 13, Cherng 2002)`);
  if (bySex !== null) parts.push(`${bySex} cm by sex (${sex === 'female' ? 'women' : 'men'}, Roberts 1995)`);
  const marks = [byHeight, bySex].filter((x) => x !== null).sort((a, b) => a - b);
  const bandLabel = marks.length === 2 && marks[0] !== marks[1]
    ? `${marks[0]} to ${marks[1]} cm at the lip corner`
    : `${marks[0]} cm at the lip corner`;
  const band = `Starting depth at the corner of the mouth: ${parts.join('; ')}.`;

  const notes = [];
  if (bySex !== null && byHeight !== null && Math.abs(bySex - byHeight) >= 2) {
    notes.push(`The two rules differ by ${Math.abs(bySex - byHeight)} cm for this patient. The height rule tracks body size; the sex rule does not, so it runs deep in a short patient and shallow in a tall one.`);
  }
  if (bySex !== null && byHeight === null) {
    notes.push('Enter the height for the height-based estimate: the sex rule is the same mark for every woman and for every man.');
  }
  if (bySex === null) {
    notes.push('Choose the sex for the Roberts mark (21 cm women, 23 cm men) alongside this one.');
  }

  return {
    valid: true,
    abnormal: false,
    bySexCm: bySex,
    byHeightCm: byHeight,
    band,
    bandLabel,
    notes,
    steps: [
      'Placement first: confirm the tube is in the trachea with waveform capnography. A depth mark says nothing about that.',
      'Then depth: listen over both lungs and both axillae and the stomach, and check the tip on a chest radiograph. Roberts counted a tip 2 cm or more above the carina as correct; Cherng aimed for 5 cm.',
      'Record the mark at the lip corner, and recheck it after moving the head or the patient: flexing the neck pushes the tip toward the carina and extending it pulls the tip up.',
    ],
    note: 'Adult oral tubes only, read at the corner of the mouth with the head neutral. Not for nasal tubes or children (use the pediatric ETT calculator). '
      + 'Roberts JR et al, Acad Emerg Med 1995 (83 critically ill adults); Cherng CH et al, J Clin Anesth 2002 (293 adult surgical patients). '
      + 'The mark is a starting point: a mainstem intubation is found by examination and imaging, not ruled out by the number.',
  };
}
