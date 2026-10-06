// spec-v1563 tool 5: WHO dengue IV fluid ladder. Each group's steps at a weight, the child 7 vs 7.5 rows,
// the second-bolus line, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dengueFluidPlan as d } from '../../lib/dengue-fluid-plan-v1563.js';

test('warning signs: 5-7, then 3-5, then 2-3 mL/kg/h, the same for every age', () => {
  const r = d({ group: 'warning', ageGroup: 'adult', weight: '60' });
  assert.match(r.notes[0], /Step 1: 300-420 mL\/h \(5-7 mL\/kg\/h\) for 1 to 2 hours\./);
  assert.match(r.notes[1], /Step 2: 180-300 mL\/h/);
  assert.match(r.notes[2], /Step 3: 120-180 mL\/h \(2-3 mL\/kg\/h\) or less/);
  assert.match(r.notes.join(' '), /300-600 mL\/h \(5-10 mL\/kg\/h\)/);
  assert.match(r.notes.join(' '), /urine about 30 mL\/h/);
  assert.deepEqual(d({ group: 'warning', ageGroup: 'child', weight: '60' }).notes.slice(0, 3), r.notes.slice(0, 3));
});

test('compensated shock: adult 5-10 then 5-7, 3-5, 2-3; child 10-20 then 10, 7, 5, 3', () => {
  const a = d({ group: 'compensated', ageGroup: 'adult', weight: '50' });
  assert.match(a.band, /start at 250-500 mL\/h over 1 hour/);
  assert.equal(a.notes.filter((n) => n.startsWith('Step')).length, 4);
  const c = d({ group: 'compensated', ageGroup: 'child', weight: '20' });
  assert.match(c.notes[0], /Step 1: 200-400 mL\/h \(10-20 mL\/kg\/h\) over 1 hour/);
  assert.match(c.notes[2], /Step 3: 140 mL\/h \(7 mL\/kg\/h\) for 2 hours/);
  assert.match(c.notes[4], /Step 5: 60 mL\/h \(3 mL\/kg\/h\)/);
});

test('hypotensive shock: 20 mL/kg over 15-30 minutes, then the child colloid hour and the 7.5 row', () => {
  const c = d({ group: 'hypotensive', ageGroup: 'child', weight: '20' });
  assert.match(c.band, /start at 400 mL over 15 to 30 minutes/);
  assert.match(c.notes[1], /Step 2: 200 mL\/h \(10 mL\/kg\/h\) for 1 hour, colloid/);
  assert.match(c.notes[3], /Step 4: 150 mL\/h \(7\.5 mL\/kg\/h\) for 2 hours/);
  assert.match(c.notes.join(' '), /7 mL\/kg\/h after compensated shock and 7\.5 after hypotensive shock/);
  const a = d({ group: 'hypotensive', ageGroup: 'adult', weight: '60' });
  assert.match(a.notes.join(' '), /second bolus of 600-1,200 mL \(10-20 mL\/kg\) over 1 hour \(colloid/);
});

test('refusals', () => {
  assert.equal(d({ ageGroup: 'adult', weight: '60' }).valid, false);
  assert.equal(d({ group: 'warning', weight: '60' }).valid, false);
  assert.equal(d({ group: 'warning', ageGroup: 'adult' }).valid, false);
  assert.equal(d({ group: 'warning', ageGroup: 'adult', weight: '400' }).valid, false);
  assert.equal(d().valid, false);
});
