// spec-v798: renal tubular acidosis typing.
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { rtaType } from '../../lib/rta-type-v798.js';

test('a high potassium gives type 4 without needing the urine pH', () => {
  const r = rtaType({ potassium: 'high' });
  assert.equal(r.valid, true);
  assert.equal(r.type, 4);
  assert.match(r.reason, /high serum potassium/);
});

test('potassium is checked FIRST: a high potassium wins over an alkaline urine', () => {
  assert.equal(rtaType({ potassium: 'high', urinePh: 6.5 }).type, 4);
});

test('with potassium not high, the urine pH separates type 1 from type 2', () => {
  assert.equal(rtaType({ potassium: 'low', urinePh: 6.2 }).type, 1);
  assert.equal(rtaType({ potassium: 'low', urinePh: 5.2 }).type, 2);
  assert.equal(rtaType({ potassium: 'normal', urinePh: 6.2 }).type, 1);
});

test('the pH boundary is above 5.5, so exactly 5.5 is type 2', () => {
  assert.equal(rtaType({ potassium: 'low', urinePh: 5.5 }).type, 2);
  assert.equal(rtaType({ potassium: 'low', urinePh: 5.6 }).type, 1);
});

test('without a urine pH and without hyperkalemia the type is left undetermined', () => {
  const r = rtaType({ potassium: 'low' });
  assert.equal(r.type, null);
  assert.match(r.band, /incomplete/);
});

test('the urine anion gap never changes the assigned type', () => {
  const base = rtaType({ potassium: 'low', urinePh: 6.2 });
  const positive = rtaType({ potassium: 'low', urinePh: 6.2, urineAnionGap: 20 });
  const negative = rtaType({ potassium: 'low', urinePh: 6.2, urineAnionGap: -20 });
  assert.equal(base.type, 1);
  assert.equal(positive.type, 1);
  assert.equal(negative.type, 1);
  // It is reported, just not used for typing.
  assert.match(negative.supporting.join(' '), /gastrointestinal/);
  assert.match(positive.supporting.join(' '), /renal cause/);
});

test('the FE bicarbonate is reported as supporting type 2 above 15 percent', () => {
  const high = rtaType({ potassium: 'low', urinePh: 5.2, feHco3: 20 });
  assert.match(high.supporting.join(' '), /supports type 2/);
  const low = rtaType({ potassium: 'low', urinePh: 5.2, feHco3: 5 });
  assert.match(low.supporting.join(' '), /does not support type 2/);
  // And it does not override the pH-assigned type either.
  assert.equal(rtaType({ potassium: 'low', urinePh: 6.2, feHco3: 20 }).type, 1);
});

test('out-of-range values and an unknown potassium are rejected', () => {
  assert.equal(rtaType({ potassium: 'elevated' }).field, 'potassium');
  assert.equal(rtaType({ potassium: 'low', urinePh: 14 }).field, 'urinePh');
  assert.equal(rtaType({ potassium: 'low', feHco3: 200 }).field, 'feHco3');
});
