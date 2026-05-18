// spec-v12 §3.5.4 wave 12-5: Ottawa Ankle Rules boundary examples
// per Stiell IG, et al. Ann Emerg Med. 1992;21(4):384-390, Figure 1.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ottawaAnkle } from '../../lib/scoring-v4.js';

test('ottawaAnkle low: no zone pain -> no imaging indicated', () => {
  const r = ottawaAnkle({ malleolarPain: false, lateralMalleolusTender: false,
    medialMalleolusTender: false, ankleCannotBearWeight: false,
    midfootPain: false, fifthMetatarsalTender: false, navicularTender: false,
    footCannotBearWeight: false });
  assert.equal(r.ankleXray, false);
  assert.equal(r.footXray, false);
  assert.match(r.band, /No imaging indicated/);
});

test('ottawaAnkle ankle x-ray: malleolar pain + lateral tenderness', () => {
  const r = ottawaAnkle({ malleolarPain: true, lateralMalleolusTender: true,
    medialMalleolusTender: false, ankleCannotBearWeight: false,
    midfootPain: false, fifthMetatarsalTender: false, navicularTender: false,
    footCannotBearWeight: false });
  assert.equal(r.ankleXray, true);
  assert.equal(r.footXray, false);
});

test('ottawaAnkle foot x-ray: midfoot pain + 5th MT tenderness', () => {
  const r = ottawaAnkle({ malleolarPain: false, lateralMalleolusTender: false,
    medialMalleolusTender: false, ankleCannotBearWeight: false,
    midfootPain: true, fifthMetatarsalTender: true, navicularTender: false,
    footCannotBearWeight: false });
  assert.equal(r.ankleXray, false);
  assert.equal(r.footXray, true);
});

test('ottawaAnkle both: malleolar + midfoot pain with bear-weight issues', () => {
  const r = ottawaAnkle({ malleolarPain: true, lateralMalleolusTender: false,
    medialMalleolusTender: false, ankleCannotBearWeight: true,
    midfootPain: true, fifthMetatarsalTender: false, navicularTender: false,
    footCannotBearWeight: true });
  assert.equal(r.ankleXray, true);
  assert.equal(r.footXray, true);
});

test('ottawaAnkle tenderness without zone pain does not trigger imaging', () => {
  const r = ottawaAnkle({ malleolarPain: false, lateralMalleolusTender: true,
    medialMalleolusTender: false, ankleCannotBearWeight: false,
    midfootPain: false, fifthMetatarsalTender: false, navicularTender: false,
    footCannotBearWeight: false });
  assert.equal(r.ankleXray, false);
  assert.equal(r.footXray, false);
});
