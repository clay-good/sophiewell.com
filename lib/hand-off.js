// spec-v1623 step 3: hand files a reader dropped elsewhere (the home page, the
// inventory) to a tool, through the tool's own file input. The files are put
// in the input with DataTransfer and a `change` event is fired, so a handed-off
// file takes exactly the path a chosen one does: same limits, same worker,
// same result. Files stay in memory in this tab.

// handOff(root, inputId, files) -> the input. `files` are File objects (a
// Blob unpacked from a zip is wrapped as a File by the caller). A
// single-file input gets the first file.
export function handOff(root, inputId, files) {
  const input = root.querySelector(`#${CSS.escape(inputId)}`);
  if (!input) throw new Error(`No file input #${inputId} on this tool.`);
  const dt = new DataTransfer();
  for (const f of (input.multiple ? files : files.slice(0, 1))) dt.items.add(f);
  input.files = dt.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return input;
}

// acceptVia(inputId) -> an acceptFiles entry for a tool with one file input.
export const acceptVia = (inputId) => (root, files) => handOff(root, inputId, files);
