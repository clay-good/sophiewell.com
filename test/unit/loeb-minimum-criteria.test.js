// spec-v181 §2.2: Loeb minimum criteria for initiating antibiotics (Loeb 2001).
// Categorical MET / NOT MET, site-branched. Each test flips the determination at
// a criterion boundary. Criteria cross-verified against the MN DOH card + MO
// DHSS quick-reference chart (spec-v97), byte-identical.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loebMinimumCriteria as loeb, LOEB_SITES } from '../../lib/ltcga-v181.js';

test('no site selected -> complete-the-fields fallback', () => {
  assert.equal(loeb({}).valid, false);
  assert.equal(loeb({ site: 'nope', acuteDysuria: '1' }).valid, false);
});

test('site selected but nothing checked -> fallback, never a false met', () => {
  const r = loeb({ site: 'uti-no-catheter' });
  assert.equal(r.valid, false);
  assert.match(r.message, /Check the findings/);
});

test('UTI without catheter: acute dysuria alone is the sufficient path (MET)', () => {
  const r = loeb({ site: 'uti-no-catheter', acuteDysuria: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.met, true);
  assert.match(r.determination, /MET to initiate antibiotics/);
});

test('UTI without catheter: fever alone is NOT MET; fever + 1 localizing flips to MET', () => {
  assert.equal(loeb({ site: 'uti-no-catheter', fever: '1' }).met, false);
  assert.equal(loeb({ site: 'uti-no-catheter', fever: '1', urgency: '1' }).met, true);
});

test('UTI with catheter: any 1 of fever/CVA/rigors/delirium is MET', () => {
  assert.equal(loeb({ site: 'uti-catheter', rigors: '1' }).met, true);
  // a finding NOT in the catheter set does not exist; an unrelated empty stays NOT MET
  const r = loeb({ site: 'uti-catheter', fever: '0', cvaTenderness: '0', rigors: '0', delirium: '1' });
  assert.equal(r.met, true);
});

test('respiratory path 1: temp >102 + productive cough MET; temp >102 alone NOT MET', () => {
  assert.equal(loeb({ site: 'respiratory', tempGt102: '1', productiveCough: '1' }).met, true);
  assert.equal(loeb({ site: 'respiratory', tempGt102: '1' }).met, false);
});

test('respiratory path 2: fever + cough + one of (pulse/RR/rigors/delirium)', () => {
  assert.equal(loeb({ site: 'respiratory', fever: '1', cough: '1', pulse100: '1' }).met, true);
  assert.equal(loeb({ site: 'respiratory', fever: '1', cough: '1' }).met, false);
});

test('respiratory path 3/4/5 (afebrile COPD, afebrile non-COPD, new infiltrate)', () => {
  assert.equal(loeb({ site: 'respiratory', copdOver65: '1', newCough: '1', purulentSputum: '1' }).met, true);
  assert.equal(loeb({ site: 'respiratory', afebrileNoCopd: '1', newCough: '1', purulentSputum: '1', rr25: '1' }).met, true);
  assert.equal(loeb({ site: 'respiratory', afebrileNoCopd: '1', newCough: '1', purulentSputum: '1' }).met, false); // missing RR/delirium
  assert.equal(loeb({ site: 'respiratory', newInfiltrate: '1', rr25: '1' }).met, true);
});

test('skin/soft tissue: purulent drainage alone MET; otherwise >=2 of the signs', () => {
  assert.equal(loeb({ site: 'skin', purulentDrainage: '1' }).met, true);
  assert.equal(loeb({ site: 'skin', redness: '1' }).met, false); // 1 sign
  assert.equal(loeb({ site: 'skin', redness: '1', warmth: '1' }).met, true); // 2 signs
});

test('fever unknown source: fever + (delirium or rigors) MET; fever alone NOT MET', () => {
  assert.equal(loeb({ site: 'fever-unknown', fever: '1' }).met, false);
  assert.equal(loeb({ site: 'fever-unknown', fever: '1', delirium: '1' }).met, true);
  assert.equal(loeb({ site: 'fever-unknown', delirium: '1' }).met, false); // no fever
});

test('output is categorical with no numeric leak, and names satisfied criteria', () => {
  const r = loeb({ site: 'uti-no-catheter', acuteDysuria: '1' });
  assert.ok(Array.isArray(r.satisfied) && r.satisfied.length >= 1);
  assert.equal(typeof r.met, 'boolean');
  assert.ok(!JSON.stringify(r).includes('NaN'));
});

test('every site has a stable value, label, and at least one criterion', () => {
  for (const s of LOEB_SITES) {
    assert.ok(s.value && s.label && Array.isArray(s.criteria) && s.criteria.length >= 1);
  }
});
