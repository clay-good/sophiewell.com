import test from 'node:test';
import assert from 'node:assert/strict';
import { tensionHeadacheIchd3 as tth } from '../../lib/tension-headache-ichd3-v818.js';

const core = { bilateral: true, pressing: true, noBetterExplanation: true };
const episodic = { ...core, episodeCount: 20, monthsOfPattern: 6, duration: 'hours-to-7-days' };
const chronic = { ...core, headacheDaysPerMonth: 20, monthsOfPattern: 6, duration: 'over-7-days-or-unremitting' };

test('tension: the three subtypes are separated by frequency', () => {
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 0.5 }).diagnoses, ['2.1 Infrequent episodic tension-type headache']);
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8 }).diagnoses, ['2.2 Frequent episodic tension-type headache']);
  assert.deepEqual(tth(chronic).diagnoses, ['2.3 Chronic tension-type headache']);
  // 14 vs 15 days is the 2.2 / 2.3 boundary.
  assert.equal(tth({ ...episodic, headacheDaysPerMonth: 14 }).frequency.frequent, true);
  assert.equal(tth({ ...episodic, headacheDaysPerMonth: 15 }).frequency.frequent, false);
});

test('tension: MILD NAUSEA blocks the episodic forms and is allowed in the chronic one', () => {
  // The loosening. Carrying the episodic rule across denies 2.3 to patients who have it.
  const ep = tth({ ...episodic, headacheDaysPerMonth: 8, nausea: 'mild' });
  assert.deepEqual(ep.diagnoses, []);
  assert.equal(ep.associatedSymptomRule.episodicMet, false);

  const ch = tth({ ...chronic, nausea: 'mild' });
  assert.deepEqual(ch.diagnoses, ['2.3 Chronic tension-type headache']);
  assert.equal(ch.associatedSymptomRule.chronicMet, true);
  assert.ok(ch.nauseaNote.includes('loosens'));
});

test('tension: moderate or severe nausea, and vomiting, block every subtype', () => {
  for (const n of ['moderate', 'severe']) {
    assert.deepEqual(tth({ ...chronic, nausea: n }).diagnoses, []);
    assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, nausea: n }).diagnoses, []);
  }
  assert.deepEqual(tth({ ...chronic, vomiting: true }).diagnoses, []);
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, vomiting: true }).diagnoses, []);
});

test('tension: at most ONE of the phobias, and mild nausea counts toward that allowance', () => {
  // Episodic: one phobia is fine, both are not.
  assert.equal(tth({ ...episodic, headacheDaysPerMonth: 8, photophobia: true }).associatedSymptomRule.episodicMet, true);
  assert.equal(tth({ ...episodic, headacheDaysPerMonth: 8, photophobia: true, phonophobia: true }).associatedSymptomRule.episodicMet, false);
  // Chronic: mild nausea PLUS a phobia is two of the allowed three, which is one too many.
  assert.equal(tth({ ...chronic, nausea: 'mild' }).associatedSymptomRule.chronicMet, true);
  assert.equal(tth({ ...chronic, nausea: 'mild', photophobia: true }).associatedSymptomRule.chronicMet, false);
});

test('tension: the chronic form has NO episode-count requirement', () => {
  const r = tth(chronic);
  assert.equal(r.diagnoses.length, 1);
  assert.ok(r.episodeNote.includes('no episode-count requirement'));
  // ...whereas the episodic forms do.
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, episodeCount: 9 }).diagnoses, []);
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, episodeCount: 10 }).diagnoses, ['2.2 Frequent episodic tension-type headache']);
});

test('tension: the duration wording differs between the episodic and chronic forms', () => {
  // 30 minutes to 2 hours satisfies the episodic "30 minutes to 7 days" but is not the
  // chronic "hours to days".
  const short = tth({ ...episodic, headacheDaysPerMonth: 8, duration: '30-min-to-2-hours' });
  assert.equal(short.diagnoses.length, 1);
  assert.deepEqual(tth({ ...chronic, duration: '30-min-to-2-hours' }).diagnoses, []);
  // Under 30 minutes satisfies neither.
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, duration: 'under-30-min' }).diagnoses, []);
});

test('tension: at least two of the four characteristics are needed', () => {
  assert.equal(tth({ ...episodic, headacheDaysPerMonth: 8, pressing: false }).featureCount, 1);
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, pressing: false }).diagnoses, []);
});

test('tension: more than 3 months is required for 2.2 and 2.3', () => {
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 8, monthsOfPattern: 3 }).diagnoses, []);
  assert.deepEqual(tth({ ...chronic, monthsOfPattern: 3 }).diagnoses, []);
  // 2.1 has no duration-of-pattern requirement.
  assert.deepEqual(tth({ ...episodic, headacheDaysPerMonth: 0.5, monthsOfPattern: 0 }).diagnoses, ['2.1 Infrequent episodic tension-type headache']);
});

test('tension: empty, out-of-range and unrecognized input', () => {
  const empty = tth({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(tth({ headacheDaysPerMonth: 32 }).valid, false);
  assert.equal(tth({ headacheDaysPerMonth: 1e308 }).valid, false);
  assert.equal(tth({ duration: 'forever' }).valid, false);
  assert.equal(tth({ nausea: 'terrible' }).valid, false);
  assert.equal(tth().valid, true);
  assert.doesNotMatch(JSON.stringify(tth({ episodeCount: 1e308 })), /NaN|Infinity/);
});
