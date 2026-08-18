// Long explanation paragraphs collapse behind a "More detail" disclosure.
// The rule is applied once, centrally, so these tests are the only place it
// is asserted; the visible-in-the-browser assertion lives in the e2e suite.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitLead } from '../../lib/long-note.js';

const LONG = 'The POSEIDON classification stratifies low-prognosis patients in assisted reproduction on two axes, age and ovarian reserve, into four groups. Only groups 1 and 2 are subdivided into a and b by the oocyte yield of a prior cycle; there is no group 3a or 4b. Groups 3 and 4 need no prior cycle.';

test('splitLead keeps the first sentence and hands back the rest', () => {
  const { lead, rest } = splitLead(LONG);
  assert.ok(lead.endsWith('into four groups.'));
  assert.ok(rest.startsWith('Only groups 1 and 2'));
  assert.equal(`${lead} ${rest}`, LONG);
});

test('splitLead refuses a two-word lead by default but takes it at a lower floor', () => {
  const label = 'Patient age. The classification splits at 35: under 35 gives groups 1 and 3, 35 or over gives groups 2 and 4.';
  // Default floor: "Patient age." is a fragment inside a paragraph, so the
  // whole label stands.
  assert.equal(splitLead(label), null);
  // Field-label floor: "Patient age." IS the label; the rest is qualification.
  const { lead, rest } = splitLead(label, { minLead: 10 });
  assert.equal(lead, 'Patient age.');
  assert.ok(rest.startsWith('The classification splits'));
});

test('splitLead does not cut a decimal in half', () => {
  const { lead } = splitLead('Ovarian reserve counts as adequate at 1.2 ng/mL or anything higher. Below that it does not.');
  assert.equal(lead, 'Ovarian reserve counts as adequate at 1.2 ng/mL or anything higher.');
});

test('splitLead skips a period that ends an abbreviation', () => {
  const { lead } = splitLead('Report the histologic grade the pathologist assigned, e.g. Grade 2, and not a diagnosis. The decision stays with the clinician.');
  assert.equal(lead, 'Report the histologic grade the pathologist assigned, e.g. Grade 2, and not a diagnosis.');
});

// The abbreviation lookup read the last whitespace-delimited token, and an
// aside opens with a bracket: "(e.g." is not "e.g.", so the check missed and
// a field label was published cut to "Level just completed (e.g".
test('splitLead skips an abbreviation that opens a parenthesis', () => {
  const label = 'Level just completed (e.g. initial, redetermination, reconsideration). Pick the one you just heard back on.';
  const { lead } = splitLead(label, { minLead: 4 });
  assert.equal(lead, 'Level just completed (e.g. initial, redetermination, reconsideration).');
});

// Author initials inside a parenthetical citation end in a period and are not
// the end of a sentence. Splitting there published "Five-times sit-to-stand
// test (Csuka M, McCarty DJ." -- a fragment holding a bracket it never closes.
test('splitLead does not split inside a bracket', () => {
  const text = 'Five-times sit-to-stand test (Csuka M, McCarty DJ. J Rheumatol 1985): timed lower-limb strength. The cutoff varies by age.';
  const { lead } = splitLead(text);
  assert.equal(lead, 'Five-times sit-to-stand test (Csuka M, McCarty DJ. J Rheumatol 1985): timed lower-limb strength.');
});

test('splitLead scans past a spelled-out acronym rather than leading with it', () => {
  const { lead, rest } = splitLead('S.T.O.N.E. is a five-part score for predicting spontaneous passage of a ureteral stone. It is not a treatment decision.');
  assert.ok(lead.startsWith('S.T.O.N.E. is a five-part score'));
  assert.equal(rest, 'It is not a treatment decision.');
});

