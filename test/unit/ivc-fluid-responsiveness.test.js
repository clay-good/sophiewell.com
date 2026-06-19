// spec-v113 2.1: IVC collapsibility / distensibility index (Barbier 2004).
// distensibility = (Dmax - Dmin) / Dmin x 100 (mechanical, ~18% cutoff);
// collapsibility = (Dmax - Dmin) / Dmax x 100 (spontaneous). Denominator guarded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ivcFluidResponsiveness } from '../../lib/fluidresp-v113.js';

test('worked example: mechanical 2.0/1.6 cm is 25% distensibility, above ~18%', () => {
  const r = ivcFluidResponsiveness({ mode: 'mechanical', dmax: 2.0, dmin: 1.6 });
  assert.equal(r.valid, true);
  assert.equal(r.mode, 'distensibility');
  assert.equal(r.index, 25);
  assert.equal(r.responsive, true);
  assert.match(r.band, /IVC distensibility 25% \(Dmax 2 \/ Dmin 1.6 cm\)/);
});

test('a distensibility just under 18% is below the fluid-response threshold', () => {
  const r = ivcFluidResponsiveness({ mode: 'mechanical', dmax: 2.0, dmin: 1.75 }); // 14.3%
  assert.equal(r.responsive, false);
  assert.match(r.band, /below the cited fluid-response threshold/);
});

test('spontaneous mode uses the collapsibility (caval) index over Dmax', () => {
  const r = ivcFluidResponsiveness({ mode: 'spontaneous', dmax: 2.0, dmin: 1.0 }); // 50%
  assert.equal(r.mode, 'collapsibility');
  assert.equal(r.index, 50);
  assert.equal(r.responsive, true);
  assert.match(r.band, /IVC collapsibility 50%/);
});

test('denominator guarded per mode: Dmin 0 mechanical returns a fallback', () => {
  const r = ivcFluidResponsiveness({ mode: 'mechanical', dmax: 2.0, dmin: 0 });
  assert.equal(r.valid, false);
  assert.match(r.band, /minimum IVC diameter must be greater than 0/);
});

test('denominator guarded per mode: Dmax 0 spontaneous returns a fallback', () => {
  const r = ivcFluidResponsiveness({ mode: 'spontaneous', dmax: 0, dmin: 0 });
  assert.equal(r.valid, false);
  assert.match(r.band, /maximum IVC diameter must be greater than 0/);
});

test('partial input returns a complete-the-fields fallback', () => {
  assert.equal(ivcFluidResponsiveness({ mode: 'mechanical', dmax: 2 }).valid, false);
  assert.equal(ivcFluidResponsiveness({}).valid, false);
});
