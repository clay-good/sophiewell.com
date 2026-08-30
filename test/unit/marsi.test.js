import test from 'node:test';
import assert from 'node:assert/strict';
import { marsi as m, INJURIES, PERSISTENCE_MINUTES } from '../../lib/marsi-v902.js';

test('marsi: the criterion and the three families', () => {
  assert.equal(PERSISTENCE_MINUTES, 30);
  assert.deepEqual([...new Set(INJURIES.map((i) => i.family))], ['Mechanical', 'Dermatitis', 'Other']);
  assert.equal(INJURIES.length, 7);
});

test('marsi: without persistence it is not a MARSI, whatever was seen', () => {
  // The reason the tile exists.
  for (const injury of INJURIES) {
    const r = m({ injury: injury.value });
    assert.equal(r.verdict, 'not-marsi', injury.value);
    assert.equal(r.abnormal, false, injury.value);
  }
  assert.match(m({}).band, /fades within half an hour is not/);
  assert.match(m({}).persistenceNote, /30-minute rule is the diagnostic criterion/);
});

test('marsi: persistence without a category still records the injury', () => {
  const r = m({ persistsThirtyMinutes: true });
  assert.equal(r.verdict, 'marsi-uncategorized');
  assert.equal(r.abnormal, true);
  assert.match(r.band, /has not been recorded/);
});

test('marsi: each injury reports its family', () => {
  for (const injury of INJURIES) {
    const r = m({ persistsThirtyMinutes: true, injury: injury.value });
    assert.equal(r.verdict, 'marsi', injury.value);
    assert.equal(r.family, injury.family, injury.value);
    assert.match(r.bandLabel, new RegExp(injury.family.toLowerCase()));
  }
});

test('marsi: the dermatitis note appears only for the two dermatitis injuries', () => {
  for (const injury of ['irritant-dermatitis', 'allergic-dermatitis']) {
    const r = m({ persistsThirtyMinutes: true, injury });
    assert.match(r.dermatitisNote, /distribution and timing/);
    assert.match(r.dermatitisNote, /which was seen, not which was proven/);
  }
  assert.equal(m({ persistsThirtyMinutes: true, injury: 'maceration' }).dermatitisNote, null);
});

test('marsi: a skin tear from adhesive is flagged as belonging to two records', () => {
  const r = m({ persistsThirtyMinutes: true, injury: 'skin-tear' });
  assert.match(r.skinTearNote, /both things at once/);
  assert.match(r.skinTearNote, /record both/);
  assert.equal(m({ persistsThirtyMinutes: true, injury: 'skin-stripping' }).skinTearNote, null);
});

test('marsi: the technique point and the scope are on every result', () => {
  for (const input of [{}, { persistsThirtyMinutes: true }, { persistsThirtyMinutes: true, injury: 'folliculitis' }]) {
    assert.match(m(input).techniqueNote, /mostly a technique problem/);
    assert.match(m(input).scopeNote, /does not diagnose an allergy/);
  }
});

test('marsi: an unknown injury falls back to uncategorized', () => {
  assert.equal(m({ persistsThirtyMinutes: true, injury: 'made-up' }).verdict, 'marsi-uncategorized');
  assert.equal(m({ persistsThirtyMinutes: true, injury: '' }).verdict, 'marsi-uncategorized');
});

test('marsi: the documented example', () => {
  const r = m({ persistsThirtyMinutes: true, injury: 'skin-stripping' });
  assert.equal(r.family, 'Mechanical');
  assert.match(r.band, /skin stripping/);
});
