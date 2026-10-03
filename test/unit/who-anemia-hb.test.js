// spec-v1550 tool 1: WHO 2024 hemoglobin cutoffs. Every cutoff and severity edge by group (just below, at),
// elevation at 499/500 and 2,499/2,500 m, smoking at 19, 20 and more than 20, and the g/L-g/dL slip.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whoAnemiaHb as a, GROUPS } from '../../lib/who-anemia-hb-v1550.js';

const run = (group, hbGl, extra = {}) => a({ group, unit: 'gl', hb: String(hbGl), ...extra });

// WHO 2024 Tables 2 and 3, as read from the guideline: [group, cutoff, mild from, moderate from].
const TABLE = [
  ['c6-23', 105, 95, 70], ['c24-59', 110, 100, 70], ['c5-11', 115, 110, 80], ['g12-14', 120, 110, 80], ['b12-14', 120, 110, 80],
  ['women', 120, 110, 80], ['men', 130, 110, 80], ['preg1', 110, 100, 70], ['preg2', 105, 95, 70], ['preg3', 110, 100, 70],
];

test('every group\'s cutoff and severity edges, just below and at each one', () => {
  assert.equal(GROUPS.length, TABLE.length);
  for (const [grp, cut, mild, mod] of TABLE) {
    assert.equal(run(grp, cut).anemic, false, `${grp} at ${cut}`);
    assert.equal(run(grp, cut - 0.1).severity, 'mild', `${grp} just below ${cut}`);
    assert.equal(run(grp, mild).severity, 'mild', `${grp} at ${mild}`);
    assert.equal(run(grp, mild - 0.1).severity, 'moderate', `${grp} just below ${mild}`);
    assert.equal(run(grp, mod).severity, 'moderate', `${grp} at ${mod}`);
    assert.equal(run(grp, mod - 0.1).severity, 'severe', `${grp} just below ${mod}`);
  }
});

test('the integer ranges are compared at their lower edge: 104.5 g/L is mild in a child 6-23 months', () => {
  const r = run('c6-23', 104.5);
  assert.equal(r.severity, 'mild');
  assert.match(r.notes.join(' '), /a fraction never falls between rows/);
});

test('elevation is subtracted by Table 4 row, at 499/500 and 2,499/2,500 m, and blank is said', () => {
  assert.equal(run('women', 125, { elevation: '499' }).adjusted, 125);
  assert.equal(run('women', 125, { elevation: '500' }).adjusted, 121);
  assert.equal(run('women', 125, { elevation: '2499' }).adjusted, 111);
  const high = run('women', 125, { elevation: '2500' });
  assert.equal(high.adjusted, 107);
  assert.match(high.notes.join(' '), /may need tailoring/);
  assert.equal(run('women', 125, { elevation: '4999' }).adjusted, 92);
  assert.equal(run('women', 125, { elevation: '5000' }).valid, false);
  assert.match(run('women', 125).notes[0], /Elevation was not entered, so no elevation adjustment/);
});

test('smoking: 10-19 is 5, exactly 20 uses the formula (6.0, said why), more than 20 is 6; the two add to elevation', () => {
  assert.equal(run('men', 135, { smoking: '10-19' }).adjusted, 130);
  const twenty = run('men', 135, { smoking: '20' });
  assert.equal(twenty.adjusted, 129);
  assert.match(twenty.notes.join(' '), /Exactly 20 a day falls in no row/);
  assert.equal(run('men', 135, { smoking: 'gt20' }).adjusted, 129);
  assert.equal(run('men', 135, { smoking: 'unknown' }).adjusted, 132);
  assert.equal(run('men', 140, { smoking: 'gt20', elevation: '1200' }).adjusted, 126);
  assert.equal(run('men', 140, { smoking: 'gt20', elevation: '1200' }).severity, 'mild');
});

test('g/dL is read as g/L x 10, and the ten-fold slip is caught by name', () => {
  assert.equal(a({ group: 'women', unit: 'gdl', hb: '11.5' }).severity, 'mild');
  assert.match(a({ group: 'women', unit: 'gl', hb: '11.2' }).message, /11\.2 g\/L is not a hemoglobin a person could have\. Did you mean 11\.2 g\/dL\?/);
  assert.match(a({ group: 'women', unit: 'gdl', hb: '112' }).message, /Did you mean 112 g\/L\?/);
  assert.match(a({ group: 'women', unit: 'gl', hb: '118' }).band, /^Mild anemia: hemoglobin 118 g\/L \(11\.8 g\/dL\), below the cutoff of 120 g\/L \(12 g\/dL\)/);
});

test('nothing is answered from an empty or incomplete form', () => {
  assert.equal(a({}).valid, false);
  assert.equal(a({ group: 'women', unit: 'gl' }).valid, false);
  assert.equal(a({ unit: 'gl', hb: '90' }).valid, false, 'no group: no cutoff to compare with');
  assert.equal(a({ group: 'women', hb: '90' }).valid, false, 'no unit');
});
