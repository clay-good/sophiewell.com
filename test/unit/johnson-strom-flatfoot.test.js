// spec-v1421: Johnson and Strom flatfoot staging with Myerson stage IV (Abousayed 2016, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { johnsonStromFlatfoot as js } from '../../lib/johnson-strom-flatfoot-v1421.js';

test('every Table 1 column derives its own stage and is concordant', () => {
  const rows = [
    ['I', { deformity: 'absent', ankle: 'none', heelRise: 'mild', toes: 'absent', arthritis: 'none' }],
    ['II', { deformity: 'flexible', ankle: 'none', heelRise: 'marked', toes: 'present', arthritis: 'none' }],
    ['III', { deformity: 'fixed', ankle: 'none', heelRise: 'marked', toes: 'present', arthritis: 'present' }],
    ['IVA', { deformity: 'fixed', ankle: 'flexible' }],
    ['IVB', { deformity: 'fixed', ankle: 'fixed' }],
  ];
  for (const [stage, input] of rows) {
    const r = js(input);
    assert.equal(r.stage, stage, stage);
    assert.equal(r.concordant, true, stage);
    assert.equal(r.bandLabel, `Stage ${stage}`);
  }
  assert.equal(js(rows[0][1]).abnormal, false);
  assert.equal(js(rows[1][1]).abnormal, true);
});

test('the exact band for stage II', () => {
  assert.equal(js({ deformity: 'flexible', ankle: 'none' }).band,
    'Johnson and Strom stage II: an elongated posterior tibial tendon with a flexible flatfoot deformity.');
});

test('ankle valgus makes stage IV, and a non-fixed hindfoot under it is flagged', () => {
  const r = js({ deformity: 'flexible', ankle: 'fixed' });
  assert.equal(r.stage, 'IVB');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /fixed hindfoot valgus/);
});

test('examination findings that disagree with the stage are reported, not hidden', () => {
  const r = js({ deformity: 'absent', ankle: 'none', toes: 'present', heelRise: 'marked' });
  assert.equal(r.stage, 'I');
  assert.equal(r.concordant, false);
  assert.match(r.notes[0], /"too many toes" sign is present \(the table has absent\)/);
  assert.match(r.notes[0], /heel-rise weakness is marked \(the table has mild\)/);
  const iii = js({ deformity: 'fixed', ankle: 'none', arthritis: 'none' });
  assert.equal(iii.stage, 'III');
  assert.match(iii.notes[0], /no arthritic change \(the table has arthritic change\)/);
});

test('every answer says the staging is unvalidated and incomplete', () => {
  const r = js({ deformity: 'absent', ankle: 'none' });
  assert.ok(r.notes.some((n) => /have not been studied/.test(n)));
  assert.ok(r.notes.some((n) => /spring and deltoid ligaments/.test(n)));
  assert.match(r.note, /does not choose the treatment/);
});

test('missing required findings are asked for; a blank ankle is not read as normal', () => {
  assert.match(js({}).message, /hindfoot deformity/);
  assert.match(js({ deformity: 'flexible' }).message, /valgus/);
  assert.equal(js({ deformity: 'flexible', ankle: '' }).valid, false);
});
