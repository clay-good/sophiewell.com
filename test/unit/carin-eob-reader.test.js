// spec-v1602 tool 1: carin-eob-reader. The CARIN Blue Button 2.2.0 examples (test/fixtures/carin-bb-2.2.0,
// CC0, from the hl7.fhir.us.carin-bb 2.2.0 package) round-trip their totals to the cent; a preventive code
// with coinsurance raises the preventive flag and nothing else; a missing allowed amount is missing, not zero.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { readEob, resources } from '../../lib/carin-eob-reader.js';
import { run } from '../../lib/carin-run.js';

const DIR = join(process.cwd(), 'test', 'fixtures', 'carin-bb-2.2.0');
const all = readdirSync(DIR).map((f) => JSON.parse(readFileSync(join(DIR, f))));
const bundle = JSON.stringify({ resourceType: 'Bundle', type: 'searchset', entry: all.map((resource) => ({ resource })) });

const ADJ = 'http://terminology.hl7.org/CodeSystem/adjudication';
const C4 = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBAdjudication';
const DISC = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBAdjudicationDiscriminator';
const STATUS = 'http://hl7.org/fhir/us/carin-bb/CodeSystem/C4BBPayerAdjudicationStatus';
const amt = (system, code, value) => ({ category: { coding: [{ system, code }] }, amount: { value, currency: 'USD' } });
const status = (which, code) => ({ category: { coding: [{ system: DISC, code: which }] }, reason: { coding: [{ system: STATUS, code }] } });
const eob = (id, items, extra = {}) => ({ resourceType: 'ExplanationOfBenefit', id, type: { coding: [{ code: 'professional' }] }, billablePeriod: { start: '2026-03-02' }, provider: { display: 'Example Clinic' }, item: items, ...extra });
const line = (code, adjudication, extra = {}) => ({ productOrService: { coding: [{ code }] }, servicedDate: '2026-03-02', adjudication, ...extra });
const ndjson = (...r) => r.map((x) => JSON.stringify(x)).join('\n');

test('every CARIN example claim is read, and its totals round-trip to the cent', () => {
  const r = readEob(bundle);
  assert.equal(r.valid, true);
  const eobs = all.filter((x) => x.resourceType === 'ExplanationOfBenefit');
  assert.equal(r.claims.length, eobs.length);
  for (const [i, e] of eobs.entries()) {
    const submitted = (e.total || []).find((t) => t.category.coding.some((c) => c.system === ADJ && c.code === 'submitted'));
    if (submitted) assert.equal(r.claims[i].amounts.billed, Math.round(submitted.amount.value * 100), e.id);
    const eligible = (e.total || []).find((t) => t.category.coding.some((c) => c.system === ADJ && c.code === 'eligible'));
    assert.equal(r.claims[i].amounts.allowed, eligible ? Math.round(eligible.amount.value * 100) : null, e.id);
  }
  const prof = r.claims.find((c) => c.id === 'ProfessionalEOBExample1');
  assert.deepEqual([prof.amounts.billed, prof.amounts.allowed, prof.amounts.planPaid, prof.provider, prof.network], [82000, 25891, 25891, 'Orange Medical Group', 'innetwork']);
  assert.equal(r.flags.length, 0);
});

test('a missing allowed amount is missing in the claim and counted as not stated in its year', () => {
  const r = readEob(bundle);
  const y2021 = r.years.find((y) => y.year === '2021');
  assert.equal(y2021.missing.allowed, 2);
  assert.ok(r.claims.filter((c) => c.date.startsWith('2021')).every((c) => c.amounts.allowed === null));
});

test('a preventive visit with coinsurance raises the preventive flag and nothing else', () => {
  const r = readEob(ndjson(eob('a', [line('99396', [amt(ADJ, 'submitted', 300), amt(ADJ, 'eligible', 200), amt(C4, 'coinsurance', 40), amt(C4, 'memberliability', 40)])])));
  assert.deepEqual(r.flags.map((f) => [f.flag, f.tool]), [['Preventive visit with cost sharing', 'preventive-cost-share-check']]);
  assert.match(r.flags[0].fact, /^Code 99396 on 2026-03-02 is a preventive medicine visit, and the file shows \$40\.00 for you to pay\./);
});

