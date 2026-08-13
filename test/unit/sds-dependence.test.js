// spec-v730: Severity of Dependence Scale (SDS).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { sdsDependence } from '../../lib/sds-dependence-v730.js';

const ITEMS = (n) => ({ outOfControl: String(n), anxiousMissing: String(n), worried: String(n), wishStop: String(n), difficultyStopping: String(n) });

test('worked example: heroin, all 1 -> 5, at/above cutoff', () => {
  const r = sdsDependence({ substance: 'heroin', ...ITEMS(1) });
  assert.equal(r.valid, true);
  assert.equal(r.score, 5);
  assert.equal(r.cutoff, 5);
  assert.equal(r.abnormal, true);
  assert.match(r.band, /at or above the heroin dependence cutoff/);
});

test('substance-specific cutoffs: cocaine >= 3, cannabis >= 4', () => {
  assert.equal(sdsDependence({ substance: 'cocaine', outOfControl: '3', anxiousMissing: '0', worried: '0', wishStop: '0', difficultyStopping: '0' }).abnormal, true); // 3
  assert.equal(sdsDependence({ substance: 'cannabis', outOfControl: '3', anxiousMissing: '0', worried: '0', wishStop: '0', difficultyStopping: '0' }).abnormal, false); // 3 < 4
  assert.equal(sdsDependence({ substance: 'cannabis', outOfControl: '2', anxiousMissing: '2', worried: '0', wishStop: '0', difficultyStopping: '0' }).abnormal, true); // 4
});

test('other substance has no fixed cutoff', () => {
  const r = sdsDependence({ substance: 'other', ...ITEMS(3) });
  assert.equal(r.score, 15);
  assert.equal(r.cutoff, null);
  assert.equal(r.abnormal, false);
  assert.match(r.band, /no fixed cutoff/);
});

test('below the cutoff is not flagged', () => {
  const r = sdsDependence({ substance: 'heroin', outOfControl: '1', anxiousMissing: '1', worried: '0', wishStop: '0', difficultyStopping: '0' }); // 2 < 5
  assert.equal(r.abnormal, false);
  assert.match(r.band, /below the heroin dependence cutoff/);
});

test('substance and all items are required; items 0-3', () => {
  assert.equal(sdsDependence({}).valid, false);
  assert.equal(sdsDependence({}).field, 'substance');
  assert.equal(sdsDependence({ substance: 'heroin' }).field, 'outOfControl');
  assert.equal(sdsDependence({ substance: 'heroin', ...ITEMS(4) }).valid, false); // 4 out of range
});
