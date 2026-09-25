// spec-v1446: ADA hypoglycemia levels (Standards of Care 2025, section 6) and the first step.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hypoglycemiaLevel as h } from '../../lib/hypoglycemia-level-v1446.js';

test('levels at their edges: 70, 54', () => {
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 70 }).level, 0);
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 69 }).level, 1);
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 54 }).level, 1);
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 53 }).level, 2);
});

test('level 3 is set by needing assistance, whatever the glucose', () => {
  assert.equal(h({ needsAssistance: 'yes' }).level, 3);
  assert.equal(h({ needsAssistance: 'yes', glucoseMgDl: 80 }).level, 3);
  assert.match(h({ needsAssistance: 'yes' }).steps[0], /glucagon/);
});

test('levels 1 and 2 get the oral steps; level 2 prompts a plan review', () => {
  const r = h({ needsAssistance: 'no', glucoseMgDl: 48 });
  assert.match(r.steps[0], /15 to 20 g/);
  assert.match(r.steps[1], /Recheck in 15 minutes/);
  assert.ok(r.notes.some((n) => /review of the treatment plan/.test(n)));
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 90 }).steps.length, 0);
});

test('a missing answer is asked for; an impossible glucose is refused', () => {
  assert.match(h({ glucoseMgDl: 60 }).message, /altered mental or physical status/);
  assert.match(h({ needsAssistance: 'no' }).message, /Enter the glucose/);
  assert.equal(h({ needsAssistance: 'no', glucoseMgDl: 5000 }).valid, false);
});
