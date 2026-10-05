// spec-v1546 tool 1: WHO IMCI ORS Plans A, B and C. Plan C at 11.9 and 12.0 months, Plan B by weight and by
// age, the 19 kg edge, each no-IV route, severe malnutrition, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imciOrsPlan as p } from '../../lib/imci-ors-plan-v1546.js';

const C = { plan: 'C', age: '9', weight: '8', sam: 'no', route: 'iv' };

test('Plan C IV: 100 mL/kg, timing flips at 12 months of age', () => {
  const inf = p({ ...C, age: '11.9' });
  assert.equal(inf.bandLabel, '800 mL IV');
  assert.match(inf.band, /first 240 mL over 1 hour \(240 mL\/h\), then 560 mL over 5 hours \(112 mL\/h\)\. Under 12 months\./);
  assert.match(inf.notes.join(' '), /this infant at 6 hours/);
  const child = p({ ...C, age: '12', weight: '10' });
  assert.match(child.band, /first 300 mL over 30 minutes \(600 mL\/h\), then 700 mL over 2\.5 hours \(280 mL\/h\)\. 12 months or older\./);
  assert.match(child.notes.join(' '), /this child at 3 hours/);
  assert.match(child.notes.join(' '), /about 50 mL an hour \(5 mL\/kg\/h\)/);
});

test('Plan C without IV: refer within 30 minutes, tube or oral 20 mL/kg/h for 6 hours, or refer urgently', () => {
  assert.equal(p({ ...C, route: 'iv30' }).bandLabel, 'Refer for IV');
  const ng = p({ ...C, route: 'ng' });
  assert.match(ng.band, /by nasogastric tube, 160 mL an hour \(20 mL\/kg\/h\) for 6 hours, 960 mL in all \(120 mL\/kg\)/);
  assert.match(p({ ...C, route: 'oral' }).band, /ORS by mouth/);
  assert.equal(p({ ...C, route: 'none' }).bandLabel, 'Refer urgently');
});

test('Plan C refuses without a weight or a route', () => {
  assert.match(p({ ...C, weight: '' }).message, /Enter the weight/);
  assert.match(p({ ...C, route: '' }).message, /Choose what is possible here/);
});

test('Plan B: weight x 75 with the weight band; age band only without a weight', () => {
  const b = p({ plan: 'B', age: '9', weight: '8', sam: 'no' });
  assert.equal(b.bandLabel, 'About 600 mL over 4 h');
  assert.match(b.notes[0], /6 to under 10 kg is 450 to 800 mL/);
  const edge = p({ plan: 'B', age: '9', weight: '6', sam: 'no' });
  assert.match(edge.notes[0], /6 to under 10 kg/);
  assert.match(p({ plan: 'B', age: '9', weight: '5.9', sam: 'no' }).notes[0], /under 6 kg is 200 to 450 mL/);
  assert.match(p({ plan: 'B', age: '30', weight: '19', sam: 'no' }).notes[0], /12 to 19 kg/);
  assert.match(p({ plan: 'B', age: '30', weight: '19.5', sam: 'no' }).notes[0], /Above 19 kg the chart has no band/);
  const differ = p({ plan: 'B', age: '30', weight: '11', sam: 'no' });
  assert.match(differ.notes.join(' '), /The age band \(2 years to under 5 years\) would give 960 to 1,600 mL; the chart uses the weight/);
  const byAge = p({ plan: 'B', age: '4', sam: 'no' });
  assert.equal(byAge.bandLabel, '450 to 800 mL over 4 h');
  assert.match(byAge.notes[0], /No weight was entered/);
  assert.equal(p({ plan: 'B', age: '3.9', sam: 'no' }).bandLabel, '200 to 450 mL over 4 h');
});

test('Plan A: per loose stool by age, zinc from 2 months with the 2024 change', () => {
  assert.equal(p({ plan: 'A', age: '23.9', sam: 'no' }).bandLabel, '50 to 100 mL per loose stool');
  const two = p({ plan: 'A', age: '24', sam: 'no' });
  assert.equal(two.bandLabel, '100 to 200 mL per loose stool');
  assert.match(two.notes.join(' '), /one tablet a day for 14 days; WHO's 2024 guideline suggests 5 mg a day/);
  assert.match(p({ plan: 'A', age: '3', sam: 'no' }).notes.join(' '), /half a tablet/);
  assert.match(p({ plan: 'A', age: '1', sam: 'no' }).notes.join(' '), /zinc from 2 months/);
});

test('severe acute malnutrition: none of the plans', () => {
  for (const plan of ['A', 'B', 'C']) {
    const r = p({ ...C, plan, sam: 'yes' });
    assert.equal(r.bandLabel, 'Not these plans (severe malnutrition)');
    assert.match(r.band, /ReSoMal/);
  }
});

test('blank plan, age or malnutrition answer is refused; age 5 years or more is refused', () => {
  for (const k of ['plan', 'age', 'sam']) assert.equal(p({ ...C, [k]: '' }).valid, false, k);
  assert.equal(p({ ...C, age: '60' }).valid, false);
  assert.equal(p({ ...C, weight: '0.2' }).valid, false);
  assert.equal(p().valid, false);
});
