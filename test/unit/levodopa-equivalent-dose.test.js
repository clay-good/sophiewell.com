// spec-v1633 tool 22: levodopa equivalent daily dose (Jost 2023, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levodopaEquivalentDose as d, DRUGS, COMT } from '../../lib/levodopa-equivalent-dose-v1633.js';

test('the factors are the paper\'s', () => {
  const f = Object.fromEntries(DRUGS.map((x) => [x.arg, x.factor]));
  assert.deepEqual(f, {
    levodopaIr: 1, levodopaDualRelease: 0.85, levodopaCr: 0.75, levodopaEr: 0.5, levodopaInhaled: 0.69,
    lcig: 1.11, lecigMorning: 1.11, lecigMaintenance: 1.46, foslevodopa: 0.75,
    selegilineOral: 10, selegilineSublingual: 80, rasagiline: 100, pramipexoleSalt: 100, pramipexoleBase: 142.86,
    ropinirole: 20, rotigotine: 30.3, piribedil: 1, apomorphineSc: 10, apomorphineSl: 1.5, lisuride: 100,
    bromocriptine: 10, pergolide: 100, cabergoline: 66.67, dihydroergocryptine: 5,
    amantadineIr: 1, amantadineErGocovri: 1.25, amantadineErOsmolex: 1,
  });
  assert.deepEqual(COMT.map((c) => [c.value, c.factor]), [['none', undefined], ['entacapone', 0.33], ['tolcapone', 0.5], ['opicapone', 0.5]]);
  assert.equal(DRUGS.filter((x) => x.levodopa).length, 9);
});

test('each dose is multiplied by its factor and the contributions are listed', () => {
  assert.equal(d({ levodopaIr: 600 }).totalLed, 600);
  const r = d({ rotigotine: 8, amantadineErGocovri: 274 });
  assert.equal(r.totalLed, 584.9);
  assert.deepEqual(r.contributions.map((c) => c.led), [242.4, 342.5]);
  assert.equal(d({ pramipexoleBase: 2.1 }).totalLed, 300.01);
  assert.equal(d({ levodopaIr: 300, levodopaEr: 0 }).contributions.length, 1);
});

test('a COMT inhibitor scales only levodopa: opicapone the whole day, the others the part stated', () => {
  const o = d({ levodopaIr: 400, levodopaCr: 200, pramipexoleSalt: 3, comt: 'opicapone' });
  assert.deepEqual([o.levodopaLed, o.totalLed], [550, 1125]);
  assert.equal(d({ levodopaIr: 600, comt: 'entacapone', comtCoveredLed: 600, rasagiline: 1 }).totalLed, 898);
  assert.equal(d({ levodopaIr: 600, comt: 'tolcapone', comtCoveredLed: 300 }).totalLed, 750);
  assert.match(d({ levodopaIr: 600, comt: 'entacapone' }).message, /^Enter .*4 hours after a 200 mg dose/);
  assert.match(d({ levodopaIr: 600, comt: 'tolcapone' }).message, /8 hours after a 100 mg dose/);
  assert.equal(d({ levodopaIr: 600, comt: 'entacapone', comtCoveredLed: 700 }).valid, false);
  assert.match(d({ ropinirole: 8, comt: 'opicapone' }).message, /Enter the levodopa/);
  assert.match(d({ levodopaIr: 600, comt: 'stalevo' }).message, /^Choose/);
});

test('the fixed and conditional items follow the footnotes', () => {
  const r = d({ levodopaIr: 300, comt: 'opicapone', istradefylline: 'yes' });
  assert.equal(r.totalLed, 540); // 300 + 150 + 0.2 x 450
  assert.equal(d({ safinamide: 'yes' }).totalLed, 150);
  const z = d({ zonisamide: 'yes' });
  assert.equal(z.totalLed, 100);
  assert.match(z.notes.join(' '), /should not be used outside Japan/);
  const a = d({ levodopaIr: 300, anticholinergicDoses: 3 });
  assert.equal(a.totalLed, 600);
  assert.match(a.notes.join(' '), /at least 5 points/);
  assert.equal(d({ levodopaIr: 300, anticholinergicDoses: 1.5 }).valid, false);
  assert.match(d({ levodopaIr: 300, istradefylline: 'maybe' }).message, /^Choose/);
});

test('nothing entered, or a value that is not a dose, is refused', () => {
  assert.match(d({}).message, /^Enter the total daily dose/);
  assert.match(d({ levodopaIr: 0 }).message, /^Enter the total daily dose/);
  assert.equal(d({ levodopaIr: 'abc' }).valid, false);
  assert.equal(d({ levodopaIr: -5 }).valid, false);
  assert.equal(d(null).valid, false);
});

test('no band interprets the number', () => {
  const r = d({ levodopaIr: 1500 });
  assert.equal(r.abnormal, false);
  assert.match(r.note, /not a dose to switch to/);
});
