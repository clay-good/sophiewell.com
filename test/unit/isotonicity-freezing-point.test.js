// spec-v1629 tool 13: isotonicity by freezing-point depression.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isotonicityFreezingPoint as fp } from '../../lib/isotonicity-freezing-point-v1629.js';

test('agent % = (0.52 − supplied) ÷ the agent\'s 1% depression', () => {
  // A 1% solution depressing 0.2 °C leaves 0.32 °C; an agent at 0.576 per 1% makes that up at 0.555556%.
  const r = fp({ solutes: '1, 0.2', agentDepression: 0.576, volumeMl: 100 });
  assert.equal(r.suppliedC, 0.2);
  assert.equal(r.agentPercent, 0.555556);
  assert.equal(r.agentG, 0.555556);
  assert.equal(fp({ solutes: '1, 0.2', agentDepression: 0.576, volumeMl: 30 }).agentG, 0.166667);
  // Several solutes add.
  assert.equal(fp({ solutes: '0.05, 0.01\n0.12, 0.26\n0.1, 0.38', agentDepression: 0.576, volumeMl: 1000 }).suppliedC, 0.0697);
});

test('a supplied depression above 0.52 reports "at or past", never a negative weight', () => {
  const over = fp({ solutes: '1, 0.6', agentDepression: 0.576, volumeMl: 100 });
  assert.equal(over.valid, true);
  assert.equal(over.atOrPast, true);
  assert.equal(over.agentG, null);
  assert.match(over.band, /Already at or past 0\.52 °C/);
  assert.doesNotMatch(`${over.band} ${over.notes.join(' ')}`, /-\d/);
  const at = fp({ solutes: '1, 0.52' });
  assert.equal(at.atOrPast, true);
  assert.equal(at.abnormal, false);
});

test('no 1% depression is ever assumed, sodium chloride\'s included', () => {
  assert.match(fp({ solutes: '1, 0.2', volumeMl: 100 }).message, /Enter the 1% depression of the adjusting agent.*none is assumed, sodium chloride's included/);
  assert.match(fp({ solutes: '1, 0.2', agentDepression: 0.576 }).message, /Enter the final volume/);
  assert.match(fp({}).message, /Enter each solute on its own line/);
  assert.match(fp({ solutes: '1' }).message, /Solute line 1/);
  assert.match(fp({ solutes: '1, 0.2', agentDepression: 0, volumeMl: 100 }).message, /greater than 0/);
});
