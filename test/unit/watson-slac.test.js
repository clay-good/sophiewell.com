// spec-v1431: Watson and Ballet SLAC wrist stage (McLean & Taylor 2019).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watsonSlac as ws } from '../../lib/watson-slac-v1431.js';

test('each stage in the SLAC progression derives from its joints', () => {
  const rows = [
    [1, { radioscaphoid: 'styloid', capitolunate: 'no', radiolunate: 'no' }],
    [2, { radioscaphoid: 'whole', capitolunate: 'no', radiolunate: 'no' }],
    [3, { radioscaphoid: 'whole', capitolunate: 'yes', radiolunate: 'no' }],
    [4, { radioscaphoid: 'whole', capitolunate: 'yes', radiolunate: 'yes' }],
  ];
  for (const [stage, input] of rows) {
    const r = ws(input);
    assert.equal(r.stage, stage);
    assert.equal(r.bandLabel, `Stage ${stage}`);
    assert.equal(r.abnormal, true);
  }
  assert.equal(ws(rows[1][1]).band, 'SLAC stage 2: arthritis of the whole radioscaphoid joint.');
});

test('stage 4 says it is a later addition', () => {
  assert.ok(ws({ radioscaphoid: 'whole', capitolunate: 'yes', radiolunate: 'yes' }).notes.some((n) => /later authors/.test(n)));
  assert.ok(!ws({ radioscaphoid: 'whole', capitolunate: 'yes', radiolunate: 'no' }).notes.some((n) => /later authors/.test(n)));
});

test('no arthritis is not a stage', () => {
  const r = ws({ radioscaphoid: 'none', capitolunate: 'no', radiolunate: 'no' });
  assert.equal(r.stage, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /^No SLAC stage/);
});

test('patterns off the progression are reported, not forced', () => {
  const between = ws({ radioscaphoid: 'styloid', capitolunate: 'yes', radiolunate: 'no' });
  assert.equal(between.stage, null);
  assert.match(between.band, /between stage 1 and stage 3/);
  assert.match(ws({ radioscaphoid: 'none', capitolunate: 'yes', radiolunate: 'no' }).band, /starts at the radial styloid/);
  for (const rs of ['none', 'styloid', 'whole']) {
    for (const cl of ['no', 'yes']) {
      if (rs === 'whole' && cl === 'yes') continue;
      const r = ws({ radioscaphoid: rs, capitolunate: cl, radiolunate: 'yes' });
      assert.equal(r.stage, null, `${rs}/${cl}`);
      assert.match(r.band, /pancarpal stage 4/);
    }
  }
});

test('graded answers carry the reliability caveat', () => {
  assert.ok(ws({ radioscaphoid: 'styloid', capitolunate: 'no', radiolunate: 'no' }).notes.some((n) => /0\.65/.test(n)));
});

test('each joint is asked for', () => {
  assert.match(ws({}).message, /radioscaphoid/);
  assert.match(ws({ radioscaphoid: 'whole' }).message, /capitolunate/);
  assert.match(ws({ radioscaphoid: 'whole', capitolunate: 'no' }).message, /radiolunate/);
  assert.equal(ws({ radioscaphoid: 'partial', capitolunate: 'no', radiolunate: 'no' }).valid, false);
});
