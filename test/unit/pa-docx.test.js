// spec-v52 §4.6 / §4.10: DOCX writer unit tests (wave 52-6b).
//
// Exercises the first-party OOXML writer in lib/pa/docx.js: a valid
// store-method zip, CRC-32 correctness, XML escaping, and byte-for-byte
// determinism. Runs under `node --test` with zero dependencies.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReportDocx, _internals } from '../../lib/pa/docx.js';

const { crc32, zipStore } = _internals;

const SAMPLE_REPORT = {
  coverPage: {
    title: 'Sophie PA Packet Lint Report',
    packetSize: 1,
    detectedPayer: 'cms-ffs',
    datasetVersion: '1.0.0',
    reportFormatVersion: '1',
    generatedAt: null,
    disclaimer: 'Sophie Prior-Auth Packet Linter is a deterministic checklist.',
  },
  executiveSummary: {
    totalRulesEvaluated: 2,
    counts: { block: 1, flag: 0, info: 0, pass: 1, error: 0 },
    blockFindings: [{ ruleId: 'R-PA-001', description: 'Patient name present' }],
  },
  findings: [
    { ruleId: 'R-PA-001', severity: 'block', status: 'block',
      description: 'Patient name present', citation: 'core', evidence: null,
      note: null, remediation: 'Add the patient name and resubmit.' },
    { ruleId: 'R-PA-004', severity: 'block', status: 'pass',
      description: 'Service date present', citation: 'core', evidence: '2026-04-12',
      note: null, remediation: null },
  ],
  evidenceLedger: [
    { document: 'doc.txt', sha256: 'abc123', kind: 'TXT', role: 'clinical-note',
      payer: 'cms-ffs', ledger: { cpts: ['99213'], serviceDates: ['2026-04-12'] } },
  ],
  extractedData: [
    { document: 'doc.txt', sha256: 'abc123', extract: { cpts: ['99213'] } },
  ],
  auditTrail: {
    rulesetVersion: '1.0.0',
    reportFormatVersion: '1',
    ruleIds: ['R-PA-001', 'R-PA-004'],
    documentHashes: [{ document: 'doc.txt', sha256: 'abc123' }],
    totalBytes: 4096,
    generatedAt: null,
  },
};

test('crc32 matches the canonical value for "123456789"', () => {
  const bytes = new TextEncoder().encode('123456789');
  // The well-known CRC-32/ISO-HDLC check value.
  assert.equal(crc32(bytes), 0xCBF43926);
});

test('zipStore emits a valid local-file-header signature and EOCD', () => {
  const zip = zipStore([{ name: 'a.txt', data: new TextEncoder().encode('hi') }]);
  assert.ok(zip instanceof Uint8Array);
  // PK\x03\x04 local file header.
  assert.deepEqual(Array.from(zip.slice(0, 4)), [0x50, 0x4B, 0x03, 0x04]);
  // PK\x05\x06 end-of-central-directory near the tail (no zip comment).
  const eocd = zip.slice(zip.length - 22, zip.length - 18);
  assert.deepEqual(Array.from(eocd), [0x50, 0x4B, 0x05, 0x06]);
});

test('renderReportDocx returns docx bytes starting with the zip magic', () => {
  const bytes = renderReportDocx(SAMPLE_REPORT);
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 0);
  assert.deepEqual(Array.from(bytes.slice(0, 4)), [0x50, 0x4B, 0x03, 0x04]);
});

test('renderReportDocx is byte-for-byte deterministic (§4.10)', () => {
  const a = renderReportDocx(SAMPLE_REPORT);
  const b = renderReportDocx(SAMPLE_REPORT);
  assert.equal(a.length, b.length);
  assert.deepEqual(Array.from(a), Array.from(b));
});

test('renderReportDocx embeds the document text (store method, inspectable)', () => {
  const bytes = renderReportDocx(SAMPLE_REPORT);
  const text = new TextDecoder('utf-8').decode(bytes);
  assert.ok(text.includes('word/document.xml'), 'missing document.xml part name');
  assert.ok(text.includes('R-PA-001'), 'missing a rule id from the body');
  assert.ok(text.includes('deterministic checklist'), 'missing the disclaimer');
});

test('renderReportDocx escapes XML metacharacters in content', () => {
  const report = {
    ...SAMPLE_REPORT,
    findings: [{ ruleId: 'R-PA-001', status: 'flag', description: 'a < b & c > d "q"',
      citation: 'core', evidence: null, note: null, remediation: null }],
  };
  const text = new TextDecoder('utf-8').decode(renderReportDocx(report));
  assert.ok(text.includes('a &lt; b &amp; c &gt; d &quot;q&quot;'), 'content not escaped');
});

test('renderReportDocx does not throw on an empty / minimal report', () => {
  assert.doesNotThrow(() => renderReportDocx({}));
  const bytes = renderReportDocx({});
  assert.deepEqual(Array.from(bytes.slice(0, 4)), [0x50, 0x4B, 0x03, 0x04]);
});
