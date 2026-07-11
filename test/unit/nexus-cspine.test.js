// NEXUS low-risk cervical-spine criteria (Hoffman JR et al. NEJM 2000), extracted
// from the group-i renderer into a pure lib fn. Imaging is NOT required only when
// ALL FIVE low-risk criteria are met.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nexusCspine } from '../../lib/field.js';

const ALL = {
  noTenderness: true,
  noIntoxication: true,
  normalAlertness: true,
  noFocalDeficit: true,
  noDistractingInjury: true,
};

test('all five low-risk criteria met -> imaging not required', () => {
  const r = nexusCspine(ALL);
  assert.equal(r.criteriaMet, 5);
  assert.equal(r.allLowRiskMet, true);
  assert.equal(r.imagingRequired, false);
  assert.equal(r.band, 'NEXUS: cervical spine imaging NOT required');
});

test('any single unmet criterion -> imaging required', () => {
  for (const k of Object.keys(ALL)) {
    const r = nexusCspine({ ...ALL, [k]: false });
    assert.equal(r.allLowRiskMet, false, `${k} unmet should require imaging`);
    assert.equal(r.imagingRequired, true);
    assert.equal(r.criteriaMet, 4);
    assert.equal(r.band, 'NEXUS: imaging IS required (one or more criteria not met)');
  }
});

test('no criteria met -> imaging required, count 0', () => {
  const r = nexusCspine({});
  assert.equal(r.criteriaMet, 0);
  assert.equal(r.imagingRequired, true);
});

test('truthy non-boolean inputs are coerced (DOM checkbox / MCP toBool parity)', () => {
  const r = nexusCspine({
    noTenderness: 1,
    noIntoxication: '1',
    normalAlertness: true,
    noFocalDeficit: 'yes',
    noDistractingInjury: {},
  });
  assert.equal(r.criteriaMet, 5);
  assert.equal(r.allLowRiskMet, true);
});
