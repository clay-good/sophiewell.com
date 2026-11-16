// spec-v1554 tool 5: the infant HIV test schedule. Each step of Fig. 2.7 and the final-test rule.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { infantHivTestSchedule as r } from '../../lib/infant-hiv-test-schedule-v1554.js';

test('the NAT steps', () => {
  assert.equal(r({ age: '1', feeding: 'never', nat6: 'notdone', nat9: 'notdone' }).bandLabel, 'NAT at 4-6 weeks');
  assert.match(r({ age: '20', feeding: 'never', nat6: 'neg', nat9: 'notdone' }).band, /at 39 weeks of age, in 19 weeks/);
  assert.match(r({ age: '45', feeding: 'never', nat6: 'neg', nat9: 'notdone' }).band, /NAT now/);
  assert.equal(r({ age: '20', feeding: 'never', nat6: 'pos', nat9: 'notdone' }).bandLabel, 'Start ART, confirm');
});

test('the final antibody test: 18 months or 3 months after weaning, whichever is later', () => {
  assert.match(r({ age: '40', feeding: 'never', nat6: 'neg', nat9: 'neg' }).band, /at 78 weeks/);
  assert.match(r({ age: '40', feeding: 'stopped', stoppedAt: '30', nat6: 'neg', nat9: 'neg' }).band, /at 78 weeks/);
  assert.match(r({ age: '80', feeding: 'stopped', stoppedAt: '70', nat6: 'neg', nat9: 'neg' }).band, /at 83 weeks.*3 months after/);
  assert.equal(r({ age: '40', feeding: 'ongoing', nat6: 'neg', nat9: 'neg' }).bandLabel, 'Final test after weaning');
  assert.equal(r({ age: '90', feeding: 'never', nat6: 'neg', nat9: 'neg' }).bandLabel, 'Final antibody test now');
});

test('refusals', () => {
  assert.equal(r({ feeding: 'never', nat6: 'neg', nat9: 'neg' }).valid, false);
  assert.equal(r({ age: '40', feeding: 'stopped', nat6: 'neg', nat9: 'neg' }).valid, false);
  assert.equal(r({ age: '40', feeding: 'stopped', stoppedAt: '50', nat6: 'neg', nat9: 'neg' }).valid, false);
  assert.equal(r({ age: '40', feeding: 'never', nat6: 'neg' }).valid, false);
});

// spec-v1744: the adapter declared 0-260 weeks; the page passed 2600 through (unused) and answered.
test('spec-v1744: an age breastfeeding stopped outside 0-260 weeks is refused', () => {
  const ex = { age: '20', feeding: 'never', nat6: 'neg', nat9: 'notdone' };
  assert.equal(r(ex).bandLabel, 'NAT at 9 months');
  for (const stoppedAt of ['2600', '261', '-1']) {
    assert.equal(r({ ...ex, stoppedAt }).valid, false, stoppedAt);
    assert.match(r({ ...ex, stoppedAt }).message, /age when breastfeeding stopped must be between 0 and 260/);
  }
  assert.equal(r({ ...ex, stoppedAt: '0' }).valid, true);
  assert.equal(r({ ...ex, stoppedAt: '260' }).valid, true);
  assert.equal(r({ ...ex, age: '260', feeding: 'stopped', stoppedAt: '260' }).valid, true);
});
