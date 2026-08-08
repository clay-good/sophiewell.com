// spec-v671: ACR/EULAR Boolean-based remission for rheumatoid arthritis.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { acrEularBoolean } from '../../lib/acr-eular-boolean-v671.js';

test('all four met with PtGA <= 1 -> remission by both 2011 and 2022', () => {
  const r = acrEularBoolean({ tjc: '1', sjc: '0', crp: '0.5', ptga: '1' });
  assert.equal(r.valid, true);
  assert.equal(r.remission2011, true);
  assert.equal(r.remission2022, true);
  assert.equal(r.abnormal, false);
});

test('PtGA 2 splits the versions: 2022 remission, not 2011', () => {
  const r = acrEularBoolean({ tjc: '1', sjc: '1', crp: '1', ptga: '2' });
  assert.equal(r.remission2011, false);
  assert.equal(r.remission2022, true);
  assert.match(r.detail, /2022 Boolean 2\.0 definition but not 2011/);
});

test('PtGA > 2 fails both', () => {
  const r = acrEularBoolean({ tjc: '0', sjc: '0', crp: '0.2', ptga: '3' });
  assert.equal(r.remission2011, false);
  assert.equal(r.remission2022, false);
  assert.equal(r.abnormal, true);
  assert.match(r.detail, /patient global 3/);
});

test('any single joint/CRP failure breaks the AND', () => {
  assert.equal(acrEularBoolean({ tjc: '2', sjc: '0', crp: '0', ptga: '0' }).remission2022, false);
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '2', crp: '0', ptga: '0' }).remission2022, false);
  // CRP unit trap: 1 mg/dL passes, just above fails.
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '0', crp: '1', ptga: '0' }).remission2022, true);
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '0', crp: '1.1', ptga: '0' }).remission2022, false);
});

test('META example: TJC 1, SJC 0, CRP 0.5, PtGA 2 -> 2022 remission, not 2011', () => {
  const r = acrEularBoolean({ tjc: '1', sjc: '0', crp: '0.5', ptga: '2' });
  assert.equal(r.remission2022, true);
  assert.equal(r.remission2011, false);
  assert.match(r.band, /2022 Boolean 2\.0: in remission; 2011 Boolean: not in remission/);
});

test('inputs are validated (ranges, integers, units)', () => {
  assert.equal(acrEularBoolean({}).valid, false);
  assert.equal(acrEularBoolean({}).code, 'MISSING_INPUT');
  assert.equal(acrEularBoolean({ tjc: '1.5', sjc: '0', crp: '0', ptga: '0' }).field, 'tjc');
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '29', crp: '0', ptga: '0' }).field, 'sjc');
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '0', crp: '-1', ptga: '0' }).field, 'crp');
  assert.equal(acrEularBoolean({ tjc: '0', sjc: '0', crp: '0', ptga: '11' }).field, 'ptga');
});
