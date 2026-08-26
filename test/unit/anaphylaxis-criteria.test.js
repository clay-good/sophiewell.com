// spec-v803: 2020 WAO anaphylaxis diagnostic criteria.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { anaphylaxisCriteria } from '../../lib/anaphylaxis-criteria-v803.js';

test('nothing selected -> not met, and it says that does not exclude anaphylaxis', () => {
  const r = anaphylaxisCriteria({});
  assert.equal(r.valid, true);
  assert.equal(r.met, false);
  assert.match(r.band, /does NOT exclude/);
});

test('criterion 1 needs skin AND another system', () => {
  assert.equal(anaphylaxisCriteria({ skinOrMucosal: true }).criterion1, false);
  assert.equal(anaphylaxisCriteria({ respiratory: true }).criterion1, false);
  assert.equal(anaphylaxisCriteria({ skinOrMucosal: true, respiratory: true }).criterion1, true);
});

test('any of the three systems satisfies criterion 1, including the GI one added in 2020', () => {
  for (const s of ['respiratory', 'circulatory', 'gastrointestinal']) {
    assert.equal(anaphylaxisCriteria({ skinOrMucosal: true, [s]: true }).criterion1, true, s);
  }
});

test('criterion 2 works with NO skin involvement at all', () => {
  for (const f of ['hypotension', 'bronchospasm', 'laryngeal']) {
    const r = anaphylaxisCriteria({ knownAllergen: true, [f]: true });
    assert.equal(r.criterion2, true, f);
    assert.equal(r.criterion1, false, f);
    assert.equal(r.met, true, f);
  }
});

test('criterion 2 needs the allergen exposure as well as the feature', () => {
  assert.equal(anaphylaxisCriteria({ hypotension: true }).criterion2, false);
  assert.equal(anaphylaxisCriteria({ knownAllergen: true }).criterion2, false);
});

test('the two criteria are ALTERNATIVES: either alone is enough, and both can hold', () => {
  const one = anaphylaxisCriteria({ skinOrMucosal: true, respiratory: true });
  assert.equal(one.met, true);
  assert.deepEqual(one.routes, ['criterion 1']);

  const two = anaphylaxisCriteria({ knownAllergen: true, hypotension: true });
  assert.deepEqual(two.routes, ['criterion 2']);

  const both = anaphylaxisCriteria({ skinOrMucosal: true, gastrointestinal: true, knownAllergen: true, laryngeal: true });
  assert.deepEqual(both.routes, ['criterion 1', 'criterion 2']);
});

test('a met result points toward epinephrine', () => {
  assert.match(anaphylaxisCriteria({ skinOrMucosal: true, respiratory: true }).band, /[Ee]pinephrine/);
});
