// spec-v57 §2.11: FeverPAIN score.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feverpain } from '../../lib/scoring-v5.js';

test('4 of 5 -> high band (immediate/short delayed antibiotic)', () => {
  const r = feverpain({ fever: true, purulence: true, attendRapid: true, inflamedTonsils: true });
  assert.equal(r.total, 4); assert.match(r.band, /62-65/);
});
test('0 -> no antibiotic strategy', () => {
  const r = feverpain({});
  assert.equal(r.total, 0); assert.match(r.band, /no antibiotic/);
});
test('boundary 2 -> delayed band', () => {
  const r = feverpain({ fever: true, purulence: true });
  assert.equal(r.total, 2); assert.match(r.band, /delayed/);
});
test('all 5 -> 5', () => {
  assert.equal(feverpain({ fever: true, purulence: true, attendRapid: true, inflamedTonsils: true, noCough: true }).total, 5);
});
