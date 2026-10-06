// spec-v1560 tool 2: diphtheria antitoxin by disease (WHO 2024), the macrolide by weight, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { diphtheriaAntitoxinDose as d } from '../../lib/diphtheria-antitoxin-dose-v1560.js';

const B = { site: 'throat', duration: 'lt48', neck: 'no', severe: 'no' };

test('20,000 / 40,000 / 80,000 IU by site, time and severity', () => {
  assert.equal(d(B).bandLabel, '20,000 IU');
  assert.equal(d({ ...B, site: 'nose' }).bandLabel, '40,000 IU');
  for (const v of [{ duration: 'ge48' }, { neck: 'yes' }, { severe: 'yes' }]) assert.equal(d({ ...B, ...v }).bandLabel, '80,000 IU');
  assert.match(d({ ...B, neck: 'yes', severe: 'yes' }).band, /diffuse neck swelling, severe disease/);
});

test('macrolide doses by weight, capped at 500 mg', () => {
  assert.match(d({ ...B, weight: '20' }).notes.join(' '), /azithromycin 200-240 mg once a day .* erythromycin 200-300 mg every 6 hours/);
  assert.match(d({ ...B, weight: '45' }).notes.join(' '), /azithromycin 450-500 mg/);
  assert.match(d({ ...B, weight: '70' }).notes.join(' '), /500 mg once a day \(the adult dose\)/);
  assert.match(d(B).notes.join(' '), /No weight was entered/);
});

test('refusals', () => {
  for (const k of Object.keys(B)) assert.equal(d({ ...B, [k]: '' }).valid, false, k);
});
