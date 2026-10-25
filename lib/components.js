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

// Render a <select> as a segmented control WITHOUT disturbing the value model.
// The select stays in the DOM as the single source of truth -- visually hidden
// but a real form control -- so trackHashState still serializes it, applyExample
// and applyHashState still set its .value, and the tile's compute (wired to the
// select's change event) is untouched. The buttons are a view over it: a click
// sets select.value and dispatches input+change (driving compute), and the
// buttons mirror the select's value on every change (so a loaded example or a
// deep link updates them too). Use only for 2-4 short, mutually exclusive
// options; keep a plain <select> for long or open lists. Mutates in place and
// returns the radiogroup.
export function segmentedFromSelect(select, { ariaLabel } = {}) {
  select.classList.add('visually-hidden');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  // Name the radiogroup from the field's own label when none is passed, so the
  // control is announced the same as the <select> it replaces.
  const labelNode = (select.labels && select.labels[0])
    || (select.parentElement && [...select.parentElement.querySelectorAll('label')]
      .find((l) => !l.getAttribute('for') || l.getAttribute('for') === select.id));
  const label = ariaLabel || (labelNode && labelNode.textContent) || null;

  const group = el('div', { class: 'segmented', role: 'radiogroup', 'aria-label': label });
  // A leading blank/placeholder option stays in the <select> (so "nothing
  // chosen yet" is still representable and deep-links to it) but gets no button.
  const options = [...select.options].filter((o) => o.value !== '');
  const buttons = options.map((opt) => {
    const b = el('button', { type: 'button', role: 'radio', text: opt.textContent });
    b.dataset.value = opt.value;
    b.addEventListener('click', () => choose(opt.value, true));
    group.appendChild(b);
    return b;
  });

  const sync = () => {
    buttons.forEach((b) => {
      const on = b.dataset.value === select.value;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    if (!buttons.some((b) => b.getAttribute('aria-checked') === 'true') && buttons[0]) buttons[0].tabIndex = 0;
  };

  function choose(value, focus) {
    if (select.value !== value) {
      select.value = value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      sync();
    }
    if (focus) { const b = buttons.find((x) => x.dataset.value === value); if (b) b.focus(); }
  }

  group.addEventListener('keydown', (e) => {
    const n = options.length;
    const idx = Math.max(0, buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true'));
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); choose(options[(idx + 1) % n].value, true); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); choose(options[(idx - 1 + n) % n].value, true); }
  });

  // External updates (applyExample / applyHashState) set select.value and
  // dispatch change -- mirror them onto the buttons.
  select.addEventListener('change', sync);
  select.addEventListener('input', sync);
  sync();

  select.after(group);
  return group;
}
