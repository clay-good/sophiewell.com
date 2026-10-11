// spec-v1629 tool 12: isotonicity by sodium chloride equivalent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isotonicityEValue as ie } from '../../lib/isotonicity-e-value-v1629.js';

test('sodium chloride to add is 0.9% of the volume less what the solutes stand for', () => {
  // 30 mL needs 0.27 g; 0.3 g of a drug with E 0.18 stands for 0.054 g; 0.216 g remains.
  const r = ie({ mode: 'agent', volumeMl: 30, solutes: '0.3, 0.18', agentE: 1 });
  assert.deepEqual([r.naclNeededG, r.naclEquivalentG, r.naclToAddG, r.agentG], [0.27, 0.054, 0.216, 0.216]);
  // Another agent: divide by its E-value.
  assert.equal(ie({ mode: 'agent', volumeMl: 30, solutes: '0.3, 0.18', agentE: 0.5 }).agentG, 0.432);
});

test('solutes that already exceed 0.9% report hypertonic, not 0 g', () => {
  const r = ie({ mode: 'agent', volumeMl: 30, solutes: '0.6, 0.9', agentE: 1 });
  assert.equal(r.valid, true);
  assert.equal(r.hypertonic, true);
  assert.equal(r.agentG, null);
  assert.match(r.band, /Already hypertonic by this method/);
  assert.doesNotMatch(r.band, /\b0 g\b/);
});

test('an agent E-value of 0 is refused, and a blank one is never assumed', () => {
  assert.match(ie({ mode: 'agent', volumeMl: 30, solutes: '0.3, 0.18', agentE: 0 }).message, /greater than 0/);
  assert.match(ie({ mode: 'agent', volumeMl: 30, solutes: '0.3, 0.18' }).message, /1 for sodium chloride itself.*It is not assumed/);
});

test('White-Vincent: the isotonic volume, on the paper\'s own worked formula', () => {
  // Umar 2019, formula 1: the weights times their E-values sum to 7.787 g. The paper multiplies by its
  // rounded constant 111.1 and prints 865.136 mL; 100 / 0.9 unrounded gives 865.222.
  const r = ie({ mode: 'white-vincent', solutes: '0.5, 0.13\n1.2, 0.46\n6.5, 1\n1, 0.67', volumeMl: 1000 });
  assert.equal(r.naclEquivalentG, 7.787);
  assert.equal(r.isotonicVolumeMl, 865.222);
  assert.equal(Number((7.787 * 111.1).toFixed(3)), 865.136);
  assert.equal(r.exceedsFinalVolume, false);
  assert.match(r.notes.join(' '), /Isotonic vehicle to add: 1,000 − 865\.222 = 134\.778 mL/);
  assert.match(r.notes.join(' '), /the method prints the constant as 111\.1/);
});

test('a White-Vincent volume larger than the final volume is flagged', () => {
  const r = ie({ mode: 'white-vincent', solutes: '0.3, 0.18', volumeMl: 5 });
  assert.equal(r.isotonicVolumeMl, 6);
  assert.equal(r.exceedsFinalVolume, true);
  assert.equal(r.abnormal, true);
  assert.match(r.notes.join(' '), /more than the final volume of 5 mL/);
  // Without a final volume there is nothing to compare against.
  assert.equal(ie({ mode: 'white-vincent', solutes: '0.3, 0.18' }).exceedsFinalVolume, false);
});

test('refusals: no E-value is ever filled in', () => {
  assert.match(ie({}).message, /Choose what to work out/);
  assert.match(ie({ mode: 'agent', volumeMl: 30, agentE: 1 }).message, /Enter each solute on its own line/);
  assert.match(ie({ mode: 'agent', volumeMl: 30, solutes: '0.3', agentE: 1 }).message, /Solute line 1/);
  assert.match(ie({ mode: 'agent', volumeMl: 30, solutes: '0.3, x', agentE: 1 }).message, /E-value on solute line 1/);
  assert.match(ie({ mode: 'agent', solutes: '0.3, 0.18', agentE: 1 }).message, /Enter the final volume/);
});
