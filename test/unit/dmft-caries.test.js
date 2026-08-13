// spec-v716: DMFT caries index.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { dmftCaries } from '../../lib/dmft-caries-v716.js';

test('DMFT = D + M + F', () => {
  const r = dmftCaries({ decayed: '3', missing: '1', filled: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.score, 6);
});

test('worked example DMFT 6 -> high severity level', () => {
  const r = dmftCaries({ decayed: '3', missing: '1', filled: '2' });
  assert.equal(r.severityLevel, 'high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /DMFT 6/);
});

test('caries-free -> 0, very low', () => {
  const r = dmftCaries({ decayed: '0', missing: '0', filled: '0' });
  assert.equal(r.score, 0);
  assert.equal(r.severityLevel, 'very low');
  assert.equal(r.abnormal, false);
});

test('severity levels: 1.1 very low, 2.6 low, 4.4 moderate, 6.5 high, 6.6 very high', () => {
  assert.equal(dmftCaries({ decayed: '1', missing: '0', filled: '0' }).severityLevel, 'very low'); // 1
  assert.equal(dmftCaries({ decayed: '2', missing: '0', filled: '0' }).severityLevel, 'low');       // 2
  assert.equal(dmftCaries({ decayed: '4', missing: '0', filled: '0' }).severityLevel, 'moderate');  // 4
  assert.equal(dmftCaries({ decayed: '5', missing: '0', filled: '0' }).severityLevel, 'high');      // 5
  assert.equal(dmftCaries({ decayed: '7', missing: '0', filled: '0' }).severityLevel, 'very high'); // 7
});

test('inputs validated; D+M+F cannot exceed 32', () => {
  assert.equal(dmftCaries({}).valid, false);
  assert.equal(dmftCaries({}).code, 'MISSING_INPUT');
  assert.equal(dmftCaries({ decayed: '3', missing: '1' }).field, 'filled');
  const over = dmftCaries({ decayed: '20', missing: '10', filled: '10' }); // 40
  assert.equal(over.valid, false);
  assert.equal(over.code, 'INVALID_INPUT');
});
