// spec-v366: anatomic zones of the neck for penetrating trauma (Zones I-III). Worked-example tests:
// each zone and its boundary/structures description, roman + numeric + case-insensitive input, and the
// invalid-zone guard. Boundaries transcribed from Roon & Christensen 1979 / StatPearls (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neckZone } from '../../lib/neck-zone-v366.js';

test('Zone II: cricoid to the angle of the mandible (the META example)', () => {
  const r = neckZone({ zone: 'II' });
  assert.equal(r.valid, true);
  assert.equal(r.zone, 'II');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /cricoid cartilage to the angle of the mandible/);
  assert.match(r.band, /most surgically accessible/);
});

test('Zone I is the thoracic-outlet zone; Zone III is the skull-base zone', () => {
  assert.match(neckZone({ zone: 'I' }).band, /sternal notch \/ clavicles to the cricoid/);
  assert.match(neckZone({ zone: 'I' }).band, /upper thoracic injury/);
  assert.match(neckZone({ zone: 'III' }).band, /angle of the mandible to the base of the skull/);
  assert.match(neckZone({ zone: 'III' }).band, /head injury/);
});

test('no zone is flagged abnormal (anatomic descriptor)', () => {
  for (const z of ['I', 'II', 'III']) {
    assert.equal(neckZone({ zone: z }).abnormal, false, z);
  }
});

test('roman and numeric, case-insensitive input map to the zones', () => {
  assert.equal(neckZone({ zone: 2 }).zone, 'II');
  assert.equal(neckZone({ zone: '3' }).zone, 'III');
  assert.equal(neckZone({ zone: 'i' }).zone, 'I');
});

test('a missing or out-of-range zone is invalid', () => {
  assert.equal(neckZone({}).valid, false);
  assert.equal(neckZone({ zone: 'IV' }).valid, false);
  assert.equal(neckZone({ zone: '0' }).valid, false);
});
