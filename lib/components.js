// Design-system wave 2 (docs/design.md §5): shared DOM builders for the modern
// component set. Built with lib/dom.js el() -- no HTML strings. Only builders a
// view actually consumes live here; the status-chip and stat-grid builders land
// with their calculator consumers in a later wave.
import { el, clear } from './dom.js';

// Wrap a native <input type="file"> in the shared .dropzone card. The input
// stays the real, accessible control (keyboard and assistive tech reach it
// directly); the card is the visible target, adds drag-and-drop, and lists the
// chosen files as removable chips. A drop assigns the files to the input and
// dispatches a native 'change', so the caller's existing change handler is the
// one code path for both choosing and dropping -- the worker parse, size limit,
// and "stays in this tab" guarantees are untouched. Returns the dropzone element
// to append where the input used to go.
export function dropzone(input, { hint = 'Drag and drop here, or choose below.' } = {}) {
  const zone = el('div', { class: 'dropzone' });
  zone.appendChild(el('span', { class: 'dropzone-icon', 'aria-hidden': 'true', text: '⬆' }));
  if (hint) zone.appendChild(el('p', { class: 'dropzone-hint', text: hint }));
  zone.appendChild(input);
  const fileList = el('div', { class: 'dropzone-files' });
  zone.appendChild(fileList);

  // Assigning input.files needs a DataTransfer; where it is unavailable the
  // native picker still works, so a failed assign degrades, it does not throw.
  const setFiles = (files) => {
    try {
      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      input.files = dt.files;
    } catch { return false; }
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drop-active'); });
  zone.addEventListener('dragleave', (e) => { if (e.target === zone) zone.classList.remove('drop-active'); });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drop-active');
    const dropped = e.dataTransfer && e.dataTransfer.files;
    if (dropped && dropped.length) setFiles(dropped);
  });

  // Reflect the current selection as input chips on every change (pick or drop).
  input.addEventListener('change', () => {
    clear(fileList);
    const chosen = [...(input.files || [])];
    chosen.forEach((file, index) => {
      const chip = el('span', { class: 'chip chip--input' });
      chip.appendChild(el('span', { class: 'chip-name', text: file.name }));
      const remove = el('button', {
        type: 'button', class: 'chip-remove', 'aria-label': `Remove ${file.name}`, text: '✕',
      });
      remove.addEventListener('click', () => {
        if (!setFiles(chosen.filter((_, i) => i !== index))) {
          input.value = '';
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      chip.appendChild(remove);
      fileList.appendChild(chip);
    });
  });

  return zone;
}
