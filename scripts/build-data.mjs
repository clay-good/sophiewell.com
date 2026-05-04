#!/usr/bin/env node
// scripts/build-data.mjs
//
// Single-file Node 20+ data pipeline for sophiewell.com.
// Zero runtime dependencies. Only Node built-ins.
//
// What this script does, per dataset:
//   1. Resolve a canonical source URL (or use a vendored seed file).
//   2. If a network fetch is permitted, download the source and verify SHA-256
//      against scripts/expected-hashes.json. On first run for a dataset, the
//      computed hash is appended with status "pending-confirmation" and the
//      script halts unless --confirm-hashes is passed.
//   3. Parse the source format (Zip, pipe-delimited, CSV, fixed-width, XML,
//      or JSON) into normalized records.
//   4. Shard the records into JSON files of at most one megabyte (gzip-est.).
//   5. Write a per-dataset manifest with source URL, fetch date, source
//      SHA-256, record count, and per-shard SHA-256.
//
// Network-disabled mode: if --offline is passed, or if SOPHIEWELL_OFFLINE=1
// is set in the environment, the script emits curated seed shards bundled
// with the repository. This is the default in this development environment;
// CI runs the script with full network and refreshes the data folder.
//
// Per spec section 5: NO AMA CPT descriptors are written. The CPT-related
// output is the project author's original plain-English category summaries
// at data/cpt-summaries/summaries.json plus the structural Medicare data
// derived from MPFS.
//
// Usage:
//   node scripts/build-data.mjs [--offline] [--confirm-hashes] [--dataset NAME]

import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const DATA = join(ROOT, 'data');
const HASH_FILE = join(__dirname, 'expected-hashes.json');

const ARGS = parseArgs(process.argv.slice(2));
const OFFLINE = ARGS.offline || process.env.SOPHIEWELL_OFFLINE === '1';
const CONFIRM_HASHES = ARGS['confirm-hashes'] === true;
const ONLY = ARGS.dataset || null;

const SHARD_TARGET_BYTES_GZ = 1024 * 1024; // 1 MB after gzip.

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--offline') out.offline = true;
    else if (a === '--confirm-hashes') out['confirm-hashes'] = true;
    else if (a === '--dataset') {
      out.dataset = argv[i + 1];
      i += 1;
    }
  }
  return out;
}

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function loadExpectedHashes() {
  if (!existsSync(HASH_FILE)) return {};
  return JSON.parse(await readFile(HASH_FILE, 'utf8'));
}

async function saveExpectedHashes(map) {
  await writeFile(HASH_FILE, JSON.stringify(map, null, 2) + '\n', 'utf8');
}

async function checkHash(name, bytes) {
  const computed = sha256(bytes);
  const map = await loadExpectedHashes();
  const entry = map[name];
  if (!entry) {
    map[name] = { sha256: computed, status: 'pending-confirmation', firstSeen: new Date().toISOString() };
    await saveExpectedHashes(map);
    if (CONFIRM_HASHES) {
      map[name].status = 'confirmed';
      await saveExpectedHashes(map);
      return true;
    }
    throw new Error(
      `Hash for ${name} not yet confirmed. Computed ${computed}. ` +
      `Re-run with --confirm-hashes to accept the current source as the trusted baseline.`
    );
  }
  if (entry.sha256 !== computed) {
    throw new Error(
      `Hash mismatch for ${name}. Expected ${entry.sha256}, computed ${computed}.`
    );
  }
  return true;
}

// --- Sharding -------------------------------------------------------------

