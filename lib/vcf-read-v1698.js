// spec-v1698: read a VCF without loading it whole -- the genotype at one position (vcf-variant-lookup) and the
// file's counts (vcf-qc-summary).
//
// VCFv4.5 (samtools hts-specs, §1 read November 7, 2026): eight fixed columns CHROM POS ID REF ALT QUAL FILTER
// INFO, then FORMAT and one column per sample; GT alleles separated by "/" (unphased) or "|" (phased), "." for a
// missing allele; positions "sorted numerically, in increasing order, within each reference sequence CHROM".
// A bgzipped file is read block by block (SAMv1 §4.1, lib/bgzf.js); any other gzip is streamed as one member.
//
// The file is streamed: only the current line, the counters and the matched records are held. The raw bytes are
// hashed in the same pass, so the receipt names the file that was read. No annotation, no build conversion, no
// phenotype: a genotype is reported as written in the file.
//
// Pure: Blob, DecompressionStream and TextDecoder only, so it runs in the browser worker and in Node.

import { blockLengthAt, BGZF_EOF } from './bgzf.js';
import { Sha256 } from './sha256.js';

const inflate = async (bytes) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());

// chunks(blob, state) -> async iterator of Uint8Array (uncompressed). state gets bytesRead, compression,
// eofMarker and the SHA-256 of the raw bytes.
async function* chunks(blob, state) {
  const hash = new Sha256();
  const head = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  const gz = head[0] === 0x1f && head[1] === 0x8b;
  const firstBlock = gz ? await blockLengthAt(blob, 0) : null;
  if (firstBlock !== null) {
    state.compression = 'bgzf';
    let offset = 0;
    let last = null;
    while (offset < blob.size) {
      const length = offset === 0 ? firstBlock : await blockLengthAt(blob, offset);
      if (length === null) throw new Error(`The BGZF data is damaged at byte ${offset}: no block starts there.`);
      if (offset + length > blob.size) throw new Error(`The BGZF data is damaged at byte ${offset}: its block runs past the end of the file.`);
      const raw = new Uint8Array(await blob.slice(offset, offset + length).arrayBuffer());
      hash.update(raw);
      last = raw;
      offset += length;
      state.bytesRead = offset;
      let out;
      try { out = await inflate(raw); } catch { throw new Error(`The BGZF block at byte ${offset - length} is damaged: it does not decompress. The file is corrupt or truncated.`); }
      if (out.length) yield out;
    }
    state.eofMarker = Boolean(last && last.length === BGZF_EOF.length && last.every((b, i) => b === BGZF_EOF[i]));
  } else {
    state.compression = gz ? 'gzip' : 'none';
    const counting = new TransformStream({
      transform(chunk, ctl) { hash.update(chunk); state.bytesRead += chunk.length; ctl.enqueue(chunk); },
    });
    let stream = blob.stream().pipeThrough(counting);
    if (gz) stream = stream.pipeThrough(new DecompressionStream('gzip'));
    const reader = stream.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } catch {
      throw new Error('The compressed data is damaged, or it joins several gzip files without the block sizes bgzip writes. Decompress it first, or recompress it with bgzip.');
    }
  }
  state.sha256 = hash.hex();
}

// One line may hold many samples' genotypes, but not this much: a file (or a decompression bomb) with no line break
// would otherwise grow without bound (spec-v1716).
export const MAX_LINE_CHARS = 64 * 1024 * 1024;
async function* lines(blob, state) {
  const dec = new TextDecoder('utf-8');
  let pieces = [];
  let pending = 0;
  const overlong = () => new Error(`A line runs past ${MAX_LINE_CHARS.toLocaleString('en-US')} characters without a line break; this is not a VCF this reader can read.`);
  for await (const c of chunks(blob, state)) {
    const text = dec.decode(c, { stream: true });
    if (!text.includes('\n')) {
      // No line ends in this chunk: keep the piece without re-copying what came before.
      pieces.push(text);
      pending += text.length;
      if (pending > MAX_LINE_CHARS) throw overlong();
      continue;
    }
    const parts = (pieces.join('') + text).split('\n');
    pieces = [parts.pop()];
    pending = pieces[0].length;
    for (const p of parts) {
      if (p.length > MAX_LINE_CHARS) throw overlong();
      yield p.endsWith('\r') ? p.slice(0, -1) : p;
    }
  }
  const carry = pieces.join('') + dec.decode();
  if (carry.length > MAX_LINE_CHARS) throw overlong();
  if (carry) yield carry.endsWith('\r') ? carry.slice(0, -1) : carry;
}

