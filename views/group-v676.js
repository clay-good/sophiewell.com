// spec-v676 §2: renderer for lund-kennedy — the Lund-Kennedy endoscopic score for
// chronic rhinosinusitis (Clinical Scoring & Risk, Group G). Endoscopic companion to
// the built SNOT-22 (symptoms) and Lund-Mackay (CT) sinus tiles.
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six required
// 0-2 selects (polyps/edema/discharge × left/right) plus four optional post-op selects
// (scarring/crusting × left/right); reports the modified (0-12) and original (0-20) totals.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lund-kennedy-v676.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The modified score (polyps + edema + discharge, 0–12) is the reliable general-use version; scarring and crusting are post-operative findings and are optional. There is no validated severity cutoff — the score grades appearance and tracks change over time, and supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const OPT_CHOICE = (pairs) => [{ value: '', text: '— not assessed (0) —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const POLYP = [['0', '0 — absent'], ['1', '1 — confined to middle meatus'], ['2', '2 — beyond middle meatus']];
const EDEMA = [['0', '0 — absent'], ['1', '1 — mild'], ['2', '2 — severe']];
const DISCHARGE = [['0', '0 — none'], ['1', '1 — clear / thin'], ['2', '2 — thick / purulent']];
const SEV = [['0', '0 — absent'], ['1', '1 — mild'], ['2', '2 — severe']];

export const renderers = {
  'lund-kennedy'(root) {
    note(root, 'Lund-Kennedy endoscopic score (Lund-Kennedy 1997; modified Psaltis 2014): score each side 0–2 on polyps, edema, and discharge (modified total 0–12). Scarring and crusting are optional post-op findings that extend the original total to 0–20. Higher is worse. Companion tiles: snot22, lund-mackay.');
    root.appendChild(selectField('Polyps — left', 'lk-pol-l', CHOICE(POLYP)));
    root.appendChild(selectField('Polyps — right', 'lk-pol-r', CHOICE(POLYP)));
    root.appendChild(selectField('Edema — left', 'lk-ede-l', CHOICE(EDEMA)));
    root.appendChild(selectField('Edema — right', 'lk-ede-r', CHOICE(EDEMA)));
    root.appendChild(selectField('Discharge — left', 'lk-dis-l', CHOICE(DISCHARGE)));
    root.appendChild(selectField('Discharge — right', 'lk-dis-r', CHOICE(DISCHARGE)));
    root.appendChild(selectField('Scarring — left (post-op, optional)', 'lk-sca-l', OPT_CHOICE(SEV)));
    root.appendChild(selectField('Scarring — right (post-op, optional)', 'lk-sca-r', OPT_CHOICE(SEV)));
    root.appendChild(selectField('Crusting — left (post-op, optional)', 'lk-cru-l', OPT_CHOICE(SEV)));
    root.appendChild(selectField('Crusting — right (post-op, optional)', 'lk-cru-r', OPT_CHOICE(SEV)));
    const ids = ['lk-pol-l', 'lk-pol-r', 'lk-ede-l', 'lk-ede-r', 'lk-dis-l', 'lk-dis-r', 'lk-sca-l', 'lk-sca-r', 'lk-cru-l', 'lk-cru-r'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.lundKennedy({
        polL: val('lk-pol-l'), polR: val('lk-pol-r'),
        edeL: val('lk-ede-l'), edeR: val('lk-ede-r'),
        disL: val('lk-dis-l'), disR: val('lk-dis-r'),
        scaL: val('lk-sca-l'), scaR: val('lk-sca-r'),
        cruL: val('lk-cru-l'), cruR: val('lk-cru-r'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Modified', value: `${r.modifiedTotal}/12` },
        { label: 'Original', value: `${r.originalTotal}/20` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
