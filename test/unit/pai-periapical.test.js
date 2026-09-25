// spec-v1486: the Periapical Index (PAI).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ASKING, DISCLOSING } from '../lib/asking-language.js';
import { paiPeriapical as pai } from '../../lib/pai-periapical-v1486.js';

test('the worked example: the tooth takes its highest root score', () => {
  const r = pai({ r1: '2', r2: '4' });
  assert.equal(r.band, 'PAI 4: periodontitis with a well-defined radiolucent area. Apical periodontitis (PAI 3 to 5). Roots: root 1 PAI 2, root 2 PAI 4.');
  assert.equal(r.pai, 4);
});

test('the cut-off falls between PAI 2 and 3', () => {
  assert.equal(pai({ r1: '2' }).bandLabel, 'PAI 2, healthy');
  assert.equal(pai({ r1: '2' }).abnormal, false);
  assert.equal(pai({ r1: '3' }).bandLabel, 'PAI 3, apical periodontitis');
  assert.equal(pai({ r1: '5' }).abnormal, true);
});

test('a blank root is not scored and the answer says how many were', () => {
  const r = pai({ r3: '1' });
  assert.equal(r.bandLabel, 'PAI 1, healthy');
  assert.match(r.notes[0], /Scored from 1 root/);
  assert.match(r.notes[0], DISCLOSING);
  assert.equal(pai({ r1: '6' }).valid, false);
  const e = pai({});
  assert.equal(e.valid, false);
  assert.match(e.message, ASKING);
});
