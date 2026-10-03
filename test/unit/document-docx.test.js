// spec-v1501 §4: the document builder's .docx download -- the printable document as Word, with a banner
// while any bracketed blank is left.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDocumentDocx, countBlanks } from '../../lib/pa/docx.js';
import { erisaAppealLetter } from '../../lib/request-letters-v1504.js';

// The writer stores without compression, so the document's XML is readable in the bytes.
const xml = (bytes) => Buffer.from(bytes).toString('utf8');

const DOC = {
  title: 'Appeal & request',
  warnings: ['Filed late: good cause is asked for.'],
  sections: [
    { heading: 'Request', paragraphs: ['I ask the plan to reconsider.', 'Reason: [State why the drug is needed]'] },
    { heading: 'Enclosures', items: ['The denial notice', '[List the records you attach]'] },
  ],
};

test('a document with blanks opens with a banner that counts them, and escapes its text', () => {
  const s = xml(renderDocumentDocx(DOC));
  assert.equal(countBlanks(DOC.sections), 2);
  assert.ok(s.indexOf('NOT READY TO SEND: 2 blanks in [brackets]') < s.indexOf('Appeal &amp; request'), 'the banner comes first');
  assert.match(s, /• The denial notice/);
  assert.match(s, /Filed late: good cause is asked for\./);
  assert.ok(Buffer.from(renderDocumentDocx(DOC)).subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])), 'a zip package');
});

test('a document with no blanks has no banner, and the same document gives the same bytes', () => {
  const done = { ...DOC, sections: [{ heading: 'Request', paragraphs: ['I ask the plan to reconsider.'] }] };
  assert.doesNotMatch(xml(renderDocumentDocx(done)), /NOT READY TO SEND/);
  assert.deepEqual(renderDocumentDocx(DOC), renderDocumentDocx(DOC));
});

test('a letter builder\'s own blank count and the download\'s agree', () => {
  const r = erisaAppealLetter({ denialReceived: '2026-09-01', claimKind: 'pre', claimant: 'Pat Doe', memberId: 'X123', claimId: 'C-1', plan: 'Acme Plan', service: 'an MRI', requestDate: '2026-09-20' });
  assert.equal(r.valid, true, r.message);
  assert.equal(countBlanks(r.sections), r.blanks);
  assert.match(xml(renderDocumentDocx(r)), new RegExp(`NOT READY TO SEND: ${r.blanks} blank`));
});
