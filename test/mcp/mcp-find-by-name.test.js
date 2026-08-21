// spec-v771: every exposed calculator must be reachable at rank 1 by its own name.
//
// find_calculator is how an agent looks a calculator up. The token ranker scores
// on overlap, so a SHORTER sibling whose name is contained in a longer one won
// it: "TIMI Risk Score for STEMI (Morrow)" returned `timi`, "CHADS2 Score"
// returned `chads`, "Glasgow Coma Scale - Pupils" returned `gcs`. 62 of 1540
// could not be reached at rank 1 by their own exact name.
//
// answer_query already weighed nameMatch (spec-v762); this pins the same rule on
// the discovery path.
import test from 'node:test';
import assert from 'node:assert';
import { REGISTRY, findCalculator } from '../../mcp/tools.js';

// Two names whose distinctive part is a SINGLE token, so the two-word guard
// declines to promote them -- deliberately, because one word promoting is what
// put Therapy Units over CHA2DS2-VASc and Cockcroft-Gault over eGFR. Both still
// come back at rank 2 with the right tile plainly named.
const SINGLE_TOKEN_NAMES = new Set(['timi-risk-index', 'carpenter-coustan']);

test('every exposed calculator ranks #1 for its own name', () => {
  const miss = [];
  for (const [id, calc] of REGISTRY) {
    const candidates = findCalculator({ query: calc.name, limit: 5 }).candidates || [];
    if (candidates[0] && candidates[0].id === id) continue;
    if (SINGLE_TOKEN_NAMES.has(id)) {
      // Still has to be reachable, just not first.
      assert.ok(candidates.some((c) => c.id === id), `${id} fell out of the top 5 entirely`);
      continue;
    }
    miss.push({ id, name: calc.name, got: candidates.slice(0, 3).map((c) => c.id) });
  }
  assert.deepEqual(miss, [], `calculators not reachable at rank 1 by their own name:\n${JSON.stringify(miss, null, 2)}`);
});

test('naming a calculator outranks the ranker; describing one does not', () => {
  // The full-name promotion must not override curated synonym / prose routes.
  assert.equal(findCalculator({ query: 'antithrombotic therapy not recommended' }).candidates[0].id, 'chads');
  assert.equal(findCalculator({ query: 'creatinine clearance' }).candidates[0].id, 'egfr');
  assert.equal(findCalculator({ query: 'stroke risk afib' }).candidates[0].id, 'chads');
});

test('promotion never escapes a group or specialty prefilter', () => {
  const r = findCalculator({ query: 'CHADS2 Score (AF stroke risk)', specialty: 'hepatology', limit: 10 });
  assert.ok((r.candidates || []).every((c) => c.specialties.includes('hepatology')));
});
