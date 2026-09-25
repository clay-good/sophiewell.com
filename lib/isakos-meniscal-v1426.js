// spec-v1426: ISAKOS classification of meniscal tears, as an arthroscopic record.
//
// Sources, read 2026-09-24:
//   Anderson AF, Irrgang JJ, Dunn W, et al. Interobserver reliability of the International Society
//     of Arthroscopy, Knee Surgery and Orthopaedic Sports Medicine (ISAKOS) classification of
//     meniscal tears. Am J Sports Med 2011;39(5):926-932 -- the original (8 surgeons, 37 videos).
//   Sayegh ET, Matzkin E. Classifications in Brief: the ISAKOS classification of meniscal tears.
//     Clin Orthop Relat Res 2022;480(1):39-44 (PMC8673961). Its Description:
//       depth: "partial if they extend into either the superior or inferior meniscal surfaces and
//         complete if they extend into both surfaces"
//       rim width: "Cooper Zone 1 (rim width < 3 mm; outer third), Cooper Zone 2 (rim width 3 mm to
//         < 5 mm; middle third), and Cooper Zone 3 (rim width >= 5 mm; inner third)"; "If a tear
//         involves multiple zones ... graded according to the outermost zone involved."
//       radial location: posterior, midbody, anterior thirds; "A tear can simultaneously involve
//         multiple zones"
//       "Lateral meniscal tears are graded as central to the popliteal hiatus if they extend
//         partially or completely in front of the popliteal hiatus."
//       pattern: "longitudinal-vertical (the extension of which is a bucket-handle tear),
//         horizontal, radial, vertical flap, horizontal flap, or complex"; "complex tears ... have
//         two or more tear patterns"
//       tissue quality: "degenerative, nondegenerative, or undetermined"; degenerative tissue
//         includes "cavitations, fibrillations, softening, and/or multiple tear patterns"
//       plus tear length (mm) and the percentage of the meniscus excised.
//     Anderson's kappas: radial location (anterior/posterior halves) 0.65, pattern 0.72, depth 0.52,
//     radial location (thirds) 0.46, tissue quality 0.47, rim width 0.25, popliteal hiatus 0.36;
//     tear length ICC 0.83, percentage excised ICC 0.65.
//
// This is a descriptive record, not a graded scale: the tool turns six arthroscopic findings into
// the standard ISAKOS sentence and derives the Cooper zone from the rim width. Tear length and the
// percentage excised are measured at surgery and are not taken here.
// Pure: no DOM, no clock, no network.

export const ISK_MENISCUS = [
  { value: 'medial', text: 'Medial meniscus' },
  { value: 'lateral', text: 'Lateral meniscus' },
];
export const ISK_DEPTH = [
  { value: 'partial', text: 'Partial: reaches the superior or the inferior surface' },
  { value: 'complete', text: 'Complete: reaches both surfaces' },
];
export const ISK_RIM = [
  { value: 'z1', text: 'Under 3 mm (zone 1, outer third)' },
  { value: 'z2', text: '3 mm to under 5 mm (zone 2, middle third)' },
  { value: 'z3', text: '5 mm or more (zone 3, inner third)' },
];
export const ISK_RADIAL = [
  { value: 'posterior', text: 'Posterior third' },
  { value: 'middle', text: 'Middle third (midbody)' },
  { value: 'anterior', text: 'Anterior third' },
  { value: 'posterior-middle', text: 'Posterior and middle thirds' },
  { value: 'middle-anterior', text: 'Middle and anterior thirds' },
  { value: 'all', text: 'All three thirds' },
];
export const ISK_HIATUS = [
  { value: 'central', text: 'Central to the popliteal hiatus (extends in front of it)' },
  { value: 'not-central', text: 'Not central to the popliteal hiatus' },
];
export const ISK_PATTERN = [
  { value: 'longitudinal', text: 'Longitudinal-vertical' },
  { value: 'bucket', text: 'Bucket-handle (an extended longitudinal-vertical tear)' },
  { value: 'horizontal', text: 'Horizontal' },
  { value: 'radial', text: 'Radial' },
  { value: 'vertical-flap', text: 'Vertical flap' },
  { value: 'horizontal-flap', text: 'Horizontal flap' },
  { value: 'complex', text: 'Complex (two or more patterns)' },
];
export const ISK_TISSUE = [
  { value: 'degenerative', text: 'Degenerative' },
  { value: 'nondegenerative', text: 'Nondegenerative' },
  { value: 'undetermined', text: 'Undetermined' },
];

