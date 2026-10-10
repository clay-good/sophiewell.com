// spec-v148 2.6: opioid equianalgesic / rotation converter. source daily dose ->
// OME -> target, then 25-50% cross-tolerance reduction. Methadone/buprenorphine
// excluded (not in the agent table).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { opioidConversion as oc } from '../../lib/rheum-v148.js';

test('tile example: 60 mg PO morphine -> oxycodone, 50% reduction', () => {
  const r = oc({ source: 'morphine-po', target: 'oxycodone-po', dose: 60, reduction: 'r50' });
  assert.equal(r.valid, true);
  assert.equal(r.ome, 60);
  assert.equal(r.equi, 40);   // 60 / 1.5
  assert.equal(r.starting, 20); // 40 * 0.5
});

test('oral:IV morphine 3:1', () => {
  const r = oc({ source: 'morphine-iv', target: 'morphine-po', dose: 10, reduction: 'r0' });
  assert.equal(r.ome, 30);
  assert.equal(r.equi, 30); // 30 / 1 PO morphine
});

test('hydromorphone PO factor 4', () => {
  const r = oc({ source: 'hydromorphone-po', target: 'morphine-po', dose: 6, reduction: 'r0' });
  assert.equal(r.ome, 24); // 6 * 4
});

test('to a fentanyl patch: read from the label Table 2, not a factor (120 mg/day -> 25 mcg/h)', () => {
  const r = oc({ source: 'morphine-po', target: 'fentanyl-td', dose: 120, reduction: 'r50' });
  assert.equal(r.starting, 25);
  assert.equal(r.reductionPct, 0);
  assert.match(r.band, /Table 2/);
  assert.equal(oc({ source: 'morphine-po', target: 'fentanyl-td', dose: 135 }).starting, 50);
  assert.equal(oc({ source: 'oxycodone-po', target: 'fentanyl-td', dose: 200 }).starting, 75); // 300 OME
  assert.equal(oc({ source: 'morphine-po', target: 'fentanyl-td', dose: 1124 }).starting, 300);
});

test('a patch is not sized under 60 mg/day or above the table, and is never a source', () => {
  assert.match(oc({ source: 'morphine-po', target: 'fentanyl-td', dose: 40 }).message, /opioid-tolerant/);
  assert.equal(oc({ source: 'morphine-po', target: 'fentanyl-td', dose: 1200 }).valid, false);
  const off = oc({ source: 'fentanyl-td', target: 'morphine-po', dose: 50 });
  assert.equal(off.valid, false);
  assert.match(off.message, /fatal overdosage/);
});

test('no reduction shows raw equianalgesic', () => {
  const r = oc({ source: 'morphine-po', target: 'oxycodone-po', dose: 30, reduction: 'r0' });
  assert.equal(r.equi, r.starting);
});

test('zero / blank / negative dose -> complete-the-fields', () => {
  assert.equal(oc({ source: 'morphine-po', target: 'oxycodone-po', dose: 0 }).valid, false);
  assert.equal(oc({ source: 'morphine-po', target: 'oxycodone-po', dose: null }).valid, false);
  assert.equal(oc({ source: 'morphine-po', target: 'oxycodone-po', dose: -5 }).valid, false);
});

test('missing source or target -> complete-the-fields', () => {
  assert.equal(oc({ target: 'oxycodone-po', dose: 60 }).valid, false);
  assert.equal(oc({ source: 'morphine-po', dose: 60 }).valid, false);
});

test('methadone/buprenorphine are not selectable agents', () => {
  assert.equal(oc({ source: 'methadone-po', target: 'morphine-po', dose: 10 }).valid, false);
  assert.equal(oc({ source: 'morphine-po', target: 'buprenorphine-td', dose: 60 }).valid, false);
});
