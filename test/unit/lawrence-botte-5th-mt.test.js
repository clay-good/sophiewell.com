// spec-v1422: Lawrence and Botte zones of proximal fifth metatarsal fractures (Caruso & Chin 2025).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lawrenceBotte5thMt as lb } from '../../lib/lawrence-botte-5th-mt-v1422.js';

test('each location maps to its zone', () => {
  assert.equal(lb({ location: 'tuberosity' }).zone, 1);
  assert.equal(lb({ location: 'metadiaphyseal' }).zone, 2);
  assert.equal(lb({ location: 'diaphyseal', torg: 'acute' }).zone, 3);
  assert.equal(lb({ location: 'metadiaphyseal' }).band, 'Lawrence and Botte zone 2: Jones fracture of the metaphyseal-diaphyseal junction.');
});

test('zone 3 takes its Torg type from the fracture line and canal', () => {
  assert.equal(lb({ location: 'diaphyseal', torg: 'acute' }).torgType, 'I');
  assert.equal(lb({ location: 'diaphyseal', torg: 'delayed' }).torgType, 'II');
  const r = lb({ location: 'diaphyseal', torg: 'nonunion' });
  assert.equal(r.torgType, 'III');
  assert.equal(r.bandLabel, 'Zone 3, Torg III');
  assert.equal(r.band, 'Lawrence and Botte zone 3, Torg type III: diaphyseal stress fracture, symptomatic nonunion.');
});

test('a Torg entry outside zone 3 is not used, and says so', () => {
  const r = lb({ location: 'tuberosity', torg: 'nonunion' });
  assert.equal(r.zone, 1);
  assert.equal(r.torgType, null);
  assert.match(r.notes[0], /only for zone 3/);
});

test('share, healing potential and reliability ride with each zone', () => {
  assert.ok(lb({ location: 'tuberosity' }).notes.some((n) => /93%/.test(n) && /excellent/.test(n)));
  assert.ok(lb({ location: 'metadiaphyseal' }).notes.some((n) => /4%/.test(n) && /good/.test(n)));
  assert.ok(lb({ location: 'diaphyseal', torg: 'acute' }).notes.some((n) => /3%/.test(n) && /variable/.test(n)));
  assert.ok(lb({ location: 'metadiaphyseal' }).notes.some((n) => /merged/.test(n)));
  assert.ok(lb({ location: 'tuberosity' }).notes.some((n) => /0\.537/.test(n)));
});

test('missing findings are asked for', () => {
  assert.equal(lb({}).valid, false);
  assert.match(lb({ location: 'diaphyseal' }).message, /Torg/);
  assert.equal(lb({ location: 'metadiaphyseal' }).valid, true);
});
