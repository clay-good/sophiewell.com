// spec-v702 §2: renderer for edinburgh-claudication — the Edinburgh Claudication
// Questionnaire (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Five checkboxes
// plus a pain-site select; decision logic returns a claudication classification and grade.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/edinburgh-claudication-v702.js';
import { resultRow } from '../lib/result-copy.js';

function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
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
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Edinburgh questionnaire classifies a symptom pattern; it does not measure disease severity or replace the ankle-brachial index and vascular assessment. It supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const SITE = [['calf', 'Calf (with or without other sites)'], ['thigh-buttock', 'Thigh or buttock only'], ['other', 'Only shin, foot, hamstring, or joints']];

export const renderers = {
  'edinburgh-claudication'(root) {
    note(root, 'Edinburgh Claudication Questionnaire (Leng 1992): classifies leg pain as definite / atypical / not claudication. Character criteria: pain on walking, NOT at rest, worse uphill/hurrying, relieved within ~10 min of stopping; the calf must be involved for a definite pattern.');
    root.appendChild(checkField('Pain or discomfort in the leg(s) on walking', 'ecq-walking'));
    root.appendChild(checkField('The pain begins while standing still or sitting', 'ecq-rest'));
    root.appendChild(checkField('Pain when walking uphill or hurrying', 'ecq-uphill'));
    root.appendChild(checkField('Pain is relieved within about 10 minutes of standing still', 'ecq-relief'));
    root.appendChild(checkField('Pain also occurs at an ordinary walking pace on the level', 'ecq-ordinary'));
    root.appendChild(selectField('Main pain site', 'ecq-site', CHOICE(SITE)));
    const ids = ['ecq-walking', 'ecq-rest', 'ecq-uphill', 'ecq-relief', 'ecq-ordinary', 'ecq-site'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.edinburghClaudication({
        painOnWalking: checked('ecq-walking'), painAtRest: checked('ecq-rest'), painUphillHurry: checked('ecq-uphill'),
        reliefWithin10: checked('ecq-relief'), painOrdinaryPace: checked('ecq-ordinary'), painSite: val('ecq-site'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Result', value: r.classification },
        { label: 'Grade', value: r.grade ? r.grade : '—' },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
