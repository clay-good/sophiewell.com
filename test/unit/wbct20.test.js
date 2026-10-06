// spec-v1555 tool 1: the 20-minute whole blood clotting test. Validity by vessel, each result and timing, the
// 6-hour repeat after antivenom, the region note, and refusals.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wbct20 as w } from '../../lib/wbct20-v1555.js';

const OK = { vessel: 'new-glass', result: 'not-clotted', timing: 'admission', region: 'asia' };

test('an unsuitable vessel makes the test invalid, whichever way it came out', () => {
  for (const vessel of ['plastic', 'detergent', 'wet', 'unsure']) {
    for (const result of ['clotted', 'not-clotted']) {
      const r = w({ ...OK, vessel, result });
      assert.equal(r.bandLabel, 'Invalid test', `${vessel} ${result}`);
      assert.doesNotMatch(r.band, /no incoagulable blood|coagulopathy\./);
    }
  }
  assert.match(w({ ...OK, vessel: 'plastic' }).notes[0], /healthy person's blood/);
  assert.equal(w({ ...OK, vessel: 'saline-glass' }).bandLabel, 'Not clotted', 'saline-washed, dried glass is valid');
});

test('not clotted before antivenom: consumption coagulopathy, an antivenom indication, retest at 6 hours', () => {
  const r = w(OK);
  assert.equal(r.bandLabel, 'Not clotted');
  assert.match(r.band, /venom-induced consumption coagulopathy/);
  const n = r.notes.join(' ');
  assert.match(n, /points to a viper bite and rules out an elapid/);
  assert.match(n, /one of SEARO's indications for antivenom\. Retest 6 hours after the loading dose/);
});

test('the region note: Asia, Africa, elsewhere, and both when no region is entered', () => {
  assert.match(w({ ...OK, region: 'africa' }).notes[0], /back-fanged colubrids/);
  assert.match(w({ ...OK, region: 'other' }).notes[0], /Lee-White/);
  const none = w({ ...OK, region: '' }).notes[0];
  assert.match(none, /^No region was entered\./);
  assert.match(none, /elapid/);
  assert.match(none, /colubrids/);
});

test('clotted before antivenom is not reassurance: the hourly then 6-hourly schedule', () => {
  const r = w({ ...OK, result: 'clotted' });
  assert.equal(r.bandLabel, 'Clotted: retest');
  assert.match(r.band, /below about 0\.5 g\/L/);
  const n = r.notes.join(' ');
  assert.match(n, /every hour for the first 3 hours from admission, then every 6 hours for 24 hours/);
  assert.match(n, /every 4 hours after the first 3/);
  assert.match(n, /spontaneous bleeding away from the bite/);
});

test('after the loading dose: retest at 6 hours; persisting at 6 hours meets the repeat-dose criterion', () => {
  const A = { ...OK, timing: 'after' };
  const early = w({ ...A, hours: '4' });
  assert.equal(early.bandLabel, 'Not clotted: retest at 6 hours');
  assert.match(early.band, /Retest at 6 hours, 2 hours from now/);
  assert.equal(w({ ...A, hours: '5.9' }).bandLabel, 'Not clotted: retest at 6 hours');
  const six = w({ ...A, hours: '6' });
  assert.equal(six.bandLabel, 'Not clotted at 6 hours or more');
  assert.match(six.band, /SEARO's criterion for repeating that dose/);
  const noTime = w({ ...A, hours: '' });
  assert.match(noTime.notes[0], /No time since the loading dose was entered/);
  const restored = w({ ...A, result: 'clotted', hours: '7' });
  assert.equal(restored.bandLabel, 'Clotted: coagulability restored');
  assert.match(restored.band, /3 to 9 hours/);
});

test('refusals', () => {
  for (const k of ['vessel', 'result', 'timing']) assert.equal(w({ ...OK, [k]: '' }).valid, false, k);
  assert.equal(w({ ...OK, region: 'europe' }).valid, false);
  assert.equal(w({ ...OK, timing: 'after', hours: '80' }).valid, false);
  assert.equal(w().valid, false);
});
