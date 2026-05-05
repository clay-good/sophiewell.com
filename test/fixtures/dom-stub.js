// Minimal DOM stub for unit-testing the v4 shared renderers.
// Mirrors only the surface that lib/dom.js's `el()` helper and the renderers use:
// createElement, createTextNode, appendChild, removeChild, setAttribute,
// addEventListener/dispatchEvent, classList shims, querySelector/querySelectorAll
// (id and class), textContent, children, tagName, value, checked, type, etc.
//
// This is not a real DOM; it intentionally implements only what the renderers
// touch. If a renderer uses something new, extend here.

class Node {
  constructor() {
    this.parentNode = null;
    this.childNodes = [];
    this._text = '';
    this.nodeType = 1;
  }
  get textContent() {
    if (this.nodeType === 3) return this._text;
    return this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    if (this.nodeType === 3) { this._text = String(v); return; }
    this.childNodes = [];
    if (v != null && v !== '') this.appendChild(new TextNode(String(v)));
  }
  get innerText() { return this.textContent; }
  appendChild(child) {
    if (child == null) return child;
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
  removeChild(child) {
    const i = this.childNodes.indexOf(child);
    if (i >= 0) {
      this.childNodes.splice(i, 1);
      child.parentNode = null;
    }
    return child;
  }
  get firstChild() { return this.childNodes[0] || null; }
  get children() {
    const arr = this.childNodes.filter((n) => n.nodeType === 1);
    arr.item = (i) => arr[i];
    return arr;
  }
}

class TextNode extends Node {
  constructor(t) { super(); this.nodeType = 3; this._text = String(t); }
}

class Element extends Node {
  constructor(tag) {
    super();
    this.tagName = String(tag).toUpperCase();
    this.attributes = {};
    this._listeners = {};
    this.className = '';
    this.id = '';
    this.style = {};
    this.dataset = {};
    this._value = '';
    this.checked = false;
    this.type = '';
    this.tabIndex = -1;
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k === 'id') this.id = String(v);
    if (k === 'class') this.className = String(v);
    if (k === 'type') this.type = String(v);
    if (k === 'value') this._value = String(v);
  }
  getAttribute(k) { return Object.hasOwn(this.attributes, k) ? this.attributes[k] : null; }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  removeAttribute(k) { delete this.attributes[k]; }
  get value() { return this._value; }
  set value(v) { this._value = String(v); }
  addEventListener(type, fn) {
    (this._listeners[type] ||= []).push(fn);
  }
  removeEventListener(type, fn) {
    const arr = this._listeners[type] || [];
    const i = arr.indexOf(fn);
    if (i >= 0) arr.splice(i, 1);
  }
  dispatchEvent(event) {
    const arr = this._listeners[event.type] || [];
    for (const fn of arr.slice()) fn.call(this, event);
    return true;
  }
  click() { this.dispatchEvent({ type: 'click', preventDefault() {}, stopPropagation() {} }); }
  // querySelector: supports `#id`, `.class`, `tag`. No combinators.
  querySelector(sel) {
    const matches = (n) => {
      if (n.nodeType !== 1) return false;
      if (sel.startsWith('#')) return n.id === sel.slice(1);
      if (sel.startsWith('.')) return (n.className || '').split(/\s+/).includes(sel.slice(1));
      return n.tagName === sel.toUpperCase();
    };
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (matches(c)) return c;
        const r = walk(c);
        if (r) return r;
      }
      return null;
    };
    return walk(this);
  }
  querySelectorAll(sel) {
    const out = [];
    const matches = (n) => {
      if (n.nodeType !== 1) return false;
      if (sel.startsWith('#')) return n.id === sel.slice(1);
      if (sel.startsWith('.')) return (n.className || '').split(/\s+/).includes(sel.slice(1));
      return n.tagName === sel.toUpperCase();
    };
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (matches(c)) out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
}

class DocumentStub {
  constructor() {
    this.body = new Element('body');
    this._byId = new Map();
  }
  createElement(tag) { return new Element(tag); }
  createTextNode(t) { return new TextNode(t); }
  getElementById(id) {
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (c.id === id) return c;
        const r = walk(c);
        if (r) return r;
      }
      return null;
    };
    return walk(this.body);
  }
}

export function installDom() {
  const doc = new DocumentStub();
  globalThis.document = doc;
  globalThis.Event = class { constructor(type) { this.type = type; } };
  globalThis.window = globalThis.window || {
    location: { hash: '' },
    history: { replaceState() {} },
    print() { globalThis.__printed = (globalThis.__printed || 0) + 1; },
  };
  // Stub CSS.escape used by screener.js.
  if (!globalThis.CSS) globalThis.CSS = { escape: (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&') };
  return doc;
}

export function makeDiv() {
  return new Element('div');
}
