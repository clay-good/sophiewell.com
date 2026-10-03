// spec-v1512 tool 5: substitution-check, and the spec-v1517 orange-book and purple-book builders. Fixtures are
// trimmed copies of the FDA files read October 3, 2026 (products.txt of 2026-09-11; the August 2026 Purple Book).
// The spec's tests: an AB-rated generic; a BX-rated product; an interchangeable and a non-interchangeable
// biosimilar of the same reference product.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import orangeBook, { discover as discoverOrange, parse as parseOrange } from '../../scripts/data/builders/orange-book.mjs';
import purpleBook, { discover as discoverPurple, parse as parsePurple } from '../../scripts/data/builders/purple-book.mjs';
import { checkDataset } from '../../scripts/data/check.mjs';
import { makeZip } from '../lib/zip-fixture.js';
import { substitutionCheck, searchBooks } from '../../lib/substitution-check.js';

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'data-sources');
const products = readFileSync(join(FIX, 'orange-book', 'products.txt'));
const zip = (data, modified = new Date(Date.UTC(2026, 8, 11, 9, 55, 0))) => makeZip([{ name: 'exclusivity.txt', data: 'x', modified }, { name: 'products.txt', data, modified }]);
const pb = readFileSync(join(FIX, 'purple-book', 'purplebook.csv'));

const ob = async () => (await parseOrange(zip(products), {}, { bounds: false })).records;
const pick = (rows, book, words) => { const r = searchBooks(rows, words.split(' '), book); assert.equal(r.length, 1, `${words}: ${r.length} found`); return { book, record: r[0] }; };

test('orange-book discover: the data-files ZIP from the landing page', async () => {
  const found = await discoverOrange({ getText: async () => readFileSync(join(FIX, 'orange-book', 'landing.html'), 'utf8') });
  assert.equal(found.url, 'https://www.fda.gov/media/76860/download?attachment');
});

test('orange-book parse: discontinued products dropped, strength notes kept apart, the edition dated from the file', async () => {
  const found = {};
  const { records, ancillary } = await parseOrange(zip(products), found, { bounds: false });
  assert.equal(found.edition, '2026-09 (products.txt of 2026-09-11)');
  assert.deepEqual([found.effectiveFrom, found.nextExpected, found.expiresOn], ['2026-09-11', '2026-10-16', '2026-11-11']);
  assert.ok(records.every((r) => r.type !== 'DISCN'));
  const midamor = records.find((r) => r.trade === 'MIDAMOR');
  assert.equal(midamor.strength, '5MG');
  assert.match(midamor.note, /^Federal Register determination/);
  assert.deepEqual(ancillary['names.json']['PROCARDIA XL'], ['N']);
  assert.deepEqual(checkDataset({ records, ancillary, canaries: orangeBook.stableCanaries, shape: orangeBook.shape }).problems, []);
  await assert.rejects(parseOrange(zip(Buffer.from(products.toString('latin1').replace('TE_Code', 'TE'), 'latin1')), {}, { bounds: false }), /header changed/);
  await assert.rejects(parseOrange(makeZip([{ name: 'products.txt', data: products }]), {}, { bounds: false }), /no date/);
});

test('purple-book discover and parse: the newest month, the full listing table, discontinued dropped', async () => {
  const found = await discoverPurple({ getText: async () => readFileSync(join(FIX, 'purple-book', 'downloads.html'), 'utf8') });
  assert.equal(found.edition, '2026-08');
  assert.deepEqual([found.nextExpected, found.expiresOn], ['2026-10-01', '2026-12-01']);
  const { records } = await parsePurple(pb, {}, { bounds: false });
  assert.deepEqual([...new Set(records.map((r) => r.proprietary))].sort(), ['Abrilada', 'Amjevita', 'Humira', 'Idacio']);
  assert.deepEqual(checkDataset({ records, canaries: purpleBook.stableCanaries, shape: purpleBook.shape }).problems, []);
});

test('an AB-rated generic against its reference is substitutable; AB1 against AB2 is not', async () => {
  const rows = await ob();
  const procardia = pick(rows, 'orange', 'PROCARDIA XL 30MG');
  const ab2 = pick(rows, 'orange', 'NIFEDIPINE OSMOTICA 30MG');
  const ab1 = pick(rows, 'orange', 'NIFEDIPINE AUROBINDO 30MG');
  const yes = substitutionCheck({ prescribed: procardia, shelf: ab2, editions: { orange: '2026-09' } });
  assert.equal(yes.substitutable, true);
  assert.equal(yes.band, 'Substitutable at the pharmacy (subject to state law): both products are rated AB2.');
  assert.match(yes.notes.join(' '), /State pharmacy law governs the substitution itself/);
  const no = substitutionCheck({ prescribed: procardia, shelf: ab1 });
  assert.equal(no.band, 'Not substitutable: the ratings differ (AB2 prescribed, AB1 on the shelf). A multi-source rating such as AB1 is equivalent only to products with the same code.');
  assert.match(substitutionCheck({ prescribed: procardia, shelf: pick(rows, 'orange', 'PROCARDIA XL 60MG') }).band, /different strengths/);
});

test('a BX-rated product, or one with no TE code, is not substitutable', async () => {
  const rows = await ob();
  const ref = pick(rows, 'orange', 'PROCARDIA XL 30MG');
  const bx = { book: 'orange', record: { ...pick(rows, 'orange', 'NIFEDIPINE AUROBINDO 30MG').record, te: 'BX', appl: 'A999999' } };
  assert.equal(substitutionCheck({ prescribed: ref, shelf: bx }).band, 'Not substitutable: the product on the shelf is rated BX, not therapeutically equivalent.');
  const none = { book: 'orange', record: { ...bx.record, te: '' } };
  assert.match(substitutionCheck({ prescribed: ref, shelf: none }).band, /no therapeutic equivalence code/);
});

test('an interchangeable biosimilar is substitutable for its reference; a non-interchangeable one is not, nor the reverse', async () => {
  const { records } = await parsePurple(pb, {}, { bounds: false });
  // "Humira" also finds its biosimilars (their reference product is named); the page lists them all.
  assert.equal(searchBooks(records, ['HUMIRA', 'AUTOINJECTOR'], 'purple').length, 4);
  const humira = { book: 'purple', record: records.find((r) => r.proprietary === 'Humira' && r.presentation === 'Autoinjector') };
  const abrilada = pick(records, 'purple', 'ABRILADA AUTOINJECTOR');
  const idacio = pick(records, 'purple', 'IDACIO AUTOINJECTOR');
  assert.equal(substitutionCheck({ prescribed: humira, shelf: abrilada }).band, 'Substitutable at the pharmacy (subject to state law): the product on the shelf is licensed as interchangeable with the prescribed product.');
  assert.equal(substitutionCheck({ prescribed: humira, shelf: idacio }).band, 'Not substitutable: biosimilar, not interchangeable. It needs a new prescription.');
  assert.match(substitutionCheck({ prescribed: abrilada, shelf: humira }).band, /Interchangeability runs from the reference product to the interchangeable, not back\.$/);
  const orange = pick(await ob(), 'orange', 'LIPITOR 10MG');
  assert.match(substitutionCheck({ prescribed: humira, shelf: orange }).message, /neither book rates one against the other/);
});

test('nothing is decided until both products are picked', () => {
  assert.equal(substitutionCheck({}).message, 'Choose the prescribed product.');
  assert.equal(substitutionCheck({ prescribed: { book: 'orange', record: {} } }).message, 'Choose the product on the shelf.');
});
