// spec-v94 §2.1: HScore for reactive hemophagocytic syndrome (Fardet 2014).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hscoreHlh } from '../../lib/hemonc-v94.js';

test('worked example: high total lands in the top probability band', () => {
  const r = hscoreHlh({ immunosuppression: 'no', temp: 40, organomegaly: 'both', cytopenias: 2, ferritin: 4000, triglyceride: 3, fibrinogen: 2, ast: 100, hemophagocytosis: 'yes' });
  assert.equal(r.total, 274);
  assert.equal(r.probability, '>99%');
  assert.equal(r.high, true);
  assert.match(r.band, /HScore 274/);
});

test('all-zero inputs score 0 with <1% probability', () => {
  const r = hscoreHlh({ immunosuppression: 'no', temp: 37, organomegaly: 'none', cytopenias: 1, ferritin: 500, triglyceride: 1, fibrinogen: 4, ast: 20, hemophagocytosis: 'no' });
  assert.equal(r.total, 0);
  assert.equal(r.probability, '<1%');
  assert.equal(r.high, false);
});

test('cutoff edge: 169 is the high-discrimination threshold', () => {
  // 18 (immuno) + 49 (temp) + 38 (organ) + 34 (cyto 3) + 30 (fibrinogen) = 169.
  const r = hscoreHlh({ immunosuppression: 'yes', temp: 40, organomegaly: 'both', cytopenias: 3, ferritin: 500, triglyceride: 1, fibrinogen: 2, ast: 20, hemophagocytosis: 'no' });
  assert.equal(r.total, 169);
  assert.equal(r.high, true);
});

test('item weights map the temperature and ferritin bands', () => {
  assert.equal(hscoreHlh({ temp: 38.4 }).items.find((i) => i.label === 'Temperature').points, 33);
  assert.equal(hscoreHlh({ temp: 39.5 }).items.find((i) => i.label === 'Temperature').points, 49);
  assert.equal(hscoreHlh({ ferritin: 6001 }).items.find((i) => i.label === 'Ferritin').points, 50);
});
