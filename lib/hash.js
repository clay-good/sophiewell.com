// URL-hash helpers per spec-v2 sections 4.1, 4.3.
//
// The fragment encodes four independent things, separated by `&`:
//   - the route id, optionally with a sub-segment (e.g. "icd10" or "icd10/I10")
//   - the pinned tile list:                              p=icd10,bmi,egfr
//   - the calculator state per route id:                 q=key=value;key=value
//   - the audience filter chip (spec-v6 §4.2.2):         a=patient
//   - the browse-disclosure state (spec-v7 §3.4):        b=open
//
// Examples:
//   #bmi&q=w=70;h=1.75
//   #p=icd10,bmi,egfr
//   #icd10/I10&p=icd10,bmi
//   #&a=patients&b=open
//
// We pick "&" + "q=key=value;key=value" rather than a real query string
// because the fragment is supposed to be opaque to servers; using "?" inside
// the fragment is legal but some user agents try to parse it. Semicolons
// are URI-safe.

export function parseHash(raw) {
  const s = String(raw || '').replace(/^#/, '');
  if (!s) return { route: '', sub: '', pinned: [], state: {}, audience: 'all', browse: '' };
  const parts = s.split('&');
  // The first segment is the route unless it carries an `&`-style key (p=/q=/a=/b=),
  // which happens when buildHash drops an empty route (e.g. "#p=bmi").
  const headIsKeyed = /^[pqab]=/.test(parts[0] || '');
  const head = headIsKeyed ? '' : (parts[0] || '');
  const [route, sub = ''] = head.split('/');
  let pinned = [];
  let state = {};
  let audience = 'all';
  let browse = '';
  const tail = headIsKeyed ? parts : parts.slice(1);
  for (const p of tail) {
    if (p.startsWith('p=')) {
      pinned = decodeURIComponent(p.slice(2)).split(',').filter(Boolean);
    } else if (p.startsWith('q=')) {
      const body = decodeURIComponent(p.slice(2));
      for (const pair of body.split(';')) {
        if (!pair) continue;
        const eq = pair.indexOf('=');
        if (eq < 0) continue;
        state[pair.slice(0, eq)] = pair.slice(eq + 1);
      }
    } else if (p.startsWith('a=')) {
      const v = decodeURIComponent(p.slice(2));
      if (v) audience = v;
    } else if (p.startsWith('b=')) {
      // spec-v7 section 3.4: browse-disclosure state. Only "open" or "closed"
      // are meaningful values; anything else is treated as the default (closed).
      const v = decodeURIComponent(p.slice(2));
      if (v === 'open' || v === 'closed') browse = v;
    }
  }
  return { route: decodeURIComponent(route), sub: decodeURIComponent(sub), pinned, state, audience, browse };
}

export function buildHash({ route = '', sub = '', pinned = [], state = {}, audience = 'all', browse = '' } = {}) {
  const parts = [];
  let head = encodeURIComponent(route);
  if (sub) head += '/' + encodeURIComponent(sub);
  parts.push(head);
  if (pinned && pinned.length) parts.push('p=' + encodeURIComponent(pinned.join(',')));
  const stateKeys = Object.keys(state || {});
  if (stateKeys.length) {
    const body = stateKeys.map((k) => `${k}=${state[k]}`).join(';');
    parts.push('q=' + encodeURIComponent(body));
  }
  if (audience && audience !== 'all') parts.push('a=' + encodeURIComponent(audience));
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
