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

// spec-v1739: blasts, eosinophils and basophils are shares of one differential.
test('hasford: a differential summing past 100% is refused; exactly 100 answers', () => {
  const b = { age: '60', spleen: '10', platelets: '400' };
  assert.match(hasfordCml({ ...b, blasts: '60', eosinophils: '30', basophils: '30' }).message, /\(120\) is above the whole differential/);
  assert.equal(hasfordCml({ ...b, blasts: '60', eosinophils: '20', basophils: '20' }).valid, true);
});

// spec-v1753: an envelope lib/bounds.js already declares; each tool refused ten times the ceiling but answered just past it.
test('spec-v1753: binetCll refuses platelets past the 2000 x10^9/L envelope', () => {
  assert.equal(binetCll({ areas: 4, hb: 12, platelets: 3000 }).valid, false);
  assert.match(binetCll({ areas: 4, hb: 12, platelets: 3000 }).message, /platelet/i);
  assert.equal(binetCll({ areas: 4, hb: 12, platelets: 2000 }).valid, true);
  assert.equal(binetCll({ areas: 4, hb: 12, platelets: 150 }).valid, true);
});
test('spec-v1753: raiCll refuses platelets past the 2000 x10^9/L envelope', () => {
  const base = { lymphocytosis: true, lymphadenopathy: true, hb: 14 };
  assert.equal(raiCll({ ...base, platelets: 3000 }).valid, false);
  assert.match(raiCll({ ...base, platelets: 3000 }).message, /platelet/i);
  assert.equal(raiCll({ ...base, platelets: 2000 }).valid, true);
  assert.equal(raiCll({ ...base, platelets: 250 }).valid, true);
});
test('spec-v1753: hasfordCml refuses platelets past the 2000 x10^9/L envelope', () => {
  const base = { age: 60, spleen: 10, blasts: 5, eosinophils: 5, basophils: 5 };
  assert.equal(hasfordCml({ ...base, platelets: 3000 }).valid, false);
  assert.match(hasfordCml({ ...base, platelets: 3000 }).message, /platelet/i);
  assert.equal(hasfordCml({ ...base, platelets: 2000 }).valid, true);
  assert.equal(hasfordCml({ ...base, platelets: 400 }).valid, true);
});

// spec-v1755: a count of involved lymphoid areas has no value between its steps; a fraction was staged.
test('spec-v1755: binetCll refuses a half area; whole counts and the worked example answer', () => {
  const ex = { areas: 4, hb: 12, platelets: 150 };
  assert.equal(binetCll(ex).stage, 'B');
  const half = binetCll({ ...ex, areas: '2.5' });
  assert.equal(half.valid, false);
  assert.match(half.message, /whole number/);
  assert.equal(binetCll({ ...ex, areas: '2' }).stage, 'A');
});
