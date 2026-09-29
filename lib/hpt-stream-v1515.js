// spec-v1515: bounded-memory stream readers for CMS HPT CSV and JSON files.
import { prepareCsv, validateCsvRow, validateJsonMetadata, validateJsonModifier, validateJsonStandardItem } from './hpt-v1515.js';

const MAX_FINDINGS = 200;
const MAX_VALUE_NODES = 250000;
const MAX_STRING_LENGTH = 16 * 1024 * 1024;

function collector() {
  const findings = []; let errorCount = 0;
  return {
    add(code, location, message) { errorCount += 1; if (findings.length < MAX_FINDINGS) findings.push({ code, location, message }); },
    result(extra) { return { ...extra, valid: errorCount === 0, errorCount, findings, findingsTruncated: errorCount > findings.length }; },
  };
}

class JsonTokenizer {
  constructor(stream, progress) {
    this.reader = stream.getReader(); this.decoder = new TextDecoder('utf-8', { fatal: true });
    this.buffer = ''; this.position = 0; this.done = false; this.bytes = 0; this.progress = progress;
  }

  async fill() {
    if (this.done) return false;
    const { value, done } = await this.reader.read();
    if (done) { this.buffer += this.decoder.decode(); this.done = true; return this.position < this.buffer.length; }
    this.bytes += value.byteLength; this.buffer += this.decoder.decode(value, { stream: true }); this.progress?.(this.bytes);
    return true;
  }

  compact() {
    if (this.position > 65536) { this.buffer = this.buffer.slice(this.position); this.position = 0; }
  }

  async take() {
    while (this.position >= this.buffer.length) {
      this.compact();
      if (!await this.fill()) return null;
    }
    return this.buffer[this.position++];
  }

  async next() {
    let char;
    do { char = await this.take(); } while (char != null && /\s/.test(char));
    if (char == null) return { type: 'eof' };
    if ('{}[]:,'.includes(char)) return { type: char };
    if (char === '"') return { type: 'value', value: await this.string() };
    let raw = char;
    while (true) {
      const next = await this.take();
      if (next == null || /\s/.test(next) || '{}[]:,'.includes(next)) {
        if (next != null && '{}[]:,'.includes(next)) this.position -= 1;
        break;
      }
      raw += next; if (raw.length > 128) throw new SyntaxError('A JSON primitive is too long.');
    }
    try {
      const value = JSON.parse(raw);
      if (typeof value === 'number' && !Number.isFinite(value)) throw new Error();
      return { type: 'value', value };
    } catch { throw new SyntaxError(`Invalid JSON value ${raw.slice(0, 40)}.`); }
  }

  async string() {
    let value = '';
    while (true) {
      const char = await this.take();
      if (char == null) throw new SyntaxError('The JSON file ends inside a string.');
      if (char === '"') return value;
      if (char.charCodeAt(0) < 0x20) throw new SyntaxError('A JSON string contains an unescaped control character.');
      if (char !== '\\') value += char;
      else {
        const escaped = await this.take();
        const simple = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
        if (Object.hasOwn(simple, escaped)) value += simple[escaped];
        else if (escaped === 'u') {
          let hex = ''; for (let index = 0; index < 4; index += 1) hex += await this.take() ?? '';
          if (!/^[0-9a-f]{4}$/i.test(hex)) throw new SyntaxError('A JSON string has an invalid Unicode escape.');
          value += String.fromCharCode(Number.parseInt(hex, 16));
        } else throw new SyntaxError('A JSON string has an invalid escape.');
      }
      if (value.length > MAX_STRING_LENGTH) throw new RangeError('A JSON string exceeds the 16 MB per-value limit.');
    }
  }
}

