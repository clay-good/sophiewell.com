// spec-v1454: Powers ratio (Powers 1979; method and normal values per Rojas et al 2007, Table 1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { powersRatio as pw } from '../../lib/powers-ratio-v1454.js';

test('the ratio is BC divided by OA', () => {
  const r = pw({ bc: '30', oa: '40', modality: 'radiograph' });
  assert.equal(r.valid, true);
  assert.equal(r.ratio, 0.75);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /^Powers ratio 0\.75: below the normal limit of 1\.0 on a plain radiograph/);
  assert.match(r.band, /does not exclude a posterior or vertical distraction injury/);
});

test('radiograph: normal is less than 1; exactly 1 is outside it', () => {
  assert.equal(pw({ bc: 39.6, oa: 40, modality: 'radiograph' }).abnormal, false);
  const one = pw({ bc: 40, oa: 40, modality: 'radiograph' });
  assert.equal(one.abnormal, true);
  assert.match(one.band, /at or above 1, outside the normal range and consistent with anterior atlanto-occipital dissociation/);
  assert.equal(pw({ bc: 38, oa: 40, modality: 'radiograph' }).abnormal, false); // 0.95 is normal on a film
});

test('CT: normal is less than 0.9', () => {
  assert.equal(pw({ bc: 35.6, oa: 40, modality: 'ct' }).abnormal, false); // 0.89
  const edge = pw({ bc: 36, oa: 40, modality: 'ct' }); // 0.90
  assert.equal(edge.abnormal, true);
  assert.match(edge.band, /at or above the CT normal value of 0\.9/);
  assert.match(pw({ bc: 44, oa: 40, modality: 'ct' }).band, /at or above 1/);
  assert.match(pw({ bc: 30, oa: 40, modality: 'ct' }).band, /below the normal limit of 0\.9 on CT/);
});

test('basion-dens interval is read against the modality limit and disclosed when blank', () => {
  assert.ok(pw({ bc: 30, oa: 40, modality: 'ct' }).notes[0].includes('No basion-dens interval was entered'));
  const ctHigh = pw({ bc: 30, oa: 40, modality: 'ct', bdi: '8.5' });
  assert.equal(ctHigh.bdiAbove, true);
  assert.match(ctHigh.notes[0], /at or above the normal limit of 8\.5 mm on CT/);
  assert.match(ctHigh.notes[1], /disagree/);
  const film = pw({ bc: 30, oa: 40, modality: 'radiograph', bdi: '10' });
  assert.equal(film.bdiAbove, false);
  assert.match(film.notes[0], /below the normal limit of 12 mm on a plain radiograph/);
  assert.ok(!film.notes.some((n) => /disagree/.test(n)));
  assert.equal(pw({ bc: 30, oa: 40, modality: 'radiograph', bdi: '12' }).bdiAbove, true);
});

test('every answer carries the source limits', () => {
  const r = pw({ bc: 30, oa: 40, modality: 'radiograph' });
  assert.ok(r.notes.some((n) => /only sensitive to anterior dissociation/.test(n)));
  assert.ok(r.notes.some((n) => /56% to 84%/.test(n)));
  assert.ok(r.notes.some((n) => /congenital nonfusion/.test(n)));
  assert.ok(pw({ bc: 30, oa: 40, modality: 'ct' }).notes.some((n) => /200 adults aged 20 to 40/.test(n)));
  assert.match(r.note, /does not choose the treatment/);
});

test('blank, zero, negative, impossible or unchosen inputs refuse', () => {
  assert.match(pw({}).message, /^Enter the distance from the basion/);
  assert.match(pw({ bc: '   ', oa: 40, modality: 'ct' }).message, /^Enter the distance from the basion/);
  assert.match(pw({ bc: 30, modality: 'ct' }).message, /^Enter the distance from the opisthion/);
  assert.match(pw({ bc: 0, oa: 40, modality: 'ct' }).message, /must be greater than 0/);
  assert.match(pw({ bc: 30, oa: -4, modality: 'ct' }).message, /must be greater than 0/);
  assert.match(pw({ bc: 300, oa: 40, modality: 'ct' }).message, /at most 100 mm/);
  assert.match(pw({ bc: 30, oa: 40 }).message, /^Choose whether/);
  assert.match(pw({ bc: 30, oa: 40, modality: 'mri' }).message, /^Choose whether/);
  assert.match(pw({ bc: 30, oa: 40, modality: 'ct', bdi: '0' }).message, /must be greater than 0/);
  assert.equal(pw(null).valid, false);
});

test('the threshold is read at the two decimals printed', () => {
  const r = pw({ bc: 8.1, oa: 9, modality: 'ct' }); // 0.8999... prints as 0.90
  assert.equal(r.ratio, 0.9);
  assert.equal(r.abnormal, true);
});
