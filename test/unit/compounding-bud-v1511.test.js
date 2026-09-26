// spec-v1511 tool 8: compounded preparation beyond-use date (USP BUD fact sheet limits).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compoundingBud as c } from '../../lib/compounding-bud-v1511.js';

const t = '2026-10-05T09:30';
const s = (o) => c({ prepType: 'sterile', compounded: t, ...o });

test('Category 1: 12 hours at room temperature, 24 refrigerated, no frozen limit', () => {
  assert.equal(s({ category: '1', storage: 'room' }).bud, '2026-10-05T21:30');
  assert.equal(s({ category: '1', storage: 'fridge' }).bud, '2026-10-06T09:30');
  assert.equal(s({ category: '1', storage: 'freezer' }).valid, false);
});

test('Category 2 rows from the fact sheet', () => {
  const a = { category: '2', method: 'aseptic', sterilityTested: 'no' };
  assert.equal(s({ ...a, nonsterileComponent: 'no', storage: 'room' }).bud, '2026-10-09T09:30');
  assert.equal(s({ ...a, nonsterileComponent: 'yes', storage: 'room' }).bud, '2026-10-06T09:30');
  assert.equal(s({ category: '2', method: 'aseptic', sterilityTested: 'yes', storage: 'freezer' }).bud, '2026-12-04T09:30');
  assert.equal(s({ category: '2', method: 'terminal', sterilityTested: 'no', storage: 'fridge' }).bud, '2026-11-02T09:30');
  assert.equal(s({ category: '2', method: 'terminal', sterilityTested: 'yes', storage: 'room' }).bud, '2026-11-19T09:30');
});

test('Category 3 needs sterility testing; 180 days frozen when terminally sterilized', () => {
  assert.equal(s({ category: '3', method: 'terminal', sterilityTested: 'no', storage: 'room' }).valid, false);
  assert.equal(s({ category: '3', method: 'terminal', sterilityTested: 'yes', storage: 'freezer' }).bud, '2027-04-03T09:30');
});

test('the earliest component expiration caps the BUD', () => {
  const r = s({ category: '3', method: 'terminal', sterilityTested: 'yes', storage: 'freezer', componentExpiry: '2026-12-31' });
  assert.equal(r.bud, '2026-12-31T23:59');
  assert.match(r.band, /earliest component expiration/);
  assert.equal(s({ category: '1', storage: 'room', componentExpiry: '2026-10-01' }).valid, false);
});

test('<795> nonsterile limits', () => {
  const n = (form) => c({ prepType: 'nonsterile', compounded: t, form }).bud;
  assert.equal(n('aqueous-nonpreserved'), '2026-10-19T09:30');
  assert.equal(n('aqueous-preserved'), '2026-11-09T09:30');
  assert.equal(n('nonaqueous-oral'), '2027-01-03T09:30');
  assert.equal(n('nonaqueous-other'), '2027-04-03T09:30');
});

test('blank choices ask; an untested aseptic prep asks about nonsterile components', () => {
  assert.equal(c({}).valid, false);
  assert.equal(c({ prepType: 'sterile' }).valid, false);
  assert.match(s({ category: '2', method: 'aseptic', sterilityTested: 'no', storage: 'room' }).message, /nonsterile/);
});
