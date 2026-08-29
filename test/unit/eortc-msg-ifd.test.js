import test from 'node:test';
import assert from 'node:assert/strict';
import { eortcMsgIfd as f, HOST_FACTORS, CLINICAL_FEATURES, MYCOLOGICAL_EVIDENCE } from '../../lib/eortc-msg-ifd-v869.js';

const probable = { neutropenia: true, cavity: true, serumGalactomannan: true };

test('eortc-msg-ifd: the published component lists', () => {
  assert.equal(HOST_FACTORS.length, 8);
  assert.equal(CLINICAL_FEATURES.length, 8);
  assert.equal(MYCOLOGICAL_EVIDENCE.length, 5);
});

test('eortc-msg-ifd: probable needs all three components', () => {
  assert.equal(f(probable).classification, 'probable');
  // Any one host factor, clinical feature and mycological item will do it.
  for (const h of HOST_FACTORS) {
    assert.equal(f({ [h.key]: true, cavity: true, serumGalactomannan: true }).classification, 'probable', h.key);
  }
  for (const c of CLINICAL_FEATURES) {
    assert.equal(f({ neutropenia: true, [c.key]: true, serumGalactomannan: true }).classification, 'probable', c.key);
  }
  for (const m of MYCOLOGICAL_EVIDENCE) {
    assert.equal(f({ neutropenia: true, cavity: true, [m.key]: true }).classification, 'probable', m.key);
  }
});

test('eortc-msg-ifd: two of three is possible, and one on its own is nothing', () => {
  assert.equal(f({ neutropenia: true, cavity: true }).classification, 'possible');
  // The two combinations that do NOT reach possible: without a clinical feature, and without a
  // host factor.
  assert.equal(f({ neutropenia: true, serumGalactomannan: true }).classification, 'not-classified');
  assert.equal(f({ cavity: true, serumGalactomannan: true }).classification, 'not-classified');
  assert.equal(f({ serumGalactomannan: true }).classification, 'not-classified');
  assert.match(f({ serumGalactomannan: true }).missingNote, /on its own classifies nothing/);
});

test('eortc-msg-ifd: proven needs no host factor and outranks everything', () => {
  const bare = f({ provenEvidence: true });
  assert.equal(bare.classification, 'proven');
  assert.equal(bare.counts.host, 0);
  assert.match(bare.provenNote, /stands on tissue invasion or a sterile-site culture alone/);
  // It does not change with the other components either way.
  assert.equal(f({ ...probable, provenEvidence: true }).classification, 'proven');
  // And the no-host-factor warning is not raised against a proven case.
  assert.equal(bare.hostNote, null);
});

test('eortc-msg-ifd: possible is flagged as a research category, not a treatment one', () => {
  const r = f({ neutropenia: true, cavity: true });
  assert.match(r.possibleNote, /epidemiologic and research category/);
  assert.match(r.possibleNote, /not a treatment category/);
  assert.equal(f(probable).possibleNote, null);
});

test('eortc-msg-ifd: they are research definitions, said on every result', () => {
  // The reason the tile exists.
  for (const input of [{}, probable, { provenEvidence: true }, { neutropenia: true, cavity: true }]) {
    assert.match(f(input).researchNote, /research definitions/);
    assert.match(f(input).researchNote, /not to decide whether an individual patient is treated/);
    assert.match(f(input).scopeNote, /does not decide whether to start antifungal treatment/);
  }
});

test('eortc-msg-ifd: no host factor puts the case outside the framework', () => {
  const r = f({ cavity: true, serumGalactomannan: true });
  assert.match(r.hostNote, /assume an immunocompromised host/);
  assert.match(r.hostNote, /intensive care without a host factor/);
  assert.equal(f(probable).hostNote, null);
});

test('eortc-msg-ifd: the components are counted back', () => {
  const r = f({ neutropenia: true, gvhd: true, cavity: true, serumGalactomannan: true, aspergillusPcr: true });
  assert.deepEqual(r.counts, { host: 2, clinical: 1, mycological: 2 });
  assert.match(r.present, /2 host factors, 1 clinical feature, 2 items of mycological evidence/);
  assert.match(f({ neutropenia: true, cavity: true, serumGalactomannan: true }).present, /1 host factor, 1 clinical feature, 1 item/);
});

test('eortc-msg-ifd: the documented example', () => {
  const r = f(probable);
  assert.equal(r.classification, 'probable');
  assert.match(r.band, /^Probable invasive fungal disease/);
  assert.match(r.present, /1 host factor, 1 clinical feature, 1 item of mycological evidence/);
});
