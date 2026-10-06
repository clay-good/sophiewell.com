// spec-v1563 tool 4: Chagas stages, treat or not by age and stage, and dose rows at 40.0/40.1 kg.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chagasStageTreatment as r } from '../../lib/chagas-stage-treatment-v1563.js';

test('acute and congenital doses', () => {
  assert.match(r({ phase: 'acute', age: '10', weight: '40' }).band, /300-400 mg a day \(7\.5-10 mg\/kg\)/);
  assert.match(r({ phase: 'acute', age: '30', weight: '40.1' }).band, /201-281 mg a day \(5-7 mg\/kg\)/);
  assert.match(r({ phase: 'congenital', age: '0.1', weight: '3' }).band, /30 mg a day \(10 mg\/kg\)/);
});

test('chronic stages and decisions', () => {
  const c = { phase: 'chronic', ecg: 'normal', hf: 'none', lvef: '60', digestive: 'none', weight: '60' };
  assert.equal(r({ ...c, age: '30' }).bandLabel, 'Treat: benznidazole');
  assert.equal(r({ ...c, age: '55' }).bandLabel, 'Shared decision');
  assert.equal(r({ ...c, age: '30', ecg: 'abnormal' }).bandLabel, 'Shared decision');
  assert.equal(r({ ...c, age: '30', lvef: '50' }).bandLabel, 'Do not treat');
  assert.equal(r({ ...c, age: '30', hf: 'yes' }).bandLabel, 'Do not treat');
  assert.equal(r({ ...c, age: '30', digestive: 'advanced' }).bandLabel, 'Do not treat');
  assert.equal(r({ ...c, age: '10', weight: '30' }).bandLabel, 'Treat: benznidazole');
  assert.match(r({ ...c, age: '10', weight: '30' }).band, /225 mg a day \(7\.5 mg\/kg\)/);
  assert.equal(r({ ...c, age: '30', pregnant: 'yes' }).bandLabel, 'Pregnancy: specialist');
  assert.equal(r({ phase: 'chronic', age: '30', weight: '60' }).valid, false);
});