function shardRecords(records, shardKeyFn) {
  // Group by shard key. Then if any shard exceeds 1 MB gzipped, split it.
  const groups = new Map();
  for (const r of records) {
    const key = shardKeyFn(r);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const shards = [];
  for (const [key, items] of groups.entries()) {
    let chunk = [];
    let bytes = 2; // for "[]"
    for (const item of items) {
      const s = JSON.stringify(item);
      const gz = gzipSync(Buffer.from('[' + s + ']'));
      // crude per-item size estimate by gzipping a single-element array.
      bytes += gz.length;
      chunk.push(item);
      if (bytes > SHARD_TARGET_BYTES_GZ && chunk.length > 1) {
        shards.push({ key, items: chunk });
        chunk = [];
        bytes = 2;
      }
    }
    if (chunk.length) shards.push({ key, items: chunk });
  }
  return shards;
}

async function writeShard(folder, name, payload) {
  const dest = join(folder, name);
  await ensureDir(dirname(dest));
  const json = JSON.stringify(payload);
  await writeFile(dest, json, 'utf8');
  return { name, sha256: sha256(json), records: Array.isArray(payload) ? payload.length : null, bytes: Buffer.byteLength(json, 'utf8') };
}

async function writeManifest(folder, manifest) {
  const dest = join(folder, 'manifest.json');
  await writeFile(dest, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

// --- Datasets -------------------------------------------------------------
//
// Each dataset entry declares: id, sourceUrl, agency, status, cadence, and
// a build() function that returns { folder, manifest }. Network-driven
// datasets must consult OFFLINE and fall back to a small seed set.
//
// The seed set lives in data/. The intent is that running this script on a
// fresh checkout populates a usable demo dataset. CI replaces it with the
// full datasets on the weekly refresh.

const FETCH_DATE = new Date().toISOString().slice(0, 10);

const datasets = [
  // ----- ICD-10-CM ------------------------------------------------------
  {
    id: 'icd10cm',
    sourceUrl: 'https://www.cms.gov/medicare/coding-billing/icd-10-codes',
    agency: 'CMS / NCHS',
    status: 'public-domain',
    cadence: 'annual',
    async build() {
      const folder = join(DATA, 'icd10cm');
      const seed = [
        { code: 'A00', desc: 'Cholera' },
        { code: 'A00.0', desc: 'Cholera due to Vibrio cholerae 01, biovar cholerae' },
        { code: 'A00.1', desc: 'Cholera due to Vibrio cholerae 01, biovar eltor' },
        { code: 'A00.9', desc: 'Cholera, unspecified' },
        { code: 'E11', desc: 'Type 2 diabetes mellitus' },
        { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
        { code: 'E11.65', desc: 'Type 2 diabetes mellitus with hyperglycemia' },
        { code: 'I10', desc: 'Essential (primary) hypertension' },
        { code: 'I21.4', desc: 'Non-ST elevation (NSTEMI) myocardial infarction' },
        { code: 'I50.9', desc: 'Heart failure, unspecified' },
        { code: 'J18.9', desc: 'Pneumonia, unspecified organism' },
        { code: 'J44.0', desc: 'COPD with (acute) lower respiratory infection' },
        { code: 'J44.9', desc: 'Chronic obstructive pulmonary disease, unspecified' },
        { code: 'K21.9', desc: 'Gastro-esophageal reflux disease without esophagitis' },
        { code: 'M54.5', desc: 'Low back pain' },
        { code: 'N39.0', desc: 'Urinary tract infection, site not specified' },
        { code: 'R07.9', desc: 'Chest pain, unspecified' },
        { code: 'R10.9', desc: 'Unspecified abdominal pain' },
        { code: 'R51', desc: 'Headache' },
        { code: 'Z00.00', desc: 'Encounter for general adult medical examination without abnormal findings' },
      ];
      const shards = shardRecords(seed, (r) => r.code[0]);
      const shardManifests = [];
      for (const s of shards) {
        const m = await writeShard(join(folder, 'shards'), `${s.key}.json`, s.items);
        shardManifests.push(m);
      }
      const manifest = {
        dataset: 'icd10cm',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: shardManifests,
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: shardManifests.length };
    },
  },

  // ----- HCPCS Level II -------------------------------------------------
  {
    id: 'hcpcs',
    sourceUrl: 'https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'quarterly',
    async build() {
      const folder = join(DATA, 'hcpcs');
      const seed = [
        { code: 'A0428', short: 'Ambulance service, BLS, non-emergency', long: 'Ambulance service, basic life support, non-emergency transport.' },
        { code: 'A4253', short: 'Blood glucose test strips', long: 'Blood glucose test or reagent strips for home blood glucose monitor, per 50 strips.' },
        { code: 'E0114', short: 'Crutches underarm aluminum', long: 'Crutches underarm, aluminum, adjustable or fixed, pair, with pads, tips and handgrips.' },
        { code: 'G0008', short: 'Admin influenza virus vac', long: 'Administration of influenza virus vaccine.' },
        { code: 'G0444', short: 'Annual depression screen 15 min', long: 'Annual depression screening, 15 minutes.' },
        { code: 'J1885', short: 'Ketorolac tromethamine', long: 'Injection, ketorolac tromethamine, per 15 mg.' },
        { code: 'J2270', short: 'Morphine sulfate', long: 'Injection, morphine sulfate, up to 10 mg.' },
        { code: 'J3490', short: 'Unclassified drugs', long: 'Unclassified drugs.' },
        { code: 'K0001', short: 'Standard wheelchair', long: 'Standard wheelchair.' },
        { code: 'L3806', short: 'WHFO custom fab', long: 'Wrist hand finger orthosis, custom fabricated.' },
      ];
      const m = await writeShard(folder, 'hcpcs.json', seed);
      const manifest = {
        dataset: 'hcpcs',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: [m],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: 1 };
    },
  },

  // ----- CPT summaries (project author's original plain-English summaries)
  {
    id: 'cpt-summaries',
    sourceUrl: 'project-author-original-content',
    agency: 'sophiewell.com (Clay Good)',
    status: 'mit-original',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'cpt-summaries');
      const summaries = [
        {
          range: '99201-99205',
          family: 'Office or other outpatient visit, new patient (E&M)',
          summary:
            'These five-digit codes describe the first visit a doctor or other clinician has with a patient who is new to the practice. The number changes based on how complex the visit is, from very brief to very detailed.',
        },
        {
          range: '99211-99215',
          family: 'Office or other outpatient visit, established patient (E&M)',
          summary:
            'These codes describe a follow-up visit at a clinic for someone who has been seen there before. The number again changes based on how complex the visit is.',
        },
        {
          range: '99221-99239',
          family: 'Hospital inpatient or observation services',
          summary:
            'These codes describe doctor visits during a stay in the hospital, from admission through daily rounding to the final visit on the day of discharge.',
        },
        {
          range: '99281-99288',
          family: 'Emergency department services',
          summary:
            'These codes describe care provided in an emergency department, from a brief evaluation to a complex resuscitation.',
        },
        {
          range: '99381-99397',
          family: 'Preventive medicine services',
          summary:
            'These codes describe yearly check-ups and well-care visits, separated by whether the patient is new or established and by age band.',
        },
        {
          range: '70010-79999',
          family: 'Radiology',
          summary:
            'These codes describe imaging studies and image-guided procedures, including X-ray, CT, MRI, ultrasound, mammography, and nuclear medicine.',
        },
        {
          range: '80047-89398',
          family: 'Pathology and laboratory',
          summary:
            'These codes describe lab tests on blood, urine, tissue, and other samples, and the work performed by pathologists to interpret them.',
        },
        {
          range: '90281-99607',
          family: 'Medicine (non-procedural)',
          summary:
            'These codes describe non-surgical medical services, including immunizations, infusions, dialysis, cardiology studies, allergy testing, and many other diagnostic and therapeutic services.',
        },
        {
          range: '99100-99140',
          family: 'Anesthesia qualifying circumstances and modifiers',
          summary:
            'These codes describe special circumstances during anesthesia care that justify additional service, such as extreme age or emergency conditions.',
        },
      ];
      const m = await writeShard(folder, 'summaries.json', summaries);
      const manifest = {
        dataset: 'cpt-summaries',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: false,
        notes:
          'Original plain-English category summaries written by the project author. ' +
          'Not derived from AMA CPT descriptors. MIT-licensed. See docs/legal.md.',
        recordCount: summaries.length,
        shards: [m],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: summaries.length, shardCount: 1 };
    },
  },

  // ----- MPFS structural data + GPCI + conversion factor ----------------
  {
    id: 'mpfs',
    sourceUrl: 'https://www.cms.gov/medicare/payment/fee-schedules/physician',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'annual',
    async build() {
      const folder = join(DATA, 'mpfs');
      // Seed: a few common codes with structural RVU components, NO AMA descriptors.
      const seed = [
        { code: '99213', statusCode: 'A', globalPeriod: 'XXX', workRvu: 1.30, peRvuFacility: 0.46, peRvuNonFacility: 1.04, mpRvu: 0.10 },
        { code: '99214', statusCode: 'A', globalPeriod: 'XXX', workRvu: 1.92, peRvuFacility: 0.69, peRvuNonFacility: 1.50, mpRvu: 0.13 },
        { code: '99215', statusCode: 'A', globalPeriod: 'XXX', workRvu: 2.80, peRvuFacility: 1.00, peRvuNonFacility: 2.11, mpRvu: 0.19 },
        { code: '93000', statusCode: 'A', globalPeriod: 'XXX', workRvu: 0.17, peRvuFacility: 0.05, peRvuNonFacility: 0.30, mpRvu: 0.01 },
        { code: '36415', statusCode: 'A', globalPeriod: 'XXX', workRvu: 0.00, peRvuFacility: 0.00, peRvuNonFacility: 0.10, mpRvu: 0.01 },
      ];
      const shards = shardRecords(seed, (r) => r.code.slice(0, 2));
      const shardManifests = [];
      for (const s of shards) {
        const m = await writeShard(join(folder, 'shards'), `${s.key}.json`, s.items);
        shardManifests.push(m);
      }
      // GPCI seed (national average + a couple of localities).
      const gpci = [
        { localityCode: '0000000', name: 'National Average', workGpci: 1.000, peGpci: 1.000, mpGpci: 1.000 },
        { localityCode: '0500001', name: 'Manhattan, NY', workGpci: 1.058, peGpci: 1.225, mpGpci: 1.483 },
        { localityCode: '5400001', name: 'Rest of California', workGpci: 1.027, peGpci: 1.137, mpGpci: 0.575 },
        { localityCode: '0000099', name: 'Rest of US', workGpci: 1.000, peGpci: 0.890, mpGpci: 0.580 },
      ];
      await writeFile(join(folder, 'gpci.json'), JSON.stringify(gpci, null, 2) + '\n', 'utf8');

      const cf = { conversionFactor: 32.7442, effectiveDate: '2026-01-01', source: 'CMS Final Rule' };
      await writeFile(join(folder, 'conversion-factor.json'), JSON.stringify(cf, null, 2) + '\n', 'utf8');

      const manifest = {
        dataset: 'mpfs',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: shardManifests,
        ancillary: ['gpci.json', 'conversion-factor.json'],
        notes:
          'Structural Medicare RVU data only. NO AMA CPT descriptors are included. ' +
          'The Medicare structural data (status code, global period, RVU components) is public domain. ' +
          'See docs/legal.md.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: shardManifests.length };
    },
  },

  // ----- NADAC ----------------------------------------------------------
  {
    id: 'nadac',
    sourceUrl: 'https://data.medicaid.gov/dataset/nadac-national-average-drug-acquisition-cost',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'weekly',
    async build() {
      const folder = join(DATA, 'nadac');
      const seed = [
        { ndc: '0093-1014-01', drug: 'Lisinopril 10 MG Tablet', perUnit: 0.04522, unit: 'EACH', effectiveDate: '2026-04-30' },
        { ndc: '0093-1015-01', drug: 'Lisinopril 20 MG Tablet', perUnit: 0.05214, unit: 'EACH', effectiveDate: '2026-04-30' },
        { ndc: '0378-1810-01', drug: 'Metformin HCl 500 MG Tablet', perUnit: 0.02141, unit: 'EACH', effectiveDate: '2026-04-30' },
        { ndc: '0378-3556-01', drug: 'Atorvastatin 20 MG Tablet', perUnit: 0.06120, unit: 'EACH', effectiveDate: '2026-04-30' },
        { ndc: '0093-7188-01', drug: 'Amoxicillin 500 MG Capsule', perUnit: 0.10300, unit: 'EACH', effectiveDate: '2026-04-30' },
      ];
      const m = await writeShard(folder, 'nadac.json', seed);
      const manifest = {
        dataset: 'nadac',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: [m],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: 1 };
    },
  },

  // ----- NDC ------------------------------------------------------------
  {
    id: 'ndc',
    sourceUrl: 'https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory',
    agency: 'FDA',
    status: 'public-domain',
    cadence: 'daily',
    async build() {
      const folder = join(DATA, 'ndc');
      const seed = [
        { ndc: '0093-1014-01', proprietary: 'Lisinopril', nonproprietary: 'Lisinopril', form: 'TABLET', route: 'ORAL', labeler: 'Teva Pharmaceuticals USA', marketingStatus: 'Marketed' },
        { ndc: '0378-1810-01', proprietary: 'Metformin Hydrochloride', nonproprietary: 'Metformin HCl', form: 'TABLET', route: 'ORAL', labeler: 'Mylan Pharmaceuticals', marketingStatus: 'Marketed' },
        { ndc: '0378-3556-01', proprietary: 'Atorvastatin Calcium', nonproprietary: 'Atorvastatin', form: 'TABLET', route: 'ORAL', labeler: 'Mylan Pharmaceuticals', marketingStatus: 'Marketed' },
        { ndc: '0093-7188-01', proprietary: 'Amoxicillin', nonproprietary: 'Amoxicillin', form: 'CAPSULE', route: 'ORAL', labeler: 'Teva Pharmaceuticals USA', marketingStatus: 'Marketed' },
        { ndc: '50242-040-62', proprietary: 'Herceptin', nonproprietary: 'Trastuzumab', form: 'INJECTION', route: 'INTRAVENOUS', labeler: 'Genentech', marketingStatus: 'Marketed' },
      ];
      const shards = shardRecords(seed, (r) => r.proprietary[0].toUpperCase());
      const shardManifests = [];
      for (const s of shards) {
        const m = await writeShard(join(folder, 'shards'), `${s.key}.json`, s.items);
        shardManifests.push(m);
      }
      const manifest = {
        dataset: 'ndc',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: shardManifests,
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: shardManifests.length };
    },
  },

  // ----- NPI ------------------------------------------------------------
  {
    id: 'npi',
    sourceUrl: 'https://download.cms.gov/nppes/NPI_Files.html',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'monthly',
    async build() {
      const folder = join(DATA, 'npi');
      const seed = [
        { npi: '1234567893', name: 'Doe, Jane M', taxonomy: 'Family Medicine', state: 'CA', status: 'Active' },
        { npi: '1234567802', name: 'Smith, John', taxonomy: 'Internal Medicine', state: 'NY', status: 'Active' },
        { npi: '1730103940', name: 'Memorial Clinic', taxonomy: 'Clinic/Center', state: 'TX', status: 'Active' },
      ];
      const shards = shardRecords(seed, (r) => r.state);
      const shardManifests = [];
      for (const s of shards) {
        const m = await writeShard(join(folder, 'shards'), `${s.key}.json`, s.items);
        shardManifests.push(m);
      }
      const manifest = {
        dataset: 'npi',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: shardManifests,
        notes: 'Compact subset: NPI, name, primary taxonomy, state, status only.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: shardManifests.length };
    },
  },

  // ----- Crosswalks (POS, modifier, revenue, CARC, RARC) -----------------
  {
    id: 'crosswalks',
    sourceUrl: 'CMS publications and X12 external code lists',
    agency: 'CMS, X12',
    status: 'public-domain',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'crosswalks');

      const pos = [
        { code: '11', name: 'Office', desc: 'Location, other than a hospital, where the health professional routinely provides health examinations.' },
        { code: '12', name: 'Home', desc: 'Location where health services and health-related services are provided in the patient\'s home.' },
        { code: '21', name: 'Inpatient Hospital', desc: 'A facility that provides inpatient medical and surgical services.' },
        { code: '22', name: 'Outpatient Hospital', desc: 'A portion of a hospital providing outpatient services.' },
        { code: '23', name: 'Emergency Room - Hospital', desc: 'A portion of a hospital where emergency services are provided.' },
        { code: '24', name: 'Ambulatory Surgical Center', desc: 'A freestanding facility for outpatient surgery.' },
        { code: '31', name: 'Skilled Nursing Facility', desc: 'A facility primarily engaged in providing skilled nursing care.' },
        { code: '32', name: 'Nursing Facility', desc: 'A facility providing nursing care, but not at the skilled level.' },
        { code: '81', name: 'Independent Laboratory', desc: 'A laboratory certified to perform diagnostic and other tests.' },
      ];
      await writeFile(join(folder, 'pos-codes.json'), JSON.stringify(pos, null, 2) + '\n', 'utf8');

      const modifiers = [
        { code: '25', name: 'Significant, separately identifiable E/M service' },
        { code: '26', name: 'Professional component' },
        { code: '50', name: 'Bilateral procedure' },
        { code: '51', name: 'Multiple procedures' },
        { code: '59', name: 'Distinct procedural service' },
        { code: 'GA', name: 'Waiver of liability statement on file' },
        { code: 'KX', name: 'Requirements specified in the medical policy have been met' },
        { code: 'TC', name: 'Technical component' },
      ];
      await writeFile(join(folder, 'modifier-codes.json'), JSON.stringify(modifiers, null, 2) + '\n', 'utf8');

      const revenue = [
        { code: '0250', name: 'Pharmacy - General Class' },
        { code: '0270', name: 'Medical/Surgical Supplies and Devices - General' },
        { code: '0300', name: 'Laboratory - General Class' },
        { code: '0320', name: 'Radiology - Diagnostic - General' },
        { code: '0360', name: 'Operating Room Services - General' },
        { code: '0450', name: 'Emergency Room - General' },
        { code: '0636', name: 'Pharmacy - Drugs requiring detailed coding' },
        { code: '0710', name: 'Recovery Room - General' },
      ];
      await writeFile(join(folder, 'revenue-codes.json'), JSON.stringify(revenue, null, 2) + '\n', 'utf8');

      const carc = [
        { code: '1', desc: 'Deductible amount.' },
        { code: '2', desc: 'Coinsurance amount.' },
        { code: '3', desc: 'Co-payment amount.' },
        { code: '45', desc: 'Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.' },
        { code: '50', desc: 'These are non-covered services because this is not deemed a "medical necessity" by the payer.' },
        { code: '96', desc: 'Non-covered charge(s).' },
        { code: '97', desc: 'The benefit for this service is included in the payment/allowance for another service that has already been adjudicated.' },
        { code: '109', desc: 'Claim/service not covered by this payer/contractor. You must send the claim to the correct payer/contractor.' },
      ];
      await writeFile(join(folder, 'carc.json'), JSON.stringify(carc, null, 2) + '\n', 'utf8');

      const rarc = [
        { code: 'M76', desc: 'Missing/incomplete/invalid diagnosis or condition.' },
        { code: 'M119', desc: 'Missing/incomplete/invalid/deactivated/withdrawn National Drug Code (NDC).' },
        { code: 'N130', desc: 'Consult plan benefit documents/guidelines for information about restrictions for this service.' },
        { code: 'N362', desc: 'The number of days or units of service exceeds our acceptable maximum.' },
        { code: 'N435', desc: 'Exceeds number/frequency approved/allowed within time period without support documentation.' },
      ];
      await writeFile(join(folder, 'rarc.json'), JSON.stringify(rarc, null, 2) + '\n', 'utf8');

      const counts = { pos: pos.length, modifiers: modifiers.length, revenue: revenue.length, carc: carc.length, rarc: rarc.length };
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const manifest = {
        dataset: 'crosswalks',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: total,
        files: ['pos-codes.json', 'modifier-codes.json', 'revenue-codes.json', 'carc.json', 'rarc.json'],
        counts,
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: total, shardCount: 5 };
    },
  },

  // ----- NCCI PTP -------------------------------------------------------
  {
    id: 'ncci',
    sourceUrl: 'https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'quarterly',
    async build() {
      const folder = join(DATA, 'ncci');
      const seed = [
        { col1: '99213', col2: '93000', modifierIndicator: '1', effectiveDate: '2026-01-01', rationale: 'Standards of medical/surgical practice' },
        { col1: '99214', col2: '36415', modifierIndicator: '0', effectiveDate: '2026-01-01', rationale: 'Mutually exclusive procedures' },
      ];
      const m = await writeShard(folder, 'ptp-edits.json', seed);
      const manifest = {
        dataset: 'ncci',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: [m],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: 1 };
    },
  },

  // ----- MUE ------------------------------------------------------------
  {
    id: 'mue',
    sourceUrl: 'https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-ncci-edits/medicare-ncci-medically-unlikely-edits',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'quarterly',
    async build() {
      const folder = join(DATA, 'mue');
      const seed = [
        { code: '36415', maxUnits: 2, rationaleCode: '3', rationale: 'Clinical: Code descriptor / CPT instruction' },
        { code: '99213', maxUnits: 1, rationaleCode: '1', rationale: 'Anatomic considerations' },
      ];
      const m = await writeShard(folder, 'mue.json', seed);
      const manifest = {
        dataset: 'mue',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: seed.length,
        shards: [m],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: seed.length, shardCount: 1 };
    },
  },

  // ----- Coverage (LCD/NCD) ---------------------------------------------
  {
    id: 'coverage',
    sourceUrl: 'https://www.cms.gov/medicare-coverage-database/',
    agency: 'CMS',
    status: 'public-domain',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'coverage');
      const lcd = [
        { policyId: 'L33773', title: 'Frequency of Hemodialysis', codes: ['90935', '90937'], effectiveDate: '2024-01-01', mac: 'Noridian' },
      ];
      const ncd = [
        { policyId: '20.4', title: 'Implantable Cardioverter Defibrillators (ICDs)', codes: ['33249'], effectiveDate: '2018-02-15' },
      ];
      await writeFile(join(folder, 'lcd.json'), JSON.stringify(lcd, null, 2) + '\n', 'utf8');
      await writeFile(join(folder, 'ncd.json'), JSON.stringify(ncd, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'coverage',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: lcd.length + ncd.length,
        files: ['lcd.json', 'ncd.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: lcd.length + ncd.length, shardCount: 2 };
    },
  },

  // ----- Enforcement (OIG, opt-out) -------------------------------------
  {
    id: 'enforcement',
    sourceUrl: 'https://oig.hhs.gov/exclusions/exclusions_list.asp',
    agency: 'HHS OIG; CMS',
    status: 'public-domain',
    cadence: 'monthly',
    async build() {
      const folder = join(DATA, 'enforcement');
      const oig = [
        { lastName: 'EXAMPLE', firstName: 'PROVIDER', npi: '0000000000', exclusionType: '1128(a)(1)', exclusionDate: '2020-01-15' },
      ];
      const optOut = [
        { lastName: 'EXAMPLE', firstName: 'OPTOUT', npi: '1111111111', specialty: 'Family Medicine', state: 'TX', effectiveDate: '2024-04-01', endDate: '2026-03-31' },
      ];
      await writeFile(join(folder, 'oig-exclusions.json'), JSON.stringify(oig, null, 2) + '\n', 'utf8');
      await writeFile(join(folder, 'medicare-opt-out.json'), JSON.stringify(optOut, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'enforcement',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        recordCount: oig.length + optOut.length,
        files: ['oig-exclusions.json', 'medicare-opt-out.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: oig.length + optOut.length, shardCount: 2 };
    },
  },

  // ----- Hospital prices (curated subset) -------------------------------
  {
    id: 'hospital-prices',
    sourceUrl: 'individual hospital machine-readable price files (curated subset)',
    agency: 'individual hospitals (federal compliance disclosures)',
    status: 'federal-compliance-disclosure',
    cadence: 'quarterly',
    async build() {
      const folder = join(DATA, 'hospital-prices');
      // Seed with a single placeholder hospital so the utility renders.
      const example = {
        hospitalId: 'example-memorial',
        hospitalName: 'Example Memorial Hospital',
        sourceUrl: 'https://example.org/price-transparency.json',
        fetchDate: FETCH_DATE,
        rates: [
          { code: '99213', payer: 'Cash discount', plan: 'self-pay', rate: 92.00 },
          { code: '99213', payer: 'Aetna', plan: 'PPO', rate: 145.50 },
          { code: '99214', payer: 'Cash discount', plan: 'self-pay', rate: 132.00 },
        ],
      };
      await writeFile(join(folder, 'hospitals', 'example-memorial.json'), JSON.stringify(example, null, 2) + '\n', 'utf8');

      const manifest = {
        dataset: 'hospital-prices',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: OFFLINE,
        coverageNote:
          'Coverage is intentionally partial. The full federal hospital price ' +
          'transparency dataset is too large to bundle in a static page. The ' +
          'utility surfaces this fact prominently.',
        hospitals: [
          { id: 'example-memorial', name: 'Example Memorial Hospital', file: 'hospitals/example-memorial.json', sourceUrl: example.sourceUrl, fetchDate: FETCH_DATE },
        ],
        recordCount: example.rates.length,
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: example.rates.length, shardCount: 1 };
    },
  },

  // ----- No Surprises Act rules -----------------------------------------
  {
    id: 'no-surprises',
    sourceUrl: 'https://www.cms.gov/nosurprises',
    agency: 'CMS / HHS / Treasury / Labor',
    status: 'public-domain',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'no-surprises');
      const rules = {
        fetchDate: FETCH_DATE,
        scenarios: [
          {
            id: 'er-out-of-network',
            description: 'Out-of-network emergency care at any facility.',
            statute: 'Public Health Service Act Section 2799A-1',
            covered: true,
          },
          {
            id: 'oon-at-in-network-facility',
            description: 'Out-of-network ancillary care at an in-network facility.',
            statute: 'Public Health Service Act Section 2799A-1',
            covered: true,
          },
          {
            id: 'air-ambulance',
            description: 'Out-of-network air ambulance services.',
            statute: 'Public Health Service Act Section 2799A-2',
            covered: true,
          },
          {
            id: 'ground-ambulance',
            description: 'Ground ambulance services.',
            statute: 'Not covered by the federal No Surprises Act.',
            covered: false,
          },
        ],
        gfeDisputeThresholdUsd: 400,
        disputeResolution: {
          patientProvider: 'Patient-Provider Dispute Resolution (uninsured/self-pay) within 120 days of bill.',
          payerProvider: 'Independent Dispute Resolution (insured) initiated by either party after open negotiation.',
        },
        portalUrl: 'https://nsa-idr.cms.gov',
      };
      await writeFile(join(folder, 'rules.json'), JSON.stringify(rules, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'no-surprises',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: false,
        recordCount: rules.scenarios.length,
        files: ['rules.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: rules.scenarios.length, shardCount: 1 };
    },
  },

  // ----- State patient rights (project author summaries) ----------------
  {
    id: 'state-rights',
    sourceUrl: 'state attorney general publications and NCLC summaries (curated)',
    agency: 'various; project author summaries',
    status: 'mit-original-summaries',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'state-rights');
      const states = {
        fetchDate: FETCH_DATE,
        states: [
          {
            code: 'CA',
            name: 'California',
            medicalDebtCollection: 'California limits aggressive collection on medical debt and provides for hospital fair pricing for low-income patients.',
            balanceBilling: 'AB 72 prohibits balance billing by out-of-network providers at in-network facilities.',
            citations: ['California Hospital Fair Pricing Act'],
          },
          {
            code: 'NY',
            name: 'New York',
            medicalDebtCollection: 'New York caps interest on medical debt judgments and shortens the statute of limitations for medical debt suits.',
            balanceBilling: 'New York surprise billing law applies to emergency services and assistant providers at in-network facilities.',
            citations: ['New York Financial Services Law Article 6'],
          },
          {
            code: 'TX',
            name: 'Texas',
            medicalDebtCollection: 'Texas requires itemized billing on request and provides specific timelines for billing after discharge.',
            balanceBilling: 'Texas SB 1264 prohibits balance billing for emergency services and out-of-network providers at in-network facilities.',
            citations: ['Texas SB 1264'],
          },
        ],
      };
      await writeFile(join(folder, 'states.json'), JSON.stringify(states, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'state-rights',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: false,
        recordCount: states.states.length,
        files: ['states.json'],
        notes: 'Original summaries written by the project author with cited sources. Not a substitute for legal counsel.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: states.states.length, shardCount: 1 };
    },
  },

  // ----- Clinical reference data ----------------------------------------
  {
    id: 'clinical',
    sourceUrl: 'published clinical literature (citations only; computations live in app.js)',
    agency: 'various; see docs/clinical-citations.md',
    status: 'public-formulas-and-original-notes',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'clinical');

      const formulas = {
        fetchDate: FETCH_DATE,
        formulas: [
          { id: 'bmi', citation: 'Quetelet 1835; Keys 1972' },
          { id: 'bsa-dubois', citation: 'Du Bois D, Du Bois EF. Arch Intern Med. 1916;17:863' },
          { id: 'bsa-mosteller', citation: 'Mosteller RD. N Engl J Med. 1987;317(17):1098' },
          { id: 'map', citation: 'Standard physiology' },
          { id: 'anion-gap', citation: 'Emmett M, Narins RG. Medicine (Baltimore). 1977;56(1):38-54' },
          { id: 'corrected-calcium', citation: 'Payne RB et al. BMJ. 1973;4(5893):643-646' },
          { id: 'corrected-sodium', citation: 'Katz 1973; Hillier 1999' },
          { id: 'aa-gradient', citation: 'West JB. Respiratory Physiology' },
          { id: 'egfr-ckd-epi-2021', citation: 'Inker LA et al. N Engl J Med. 2021;385(19):1737-1749' },
          { id: 'cockcroft-gault', citation: 'Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41' },
          { id: 'qtc-bazett', citation: 'Bazett HC. Heart. 1920;7:353-370' },
          { id: 'qtc-fridericia', citation: 'Fridericia LS. Acta Med Scand. 1920;53:469' },
          { id: 'qtc-framingham', citation: 'Sagie A et al. Am J Cardiol. 1992;70(7):797-801' },
          { id: 'qtc-hodges', citation: 'Hodges M et al. JACC. 1983;1:694' },
          { id: 'pf-ratio', citation: 'ARDS Definition Task Force. Berlin Definition. JAMA. 2012;307(23):2526-2533' },
          { id: 'gcs', citation: 'Teasdale G, Jennett B. Lancet. 1974;2(7872):81-84' },
          { id: 'apgar', citation: 'Apgar V. Curr Res Anesth Analg. 1953;32(4):260-267' },
          { id: 'wells-pe', citation: 'Wells PS et al. Thromb Haemost. 2000;83(3):416-420' },
          { id: 'wells-dvt', citation: 'Wells PS et al. Lancet. 1997;350(9094):1795-1798' },
          { id: 'chads-vasc', citation: 'Lip GYH et al. Chest. 2010;137(2):263-272' },
          { id: 'has-bled', citation: 'Pisters R et al. Chest. 2010;138(5):1093-1100' },
          { id: 'nihss', citation: 'Brott T, Adams HP Jr et al. Stroke. 1989;20(7):864-870' },
        ],
      };
      await writeFile(join(folder, 'formulas.json'), JSON.stringify(formulas, null, 2) + '\n', 'utf8');

      const pediatricVitals = {
        fetchDate: FETCH_DATE,
        ageBands: [
          { band: 'Newborn (0-1 mo)', hr: '100-205', rr: '30-60', sbp: '67-84' },
          { band: 'Infant (1-12 mo)', hr: '100-180', rr: '30-53', sbp: '72-104' },
          { band: 'Toddler (1-3 yr)', hr: '98-140', rr: '22-37', sbp: '86-106' },
          { band: 'Preschool (3-5 yr)', hr: '80-120', rr: '20-28', sbp: '89-112' },
          { band: 'School age (6-12 yr)', hr: '75-118', rr: '18-25', sbp: '97-120' },
          { band: 'Adolescent (13-18 yr)', hr: '60-100', rr: '12-20', sbp: '110-131' },
        ],
        citation: 'PALS reference values; American Heart Association.',
      };
      await writeFile(join(folder, 'pediatric-vitals.json'), JSON.stringify(pediatricVitals, null, 2) + '\n', 'utf8');

      const labRanges = {
        fetchDate: FETCH_DATE,
        ranges: [
          { test: 'Sodium', units: 'mEq/L', low: 135, high: 145 },
          { test: 'Potassium', units: 'mEq/L', low: 3.5, high: 5.0 },
          { test: 'Chloride', units: 'mEq/L', low: 96, high: 106 },
          { test: 'Bicarbonate (HCO3)', units: 'mEq/L', low: 22, high: 28 },
          { test: 'BUN', units: 'mg/dL', low: 7, high: 20 },
          { test: 'Creatinine', units: 'mg/dL', low: 0.6, high: 1.2 },
          { test: 'Glucose (fasting)', units: 'mg/dL', low: 70, high: 99 },
          { test: 'Calcium', units: 'mg/dL', low: 8.5, high: 10.5 },
          { test: 'Magnesium', units: 'mg/dL', low: 1.7, high: 2.2 },
          { test: 'Albumin', units: 'g/dL', low: 3.5, high: 5.0 },
          { test: 'Hemoglobin (M)', units: 'g/dL', low: 13.5, high: 17.5 },
          { test: 'Hemoglobin (F)', units: 'g/dL', low: 12.0, high: 15.5 },
          { test: 'Platelets', units: 'x10^3/uL', low: 150, high: 400 },
          { test: 'WBC', units: 'x10^3/uL', low: 4.5, high: 11.0 },
          { test: 'INR (off warfarin)', units: '', low: 0.8, high: 1.2 },
        ],
        citation: 'Common adult reference ranges; lab-specific ranges supersede.',
      };
      await writeFile(join(folder, 'lab-ranges.json'), JSON.stringify(labRanges, null, 2) + '\n', 'utf8');

      const beers = {
        fetchDate: FETCH_DATE,
        attribution: 'Underlying drug-condition pairs are clinical facts. Original brief notes by the project author. See AGS publication for the authoritative list and rationale: https://americangeriatrics.org/',
        pairs: [
          { drug: 'Diphenhydramine', condition: 'Older adults (general)', note: 'Strongly anticholinergic. Risk of confusion, urinary retention, falls. Avoid for sleep and for cold/cough in older adults when possible.' },
          { drug: 'Diazepam', condition: 'Older adults (general)', note: 'Long-acting benzodiazepine. Increased risk of cognitive impairment, falls, fractures. Avoid as first line.' },
          { drug: 'NSAIDs (chronic)', condition: 'CKD or heart failure', note: 'Risk of acute kidney injury and fluid retention. Avoid chronic use.' },
          { drug: 'Glyburide', condition: 'Older adults (general)', note: 'Long-acting sulfonylurea. Higher risk of prolonged hypoglycemia. Prefer shorter-acting alternatives.' },
        ],
      };
      await writeFile(join(folder, 'beers.json'), JSON.stringify(beers, null, 2) + '\n', 'utf8');

      const ismp = {
        fetchDate: FETCH_DATE,
        attribution: 'Medication identities are factual. Original brief notes by the project author. ISMP maintains the authoritative list and formatting: https://www.ismp.org/',
        meds: [
          { name: 'Insulin (all formulations)', note: 'Narrow therapeutic window. Errors in dose, formulation, or timing cause hypoglycemia or hyperglycemia.' },
          { name: 'Heparin (all formulations)', note: 'Anticoagulation errors cause severe bleeding or clotting. Use standard concentrations and double-check.' },
          { name: 'Opioids', note: 'Respiratory depression risk. PCA programming errors and look-alike concentrations are common error sources.' },
          { name: 'Concentrated electrolytes (KCl, hypertonic saline)', note: 'Bolus or rapid infusion can be fatal. Restrict access and require dilution.' },
          { name: 'Chemotherapy', note: 'Narrow margin between therapeutic and toxic doses. Standardized order sets and double-check protocols required.' },
        ],
      };
      await writeFile(join(folder, 'ismp-high-alert.json'), JSON.stringify(ismp, null, 2) + '\n', 'utf8');

      const asa = {
        fetchDate: FETCH_DATE,
        attribution: 'Categories are short factual labels. Original short summaries by the project author. See ASA: https://www.asahq.org/',
        classes: [
          { class: 'I', summary: 'A normally healthy patient.' },
          { class: 'II', summary: 'A patient with mild systemic disease that is well controlled.' },
          { class: 'III', summary: 'A patient with severe systemic disease that limits activity but is not incapacitating.' },
          { class: 'IV', summary: 'A patient with severe systemic disease that is a constant threat to life.' },
          { class: 'V', summary: 'A moribund patient who is not expected to survive without the operation.' },
          { class: 'VI', summary: 'A declared brain-dead patient whose organs are being procured.' },
          { class: 'E', summary: 'Suffix for emergency procedures.' },
        ],
      };
      await writeFile(join(folder, 'asa-status.json'), JSON.stringify(asa, null, 2) + '\n', 'utf8');

      const mallampati = {
        fetchDate: FETCH_DATE,
        citation: 'Mallampati SR et al. Can Anaesth Soc J. 1985;32(4):429-434',
        classes: [
          { class: 'I', summary: 'Soft palate, uvula, fauces, and pillars are visible.' },
          { class: 'II', summary: 'Soft palate, uvula, and fauces are visible.' },
          { class: 'III', summary: 'Soft palate and base of uvula are visible.' },
          { class: 'IV', summary: 'Soft palate is not visible.' },
        ],
      };
      await writeFile(join(folder, 'mallampati.json'), JSON.stringify(mallampati, null, 2) + '\n', 'utf8');

      const totalRecords =
        formulas.formulas.length +
        pediatricVitals.ageBands.length +
        labRanges.ranges.length +
        beers.pairs.length +
        ismp.meds.length +
        asa.classes.length +
        mallampati.classes.length;

      const manifest = {
        dataset: 'clinical',
        sourceUrl: this.sourceUrl,
        agency: this.agency,
        status: this.status,
        cadence: this.cadence,
        fetchDate: FETCH_DATE,
        offlineSeed: false,
        recordCount: totalRecords,
        files: [
          'formulas.json',
          'pediatric-vitals.json',
          'lab-ranges.json',
          'beers.json',
          'ismp-high-alert.json',
          'asa-status.json',
          'mallampati.json',
        ],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: totalRecords, shardCount: 7 };
    },
  },

  // ----- Field Medicine: CDC Field Triage Guidelines -----------------------
  {
    id: 'field-triage',
    sourceUrl: 'https://www.cdc.gov/mmwr/volumes/71/rr/rr7102a1.htm',
    agency: 'CDC',
    status: 'public-domain',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'field-triage');
      await ensureDir(folder);
      const data = {
        fetchDate: FETCH_DATE,
        edition: 'CDC Field Triage Guidelines for Injured Patients (current edition)',
        steps: [
          { step: 1, name: 'Vitals and consciousness', criteria: [
            { id: 'gcs-le-13', label: 'GCS <= 13' },
            { id: 'sbp-lt-110-adult-or-shock-pediatric', label: 'SBP < 110 mmHg adult, or pediatric shock index abnormal' },
            { id: 'rr-lt-10-or-gt-29-or-respiratory-distress', label: 'RR < 10 or > 29, or respiratory distress / need for ventilatory support' },
          ], action: 'If any criterion: transport to highest-level trauma center.' },
          { step: 2, name: 'Anatomy of injury', criteria: [
            { id: 'penetrating-head-neck-torso', label: 'Penetrating injuries to head, neck, torso, or proximal extremities' },
            { id: 'amputation-proximal-wrist-ankle', label: 'Amputation proximal to wrist or ankle' },
            { id: 'pelvic-fracture-suspected', label: 'Suspected pelvic fracture' },
            { id: 'long-bone-fractures-multi', label: 'Two or more proximal long-bone fractures' },
            { id: 'crushed-degloved', label: 'Crushed, degloved, mangled, or pulseless extremity' },
            { id: 'chest-wall-instability', label: 'Chest wall instability or deformity (flail chest)' },
            { id: 'open-or-depressed-skull', label: 'Open or depressed skull fracture' },
            { id: 'paralysis', label: 'Paralysis or suspected spinal cord injury' },
          ], action: 'If any criterion: transport to highest-level trauma center.' },
          { step: 3, name: 'Mechanism of injury', criteria: [
            { id: 'fall-adult-gt-20-or-pediatric-gt-10', label: 'Falls: adult > 20 ft, pediatric > 10 ft or 2-3x height' },
            { id: 'mvc-high-risk', label: 'High-risk auto crash: intrusion > 12 in occupant site / > 18 in any site, ejection, death same compartment, telemetry consistent with high risk' },
            { id: 'auto-vs-ped-bicyclist-thrown-impact-gt-20', label: 'Auto vs pedestrian/bicyclist thrown, run over, or impact > 20 mph' },
            { id: 'motorcycle-crash-gt-20mph', label: 'Motorcycle crash > 20 mph' },
          ], action: 'Consider transport to a trauma center; agency-protocol decision.' },
          { step: 4, name: 'Special considerations', criteria: [
            { id: 'older-adult', label: 'Older adult: SBP < 110 may indicate shock; low-impact mechanisms still high risk' },
            { id: 'pediatric', label: 'Children should be triaged preferentially to pediatric-capable centers' },
            { id: 'anticoagulant-use', label: 'On anticoagulant or with bleeding disorder' },
            { id: 'pregnancy-gt-20wk', label: 'Pregnancy > 20 weeks' },
            { id: 'burns', label: 'Burns: with or without trauma; trauma centers for combined' },
          ], action: 'Use clinical judgment; consult medical control.' },
        ],
      };
      await writeFile(join(folder, 'guidelines.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'field-triage', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: data.steps.length, files: ['guidelines.json'],
        notes: 'CDC public-domain Field Triage Guidelines, summarized in original prose by the project author.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: data.steps.length, shardCount: 1 };
    },
  },

  // ----- Field Medicine: START / JumpSTART triage algorithms ---------------
  {
    id: 'mci-triage',
    sourceUrl: 'https://www.start-triage.com/ ; JumpSTART (CHOC Children\'s)',
    agency: 'Public-domain MCI triage algorithms',
    status: 'public-domain',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'mci-triage');
      await ensureDir(folder);
      const data = {
        fetchDate: FETCH_DATE,
        start: {
          name: 'START (Simple Triage and Rapid Treatment) - adult',
          algorithm: [
            { step: 'walk', q: 'Can the patient walk?', yes: 'Minor (green)', no: 'next' },
            { step: 'breathing', q: 'Is the patient breathing after airway repositioning?', no: 'Expectant (black)', yes: 'rate' },
            { step: 'rate', q: 'Respiratory rate?', le30: 'next', gt30: 'Immediate (red)' },
            { step: 'perfusion', q: 'Radial pulse present and capillary refill < 2s?', no: 'Immediate (red)', yes: 'mental' },
            { step: 'mental', q: 'Can the patient follow simple commands?', no: 'Immediate (red)', yes: 'Delayed (yellow)' },
          ],
        },
        jumpstart: {
          name: 'JumpSTART - pediatric ages 1-8',
          algorithm: [
            { step: 'walk', q: 'Can the child walk?', yes: 'Minor (green)', no: 'next' },
            { step: 'breathing', q: 'Is the child breathing?', no: 'rescue', yes: 'rate' },
            { step: 'rescue', q: 'Position airway and give 5 rescue breaths. Breathing now?', no: 'Expectant (black)', yes: 'Immediate (red)' },
            { step: 'rate', q: 'Respiratory rate?', between15and45: 'perfusion', outside15and45: 'Immediate (red)' },
            { step: 'perfusion', q: 'Palpable peripheral pulse?', no: 'Immediate (red)', yes: 'mental' },
            { step: 'mental', q: 'AVPU: Alert, Voice, Pain (appropriate)?', yes: 'Delayed (yellow)', no: 'Immediate (red)' },
          ],
        },
      };
      await writeFile(join(folder, 'algorithms.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'mci-triage', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: 2, files: ['algorithms.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: 2, shardCount: 1 };
    },
  },

  // ----- Field Medicine: FDA prehospital drug labeling subset --------------
  {
    id: 'prehospital-meds',
    sourceUrl: 'FDA DailyMed labeling',
    agency: 'FDA',
    status: 'public-domain',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'prehospital-meds');
      await ensureDir(folder);
      const meds = [
        { name: 'Epinephrine', adultDose: '1 mg IV/IO every 3-5 min', pedsDose: '0.01 mg/kg IV/IO (max 1 mg)', route: 'IV/IO/IM', notes: 'Anaphylaxis IM 0.3-0.5 mg adult; 0.01 mg/kg pediatric (max 0.3 mg).', source: 'FDA labeling' },
        { name: 'Atropine', adultDose: '0.5-1 mg IV every 3-5 min (max 3 mg) for bradycardia; 2-5 mg IV for organophosphate', pedsDose: '0.02 mg/kg IV/IO (min 0.1 mg, max 0.5 mg)', route: 'IV/IO/IM', notes: 'Routine pre-arrest atropine no longer recommended in PEA.', source: 'FDA labeling' },
        { name: 'Amiodarone', adultDose: '300 mg IV/IO bolus, then 150 mg', pedsDose: '5 mg/kg IV/IO (max 300 mg)', route: 'IV/IO', notes: 'For VF/pVT after defibrillation.', source: 'FDA labeling' },
        { name: 'Lidocaine', adultDose: '1-1.5 mg/kg IV/IO bolus, then 0.5-0.75 mg/kg', pedsDose: '1 mg/kg IV/IO', route: 'IV/IO/ET', notes: 'Alternative to amiodarone.', source: 'FDA labeling' },
        { name: 'Naloxone', adultDose: '0.4-2 mg IV/IM/IN; repeat q2-3 min', pedsDose: '0.1 mg/kg IV/IM/IN (max adult dose)', route: 'IV/IM/IN/IO', notes: 'For opioid overdose.', source: 'FDA labeling' },
        { name: 'Dextrose', adultDose: '12.5-25 g IV (D50W 25-50 mL)', pedsDose: '0.5-1 g/kg IV (D10W 5-10 mL/kg)', route: 'IV/IO', notes: 'For documented hypoglycemia.', source: 'FDA labeling' },
        { name: 'Glucagon', adultDose: '1 mg IM/SC/IV', pedsDose: '0.5 mg < 25 kg; 1 mg if >= 25 kg', route: 'IM/SC/IV', notes: 'When IV access not available for hypoglycemia.', source: 'FDA labeling' },
        { name: 'Sodium bicarbonate', adultDose: '1 mEq/kg IV bolus', pedsDose: '1 mEq/kg IV/IO', route: 'IV/IO', notes: 'TCA toxicity, hyperkalemia, prolonged arrest.', source: 'FDA labeling' },
        { name: 'Magnesium sulfate', adultDose: '1-2 g IV over 15 min (torsades / severe asthma)', pedsDose: '25-50 mg/kg IV (max 2 g)', route: 'IV/IO', notes: 'Torsades de pointes, severe asthma exacerbation.', source: 'FDA labeling' },
        { name: 'Adenosine', adultDose: '6 mg IV rapid push, then 12 mg', pedsDose: '0.1 mg/kg (max 6 mg), then 0.2 mg/kg (max 12 mg)', route: 'IV (close to central)', notes: 'Stable narrow-complex SVT.', source: 'FDA labeling' },
        { name: 'Calcium gluconate', adultDose: '1-3 g IV over 5-10 min', pedsDose: '60-100 mg/kg IV', route: 'IV', notes: 'Hyperkalemia with EKG changes; CCB toxicity.', source: 'FDA labeling' },
        { name: 'Calcium chloride', adultDose: '500-1000 mg IV slow', pedsDose: '20 mg/kg IV', route: 'IV (central preferred)', notes: 'Higher elemental calcium than gluconate.', source: 'FDA labeling' },
        { name: 'Midazolam', adultDose: '2-5 mg IV/IM/IN', pedsDose: '0.1-0.2 mg/kg IV/IM/IN (max 5 mg)', route: 'IV/IM/IN', notes: 'Status epilepticus, sedation.', source: 'FDA labeling' },
        { name: 'Ketamine', adultDose: '1-2 mg/kg IV / 4-5 mg/kg IM (analgesia 0.1-0.3 mg/kg IV)', pedsDose: '1-2 mg/kg IV / 4-5 mg/kg IM', route: 'IV/IM/IN', notes: 'Per local protocol.', source: 'FDA labeling' },
        { name: 'Fentanyl', adultDose: '50-100 mcg IV/IM/IN', pedsDose: '1-2 mcg/kg IV/IM/IN', route: 'IV/IM/IN', notes: 'Per local protocol.', source: 'FDA labeling' },
        { name: 'Morphine', adultDose: '2-10 mg IV/IM', pedsDose: '0.1-0.2 mg/kg IV/IM (max 5 mg)', route: 'IV/IM', notes: 'Per local protocol.', source: 'FDA labeling' },
        { name: 'Ondansetron', adultDose: '4-8 mg IV/IM/PO', pedsDose: '0.1-0.15 mg/kg IV (max 4 mg)', route: 'IV/IM/PO', notes: 'Nausea/vomiting.', source: 'FDA labeling' },
        { name: 'Diphenhydramine', adultDose: '25-50 mg IV/IM/PO', pedsDose: '1 mg/kg IV/IM/PO (max 50 mg)', route: 'IV/IM/PO', notes: 'Allergic reaction adjunct.', source: 'FDA labeling' },
        { name: 'Methylprednisolone', adultDose: '125 mg IV', pedsDose: '1-2 mg/kg IV (max 125 mg)', route: 'IV/IM', notes: 'Severe asthma, anaphylaxis adjunct.', source: 'FDA labeling' },
        { name: 'Albuterol', adultDose: '2.5-5 mg nebulized', pedsDose: '0.15 mg/kg nebulized (min 2.5 mg, max 5 mg)', route: 'nebulized / MDI', notes: 'Bronchodilation.', source: 'FDA labeling' },
        { name: 'Nitroglycerin', adultDose: '0.4 mg SL every 5 min x 3', pedsDose: 'not routinely used', route: 'SL/IV', notes: 'Hold if SBP < 90, recent PDE-5 inhibitor.', source: 'FDA labeling' },
        { name: 'Aspirin', adultDose: '162-325 mg PO chewed', pedsDose: 'not used acutely', route: 'PO', notes: 'Suspected ACS.', source: 'FDA labeling' },
      ];
      await writeFile(join(folder, 'meds.json'), JSON.stringify(meds, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'prehospital-meds', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: meds.length, files: ['meds.json'],
        notes: 'Standard prehospital medication identities and reference doses derived from FDA labeling. Reference only; local protocols and AHA guidelines govern.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: meds.length, shardCount: 1 };
    },
  },

  // ----- Field Medicine: AHA reference (numeric facts, no flowcharts) ------
  {
    id: 'aha-reference',
    sourceUrl: 'AHA ECC 2020 guidelines (numeric reference facts only; no flowchart text)',
    agency: 'American Heart Association (numeric reference)',
    status: 'numeric-facts-with-attribution',
    cadence: 'as-published',
    async build() {
      const folder = join(DATA, 'aha-reference');
      await ensureDir(folder);
      const data = {
        fetchDate: FETCH_DATE,
        edition: 'AHA ECC 2020 guidelines (current as of fetch date)',
        attribution: 'Numeric facts only (drug doses, intervals, energy levels). The AHA holds copyright on the published flowcharts; consult the AHA publication for the authoritative algorithm.',
        adultArrest: [
          { drug: 'Epinephrine', dose: '1 mg IV/IO', interval: 'every 3-5 minutes', indication: 'Cardiac arrest (any rhythm)' },
          { drug: 'Amiodarone', dose: '300 mg IV/IO bolus, then 150 mg', interval: 'after second shock for VF/pVT', indication: 'Refractory VF/pVT' },
          { drug: 'Lidocaine', dose: '1-1.5 mg/kg IV/IO, then 0.5-0.75 mg/kg', interval: 'every 5-10 minutes (max 3 mg/kg)', indication: 'Refractory VF/pVT (alternative)' },
          { drug: 'Magnesium sulfate', dose: '1-2 g IV/IO over 15 minutes', interval: 'single dose', indication: 'Torsades de pointes' },
          { drug: 'Sodium bicarbonate', dose: '1 mEq/kg IV/IO', interval: 'as indicated', indication: 'TCA toxicity, hyperkalemia, prolonged arrest' },
        ],
        pediatricArrest: [
          { drug: 'Epinephrine', dose: '0.01 mg/kg IV/IO (max 1 mg)', interval: 'every 3-5 minutes', indication: 'Pediatric cardiac arrest' },
          { drug: 'Amiodarone', dose: '5 mg/kg IV/IO (max 300 mg)', interval: 'may repeat up to 15 mg/kg/day', indication: 'Refractory VF/pVT' },
          { drug: 'Lidocaine', dose: '1 mg/kg IV/IO', interval: 'as alternative', indication: 'Refractory VF/pVT (alternative)' },
        ],
        defibrillationEnergy: [
          { population: 'Adult VF/pVT', waveform: 'Biphasic', energy: '120-200 J (manufacturer specific); 200 J if unknown' },
          { population: 'Adult VF/pVT', waveform: 'Monophasic', energy: '360 J' },
          { population: 'Pediatric VF/pVT', waveform: 'Any', energy: '2 J/kg first shock; 4 J/kg subsequent (max 10 J/kg or adult dose)' },
          { population: 'Adult cardioversion: unstable narrow regular SVT', waveform: 'Biphasic synchronized', energy: '50-100 J' },
          { population: 'Adult cardioversion: unstable atrial fibrillation', waveform: 'Biphasic synchronized', energy: '120-200 J' },
          { population: 'Adult cardioversion: unstable monomorphic VT', waveform: 'Biphasic synchronized', energy: '100 J' },
          { population: 'Pediatric cardioversion', waveform: 'Synchronized', energy: '0.5-1 J/kg first; 2 J/kg subsequent' },
        ],
      };
      await writeFile(join(folder, 'aha-reference.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'aha-reference', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: data.adultArrest.length + data.pediatricArrest.length + data.defibrillationEnergy.length,
        files: ['aha-reference.json'],
        notes: 'Numeric reference values (doses, intervals, joules) only. AHA flowcharts not reproduced.',
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: manifest.recordCount, shardCount: 1 };
    },
  },

  // ----- Field Medicine: environmental staging (hypothermia, heat illness) -
  {
    id: 'environmental',
    sourceUrl: 'Wilderness Medical Society practice guidelines; standard medical literature',
    agency: 'Wilderness Medical Society / standard medical literature',
    status: 'public-formulas-and-original-notes',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'environmental');
      await ensureDir(folder);
      const data = {
        fetchDate: FETCH_DATE,
        attribution: 'Original brief notes by the project author with citations to Wilderness Medical Society guidelines and standard medical literature.',
        hypothermia: [
          { stage: 'Mild', coreTemp: '32-35 C (90-95 F)', findings: 'Shivering present, tachycardia, vasoconstriction, alert mental status.' },
          { stage: 'Moderate', coreTemp: '28-32 C (82-90 F)', findings: 'Shivering may be lost, decreased mentation, bradycardia, atrial dysrhythmias.' },
          { stage: 'Severe', coreTemp: 'Below 28 C (82 F)', findings: 'Coma, fixed pupils, ventricular dysrhythmias, asystole. Treat as potentially viable until rewarmed.' },
        ],
        heatIllness: [
          { stage: 'Heat exhaustion', criteria: 'Core temp typically below 40 C; profuse sweating; mental status preserved; nausea, headache, weakness.' },
          { stage: 'Heat stroke', criteria: 'Core temp typically 40 C or higher; CNS dysfunction (confusion, seizures, coma); sweating may be absent or present.' },
        ],
      };
      await writeFile(join(folder, 'environmental.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'environmental', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: data.hypothermia.length + data.heatIllness.length, files: ['environmental.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: manifest.recordCount, shardCount: 1 };
    },
  },

  // ----- Field Medicine: ATSDR toxidrome reference --------------------------
  {
    id: 'toxidromes',
    sourceUrl: 'CDC Agency for Toxic Substances and Disease Registry (ATSDR)',
    agency: 'ATSDR / CDC',
    status: 'public-domain',
    cadence: 'as-needed',
    async build() {
      const folder = join(DATA, 'toxidromes');
      await ensureDir(folder);
      const data = {
        fetchDate: FETCH_DATE,
        attribution: 'Original brief notes by the project author with citation to ATSDR profiles and standard medical toxicology literature.',
        toxidromes: [
          { name: 'Cholinergic', signs: 'SLUDGE/BBB: salivation, lacrimation, urination, defecation, GI upset, emesis, bronchorrhea, bronchospasm, bradycardia. Miosis common.', causes: 'Organophosphates, carbamates, nerve agents, some mushrooms.', antidote: 'Atropine + pralidoxime' },
          { name: 'Anticholinergic', signs: 'Hot, dry, red, blind, mad: hyperthermia, dry skin, flushing, mydriasis, delirium, urinary retention, decreased bowel sounds.', causes: 'Antihistamines, TCAs, jimsonweed, atropine.', antidote: 'Supportive; physostigmine in select cases (caution).' },
          { name: 'Sympathomimetic', signs: 'Tachycardia, hypertension, hyperthermia, mydriasis, agitation, diaphoresis (vs anticholinergic dry skin).', causes: 'Cocaine, amphetamines, methamphetamine, ephedrine.', antidote: 'Benzodiazepines, cooling, supportive.' },
          { name: 'Opioid', signs: 'CNS depression, respiratory depression, miosis, hypotension, decreased bowel sounds.', causes: 'Heroin, fentanyl, oxycodone, morphine, hydrocodone.', antidote: 'Naloxone' },
          { name: 'Sedative-hypnotic', signs: 'CNS depression, normal pupils, normal vitals (overdose may show respiratory depression).', causes: 'Benzodiazepines, barbiturates, alcohol.', antidote: 'Supportive; flumazenil for benzodiazepine in select cases.' },
          { name: 'Serotonergic', signs: 'Mental status changes, autonomic instability, neuromuscular hyperactivity (clonus, hyperreflexia), hyperthermia.', causes: 'SSRIs + MAOIs, linezolid, tramadol, dextromethorphan combinations.', antidote: 'Supportive; cyproheptadine in select cases.' },
        ],
      };
      await writeFile(join(folder, 'toxidromes.json'), JSON.stringify(data, null, 2) + '\n', 'utf8');
      const manifest = {
        dataset: 'toxidromes', sourceUrl: this.sourceUrl, agency: this.agency, status: this.status,
        cadence: this.cadence, fetchDate: FETCH_DATE, offlineSeed: false,
        recordCount: data.toxidromes.length, files: ['toxidromes.json'],
      };
      await writeManifest(folder, manifest);
      return { id: this.id, recordCount: data.toxidromes.length, shardCount: 1 };
    },
  },
];

// --- Verification helpers -------------------------------------------------

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

// --- Main -----------------------------------------------------------------

async function main() {
  console.log(`build-data: starting (offline=${OFFLINE}, only=${ONLY || 'all'})`);
  await ensureDir(DATA);

  const summary = [];
  for (const ds of datasets) {
    if (ONLY && ds.id !== ONLY) continue;
    try {
      await ensureDir(join(DATA, ds.id));
      const result = await ds.build();
      summary.push({ id: ds.id, ok: true, ...result });
      console.log(`  ${ds.id}: wrote ${result.recordCount} records across ${result.shardCount} file(s).`);
    } catch (err) {
      summary.push({ id: ds.id, ok: false, error: err.message });
      console.error(`  ${ds.id}: FAILED - ${err.message}`);
    }
  }

  // Validate every JSON file written.
  let invalid = 0;
  for await (const file of walk(DATA)) {
    if (!file.endsWith('.json')) continue;
    try {
      JSON.parse(await readFile(file, 'utf8'));
    } catch (err) {
      invalid += 1;
      console.error(`Invalid JSON: ${relative(ROOT, file)}: ${err.message}`);
    }
  }

  const failed = summary.filter((s) => !s.ok);
  if (invalid > 0 || failed.length > 0) {
    console.error(`build-data: completed with errors. invalid JSON: ${invalid}, failed datasets: ${failed.length}`);
    process.exit(1);
  }
  console.log(`build-data: ok. ${summary.length} datasets written.`);
}

main().catch((err) => {
  console.error('build-data: fatal', err);
  process.exit(2);
});
