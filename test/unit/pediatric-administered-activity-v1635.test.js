// spec-v1635 tool 33: pediatric administered activity (2024 North American consensus guidelines, Table 2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pediatricAdministeredActivity as f, PROTOCOLS } from '../../lib/pediatric-administered-activity-v1635.js';

test('every row\'s MBq figures agree with its printed mCi figures (1 mCi = 37 MBq, within 3%)', () => {
  const near = (mbq, mci) => Math.abs(mbq / 37 - mci) / mci < 0.03;
  for (const p of PROTOCOLS) {
    if (p.min) assert.ok(near(p.min.mbq, p.min.mci), `${p.value} minimum`);
    if (p.max) assert.ok(near(p.max.mbq, p.max.mci), `${p.value} maximum`);
    if (p.perKg === null) continue;
    const kg = Array.isArray(p.perKg) ? p.perKg : [p.perKg];
    const mci = p.mciPerKg.split(' to ').map(Number);
    kg.forEach((k, i) => assert.ok(near(k, mci[i]), `${p.value} per kg`));
  }
  assert.equal(PROTOCOLS.length, 28);
});

test('weight-based, then the minimum and the maximum, each said', () => {
  const mid = f({ protocol: 'tc-99m-mdp', weightKg: '20' });
  assert.equal(mid.band, 'Tc-99m MDP at 20 kg: 186 MBq (5.03 mCi).');
  assert.deepEqual([mid.activityMbq, mid.flag], [186, 'weight-based']);
  const lo = f({ protocol: 'tc-99m-mdp', weightKg: '2' });
  assert.deepEqual([lo.activityMbq, lo.flag], [37, 'minimum']);
  assert.match(lo.notes.join(' '), /18\.6 MBq.*Raised to the table's minimum of 37 MBq/);
  const hi = f({ protocol: 'tc-99m-mdp', weightKg: '90' });
  assert.deepEqual([hi.activityMbq, hi.flag], [740, 'maximum']);
  assert.match(hi.notes.join(' '), /Over 70 kg/);
});

test('a range row clamps each end and says which', () => {
  const r = f({ protocol: 'f-18-fdg-body', weightKg: '7' });
  assert.deepEqual(r.activityRangeMbq, [26, 36.4]);
  assert.match(r.band, /low end raised to the table's minimum/);
  assert.deepEqual(f({ protocol: 'f-18-fdg-body', weightKg: '3' }).activityRangeMbq, [26, 26]);
  assert.deepEqual(f({ protocol: 'f-18-fdg-body', weightKg: '80' }).activityRangeMbq, [236.8, 370]);
});

test('the two source quirks: MAG3 uses the poster\'s 3.7, MAA\'s minimum stays on its own row', () => {
  const m = f({ protocol: 'tc-99m-mag3-no-flow', weightKg: '15' });
  assert.equal(m.activityMbq, 55.5);
  assert.match(m.notes.join(' '), /prints this row as 7 MBq\/kg beside 0\.10 mCi\/kg/);
  assert.equal(f({ protocol: 'tc-99m-maa-vent', weightKg: '4' }).activityMbq, 10.4);
  assert.equal(f({ protocol: 'tc-99m-maa-no-vent', weightKg: '4' }).activityMbq, 14.8);
});

test('no maximum printed: said, and the 70-times figure is shown, not applied', () => {
  const r = f({ protocol: 'rb-82', weightKg: '80' });
  assert.equal(r.activityMbq, 592);
  assert.match(r.notes.join(' '), /prints no maximum.*518 MBq \(14 mCi\); none is applied/);
});

test('fixed rows need no weight; refusals ask for what is missing in one sentence', () => {
  assert.match(f({ protocol: 'tc-99m-cystography' }).band, /no more than 37 MBq \(1 mCi\) for each bladder-filling cycle/);
  assert.match(f({ protocol: 'tc-99m-sc-solid' }).band, /9\.25 MBq \(0\.25 mCi\) to 18\.5 MBq \(0\.5 mCi\)/);
  for (const r of [f({}), f({ protocol: 'tc-99m-mdp' }), f({ protocol: 'tc-99m-mdp', weightKg: '0' }), f({ protocol: 'tc-99m-mdp', weightKg: '500' })]) {
    assert.equal(r.valid, false);
    assert.ok(r.message.length < 200 && r.message.split('. ').length <= 2, r.message);
  }
  assert.match(f({ protocol: 'tc-99m-mdp', weightKg: ' ' }).message, /^Enter the weight/);
});
