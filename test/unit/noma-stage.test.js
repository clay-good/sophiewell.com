// spec-v1561 tool 9: noma stages, reversibility and urgency, and "at least".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nomaStage as r } from '../../lib/noma-stage-v1561.js';

const no = { gingivitis: 'no', ang: 'no', edema: 'no', gangrene: 'no', scarring: 'no', sequelae: 'no' };

test('stages and urgency', () => {
  assert.equal(r({ ...no, gingivitis: 'yes' }).bandLabel, 'Warning sign');
  assert.equal(r({ ...no, ang: 'yes' }).bandLabel, 'Stage 1');
  const e = r({ ...no, edema: 'yes' });
  assert.equal(e.bandLabel, 'Stage 2');
  assert.ok(e.notes.some((n) => /refer immediately/.test(n)));
  assert.ok(e.notes.some((n) => /reversible/.test(n)));
  assert.ok(r({ ...no, gangrene: 'yes' }).notes.some((n) => /Irreversible/.test(n)));
  assert.ok(r({ ...no, scarring: 'yes' }).notes.some((n) => /refer immediately/.test(n)));
  assert.ok(r({ ...no, sequelae: 'yes' }).notes.some((n) => /reconstruction/.test(n)));
  assert.equal(r(no).bandLabel, 'No noma');
});

test('unassessed and refusal', () => {
  assert.equal(r({ ang: 'yes' }).bandLabel, 'At least stage 1');
  assert.equal(r({ ang: 'no' }).bandLabel, 'Not staged');
  assert.equal(r({}).valid, false);
});
