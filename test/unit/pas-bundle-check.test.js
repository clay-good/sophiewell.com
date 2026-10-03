// spec-v1515 tool 7: pas-bundle-check, lib/fhir-profile-check.js and the pas-profiles builder. The fixtures are
// the Da Vinci PAS 2.2.1 package's own example bundles (CC0): they pass. Errors injected into one are caught
// with their paths.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkPasBundle, profileSet } from '../../lib/pas-bundle-check.js';
import { matches } from '../../lib/fhir-profile-check.js';
import pasProfiles, { parse, reduce, PIN } from '../../scripts/data/builders/pas-profiles.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';

const ROOT = process.cwd();
const set = profileSet(JSON.parse(readFileSync(join(ROOT, 'data', 'pas-profiles', 'shards', 'profiles.json'), 'utf8')), JSON.parse(readFileSync(join(ROOT, 'data', 'pas-profiles', 'valuesets.json'), 'utf8')));
const example = (n) => JSON.parse(readFileSync(join(ROOT, 'test', 'fixtures', 'pas-2.2.1', `Bundle-${n}.json`), 'utf8'));

test('the pin is 2.2.1', () => assert.equal(PIN, '2.2.1'));

test('every PAS example bundle passes, read as the kind it is', () => {
  const kinds = {};
  for (const n of ['HomecareAuthorizationBundleExample', 'ReferralAuthorizationResponseBundleExample', 'PASClaimInquiryBundleExample', 'SurgicalRequestBundleExample']) {
    const r = checkPasBundle(example(n), set);
    assert.equal(r.errors, 0, `${n}: ${JSON.stringify(r.findings.filter((f) => f.severity === 'error').slice(0, 3))}`);
    kinds[n] = r.kind;
  }
  assert.deepEqual(Object.values(kinds), ['request', 'response', 'inquiry', 'request']);
});

test('errors injected into a request are caught with their paths', () => {
  const b = example('HomecareAuthorizationBundleExample');
  const c = b.entry[0].resource;
  delete c.patient;
  c.use = 'claim';
  c.created = '2026-13-45';
  c.item[0].extension = c.item[0].extension.filter((e) => !/RequestType/.test(e.url));
  const r = checkPasBundle(b, set);
  assert.deepEqual(r.findings.filter((f) => f.severity === 'error').map((f) => f.location).sort(), [
    'Bundle.entry[0].resource.created',
    'Bundle.entry[0].resource.item[0].extension',
    'Bundle.entry[0].resource.item[0].extension',
    'Bundle.entry[0].resource.patient',
    'Bundle.entry[0].resource.use',
  ]);
  assert.match(r.band, /^5 errors against the Da Vinci PAS profiles in this prior authorization request bundle\.$/);
  assert.ok(r.findings.some((f) => /needs a "requestType" entry/.test(f.message)));
});

test('a referenced resource is checked against its target profile; one outside the bundle is a warning', () => {
  const b = example('HomecareAuthorizationBundleExample');
  const insurer = b.entry.find((e) => e.resource.resourceType === 'Organization' && /Insurer/.test(e.resource.id)).resource;
  delete insurer.name;
  const r = checkPasBundle(b, set);
  assert.ok(r.findings.some((f) => f.severity === 'error' && /resource\.name$/.test(f.location)), JSON.stringify(r.findings));
  const b2 = example('HomecareAuthorizationBundleExample');
  b2.entry[0].resource.insurer.reference = 'Organization/Nowhere';
  const r2 = checkPasBundle(b2, set);
  assert.deepEqual(r2.findings.map((f) => [f.severity, f.location]), [['warning', 'Bundle.entry[0].resource.insurer']]);
});

test('not a bundle, or not a prior authorization bundle, is refused by name', () => {
  assert.match(checkPasBundle({ resourceType: 'Patient' }, set).message, /not a FHIR Bundle/);
  assert.match(checkPasBundle({ resourceType: 'Bundle', entry: [{ resource: { resourceType: 'Patient' } }] }, set).message, /neither a Claim nor a ClaimResponse/);
});

test('pattern matching follows FHIR: every stated property, arrays by some item', () => {
  assert.equal(matches({ coding: [{ system: 's', code: 'a', display: 'A' }, { code: 'b' }] }, { coding: [{ system: 's', code: 'a' }] }), true);
  assert.equal(matches({ coding: [{ system: 's', code: 'x' }] }, { coding: [{ system: 's', code: 'a' }] }), false);
});

test('the builder reads the pinned package: reduced snapshots, listable value sets, the edition from its date', async () => {
  const found = {};
  const { records, ancillary } = await parse(readFileSync(join(ROOT, 'test', 'fixtures', 'data-sources', 'pas-profiles', 'package.tgz')), found, { bounds: false });
  assert.equal(found.edition, 'hl7.fhir.us.davinci-pas 2.2.1 (2026-03-27)');
  assert.equal(found.expiresOn, '2028-03-27');
  assert.deepEqual(records.map((r) => r.type), ['Claim']);
  assert.ok(records[0].elements.every((e) => !('definition' in e) && !('short' in e)));
  assert.deepEqual(ancillary['valuesets.json']['http://hl7.org/fhir/us/davinci-pas/ValueSet/ClaimResponseOutcome'].codes, ['complete', 'error', 'partial']);
  assert.deepEqual(checkDataset({ records, ancillary, canaries: pasProfiles.stableCanaries, shape: pasProfiles.shape }).problems, []);
  assert.deepEqual(reduce({ snapshot: { element: [{ id: 'X', path: 'X', min: 0, max: '1', short: 'dropped', fixedCode: 'a' }] } }), [{ id: 'X', path: 'X', min: 0, max: '1', fixedCode: 'a' }]);
});
