// spec-v188 §2: leukemia / lymphoma staging & prognostic instruments.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { binetCll, raiCll, annArbor, flipi2, hasfordCml } from '../../lib/heme-staging-v188.js';

test('binet: A/B/C boundaries', () => {
  assert.equal(binetCll({ areas: '1', hb: '13', platelets: '200' }).stage, 'A');
  assert.equal(binetCll({ areas: '4', hb: '12', platelets: '150' }).stage, 'B');
  assert.equal(binetCll({ areas: '1', hb: '9', platelets: '150' }).stage, 'C'); // anemia
  assert.equal(binetCll({ areas: '5', hb: '13', platelets: '80' }).stage, 'C'); // thrombocytopenia overrides area count
});
test('binet: guards', () => {
  assert.equal(binetCll({ areas: '1', hb: '13' }).valid, false);
  assert.equal(binetCll({ areas: '9', hb: '13', platelets: '200' }).valid, false); // areas > 5
  assert.equal(binetCll({}).valid, false);
});

test('rai: highest feature sets the stage', () => {
  assert.equal(raiCll({ lymphocytosis: '1', hb: '14', platelets: '250' }).stage, '0');
  assert.equal(raiCll({ lymphocytosis: '1', lymphadenopathy: '1', hb: '14', platelets: '250' }).stage, 'I');
  assert.equal(raiCll({ lymphocytosis: '1', organomegaly: '1', hb: '14', platelets: '250' }).stage, 'II');
  assert.equal(raiCll({ lymphocytosis: '1', organomegaly: '1', hb: '10', platelets: '250' }).stage, 'III'); // anemia
  assert.equal(raiCll({ lymphocytosis: '1', hb: '10', platelets: '80' }).stage, 'IV'); // thrombocytopenia is highest
  assert.equal(raiCll({ lymphocytosis: '1', hb: '14', platelets: '250' }).risk, 'low');
  assert.equal(raiCll({ lymphocytosis: '1', hb: '10', platelets: '80' }).risk, 'high');
});
test('rai: lymphocytosis required', () => {
  assert.equal(raiCll({ hb: '14', platelets: '250' }).valid, false);
  assert.equal(raiCll({ lymphocytosis: '1', hb: '14' }).valid, false);
});

test('ann arbor: stage & suffix', () => {
  assert.equal(annArbor({ distribution: 'single-region' }).stage, 'IA');
  assert.equal(annArbor({ distribution: 'multi-same-side', bSymptoms: '1' }).stage, 'IIB');
  assert.equal(annArbor({ distribution: 'both-sides' }).advanced, true);
  assert.equal(annArbor({ distribution: 'disseminated', extranodal: '1', splenic: '1' }).stage, 'IVA ES');
  assert.equal(annArbor({}).valid, false);
});

test('flipi-2: counts and bands', () => {
  assert.equal(flipi2({}).risk, 'low');
  assert.equal(flipi2({ ageOver60: '1' }).risk, 'intermediate');
  assert.equal(flipi2({ ageOver60: '1', b2m: '1', hbUnder12: '1' }).risk, 'high');
  assert.equal(flipi2({ ageOver60: '1', b2m: '1', hbUnder12: '1' }).score, 3);
});

test('hasford: formula and bands', () => {
  const low = hasfordCml({ age: '45', spleen: '0', platelets: '300', blasts: '1', eosinophils: '1', basophils: '1' });
  assert.equal(low.risk, 'low');
  assert.ok(low.score <= 780);
  const high = hasfordCml({ age: '60', spleen: '10', platelets: '400', blasts: '5', eosinophils: '5', basophils: '5' });
  assert.equal(high.score, 1789);
  assert.equal(high.risk, 'high');
});
test('hasford: guards', () => {
  assert.equal(hasfordCml({ age: '60', spleen: '10', platelets: '400', blasts: '5', eosinophils: '5' }).valid, false);
  assert.equal(hasfordCml({}).valid, false);
});
