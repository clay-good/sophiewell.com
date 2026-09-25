// spec-v1429: Nerot-Sirveaux classification of scapular notching after reverse shoulder arthroplasty.
//
// Sources, read 2026-09-24:
//   Sirveaux F, Favard L, Oudet D, Huquet D, Walch G, Mole D. Grammont inverted total shoulder
//     arthroplasty in the treatment of glenohumeral osteoarthritis with massive rupture of the cuff.
//     Results of a multicentre study of 80 shoulders. J Bone Joint Surg Br 2004;86(3):388-395
//     (PubMed 15125127) -- the original; notching is "a defect of the bone in the inferior part of
//     the glenoid component."
//   Young BL, Cantrell CK, Hamid N. Classifications in brief: the Nerot-Sirveaux classification for
//     scapular notching. Clin Orthop Relat Res 2018;476(12):2454-2457 (PMC6259901). Its text:
//       view: "an AP radiographic view tangential to the baseplate (a true AP of the shoulder in the
//         scapular plane)"
//       Grade 1 "the defect involved only the inferior pillar of the scapular neck"
//       Grade 2 "the notch was in contact with the lower screw"
//       Grade 3 "erosion of the bone creating the notch extended over the lower screw"
//       Grade 4 "the notch extended under the baseplate"
//     Grades 1 and 2 are "generally ... believed to be the result of mechanical impingement";
//     grades 3 and 4 "are thought to be caused by polyethylene-induced osteolysis". Reliability:
//     one study (Sadoghi, 60 shoulders), kappa > 0.86; the beam angle "can hide the notch behind
//     radiopaque components or superimposed ribs"; no study has found the grade "is an indication
//     for intervention."
//
// The grade is read from how far the notch reaches, relative to the lower screw and the baseplate.
// The scale has no grade 0: no notch returns "nothing to grade". Pure: no DOM, no clock, no network.

export const NSN_EXTENT = [
  { value: 'none', text: 'No notch seen' },
  { value: 'pillar', text: 'Inferior pillar of the scapular neck only' },
  { value: 'screw', text: 'Reaches the lower screw' },
  { value: 'over', text: 'Extends over (past) the lower screw' },
  { value: 'under', text: 'Extends under the baseplate' },
];
export const NSN_VIEW = [
  { value: 'true', text: 'True AP in the scapular plane, tangential to the baseplate' },
  { value: 'other', text: 'Another view, or not tangential' },
];

const GRADE = { pillar: 1, screw: 2, over: 3, under: 4 };
const WORDS = {
  1: 'the defect involves only the inferior pillar of the scapular neck',
  2: 'the notch has eroded the scapular neck to the level of the lower screw and contacts it',
  3: 'the erosion extends over the lower screw',
  4: 'the notch extends under the baseplate',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

const NOTE = 'Sirveaux F et al, J Bone Joint Surg Br 2004, with a near-identical scale from Nerot\'s group; grades as described by Young BL, Cantrell CK and Hamid N, Clin Orthop Relat Res 2018. '
  + 'The grade describes the notch; it does not choose the treatment, and no study has shown that a grade is an indication for revision.';

export function nerotSirveaux(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const extent = pick(NSN_EXTENT, o.extent);
  const view = pick(NSN_VIEW, o.view);
  if (!extent) return { valid: false, message: 'Choose how far the notch reaches on the radiograph.' };

  const notes = [];
  if (view === 'other') {
    notes.push('The grade is read on a true AP in the scapular plane, tangential to the baseplate; on another projection the beam angle can hide the notch behind the components or the ribs, so the grade may be understated.');
  }

  if (extent === 'none') {
    notes.push('Notching can appear or progress over time after surgery, so a clear film now does not exclude it later.');
    return {
      valid: true,
      abnormal: false,
      grade: null,
      band: 'No scapular notch seen: nothing to grade (the Nerot-Sirveaux scale runs from grade 1 to 4).',
      bandLabel: 'No notch',
      notes,
      note: NOTE,
    };
  }

  const grade = GRADE[extent];
  notes.push(grade <= 2
    ? 'Grades 1 and 2 are generally believed to come from mechanical impingement of the humeral polyethylene on the scapular neck.'
    : 'Grades 3 and 4 are thought to come from polyethylene-induced osteolysis, since mechanical erosion is unlikely past the lower screw; erosion that compromises glenosphere fixation can lead to revision.');
  notes.push('Only one study has tested reliability (kappa above 0.86, 60 shoulders), and whether a grade relates to pain, motion or function is still disputed.');

  return {
    valid: true,
    abnormal: true,
    grade,
    band: `Nerot-Sirveaux grade ${grade} scapular notching: ${WORDS[grade]}.`,
    bandLabel: `Grade ${grade}`,
    notes,
    note: NOTE,
  };
}
