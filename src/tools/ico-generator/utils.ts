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
