import test from 'node:test';
import assert from 'node:assert/strict';
import { skinTear as s, TYPES } from '../../lib/skin-tear-v900.js';

test('skin-tear: the three published types', () => {
  assert.deepEqual(TYPES.map((t) => [t.value, t.number]), [['type-1', 1], ['type-2', 2], ['type-3', 3]]);
});

test('skin-tear: the type is derived from the two observations', () => {
  assert.equal(s({ flapPresent: true, flapCoversWholeBed: true }).type, 'type-1');
  assert.equal(s({ flapPresent: true }).type, 'type-2');
  assert.equal(s({}).type, 'type-3');
  // Covering the bed without a flap is not a coherent reading, and the flap wins.
  assert.equal(s({ flapCoversWholeBed: true }).type, 'type-3');
  assert.match(s({ flapPresent: true }).derivationNote, /present, but it does not cover the whole wound bed/);
  assert.match(s({}).derivationNote, /absent, so the wound bed is entirely exposed/);
});

test('skin-tear: a directly entered type wins, and a clash is called out', () => {
  const clash = s({ type: 'type-1', flapPresent: false });
  assert.equal(clash.type, 'type-1');
  assert.equal(clash.derivedType, 'type-3');
  assert.match(clash.disagreementNote, /do not agree/);
  assert.match(clash.disagreementNote, /worth re-reading the wound/);
  // Agreeing, there is nothing to flag.
  const agree = s({ type: 'type-2', flapPresent: true });
  assert.equal(agree.disagreementNote, null);
  assert.match(agree.derivationNote, /entered directly/);
});

test('skin-tear: it is not a pressure injury stage, said on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, { flapPresent: true }, { type: 'type-1' }]) {
    assert.match(s(input).notPressureNote, /not staged like a pressure injury/);
    assert.match(s(input).notPressureNote, /travels into the care plan and the incident report/);
    assert.match(s(input).flapNote, /describes the flap, not the depth or the cause/);
  }
});

test('skin-tear: type 1 is not flagged and the other two are', () => {
  assert.equal(s({ flapPresent: true, flapCoversWholeBed: true }).abnormal, false);
  assert.equal(s({ flapPresent: true }).abnormal, true);
  assert.equal(s({}).abnormal, true);
});

test('skin-tear: what it does not do is stated', () => {
  for (const input of [{}, { flapPresent: true }]) {
    assert.match(s(input).dressingNote, /does not choose a dressing/);
    assert.match(s(input).preventionNote, /preventable harm in most settings/);
    assert.match(s(input).scopeNote, /does not stage a pressure injury/);
  }
});

test('skin-tear: an unknown type falls back to the derivation', () => {
  assert.equal(s({ type: 'made-up', flapPresent: true }).type, 'type-2');
  assert.equal(s({ type: '', flapPresent: true }).type, 'type-2');
});

test('skin-tear: the documented example', () => {
  const r = s({ flapPresent: true });
  assert.equal(r.typeNumber, 2);
  assert.equal(r.bandLabel, 'ISTAP type 2');
});
