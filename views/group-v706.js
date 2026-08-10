// spec-v706 §2: renderer for leeds-enthesitis-index — the Leeds Enthesitis Index (Clinical
// Scoring & Risk, Group G). Companion to the built MASES enthesitis index.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six checkboxes
// (one per enthesis site); a count 0-6 gives the index.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/leeds-enthesitis-index-v706.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The LEI assesses only these six enthesis sites and has no severity cut-points; it supports rather than replaces the full rheumatologic assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'leeds-enthesitis-index'(root) {
    note(root, 'Leeds Enthesitis Index (Healy 2008): count tender entheses at six sites (bilateral lateral epicondyle, medial femoral condyle, and Achilles insertion), each 0 or 1. Total 0–6, used mainly in psoriatic arthritis to gauge burden and track change.');
    root.appendChild(checkField('Left lateral epicondyle of the humerus — tender', 'lei-le'));
    root.appendChild(checkField('Right lateral epicondyle of the humerus — tender', 'lei-re'));
    root.appendChild(checkField('Left medial femoral condyle — tender', 'lei-lf'));
    root.appendChild(checkField('Right medial femoral condyle — tender', 'lei-rf'));
    root.appendChild(checkField('Left Achilles tendon insertion — tender', 'lei-la'));
    root.appendChild(checkField('Right Achilles tendon insertion — tender', 'lei-ra'));
    const ids = ['lei-le', 'lei-re', 'lei-lf', 'lei-rf', 'lei-la', 'lei-ra'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.leedsEnthesitisIndex({
        leftEpicondyle: checked('lei-le'), rightEpicondyle: checked('lei-re'), leftFemoralCondyle: checked('lei-lf'),
        rightFemoralCondyle: checked('lei-rf'), leftAchilles: checked('lei-la'), rightAchilles: checked('lei-ra'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Sites', value: `${r.score}/6` },
      ]);
      note(o, r.factors.length ? `Tender: ${r.factors.join(', ')}.` : 'No tender sites.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
