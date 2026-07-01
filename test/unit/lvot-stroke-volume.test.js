// spec-v185 §2.4: Doppler stroke volume & cardiac output (LVOT-VTI). The LVOT
// diameter is guarded > 0 before the area/π computation.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lvotStrokeVolume } from '../../lib/gaps-v185.js';

test('tile example: normal stroke-volume index', () => {
  // area = π·1.1² = 3.801; SV = 3.801·22 = 83.6; CO = 83.6·70/1000 = 5.85; CI = 3.08
  const r = lvotStrokeVolume({ d: 2.2, vti: 22, hr: 70, bsa: 1.9 });
  assert.equal(r.valid, true);
  assert.equal(r.sv, 83.6);
  assert.equal(r.co, 5.85);
  assert.equal(r.ci, 3.08);
  assert.equal(r.bandLabel, 'Normal stroke-volume index');
});

test('low stroke-volume index bands as abnormal', () => {
  // small D and VTI -> low SV
  const r = lvotStrokeVolume({ d: 1.8, vti: 15, hr: 70, bsa: 2.0 });
  assert.ok(r.svi < 35, `SVI ${r.svi}`);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Low stroke-volume index');
});

test('area equals π·(D/2)²', () => {
  const r = lvotStrokeVolume({ d: 2.0, vti: 20, hr: 60, bsa: 1.8 });
  assert.equal(r.area, 3.14);
});

test('guards: diameter must be > 0; blanks fall back', () => {
  assert.equal(lvotStrokeVolume({ d: 0, vti: 20, hr: 70, bsa: 1.9 }).valid, false);
  assert.equal(lvotStrokeVolume({ vti: 20, hr: 70, bsa: 1.9 }).valid, false);
  assert.equal(lvotStrokeVolume({}).valid, false);
});
