// spec-v1442: renderer for kyoto-gastritis (Clinical Scoring & Risk, Group G).
//
// Each select is written as `'dom-id', CONST` so scripts/lib/option-labels.mjs, which reads views
// statically, resolves the option text for the tool page.

import { el, clear } from '../lib/dom.js';
import * as KY from '../lib/kyoto-gastritis-v1442.js';
import { resultRow } from '../lib/result-copy.js';

function selectField(root, label, id, options, blankText) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  sel.appendChild(el('option', { value: '', text: blankText }));
  for (const o of options) sel.appendChild(el('option', { value: o.value, text: o.text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const NA = '-- not recorded --';

export const renderers = {
  'kyoto-gastritis'(root) {
    note(root, 'From the endoscopic findings. Choose every finding.');
    selectField(root, 'Atrophy (Kimura-Takemoto extent)', 'kyo-atrophy', KY.KYOTO_ATROPHY, NA);
    selectField(root, 'Intestinal metaplasia', 'kyo-im', KY.KYOTO_IM, NA);
    selectField(root, 'Enlarged folds', 'kyo-folds', KY.KYOTO_YES_NO, NA);
    selectField(root, 'Nodularity', 'kyo-nodularity', KY.KYOTO_YES_NO, NA);
    selectField(root, 'Diffuse redness', 'kyo-redness', KY.KYOTO_REDNESS, NA);
    const ids = ['kyo-atrophy', 'kyo-im', 'kyo-folds', 'kyo-nodularity', 'kyo-redness'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = KY.kyotoGastritis({ atrophy: val('kyo-atrophy'), im: val('kyo-im'), folds: val('kyo-folds'), nodularity: val('kyo-nodularity'), redness: val('kyo-redness') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Kyoto score', value: r.bandLabel },
      ]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
