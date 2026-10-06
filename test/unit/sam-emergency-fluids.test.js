// spec-v1549 tool 3: SAM emergency fluids. Shock volumes at 10 kg, ReSoMal vs ORS by the cholera input, oral vs
// IV glucose, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { samEmergencyFluids as s } from '../../lib/sam-emergency-fluids-v1549.js';

test('shock at 10 kg: 150 mL over 1 hour, glucose 50 mL, septic shock 40 mL/h then 100 mL blood; stop at pulse +15', () => {
  const r = s({ weight: '10', scenario: 'shock' });
  assert.equal(r.bandLabel, '150 mL over 1 hour');
  const n = r.notes.join(' ');
  assert.match(n, /10% glucose 50 mL IV/);
  assert.match(n, /maintenance IV fluid 40 mL an hour/);
  assert.match(n, /fresh whole blood 100 mL slowly over 3 hours/);
  assert.match(n, /the pulse by 15/);
  assert.match(n, /half-strength Darrow's with 5% dextrose, Ringer's lactate/);
});

test('dehydration: ReSoMal 5 mL/kg every 30 minutes, or standard ORS with profuse watery diarrhea', () => {
  const r = s({ weight: '8', scenario: 'dehydrated', profuse: 'no' });
  assert.equal(r.bandLabel, '40 mL every 30 min');
  assert.match(r.notes.join(' '), /40 mL-80 mL an hour/);
  assert.equal(s({ weight: '8', scenario: 'dehydrated', profuse: 'yes' }).bandLabel, 'Standard ORS, not ReSoMal');
  assert.equal(s({ weight: '8', scenario: 'dehydrated' }).valid, false);
});

test('low blood sugar: 50 mL by mouth if alert, 5 mL/kg IV if not', () => {
  assert.equal(s({ weight: '6', scenario: 'hypoglycemia', conscious: 'alert' }).bandLabel, '50 mL by mouth');
  assert.equal(s({ weight: '6', scenario: 'hypoglycemia', conscious: 'impaired' }).bandLabel, '30 mL IV');
  assert.equal(s({ weight: '6', scenario: 'hypoglycemia' }).valid, false);
});

test('refusals', () => {
  assert.equal(s({ scenario: 'shock' }).valid, false);
  assert.equal(s({ weight: '6' }).valid, false);
});
