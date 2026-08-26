// spec-v789: acute pericarditis diagnostic criteria and the temporal classification.
//
// Source:
//   Adler Y, Charron P, Imazio M, et al. 2015 ESC Guidelines for the diagnosis and
//   management of pericardial diseases. Eur Heart J. 2015;36(42):2921-2964.
//   (PMID 26320112.)
//
// Diagnosis needs at least TWO of four criteria:
//   sharp pleuritic chest pain, better sitting up and leaning forward
//   pericardial friction rub
//   new widespread ST elevation or PR depression on the ECG
//   new or worsening pericardial effusion
//
// Two further findings SUPPORT the diagnosis but do not count toward the two:
//   raised inflammatory markers (CRP, ESR, white cell count)
//   pericardial inflammation on CT or cardiac MRI
//
// Temporal classification, which is independent of the criteria count:
//   acute       new onset
//   incessant   symptoms lasting beyond 4 to 6 weeks without clear remission, under 3 months
//   recurrent   a documented first episode, a symptom-free interval of 4 to 6 weeks or more,
//               then a further episode
//   chronic     lasting more than 3 months
//
// Pure: no DOM, no clock, no network.

export const PERICARDITIS_NOTE = 'The diagnosis of acute pericarditis (Adler Y, Charron P, Imazio M, et al, Eur Heart J 2015;36(42):2921-2964) needs at least two of four findings: sharp pleuritic chest pain that eases on sitting up and leaning forward, a pericardial friction rub, new widespread ST elevation or PR depression on the ECG, and a new or worsening pericardial effusion. Raised inflammatory markers and pericardial inflammation on CT or cardiac MRI support the diagnosis but do not count toward the two, which matters because a raised C-reactive protein alone will not make the diagnosis. Separately from that count, an episode is classified by its course as acute at new onset, incessant when symptoms run past four to six weeks without clear remission, recurrent after a symptom-free interval of four to six weeks or more, and chronic beyond three months. Chest pain that could be pericarditis could also be a coronary syndrome, an aortic dissection or a pulmonary embolism, and meeting these criteria does not exclude any of them.';

const CRITERIA = [
  { arg: 'chestPain', text: 'sharp pleuritic chest pain, better sitting forward' },
  { arg: 'frictionRub', text: 'pericardial friction rub' },
  { arg: 'ecgChanges', text: 'new widespread ST elevation or PR depression' },
  { arg: 'effusion', text: 'new or worsening pericardial effusion' },
];
const SUPPORTING = [
  { arg: 'inflammatoryMarkers', text: 'raised inflammatory markers' },
  { arg: 'imagingInflammation', text: 'pericardial inflammation on CT or cardiac MRI' },
];
const COURSES = {
  acute: 'acute (new onset)',
  incessant: 'incessant (beyond 4 to 6 weeks without clear remission, under 3 months)',
  recurrent: 'recurrent (a further episode after a symptom-free interval of 4 to 6 weeks or more)',
  chronic: 'chronic (more than 3 months)',
};

function truthy(v) { return v === true || v === 'true' || v === 1 || v === '1' || v === 'on' || v === 'yes'; }

export function pericarditis(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const course = o.course === undefined || o.course === null || o.course === '' ? 'acute' : String(o.course).trim();
  if (!Object.prototype.hasOwnProperty.call(COURSES, course)) {
    return { valid: false, code: 'INVALID_INPUT', field: 'course', message: 'Course must be acute, incessant, recurrent or chronic.', note: PERICARDITIS_NOTE };
  }

  const met = CRITERIA.filter((c) => truthy(o[c.arg])).map((c) => c.text);
  const support = SUPPORTING.filter((c) => truthy(o[c.arg])).map((c) => c.text);
  const diagnostic = met.length >= 2;

  return {
    valid: true,
    criteriaMet: met.length,
    criteria: met,
    supporting: support,
    course,
    courseLabel: COURSES[course],
    diagnostic,
    abnormal: diagnostic,
    bandLabel: `Pericarditis criteria ${met.length} of 4`,
    band: diagnostic
      ? `Pericarditis criteria ${met.length} of 4 — criteria met, ${COURSES[course]}.`
      : `Pericarditis criteria ${met.length} of 4 — fewer than the two required, so the criteria are not met.`,
    detail: 'At least two of four: sharp pleuritic chest pain better sitting forward, a pericardial friction rub, new widespread ST elevation or PR depression, a new or worsening pericardial effusion. Raised inflammatory markers and inflammation on CT or cardiac MRI support the diagnosis but do NOT count toward the two. The course - acute, incessant, recurrent, chronic - is classified separately and does not change the count.',
    note: PERICARDITIS_NOTE,
  };
}
