// spec-v1629 tool 14: buffer pH and buffer composition.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bufferPh as bp } from '../../lib/buffer-ph-v1629.js';

test('equal concentrations give pH = pKa', () => {
  assert.equal(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: 0.1, donor: 0.1 }).pH, 4.76);
  assert.equal(bp({ pair: 'base', mode: 'ph', pKa: 9.25, acceptor: 0.05, donor: 0.05 }).pH, 9.25);
});

test('the weak-base form is not the acid form with the ratio inverted twice', () => {
  // More base than its salt raises the pH above the pKa, exactly as more salt than acid does.
  const base = bp({ pair: 'base', mode: 'ph', pKa: 9.25, acceptor: 0.2, donor: 0.1 });
  const acid = bp({ pair: 'acid', mode: 'ph', pKa: 9.25, acceptor: 0.2, donor: 0.1 });
  assert.equal(base.pH, 9.55);
  assert.equal(acid.pH, 9.55);
  assert.match(base.notes.join(' '), /Ratio of base to salt: 2 to 1/);
  assert.match(acid.notes.join(' '), /Ratio of salt to acid: 2 to 1/);
  assert.equal(bp({ pair: 'base', mode: 'ph', pKa: 9.25, acceptor: 0.1, donor: 0.2 }).pH, 8.95);
});

test('a zero concentration is refused', () => {
  assert.match(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: 0.1, donor: 0 }).message, /acid concentration must be greater than 0/);
  assert.match(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: 0, donor: 0.1 }).message, /salt concentration must be greater than 0/);
});

test('composition for a target pH, in concentrations and in grams', () => {
  const r = bp({ pair: 'acid', mode: 'compose', pKa: 4.76, targetPh: 5, total: 0.1, volumeMl: 500, acceptorMw: 82.03, donorMw: 60.05 });
  assert.equal(r.ratio, 1.7378);
  assert.equal(r.acceptorMolar, 0.0634743);
  assert.equal(r.donorMolar, 0.0365257);
  assert.equal(r.acceptorGrams, 2.6034);
  assert.equal(r.donorGrams, 1.09668);
  // Round trip: those two concentrations give the target pH back.
  assert.equal(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: r.acceptorMolar, donor: r.donorMolar }).pH, 5);
  const conc = bp({ pair: 'acid', mode: 'compose', pKa: 4.76, targetPh: 5, total: 0.1 });
  assert.equal(conc.acceptorGrams, undefined);
  assert.match(bp({ pair: 'acid', mode: 'compose', pKa: 4.76, targetPh: 5, total: 0.1, volumeMl: 500 }).message, /Grams need the volume and both molecular weights/);
});

test('a target more than 1 pH unit from the pKa is flagged, as arithmetic', () => {
  const far = bp({ pair: 'acid', mode: 'compose', pKa: 4.76, targetPh: 6.5, total: 0.1 });
  assert.equal(far.abnormal, true);
  assert.match(far.notes.join(' '), /more than 1 pH unit from the pKa \(a ratio beyond 10 to 1\)/);
  assert.equal(bp({ pair: 'acid', mode: 'compose', pKa: 4.76, targetPh: 5.7, total: 0.1 }).abnormal, false);
  assert.equal(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: 0.001, donor: 0.1 }).abnormal, true);
});

test('the pKa is never assumed', () => {
  assert.match(bp({ pair: 'acid', mode: 'ph', acceptor: 0.1, donor: 0.1 }).message, /Enter the pKa\. It is not assumed/);
  assert.match(bp({ pair: 'base', mode: 'ph', acceptor: 0.1, donor: 0.1 }).message, /pKa of the conjugate acid/);
  assert.match(bp({ mode: 'ph', pKa: 4 }).message, /Choose the buffer pair/);
  assert.match(bp({ pair: 'acid', pKa: 4 }).message, /Choose what to work out/);
  assert.match(bp({ pair: 'acid', mode: 'ph', pKa: 4.76, acceptor: 0.1, donor: 0.1 }).note, /ignores activity and is reliable only near the pKa/);
});
