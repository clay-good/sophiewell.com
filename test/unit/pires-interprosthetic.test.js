// spec-v1423: Pires interprosthetic femur fracture type, derived from the implants and the bone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { piresInterprosthetic as pif } from '../../lib/pires-interprosthetic-v1423.js';

test('types I and II: the nearer implant sets the numeral, fixation the letter', () => {
  const fix = [['fixed', 'fixed', 'A'], ['loose', 'fixed', 'B'], ['fixed', 'loose', 'C'], ['loose', 'loose', 'D']];
  for (const [nearer, numeral] of [['hip', 'I'], ['knee', 'II']]) {
    for (const [hip, knee, letter] of fix) {
      const r = pif({ kneeStem: 'unstemmed', nearer, hip, knee });
      assert.equal(r.valid, true);
      assert.equal(r.type, `${numeral}${letter}`, `${nearer} ${hip} ${knee}`);
    }
  }
});

test('type III: any loose implant is C or D, and the bone sets A/B or C/D', () => {
  const rows = [
    ['fixed', 'fixed', 'viable', 'IIIA'],
    ['fixed', 'fixed', 'nonviable', 'IIIB'],
    ['loose', 'fixed', 'viable', 'IIIC'],
    ['fixed', 'loose', 'viable', 'IIIC'],
    ['loose', 'loose', 'viable', 'IIIC'],
    ['loose', 'fixed', 'nonviable', 'IIID'],
    ['fixed', 'loose', 'nonviable', 'IIID'],
    ['loose', 'loose', 'nonviable', 'IIID'],
  ];
  for (const [hip, knee, bone, type] of rows) {
    assert.equal(pif({ kneeStem: 'stemmed', nearer: 'knee', hip, knee, bone }).type, type, `${hip} ${knee} ${bone}`);
  }
});

test('a stemmed knee is type III even without a fracture site, and a hip-side site is flagged', () => {
  assert.equal(pif({ kneeStem: 'stemmed', hip: 'fixed', knee: 'fixed', bone: 'viable' }).type, 'IIIA');
  const r = pif({ kneeStem: 'stemmed', nearer: 'hip', hip: 'fixed', knee: 'fixed', bone: 'viable' });
  assert.equal(r.type, 'IIIA');
  assert.ok(r.notes.some((n) => /closer to the hip stem/.test(n)));
  assert.ok(!pif({ kneeStem: 'stemmed', nearer: 'knee', hip: 'fixed', knee: 'fixed', bone: 'viable' }).notes.some((n) => /closer to the hip stem/.test(n)));
});

test('the band reads the type out in words', () => {
  assert.equal(pif({ kneeStem: 'unstemmed', nearer: 'hip', hip: 'loose', knee: 'fixed' }).band,
    'Pires type IB: a fracture closer to the hip stem than to the unstemmed knee component; the hip stem is loose and the knee component well fixed.');
});

test('every answer carries the reliability warning; nonviable type III names the reoperation factors', () => {
  assert.ok(pif({ kneeStem: 'unstemmed', nearer: 'knee', hip: 'fixed', knee: 'fixed' }).notes.some((n) => /0\.499/.test(n)));
  assert.ok(pif({ kneeStem: 'stemmed', hip: 'fixed', knee: 'fixed', bone: 'nonviable' }).notes.some((n) => /reoperation/.test(n)));
});

test('missing findings are asked for, naming what is missing', () => {
  assert.match(pif({}).message, /stemmed/);
  assert.match(pif({ kneeStem: 'unstemmed', hip: 'fixed', knee: 'fixed' }).message, /closer to/);
  assert.match(pif({ kneeStem: 'unstemmed', nearer: 'hip', knee: 'fixed' }).message, /hip stem/);
  assert.match(pif({ kneeStem: 'unstemmed', nearer: 'hip', hip: 'fixed' }).message, /knee femoral component/);
  assert.match(pif({ kneeStem: 'stemmed', hip: 'fixed', knee: 'fixed' }).message, /viable/);
  assert.equal(pif({ kneeStem: 'unstemmed', nearer: 'hip', hip: 'fixed', knee: 'fixed', bone: 'bogus' }).valid, true);
  assert.equal(pif(null).valid, false);
});
