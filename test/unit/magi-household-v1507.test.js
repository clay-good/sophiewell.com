// spec-v1507 tool 8: Medicaid MAGI household (42 CFR 435.603).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { magiHousehold as m } from '../../lib/magi-household-v1507.js';

const base = { region: 'us', year: '2026', ageRule: '19' };
const size = (r, name) => r.people.find((p) => p.name === name).size;

test('a joint-filing family: everyone in one household; children not required to file are not counted', () => {
  const r = m({ ...base, people: 'Ana, 40, joint, -, Ben, -, yes, 30000, no\nBen, 42, joint, -, Ana, -, yes, 20000, no\nCara, 10, no, Ana, -, Ana;Ben, no, 0, no\nDev, 20, no, Ana, -, Ana;Ben, no, 5000, no' });
  for (const n of ['Ana', 'Ben', 'Cara', 'Dev']) assert.equal(size(r, n), 4, n);
  assert.equal(r.people[0].income, 50000);
  assert.equal(r.people[0].pct, 151.5);
});

test('a child claimed by a non-custodial parent falls to the non-filer rules', () => {
  const r = m({ ...base, people: 'Eve, 35, yes, -, -, -, yes, 25000, no\nFin, 8, no, Gus, -, Eve, no, 0, no' });
  assert.equal(size(r, 'Eve'), 1);
  assert.equal(size(r, 'Fin'), 2);
  assert.match(r.band, /differ/);
});

test('a married couple is always in each other\'s household, even filing separately', () => {
  const r = m({ ...base, people: 'Hal, 50, yes, -, Ivy, -, yes, 40000, no\nIvy, 48, no, -, Hal, -, no, 0, no' });
  assert.equal(size(r, 'Hal'), 2);
  assert.equal(size(r, 'Ivy'), 2);
});

test('a child living with both parents who file separately, claimed by one, uses the non-filer rules', () => {
  const r = m({ ...base, people: 'Jo, 30, yes, -, Kim, -, yes, 30000, no\nKim, 31, yes, -, Jo, -, yes, 10000, no\nLea, 5, no, Jo, -, Jo;Kim, no, 0, no' });
  assert.equal(size(r, 'Lea'), 3);
  assert.match(r.people.find((p) => p.name === 'Lea').rule, /\(f\)\(2\)\(ii\)/);
});

test('an adult claimed by a non-parent relative uses the non-filer rules', () => {
  const r = m({ ...base, people: 'Max, 60, yes, -, -, -, yes, 50000, no\nNed, 30, no, Max, -, -, no, 3000, no' });
  assert.equal(size(r, 'Max'), 2);
  assert.equal(size(r, 'Ned'), 1);
});

test('malformed lines and missing people ask', () => {
  assert.equal(m({ ...base }).valid, false);
  assert.match(m({ ...base, people: 'Ana, 40, yes' }).message, /9 items/);
  assert.match(m({ ...base, people: 'Ana, 40, yes, -, Zed, -, yes, 1, no' }).message, /not listed/);
  assert.equal(m({ people: 'Ana, 40, yes, -, -, -, yes, 1, no', year: '2026' }).valid, false);
});
