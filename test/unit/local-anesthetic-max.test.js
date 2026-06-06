// spec-v56 §2.6: local anesthetic maximum dose.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localAnestheticMax } from '../../lib/medication-v5.js';

test('lidocaine plain 70 kg: absolute cap 300 mg binds, 30 mL of 1%', () => {
  const r = localAnestheticMax({ agent: 'lidocaine', weightKg: 70, concPct: 1 });
  assert.equal(r.maxDoseMg, 300); // 70*4.5=315 -> capped at 300
  assert.equal(r.capBinds, true);
  assert.equal(r.mgPerMl, 10);
  assert.equal(r.maxVolMl, 30);
});

test('lidocaine with epi raises ceiling to 7 mg/kg', () => {
  const r = localAnestheticMax({ agent: 'lidocaine-epi', weightKg: 60, concPct: 2 });
  assert.equal(r.maxDoseMg, 420); // 60*7=420 < 500 absolute
  assert.equal(r.capBinds, false);
  assert.equal(r.maxVolMl, 21); // 420 / 20 mg/mL
});

test('bupivacaine plain 2.5 mg/kg', () => {
  const r = localAnestheticMax({ agent: 'bupivacaine', weightKg: 60, concPct: 0.5 });
  assert.equal(r.maxDoseMg, 150); // 60*2.5
  assert.equal(r.maxVolMl, 30); // 150 / 5 mg/mL
});

test('weight capped at 100 kg surfaces a flag', () => {
  const r = localAnestheticMax({ agent: 'ropivacaine', weightKg: 150, concPct: 0.5 });
  assert.equal(r.weightCapped, true);
});

test('rejects unknown agent and impossible concentration', () => {
  assert.throws(() => localAnestheticMax({ agent: 'cocaine', weightKg: 70, concPct: 1 }), /unknown/);
  assert.throws(() => localAnestheticMax({ agent: 'lidocaine', weightKg: 70, concPct: 0 }), /concPct/);
});
