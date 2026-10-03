// scripts/data/builders/pas-profiles.mjs -- spec-v1517 (route A), for spec-v1515 pas-bundle-check.
//
// The HL7 Da Vinci Prior Authorization Support implementation guide's StructureDefinitions, pinned to a
// published version (CC0), from the FHIR package registry. One record per profile and extension: its url,
// name, resource type and the snapshot reduced to what lib/fhir-profile-check.js reads (ids, paths,
// cardinality, types, fixed and pattern values, slicing, required bindings, and the count of error
// invariants it does not evaluate). The guide's own value sets that can be listed from its code systems
// go in valuesets.json. A new version is a new pin: change PIN and the canaries together.

import { tarEntries } from '../zip.mjs';

export const PIN = '2.2.1';
const PACKAGE = 'hl7.fhir.us.davinci-pas';
export const SOURCE = `https://packages.fhir.org/${PACKAGE}/${PIN}`;
const addMonths = (iso, n) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 10); };

export async function discover() {
  return { url: SOURCE, edition: `${PACKAGE} ${PIN}`, expiresOn: null };
}

const json = (e) => JSON.parse(e.data.toString('utf8'));

export function reduce(sd) {
  return (sd.snapshot ? sd.snapshot.element : []).map((e) => {
    const r = { id: e.id, path: e.path, min: e.min, max: e.max };
    if (e.sliceName) r.slice = e.sliceName;
    if (e.slicing) r.slicing = { d: e.slicing.discriminator || [], rules: e.slicing.rules };
    if (e.type) r.type = e.type.map((t) => Object.fromEntries(Object.entries(t).filter(([k]) => ['code', 'profile', 'targetProfile'].includes(k))));
    for (const [k, v] of Object.entries(e)) if (k.startsWith('fixed') || k.startsWith('pattern')) r[k] = v;
    if (e.binding && e.binding.strength === 'required' && e.binding.valueSet) r.binding = e.binding.valueSet;
    const inv = (e.constraint || []).filter((c) => c.severity === 'error').length;
    if (inv) r.inv = inv;
    return r;
  });
}

export async function parse(bytes, found = {}, { bounds = true } = {}) {
  const entries = tarEntries(bytes).filter((e) => /^package\/[^/]+\.json$/.test(e.name));
  const pkg = entries.find((e) => e.name === 'package/package.json');
  if (!pkg) throw new Error('pas-profiles: no package/package.json');
  const meta = json(pkg);
  if (meta.name !== PACKAGE || meta.version !== PIN) throw new Error(`pas-profiles: package is ${meta.name} ${meta.version}, not ${PACKAGE} ${PIN}`);
  const records = []; const codeSystems = {}; const valueSetsRaw = [];
  for (const e of entries) {
    const base = e.name.slice('package/'.length);
    if (base.startsWith('StructureDefinition-')) {
      const sd = json(e);
      if (!sd.snapshot) continue;
      records.push({ url: sd.url, name: sd.title || sd.name, type: sd.type, kind: sd.kind, elements: reduce(sd) });
    } else if (base.startsWith('CodeSystem-')) {
      const cs = json(e); codeSystems[cs.url] = (cs.concept || []).map((c) => c.code);
    } else if (base.startsWith('ValueSet-')) valueSetsRaw.push(json(e));
  }
  const valueSets = {};
  for (const vs of valueSetsRaw) {
    const codes = []; let listable = true;
    for (const inc of (vs.compose && vs.compose.include) || []) {
      if (inc.concept) codes.push(...inc.concept.map((c) => c.code));
      else if (codeSystems[inc.system] && !inc.filter && !inc.valueSet) codes.push(...codeSystems[inc.system]);
      else listable = false;
    }
    if (listable && codes.length) valueSets[vs.url] = { name: vs.title || vs.name, codes };
  }
  records.sort((a, b) => a.url.localeCompare(b.url));
  if (bounds && (records.length < 60 || records.length > 150)) throw new Error(`pas-profiles: ${records.length} definitions, outside 60-150`);
  // The package's own date is the edition's; a pinned guide is reviewed every two years at the latest.
  const date = String(meta.date || '').replace(/^(\d{4})(\d{2})(\d{2}).*$/, '$1-$2-$3');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('pas-profiles: package.json has no date');
  found.edition = `${PACKAGE} ${PIN} (${date})`;
  found.effectiveFrom = date;
  found.expiresOn = addMonths(date, 24);
  return { records, ancillary: { 'valuesets.json': valueSets } };
}

const minOf = (url, id) => (records) => ((records.find((r) => r.url === url) || { elements: [] }).elements.find((e) => e.id === id) || {}).min;

export default {
  id: 'pas-profiles',
  label: 'HL7 Da Vinci Prior Authorization Support profiles',
  agency: 'HL7',
  sourceUrl: SOURCE,
  status: 'cc0',
  cadence: 'pinned',
  notes: 'StructureDefinitions of the Da Vinci PAS implementation guide at the pinned version, snapshots reduced to cardinality, types, fixed and pattern values, slicing and required bindings; listable value sets in valuesets.json. FHIRPath invariants are counted, not evaluated.',
  recordBounds: { min: 60, max: 150 },
  shardKey: () => 'profiles',
  discover,
  parse,
  shape: (r) => (r.url && r.type && Array.isArray(r.elements) && r.elements.length ? null : 'a definition without url, type or elements'),
  stableCanaries: [
    { label: 'A PAS Claim needs a patient', value: minOf('http://hl7.org/fhir/us/davinci-pas/StructureDefinition/profile-claim', 'Claim.patient'), expect: 1 },
  ],
  canaries: null,
};
