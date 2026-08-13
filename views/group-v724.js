// spec-v724 §2: renderer for miller-gingival-recession — the Miller classification of
// gingival recession (Clinical Scoring & Risk, Group G). Dentistry vein.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. An interdental-loss
// select and (for no loss) a recession-extent select; decision logic returns the Miller class.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/miller-gingival-recession-v724.js';
import { resultRow } from '../lib/result-copy.js';

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
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Miller class predicts the achievable root coverage to guide the surgical plan; it does not prescribe a technique. It supports rather than replaces the periodontal assessment and clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const LOSS = [
  ['none', 'No interdental bone / soft-tissue loss'],
  ['coronal', 'Interdental loss, but coronal to the recession apex'],
  ['apical', 'Interdental bone loss apical to the recession'],
];
const EXTENT = [
  ['not-to-mgj', 'Recession does NOT reach the mucogingival junction'],
  ['to-or-beyond-mgj', 'Recession reaches or passes the mucogingival junction'],
];

export const renderers = {
  'miller-gingival-recession'(root) {
    note(root, 'Miller classification (Miller 1985): predicts achievable root coverage. Class I recession not to the MGJ; Class II to/beyond the MGJ (both 100% coverage, no interdental loss); Class III interdental loss coronal to recession (partial); Class IV interdental loss apical to recession (none).');
    root.appendChild(selectField('Interdental bone / soft-tissue loss', 'miller-loss', CHOICE(LOSS)));
    root.appendChild(selectField('Recession extent (only when there is no interdental loss)', 'miller-extent', CHOICE(EXTENT)));
    const ids = ['miller-loss', 'miller-extent'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.millerGingivalRecession({ interdentalLoss: val('miller-loss'), recessionExtent: val('miller-extent') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Class', value: r.millerClass },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
