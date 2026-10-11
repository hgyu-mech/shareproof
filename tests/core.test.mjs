import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync, inflateSync } from 'node:zlib';
import { MASK_COLOR, normalizeRect, detectCandidates, validatePixels, sanitizePNG } from '../dist/core.js';

function crc(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value ^= byte;
    for (let i = 0; i < 8; i++) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  }
  return (value ^ 0xffffffff) >>> 0;
}
function chunk(type, data = Buffer.alloc(0)) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const result = Buffer.alloc(data.length + 12);
  result.writeUInt32BE(data.length, 0); body.copy(result, 4);
  result.writeUInt32BE(crc(body), result.length - 4);
  return result;
}
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function header(width = 2, height = 2, colorType = 6, depth = 8) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0); data.writeUInt32BE(height, 4);
  data[8] = depth; data[9] = colorType;
  return chunk('IHDR', data);
}
function validRGBA(extra = []) {
  const rows = Buffer.from([0, 36, 43, 42, 255, 36, 43, 42, 255, 0, 36, 43, 42, 255, 36, 43, 42, 255]);
  return Buffer.concat([signature, header(), ...extra, chunk('IDAT', deflateSync(rows)), chunk('IEND')]);
}
function layout(words) { return [{ paragraphs: [{ lines: [{ words }] }] }]; }
function word(text, x0, y0, x1, y1, confidence = 91) { return { text, confidence, bbox: { x0, y0, x1, y1 } }; }

test('clipping covers fractional pixels and reverse-direction drags', () => {
  assert.deepEqual(normalizeRect({ x: -3.4, y: 2.2, w: 9.2, h: 20 }, 10, 10), { x: 0, y: 2, w: 6, h: 8 });
  assert.deepEqual(normalizeRect({ x: 8, y: 8, w: -5, h: -6 }, 10, 10), { x: 3, y: 2, w: 5, h: 6 });
  assert.equal(normalizeRect({ x: 11, y: 1, w: 4, h: 2 }, 10, 10), null);
  assert.equal(normalizeRect({ x: 1.5, y: 2.5, w: 0, h: 4 }, 10, 10), null);
  assert.throws(() => normalizeRect({ x: NaN, y: 0, w: 1, h: 1 }, 10, 10));
});

test('email candidate bounds use matched words and expose no sensitive text', () => {
  const candidates = detectCandidates(layout([
    word('Email:', 5, 20, 43, 32), word('rowan@example.invalid', 50, 20, 210, 32, 88),
  ]), 300, 100);
  assert.equal(candidates.length, 1);
  assert.deepEqual(candidates[0], { id: 'candidate-1', kind: 'email', rect: { x: 47, y: 17, w: 166, h: 18 }, confidence: 88 });
  assert.ok(!JSON.stringify(candidates).includes('rowan'));
});

test('split email tokens and phone tokens produce one padded source-coordinate box each', () => {
  const candidates = detectCandidates([
    ...layout([word('rowan', 10, 10, 45, 22), word('@', 47, 10, 54, 22), word('example.invalid', 57, 10, 160, 22)]),
    ...layout([word('Phone:', 5, 40, 42, 52), word('+1', 50, 40, 63, 52), word('(415)', 65, 40, 91, 52), word('555-0198', 93, 40, 150, 52, 84)]),
  ], 300, 100);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].kind, 'email');
  assert.deepEqual(candidates[1].rect, { x: 47, y: 37, w: 106, h: 18 });
  assert.equal(candidates[1].kind, 'phone');
  assert.equal(candidates[1].confidence, 84);
});

test('dates and numeric fragments are not phone matches, and candidate boxes clip to image', () => {
  assert.equal(detectCandidates(layout([word('2026-10-11', 0, 0, 100, 10), word('Invoice', 110, 0, 160, 10), word('12345', 170, 0, 200, 10)]), 300, 100).length, 0);
  const result = detectCandidates(layout([word('01012345678', -2, 0, 90, 15)]), 80, 20);
  assert.deepEqual(result[0].rect, { x: 0, y: 0, w: 80, h: 18 });
});

