import test from 'node:test';
import assert from 'node:assert/strict';
import { quinteroTtts as q, DONOR_MVP_MAX, RECIPIENT_MVP_MIN } from '../../lib/quintero-ttts-v831.js';

const seq = { monochorionicDiamniotic: true, donorMvp: 1.5, recipientMvp: 10 };

test('quintero: the five stages, most advanced finding winning', () => {
  assert.equal(q({ ...seq, donorBladderVisible: true }).stage, 'I');
  assert.equal(q(seq).stage, 'II');
  assert.equal(q({ ...seq, criticallyAbnormalDoppler: true }).stage, 'III');
  assert.equal(q({ ...seq, hydrops: true }).stage, 'IV');
  assert.equal(q({ ...seq, demise: true }).stage, 'V');
  // Demise outranks everything below it.
  assert.equal(q({ ...seq, demise: true, hydrops: true, criticallyAbnormalDoppler: true }).stage, 'V');
  // An abnormal Doppler outranks a visible bladder.
  assert.equal(q({ ...seq, donorBladderVisible: true, criticallyAbnormalDoppler: true }).stage, 'III');
});

test('quintero: BOTH halves of the fluid sequence are required', () => {
  assert.equal(DONOR_MVP_MAX, 2);
  assert.equal(RECIPIENT_MVP_MIN, 8);
  // Donor oligohydramnios alone.
  const donorOnly = q({ monochorionicDiamniotic: true, donorMvp: 1.5, recipientMvp: 5 });
  assert.equal(donorOnly.stage, null);
  assert.ok(donorOnly.discordanceNote.includes('BOTH halves'));
  // Recipient polyhydramnios alone.
  const recipOnly = q({ monochorionicDiamniotic: true, donorMvp: 3, recipientMvp: 10 });
  assert.equal(recipOnly.stage, null);
  assert.ok(recipOnly.discordanceNote.includes('BOTH halves'));
});

test('quintero: the thresholds are strict on both sides', () => {
  assert.equal(q({ ...seq, donorMvp: 2 }).sequencePresent, false);
  assert.equal(q({ ...seq, donorMvp: 1.9 }).sequencePresent, true);
  assert.equal(q({ ...seq, recipientMvp: 8 }).sequencePresent, false);
  assert.equal(q({ ...seq, recipientMvp: 8.1 }).sequencePresent, true);
});

test('quintero: neither half present names the OTHER diagnosis', () => {
  // Discordant growth without the fluid sequence is selective fetal growth restriction.
  const r = q({ monochorionicDiamniotic: true, donorMvp: 3, recipientMvp: 5 });
  assert.equal(r.stage, null);
  assert.ok(r.discordanceNote.includes('selective fetal growth restriction'));
});

test('quintero: chorionicity is a precondition, not a detail', () => {
  const r = q({ donorMvp: 1.5, recipientMvp: 10 });
  assert.equal(r.stage, null);
  assert.equal(r.sequencePresent, true);
  assert.ok(r.chorionicityNote.includes('MONOCHORIONIC'));
});

test('quintero: staging is reported as an ordering of findings, not a course', () => {
  const r = q({ ...seq, donorBladderVisible: true });
  assert.ok(r.ladderNote.includes('not the course'));
  assert.ok(r.ladderNote.includes('can present at stage IV'));
  // Not raised when nothing is stageable.
  assert.equal(q({}).ladderNote, null);
});

test('quintero: empty and out-of-range input', () => {
  const empty = q({});
  assert.equal(empty.valid, true);
  assert.equal(empty.stage, null);
  assert.equal(empty.discordanceNote, null);
  assert.equal(q({ donorMvp: -1 }).valid, false);
  assert.equal(q({ recipientMvp: 1e308 }).valid, false);
  assert.equal(q().valid, true);
  assert.doesNotMatch(JSON.stringify(q(seq)), /NaN|Infinity/);
});
