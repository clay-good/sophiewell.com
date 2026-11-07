// spec-v1701: drug-interaction-kinetics tool 4, cyp-list-check. FDA's Table 1 loads from data/fda-ddi-examples;
// a formulary or medication list file fills the box through the drug-list reader (lib/list-intake.js).

import { el, clear } from '../lib/dom.js';
import { dropzone } from '../lib/components.js';
import { resultRow } from '../lib/result-copy.js';
import { acceptVia } from '../lib/hand-off.js';
import { listFromFile } from '../lib/list-intake.js';
import { loadFdaDdi } from '../lib/fda-ddi-load.js';
import * as CLC from '../lib/cyp-list-check-v1701.js';

function list(root, items) {
  if (!items || !items.length) return;
  const ul = el('ul');
  for (const t of items) ul.appendChild(el('li', { text: t }));
  root.appendChild(ul);
}
function note(root, text) { if (text) root.appendChild(el('p', { class: 'muted', text })); }

export const renderers = {
  'cyp-list-check'(root) {
    const wrap = el('p');
    wrap.appendChild(el('label', { for: 'clc-drugs', text: 'Medications, one per line (generic names; strengths and dose forms are ignored)' }));
    wrap.appendChild(el('br'));
    wrap.appendChild(el('textarea', { id: 'clc-drugs', rows: '6', placeholder: 'clarithromycin\nsimvastatin' }));
    root.appendChild(wrap);
    const pick = el('p');
    pick.appendChild(el('label', { for: 'clc-file', text: 'Or load a list file (CSV or text)' }));
    pick.appendChild(el('br'));
    const fileIn = el('input', { id: 'clc-file', type: 'file', accept: '.csv,.txt,.tsv,text/csv,text/plain' });
    pick.appendChild(dropzone(fileIn));
    const said = el('span', { class: 'muted', 'aria-live': 'polite' });
    pick.appendChild(el('br'));
    pick.appendChild(said);
    root.appendChild(pick);
    const o = el('div', { id: 'q-results', 'aria-live': 'polite' });
    root.appendChild(o);
    let db = null;
    const run = () => {
      clear(o);
      if (!db) { note(o, 'Loading FDA\'s examples table.'); return; }
      const r = CLC.cypListCheck({ drugs: document.getElementById('clc-drugs').value }, db, new Date());
      if (!r.valid) { note(o, r.message); return; }
      resultRow(o, [{ text: r.band }, { label: 'Result', value: r.bandLabel }]);
      list(o, r.notes);
      note(o, r.note);
      const a = el('p');
      a.appendChild(el('a', { href: CLC.SOURCE_URL, target: '_blank', rel: 'noreferrer', text: 'FDA\'s table' }));
      o.appendChild(a);
    };
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) return;
      if (f.size > 5000000) { said.textContent = `${f.name} is over the 5 MB this list reads.`; return; }
      const r = listFromFile(await f.text(), 'hdl-drugs');
      if (r.message) { said.textContent = r.message; return; }
      said.textContent = `${f.name}: ${r.note}`;
      const box = document.getElementById('clc-drugs');
      box.value = r.text;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    });
    document.getElementById('clc-drugs').addEventListener('input', run);
    loadFdaDdi().then((d) => { db = d; }, () => { db = { manifest: null }; }).then(run);
    run();
  },
};

export const acceptFiles = {
  'cyp-list-check': acceptVia('clc-file'),
};
