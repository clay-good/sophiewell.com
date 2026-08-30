// spec-v917: the WHO Surgical Safety Checklist. The test that matters is that the result names
// the incomplete PHASE, because a checklist that is 90% done is 90% done in a particular place.

import test from 'node:test';
import assert from 'node:assert/strict';
import { whoSurgicalChecklist, WHO_SSC_NOTE, PHASES } from '../../lib/who-surgical-checklist-v917.js';

function all(value = true) {
  const o = {};
  for (const p of PHASES) for (const i of p.items) o[i.key] = value;
  return o;
}
function without(phaseKey) {
  const o = all();
  for (const i of PHASES.find((p) => p.key === phaseKey).items) o[i.key] = false;
  return o;
}

test('who-surgical-checklist: three phases, seventeen items', () => {
  assert.deepEqual(PHASES.map((p) => p.key), ['signIn', 'timeOut', 'signOut']);
  assert.deepEqual(PHASES.map((p) => p.items.length), [7, 5, 5]);
  assert.equal(whoSurgicalChecklist(all()).totalItems, 17);
});

test('who-surgical-checklist: everything recorded is complete', () => {
  const r = whoSurgicalChecklist(all());
  assert.equal(r.allComplete, true);
  assert.equal(r.abnormal, false);
  assert.deepEqual(r.incompletePhases, []);
});

test('who-surgical-checklist: an empty form names all three phases, not a percentage', () => {
  const r = whoSurgicalChecklist({});
  assert.deepEqual(r.incompletePhases, ['Sign In', 'Time Out', 'Sign Out']);
  assert.match(r.band, /90% done in a particular place/);
  assert.equal(r.doneItems, 0);
});

test('who-surgical-checklist: a missing Sign Out is named as Sign Out', () => {
  const r = whoSurgicalChecklist(without('signOut'));
  assert.equal(r.bandLabel, 'Sign Out incomplete');
  assert.deepEqual(r.incompletePhases, ['Sign Out']);
  assert.equal(r.doneItems, 12);
});

test('who-surgical-checklist: the counts and the specimen read-back live in Sign Out', () => {
  const r = whoSurgicalChecklist(without('signOut'));
  const signOut = r.phases.find((p) => p.key === 'signOut');
  assert.ok(signOut.outstanding.some((t) => /counts/i.test(t)));
  assert.ok(signOut.outstanding.some((t) => /read back/i.test(t)));
  assert.match(r.signOutNote, /most often goes missing/);
});

test('who-surgical-checklist: the Sign Out line prints even when Sign Out is complete', () => {
  const r = whoSurgicalChecklist(all());
  assert.match(r.signOutNote, /Sign Out is recorded/);
  assert.match(r.signOutNote, /most often goes missing/);
});

test('who-surgical-checklist: one outstanding item still marks its phase incomplete', () => {
  const o = all();
  o.counts = false;
  const r = whoSurgicalChecklist(o);
  assert.equal(r.allComplete, false);
  assert.deepEqual(r.incompletePhases, ['Sign Out']);
  assert.equal(r.phases.find((p) => p.key === 'signOut').doneCount, 4);
});

test('who-surgical-checklist: each phase carries the moment it belongs to', () => {
  const r = whoSurgicalChecklist({});
  assert.match(r.phases[0].moment, /before induction of anesthesia/);
  assert.match(r.phases[1].moment, /before skin incision/);
  assert.match(r.phases[2].moment, /before the patient leaves the operating room/);
  assert.match(r.momentNote, /ticking it afterwards is not doing it/);
});

test('who-surgical-checklist: the naming, spoken, wording and scope lines always print', () => {
  const r = whoSurgicalChecklist(all());
  assert.match(r.namingNote, /one phase of three/);
  assert.match(r.spokenNote, /adapted to the local setting/);
  assert.match(r.wordingNote, /neutral topic labels/);
  assert.match(r.scopeNote, /does not verify that anything was actually done/);
  assert.match(WHO_SSC_NOTE, /the one that goes missing is Sign Out/);
});
