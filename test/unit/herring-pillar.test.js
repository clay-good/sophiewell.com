// spec-v347: Herring lateral pillar classification of Legg-Calve-Perthes disease (groups A, B, B/C
// border, C). Worked-example tests: each group and its lateral-pillar-height description, the
// poorer-prognosis flag on the B/C-border and C groups, case-insensitive input plus the B/C -> BC
// alias, and the invalid-group guard. Definitions transcribed from Herring 1992 (J Pediatr Orthop)
// and Herring 2004 (JBJS Am, the B/C border), cross-verified against pediatric-orthopedic references
// (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { herringPillar } from '../../lib/herring-pillar-v347.js';

test('group C: lateral pillar < 50%, flagged poorer prognosis (the META example)', () => {
  const r = herringPillar({ group: 'C' });
  assert.equal(r.valid, true);
  assert.equal(r.group, 'C');
  assert.equal(r.poor, true);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /less than 50% of its original height/);
});

test('groups A and B are not flagged; A is uninvolved, B is > 50%', () => {
  assert.match(herringPillar({ group: 'A' }).band, /not involved/);
  assert.match(herringPillar({ group: 'B' }).band, /more than 50% of its original height/);
  for (const g of ['A', 'B']) {
    assert.equal(herringPillar({ group: g }).poor, false, g);
  }
});

test('the B/C border group is flagged and reports its full label', () => {
  const r = herringPillar({ group: 'BC' });
  assert.equal(r.poor, true);
  assert.equal(r.group, 'B/C border');
  assert.match(r.band, /narrow \(2-3 mm\) lateral pillar/);
});

test('case-insensitive input and the B/C -> BC alias map to the groups', () => {
  assert.equal(herringPillar({ group: 'c' }).group, 'C');
  assert.equal(herringPillar({ group: 'B/C' }).group, 'B/C border');
  assert.equal(herringPillar({ group: 'b/c border' }).group, 'B/C border');
  assert.equal(herringPillar({ group: 'a' }).group, 'A');
});

test('a missing or out-of-range group is invalid', () => {
  assert.equal(herringPillar({}).valid, false);
  assert.equal(herringPillar({ group: 'D' }).valid, false);
  assert.equal(herringPillar({ group: '5' }).valid, false);
});
