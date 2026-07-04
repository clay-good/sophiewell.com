// spec-v183 MCP wave 47: adapters for the seven obstetrics/gynecology
// instruments in lib/obgyn-v225.js — the Nugent score and Amsel criteria
// (bacterial vaginosis), the modified Ferriman-Gallwey hirsutism score, the PBAC
// menstrual-bleeding chart, the Thompson neonatal-HIE score, the Menopause
// Rating Scale, and the Blatt-Kupperman index. dom keys mirror
// views/group-v225.js. Nugent's three morphotype selects carry numeric-string
// values (modeled as enums); the symptom/grade panels are numeric 0-N scores and
// the Amsel items are booleans.

import * as F from '../../lib/obgyn-v225.js';

const FG_AREAS = ['upperLip', 'chin', 'chest', 'upperAbdomen', 'lowerAbdomen', 'upperArm', 'thigh', 'upperBack', 'lowerBack'];
const FG_DOMS = ['fg-lip', 'fg-chin', 'fg-chest', 'fg-uabd', 'fg-labd', 'fg-arm', 'fg-thigh', 'fg-uback', 'fg-lback'];
const TH_ITEMS = [['th-tone', 'tone'], ['th-cons', 'consciousness'], ['th-seiz', 'seizures'], ['th-post', 'posture'], ['th-moro', 'moro'], ['th-grasp', 'grasp'], ['th-suck', 'suck'], ['th-resp', 'respiration'], ['th-font', 'fontanelle']];
const MRS_ITEMS = [['mrs-flush', 'hotFlushes'], ['mrs-heart', 'heartDiscomfort'], ['mrs-sleep', 'sleepProblems'], ['mrs-depr', 'depressive'], ['mrs-irr', 'irritability'], ['mrs-anx', 'anxiety'], ['mrs-exh', 'exhaustion'], ['mrs-sex', 'sexualProblems'], ['mrs-blad', 'bladderProblems'], ['mrs-dry', 'vaginalDryness'], ['mrs-joint', 'jointMuscle']];
const KU_ITEMS = [['ku-flush', 'hotFlushes'], ['ku-par', 'paresthesia'], ['ku-ins', 'insomnia'], ['ku-nerv', 'nervousness'], ['ku-mel', 'melancholia'], ['ku-ver', 'vertigo'], ['ku-weak', 'weakness'], ['ku-arth', 'arthralgia'], ['ku-head', 'headache'], ['ku-palp', 'palpitations'], ['ku-form', 'formication']];

function gradeFields(pairs, max) {
  return pairs.map(([dom, arg]) => ({ dom, arg, kind: 'number', required: false, label: `${arg} (0-${max})` }));
}

export default [
  {
    id: 'nugent-score',
    summary: 'Nugent score (Nugent 1991): Gram-stain morphotype counts for lactobacilli, Gardnerella/Bacteroides, and Mobiluncus give a 0–10 score where 7–10 indicates bacterial vaginosis.',
    compute: F.nugent,
    fields: [
      { dom: 'nug-lacto', arg: 'lactobacillus', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Lactobacillus morphotypes (points)' },
      { dom: 'nug-gard', arg: 'gardnerella', kind: 'enum', values: ['0', '1', '2', '3', '4'], required: true, label: 'Gardnerella / Bacteroides morphotypes (points)' },
      { dom: 'nug-mob', arg: 'mobiluncus', kind: 'enum', values: ['0', '1', '2'], required: true, label: 'Curved gram-variable rods / Mobiluncus (points)' },
    ],
  },
  {
    id: 'amsel-criteria',
    summary: 'Amsel criteria (Amsel 1983): thin homogeneous discharge, vaginal pH > 4.5, positive whiff test, and clue cells; ≥ 3 of 4 diagnoses bacterial vaginosis.',
    compute: F.amsel,
    fields: [
      { dom: 'ams-disch', arg: 'discharge', kind: 'bool', required: false, label: 'Thin homogeneous discharge' },
      { dom: 'ams-ph', arg: 'ph', kind: 'bool', required: false, label: 'Vaginal pH > 4.5' },
      { dom: 'ams-whiff', arg: 'whiff', kind: 'bool', required: false, label: 'Positive whiff (amine) test' },
      { dom: 'ams-clue', arg: 'clueCells', kind: 'bool', required: false, label: 'Clue cells > 20% on microscopy' },
    ],
  },
  {
    id: 'ferriman-gallwey',
    summary: 'Modified Ferriman-Gallwey score (1961/1981): terminal-hair grades 0–4 over nine body areas give a 0–36 total; ≥ 8 indicates hirsutism.',
    compute: F.ferrimanGallwey,
    fields: FG_DOMS.map((dom, i) => ({ dom, arg: FG_AREAS[i], kind: 'number', required: false, label: `${FG_AREAS[i]} hair grade (0-4)` })),
  },
  {
    id: 'pbac-hmb',
    summary: 'Pictorial Blood Assessment Chart (Higham 1990): counts of lightly/moderately/heavily soiled pads and tampons plus small and large clots give a score where > 100 predicts heavy menstrual bleeding (~ > 80 mL).',
    compute: F.pbac,
    fields: [
      { dom: 'pb-lp', arg: 'lightPads', kind: 'number', required: false, label: 'Lightly stained pads' },
      { dom: 'pb-mp', arg: 'moderatePads', kind: 'number', required: false, label: 'Moderately stained pads' },
      { dom: 'pb-sp', arg: 'soakedPads', kind: 'number', required: false, label: 'Soaked pads' },
      { dom: 'pb-lt', arg: 'lightTampons', kind: 'number', required: false, label: 'Lightly stained tampons' },
      { dom: 'pb-mt', arg: 'moderateTampons', kind: 'number', required: false, label: 'Moderately stained tampons' },
      { dom: 'pb-st', arg: 'soakedTampons', kind: 'number', required: false, label: 'Soaked tampons' },
      { dom: 'pb-sc', arg: 'smallClots', kind: 'number', required: false, label: 'Small clots' },
      { dom: 'pb-lc', arg: 'largeClots', kind: 'number', required: false, label: 'Large clots' },
    ],
  },
  {
    id: 'thompson-hie',
    summary: 'Thompson score (Thompson 1997): nine clinical signs of neonatal hypoxic-ischemic encephalopathy summed (0–10 mild, 11–14 moderate, ≥ 15 severe).',
    compute: F.thompsonHie,
    fields: gradeFields(TH_ITEMS, 3),
  },
  {
    id: 'menopause-rating-scale',
    summary: 'Menopause Rating Scale (Heinemann 2004): eleven items each 0–4 give a 0–44 symptom score (none/little 0–4, mild 5–8, moderate 9–16, severe ≥ 17).',
    compute: F.menopauseRating,
    fields: gradeFields(MRS_ITEMS, 4),
  },
  {
    id: 'kupperman-index',
    summary: 'Blatt-Kupperman index (Kupperman 1953): eleven weighted menopausal symptoms rated 0–3 sum to a menopausal-severity index.',
    compute: F.kupperman,
    fields: gradeFields(KU_ITEMS, 3),
  },
];