function pixels(width = 4, height = 4) {
  const result = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < result.length; i += 4) result.set(MASK_COLOR, i);
  return result;
}
test('all mask pixels must match, and overlapping selections count each pixel once', () => {
  const result = validatePixels(pixels(), 4, 4, [{ x: 0, y: 0, w: 3, h: 3 }, { x: 1, y: 1, w: 3, h: 3 }]);
  assert.deepEqual(result, { ok: true, checkedPixels: 14, failures: [] });
});
test('a mismatched RGB pixel or alpha leak fails the decoded export', () => {
  const rgba = pixels(); rgba[4] = 37;
  let result = validatePixels(rgba, 4, 4, [{ x: 0, y: 0, w: 2, h: 2 }]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.failures[0].firstMismatch, { x: 1, y: 0 });
  const leaked = pixels(); leaked[3] = 254;
  result = validatePixels(leaked, 4, 4, [{ x: 0, y: 0, w: 1, h: 1 }]);
  assert.equal(result.ok, false);
  assert.equal(result.failures[0].mismatchedPixels, 1);
});
test('no selected regions, empty regions, stale buffer dimensions, and translucent colors cannot pass', () => {
  assert.equal(validatePixels(pixels(), 4, 4, []).ok, false);
  assert.equal(validatePixels(pixels(), 4, 4, [{ x: 8, y: 8, w: 1, h: 1 }]).ok, false);
  assert.throws(() => validatePixels(pixels(), 5, 5, [{ x: 0, y: 0, w: 1, h: 1 }]));
  assert.throws(() => validatePixels(pixels(), 4, 4, [{ x: 0, y: 0, w: 1, h: 1 }], [36, 43, 42, 128]));
});

test('PNG text, EXIF, and unknown ancillary chunks are removed without changing IDAT or its CRC', () => {
  const input = validRGBA([chunk('tEXt', Buffer.from('Author\0Private sample')), chunk('eXIf', Buffer.from([1, 2, 3])), chunk('vpAg', Buffer.from('private'))]);
  const result = sanitizePNG(input);
  assert.deepEqual(result.removed, ['tEXt', 'eXIf', 'vpAg']);
  assert.deepEqual(result.retained, ['IHDR', 'IDAT', 'IEND']);
  assert.equal(result.width, 2); assert.equal(result.height, 2);
  assert.deepEqual(Buffer.from(result.bytes), validRGBA());
  // Independently decompress the image payload, rather than accepting a header-only fixture.
  const png = Buffer.from(result.bytes); const dataLength = png.readUInt32BE(33);
  const decoded = inflateSync(png.subarray(41, 41 + dataLength));
  assert.equal(decoded.length, 18);
});
test('indexed PNG preserves its essential palette and transparency', () => {
  const input = Buffer.concat([signature, header(1, 1, 3), chunk('PLTE', Buffer.from([36, 43, 42])), chunk('tRNS', Buffer.from([255])), chunk('IDAT', deflateSync(Buffer.from([0, 0]))), chunk('IEND')]);
  const result = sanitizePNG(input);
  assert.deepEqual(result.retained, ['IHDR', 'PLTE', 'tRNS', 'IDAT', 'IEND']);
  assert.deepEqual(Buffer.from(result.bytes), input);
});
test('malformed signature, CRC, truncated data, trailing bytes, and huge claimed lengths fail', () => {
  const badSignature = validRGBA(); badSignature[0] = 0;
  assert.throws(() => sanitizePNG(badSignature), /signature/);
  const badCRC = validRGBA(); badCRC[29] ^= 1;
  assert.throws(() => sanitizePNG(badCRC), /checksum/);
  assert.throws(() => sanitizePNG(validRGBA().subarray(0, -1)), /length|truncated/);
  assert.throws(() => sanitizePNG(Buffer.concat([validRGBA(), Buffer.from('secret')])), /trailing/);
  const huge = validRGBA(); huge.writeUInt32BE(0xffffffff, 33);
  assert.throws(() => sanitizePNG(huge), /length/);
});
test('unknown critical chunks, missing IEND, duplicated IHDR, APNG, and split IDAT are rejected', () => {
  assert.throws(() => sanitizePNG(validRGBA([chunk('ABCD')])), /critical/);
  assert.throws(() => sanitizePNG(validRGBA().subarray(0, -12)), /missing IEND/);
  assert.throws(() => sanitizePNG(validRGBA([header()])), /repeated IHDR/);
  assert.throws(() => sanitizePNG(validRGBA([chunk('acTL', Buffer.alloc(8))])), /animated/);
  const split = Buffer.concat([signature, header(), chunk('IDAT', Buffer.from([1])), chunk('tEXt', Buffer.from('a\0b')), chunk('IDAT', Buffer.from([2])), chunk('IEND')]);
  assert.throws(() => sanitizePNG(split), /data order/);
});
test('invalid PNG dimensions and indexed image without a palette cannot be accepted', () => {
  const zero = Buffer.concat([signature, header(0, 2), chunk('IDAT', Buffer.from([1])), chunk('IEND')]);
  assert.throws(() => sanitizePNG(zero), /dimensions/);
  const noPalette = Buffer.concat([signature, header(1, 1, 3), chunk('IDAT', Buffer.from([1])), chunk('IEND')]);
  assert.throws(() => sanitizePNG(noPalette), /data order/);
});
