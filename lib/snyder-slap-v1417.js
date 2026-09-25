// spec-v1417: Snyder classification of SLAP (superior labrum anterior and posterior) lesions.
//
// Sources, read 2026-09-24:
//   Snyder SJ, Karzel RP, Del Pizzo W, Ferkel RD, Friedman MJ. SLAP lesions of the shoulder.
//     Arthroscopy 1990;6(4):274-279 (abstract, PubMed 2264894): the injury "begins posteriorly and
//     extends anteriorly ... including the 'anchor' of the biceps tendon to the labrum"; four types;
//     it "can be diagnosed only arthroscopically"; "No imaging test accurately defined the superior
//     labral pathology preoperatively."
//   Hahn AK et al. Intraobserver and interobserver reliability of the Snyder and expanded SLAP
//     classification system: a video study. Orthop J Sports Med 2023;11(11):23259671231204851
//     (PMC10638887), which gives the four types as:
//       I   "Fraying of the superior labrum free edge with a stable biceps tendon"
//       II  "Labrum and biceps tendon detaching from the top of the glenoid"
//       III "Bucket-handle tear with an intact biceps tendon"
//       IV  "Displaced bucket-handle labral tear with extension into the biceps tendon root"
//     and fair interobserver agreement for the Snyder system (kappa 0.31).
//
// The type is derived from two arthroscopic observations. Pure: no DOM, no clock, no network.

export const SLAP_LABRUM = [
  { value: 'frayed', text: 'Frayed free edge, still attached' },
  { value: 'detached', text: 'Labrum and biceps anchor detached from the top of the glenoid' },
  { value: 'bucket', text: 'Bucket-handle tear of the superior labrum' },
];
export const SLAP_BICEPS = [
  { value: 'intact', text: 'Intact or stable' },
  { value: 'extends', text: 'Tear extends into the biceps tendon root' },
];

const TYPES = {
  I: 'Fraying of the superior labrum free edge with a stable biceps tendon.',
  II: 'The labrum and biceps tendon detach from the top of the glenoid.',
  III: 'A bucket-handle tear of the superior labrum with an intact biceps tendon.',
  IV: 'A displaced bucket-handle labral tear that extends into the biceps tendon root.',
};

export function snyderSlap(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const labrum = SLAP_LABRUM.some((x) => x.value === o.labrum) ? o.labrum : null;
  const biceps = SLAP_BICEPS.some((x) => x.value === o.biceps) ? o.biceps : null;
  if (!labrum) return { valid: false, message: 'Choose what the superior labrum looks like at arthroscopy.' };
  if (labrum !== 'detached' && !biceps) {
    return { valid: false, message: 'Say whether the biceps tendon is intact or the tear extends into it: that separates the types.' };
  }

  let type = null;
  if (labrum === 'detached') type = 'II';
  else if (labrum === 'frayed' && biceps === 'intact') type = 'I';
  else if (labrum === 'bucket') type = biceps === 'extends' ? 'IV' : 'III';

  const notes = [
    'Snyder described the lesion as diagnosed only at arthroscopy: in the original series no imaging test defined it beforehand.',
    'Agreement between surgeons classifying the same arthroscopy video was only fair (kappa 0.31, Hahn 2023), so a type on its own is a weak basis for comparing reports.',
  ];

  if (!type) {
    return {
      valid: true,
      abnormal: true,
      type: null,
      band: 'Does not fit one Snyder type: a frayed but attached labrum is type I only with a stable biceps tendon, and none of the four types has fraying that extends into the tendon. Describe the findings rather than force a type.',
      bandLabel: 'No single type',
      notes,
      note: NOTE,
    };
  }
  return {
    valid: true,
    abnormal: type !== 'I',
    type,
    band: `Snyder type ${type} SLAP lesion: ${TYPES[type].charAt(0).toLowerCase()}${TYPES[type].slice(1)}`,
    bandLabel: `Type ${type}`,
    notes,
    note: NOTE,
  };
}

const NOTE = 'Snyder SJ et al, Arthroscopy 1990 (27 lesions in more than 700 shoulder arthroscopies); type definitions as given by Hahn AK et al, Orthop J Sports Med 2023. '
  + 'The classification describes the lesion; it does not choose the treatment. Later schemes added further types, which this does not cover.';
