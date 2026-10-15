// spec-v1636 tool 18: a cumulative antibiogram by the AHRQ Antibiogram Specifications (May 2014).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { antibiogramBuilder } from '../../lib/antibiogram-builder-v1636.js';

const HEAD = 'patient,organism,date,status,purpose,Ceftriaxone,Ciprofloxacin';
const ecoli = (n, cell = () => 'S,S') => Array.from({ length: n }, (_, i) => `P${i + 1},Escherichia coli,2026-03-${String(1 + (i % 28)).padStart(2, '0')},final,diagnostic,${cell(i)}`);
const cellOf = (r, organism, agent) => r.table.find((t) => t.organism === organism && t.agent === agent);

test('percent susceptible is S over the number tested; intermediate is tested, not susceptible', () => {
  // 40 isolates: 30 S, 4 I, 6 R to ceftriaxone.
  const r = antibiogramBuilder({ isolates: [HEAD, ...ecoli(40, (i) => `${i < 30 ? 'S' : i < 34 ? 'I' : 'R'},S`)].join('\n') });
  const c = cellOf(r, 'Escherichia coli', 'Ceftriaxone');
  assert.deepEqual([c.tested, c.susceptible, c.percentSusceptible, c.caution], [40, 30, 75, false]);
  assert.deepEqual([c.ciLow, c.ciHigh], [59.8, 85.8]);
  assert.equal(r.flag, 'built');
});

test('the first isolate of a species per patient is kept, whatever the site or the profile', () => {
  const rows = [HEAD, 'A,Escherichia coli,2026-03-10,final,diagnostic,R,R', 'A,Escherichia coli,2026-03-02,final,diagnostic,S,S', 'A,escherichia  coli,2026-05-01,final,diagnostic,R,R', 'A,Klebsiella pneumoniae,2026-03-10,final,diagnostic,S,S'];
  const r = antibiogramBuilder({ isolates: rows.join('\n') });
  assert.deepEqual([r.isolates, r.duplicatesRemoved, r.organisms], [2, 2, 2]);
  // The earliest by date, not the first row.
  assert.equal(cellOf(r, 'Escherichia coli', 'Ceftriaxone').susceptible, 1);
});

test('rows that are not final, are surveillance, or fall outside the period are left out and counted', () => {
  const rows = [HEAD, 'A,Escherichia coli,2026-03-10,preliminary,diagnostic,S,S', 'B,Escherichia coli,2026-03-10,final,surveillance,S,S', 'C,Escherichia coli,2025-12-31,final,diagnostic,S,S', 'D,Escherichia coli,03/10/2026,final,diagnostic,S,S', 'E,Escherichia coli,2026-03-10,final,diagnostic,S,S'];
  const r = antibiogramBuilder({ isolates: rows.join('\n'), from: '2026-01-01', to: '2026-12-31' });
  assert.equal(r.isolates, 1);
  assert.deepEqual([r.dropped.notFinal, r.dropped.surveillance, r.dropped.outsidePeriod, r.dropped.undated], [1, 1, 1, 1]);
  assert.match(r.notes.join(' '), /Rows left out: 1 outside the period, 1 not final, 1 surveillance, 1 without a date/);
});

test('under 30 isolates is marked; under 10 says so', () => {
  const r29 = antibiogramBuilder({ isolates: [HEAD, ...ecoli(29)].join('\n') });
  assert.equal(r29.flag, 'small-samples');
  assert.match(r29.notes.join(' '), /fewer than 30 isolates: results must be interpreted with caution/);
  assert.equal(antibiogramBuilder({ isolates: [HEAD, ...ecoli(30)].join('\n') }).flag, 'built');
  assert.match(antibiogramBuilder({ isolates: [HEAD, ...ecoli(9)].join('\n') }).notes.join(' '), /fewer than 10 isolates/);
});

test('a list with no status or purpose column says what it could not check', () => {
  const r = antibiogramBuilder({ isolates: 'patient,organism,date,Ceftriaxone\nA,Escherichia coli,2026-03-10,S' });
  assert.match(r.notes.join(' '), /no status column/);
  assert.match(r.notes.join(' '), /no purpose column/);
  assert.match(r.notes.join(' '), /No period was entered/);
});

