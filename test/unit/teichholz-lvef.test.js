// spec-v158 2.3: Teichholz LVEF & fractional shortening. V = 7·D³/(2.4+D);
// the (2.4+D) denominator is guarded. Sex-specific LVEF normal cutoffs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { teichholzLvef } from '../../lib/echo-v158.js';

test('tile example: normal LVEF with the Simpson caveat', () => {
  // EDV(5.0)=118.24, ESV(3.5)=50.87 -> EF 57.0% ; FS = 1.5/5.0 = 30%
  const r = teichholzLvef({ lvidd: 5.0, lvids: 3.5, sex: 'male' });
  assert.equal(r.valid, true);
  assert.equal(r.ef, 57);
  assert.equal(r.fs, 30);
  assert.equal(r.bandLabel, 'Normal');
  assert.match(r.detail, /Simpson/);
});

test('sex-specific normal cutoff: EF 53 is normal for a man, mild for a woman', () => {
  // Find dimensions giving EF ~53. lvidd 5.6, lvids 4.0:
  // EDV = 7*175.616/(8.0)=153.66 ; ESV = 7*64/(6.4)=70.0 ; EF=(153.66-70)/153.66=54.4
  const man = teichholzLvef({ lvidd: 5.6, lvids: 4.05, sex: 'male' });
  const woman = teichholzLvef({ lvidd: 5.6, lvids: 4.05, sex: 'female' });
  assert.ok(man.ef >= 52 && man.ef < 54, `EF ${man.ef} should sit in the sex-split window`);
  assert.equal(man.bandLabel, 'Normal'); // man normal >= 52
  assert.equal(woman.bandLabel, 'Mildly reduced'); // woman normal >= 54
});

test('severely reduced below 30%', () => {
  // lvidd 6.5, lvids 5.8 -> small stroke volume.
  const r = teichholzLvef({ lvidd: 6.5, lvids: 5.9, sex: 'male' });
  assert.ok(r.ef < 30, `EF ${r.ef}`);
  assert.equal(r.bandLabel, 'Severely reduced');
});

test('guards: LVIDs must be < LVIDd; blanks fall back', () => {
  assert.equal(teichholzLvef({ lvidd: 4.0, lvids: 4.5, sex: 'male' }).valid, false);
  assert.equal(teichholzLvef({ lvidd: 5.0, lvids: 3.5 }).valid, false); // no sex
  assert.equal(teichholzLvef({}).valid, false);
});
