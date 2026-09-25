// spec-v1481: Basic Periodontal Examination (Preshaw, BMC Oral Health 2015).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { bpePeriodontal as bpe } from '../../lib/bpe-periodontal-v1481.js';

const all = (code) => ({ ur: code, ua: code, ul: code, ll: code, la: code, lr: code });

test('the worked example: a code 3 in two sextants indicates periodontitis', () => {
  const r = bpe({ ur: '2', ua: '1', ul: '3', ll: '3', la: '1', lr: '2' });
  assert.equal(r.band, 'Highest BPE code 3: a pocket of 3.5 to 5.5 mm, in the upper left and lower left sextants; this indicates periodontitis.');
  assert.match(r.notes.join(' '), /more detailed periodontal charting is recommended/);
});

test('each code, and what it calls for', () => {
  assert.equal(bpe(all('0')).abnormal, false);
  assert.equal(bpe(all('2')).abnormal, false);
  assert.equal(bpe(all('3')).abnormal, true);
  assert.match(bpe({ ...all('1'), lr: '4' }).notes.join(' '), /full periodontal charting, six sites per tooth/);
  assert.equal(bpe({ ...all('3'), furcation: true }).code, '3*');
});

test('a blank sextant is not a 0: disclosed while it could raise the code, and nothing entered is asked for', () => {
  const r = bpe({ ur: '2', ua: '1' });
  assert.equal(r.sextantsScored, 2);
  assert.match(r.notes.join(' '), DISCLOSING);
  assert.match(r.notes.join(' '), /No code was entered for 4 of the 6 sextants/);
  assert.doesNotMatch(bpe({ ur: '4' }).notes.join(' '), /No code was entered/);
  const none = bpe({});
  assert.equal(none.valid, false);
  assert.match(none.message, ASKING);
});
