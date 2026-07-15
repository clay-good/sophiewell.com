// spec-v315: 2015 revised Jones criteria for acute rheumatic fever. Worked-example
// tests: the 2-major and 1-major-plus-2-minor thresholds; the risk-tier reclassing
// of arthritis/arthralgia; the fever/reactant/PR minors (PR suppressed by carditis);
// the group-A-strep gate; the recurrent 3-minor rule; and the isolated-chorea
// exception. Criteria transcribed from Gewitz 2015 (AHA) / PMC4829161 (spec-v97).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { jonesCriteria } from '../../lib/jones-v315.js';

test('two major manifestations with strep evidence meets the criteria (initial)', () => {
  const r = jonesCriteria({ carditis: true, polyarthritis: true, gasEvidence: true });
  assert.equal(r.met, true);
  assert.equal(r.majors, 2);
  assert.match(r.band, /Meets the 2015 Jones criteria for initial/);
});

test('the manifestation count met without strep evidence is NOT met (needs-gas)', () => {
  const r = jonesCriteria({ carditis: true, polyarthritis: true });
  assert.equal(r.met, false);
  assert.equal(r.category, 'needs-gas');
  assert.match(r.band, /requires evidence of preceding group A strep/);
});

test('one major plus two minor meets the criteria (initial, low-risk)', () => {
  // Low-risk: carditis (major) + fever (minor) + elevated reactants (minor).
  const r = jonesCriteria({ carditis: true, fever: true, elevatedAcuteReactants: true, gasEvidence: true });
  assert.equal(r.met, true);
  assert.equal(r.majors, 1);
  assert.equal(r.minors, 2);
});

test('risk tier reclasses arthralgia: polyarthralgia is major in mod/high, minor in low', () => {
  const lowRisk = jonesCriteria({ riskPopulation: 'low', polyarthralgia: true, gasEvidence: true });
  assert.equal(lowRisk.majors, 0);
  assert.equal(lowRisk.minors, 1); // polyarthralgia is a low-risk minor
  const modHigh = jonesCriteria({ riskPopulation: 'modhigh', polyarthralgia: true, gasEvidence: true });
  assert.equal(modHigh.majors, 1); // polyarthralgia is a mod/high-risk major
});

test('monoarthritis is a major only in moderate/high-risk populations', () => {
  assert.equal(jonesCriteria({ riskPopulation: 'low', monoarthritis: true }).majors, 0);
  assert.equal(jonesCriteria({ riskPopulation: 'modhigh', monoarthritis: true }).majors, 1);
});

test('a prolonged PR interval does not count when carditis is present', () => {
  const withoutCarditis = jonesCriteria({ prolongedPr: true });
  assert.equal(withoutCarditis.minors, 1);
  const withCarditis = jonesCriteria({ carditis: true, prolongedPr: true });
  assert.equal(withCarditis.minors, 0); // PR suppressed by carditis
  assert.equal(withCarditis.majors, 1);
});

test('recurrent ARF can be met by three minor criteria', () => {
  const three = { fever: true, elevatedAcuteReactants: true, prolongedPr: true, gasEvidence: true };
  // Initial: 3 minor, 0 major -> not met.
  assert.equal(jonesCriteria({ ...three, episode: 'initial' }).met, false);
  // Recurrent: 3 minor -> met.
  const r = jonesCriteria({ ...three, episode: 'recurrent' });
  assert.equal(r.met, true);
  assert.equal(r.minors, 3);
});

test('isolated Sydenham chorea is sufficient on its own, without strep evidence', () => {
  const r = jonesCriteria({ chorea: true });
  assert.equal(r.met, true);
  assert.match(r.band, /isolated Sydenham chorea/);
  // But chorea plus other manifestations falls back to the normal count + gate.
  const withOthers = jonesCriteria({ chorea: true, fever: true });
  assert.equal(withOthers.met, false); // 1 major + 1 minor, no strep evidence
});

test('non-true values do not fire a manifestation', () => {
  const r = jonesCriteria({ carditis: 'true', polyarthritis: 1, gasEvidence: 'yes' });
  assert.equal(r.majors, 0);
  assert.equal(r.met, false);
});
