// spec-v916: I-PASS. The test that matters is that the receiver's synthesis is reported on its
// own and never counted as one blank among five.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ipassHandoff, IPASS_NOTE, ILLNESS_SEVERITY_OPTIONS, SECTIONS } from '../../lib/ipass-handoff-v916.js';

const FOUR = { illnessSeverity: 'watcher', patientSummary: 'x', actionList: 'y', situationAwareness: 'z' };

test('ipass-handoff: four parts without the read-back is not finished', () => {
  const r = ipassHandoff(FOUR);
  assert.equal(r.synthesisRecorded, false);
  assert.equal(r.abnormal, true);
  assert.equal(r.bandLabel, 'Not finished');
  assert.match(r.band, /has not summarized it back/);
});

test('ipass-handoff: the read-back completes it', () => {
  const r = ipassHandoff({ ...FOUR, synthesisByReceiver: 'read it back' });
  assert.equal(r.synthesisRecorded, true);
  assert.equal(r.abnormal, false);
  assert.equal(r.bandLabel, 'Complete');
  assert.equal(r.filledCount, 5);
});

test('ipass-handoff: the synthesis is never one blank among five', () => {
  const r = ipassHandoff({ illnessSeverity: 'stable', patientSummary: 'x' });
  assert.match(r.band, /of the first four parts/);
  assert.match(r.band, /also not summarized it back/);
  assert.match(r.synthesisNote, /most often skipped/);
});

test('ipass-handoff: whitespace is not content', () => {
  const r = ipassHandoff({ ...FOUR, synthesisByReceiver: '   \n  ' });
  assert.equal(r.synthesisRecorded, false);
});

test('ipass-handoff: an unrecognized severity is not recorded rather than passed through', () => {
  const r = ipassHandoff({ ...FOUR, illnessSeverity: 'a bit poorly' });
  assert.equal(r.severity, 'unset');
  assert.equal(r.sections.find((s) => s.key === 'illnessSeverity').filled, false);
});

test('ipass-handoff: watcher is described as a category, not a hedge', () => {
  assert.match(ipassHandoff(FOUR).watcherNote, /category, not a hedge between stable and unstable/);
  assert.match(ipassHandoff({ illnessSeverity: 'stable' }).watcherNote, /rather than a hedge/);
});

test('ipass-handoff: the assembled text carries all five headings and marks blanks', () => {
  const r = ipassHandoff({ illnessSeverity: 'unstable', patientSummary: 'post-op day 1' });
  for (const s of SECTIONS) assert.ok(r.handoff.includes(s.heading), `missing ${s.heading}`);
  assert.ok(r.handoff.includes('(blank)'));
  assert.ok(r.handoff.includes('post-op day 1'));
  assert.ok(r.handoff.includes('Unstable'));
});

test('ipass-handoff: the structure, privacy and scope lines print on every result', () => {
  const r = ipassHandoff({});
  assert.match(r.structureNote, /does not replace the conversation/);
  assert.match(r.privacyNote, /is sent anywhere or stored/);
  assert.match(r.scopeNote, /does not judge whether what was written is right/);
  assert.match(IPASS_NOTE, /finished when the receiver has said it back/);
  assert.equal(ILLNESS_SEVERITY_OPTIONS.length, 4);
  assert.equal(SECTIONS.length, 5);
});
