// spec-v1505 tool 1: which coverage-request and appeal rules apply.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whichAppealPath as w, COVERAGE, ITEMS } from '../../lib/appeal-path-v1505.js';

test('a pharmacy drug under Medicare Advantage runs on Part D rules; a medical drug on MA rules', () => {
  assert.match(w({ coverage: 'ma', item: 'pharmacy' }).path, /423 subpart M/);
  assert.match(w({ coverage: 'ma', item: 'medical-drug' }).path, /422 subpart M/);
});

test('a standalone Part D plan does not take medical items; Original Medicare does', () => {
  assert.match(w({ coverage: 'pdp', item: 'service' }).path, /405 subpart I/);
  assert.match(w({ coverage: 'original', item: 'service' }).band, /120 days/);
});

test('employer, Medicaid and individual plans', () => {
  assert.match(w({ coverage: 'erisa-self', item: 'service' }).band, /180 days/);
  assert.match(w({ coverage: 'erisa-insured', item: 'service' }).path, /state's external review/);
  assert.match(w({ coverage: 'medicaid-mco', item: 'service' }).band, /60 days/);
  assert.match(w({ coverage: 'medicaid-ffs', item: 'service' }).path, /no plan appeal/);
  assert.match(w({ coverage: 'marketplace', item: 'pharmacy' }).path, /147\.136/);
});

test('every combination answers; blanks ask', () => {
  for (const c of COVERAGE) for (const i of ITEMS) assert.equal(w({ coverage: c.value, item: i.value }).valid, true, `${c.value}/${i.value}`);
  assert.equal(w({}).valid, false);
  assert.equal(w({ coverage: 'ma' }).valid, false);
});
