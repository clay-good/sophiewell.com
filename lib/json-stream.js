// spec-v1626: the bounded-memory JSON tokenizer and parser, extracted unchanged from
// lib/hpt-stream-v1515.js so other file tools (hpt-price-compare) can stream JSON the same way.
// A value is read whole only when asked for; arrayItems() walks a top-level array item by item.

const MAX_VALUE_NODES = 250000;
const MAX_STRING_LENGTH = 16 * 1024 * 1024;

export class JsonTokenizer {
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

export class JsonParser {
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
