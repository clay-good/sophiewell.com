import test from 'node:test';
import assert from 'node:assert/strict';
import { sunctSunaIchd3 as ss } from '../../lib/sunct-suna-ichd3-v820.js';

const base = {
  attackCount: 30, moderateOrSevereUnilateral: true, attackSeconds: 60,
  stabbingPattern: true, attacksPerDay: 5, noBetterExplanation: true,
};

test('sunct/suna: BOTH conjunctival injection and tearing is SUNCT', () => {
  const r = ss({ ...base, conjunctivalInjection: true, lacrimation: true });
  assert.equal(r.criteriaMet, true);
  assert.ok(r.subtype.includes('3.3.1 SUNCT'));
  assert.equal(r.bandLabel, 'SUNCT');
  assert.equal(r.subtypeNote, null);
});

test('sunct/suna: ONE of the two, or neither, is SUNA', () => {
  // Not a severity gradient. Florid tearing with no conjunctival injection is SUNA.
  const tearingOnly = ss({ ...base, lacrimation: true });
  assert.ok(tearingOnly.subtype.includes('3.3.2 SUNA'));
  assert.ok(tearingOnly.subtypeNote.includes('BOTH signs'));

  const injectionOnly = ss({ ...base, conjunctivalInjection: true });
  assert.ok(injectionOnly.subtype.includes('SUNA'));

  // Neither of those two, but another autonomic sign: still SUNA.
  const neither = ss({ ...base, miosisPtosis: true });
  assert.ok(neither.subtype.includes('SUNA'));
  assert.equal(neither.subtypeNote, null);
});

test('sunct/suna: an autonomic sign is REQUIRED - restlessness is not an alternative', () => {
  // Cluster headache and paroxysmal hemicrania accept restlessness. 3.3 does not.
  const r = ss({ ...base, restlessness: true });
  assert.equal(r.criteria.c, false);
  assert.equal(r.criteriaMet, false);
  assert.ok(r.restlessNote.includes('does not accept restlessness'));

  // Any one of the seven signs satisfies C.
  for (const sign of ['conjunctivalInjection', 'lacrimation', 'nasalCongestion', 'eyelidEdema', 'sweating', 'flushing', 'earFullness', 'miosisPtosis']) {
    assert.equal(ss({ ...base, [sign]: true }).criteria.c, true);
  }
});

test('sunct/suna: attacks are measured in SECONDS, 1 to 600', () => {
  const at = (s) => ss({ ...base, miosisPtosis: true, attackSeconds: s }).criteria.b;
  assert.equal(at(0), false);
  assert.equal(at(1), true);
  assert.equal(at(600), true);
  assert.equal(at(601), false);
  const long = ss({ ...base, miosisPtosis: true, attackSeconds: 900 });
  assert.ok(long.durationNote.includes('Paroxysmal hemicrania'));
});

test('sunct/suna: at least 20 attacks and at least one a day', () => {
  assert.equal(ss({ ...base, miosisPtosis: true, attackCount: 19 }).criteria.a, false);
  assert.equal(ss({ ...base, miosisPtosis: true, attackCount: 20 }).criteria.a, true);
  assert.equal(ss({ ...base, miosisPtosis: true, attacksPerDay: 0.5 }).criteria.d, false);
  assert.equal(ss({ ...base, miosisPtosis: true, attacksPerDay: 1 }).criteria.d, true);
});

test('sunct/suna: the stabbing pattern is part of criterion B', () => {
  assert.equal(ss({ ...base, miosisPtosis: true, stabbingPattern: false }).criteria.b, false);
  assert.equal(ss({ ...base, miosisPtosis: true, moderateOrSevereUnilateral: false }).criteria.b, false);
});

test('sunct/suna: no subtype is offered when the criteria are not met', () => {
  const r = ss({ conjunctivalInjection: true, lacrimation: true });
  assert.equal(r.criteriaMet, false);
  assert.equal(r.subtype, null);
  assert.equal(r.subtypeNote, null);
});

test('sunct/suna: empty and out-of-range input', () => {
  const empty = ss({});
  assert.equal(empty.valid, true);
  assert.equal(empty.criteriaMet, false);
  assert.equal(empty.durationNote, null);
  assert.equal(ss({ attackSeconds: 1e308 }).valid, false);
  assert.equal(ss({ attacksPerDay: -1 }).valid, false);
  assert.equal(ss().valid, true);
  assert.doesNotMatch(JSON.stringify(ss({ attackCount: 1e308 })), /NaN|Infinity/);
});
