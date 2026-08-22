// Cutting a line without cutting a bracket in half.
//
// Every clamp on this site picks an index and slices there. An index inside a
// parenthesis publishes a line that opens a bracket and never closes it --
// "(the C axis of…", "(0-4 animals = 0" -- which reads as text that was
// corrupted rather than shortened.
//
// Kept in lib/ rather than under scripts/ because both the build and the
// browser clamp the same strings: scripts/lib/tile-line.mjs re-exports these,
// and lib/page-title.js uses them to write the browser tab.

// How many brackets are open at `index`.
export function depthAt(text, index) {
  let depth = 0;
  for (let i = 0; i < index; i++) {
    const c = text[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
  }
  return depth;
}

// The same cut point, backed out to before any bracket it landed inside.
export function outsideBrackets(text, index) {
  const open = [];
  for (let i = 0; i < index; i++) {
    const c = text[i];
    if (c === '(' || c === '[') open.push(i);
    else if (c === ')' || c === ']') open.pop();
  }
  return open.length ? open[0] : index;
}
