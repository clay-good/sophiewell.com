// spec-v323: Siewert classification of esophagogastric-junction adenocarcinoma. Worked-
// example tests: each of the three types and its anatomic definition, roman + arabic input,
// and the invalid-type guard. Criteria transcribed from Siewert & Stein 1998 (Br J Surg),
// cross-verified across reviews reproducing the same GEJ-distance definitions (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { siewert } from '../../lib/siewert-v323.js';

test('type II: center 1 cm above to 2 cm below the GEJ (the META example)', () => {
  const r = siewert({ type: '2' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 2);
  assert.equal(r.class, 'II');
  assert.match(r.band, /within 1 cm above to 2 cm below the GEJ/);
  assert.match(r.band, /true carcinoma of the cardia/);
});

test('type I: center 1 to 5 cm above the GEJ, distal esophageal', () => {
  const r = siewert({ type: '1' });
  assert.equal(r.class, 'I');
  assert.match(r.band, /1 to 5 cm above the anatomic esophagogastric junction/);
  assert.match(r.band, /distal .*esophageal adenocarcinoma/);
});

test('type III: center 2 to 5 cm below the GEJ, subcardial gastric', () => {
  const r = siewert({ type: '3' });
  assert.equal(r.class, 'III');
  assert.match(r.band, /2 to 5 cm below the GEJ/);
  assert.match(r.band, /subcardial gastric carcinoma/);
});

test('roman-numeral input is accepted (case-insensitive)', () => {
  assert.equal(siewert({ type: 'II' }).type, 2);
  assert.equal(siewert({ type: 'iii' }).type, 3);
});

test('a missing or out-of-range type is invalid', () => {
  assert.equal(siewert({}).valid, false);
  assert.equal(siewert({ type: '4' }).valid, false);
  assert.equal(siewert({ type: 'X' }).valid, false);
});
