import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDom, makeDiv } from '../fixtures/dom-stub.js';

installDom();

const { validateSections, renderPrintable } = await import('../../lib/print.js');

test('validateSections: accepts well-formed input', () => {
  assert.equal(validateSections([{ heading: 'A' }, { heading: 'B', paragraphs: ['x'], items: ['y'] }]), true);
});

test('validateSections: rejects non-array', () => {
  assert.throws(() => validateSections('nope'));
});

test('validateSections: rejects missing heading', () => {
  assert.throws(() => validateSections([{ paragraphs: ['x'] }]));
});

test('validateSections: rejects non-array paragraphs/items', () => {
  assert.throws(() => validateSections([{ heading: 'A', paragraphs: 'x' }]));
  assert.throws(() => validateSections([{ heading: 'A', items: 'x' }]));
});

test('renderPrintable: renders title, section headings, paragraphs, items', () => {
  const root = makeDiv();
  renderPrintable(root, {
    title: 'HIPAA Authorization',
    sections: [
      { heading: 'Patient', paragraphs: ['Name: Jane Doe'] },
      { heading: 'Authorized Disclosures', items: ['Records', 'Imaging'] },
    ],
    warnings: ['Not legal advice.'],
  });
  // Print template uses h2 for the document title (page-level h1 belongs to
  // the route name) and h3 for section headings; see lib/print.js note.
  const h2s = root.querySelectorAll('h2').map((n) => n.textContent);
  assert.equal(h2s.length, 1);
  assert.ok(h2s[0].includes('HIPAA'));
  const h3s = root.querySelectorAll('h3').map((n) => n.textContent);
  assert.deepEqual(h3s, ['Patient', 'Authorized Disclosures']);
  assert.equal(root.querySelectorAll('h1').length, 0);
  assert.ok(root.textContent.includes('Name: Jane Doe'));
  assert.ok(root.textContent.includes('Records'));
  assert.ok(root.textContent.includes('Not legal advice.'));
  assert.ok(root.querySelector('#print-btn'));
});

test('renderPrintable: print button triggers window.print', () => {
  const root = makeDiv();
  globalThis.__printed = 0;
  renderPrintable(root, { title: 'T', sections: [{ heading: 'H' }] });
  root.querySelector('#print-btn').click();
  assert.equal(globalThis.__printed, 1);
});

test('renderPrintable: empty warnings array renders without notices', () => {
  const root = makeDiv();
  renderPrintable(root, { title: 'T', sections: [{ heading: 'H' }] });
  assert.equal(root.querySelectorAll('.printable-warning').length, 0);
});
