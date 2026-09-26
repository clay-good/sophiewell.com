// spec-v1511 tool 7: lenalidomide REMS fill window.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imidRemsFillWindow as w } from '../../lib/imid-rems-v1511.js';

test('authorization: 7 days from the pregnancy test, or 30 days from issue', () => {
  assert.equal(w({ category: 'frp', anchorDate: '2026-09-20', checkDate: '2026-09-27' }).allowed, true);
  assert.equal(w({ category: 'frp', anchorDate: '2026-09-20', checkDate: '2026-09-28' }).allowed, false);
  assert.equal(w({ category: 'other', anchorDate: '2026-09-01', checkDate: '2026-10-01' }).allowed, true);
  assert.equal(w({ category: 'other', anchorDate: '2026-09-01', checkDate: '2026-10-02' }).allowed, false);
});

test('a subsequent fill needs 7 or fewer days of therapy left', () => {
  const b = { category: 'other', anchorDate: '2026-09-20', checkDate: '2026-09-26', subsequent: 'yes' };
  assert.equal(w({ ...b, daysLeft: '7' }).allowed, true);
  assert.equal(w({ ...b, daysLeft: '8' }).allowed, false);
});

test('pregnancy tests weekly for 4 weeks, then every 4 or every 2 with irregular cycles', () => {
  const b = { category: 'frp', anchorDate: '2026-09-20', checkDate: '2026-09-26' };
  assert.match(w({ ...b, therapyStart: '2026-09-10' }).notes.join(' '), /weekly.*September 27, 2026/);
  assert.match(w({ ...b, therapyStart: '2026-06-01', cycles: 'irregular' }).notes.join(' '), /every 2 weeks.*October 4, 2026/);
  assert.match(w({ ...b, therapyStart: '2026-06-01', cycles: 'regular' }).notes.join(' '), /every 4 weeks.*October 18, 2026/);
});

test('blank inputs ask', () => {
  assert.equal(w({}).valid, false);
  assert.equal(w({ category: 'frp' }).valid, false);
});
