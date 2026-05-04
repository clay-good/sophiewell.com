// URL-hash helpers per spec-v2 sections 4.1, 4.3.
//
// The fragment encodes three independent things, separated by `&`:
//   - the route id, optionally with a sub-segment (e.g. "icd10" or "icd10/I10")
//   - the pinned tile list:                              p=icd10,bmi,egfr
//   - the calculator state per route id:                 q=key=value;key=value
//
// Examples:
//   #bmi&q=w=70;h=1.75
//   #p=icd10,bmi,egfr
//   #icd10/I10&p=icd10,bmi
//
// We pick "&" + "q=key=value;key=value" rather than a real query string
// because the fragment is supposed to be opaque to servers; using "?" inside
// the fragment is legal but some user agents try to parse it. Semicolons
// are URI-safe.

export function parseHash(raw) {
  const s = String(raw || '').replace(/^#/, '');
  if (!s) return { route: '', sub: '', pinned: [], state: {} };
  const parts = s.split('&');
  const head = parts[0] || '';
  const [route, sub = ''] = head.split('/');
  let pinned = [];
  let state = {};
  for (const p of parts.slice(1)) {
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
    }
  }
  return { route: decodeURIComponent(route), sub: decodeURIComponent(sub), pinned, state };
}

export function buildHash({ route = '', sub = '', pinned = [], state = {} } = {}) {
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
  return '#' + parts.filter(Boolean).join('&');
}

// Convenience for callers that only want to mutate one piece of the hash.
export function patchHash(patch) {
  const cur = parseHash(window.location.hash);
  return buildHash({ ...cur, ...patch });
}
