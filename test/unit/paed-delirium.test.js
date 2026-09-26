// spec-v1499: the PAED emergence delirium scale.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { paedDelirium as p } from '../../lib/paed-delirium-v1499.js';

const EX = { eye: 'not', purposeful: 'little', aware: 'not', restless: 'very', inconsolable: 'quite' };

test('the worked example: 16 is delirium by both cutoffs', () => {
  const r = p(EX);
  assert.equal(r.total, 16);
  assert.equal(r.band, 'PAED 16: emergence delirium by both cutoffs in use (10 or more, and more than 12).');
});

test('the first three items score in reverse, and the two cutoffs are read apart', () => {
  assert.equal(p({ eye: 'extremely', purposeful: 'extremely', aware: 'extremely', restless: 'not', inconsolable: 'not' }).total, 0);
  const eleven = p({ eye: 'not', purposeful: 'not', aware: 'quite', restless: 'little', inconsolable: 'not' });
  assert.equal(eleven.total, 11);
  assert.equal(eleven.bandLabel, 'Delirium at 10 or more, not above 12');
});

test('a partial form below 10 does not reassure, and nothing rated is asked for', () => {
  const r = p({ eye: 'not', purposeful: 'not' });
  assert.equal(r.bandLabel, 'Below 10 so far (2 of 5 items)');
  assert.equal(r.abnormal, true);
  assert.match(r.notes[0], DISCLOSING);
  assert.match(p({}).message, ASKING);
});
