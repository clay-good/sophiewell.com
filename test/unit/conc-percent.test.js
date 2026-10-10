// spec-v56 §2.13: concentration / percent / ratio converter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { concPercent } from '../../lib/medication-v5.js';

test('epinephrine 1:1000 = 1 mg/mL = 0.1%', () => {
  const r = concPercent({ mode: 'ratio', value: 1000 });
  assert.equal(r.mgPerMl, 1);
  assert.equal(r.percent, 0.1);
  assert.equal(r.ratio, 1000);
});

test('1:10000 = 0.1 mg/mL = 0.01%', () => {
  const r = concPercent({ mode: 'ratio', value: 10000 });
  assert.equal(r.mgPerMl, 0.1);
  assert.equal(r.percent, 0.01);
});

test('1% w/v = 10 mg/mL = 1:100', () => {
  const r = concPercent({ mode: 'percent', value: 1 });
  assert.equal(r.mgPerMl, 10);
  assert.equal(r.ratio, 100);
});

test('mg/mL passthrough: 20 mg/mL = 2% = 1:50', () => {
  const r = concPercent({ mode: 'mgml', value: 20 });
  assert.equal(r.percent, 2);
  assert.equal(r.ratio, 50);
});

test('rejects unknown mode and non-positive value', () => {
  assert.throws(() => concPercent({ mode: 'molar', value: 1 }), /mode must be/);
  assert.throws(() => concPercent({ mode: 'ratio', value: 0 }), /value/);
});

// spec-v1641 row 18: an arithmetic identity is cited as one, not credited to USP.
test('the citation and the agent summary name an identity, not USP', async () => {
  const { META } = await import('../../lib/meta.js');
  const adapters = (await import('../../mcp/adapters/medication-v5.js')).default;
  const summary = adapters.find((a) => a.id === 'conc-percent').summary;
  for (const text of [META['conc-percent'].citation, summary]) {
    assert.match(text, /identit/i);
    assert.doesNotMatch(text, /USP/);
  }
});
