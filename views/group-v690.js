// spec-v690 §2: renderer for edmonton-frail-scale — the Edmonton Frail Scale (Clinical
// Scoring & Risk, Group G).
//
// Same input/render contract as the rest of the codebase: every input has a real
// <label for> (a11y-check passes), no innerHTML, no network, no storage. Six selects and
// five checkboxes across nine domains; the sum 0-17 maps to a frailty band.

import { el, clear } from '../lib/dom.js';
import * as M from '../lib/edmonton-frail-scale-v690.js';
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
function checkField(label, id) {
  const wrap = el('p');
  const cb = el('input', { id, type: 'checkbox' });
  wrap.appendChild(cb);
  wrap.appendChild(el('label', { for: id, text: ' ' + label }));
  return wrap;
}
function out() { return el('div', { id: 'q-results', 'aria-live': 'polite' }); }
function val(id) { const n = document.getElementById(id); return n ? n.value : ''; }
function checked(id) { const n = document.getElementById(id); return !!(n && n.checked); }
function safe(o, fn) { clear(o); try { fn(); } catch (err) { o.appendChild(el('p', { class: 'muted', text: err.message })); } }
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }
function postureNote(root) {
  root.appendChild(el('p', { class: 'muted', text: 'Decision support, not a verdict. The Edmonton Frail Scale flags frailty and prompts further assessment; it is not a diagnosis and supports rather than replaces clinical judgment.' }));
}
function wire(ids, run) {
  for (const id of ids) { const n = document.getElementById(id); if (n) { n.addEventListener('input', run); n.addEventListener('change', run); } }
  run();
}

const CHOICE = (pairs) => [{ value: '', text: '— choose —' }, ...pairs.map(([value, text]) => ({ value, text }))];
const COGNITION = [['0', 'No errors'], ['1', 'Minor spacing errors'], ['2', 'Other errors']];
const HOSP = [['0', 'None'], ['1', '1 to 2'], ['2', 'More than 2']];
const HEALTH = [['0', 'Good or better'], ['1', 'Fair'], ['2', 'Poor']];
const IADL = [['0', '0 to 1 IADLs need help'], ['1', '2 to 4 need help'], ['2', '5 to 8 need help']];
const SOCIAL = [['0', 'Always available'], ['1', 'Sometimes'], ['2', 'Never']];
const TUG = [['0', 'Under 10 seconds'], ['1', '11 to 20 seconds'], ['2', 'Over 20 seconds or needs help']];

export const renderers = {
  'edmonton-frail-scale'(root) {
    note(root, 'Edmonton Frail Scale (Rolfson 2006): nine domains summed to a maximum of 17. Bands: 0–5 not frail, 6–7 apparently vulnerable, 8–9 mild, 10–11 moderate, 12–17 severe frailty.');
    root.appendChild(selectField('Cognition (clock-drawing test)', 'efs-cog', CHOICE(COGNITION)));
    root.appendChild(selectField('Hospital admissions in the past year', 'efs-hosp', CHOICE(HOSP)));
    root.appendChild(selectField('Self-rated health', 'efs-health', CHOICE(HEALTH)));
    root.appendChild(selectField('Instrumental ADLs needing help', 'efs-iadl', CHOICE(IADL)));
    root.appendChild(selectField('Social support when needed', 'efs-social', CHOICE(SOCIAL)));
    root.appendChild(checkField('Takes 5 or more prescription medications', 'efs-meds5'));
    root.appendChild(checkField('At times forgets to take medications', 'efs-medforget'));
    root.appendChild(checkField('Recent weight loss (clothes looser)', 'efs-weight'));
    root.appendChild(checkField('Often feels sad or depressed', 'efs-mood'));
    root.appendChild(checkField('Urinary incontinence', 'efs-incont'));
    root.appendChild(selectField('Timed Up and Go (3 meters)', 'efs-tug', CHOICE(TUG)));
    const ids = ['efs-cog', 'efs-hosp', 'efs-health', 'efs-iadl', 'efs-social', 'efs-meds5', 'efs-medforget', 'efs-weight', 'efs-mood', 'efs-incont', 'efs-tug'];
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const r = M.edmontonFrailScale({
        cognition: val('efs-cog'), hospitalizations: val('efs-hosp'), selfRatedHealth: val('efs-health'),
        iadlHelp: val('efs-iadl'), socialSupport: val('efs-social'), timedUpGo: val('efs-tug'),
        meds5plus: checked('efs-meds5'), medsForget: checked('efs-medforget'), weightLoss: checked('efs-weight'),
        lowMood: checked('efs-mood'), incontinence: checked('efs-incont'),
      });
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [
        { text: r.band, cls: r.abnormal ? 'warn' : null },
        { label: 'Score', value: `${r.score}/17` },
        { label: 'Frailty', value: r.tier.replace('-', ' ') },
      ]);
      note(o, r.detail);
      note(o, r.note);
    }));
    postureNote(root);
  },
};
