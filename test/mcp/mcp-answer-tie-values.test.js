// answer_query hands back AMBIGUOUS when a query names two calculators equally well. The values can settle
// it: "nottingham grade" names the histologic grade and the Nottingham Prognostic Index alike, but only
// the grade reads tubules, pleomorphism and mitotic count (found October 17, 2026).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answerQuery } from '../../mcp/tools.js';

test('a name tie is settled by the calculator that reads the values', () => {
  const r = answerQuery({ query: 'nottingham grade tubule formation 1, pleomorphism 2, mitotic count score 3' });
  assert.equal(r.tile, 'nottingham-grade', JSON.stringify(r));
  assert.equal(r.inputs['nott-pleo'], '2');
  assert.equal(r.inputs['nott-mitoses'], '3');
});

test('a name tie with no values to read stays a question', () => {
  const r = answerQuery({ query: 'nottingham grade' });
  assert.equal(r.code, 'AMBIGUOUS');
  assert.deepEqual([...r.candidates].sort(), ['nottingham-grade', 'nottingham-prognostic-index']);
});

test('the other tied calculator wins when the values are its own', () => {
  const r = answerQuery({ query: 'nottingham grade tumor size 2.5 cm, histologic grade 2' });
  assert.equal(r.tile, 'nottingham-prognostic-index', JSON.stringify(r));
});

test('a calculator chosen on a value label\'s word gives way to the one that reads the values', () => {
  const r = answerQuery({ query: 'npi tumor size 2.5 cm, histologic grade 2' });
  assert.equal(r.tile, 'nottingham-prognostic-index', JSON.stringify(r));
  assert.equal(r.inputs['npi-size'], 2.5);
});
