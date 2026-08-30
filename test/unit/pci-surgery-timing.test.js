import test from 'node:test';
import assert from 'node:assert/strict';
import { pciSurgeryTiming as p, PROCEDURES } from '../../lib/pci-surgery-timing-v898.js';

test('pci-surgery-timing: the published intervals', () => {
  assert.deepEqual(PROCEDURES.map((x) => [x.value, x.minDays, x.considerDays]), [
    ['des', 180, 90],
    ['bms', 30, null],
    ['balloon', 14, null],
  ]);
});

test('pci-surgery-timing: each procedure is read against its own minimum', () => {
  for (const row of PROCEDURES) {
    assert.equal(p({ procedure: row.value, daysSince: row.minDays }).met, true, row.value);
    assert.equal(p({ procedure: row.value, daysSince: row.minDays - 1 }).met, false, row.value);
  }
  // The reason the tile exists: the same 40 days reads two ways.
  assert.equal(p({ procedure: 'bms', daysSince: 40 }).status, 'past-minimum');
  assert.equal(p({ procedure: 'des', daysSince: 40 }).status, 'before-minimum');
  assert.match(p({ procedure: 'des', daysSince: 40 }).typeMattersNote, /factor of twelve/);
});

test('pci-surgery-timing: the drug-eluting consider window is its own status', () => {
  const inWindow = p({ procedure: 'des', daysSince: 120 });
  assert.equal(inWindow.status, 'consider-window');
  assert.equal(inWindow.met, false);
  assert.equal(inWindow.shortBy, 60);
  assert.match(inWindow.band, /judgment, not a green light/);
  assert.match(inWindow.judgmentNote, /shared decision with cardiology and surgery/);
  // The boundaries of the window.
  assert.equal(p({ procedure: 'des', daysSince: 90 }).status, 'consider-window');
  assert.equal(p({ procedure: 'des', daysSince: 89 }).status, 'before-minimum');
  assert.equal(p({ procedure: 'des', daysSince: 180 }).status, 'past-minimum');
  // No such window for the other two.
  assert.equal(p({ procedure: 'bms', daysSince: 20 }).status, 'before-minimum');
  assert.equal(p({ procedure: 'bms', daysSince: 20 }).judgmentNote, null);
});

test('pci-surgery-timing: urgent surgery is not governed by the intervals', () => {
  const r = p({ procedure: 'des', daysSince: 10, urgentOrEmergency: true });
  assert.equal(r.status, 'urgent');
  assert.equal(r.abnormal, false);
  assert.match(r.band, /not delayed by these intervals/);
  assert.match(r.band, /made with cardiology/);
  assert.equal(r.urgencyNote, null);
  // Otherwise the caveat is stated.
  assert.match(p({ procedure: 'des', daysSince: 200 }).urgencyNote, /Urgent and emergency operations are not delayed/);
});

test('pci-surgery-timing: the antiplatelet question is kept separate, on every result', () => {
  for (const input of [{ procedure: 'des' }, { procedure: 'bms', daysSince: 40 }, { procedure: 'des', daysSince: 10, urgentOrEmergency: true }]) {
    assert.match(p(input).antiplateletNote, /not whether to stop the antiplatelet/);
    assert.match(p(input).antiplateletNote, /stopping both agents early is the exposure/);
    assert.match(p(input).typeMattersNote, /factor of twelve/);
  }
});

test('pci-surgery-timing: with no interval it states the minimum and asks for one', () => {
  const r = p({ procedure: 'des' });
  assert.equal(r.status, 'no-interval');
  assert.match(r.band, /at least 180 days/);
  assert.match(r.band, /after 90 days considered/);
  assert.match(p({ procedure: 'bms' }).band, /at least 30 days/);
});

test('pci-surgery-timing: unknown values fall back, and the range is checked', () => {
  assert.equal(p({ procedure: 'made-up' }).procedure, 'des');
  assert.equal(p({ daysSince: -1 }).valid, false);
  assert.equal(p({ daysSince: 3651 }).valid, false);
});

test('pci-surgery-timing: the documented example', () => {
  const r = p({ procedure: 'des', daysSince: '120' });
  assert.equal(r.status, 'consider-window');
  assert.equal(r.shortBy, 60);
});
