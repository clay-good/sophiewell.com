// spec-v107 §2: renderers for the four ED decision-rule / resuscitation tiles
// (hear, new-orleans-head, go-far, macocha). The second Wave-2 renderer module of
// the spec-v100 program. All in Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. hear,
// go-far, and macocha sum weighted items; new-orleans-head applies an any-positive
// rule. Each tile renders the spec-v50 §3 clinical posture note and frames its
// output as the cited rule's verdict / score / band -- none authors a CT order, an
// intubation plan, or a code-status recommendation in Sophie's voice (spec-v11
// §5.3); the image / airway / goals-of-care decision stays with the clinician.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/eddecision-v107.js';
import { resultRow } from '../lib/result-copy.js';

function field(label, id, opts = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('step', opts.step || '1');
  inp.setAttribute('inputmode', opts.step && opts.step !== '1' ? 'decimal' : 'numeric');
  if (opts.min != null) inp.setAttribute('min', String(opts.min));
  if (opts.max != null) inp.setAttribute('max', String(opts.max));
  if (opts.placeholder) inp.setAttribute('placeholder', opts.placeholder);
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
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function optNum(id) { const n = document.getElementById(id); return n && n.value !== '' ? Number(n.value) : null; }
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) {
  clear(o);
  try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); }
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The verdict, score, and probability band are the cited rule’s, computed from the inputs you entered; they estimate, not guarantee, an outcome. The imaging, airway, and goals-of-care decisions stay with the clinician and local protocol.' }));
}
function derivation(root, caption, terms) {
  if (!terms || !terms.length) return;
  root.appendChild(el('p', { class: 'muted', text: caption }));
  root.appendChild(el('ul', {}, terms.map((t) => {
    const v = typeof t.value === 'number' && Number.isFinite(t.value)
      ? (t.value >= 0 ? `+${t.value}` : String(t.value))
      : '--';
    return el('li', { class: 'muted', text: `${t.label}: ${v}` });
  })));
}
function wire(ids, run) {
  for (const id of ids) {
    const n = document.getElementById(id);
    if (n) { n.addEventListener('input', run); n.addEventListener('change', run); }
  }
  run();
}

