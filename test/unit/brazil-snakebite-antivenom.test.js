// spec-v1556 tool 1: Quadro 1 rows and vial counts, Bothrops mild on clotting alone, "at least".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brazilSnakebiteAntivenom as r } from '../../lib/brazil-snakebite-antivenom-v1556.js';

const b = { type: 'bothrops', local: 'none', bleeding: 'none', shock: 'no', renal: 'no', clotting: 'no' };

test('Bothrops', () => {
  assert.equal(r({ ...b, clotting: 'yes' }).bandLabel, 'Mild: 2-4 vials');
  assert.equal(r({ ...b, local: 'evident' }).bandLabel, 'Moderate: 4-8 vials');
  assert.equal(r({ ...b, shock: 'yes' }).bandLabel, 'Severe: 12 vials');
  assert.equal(r(b).bandLabel, 'Observe 6 hours');
  assert.equal(r({ type: 'bothrops', local: 'discreet' }).bandLabel, 'At least mild: 2-4 vials');
});

test('Lachesis, Crotalus, Micrurus', () => {
  const l = { type: 'lachesis', local: 'discreet', bleeding: 'none', vagal: 'no' };
  assert.equal(r(l).bandLabel, 'Moderate: 10 vials');
  assert.equal(r({ ...l, vagal: 'yes' }).bandLabel, 'Severe: 20 vials');
  const c = { type: 'crotalus', neuro: 'discreet', myo: 'none', oliguria: 'no' };
  assert.equal(r(c).bandLabel, 'Mild: 5 vials');
  assert.equal(r({ ...c, neuro: 'evident', myo: 'discreet' }).bandLabel, 'Moderate: 10 vials');
  assert.equal(r({ ...c, neuro: 'evident', myo: 'intense' }).bandLabel, 'Severe: 20 vials');
  assert.equal(r({ type: 'micrurus' }).bandLabel, '10 vials SAEla');
  assert.equal(r({}).valid, false);
});
