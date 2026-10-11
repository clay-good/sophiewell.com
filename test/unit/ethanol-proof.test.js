// spec-v1629 tool 19: alcohol proof, proof gallons, tax and dilution (27 CFR part 30; 26 U.S.C. 5001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ethanolProof as ep, LITERS_PER_GALLON } from '../../lib/ethanol-proof-v1629.js';

test('95% by volume is 190 proof, and back', () => {
  assert.equal(ep({ mode: 'convert', percent: 95 }).proof, 190);
  assert.equal(ep({ mode: 'convert', proof: 80 }).percent, 40);
  // Proof is stated to the nearest tenth (27 CFR 30.31(a)).
  assert.equal(ep({ mode: 'convert', percent: 40.26 }).proof, 80.5);
  assert.match(ep({ mode: 'convert' }).message, /either the percent of ethanol by volume or the proof/);
  assert.match(ep({ mode: 'convert', percent: 40, proof: 80 }).message, /not both and not neither/);
  assert.match(ep({ mode: 'convert', percent: 120 }).message, /between 0 and 100/);
});

test('1 gallon at 190 proof is 1.9 proof gallons, and $25.65 at $13.50', () => {
  assert.equal(ep({ mode: 'gallons', volume: 1, volumeUnit: 'gal', proof: 190 }).proofGallons, 1.9);
  assert.equal(ep({ mode: 'gallons', volume: LITERS_PER_GALLON, volumeUnit: 'L', proof: 190 }).proofGallons, 1.9);
  assert.equal(LITERS_PER_GALLON, 231 * 16.387064 / 1000); // 231 cubic inches at 2.54 cm to the inch
  const tax = ep({ mode: 'tax', proofGallons: 1.9, rate: 13.5 });
  assert.equal(tax.tax, 25.65);
  assert.match(tax.notes.join(' '), /\$13\.50 per proof gallon \(26 U\.S\.C\. 5001\(a\)\(1\)\)/);
  assert.match(tax.notes.join(' '), /\$2\.70 on the first 100,000 proof gallons and \$13\.34 on the next 22,130,000/);
});

test('the tax rate is never assumed', () => {
  const r = ep({ mode: 'tax', proofGallons: 1.9 });
  assert.equal(r.valid, false);
  assert.match(r.message, /Enter the tax rate/);
  assert.match(r.message, /Which rate applies is yours to say/);
  assert.match(r.message, /general rate is \$13\.50/);
  // A refusal longer than 280 characters is lifted out of the live result area as if it were a static note.
  assert.ok(r.message.length <= 280, `refusal is ${r.message.length} characters`);
});

test('the regulation\'s 191-to-188 example: 1.89 unrounded, with its printed 1.84 beside it, and never 1.92', () => {
  const r = ep({ mode: 'reduce', fromProof: 191, toProof: 188, gallons: 100, waterFrom: 5.59, waterTo: 7.36 });
  assert.equal(r.waterPer100, 1.89);
  assert.equal(r.regulationPrints, 1.84);
  const text = `${r.band} ${r.notes.join(' ')}`;
  assert.match(text, /regulation's own example, which prints 1\.84 gallons per 100/);
  assert.match(text, /95\.5 ÷ 94\.0 = 1\.01596 as 1\.01/);
  assert.doesNotMatch(text, /1\.92/);
});

test('112 to 100 proof gives 12.43, with the regulation\'s 12.42 beside it', () => {
  const r = ep({ mode: 'reduce', fromProof: 112, toProof: 100, gallons: 100, waterFrom: 47.75, waterTo: 53.73 });
  assert.equal(r.waterPer100, 12.43);
  assert.equal(r.regulationPrints, 12.42);
  // Half the quantity takes half the water, and an input that is not the regulation's example carries no such line.
  const half = ep({ mode: 'reduce', fromProof: 112, toProof: 100, gallons: 50, waterFrom: 47.75, waterTo: 53.73 });
  assert.equal(half.water, 6.21);
  assert.equal(ep({ mode: 'reduce', fromProof: 112, toProof: 100, gallons: 100, waterFrom: 47.7, waterTo: 53.73 }).regulationPrints, null);
});

test('raising proof is refused; the Table 6 water values are never assumed', () => {
  assert.match(ep({ mode: 'reduce', fromProof: 100, toProof: 112, gallons: 100, waterFrom: 53.73, waterTo: 47.75 }).message, /adding water cannot raise proof/);
  assert.match(ep({ mode: 'reduce', fromProof: 112, toProof: 100, gallons: 100 }).message, /Enter the parts water at the starting proof, from Table 6/);
  assert.match(ep({ mode: 'reduce', fromProof: 112, toProof: 100, gallons: 100, waterFrom: 53.73, waterTo: 47.75 }).message, /more parts water at a lower proof/);
  assert.match(ep({}).message, /Choose what to work out/);
  assert.match(ep({ mode: 'gallons', volume: 1, proof: 190 }).message, /Choose the unit of the volume/);
});
