// spec-v1561 tool 7: IACS levels, the primary-care rule, ivermectin tablets and contraindications, MDA.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scabiesDiagnosisMda as r } from '../../lib/scabies-diagnosis-mda-v1561.js';

test('IACS levels', () => {
  assert.equal(r({ micro: 'yes' }).bandLabel, 'Confirmed scabies');
  assert.equal(r({ burrows: 'yes' }).bandLabel, 'Clinical scabies');
  assert.equal(r({ lesions: 'typical', itch: 'yes', contact: 'yes' }).bandLabel, 'Clinical scabies');
  assert.equal(r({ lesions: 'typical', itch: 'yes', contact: 'no', burrows: 'no' }).bandLabel, 'Suspected scabies');
  assert.equal(r({ lesions: 'atypical', itch: 'yes', contact: 'yes' }).bandLabel, 'Suspected scabies');
  assert.equal(r({ lesions: 'atypical', itch: 'yes', contact: 'no', burrows: 'no' }).bandLabel, 'Criteria not met');
  assert.equal(r({ lesions: 'atypical', itch: 'yes' }).bandLabel, 'Not decided');
  assert.equal(r({ lesions: 'typical', itch: 'no', contact: 'no', burrows: 'no', prevalence: '15' }).bandLabel, 'Primary-care diagnosis');
});

test('ivermectin', () => {
  const t = (kg) => r({ burrows: 'yes', weight: kg }).notes.find((n) => /^Ivermectin/.test(n));
  assert.match(t('15'), /^Ivermectin 1 x 3 mg tablet \(3 mg/);
  assert.match(t('16'), /^Ivermectin 2 x 3 mg/);
  assert.match(t('60'), /^Ivermectin 4 x 3 mg/);
  assert.ok(r({ burrows: 'yes', weight: '14' }).notes.some((n) => /No ivermectin \(under 15 kg\)/.test(n)));
  assert.ok(r({ burrows: 'yes', weight: '60', pregnant: 'yes' }).notes.some((n) => /No ivermectin \(pregnancy\)/.test(n)));
  assert.ok(r({ burrows: 'yes' }).notes.some((n) => /Weight: not entered/.test(n)));
});

test('MDA thresholds', () => {
  const m = (p) => r({ burrows: 'yes', prevalence: p }).notes.find((n) => /^Community/.test(n));
  assert.match(m('10'), /mass drug administration/);
  assert.match(m('5'), /local decision/);
  assert.match(m('1'), /no mass treatment/);
});
