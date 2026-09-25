// spec-v1449: Collin types of massive rotator cuff tears (Collin 2014; as given in Ladermann 2016).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collinRc } from '../../lib/collin-rc-v1449.js';

const NONE = { ssp: 'no', ssc: 'no', isc: 'no', isp: 'no', tm: 'no' };

test('the five types by torn components', () => {
  assert.equal(collinRc({ ...NONE, ssp: 'yes', ssc: 'yes' }).type, 'A');
  assert.equal(collinRc({ ...NONE, ssp: 'yes', ssc: 'yes', isc: 'yes' }).type, 'B');
  assert.equal(collinRc({ ...NONE, ssp: 'yes', ssc: 'yes', isp: 'yes' }).type, 'C');
  assert.equal(collinRc({ ...NONE, ssp: 'yes', isp: 'yes' }).type, 'D');
  assert.equal(collinRc({ ...NONE, ssp: 'yes', isp: 'yes', tm: 'yes' }).type, 'E');
});

test('a combination outside the five types is not forced into one', () => {
  const r = collinRc({ ...NONE, ssp: 'yes' });
  assert.equal(r.type, null);
  assert.match(r.band, /match none of the five patterns/);
  assert.equal(collinRc({ ...NONE, isc: 'yes', tm: 'yes' }).type, null);
  assert.match(collinRc(NONE).band, /nothing to classify/);
});

test('every component must be assessed', () => {
  assert.match(collinRc({ ...NONE, tm: '' }).message, /teres minor is still needed/);
});
