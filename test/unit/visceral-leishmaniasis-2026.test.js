// spec-v1563 tool 2: VL26 regimens by region and indication, miltefosine bands and exclusions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visceralLeishmaniasis2026 as r, miltefosineDaily as m } from '../../lib/visceral-leishmaniasis-2026-v1563.js';

test('miltefosine bands', () => {
  assert.equal(m(5.9), 20);
  assert.equal(m(6), 30);
  assert.equal(m(14.99), 50);
  assert.equal(m(29.9), 80);
  assert.equal(m(30), 100);
  assert.equal(m(45), 150);
});

test('eastern Africa primary VL', () => {
  const b = { region: 'eafrica', indication: 'primary', weight: '20', age: '10', pregnant: 'no', exclusion: 'no' };
  const x = r(b);
  assert.equal(x.bandLabel, 'Paromomycin plus miltefosine');
  assert.match(x.band, /400 mg IM .* miltefosine 70 mg a day \(35 mg twice a day\) for 14 days/);
  assert.equal(r({ ...b, age: '3' }).bandLabel, 'SSG plus paromomycin');
  assert.equal(r({ ...b, age: '51' }).bandLabel, 'SSG plus paromomycin');
  assert.equal(r({ ...b, pregnant: 'yes' }).bandLabel, 'SSG plus paromomycin');
});

test('relapse and PKDL', () => {
  assert.equal(r({ region: 'sea', indication: 'relapse', weight: '40', age: '30' }).bandLabel, 'Combination options');
  assert.equal(r({ region: 'sea', indication: 'relapse', weight: '40', age: '30', pregnant: 'yes' }).bandLabel, 'LAmB-based (no miltefosine)');
  assert.equal(r({ region: 'eafrica', indication: 'pkdl', weight: '50', age: '30' }).bandLabel, 'Paromomycin plus miltefosine');
  assert.equal(r({ region: 'eafrica', indication: 'pkdl', weight: '25', age: '9' }).bandLabel, 'LAmB plus miltefosine');
  assert.equal(r({ region: 'sea', indication: 'pkdl', weight: '50', age: '30' }).bandLabel, 'LAmB 30 mg/kg');
});

test('refusals', () => {
  assert.equal(r({ region: 'sea', indication: 'primary', weight: '40', age: '30' }).valid, false);
  assert.equal(r({ region: 'eafrica', indication: 'relapse', weight: '40', age: '30' }).valid, false);
  assert.equal(r({ region: 'eafrica', indication: 'primary', weight: '40', age: '30', hiv: 'yes' }).valid, false);
  assert.equal(r({ region: 'eafrica', indication: 'primary', age: '30' }).valid, false);
});
