// spec-v1555 tool 5: the neostigmine trial doses, the mamba refusal, the response edge and the mL output.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { snakeNeostigmineTrial as r } from '../../lib/snake-neostigmine-trial-v1555.js';

const who = { protocol: 'who', ageGroup: 'adult', weight: '60', mamba: 'no', response: 'pending' };

test('WHO doses are weight-based and IM', () => {
  assert.match(r(who).band, /atropine 0\.6 mg IV, then neostigmine 1\.2 mg IM/);
  assert.match(r({ ...who, ageGroup: 'child', weight: '20' }).band, /atropine 1 mg IV, then neostigmine 0\.8 mg IM/);
});

test('India adult dose is flat and IV', () => {
  const x = r({ ...who, protocol: 'india', mamba: '' });
  assert.match(x.band, /neostigmine 1\.5 mg IV/);
  assert.ok(x.notes.some((n) => /weight is not used/.test(n)));
});

test('the mamba refusal', () => {
  assert.equal(r({ ...who, mamba: 'yes' }).bandLabel, 'Not after a mamba bite');
  assert.equal(r({ ...who, mamba: '' }).valid, false);
});

test('the 50% response edge', () => {
  const ind = { ...who, protocol: 'india' };
  assert.equal(r({ ...ind, response: 'ge50' }).bandLabel, 'Positive');
  assert.equal(r({ ...ind, response: 'lt50' }).bandLabel, 'Negative');
  assert.equal(r({ ...who, response: 'ge50' }).bandLabel, 'Convincing response');
  assert.equal(r({ ...who, response: 'none' }).bandLabel, 'No convincing response');
});

test('mL only at an entered concentration', () => {
  assert.ok(r({ ...who, neoConc: '0.5' }).notes.some((n) => /2\.4 mL at 0\.5 mg\/mL/.test(n)));
  assert.ok(r(who).notes.some((n) => /not entered, so its doses are in mg only/.test(n)));
  assert.equal(r({ ...who, neoConc: '0' }).valid, false);
});

test('refusals', () => {
  assert.equal(r({ ...who, protocol: '' }).valid, false);
  assert.equal(r({ ...who, weight: '' }).valid, false);
  assert.equal(r({ ...who, response: '' }).valid, false);
});
