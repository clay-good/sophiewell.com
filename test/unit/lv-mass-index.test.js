// spec-v158 2.1: LV mass (Devereux), LVMI, RWT, and the four-pattern geometry
// classification. The geometry map combines the RWT 0.42 cutoff with the
// sex-specific LVMI upper-normal limit; every combination resolves to exactly
// one pattern.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lvMassIndex } from '../../lib/echo-v158.js';

test('tile example: concentric hypertrophy (elevated LVMI + high RWT)', () => {
  const r = lvMassIndex({ lvidd: 5.2, pwtd: 1.2, ivsd: 1.2, bsa: 2.0, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.mass, 248.8);
  assert.equal(r.lvmi, 124.4);
  assert.equal(r.rwt, 0.46);
  assert.equal(r.pattern, 'Concentric hypertrophy');
  assert.equal(r.abnormal, true);
});

test('Devereux formula matches the worked cube by hand', () => {
  // sum = 6.5; 6.5^3 - 4.7^3 = 274.625 - 103.823 = 170.802
  // mass = 0.8*(1.04*170.802)+0.6 = 142.71 -> 142.7 g
  const r = lvMassIndex({ lvidd: 4.7, pwtd: 0.9, ivsd: 0.9, bsa: 1.9, sex: 'male' });
  assert.equal(r.mass, 142.7);
  assert.equal(r.rwt, 0.38); // 2*0.9/4.7 = 0.383
});

test('geometry-pattern flip across the RWT 0.42 cutoff (normal LVMI)', () => {
  // Normal LVMI, RWT just above 0.42 -> concentric remodeling.
  const remodel = lvMassIndex({ lvidd: 4.0, pwtd: 0.9, ivsd: 0.9, bsa: 1.9, sex: 'male' });
  assert.equal(remodel.rwt, 0.45);
  assert.equal(remodel.pattern, 'Concentric remodeling');
  // Normal LVMI, RWT at/below 0.42 -> normal geometry.
  const normal = lvMassIndex({ lvidd: 5.0, pwtd: 0.9, ivsd: 0.9, bsa: 1.9, sex: 'male' });
  assert.ok(normal.rwt <= 0.42);
  assert.equal(normal.pattern, 'Normal geometry');
  assert.equal(normal.abnormal, false);
});

test('sex-specific LVMI cutoff: same LVMI, different pattern by sex', () => {
  // Build an LVMI between 95 and 115 with low RWT: elevated for women, normal for men.
  const dims = { lvidd: 5.0, pwtd: 0.95, ivsd: 0.95, bsa: 1.7 };
  const man = lvMassIndex({ ...dims, sex: 'male' });
  const woman = lvMassIndex({ ...dims, sex: 'female' });
  assert.ok(man.lvmi > 95 && man.lvmi < 115, `LVMI ${man.lvmi} should be 95-115`);
  assert.equal(man.pattern, 'Normal geometry'); // not elevated for men (limit 115)
  assert.equal(woman.pattern, 'Eccentric hypertrophy'); // elevated for women (limit 95), low RWT
});

test('blank / non-finite inputs render a complete-the-fields fallback', () => {
  assert.equal(lvMassIndex({}).valid, false);
  assert.equal(lvMassIndex({ lvidd: 5.0, pwtd: 1.0, ivsd: 1.0, bsa: 2.0 }).valid, false); // no sex
  assert.equal(lvMassIndex({ lvidd: 0, pwtd: 1.0, ivsd: 1.0, bsa: 2.0, sex: 'male' }).valid, false);
  assert.match(lvMassIndex({}).message, /LVIDd/);
});
