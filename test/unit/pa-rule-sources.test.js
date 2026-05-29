// spec-v52 §4.5.6: per-rule source-metadata map unit tests (wave 52-6h).
//
// `ruleSourceIds(id)` is a pure function of the rule id. These tests pin its
// contract: core code-set rules map to the exact ledger sources they consume,
// overlay rules map by family, the CMS-FFS family splits IOM vs NCD/LCD, and
// every other rule is structural ([]).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ruleSourceIds, CORE_RULE_SOURCES } from '../../lib/pa/rule-sources.js';
import { STARTER_RULES } from '../../lib/pa/rules.js';

test('core code-set rules map to their bundled-dataset sources', () => {
  assert.deepEqual(ruleSourceIds('R-PA-007'), ['ama-cpt', 'cms-hcpcs']);
  assert.deepEqual(ruleSourceIds('R-PA-009'), ['cms-hcpcs']);
  assert.deepEqual(ruleSourceIds('R-PA-011'), ['cms-icd10cm']);
  assert.deepEqual(ruleSourceIds('R-PA-013'), ['cms-pos']);
  assert.deepEqual(ruleSourceIds('R-PA-012'), ['cms-ncci']);
  assert.deepEqual(ruleSourceIds('R-PA-016'), ['nppes-npi']);
});

test('structural core rules map to no source', () => {
  for (const id of ['R-PA-001', 'R-PA-002', 'R-PA-017', 'R-PA-041', 'R-PA-060']) {
    assert.deepEqual(ruleSourceIds(id), [], `${id} is structural`);
  }
});

test('the CMS-FFS family splits IOM Pub 100-08 from NCD/LCD', () => {
  // SWO / proof-of-delivery / PTAN-enrollment rules -> IOM program-integrity.
  for (const id of ['R-PA-CMS-002', 'R-PA-CMS-003', 'R-PA-CMS-004', 'R-PA-CMS-009']) {
    assert.deepEqual(ruleSourceIds(id), ['cms-iom-100-08'], `${id} -> IOM`);
  }
  // Coverage-policy rules -> NCD/LCD database.
  for (const id of ['R-PA-CMS-001', 'R-PA-CMS-006', 'R-PA-CMS-026']) {
    assert.deepEqual(ruleSourceIds(id), ['cms-ncd-lcd'], `${id} -> NCD/LCD`);
  }
});

test('overlay families map to their single source by id prefix', () => {
  assert.deepEqual(ruleSourceIds('R-PA-MA-010'), ['cms-ma-422']);
  assert.deepEqual(ruleSourceIds('R-PA-MCD-008'), ['medicaid-core']);
  assert.deepEqual(ruleSourceIds('R-PA-RAD-003'), ['acr-appropriateness']);
  assert.deepEqual(ruleSourceIds('R-PA-INF-004'), ['fda-labeling']);
  assert.deepEqual(ruleSourceIds('R-PA-SURG-002'), ['surgical-indication-policy']);
  assert.deepEqual(ruleSourceIds('R-PA-BH-005'), ['dsm-5-tr']);
  assert.deepEqual(ruleSourceIds('R-PA-GEN-001'), ['nccn-acmg-genetic']);
});

test('ruleSourceIds is total and deterministic (returns a fresh array)', () => {
  assert.deepEqual(ruleSourceIds(''), []);
  assert.deepEqual(ruleSourceIds(undefined), []);
  const a = ruleSourceIds('R-PA-007');
  const b = ruleSourceIds('R-PA-007');
  assert.notEqual(a, b, 'a fresh array each call -- callers cannot mutate the map');
  assert.deepEqual(a, b);
});

test('every shipped rule carries its mapped sources after load', () => {
  for (const r of STARTER_RULES) {
    assert.deepEqual(r.sources, ruleSourceIds(r.id), `${r.id} sources must match the map`);
  }
});

test('CORE_RULE_SOURCES is the exact inverse of the ledger core-source anchors', async () => {
  const { readFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const here = dirname(fileURLToPath(import.meta.url));
  const ledger = JSON.parse(await readFile(join(here, '../../pa-staleness-ledger.json'), 'utf8'));
  // Invert the ledger's core-family per-source rule anchors.
  const inverted = {};
  for (const s of ledger.sources) {
    if (s.ruleFamily !== 'core') continue;
    for (const ruleId of s.rules || []) {
      (inverted[ruleId] = inverted[ruleId] || []).push(s.id);
    }
  }
  // Every ledger core anchor must be present in CORE_RULE_SOURCES.
  for (const [ruleId, srcs] of Object.entries(inverted)) {
    for (const src of srcs) {
      assert.ok(
        (CORE_RULE_SOURCES[ruleId] || []).includes(src),
        `${ruleId} should claim ledger-anchored source ${src}`,
      );
    }
  }
});
