// spec-v1413: estimated FiO2 on nasal oxygen = 0.21 + 0.03 x L/min (Matthay 2024, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nasalO2Fio2 } from '../../lib/nasal-o2-fio2-v1413.js';

test('the Global ARDS estimate: 0.21 + 0.03 per L/min', () => {
  assert.equal(nasalO2Fio2({ flowLpm: 1 }).fio2, 0.24);
  assert.equal(nasalO2Fio2({ flowLpm: 3 }).fio2, 0.3);
  assert.equal(nasalO2Fio2({ flowLpm: 6 }).fio2, 0.39);
  assert.equal(nasalO2Fio2({ flowLpm: '2' }).percent, 27);
});

test('the answer says it is a convention and how far the measured value strays', () => {
  const r = nasalO2Fio2({ flowLpm: 4 });
  assert.equal(r.valid, true);
  assert.match(r.band, /0\.33 \(33%\) at 4 L\/min/);
  assert.match(r.notes[0], /0\.26 to 0\.54/);
  assert.match(r.notes[1], /above 97%/);
});

test('an estimate past 1.0 is refused, not clamped', () => {
  const r = nasalO2Fio2({ flowLpm: 30 });
  assert.equal(r.valid, false);
  assert.match(r.message, /passes 1\.0/);
  assert.equal(nasalO2Fio2({ flowLpm: 26 }).fio2, 0.99);
});

test('blank, zero, negative and non-numeric flows are refused', () => {
  assert.equal(nasalO2Fio2({}).valid, false);
  assert.equal(nasalO2Fio2({ flowLpm: '' }).valid, false);
  assert.match(nasalO2Fio2({ flowLpm: 0 }).message, /room air/);
  assert.equal(nasalO2Fio2({ flowLpm: -2 }).valid, false);
  assert.equal(nasalO2Fio2({ flowLpm: 'high' }).valid, false);
});