class JsonParser {
  constructor(stream, progress) { this.tokens = new JsonTokenizer(stream, progress); this.lookahead = null; }
  async next() { if (this.lookahead) { const token = this.lookahead; this.lookahead = null; return token; } return this.tokens.next(); }
  async peek() { this.lookahead ||= await this.tokens.next(); return this.lookahead; }
  async expect(type) { const token = await this.next(); if (token.type !== type) throw new SyntaxError(`Expected JSON ${type} but found ${token.type}.`); return token; }

  async value(depth = 0, budget = { nodes: 0 }) {
    if (depth > 64) throw new RangeError('JSON nesting exceeds 64 levels.');
    budget.nodes += 1; if (budget.nodes > MAX_VALUE_NODES) throw new RangeError('One JSON record is too complex to validate safely.');
    const token = await this.next();
    if (token.type === 'value') return token.value;
    if (token.type === '[') {
      const output = []; if ((await this.peek()).type === ']') { await this.next(); return output; }
      while (true) { output.push(await this.value(depth + 1, budget)); const separator = await this.next(); if (separator.type === ']') return output; if (separator.type !== ',') throw new SyntaxError('Expected a comma or closing bracket in a JSON array.'); }
    }
    if (token.type === '{') {
      const output = {}; const keys = new Set(); if ((await this.peek()).type === '}') { await this.next(); return output; }
      while (true) {
        const key = await this.expect('value'); if (typeof key.value !== 'string') throw new SyntaxError('JSON object keys must be strings.');
        if (keys.has(key.value)) throw new SyntaxError(`Duplicate JSON key ${key.value}.`); keys.add(key.value);
        await this.expect(':'); output[key.value] = await this.value(depth + 1, budget);
        const separator = await this.next(); if (separator.type === '}') return output; if (separator.type !== ',') throw new SyntaxError('Expected a comma or closing brace in a JSON object.');
      }
    }
    throw new SyntaxError(`Unexpected JSON token ${token.type}.`);
  }

  async arrayItems(callback) {
    await this.expect('['); let count = 0;
    if ((await this.peek()).type === ']') { await this.next(); return count; }
    while (true) {
      await callback(await this.value(), count); count += 1;
      const separator = await this.next(); if (separator.type === ']') return count; if (separator.type !== ',') throw new SyntaxError('Expected a comma or closing bracket in a streamed JSON array.');
    }
  }
}

export async function validateHptJsonStream(blob, onProgress) {
  const out = collector(); const parser = new JsonParser(blob.stream(), onProgress); const metadata = {}; const keys = new Set();
  let chargeCount = null; let modifierCount = 0;
  try {
    await parser.expect('{');
    if ((await parser.peek()).type !== '}') while (true) {
      const keyToken = await parser.expect('value'); if (typeof keyToken.value !== 'string') throw new SyntaxError('JSON object keys must be strings.');
      const key = keyToken.value; if (keys.has(key)) throw new SyntaxError(`Duplicate JSON key ${key}.`); keys.add(key); await parser.expect(':');
      if (key === 'standard_charge_information') chargeCount = await parser.arrayItems((item, index) => validateJsonStandardItem(item, index, out.add));
      else if (key === 'modifier_information') modifierCount = await parser.arrayItems((item, index) => validateJsonModifier(item, index, out.add));
      else metadata[key] = await parser.value();
      const separator = await parser.next(); if (separator.type === '}') break; if (separator.type !== ',') throw new SyntaxError('Expected a comma or closing brace in the JSON root.');
    } else await parser.next();
    if ((await parser.next()).type !== 'eof') throw new SyntaxError('Unexpected content follows the JSON root object.');
    validateJsonMetadata(metadata, out.add);
    if (!chargeCount) out.add('required', '$.standard_charge_information', 'At least one standard charge item is required.');
  } catch (error) {
    out.add('invalid_json', '$', error instanceof Error ? error.message : String(error));
  }
  return out.result({ format: 'JSON', rowCount: chargeCount || 0, modifierCount, bytesRead: parser.tokens.bytes });
}

