// Regression tests for spec-v1683: the last items left by the reviews -- forms that opened on a first-row answer, and
// two grade descriptions checked against open restatements of their sources.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lachmanAcl } from '../../lib/lachman-acl-v355.js';
import { mccormackLsc, MCCORMACK_NOTE } from '../../lib/mccormack-v646.js';
import { lansky } from '../../lib/lansky-v352.js';
import { schwabEngland } from '../../lib/schwab-england-v385.js';

const view = (n) => readFileSync(new URL(`../../views/group-v${n}.js`, import.meta.url), 'utf8');

test('Lansky, Schwab and England and Montreal open on a blank choice, and the refusal is what shows', () => {
  assert.match(view(352), /'lansky-score', \[\n\s+\['', 'Not selected'\]/);
  assert.match(view(385), /'se-percent', \[\n\s+\['', 'Not selected'\]/);
  for (const id of ['mibd-age', 'mibd-loc', 'mibd-beh', 'mibd-ext', 'mibd-sev']) assert.match(view(328), new RegExp(`'${id}', \\[\\n\\s+\\['', 'Not selected'\\]`));
  assert.equal(lansky({}).valid, false);
  assert.equal(schwabEngland({}).valid, false);
});

test('Lachman: grade I is 3 to 5 mm and grade III more than 10 mm (PMC13238852, PMC12813854)', () => {
  assert.match(lachmanAcl({ grade: 'I' }).band, /3 to 5 mm/);
  assert.match(lachmanAcl({ grade: 'III' }).band, /more than 10 mm/);
  assert.doesNotMatch(lachmanAcl({ grade: 'II' }).band, /5 mm or more/);
});

test('McCormack: apposition 2 is spread over less than half the cross-section, 3 over more (PMC7220516)', () => {
  assert.match(MCCORMACK_NOTE, /less than half the cross-section, is 2/);
  assert.equal(mccormackLsc({ comminution: '1', apposition: '2', kyphosis: '1' }).valid, true);
});
