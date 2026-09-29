// spec-v1623 step 1: the JSON head scanner, on whole and cut-off heads.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scanJsonHead } from '../../lib/json-head.js';

test('top-level keys, a top-level resourceType, nested types and profiles', () => {
  const text = JSON.stringify({
    resourceType: 'Bundle', type: 'collection',
    entry: [{ resource: { resourceType: 'Claim', meta: { profile: ['http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-claim'] } } }, { resource: { resourceType: 'Patient' } }],
  });
  const r = scanJsonHead(text);
  assert.equal(r.kind, 'object');
  assert.deepEqual(r.topKeys, ['resourceType', 'type', 'entry']);
  assert.equal(r.resourceType, 'Bundle');
  assert.deepEqual(r.nestedTypes, ['Claim', 'Patient']);
  assert.deepEqual(r.profiles, ['http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-claim']);
  assert.equal(r.truncated, false);
});

test('a head cut off mid-string still reports what came before it', () => {
  const text = '{"reporting_entity_name":"Example","in_network":[{"billing_code":"992';
  const r = scanJsonHead(text);
  assert.deepEqual(r.topKeys, ['reporting_entity_name', 'in_network']);
  assert.equal(r.truncated, true);
});

test('keys inside nested objects are not top-level keys; escapes are decoded', () => {
  const r = scanJsonHead('{"a":{"hospital_name":"x"},"b\\u0041":"q\\"r","c":[1,true,null]}');
  assert.deepEqual(r.topKeys, ['a', 'bA', 'c']);
});

test('NDJSON: three object lines; a pretty-printed object is not NDJSON', () => {
  const nd = scanJsonHead('{"resourceType":"Patient"}\n{"resourceType":"Observation","meta":{"profile":["p1"]}}\n{"resourceType":"Observation"}\n{"resourceType":"Obs');
  assert.equal(nd.kind, 'ndjson');
  assert.deepEqual(nd.nestedTypes, ['Patient', 'Observation']);
  assert.deepEqual(nd.profiles, ['p1']);
  assert.equal(scanJsonHead('{\n  "a": 1\n}\n').kind, 'object');
});

test('not JSON at all', () => {
  assert.equal(scanJsonHead('ISA*00*').kind, null);
});
