// spec-v1624 step 3 / spec-v1613 §4: "Your record can fill these tools".
// Ready tools with their answer and the values used with dates; tools one
// value short; every value found with its date and code; values not used
// with the reason. Nothing is computed from a value the reader can't see.

import { el, clear } from '../lib/dom.js';
import { longDate } from '../lib/record-pick.js';

const SEX = { F: 'Female', M: 'Male' };

function valueText(conceptLabel, v) {
  if (v.from === 'administrative gender') return SEX[v.value];
  const date = v.at ? ` (${longDate(v.at)})` : '';
  const derived = v.derivedFrom ? `, from ${v.derivedFrom.join(', ').replace(/-/g, ' ')}` : '';
  if (v.from === 'birth date') return `Age ${v.value}`;
  return `${conceptLabel} ${v.value} ${v.unit}${derived}${date}`;
}

// renderRecordPanel(main, { record, picked, plan, conceptsById, toolName,
//   onOpen(toolId), computeAnswer(toolId, fills) -> Promise<string|null> })
export function renderRecordPanel(main, { record, picked, plan, conceptsById, toolName, onOpen, computeAnswer }) {
  clear(main);
  const content = el('section', { class: 'content record-panel', 'aria-label': 'Your record' });
  content.appendChild(el('h1', { text: 'Your record can fill these tools' }));
  content.appendChild(el('p', { class: 'notice', text: `Read in this tab from ${record.files.map((f) => f.name).join(', ')}. Not uploaded, not kept, and never put in a link.` }));
  const label = (c) => (conceptsById.get(c) || { label: c.replace(/-/g, ' ') }).label;
  const used = (r) => r.used.map((u) => valueText(label(u.concept), picked.values[u.concept])).join(' · ');
  const openButton = (id) => {
    const b = el('button', { type: 'button', class: 'record-open', text: `Open ${toolName(id)}` });
    b.addEventListener('click', () => onOpen(id));
    return b;
  };

  content.appendChild(el('h2', { text: 'Ready' }));
  if (!plan.ready.length) content.appendChild(el('p', { class: 'muted', text: 'No tool has every value it needs from this record.' }));
  const ul = el('ul', { class: 'record-ready' });
  for (const r of plan.ready) {
    const li = el('li', { 'data-tool': r.id });
    li.appendChild(el('strong', { text: toolName(r.id) }));
    const answer = el('span', { class: 'record-answer' });
    li.appendChild(document.createTextNode(': '));
    li.appendChild(answer);
    if (r.questions.length) {
      answer.textContent = `needs your answer: ${r.questions.map((q) => q.l).join('; ')}.`;
    } else {
      answer.textContent = 'working it out...';
      computeAnswer(r.id, r.fills).then((text) => { answer.textContent = text || 'open the tool to see the answer.'; });
    }
    li.appendChild(el('p', { class: 'muted record-used', text: used(r) }));
    li.appendChild(openButton(r.id));
    ul.appendChild(li);
  }
  content.appendChild(ul);

  if (plan.oneShort.length) {
    content.appendChild(el('h2', { text: 'One value short' }));
    const ul2 = el('ul');
    for (const r of plan.oneShort) {
      const li = el('li', { 'data-tool': r.id, text: `${toolName(r.id)} needs ${r.missing.l.replace(/\s*\(.*\)$/, '').toLowerCase()}. ` });
      li.appendChild(openButton(r.id));
      ul2.appendChild(li);
    }
    content.appendChild(ul2);
  }

  content.appendChild(el('h2', { text: 'The values we found' }));
  const wrap = el('div', { class: 'upload-mapping-scroll' });
  const table = el('table', { class: 'upload-mapping-table record-values' });
  table.appendChild(el('caption', { text: 'Coded values read from the record' }));
  const head = el('tr');
  for (const h of ['Value', 'Result', 'Date', 'Code', 'Note']) head.appendChild(el('th', { scope: 'col', text: h }));
  table.appendChild(el('thead', null, [head]));
  const body = el('tbody');
  for (const [c, v] of Object.entries(picked.values)) {
    const tr = el('tr');
    const shown = v.from === 'administrative gender' ? SEX[v.value] : `${v.value}${v.unit ? ` ${v.unit}` : ''}`;
    for (const cell of [c === 'age' ? 'Age' : c === 'sex' ? 'Sex' : label(c), shown, v.at ? longDate(v.at) : '', v.code ? `${v.system === 'LOINC' ? 'LOINC ' : ''}${v.code}` : (v.from ? `from ${v.from}` : v.derivedFrom ? `from ${v.derivedFrom.join(', ').replace(/-/g, ' ')}` : ''), v.note || '']) tr.appendChild(el('td', { text: String(cell) }));
    body.appendChild(tr);
  }
  table.appendChild(body);
  wrap.appendChild(table);
  content.appendChild(wrap);
  if (picked.notChosen.length) {
    content.appendChild(el('h2', { text: 'Values not used' }));
    const ul3 = el('ul');
    for (const n of picked.notChosen) ul3.appendChild(el('li', { text: `${label(n.concept)} ${n.value} ${n.unit}${n.at ? ` (${longDate(n.at)})` : ''}: ${n.reason}` }));
    content.appendChild(ul3);
  }
  content.appendChild(el('p', { class: 'muted', text: 'Only coded results and vital signs are read, never notes. Yes/no answers such as smoking or treatment are asked, not guessed.' }));
  main.appendChild(content);
}
