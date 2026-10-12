// spec-v1635 tool 7: the leucovorin label's rescue table after high-dose methotrexate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hdmtxLeucovorinRescue, LABEL, MTX_LABEL, VORAXAZE_LABEL } from '../../lib/hdmtx-leucovorin-rescue-v1635.js';
import { labelRow } from '../../lib/label-row.js';
import { LABEL_EDITIONS } from '../../lib/label-editions.js';

const now = new Date('2026-10-11T12:00:00Z');
const h = (i, t) => hdmtxLeucovorinRescue({ levelUnit: 'micromolar', ...i }, now, t);
const dead = (id) => ({ ...LABEL_EDITIONS, [id]: { ...LABEL_EDITIONS[id], supersededOn: '2026-10-10' } });

test('the three label rows answer; a superseded leucovorin label withholds the table', () => {
  for (const l of [LABEL, MTX_LABEL, VORAXAZE_LABEL]) assert.equal(labelRow(l.setId, now).answers, true, l.name);
  const w = h({ hours: 24, level: 50 }, dead(LABEL.setId));
  assert.deepEqual([w.flag, w.row], ['withheld', undefined]);
  // The mg/L conversion rests on the methotrexate label; µmol/L does not.
  assert.equal(hdmtxLeucovorinRescue({ hours: 24, level: 4.5444, levelUnit: 'mg-l' }, now, dead(MTX_LABEL.setId)).flag, 'withheld');
  assert.equal(h({ hours: 24, level: 50 }, dead(MTX_LABEL.setId)).flag, 'delayed-early');
  // The glucarpidase pointer goes when its label is superseded; the table stays.
  assert.match(h({ hours: 24, level: 50 }).notes.join(' '), /VORAXAZE/);
  assert.doesNotMatch(h({ hours: 24, level: 50 }, dead(VORAXAZE_LABEL.setId)).notes.join(' '), /VORAXAZE/);
});

test('24 hours: 50 or more is the delayed early row, with 150 mg every 3 hours', () => {
  const r = h({ hours: 24, level: 50 });
  assert.deepEqual([r.flag, r.row, r.abnormal], ['delayed-early', 'early', true]);
  assert.match(r.notes[0], /150 mg intravenously every 3 hours until the methotrexate level is less than 1 µmol\/L, then 15 mg intravenously every 3 hours/);
  assert.equal(h({ hours: 24, level: 49.9 }).flag, 'no-row-24h');
});

test('24 hours: between about 10 and 50 is in no row and returns both neighbors', () => {
  const r = h({ hours: 24, level: 20 });
  assert.deepEqual([r.flag, r.row], ['no-row-24h', null]);
  assert.match(r.notes[0], /^Normal elimination row/);
  assert.match(r.notes[1], /^Delayed early elimination/);
  assert.match(r.band, /does not settle it/);
});

test('24 hours: a doubled creatinine alone is the delayed early row; an untested creatinine is not reassurance', () => {
  const d = h({ hours: 24, level: 8, baselineCreatinine: 0.5, currentCreatinine: 1 });
  assert.deepEqual([d.flag, d.creatinineRisePercent], ['delayed-early', 100]);
  assert.equal(h({ hours: 24, level: 8, baselineCreatinine: 0.5, currentCreatinine: 0.99 }).flag, 'normal');
  const u = h({ hours: 24, level: 8 });
  assert.deepEqual([u.flag, u.abnormal], ['normal-creatinine-not-entered', true]);
  assert.match(h({ hours: 24, level: 8, baselineCreatinine: 0.5 }).message, /^Enter both the baseline and the current serum creatinine/);
});

test('48 hours: 5 or more, 1 or less, and the gap between', () => {
  assert.deepEqual([h({ hours: 48, level: 5 }).flag, h({ hours: 48, level: 1 }).flag, h({ hours: 48, level: 3 }).flag], ['delayed-early', 'normal', 'no-row-48h']);
  // The creatinine criterion is stated at 24 hours; at 48 hours a doubling is reported, not classified.
  const r = h({ hours: 48, level: 1, baselineCreatinine: 0.5, currentCreatinine: 1.2 });
  assert.equal(r.flag, 'normal');
  assert.match(r.notes.join(' '), /states its creatinine criterion \(a 100% or greater rise\) at 24 hours/);
});

test('72 and 96 hours: delayed late needs both levels', () => {
  assert.equal(h({ hours: 72, level: 0.19 }).flag, 'normal');
  const half = h({ hours: 72, level: 0.3 });
  assert.deepEqual([half.flag, half.row], ['above-0.2-at-72h', null]);
  assert.equal(h({ hours: 72, level: 0.2 }).flag, 'no-row-72h');
  assert.equal(h({ hours: 96, level: 0.1 }).flag, 'needs-72h-level');
  assert.deepEqual((({ flag, row }) => [flag, row])(h({ hours: 96, level: 0.1, level72: 0.3 })), ['delayed-late', 'late']);
  assert.equal(h({ hours: 96, level: 0.1, level72: 0.1 }).flag, 'no-row-96h');
  assert.deepEqual((({ flag, abnormal }) => [flag, abnormal])(h({ hours: 96, level: 0.02 })), ['below-stop-level', false]);
  assert.equal(h({ hours: 96, level: 0.05 }).flag, 'at-stop-level');
});

test('a level at another hour is never classified: 36 hours gets the 24- and 48-hour thresholds', () => {
  const r = h({ hours: 36, level: 3 });
  assert.deepEqual([r.flag, r.row], ['between-time-points', null]);
  assert.match(r.notes[0], /at 24 hours the table reads about 10/);
  assert.match(r.notes[1], /at 48 hours it reads 1 µmol\/L/);
  assert.match(h({ hours: 12, level: 100 }).band, /before the label's first time point/);
  assert.match(h({ hours: 120, level: 0.3 }).band, /after the label's last time point/);
});

test('mg/L converts through the label molecular weight before it is classified', () => {
  const r = hdmtxLeucovorinRescue({ hours: 24, level: 4.5444, levelUnit: 'mg-l', baselineCreatinine: 0.8, currentCreatinine: 0.9 }, now);
  assert.deepEqual([r.levelMicromolar, r.flag], [10, 'normal']);
  assert.match(r.notes.join(' '), /4\.5444 mg\/L ÷ 0\.45444 = 10 µmol\/L/);
});

test('nothing is defaulted', () => {
  assert.match(hdmtxLeucovorinRescue({}, now).message, /^Choose the unit/);
  assert.match(h({ level: 5 }).message, /^Enter the hours since/);
  assert.match(h({ hours: 24 }).message, /^Enter the methotrexate level/);
  assert.equal(hdmtxLeucovorinRescue(null, now).valid, false);
});