const ZONE = { z1: { n: 1, words: 'under 3 mm' }, z2: { n: 2, words: '3 mm to under 5 mm' }, z3: { n: 3, words: '5 mm or more' } };
const RADIAL_WORDS = {
  posterior: 'the posterior third',
  middle: 'the middle third',
  anterior: 'the anterior third',
  'posterior-middle': 'the posterior and middle thirds',
  'middle-anterior': 'the middle and anterior thirds',
  all: 'all three thirds',
};
const PATTERN_WORDS = {
  longitudinal: 'longitudinal-vertical',
  bucket: 'bucket-handle (longitudinal-vertical)',
  horizontal: 'horizontal',
  radial: 'radial',
  'vertical-flap': 'vertical flap',
  'horizontal-flap': 'horizontal flap',
  complex: 'complex',
};

const pick = (list, v) => (list.some((x) => x.value === v) ? v : null);

export function isakosMeniscal(input = {}) {
  const o = input && typeof input === 'object' ? input : {};
  const meniscus = pick(ISK_MENISCUS, o.meniscus);
  const depth = pick(ISK_DEPTH, o.depth);
  const rim = pick(ISK_RIM, o.rim);
  const radial = pick(ISK_RADIAL, o.radial);
  const hiatus = pick(ISK_HIATUS, o.hiatus);
  const pattern = pick(ISK_PATTERN, o.pattern);
  const tissue = pick(ISK_TISSUE, o.tissue);

  if (!meniscus) return { valid: false, message: 'Choose the medial or the lateral meniscus.' };
  if (!depth) return { valid: false, message: 'Choose the tear depth: partial or complete.' };
  if (!rim) return { valid: false, message: 'Choose the rim width at the outermost zone the tear reaches.' };
  if (!radial) return { valid: false, message: 'Choose which thirds of the meniscus the tear involves.' };
  if (meniscus === 'lateral' && !hiatus) {
    return { valid: false, message: 'Say whether the lateral meniscal tear is central to the popliteal hiatus.' };
  }
  if (!pattern) return { valid: false, message: 'Choose the predominant tear pattern.' };
  if (!tissue) return { valid: false, message: 'Choose the tissue quality: degenerative, nondegenerative or undetermined.' };

  const zone = ZONE[rim];
  const parts = [
    `${depth} tear of the ${meniscus} meniscus`,
    `rim width zone ${zone.n} (${zone.words})`,
    RADIAL_WORDS[radial],
  ];
  if (meniscus === 'lateral') parts.push(hiatus === 'central' ? 'central to the popliteal hiatus' : 'not central to the popliteal hiatus');
  parts.push(`${PATTERN_WORDS[pattern]} pattern`);
  parts.push(`${tissue} tissue`);
  const sentence = parts.join(', ');

  const notes = [];
  if (meniscus === 'medial' && hiatus) notes.push('The popliteal hiatus is graded only for lateral meniscal tears, so it is left out of this record.');
  if (pattern === 'complex' && tissue === 'nondegenerative') {
    notes.push('Multiple tear patterns are one of the listed features of degenerative tissue; check the tissue quality against a complex pattern.');
  }
  notes.push('Record the tear length in mm (arthroscopic ruler or probe) and the percentage of the meniscus excised as measured at surgery; together with these six findings they complete the ISAKOS record.');
  notes.push('Rim width and centrality to the popliteal hiatus were the least reproducible items between surgeons (kappa 0.25 and 0.36); tear pattern (0.72) was the most.');

  return {
    valid: true,
    abnormal: true,
    zone: zone.n,
    band: `ISAKOS: ${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`,
    bandLabel: `Zone ${zone.n}, ${PATTERN_WORDS[pattern]}`,
    notes,
    note: 'Anderson AF et al, Am J Sports Med 2011; criteria as described by Sayegh ET and Matzkin E, Clin Orthop Relat Res 2022. '
      + 'The system was built as an arthroscopic assessment for standardized documentation and pooled research; it describes the tear and does not choose the treatment.',
  };
}
