// spec-v1555 tool 2: antivenom indication. Systemic and local criteria, AFRO's species rule, the high-risk
// rule, and never "not indicated" with an unassessed systemic sign.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snakeAntivenomIndication as r } from '../../lib/snake-antivenom-indication-v1555.js';

const asiaNo = { region: 'asia', bleed: 'no', wbct: 'clots', lab: 'normal', neuro: 'no', cardio: 'no', aki: 'no', urine: 'no', half: 'no', digit: 'no', rapid: 'no', node: 'no' };
const afroNo = { region: 'africa', neuro: 'no', bleed: 'no', wbct: 'clots', cardio: 'no', half: 'no', rapid: 'no', digit: 'no' };

test('any one systemic sign indicates', () => {
  for (const k of ['bleed', 'neuro', 'cardio', 'aki', 'urine']) assert.equal(r({ ...asiaNo, [k]: 'yes' }).bandLabel, 'Indicated', k);
  assert.equal(r({ ...asiaNo, wbct: 'noclot' }).bandLabel, 'Indicated');
  assert.equal(r({ ...asiaNo, lab: 'abnormal' }).bandLabel, 'Indicated');
  assert.ok(r({ ...asiaNo, neuro: 'yes' }).notes.some((n) => /same dose as adults/.test(n)));
});

test('never "not indicated" with an unassessed systemic sign', () => {
  const { neuro, ...rest } = asiaNo;
  void neuro;
  const x = r(rest);
  assert.equal(x.bandLabel, 'Incomplete');
  assert.match(x.band, /neurotoxic signs/);
  assert.equal(r(asiaNo).bandLabel, 'Not indicated now');
  assert.equal(r({ region: 'asia' }).bandLabel, 'Incomplete');
});

test('AFRO local criteria count only for a necrotic species', () => {
  assert.equal(r({ ...afroNo, half: 'yes', necrotic: 'yes' }).bandLabel, 'Indicated');
  assert.equal(r({ ...afroNo, half: 'yes', necrotic: 'no' }).bandLabel, 'Not indicated now');
  assert.equal(r({ ...afroNo, half: 'yes' }).bandLabel, 'Not decided');
  assert.equal(r({ ...afroNo, lab: 'abnormal' }).bandLabel, 'Not indicated now', 'AFRO has no lab criterion');
});

test('SEARO high reaction risk: systemic only', () => {
  assert.equal(r({ ...asiaNo, half: 'yes', risk: 'yes' }).bandLabel, 'Not on local signs alone');
  assert.equal(r({ ...asiaNo, half: 'yes', risk: 'no' }).bandLabel, 'Indicated');
  assert.equal(r({ ...asiaNo, neuro: 'yes', risk: 'yes' }).bandLabel, 'Indicated');
});

test('refusal', () => {
  assert.equal(r({}).valid, false);
});
