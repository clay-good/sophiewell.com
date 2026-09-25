// spec-v1451: Raymond-Roy occlusion classification, derived from the angiogram (Beaman et al 2023).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raymondRoy as rr } from '../../lib/raymond-roy-v1451.js';

test('every class derives from what the angiogram shows', () => {
  const rows = [
    ['I', { filling: 'none' }, 'Raymond-Roy class I: complete aneurysm occlusion.'],
    ['II', { filling: 'neck' }, 'Raymond-Roy class II: residual aneurysm neck.'],
    ['IIIa', { filling: 'sac', location: 'interstices' }, 'Raymond-Roy class IIIa: residual aneurysm with contrast within the coil interstices.'],
    ['IIIb', { filling: 'sac', location: 'wall' }, 'Raymond-Roy class IIIb: residual aneurysm with contrast along the aneurysm wall.'],
  ];
  for (const [cls, input, band] of rows) {
    const r = rr(input);
    assert.equal(r.valid, true, cls);
    assert.equal(r.class, cls, cls);
    assert.equal(r.band, band, cls);
    assert.equal(r.abnormal, cls !== 'I', cls);
  }
});

test('a residual sac without a location is class III and asks for the subclass', () => {
  const r = rr({ filling: 'sac' });
  assert.equal(r.class, 'III');
  assert.ok(r.notes.some((n) => /^Choose where the residual contrast sits/.test(n)));
});

test('a location entered for class I or II is reported as unused, not applied', () => {
  const r = rr({ filling: 'neck', location: 'wall' });
  assert.equal(r.class, 'II');
  assert.match(r.notes[0], /applies only to a residual aneurysm/);
});

test('the IIIa vs IIIb outcome figures appear only for a subclassed residual', () => {
  const fig = (r) => r.notes.some((n) => /85\.11% vs 16\.67%/.test(n));
  assert.ok(fig(rr({ filling: 'sac', location: 'wall' })));
  assert.ok(fig(rr({ filling: 'sac', location: 'interstices' })));
  assert.ok(!fig(rr({ filling: 'sac' })));
  assert.ok(!fig(rr({ filling: 'none' })));
  assert.ok(rr({ filling: 'none' }).notes.some((n) => /flow-diverted/.test(n)));
});

test('a blank or unknown filling is asked for, never read as occluded', () => {
  assert.equal(rr({}).valid, false);
  assert.match(rr({}).message, /^Choose/);
  assert.equal(rr({ filling: '' }).valid, false);
  assert.equal(rr({ filling: 'partial' }).valid, false);
  assert.equal(rr(null).valid, false);
});
