// spec-v1093: the shared footing for instruments that sum body parts.
//
// One sentence, written once, because this repo has paid three times over for a
// rule that lived in two places and quietly stopped agreeing (docs/spec-v1042.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldEntered, regionFooting } from '../../lib/region-footing-v1093.js';

test('fieldEntered separates a written zero from a blank', () => {
  // The whole programme turns on this distinction.
  assert.equal(fieldEntered(0), true);
  assert.equal(fieldEntered('0'), true);
  assert.equal(fieldEntered(''), false);
  assert.equal(fieldEntered('   '), false);
  assert.equal(fieldEntered(null), false);
  assert.equal(fieldEntered(undefined), false);
  assert.equal(fieldEntered('not a number'), false);
});

test('regionFooting is silent only when there is nothing to disclose', () => {
  assert.equal(regionFooting(4, 4, []), null, 'everything entered');
  assert.equal(regionFooting(3, 4, []), null, 'nothing named as missing');

  // Nothing entered at all is the WORST version of this, not the exempt one.
  // An earlier draft returned null here, deferring to a gate it had not checked.
  const none = regionFooting(0, 4, ['head/neck', 'upper limbs', 'trunk', 'lower limbs']);
  assert.match(none, /Scored from 0 of 4 regions/);
  assert.match(none, /can only rise/);
});

test('regionFooting reads in each instrument\'s own nouns', () => {
  const one = regionFooting(3, 4, ['head/neck']);
  assert.match(one, /head\/neck was not entered/, 'singular verb');

  const two = regionFooting(2, 4, ['head/neck', 'trunk']);
  assert.match(two, /head\/neck and trunk were not entered/, 'plural verb, and joined with "and"');

  const three = regionFooting(1, 4, ['a', 'b', 'c']);
  assert.match(three, /a, b and c were not entered/, 'serial list keeps the final "and"');

  // The singular is explicit because stripping a trailing "s" would print
  // "lesion categorie" -- a footing that exists to be read carefully cannot be
  // the thing with the typo in it.
  const cats = regionFooting(2, 3, ['tumor or ulcer'], {
    unit: 'lesion categories', singular: 'lesion category',
  });
  assert.match(cats, /2 of 3 lesion categories/);
  assert.match(cats, /An unscored lesion category contributes 0/);
  assert.doesNotMatch(cats, /categorie /);
});

test('the disclosure lands inside the shared DISCLOSING vocabulary', async () => {
  // The rule from docs/spec-v1091.md: word the tile to fit the shared list
  // rather than widening the list for each new tile.
  const { DISCLOSING } = await import('../lib/asking-language.js');
  assert.match(regionFooting(3, 4, ['head/neck']), DISCLOSING);
  assert.match(regionFooting(0, 2, ['pruritus', 'sleeplessness'], {
    unit: 'subjective scores', singular: 'subjective score',
  }), DISCLOSING);
});
