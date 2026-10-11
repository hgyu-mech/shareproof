// ShareProof's verification scope is selected image regions and PNG structure.
// Candidate detection does not decide whether an image is safe to share.
export const MASK_COLOR = Object.freeze([36, 43, 42, 255]);
export const MAX_PIXELS = 50_000_000;

function dimensions(width, height) {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || width * height > MAX_PIXELS) {
    throw new RangeError('Image dimensions are outside the supported range.');
  }
}

/** Clip to source pixels, covering fractional edges rather than rounding them in. */
export function normalizeRect(rect, width, height) {
  dimensions(width, height);
  if (!rect || typeof rect !== 'object') throw new TypeError('A rectangle is required.');
  let x0, y0, x1, y1;
  if ('x0' in rect || 'x1' in rect) {
    ({ x0, y0, x1, y1 } = rect);
  } else {
    x0 = rect.x; y0 = rect.y;
    x1 = x0 + rect.w; y1 = y0 + rect.h;
  }
  if (![x0, y0, x1, y1].every(Number.isFinite)) throw new TypeError('Rectangle coordinates must be finite numbers.');
  if (x0 === x1 || y0 === y1) return null;
  const left = Math.max(0, Math.min(width, Math.floor(Math.min(x0, x1))));
  const top = Math.max(0, Math.min(height, Math.floor(Math.min(y0, y1))));
  const right = Math.max(0, Math.min(width, Math.ceil(Math.max(x0, x1))));
  const bottom = Math.max(0, Math.min(height, Math.ceil(Math.max(y0, y1))));
  return right > left && bottom > top ? { x: left, y: top, w: right - left, h: bottom - top } : null;
}

function getLines(input) {
  const lines = [];
  const seen = new WeakSet();
  let count = 0;
  const walk = value => {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);
    if (++count > 30_000) throw new RangeError('OCR layout exceeds the supported size.');
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (Array.isArray(value.words) && value.words.length) { lines.push(value); return; }
    let children = false;
    for (const key of ['blocks', 'paragraphs', 'lines']) {
      if (Array.isArray(value[key]) && value[key].length) { children = true; walk(value[key]); }
    }
    if (!children && typeof value.text === 'string' && value.bbox) lines.push({ ...value, words: [value] });
  };
  walk(input);
  return lines;
}

