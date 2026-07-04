// spec-v253 §2: renderers for the radiologic measurements & scores — NASCET carotid
// stenosis, the Helsinki CT score, the Genant grade, and testicular volume. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/radmeasure-v253.js';
import { resultRow } from '../lib/result-copy.js';

function check(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('input', { id, type: 'checkbox' }));
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numInput(label, id, attrs = {}) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: 'any', inputmode: 'decimal', ...attrs }));
  return wrap;
}
function select(label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const [value, text] of options) s.appendChild(el('option', { value, text }));
  wrap.appendChild(s);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The result is the cited source’s, computed from the inputs you enter. The diagnosis and treatment stay with the clinician and the patient.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}
function render(o, r, valueLabel) {
  if (!r.valid) { note(o, r.message || 'Complete the fields.'); return; }
  resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: valueLabel, value: `${r.score}` }]);
  note(o, r.detail); note(o, r.note);
}

export const renderers = {
  'nascet-carotid-stenosis'(root) {
    note(root, 'NASCET % stenosis = (1 - narrowest lumen / distal ICA) x 100. < 50 mild, 50-69 moderate, >= 70 severe. Near-neighbors: abcd2.');
    root.appendChild(numInput('Narrowest residual lumen (mm)', 'ns-narrow', { min: '0' }));
    root.appendChild(numInput('Normal distal ICA diameter (mm)', 'ns-distal', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['ns-narrow', 'ns-distal'], () => safe(o, () => {
      render(o, M.nascetCarotidStenosis({ narrowest: val('ns-narrow'), distal: val('ns-distal') }), 'Stenosis');
    }));
    postureNote(root);
  },
  'helsinki-ct-score'(root) {
    note(root, 'Helsinki CT score (Raj 2014): mass type + volume + IVH + suprasellar cisterns, -3 to +14. Higher = worse TBI outcome. Near-neighbors: rotterdam-ct, marshall-ct.');
    root.appendChild(select('Mass lesion type', 'hel-mass', [['0', 'None (0)'], ['2', 'Subdural hematoma (+2)'], ['2', 'Intracerebral hematoma (+2)'], ['-3', 'Epidural hematoma (-3)']]));
    root.appendChild(check('Mass lesion volume > 25 mL (+2)', 'hel-size'));
    root.appendChild(check('Intraventricular hemorrhage (+3)', 'hel-ivh'));
    root.appendChild(select('Suprasellar cisterns', 'hel-cist', [['0', 'Normal (0)'], ['1', 'Compressed (+1)'], ['5', 'Obliterated (+5)']]));
    const o = out(); root.appendChild(o);
    wire(['hel-mass', 'hel-size', 'hel-ivh', 'hel-cist'], () => safe(o, () => {
      render(o, M.helsinkiCtScore({ massType: val('hel-mass'), largeMass: chk('hel-size'), ivh: chk('hel-ivh'), cisterns: val('hel-cist') }), 'Helsinki');
    }));
    postureNote(root);
  },
  'genant-vertebral-fracture'(root) {
    note(root, 'Genant grade by vertebral height loss: 0 < 20%, 1 (mild) 20-25%, 2 (moderate) 26-40%, 3 (severe) > 40%. Near-neighbors: osteoporosis-prescreen.');
    root.appendChild(numInput('Vertebral height loss (%)', 'ge-loss', { min: '0', max: '100' }));
    const o = out(); root.appendChild(o);
    wire(['ge-loss'], () => safe(o, () => {
      render(o, M.genantVertebralFracture({ heightLoss: val('ge-loss') }), 'Genant');
    }));
    postureNote(root);
  },
  'testicular-volume'(root) {
    note(root, 'Testicular volume (Lambert) = L x W x H x 0.71 (cm). Normal adult ~12-30 mL. Near-neighbors: twist-score.');
    root.appendChild(numInput('Length (cm)', 'tv-l', { min: '0' }));
    root.appendChild(numInput('Width (cm)', 'tv-w', { min: '0' }));
    root.appendChild(numInput('Height (cm)', 'tv-h', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['tv-l', 'tv-w', 'tv-h'], () => safe(o, () => {
      render(o, M.testicularVolume({ length: val('tv-l'), width: val('tv-w'), height: val('tv-h') }), 'Volume');
    }));
    postureNote(root);
  },
};
