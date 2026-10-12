// spec-v1639 tool 14: discard date out of the refrigerator or in use, by the label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { outOfFridgeDiscardDate as fd, PRESETS } from '../../lib/out-of-fridge-discard-date-v1639.js';

const row = (label, extra = {}) => ({ label, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-12', validThrough: '2027-10-12', ...extra });
const T = {}; for (const p of PRESETS) { if (p.setId) T[p.setId] = row(p.brand); if (p.also) T[p.also.setId] = row(p.also.brand); }
const NOW = new Date('2026-10-12T12:00:00Z');
const K = 'inside-stated-range';
const run = (o, t = T) => fd(o, NOW, t);

test('the limits read on the labels', () => {
  const m = Object.fromEntries(PRESETS.filter((p) => p.setId).map((p) => [p.value, [p.room, p.inUse]]));
  assert.deepEqual(m, { lantus: [28, 28], humalog: [28, 28], 'aspart-vial-or-pen': [28, 28], basaglar: [28, 28], toujeo: [null, 56], tresiba: [56, 56], 'ozempic-pen': [null, 56], 'wegovy-single-dose': [28, null], 'tirzepatide-single-dose': [21, null], 'tirzepatide-multi-dose': [30, 30], trulicity: [14, null], victoza: [null, 30], saxenda: [null, 30], forteo: [null, 28], humira: [14, null], 'etanercept-single-dose': [30, null], 'etanercept-dose-tray': [14, null], dupixent: [14, null], repatha: [30, null], 'buprenorphine-er-unopened': [84, null] });
});

test('one limit: the date is the start plus the label days', () => {
  const r = run({ product: 'trulicity', kept: K, outOfFridge: '2026-10-01', asOf: '2026-10-10' });
  assert.deepEqual([r.discardDate, r.bindingLimit, r.daysLeft, r.abnormal], ['2026-10-15', 'room-temperature limit', 5, false]);
  assert.equal(run({ product: 'ozempic-pen', kept: K, firstUse: '2026-10-01' }).discardDate, '2026-11-26');
  assert.equal(run({ product: 'buprenorphine-er-unopened', kept: K, outOfFridge: '2026-10-01' }).discardDate, '2026-12-24');
});

test('two limits: the earlier date binds and is named', () => {
  const r = run({ product: 'humalog', kept: K, outOfFridge: '2026-10-01', firstUse: '2026-10-10' });
  assert.deepEqual([r.discardDate, r.bindingLimit], ['2026-10-29', 'room-temperature limit']);
  assert.match(r.note, /total of 28 days, including both/);
  const l = run({ product: 'lantus', kept: K, outOfFridge: '2026-10-10', firstUse: '2026-10-01' });
  assert.deepEqual([l.discardDate, l.bindingLimit], ['2026-10-29', 'in-use limit']);
  assert.match(l.note, /lists the two limits separately/);
});

test('the expiration date caps the discard date; a past date is flagged', () => {
  const r = run({ product: 'victoza', kept: K, firstUse: '2026-10-01', expirationDate: '2026-10-20', asOf: '2026-10-25' });
  assert.deepEqual([r.discardDate, r.bindingLimit, r.daysLeft, r.flag], ['2026-10-20', 'expiration date', -5, 'past-the-discard-date']);
});

test('a date the label has no limit for is refused or said', () => {
  assert.match(run({ product: 'toujeo', kept: K, outOfFridge: '2026-10-01' }).message, /gives no unopened room-temperature period/);
  assert.match(run({ product: 'humira', kept: K, firstUse: '2026-10-01' }).message, /runs from leaving the refrigerator, not from first use/);
  assert.match(run({ product: 'toujeo', kept: K, outOfFridge: '2026-10-01', firstUse: '2026-10-03' }).note, /date it left the refrigerator is not used/);
});

test('above the label range: no figure; kept is required', () => {
  const r = run({ product: 'dupixent', kept: 'beyond-stated-range', outOfFridge: '2026-10-01' });
  assert.deepEqual([r.flag, r.discardDate], ['outside-the-label-range', undefined]);
  assert.match(run({ product: 'dupixent', outOfFridge: '2026-10-01' }).message, /^Choose whether it was kept within/);
});

test('another product: the reader enters the limit', () => {
  const r = run({ product: 'other-product', ownInUseDays: 42, firstUse: '2026-10-01' });
  assert.deepEqual([r.discardDate, r.labelUrl], ['2026-11-12', undefined]);
  assert.match(run({ product: 'other-product', firstUse: '2026-10-01' }).message, /^Enter the label's limit/);
});

test('a withheld label shows no date', () => {
  const p = PRESETS.find((x) => x.value === 'repatha');
  const r = run({ product: 'repatha', kept: K, outOfFridge: '2026-10-01' }, { ...T, [p.setId]: row('Repatha', { supersededOn: '2026-11-01' }) });
  assert.deepEqual([r.withheld, r.discardDate], [true, undefined]);
  assert.equal(run({}).valid, false);
});
