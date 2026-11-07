// spec-v1701: cyp-list-check against the shipped table (data/fda-ddi-examples), with `now` pinned inside its
// check window. Every vector is from the change's design.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cypListCheck as check, normalize } from '../../lib/cyp-list-check-v1701.js';
import { fdaDdiFromDisk } from '../../mcp/fda-ddi-disk.js';

const db = fdaDdiFromDisk();
// Inside the shipped manifest's check window, whatever week this runs in.
const now = new Date(`${db.manifest.fetchedAt}T12:00:00Z`);

test('clarithromycin and simvastatin: one CYP3A pair, strong inhibitor with sensitive substrate', () => {
  const r = check({ drugs: 'clarithromycin\nsimvastatin' }, db, now);
  assert.equal(r.pairs.length, 1);
  assert.deepEqual(r.pairs[0], { precipitant: 'clarithromycin', strength: 'strong inhibitor', substrate: 'simvastatin', sensitivity: 'sensitive substrate', enzyme: 'CYP3A' });
  assert.ok(r.notes.at(-1).includes('a guide and not considered a comprehensive list'));
});

test('strengths, salts and dose forms are ignored', () => {
  assert.equal(normalize('Clarithromycin 500 mg tablet'), 'clarithromycin');
  assert.equal(normalize('diltiazem hydrochloride ER 240 mg capsule'), 'diltiazem');
  assert.equal(check({ drugs: 'Clarithromycin 500 mg tablet\nSimvastatin 40 mg' }, db, now).pairs.length, 1);
});

test('lopinavir alone matches the lopinavir and ritonavir row and says so', () => {
  const r = check({ drugs: 'lopinavir' }, db, now);
  assert.ok(r.notes.some((n) => n.startsWith('lopinavir: in FDA\'s combination row "lopinavir and ritonavir"')));
});

test('an unlisted drug reads "not on this edition", never "no interaction"', () => {
  const r = check({ drugs: 'notadrugatall' }, db, now);
  assert.equal(r.found, 0);
  assert.ok(r.notes.some((n) => n.startsWith('notadrugatall: not on this edition of FDA\'s examples') && n.includes('not a finding of no interaction')));
});

test('a drug is never paired with itself, and footnotes print with their drug', () => {
  const r = check({ drugs: 'aprepitant' }, db, now);
  assert.equal(r.pairs.length, 0, 'aprepitant is a CYP3A inhibitor and a CYP3A substrate, but not its own pair');
  const c = check({ drugs: 'ciprofloxacin\ntizanidine' }, db, now);
  assert.ok(c.notes.some((n) => n.startsWith('FDA footnote 20: Ciprofloxacin')));
});

test('past its check date the tool does not answer; a missing table and an empty list are refused', () => {
  const later = new Date(`${db.manifest.expiresOn}T12:00:00Z`);
  later.setUTCDate(later.getUTCDate() + 1);
  assert.match(check({ drugs: 'clarithromycin' }, db, later).message, /past its check date/);
  assert.match(check({ drugs: 'clarithromycin' }, null, now).message, /did not load/);
  assert.match(check({ drugs: '' }, db, now).message, /^Enter the medications/);
});
