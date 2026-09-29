// spec-v1625 / spec-v1615 §1: the receipt under a file result -- collapsed,
// with two downloads. The version to share is the default: it names each
// file by what it is and its position, because a file name can identify a
// patient. Neither version holds any of the files' contents.

import { el } from '../lib/dom.js';

function download(obj, filename) {
  const url = window.URL.createObjectURL(new Blob([`${JSON.stringify(obj, null, 2)}\n`], { type: 'application/json' }));
  const a = el('a', { href: url, download: filename });
  a.click();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
}

// renderReceipt(root, { receipt, shareableReceipt }) appends the block.
export function renderReceipt(root, { receipt, shareableReceipt }) {
  if (!receipt) return null;
  const box = el('details', { class: 'receipt' });
  box.appendChild(el('summary', { text: 'Receipt' }));
  box.appendChild(el('p', { class: 'muted', text: 'What produced this result, so it can be shown to someone else and checked. The files are named by their SHA-256; none of their contents are in the receipt.' }));
  const list = el('ul');
  receipt.files.forEach((f, i) => list.appendChild(el('li', { class: 'receipt-hash', text: `${shareableReceipt ? shareableReceipt.files[i].name : `File ${i + 1}`}: SHA-256 ${f.sha256}` })));
  list.appendChild(el('li', { text: `Tool ${receipt.tool.id}, build ${receipt.tool.commit}.` }));
  if (receipt.data.length) list.appendChild(el('li', { text: `Data: ${receipt.data.map((d) => `${d.id} ${d.sourceEdition}`).join('; ')}.` }));
  list.appendChild(el('li', { class: 'receipt-hash', text: `Result SHA-256 ${receipt.resultHash}.` }));
  box.appendChild(list);
  const actions = el('p');
  const share = el('button', { type: 'button', text: 'Download receipt to share' });
  share.addEventListener('click', () => download(shareableReceipt || receipt, `${receipt.tool.id}-receipt.json`));
  const named = el('button', { type: 'button', text: 'Download receipt with file names' });
  named.addEventListener('click', () => download(receipt, `${receipt.tool.id}-receipt-with-names.json`));
  actions.appendChild(share);
  actions.appendChild(document.createTextNode(' '));
  actions.appendChild(named);
  box.appendChild(actions);
  root.appendChild(box);
  return box;
}
