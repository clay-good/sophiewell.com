// Unit tests for lib/artifact-route.js (spec-v7 section 3.1 routing).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { ARTIFACT_KINDS } from '../../lib/artifact-detect.js';
import {
  DEFAULT_ARTIFACT_ROUTES,
  ARTIFACT_LABELS,
  TEXT_EXTENSIONS,
  TEXT_MIME_EXACT,
  routeArtifact,
  isLikelyTextFile,
  formatDetectionHits,
} from '../../lib/artifact-route.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

test('every ARTIFACT_KINDS entry has a routing slot (value or explicit null)', () => {
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(DEFAULT_ARTIFACT_ROUTES, kind),
      'missing routing slot for ' + kind,
    );
  }
});

test('every ARTIFACT_KINDS entry has a human label', () => {
  for (const kind of ARTIFACT_KINDS) {
    assert.ok(typeof ARTIFACT_LABELS[kind] === 'string' && ARTIFACT_LABELS[kind].length > 0);
  }
});

test('routeArtifact returns the mapped tile id for known kinds', () => {
  assert.equal(routeArtifact('bill'), 'decoder');
  assert.equal(routeArtifact('eob'), 'eob-decoder');
  assert.equal(routeArtifact('msn'), 'msn-decoder');
  assert.equal(routeArtifact('lab-result'), 'lab-interpret');
  assert.equal(routeArtifact('denial-letter'), 'appeal-letter');
  assert.equal(routeArtifact('discharge-summary'), 'discharge-instr');
  assert.equal(routeArtifact('insurance-card'), 'insurance');
});

test('routeArtifact returns null for kinds with no shipped decoder', () => {
  assert.equal(routeArtifact('pharmacy-list'), null);
});

test('routeArtifact returns null for unknown / falsy / bogus inputs', () => {
  assert.equal(routeArtifact('unknown'), null);
  assert.equal(routeArtifact(null), null);
  assert.equal(routeArtifact(undefined), null);
  assert.equal(routeArtifact(''), null);
  assert.equal(routeArtifact('not-a-kind'), null);
});

test('routeArtifact gates the result on the knownIds set when provided', () => {
  const known = new Set(['decoder', 'eob-decoder']);
  assert.equal(routeArtifact('bill', known), 'decoder');
  assert.equal(routeArtifact('eob', known), 'eob-decoder');
  // The mapped tile is not in the registry: result must be null, not the id.
  assert.equal(routeArtifact('lab-result', known), null);
  assert.equal(routeArtifact('discharge-summary', known), null);
});

test('isLikelyTextFile accepts common text MIME types and extensions', () => {
  assert.equal(isLikelyTextFile({ name: 'bill.txt', type: 'text/plain' }), true);
  assert.equal(isLikelyTextFile({ name: 'labs.csv', type: 'text/csv' }), true);
  assert.equal(isLikelyTextFile({ name: 'export.json', type: 'application/json' }), true);
  assert.equal(isLikelyTextFile({ name: 'notes.md', type: '' }), true);
  assert.equal(isLikelyTextFile({ name: 'tabs.tsv', type: '' }), true);
  assert.equal(isLikelyTextFile({ name: 'mystery', type: 'text/markdown' }), true);
});

test('isLikelyTextFile rejects PDFs, DOCX, images, and bogus input', () => {
  assert.equal(isLikelyTextFile({ name: 'bill.pdf', type: 'application/pdf' }), false);
  assert.equal(isLikelyTextFile({ name: 'denial.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), false);
  assert.equal(isLikelyTextFile({ name: 'card.png', type: 'image/png' }), false);
  assert.equal(isLikelyTextFile(null), false);
  assert.equal(isLikelyTextFile(undefined), false);
  assert.equal(isLikelyTextFile({}), false);
});

test('TEXT_EXTENSIONS lists the dropzone-input accept set', () => {
  for (const ext of TEXT_EXTENSIONS) {
    assert.equal(ext.startsWith('.'), true, ext + ' must start with a dot');
  }
  assert.ok(TEXT_EXTENSIONS.includes('.txt'));
  assert.ok(TEXT_EXTENSIONS.includes('.csv'));
  assert.ok(TEXT_EXTENSIONS.includes('.json'));
});

test('index.html no longer carries the artifact dropzone after the clinical pivot', () => {
  // The patient-artifact dropzone (spec-v7 §3.1) was removed when Sophie
  // pivoted to the clinical-staff-first wedge. The lib/artifact-* modules
  // remain in the tree (still tested above for the eventual re-introduction
  // behind a clinician-driven input surface), but the home view no longer
  // renders the dropzone, so the prior "accept= stays in lockstep" check
  // is reframed: the dropzone elements must NOT be present.
  const html = readFileSync(resolve(REPO_ROOT, 'index.html'), 'utf8');
  assert.equal(html.includes('id="artifact-dropzone"'), false, 'artifact-dropzone must not be in index.html');
  assert.equal(html.includes('id="artifact-file-input"'), false, 'artifact-file-input must not be in index.html');
  assert.equal(html.includes('id="artifact-paste"'), false, 'artifact-paste must not be in index.html');
  // TEXT_EXTENSIONS and TEXT_MIME_EXACT still drive isLikelyTextFile() in
  // lib/artifact-route.js; keep them touched so the imports above are
  // exercised even though the HTML accept= attribute is gone.
  assert.ok(TEXT_EXTENSIONS.length > 0);
  assert.ok(TEXT_MIME_EXACT.length > 0);
});

test('formatDetectionHits joins up to three hits with a label', () => {
  assert.equal(formatDetectionHits([]), '');
  assert.equal(formatDetectionHits(null), '');
  assert.equal(formatDetectionHits(['a']), 'matched: a');
  assert.equal(formatDetectionHits(['a', 'b', 'c', 'd']), 'matched: a, b, c');
  assert.equal(formatDetectionHits(['a', 'b'], 1), 'matched: a');
});
