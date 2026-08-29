// spec-v862 §2: renderer for mchat-rf — the M-CHAT-R/F toddler autism screen (Clinical Scoring
// & Risk, Group G).
//
// Items are named by topic, never by the instrument's own wording. Scoring is positional, so a
// relabel can never change a total.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/mchat-v862.js';
import { resultRow } from '../lib/result-copy.js';

const ANSWERS = [['', 'Not answered'], ['yes', 'Yes'], ['no', 'No']];

function selField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const sel = el('select', { id });
  for (const [value, text] of options) sel.appendChild(el('option', { value, text }));
  wrap.appendChild(sel);
  root.appendChild(wrap);
}
function numField(root, label, id, attrs) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', Object.assign({ id, type: 'number', inputmode: 'numeric' }, attrs || {})));
  root.appendChild(wrap);
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

export const renderers = {
  'mchat-rf'(root) {
    note(root, 'A total of 3 to 7 is an instruction to administer the Follow-Up, not a referral and not a pass. At 8 or more the Follow-Up is bypassed and the referral is made now.');

    root.appendChild(el('h2', { text: 'The child' }));
    numField(root, 'Age (months)', 'mc-age', { min: '0', max: '240', step: '1' });

    root.appendChild(el('h2', { text: 'The twenty items' }));
    for (const item of M.ITEMS) {
      selField(root, `${item.n}. ${item.topic}${item.reverse ? ' (reverse-scored)' : ''}`, `mc-i${item.n}`, ANSWERS);
    }

    root.appendChild(el('h2', { text: 'Follow-Up, if it has been administered' }));
    numField(root, 'Follow-Up score', 'mc-followup', { min: '0', max: '20', step: '1' });

    const ids = ['mc-age', 'mc-followup'].concat(M.ITEMS.map((i) => `mc-i${i.n}`));
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = { ageMonths: val('mc-age'), followUp: val('mc-followup') };
      for (const item of M.ITEMS) args[`item${item.n}`] = val(`mc-i${item.n}`);
      const r = M.mchatScore(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }]);
      if (r.mediumNote) note(o, r.mediumNote);
      if (r.bypassNote) note(o, r.bypassNote);
      if (r.unansweredNote) note(o, r.unansweredNote);
      note(o, r.reverseNote);
      if (r.ageNote) note(o, r.ageNote);
      if (r.negativeNote) note(o, r.negativeNote);
      note(o, r.scopeNote);
      note(o, r.detail);
      note(o, r.note);
    }));

    root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. This scores a screening instrument. It does not diagnose autism, and no total it produces replaces a diagnostic evaluation.' }));
  },
};
