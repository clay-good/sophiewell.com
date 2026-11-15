// spec-v165 2.1: ACR TI-RADS points → TR level with the additive echogenic-foci
// rule and the size→FNA recommendation per level.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acrTirads } from '../../lib/radiology-v165.js';

test('tile example: 8 points → TR5, diameter triggers FNA', () => {
  // solid 2 + very-hypo 3 + wider 0 + smooth 0 + punctate 3 = 8 -> TR5
  const r = acrTirads({ composition: 'solid', echogenicity: 'veryhypo', shape: 'wider', margin: 'smooth', fociPunctate: true, diameter: 1.5 });
  assert.equal(r.valid, true);
  assert.equal(r.points, 8);
  assert.equal(r.level, 5);
  assert.match(r.detail, /FNA/);
});

test('echogenic foci are additive, not max', () => {
  // macro 1 + rim 2 + punctate 3 = 6 added to solid 2 = 8
  const r = acrTirads({ composition: 'solid', echogenicity: 'anechoic', shape: 'wider', margin: 'smooth', fociMacro: true, fociRim: true, fociPunctate: true });
  assert.equal(r.points, 8);
  assert.equal(r.level, 5);
});

test('TR4 / TR5 point boundary (6 → TR4, 7 → TR5)', () => {
  // solid 2 + hypo 2 + wider 0 + lobulated 2 = 6 -> TR4
  const tr4 = acrTirads({ composition: 'solid', echogenicity: 'hypo', shape: 'wider', margin: 'lobulated' });
  assert.equal(tr4.points, 6);
  assert.equal(tr4.level, 4);
  // add punctate +3 -> 9 ... use taller +3 instead: 2+2+3+0 = 7 -> TR5
  const tr5 = acrTirads({ composition: 'solid', echogenicity: 'hypo', shape: 'taller', margin: 'smooth' });
  assert.equal(tr5.points, 7);
  assert.equal(tr5.level, 5);
});

test('size rule: below the follow threshold → no FNA or follow', () => {
  const r = acrTirads({ composition: 'solid', echogenicity: 'veryhypo', shape: 'wider', margin: 'smooth', fociPunctate: true, diameter: 0.4 });
  assert.equal(r.level, 5); // FNA >=1.0, follow >=0.5
  assert.match(r.detail, /no FNA or follow-up/);
});

test('TR1 benign and guards for missing categorical fields', () => {
  const benign = acrTirads({ composition: 'cystic', echogenicity: 'anechoic', shape: 'wider', margin: 'smooth' });
  assert.equal(benign.points, 0);
  assert.equal(benign.level, 1);
  assert.equal(acrTirads({ composition: 'solid' }).valid, false);
  assert.equal(acrTirads({}).valid, false);
});

// spec-v1722: an entered diameter the tool cannot use is refused by name, not
// read as "no diameter" (which asked the reader to enter what they had typed).
test('an out-of-range diameter is refused, not read as blank', () => {
  const base = { composition: 'solid', echogenicity: 'veryhypo', shape: 'wider', margin: 'smooth', fociPunctate: true };
  for (const diameter of [25, 0, -1, '999999']) {
    const r = acrTirads({ ...base, diameter });
    assert.equal(r.valid, false, `diameter ${diameter}`);
    assert.match(r.message, /nodule maximum diameter must be greater than 0 and at most 20/i);
  }
  assert.equal(acrTirads({ ...base, diameter: 20 }).valid, true);
  assert.match(acrTirads({ ...base, diameter: '' }).detail, /^Enter the nodule maximum diameter/);
});
