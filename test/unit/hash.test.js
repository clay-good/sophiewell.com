import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, buildHash, patchHash } from '../../lib/hash.js';

test('parseHash: empty hash defaults audience to "nurse" (spec-v29 §5.3)', () => {
  const r = parseHash('');
  assert.deepEqual(r, { route: '', sub: '', state: {}, audience: 'nurse', browse: '' });
});

test('parseHash: browse-disclosure state (spec-v7 section 3.4)', () => {
  assert.equal(parseHash('#b=open').browse, 'open');
  assert.equal(parseHash('#b=closed').browse, 'closed');
  // Unknown values fall back to the empty default (collapsed on first visit).
  assert.equal(parseHash('#b=garbage').browse, '');
  assert.equal(parseHash('#bmi&b=open').browse, 'open');
});

test('buildHash: browse open/closed round-trip, empty omits the key', () => {
  assert.equal(buildHash({ route: '', browse: 'open' }), '#b=open');
  assert.equal(buildHash({ route: 'bmi', browse: 'open' }), '#bmi&b=open');
  assert.equal(buildHash({ route: 'bmi', browse: 'closed' }), '#bmi&b=closed');
  assert.equal(buildHash({ route: 'bmi', browse: '' }), '#bmi');
  assert.equal(parseHash(buildHash({ route: '', browse: 'open' })).browse, 'open');
  assert.equal(parseHash(buildHash({ route: '', browse: 'closed' })).browse, 'closed');
});

test('parseHash: audience chip (spec-v6 §4.2.2)', () => {
  const r = parseHash('#a=patients');
  assert.equal(r.route, '');
  assert.equal(r.audience, 'patients');
});

test('parseHash: audience alongside route + state', () => {
  const r = parseHash('#bmi&q=' + encodeURIComponent('w=70') + '&a=clinicians');
  assert.equal(r.route, 'bmi');
  assert.equal(r.audience, 'clinicians');
  assert.deepEqual(r.state, { w: '70' });
});

test('buildHash: audience round-trip', () => {
  const h = buildHash({ route: '', audience: 'field' });
  assert.equal(parseHash(h).audience, 'field');
});

test('buildHash: audience=nurse (the default) omits the key (spec-v29 §5.3)', () => {
  assert.equal(buildHash({ route: 'bmi', audience: 'nurse' }), '#bmi');
});

test('buildHash: audience=all is non-default and emits a=all (spec-v29 §5.3)', () => {
  assert.equal(buildHash({ route: 'bmi', audience: 'all' }), '#bmi&a=all');
});

test('parseHash: route + sub', () => {
  const r = parseHash('#icd10/I10');
  assert.equal(r.route, 'icd10');
  assert.equal(r.sub, 'I10');
});

test('parseHash: legacy p= pinned list is silently ignored (spec-v8 §3.2 / §5.3)', () => {
  // Old `#p=icd10,bmi,egfr` bookmarks must resolve to the home view,
  // not 404. The parser tolerates the key but no field is returned.
  const r = parseHash('#&p=icd10,bmi,egfr');
  assert.equal(r.route, '');
  assert.equal(r.pinned, undefined);
});

test('parseHash: legacy p= without leading & still resolves to home (regression)', () => {
  const r = parseHash('#p=bmi');
  assert.equal(r.route, '');
  assert.equal(r.pinned, undefined);
});

test('parseHash: state-only without route', () => {
  const r = parseHash('#q=' + encodeURIComponent('w=70'));
  assert.equal(r.route, '');
  assert.deepEqual(r.state, { w: '70' });
});

test('parseHash: calculator state', () => {
  const r = parseHash('#bmi&q=' + encodeURIComponent('w=70;h=1.75'));
  assert.equal(r.route, 'bmi');
  assert.deepEqual(r.state, { w: '70', h: '1.75' });
});

test('parseHash: state + sub together (legacy p= ignored)', () => {
  const r = parseHash('#cockcroft-gault&p=bmi,egfr&q=' + encodeURIComponent('age=60;w=80;scr=1.0;sex=M'));
  assert.equal(r.route, 'cockcroft-gault');
  assert.deepEqual(r.state, { age: '60', w: '80', scr: '1.0', sex: 'M' });
});

test('buildHash: round-trip', () => {
  const input = { route: 'bmi', sub: '', state: { w: '70', h: '1.75' } };
  const h = buildHash(input);
  const out = parseHash(h);
  assert.equal(out.route, input.route);
  assert.deepEqual(out.state, input.state);
});

test('buildHash: empty state omits the key', () => {
  assert.equal(buildHash({ route: 'bmi' }), '#bmi');
});

test('buildHash: pinned field is dropped (spec-v8 §3.2)', () => {
  // Passing pinned (legacy callers) does not emit a p= segment.
  assert.equal(buildHash({ route: 'bmi', pinned: ['icd10'] }), '#bmi');
});

// patchHash merges a partial change into the *current* hash (read from
// window.location.hash), preserving the other fields. Used by the audience
// chip, the browse disclosure, and the deep-link state writers; previously
// covered only indirectly via the e2e deep-link tests.
test('patchHash: merges one field into the current hash, preserving the rest', () => {
  const prev = globalThis.window;
  try {
    globalThis.window = { location: { hash: '#bmi&a=patients' } };
    // Patching the browse flag keeps the route and audience.
    assert.equal(patchHash({ browse: 'open' }), '#bmi&a=patients&b=open');
    // Patching the audience overrides only that field.
    assert.equal(patchHash({ audience: 'clinicians' }), '#bmi&a=clinicians');
    // A state patch encodes and round-trips through parseHash.
    globalThis.window.location.hash = '#bmi';
    const patched = patchHash({ state: { w: '70' } });
    assert.deepEqual(parseHash(patched).state, { w: '70' });
    assert.equal(parseHash(patched).route, 'bmi');
  } finally {
    if (prev === undefined) delete globalThis.window;
    else globalThis.window = prev;
  }
});
