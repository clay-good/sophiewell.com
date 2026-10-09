// spec-v1614 §6: the reader's own NCCI PTP edit files, read for itemized-bill-check. The layout is the CMS text
// file's (spec-v1621 §3.4); the pair rule is the NCCI Policy Manual's (2026, Introduction and ch. I sec. E).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePtpLine, ptpEdition, readPtp, ptpFindings } from '../../lib/ncci-ptp.js';
import { itemizedBillCheck, billCorrectionRequest } from '../../lib/itemized-bill-check.js';
import { makeZip } from '../lib/zip-fixture.js';

const HEAD = 'CPT only copyright American Medical Association.\r\n\r\n\r\n\r\n\r\n\r\nColumn 1\tColumn 2\t*=in existence prior to 1996\tEffective Date\tDeletion Date *=no data\tModifier 0=not allowed 1=allowed 9=not applicable\tPTP Edit Rationale\r\n';
const TXT = HEAD + [
  '99284\t36415\t\t20260101\t*\t1\tStandards of medical / surgical practice',
  '71046\t71045\t\t20260101\t*\t0\tMutually exclusive procedures',
  '99284\t96374\t\t20250101\t20260101\t1\tdeleted at the start of 2026',
  '99284\t93005\t\t20260101\t20260101\t9\tdeleted the day it took effect',
  '11111\t22222\t\t20260101\t*\t1\tnot on the bill',
].join('\r\n') + '\r\n';
const blob = (name, data) => new File([data], name);

test('a line is kept only when both codes are on the bill; dates and indicators are read', () => {
  const codes = new Set(['99284', '36415']);
  assert.deepEqual(parsePtpLine('99284\t36415\t\t20260101\t*\t1\tx', codes), { col1: '99284', col2: '36415', effective: '2026-01-01', deleted: null, modifier: '1' });
  assert.equal(parsePtpLine('99284\t99999\t\t20260101\t*\t1\tx', codes), null);
  assert.deepEqual(ptpEdition('ccioph-v322r0-f1.txt'), { setting: 'hospital outpatient', version: 'version 32.2, revision 0' });
  assert.equal(ptpEdition('ccipra-v321r1-f4.TXT').setting, 'practitioner');
});

test('readPtp streams a text file and a zip of parts, keeping only the bill\'s pairs', async () => {
  const codes = ['99284', '36415', '71046', '71045', '96374', '93005'];
  const fromText = await readPtp([blob('ccioph-v322r0-f1.txt', TXT)], codes);
  assert.equal(fromText.rows.length, 4);
  assert.deepEqual(fromText.editions, ['version 32.2, revision 0']);
  const zip = makeZip([{ name: 'ccioph-v322r0-f1.txt', data: TXT }, { name: 'ccioph-v322r0-f2.txt', data: HEAD }, { name: 'readme.pdf', data: '%PDF' }]);
  const fromZip = await readPtp([blob('ptp-edits-ccioph-v322r0-f1.zip', zip)], codes);
  assert.equal(fromZip.rows.length, 4);
  await assert.rejects(readPtp([blob('bill.txt', 'date,code\n')], codes), /not a CMS NCCI PTP edit file/);
});

test('the column 2 line is flagged on the same date when the edit is active; 9 and deleted edits are not', async () => {
  const { rows } = await readPtp([blob('ccioph-v322r0-f1.txt', TXT)], ['99284', '36415', '71046', '71045', '96374', '93005']);
  const lines = [
    { line: 1, code: '99284', date: '2026-03-02' }, { line: 2, code: '36415', date: '2026-03-02' },
    { line: 3, code: '96374', date: '2026-03-02' }, { line: 4, code: '93005', date: '2026-03-02' },
    { line: 5, code: '71046', date: '2026-03-03' }, { line: 6, code: '71045', date: '2026-03-04' },
  ];
  const f = ptpFindings(lines, rows);
  assert.deepEqual([...f.keys()], [2]);
  assert.match(f.get(2)[0], /^billed with 99284 on 2026-03-02: an NCCI pair edit, so 36415 is not paid separately unless a modifier/);
  const undated = ptpFindings([{ line: 1, code: '71046', date: null }, { line: 2, code: '71045', date: null }], rows);
  assert.match(undated.get(2)[0], /^billed with 71046: an NCCI pair edit, so 71045 is not paid separately and no modifier allows it/);
});

test('itemized-bill-check: pairs flagged on an outpatient bill, named in the notes and the letter; not on an inpatient one', async () => {
  const ptp = await readPtp([blob('ccioph-v322r0-f1.txt', TXT)], ['99284', '36415']);
  const lines = [{ date: '2026-03-02', code: '99284', units: '1', charge: '2400' }, { date: '2026-03-02', code: '36415', units: '1', charge: '40' }];
  const prices = { 99284: [{ setting: 'both', gross: 3000, cash: 1500, payers: [] }], 36415: [{ setting: 'both', gross: 50, cash: 20, payers: [] }] };
  const r = itemizedBillCheck({ lines, setting: 'outpatient', payment: 'insured', prices, ptp });
  assert.equal(r.rows[1].status, 'ask');
  assert.match(r.rows[1].findings[0], /NCCI pair edit/);
  assert.ok(r.notes.some((n) => /checked against your NCCI procedure-to-procedure edits \(version 32\.2, revision 0\)/.test(n)));
  const letter = billCorrectionRequest(r, {});
  assert.ok(letter.sections.some((s) => (s.paragraphs || []).some((p) => /Medicare's pair edits say includes it/.test(p))));
  const inpatient = itemizedBillCheck({ lines, setting: 'inpatient', payment: 'insured', prices, ptp });
  assert.equal(inpatient.rows[1].status, 'ok');
  assert.ok(inpatient.notes.some((n) => /hospital pair edits apply to outpatient claims/.test(n)));
  const none = itemizedBillCheck({ lines, setting: 'outpatient', payment: 'insured', prices });
  assert.ok(none.notes.some((n) => /add your copy of the CMS NCCI procedure-to-procedure edits/.test(n)));
});
