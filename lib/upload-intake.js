// spec-v1501 §3: pure CSV/TSV intake shared by browser workers and tests.
// Parsing and mapping never run a calculator. The reader must confirm the mapping.
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_DATA_ROWS = 500000;

function sniffDelimiter(text) {
  let quoted = false;
  let commas = 0;
  let tabs = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') i++;
      else quoted = !quoted;
    } else if (!quoted) {
      if (c === '\r' || c === '\n') break;
      if (c === ',') commas++;
      if (c === '\t') tabs++;
    }
  }
  if (commas && tabs && commas === tabs) {
    throw new RangeError('Choose CSV or TSV: the header delimiter is ambiguous.');
  }
  return tabs > commas ? '\t' : ',';
}

export function parseDelimited(text, { delimiter, maxBytes = MAX_FILE_BYTES, maxRows = MAX_DATA_ROWS } = {}) {
  if (typeof text !== 'string') throw new TypeError('File contents must be text.');
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_FILE_BYTES ||
      !Number.isInteger(maxRows) || maxRows < 0 || maxRows > MAX_DATA_ROWS) {
    throw new RangeError('Invalid file limits.');
  }
  if (text.length > maxBytes || new TextEncoder().encode(text).length > maxBytes) {
    throw new RangeError(`File exceeds the ${maxBytes}-byte limit.`);
  }
  text = text.replace(/^\uFEFF/, '');
  if (!text) throw new RangeError('The file is empty.');
  delimiter ??= sniffDelimiter(text);
  if (delimiter !== ',' && delimiter !== '\t') throw new RangeError('Choose CSV or TSV.');
  const records = [];
  let row = [];
  let value = '';
  let state = 'start';
  const endField = () => { row.push(value); value = ''; state = 'start'; };
  const endRow = () => {
    endField();
    if (records.length > maxRows) throw new RangeError(`File exceeds the ${maxRows}-row limit.`);
    if (records.length && row.length !== records[0].length) {
      throw new RangeError(`Row ${records.length + 1} has ${row.length} columns; expected ${records[0].length}.`);
    }
    records.push(row);
    row = [];
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (state === 'quoted') {
      if (c !== '"') value += c;
      else if (text[i + 1] === '"') { value += '"'; i++; }
      else state = 'closed';
    } else if (c === delimiter) endField();
    else if (c === '\r' || c === '\n') {
      endRow();
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else if (c === '"' && state === 'start') state = 'quoted';
    else {
      if (state === 'closed' || c === '"') throw new RangeError(`Invalid quote in row ${records.length + 1}.`);
      value += c;
      state = 'unquoted';
    }
  }
  if (state === 'quoted') throw new RangeError(`Unclosed quote in row ${records.length + 1}.`);
  if (row.length || state !== 'start') endRow();
  const [headers, ...rows] = records;
  if (!headers || headers.some(header => !header.trim())) throw new RangeError('Every column needs a header.');
  return { delimiter, headers, rows };
}

const normalizeHeader = value => value.trim().toLowerCase().replace(/[_\s-]+/g, ' ');

// Fields are { id, label, required, synonyms: [] }; proposals use column indexes
// so duplicate headers cannot silently overwrite patient data.
export function matchColumns(headers, fields) {
  const normalized = headers.map(normalizeHeader);
  const candidates = fields.map(field => {
    const names = new Set([field.id, ...(field.synonyms || [])].map(normalizeHeader));
    return normalized.flatMap((header, index) => names.has(header) ? [index] : []);
  });
  const mapping = Object.create(null);
  const ambiguous = [];
  const missing = [];
  fields.forEach((field, index) => {
    const matches = candidates[index];
    const shared = matches.some(column => candidates.some((other, i) => i !== index && other.includes(column)));
    if (matches.length > 1 || shared) ambiguous.push(field.id);
    mapping[field.id] = matches.length === 1 && !shared ? matches[0] : null;
    if (field.required && mapping[field.id] === null) missing.push(field.id);
  });
  return { mapping, missing, ambiguous };
}

// Call only with the mapping the reader confirmed or corrected. Missing required
// fields and a source column reused for two inputs block a batch run.
export function validateColumnMapping(headers, fields, mapping) {
  const errors = [];
  const used = new Set();
  for (const field of fields) {
    const column = Object.hasOwn(mapping, field.id) ? mapping[field.id] : null;
    if (column === null || column === undefined) {
      if (field.required) errors.push(`Choose a column for ${field.label || field.id}.`);
    } else if (!Number.isInteger(column) || column < 0 || column >= headers.length) {
      errors.push(`Invalid column for ${field.label || field.id}.`);
    } else if (used.has(column)) errors.push(`Column ${column + 1} is mapped more than once.`);
    else used.add(column);
  }
  return errors;
}

function csvValue(value) {
  let text = value === null || value === undefined ? '' : String(value);
  // A downloaded CSV is commonly opened in a spreadsheet. Treat formula-like
  // user text as text so an input cell cannot execute when the file opens.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeCsv(headers, rows) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) throw new TypeError('CSV headers and rows must be arrays.');
  const lines = [headers.map(csvValue).join(',')];
  for (const [index, row] of rows.entries()) {
    if (!Array.isArray(row) || row.length !== headers.length) {
      throw new RangeError(`CSV row ${index + 1} has the wrong number of columns.`);
    }
    lines.push(row.map(csvValue).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
