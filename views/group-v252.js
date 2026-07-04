// spec-v252 §2: renderers for the orthopedic / spine radiographic ratios & scores
// — the Insall-Salvati ratio, the Torg-Pavlov ratio, the Meyerding grade, and the
// Beighton hypermobility score. Group G.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Per the
// spec-v50 §3 posture note each tile defers the diagnosis and treatment to the
// clinician and the patient (spec-v11 §5.3).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/orthospine-v252.js';
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
  'insall-salvati-ratio'(root) {
    note(root, 'Insall-Salvati ratio = patellar-tendon length / patellar-bone length. Normal 0.8-1.2; < 0.8 baja, > 1.2 alta. Near-neighbors: torg-pavlov-ratio.');
    root.appendChild(numInput('Patellar-tendon length (mm)', 'is-tendon', { min: '0' }));
    root.appendChild(numInput('Patellar-bone length (mm)', 'is-patella', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['is-tendon', 'is-patella'], () => safe(o, () => {
      render(o, M.insallSalvati({ tendon: val('is-tendon'), patella: val('is-patella') }), 'IS');
    }));
    postureNote(root);
  },
  'torg-pavlov-ratio'(root) {
    note(root, 'Torg-Pavlov ratio = sagittal canal diameter / vertebral-body diameter (lateral C-spine). <= 0.8 developmental stenosis. Near-neighbors: meyerding-spondylolisthesis.');
    root.appendChild(numInput('Spinal-canal sagittal diameter (mm)', 'tp-canal', { min: '0' }));
    root.appendChild(numInput('Vertebral-body sagittal diameter (mm)', 'tp-body', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['tp-canal', 'tp-body'], () => safe(o, () => {
      render(o, M.torgPavlov({ canal: val('tp-canal'), body: val('tp-body') }), 'TP');
    }));
    postureNote(root);
  },
  'meyerding-spondylolisthesis'(root) {
    note(root, 'Meyerding grade: % anterior slip = displacement / caudal-endplate width x 100. I 1-25%, II 26-50%, III 51-75%, IV 76-100%, V > 100%. Near-neighbors: torg-pavlov-ratio.');
    root.appendChild(numInput('Anterior displacement (mm)', 'my-disp', { min: '0' }));
    root.appendChild(numInput('Caudal-endplate AP width (mm)', 'my-width', { min: '0' }));
    const o = out(); root.appendChild(o);
    wire(['my-disp', 'my-width'], () => safe(o, () => {
      render(o, M.meyerdingSpondylolisthesis({ displacement: val('my-disp'), width: val('my-width') }), 'Grade');
    }));
    postureNote(root);
  },
  'beighton-hypermobility'(root) {
    note(root, 'Beighton score (1973): 9 manoeuvres, >= 5 in adults suggests generalized joint hypermobility. Near-neighbors: insall-salvati-ratio.');
    const items = [['bg-f5r', 'finger5R', 'Right 5th finger dorsiflexes > 90 deg'], ['bg-f5l', 'finger5L', 'Left 5th finger dorsiflexes > 90 deg'], ['bg-thr', 'thumbR', 'Right thumb to forearm'], ['bg-thl', 'thumbL', 'Left thumb to forearm'], ['bg-elr', 'elbowR', 'Right elbow hyperextends > 10 deg'], ['bg-ell', 'elbowL', 'Left elbow hyperextends > 10 deg'], ['bg-knr', 'kneeR', 'Right knee hyperextends > 10 deg'], ['bg-knl', 'kneeL', 'Left knee hyperextends > 10 deg'], ['bg-palm', 'palms', 'Palms flat on floor, knees straight']];
    for (const [id, , label] of items) root.appendChild(check(label, id));
    const o = out(); root.appendChild(o);
    wire(items.map((i) => i[0]), () => safe(o, () => {
      const inp = {}; for (const [id, key] of items) inp[key] = chk(id);
      render(o, M.beightonHypermobility(inp), 'Beighton');
    }));
    postureNote(root);
  },
};
