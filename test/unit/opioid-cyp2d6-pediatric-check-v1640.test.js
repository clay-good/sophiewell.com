// spec-v1640 tool 9: the codeine and tramadol label statements by age, procedure and CYP2D6 status.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { opioidCyp2d6PediatricCheck as chk, DRUGS } from '../../lib/opioid-cyp2d6-pediatric-check-v1640.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-13', validThrough: '2027-10-13', ...extra });
const NOW = new Date('2026-10-13T12:00:00Z');
const T = Object.fromEntries(DRUGS.map((d) => [d.setId, row(d.brand)]));
const c = (o, t = T) => chk(o, NOW, t);
const OTHER = 'another-use'; const TA = 'after-tonsillectomy-or-adenoidectomy';

test('under 12 is contraindicated whatever else is entered, for both drugs', () => {
  for (const drug of ['codeine', 'tramadol']) {
    for (const extra of [{}, { status: 'normal', procedure: OTHER }, { status: 'poor' }]) {
      const r = c({ drug, age: 11, ...extra });
      assert.deepEqual([r.flag, r.abnormal, r.applies.includes('under-12')], ['contraindicated', true, true]);
    }
  }
  assert.equal(c({ drug: 'codeine', age: 11.9 }).flag, 'contraindicated');
  assert.equal(c({ drug: 'codeine', age: 0 }).flag, 'contraindicated');
});

test('under 18 after tonsillectomy or adenoidectomy is contraindicated; at 18 it is not', () => {
  assert.equal(c({ drug: 'codeine', age: 15, procedure: TA, status: 'status-not-known' }).flag, 'contraindicated');
  assert.equal(c({ drug: 'tramadol', age: 17, procedure: TA, status: 'normal' }).flag, 'contraindicated');
  // At 18 the procedure question is not asked, and an answer to it is not used.
  assert.equal(c({ drug: 'tramadol', age: 18, procedure: TA, status: 'normal' }).flag, 'avoid-with-risk-factors');
});

test('an ultra-rapid metabolizer: not a section 4 contraindication, but section 5.6 says "should not use"', () => {
  const r = c({ drug: 'codeine', age: 15, procedure: OTHER, status: 'ultrarapid' });
  assert.deepEqual([r.flag, r.abnormal], ['ultra-rapid-should-not-use', true]);
  assert.deepEqual(r.applies, ['ultra-rapid', 'age-12-to-18-statement']);
  assert.match(r.notes.join(' '), /ultra-rapid metabolizers should not use Codeine Sulfate Tablets/);
  assert.equal(c({ drug: 'tramadol', age: 40, status: 'ultrarapid' }).flag, 'ultra-rapid-should-not-use');
});

test('ages 12 to 18 carry the "avoid" statement; an adult with another status has no statement', () => {
  for (const age of [12, 15, 18, 18.9]) assert.equal(c({ drug: 'tramadol', age, procedure: OTHER, status: 'normal' }).flag, 'avoid-with-risk-factors', String(age));
  for (const status of ['normal', 'intermediate', 'poor', 'status-not-known']) {
    const r = c({ drug: 'codeine', age: 19, status });
    assert.deepEqual([r.flag, r.abnormal], ['no-statement-applies', false]);
  }
  assert.match(c({ drug: 'codeine', age: 40, status: 'poor' }).notes.join(' '), /The label states no action for a poor metabolizer/);
  assert.match(c({ drug: 'codeine', age: 40, status: 'status-not-known' }).notes.join(' '), /The status is not known/);
});

test('each label is quoted as it prints', () => {
  assert.match(c({ drug: 'codeine', age: 11 }).notes[0], /"All children younger than 12 years of age"/);
  assert.match(c({ drug: 'tramadol', age: 11 }).notes[0], /"all children younger than 12 years of age"/);
  assert.match(c({ drug: 'tramadol', age: 15, procedure: TA, status: 'normal' }).notes.join(' '), /"postoperative management in children younger than 18/);
});

test('a blank entry is asked for, not assumed', () => {
  assert.match(c({}).message, /^Choose codeine or tramadol/);
  assert.match(c({ drug: 'codeine' }).message, /^Enter the age/);
  assert.match(c({ drug: 'codeine', age: 15, status: 'normal' }).message, /^Choose whether/);
  assert.match(c({ drug: 'codeine', age: 15, procedure: OTHER }).message, /^Choose the CYP2D6/);
  assert.match(c({ drug: 'codeine', age: 30 }).message, /^Choose the CYP2D6/);
  assert.equal(c({ drug: 'codeine', age: -1 }).valid, false);
});

test('a superseded label shows no statement', () => {
  const d = DRUGS[0];
  const r = c({ drug: 'codeine', age: 11 }, { ...T, [d.setId]: row('codeine', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.withheld, r.notes.length], [true, 0]);
  assert.doesNotMatch(r.band, /Contraindicated/);
});
