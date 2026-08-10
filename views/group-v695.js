// spec-v695 §2: renderer for manning-ibs — the Manning Criteria for IBS (Clinical Scoring
// & Risk, Group G). Companion to the Rome IV IBS tile.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six checkboxes;
// a count 0-6 maps to an IBS-likelihood band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/manning-ibs-v695.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Manning criteria apply only when alarm features are absent (weight loss, bleeding, anemia, onset after ~50, nocturnal symptoms, or a family history of colorectal cancer or IBD warrant investigation first). It supports rather than replaces clinical judgment and does not by itself exclude organic disease.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'manning-ibs'(root) {
    note(root, 'Manning Criteria (Manning 1978): count six symptoms of irritable bowel syndrome. Meeting ≥ 3 of 6 supports IBS, provided alarm features are absent.');
    root.appendChild(checkField('Onset of pain linked to more frequent bowel movements', 'manning-freq'));
    root.appendChild(checkField('Looser stools associated with the onset of pain', 'manning-loose'));
    root.appendChild(checkField('Pain relieved by passage of stool', 'manning-relief'));
    root.appendChild(checkField('Noticeable abdominal bloating (distension)', 'manning-bloat'));
    root.appendChild(checkField('Sensation of incomplete evacuation more than 25% of the time', 'manning-incomplete'));
    root.appendChild(checkField('Passage of mucus with stool more than 25% of the time', 'manning-mucus'));
    const ids = ['manning-freq', 'manning-loose', 'manning-relief', 'manning-bloat', 'manning-incomplete', 'manning-mucus'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.manningIbs({
        painFrequentBm: checked('manning-freq'), painLooserStool: checked('manning-loose'), painRelievedByStool: checked('manning-relief'),
        bloating: checked('manning-bloat'), incompleteEvac: checked('manning-incomplete'), mucus: checked('manning-mucus'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Criteria', value: `${r.score}/6` },
      ]);
      note(o, r.factors.length ? `Present: ${r.factors.join(', ')}.` : 'No criteria present.');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
