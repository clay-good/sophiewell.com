// spec-v662 §2: renderer for push-tool — the PUSH tool 3.0 (Pressure Ulcer Scale for
// Healing) (Clinical Scoring & Risk, Group G). A trend companion to the built pressure-
// ulcer risk tools (braden, norton, waterlow, bates-jensen).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Two number
// inputs (length, width) give the area subscore; two selects give exudate and tissue.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/push-tool-v662.js';
import { resultRow } from '../lib/result-copy.js';

function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', step: 'any', inputmode: 'decimal' }));
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
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. PUSH is a monitoring instrument — the meaningful output is the score trended over serial assessments, not a single-visit interpretation. It is read with the full wound assessment by the care team.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const EXUDATE_OPTS = [['0', '0 — none'], ['1', '1 — light'], ['2', '2 — moderate'], ['3', '3 — heavy']];
const TISSUE_OPTS = [['0', '0 — closed'], ['1', '1 — epithelial'], ['2', '2 — granulation'], ['3', '3 — slough'], ['4', '4 — necrotic']];

export const renderers = {
  'push-tool'(root) {
    note(root, 'PUSH tool 3.0 (Pressure Ulcer Scale for Healing, NPUAP): surface area (length x width, scored 0-10 by category) + exudate (0-3) + tissue type (0-4, worst present), total 0-17. A decreasing total over time indicates healing. Companion tiles: braden, norton, bates-jensen.');
    root.appendChild(numberField('Wound length (cm)', 'push-length'));
    root.appendChild(numberField('Wound width (cm)', 'push-width'));
    root.appendChild(selectField('Exudate amount', 'push-exudate', CHOICE(EXUDATE_OPTS)));
    root.appendChild(selectField('Tissue type (worst present)', 'push-tissue', CHOICE(TISSUE_OPTS)));
    const ids = ['push-length', 'push-width', 'push-exudate', 'push-tissue'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.pushTool({ length: val('push-length'), width: val('push-width'), exudate: val('push-exudate'), tissue: val('push-tissue') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/17` },
        { label: 'Area', value: `${r.area} cm2 (${r.areaScore})` },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
