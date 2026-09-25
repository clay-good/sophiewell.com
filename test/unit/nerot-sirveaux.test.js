// spec-v1429: Nerot-Sirveaux scapular notching grade (Young, Cantrell & Hamid 2018).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nerotSirveaux as ns } from '../../lib/nerot-sirveaux-v1429.js';

test('each landmark reached gives its own grade', () => {
  const rows = [['pillar', 1], ['screw', 2], ['over', 3], ['under', 4]];
  for (const [extent, grade] of rows) {
    const r = ns({ extent });
    assert.equal(r.valid, true);
    assert.equal(r.grade, grade, extent);
    assert.equal(r.bandLabel, `Grade ${grade}`);
    assert.equal(r.abnormal, true);
  }
  assert.equal(ns({ extent: 'over' }).band, 'Nerot-Sirveaux grade 3 scapular notching: the erosion extends over the lower screw.');
});

test('no notch is not a grade 0', () => {
  const r = ns({ extent: 'none' });
  assert.equal(r.valid, true);
  assert.equal(r.grade, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /nothing to grade/);
});

test('mechanism note splits at grade 2 and 3', () => {
  assert.ok(ns({ extent: 'screw' }).notes.some((n) => /mechanical impingement/.test(n)));
  assert.ok(ns({ extent: 'over' }).notes.some((n) => /osteolysis/.test(n)));
  assert.ok(ns({ extent: 'under' }).notes.some((n) => /0\.86/.test(n)));
});

test('a non-tangential projection is flagged; a true AP is not', () => {
  assert.ok(ns({ extent: 'pillar', view: 'other' }).notes.some((n) => /understated/.test(n)));
  assert.ok(ns({ extent: 'none', view: 'other' }).notes.some((n) => /understated/.test(n)));
  assert.ok(!ns({ extent: 'pillar', view: 'true' }).notes.some((n) => /understated/.test(n)));
});

test('missing or unknown extent is asked for', () => {
  assert.equal(ns({}).valid, false);
  assert.equal(ns().valid, false);
  assert.equal(ns({ extent: 'grade5' }).valid, false);
  assert.match(ns({ view: 'true' }).message, /notch reaches/);
});
