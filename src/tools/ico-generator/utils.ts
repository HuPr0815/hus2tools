export interface IcoSize {
  size: number;
  label: string;
  selected: boolean;
}

export const DEFAULT_ICO_SIZES: IcoSize[] = [
  { size: 16, label: '16×16', selected: true },
  { size: 32, label: '32×32', selected: true },
  { size: 48, label: '48×48', selected: true },
  { size: 64, label: '64×64', selected: false },
  { size: 128, label: '128×128', selected: false },
  { size: 256, label: '256×256', selected: false },
];

export function resizeImage(img: HTMLImageElement, targetSize: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  return canvas.toDataURL('image/png');
}

function resizeImageToBlob(img: HTMLImageElement, targetSize: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetSize, targetSize);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Failed to create blob for size ${targetSize}`));
    }, 'image/png');
  });
}

export async function generateIcoFile(img: HTMLImageElement, sizes: number[]): Promise<Blob> {
  // 1. 为每个尺寸生成 PNG blob
  const pngBlobs: Blob[] = [];
  for (const size of sizes) {
    const blob = await resizeImageToBlob(img, size);
    pngBlobs.push(blob);
  }

  const count = sizes.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + count * entrySize;

  // 2. 计算每个 PNG 数据的偏移量
  const offsets: number[] = [];
  let currentOffset = dataOffset;
  for (const blob of pngBlobs) {
    offsets.push(currentOffset);
    currentOffset += blob.size;
  }

  // 3. 构建 ICO 二进制数据
  const totalSize = currentOffset;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR header (6 bytes)
  view.setUint16(0, 0, true);       // reserved, must be 0
  view.setUint16(2, 1, true);       // type, 1 = ICO
  view.setUint16(4, count, true);   // number of images

  // ICONDIRENTRY array (16 bytes each)
  for (let i = 0; i < count; i++) {
    const entryOffset = headerSize + i * entrySize;
    const w = sizes[i];
    // ICO format: 0 means 256
    view.setUint8(entryOffset + 0, w >= 256 ? 0 : w);   // width
    view.setUint8(entryOffset + 1, w >= 256 ? 0 : w);   // height
    view.setUint8(entryOffset + 2, 0);                   // colorCount (0 = true color)
    view.setUint8(entryOffset + 3, 0);                   // reserved
    view.setUint16(entryOffset + 4, 1, true);            // planes
    view.setUint16(entryOffset + 6, 32, true);           // bitCount (32 = RGBA)
    view.setUint32(entryOffset + 8, pngBlobs[i].size, true); // bytesInRes
    view.setUint32(entryOffset + 12, offsets[i], true);      // imageOffset
  }

  // 4. 写入 PNG 数据
  const byteArray = new Uint8Array(buffer);
  let writeOffset = dataOffset;
  for (const blob of pngBlobs) {
    const chunk = new Uint8Array(await blob.arrayBuffer());
    byteArray.set(chunk, writeOffset);
    writeOffset += chunk.length;
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

export function generateIcoPreview(img: HTMLImageElement, sizes: number[]): { size: number; dataUrl: string }[] {
  return sizes.map((size) => ({
    size,
    dataUrl: resizeImage(img, size),
  }));
}

export function downloadPngSizes(img: HTMLImageElement, sizes: number[], fileName: string) {
  sizes.forEach((size) => {
    const dataUrl = resizeImage(img, size);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}_${size}x${size}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
