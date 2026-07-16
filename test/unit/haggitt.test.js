// spec-v332: Haggitt classification of a malignant colorectal polyp (levels 0-4). Worked-example
// tests: each level and its invasion-depth description, the higher-risk flag on level 4, numeric /
// string input, and the invalid-level guard. Definitions transcribed from Haggitt 1985
// (Gastroenterology), cross-verified against Gastroenterology Research (Kuo 2020) / Pathology
// Outlines (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haggitt } from '../../lib/haggitt-v332.js';

test('level 4: invasion below the stalk, flagged higher-risk (the META example)', () => {
  const r = haggitt({ level: '4' });
  assert.equal(r.valid, true);
  assert.equal(r.level, '4');
  assert.equal(r.highRisk, true);
  assert.match(r.band, /below the stalk into the submucosa of the bowel wall/);
  assert.match(r.band, /ALL sessile polyps with invasive carcinoma are level 4/);
});

test('level 0 is carcinoma in situ / intramucosal with no metastatic potential', () => {
  const r = haggitt({ level: '0' });
  assert.equal(r.highRisk, false);
  assert.match(r.band, /limited to the mucosa/);
  assert.match(r.band, /no metastatic potential/);
});

test('levels 1-3 describe head / neck / stalk invasion and are not flagged higher-risk', () => {
  assert.match(haggitt({ level: '1' }).band, /head of the polyp/);
  assert.match(haggitt({ level: '2' }).band, /neck of the polyp/);
  assert.match(haggitt({ level: '3' }).band, /stalk of the polyp/);
  for (const l of ['0', '1', '2', '3']) {
    assert.equal(haggitt({ level: l }).highRisk, false, l);
  }
});

test('numeric input is accepted the same as string input', () => {
  assert.equal(haggitt({ level: 4 }).level, '4');
  assert.equal(haggitt({ level: 0 }).level, '0');
});

test('a missing or out-of-range level is invalid', () => {
  assert.equal(haggitt({}).valid, false);
  assert.equal(haggitt({ level: '5' }).valid, false);
  assert.equal(haggitt({ level: 'x' }).valid, false);
});
