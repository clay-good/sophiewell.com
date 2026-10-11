// spec-v1633 tool 8: basal insulin switch by the target product's label.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { basalInsulinSwitch as d, TARGETS } from '../../lib/basal-insulin-switch-v1633.js';
import { labelRow } from '../../lib/label-row.js';

const now = new Date('2026-10-11T12:00:00Z');
const at = (to, from, frequency, totalUnits = 50, population) => d({ to, from, frequency, totalUnits, population }, now);
const pct = (...a) => at(...a).percent;

test('the four labels answer', () => {
  for (const t of TARGETS) assert.equal(labelRow(t.setId, now).answers, true, t.brand);
});

test('Lantus: three switches have a figure and nothing else does', () => {
  assert.deepEqual([pct('lantus', 'glargine300', 'once'), pct('lantus', 'nph', 'once'), pct('lantus', 'nph', 'twice')], [80, 100, 80]);
  assert.equal(at('lantus', 'nph', 'twice', 50).startUnits, 40);
  for (const [from, freq] of [['detemir', 'once'], ['degludec', 'once'], ['glargine100', 'once'], ['glargine300', 'twice']]) {
    const r = at('lantus', from, freq);
    assert.deepEqual([r.flag, r.startUnits, r.abnormal], ['no-recommendation-given', undefined, true], `${from} ${freq}`);
    assert.match(r.band, /gives no figure/);
  }
});

test('Basaglar: same dose from glargine 100, 80% from glargine 300 once daily and from NPH twice daily', () => {
  assert.deepEqual([pct('basaglar', 'glargine100', 'once'), pct('basaglar', 'glargine300', 'once'), pct('basaglar', 'nph', 'twice')], [100, 80, 80]);
  assert.equal(at('basaglar', 'nph', 'once').flag, 'no-recommendation-given');
  assert.match(at('basaglar', 'detemir', 'once').band, /a change in the dose of the basal insulin may be required/);
});

test('Toujeo: same dose once daily, 80% of twice-daily NPH or detemir', () => {
  for (const from of ['glargine100', 'nph', 'detemir', 'degludec']) assert.equal(pct('toujeo', from, 'once'), 100, from);
  assert.match(at('toujeo', 'glargine100', 'once').notes.join(' '), /higher daily dose of Toujeo will be needed/);
  assert.doesNotMatch(at('toujeo', 'nph', 'once').notes.join(' '), /higher daily dose/);
  assert.deepEqual([pct('toujeo', 'nph', 'twice'), pct('toujeo', 'detemir', 'twice')], [80, 80]);
  assert.equal(at('toujeo', 'glargine100', 'twice').flag, 'no-recommendation-given');
});

test('Tresiba: adults the same total, children 80%, and the choice is asked for', () => {
  assert.deepEqual([pct('tresiba', 'nph', 'twice', 50, 'adult'), pct('tresiba', 'glargine100', 'once', 50, 'pediatric')], [100, 80]);
  assert.match(at('tresiba', 'nph', 'once').message, /adult or pediatric/);
  assert.match(at('tresiba', 'nph', 'once', 21, 'pediatric').notes.join(' '), /1 year of age and older/);
});

test('fractions round down, and the result says that is the tool\'s convention', () => {
  const r = at('tresiba', 'glargine100', 'once', 21, 'pediatric'); // 16.8
  assert.equal(r.startUnits, 16);
  assert.match(r.notes.join(' '), /16\.8 units\. The labels state no rounding rule; rounding down/);
  assert.doesNotMatch(at('lantus', 'nph', 'twice', 50).notes.join(' '), /rounding/);
  assert.equal(at('lantus', 'glargine300', 'once', 1).flag, 'no-recommendation-given'); // 0.8 units
});

test('nothing is defaulted', () => {
  assert.match(d({}, now).message, /being started/);
  assert.match(d({ to: 'lantus' }, now).message, /being stopped/);
  assert.match(d({ to: 'toujeo', from: 'glargine300' }, now).message, /two different insulins/);
  assert.match(d({ to: 'tresiba', from: 'degludec' }, now).message, /two different insulins/);
  assert.match(d({ to: 'lantus', from: 'nph' }, now).message, /once or twice daily/);
  assert.match(d({ to: 'lantus', from: 'nph', frequency: 'once' }, now).message, /^Enter the current total daily basal dose/);
});

test('a superseded label withholds its figure', () => {
  const t = TARGETS[0];
  const T = { [t.setId]: { label: t.brand, splVersion: 1, publishedOn: '2026-01-01', verifiedOn: '2026-10-11', validThrough: '2027-10-11', supersededOn: '2026-10-12' } };
  const r = d({ to: 'lantus', from: 'nph', frequency: 'twice', totalUnits: 50 }, now, T);
  assert.deepEqual([r.withheld, r.startUnits], [true, undefined]);
});
