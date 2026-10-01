// spec-v1515: bounded-memory stream readers for CMS HPT CSV and JSON files.
import { prepareCsv, validateCsvRow, validateJsonMetadata, validateJsonModifier, validateJsonStandardItem } from './hpt-v1515.js';
import { JsonParser } from './json-stream.js';

const MAX_FINDINGS = 200;
const MAX_STRING_LENGTH = 16 * 1024 * 1024;

function collector() {
  const findings = []; let errorCount = 0;
  return {
    add(code, location, message) { errorCount += 1; if (findings.length < MAX_FINDINGS) findings.push({ code, location, message }); },
    result(extra) { return { ...extra, valid: errorCount === 0, errorCount, findings, findingsTruncated: errorCount > findings.length }; },
  };
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

export async function* csvRecords(stream, onProgress) {
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
