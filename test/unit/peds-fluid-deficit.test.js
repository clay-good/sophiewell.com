// spec-v56 §2.11: pediatric dehydration deficit + maintenance (Holliday-Segar).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedsFluidDeficit } from '../../lib/medication-v5.js';

test('12 kg, 10% dehydration: maint 44 mL/h, deficit 1200 mL', () => {
  const r = pedsFluidDeficit({ weightKg: 12, dehydrationPct: 10 });
  assert.equal(r.maintPerH, 44); // 40 + 2*2
  assert.equal(r.deficitMl, 1200); // 10*12*10
  assert.equal(r.first8hRateMlH, 119); // 44 + 600/8
  assert.equal(r.next16hRateMlH, 81.5); // 44 + 600/16
});

test('4-2-1 maintenance: 8 kg -> 32 mL/h', () => {
  const r = pedsFluidDeficit({ weightKg: 8, dehydrationPct: 0 });
  assert.equal(r.maintPerH, 32);
  assert.equal(r.deficitMl, 0);
});

test('4-2-1 maintenance: 25 kg -> 65 mL/h', () => {
  const r = pedsFluidDeficit({ weightKg: 25, dehydrationPct: 5 });
  assert.equal(r.maintPerH, 65); // 60 + 1*5
  assert.equal(r.deficitMl, 1250);
});

test('rejects impossible weight / dehydration', () => {
  assert.throws(() => pedsFluidDeficit({ weightKg: 0, dehydrationPct: 5 }), /weightKg/);
  assert.throws(() => pedsFluidDeficit({ weightKg: 12, dehydrationPct: 30 }), /dehydrationPct/);
});
