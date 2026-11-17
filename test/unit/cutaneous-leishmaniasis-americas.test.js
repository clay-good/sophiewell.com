// spec-v1563 tool 3: PAHO local vs systemic, each criterion failing alone, the two size tests, special cases.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cutaneousLeishmaniasisAmericas as r } from '../../lib/cutaneous-leishmaniasis-americas-v1563.js';

const ok = { lesions: '2', diameter: '2.5', area: '500', site: 'no', immuno: 'no', followUp: 'yes', weight: '70' };

test('local criteria, each failing alone', () => {
  assert.equal(r(ok).bandLabel, 'Local treatment');
  assert.equal(r({ ...ok, lesions: '4' }).bandLabel, 'Systemic treatment');
  assert.equal(r({ ...ok, diameter: '3.1' }).bandLabel, 'Systemic treatment');
  assert.equal(r({ ...ok, area: '901' }).bandLabel, 'Systemic treatment');
  assert.equal(r({ ...ok, diameter: '3', area: '707' }).bandLabel, 'Local treatment');
  assert.equal(r({ ...ok, site: 'yes' }).bandLabel, 'Systemic treatment');
  assert.equal(r({ ...ok, immuno: 'yes' }).bandLabel, 'Systemic treatment');
  assert.equal(r({ ...ok, followUp: 'no' }).bandLabel, 'Systemic treatment');
});

test('systemic doses and the antimony cap', () => {
  const s = r({ ...ok, lesions: '5' });
  assert.match(s.band, /miltefosine 150 mg a day/);
  assert.match(s.band, /antimony 1,215 mg Sb a day .* capped at 1,215 mg/);
  assert.ok(s.notes.some((n) => /daily total/.test(n)));
});

test('special cases and refusals', () => {
  assert.equal(r({ ...ok, pregnant: 'yes' }).bandLabel, 'Thermotherapy or LAmB');
  assert.equal(r({ ...ok, lesions: '5', pregnant: 'yes' }).bandLabel, 'Liposomal amphotericin B');
  assert.equal(r({ ...ok, ecg: 'yes', lesions: '5' }).bandLabel, 'Miltefosine or LAmB');
  assert.equal(r({ ...ok, site: '' }).valid, false);
  assert.equal(r({ diameter: '2' }).valid, false);
});

test('spec-v1755: a fractional lesion count is refused; whole counts and the worked example answer', () => {
  const x = r({ ...ok, lesions: '2.5' });
  assert.equal(x.valid, false);
  assert.match(x.message, /whole number/);
  assert.equal(r({ ...ok, lesions: '3' }).bandLabel, 'Local treatment');
  assert.equal(r(ok).bandLabel, 'Local treatment');
});
