// spec-v548: patient-prosthesis mismatch by indexed effective orifice area.
// Worked-example tests: the position-specific thresholds and the value that grades DIFFERENTLY between
// them, every band boundary, the disclosed 0.65 aortic edge, the per-position citations, and the guards.
// Aortic thresholds from Pibarot and Dumesnil 2006; mitral from Magne and colleagues 2007 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ppmEoai, PPM_POSITIONS } from '../../lib/ppm-eoai-v548.js';

const at = (position, eoai) => ppmEoai({ position, eoa: eoai, bsa: 1 });

test('two positions, each with its own three bands and citation', () => {
  assert.deepEqual(PPM_POSITIONS.map((p) => p.value), ['aortic', 'mitral']);
  for (const p of PPM_POSITIONS) assert.equal(p.bands.length, 3);
  assert.match(PPM_POSITIONS[0].citation, /Heart 2006/);
  assert.match(PPM_POSITIONS[1].citation, /Circulation 2007/);
});

test('EOAi is EOA divided by BSA', () => {
  const r = ppmEoai({ position: 'aortic', eoa: 1.6, bsa: 2.0 });
  assert.equal(r.eoai, 0.8);
  assert.equal(r.severity, 'moderate');
  assert.match(r.band, /1.6 divided by 2/);
});

test('THE SAME VALUE GRADES DIFFERENTLY BY POSITION', () => {
  // 1.0 is entirely normal aortic, moderate mitral.
  assert.equal(at('aortic', 1.0).severity, 'none');
  assert.equal(at('mitral', 1.0).severity, 'moderate');
});

test('every aortic boundary', () => {
  assert.equal(at('aortic', 0.86).severity, 'none');
  assert.equal(at('aortic', 0.85).severity, 'moderate');
  assert.equal(at('aortic', 0.65).severity, 'moderate');   // the cited source: severe is BELOW 0.65
  assert.equal(at('aortic', 0.64).severity, 'severe');
});

test('every mitral boundary', () => {
  assert.equal(at('mitral', 1.21).severity, 'none');
  assert.equal(at('mitral', 1.2).severity, 'moderate');
  assert.equal(at('mitral', 0.91).severity, 'moderate');
  assert.equal(at('mitral', 0.9).severity, 'severe');
});

test('the aortic 0.65 edge is DISCLOSED, not silently chosen', () => {
  const r = at('aortic', 0.65);
  assert.equal(r.severity, 'moderate');
  assert.match(r.band, /defines severe as BELOW 0\.65/);
  assert.match(r.band, /graded differently by the two conventions/);
  // The disclosure appears only at the boundary, not on every result.
  assert.doesNotMatch(at('aortic', 0.80).band, /two conventions/);
});

test('each position reports ITS OWN citation (the META example is mitral)', () => {
  assert.match(at('aortic', 0.7).band, /Pibarot and Dumesnil, Heart 2006/);
  const m = at('mitral', 0.8);
  assert.match(m.band, /Magne and colleagues, Circulation 2007/);
  assert.match(m.bandLabel, /severe mismatch \(mitral\)/);
});

test('the copy carries the citation correction and the obesity omission', () => {
  const n = at('aortic', 1.0).note;
  assert.match(n, /2006 paper almost always cited for mismatch contains no mitral moderate or severe grading/);
  assert.match(n, /Obesity-specific aortic thresholds .* deliberately not implemented/);
});

test('every result refuses the prosthesis-failure and reoperation readings', () => {
  for (const [pos, v] of [['aortic', 0.5], ['aortic', 1.2], ['mitral', 0.5], ['mitral', 1.5]]) {
    const r = at(pos, v);
    assert.match(r.band, /not prosthesis failure/);
    assert.match(r.band, /not an indication for reoperation/);
  }
  assert.match(at('aortic', 0.5).note, /labelled size, which is a manufacturing dimension/);
});

test('the position is required and never assumed', () => {
  const r = ppmEoai({ eoa: 1.5, bsa: 2 });
  assert.equal(r.valid, false);
  assert.match(r.message, /not interchangeable/);
});

test('the guards', () => {
  assert.equal(ppmEoai({}).valid, false);
  assert.equal(ppmEoai({ position: 'tricuspid', eoa: 1, bsa: 1 }).valid, false);
  assert.equal(ppmEoai({ position: 'aortic', eoa: 1 }).valid, false);
  assert.equal(ppmEoai({ position: 'aortic', eoa: 0, bsa: 2 }).valid, false);
  assert.equal(ppmEoai({ position: 'aortic', eoa: 1.5, bsa: -1 }).valid, false);
  assert.equal(ppmEoai({ position: 'AORTIC', eoa: 1.5, bsa: 2 }).severity, 'moderate');
});
