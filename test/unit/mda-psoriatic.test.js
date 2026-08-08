// spec-v672: Minimal Disease Activity (MDA) in psoriatic arthritis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mdaPsoriatic } from '../../lib/mda-psoriatic-v672.js';

const ALL = { tjc: true, sjc: true, skin: true, pain: true, global: true, haq: true, entheses: true };

test('all 7 met -> VLDA', () => {
  const r = mdaPsoriatic(ALL);
  assert.equal(r.count, 7);
  assert.equal(r.mda, true);
  assert.equal(r.vlda, true);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /VLDA/);
});

test('exactly 5 of 7 -> MDA but not VLDA', () => {
  const r = mdaPsoriatic({ ...ALL, haq: false, entheses: false });
  assert.equal(r.count, 5);
  assert.equal(r.mda, true);
  assert.equal(r.vlda, false);
  assert.equal(r.abnormal, false);
});

test('4 of 7 -> not in MDA (abnormal)', () => {
  const r = mdaPsoriatic({ ...ALL, haq: false, entheses: false, global: false });
  assert.equal(r.count, 4);
  assert.equal(r.mda, false);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /not in Minimal Disease Activity/);
});

test('none met -> 0/7, unmet lists all', () => {
  const r = mdaPsoriatic({});
  assert.equal(r.count, 0);
  assert.equal(r.mda, false);
  assert.equal(r.unmet.length, 7);
});

test('META example: 6 of 7 (entheses not met) -> MDA, not VLDA', () => {
  const r = mdaPsoriatic({ ...ALL, entheses: false });
  assert.equal(r.count, 6);
  assert.equal(r.mda, true);
  assert.equal(r.vlda, false);
  assert.match(r.detail, /entheseal points/);
});

test("'1' and 'on' count as met (form/MCP encodings)", () => {
  assert.equal(mdaPsoriatic({ tjc: '1', sjc: '1', skin: '1', pain: '1', global: 'on' }).count, 5);
});
