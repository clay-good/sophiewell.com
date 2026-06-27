// spec-v165 2.3: Bosniak 2019 renal-cyst classification. Every feature
// combination resolves to exactly one defined class; the IIF→III and III→IV
// transitions are asserted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bosniak } from '../../lib/radiology-v165.js';

test('tile example: thick wall → Bosniak III', () => {
  const r = bosniak({ wall: 'thick', septa: 'few', protrusion: 'none' });
  assert.equal(r.valid, true);
  assert.equal(r.cls, 'III');
  assert.equal(r.abnormal, true);
});

test('IIF → III transition by wall thickening', () => {
  const iif = bosniak({ wall: 'minimal', septa: 'none', protrusion: 'none' });
  assert.equal(iif.cls, 'IIF');
  const iii = bosniak({ wall: 'thick', septa: 'none', protrusion: 'none' });
  assert.equal(iii.cls, 'III');
});

test('III → IV transition by protrusion margin/size', () => {
  const iii = bosniak({ wall: 'thin', septa: 'none', protrusion: 'obtuseSmall' });
  assert.equal(iii.cls, 'III');
  const ivLarge = bosniak({ wall: 'thin', septa: 'none', protrusion: 'obtuseLarge' });
  assert.equal(ivLarge.cls, 'IV');
  const ivAcute = bosniak({ wall: 'thin', septa: 'none', protrusion: 'acute' });
  assert.equal(ivAcute.cls, 'IV');
});

test('≥4 thin enhancing septa → IIF; 1-3 septa or calcification → II; simple → I', () => {
  assert.equal(bosniak({ wall: 'thin', septa: 'many', protrusion: 'none' }).cls, 'IIF');
  assert.equal(bosniak({ wall: 'thin', septa: 'few', protrusion: 'none' }).cls, 'II');
  assert.equal(bosniak({ wall: 'thin', septa: 'none', protrusion: 'none', calcification: true }).cls, 'II');
  assert.equal(bosniak({ wall: 'thin', septa: 'none', protrusion: 'none' }).cls, 'I');
});

test('guards: missing feature selections', () => {
  assert.equal(bosniak({ wall: 'thin' }).valid, false);
  assert.equal(bosniak({}).valid, false);
});
