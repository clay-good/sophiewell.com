// spec-v1510 tool 1: asp-payment, priced from the quarter's Part B payment limit file.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { aspPayment as a, aspLookup, normalizeHcpcs, shardName } from '../../lib/asp-payment.js';

const period = { effectiveFrom: '2026-10-01', effectiveTo: '2026-12-31' };
const row = { code: 'J9035', dosage: '10 MG', limit: 75.492, coinsurance: 20, notes: null };
const found = { status: 'found', row, period };

test('allowed = limit x units, split into coinsurance and Medicare\'s share less sequestration', () => {
  const r = a({ code: 'j9035', units: '10', serviceDate: '2026-11-03', lookup: found });
  assert.equal(r.allowedCents, 75492);
  assert.equal(r.patientCents, 15098);
  assert.equal(r.medicareCents, 60394);
  assert.equal(r.medicareAfterSequestrationCents, 59186);
  assert.match(r.band, /^J9035 \(10 MG per unit\): payment limit \$75\.492 per unit for Oct 1, 2026 through Dec 31, 2026, times 10 = \$754\.92 allowed\. Patient coinsurance 20% = \$150\.98; Medicare pays \$603\.94, \$591\.86 after the 2% sequestration reduction\.$/);
});

test('the file\'s own coinsurance and notes are used: inflation-adjusted coinsurance, biosimilar add-on', () => {
  const r = a({ code: 'J0897', units: '120', serviceDate: '2026-10-01', lookup: { status: 'found', period, row: { code: 'J0897', dosage: '1 MG', limit: 29.856, coinsurance: 17.885, notes: 'Inflation-adjusted coinsurance' } } });
  assert.match(r.band, /Patient coinsurance 17\.885% = \$640\.77/);
  assert.ok(r.notes.some((n) => /note for this code: Inflation-adjusted coinsurance/.test(n)));
});

test('a date outside the quarter on file, an unlisted code and an unpriced row are not priced', () => {
  assert.match(a({ code: 'J9035', units: '1', serviceDate: '2026-09-30', lookup: found }).message, /holds the payment limits for Oct 1, 2026 through Dec 31, 2026, not for Sep 30, 2026.*Enter the payment limit per unit/);
  assert.match(a({ code: 'J9999', units: '1', serviceDate: '2026-11-01', lookup: { status: 'not-listed', period } }).message, /not in the Part B payment limit file/);
  assert.match(a({ code: 'A9606', units: '1', serviceDate: '2026-11-01', lookup: { status: 'found', period, row: { code: 'A9606', limit: null, coinsurance: 20, notes: 'microCurie 100% AWP = $212.84' } } }).message, /posts no payment limit for A9606.*100% AWP/);
  assert.match(a({ code: 'J9035', units: '1', serviceDate: '2026-11-01', lookup: { status: 'expired' } }).message, /passed its review date/);
  assert.match(a({ code: 'J9035', units: '1', serviceDate: '2026-11-01' }).message, /could not be loaded/);
});

test('an entered limit replaces the lookup; a blank coinsurance is disclosed as 20%', () => {
  const r = a({ code: 'J9035', units: '10', limit: '75.492', coinsurance: '20' });
  assert.equal(r.allowedCents, 75492);
  assert.match(r.band, /payment limit \$75\.492 per unit \(entered\)/);
  assert.ok(a({ code: 'J9035', units: '10', limit: '75.492' }).notes.some((n) => /No coinsurance percentage was entered, so 20% is used/.test(n)));
});

test('blanks and malformed codes are asked for', () => {
  assert.match(a({}).message, /^Enter the HCPCS code/);
  assert.match(a({ code: 'J90' }).message, /five characters/);
  assert.match(a({ code: 'J9035' }).message, /^Enter the units billed/);
  assert.match(a({ code: 'J9035', units: '1' }).message, /^Enter the date of service/);
  assert.match(a({ code: 'J9035', units: '1', limit: '5', coinsurance: '25' }).message, /must be between 0 and 20/);
  assert.equal(normalizeHcpcs(' q5107 '), 'Q5107');
  assert.equal(shardName('Q5107'), 'Q.json');
});

test('aspLookup reads the bundled quarter', () => {
  const manifest = JSON.parse(readFileSync('data/asp/manifest.json', 'utf8'));
  const p = JSON.parse(readFileSync('data/asp/period.json', 'utf8'));
  const rows = JSON.parse(readFileSync('data/asp/shards/J.json', 'utf8'));
  const now = new Date(`${manifest.fetchedAt}T12:00:00Z`);
  const hit = aspLookup({ code: rows[0].code, manifest, period: p, rows, now });
  assert.equal(hit.status, 'found');
  assert.equal(aspLookup({ code: 'J0000', manifest, period: p, rows, now }).status, 'not-listed');
  assert.equal(aspLookup({ code: 'X1234', manifest, period: p, rows: null, now }).status, 'not-listed');
});
