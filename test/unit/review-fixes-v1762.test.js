// spec-v1762: an independent review of specs v1758-v1761 found guards refusing values patients have survived.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeCalculator } from '../../mcp/tools.js';
import { META } from '../../lib/meta.js';
import { interpretLab } from '../../lib/lab-interpret.js';
import { BOUNDS, CEILING_ONLY, envelopeAdvisory } from '../../lib/bounds.js';

const run = (id, extra) => computeCalculator({ id, inputs: { ...META[id].example.fields, ...extra } });

test('a micro-preemie weight of 0.25 kg answers (the smallest known survivor weighed 245 g); 0.1 kg is still refused', () => {
  assert.ok(BOUNDS.weightKg.min <= 0.245);
  assert.notEqual(run('gir', { 'gir-wt': '0.25' }).valid, false);
  assert.equal(run('gir', { 'gir-wt': '0.1' }).valid, false);
});

test('a potassium of 12 answers in APACHE II (survival from 14.0 mmol/L is reported); 20 is refused', () => {
  assert.ok(BOUNDS.potassium.max >= 14);
  assert.notEqual(run('apache2', { 'ap-k': '12' }).valid, false);
  assert.equal(run('apache2', { 'ap-k': '20' }).valid, false);
});

test('critical-low hemoglobin, hematocrit, albumin and glucose are flagged, not refused; their ceilings hold', () => {
  for (const [analyte, low] of [['glucose', 4], ['hemoglobin', 1.5], ['hematocrit', 4.5], ['albumin', 0.4]]) {
    assert.doesNotThrow(() => interpretLab(analyte, low), analyte);
    assert.equal(envelopeAdvisory(analyte, low), null, analyte);
  }
  assert.throws(() => interpretLab('glucose', 3000), /plausible range/);
  for (const key of CEILING_ONLY) assert.match(String(envelopeAdvisory(key, BOUNDS[key].max * 2)), /plausible range/, key);
});

test('PSI, LRINEC and the IV-iron course score a critical-low value instead of refusing it', () => {
  assert.notEqual(run('psi', { 'ps-g': '4' }).valid, false);
  assert.notEqual(run('psi', { 'ps-hct': '4.5' }).valid, false);
  assert.notEqual(run('lrinec', { 'lr-glu': '4' }).valid, false);
  assert.notEqual(run('iv-iron-course', { 'iic-regimen': 'injectafer-hf', 'iic-hb': '1.5' }).valid, false);
});
