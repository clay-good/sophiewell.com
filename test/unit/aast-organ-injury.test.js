// spec-v109 2.2: AAST 2018 Organ Injury Scale (Kozar 2018). Grade is the higher
// of the anatomic finding and the 2018 vascular rule.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aastOrganInjury } from '../../lib/traumaclass-v109.js';

test('no organ / no finding -> fallback', () => {
  assert.equal(aastOrganInjury({}).valid, false);
  assert.equal(aastOrganInjury({ organ: 'spleen' }).valid, false);
  assert.equal(aastOrganInjury({ organ: 'lung', finding: 3 }).valid, false);
});

test('anatomic finding sets the grade when no vascular injury', () => {
  const r = aastOrganInjury({ organ: 'liver', finding: 3, vascular: 'none' });
  assert.equal(r.grade, 3);
  assert.equal(r.gradeRoman, 'III');
  assert.equal(r.vascularSet, false);
});

test('band flip: contained vascular injury upgrades spleen II -> IV', () => {
  const base = aastOrganInjury({ organ: 'spleen', finding: 2, vascular: 'none' });
  assert.equal(base.grade, 2);
  const up = aastOrganInjury({ organ: 'spleen', finding: 2, vascular: 'contained' });
  assert.equal(up.grade, 4);
  assert.equal(up.gradeRoman, 'IV');
  assert.equal(up.vascularSet, true);
  assert.match(up.band, /2018 vascular-injury rule/);
});

test('active bleeding beyond raises spleen to V, liver/kidney to IV', () => {
  assert.equal(aastOrganInjury({ organ: 'spleen', finding: 1, vascular: 'beyond' }).grade, 5);
  assert.equal(aastOrganInjury({ organ: 'liver', finding: 1, vascular: 'beyond' }).grade, 4);
  assert.equal(aastOrganInjury({ organ: 'kidney', finding: 1, vascular: 'beyond' }).grade, 4);
});

test('a higher anatomic finding still wins over a lower vascular grade', () => {
  // kidney grade V anatomic, contained vascular (grade III) -> stays V
  const r = aastOrganInjury({ organ: 'kidney', finding: 5, vascular: 'contained' });
  assert.equal(r.grade, 5);
  assert.equal(r.vascularSet, false);
});
