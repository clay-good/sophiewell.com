// spec-v645 §2: renderer for cheops — the Children's Hospital of Eastern Ontario
// Pain Scale (Clinical Scoring & Risk, Group G). The companion to the built
// pediatric-pain cluster (flacc, nips, npass, cries, comfort-b, pipp).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six
// behavioral selects with non-uniform points; the total (4-13) is the primary
// output, and the analgesia threshold is shown as advisory, not a single verdict.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/cheops-v645.js';
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
function selVal(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. CHEOPS is a bedside pain-behavior rating computed from the observations you entered, not a diagnosis. The scale prescribes no single treatment cutoff; the analgesia decision stays with the clinician and local protocol.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];

const FIELDS = [
  { key: 'cry', dom: 'cheops-cry', label: 'Cry', opts: [['nocry', 'No cry (1)'], ['moaning', 'Moaning (2)'], ['crying', 'Crying (2)'], ['scream', 'Screaming (3)']] },
  { key: 'facial', dom: 'cheops-facial', label: 'Facial', opts: [['smiling', 'Smiling (0)'], ['composed', 'Composed / neutral (1)'], ['grimace', 'Grimace (2)']] },
  { key: 'verbal', dom: 'cheops-verbal', label: 'Verbal (child)', opts: [['positive', 'Positive statements (0)'], ['none', 'Not talking (1)'], ['other', 'Complaints, not pain (1)'], ['pain', 'Pain complaints (2)'], ['both', 'Pain and other complaints (2)']] },
  { key: 'torso', dom: 'cheops-torso', label: 'Torso', opts: [['neutral', 'Neutral / resting (1)'], ['shifting', 'Shifting (2)'], ['tense', 'Tense (2)'], ['shivering', 'Shivering (2)'], ['upright', 'Upright (2)'], ['restrained', 'Restrained (2)']] },
  { key: 'touch', dom: 'cheops-touch', label: 'Touch (wound)', opts: [['nottouching', 'Not touching (1)'], ['reaching', 'Reaching for wound (2)'], ['touching', 'Touching wound (2)'], ['grabbing', 'Grabbing at wound (2)'], ['restrained', 'Arms restrained (2)']] },
  { key: 'legs', dom: 'cheops-legs', label: 'Legs', opts: [['neutral', 'Neutral (1)'], ['squirming', 'Squirming / kicking (2)'], ['drawnup', 'Drawn up / tensed (2)'], ['standing', 'Standing / kneeling (2)'], ['restrained', 'Restrained (2)']] },
];

export const renderers = {
  cheops(root) {
    note(root, 'CHEOPS (McGrath 1985): observed postoperative pain in children ~1-7 years. Rate six behaviors; the total ranges 4-13 (higher = more pain behavior). The scale sets no single cutoff; a score of 6 or more is the most commonly cited analgesia threshold, with 5 and 8 schemes also in use. Near-neighbors: flacc, cries, comfort-b.');
    for (const f of FIELDS) root.appendChild(selectField(f.label, f.dom, CHOICE(f.opts)));
    const ids = FIELDS.map((f) => f.dom);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const input = {};
      for (const f of FIELDS) input[f.key] = selVal(f.dom);
      const r = M.cheops(input);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Total', value: `${r.total}/13` },
      ]);
      note(o, r.thresholdNote);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
