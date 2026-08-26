// spec-v802 §2: renderer for gardner-robertson — the Gardner-Robertson hearing
// classification (Clinical Scoring & Risk, Group G). Pairs with pure-tone-average, which
// produces one of its two inputs, and with koos-schwannoma.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two audiometric
// numbers plus a not-testable checkbox; the poorer of the two measures governs.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/gardner-robertson-v802.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function numberField(label, id, opts) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const inp = el('input', { id, type: 'number', autocomplete: 'off' });
  inp.setAttribute('min', String(opts.min));
  inp.setAttribute('max', String(opts.max));
  inp.setAttribute('step', '1');
  inp.setAttribute('inputmode', 'numeric');
  inp.setAttribute('placeholder', opts.placeholder);
  wrap.appendChild(inp);
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This grades an audiogram already performed. It says nothing about the cause of the hearing loss or what to do about it.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'gardner-robertson'(root) {
    note(root, 'Five classes from two audiometric numbers. When the pure tone average and the speech discrimination fall in different classes, the POORER one governs, which is why serviceable hearing needs 50 dB or better AND 50 percent or better, both rather than either. Classes I and II are serviceable.');
    root.appendChild(numberField('Pure tone average (dB)', 'gr-pta', { min: 0, max: 130, placeholder: 'e.g. 45' }));
    root.appendChild(numberField('Speech discrimination score (%)', 'gr-sds', { min: 0, max: 100, placeholder: 'e.g. 80' }));
    root.appendChild(checkField('Hearing not testable', 'gr-nt'));
    const ids = ['gr-pta', 'gr-sds', 'gr-nt'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.gardnerRobertson({
        pta: val('gr-pta'),
        sds: val('gr-sds'),
        notTestable: checked('gr-nt'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: `${r.grade} (${r.className})` },
        { label: 'Serviceable', value: r.serviceable ? 'yes' : 'no' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
