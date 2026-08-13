// spec-v728 §2: renderer for hhie-s — the Hearing Handicap Inventory for the Elderly,
// Screening (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Ten No/Sometimes/Yes
// selects; the sum 0-40 maps to a hearing-handicap band. Neutral item-topic labels (the item
// wording is copyrighted).

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/hhie-s-v728.js';
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
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The HHIE-S screens self-perceived hearing handicap; it is not an audiogram or a diagnosis. A positive screen prompts a full audiologic evaluation. It supports rather than replaces formal hearing assessment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const ANSWER = [{ value: '', text: '— answer —' }, { value: '0', text: 'No (0)' }, { value: '2', text: 'Sometimes (2)' }, { value: '4', text: 'Yes (4)' }];
const TOPICS = [
  'Feel embarrassed meeting new people',
  'Feel frustrated talking with family',
  'Difficulty hearing when someone whispers',
  'Feel handicapped by a hearing problem',
  'Difficulty visiting friends, relatives, or neighbors',
  'Attend religious services less than desired',
  'Have arguments with family members',
  'Difficulty listening to TV or radio',
  'Feel hearing limits personal or social life',
  'Difficulty hearing in a restaurant with others',
];

export const renderers = {
  'hhie-s'(root) {
    note(root, 'HHIE-S (Ventry & Weinstein 1983): 10-item hearing-handicap screen. Answer each No (0), Sometimes (2), or Yes (4). Total 0–40. Bands: 0–8 no handicap, 10–24 mild-to-moderate, 26–40 significant. A score > 8 prompts audiologic referral.');
    const ids = [];
    TOPICS.forEach((topic, i) => {
      const id = `hhie-q${i + 1}`;
      ids.push(id);
      root.appendChild(selectField(topic, id, ANSWER));
    });
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      ids.forEach((id, i) => { args[`q${i + 1}`] = val(id); });
      const r = M.hhieS(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/40` },
        { label: 'Handicap', value: r.tier.replace('-', ' ') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