test('a screening code from the preventive code map with a cost share raises the preventive flag; a dual-use lab code does not', () => {
  const r = readEob(ndjson(
    eob('a', [line('77067', [amt(ADJ, 'eligible', 150), amt(C4, 'coinsurance', 30), amt(C4, 'memberliability', 30)])]),
    eob('b', [line('83036', [amt(ADJ, 'eligible', 20), amt(C4, 'coinsurance', 4), amt(C4, 'memberliability', 4)])]),
    eob('c', [line('G0121', [amt(ADJ, 'eligible', 900), amt(C4, 'memberliability', 0)])]),
  ), { now: new Date('2026-10-07T12:00:00Z') });
  assert.deepEqual(r.flags.map((f) => [f.claim, f.flag, f.tool]), [['a', 'Preventive service with cost sharing', 'preventive-cost-share-check']]);
  assert.match(r.flags[0].fact, /^Code 77067 on 2026-03-02 is screening mammography on the CMS preventive services chart \(July 2026\), and the file shows \$30\.00 for you to pay\. In network, most plans \(not grandfathered ones\) must cover a USPSTF A or B recommendation without cost sharing/);
});

test('past its review date the code map still flags, and says the list is due for review', () => {
  const r = readEob(ndjson(eob('a', [line('G0444', [amt(ADJ, 'eligible', 20), amt(C4, 'memberliability', 20)])])), { now: new Date('2027-10-01T12:00:00Z') });
  assert.match(r.flags[0].fact, /\(July 2026, a list now due for review\)/);
});

test('out-of-network emergency care, a possible duplicate, a denial and a coinsurance mismatch are each named with their fact', () => {
  const r = readEob(ndjson(
    eob('b', [line('99284', [amt(ADJ, 'eligible', 500), amt(C4, 'memberliability', 300), status('benefitpaymentstatus', 'outofnetwork')], { locationCodeableConcept: { coding: [{ code: '23' }] } })]),
    eob('c', [line('99213', [amt(ADJ, 'eligible', 100), amt(C4, 'coinsurance', 25), amt(C4, 'memberliability', 25)])]),
    eob('d', [line('99213', [amt(ADJ, 'eligible', 100), amt(C4, 'coinsurance', 20), amt(C4, 'memberliability', 20)])]),
    eob('e', [line('97110', [{ category: { coding: [{ system: DISC, code: 'rejectreason' }] }, reason: { coding: [{ code: 'CO-50' }] } }])], { payment: { type: { coding: [{ system: STATUS, code: 'denied' }] } } }),
  ), { coinsurancePct: 20 });
  assert.deepEqual(r.flags.map((f) => [f.claim, f.flag]), [
    ['b', 'Out-of-network emergency care'],
    ['c', 'Coinsurance differs from your plan\'s rate'],
    ['d', 'Possible duplicate'],
    ['e', 'Denied'],
  ]);
  assert.match(r.flags[1].fact, /20% of \$100\.00 .* is \$20\.00; the file shows \$25\.00\.$/);
  assert.match(r.flags[3].fact, /reason code CO-50\.$/);
  assert.equal(r.band, '4 claims in 2026; 4 worth asking about.');
});

test('a Bundle, NDJSON and one resource all read; other JSON is refused by name', () => {
  const one = eob('x', [line('99213', [amt(ADJ, 'eligible', 80)])]);
  assert.equal(resources(JSON.stringify(one)).length, 1);
  assert.equal(resources(ndjson(one, one)).length, 2);
  assert.equal(readEob('{"resourceType":"Patient","id":"p"}').message, 'The file holds no ExplanationOfBenefit (claim) resources.');
  assert.equal(readEob('hello').valid, false);
});

test('a run over two files is one set of claims, with a receipt and a CSV provenance row', () => {
  const enc = (t) => new TextEncoder().encode(t).buffer;
  const out = run([{ name: 'claims-2025.json', buffer: enc(bundle) }, { name: 'more.ndjson', buffer: enc(ndjson(eob('z', [line('99213', [amt(ADJ, 'eligible', 80)])]))) }], { coinsurancePct: '' });
  assert.equal(out.result.claims.length, 11);
  assert.equal(out.receipts.receipt.files.length, 2);
  assert.deepEqual(out.receipts.receipt.options, { coinsurancePct: null });
  assert.match(out.csv.trimEnd().split(/\r?\n/).at(-1), /^# Made by sophiewell\.com carin-eob-reader, build [^,]+, result [0-9a-f]{64}\./);
});
