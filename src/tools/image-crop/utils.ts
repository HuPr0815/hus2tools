export type ImageFormat = 'svg' | 'png' | 'jpg' | 'gif' | 'webp' | 'bmp' | 'avif' | 'ico' | 'tiff';

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpriteRegion {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExifData {
  Make?: string;
  Model?: string;
  Orientation?: number;
  Software?: string;
  DateTime?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  FocalLength?: number;
}

export interface WebPFrame {
  dataUrl: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UndoState {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

const FORMAT_MAP: Record<string, ImageFormat> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-ms-bmp': 'bmp',
  'image/avif': 'avif',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
  'image/tiff': 'tiff',
  'image/x-tiff': 'tiff',
};

const EXT_MAP: Record<string, ImageFormat> = {
  svg: 'svg',
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpg',
  gif: 'gif',
  webp: 'webp',
  bmp: 'bmp',
  avif: 'avif',
  ico: 'ico',
  tiff: 'tiff',
  tif: 'tiff',
};

const MIME_MAP: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  tiff: 'image/tiff',
};

const EXT_NORMALIZE: Record<string, string> = { jpg: 'jpg', jpeg: 'jpg', tiff: 'tiff' };

export function detectFormat(file: File): ImageFormat | null {
  if (file.type && FORMAT_MAP[file.type]) return FORMAT_MAP[file.type];
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext && EXT_MAP[ext]) return EXT_MAP[ext];
  return null;
}

export function isSvg(fmt: ImageFormat | null): boolean {
  return fmt === 'svg';
}

export function isRaster(fmt: ImageFormat | null): boolean {
  return fmt !== null && fmt !== 'svg';
}

export function getMimeType(fmt: string): string {
  return MIME_MAP[fmt] || 'image/png';
}

export function getExt(fmt: string): string {
  return EXT_NORMALIZE[fmt] || fmt;
}

export function isCanvasSupportedFormat(fmt: string): boolean {
  return fmt === 'png' || fmt === 'jpg' || fmt === 'webp';
}

export function r(val: number): number {
  return Math.round(val * 100) / 100;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function parseViewBox(text: string): ViewBox | null {
  const match = text.match(/viewBox\s*=\s*"([^"]*)"/);
  if (match) {
    const parts = match[1].trim().split(/[\s,]+/);
    if (parts.length >= 4) {
      return {
        x: parseFloat(parts[0]),
        y: parseFloat(parts[1]),
        w: parseFloat(parts[2]),
        h: parseFloat(parts[3]),
      };
    }
  }
  return null;
}

export function pixelToViewBox(
  px: number,
  py: number,
  pw: number,
  ph: number,
  vb: ViewBox,
  naturalW: number,
  naturalH: number
): ViewBox {
  const scaleX = vb.w / naturalW;
  const scaleY = vb.h / naturalH;
  return { x: vb.x + px * scaleX, y: vb.y + py * scaleY, w: pw * scaleX, h: ph * scaleY };
}

export function viewBoxToPixel(
  vx: number,
  vy: number,
  vw: number,
  vh: number,
  vb: ViewBox,
  naturalW: number,
  naturalH: number
): { x: number; y: number; w: number; h: number } {
  const scaleX = naturalW / vb.w;
  const scaleY = naturalH / vb.h;
  return { x: (vx - vb.x) * scaleX, y: (vy - vb.y) * scaleY, w: vw * scaleX, h: vh * scaleY };
}

export function buildCroppedSvg(text: string, x: number, y: number, w: number, h: number): string {
  const gtPos = text.indexOf('>');
  if (gtPos === -1) return text;
  let openTag = text.substring(0, gtPos);
  const rest = text.substring(gtPos);
  openTag = openTag.replace(/\s+viewBox\s*=\s*"[^"]*"/i, '');
  openTag = openTag.replace(/\s+width\s*=\s*"[^"]*"/i, '');
  openTag = openTag.replace(/\s+height\s*=\s*"[^"]*"/i, '');
  openTag += ` viewBox="${r(x)} ${r(y)} ${r(w)} ${r(h)}"`;
  openTag += ` width="${r(w)}"`;
  openTag += ` height="${r(h)}"`;
  return openTag + rest;
}