test('a cell that is not S, I or R is not counted as tested', () => {
  const r = antibiogramBuilder({ isolates: 'patient,organism,date,Ceftriaxone\nA,Escherichia coli,2026-03-10,SDD\nB,Escherichia coli,2026-03-10,S\nC,Escherichia coli,2026-03-10,' });
  assert.equal(cellOf(r, 'Escherichia coli', 'Ceftriaxone').tested, 1);
  assert.match(r.notes.join(' '), /1 result cell was not S, I or R/);
});

test('the CSV carries one row per organism and agent', () => {
  const r = antibiogramBuilder({ isolates: [HEAD, ...ecoli(3)].join('\n') });
  const lines = r.csv.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^organism,isolates,agent,tested,susceptible,percent susceptible/);
  assert.match(lines[1], /^Escherichia coli,3,Ceftriaxone,3,3,100,/);
});

test('refusals', () => {
  assert.match(antibiogramBuilder({}).message, /^Enter the isolate list/);
  assert.match(antibiogramBuilder({ isolates: 'a,b\n1,2' }).message, /^Enter a header row that names the patient column/);
  assert.match(antibiogramBuilder({ isolates: 'patient,organism,date\nA,E. coli,2026-01-01' }).message, /^Enter at least one agent column/);
  assert.match(antibiogramBuilder({ isolates: `${HEAD}\nA,Escherichia coli,2026-03-10,final,diagnostic,S,S`, from: 'March' }).message, /^Enter the first day/);
  assert.match(antibiogramBuilder({ isolates: `${HEAD}\nA,Escherichia coli,nodate,final,diagnostic,S,S` }).message, /^Enter at least one isolate/);
  assert.equal(antibiogramBuilder(null).valid, false);
});

// The AHRQ document's organism rules, re-read October 14, 2026.
test('S. aureus is reported for all isolates and again as the MRSA subset, by name or oxacillin result', () => {
  const H = 'patient,organism,date,status,purpose,Oxacillin,Vancomycin';
  const rows = [H,
    'P1,Staphylococcus aureus,2026-01-02,final,diagnostic,R,S',
    'P2,Staphylococcus aureus,2026-01-03,final,diagnostic,S,S',
    'P3,MRSA,2026-01-04,final,diagnostic,,S',
    'P3,Staphylococcus aureus,2026-02-04,final,diagnostic,R,S'];
  const r = antibiogramBuilder({ isolates: rows.join('\n') });
  // P3's later isolate is a duplicate of the same species, even though the first was written MRSA.
  assert.equal(r.duplicatesRemoved, 1);
  assert.equal(cellOf(r, 'Staphylococcus aureus', 'Vancomycin').tested, 3);
  assert.equal(cellOf(r, 'Staphylococcus aureus, MRSA subset', 'Vancomycin').tested, 2);
  assert.deepEqual(r.table.map((t) => t.organism).filter((x, i, a) => a.indexOf(x) === i), ['Staphylococcus aureus', 'Staphylococcus aureus, MRSA subset']);
  assert.match(r.notes.join(' '), /MRSA subset is reported after all Staphylococcus aureus.*2 isolates written as MRSA or resistant to Oxacillin/);
  const none = antibiogramBuilder({ isolates: ['patient,organism,date,Vancomycin', 'P1,Staphylococcus aureus,2026-01-02,S'].join('\n') });
  assert.match(none.notes.join(' '), /could not be made/);
});

test('viridans streptococci and penicillin show percent intermediate; S. pneumoniae names the breakpoint columns', () => {
  const H = 'patient,organism,date,Penicillin,Ceftriaxone';
  const r = antibiogramBuilder({ isolates: [H, 'P1,Viridans group streptococci,2026-01-02,I,S', 'P2,Viridans group streptococci,2026-01-03,S,S', 'P3,Streptococcus pneumoniae,2026-01-03,S,S'].join('\n') });
  assert.equal(cellOf(r, 'Viridans group streptococci', 'Penicillin').percentIntermediate, 50);
  assert.equal(cellOf(r, 'Viridans group streptococci', 'Ceftriaxone').percentIntermediate, undefined);
  assert.match(r.notes.join(' '), /meningitis and nonmeningitis breakpoints/);
  assert.doesNotMatch(antibiogramBuilder({ isolates: [H, 'P1,Klebsiella pneumoniae,2026-01-02,S,S'].join('\n') }).notes.join(' '), /breakpoints/);
});
