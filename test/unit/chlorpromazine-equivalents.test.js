// spec-v166 2.2: antipsychotic chlorpromazine equivalents (Woods 2003 anchor
// table). CPZ-eq = daily dose × (100 / agent factor); the method is named.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chlorpromazineEquivalents } from '../../lib/pk-v166.js';

test('tile example: haloperidol 10 mg/day ≈ 500 mg CPZ', () => {
  const r = chlorpromazineEquivalents({ agent: 'haloperidol', dose: 10 });
  assert.equal(r.valid, true);
  assert.equal(r.cpzEq, 500); // 10 * 100/2
  assert.equal(r.factor, 2);
  assert.match(r.band, /Woods 2003/);
});

test('atypical conversions: olanzapine, quetiapine, aripiprazole', () => {
  assert.equal(chlorpromazineEquivalents({ agent: 'olanzapine', dose: 20 }).cpzEq, 400); // 20*100/5
  assert.equal(chlorpromazineEquivalents({ agent: 'quetiapine', dose: 600 }).cpzEq, 800); // 600*100/75
  assert.equal(chlorpromazineEquivalents({ agent: 'aripiprazole', dose: 15 }).cpzEq, 200); // 15*100/7.5
});

test('chlorpromazine itself is 1:1', () => {
  const r = chlorpromazineEquivalents({ agent: 'chlorpromazine', dose: 300 });
  assert.equal(r.cpzEq, 300);
});

test('guards: unknown agent (method not mixed), blank dose', () => {
  assert.equal(chlorpromazineEquivalents({ agent: 'clozapine', dose: 300 }).valid, false); // not in the Woods set
  assert.equal(chlorpromazineEquivalents({ agent: 'haloperidol' }).valid, false);
  assert.equal(chlorpromazineEquivalents({ dose: 10 }).valid, false);
  assert.equal(chlorpromazineEquivalents({}).valid, false);
});
