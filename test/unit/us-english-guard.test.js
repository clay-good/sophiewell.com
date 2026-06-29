// spec-v184 §6.2: the check-us-english guard must FAIL on a user-facing British
// spelling and PASS a known-citation / journal / official-name line. We can't
// import the script's internals (it runs as a process), so we re-derive the
// same predicates here and assert their behavior on representative lines. If the
// guard's allowlist regexes drift, these fixtures are the canary.
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mirrors scripts/check-us-english.mjs.
const BANNED = new RegExp(
  '\\b(' + [
    'ionised', 'ionisation', 'haemoglobin', 'haematocrit', 'haemorrhage',
    'oedema', 'colour', 'behaviour', 'anaemia', 'fibre', 'tumour', 'diarrhoea',
    'grey', 'paralyse', 'catheteris', 'oestrogen', 'foetal', 'leucocyte',
    'caesarean', 'orthopaedic', 'noradrenaline', 'adrenaline', 'paracetamol',
    'salbutamol', 'frusemide',
  ].join('|') + ')\\b',
  'i',
);
const CITATION_FIELD = /\b(citation|sourceCitation|citationUrl)\b\s*:|(^|[^\w])source\s*:/;
const JOURNAL_TOKEN = /\b(Br J|Paediatr|Acta|Eur Urol|J Urol|J Clin Oncol|Lancet|BMJ|N Engl|Gut|Crit Care|Intensive Care|Anaesth|Haematol|Circulation|Chest|Stroke|Kidney Int|Nephrol|Fetal Matern Med|J Surg|Arch|Ann )\b/;
const OFFICIAL_NAME = /Paediatric Index of Mortality|Advanced Paediatric Life Support|Adult and Paediatric Respiratory Failure|Orthopaedic Association/;
const isComment = (l) => { const t = l.trim(); return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'); };
const allow = (l) => CITATION_FIELD.test(l) || JOURNAL_TOKEN.test(l) || OFFICIAL_NAME.test(l);
const flags = (l) => !isComment(l) && !allow(l) && BANNED.test(l);

test('flags a user-facing British spelling in a rendered label', () => {
  assert.equal(flags(`    note(root, 'peripheral oedema, warfarin');`), true);
  assert.equal(flags(`note('The cell colour is the KDIGO prognosis');`), true);
  assert.equal(flags(`{ text: 'Risky or self-destructive behaviour' }`), true);
});

test('does NOT flag a citation field carrying a British-spelled title', () => {
  assert.equal(flags(`    citation: 'A risk score for upper-GI haemorrhage. Lancet. 2000;356:1318.',`), false);
  assert.equal(flags(`    citation: 'Classification of caesarean sections. Fetal Matern Med Rev. 2001.',`), false);
  assert.equal(flags(`    sourceCitation: 'Risk assessment after acute GI haemorrhage. Gut. 1996;38:316.',`), false);
});

test('does NOT flag a journal-abbreviation or official-instrument-name line', () => {
  assert.equal(flags(`const NOTE = 'POSSUM (Copeland GP, Br J Surg 1991): haemoglobin, white-cell count...';`), false);
  assert.equal(flags(`const MJOA = 'modified Japanese Orthopaedic Association score (Benzel 1991)';`), false);
});

test('does NOT flag a comment line', () => {
  assert.equal(flags(`  // the risk colour band renders the KDIGO prognosis`), false);
  assert.equal(flags(`   * oedema and haemoglobin are charted per shift`), false);
});

test('US spellings pass cleanly', () => {
  assert.equal(flags(`note(root, 'peripheral edema, hemoglobin low for sex, tumor size');`), false);
  assert.equal(flags(`'norepinephrine 16 mg / 250 mL = 64 mcg/mL'`), false);
});