/** Tesseract v6 blocks, or an object containing blocks. No OCR text leaves this API. */
export function detectCandidates(blocks, width, height) {
  dimensions(width, height);
  const results = [];
  const seen = new Set();
  const patterns = [
    ['email', /[A-Z0-9._%+-]+\s*@\s*[A-Z0-9-]+(?:\s*\.\s*[A-Z0-9-]+)+/gi],
    ['phone', /(?<![\w@])\+?\d[\d ().-]{8,}\d(?![\w@])/g],
  ];
  for (const line of getLines(blocks)) {
    const spans = [];
    let text = '';
    for (const word of line.words) {
      if (!word || typeof word.text !== 'string' || !word.bbox || !word.text.trim()) continue;
      const start = text.length;
      text += word.text;
      spans.push({ start, end: text.length, word });
      text += ' ';
    }
    if (text.length > 100_000) throw new RangeError('An OCR line exceeds the supported size.');
    const matches = [];
    for (const [kind, pattern] of patterns) {
      pattern.lastIndex = 0;
      for (const match of text.matchAll(pattern)) {
        if (kind === 'phone') {
          const digits = match[0].replace(/\D/g, '').length;
          if (digits < 10 || digits > 15) continue;
        }
        matches.push({ kind, start: match.index, end: match.index + match[0].length });
      }
    }
    for (const match of matches) {
      // A number embedded in a recognized email is not a second phone candidate.
      if (match.kind === 'phone' && matches.some(m => m.kind === 'email' && m.start < match.end && m.end > match.start)) continue;
      const words = spans.filter(s => s.start < match.end && s.end > match.start).map(s => s.word);
      if (!words.length) continue;
      const coords = words.flatMap(w => [w.bbox.x0, w.bbox.y0, w.bbox.x1, w.bbox.y1]);
      if (!coords.every(Number.isFinite)) continue;
      const raw = { x0: Math.min(...words.map(w => w.bbox.x0)) - 3, y0: Math.min(...words.map(w => w.bbox.y0)) - 3,
        x1: Math.max(...words.map(w => w.bbox.x1)) + 3, y1: Math.max(...words.map(w => w.bbox.y1)) + 3 };
      const rect = normalizeRect(raw, width, height);
      if (!rect) continue;
      const key = `${match.kind}:${rect.x}:${rect.y}:${rect.w}:${rect.h}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const confidence = Math.min(...words.map(w => Number.isFinite(w.confidence) ? Math.max(0, Math.min(100, w.confidence)) : 0));
      results.push({ id: `candidate-${results.length + 1}`, kind: match.kind, rect, confidence });
    }
  }
  return results;
}

/** Inspect decoded export pixels, not editor layers. checkedPixels is unique pixels. */
export function validatePixels(rgba, width, height, rects, color = MASK_COLOR) {
  dimensions(width, height);
  if (!rgba || rgba.length !== width * height * 4) throw new RangeError('Decoded pixel length does not match the image.');
  if (!Array.isArray(color) || color.length !== 4 || !color.every(n => Number.isInteger(n) && n >= 0 && n <= 255) || color[3] !== 255) {
    throw new TypeError('Verification requires a fully opaque RGBA mask color.');
  }
  if (!Array.isArray(rects)) throw new TypeError('Selected rectangles must be an array.');
  const failures = [];
  let checkedPixels = 0;
  const checked = new Uint8Array(Math.ceil(width * height / 8));
  if (!rects.length) failures.push({ reason: 'no-selected-regions' });
  rects.forEach((input, rectIndex) => {
    let rect;
    try { rect = normalizeRect(input, width, height); }
    catch { failures.push({ rectIndex, reason: 'invalid-region' }); return; }
    if (!rect) { failures.push({ rectIndex, reason: 'empty-region' }); return; }
    let mismatchedPixels = 0;
    let firstMismatch;
    for (let y = rect.y; y < rect.y + rect.h; y++) {
      for (let x = rect.x; x < rect.x + rect.w; x++) {
        const pixel = y * width + x;
        const byte = pixel >>> 3;
        const bit = 1 << (pixel & 7);
        if (!(checked[byte] & bit)) { checked[byte] |= bit; checkedPixels++; }
        const p = pixel * 4;
        if (rgba[p] !== color[0] || rgba[p + 1] !== color[1] || rgba[p + 2] !== color[2] || rgba[p + 3] !== 255) {
          mismatchedPixels++;
          firstMismatch ??= { x, y };
        }
      }
    }
    if (mismatchedPixels) failures.push({ rectIndex, reason: 'pixel-mismatch', mismatchedPixels, firstMismatch });
  });
  return { ok: failures.length === 0, checkedPixels, failures };
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes, from, to) {
  let crc = 0xffffffff;
  for (let i = from; i < to; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pngError(message) { throw new Error(`PNG: ${message}`); }

/** Structural sanitizer, not a PNG decompressor. Decode and validate pixels after this. */
export function sanitizePNG(input) {
  const bytes = input instanceof Uint8Array ? input : input instanceof ArrayBuffer ? new Uint8Array(input)
    : ArrayBuffer.isView(input) ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength) : null;
  if (!bytes || bytes.length < 45 || bytes.length > 128 * 1024 * 1024) pngError('unsupported file size.');
  if (!PNG_SIGNATURE.every((n, i) => bytes[i] === n)) pngError('invalid signature.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const retained = [], removed = [], slices = [bytes.subarray(0, 8)];
  let offset = 8, width, height, bitDepth, colorType;
  let count = 0, paletteEntries = 0, sawTransparency = false, sawData = false, dataEnded = false, dataBytes = 0, sawEnd = false;
  while (offset < bytes.length) {
    if (++count > 10_000) pngError('too many chunks.');
    if (bytes.length - offset < 12) pngError('truncated chunk header.');
    const length = view.getUint32(offset);
    if (length > 0x7fffffff || length > bytes.length - offset - 12) pngError('invalid chunk length.');
    const nameBytes = bytes.subarray(offset + 4, offset + 8);
    if (!nameBytes.every(n => n >= 65 && n <= 90 || n >= 97 && n <= 122) || nameBytes[2] > 90) pngError('invalid chunk type.');
    const type = String.fromCharCode(...nameBytes);
    const end = offset + 12 + length;
    if (crc32(bytes, offset + 4, offset + 8 + length) !== view.getUint32(offset + 8 + length)) pngError('chunk checksum mismatch.');
    if (count === 1 && type !== 'IHDR') pngError('IHDR must be first.');
    if (sawData && type !== 'IDAT') dataEnded = true;
    let keep = false;
    if (type === 'IHDR') {
      if (count !== 1 || length !== 13) pngError('invalid or repeated IHDR.');
      width = view.getUint32(offset + 8); height = view.getUint32(offset + 12);
      try { dimensions(width, height); } catch { pngError('unsupported image dimensions.'); }
      bitDepth = bytes[offset + 16]; colorType = bytes[offset + 17];
      const depths = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] };
      if (!depths[colorType]?.includes(bitDepth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0 || bytes[offset + 20] > 1) pngError('unsupported IHDR values.');
      keep = true;
    } else if (type === 'PLTE') {
      if (sawData || sawTransparency || paletteEntries || !length || length % 3 || length > 768 || [0, 4].includes(colorType)) pngError('invalid palette.');
      paletteEntries = length / 3;
      if (colorType === 3 && paletteEntries > 2 ** bitDepth) pngError('palette exceeds bit depth.');
      keep = true;
    } else if (type === 'tRNS') {
      if (sawData || sawTransparency || [4, 6].includes(colorType) || colorType === 0 && length !== 2 || colorType === 2 && length !== 6 || colorType === 3 && (!paletteEntries || !length || length > paletteEntries)) pngError('invalid transparency chunk.');
      sawTransparency = true; keep = true;
    } else if (type === 'IDAT') {
      if (dataEnded || colorType === 3 && !paletteEntries) pngError('invalid image data order.');
      sawData = true; dataBytes += length; keep = true;
    } else if (type === 'IEND') {
      if (length || !sawData || !dataBytes || end !== bytes.length) pngError('invalid image end or trailing data.');
      sawEnd = true; keep = true;
    } else {
      if (nameBytes[0] < 97) pngError('unrecognized critical chunk.');
      if (['acTL', 'fcTL', 'fdAT'].includes(type)) pngError('animated PNG is outside this exporter scope.');
    }
    if (keep) { retained.push(type); slices.push(bytes.subarray(offset, end)); }
    else removed.push(type);
    offset = end;
    if (sawEnd) break;
  }
  if (!sawEnd) pngError('missing IEND.');
  const output = new Uint8Array(slices.reduce((sum, part) => sum + part.length, 0));
  let position = 0;
  for (const part of slices) { output.set(part, position); position += part.length; }
  return { bytes: output, retained, removed, width, height };
}