async function* csvRecords(stream, onProgress) {
  const reader = stream.getReader(); const decoder = new TextDecoder('utf-8', { fatal: true });
  let row = []; let field = ''; let quoted = false; let afterQuote = false; let ignoreLf = false; let first = true; let bytes = 0; let ended = false;
  const emitField = () => { row.push(field); field = ''; afterQuote = false; };
  while (!ended) {
    const result = await reader.read(); ended = result.done;
    const chunk = ended ? decoder.decode() : decoder.decode(result.value, { stream: true });
    if (!ended) { bytes += result.value.byteLength; onProgress?.(bytes); }
    for (let index = 0; index < chunk.length; index += 1) {
      let char = chunk[index];
      if (first) { first = false; if (char === '\uFEFF') continue; }
      if (ignoreLf) { ignoreLf = false; if (char === '\n') continue; }
      if (quoted) {
        if (char === '"') { quoted = false; afterQuote = true; } else field += char;
      } else if (afterQuote) {
        if (char === '"') { field += '"'; quoted = true; afterQuote = false; }
        else if (char === ',') emitField();
        else if (char === '\n' || char === '\r') { emitField(); yield row; row = []; if (char === '\r') ignoreLf = true; }
        else throw new SyntaxError('A quoted CSV field has characters after its closing quote.');
      } else if (char === ',' ) emitField();
      else if (char === '\n' || char === '\r') { emitField(); yield row; row = []; if (char === '\r') ignoreLf = true; }
      else if (char === '"') { if (field) throw new SyntaxError('A CSV quote appears inside an unquoted field.'); quoted = true; }
      else field += char;
      if (field.length > MAX_STRING_LENGTH) throw new RangeError('A CSV field exceeds the 16 MB per-value limit.');
    }
  }
  if (quoted) throw new SyntaxError('The CSV file ends inside a quoted field.');
  if (field || row.length || afterQuote) { emitField(); yield row; }
}

export async function validateHptCsvStream(blob, onProgress) {
  const out = collector(); let rowNumber = 0; let state = null; let rowCount = 0;
  try {
    let generalHeaders; let generalValues;
    for await (const row of csvRecords(blob.stream(), onProgress)) {
      rowNumber += 1;
      if (rowNumber === 1) generalHeaders = row;
      else if (rowNumber === 2) generalValues = row;
      else if (rowNumber === 3) state = prepareCsv(generalHeaders, generalValues, row, out.add);
      else { if (!state) throw new SyntaxError('The CSV file is missing its three header rows.'); validateCsvRow(row, state, rowNumber, out.add); rowCount += 1; }
    }
    if (rowNumber < 3) out.add('missing_rows', 'file', 'The CSV file must contain general headers, general values, and charge headers.');
    else if (!rowCount) out.add('required', 'row 4', 'At least one standard charge row is required.');
  } catch (error) {
    out.add('invalid_csv', `row ${Math.max(1, rowNumber)}`, error instanceof Error ? error.message : String(error));
  }
  return out.result({ format: state?.tall ? 'CSV tall' : 'CSV wide', rowCount, bytesRead: blob.size });
}

export async function validateHptFile(blob, onProgress) {
  if (!(blob instanceof Blob)) throw new TypeError('Choose a CSV or JSON hospital price file.');
  const name = String(blob.name || '').toLowerCase();
  if (name.endsWith('.json') || blob.type === 'application/json') return validateHptJsonStream(blob, onProgress);
  if (name.endsWith('.csv') || blob.type === 'text/csv' || blob.type === 'application/csv') return validateHptCsvStream(blob, onProgress);
  const prefix = new TextDecoder().decode(new Uint8Array(await blob.slice(0, 256).arrayBuffer())).replace(/^\uFEFF/, '').trimStart();
  return prefix.startsWith('{') ? validateHptJsonStream(blob, onProgress) : validateHptCsvStream(blob, onProgress);
}
