// spec-v173 §2.1: BIMS (Brief Interview for Mental Status, MDS 3.0 §C).
// Summary 0-15; bands 13-15 intact, 8-12 moderate, 0-7 severe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bims } from '../../lib/ltcga-v173.js';

const full = { repetition: 3, year: 3, month: 2, day: 1, recallSock: 2, recallBlue: 2, recallBed: 2 };

test('BIMS 15/15 (all max) -> cognitively intact', () => {
  const r = bims(full);
  assert.equal(r.valid, true);
  assert.equal(r.total, 15);
  assert.match(r.band, /cognitively intact/);
});

test('BIMS tile example = 13 -> cognitively intact (partial recall)', () => {
  const r = bims({ ...full, recallBed: 0 });
  assert.equal(r.total, 13);
  assert.match(r.band, /cognitively intact/);
});

test('BIMS 12 -> moderate (intact/moderate boundary, 13 vs 12)', () => {
  const r = bims({ repetition: 3, year: 3, month: 2, day: 1, recallSock: 2, recallBlue: 1, recallBed: 0 });
  assert.equal(r.total, 12);
  assert.match(r.band, /moderately impaired/);
});

test('BIMS 8 -> moderate and 7 -> severe (the moderate/severe band flip)', () => {
  const eight = bims({ repetition: 3, year: 3, month: 2, day: 0, recallSock: 0, recallBlue: 0, recallBed: 0 });
  assert.equal(eight.total, 8);
  assert.match(eight.band, /moderately impaired/);
  const seven = bims({ repetition: 3, year: 2, month: 2, day: 0, recallSock: 0, recallBlue: 0, recallBed: 0 });
  assert.equal(seven.total, 7);
  assert.match(seven.band, /severely impaired/);
});

test('BIMS rejects out-of-range and blank items', () => {
  assert.equal(bims({ ...full, year: 4 }).valid, false); // year max is 3
  assert.equal(bims({ ...full, month: 3 }).valid, false); // month max is 2
  assert.equal(bims({ ...full, recallSock: '' }).valid, false);
  assert.equal(bims({}).valid, false);
});