const stripChr = (c) => String(c).replace(/^chr/i, '');

// genotype(formatKeys, sampleField) -> { gt, phased, alleles, zygosity, dp, gq, ad }
export function genotype(formatKeys, field) {
  const vals = String(field ?? '').split(':');
  const get = (k) => { const i = formatKeys.indexOf(k); return i === -1 || vals[i] === undefined || vals[i] === '.' || vals[i] === '' ? null : vals[i]; };
  const gt = get('GT');
  const out = { gt, phased: null, alleles: null, zygosity: 'no genotype (GT) in this record', dp: null, gq: null, ad: null };
  const num = (k) => { const v = get(k); return v !== null && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null; };
  out.dp = num('DP');
  out.gq = num('GQ');
  const ad = get('AD');
  if (ad) out.ad = ad.split(',').map((x) => (/^\d+$/.test(x) ? Number(x) : null));
  // VCFv4.4 allows a phasing mark before the first allele ("|1" is a phased haploid ALT); anything else that is
  // not alleles joined by / or | is not read as a genotype (spec-v1716).
  if (gt && !/^[/|]?(\.|\d+)([/|](\.|\d+))*$/.test(gt)) {
    out.zygosity = `GT ${gt.slice(0, 20)} is not a readable genotype`;
    return out;
  }
  if (gt) {
    const alleles = gt.replace(/^[/|]/, '').split(/[/|]/);
    out.alleles = alleles.map((a) => (a === '.' ? null : Number(a)));
    out.phased = alleles.length > 1 || /^[/|]/.test(gt) ? gt.includes('|') : null;
    if (out.alleles.some((a) => a === null || !Number.isInteger(a))) out.zygosity = 'missing';
    else if (alleles.length === 1) out.zygosity = out.alleles[0] === 0 ? 'haploid or hemizygous, reference' : 'haploid or hemizygous, alternate';
    else if (alleles.length > 2) out.zygosity = `${alleles.length} alleles (polyploid); not classified`;
    else if (out.alleles[0] === 0 && out.alleles[1] === 0) out.zygosity = 'homozygous reference';
    else if (out.alleles[0] !== out.alleles[1]) out.zygosity = 'heterozygous';
    else out.zygosity = 'homozygous alternate';
  }
  return out;
}

// alleleType(ref, alt) -> 'SNV' | 'insertion' | 'deletion' | 'other'
export function alleleType(ref, alt) {
  const r = String(ref).toUpperCase();
  const a = String(alt).toUpperCase();
  if (!/^[ACGTN]+$/.test(r) || !/^[ACGTN]+$/.test(a)) return 'other';
  if (r.length === 1 && a.length === 1) return r === a || r === 'N' || a === 'N' ? 'other' : 'SNV';
  if (a.length > r.length && a.startsWith(r)) return 'insertion';
  if (r.length > a.length && r.startsWith(a)) return 'deletion';
  return 'other';
}
const TRANSITION = new Set(['AG', 'GA', 'CT', 'TC']);

function parseQuery(q = {}) {
  const id = String(q.id ?? '').trim();
  const chrom = String(q.chrom ?? '').trim();
  const posRaw = String(q.pos ?? '').trim().replace(/,/g, '');
  if (!id && !chrom && !posRaw) return { message: 'Enter a position (chromosome and position) or an ID from the file\'s ID column.' };
  if (id && (chrom || posRaw)) return { message: 'Enter a position or an ID, not both.' };
  if (id === '.') return { message: 'An ID of "." is VCF\'s missing value, not an ID; enter a position or a real ID.' };
  if (id) return { id };
  if (!chrom) return { message: 'Enter the chromosome as the file writes it, for example 20 or chr20.' };
  if (!/^\d+$/.test(posRaw) || Number(posRaw) < 1) return { message: 'Enter the position as a whole number of at least 1 (VCF positions start at 1).' };
  const ref = String(q.ref ?? '').trim().toUpperCase();
  const alt = String(q.alt ?? '').trim().toUpperCase();
  return { chrom, pos: Number(posRaw), ref: ref || null, alt: alt || null };
}

