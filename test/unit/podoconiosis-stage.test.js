// spec-v1564 §3: podoconiosis-stage, against Annex A of Tekola and colleagues (Trop Med Int Health 2008;13:1277),
// read October 9, 2026, including its own worked record ("Stage 2, M+, 48").

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { podoconiosisStage as p } from '../../lib/podoconiosis-stage-v1564.js';

test('the five stages by swelling reach, knob site and joint fixation', () => {
  assert.equal(p({ swelling: 'reversible', fixed: 'no' }).bandLabel, 'Stage 1');
  assert.equal(p({ swelling: 'below-knee', fixed: 'no', knobs: 'none' }).bandLabel, 'Stage 2');
  assert.equal(p({ swelling: 'below-knee', fixed: 'no', knobs: 'below-ankle' }).bandLabel, 'Stage 2');
  assert.equal(p({ swelling: 'below-knee', fixed: 'no', knobs: 'above-ankle' }).bandLabel, 'Stage 3');
  assert.equal(p({ swelling: 'above-knee', fixed: 'no', knobs: 'none' }).bandLabel, 'Stage 4');
  assert.equal(p({ swelling: 'below-knee', fixed: 'yes' }).bandLabel, 'Stage 5', 'stage 5 needs no above-knee swelling');
  assert.equal(p({ swelling: 'none', fixed: 'no' }).bandLabel, 'Stage 0');
});

test('the annex example records as "Stage 2, M+, 48"', () => {
  const r = p({ swelling: 'below-knee', fixed: 'no', knobs: 'below-ankle', mossy: 'yes', circumference: '48' });
  assert.equal(r.notes[0], 'Record: Stage 2, M+, 48 cm.');
});

test('blanks are disclosed, not read as no; odd combinations are named', () => {
  const r = p({ swelling: 'below-knee', fixed: 'no' });
  assert.equal(r.bandLabel, 'At least stage 2');
  assert.equal(r.notes[0], 'Record: At least stage 2, mossy changes not assessed, circumference not measured.');
  assert.match(r.notes[1], /^Knobs not assessed/);
  assert.match(p({ swelling: 'reversible', fixed: 'no', knobs: 'above-ankle' }).notes.at(-1), /check the overnight answer/);
  assert.equal(p({ swelling: 'none', fixed: 'yes' }).bandLabel, 'Not staged');
  assert.equal(p({ swelling: 'below-knee' }).valid, false);
  assert.equal(p({ fixed: 'no' }).valid, false);
  assert.equal(p({ swelling: 'below-knee', fixed: 'no', circumference: '900' }).valid, false);
});