// Field descriptions on the pre-rendered pages legitimately lead with a short
// noun phrase; that phrase is the line a reader scans, so keep it.
test('splitLead keeps a short noun-phrase lead', () => {
  const { lead, rest } = splitLead('Antral follicle count. Adequate reserve is 5 or more, and it is an alternative to anti-Mullerian hormone.');
  assert.equal(lead, 'Antral follicle count.');
  assert.ok(rest.startsWith('Adequate reserve'));
});

test('splitLead returns null when there is nothing to split off', () => {
  assert.equal(splitLead('One sentence only.'), null);
  assert.equal(splitLead('No terminator at all'), null);
});

// --- collapseLongNotes over a minimal DOM stub ---------------------------

function stubDocument() {
  const make = (tag) => {
    const node = {
      tagName: String(tag).toUpperCase(),
      children: [],
      attrs: {},
      classList: { contains: (c) => String(node.attrs.class || '').split(/\s+/).includes(c) },
      appendChild(c) { this.children.push(c); c.parent = this; return c; },
      setAttribute(k, v) { this.attrs[k] = v; if (k === 'class') this.className = v; },
      set className(v) { this.attrs.class = v; },
      get className() { return this.attrs.class || ''; },
      set textContent(v) { this._text = String(v); },
      get textContent() { return this._text || ''; },
      insertAdjacentElement(_where, other) {
        const at = this.parent.children.indexOf(this);
        this.parent.children.splice(at + 1, 0, other);
        other.parent = this.parent;
        return other;
      },
    };
    return node;
  };
  return { createElement: make, createTextNode: (s) => ({ text: String(s) }) };
}

async function withStubDom(fn) {
  const original = globalThis.document;
  globalThis.document = stubDocument();
  try { return await fn(globalThis.document); } finally {
    if (original) globalThis.document = original; else delete globalThis.document;
  }
}

test('collapseLongNotes folds a long paragraph and leaves a short one alone', async () => {
  await withStubDom(async (doc) => {
    const { collapseLongNotes } = await import('../../lib/long-note.js');
    const root = doc.createElement('div');
    const long = doc.createElement('p');
    long.setAttribute('class', 'muted');
    long.textContent = LONG;
    root.appendChild(long);
    const short = doc.createElement('p');
    short.setAttribute('class', 'muted');
    short.textContent = 'Enter the age and the reserve marker.';
    root.appendChild(short);

    assert.equal(collapseLongNotes(root), 1);
    assert.ok(long.textContent.endsWith('into four groups.'));
    const details = root.children[1];
    assert.equal(details.tagName, 'DETAILS');
    assert.equal(details.children[0].textContent, 'More detail');
    assert.ok(details.children[1].textContent.startsWith('Only groups 1 and 2'));
    assert.equal(root.children[2], short);
    assert.equal(short.textContent, 'Enter the age and the reserve marker.');
  });
});

test('collapseLongNotes ignores paragraphs that are not explanation notes', async () => {
  await withStubDom(async (doc) => {
    const { collapseLongNotes } = await import('../../lib/long-note.js');
    const root = doc.createElement('div');
    const notMuted = doc.createElement('p');
    notMuted.textContent = LONG;
    root.appendChild(notMuted);
    assert.equal(collapseLongNotes(root), 0);
    assert.equal(root.children.length, 1);
  });
});

// The lede on a pre-rendered tool page. It used to be cut at a character
// budget and then have a period appended, which produced a sentence that
// simply stopped -- "wound type (clean and minor vs." -- and read as finished.
// splitLead is what fixed it: the lede is now the author's own first sentence.
test('splitLead ends a lede where the author ended the sentence', () => {
  const summary = "Cross-reference the CDC's tetanus prophylaxis decision matrix: wound type (clean and minor vs. all other wounds) by immunization history. The tile returns the recommended action.";
  const { lead } = splitLead(summary);
  // "vs." is an abbreviation, not a sentence end, so the lede does not stop there.
  assert.ok(!lead.endsWith('vs.'), 'lede stopped on an abbreviation');
  assert.ok(lead.endsWith('by immunization history.'));
});
