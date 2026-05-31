export interface WatermarkOptions {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: 'center' | 'tile' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'top-center' | 'bottom-center' | 'center-left' | 'center-right';
  rotation: number;
}

export function applyWatermark(
  img: HTMLImageElement,
  options: WatermarkOptions
): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  ctx.globalAlpha = options.opacity;
  ctx.fillStyle = options.color;
  ctx.font = `${options.fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (options.position === 'tile') {
    const gap = options.fontSize * 5;
    ctx.save();
    for (let y = -canvas.height; y < canvas.height * 2; y += gap) {
      for (let x = -canvas.width; x < canvas.width * 2; x += gap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((options.rotation * Math.PI) / 180);
        ctx.fillText(options.text, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  } else {
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    if (options.position === 'bottom-right') { x = canvas.width - 100; y = canvas.height - 50; }
    else if (options.position === 'bottom-left') { x = 100; y = canvas.height - 50; }
    else if (options.position === 'top-right') { x = canvas.width - 100; y = 50; }
    else if (options.position === 'top-left') { x = 100; y = 50; }
    else if (options.position === 'top-center') { x = canvas.width / 2; y = 50; }
    else if (options.position === 'bottom-center') { x = canvas.width / 2; y = canvas.height - 50; }
    else if (options.position === 'center-left') { x = 100; y = canvas.height / 2; }
    else if (options.position === 'center-right') { x = canvas.width - 100; y = canvas.height / 2; }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.fillText(options.text, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}

export function downloadWatermarkedImage(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${fileName}_watermarked.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
