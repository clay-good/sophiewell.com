// spec-v186 §2.2: PISA EROA & regurgitant volume. The peak-regurgitant-velocity
// divisor is guarded > 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pisaEroa } from '../../lib/specialtymath-v186.js';

test('tile example: severe mitral regurgitation', () => {
  // flow = 2π·0.81·40 = 203.6; EROA = 203.6/500 = 0.41; RVol = 0.41·120 = 48.9
  const r = pisaEroa({ r: 0.9, va: 40, vpeak: 500, vti: 120 });
  assert.equal(r.valid, true);
  assert.equal(r.eroa, 0.41);
  assert.equal(r.rvol, 48.9);
  assert.equal(r.bandLabel, 'Severe regurgitation');
});

test('a small orifice bands as mild', () => {
  const r = pisaEroa({ r: 0.4, va: 30, vpeak: 500, vti: 90 });
  assert.ok(r.eroa < 0.20, `EROA ${r.eroa}`);
  assert.equal(r.bandLabel, 'Mild regurgitation');
  assert.equal(r.abnormal, false);
});

test('EROA crosses the 0.40 severe threshold as the radius grows', () => {
  const moderate = pisaEroa({ r: 0.7, va: 40, vpeak: 500, vti: 100 });
  const severe = pisaEroa({ r: 0.9, va: 40, vpeak: 500, vti: 100 });
  assert.equal(moderate.bandLabel, 'Moderate regurgitation');
  assert.equal(severe.bandLabel, 'Severe regurgitation');
});

test('guards: peak velocity must be > 0; blanks fall back', () => {
  assert.equal(pisaEroa({ r: 0.9, va: 40, vpeak: 0, vti: 120 }).valid, false);
  assert.equal(pisaEroa({ r: 0.9, va: 40, vti: 120 }).valid, false);
  assert.equal(pisaEroa({}).valid, false);
});
