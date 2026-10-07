// spec-v1605: the preventive code map (CMS MLN006559, July 2026), codes only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preventiveCode, DATED_PREVENTIVE_CODES, BASIS_TEXT } from '../../lib/preventive-codes.js';

const NOW = new Date('2026-10-07T12:00:00Z');
const services = DATED_PREVENTIVE_CODES['mln006559-2026-07'].values.services;

test('screening codes resolve to their service and the reason 147.130 reaches it', () => {
  assert.deepEqual((({ service, basis, edition, expired }) => ({ service, basis, edition, expired }))(preventiveCode('g0121', NOW)), { service: 'colorectal cancer screening', basis: 'USPSTF', edition: 'July 2026', expired: false });
  assert.equal(preventiveCode('90677', NOW).basis, 'ACIP');
  assert.equal(preventiveCode('G0101', NOW).basis, 'HRSA');
  assert.equal(preventiveCode(' 71271 ', NOW).service, 'lung cancer screening');
});

test('dual-use, Medicare-only and non-USPSTF codes are left out', () => {
  for (const c of ['80061', '83036', '82947', '77080', '87491', '86592', '80081', 'G0438', 'G0102', 'G0327', '0537U', 'M0201', '99213', '', null]) assert.equal(preventiveCode(c, NOW), null, String(c));
});

test('each code appears once, has a known basis, and is a five-character HCPCS or CPT code', () => {
  const all = services.flatMap((s) => s.codes);
  assert.equal(new Set(all).size, all.length);
  for (const s of services) assert.ok(BASIS_TEXT[s.basis], s.service);
  for (const c of all) assert.match(c, /^[0-9A-Z]{5}$/);
});

test('past validThrough the answer is marked expired, never silently current', () => {
  assert.equal(preventiveCode('G0444', new Date('2027-10-01T12:00:00Z')).expired, true);
});
