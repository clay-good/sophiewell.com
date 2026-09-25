// spec-v1489: renderer for peri-implant-status (Clinical Scoring & Risk, Group G).

import { el, clear } from '../lib/dom.js';
import * as PI from '../lib/peri-implant-status-v1489.js';
import { resultRow } from '../lib/result-copy.js';

const NA = { value: '', text: '— choose —' };
function selectField(root, label, id, options) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  const s = el('select', { id });
  for (const opt of [NA, ...options]) s.appendChild(el('option', { value: opt.value, text: opt.text }));
  wrap.appendChild(s);
  root.appendChild(wrap);
}
function numField(root, label, id, placeholder) {
  const wrap = el('p');
  wrap.appendChild(el('label', { for: id, text: label }));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('input', { id, type: 'number', min: '0', max: '20', step: '0.5', inputmode: 'decimal', placeholder }));
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

export const renderers = {
  'peri-implant-status'(root) {
    const pairs = [['pi-bleeding', 'bleeding'], ['pi-baseline', 'baseline'], ['pi-boneloss', 'boneLoss'], ['pi-deeper', 'depthIncrease'], ['pi-pd', 'probingDepth'], ['pi-bone', 'boneLevel']];
    selectField(root, 'Bleeding or suppuration on gentle probing?', 'pi-bleeding', PI.YES_NO);
    selectField(root, 'Is a baseline radiograph and probing record available?', 'pi-baseline', PI.YES_NO);
    selectField(root, 'With a baseline: bone loss beyond initial remodeling?', 'pi-boneloss', PI.YES_NO);
    selectField(root, 'With a baseline: probing depth increased since then?', 'pi-deeper', PI.YES_NO);
    numField(root, 'Without a baseline: deepest probing depth (mm)', 'pi-pd', 'e.g. 7');
    numField(root, 'Without a baseline: bone level below the top of the implant within bone (mm)', 'pi-bone', 'e.g. 4');
    const ids = pairs.map(([d]) => d);
    const o = out(); root.appendChild(o);
    wire(ids, () => safe(o, () => {
      const args = {};
      for (const [dom, arg] of pairs) args[arg] = val(dom);
      const r = PI.periImplantStatus(args);
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band, cls: r.abnormal ? 'warn' : null }, { label: 'Case', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
    }));
  },
};
