// spec-v1554 tool 4: CrAg screening thresholds, the positive branches, adult and adolescent doses.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cragScreenFluconazole as r } from '../../lib/crag-screen-fluconazole-v1554.js';

test('thresholds', () => {
  assert.equal(r({ age: '35', cd4: '200', crag: 'neg' }).bandLabel, 'Not indicated');
  assert.equal(r({ age: '8', cd4: '50' }).bandLabel, 'Not under 10');
  assert.equal(r({ age: '35', cd4: '99', crag: 'na' }).bandLabel, 'Fluconazole prophylaxis');
  assert.equal(r({ age: '35', cd4: '150', crag: 'na' }).bandLabel, 'Consider prophylaxis');
  assert.equal(r({ age: '35', cd4: '150' }).valid, false);
});

test('positive branches and doses', () => {
  assert.equal(r({ age: '35', cd4: '80', crag: 'pos', meningitis: 'yes' }).bandLabel, 'Evaluate for meningitis');
  const a = r({ age: '35', cd4: '80', crag: 'pos', meningitis: 'no' });
  assert.ok(a.notes.some((n) => /800 to 1,200 mg/.test(n)));
  const t = r({ age: '16', cd4: '80', crag: 'pos', meningitis: 'no', weight: '45' });
  assert.ok(t.notes.some((n) => /= 540 mg a day for 2 weeks/.test(n)));
  assert.ok(t.notes.some((n) => /270 to 540 mg/.test(n)));
  assert.ok(r({ age: '16', cd4: '80', crag: 'pos', meningitis: 'no', weight: '80' }).notes.some((n) => /480 to 800 mg/.test(n)), 'consolidation capped at 800');
  assert.equal(r({ age: '16', cd4: '80', crag: 'pos', meningitis: 'no' }).valid, false);
  assert.equal(r({ age: '35', cd4: '80', crag: 'pos' }).valid, false);
});
