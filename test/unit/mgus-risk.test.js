// spec-v134 2.4: Mayo MGUS risk stratification (Rajkumar SV, et al, Blood
// 2005;106:812-817). 1 point each: M-protein >= 1.5 g/dL, non-IgG isotype (IgA
// or IgM), abnormal serum FLC ratio (outside 0.26-1.65). Count 0-3 -> 20-yr
// progression risk 5/21/37/58%. The 0-vs-3 flip and the FLC-ratio edges are
// pinned.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mgusRisk } from '../../lib/onc-v134.js';

test('zero risk factors -> count 0, low risk', () => {
  const r = mgusRisk({ mspike: 0.8, isotype: 'IgG', flcRatio: 1.0 });
  assert.equal(r.count, 0);
  assert.equal(r.tier, 'Low');
});

test('all three risk factors -> count 3, high risk', () => {
  const r = mgusRisk({ mspike: 2.0, isotype: 'IgA', flcRatio: 5.0 });
  assert.equal(r.count, 3);
  assert.equal(r.tier, 'High');
});

test('M-protein 1.5 g/dL is the inclusive scoring edge', () => {
  assert.equal(mgusRisk({ mspike: 1.5, isotype: 'IgG', flcRatio: 1.0 }).count, 1);
  assert.equal(mgusRisk({ mspike: 1.49, isotype: 'IgG', flcRatio: 1.0 }).count, 0);
});

test('FLC ratio is abnormal strictly outside 0.26-1.65', () => {
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgG', flcRatio: 0.26 }).count, 0); // inclusive low edge -> normal
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgG', flcRatio: 1.65 }).count, 0); // inclusive high edge -> normal
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgG', flcRatio: 0.25 }).count, 1);
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgG', flcRatio: 1.66 }).count, 1);
});

test('IgG scores 0 for isotype; IgA and IgM score 1', () => {
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgG', flcRatio: 1.0 }).count, 0);
  assert.equal(mgusRisk({ mspike: 0.5, isotype: 'IgM', flcRatio: 1.0 }).count, 1);
});

test('blank fields or an unrecognised isotype surface the fallback', () => {
  assert.equal(mgusRisk({ mspike: 1.0, flcRatio: 1.0 }).valid, false);
  assert.equal(mgusRisk({ mspike: 1.0, isotype: 'IgD', flcRatio: 1.0 }).valid, false);
  assert.equal(mgusRisk({}).valid, false);
});
