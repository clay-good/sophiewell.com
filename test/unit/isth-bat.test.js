// spec-v198 2.2: isthBat worked examples and guards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isthBat } from '../../lib/subspecialty-v198.js';

test('abnormal for adult male at 5', () => {
  const r = isthBat({group:'male',epistaxis:2,surgery:3});
  assert.equal(r.valid, true);
  assert.equal(r.total, 5);
  assert.equal(r.abnormal, true);
});

test('same score normal for adult female threshold', () => {
  const r = isthBat({group:'female',epistaxis:2,surgery:2});
  assert.equal(r.total, 4);
  assert.equal(r.abnormal, false);
});

test('guards: group required', () => {
  const r = isthBat({epistaxis:2});
  assert.equal(r.valid, false);
});

// spec-v1087: a pre-filled 0 is the slider defect wearing the fix's clothes.
//
// The fourteen domains rendered as number inputs with `value: '0'`. A number
// input CAN express "not answered" -- but only if it is rendered blank. Filled
// with a zero it is a form already answered, and the reader would have to delete
// fourteen of them to say "I have not asked about any of this". So a patient
// nobody had interviewed read "ISTH-BAT 0 -- within the normal range", and
// dropping one domain from the worked example took it from 5 ("abnormal bleeding
// score") to 3 ("within the normal range").
//
// Every domain only adds points, so a partial total is a floor: it may rule in
// and must not rule out.
test('spec-v1087: an unrated domain cannot make the score read normal', () => {
  const DOMAINS = ['epistaxis', 'cutaneous', 'minorWounds', 'oralCavity', 'gi', 'hematuria',
    'toothExtraction', 'surgery', 'menorrhagia', 'postpartum', 'muscleHematoma', 'hemarthrosis',
    'cns', 'other'];
  const negative = { group: 'male' };
  for (const d of DOMAINS) negative[d] = 0;

  // A history actually taken and negative throughout still reads normal.
  const asked = isthBat(negative);
  assert.equal(asked.total, 0);
  assert.deepEqual(asked.unrated, []);
  assert.match(asked.band, /within the normal range/);

  // Nobody asked anything: the reassuring reading is withheld.
  const none = isthBat({ group: 'male' });
  assert.equal(none.domainsScored, 0);
  // The negative has to be the VERDICT form, not the phrase: the refusal itself
  // says the score "cannot yet read as within the normal range", so a bare
  // doesNotMatch on that phrase fails against the very sentence doing the work.
  assert.doesNotMatch(none.band, /threshold: within the normal range/);
  assert.match(none.band, /cannot yet read as within the normal range/);
  assert.match(none.band, /can only add points/);

  // Already over the threshold: a floor may rule IN, and says its footing.
  const rulesIn = isthBat({ group: 'male', epistaxis: 2, surgery: 3 });
  assert.equal(rulesIn.total, 5);
  assert.equal(rulesIn.abnormal, true);
  assert.match(rulesIn.band, /abnormal bleeding score/);
  assert.match(rulesIn.band, /Scored from 2 of 14 domains/);
});