// readVcf(blob, { mode: 'lookup' | 'summary', query, sample, onProgress, progressEvery }) -> result
export async function readVcf(blob, opts = {}) {
  if (!blob || typeof blob.stream !== 'function') return { valid: false, message: 'Choose a VCF file (.vcf, .vcf.gz or .vcf.bgz).' };
  const mode = opts.mode === 'summary' ? 'summary' : 'lookup';
  let query = null;
  if (mode === 'lookup') {
    query = parseQuery(opts.query);
    if (query.message) return { valid: false, message: query.message };
  }
  const wantSample = String(opts.sample ?? '').trim();
  const state = { bytesRead: 0, compression: 'none', eofMarker: null, sha256: null };
  const t0 = Date.now();
  let lineNo = 0;
  let samples = null;
  let sampleIndex = -1;
  let fileformat = null;
  const assembly = new Set();
  let reference = null;
  const notes = [];
  // lookup
  const matches = [];
  const covering = [];
  let aliasUsed = false;
  let stoppedEarly = false;
  // sort tracking
  const lastPos = new Map();
  let unsorted = false;
  // summary
  const s = { noGt: 0, records: 0, pass: 0, refOnly: 0, multiallelic: 0, SNV: 0, insertion: 0, deletion: 0, other: 0, ti: 0, tv: 0, het: 0, homAlt: 0, homRef: 0, missing: 0, haploid: 0, otherGt: 0, perChrom: new Map() };
  const tick = Math.max(1, Number(opts.progressEvery) || 20000);

  try {
    for await (const line of lines(blob, state)) {
      lineNo += 1;
      if (lineNo === 1) {
        const m = /^##fileformat=(VCFv[\d.]+)/.exec(line);
        if (!m) return { valid: false, message: 'This is not a VCF: its first line is not ##fileformat=VCFv4.x.' };
        fileformat = m[1];
        continue;
      }
      if (line.startsWith('##')) {
        const ref = /^##reference=(.*)$/.exec(line);
        if (ref) reference = ref[1];
        const asm = /^##contig=<.*\bassembly=([^,>]+)/.exec(line);
        if (asm) assembly.add(asm[1]);
        continue;
      }
      if (line.startsWith('#')) {
        const cols = line.slice(1).split('\t');
        samples = cols.slice(9);
        if (samples.length) {
          if (wantSample) {
            sampleIndex = samples.indexOf(wantSample);
            if (sampleIndex === -1) return { valid: false, message: `No sample named ${wantSample.slice(0, 40)} in this file. Its samples are: ${samples.slice(0, 10).join(', ')}${samples.length > 10 ? ` and ${samples.length - 10} more` : ''}.` };
          } else sampleIndex = 0;
        }
        continue;
      }
      if (!line) continue;
      if (samples === null) return { valid: false, message: 'The file has no #CHROM header line before its first record.' };
      const f = line.split('\t');
      if (f.length < 8) return { valid: false, message: `Line ${lineNo} has ${f.length} tab-separated columns; a VCF record has at least 8.` };
      const [chrom, posStr, id, ref, altStr, qual, filter] = f;
      const pos = /^\d+$/.test(posStr) ? Number(posStr) : NaN;
      if (!Number.isInteger(pos)) return { valid: false, message: `Line ${lineNo}: the position is not a whole number.` };
      if (lastPos.has(chrom) && pos < lastPos.get(chrom)) unsorted = true;
      lastPos.set(chrom, pos);
      const alts = altStr === '.' ? [] : altStr.split(',');
      const fmt = f.length > 8 ? f[8].split(':') : [];
      const sf = sampleIndex >= 0 ? f[9 + sampleIndex] : undefined;

      if (mode === 'lookup') {
        let hit = false;
        if (query.id) hit = id.split(';').includes(query.id);
        else {
          const same = chrom === query.chrom;
          const alias = !same && stripChr(chrom) === stripChr(query.chrom);
          if ((same || alias) && pos === query.pos && (!query.ref || ref.toUpperCase() === query.ref) && (!query.alt || alts.map((a) => a.toUpperCase()).includes(query.alt))) {
            hit = true;
            if (alias) aliasUsed = true;
          }
          // A record that starts before the position and whose REF spans it (a deletion or a longer REF) covers it.
          if ((same || alias) && pos < query.pos && pos + ref.length - 1 >= query.pos && covering.length < 10) {
            covering.push({ chrom, pos, ref, alt: altStr, filter, gt: sf !== undefined && fmt.length ? genotype(fmt, sf).gt : null });
          }
          if ((same || alias) && pos > query.pos && !unsorted) { stoppedEarly = true; break; }
        }
        if (hit) {
          const g = sf !== undefined && fmt.length ? genotype(fmt, sf) : null;
          let ab = null;
          let abAllele = null;
          if (g && g.ad) {
            abAllele = query.alt ? alts.map((a) => a.toUpperCase()).indexOf(query.alt) + 1 : (g.alleles || []).find((a) => a && a > 0) || (alts.length ? 1 : null);
            const total = g.ad.reduce((t, x) => t + (x ?? 0), 0);
            if (abAllele && g.ad[abAllele] != null && total > 0) ab = Number((g.ad[abAllele] / total).toFixed(3));
          }
          matches.push({ chrom, pos, id, ref, alt: altStr, alts, qual, filter, genotype: g, alleleBalance: ab, alleleBalanceAllele: abAllele });
          if (matches.length >= 50) { notes.push('Stopped at 50 matching records.'); break; }
        }
      } else {
        s.records += 1;
        s.perChrom.set(chrom, (s.perChrom.get(chrom) || 0) + 1);
        if (filter === 'PASS') s.pass += 1;
        if (!alts.length) s.refOnly += 1;
        if (alts.length > 1) s.multiallelic += 1;
        for (const a of alts) {
          const t = alleleType(ref, a);
          s[t] += 1;
          if (t === 'SNV') { if (TRANSITION.has(ref.toUpperCase() + a.toUpperCase())) s.ti += 1; else s.tv += 1; }
        }
        if (sf === undefined || !fmt.length) { if (sampleIndex >= 0) s.noGt += 1; } else {
          const z = genotype(fmt, sf).zygosity;
          if (z === 'heterozygous') s.het += 1;
          else if (z === 'homozygous alternate') s.homAlt += 1;
          else if (z === 'homozygous reference') s.homRef += 1;
          else if (z === 'missing') s.missing += 1;
          else if (z.startsWith('haploid')) s.haploid += 1;
          else s.otherGt += 1;
        }
      }
      if (opts.onProgress && lineNo % tick === 0) opts.onProgress({ bytesRead: state.bytesRead, size: blob.size });
    }
  } catch (err) {
    return { valid: false, message: err instanceof Error ? err.message : String(err) };
  }
  if (lineNo === 0) return { valid: false, message: 'The file is empty.' };
  if (samples === null) return { valid: false, message: 'The file has no #CHROM header line.' };

  const file = {
    fileformat, compression: state.compression, eofMarker: state.eofMarker, bytesRead: state.bytesRead, size: blob.size,
    sha256: stoppedEarly ? null : state.sha256, seconds: Number(((Date.now() - t0) / 1000).toFixed(2)),
    assembly: [...assembly], reference, samples: samples.length, sample: sampleIndex >= 0 ? samples[sampleIndex] : null,
  };
  const fileNotes = [];
  fileNotes.push(`${fileformat}; ${state.compression === 'bgzf' ? 'bgzip-compressed, read block by block' : state.compression === 'gzip' ? 'gzip-compressed' : 'uncompressed'}; ${state.bytesRead.toLocaleString('en-US')} of ${blob.size.toLocaleString('en-US')} bytes read.`);
  if (state.compression === 'bgzf' && !state.eofMarker && !stoppedEarly) fileNotes.push('The file does not end with the BGZF end-of-file block, so it may be truncated.');
  if (assembly.size || reference) fileNotes.push(`Assembly as the file states it: ${[...assembly].join(', ') || reference}. A position means nothing across builds; this tool does not convert between them.`);
  else fileNotes.push('The file states no assembly; a position means nothing across builds, so check which build it was called against.');
  if (!/^VCFv4\.[0-5]$/.test(fileformat)) fileNotes.push(`${fileformat} is not a version this reader was written against (VCFv4.0 to 4.5); it was read as 4.x.`);
  if (unsorted) fileNotes.push('Records are not in position order within a chromosome, so the whole file was read.');
  if (samples.length > 1) fileNotes.push(`${samples.length} samples; reporting ${file.sample}${wantSample ? '' : ' (the first; name another to switch)'}.`);
  if (!samples.length) fileNotes.push('The file has no sample columns, so no genotype can be reported.');

  if (mode === 'lookup') {
    const where = query.id ? `ID ${query.id}` : `${query.chrom}:${query.pos}${query.ref ? ` ${query.ref}` : ''}${query.alt ? `>${query.alt}` : ''}`;
    if (!matches.length) {
      return {
        valid: true, found: false, file, matches: [],
        band: covering.length
          ? `${where} has no record of its own, but the record at ${covering[0].chrom}:${covering[0].pos} (REF ${covering[0].ref.length > 12 ? `${covering[0].ref.slice(0, 12)}...` : covering[0].ref}, ALT ${covering[0].alt}${covering[0].gt ? `, GT ${covering[0].gt}` : ''}) spans it.`
          : `${where} is not in this file.`,
        covering,
        notes: [...covering.map((c) => `${c.chrom}:${c.pos} REF ${c.ref} (${c.ref.length} bases, through ${c.pos + c.ref.length - 1}), ALT ${c.alt}, FILTER ${c.filter}${c.gt ? `, GT ${c.gt}` : ''}: its REF covers ${query.pos}, so the variant called there changes that base (a deletion removes it).`), ...fileNotes, ...(stoppedEarly ? ['Reading stopped once the file passed that position on that chromosome: VCF requires positions in increasing order within a chromosome, and no disorder was seen before it.'] : []), 'Many VCFs list only the sites where a variant was called, so a position missing from the file is not evidence that the genotype there is reference.'],
      };
    }
    const shown = [];
    for (const m of matches) {
      const g = m.genotype;
      const named = g && g.alleles ? g.alleles.map((a) => (a === null ? '.' : a === 0 ? `${m.ref} (REF)` : `${m.alts[a - 1] ?? '?'} (ALT ${a})`)).join(g.phased ? ' | ' : ' / ') : null;
      const parts = [`${m.chrom}:${m.pos} ${m.id !== '.' ? `${m.id} ` : ''}REF ${m.ref}, ALT ${m.alt}${m.alts.length ? '' : ' (a reference-only site: no alternate allele was called)'}, QUAL ${m.qual}, FILTER ${m.filter}.`];
      if (!g) parts.push('No genotype for this sample.');
      else {
        parts.push(`GT ${g.gt ?? '.'}${g.phased === true ? ' (phased)' : g.phased === false ? ' (unphased)' : ''}: ${g.zygosity}${named ? `, ${named}` : ''}.`);
        const extra = [g.dp !== null ? `DP ${g.dp}` : null, g.gq !== null ? `GQ ${g.gq}` : null, m.alleleBalance !== null ? `allele balance ${m.alleleBalance} (AD of ALT ${m.alleleBalanceAllele} over all AD)` : null].filter(Boolean);
        if (extra.length) parts.push(`${extra.join(', ')}.`);
      }
      shown.push(parts.join(' '));
    }
    const first = matches[0].genotype;
    return {
      valid: true, found: true, file, matches: matches.map(({ genotype: g, ...rest }) => ({ ...rest, gt: g ? g.gt : null, zygosity: g ? g.zygosity : null, phased: g ? g.phased : null, dp: g ? g.dp : null, gq: g ? g.gq : null })),
      band: `${where}: ${matches.length === 1 ? (first ? `${first.gt ?? '.'}, ${first.zygosity}` : 'found, no genotype') : `${matches.length} matching records`}${file.sample ? ` in ${file.sample}` : ''}.`,
      notes: [...shown, ...(aliasUsed ? [`The file writes the chromosome as ${matches[0].chrom}; it was matched to ${query.chrom} with the "chr" prefix ignored.`] : []), ...fileNotes, ...notes],
    };
  }

  const titv = s.tv ? Number((s.ti / s.tv).toFixed(2)) : null;
  const ratio = s.homAlt ? Number((s.het / s.homAlt).toFixed(2)) : null;
  const perChrom = [...s.perChrom.entries()];
  const summaryNotes = [
    `Records ${s.records.toLocaleString('en-US')}; FILTER PASS ${s.pass.toLocaleString('en-US')}; reference-only (ALT ".") ${s.refOnly.toLocaleString('en-US')}; multiallelic (more than one ALT) ${s.multiallelic.toLocaleString('en-US')}.`,
    `Per ALT allele: SNV ${s.SNV.toLocaleString('en-US')}, insertion ${s.insertion.toLocaleString('en-US')}, deletion ${s.deletion.toLocaleString('en-US')}, other ${s.other.toLocaleString('en-US')} (an insertion's ALT begins with the whole REF, a deletion's REF with the whole ALT; MNVs, symbolic and complex alleles are "other").`,
    `Transitions (A<->G, C<->T) ${s.ti.toLocaleString('en-US')}, transversions ${s.tv.toLocaleString('en-US')}, over SNV ALT alleles: Ti/Tv ${titv === null ? 'not defined (no transversions)' : titv.toFixed(2)}.`,
    ...(file.sample ? [`${file.sample}: heterozygous ${s.het.toLocaleString('en-US')}, homozygous alternate ${s.homAlt.toLocaleString('en-US')}, homozygous reference ${s.homRef.toLocaleString('en-US')}, missing ${s.missing.toLocaleString('en-US')}${s.haploid ? `, haploid or hemizygous ${s.haploid.toLocaleString('en-US')}` : ''}${s.otherGt ? `, other ${s.otherGt.toLocaleString('en-US')}` : ''}${s.noGt ? `; ${s.noGt.toLocaleString('en-US')} record${s.noGt === 1 ? '' : 's'} with no genotype column for this sample, not counted` : ''}; het/hom-alt ${ratio === null ? 'not defined (no homozygous-alternate calls)' : ratio.toFixed(2)}.`] : []),
    `Per chromosome: ${perChrom.slice(0, 40).map(([c, n]) => `${c} ${n.toLocaleString('en-US')}`).join(', ')}${perChrom.length > 40 ? ` and ${perChrom.length - 40} more` : ''}.`,
  ];
  return {
    valid: true, file,
    totals: { records: s.records, pass: s.pass, refOnly: s.refOnly, multiallelic: s.multiallelic, snv: s.SNV, insertion: s.insertion, deletion: s.deletion, other: s.other, transitions: s.ti, transversions: s.tv, titv, het: s.het, homAlt: s.homAlt, homRef: s.homRef, missing: s.missing, hetHomAlt: ratio, chromosomes: perChrom.length },
    band: `${s.records.toLocaleString('en-US')} records, ${s.pass.toLocaleString('en-US')} PASS; Ti/Tv ${titv === null ? 'not defined' : titv.toFixed(2)}${file.sample ? `; ${file.sample} het/hom-alt ${ratio === null ? 'not defined' : ratio.toFixed(2)}` : ''}.`,
    notes: [...summaryNotes, ...fileNotes, 'No expected range is printed: Ti/Tv and het/hom-alt depend on the capture, the caller and ancestry.'],
  };
}

// sniffVcfGz(blob) -> the VCF version when the file is bgzipped and its first block starts a VCF, else null.
// Recognition reads only a file's head, which for a .vcf.gz is compressed; this decodes the first block alone.
export async function sniffVcfGz(blob) {
  const length = await blockLengthAt(blob, 0);
  if (length === null || length > blob.size) {
    // Plain (not bgzip) gzip: readVcf reads it too, so decode just the first chunk of the stream (spec-v1716).
    let reader = null;
    try {
      reader = blob.stream().pipeThrough(new DecompressionStream('gzip')).getReader();
      const { value } = await reader.read();
      const m = value ? /^##fileformat=(VCFv[\d.]+)/.exec(new TextDecoder().decode(value.subarray(0, 64))) : null;
      return m ? m[1] : null;
    } catch { return null; } finally { if (reader) reader.cancel().catch(() => {}); }
  }
  try {
    const text = new TextDecoder().decode((await inflate(new Uint8Array(await blob.slice(0, length).arrayBuffer()))).subarray(0, 64));
    const m = /^##fileformat=(VCFv[\d.]+)/.exec(text);
    return m ? m[1] : null;
  } catch { return null; }
}
