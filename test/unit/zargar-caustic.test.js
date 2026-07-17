// spec-v401: modified Zargar endoscopic classification of caustic esophagogastric injury (grades
// 0/1/2a/2b/3a/3b/4). Worked-example tests: representative grades and their endoscopic descriptions,
// numeric + roman-subgrade input, the ambiguous-bare-2/3 guard, and the invalid-grade guard. Grades
// transcribed from Zargar 1991 (Gastrointest Endosc) (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zargarCaustic } from '../../lib/zargar-caustic-v401.js';

test('grade 2b: deep or circumferential ulceration (the META example)', () => {
  const r = zargarCaustic({ grade: '2b' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, '2b');
  assert.match(r.band, /deep discrete or circumferential ulceration/);
});

test('grade 0 and 1: normal vs edema / hyperemia', () => {
  assert.match(zargarCaustic({ grade: '0' }).band, /normal mucosa/);
  const one = zargarCaustic({ grade: '1' });
  assert.equal(one.grade, '1');
  assert.match(one.band, /edema and hyperemia/);
});

test('grade 2a: superficial injury', () => {
  const r = zargarCaustic({ grade: '2a' });
  assert.equal(r.grade, '2a');
  assert.match(r.band, /superficial injury/);
});

test('grades 3a / 3b / 4: focal necrosis / extensive necrosis / perforation', () => {
  assert.match(zargarCaustic({ grade: '3a' }).band, /focal necrosis/);
  assert.match(zargarCaustic({ grade: '3b' }).band, /extensive necrosis/);
  assert.match(zargarCaustic({ grade: '4' }).band, /perforation/);
});

test('numeric and roman-subgrade input map to the grades', () => {
  assert.equal(zargarCaustic({ grade: 0 }).grade, '0');
  assert.equal(zargarCaustic({ grade: 4 }).grade, '4');
  assert.equal(zargarCaustic({ grade: 'IIb' }).grade, '2b');
  assert.equal(zargarCaustic({ grade: 'IIIa' }).grade, '3a');
});

test('a missing, ambiguous, or out-of-range grade is invalid', () => {
  assert.equal(zargarCaustic({}).valid, false);
  assert.equal(zargarCaustic({ grade: '2' }).valid, false);
  assert.equal(zargarCaustic({ grade: '3' }).valid, false);
  assert.equal(zargarCaustic({ grade: '5' }).valid, false);
});
