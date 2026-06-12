// URL-hash helpers per spec-v2 section 4.3 (and spec-v6 §4.2.2,
// spec-v7 §3.4). spec-v8 §3.2 removed the `p=` pinned-list key from
// the writer; the parser still tolerates it so old `#p=icd10,bmi`
// bookmarks resolve to the home view rather than 404-ing.
//
// The fragment encodes:
//   - the route id, optionally with a sub-segment (e.g. "icd10" or "icd10/I10")
//   - the calculator state per route id:                 q=key=value;key=value
//   - the audience filter chip (spec-v6 §4.2.2):         a=patient
//   - the browse-disclosure state (spec-v7 §3.4):        b=open
//
// Examples:
//   #bmi&q=w=70;h=1.75
//   #icd10/I10
//   #&a=patients&b=open
//
// We pick "&" + "q=key=value;key=value" rather than a real query string
// because the fragment is supposed to be opaque to servers; using "?" inside
// the fragment is legal but some user agents try to parse it. Semicolons
// are URI-safe.

// spec-v29 §5.3: the default-selected audience chip on first visit is
// 'nurse' (the nurse-first pivot). parseHash returns 'nurse' as the
// implicit default and buildHash omits the `a=` segment when the audience
// equals that default.
const DEFAULT_AUDIENCE = 'nurse';

// decodeURIComponent throws URIError on a malformed escape (a stray "%",
// a truncated "%E0%A4", or invalid UTF-8 like "#%FF"). Such fragments reach
// parseHash from corrupted bookmarks, hand-truncated share links, or fuzzers,
// and an uncaught throw here propagates into boot()/route() and white-screens
// the page. Per this file's own contract (a fragment the parser cannot make
// sense of resolves to the home view, never a crash), fall back to the raw,
// still-encoded segment: route lookup then simply misses and lands on home.
function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function parseHash(raw) {
  const s = String(raw || '').replace(/^#/, '');
  if (!s) return { route: '', sub: '', state: {}, audience: DEFAULT_AUDIENCE, browse: '' };
  const parts = s.split('&');
  // The first segment is the route unless it carries an `&`-style key
  // (q=/a=/b=, or legacy p=), which happens when buildHash drops an
  // empty route (e.g. "#a=doctor").
  const headIsKeyed = /^[pqab]=/.test(parts[0] || '');
  const head = headIsKeyed ? '' : (parts[0] || '');
  const [route, sub = ''] = head.split('/');
  let state = {};
  let audience = DEFAULT_AUDIENCE;
  let browse = '';
  const tail = headIsKeyed ? parts : parts.slice(1);
  for (const p of tail) {
    if (p.startsWith('p=')) {
      // spec-v8 §3.2: pinned tile list removed. Silently ignore so
      // old `#p=icd10,bmi` bookmarks resolve to the home view.
      continue;
    } else if (p.startsWith('q=')) {
      const body = safeDecode(p.slice(2));
      for (const pair of body.split(';')) {
        if (!pair) continue;
        const eq = pair.indexOf('=');
        if (eq < 0) continue;
        state[pair.slice(0, eq)] = pair.slice(eq + 1);
      }
    } else if (p.startsWith('a=')) {
      const v = safeDecode(p.slice(2));
      if (v) audience = v;
    } else if (p.startsWith('b=')) {
      // spec-v7 section 3.4: browse-disclosure state. Only "open" or "closed"
      // are meaningful values; anything else is treated as the default (collapsed).
      const v = safeDecode(p.slice(2));
      if (v === 'open' || v === 'closed') browse = v;
    }
  }
  return { route: safeDecode(route), sub: safeDecode(sub), state, audience, browse };
}

export function buildHash({ route = '', sub = '', state = {}, audience = DEFAULT_AUDIENCE, browse = '' } = {}) {
  const parts = [];
  let head = encodeURIComponent(route);
  if (sub) head += '/' + encodeURIComponent(sub);
  parts.push(head);
  const stateKeys = Object.keys(state || {});
  if (stateKeys.length) {
    const body = stateKeys.map((k) => `${k}=${state[k]}`).join(';');
    parts.push('q=' + encodeURIComponent(body));
  }
  if (audience && audience !== DEFAULT_AUDIENCE) parts.push('a=' + encodeURIComponent(audience));
  // spec-v7 section 3.4: emit b= only when the user diverges from the
  // static-markup default. Markup currently ships open; b=closed is the
  // explicit collapse, b=open is the deep-link form for the eventual
  // default-collapsed front door.
  if (browse === 'open' || browse === 'closed') parts.push('b=' + browse);
  return '#' + parts.filter(Boolean).join('&');
}

// Convenience for callers that only want to mutate one piece of the hash.
export function patchHash(patch) {
  const cur = parseHash(window.location.hash);
  return buildHash({ ...cur, ...patch });
}
