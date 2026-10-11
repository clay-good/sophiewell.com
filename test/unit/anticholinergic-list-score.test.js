// spec-v1634 tool 11: anticholinergic burden from two open drug lists (Kiesel 2018; Ramos 2022).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { anticholinergicListScore as d, LISTS } from '../../lib/anticholinergic-list-score-v1634.js';

test('the lists have the counts the papers state', () => {
  assert.deepEqual(Object.values(LISTS['german-acb']).map((x) => x.length), [104, 18, 29]);
  assert.deepEqual(Object.values(LISTS.crideco).map((x) => x.length), [127, 28, 62]);
  assert.equal(Object.values(LISTS.crideco).flat().length, 217);
  for (const scale of Object.values(LISTS)) { const all = Object.values(scale).flat().map((x) => x.toLowerCase()); assert.equal(new Set(all).size, all.length); }
  // Spot checks against the tables.
  assert.ok(LISTS['german-acb'][3].includes('Amitriptyline') && LISTS['german-acb'][2].includes('Quetiapine') && LISTS['german-acb'][1].includes('Furosemide'));
  assert.ok(LISTS.crideco[3].includes('Hydroxyzine') && LISTS.crideco[2].includes('Baclofen') && LISTS.crideco[1].includes('Hydromorphone') && LISTS.crideco[1].includes('Tapentadol'));
});

test('scores are summed; names match without regard to case, and inhaled entries by their base name', () => {
  const r = d({ scale: 'german-acb', drugs: 'Amitriptyline\nfurosemide, TIOTROPIUM' });
  assert.equal(r.total, 5);
  assert.deepEqual(r.scored.map((x) => [x.drug, x.score]), [['Amitriptyline', 3], ['Furosemide', 1], ['Tiotropium (inhaled)', 1]]);
  assert.equal(d({ scale: 'german-acb', drugs: 'furosemide, Furosemide' }).total, 1);
});

test('a drug that is not on the list is named, never counted as zero', () => {
  const r = d({ scale: 'german-acb', drugs: 'metformin, acetaminophen' });
  assert.deepEqual([r.total, r.notListed, r.flag], [1, ['acetaminophen'], 'incomplete']);
  assert.match(r.band, /total is incomplete/);
  assert.match(r.notes.join(' '), /not a score of zero/);
  const none = d({ scale: 'crideco', drugs: 'aspirin' });
  assert.deepEqual([none.total, none.flag], [null, 'none-listed']);
  assert.doesNotMatch(none.band, /below/);
});

test('the two papers\' thresholds', () => {
  assert.equal(d({ scale: 'german-acb', drugs: 'metformin, warfarin' }).flag, 'below-threshold');
  assert.equal(d({ scale: 'german-acb', drugs: 'metformin, warfarin, digoxin' }).flag, 'threshold-reached');
  assert.equal(d({ scale: 'german-acb', drugs: 'oxybutynin' }).flag, 'threshold-reached');
  assert.equal(d({ scale: 'crideco', drugs: 'baclofen' }).flag, 'below-threshold');
  assert.equal(d({ scale: 'crideco', drugs: 'baclofen, metformin' }).flag, 'threshold-reached');
});

test('the two lists differ, and the footnote\'s alternative names resolve', () => {
  assert.equal(d({ scale: 'german-acb', drugs: 'haloperidol' }).total, 2);
  assert.equal(d({ scale: 'crideco', drugs: 'haloperidol' }).total, 1);
  const r = d({ scale: 'crideco', drugs: 'benztropine; pethidine; carbidopa/levodopa' });
  assert.deepEqual(r.scored.map((x) => [x.drug, x.score, x.enteredAs]), [['Benzatropine', 3, 'benztropine'], ['Meperidine', 2, 'pethidine'], ['Levodopa-carbidopa', 1, 'carbidopa/levodopa']]);
});

test('refusals', () => {
  assert.match(d({}).message, /^Choose the scale/);
  assert.match(d({ scale: 'crideco' }).message, /^Enter the drugs/);
  assert.match(d({ scale: 'crideco', drugs: ' , ; ' }).message, /^Enter the drugs/);
  assert.equal(d({ scale: 'acb', drugs: 'x' }).valid, false);
  assert.equal(d(null).valid, false);
});
