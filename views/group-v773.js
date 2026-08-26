// spec-v773 §2: renderer for cts6 — the six-item clinical diagnostic score for
// carpal tunnel syndrome (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six
// checkboxes; a weighted sum 0-26 maps to a likelihood band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cts6-v773.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. CTS-6 estimates the probability of a clinical diagnosis of carpal tunnel syndrome. It is not a nerve conduction study, not a severity grade, and not an order for splinting, injection or surgery.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  cts6(root) {
    note(root, 'CTS-6 (Graham 2006): six weighted clinical findings summed to a maximum of 26. Above 12 is roughly an 80 percent probability of carpal tunnel syndrome; above 5 is roughly 25 percent.');
    root.appendChild(checkField('Numbness mainly or only in the median nerve territory (3.5)', 'cts6-median'));
    root.appendChild(checkField('Numbness at night (4)', 'cts6-night'));
    root.appendChild(checkField('Thenar atrophy or weakness (5)', 'cts6-thenar'));
    root.appendChild(checkField('Positive Phalen test (5)', 'cts6-phalen'));
    root.appendChild(checkField('Loss of 2-point discrimination in the median territory (4.5)', 'cts6-twopoint'));
    root.appendChild(checkField('Positive Tinel sign (4)', 'cts6-tinel'));
    const ids = ['cts6-median', 'cts6-night', 'cts6-thenar', 'cts6-phalen', 'cts6-twopoint', 'cts6-tinel'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.cts6({
        medianNumbness: checked('cts6-median'),
        nocturnalNumbness: checked('cts6-night'),
        thenarAtrophy: checked('cts6-thenar'),
        phalen: checked('cts6-phalen'),
        twoPointLoss: checked('cts6-twopoint'),
        tinel: checked('cts6-tinel'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: r.bandLabel.replace('CTS-6 ', '') },
        { label: 'Probability', value: r.probability },
      ]);
      note(o, r.factors.length ? `Findings present: ${r.factors.join(', ')}.` : 'No findings selected (score 0).');
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
