// spec-v740 §2: renderer for walch-glenoid — the Walch classification of glenoid
// morphology in primary glenohumeral osteoarthritis (Clinical Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Three enum
// selects (humeral-head position, concavity, erosion), a retroversion number, and a
// dysplastic checkbox map to a type code A1..D.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/walch-glenoid-v740.js';
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
function numberField(label, id) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', step: '1', inputmode: 'numeric' }));
  return wrap;
}
function checkField(label, id) {
  const wrap = el('p');
  const inp = el('input', { id, type: 'checkbox' });
  wrap.appendChild(inp);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function chk(id) { const n = document.getElementById(id); return n ? n.checked : false; }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Walch type is read from CT and imaging; surgical planning stays with the treating surgeon.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const SUBLUX = [{ value: '', text: '— select —' }, { value: 'centered', text: 'Centered (concentric)' }, { value: 'posterior', text: 'Posterior subluxation' }, { value: 'anterior', text: 'Anterior subluxation' }];
const CONC = [{ value: '', text: '— select —' }, { value: 'single', text: 'Single (monoconcave)' }, { value: 'biconcave', text: 'Biconcave' }];
const EROS = [{ value: '', text: '— select —' }, { value: 'minor', text: 'Minor central erosion' }, { value: 'major', text: 'Major central erosion' }];

export const renderers = {
  'walch-glenoid'(root) {
    note(root, 'Walch classification (Walch 1999; Bercik 2016): a centered head is type A (A1 minor, A2 major central erosion); posterior subluxation is type B (B1 no biconcavity, B2 biconcave, B3 monoconcave with high retroversion); dysplastic retroversion over 25 degrees is type C; anterior subluxation or anteversion is type D.');
    root.appendChild(selectField('Humeral-head position', 'walch-sublux', SUBLUX));
    root.appendChild(numberField('Glenoid retroversion (degrees, anteversion negative)', 'walch-retro'));
    root.appendChild(selectField('Glenoid concavity (if posterior)', 'walch-conc', CONC));
    root.appendChild(selectField('Central erosion (if centered)', 'walch-eros', EROS));
    root.appendChild(checkField('Retroversion is dysplastic (congenital, not erosion-caused)', 'walch-dys'));
    const ids = ['walch-sublux', 'walch-retro', 'walch-conc', 'walch-eros', 'walch-dys'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.walchGlenoid({ subluxation: val('walch-sublux'), retroversion: val('walch-retro'), concavity: val('walch-conc'), erosion: val('walch-eros'), dysplastic: chk('walch-dys') });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.bandLabel, cls: r.abnormal ? 'warn' : null },
        { label: 'Type', value: r.type },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
