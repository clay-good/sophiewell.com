// 5x7 ASCII bitmap font, public-domain hand-encoded glyphs for the
// printable subset Sophie's OG card generator needs (uppercase A-Z,
// digits 0-9, common punctuation). Tool names are uppercased before
// rendering so a single case is sufficient.
//
// Each glyph is 5 columns wide x 7 rows tall. Stored as 7 rows of a
// 5-character string where 'X' = ink, '.' = background.
//
// Renderer scales each pixel up by an integer factor and stamps it
// onto an RGBA pixel buffer.

const RAW = {
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '!': ['..X..', '..X..', '..X..', '..X..', '..X..', '.....', '..X..'],
  '"': ['.X.X.', '.X.X.', '.....', '.....', '.....', '.....', '.....'],
  '#': ['.X.X.', '.X.X.', 'XXXXX', '.X.X.', 'XXXXX', '.X.X.', '.X.X.'],
  '$': ['..X..', '.XXXX', 'X.X..', '.XXX.', '..X.X', 'XXXX.', '..X..'],
  '%': ['XX..X', 'XX.X.', '..X..', '.X.XX', 'X..XX', '.....', '.....'],
  '&': ['.XX..', 'X..X.', '.XX..', 'X.X.X', 'X..X.', '.XX.X', '.....'],
  "'": ['..X..', '..X..', '.....', '.....', '.....', '.....', '.....'],
  '(': ['...X.', '..X..', '.X...', '.X...', '.X...', '..X..', '...X.'],
  ')': ['.X...', '..X..', '...X.', '...X.', '...X.', '..X..', '.X...'],
  '*': ['.....', '..X..', 'X.X.X', '.XXX.', 'X.X.X', '..X..', '.....'],
  '+': ['.....', '..X..', '..X..', 'XXXXX', '..X..', '..X..', '.....'],
  ',': ['.....', '.....', '.....', '.....', '.....', '..X..', '.X...'],
  '-': ['.....', '.....', '.....', 'XXXXX', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '..X..', '..X..'],
  '/': ['....X', '...X.', '..X..', '.X...', 'X....', '.....', '.....'],
  '0': ['.XXX.', 'X...X', 'X..XX', 'X.X.X', 'XX..X', 'X...X', '.XXX.'],
  '1': ['..X..', '.XX..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  '2': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.X...', 'XXXXX'],
  '3': ['XXXXX', '...X.', '..X..', '...X.', '....X', 'X...X', '.XXX.'],
  '4': ['...X.', '..XX.', '.X.X.', 'X..X.', 'XXXXX', '...X.', '...X.'],
  '5': ['XXXXX', 'X....', 'XXXX.', '....X', '....X', 'X...X', '.XXX.'],
  '6': ['..XX.', '.X...', 'X....', 'XXXX.', 'X...X', 'X...X', '.XXX.'],
  '7': ['XXXXX', '....X', '...X.', '..X..', '.X...', '.X...', '.X...'],
  '8': ['.XXX.', 'X...X', 'X...X', '.XXX.', 'X...X', 'X...X', '.XXX.'],
  '9': ['.XXX.', 'X...X', 'X...X', '.XXXX', '....X', '...X.', '.XX..'],
  ':': ['.....', '..X..', '..X..', '.....', '..X..', '..X..', '.....'],
  ';': ['.....', '..X..', '..X..', '.....', '..X..', '..X..', '.X...'],
  '<': ['...X.', '..X..', '.X...', 'X....', '.X...', '..X..', '...X.'],
  '=': ['.....', '.....', 'XXXXX', '.....', 'XXXXX', '.....', '.....'],
  '>': ['.X...', '..X..', '...X.', '....X', '...X.', '..X..', '.X...'],
  '?': ['.XXX.', 'X...X', '....X', '...X.', '..X..', '.....', '..X..'],
  '@': ['.XXX.', 'X...X', 'X.XXX', 'X.X.X', 'X.XXX', 'X....', '.XXX.'],
  'A': ['.XXX.', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  'B': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X...X', 'X...X', 'XXXX.'],
  'C': ['.XXX.', 'X...X', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
  'D': ['XXXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'XXXX.'],
  'E': ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'XXXXX'],
  'F': ['XXXXX', 'X....', 'X....', 'XXXX.', 'X....', 'X....', 'X....'],
  'G': ['.XXX.', 'X...X', 'X....', 'X..XX', 'X...X', 'X...X', '.XXX.'],
  'H': ['X...X', 'X...X', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
  'I': ['.XXX.', '..X..', '..X..', '..X..', '..X..', '..X..', '.XXX.'],
  'J': ['..XXX', '...X.', '...X.', '...X.', '...X.', 'X..X.', '.XX..'],
  'K': ['X...X', 'X..X.', 'X.X..', 'XX...', 'X.X..', 'X..X.', 'X...X'],
  'L': ['X....', 'X....', 'X....', 'X....', 'X....', 'X....', 'XXXXX'],
  'M': ['X...X', 'XX.XX', 'X.X.X', 'X.X.X', 'X...X', 'X...X', 'X...X'],
  'N': ['X...X', 'X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X'],
  'O': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  'P': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X....', 'X....', 'X....'],
  'Q': ['.XXX.', 'X...X', 'X...X', 'X...X', 'X.X.X', 'X..X.', '.XX.X'],
  'R': ['XXXX.', 'X...X', 'X...X', 'XXXX.', 'X.X..', 'X..X.', 'X...X'],
  'S': ['.XXXX', 'X....', 'X....', '.XXX.', '....X', '....X', 'XXXX.'],
  'T': ['XXXXX', '..X..', '..X..', '..X..', '..X..', '..X..', '..X..'],
  'U': ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.XXX.'],
  'V': ['X...X', 'X...X', 'X...X', 'X...X', 'X...X', '.X.X.', '..X..'],
  'W': ['X...X', 'X...X', 'X...X', 'X.X.X', 'X.X.X', 'XX.XX', 'X...X'],
  'X': ['X...X', 'X...X', '.X.X.', '..X..', '.X.X.', 'X...X', 'X...X'],
  'Y': ['X...X', 'X...X', '.X.X.', '..X..', '..X..', '..X..', '..X..'],
  'Z': ['XXXXX', '....X', '...X.', '..X..', '.X...', 'X....', 'XXXXX'],
  '[': ['.XXX.', '.X...', '.X...', '.X...', '.X...', '.X...', '.XXX.'],
  '\\': ['X....', '.X...', '..X..', '...X.', '....X', '.....', '.....'],
  ']': ['.XXX.', '...X.', '...X.', '...X.', '...X.', '...X.', '.XXX.'],
  '^': ['..X..', '.X.X.', 'X...X', '.....', '.....', '.....', '.....'],
  '_': ['.....', '.....', '.....', '.....', '.....', '.....', 'XXXXX'],
  '`': ['.X...', '..X..', '.....', '.....', '.....', '.....', '.....'],
};

// Pre-bake to integer bit-rows: a 7-element array where each value is
// the 5-bit row pattern (bit 4 = leftmost pixel).
const GLYPHS = new Map();
for (const [ch, rows] of Object.entries(RAW)) {
  GLYPHS.set(ch, rows.map((row) => {
    let bits = 0;
    for (let i = 0; i < 5; i++) if (row[i] === 'X') bits |= 1 << (4 - i);
    return bits;
  }));
}

export const GLYPH_W = 5;
export const GLYPH_H = 7;

// Draw a single glyph onto an RGBA buffer at (x, y), scaled by `scale`.
// Unknown chars render as the '?' glyph.
export function drawGlyph(buf, bufW, x, y, ch, scale, rgba) {
  const glyph = GLYPHS.get(ch) || GLYPHS.get('?');
  const [r, g, b, a] = rgba;
  for (let row = 0; row < GLYPH_H; row++) {
    const bits = glyph[row];
    for (let col = 0; col < GLYPH_W; col++) {
      if (!((bits >> (4 - col)) & 1)) continue;
      const px = x + col * scale;
      const py = y + row * scale;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const idx = ((py + dy) * bufW + (px + dx)) * 4;
          buf[idx] = r;
          buf[idx + 1] = g;
          buf[idx + 2] = b;
          buf[idx + 3] = a;
        }
      }
    }
  }
}

// Draw a string left-aligned at (x, y). Returns the rendered width in
// pixels (so callers can compute center/right alignment in a second pass).
export function drawText(buf, bufW, x, y, text, scale, rgba) {
  const cellW = (GLYPH_W + 1) * scale; // 1-pixel inter-glyph gap, scaled
  const upper = text.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    drawGlyph(buf, bufW, x + i * cellW, y, upper[i], scale, rgba);
  }
  return upper.length * cellW;
}

export function textWidth(text, scale) {
  return text.length * (GLYPH_W + 1) * scale;
}

// Wrap a string into N lines so each fits within maxWidth pixels at
// the given scale. Greedy word-wrap on spaces.
export function wrapText(text, maxWidth, scale, maxLines = 3) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (textWidth(candidate, scale) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // Truncate the last line with an ellipsis if the text overflowed.
  if (lines.length === maxLines) {
    let last = lines[lines.length - 1];
    const remainingIdx = words.indexOf(last.split(' ').pop()) + 1;
    if (remainingIdx < words.length) {
      while (last.length > 1 && textWidth(`${last}...`, scale) > maxWidth) {
        last = last.slice(0, -1);
      }
      lines[lines.length - 1] = `${last}...`;
    }
  }
  return lines;
}
