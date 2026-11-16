// spec-v1556 tool 4: Quadro 4 for Phoneutria and Loxosceles, prednisone, Latrodectus supportive.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brazilSpiderAntivenom as r } from '../../lib/brazil-spider-antivenom-v1556.js';

test('Phoneutria and Loxosceles', () => {
  assert.equal(r({ spider: 'phoneutria', moderate: 'no', severe: 'no' }).bandLabel, 'Mild: no antivenom');
  assert.equal(r({ spider: 'phoneutria', moderate: 'yes', severe: 'no' }).bandLabel, 'Moderate: 2-4 vials');
  assert.equal(r({ spider: 'phoneutria', severe: 'yes' }).bandLabel, 'Severe: 5-10 vials');
  const lm = r({ spider: 'loxosceles', moderate: 'yes', severe: 'no', ageGroup: 'child', weight: '20' });
  assert.equal(lm.bandLabel, 'Moderate: 5 vials');
  assert.ok(lm.notes.some((n) => /Prednisone 20 mg a day/.test(n)));
  assert.equal(r({ spider: 'loxosceles', severe: 'yes', ageGroup: 'adult' }).bandLabel, 'Severe: 10 vials');
  assert.equal(r({ spider: 'latrodectus' }).bandLabel, 'Supportive, 24 h');
  assert.equal(r({ spider: 'phoneutria' }).valid, false);
});

// spec-v1729: a child's weight that was entered but is out of range read "weight:
// not entered". The prednisone line now says what is wrong; the vials still stand.
test('an out-of-range child weight is named in the prednisone line, not called "not entered"', () => {
  const base = { spider: 'loxosceles', moderate: 'yes', severe: 'no', ageGroup: 'child' };
  const notes = (w) => r({ ...base, weight: w }).notes.join(' ');
  assert.match(notes('1'), /no mg dose: The weight must be between 2 and 150 kg\. Check the value entered\./);
  assert.match(notes(''), /weight: not entered, so no mg dose/);
  assert.match(notes('20'), /Prednisone 20 mg a day/);
  assert.match(r({ ...base, weight: '1' }).band, /5 vials/);
});
