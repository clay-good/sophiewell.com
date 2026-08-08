// spec-v663 §2: renderer for lichtiger-index — the Lichtiger Index (Modified Truelove-
// Witts Severity Index) for ulcerative colitis activity (Clinical Scoring & Risk, Group
// G). Companion to the built IBD instruments (truelove-witts, mayo-uc, harvey-bradshaw).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Eight ordinal
// selects sum to 0-21; the advisory cutoffs are surfaced, not asserted as a verdict.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/lichtiger-index-v663.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The total estimates ulcerative colitis activity; the response/active/remission cutoffs come from later trials rather than the original paper and vary across sources, so they are advisory. The assessment stays with the clinician and the full picture.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const FIELDS = [
  { key: 'diarrhea', dom: 'lich-diarrhea', label: 'Diarrhea (daily stools)', opts: [['0', '0 — 0-2'], ['1', '1 — 3-4'], ['2', '2 — 5-6'], ['3', '3 — 7-9'], ['4', '4 — >= 10']] },
  { key: 'nocturnal', dom: 'lich-nocturnal', label: 'Nocturnal diarrhea', opts: [['0', '0 — no'], ['1', '1 — yes']] },
  { key: 'blood', dom: 'lich-blood', label: 'Visible blood in stool', opts: [['0', '0 — none'], ['1', '1 — < 50%'], ['2', '2 — >= 50%'], ['3', '3 — 100%']] },
  { key: 'incontinence', dom: 'lich-incontinence', label: 'Fecal incontinence', opts: [['0', '0 — no'], ['1', '1 — yes']] },
  { key: 'pain', dom: 'lich-pain', label: 'Abdominal pain / cramping', opts: [['0', '0 — none'], ['1', '1 — mild'], ['2', '2 — moderate'], ['3', '3 — severe']] },
  { key: 'wellbeing', dom: 'lich-wellbeing', label: 'General wellbeing', opts: [['0', '0 — perfect'], ['1', '1 — very good'], ['2', '2 — good'], ['3', '3 — average'], ['4', '4 — poor'], ['5', '5 — terrible']] },
  { key: 'tenderness', dom: 'lich-tenderness', label: 'Abdominal tenderness', opts: [['0', '0 — none'], ['1', '1 — mild, localized'], ['2', '2 — mild-moderate, diffuse'], ['3', '3 — severe or rebound']] },
  { key: 'antidiarrheal', dom: 'lich-antidiarrheal', label: 'Need for antidiarrheal drugs', opts: [['0', '0 — no'], ['1', '1 — yes']] },
];

export const renderers = {
  'lichtiger-index'(root) {
    note(root, 'Lichtiger Index (Modified Truelove-Witts Severity Index, Lichtiger 1994) for ulcerative colitis activity: eight items summed 0-21. Advisory cutoffs from later trials: under 10 = clinical response, 10 or more = active disease, 3 or less = remission. Companion tiles: truelove-witts, mayo-uc, harvey-bradshaw.');
    for (const f of FIELDS) root.appendChild(selectField(f.label, f.dom, CHOICE(f.opts)));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = val(f.dom);
      const r = M.lichtigerIndex(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/21` },
      ]);
      note(o, r.thresholdNote);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