export const renderers = {
  // ----- 2.1 hear -------------------------------------------------------
  hear(root) {
    root.appendChild(selectField('History', 'hr-hist', [
      { value: 'h0', text: 'Slightly suspicious -- 0' },
      { value: 'h1', text: 'Moderately suspicious -- 1' },
      { value: 'h2', text: 'Highly suspicious -- 2' },
    ]));
    root.appendChild(selectField('ECG', 'hr-ecg', [
      { value: 'e0', text: 'Normal -- 0' },
      { value: 'e1', text: 'Non-specific repolarization disturbance -- 1' },
      { value: 'e2', text: 'Significant ST deviation -- 2' },
    ]));
    root.appendChild(field('Age (years)', 'hr-age', { min: 0, max: 120, placeholder: '58' }));
    root.appendChild(selectField('Risk factors', 'hr-risk', [
      { value: 'r0', text: 'None -- 0' },
      { value: 'r1', text: '1-2 risk factors -- 1' },
      { value: 'r2', text: '>= 3 risk factors or known atherosclerotic disease -- 2' },
    ]));
    const o = out(); root.appendChild(o);
    wire(['hr-hist', 'hr-ecg', 'hr-age', 'hr-risk'], () => safe(o, () => {
      const r = M.hear({ history: selVal('hr-hist'), ecg: selVal('hr-ecg'), age: optNum('hr-age'), risk: selVal('hr-risk') });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'HEAR score', value: String(r.total) },
        { label: 'Very low risk', value: r.veryLow ? 'yes' : 'no' },
      ]);
      derivation(o, 'Scored domains (total 0-8):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.2 new-orleans-head -------------------------------------------
  'new-orleans-head'(root) {
    note(root, 'Entry condition: minor blunt head injury with GCS 15 and a normal brief neurologic exam.');
    const items = [
      ['Headache', 'no-head'],
      ['Vomiting', 'no-vomit'],
      ['Age > 60 years', 'no-age'],
      ['Drug or alcohol intoxication', 'no-intox'],
      ['Persistent anterograde amnesia (short-term memory deficit)', 'no-amnesia'],
      ['Physical evidence of trauma above the clavicles', 'no-trauma'],
      ['Seizure', 'no-seizure'],
    ];
    for (const [label, id] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map(([, id]) => id);
    wire(ids, () => safe(o, () => {
      const r = M.newOrleansHead({
        headache: chk('no-head'), vomiting: chk('no-vomit'), ageOver60: chk('no-age'),
        intoxication: chk('no-intox'), amnesia: chk('no-amnesia'),
        traumaAboveClavicle: chk('no-trauma'), seizure: chk('no-seizure'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Positive criteria', value: String(r.positive) },
        { label: 'CT', value: r.ctIndicated ? 'indicated' : 'not indicated' },
      ]);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.3 go-far -----------------------------------------------------
  'go-far'(root) {
    root.appendChild(field('Age (years)', 'gf-age', { min: 0, max: 120, placeholder: '72' }));
    root.appendChild(checkField('Neurologically intact or minimal deficit at admission (-15)', 'gf-neuro'));
    const items = [
      ['Major trauma', 'gf-trauma'],
      ['Acute stroke', 'gf-stroke'],
      ['Metastatic or hematologic cancer', 'gf-cancer'],
      ['Septicemia', 'gf-sepsis'],
      ['Medical noncardiac diagnosis', 'gf-noncardiac'],
      ['Hepatic insufficiency', 'gf-hepatic'],
      ['Admitted from skilled-nursing facility', 'gf-snf'],
      ['Hypotension or hypoperfusion', 'gf-hypotension'],
      ['Renal insufficiency or dialysis', 'gf-renal'],
      ['Respiratory insufficiency', 'gf-resp'],
      ['Pneumonia', 'gf-pneumonia'],
    ];
    for (const [label, id] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = ['gf-age', 'gf-neuro', ...items.map(([, id]) => id)];
    wire(ids, () => safe(o, () => {
      const r = M.goFar({
        age: optNum('gf-age'), neuroIntact: chk('gf-neuro'),
        majorTrauma: chk('gf-trauma'), acuteStroke: chk('gf-stroke'), cancer: chk('gf-cancer'),
        septicemia: chk('gf-sepsis'), medicalNoncardiac: chk('gf-noncardiac'), hepatic: chk('gf-hepatic'),
        snf: chk('gf-snf'), hypotension: chk('gf-hypotension'), renal: chk('gf-renal'),
        respiratory: chk('gf-resp'), pneumonia: chk('gf-pneumonia'),
      });
      if (!r.valid) { note(o, r.band); note(o, r.note); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'GO-FAR score', value: (r.total >= 0 ? '+' : '') + r.total },
        { label: 'Category', value: r.category },
      ]);
      derivation(o, 'Scored items (total -15 to +76):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },

  // ----- 2.4 macocha ----------------------------------------------------
  macocha(root) {
    const items = [
      ['Mallampati III or IV', 'mc-mallampati'],
      ['Obstructive sleep apnea syndrome', 'mc-osa'],
      ['Reduced cervical-spine mobility', 'mc-cervical'],
      ['Limited mouth opening < 3 cm', 'mc-mouth'],
      ['Coma', 'mc-coma'],
      ['Severe hypoxemia (SpO2 < 80%)', 'mc-hypoxemia'],
      ['Non-anesthesiologist operator', 'mc-operator'],
    ];
    for (const [label, id] of items) root.appendChild(checkField(label, id));
    const o = out(); root.appendChild(o);
    const ids = items.map(([, id]) => id);
    wire(ids, () => safe(o, () => {
      const r = M.macocha({
        mallampati: chk('mc-mallampati'), osa: chk('mc-osa'), cervical: chk('mc-cervical'),
        mouthOpening: chk('mc-mouth'), coma: chk('mc-coma'), hypoxemia: chk('mc-hypoxemia'),
        nonAnesthesiologist: chk('mc-operator'),
      });
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'MACOCHA score', value: String(r.total) },
        { label: 'Risk', value: r.elevated ? 'elevated' : 'lower' },
      ]);
      derivation(o, 'Scored items (total 0-12):', r.terms);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
