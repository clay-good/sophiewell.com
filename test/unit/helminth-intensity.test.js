// spec-v1562 tool 2: WHO intensity classes, every boundary, the "or more" reading and S. haematobium.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { helminthIntensity as r } from '../../lib/helminth-intensity-v1562.js';

const c = (parasite, eggs, extra = {}) => r({ parasite, eggs, ...extra }).bandLabel;

test('boundaries', () => {
  assert.equal(c('ascaris', '4999'), 'Light');
  assert.equal(c('ascaris', '5000'), 'Moderate');
  assert.equal(c('ascaris', '49999'), 'Moderate');
  assert.equal(c('ascaris', '50000'), 'Heavy');
  assert.equal(c('trichuris', '999'), 'Light');
  assert.equal(c('trichuris', '10000'), 'Heavy');
  assert.equal(c('hookworm', '1999'), 'Light');
  assert.equal(c('hookworm', '2000'), 'Moderate');
  assert.equal(c('hookworm', '4000'), 'Heavy');
  assert.equal(c('mansoni', '99'), 'Light');
  assert.equal(c('mansoni', '400'), 'Heavy');
  assert.equal(c('mansoni', '0'), 'No eggs');
});

test('S. haematobium', () => {
  assert.equal(c('haematobium', '50', { hematuria: 'no' }), 'Light');
  assert.equal(c('haematobium', '51', { hematuria: 'no' }), 'Heavy');
  assert.equal(c('haematobium', '5', { hematuria: 'yes' }), 'Heavy');
  assert.ok(r({ parasite: 'haematobium', eggs: '5' }).notes.some((n) => /not entered/.test(n)));
});

test('refusals', () => {
  assert.equal(r({ eggs: '5' }).valid, false);
  assert.equal(r({ parasite: 'ascaris' }).valid, false);
});
