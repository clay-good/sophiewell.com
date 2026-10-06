// spec-v1556 tool 5: Quadro 5 rows.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brazilLonomiaAntivenom as r } from '../../lib/brazil-lonomia-antivenom-v1556.js';

test('rows', () => {
  assert.equal(r({ clotting: 'normal', bleeding: 'none' }).bandLabel, 'Mild: observe 24 h');
  assert.equal(r({ clotting: 'abnormal', bleeding: 'skin' }).bandLabel, 'Moderate: 5 vials');
  assert.equal(r({ clotting: 'abnormal', bleeding: 'internal' }).bandLabel, 'Severe: 10 vials');
  assert.equal(r({ clotting: 'normal', bleeding: 'skin' }).bandLabel, 'Repeat the clotting test');
  assert.equal(r({ bleeding: 'none' }).valid, false);
});
