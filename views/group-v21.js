// spec-v95 §2: renderers for the six neurology outcome / grading tiles
// (mrs, gose, hoehn-yahr, spetzler-martin, house-brackmann, midas).
//
// Same input/render contract as the rest of the codebase: every input has a
// real <label for> (a11y-check passes), no innerHTML, no network, no storage.
// mrs / gose / hoehn-yahr / house-brackmann are single-grade ordinal selectors;
// spetzler-martin is a component selector with a derivation breakdown; midas is a
// five-question sum with ancillary (unscored) frequency/intensity items. Each
// tile renders the spec-v50 §3 clinical posture note and quotes the cited
// source's own band / descriptor -- none authors a management or disposition
// order in Sophie's voice (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/neuro-v95.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || 'any');
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
  if (opts.inputmode) inp.setAttribute('inputmode', opts.inputmode);
  wrap.appendChild(inp);
  return wrap;
}
function selectField(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) {
  const v = document.getElementById(id).value;
  return v === '' ? null : Number(v);
}
function selVal(id) { return document.getElementById(id).value; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not an order. The grade, band, and descriptor are the cited source’s; the outcome interpretation and any care decision stay with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

const YESNO = [
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes' },
];

export const renderers = {
  // ----- 2.1 mrs ---------------------------------------------------------
  'mrs'(root) {
    root.appendChild(selectField('Modified Rankin grade', 'mrs-grade', [
      { value: '0', text: '0 — No symptoms at all' },
      { value: '1', text: '1 — No significant disability despite symptoms' },
      { value: '2', text: '2 — Slight disability' },
      { value: '3', text: '3 — Moderate disability (walks unassisted)' },
      { value: '4', text: '4 — Moderately severe disability' },
      { value: '5', text: '5 — Severe disability (bedridden)' },
      { value: '6', text: '6 — Dead' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['mrs-grade'], () => safe(o, () => {
      const r = M.mrs({ grade: optNum('mrs-grade') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.goodOutcome ? null : 'warn' },
        { label: 'Grade (0–6)', value: String(r.grade) },
        { label: 'Outcome dichotomy', value: r.dichotomy },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 gose --------------------------------------------------------
  'gose'(root) {
    root.appendChild(selectField('GOS-E category', 'gose-cat', [
      { value: '1', text: '1 — Dead' },
      { value: '2', text: '2 — Vegetative state' },
      { value: '3', text: '3 — Lower severe disability' },
      { value: '4', text: '4 — Upper severe disability' },
      { value: '5', text: '5 — Lower moderate disability' },
      { value: '6', text: '6 — Upper moderate disability' },
      { value: '7', text: '7 — Lower good recovery' },
      { value: '8', text: '8 — Upper good recovery' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['gose-cat'], () => safe(o, () => {
      const r = M.gose({ category: optNum('gose-cat') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.gose <= 4 ? 'warn' : null },
        { label: 'GOS-E (1–8)', value: String(r.gose) },
        { label: 'Legacy GOS (1–5)', value: `${r.gos} (${r.gosLabel})` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 hoehn-yahr --------------------------------------------------
  'hoehn-yahr'(root) {
    root.appendChild(selectField('Hoehn & Yahr stage', 'hy-stage', [
      { value: '0', text: '0 — No signs of disease (modified)' },
      { value: '1', text: '1 — Unilateral involvement only' },
      { value: '1.5', text: '1.5 — Unilateral and axial (modified)' },
      { value: '2', text: '2 — Bilateral, no balance impairment' },
      { value: '2.5', text: '2.5 — Mild bilateral, recovers on pull test (modified)' },
      { value: '3', text: '3 — Mild-moderate bilateral; postural instability; independent' },
      { value: '4', text: '4 — Severe; walks/stands unaided' },
      { value: '5', text: '5 — Wheelchair-bound or bedridden unless aided' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['hy-stage'], () => safe(o, () => {
      const r = M.hoehnYahr({ stage: selVal('hy-stage') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.stage === '4' || r.stage === '5') ? 'warn' : null },
        { label: 'Stage', value: r.stage },
        { label: 'Scale variant', value: r.variant === 'modified' ? 'modified (half-step)' : 'original + modified' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 spetzler-martin --------------------------------------------
  'spetzler-martin'(root) {
    root.appendChild(selectField('Nidus size', 'sm-size', [
      { value: '1', text: '< 3 cm (1)' },
      { value: '2', text: '3–6 cm (2)' },
      { value: '3', text: '> 6 cm (3)' },
    ]));
    root.appendChild(selectField('Eloquent adjacent brain', 'sm-eloquent', YESNO));
    root.appendChild(selectField('Deep venous drainage', 'sm-deep', YESNO));
    root.appendChild(selectField('Lawton-Young: patient age', 'sm-age', [
      { value: '', text: '— (omit supplementary score)' },
      { value: '1', text: '< 20 years (1)' },
      { value: '2', text: '20–40 years (2)' },
      { value: '3', text: '> 40 years (3)' },
    ]));
    root.appendChild(selectField('Lawton-Young: unruptured presentation', 'sm-unruptured', YESNO));
    root.appendChild(selectField('Lawton-Young: diffuse nidus', 'sm-diffuse', YESNO));
    const o = out(); root.appendChild(o);
    const ids = ['sm-size', 'sm-eloquent', 'sm-deep', 'sm-age', 'sm-unruptured', 'sm-diffuse'];
    wire(ids, () => safe(o, () => {
      const r = M.spetzlerMartin({
        size: selVal('sm-size'), eloquent: selVal('sm-eloquent'), deepVenous: selVal('sm-deep'),
        ageBand: selVal('sm-age'), unruptured: selVal('sm-unruptured'), diffuse: selVal('sm-diffuse'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      const c = r.components;
      const rows = [
        { text: r.band, cls: r.core >= 4 ? 'warn' : null },
        { label: 'Spetzler-Martin grade', value: `${r.grade} (core sum ${r.core})` },
      ];
      if (r.supplementedTotal != null) {
        rows.push({ label: 'Supplemented SM–Lawton-Young total', value: String(r.supplementedTotal) });
      }
      resultRow(o, rows);
      const deriv = `Size ${c.size} + eloquent ${c.eloquent} + deep venous ${c.deepVenous} = core ${r.core}`
        + (r.supplementedTotal != null ? `; + age ${c.age} + unruptured ${c.unruptured} + diffuse ${c.diffuse} = ${r.supplementedTotal}` : '');
      o.appendChild(el('p', { class: 'muted', text: deriv }));
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.5 house-brackmann --------------------------------------------
  'house-brackmann'(root) {
    root.appendChild(selectField('House-Brackmann grade', 'hb-grade', [
      { value: '1', text: 'I — Normal' },
      { value: '2', text: 'II — Mild dysfunction' },
      { value: '3', text: 'III — Moderate dysfunction' },
      { value: '4', text: 'IV — Moderately severe dysfunction' },
      { value: '5', text: 'V — Severe dysfunction' },
      { value: '6', text: 'VI — Total paralysis' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['hb-grade'], () => safe(o, () => {
      const r = M.houseBrackmann({ grade: optNum('hb-grade') });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: r.grade >= 4 ? 'warn' : null },
        { label: 'Grade', value: r.roman },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.6 midas -------------------------------------------------------
  'midas'(root) {
    root.appendChild(field('Q1 — days of missed work or school', 'mi-q1', { placeholder: 'e.g. 2', inputmode: 'numeric' }));
    root.appendChild(field('Q2 — days work/school productivity reduced ≥ half', 'mi-q2', { placeholder: 'e.g. 4', inputmode: 'numeric' }));
    root.appendChild(field('Q3 — days of missed household work', 'mi-q3', { placeholder: 'e.g. 1', inputmode: 'numeric' }));
    root.appendChild(field('Q4 — days household productivity reduced ≥ half', 'mi-q4', { placeholder: 'e.g. 3', inputmode: 'numeric' }));
    root.appendChild(field('Q5 — days of missed family/social/leisure activity', 'mi-q5', { placeholder: 'e.g. 1', inputmode: 'numeric' }));
    root.appendChild(field('Item A — total headache days (not scored)', 'mi-freq', { placeholder: 'e.g. 10', inputmode: 'numeric' }));
    root.appendChild(field('Item B — average pain intensity 0–10 (not scored)', 'mi-int', { placeholder: 'e.g. 6', inputmode: 'numeric' }));
    const o = out(); root.appendChild(o);
    const ids = ['mi-q1', 'mi-q2', 'mi-q3', 'mi-q4', 'mi-q5', 'mi-freq', 'mi-int'];
    wire(ids, () => safe(o, () => {
      const r = M.midas({
        q1: optNum('mi-q1'), q2: optNum('mi-q2'), q3: optNum('mi-q3'),
        q4: optNum('mi-q4'), q5: optNum('mi-q5'),
        freq: optNum('mi-freq'), intensity: optNum('mi-int'),
      });
      if (!r.valid) { o.appendChild(el('p', { class: 'muted', text: r.band })); return; }
      resultRow(o, [
        { text: r.band, cls: (r.grade === 'III' || r.grade === 'IV') ? 'warn' : null },
        { label: 'MIDAS score', value: String(r.total) },
        { label: 'Grade', value: `${r.grade} (${r.bandLabel})` },
        { label: 'Ancillary (headache days / intensity)', value: `${r.freq} days / ${r.intensity == null ? 'not entered' : r.intensity}` },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