export function downloadCroppedSvg(
  svgText: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fileName: string
) {
  const newSvg = buildCroppedSvg(svgText, x, y, w, h);
  const blob = new Blob([newSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}_crop_${r(x)}_${r(y)}_${r(w)}_${r(h)}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCroppedRaster(
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  outputFmt: string,
  sourceFmt: ImageFormat,
  quality: number,
  rasterDataUrl: string,
  vb: ViewBox,
  fileName: string
) {
  if (outputFmt === 'svg') {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${r(w)}" height="${r(h)}" viewBox="0 0 ${r(w)} ${r(h)}">`;
    const svg = svgContent + `<image href="${rasterDataUrl}" x="${r(-x)}" y="${r(-y)}" width="${r(vb.w)}" height="${r(vb.h)}"/></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_crop.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  let targetFmt: string = outputFmt === 'same' ? sourceFmt : outputFmt;
  if (targetFmt === 'jpeg') targetFmt = 'jpg';
  if (!isCanvasSupportedFormat(targetFmt)) targetFmt = 'png';
  const mimeType = getMimeType(targetFmt);
  const q = targetFmt === 'jpg' || targetFmt === 'webp' ? quality : undefined;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  const ctx = canvas.getContext('2d')!;

  if (targetFmt === 'jpg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, x, y, w, h, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_crop_${r(x)}_${r(y)}_${r(w)}_${r(h)}.${getExt(targetFmt)}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    mimeType,
    q
  );
}

export function parseExif(data: Uint8Array): ExifData | null {
  try {
    if (data[0] !== 0xff || data[1] !== 0xd8) return null;
    let offset = 2;
    while (offset < data.length - 1) {
      if (data[offset] !== 0xff) break;
      const marker = data[offset + 1];
      if (marker === 0xe1) {
        return parseExifAPP1(data, offset + 4);
      }
      const len = (data[offset + 2] << 8) | data[offset + 3];
      offset += 2 + len;
    }
  } catch {
    // ignore
  }
  return null;
}

function parseExifAPP1(data: Uint8Array, offset: number): ExifData | null {
  if (data[offset] !== 0x45 || data[offset + 1] !== 0x78 || data[offset + 2] !== 0x69 || data[offset + 3] !== 0x66)
    return null;
  offset += 6;
  const byteOrder = (data[offset] << 8) | data[offset + 1];
  const le = byteOrder === 0x4949;
  offset += 2;
  offset += 2;
  const ifdOffset = getU32(data, offset, le);
  offset += 4;
  return parseIFD(data, offset + ifdOffset - 8, le, offset - 8);
}

const TAG_MAP: Record<number, keyof ExifData> = {
  0x010f: 'Make',
  0x0110: 'Model',
  0x0112: 'Orientation',
  0x0131: 'Software',
  0x0132: 'DateTime',
  0x829a: 'ExposureTime',
  0x829d: 'FNumber',
  0x8827: 'ISO',
  0x920a: 'FocalLength',
};

function parseIFD(data: Uint8Array, offset: number, le: boolean, base: number): ExifData {
  const result: ExifData = {};
  const count = getU16(data, offset, le);
  offset += 2;
  for (let i = 0; i < count; i++) {
    const tag = getU16(data, offset, le);
    const type = getU16(data, offset + 2, le);
    const cnt = getU32(data, offset + 4, le);
    const valOffset = offset + 8;
    const name = TAG_MAP[tag];
    if (name) {
      const val = readTagValue(data, valOffset, type, cnt, le, base);
      if (val !== null) (result as Record<string, unknown>)[name] = val;
    }
    offset += 12;
  }
  return result;
}

function readTagValue(data: Uint8Array, offset: number, type: number, count: number, le: boolean, base: number): number | string | null {
  if (type === 2) {
    const strOff = count > 4 ? getU32(data, offset, le) + base : offset;
    let s = '';
    for (let i = 0; i < count - 1 && strOff + i < data.length; i++) {
      s += String.fromCharCode(data[strOff + i]);
    }
    return s;
  }
  if (type === 3) {
    return count === 1 ? getU16(data, offset, le) : getU16(data, getU32(data, offset, le) + base, le);
  }
  if (type === 4) {
    return count === 1 ? getU32(data, offset, le) : getU32(data, getU32(data, offset, le) + base, le);
  }
  if (type === 5) {
    const off = count === 1 ? offset : getU32(data, offset, le) + base;
    const num = getU32(data, off, le);
    const den = getU32(data, off + 4, le);
    return den > 0 ? num / den : 0;
  }
  return null;
}

function getU16(data: Uint8Array, off: number, le: boolean): number {
  return le ? data[off] | (data[off + 1] << 8) : (data[off] << 8) | data[off + 1];
}

function getU32(data: Uint8Array, off: number, le: boolean): number {
  return le
    ? data[off] | (data[off + 1] << 8) | (data[off + 2] << 16) | (data[off + 3] << 24)
    : (data[off] << 24) | (data[off + 1] << 16) | (data[off + 2] << 8) | data[off + 3];
}

export async function readExifData(file: File, imgEl: HTMLImageElement | null): Promise<{ label: string; value: string }[]> {
  const fields: { label: string; value: string }[] = [];
  fields.push({ label: '文件名', value: file.name });
  fields.push({ label: '大小', value: formatBytes(file.size) });
  fields.push({ label: '类型', value: file.type || '未知' });
  fields.push({ label: '修改时间', value: file.lastModified ? new Date(file.lastModified).toLocaleString() : '-' });

  if (imgEl) {
    fields.push({ label: '宽度', value: imgEl.naturalWidth + 'px' });
    fields.push({ label: '高度', value: imgEl.naturalHeight + 'px' });
    const mp = (imgEl.naturalWidth * imgEl.naturalHeight / 1000000).toFixed(2);
    fields.push({ label: '像素', value: mp + 'MP' });
  }

  if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
    const buffer = await file.slice(0, 65536).arrayBuffer();
    const data = new Uint8Array(buffer);
    const exif = parseExif(data);
    if (exif) {
      if (exif.Make) fields.push({ label: '相机', value: `${exif.Make || ''} ${exif.Model || ''}` });
      if (exif.DateTime) fields.push({ label: '拍摄时间', value: exif.DateTime });
      if (exif.ExposureTime) fields.push({ label: '快门', value: `1/${Math.round(1 / exif.ExposureTime)}s` });
      if (exif.FNumber) fields.push({ label: '光圈', value: `f/${exif.FNumber.toFixed(1)}` });
      if (exif.ISO) fields.push({ label: 'ISO', value: String(exif.ISO) });
      if (exif.FocalLength) fields.push({ label: '焦距', value: `${exif.FocalLength}mm` });
      if (exif.Software) fields.push({ label: '软件', value: exif.Software });
      if (exif.Orientation) fields.push({ label: '方向', value: String(exif.Orientation) });
    }
  }

  return fields;
}

export function checkWebPAnimated(data: Uint8Array): boolean {
  if (data.length < 20) return false;
  if (data[0] !== 0x52 || data[1] !== 0x49 || data[2] !== 0x46 || data[3] !== 0x49) return false;
  if (data[8] !== 0x57 || data[9] !== 0x45 || data[10] !== 0x42 || data[11] !== 0x50) return false;
  let offset = 12;
  while (offset < data.length - 8) {
    const chunkId = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
    const chunkSize = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
    if (chunkId === 'ANIM') return true;
    offset += 8 + chunkSize + (chunkSize % 2);
    if (chunkSize === 0) break;
  }
  return false;
}

function collectANMFChunks(data: Uint8Array): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  let offset = 12;
  while (offset < data.length - 8) {
    const chunkId = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
    const chunkSize = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
    if (chunkId === 'ANMF') {
      chunks.push(data.slice(offset + 8, offset + 8 + chunkSize));
    }
    offset += 8 + chunkSize + (chunkSize % 2);
    if (chunkSize === 0) break;
  }
  return chunks;
}

function parseVP8Dims(vp8: Uint8Array): { w: number; h: number } | null {
  try {
    if (vp8.length < 10) return null;
    if (vp8[3] !== 0x9d || vp8[4] !== 0x01 || vp8[5] !== 0x2a) return null;
    const w = vp8[6] | ((vp8[7] & 0x3f) << 8);
    const h = (vp8[7] >> 6) | (vp8[8] << 2) | ((vp8[9] & 0x3f) << 10);
    return { w, h };
  } catch {
    return null;
  }
}

function parseVP8LDims(vp8l: Uint8Array): { w: number; h: number } | null {
  try {
    if (vp8l.length < 5) return null;
    if (vp8l[0] !== 0x2f) return null;
    const b = vp8l[1] | (vp8l[2] << 8) | (vp8l[3] << 16) | (vp8l[4] << 24);
    const w = (b & 0x3fff) + 1;
    const h = ((b >> 14) & 0x3fff) + 1;
    return { w, h };
  } catch {
    return null;
  }
}

function renderANMFFrame(frameData: Uint8Array, _canvasW: number, _canvasH: number): Promise<WebPFrame | null> {
  return new Promise((resolve) => {
    try {
      const fx = (frameData[0] | (frameData[1] << 8) | (frameData[2] << 16)) & 0xffffff;
      const fy = (frameData[3] | (frameData[4] << 8) | (frameData[5] << 16)) & 0xffffff;
      const fw = ((frameData[6] | (frameData[7] << 8) | (frameData[8] << 16)) & 0xffffff) + 1;
      const fh = ((frameData[9] | (frameData[10] << 8) | (frameData[11] << 16)) & 0xffffff) + 1;

      const subOffset = 16;
      let subChunkId = '';
      if (subOffset + 8 <= frameData.length) {
        subChunkId = String.fromCharCode(frameData[subOffset], frameData[subOffset + 1], frameData[subOffset + 2], frameData[subOffset + 3]);
      }

      let frameBlob: Blob;
      if (subChunkId === 'VP8 ' || subChunkId === 'VP8L') {
        const subSize = frameData[subOffset + 4] | (frameData[subOffset + 5] << 8) | (frameData[subOffset + 6] << 16) | (frameData[subOffset + 7] << 24);
        const paddedSize = subSize + (subSize % 2);
        const riffBuf = new Uint8Array(12 + 8 + paddedSize);
        riffBuf[0] = 0x52; riffBuf[1] = 0x49; riffBuf[2] = 0x46; riffBuf[3] = 0x46;
        const totalSize = 8 + paddedSize;
        riffBuf[4] = totalSize & 0xff; riffBuf[5] = (totalSize >> 8) & 0xff; riffBuf[6] = (totalSize >> 16) & 0xff; riffBuf[7] = (totalSize >> 24) & 0xff;
        riffBuf[8] = 0x57; riffBuf[9] = 0x45; riffBuf[10] = 0x42; riffBuf[11] = 0x50;
        for (let i = 0; i < 8; i++) riffBuf[12 + i] = frameData[subOffset + i];
        const pixelStart = subOffset + 8;
        for (let i = 0; i < subSize; i++) riffBuf[20 + i] = frameData[pixelStart + i];
        frameBlob = new Blob([riffBuf], { type: 'image/webp' });
      } else {
        frameBlob = new Blob([new Uint8Array(frameData)], { type: 'image/webp' });
      }

      const url = URL.createObjectURL(frameBlob);
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = fw;
        c.height = fh;
        const ctx = c.getContext('2d')!;
        ctx.drawImage(img, 0, 0, fw, fh);
        resolve({ dataUrl: c.toDataURL('image/png'), x: fx, y: fy, w: fw, h: fh });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

export async function extractWebPFrames(file: File): Promise<WebPFrame[]> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  if (!checkWebPAnimated(data)) return [];

  const anmfChunks = collectANMFChunks(data);
  if (anmfChunks.length === 0) return [];

  let canvasW = 0,
    canvasH = 0;
  let offset = 12;
  while (offset < data.length - 8) {
    const cid = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
    const csz = data[offset + 4] | (data[offset + 5] << 8) | (data[offset + 6] << 16) | (data[offset + 7] << 24);
    if (cid === 'VP8 ') {
      const d = parseVP8Dims(data.slice(offset + 8, offset + 8 + csz));
      if (d) {
        canvasW = d.w;
        canvasH = d.h;
      }
    }
    if (cid === 'VP8L') {
      const d2 = parseVP8LDims(data.slice(offset + 8, offset + 8 + csz));
      if (d2) {
        canvasW = d2.w;
        canvasH = d2.h;
      }
    }
    offset += 8 + csz + (csz % 2);
    if (csz === 0) break;
  }

  const results = await Promise.all(anmfChunks.map((chunk) => renderANMFFrame(chunk, canvasW, canvasH)));
  return results.filter((f): f is WebPFrame => f !== null);
}

export function detectByTransparentGaps(
  w: number,
  h: number,
  rowTransparent: Uint8Array,
  colTransparent: Uint8Array
): { x: number; y: number; w: number; h: number }[] {
  const rowRanges: { start: number; end: number }[] = [];
  let inRange = false;
  let rangeStart = 0;
  for (let y = 0; y < h; y++) {
    if (!rowTransparent[y] && !inRange) {
      inRange = true;
      rangeStart = y;
    } else if (rowTransparent[y] && inRange) {
      inRange = false;
      rowRanges.push({ start: rangeStart, end: y - 1 });
    }
  }
  if (inRange) rowRanges.push({ start: rangeStart, end: h - 1 });

  const colRanges: { start: number; end: number }[] = [];
  inRange = false;
  for (let x = 0; x < w; x++) {
    if (!colTransparent[x] && !inRange) {
      inRange = true;
      rangeStart = x;
    } else if (colTransparent[x] && inRange) {
      inRange = false;
      colRanges.push({ start: rangeStart, end: x - 1 });
    }
  }
  if (inRange) colRanges.push({ start: rangeStart, end: w - 1 });

  const regions: { x: number; y: number; w: number; h: number }[] = [];
  for (const ry of rowRanges) {
    for (const cx of colRanges) {
      const rw = cx.end - cx.start + 1;
      const rh = ry.end - ry.start + 1;
      if (rw >= 2 && rh >= 2) {
        regions.push({ x: cx.start, y: ry.start, w: rw, h: rh });
      }
    }
  }
  return regions;
}

function getMostCommonEdgeColor(
  w: number,
  h: number,
  pixels: Uint8ClampedArray
): { r: number; g: number; b: number; a: number } | null {
  const colorMap: Record<string, number> = {};
  const quantize = 32;

  function addEdgePixel(x: number, y: number) {
    const idx = (y * w + x) * 4;
    const rv = Math.floor(pixels[idx] / quantize) * quantize;
    const g = Math.floor(pixels[idx + 1] / quantize) * quantize;
    const b = Math.floor(pixels[idx + 2] / quantize) * quantize;
    const a = Math.floor(pixels[idx + 3] / quantize) * quantize;
    const key = `${rv},${g},${b},${a}`;
    colorMap[key] = (colorMap[key] || 0) + 1;
  }

  for (let x = 0; x < w; x++) {
    addEdgePixel(x, 0);
    addEdgePixel(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    addEdgePixel(0, y);
    addEdgePixel(w - 1, y);
  }

  let maxCount = 0;
  let maxKey: string | null = null;
  const totalEdge = 2 * (w + h) - 4;
  for (const key in colorMap) {
    if (colorMap[key] > maxCount) {
      maxCount = colorMap[key];
      maxKey = key;
    }
  }

  if (!maxKey || maxCount < totalEdge * 0.3) return null;

  const parts = maxKey.split(',');
  return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]), a: parseInt(parts[3]) };
}

function detectByColorClustering(
  w: number,
  h: number,
  pixels: Uint8ClampedArray,
  _maxRegions: number
): { x: number; y: number; w: number; h: number }[] {
  const step = Math.max(2, Math.floor(Math.sqrt((w * h) / 10000)));
  const bgColor = getMostCommonEdgeColor(w, h, pixels);
  if (!bgColor) return [];

  const threshold = 50;
  const visited = new Uint8Array(w * h);
  const regions: { x: number; y: number; w: number; h: number }[] = [];

  function isBg(px: number, py: number): boolean {
    const idx = (py * w + px) * 4;
    if (!bgColor) return false;
    const dr = Math.abs(pixels[idx] - bgColor.r);
    const dg = Math.abs(pixels[idx + 1] - bgColor.g);
    const db = Math.abs(pixels[idx + 2] - bgColor.b);
    const da = Math.abs(pixels[idx + 3] - bgColor.a);
    return dr < threshold && dg < threshold && db < threshold && da < threshold;
  }

  function scanFill(startX: number, startY: number): { x: number; y: number; w: number; h: number } | null {
    let minX = startX,
      maxX = startX,
      minY = startY,
      maxY = startY;
    const stack: number[] = [startX, startY];
    let pixelCount = 0;

    while (stack.length > 0) {
      const cy = stack.pop()!;
      const cx = stack.pop()!;

      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      const pos = cy * w + cx;
      if (visited[pos]) continue;
      if (isBg(cx, cy)) continue;

      visited[pos] = 1;
      pixelCount++;

      if (cx < minX) minX = cx;
      if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy;
      if (cy > maxY) maxY = cy;

      if (pixelCount < 500000) {
        stack.push(cx + 1, cy);
        stack.push(cx - 1, cy);
        stack.push(cx, cy + 1);
        stack.push(cx, cy - 1);
      }
    }

    if (pixelCount > 8) {
      return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    }
    return null;
  }

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const pos = y * w + x;
      if (!visited[pos] && !isBg(x, y)) {
        const region = scanFill(x, y);
        if (region) regions.push(region);
      }
    }
  }

  let merged = true;
  let mergePasses = 0;
  while (merged && mergePasses < 5) {
    merged = false;
    mergePasses++;
    for (let i = 0; i < regions.length; i++) {
      if (!regions[i]) continue;
      for (let j = i + 1; j < regions.length; j++) {
        if (!regions[j]) continue;
        const a = regions[i],
          b = regions[j];
        const gap = 3;
        const overlapX = a.x - gap < b.x + b.w && a.x + a.w + gap > b.x;
        const overlapY = a.y - gap < b.y + b.h && a.y + a.h + gap > b.y;
        if (overlapX && overlapY) {
          const nx = Math.min(a.x, b.x);
          const ny = Math.min(a.y, b.y);
          const nw = Math.max(a.x + a.w, b.x + b.w) - nx;
          const nh = Math.max(a.y + a.h, b.y + b.h) - ny;
          regions[i] = { x: nx, y: ny, w: nw, h: nh };
          regions[j] = null!;
          merged = true;
        }
      }
    }
    for (let i = regions.length - 1; i >= 0; i--) {
      if (!regions[i]) regions.splice(i, 1);
    }
  }

  return regions;
}

function detectByEdgeScan(
  w: number,
  h: number,
  pixels: Uint8ClampedArray,
  alphaThreshold: number,
  maxRegions: number
): { x: number; y: number; w: number; h: number }[] {
  const cols = Math.ceil(Math.sqrt(maxRegions));
  const rows = Math.ceil(maxRegions / cols);
  const cellW = Math.floor(w / cols);
  const cellH = Math.floor(h / rows);
  const regions: { x: number; y: number; w: number; h: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (regions.length >= maxRegions) break;
      const sx = col * cellW;
      const sy = row * cellH;
      const ex = col === cols - 1 ? w : (col + 1) * cellW;
      const ey = row === rows - 1 ? h : (row + 1) * cellH;

      let minX = ex,
        minY = ey,
        maxX = sx,
        maxY = sy;
      let hasContent = false;

      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          if (pixels[(y * w + x) * 4 + 3] >= alphaThreshold) {
            hasContent = true;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (hasContent) {
        regions.push({ x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 });
      }
    }
  }

  return regions;
}

export async function detectByPixelGap(
  img: HTMLImageElement,
  maxRegions: number,
  onProgress: (text: string, pct: number) => void
): Promise<SpriteRegion[]> {
  onProgress('正在扫描像素...', 5);

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const scanCanvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  scanCanvas.width = w;
  scanCanvas.height = h;
  const scanCtx = scanCanvas.getContext('2d')!;
  scanCtx.drawImage(img, 0, 0);
  const imageData = scanCtx.getImageData(0, 0, w, h);
  const pixels = imageData.data;
  const alphaThreshold = 30;

  onProgress('正在扫描透明间隙...', 15);

  const rowTransparent = new Uint8Array(h);
  const colTransparent = new Uint8Array(w);

  for (let y = 0; y < h; y++) {
    let allAlpha = true;
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] >= alphaThreshold) {
        allAlpha = false;
        break;
      }
    }
    rowTransparent[y] = allAlpha ? 1 : 0;
  }

  for (let x = 0; x < w; x++) {
    let allAlpha = true;
    for (let y = 0; y < h; y++) {
      if (pixels[(y * w + x) * 4 + 3] >= alphaThreshold) {
        allAlpha = false;
        break;
      }
    }
    colTransparent[x] = allAlpha ? 1 : 0;
  }

  let hasTransparentRows = false;
  let hasTransparentCols = false;
  for (let y = 0; y < h; y++) {
    if (rowTransparent[y]) {
      hasTransparentRows = true;
      break;
    }
  }
  for (let x = 0; x < w; x++) {
    if (colTransparent[x]) {
      hasTransparentCols = true;
      break;
    }
  }

  let regions: { x: number; y: number; w: number; h: number }[] = [];

  if (hasTransparentRows || hasTransparentCols) {
    onProgress('透明间隙检测中...', 30);
    regions = detectByTransparentGaps(w, h, rowTransparent, colTransparent);
  }

  if (regions.length === 0) {
    onProgress('尝试颜色聚类检测...', 40);
    regions = detectByColorClustering(w, h, pixels, maxRegions);
  }

  if (regions.length === 0) {
    onProgress('尝试边缘检测...', 50);
    regions = detectByEdgeScan(w, h, pixels, alphaThreshold, maxRegions);
  }

  onProgress('正在整理区域...', 80);

  if (regions.length > maxRegions) {
    regions.sort((a, b) => b.w * b.h - a.w * a.h);
    regions = regions.slice(0, maxRegions);
  }

  regions.sort((a, b) => {
    if (a.y < b.y - 5) return -1;
    if (a.y > b.y + 5) return 1;
    return a.x - b.x;
  });

  onProgress('完成！', 100);

  return regions.map((reg, i) => ({
    name: `sprite_${String(i + 1).padStart(2, '0')}`,
    x: reg.x,
    y: reg.y,
    w: reg.w,
    h: reg.h,
  }));
}

export function detectSpriteRegions(
  count: number,
  layout: string,
  svgText: string | null,
  format: ImageFormat | null
): SpriteRegion[] {
  if (isSvg(format) && svgText && layout === 'dom') {
    return detectSvgSpriteRegions(svgText, count);
  }

  if (layout === 'horizontal' || layout === 'vertical' || layout === 'grid') {
    return generateGridRegions(count, layout);
  }

  return [];
}

function detectSvgSpriteRegions(svgText: string, count: number): SpriteRegion[] {
  const regions: SpriteRegion[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const elements = doc.querySelectorAll('svg > g, svg > path, svg > rect, svg > circle, svg > ellipse, svg > line, svg > polyline, svg > polygon, svg > text, svg > image');

  elements.forEach((el, i) => {
    if (i >= count) return;
    const svgEl = el as HTMLElement & { getBBox?: () => DOMRect };
    const bbox = svgEl.getBBox?.();
    if (bbox && bbox.width > 0 && bbox.height > 0) {
      regions.push({
        name: el.id || `sprite_${String(i + 1).padStart(2, '0')}`,
        x: r(bbox.x),
        y: r(bbox.y),
        w: r(bbox.width),
        h: r(bbox.height),
      });
    }
  });

  return regions;
}

function generateGridRegions(count: number, layout: string): SpriteRegion[] {
  const regions: SpriteRegion[] = [];
  const cols = layout === 'vertical' ? 1 : Math.ceil(Math.sqrt(count));

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    regions.push({
      name: `sprite_${String(i + 1).padStart(2, '0')}`,
      x: col * 100,
      y: row * 100,
      w: 100,
      h: 100,
    });
  }

  return regions;
}

export function generateSpriteCss(regions: SpriteRegion[], fileName: string): string {
  return regions
    .map(
      (reg) =>
        `.${reg.name} {\n  width: ${r(reg.w)}px;\n  height: ${r(reg.h)}px;\n  background: url('${fileName}') no-repeat -${r(reg.x)}px -${r(reg.y)}px;\n}`
    )
    .join('\n\n');
}

export function compressRaster(
  img: HTMLImageElement,
  targetFmt: string,
  quality: number,
  maxSizeKB: number,
  maxWidth: number,
  maxHeight: number,
  onProgress: (text: string, pct: number) => void
): Promise<{ blob: Blob; fmt: string } | null> {
  return new Promise((resolve) => {
    let w = img.naturalWidth;
    let h = img.naturalHeight;

    if (maxWidth > 0 && w > maxWidth) {
      h = Math.round((h * maxWidth) / w);
      w = maxWidth;
    }
    if (maxHeight > 0 && h > maxHeight) {
      w = Math.round((w * maxHeight) / h);
      h = maxHeight;
    }
    w = Math.max(1, w);
    h = Math.max(1, h);

    const resolvedFmt = targetFmt === 'jpeg' ? 'jpg' : targetFmt;
    const mimeType = getMimeType(resolvedFmt);
    const needsQuality = resolvedFmt === 'jpg' || resolvedFmt === 'webp';

    function doCompress(q: number): Promise<Blob | null> {
      return new Promise((resolve2) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        if (resolvedFmt === 'jpg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => resolve2(blob),
          mimeType,
          needsQuality ? q : undefined
        );
      });
    }

    if (maxSizeKB > 0 && (resolvedFmt === 'jpg' || resolvedFmt === 'webp')) {
      const maxSizeBytes = maxSizeKB * 1024;
      let lo = 0.01;
      let hi = 1.0;
      let bestBlob: Blob | null = null;
      let iterations = 0;
      const maxIter = 12;

      (function iterate() {
        if (lo > hi || iterations >= maxIter) {
          resolve(bestBlob ? { blob: bestBlob, fmt: resolvedFmt } : null);
          return;
        }
        const mid = (lo + hi) / 2;
        iterations++;
        onProgress(`二分搜索最佳质量... (${iterations}/${maxIter})`, 10 + (iterations / maxIter) * 70);

        doCompress(mid).then((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          bestBlob = blob;
          if (blob.size <= maxSizeBytes) {
            lo = mid + 0.01;
          } else {
            hi = mid - 0.01;
          }
          setTimeout(iterate, 10);
        });
      })();
    } else {
      doCompress(quality).then((blob) => {
        resolve(blob ? { blob, fmt: resolvedFmt } : null);
      });
    }
  });
}

export function multiFormatExport(
  img: HTMLImageElement,
  quality: number,
  maxWidth: number,
  maxHeight: number,
  onProgress: (text: string, pct: number) => void,
  fileName: string
): Promise<void> {
  return new Promise((resolve) => {
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (maxWidth > 0 && w > maxWidth) {
      h = Math.round((h * maxWidth) / w);
      w = maxWidth;
    }
    if (maxHeight > 0 && h > maxHeight) {
      w = Math.round((w * maxHeight) / h);
      h = maxHeight;
    }
    w = Math.max(1, w);
    h = Math.max(1, h);

    const formats = [
      { fmt: 'webp', label: 'WebP', mimeType: 'image/webp' },
      { fmt: 'jpg', label: 'JPEG', mimeType: 'image/jpeg' },
      { fmt: 'png', label: 'PNG', mimeType: 'image/png' },
    ];

    let idx = 0;

    (function nextFormat() {
      if (idx >= formats.length) {
        resolve();
        return;
      }

      const f = formats[idx];
      idx++;
      onProgress(`导出 ${f.label}...`, (idx / formats.length) * 80);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      if (f.fmt === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      const needsQuality = f.fmt === 'jpg' || f.fmt === 'webp';
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.${f.fmt}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          setTimeout(nextFormat, 200);
        },
        f.mimeType,
        needsQuality ? quality : undefined
      );
    })();
  });
}

export type ConvertFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'ico';

export interface ConvertResult {
  name: string;
  format: ConvertFormat;
  dataUrl: string;
  size: number;
  originalSize: number;
}

const CONVERT_MIME_MAP: Record<ConvertFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
};

export function convertImage(
  img: HTMLImageElement,
  format: ConvertFormat,
  quality: number,
  fileName: string
): ConvertResult {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  if (format === 'jpeg' || format === 'bmp') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = CONVERT_MIME_MAP[format] || 'image/png';
  const q = format === 'jpeg' || format === 'webp' ? quality : undefined;
  const dataUrl = canvas.toDataURL(mimeType, q);

  const base64 = dataUrl.split(',')[1];
  const byteLength = Math.round((base64.length * 3) / 4);

  return {
    name: `${fileName}.${format}`,
    format,
    dataUrl,
    size: byteLength,
    originalSize: 0,
  };
}

export function downloadConvertResult(result: ConvertResult) {
  const link = document.createElement('a');
  link.href = result.dataUrl;
  link.download = result.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
