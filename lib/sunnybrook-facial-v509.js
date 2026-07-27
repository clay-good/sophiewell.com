// spec-v509: the Sunnybrook Facial Grading System (SFGS), the quantitative regional grading of facial nerve
// function. Companion gap to the existing `house-brackmann` tile: House-Brackmann assigns one gestalt grade
// I-VI, while Sunnybrook scores resting symmetry, voluntary movement, and synkinesis separately and combines
// them into a 0-100 composite that moves with small changes. "sunnybrook", "facial grading system", and
// "synkinesis" were all zero-hit across the corpus and app.js before this tile.
//
// The composite is a subtraction, not a lookup:
//   resting symmetry score    = (eye + cheek + mouth resting points) x 5
//   voluntary movement score  = (five expressions, each 1-5) x 4
//   synkinesis score          = (five expressions, each 0-3)
//   composite                 = voluntary movement - resting symmetry - synkinesis
//
// HIGH-STAKES: this is the arithmetic of a clinician's own observations. It is NOT a diagnosis, NOT an
// etiology (Bell palsy, Ramsay Hunt, tumor, and post-surgical palsy all score the same way), and NOT an
// indication for imaging, steroids, antivirals, electrodiagnostic testing, chemodenervation, or surgery
// (spec-v11 section 5.3). A composite of 100 means the two sides looked symmetric on the day of the exam;
// it does not rule out disease. The management decision stays with the ENT, neurology, and facial-therapy
// team.
//
// ITEMS AND WEIGHTS RE-FETCHED, NEVER RECALLED (spec-v97), cross-verified across agreeing sources:
//   - Ross BG, Fradet G, Nedzelski JM. Development of a sensitive clinical facial grading system.
//     Otolaryngol Head Neck Surg. 1996;114(3):380-386.
//   - Facial-nerve rehabilitation references reproducing the same three resting items, the same five
//     standard expressions, the same 1-5 movement and 0-3 synkinesis scales, and the same x5 / x4 weights.

// Resting symmetry, each item compared with the normal side.
export const REST_ITEMS = [
  {
    key: 'eye',
    label: 'Eye (palpebral fissure)',
    options: [
      { value: 'normal', text: 'Normal', points: 0 },
      { value: 'narrow', text: 'Narrow', points: 1 },
      { value: 'wide', text: 'Wide', points: 1 },
      { value: 'surgery', text: 'Eyelid surgery has been done', points: 1 },
    ],
  },
  {
    key: 'cheek',
    label: 'Cheek (nasolabial fold)',
    options: [
      { value: 'normal', text: 'Normal', points: 0 },
      { value: 'absent', text: 'Absent', points: 2 },
      { value: 'less', text: 'Less pronounced', points: 1 },
      { value: 'more', text: 'More pronounced', points: 1 },
    ],
  },
  {
    key: 'mouth',
    label: 'Mouth',
    options: [
      { value: 'normal', text: 'Normal', points: 0 },
      { value: 'drooped', text: 'Corner drooped', points: 1 },
      { value: 'pulled', text: 'Corner pulled up and out', points: 1 },
    ],
  },
];

// The five standard expressions, used for both the movement and the synkinesis axis.
export const EXPRESSIONS = [
  'Forehead wrinkle',
  'Gentle eye closure',
  'Open mouth smile',
  'Snarl',
  'Lip pucker',
];

export const MOVEMENT_SCALE = [
  { value: '1', text: '1 - unable to initiate movement' },
  { value: '2', text: '2 - initiates slight movement' },
  { value: '3', text: '3 - initiates movement with mild excursion' },
  { value: '4', text: '4 - movement almost complete' },
  { value: '5', text: '5 - movement complete' },
];

export const SYNKINESIS_SCALE = [
  { value: '0', text: '0 - none' },
  { value: '1', text: '1 - mild synkinesis' },
  { value: '2', text: '2 - obvious but not disfiguring synkinesis' },
  { value: '3', text: '3 - severe disfiguring synkinesis' },
];

const REST_WEIGHT = 5;
const MOVEMENT_WEIGHT = 4;

const NOTE = 'The Sunnybrook Facial Grading System (Ross and colleagues 1996) grades three axes against the normal side and subtracts: resting symmetry points x 5, five voluntary expressions scored 1 to 5 and multiplied by 4, and the synkinesis seen during those same five expressions scored 0 to 3. Composite = movement - resting - synkinesis, conventionally described as running from 0 (complete flaccid paralysis) to 100 (normal symmetry). It records what the examiner observed on the day of the exam. It is not a diagnosis, not an etiology, and not an indication for imaging, medication, electrodiagnostic testing, or surgery.';

function pointsFor(item, value) {
  if (value === '' || value === null || value === undefined) return null;
  const found = item.options.find((o) => o.value === value);
  return found ? found.points : NaN;
}

function readScale(v, lo, hi) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isInteger(n) || n < lo || n > hi) return NaN;
  return n;
}

// input:
//   eye, cheek, mouth: one of the REST_ITEMS option values (all three required).
//   m1 .. m5: each 1-5, in EXPRESSIONS order (all five required).
//   s1 .. s5: each 0-3, in EXPRESSIONS order (all five required).
export function sunnybrookFacial(input = {}) {
  const o = input && typeof input === 'object' ? input : {};

  const restPoints = REST_ITEMS.map((item) => pointsFor(item, o[item.key]));
  const movement = [];
  const synkinesis = [];
  for (let i = 1; i <= EXPRESSIONS.length; i += 1) {
    movement.push(readScale(o[`m${i}`], 1, 5));
    synkinesis.push(readScale(o[`s${i}`], 0, 3));
  }

  const all = [...restPoints, ...movement, ...synkinesis];
  if (all.some((n) => n === null)) {
    return { valid: false, message: 'Grade all three resting items and all five expressions on both the movement and the synkinesis scale.' };
  }
  if (all.some((n) => Number.isNaN(n))) {
    return { valid: false, message: 'Each resting item must be one of its listed choices, each movement 1 to 5, and each synkinesis 0 to 3.' };
  }

  const restingScore = restPoints.reduce((a, b) => a + b, 0) * REST_WEIGHT;
  const movementScore = movement.reduce((a, b) => a + b, 0) * MOVEMENT_WEIGHT;
  const synkinesisScore = synkinesis.reduce((a, b) => a + b, 0);
  const composite = movementScore - restingScore - synkinesisScore;

  const text = `Sunnybrook composite ${composite} of 100: movement ${movementScore} minus resting symmetry ${restingScore} minus synkinesis ${synkinesisScore}. 100 is normal symmetry and 0 is complete flaccid paralysis.`;

  return {
    valid: true,
    restingScore,
    movementScore,
    synkinesisScore,
    composite,
    bandLabel: `Composite ${composite} of 100`,
    band: text,
    note: NOTE,
  };
}
