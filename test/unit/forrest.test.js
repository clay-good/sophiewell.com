// spec-v155 2.3: Forrest classification (Forrest 1974). A deterministic
// input -> class mapping of UGI-bleeding endoscopic stigmata. Ia/Ib/IIa are
// high-risk stigmata (endoscopic therapy); IIb intermediate; IIc/III low-risk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forrest } from '../../lib/suites-v155.js';

test('tile example: IIa -> non-bleeding visible vessel, high-risk stigmata', () => {
  const r = forrest({ klass: 'IIa' });
  assert.equal(r.valid, true);
  assert.equal(r.klass, 'IIa');
  assert.equal(r.tier, 'high');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /high-risk stigmata/);
});

test('IIa -> IIc risk-tier flip', () => {
  assert.equal(forrest({ klass: 'IIa' }).tier, 'high');
  assert.equal(forrest({ klass: 'IIa' }).abnormal, true);
  const iic = forrest({ klass: 'IIc' });
  assert.equal(iic.tier, 'low');
  assert.equal(iic.abnormal, false);
  assert.match(iic.band, /low-risk stigmata/);
});

test('IIb adherent clot is intermediate; III clean base is low', () => {
  assert.equal(forrest({ klass: 'IIb' }).tier, 'intermediate');
  assert.equal(forrest({ klass: 'IIb' }).abnormal, false);
  const iii = forrest({ klass: 'III' });
  assert.equal(iii.tier, 'low');
  assert.match(iii.band, /clean ulcer base/);
});

test('every defined class resolves to one cell; an unknown finding is valid:false', () => {
  for (const k of ['Ia', 'Ib', 'IIa', 'IIb', 'IIc', 'III']) {
    const r = forrest({ klass: k });
    assert.equal(r.valid, true);
    assert.ok(r.band && !/NaN|undefined/.test(r.band));
  }
  assert.equal(forrest({ klass: '' }).valid, false);
  assert.equal(forrest({ klass: 'IV' }).valid, false);
  assert.equal(forrest({}).valid, false);
  assert.match(forrest({}).message, /Forrest/);
});
