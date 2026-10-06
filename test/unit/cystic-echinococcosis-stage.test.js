// spec-v1562 tool 6: CE25 first-line rows at 4.9/5/10/10.1 cm, lung, inactive, CL and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cysticEchinococcosisStage as r } from '../../lib/cystic-echinococcosis-stage-v1562.js';

const b = { organ: 'liver', complicated: 'no', multiple: 'no', biliary: 'no', tier: '4' };
const L = (stage, diameter, x = {}) => r({ ...b, stage, diameter, ...x }).bandLabel;

test('liver rows and edges', () => {
  assert.equal(L('CE1', '4.9'), 'Albendazole');
  assert.equal(L('CE1', '5'), 'PAIR with albendazole');
  assert.equal(L('CE3a', '10'), 'PAIR with albendazole');
  assert.equal(L('CE3a', '10.1'), 'Percutaneous with albendazole');
  assert.equal(L('CE1', '7', { biliary: 'yes' }), 'No PAIR: individualized');
  assert.equal(L('CE2', '5'), 'Albendazole');
  assert.equal(L('CE3b', '5.1'), 'Surgery with albendazole');
  assert.equal(L('CE4', '6'), 'Watch and wait');
  assert.equal(L('CL', '3'), 'Not a CE stage');
  assert.equal(L('CE1', '3', { multiple: 'yes' }), 'Individualized');
  assert.equal(L('CE1', '3', { complicated: 'yes' }), 'Complicated: individualized');
});

test('lung, tier, dose', () => {
  assert.equal(L('CE1', '4', { organ: 'lung' }), 'Surgery');
  assert.equal(L('CE1', '6', { organ: 'lung' }), 'Individualized');
  assert.ok(r({ ...b, stage: 'CE1', diameter: '7', tier: '1' }).notes.some((n) => /refer from tier 1/.test(n)));
  assert.ok(r({ ...b, stage: 'CE1', diameter: '3', weight: '60' }).notes.some((n) => /300-400 mg twice a day/.test(n)));
  assert.equal(r({ ...b, stage: 'CE1', diameter: '3', complicated: '' }).valid, false);
});
